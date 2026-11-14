# Domains and subdomains

Every workspace lives on a subdomain of one root domain, and the platform's administration lives on its own host. The kit reads the workspace from the host, so one frontend deployment answers the root domain, every `<slug>.example.com` and the admin host. The reference is [Domains](/kit/configuration/domains) and [The admin host](/kit/configuration/admin-host).

## Local

Nothing to set up. `.env.example` already uses `localhost` as the root domain:

```dotenv
TENANCY_ROOT_DOMAIN=localhost
NUXT_PUBLIC_TENANCY_ROOT_DOMAIN=localhost
APP_URL=http://localhost:8000
APP_FRONTEND_URL=http://localhost:3000
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NUXT_PUBLIC_PLATFORM_HOST=admin.localhost
```

- The root domain is `http://localhost:3000`, the demo workspace is `http://demo.localhost:3000` and the admin host is `http://admin.localhost:3000`.
- Most browsers resolve any `*.localhost` name to `127.0.0.1`. If yours or a command-line tool does not, add one line per workspace to `/etc/hosts`, for example `127.0.0.1 demo.localhost`.
- The links the API builds (password reset, workspace switch) keep the port of `APP_FRONTEND_URL`.

## Production

1. Pick a root domain that serves nothing but the product. Every label in front of it becomes a workspace, so a staging copy uses its own root, such as `staging.example.com`.
2. Create DNS records for the root domain, a wildcard `*.example.com` and the API host. The first two point at the frontend, the last one at the API.
3. Get a certificate that covers `example.com` and `*.example.com`. A wildcard certificate needs a DNS challenge with most providers.
4. Set the same root domain on both sides, and the three addresses:

```dotenv
TENANCY_ROOT_DOMAIN=example.com
NUXT_PUBLIC_TENANCY_ROOT_DOMAIN=example.com
APP_URL=https://api.example.com
APP_FRONTEND_URL=https://example.com
NUXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
```

5. The admin host defaults to `admin.<root domain>`. Set `PLATFORM_HOST` and `NUXT_PUBLIC_PLATFORM_HOST` to the same value only if you want another label. `admin` and `api` are reserved, so no workspace can take them.
6. If a load balancer sits in front of the API, set `TRUSTED_PROXIES` to its addresses. Run `php artisan platform:verify` and check that it names the admin host you expect.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
