# Architecture

Mood Kit is one repository with two applications: a Laravel API in `backend/` and a Nuxt app in
`frontend/`. Each is split into units with a narrow surface: backend **packages** and frontend **layers**.
This page explains what they are, how they reach each other, and where your own code goes.

## The repository

```text
backend/                 Laravel 13 API
  app/                   thin shell: one middleware (your providers go in bootstrap/providers.php)
  config/                framework config, and the env overrides of each package
  packages/<Name>/       kernel packages (Audit, Auth, Billing, Branches, Clients, Dashboard, Geocoding, Notifications,
                         Onboarding, Plans, Platform, Rbac, Search, Settings, Signup, Support, Team, Tenancy)
  tests/                 app tests and the architecture tests
frontend/                Nuxt 4 app on mood-ui
  app/                   shell: app.vue, the home page, main.css with the color tokens
  layers/<name>/         Nuxt layers (auth, billing, branches, clients, core, dashboard, notifications, onboarding, plans,
                         platform, rbac, search, settings, signup, team, tenancy)
  tests/e2e/             Playwright visual tests
scripts/postgres-init/   creates the app role and the test database on the first Postgres boot
docker-compose.yml       Postgres, Redis, Mailpit and MinIO, for local use only
.env.example             every setting, with working local defaults
docs/                    these pages
```

## Backend packages

Each package lives in `backend/packages/<Name>` under the namespace `MoodKit\<Name>\`, with its own
`composer.json`, `src/` and `tests/`. They are installed as Composer path packages (`"mood-kit/<name>": "@dev"`
in `backend/composer.json`), and Laravel discovers their service providers. A provider registers everything
its package brings: routes, migrations, translations, console commands, scheduled tasks and container
bindings. `backend/routes/api.php` and `backend/routes/console.php` are empty on purpose.

| Package | What it gives |
| ------- | ------------- |
| [Support](../packages/support.md) | the response envelope, the error contract, request locale, `TenantRls`, the Sentry secret registries |
| [Tenancy](../packages/tenancy.md) | workspaces, the `tenant` middleware, row-level security at runtime, tenant-aware queued jobs |
| [Auth](../packages/auth.md) | users, memberships, login tokens, password reset, workspace switching, captcha, `GET /me` |
| [Rbac](../packages/rbac.md) | roles and permissions per workspace, the `permission` middleware, the menu |
| [Audit](../packages/audit.md) | the append-only audit trail |
| [Signup](../packages/signup.md) | creating a workspace and its owner from the root domain |
| [Settings](../packages/settings.md) | workspace settings by group and key, with versions and history; the workspace brand and each member's theme |
| [Plans](../packages/plans.md) | plans, subscriptions, quota limits and feature flags |
| [Notifications](../packages/notifications.md) | event types, templates and audiences, the inbox, the delivery log, bounces and the daily summary |
| [Dashboard](../packages/dashboard.md) | the home's cards: a registry of the widgets each package declares |
| [Team](../packages/team.md) | a workspace's people: invitations, the members list, working hours and skills |
| [Platform](../packages/platform.md) | the platform's own administration: super admins, the admin host, the waitlist, flags and the plans' catalog; no package depends on it |
| [Onboarding](../packages/onboarding.md) | the steps of a new workspace, its checklist and the workspace template it starts from |
| [Billing](../packages/billing.md) | paying for a workspace's plan through Stripe Billing: checkout, plan changes, the portal, the webhook |
| [Geocoding](../packages/geocoding.md) | places from an address and an address from a point, for the location picker; it depends on Support alone |
| [Branches](../packages/branches.md) | a workspace's branches, their place on the map, opening hours and people; it uses Auth, Rbac, Plans, Settings, Onboarding, Audit and Team through their contracts, and only Clients depends on it (a client's home branch) |
| [Clients](../packages/clients.md) | a workspace's clients: their data, tags, duplicates and merging, activity, CSV import and export, and their privacy rights; it uses Auth, Rbac, Audit, Plans, Notifications and Branches through their contracts, and modules hang their data from it through its own |
| [Search](../packages/search.md) | the global search: a registry of the sources each package declares (`search.sources`); it uses Auth, Rbac and Plans through their contracts and knows no package that registers a source |

Every package's settings live in its own `config/`, with defaults only. The env overrides are in
`backend/config/<file>.php`, the one place that calls `env()`, so `php artisan config:cache` works.

### Inside a package

A class's layer comes from the namespace segment after the package root. Deptrac (`composer deps`)
enforces what each may use:

| Layer     | Classes                                              | May depend on                |
| --------- | ---------------------------------------------------- | ---------------------------- |
| Http      | `<Package>\Http\...`                                 | Domain, Dto, Models, Shared  |
| Domain    | every other class: Actions, Services, Jobs           | Dto, Models, Shared, Database |
| Models    | `<Package>\Models\...`                               | Shared, Database, Factories  |
| Factories | `<Package>\Database\Factories\`                     | Models, Shared, Database     |
| Seeders   | `<Package>\Database\Seeders\`                       | Domain, Dto, Models, Shared, Database, Factories |
| Shared    | `<Package>\Contracts\`, `Events\`, `Enums\`          | Shared only                  |
| Dto       | `<Package>\Dto\`: an action's result, the package's own | Shared, Models            |
| Providers | classes ending in `ServiceProvider`                  | Http, Domain, Dto, Models, Shared |
| App       | `App\...` (`backend/app`), its providers included    | Http, Domain, Dto, Models, Providers, Shared, Database |
| Database  | the `DB` facade, query builders, connections         | nothing                      |

A model names its factory in `newFactory()`, so Models may use Factories; no other layer may.

In practice a controller reads the request and calls an Action, and the Action does the work.

### Between packages

A package reaches another only through that package's `Contracts\` and `Events\` namespaces. Its models,
DTOs and enums are private. Every package may use `MoodKit\Support\` and `MoodKit\Tenancy\` directly. A Pest
test (`backend/tests/Architecture/PackageBoundariesTest.php`) fails on any other reference.

The one exception: Auth's `User` model uses spatie's `HasRoles` trait, because spatie/laravel-permission
needs it on the model.

## How packages talk

There are four ways, and a module of your own uses the same four.

**Contracts.** An interface in `Contracts\`, bound in the provider of the package that implements it. Other
packages type-hint the interface and pass ids, never models:

```php
use MoodKit\Rbac\Contracts\ChecksPermissions;

