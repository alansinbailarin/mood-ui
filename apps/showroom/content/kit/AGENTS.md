# Working on Mood Kit

How code is written in this repository, for the developers and coding agents who extend it. Each rule
names the tool that enforces it. Rules marked *(convention)* are not checked by any tool, so nothing
fails when one is broken: check those against your diff yourself.

## Buyer documentation

`docs/` is the documentation buyers read: `docs/README.md` indexes it. Every change that adds or changes a
buyer-visible behaviour, config key, env variable, command, route, error code or extension point updates its
`docs/` page in the same commit *(convention)*. Where pages live:

- `docs/getting-started.md`: local setup, the demo workspace, signup through Mailpit.
- `docs/concepts/`: architecture, multi-tenancy, the API envelope and error codes.
- `docs/packages/<name>.md`: one page per backend package, with its frontend layer; `docs/frontend.md` for
  core, layers, hooks, design rules and i18n.
- `docs/configuration/`: the `.env` file, domains, mail, captcha, Sentry, queues and the scheduler, the
  production checklist.
- `docs/guides/`: how-to guides (permissions and menu entries, role templates, secret fields, locales,
  testing).

Write what the code does, checked against the code; when this file and the code disagree, the code wins and
both docs are fixed.

## Quick reference

Gates, from the repo root: `(cd backend && composer check)`, `pnpm --filter ./frontend check`,
`pnpm quality` and `pnpm lint:secrets`. See [Before you claim done](#before-you-claim-done).

The rules broken most often:

1. Controllers query nothing and call an Action. Deptrac blocks the `DB` facade and builders in
   Http; `Model::query()` in a controller is caught by nobody *(convention)*.
2. A package reaches another only through its `Contracts\` and `Events\` (Pest boundary test). A contract or action
   that takes a workspace and a person takes the workspace first (`$tenantId, $userId`) *(convention)*.
3. Colors come from tokens, never palette classes, hex, `rgb()` or a named color like `red` (ESLint
   `no-raw-colors`).
4. A layer imports only itself, `core` and `shared`, and uses no other layer's auto-imports (ESLint
   `boundaries` and `mood-kit/no-cross-layer-auto-import`).
5. Only services call the API, and services are used only inline inside core's request composables
   (ESLint `mood-kit/no-unmanaged-service-call`); what happens to an error inside them is up to you
   *(convention: see Calling the API)*. Text in a template goes through `t()` (ESLint
   `vue/no-bare-strings-in-template`).
6. An event of a package lives in its `Events\` namespace and is sent after the commit (`ShouldDispatchAfterCommit`); the
   few sent inside their transaction are listed with their reason in `tools/EventsInsideTheirTransaction.php`. PHPStan
   (`Tools\PHPStan\EventsAfterCommitRule`, `composer analyse`) checks every call that sends one, `event()`, the `Event`
   facade, a dispatcher or `X::dispatch()`, by type; `tests/Architecture/EventsAfterCommitTest.php` checks every class of
   an `Events\` namespace. Queued jobs are sent after the commit too (`after_commit`).

## Layout

```text
backend/app/              Laravel shell: one middleware (TrustHostsExceptHealth); the User model is in packages/Auth
backend/packages/<Name>/  kernel packages, each with src/ and tests/{Unit,Feature}
backend/tests/            app tests and the architecture tests
frontend/app/             Nuxt shell: app.vue, the home page, main.css with the color tokens
frontend/layers/<name>/   Nuxt layers, each with app/ (source) and tests/ (Vitest)
frontend/shared/          Nuxt's shared/ for code the app, layers and server all use (not created yet)
frontend/tests/e2e/       Playwright visual tests
docs/                     the buyer documentation (see Buyer documentation)
```

A feature of your own is a package in `backend/packages/` plus a layer in `frontend/layers/`, and kit code never
references it *(convention)*.

## Before you write code

1. Reuse first: `backend/packages/Support` (the API envelope) and `frontend/layers/core` (the
   envelope helpers). Extend them instead of re-implementing what they do *(convention; jscpd
   only catches copied code)*.
2. Write the failing test, then the code *(convention)*, and finish with the gates below.

Never weaken a gate to get a green run *(convention)*: no lowered coverage thresholds, no new
exclusions in `deptrac.yaml`, `.jscpd.json` or `knip.jsonc`, no `@phpstan-ignore` comments, no
screenshot updates that hide a diff. (An `eslint-disable` comment does nothing: ESLint ignores inline
config and fails on a leftover directive, `<!-- eslint-disable -->` in templates included.) If a rule
is wrong, change it in its own commit and say why.

## Backend

### Packages

- Kernel code lives in `backend/packages/<Name>` under `MoodKit\<Name>\`, mapped to `src/` in the
  package's own `composer.json`. The architecture tests read the namespace from that psr-4 entry,
  and fail on a package without a manifest, a psr-4 entry for `src/`, PHP classes or autoloading.
- To add a package, copy `packages/Support/composer.json` to `packages/<Name>/` and change the
  name (`mood-kit/<name>`), description, psr-4 namespace, provider class and requirements. Require it in
  `backend/composer.json` as `"mood-kit/<name>": "@dev"` and add `"mood-kit/<name>": "dev-main"` to
  the path repository's `versions` map. Without that entry it still installs, but `composer.lock`
  records `dev-<current branch>`. Run `composer update mood-kit/<name>` and commit both files.
- Every class in `app/` and `packages/` must land in a Deptrac layer (`composer deps` also runs
  `deptrac debug:unassigned`), so package classes cannot live outside `MoodKit\`.
- A package that reads a credential from a request registers where it travels with Support, from its provider's `boot()`,
  so that it is blanked in what goes to Sentry: a header with `MoodKit\Support\Reporting\SecretHeaders`, a body field (or
  query parameter) with `MoodKit\Support\Reporting\SecretFields` (Audit redacts these in its entries too), a path that
  must carry one (`.../{secret}`) with `MoodKit\Support\Reporting\SecretPaths`. A field that is no credential but has no
  business in Sentry (what someone typed, where they are) goes in `Reporting\SentryOnlyFields`, which Audit does not read:
  Geocoding registers `query`, `latitude` and `longitude` there, Search `q`. The map's searches and the palette's search
  take what was typed in a `POST` body, never a query string, so it never sits in a URL or an access log. Signup does
  `$this->app->make(SecretHeaders::class)->add(SignupTokenRequest::HEADER)` and
  `$this->app->make(SecretFields::class)->add('verification', 'password', 'claim', 'captchaToken', 'invite')`; Auth registers `password`,
  `passwordConfirmation`, `currentPassword`, `token`, `code` and `captchaToken`. A field is blanked at any depth, so a common name covers every
  request that uses it. A test of the package shows what it registers (Signup's in `SignupStatusTest`, Auth's in
  `LoginTest`). *(convention)*
- Packages register their own routes from their service provider, under the `api/v1` prefix and the `api`
  middleware group: the frontend's `NUXT_PUBLIC_API_BASE_URL` ends in `/api/v1`. The exception renderer
  and `ForceJsonEnvelope` cover every `api/*` path, whatever the version. *(convention; `IdentifyTenantTest` checks the tenant route)*
- Keep `backend/app` a thin shell *(convention)*: it is outside the coverage gate and the package
  boundary test.
- Uploaded files go through `MoodKit\Support\Storage\AssetDisk` (write, address, delete) on the disk `ASSETS_DISK`
  names, under keys from `AssetPath::forTenant()`, or `AssetPath::forUser()` for a person's file; never
  `Storage::disk()` for them, so a file is always read and deleted on the disk it was written to. A deletion the disk
  refuses throws: forget a file's key only after `delete()` returned, and in the cleanup after another failure report it
  (`rescue()`) rather than throw it over that failure. A key a client sends back is checked with
  `AssetPath::belongsTo()` (`belongsToUser()` for a person's). `php artisan assets:prepare-bucket` creates the local
  MinIO bucket and refuses to run in production. *(convention; tested in Support's `AssetDisk*Test` and Settings' logo
  tests)*
- A package that checks a permission of its own, beyond the `permission:` guard, refuses with
  `MoodKit\Support\Errors\PermissionDenied` (403 `auth.forbidden`, `meta.requiredPermission`), as the guard does.

### Layers (Deptrac, `composer deps`)

A class's layer comes from the namespace segment right after the package root, as in
`MoodKit\Billing\Http\InvoiceController`.

| Layer     | Classes                                                | May depend on                |
| --------- | ------------------------------------------------------ | ---------------------------- |
| Http      | `<Package>\Http\...`                                   | Domain, Dto, Models, Shared  |
| Domain    | every other `MoodKit\` class: Actions, Services, Jobs  | Dto, Models, Shared, Database |
| Models    | `<Package>\Models\...`                                 | Shared, Database, Factories  |
| Factories | `<Package>\Database\Factories\`                        | Models, Shared, Database     |
| Seeders   | `<Package>\Database\Seeders\`                          | Domain, Dto, Models, Shared, Database, Factories |
| Shared    | `<Package>\Contracts\`, `Events\`, `Enums\`            | Shared only                  |
| Dto       | `<Package>\Dto\`: an action's result, a package's own  | Shared, Models               |
| Providers | `MoodKit\` classes ending in `ServiceProvider`         | Http, Domain, Dto, Models, Shared |
| App       | `App\...` (`backend/app`), its providers included      | every layer but Factories    |
| Database  | `DB` facade, Query and Eloquent `Builder`, connections | none                         |

Other framework and vendor classes belong to no layer and are never reported. In practice:

- Http never uses the `DB` facade, a query builder or a connection. Controllers delegate to Actions
  *(convention)*: Http may use Models, so Deptrac cannot see `Invoice::query()` in a controller.
- Shared depends only on Shared, so contracts, events and enums never reference a model. Events carry IDs or a value
  object of `Contracts\`. A `Dto\` never leaves its package (the boundary test), so it may carry the package's models: an
  action returns a readonly result there (`CreatedRole`, `SavedRole`), never an array or a tuple *(convention)*.
- Models cannot use Actions or Services, and service providers cannot use the Database classes. A model may name
  its factory (`newFactory()`); nothing else uses factories or seeders.

### Between packages (Pest, `tests/Architecture/PackageBoundariesTest.php`)

- A package reaches another package only through that package's `Contracts\` and `Events\`
  namespaces. Its `Dto\`, `Enums\` and `Models\` are off limits, so a DTO that crosses packages
  lives under `Contracts\` or `Events\`.
- Every package may use `MoodKit\Support\` directly, and `MoodKit\Tenancy\` too. `Support` depends on
  no other package, `Contracts` and `Events` included: a package that `Support` used could use `Support`
  back.

### Tenancy (`packages/Tenancy`, `Support\Database\TenantRls`)

What the package does: [docs/packages/tenancy.md](docs/packages/tenancy.md) and
[docs/concepts/multi-tenancy.md](docs/concepts/multi-tenancy.md). The rules:

- A table with a `tenant_id` (uuid) calls `TenantRls::enable($table)` in its migration, and has no other permissive
  policy (`allowGlobalRows`, `userColumn` are the only options). Shared rows are written in the migration before
  `enable()`. A foreign table or a materialized view never has a `tenant_id`. *(tested: a Pest test and
  `php artisan tenancy:verify-rls`)*
- The app connects as a runtime role that owns nothing (`DB_USERNAME`); the migrations run as the schema owner
  (`DB_MIGRATION_USERNAME`). `tenancy:verify-rls` fails when the runtime role owns any table, view or sequence, and
  production sets `TENANCY_ENFORCE_RLS=true` (false only for the one command that needs a privileged role). *(tested by
  `DatabaseRoleTest`, `SchemaOwnerTest`, `RlsCoverageTest`, `EnforceRlsTest`)*
- A route that needs a workspace uses the `tenant` middleware. Other packages read the tenant through
  `Tenancy\Contracts\CurrentTenant` (`requireId()`, or `require()` for a `TenantSummary`), never `Context\TenantContext`
  *(convention)*.
- `GET /tenant` gets keys from a `TenantPayloadContributor` tagged `tenancy.public`, which says only what anyone who knows
  the workspace's address may see and cannot replace `slug` or `name`. *(tested by `CurrentTenantPayloadTest`)*
- Reserved slugs live in `packages/Tenancy/config/reserved_slugs.php`, one per line, sorted; never reserve `demo`.
  *(tested by `ReservedSlugsTest`)*
- Code with no request or job (a command, a seeder, a worker that has just made the workspace) runs as one with
  `RunAsTenant::run($tenant, ...)` or `runById($tenantId, ...)`, resolved from the container. Never call
  `TenantRlsSession::runAs()` yourself: it sets the RLS setting without the context. *(tested by `RunAsTenantTest`)*
- Reading data of more than one workspace goes through `Tenancy\Platform\ReadsAcrossWorkspaces::read($purpose, $query)`,
  never a `withoutGlobalScopes()`, a privileged connection of your own or a write: it runs as the platform's read-only
  role and logs every read in `platform_reads`. A migration grants that role a table with `PlatformRead::grant()` only when
  a platform screen needs it, never a table that holds a secret. Only `Tenancy\Platform\` names the platform role's
  connection or its `support.platform_reader.*` settings (besides the config, `PlatformRead` and `PlatformRoleCheck`, which
  read the role's name). *(tested by `PlatformReadsTest`, `PlatformRoleCheckTest`,
  `PlatformConnectionTest`)*
- A table only the schema owner writes (a catalog a command writes as it) takes the runtime role's writes away in its
  migration (`Support\Database\RuntimeRole::revoke(RuntimeRole::WRITES, ...)`) and is listed in
  `Support\Database\ReadOnlyTables` from its package's provider. `tenancy:verify-rls` fails when the runtime role may
  write one of those, or of `CatalogTables`, whole or by a column. *(tested by `RlsCoverageTest` and
  `php artisan tenancy:verify-rls`)*
- The catalog's writer (`DB_CATALOG_USERNAME`) is the only role besides the schema owner that writes the catalog's
  tables, and only from the super admin's editor. A migration grants it a table with
  `Support\Database\CatalogWrite::grant($privileges, ...$tables)` (SELECT, INSERT, UPDATE or DELETE, never TRUNCATE or
  ALL), and its package lists the table from its provider with the same privileges,
  `Support\Database\CatalogTables::add($privileges, ...$tables)` (a table listed again with other privileges throws).
  `tenancy:verify-rls` fails unless the role holds exactly those privileges of each listed table and reads or writes
  nothing else, whole, by a column or through a view; it also fails when the role is a superuser, bypasses RLS, belongs
  to a role or has one belong to it (however granted), is a role the app's role may become (`SET ROLE`), has
  `INHERIT`, owns or creates anything (in the schema or the database), logs no writes (`log_statement`), uses a sequence,
  may add a trigger to or reference a table, or reaches a schema other than `public`. Only
  `Support\Database\CatalogWriter` opens its session or names its connection and `DB_CATALOG_*` settings (besides the
  config, `CatalogWrite` and `Tenancy\Rls\CatalogRoleCheck`), and only Plans' editor (`Plans\Editor\`) and Billing's
  `Prices\PlanPriceOffers` use it; only it and Tenancy's `PlatformReads` open a `Support\Database\RoleSession`. The
  architecture sweeps that keep this (exact lists of files, code read with its literals decoded and joined) are a
  guardrail against mistakes; the grants, which `tenancy:verify-rls` checks, are the boundary. With no role configured
  the catalog cannot be edited (`CatalogWriterUnavailable`): nothing falls back to another role. *(tested by `CatalogWriterTest`, `CatalogWriteTest`, `CatalogWriterSessionTest`, `CatalogRoleCheckTest` and
  `php artisan tenancy:verify-rls`)*
- A job queued with `dispatchAfterResponse()` implements `TenantScopedJob` to carry its tenant *(convention)*.
- The database is reached directly or through a pooler in session mode, never transaction mode.
- `BranchScope`, `BranchAccess` and `CurrentBranch` live here, bound to `Branches\WholeWorkspace` with `bindIf`: Branches
  binds its own (see Branch scope).

### Branch scope (`Tenancy\Contracts\CurrentBranch`, `BranchAccess`)

How a module follows the branch: [docs/guides/scope-data-by-branch.md](docs/guides/scope-data-by-branch.md). The rules:

- Whatever must follow the branch follows it through Tenancy's contracts: a list with `CurrentBranch::scope()->branchIds()`
  (null: narrow nothing; `[]`: nothing of a branch; `[id]`: that branch's), one record with `BranchAccess::allows()`, who
  works where with `peopleOf()`, whether it applies with `inUse()`. Nothing outside Branches (nor the backend's `app/`,
  `routes/`, `config/` and `database/`) reads `branch_members`, `branch_selections` or the `branches.all` permission, and no
  branch a client sends is taken as a scope: a filter the person chooses is checked with `allows()`. A module lists
  branches to a person with `ReadsBranches::visibleTo()`, never `allActiveForSystem()` as it is. *(tested by `BranchScopeTest`, `CurrentBranchTest`, `BranchAccessTest`)*
- Row-level security is the workspace's boundary only; access by branch is a rule of the application on top of it (why:
  `docs/concepts/multi-tenancy.md`). *(convention)*
- A record of a branch has `branch_id` with the composite key to `branches` (`attach-data-to-branches.md`); its audit
  entries pass `branchId` to `AuditLog::record()` (the record's branch, never the one in the switcher); its notifications pass
  `branchId` to `NotificationRequested` (and its event type is `branched` if it may go to the people of the branch); its
  domain events carry `branchId`. *(convention; tested by `AuditBranchTest`, `BranchNoticesTest`)*
- What follows the branch in the kernel: the team list, the branches' list and page, a branch's history, the inbox's
  "only this branch", the notifications (the `branch` audience; nobody gets one of a branch they may not see), the global
  search (each source as its list), the home's widgets (each as its list; the plan's never), and the clients by their home
  branch (the list keeps the top bar's branch and the clients of none; a client opens when its home
  branch is one the person sees, or it has none). What does not: settings, roles, the plan and billing, the profile, the
  onboarding, the platform's admin and the clients' tags. **From 3C on, every plan says what of its own follows the branch
  and what does not.** *(convention; tested by `MembersByBranchTest`, `BranchVisibilityTest`, `BranchHistoryTest`,
  `InboxBranchTest`, `BranchAudienceTest`, `ClientsByBranchTest`)*
- `subscription.view` shows workspace-wide usage counts, so a branch-limited role that has it can work out totals for other branches. *(convention)*
- The frontend never sends the branch: it reads it from core (`useCurrentBranch()`) and loads again with
  `useBranchReload()`. *(convention)*
- A test that follows the branch without Branches' tables binds `MoodKit\Tenancy\Testing\FakeBranches`. *(convention)*

### Auth (`packages/Auth`)

What the package does: [docs/packages/auth.md](docs/packages/auth.md). The rules:

- A route for a signed-in member uses the `workspace` middleware group, never `auth:sanctum` alone; a signed-in client of
  the portal uses Clients' `portal` group, and a signed-in super admin Platform's `platform` group. A public route uses
  `tenant` alone, says why it is public, and has a named limiter of its own, never `throttle:n,m`: login, the password
  reset, the handoff, `GET /tenant`, Team's invitation lookup and acceptance, and the portal's `GET /portal`,
  `POST /portal/code` and `POST /portal/session`. *(tested by `TokenTenantBindingTest`, `ThrottleIsolationTest`,
  `CurrentTenantThrottleTest`, `PortalRoutesTest`)*
- Platform's `platform` and Clients' `client-portal` are guards of their own tables (`Auth::viaRequest()`), neither is
  Sanctum's, and `client-portal` never becomes the default: no route takes `auth:client-portal`. A token of one kind (a
  member's or an impersonation's, the admin's, a client's) is in no table of another, and signs nobody in on its routes.
  *(tested by `HostSeparationTest`, `PortalGuardTest`, `PortalRoutesTest`)*
- Queries of `memberships` filter by both the `tenant_id` and the `user_id` they mean: RLS alone shows a workspace's or a
  user's whole set *(convention)*.
- `IssueToken` is the only code that creates login tokens; never `$user->createToken()` elsewhere. Prune tokens with
  `auth:prune-tokens`, not `sanctum:prune-expired`. *(tested)*
- A login failure is always the same `auth.invalid_credentials` 401, and an unknown email still costs a hash: never add a
  failure with a code or message of its own. Run `auth:warm-dummy-hash` in the deploy script, with a persistent cache.
  *(tested by `LoginTest`)*
- A request that carries a password, a secret or a code uses `ReadsJsonBodyOnly`. *(tested in each)*
- A change that would hand the account to whoever holds a session (the password, the email) asks for the current password
  through `CheckCurrentPassword` and is limited per person by `auth-sensitive`; protecting the account (signing sessions
  out) never asks for it. *(tested by `ChangePasswordTest`, `EmailChangeTest`)*
- A code sent by email (a change of email) is made inside the job that mails it and stored as an HMAC; the request only
  queues the job and answers the same whether the address has an account or not. *(tested by `EmailChangeTest`)*
- A route that would hand the account over (password, email, sessions, a switch of workspace), touches money, deletes or
  leaves a change that outlasts the session refuses an impersonation: `not-impersonating` after `workspace` (it runs
  ahead of the route's limiters), and every `DELETE` of the `workspace` group is refused by `GuardImpersonation`
  whatever route it is. Refused: the account's routes, `PATCH /me/profile`, `POST /me/avatar`,
  `PUT /me/notification-preferences`, Billing's checkout, confirmation, change and portal, Rbac's role writes
  (`PUT /users/{user}/role`, `POST /rbac/roles`, `PATCH /rbac/roles/{role}`, `POST .../undo`), Notifications' audiences,
  templates, resend and inbox writes, Team's invitations (invite, resend) and a member's status (deactivate,
  reactivate), Branches' new branch and a branch's status (deactivate, reactivate), Clients' new client and a client
  back from the trash (`POST /clients`, `POST /clients/{client}/restore`, which spend the plan's), merging two clients
  (`POST /clients/{client}/merge`) and erasing one for good (`POST /clients/{client}/erase`), which cannot be undone,
  uploading a CSV of clients to import, previewing it and running it (`POST /clients/imports`,
  `POST /clients/imports/{import}/preview`, `POST /clients/imports/{import}/run`), which bring many clients in at once
  (running spends the plan's), and two `GET`s, a client's data for the client (`GET /clients/{client}/privacy-export`)
  and the list of clients as a CSV file (`GET /clients/export`), which write nothing but take people's data out of the
  workspace. Allowed on purpose
  (support may need them; audited with `impersonator_user_id`): sign-out and Exit, `me/locale`, `me/theme`, the branch
  the person works at (`PUT /me/branch`, kept for that impersonation alone, never the person's own choice),
  `realtime/auth`, the workspace's settings and logo, `PUT /notifications/settings`, the onboarding's actions, the two
  previews, the team's skills and a member's hours and skills (Team's onboarding step still refuses to invite), a
  branch's data, hours and people (Branches' onboarding step still refuses to add a branch), a client's name, language,
  home branch and custom fields (`PATCH /clients/{client}`; `UpdateClient` still refuses a change to the person's contact
  data, birthday, address, notes or consent), the clients' tags (add, rename), a client's tags and tagging in bulk
  (`PUT /clients/{client}/tags`, `POST /clients/tags/apply`), ending a client's portal sessions
  (`POST /clients/{client}/portal/sign-out`) or every portal session of the workspace (`POST /clients/portal/sign-out`), which
  protects them, the map's two searches (`geocoding/search`, `geocoding/reverse`) and the palette's search (`POST /search`),
  which change nothing.
  A new write route of the `workspace` group goes in one list or the other. Never build a session from an impersonation
  token. *(tested by `ImpersonationGuardTest` and `ImpersonationRoutesTest`, which lists both and fails on a write route
  in neither)*
- A token or a reset secret never travels in a query string: a switch hands a one-time code, a reset link carries its token
  and email in the fragment (Tenancy's `WorkspaceUrl::to(..., fragment:)`). `next` must pass `InternalPath`. *(tested by
  `HandoffTest`, `ForgotPasswordTest`)*
- `GET /me` gets keys from a `MePayloadContributor` tagged `auth.me`, which receives ids and cannot replace the base keys.
  *(tested by `SessionTest`)*
- Change a membership's status only with `Membership::deactivate()`, `activate()` and `remove()`: never a bulk update
  (`Membership::query()->update(['status' => ...])`, `DB::table('memberships')`) and never inside `withoutEvents()`, or old
  tokens come back and nobody hears of it. Veto a member leaving with a `MembershipLeaveGuard` tagged
  `auth.membership_guards`. *(convention; `MembershipStatusTest` scans the source. Tested by `MembershipBindingTest`,
  `MembershipLifecycleTest`, `LastOwnerGuardTest`, `OwnerRaceTest`)*
- `POST /auth/forgot-password` only queues `DeliverPasswordResetLink`: no query about the email in the request.
  *(tested by `DeliverPasswordResetLinkTest`)*
- Every form refuses a failed captcha with Support's `CaptchaFailed` (422 `auth.captcha_failed`). *(tested)*
- Values people typed that go into a Markdown email are escaped for Markdown and HTML with `MarkdownText::escape()`, or put
  into a translated line with `MarkdownText::line()` (never `__()` with escaped values: `{{ }}` would escape the line again);
  an email template prints with `{{ }}` only, never `{!! !!}` or `@lang`. *(`MailTemplatesTest`; tested by
  `ResetPasswordMailTest`)*
- Other packages use Auth through `Auth\Contracts\` and ids, never a model; `CreatesMembers::create()` takes a password
  *hash*, never a password. *(tested by `CreateMemberTest`, `IssueHandoffLinkTest`)*
- The demo users exist in local development and tests only. *(tested by `DemoUserSeederTest`)*
- In production the app answers only for `APP_URL`'s host and the root domain with its subdomains (`/up` on any host),
  believes `X-Forwarded-*` only from `TRUSTED_PROXIES`, and lets in cross-origin requests only from the frontend's origins
  (`config/cors.php`). *(tested by `TrustedHostsTest`, `TrustedProxiesTest`, `CorsTest`)*

### Rbac (`packages/Rbac`) and Audit (`packages/Audit`)

What the packages do: [docs/packages/rbac.md](docs/packages/rbac.md) and [docs/packages/audit.md](docs/packages/audit.md).
The rules:

- Code that makes or changes roles runs inside a workspace (a request, a job, or `RunAsTenant`). Never set spatie's team
  yourself (`setPermissionsTeamId()` does nothing here). *(tested by `TeamsAndRlsTest`)*
- Never cache permissions for a user alone; ask `UserAccess` (the guard, `/me`, the menu and `ChecksPermissions` do).
  A change in raw SQL shows only after `RBAC_CACHE_TTL`: change roles with this package or spatie's API. *(tested by
  `PermissionCacheIsolationTest`, `UserAccessTest`, `InactiveMemberAccessTest`)*
- Roles and permissions use the `web` guard (`UsesWebGuard`).
- **Exception to the package boundaries**: Auth's `User` uses spatie's `HasRoles`. Rbac reaches Auth only through
  `MemberDirectory`. Give a role with `AssignRole` (the rules) or `RoleAssignments::replace()` (none, for seeders).
- A package adds permissions, role templates, menu sections and menu items with providers tagged `rbac.permissions`,
  `rbac.roles`, `rbac.menu_sections` and `rbac.menu`, returning `Rbac\Contracts\` value objects, the only part of Rbac a
  module may use besides the interfaces:

  ```php
  $this->app->tag([BillingRbac::class], ['rbac.permissions', 'rbac.roles', 'rbac.menu_sections', 'rbac.menu']);

  new PermissionDefinition('invoices.view', 'invoices', 'billing::permissions.invoices.view.label', 'billing::permissions.invoices.view.description');
  new PermissionDefinition('invoices.send', 'invoices', 'billing::permissions.invoices.send.label', requires: ['invoices.view']);
  new RoleTemplate('manager', 'rbac::roles.manager.name', permissions: ['invoices.view', 'invoices.send']); // added to the kernel's manager
  new MenuSection('billing', 'billing::menu.sections.billing', order: 50); // between the kernel's workspace (0) and administration (100)
  new MenuItem('/dashboard/invoices', 'billing::menu.invoices', 'receipt', 'billing', order: 10, permission: 'invoices.view');
  ```

  Names are `<module>.<action>`; every label key has an `en` and an `es` line; a module never redeclares the owner role
  nor gives it a `grantableBy`, and gives an owner-critical permission to no other role. `RbacRegistry` refuses the rest.
  *(tested by `RbacRegistryTest`, `RegistryTranslationsTest`)*
- Guard every route of Rbac with `permission:a,b` after the `workspace` group. *(tested by `RoutesAreGuardedTest`)*
- Run `php artisan rbac:sync` after a deploy that adds permissions, templates or modules; it only adds, and gives every role
  what its permissions require and it lacks (a role saved before a permission gained a requirement). *(tested by
  `SyncCommandTest`, Branches' `ManageWithoutAllTest`)*
- Whoever creates a workspace calls `ProvisionsTenantRoles::handle()` and `AssignsInitialOwner::assign()` inside the one
  transaction that creates it. *(tested by `ProvisionTenantRolesTest`, `AssignInitialOwnerTest`)*
- Every role rule refuses with a `DomainError` of its own, its message in `lang/{en,es}/errors.php`. *(tested by
  `Roles*Test`, `AssignRoleTest`, `UndoRoleChangeTest`)*
- Record audit entries with `Audit\Contracts\AuditLog::record()`, inside a workspace, with an action and resource type
  from the package's `AuditEntries` (`<package>.<resource>.<what happened>`), and with `branchId` when the resource belongs
  to a branch. Never update or delete an entry: the table is append-only, and only its owner (a migration) can drop the
  triggers. *(tested by `AuditLoggerTest`, `AuditAppendOnlyTest`, `AuditBranchTest`)*

### Settings (`packages/Settings`)

What the package does: [docs/packages/settings.md](docs/packages/settings.md). The rules:

- Only `Actions\UpdateSettings` writes `tenant_settings` (from the API, or from code through
  `Contracts\UpdatesWorkspaceSettings`); never `TenantSetting::query()->update()` or `DB::table('tenant_settings')`.
  *(convention; tested by `UpdateSettingsTest`)*
- `UpdatesWorkspaceSettings` checks no permission: code that saves on a member's behalf asks
  `Contracts\ChecksSettingsAccess::missingToEdit()` first, as the onboarding's kernel steps do. *(tested by
  `SettingsApiTest`, `KernelStepsTest`)*
- Groups come from a `SettingsGroupProvider` tagged `settings.groups` (slugs snake case, keys camelCase and never
  `versions` or `confirm`, every label in `en` and `es`); `KernelSettingsProvider` is the template. *(tested by
  `SettingsRegistryTest`, `GroupTranslationsTest`)*
- A module that a change would affect says so with a `ChangeImpactProvider` tagged `settings.change_impacts`.
  *(tested by `UpdateSettingsTest`)*
- `tenant_setting_history` is append-only; nothing but its trigger writes it. *(tested by `SettingHistoryTableTest`)*
- Nothing but saving `identity.name` writes `tenants.name` once the workspace exists. *(tested by `UpdateSettingsTest`)*
- A workspace's timezone, language and currency are the `localization` group, read through
  `Contracts\ReadsWorkspaceSettings`, never columns of `tenants`. *(tested by `WorkspaceSettingsContractsTest`)*
- The logo is a file, not a key: checked by its bytes and written again by GD through Support's `RasterImage`, and
  stored with `AssetDisk`; a presigned upload goes to `uploads/`, never to a key a file is served from. `ext-gd` is
  required. *(tested by `LogoUploadTest`,
  `PresignedLogoTest`, `LogoRemovalTest`, `DeleteLogoObjectTest`)*

### Plans (`packages/Plans`)

What the package does: [docs/packages/plans.md](docs/packages/plans.md). The rules:

- A module declares its quota resources and feature flags with providers tagged `plans.quota_resources` and
  `plans.features`, returning `Plans\Contracts\` value objects; every label key has an `en` and an `es` line. *(tested
  by `PlansRegistryTest`, `PlansTranslationsTest`)*
- The catalog has two writers, and the runtime role only reads it. `backend/config/plans.php` seeds it through
  `php artisan plans:sync`, as the schema owner, which writes whatever the admin did not edit and keeps what it did
  (`plans.edited`, a mark per field, limit and feature; `--forget-edits=<slug>` drops a plan's marks so the config
  writes it again). The super admin edits it through `Contracts\EditsCatalog`, as the catalog's writer, in a transaction
  of the writer's own session (`Editor\CatalogSession`). Both take the `plans:catalog` lock, lock the plan rows with
  `Catalog\PlanRows::locked()` (`FOR NO KEY UPDATE`, never `lockForUpdate()`, which waits on the key lock of every open
  insert of a subscription) and write them only through `Catalog\PlanRows`, which moves a plan to its next version and
  writes its revision (`plan_revisions`, append-only) in the same transaction. Two plans on sale never share a tier
  (`plans_tier_on_sale`, deferred to the commit): the editor puts a plan going on sale at a taken tier last, and the sync
  places a new plan of the config last when any plan has its tier. Nothing else writes `plans`,
  `plan_features`, `plan_quotas` or `plan_revisions`. The editor reads a plan's terms with the version they are at in
  one statement from the tables (`EditsCatalog::plans()`, `EditablePlan`), never from the cached catalog, and forgets
  the cached catalog once its session commits. *(tested by `SyncPlanCatalogTest`, `SyncKeepsEditsTest`, `EditPlanTest`,
  `EditPlanRaceTest`, `CreateAndReorderPlansTest`, `CatalogWriterGrantsTest`)*
- Only Platform's admin reaches `EditsCatalog`. A change that takes something from the workspaces on a plan (a price,
  a lower limit, a feature) waits for a confirmation (`EditOutcome::NeedsConfirmation`, with its impacts and a token,
  `Editor\Confirmation`, that confirms that change of that version alone), and a lower limit keeps what a workspace
  has over it and lets it add no more. *(tested by `CatalogEditorTest`, `EditPlanTest`)*
- Nothing names a plan by its slug: compare plans by `tier`, and ask `ChecksFeatures` or `EnforcesQuotas`. *(convention)*
- A route of a feature a plan may leave out uses `feature.enabled:<slug>` after `workspace` and `permission:`; code that
  decides by itself asks `ChecksFeatures::allows()`. A feature is off unless the plan lists it. *(tested by `FeatureFlagsTest`)*
- Code that creates something a plan limits calls `EnforcesQuotas::ensureCanCreate($tenantId, $resource)` inside the
  transaction that creates it, before the insert. While a move down is scheduled (a `ScheduledPlanLimits` tagged
  `plans.scheduled_plans`, as Billing's), the lower limit of the two plans holds. A `MemberSeats` answers a query of the
  places it holds, never a number, so the `members` quota counts them with the active members in one statement; a change
  that moves a place between the two takes the quota's lock with `EnforcesQuotas::hold()`. Clients' `clients` quota (live
  clients, `QuotaPeriod::Total`) is asked for `$n` at once by an import, part by part; its feature `clients_import` guards
  an import's upload, preview and run, not its report (`GET /clients/imports/{import}`), which the uploader still reads
  once the plan leaves the feature out. *(tested by `QuotasTest`, `ScheduledPlanLimitsTest`, `MemberSeatsTest`, Clients'
  `ImportRunTest`)*
- A scheduled task of a subscription leaves alone the ones Stripe moves (`stripe_subscription_id`), and enters each
  workspace with `RunAsTenant` (`EveryWorkspace`, which reports a workspace that fails through `MaskedFailure`). *(tested
  by `TrialSchedulesTest`, `EveryWorkspaceTest`)*
- A plan the platform gives a workspace goes through Plans' `GrantsPlans` (`managedBy: platform`), never a write of its own
  and never a call to Stripe: a grant never replaces a subscription Stripe bills (`GrantOutcome::BilledByStripe`, which
  Platform answers 409 `platform.workspace_billed_by_stripe`), nor ends in the past once it holds the lock
  (`GrantOutcome::EndsInPast`, 422 `platform.grant_ends_in_past`), both take the workspace's subscription lock, and an
  ended or revoked grant falls back to the default plan the way a Stripe subscription that is over does
  (`SubscriptionRows`). Billing opens no checkout and changes no plan while a grant lasts (409 `billing.plan_granted`).
  *(tested by `PlanGrantTest`, Billing's `CheckoutTest` and `ChangePlanTest`, Platform's `PlanGrantsTest` and
  `PlanGrantRaceTest`, with two real sessions)*
- Only Plans writes `tenant_subscriptions`. Billing moves a subscription through `AppliesBilling` (a Stripe subscription
  started, changed or ended) and reads the catalog and what a workspace may move to through `ReadsCatalog`,
  `PlanEligibility` and `ReadsPlan`. *(tested by `ApplyBillingTest`, `CatalogContractsTest`)*

### Billing (`packages/Billing`)

What the package does: [docs/packages/billing.md](docs/packages/billing.md) and
[docs/configuration/stripe.md](docs/configuration/stripe.md). The rules:

- Every call to Stripe goes through `Stripe\StripeConnection::call()`, with the container's `StripeClient` on the pinned API
  version; never `new StripeClient`, never a key in code, a test or `.env.example`. A test binds `fakeStripe()`: no test
  reaches Stripe or needs a key. *(tested by `StripeConnectionTest`)*
- Stripe's objects are read only through `Stripe\StripeSubscriptionReader`. *(tested by `StripeSubscriptionReaderTest`)*
- Billing never writes `tenant_subscriptions`: a change of a workspace's plan from Stripe goes through
  `SyncStripeSubscription`, which reads the subscription again under its lock and calls Plans' `AppliesBilling`. No handler
  applies an event's object as it came. *(tested by `SyncStripeSubscriptionTest`, `SyncRaceTest`, `StripeWebhookTest`)*
- The webhook believes nothing before `Stripe\Webhook::constructEvent()` checks the signature, refuses a body that is no
  event with a 400 (never a 500), takes each event once by `(handler, event_id)`, and logs an event only once it was
  handled, so Stripe retries a failure. *(tested by `StripeWebhookTest`)*
- A workspace's checkouts take turns under a lock of their own, and so do its plan changes: whatever reads what is open in
  Stripe and then opens or changes something does it inside that lock. A billing lock is taken with `Locks\BillingLock`,
  which bounds the transaction's wait (`billing.lock_timeout_seconds`), never `TransactionLock` alone. *(checkouts tested by
  `CheckoutRaceTest`, the bound by `LockTimeoutTest`; plan changes by convention)*
- A workspace that may no longer be billed (`Contracts\AcceptsBilling`: Platform says no for one that is closing) opens no
  checkout, and a sync cancels at once in Stripe any live subscription of it (or of a deleted workspace). Ending a
  workspace's billing takes its checkout and plan-change locks, expires its open checkout, reads every subscription before
  it cancels any, and once one cancellation went through hands a later failure back instead of throwing it. *(tested by
  `EndWorkspaceBillingTest`, `CloseRaceTest`, `SyncStripeSubscriptionTest`)*
- `billing_prices` is written only by `billing:sync-plans`, as the schema owner (it never runs on boot or in every
  deploy, and needs `--live` with a live key), and by `Prices\PlanPriceOffers` (`Contracts\OffersPlanPrices`, the super
  admin's plan editor, which only Platform's admin reaches), as the catalog's writer, through
  `SyncStripePrices::forPlan()`: never a second copy of the sync. One offer of prices runs at a time, the command's or
  the editor's: `SyncStripePrices` holds the cache lock `billing:offer-prices` (`Locks\OfferLock`) while it reads
  the catalog (never before) and calls Stripe, renewed before every call and write for one step at Stripe's timeouts, with
  no database transaction open across those calls; the command waits as long as an offer of one plan may take, the editor
  10 seconds, and one that cannot have it in time offers nothing (a failed standing, or the command exits 1). *(tested by `SyncStripePricesTest`, `OfferPlanPricesTest`,
  `BillingTablesTest`, `CatalogWriterTest`, `CatalogEditorTest`)* A Checkout session is payable for 31 minutes and names its
  price (`metadata.price_id`); an offer of prices expires every open session at a price it no longer offers
  (`Prices\StaleCheckouts`). *(tested by `CheckoutTest`, `OfferPlanPricesTest`)*
- A plan is sold only at the catalog's price: `PriceBook` offers a period only when the plan is available and its active
  price has the catalog's amount and currency. Checkout, plan changes and the grid ask `PriceBook`; nothing but it and
  `SyncStripePrices` reads `billing_prices`. Keeping the plan and price a subscriber is on is never refused for it, nor for
  the plan being off sale (the grid lists the workspace's own plan off sale, offered for no period), and the default plan
  is cancelled to only when it has no price for the period. *(tested by `PriceBookTest`, `ChangePlanTest`,
  `tests/Architecture/BillingPricesTest.php`)*
- Nothing names a plan by its slug: plans are compared by `tier`, the plan to cancel to is the catalog's default, and the
  grid is drawn from `GET /billing`. *(convention)*

### Notifications (`packages/Notifications`)

What the package does: [docs/packages/notifications.md](docs/packages/notifications.md). The rules:

- The settings of the notifications section are the `notifications` settings group (the sender's name) plus the
  package's own endpoints; nothing else writes `notification_settings`, `notification_audiences` or
  `notification_templates`. *(convention)*
- A module declares its event types, channels and attachments with providers tagged `notifications.event_types`,
  `notifications.channels` and `notifications.attachments`, returning `Notifications\Contracts\` value objects. Every label,
  sample and default template exists in every language, and a template uses only its event's variables; links only go
  through the event's button. *(tested by `NotificationsRegistryTest`, `NotificationsTranslationsTest`)*
- A module notifies by sending `Notifications\Events\NotificationRequested` (after the commit) with an `eventKey` unique
  to the occurrence; it never sends a notification email itself, and never writes `notification_deliveries`. A send is
  reserved before it goes out (`DeliveryClaims`), so one address gets one send per key and channel. *(tested by
  `DispatchTest`, `NotificationTablesTest`)*
- A resend sends what the log kept, to that one recipient, through `ResendDelivery`; never build a resend from new values.
  Another package reads the log only through `DeliveryHistory`, which shows the address masked. *(tested by
  `DeliveriesApiTest`)*
- The bounce webhook (`POST /webhooks/notifications/{driver}`) is public and believes nothing a driver has not proved
  (SNS: the signature and an allowed topic), and follows a subscription confirmation only to an SNS host over https; only
  a permanent bounce or a complaint suppresses, for the whole platform, by the address's hash. The app only adds
  suppressions (`insertOrIgnore`); `notifications:release-suppression` lifts one as the schema owner. *(tested by
  `BouncesTest`)*
- The inbox is the `in_app` channel: a module shows a notification in the app by listing `in_app` in its event type's
  channels, never by writing `notification_inbox`. Only `InAppChannel` writes it and only `InboxNotifier` announces a change
  (`InboxChanged`, queued after the commit, to `workspace.<tenant>.user.<user>`: a request never waits on Reverb). Every
  query of the inbox, the preferences and the digest settings filters by the workspace and the person. *(tested by
  `InboxTest`, `InboxApiTest`)*
- A notification about something of a branch carries `branchId`; an event type that may go to the people of the branch says
  `branched: true`, and offers the `branch` audience. A member who may not see the notification's branch never gets it, nor
  does an address of theirs, however it was named (`RecipientResolver` with `BranchReach`, and a resend checks it again), and the inbox narrows only to `branch=current`. *(tested by
  `BranchNoticesTest`, `BranchAudienceTest`, `InboxBranchTest`)*
- A realtime channel is signed only by `POST /realtime/auth`, for the person's own channel in the workspace of their token;
  never `Broadcast::routes()` or a channel of a workspace alone. With `BROADCAST_CONNECTION=reverb`, an empty `REVERB_*` stops
  the app at boot. *(tested by `RealtimeAuthTest`, `RealtimeSettingsTest`)*
- A preference link is made and read only by `PreferenceLinks` (HMAC, never an address inside; the center's token and the
  one-click's are not interchangeable); the public center has no `tenant` middleware (the workspace comes from the signed
  token), answers every bad token with the same 404 and has a named limiter per address. *(tested by `PreferenceLinksTest`,
  `PreferenceCenterTest`)*
- A module adds to the daily summary with a `DigestContributor` tagged `notifications.digest_contributors`, never by
  sending its own summary; a summary goes only through `notifications:send-digests`, once per person and local day, with
  one key per person and period it covers, and only to the person it is about (`personal`). Its period moves on only once
  it is reserved to be sent, and nothing kept for it is dropped: a kept email counts against the quota when kept, and goes
  on its own if the workspace stops the summary. *(tested by `DigestTest`, `DigestRaceTest`, `DigestDeliveryTest`)*

### Onboarding (`packages/Onboarding`)

What the package does: [docs/packages/onboarding.md](docs/packages/onboarding.md). The rules:

- A package declares its onboarding steps, template sections and workspace templates with providers tagged
  `onboarding.steps`, `onboarding.template_sections` and `onboarding.templates`, returning `Onboarding\Contracts\` value
  objects. A prerequisite is a required step of a lower order; every label exists in every language. Run
  `php artisan onboarding:verify` in the deploy script: it builds the registry and checks `ONBOARDING_TEMPLATE`. *(tested by
  `OnboardingRegistryTest`, `OnboardingTranslationsTest`, `VerifyOnboardingTest`)*
- A step's `StepHandler::handle()` writes through the contracts of the package that owns the data (Settings'
  `UpdatesWorkspaceSettings`, a module's actions), never its tables, and `values()` returns nothing secret. Only the
  package's actions write `tenant_onboarding` and `tenant_onboarding_steps`. *(convention)*
- A workspace template is applied only by `StartOnboarding`, from `WorkspaceProvisioned`. *(tested by `StartOnboardingTest`)*
- `onboarded` (and `ChecksOnboarding`) goes only on a module's route or job that makes no sense in a workspace not set up;
  no route of the kit takes it. *(tested by `OnboardingGateTest`)*
- Completing the onboarding sends `OnboardingCompleted` after the commit; nothing else announces it. *(tested by
  `ProgressStoreTest`)*

### Team (`packages/Team`)

What the package does: [docs/packages/team.md](docs/packages/team.md). The rules:

- An invitation's token is kept as its SHA-256 and travels only in the mail (queued encrypted, `TeamInvitationMail`) and in
  the fragment of `<slug>.<root>/join#invitation=`; never in a column, an audit entry, a query string or a notification
  (the delivery log keeps what it sends). Every parameter that holds one is `#[\SensitiveParameter]`. A field of the
  mail with a person's words stays `private` (a public property of a `Mailable` reaches the view unescaped) and reaches the
  template through `MarkdownText`. *(tested by
  `InviteTest`, `InvitationMailTest`)*
- Inviting, resending an expired invitation and reactivating a member call `EnforcesQuotas::ensureCanCreate($tenantId,
  'members')` inside their transaction; a pending invitation holds its place through `PendingInvitationSeats`
  (`plans.member_seats`), so accepting asks for none. Locks are taken in one order: inviting, the email's lock and its open
  invitation's row, then the quota's (the onboarding's step holds every email and row, in the order of the emails, before
  the quota's); resending, the invitation's row then the quota's; accepting, the invitation's row then the quota's, held
  without asking for a place (`EnforcesQuotas::hold()`);
  reactivating, the member's lock then the quota's; a member's place, hours and skills, the member's lock
  (`MemberTarget::hold()`) first.
  *(tested by `InviteTest`, `InvitationsTest`, `MemberStatusTest`, `AcceptInvitationTest`, `InviteLockOrderTest` and the
  `*RaceTest`s, with two real sessions)*
- Who may give a role in an invitation, or send one again, is Rbac's rule (`MemberRoles::mayGrant`), the one
  `PUT /users/{user}/role` uses. An invitation lives only while its inviter stands behind it: deactivating or removing a
  member withdraws the open ones they sent in the same transaction, and accepting checks the inviter again under the row
  lock (withdrawn, and the same 404, when they left or can no longer give the role); a resend makes its sender the
  inviter. *(tested by `InviteTest`, `InvitationsTest`, `MemberRolesTest`, `MemberStatusTest`, `AcceptInvitationTest`,
  `AcceptRaceTest`)*
- The public acceptance answers every link that does not work with the same 404 `team.invitation_invalid`, checks the
  captcha first by Signup's rule (`ChecksSignupCaptcha`: fails closed on a driver that is not enforcing where
  `SIGNUP_REQUIRE_CAPTCHA` is on), reads the token from the JSON body only and has limiters of its own; an account's password failure is
  Auth's `auth.invalid_credentials`; a new password goes through Auth's `ResetsPasswords` (every session ends), only for an
  account it `reaches()` (never a super admin, nor someone with no active place: 422 `team.password_reset_elsewhere`); it
  answers a one-time `handoffUrl`, never a session token. *(tested by `LookUpInvitationTest`, `AcceptInvitationTest`,
  `AcceptRaceTest`)*
- Team changes a membership only through Auth's `ManagesMemberships` (the model's methods, its guards and events), never
  oneself, and an owner only as an owner; the last owner is Rbac's `KeepsLastOwner`. Acting on a member (place, hours,
  skills) or withdrawing an invitation takes someone who could give that role (`Members\Reach`, Rbac's
  `MemberRoles::grantable`; an owner reaches everyone, and only an owner reaches a member who holds no role), and `Powers`
  gives the screen's `allowed.*` by the same rule. Rbac's `AssignRole` asks the same of a change of role (403
  `rbac.above_your_role`), so `allowed.role` follows it too: another owner's role is an owner's to change, while the
  workspace has more than one active owner (`MemberRoles::activeOwnerCount`), never the last one's. The role is looked
  up, and the member's lock named, by the id the member was found by. *(tested by `MemberStatusTest`, `MemberStatusRaceTest`, `MemberReachTest`, Rbac's `AssignRoleTest`)*
- A user id that comes from outside (a `{user}` path, a body's `userIds`, a contract's argument) is read with Support's
  `Database\Ids::canonical()` where it comes in: Postgres finds a uuid in capitals, but an array, a lock or a cache keyed by
  it does not. *(tested by `MemberReachTest`, `MemberStatusRaceTest`, `MemberAccessTest`, Rbac's `AssignRoleTest`, Branches'
  `BranchMembersTest`)*
- Data a package keeps about a member has `(tenant_id, user_id)` with a foreign key to `memberships (tenant_id, user_id)`
  that cascades: removing someone takes it away. A reference to another row of the workspace goes by `(tenant_id, id)`
  too, so no workspace can point at another's. *(tested by `TeamTablesTest`, `SkillsTest`, `WorkingHoursTest`;
  `docs/guides/attach-data-to-members.md` for a module)*
- Someone without `team.manage` sees the active members alone, with `lastLoginAt` null (`ListTeamMembers`,
  `MemberPayload`). *(tested by `MembersListTest`)*
- Every route of the team takes a `permission:team.*` after `workspace`, and every write a limiter `team` or
  `team-invite`; the two public routes take `tenant`, their own limiter and `KeepOutOfCachesAndReferrers`. *(tested by
  `TeamRoutesTest`)*
- Team's notices are asked for from listeners of its own events, after the commit, through Notifications'
  `SendsWorkspaceNotices`: a notice that fails is reported, never undoes what caused it. *(tested by
  `TeamNotificationsTest`)*

### Branches (`packages/Branches`)

What the package does: [docs/packages/branches.md](docs/packages/branches.md). The rules:

- Adding a branch and reactivating one call `EnforcesQuotas::ensureCanCreate($tenantId, 'branches')` inside their
  transaction: adding, the workspace's slug lock then the quota's; reactivating, the branch's row then the quota's. The
  quota counts the active branches. A new workspace's main branch (`CreateMainBranch`, from `WorkspaceProvisioned`, while
  `branches.create_main_branch` is on) takes the same locks in the same order and holds a place, made only when the plan
  has one left and the workspace no branch; it has no address until someone confirms it (`MainBranchTest`). *(tested by `BranchQuotaTest`, `CreateBranchTest`, `BranchStatusTest` and
  `BranchRaceTest`, with two real sessions)*
- One name (whatever its case) and one slug per workspace; renaming keeps the slug, which a module may put in a public
  address. *(tested by `BranchesTablesTest`, `CreateBranchTest`, `UpdateBranchTest`)*
- What hangs from a branch goes by `(tenant_id, branch_id)` → `branches (tenant_id, id)`; deleting one that a module's row
  holds on to (`restrictOnDelete()`, or a key with no action) is 409 `branches.in_use`. *(tested by `BranchesTablesTest`,
  `BranchInUseTest`; `docs/guides/attach-data-to-branches.md`)*
- Who works at a branch is changed only by someone who reaches each person who changes, by Team's rule
  (`Team\Contracts\MemberAccess`). A save takes the branch's people lock first (`branches:people:<tenant>:<branch>`) and
  only then reads who works there and works out who changes; then Team's order: each member who changes (by id), then the
  branch shared. *(tested by `BranchMembersTest`, `BranchRaceTest`, `MemberAccessTest`)*
- A branch's people carry their emails only for whoever has `team.view` (`BranchPeople::showsEmails()`); anyone else gets
  `email: null` and reads names. *(tested by `BranchMembersTest`)*
- A branch's week uses Support's `Hours\WeekDays` and `Http\Requests\WeekRequest`; never another shape of a week.
  *(tested by `BranchHoursTest`, `WeekDaysTest`)*
- The audit trail keeps a branch's point as `point: {lat, lng}` and its postal code as `postal`: Audit redacts `code`
  (a secret field of Auth). Never audit what someone typed in the map's search. *(tested by `CreateBranchTest`, `UpdateBranchTest`)*
- Every route takes `permission:branches.*` after `workspace`, and every write `throttle:branches`; fixed paths go before
  `{branch}`. `me/branch` takes `workspace` and no permission; its `PUT` the `branch-switch` limiter. *(tested by
  `BranchesRoutesTest`)*
- An action on one branch looks it up through `Places\BranchLookup` (as the person may see it), never `BranchRow` alone:
  one they may not see is the same 404, whatever their role holds. *(tested by `BranchVisibilityTest`, `ManageWithoutAllTest`)*
- Each person chooses the branch they work at (`PUT /me/branch`, `branch_selections`); `CurrentBranchResolver` checks it
  again on every request and keeps it on the request, never on itself; anything that is not one of their choices is one 422
  `branches.not_selectable`. A choice takes the branch's people lock and the branch shared, in that order, and checks again.
  While a super admin acts as someone, what they pick is kept apart in the cache. *(tested by `CurrentBranchTest`,
  `SwitchBranchTest`, `SwitchRaceTest`)*
- `branches.all` sees every branch (the owner and the manager by their templates) and `branches.manage` requires it; anyone
  else lists and opens the branches they work at. *(tested by `BranchesRbacTest`, `BranchVisibilityTest`)*
- The events (`BranchDeactivated`, `BranchReactivated`, `BranchDeleted`) are sent after the commit. *(tested by
  `BranchStatusTest`, `EventsAfterCommitTest`)*

### Clients (`packages/Clients`)

What the package does: [docs/packages/clients.md](docs/packages/clients.md). The rules:

- Only Clients writes `clients`, `client_tags`, `client_tag_links`, `client_imports` and `client_import_errors`; a module
  reads a client through `Clients\Contracts\ReadsClients` (`find()`, `visibleTo()`) and hangs its rows from one by
  `(tenant_id, client_id)` → `clients (tenant_id, id)`, its `tenant_id` cascading from `tenants`. `visibleTo()` is the
  branch rule alone: the module's route checks membership and its own permission, and `find()` says whether the client
  is in the trash or erased. *(convention; tested by `ReadsClientsTest`; `docs/guides/attach-data-to-clients.md`)*
- One email and one phone per workspace among the live clients: a write that takes one another has is 409
  `clients.duplicate`, which names that client (`meta.clientId`) only to someone who may see it. *(tested by
  `ClientsTablesTest`, `CreateClientTest`, `ShowUpdateClientTest`, `TrashTest`)*
- A client's own data (name, email, phone, birthday, address, notes, custom fields) never goes into the audit trail by
  value, only by the field's name (`Records\ClientTrail`); a key of the trail is never `postalCode` nor `code` (Audit
  redacts them): `postal`. Erasing a client anonymizes its row and each module erases its part (`ClientDataContributor`).
  Clients registers what people write about a client in `SentryOnlyFields`, and reports a failure whose message may hold
  it (a database error's) as `Records\ValuesFreeFailure`: class, SQLSTATE, file and line, nothing chained; a deadlock of a
  write stays a `DeadlockException` without the query ("deadlock detected", so a retry still happens). *(tested by
  `CreateClientTest`, `PrivacyTest`, `ExportCsvTest`, `MergeRaceTest`)*
- The list follows the top bar by the home branch (`Scope\ClientVisibility::narrow()`); one client is opened by whoever
  may see its home branch (or anyone, with none), whatever the top bar says, and is otherwise the same 404
  `clients.not_found`; a branch a person sends is checked with `allows()`. *(tested by `ClientsByBranchTest`,
  `ShowUpdateClientTest`)*
- Creating, restoring and importing call `EnforcesQuotas::ensureCanCreate($tenantId, 'clients', $n)` inside their
  transaction, after the tags' catalog lock when they take it; the import asks again for each part. Merging holds both
  rows `FOR UPDATE` in id order. *(tested by `CreateClientTest`, `TrashTest`, `ImportRunTest`, `MergeRaceTest`)*
- An import never keeps a value of its file: errors are line, field and code; the file is kept encrypted
  (`Imports\ImportFile`, the only reader and writer of it) and deleted when the import ends, or after `upload_ttl_hours`;
  `clients:prune-imports` forgets the rest. An import ends once, with its row held (`ImportRunner`); the prune holds each
  import and looks at it again before it touches it. A failure is reported without its message (`ImportCrashed`). Only the
  uploader sees an import. *(tested by `ImportUploadTest`, `ImportPreviewTest`, `ImportRunTest`, `PruneImportsTest`)*
- The CSV export escapes formulas (`Export\CsvCell`) and is the package's only answer that is no envelope (its refusals
  are). *(tested by `CsvCellTest`, `ExportCsvTest`)*
- Modules extend a client through registries: fields (`clients.fields`), activity (`clients.activity`), merging
  (`clients.merge`, inside the merge's transaction), data rights (`clients.data`) and the portal's sections
  (`clients.portal_sections`, a `Contracts\PortalSectionProvider` asked per client; a key `<module>.<section>` declared
  once). *(tested by `ClientFieldsTest`, `ActivityTest`, `MergeTest`, `PrivacyTest`, `PortalSectionsTest`)*
- Every route takes `permission:clients.*` after `workspace`, every write a `clients*` limiter; fixed paths go before
  `{client}`. Each route is decided, with its permissions, limiter, feature and whether an impersonation may use it, in
  `ClientsRoutesTest`: a new one fails it until it is. *(tested by `ClientsRoutesTest`, `ImpersonationRoutesTest`)*
- The client portal is the workspace's (`tenant`), never a member's: a signed-in client's routes take the `portal` group
  (`tenant`, `KeepOutOfCachesAndReferrers`, `AuthenticatePortalClient`, `EnsurePortalOpen`, the `portal` limiter per
  client), never `workspace`, `auth:sanctum` or `auth:client-portal`, and never `tenant` besides the group. The
  `client-portal` guard is asked by name and never becomes the default, so `CurrentUser`, `auth()->id()` and the audit
  trail's actor stay null in a portal request. A public route of the portal takes `tenant` and its own `portal-*` limiter
  (`GET /portal` nothing more; `POST /portal/code` and `POST /portal/session` also `KeepOutOfCachesAndReferrers`). A
  module's route of its portal section takes `portal` alone (it already counts every request per client) and reads the
  client from `Contracts\CurrentPortalClient`, never from what the browser sends. *(tested by `PortalRoutesTest`, which
  sweeps every route, `PortalGuardTest`, `PortalSectionsTest`)*
- A portal session lives only in `client_portal_sessions` (the SHA-256 of its secret; 7 days, or 2 days unused): a
  member's token, an impersonation's, the admin's or another workspace's client's never signs a client in, and a
  client's gets 401 on every route of the `workspace` and `platform` groups. The portal is open only while the plan
  includes `clients_portal`, the workspace's setting `client_portal.enabled` says so and the deployment can give it the
  captcha it asks for (`PortalGate`, `PortalCaptcha::available()`). On a closed one a
  signed-in client's routes are 403 `clients.portal_closed`, signing out excepted; asking for a code still answers 202
  and signing in is 422 `clients.portal_code_invalid`, as for any code that does not work. *(tested by
  `PortalRoutesTest`, `PortalGuardTest`, `PortalGateTest`, `PortalSessionsTest`, `PortalCodeRequestTest`,
  `PortalCodeVerifyTest`)*
- Asking for a sign-in code checks the portal's own captcha first (`clients.portal.require_captcha`, `PortalCaptcha`, never
  Signup's), then only queues `DeliverPortalCode` (encrypted, with the email) and answers the same 202 for any email; the
  code (eight digits, `PortalCodes::DIGITS`) is made inside the job, which mails nothing to a suppressed address
  (Notifications' `SuppressedAddresses`) nor past the workspace's codes of the day, kept as an HMAC bound to the email's key,
  and checked with its row held `FOR UPDATE`; every code that does not work is one 422 `clients.portal_code_invalid`. The
  limits: `portal-code` per address and, after the captcha, per email an hour and a day and per workspace an hour;
  `portal-verify` per address, per email an hour and per workspace's wrong codes an hour; mails per workspace a day
  (`Portal\PortalLimits`, which reports the first refusal of a workspace's limit); phone changes per client an hour. Nothing of a client (email, code, token)
  goes into a log, a queue payload in clear, a URL or the audit trail, whose entries of what a client does in the portal
  keep no address or browser either (`ClientTrail`'s `byClient`, Audit's `withOrigin: false`). *(tested by
  `PortalCodeRequestTest`, `PortalCodeRaceTest`, `PortalCodeVerifyTest`, `PortalVerifyRaceTest`, `PortalAccountTest`)*
- A client changes from the portal only their own details (`UpdatePortalProfile::FIELDS`) and consent, never their email
  nor what is the business's (notes, tags, home branch, custom fields: an unknown field is 422 `validation.missing`); a
  taken phone is 422 `clients.portal_phone_unavailable` and names nobody. *(tested by `PortalAccountTest`)*
- A client in the trash, merged into another or erased loses their portal: the guard signs in only a live client, the
  erasure deletes their sessions and code in its transaction, `EndSessionsOfGoneClient` deletes them after the trash or a
  merge, and a restore ends what is left. A change of the client's email by the team ends them in its transaction.
  `clients:prune-portal` forgets expired codes and sessions daily. *(tested by
  `PortalStaffTest`, `PortalGuardTest`, `PrunePortalTest`)*
- The branch: the portal and what a client sees of themselves follow no branch (a client works at none; no top bar); a
  module's section shows its records' own branch; the team's side (`portal` on a client's page, ending their sessions)
  follows the rule of one client (`ClientFinder`); opening the portal is the workspace's. *(tested by `PortalStaffTest`)*

### Geocoding (`packages/Geocoding`)

What the package does: [docs/packages/geocoding.md](docs/packages/geocoding.md) and
[docs/configuration/maps.md](docs/configuration/maps.md). The rules:

- A provider is a `GeocodingDriver` tagged `geocoding.drivers`; `GEOCODING_DRIVER` picks one, read raw (never through
  `env()`, which turns `null` into no value), and a name nobody registers fails `geocoding:verify` (in the deploy script) and
  every search, never falls back to Nominatim; the no-op driver is `none`; a key lives only in the backend. *(tested by
  `DriverRegistryTest`, `GeocodingConfigTest`, `GoogleDriverTest`, `MapboxDriverTest`)*
- A driver calls its provider only through `ProviderHttp` (`GeocodingHttp`, a client with no event dispatcher: nothing for
  Sentry's breadcrumbs or spans) and turns every failure into `geocoding.unavailable`; the client's exception, whose
  message carries the URL and its key, never leaves. *(tested by `NominatimDriverTest`, `GeocodingApiTest`)*
- The provider gets the text or the point and the language, never who asks. The routes are `POST` in `workspace` with the
  `geocoding` limiter, `query`, `latitude` and `longitude` are Sentry-only fields (`SentryOnlyFields`, not audit's), and answers are cached under a hash that
  names the workspace (no workspace reads another's searches from the cache).
  *(tested by `GeocodingApiTest`)*
- Public Nominatim: one request per second for the whole app (`ProviderPace`): a search over it waits up to 1.5 s for a free
  second, then 429 `geocoding.busy` with `Retry-After` (`DomainError::headers()`). It suits development and small installs;
  production uses a paid provider or its own Nominatim. *(tested by `NominatimDriverTest`, `GeocodingApiTest`)*
- No test reaches a provider: resolve `GeocodingHttp` and call its `preventStrayRequests()` and `fake()`. *(convention)*

### Signup (`packages/Signup`)

What the package does, and why: [docs/packages/signup.md](docs/packages/signup.md). The rules:

- Signup's routes take no `tenant` middleware, and each has a named limiter of its own. A signup's token travels in the
  `X-Signup-Token` header, never in an address. *(tested by `StartSignupTest` and its neighbours)*
- Never write a plain password, token or code into a column, a queue payload or an audit entry: the table keeps hashes,
  `SignupVerificationMail` is queued encrypted (`ShouldBeEncrypted`), and every parameter that holds a password, its hash,
  or a raw token, claim or secret of Signup is `#[\SensitiveParameter]`. *(tested by `SensitiveParametersTest`, which reads
  every method's parameters by reflection, and `SecretsInTracesTest`)*
- An answer never says whether an email had a signup already, or whether a limit stopped its email: only
  `signup.email_taken` (the email has a person) is said on purpose. *(tested by `StartSignupTest`, `SignupsOfOneEmailTest`,
  `EmailLimitsTest`)*
- Nothing a person typed goes into the verification email but the normalized slug. *(tested by
  `SignupVerificationMailTest`)*
- The email's link goes to the frontend, with the secret in the fragment; the claim is answered in the body, never in an
  address. *(tested by `VerifySignupTest`, `SignupStatusTest`)*
- Every answer of signup, verify and status carries `Cache-Control: no-store` and `Referrer-Policy: no-referrer`.
  *(tested by `SignupStatusTest`)*
- Settings, plans and onboarding start from `WorkspaceProvisioned`, never by editing Signup. Its listeners run inside the
  workspace's transaction: queue slow work from them. *(tested by `QueueAfterCommitTest`)*
- A signup's captcha follows `SIGNUP_REQUIRE_CAPTCHA` and fails closed on a driver that is not enforcing. *(tested by
  `StartSignupTest`)*

### Platform (`packages/Platform`)

What the package does: [docs/packages/platform.md](docs/packages/platform.md) and
[docs/configuration/admin-host.md](docs/configuration/admin-host.md). The rules:

- Only `platform_admins` says who is a super admin, and only the schema owner writes it (the `platform:*` commands): never
  a role, a permission, an env list read at runtime or a column of `users`. Auth learns it through
  `IdentifiesPlatformAdmins`, which Platform binds, and no workspace's flow replaces a super admin's password.
  *(tested by `AdminsTest`, `ReplacePasswordTest`)*
- The admin's routes take the `platform` group (no workspace, only on the API's own host or the admin host, the `platform`
  guard), never `workspace` or `auth:sanctum`; a public one takes `RefuseTenantContext` and a named limiter of its own, and
  the sign-in `AdminHostOnly` too. *(tested by `HostSeparationTest`)*
- The admin reads across workspaces only through `ReadsAcrossWorkspaces` and writes to one only as it (`WorkspaceLock`,
  which names its lock by the canonical id and runs `RunAsTenant`); what it does to a workspace goes to both trails. A reason that is the platform's note (an
  impersonation, a plan given or taken back) goes only to the platform's trail (`StandingAudit`'s `$note`). *(tested by `WorkspaceDirectoryTest`,
  `SuspendTest`, `CloseWorkspaceTest`)*
- The plan editor (`/platform/plans`) writes the catalog only through Plans' `EditsCatalog` and Stripe only through
  Billing's `OffersPlanPrices`, saving first and offering after: a failure of Stripe leaves the plan saved and the
  period unsold (`stripe: failed`), and the admin retries (`POST /platform/plans/{plan}/prices`). It answers the
  contracts' outcomes with its own errors (`platform.plan_changed`, `platform.plan_change_unconfirmed`, ...), checks
  `editable` before any write (503 `platform.catalog_not_editable` with no catalog writer, or one that cannot sign
  in), and sends each write to the platform's trail (`platform.plan.*`). *(tested by `SavePlanTest`,
  `PlanCatalogActionsTest`, `PlanEditorApiTest`)*
- An impersonation goes on only while its admin is a super admin and `platform.impersonation` is on: Auth asks
  `AllowsImpersonation` with the admin at the exchange and on every request, and `platform:revoke-admin` ends the admin's open
  impersonations and unused codes through Auth's `EndsImpersonations`. *(tested by `RevokedAdminImpersonationsTest`)*
- A module declares platform flags with a provider tagged `platform.flags` (`<package>.<what>`, labels in every language),
  guards a route with `platform-flag:<slug>` and asks `ChecksPlatformFlags` in code; what a plan includes stays Plans'.
  *(tested by `PlatformFlagsTest`, `PlatformTranslationsTest`)*
- Who may sign up is the access mode's, asked by Signup through `signup.gates`; a mode that is not open, waitlist or closed
  is closed. *(tested by `AccessModeTest`, `SignupGatesTest`)*
- Emails and screens that speak for the platform take `Support\Branding\PlatformBrand`, never `config('app.name')`.
  *(convention)*
- Run `php artisan platform:verify` and `php artisan platform:setup` in the deploy script. *(tested by `PlatformHostTest`)*

### Search (`packages/Search`)

What the package does: [docs/packages/search.md](docs/packages/search.md) and
[docs/configuration/search.md](docs/configuration/search.md); how a module adds a source:
[docs/guides/add-a-search-source.md](docs/guides/add-a-search-source.md). The rules:

- A package adds what the global search finds with a `SearchSourceProvider` tagged `search.sources`, returning
  `Search\Contracts\SearchSource`s: a key `<package>.<what>` declared once, a label in every language, a finder that
  implements `FindsRecords`, and the permission it needs, always named (`permission: null` only on purpose, for a source any
  member may ask), plus the plan's feature if any. `SearchRegistry` refuses a malformed one (`InvalidRegistry`: the key, the
  finder, a permission or feature not shaped as Rbac's and Plans' names); that they are declared is a test's.
  *(tested by `SearchRegistryTest`, `InstalledSourcesTest`, `SearchTranslationsTest`)*
- A finder runs **its list's own query** (the list's visibility, the branch, the trash), never a second query of its own
  that could show what the list hides, asks it for `max(1, $limit)` rows, and answers a list of `SearchHit`s whose route is
  a page of the dashboard (`/dashboard/...`, no `\` nor `//`). It never writes the term anywhere and lets a failure reach
  Search. *(convention; tested by `TeamSearchTest`, `BranchesSearchTest`, `ClientsSearchTest`; an answer that is not a list
  of hits, or a stray route, fails the source in `RunSearch`)*
- The route is `POST /search` with `q` in the JSON body, never in the address (a `?q=` is not read). It takes `workspace`,
  `KeepOutOfCachesAndReferrers` ahead of `throttle:search` (a named limiter by workspace and member) and no permission; it
  changes nothing, so an impersonation may search. *(tested by `SearchRoutesTest`, `SearchApiTest`,
  `ImpersonationRoutesTest`)*
- A source is asked only of someone with its permission and its plan's feature, checked before its finder is made and
  outside the `try` (an Rbac or Plans failure fails the request). A source that fails is reported as `SourceFailed` (its key,
  the exception's class, SQLSTATE, file and line through `FailureText`; never its message, nothing chained) and the rest
  answer with `meta.incomplete`. What was searched is never kept, logged or audited: `q` is a Sentry-only field and the
  term is a `#[SensitiveParameter]` of `RunSearch`. *(tested by `SearchApiTest`; failing closed is a convention)*
- An index outside Postgres (Scout's driver other than `database`) only proposes ids of one workspace
  (`where('tenant_id', ...)`), read through `Ids::canonicalAll()` with anything that is not a uuid dropped; the list's query
  over them (RLS, the branch, the trash, the erased) decides what is seen, in the index's order. Its document holds what the
  palette searches by and what ranks it among what the person may see, never more (Clients': `id`, `tenant_id`, `name`,
  `email`, `phone`, `branch`), and nothing of a record in the trash or erased. With the `database` driver, Scout watches
  nothing. *(tested by `ClientIndexTest`, `ClientIndexBranchDeletedTest`)*
- A package that keeps an index implements `ReindexesSearch`, tagged `search.indexes`; its `reindex()` sends synchronously,
  never through the queue. `search:reindex` asks each index one workspace at a time inside `RunAsTenant`, reports a failure
  as `ReindexFailed` (no message, nothing chained) and never removes a document: to rebuild, flush the index first. Never
  `scout:import` nor `scout:queue-import`: they run with no workspace. *(tested by `ReindexCommandTest`, `ClientIndexTest`)*

### Dashboard (`packages/Dashboard`)

What the package does: [docs/packages/dashboard.md](docs/packages/dashboard.md); how a module adds a widget:
[docs/guides/add-a-dashboard-widget.md](docs/guides/add-a-dashboard-widget.md). The rules:

- A package puts a card on the dashboard's home with a `DashboardWidgetProvider` tagged `dashboard.widgets`, returning
  `Dashboard\Contracts\DashboardWidget`s: a key `<package>.<what>` declared once, a label in every language, a `WidgetData`
  class, a size of `small`, `medium` or `large`, the permission and the plan feature it needs (a feature slug has no dots).
  `WidgetRegistry` refuses a malformed one (`InvalidRegistry`). Plans never declares one (Dashboard depends on Plans): the
  plan's widget is Dashboard's. *(tested by `WidgetRegistryTest`, `DashboardTranslationsTest`)*
- A widget's data is worked out with **its list's own rule** (visibility, the branch, the trash), never a second query that
  could count what the list hides; it is a few values, never a list of people, and a count of a list that follows the
  branch counts only what the person sees. A list that reads the branch bar from the current request makes the widget ask
  `RequestingPerson::mustBe($tenantId, $userId)` first. Days are UTC: no "today" of the workspace's time zone. *(convention;
  tested by `TeamWidgetTest`, `BranchesWidgetTest`, `ClientsWidgetTest`)*
- `GET /dashboard` works out a widget only for someone with its permission and its plan's feature (checked before the
  widget is made), reports one that fails as `WidgetFailed` through `FailureText` (never its message, which for a database
  error holds values) and sends it as `failed`, and leaves out one whose data is `null`. *(tested by `DashboardApiTest`;
  failing closed is a convention)*
- The route takes `workspace`, `KeepOutOfCachesAndReferrers` ahead of `throttle:dashboard` (a named limiter by workspace and
  member) and no permission; it changes nothing, so an impersonation may load it. *(tested by `DashboardRoutesTest`)*

### PHP rules

- `declare(strict_types=1);`, strict comparisons and strict parameters in every file (Pint, plus an
  architecture test for strict types in every package).
- Larastan level 8 on `app/` and `packages/`, package tests excluded.
- Rector must have nothing to change (PHP 8.4, dead code, code quality, type declarations, Laravel
  code quality). `composer refactor` applies its fixes.
- Pest's `php` and `security` arch presets ban calls such as `dump`, `var_dump`, `die`, `echo`,
  `print_r`, `eval`, `exec`, `md5`, `sha1`, `rand`, `uniqid` and `unserialize`.
- `db:wipe`, `migrate:fresh`, `migrate:refresh`, `migrate:reset` and `migrate:rollback` refuse to run in
  production (`SupportServiceProvider`). It calls their `prohibit()` itself, since Deptrac keeps providers
  off the `DB` facade. *(tested by `SupportServiceProviderTest`)*
- Keep PHP files under 300 lines *(convention; no PHP tool counts lines)*.
- Store and compare times in UTC (`config/app.php` sets it); convert only for display *(convention)*.
- No N+1 queries: eager-load relations a loop reads *(convention; lazy loading is not disabled)*.
- Slow work (mail, exports, third-party calls) goes to a queued job *(convention)*.
- Large lists use cursor pagination *(convention)*.

### API responses

- Every form request extends `MoodKit\Support\Http\Requests\ApiRequest`: field names in messages come from
  `<package>::validation.attributes`, an email is `ApiRequest::EMAIL` (ASCII, `email:strict`, at most 190), a password someone
  chooses is `ApiRequest::newPassword()` (`Password::defaults()`, which Auth sets: 12 characters, upper and lower case, a
  number) and a captcha token `ApiRequest::CAPTCHA_TOKEN` *(convention)*.
- Text people type takes Support's rule for its shape *(convention)*: a name or another single line `Validation\PlainName`,
  free text over several lines (notes, a reason) `Validation\MultilineText`. Both refuse bytes that are not UTF-8, and a NUL,
  which Postgres cannot store: a field without either answers 500 for them, not 422.
- Build every response with `MoodKit\Support\Http\ApiResponse` *(convention: no tool catches a raw
  `response()->json()`)*. At runtime, the `ForceJsonEnvelope` middleware, global and limited to the
  `api` and `api/*` paths, wraps a JSON response that is not an envelope, turning one from status 400 up
  into a generic error, and adds `X-Robots-Tag: noindex` to every response there, an unmatched path (404)
  or a method the route does not allow (405) included. `ApiSecurityHeaders`, global too, adds
  `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer` there and takes `X-Powered-By` off. *(tested by
  `ApiSecurityHeadersTest`)* That is a safety net, not a reason to skip
  `ApiResponse`.
- `ApiResponse::data($data, $meta, $status)` sends `{data, meta, errors: []}`. An empty `meta` is
  sent as `{}`. `data([])` is sent as `[]`, so use it for lists, never for one resource. An action with nothing to send
  back answers `data(null)` (202 when it was only queued), never `{ok: true}`, `[]` or a bare 204 *(convention)*.
- `ApiResponse::error($status, ...$errors)` takes `ApiError` objects and sends `{data: null, meta: {},
  errors}`. Each error is `{code, message, field}`, with `field` set to the input name or `null`. Codes
  are stable and dotted (`tenancy.not_found`) and messages are translated *(convention)*.
  `ApiResponse::errorWithMeta($status, $meta, ...$errors)` is the same with a filled `meta`.

### Errors

- Throw a subclass of `MoodKit\Support\Errors\DomainError` for every expected business failure:
  `errorCode()` stable and namespaced (`tenancy.suspended`), `messageKey()` pointing at the package's
  `lang/{en,es}/errors.php`, `status()` and `field()` when they apply, and `meta()` when the client needs
  data about the failure (the limit that was reached): the renderer sends it as the envelope's `meta`.
  A message that counts something has Laravel's `one|many` forms in every language, and the error passes the number as
  an integer `count` replacement: the renderer chooses the form with it (`trans_choice()` in a mail does the same).
  Never catch it in a controller.
  *(convention; the renderer and `ErrorContractTest` cover the shape)*
- Never build error responses by hand: `MoodKit\Support\Http\ApiExceptionRenderer` renders validation,
  401, 403, 404, 405, 409, 429 and 500 with the codes `validation.<rule>`, `auth.unauthenticated`,
  `auth.forbidden`, `http.not_found`, `http.method_not_allowed`, `http.conflict`, `http.too_many_requests`,
  `http.error`, `server.error`. *(tested by `ErrorContractTest`)*
- Unexpected exceptions go to Sentry through `Integration::handles()` in `backend/bootstrap/app.php`. It does
  nothing until `SENTRY_LARAVEL_DSN` is set, and a `DomainError` is never reported. *(tested by
  `SentryReportingTest`)*
- A failure a package reports on every request (a widget or a search source that is down) implements Support's `ThrottledReport`, and `backend/bootstrap/app.php` lets only 3 identical ones (same class and message) a minute through; every other exception is reported each time. Such a message holds no personal data (`FailureText`). *(tested by `SentryReportingTest`)*
- Before an error or a transaction goes to Sentry, Support's `ScrubSecrets` (`before_send` and
  `before_send_transaction` in `backend/config/sentry.php`, by name so that `config:cache` can write it) blanks every request
  header registered in `SecretHeaders` and every field registered in `SecretFields` or `SentryOnlyFields`, whatever `SENTRY_SEND_DEFAULT_PII` says,
  on top of what the SDK blanks itself (Authorization, Cookie, the forwarding headers). A field is known by its name in
  lowercase letters and digits (`password_`, `Pass-Word`), so a parser's renaming does not hide it, at any depth, and inside a
  JSON document kept in a string. It looks in the body (decoded, JSON text, or form text read only when every name is plain and
  no value is JSON; any other body is replaced whole), the query string and the URL's query, and a transaction's header and
  body data; the body data of child spans, the app's own calls to other services (the captcha check's `response`), is not sent
  at all. The `{secret}` segment of a path registered in `SecretPaths` is blanked in the request's URL, the transaction's
  name and the trace and span data. The registries are filled by the packages, never by the app (see Packages). *(tested by
  Support's `SentryScrubbingTest` and `SentryPathScrubbingTest`)*
- Responses: `ApiResponse::data()`, `ApiResponse::paginated()` for lists (cursor, meta
  `pagination.{perPage,nextCursor,prevCursor,hasMore}`), `ApiResponse::error()` only inside the renderer.
  *(convention)*
- Locales: the API answers in the best match of `Accept-Language` among `support.locales`; add a locale
  there and in every package's `lang/`. `SetLocaleFromRequest` runs ahead of every other sorted middleware, and a
  signed-in member's own locale replaces it for the rest of the request, errors included: the renderer only
  resolves the locale again for a request that matched no route. *(tested by `LocaleTest`)*
- Coverage: every package needs 85% on its own, not only the total. *(`composer test:coverage`)*

### Tests

- `tests/Unit` and `packages/<Name>/tests/Unit`: plain Pest, no framework boot, no database.
- `tests/Feature` and `packages/<Name>/tests/Feature`: boot Laravel and use `RefreshDatabase` on
  Postgres. Name test files `*Test.php`; PHPUnit does not run anything else.
- Tests connect with the host, port, user and password of the root `.env` and the database
  `<DB_DATABASE>_test` (`tests/bootstrap.php`, `tests/RootEnv.php`), and fall back to
  `backend/.env.testing` when there is no root `.env`, as in CI. `tests/TestCase.php` aborts before
  `RefreshDatabase` runs unless the database name ends in `_test` or `_test_<n>`. Do not loosen that
  guard, and do not export `DB_DATABASE` in your shell.
- The connection is the `DB_USERNAME` role (the runtime role), never the superuser: a superuser bypasses row-level
  security, so `tests/Feature/DatabaseRoleTest.php` fails if the role is a superuser, has `BYPASSRLS` or owns a
  table. The migrations run as `DB_MIGRATION_USERNAME` (the schema owner: the `pgsql::direct` connection, which
  Laravel's migrator uses by itself; `Support\Database\SchemaOwner`), which
  owns the tables, and Postgres exempts a table's owner from row-level security unless the table has
  `FORCE ROW LEVEL SECURITY`: set it in every migration that enables RLS *(convention)*. A test that changes a kit
  table's definition runs it in `asSchemaOwner()` (Support's test support). *(tested)*
- A feature test of something inside a workspace uses `uses(MoodKit\Tenancy\Testing\ActsAsTenant::class)` and
  `$this->actingAsTenant($tenant)`: it sets the tenant context, the RLS setting and the `X-Tenant-Slug` header
  of the test's requests, and clears them when the test ends. A request clears the context and the setting
  as it finishes, so call it again before the test reads tenant rows after a request. The trait lives in
  `packages/Tenancy/tests/Support` and is autoloaded in dev (`autoload-dev` in `backend/composer.json`):
  Larastan rejects a trait in `src/` that no analysed class uses.
- `tests/TestCase` closes the database connection last in `tearDown`, after the cleanups that touch it (a cleanup
  that runs after RefreshDatabase's disconnect opens a new connection, which stays open until PHP collects the
  application: one per test, and a parallel run runs Postgres out of connection slots). *(tested by
  `ConnectionLeakTest`)*
- Coverage is measured with pcov on `packages/*/src` only, minimum 85%.

Gate: `cd backend && composer check` runs Pint, Deptrac, Larastan, Rector (dry run), the architecture tests on their
own and the rest of Pest in parallel with coverage (`tests/Architecture` keeps its parsed classes in memory, so it stays
out of the coverage workers). It needs the Postgres and MinIO containers (`docker compose up -d --wait`): Postgres's first
boot on an empty volume creates the `DB_USERNAME` and `DB_MIGRATION_USERNAME` roles and `mood_kit_test` through
`scripts/postgres-init`, and the
storage tests use the bucket `<ASSETS_BUCKET>-test`, which they create. It also needs `pcov`.

## Frontend

### Layers

- Each area of the UI is a Nuxt layer in `frontend/layers/<name>`. Nuxt registers a directory there
  automatically, but only if it has a `nuxt.config.ts`. Source goes in `layers/<name>/app/`
  (`components/`, `composables/`, `utils/`, `pages/`). Tests go in `layers/<name>/tests/` as
  `*.test.ts`, named in camelCase (`useRoleEditor.test.ts`, `tenantSeo.test.ts`; core's `testFileNames.test.ts`
  checks it); Vitest collects layer tests from there and from `shared/tests/` only.
- To add a layer, give it a `nuxt.config.ts` and a `package.json` like `layers/core`'s, run
  `pnpm install` from the repo root, and commit the `frontend/layers/<name>: {}` importer it adds to
  `pnpm-lock.yaml`. pnpm and knip treat each layer as its own workspace package.
- A layer that imports from `vue-router` declares it in its own `package.json`, with the version Nuxt
  uses (`pnpm why vue-router`), and runs `pnpm install`. Nuxt ships `vue-router`, but knip treats each
  layer as its own package and `pnpm lint:dead` reports an unlisted dependency without the entry.
- When two layers define the same file or auto-imported name, one silently wins: the app first,
  then layers in reverse alphabetical order (`tenancy` beats `core`, `core` beats `auth`). Keep file,
  component, composable and util names unique across layers *(convention)*.
- The chrome of the public screens lives in core, because the sign-in screens (`auth`) and the signup screens
  (`signup`) both draw on it and layers share only core: `AuthShell` (with its header and `LocaleSwitcher`), the `auth`
  layout, `FormSubmitButton` (the public forms' submit), `PasswordStrength` and the password rules (length in characters, as the backend counts it), the email rules
  (`emailAcceptedByBackend`: what the HTML rule lets through and Laravel's `email:strict`, which every email field of
  the API uses, refuses), `isPlainText` (the backend's `PlainName`) and `joinLines` (line breaks made spaces, for a `Textarea` the API takes on one line),
  `CaptchaWidget` with `useCaptcha` (the `turnstileSiteKey` setting), `useAuthPage` and the address helpers
  (`workspaceUrl`, `rootDomainUrl`, and `useRootDomain()`, the only reader of the root domain setting). Their messages are `core.shell.*`, `core.captcha.*` and `core.password.*`. The language switch (`useChangeLocale`) sets the language itself and asks auth to save the choice
  through `kit:auth:save-locale`. A new public
  screen in a layer of its own uses `layout: 'auth'` and `<AuthShell>`.
- The signup flow keeps its secrets out of addresses *(tested: `signupClaim.test.ts`, `signupSent.test.ts`,
  `verificationFragment.test.ts`)*. The form leaves the email and the signup's token for `/signup/verify-email` in the tab's
  `sessionStorage`, forgotten when the signup ends or the flow reaches `/signup/processing`; the status and the resend send the
  token in the `X-Signup-Token` header. The emailed link opens `/signup/confirm#verification=<secret>`, a fragment no server or
  referrer sees: the page reads it, has the router replace the entry without it and keeps it in memory. It is confirmed with the
  password chosen at signup or with a new one, which the same card offers to choose from the start (`replacePassword`):
  whoever holds the email decides the password. Confirming answers with a claim, which waits for `/signup/processing` in the
  tab's `sessionStorage` and is forgotten when the signup ends. Only a status read made with the claim carries `handoffUrl`, and the screen follows it only to
  the handoff page of `<tenantSlug>.<root domain>`; the browser that signed up polls with its own token, which is never told the
  way in, so it only says the workspace is ready and links to its sign-in.
- A page that depends on who is signed in (`definePageMeta({ auth: ... })`, or in the `auth` layout) is rendered by
  the browser alone: the session lives in `localStorage`, so the server cannot know it, and a page drawn for
  nobody and redrawn for someone flashes and mismatches on hydration. Give its path core's `browserOnlyRule()` (`ssr:
  false` with `X-Robots-Tag: noindex`) in the `nuxt.config.ts` of the layer that owns the page (`layers/auth`,
  `layers/signup`; `layers/dashboard` gives it to `/dashboard/**`: the dashboard and every screen under it). A path of
  another layer's page comes from core's `KIT_ROUTES` (`dashboard`, `login`, `findWorkspace`, `handoff`, `signup`,
  `notificationDeliveries`, `subscription`), never spelled out *(convention)*. Nuxt shows `layers/auth/app/spa-loading-template.html`, the product's spinner, until the page is ready.
  The home page stays on the server and shows the session once it has mounted. *(tested: `ssrRules.test.ts`,
  `tests/e2e/spa.spec.ts`)*
- The frontend's server sends the security headers: nosniff, `X-Frame-Options: DENY` and the referrer policy on every
  response (core's route rule, HSTS from a production build), and on every rendered page a Content Security Policy that
  core's `server/plugins/security-headers.ts` builds from the runtime config and the hashes of the page's inline scripts
  (`contentSecurityPolicy()` in `layers/core/app/utils/security-headers.ts`). Never add `'unsafe-inline'` or
  `'unsafe-eval'` to `script-src` or render HTML from data (`v-html`): the session token is in `localStorage`. A
  third-party script, frame or API origin goes in `contentSecurityPolicy()`; the map's style and tile origins go in
  through `mapOriginsOf()` (from `runtimeConfig.public.map` and `security.mapOrigins`), and MapLibre's worker is its CSP
  build served by the frontend, so the policy has no `blob:` script or worker. *(tested: `securityHeaders.test.ts`,
  `tests/e2e/security.spec.ts`)*
- The tenancy layer answers `/robots.txt` and `/sitemap.xml` from `server/routes`, before the Vue app: the root
  domain lets crawlers in and lists its home page, a workspace host is `Disallow: /` with no sitemap (404).
  Never add a `public/robots.txt` or `public/sitemap.xml`: Nitro serves a file ahead of any route. The tenant
  middleware skips any path that ends in a known static extension (`ico`, `png`, `jpg`, `jpeg`, `svg`, `webp`,
  `gif`, `css`, `js`, `map`, `txt`, `xml`, `json`, `woff`, `woff2`, `ttf`, `webmanifest`, listed in
  `asset-path.ts`), so a file never asks the backend for the workspace, while a dotted page such as
  `/u/john.doe` still does. The sitemap address in both files comes from the configured root domain, never
  from the Host header. *(tested: `tests/e2e/seo.spec.ts`, `tenantSeo.test.ts`)*

### Imports (ESLint `boundaries/dependencies`)

- A layer imports from itself, from `core` and from `frontend/shared`, never from another layer or
  from `frontend/app`.
- `core` imports from no layer and not from `frontend/app`, but may use `shared`. The app may import
  from any layer and from `shared`.
- `frontend/shared` imports nothing from `frontend/app` or from any layer, `core` included. Anything
  else may import it. It follows the same color, line-count and i18n rules as `app/` and `layers/`.
- Tests (`layers/*/tests/**`, `*.test.ts`) are exempt.
- Use auto-imported components, composables, stores and utils only from your own layer or `core`. The
  rule reads Nuxt's generated `.nuxt/imports.d.ts` and `.nuxt/components.d.ts` and fails when they are
  missing, so `pnpm lint` runs `nuxt prepare` first. *(ESLint `mood-kit/no-cross-layer-auto-import`)*

### Design

- Build screens from mood-ui components (`import { Container, Typography } from "mood-ui"`). Do not
  add another component library or hand-roll tables, modals or menus *(convention)*.
  `vue/no-restricted-html-elements` fails on a plain `<button>`, `<input>`, `<select>` or `<textarea>`
  and names the component to use (`KitButton`, `Input`, `KitSelect`, `Textarea`, `GlassSwitch`, and the other fields
  mood-ui exports).
- A free-text field that can run past one line (a description, notes, a message, a body) is mood-ui's `Textarea` as it
  comes, never a one-line `Input`: about three rows, with `maxLength` at the API's limit and `showCounter`. When the API
  takes the text on one line (`PlainName`, as a role's description), the field passes what is typed through core's
  `joinLines`, so a line break becomes a space instead of a refusal. The role editor and the "Create role" dialog are the
  model. *(convention)*
- mood-ui's components are used as they come: composed, given their own props, variants, sizes, colors and slots, and
  laid out from outside (spacing, grid, where they sit). Never restyle one from outside: no forced utilities (`!`,
  `text-2xl!`), no selectors into its internals (`[&_.modo-field-wrapper]:h-12`), no classes that fight its own sizes,
  heights, colors or radius, and no hand-made replacement of something mood-ui provides (buttons, inputs, selects,
  cards, radios, tabs, breadcrumbs, tooltips, file inputs, dialogs, toasts, badges). When mood-ui lacks what a screen
  needs, use its closest option, accept the difference, and list the gap under "Known gaps in mood-ui" below.
  `mood-kit/no-mood-ui-overrides` fails on a forced utility in the `class` or any `*Class` prop (`cellClass`,
  `wrapperClass`) of a mood-ui component (or `KitButton`, `KitTooltip`), and in a `*Class` property of a script (a table column's
  `cellClass`, written there or in a constant of the same file), on a selector into mood-ui's internals anywhere, and
  on a `SurfaceCard` without `:framed="false"`; the rest is *(convention)*.
- Every button is core's `KitButton`: mood-ui's `PressButton` inside mood-ui's `MorphTooltip` (core's `KitTooltip`, with no arrow, as mood-ui draws it), with a required
  `tooltip`. A tooltip is a short label on one line, two to five words and at most 40 characters ("Create role",
  "Crear rol"); a longer explanation goes in the page's subtitle. Its message key has a `tooltips` segment
  (`rbac.tooltips.create`) or ends in `tooltip`, and `tooltipLocales.test.ts` (core) fails on one that is too long, in
  any layer and language; a message with plural forms (`one | many`) is checked form by form. A button at the right edge (a page's primary action, the action bar, the top bar) takes
  `tooltipPlacement="top-end"` (`bottom-end` in the top bar) so the tooltip lines up with it; the rest keep `top`. A
  button with no words (an icon) also needs `ariaLabel`. `KitButton` is only for a real button, whose content is a
  label or an icon. A text link (to another page, in a sentence or under a form) is a `KitButton` with `to` and
  `variant="text"`, mood-ui's link-style PressButton, never a `NuxtLink` styled by hand: `to` makes it an `<a>` with the
  page's address, opened by the router on a plain click (a path of another layer comes from `KIT_ROUTES`). A control
  that is its own element (a color swatch, the avatar that opens the profile menu, a choice card, a note in a table) gets
  only core's `KitTooltip` around it (mood-ui's `MorphTooltip`, bound to that one element), never a `PressButton`, whose background and padding would show around it. The tooltip takes mood-ui's radius from the provider; never set one on it.
  A `KitButton` drives its tooltip itself (core's `useButtonTooltip`, through mood-ui's `trigger="manual"` and controlled
  `open`): a mouse or pen resting on it and keyboard focus (`:focus-visible`) open it, a touch never does, and a press or
  a change of route closes it, so it never stays over what the button opened. A control of its own with core's
  `KitTooltip` around it does the same (`:open` from its own `useButtonTooltip()`) (the profile menu's avatar, a brand color swatch, core's
  `ChoiceCard`), and one that acts on a key of its own (Enter on the menu's trigger) calls its `close`. *(tested in core: `kitButton.test.ts`)*
  Its attributes and listeners go to the button, the only element it puts in the page (the tooltip is teleported), so
  a class that lays it out in its parent (`ml-auto`, `lg:hidden`, `self-center`) goes on it as `class`; `KitTooltip` without
  `open` opens on hover and focus, as mood-ui's does (a badge or an icon that explains). `mood-kit/kit-button` fails on
  importing mood-ui's `PressButton` anywhere but `KitButton.vue`, its `MorphTooltip` parts anywhere but `KitTooltip.vue`,
  its plain `Button` and `Tooltip` anywhere, and on an icon-only `KitButton` without an aria label; `nuxt typecheck` fails on
  one without `tooltip`. Anything else interactive with no visible text gets a tooltip and an aria label too
  *(convention)*.
- Every card is mood-ui's `SurfaceCard` with `:framed="false"`: a single border (its default, `framed`, draws a second
  frame inside the border, which the kit does not use). It is `outline` unless it stands out (`elevated`: the auth card,
  the plan in use), with its content in a `SurfaceCardBody`, which pads it at the card's size (`size="large"` for a
  roomier one, `padding="none"` for a card that lays out its own content, as `ChoiceCard`). mood-ui's plain `Card` is not
  used. *(ESLint `mood-kit/no-mood-ui-overrides` fails on a `SurfaceCard` without `:framed="false"`; the rest is convention)*
- Every on/off control is mood-ui's `GlassSwitch` (settings, the notifications matrix and audiences, preferences, the
  preference center, the hours editors, the admin's flags), with the same props mood-ui's `Switch` had; its attributes
  (a test id) go to its checkbox. mood-ui's plain `Switch` is not used. *(convention)*
- Every value picker (a role, a status, a time zone, a currency, a language, a country, a list's filter) is core's
  `KitSelect`: mood-ui's `MorphSelect` as it comes, with its `MorphSelectTrigger` and `MorphSelectContent`, `searchable`
  for a long list (time zones, currencies, countries), `icon` for a leading glyph (the public screens' globe); a filter
  keeps its own width, a form's field spans its column (`full-width`), and `null` is nothing chosen. An option for nothing
  chosen ("Any status", "Everyone") is `noneLabel`, never an option whose value is `""`: `MorphSelect` takes `""` for
  nothing chosen and shows its placeholder; `noneLabel` shows for `null` and `""` and answers `null`. Its attributes (a
  test id) go to the field's button. A set of ids (a member's skills, a branch's people, an event's attachments) is the
  same `KitSelect` with `multiple`, bound with `v-model:values` (a `string[]`); a cap on how many is the caller's, which turns off the options
  left once it is reached. mood-ui's plain `Select` and `MultiSelect` are not used. *(convention)*
- Every action menu (the profile menu at the right of the top bar) is mood-ui's `Menu`, which morphs out of its trigger:
  `MenuTrigger` (`as-child` around the control that opens it), `MenuContent` (`side`, `align`), `MenuLabel` for a heading,
  `MenuItem` (`icon`, `color="danger"` for a destructive one, `disabled`, `@select`) and `MenuSeparator`. Choosing an
  item closes it. mood-ui's `DropdownMenu` is not used. *(convention)*
- Every dialog is core's `KitDialog`: mood-ui's `Dialog` as it comes, settled in the centre over its dimmed backdrop
  (`placement="center"`), built from its parts (`DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`,
  `DialogFooter`), with a `title`, an optional `description`, a `body` slot and a `footer` slot of at most two
  `KitButton`s (the way back, then the action), which mood-ui's footer lays out (side by side, stacked full width on a
  phone). `alert` leaves out the close button in the corner and keeps Escape and a click outside from closing it;
  `:dismissable="false"` keeps them from closing a dialog that holds a `KitSelect` or a `DateField` (see the gaps); `close`
  is sent when the dialog asks to close itself. Attributes (a test id) go to its panel. A question asked from a script is
  mood-ui's `useConfirm().confirm({ … })`, drawn by core's `ConfirmQueueDialog` (mounted once in `app.vue`), the same
  Dialog with the icon of its color and two KitButtons; mood-ui's `ConfirmDialog` host (a `Modal` whose buttons have no
  tooltip) and its `Modal` are not used. *(convention; tested in core: `confirmQueueDialog.test.ts`)*
- Every page of a module in the dashboard has one anatomy, top to bottom, on a `flex flex-col gap-6` root: core's
  `PageHeader` (breadcrumb, title, subtitle, and the primary action at the right of the title, under it on a phone),
  then mood-ui's `Tabs` if the page has tabs (the toolbar and the content go in its panels), then core's `PageToolbar` if
  the page has a search, filters or secondary actions (search at the left, the rest at the right), then the content. No
  page draws its own title, breadcrumb or toolbar row; the dashboard home, roles, role editor, settings and profile pages
  are the model.
  `PageHeader`'s title is mood-ui's heading at its default size, an `h2` (see "Known gaps in mood-ui"), and its `actions` slot passes the `tooltipPlacement` for where the
  button sits (`top-end` beside the title, `top-start` under it). See `docs/frontend.md`, "Page anatomy". *(convention)*
- Every tab bar in the kit is mood-ui's `Tabs` with `variant="line"` (the bottom-border indicator), set on each `Tabs`
  even though it is mood-ui's default; never `pill` or `segmented`, and never a tab bar built from other components.
  See `docs/frontend.md`, "Page anatomy". *(convention)*
- A choice between views or modes (all or unread, monthly or yearly, the default color or one of its own) uses mood-ui's
  `Tabs` with `variant="line"`, what each shows in its panel, never `Segmented`; a setting's value picked in a row of
  several (a notification's channel mode) is no view and stays `Segmented`. A card groups related fields and leaves no
  large empty area: fields that belong together share one card, in columns on a wide screen (the platform's Brand card,
  the workspace's Identity section: fields at the left, the logo at the right). In a table, a row's actions are outline
  `KitButton`s at its end, icons with their tooltip, only those its state allows; the name is plain text, never a button or
  a link that opens the row. The branches table and the admin's workspaces are the model. See `docs/frontend.md`, "Design
  rules". *(convention)*
- Every page that edits something and saves it on demand ends in core's `PageActionBar`, last in its root, never inside
  another box, and has no Save of its own anywhere else. It is always visible on an editing page, for whoever may edit,
  once there is something to edit (not while what the page edits first loads, fails to load or does not exist: the page's
  message stands alone), holds only its buttons (no text) and its actions are disabled until something changes (`dirty`): at the right, Cancel
  (`ghost`, throws the changes away), Undo (`outline`, only with `undoable`, on a page that can step back through its
  changes; `canUndo` says whether there is a step), Review changes (`outline`, while the page's change set has changes)
  and Save (primary, the brand's color, with its loading state), each a `KitButton` with its tooltip at `top-end`.
  Below `sm` Cancel, Undo and Review are icons with their tooltip and aria label, so the bar keeps one line on a phone.
  Someone who may only look gets no bar (`v-if` on the permission). It is a full-width strip, not a card: a line above
  it (`border-t`), the page's background, no shadow or radius. The dashboard layout scrolls the page in an area of its
  own and keeps a strip under it that the bar is teleported into (`providePageActionBarTarget`), so it runs from the
  sidebar to the edge of the window with the sidebar open, collapsed or a drawer, stays at the bottom and never covers
  the page: never pad a page for it, and never make it `fixed`. Its content has the page's width and gutter
  (`PAGE_GUTTER`, shared with the layout), so its buttons line up with the content's right edge. A page whose every
  choice saves the moment it is made has no bar (the kit has none since My profile gained its details). The role editor
  (`undoable`, Save with the count), settings (one Save for every section, `provideSettingsSaver`) and My profile (its
  details through the same saver; the photo, the password, the email and the sessions are actions of their own) are the
  models. *(tested in core:
  `pageActionBar.test.ts`; the layout in `dashboardLayout.test.ts`; the rest is convention)*
- Every editing page registers the fields it saves in core's change set: `provideChangeSet()` in the page (settings
  gets it from `provideSettingsSaver`), then `changes.group(id, label).field(key, { label, original, current, format })`
  for each field, with a label in the screen's language and a format from core (`formatAsText`, `formatAsColor`,
  `formatAsTimezone`, `formatAsCurrency`, `formatAsLanguage`, `formatAsList`, `formatAsSet`). The page's `dirty` comes
  from it (`changes.isDirty`, or a group's `isDirty`), never from a copy of its own. A part of the page with changes
  shows core's `UnsavedDot` (a settings section in its header, open or closed; a profile card beside its title;
  "Unsaved changes" in its tooltip and aria label), and the bar's Review changes opens a dialog that lists every change before → after by group, with Close and
  Save changes. A value that saves at once (the logo) is not a field. *(tested in core: `useChangeSet.test.ts`,
  `changeFormats.test.ts`, `settingsSection.test.ts`, `unsavedDot.test.ts`, `changeReviewDialog.test.ts`; registering a page's fields is
  convention)*
- The dashboard's scrolling area has `container-type: size`, so a page can size something to its visible height
  (`100cqh`): the role editor's impact panel is sticky and as tall as its pane, up to that height. It makes the area the
  containing block of a `fixed` element inside it, which is why every mood-ui overlay (tooltip, menu, dialog, drawer) is
  teleported to `<body>`: never put a `fixed` element of your own in a page. *(convention)*
- An action the plan does not allow (a feature it leaves out, a quota that is full) stays on screen, disabled, with the
  tooltip of core's `usePlanGate()`; one the person lacks a permission for is hidden (`v-can`). The API refuses both
  either way. *(convention; `usePlanGate` tested in core)*
- An action a super admin acting as the person may not take (one whose route refuses an impersonation: the account, the
  person's profile, preferences and inbox, roles, the workspace's notifications, money, a `DELETE`) stays on screen,
  disabled, with the tooltip of core's `useImpersonationGate()` (`core.tooltips.impersonating`); a field becomes read-only,
  with `core.impersonation.off` beside it. The API refuses it either way (403 `auth.impersonation_forbidden`), and its
  message is the fallback. *(convention; the gate tested in core)*
- Colors come from tokens. `mood-kit/no-raw-colors` fails on Tailwind palette classes (`bg-blue-600`,
  `text-white`), hex values, and color functions (`rgb()`, `oklch()`) that do not wrap a `var()`.
  It also fails on a named color (`red`, `white`, `rebeccapurple`; not `transparent` or `currentColor`)
  where a color goes inline: `style="..."`, `:style` objects and strings, `<style>` blocks, and the
  `fill`, `stroke` and `color` attributes of SVG elements. It checks templates, scripts and `<style>`
  blocks of source files in `app/`, `layers/` and `shared/`; tests and standalone `.css` files are not
  checked, and neither is a style object built in a script and bound by name.
- Tokens: mood-ui's semantic classes (`bg-primary`, `text-foreground`, `bg-background`, `bg-muted`),
  `ink-*` for neutrals, `accent-*` for the kit's fixed blue, `danger-50` and `danger-800` for error
  surfaces (Tailwind's red-50 and red-800 in light mode, deep red and light red in dark), and `tenant-*`
  for the tenant's brand scale, which only resolves inside `ModoProvider` (`app.vue` wraps every page in
  one). `accent-*` is unrelated to mood-ui's `--accent` surface token (`bg-accent`), and `main.css` never defines a
  bare `--color-accent`, which would repaint mood-ui's hover surfaces in the kit's blue. The kit's tokens are defined in
  `frontend/app/assets/css/main.css`.
- A workspace's brand is a primary palette handed to `ModoProvider`: derived from its `#rrggbb`, or for `default` read
  from the `--brand-mono-*` tokens of `main.css` (black on light, white on dark; `--brand-mono-seed` and
  `--brand-mono-ring` are the picker's black and the default swatch's ring). That scale is not monotonic (400 is the
  lightest, 900 equals 600), so anything that follows the brand uses mood-ui's semantic tokens (`bg-primary`,
  `text-primary`), never a fixed `tenant-<shade>`. A screen with no workspace keeps mood-ui's own primary.
  *(tested in core: `brandPalette.test.ts`, `appShell.test.ts`)*
- 300 lines per file at most, blank lines and comments not counted (ESLint `max-lines`, every source
  file in `app/`, `layers/` and `shared/`, tests in `layers/` included).
- mood-ui ships its own compiled CSS, ahead of the app's. `main.css` scans `node_modules/mood-ui/dist` (`@source`)
  so that a responsive utility mood-ui relies on (`hidden lg:flex` on the sidebar of `AppShell`) is built after
  this app's `.hidden` and wins at its breakpoint; without it the sidebar disappears as soon as any source of the
  app uses `hidden`. *(tested: `tailwindSources.test.ts`)*
- A boolean prop that is left out is `false` in Vue, whatever the code does with `undefined`: give one that should
  start `true` a default in `withDefaults`. *(convention)*

### API errors

Every failed request shows a message in the view; never catch an error and drop it *(convention)*.
`useApi` already turns a failure into an `ApiRequestError` that carries the envelope (see
[Calling the API](#calling-the-api)). These helpers in `layers/core/app/utils/envelope.ts`, which Nuxt
auto-imports, are what it is built on:

- `toApiEnvelope(source)` takes a body, its JSON text or a fetch error and returns the envelope, or
  `null` when there is none (network failure, HTML error page).
- `firstErrorMessage(envelope, fallback)` returns the first non-blank message, else the fallback.
- `errorMessages(envelope)` returns every message; `fieldErrors(envelope)` groups them by input.

`useApiError().describe(error)` keeps the backend's message. A failure that brings none (no connection, a
gateway's HTML page) gets one chosen by what went wrong: `core.errors.network`, `timeout`, `forbidden` (403),
`conflict` (409), `rate_limit` (429), `server_error` (5xx) or `unknown`.

### Calling the API

- Only `useApi().request()` talks to the backend; it throws `ApiRequestError`, always with a failure
  envelope. *(convention)*
- The API lives under `/api/v1`: `NUXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000/api/v1`) already
  ends there, so a service asks for `/tenant`, never `/api/v1/tenant`. *(convention)*
- `useApi` and `useApiError` read the locale and `t()` through `useNuxtApp().$i18n`, not `useI18n()`, so
  they also work in stores, middleware and event handlers, where `useI18n()` throws. Do the same in a
  composable of your own that can run there. *(convention)*
- A file the API sends as it is (a CSV) comes through `useApi().download()`, inside `useAction`; the page saves it
  with core's `saveBlob()`. *(convention)*
- Only code in a `services/` folder calls the API: `$fetch(`, `useApi(`, `useFetch(` and `useLazyFetch(` are
  reported everywhere else, except core's own composables. *(ESLint `mood-kit/no-unmanaged-service-call`)*
- Use a service only inline inside `useAsyncState`, `useListQuery`, `useFormSubmit` or `useAction`. Every
  reference to a name imported from a `services` folder is reported outside them, not only calls: an alias
  (`const f = svc`), a callback (`ids.map(svc)`), a deep member (`ns.a.b()`), re-exporting an imported name,
  and anything in a template. Type-only imports are fine. *(ESLint `mood-kit/no-unmanaged-service-call`)*
- The rule is off inside `services/`, and `stores/` may use services. Whoever calls a store action wraps it
  in a managed composable. *(convention)*
- The rule does not look inside the managed callback, at dynamic imports or at `export ... from` a services
  folder. Never `try/catch` inside the callback: the composable is what shows the failure. Never `import()`
  or re-export a service from outside `services/` to get around the rule. *(convention)*
- Show loading, error, empty and content with `<AsyncBoundary :status="status" :error="error"
  :loaded="hasLoaded">` (add `:empty="isEmpty"` for lists): the loading block shows on the first load
  only, and a reload keeps the content on screen, marked `aria-busy`. Its `#loading`, `#error` (gets
  `{ error, retry }`) and `#empty` slots replace the defaults. Show form-level errors with
  `<FormErrorBanner :message="formError">` (`useFormSubmit` also gives `formMeta`, the `meta` of the failure, for a
  form that names what a refusal is about). Field errors reach inputs through `useFormSubmit`; one-off
  actions (delete, archive) go through `useAction`, which toasts failures, and its success through its `successMessage`,
  never a `toast.success` in its `onSuccess`. Never `catch {}`.
  *(convention)*
- To veil content that is reloading, put `<LoadingOverlay />` inside a `relative` parent: it blurs what is
  behind it, shows the spinner in the middle and announces itself. Its `variant="block"` is `LoadingBlock`.
  A mood-ui `Table` shows its own loader instead, through its `loading` prop, on the first load as on a reload: its
  `AsyncBoundary` takes `table-loader` (the table is drawn from the first load), and the table's `loading` is
  `!hasLoaded || isLoading` (a list's `isReloading`, true while its first page loads, not while one more does). No
  table of the kit has a `LoadingOverlay` or skeleton rows of its own. *(convention)*
- A request cancelled through its `signal` is not a failure: `useApi` throws an `ApiRequestError` coded
  `request.aborted`, and `useAsyncState`, `useListQuery`, `useFormSubmit` and `useAction` stay silent (no
  error state, banner or toast; a loader's status goes back to how the last finished request left it). In
  code of your own, ignore it with `isAbortedRequest(error)`. *(convention)*
- A request has 15 seconds, retries included. Pass `timeout` (milliseconds) to `request()` for a call that is
  slow on purpose. Running out of time fails with `network.timeout` and the message `core.errors.timeout`,
  which the view shows, unlike `request.aborted`. *(convention; tested in core)*
- `useAsyncState` and `useListQuery` load in the browser only: after the mount inside a component, right
  away outside one, never on the server, which renders them as loading. `useApi` announces a 401 through
  the hook in the browser only. *(convention; tested in core)*
- Auth and tenancy write `useApiToken()` and `useTenantSlugState()`; listen to the
  `kit:api:unauthenticated` hook for 401s instead of importing core internals. The hook receives the
  `ApiRequestError`, and only the code `auth.unauthenticated` means the token is gone: a refused sign-in or a
  spent handoff code are 401s too, and the auth store ignores them (a failed captcha is 422 `auth.captcha_failed`). *(convention; tested in
  auth)*
- A call of the client portal passes `session: "portal"` (`request()` or `download()`): core sends the portal's token
  (`usePortalToken()`, `useState('kit:portal-token')`, written by the clients layer), never the member's, even when the portal
  has none, and drops any `Authorization` header of the caller's; a call without it never sends the portal's token. A 401 of a
  portal call goes to `kit:portal:unauthenticated`, never to `kit:api:unauthenticated`, so it never ends the member's session.
  *(tested in core: `portalSession.test.ts`)*
- A layer whose store keeps something that belongs to a user (permissions, preferences, loaded data) clears it in
  a `kit:auth:logout` listener (`useNuxtApp().hook(...)`, in a plugin). The auth store calls the hook whenever a
  session ends here (logout, an expired token, a password reset) and when a handoff replaces one; the session is
  already gone when it runs, and a listener that throws is logged without keeping the user signed in.
  *(convention; tested in auth)*
- Layer messages live in `layers/<x>/i18n/locales/{en,es}.json`, namespaced by layer (`core.*`), and every key
  segment is snake_case (`rbac.editor.save_with_count`). *(tested in core: `locales.test.ts`; the namespace is
  convention)*
- Coverage is enforced per file. *(Vitest `thresholds.perFile`)*
- A unit test reaches no network: Vitest's setup (`frontend/tests/setup/no-network.ts`) refuses every address with a
  scheme, so a test mocks `useApi` or the service and passes whatever runs on the machine. *(tested in core:
  `noNetwork.test.ts`)*

### Sharing between layers, permissions and the session

- Layers share nothing but core, so what two layers both need lives in core as state, and what one layer
  needs another to do is asked through a hook core declares. Core owns `useState('kit:session')`
  (`useSession()`: `status` `idle`, `loading` or `ready`, plus `name`, `email`, `locale`, `avatarUrl`, `workspace`, `workspaces`
  and the `roles` slugs) and `useState('kit:permissions')` (`usePermissionsState()`), as it owns the API token.
  `loadSession()` on the auth store asks `/me` and `/me/memberships` once for whoever asks meanwhile, reads Auth's own
  keys (`user`, `tenant`), hands the whole of `/me` to `kit:session:me`, where each layer reads the keys its package
  adds (rbac: `permissions` and `roles`; settings: `brand`, `localization`, `theme`), then sets `ready`. Auth never
  names another package's key of `/me`. Ending the session runs core's `clearSessionState()`. *(tested in auth, rbac
  and settings)*
- Core owns `useState('kit:plan')` (`usePlanContext()`: the workspace's plan from `/me`, with each quota's limit and,
  once loaded, its use), filled by the plans layer (`kit:session:me`, and `kit:plan:load-usage` for the use) and emptied
  by `clearSessionState()`. *(tested in core and plans)*
- Core owns `useState('kit:platform')` (`usePlatformPublic()`: the platform's name, logo, color and access mode, from the
  public `GET /platform/public`; `usePlatformName()` and `useBrandPalette()` follow it where there is no workspace) and
  `useState('kit:platform-flags')` (`usePlatformFlags()`, `usePlatformFlag(slug)`: the workspace's platform flags from
  `/me`), both filled by the platform layer; `clearSessionState()` empties the flags. Whether a page is on the admin's host
  is `usePlatformHost()`. Core also owns `useState('kit:impersonation')` (`useImpersonationState()`: who from the platform
  acts as the person, from `/me.impersonation`), filled by auth and emptied by `clearSessionState()`. *(tested in core,
  auth and platform)*
- Core also owns `useState('kit:branch')` (`useCurrentBranch()`: the branch the person works at, from `/me.branch`), filled
  by the branches layer and emptied by `clearSessionState()`. A list whose API follows the branch loads again with
  `useBranchReload()`; the frontend never sends the branch. *(tested in core and branches)*
- Core also owns three states with more than one writer. `useState('kit:brand')` (`useWorkspaceBrand()`: the
  workspace's `primaryColor` and `logoUrl`; null on a screen with no workspace) is filled by tenancy from the public
  `GET /tenant`, by settings from `/me` (`kit:session:me`) and the moment a color or logo is chosen; it survives the end of a
  session, since it is the workspace's and public. `useState('kit:theme')` (`useUserTheme()`: `colorMode`, `radius`)
  and `useState('kit:localization')` (`useWorkspaceLocalization()`) are filled by settings from `/me` and emptied when the
  session ends, and changed by settings when the person saves. `app.vue` hands the brand (`useBrandPalette()`) and the
  radius to `ModoProvider`; core's `user-theme` plugin applies the color mode. *(tested in core, auth, settings and
  tenancy)*
- Hooks are declared next to what they serve, all in `layers/core/app/composables/`: `useSession.ts` (`kit:auth:*`,
  `kit:session:me`: a layer reads the keys its package adds to `/me`, from a plugin),
  `useApi.ts` (`kit:api:unauthenticated`; `kit:portal:unauthenticated`, a 401 of a portal call),
  `useSettingsSections.ts` (`kit:settings:sections`: a layer pushes `{ group, component }` for the settings group it edits),
  `useProfileMenuLinks.ts` (`kit:profile-menu:links`: a layer pushes `{ id, label, icon, to }` for a page of the person's
  own), `useProfileSections.ts`
  (`kit:profile:sections`: a layer pushes `{ id, order, component }` for a section of My profile), `usePlanContext.ts`
  (`kit:plan:load-usage`: the plans layer loads what the workspace uses of each quota) and `useDashboardBanners.ts`
  (`kit:dashboard:banners`: a layer pushes `{ id, order, component }` for a banner above every dashboard page),
  `useClientTabs.ts` (`kit:clients:tabs`: a layer pushes `{ id, order, labelKey, component }` for a tab of a client's page),
  `usePortalSections.ts` (`kit:portal:sections`: a layer pushes `{ id, order, component }` for a section of the client portal,
  `id` being the section's key from `GET /portal/me`; the page draws only the listed ones, in the API's order, and the component
  gets no props),
  `useSubscriptionSections.ts` (`kit:subscription:sections`: a layer pushes `{ id, order, component }` for a section of the
  Subscription page) and
  `useOnboardingSteps.ts` (`kit:onboarding:steps`: a layer pushes `{ step, component }` for the screen of an onboarding
  step it brings) and `useTopbarItems.ts` (`kit:topbar:items`: a layer pushes `{ id, order, component }` for the
  dashboard's top bar, before the profile menu) and `useTopbarActions.ts` (`kit:topbar:actions`: a layer pushes `{ id, order, labelKey, icon, to, permission, offWhileImpersonating? }` for the top
  bar's Create menu; only what the person has the permission for is offered, and what is flagged `offWhileImpersonating` not while impersonating) and `useDashboardWidgets.ts` (`kit:dashboard:widgets`: a layer pushes `{ key, component }` for a widget of the home; the
  component gets `widget` and draws in core's `DashboardWidgetCard`) and `useSidebarTopItems.ts` (`kit:sidebar:top`: a layer pushes
  `{ id, order, component }` for the top of the dashboard's sidebar, above the menu and in the mobile drawer; the component
  gets `collapsed`) and `useSearchShortcuts.ts` (`kit:search:shortcuts`: a layer pushes `{ id, label, icon, to }` for a
  page the global search's palette offers) and `useTeamMemberSections.ts` (`kit:team:member-sections`: a layer pushes
  `{ id, order, component }` for a section of a member's page of the team). A layer answers from a plugin and never names
  a page or component of another layer. `kit:auth:logout` tells that a session ended (see
  Calling the API). The others ask auth to act and are answered by its plugin: `kit:auth:sign-out`,
  `kit:auth:switch-workspace` (slug), `kit:auth:save-locale` (code; core has already switched the language) and
  `kit:auth:refresh-session` (what the person may do may have changed: their own role was edited). A failure is
  thrown back through `callHook`, so the caller runs it in `useAction`, which toasts it. A new layer needing the same asks for a new
  hook and a listener in auth, and never imports the auth store. *(convention; tested in auth and dashboard)*
- `usePermissions()` gives `can(p)`, `canAny(list)` and `canAll(list)`. Nothing is granted until the session is
  `ready`, so a view built on it starts closed.
- `v-can="'rbac.manage'"` shows an element only with that permission; a list shows it with any, and
  `v-can:all="[...]"` only with all. It hides, it does not remove, and it watches the permissions itself, so the
  element returns when they arrive or change. It is a convenience for the screen: the API is what refuses.
- `definePageMeta({ auth: 'required', permission: 'rbac.view' })` (a list needs all of them) sends a person
  without it to `/dashboard`. The auth middleware loads the session before the first page that needs one
  (a failure is toasted and the page shows without permissions), and core's guard waits for it. Both run in the
  browser only. *(tested in core and auth)*
- What the API words in the language of the request (the menu, the roles, the catalog of permissions, a role's
  history) is asked for again when `$i18n.locale` changes, and the menu also when the permissions change. A layer
  that keeps such data watches the locale itself; a refresh that fails is shown, and what was on screen stays.
  *(convention; tested in dashboard and rbac)*
- A screen of a signed-in person uses `definePageMeta({ layout: 'dashboard' })`: the shell of the `dashboard`
  layer (sidebar fed by `GET /menu`, top bar with the workspace's logo and name, and the profile menu). The layout builds the page's breadcrumb
  from the route and the menu and hands it down through core (`providePageBreadcrumb`, read by `usePageBreadcrumb`);
  the page's `PageHeader` shows it from two levels down, so a page never builds its own. A page signed in reaches by
  default is `/dashboard`. A layer's menu entries come from the backend's registry, never from the frontend.
- A module's screens are a layer of its own with pages under `pages/dashboard/<name>`, each with
  `definePageMeta({ layout: 'dashboard', auth: 'required', permission: '<module>.view' })`; the `rbac` layer
  (`/dashboard/roles`) is the model. Its labels come from the API in the language of the request, its own
  messages go in `layers/<name>/i18n` under `<name>.*`, and what it needs from the session it reads from core.
- A module's settings group gets its section on `/dashboard/settings` from a plugin of its layer
  (`kit:settings:sections`), built with core's `useSettingsForm()`, `SettingsSection` and `SettingsSectionSkeleton`,
  which give it versions, conflicts, confirmations, the guard on leaving and its fields in the page's change set
  (`useSettingsForm`'s `label` and `fields`: each key's label and format). A section has no Save: `useSettingsForm`
  registers it with the page's `provideSettingsSaver()`, whose `PageActionBar` sends one PATCH per section with changes, in
  the page's order; a refused one opens (`open`, bound to `SettingsSection`'s `v-model:open`) and shows why while the
  others keep their save. The `settings` layer's `IdentitySection.vue` and `LocalizationSection.vue` are the model
  (`docs/guides/add-a-settings-group.md`).
- A dashboard page the menu does not list names its crumb with `definePageMeta({ breadcrumb: '<i18n key>' })`,
  declared in `layers/core/app/types/page-meta.d.ts`.

### i18n

- `en` is the default and fallback locale; `es` ships too. Messages live in
  `frontend/i18n/locales/<code>.json`.
- Every user-visible string, page titles included, goes through `t()`. `vue/no-bare-strings-in-template`
  fails on text in a template and on `label`, `placeholder`, `title`, `alt`, `description`,
  `helper-text` and similar attributes, but it cannot see strings in scripts or bound literals
  (`:label="'Email'"`), so check those yourself *(convention)*.
- A message that counts something (`{count} members`, `{days} days`) has its plural forms (`one | many`) in every language
  where they differ, and the code passes the number that chooses one: `t(key, { count }, count)` *(convention)*.
- To add a locale, add one entry to `i18n.locales` in `frontend/nuxt.config.ts` and create its
  `frontend/i18n/locales/<code>.json`. A layer that ships messages (`core` does) needs the same in its
  own `nuxt.config.ts` and `i18n/locales/`. Missing keys fall back to English at run time, so core's `locales.test.ts`
  checks the app and every layer alike: each locale file has the keys `en.json` has, none blank, a layer's under its
  own name, and every literal key its code asks for (`t("x.y")`, `keypath="x.y"`, its own and core's) exists. A key
  built at run time (`` t(`core.password.${rule}`) ``) is not seen: check it yourself *(convention)*.
- mood-ui's own texts (table pagination, selects, dates, aria labels) follow the active locale: `app.vue` hands
  `ModoProvider` mood-ui's `locales[<code>]`. mood-ui ships `en` and `es`; a locale you add stays in English
  there until `app.vue` passes it a translation of its own. The exception is mood-ui's standalone `Pagination`,
  which stays in English whatever the locale: only the table pagination follows it. *(tested in core:
  `appShell.test.ts`)*
- Known gaps in mood-ui that the kit cannot fix from outside (fix them in mood-ui, then drop the line here):
  - `Sidebar`'s collapse button has a fixed English aria label ("Collapse sidebar" / "Expand sidebar") and no prop
    to replace it, so a screen reader reads it in English whatever the locale. Needs `collapseAriaLabel` /
    `expandAriaLabel` props, like its other aria label props.
  - `Accordion`'s header holds a title alone, no line under it: a settings section shows its group's description at
    the top of the open panel, and a permission module puts its count after its name. Needs a `description` (or a
    header slot).
  - `Accordion` keeps a closed panel in the page, folded to no height: its fields can still take the focus.
  - `Accordion`'s header has no slot for anything after the title either: `SettingsSection` lays its unsaved dot over
    the header's right end, left of the chevron, sized to the header at mood-ui's medium size (`h-11`, `pr-11`). At
    another size the dot is off centre. Needs a header slot (or a `badge` on the item).
  - `FileInput`'s drop area always draws its own Browse button and a medium-weight label, and its one-line variant
    (`inline`) has a fixed height that its two lines (name and the `accept` / size hint) do not fit: the hint sits on
    the dashed border and Browse pokes out of the frame. The logo uploader uses the drop area (`area`, `size="medium"`)
    in both states, lower (`dropzoneHeight="small"`) to replace a logo. It exposes no method to open the picker from
    another button.
  - `SurfaceCardBody` keeps its content's height and has no prop to fill the card: in a row of cards of different content
    the buttons cannot line up at the bottom on their own. The billing layer's `PlanCard` lays the body out as the card's
    growing column (`flex flex-1 flex-col`), so its content pushes the button down. Needs a body that fills the card (or a
    `fill` prop).
  - `Loader` stops at 22px (`large`) and has no size in CSS length: a block or page loading state needs a 40px spinner
    in the tenant's color, so core keeps its own `AppLoader` (used only through `LoadingBlock` and `LoadingOverlay`,
    with `!important` only to outlast the global reduced-motion reset). Needs larger sizes (or a CSS length) in `Loader`.
  - `Switcher` takes `size` but its trigger keeps one padding (`px-3 py-2`) and one icon box whatever it is: the branch
    switcher passes `size="small"` and stays as tall as the default. Needs its trigger to follow `size`.
  - `SurfaceCard` has no chosen state, and there is no card radio: a choice card is a `SurfaceCard` with a `Radio` inside.
    Its `as="button"` card is a `<button>`, so it cannot hold the radio (a radio inside a button is not valid HTML, and the
    keyboard stops twice): `ChoiceCard` is an `interactive` card (it lifts and presses) that takes the pointer, and the
    radio is the control.
  - `PageHeader` keeps its `actions` beside the title at every width, with no way to wrap them under it: core's
    `PageHeader` moves the slot to mood-ui's `hero` slot below `sm` (one or the other is rendered, never both). Needs a
    stacking breakpoint for the actions.
  - `PageHeader` decides whether it has a subtitle when it mounts (a computed over its slots, which are not reactive): a
    `subtitle` slot that appears later is not shown. A page whose subtitle depends on data that loads (the role editor's
    badge) always passes the slot and shows the part that waits inside it.
  - `PageHeader` has no prop for the title's heading tag (for example `titleAs`): at its default `size="medium"` the title is
    always an `h2`, and `as` only sets the root `header` tag. Dashboard titles are `h2`s until it has one; then core's
    `PageHeader` passes `h1` and the page's only `h1` is back, with no change to the tests, which find the title by role
    and name.
  - mood-ui has no text link: a link is its `PressButton` with `variant="text"` and `as="a"` (core's `KitButton` with `to`),
    which has a control's height and padding and a background on hover, even in the middle of a sentence. Needs a
    `Link` component.
  - `paletteFromHex` puts the chosen color at shade 700 of the palette it derives, while mood-ui paints the primary with
    shade 600 on a light page: a brand color shows lighter on buttons than its swatch. Teal `#14b8a6` gives 600 =
    `#18ddc7`, so a teal workspace's buttons are `#18ddc7`, not `#14b8a6`. It also makes some colors darker: violet
    `#8b5cf6` gives 600 = `#500de8`, a much deeper violet than the one picked. The kit hands the derived palette over as it
    comes (`brandPalette()`) and does not shift or patch it. Needs the seed at the shade mood-ui uses as the primary (or
    an option to choose it).
  - `PageHeader` draws its title bold, heavier than every other heading of the kit (cards, sections and dialogs are
    semibold), with no prop for its weight. Needs a `titleWeight` (or the weight from the theme).
  - `Stepper` (vertical) puts no space between its steps: a step's circle touches the next, and a label of two lines
    runs into the next step's. The setup wizard's sidebar lists its steps in the kit's own list instead (mood-ui's
    Typography and icons). Needs a gap between steps (or a `spacing` prop).
  - `Stepper`'s list has a fixed English aria label ("Stepper") and no prop to replace it: signup's check-your-email and
    workspace-in-progress screens (`ProvisioningStepper`) are read with it in English. Needs an `ariaLabel` prop.
  - In dark mode its dividers (`divide-border`, a table's rows) and the border of an unchecked checkbox stay under 3:1
    against the surface (WCAG 1.4.11 for the checkbox). Needs stronger `--border` / control-border
    tokens in dark.
  - `ColorPicker`'s chip has no outline, so `#000000` (the default brand) is a black chip on a near-black field in dark
    mode, and a white color the same in light. Needs a hairline border on the chip.
  - `MorphSelect` takes the value `""` for nothing chosen and shows its placeholder, so an option whose value is `""`
    ("Any status") never shows as chosen. Core's `KitSelect` gives that option with `noneLabel` (an inner value of its
    own, answered as `null`). Needs an option to show as chosen whatever its value.
  - A `Dialog` closes on any pointer down outside its panel, and the lists of `MorphSelect` and the calendar of
    `DateField` are teleported out of it: picking an option of a select inside a dialog closed the dialog. A dialog that
    holds one is `KitDialog` with `:dismissable="false"` (mood-ui's own prop): Escape and a click outside no longer close
    it, its close button and its actions do. Needs the dialog to count a teleported layer opened from inside it as inside.
  - `SearchInput`'s clear button has no tooltip and cannot get one from outside, and after a row is chosen it keeps the
    focus and opens its list again once the field empties: the search palette blurs the field when a row is chosen. Its
    results are drawn outside its box, so the palette in the phone's dialog is a `KitDialog` with `:dismissable="false"`.
    Needs a `clearTooltip` (or the clear button as a slot), closing the list when a row is chosen, and a list that counts
    as inside a dialog.
  - `AvatarUpload` declares `onSave` both as a prop (the upload, which answers with the address to show) and as an
    event, so one listener is called twice for one photo: once by the event and once as the upload. My profile's
    `useAvatarSave` sends a photo it was already given once, and answers both calls the same. Its picture's `alt` is
    a fixed Spanish "Avatar de {name}" in any locale. Needs `save` out of `emits` (or the prop renamed) and the alt in
    its locale.
  - `Switcher` opens its panel only above or below its trigger (its `placement` has no `right`): in a collapsed sidebar
    the branch switcher's icon opens the list under it, over the page, instead of at its side. Needs right-side
    placements.
  - `Tabs` always renders its panels after the tab bar, so it cannot sit in `PageHeader`'s `tabs` slot as a bar alone
    (the content would end up inside the `<header>`, or the bar would point at empty, focusable panels): a page puts
    `Tabs` right after `PageHeader`, with the toolbar and the content in its panels. Needs a bar-only mode, or panels
    that can live elsewhere.

### Visual tests (Playwright)

- Specs live in `frontend/tests/e2e/*.spec.ts`. Import `test` and `expect` from `./support/visual`
  and call `await capture("<name>")`. The fixture checks the locale and color scheme, waits for
  hydration, fonts and animations, then compares a full-page screenshot of the production build in
  the `light` and `dark` projects, with a per-pixel threshold of 0 and at most 100 differing pixels.
- Motion is off while capturing: the projects ask for reduced motion, and `main.css` then removes every animation
  (`animation: none`, not a 0 ms one, which still paints its first frame). Locally Playwright runs on at most 40% of
  the cores (`workers` in `playwright.config.ts`): on a busy machine more starves the browsers and pages miss their
  timeouts. *(convention)*
- Baselines are per platform: `tests/e2e/__screenshots__/<spec>/<name>-<project>-<platform>.png`.
  Both the macOS (`darwin`) and the Linux (`linux`) sets are committed. CI runs on Linux, inside the
  official Playwright Docker image, and compares against the `-linux` set. Generate that set only in
  that image, never on a developer machine, so fonts and the Chromium build match CI. The image tag in
  `.github/workflows/ci.yml` must equal the pinned `@playwright/test` version, and bumping one means
  regenerating the Linux set in the new image.
- Update baselines only for an intended design change, after reading the diff, and commit them with
  that change *(convention)*. On macOS: `pnpm --filter ./frontend build`, then
  `pnpm --filter ./frontend exec playwright test --update-snapshots`. For the Linux set, work in a
  clean copy inside the image, so the container's `node_modules` never replaces yours (add
  `--platform linux/amd64` on Apple Silicon, since the CI runners are x86-64; commit the change first,
  because `git archive` copies what is committed):

  ```bash
  docker create --name pw --ipc=host -w /work mcr.microsoft.com/playwright:v1.64.1-noble sleep infinity
  docker start pw
  git archive HEAD | docker cp - pw:/work
  docker exec pw sh -c 'npm install --global pnpm@10.33.0 && cd /work && HUSKY=0 pnpm install --frozen-lockfile \
    && pnpm --filter ./frontend build && pnpm --filter ./frontend exec playwright test --update-snapshots'
  docker exec pw sh -c 'cd /work/frontend/tests/e2e/__screenshots__ && ls */*-linux.png' | while read f; do
    docker cp "pw:/work/frontend/tests/e2e/__screenshots__/$f" "frontend/tests/e2e/__screenshots__/$f"
  done
  docker rm -f pw
  ```

  Read the new `-linux.png` files, light and dark, before committing them.

Gate: `pnpm --filter ./frontend check` runs ESLint, `nuxt typecheck`, Vitest with coverage (85%
lines, functions and statements, 80% branches, per file, over the `.ts` files of every layer's
`app/`, of `shared/` and the ESLint rules; type-only files are left out), then builds the app and runs
Playwright. Install the browser once with
`pnpm --filter ./frontend exec playwright install chromium`.

Always lint from `frontend/`, through `pnpm --filter ./frontend lint` or `lint:fix`. Both run
`nuxt prepare` first so new layers' aliases resolve. Do not run ESLint from the repo root.

## Repository

- There is one `.env`, at the root, read by Docker Compose, Laravel and Nuxt. Do not create
  `backend/.env` or `frontend/.env`: Laravel ignores the first while the root one exists, and the
  frontend scripts only load `../.env`. Never overwrite an existing `.env`, and add new settings to
  `.env.example` with a working local default *(convention)*.
- `pnpm lint:dup` runs jscpd over the PHP, TS, JS and Vue in `backend/` and `frontend/`
  with threshold 0: any clone of at least 8 lines and 60 tokens fails. Tests, `backend/config` and
  migrations are skipped. Move shared code into `Support` or `core` instead of copying it.
- `pnpm lint:dead` runs knip for unused files, exports and dependencies. A layer's `app/composables`,
  `app/utils` and `app/stores` are entry points, so knip cannot see dead code there: delete what you
  stop using *(convention)*.
- `pnpm lint:secrets` runs gitleaks over the whole git history and needs the `gitleaks` binary.
  `pnpm quality` runs `lint:dup` and `lint:dead`.

## Commits

- Conventional Commits, checked by commitlint in the `commit-msg` hook. Allowed types: `feat`, `fix`,
  `docs`, `chore`, `test`, `refactor`, `perf`, `ci`. Example: `feat(core): add envelope helpers`.
- The `pre-commit` hook runs lint-staged (Pint on staged PHP, `eslint --fix` on staged frontend
  `.ts`, `.vue` and `.mjs`), then gitleaks on the staged changes. Without gitleaks the scan is
  skipped on your machine, but CI scans the whole history on every push and pull request and
  fails on a leak, so a secret that slips past still blocks the merge. Install it locally to catch
  it before you push (`brew install gitleaks`, `apt install gitleaks`).
- Do not skip hooks with `--no-verify` *(convention)*.

## Before you claim done

Run these from the repo root and read the output. A task is done when all four pass, or when you
have said which one you could not run and why. CI (`.github/workflows/ci.yml`) runs the same gates on
every pull request and every push to `main`, plus `composer audit` and commitlint, so a gate you
skipped here fails there.

```bash
(cd backend && composer check)   # needs `docker compose up -d --wait` (Postgres, MinIO) and pcov
pnpm --filter ./frontend check
pnpm quality
pnpm lint:secrets
```

Then read your diff for what no tool catches: controllers that query models, responses built
without `ApiResponse`, swallowed errors, hard-coded strings, another layer's auto-imports, names
shadowed across layers, and screenshot baselines updated without a design change.
