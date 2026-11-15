# Multi-tenancy

Every customer of a product built on Mood Kit gets a **workspace** (a tenant in the code) on a subdomain of
its own: `acme.example.com`. One database holds every workspace, and Postgres row-level security (RLS)
keeps each workspace's rows away from the others. This page explains how a request finds its workspace and
what keeps the data apart.

## Workspaces

A workspace is a row of `tenants`: a uuid `id`, a `name`, a unique `slug` and a `status` of `active` or
`suspended`. Deleting one is a soft delete.

The slug is the subdomain. It is 3 to 60 characters: lowercase letters and digits in groups joined by single
hyphens, with no hyphen at either end and no `--` anywhere (which also keeps out the `xn--` prefix of
punycode). A database CHECK constraint enforces the same pattern. The slugs in
`backend/packages/Tenancy/config/reserved_slugs.php` (`www`, `api`, `app`, `login`, `admin` and about a
hundred more) are never given to a workspace. The file is sorted, one per line; never add `demo`, the
workspace the seeder creates.

Users are not tenant rows. One email is one person, who can belong to several workspaces through
`memberships`. See [Auth](../packages/auth.md).

## Addresses

| Address | What it is |
| ------- | ---------- |
| `example.com` | the root domain: the home page, signup, "find your workspace" |
| `<slug>.example.com` | a workspace: sign-in, the dashboard, everything a member does |

`TENANCY_ROOT_DOMAIN` (backend) and `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` (frontend) both hold the root domain,
`localhost` in development. [Domains](../configuration/domains.md) shows how to set them up, with DNS.

## How a request finds its workspace

Routes that need a workspace use the `tenant` middleware (`MoodKit\Tenancy\Http\Middleware\IdentifyTenant`).
It runs before authentication and route model binding, because both read tenant tables.

1. It takes the slug from the `X-Tenant-Slug` header, or, when there is none, from the host: the label in
   front of the root domain. A host with no label (the root domain), a deeper host or a reserved label
   (`api.example.com`) names no workspace and leaves the header to decide.
2. A header and a host that name two different workspaces are refused.
3. It looks the workspace up by slug, with a short cache.
4. It sets the tenant context (what `CurrentTenant` returns) and the RLS setting, runs the request, and
   clears both when the request ends.

The frontend sends `X-Tenant-Slug` on every request it makes from a workspace host, so the API itself can
live on any host: `localhost:8000` in development, `api.example.com` in production.

| Situation | Answer |
| --------- | ------ |
| No header and no workspace in the host | 400 `tenancy.required` |
| Header and host disagree | 400 `tenancy.mismatch` |
| Malformed slug, reserved slug, no such workspace | 404 `tenancy.not_found` |
| Suspended workspace | 403 `tenancy.suspended`, logged at info level with the slug and the route pattern only |

A resolved workspace is cached by slug for `TENANCY_CACHE_TTL` seconds (default 60). Saving or deleting a
`Tenant` model forgets its entry once the change commits; a bulk `Tenant::query()->update(...)` skips model
events, so its stale entries live until the TTL runs out. Misses are not cached, so a new workspace is
reachable at once.

Routes with no `tenant` middleware: the signup routes (the workspace does not exist yet) and the health
check `/up`. `GET /api/v1/tenant` uses it and answers the workspace's public facts, `{slug, name}`.

The client portal (Clients) is per workspace too: its routes take `tenant` (a signed-in client's through the `portal`
group), and its tables, `client_portal_codes` and `client_portal_sessions`, have RLS with `FORCE`, so a client's session
or code is only ever found under its own workspace.

## Row-level security

Every table with a `tenant_id` column (a uuid) enables RLS in its migration through
`MoodKit\Support\Database\TenantRls`:

```php
use MoodKit\Support\Database\TenantRls;

Schema::create('invoices', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
    // ...
});

TenantRls::enable('invoices');
```

`enable()` turns on `ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`, and creates one policy,
`tenant_isolation`: a row is visible and writable only when its `tenant_id` equals the session setting
`app.tenant_id`. With no workspace set, the table looks empty and nothing fails. `FORCE` applies the policy to the
table's owner too (the schema owner the migrations run as), which Postgres exempts from RLS without it.

Two options add a read-only policy each:

| Option | Policy | Lets a workspace read |
| ------ | ------ | --------------------- |
| `allowGlobalRows: true` | `tenant_shared_read` | rows whose `tenant_id` is null (a shared catalog). No workspace can write them; write them in the migration before `enable()`, or with a role that bypasses RLS. |
| `userColumn: 'user_id'` | `tenant_member_read` | the rows of that column that belong to the signed-in user, in every workspace (the `app.user_id` setting). `memberships` uses it for the workspace switcher. |

