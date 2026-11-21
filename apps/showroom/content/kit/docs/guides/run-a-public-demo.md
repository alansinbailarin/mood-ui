# Run a public demo

Demo mode turns an install of the kit into a demo anyone can try: every visitor signs in with the same shared accounts, nothing they
do can do harm, and the data is wiped and made again every day, dated from that day, so the dashboards never look stale. The kit's
own demo and a demo of your product on top of it run the same way.

It is off. Nothing turns it on but the word `true`: `DEMO_MODE=1`, `yes` or a typo leave it off.

## What you set

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `DEMO_MODE` | empty (off) | `true` turns the demo mode on. |
| `DEMO_PASSWORD` | `Demo-Password-2026` | the shared accounts' password. It is printed on the sign-in screens, so it is public by design: never reuse a real one. |
| `DEMO_RESET_AT` | `04:00` | the hour the data is reset each day, `H:i`. |
| `DEMO_TIMEZONE` | `America/Tijuana` | the time zone of that hour, and of the day the data is dated from. |

`support.demo.invite_domain` (`example.com`) and `support.demo.flags` (`['projects.enabled']`, the platform flags the reset turns on) are
in `backend/config/support.php`.

The shared accounts are `owner@demo.test`, the owner of the workspace `demo` and the platform's only super admin, and
`member@demo.test`, a member of it. Both are made by the reset, with the password above.

## What it does

- **Mail goes to the log.** The default mailer is forced to `log`, whatever `MAIL_MAILER` says, so a demo never mails anyone.
- **It will not start with a live Stripe key.** With any `STRIPE_*` variable or the configured secret holding an `sk_live_`, `pk_live_`
  or `rk_live_` key, the app stops at boot and names the setting. A demo uses Stripe's test keys, or none.
- **It locks what would do harm** (below), with a 403 `demo.locked` and a message in the visitor's language. The frontend shows it like
  any other error.
- **It resets itself every day** (below), and scheduled only while the mode is on.
- **The screens say so.** The dashboard and the admin carry a thin notice with the hour of the reset, and the sign-in screens of the
  demo workspace and of the admin print the shared account with a button that fills the form. All of it comes from the API
  (`demo` in `GET /tenant` and `GET /platform/public`, present only in a demo), and the password from config, never from the frontend.

## What it locks

Each lock is declared by the package that owns the action, and tested there. A locked action answers 403 `demo.locked`.

| What | Where | How |
| ---- | ----- | --- |
| Changing the password of a shared account, by the profile or by a reset link | Auth | `ChangePassword`, `ResetPassword`, `ReplacePassword` |
| Changing the email of a shared account | Auth | `RequestEmailChange` |
| Signing a shared account's other sessions out (`POST /me/sessions/revoke-others`, `DELETE /me/sessions/{session}`) | Auth | `RevokeOtherSessions`, `RevokeSession` |
| Removing or deactivating a shared account from the team | Team | `MemberTarget::forChange` |
| Changing a shared account's role (`PUT /users/{user}/role`) | Rbac | `AssignRole` |
| Inviting an address outside `@example.com`, by the team's page and its onboarding step | Team | `InviteMember` |
| Inviting an address outside `@example.com` to sign up, from the waitlist or not | Platform | `InviteToSignup` |
| Suspending or closing a workspace | Platform | the `demo-locked` route alias |
| Offering a plan's prices (`POST /platform/plans/{plan}/prices`) | Platform | the `demo-locked` route alias |
| Saving a plan with another price or another sale state (`PUT /platform/plans/{plan}`), the one path from the editor to Stripe | Platform | `SavePlan`, before anything is saved |
| Changing the access mode of signups (saving the mode it has is not a change) | Platform | `SavePlatformSettings` |
| Switching impersonation off | Platform | `SaveFlags` |
| Impersonating anyone but the shared accounts | Platform | `StartImpersonation` |
| Changing or cancelling the plan, and opening the billing portal | Billing | the `demo-locked` route alias |

**Capped, not locked**, per person and hour (`support.demo.caps`, answering 429 `http.too_many_requests` over it): uploads, which the
daily reset does not undo (`uploads`, 20: a profile photo, the workspace's logo, the public page's pictures, a clients CSV and the
platform's logo; the confirm step of a presigned upload is not counted, its presign is), and starting a Stripe Checkout (`checkout`, 5,
with test keys). The shared accounts are one person each, so the allowance is shared by every visitor. This is the `demo-capped:<bucket>`
route alias (`Http\Middleware\CapInDemo`).

