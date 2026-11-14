# The admin host

The platform's own administration lives on a host of its own, `admin.<root domain>` (`admin.example.com`), apart from
every workspace: no workspace context, its own sessions and sign-in, its own limits. Only a super admin signs in there
(see [Set up the first super admin](../guides/set-up-the-first-super-admin.md)). What the panel does is in
[Platform](../packages/platform.md).

## Local development

The admin host is `http://admin.localhost:3000`. Chrome, Firefox and Edge resolve any `*.localhost` name by themselves;
Safari and command-line tools need a line in `/etc/hosts`:

```text
127.0.0.1 admin.localhost
```

`.env.example` leaves `PLATFORM_HOST` empty (it is then `admin.<TENANCY_ROOT_DOMAIN>`, `admin.localhost`) and sets
`NUXT_PUBLIC_PLATFORM_HOST=admin.localhost`, the same host for the frontend.

The panel's sign-in is `http://admin.localhost:3000/platform/login` (`/` goes there). On any other host `/platform` is a
404, and on the admin host every page but the panel's is a 404.

## Production

- **DNS.** The wildcard `*.example.com` record of [Domains](domains.md#2-create-the-dns-records) already points
  `admin.example.com` at the frontend: no new record. Without a wildcard, add an `A`/`AAAA` or `CNAME` for `admin`.
- **Certificate.** The wildcard certificate covers it.
- **Variables.** Leave `PLATFORM_HOST` empty or set it to `admin.example.com`, and set
  `NUXT_PUBLIC_PLATFORM_HOST=admin.example.com`: keep the two alike.
- **Another label.** The host must be exactly one label under `TENANCY_ROOT_DOMAIN`, and a reserved slug, so no workspace
  can take it. `admin` is reserved already; for another label, add it to `backend/packages/Tenancy/config/reserved_slugs.php`
  first. Any other value stops the app at boot, naming `PLATFORM_HOST`, and fails `php artisan platform:verify`.

The API needs nothing new: its CORS and trusted hosts let in the root domain and one label under it, which covers the
admin host.

## What keeps it apart

| Separation | How |
| ---------- | --- |
| No workspace | every route of the admin's API refuses a workspace: an `X-Tenant-Slug` header, or a workspace's host, is 400 `platform.tenant_context_forbidden` (`RefuseTenantContext`) |
| Its own hosts | the sign-in and every route of a signed-in admin answer only on the API's own host (`APP_URL`'s) and the admin host; on the root domain or another label of it they are 404 (`AdminHostOnly`). The public brand and the waitlist answer everywhere |
| Its own guard | the `platform` guard reads sessions of `platform_sessions` only, never Sanctum's tokens |
| Nothing cached | every answer of a signed-in admin's route, a refusal included, is `Cache-Control: no-store, private` with `Referrer-Policy: no-referrer` |
| Tokens that work on one side only | a workspace's token presented to the admin's API is in no session (401), and an admin's token presented to a workspace is in no `personal_access_tokens` (401) |
| Its own sign-in | `POST /api/v1/platform/auth/login`, with a captcha and the `platform-login` limiter; a person who is not a super admin gets the same `auth.invalid_credentials` as a wrong password |
| Short sessions | 8 hours at most (`PLATFORM_SESSION_MINUTES`) and 60 minutes unused (`PLATFORM_IDLE_MINUTES`); taking the role away ends them on the next request |
| Its own limits | `platform` on every change, `platform-impersonation` on entering a workspace as a member, `platform-public` and `platform-waitlist` on the public routes |

## The frontend on that host

- **One build** serves every host: the panel lives under `/platform/**` (the `platform` layer). Its server middleware and
  route middleware keep it there: `/platform/**` is a 404 on any other host, and every other page is a 404 on the admin
  host, whose `/` goes to `/platform`.
- **The session** is a token of `platform_sessions`, kept in `localStorage` of the admin host's own origin under
  `mood-kit.platform-token`: no cookie, nothing a workspace's page can read. The auth layer, which keeps a workspace's
  session, does nothing on this host.
- **Out of search engines**: every page of the host carries `X-Robots-Tag: noindex, nofollow`, and its `robots.txt` is
  `Disallow: /` with no sitemap.
- **A narrower Content Security Policy**: `connect-src` names the API alone (no bucket upload address, no websocket), since
  the panel only talks to the API and shows the bucket's images (`img-src`). See
  [Production](production.md#security-headers).

## Check it

1. `php artisan platform:verify` says where the platform lives.
2. `curl -s https://api.example.com/api/v1/platform/public` answers the platform's name and access mode.
3. The same request with `-H "X-Tenant-Slug: <an existing slug>"` answers 400 `platform.tenant_context_forbidden`.
4. `curl -sI https://admin.example.com/platform/login` carries `X-Robots-Tag: noindex, nofollow`, and
   `curl -s https://admin.example.com/robots.txt` says `Disallow: /`.
