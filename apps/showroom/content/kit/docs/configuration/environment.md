# The `.env` file

The kit has one env file, `.env` at the repo root, copied from `.env.example`. Docker Compose, Laravel and
Nuxt all read it, and its defaults work locally as they are. This page explains who reads it, the database
users, ports, and every setting the kit adds to Laravel's and Nuxt's own.

## One file

- Do not create `backend/.env` or `frontend/.env`. Laravel ignores `backend/.env` while the root `.env`
  exists, and the frontend scripts load only `../.env` (`--dotenv ../.env`).
- Laravel uses its default lookup (`backend/.env`, then the real environment) only when the repo has no
  root `.env`. A production image ships no `.env` and receives real environment variables.
- `php artisan serve`, the frontend dev server and the queue worker read `.env` when they start. Restart
  them after you edit it.
- New settings go into `.env.example` with a working local default. Never commit `.env`.

The last block of `.env.example`, "Framework options", lists Laravel settings the kit leaves at their
defaults, each commented out with its default value. Remove the `#` only to override one.

The database and Redis connections read Laravel's stock keys (`DB_*` and `REDIS_*`, as `backend/config/database.php` names
them), which Laravel's own documentation explains; this page covers only what the kit adds or changes.

## The Postgres users

Postgres has five users, all created by Docker Compose on the first boot of an empty volume:

| Variable | Role | Use |
| -------- | ---- | --- |
| `DB_USERNAME` / `DB_PASSWORD` | `mood_kit_app`, `NOSUPERUSER NOBYPASSRLS NOCREATEDB` | what the app and the tests connect as. It owns nothing: it reads and writes rows. |
| `DB_MIGRATION_USERNAME` / `DB_MIGRATION_PASSWORD` | `mood_kit_owner`, `NOSUPERUSER NOBYPASSRLS`, with `CREATEDB` | the schema owner: it owns the databases and every table, and `migrate` and `plans:sync` connect as it. `CREATEDB` lets Pest create its parallel test databases. Empty: the migrations run as `DB_USERNAME`, and `tenancy:verify-rls` fails. |
| `DB_PLATFORM_USERNAME` / `DB_PLATFORM_PASSWORD` | `mood_kit_platform`, `NOSUPERUSER BYPASSRLS NOCREATEDB`, `SELECT` only on what migrations grant it, every statement logged by Postgres | the platform's read-only role: reads across workspaces (`ReadsAcrossWorkspaces`, `plans:subscriptions`) run as it, logged in `platform_reads`. It may only SELECT the tables migrations grant it. Empty: no read across workspaces. See [Multi-tenancy](../concepts/multi-tenancy.md#the-platform-context). |
| `DB_CATALOG_USERNAME` / `DB_CATALOG_PASSWORD` | `mood_kit_catalog`, `NOSUPERUSER NOBYPASSRLS NOCREATEDB`, owns nothing, writes only what migrations grant it, every write logged by Postgres | the catalog's writer: the admin's plan editor writes the catalog of plans and its Stripe prices with it. Empty: the plans are read-only in the admin. See [Multi-tenancy](../concepts/multi-tenancy.md#the-catalogs-writer). |
| `DB_ADMIN_USERNAME` / `DB_ADMIN_PASSWORD` | `mood_kit_admin`, the superuser | admin work only, for example `docker compose exec postgres psql -U mood_kit_admin mood_kit`. Never point the app at it: a superuser skips row-level security. |

`scripts/postgres-init/01-roles-and-databases.sh` creates the two roles, hands `DB_DATABASE` to the schema owner,
and creates the test database `<DB_DATABASE>_test`, owned by it too. It refuses to run when either role is the
superuser, or when they are the same role. `scripts/postgres-init/02-platform-reader.sh` then creates the platform's
read-only role, and `scripts/postgres-init/03-catalog-writer.sh` the catalog's writer. Both are safe to run again, so a
volume made before them gets the roles with
`docker compose exec postgres sh /docker-entrypoint-initdb.d/02-platform-reader.sh` and
`docker compose exec postgres sh /docker-entrypoint-initdb.d/03-catalog-writer.sh`; then `php artisan migrate` grants the
catalog's writer its tables.

Postgres applies `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_MIGRATION_USERNAME`, `DB_MIGRATION_PASSWORD`,
`DB_PLATFORM_USERNAME`, `DB_PLATFORM_PASSWORD`, `DB_CATALOG_USERNAME`, `DB_CATALOG_PASSWORD`,
`DB_ADMIN_USERNAME` and `DB_ADMIN_PASSWORD`
only when it creates its volume. To change them later, reset the volume with `docker compose down -v`,
which erases all local data.

## Ports

Every service binds to `127.0.0.1`. If a port is taken, change it in `.env` and run
`docker compose up -d --wait` again.

| Variable | Default | Service |
| -------- | ------- | ------- |
| `DB_PORT` | `5432` | Postgres |
| `REDIS_PORT` | `6379` | Redis |
| `MAILPIT_SMTP_PORT` | `1025` | Mailpit SMTP. `MAIL_PORT` follows it. |
| `MAILPIT_UI_PORT` | `8025` | Mailpit inbox |
| `MINIO_PORT` | `9000` | MinIO's S3 API. `ASSETS_ENDPOINT` and `ASSETS_URL` follow it. |
| `MINIO_CONSOLE_PORT` | `9001` | MinIO's console |
| `MEILISEARCH_PORT` | `7700` | Meilisearch, only with `docker compose --profile meilisearch` ([Search](search.md)). `MEILISEARCH_HOST` follows it. |

## Two clones on one machine

Docker Compose names its project, and so every container, network and volume, after the folder you cloned
into, so two clones never share data. Two clones in folders with the same name need different
`COMPOSE_PROJECT_NAME` values in their `.env`. To run two clones at once, also give each its own ports.

## Settings the kit adds

| Variable | Default | Read by | Page |
| -------- | ------- | ------- | ---- |
| `TENANCY_ROOT_DOMAIN` | `localhost` | backend | [Domains](domains.md) |
| `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` | `localhost` | frontend | [Domains](domains.md) |
| `APP_FRONTEND_URL` | `http://localhost:3000` | backend: links in emails, workspace switches | [Domains](domains.md#the-frontend-url) |
| `TENANCY_CACHE_TTL` | `60` | backend | [Tenancy](../packages/tenancy.md) |
| `TENANCY_ENFORCE_RLS` | `false` | backend. `true` in production. | [Multi-tenancy](../concepts/multi-tenancy.md#the-database-role) |
| `SANCTUM_TOKEN_TTL_MINUTES` | `43200` (30 days) | backend | [Auth](../packages/auth.md) |
| `AUTH_CAPTCHA_DRIVER` | `null` | backend | [Captcha](captcha.md) |
| `TURNSTILE_SECRET_KEY` | empty | backend | [Captcha](captcha.md) |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | empty | frontend | [Captcha](captcha.md) |
| `SIGNUP_REQUIRE_CAPTCHA` | empty: follows `APP_ENV` | backend | [Captcha](captcha.md#signup_require_captcha) |
| `CLIENTS_PORTAL_REQUIRE_CAPTCHA` | empty: follows `APP_ENV` | backend | [Captcha](captcha.md#clients_portal_require_captcha) |
| `TRUSTED_PROXIES` | empty | backend | [Production checklist](production.md#behind-a-load-balancer) |
| `PLATFORM_NAME` | empty: `APP_NAME` | backend: the platform's name in its emails and public screens, until the admin's Settings change it | [Brand the platform](../guides/brand-the-platform.md) |
| `PLATFORM_PRIMARY_COLOR` | `default` | backend: the platform's primary color, `#rrggbb` (anything else is `default`, the monochrome brand), until the admin's Settings change it | [Brand the platform](../guides/brand-the-platform.md) |
| `PLATFORM_LOGO_URL` | empty | backend: an absolute URL of the platform's logo, for its emails and public screens, until the admin uploads one | [Brand the platform](../guides/brand-the-platform.md) |
| `RBAC_CACHE_TTL` | `3600` | backend | [Rbac](../packages/rbac.md#configuration) |
| `SETTINGS_DEFAULT_TIMEZONE` | `UTC` | backend: a workspace's timezone until it saves one | [Settings](../packages/settings.md#configuration) |
| `SETTINGS_DEFAULT_LOCALE` | `APP_LOCALE`, else `en` | backend: a workspace's language until it saves one | [Settings](../packages/settings.md#configuration) |
| `SETTINGS_DEFAULT_CURRENCY` | `USD` | backend: a workspace's currency until it saves one | [Settings](../packages/settings.md#configuration) |
| `SETTINGS_LOGO_PRESIGN` | `false` | backend: upload the logo straight to the bucket | [Settings](../packages/settings.md#configuration) |
| `SETTINGS_CACHE_TTL` | `3600` | backend | [Settings](../packages/settings.md#configuration) |
| `PLANS_CACHE_TTL` | `3600` | backend | [Plans](../packages/plans.md#configuration) |
| `AWS_SES_CONFIGURATION_SET` | empty: none | backend: the SES configuration set that publishes bounces and complaints, with the email's tags, to SNS | [Mail](mail.md#bounces-and-complaints-amazon-ses) |
| `NOTIFICATIONS_SES_TOPIC_ARNS` | empty: every bounce message is refused | backend: the SNS topics of SES bounces and complaints, comma separated | [Mail](mail.md) |
| `NOTIFICATIONS_HASH_KEY` | empty: `APP_KEY` | backend: the secret the key that names addresses in the delivery log, the suppression list and an address's preferences is derived from; set it once, before going live (changing it resets suppressions and an address's opt-outs) | [Production](production.md) |
| `NOTIFICATIONS_LINK_KEY` | empty: `APP_KEY` | backend: the secret the key that signs the preference links of the notification emails is derived from; set it once, before going live (changing it breaks the links already sent) | [Production](production.md) |
| `BROADCAST_CONNECTION` | `null` (`.env.example`: `reverb`) | backend: `reverb` sends the inbox's changes to the browser through Reverb; with it, an empty `REVERB_APP_*` or `REVERB_HOST` stops the app at boot, naming it | [Realtime](realtime.md) |
| `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` | empty (`.env.example`: local development values) | backend and `reverb:start`: the app's id, public key and secret; production makes its own | [Realtime](realtime.md) |
| `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` | empty, `443`, `https` (`.env.example`: `localhost`, `8080`, `http`) | backend: where the app publishes to Reverb | [Realtime](realtime.md) |
| `REVERB_CLIENT_TIMEOUT`, `REVERB_CLIENT_CONNECT_TIMEOUT` | `2`, `2` | backend: seconds the queue worker waits for Reverb to answer and to connect when it publishes a change | [Realtime](realtime.md) |
| `REVERB_PUBLIC_HOST`, `REVERB_PUBLIC_PORT`, `REVERB_PUBLIC_SCHEME` | empty: `REVERB_HOST`, `PORT` and `SCHEME` | backend: where the browser reaches Reverb, behind a proxy, sent to it in `GET /me` | [Realtime](realtime.md) |
| `REVERB_ALLOWED_ORIGINS` | `*` | `reverb:start`: the hosts of the origins it accepts, comma separated, `*` a wildcard (`example.com,*.example.com` for the root domain and every workspace) | [Realtime](realtime.md) |
| `REVERB_APP_RATE_LIMITING_ENABLED`, `REVERB_APP_RATE_LIMIT_MAX_ATTEMPTS`, `REVERB_APP_RATE_LIMIT_DECAY_SECONDS`, `REVERB_APP_RATE_LIMIT_TERMINATE` | `false`, `60`, `60`, `false` | `reverb:start`: its own limit on the messages one connection sends, and whether it closes a connection over it (on in production) | [Realtime](realtime.md) |
| `ONBOARDING_TEMPLATE` | empty: none | backend: the workspace template every new workspace starts from (the slug of one a package declares) | [Onboarding](../packages/onboarding.md#configuration) |
| `BRANCHES_CREATE_MAIN_BRANCH` | `true` | backend: every new workspace starts with its main branch, and the onboarding's step confirms where it is; `false` makes none, and the step adds the first branch | [Branches](../packages/branches.md#the-main-branch) |
| `TEAM_INVITATION_DAYS` | `7` | backend: how many days an invitation to a workspace works, from when it was (last) sent | [Team](../packages/team.md#configuration) |
| `GEOCODING_DRIVER` | `nominatim` | backend: who answers the location picker's address search: `nominatim`, `google`, `mapbox`, `none` (finds nothing) or a driver of yours; any other name fails `geocoding:verify` and every search, never falls back to `nominatim` | [Geocoding](../packages/geocoding.md#drivers) |
| `GEOCODING_NOMINATIM_URL`, `GEOCODING_NOMINATIM_EMAIL`, `GEOCODING_NOMINATIM_REQUESTS_PER_SECOND` | the public server, none, `1` | backend: the Nominatim server, an email its operators may write to, and requests per second for the whole app | [Geocoding](../packages/geocoding.md#configuration) |
| `GEOCODING_GOOGLE_KEY`, `GEOCODING_MAPBOX_TOKEN` | empty | backend: the server-side key of Google's Geocoding API and Mapbox's secret token, for those drivers | [Geocoding](../packages/geocoding.md#configuration) |
| `GEOCODING_CACHE_DAYS` | `30` | backend: days a found place is kept; `0` keeps nothing | [Geocoding](../packages/geocoding.md#configuration) |
| `SCOUT_DRIVER` | `database` | backend: `database` searches the clients in Postgres alone; `meilisearch` also keeps them in Meilisearch, which proposes the ids Postgres filters | [Search](search.md) |
| `SCOUT_QUEUE` | `true` | backend: with an index, a change reaches it from a queued job after its commit; `search:reindex` sends right away whatever it says | [Search](search.md#in-production) |
| `SCOUT_PREFIX` | empty | backend: put in front of the index's name (`clients`), so one Meilisearch serves several installs | [Search](search.md#in-production) |
| `MEILISEARCH_HOST`, `MEILISEARCH_KEY` | `http://localhost:7700`, none (`.env.example`: the dev master key of Docker Compose) | backend: where Meilisearch is and its key; in production a key limited to the clients' index, never the master key | [Search](search.md#in-production) |
| `STRIPE_SECRET` | empty: billing is off | backend: the secret key of your Stripe account (a sandbox's `sk_test_...` to try it) | [Billing](../packages/billing.md#configuration) |
| `STRIPE_BILLING_WEBHOOK_SECRET` | empty | backend: the signing secret of the billing webhook endpoint (`whsec_...`; `stripe listen` prints its own) | [Billing](../packages/billing.md#configuration) |
| `STRIPE_LOOKUP_PREFIX` | `mood_kit` | backend: what the ids of the products and prices `billing:sync-plans` writes begin with | [Billing](../packages/billing.md#configuration) |
| `PLATFORM_HOST` | empty: `admin.<TENANCY_ROOT_DOMAIN>` | backend: the admin's host, one reserved label of the root domain | [The admin host](admin-host.md) |
| `NUXT_PUBLIC_PLATFORM_HOST` | `admin.localhost` | frontend: the admin's host; keep it alike with `PLATFORM_HOST` | [The admin host](admin-host.md) |
| `PLATFORM_BOOTSTRAP_ADMINS` | empty | backend: the emails `platform:setup` makes the first super admins, only while there is none | [Set up the first super admin](../guides/set-up-the-first-super-admin.md) |
| `PLATFORM_ACCESS_MODE` | `open` | backend: who may make a workspace until an admin chooses: `open`, `waitlist` or `closed`; empty is `open`, anything else is `closed` and fails `platform:verify` | [Control who signs up](../guides/control-who-signs-up.md) |
| `PLATFORM_SESSION_MINUTES`, `PLATFORM_IDLE_MINUTES` | `480`, `60` | backend: the whole life of an admin's session, and how long it may sit unused | [Platform](../packages/platform.md#configuration) |
| `PLATFORM_DELETION_GRACE_DAYS`, `PLATFORM_INVITATION_DAYS` | `30`, `14` | backend: the days a closed workspace waits before it is deleted, and an invitation lasts | [Platform](../packages/platform.md#configuration) |
| `ASSETS_DISK` | `assets` | backend: the disk uploaded files go to | [Storage](storage.md) |
| `ASSETS_ACCESS_KEY_ID`, `ASSETS_SECRET_ACCESS_KEY`, `ASSETS_REGION`, `ASSETS_BUCKET`, `ASSETS_ENDPOINT`, `ASSETS_URL`, `ASSETS_USE_PATH_STYLE_ENDPOINT` | the MinIO of Docker Compose | backend: the `assets` disk, its own keys | [Storage](storage.md) |
| `NUXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` | frontend | [Frontend](../frontend.md#runtime-settings) |
| `NUXT_PUBLIC_SIGNUP_TERMS_URL` | `/terms` | frontend | [Signup](../packages/signup.md#the-signup-layer) |
| `NUXT_PUBLIC_SIGNUP_PRIVACY_URL` | `/privacy` | frontend | [Signup](../packages/signup.md#the-signup-layer) |
| `NUXT_PUBLIC_PLATFORM_NAME` | `Mood Kit` | frontend: the product's name on screen | [Frontend](../frontend.md#runtime-settings) |
| `NUXT_SECURITY_ASSETS_URL`, `NUXT_SECURITY_ASSETS_UPLOAD_URL` | empty (`.env.example`: `ASSETS_URL`, `ASSETS_ENDPOINT`) | frontend server: what the Content Security Policy allows of the bucket | [Production checklist](production.md#security-headers) |
| `NUXT_SECURITY_REALTIME_URL` | empty: no realtime (`.env.example`: `ws://localhost:8080`) | frontend server: where the browser opens Reverb's websocket (`connect-src` of the Content Security Policy) | [Realtime](realtime.md) |
| `NUXT_PUBLIC_MAP_STYLE_URL` | empty: raster tiles | frontend: the location picker's vector style, with a provider's public key in it if it needs one | [Maps](maps.md#the-map) |
| `NUXT_PUBLIC_MAP_TILES_URL`, `NUXT_PUBLIC_MAP_ATTRIBUTION` | OpenStreetMap's tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`), `© OpenStreetMap contributors` | frontend: the raster tiles the map draws without a style, and the credit it shows | [Maps](maps.md#the-map) |
| `NUXT_SECURITY_MAP_ORIGINS` | empty | frontend server: more origins a vector style loads from (glyphs, sprites), comma-separated, for `connect-src` and `img-src` | [Maps](maps.md#the-map) |

`APP_NAME` names the platform in emails (the sender name, through `MAIL_FROM_NAME`, and the verification
email's header).

## Laravel settings that matter here

| Variable | Local value | Note |
| -------- | ----------- | ---- |
| `APP_ENV` | `local` | `local` and `testing` seed the demo workspace and turn signup's captcha requirement off. `production` blocks the destructive migrate commands. |
| `APP_DEBUG` | `true` | must be `false` in production |
| `APP_URL` | `http://localhost:8000` | the API's own address. Its host is a trusted host. |
| `APP_LOCALE` | `en` | |
| `CACHE_STORE`, `QUEUE_CONNECTION` | `redis` | the login timing defence, the signup email limits and the lock of Stripe's price offers need a persistent cache |
| `SESSION_*` | `SESSION_DRIVER=redis` | the API signs in with bearer tokens and starts no session, so these change nothing in the kit's features. See [Domains](domains.md#cross-origin-requests-and-cookies). |
| `LOG_CHANNEL`, `LOG_LEVEL` | `stack`, `debug` | in containers log to stderr, and set a level such as `warning` in production |
| `MAIL_*` | Mailpit | see [Mail](mail.md) |
| `SENTRY_LARAVEL_DSN`, `SENTRY_TRACES_SAMPLE_RATE` | empty, `0.1` | see [Sentry](sentry.md) |
| `FILESYSTEM_DISK` | `local` | Laravel's default disk. Uploaded files do not use it: they go to `ASSETS_DISK`. |
| `AWS_*` | empty | Laravel's `s3` disk, which no kit feature uses. `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are also the SES credentials. Uploaded files never use them: see `ASSETS_*`. |

`DB_PASSWORD`, `DB_MIGRATION_PASSWORD`, `DB_PLATFORM_PASSWORD`, `DB_ADMIN_PASSWORD`, `ASSETS_ACCESS_KEY_ID` and `ASSETS_SECRET_ACCESS_KEY` in `.env.example` are public development defaults. Generate new ones for any shared or production environment.

## The test database

Backend tests connect with the host, port, user and password of the root `.env`, to `<DB_DATABASE>_test`, so
they never touch your development data. See [Testing and quality gates](../guides/testing.md#the-test-database).

The storage tests use the bucket `<ASSETS_BUCKET>-test`, with the keys and endpoint of the root `.env`, never your
development bucket. A root `.env` that names no bucket or no endpoint leaves the MinIO defaults of
`backend/.env.testing`.
