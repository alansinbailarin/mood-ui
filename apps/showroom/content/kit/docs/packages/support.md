# Support

`backend/packages/Support`, namespace `MoodKit\Support\`. The primitives every other package builds on: the
response envelope, the error contract, the request locale, the RLS helper for migrations, the secret
registries for Sentry and the disk uploaded files live on. Support depends on no other package, so every package may use it.

## What it gives

| Class | Use it to |
| ----- | --------- |
| `Http\ApiResponse` | build every API response (`data`, `paginated`, `error`, `errorWithMeta`) |
| `Http\ApiError` | one error of an envelope: `code`, `message`, `field` |
| `Errors\DomainError` | throw an expected business failure with a stable code |
| `Errors\CaptchaFailed` | refuse a request whose captcha failed: 422 `auth.captcha_failed`, as login, password recovery and signup do |
| `Errors\PermissionDenied` | refuse a member who lacks a permission: 403 `auth.forbidden` with `meta.requiredPermission`, as Rbac's `permission:` guard does |
| `Errors\ImpersonationForbidden` | refuse what a super admin acting as someone may not do: 403 `auth.impersonation_forbidden`. Auth's guards throw it, and so does a package that refuses an impersonation in code a route lets through (Team's onboarding step). In Support because more than one package throws it and none may use another's errors |
| `Demo\DemoMode`, `Errors\DemoLocked` | what a public demo (`DEMO_MODE`) locks: `refuse()`, `refuseForAccount($email)`, `refuseForOthers($email)`, `refuseInviteTo($email)` each throw 403 `demo.locked` in a demo and do nothing otherwise, and the `demo-locked` route alias does the same for a whole route. See [Run a public demo](../guides/run-a-public-demo.md) |
| `Demo\DemoSeed`, `Demo\DemoDataProvider` | for demo data: a randomizer drawn from the day and a scope, dates counted from now, a callback run with the clock stopped at a moment, and the interface a module implements (tagged `demo.data`) to give a demo its rows |
| `Http\ApiExceptionRenderer` | (registered for you) turn every exception under `/api` into an envelope |
| `Database\TenantRls` | enable row-level security on a tenant table, in its migration |
| `Database\Ids` | `Ids::canonical($id)`: an id as the database spells it (a uuid in lowercase), and `Ids::canonicalAll($ids)` for a list (each once). Postgres finds a uuid in capitals too, so an id that comes from outside (a path, a body, another package's call) is turned into this spelling where it comes in, before anything keys an array, a lock or a cache by it (Team, Rbac, Branches, Platform) |
| `Database\TransactionLock` | `TransactionLock::take($name)`: a Postgres advisory lock held until the transaction ends, so two transactions that take one name take turns (Settings' saves and logo changes). `TransactionLock::try($name)` does not wait: it says whether it got the lock, for work another transaction holding it is already doing (Notifications' daily summaries). Both refuse outside a transaction. |
| `Database\RuntimeRole` | `RuntimeRole::revoke(RuntimeRole::WRITES, 'plans')`, from a migration: take privileges on tables away from the runtime role, which the first migration grants the rows of every table. Does nothing when the migrations run as the runtime role. |
| `Database\AuditColumns` | `AuditColumns::add($table)`, from a migration: the columns every audit trail keeps of an entry after whose trail it is and who acted (`action`, `resource_type`, `resource_id`, `before`, `after`, `ip`, `user_agent`, `created_at`), so a workspace's trail (Audit's `audit_logs`) and the platform's (`platform_audit_logs`) read alike |
| `Database\PlatformRead` | `PlatformRead::grant('tenant_subscriptions')`, from a migration: let the platform's read-only role SELECT a table (see [the platform context](../concepts/multi-tenancy.md#the-platform-context)). `PlatformRead::grantColumns('users', 'id', 'name', 'email', 'deleted_at')` grants some columns of a table and none of the rest, for a table that also holds something the role must never read. Both refuse a name that is not a plain identifier, and do nothing with no role configured; never grant a table that holds a secret. |
| `Database\GrantedRole` | `GrantedRole::quoted($setting, $missing)`: the role a setting names, quoted and with `USAGE` on the schema, for the grants of a role migrations give tables to (`PlatformRead`, `CatalogWrite`). Null when the setting is empty; a role that does not exist fails with `$missing` (`:role` is its name), which says how to make it. |
| `Database\CatalogWrite` | `CatalogWrite::grant('SELECT, INSERT, UPDATE', 'plans')`, from a migration: let the catalog's writer (`DB_CATALOG_USERNAME`) write a catalog table, privilege by privilege. Only `SELECT`, `INSERT`, `UPDATE` and `DELETE`, never `TRUNCATE` or `ALL`; `CatalogWrite::revoke('plans')` takes them all back, for a migration's `down()`, and the `USAGE` on the schema once the role holds no table of it. Both refuse a name that is not a plain identifier, and do nothing with no role configured. |
| `Database\ReadOnlyTables`, `Database\CatalogTables` | the tables only the schema owner writes, and those the catalog's writer may write: each package adds its own from its provider's `boot()` (`$this->app->make(ReadOnlyTables::class)->add('plans')`), a catalog table with the privileges its migration grants (`$this->app->make(CatalogTables::class)->add('SELECT, INSERT', 'plan_revisions')`; the same table listed again with other privileges throws), and `tenancy:verify-rls` checks the grants against them. Listing a table changes no grant. Each keeps a table once, in the order they came (`ReadOnlyTables` extends `Database\TableList`). |
| `Database\RoleSession` | `$sessions->open($name, ['username' => ..., 'password' => ...])`: a session of its own on the app's database as it is now (a parallel test's included), as another role, registered under `$name`. For the connection of a role only one class opens: Tenancy's `PlatformReads` and `CatalogWriter`. |
| `Database\CatalogWriter` | the connection the super admin's plan editor writes the catalog on, as the catalog's writer (`DB_CATALOG_USERNAME`): `connection()`, `configured()` to know whether there is one, and `reachable()` whether it also signs in (a failure to is reported, masked, and answers false). It commits on its own session. With no role configured, `connection()` throws `CatalogWriterUnavailable` and never falls back to another role. Only Plans' editor and Billing's `PlanPriceOffers` may use it (`tests/Architecture/CatalogWriterTest.php`). See [the catalog's writer](../concepts/multi-tenancy.md#the-catalogs-writer). |
| `Database\SchemaOwner` | the schema owner's connection: the `direct` variant of the default one (`pgsql::direct`, with `DB_MIGRATION_USERNAME`), which Laravel's migrator runs on |
| `Validation\PlainName` | a name people see: at least one visible character, and no control, private-use or formatting characters (direction marks included; the zero-width joiner and non-joiner are allowed). Bytes that are not UTF-8 fail too. (`validation.plain_name`) |
| `Validation\MultilineText` | free text over several lines (a branch's notes, an admin's reason, a waitlist note): line breaks and tabs, any script and the direction marks, but no other control character (a NUL, which Postgres cannot store, included), no bytes that are not UTF-8 and none of the embeddings, overrides and isolates that reorder the text (U+202A to U+202E, U+2066 to U+2069). (`validation.multiline_text`) |
| `Validation\CountryCodes` | `CountryCodes::ALL`: the 249 codes ISO 3166-1 alpha-2 assigns, in capitals, for a rule `Rule::in(CountryCodes::ALL)` (a phone's country in Auth's profile, a branch's country) |
| `Mail\MarkdownText` | escape a value people typed (a person's or a workspace's name) before it goes into a Markdown email, so it cannot become a link, a tag or a style, nor turn the text around it backwards: `MarkdownText::escape($name)` for a value on its own, `MarkdownText::line('pkg::mail.key', ['name' => $name], $locale)` for a translated line with values in it. Both answer an `HtmlString` escaped for Markdown and HTML, so the template prints it with `{{ }}`; never `{!! !!}` in an email template (`MailTemplatesTest`) |
| `Http\Requests\ApiRequest` | the base of every form request: field names from `<package>::validation.attributes`, and the one rule of an email (`EMAIL`: ASCII, `email:strict`), of a new password (`newPassword()`: `Password::defaults()`, set by Auth) and of a captcha token (`CAPTCHA_TOKEN`); `fieldsOtherThan($known)`, the fields of the body a request that takes only its own refuses (a nested rule key names its top field, `items.*.name` takes `items`; a field sent with a dot in its name is one of the rest), with `prohibiting($rules, $fields)` to refuse them (`Validation\Prohibited`, as `validation.prohibited`, whatever they hold, `null`, `''` and `[]` included, where Laravel's `prohibited` lets those through; a dot in a name escaped) and `prohibitedMessages($fields, $message)` for their words. A JSON body that is not an object (an empty `[]` aside) is refused whole, once the request is authorized: 422 `validation.json_object` (`Errors\BodyNotAnObject`) |
| `Http\Requests\ReadsJsonBodyOnly` | make a form request read only its JSON body |
| `Http\LimiterKey` | `LimiterKey::member($request)`: whom a named limiter of members counts, the signed-in person or, with nobody signed in, the address (`->by('settings-logo|'.LimiterKey::member($request))`) |
| `Sessions\BearerPair` | the bearer token of a session kept in a table of its own (the admin host's, the client portal's): `<session id>\|<40 random characters>`, the id a uuid. `BearerPair::of($request->bearerToken())` reads one (its id in lowercase) or answers null for anything else, a member's Sanctum token included (`<uuid>\|<48 characters>`, told apart by its secret's length), before any query; `newSecret()`, `hashOf($secret)` (the SHA-256, all a table keeps), `token($id, $secret)` (shown once) and `$pair->matches($hash)`, in constant time |
| `Sessions\UserAgent` | `UserAgent::kept($request->userAgent())`: the browser a session was opened from as it can be kept and shown, valid UTF-8 (a broken byte as `?`), no control or format characters, trimmed and at most 255 characters, or null (Auth's tokens, the admin's and the portal's sessions) |
| `Http\Requests\UploadSize` | tell a file PHP refused for its size (`refused()`) and the limit to name (`limit()`, the lower of the app's and PHP's), so a request that takes a file answers its own "too large" error rather than `validation.uploaded` |
| `Contracts\PageRequest`, `Pagination\Paginate` | the page a client asks for (`page`, `perPage`; `RULES` for a request's rules, `ApiRequest::pageRequest()` to read it), and the cut of a query by it: `Paginate::of($page, $eloquentQuery, $default)` and `Paginate::rows($page, $query, $default)` page a query with its total in one go (`perPage` is the client's, up to 100, or `$default`, the list's own size or what a caller that reads rows itself asks for); `Paginate::map($page, $map)` turns each row of a page into something else (Auth's `ListsMembers`). `Http\Requests\PagedRequest` is the request of a list that takes only its page |
| `Reporting\SecretHeaders`, `Reporting\SecretFields` | register the headers and body fields that must never reach Sentry (Audit redacts the fields in its entries too) |
| `Reporting\SentryOnlyFields` | register body fields that are no credential but have no business in Sentry (what someone typed, where they are: Geocoding's `query`, `latitude`, `longitude`); Audit does not read it, so an audit entry may keep a key of the same name |
| `Reporting\ScrubSecrets` | (wired in `config/sentry.php`) blank them before an event is sent |
| `Reporting\MaskedFailure` | report a failure whose message may name people: `report(MaskedFailure::of($failure))` keeps its class, message, file and line with every address replaced by `[email]`, and chains nothing; `MaskedFailure::mask($text)` hides the addresses of a text (Notifications and Onboarding) |
| `Cache\CacheGenerations` | key a cached entry by a generation that a forget moves on, so a read that began before the forget cannot store a stale answer where it will be found (Rbac's access, Settings' workspace profile) |
| `Storage\AssetDisk` | write, link and delete uploaded files (see [Storage](#storage)) |
| `Storage\AssetPath` | make the key of an uploaded file, a workspace's, a person's or the platform's, and check a key a client sends back |
| `Branding\PlatformBrand` | the platform's own name, logo and primary color, for what speaks for the platform and not for a workspace (the emails of signup and of an account, the public screens): ask it, never `config('app.name')`. Support binds `ConfiguredPlatformBrand`, which reads `support.brand` (see [Configuration](#configuration)); the Platform package binds one of its own that reads its settings |
| `Context\Impersonation` | who is acting for whom in this request: `begin($impersonatorUserId, $impersonationId)`, `impersonatorId()`, `impersonationId()`, `forget()`. It lives in Laravel's `Context`, hidden, so it never reaches a log line and a job queued during the request carries it to its worker. In Support because Auth writes it and Audit reads it |
| `Contracts\Hours\WeeklyHours`, `Hours\WeekDays` | keep a week of opening (or working) hours the way every package of the kit does (see [Hours](#hours)) |
| `Images\RasterImage` | check what an uploaded picture really is and write it again with GD (see [Pictures people upload](#pictures-people-upload)) |

A `DomainError` subclass implements `errorCode()` and `messageKey()`, and may override `status()` (422 by
default), `field()` (null), `meta()` (empty) and `headers()` (none: headers the answer carries, such as Geocoding's
`Retry-After` on a 429); placeholders of the message go to its constructor.

[Errors and the API](../concepts/errors-and-api.md) documents the envelope and the error codes, and
[Multi-tenancy](../concepts/multi-tenancy.md#row-level-security) documents `TenantRls`.

## Configuration

| Key | Default | Meaning |
| --- | ------- | ------- |
| `support.locales` | `['en', 'es']` | the locales the API answers in. The first is the fallback when `Accept-Language` matches none. |
| `support.platform_reader.username`, `.password` | null (`DB_PLATFORM_USERNAME`, `DB_PLATFORM_PASSWORD`) | the platform's read-only role, for reads across workspaces and the grants of `PlatformRead`. Null: neither. |
| `support.catalog_writer.username`, `.password` | null (`DB_CATALOG_USERNAME`, `DB_CATALOG_PASSWORD`) | the catalog's writer, the role the super admin's plan editor writes the catalog of plans with, and the grants of `CatalogWrite`. Null: the plans are read-only in the admin, and nothing is granted. |
| `support.assets_disk` | `assets` (`ASSETS_DISK`) | the disk of `config/filesystems.php` uploaded files go to. See [Storage](../configuration/storage.md). |
| `support.brand.name` | empty (`PLATFORM_NAME`) | the platform's name in its emails and public screens. Empty: `APP_NAME`. With Platform installed, it is where the admin's Settings start from. |
| `support.brand.logo_url` | empty (`PLATFORM_LOGO_URL`) | an absolute URL of the platform's logo. Empty: the name stands alone. |
| `support.brand.primary_color` | `default` (`PLATFORM_PRIMARY_COLOR`) | the platform's primary color, `#rrggbb`; anything else is `default`, the monochrome brand. |
| `support.demo.enabled` | `false` (`DEMO_MODE`, on only for the word `true`) | the public demo mode: locks, mail to the log, the daily `demo:reset`. See [Run a public demo](../guides/run-a-public-demo.md). |
| `support.demo.password`, `.reset_at`, `.timezone` | `Demo-Password-2026`, `04:00`, `America/Tijuana` (`DEMO_PASSWORD`, `DEMO_RESET_AT`, `DEMO_TIMEZONE`) | the shared accounts' password (public by design), and when the reset runs. |
| `support.demo.caps` | `['uploads' => 20, 'checkout' => 5]` | per person and hour, what the `demo-capped:<bucket>` alias lets a demo do (answers 429 over it). |
| `support.demo.invite_domain`, `.flags` | `example.com`, `['projects.enabled']` | the only domain a demo invites to, and the platform flags the reset turns on. |

