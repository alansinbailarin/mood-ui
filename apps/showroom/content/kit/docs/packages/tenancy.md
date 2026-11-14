# Tenancy

`backend/packages/Tenancy`, namespace `MoodKit\Tenancy\`, and the frontend layer `frontend/layers/tenancy`.
Workspaces, how a request finds its workspace, row-level security at runtime and workspace-aware queued jobs.
[Multi-tenancy](../concepts/multi-tenancy.md) explains the model; this page is the reference.

## Configuration

| Key | Env | Default | Meaning |
| --- | --- | ------- | ------- |
| `tenancy.root_domain` | `TENANCY_ROOT_DOMAIN` | `localhost` | workspaces live on `<slug>.<root_domain>` |
| `tenancy.frontend_url` | `APP_FRONTEND_URL` | `http://localhost:3000` | the frontend, read from here by every package: links to a workspace take its scheme and port (the host is `<slug>.<root_domain>`), the signup link takes it whole |
| `tenancy.cache_ttl` | `TENANCY_CACHE_TTL` | `60` | seconds a resolved workspace stays cached by slug |
| `tenancy.enforce_rls` | `TENANCY_ENFORCE_RLS` | `false` | refuse a database role that is a superuser or has `BYPASSRLS`. Set `true` in production. |
| `tenancy.current_tenant_lookups_per_minute` | none | `60` | requests to `GET /api/v1/tenant` per minute from one IP address |
| `tenancy.reserved_slugs` | none | `backend/packages/Tenancy/config/reserved_slugs.php` | slugs no workspace may take |

