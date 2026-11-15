# Plans

`backend/packages/Plans`, namespace `MoodKit\Plans\`. Plans, subscriptions, quota limits and feature flags. Every
workspace has one subscription to a plan of the catalog; the plan says which features it includes and how many of each
counted resource it may create. Billing (Stripe) moves the subscription later; this package works without it.

## Permissions and the menu

| Permission | Lets a member |
| ---------- | ------------- |
| `subscription.view` (module `plans`) | see the workspace's subscription: its plan, status, limits and what it includes |

It is not the owner's alone, so the owner and the manager roles of every workspace hold it, and the member role does
not. On an installation that already has workspaces, run `php artisan rbac:sync` after the deploy that brings this
package.

`subscription.view` shows workspace-wide usage counts, so a branch-limited role that has it can work out totals for other branches.

The menu gets **Subscription** (`/dashboard/subscription`, icon `credit-card`) in the `administration` section, at order
95, for whoever holds `subscription.view`.

## Resources, features and the catalog

Three registries, filled by providers tagged in a package's service provider, are gathered by
`MoodKit\Plans\Registry\PlansRegistry` the first time they are read, and checked as a whole:

| Tag | Provider | Declares |
| --- | -------- | -------- |
| `plans.quota_resources` | `Contracts\QuotaResourceProvider` | `QuotaResource`: a slug, label and description keys, a `QuotaCounter` class, a `QuotaPeriod` (`total` or `monthly`, a calendar month in UTC), an order, and `retiredPlanLimit`, its limit on the plans retired before it was registered (null, none, by default) |
| `plans.features` | `Contracts\FeatureFlagProvider` | `FeatureFlag`: a slug, label and description keys, and an order |
| `plans.catalog` | `Contracts\PlanCatalogProvider` | `PlanDefinition`: the plans. The kernel's (`KernelPlansProvider`) reads `config('plans.catalog')`. |
| `plans.member_seats` | `Contracts\MemberSeats` | `reserved($tenantId)`: a query of the places taken by people who are not members yet (Team's pending invitations), one row each, counted by the `members` quota in the same statement as the active members |
| `plans.scheduled_plans` | `Contracts\ScheduledPlanLimits` | the plan a workspace is set to move down to at the end of its period (Billing), whose lower limits `EnforcesQuotas` holds it to until then |

The kernel registers one resource, `members`: active members plus the places packages hold (people with an active
membership and the rows of every `Contracts\MemberSeats` tagged `plans.member_seats`, Team's pending invitations, all
counted in one statement by Auth's `MemberDirectory::countActiveMembers()`), and no feature: features come with the modules that have something to
gate.
Notifications registers `email_sends_per_month` (`monthly`): the notification emails a workspace sent or has on their way
this month, and those kept for a member's daily summary (counted when kept, the summary itself never), never the plan's
own notices (see [Notifications](notifications.md#how-a-notification-is-sent)).
Branches registers `branches` (`total`): the workspace's active branches; an inactive one holds no place (see
[Branches](branches.md#quota)).
Clients registers `clients` (`total`): the workspace's live clients; one in the trash holds no place. It registers the
features `clients_import` (importing clients from a CSV file) and `clients_portal` (the client portal) too (see
[Clients](clients.md#quota-and-plan)).
The plan and what the workspace uses of each limit also show on the home, for whoever holds `subscription.view`: Dashboard's
`dashboard.plan_usage` widget reads them through `ReadsCatalog` and `ReadsQuotas` (see [Dashboard](dashboard.md)).
See [Add a quota or a feature flag](../guides/add-a-quota-or-feature.md).

The catalog lives in `backend/config/plans.php`. The kit ships an example: **Free** (tier 0, the default, no trial, 3
members, 300 emails a month, 1 branch, 100 clients), **Pro** (tier 1, 14-day trial, 20 members, 5,000 emails, 5
branches, 5,000 clients, the client import and the client portal) and **Business** (tier 2, 14-day trial, no member
limit, 50,000 emails, no branch or client limit, the client import and the client portal), with monthly and yearly
prices in cents for billing. A plan's slug (its key) is snake case, at most 64 characters, and never `order`, which is
the address of the order of the plans in the admin. Each plan has:

- `tier`: orders the plans, from 0; a higher tier is an upgrade. No two plans share one. Nothing in the code names a
  plan by its slug.
- `name` and `description` in every language of `support.locales`;
- `prices` (`monthly`, `yearly`, in the smallest unit of `currency`, an ISO 4217 code; null for none), `trial_days`
  (null, or at least 1);
- `available` (whether it can be chosen) and `default` (exactly one plan, which must be available: the one new
  workspaces start on);
- `features`: the flags it includes. A flag it does not list is off;
- `quotas`: a limit for every registered resource, `null` for none.

The registry refuses a catalog that breaks any of these, or that names a flag or a resource no package registers, with
`Registry\InvalidPlansRegistry`.

## The catalog in the database

The catalog lives in global tables (no `tenant_id`, no row-level security), which the platform's read-only role may read,
and the runtime role only reads. Two roles write them, each on a session of its own: `plans:sync` as the schema owner
(`DB_MIGRATION_USERNAME`, the role `migrate` connects as), and the admin's editor as the catalog's writer
(`DB_CATALOG_USERNAME`, see Editing the catalog). Migrations take the runtime role's writes away and grant the catalog's
writer only what the editor writes: it may change a plan but never delete one (subscriptions point at it), replace a plan's
features and limits, and add a revision (`tenancy:verify-rls` fails if either changes):

- `plans`: one row per plan, by slug, with its tier, names, descriptions, prices, currency, trial and whether it is
  available and the default (at most one, which must be available: the database checks both). Two more columns:
  - `edited`: what the super admin changed in the admin, which `plans:sync` leaves as it is: `tier`, `texts` (names and
    descriptions), `prices` (monthly, yearly and currency), `trial`, `available`, `feature:<slug>` and `quota:<resource>`.
    Empty on a plan nobody edited;
  - `version`: starts at 1 and moves on with every change, so a save over a newer one is refused;
- `plan_features`: a row per plan and feature it includes. No row, no feature;
- `plan_quotas`: a row per plan and resource, with its limit (`null` is none);
- `plan_revisions`: every change of a plan, as the version it made: whether it came from the admin (and who) or from
  `plans:sync`, with the plan's terms before and after. It is written in the same transaction as the change, so there is no
  change without its revision. It is append-only: triggers refuse an update, a delete or a truncate, whoever runs them. The
  runtime role only reads it, and the catalog's writer may only add to it. Plans that existed before it was made start their
  history at their first change.

`plans:sync` writes the config over whatever the super admin did not edit. For each plan of the config it reads the
plan's marks (`edited`) and keeps, as the admin set them, the terms each mark covers: `tier`, `texts` (names and
descriptions), `prices` (monthly, yearly and currency), `trial`, `available`, `feature:<slug>` (whether the plan includes
that feature) and `quota:<resource>` (that limit). Everything without a mark is written as the config says, so a buyer who
never uses the editor sees what the config says, as always. The default plan is always the config's. A feature or a
limit the admin kept goes once no package registers it.

- **A new plan of the config** takes its `tier`, unless a plan already has it, on sale or not (the admin's order, or a plan
  off sale the admin may put on sale): then it goes after the last plan.
- **A slug of the config that was first made in the admin** is taken as that plan, which has every mark: the sync keeps
  all of it as the admin set it, and only whether it is the default follows the config.
- **A plan the config no longer has** is never deleted, since subscriptions point at it. It stops being the default and
  goes off sale, unless the admin decided its sale (`available`): a plan made in the admin, which has every mark, never
  goes. The config cannot give it a limit for a resource registered after it, so the sync writes the resource's
  `retiredPlanLimit` there (no limit unless the resource says otherwise), and never changes a limit it has.
- **It fails without writing anything** on a catalog the registry refuses, and on two more:
  - the config makes default a plan the admin took off sale: put it on sale in the admin, or forget the admin's edits of
    it;
  - two plans on sale with the same `tier` (the config's and the admin's order met): order them in the admin, change
    their `tier` in `config/plans.php`, or forget the admin's edits of the ones the config should order.
- **`php artisan plans:sync --forget-edits=<slug>`** (repeatable) drops a plan's marks first, so the config writes all of
  it again. Only for a plan of the config: a plan made in the admin has no config to go back to.
- **Versions and revisions:** a plan the sync changes moves to its next `version`, with a revision whose `source` is
  `sync` (no actor). A sync that changes nothing writes nothing. A new plan starts at version 1, with its first revision.

Everything happens in one transaction, under the lock every write of the catalog takes (`plans:catalog`), so two syncs, or a
sync and the editor, take turns. Run it in every deploy, after `migrate` and `rbac:sync`. The command prints what it
created, updated and took off sale, plus two lines when they apply: `Kept the admin's changes to pro: prices, trial.` (the
marks of each plan it left as the admin set them) and `Placed last, its tier being taken: team: tier 4.`

