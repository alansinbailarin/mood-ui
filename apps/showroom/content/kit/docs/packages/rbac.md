# Rbac

`backend/packages/Rbac`, namespace `MoodKit\Rbac\`, with the frontend layers `frontend/layers/rbac` (the
roles screens) and `frontend/layers/dashboard` (the signed-in shell and its menu). Roles and permissions per
workspace, the `permission` middleware, and the dashboard menu.

## The model

- **Permissions** are a global catalog, declared in code by providers. A name is `<module>.<action>`:
  `rbac.view`, `invoices.send`.
- **Roles belong to a workspace.** spatie/laravel-permission runs with teams, and the team is always the
  current workspace (read from `CurrentTenant`), so spatie and RLS cannot disagree. `roles` and the three
  pivots have a `tenant_id` and RLS.
- **A member holds one role per workspace.** The same person can be owner in one workspace and member in
  another.
- **System roles** come from role templates and every workspace gets them: `owner`, `manager` and `member`,
  plus what modules add. **Custom roles** are made by a workspace from the roles screen.

The kernel declares, in `MoodKit\Rbac\KernelRbacProvider` (its menu in `KernelMenuProvider`):

| Permission | Notes |
| ---------- | ----- |
| `rbac.view` | see roles and the permission catalog |
| `rbac.manage` | create, edit, delete and give roles. Owner-critical; requires `rbac.view`. |

| Role | Gets | Given by |
| ---- | ---- | -------- |
| `owner` | every workspace permission (`all`) | nobody: a workspace keeps the owner it was created with |
| `manager` | every permission except the owner-critical ones | `owner` |
| `member` | nothing from the kernel; modules add what their members need | `owner` |

"Given by" is the template's `grantableBy`. Giving a role through the API (`PUT /users/{user}/role`) also
needs `rbac.manage`, which is owner-critical, so only owners give roles, and the kernel's templates list only
`owner`. A module's template can add a role to `grantableBy`; its members can give that role only once they
can reach the route, which takes `rbac.manage`.

## Configuration

| Key | Env | Default | Meaning |
| --- | --- | ------- | ------- |
| `rbac.cache_ttl_seconds` | `RBAC_CACHE_TTL` | `3600` | seconds a member's roles and permissions stay cached, per workspace and member |

Changes made through this package or spatie's API forget the cache at once, once their transaction commits,
and so does a member being removed, deactivated or activated. The TTL is how long a change made straight in
the database (raw SQL) takes to show.

What a member can do is cached by `UserAccess` under `rbac:access:{tenant}:{user}:{generation}`: the guard, `/me`, the
menu and `ChecksPermissions` all ask it. Forgetting replaces the member's random generation, so a read that began before
the forget stores what it read under a key nobody asks for any more. Only an active member has any access: someone whose
membership is deactivated (or who never joined) gets no roles and no permissions, and that answer is not stored. Spatie's
own cache of permissions is kept per workspace (`TenantPermissionRegistrar`).

Inside: spatie's team is read from `CurrentTenant` by `TenantTeamResolver`, a queued job included, so `setPermissionsTeamId()`
does nothing here. The pivot of a role and its permissions takes its `tenant_id` from the session, since spatie does not
write it, and foreign keys keep a pivot row to a role of its own workspace and a role to a member of it. Roles and
permissions use the `web` guard, pinned on the models (`UsesWebGuard`): `auth:sanctum` makes sanctum a request's default
guard, and spatie would file a role made then under it. A system role keeps `template_permissions`, what its template has
offered it, which is how `rbac:sync` gives only what it has not offered before.

`backend/packages/Rbac/config/permission.php` holds the spatie settings the kit needs (teams on, the
workspace as the team, the kit's models). They are laid over whatever `config/permission.php` says, so do
not try to change them there.

## Routes

All under `/api/v1`, in the `workspace` group. Ids in paths are plain strings: a role or member that is not
there answers an error of its own, not a bare 404.

| Method and path | Permission | Body | Answers |
| --------------- | ---------- | ---- | ------- |
| `GET /menu` | none | none | `{sections: [{slug, label, items: [{route, label, icon, order, featureFlag}]}]}` |
| `GET /rbac/roles` | `rbac.view` | none | the workspace's roles |
| `GET /rbac/roles/{role}` | `rbac.view` | none | one role with its permissions |
| `GET /rbac/roles/{role}/history` | `rbac.view` | none | the role's changes from the audit trail, `meta.count` |
| `POST /rbac/roles/{role}/preview-impact` | `rbac.view` | `permissions` | what saving those permissions would change |
| `GET /rbac/permissions` | `rbac.view` | none | the catalog, grouped by module, in the request's language |
| `GET /users/{user}/role` | `rbac.view` | none | the role a member holds |
| `POST /rbac/roles` | `rbac.manage` | `name`, optional `slug`, `description`, `permissions`, `clonePermsFromRoleId` | `201`, the role, `meta.autoAddedDependencies` |
| `PATCH /rbac/roles/{role}` | `rbac.manage` | `permissions` (the full list), optional `name` and `description` | the role, `meta.invalidatedUserCount` and `meta.autoAddedDependencies` |
| `DELETE /rbac/roles/{role}` | `rbac.manage` | none | `data: null` |
| `POST /rbac/roles/{role}/undo` | `rbac.manage` | none | the role as it was before its last change, `meta.invalidatedUserCount`, `meta.autoAddedDependencies` and `meta.revertedFromAuditId`. It looks back through the role's latest 50 changes for one it can undo. |
| `PUT /users/{user}/role` | `rbac.manage` | `roleId` | `data: null`, `meta.invalidatedUserCount`: 1, or 0 when the member already held that role alone (nothing is written or audited) |

Labels, role names and descriptions come back in the language of the request. A system role's name and
description are translated (`rbac::roles.*`) until the workspace edits the description.

A change of roles outlasts an impersonation, so every `rbac.manage` route takes `not-impersonating`: a super admin acting as
someone gets 403 `auth.impersonation_forbidden` (see [Auth](auth.md#impersonation)). The preview stays open: it changes
nothing.

## The `permission` middleware

```php
Route::middleware(['workspace', 'permission:invoices.view'])->get('invoices', ListInvoicesController::class);
Route::middleware(['workspace', 'permission:invoices.view,invoices.send'])->post('invoices/{invoice}/send', SendInvoiceController::class);
```

Every permission listed is required. Signed out is 401; a missing permission is 403 `auth.forbidden` with
`meta.requiredPermission` naming the first one lacking. A name nobody declares is a permission nobody has.
Put it after the `workspace` group. Every route of Rbac has one, checked by `RoutesAreGuardedTest`.

## Rules the API enforces

A role's name (2 to 80 characters) and description (up to 500) are plain text on one line (`PlainName`): a control
character, a line break, an invisible formatting character or a mark that turns the direction of the text is refused
with `validation.plain_name`, so a role cannot show a name other than the one stored. The roles screens take the name in
mood-ui's `Input` and the description in mood-ui's `Textarea` (three rows, counting up to 500), which wraps it on screen
and turns each line break typed or pasted into a space (core's `joinLines()`), so it still reaches the API on one line.
The create dialog refuses the same characters before sending (core's `isPlainText()`, kept in step with `PlainName`).

Each refusal is a `DomainError` (codes in [Errors and the API](../concepts/errors-and-api.md#domain-errors)):

- A system role cannot be renamed (`rbac.role_not_editable`) or deleted (409 `rbac.role_is_system`).
- A role someone holds cannot be deleted (409 `rbac.role_has_users`, `meta.usersCount`).
- Slugs and names are unique in the workspace, deleted roles included, and a system slug is never free. A
  name with nothing to make a slug of (emoji, non-Latin script) gets `role`, or the shortest free `role-N`.
- `subscription.view` shows workspace-wide usage counts, so a branch-limited role that has it can work out totals for other branches.
- Permissions must be declared (`rbac.permission_unknown`). Saving a role adds the permissions its
  permissions `require` (`meta.autoAddedDependencies`).
- Only the owner role holds owner-critical permissions, and it cannot lose one. A copy of a role leaves them
  out.
- Giving a role: the person must be an active member (404 `rbac.user_not_found`), the role must be this
  workspace's (`rbac.role_not_in_tenant`), the actor must be allowed to give it (403
  `rbac.role_not_grantable`: a system role by the roles in its template's `grantableBy`, a custom role by an
  owner only), an owner's role is taken only by an owner (`rbac.role_not_grantable`) and never from the last active owner
  (`rbac.last_owner`), anybody who is not an owner changes only the role of someone whose current role they could give
  themselves, or who holds none (403 `rbac.above_your_role`: a manager does not demote another manager), and nobody
  changes their own role (`rbac.cannot_change_own_role`). The `{user}` of the path may come in any case: it is read in
  lowercase, as the database spells it, so a change in capitals is the same member's (and forgets their cached access).
- The last owner who can sign in cannot be deactivated or removed either (`KeepsLastOwner`, a
  `MembershipLeaveGuard`).

Creating, updating and deleting a role, and giving one, write to the audit trail (`rbac.role.created`,
`rbac.role.updated`, `rbac.role.deleted`, `rbac.user_role.assigned`). A role's entries store its whole state
before and after, which is what `undo` puts back, through the same rules.

## Commands

| Command | Does |
| ------- | ---- |
| `php artisan rbac:sync` | validates the registry, adds missing permissions to the catalog, gives each workspace's system roles the template permissions they have not been offered before, then gives every role, a workspace's own included, what its permissions require and it does not hold (`CompleteRoleDependencies`, audited as `rbac.role.updated` with no actor) |

Run it after every deploy that adds permissions, role templates or modules. It only adds: what a workspace
took away from a system role stays away, and it never revokes. The owner role always gets back the
owner-critical permissions. A workspace with a custom role that already uses a system slug stops at that role
and is named in the output (the system roles before it are already updated, the ones after it are not); the
command then exits with a failure, after updating the other workspaces. A new workspace gets
its roles from the same operation at creation (`ProvisionsTenantRoles`), so it needs no sync.

## Contracts for other packages

In `MoodKit\Rbac\Contracts\`:

| Contract | Use |
| -------- | --- |
| `ChecksPermissions` | `allows($tenantId, $userId, $permission)`: the guard's answer for code with no request (a job, a command, another package). It works from any workspace or none. |
| `ProvisionsTenantRoles` | `handle($tenantId)`: give a workspace its system roles. Opens no transaction of its own; call it in the one that creates the workspace. |
| `AssignsInitialOwner` | `assign($tenantId, $userId)`: give a new workspace's first member the owner role. Throws `LogicException` if the workspace already has an owner, the user is not an active member, or the roles were not provisioned. |
| `WorkspaceRoles` | read a workspace's roles, as that workspace: `all($tenantId)` (`RoleSummary` values: id, slug, name in the language of the request, `isSystem`; system roles first), `systemRoleIds($tenantId, $slugs)` (the ids of its system roles, by slug), `holders($tenantId, $roleIds)` (who holds each role that exists, by role id; a deleted role holds nobody) and `localizedName($tenantId, $roleId)` (its name in every language of `support.locales`: a system role by its template, any other by the name the workspace gave it). Notifications sends to the people of a role through it. |
| `MemberRoles` | the roles of a workspace's members, for a package that manages its people (Team), as that workspace: `of($tenantId, $userIds)` (the `RoleSummary` each holds, by user id), `grantable($tenantId, $userId)` (what that person may give), `mayGrant($tenantId, $userId, $roleId)`, `isOwner($tenantId, $userId)`, `activeOwnerCount($tenantId)` (the owners who can still sign in, as `PUT /users/{user}/role` counts them before it takes an owner's role) and `giveOnJoin($tenantId, $userId, $roleId)` (the role someone who has just joined was invited with, audited as `rbac.user_role.assigned`: `member` when that role is gone or is the owner role, nothing when they hold one already; a `LogicException` for someone who is not an active member). Who may give what is the rule of `PUT /users/{user}/role` (`Permissions\RoleGrants`): a system role by the roles its template lists in `grantableBy`, a role the workspace made only by an owner, and nobody gives owner. |
| `PlatformMenu` | `sections()`: the admin host's menu, every section of the `platform` area with its items, in order, in the language of the request. Platform serves it (`GET /platform/menu`). |
| `PermissionProvider`, `RoleTemplateProvider`, `MenuItemProvider` | declare permissions, role templates and menu entries (below) |
| `PermissionDefinition`, `RoleTemplate`, `MenuItem` | the value objects those providers return |

`MoodKit\Rbac\Events\UserRolesChanged` (`tenantId`, `userId`) is dispatched whenever a member is given a role
through the package (`RoleAssignments`), inside the transaction; Rbac itself listens to it to forget that member's cached
access.

`MoodKit\Rbac\Events\MemberRoleAssigned` (`tenantId`, `userId`, `roleId`, `previousRoleId`, `assignedByUserId`) is
dispatched after the commit when someone gives a member another role through `PUT /users/{user}/role`
(`previousRoleId` is null when they held none). Giving someone the role they already hold announces nothing.
Notifications emails the member (`workspace.member_role_changed`), in their language, naming the new role and who gave
it.

Rbac adds `roles` and `permissions` to `GET /me`. A super admin of the platform is no role of a workspace: Platform adds
`isSuperAdmin` (see [Platform](platform.md#in-a-workspace)).

Code that makes or changes roles outside a request or a job runs inside a workspace with
`MoodKit\Tenancy\Context\RunAsTenant` (`app(RunAsTenant::class)->run($tenant, $callback)`; see
[Multi-tenancy](../concepts/multi-tenancy.md)), or `runById($tenantId, $callback)` from an id. Never call spatie's
`setPermissionsTeamId()`: the team follows the workspace and that call does nothing here.

## Registries

A package adds to Rbac with providers, bound and tagged `rbac.permissions`, `rbac.roles` and `rbac.menu`.
The guides walk through each:

- [Add a permission and a menu entry](../guides/add-a-permission-and-menu-entry.md)
- [Add a role template](../guides/add-a-role-template.md)

`RbacRegistry` checks what the providers declare the first time it is used, and `rbac:sync` reports the
same problems before it changes anything.

### Menu sections

A `MenuItem` names a section, and a section is declared like a permission: a `MenuSectionProvider` tagged
`rbac.menu_sections` returns `MenuSection($slug, $labelKey, $order, $area)`. The kernel's are `workspace` (order 0: the
dashboard's home) and `administration` (order 100: roles, settings). Sections are shown by their order, then by slug,
and one with nothing the member may see is left out. The registry refuses a section declared twice, a slug that is not a
lowercase word and an item in a section nobody declares. Feature flags on menu items are passed through untouched.

A section's `area` says whose menu it is: `MenuSection::WORKSPACE` (the default) is the dashboard's, served by
`GET /menu`; `MenuSection::PLATFORM` is the admin host's, served by `PlatformMenu` (Platform's `GET /platform/menu`) and
never by `GET /menu`. An item of a platform section must start with `/platform` and needs no permission, since only a
super admin reaches that menu and permissions belong to a workspace; the registry refuses anything else, and an area that
is neither.

Icons are names that core maps to Heroicons outline components for every menu (the dashboard's and the admin's), in
`frontend/layers/core/app/utils/menu-icon.ts` (`menuIcon()`): `home`, `calendar-days`, `users`, `cog-6-tooth`,
`chart-bar`, `shopping-bag`, `credit-card`, `envelope`, `bell`, `question-mark-circle`, `banknotes`,
`building-storefront`, `link`, `sparkles`, `clipboard-document-list`, `identification`, `tag`,
`user-group`, `briefcase`, `shield-check`, `receipt-percent`, `scale`, `wallet`, `inbox-arrow-down` and `flag`. An
unknown name shows a question mark; add the icon to that file to use another.

## Seeders

`MoodKit\Rbac\Database\Seeders\DemoRolesSeeder` gives the `demo` workspace its system roles and makes
`owner@demo.test` the owner and `member@demo.test` a member. It refuses to run unless `APP_ENV` is `local`
or `testing`.

## The `dashboard` layer

The shell of every signed-in screen. A page uses it with `definePageMeta({ layout: 'dashboard' })`.

- The sidebar is built from `GET /menu`, which is already filtered by what the member may do. Menu entries
  always come from the backend registry, never from the frontend.
- The menu is loaded again when the language changes and when the permissions change.
- The top bar names the workspace (its logo when it has one, and its name, which follows a rename and a switch; the
  platform's name only where there is no workspace) and has the profile menu: the person's own pages, their
  workspaces (switching asks auth through `kit:auth:switch-workspace`), the language and sign out.
- The layout builds each page's breadcrumb, Home, the menu item and the page under it, each menu crumb with the icon the
  sidebar gives it, and hands it to the page (`providePageBreadcrumb`). Core's `PageHeader` shows it above the title, in
  mood-ui's `Breadcrumbs`: a page one level down (the dashboard itself) has none, and on a narrow screen the middle of
  the trail collapses. See [Page anatomy](../frontend.md#page-anatomy).
- `/dashboard` is the landing page after sign-in. It greets the person and has nothing else yet.
- The menu store clears itself on `kit:auth:logout`.

## The `rbac` layer

| Page | Needs |
| ---- | ----- |
| `/dashboard/roles` | `rbac.view`. Lists roles, with a search that filters them by name and description; with `rbac.manage`, also create, duplicate and delete. |
| `/dashboard/roles/[id]` | `rbac.view`. The role editor: a Permissions tab and a History tab, with the undo of the last change saved (`POST /rbac/roles/{role}/undo`), offered while there is no draft and the history holds a change the API can undo (an update; a role only created has none, and the button is disabled with "No earlier change to undo" in its tooltip). From `lg` the Permissions tab has two panes: at the left the name and the description (the full width of the pane) and the permission matrix by module, scrolling with the page; at the right the change-impact panel, sticky and as tall as the pane, up to the visible height. Below `lg` they stack, the impact after the permissions, right above Save. For whoever has `rbac.manage`, core's `PageActionBar` ends the page, always visible: Cancel throws the draft away, Undo steps back through it (each permission, or what was typed in one field, at a time), Review changes lists it before → after (the name and the description, the permissions added and removed as green and red badges), Save sends it, each once the draft has changes. The name, the description and the permissions are the fields of the page's change set (`provideChangeSet`, given to `useRoleEditor` as `changes`). Editing needs `rbac.manage`; without it there is no bar, and neither is there one while the role loads, when it fails to load or when the id is not a role of this workspace. |

It is the model for a module's own screens: a layer with pages under `pages/dashboard/<name>`, each with
`definePageMeta({ layout: 'dashboard', auth: 'required', permission: '<module>.view' })`. When a member edits
their own role, it asks auth to load the session again (`kit:auth:refresh-session`).

## Permissions on the frontend

The rbac layer reads the `permissions` and `roles` of `GET /me` into core (`usePermissionsState()`, the session's
`roles`) from its `rbac-session` plugin, through `kit:session:me`. Nothing is granted until the session is `ready`.

```ts
const { can, canAny, canAll } = usePermissions();
if (can("invoices.send")) { /* ... */ }
```

```vue
<KitButton v-can="'rbac.manage'" :label="t('rbac.create')" :tooltip="t('rbac.tooltips.create')" />
<KitButton v-can="['invoices.send', 'invoices.void']" ... />   <!-- any of them -->
<KitButton v-can:all="['invoices.send', 'invoices.void']" ... />
```

`v-can` hides the element and shows it again when the permissions arrive or change. It is a convenience: the
API is what refuses. `definePageMeta({ permission: 'rbac.view' })` (a list needs all) sends a person
without it to `/dashboard`; pair it with `auth: 'required'`.

While a super admin of the platform acts as a member (core's `useImpersonationGate()`), the roles list keeps New role,
duplicate and delete disabled, with the tooltip "Off while impersonating", and the role editor opens read-only, with no
action bar and no undo: the API refuses those changes then.
