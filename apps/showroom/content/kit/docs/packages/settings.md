# Settings

`backend/packages/Settings`, namespace `MoodKit\Settings\`, with the `settings` frontend layer. Each workspace's
settings, saved by group and key: its identity (name, brand color, logo) and its localization (timezone, language,
currency), each key with a version and a history.

## Permissions and the menu

| Permission | Lets a member |
| ---------- | ------------- |
| `settings.view` | see the workspace's settings |
| `settings.edit` | change them. Needs `settings.view`, which a role saved with it gets too. |

Neither is the owner's alone, so the owner and the manager roles of every workspace hold both, and the member role
neither. On an installation that already has workspaces, run `php artisan rbac:sync` after the deploy that brings
this package, so their roles get the two permissions.

The menu gets **Settings** (`/dashboard/settings`, icon `cog-6-tooth`) in the `admin` section, at order 90, for whoever
holds `settings.view`.

## Groups and keys

A **group** is what one section of the settings page edits and one save writes: `identity`, `localization`, or a
module's own. A **key** is one value of a group (`identity.primaryColor`). Each workspace has one row per group and key
in `tenant_settings`, with a `version` that goes up by one on every change; a key with no row is worth its default, at
version 0. Groups are not listed in the database: packages declare them in code, and the database only checks that
slugs and keys have the right shape.

A package declares its groups with a `MoodKit\Settings\Contracts\SettingsGroupProvider`, bound and tagged
`settings.groups`. See [Add a settings group](../guides/add-a-settings-group.md).

`SettingsGroup($slug, $labelKey, $descriptionKey, $keys, order: 0, permission: null, meta: null, editPermission: null)`:

| Argument | Meaning |
| -------- | ------- |
| `slug` | its address (`/settings/{slug}`): lower case letters, digits and `_`, starting with a letter. Unique. |
| `labelKey`, `descriptionKey` | translation keys, shown in the language of the request. The description may be `null`. |
| `keys` | its `SettingKey`s, at least one |
| `order` | where it comes among the groups; equal orders go by slug. The kernel's are 10 and 20. |
| `permission` | one permission more, needed to see the group and to change it, besides `settings.view` and `settings.edit` |
| `meta` | a class implementing `GroupMeta`, whose `meta($tenantId)` is sent with the group: the options of a select, an address |
| `editPermission` | the permission that changes the group **instead of** `settings.edit`, for a module whose settings belong with the rest of its own (Notifications' sender name takes `notification_settings.edit`). `null`: `settings.edit` |

`SettingKey($name, $rules, $default = null, $labelKey = null, defaultFor: null, normalize: null, writeThrough: null)`:

| Argument | Meaning |
| -------- | ------- |
| `name` | camelCase, unique in its group, never `versions` or `confirm` (the save request uses them) |
| `rules` | Laravel validation rules for a value sent. A key sent is always required: `null` is never a value. A JSON body keeps its types, so use the strict forms (`integer:strict`, `boolean:strict`), or a `normalize` that casts, for a value you compare or store as a number or a flag. |
| `default` | what the key is worth before anyone saves it |
| `labelKey` | a translation key that names the key in validation messages |
| `defaultFor` | a closure that takes the workspace id and works the default out, instead of `default` |
| `normalize` | a closure that turns a value into the one stored (trimmed, lower case). It runs before the rules, on whatever was sent, so it must take any value and leave alone what it does not know. |
| `writeThrough` | a closure run inside the save's transaction with the workspace id and the new value, for a key another table also keeps |

The registry (`MoodKit\Settings\Registry\SettingsRegistry`) gathers every tagged provider on first use and checks
them all: a slug or a key of the wrong shape, a slug declared twice, a key declared twice, a group with no keys or a
`meta` that does not implement `GroupMeta` throws `InvalidSettingsRegistry`, a mistake in code that fails the first
request that uses settings. A group nobody declared answers 404 `settings.group_not_found`.

## The kernel's groups

`MoodKit\Settings\KernelSettingsProvider` declares two.

| Key | Rules | Default |
| --- | ----- | ------- |
| `identity.name` | a string of 2 to 80 characters once trimmed (invisible characters at its ends too), one line of visible characters, with no control, private-use or formatting characters (the zero-width joiner and non-joiner aside), none of which turn the direction of the text | the workspace's name (`tenants.name`) |
| `identity.primaryColor` | `#rrggbb`, or `default`; stored in lower case | `default` |
| `localization.timezone` | any timezone PHP knows | `SETTINGS_DEFAULT_TIMEZONE` |
| `localization.locale` | one of `support.locales` | `SETTINGS_DEFAULT_LOCALE` |
| `localization.currency` | one of `settings.currencies` | `SETTINGS_DEFAULT_CURRENCY` |