The defaults live in `backend/packages/Tenancy/config/tenancy.php`; the env overrides in
`backend/config/tenancy.php`. The root domain also decides which hosts the API accepts outside `local`: see
[Domains](../configuration/domains.md#trusted-hosts).

## Routes

| Method and path | Middleware | Answers |
| --------------- | ---------- | ------- |
| `GET /api/v1/tenant` | `tenant`, `throttle:tenancy-current` | `{slug, name}` of the request's workspace, plus what packages add (Settings adds `brand`). Public: the sign-in page needs it. |

A package adds keys to it with a `Contracts\TenantPayloadContributor`, bound and tagged `tenancy.public`:
`contribute(string $tenantId): array` runs as the workspace of the request with nobody signed in, so it must say only
what anyone who knows the workspace's address may see. It cannot replace `slug` or `name`.

`tenancy-current` is a limiter of its own, counted per IP address, so these lookups never use up the
allowance of another route. Over the limit the API answers 429 `http.too_many_requests`.

## Middleware

| Alias or class | Where | What it does |
| -------------- | ----- | ------------ |
| `tenant` (`Http\Middleware\IdentifyTenant`) | on routes | finds the workspace, sets the context and the RLS setting, clears both afterwards. Runs before authentication and route model binding. |
| `Http\Middleware\ResetTenantSession` | first in the `api` group | clears any workspace left over on a reused connection or worker |

The errors it answers: `tenancy.required` (400), `tenancy.mismatch` (400), `tenancy.not_found` (404) and
`tenancy.suspended` (403); see [Errors and the API](../concepts/errors-and-api.md#domain-errors).

A workspace's `status` is a `MoodKit\Tenancy\Enums\TenantStatus`: `active` or `suspended`. There is no screen
or command to suspend one yet; do it on the model, `$tenant->update(['status' => TenantStatus::Suspended])`, which
also forgets the cached lookup.

## Commands

| Command | Does |
| ------- | ---- |
| `php artisan tenancy:verify-rls` | fails when the database role bypasses RLS, when it owns any table, view or sequence (or belongs to a role that does: run the migrations as `DB_MIGRATION_USERNAME`), when it may write, whole or by a column, a table a package lists in `Support\Database\ReadOnlyTables` or `CatalogTables` (only the schema owner, and the catalog's writer, write those), when a table or partitioned table (each partition too) with a `tenant_id` is not isolated by forced RLS with exactly the `TenantRls` policies, or when a foreign table or materialized view has a `tenant_id` (neither can have RLS). Regular views are not checked. When `DB_PLATFORM_USERNAME` is set, it also fails when that role does not exist, is a superuser, lacks `BYPASSRLS`, belongs to any role or has one belong to it, has `CREATEROLE`, `CREATEDB` or `REPLICATION`, owns anything, may `CREATE` in the schema, may write a table or use or change a sequence, and lists the tables it reads. When `DB_CATALOG_USERNAME` is set, it fails when the catalog's writer does not exist, is a superuser, has `BYPASSRLS`, belongs to any role or has one belong to it (however granted), is a role the app's role may become (`SET ROLE`) or whose rights it holds, has `INHERIT`, `CREATEROLE`, `CREATEDB` or `REPLICATION`, owns anything, may `CREATE` in the schema or the database, logs no writes (`log_statement` neither `mod` nor `all`), may use or change a sequence, may `TRUNCATE` a table, add a trigger to one or reference one, may reach a schema other than `public` or anything in one, may read or write a table outside `Support\Database\CatalogTables` (whole, by a column or through a view), or holds more or less of one of them than its migration grants, and lists the tables it writes. Run it after deploying migrations. |

## Contracts and classes for other packages

| Name | Use |
| ---- | --- |
| `Contracts\CurrentTenant` | the current workspace: `id()`, `slug()`, `requireId()` and `require()` (a `TenantSummary`: `id`, `slug`, `name`), both of which throw `tenancy.required` when there is none. Other packages use it, never `Context\TenantContext`. |
| `Contracts\TenantPayloadContributor` | adds keys to the public `GET /tenant`; tag it `tenancy.public` |
| `Contracts\TenantScopedJob` | a queued job that names its own workspace through `tenantId()` |
| `Platform\ReadsAcrossWorkspaces` | `read($purpose, fn (ConnectionInterface $db) => ..., $scope)`: the one way to read data of every workspace, as the platform's read-only role, in a read-only transaction, logged first in `platform_reads` (`Models\PlatformReadEntry`). Throws `Platform\PlatformReadsUnavailable` with no role configured. See [the platform context](../concepts/multi-tenancy.md#the-platform-context). |
| `Context\RunAsTenant` | `run(Tenant $tenant, callable $callback)`, or `runById($tenantId, $callback)`, an instance method: inject it or `app(RunAsTenant::class)->run(...)`, to run code as a workspace from a command or a seeder |
| `Validation\TenantSlug` | validation rule for a slug (shape and reserved list), code `validation.tenant_slug` |
| `Models\Tenant` | the workspace model. Other packages may use it: every package may use `MoodKit\Tenancy\`. |
| `Urls\WorkspaceUrl` | the address of a page of a workspace's frontend (see below) |
| `Contracts\BranchScope` | the branch a request works at, as `CurrentBranch` answers it, in one of four modes: `workspace` (the workspace does not work by branch, or nobody is signed in), `all` (every branch, chosen by someone who sees them all), `branch` (one, `branchId`, in lower case) and `none` (the workspace works by branch and the person works at none they may see). `branchIds()` is what a list narrows by: `null` narrows nothing, `[]` keeps nothing that belongs to a branch, `[id]` keeps that branch's; `narrows()` says whether it does. |
| `Contracts\BranchAccess` | who may see which branch: `inUse($tenantId)` (two active branches or more), `seesAll($tenantId, $userId)`, `visibleTo($tenantId, $userId)` (`null` for every branch, else the ids of theirs), `allows($tenantId, $userId, $branchId)` for one record, and `peopleOf($tenantId, $branchId)` (who works there). |
| `Contracts\CurrentBranch` | `scope()`: the `BranchScope` of the signed-in person in this request, worked out on the server from their own choice and checked again on every request. A client never sends the branch. |

Branches binds the three branch contracts; without it `Branches\WholeWorkspace` answers them: no branches, nothing narrowed,
everyone sees everything. How a module follows the branch: [Scope data by branch](../guides/scope-data-by-branch.md).

### Workspace addresses

`WorkspaceUrl::to($slug, $path, $query = [], $fragment = [])` gives `<scheme>://<slug>.<root domain>[:port]<path>`, with
the scheme and port of `APP_FRONTEND_URL`. The host is always built from the workspace's slug, never taken from a
request header. Anything only the browser should read (a reset token) goes in `$fragment`, which no server, log or
`Referer` sees. Auth's emails and Notifications' buttons link to a workspace with it.

## What else it does

- Stamps the current workspace on every queued job's payload, and has the worker apply it before the job is
  unserialized and put back the previous one afterwards. A job of a suspended or deleted workspace fails
  without running.
- Forgets a workspace's cache entry when its model is saved or deleted, after the transaction commits.
- Checks the database role on the first connection of each process when `tenancy.enforce_rls` is on.

## Seeders

`MoodKit\Tenancy\Database\Seeders\DemoTenantSeeder` creates the `demo` workspace. `DatabaseSeeder` calls it
only when `APP_ENV` is `local` or `testing`.

## Testing

A feature test of something inside a workspace uses the `ActsAsTenant` trait:

```php
uses(MoodKit\Tenancy\Testing\ActsAsTenant::class);

it('lists the invoices of the workspace', function (): void {
    $tenant = Tenant::factory()->create();
    $this->actingAsTenant($tenant);

    // ...
});
```

`actingAsTenant()` sets the tenant context, the RLS setting and the `X-Tenant-Slug` header of the test's
requests, and clears them when the test ends. A request clears the context as it finishes, so call it again
before the test reads tenant rows after a request. The trait lives in `packages/Tenancy/tests/Support` and
is autoloaded for development only.

A test of something that follows the branch, without the Branches package's tables, binds
`MoodKit\Tenancy\Testing\FakeBranches` (next to the trait) as both `CurrentBranch` and `BranchAccess`:

```php
FakeBranches::bind(BranchScope::branch($centro), people: [$centro => [$max->id]], seeAll: [$olga->id]);
```

Its arguments are the scope of every request, who works at which branch (ids in lower case), who sees every branch, and
whether the workspace works by branch (`inUse`, true by default).

## The `tenancy` layer

| Piece | What it does |
| ----- | ------------ |
| plugin `tenant-slug` | reads the slug from the host and writes `useTenantSlugState()`, which `useApi` sends as `X-Tenant-Slug` |
| middleware `tenant.global` | on a workspace host, loads `GET /tenant` before every page; a missing or suspended workspace goes to `/unavailable`. The workspace's `brand` in the answer goes to core's `useWorkspaceBrand()`, so every screen of the host, its sign-in page included, wears its color and logo (a brand the session already loaded stays) |
| page `/unavailable` | explains that the workspace does not exist (404) or is suspended (403) and links to the root domain |
| `useTenantHost()` | `slug`, `isTenantHost` and `rootUrl` of the current host |
| server routes `robots.txt`, `sitemap.xml` | the root domain lets crawlers in and lists its home page; a workspace host is `Disallow: /` with no sitemap |

Its settings are runtime config, overridable at runtime:

| Key | Env | Default |
| --- | --- | ------- |
| `public.tenancy.rootDomain` | `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` | `localhost` |
| `public.tenancy.nonTenantSubdomains` | none | `['www']` |

Every subdomain except those in `nonTenantSubdomains` is taken as a workspace; the backend answers 404 for
a reserved one, and the visitor sees `/unavailable`. An empty root domain is an error, not a guess: the app
throws and names `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN`.