No environment variable sets the locales: `php artisan kit:add-locale <code> --name=<Name>` adds one to this file and to
every place that names the languages, and `php artisan i18n:check` checks every language file against English. See
[Add a locale](../guides/add-a-locale.md).

## What its provider does

- Puts `SetLocaleFromRequest` in the `api` group, ahead of every other sorted middleware, so an error any of
  them throws is answered in the request's language.
- Adds `ForceJsonEnvelope` as global middleware. It acts only on `api` and `api/*`: it wraps a JSON response
  that is not an envelope, and adds `X-Robots-Tag: noindex` to every response there, an unmatched path or a
  wrong method included.
- Adds `ApiSecurityHeaders` as global middleware, on the same paths: every response gets
  `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer` (unless the route set a policy of its own),
  and loses `X-Powered-By`.
- Registers `ApiExceptionRenderer` with the exception handler and tells the handler to ignore
  `DomainError`, so domain errors never reach the log or Sentry.
- Makes `db:wipe`, `migrate:fresh`, `migrate:refresh`, `migrate:reset` and `migrate:rollback` refuse to run
  when `APP_ENV` is `production`.
- Binds `SecretHeaders`, `SecretFields` and `SentryOnlyFields` as singletons, one list of each for the whole app.
- Loads its one migration, the first of all, which grants the runtime role the rows of every table the schema owner
  makes. See [Multi-tenancy](../concepts/multi-tenancy.md#the-database-role).
- Registers the `demo-locked` (`RefuseInDemo`) and `demo-capped:<bucket>` (`CapInDemo`) route aliases and, while `DEMO_MODE=true`: forces the default mailer to `log`, stops the boot when a
  `STRIPE_*` variable or the configured secret holds a live key, or the cache is the database (`Demo\DemoGuard`), and schedules `demo:reset` daily. See
  [Run a public demo](../guides/run-a-public-demo.md).
- Registers the `assets:prepare-bucket`, `demo:reset`, `i18n:check` and `kit:add-locale` commands, and binds `Locales\RepoLayout`, where they find
  the backend's packages and the frontend beside it.

It has no routes or events.

## Storage

`Storage\AssetDisk` is the one place uploaded files are written, linked and deleted, on the disk
`support.assets_disk` names. Whatever writes a file reads its address and deletes it through the same class, so the
three never point at different disks. Resolve it from the container.

| Method | Does |
| ------ | ---- |
| `put($key, $contents, $mime)` | writes the file with its type and `Cache-Control: public, max-age=31536000, immutable`; throws when the disk refuses |
| `url($key)` | the file's public address |
| `exists($key)`, `size($key)` | whether it is there, and its size in bytes |
| `head($key, $length)` | at most its first `$length` bytes, read from a stream, for checking what a file really is |
| `mimeType($key)` | the type it was stored with, or `null` |
| `delete($key)` | deletes it; a file that is not there is no error, so a retried deletion succeeds; throws when the disk refuses (the `assets` disk would only answer `false`), so whoever forgets a key knows its file is gone |
| `supportsPresign()` | whether the disk is an S3 disk, which can hand out upload addresses |
| `presignPut($key, $mime, $expiresAt)` | a `PresignedUpload` (`url`, `headers`, `expiresAt`): an address the browser PUTs one file to, straight to the bucket, whose type, size and cache headers S3 does not sign. On a disk that is not S3 it throws `PresignUnavailable`. |

`Storage\AssetPath::forTenant($tenantId, $area, $extension)` makes a new key, `tenants/<workspace>/<area>/<uuid>.<ext>`,
so a file never changes once written. `AssetPath::belongsTo($key, $tenantId, $area)` says whether a key is one
`forTenant()` could have made for that workspace and area: check every key a client sends back with it.

`AssetPath::upload($tenantId)` makes a key in the uploads area, `uploads/<workspace>/<uuid>`, for a file a browser sends
straight to the bucket, and `AssetPath::isUploadOf($key, $tenantId)` checks one a client sends back. Presign only such
keys: S3 cannot sign an upload's type, size or cache headers, so check what lands there and copy it to a key of the
workspace before serving it.

### Pictures people upload

`MoodKit\Support\Images\RasterImage` is the one check for a picture someone uploads: the workspace's logo and a person's
avatar both pass through it.

- `detect($bytes)` says what the bytes really are, `image/png`, `image/jpeg` or `image/webp`, or `null`: never from the
  name or the type the browser sent. A picture larger than 8192 px a side or 16 megapixels is refused before it is decoded.
- `reencode($bytes, $mime, maxSide: 512)` decodes the picture and writes a new file of the same type with GD, so nothing
  but the pixels is kept; with `maxSide` it also shrinks it to fit, keeping its proportions and its transparency.
- `AssetPath::forUser($userId, 'avatar', 'png')` is the key of a person's file (`users/<id>/avatar/<uuid>.png`), next to
  `AssetPath::forTenant()` for a workspace's; `AssetPath::belongsToUser()` checks one a client sends back.
- `AssetPath::forPlatform('brand', 'png')` is the key of a file of the platform itself (`platform/brand/<uuid>.png`), apart
  from every workspace and person; `AssetPath::belongsToPlatform($key, 'brand')` checks one.

`php artisan assets:prepare-bucket` creates the bucket of the assets disk on a local S3 server (MinIO) when it is
missing and sets a policy that lets anyone read the files under `tenants/` and `users/`, and nothing in `uploads/`. It
refuses to run in production. See [Storage](../configuration/storage.md).

## Reading credentials from the JSON body only

A form request that carries a password, a secret or a code uses `ReadsJsonBodyOnly`. Before validation it
empties the query string, and the body too when the request is not JSON, so a secret put in the address
(which access logs, proxies and browser history keep) is never read:

```php
use Illuminate\Foundation\Http\FormRequest;
use MoodKit\Support\Http\Requests\ReadsJsonBodyOnly;

final class ConfirmTransferRequest extends FormRequest
{
    use ReadsJsonBodyOnly;

    public function rules(): array
    {
        return ['code' => ['required', 'string', 'max:64']];
    }
}
```

Every request of Auth uses it, and so do signup start and signup verify.

## Secret registries

A package that reads a credential from a request registers where it travels, from its provider's `boot()`:

```php
$this->app->make(SecretHeaders::class)->add('X-Signup-Token');
$this->app->make(SecretFields::class)->add('verification', 'password', 'claim', 'captchaToken');
```

Names are compared in lowercase. `SecretFields` starts with the names that are never anything but a credential
(`SecretFields::COMMON`: `password`, `pass`, `pwd`, `secret`, `token`, `apikey`, `otp`, `pin`, `cvv`, `dsn`, `cookie` and
the like); Audit redacts every registered name in what an entry stores too. A field that is no credential, only something
Sentry has no need of, goes in `SentryOnlyFields` instead, which only `ScrubSecrets` reads:

```php
$this->app->make(SentryOnlyFields::class)->add('query', 'latitude', 'longitude'); // Geocoding
```
 [Sentry](../configuration/sentry.md) explains what is scrubbed and
[Register secret fields and headers](../guides/register-secret-fields.md) shows the steps.

## Hours

A week of hours, the way every package that keeps one takes and answers it: Team a member's working week, Branches a
branch's opening hours. One span a day at most, in `H:i`, ending after it starts, within the day; a day with no span is
closed (or off).

- `Contracts\Hours\DayHours`: one open day, `weekday` (ISO, Monday 1), `startsAt` and `endsAt` (`H:i`).
- `Contracts\Hours\WeeklyHours`: the open days (`days`, a list of `DayHours`) and `day($weekday)`, null on a closed day.
  Whose week it is, and in which zone its times are, is said by the contract that answers it (`ReadsWorkingHours` in the
  workspace's zone).
- `Hours\WeekDays`:
  - `rules($field = 'days')`: the validation rules of the seven days under `$field`, each once, as
    `{weekday, enabled, startsAt, endsAt}`; the times of a closed day are not read.
  - `worked($validated)`: the open days of what `rules()` validated, as `{weekday, startsAt, endsAt}`.
  - `fromRows($rows)`: a `WeeklyHours` from rows with `weekday`, `starts_at` and `ends_at` (Postgres `time`), in order and
    to the minute, or null with no rows (a week never said).
  - `view($week)`: the seven days as a screen shows them, `{weekday, enabled, startsAt, endsAt}`, with null times on a
    closed day.
- `Http\Requests\WeekRequest`: the form request of a week (`rules()` under `days`, `openDays()` for what `worked()`
  gives); a package's request extends it, as Team's `SaveHoursRequest` and Branches' `SaveBranchHoursRequest` do, so the
  fields are named from the package's own `validation.attributes`.

A table that keeps a week has one row per open day, with a `CHECK` on the weekday (1 to 7) and on the span (`ends_at >
starts_at`), as `team_member_hours` does.

## Limits

- `ForceJsonEnvelope` is a safety net. A controller that returns a raw `response()->json()` gets a generic
  envelope, and its error message is lost. Build responses with `ApiResponse`.
- `ApiResponse::data([])` is sent as a JSON list, `[]`. PHP cannot tell an empty map from an empty list, so
  never answer one resource with an empty array.