`default` as a color means the monochrome palette, black and white, which every new workspace starts with; any
`#rrggbb` gives the workspace a palette made from that color.

The `meta` of `identity` is `swatches` (each `name`, `label` in the language of the request and `hex`), `logoUpload`
(`direct` or `presign`, from `SETTINGS_LOGO_PRESIGN`) and `logoMaxBytes`. The `meta` of `localization` is `timezones`,
`currencies` and `locales`, as codes: the browser names them in its own language.

## Where timezone, language and currency live

A workspace's timezone, language and currency are settings of the `localization` group, not columns of `tenants`: they
have versions, history and audit like any setting. Until the workspace saves one, it is worth the
`SETTINGS_DEFAULT_*` value.

The currency is the one the workspace's modules use for prices. The kernel prices nothing with it, so saving it changes
nothing until a module of yours reads it, with `currency()` of Settings' `Contracts\ReadsWorkspaceSettings`. The screen
says so under the field.

The workspace's name is the setting `identity.name`. Until it is saved it is worth the name the workspace was created
with. Saving it also writes `tenants.name`, in the same transaction, which is what the tenant endpoint, the workspace
switcher and the emails read. After a workspace is created, only this setting writes its name.

## Saving: versions and conflicts

`MoodKit\Settings\Actions\UpdateSettings` is the one way a setting is written, by the API and by code alike. It saves
the keys of one group in one transaction.

- Each key has a `version`, 0 until it is first saved. The client sends back the version it read for every key it
  saves. If one differs from the saved version, someone saved in between: nothing is saved and the answer is 409
  `settings.version_mismatch`, with `meta.currentVersions`, the version of every key of the group, so the client can
  load the group again. Code that saves over whatever is there passes no versions.
- A value is normalized (a name trimmed, a color in lower case) and then compared with the saved one. A value equal to
  the saved one writes nothing: no row, no new version, no history, no audit entry and no event. A save that changes
  nothing at all answers the group as it is.
- Each changed key is written with its version plus one, by the person saving (`updated_by`). A key with a
  `writeThrough` (the workspace name) also writes the other table, in the same transaction.
- The change goes to the audit trail as `settings.group.updated`, resource `SettingsGroup` and the group's slug, with what
  each changed key was before and became.
- Two saves of the same group in the same workspace wait for each other (a transaction lock per workspace and group),
  so two first saves of a key, both read at version 0, cannot both pass: the second gets the 409.

## Confirming a change that affects existing records

A module can say that a change would affect records it already has: a new timezone moves the hour of upcoming
appointments, for example. It implements `MoodKit\Settings\Contracts\ChangeImpactProvider`, bound and tagged
`settings.change_impacts`:

```php
final readonly class UpcomingAppointmentsImpact implements ChangeImpactProvider
{
    public function impacts(string $tenantId, string $group, string $key, mixed $from, mixed $to): array
    {
        if ($group !== 'localization' || $key !== 'timezone') {
            return [];
        }

        return [new ChangeImpact('booking::impacts.upcoming', Appointment::query()->upcoming()->count())];
    }
}

// In the module's service provider:
$this->app->tag([UpcomingAppointmentsImpact::class], 'settings.change_impacts');
```