The package reads the catalog through `Catalog\PlanCatalog`, cached under a generation that `plans:sync` and the editor
move on, so every cached catalog and every workspace's plan context are forgotten once they commit. Before the first sync, the
default plan is read from the config, and a warning is logged.

## Editing the catalog

`Contracts\EditsCatalog` is the super admin's editor of the catalog, for Platform's admin and nobody else
(`tests/Architecture/CatalogEditorTest.php`). It writes as the [catalog's writer](../concepts/multi-tenancy.md#the-catalogs-writer),
never as the runtime role or the schema owner, under the lock `plans:sync` takes (`plans:catalog`) and with the plan's row
locked, and keeps a revision of every change in the same transaction.

- `editable()`: whether a catalog writer is configured (`DB_CATALOG_USERNAME`). Without one, every write answers
  `NotEditable` and nothing is written: it never falls back to another role.
- `versions()`: every plan's `version`, retired ones too, by slug, by tier.
- `plans()`: every plan, retired ones too, by slug, by tier, as a `Contracts\EditablePlan`: its terms (`plan`, a
  `PlanDefinition`) and the `version` they are at, read in one statement from the catalog's tables, never from the cached
  catalog (which is forgotten a moment after a save commits): what the editor shows and saves against.
- `update($slug, PlanTerms $terms, $version, $confirmation, $actorUserId)`: sets everything the admin edits of a plan at once.
- `create($slug, $from, $names, $actorUserId)`: a new plan, a copy of the plan `$from` (see Making a plan below).
- `reorder($slugs, $actorUserId)`: every plan in its new order (see Ordering the catalog below).
- `history($slug, $limit = 20)`: the plan's latest revisions, newest first.

`Contracts\PlanTerms` carries all of it together: names and descriptions in every language of `support.locales`, the
monthly and yearly prices in the smallest unit of the plan's currency (`null`: not sold for that period, `0`: free), the
trial in days (`null`: none), whether it is on sale, its features, and a limit for every registered resource (`null`: no
limit). The tier, the currency and the default are not in it: the order, the plan's creation and the config set them.
Terms that name a feature or a resource no package registers, leave a resource out, or miss a language throw an
`InvalidArgumentException` (and so do the names of a new plan that miss a language): the caller checks them first, so
that is a mistake in code, not an answer.

A write never throws for what a person can cause: it answers a `Contracts\CatalogEdit`, whose `outcome`
(`Contracts\EditOutcome`) the caller turns into its own error:

| Outcome | When |
| ------- | ---- |
| `Saved` | written: `plan` is the plan now, `version` its new version, `before` and `after` its terms (`Catalog\Terms`'s shape), `placedAt` the tier it went to when it went on sale at a taken one |
| `Unchanged` | nothing differs: no new version, no revision |
| `NeedsConfirmation` | the change takes something from the workspaces on the plan, and `$confirmation` is not its token: `impacts` says what, `confirmation` is the token |
| `Stale` | the plan was saved since `$version` was read: `version` is the current one |
| `NotFound` | no plan has that slug |
| `DefaultOffSale` | the default plan cannot go off sale |
| `SlugTaken` | `create()`: a plan, retired ones included, has that slug |
| `NotEditable` | no catalog writer, or one that cannot sign in |
| `InvalidOrder` | `reorder()`: a plan named twice, or one nobody has |

**The confirmation is the server's.** A change that takes something from the workspaces on the plan is only written with
the `$confirmation` it was asked with; without it the edit answers `NeedsConfirmation` with a `Contracts\PlanImpact` for
each thing it takes (`toArray()`: `{kind, key, from, to}`) and `confirmation`, a token (`Editor\Confirmation`, an HMAC
with the app's key of the plan, the version it is at and the terms the change leaves it with). The token confirms that
change of that version alone: another change, a version saved since or any other string asks again:

- `price`: the monthly or yearly price changes (`key` `monthly` or `yearly`, `from` and `to` in the smallest unit). New
  subscribers pay the new one; whoever pays keeps the old one;
- `limit`: a limit goes down, no limit to a number included (`key` the resource, `from` null for none);
- `feature`: a feature is taken away (`key` its slug): the workspaces lose it at once.

Raising a limit, adding a feature, the trial, the texts and taking the plan off sale ask nothing: they take nothing from
anyone already on the plan.

**The version.** Every save names the `version` it read; another one answers `Stale` with the current version, and nothing
is written. A plan's version moves on with every change, whoever made it (the editor or `plans:sync`).

**Putting a plan on sale.** Two plans on sale never share a tier: the database refuses it (`plans_tier_on_sale`, an
exclusion constraint checked when the transaction commits, so an order is rewritten plan by plan). A plan the admin puts on
sale at a tier a plan on sale has goes after the last plan instead: the edit says where (`placedAt`), its revision has the
new tier, and every plan is marked by its tier, so from then on the order is the admin's.

**The marks.** The editor adds the mark of everything that changed (`texts`, `prices`, `trial`, `available`,
`feature:<slug>`, `quota:<resource>`) to `edited`, and never takes one away, so `plans:sync` leaves it as the admin set it.

**The cache.** Once the writer's session commits, the editor forgets the cached catalog (`PlanCatalog::forget()`), which
forgets every workspace's plan context with it: every workspace on the plan gets the new limits and features on its next
request. It is not `DB::afterCommit()`, which waits for the default connection, not the writer's. So a write never starts
inside a transaction already open on the writer's session (a `LogicException`): its commit would not be the real one. A browser tab already
open keeps the `GET /me` it read until it loads it again, as after a change of subscription.

**Lowering a limit** keeps what a workspace has over it, and lets it add no more: `ensureCanCreate` counts live and refuses
what passes the limit, and nothing deletes what is over it. A workspace with 2 members on a plan whose `members` limit goes
down to 1 keeps both, its standing is full (`used` 2, `limit` 1), and it cannot invite anyone until it is under the limit.

**Two saves at once.** The second waits for the catalog's lock, then reads the version the first saved and answers
`Stale`: it never writes over the first (`EditPlanRaceTest`).

**Making a plan.** `create()` copies the plan `$from` (its prices and currency, trial, features, limits and descriptions)
under a new slug with the names given, off sale and after every other plan (the highest tier plus one), at version 1 with a
revision that says who made it (`before` null). It has every mark (`edited`), so `plans:sync` never writes it, and never
takes it off sale as a plan the config does not have: it is the admin's. A slug is never taken twice, a retired plan's
included (`SlugTaken`); a `$from` nobody has answers `NotFound`. The currency is the copied plan's and the editor never
changes it.

**Ordering the catalog.** `reorder()` takes every plan, retired ones too, each once, in its new order: the first gets tier
0. An order that leaves a plan out answers `Stale` (the list was read before a plan was made), and one that names a plan
twice or one nobody has `InvalidOrder` (it is wrong whenever it was read); neither writes anything; `$slugs` that are not a list throw an `InvalidArgumentException`. A plan whose tier changes moves to its next version, with a revision; the others keep
theirs. `CatalogOrder` carries the outcome and the slugs by tier `before` and `after`.

The order is the admin's from the first time the admin orders the catalog or makes a plan: both mark every plan by its
tier, so from then on `plans:sync` keeps the admin's order and a new plan of the config goes last when its tier is taken.
The order matters beyond the pricing page: Billing compares plans by `tier` to decide whether a change is an upgrade or a
downgrade, and so when it takes effect.

**The history.** `history()` reads `plan_revisions` as a list of `Contracts\PlanRevision`: `version`, `source` (`admin` or
`sync`), `actorUserId` (null for the sync), `at` (ISO 8601, UTC), and the terms `before` (null for a plan's first version)
and `after`. `changed()` names the terms that differ (`['trialDays', 'quotas']`), none for a first version.

## Subscriptions

`tenant_subscriptions` holds each workspace's subscriptions, with row-level security: one live (`ended_at` null) per
workspace at most (a unique index), the ended ones as its history. A row has its plan, its status, when it started, its
current period (`current_period_start`, `current_period_end`), the end of its trial (`trial_ends_at`, required while
`trialing`), the reason of its last change, `stripe_subscription_id`, which Billing fills (the scheduled tasks of this
package leave a subscription with one alone), and `granted` with `grant_ends_at` for a plan the platform gave (see
[Plans the platform gives](#plans-the-platform-gives)): the database refuses a grant with a Stripe subscription, and an
end without a grant. The platform's read-only role may read the table.

`Actions\StartSubscription` gives a workspace its subscription to the default plan, as that workspace: `trialing` until
the end of the plan's trial days when it has some, else `active` for a month. A workspace that has a live one keeps it.
Before anyone ran `plans:sync` it throws a `RuntimeException` that says to, and writes nothing: the catalog is the
deploy's to write.

A new workspace gets it inside its provisioning: the listener of Signup's `WorkspaceProvisioned` runs in the transaction
that makes the workspace, so a subscription that cannot start (on an install where `plans:sync` never ran) undoes the workspace. `php artisan plans:start-subscriptions`
gives one to every workspace that predates the package (reason `backfill`), and is safe to run again. The demo seeder
(`Database\Seeders\DemoSubscriptionSeeder`, local development and tests only) writes the catalog, as the schema owner,
and puts the demo workspace on the default plan.

The status is a `Contracts\SubscriptionStatus`, checked by the database too:

```text
trialing  -> active, past_due, cancelled
active    -> past_due, cancelled
past_due  -> active, cancelled
cancelled    (stays so)
```

Moving to the status it already has does nothing. Any other move is refused with 409 `plans.invalid_transition` (with
`meta.from` and `meta.to`), and a workspace with no subscription with 404 `plans.subscription_missing`. A trial that
becomes active starts a monthly period from the day the trial ended. The status never stops a workspace from writing:
what a cancelled subscription means (going back to the default plan) comes with billing.

Another package moves a subscription through `Contracts\ChangesSubscriptionStatus::change($tenantId, $to, $reason)`, as the
workspace (a request, a job, or `RunAsTenant`). A package that bills through Stripe (Billing) uses `Contracts\AppliesBilling`
instead, which says how the Stripe subscription is now:

- `apply($tenantId, BillingTerms, $reason)`: the first time, the kit's own subscription ends and one starts on the terms
  (`planSlug`, `status`, `periodStart`, `periodEnd`, `trialEndsAt`, `stripeSubscriptionId`); after that the status moves
  through `ChangeSubscriptionStatus` (checked again on the locked row: it is still that Stripe subscription's), and the plan,
  the period and the trial are written as Stripe has them. It answers a `BillingOutcome`: `started`, `updated`, `stale` (a
  Stripe subscription the workspace already ended never comes back) or `conflict` (the workspace is on another Stripe
  subscription, and nothing changes). A move the machine has no way to is logged, and the status stays.
- `takeOver($tenantId, $endedStripeSubscriptionId, BillingTerms, $reason)`: a Stripe subscription is over and the workspace
  pays for another one (the terms'). If the workspace is on the one that ended, it becomes `cancelled` and ends, and the
  workspace starts on the other one's terms, never through the default plan; otherwise it is `apply()` of the other one.
- `fallBack($tenantId, $stripeSubscriptionId, $reason)`: that Stripe subscription is over. It becomes `cancelled` and ends,
  and the workspace starts on the default plan, active for a month, with no trial; it answers the default plan's slug, or
  null when that was not the live subscription.

| Event (`Events\`, after the commit) | When |
| ------------------------------------ | ---- |
| `SubscriptionStarted` (`tenantId`, `subscriptionId`, `plan` slug, `status`) | a workspace got its subscription |
| `SubscriptionStatusChanged` (`tenantId`, `subscriptionId`, `from`, `to`, `reason`) | a subscription moved to another status; Notifications emails the owner when it becomes `past_due` (`plans.past_due_entered`) |
| `SubscriptionPlanChanged` (`tenantId`, `subscriptionId`, `from`, `to`, `reason`) | a subscription moved to another plan (Billing, from Stripe) |

They are audited, on the resource type `TenantSubscription`: `plans.subscription.started` (after: `plan`, `status`,
`trialEndsAt`, and `managedBy`, `stripe`, `kit` or `platform`, with `grantEndsAt` for a grant, when Billing or a grant
started it), `plans.subscription.status_changed` (before:
`status`; after: `status`, `reason`), `plans.subscription.plan_changed` (before: `plan`; after: `plan`, `reason`) and
`plans.subscription.ended` (before: `plan`, `status`; after: `reason`). The status labels are `plans::statuses.<status>`.

## Plans the platform gives

The platform's admin may give a workspace a plan of the catalog with no charge (a courtesy, a longer trial, a special
customer), until a date or with no end, through `Contracts\GrantsPlans` (bound to `Actions\GrantPlan`), as that workspace.
Nothing here calls Stripe. Platform's admin is the only caller in the kit (see
[Giving a workspace a plan](platform.md#giving-a-workspace-a-plan)).

- `grant($tenantId, $planSlug, ?DateTimeImmutable $endsAt)`: under the workspace's subscription lock (`plans:subscription:
  <tenant>`, the one `AppliesBilling` takes), the live subscription ends (the kit's own, or an earlier grant: a new grant
  replaces it, and announces that one's end, `PlanGrantEnded` with `revoked` and `to` the new plan) and one starts on the
  plan, `active`, `granted`, with `grant_ends_at` (its period ends then, or in a month when there is no end), reason
  `platform_grant`. It answers `GrantOutcome::Granted`; `GrantOutcome::BilledByStripe` and changes nothing when the live
  subscription is Stripe's (a grant never overwrites what Stripe bills); `GrantOutcome::EndsInPast` and changes nothing
  when `$endsAt` is not after the moment it is written, read once the lock is held. A plan the catalog has not written is
  an `InvalidArgumentException`.
- `revoke($tenantId)`: ends the grant the workspace is on as an ended grant does (below), reason
  `platform_grant_revoked`; it answers the default plan's slug, or null when the workspace is on no grant.
- `current($tenantId)`: the grant the workspace is on (`PlanGrant`: `planSlug`, `startedAt`, `endsAt`), or null.

`php artisan plans:end-grants`, every fifteen minutes on one server, never overlapping, enters each workspace with
`RunAsTenant` and ends a grant whose `grant_ends_at` has come, checked again on the locked row (one revoked, replaced or
taken over by Stripe meanwhile is left alone), reason `platform_grant_ended`. Ending one goes the way a Stripe subscription
that is over falls back (the same code, `Subscriptions\SubscriptionRows`): the grant becomes `cancelled` and ends, and the
workspace starts on the default plan, active for a month, with no trial. What it has over the default plan's limits stays,
but nothing more can be added where it is over.

A Stripe subscription that starts while a workspace is on a grant (a checkout someone paid) takes its place, as it takes
the kit's own: the paying customer wins, and the grant ends with no notice. The two take turns under the lock, so a grant
that comes second finds Stripe's and is refused. Billing opens no checkout and changes no plan while a grant lasts (409
`billing.plan_granted`): only a checkout opened before the grant gets here.

| Event (`Events\`, after the commit) | When |
| ------------------------------------ | ---- |
| `PlanGranted` (`tenantId`, `subscriptionId`, `plan`, `endsAt`) | the platform gave a plan; Notifications tells the owner (`plans.plan_granted`) |
| `PlanGrantEnded` (`tenantId`, `subscriptionId`, `from`, `to`, `excesses` as `QuotaExcess`, `revoked`) | a grant ended, was taken back or was replaced by another (`revoked`, `to` the new grant's plan); Notifications tells the owner what is over the limits of the plan it is on now (`plans.plan_grant_ended`), and Platform writes one that reached its end to its trail |

Both start a subscription, so the cached plan context is forgotten after the commit (`SubscriptionStarted`): features and
quotas see the new plan at once. `GET /me`, `GET /me/subscription`, `ReadsPlan` (`PlanSummary::$managedBy`, `$grantEndsAt`)
and Billing's `GET /billing` say `managedBy: "platform"` and `grantEndsAt` (null: no end).

## Trials

Two scheduled tasks look after trials, each entering every workspace with `RunAsTenant`, on one server and never
overlapping; both leave alone a subscription with a `stripe_subscription_id` (Stripe moves it):

- `plans:trial-reminders`, daily at 09:00 UTC: a trial with N days left (rounded up) is announced with the event
  `TrialEndingSoon` (`tenantId`, `subscriptionId`, `daysLeft`, `trialEndsAt`) at the smallest threshold of
  `plans.trial_reminder_days` (`[3, 1]`) that is N or more, once: `plan_trial_notices` (with row-level security) keeps one
  row per subscription and threshold. Notifications emails the owner (`plans.trial_ending`).
- `plans:end-trials`, hourly: a trial that ended becomes `active`, with a monthly period from the day it ended (reason
  `trial_ended`, audited and announced like any change). What makes it due (trialing, no `stripe_subscription_id`, its end
  come) is checked again with the row locked, so a subscription Billing wrote in between is left as Billing wrote it.

A workspace that fails is reported, and the others go on.

## Reports across workspaces

`php artisan plans:subscriptions` prints how many workspaces are on each plan, by status (live subscriptions only). It is
a read across workspaces (`Actions\CountSubscriptions`, through `Tenancy\Platform\ReadsAcrossWorkspaces`), so it runs as
the platform's read-only role, needs `DB_PLATFORM_USERNAME`, and is logged in `platform_reads` with the purpose
`plans.subscriptions_report`. See [the platform context](../concepts/multi-tenancy.md#the-platform-context).

Another package asks for the same counts through `Contracts\ReportsSubscriptions::counts()`: a list of
`{plan, status, total}` (the plan's slug), by tier and status, with the same read and the same log entry. Platform's
overview and plans screens use it.

## The plan context

Other packages read the plan through `Contracts\ReadsPlan::summary($tenantId)`, as the workspace: a `PlanSummary` with
the plan's `slug`, its `names` by language, its `tier`, the subscription's `status`, its `trialEndsAt` and
`currentPeriodEnd` (UTC, ISO 8601, or null) and `stripeSubscriptionId` (null while the kit moves it), from the cached
context below.

`Context\PlanContextResolver::for($tenantId)` says what a workspace's plan gives it now: the plan (slug, tier, names,
prices, trial days), the subscription's id, status and dates, whether Stripe moves it, the features it includes and a
limit for every registered resource. It is read as that workspace only (a `LogicException` otherwise: under row-level
security another one would find no subscription, and that would be cached).

- A feature the plan lists that no package registers is left out; a registered resource with no limit written for the
  plan (a module installed since the last `plans:sync`) is limited to 0, with a warning in the log, until `plans:sync`
  writes one, on retired plans too.
- A workspace with no subscription is treated as on the default plan, with `status` null and a warning in the log.
- It is cached for `PLANS_CACHE_TTL` seconds under a key with two generations: the workspace's, moved on after the commit
  of every `SubscriptionStarted`, `SubscriptionStatusChanged` and `SubscriptionPlanChanged` (`Listeners\ForgetPlanContext`)
  and of every update `AppliesBilling` writes, a renewal's new period or a trial's new end alone included, and the catalog's, moved on by every `plans:sync`. A change made straight in the database shows after the TTL, or after
  `PlanContextResolver::forget($tenantId)`. A context read inside a transaction is kept only once that transaction
  commits: one that is undone leaves nothing behind in the cache.

## What a package that sells plans reads

Billing (and any package of yours that sells plans) reads the catalog and asks whether a workspace may move to a plan
through two contracts:

- `Contracts\ReadsCatalog`: `offers()`, the available plans by tier; `find($slug)`, any written plan (a retired one
  included); `defaultPlan()`; `features()` and `resources()`, what the installed packages register, with their label keys.
  Global.
- `Contracts\PlanEligibility`, as the workspace: `excesses($tenantId, $plan)` lists a `QuotaExcess` (`resource`,
  `labelKey`, `limit`, `used`) for every resource counted over `total` that the workspace has more of than the plan allows,
  counted now. A `monthly` resource starts again every month, so it never stands in the way of a plan. `hadTrial($tenantId)`
  says whether any subscription the workspace ever had was a trial.

## Features

A feature is off unless the workspace's plan lists it and a package registers it.

- The `feature.enabled:<slug>` middleware, after `workspace` (and `permission:`), lets a request through when the plan of
  its workspace includes the feature, and answers 403 `plans.feature_not_included` otherwise, with `meta.feature`,
  `meta.plan` (the slug) and `meta.upgradeAvailable` (whether an available plan of a higher tier includes it). The
  message names the feature in the language of the request. A route that names a feature nobody registers fails with a
  500.
- `Contracts\ChecksFeatures::allows($tenantId, $feature)`, as the workspace, answers the same for code that decides by
  itself.

The kernel registers no feature, and the menu shows an entry with a `featureFlag` as it is: the flag is not checked
against the plan there yet.

## Quotas

`Contracts\EnforcesQuotas::ensureCanCreate($tenantId, $resource, $adding = 1)` refuses to let a workspace have more of a
resource than its plan allows. It is called inside the transaction that creates, before the insert, as the workspace:

- it takes a lock on the workspace's resource (`TransactionLock`, `plans:quota:<tenant>:<resource>`) until that
  transaction ends, so two creations at once take turns and the second counts the first; outside a transaction it
  throws;
- the transaction must be `READ COMMITTED`, Postgres's default, or it throws a `LogicException`: a `REPEATABLE READ` or
  `SERIALIZABLE` one keeps the snapshot it took before it waited for the lock, so it would not count what the first
  creation committed, and the limit could be passed;
- `$adding` is at least 1 (an `InvalidArgumentException` otherwise);
- the limit comes from the plan context, the use from the resource's counter, counted live over its period: everything
  (`total`) or the calendar month in UTC (`monthly`);
- while the workspace is set to move down to another plan at the end of its period (a provider tagged
  `plans.scheduled_plans`, `Contracts\ScheduledPlanLimits::scheduledPlan($tenantId)`, says which: Billing's Subscription
  Schedules), the lower limit of the two holds, so it never creates what the plan it moves to would not allow;
- over the limit it answers 422 `plans.quota_exceeded`, with `meta.resource`, `meta.limit`, `meta.used`, `meta.plan`,
  `meta.upgradeAvailable` and `meta.scheduledPlan`: the plan it moves down to when that plan's lower limit is the one
  reached (the message then says to keep the current plan), null otherwise. A resource no plan limits (`null`) is never
  refused;
- only creating is refused: after a downgrade, what a workspace has over its limit stays. A cancellation back to the
  default plan is not a scheduled move down: nothing is held back before it, and what is over the default plan's limits
  when the workspace gets there is kept;
- `hold($tenantId, $resource)` takes the same lock and asks for nothing, for a change that moves what is counted from one
  kind to another (an invitation that becomes a member): a count under the lock sees all of it or none. Take it after your
  own row locks, as `ensureCanCreate` is;
- the creation that fills the limit (the use reaches it exactly) announces `Events\QuotaLimitReached` (`tenantId`,
  `resource`, `labelKey`, `limit`, `used`) once its transaction commits. One that rolls back, one refused and a resource
  with no limit announce nothing. Notifications tells the owner (`plans.limit_reached`).

The kernel's `members` counts active memberships and the places packages hold for people who are not members yet
(`MemberSeats`). Team calls `ensureCanCreate` for it when it invites, resends an expired invitation or reactivates a
member; accepting an invitation adds nothing, since its place was already held, and takes the lock with `hold()`. The owner who creates a workspace is
never counted against anything.

### Reading a quota

`Contracts\ReadsQuotas::standing($tenantId, $resource)` returns a `Contracts\QuotaStanding`: `resource`, `limit` (null
for none), `used` and `scheduledPlan`, with `isFull()`. The limit is the one `ensureCanCreate` holds (the lower of the
plan's and that of a plan it is set to move down to, which `scheduledPlan` names). It locks nothing and only informs, for
a screen that warns before someone fills a form (Team's Invite button) to people who may not see the subscription:
creating still goes through `ensureCanCreate`. A resource no package registers throws `InvalidPlansRegistry`. Ask it as
the workspace.

## API

### The plan in `GET /me`

Every member gets the workspace's plan in `/me`, from the cached plan context, for the screens to gate actions and show
the past-due banner:

```json
"plan": {
  "slug": "pro",
  "name": "Pro",
  "tier": 1,
  "status": "trialing",
  "managedBy": "kit",
  "trialEndsAt": "2026-06-30T12:00:00Z",
  "currentPeriodEnd": "2026-06-30T12:00:00Z",
  "features": ["clients_import", "clients_portal"],
  "quotas": { "members": { "limit": 20 }, "email_sends_per_month": { "limit": 5000 }, "branches": { "limit": 5 }, "clients": { "limit": 5000 } }
}
```

`name` is in the language of the request; `status` is `trialing`, `active`, `past_due`, `cancelled`, or null for a
workspace with no subscription; `managedBy` is `stripe` once Billing moves the subscription, `platform` for a plan the
platform gave, else `kit`; dates are UTC
ISO 8601; every registered resource has its `limit`, `null` for none. The use of each quota is not in `/me`.

### `GET /me/subscription`

For a member with `subscription.view` (403 `auth.forbidden` otherwise): the whole subscription, with labels in the
language of the request and what the workspace uses of each quota, counted live (never cached).

```json
{
  "plan": { "slug": "pro", "name": "Pro", "description": "For a growing team.", "tier": 1 },
  "status": "active",
  "managedBy": "kit",
  "grantEndsAt": null,
  "trialEndsAt": null,
  "currentPeriodStart": "2026-06-01T12:00:00Z",
  "currentPeriodEnd": "2026-07-01T12:00:00Z",
  "features": [{ "slug": "reports", "label": "Reports", "description": null }],
  "quotas": [
    { "resource": "members", "label": "Members", "description": "People with an active place in the workspace, and the places held for them (pending invitations).", "period": "total", "limit": 20, "used": 2 }
  ]
}
```

`features` lists only those the plan includes; `quotas` lists every registered resource, in its order.

## Configuration

The catalog of plans is the app's, in `backend/config/plans.php` (see above).

| Key | Default | Meaning |
| --- | ------- | ------- |
| `plans.cache_ttl_seconds` | 3600 (`PLANS_CACHE_TTL`) | seconds a workspace's plan context is kept. A change made through the app forgets it at once; this is how long a change made straight in the database takes to show. |
| `plans.trial_reminder_days` | `[3, 1]` | days before a trial ends on which the workspace is reminded, once for each |

## The `plans` layer

`frontend/layers/plans` shows the plan to the people of the workspace.

- **The plan of the session.** Its plugin `plans-session.ts` reads `plan` from `GET /me` (`kit:session:me`) into core's
  `usePlanContext()` with core's `readPlanContext()`: each quota's limit, its use unknown. Ending the session empties it
  (`clearSessionState()`).
- **The use, for the gates.** Core's `usePlanGate()` asks for what the workspace uses of each quota when a gate on a
  limited quota needs it (`kit:plan:load-usage`). The plugin `plan-usage.ts` answers only for someone with
  `subscription.view`: it loads `GET /me/subscription` once for every gate that asks meanwhile (the `planUsage` store) and
  adds the counts to the plan context (`withUsage()`). For anyone else the use stays unknown and the gates stay open; the
  API refuses either way. A load still on its way when the session ends is dropped. See
  [Gating an action by plan](../frontend.md#gating-an-action-by-plan).
- **The Subscription page**, `/dashboard/subscription` (`subscription.view`; anyone else goes to `/dashboard`), from the
  menu's entry. It shows the page header with its breadcrumb, then three cards from `GET /me/subscription`:
  - the plan, in one compact row: its name, a badge with its status (Trial, Active, Payment due, Cancelled; "No
    subscription yet" without one), its description and "Billed through Stripe." once Billing moves it at the left; when
    the trial ends (while it is one) and when the current period ends at the right, as dates in the screen's language. A
    plan the platform gave carries a "From the platform" badge and says nothing is billed, and no plan bought or changed,
    while it lasts, with "Given
    until" (or "No end date") in place of the period;
  - the limits: each registered resource with its label and description, "Counted this month." for a monthly one, and
    "18 of 20" with a bar that turns amber from 70% and red from 90% (a limit of 0 is full), or "Unlimited" with no bar;
  - the included features, as badges, or a line saying the plan includes none.

  The labels and descriptions come from the API, so the page asks again when the language changes. What it counts also
  goes to the plan context, for the gates. It edits nothing, so it has no action bar.

  Under the plan's card it draws the sections other layers push through core's `kit:subscription:sections` (the billing
  layer's plans and payments). It asks for the subscription again when the plan of the session changes (its slug, its
  status or who moves it).
- **The past-due banner.** While the subscription's status is `past_due`, every screen of the dashboard shows a warning
  banner above the page (`PastDueBanner`, pushed through core's `kit:dashboard:banners` by the plugin
  `dashboard-banners.ts`) to every member: the last payment did not go through. Whoever holds `subscription.view` also
  gets a "See the subscription" link to the Subscription page; Billing adds the way to pay. It cannot be closed: it goes
  when the status does, the next time the session loads `/me`. The status does not block anything else in this version.
