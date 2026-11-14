# Platform

The platform's own administration, for whoever runs the SaaS rather than a workspace: its super admins, the admin's own
host, the workspaces seen across tenants, and the platform's settings. No package of the kernel depends on it: each piece
it needs from another package is a contract of that package, so it can be removed without touching the rest.

## The admin host

Setting it up (DNS, the certificate, the variables) is in [The admin host](../configuration/admin-host.md); the first super
admin in [Set up the first super admin](../guides/set-up-the-first-super-admin.md).

The admin lives on a host of its own, `admin.<root domain>` unless `PLATFORM_HOST` says otherwise. It must be exactly one
label under `TENANCY_ROOT_DOMAIN`, and that label must be a reserved slug (`packages/Tenancy/config/reserved_slugs.php`,
where `admin` already is): then no workspace can take it, and the API's CORS and trusted hosts, which let in the root
domain and one label under it, already cover it. Any other value stops the app at boot (`InvalidPlatformConfig`, naming
the variable), and `platform:verify` says so in the deploy.

Its addresses (the links the backend sends to the admin's frontend) take the scheme and port of `APP_FRONTEND_URL`:
`http://admin.localhost:3000/platform/...` locally, `https://admin.example.com/platform/...` in production.

The admin's API lives under `/api/v1/platform`. None of its routes takes the `tenant` middleware: the admin belongs to no
workspace, and every route refuses one. A request with an `X-Tenant-Slug` header, or sent to a workspace's host, gets 400
`platform.tenant_context_forbidden` before anything reads it.

### Sessions and the guard

The admin host has its own sessions, apart from Sanctum's tokens (which belong to a workspace): `platform_sessions`, with no
`tenant_id` and no row-level security. A token is `<session id>|<40 random characters>`, shown once at the sign-in; only the
SHA-256 of the secret is kept. A session ends:

- `PLATFORM_SESSION_MINUTES` (480) after the sign-in, whatever happens;
- after `PLATFORM_IDLE_MINUTES` (60) unused;
- when it is signed out;
- the moment its person is no longer a super admin: every request checks `platform_admins`, and `platform:revoke-admin` also
  deletes the person's sessions.

`php artisan platform:prune-sessions` (daily, see [Queues and the scheduler](../configuration/queues-and-scheduler.md))
deletes the sessions that ended by their life or by sitting unused, which no request can use any more.

The same goes for their impersonations: Auth asks Platform on every request of one, and on the exchange of its code,
whether its admin is still a super admin, and `platform:revoke-admin` also ends, in every workspace the platform's trail
says they entered, the impersonations they have open and the codes they have not used yet.

The guard `platform` reads the bearer token from that table only. A workspace's token presented to the admin's API is in no
session (401 `auth.unauthenticated`), and an admin's token presented to a workspace is in no `personal_access_tokens`
(401): a token never works on the other side.

Every route of a signed-in admin takes the `platform` middleware group: Support's `KeepOutOfCachesAndReferrers` (every
answer, a refusal included, carries `Cache-Control: no-store, private` and `Referrer-Policy: no-referrer`: what it says is
about every workspace), `RefuseTenantContext`, `AdminHostOnly`, then `auth:platform`, which makes the admin's guard the
request's default, so the trails name the admin. `AdminHostOnly` (on the sign-in too) answers only a request that reaches
the API by its own host (`APP_URL`'s) or by the admin host (`PLATFORM_HOST`, for an API served behind the frontend's
hosts): on the root domain or another label of it, the admin's API is the same 404 `http.not_found` as a path that does not
exist. `GET /platform/public` and `POST /platform/waitlist` answer on every host, since the root domain's screens use them.

### Signing in

`POST /platform/auth/login` takes `email`, `password` and `captchaToken`, the account's own email and password: a super
admin signs in with the same account they use in a workspace. The captcha comes first (422 `auth.captcha_failed`); then
Auth's own check (`ChecksCredentials`) answers the one `auth.invalid_credentials` (401) to a wrong password, an unknown
email and a person who is not a super admin alike, after the same work, so nobody learns which emails have an account or
which are admins. Its answer holds the token and is never cached (`Cache-Control: no-store, private`). Each sign-in is
written to the platform's trail.

Its limiter, `platform-login`, counts 5 a minute per email and address and 20 a minute per address. Per email alone, only a
failed check of the password counts, after the captcha: 20 in an hour lock that email out until the hour is over, while
a captcha that failed counts for nothing, so nobody can lock an admin out without solving one each time. Each limit answers
429 `http.too_many_requests`. The `platform` limiter (60 changes a minute per admin) and `platform-impersonation` (20 an
hour) are there for the routes that change things.

