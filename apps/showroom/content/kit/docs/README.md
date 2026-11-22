# Mood Kit documentation

These pages cover Mood Kit as it ships today: a Laravel 13 API in `backend/` and a Nuxt 4 frontend in
`frontend/`, with workspaces on subdomains, sign-in, roles and permissions, an audit trail, self-service signup (with a
waitlist and invitations), plans and billing through Stripe, a team, branches and clients, workspace settings and brand,
notifications, the global search, the dashboard's home and the platform's admin panel. That is twenty backend packages
(Support, Tenancy, Auth, Rbac, Audit, Signup, Settings, Plans, Billing, Notifications, Onboarding, Team, Branches, Clients,
Geocoding, Search, Data, Dashboard, Platform and PublicPage, plus Projects, the example module) and eighteen frontend layers (`core`, `marketing` for the landing, and one for each package but Support, Audit
and Geocoding). Start with [Getting started](getting-started.md) if you have not run the kit yet.

For the rules the code itself follows (layers, boundaries, what each gate checks), read
[`AGENTS.md`](../AGENTS.md) at the repo root. These pages describe what the kit does and how to use and
configure it; `AGENTS.md` describes how to change it.

## Start here

- [Getting started](getting-started.md): run the kit locally, sign in to the demo workspace and create a
  workspace through signup.
