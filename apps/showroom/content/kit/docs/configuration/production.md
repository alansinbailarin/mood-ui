# Production checklist

What a deployment needs that the local defaults leave out. Go through it before the first launch, and again
when you add a server or change hosts. Each item links to the page that explains it.

## Environment

- [ ] No `.env` file ships in the image: set real environment variables. See
  [The `.env` file](environment.md#one-file).
- [ ] `APP_ENV=production`, `APP_DEBUG=false`, and a fresh `APP_KEY` (`php artisan key:generate --show`).
- [ ] New values for every password and key `.env.example` gives as a public development default:
  `DB_PASSWORD`, `DB_MIGRATION_PASSWORD`, `DB_PLATFORM_PASSWORD`, `DB_CATALOG_PASSWORD`, the `ASSETS_*` keys and the `REVERB_APP_*` keys.
- [ ] Uploaded files on Cloudflare R2: `ASSETS_DISK=assets` and the `ASSETS_*` keys of your bucket and API token. See
  [Storage](storage.md#in-production-cloudflare-r2). With `SETTINGS_LOGO_PRESIGN=true`, a custom domain with `r2.dev`
  off, the WAF block on `/uploads/` and the lifecycle rule on `uploads/`.
- [ ] `LOG_CHANNEL=stderr` in containers, and `LOG_LEVEL` set on purpose, for example `warning`.
- [ ] `php.ini` has `upload_max_filesize` at least the largest upload the app takes: `settings.logo.max_bytes` and
  `auth-kit.avatar.max_bytes` (2 MiB each) and `clients.import.max_bytes` (5 MiB), so `5M` at least (PHP's default `2M`
  is too little for an import), and `post_max_size` a little above it, `6M` for example (`8M` is PHP's default). A file
  over `upload_max_filesize` is refused before the app sees it, as too large with PHP's lower limit; a body over
  `post_max_size` is 413 `http.error`. See [Settings](../packages/settings.md#the-workspace-logo),
  [Auth](../packages/auth.md#my-profile) and [Clients](../packages/clients.md#the-file).
- [ ] `php.ini` keeps `memory_limit` at `128M` (PHP's default) or more, for the web server and the queue worker alike:
  the largest import of clients takes about 70 MB above what the app itself takes to upload, and about 55 MB to
  preview it or run a part of it (the file is read in memory, never into a temporary file). Raise it if you raise
  `clients.import.max_bytes`. See [Clients](../packages/clients.md#the-file).
- [ ] `php.ini` has `zend.exception_ignore_args = On`, so call arguments (emails, tokens, secrets) stay out
  of stack traces, logs and Sentry. See [Sentry](sentry.md#keep-arguments-out-of-stack-traces).
- [ ] `php.ini` has `expose_php = Off`. The API takes `X-Powered-By` off its answers itself, but PHP adds it to
  everything else it serves.

## Domains

- [ ] DNS for `example.com`, `*.example.com` and the API host, and a certificate for `example.com` and
  `*.example.com`. See [Domains](domains.md).
- [ ] `TENANCY_ROOT_DOMAIN` and `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` set to the same root domain.
- [ ] `APP_URL` is the API's address, `NUXT_PUBLIC_API_BASE_URL` is that address plus `/api/v1`, and
  `APP_FRONTEND_URL` is the root domain's address (`https://example.com`). Both also make the CORS rule: only that
  origin and `https://<slug>.example.com` may call the API from a browser (`backend/config/cors.php`).

## Behind a load balancer

- [ ] `TRUSTED_PROXIES` lists the addresses or CIDR ranges of your load balancer or CDN, comma-separated.

Without it, the API believes no `X-Forwarded-*` header: every request seems to come from the proxy, so the
login limiter counts all your users as one address, and the scheme and host are the proxy's. `*` trusts
whoever calls, which lets anyone who can reach the API directly fake their address: use it only when the API
is reachable through the proxy alone. Leave it empty when nothing sits in front of the API. The billing webhook's
limiter counts the requests it refuses by address too, so behind a proxy it needs `TRUSTED_PROXIES` as well.

## Database

- [ ] Two roles, neither a superuser nor with `BYPASSRLS`, never the managed database's admin user: the **schema
  owner**, which owns the database and every table and runs the migrations (`DB_MIGRATION_USERNAME`,
  `DB_MIGRATION_PASSWORD`), and the **runtime role** the app connects as (`DB_USERNAME`, `DB_PASSWORD`), which owns
  nothing. A table's owner can turn row-level security off and drop the audit triggers; the runtime role can only read
  and write rows. For example:

  ```sql
  CREATE ROLE mood_kit_owner WITH LOGIN NOSUPERUSER NOCREATEROLE NOBYPASSRLS PASSWORD '...';
  CREATE ROLE mood_kit_app WITH LOGIN NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS PASSWORD '...';
  ALTER DATABASE mood_kit OWNER TO mood_kit_owner;
  ```

  `php artisan migrate` (and the `migrate:*` family) connects as the schema owner by itself, unless you pass
  `--database`: the owner is the `direct` variant of the connection (`config/database.php`). Its first migration grants the runtime role `SELECT`,
  `INSERT`, `UPDATE` and `DELETE` on every table the owner makes, and the use of their sequences, through default
  privileges; it never grants `TRUNCATE`, `ALTER` or ownership. A later migration takes the writes back on what only the
  owner writes (the catalogs of plans and of notifications, which `plans:sync` and `notifications:sync` write as the
  owner), so keep the migration credentials where the deploy runs them. Neither role needs `CREATEDB` in production; the
  schema owner has it locally for Pest's parallel test databases. A database whose tables the runtime role already
  owns is moved with `REASSIGN OWNED BY mood_kit_app TO mood_kit_owner;` (as an admin), followed by a `migrate`.
- [ ] The platform's read-only role, for reads across workspaces (`plans:subscriptions`, a platform administrator's
  screens), created as the database superuser before the first migration (the migrations grant it its tables):

  ```sql
  CREATE ROLE mood_kit_platform WITH LOGIN BYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '...';
  ALTER ROLE mood_kit_platform SET default_transaction_read_only = on;
  ALTER ROLE mood_kit_platform SET log_statement = 'all';
  ```

  What keeps the role from writing is its grants: it owns nothing and may only `SELECT` what the migrations grant it.
  `default_transaction_read_only` is a default a session can change, not a guard. `log_statement = 'all'` makes Postgres
  log every statement the role runs, so a read that skipped the app's own log (`platform_reads`) still shows in the
  server's; keep that log where your provider keeps it, and set it as the superuser (some hosted plans set it through
  their console instead).

  Set `DB_PLATFORM_USERNAME` and `DB_PLATFORM_PASSWORD`. Some hosted Postgres plans do not let you give `BYPASSRLS`;
  without the role, leave `DB_PLATFORM_USERNAME` empty: the app runs, and only the reads across workspaces are
  unavailable. A role made after the migrations gets its tables with a fresh `migrate` of a new database, or with
  `GRANT SELECT` on the tables `tenancy:verify-rls` should list. See
  [Multi-tenancy](../concepts/multi-tenancy.md#the-platform-context).
- [ ] The catalog's writer, the role the admin's plan editor writes the catalog of plans and its Stripe prices with,
  created as the database superuser:

  ```sql
  CREATE ROLE mood_kit_catalog WITH LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '...';
  ALTER ROLE mood_kit_catalog SET log_statement = 'mod';
  ```

  Made before the first migration (the migrations grant it the catalog's tables). Set `DB_CATALOG_USERNAME` and
  `DB_CATALOG_PASSWORD` where the web app runs: the admin's plan editor uses it. Without it, the plans are read-only in
  the admin. A role made after the migrations is granted its tables as the schema owner with the statements of
  [The catalog's writer](../concepts/multi-tenancy.md#the-catalogs-writer). `log_statement = 'mod'` makes Postgres log
  every statement of the role that changes something.
- [ ] `php artisan tenancy:verify-rls` passes after the migrations: it fails when the runtime role owns any table,
  view or sequence, or belongs to a role that does, and when the platform role is missing, a superuser, lacks
  `BYPASSRLS`, belongs to any role or has one belong to it, has `CREATEROLE`, `CREATEDB` or `REPLICATION`, owns
  anything, may `CREATE` in the schema, or may write a table or use or change a sequence. When `DB_CATALOG_USERNAME` is set, it also fails when the
  catalog's writer is missing, a superuser, has `BYPASSRLS` or `INHERIT`, belongs to any role or has one belong to it,
  is a role the runtime role may become, has `CREATEROLE`, `CREATEDB` or `REPLICATION`, owns anything, may `CREATE` in
  the schema or the database, logs no writes (`log_statement` neither `mod` nor `all`), may use or change a sequence,
  may `TRUNCATE` a table, add a trigger to or reference one, may reach a schema other than `public` or anything in one,
  may read or write a table outside `Support\Database\CatalogTables` (whole, by a column or through a view), or holds
  more or less of one of them than its migration grants. It lists the tables the platform role reads and the tables the
  catalog's writer writes.
- [ ] `TENANCY_ENFORCE_RLS=true`. The app then refuses a role that is a superuser or has `BYPASSRLS`,
  checked once per process on its first connection. See
  [Multi-tenancy](../concepts/multi-tenancy.md#the-database-role).
- [ ] A direct connection, or a pooler (PgBouncer, your provider's pooler) in **session** mode. The tenant is
  set per database session; transaction mode would leak it between requests.
- [ ] Backups of the database. The audit trail cannot be edited or truncated by the app.

## Mail, captcha and errors

- [ ] A real mailer: SMTP, SES, or Postmark or Resend with their transport installed, and a verified sending
  domain. See [Mail](mail.md).
- [ ] With SES, its bounces and complaints reach the app: an SNS topic in `NOTIFICATIONS_SES_TOPIC_ARNS`, subscribed to
  `/api/v1/webhooks/notifications/ses`, and a configuration set publishing *Bounce* and *Complaint* to it in
  `AWS_SES_CONFIGURATION_SET`. See [Mail](mail.md#bounces-and-complaints-amazon-ses).
- [ ] `NOTIFICATIONS_HASH_KEY` and `NOTIFICATIONS_LINK_KEY` set once, before going live, each to a long random value of
  its own (`openssl rand -hex 32`), or left empty to derive both from `APP_KEY`. Notifications derives a key from each
  with HKDF under a label of its own, so the two never coincide, even from one secret. Rotating one later costs this:
  - the hash key (or `APP_KEY` while `NOTIFICATIONS_HASH_KEY` is empty) names every address in the delivery log, the
    suppression list and the preferences of addresses that are no member. A new key makes them all unknown: every
    address that turned a category off through an email's link is subscribed again, every bounced or complained
    address can be written to again, and "one send per address" starts over. A member's own choices (by their id) stay;
  - the link key (or `APP_KEY` while `NOTIFICATIONS_LINK_KEY` is empty) signs the preference links: every link already
    sent, the center's and the one-click's, stops working (404 `notifications.link_invalid`).

  So set both before you rotate `APP_KEY`, and rotate them only when one has leaked.
- [ ] `AUTH_CAPTCHA_DRIVER=turnstile` with `TURNSTILE_SECRET_KEY` and `NUXT_PUBLIC_TURNSTILE_SITE_KEY`. With
  `SIGNUP_REQUIRE_CAPTCHA` left empty, signup requires a captcha in production, and with the `null` driver
  it refuses every signup. `SIGNUP_REQUIRE_CAPTCHA=false` opens signup to anyone, for any address, with the
  limits by IP and address as the only brake. `CLIENTS_PORTAL_REQUIRE_CAPTCHA` left empty does the same for the client
  portal: with the `null` driver the portal is unavailable in every workspace. See [Captcha](captcha.md).
- [ ] `SENTRY_LARAVEL_DSN`, if you use Sentry. See [Sentry](sentry.md).
- [ ] `NUXT_PUBLIC_SIGNUP_TERMS_URL` and `NUXT_PUBLIC_SIGNUP_PRIVACY_URL` point at your own legal pages, or
  the text of the kit's `/terms` and `/privacy` templates is replaced with yours (they say they are templates).
- [ ] Stripe, if you take payments: the live keys, `billing:sync-plans --live` once, the live webhook endpoint and its
  secret, the Customer Portal (see [Stripe](stripe.md#5-going-live)).

## Maps and geocoding

- [ ] A geocoding provider fit for real traffic: the public Nominatim server allows one request per second for the whole
  app and light use only. Run your own Nominatim (`GEOCODING_NOMINATIM_URL`), or use Google (`GEOCODING_DRIVER=google`,
  a key restricted to the Geocoding API and your servers' IPs) or Mapbox (a secret token, `GEOCODING_CACHE_DAYS=0`), and
  read the provider's terms on storing results. See [Maps and geocoding](maps.md).
- [ ] `GEOCODING_NOMINATIM_EMAIL` set when you use a Nominatim server someone else runs.

## Search index (optional)

- [ ] Nothing to do with `SCOUT_DRIVER=database`, the default: Postgres answers every search.
- [ ] With Meilisearch (`SCOUT_DRIVER=meilisearch`): reached over HTTPS, a `MEILISEARCH_KEY` limited to the clients'
  index (never the master key), `SCOUT_PREFIX` when one Meilisearch serves several installs, a queue worker always
  running, its failed jobs watched (a `RemoveFromSearch` there left a client taken out in the index: `queue:retry` it),
  never `SCOUT_QUEUE=false`, and `scout:sync-index-settings` then `search:reindex` once, in the deploy that turns it on.
  It keeps each client's name, email, phone and home branch's id outside Postgres: say so in your privacy policy if
  someone else runs it. Never `scout:import`. See [Search](search.md#in-production).

## Processes

- [ ] The PHP `gd` extension, built with WEBP: Composer requires it, and the logo upload decodes every image with it.

- [ ] A persistent Redis, shared by every server: cache, queue, scheduler locks.
- [ ] One or more queue workers under a supervisor, restarted on deploy, with the `pcntl` and `posix` PHP
  extensions so job timeouts are enforced.
- [ ] Exactly one scheduler: a cron entry for `schedule:run` every minute, or one `schedule:work` process.
  See [Queues and the scheduler](queues-and-scheduler.md).
- [ ] Realtime: `BROADCAST_CONNECTION`, the three `REVERB_APP_*` keys made for this install, `reverb:start` running and
  behind TLS, `NUXT_SECURITY_REALTIME_URL`, `REVERB_ALLOWED_ORIGINS` set to your root domain and its workspaces (`example.com,*.example.com`, never `*`), Reverb's rate
  limiting on (`REVERB_APP_RATE_LIMITING_ENABLED=true`, `REVERB_APP_RATE_LIMIT_TERMINATE=true`) and a queue worker, which
  publishes the changes (see [Realtime](realtime.md)); or `BROADCAST_CONNECTION=null`.
- [ ] Your load balancer's health check calls `GET /up`, which answers on any host.

## Every deploy

Run these from `backend/`, in this order. On a server that keeps its files between deploys, clear the cached
config first (`php artisan config:clear`), so `migrate` and the rest read the new release's config and not the
old cache; a fresh container or image has no cache to clear.

```bash
php artisan migrate --force
php artisan tenancy:verify-rls
php artisan rbac:sync
php artisan plans:sync
php artisan notifications:sync
php artisan onboarding:verify
php artisan geocoding:verify
php artisan platform:verify
php artisan platform:setup
php artisan auth:warm-dummy-hash
php artisan config:cache
php artisan queue:restart
php artisan reverb:restart
```

| Command | Why |
| ------- | --- |
| `migrate --force` | apply new migrations. `--force` is required in production. |
| `tenancy:verify-rls` | fail the deploy if the runtime role bypasses RLS, owns any table or may write one only the schema owner writes, a tenant table is not isolated, the platform role could do more than read across workspaces, or the catalog's writer could do more than write the catalog |
| `rbac:sync` | give existing workspaces the permissions and roles a release adds. It only adds, never revokes. |
| `plans:sync` | write the catalog of plans of `backend/config/plans.php`, with the features and quota resources the installed packages register, leaving what the super admin edited in the admin as it is (`--forget-edits=<slug>` writes a plan from the config again, see [Plans](../packages/plans.md#the-catalog-in-the-database)); it fails on a catalog that cannot be kept, and forgets every cached plan context. It connects as the schema owner, like `migrate`: run it with `DB_MIGRATION_USERNAME` and `DB_MIGRATION_PASSWORD` set, since the runtime role may only read the catalog. Until it has run once, no workspace can be made. |
| `notifications:sync` | write the catalog of notification channels and event types the installed packages declare; it fails on a registry with a mistake (a default template missing in a language, a variable a template uses and its event does not declare). An event type no package declares any more stays, not available. It connects as the schema owner, like `plans:sync`. |
| `onboarding:verify` | fail the deploy on an onboarding step, template section or workspace template a package declares with a mistake, or an `ONBOARDING_TEMPLATE` no package declares. The registry is built on first use, so without it the first signup would meet the mistake, and its workspace would be undone. |
| `geocoding:verify` | fail the deploy on a `GEOCODING_DRIVER` no package registers (a typo, the old `null`: the driver that finds nothing is `none`), which would otherwise stop the first search; warn when production searches the public Nominatim server |
| `platform:verify` | fail the deploy on a platform setting that cannot work, naming its variable: a `PLATFORM_HOST` a workspace could take, a `PLATFORM_ACCESS_MODE` that is not `open`, `waitlist` or `closed`, an entry of `PLATFORM_BOOTSTRAP_ADMINS` that is not an email, a platform flag a package declares with a mistake; it says who may sign up (the mode chosen in the admin panel, else `PLATFORM_ACCESS_MODE`) and warns when the admin's sign-in checks no captcha |
| `platform:setup` | make the first super admins from `PLATFORM_BOOTSTRAP_ADMINS` while the platform has none; once it has one it does nothing, and two at once take turns under a lock. It connects as the schema owner, like `plans:sync`. See [Set up the first super admin](../guides/set-up-the-first-super-admin.md). |
| `auth:warm-dummy-hash` | make the hash unknown-email logins are checked against, so their timing matches from the first request |
| `config:cache` | the kit reads `env()` only in `backend/config`, so the config can be cached |
| `queue:restart` | workers pick up the new code |
| `reverb:restart` | the Reverb server picks up the new code (nothing to restart with `BROADCAST_CONNECTION=null`) |

`notifications:sync` also writes the event types of Billing. `billing:sync-plans` is not part of every deploy: run it by
hand when a price of the catalog changes (see [Stripe](stripe.md)).

`db:wipe`, `migrate:fresh`, `migrate:refresh`, `migrate:reset` and `migrate:rollback` refuse to run when
`APP_ENV=production`.

To run one command with a privileged database role, set `TENANCY_ENFORCE_RLS=false` for that command only,
with the config uncached: once `config:cache` has run, Laravel reads no environment variable, so an override
on the command line changes nothing. Run `php artisan config:clear`, then the command with the override, then
`php artisan config:cache` again.

## Frontend

- [ ] Build with `pnpm --filter ./frontend build` and run the server it produces with
  `node frontend/.output/server/index.mjs`. The `NUXT_PUBLIC_*` values are runtime config: set them in that
  server's environment, and they apply when it starts. It listens on `PORT` (default `3000`) and `HOST`
  (default all interfaces); `NITRO_PORT` and `NITRO_HOST` take precedence over them.
- [ ] The API lets a browser in only from the frontend's origins, the root domain and `https://<slug>.example.com`
  (`backend/config/cors.php`, built from `TENANCY_ROOT_DOMAIN` and `APP_FRONTEND_URL`): see
  [Domains](domains.md#cross-origin-requests-and-cookies).
- [ ] The frontend answers on the root domain and on `*.example.com`.
- [ ] `NUXT_SECURITY_ASSETS_URL` is the bucket's public address (`ASSETS_URL`) and, with `SETTINGS_LOGO_PRESIGN=true`,
  `NUXT_SECURITY_ASSETS_UPLOAD_URL` is its S3 endpoint (`ASSETS_ENDPOINT`). Without them the Content Security Policy
  blocks the logos and the uploads. See [Security headers](#security-headers).
- [ ] Served over HTTPS only: the build sends HSTS for a year, subdomains included.

## Security headers

The frontend's server sends these on every response, files included (route rule `/**` in
`frontend/layers/core/nuxt.config.ts`, values in `layers/core/app/utils/security-headers.ts`):

| Header | Value |
| ------ | ----- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`, from a production build only |

Every page it renders also gets a `Content-Security-Policy`, built for that page by
`layers/core/server/plugins/security-headers.ts` (production builds only: the dev server injects scripts of its own).
Nuxt's `X-Powered-By` is removed, in development too.

| Directive | Allows |
| --------- | ------ |
| `default-src` | `'self'` |
| `script-src` | `'self'`, the `sha256` hash of each inline script of that page (the color-mode script in `<head>`, Nuxt's config and its import map), and `https://challenges.cloudflare.com` when `NUXT_PUBLIC_TURNSTILE_SITE_KEY` is set. No `'unsafe-inline'`, no `'unsafe-eval'`. |
| `style-src` | `'self' 'unsafe-inline'`: Vue and mood-ui set `style` attributes, which a hash cannot cover |
| `img-src` | `'self' data: blob:`, the origin of `NUXT_SECURITY_ASSETS_URL`, and the map's origins (below) |
| `font-src` | `'self' data:` |
| `connect-src` | `'self'`, the origin of `NUXT_PUBLIC_API_BASE_URL`, of `NUXT_SECURITY_ASSETS_URL`, of `NUXT_SECURITY_ASSETS_UPLOAD_URL`, of `NUXT_SECURITY_REALTIME_URL` (Reverb's websocket), and the map's origins (below) |
| `frame-src` | Turnstile's origin when the captcha is on, else `'none'` |
| `frame-ancestors` | `'none'` |
| `object-src` | `'none'` |
| `base-uri`, `form-action` | `'self'` |

The map's origins are those of `NUXT_PUBLIC_MAP_STYLE_URL` and `NUXT_PUBLIC_MAP_TILES_URL` (OpenStreetMap's tiles by
default) and each of `NUXT_SECURITY_MAP_ORIGINS`: origins only, never a key a style's address carries. MapLibre's worker is
its CSP build, served by the frontend itself, so no `blob:` script or worker is allowed. See [Maps](maps.md#the-map).

On the admin's host (`NUXT_PUBLIC_PLATFORM_HOST`) the policy is narrower: `connect-src` is `'self'` and the API's origin
only (no bucket, no presigned upload, no websocket, no map: the panel talks to the API alone and only shows the bucket's images),
and every page carries `X-Robots-Tag: noindex, nofollow`. Its `robots.txt` is `Disallow: /`, with no sitemap.

The hashes are taken from the HTML the server sends, so a page gets its policy only when it is rendered whole. If you
turn on Nuxt's streamed rendering (`streaming` in a route rule), that route gets no Content Security Policy. A script of
your own goes in a file (`'self'`); an inline one added through `useHead` is hashed like the others. A third-party
script, frame or API you add needs its origin in `contentSecurityPolicy()`.

| Variable | Default | Is |
| -------- | ------- | -- |
| `NUXT_SECURITY_ASSETS_URL` | empty | the bucket's public address, where logos load from: `ASSETS_URL` |
| `NUXT_SECURITY_ASSETS_UPLOAD_URL` | empty | where the browser sends a presigned upload: `ASSETS_ENDPOINT` (the R2 endpoint) |
| `NUXT_SECURITY_REALTIME_URL` | empty | where the browser opens Reverb's websocket (`wss://ws.example.com`); see [Realtime](realtime.md) |

They are server-only runtime config: set them in the frontend server's environment.

### Where the session token lives

The API signs in with a bearer token, which the browser keeps in `localStorage` (`mood-kit.token`), one per workspace
origin. A script running in the page can read it, so a cross-site scripting hole would let an attacker use the session
until it expires (`SANCTUM_TOKEN_TTL_MINUTES`) or the person signs out. An `HttpOnly` cookie would keep the token from
scripts, but would bring back CSRF protection and cookies shared across the workspaces' subdomains. The kit keeps the
bearer design and relies on the Content Security Policy above, which runs no script that is not the frontend's own or
hashed, and on Vue escaping what it renders. Never render HTML from data (`v-html`) and never add `'unsafe-inline'` to
`script-src`.

## After the first deploy

- [ ] `https://api.example.com/up` answers 200.
- [ ] `platform:setup` made the first super admin (see [Set up the first super admin](../guides/set-up-the-first-super-admin.md)),
  and the admin host answers (see [The admin host](admin-host.md#check-it)).
- [ ] Sign up on `https://example.com/signup`, receive the email, confirm, and land in the new workspace.
- [ ] A password reset email arrives.
- [ ] `https://<slug>.example.com/robots.txt` disallows crawlers.
- [ ] On an app that had workspaces before the Plans package, run `php artisan plans:start-subscriptions` once: each
  workspace with no subscription gets one to the default plan. It is safe to run again. See
  [Plans](../packages/plans.md#subscriptions).
