# Getting started

This guide takes a fresh clone to a running kit on your machine: the API, the frontend, a queue worker and
the scheduler, with Postgres, Redis, Mailpit and MinIO in Docker. At the end you sign in to the demo
workspace and create a second workspace through signup.

It takes about 15 minutes, most of it installing dependencies.

## Requirements

| Tool           | Version                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| Node           | `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0`. `.nvmrc` pins 24. Installs fail on any other version. |
| pnpm           | 10. The repo pins `pnpm@10.33.0`, which `corepack enable` picks up.      |
| PHP            | `^8.4` with `pdo_pgsql`, `redis`, `gd` (with WEBP) and `pcov`; `pcntl` and `posix` for the queue worker |
| Composer       | 2                                                                       |
| Docker         | with Compose v2                                                         |
| gitleaks       | optional. The pre-commit hook skips the secret scan without it; CI scans the full history either way. |

`pcov` is how `composer check` measures coverage. `pcntl` and `posix` are not needed to install or test the
kit, but `php artisan queue:work` uses them to stop a job that outlives its timeout and to shut down cleanly,
so have them wherever a worker runs. Check the PHP extensions with:

```bash
php -m | grep -E "pcov|pdo_pgsql|redis|gd|pcntl|posix"
```

All six names should print.

## 1. Clone and create the `.env`

```bash
git clone <repository-url> mood-kit
cd mood-kit
cp .env.example .env
```

`<repository-url>` is the private repository you were invited to.

The root `.env` is the only env file. Docker Compose, Laravel and Nuxt all read it, and its defaults work
locally as they are. See [The `.env` file](configuration/environment.md) for what each setting does.

## 2. Start the services

```bash
docker compose up -d --wait
```

`--wait` returns once Postgres, Redis, Mailpit and MinIO all report healthy. On the first boot of
an empty Postgres volume, `scripts/postgres-init` creates the role the app connects as (`DB_USERNAME`), the
schema owner the migrations run as (`DB_MIGRATION_USERNAME`), the platform's read-only role (`DB_PLATFORM_USERNAME`),
the catalog's writer (`DB_CATALOG_USERNAME`) and the test database `mood_kit_test`. A volume made before the platform
role existed gets it with `docker compose exec postgres sh /docker-entrypoint-initdb.d/02-platform-reader.sh`, and one
made before the catalog's writer with `docker compose exec postgres sh /docker-entrypoint-initdb.d/03-catalog-writer.sh`.

| Service     | Address                 |
| ----------- | ----------------------- |
| Postgres    | `127.0.0.1:5432`        |
| Redis       | `127.0.0.1:6379`        |
| Mailpit     | http://localhost:8025 (SMTP on `127.0.0.1:1025`) |
| MinIO       | http://localhost:9001, the console (S3 API on `127.0.0.1:9000`). Sign in with `ASSETS_ACCESS_KEY_ID` and `ASSETS_SECRET_ACCESS_KEY`. |

