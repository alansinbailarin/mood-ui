# Captcha

Login, password recovery, signup and the client portal's sign-in code can sit behind a captcha. The kit supports Cloudflare Turnstile. The reference is [Captcha](/kit/configuration/captcha).

## Local

Leave it off. `.env.example` sets `AUTH_CAPTCHA_DRIVER=null`, and `SIGNUP_REQUIRE_CAPTCHA` and `CLIENTS_PORTAL_REQUIRE_CAPTCHA` follow `APP_ENV`: they are off for `local` and `testing`. To try Turnstile locally, Cloudflare publishes test keys; put them in the two key variables below.

## Production

1. In Cloudflare, create a Turnstile widget for your root domain and its subdomains.
2. Set:

```dotenv
AUTH_CAPTCHA_DRIVER=turnstile
TURNSTILE_SECRET_KEY=
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
```

The secret key stays on the server. The site key is public and read by the frontend.

3. Leave `SIGNUP_REQUIRE_CAPTCHA` and `CLIENTS_PORTAL_REQUIRE_CAPTCHA` empty. Outside local and testing they then require a captcha. With the `null` driver that means signup is refused and the portal is unavailable, so the driver comes first.
4. `SIGNUP_REQUIRE_CAPTCHA=false` opens signup to anyone. Do it only if the limits by IP and address are enough for you.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