**Deliberately left open**, because the reset undoes it or it costs nothing: everything not listed above. In particular roles and their
permissions (but not a shared account's role), clients (including erasing and importing), branches, settings, the public page, the
notification settings, adding other members with `@example.com` addresses and removing them, the workspace's other plans of the plan
editor (texts, trials, limits, features), granting a plan to a workspace, the flags (but not impersonation), the waitlist and the
platform's settings but the access mode. Resuming or reopening a workspace. Starting a Stripe Checkout, capped, with test keys.

Not locked because no HTTP route does it: the list of super admins (the `platform:*` commands write it), deleting a workspace for good
(`platform:delete-closed-workspaces`, a command), and the `kit:*` commands.

## The daily reset

`php artisan demo:reset` does, in order:

1. refuses unless `DEMO_MODE=true`, and unless it holds the lock `demo:reset` (never twice at once);
2. refuses a database it did not wipe itself. It wipes one with no tables, one the deploy just migrated that has no workspace, and one
   it wiped before (a table `demo_resets`, which it makes). Any other it refuses, so a real install that turned the mode on by mistake
   keeps its data. To hand it a database that holds something, run `php artisan demo:reset --adopt` and answer yes;
3. runs `migrate:fresh` as the schema owner (`DB_MIGRATION_USERNAME`). The kit refuses that command in production; this command allows it for
   its own call, and only in a demo;
4. runs what a deploy syncs: `rbac:sync`, `plans:sync`, `notifications:sync`;
5. runs `db:seed`, which in a demo makes the demo workspace and the shared accounts, **14 to 20 other workspaces** over the last 30 days with a
   subscription each (active, on trial, past due or cancelled), the workspace's clients (**60 to 75** over the last 90 days, with the trail
   dated the same), branches, a team, a public page, **14 to 22 people on the waitlist** over the last 30 days, the admin's bell, the
   platform closed to signups, the flags of `support.demo.flags` on (so Projects is visible) and whatever a module adds (below);
6. clears the cache.

If the reset fails, it runs the whole thing once more, and logs each failure at critical level (`demo:reset failed (attempt n of 2)`).
Before it wipes anything it writes a note to the cache, which the wipe does not reach, so a database a failed reset left half made (even
with no `demo_resets` table) is one the next reset may wipe. If both attempts fail the command exits 1 and the demo stays down until a
reset goes through: watch the log, and run `php artisan demo:reset` by hand. The scheduler tries again the next day on its own.

**The cache must not be the database.** The reset's lock and the scheduler's mutex live in the cache, and the wipe drops a database
cache's tables. With `DEMO_MODE=true` the app refuses to start with `CACHE_STORE=database`; use `redis` (the production stack's).
`cache:clear` flushes the whole cache database at the end, so give the demo a Redis of its own.

**Every date is counted back from now**, and what varies (which businesses, which names, which days) comes from a seed made of the day in
the demo's time zone and a name, so a day makes the same data wherever it runs and tomorrow makes other data. Write a seeder the same way:
`MoodKit\Support\Demo\DemoSeed` gives `randomizer($scope)`, `daysAgo()` and `at($moment, $callback)`, which stops the clock so that
everything the callback writes (timestamps, the audit trail) is dated then.

Not wiped: the files in the assets bucket (the old ones stay as orphans, `public-page:prune-media` does not see them: give the demo's
bucket a lifecycle rule that deletes objects after 2 days, for example S3's `Expiration` of 2 days on the whole bucket, or an R2 object lifecycle rule, since nothing
in the demo is meant to outlive a reset; the uploads are capped, above), the jobs waiting in the queue, and Stripe. A reset takes a few seconds, during which the demo is not usable.

## The schedule

While `DEMO_MODE=true` the scheduler runs `demo:reset` daily at `DEMO_RESET_AT` in `DEMO_TIMEZONE` (04:00 in Tijuana), on one server, never
over a run still going. With the mode off the task does not exist.

## On the production stack

The stack of `deploy/compose.yml` runs the scheduler inside the `backend` container with `APP_ROLE=all`, which is all a demo needs: add to
`deploy/.env`

```bash
DEMO_MODE=true
PLATFORM_BOOTSTRAP_ADMINS=owner@demo.test
MAIL_MAILER=log
# Stripe: leave empty, or test keys only.
```

and set the domain as for any install (`ROOT_DOMAIN=demo.example.com` gives the workspaces on `<slug>.demo.example.com` and the admin on
`admin.demo.example.com`). Start the stack: the deploy migrates the database. Make the first demo by hand, then let the scheduler do it:

```bash
docker compose exec backend php artisan demo:reset
```

(The database has no workspace yet, so it asks nothing.) A second backend container with `APP_ROLE=web` serves more visitors, while the
reset stays in the one with the scheduler. Keep `PLATFORM_ACCESS_MODE=closed` in the environment too: the reset also writes it.

## A module's demo data

A module that has data to show implements `MoodKit\Support\Demo\DemoDataProvider` (one method, `seed()`) and tags it `demo.data` from its
provider. It makes its rows through its own actions with every date counted from now. `Database\Seeders\DemoProjectsSeeder` (Projects' rows, kept in the app so the module's files stay what `kit:make-module` writes) shows what one makes.
`DatabaseSeeder` calls each in a demo only, after the kernel's seeders, so they find the workspace, its branches and its owner. It is a
class of `src/`, not a seeder, so the provider that tags it breaks no layer rule. Projects' own rows are the exception, kept in the app.

## A package with a dangerous action

A new package whose action would do harm in a demo declares its own lock, from its own routes or actions, and tests it:

- an action that is dangerous whatever its input: `->middleware('demo-locked')` on its route;
- an action dangerous for some input (an account, an address): `MoodKit\Support\Demo\DemoMode`, which gives `refuse()`,
  `refuseForAccount($email)`, `refuseForOthers($email)` and `refuseInviteTo($email)`, each a 403 `demo.locked` in a demo and nothing otherwise.

A module that calls Stripe, mails someone outside the workspace, or deletes what the reset cannot remake needs one. Tests turn the mode on
with `config(['support.demo.enabled' => true])`.