`php artisan tenancy:verify-rls` fails when the app role bypasses RLS or owns any table, view or sequence (or
belongs to a role that does), may write a table only the schema owner writes (see below), or when any table or partitioned table
with a `tenant_id` lacks forced RLS or exactly this set of policies. A materialized view or a foreign table
with a `tenant_id` always fails, since neither can have RLS: read tenant data through a table or a regular
view. CI runs it on a freshly migrated
database; run it after you deploy migrations too.

### Branches are not a row-level security boundary

Row-level security keeps workspaces apart, and nothing else. Which branch's records a person sees inside their own
workspace is a rule of the application, on top of it: Tenancy's `CurrentBranch` and `BranchAccess`, which the Branches
package answers (see [Scope data by branch](../guides/scope-data-by-branch.md)). On purpose:

- **Access to a branch depends on permissions and assignments, not on the row.** Who sees every branch is a permission
  (`branches.all`, through Rbac's roles and their cache), and anyone else sees the branches they work at. A policy would
  have to read a setting the application writes on every request (`app.branch_ids`), so the rule would still be the
  application's, with one more piece that can fail.
- **The system needs to read every branch.** Notifications, the daily summary, queued jobs, the audit trail and the
  platform's admin read across branches. With a setting that fails closed, each of them would need an explicit "every
  branch"; with one that fails open, forgetting to set it shows everything, which is no protection at all.
- **A branch does not separate customers.** It separates colleagues of one business who already share a workspace, and
  the owner sees everything.
- **One rule stays easy to check.** `tenancy:verify-rls` and the RLS coverage test keep checking a single policy per
  table.

What makes up for it: the two contracts, which every package and module uses and which re-check the person's choice on
every request; `BranchScopeTest`, an architecture test that fails when any package but Branches (or the backend's own
`app/`, `routes/`, `config/` and `database/`) names its tables of who works where (`branch_members`) and who chose what
(`branch_selections`), or the `branches.all` permission, even split into joined literals; the rule in
`AGENTS.md`; the guide for modules; and the tests of every list that follows the branch. The tables Branches keeps
(`branches`, `branch_hours`, `branch_members`, `branch_selections`) have row-level security like any tenant table.

### The database role

The app must connect as a role that is neither a superuser nor has `BYPASSRLS`: either one ignores every
policy. Nor may it own the tables: the owner of a table can `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` and drop the
audit triggers. So the kit uses two roles:

| Role | Env | Owns | May |
| ---- | --- | ---- | --- |
| schema owner | `DB_MIGRATION_USERNAME`, `DB_MIGRATION_PASSWORD` | the database and every table | run the migrations (and `CREATEDB` locally, for Pest's parallel test databases) |
| runtime role | `DB_USERNAME`, `DB_PASSWORD` | nothing | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on the tables, use their sequences; only `SELECT` on the tables only the owner writes |

The schema owner is the `direct` variant of the `pgsql` connection (`config/database.php`), which Laravel's migrator uses
by itself: `migrate` and the `migrate:*` family (the wipe of `migrate:fresh` included) connect as the schema owner unless
they are given `--database` (`Support\Database\SchemaOwner` names it). Everything else, the app, the workers and
`db:seed` included, connects as the runtime role; a `db:wipe` of its own needs `--database=pgsql::direct`. The first migration
(`0001_01_01_000000_grant_rows_to_the_runtime_role`, in Support) grants the runtime role the rows of whatever the owner
makes, through default privileges. A table that only the schema owner writes takes the runtime role's writes away in
its own migration (`Support\Database\RuntimeRole::revoke(RuntimeRole::WRITES, 'table')`), and its package lists it in
`Support\Database\ReadOnlyTables` from its provider's `boot()`, so that `tenancy:verify-rls` fails if the runtime role may
write it, whole or by a column (a grant of `INSERT` or `UPDATE` on one column counts; so does a table of
`CatalogTables`, below): Plans' catalog (`plans`, `plan_features`, `plan_quotas`, `plan_revisions`) is one, written by `plans:sync`
(and by the super admin's plan editor, as the [catalog's writer](#the-catalogs-writer)), and Notifications'
(`notification_channels`, `notification_event_types`) another, written by `notifications:sync`, and Billing's
`billing_prices` a third, written by `billing:sync-plans` (and the plan editor, as the catalog's writer), and Platform's
`platform_admins` (who the super admins are) a fourth, written by `platform:setup`, `platform:grant-admin` and
`platform:revoke-admin`; all connect as the schema owner too. A table the app may only add to keeps `INSERT` and loses
the rest (`RuntimeRole::revoke('UPDATE, DELETE, TRUNCATE', 'email_suppressions')`, and
Billing's `billing_webhook_events`, and Platform's `platform_audit_logs`, the platform's own trail: it has no `tenant_id`,
names the workspace an action was about in `workspace_id`, so no workspace can read it, and is append-only by triggers). With `DB_MIGRATION_USERNAME` empty, the migrations run
as `DB_USERNAME`, which then owns everything, and `tenancy:verify-rls` fails. Locally, `scripts/postgres-init` creates both roles, and the
superuser (`DB_ADMIN_USERNAME`) is for admin work only.

`TENANCY_ENFORCE_RLS=true` makes the app check this itself. On the first connection to the default database
in each process, it asks Postgres whether the role is a superuser or has `BYPASSRLS`, and if so throws and
drops the connection; the next use connects and checks again. It never checks at boot, so `/up` and
`artisan package:discover` work with the database down. The check is one query per process: under PHP-FPM
that is one per request that uses the database, and a queue worker pays it once. It is `false` in
`.env.example` and must be `true` in production. To run one command with a privileged role, set it to
`false` for that command only.

### Poolers

The tenant is set per database session (`set_config(..., false)`), not per transaction. The kit needs a
direct connection, or a pooler such as PgBouncer in **session** mode. Transaction mode would hand a
session, and its tenant, to another request.

## Code that runs outside a request

**Queued jobs** need nothing. When a job is dispatched, the current workspace is stamped on its payload,
and the worker sets the tenant context and the RLS setting from it before the job is unserialized, so
`SerializesModels` works on tenant tables. Afterwards it puts back whatever was set before. A job without a
workspace runs with none. A job whose workspace is suspended or deleted fails without running, after the
usual `--tries`; a job that implements `MoodKit\Tenancy\Contracts\RunsForSuspendedTenant` runs for a suspended workspace (not
for a deleted one).

A job dispatched where there is no current workspace (a command, the scheduler) or for another workspace
implements `MoodKit\Tenancy\Contracts\TenantScopedJob` and returns the workspace's id from `tenantId()`. So
does a job sent with `dispatchAfterResponse()`, which runs after the request has cleared its workspace.

**Commands and seeders** run as a workspace with `MoodKit\Tenancy\Context\RunAsTenant`:

```php
use MoodKit\Tenancy\Context\RunAsTenant;

app(RunAsTenant::class)->run($tenant, function (): void {
    // tenant context and RLS setting are those of $tenant here
});
```

It puts back what was current before, even when the callback throws. With only an id, load the workspace first
(`Tenant::query()->findOrFail($tenantId)`): every package may use `MoodKit\Tenancy\`.

Other packages read the current workspace through `MoodKit\Tenancy\Contracts\CurrentTenant` (`id()`,
`slug()`, `requireId()` and `require()`, a `TenantSummary` of id, slug and name; the last two throw `tenancy.required`
when there is none).

## The platform context

Some code needs more than one workspace. The kit has two ways, and no third:

- **Writing**, from a command, a scheduled task or a job: act as each workspace in turn with `RunAsTenant::run()` or
  `runById()`. `tenants` has no row-level security, so a command can list the workspaces and enter each one
  (`auth:prune-tokens`, `plans:end-trials`).
- **Reading across workspaces**, for the platform's own screens and reports: `Tenancy\Platform\ReadsAcrossWorkspaces`.

```php
$counts = $reads->read('plans.subscriptions_report', fn (ConnectionInterface $db) => $db->table('tenant_subscriptions')
    ->whereNull('ended_at')->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status')->all());
```

Plans' `CountSubscriptions` (behind `php artisan plans:subscriptions`) is the kit's own use of it: a model for a platform
screen or report of your own.

The read runs as the platform's read-only role (`DB_PLATFORM_USERNAME`):

- it bypasses row-level security, and that is all it can do: no superuser, owns nothing, and each read in a `READ ONLY`
  transaction on a connection of its own. What keeps it from writing is its grants, not the session: its sessions start
  read-only (`default_transaction_read_only`), but a session can change that default;
- it may SELECT only the tables a migration grants it with `Support\Database\PlatformRead::grant('tenant_subscriptions')`.
  Grant a table only when a platform screen needs it, and never one that holds a secret or its hash. A table that holds
  both, as `users` (a person's name and email, and their password), is granted by column:
  `PlatformRead::grantColumns('users', 'id', 'name', 'email', 'deleted_at')`, never `password` or `remember_token`;
- only `PlatformReads` connects as the role: an architecture test (`tests/Architecture/PlatformConnectionTest.php`) fails
  on code anywhere else that names its connection, the log's, or their settings, and Postgres logs every statement the role
  runs (`log_statement = 'all'`, set where the role is made);
- every read is logged first in `platform_reads` (who, the purpose `<package>.<what>`, the scope), which nobody can
  change, on a session of its own: a transaction of the caller that is undone does not take the log with it. The
  database dates each entry itself (a trigger sets `created_at` to its clock, whatever the insert says), and the runtime
  role may write the log but not read it: read it as the schema owner.

The role is made by the Postgres superuser (only a superuser can give `BYPASSRLS`):

- locally and in CI, by `scripts/postgres-init/02-platform-reader.sh`;
- in production, by the SQL in the [production checklist](../configuration/production.md#database).

What the kit grants it: Tenancy's `tenants`; Plans' `plans`, `plan_features`, `plan_quotas` and `tenant_subscriptions`;
Notifications' `notification_channels` and `notification_event_types`; Platform's `workspace_closures`, Auth's
`memberships` and, of `users`, `id`, `name`, `email` and `deleted_at` (granted by Platform, for the admin's list of a
workspace's people).

It is optional: some hosted Postgres plans do not let you give `BYPASSRLS`. With `DB_PLATFORM_USERNAME` empty the app
runs, migrations grant nothing, and only the reads across workspaces fail (`PlatformReadsUnavailable`).

`tenancy:verify-rls` fails when the configured role does not exist, is a superuser, lacks `BYPASSRLS`, belongs to any role
or has any role belong to it, has `CREATEROLE`, `CREATEDB` or `REPLICATION`, owns a table, may `CREATE` in the schema, or may write a table or use or
change a sequence, and lists what it reads: the tables it reads whole, then the columns it reads of others, as
`users (id, name, email, deleted_at)`.

## The catalog's writer

The plans, their features, their limits, their history and their Stripe prices are a catalog every workspace shares. The
runtime role only reads it (`Support\Database\ReadOnlyTables`). Two roles write it:

- the schema owner, from the deploy's commands (`plans:sync`, `billing:sync-plans`);
- the catalog's writer, from the super admin's plan editor.

The catalog's writer is its own role (`DB_CATALOG_USERNAME`):

- it does not bypass row-level security, is no superuser and owns nothing;
- it writes only what a migration grants it with `Support\Database\CatalogWrite::grant()`, privilege by privilege
  (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), never `TRUNCATE`. Each package lists the tables it grants in
  `Support\Database\CatalogTables` from its provider's `boot()`, with the same privileges as its migration
  (`add('SELECT, INSERT', 'plan_revisions')`; a table listed again with other privileges throws);
- Postgres logs every statement of it that changes something (`log_statement = 'mod'`, set where the role is made).

Only `Support\Database\CatalogWriter` opens its session, and only Plans' editor (`Plans\Editor\*`, behind
`Plans\Contracts\EditsCatalog`: see [Editing the catalog](../packages/plans.md#editing-the-catalog)) and Billing's
`PlanPriceOffers` use it.
Two architecture sweeps keep it so: `tests/Architecture/CatalogWriterTest.php` fails on code anywhere else that names the
role's connection, its settings, `CatalogWriter` or `Support\Database\RoleSession` (the session of a role of its own, which
only `CatalogWriter` and Tenancy's `PlatformReads` open), and `tests/Architecture/CatalogEditorTest.php` on code outside
Platform's five actions of the editor (and the contracts, their classes and providers) that names `EditsCatalog` or
`OffersPlanPrices`. Their lists are exact files, and they read the code with its literals decoded and joined, so a name
split, escaped, lowercased or passed as a string to `resolve()`, `make()` or `class_alias()` still shows. They are a
guardrail against mistakes, not the boundary: code can always build a name at run time. The boundary is the database:
the runtime role cannot write the catalog, the writer can write nothing else, and `tenancy:verify-rls` checks both. What it writes commits on its own session, whatever transaction the
caller has open.

What the kit grants it:

- `plans`: `SELECT, INSERT, UPDATE` (a plan is never deleted);
- `plan_features`, `plan_quotas`: `SELECT, INSERT, UPDATE, DELETE` (a plan's rows are replaced);
- `plan_revisions`: `SELECT, INSERT` (the history is append-only);
- `billing_prices`: `SELECT, INSERT, UPDATE`.

The grants are whole tables, not columns. The editor writes every column of a plan but `id`, `slug` and `created_at`
(`is_default` and `currency` only as they are), replaces a plan's features and limits row by row, and `billing_prices` is
upserted on nearly all its columns: a grant by column would keep little from the role, while `CatalogTables`,
`CatalogWrite` and `tenancy:verify-rls` would have to compare columns as well as privileges. What keeps a plan's slug,
id and default safe is the editor's own code (`Plans\Editor\`), behind the architecture sweeps, and the trail of every
statement the role runs (`log_statement`).

The role is made by the Postgres superuser: locally and in CI by `scripts/postgres-init/03-catalog-writer.sh`, in
production by the SQL in the [production checklist](../configuration/production.md#database). Made before the first
migration, the migrations grant it its tables. A role made after them is granted its tables by the schema owner:

```sql
GRANT USAGE ON SCHEMA public TO mood_kit_catalog;
GRANT SELECT, INSERT, UPDATE ON plans, billing_prices TO mood_kit_catalog;
GRANT SELECT, INSERT, UPDATE, DELETE ON plan_features, plan_quotas TO mood_kit_catalog;
GRANT SELECT, INSERT ON plan_revisions TO mood_kit_catalog;
```

A migration's `down()` takes its tables back (`CatalogWrite::revoke()`), and the schema's `USAGE` too once the role holds no
table there any more.

It is optional. With `DB_CATALOG_USERNAME` empty, migrations grant nothing and the plan editor is read-only
(`CatalogWriterUnavailable`): it never falls back to another role. A writer that is configured but cannot sign in (a wrong
password, a role dropped since) leaves the editor read-only too (`CatalogWriter::reachable()`, `editable: false`, a write
is 503 `platform.catalog_not_editable`), and the failure is reported. The plans then change only through
`config/plans.php` and `plans:sync`.

`tenancy:verify-rls` checks the role when `DB_CATALOG_USERNAME` is set. It fails when the role:

- does not exist, is a superuser or has `BYPASSRLS`;
- belongs to any role, has any role belong to it (however the membership was granted: a member with `INHERIT FALSE` and
  `SET TRUE` gains none of its rights on its own, but may `SET ROLE` to it), or has `CREATEROLE`, `CREATEDB` or
  `REPLICATION`;
- is a role the app's role (`DB_USERNAME`) may become (`SET ROLE`) or whose rights it holds, through any chain of
  memberships: the app would write the catalog;
- has `INHERIT` (the script makes it `NOINHERIT`, so a role granted to it by mistake gives it nothing);
- owns anything, may `CREATE` in the schema or in the database (where it could make a schema of its own), or may use or
  change a sequence;
- does not log its writes: its `log_statement` (for the role, or the role in this database) is neither `mod` nor `all`;
- may `TRUNCATE` a table, add a trigger to one or reference one (`TRIGGER`, `REFERENCES`, whole or by a column), the
  catalog's tables included;
- may reach a schema other than `public` (`USAGE` or `CREATE`), or holds any privilege on a table, view or sequence in
  one;
- may read or write a table outside `Support\Database\CatalogTables`, whole, by a column or through a view;
- holds more of a table of `CatalogTables` than its migration grants (`DELETE` on `plans`, say), whole or by a column;
- lacks a privilege its migration grants on a table of `CatalogTables` (the plan editor could not save).

It lists the tables the role writes, so a grant nobody meant shows. What an extension owns (PostGIS's `spatial_ref_sys`,
`pg_stat_statements`) is left out: it is no data of the app's, and every role may read it.


## On the frontend

The `tenancy` layer reads the workspace slug from the browser's host (any label in front of the root domain
except `www`), stores it in `useTenantSlugState()` for `useApi` to send as `X-Tenant-Slug`, and loads
`GET /tenant` before any page of a workspace host renders. A workspace that is missing or suspended sends
the visitor to `/unavailable`, answered with status 404 or 403. Paths that end in a static file extension
(`.ico`, `.png`, `.css`, `.js`, `.xml`, `.json` and the like) skip the lookup.

The layer also answers `/robots.txt` and `/sitemap.xml` from Nitro server routes: the root domain lets
crawlers in and lists its home page; a workspace host answers `Disallow: /` and has no sitemap. Do not add
a `public/robots.txt` or `public/sitemap.xml`: Nitro serves a file ahead of any route.

## Related

- [Tenancy package](../packages/tenancy.md): config keys, commands and contracts.
- [Domains](../configuration/domains.md): DNS and the root domain settings.
- [Production checklist](../configuration/production.md).