- [Changelog](../CHANGELOG.md): what changed in each release, and what to run when you update. How to merge a release is in
  [Update to a new version](getting-started.md#update-to-a-new-version).

## Concepts

- [Architecture](concepts/architecture.md): the monorepo, the backend packages, the frontend layers and how
  they reach each other.
- [Multi-tenancy](concepts/multi-tenancy.md): workspaces on subdomains, how a request finds its workspace,
  row-level security and `TENANCY_ENFORCE_RLS`.
- [Errors and the API](concepts/errors-and-api.md): `/api/v1`, the response envelope, error codes and how
  the frontend shows them.

## Packages and layers

Each backend package, with the frontend layer that pairs with it.

- [Support](packages/support.md): the envelope, the error contract, request locale, secret scrubbing for
  Sentry.
- [Tenancy](packages/tenancy.md) and the `tenancy` layer: workspaces, the `tenant` middleware, RLS helpers,
  tenant-aware queues.
- [Auth](packages/auth.md) and the `auth` layer: login, password reset, workspace switching, captcha,
  `GET /me`.
- [Rbac](packages/rbac.md) and the `rbac` and `dashboard` layers: roles, permissions, the menu, the roles
  screens.
- [Audit](packages/audit.md): the append-only audit trail.
- [Signup](packages/signup.md) and the `signup` layer: creating a workspace from the root domain.
- [Settings](packages/settings.md) and the `settings` layer: workspace identity and localization, brand, logo,
  history, each member's theme.
- [Plans](packages/plans.md): plans, subscriptions, quota limits and feature flags.
- [Billing](packages/billing.md) and the `billing` layer: paying for a plan through Stripe Billing, the pricing grid, the webhook.
- [Notifications](packages/notifications.md) and the `notifications` layer: event types, templates, deliveries, bounces.
- [Onboarding](packages/onboarding.md) and the `onboarding` layer: the steps of a new workspace, the wizard, the checklist and
  workspace templates.
- [Team](packages/team.md): a workspace's people, their invitations, working hours and skills.
- [Branches](packages/branches.md): a workspace's branches, their place on the map, opening hours and people.
- [Clients](packages/clients.md): a workspace's clients, their tags, duplicates and merging, activity, CSV import and export,
  and their privacy rights.
- [Projects](packages/projects.md) and the `projects` layer: the example module, a small module that follows every standard,
  off until the platform's admin turns it on.
- [Platform](packages/platform.md): the platform's own administration, on a host of its own.
- [Geocoding](packages/geocoding.md): places from an address and an address from a point, for the location picker, through
  the provider the app configures.
- [Search](packages/search.md): the dashboard's global search (`Cmd+K`): the sources each package declares, its route and
  an optional index outside Postgres.
- [Data](packages/data.md): what a module declares as readable and doable: its datasets and its actions, as metadata, checked on every deploy.
- [PublicPage](packages/public-page.md) and the `public-page` layer: the public page at the root of each workspace, built from blocks.
- [Dashboard](packages/dashboard.md): the home's cards: the widgets each package declares, with the permission and the plan
  feature each needs, and the route that works them out.
- [Frontend](frontend.md): the Nuxt layers, `core`, calling the API, hooks, design rules, i18n and visual
  tests.

## Configuration

- [The `.env` file](configuration/environment.md): the one env file, the Postgres roles, ports, and every
  setting the kit adds.
- [Domains](configuration/domains.md): the root domain, wildcard DNS, `*.localhost` and the frontend URL.
- [Storage](configuration/storage.md): uploaded files in an S3 bucket, MinIO locally and Cloudflare R2 in
  production.
- [Stripe](configuration/stripe.md): a sandbox, the products and prices, the webhook, the Customer Portal, testing with the
  Stripe CLI and going live.
- [Mail](configuration/mail.md): Mailpit locally; SMTP or SES in production, or Postmark or Resend once their transport is installed.
- [Realtime (Reverb)](configuration/realtime.md): the inbox's live updates.
- [Captcha](configuration/captcha.md): Cloudflare Turnstile and `SIGNUP_REQUIRE_CAPTCHA`.
- [Maps and geocoding](configuration/maps.md): the address search of the location picker: Nominatim, Google, Mapbox or
  none, their keys, usage policies and cache.
- [Search](configuration/search.md): where the global search runs: Postgres by default, or Meilisearch for the clients.
- [Sentry](configuration/sentry.md): error reporting and what is scrubbed before it leaves.
- [Queues and the scheduler](configuration/queues-and-scheduler.md): what the worker and the scheduler run,
  and how to keep them running.
- [The admin host](configuration/admin-host.md): the platform's administration on `admin.<root domain>`, and what keeps
  it apart from the workspaces.
- [Production checklist](configuration/production.md): what a deployment needs that the local defaults
  leave out.
- [Docker images and the production stack](configuration/docker.md): the three images, `APP_ROLE`, the Caddyfile and
  `deploy/compose.yml`.

## Guides

- [Deploy to a VPS](guides/deploy-to-a-vps.md): from an empty server to a running install: firewall, server setup,
  DNS, certificate, R2, mail, build and verify, with `deploy/server-setup.sh` and `deploy/make-env`.
- [Build a module](guides/build-a-module.md): `kit:make-module` and what it already registers
- [Add a permission and a menu entry](guides/add-a-permission-and-menu-entry.md)
- [Add a role template](guides/add-a-role-template.md)
- [Add a settings group](guides/add-a-settings-group.md)
- [Add a quota or a feature flag](guides/add-a-quota-or-feature.md)
- [Add a platform flag](guides/add-a-platform-flag.md)
- [Force a flag for a workspace](guides/force-a-flag-for-a-workspace.md)
- [Add a platform notice](guides/add-a-platform-notice.md)
- [Remove the Projects module](guides/remove-the-projects-module.md)
- [Brand the platform](guides/brand-the-platform.md)
- [Edit the landing](guides/edit-the-landing.md)
- [Control who signs up](guides/control-who-signs-up.md)
- [Set up the first super admin](guides/set-up-the-first-super-admin.md)
- [Impersonate a member](guides/impersonate-a-member.md)
- [Run a public demo](guides/run-a-public-demo.md)
- [Add a notification event type](guides/add-a-notification-event-type.md)
- [Send a notification](guides/send-a-notification.md)
- [Add a notification attachment](guides/add-a-notification-attachment.md)
- [Show a notification in the app](guides/show-a-notification-in-the-app.md)
- [Add a digest contributor](guides/add-a-digest-contributor.md)
- [Add an onboarding step](guides/add-an-onboarding-step.md)
- [Add a workspace template](guides/add-a-workspace-template.md)
- [Invite your team](guides/invite-your-team.md)
- [Attach data to members](guides/attach-data-to-members.md)
- [Attach data to branches](guides/attach-data-to-branches.md)
- [Attach data to clients](guides/attach-data-to-clients.md)
- [Add a portal section](guides/add-a-portal-section.md)
- [Scope data by branch](guides/scope-data-by-branch.md)
- [Add a search source](guides/add-a-search-source.md)
- [Add a dataset](guides/add-a-dataset.md)
- [Add an action](guides/add-an-action.md)
- [Add a dashboard widget](guides/add-a-dashboard-widget.md)
- [Add a block to the public page](guides/add-a-public-page-block.md)
- [Declare open and public routes](guides/declare-open-and-public-routes.md)
- [Register secret fields and headers](guides/register-secret-fields.md)
- [Add a locale](guides/add-a-locale.md)
- [Testing and quality gates](guides/testing.md)

## What it does not ship

See [Architecture](concepts/architecture.md#what-it-does-not-ship).
