# Audit

`backend/packages/Audit`, namespace `MoodKit\Audit\`. An append-only audit trail per workspace: who did
what to which resource, and how it looked before and after. It has no routes, commands or settings; other
packages write and read it through two contracts.

## Writing an entry

```php
use MoodKit\Audit\Contracts\AuditLog;

public function __construct(private AuditLog $audit) {}

$this->audit->record('invoices.invoice.sent', 'Invoice', $invoice->id, $before, $after);
```

`record(string $action, string $resourceType, string $resourceId, ?array $before = null, ?array $after = null, ?string $branchId = null, bool $withOrigin = true)`:

| Argument | Meaning |
| -------- | ------- |
| `$action` | a dotted, stable name, such as `rbac.role.updated` |
| `$resourceType` | the kind of thing it happened to, such as `Role` |
| `$resourceId` | its id |
| `$before` | how it was; `null` for a creation |
| `$after` | how it is; `null` for a deletion |
| `$branchId` | the branch the resource belongs to (an appointment's, or the branch itself); `null` for a resource of the whole workspace |
| `$withOrigin` | `false` stores no IP address or browser (below); `true` by default |

It needs a current workspace (a request, a job, or `RunAsTenant`). It takes the actor from the signed-in
user and the IP address and browser from the request, so the caller passes none of them.

An entry can never be changed or deleted, so it must not keep the address and browser of someone whose data may have to be
erased. Pass `withOrigin: false` for an entry written in the request of someone who is not a member: a client in Clients'
portal (`ClientTrail` does it for what a client does there, see [Privacy](clients.md#privacy)). The entry then has `ip`
and `user_agent` `null`, and keeps the rest. A member's entries keep theirs.

When a super admin of the platform entered the workspace as someone (Auth's impersonation), every entry also names the
admin in `impersonator_user_id`, next to the person in `actor_user_id`. It comes from `Support\Context\Impersonation`,
which Auth sets for the requests of that session and which lives in Laravel's Context, so a job queued during one of them
writes it too. Otherwise it is `null`. Like the actor, it has no foreign key: an entry outlives the account.

`$branchId` is always the branch of the resource, which the caller knows: never the branch the person works at in the top
bar (Tenancy's `CurrentBranch`). What someone working at "All branches" does to an appointment of Centro is Centro's. It is
stored in lower case, in the `branch_id` column, with no foreign key: Audit depends on no package with branches, and an
entry outlives its branch.

Write the entry inside the same transaction as the change, as Rbac does, so a change that rolls back leaves
no entry.

## Secrets are redacted

Before it stores `$before` and `$after`, the logger replaces the value of any key that names a secret with
`"[redacted]"`, at any depth. A key names a secret when it:

- is, or has as one of its words, a name in Support's `SecretFields`: the names that are never anything but a
  credential (`SecretFields::COMMON`: `password`, `passwd`, `passphrase`, `pass`, `pwd`, `secret`, `token`, `apikey`,
  `otp`, `pin`, `cvv`, `dsn`, `cookie`, `cookies`) and every field a package registers (`verification`, `claim`,
  `captchaToken`, `code`...);
- contains `password`, `passwd`, `secret`, `token`, `authorization` or `credential` anywhere;
- ends in the word `key` or `keys` (`api_key`, `apiKey`, `signing-keys`);
- has `privatekey` anywhere once its separators are dropped (`private_key`, `privateKeyPem`,
  `old_private_key_id`).

Words are split on separators and capitals, so `userPass` is redacted while `monkey` and `bypass` are not.
A caller does not need to clean its data first. Never put a plain password, token or code in an entry on
purpose all the same.

## Reading entries

```php
use MoodKit\Audit\Contracts\AuditTrail;

$entries = $trail->forResource('Role', $roleId, ['rbac.role.updated', 'rbac.role.created'], 20);
```

`forResource(string $resourceType, string $resourceId, array $actions, int $limit)` returns the newest
entries of one resource of the current workspace whose action is in `$actions`, newest first, as
`MoodKit\Audit\Contracts\AuditEntry` objects (`id`, `action`, `resourceType`, `resourceId`, `actorUserId`,
`before`, `after`, `createdAt`, `impersonatorUserId`, `branchId`). It never returns platform-wide entries.

```php
$entries = $trail->forBranch($branchId, ['booking.appointment.created', 'booking.appointment.moved'], 20);
```

`forBranch(string $branchId, array $actions, int $limit)` returns the newest entries of any resource that belongs to a
branch (as whoever recorded them said), with the same shape and order; none for an id that is not a uuid. It does not check
whether the person may see that branch: ask Tenancy's `BranchAccess::allows()` first, and answer a branch they may not see as
one that is not there.

## Storage and guarantees

- The `audit_logs` table has a nullable `tenant_id` and RLS with `allowGlobalRows`: a workspace sees its
  own entries, and rows with no `tenant_id` are platform-wide, readable by every workspace and writable only
  by a role that bypasses RLS.
- `branch_id` (nullable uuid) has an index on `(tenant_id, branch_id, created_at)`, for `forBranch()`.
- Entries are written once. A trigger refuses every `UPDATE`, and every `DELETE` that does not come from a
  foreign key cascade, so deleting a workspace still takes its entries with it. A statement-level trigger
  refuses every `TRUNCATE` that reaches the table, `TRUNCATE tenants CASCADE` included. Only the table's
  owner can drop the triggers, which takes a migration.

## Who writes what today

| Action | Written by |
| ------ | ---------- |
| `rbac.role.created`, `rbac.role.updated`, `rbac.role.deleted` | Rbac, with the role's full state before and after |
| `rbac.user_role.assigned` | Rbac, with the role id before and after |
| `signup.workspace.provisioned` | Signup, when it creates a workspace |

There is no audit log screen or route yet, and no permission for one: the permission comes with the screen.
The role history in the roles editor reads the role's own entries through `AuditTrail`.