| Route | Who | What |
| ----- | --- | ---- |
| `POST /platform/auth/login` | anyone, limited | `{email, password, captchaToken}` → `{token, expiresAt, user: {id, name, email}}` |
| `GET /platform/auth/me` | an admin | `{user: {id, name, email}, expiresAt}` |
| `POST /platform/auth/logout` | an admin | ends this session; `data: null` |
| `GET /platform/menu` | an admin | the admin's menu (see [The admin's menu](#the-admins-menu)) |

## Super admins

A super admin runs the platform, not a workspace: the role is no role of a workspace, and gives nothing inside one. The one
source of who is one is the table `platform_admins` (the person's `user_id`, who granted it, when). The app's role may only
read it (it is in `ReadOnlyTables`, and its migration takes the runtime role's writes away): not even an injection in the app
can make anyone a super admin. Only three commands write it, connecting as the schema owner, like `migrate`:

| Command | What it does |
| ------- | ------------ |
| `php artisan platform:setup [--create]` | makes the first super admins, from `PLATFORM_BOOTSTRAP_ADMINS`, only while there is none: safe in every deploy, since once there is one it does nothing, and two at once (two servers
deploying) take turns under a lock, the second finding the admins the first made. Each listed email needs an account (sign up a workspace with it); with `--create` it asks the name and password of one that has none and makes the account, in no workspace. It fails when the list is empty or nobody on it has an account. |
| `php artisan platform:grant-admin {email} [--create]` | makes someone a super admin by the email of their account (`--create`, as above) |
| `php artisan platform:revoke-admin {email}` | takes the role away, ends their sessions and their impersonations (open ones and unused codes); never from the last super admin |

After the first, `PLATFORM_BOOTSTRAP_ADMINS` grants nothing: `platform_admins` alone says who is one. A person who is
deleted is no super admin. There is no HTTP endpoint to make one.

A super admin's password guards the platform, so no workspace's flow replaces it: Platform binds Auth's
`Contracts\IdentifiesPlatformAdmins` to `platform_admins`, and Auth's `ResetsPasswords` refuses them (an invitation of
Team that asks for a new password answers 422 `team.password_reset_elsewhere`). They change it with their own reset.

## The admin's menu

The admin host's menu comes from Rbac's registries, like the dashboard's: sections of the `platform` area
(`MenuSection::PLATFORM`) and their items, served whole to any signed-in admin by `GET /platform/menu`
(`{sections: [{slug, label, items: [{route, label, icon, order, featureFlag}]}]}`, in the language of the request). Platform
declares two sections:

| Section | Order | Items |
| ------- | ----- | ----- |
| `platform_overview` (Platform) | 0 | Overview (`/platform`), Workspaces (`/platform/workspaces`), Plans and subscriptions (`/platform/plans`) |
| `platform_admin` (Administration) | 100 | Waitlist (`/platform/waitlist`), Flags (`/platform/flags`), Settings (`/platform/settings`) |

A module adds to it with a section of its own or in one of these (see
[Add a permission and a menu entry](../guides/add-a-permission-and-menu-entry.md#an-entry-of-the-admin-host)). An item
of the platform's area starts with `/platform` and needs no permission.

## Workspaces

The admin sees every workspace through Tenancy's `ReadsAcrossWorkspaces`: each answer below is a read as the platform's
read-only role, logged in `platform_reads` with its purpose and what it was about, and it can read only what the packages
granted that role (see [The platform context](../concepts/multi-tenancy.md#the-platform-context)). Of a person it reads the
id, name and email, never a password. A deleted workspace is in none of them.

| Route | Purpose logged | What |
| ----- | -------------- | ---- |
| `GET /platform/workspaces` | `platform.workspaces_list` (the filters) | the workspaces, newest first, 25 a page with a cursor (`meta.pagination`) |
| `GET /platform/workspaces/{id}` | `platform.workspace_detail` (`{workspace}`) | one workspace, with `closure` |
| `GET /platform/workspaces/{id}/members` | `platform.workspace_members` (`{workspace}`) | its people, by name, at most 200 |
| `GET /platform/workspaces/{id}/activity` | (its own trail) | the platform's last 50 actions on it, newest first |

The list takes `search` (a text in the name or the slug, any case; `%` and `_` are plain text), `status` (`active`,
`suspended` or `closing`), `plan` (a plan's slug) and `cursor`. A workspace looks like this:

```json
{
  "id": "6f1c2e9a-…", "slug": "acme", "name": "Acme", "status": "active", "createdAt": "2026-11-06T12:00:00Z",
  "members": 4, "plan": {"slug": "pro", "name": "Pro"},
  "subscription": {"status": "active", "trialEndsAt": null, "currentPeriodEnd": "2026-12-06T12:00:00Z", "managedBy": "stripe"},
  "closesAt": null
}
```

`status` is `closing` for a workspace an admin closed (it is also suspended), with `closesAt` the end of its grace;
`members` counts the active memberships; `plan` and `subscription` are its live subscription's, or `null`. The detail adds
`closure`: `{reason, closedAt, closesAt}` or `null`. A member is `{id, name, email, status, joinedAt, lastLoginAt,
isSuperAdmin}`; an entry of the activity is `{id, action, actor, after, createdAt}`, `actor` the admin's name. An id that is
no workspace, or was deleted, is 404 `platform.workspace_not_found`, whatever it looks like.

## Overview, plans and subscriptions

| Route | Purpose logged | What |
| ----- | -------------- | ---- |
| `GET /platform/overview` | `platform.overview`, `plans.subscriptions_report` | the counts of the admin's first screen |
| `GET /platform/subscriptions` | `plans.subscriptions_report` | every plan, with its live subscriptions by status |

The overview is `{workspaces: {active, suspended, closing, newLast30Days}, subscriptions: {trialing, active, past_due,
cancelled}, waitlist: {waiting}}`: workspaces that are not deleted, by standing (a closing one counts only as `closing`), those made in the last
30 days, and the live subscriptions of all of them by status. The plans are `{plans: [{slug, name, tier, available,
isDefault, counts: {trialing, active, past_due, cancelled}}]}`, by tier: every plan on offer, and a plan no longer sold
while a workspace still has it. The counts come from Plans (`ReportsSubscriptions`), the names in the request's language. It feeds the workspaces' plan filter and Give a plan; the plans page reads `GET /platform/plans` (see
[Editing the plans](#editing-the-plans)).

## Suspending a workspace

| Route | What |
| ----- | ---- |
| `POST /platform/workspaces/{id}/suspend` | `{reason}` (10 to 500 characters, Support's `MultilineText`) → `{id, status: "suspended"}` |
| `POST /platform/workspaces/{id}/resume` | → `{id, status: "active"}` |

Both take the `platform` limiter. A suspended workspace answers 403 `tenancy.suspended` to every request from the moment
the change is committed (saving the workspace forgets the resolver's cache), its members' own sessions included, and its
queued jobs fail without running. The sessions are not deleted: once it is resumed they work again. A code of an
impersonation that was not used yet is ended (Auth's `EndsImpersonations::endPending()`), so resuming brings none back;
closing a workspace does the same.

Each change runs as the workspace (`RunAsTenant`), in one transaction under a lock of its own (`platform:workspace:<id>`,
the id in lowercase whatever case the path used), so two admins at once take turns and the second sees what the first did. It is written to both trails, the workspace's
(`platform.workspace.suspended`, `platform.workspace.resumed`, as the admin, with the reason in `after`) and the
platform's, and announces `Events\WorkspaceSuspended` (`tenantId`, `byUserId`, `reason`) or `Events\WorkspaceResumed`
after the commit. Suspending one that is suspended, or resuming one that is active, changes nothing and writes nothing.
Resuming a workspace that is closing is 409 `platform.workspace_unavailable`: it is reopened instead.

## Closing a workspace

| Route | What |
| ----- | ---- |
| `POST /platform/workspaces/{id}/close` | `{reason}` (10 to 500 characters, Support's `MultilineText`) → `{id, status: "closing"}` |
| `POST /platform/workspaces/{id}/reopen` | → `{id, status: "active"}` |

Both take the `platform` limiter, and run like a suspension: as the workspace, in one transaction under its lock, written
to both trails (`platform.workspace.closed` with the reason and `closesAt`, `platform.workspace.reopened`).

Closing does, in this order:

1. **Ends the billing first.** Billing's `EndsWorkspaceBilling` expires the checkout the workspace left open and cancels in
   Stripe, at once and without proration, every subscription of the workspace that Stripe still bills, read before any is
   cancelled; the workspace falls to the default plan (with no "back to the default plan" notice: a suspended workspace
   gets none). If Stripe fails before it cancelled anything, the answer is 502 `billing.stripe_unavailable` and nothing
   changed. If it fails after a cancellation went through, the close is kept (the workspace is closing, and is never left
   open without the subscription Stripe cancelled) and the answer is still 502 `billing.stripe_unavailable`: close it again
   to cancel what is left. A refund is yours to make in Stripe's dashboard.
2. **Suspends it**: it answers `tenancy.suspended` to everyone, as above.
3. **Gives it its grace**: a row of `workspace_closures` (the workspace's own, under row-level security) with who closed
   it, the reason and `closes_at`, `PLATFORM_DELETION_GRACE_DAYS` (30) from now.

Then `Events\WorkspaceClosed` (`tenantId`, `byUserId`, `reason`, `closesAt`) goes out after the commit. Closing one that is
already closing ends what billing it has left and changes nothing else.

A closing workspace is billed no more: Platform binds Billing's `AcceptsBilling` to say so, so a checkout that was waiting
when it closed is refused, and a subscription a close missed (paid in a checkout that was open, say) is cancelled in Stripe
by its first webhook.

Within the grace, reopening deletes the closure and makes the workspace active again, on the default plan: its subscription
does not come back, and its owner chooses a plan again (`Events\WorkspaceReopened`). Reopening one that is not closing is
409 `platform.workspace_not_closing`; one whose grace is over (`closes_at` has come) is 409 `platform.grace_over`, since its
deletion is due; resuming one that is closing is 409 `platform.workspace_unavailable`.

When the grace is over, `php artisan platform:delete-closed-workspaces` (daily at 04:10 UTC, see
[Queues and the scheduler](../configuration/queues-and-scheduler.md)) deletes it: soft, with `deleted_at`, as the workspace
and written to both trails (`platform.workspace.deleted`), then `Events\WorkspaceDeleted`. The resolver and the panel no
longer find it, its slug stays taken, and its rows stay where they are: nothing is erased. Erasing a workspace's data for
good, and exporting it first, is not part of the kit. It finds what is due with a platform read
(`platform.closures_due`), at most 500 a run, and reads each closure again under the workspace's lock before it deletes:
one reopened in between is left alone. One that fails is reported and the others go on.

## Entering a workspace as a member

| Route | What |
| ----- | ---- |
| `POST /platform/workspaces/{id}/impersonations` | `{userId, reason}` (`reason` 10 to 500 characters, Support's `MultilineText`) → `{url}` |

A super admin enters a workspace as one of its people, to see what they see. Platform decides who may; Auth makes the
session (see [Auth](auth.md#impersonation), and [Impersonate a member](../guides/impersonate-a-member.md) for the whole
policy). It is refused, in this order:

- a workspace that does not exist or was deleted: 404 `platform.workspace_not_found`;
- one that is suspended or closing: 409 `platform.workspace_unavailable` (resume it first; that stays in the trail);
- a person who is not an active member of it: 404 `platform.member_not_found`;
- another super admin: 403 `platform.impersonation_of_admin`.

The answer's `url` is `<slug>.<root domain>/handoff?code=...`, a one-time code that lives a minute and names the
impersonation on the server: the admin's browser opens it and becomes the person, for 30 minutes
(`auth-kit.impersonation_minutes`), never renewed, with a banner and Exit. Exit takes the admin back to
`admin.<root domain>/platform/workspaces/<id>`. While it lasts, what would hand the account over or touch money is refused
(403 `auth.impersonation_forbidden`), and so is every `DELETE`.

The reason is the platform's note, never shown to the workspace: it is only in the platform's trail
(`platform.impersonation.started`, on the person, about the workspace). Its end goes there too
(`platform.impersonation.ended`, with the admin as the actor, from Auth's `ImpersonationEnded`), however it ended. The workspace's trail has
`auth.impersonation.started`, written by Auth, with the admin and no reason; the two are written together or not at all. The person sees who entered and when on My profile. The
route takes the `platform-impersonation` limiter (20 an hour per admin), and its answer is never cached.

## Giving a workspace a plan

| Route | What |
| ----- | ---- |
| `POST /platform/workspaces/{id}/plan-grant` | `{plan, endsAt, reason}` → 201 `{id, grant: {plan, startedAt, endsAt}}` |
| `DELETE /platform/workspaces/{id}/plan-grant` | `{reason}` → `{id, plan}`, the default plan's slug |

An admin gives a workspace a plan of the catalog with no charge (a courtesy, a longer trial, a special customer), through
Plans' `GrantsPlans` (see [Plans the platform gives](plans.md#plans-the-platform-gives)): no call to Stripe. `plan` is a
slug of the catalog other than the default plan (any other one, on sale or not); `endsAt` is optional, an ISO 8601 moment
still to come (`after:now`), and with none the plan lasts until taken back; `reason` is 10 to 500 characters (Support's
`MultilineText`). Giving one to a workspace on a grant replaces it. Both routes take the `platform` limiter (and the
`platform` group: the admin's guard, no workspace), and run as the workspace under its lock (`WorkspaceLock`).

It is refused:

- a plan that is not in the catalog, or the default plan: 422 `platform.plan_not_grantable` (on `plan`);
- a workspace that is closing: 409 `platform.workspace_unavailable`;
- an end that passed while the grant waited for the workspace's lock (the request checks `after:now` first; the grant
  checks it again as it writes): 422 `platform.grant_ends_in_past` (on `endsAt`), with nothing written;
- a workspace whose live subscription Stripe bills: 409 `platform.workspace_billed_by_stripe`, with nothing written. The kit
  never puts a grant over a Stripe subscription: cancel it in Stripe's dashboard first, if that is what you mean. A Stripe
  subscription that starts later (a checkout the workspace pays) takes the grant's place, and the two take turns under the
  workspace's subscription lock;
- taking back a workspace on no grant: 409 `platform.no_plan_grant`.

The workspace has the plan the moment the grant commits: its cached plan context is forgotten, so its features and quotas
follow at once. When `endsAt` comes, `plans:end-grants` (every fifteen minutes) moves it back to the default plan; taking
it back does the same now. Either way what it has over the default plan's limits stays, and nothing more can be added
where it is over.

Both are written to both trails (`platform.plan.granted` with `{plan, endsAt}` after, and before when it replaced one;
`platform.plan.grant_revoked`, before `{plan, endsAt}`, after `{plan}`), as the admin; the reason goes only to the
platform's, as an impersonation's: the workspace never sees it. A grant that reached its end is written to the platform's
trail by the command, with no actor (`platform.plan.grant_ended`). The owner is told after the commit, by Notifications:
`plans.plan_granted` (the plan and until when) and `plans.plan_grant_ended` (with what is over the default plan's limits);
a grant that replaces another sends the first one's `plans.plan_grant_ended` (onto the new plan) before its own
`plans.plan_granted`, and a suspended workspace hears of neither.

In the list and the detail of the workspaces, `subscription.managedBy` is `platform` for a grant, with
`subscription.grantEndsAt` (null: no end).

## Editing the plans

The super admin edits the catalog of plans from the admin, through Plans' `EditsCatalog` (see
[Editing the catalog](plans.md#editing-the-catalog)) and Billing's `OffersPlanPrices` (see [Billing](billing.md)). A plan
is named by its slug in the address (`[a-z][a-z0-9_]{0,63}`, the catalog's own rule).

| Route | Purpose logged | What |
| ----- | -------------- | ---- |
| `GET /platform/plans` | `plans.subscriptions_report` | `{plans: [plan], features, resources, locales, editable, stripe: {configured}}` |
| `GET /platform/plans/{plan}` | `plans.subscriptions_report` | `{plan, features, resources, locales, editable, stripe: {configured}}` |
| `PUT /platform/plans/{plan}` | `plans.subscriptions_report` (for the plan it answers, and for a confirmation it asks) | saves the plan: `{plan, stripe, placed}` |
| `POST /platform/plans` | `plans.subscriptions_report` (for the plan it answers) | makes a plan as a copy of another: 201 `{plan}` |
| `PUT /platform/plans/order` | `plans.subscriptions_report` (for the list it answers) | orders every plan: answers as `GET /platform/plans` |
| `POST /platform/plans/{plan}/prices` | | offers the plan's prices on Stripe again: `{prices: {inLine, pending}}` |
| `GET /platform/plans/{plan}/history` | | the plan's latest revisions |

The list has every plan, retired ones too, by tier. A plan is `{slug, name, tier, names, descriptions, monthlyCents,
yearlyCents, currency, trialDays, available, isDefault, features, quotas, version, workspaces, counts, prices: {inLine,
pending}}`:

- `name` is in the request's language; `names` and `descriptions` are by language, as the admin edits them;
- the prices are in the smallest unit of `currency` (`null`: not sold for that period, `0`: free), `trialDays` `null` for
  no trial, `quotas` a limit for every registered resource (`null`: no limit);
- `version` is what a save names (see the next sections). The terms and the version are read together from the catalog's
  tables (Plans' `EditsCatalog::plans()`), never from the cached catalog, so a plan read a moment after another save shows
  that save's terms with its version, never the old terms with the new version;
- `counts` are its live subscriptions by status (`trialing`, `active`, `past_due`, `cancelled`) and `workspaces` their sum:
  a read across workspaces, logged as the platform read `plans.subscriptions_report`;
- `prices` says where its prices stand on Stripe, from `billing_prices` alone (no call to Stripe): `pending` lists the
  periods (`month`, `year`) the catalog and Stripe disagree on, which nobody can buy meanwhile, and `inLine` is true with none.

What the editor offers to choose from comes with it: `features` and `resources` are the ones the installed packages register
(`{slug, label, description}`, a resource with its `period` too), in their order and the request's language; `locales` are
the languages a plan's texts are written in (`support.locales`). `editable` says whether a
[catalog writer](../concepts/multi-tenancy.md#the-catalogs-writer) is set up here (`DB_CATALOG_USERNAME`): without one the
plans can be read in the admin, not changed. `stripe.configured` says whether Stripe is set up (a secret key and the
webhook's secret): without it nothing is offered on Stripe.

A slug no plan has is 404 `platform.plan_not_found`.

### Saving a plan

`PUT /platform/plans/{plan}` saves everything the admin edits of a plan at once, against the `version` it read. It is a
write of the admin: the `platform` limiter, like the others.

```json
{
  "version": 1,
  "names": { "en": "Pro", "es": "Pro" },
  "descriptions": { "en": "For growing teams.", "es": "Para equipos que crecen." },
  "monthlyCents": 2900,
  "yearlyCents": 29000,
  "trialDays": 14,
  "available": true,
  "features": ["reports"],
  "quotas": { "branches": null, "email_sends_per_month": null, "members": 10, "projects": 5 },
  "confirm": false,
  "confirmationToken": null
}
```

- `names` and `descriptions` come in every language of `support.locales`, one line each (Support's `PlainName`), a name
  at most 60 characters and a description at most 200;
- the prices are whole numbers in the smallest unit of the plan's currency, from 0 (`null`: not sold for that period);
  the currency is not edited here: it is the plan's from the config, or the copied plan's;
- `trialDays` is 1 to 365, or `null` for no trial; `available` says whether the plan is on sale;
- `features` lists registered features only, and `quotas` has a limit for every registered resource and no other (0 to
  1,000,000, `null` for no limit);
- numbers and booleans are JSON numbers and booleans: `"2900"` is refused.

It answers `{plan, stripe, placed}`: the plan as `GET /platform/plans/{plan}` has it (at its next version when something
changed), what the save did on Stripe, and `placed`, the tier the plan went to when it went on sale at a tier a plan on sale
had (then it goes last, and the trail's entry says so with `placedAt`), else `null`. What the save did on Stripe:

| `stripe` | When |
| -------- | ---- |
| `untouched` | no price, currency or sale changed (or nothing changed at all): nothing to offer |
| `offered` | Billing offered the plan's prices on Stripe, and `plan.prices` says where they stand now |
| `failed` | Stripe failed: the plan stays saved, and `plan.prices.pending` lists the periods nobody can buy until it is offered again |
| `not_configured` | Stripe is not set up here: the plan is saved, and its prices are offered once Stripe is set up (`billing:sync-plans`) |

**The database first, then Stripe.** The plan is saved as the catalog's writer and committed, with its revision; only then,
when a price or the sale changed and Stripe is set up, Billing offers the plan's prices (`OffersPlanPrices`): a new
Price for a new amount, the old one no longer offered, and whoever pays on it keeps it. A failure of Stripe never undoes
the save (a Price may have been made on Stripe already, and the catalog is not held locked across calls to Stripe): the
plan stays saved, Billing's `PriceBook` sells no period whose price on Stripe does not match the catalog, and the admin
offers it again from the editor. Nothing is ever charged at a price the catalog does not have.

It is refused:

- **a change that takes something from the workspaces on the plan, unconfirmed:** a price that changes, a limit that goes
  down (no limit to a number included) or a feature taken away is 409 `platform.plan_change_unconfirmed`, with nothing
  written. `meta.impacts` lists what it takes, `[{kind, key, from, to}]` (`kind` `price`, `limit` or `feature`; see
  [Editing the catalog](plans.md#editing-the-catalog)), and `meta.workspaces` how many workspaces have the plan (a platform
  read, `plans.subscriptions_report`), and `meta.confirmationToken` what confirms it: a keyed hash of the change and the
  version it was asked at. The editor shows both and sends the same body again with `"confirm": true` and that
  `"confirmationToken"`; the plan is saved only when the token matches the change the server computes then, so a
  confirmation never saves another change, or a change of a version saved since (it is asked again). `confirm` without a
  token is 422. Raising a
  limit, adding a feature, the trial, the texts and taking the plan off sale ask nothing: they take nothing from anyone
  already on the plan;
- **a newer version:** someone saved the plan since it was read: 409 `platform.plan_changed`, with `meta.currentVersion`;
  load it again and make the change on top;
- **the default plan off sale:** 422 `platform.default_plan_on_sale` (on `available`): new workspaces start on it;
- **no catalog writer here:** 503 `platform.catalog_not_editable` (`editable` is false), with nothing written. That is also
  the answer when the writer is configured but cannot sign in (a wrong password, a role dropped since): the failure is
  reported, masked, and the editor stays read-only until it is fixed, never a 500;
- a slug no plan has: 404 `platform.plan_not_found`; a body that breaks the rules above: 422 `validation.*` on its field.

A save that changed something is written to the platform's trail as `platform.plan.updated` (resource `Plan`, the plan's
slug), with the plan's terms before and after (`{tier, names, descriptions, monthlyCents, yearlyCents, currency,
trialDays, available, isDefault, features, quotas}`). A save that changed nothing writes nothing and keeps the version.

### Making a plan

`POST /platform/plans` takes `{slug, from, names}`: the new plan's slug (snake case, `[a-z][a-z0-9_]{0,63}`, never
`order`, which is the path of the catalog's order), the slug of the plan it copies, and its name in every language (one
line, at most 60 characters). The new plan copies `from`'s prices and currency, trial, features, limits and descriptions,
starts **off sale**, goes after every other plan, and is the admin's in everything (`plans:sync` never writes it). It
answers 201 `{plan}` (version 1), and the order becomes the admin's (see [Editing the catalog](plans.md#editing-the-catalog)).

It is refused: a slug a plan already has, retired ones included (a slug is never used twice), 422
`platform.plan_slug_taken` (on `slug`); a `from` no plan has, 404 `platform.plan_not_found`; no catalog writer, 503
`platform.catalog_not_editable`. The trail gets `platform.plan.created` (resource `Plan`, the new slug), with its terms
after and `copiedFrom`.

### Ordering the plans

`PUT /platform/plans/order` takes `{order: [slugs]}`: every plan, retired ones too, each once, first to last (the first
gets tier 0). It answers as `GET /platform/plans`, in the new order. An order that leaves a plan out was read before a
plan was made: 409 `platform.plan_changed` (`meta.currentVersion` null), and the screen reads the list again. One that
is wrong whenever it was read is 422: a slug no plan could have (`validation.regex`) or one named twice
(`validation.distinct`) on that entry (`order.N`), and a plan nobody has `platform.plan_order_invalid` on `order` (plans
are never deleted, so no older list names one). The trail gets `platform.plans.reordered`
(resource `PlanCatalog`, id `order`), with `{order}` before and after; the order the catalog already had writes nothing. The order decides which change of plan is an upgrade (see [Billing](billing.md)).

### Offering a plan's prices again

`POST /platform/plans/{plan}/prices` offers the plan's prices on Stripe as the catalog has them, after a save Stripe did
not take (`stripe: "failed"`). It answers `{prices: {inLine, pending}}` and writes `platform.plan.prices_offered` to the
trail, with where the prices stood before (`{inLine, pending}`) and after. Stripe failing again is 502 `platform.prices_not_offered`, with `meta.pending`,
the periods nobody can buy meanwhile; Stripe not set up is 503 `platform.stripe_not_configured`; no catalog writer (Billing
writes `billing_prices` as it) is 503 `platform.catalog_not_editable`; a slug no plan has, 404 `platform.plan_not_found`.

### A plan's history

`GET /platform/plans/{plan}/history` lists the plan's last 20 revisions, newest first: `[{version, source, actor, at,
fields}]`. `source` is `admin` or `sync` (`plans:sync`, `actor` null). For `admin`, `actor` is the admin's name, or the
email when the name is blank, or null when that person's account was deleted for good; `at` is ISO 8601,
UTC; `fields` names the terms that changed (`["trialDays", "quotas"]`), none for a plan's first version. A plan made
before the history existed starts it with its first change. A slug no plan has is 404 `platform.plan_not_found`.

## Platform flags

A platform flag switches something on or off for the whole platform, or releases it to a share of the workspaces. Packages
declare them with a provider tagged `platform.flags` (see [Add a platform flag](../guides/add-a-platform-flag.md)); the
registry is built once and checked on first use and by `platform:verify`. What a plan includes stays Plans'.

The kernel declares one, `platform.impersonation` (on by default, no rollout): off, nobody enters a workspace as a member
(503 `platform.flag_off`), a code already handed is refused when exchanged (401 `auth.handoff_invalid`), and every open
session of an impersonation ends on its next request (401), for good: switching it on again does not bring it back. Auth
asks it through its own contract, `Auth\Contracts\AllowsImpersonation`, which Platform binds: it also says no for an admin
who is no longer a super admin.

`platform_flags` keeps only what an admin changed (`enabled`, `rollout` from 0 to 100 or null, `version`, who and when); a
flag with no row follows its default. The states are cached under a generation that a save moves on after its commit.

| Route | What |
| ----- | ---- |
| `GET /platform/flags` | every declared flag: `[{slug, label, description, default, rollout, enabled, rolloutPercent, version}]`, the words in the request's language; `version` is 0 for a flag never changed |
| `PUT /platform/flags` | `{flags: [{slug, enabled, rolloutPercent, version}]}` (1 to 100 flags, each once) → the list, as `GET` |

Saving is all or none, under a lock of its own: each flag against the `version` it was loaded at (409
`platform.version_mismatch`, `meta.currentVersions` by slug), a flag no package declares is 422 `platform.flag_unknown`
and a percentage for a flag without `rollout` is 422 `platform.rollout_not_offered` (both with the field, as
`flags.0.slug`). `rolloutPercent` is sent always: `null` for every workspace. A flag left as it was is neither written nor
audited; each change is written to the platform's trail (`platform.flag.updated`, before and after: `enabled`,
`rolloutPercent`). The `PUT` takes the `platform` limiter.

In a workspace, `GET /me` carries `platformFlags`: every declared flag with its answer for that workspace, by slug.

## Settings and the brand

The platform's own settings, by key, in `platform_settings` (the platform's own: no `tenant_id`): its name
(`brand.name`), primary color (`brand.primaryColor`), logo (`brand.logo`, a key of the assets disk) and who may sign up
(`access.mode`). A key with no row follows the environment (`PLATFORM_NAME` or `APP_NAME`, `PLATFORM_PRIMARY_COLOR`,
`PLATFORM_LOGO_URL`, `PLATFORM_ACCESS_MODE`): that is how the `.env` seeds them, with nothing written when migrating. The
table takes only those four keys and, for `access.mode`, only `open`, `waitlist` or `closed`. Each key has a version, so two
admins cannot overwrite each other. Platform binds Support's `PlatformBrand` to these settings: the emails and screens that
speak for the platform follow them at once (see [Brand the platform](../guides/brand-the-platform.md)).

| Route | Who | What |
| ----- | --- | ---- |
| `GET /platform/settings` | an admin | `{values: {name, primaryColor, logoUrl, accessMode}, versions: {name, primaryColor, logo, accessMode}}` |
| `PATCH /platform/settings` | an admin | any of `{name, primaryColor, accessMode}` and `versions` → as `GET` |
| `POST /platform/settings/logo` | an admin | multipart `logo` → as `GET` |
| `DELETE /platform/settings/logo` | an admin | → as `GET` |
| `GET /platform/public` | anyone, limited | `{name, logoUrl, primaryColor, accessMode}` |

- **Saving** is all or none, under a lock of its own, each field against its version (409 `platform.version_mismatch`, with
  `meta.currentVersions` by field). `name` is plain text of 2 to 60 characters, `primaryColor` `#rrggbb` in lower case or
  `default`, `accessMode` `open`, `waitlist` or `closed`; at least one of them. Audited as `platform.settings.updated`
  (before and after).
- **The logo** is checked by its bytes (PNG, JPEG or WebP; anything else, 422 `platform.logo_invalid`), at most
  `platform.logo.max_bytes` (1 MB), written again by GD at most `platform.logo.max_side` (512) on a side, and kept under
  `platform/brand/`. The file it replaces, or the one taken away, is deleted by a queued job after the commit, which deletes
  nothing outside `platform/brand/`. Audited as `platform.logo.replaced` and `platform.logo.removed`.
- **The public read** takes no session and no workspace (400 `platform.tenant_context_forbidden` for one: a workspace has its
  brand in `GET /tenant`), and its own limiter, `platform-public` (600 a minute per address: the frontend's server asks it
  for every page it renders, from one address). Its answer is the same for everyone and holds nothing secret, so it says
  `Cache-Control: public, max-age=60`: a cache in front of the API, or the frontend's server, may keep it a minute, and a
  change of the brand may take that long to show.

The writes take the `platform` limiter.

## Who signs up: the access mode, the waitlist and invitations

The access mode (`access.mode`, see [Settings and the brand](#settings-and-the-brand)) is `open`, `waitlist` or `closed`,
and Platform asks it for Signup through a gate (`Signup\AccessModeGate`, tagged `signup.gates`) when a signup starts, when
its email is confirmed and when its workspace is made. It never changes how the people of an existing workspace sign in.
[Control who signs up](../guides/control-who-signs-up.md) has the whole policy.

`GET /platform/settings` also answers `accessModes`: `[{value, label, description}]`, the three modes in the request's
language, for the Settings page.

| Route | Who | What |
| ----- | --- | ---- |
| `POST /platform/waitlist` | anyone, limited | `{email, name, company, note, locale, captchaToken}` (`note` up to 1000 characters, Support's `MultilineText`) → 202 `data: null`, always the same |
| `GET /platform/waitlist` | an admin | `status`, `search`, `cursor` → `[{id, email, name, company, note, locale, status, createdAt, invitedAt, joinedAt}]`, `meta.pagination` |
| `POST /platform/waitlist/{id}/invite` | an admin | → an invitation |
| `GET /platform/invitations` | an admin | `cursor` → `[{id, email, status, createdAt, expiresAt, acceptedAt, workspaceId}]`, `meta.pagination` |
| `POST /platform/invitations` | an admin | `{email}` → an invitation |
| `DELETE /platform/invitations/{id}` | an admin | `data: null` |

- **The waitlist** (`platform_waitlist`): one row per email, in lower case, `waiting`, `invited` or `joined`. The public
  form takes emails only in `waitlist` mode (403 `platform.waitlist_closed` otherwise), with a captcha by Signup's rule,
  the `platform-waitlist` limiter (5 an hour per email and address, 20 per address) and no caching; whether the email was
  there already, the answer is the same 202, and the first entry stays.
- **Invitations** (`platform_invitations`): a token of 48 random characters bound to one email, kept as its SHA-256,
  mailed (`PlatformInvitationMail`, queued encrypted) as `<frontend>/signup#invite=<token>`, good once for
  `platform.invitation_days` (14). A new one to the same email takes the old one away; an email with an account is 422
  `platform.email_has_account`. The status is `pending`, `accepted` (with the `workspaceId` it made), `revoked` or `expired`.
- **Audited** in the platform's trail: `platform.invitation.sent`, `platform.invitation.revoked` and
  `platform.invitation.accepted` (about the workspace it made).

The overview counts the waitlist too: `waitlist: {waiting}`.

## In a workspace

In a workspace a super admin is a member like any other: the role grants nothing there. Platform only adds `isSuperAdmin`
to `GET /me` (`true` for a super admin, `false` for anyone else), for the frontend to offer the way to the admin host, and
`platformFlags` (see [Platform flags](#platform-flags)).

## The platform's trail

What the admins do, and what the commands above do (with no actor), goes to `platform_audit_logs`: who, from where, the
action (`platform.<resource>.<what happened>`, from `MoodKit\Platform\AuditEntries`), the resource, the workspace it was
about (`workspace_id`), before and after. It belongs to no workspace, so it has no `tenant_id` and no workspace can read it,
and it is append-only: triggers refuse an update, a delete or a truncate, and only the schema owner could drop them.

What an admin does to a workspace (suspending it, for one) is also written to that workspace's own trail (`audit_logs`),
as the workspace, with the admin as the actor: its people see what the platform did to it.

What the admin does to the catalog of plans belongs to no workspace and goes to the platform's trail alone:
`platform.plan.created`, `platform.plan.updated` (resource `Plan`, the plan's slug, its terms before and after),
`platform.plans.reordered` (resource `PlanCatalog`, the order before and after) and `platform.plan.prices_offered`. Plans
also keeps each change of a plan in `plan_revisions` (see [Editing the catalog](plans.md#editing-the-catalog)).

## The `platform` layer

The admin's panel is the frontend layer `frontend/layers/platform`. One build serves every host: the panel's pages live
under `/platform/**`, and `NUXT_PUBLIC_PLATFORM_HOST` (core's `usePlatformHost()`) says which host is the admin's.

- **Its host only.** On the admin's host `/` goes to `/platform`, and every other page is a 404; on any other host
  `/platform/**` is a 404. The layer's server middleware (`server/middleware/platform-host.ts`) answers that before the
  app, with a real 404 status, and its global route middleware (`platform-host.global.ts`) does the same as the browser
  moves between pages. Files (`/robots.txt`, `/favicon.ico`) and Nuxt's own paths (`/_nuxt/...`) pass on every host. On
  the admin's host core sends `X-Robots-Tag: noindex, nofollow` and a narrower Content Security Policy, the tenancy layer's
  `robots.txt` is `Disallow: /`, and the auth layer does nothing.
- **The session.** The admin's token lives in `localStorage` of the admin's own origin, under `mood-kit.platform-token`,
  never in a cookie: no workspace's page can read it, and no workspace's token is there. `usePlatformSessionStore()` signs
  in (`POST /platform/auth/login`, with the captcha), knows the admin (`GET /platform/auth/me`) and signs out; its plugin
  (`platform-session.ts`) brings the token back when the app starts and, on a 401 `auth.unauthenticated` (an expired or
  idle session, or the role taken away), forgets it and sends the admin to `/platform/login?redirect=...`. Signed out, a
  page of the panel goes to the sign-in, and back after it (only to a page of the panel). The panel's pages are drawn by
  the browser alone (`browserOnlyRule()`).
- **The sign-in** (`/platform/login`, core's `auth` layout and `AuthShell`) explains itself: only the platform's super
  admins sign in there, and a workspace's people sign in on its address.
- **The layout** (`layout: "platform"`) is core's `AppFrame`, the dashboard's frame: a top bar with the platform's mark (its
  logo and name) and an Admin badge, the signed-in admin's email and Sign out, and the menu of `GET /platform/menu` in
  core's `MenuSidebar` (loaded again on a change of language). The breadcrumb comes from the menu and the route: the
  overview, the menu entry the page is under, and the record a page shows (`usePlatformCrumbTitle()`).
- **The brand.** The plugin `platform-public.ts` reads `GET /platform/public` on the root domain and the admin's host
  (never on a workspace's, which wears its own) into core's `usePlatformPublic()`: on the server before the page renders,
  in the browser for a page the server did not draw. `usePlatformName()`, `useBrandPalette()` (the platform's color) and
  `AuthShell` (its logo) follow it. When it cannot be read, the screens keep `NUXT_PUBLIC_PLATFORM_NAME` and mood-ui's
  color, and the failure is logged.
- **In a workspace** the plugin `platform-profile-link.ts` reads `platformFlags` of `/me` into core's
  `usePlatformFlags()`, and gives a super admin a link to the panel in the profile menu (`kit:profile-menu:links`), an
  address on the admin's host that opens as a new page.

The panel's pages, each in the kit's page anatomy (`PageHeader`, then `Tabs` in the `line` variant where there are tabs,
`PageToolbar`, the content, and `PageActionBar` on a page that edits):

| Page | What it shows and does |
| ---- | ---------------------- |
| `/platform` | the overview: workspaces by standing and the new ones of the last 30 days, subscriptions by status, and who waits on the waitlist, each in mood-ui's `Stat` |
| `/platform/workspaces` | every workspace, newest first, in a table: search by name or slug (asked once the admin stops typing), filters by standing and plan, Show more. The name is plain text; each row ends in its actions, outline icon buttons with their tooltip: Open, Enter as a member (an active workspace with active members: a dialog picks the member, never a super admin, and asks why), and the changes of standing its standing allows, as on its page (Suspend and Close ask why first; Resume and Reopen act at once), after which the list is read again |
| `/platform/workspaces/{id}` | one workspace: its standing in the header with at most two actions (Suspend or Resume, and Close; Reopen while a closing one's grace lasts, none after it), Suspend and Close asking for a reason in a dialog with a `Textarea` (10 to 500 characters); tabs Summary (plan, subscription, address, members; a closing one's date and reason in a danger banner; the plan's card has Give a plan, off with why while Stripe bills the workspace, which opens a dialog with the plan in a `KitSelect`, an optional end date in mood-ui's `DateField` and the reason, and Take it back on a plan the platform gave, which asks why; neither on a closing workspace), Members (Enter as for an active member of an active workspace, never for a super admin, who carries a badge) and Activity (what the platform did to it, with the reasons, in mood-ui's `Timeline`) |
| `/platform/plans` | every plan of the catalog in its order, retired ones too, with its badges (Default, Not for sale, and Prices not on Stripe where Stripe is set up and `prices.inLine` is false), how many workspaces have it and its subscriptions by status. Each row ends in its actions, outline icon buttons: one place up and one place down (only where it can go), saved at once with the whole order (`PUT /platform/plans/order`; a 409 reads the list again), and Edit, which opens the plan's editor. New plan, in the header, opens a dialog (the slug, the plan it copies in a `KitSelect`, a name in each language) that makes it off sale and last in the order and opens its editor; a refusal of a field (a slug taken) shows on that field. With no catalog writer (`editable` false) a banner says why, and the list only shows: no moves and no New plan, only Edit |
| `/platform/plans/{slug}` | one plan, to edit: its name in the header with its slug, how many workspaces have it and its badges, and five tabs. General: Texts (a name and a one-line description in each language, a column each on a wide screen) and Sale and trial (On sale, a switch that stays on for the default plan, and the trial's days, empty for none). Prices: the monthly and yearly prices in the currency's units (empty: not sold for that period; 0: free; the currency does not change here); where Stripe is set up and does not have the saved prices yet (`prices.pending`), a warning banner says which periods nobody can buy meanwhile and Offer on Stripe sends `POST /platform/plans/{plan}/prices` (a 502 shows the periods still missing), and without Stripe a line says the prices are only saved. Limits: a row per resource the packages register, a number or No limit (a switch; turned off, the number starts at 0). Features: a switch per declared feature, or an empty state when no package declares any. History: the last 20 changes, read when the tab first opens and again after a save, each with its version, who made it (the admin, "From config/plans.php" for `plans:sync`, or "A deleted account"), when and what changed. Every card shows its unsaved dot, and the action bar reviews the changes by card and saves the whole plan (`PUT /platform/plans/{plan}`) at the version it read; a save Stripe did not take (`stripe: "failed"`) is saved and warns, pointing at Prices, instead of the success. A change that takes something from the workspaces on the plan (409 `platform.plan_change_unconfirmed`) opens a dialog that lists each impact and how many workspaces have the plan, with Cancel and Save anyway, which sends it again confirmed with the token the API asked with; any other refusal of the confirmed save closes the dialog; someone who saved meanwhile (409 `platform.plan_changed`), or a catalog writer gone since the page loaded (503 `platform.catalog_not_editable`, on a save or Offer on Stripe), makes the page read the plan again and drop the draft; a refusal of a field shows on its field. With no catalog writer (`editable` false) a banner says why, every field is disabled and there is no bar |
| `/platform/flags` | each flag with what it does and its default, a switch, and the share of workspaces for one that rolls out; the changes wait for the action bar, which reviews them (On → Off) and sends only those (`PUT /platform/flags`), and a 409 reads them again |
| `/platform/settings` | the brand in one card: the name and the color at the left (two tabs of the `line` variant, the default color or one of its own with its picker), the logo at the right (saved the moment it is chosen or removed); and who may sign up (the three access modes as cards); the name, the color and the mode wait for the action bar (`PATCH /platform/settings` with only what changed and its versions). Whatever is saved shows at once on the screens (`usePlatformPublic()`) |

| `/platform/waitlist` | two tabs: Waitlist (search by email, name or company, a status filter, each person's note cut with the whole of it in a tooltip, and Invite on someone who waits) and Invitations (where each stands, and Revoke on a pending one); Invite by email, in the header, opens a dialog for an address not on the list, which shows `platform.email_has_account` on its field |

Enter as (on the Members tab, or a row of the list) opens the address the API answers in a new tab: the workspace, signed in as the person, with its banner and Exit
(see [Impersonate a member](../guides/impersonate-a-member.md)); the panel stays in its own tab.

**The public waitlist**, `/waitlist` on the root domain, is drawn by the server (it needs no session) and explains itself
by the access mode: in `waitlist` mode, a form (name, email, company and a note, both optional, in a `Textarea`, and the
captcha) that sends `POST /platform/waitlist` in the screen's language and then says the person is on the list (the same
whether the email was there already: the API answers the same); in `open` mode, that signups are open, with the way to
`/signup`; in `closed` mode (or with the mode unknown), that no new workspaces are taken for now. The signup form reads an
invitation from its link (see [Signup](signup.md#the-signup-layer)).

A module adds a page to the panel with a page of its own layer under `pages/platform/...` with
`definePageMeta({ layout: "platform" })`, and a `MenuItem` in a section of the `platform` area (see
[The admin's menu](#the-admins-menu)); the panel's host middleware and session cover it.

## Configuration

`backend/packages/Platform/config/platform.php` holds the defaults; `backend/config/platform.php` reads the ones the
environment sets.

| Key | Default | Variable | Meaning |
| --- | ------- | -------- | ------- |
| `platform.host` | empty: `admin.<TENANCY_ROOT_DOMAIN>` | `PLATFORM_HOST` | the admin's host, a reserved label of the root domain |
| `platform.bootstrap_admins` | empty | `PLATFORM_BOOTSTRAP_ADMINS` | the emails `platform:setup` makes the first super admins, separated by commas, only while there is none |
| `platform.access_mode` | `open` | `PLATFORM_ACCESS_MODE` | who may make a workspace until an admin chooses: `open`, `waitlist` or `closed`. Empty is `open`; anything else is `closed`, and `platform:verify` fails |
| `platform.session_minutes` | `480` | `PLATFORM_SESSION_MINUTES` | the whole life of an admin's session |
| `platform.idle_minutes` | `60` | `PLATFORM_IDLE_MINUTES` | how long an admin's session may sit unused |
| `platform.login_attempts_per_minute`, `.login_attempts_per_address_per_minute`, `.login_attempts_per_email_per_hour` | `5`, `20`, `20` | | the admin's sign-ins, per email and address, per address, and the failed checks of a password per email |
| `platform.writes_per_minute` | `60` | | what an admin may change per minute |
| `platform.impersonations_per_hour` | `20` | | the impersonations an admin may start per hour |
| `platform.public_reads_per_minute` | `600` | | the public reads of the platform's brand, per minute and address |
| `platform.waitlist_per_email_per_hour`, `.waitlist_per_address_per_hour` | `5`, `20` | | the waitlist form's submissions, per email and address, and per address |
| `platform.deletion_grace_days` | `30` | `PLATFORM_DELETION_GRACE_DAYS` | the days a closed workspace waits before it is deleted |
| `platform.invitation_days` | `14` | `PLATFORM_INVITATION_DAYS` | the days an invitation to sign up lasts |
| `platform.logo.max_bytes`, `.max_side` | `1048576`, `512` | | the largest logo file taken, and the longest side it is stored at |

## Checking the configuration

`php artisan platform:verify`, in the deploy script (see [Production](../configuration/production.md#every-deploy)), fails
on a setting that cannot work, naming its variable: a `PLATFORM_HOST` a workspace could take or outside the root domain, a
`PLATFORM_ACCESS_MODE` that is not `open`, `waitlist` or `closed` (empty is `open`), and an entry of `PLATFORM_BOOTSTRAP_ADMINS` that is
not an email. It also builds the registry of platform flags: a slug that is not `<package>.<what>`, or one declared twice,
fails it. With nothing wrong it says where the platform lives, who may sign up and how many flags are declared. Who may sign
up is the mode an admin chose in the panel, saying so, and `PLATFORM_ACCESS_MODE`'s only when none was chosen. It warns,
without failing, when the admin host's sign-in checks no captcha (`AUTH_CAPTCHA_DRIVER` null) anywhere but in the `local`
environment.
