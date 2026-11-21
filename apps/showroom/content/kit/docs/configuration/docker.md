# Docker images and the production stack

Reference for what ships in `docker/` (three images) and `deploy/` (the Compose stack that runs them). It describes what is
there and why; it is not a step by step guide to a server. The checklist of what a deployment needs is
[Production](production.md): the images satisfy every item a container can.

| Path | Is |
| ---- | -- |
| `docker/backend/` | the API image: nginx, php-fpm, the queue worker, the scheduler and Reverb |
| `docker/frontend/` | the Nuxt server image |
| `docker/caddy/` | Caddy with the Cloudflare DNS and rate limit modules |
| `deploy/compose.yml` | the stack: Caddy, API, frontend, Postgres, Redis, optional Meilisearch |
| `deploy/Caddyfile` | the public edge |
| `deploy/.env.example` | every variable the stack needs, copied to `deploy/.env` |
| `deploy/postgres-init/` | the four database roles, created on the first start of an empty volume |
| `.dockerignore` | keeps `.env` files, `node_modules`, `vendor`, tests and docs out of every build |

Build every image from the repo root (the context), for example
`docker build -f docker/backend/Dockerfile -t mood-kit-backend .`. Nothing about one install is baked into an image: all
configuration is environment variables at run time, and no `.env` file is ever copied in.

## The API image (`docker/backend/Dockerfile`)

Three stages: a PHP base with the extensions, a stage that runs `composer install --no-dev --optimize-autoloader` (the
path repositories in `backend/packages` become symlinks that stay valid because the app sits at the same path, `/app/backend`,
in both stages), and the runtime.

- **Base:** `php:8.4-fpm-bookworm` with `pdo_pgsql`, `pgsql`, `gd` (WEBP, JPEG, FreeType), `intl`, `pcntl`, `posix`, `zip`,
  `bcmath`, `opcache` and `redis`. Installed packages: `nginx`, `supervisor`, `procps`, `tini` (PID 1).
- **Layout:** the repo layout under `/app` (`/app/backend`), so Laravel's lookup of a root `.env` in `/app` finds none and
  the real environment is used.
- **`php.ini`** (`docker/backend/php.ini`): `upload_max_filesize=5M`, `post_max_size=6M`, `memory_limit=256M`,
  `zend.exception_ignore_args=On`, `expose_php=Off`, `display_errors=Off`, and opcache with `validate_timestamps=0` (a new
  release is a new image).
- **php-fpm** (`php-fpm.conf`): `pm = ondemand` with `pm.max_children = 20`, so an idle API holds no worker, and
  `clear_env = no` so the container's variables reach PHP.
- **nginx** (`nginx.conf`): one worker, serves `backend/public` on port **8080**, `client_max_body_size 6m`, no
  `server_tokens`, and `location = /healthz` answering 200 without PHP.
- **Logs:** everything goes to stdout and stderr (`LOG_CHANNEL=stderr` for the app).

### `APP_ROLE`

One image, five ways to start it, chosen by the `APP_ROLE` environment variable (default `all`). supervisord starts only
the programs of the role:

| `APP_ROLE` | Starts | Listens on |
| ---------- | ------ | ---------- |
| `all` | nginx, php-fpm, queue worker, scheduler, Reverb | 8080 (API), 8081 (Reverb) |
| `web` | nginx and php-fpm | 8080 |
| `worker` | `php artisan queue:work --tries=3 --max-time=3600` | nothing |
| `scheduler` | `php artisan schedule:work`: run exactly one in the whole deployment | nothing |
| `reverb` | `php artisan reverb:start --host=0.0.0.0 --port=8081` | 8081 |

Any other value stops the container at start. The program files are in `docker/backend/supervisor/programs/`; each one has
`startretries` and a growing pause between tries. A program that stays FATAL stops supervisord (a small event listener) and
the container exits with status 1, so a restart policy (`on-failure` too) and an orchestrator see a failure instead of a dead
scheduler going unnoticed.

A stop (`docker stop`) is orderly: tini sends the signal to the whole process group, supervisord stops each program, and the
queue worker gets up to 90 seconds to finish its job. The backend service sets `stop_grace_period: 100s` for that; Compose's
default of 10 seconds would kill the worker in the middle of a job.

### `APP_RUN_DEPLOY` and the deploy lock

