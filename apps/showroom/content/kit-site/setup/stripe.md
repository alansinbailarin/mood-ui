# Stripe

Stripe Billing charges workspaces for their plan: checkout, plan changes, the Customer Portal and a webhook. With no `STRIPE_SECRET` billing is off and the kit runs without it. The reference is [Stripe](/kit/configuration/stripe) and [Billing](/kit/packages/billing).

## Local

1. In Stripe's dashboard create a sandbox and copy its secret key into `STRIPE_SECRET` (a `sk_test_` key).
2. Write the catalog and offer it on Stripe:

```bash
cd backend
php artisan plans:sync
php artisan billing:sync-plans --dry-run
php artisan billing:sync-plans
```

3. Stripe cannot reach `localhost`. Forward events with the Stripe CLI, and copy the `whsec_` secret it prints into `STRIPE_BILLING_WEBHOOK_SECRET`:

```bash
stripe login
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/billing/stripe
```

4. Run `php artisan serve`, `php artisan queue:work` and the frontend, sign in as an owner, open Subscription and pay with `4242 4242 4242 4242`.

## Production

1. Activate the Stripe account (business details, bank account) and set the statement descriptor and customer emails.
2. Put the live secret key in `STRIPE_SECRET`.
3. Run `php artisan billing:sync-plans --live` once, from the production environment.
4. Add the live webhook endpoint at `https://<APP_URL host>/api/v1/webhooks/billing/stripe` with the events the kit's Stripe page lists, and put its signing secret in `STRIPE_BILLING_WEBHOOK_SECRET`.
5. Configure the Customer Portal in live mode.
6. Buy your cheapest plan with a real card, check the workspace's plan, and refund it.
7. Never let a sandbox's ids reach the live database: start production from a database that never ran against a sandbox key.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
