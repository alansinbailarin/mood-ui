# Captcha

Login, password recovery, signup, accepting an invitation to a team and asking for a sign-in code of the client portal can
ask for a captcha. The kit supports Cloudflare Turnstile. Locally no captcha is shown; in production signup and accepting an
invitation refuse every request, and the client portal is unavailable, until Turnstile is configured.

## How it works

| Setting | Side | Meaning |
| ------- | ---- | ------- |
| `AUTH_CAPTCHA_DRIVER` | backend | `null` (default) accepts every request and checks nothing; `turnstile` checks each token with Cloudflare |
| `TURNSTILE_SECRET_KEY` | backend | the widget's secret key. Required by `turnstile`: without it, the first request that needs the captcha fails with a configuration error. |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | frontend | the widget's site key, public. Empty shows no widget. |
| `SIGNUP_REQUIRE_CAPTCHA` | backend | whether signup and accepting an invitation require a real check (below) |
| `CLIENTS_PORTAL_REQUIRE_CAPTCHA` | backend | whether asking for a client portal code requires a real check (below) |

The `turnstile` driver fails closed: no token, an answer other than `success: true`, an error status or an
unreachable Cloudflare (5 second timeout) all count as a failed captcha, answered 422
`auth.captcha_failed`. Login checks the captcha before the credentials. A token longer than 2048 characters is
refused without asking Cloudflare.

## Set up Cloudflare Turnstile

1. In the Cloudflare dashboard, open **Turnstile** and add a widget. A Cloudflare account is needed; the site
   does not have to use Cloudflare's DNS.
2. Add the hostname the widget runs on: the root domain, `example.com`. Workspaces are its subdomains
   (`acme.example.com`); Cloudflare's hostname management covers subdomains of a listed hostname, but check
   the widget on a workspace's sign-in page once it is set up. To try Turnstile locally, add `localhost` to
   a separate widget.
3. Choose the widget mode (managed is the usual choice) and create it.
4. Copy the **site key** and the **secret key**.
5. Set:

```dotenv
AUTH_CAPTCHA_DRIVER=turnstile
TURNSTILE_SECRET_KEY=<secret key>
NUXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>
```

6. Restart the API and the frontend (or rebuild and redeploy them).

Check it: the sign-in page of a workspace and `/signup` on the root domain now show the widget, and
submitting without solving it answers "captcha failed".

Keep both keys in step: a site key without the `turnstile` driver shows a widget whose answer nobody
checks, and the `turnstile` driver without a site key refuses every login, since the form has no token to
send.

## `SIGNUP_REQUIRE_CAPTCHA`

Signup and accepting an invitation to a team (Team's `/join`, which can make an account) are the public forms that
create something, so they can demand a real captcha even when the driver would let them pass. Both follow this setting
(Signup's `ChecksSignupCaptcha`); the platform's waitlist does too. The client portal has a setting of its own (below):
turning this one off never turns the portal's off.

| Value | Result |
| ----- | ------ |
| empty, blank or unset | follows `APP_ENV`: off for `local` and `testing` exactly, on for anything else |
| `true`, `1`, `yes`, `on`, in any case | on |
| `false`, `0`, `no`, `off`, in any case | off |
| anything else | on, so a typo never turns it off |

**On**, a signup with no captcha token is refused with `auth.captcha_failed`, and so is every signup while
`AUTH_CAPTCHA_DRIVER` is `null`. **Off**, the driver alone decides, and `null` lets every signup through.

What this means in practice:

| Environment | `AUTH_CAPTCHA_DRIVER` | `SIGNUP_REQUIRE_CAPTCHA` | Signup |
| ----------- | --------------------- | ------------------------ | ------ |
| `local` | `null` | empty | open, no captcha |
| `production` | `null` | empty | **closed**: every signup is refused |
| `production` | `turnstile` | empty | open, with a captcha |
| `production` | `null` | `false` | open to anyone, for any address; the limits by IP and by address are the only brake |

An environment named `Production`, `prod` or `staging` counts as "anything else": the captcha is required.

Login and password recovery are not affected by `SIGNUP_REQUIRE_CAPTCHA`; they always use the driver as it
is.

## `CLIENTS_PORTAL_REQUIRE_CAPTCHA`

Asking for a sign-in code of the [client portal](../packages/clients.md#signing-in) (`POST /portal/code`) mails whoever the
email belongs to, so it asks for a real captcha by its own setting, `clients.portal.require_captcha`, read from this
variable by `backend/config/clients.php` (Clients' `Portal\PortalCaptcha`). It reads its values as
`SIGNUP_REQUIRE_CAPTCHA` does (empty follows `APP_ENV`: off for `local` and `testing` exactly, on for anything else; a value
it does not recognise is on), and never follows that one: a deployment that opens signup with
`SIGNUP_REQUIRE_CAPTCHA=false` keeps the portal's captcha.

**On**, a request with no captcha token is refused with `auth.captcha_failed`, and while `AUTH_CAPTCHA_DRIVER` is `null`,
which checks nothing, the portal is **unavailable**: `GET /portal` answers `open: false` in every workspace whatever its
setting, and Settings → Client portal tells the workspace its clients cannot sign in yet. **Off**, the driver alone decides,
and `null` lets every request through.

| Environment | `AUTH_CAPTCHA_DRIVER` | `CLIENTS_PORTAL_REQUIRE_CAPTCHA` | Client portal |
| ----------- | --------------------- | -------------------------------- | ------------- |
| `local` | `null` | empty | open where the workspace opened it, no captcha |
| `production` | `null` | empty | **unavailable** in every workspace |
| `production` | `turnstile` | empty | open where the workspace opened it, with a captcha |
| `production` | `null` | `false` | open, with no captcha; the limits by address, email and workspace are the only brake |

## Related

- [Auth](../packages/auth.md) and [Signup](../packages/signup.md#captcha)
- [Production checklist](production.md)
