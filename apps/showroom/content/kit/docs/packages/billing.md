# Billing

`backend/packages/Billing`, namespace `MoodKit\Billing\`. A workspace pays for its plan through Stripe Billing: Stripe's
hosted Checkout to subscribe, plan changes (an upgrade at once and prorated, a downgrade at the end of the period),
Stripe's Customer Portal for the card, the invoices and cancelling, and a signed webhook that keeps the workspace's plan in
line with Stripe. Plans keeps the subscription a workspace is on; Billing tells it what Stripe says. With no Stripe key
the kit runs as if Billing were not installed. To set Stripe up, see [Stripe](../configuration/stripe.md).

Stripe Connect (taking payments on a workspace's behalf) is not this package: it comes as its own optional package.

## Permissions

| Permission | Lets a member |
| ---------- | ------------- |
| `billing.manage` (module `billing`) | subscribe, change or cancel the plan, and open Stripe's billing portal |

It is the owner's alone (owner-critical) and needs `subscription.view`. A manager sees the plans and their prices on the
Subscription page, without the buttons. On an installation that already has workspaces, run `php artisan rbac:sync` after
the deploy that brings this package.

An impersonation cannot pay, change the plan or open the portal: `POST /billing/checkout`, `/billing/checkout/confirm`,
`/billing/subscription/change` and `/billing/portal` take `not-impersonating` and answer 403 `auth.impersonation_forbidden`
to a super admin acting as the owner (see [Auth](auth.md#impersonation)).

## Configuration

How to get each value, and how to set Stripe up: [Stripe](../configuration/stripe.md).

| Key | Env | Default | |
| --- | --- | ------- | - |
| `billing.stripe_secret` | `STRIPE_SECRET` | empty | Stripe's secret key. Empty: billing is off |
| `billing.stripe_webhook_secret` | `STRIPE_BILLING_WEBHOOK_SECRET` | empty | the signing secret of the billing webhook endpoint |
| `billing.stripe_lookup_prefix` | `STRIPE_LOOKUP_PREFIX` | `mood_kit` | what the ids of the products and the lookup keys of the prices begin with |
| `billing.stripe_api_version` | | `2026-08-26.dahlia` | the API version every call asks for; the webhook endpoint must use it too |
| `billing.webhook_tolerance_seconds` | | 300 | how old a webhook's signature may be; 0 or less is taken as 300, so the check of a replayed delivery is never off |
| `billing.webhook_requests_per_minute` | | 300 | requests to the webhook from one address it may refuse in a minute (the `billing-webhook` limiter); signed ones are never counted |
| `billing.stripe_timeout_seconds` | | 10 | how long a call to Stripe may take to answer |
| `billing.stripe_connect_timeout_seconds` | | 5 | how long a call to Stripe may take to connect |
| `billing.lock_timeout_seconds` | | 15 | how long a transaction that takes a billing lock waits for any lock (Postgres's `lock_timeout`); 0 waits as long as it takes |
| `billing.changes_per_minute` | | 10 | checkouts, plan changes, confirmations and portal sessions one member may start in a minute (the `billing` limiter) |

## Stripe

Every call goes through `Stripe\StripeConnection`, with the one `Stripe\StripeClient` the container builds from
`STRIPE_SECRET`, on the API version `billing.stripe_api_version` pins (the version `stripe/stripe-php` v21 is written
for). With no key, every call answers 503 `billing.not_configured`. Whatever the SDK fails with (what Stripe refuses or
fails to answer, an answer it cannot read, a call it will not make: any `Stripe\Exception\ExceptionInterface`) becomes 502
`billing.stripe_unavailable`, and the failure goes to Sentry with any address in its message hidden (`MaskedFailure`).

A billing lock (a workspace's checkouts, its plan changes, a subscription's sync, its customer) is held across calls to
Stripe, so both are bounded: a call gives up after `billing.stripe_timeout_seconds` (`stripe_connect_timeout_seconds` to
connect), set on the SDK's HTTP client, which is global; and a transaction that takes a billing lock (`Locks\BillingLock`)
waits at most `billing.lock_timeout_seconds` for any lock, then fails (500) instead of piling up behind a slow call. A
webhook that fails that way is retried by Stripe.

In Billing's tests nothing reaches Stripe: `tests/Support/stripe.php` binds a Mockery `StripeClient` whose services each
test programs (`fakeStripe()`), with made-up keys and an API address that answers nothing, and builds Stripe's objects in
the shape of the pinned version (`stripeSubscription()`, `stripeSession()`, `stripeInvoice()`). No test needs a key.

`Stripe\StripeSubscriptionReader` is the one place that knows the shapes of Stripe's objects: since 2025 a subscription's
period lives on its item and an invoice names its subscription under `parent.subscription_details`, and it reads the older
shapes too. Stripe's statuses map to the kit's (`Stripe\StripeStatus`):

| Stripe | The workspace's subscription |
| ------ | ---------------------------- |
| `trialing` | `trialing` |
| `active` | `active` |
| `past_due`, `unpaid`, `paused` | `past_due` (a payment is waited for; Notifications emails the owner) |
| `incomplete` | nothing changes: the first payment has not gone through |
| `canceled`, `incomplete_expired` | over: the workspace goes back to the default plan |

## Tables

| Table | Holds | Who writes it |
| ----- | ----- | ------------- |
| `billing_prices` | the Stripe price of each plan and billing period (`month`, `year`), active or not; global | `billing:sync-plans`, as the schema owner, and the super admin's plan editor when it offers a plan's prices, as the catalog's writer (it adds a price and marks one no longer offered, never deletes one): the app only reads it |
| `billing_customers` | each workspace's Stripe customer, whether it had its trial on Stripe, its open Checkout session; row-level security | the app |
| `billing_subscriptions` | a mirror of each Stripe subscription: status, price, plan, period, when it ends, the change scheduled for the end of the period; row-level security | the app |
| `billing_webhook_events` | the Stripe events the webhook took, by handler and event id, with their outcome; global | the app only adds to it |

The plan a workspace is on stays Plans' (`tenant_subscriptions`); these tables are what Billing knows of Stripe.

## Prices

The prices are the catalog's (`backend/config/plans.php`: `prices.monthly`, `prices.yearly`, `currency`).
`php artisan billing:sync-plans` offers them on Stripe:

- a Product per available plan with a price, whose id is `<STRIPE_LOOKUP_PREFIX>_<slug>` (`mood_kit_pro`), named as the plan
  in the app's language;
- a Price per billing period whose price is above 0, found by its lookup key `<prefix>_<slug>_<month|year>`
  (`mood_kit_pro_month`). A plan with a price of 0 or null in a period is not offered for it (Free is offered for none).

It is idempotent: a Price that matches is kept. When an amount, a currency or a period changes, it makes a new Price, moves
the lookup key to it and stops offering the old one; whoever is subscribed to the old one stays on it until they change
plans, as Stripe does. A price of a plan and period the catalog no longer sells (its amount set to 0 or null, or the plan
no longer `available`) stops being offered the same way, on Stripe and in `billing_prices`; its subscribers stay on it. The
prices go to `billing_prices`, written as the schema owner (run it with `DB_MIGRATION_USERNAME` set, like `plans:sync`).

A plan is sold only at the price the catalog has (`Prices\PriceBook`). A period is sold only when the plan is `available`
and its active row of `billing_prices` has the catalog's amount and currency. Otherwise a checkout or a plan change to it is
422 `billing.plan_not_offered`, and the pricing grid (`GET /billing`) shows it with `offered: false`. Nobody pays a price the
grid does not show. That happens:

- when the super admin changed a plan's price and Stripe does not have it yet (the editor offers it, and says when it could
  not);
- between `plans:sync` and `billing:sync-plans` when you change a price in `config/plans.php`. Run the two one after the
  other.

`PriceBook::pending($plan)` lists the periods (`month`, `year`) the catalog and `billing_prices` disagree on, without calling
Stripe: one the catalog sells (on sale, above 0) with no active price at its amount and currency, or one it does not sell
that still has an active price. The price a subscriber is on keeps naming its plan (`PriceBook::planOf()`), offered or not.

The super admin's plan editor offers one plan's prices from the admin through `Contracts\OffersPlanPrices` (Platform calls
it after it saves a plan). It is `billing:sync-plans` for that plan alone (`SyncStripePrices::forPlan()`): the same products,
lookup keys and idempotency keys, a new Price for a new amount with the lookup key moved to it, the old one no longer
offered, and every price of a plan off sale withdrawn. No other plan is read or touched. It writes `billing_prices` as the
catalog's writer (`DB_CATALOG_USERNAME`), not as the schema owner. A failure of Stripe, a Stripe not set up (it then calls
nothing) or another offer still running comes back in its answer instead of being thrown: what the admin saved stays saved,
the period is not sold meanwhile (above), and the admin offers it again from the editor.

One offer of prices runs at a time, the command's or the editor's: each holds the cache lock `billing:offer-prices` (`Locks\OfferLock`) while it
reads the catalog and calls Stripe (no database transaction stays open across those calls). It reads the catalog only
once it holds the lock, so an offer never undoes, with prices it read earlier, one it waited for. The lock is taken for one
step (two calls to Stripe at `billing.stripe_timeout_seconds` plus `billing.stripe_connect_timeout_seconds`, or a write at
`billing.lock_timeout_seconds`, whichever is longer) and renewed before each step, so it never lapses while a slow Stripe
answers; the cache store must be one whose locks can be renewed (redis, database, file or array). The editor waits 10
seconds for another offer; the command waits as long as an offer of one plan can take at Stripe's timeouts (twelve calls
and four writes: 4 minutes with the defaults), so an offer the admin makes while you run it never fails it. One that
cannot have the lock in time offers nothing: the editor answers it as a failure, and the command says "Another offer of
prices is running" and fails, as it does when its own lock lapsed and another offer took it. When an
offer is made again after one that failed halfway (the new Price made, the old one still offered on Stripe), it also stops
offering on Stripe every other price `billing_prices` still has active for that plan and period, so no old Price stays on
sale there. Last, it expires every open Checkout session at a price no longer offered (one per line, `Expired the open
checkout cs_... at price_..., no longer offered.`): see Checkout below.

Run it by hand, never on boot: after the first `plans:sync`, and again after you change a price in the catalog (run
`plans:sync` first). `--dry-run` says what it would do without calling Stripe; a live key (`sk_live_`, `rk_live_`) needs
`--live`, so a sandbox's products never end up in your live account by mistake, nor the other way round.

## Keeping in line with Stripe

Stripe is the truth. Every event of a subscription and every action of this package that changes one end in
`Actions\SyncStripeSubscription`, which reads the subscription from Stripe again, inside a lock of its own
(`billing:stripe-subscription:<id>`), and applies what Stripe has **now**:

- the workspace is the one the subscription's metadata names (`tenant_id`, which Checkout writes), else its customer's; the
  customer must be the workspace's (`billing_customers`), or the first it is given;
- the plan is the one the subscription's price belongs to (`billing_prices`, an older price included), else the one its
  metadata names;
- `AppliesBilling::apply()` moves the workspace's subscription in Plans (status, plan, period, trial); `canceled` and
  `incomplete_expired` go through `fallBack()`, back to the default plan, and send `Events\FellBackToDefaultPlan` (after the
  commit) with what the workspace has over the default plan's limits;
- `billing_subscriptions` keeps the mirror the pricing grid reads, and `billing_customers.trial_used_at` the trial.

Two deliveries at once take turns; one that arrives late reads the latest state; running it twice changes nothing. A
subscription of no workspace here, of another customer or on a price no plan has is left alone and logged.

A workspace can end up paying for two subscriptions at once (two checkouts paid one after the other, or one made in
Stripe's dashboard). The kit never cancels either: the workspace stays on the one it is on, and each sync of the other one
reports it to Sentry (masked) and audits `billing.subscription.conflict` (after: `stripeSubscriptionId`,
`stripeCustomerId`, `status`), so an operator decides which to keep ([Stripe](../configuration/stripe.md#when-something-is-off)).
When the one the workspace is on ends while the other is still live, the workspace moves onto the other one
(`AppliesBilling::takeOver()`), read again from Stripe under its own lock, instead of going back to the default plan.

Keep the catalog's default plan free (no price) when you take payments: it is the plan a workspace goes back to, active and
unpaid, when its subscription ends, and the plan the grid cancels to.

## The webhook

`POST /api/v1/webhooks/billing/stripe` is public: Stripe reports there what happened to the subscriptions. It believes
nothing before it checks the `Stripe-Signature` header against `STRIPE_BILLING_WEBHOOK_SECRET` (signed no more than
`billing.webhook_tolerance_seconds` ago); a request that fails that, or whose body is no Stripe event (not JSON, no `id` or
`type`), is 400 `billing.webhook_refused`, and with no secret set it answers 503 `billing.not_configured`. Its limiter (`billing-webhook`, per address) counts only the
requests it refuses, after it checks the signature (an HMAC, cheap): past `billing.webhook_requests_per_minute` refusals in a
minute an address gets 429, while a delivery Stripe signed is never counted nor held back, so a flood of unsigned requests
cannot delay Stripe's.

| Event | Becomes |
| ----- | ------- |
| `checkout.session.completed` | a sync of the subscription the checkout made |
| `customer.subscription.created`, `.updated`, `.deleted`, `.paused`, `.resumed` | a sync of that subscription |
| `invoice.paid`, `invoice.payment_failed` | a sync of the invoice's subscription: Stripe's status says `active` or `past_due` |
| anything else | nothing: 200, logged as ignored |

Each event is taken once: `billing_webhook_events` keeps it by handler and event id, with its outcome (`applied`, `ended`,
`pending`, `ignored`), so the same event again is answered 200 without reading anything. An event whose handling fails
(Stripe did not answer the read, say) is left out of the log and answered 5xx, so Stripe retries it, for up to three days. An
event of a subscription Stripe does not have (`resource_missing`: deleted with a sandbox's test data, or of another account
or mode) would fail the same way forever, so it is logged as `ignored`, with a warning in the log, and never retried.
The order deliveries arrive in does not matter: each reads the subscription as Stripe has it now.

Stripe's signature and the customer's details an invoice or a checkout carries (`customer_email`, `customer_details`,
`collected_information`, `custom_fields`, `hosted_invoice_url`...) are registered with Support, so they are blanked in what goes to Sentry.

## API

### `GET /billing`

For whoever holds `subscription.view`, labels in the language of the request:

```json
{
  "available": true,
  "plans": [
    {
      "slug": "pro", "name": "Pro", "description": "For a growing team.", "tier": 1, "isDefault": false, "trialDays": 14,
      "currency": "USD",
      "prices": { "month": { "amount": 2900, "offered": true }, "year": { "amount": 29000, "offered": true } },
      "features": [{ "slug": "reports", "label": "Reports" }],
      "quotas": [{ "resource": "members", "label": "Members", "period": "total", "limit": 20 }]
    }
  ],
  "subscription": {
    "plan": "pro", "tier": 1, "status": "active", "managedBy": "stripe", "grantEndsAt": null, "interval": "month",
    "currentPeriodEnd": "2026-07-01T12:00:00Z", "cancelAt": null,
    "scheduledChange": { "plan": "free", "interval": "month", "at": "2026-07-01T12:00:00Z" }
  },
  "hasCustomer": true,
  "trialAvailable": false
}
```

- `subscription.managedBy` is `kit`, `stripe`, or `platform` for a plan the platform gave with no charge, until
  `grantEndsAt` (null: no end; see [Plans](plans.md#plans-the-platform-gives)). While it lasts the grid offers nothing to
  buy or change: the plan given is the current one, and every other card's button is off ("When the given plan ends").
  The API refuses a checkout and a change of plan meanwhile with 409 `billing.plan_granted`; a checkout opened before the
  grant that is paid afterwards replaces the grant once Stripe's subscription starts.
- `available`: whether payments can be taken here (both Stripe secrets set). Without them the plans are still listed.
- `plans`: the available plans by tier, and the workspace's own plan when the super admin took it off sale (offered for no
  period: its subscriber may keep it, nobody may buy it). `prices.<period>` is the catalog's price in the smallest unit of
  `currency` (null for none; 0 is free) and whether Stripe offers it at that price (`billing:sync-plans`). `quotas` lists
  every registered resource (`limit` null is none).
- `subscription`: the plan the workspace is on now (Plans), who moves it (`kit` or `stripe`), and for a Stripe one its
  period, when it ends (`cancelAt`: cancelled at the end of the period) and the change scheduled for the end of the period.
- `trialAvailable`: whether a checkout may still give the plan's trial.

## Subscribing

`POST /api/v1/billing/checkout` (`billing.manage`, the `billing` limiter), with `{"plan": "pro", "interval": "month"}`
(`month` or `year`), answers `{"url": "https://checkout.stripe.com/..."}`: the page sends the person there.

- The plan must be available and offered on Stripe for that period at the catalog's price, or 422 `billing.plan_not_offered`
  (field `plan`).
- A workspace on a plan the platform gave buys nothing while the grant lasts: 409 `billing.plan_granted`.
- A workspace that already has a live Stripe subscription (in the app, or only in Stripe so far) changes its plan instead:
  409 `billing.already_subscribed`.
- The plan must fit what the workspace uses (every registered resource counted in `total`), or 422
  `billing.plan_too_small`, with `meta.excesses` (`resource`, `limit`, `used`) and each named in the message.
- One Stripe customer per workspace (`billing_customers`), named after the workspace, with the email of who pays and
  `metadata.tenant_id`. A customer Stripe no longer has (deleted in its dashboard, or a sandbox's id in a live database) never
  locks the workspace out: the first checkout or portal visit that finds it missing (`resource_missing`) gives the workspace a
  new customer, keeps the trial it had, and audits `billing.customer.replaced` (before and after: `stripeCustomerId`). Two checkouts of a workspace take turns (a lock per workspace), and the one it left open is expired
  before another one opens, so two tabs never leave two payable checkouts; Stripe is asked for a live subscription after
  that, so one paid for in the old checkout a moment ago is refused too.
- A Checkout session is payable for 31 minutes (`expires_at`: Stripe's least, 30, and a minute for the two clocks), and
  names the price it sells (`metadata.price_id`; the subscription's metadata does not have it). When an offer of prices
  (`billing:sync-plans`, or the plan editor's offer of one plan) stops offering a price, it expires every open session at
  it (`Prices\StaleCheckouts`), so nobody pays an old price in a checkout opened before the change; one paid a moment ago
  is left alone. Sessions at a price this app does not know (another app on the same Stripe account) are never touched.
- One trial per workspace, ever: a trial of the kit that is still running goes on to the end it has (if it is more than two
  days away, the least Checkout takes); otherwise the plan's `trial_days`, only if the workspace never had a trial, on
  Stripe or in the kit.
- The session and the subscription carry `metadata` `tenant_id`, `plan_slug` and `interval`. Stripe sends the person back
  to `/dashboard/subscription?checkout=done&session_id=...` (or `?checkout=cancelled`) on the workspace's address.
- Audited: `billing.checkout.started` (after: `plan`, `interval`, and the trial it gave).

Back from Stripe, the Subscription page confirms the checkout: `POST /api/v1/billing/checkout/confirm` (`billing.manage`)
with `{"sessionId": "cs_..."}` reads the session and, if it is complete, syncs its subscription at once, so the person sees
the plan they paid for without waiting for the webhook (which does the same; whichever comes second changes nothing). It
answers what `GET /billing` does, with `meta.checkout` (`complete`, `open` or `expired`). Only a checkout of this workspace
is taken: its metadata must name the workspace and it must be paid with the workspace's customer. Any other, or one Stripe
does not have, is 404 `billing.checkout_not_found`. A session that is done is forgotten only if it is the one the workspace has open: confirming an
older one leaves a newer open one remembered, so the next checkout still expires it.

## Changing the plan

`POST /api/v1/billing/subscription/change` (`billing.manage`, the `billing` limiter), with `{"plan": "...", "interval":
"month"}`, on a workspace that pays through Stripe (409 `billing.no_subscription` otherwise, and 409 `billing.plan_granted`
while it is on a plan the platform gave). What happens is decided by
data alone, never by a plan's slug:

| The plan chosen | What happens | `meta.change` |
| --------------- | ------------ | ------------- |
| the plan and period it is on (its price, or an older price of the plan it keeps) | whatever was scheduled is let go and a cancellation is undone, even while that period is not sold at the catalog's price or the plan is off sale | `kept`, or `unchanged` |
| the default plan, when it has no price above 0 for that period | the subscription ends at the end of the period (`cancel_at_period_end`); never held back by what the workspace has over the default plan's limits: it keeps it, and only creating more is refused. A default plan with a price is moved to like any other plan | `cancelling` |
| a higher tier, or the same plan from monthly to yearly | now, prorated and charged at once (`always_invoice`); the new plan takes only if the payment goes through (`pending_if_incomplete`) | `upgraded`, or `payment_pending` |
| anything else | at the end of the period, through a Subscription Schedule of two phases (the plan until then, the new one after); nothing is refunded | `scheduled` |

Up or down is decided from the price the subscription has in Stripe, read inside the lock (the plan it belongs to, an older
price included), never from the plan the app last heard of; the plan Plans has is used only for a price of no plan of the
catalog. A move to a plan off sale, or to a plan and period Stripe does not offer at the catalog's price, is 422
`billing.plan_not_offered`. A move up
or down must fit what the workspace uses (422 `billing.plan_too_small`, as for a checkout). Two changes of a
workspace at once take turns, and the second reads Stripe after the first. A change takes up to three calls to Stripe (let go of
a schedule or undo a cancellation, then make the change); if Stripe fails one halfway, what the calls before it undid is
put back (the cancellation set again, or the downgrade scheduled again, and a schedule made for nothing let go of), and the
answer is 502 `billing.stripe_unavailable`, so the subscription keeps what the owner had chosen before. If putting it back
fails too, it is logged as an error to check in Stripe's dashboard. Each change ends in a sync, so the answer (what
`GET /billing` says, with `meta.change`) already shows it; a scheduled change shows in `subscription.scheduledChange`.
While a move down is scheduled, creating something a plan limits respects the lower limit of the plan the workspace is on
and the one it moves to (Billing tags `Changes\ScheduledDowngrades`, Plans' `ScheduledPlanLimits`): a 422
`plans.quota_exceeded` then has `meta.scheduledPlan` and says to keep the current plan. The usage guard at the request still
checks what the workspace has; this keeps it from growing past the smaller plan before the move takes place. A cancellation
(`cancelling`) holds nothing back: what is over the default plan's limits is kept, and only creating more is refused once the
workspace is there.

Audited: `billing.subscription.change_requested` (before: `plan`; after: `plan`, `interval`, `change`).

## Notifications

| Event type | To | When |
| ---------- | -- | ---- |
| `billing.fell_back_to_default` | the owner (`role:owner`), not counted against the plan's emails | a Stripe subscription ended (cancelled, or its payments gave up) and the workspace went back to the default plan; it names the plan that ended, the default one and what the workspace has over its limits (`excess.summary`, "Members: 10 of 3") |

It goes by email and to the inbox (`in_app`), once per Stripe subscription, and never for a suspended workspace (one that is
closing is suspended too): nobody there can sign in to act on it. A payment that failed is Plans' notice
(`plans.past_due_entered`), sent when Stripe moves the subscription to `past_due`. Run `php artisan notifications:sync`
after the deploy that brings this package.

## Contracts for other packages

`Contracts\EndsWorkspaceBilling::end($tenantId, $reason)` stops billing a workspace that is closing (Platform's close
asks it). As that workspace and inside the caller's transaction, it takes the locks of the workspace's checkouts and plan
changes (one in flight finishes first, and none starts until the caller commits), and:

1. expires the Checkout session the workspace left open, so nobody pays for it once closed (one paid a moment ago shows in
   the next step);
2. reads from Stripe every subscription of the workspace, before it cancels any: the mirror's live ones, the one its plan
   names, and the live ones Stripe lists for its customer (a webhook may not have brought one yet). One Stripe no longer
   has is left out;
3. for each that Stripe still bills, lets go of a schedule, cancels at once with no proration and no final invoice
   (idempotency key `close:<workspace>:<subscription>`, audited `billing.subscription.cancelled` with the reason
   `workspace_closed`), and syncs it, so the workspace falls to the default plan.

It answers a `Contracts\BillingEnded`: `cancelled`, how many it cancelled, and `unfinished`. A workspace Stripe bills nothing
needs no Stripe key. A failure before any cancellation is thrown, 502 `billing.stripe_unavailable`, and the caller's
transaction rolls back with nothing changed in Stripe. A failure after the first cancellation is not thrown: it comes back
in `unfinished`, for the caller to commit what it did (Platform keeps the workspace closed) and answer the failure after
its commit, since rolling back would leave a workspace open without the subscription Stripe already cancelled. Asking again
cancels what is left, and so does the next sync of it. A refund is the operator's, in Stripe's dashboard.

`Contracts\AcceptsBilling::accepts($tenantId)` says whether a workspace may still be billed, asked as that workspace. Billing
says yes for every one; Platform binds its own, which says no for a workspace that is closing. A checkout that waited for a
close of its workspace is refused (403 `tenancy.suspended`), and a sync of a live subscription of a workspace that may not
be billed, or that is deleted, cancels it at once in Stripe as above (audited the same) and ends it: whatever a close
missed, or a payment of a checkout that was open, is stopped by its first webhook.

`Contracts\OffersPlanPrices` is for the super admin's plan editor in Platform and nobody else
(`tests/Architecture/CatalogWriterTest.php` lets only its implementation, `Prices\PlanPriceOffers`, write as the catalog's
writer):

- `configured()`: whether Stripe is set up here (the secret key and the webhook's secret);
- `standing($slug)`: where the plan's prices stand, from `billing_prices` alone (no call to Stripe);
- `offer($slug)`: offers the plan's prices on Stripe now, as the catalog has them, and says where they stand after.

Both answer a `Contracts\PlanPriceStanding`: `pending`, the periods (`month`, `year`) the catalog and Stripe disagree on
(none: `inLine()`), and `failed`, whether the attempt to offer them failed (Stripe did not answer or refused, or it is not
set up). `toArray()` is `{inLine, pending}`.

## The billing portal

`POST /api/v1/billing/portal` (`billing.manage`, the `billing` limiter) answers `{"url": "https://billing.stripe.com/..."}`:
Stripe's Customer Portal for the workspace's customer, to change the card, see the invoices and cancel, back to the
Subscription page. A workspace that never checked out has no customer: 409 `billing.no_customer`. What the portal offers is
set in Stripe's dashboard ([Stripe](../configuration/stripe.md#the-customer-portal)); whatever changes there reaches the app
through the webhook.

## The `billing` layer

`frontend/layers/billing` puts paying for the plan on the Subscription page, through core's `kit:subscription:sections`
(its plugin `subscription-sections.ts`), under the plan's card:

- **The header:** "Plans", a line saying payments go through Stripe (or that they are not set up yet), the change scheduled
  for the end of the period if there is one (with, for a move down, that nothing new may go past the lower plan's limits
  until then), and **Manage billing** (Stripe's billing portal) once the workspace has a Stripe customer.
- **The cancelled banner** (`CancelledBanner`, warning, its text and button in the same color): while the subscription is
  set to end, when it ends and which plan comes after, with **Keep the subscription** for whoever may pay.
- **The billing period** the prices are shown for, as two tabs of the `line` variant (Monthly, Yearly; at first the one
  the workspace pays for), with the pricing grid in their panel.
- **The pricing grid** (`PricingGrid`, a `PlanCard` per plan, as many columns as fit and one on a phone): the plans of
  `GET /billing` in the order of their tiers, each with its price for the period ("Free" for none), what it is, its trial
  while the workspace may have one, what it includes and its limits ("Members: 20", "Emails: 5,000 a month", "Unlimited"),
  all labelled by the API. The workspace's own plan is the raised card, with a "Current plan" badge. The button at the
  bottom of each card is decided by data (`utils/plan-choice.ts`, as the API decides): Start the trial or Choose this plan
  (Stripe's Checkout), Upgrade, Downgrade, Switch to this plan (the default one: cancel), Keep this plan, or the current or
  scheduled plan, disabled. Upgrading, downgrading and cancelling ask first, in a dialog of two actions that names the date
  a downgrade or a cancellation starts on (cancelling in the danger color); a downgrade's says that, from then on, nothing
  new may go past the lower plan's limits. A 422 `plans.quota_exceeded` anywhere shows the API's message, which names a
  scheduled lower plan (`meta.scheduledPlan`) when that is the limit reached. Someone without `billing.manage` sees the grid
  without buttons; while payments are not set up every button is disabled, with why in its tooltip.
- **A plan too small** (`PlanTooSmallDialog`): choosing a plan whose limits the workspace is over (what it uses, from the
  plan context the Subscription page loads, or the API's 422 `billing.plan_too_small`) opens a dialog with one action
  instead, which lists each resource over the limit: what the workspace uses, what the plan allows and how much is over.
  Nothing is sent and no toast shows. Cancelling is never blocked.
- **Back from Stripe's Checkout** (`?checkout=done&session_id=...`) the section cleans the address and confirms the checkout
  (`useCheckoutReturn`), and what shows follows the answer's `meta.checkout`: `complete` loads what changed and toasts that
  the payment was received; `open` (Stripe is still taking the payment) says so in a neutral toast and loads the billing
  again; `expired` warns that the checkout ended unpaid and nothing was charged. After every change it loads the session
  again (`kit:auth:refresh-session`), so the plan of the session, the Subscription page and the past-due banner follow. A
  409 (the subscription changed somewhere else) loads the billing again after its toast.
- While a super admin of the platform acts as a member (core's `useImpersonationGate()`), choosing a plan, the billing
  portal and keeping a cancelled subscription are disabled, with the tooltip "Off while impersonating": the API refuses
  them then (403 `auth.impersonation_forbidden`).
