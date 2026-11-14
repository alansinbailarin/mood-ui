# Register secret fields and headers

When a request of your package carries a credential (a password, a token, a one-time code, an API key), the
value must never reach Sentry. Support blanks every header and body field that packages register; this guide
registers yours and keeps the value out of stack traces too.

## 1. Register the names

In your service provider's `boot()`:

```php
use MoodKit\Support\Reporting\SecretFields;
use MoodKit\Support\Reporting\SecretHeaders;
use MoodKit\Support\Reporting\SecretPaths;

public function boot(): void
{
    $this->app->make(SecretHeaders::class)->add('X-Webhook-Signature');
    $this->app->make(SecretFields::class)->add('apiKey', 'otp');
    $this->app->make(SecretPaths::class)->add('api/v1/invites/{secret}/accept');
}
```

- **Headers** are matched by name, in any case. `Authorization` and `Cookie` need no entry: the Sentry SDK
  blanks them itself.
- **Fields** are matched by name in lowercase letters and digits, at any depth, in the body, the query
  string and the URL's query, and inside a JSON document kept in a string. `apiKey` also catches `api_key`
  and `API-Key`.
- **Paths** name the segment that holds the credential as `{secret}`, for a route that has to carry one in its address
  (a link someone posts to, as RFC 8058's one-click unsubscribe). That segment is blanked in the URL, the transaction's
  name and the trace data. Prefer a header or the body: a path also reaches your access logs, which are yours to
  configure.
- A name registered by any package is blanked in every request that has it. Auth already registers
  `password`, `passwordConfirmation`, `token`, `code` and `captchaToken`; Signup registers `verification`,
  `password`, `claim` and `captchaToken`, and the header `X-Signup-Token`; Notifications the header
  `X-Notification-Token` and the path `api/v1/notifications/unsubscribe/{secret}`.
- Audit redacts the fields of `SecretFields` in what its entries store too. A field that is no credential, only something
  Sentry has no need of (what someone typed, where they are), goes in `SentryOnlyFields` instead: blanked in Sentry the
  same way, left alone in audit entries. Geocoding registers `query`, `latitude` and `longitude` there:

  ```php
  $this->app->make(SentryOnlyFields::class)->add('query', 'latitude', 'longitude');
  ```
- Register from the package, never from `backend/app`.

## 2. Read the credential from the JSON body only

A credential in the query string ends up in access logs, proxies and browser history. Give the form request
`ReadsJsonBodyOnly`, which drops the query string (and a body that is not JSON) before validation:

```php
use Illuminate\Foundation\Http\FormRequest;
use MoodKit\Support\Http\Requests\ReadsJsonBodyOnly;

final class ConnectAccountRequest extends FormRequest
{
    use ReadsJsonBodyOnly;

    public function rules(): array
    {
        return ['apiKey' => ['required', 'string', 'max:255']];
    }
}
```

Credentials that identify a resource on a `GET` (as Signup's status token) go in a header, never in the
path or the query.

## 3. Keep it out of stack traces

Mark every parameter that holds the credential `#[\SensitiveParameter]`, so PHP leaves it out of an
exception's trace:

```php
public function handle(string $accountId, #[\SensitiveParameter] string $apiKey): void
```

In production, `zend.exception_ignore_args = On` in `php.ini` covers every other argument. See
[Sentry](../configuration/sentry.md#keep-arguments-out-of-stack-traces).

## 4. Keep it out of storage

- Store a token or code only as a hash (SHA-256 for random tokens, `Hash::make()` for passwords), never in
  plain text, and never in a queue payload or an audit entry.
- A queued mailable or job that must carry a secret implements `Illuminate\Contracts\Queue\ShouldBeEncrypted`,
  as `SignupVerificationMail` does.
- The audit log redacts the fields you register here, and keys named like secrets, on its own (see
  [Audit](../packages/audit.md#secrets-are-redacted)), but do not rely on it.

## 5. Test it

Add a feature test that shows what the package registers, as Signup's `SignupStatusTest` and Auth's
`LoginTest` do. It needs the application booted, so put it in the package's `tests/Feature/` (here
`backend/packages/Billing/tests/Feature/SecretsTest.php`), not in `tests/Unit/`:

```php
use MoodKit\Support\Reporting\SecretFields;
use MoodKit\Support\Reporting\SecretHeaders;

it('keeps the webhook credentials out of Sentry', function (): void {
    expect(resolve(SecretHeaders::class)->has('X-Webhook-Signature'))->toBeTrue()
        ->and(resolve(SecretFields::class)->has('apiKey'))->toBeTrue();
});
```
