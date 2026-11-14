# Brand the platform

There are two brands in the kit. A **workspace's** brand (its name, logo and color, from its own Settings) is what its
people see inside it. The **platform's** brand is yours, the SaaS's: it is what speaks for the platform rather than for a
workspace.

| Where | Which brand |
| ----- | ----------- |
| a workspace's dashboard, its sign-in page | the workspace's |
| the root domain's public screens (home, signup, the waitlist), the admin host | the platform's |
| the signup's verification email, an account's emails (password reset, changed password, changed email), the invitation to sign up | the platform's |

## Start from the environment

```bash
PLATFORM_NAME="Acme Cloud"        # empty: APP_NAME
PLATFORM_PRIMARY_COLOR=#14b8a6    # #rrggbb in lower case; anything else is `default`, the monochrome brand
PLATFORM_LOGO_URL=https://cdn.example.com/logo.png   # empty: the name stands alone
```

These are the values until an admin changes them: nothing is written to the database for them.

## Change it on the admin host

On **Settings** of the admin host (`admin.<root domain>/platform/settings`) a super admin changes the name, the primary
color and the logo. What is saved there wins over the environment, at once, in every email and screen above:

- `GET /platform/settings` answers `{values: {name, primaryColor, logoUrl, accessMode}, versions: {name, primaryColor,
  logo, accessMode}}`.
- `PATCH /platform/settings` takes any of `name` (2 to 60 characters, plain text), `primaryColor` (`#rrggbb` in lower
  case, or `default`) and `accessMode`, with `versions`: the version of each field as it was loaded. Someone else's save in
  between is 409 `platform.version_mismatch`, with `meta.currentVersions`.
- `POST /platform/settings/logo` takes a `logo` file of up to 1 MB. What it is, its bytes say, never its name: a PNG, JPEG
  or WebP, written again by GD at most 512 pixels on a side, so nothing but the picture is kept (anything else is 422
  `platform.logo_invalid`). It is stored under `platform/brand/` on the assets disk, and the one it replaces is deleted once
  the change is saved. `DELETE /platform/settings/logo` takes it away: `PLATFORM_LOGO_URL`, if set, shows again.

Every change is written to the platform's trail.

## Before anything is loaded

`GET /api/v1/platform/public`, with no session, answers `{name, logoUrl, primaryColor, accessMode}`: the frontend asks it on
the root domain and on the admin host. It may be cached for a minute (`Cache-Control: public, max-age=60`), so a change you
save can take up to a minute to show there. The name the frontend shows before any answer, or when the API is down, is still
`NUXT_PUBLIC_PLATFORM_NAME`; keep it alike.

## In code

Anything of a package that speaks for the platform asks Support's `Branding\PlatformBrand` (`name()`, `logoUrl()`,
`primaryColor()`), never `config('app.name')`. Support answers it from the environment; Platform replaces it with the one
that reads its settings.
