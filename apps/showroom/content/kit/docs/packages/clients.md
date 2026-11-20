# Clients

A workspace's clients: the people it serves. Each has a name, contact details, an address, a birthday, a language,
notes, a home branch, their marketing consent, the fields modules declare, and tags; and a portal where they sign in to
see and change their own details. Clients depends on Auth, Rbac, Plans, Notifications, Settings and Audit through their
contracts, on Support and Tenancy directly, and on [Branches](branches.md):
a client's home branch is a key to the `branches` table, so Clients needs Branches installed. Nothing in the kernel
depends on Clients; modules do, through its `Contracts\` and `Events\`.

## Permissions and the menu

| Permission | Lets a member | Requires |
| ---------- | ------------- | -------- |
| `clients.view` | see the list of clients and each client's page | |
| `clients.manage` | add, edit, tag, delete, restore and merge clients | `clients.view` |
| `clients.import` | bring clients in from a CSV file | `clients.manage` |
| `clients.export` | download the list of clients as a CSV file | `clients.view` |
| `clients.privacy` | download everything kept about a client, and erase a client for good | `clients.manage` |

The owner has every permission. Clients gives the `member` role `clients.view` and the `manager` role `clients.view`,
`clients.manage`, `clients.import` and `clients.export` (`ClientsRbacProvider`). `clients.privacy` is owner-critical: only
the owner role holds it (through `all`), the manager's `all` leaves it out, and no role of a workspace's own can be given it.

The menu entry is `/dashboard/clients` ("Clients", icon `identification`), in the `workspace` section with order 20, for
whoever has `clients.view`.

## Configuration

`backend/packages/Clients/config/clients.php` holds the defaults; `backend/config/clients.php` reads one from the environment,
`clients.portal.require_captcha` (`CLIENTS_PORTAL_REQUIRE_CAPTCHA`), and the two are merged key by key.

| Key | Default | |
| --- | ------- | - |
| `clients.changes_per_minute` | 60 | changes one member may make to clients and their tags in a minute (the `clients` limiter) |
| `clients.reads_per_minute` | 120 | reads of the list, a client, its activity and its possible duplicates one member may make in a workspace in a minute (the `clients-read` limiter; over it, 429 `http.too_many_requests`) |
| `clients.per_page` | 25 | rows of a page of the list |
| `clients.activity_entries` | 50 | latest entries a client's activity lists |
| `clients.duplicates_shown` | 10 | possible duplicates a client's page shows at most |
| `clients.tags_max` | 200 | tags a workspace may have |
| `clients.tags_per_client` | 20 | tags one client may carry |
| `clients.bulk_max` | 500 | clients one bulk change of tags may touch |
| `clients.export_max_rows` | 50000 | rows a CSV export may hold |
| `clients.exports_per_hour` | 5 | CSV exports one member may download in an hour (the `clients-export` limiter) |
| `clients.import.max_bytes` | 5242880 | size of a CSV to import (5 MB) |
| `clients.import.max_rows` | 5000 | rows of a CSV to import, headers aside |
| `clients.import.max_columns` | 100 | columns a row of a CSV to import may have |
| `clients.import.chunk` | 200 | rows the import writes in one transaction, one job each |
| `clients.import.timeout_seconds` | 80 | how long the job of one part of an import may run; below the queue's `retry_after` (90) |
| `clients.import.sample_rows` | 5 | rows an upload shows to help map the columns |
| `clients.import.preview_errors` | 100 | errors the preview lists at most |
| `clients.import.errors_kept` | 1000 | errors an import keeps at most |
| `clients.import.uploads_per_hour` | 10 | CSVs one member may upload in an hour (the `clients-import` limiter) |
| `clients.import.steps_per_minute` | 6 | previews and runs of an import one member may ask for in a minute (the `clients-import-steps` limiter) |
| `clients.import.upload_ttl_hours` | 24 | how long an upload never run is kept |
| `clients.import.retention_days` | 30 | how long an import that ended (its counts and errors) is kept |
| `clients.import.stuck_after_minutes` | 60 | how long an import queued or running may go without progress before `clients:prune-imports` ends it as failed |
| `clients.portal.require_captcha` | `true`; `CLIENTS_PORTAL_REQUIRE_CAPTCHA`, empty: off for `local` and `testing` only | whether asking for a portal code needs a captcha that is really checked (`Portal\PortalCaptcha`); required while the captcha driver checks nothing, the portal is unavailable (see [Captcha](../configuration/captcha.md#clients_portal_require_captcha)) |
| `clients.portal.code_ttl_minutes` | 10 | how long a sign-in code of the [client portal](#client-portal) lives after it was last sent |
| `clients.portal.max_attempts` | 5 | wrong tries a code takes before it is gone |
| `clients.portal.max_sends` | 3 | times a code may be sent in its life (an expired one starts afresh) |
| `clients.portal.resend_after_seconds` | 60 | wait between two sends of a code |
| `clients.portal.session_minutes` | 10080 | how long a portal session lives (7 days) |
| `clients.portal.idle_minutes` | 2880 | how long a portal session may go unused (2 days) |
| `clients.portal.public_reads_per_minute` | 60 | calls to the portal's public reads one address may make in a minute (the `portal-public` limiter) |
| `clients.portal.codes_per_email_per_hour` | 5 | codes one email may ask for in an hour in a workspace, counted once the captcha passed (`Portal\PortalLimits`) |
| `clients.portal.codes_per_email_per_day` | 10 | the same in a day, on top of the hour's: a guesser who waits out the hours still gets few codes, and so few guesses |
| `clients.portal.codes_per_ip_per_hour` | 20 | codes one address may ask for in an hour (the `portal-code` limiter, counted before the captcha) |
| `clients.portal.verifies_per_ip_per_minute` | 10 | sign-in attempts one address may make in a minute (the `portal-verify` limiter, which counts every request) |
| `clients.portal.verifies_per_email_per_hour` | 15 | sign-in attempts at one email in an hour in a workspace, from any address, counted once the request is well formed (`Portal\PortalLimits`); no daily cap, since a try takes no captcha: someone who knows the email can renew a lockout every hour |
| `clients.portal.codes_per_workspace_per_hour` | 200 | codes a whole workspace may be asked for in an hour, whatever the email and the address, counted once the captcha passed (`Portal\PortalLimits`); over it every ask in the workspace is 429 until the hour is over, and the first refusal is reported |
| `clients.portal.wrong_codes_per_workspace_per_hour` | 300 | codes that did not work a whole workspace may take in an hour, whatever the email and the address (`Portal\PortalLimits`); over it every sign-in in the workspace is 429, the right code included, until the hour is over, and the first refusal is reported |
| `clients.portal.mails_per_workspace_per_day` | 500 | codes a workspace's portal may mail in a day (`Portal\PortalLimits::mail()`, counted by the job as it mails); over it nothing more is mailed that day, the request having answered the same 202, and the first refusal is reported |
| `clients.portal.requests_per_minute` | 60 | requests a signed-in client may make in a minute, reads and changes alike (the `portal` limiter, per client) |
| `clients.portal.phone_changes_per_hour` | 5 | new phones a signed-in client may give themselves in an hour, taken by another client or free (`Portal\PortalLimits`, per client): whether a phone is taken cannot be hidden from them |

## The tables

`clients` (row-level security with `FORCE`) keeps one row per client:

| Column | Type | |
| ------ | ---- | - |
| `id`, `tenant_id` | uuid | the client, and its workspace (`tenants`, cascades) |
| `name` | 150 | what people call them |
| `name_key` | 150 | the name as the list searches, sorts and compares it: lowercase, without accents, with single spaces (`Records\NameKey`); a name with no Latin letters keeps its own |
| `email` | 190 | optional, in lowercase (a `CHECK` says so) |
| `phone` | 32 | optional, E.164 (`+526641234567`; a `CHECK` says so) |
| `birthday` | date | optional |
| `locale` | 10 | the language to write to them in, optional |
| `address_line_1`, `address_line_2` | 180 | the street and number, and the rest, optional |
| `city`, `state`, `postal_code` | 120, 120, 20 | optional |
| `country` | char 2 | ISO 3166-1 alpha-2, uppercase (a `CHECK`), optional |
| `notes` | text | free text, up to 5000 characters (a `CHECK`), optional |
| `home_branch_id` | uuid | the branch they usually go to; none means the whole workspace's |
| `marketing_consent` | boolean | whether they agreed to marketing; false when made |
| `marketing_consent_at`, `marketing_consent_source` | `timestamptz`, 20 | when the consent last changed and where (`staff`, `import` or `portal`): both or neither (a `CHECK`) |
| `custom` | jsonb | the fields modules declare, always an object (`{}` when empty; a `CHECK` says so) |
| `source` | 20 | how the client came: `staff`, `import`, `portal` or `module` (a `CHECK`) |
| `merged_into_id` | uuid | the client this one was merged into |
| `erased_at` | `timestamptz` | when its personal data was erased |
| `created_at`, `updated_at`, `deleted_at` | `timestamptz` | `deleted_at` puts the client in the trash |

**One email and one phone per workspace among the live clients.** Two partial unique indexes,
`(tenant_id, email)` and `(tenant_id, phone)` `WHERE deleted_at IS NULL`, hold them: a client in the trash frees its email
and phone for another, and restoring it while another live client has them is refused.

**The home branch is let go, never in the way.** `(tenant_id, home_branch_id)` → `branches (tenant_id, id)` with
`ON DELETE SET NULL (home_branch_id)` (Postgres 15+): no client can point at another workspace's branch, and deleting a
branch leaves its clients with no home branch (the whole workspace's) without touching their `tenant_id`, so a branch with
clients is never "in use".

**A merged client points at the one that stayed** by `(tenant_id, merged_into_id)` → `clients (tenant_id, id)`, with the
same `SET NULL (merged_into_id)`, and an index on `(tenant_id, merged_into_id) WHERE merged_into_id IS NOT NULL`: deleting a
client (the workspace's too, which deletes them all) asks for the ones merged into it, and so does an erasure, link by link.

Besides the primary key, `(tenant_id, id)` is unique: a module's rows hang from a client by `(tenant_id, client_id)` →
`clients (tenant_id, id)`, so no workspace can point at another's client even if its code fails. The list reads through
`(tenant_id, created_at, id)`, `(tenant_id, name_key, id)` and `(tenant_id, home_branch_id)`.

A client has no status (active, inactive, blocked): it is live or in the trash. A module that needs more (a booking module
blocking someone) keeps it in its own table.

## Quota and plan

Clients registers the plan resource `clients` (`ClientsPlansProvider`, through `plans.quota_resources`): the workspace's
**live** clients, whenever and however they came (`Quotas\LiveClientsCounter`, `QuotaPeriod::Total`, order 40). A client
in the trash holds no place, so deleting one frees it, and restoring one takes it back.

It registers the feature `clients_import` too (through `plans.features`): whether the plan lets the workspace import
clients from a CSV file. A feature slug is snake case (see
[Add a quota or a feature flag](../guides/add-a-quota-or-feature.md)), so the feature is `clients_import` while the
permission is `clients.import`; importing needs both. And it registers `clients_portal`: whether the plan offers the
[client portal](#client-portal), which the workspace must also open.

Every plan of the catalog says its limit. The kit's example in `backend/config/plans.php`: Free 100, Pro 5,000, Business no
limit (`null`), with `clients_import` and `clients_portal` in Pro and Business. Plans retired before Clients was installed have no limit.

## Adding a client

`POST /clients` (`clients.manage`, the `clients` limiter) adds one and answers 201 with the whole client. Every field but
the name is optional, and blank text is kept as nothing (`null`):

| Field | Rule |
| ----- | ---- |
| `name` | required, up to 150 characters, one line of plain text (`PlainName`); spaces squished |
| `email` | up to 190 characters, ASCII, a strict address; kept in lowercase |
| `phone` | E.164 (`+526641234567`, what mood-ui's `PhoneInput` gives); anything else is 422 |
| `birthday` | `Y-m-d`, after 1900 and not to come |
| `locale` | one of `support.locales` |
| `addressLine1`, `addressLine2` | up to 180 characters each, plain text |
| `city`, `state`, `postalCode` | up to 120, 120 and 20 characters, plain text |
| `country` | an ISO 3166-1 alpha-2 code, uppercase |
| `notes` | up to 5000 characters over several lines (`MultilineText`) |
| `homeBranchId` | an active branch the person may see, or `null` for none |
| `marketingConsent` | a boolean; false when left out |
| `tagIds` | ids of the workspace's tags (any case), each once, up to `clients.tags_per_client`; a list of more than 100 (or of more than `clients.tags_per_client`, when that is higher) is refused whole, `validation.max` on `tagIds`, before any is looked up |
| `custom` | the fields modules declare (see [Custom fields](#custom-fields)) |

The rules live in `Validation\ClientRules::of(creating: true)`, which the import reads too, and `custom`'s in
`Fields\ClientFields::rules()`. A list of ids takes `ClientRules::ids()`: a cap on its length, and each id once whatever its
case through `Validation\Distinct`, which counts the list once (Laravel's `distinct` compares each id with every other, which
a list of thousands turns into minutes).

**The home branch.** Left out, the client takes the branch the person works at in the top bar when they work at one
(`CurrentBranch` in `branch` mode), else none; `null` asks for none. One that is asked for must be an active branch of the
workspace that the person may see (`BranchAccess::allows()`): anything else (closed, not theirs, another workspace's, not
there) is the same 422 `clients.branch_not_allowed` on `homeBranchId`, so the answer never says whether a branch exists. A
branch deleted between that check and the write is the same 422 (`Records\ClientWrites` reads the key's refusal), never a
500. A client with no home branch is the whole workspace's.

**Consent.** A new client starts without marketing consent. When `marketingConsent` is true, `marketingConsentAt` is the
moment it was given and `marketingConsentSource` is `staff` (an import says `import`, the portal `portal`).

**Duplicates.** One email and one phone per workspace among the live clients. An email or phone another live client has is
409 `clients.duplicate` on `email` or `phone`; `meta.clientId` names that client only if the person may see it (it has no
home branch, or one the person may see), so a duplicate never reveals a client of another branch. A client in the trash
holds neither. Two requests at once that pass the check together are stopped by the unique indexes: the second gets the
same 409, with no `meta.clientId`, never a 500.

**The plan.** The client takes one of the plan's `clients`, asked inside the transaction, under the quota's lock, before
the insert: over the limit it is 422 `plans.quota_exceeded`, and two at once take turns. Clients in the trash do not count.

**The trail.** The entry `clients.client.created` (resource `Client`, its branch the client's home branch) keeps by value
only what is no person's data: `homeBranchId`, `marketingConsent`, `source` and `tagIds`; the person's own data is named by
field alone, in `filled` (`["name", "email", "postalCode", "custom"]`), never by its value (`Records\ClientTrail`). Erasing a
client then leaves nothing of them in a table that cannot be changed.

**The event.** `Events\ClientCreated` (`tenantId`, `clientId`, `branchId`: the home branch, or `null`; ids in lowercase) is
sent after the commit, for modules that react to a new client.

**Sentry.** What people write about a client is registered in Support's `SentryOnlyFields` (`name`, `email`, `phone`,
`birthday`, `notes`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `custom`, and `search`), so a failure's report never carries it. `country` and `locale` are
left: codes that place nobody, and a name is blanked in every package's requests (a member's language, a place search's
country). They are not `SecretFields`: the trail names these fields and must keep the names. A database error's message
holds the values of its query, so a write the database refuses for another reason than a duplicate or a deleted branch,
and a query that breaks while it lists the clients, counts or reads the rows of an export, looks for a client with an
email or a phone, looks for possible duplicates, or looks up or brings in an import's lines, are reported as a
`Records\ValuesFreeFailure` (what broke, the failure's class, its SQLSTATE, file and line, nothing chained), never with
that message. A deadlock in a write stays a deadlock (Laravel's `DeadlockException`, `Writing a client failed: deadlock
detected (SQLSTATE 40P01)`, nothing chained), so a merge still runs once more.

**Impersonation.** A super admin acting as someone may not add a client (`not-impersonating`): it spends a place of the
plan.

The answer (and every route that answers one client):

```json
{
  "id": "…", "name": "Ana López", "email": "ana@example.com", "phone": "+526641234567",
  "homeBranch": {"id": "…", "name": "Centro", "isActive": true},
  "marketingConsent": true, "tags": [{"id": "…", "name": "VIP", "color": "success"}],
  "createdAt": "2026-11-12T18:00:00Z", "deletedAt": null,
  "birthday": "1990-04-12", "locale": "es", "addressLine1": "Av. Revolución 1234", "addressLine2": null,
  "city": "Tijuana", "state": "Baja California", "postalCode": "22000", "country": "MX", "notes": "Prefers mornings.",
  "marketingConsentAt": "2026-11-12T18:00:00Z", "marketingConsentSource": "staff",
  "custom": {"spa.skin": "dry"}, "source": "staff", "updatedAt": "2026-11-12T18:00:00Z",
  "portal": {"sessions": 1, "lastUsedAt": "2026-11-12T19:00:00Z"}
}
```

`homeBranch` is `null` for none; `custom` is always an object (`{}` when empty); a client's tags come by name. `portal` says
whether the client uses the [client portal](#client-portal) (see [For the team](#for-the-team)); the list's rows leave it
out.

| Error | When |
| ----- | ---- |
| 422 validation on the field | a field breaks its rule (`custom` for a key no package declares, `custom.<key>` for a field's value) |
| 422 `clients.branch_not_allowed` on `homeBranchId` | a home branch the person may not choose |
| 409 `clients.duplicate` on `email` or `phone` (`meta.clientId` when they may see it) | another live client has it |
| 422 `clients.tag_not_found` on `tagIds` | a tag the workspace does not have |
| 422 `clients.too_many_tags` on `tagIds` (`meta.limit`) | the client's tags would grow past the cap |
| 422 `plans.quota_exceeded` | the plan's `clients` are all taken |
| 403 `auth.impersonation_forbidden` | a super admin acting as the person |

## A client

`GET /clients/{client}` (`clients.view`, the `clients-read` limiter) answers the whole client, as [adding one](#adding-a-client) does, with its tags by
name and its home branch named.

**Who opens it.** A client opens to whoever may see its home branch (`BranchAccess::allows()`), or to anyone with
`clients.view` when it has none (it is the whole workspace's), **whatever branch the top bar is on**: a client is never
hidden from someone who sees its branch. Anything else is the same 404 `clients.not_found`: a client of a branch the person
does not see, of another workspace, in the trash, erased, or no client at all (an id that is not one included). The answer
never says which. The id is taken in any case. `Records\ClientFinder` is the one reader of a client by an id from outside:
the routes on one client go through it, so they answer alike. The person's sight is part of its query, so a route that
holds the client's row (an edit, a delete, a merge, an erasure) never holds, nor waits for, a client out of their sight.

## Editing a client

`PATCH /clients/{client}` (`clients.manage`, the `clients` limiter) changes only what came and answers the whole client.
Every field of [adding one](#adding-a-client) is optional, with the same rules; `name` may not be blank or `null`, and the
rest take `null` (or blank text) for nothing. It opens the client like `GET` (the same 404 for one the person may not see),
and holds its row (`FOR UPDATE`) while it changes it.

- **Its own data.** The email in lowercase, the name squished with its search key. An email or a phone another live client
  has is 409 `clients.duplicate`, as when adding one; its own is no duplicate.
- **The home branch.** `homeBranchId` takes an active branch the person may see, or `null` for none; anything else, a
  branch deleted meanwhile included, is 422 `clients.branch_not_allowed` on `homeBranchId`. Left out, it stays.
- **Consent.** `marketingConsent` is a choice of its own: when it changes, `marketingConsentAt` is the moment and
  `marketingConsentSource` is `staff`; sent unchanged, nothing is stamped.
- **Tags.** `tagIds` replaces the client's tags with exactly those (`[]` takes them all away), with the rules of adding one.
- **Custom fields.** `custom` is merged: the fields that came replace theirs, `null` takes one away, the rest stay.

**The trail.** Each kind of change has an entry of its own (resource `Client`, its branch the client's home branch after
the change), and nothing that came unchanged leaves one:

| Entry | `before` | `after` |
| ----- | -------- | ------- |
| `clients.client.updated` | `homeBranchId`, when it changed | `homeBranchId`, when it changed; `changed`: the names of the person's own fields that changed (`["phone", "notes", "custom"]`), never their values |
| `clients.client.consent_changed` | | `marketingConsent`, `source` |
| `clients.client.tags_updated` | `tagIds` | `tagIds` (sorted) |

**Impersonation.** A super admin acting as someone may edit a client's name, language, home branch, tags and custom fields
(support may need to fix one); the trail names the admin (`impersonator_user_id`). What reaches or describes the person
(`email`, `phone`, `birthday`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `notes`) and the
`marketingConsent` are not theirs to change: a request that would change any of them (sent as the client already has it,
it changes nothing and passes) is 403 `auth.impersonation_forbidden`, checked with the client's row held, and nothing of it
is saved. The client's page keeps those fields off then, with a line that says why.

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | no client the person may see has that id |
| 403 `auth.impersonation_forbidden` | a change to the person's data or consent, while a super admin acts as the person |
| 422 validation on the field | a field breaks its rule |
| 422 `clients.branch_not_allowed` on `homeBranchId` | a home branch the person may not choose, or one deleted meanwhile |
| 409 `clients.duplicate` on `email` or `phone` (`meta.clientId` when they may see it) | another live client has it |
| 422 `clients.tag_not_found` / `clients.too_many_tags` on `tagIds` | as when adding one |

## The trash

A client is never deleted for good from the dashboard: deleting one puts it in the trash, where it can be restored.

**Deleting.** `DELETE /clients/{client}` (`clients.manage`, the `clients` limiter) opens the client like `GET` (the same 404
`clients.not_found` for one the person may not see, or one already in the trash), holds its row and puts it in the trash
(`deleted_at`). It answers `data: null`. Its email and phone are free again (the unique indexes are of live clients), and
its place in the plan too (the `clients` quota counts live clients). It keeps its tags, its home branch and everything else,
but its sessions of the [client portal](#client-portal) and its waiting code end (see [For the team](#for-the-team)).

**The trash in the list.** `GET /clients?trash=1` (`clients.manage`) lists it, with its `deletedAt` (see [The
list](#the-list)).

**Restoring.** `POST /clients/{client}/restore` (`clients.manage`, the `clients` limiter) brings back a client of the
trash the person may see and answers the whole client, as `GET` does (`deletedAt: null`). It holds the client's row, and:

- **The plan.** It takes a place of the plan's `clients` again, asked inside the transaction, before the write: over the
  limit it is 422 `plans.quota_exceeded`, and it stays in the trash.
- **Duplicates.** If a live client took its email or its phone while it was in the trash, it is 409 `clients.duplicate` on
  that field (`meta.clientId` only when the person may see that client), and it stays in the trash: the two are the same
  person, so merge them instead. A restore that loses the race to the unique index is the same 409, naming nobody.
- **Never back.** A client merged into another, an erased one, a live one, one the person may not see and no client at all
  are the same 404 `clients.not_found`.
- **Signed out.** It comes back with no session of the [client portal](#client-portal): whatever the trash left is ended in
  the same transaction, so a token from before never works again (see [For the team](#for-the-team)).

**The trail.** `clients.client.deleted` and `clients.client.restored` (resource `Client`, no `before` or `after`, its branch
the client's home branch).

**The events.** After the commit, `Events\ClientDeleted` (a module may hide what it shows of the client) and
`Events\ClientRestored`, each with `tenantId`, `clientId` and `branchId` (the home branch, or `null`), ids in lowercase,
like `ClientCreated` (the three extend `Events\ClientEvent`).

**Impersonation.** A super admin acting as someone may neither delete a client (a `DELETE`, which `GuardImpersonation`
refuses) nor restore one (`not-impersonating`: it spends a place of the plan); both are 403 `auth.impersonation_forbidden`.
`Actions\RestoreClient` refuses it too, for another package that calls it.

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | no client the person may see has that id (to delete: a live one; to restore: one in the trash, neither merged nor erased) |
| 409 `clients.duplicate` on `email` or `phone` (`meta.clientId` when they may see it) | restoring: a live client has it now |
| 422 `plans.quota_exceeded` | restoring: the plan has no room for one more live client |
| 403 `auth.impersonation_forbidden` | either, during an impersonation |

## Duplicates and merging

**Exact duplicates never happen among the live clients.** One email and one phone per workspace among the live clients
(two partial unique indexes, `WHERE deleted_at IS NULL`): adding, editing or restoring a client onto another's is 409
`clients.duplicate` (see [Adding a client](#adding-a-client)).

**Possible duplicates.** `GET /clients/{client}/duplicates` (`clients.manage`, the `clients-read` limiter) opens the client like `GET /clients/{client}`
(the same 404 `clients.not_found`) and answers up to `clients.duplicates_shown` (10) other live clients with the same name
however it is written (`name_key`: "Ana López" and "ana  lopez" are one), oldest first, each as a row of the list
(`[{id, name, email, phone, homeBranch, marketingConsent, tags, createdAt, deletedAt}]`). Only the clients the person may see
are there, whatever branch the top bar is on: one of a home branch they do not see is left out, never named. Clients in the
trash and erased ones are never possible duplicates.

**Merging.** `POST /clients/{client}/merge {sourceId}` (`clients.manage`, the `clients` limiter) makes two clients one: the
client of the path stays, the client of `sourceId` goes to the trash with `merged_into_id` pointing at the one that stayed
(it can never be restored, nor merged again). Both must be live clients the person may see, by the rule of one client;
otherwise it is the same 404 `clients.not_found`, whichever of the two it is. In one transaction, with both rows held
(`FOR UPDATE`) in the order of their ids, so two merges of the same pair the other way round take turns (the second finds
its client gone: 404) and an edit of either waits for the merge:

- **Contact details, birthday, language, address and home branch:** what the client that stays lacks comes from the other.
  Its email and phone too: the other leaves the live clients first, so the unique indexes let them pass. What the one that
  stays has is kept, never overwritten. The other's home branch comes only while it is active, as when one is set; a
  closed one is left behind and the client that stays keeps none.
- **Notes:** both, the stay's first, separated by a blank line. Joined longer than a client's notes may be (5000
  characters) is 422 `clients.merge_notes_too_long` on `sourceId`, and nothing merges: shorten them first.
- **Tags:** both sets (the other's are held `FOR SHARE`, so a tag deleted at the same moment is waited for and left out).
  Growing past `clients.tags_per_client` is 422 `clients.too_many_tags` on `sourceId` (`meta.limit`), and nothing merges.
- **Marketing consent:** the latest choice, by `marketingConsentAt`: the other's choice, its moment and its source when it
  chose later, or when the one that stays never chose.
- **Custom fields:** the stay's, with the other's that it lacks.
- **Modules** move their rows inside the same transaction (`Contracts\ClientMergeParticipant`, below); one that fails undoes
  the whole merge.

It answers the client that stayed, as `GET /clients/{client}` does. The other keeps its own data and tags in the trash.

When Postgres breaks a deadlock with the merge (deleting the other's home branch at that very moment holds the branch, and
its `SET NULL` waits for the other client, which the merge holds while its save checks that same branch), the transaction
runs once more from the start; a second deadlock is an error.

**The trail.** `clients.client.merged` on the client that stayed, with `after: {mergedFrom, changed}` (`changed`: the API's
names of the fields it took, never their values), and `clients.client.merged_into` on the other, with
`after: {mergedInto}`; each with its client's home branch as its branch. When the consent or the tags of the client that
stayed changed, `clients.client.consent_changed` and `clients.client.tags_updated` as for an edit.

**A module's rows.** A module that keeps rows of a client (Booking's appointments) implements
`Contracts\ClientMergeParticipant` and tags it `clients.merge`:

```php
$this->app->tag([BookingClientMerge::class], 'clients.merge');
```

`merge(string $tenantId, string $fromId, string $intoId)` runs inside the merge's transaction, with both clients' rows
held, as that workspace, ids in lowercase: it moves its rows from `$fromId` to `$intoId` and never reads or writes the
clients table. It may run twice for one merge (the transaction runs again after a deadlock), so it writes only to the
database, inside the transaction. After the commit, `Events\ClientsMerged` (`tenantId`, `clientId` the one that stayed,
`mergedId` the one that went, `branchId` the home branch of the one that stayed, ids in lowercase; it extends
`Events\ClientEvent`) is for what a module does once it is done (an index, a cache).

**Impersonation.** A merge cannot be undone: a super admin acting as someone may not merge (`not-impersonating`, 403
`auth.impersonation_forbidden`), and `Actions\MergeClients` refuses it too, for another package that calls it. Reading the
possible duplicates is allowed.

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | either client is not a live client the person may see |
| 422 validation on `sourceId` | missing, or not an id |
| 422 `clients.merge_same` on `sourceId` | merging a client with itself |
| 422 `clients.merge_notes_too_long` on `sourceId` | the two notes, joined, would be too long |
| 422 `clients.too_many_tags` on `sourceId` (`meta.limit`) | the two sets of tags together would grow past the cap |
| 403 `auth.impersonation_forbidden` | merging, during an impersonation |

## Activity

`GET /clients/{client}/activity` (`clients.view`) tells what happened to a client, newest first: the latest
`clients.activity_entries` (50) of everything below together. The client opens like `GET /clients/{client}` (the same 404
`clients.not_found`).

- **Its audit entries** (`Audit\Contracts\AuditTrail`): added (`created`), edited (`updated`), marketing consent given or
  withdrawn (`consent_given`, `consent_withdrawn`, from `consent_changed`), tags changed (`tags_updated`), sent to the trash
  (`deleted`), restored (`restored`), merged with another client (`merged`, on the client that stayed) and its data
  downloaded (`data_exported`); and from the [client portal](#client-portal): signed in (`portal_signed_in`), their details
  changed by the client (`portal_updated`, with `fields` as an edit's) and their sessions ended by the team
  (`portal_signed_out`). A consent the client changes in the portal is `consent_given` or `consent_withdrawn`, as the
  team's. What the client does has no `actorName`: the client is no member.
- **"Imported from a file"** (`imported`), at the moment it was added, for a client that came from an import.
- **What each package adds**: an appointment booked, a sale (see below).

Each entry is `{id, action, label, actorName, impersonated, at, fields}`:

| Key | Holds |
| --- | ----- |
| `id` | unique among the client's activity (an audit entry's id, or what the package gives) |
| `action` | one of the above, or `<module>.<what>` for a package's |
| `label` | what to show, already in the language of the request |
| `actorName` | who did it, as `Auth\Contracts\MemberDirectory::displayNames()` names them (their name, or their email when the name is blank); `null` when nobody did (an import, a package's entry with no one) or the person is no longer found |
| `impersonated` | whether a super admin did it acting as that person |
| `at` | when, ISO 8601 in UTC (`2026-01-02T10:00:00Z`) |
| `fields` | for an edit (`updated`, `portal_updated`), the names of the fields it changed (`["homeBranchId", "phone"]`); empty for the rest |

Nothing of the person comes out but the names of fields: the activity reads the audit trail, which never keeps a client's
own data by value (see [Adding a client](#adding-a-client)). A marketing consent changed with an edit is an entry of its
own, so the edit's `fields` never name it.

**A package's part.** A module adds its entries with a `Contracts\ClientActivitySource` tagged `clients.activity`:

```php
$this->app->tag([SpaClientActivity::class], 'clients.activity');
```

```php
final class SpaClientActivity implements ClientActivitySource
{
    public function forClient(string $tenantId, string $clientId, int $limit): array
    {
        return Visit::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)->latest()->limit($limit)->get()
            ->map(fn (Visit $visit): ClientActivityItem => new ClientActivityItem(
                "spa.visit:{$visit->id}", 'spa.visit', __('spa::activity.visit'), $visit->created_at->toImmutable(), $visit->user_id,
            ))->all();
    }
}
```

It is asked as the workspace, for a client the person may see, and answers its latest `$limit` entries, newest first, each a
`Contracts\ClientActivityItem` (`id`, `action`, `label`, `at`, and optionally `actorUserId`, `impersonated` and `fields`).
Its labels are already translated, and say nothing of another person.

What a source owes:

- **Its entries follow the client's sight.** It is only asked once the client opened for the person (no home branch, or one
  they see), and whatever it answers is shown to them. An entry that belongs to a branch the person does not see (a visit at
  another branch, say) is the source's to leave out: the contract gets no user id, so a source with a branch rule of its own
  asks `Auth\Contracts\CurrentUser` who is asking and `Tenancy\Contracts\BranchAccess::allows()` for each branch itself.
- **It does not fail.** An exception thrown by a source is not caught: the whole request fails (500 `server.error`), and the
  person sees no activity at all, the audit entries included. A source that reads something that may be missing answers
  nothing for it rather than throwing.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /clients/{client}/activity` | `clients.view`, the `clients-read` limiter | the client's latest entries, newest first |

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | no live client the person may see has that id |