public function __construct(private ChecksPermissions $permissions) {}

$this->permissions->allows($tenantId, $userId, 'invoices.send');
```

A contract or an action that takes a workspace and a person takes the workspace first: `(tenant, user, ...)`, whether
they are ids or models (`allows($tenantId, $userId, ...)`, `contribute($tenantId, $userId)`,
`IssueToken::handle($tenant, $user)`).

**Events.** A class in `Events\` that carries ids. Signup's `WorkspaceProvisioned`, Auth's `MembershipRemoved`,
`MembershipDeactivated` and `MembershipActivated`, and Settings' `SettingsChanged` and `WorkspaceLogoChanged` are the
ones meant for listeners.

An event is sent once the transaction that caused it commits (it implements `ShouldDispatchAfterCommit`), so a listener
never acts on data that rolls back or that another connection cannot see yet. The few sent inside their transaction on
purpose (`WorkspaceProvisioned`, whose listeners write the new workspace's first rows, and the membership and role
events, whose listener forgets cached access with `DB::afterCommit` itself) are listed with their reason in
`backend/tools/EventsInsideTheirTransaction.php`. A PHPStan rule (`composer analyse`) checks every call that sends an
event, by its type, however it is written (`event()`, the `Event` facade, a dispatcher, `X::dispatch()`), and fails on an
event sent inside its transaction that is not listed, on one sent from outside an `Events\` namespace, and on one whose
class it cannot tell; an architecture test checks every class of an `Events\` namespace. Queued jobs are sent after the commit too: every queue connection has `after_commit` on.

**Tagged providers (registries).** A package implements an interface, binds the class and tags it. The
package that owns the tag collects every tagged class:

| Tag | Interface | Owner | What it adds |
| --- | --------- | ----- | ------------ |
| `rbac.permissions` | `MoodKit\Rbac\Contracts\PermissionProvider` | Rbac | permissions to the catalog |
| `rbac.roles` | `MoodKit\Rbac\Contracts\RoleTemplateProvider` | Rbac | system roles, or permissions for existing ones |
| `rbac.menu_sections` | `MoodKit\Rbac\Contracts\MenuSectionProvider` | Rbac | sections of the dashboard menu |
| `rbac.menu` | `MoodKit\Rbac\Contracts\MenuItemProvider` | Rbac | entries of the dashboard menu |
| `auth.me` | `MoodKit\Auth\Contracts\MePayloadContributor` | Auth | keys in `GET /me` |
| `auth.membership_guards` | `MoodKit\Auth\Contracts\MembershipLeaveGuard` | Auth | a veto on a member being deactivated or removed |
| `tenancy.public` | `MoodKit\Tenancy\Contracts\TenantPayloadContributor` | Tenancy | keys in the public `GET /tenant` |
| `settings.groups` | `MoodKit\Settings\Contracts\SettingsGroupProvider` | Settings | groups of workspace settings |
| `settings.change_impacts` | `MoodKit\Settings\Contracts\ChangeImpactProvider` | Settings | the records a change of a setting would affect |

**Support registries.** `MoodKit\Support\Reporting\SecretHeaders` and `SecretFields` are singletons that
packages fill from their provider's `boot()`, so Sentry never receives those values. See
[Register secret fields and headers](../guides/register-secret-fields.md).

## Frontend layers

Each area of the UI is a Nuxt layer in `frontend/layers/<name>`, registered by Nuxt because it has a
`nuxt.config.ts`. Each layer is also a pnpm workspace package.

| Layer | What it holds |
| ----- | ------------- |
| `core` | `useApi`, the request composables, the envelope helpers, the session, permissions, brand and theme state, the hooks, `KitButton` and the page anatomy, the settings-section pieces, `KIT_ROUTES` and `useRootDomain()`, the public-screen chrome (`AuthShell`, the `auth` layout, `FormSubmitButton`, `CaptchaWidget`), and the server's security headers |
| `tenancy` | the workspace of the current host, the `/unavailable` page, `robots.txt` and `sitemap.xml` |
| `auth` | the session store (it reads `user` and `tenant` of `GET /me` and hands the rest to `kit:session:me`) the sign-in, password and handoff screens, and My profile (`/dashboard/me/profile`) with its link in the profile menu |
| `dashboard` | the shell of the signed-in screens: sidebar from `GET /menu`, top bar, profile menu; the browser-only rule of `/dashboard/**` |
| `rbac` | the roles screens under `/dashboard/roles`, and the permissions and roles of `GET /me` |
| `signup` | the signup screens under `/signup` |
| `settings` | the workspace settings under `/dashboard/settings` (identity, with the brand color and logo, and localization), the appearance on My profile (the palette, color mode and radius, through `kit:profile:sections`), and the brand, localization and theme of `GET /me` |
| `plans` | the plan of the session (`GET /me`), the subscription page, and the gates that ask for an upgrade |
| `billing` | paying for the plan on the subscription page: the pricing grid, checkout, the billing portal |
| `notifications` | the Notifications section of the settings, the templates, the delivery log, the bell and the inbox, the preferences of My profile |
| `onboarding` | the setup wizard at `/onboarding`, the dashboard's checklist and the workspace templates |
| `team` | the Team page, a member's page, the public `/join` page and the skills |
| `branches` | the branches, a branch's page with its map, hours and people, and the branch switcher |
| `clients` | the clients, their tags, imports and exports, and the client portal |
| `search` | the search palette in the top bar (`Cmd+K`), and a dialog on a phone |
| `platform` | the admin's panel under `/platform`, on the admin host only, and the public `/waitlist` |

A layer imports only from itself and `core` (ESLint `boundaries`), and uses no other layer's
auto-imports (ESLint `mood-kit/no-cross-layer-auto-import`). What two layers both need lives in `core` as
state, and what one layer needs another to do is asked through a hook that `core` declares and the owning
layer answers. The auth layer, for example, loads the session and hands `GET /me` to the layers that own its other keys
(`kit:session:me`); the dashboard asks it to sign out through `kit:auth:sign-out`. See [Frontend](../frontend.md).

## How the two halves meet

The frontend calls the API under `NUXT_PUBLIC_API_BASE_URL` (`http://localhost:8000/api/v1` locally). Every
request carries `Accept-Language`, and, when known, `Authorization: Bearer <token>` and `X-Tenant-Slug`.
The API answers in one envelope, `{data, meta, errors}`. See [Errors and the API](errors-and-api.md).

The frontend serves both the root domain (`localhost:3000`, where signup and "find your workspace" live) and
every workspace (`<slug>.localhost:3000`). See [Multi-tenancy](multi-tenancy.md).

## Where your code goes

A feature of your own is a backend package under `backend/packages/` plus a frontend layer under
`frontend/layers/`, built the same way as the kit's: Composer, Deptrac, Larastan, Rector, Pest, Nuxt, ESLint and Vitest
already cover both. Kit code never references yours. `AGENTS.md` ("Packages" and "Layers") lists the steps for each, and
[Build a module: the checklist](../guides/build-a-module.md) lists what a new module registers so that the search, the "+" menu,
the home and the sidebar know it.

## What it does not ship

`backend/composer.json` requires only what a kit feature uses: Laravel Reverb for the inbox's live updates
([Realtime](../configuration/realtime.md)). Clients brings Laravel Scout for the global search, with Meilisearch's PHP client so the
switch to it is only configuration ([Search](../configuration/search.md)). Billing brings `stripe/stripe-php`. The S3 Flysystem
adapter backs the `assets` disk, where uploaded files go (see [Storage](../configuration/storage.md)), and brings the
AWS SDK that the SES mailer uses.

The kit runs its queue with `php artisan queue:work`; it does not ship Laravel Horizon. Its audit trail is
its own `Audit` package, not spatie/laravel-activitylog.
