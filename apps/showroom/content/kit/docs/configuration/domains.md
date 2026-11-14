# Domains

Workspaces live on subdomains of one root domain: `acme.example.com`, `globex.example.com`. This guide sets
up the domain, the DNS records and the settings that must agree, for local development and for production.

## How the hosts are split

| Host | Served by | What lives there |
| ---- | --------- | ---------------- |
| `example.com` | the Nuxt frontend | home page, `/signup`, `/find-workspace` |
| `<slug>.example.com` | the same Nuxt frontend | a workspace: `/login`, `/dashboard`, everything signed in |
| `admin.example.com` | the same Nuxt frontend | the platform's administration, for super admins (see [The admin host](admin-host.md)) |
| `api.example.com` (or any host you choose) | the Laravel API | `/api/v1/...` and `/up` |

One frontend deployment answers the root domain and every workspace; it reads the workspace from the host.
The API can live anywhere, because the frontend tells it the workspace in the `X-Tenant-Slug` header. `api`
is a reserved slug, so `api.example.com` is never mistaken for a workspace, and so is `admin`.

## Local development

Nothing to set up. The root domain is `localhost`:

| Setting | Value in `.env.example` |
| ------- | ----------------------- |
| `TENANCY_ROOT_DOMAIN` | `localhost` |
| `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` | `localhost` |
| `APP_FRONTEND_URL` | `http://localhost:3000` |
| `APP_URL` | `http://localhost:8000` |
| `NUXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` |

The root domain is http://localhost:3000 and the demo workspace is http://demo.localhost:3000. Most browsers
resolve any `*.localhost` name to `127.0.0.1` themselves. Command-line tools and some browsers do not; for
them, add one line per workspace to `/etc/hosts`:

```text
127.0.0.1 demo.localhost
127.0.0.1 acme-studio.localhost
127.0.0.1 admin.localhost
```

Links the API builds (password reset, workspace switch, the end of a signup) keep the port of
`APP_FRONTEND_URL`, so they stay on `:3000`.

## Production

### 1. Choose the root domain

Use a domain, or a subdomain, that serves nothing but the product: every label in front of it becomes a
workspace. A staging environment can use `staging.example.com` as its root domain; its workspaces are then
`acme.staging.example.com`. A workspace slug is one label, so `a.b.example.com` is never a workspace.

### 2. Create the DNS records

At your DNS provider, point the root domain and a wildcard below it at the frontend, and the API host at the
API:

| Name | Type | Points to |
| ---- | ---- | --------- |
| `example.com` | `A`/`AAAA`, or `ALIAS`/`CNAME` where the provider allows one at the apex | the frontend |
| `*.example.com` | `A`/`AAAA` or `CNAME` | the frontend |
| `api.example.com` | `A`/`AAAA` or `CNAME` | the API |

A specific record such as `api.example.com` takes precedence over the wildcard, so the API host still
reaches the API.

The frontend needs a TLS certificate valid for both `example.com` and `*.example.com`. A wildcard
certificate is usually issued through a DNS challenge; check what your host or certificate authority
supports.

### 3. Set the variables

```dotenv
# Backend
APP_URL=https://api.example.com
TENANCY_ROOT_DOMAIN=example.com
APP_FRONTEND_URL=https://example.com

# Frontend
NUXT_PUBLIC_TENANCY_ROOT_DOMAIN=example.com
NUXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1
```

`TENANCY_ROOT_DOMAIN` and `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` must be the same domain. An empty frontend value
is an error the app reports by name, not a silent fallback.

### 4. Check it

1. `curl -i https://api.example.com/up` answers `200`.
2. `curl -s https://api.example.com/api/v1/tenant -H "X-Tenant-Slug: <an existing slug>"` answers the
   workspace's `{slug, name}` in the envelope. An unknown slug answers `tenancy.not_found`.
3. `https://<slug>.example.com/login` shows the workspace's sign-in page; an unknown slug shows the
   "workspace unavailable" page.
4. `https://example.com/robots.txt` allows crawlers; `https://<slug>.example.com/robots.txt` disallows them.

## The frontend URL

`APP_FRONTEND_URL` (`tenancy.frontend_url`, the one key every package reads) is where the links the API sends point to:

- **Workspace links** (the password reset email, a workspace switch, the end of a signup) take only its
  scheme and port. The host is always `<slug>.<TENANCY_ROOT_DOMAIN>`, built from the workspace's slug, never
  from a request header.
- **The signup verification link** uses it whole: `<APP_FRONTEND_URL>/signup/confirm#verification=...`. So it
  must be the root domain's address, `https://example.com`, with no path.

## Trusted hosts

Outside `APP_ENV=local`, the API answers only requests whose `Host` is the host of `APP_URL` or the root
domain, or a subdomain of either (`bootstrap/app.php`). Any other host is refused. The health check `/up` is
the exception: it answers on any host, so a load balancer can call it by IP or internal name.

Behind a proxy, also set `TRUSTED_PROXIES`, or the scheme, host and client address the API sees are the
proxy's. See [Production checklist](production.md#behind-a-load-balancer).

## Cross-origin requests and cookies

The frontend and the API are different origins, and the API authenticates with a bearer token, not a
cookie. `backend/config/cors.php` lets in, on `api/*`, only the frontend: the root domain and one label under it (a
workspace, `<slug>.<root domain>`), with the scheme and port of `APP_FRONTEND_URL`, built from `TENANCY_ROOT_DOMAIN`
and `APP_FRONTEND_URL`. Any other origin, a deeper subdomain or another scheme or port gets no
`Access-Control-Allow-Origin`, so a browser keeps a page elsewhere from reading the answers. The allowed headers are
the ones the kit sends (`Authorization`, `X-Tenant-Slug`, `X-Signup-Token`, `X-Notification-Token`, `Accept`,
`Accept-Language`, `Content-Type`, `X-Requested-With`); a module that sends another adds it there. No credentials (cookies) are allowed.

The API's routes start no session, so `SESSION_DOMAIN` and the other `SESSION_*` settings do not affect the
kit's own features.
