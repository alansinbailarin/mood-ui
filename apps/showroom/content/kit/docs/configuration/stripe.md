# Stripe

Billing takes payments through [Stripe Billing](https://docs.stripe.com/billing): Stripe's hosted Checkout to subscribe,
its Customer Portal for the card, the invoices and cancelling, and a webhook that keeps each workspace's plan in line with
Stripe. Until you set the keys below, billing is off and the kit runs without it: the Subscription page lists the plans and
says payments are not set up yet. What the package does is in [Billing](../packages/billing.md).

## What you set

| Variable | Where it comes from |
| -------- | ------------------- |
| `STRIPE_SECRET` | Developers → API keys → Secret key (`sk_test_...` in a sandbox, `sk_live_...` in production). A restricted key (`rk_...`) works if it may write Customers, Checkout Sessions, Customer Portal sessions, Subscriptions, Subscription Schedules, Products and Prices |
| `STRIPE_BILLING_WEBHOOK_SECRET` | the signing secret (`whsec_...`) of the webhook endpoint below, or the one `stripe listen` prints |
| `STRIPE_LOOKUP_PREFIX` | optional, `mood_kit` by default: what the ids of the products and the lookup keys of the prices begin with. Give each installation that shares a Stripe account its own |

Put them in the root `.env` (locally) or in your host's environment (production). Never commit them. After changing them,
`php artisan config:clear` if you cached the config.

## 1. A sandbox

Try everything in a sandbox first: in Stripe's dashboard, open the account menu → **Sandboxes** → **Create**. A sandbox is
a separate account with test keys and test cards; nothing in it is ever charged. Copy its secret key into `STRIPE_SECRET`.

## 2. The products and prices

The prices are the ones of `backend/config/plans.php` (`prices.monthly` and `prices.yearly`, in cents of `currency`). Write
the catalog, then offer it on Stripe:

```bash
cd backend
php artisan plans:sync
php artisan billing:sync-plans --dry-run   # says what it would create, without calling Stripe
php artisan billing:sync-plans
```

You get a Product per plan with a price (`mood_kit_pro`) and a Price per billing period (lookup key `mood_kit_pro_month`):
check them in **Product catalog**. Run it again after you change a price in the catalog (after `plans:sync`): it makes the
new Price and stops offering the old one, whose subscribers stay on it until they change plans. A price you take away (an amount set
to 0 or null, or a plan no longer `available`) stops being offered too, and its subscribers stay on it. It never runs by itself. With
a live key it asks for `--live`.

A plan is sold only at the catalog's price: between `plans:sync` and `billing:sync-plans`, a period whose price changed is
not offered (checkout and plan changes answer `billing.plan_not_offered`), so run the two one after the other. A price the
super admin changes in the plan editor is offered on Stripe from the editor itself, for that plan alone.

### Changing a price from the admin

The plan editor saves first and offers on Stripe after (see
[Saving a plan](../packages/platform.md#saving-a-plan)):

1. The plan is saved in the database, with its revision, and committed.
2. When a price, the currency or whether the plan is on sale changed, its prices are offered on Stripe for that plan alone,
   the way `billing:sync-plans` does it (a new Price, the lookup key moved to it, the old one no longer offered).
3. If Stripe fails, the plan stays saved and its period is not sold meanwhile: the editor says so and offers to try again
   (`POST /platform/plans/{plan}/prices`). Stripe's idempotency keys make the retry safe.

Without Stripe set up the plan is saved all the same, and its prices wait for `billing:sync-plans` once it is. Prices of the
config (`backend/config/plans.php`) still go through `plans:sync` and `billing:sync-plans`.

## 3. The webhook endpoint

**Developers → Webhooks → Add destination**:

- events from **Your account**;
- API version **2026-08-26.dahlia** (the one the kit pins, `billing.stripe_api_version`);
- endpoint URL: `https://<the host of APP_URL>/api/v1/webhooks/billing/stripe`;
- events:
  - `checkout.session.completed`
  - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`,
    `customer.subscription.paused`, `customer.subscription.resumed`
  - `invoice.paid`, `invoice.payment_failed`

Then reveal its **signing secret** and put it in `STRIPE_BILLING_WEBHOOK_SECRET`. The endpoint must be reachable from the
internet without a session: a request Stripe did not sign with that secret is refused (400 `billing.webhook_refused`).

## The Customer Portal

**Settings → Billing → Customer portal** (once in the sandbox and once in live mode):

- turn on **Payment methods** (update), **Invoice history** and **Cancel subscriptions**, with cancellation **at the end of
  the billing period** (the kit shows it as cancelled until then, and lets the owner keep the subscription);
- turn **off** **Subscriptions → Switch plans**: the Subscription page changes plans itself, with the guard that keeps a
  workspace from moving to a plan smaller than what it uses. If you leave it on, a change made in the portal still reaches
  the app through the webhook, without that guard;
- fill in your business information, terms and privacy links; the kit passes its own return address.

## 4. Testing locally with the Stripe CLI

Stripe cannot reach `localhost`, so forward the events with the [Stripe CLI](https://docs.stripe.com/stripe-cli):

```bash
stripe login
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/billing/stripe \
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,invoice.paid,invoice.payment_failed
```

It prints a signing secret of its own (`whsec_...`): put that one in `STRIPE_BILLING_WEBHOOK_SECRET` while you test locally,
and run `php artisan serve`, `php artisan queue:work` and the frontend. Then, as the owner of a workspace, open
**Subscription** and choose a plan. Cards for the sandbox:

| Card | Does |
| ---- | ---- |
| `4242 4242 4242 4242` | pays |
| `4000 0025 0000 3155` | asks for 3D Secure first |
| `4000 0000 0000 0341` | saves, then every charge fails: the subscription goes past due |

Any future date, any CVC and any postal code. `stripe trigger` makes objects without the kit's `tenant_id`, so the app logs
those events as ignored: test with real checkouts instead. To see a renewal, a failed payment or a trial ending without
waiting, use a **test clock** (**Billing → Test clocks**) on a customer the kit made.

## 5. Going live

1. Activate your Stripe account (business details, bank account), and set **Settings → Business → Public details** (the
   statement descriptor) and **Settings → Billing → Customer emails** (receipts, failed payments).
2. Put the live secret key in production's `STRIPE_SECRET`.
3. Run `php artisan billing:sync-plans --live` once, from the production environment.
4. Add the live webhook endpoint (step 3, in live mode) and put its signing secret in `STRIPE_BILLING_WEBHOOK_SECRET`.
5. Configure the Customer Portal in live mode.
6. Buy your own cheapest plan with a real card, check the workspace's plan, and refund it from the dashboard.

Never let a sandbox's ids reach the live database: start production from a database that never ran against a sandbox key,
or empty `billing_customers` and `billing_subscriptions` before you switch keys (`billing:sync-plans --live` replaces the
sandbox's prices by itself). Live Stripe has none of the sandbox's customers, so the kit would replace each one at
the workspace's next checkout or portal visit (audited `billing.customer.replaced`), and a sandbox subscription would never
sync again.

Closing a workspace from the admin host cancels its subscription at once and without proration, so Stripe sends no final
invoice and refunds nothing: refund what you owe from Stripe's dashboard.

Taxes and invoices: the kit does not turn on Stripe Tax. If you need it, enable it in Stripe and in Checkout; the kit's
amounts are the catalog's.

## When something is off

| You see | Why |
| ------- | --- |
| 400 `billing.webhook_refused` in Stripe's delivery log | the endpoint's secret and `STRIPE_BILLING_WEBHOOK_SECRET` differ (the CLI's secret is not the dashboard endpoint's), or the server's clock is more than five minutes off |
| 503 `billing.not_configured` | `STRIPE_SECRET` or `STRIPE_BILLING_WEBHOOK_SECRET` is empty (or the config is cached from before) |
| 422 `billing.plan_not_offered` | `billing:sync-plans` has not run since the plan got that price, or the plan editor could not offer the price the super admin set (offer it again from the editor) |
| events logged as `ignored` in `billing_webhook_events` | the subscription was not made by the kit (no `tenant_id` in its metadata or its customer's), or its price belongs to no plan |
| a `billing.subscription.conflict` audit entry, or "pays for two Stripe subscriptions at once" in Sentry | the workspace pays for two subscriptions. The kit leaves both alone. In Stripe's dashboard, open the customer, cancel the subscription the workspace should not have (with a prorated refund if it was charged), and keep the other: if you cancel the one the workspace is on, it moves onto the other one by itself |
| a plan change that does not show | Stripe left it waiting for a payment (`payment_pending`): the owner pays the open invoice, and the webhook applies it |
