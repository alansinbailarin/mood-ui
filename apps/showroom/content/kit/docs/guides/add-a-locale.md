# Add a locale

The kit ships English (`en`, the default and fallback) and Spanish (`es`). This guide adds a third language,
French (`fr`) in the examples, to the API and the frontend. Missing keys fall back to English, and only the
labels of the roles registry are checked, so the work is mostly translating every file the existing locales have.

## Backend

### 1. Declare it

In `backend/packages/Support/config/support.php`:

```php
'locales' => ['en', 'es', 'fr'],
```

The first entry stays the fallback. This list decides which `Accept-Language` values the API answers in,
which values `PATCH /me/locale` accepts, and which `locale` a signup may send.

### 2. Translate each package

Copy each package's `lang/en/` to `lang/fr/` and translate it:

| Package | Files |
| ------- | ----- |
| Support | `errors.php` |
| Tenancy | `errors.php`, `validation.php` |
| Auth | `errors.php`, `mail.php`, `validation.php` |
| Rbac | `errors.php`, `menu.php`, `modules.php`, `permissions.php`, `roles.php`, `validation.php` |
| Signup | `errors.php`, `mail.php`, `validation.php` |

Do the same for packages of your own.

### 3. Laravel's validation messages

Laravel's own English messages come with the framework. For Spanish the kit adds
`backend/lang/es/validation.php`; add `backend/lang/fr/validation.php` the same way, or your users see
Laravel's validation messages in English.

### 4. Extend the translation test

`backend/packages/Rbac/tests/Feature/RegistryTranslationsTest.php` checks every permission, role and menu
label in `en` and `es` only, without falling back to English. Add `fr` to its `->with(['en', 'es'])` list so the
new language is checked too: it then fails on every registry label `fr` lacks.

## Frontend

### 5. Declare it in the app

In `frontend/nuxt.config.ts`, add an entry to `i18n.locales`:

```ts
locales: [
  { code: "en", language: "en", dir: "ltr", name: "English", file: "en.json" },
  { code: "es", language: "es", dir: "ltr", name: "Español", file: "es.json" },
  { code: "fr", language: "fr", dir: "ltr", name: "Français", file: "fr.json" },
],
```

`name` is what the language switcher shows; it lists every locale declared here. Then create
`frontend/i18n/locales/fr.json` from `en.json`.

### 6. Declare it in every layer

Each layer with messages (`core`, `tenancy`, `auth`, `dashboard`, `rbac`, `signup`, and your own) declares
its locales in its `nuxt.config.ts`:

```ts
i18n: {
  locales: [
    { code: "en", file: "en.json" },
    { code: "es", file: "es.json" },
    { code: "fr", file: "fr.json" },
  ],
},
```

and needs `layers/<name>/i18n/locales/fr.json`, translated from its `en.json`.

The profile menu names each language by `dashboard.user_menu.locale_<code>`, in the language on screen. Add
`"locale_fr": "French"` under `dashboard.user_menu` in every `layers/dashboard/i18n/locales/*.json` (and the
other locales' `locale_fr` in `fr.json`); without it the menu shows the `name` from `nuxt.config.ts`.

### 7. mood-ui's own texts

mood-ui translates its own texts (table pagination, selects, dates, aria labels) in `en` and `es`.
`frontend/app/app.vue` hands `ModoProvider` mood-ui's `locales[<code>]`; for a language mood-ui does not
ship, that lookup finds nothing and mood-ui stays in English. To translate it, build an object of the same
shape as `locales.en` and pass it there for `fr`.

## Check it

1. `curl -s http://localhost:8000/api/v1/tenant -H "X-Tenant-Slug: nope" -H "Accept-Language: fr"` answers
   `tenancy.not_found` with the French message.
2. In the app, the language switcher offers the new language, and switching to it while signed in saves it
   on your user (`PATCH /me/locale`): the API then answers you in it whatever the browser sends.
3. The dashboard menu and the roles screens reload in the new language.
4. `composer check` passes, with `RegistryTranslationsTest` covering `fr`.

Keep every locale file in step with `en.json` and the English PHP files when you add keys later. On the frontend,
core's `locales.test.ts` fails when a JSON file of the app or of a layer lacks a key `en.json` has; on the backend,
apart from the registry labels `RegistryTranslationsTest` checks, nothing fails when one is missing.
