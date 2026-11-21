# Add a locale

The kit ships English (`en`, the default and fallback) and Spanish (`es`). `php artisan kit:add-locale` adds a third
language, French (`fr`) in the examples, to the API and the frontend in one go. It sets the language up; the translating
is still yours. This guide says what the command writes, how to translate, and how to check the result.

## 1. Run the command

From `backend/`:

```bash
php artisan kit:add-locale fr --name=Français
```

`fr` is the language code: two or three lowercase letters, with a region if you need one (`pt-BR`). `--name` is the
language in its own words, as the language switcher shows it.

The command refuses, and writes nothing, when:

- `APP_ENV` is not `local`: it writes code, so run it where you develop.
- the code does not match `^[a-z]{2,3}(-[A-Z]{2})?$`, `--name` is missing or longer than 40 characters, or the
  language is in `support.locales` already (so a second run is refused).
- a file it would write exists already. It never overwrites a file.
- a folder of frontend messages has no `en.json` to copy.

Everything is checked before anything is written. It writes the new files first and declares the language in
`support.locales` last; if a write fails it takes back everything it wrote, so you can run it again. This is what it
writes:

| Where | What |
| ----- | ---- |
| `backend/packages/Support/config/support.php` | `'fr'` added to `locales`. If `backend/config/support.php` lists the languages, that file is changed instead. |
| `backend/packages/*/lang/fr/*.php` | A copy of every file of `lang/en/`, for the kit's packages and your own. |
| `backend/lang/fr/validation.php` | A copy of Laravel's English validation messages, from the framework. (`backend/lang/en/` is copied too if it exists.) |
| `backend/config/*.php` | The texts written by language on one line, such as the names and descriptions of the plans (`['en' => 'Free', 'es' => 'Gratis']`), get `'fr'` with the English text. `plans:sync` refuses a plan that lacks a language. |
| `frontend/nuxt.config.ts` and each layer's `nuxt.config.ts` | An entry in `i18n.locales`, with `--name` as its `name` in the app's. |
| `frontend/i18n/locales/fr.json` and `frontend/layers/*/i18n/locales/fr.json` | A copy of each `en.json`. |
| `frontend/layers/dashboard/i18n/locales/*.json` | `dashboard.user_menu.locale_fr`, the name the profile menu gives the language: "French" in `en.json`, `--name` in the other files. A code with a region gets none, since a key has no dash: the menu then shows the `name` of `nuxt.config.ts`. |

The notifications' default templates (`notification_templates.php` in each package) and the mail words are lang files, so
they are copied too, and `notifications:sync` finds a template for the new language.

When the command cannot change a file safely (a `locales` line that is not a plain list, a `nuxt.config.ts` whose list is
built in code), it leaves that file as it was and prints, under "Left for you to do by hand", the line to add. If there is
no `frontend/` folder beside `backend/`, it changes the backend only and says so.

At the end it prints what it wrote. Every copied file is still in English.

## 2. Translate

Open every file the command listed and translate the messages, not the keys. Keep what a program fills in:

- `:name` in the PHP files (Laravel's placeholders), and `{{ member.name }}` in a notification template.
- `{name}` in the JSON files (vue-i18n), and a linked message such as `@:core.save`.
- The `|` between the forms of a plural (`{count} member | {count} members`), when English has more than one form. A
  language with more forms (Russian, Polish) may have more.
- Write an `@` or a brace that is text as `{'@'}`, `{'{'}` and `{'}'}` in the JSON files: vue-i18n reads a bare
  `ana@example.com` as a broken link to another message.

Write the natural form of the language for a person, without dashes as punctuation.

Language-specific details the command does not set:

- `backend/config/plans.php` and any other text by language it copied: translate the English it added.
- In the frontend `dashboard.user_menu.locale_en` and `locale_es` of the new `fr.json` are copied in English: write them
  in French.
- A language that writes right to left (`ar`, `he`, `fa`, `ur`...) needs `dir: "rtl"` in the app's `nuxt.config.ts` entry:
  the command writes `ltr` and warns. The kit's screens have not been checked right to left.

## 3. mood-ui's own texts

mood-ui translates its own texts (table pagination, selects, dates, aria labels) in `en` and `es` only.
`frontend/app/app.vue` hands `ModoProvider` mood-ui's `locales[<code>]`; for a language mood-ui does not ship, that lookup
finds nothing and mood-ui stays in English. To translate it, build an object of the same shape as `locales.en` and pass it
there for `fr`. The command cannot do this one.

## 4. Check it

```bash
php artisan i18n:check
```

It checks every language of `support.locales` against English, in the backend and the frontend, and exits with an error
when something is wrong. See [Check the translations](#check-the-translations). Right after `kit:add-locale` it passes:
the copies have every key English has. It cannot tell that a copy is still English, so read the files you translated.

Then, from `backend/`, run `composer check` (the translation tests read `support.locales`, so the new language is covered
without editing them), and:

1. `curl -s http://localhost:8000/api/v1/tenant -H "X-Tenant-Slug: nope" -H "Accept-Language: fr"` answers
   `tenancy.not_found` with the French message.
2. In the app, the language switcher offers the new language, and switching to it while signed in saves it on your user
   (`PATCH /me/locale`): the API then answers you in it whatever the browser sends.
3. The dashboard menu and the roles screens reload in the new language.

## Check the translations

`php artisan i18n:check` is part of `composer check`, so CI fails on a gap. It reads the languages from
`support.locales` (the first is the reference, English) and prints a line for each problem as
`<file>: <key>: <problem>`:

```text
backend/packages/Team/lang/es/mail.php: invitation.cta: missing in es (English: "Accept the invitation")
frontend/layers/core/i18n/locales/es.json: core.save: empty in es
frontend/i18n/locales/es.json: app.greeting: placeholders differ: English has {name}, es has {nombre}
```

What it checks, for every `lang/<locale>/*.php` of every package and of `backend/lang`, and every `<locale>.json` of the
app (`frontend/i18n/locales`) and of each layer (`frontend/layers/*/i18n/locales`):

- a file English has that the language has not, and a file English does not have;
- a key English has that the language lacks, and a key the language has that English does not;
- a message that is empty or only spaces (where English is not);
- placeholders that differ from English's: `:name` and `{{ name }}` in PHP, `{name}` and `@:key` in JSON;
- plural forms: when English has several forms, the translation has at least as many (more is fine);
- a message vue-i18n cannot compile: an `@` that links no message (an email address) or a brace that is no placeholder;
- a key written twice, as `'a.b'` and as `'a' => ['b' => ...]`, which Laravel reads only once;
- declarations: a folder `lang/<code>/` or a file `<code>.json` for a language `support.locales` does not have, a package
  with lang files for another language but no folder of the reference one, a `nuxt.config.ts` that has a messages file for a
  language but does not declare it, and a `support.locales` that does not start with `app.fallback_locale` (the first is the
  reference everything is compared with, and the one the API falls back to).

Subfolders of `lang/<locale>/` and Laravel's flat `lang/<locale>.json` are read too, when a package uses them.

The rules that let some differences through, on purpose:

- English with one form says nothing of a plural, so a language may inflect a word English does not
  (`"Active"` against `"Activo | Activos"`). A language with more forms than English's several is fine too.
- `attributes.<field>` and `custom.<field>.<rule>` in a `validation.php` name a field, or write a message of Laravel's
  custom validation, in that language. English needs neither, so an extra one is not a problem there. Everywhere else a
  key English lacks is.
- The English reference of `backend/lang/validation.php` is Laravel's own file, since the backend ships no English copy.
- A message English leaves blank on purpose may be blank in every language.

A key that really is English only in a language has no place here: put the English text in the language's file. That is
what the command's copies do.

The frontend also has `layers/core/tests/locales.test.ts`, which checks the same keys and also that every literal key the
code of a layer asks for exists. `i18n:check` is the one command that covers both sides. The per-language content kept
somewhere else is checked where it is read: the catalog of plans (`plans:sync` and the plan editor refuse a plan with no
name in a language), and the default templates of the notifications (`notifications:sync` fails on a missing one).

If there is no `frontend/` folder, the command says so and checks the backend only.
