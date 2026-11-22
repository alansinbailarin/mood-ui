# Changelog

What changed in each release of Mood Kit, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the versions are tags of the distribution repository (`vX.Y.Z`).

A section titled **Upgrading** lists what you must run or set after you merge that version. Read it before you migrate. How to
merge a release is in [Update to a new version](docs/getting-started.md#update-to-a-new-version).

## [Unreleased]

### Added

- A guide to deploy the kit to a rented server, from an empty Ubuntu 24.04 VPS to a running install, and two scripts it uses:
  `deploy/server-setup.sh` (firewall, user, swap, Docker, and ssh hardening that refuses when the user has no authorized key)
  and `deploy/make-env` (makes `deploy/.env`, generates every internal secret without printing it, merges your account keys,
  and never regenerates a secret on an existing file). The guide also covers the provider firewall, Cloudflare DNS and token,
  R2, Resend with its DMARC record, and the checks to run. See [Deploy to a VPS](docs/guides/deploy-to-a-vps.md).
- A platform flag can be forced on or off for one workspace, over its global state and its rollout. The admin's workspace page has a
  new **Features** tab (Funciones in Spanish): one switch per flag that saves at once, a **Forced** badge, **Reset** to go back
  to the global state, and an optional reason. The Flags page shows how many workspaces each flag is forced for. New table
  `platform_flag_overrides`, routes `GET`, `PUT` and `DELETE /platform/workspaces/{id}/flags`, and audit entries
  `platform.flag.forced` and `platform.flag.override_cleared`. Run `php artisan migrate`. See
  [Force a flag for a workspace](docs/guides/force-a-flag-for-a-workspace.md).
- Every route of the app (but the framework's own) now has a class, and a test fails on one that has none: a member's with a `permission:` guard, the
  platform's, or declared by its package. A package declares the routes of the `workspace` group that need no permission
  (`OpenRoute`, with its reason) and the ones outside every signed-in group (`PublicRoute`, with its lock) in a
  `RouteDeclarations` class tagged `routes.declarations`. The kernel's own are declared the same way. See
  [Declare open and public routes](docs/guides/declare-open-and-public-routes.md).
- `MoodKit\Tenancy\Testing\AssertsIsolation`, a test helper that proves a record never crosses a workspace or a person:
  `assertTenantIsolated()` seeds a record in two workspaces and checks that the other one's is in no list, answers 404 on its id
  and is in no search, and `assertPersonIsolated()` does the same between two people of one workspace. Projects, the sessions of
  Auth and the inbox of Notifications use it. See [Testing](docs/guides/testing.md).
- `php artisan kit:activate`: records your license once, at install. It activates the key from your Polar purchase under your
  project name and saves `KIT_LICENSE_KEY` and `KIT_LICENSE_ACTIVATION_ID` in the root `.env`. Nothing in the kit reads them
  while it runs, and nothing stops working without them. See [Activate your license](docs/getting-started.md#activate-your-license).
- Production images: `docker/backend` (nginx, php-fpm, queue worker, scheduler and Reverb under supervisord, chosen by
  `APP_ROLE`), `docker/frontend` (the Nuxt server) and `docker/caddy` (Caddy with the Cloudflare DNS and rate limit modules).
- `deploy/compose.yml`, `deploy/Caddyfile`, `deploy/.env.example` and the Postgres role script: Caddy, the API, the
  frontend, Postgres, Redis and optional Meilisearch in one stack. See `docs/configuration/docker.md`.
- A CI job, "Production images", that builds the images, lints the Dockerfiles and validates the Compose file.
- `Projects`, the example module: a `Projects` backend package and a `projects` frontend layer that follow every standard of the
  kit, to read, copy and delete. A workspace's projects with a status, a due date and an optional branch; a list with search,
  status filter and pages; a form; permissions `projects.view` and `projects.manage`; a sidebar entry, a search source, a card
  on the home and a **New project** action in the top bar. It is off until the platform flag `projects.enabled` is turned on.
  See [Projects](docs/packages/projects.md), [Build a module](docs/guides/build-a-module.md) and
  [Remove the Projects module](docs/guides/remove-the-projects-module.md).
- `php artisan kit:make-module <Name> --es="singular,plural,gender"`: makes a module of your own, with its tests, as a copy of
  `Projects` under another name: a backend package and a frontend layer, an end-to-end spec, a page for the docs, the package in
  `backend/composer.json`, and everything a module registers (permissions, role templates, menu entry, search source, home
  card, **+** action, a platform flag that starts off, words in English and Spanish). It checks everything before it writes,
  never overwrites a file, and edits two files: `backend/composer.json` (the package) and `.jscpd.json` (it adds the module to the
  `ignore` list while the module is a copy of the template; remove that line once it is your own). A stub API for a module is a file in
  `frontend/tests/e2e/support/modules/`, found by its name. A CI job, "Generated module", makes one and runs its tests and the
  checks of the backend and the frontend. See [Build a module](docs/guides/build-a-module.md).
- Route middleware `impersonation-allowed` (does nothing): a write route of the `workspace` group says with it, or with
  `not-impersonating`, whether a super admin acting as the person may use it. A module's routes say so themselves, and
  `ImpersonationRoutesTest` accepts them, so a module needs no edit of the kernel's tests.
- Page meta `platformFlag` (`definePageMeta({ platformFlag: "module.enabled" })`): while the platform flag is off for the
  workspace, whoever opens the page goes to the dashboard. See [Frontend](docs/frontend.md#pages).
- The admin's overview draws the last 30 days as three lines: new workspaces, subscriptions in force at the end of each day, and
  people who joined the waitlist. `GET /platform/overview` answers them as `series`.
- The platform's look in the admin's Settings: an Appearance card with the default color mode (light, dark or system) and the
  corner style. The color mode applies to the admin panel; the corners apply to the admin panel and to the root domain's pages (the
  landing, the signup and the sign in), which keep their light design. Neither applies to a workspace, and a visitor's own color
  mode still wins. `GET /platform/settings` and `GET /platform/public` answer `colorMode` and
  `radius` (null in the public read until a style is chosen, so the public screens keep their own shapes), and `PATCH /platform/settings`
  takes them.
- Public demo mode (`DEMO_MODE=true`, off unless it is that word): the kit runs as a demo anyone can try, with shared accounts
  (`owner@demo.test`, the workspace's owner and the platform's super admin, and `member@demo.test`) and a password the sign-in screens
  print (`DEMO_PASSWORD`). Mail is forced to the log, a live Stripe key stops the boot, and what would do harm answers 403 `demo.locked`:
  changing a shared account's password, email, sessions, place in the team or role, inviting outside `@example.com`, suspending or closing
  a workspace, changing or cancelling a plan or opening the billing portal, offering plan prices or saving a plan with another price or
  sale state, changing the signup access mode, switching impersonation off, impersonating anyone but the shared accounts. Uploads and
  Stripe Checkout are capped per person and hour (`demo-capped:<bucket>`, `support.demo.caps`). The app refuses to boot a demo with a
  database cache. `php artisan demo:reset` (scheduled daily at `DEMO_RESET_AT`, 04:00 in
  `DEMO_TIMEZONE`, only in a demo) wipes the database as the schema owner and makes the demo again with every date counted from today:
  other workspaces with subscriptions, 60 to 75 clients over 90 days, a waitlist and bell over 30 days, the Projects module on. It refuses a
  database it did not wipe itself unless `--adopt` says so, and tries again once when a reset fails. A thin banner with the hour of the reset sits on the dashboard and the admin,
  and the sign-in screens print the account with a button that fills it. A module gives a demo its rows with a `DemoDataProvider`
  tagged `demo.data`. See [Run a public demo](docs/guides/run-a-public-demo.md).
- The admin's Invitations tab has a search by email and a status filter. `GET /platform/invitations` takes `search` and `status`.
- `ReportsSubscriptions::liveByDay()` in Plans, the subscriptions in force at the end of each of the last days.
- `php artisan i18n:check` checks every language file against English, in the backend (each package's `lang/` and
  `backend/lang`) and the frontend (the app's and each layer's `locales/*.json`): a missing file, a missing or extra key, an
  empty message, a placeholder that differs (`:name`, `{{ name }}`, `{name}`, `@:key`), fewer plural forms than English's
  several, a vue-i18n message that cannot compile, a language file nobody declared and a `nuxt.config.ts` that does not load one. It prints
  `<file>: <key>: <problem>` for each and exits with an error, and it is part of `composer check`, so CI fails on a gap. See
  [Add a locale](docs/guides/add-a-locale.md#check-the-translations).
- `php artisan kit:add-locale <code> --name=<Name>` adds a language to the whole kit: it declares the code in
  `support.locales`, copies every package's `lang/en` and Laravel's English validation messages, adds the language to the
  plans' names and descriptions, and in the frontend declares it in each `nuxt.config.ts`, copies each `en.json` and names it
  in the profile menu. It refuses outside `APP_ENV=local`, never overwrites a file, writes nothing unless every check
  passes and takes back what it wrote if a write fails. It warns when the language is written right to left. The copies are in English until you translate them.
- Cmd+K in the admin: the super admin's top bar has the palette, with the same shortcut and phone dialog as the dashboard's. It finds
  workspaces (name, slug), plans, waitlist entries and invitations (email) and super admins (name, email), plus the admin's pages,
  and opens the page of each (a waitlist entry opens the waitlist filtered to its email). `POST /platform/search` answers it, with
  its own sources (`PlatformSearchSourceProvider`, tagged `search.platform_sources`) and limiter (`search.platform_per_minute`).
  See [Search](docs/packages/search.md#the-admins-palette).
- The admin's notification bell: each super admin has an inbox of what happened on the platform (a workspace was made, someone
  joined the waitlist, a payment failed, a workspace was closed), unread or read per admin and kept 60 days
  (`platform:prune-notices`, daily). `GET /platform/notices`, `POST /platform/notices/{id}/read` and `/read-all`. A module adds its
  own kind of notice with a `PlatformNoticeProvider` tagged `platform.notices` and the event `PlatformNoticeRequested`. No email.
  See [Add a platform notice](docs/guides/add-a-platform-notice.md).
- `Data`, a kernel package: the declarations of the datasets and the actions a module offers. A package declares a dataset (the description
  of a read view of its records: its columns, the permission, the platform flag and the plan feature behind it, and a scope that narrows
  rows by branch) with a `DatasetProvider` tagged `data.datasets`, and an action (a create or an edit, with its fields, whose handler
  calls the module's own Action) with an `ActionProvider` tagged `data.actions`. The registries refuse what cannot work on first use, and
  an action that deletes can never be declared. A `Field` gives both the Laravel rules and the JSON Schema of an input. These are
  declarations only: the kit reads no row and runs no action as a person through them. They are what the paid Mood Kit AI add-on reads.
  The kernel declares four datasets: `projects.projects`, `clients.clients` (the email, phone, birthday, address and notes are sensitive,
  behind `clients.export`; never the trash, the erased or the merged), `branches.branches` and `team.members` (the email is sensitive,
  behind `team.manage`). Projects declares `projects.create` and `projects.update`, through the Actions its API calls.
  `php artisan data:verify` runs in the deploy script, after `platform:verify`: it fails on a dataset or an action that cannot work,
  and on a table a dataset reads that lacks forced row-level security. See [Data](docs/packages/data.md),
  [Add a dataset](docs/guides/add-a-dataset.md) and [Add an action](docs/guides/add-an-action.md).
- `php artisan kit:make-module` now writes the module's dataset, its create and update actions and the declaration tests of both, and an
  isolation test that proves its records never cross a workspace, so `data:verify` and the kit's checks cover a module of your own
  from its first commit. See [Build a module](docs/guides/build-a-module.md).

### Changed

- The admin's waitlist and invitations are searched with `POST /platform/waitlist/search` and `POST /platform/invitations/search`,
  with the text in the body, so an email never sits in an address, a browser history or an access log. `GET /platform/waitlist`
  and `GET /platform/invitations` refuse `search` (422) and take `entry` (one row, by id). The bell's waitlist notice and the admin's
  palette open a row with `?entry=<id>`. If you call these endpoints with `?search=`, move the text to the body.
- The waitlist notice no longer copies a person's name and email into `platform_notices`: it keeps the entry's id and reads them when
  the notice is read, so a removed entry shows a neutral line. A new `resolver` on `PlatformNoticeType` (`ResolvesNoticeData`) lets a
  module's notice do the same. Notices raised before this change keep the old data until `platform:prune-notices` removes them.
- The platform read role gets `log_parameter_max_length = 0` (`deploy/postgres-init/01-roles.sh`), so Postgres' log keeps its
  statements and drops the values bound to them, such as what the admin typed in the search.
- The Meilisearch profile of `deploy/compose.yml` stops at once, naming `MEILISEARCH_KEY`, when the key is empty.
- `kit:activate` reads the kit's Polar organization id from `Support\License\KitLicense`, the one place it lives, and an empty
  `KIT_POLAR_ORGANIZATION_ID` no longer overrides it.
- `php artisan platform:setup` now only warns when an email in `PLATFORM_BOOTSTRAP_ADMINS` has no account yet, and exits
  successfully, so the first deploy of a new install goes on. An empty list or a value that is not an email still fails.
- A menu entry's `featureFlag` now means a platform flag: the sidebar and the search palette leave out an entry whose flag is
  off for the workspace. No kernel entry names one, so nothing changes for them.
- The plan editor shows its texts in a tab for each language instead of a column for each, and a tab with unsaved changes shows how
  many.
- Inviting someone by email from the admin says so with a toast, as inviting from the waitlist does.
- `app.vue` no longer hands `ModoProvider` a `theme`, which saved every mode as the visitor's own choice; core's `ModoThemeSync` tells it the
  mode instead. The page's `<head>` script is one script that reads the platform's default from `<html data-default-color-mode>`.
- `ColorModePicker` and `RadiusPicker` moved from the settings layer to core, and their messages from `settings.appearance.*` and
  `settings.tooltips.*` to `core.appearance.*` and `core.tooltips.*`. If you edited those messages, move your edit.
- The translation tests that listed `['en', 'es']` (the registry labels, the settings groups, the search sources, the
  dashboard widgets, the plans' fixtures and the API's lists of languages) read `support.locales`, so a language added with
  `kit:add-locale` is covered without editing them.
- [Add a locale](docs/guides/add-a-locale.md) is rewritten around the command.
- `RunSearch` shares its checks of a finder's answer with the admin's search (`CheckedHits`, `SourceRound`); `UnsafeHitRoute` now names
  the area it expected (`/dashboard/` or `/platform/`). Nothing changes in what the dashboard's search answers.

### Fixed

- The Auth documentation no longer promises a cursor read (`PageCursor::read()`) for the members list. It pages by number, as its
  code does.
- `kit:make-block` writes the block's words for every language of `support.locales`, not only English and Spanish, so a block
  made after `kit:add-locale` passes the contract test.
- The sign-up verification email picked its "SIGN UP" badge with `$locale === 'es'`, so a third language always got the
  English one. The badge is now a message, `signup::mail.verification.badge`, in every language.

### Upgrading

- If your app already has anything named `projects` (a `projects` table, `projects.*` permissions, `/api/v1/projects` routes or a
  `/dashboard/projects` page), follow [Remove the Projects module](docs/guides/remove-the-projects-module.md) BEFORE
  `composer update` and `php artisan migrate`. Otherwise the new migration and routes clash with yours.
- After you merge this version, run `composer update` in `backend/` (new packages, `Projects` and `Data`; Platform now requires Search;
  Composer also reads the new `composer.json` of the packages) and `pnpm install` at the root (a new layer). Then run
  `php artisan migrate` (the `projects` table, the settings table that holds the color mode and the corner style, the admin's notices
  table, the trigram indexes for the admin's search and the table of the flag exceptions) and `php artisan rbac:sync` (the two
  permissions of Projects). Nobody sees Projects until the admin turns `projects.enabled` on, on the admin host's Flags page. To keep
  the kit without the example, follow [Remove the Projects module](docs/guides/remove-the-projects-module.md).
- If you set `log_statement` on a platform read role of your own, add `ALTER ROLE <role> SET log_parameter_max_length = 0;` as the
  database superuser (see [Production](docs/configuration/production.md)), and move any caller of `GET /platform/waitlist?search=` or
  `GET /platform/invitations?search=` to the new `POST .../search`. Remove `KIT_POLAR_ORGANIZATION_ID=` from your `.env` if it is
  empty.
- `php artisan i18n:check` is now part of `composer check`. Run it once and fill any gaps in your own translations (a missing
  key, an empty message, a placeholder that differs from English), or your CI fails on the next push.
- A menu entry's `featureFlag` now means a platform flag (`<module>.enabled` on the admin's Flags page). If an entry of yours used
  `featureFlag` for something else, drop it, or the entry disappears for everyone until that flag is on.
- If you run your own deploy, add `php artisan data:verify` after `platform:verify`, as the "Every deploy" list of the
  [production checklist](docs/configuration/production.md) has it. A package of yours that declares datasets or actions needs
  `"mood-kit/data": "@dev"` in its `composer.json`.
- `data:verify` runs on deploy and fails it on a dataset or an action that cannot work. It checks the kernel's own datasets too
  (branches, clients, projects, team): if you changed a kernel table, for example by dropping a column a dataset reads, adjust that
  dataset, or the deploy stops.
- `RoutesAreClassifiedTest` fails on more than a route with no class. A module of your own that has a route in the `workspace` group
  with no `permission:` guard, or a route outside every signed-in group, must declare it in a `RouteDeclarations` class tagged
  `routes.declarations`. A route with no name fails, and so does a name that two routes share (a declaration is by name). A route
  whose permission is checked somewhere else (in a form request's `authorize()` or with a Gate, with no `RequirePermission`
  middleware) counts as a route with no guard: declare it as an `OpenRoute` or give it the `permission:` middleware. See
  [Declare open and public routes](docs/guides/declare-open-and-public-routes.md).

## [0.11.0] - 2026-11-20

The public page: every workspace gets a page at the root of its address, built from blocks, edited by its owner and controlled by
the platform. The page's package is described in [PublicPage](docs/packages/public-page.md).

### Added

- A public page at the root of each workspace (`<slug>.<root domain>/`), in the new `PublicPage` backend package and the
  `public-page` frontend layer. A workspace with nothing published still shows the way in: logo, name, tagline, "Client portal"
  and "Sign in".
- Six blocks: text, image with text, frequent questions, gallery, contact (with links in the style of link-in-bio pages and
  WhatsApp numbers) and branches (a map of the points, today's hours in each branch's time zone, phone numbers). Gallery,
  branches, contact and frequent questions take an optional title.
- The page is built for visitors: texts by language, Markdown drawn without HTML, only safe links, the title, description,
  canonical address, social image and JSON-LD of the page, and `GET /public-page` cached for a minute.
- The owner's editor at `/dashboard/public-page`: add, hide, duplicate, delete and reorder blocks (by pointer or keyboard), a
  form for each block with a tab for each language, a live preview in a frame (desktop and phone widths) that scrolls to the block
  being edited, thumbnails in "Add a block", and a draft that saves itself.
- Publishing and discarding: the draft is saved against a version, so two people editing at once get a conflict instead of
  overwriting each other. Publishing says which languages are missing, and publish, discard and show or hide are audited.
- Images for blocks, uploaded through the API or, with `PUBLIC_PAGE_MEDIA_PRESIGN=true`, straight to the bucket. A new command,
  `public-page:prune-media`, deletes every night the images no page names, a day after their upload.
- The platform admin's catalog at `/platform/public-page`: turn each block on or off for all workspaces, tie a block (or the
  page) to a plan feature, and choose whether the "Made with" credit shows. The kit's six blocks are on by default; a block from
  another package starts off. Saves are checked against versions and written to the platform's audit trail.
- A per-workspace switch for the super admin: turn a workspace's page off with a reason, on that workspace's page in the admin
  panel. The owner's editor says the page is off and why. Both the workspace's trail and the platform's trail record it.
- `php artisan kit:make-block <Name> --package=<Package>` writes a block of your own: the class, its words in English and Spanish,
  its Pest test, the tag in the package's provider, and the component with its Vitest test. The step by step is in
  [Add a block to the public page](docs/guides/add-a-public-page-block.md).
- New permissions `public_page.view` and `public_page.manage`, and a "Public page" entry in the Administration menu. Owner and
  Manager have them by template.
- Extension points in core: the `kit:workspace:home` hook (what a workspace's root draws), `kit:platform:workspace-sections`
  (a package adds a section to a workspace's page in the admin panel), and a contract for a package's entries in the platform's
  trail. A page can now frame its own origin, which the editor's preview uses.
- The demo workspace publishes a page with every block and pictures, and its three branches have a point near Tijuana and a
  week of opening hours.
- `GET /tenant` says whether the client portal is open.
- A menu icon, `globe-alt`.

### Changed

- The root of a workspace draws its published page when there is one. Before, it showed only the way in.
- Crawlers can read a workspace's root and its `/_nuxt/` assets.
- The workspace page's header folds into one row, with a menu on a phone.
- A section outside the settings page that is submitted unchanged no longer sends a request.

### Fixed

- A module's section of a workspace's page in the admin panel that throws no longer takes the other sections with it.
- Several editor details found in testing: a late save never overwrites a newer draft, a stale save never marks a reloaded draft as
  failed, adding or duplicating a block never reuses an id, a drag ends on Escape, and buttons that repeat have their own labels.
- The public page's language cookie, when malformed, counts as none.

### Upgrading

Run these after you merge `v0.11.0`:

```bash
pnpm install
cd backend
composer install
php artisan migrate
php artisan rbac:sync
```

- `composer install` picks up the new `mood-kit/public-page` package. `php artisan migrate` runs four migrations: the pages, their
  images, the admin's catalog tables and the platform's per-workspace switch.
- `php artisan rbac:sync` gives the new permissions to the workspaces that already exist. Without it, no one in an existing
  workspace sees the "Public page" menu entry.
- New env variable in `.env.example`: `PUBLIC_PAGE_MEDIA_PRESIGN` (default `false`). Set it to `true` only after the bucket has CORS,
  as for the logo; see [Storage](docs/configuration/storage.md).
- New scheduled command: `public-page:prune-media`, daily at 04:10 UTC. Nothing to do if your scheduler already runs
  `php artisan schedule:run`; see [Queues and the scheduler](docs/configuration/queues-and-scheduler.md).
- The package and its layer are optional. Remove `backend/packages/PublicPage` and `frontend/layers/public-page` and the root
  of a workspace shows core's way in again.

## [0.10.1] - 2026-11-20

### Fixed

- A form in a section outside the settings page no longer sends an empty `PATCH` when you press Enter with no changes.

## [0.10.0] - 2026-11-20

A redesign of the public screens and a landing for the root domain.

### Added

- A landing page on the root domain, in the new `marketing` layer: hero, logos, features, prices, questions and a closing call,
  with a site header and footer. Its sections, order and links live in one config file. The prices come from the plan catalog.
  How to change it is in [Edit the landing](docs/guides/edit-the-landing.md).
- `GET /plans`: a public, read-only list of the plans for sale, from the same catalog the platform admin edits. It is limited per
  address (`plans.public_reads_per_minute`, 600) and cached for 60 seconds. See [Plans](docs/packages/plans.md).
- Split sign-in and signup screens with a drawing of the product in the primary color, a logo slot, and the language switcher in
  the corner. The client portal's sign-in is split too, with a sample of what a client finds.
- Core components for the public screens: `MessageShell` (a screen that only says something, such as verify email or a dead
  link), `PublicPageShell` (a simple page outside the dashboard, used by the portal's account and the preference center), `TextLink`
  for links inside a sentence, and shared sample cards for the showcases.
- Terms and privacy as two documents with an index and a switch between them.

### Changed

- The waitlist is the landing's closing section, and a deactivated member lands on the sign-in page with a notice instead of a
  page of its own.
- The client portal, when closed, is shown as a message. A workspace that does not exist gets a 404 in its own brand, and the
  public pages have an `h1`.
- The kit's date fields in clients take a placeholder in the member's language.
- The public chrome has no shadows. `AuthShell` no longer has a centered card mode.

### Fixed

- The brand plugin leaves a missing file a plain 404 and reads the failed address from the error correctly.

### Upgrading

- Run `pnpm install`: the `marketing` layer is a new workspace package.
- No migrations and no new env variables. `plans.public_reads_per_minute` is a new config key with a default; change it in
  `backend/config/plans.php` only if your frontend server asks `GET /plans` from one address more than 600 times a minute.
- If you edited `AuthShell`, the login or signup pages or the old landing, merge with care: those files changed.

## [0.9.0] - 2026-11-19

The first release with the real kit. The earlier tags (`v0.0.1`, `v0.0.2`) held only the scaffolding. This is an overview of what
0.9.0 contains, not a list of its changes.

### Added

- Multi-tenancy: workspaces on subdomains, a tenant middleware, Postgres row-level security and tenant-aware queues. See
  [Tenancy](docs/packages/tenancy.md) and [Multi-tenancy](docs/concepts/multi-tenancy.md).
- Sign-in: login, password reset, switching between workspaces, captcha and `GET /me`. See [Auth](docs/packages/auth.md).
- Roles and permissions: permissions declared in code, roles per workspace, role templates and the menu each person sees. See
  [Rbac](docs/packages/rbac.md) and [Add a permission and a menu entry](docs/guides/add-a-permission-and-menu-entry.md).
- An append-only audit trail. See [Audit](docs/packages/audit.md).
- Signup: create a workspace from the root domain, with a waitlist and invitations. See [Signup](docs/packages/signup.md) and
  [Control who signs up](docs/guides/control-who-signs-up.md).
- Settings: a workspace's identity, localization, brand and logo, its history and each member's theme. See
  [Settings](docs/packages/settings.md).
- Plans and quotas: plans, subscriptions, limits and feature flags. See [Plans](docs/packages/plans.md) and
  [Add a quota or a feature flag](docs/guides/add-a-quota-or-feature.md).
- Billing through Stripe: the pricing grid, checkout, the webhook and the Customer Portal. See
  [Billing](docs/packages/billing.md) and [Stripe](docs/configuration/stripe.md).
- Notifications: event types, templates, deliveries, bounces and an in-app inbox with live updates. See
  [Notifications](docs/packages/notifications.md) and [Send a notification](docs/guides/send-a-notification.md).
- Onboarding: the steps of a new workspace, a wizard, a checklist and workspace templates. See
  [Onboarding](docs/packages/onboarding.md).
- Team: a workspace's people, their invitations, working hours and skills. See [Team](docs/packages/team.md).
- Branches: places on the map, opening hours and the people of each. See [Branches](docs/packages/branches.md) and
  [Scope data by branch](docs/guides/scope-data-by-branch.md).
- Clients and the client portal: tags, duplicates and merging, activity, CSV import and export, and privacy rights. See
  [Clients](docs/packages/clients.md) and [Add a portal section](docs/guides/add-a-portal-section.md).
- Geocoding: addresses and places for the location picker, through the provider you configure. See
  [Geocoding](docs/packages/geocoding.md) and [Maps and geocoding](docs/configuration/maps.md).
- Global search (`Cmd+K`), with sources each package declares. See [Search](docs/packages/search.md).
- The dashboard's home: cards that each package declares. See [Dashboard](docs/packages/dashboard.md) and
  [Add a dashboard widget](docs/guides/add-a-dashboard-widget.md).
- The platform admin on its own host: super admins, workspaces across tenants, the waitlist, flags and the plan catalog. See
  [Platform](docs/packages/platform.md) and [The admin host](docs/configuration/admin-host.md).
- Support: the response envelope, the error contract, request locale and secret scrubbing for Sentry. See
  [Support](docs/packages/support.md) and [Errors and the API](docs/concepts/errors-and-api.md).
- Guides for extending each part, starting with [Build a module: the checklist](docs/guides/build-a-module.md).