## Privacy

What a client may ask of a workspace about their data: everything it keeps about them, and to be forgotten. Both are the
owner's (`clients.privacy`, owner-critical: no other role holds it, see [Permissions](#permissions-and-the-menu)), take
the `clients` limiter, and are refused while a super admin acts as the person (`not-impersonating`, 403
`auth.impersonation_forbidden`): erasing cannot be undone, and the download writes nothing but takes a person's data out
of the workspace. `Actions\ExportClientData` and `Actions\EraseClient` refuse it too, for another package that calls
them. The client opens by the rule of one client (its home branch seen, or none), live or in the trash; one merged into
another, an erased one, another workspace's and no client at all are the same 404 `clients.not_found`.

**Everything kept about a client.** `GET /clients/{client}/privacy-export` answers, in the usual envelope (the page saves it
as a file), with `Cache-Control: no-store, private` and `Referrer-Policy: no-referrer`, its refusals too (Support's
`KeepOutOfCachesAndReferrers`, ahead of the limiter), as the CSV export is: the whole of a person, made to leave the workspace,
is kept by no cache, the browser's included. So are the other reads of clients (`GET /clients`, `GET /clients/{client}`,
its activity and its possible duplicates), with the same two headers, their refusals and the limiter's included: what a
browser shared by a front desk keeps on disk should not be a list of the business's clients. The catalogs (`clients/tags`,
`clients/fields`, `clients/options`) answer as every signed-in read of the API does, `Cache-Control: no-cache, private`.

```json
{
  "data": {
    "exportedAt": "2026-01-02T10:00:00Z",
    "client": { "id": "…", "name": "Ana López", "email": "ana@example.com", "…": "as GET /clients/{client}" },
    "tags": ["VIP"],
    "consent": [
      { "marketingConsent": false, "source": "portal", "at": "2026-01-02T09:00:00Z" },
      { "marketingConsent": true, "source": "staff", "at": "2025-11-30T18:00:00Z" }
    ],
    "modules": { "booking": { "appointments": [] } },
    "merged": [{ "id": "…", "name": "Ana Lopez", "…": "as GET /clients/{client}", "consent": [], "modules": { "booking": { "appointments": [] } } }]
  }
}
```

