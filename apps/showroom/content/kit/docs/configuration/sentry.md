# Sentry

The API reports unexpected exceptions to Sentry through `sentry/sentry-laravel`. It is off until you set a
DSN. Before anything leaves, the kit blanks the credentials its own requests carry, on top of what the SDK
blanks itself. The frontend has no Sentry integration.

## Turn it on

1. In Sentry, create a project for the platform **Laravel**.
2. Copy its DSN (Project settings, Client Keys).
3. Set:

```dotenv
SENTRY_LARAVEL_DSN=https://<key>@<organization>.ingest.sentry.io/<project>
SENTRY_TRACES_SAMPLE_RATE=0.1
```

`SENTRY_TRACES_SAMPLE_RATE` is the share of requests sent as performance traces: `0.1` in `.env.example`,
`0` for none. The SDK reads its other settings from the environment too, such as `SENTRY_ENVIRONMENT` and
`SENTRY_RELEASE`; leave `SENTRY_SEND_DEFAULT_PII` off (its default).

To check it, run `php artisan sentry:test` in `backend/`: it sends a test event with the configured DSN
(`--transaction` sends a test trace too), and the event shows up in the project.

## What is reported

- `Integration::handles()` in `backend/bootstrap/app.php` reports unexpected exceptions.
- A `DomainError` is never reported: it is an expected answer (a wrong password, a role in use), not a bug.
- Validation failures and HTTP errors such as 404 follow Laravel's own rules for what is not reported.

## What is scrubbed

`MoodKit\Support\Reporting\ScrubSecrets` runs as `before_send` and `before_send_transaction`
(`backend/config/sentry.php`). It blanks:

- every request header registered in `SecretHeaders`;
- every field registered in `SecretFields` or `SentryOnlyFields`, at any depth, in the body, the query string and the query of
  the URL, and inside a JSON document kept in a string;
- the secret segment of every path registered in `SecretPaths` (the one-click unsubscribe's token), in the request's
  URL, the transaction's name and the trace's and spans' data (the SDK writes the path there as `url`);
- the same headers and fields in a transaction's request data;
- the body data of child spans, which are the app's own calls to other services (the Turnstile check, for
  one): those bodies are not sent at all.

A field is matched by its name in lowercase letters and digits, so `password_` and `Pass-Word` are caught
too. A request body that is neither decoded data, JSON text nor plain form text is replaced whole.

This runs whatever `SENTRY_SEND_DEFAULT_PII` says. The SDK still blanks `Authorization`,
`Proxy-Authorization`, `Cookie`, `Set-Cookie`, `X-Forwarded-For` and `X-Real-IP` itself while that setting is
off.

What the kit registers today:

| Package | Headers | Fields | Paths |
| ------- | ------- | ------ | ----- |
| Auth | none | `password`, `passwordConfirmation`, `token`, `code`, `captchaToken` | none |
| Signup | `X-Signup-Token` | `verification`, `password`, `claim`, `captchaToken`, `invite` | none |
| Notifications | `X-Notification-Token` | `SubscribeURL`, and what SES reports about people: `emailAddress`, `diagnosticCode`, `destination`, `commonHeaders`, `headers` | `api/v1/notifications/unsubscribe/{secret}` |

A field registered by one package is blanked in every request that has it, and in what an audit entry stores (Audit's
`PayloadSanitizer` reads the same list).

Notifications registers SES's fields rather than keeping the bounce webhook's body out whole: the body is JSON SNS
posts as text, with SES's event as JSON inside its `Message`, which ScrubSecrets reads field by field like any other
body. What stays is what a failure needs to be understood (the event's type, the bounce's type, the topic, the message's
id), never an address, a header or a subject. Notifications also reports a failure while dispatching or sending a
notification as Support's `Reporting\MaskedFailure`, its message with every address replaced by `[email]`, and the
original not chained; so does Onboarding for the email of a set-up workspace. A package that reads a new
credential registers it from its provider: see
[Register secret fields and headers](../guides/register-secret-fields.md).

Sentry is the kit's to scrub; your web server's access log is yours. RFC 8058 makes the one-click unsubscribe a single
address to post to, so its token is in the path, and an access log that records paths keeps it. It can only turn that one
category off by email for that one recipient, but treat such logs as you treat the rest of your users' data, or have your
proxy log `/api/v1/notifications/unsubscribe/` without the rest of the path.

## Keep arguments out of stack traces

PHP puts the arguments of every call into an exception's stack trace, and traces reach Sentry. The kit marks
its password, token and secret parameters `#[\SensitiveParameter]`, which keeps those out. For everything
else a call carries (emails, the secrets of a signup or a reset), set this in the production `php.ini`:

```ini
zend.exception_ignore_args = On
```

`php.ini-development` has it `Off`, `php.ini-production` `On`. Check with
`php -i | grep exception_ignore_args`.

## Related

- [Production checklist](production.md)
- [Support](../packages/support.md#secret-registries)
