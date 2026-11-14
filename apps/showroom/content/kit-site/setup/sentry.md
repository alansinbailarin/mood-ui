# Sentry

Error reporting is optional and off while `SENTRY_LARAVEL_DSN` is empty. Passwords, tokens and the other secret fields are scrubbed before an event leaves the app. The reference is [Sentry](/kit/configuration/sentry).

## Local

Leave the DSN empty. If you want to try it, create a Sentry project for the Laravel platform and use a separate project for development so test errors do not mix with production ones.

## Production

1. Create a Sentry project (platform Laravel) and copy its DSN.
2. Set `SENTRY_LARAVEL_DSN` and `SENTRY_TRACES_SAMPLE_RATE` (`0.1` is the default; `0` sends no traces). Leave `SENTRY_SEND_DEFAULT_PII` off.
3. In `php.ini` set `zend.exception_ignore_args = On`, so call arguments (emails, tokens) stay out of stack traces.
4. Run `php artisan sentry:test` in `backend/` and check that the event shows up in the project.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