- `client`: the client as `GET /clients/{client}` answers it, `deletedAt` set when it is in the trash. Its `portal` says how
  many sessions of the [client portal](#client-portal) still sign them in and when one was last used (`0` and `null` for a
  client in the trash or merged, see [For the team](#for-the-team)). The browser each session was opened from (`user_agent`)
  is left out on purpose: the export carries what the workspace keeps to know the person, and a session's browser is kept
  only while the session lives (`clients.portal.session_minutes`, 7 days at most; `clients:prune-portal` deletes it that night);
  erasing a client deletes it at once (see below).
- `tags`: their names.
- `consent`: the history of the marketing consent, newest first, from the trail: the choice the client was added with
  (`source` is where the client came from) and every change since (`source` is where the choice came from).
- `modules`: each package's part, by its key (`ClientDataContributor::export()`, below).
- `merged`: what is left in the trash of the clients merged into this one (directly, or through another merged into it), each
  as `GET /clients/{client}` answers a client, with its own `consent` and `modules` shaped as above: what the trail and each
  package still keep of it (the erasure erases those too). A module that moves its rows to the client that stayed when they
  merge has nothing left of the other.

It is audited as `clients.client.data_exported` (its branch the client's home branch), with who downloaded it and when, and
no values.

**Erasing a client for good.** `POST /clients/{client}/erase` answers `{"data": null}`. In one transaction, with the client's
row held:

- every import of the workspace not ended yet (uploaded, previewed or not, queued or running) ends `failed`, whoever
  uploaded it, with `failure: "clients.import_cancelled_by_erasure"`: its file may hold the person, and running it would
  bring them back as a new client. Each ends as a failed job ends it (headers and mapping cleared,
  `clients.import.finished` with `status: "failed"`, `ClientImportFinished`, so its uploader gets the
  `clients.import_finished` notice, "could not finish"), with the erasure's author in the trail; its file is deleted once
  the erasure commits (kept, with the import going on, when the erasure is undone; a file the disk refuses to delete is
  left for `clients:prune-imports`). A part of one at work when the erasure comes finishes first (the import's row is held
  before the client's, as a part holds them), and the next one finds the import ended. The imports of the workspace start
  again only from a new upload;
- each package erases its part (`ClientDataContributor::erase()`, below); one that fails undoes the whole erasure;
- its sessions of the [client portal](#client-portal) and its waiting code are deleted (see
  [For the team](#for-the-team));
- the client loses its tags, and its row is anonymized: the name becomes a fixed long dash (`—`, the same in every language,
  so whatever a module shows of it says nothing), every other field of the person (email, phone, birthday, language, address,
  notes) becomes `null`, the custom fields `{}`, the marketing consent `false` with no moment or source, and `erased_at` is
  stamped; a live client goes to the trash. Its id, its home branch, its source and its dates stay;
- the same happens to every client merged into it, directly or through another: they were the same person.

The row stays because the records of the modules point at it (an appointment keeps its client), now at nobody. An erased
client is never shown again: it does not open, is not listed (not even in the trash), cannot be restored, edited, tagged,
merged or erased again, and is never a possible duplicate; its email and phone are free for a new client.

**What erasing does not reach.** Copies of the person outside the client's row, each gone on its own clock:

- A file uploaded to import after the erasure: it is a new upload, and may bring the person back as a new client if it
  holds them. (Every import not ended when the erasure runs ends with it, see above.)
- An import's headers (`client_imports.headers`): a file without a row of headers has its first client there, a name, an
  email or a phone. They stay until the import ends (finished or failed), when they and the mapping that names them are
  cleared (see [Running it](#running-it)), or until the prune forgets an upload never run.
- An import's file name (`client_imports.file_name`), which may name someone (`ana-lopez.csv`): kept with the import, up to
  `clients.import.retention_days` (30) after it ends, and written in its `clients.import_finished` notice, which stays in
  the uploader's inbox and mailbox as long as [Notifications](notifications.md#retention) and their mail keep it.
- Tag names in the audit trail (`clients.tag.*` keeps a tag's name before and after): a tag is meant to be no person's
  data, so a tag named after someone stays there by that name.
- The page's title: a client's page is titled with the client's name, which the browser keeps in its history, out of the
  app's reach.
- The list's `search` in the query string: Sentry never gets
  it (`SentryOnlyFields` blanks them in the request, and a query of the list or the export that breaks is reported
  without its message, see [Adding a client](#adding-a-client)), but a web server's or a proxy's access log that records
  query strings keeps them for as long as you keep that log. Treat such logs as the rest of your users' data, or log
  `/api/v1/clients` without its query.

**What an import tells about clients out of sight.** A preview tells nothing of them: a line whose client is out of the
person's sight is counted, named in `newTags` and checked as a new client's (see [Columns and preview](#columns-and-preview)).
A run cannot hide it as well: the unique indexes refuse a second live client with that email or phone, so the line brings
nobody and is counted in `skipped`, with no error of its own, and the list afterwards lacks that client. The counts and the
`clients.import_finished` notice never say which line; but a run brings real clients, spends the plan's places and is held
to `clients.import.uploads_per_hour` (10) uploads and `clients.import.steps_per_minute` (6) previews and runs. It is the
fact a 409 `clients.duplicate` tells one value at a time when adding or editing a client (which names the client only to
someone who may see it).

**What adding or editing a client tells about clients out of sight (accepted).** A 409 `clients.duplicate` says that an
email or a phone is a live client's, a branch out of the person's sight included (`Records\DuplicateCheck`): the unique
indexes refuse the value whatever the check says, so a refusal cannot be avoided, only kept from naming the client
(`meta.clientId` only to someone who may see it). What bounds how fast someone with `clients.manage` can ask is the
`clients` limiter, `clients.changes_per_minute` (60) writes a minute, which `POST /clients` and `PATCH /clients/{client}`
share; the import's `clients-import-steps` limiter (6 a minute) bounds the import alone, which no longer tells (above).

The trail keeps `clients.client.erased` (its branch the client's home branch, no values) for each client erased, and
nothing of the person: it never held a client's data by value, only the names of fields (see
[Adding a client](#adding-a-client)), and an entry of something the client did in the portal (`portal_signed_in`,
`portal_updated`, `consent_changed` from the portal) keeps no IP address or browser (`ClientTrail` asks the trail to leave
them out, Audit's `withOrigin: false`), since nothing in the trail can be erased. A member's entries keep the member's.
After the commit, `Events\ClientErased` (`tenantId`, `clientId`, `branchId` the home branch or `null`, ids in lowercase;
it extends `Events\ClientEvent`) for each, for a module that keeps files or copies elsewhere. It is the only event: a live client erased goes to the trash without `ClientDeleted`, so a module that
hides what it shows of a deleted client listens to both.

When Postgres breaks a deadlock with the erasure (deleting a home branch takes the rows of its clients in an order of
its own), the transaction runs once more from the start.

**A module's part.** A module that keeps data about a client implements `Contracts\ClientDataContributor` and tags it
`clients.data`:

```php
$this->app->tag([BookingClientData::class], 'clients.data');
```

```php
final class BookingClientData implements ClientDataContributor
{
    public function key(): string
    {
        return 'booking';
    }

    public function export(string $tenantId, string $clientId): array
    {
        return ['appointments' => Appointment::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)
            ->get(['starts_at', 'service_name', 'notes'])->toArray()];
    }

    public function erase(string $tenantId, string $clientId): void
    {
        Appointment::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)->update(['notes' => null]);
    }
}
```

It is asked as the workspace, ids in lowercase. `key()` names its part (snake case); `export()` answers plain values (no
models); `erase()` deletes what it keeps about the client, or makes it no one's, inside the erasure's transaction, and
only in the database: it may run twice for one erasure (after a deadlock); files and copies elsewhere go on
`ClientErased`. Both are asked for each client merged into the one exported or erased too.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /clients/{client}/privacy-export` | `clients.privacy` | everything kept about the client, audited |
| `POST /clients/{client}/erase` | `clients.privacy` | erases the client for good |

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | no client the person may see has that id, live or in the trash (merged into another or erased: none) |
| 403 `auth.forbidden` (`meta.requiredPermission: "clients.privacy"`) | either, to anyone but the owner |
| 403 `auth.impersonation_forbidden` | either, during an impersonation |

## The list

`GET /clients` (`clients.view`, the `clients-read` limiter) lists the clients the person may see, a page of `clients.per_page` (25) at a time, each as
a row:

```json
{
  "data": [{
    "id": "…", "name": "Ana López", "email": "ana@example.com", "phone": "+526641234567",
    "homeBranch": {"id": "…", "name": "Centro", "isActive": true}, "marketingConsent": true,
    "tags": [{"id": "…", "name": "VIP", "color": "success"}], "createdAt": "2026-11-12T18:00:00Z", "deletedAt": null
  }],
  "meta": {"pagination": {"page": 1, "perPage": 25, "total": 41, "lastPage": 2}},
  "errors": []
}
```

Every parameter is optional, and they add up:

| Parameter | Takes | Keeps |
| --------- | ----- | ----- |
| `search` | up to 100 characters | clients whose name, email or phone has it (see below) |
| `tags[]` | tag ids (any case), each once, up to 100 | clients that carry **any** of them |
| `marketing` | `yes` or `no` | clients who agreed to marketing, or who did not |
| `branch` | `visible`, or a branch's id (any case) | see [Following the branch](#following-the-branch) |
| `trash` | `1` (or `0`) | the trash instead of the live clients; takes `clients.manage` |
| `sort` | `newest` (the default), `oldest` or `name` | newest first (`created_at`, then `id`, descending), oldest first, or by name (`name_key`, then `id`) |
| `page` | a whole number from 1 | that page of the list (1 by default) |
| `perPage` | a whole number from 1, at most 100 (more is 100) | how many clients a page holds (`clients.per_page`, 25, by default) |

**Search.** What the person types is looked for anywhere in the name, the email and the phone (`Records\ClientSearch`): in
the name as `NameKey` reads it (so `jose nunez` finds "José Núñez", and `LÓPEZ` finds "Ana López"), in the email in
lowercase, and in the phone by its digits alone, when it has three or more (`664 999` finds `+526649999999`; fewer would
match nearly everyone). The name and the email also match a word they only *resemble* (Postgres' trigram similarity,
`Support\Database\FuzzyMatch`: `Aln` finds "Alan Pacheco", `Pacheko` finds "Pacheco"; a word of fewer than three letters only
matches by containing); the list keeps its own order. A `%`, an `_` or a `\` is a letter like any other, never a wildcard.

**The page** is the list's order, cut by number: `total` counts the clients the filters, the trash and the top bar's branch leave (the same query as the page, so a client the person may not see is never counted), and `lastPage` is the last page of that many. A `name` list orders by `name_key`, then `id`.

**The trash** (`trash=1`) lists the clients deleted and not yet restored, newest first like the rest, with their
`deletedAt`. It takes `clients.manage` (403 `auth.forbidden`, `meta.requiredPermission: "clients.manage"`, otherwise). A
client merged into another is in the trash for good and not listed there; an erased client is never listed at all.

**Reads.** A page reads its clients' tags in one query, and their home branches at once from the active branches the person
sees (`ClientPayload::prime()`; a closed home branch is read on its own): the queries of a page do not grow with its rows.

| Error | When |
| ----- | ---- |
| 422 validation on the parameter | a parameter breaks its rule (`tags.0` for a tag that is no id, `tags` for more than 100) |
| 422 `clients.branch_not_allowed` on `branch` | a branch the person may not see |
| 403 `auth.forbidden` (`meta.requiredPermission: "clients.manage"`) | the trash, to someone who does not manage clients |

## Following the branch

Clients are the whole workspace's, and the list follows the branch the person works at in the top bar by their **home
branch** (`Scope\ClientVisibility::narrow()`, through Tenancy's `CurrentBranch` and `BranchAccess`; nothing in Clients reads
the Branches tables). A client with no home branch is the whole workspace's: every list that names a branch keeps it.

| The list | Keeps |
| -------- | ----- |
| no `branch`, the top bar on a branch | the clients of that branch **and** those of no branch |
| no `branch`, the person works at no branch (`none`) | only the clients of no branch |
| no `branch`, "All branches", or a workspace that does not work by branch | every client |
| `branch=visible` | the clients of every branch the person may see (`BranchAccess::visibleTo()`), closed ones included, and those of no branch |
| `branch=<id>` | the clients of that branch alone (not those of no branch), when the person may see it (`BranchAccess::allows()`): a branch they work at, a closed one included. A branch they do not work at, another workspace's or one that is not there is 422 `clients.branch_not_allowed` on `branch`; to someone who sees every branch, a branch that is not there lists nobody |

The frontend never sends the top bar's branch: with no `branch` the server works it out, and the page loads the list again
when it changes (`useBranchReload()`). The trash follows the same rules.

What else follows the branch, and what does not:

| Screen or piece | Follows it | How |
| --------------- | ---------- | --- |
| The list | yes | as above |
| One client (show, edit, its activity, and every route on one client) | yes | it opens with no home branch, or when `BranchAccess::allows()` its home branch, **whatever branch the top bar is on**; otherwise the same 404 `clients.not_found` |
| A new client's home branch | yes | the top bar's branch when it is on one, else none; another active branch the person sees may be chosen |
| Possible duplicates | yes | only those the person may see |
| An exact duplicate (409) | yes | `meta.clientId` only when the person may see it |
| The CSV export | yes | the list's filters and scope |
| The import | yes | the home branch chosen (checked) or the top bar's; a duplicate the person does not see is skipped, never filled |
| The catalog of tags | no | the whole workspace's; each tag counts the live clients the person sees, and only someone who sees every branch changes or deletes one |
| Tagging in bulk | yes | each client by the rule of one client; one the person does not see is 422 `clients.selection_changed` |
| The audit trail | yes | an entry's `branchId` is the client's home branch, never the top bar's |
| Events | yes | they carry `branchId`, the home branch |
| The notice of a finished import | no | it is the importer's |
| The `clients` quota | no | it counts the live clients of the whole workspace |

## Search

Clients brings the source `clients.clients` to the global search ([Search](search.md)), through `ClientsSearchProvider`
(tagged `search.sources` by its own `ClientsSearchServiceProvider`, so Clients also depends on Search): the group
"Clients" (icon `identification`, order 30), for whoever has `clients.view`. Without it the source is never asked, so
nobody without `clients.view` sees a client's name, email or phone in the palette. It needs no feature of the plan.

`Search\ClientsFinder` runs the list's own query (`Records\ClientSearch::query()` with
`ClientQuery(search: ..., sort: 'name', bestMatch: true)` (the closest name or email first, then by name), no `branch`, asking for `search.per_source` rows), so it finds whom the list
shows with no filter and nobody else:

- words of the name (any case, accents or not), the email, or the phone once what was typed has three digits or more; a
  `%`, `_` or `\` is a letter;
- the branch of the top bar, as the list with no `branch` ([Following the branch](#following-the-branch)): that branch's
  clients and those of no branch; only those of no branch while working at none; everyone with "All branches" or while
  the workspace does not work by branch;
- never a client in the trash, nor an erased one;
- by name.

Each hit is the client's name, their email under it (their phone, as stored, when they have no email; nothing when they
have neither), and their page, `/dashboard/clients/{id}`. The search has its own limiter (`search`), not `clients-read`.

With a search index on (`SCOUT_DRIVER=meilisearch`, off by default), `Search\ClientIndex` keeps each live client's id,
workspace, name, email and phone in Meilisearch, and the finder runs the same query, with no words, over the ids the index
proposes, in its order: the index suggests, Postgres decides. `search:reindex` sends them again. See
[Search configuration](../configuration/search.md).

## On the dashboard

Clients brings the widget `clients.overview` to the home ([Dashboard](dashboard.md)), through `ClientsDashboardProvider` (tagged
`dashboard.widgets`): the card "Clients", small, order 30, for whoever has `clients.view`. It needs no feature of the plan. Its data:

| Key | What it is |
| --- | ---------- |
| `total` | the clients the list shows the person with no filter: the branch of the top bar and the clients of no branch (only those of no branch while working at none, everyone with "All branches"), never the trash nor the erased |
| `recent` | of those, the ones added in the last 30 days, counted in UTC (never the workspace's "today", which would need its time zone) |
| `recentDays` | the days `recent` looks back: 30 |

Both counts use the list's own query (`ClientSearch`), so they follow the branch bar as the list does. The list reads the bar
from the current request, so the widget answers only for the person signed in (`Search\Contracts\RequestingPerson`, as the
global search's finder does): a call for someone else's id, or with nobody signed in, throws instead of answering the whole workspace.

The frontend draws it in `frontend/layers/clients` (`ClientsOverviewWidget`, registered by the `clients-dashboard` plugin
through `kit:dashboard:widgets`): `DashboardWidgetCard` linking to the clients, with two mood-ui `Stat`s, "Clients" and "New"
with "In the last 30 days" under it (the days are `recentDays`; "In the last day" for one). The same plugin adds New client to
the top bar's Create menu (`kit:topbar:actions`, order 30, to `/dashboard/clients/new`) for whoever has `clients.manage`,
which the page itself requires too.

## Import

A workspace brings its clients in from a CSV file: it uploads the file, maps its columns to the fields, previews what will
happen, and runs it. Importing takes the permission `clients.import` and a plan with the feature `clients_import` (see
[Quota and plan](#quota-and-plan)), and is never done while a super admin acts as the person (`not-impersonating`, 403
`auth.impersonation_forbidden`): it brings many clients in at once and spends the plan's places.
The dashboard's screens for it are in [Importing clients](#importing-clients).

### The file

`POST /clients/imports` (multipart, the file in `file`; `clients.import`, `clients_import`, the `clients-import` limiter)
uploads it:

- **Format.** A CSV of at most `clients.import.max_bytes` (5 MB), named `.csv` or `.txt` (no type is asked of it: what a
  server guesses of a CSV's type varies with its content; what it holds is read below). A larger file, or one PHP refused
  for its size (over `upload_max_filesize`, or a form's `MAX_FILE_SIZE`), is 422 `clients.import_too_large` with
  `meta.maxBytes`, the lower of the two limits (Support's `UploadSize`), its message in KB under a megabyte and in MB from
  one. A request whose whole body is over PHP's `post_max_size` never reaches the import: Laravel refuses it first
  (`ValidatePostSize`) with 413 `http.error`, so keep `post_max_size` a little above the limit (see
  [Production](../configuration/production.md)). Its first row names the columns:
  none blank, none twice (whatever their case), none longer than 100 characters (`CsvFile::HEADER_LENGTH`: the headers are
  kept with the import). Blank headers at the end of the row (Excel writes `Nombre;Correo;;` when cells to the right were
  ever touched) are left out with their columns, when every row is blank under them too. Every other row is a client; blank
  lines are left out, and each row keeps
  the number of the line it starts on in the file (a line break inside quotes counts), the number the preview and the report
  give. A value in quotes may hold the separator and line breaks. Every header and value is trimmed as a request's strings
  are (Laravel's `TrimStrings`: spaces, tabs, line breaks and invisible characters at either end).
- **Encoding.** UTF-8, with a byte order mark or without (the mark is taken off first). A file that is not valid UTF-8 is
  read as Windows-1252, what Excel in Spanish saves, and converted. A file with a NUL byte is not text.
- **Line endings.** A line feed, a carriage return and a line feed (Windows), or a carriage return alone (a classic Mac):
  a file with no line feed at all has its carriage returns read as line feeds.
- **Separator.** A comma, a semicolon (what Excel saves where the comma is the decimal mark) or a tab: the one the first
  line holds most.
- **Rows.** At most `clients.import.max_rows` (5000). Reading stops at the first row past it, so a file of many short rows is
  refused without being held in memory.
- **Columns.** A row, the headers' included, has at most `clients.import.max_columns` (100) columns: a wider one is refused
  before it is split into values (a separator inside quotes does not count), so a line of millions of separators never
  takes the server's memory. A row with more values than the headers is read by its headers; the rest is left out.
- **Where it goes.** The file, as it came (it is read again the same way each time: as it came it takes at most
  `clients.import.max_bytes`, where converted to UTF-8 it could take three times that), goes to the asset disk
  (`Support\Storage\AssetDisk`) at `AssetPath::forTenant($tenantId, 'client-imports', 'enc')`, **encrypted with the app key**
  (`Imports\ImportFile`, the only class that writes, reads or deletes it, with Laravel's encrypter): the asset disk serves a
  workspace's files publicly, so whoever came by the key would read nothing. Its key is never answered. A file that no
  longer decrypts (changed in the bucket, or kept under an app key the app no longer has: rotate `APP_KEY` with the old one
  in `APP_PREVIOUS_KEYS` until the uploads of the day before are gone) is 422 `clients.import_invalid_file`, never its bytes.
  It stays until the import ends, or `clients.import.upload_ttl_hours` (24) for an upload never run. The database keeps its
  name (without folders, control or invisible characters and line breaks, trimmed, up to 190 characters; `clients.csv`
  when nothing is left of it), its size, its headers and how many rows it has: never a value of a row.
- **Memory.** The largest file (5 MB of Windows-1252, every character three bytes in UTF-8) takes about 70 MB above what
  the app itself takes to upload, and about 55 MB to preview it or run a part of it (the file is decrypted and read in
  memory, never into a temporary file a killed worker would leave behind): PHP's default `memory_limit` (128M) is
  enough. If you raise `clients.import.max_bytes`, raise `memory_limit` with it (see
  [Production](../configuration/production.md)).
- **The answer** (201) is the import, plus `guess`, the suggested mapping, and `sample`, the first
  `clients.import.sample_rows` (5) rows as lists of values in the order of the headers. Neither is kept: `GET` does not
  answer them, so the page keeps them while the person maps the columns.

```json
{
  "data": {
    "id": "0193…", "status": "uploaded", "fileName": "clientes.csv", "rows": 2, "headers": ["Nombre", "Correo", "Ciudad"],
    "options": null, "preview": null, "progress": {"processed": 0, "total": 2},
    "result": {"created": 0, "updated": 0, "skipped": 0, "failed": 0}, "errors": [], "failure": null,
    "startedAt": null, "finishedAt": null, "expiresAt": "2026-11-14T18:00:00Z",
    "guess": {"name": "Nombre", "email": "Correo", "city": "Ciudad"},
    "sample": [["Ana", "ana@example.com", "Tijuana"], ["Beto", "", "Ensenada"]]
  }
}
```

**The suggested mapping** (`Imports\ColumnGuess`) is field → header. It knows each field by a few names in English and in
Spanish (`Nombre`, `Correo electrónico`, `Teléfono`, `Fecha de nacimiento`, `CP`, `Etiquetas`...) and by the names the
[export](#export) writes, so a downloaded file goes back in mapped. Names compare without case, accents or extra spaces, an
underscore as a space. A field takes the first header that names it, and a header suggests one field. The fields:
`name`, `email`, `phone`, `birthday`, `locale`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`,
`notes`, `tags` and `marketingConsent`.

**Who sees an import.** `GET /clients/imports/{import}` (`clients.import`, whatever the plan says by then) answers the
import as above, without `guess` and `sample`, with its first `clients.import.preview_errors` (100) errors by line:
`[{line, field, code, message}]`, `field` `null` for an error of the whole line, `message` in the request's language.
Only the person who uploaded it sees it: anyone else, the owner included, gets the same 404 `clients.import_not_found`
as for an id that is not there (its first rows were the uploader's to see). When the uploader leaves the workspace,
their imports stay as nobody's (`user_id` becomes `null`: `(tenant_id, user_id)` → `memberships` with
`ON DELETE SET NULL (user_id)`), so nobody sees them, and the row is still there to find and delete the file. A page
follows a running import by asking it again (every 2 seconds is enough).

| Route | Takes | Does |
| ----- | ----- | ---- |
| `POST /clients/imports` | `clients.import`, `clients_import`, the `clients-import` limiter, no impersonation | uploads a CSV; 201 with the import, `guess` and `sample` |
| `GET /clients/imports/{import}` | `clients.import`, the uploader only | the import, its progress, its result and its first errors |

| Error | When |
| ----- | ---- |
| 422 validation on `file` | no file, or not named `.csv`/`.txt` |
| 422 `clients.import_too_large` on `file` (`meta.maxBytes`) | more than `clients.import.max_bytes`, or more than PHP's `upload_max_filesize` |
| 413 `http.error` | a request body over PHP's `post_max_size` |
| 422 `clients.import_invalid_file` on `file` | not text, a first row that does not name every column once, a header over 100 characters, a row of more columns than `clients.import.max_columns`, or no clients under it (the message says which) |
| 422 `clients.import_too_many_rows` on `file` (`meta.limit`) | more rows than an import takes |
| 404 `clients.import_not_found` | no import of the person has that id |
| 403 `auth.forbidden` | no `clients.import` |
| 403 `plans.feature_not_included` | uploading, on a plan without `clients_import` |
| 403 `auth.impersonation_forbidden` | uploading, during an impersonation |
| 429 `http.too_many_requests` | more uploads in an hour than `clients.import.uploads_per_hour` (10); a refused one counts |

### Columns and preview

`POST /clients/imports/{import}/preview` (`clients.import`, `clients_import`, the `clients-import-steps` limiter, no
impersonation; only
the uploader: anyone else gets 404 `clients.import_not_found`) checks **every line** of the file with what the person
chose, and answers what would happen. It keeps the choice and the counts on the import, and may be asked again with another
choice until the import runs; once it started (queued, running or done), or once the upload is past its `expiresAt`
(`clients:prune-imports` may be forgetting it), 409 `clients.import_wrong_state`.

```json
{
  "mapping": {"name": "Nombre", "email": "Correo", "phone": "Teléfono", "birthday": "Nacimiento", "tags": "Etiquetas"},
  "dedupe": "skip",
  "phonePrefix": "+52",
  "homeBranchId": "0193…",
  "tagIds": ["0193…"]
}
```

| Field | Takes |
| ----- | ----- |
| `mapping` | field → header, required. The fields are `name` (required), `email`, `phone`, `birthday`, `locale`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `notes`, `tags` and `marketingConsent` (`Imports\RowCheck::FIELDS`); each header one the file has, exactly as it is written, for one field at most. Otherwise 422 `clients.import_mapping_invalid` on `mapping` |
| `dedupe` | `skip` (the default) or `fill`, for a line whose client is already there (below) |
| `phonePrefix` | the country code (`+52`) of phones written without one; none: such a phone is an error |
| `homeBranchId` | the home branch of every client it brings: an active branch the person may see (`clients.branch_not_allowed` otherwise), `null` for none; left out, the branch of the top bar when it is on one, else none |
| `tagIds` | tags of the catalog every client it brings gets, besides the line's own (`clients.tag_not_found` for one that is not) |

**How a line is read** (`Imports\RowCheck`), by the rules of a new client (`ClientRules::of(creating: true)`), so what the
import takes is what the API takes:

- An empty cell is no value. The email is kept in lowercase, the country in capitals.
- **Phones** (`Imports\ImportPhone`) lose spaces, dashes, dots and parentheses; `00` is `+`; one without `+` takes
  `phonePrefix`, its trunk zero dropped (`07700 900123` with `+44` is `+447700900123`). One that is still no E.164 phone is
  `clients.import_phone`.
- **Dates** are ISO (`1990-04-12`) or day first, with `/`, `-` or `.` (`12/04/1990`, `3.7.1985`): `04/12/1990` is the 4th
  of December. A date that does not exist (`31/02/1990`, or a month first past the 12th) is an error.
- **Tags**: a cell of names separated by commas or semicolons, each once whatever its case. A name over 40 characters or
  with characters a tag cannot have is `clients.import_tag`; a line whose tags, with `tagIds`, are more than a client may
  carry (`clients.tags_per_client`) is `clients.too_many_tags`.
- **Marketing consent** is given by `sí`, `si`, `yes`, `y`, `true`, `1` or `x` (any case); anything else, or no column, is
  no consent. That "yes" is the business's to answer for.

**Who a line is.** A fit line is matched against the workspace's live clients by email, then phone (a thousand emails or
phones a query, so a query never takes more values than Postgres allows; one that breaks is reported as
`Imports\ImportLookupFailed`, with its class and SQLSTATE, never the values it asked about):

- an email or a phone of an earlier line of the file is an error, `clients.import_duplicate_in_file`: the first line is
  the client;
- an email of one client and a phone of another is an error, `clients.import_conflicting_match`, when the person sees both;
- a client already there is **skipped** with `skip`; with `fill`, it is **filled**: the run fills what it lacks and adds the
  line's tags, never overwriting a value;
- anyone else is **new**.

A client the person does not see (its home branch is not theirs) is as if it were not there: a line that is only such a
client is **new**, and a line whose email and phone are one client the person sees and one they do not is that first
client's. The preview says of it what it says of a new client, in its counts, its `newTags` and its errors, so no line of
the file tells a client out of sight apart. When the import runs, the unique indexes refuse the new client, and the line
is skipped, never brought nor filled, with no error of its own (see [Running it](#running-it)).

**The answer** is the import (as `GET`, with the choice in `options`, the branch resolved) and `preview`:

```json
{
  "preview": {
    "rows": 6, "new": 1, "fill": 0, "skip": 2, "invalid": 3, "newTags": ["Nueva"],
    "errors": [{"line": 4, "field": "name", "code": "validation.required", "message": "The name is missing."}]
  }
}
```

`newTags` are the tags the new and filled lines name (a skipped line gives none) and the catalog lacks (the run adds
them); more than the catalog has room for
(`clients.tags_max`) is 422 `clients.tags_full`. `errors` are the first `clients.import.preview_errors` (100), by line, each
with its `field` (`null` for the whole line), its `code` (`validation.<rule>` for a value a client may not have, or
`clients.import_*`) and its `message` in the request's language: **never a value of the line**. The message names the
field with its article (`lang/*/imports.php`, `fields`: "El correo no es válido.", "Hay demasiados caracteres en las
notas."), and is written so no word has to agree with the field's gender or number. A line with errors counts
once in `invalid`. The import keeps the choice and the counts, and the names in `newTags`; not the errors: `GET` answers
`preview.errors` empty until the run keeps its own.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `POST /clients/imports/{import}/preview` | `clients.import`, `clients_import`, the `clients-import-steps` limiter, no impersonation, the uploader only | checks every line with the choice, keeps the choice and the counts |

| Error | When |
| ----- | ---- |
| 422 validation on the field | `mapping` missing or not a list of headers by field, `dedupe` not `skip`/`fill`, `phonePrefix` not `+` and 1 to 4 digits, `homeBranchId` or a `tagIds` entry not an id |
| 422 `clients.import_mapping_invalid` on `mapping` | no column for the name, a field that is not one, a header the file does not have, or one header for two fields |
| 422 `clients.branch_not_allowed` on `homeBranchId` | a branch the person may not choose |
| 422 `clients.tag_not_found` on `tagIds` | a tag the catalog does not have |
| 422 `clients.tags_full` (`meta.limit`) | the new tags do not fit in the catalog |
| 422 `clients.import_invalid_file` on `file` | the kept file is gone, or no longer decrypts |
| 409 `clients.import_wrong_state` | the import already started, or the upload is past its `expiresAt` |
| 404 `clients.import_not_found` | no import of the person has that id |
| 403 `auth.forbidden`, `plans.feature_not_included`, `auth.impersonation_forbidden` | as for the upload |
| 429 `http.too_many_requests` | more previews and runs in a minute than `clients.import.steps_per_minute` (6) |

### Running it

`POST /clients/imports/{import}/run` (no body; `clients.import`, `clients_import`, the `clients-import-steps` limiter, no
impersonation;
only the uploader: anyone else gets 404 `clients.import_not_found`) queues an import whose preview was seen. With the
import's row held, `Actions\RunImport`:

- refuses an import that is not `uploaded` with a preview (409 `clients.import_wrong_state`: not previewed yet, already
  run, or past its `expiresAt`: the upload is the prune's to forget);
- checks the home branch chosen in the preview again: one the person may no longer choose is 422
  `clients.branch_not_allowed` on `homeBranchId`;
- adds the tags of `preview.newTags` to the catalog (a name someone added since is taken as it is; a full catalog is 422
  `clients.tags_full`) and empties `newTags`: the import keeps no names it no longer needs;
- asks the plan for room for the new clients the preview foresaw (`preview.new`), in a transaction that creates none:
  422 `plans.quota_exceeded` before anything is queued, and the tags it added are undone. The job asks again for each part.
  The catalog comes before the quota, as in every part and in a new client: whatever takes both takes them in that order,
  so a rename of a tag never waits for an import that waits for it;
- moves the import to `queued`, audits `clients.import.started` (`{rows, fields, dedupe, homeBranchId, tagIds}`: the
  fields mapped, never the headers) and queues `Jobs\ProcessClientImport` once the transaction commits.

It answers 200 with the import (as `GET`, `status` `queued`). The page follows it with `GET /clients/imports/{import}`.

**The job** (`ProcessClientImport`) runs **one part** of the import, `clients.import.chunk` (200) lines, and queues the
job of the next part once its own commits, so no job grows with the file: a part takes a second or two, even with the
database a few milliseconds away. A job carries the import's id and the line its part starts from: the workspace travels
with it (Tenancy's job scope), the file is read from where the import keeps it (`ImportFile`), never from the payload.
Each is tried once and stopped after `clients.import.timeout_seconds` (80, below the queue's `retry_after`; see
[Queues](../configuration/queues-and-scheduler.md)): a second run of a part would import what the first did, and the
import refuses it anyway (only a `queued` import starts, moving to `running` at once, and a part runs only when the
import's progress is where it starts, checked with the import's row held). It works **as the person who ran it**: the
trail names them as the actor of every entry, although no request is signed in.

Each job reads the file again, and the lines of the earlier parts only for their emails and phones (never against the
workspace), so a client twice in the file is found across parts as the preview found it. Those lines are checked again as
the workspace is now: a tag of the catalog deleted or renamed between two parts can change whether an earlier line was
fit, and so whether a later line with its email or phone counts as twice in the file (it fails as such) or matches the
client the earlier line brought, a corner the kit accepts. Its part runs **in a transaction of its own**:

1. The import's row is held; an import no longer `running`, or whose uploader left the workspace, stops there, and so
   does a job whose part another one already ran. The home branch chosen must still be one the uploader may choose (active,
   theirs to see): otherwise the import ends `failed` before the part writes anything, with one error on the part's first
   line (`clients.branch_not_allowed` on `homeBranchId`), rather than bring clients into a branch the person can no longer
   choose, or without the branch they chose. The parts already written stay.
2. The part's lines are checked again (`RowCheck`, as in the preview, against the workspace as it is now): a client added
   since the preview is matched, one deleted since is new, and one the person does not see (or no longer sees) is new, as
   in the preview: its line is refused by the unique index below and skipped, never filled.
3. The clients it fills are held (`FOR UPDATE`, by id), then the tags it gives (`FOR SHARE`), then the plan is asked for
   room for the part's new clients, **under the quota's lock until the part commits** (`EnforcesQuotas`). A client held
   that no longer has the line's email or phone (changed since the line was matched) is skipped. Without room,
   the new lines of this part and of every later one fail with `plans.quota_exceeded` (no field), even when the plan has
   room again later (the import keeps that it had none, `quota_reached`), while the lines that fill or skip go on: the
   import still ends `finished`, and its result says how many could not come.
4. Each line runs in a savepoint of its own, so one the database refuses never undoes the part:
   - **new**: a client with source `import`, the home branch chosen, the line's tags and the tags chosen for all;
   - **fill**: the client already there gets what it lacks (never its name, never a value it has), the chosen home branch
     when it has none, and the tags, added to its own;
   - **skip** and lines with errors: nothing.

   Someone who took the line's email or phone after its check (the unique index catches it) makes it a client already
   there: skipped, or filled with `fill` when the person sees that client and nobody else holds it (it is held after the
   quota's lock, so it is not waited for: `SKIP LOCKED`, and the line is skipped). A line that would give a client more
   tags than it may carry fails with `clients.too_many_tags` on `tags`; a line whose home branch was deleted while it
   ran fails with `clients.branch_not_allowed` on `homeBranchId`. Either undoes that line whole.
5. The counts and `processed` are written, so `GET` shows the progress part by part.

**Consent.** A new client starts without marketing consent. Only when a column is mapped to `marketingConsent` and the line
says yes does it get consent, with source `import` and the moment of the import. A client already there gets it only when it
never chose (no `marketing_consent_at`): a file never takes back or overrides a choice the client made.

**What it keeps.** The errors of the lines, as line, field and code (`client_import_errors`), up to
`clients.import.errors_kept` (1000) per import, while `failed` counts them all: never a value of a line. The trail keeps,
for each client it brings, `clients.client.created` with `source: "import"`, its tags and the names of the fields it filled;
for each client it fills, the entries a change from the dashboard writes (`clients.client.updated` with the names of the
fields, `clients.client.consent_changed`, `clients.client.tags_updated`); and one `clients.import.finished`
(`{status, created, updated, skipped, failed}`). Each new client sends `Events\ClientCreated`.

**When it ends** it is `finished`, with `finishedAt`; its file is deleted (when the bucket refuses, the key stays for
`clients:prune-imports` to try again, and the failure is reported with addresses masked); `headers` become `[]` and
`options.mapping` gives way to `options.fields`, the fields it read (a file without a row of headers has a client in its
headers). Then, after the commit, `Events\ClientImportFinished` (`tenantId`, `importId`, `userId`, `status`, ids in
lowercase): the notice to the person (`clients.import_finished`) hangs from it.

```json
{
  "data": {
    "id": "0193…", "status": "finished", "fileName": "clientes.csv", "rows": 3, "headers": [],
    "options": {"fields": ["name", "email", "city"], "dedupe": "fill", "phonePrefix": null, "homeBranchId": null, "tagIds": []},
    "preview": {"rows": 3, "new": 1, "fill": 1, "skip": 0, "invalid": 1, "newTags": [], "errors": []},
    "progress": {"processed": 3, "total": 3},
    "result": {"created": 1, "updated": 1, "skipped": 0, "failed": 1},
    "errors": [{"line": 4, "field": "name", "code": "validation.required", "message": "The name is missing."}], "failure": null,
    "startedAt": "2026-11-13T18:00:01Z", "finishedAt": "2026-11-13T18:00:02Z", "expiresAt": "2026-11-14T18:00:00Z"
  }
}
```

**When it fails.** An error that breaks the work (the file gone or no longer decrypting, the database) ends the import as
`failed`: its file deleted, its headers and mapping cleared as above, `clients.import.finished` with `status: "failed"`, and
`ClientImportFinished` with `failed`. The parts already written stay: `result` and `progress` say how far it went. The
failure is reported (Sentry, the logs, `failed_jobs`) as `Imports\ImportCrashed`, which names the import, the failure's
class (and SQLSTATE), file and line, never its message: a database error carries the values of the line it was writing; a failure to end
the import is reported the same way (and `clients:prune-imports` ends it later). A job the worker gives up on (its timeout)
ends the import the same way, even in the middle of a part: the job undoes the part's open transaction first (back to where
the job started), so the import's end is committed before the worker kills the process, and the part is undone whole.

A job ends the import only while the import is at **its** part: `queued` for the first part, or `running` with its
progress where the part starts, checked with the import's row held. A job that fails late or twice for a part that
committed (a worker killed after its part committed: the queue hands the job again once `retry_after` passes, past its
tries, while the next part runs; or a second copy of a part that breaks) leaves the import going, and queues the job of
the part its progress reached (a copy queued twice runs once), so a worker that died between a part's commit and queuing
the next one is picked up without waiting for the prune. Such a failure is not reported: the part is someone else's, or
done, and a failure that lasts is reported by the job whose part it is. Neither is one of a job whose import already
ended (a copy of the last part that finds the file deleted).

**When its job is lost.** The queue can lose a job (Redis flushed), or a worker die with nothing left to fail it. An import
queued or running whose last progress is older than `clients.import.stuck_after_minutes` (60, far above a part's timeout)
is ended by `clients:prune-imports --stuck` (every quarter of an hour) as a failed job ends it: `failed`, its file deleted,
its headers and mapping cleared, `clients.import.finished`, and its person told. A job that comes after finds it no longer
`queued` and does nothing. So does the job of an import that waited queued for more than those 60 minutes behind a queue
that fell behind: the import failed meanwhile, and its person uploads the file again. An import ends once, whoever ends
it (its last part, its job's failure, the prune): with its row held, and only while it is still at work, so it gets one
`clients.import.finished` and one notice; and the prune ends it only while it has not moved since the prune read it.

**When a client is erased.** Every import of the workspace not ended yet ends `failed` with
`failure: "clients.import_cancelled_by_erasure"` (see [Privacy](#privacy)); `failure` is `null` for any other import, and
an import that failed of its own work says why in its `errors`, or not at all.

**When the uploader leaves.** Their imports stay as nobody's (see [The file](#the-file)). One queued or running ends
`failed` before its next part, its file deleted, with nobody to tell (no `ClientImportFinished`). One that ended, or was
never run, is forgotten by the next `clients:prune-imports`.

**When the uploader loses the permission.** A run is the uploader's decision, taken when they had `clients.import`: an
import already queued or running goes on to its end when a role change takes `clients.import` (or `clients.manage`) away
from them meanwhile. Each part asks the plan for room again, and the import ends at a home branch the person may no longer
choose, but no part asks for the permissions. They can no longer open it (`GET` needs `clients.import`) and still get its
notice. To stop it, remove the person from the workspace: their import ends before its next part.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `POST /clients/imports/{import}/run` | `clients.import`, `clients_import`, the `clients-import-steps` limiter, no impersonation, the uploader only | queues the import; 200 with it, `queued` |

| Error | When |
| ----- | ---- |
| 409 `clients.import_wrong_state` | not previewed yet, already run, or the upload is past its `expiresAt` |
| 422 `plans.quota_exceeded` | the plan has no room for the new clients the preview foresaw |
| 422 `clients.branch_not_allowed` on `homeBranchId` | the home branch chosen is no longer one the person may choose |
| 422 `clients.tags_full` (`meta.limit`) | the new tags no longer fit in the catalog |
| 404 `clients.import_not_found` | no import of the person has that id |
| 403 `auth.forbidden`, `plans.feature_not_included`, `auth.impersonation_forbidden` | as for the upload |
| 429 `http.too_many_requests` | more previews and runs in a minute than `clients.import.steps_per_minute` (6) |

Why a line was not imported, in the report (`errors[].code`): the preview's codes, plus `plans.quota_exceeded` (no field),
`clients.too_many_tags` (on `tags`, against the tags the client already carries) and `clients.branch_not_allowed` (on
`homeBranchId`: the branch was deleted while the line was written, or, on the first line of the part it stopped at, the
import ended because the branch was no longer one to choose).

### What is kept

Never a value of a line: the database holds the file's name, size and row count, its headers until the import ends, the
choice and the counts, and the errors as line, field and code. The file itself (encrypted, see [The file](#the-file)) lives
until the import ends, finished or failed (when the bucket refuses to delete it then, until the next `clients:prune-imports`
deletes it).

`clients:prune-imports` (daily at 03:40 UTC, on one server, never overlapping; see
[Queues and the scheduler](../configuration/queues-and-scheduler.md)) goes through every workspace, deleted ones too, as
the workspace, and:

- ends as failed the imports whose job was lost (see [When its job is lost](#running-it));
- forgets, with their file and their errors, the uploads never run after `clients.import.upload_ttl_hours` (24), the
  imports that ended more than `clients.import.retention_days` (30) ago, and those nobody has any more (their uploader left)
  that are not queued or running;
- deletes the file an import that ended could not delete (the bucket refused it then), keeping the import.

It holds each import (`FOR UPDATE`) and looks at it again before it touches it: an upload run since it was read, or a stuck
import that started, is left as it is. A file the bucket refuses to delete keeps its import (and its key), to try again the
next time. With `--stuck` it only ends the imports whose job was lost: the scheduler runs it so every quarter of an hour.

An import or a workspace that fails is reported and the rest go on: an import as `Imports\ImportCrashed` (no message), a
workspace with addresses masked. It prints how many imports it forgot, ended and freed of a file.

## Notifications

Clients declares one event type (`ClientsNotificationsProvider`, tagged `notifications.event_types`), which a workspace
turns on or off and rewrites in Settings → Notifications like any other. `Listeners\NotifyImportFinished` asks for it on
`ClientImportFinished`, after the commit, through Notifications' `SendsWorkspaceNotices`: a notice that cannot be built is
reported (with the addresses masked) and never fails the import.

| Event type | Asked for on | Goes to | Says | Channels |
| ---------- | ------------ | ------- | ---- | -------- |
| `clients.import_finished` | `ClientImportFinished` | whoever ran the import (`system:importer`) alone: it is `personal`, so a workspace cannot send it to a role or another address; nobody when that person left | the workspace, the file's name, how it ended (`import.outcome`: finished, or could not finish, in every language) and the counts (`import.created`, `import.updated`, `import.skipped`, `import.failed`), with a button to `/dashboard/clients/imports/{id}`; never a client | in the app, email |

It is sent once per import (its key is the import's id) and does not count against the plan's monthly emails: the person
asked for the work. It is not sent in a workspace that is deleted or suspended: nobody there can sign in to read it.
Adding, changing or deleting a client tells nobody; a module that needs to listens to the events.

## Export

`GET /clients/export` (`clients.export`) downloads the list as a CSV file. It takes the list's parameters (`search`,
`tags[]`, `marketing`, `branch`, `trash`, `sort`), checks them the same way and keeps the same clients, the branch of the top
bar included (`Records\ClientSearch::query()`, the list's own query): what the person sees in the list, every page of it, is
what the file holds. `page` and `perPage` are ignored: the file is the whole list, streamed by its own cursor.

```
name,email,phone,birthday,locale,address_line_1,address_line_2,city,state,postal_code,country,notes,home_branch,marketing_consent,marketing_consent_at,tags,created_at
Ana López,ana@example.com,+526641234567,1990-04-12,es,Av. Revolución 1234,,Tijuana,Baja California,22000,MX,"Prefers mornings.
Allergic to latex.",Centro,yes,2026-11-12T18:00:00Z,"Arrives late, VIP",2026-11-12T18:00:00Z
```

- **The columns** (`Export\ClientCsv::HEADERS`) are the client's own, by the names the import recognizes, so a file
  downloaded goes back in as it is. `home_branch` is the branch's name (empty for none), `marketing_consent` is `yes` or
  `no`, `tags` the tags' names in alphabetical order, separated by `, `, and the times ISO 8601 in UTC. Custom fields
  are left out.
- **The file** is UTF-8 with a byte order mark (what Excel needs to read it as UTF-8), separated by commas with **every
  field in quotes** (a quote inside doubled, as RFC 4180 says; each line ends with CRLF; a line break in the notes stays
  inside its cell, as it was written), so a spreadsheet set to split by `;` never splits a value, named
  `clients-<YYYY-MM-DD>.csv` in `Content-Disposition`, and sent with `Content-Type: text/csv; charset=UTF-8` and
  `Cache-Control: no-store, private`.
- **No cell is a formula.** A cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a `'` in front
  (`Export\CsvCell`, OWASP's CSV injection), so a client named `=HYPERLINK(...)` is text when the file is opened. So does a
  cell where `;`, `,`, a tab, a carriage return or a line feed, and any spaces after it, come before `=`, `+`, `-` or `@`
  (`x;=HYPERLINK(...)`, `VIP, -10%`): a program that split the line there would start a cell with a formula. An E.164
  phone (`+` and digits) is left as it is: it runs nothing.
- **Size.** It holds at most `clients.export_max_rows` (50 000) rows. The rows are counted first: more is 422
  `clients.export_too_large` (`meta.limit`), before anything is sent; narrow the list with the search or the filters.
- **Streamed.** Nothing is stored: the rows are read 500 at a time while the file is sent, each page after the last row of
  the one before by the order's own columns (never an offset), with its tags in one query and each home branch's name read
  once per download. Memory and queries grow with the pages, not with the rows. The rows go out after the request's
  middleware has let go of the workspace, so each page is read as the workspace again (`RunAsTenant`). A client added after
  the count never makes the file longer than the limit. An error once the file has started cuts it short: the status is
  already sent, so the file ends after the last row written and the error is reported without its message (the query's
  holds the words searched: `Records\ValuesFreeFailure`), never written into the file.
- **Audited** as `clients.list.exported` (resource `ClientList`, id `csv`) with `{rows}`, how many rows it held, and the
  person who downloaded it. How the list was narrowed is not kept: the words searched may name someone.
- **Limited** by the `clients-export` limiter: `clients.exports_per_hour` (5) downloads per member an hour, then 429
  `http.too_many_requests`. Every request that gets past the permission counts, a refused one (a 422) included.
- **Never during an impersonation** (`not-impersonating`): it writes nothing, but it takes the workspace's clients out
  of it (403 `auth.impersonation_forbidden`).

It is the only answer of the package that is no envelope; every refusal is one (a JSON `{data, meta, errors}`, whatever the
request accepts). A frontend should download it as a `Blob` (not through the JSON envelope) and name the file itself:
`Content-Disposition` is not among the headers a browser lets the page read across origins.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /clients/export` | `clients.export`, the `clients-export` limiter, no impersonation | the list as a CSV file |

| Error | When |
| ----- | ---- |
| 422 validation on the parameter | a parameter breaks the list's rule |
| 422 `clients.branch_not_allowed` on `branch` | a branch the person may not see |
| 422 `clients.export_too_large` (`meta.limit`) | the list has more clients than one file may hold |
| 403 `auth.forbidden` | no `clients.export`; or the trash, to someone who does not manage clients (`meta.requiredPermission: "clients.manage"`) |
| 403 `auth.impersonation_forbidden` | a super admin acting as the person |
| 429 `http.too_many_requests` | more downloads in an hour than the limiter allows |

## Tags

A workspace labels its clients with tags of its own ("VIP", "Allergies"). Tags belong to the whole workspace and follow no
branch: everyone who sees clients sees the same catalog. How many clients carry each one counts only the clients the person
sees (every branch they may see, and the clients of none), and only someone who sees every branch (or anyone, in a workspace
that does not work by branch) may change or delete a tag: a tag changed or deleted changes the clients of every branch that
carry it. Anyone with `clients.manage` may add one.

### The catalog

`client_tags` (row-level security with `FORCE`) keeps the workspace's tags: a name of 1 to 40 characters, one line of plain
text (`PlainName`, spaces squished), unique in the workspace whatever its case (an index on `(tenant_id, lower(name))`), and
a color. A workspace has at most `clients.tags_max` (200) tags: adding one takes a lock of the workspace's catalog, so two at
once do not pass the cap together. Every change is audited (`clients.tag.created`, `.updated`, `.deleted`, resource
`ClientTag`, with the name and the color before and after: a tag is no person's data).

**The color is one of mood-ui's `Badge` colors:** `default`, `primary`, `success`, `warning` or `danger` (`default` when left
out). A `CHECK` on the column holds the same list as `ClientTag::COLORS` and the frontend. A free hex color would not follow
the tenant's theme or dark mode, and could be unreadable on the badge's background; the Badge's colors do both.

`client_tag_links` keeps which client carries which tag. It hangs from the client by `(tenant_id, client_id)` and from the
tag by `(tenant_id, tag_id)`, both cascading: deleting a tag takes it off every client that carried it, and no workspace can
put another's tag on its clients. A client carries at most `clients.tags_per_client` (20) tags; `Tags\TagSet` is the only
writer of the links and enforces it. Only a change that adds tags past the cap is refused: a client that carries more since
the cap was lowered keeps its tags, and may lose some, until it is back under it.

| Error | When |
| ----- | ---- |
| 422 `clients.tag_taken` on `name` | another tag of the workspace has that name, whatever its case |
| 422 `clients.tags_full` (`meta.limit`) | the catalog is full |
| 403 `clients.tag_needs_all_branches` | changing or deleting a tag, by someone who does not see every branch (whether a client out of their sight carries it or not, so the refusal tells nothing of them) |
| 404 `clients.tag_not_found` | no tag of the workspace has that id (another workspace's, or not an id) |
| 422 `clients.tag_not_found` on the field | a list of tag ids in a body names one the workspace does not have |
| 422 `clients.too_many_tags` on the field (`meta.limit`) | a client's tags would grow past the cap |

### Tagging clients

A client's tags change with the client (`tagIds` on `POST /clients` and `PATCH /clients/{client}`), by themselves for one
client, or for many at once:

- **One client** (`PUT /clients/{client}/tags {tagIds}`): `tagIds` (present, possibly empty: an empty list takes every tag
  away) becomes the client's tags. The client opens by the rule of one client (no home branch, or one the person may see;
  otherwise 404 `clients.not_found`) and its row is held while it changes. Answers the client, as `GET /clients/{client}`.
- **Many at once** (`POST /clients/tags/apply {clientIds, add, remove}`): adds the tags of `add` to every client of
  `clientIds` and takes those of `remove` away (a tag in both is taken away). `clientIds` names 1 to `clients.bulk_max` (500)
  clients; `add` and `remove` are lists of tag ids, at least one of them not empty. All or nothing: every client must be live
  and seen by the rule of one client, whatever branch the top bar is on; one in the trash, erased, another workspace's, not
  there or out of sight is 422 `clients.selection_changed` on `clientIds`, and nothing changes. The selection is checked in
  one query (the rule of one client, as a set), so a client out of sight is never held. The rows are held in the order of
  their ids, so two changes of the same clients take turns. A client whose tags would grow past the cap
  stops the whole change (422 `clients.too_many_tags` on `add`). Answers `{changed}`, how many clients changed.

Either way the tags named are held (`FOR SHARE`) until the change commits: a tag deleted at the same moment either waits and
then takes the new links away with it, or goes first and the change is 422 `clients.tag_not_found`, never a link to a tag
that is gone. Each client whose tags changed has its own entry `clients.client.tags_updated` (the tag ids before and after,
and the client's home branch as the entry's branch); one that did not change has none.

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | one client: no client the person may see has that id |
| 422 validation on the field | a list breaks its rule (`clientIds` empty or over the cap, an id that is no id or named twice; `add` when both lists are empty) |
| 422 `clients.selection_changed` on `clientIds` | many: a client of the selection is not live or not in the person's sight |
| 422 `clients.tag_not_found` on `tagIds`, `add` or `remove` | a tag the workspace does not have |
| 422 `clients.too_many_tags` on `tagIds` or `add` (`meta.limit`) | a client's tags would grow past the cap |

### Who changes them

Reading the catalog takes `clients.view`; adding, changing and deleting a tag, and tagging clients, `clients.manage` and the
`clients` limiter. A super admin acting as someone may add and change tags and tag clients, one or many (support may need to
fix them), and the trail names the admin (`impersonator_user_id`); deleting a tag is a `DELETE`, which an impersonation
never does.

### Tag routes

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /clients/tags` | `clients.view` | the catalog by name: `[{id, name, color, clients}]`, `clients` being how many live clients carry it among those the person sees |
| `POST /clients/tags` | `clients.manage`, `clients` | `{name, color?}`: adds one; 201 with `{id, name, color, clients}` |
| `PATCH /clients/tags/{tag}` | `clients.manage`, `clients`, every branch | `{name, color?}`: renames it and changes its color (left out: it keeps its own); `{id, name, color, clients}` |
| `DELETE /clients/tags/{tag}` | `clients.manage`, `clients`, every branch (and `GuardImpersonation`) | deletes it, and takes it off every client; `data: null` |
| `PUT /clients/{client}/tags` | `clients.manage`, `clients` | `{tagIds}`: the client's tags from now on; the client |
| `POST /clients/tags/apply` | `clients.manage`, `clients` | `{clientIds, add?, remove?}`: tags many clients at once; `{changed}` |

## Custom fields

A module keeps fields of its own on every client of a workspace (a spa's skin type, a gym's membership number) by
declaring them; the kit declares none. A workspace cannot create its own from a screen: the fields are code, with their
labels translated like the rest of the module.

A provider implements `Contracts\ClientFieldProvider` and is tagged `clients.fields` in the module's service provider:

```php
$this->app->tag([SpaClientFields::class], 'clients.fields');
```

```php
final class SpaClientFields implements ClientFieldProvider
{
    public function clientFields(): array
    {
        return [
            new ClientField('spa.skin', 'spa::clients.skin', ClientField::CHOICE, ['dry' => 'spa::clients.skin_dry', 'oily' => 'spa::clients.skin_oily'], order: 10),
            new ClientField('spa.visits', 'spa::clients.visits', ClientField::NUMBER, order: 20),
        ];
    }
}
```

Each `ClientField` has:

- **a key**, `<module>.<field>` in snake case (`spa.skin`), unique among every installed package;
- **a label**, a translation key, named in the language of the request;
- **a type**, which fixes the JSON type of its value: `text` (a string, one line of plain text, `PlainName`, up to 500
  characters), `number` (a JSON number between -10^12 and 10^12, never the string `"3"`), `date` (a `Y-m-d` string),
  `boolean` (`true` or `false`, never `1` or `"1"`) or `choice` (one of its values, as a string);
- **its choices**, value => label key, for a `choice` and only for one;
- **an order**: the fields are drawn by it, then by key.

`Fields\ClientFields` (a singleton) gathers them on first use and checks every declaration: a key that is not
`<module>.<field>`, the same key twice, a type nobody knows, or a choice with no choices (or another type with some) throws
an `InvalidArgumentException`, so a mistake fails loudly in code.

**Kept and checked.** The values live in the client's `custom` (jsonb), keyed by the field's key. A body that writes a
client may send `custom`, an object of the fields it changes: `ClientFields::rules()` checks each by its type, a key no
package declares (or a list) is 422 on `custom` (`clients::validation.custom_unknown`), and a field's error comes on
`custom.<key>` (`custom.spa.visits`). `null` takes a field away.

**Drawn.** The client's page draws them in the "More details" card, with the control of each type.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /clients/fields` | `clients.view` | the declared fields in their order: `[{key, label, type, choices: [{value, label}]}]` (`choices` empty but for a `choice`) |
| `GET /clients/options` | `clients.view` | what else a client's form offers: `{countries, locales}`, the ISO 3166-1 codes a client's `country` may take and the app's languages (`support.locales`) its `locale` may take |

## Client portal

A workspace's clients can sign in to a portal of their own, on the workspace's address, to see and change their details.

### Opening it

The portal is closed until all three say so:

- **the plan:** it includes the feature `clients_portal` (see [Quota and plan](#quota-and-plan));
- **the deployment:** where the portal asks for a captcha (`clients.portal.require_captcha`, on in production unless
  `CLIENTS_PORTAL_REQUIRE_CAPTCHA` says otherwise), a captcha driver that checks one (`AUTH_CAPTCHA_DRIVER=turnstile`). With
  the `null` driver, which checks nothing, the portal is unavailable in every workspace rather than open with no captcha
  (`Portal\PortalCaptcha::available()`); Settings → Client portal says so (the group's meta `captchaMissing`, from
  `Portal\PortalSettingsMeta`). See [Captcha](../configuration/captcha.md#clients_portal_require_captcha);
- **the workspace:** someone who holds `clients.manage` opens it in Settings → Client portal. That is the settings group
  `client_portal` (`ClientsSettingsProvider`, tagged `settings.groups`, order 60) with one key, `enabled`: `false` until
  changed, and only `true` or `false` (`boolean:strict`). Whoever holds `clients.view` and `settings.view` sees the group;
  changing it takes `clients.manage` instead of `settings.edit` (with `clients.view` and `settings.view`, as seeing it
  does).

`Portal\PortalGate::open($tenantId)` is the three together; ask it as the workspace (it reads the current workspace's
setting). Opening the portal on a plan without it does nothing until the plan includes it, and a plan that drops it closes
the portal whatever the setting says.

`GET /portal` is public (`tenant` alone, the `portal-public` limiter, per address): what the sign-in page asks first. It
tells anyone on the workspace's address whether the portal is open and the workspace's name, and nothing else:

```json
{ "data": { "open": true, "workspace": "Alpha" }, "meta": {}, "errors": [] }
```

**What it needs from the deployment.** What this section and the next promise holds only with:

- **a real queue** (`QUEUE_CONNECTION=redis` and a worker, see [Queues](../configuration/queues-and-scheduler.md)). With
  `sync`, `DeliverPortalCode` runs inside `POST /portal/code`: the lookup and the mail happen in the request, so how long
  the answer takes tells whether an email is a client's, and a mail that fails is a 500 instead of the same 202;
- **a real mailer** (`MAIL_MAILER` set to a sender, see [Mail](../configuration/mail.md)). With `log`, every code is
  written to the application's log, and whoever reads the log can sign in as the client.

### Signing in

A client signs in with an eight-digit code mailed to their email. There is no sign-up: an email that is no live client's
(none, in the trash, or erased) never gets a code.

`POST /portal/code` asks for one, with `{ "email": "...", "captchaToken": "..." }` in a JSON body (anything in the query
string is ignored). It is public (`tenant` alone), never cached nor sent as a referrer, and limited per address by the
`portal-code` limiter, which counts every request. It:

1. checks the captcha before anything else, by the portal's own setting (`clients.portal.require_captcha`,
   `CLIENTS_PORTAL_REQUIRE_CAPTCHA`, `Portal\PortalCaptcha`; Signup's never turns it off, see
   [Captcha](../configuration/captcha.md#clients_portal_require_captcha)): where a captcha is required, a missing token, or
   any token while the driver checks nothing, is 422 `auth.captcha_failed`;
2. counts the email (`Portal\PortalLimits`), only now: per workspace and by the email's HMAC, so the cache never holds
   an address someone typed. A request refused before (its captcha, its email) counts for nothing, so nobody locks a
   client out without solving a captcha each time (where a captcha is required), and asking in one workspace never uses
   up another's. Over
   `codes_per_email_per_hour` (5), or `codes_per_email_per_day` (10), 429 `http.too_many_requests`, as for any email. The
   day's cap is here, behind the captcha, so a guesser who waits out the hours still gets few codes, and few guesses, a day.
   The whole workspace is counted too, whatever the email: over `codes_per_workspace_per_hour` (200) every ask in it is 429
   until the hour is over (see [Guessing at many clients](#guessing-at-many-clients));
3. queues `Portal\Jobs\DeliverPortalCode` with the email, encrypted, and answers 202 with `data: null`. Nothing about the
   email is looked up in the request, so the answer, and how long it takes, is the same for any email, and for a closed
   portal.

The job (`Portal\Actions\SendPortalCode`, as the workspace) does the rest: it checks the portal is open and the address is
not on the platform's suppression list (it bounced for good or complained, Notifications' `Contracts\SuppressedAddresses`:
nothing goes to it, and the request already answered the same 202), looks the email up among the workspace's live clients
and, for one of them, makes the code with `random_int`, keeps only its HMAC
(`Portal\PortalCodes`, keyed by `APP_KEY`, with a prefix of its own and bound to the email, so the same digits never match
for another email) and mails it from the same run, so the code never sits in a queue payload or a failed job. It mails
while it holds the email's code, so two asks at once send one. For anyone else it writes nothing and mails nothing. The
email (`PortalCodeMail`) is in the client's language, or the workspace's when they have none, and names the workspace; it
is the package's own email, not a notification of [Notifications](notifications.md): its text is not editable, and the
delivery log never keeps it (it would keep the code, and offer to resend it). So it counts for no `email_sends_per_month`
either: what bounds it is a cap of its own, `clients.portal.mails_per_workspace_per_day` (500), counted by the job only when a
mail is to go (`Portal\PortalLimits::mail()`). Past it the job mails nothing more that day, and the first refusal of the day
is reported as `Portal\PortalLimitReached`. An address that bounces for good or complains is still suppressed for the whole
platform: the bounce webhook suppresses the address it reports whatever the delivery (see
[Suppressions](notifications.md#suppressions)), and SES's configuration set (`AWS_SES_CONFIGURATION_SET`) is the mailer's,
so it covers this email too; only the marking of a delivery, which this email has none of, is skipped. A failure is reported without the email (the lookup's as a
`ValuesFreeFailure`, the mail's masked) and retried twice, 10 and 60 seconds later, with a new code.

One code waits per workspace and email. While it lives, asking again replaces it with a new one only
`clients.portal.resend_after_seconds` (60) after the last send, and at most `clients.portal.max_sends` (3) sends in all;
before that, or after, the request answers the same 202 and nothing goes. A new code lives
`clients.portal.code_ttl_minutes` (10) from its send and keeps the wrong tries of the one it replaces: while a code lives,
asking again never buys more guesses. Once a code expired it is over: the next one starts afresh, at its first send and no
wrong tries, so a client is never locked out until the nightly clean-up. So what bounds the guesses at one email is
`codes_per_email_per_day` × `max_attempts`: at most 10 codes a day, 5 wrong tries each, 50 guesses a day. Asking needs a
[queue worker](../configuration/queues-and-scheduler.md).

`POST /portal/session` signs in with the code, with `{ "email": "...", "code": "12345678" }` in a JSON body (anything in
the query string is ignored). It is public (`tenant` alone), never cached nor sent as a referrer (its answer holds the
token), and limited per address by the `portal-verify` limiter, which counts every request. Once the request is well
formed (an email and a code of eight digits; anything else is a 422 validation error that counts for nothing), it counts
the email (`Portal\PortalLimits`), per workspace and by the email's HMAC, from any address:
`clients.portal.verifies_per_email_per_hour` (15) tries an hour, over which it is 429 `http.too_many_requests`, as for
any email. There is no daily cap on tries (the day's is on the codes, behind the captcha): a try takes no captcha, so
someone who knows a client's email can spend those tries for them and lock the client out for an hour, a lockout they can
renew every hour for as long as they keep at it. Anyone who knows the email can also void a live code with
`clients.portal.max_attempts` (5) wrong tries; the client then asks for a new one. While the workspace has taken
`clients.portal.wrong_codes_per_workspace_per_hour` (300) codes that did not work in the hour, every try in it is 429 before
it is checked, the right code included (see [Guessing at many clients](#guessing-at-many-clients)). Then
`Portal\Actions\VerifyPortalCode`, in one transaction:

1. holds the email's code (`FOR UPDATE`), so two tries at once take turns and both count;
2. compares the code's HMAC in constant time, and computes one for an email with no live code too, so that costs the same
   (the transaction also takes an id from the start, so it commits, WAL flush included, as one with a code does);
3. counts a wrong code; the `clients.portal.max_attempts`th (5) forgets the code, so the right one no longer works either
   and only a new code does;
4. uses the right one up (it signs in once), then checks the client is still live with that email (not in the trash, not
   erased, the email not changed since) and the portal still open;
5. writes `clients.client.portal_signed_in` to the client's trail, with no actor (a client is no member) and nothing of the
   person, not even the address or browser it came from, and opens a session.

Whatever does not work (a wrong code, one run out, an email with none, a client gone, a closed portal, another workspace's
code) is the same 422 `clients.portal_code_invalid` on `code`, and what the try wrote (a wrong try, a code used up) stays;
each counts once for the workspace (`PortalLimits::wrongCode()`).
The right one answers the session's token, said this once, and when it ends at the latest:

```json
{ "data": { "token": "<session id>|<40 characters>", "expiresAt": "2026-01-08T09:00:00Z" }, "meta": {}, "errors": [] }
```

Only the SHA-256 of the token's secret is kept (`Portal\PortalSessions`, on Support's `Sessions\BearerPair`). A session
ends `clients.portal.session_minutes` (7 days) after it opened, whatever its use, and once it went
`clients.portal.idle_minutes` (2 days) unused; its last use is written down at most once a minute, by `EnsurePortalOpen`
once a request is let through (a request a closed portal turns away does not count), and it signs in only a client still
live. It keeps the browser it was opened from, cleaned and cut to 255 characters (Support's
`Sessions\UserAgent`). A token of another kind (a member's, the admin's) is in no row of `client_portal_sessions`, so it
signs no client in.

#### Guessing at many clients

The limits per email bound the guesses at one client. Someone with a list of a workspace's clients could guess at all of
them at once, each within its own limits, so the portal also bounds the workspace as a whole (`Portal\PortalLimits`, kept
under the workspace's id): `clients.portal.codes_per_workspace_per_hour` (200) codes asked for and
`clients.portal.wrong_codes_per_workspace_per_hour` (300) codes that did not work, in an hour, whatever the email and the
address. A code has eight digits (a hundred million), so 300 wrong codes an hour give about 0.007% a day of hitting any live
code of the workspace, however many clients it has.

Over either limit, every request of that kind in the workspace is 429 `http.too_many_requests` until the hour is over: the
same answer as any limit, and a client who already has a session is not touched. The first refusal of the hour is reported
(`report()`, so Sentry and the log) as `Portal\PortalLimitReached`, which names the workspace's id and the setting and
nothing of a person; the next refusals of that hour are not. The price is that whoever floods one workspace's portal shuts
its sign-in for the hour: raise the two settings for a workspace with many clients who sign in at once, and watch the
reports.

### The session

A signed-in client sends the token as a bearer token (`Authorization: Bearer <session id>|<secret>`) on every route of the
`portal` middleware group, and only there. The token is checked by the `client-portal` guard (`auth.guards.client-portal`,
an `Auth::viaRequest()` driver of its own, as Platform's `platform` guard is), which reads `client_portal_sessions` and
nothing else: a member's token (Sanctum's `<uuid>|<48 characters>`, an impersonation's included) or the admin's finds no
row there, and a client's token finds none in Sanctum's table or the admin's, so it signs nobody in on a route of the
`workspace` group (`/me`, `/clients`, `realtime/auth`...) or of the `platform` group. Anything that is not a token of the
portal's shape (another length of secret, a second `|`, an id that is no uuid) is turned away before any query, as the same
401 `auth.unauthenticated`; the id may come in any case.

The `portal` group runs, in this order whatever order a route lists them in:

1. `tenant`: the workspace, from the address or `X-Tenant-Slug`, so the session is looked up under that workspace's
   row-level security. The admin host is no workspace's (400 `tenancy.required`), and `admin` names none (404
   `tenancy.not_found`);
2. `KeepOutOfCachesAndReferrers`: no cache keeps an answer (a refusal included) and no page learns where it came from;
3. `Http\Middleware\AuthenticatePortalClient`, which asks the `client-portal` guard by name for a live session of a live
   client (401 `auth.unauthenticated` otherwise: no token, a wrong one, a session run out or left unused, signed out or
   ended, a client in the trash or erased), and checks again that the session is this workspace's (row-level security
   already hides another's: a token of another workspace's portal is 401, by header or by address);
4. `Http\Middleware\EnsurePortalOpen`: the portal is still open (`PortalGate`). A portal that closed since the client
   signed in (in Settings, or a plan that no longer includes it) is 403 `clients.portal_closed`; the session is left alone,
   and works again if the portal opens before it ends. Closing the portal pauses sessions, it does not revoke them: to end a
   client's, use "Sign out everywhere" on their page (`POST /clients/{client}/portal/sign-out`) or wait for them to expire. Signing out goes without it (`->withoutMiddleware()`): a client
   shut out of a closed portal can still end their session, so it does not come back to life when the portal opens again;
5. `throttle:portal`: the `portal` limiter, per client. It is part of the group, so a module's route of the portal is
   limited by taking the group, with nothing more to list.

The guard is **never the default** one: `AuthenticatePortalClient` asks it by name and leaves the request's default guard as
it was. So in a portal request Auth's `CurrentUser`, `auth()->id()` and the audit trail's actor (which reads the default
guard) stay null, and nothing that names a member ever names a client. The client is kept on the request's attributes while
the request runs and taken off once it is answered, never in a service's property.

A module's route reads the client through `Contracts\CurrentPortalClient`: `id()` (null outside a route of the `portal`
group, a member's request included) and `requireId()` (401 when there is none). It never takes a client's id from what the
browser sends.

`AuthenticatePortalClient` is an `AuthenticatesRequests` for the router's priority list, and `EnsurePortalOpen` sits in
that list right after authentication, so both run before any limiter. The `portal` limiter, which the group itself
takes, counts every request of a signed-in client per client (`clients.portal.requests_per_minute`, 60 a minute) on every
route of the group, a module's included, whatever the address; a refused request (no session, a closed portal) never
reaches it. It counts nothing by address: a route that takes `throttle:portal` without the group has no client, and the
limiter refuses it with 401 `auth.unauthenticated`.

A signed-in client's routes, with their middleware, limiters and answers, are listed once, in
[Portal routes](#portal-routes); what they read and change is in
[What a client sees and changes](#what-a-client-sees-and-changes). Signing out (`DELETE /portal/session`) ends the session
the request was made with, a closed portal too, and only that one: the client's others stay. Repeating it is 401
`auth.unauthenticated`, since the session is gone.

A session also ends at its end of life, after its idle time, when the team ends the client's sessions, and with the
client: in the trash, merged into another or erased, the guard no longer signs them in, and the sessions are deleted (see
[For the team](#for-the-team)). `clients:prune-portal` forgets every night the sessions and codes no request can use any
more.

### What a client sees and changes

`GET /portal/me` answers the signed-in client's account, as the workspace (`Portal\Actions\ShowPortalAccount`):

```json
{
  "data": {
    "client": {
      "name": "Ana López", "email": "ana@example.com", "phone": "+526641234567", "birthday": "1990-04-12", "locale": "es",
      "addressLine1": "Av. Revolución 1234", "addressLine2": null, "city": "Tijuana", "state": "Baja California",
      "postalCode": "22000", "country": "MX", "marketingConsent": true, "marketingConsentAt": "2026-01-02T10:00:00Z"
    },
    "workspace": { "name": "Alpha" },
    "sections": [],
    "countries": ["AD", "AE", "..."],
    "locales": ["en", "es"]
  },
  "meta": {},
  "errors": []
}
```

- **`client`** is what is the client's own: their name, how to reach them, their birthday, language and address, and their
  marketing consent with when it was last given or withdrawn (`marketingConsentAt`, ISO 8601 in UTC, `null` when they never
  chose). Never what is the business's: the notes, the tags, the home branch, the fields modules keep, where the client came
  from.
- **`workspace`** is the workspace's name; **`sections`** what modules show this client (see
  [Sections of modules](#sections-of-modules)); **`countries`** and **`locales`** what the address and language fields
  offer, as `GET /clients/options` answers the team (which the portal cannot call).

`PATCH /portal/me` (`Http\Requests\PortalProfileRequest`, `Portal\Actions\UpdatePortalProfile`) changes what the client may
change of themselves: `name`, `phone`, `birthday`, `locale`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`
and `country` (`UpdatePortalProfile::FIELDS`), each optional, with the rules and the cleaning of a client's own fields
(`ClientRules`, `ClientColumns`: a phone in E.164, a country an ISO code, a language the app speaks, text trimmed and blank
as `null`). Only what came changes, with the client's row held. The fields are read from the JSON body alone, as the
sign-in's are: anything in the query string, or a body that is not JSON, is ignored.

- **Anything else is refused by name**, whatever it holds (`null`, `""` and `[]` too) and whatever its name (a dot or a `*`
  in it too, `notes.*`): 422 `validation.missing` on that field, and nothing changes. That is the email (it is how the client signs in; changing it would ask to verify the new
  one, and the business can change it from the client's page), the notes, the tags, the home branch and the fields modules
  keep (they are the business's), the consent (its own route), and any id: the client is always the session's
  (`CurrentPortalClient`), never one the body or the address names.
- **A phone another live client of the workspace has** (one in the trash does not count, as for the team) is 422
  `clients.portal_phone_unavailable` on `phone`, whether the check finds it or the unique index catches a race. Unlike the
  team's 409 `clients.duplicate`, it never says whose (no `meta`): the client should not learn who else the business keeps.
  That the phone is taken cannot be hidden, only how often it may be asked: every new phone counts, taken or free, against
  `clients.portal.phone_changes_per_hour` (5) per client (`Portal\PortalLimits`, keyed by the workspace and the client,
  never the phone), and over it the change is 429 `http.too_many_requests` and nothing changes. The other details, the
  phone the client has already and taking the phone away count for nothing. A lookup that breaks is reported as a `Records\ValuesFreeFailure`, without the phone.
- **The audit trail** keeps `clients.client.portal_updated` with the names of what changed (`after: {changed: ["phone",
  "city"]}`), never a value, and **no actor**, address or browser: the client is no member (see [The session](#the-session)
  and [Privacy](#privacy)). What came and is what the client has already changes nothing and leaves no entry.

`PUT /portal/me/consent` (`{marketing: true|false}`, `Portal\Actions\SetPortalConsent`) is the client's own choice about
marketing: stamped with when and with the source `portal` (`marketing_consent_source`), and audited as
`clients.client.consent_changed` (`after: {marketingConsent, source: "portal"}`), with no actor, address or browser (the
team's carry theirs). The same choice again changes nothing. Any other field is refused, and the choice is read from the
JSON body alone, as above.

Both answer `{ client }` alone, never the whole account: the modules' sections are not asked again once the change is
saved, so a module that fails never turns a saved change into an error (`GET /portal/me` asks them).

Every route of the portal counts against the client's `portal` limiter, these two included (the group takes it), and no
answer is kept by a cache. The client's page shows all of it in its [Activity](#activity) ("Changed their details in the
portal", "Agreed to receive marketing"). Support acting as a member never reaches the portal (an impersonation has no
portal session), so the rule that refuses a change of a client's contact data or consent while impersonating has nothing
to refuse here.

### Sections of modules

A module adds what it keeps for a client to the portal (their appointments, their purchases) as a section, step by step in
[Add a portal section](../guides/add-a-portal-section.md):

- **Which sections a client sees** come from `Contracts\PortalSectionProvider`s tagged `clients.portal_sections`, asked
  for that client (`portalSections($tenantId, $clientId)`), as the workspace, on every `GET /portal/me`: a module answers
  a section only when it has something for that client, or when its plan includes it. Each is a `Contracts\PortalSection`:
  its key `<module>.<section>` in snake case, its title as a translation key (a line in every language) and its order.
- `Portal\PortalSectionsRegistry` gathers them by their order, then by key, with the title in the request's language, and
  refuses (`InvalidArgumentException`) a key in another shape or one declared more than once, and a title that is not one line: the frontend draws a section
  by its key. `GET /portal/me` lists them under `sections`:

  ```json
  { "sections": [{ "key": "spa.visits", "label": "Your visits", "order": 20 }] }
  ```

- **Its data** comes from the module's own routes in the `portal` group, which already authenticates the client, checks
  the portal is open and limits every request per client (see [The session](#the-session)): the route takes
  `middleware('portal')` alone and reads the client from `Contracts\CurrentPortalClient::requireId()`, never from an id the
  browser sends. A route that leaves out `AuthenticatePortalClient` fails closed: 401, or 403 `clients.portal_closed` first when the
  portal is closed; the route is never reached.
- **In the frontend**, a module's layer pushes `{ id: key, order, component }` to core's `kit:portal:sections` from a
  plugin; the portal's account page draws only the sections the API listed for that client, in the API's order, each
  under its title. The component calls its layer's services with `session: "portal"`.

### For the team

**Whether a client uses the portal.** The client's page (`GET /clients/{client}`, and every route that answers one client)
carries `portal`:

```json
{ "portal": { "sessions": 1, "lastUsedAt": "2026-11-12T19:00:00Z" } }
```

`sessions` counts the client's sessions that still sign them in (neither past `clients.portal.session_minutes` nor unused
for `clients.portal.idle_minutes`, as the guard takes them), and `lastUsedAt` is the latest use among those, or `null` with
none (`Portal\PortalSessions::usageOf()`). A client who is not live (in the trash, merged or erased: the privacy export
answers those) has none, `0` and `null`, whatever rows are left: the guard takes none of them. A use is written down at most
once a minute.

**Ending a client's sessions.** `POST /clients/{client}/portal/sign-out` (`clients.manage`, the `clients` limiter) ends every
session of the client and forgets the code waiting for their email (`Portal\Actions\SignClientOut`, with
`Portal\Actions\EndPortalSessions`): a lost phone, a client who asks. The client opens by the rule of one client
(`ClientFinder`: live, a home branch the person sees or none; anything else is 404 `clients.not_found`), its row held while
it runs. It answers the client, as `GET` does (`portal.sessions` is `0`), with `Cache-Control: no-store, private` and
`Referrer-Policy: no-referrer`, its refusals too. It is audited as `clients.client.portal_signed_out` with
`after: {"sessions": <how many ended>}` (its branch the client's home branch), and the client's [Activity](#activity) shows
it ("Signed out of the portal by the team"). It is allowed while a super admin acts as the person: support is never kept from
protecting a client, and the entry names the admin (`impersonator_user_id`; `impersonated` in the activity). It needs no
plan's feature: a plan that dropped the portal can still end its sessions. The client may sign in again with a new code, at
once: once it is done, it forgets what the client's email asked for and tried in the workspace
(`Portal\PortalLimits::forgetEmail()`: `codes_per_email_per_hour`, `codes_per_email_per_day` and
`verifies_per_email_per_hour`), so a client whom someone locked out by spending their codes or tries is not kept out until
the day is over. The counts by address and by workspace stay.

**Ending every session of the workspace.** `POST /clients/portal/sign-out` (`clients.manage`, the `clients` limiter) ends
every portal session of the workspace and forgets every code waiting (`Portal\Actions\EndAllPortalSessions`), in one
transaction: a leak, a suspicion that someone guessed codes. Every client signs in again with a new code. It follows no
branch (the portal is the workspace's), needs no plan's feature, and is allowed while a super admin acts as the person (it
protects the clients; the entry names the admin). It answers how many sessions ended, `{ "data": { "sessions": 3 } }`, and
is audited once for the workspace as `clients.portal.sessions_ended` (resource `ClientPortal`, id `sessions`) with
`after: {"sessions": <how many ended>}`, never per client. What each email asked for and tried is not forgotten: a client
whom someone locked out gets their limits back with **Sign out everywhere** on their page.

**When the sessions end on their own.** A client erased loses its sessions and its waiting code inside the erasure's
transaction (`EraseClient`, it and each client merged into it, with `Portal\Actions\EndPortalSessions`): what they keep (the
browser each session was opened from, its times, the code's HMAC of the email) is the person's, so it goes with the rest of
them or the erasure is undone. A client in the trash (`ClientDeleted`) or merged into another (`ClientsMerged`, the client
that went; the one that stays keeps its sessions) loses them to `Portal\Listeners\EndSessionsOfGoneClient`, in the request,
after the commit; it listens to `ClientErased` too, and finds nothing left. Clients only soft-deletes a client, so nothing
cascades. Two things keep a client in the trash or merged out even when that listener fails (a failure is reported as
`Records\ValuesFreeFailure`, without its values, and the trash or merge stays done; the event's other listeners still run):

- the guard signs in only a live client (in the trash, merged or erased, the request is 401 `auth.unauthenticated`);
- bringing a client back from the trash (`RestoreClient`) ends, in its transaction, whatever sessions and code are left, so a
  token from before the trash never works again. A sign-in that crossed the trash is ended the same way.

A change of a client's email by the team (`PATCH /clients/{client}`, `UpdateClient`, a new address or none) ends their
sessions and waiting code inside the same transaction, so whoever holds the old address loses the portal at once rather
than up to `clients.portal.session_minutes` (7 days) later. Any other change keeps them, and so does sending the email the
client already has.

| Route | Permission | Limiter | Impersonation | Answers |
| ----- | ---------- | ------- | ------------- | ------- |
| `POST /clients/{client}/portal/sign-out` | `clients.manage` | `clients` | allowed | the client, its sessions and code ended |
| `POST /clients/portal/sign-out` | `clients.manage` | `clients` | allowed | `{sessions}`: every session and code of the workspace ended |

| Error | When |
| ----- | ---- |
| 404 `clients.not_found` | no live client the person may see has that id |

**On the team's screens.** The clients layer draws both:

- **Settings → Client portal** (`ClientPortalSettings`, the section of the group `client_portal`, registered by the plugin
  `clients-settings.ts` on core's `kit:settings:sections`): a `GlassSwitch`, **Portal open**, saved with the settings
  page's bar like any section (`useSettingsForm`; the review of changes shows it as Yes or No). It is disabled for whoever
  may not change the group (`canEdit`, from `clients.manage`). On a plan without `clients_portal` (`usePlanGate`) it shows off and
  disabled, whatever was saved, with a line that says the plan does not include the portal and the plan's tooltip
  (`core.tooltips.plan_feature_locked`, opened from around the switch, since a disabled one fires no pointer events). While
  the platform lacks the captcha the portal asks for (the meta `captchaMissing`), the switch keeps working and its line says
  the workspace's clients cannot sign in yet and to tell whoever runs the platform, with no address. Once saved open, the section
  gives the address to share with clients, the workspace's `/portal` (core's `workspaceUrl()` with the workspace's slug,
  the page's address and `useRootDomain()`), with **Copy**, which puts it on the clipboard (a toast says so, or that the
  browser did not let it, so the person copies it by hand). Turning the switch off pauses the clients' sessions and signs
  nobody out (see [The session](#the-session)): a client's sessions end with **Sign out everywhere** on their page, or when
  they expire. Whoever may change the group (`canEdit`) also gets **End all sessions**, on any plan, which asks first
  (`ConfirmActionDialog`) and then sends `POST /clients/portal/sign-out`; a toast says how many sessions ended, or the API's
  refusal. It is an action of its own, not a change the page's bar saves.
- **The Portal card on a client's page** (`ClientPortalCard`, in the Profile tab, after the duplicates and before the
  privacy): for a client with a session, on how many devices they are signed in and when they last used the portal
  (`portal` of the client); with none it is not drawn. Whoever has `clients.manage` gets **Sign out everywhere**, also
  while a super admin acts as the person, which asks first and then sends `POST /clients/{client}/portal/sign-out`; a
  refusal is the API's toast, and when the client is already gone (404 `clients.not_found`) the page goes back to the list
  (`useClientLeave`), as the privacy card does. The card keeps the usage it shows itself and takes it from the answer, without writing the
  page's client: what the profile has not saved stays.

### The portal's screens

The clients layer draws the portal on the workspace's address, under `/portal`. Every page there depends on who is signed in
(a client's session lives in the browser), so the layer's `nuxt.config.ts` gives `/portal` and `/portal/**` core's
`browserOnlyRule()`: drawn by the browser alone and kept out of search engines (`X-Robots-Tag: noindex`, and `noindex,
nofollow` in the page's head).

**Signing in** is `/portal` (`pages/portal/index.vue`), a public page with the `auth` layout and core's `AuthShell`, like the
team's sign-in. It has no `auth` meta, so a member signed in on the same address still reaches it: the two sessions never
meet. It asks `GET /portal` first (`usePortalSignIn`): the title names the workspace, the subtitle says what the portal is
and that there is no password, only a code by email. Then, in two steps:

1. `PortalEmailForm`: the email (checked as the API checks it, `email:strict`, so a typo is said before a captcha is spent
   on it) and the captcha. The form takes the captcha's token and asks the widget for the next one before each send, and
   sends the email trimmed and in lowercase. The answer is the same for any email, so the page goes on to the code and
   never says whether the email is a client's. A refused captcha (`auth.captcha_failed`) or too many tries (429) shows in
   the form's banner.
2. `PortalCodeForm`: the eight digits in one field (mood-ui's `Input`, `type="tel"` for a phone's keypad and
   `autocomplete="one-time-code"`, keeping the digits alone so a code pasted with spaces works; eight boxes of `OTPInput` do
   not fit a phone), with the email they went to and what to do when nothing arrives
   (look in spam, then go back, check the email and ask again). A code that does not work (422
   `clients.portal_code_invalid`) shows under the digits; too many tries, in the banner. Going back to the email keeps
   what was typed and asks for a new captcha.

A closed portal (`open: false`) shows that it is closed and asks nothing (`data-testid="portal-closed"`). On the root
domain there is no workspace and so no portal: the page sends the visitor to find their workspace (`KIT_ROUTES.findWorkspace`)
and asks the API nothing. A client who already has a session goes straight to `/portal/account`.

**The account** is `/portal/account` (`pages/portal/account.vue`, `data-testid="portal-account"`), a signed-in client's own
page. It is drawn in the layer's `portal` layout (`layouts/portal.vue`), which the page puts around itself
(`<NuxtLayout name="portal">`, with `layout: false` in its meta) and hands the workspace's name and Sign out, so the
layout never calls the API. The layout is mood-ui's `Topbar` over the page at a reading width (`max-w-3xl`, core's
`PAGE_GUTTER`): at the left the workspace, core's `WorkspaceMark` with the name `GET /portal/me` gives (its `name` prop:
never the name of a member's session on the same address); at the right the language and Sign out. It follows the
person's light or dark (the sign-in's `auth` layout forces light), has no menu and links nowhere on the team's side. The
language switches the screen alone (`$i18n.setLocale`), not through core's `useChangeLocale`, which would save it on a
member signed in on the same address. On a phone Sign out is its icon, with its words as its aria label.

The page (`usePortalAccount`) reads `GET /portal/me` once, then shows:

1. a header that greets the client by name and says what the page is for;
2. `PortalProfileCard`, **Your details**: the name, the email (read-only, with a line that the client signs in with it
   and the business changes it), the phone (mood-ui's `PhoneInput`, E.164, as on a client's page: its flag is the number's
   own calling code, so a `+1` number under a Mexican address keeps `+1`, and the address's country while there is no
   number), the birthday (`DateField`, no later than today), the language (`KitSelect` of the API's `locales`, with
   "The business's language" for none) and the address (core's `AddressFields`). **Save my details** sends
   `PATCH /portal/me` with only what changed, and is off until something does; while it is on its way the fields are off
   too, so nothing typed meanwhile is lost when the saved client comes back. A field the API refuses (a phone another
   client has, 422 `clients.portal_phone_unavailable`) shows under its field; anything else (too many phone changes, 429;
   a field the client may not change, 422 `validation.missing`) in the card's banner;
3. `PortalConsentCard`, **News and offers**: a `GlassSwitch` that saves `PUT /portal/me/consent` the moment it changes,
   with when the client chose it under it; the switch is off while its choice is saved, and a change the API does not take
   goes back;
4. the modules' sections (`kit:portal:sections`): only those the API listed, in its order, each under the API's label.

Both changes answer the client alone (`{client}`), which takes the place of the one read: the sections are not asked for
again, and a consent saved while the client types keeps what they typed. Sign out (`DELETE /portal/session`) forgets the
session in the browser and goes to `/portal` whatever the API answers: a 401 says it was already over, and shows nothing;
any other failure (a 500, no connection) is toasted. With no session the page goes to `/portal` and asks nothing. A portal
the business closed since the client signed in (403 `clients.portal_closed`, on reading the account or on saving the
details or the consent) says so on the page in place of the account, with no banner or toast, and Sign out still there:
`/portal` would send a client with a session straight back. There is no warning on leaving with unsaved details: core's `useLeaveGuard` reads a member's session.

**The session in the browser.** Signing in keeps the token under its own key, `mood-kit.portal-token` (`utils/portal-token.ts`),
never under the member's `mood-kit.token`, and in core's `usePortalToken()`, which `useApi` sends only on a call with
`session: "portal"` (every call of `services/portal.ts`). The plugin `portal-session.ts`, in the browser only, picks the token
up when the app starts and listens to `kit:portal:unauthenticated`: a 401 of a portal call forgets the token and, on a page
under `/portal/`, sends the client back to `/portal`. A member's session never ends because of it.

### The tables

Two tables, both with row-level security and `FORCE`, both hung from the client by `(tenant_id, client_id)` →
`clients (tenant_id, id)` with `ON DELETE CASCADE`: a code or a session can never point at another workspace's client,
and deleting a client's row (or the workspace, which deletes them all) takes its codes and sessions with it. Clients
never deletes a client's row itself, though: the trash, a merge and an erasure only soft-delete it (`deleted_at`) or
anonymize it, so no cascade ends a gone client's portal access. That rests on the guard, which signs in only a live client,
on the erasure, which deletes the rows of the clients it erases, and on `Portal\Listeners\EndSessionsOfGoneClient`, which
deletes those of a client in the trash or merged (see [For the team](#for-the-team)).

`client_portal_codes` (`Models\ClientPortalCode`) keeps the sign-in code waiting for an email:

| Column | Type | |
| ------ | ---- | - |
| `id`, `tenant_id`, `client_id` | uuid | the code, its workspace and the client it signs in (`(tenant_id, client_id)` is indexed) |
| `email_key` | char 64 | an HMAC of the email in lowercase, never the email; `(tenant_id, email_key)` is unique: one live code per workspace and email |
| `code_hash` | char 64 | an HMAC of the code, never the code |
| `attempts` | smallint | the wrong tries it has taken (0 when made) |
| `sends` | smallint | how many times it was mailed (1 when made) |
| `last_sent_at` | `timestamptz` | when it was last mailed |
| `expires_at` | `timestamptz` | when it stops working (indexed, for the daily clean-up) |
| `created_at` | `timestamptz` | when the first one was mailed |

`client_portal_sessions` (`Models\ClientPortalSession`) keeps a client's sessions:

| Column | Type | |
| ------ | ---- | - |
| `id`, `tenant_id`, `client_id` | uuid | the session (the first half of its token), its workspace and its client (`(tenant_id, client_id)` is indexed) |
| `token_hash` | char 64 | the SHA-256 of the token's secret, never the secret; unique |
| `user_agent` | varchar 255 | the browser it was opened from, optional |
| `last_used_at` | `timestamptz` | when it was last used |
| `expires_at` | `timestamptz` | when it ends whatever its use (indexed, for the daily clean-up) |
| `created_at` | `timestamptz` | when it was opened |

A member's tokens (Sanctum's `personal_access_tokens`) and the admin's sessions (`platform_sessions`) are other tables: a
token of one kind is never found in the table of another. Only Clients writes these two.

## For a module

A module reaches Clients through its `Contracts\` and `Events\` alone, never its tables or models. How to hang a module's
rows from a client, step by step: [Attach data to clients](../guides/attach-data-to-clients.md).

| To | Use |
| -- | --- |
| read a client (who, how to reach them, home branch, trashed or erased) | `Contracts\ReadsClients::find($tenantId, $clientId)`, a `Contracts\ClientSummary` or `null` |
| know whether a person may see a client by its home branch | `Contracts\ReadsClients::visibleTo($tenantId, $userId, $clientId)` |
| keep a field on every client | a `Contracts\ClientFieldProvider` tagged `clients.fields` (see [Custom fields](#custom-fields)) |
| add to a client's activity | a `Contracts\ClientActivitySource` tagged `clients.activity` (see [Activity](#activity)) |
| move its rows when two clients merge | a `Contracts\ClientMergeParticipant` tagged `clients.merge`, inside the merge's transaction (see [Duplicates and merging](#duplicates-and-merging)) |
| export and erase its part of a client | a `Contracts\ClientDataContributor` tagged `clients.data`, inside the erasure's transaction (see [Privacy](#privacy)) |
| react to a client's life | the events below, after the commit |
| add a tab to a client's page | core's `kit:clients:tabs` hook, from a plugin of its layer |
| add a section to the client portal | a `Contracts\PortalSectionProvider` tagged `clients.portal_sections`, its routes in the `portal` group with `Contracts\CurrentPortalClient`, and core's `kit:portal:sections` hook (see [Sections of modules](#sections-of-modules)) |

`ReadsClients` is asked as the workspace (a request's, or a job's through Tenancy's job scope), with ids in any case; it
answers a client in the trash and an erased one too, since a module's rows keep pointing at them. A module's table points
at a client by `(tenant_id, client_id)` → `clients (tenant_id, id)`, a key with no action: a client is never deleted from
its table. Its `tenant_id` cascades from `tenants`, so a workspace's deletion takes the module's rows in the same
statement. `visibleTo()` is the branch rule alone: whether the person is a member and holds the module's permission is
for the module's route to check, and a client in the trash or erased is seen too (`find()` says which).

## Reference

### Routes

Every route is under `/api/v1`. The team's routes take `workspace` (a signed-in member of the workspace), then their
permissions; the portal's take `portal` or `tenant` alone, never `workspace` (see [Portal routes](#portal-routes)). On the
team's routes, every write has a named limiter, and so do the reads of clients (`clients-read`, by member and workspace:
the list, one client, its activity and its possible duplicates). The fixed paths (`clients/tags`, `clients/fields`, `clients/options`, `clients/export`, `clients/portal/sign-out`,
`clients/imports`) come before `{client}`. "Impersonation" says whether a super admin acting as the person may use it
(`not-impersonating` refuses it; a `DELETE` is refused by `GuardImpersonation` whatever the route). `ClientsRoutesTest`
holds this table: a route that is not in it fails the test.

| Route | Permission | Limiter | Plan | Impersonation | Answers |
| ----- | ---------- | ------- | ---- | ------------- | ------- |
| `GET /clients` | `clients.view` | `clients-read` | | allowed | a page of the list (`search`, `tags[]`, `marketing`, `branch`, `trash`, `sort`, `page`, `perPage`) |
| `GET /clients/tags` | `clients.view` | | | allowed | the catalog of tags |
| `GET /clients/fields` | `clients.view` | | | allowed | the fields modules declare |
| `GET /clients/options` | `clients.view` | | | allowed | the countries and languages a client may have |
| `GET /clients/{client}` | `clients.view` | `clients-read` | | allowed | the client |
| `GET /clients/{client}/activity` | `clients.view` | `clients-read` | | allowed | its latest activity |
| `GET /clients/{client}/duplicates` | `clients.view`, `clients.manage` | `clients-read` | | allowed | its possible duplicates |
| `POST /clients` | `clients.manage` | `clients` | `clients` quota | refused | 201 with the new client |
| `PATCH /clients/{client}` | `clients.manage` | `clients` | | allowed | the client, edited |
| `DELETE /clients/{client}` | `clients.manage` | `clients` | | refused | `data: null`; the client goes to the trash |
| `POST /clients/{client}/restore` | `clients.manage` | `clients` | `clients` quota | refused | the client, back from the trash |
| `POST /clients/{client}/merge` | `clients.manage` | `clients` | | refused | `{sourceId}`: the client that stays |
| `PUT /clients/{client}/tags` | `clients.manage` | `clients` | | allowed | `{tagIds}`: the client |
| `POST /clients/{client}/portal/sign-out` | `clients.manage` | `clients` | | allowed | the client, signed out of the portal (see [For the team](#for-the-team)) |
| `POST /clients/portal/sign-out` | `clients.manage` | `clients` | | allowed | `{sessions}`: every portal session of the workspace ended (see [For the team](#for-the-team)) |
| `POST /clients/tags` | `clients.manage` | `clients` | | allowed | 201 with the new tag |
| `POST /clients/tags/apply` | `clients.manage` | `clients` | | allowed | `{clientIds, add?, remove?}`: `{changed}` |
| `PATCH /clients/tags/{tag}` | `clients.manage` | `clients` | | allowed | the tag |
| `DELETE /clients/tags/{tag}` | `clients.manage` | `clients` | | refused | `data: null` |
| `GET /clients/{client}/privacy-export` | `clients.privacy` | `clients` | | refused | everything kept about the client |
| `POST /clients/{client}/erase` | `clients.privacy` | `clients` | | refused | `data: null`; the client is erased |
| `GET /clients/export` | `clients.export` | `clients-export` | | refused | the list as a CSV file (no envelope) |
| `GET /clients/imports/{import}` | `clients.import` | | | allowed | the uploader's import, its progress and result |
| `POST /clients/imports` | `clients.import` | `clients-import` | `clients_import` | refused | 201 with the import, `guess` and `sample` |
| `POST /clients/imports/{import}/preview` | `clients.import` | `clients-import-steps` | `clients_import` | refused | the import and its `preview` |
| `POST /clients/imports/{import}/run` | `clients.import` | `clients-import-steps` | `clients_import` | refused | the import, `queued` |

| Limiter | Per member | Setting |
| ------- | ---------- | ------- |
| `clients` | 60 a minute | `clients.changes_per_minute` |
| `clients-export` | 5 an hour | `clients.exports_per_hour` |
| `clients-import` | 10 an hour | `clients.import.uploads_per_hour` |
| `clients-import-steps` | 6 a minute | `clients.import.steps_per_minute` |

#### Portal routes

The client portal's routes are the workspace's (`tenant`) and never a member's: a public one takes `tenant` alone with a
limiter of its own, per address (and the two that carry an email or a code, `KeepOutOfCachesAndReferrers`); a signed-in
client's take the `portal` group (`tenant`, `KeepOutOfCachesAndReferrers`, `AuthenticatePortalClient`, `EnsurePortalOpen`
and the `portal` limiter, per client), and a module's route of its section takes the same group (see
[The session](#the-session)). A member's, an impersonation's or the admin's token is 401 on every route of the group, and
a client's token is 401 on every route of the team (`workspace`) and of the admin (`platform`). `PortalRoutesTest` sweeps
every registered route for this: a portal route that breaks it fails the test.

| Route | Middleware | Limiter | Answers |
| ----- | ---------- | ------- | ------- |
| `GET /portal` | `tenant` | `portal-public` | `{open, workspace}`: whether the portal is open, and the workspace's name |
| `POST /portal/code` | `tenant`, `KeepOutOfCachesAndReferrers` | `portal-code`; per email after the captcha | 202 `data: null`, whatever the email (see [Signing in](#signing-in)) |
| `POST /portal/session` | `tenant`, `KeepOutOfCachesAndReferrers` | `portal-verify`; per email | `{token, expiresAt}` |
| `GET /portal/me` | `portal` | `portal` | the client's account: `{client, workspace, sections, countries, locales}` |
| `PATCH /portal/me` | `portal` | `portal`; phone changes per client | `{client}`, changed |
| `PUT /portal/me/consent` | `portal` | `portal` | `{client}`, its consent changed |
| `DELETE /portal/session` | `portal` without `EnsurePortalOpen` | `portal` | `data: null`; that session ends, a closed portal too |

| Limiter | Counts | Allows | Setting |
| ------- | ------ | ------ | ------- |
| `portal-public` | per address | 60 a minute | `clients.portal.public_reads_per_minute` |
| `portal-code` | per address | 20 an hour | `clients.portal.codes_per_ip_per_hour` |
| (in the request, after the captcha) | per email and workspace | 5 an hour and 10 a day | `clients.portal.codes_per_email_per_hour`, `clients.portal.codes_per_email_per_day` |
| `portal-verify` | per address | 10 a minute | `clients.portal.verifies_per_ip_per_minute` |
| (in the request) | per email and workspace | 15 an hour | `clients.portal.verifies_per_email_per_hour` |
| (in the request, after the captcha) | per workspace | 200 codes an hour | `clients.portal.codes_per_workspace_per_hour` |
| (in the request) | per workspace | 300 codes that did not work an hour | `clients.portal.wrong_codes_per_workspace_per_hour` |
| `portal` | per signed-in client | 60 a minute | `clients.portal.requests_per_minute` |
| (in the request, a new phone) | per client | 5 an hour | `clients.portal.phone_changes_per_hour` |

Each over its limit is 429 `http.too_many_requests`. The counts per email are kept under the workspace and an HMAC of the
email, never the email (`Portal\PortalLimits`); the counts per workspace under its id, and the first refusal of their hour
is reported (see [Guessing at many clients](#guessing-at-many-clients)).

### Errors

Each with its status, in [Errors and the API](../concepts/errors-and-api.md); the sections above say when each route
answers which.

| Code | Status | Field, `meta` |
| ---- | ------ | ------------- |
| `clients.not_found` | 404 | |
| `clients.duplicate` | 409 | `email` or `phone`; `meta.clientId` when the person may see that client |
| `clients.branch_not_allowed` | 422 | `homeBranchId` or `branch` |
| `clients.tag_not_found` | 404 (in the path), 422 (in a body) | the body's field |
| `clients.tag_taken` | 422 | `name` |
| `clients.tag_needs_all_branches` | 403 | |
| `clients.tags_full` | 422 | `meta.limit` |
| `clients.too_many_tags` | 422 | the field that asked; `meta.limit` |
| `clients.selection_changed` | 422 | `clientIds` |
| `clients.merge_same` | 422 | `sourceId` |
| `clients.merge_notes_too_long` | 422 | `sourceId` |
| `clients.export_too_large` | 422 | `meta.limit` |
| `clients.import_not_found` | 404 | |
| `clients.import_invalid_file` | 422 | `file` |
| `clients.import_too_large` | 422 | `file`; `meta.maxBytes` |
| `clients.import_too_many_rows` | 422 | `file`; `meta.limit` |
| `clients.import_mapping_invalid` | 422 | `mapping` |
| `clients.import_wrong_state` | 409 | |
| `clients.portal_code_invalid` | 422 | `code` |
| `clients.portal_closed` | 403 | |
| `clients.portal_phone_unavailable` | 422 | `phone`; no `meta` |

Besides its own, the routes answer the kernel's: 403 `auth.forbidden` (a permission), `plans.feature_not_included` (the
import's feature) and `auth.impersonation_forbidden`, 422 `plans.quota_exceeded` and validation errors, 429
`http.too_many_requests`. The portal's answer 401 `auth.unauthenticated` (no session of the portal, or a token of another
kind), 422 `auth.captcha_failed` (asking for a code), `validation.missing` (a field a client cannot change from the
portal) and validation errors, 429 `http.too_many_requests`, and the tenancy's (400 `tenancy.required` on the admin host,
404 `tenancy.not_found`).

### Events

All in `Events\`, sent after the commit, with ids in lower case.

| Event | Carries | Sent when |
| ----- | ------- | --------- |
| `ClientCreated` | `tenantId`, `clientId`, `branchId` (the home branch) | a client was added (by hand, an import, a module) |
| `ClientDeleted` | `tenantId`, `clientId`, `branchId` | a client went to the trash |
| `ClientRestored` | `tenantId`, `clientId`, `branchId` | a client came back from the trash |
| `ClientsMerged` | `tenantId`, `clientId` (stays), `mergedId` (went to the trash), `branchId` | two clients became one |
| `ClientErased` | `tenantId`, `clientId`, `branchId` | a client was erased, once for it and once for each client merged into it |
| `ClientImportFinished` | `tenantId`, `importId`, `userId`, `status` (`finished` or `failed`) | an import ended; never for one whose uploader left |

### Commands

| Command | Scheduled | Does |
| ------- | --------- | ---- |
| `clients:prune-imports` | daily at 03:40 UTC, on one server, never overlapping | ends the imports whose job was lost, forgets the old and abandoned ones with their files, deletes the files left behind (see [What is kept](#what-is-kept)) |
| `clients:prune-imports --stuck` | every fifteen minutes, on one server, never overlapping | only ends the imports whose job was lost |
| `clients:prune-portal` | daily at 03:50 UTC, on one server, never overlapping | forgets, in every workspace (deleted ones too), the portal's codes past their time and its sessions past their life or unused for `clients.portal.idle_minutes` (see [For the team](#for-the-team)) |

## The clients layer

`frontend/layers/clients` draws the clients. What it holds so far:

- **Types** (`app/types/clients.ts`): a client as the list answers it (`ClientRow`) and whole (`ClientDetail`, with its
  use of the portal, `ClientPortalUsage`), a tag (`ClientTag`, `ClientTagRow` in the catalog with its `clients`), the
  list's filters (`ClientFilters`), what the API takes of a client (`ClientBody`), a custom field (`ClientField`), an
  entry of the activity (`ClientActivityEntry`) and an import (`ClientImport`, its `ClientImportOptions` and
  `ClientImportPreview`; `ClientImportUpload` adds the `guess` and `sample` only the upload answers). The portal's are
  in `app/types/portal.ts` (`PortalStatus`, `PortalSession`, `PortalAccount`, `PortalClient` and `PortalProfileBody`).
- **API calls** (`app/services/`): `clients.ts` (the list, a client, creating, editing, the trash, activity, duplicates
  and merging, the custom fields and what else a client's form offers, the CSV export, privacy and signing a client out of
  the portal), `client-tags.ts` (the catalog, a client's tags, tagging in bulk), `client-imports.ts` (upload, read,
  preview, run) and `portal.ts` (the client portal's routes, each with `session: "portal"`). A call that changes
  something is never retried.
- **Messages** (`i18n/locales/{en,es}.json`): everything under `clients.*`.
- **Helpers** (`app/utils/`): `clientQuery()` (the list's and the export's query: only what is set, the tags as
  `tags[]`), the form's draft (`emptyClientDraft()`, `clientDraftOf()`, `clientBody()`: every field when creating, only
  what changed when editing, blank text as `null`; `firstClientErrors()`), `CLIENT_TAG_COLORS` (mood-ui's Badge colors,
  the API's list), the import's `CLIENT_IMPORT_FIELDS`, `mappingOf()` (the API's guess, kept for the file's headers)
  and `importStep()`, `CLIENT_BULK_MAX` (the most clients one bulk change of tags may name) and `clientCsvName()` /
  `clientDataName()` (the names the list's CSV and a client's data are saved under, by the day on the person's own
  calendar; a client's data by the client's id, never by anything personal), and `localDate()` / `dayText()` (a day
  between the API's `YYYY-MM-DD` and mood-ui's `DateField`, on the person's own calendar: a birthday, a custom date
  field), `clientDuplicateOf()` (a taken email or phone: the field and the client who has it, when the API names
  them), `addressOf()` (a draft's address, as core's `AddressFields` edits it), and for the portal's profile
  `portalDraftOf()` and `portalBody()` (a client's own details as a draft, and only what changed, as a client's page sends
  it; `PORTAL_PROFILE_FIELDS` are the ones a client changes).
- **Pages**: the Clients page, `/dashboard/clients`, with its Clients and Tags tabs, the New client page,
  `/dashboard/clients/new`, a client's page, `/dashboard/clients/{id}`, and the import's two pages,
  `/dashboard/clients/import` and `/dashboard/clients/imports/{id}` (below), and the client portal's sign-in, `/portal`,
  and account, `/portal/account`, with the layer's `portal` layout (see [The portal's screens](#the-portals-screens)).
- **Settings**: the client portal's section of the settings page (`ClientPortalSettings`, from the plugin
  `clients-settings.ts`; see [For the team](#for-the-team)).

Two things the API's answers decide:

- **The CSV** comes through `useApi().download()` as a `Blob`, and the page names the file it saves with core's
  `saveBlob()`: the browser does not let the frontend read the API's `Content-Disposition` across origins.
- **The preview's errors** come only in the answer of `POST /clients/imports/{import}/preview`. The import read again
  (`GET /clients/imports/{import}`) keeps the counts with `preview.errors` empty, so the tab keeps the preview's errors
  apart (`useClientImport`), and a read of the import never empties them.

### The Clients page

`/dashboard/clients` (`pages/dashboard/clients/index.vue`) is for whoever has `clients.view`, and follows the kit's page
anatomy: the header, the tabs, each tab's toolbar and its content.

- **The header** holds **Import** (for whoever has `clients.import`) and **New client** (for whoever has
  `clients.manage`, `ClientNewButton`). Each stays in view with its tooltip when it cannot be used, disabled
  (`useClientGate`): Import when the plan leaves out the `clients_import` feature (core's plan tooltip); New client when
  the plan's `clients` are all taken, with a tooltip that names the limit ("Your plan includes 100 clients") and, for
  whoever has `subscription.view`, a **See plans** link beside it, as New branch and Invite do (core's `usePlanGate`
  knows the use only for whoever may see the subscription; the API refuses either way); and both while a super admin
  acts as the person (core's impersonation tooltip).
- **The tabs** (`Tabs` `line`): **Clients** and **Tags** (see [The Tags tab](#the-tags-tab)). The page loads the
  catalog of tags once and hands it to both: the Tags tab shows it, the Clients tab filters by it.
- **The toolbar** of the Clients tab (`ClientsPanel`, `ClientsFilters`): the search at the left (it asks once the person
  stops typing for 300 ms), and at the right, each asking at once: the tags (any of them; only once the catalog has
  one), the consent (any, agreed, not agreed), the branch (only while the workspace works by branch: the top bar's,
  "Every branch I see" for `branch=visible`, or one branch the person may choose), the order (newest first, oldest first,
  by name) and **Trash**, a switch for whoever has `clients.manage`. The search narrows before the filters wrap, so they
  hold on one row on a laptop. On a phone the search comes first and the filters wrap under it.
- **The table** (`ClientsTable`, which scrolls sideways on a narrow screen): the name with the email under it, the
  phone (as core's `phoneText()` writes it, `+52 664 123 4567`), the home branch (only while the workspace works by branch; "Every branch" for a client of none), the first three tags and how many more (their names in
  its tooltip and its aria label, "1 more tag: C"), the marketing consent, and the row's actions at its end
  (`ClientRowActions`): **Open** for everyone, **Send to trash** for whoever has `clients.manage`. Sending a client to
  the trash asks first and says it frees up a spot on the plan. Whoever has `clients.manage` can pick rows with their
  checkboxes; the rows picked keep only those the list still shows. A pager (previous, next and the pages already seen) turns the page.
- **A selection.** While rows are picked, mood-ui's selection bar above the table says how many and holds **Tag**
  (`ClientsTable`), disabled past 500 picked (`CLIENT_BULK_MAX`, the API's `clients.bulk_max`) with a tooltip that names
  the limit ("Tag up to 500 clients"). Tag opens a dialog (`ClientBulkTagDialog`) with two lists of the catalog's tags:
  the ones to add to every client picked and the ones to take away (a tag chosen in one list is off in the other), and
  Apply, off until a tag is chosen (`POST /clients/tags/apply`). Once it is done the pick empties, and the tab reads the
  list and the page reads the catalog again (its counts moved). If a client picked is gone or out of sight meanwhile
  (`clients.selection_changed`), the API's message is a toast, the dialog closes and the list is read again, so the
  person picks again; any other refusal (a tag deleted meanwhile, a client with too many tags) is a toast, the dialog
  stays open and the list and the catalog are read again (a tag the catalog no longer has leaves both lists). Tagging
  stays on while a super admin acts as the person (the API audits it).
- **Export**, for whoever has `clients.export`, is the download button at the right edge of the toolbar
  (`ClientExportButton`). It downloads the list as a CSV file as it is filtered: the search, the filters, the order and
  the trash as they are, every page of it (never the page the list reached), and the top bar's branch as
  the API applies it (the page never sends it). The page names the file `clients-<YYYY-MM-DD>.csv` by the day on the
  person's own calendar (it cannot read the API's name). A refusal is a toast with the API's message: more than the
  hour's downloads (429), or a list too long for one file (`clients.export_too_large`). While a super admin acts as the
  person it stays in view, disabled, with core's impersonation tooltip (the API refuses it then).
- **The trash** is the same table with the Trash switch on: no Open, no checkboxes, and **Restore** at the end of each
  row, at once (a refusal such as a duplicate email or a full plan is a toast). While a super admin acts as the person,
  Send to trash and Restore stay in view, disabled, with the impersonation tooltip.
- **When the list is empty** it says that no client matches (under the search, a filter or a top bar on one branch,
  in the trash too), that the trash is empty, or that there are no clients yet, and to whoever may add them, how: New
  client, and Import only when the person has `clients.import` and the plan includes `clients_import`.

After a client is sent to the trash or restored, the tab reads the list again and the page reads the plan's places
again (`kit:plan:load-usage`).

**Following the branch.** The page never sends the top bar's branch: with the branch filter on "Branch: …" (no
`branch`), the API applies it, and the list asks again whenever the top bar changes (`useBranchReload()`). The branch
filter's other choices are sent as `branch`, and the top bar does not change what they list (the list still asks again).

### The Tags tab

The Clients page's **Tags** tab (`ClientTagsPanel`) shows the catalog of `GET /clients/tags`, which the page loads and
hands to the tab:

- **The table** (`ClientTagsTable`): each tag as mood-ui's `Badge` draws it in its color (`ClientTagBadge`), and how
  many live clients carry it among those the person sees. It does not follow the top bar's branch.
- **New tag**, for whoever has `clients.manage`, at the right of the tab's toolbar. It opens the tag's dialog
  (`ClientTagDialog`): a name of up to 40 characters, a color from mood-ui's `ColorPicker` (one swatch for each color, no custom one: its value is a hex, so `tagColorHex` paints each token's color into a canvas pixel and `tagColorOfHex` maps the pick back), and the tag as it will show. The colors are
  mood-ui's Badge colors as it comes, named for the person: Gray (`default`), Brand (`primary`, which follows the
  workspace's brand), Green (`success`), Amber (`warning`) and Red (`danger`); a new tag starts gray. Save stays off
  while the name is blank. A name the workspace already has (422 `clients.tag_taken`) is shown on the name's field until
  the name changes; any other refusal, such as a full catalog (`clients.tags_full`) or a tag deleted meanwhile, is a
  toast, the dialog stays open and the tab reads the catalog again.
- **Edit** and **Delete** at the end of each row, for whoever has `clients.manage`. Edit opens the same dialog with the
  tag's name and color. Delete asks first and says how many clients carry the tag and will stop carrying it; deleting it
  takes it off all of them, and a refused delete reads the catalog again. While a super admin acts as the person, Delete
  stays in view, disabled, with core's impersonation tooltip (it is a `DELETE`, which the API refuses then); Edit and
  New tag stay on. For someone who does not see every branch (GET /me's `branch.inUse` without `canChooseAll`), Edit and
  Delete stay in view, disabled, with the tooltip "Needs access to every branch" (the
  API's 403 `clients.tag_needs_all_branches`, whose message is toasted if it comes); New tag stays on.

After a tag is added, changed or deleted, the tab reads the catalog again.

### The New client page

`/dashboard/clients/new` (`pages/dashboard/clients/new.vue`) is for whoever has `clients.manage`. It reads what the form
offers once (`useClientFields`: `GET /clients/fields`, `GET /clients/options` and the catalog of tags) and draws the
client's fields (`ClientFieldsForm`, which the client's page uses too) in three cards:

- **Contact**: the name (the only field required), the email and the phone (mood-ui's `PhoneInput`, E.164; its flag is
  the number's own calling code, the address's country while there is no number, and an emptied field is no phone), the
  birthday (mood-ui's `DateField`, never a day to come), the language (the app's languages by name, or the workspace's),
  the **home branch** (only while the workspace works by branch: the branches the person may choose, or "Every branch")
  and the tags (a select of the catalog's, the whole row wide when there is no home branch to choose; with no tag yet, it
  says where tags are made).
- **Address**: core's `AddressFields`, the country from the codes the API takes, named in the screen's language.
- **Notes and more**: the notes (up to 5000 characters), the marketing consent (`ClientConsentField`, a switch that says
  to turn it on only if the client said yes; on a client's page, when and from where the last choice came) and the
  fields modules keep (`ClientCustomFields`, each drawn by its type: a switch, a select that can go back to "None", a
  number, a date or a line of text), when a module declares any.

The page's action bar ends it: **Save** is on once there is a name; **Cancel** forgets what was typed and goes back to
the list. Every field is in the page's change set (`useClientChanges`), so leaving with anything typed asks first and
**Review changes** lists each change in words (the language, the home branch and the tags by name, the consent, the
address in one line, the custom fields by their labels, each value by its type). The home branch starts at the top
bar's branch when the top bar is on one, and at "Every branch" otherwise. Save creates the client, reads the plan's places
again (`kit:plan:load-usage`) and opens its page. A refusal of a field lands on it; a taken email or phone (409
`clients.duplicate`) shows the API's message on that field and, only when the API names the client (`meta.clientId`, for
someone who may see it), an **Open that client** link under it. Any other refusal (the plan's limit reached meanwhile)
shows above the form.

The form shows once the page knows whether a client can be added (`useClientGate().settle()`: the plan's use of
`clients`, when the plan limits them and the use is not known yet), so it never shows on and then turns off. While a
super admin acts as the person, or once the plan's `clients` are all taken, the page says why (and, at the limit, offers
the plans to whoever has `subscription.view`), the fields are off and there is no action bar: the API would refuse. The
list's **New client** is off then too.

### A client's page

`/dashboard/clients/{id}` (`pages/dashboard/clients/[id].vue`) is for whoever has `clients.view`. It reads the client once
(`useClientPage`: `GET /clients/{client}`) and hands it to its tabs (`useClientDetail()`), which write back what the API
answers a save.

- **The header**: the client's name, and under it the email, the phone (written as the list writes it), the home branch, "Agreed to marketing" when the
  client agreed to it, and the client's tags. For whoever has `clients.manage`, **Send to trash**
  (`ClientHeaderActions`) asks first, sends the client to the trash, reads the plan's places again
  (`kit:plan:load-usage`) and goes back to the list, forgetting what the profile had not saved. While a super admin acts
  as the person it stays in view, disabled, with core's impersonation tooltip (the API refuses a `DELETE` then).
- **The tabs** (`Tabs` `line`): **Profile** (10) and **Activity** (20), then a module's own, by their order. A tab mounts
  the first time it is opened and stays, so what was typed in the Profile is kept while another tab is open.
- **Profile** (`ClientProfileTab`): the client's fields in the New client page's cards (`ClientFieldsForm`), saved with
  the page's action bar: Save sends only what changed (`PATCH /clients/{client}`; text with a space more or less at an
  end is no change), Cancel throws the changes away and clears what the API refused on a field. Every field is in the
  page's change set (`useClientChanges`), so leaving with changes asks first and **Review changes** lists them (a custom
  field's value by its type: a choice by its label, yes or no, a date in the person's language). A refused field lands
  on it (a taken email or phone with an **Open that client** link, when the API names the client); any other refusal is
  a toast, and what was typed stays. The home branch keeps the client's own as a choice even when the person could not
  choose it (an inactive branch, "Centro (inactive)", or one outside the top bar's choices), so it never shows blank.
  Whoever has `clients.manage` edits it, also while a super admin acts as the person (the API audits it); anyone else
  reads it, with the fields off and a line that says so.
- **Activity** (`ClientActivityTab`): what happened to the client, newest first (`GET /clients/{client}/activity`): the
  API's words for it (`label`), the fields an edit changed by name (a module's field by the API's name), when, in the
  person's language and time, who, and "by support" when a super admin did it acting as someone. Read only, so the page's
  action bar is not shown while it is open (its tab is `readOnly`). It is read again when the page's client changes (a
  save, a merge), since the tab stays once opened.
- **Duplicates** (`ClientDuplicatesCard`, under the Profile's fields, for whoever has `clients.manage`): the possible
  duplicates (`GET /clients/{client}/duplicates`: the same name, among the clients the person may see), each with its
  email, phone and home branch and **Merge**. Merge asks first, saying which client stays (this one), what it takes from
  the other (what it lacks, both sets of tags, both notes), that the other goes to the trash and that it cannot be
  undone; then `POST /clients/{client}/merge {sourceId}`, and what the API answers becomes the page's client (the header,
  the Profile and the Activity follow), the duplicates and the plan's places (`kit:plan:load-usage`) are read again. A
  refusal (`clients.merge_notes_too_long`, `clients.too_many_tags`, `clients.duplicate`, `clients.not_found`, ...) is the
  API's message in a toast, and the duplicates are read again; when they answer 404 too, this client is gone (erased or
  deleted elsewhere meanwhile) and the page goes back to the list. With no possible duplicates the card is not drawn.
  Merge is off, with a tooltip that says why, while a super admin acts as the person and while the Profile has changes
  not saved (the merged client replaces what is on the page): save or cancel them first.
- **Privacy** (`ClientPrivacyCard`, under the duplicates, for the owner: `clients.privacy`): **Download data** saves
  everything kept about the client (`GET /clients/{client}/privacy-export`) as `client-<id>-YYYY-MM-DD.json`, named by
  the client's id and the day on the person's own calendar, never by the client's name; **Erase for good** asks first and
  erases only once the client's name is typed as it is (letter case too; an accent typed or stored either way matches)
  (`POST /clients/{client}/erase`), then reads the plan's places again and goes back to the list, forgetting what the
  Profile had not saved; so does a 404 `clients.not_found` (the client is already gone), after its toast. Any other
  refusal is the API's message in a toast, and the page stays as it was. Both stay in view, disabled, with core's
  impersonation tooltip while a super admin acts as the person (the API refuses both then).
- **Portal** (`ClientPortalCard`, between the duplicates and the privacy, for whoever has `clients.view`): for a client
  signed in to the [client portal](#client-portal), on how many devices and when they last used it; nothing for a client
  with no session. For whoever has `clients.manage`, **Sign out everywhere** asks first, then ends every session
  (`POST /clients/{client}/portal/sign-out`) and the card goes away; a client already gone (404) sends the page back to
  the list. The card keeps that answer to itself: it never
  becomes the page's client, so what the Profile has not saved stays (see [For the team](#for-the-team)).

A client the person may not see, one in the trash or one erased is the API's 404 `clients.not_found`: an empty state with
**Back to the clients**. A client in the trash is restored from the list's trash.

**A module's tab.** A layer adds a tab to a client's page from a plugin, through core's `kit:clients:tabs`; its component
gets the prop `clientId` (string) and `labelKey` is a message key of the layer that brings it:

```ts
// layers/spa/app/plugins/spa-client-tabs.ts
import SpaVisitsTab from "../components/SpaVisitsTab.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:clients:tabs", (tabs) => {
    tabs.push({ id: "spa.visits", order: 50, labelKey: "spa.client_tabs.visits", component: SpaVisitsTab });
  });
});
```

A tab that edits the client saves with the page's bar the way the Profile does (`useSaverEntry()`, its fields in the page's
change set through `useChangeSet()`). A hook that throws keeps every tab off the page: the page shows the error with a
**Retry** (the page's `AsyncBoundary`, as for the client itself), which asks the layers again, never a page with no tabs.

### Importing clients

The list's **Import** opens the import, four steps in mood-ui's `Stepper` (Upload, Columns, Check, Import) over two
pages, for whoever has `clients.import` (see [Import](#import) for what the API does at each one).

- **Upload** (`/dashboard/clients/import`, `pages/dashboard/clients/import.vue`): what a file must be (a CSV with a
  first row that names each column, up to 5 MB and 5,000 clients, the number written as the person's language writes it; clients already there are found by email or phone) and
  mood-ui's `FileInput` to drop or choose it. Choosing one uploads it (`POST /clients/imports`) and opens the import's
  page. A file the browser can tell is over 5 MB or not a `.csv`/`.txt`, and a file the API refuses
  (`clients.import_too_large`, `clients.import_invalid_file`, `clients.import_too_many_rows`), say why on the file;
  anything else (more uploads in an hour than the limiter takes) is the API's message in a toast. The upload's `guess`
  and `sample` stay in the tab (`useClientImportUpload`): the API keeps neither. Leaving the page while the file goes up
  stays where the person went, and keeps nothing of the upload.
- **Columns** (`/dashboard/clients/imports/{id}`, `ClientImportMapping`): a select of the file's headers for each field
  ("Not in the file" for none; the name is required: Check stays off, "Choose the name column", until it has one),
  starting from the upload's guess, or from the choice of the last preview; what to do with a client already there
  (leave them as they are, or fill what they lack); the country code for phones written without one; the home branch of
  everyone it brings (while the workspace works by branch; "Every branch" for none) and tags for all of them (once the
  catalog has one; "None" for none), in a card of their own (**How to import them**); and the file's first lines, titled,
  when this tab uploaded it (after a reload of the page there are none to show, and the columns
  start empty). It says that a marketing consent column marks every client whose cell says yes as agreed, and that this
  answer is the business's responsibility. **Check the file** previews every line (`POST .../preview`); a choice the API
  refuses (a mapping, a branch, a tag) shows above the columns, without a toast.
- **Check** (`ClientImportPreview`): how many clients are new, will be filled in, are skipped and have errors, the tags
  it will add, and the lines with errors by line, field and problem (`ClientImportErrors`; never the value). The tab
  keeps those errors, so they stay when the page is opened again in the same tab; after a reload of the browser they are
  gone, and the page says to check the file again to list them. **Change the columns** (an outline, at the left) goes back with the choice as
  it was; **Import N clients** (at the right, as every step's main action) runs it (`POST .../run`), off when the file brings nobody, and at the plan's limit of
  clients when it brings new ones (the tooltip names the limit).
- **Import** (`ClientImportProgress`): the progress bar, read again 2 seconds after each answer while the import is
  queued or running (never two reads at once; no more once it ends or the page goes), and that the page can be left (a
  notice says when it ends). A read that fails (no connection, 429, 5xx) keeps the progress on screen with a line that
  says it tries again, and the next read waits twice as long after each failure in a row (up to 32 seconds); one refused
  for good (404, 403) stops following it and shows the page's not-found state or the refusal, with its retry. Then what
  came of it: clients added, filled in, skipped and with errors, the lines it could not bring and why, and **Back to the
  clients** at the right; a failed import says so, and when erasing a client ended it
  (`failure: "clients.import_cancelled_by_erasure"`) the banner says that too, and to upload the file again. When it ends, the plan's places are read again (`kit:plan:load-usage`).

A refusal of a check or a run is the API's message in a toast (a full plan, `plans.quota_exceeded`; the minute's checks
and runs spent, 429), and nothing is retried on its own. An upload read past its `expiresAt` says **This upload
expired** at once, with until when it was kept and **Upload it again**; so does 409 `clients.import_wrong_state` when a
new read still finds it uploaded, while one that started elsewhere is followed. An import that is not the person's (the
API's 404) says it could not be found, with the way back to the clients. While a super admin acts as the person, or on a
plan without `clients_import`, both pages say why (with **See plans** for whoever has `subscription.view`), the upload
takes no file and Check and Import stay in view, off, with the reason in their tooltip; an import already running is
still followed.

What the tab keeps of an import (the upload's first rows and guess, the preview's errors) is clients' data: it is
forgotten once the import runs (it leaves `uploaded`), and every import's when the session ends (the layer's
`clients-session` plugin, on `kit:auth:logout`).
