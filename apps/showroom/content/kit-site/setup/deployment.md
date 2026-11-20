# Deployment

The kit is not tied to a host. What it defines is what a deployment needs and the commands to run on every deploy: the [production checklist](/kit/configuration/production) is the reference, and this page is a map to it.

## Local

You do not deploy locally. Run the kit as [Getting started](/kit/getting-started) describes: Docker Compose for the services, then the API, the frontend, the queue worker and the scheduler in separate terminals.

## Production

The pieces a deployment has to run:

- the Laravel API behind PHP-FPM (or any PHP host), answering `GET /up` on any host;
- the Nuxt frontend, built with `pnpm --filter ./frontend build` and started with `node frontend/.output/server/index.mjs`, answering the root domain and `*.example.com`;
- PostgreSQL with the roles of [Database and its roles](/kit/setup/database), and a persistent Redis;
- one or more queue workers, exactly one scheduler, and Reverb if you keep realtime on.

On every deploy run these from `backend/`, in this order:

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

The checklist explains each command. The frontend, `APP_ENV=production`, `APP_DEBUG=false`, the HTTPS-only rule and the security headers are covered there too.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