It is asked for every changed key, inside the save's transaction and as the workspace, so keep it to a count.
`ChangeImpact($labelKey, $count)` is a message with `:count` in it; a count of 0 is no impact. When any provider reports
one, nothing is saved and the answer is 409 `settings.confirmation_required` with `meta.impacts`, a list of
`{group, key, label, count}`, the label in the language of the request. The client shows them and sends the same save
again with `"confirm": true`, which saves it.

## Events

`MoodKit\Settings\Events\SettingsChanged` (`tenantId`, `group`, `keys`, `actorUserId`) is sent once the transaction
that saved the settings commits, never for a save that rolled back, with the keys whose value changed. A save that
changes nothing sends none.

## History

Every value a key ever had is kept in `tenant_setting_history`: the first value saved and every change of it, each with
the value before (`null` for the first), the value after, the version it got, who saved it (a user id, kept when the
account goes) and when. A trigger on `tenant_settings` writes it, so no code path can change a setting without leaving
its trace, and a save that leaves the value as it was writes nothing.

The history is append-only: the database refuses every `UPDATE`, every `DELETE` and every `TRUNCATE` of it. Only
deleting a workspace takes its entries away, through the foreign key, with its settings. A setting that has history
cannot be deleted on its own: the database refuses it, so no entry goes with it. Like every tenant table it has forced row-level
security, so a workspace reads only its own. `GET /settings/{group}/history` reads it (see [API](#api)).

## API

Every route is under `/api/v1`, in the `workspace` middleware group: a signed-in member of the workspace of the request.

| Method | Path | Permission | Answers |
| ------ | ---- | ---------- | ------- |
| GET | `/settings` | `settings.view` | the groups the member may see, in order: `slug`, `label`, `description`, `order`, `canEdit` |
| GET | `/settings/{group}` | `settings.view`, and the group's own | `{group, settings: {<key>: {value, version, updatedAt}}}`, with the group's `meta` as the envelope's `meta` |
| PATCH | `/settings/{group}` | `settings.view` at the route; then `settings.edit` (or the group's `editPermission`), and the group's own | the group as it is now, like the GET |
| GET | `/settings/{group}/history?key=&limit=` | `settings.view`, and the group's own | `[{id, key, previousValue, value, version, changedBy, changedByName, changedAt}]`, newest first, with `meta.count` |

A group that asks for a permission of its own is left out of the list for a member without it, and its routes answer
403 `auth.forbidden` with `meta.requiredPermission`, as the `permission:` guard does. A save is authorized before its
body is validated, so a member who may not change the group gets the 403 (with the permission that changes it in
`meta.requiredPermission`), never a validation error that names its keys. `canEdit` says whether the member may save the
group: `settings.edit`, or the group's `editPermission` when it names one, and its `permission`. A group nobody declared is 404 `settings.group_not_found`.

The body of a save has the values at the top, named as the group's keys, so a refusal lands on its field; `versions`,
the version each value was read at; and `confirm`, `true` once the member confirmed the impacts:

```json
{ "name": "Acme", "primaryColor": "#0d9488", "versions": { "name": 3, "primaryColor": 1 } }
```

Send only the keys you change. Each needs its version (`validation.required_with` on `versions.<key>`), a JSON integer
(`"3"` is `validation.integer`), `versions` itself is required, and a value is never `null`. Each value is normalized
(the name trimmed) before it is checked. A field the group does not declare is refused as `validation.prohibited`, whatever it holds, `null` included. The
kernel's keys answer `validation.required`, `validation.min`, `validation.max` and `validation.plain_name` (the name), `validation.primary_color`
(the color), `validation.timezone` and `validation.in` (the language and the currency), each with a message in the
language of the request that names the setting. A save answers 409 `settings.version_mismatch` or
`settings.confirmation_required` as described above.

The history takes `key`, to keep to one key, and `limit`, from 1 to 100, 20 by default; a limit out of range is brought
into it and one that is not a number is ignored. `changedByName` is the author's name, or their email when they have no
name, and `null` when no user saved the value (code that saved it).

## The workspace logo

The logo is not a setting key: it is a file, with endpoints of its own. Both need `settings.edit`.

| Method | Path | Answers |
| ------ | ---- | ------- |
| POST | `/settings/identity/logo` | multipart, one field `file`. 201 `{logoUrl}`, the new logo's public address. |
| DELETE | `/settings/identity/logo` | 200 `{logoUrl: null}`: the workspace has no logo. A workspace with none is answered the same and nothing changes. |

- What a file is comes from its bytes, checked by `RasterImage` (Support), never its name or the type the browser sent:
  PNG, JPEG or WEBP, nothing else (an SVG can carry script). The file must start with its format's signature and first chunk; the size its header
  declares must be at most 8192 pixels a side and 16 megapixels in all, checked before anything is decoded; and GD must
  decode the whole file to a picture of that size. A file cut short, a page behind an image's header, a WEBP whose
  frame disagrees with its canvas, or a small file that declares a huge picture is refused too. Anything else is 422
  `settings.logo_invalid_type` on `file`.
- An empty file is 422 `settings.logo_empty`. A file larger than `settings.logo.max_bytes` (2 MiB) is 422
  `settings.logo_too_large` on `file`, whose message gives the limit in megabytes, as for an upload straight to the
  bucket.
- PHP refuses a larger upload before the app sees it. A file over `upload_max_filesize` (or a form's `MAX_FILE_SIZE`) is
  the same 422 `settings.logo_too_large` on `file`, its message giving the lower of the two limits; a request body over
  `post_max_size` is 413 `http.error`. Keep `upload_max_filesize` at least
  `settings.logo.max_bytes` and `post_max_size` a little above it (see the
  [production checklist](../configuration/production.md#environment)).
- Uploads and presigns are counted per member by the `settings-logo` limiter, and confirmations by
  `settings-logo-confirm`, each `settings.logo.uploads_per_minute` (10) a minute; over it the answer is 429
  `http.too_many_requests`.
- The server never stores the bytes it was sent: GD decodes them and writes a new file of the same type (PNG, JPEG or
  WEBP, transparency kept; JPEG and WEBP at quality 90), so anything after the picture's end (a page, a script) or in its
  metadata is dropped, on both the direct upload and a confirmed presigned one. `size_bytes` is the new file's size.
- The server writes that file to the assets disk (see [Storage](../configuration/storage.md)) under a new key of the
  workspace, `tenants/<workspace>/logo/<uuid>.<ext>`, with the type its bytes are and
  `Cache-Control: public, max-age=31536000, immutable`. Then, in one transaction with the workspace's logo locked, the
  old logo stops being active and the new one is. If that transaction fails, the new file is deleted, as long as no row
  names it.
- A workspace has one active logo. The one replaced or removed is deleted, file and row, by the queued job
  `DeleteLogoObject` once the change commits, so a worker must run (see
  [Queues and the scheduler](../configuration/queues-and-scheduler.md)). The job reads the row as its workspace, deletes
  from the disk the file was written to, and leaves alone a logo that is active again or already gone.
- A new logo is audited as `settings.logo.changed` (resource `TenantLogo`, before `{file}`, after `{file, mime,
  sizeBytes}`), a removal as `settings.logo.removed` (before `{file}`). Both send `WorkspaceLogoChanged` (`tenantId`,
  `logoId`, null for a removal, `actorUserId`) once the transaction commits.

The logo's address comes as `meta.logoUrl` of `GET /settings/identity`, `null` when the workspace has none.

### Uploading straight to the bucket

With `SETTINGS_LOGO_PRESIGN=true` the browser sends the file to the bucket itself, not through the API, and
`meta.logoUpload` of the identity group says `presign` instead of `direct`. The bucket then needs CORS: see
[Storage](../configuration/storage.md#uploads-straight-to-the-bucket-presign).

1. `POST /settings/identity/logo/presign` with `{mime, sizeBytes}` (`mime` one of `image/png`, `image/jpeg`,
   `image/webp`) answers `{objectKey, uploadUrl, headers, expiresAt}`: a new key in the uploads area,
   `uploads/<workspace>/<uuid>`, and an address that lasts `settings.logo.presign_ttl_minutes` (5). It counts against
   the `settings-logo` limiter, and a size over the limit is 422 `settings.logo_too_large` on `sizeBytes`.
2. The browser sends `PUT uploadUrl` with `headers` (`Content-Type`, the type it declared) and the file as the body.
3. `POST /settings/identity/logo/confirm` with `{objectKey}` answers 201 `{logoUrl}`, like an upload through the API.

S3 signs neither the type, the size nor the cache headers of a presigned upload, and its address works until it
expires, so the confirmation trusts nothing of it:

- The key must be an upload key this workspace was given (422 `settings.logo_key_invalid`), and something must be
  there (422 `settings.logo_not_uploaded`).
- Its size is asked of the bucket first, and an empty or too large upload is refused before a byte of it is read
  (`settings.logo_empty`, `settings.logo_too_large`). The bytes are then read as a stream, never more than one byte
  over the limit, and checked like an upload through the API (`settings.logo_too_large`, `settings.logo_invalid_type`),
  and the type the upload was stored with must be what the bytes are (`settings.logo_invalid_type`). All on
  `objectKey`; a refused upload is deleted.
- The server writes the bytes it checked under a key of its own, `tenants/<workspace>/logo/<uuid>.<ext>`, with their
  real type and its own cache headers, exactly as for an upload through the API. No upload address ever names that
  key, so using the address again changes nothing that is served.
- The upload is taken under the logo lock and deleted: an upload makes one logo, and a second confirmation of it, at
  the same time or later, is refused (`settings.logo_key_invalid` when it races the first, `settings.logo_not_uploaded`
  after it), deleting only the copy it wrote.

Both routes need `settings.edit`; while presign is off, or the assets disk is not S3, they answer 404
`settings.logo_presign_disabled`. Uploads never confirmed stay in `uploads/` until a bucket lifecycle rule deletes them:
see [Storage](../configuration/storage.md#uploads-straight-to-the-bucket-presign).

## What /me and /tenant say

`GET /me` carries three keys from Settings, for every member, whatever their permissions:

```json
"brand": { "primaryColor": "#0d9488", "logoUrl": "https://assets.example.com/tenants/…/logo/….png" },
"localization": { "timezone": "America/Tijuana", "locale": "es", "currency": "MXN" },
"theme": { "colorMode": "dark", "radius": "full" }
```

`primaryColor` is `default` until the workspace picks one, and `logoUrl` is `null` while it has no logo. The workspace's
name stays where it was, in `tenant.name`. The settings layer reads the three into core (`useWorkspaceBrand()`,
`useWorkspaceLocalization()`, `useUserTheme()`) from its `settings-session` plugin, through `kit:session:me`.

The public `GET /tenant`, which the sign-in page reads before anyone signs in, carries the same `brand`, so that page
shows the workspace's color and logo. Its localization is not there: it is for members.

Both read a profile of the workspace cached per workspace for `SETTINGS_CACHE_TTL` seconds
(`settings:profile:{id}:{generation}`). A change of a setting or of the logo moves the workspace's generation on once the
change commits, so the next request reads it again, and a read that began before the change stores what it read under
the old generation, where nobody looks.

## Each member's theme

How a person likes the screens: `colorMode` (`system`, `light` or `dark`) and `radius`, the roundness of corners
(`none`, `small`, `medium`, `large` or `full`, mood-ui's). It is the person's, not the workspace's: users are global, so
the same theme follows them into every workspace. Until they choose, it is `system` and `medium`.

| Method | Path | Answers |
| ------ | ---- | ------- |
| GET | `/me/theme` | `{colorMode, radius}` |
| PATCH | `/me/theme` | send either or both; answers the whole theme. A value not listed above is 422 `validation.in`. |

Both need only a signed-in member, no permission, and `/me` carries the same as `theme`. The brand color is not part
of it: that is the workspace's, `identity.primaryColor`. It is kept in `user_theme_preferences`, one row per user, with
no `tenant_id` and no row-level security, like `users`.

## Reading and writing settings from a module

Three contracts, through `MoodKit\Settings\Contracts\`. The first two work on the current workspace, so they run as it: in a
request, a job, or inside `RunAsTenant`.

```php
use MoodKit\Settings\Contracts\ReadsWorkspaceSettings;
use MoodKit\Settings\Contracts\UpdatesWorkspaceSettings;

public function __construct(private ReadsWorkspaceSettings $settings, private UpdatesWorkspaceSettings $updates) {}

$this->settings->timezone();                   // 'America/Tijuana'
$this->settings->locale();                     // 'es'
$this->settings->currency();                   // 'MXN'
$this->settings->value('booking', 'slotMinutes');

$this->updates->update('localization', ['timezone' => 'America/Tijuana']);
$this->updates->updateGroups(['identity' => ['name' => 'Acme'], 'localization' => ['currency' => 'MXN']]);
```

`timezone()`, `locale()` and `currency()` come from the cached profile, so reading them costs no query per request.
`value()` reads any key of any group, saved or its default; a group or key nobody declared throws. Store times in UTC
and use the timezone only to show them or to schedule in local time.

`update()` writes by the same path as the settings page: each value checked with its key's rules (a
`ValidationException` otherwise), normalized, versioned, kept in the history, audited as the signed-in user (or nobody,
in a job) and announced after the commit. It saves over whatever is there, with no versions. A refusal is a
`ValidationException` whose messages name each key by its label, as the settings page does. A change a module says
affects existing records throws `ConfirmationRequired` unless you pass `confirmed: true`.

`updateGroups(['identity' => [...], 'localization' => [...]])` saves several groups as one: every value is checked
first, so one `ValidationException` names every field refused, and then all of them are saved in one transaction, or
none. Two groups that share a key name cannot be saved together (an `InvalidArgumentException`), since a refusal names
a field by its key.

`update()` checks no permission: a workspace template saves with nobody signed in. Code that saves on a member's behalf
asks `ChecksSettingsAccess` first, which applies the settings page's rule (`settings.edit` or the group's
`editPermission`, and the group's `permission`) and names what the member lacks, as the onboarding's kernel steps do:

```php
$missing = $this->access->missingToEdit($tenantId, $userId, 'localization'); // null, or 'settings.edit'
```

When a workspace is made, Settings listens to Signup's `WorkspaceProvisioned`: if its owner signed up in a language the
API speaks, other than the default, that language becomes its `localization.locale`.

## Configuration

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `SETTINGS_DEFAULT_TIMEZONE` | `UTC` | a workspace's timezone until it saves one |
| `SETTINGS_DEFAULT_LOCALE` | `APP_LOCALE`, else `en` | a workspace's language until it saves one |
| `SETTINGS_DEFAULT_CURRENCY` | `USD` | a workspace's currency until it saves one |
| `SETTINGS_LOGO_PRESIGN` | `false` | `true`: the browser uploads the logo straight to the bucket, which then needs CORS, and on R2 a custom domain with `r2.dev` off. See [Storage](../configuration/storage.md#uploads-straight-to-the-bucket-presign). |
| `SETTINGS_CACHE_TTL` | `3600` | seconds a workspace's brand and localization stay cached. A change made through the API forgets them at once; this is how long a change made straight in the database takes to show. |

These keys of `backend/packages/Settings/config/settings.php` have no environment variable; edit the file:

| Key | Default | Meaning |
| --- | ------- | ------- |
| `currencies` | `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `MXN`, `BRL`, `ARS`, `CLP`, `COP`, `PEN`, `JPY` | the ISO 4217 codes a workspace may choose |
| `swatches` | 18 named colors | the colors the brand picker offers first, name to `#rrggbb` |
| `logo.max_bytes` | `2097152` (2 MiB) | the largest logo accepted |
| `logo.uploads_per_minute` | `10` | logo uploads a member may start a minute |
| `logo.presign_ttl_minutes` | `5` | how long a presigned upload address lasts |

## The `settings` layer

`frontend/layers/settings` holds the page `/dashboard/settings` (needs `settings.view`). It shows a title, a line on
what is there, and one collapsible section per group of `GET /settings`, in the API's order, closed at first. A group
shows only when some layer registered the component that edits it, so a group of a module without a screen stays out.
A member without `settings.edit` sees the sections read-only: the fields and the swatches are disabled, the logo shows
without the drop area or Remove, and nothing can be changed. Each section follows its group's `canEdit`, so a module's
group with a permission of its own can be editable on its own; the page has no action bar when no group is.

The sections have no Save of their own. For whoever may edit one of them, core's `PageActionBar` ends the page, always visible once
the groups have loaded (not while they load, when they fail to, or with no section to show), and lets nothing be clicked
until a section has changes. A section with changes shows a warning dot in its header, open or
closed ("Unsaved changes" in its tooltip and aria label), and the bar offers Review changes: a dialog that lists each
section's changed fields, before → after (the brand color as its swatch and name, the timezone with its offset, the
currency and the language by their names), with Close and Save changes. Its Save then sends one PATCH per section with
changes, one after the other in the page's order, each with its own versions, and shows
one toast; Cancel throws every section's changes away. A section the API refuses is opened and shows why, as below,
and the sections before and after it keep their save. Enter in a field saves the page the same way. The logo is not part
of it: an upload or a removal is the workspace's at once.

Each section is built with core's settings pieces, which any layer may use: `useSettingsForm({ group, label, fields,
schema, onSaved })`, `provideSettingsSaver()` (the page's, which also provides the page's change set), the
`SettingsSection` card (mood-ui's `Accordion` in its `separated` variant: bordered and filled with the card surface, like
every other card of the dashboard, in dark mode too) and `SettingsSectionSkeleton`,
`getGroup()` and `saveGroup()` and the group types (`#layers/core/app/types/settings`). `useSettingsForm` reads the
group, fills a vee-validate form with the values, tracks each key of `fields` (its label and format) in the page's
change set, and saves only those keys, each with the version it was read at:

- 409 `settings.version_mismatch` (someone saved in between): the group is read again and the form shows what is
  saved now, so what the person typed is gone; the banner says so, and they make their change again.
- 409 `settings.confirmation_required` (a module says existing records depend on the change): a confirmation lists
  what is affected, and that section's save goes again with `confirm: true` when the person agrees; if they do not,
  its changes stay on screen, unsaved.
- Field errors land on their inputs; anything else in the section's `FormErrorBanner`. If what runs after a save
  (`onSaved`, such as reloading the session) fails, that is toasted, and the save stands.
- A confirmation is for the save it was given to: if that save fails, the next one asks again.
- Switching the language reads the group again without throwing away what the person is typing.

`useDirtySections()` (core) tracks which sections have changes not saved; core's `useLeaveGuard()`, which the page
calls, reads it. Leaving the page for another screen of the app
asks first; closing or reloading the tab gets the browser's own prompt.

The layer brings the sections of the kernel's groups:

- **Identity**: the workspace's name and its brand color at the left and its logo at the right, in one section (on a phone
  the logo comes first). Without a logo there is mood-ui's drop area
  (with its own Browse button); with one, its preview, a lower drop area to replace it ("Replace logo") and **Remove**. The logo
  goes up as soon as a file is picked or dropped (PNG, JPEG or WEBP up to `logo.max_bytes`; a wrong type or size is refused before anything is
  sent), the way `meta.logoUpload` says: through the API, or straight to the bucket with `SETTINGS_LOGO_PRESIGN` (the
  PUT sends only the signed `Content-Type`; the logo's address is always the one confirm answers). A file the server
  takes as too large before reading it (413) says so; any other refusal shows in the API's words: 422
  `settings.logo_too_large` with its limit (a file over PHP's `upload_max_filesize` included), 422 `validation.uploaded`
  (a broken upload), a 429 on confirm.
  **Remove** takes it away after a confirmation (`DELETE /settings/identity/logo`). Either is the workspace's at once,
  with no Save. The color offers the configured swatches by name (one whose color is not a `#rrggbb` is left out), the default
  black and white, and a free picker, which shows black while the default is chosen (here the chosen color is not
  named; the appearance page names it in a pill); a
  color shows across the app while it is chosen and goes back if the section is left without saving. Save sends the
  name and the color, and the session loads again so the top bar shows the new name.

- **Localization**: the timezone (searchable, each with its offset from UTC today), then the currency and the
  default language side by side, each named by the browser in the screen's language. A change that a module says
  affects existing records asks first (see `settings.change_impacts`). Once saved, the session's
  `useWorkspaceLocalization()` follows.

A module adds the section of its own group from a plugin of its layer, through core's `kit:settings:sections` hook.
The component receives the group as its `group` prop (`slug`, `label`, `description`, `order`, `canEdit`):

```ts
// layers/booking/app/plugins/booking-settings.ts
import BookingSettingsSection from "../components/BookingSettingsSection.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:settings:sections", (sections) => {
    sections.push({ group: "booking", component: BookingSettingsSection });
  });
});
```

The section builds on core's `useSettingsForm`, `SettingsSection` and `SettingsSectionSkeleton`, so it gets the
versions, the conflicts, the confirmations and the guard on leaving with nothing copied. The guide
[Add a settings group](../guides/add-a-settings-group.md#4-give-it-a-section-on-the-settings-page) has a whole section.

The layer also draws the screens of the kernel's onboarding steps (`onboarding-steps.ts`, core's `kit:onboarding:steps`):
`WorkspaceProfileStep` (the name and the localization) and `WorkspaceAppearanceStep` (the logo, uploaded on the spot,
and the brand color), built with core's `useOnboardingStepForm()`. Their options come from the groups (`GET
/settings/localization` and `/settings/identity`), and the wizard's Continue saves them; the color is not previewed
across the app while it is chosen, and shows once the step is done and the session reloads. A step that comes with no
values (`{}`: for someone who may only look, or when its values could not be read) starts empty, with no color chosen;
every field the API refuses shows its error on its own field. They share their fields
with the identity and localization sections (`LogoField`, `BrandColorField`, `LocalizationFields`, `useLogoState()`,
`brandColorRule()`). See [Onboarding](onboarding.md#the-onboarding-layer).

## My profile: appearance

`/dashboard/me/profile`, My profile, is the auth layer's page (see [Auth](auth.md#the-auth-layer)). The settings layer
brings the appearance to it through core's `kit:profile:sections` (`plugins/profile-sections.ts`, order 50), after the
person's own cards, in three cards:

- **Main palette**, only with `settings.edit`: the same brand color picker as the identity section, saved as it is
  picked (`PATCH /settings/identity` with the version of the color the card loaded; each save keeps the version it answers
  with, and quick picks are saved one after another), and **Reset** back to the default black and white. It changes the
  color for the whole workspace. When someone else saved the color since the card loaded (409
  `settings.version_mismatch`), the card loads the group again, shows the color that is saved now and says so in a toast;
  the picks still waiting are dropped.
- **Color mode**: light, dark or system.
- **Corner style**: square, small, medium, large or full.

Each option of the last two is core's `ColorModePicker` and `RadiusPicker` (core owns them, so the platform's settings page uses the same cards), each option mood-ui's `SurfaceCard` with a small drawn preview and mood-ui's `Radio`, which carries its
name and a line about it; a click anywhere on the card chooses it. core's `KitTooltip` (mood-ui's `MorphTooltip`) around each card says what
choosing it does ("Use dark mode", `core.tooltips.color_mode.*` and `core.tooltips.radius.*`); like a
`KitButton`'s, it shows on hover and keyboard focus, never on a tap, and goes once the card is chosen.

The mode and the corners are the person's own, wherever they sign in: they apply at once and are saved with
`PATCH /me/theme` (only the one that changed). `GET /me` brings them back on the next session, and until it loads the
browser keeps the color mode it last used.