`APP_RUN_DEPLOY` says whether the container runs the deploy commands before it starts. It defaults to `true` for `all` and
`web`, and `false` for `worker`, `scheduler` and `reverb`. When it is false the container only runs `config:cache`, which is
per container and reads no database.

The deploy runs under a Postgres advisory lock (`docker/backend/deploy-lock.php`, `pg_advisory_lock`, connecting as the
schema owner). Replicas that start together take turns: the second waits, then runs the same commands and finds nothing left
to do. The lock belongs to the database session, so it is freed even if a container dies. `flock` would not do: it only
locks inside one container. The script waits up to two minutes for the database to answer.

### `deploy.sh`

`docker/backend/deploy.sh` runs, from `/app/backend` and with `set -eu` (the first failure stops the container), exactly the
commands of the "Every deploy" block of [Production](production.md#every-deploy), in the same order. A test,
`backend/tests/Architecture/DeployScriptTest.php`, fails when the two lists differ. Change both together.

`queue:restart` and `reverb:restart` do nothing on a first start. On a new install `platform:setup` only warns when the
emails of `PLATFORM_BOOTSTRAP_ADMINS` have no account yet (see [the first super admin](#the-first-super-admin)).

### Users and files

Every process in the API container runs as `www-data` (uid 33), never root. `HOME` and `XDG_CONFIG_HOME` are `/tmp`, so
`php artisan tinker` can keep its config. The code is root-owned and read-only to it,
except `storage/` and `bootstrap/cache`. Because nothing is root, nginx listens on 8080 and keeps its pid, temp files and the
php-fpm socket in `/tmp`.

## The frontend image (`docker/frontend/Dockerfile`)

Build stage: `node:24-bookworm-slim`, corepack with the pnpm version of the root `package.json`, `pnpm install
--frozen-lockfile`, then `pnpm --filter ./frontend build`. The script passes `--dotenv ../.env`, so the stage creates an
empty `.env` that is not copied on. Runtime stage: only `frontend/.output`, user `node` (uid 1000),
`ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0`, `CMD ["node", ".output/server/index.mjs"]` and a `HEALTHCHECK` that runs `curl` against
`/robots.txt` (any answer counts as healthy). The image carries `curl` for that: a check that starts Node costs about a
tenth of a second of CPU each time.

The `NUXT_PUBLIC_*` and `NUXT_SECURITY_*` values are runtime config: set them on the container. One container answers the
root domain, every workspace and the admin host.

## The Caddy image (`docker/caddy/Dockerfile`)

`caddy:2.11` built with xcaddy and two modules: `caddy-dns/cloudflare` (DNS-01, for the wildcard certificate) and
`mholt/caddy-ratelimit` (the visitor limit). Versions are pinned in the Dockerfile.

## The Caddyfile (`deploy/Caddyfile`)

Placeholders `{$NAME}` come from the container's environment. One site block serves every host of the root domain, so one
wildcard certificate (plus the apex's) covers all of them. The hosts are split by name:

| Host | Goes to |
| ---- | ------- |
| `<root domain>` and `*.<root domain>` (a workspace, and `admin.<root domain>`) | `frontend:3000` |
| `api.<root domain>` | `backend:8080` (nginx), with HSTS and `nosniff`, an 8 MB body limit and a 130 s response timeout |
| `ws.<root domain>` | `backend:8081` (Reverb), websockets upgraded by Caddy |

The admin host is only another subdomain of the frontend: the frontend tells it apart by `NUXT_PUBLIC_PLATFORM_HOST`.

Every response loses the `Server` and `X-Powered-By` headers and is compressed (zstd, gzip). The frontend's own security
headers pass through unchanged. Timeouts: 10 s for request headers, 60 s for a body, 2 minutes idle. Plain HTTP redirects to
HTTPS with a permanent redirect that keeps the public HTTPS port (`PUBLIC_PORT_SUFFIX`).

### `CADDY_TLS`

| Value | Certificate |
| ----- | ----------- |
| `cloudflare` | a wildcard certificate for `<root domain>` and `*.<root domain>` by the DNS-01 challenge. Needs `CLOUDFLARE_API_TOKEN` (Zone DNS edit) and the zone on Cloudflare |
| `internal` | Caddy's own local CA, for a test on one machine. Browsers warn and curl needs `-k` |

### The rate limit, and why it is where it is

Caddy limits each visitor address to 300 page requests a minute on the frontend hosts. Files under `/_nuxt/`, `/_ipx/` and the
favicon are not counted, since one page loads dozens. The limit is deliberately generous (five a second).

It is on the frontend and not on the API because the frontend's server renders a workspace's public page and reads the API
itself, so every visitor's read reaches the API from one address, the frontend's: a limit by address on the API would treat all
visitors as one. Caddy sees each visitor's real address on the page request. Login and the other API routes have limiters of
their own in the app. If a CDN or proxy sits in front of Caddy, add its ranges to `trusted_proxies` and key the limit by
client address, or every visitor looks like the proxy.

## The stack (`deploy/compose.yml`)

Only Caddy publishes ports (`HTTP_PORT` and `HTTPS_PORT`, 80 and 443 by default). Each container listens on the same number it
publishes. All secrets and choices live in `deploy/.env`, and each service gets only what it needs:

- the **backend** reads the whole file (`env_file`) as the app's environment, except two secrets of the stack that
  `compose.yml` blanks for it: the Postgres superuser password (`DB_ADMIN_USERNAME`, `DB_ADMIN_PASSWORD`) and
  `CLOUDFLARE_API_TOKEN`. Every php-fpm worker sees the container's environment (`clear_env = no`), so a secret the container
  holds is one hole away from code that runs there. A new stack-only secret added to `.env` needs a blank line there too;
- **postgres** gets only the roles and passwords it creates, **caddy** only `ROOT_DOMAIN`, `CADDY_TLS`, the Cloudflare token
  and the ports, and the **frontend** only the `NUXT_*` values it needs;
- Compose also uses the file to fill the `${...}` of `compose.yml`. A value the app cannot run without is required there, and
  the stack refuses to start naming it: `APP_KEY`, `MAIL_FROM_ADDRESS`, `PLATFORM_BOOTSTRAP_ADMINS` and the database and Redis
  passwords. With `BROADCAST_CONNECTION=reverb` the app itself stops at boot naming an empty `REVERB_APP_*` key.

| Service | Image | Notes |
| ------- | ----- | ----- |
| `caddy` | built from `docker/caddy` | the edge. Network aliases `api.<root domain>` and `ws.<root domain>` |
| `backend` | built from `docker/backend` | `APP_ROLE=all`, runs the deploy on every start. Healthcheck on `/healthz`, start period 180 s |
| `frontend` | built from `docker/frontend` | waits for a healthy backend |
| `postgres` | `postgres:18-alpine` | no published port; creates the roles of `deploy/postgres-init/01-roles.sh` |
| `redis` | `redis:8-alpine` | `appendonly yes`, behind `REDIS_PASSWORD` |
| `meilisearch` | `getmeili/meilisearch` | only with `--profile meilisearch`. It needs `MEILISEARCH_KEY` in `.env` (it runs in production mode): with an empty key it exits at once and prints which variable to set |

Volumes: `postgres_data`, `redis_data`, `caddy_data` (certificates and the ACME account: keep it), `caddy_config`, and
`meilisearch_data`. `depends_on` uses `service_healthy` all the way from Postgres and Redis to Caddy. Containers log with a
cap of 3 files of 10 MB. The backend and the frontend drop all Linux capabilities and set `no-new-privileges`.

### Uploaded files need object storage

Keep `ASSETS_DISK=assets` with the `ASSETS_*` values of an S3 bucket or Cloudflare R2 ([Storage](storage.md)). The stack has
no volume for uploads and nginx serves only `backend/public`: with `ASSETS_DISK=local` an upload is written inside the container,
lost when it is recreated and never served. `local` is only for the throwaway test below, which does not exercise uploads.

### Roles in Postgres

`01-roles.sh` makes the four roles of [Production](production.md#database): the schema owner (`DB_MIGRATION_*`), the runtime
role (`DB_USERNAME`), the platform's read-only role with `BYPASSRLS` and `log_statement = 'all'` (`DB_PLATFORM_*`) and the
catalog's writer with `log_statement = 'mod'` (`DB_CATALOG_*`). None is a superuser. There is no test database. It runs only
on an empty volume; changing a password in `.env` later also needs `ALTER ROLE`.

### URLs derived from `ROOT_DOMAIN`

`compose.yml` builds every value that names a host from `ROOT_DOMAIN` (and `PUBLIC_PORT_SUFFIX`, empty on 443), so they cannot
disagree with the Caddyfile. They are not in `.env.example`:

| Variable | Value |
| -------- | ----- |
| `APP_URL` | `https://api.<root domain>` |
| `APP_FRONTEND_URL` | `https://<root domain>` |
| `TENANCY_ROOT_DOMAIN`, `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` | the root domain |
| `PLATFORM_HOST`, `NUXT_PUBLIC_PLATFORM_HOST` | `admin.<root domain>` |
| `NUXT_PUBLIC_API_BASE_URL` | `https://api.<root domain>/api/v1` |
| `DB_HOST`, `REDIS_HOST` | `postgres`, `redis` |
| `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` | `backend`, `8081`, `http`: where the app publishes, inside the stack |
| `REVERB_PUBLIC_HOST`, `REVERB_PUBLIC_PORT`, `REVERB_PUBLIC_SCHEME` | `ws.<root domain>`, the HTTPS port, `https` |
| `REVERB_ALLOWED_ORIGINS` | `<root domain>,*.<root domain>` |
| `NUXT_SECURITY_REALTIME_URL` | `wss://ws.<root domain>` |

The frontend's server and the browser use the same API address (the kit has no separate server-side one). The server reaches
it through Caddy by the network aliases, so the call stays on the private network, with the same TLS and host check as a
browser's. An internal address such as `http://backend:8080` would fail the API's trusted hosts check.

### Healthchecks

| Container | Check |
| --------- | ----- |
| `backend` | `curl http://127.0.0.1:8080/healthz` (nginx alone, no PHP, so a database outage does not restart it). The image's own check also verifies every supervisord program for roles without a port |
| `frontend` | `curl` to `/robots.txt`, every 30 seconds |
| `caddy` | Caddy's admin endpoint on its own loopback |
| `postgres` | `pg_isready` |
| `redis` | `redis-cli ping` |

The framework's `GET /up` (any host) is what a load balancer should call.

## The first super admin

On a new install nobody has an account when the first deploy runs, so `platform:setup` finds no account for the emails of
`PLATFORM_BOOTSTRAP_ADMINS`, prints a warning and the deploy goes on. Sign up with that email on `https://<root domain>/signup`,
then run the deploy again (`docker compose restart backend`): that email becomes a super admin. See
[Set up the first super admin](../guides/set-up-the-first-super-admin.md).

## Running the stack on one machine (the end to end test)

This is the check used to build the images. It needs ports 9080 and 9443 free and nothing else. From the repo root:

1. `cp deploy/.env.example deploy/.env` and set (compose refuses to start without the ones marked required): `ROOT_DOMAIN=localhost`, `CADDY_TLS=internal`, `HTTP_PORT=9080`,
   `HTTPS_PORT=9443`, `PUBLIC_PORT_SUFFIX=:9443`, `NODE_TLS_REJECT_UNAUTHORIZED=0` (Node refuses Caddy's local CA; never in
   production), `AUTH_CAPTCHA_DRIVER=null` with `SIGNUP_REQUIRE_CAPTCHA=false` (the test only), `MAIL_MAILER=log`,
   `MAIL_FROM_ADDRESS` (required) to any address, `ASSETS_DISK=local` (uploads are not covered by this test),
   `PLATFORM_BOOTSTRAP_ADMINS` (required) to a test address, `LOG_LEVEL=debug` to read the verification link from the
   log, and generated values for `APP_KEY`, the five database passwords, `REDIS_PASSWORD` and the three `REVERB_APP_*` keys.
2. `docker compose -p mkprod -f deploy/compose.yml --env-file deploy/.env up -d --build --wait`
3. Check with curl (`-k`, since `*.localhost` resolves to the loopback): `https://localhost:9443/` returns the landing with the
   prices in the HTML, `https://api.localhost:9443/up` returns 200, `https://admin.localhost:9443/` leads to the admin sign-in.
   Sign up through `POST https://api.localhost:9443/api/v1/auth/signup`, read the verification link from
   `docker compose logs backend`, finish it with `POST /auth/signup/verify`, and load `https://<slug>.localhost:9443/`.
   `docker compose exec backend php artisan tenancy:verify-rls` must pass.
4. `docker compose -p mkprod -f deploy/compose.yml --env-file deploy/.env down -v`, then delete `deploy/.env`.

## CI

The "Production images" job of `.github/workflows/ci.yml` builds the three images with buildx and the GitHub Actions cache
(nothing is pushed), lints the Dockerfiles with hadolint, and validates `deploy/compose.yml` with `docker compose config` and a
dummy `.env`.