All ports bind to `127.0.0.1`. If one is taken, see [Ports](configuration/environment.md#ports).

## 3. Install the dependencies

```bash
pnpm install
cd backend
composer install
```

`pnpm install` also sets up the Git hooks (Husky) and runs `nuxt prepare` for the frontend.

## 4. Generate the app key and migrate

Still in `backend/`:

```bash
php artisan key:generate
php artisan migrate
php artisan notifications:sync
php artisan db:seed
```

If you have not yet, run `php artisan assets:prepare-bucket`: the demo's public page stores its pictures there.

`key:generate` writes `APP_KEY` into the root `.env`. `notifications:sync` writes the catalog of notification channels
and event types the packages declare; run it again when you add or change an event type. `db:seed` creates the demo
workspace and fills it, so no screen opens empty or locked. It does this only when `APP_ENV` is `local` or `testing`; in any
other environment the seeder creates nothing. You can run it again: nothing is made twice.

### What the demo contains

| Where | What is there |
| ----- | ------------- |
| The workspace `demo` | an owner (`owner@demo.test`) and a member (`member@demo.test`) with their roles, and its onboarding done |
| Plan | **Pro**, active: the clients' import, the client portal and up to 5 branches work. The catalog of plans (`backend/config/plans.php`) is written too. |
| Branches | "Main branch", **Centro** and **Playas**, the last two with an address and a pin in Tijuana |
| Clients | 46 over the last sixty days: forty with the tags VIP and Frecuente, and three homed at Centro and three at Playas |
| Team | three skills (Barbería, Colorimetría, Atención al cliente) and one invitation that waits, to `new.hire@example.com` |
| Notifications | the default audiences of every event type, and in the owner's inbox three notices (two unread) with their deliveries in the log, one of them a failed email |
| Public page | published, with a block of each kind (an image with text, a text, a gallery, the branches, contact and frequent questions) and four pictures; open `http://demo.localhost:3000/` |
| Platform | two people on the waitlist (Marta Ruiz and Luis Ortega), one pending invitation to sign up, and, in `local` only, `owner@demo.test` as a super admin of the platform, the way `platform:setup` makes one. In `testing` there is no admin. |

Change the plan to see the other states: edit it in the admin's panel (see **Edit a plan** below), or write a different one in
`DemoSubscriptionSeeder`.

Billing is off until you set Stripe's keys: the Subscription page lists the plans and says payments are not set up yet.
To try it, see [Stripe](configuration/stripe.md).

### Activate your license

Run this once, with the license key from your Polar purchase:

```bash
php artisan kit:activate --project="My project"
```

It asks for the key, and what you type is hidden. The key is never an argument, so it stays out of your shell history and
process list. In a script or CI, put it in the environment variable `KIT_LICENSE_KEY_INPUT`, or pipe it in with `--stdin`
(`printf '%s\n' "$KEY" | php artisan kit:activate --stdin`). The command then records one activation with Polar under the project
name (`APP_NAME` when you leave `--project` out) and writes `KIT_LICENSE_KEY` and `KIT_LICENSE_ACTIVATION_ID` into the
root `.env`. It prints the key with only its last 4 characters.

It is a record, nothing more. No code in the kit reads the key while the app runs, and nothing stops working if you skip
it or it fails. If you have no connection, run it again later. Running it on an install that has both variables does
nothing; `--force` activates again. If Polar accepted the key but the `.env` could not be written, the command prints the two lines to add by hand: add them, and do not run the command again, because it would use another activation. If it says the activation limit is reached, or the key is revoked, contact support.
The kit's Polar organization id ships inside the release, so you set nothing for it. The settings behind it are in [The `.env` file](configuration/environment.md#the-mood-kit-license).

## 5. Run the four processes

Each runs in its own terminal and keeps running.

| Process   | Command, from                                   | What it does                                    |
| --------- | ----------------------------------------------- | ----------------------------------------------- |
| API       | `php artisan serve`, in `backend/`              | serves the API on http://localhost:8000         |
| Frontend  | `pnpm --filter ./frontend dev`, at the repo root | serves the Nuxt app on http://localhost:3000    |
| Worker    | `php artisan queue:work`, in `backend/`         | sends the emails, builds new workspaces         |
| Scheduler | `php artisan schedule:work`, in `backend/`      | runs the periodic commands: the full table is in [Queues and the scheduler](configuration/queues-and-scheduler.md#the-scheduler) |
| Realtime  | `php artisan reverb:start`, in `backend/`       | pushes new notifications to the bell (optional: without it the bell updates every minute) |

Check the API with `curl -i http://localhost:8000/up`: it answers `200`.

Both servers read `.env` once, when they start. Restart them after you edit it.

Without the worker, nothing that is queued happens: no password reset email, no signup email, and no
workspace is built after a signup is confirmed. [Queues and the scheduler](configuration/queues-and-scheduler.md)
lists what each one runs.

## 6. Sign in to the demo workspace

Workspaces live on `<slug>.<root domain>`, and the local root domain is `localhost`, so the demo workspace
is http://demo.localhost:3000.

1. Open http://demo.localhost:3000/login.
2. Sign in with `owner@demo.test` and `Demo-Password-2026`.

You land on `/dashboard`. The owner's sidebar has **Home** and **Clients**, then **Team**, **Branches**, **Roles**,
**Settings** and **Subscription**: the owner holds every permission.

Sign out from the profile menu and sign in again as `member@demo.test` with the same password. The member role holds what
each module gives it, which is to look and not to change: the sidebar shows **Home**, **Clients**, **Team** and **Branches**,
and `/dashboard/roles`, `/dashboard/settings` and `/dashboard/subscription` send them back to the dashboard.

These two users exist only in `local` and `testing`. Their password is public, so the seeders refuse to run
anywhere else.

To try password recovery, use **Forgot password** on the sign-in page and open Mailpit at
http://localhost:8025. The email arrives only while the worker runs.

In `local`, `db:seed` has made the demo owner a super admin of the platform already, so there is nothing to run: sign in to the
admin's panel at http://admin.localhost:3000/platform/login with the demo owner's email and password (`/` on that host goes there
too). Anywhere else a super admin comes from `php artisan platform:setup`: see
[Set up the first super admin](guides/set-up-the-first-super-admin.md) and [The admin host](configuration/admin-host.md).

### Invite someone

As the demo owner, open **Team** in the sidebar and press **Invite**: give an address of your own invention (for example
`ana@example.com`) and a role. Open Mailpit at http://localhost:8025, open the invitation and open its link in a private
window, since this one is signed in as the owner. The page says who invites you to which workspace; choose a name and a
password and you land on the demo workspace's dashboard as Ana. Back as the owner, **Team** lists Ana, and Mailpit has
the email that says she joined. See [Invite your team](guides/invite-your-team.md).

### Add a branch

The demo workspace has three branches: its main branch ("Main branch", with no address yet, as every new workspace gets
one), **Centro** and **Playas**. Open **Branches** in the sidebar, then a branch, to see its address and pin or to give the
main one an address. To add another, press **New branch**. Give it a name, then type a street and a
city (for example `Av. Revolución 1234` and `Tijuana`, country Mexico): about a second after you stop typing, the pin
drops on the map. Drag it and the address follows, unless you turn off **Fill the address from the pin**. The map and the
address search use OpenStreetMap and its public Nominatim server, so this needs an internet connection and no key (see
[Maps](configuration/maps.md)). Save: the branch's page opens, where you set its opening hours and its people and save
them with the bar at the bottom. The demo workspace is on Pro, which allows 5 active branches, so two places are left. A
workspace on Free allows one, and there **New branch** is disabled with "Your plan includes 1 branch". See
[Branches](packages/branches.md).

### Work by branch

With two active branches or more the workspace works by branch, and the demo has three. The top of the sidebar has the
branch switcher, on "All branches" for the owner (an icon when the sidebar is collapsed, and at the top of the side menu on a
phone). Choose **Centro**, then open **Clients**: the list shows the three clients homed there, and the cards of the home
follow the branch. Open **Team**: it says "Showing the people
of {branch}." and lists only the people of that branch (add Ana to one from its page first). Ana, who sees only the
branches she works at, has no switcher while she works at one, and sees a notice above every screen while she works at
none. A branch's page ends with its **History**. See [Branches](packages/branches.md#the-branch-someone-works-at).

### Clients

As the demo owner, open **Clients** in the sidebar and press **New client**: a name is enough (an email or a phone that
another client has is refused, with the way to that client). Save with **Save changes**: the client's page opens, with its
**Profile** and **Activity**. Open the **Tags** tab of the list, press **New tag** and name one; then, on the **Clients**
tab, tick the client and press **Tag** in the bar that appears, and add the tag.

The demo has 46 clients to look at already. It is on Pro, so **Import** is enabled (on Free it is disabled with the plan's
tooltip). Save a CSV of three lines, a row of headers and two clients:

```csv
Nombre,Correo,Teléfono
Ana López,ana@example.com,+52 664 123 4567
Beto Ramírez,beto@example.com,664 987 6543
```

Press **Import** and drop the file. The columns step guesses which column has the name, the email and the phone; type
`+52` as the country code for the phone written without one and press **Check the file**: it says how many clients are new
and lists the lines it would not import, by line and field. Press **Import 2 clients**. The worker runs it (it must be
running, see step 5); the page follows it to the end and the bell has the notice that it ended, with its email in Mailpit.
Back on the list, the download button at the end of the toolbar saves the clients, as the list is filtered, as a CSV. See
[Clients](packages/clients.md).

The client portal is part of Pro too. Open **Settings**, then **Client portal**, turn on **Portal open** and press **Save changes**: the section shows the
portal's address. Give a client an email first (the portal signs in by email), then open `http://demo.localhost:3000/portal`
in a private window, type that email and press **Email me a code**. The code goes by email through the worker of step 5:
take it from Mailpit (`http://localhost:8025`), type it and press **Sign in**. The client's page has their details and their
choice about news and offers: change one and save, then, back as the owner, the client's **Activity** shows the change, and
their **Profile** has a **Client portal** card that says on how many devices they are signed in, with **Sign out everywhere**.
See [The client portal](packages/clients.md#client-portal).

### Search

Press `Cmd+K` (`Ctrl+K` outside macOS) from any page of the dashboard: the field in the top bar takes the focus and offers
the pages of the menu. Type two letters of a client's or a member's name and pick one: the results come grouped, and
choosing one opens its page. On a phone the magnifying glass in the top bar opens the same search in a dialog.

### The home

`/dashboard` shows a card for each thing the person may want to know at a glance: the team's active members and open
invitations, the branches they work at, their clients and how many are new, and the plan's use of each limit. Each card is
there only for someone with its permission, and its numbers follow the branch in the top bar as the list does. The **Create**
menu in the top bar (before the bell) offers what the person may add: invite someone, a new branch, a new client. See
[Dashboard](packages/dashboard.md).

### Edit a plan

Signed in to the admin's panel as above, open **Plans and subscriptions** and press Edit on Pro. Its tabs hold its texts in
each language, its sale and trial, its prices, its limits and its features; a change marks its card, and the bar at the
bottom reviews and saves the whole plan. Lower **Members** under **Limits** and save: a dialog lists what the change takes
and how many workspaces have the plan, and saves only with **Save anyway**. Change a price under **Prices**: without
Stripe it is saved and nothing is sold, as the tab says; with Stripe's test keys (see [Stripe](configuration/stripe.md))
the save offers the new price on Stripe, and if Stripe fails the tab says which periods nobody can buy and offers them
again. The panel edits plans only where the catalog's writer is set up (`DB_CATALOG_USERNAME`); without it the editor
only shows them. See [Platform](packages/platform.md#editing-the-plans).

## 7. Create a workspace through signup

Signup happens on the root domain, signed out.

1. Open http://localhost:3000/signup.
2. Fill in the business name, your name, an email address and a password (at least 12 characters, with
   upper and lower case and a number), and accept the terms. The form shows the workspace address it will
   get under the business name, for example `acme-studio.localhost`.
3. Submit. The screen says a verification email is on its way.
4. Open Mailpit at http://localhost:8025 and open the email. Its link goes to
   `http://localhost:3000/signup/confirm#verification=...`.
5. On the confirm screen, enter the password you chose in step 2. (The screen also lets whoever holds the
   email choose a new password instead.)
6. The processing screen follows the worker as it builds the workspace, then signs you in on
   `http://<slug>.localhost:3000` and opens `/dashboard`. You are the owner.

The tab where you started the signup also learns that the workspace is ready, but it is not signed in: only
the browser that confirmed the email is. It links to the new workspace's sign-in page instead.

The demo workspace's onboarding is already done; a workspace you create through signup opens the setup wizard.

Locally no captcha is asked: `SIGNUP_REQUIRE_CAPTCHA` is empty, which means off when `APP_ENV` is `local`.
See [Signup](packages/signup.md) for the whole flow and its limits.

## Update to a new version

Each release is one commit on `main` of the repository you were invited to, tagged `vX.Y.Z`. To take one into your project:

1. Keep that repository as a remote (here called `kit`) and fetch its tags: `git fetch kit --tags`.
2. Merge the version: `git merge vX.Y.Z`. Resolve any conflict in files you changed.
3. Open [`CHANGELOG.md`](../CHANGELOG.md) and read the entries of every version between yours and the new one, newest first.
   Under `### Upgrading` is what you must run or set.
4. Run what it lists. Usually that is `pnpm install`, then in `backend/` `composer install` and `php artisan migrate`, and
   sometimes `php artisan rbac:sync`, `plans:sync` or `notifications:sync`, or a new variable in your `.env`.

## Troubleshooting

| Symptom | Cause and fix |
| ------- | ------------- |
| No email in Mailpit | The worker is not running. Start `php artisan queue:work` in `backend/`. Queued emails go out once it starts. |
| The processing screen waits forever | Same cause: the worker builds the workspace. After 15 minutes `signup:prune` marks the signup failed, if the scheduler runs. |
| `demo.localhost` does not resolve | Chrome, Firefox and Edge resolve `*.localhost` to `127.0.0.1` themselves; Safari does not. Use another browser, or add `127.0.0.1 demo.localhost` (and one line per workspace you create) to `/etc/hosts`. |
| Port 8000 or 3000 is already in use | `php artisan serve` moves to the next free port (8001...) and the frontend dev server picks another free one; both print the address they use. The kit's settings still point at 8000 and 3000, so either free the port, or follow the new one: for the API, `APP_URL` and `NUXT_PUBLIC_API_BASE_URL` (which keeps its `/api/v1`); for the frontend, `APP_FRONTEND_URL`. Pin a port with `php artisan serve --port=8001` or `pnpm --filter ./frontend dev --port 3001`, then restart everything that reads `.env`. |
| `corepack: command not found` | Node 25 and later no longer bundle corepack. Install it with `npm install --global corepack`, then `corepack enable`. |
| `composer check` cannot connect to the test database | Your Postgres volume predates `scripts/postgres-init`. Reset it with `docker compose down -v`, which erases all local data, then `docker compose up -d --wait` and `php artisan migrate` again. |
| A port is already in use | Change `DB_PORT`, `REDIS_PORT`, `MAILPIT_SMTP_PORT` or `MAILPIT_UI_PORT` in `.env` and run `docker compose up -d --wait` again. |
| A change to `.env` has no effect | Restart `php artisan serve`, the frontend dev server and the worker. Postgres reads `DB_*` only when it creates its volume. |

## Next steps

- [Architecture](concepts/architecture.md) explains how the packages and layers fit together.
- [Testing and quality gates](guides/testing.md) shows how to run the checks CI runs.
- [Add a permission and a menu entry](guides/add-a-permission-and-menu-entry.md) is the usual first step
  of a feature of your own.
