# Frontend

The Nuxt 4 app in `frontend/`, built on [mood-ui](https://mood-ui.com). This page covers what a layer may
use, how to call the API, how layers share the session, the design rules and i18n. The layers of each
package are documented with it: [Tenancy](packages/tenancy.md#the-tenancy-layer),
[Auth](packages/auth.md#the-auth-layer), [Rbac](packages/rbac.md#the-dashboard-layer),
[Signup](packages/signup.md#the-signup-layer), [Settings](packages/settings.md#the-settings-layer),
[Plans](packages/plans.md#the-plans-layer), [Notifications](packages/notifications.md#the-notifications-layer),
[Team](packages/team.md#the-team-layer) (the team, a member's page and `/join`),
[Branches](packages/branches.md#the-branches-layer) (the branches, a branch's page with its map, hours and people),
[Clients](packages/clients.md#the-clients-layer) (the clients, their tags, imports and exports),
[Search](packages/search.md#the-search-layer) (the palette in the top bar, `Cmd+K`, and a dialog on a phone) and
[Platform](packages/platform.md#the-platform-layer) (the admin's panel on its own host).

## Commands

From the repo root:

| Command | Does |
| ------- | ---- |
| `pnpm --filter ./frontend dev` | dev server on http://localhost:3000 |
| `pnpm --filter ./frontend build` | production build in `frontend/.output` |
| `pnpm --filter ./frontend lint` | `nuxt prepare`, then ESLint. `lint:fix` applies fixes. |
| `pnpm --filter ./frontend typecheck` | `nuxt typecheck` |
| `pnpm --filter ./frontend test` | Vitest |
| `pnpm --filter ./frontend check` | lint, typecheck, Vitest with coverage, build, Playwright |

`build`, `dev`, `generate` and `preview` pass `--dotenv ../.env`, so Nuxt reads the root `.env`. Always lint
through `lint` or `lint:fix`: they run `nuxt prepare` first, and the cross-layer rule fails without the type
files it writes to `.nuxt/`. The repo root has no ESLint installed; the frontend's own binary, run from the
root, finds `frontend/eslint.config.mjs` and works, but skips that `nuxt prepare` step.

## Runtime settings

All are public runtime config, so an environment variable overrides them when the built server starts.

| Env | Default | Read by |
| --- | ------- | ------- |
| `NUXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` | `useApi`. Must end in `/api/v1`. |
| `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` | `localhost` | `useRootDomain()` (core), which every layer reads it through. Must equal the backend's `TENANCY_ROOT_DOMAIN`. |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | empty | `useCaptcha`. Empty shows no captcha widget. |
| `NUXT_PUBLIC_PLATFORM_NAME` | `Mood Kit` | `usePlatformName()`: headers, footers, page titles, until the platform's brand (`GET /platform/public`) names it |
| `NUXT_PUBLIC_PLATFORM_HOST` | `admin.localhost` | `usePlatformHost()` (core): the admin's host, where the platform layer serves its panel and nothing else, and which the tenancy layer never takes for a workspace. Keep it like the backend's `PLATFORM_HOST` ([The admin host](configuration/admin-host.md)). |
| `NUXT_PUBLIC_SIGNUP_TERMS_URL` | `/terms` | the signup form's terms link |
| `NUXT_PUBLIC_SIGNUP_PRIVACY_URL` | `/privacy` | the signup form's privacy link |
| `NUXT_PUBLIC_MAP_STYLE_URL`, `NUXT_PUBLIC_MAP_TILES_URL`, `NUXT_PUBLIC_MAP_ATTRIBUTION` | empty; OpenStreetMap's tiles; `© OpenStreetMap contributors` | `runtimeConfig.public.map`: the location picker's map (core's `mapStyle()`). See [Maps](configuration/maps.md#the-map). |

Four more are server-only: `NUXT_SECURITY_ASSETS_URL` and `NUXT_SECURITY_ASSETS_UPLOAD_URL`, the bucket's addresses,
`NUXT_SECURITY_REALTIME_URL`, Reverb's websocket (see [Realtime](configuration/realtime.md)), which the Content
Security Policy allows (`connect-src`), and `NUXT_SECURITY_MAP_ORIGINS`, more origins the map's style loads from. The
map's style and tile origins go in `contentSecurityPolicy()` through `mapOriginsOf()` (`connect-src` and `img-src`, never
on the admin's host). The security headers are listed in
[Production](configuration/production.md#security-headers).

`robots.txt` and `sitemap.xml` build their addresses from `NUXT_PUBLIC_TENANCY_ROOT_DOMAIN` and the scheme
and port of the request, so the frontend has no site URL setting of its own. On the admin's host `robots.txt` is
`Disallow: /` and there is no sitemap, and every page it renders carries `X-Robots-Tag: noindex, nofollow` and a narrower
Content Security Policy (see [Production](configuration/production.md#security-headers)).

## Layers

Each layer is a directory in `frontend/layers/<name>` with a `nuxt.config.ts`, a `package.json`, its source
in `app/` and its tests in `tests/*.test.ts`. Nuxt reads these folders of `app/`: `components/`,
`composables/`, `utils/` and `stores/` (auto-imported), `pages/`, `layouts/` (core has `auth`, clients has
`portal`, dashboard has `dashboard`, onboarding has `onboarding`, platform has `platform`), `middleware/` (route middleware; a `.global` one runs on every page), and `plugins/` (run at
start-up, where a layer listens to the `kit:*` hooks). `services/` (the API calls) and `types/` (TypeScript
types) are the kit's own conventions, imported by path.

Import rules, enforced by ESLint:

- A layer imports from itself and from `core`, never from another layer or from `frontend/app`.
- `core` imports from no layer.
- Auto-imported components, composables, stores and utils are used only from your own layer or `core`
  (`mood-kit/no-cross-layer-auto-import`).

When two layers define the same file or auto-imported name, one silently wins (the app first, then layers
in reverse alphabetical order), so keep names unique across layers.

To add a layer, copy the `nuxt.config.ts` and `package.json` of `layers/core`, rename the package, run
`pnpm install` at the repo root and commit the new `frontend/layers/<name>: {}` entry in `pnpm-lock.yaml`. A
layer that imports `vue-router` lists it in its own `package.json`, with the version Nuxt uses.

## Calling the API

Only code in a `services/` folder calls the API, and a view uses a service only inline inside one of the
managed composables of `core`. ESLint (`mood-kit/no-unmanaged-service-call`) reports `$fetch`, `useApi`,
`useFetch` and `useLazyFetch` anywhere else, and any reference to a service outside those composables.

```ts
// layers/billing/app/services/invoices.ts
import type { Invoice } from "../types/invoices";

// The base URL already ends in /api/v1.
export function listInvoices() {
  return useApi().request<Invoice[]>("/invoices");
}

export function sendInvoice(id: string) {
  return useApi().request<Invoice>(`/invoices/${id}/send`, { method: "POST", retry: false });
}
```

```vue
<!-- layers/billing/app/pages/dashboard/invoices/index.vue -->
<script setup lang="ts">
import { listInvoices, sendInvoice } from "../../../services/invoices";

definePageMeta({ layout: "dashboard", auth: "required", permission: "invoices.view" });

const { t } = useI18n();
const { data, status, error, hasLoaded, execute } = useAsyncState(async () => (await listInvoices()).data);
const send = useAction((id: string) => sendInvoice(id), { successMessage: t("billing.invoices.sent") });
</script>

<template>
  <AsyncBoundary :status="status" :error="error" :loaded="hasLoaded" :empty="data?.length === 0" @retry="execute()">
    <!-- the list, with a button that calls send.run(invoice.id) -->
  </AsyncBoundary>
</template>
```

A file the API sends as it is (a CSV) comes through `useApi().download(path, options)`: it resolves to the `Blob`,
never retries, and allows 120 seconds instead of 15. A refusal still comes as an `ApiRequestError` with its envelope
(read out of the file the error came as). Like any service, call it inside `useAction`; the page then saves the file
with core's `saveBlob(blob, name)`, under a name it chooses (CORS hides `Content-Disposition`).

```ts
export function exportClients(query: Record<string, unknown>) {
  return useApi().download("/clients/export", { query });
}
// in the view: useAction(async () => saveBlob(await exportClients(query), "clients.csv"))
```

| Composable | For |
| ---------- | --- |
| `useAsyncState(fetcher)` | one value: `data`, `status`, `error`, `hasLoaded`, `execute` |
| `useListQuery(fetcher)` | a cursor-paginated list (`ApiResponse::paginated`), with load more and reload |
| `useFormSubmit({ form, submit, onSuccess })` | a vee-validate form: field errors land on inputs, the rest in `formError` |
| `useAction(action, { successMessage, onSuccess, failureMessage, onFailure })` | a one-off action (delete, resend): `successMessage` is its success toast, shown after `onSuccess` (never a `toast.success` of your own), or a function of the result that words it, or returns `null` for a result that is no plain success (the plan editor's save that Stripe did not take warns in `onSuccess` instead); failures become a toast, in the backend's words unless `failureMessage(view)` words that failure itself, or returns `null` for one the screen shows itself (no toast); `onFailure(view)` runs after the toast (load again after a conflict, open the dialog that shows it) |

Rules that keep every failure visible:

- Never `try/catch` inside the callback, and never `catch {}`: the composable shows the failure. Every
  failed request shows a message.
- Show load, error, empty and content states with `<AsyncBoundary>`. Its loading block shows on the first
  load only; a reload keeps the content on screen, marked `aria-busy`. `#loading`, `#error` (with
  `{ error, retry }`) and `#empty` slots replace the defaults.
- Show form-level errors with `<FormErrorBanner :message="formError">`.
- To veil content that is reloading, put `<LoadingOverlay />` inside a `relative` parent. A mood-ui `Table` shows its
  own loader instead (`:loading="!list.hasLoaded.value || list.isReloading.value"`), and its `AsyncBoundary` takes
  `table-loader`, so the table is drawn from the first load.
- A request cancelled through its `signal` throws `request.aborted`, and the composables stay silent. In code
  of your own, check it with `isAbortedRequest(error)`.
- A request has 15 seconds, retries included; pass `timeout` (milliseconds) to `request()` for a call that
  is slow on purpose.
- `useAsyncState` and `useListQuery` load in the browser only: the server renders them as loading.

**A call of the client portal** passes `session: "portal"` (to `request()` or `download()`): core sends the portal's token
(`usePortalToken()`, which the clients layer writes) and never the member's, not even when the portal has none (the
sign-in calls), and drops an `Authorization` header of the caller's. A browser may hold both sessions on one workspace's
address (a member who is also a client); they never mix. A 401 of such a call goes to `kit:portal:unauthenticated`, never to
`kit:api:unauthenticated`, so a client's expired session never signs the member out. A call without `session` (or with
`"member"`) carries the member's token and never the portal's.

```ts
// layers/clients/app/services/portal.ts
import type { PortalAccount } from "../types/portal";

export function loadPortalAccount() {
  return useApi().request<PortalAccount>("/portal/me", { session: "portal" });
}
```

[Errors and the API](concepts/errors-and-api.md#on-the-frontend) lists the error codes and fallback messages.

## Sharing between layers

Layers share nothing but `core`. What two layers need lives in `core` as state; what one layer needs
another to do is asked through a hook declared in `core` and answered by the layer that owns it.

**State in `core`**, written by the layer that owns each key of `GET /me` (auth, rbac, settings), by tenancy (`GET /tenant`)
and, for the last three, by the settings layer when something is saved:

| Composable | Holds |
| ---------- | ----- |
| `useSession()` | `status` (`idle`, `loading`, `ready`), `name`, `email`, `locale`, `avatarUrl` (the person's photo, null without one), `workspace`, `workspaces`, `roles` |
| `usePermissionsState()` / `usePermissions()` | the permission names from `GET /me`; `can`, `canAny`, `canAll` |
| `useApiToken()` | the login token |
| `usePortalToken()` | the client portal's session token, written by the clients layer; sent only on a call with `session: "portal"` |
| `useTenantSlugState()` | the workspace slug of the host |
| `useWorkspaceBrand()` (`kit:brand`) | the workspace's `primaryColor` (`#rrggbb`, or `default` for black and white) and `logoUrl`; null on a screen with no workspace |
| `useWorkspaceLocalization()` (`kit:localization`) | the workspace's `timezone`, `locale` and `currency` from `GET /me`; null signed out |
| `useUserTheme()` (`kit:theme`) | the person's `colorMode` and `radius` from `GET /me`; null until the session says (`DEFAULT_THEME` is what the API answers for someone who never chose) |
| `usePlatformPublic()` (`kit:platform`) | the platform's `name`, `logoUrl`, `primaryColor` (`#rrggbb` or `default`) and `accessMode` (`open`, `waitlist`, `closed`) from the public `GET /platform/public`, filled by the platform layer on the root domain and the admin's host; null on a workspace's host, or until it loads |
| `usePlatformFlags()` / `usePlatformFlag(slug)` (`kit:platform-flags`) | the platform flags of the workspace from `GET /me` (`platformFlags`), filled by the platform layer and emptied with the session; `usePlatformFlag(slug)` is a computed that is off for a flag the map does not name |
| `useImpersonationState()` (`kit:impersonation`) | who from the platform is acting as the person in this session (`by.name`, `endsAt`), from `GET /me` (`impersonation`); null for a session of their own. Filled by the auth layer, emptied with the session. `useImpersonationGate()` gives `{ blocked, tooltip }` for a control such a session may not use: disable it and show the tooltip, as with `usePlanGate()` |
| `usePlanContext()` (`kit:plan`) | the workspace's plan from `GET /me` (`plan`): `slug`, `name`, `tier`, `status` (`trialing`, `active`, `past_due`, `cancelled`, or null with no subscription), `managedBy`, `trialEndsAt`, `currentPeriodEnd`, the `features` it includes and each quota's `limit` (null: none) and `used` (null until loaded); null until the session says, or with no Plans package |
| `useCurrentBranch()` (`kit:branch`) | the branch the person works at, from `GET /me` (`branch`) and `GET`/`PUT /me/branch`: `inUse` (the workspace has two active branches or more), `mode` (`workspace`: nothing follows a branch; `all`; `branch`; `none`: no branch the person may see), `current` (`{ id, name }`, only in `branch`), `canChooseAll` and the `choices` they may switch to, by name. Filled by the branches layer and emptied with the session; null with no Branches package. `branchKey(state)` is the mode and the branch as one text, and `useBranchReload(reload)` calls `reload` each time it changes (not when the session first says), for a list whose API follows the branch. The frontend never sends the branch: the server reads the person's choice on every request |

The brand comes from the public `GET /tenant` as soon as a workspace's host loads, so its sign-in screens
already wear it (`AuthShell` shows the logo, the submit button takes the color), and from `GET /me` once
someone signs in. Ending the session forgets the theme and the localization; the brand stays, since it is the
workspace's and public. `app.vue` hands ModoProvider the primary palette of the brand (`brandPalette()`) and
the person's radius; core's `user-theme` plugin applies their color mode.

The dashboard's top bar names the workspace: its logo when it has one, then its name from the session (`useSession().workspace`),
cut with an ellipsis when it does not fit, so the bar keeps one line on a phone. Saving a new name in settings loads the
session again, and the bar follows; after a switch, the other workspace's session names it. The platform's name
(`usePlatformName()`) stands in only where there is no workspace: the platform's brand once the platform layer has
loaded it (`usePlatformPublic()`), else `NUXT_PUBLIC_PLATFORM_NAME`.

`usePlatformHost()` says whether the page is on the admin's host (`isPlatformHost`), its `host` and `label` (`admin`), and
builds an address there (`urlOf('/platform')`), with the page's scheme and port.

`phoneText(phone)` (`phone-text.ts`) writes a phone the API keeps in E.164 to be read: `+526641234567` is
`+52 664 123 4567`, the calling code apart and the rest in groups (a simple rule by length, not a country's own plan).
Anything that is not E.164 comes back as it was. Show a phone with it; a form keeps mood-ui's `PhoneInput`.

A form with `PhoneInput` (`format="e164"`) keeps the field's own value in its draft as it is typed, and gives the field its
flag with `usePhoneCountry(phone, address)`: the number's own calling code (a `+1` number under a Mexican address keeps
`+1`), the address's country while there is no number. `phoneOrNone(phone)` (`phone-country.ts`) turns what an emptied field
gives, its calling code alone (`+52`), into no phone; use it where the body is built and where changes are compared, never
on the field's value while it is typed, or mood-ui empties the field under the person's fingers. `phone-country.ts` holds
the calling codes of mood-ui 0.14.1's `PhoneInput`, which mood-ui does not export: check the list again on every mood-ui
upgrade. Until then, a flag of a calling code the list does not know stays as the person chose it, but its bare calling code
is not taken as no phone.

`brandPalette(color)` derives mood-ui's palette from a `#rrggbb`. For `default` it reads the monochrome
tokens `--brand-mono-50` to `--brand-mono-950` in `main.css`: mood-ui uses shade 600 as the primary on a
light page and 400 on a dark one, so the one palette is black in light mode and white in dark mode, also in a
subtree scoped to light. A screen with no workspace (the root domain: its home, signup, finding a workspace; the
admin's host) takes the platform's color when it chose one (`usePlatformPublic().primaryColor`), and otherwise gets no
palette and keeps mood-ui's own primary. `useBrandPalette()` is what `app.vue` uses: it reads the tokens
again after the mount, once the page has loaded and whenever a stylesheet is added to or changed in `<head>` (the dev
server injects its CSS from scripts), so a stylesheet that arrives late still paints the brand.

The `--brand-mono-*` scale is not monotonic (400 is the lightest, 200 is darker than 300, 900 equals 600): it is built
for mood-ui's per-mode shades, not to run light to dark. On a workspace on the default brand, a fixed `tenant-<shade>`
utility does not give the shade its number suggests; use mood-ui's semantic tokens (`bg-primary`,
`text-primary-foreground`, `bg-primary-subtle`) for anything that follows the brand.

**Hooks**, declared in `layers/core/app/composables/` next to what they serve: `useSession.ts` (`kit:auth:*`,
`kit:session:me`),
`useApi.ts` (`kit:api:unauthenticated`, `kit:portal:unauthenticated`), `useSettingsSections.ts` (`kit:settings:sections`),
`useProfileMenuLinks.ts` (`kit:profile-menu:links`), `useProfileSections.ts` (`kit:profile:sections`),
`usePlanContext.ts` (`kit:plan:load-usage`), `useDashboardBanners.ts` (`kit:dashboard:banners`),
`useClientTabs.ts` (`kit:clients:tabs`), `usePortalSections.ts` (`kit:portal:sections`),
`useSubscriptionSections.ts` (`kit:subscription:sections`: a layer pushes `{ id, order, component }` for a section of
the Subscription page, drawn under the plan's summary; the billing layer's plans and payments) and
`useOnboardingSteps.ts` (`kit:onboarding:steps`), `useTopbarItems.ts` (`kit:topbar:items`),
`useSidebarTopItems.ts` (`kit:sidebar:top`), `useSearchShortcuts.ts` (`kit:search:shortcuts`),
`useTeamMemberSections.ts` (`kit:team:member-sections`), `useDashboardWidgets.ts` (`kit:dashboard:widgets`), `useTopbarActions.ts` (`kit:topbar:actions`) and `useMapAdapter.ts` (`kit:map:adapter`):

| Hook | Called by | Meaning |
| ---- | --------- | ------- |
| `kit:api:unauthenticated` | `useApi`, on any 401 in the browser of a member's call | the auth layer ends the session only when the code is `auth.unauthenticated` |
| `kit:portal:unauthenticated` | `useApi`, on any 401 in the browser of a call with `session: "portal"` | the client's portal session is over: the clients layer sends the client back to sign in. The member's session is left alone. |
| `kit:session:me` | the auth layer, with the whole of `GET /me` | each layer reads the keys its package adds to `/me` into the state it owns in core. Runs before the session is `ready`. |
| `kit:auth:logout` | the auth layer | a session ended (logout, expired token, password reset, a handoff replacing it). Clear what your store keeps for the user here. |
| `kit:auth:sign-out` | any layer | ask auth to sign out |
| `kit:auth:switch-workspace` | any layer, with a slug | ask auth to open another workspace, signed in |
| `kit:auth:save-locale` | `useChangeLocale` | ask auth to save the language on the user |
| `kit:auth:refresh-session` | any layer | what the person may do may have changed; ask auth to reload the session |
| `kit:settings:sections` | the settings page, with an array | each layer pushes `{ group, component }` for the settings group it edits (`collectSettingsSections()` gathers them) |
| `kit:profile-menu:links` | the profile menu, with an array | each layer pushes `{ id, label, icon, to }` for a page of the person's own (`label` is an i18n key; `collectProfileMenuLinks()` gathers them). The auth layer adds "My profile". |
| `kit:profile:sections` | My profile, with an array | a layer pushes `{ id, order, component }` for a section of My profile; the page draws them after its own cards, by order (then id). `collectProfileSections()` gathers them. |
| `kit:plan:load-usage` | `usePlanGate`, once, for a gate on a limited quota whose use is not known | the plans layer loads what the workspace uses of each quota into `usePlanContext()`; a failure is thrown to the caller |
| `kit:dashboard:banners` | the dashboard layout, with an array, when it mounts | a layer pushes `{ id, order, component }` for a banner above every dashboard page (the plans layer's past-due notice, the onboarding layer's checklist); each draws itself only when it has something to say. `collectDashboardBanners()` gathers them, by order (then id). |
| `kit:clients:tabs` | a client's page (the clients layer's), with an array, when it mounts | a layer pushes `{ id, order, labelKey, component }` for a tab of the page; the clients layer's own are Profile (10) and Activity (20), a module's from 50 (a client's appointments). The component gets the prop `clientId` (string); `labelKey` is a message key of the layer that brings it; `readOnly: true` marks a tab with nothing to save (the Activity), on which the page shows no action bar. `collectClientTabs()` gathers them, by order (then id). |
| `kit:portal:sections` | the client portal's account page (the clients layer's), with an array | a layer pushes `{ id, order, component }` for a section of the portal, its `id` the section's key as `GET /portal/me` lists it (`spa.visits`). The page draws only the sections the API listed for the client, in the API's order, each under the API's label; the component gets no props. `collectPortalSections()` gathers them, by order (then id). See [Add a portal section](guides/add-a-portal-section.md#3-draw-it). |
| `kit:subscription:sections` | the Subscription page, with an array, when it mounts | a layer pushes `{ id, order, component }` for a section drawn under the plan's summary (the billing layer's plans and payments, see [Billing](packages/billing.md#the-billing-layer)). `collectSubscriptionSections()` gathers them, by order (then id). |
| `kit:topbar:items` | the dashboard's top bar, with an array, when it mounts | a layer pushes `{ id, order, component }` for something of the dashboard's top bar, before the profile menu (the search at order 5, the dashboard's Create menu at 8, the notifications layer's bell at 10). `collectTopbarItems()` gathers them, by order (then id). |
| `kit:topbar:actions` | the top bar's Create menu, with an array, when it mounts | a layer pushes `{ id, order, labelKey, icon, to, permission, offWhileImpersonating? }` for something people may create from the top bar (`labelKey` a message key of the layer, `icon` a component, `to` a path of the app). `collectTopbarActions()` gathers them by order (then id) and keeps only those whose `permission` the person has; the page itself still checks the plan. `offWhileImpersonating: true` (every create) leaves it out while a super admin acts as the person, since the API refuses it; with none left the menu is not drawn. |
| `kit:dashboard:widgets` | the dashboard's home, with an array, when it mounts | a layer pushes `{ key, component }` for a widget of the home, `key` being the widget's key as `GET /dashboard` lists it (`clients.recent`). The component gets one prop, `widget` (`DashboardWidgetView`: `key`, `label`, `size`, `data`, `failed`) and draws in core's `DashboardWidgetCard`. `collectDashboardWidgets()` gathers them by key, the first of a key winning. |
| `kit:search:shortcuts` | the search palette, with an array, as it opens | a layer pushes `{ id, label, icon, to }` for a page the palette offers under "Pages" (`label` already translated, `icon` a Heroicons outline name as the menu's, `to` a path of the app). The dashboard layer answers with the menu entries it already loaded, with no request of its own. `collectSearchShortcuts()` gathers them in the order pushed, each id once. |
| `kit:sidebar:top` | the dashboard's sidebar, with an array, when it mounts | a layer pushes `{ id, order, component }` for something at the top of the dashboard's sidebar, above the menu, in the mobile drawer too (the branches layer's switcher). The component gets one prop, `collapsed` (the sidebar shows icons only), and draws an icon with its tooltip then. An entry may add `shown`, read reactively, saying whether it has anything to show now: the sidebar draws its header (where mood-ui centres the collapse toggle) only for what shows. `collectSidebarTopItems()` gathers them, by order (then id); core's `MenuSidebar` draws them in mood-ui's `Sidebar` header. |
| `kit:team:member-sections` | a member's page of the team (the team layer's), with an array, when it mounts | a layer pushes `{ id, order, component }` for a section of a member's page; Team's working hours (10) and skills (20) come first, a module's from 50. The component gets the props `memberId` (string) and `editable` (boolean: the person may change it) and saves with the page's action bar through `useSaverEntry()`, its fields in the page's change set. `collectTeamMemberSections()` gathers them, by order (then id). See [Team](packages/team.md#a-members-page). |
| `kit:map:adapter` | the location picker's map (`resolveMapAdapter()`), with `{ factory: null }`, when a map mounts | a layer sets `choice.factory` to a `MapAdapterFactory` of another library (Google Maps JS, Leaflet); MapLibre (`createMapLibreAdapter`) otherwise. See [Maps](configuration/maps.md#another-map-library). |
| `kit:onboarding:steps` | the setup wizard, with an array, when it mounts | a layer pushes `{ step, component }`: the screen of an onboarding step it brings (the settings layer's for the kernel's two). `collectOnboardingSteps()` gathers them; a step with none shows that it cannot be done there. |

The banners, the sections of the Subscription page, those of My profile and those of a member's page are ordered by core's `orderedEntries()` (by
`order`, then `id`).

More helpers of core:

| Name | Does |
| ---- | ---- |
| `waitForSession()` | resolves once the session is no longer `loading` (ready, or idle after a failed load); at once when nothing is loading. A guard that needs the session awaits it. |
| `useRequestState(initialStatus)` | the status, error and `hasLoaded` of a repeatable request, keeping only the latest run's result; `useAsyncState` and `useListQuery` are built on it |
| `useChangeLocale()` | an action that switches the language at once and asks auth to save it on the user (`kit:auth:save-locale`); a failure to save is toasted |
| `useDebouncedValue(source, ms)` | `source`, once it has kept still for `ms`: a search asks the API when the person stops typing (300 ms in the admin's lists and the team's members), not on every key; a wait is forgotten when the scope ends |
| `useLocaleOptions()` | the app's languages as a select's options, each under its own name (`English`, `Español`): what a language switcher offers (core's `LocaleSwitcher`, the client portal's top bar) |
| `usePhoneCountry(phone, address)` | the flag of mood-ui's `PhoneInput` (`v-model:country`): the number's own calling code, the address's country while there is no number; a flag the person chose stays while the number starts with its code, and so does one of a calling code the list does not know |
| `phone-country.ts` | `phoneOrNone(phone)` (an emptied field's bare calling code is no phone), `phoneDial(phone)` (the calling code a number starts with), `phoneDialOf(country)` and `phoneCountry(phone, fallback)`, over mood-ui 0.14.1's calling codes (check them on every mood-ui upgrade) |

Core also holds the pieces every settings section is built with, so a module's layer can add the section of its own
group without copying code: `useSettingsForm()`, `provideSettingsSaver()` (which also provides the page's change set),
`useSaverEntry()` (hands a form of the page to that saver and gives it its own submit: the page's save, or the form's
alone outside such a page; My profile's details use it too), `useDirtySections()`, the `SettingsSection` and
`SettingsSectionSkeleton` components, `getGroup()` and `saveGroup()` (`app/services/settings.ts`) and the group types
(`app/types/settings.ts`). See [Settings](packages/settings.md#the-settings-layer). A section built with
`useSettingsForm()` has changes when its own keys do, so a section that also edits something the group does not hold
(the notifications section's events) tracks those fields under the same group and hands the saver an entry of its own
with `useSaverEntry()`: the section's dot and the review list both, and Save sends each through its own API.

Core also holds what the screen of an onboarding step is built with, so any layer can bring one: `useOnboardingStepForm()`
(the step's form: its starting values from the API, its schema, its send to `POST /onboarding/steps/{step}/complete` when
the wizard's Continue is pressed, field errors on their fields, an error about no field in its banner, a 409
`settings.confirmation_required` confirmed as the settings page does and sent again with `confirm: true`, and `readOnly`
without the step's permission), `useImpactConfirmation()` (the question both ask: mood-ui's confirmation with what the
change affects, Save anyway and Cancel),
`provideOnboardingStepHost()` (what the wizard gives its screens), `completeStep()` (`app/services/onboarding.ts`) and the
types (`app/types/onboarding.ts`). See [Onboarding](packages/onboarding.md#the-onboarding-layer).

Core also holds the editor of a week of hours, for a member's week (Team), a branch's opening hours (Branches) or a
module's: `WeekHoursEditor` (the seven days, Monday first, each open or not with its span in 24 h steps of 15 minutes;
`v-model` takes a new array on each change, `idPrefix` names its ids and test ids (`<prefix>-day-<weekday>`), `offLabel`
is what the page calls a closed day, and `editable` turns it read-only), `useWeekHoursDraft(group, original, labels)` (the
draft of the week on an editing page, made again when `original` changes, with `isDirty`, `valid` (no day ends before
it starts), `reset`, its field in the page's change set and its group marked dirty; the section saves it through
`useSaverEntry()`), and `week-hours.ts` (`WEEKDAY_KEYS`, `weekOf`, `dayProblem`, `sameWeek`, `describeWeek`,
`timeAsDate`, `dateAsTime`) with the `WeekDay` type (`app/types/week.ts`, the API's shape: `weekday` 1 to 7, `enabled`,
`startsAt` and `endsAt` as `HH:mm`). The days' names and the field's messages are `core.week.*`. Team's
`WorkingHoursSection` is the model. A set of ids edited with a `KitSelect` with `multiple` (a member's skills, a branch's people) has its draft in
`useSetDraft(group, original, { title, field, label, nameOf })`: `selected` for the field's `v-model`, `isDirty` (in any
order), `reset`, and its field in the page's change set as added and removed names; the section saves it through
`useSaverEntry()`.

Before an action that cannot be taken back or that changes someone's place (deactivate, remove, delete), a page asks with
core's `ConfirmActionDialog` (`v-model`, `title`, `body`, `action`, `tooltip`, `cancelTooltip`, `busy`, and `confirm`
when the action is chosen): two actions, Cancel and the action in the danger color. Team's members and skills and the
branches' list use it.

Every dialog is core's `KitDialog` (`v-model`, `title`, `description`, `width`, `alert`, and the `body` and `footer`
slots): mood-ui's `Dialog` as it comes, centred over its dimmed backdrop, with at most two `KitButton`s in its footer. A
question asked from a script is mood-ui's `useConfirm().confirm({ title, description, confirmLabel, cancelLabel, color })`,
which resolves `true` or `false`: core's `ConfirmQueueDialog`, mounted once in `app.vue`, draws it in the same Dialog.

Core also draws maps, for the location picker or a module of yours, through an adapter (`app/types/map.ts`): a
`MapAdapter` draws one map in an element with one pin (`setPin(point | null)`, `flyTo(point)`, `onPinMoved(callback)` for
a drag or a click, `destroy()`), and a `MapAdapterFactory(element, { style, center, interactive })` makes one.
`createMapLibreAdapter` is the kit's: MapLibre GL's CSP build, its code, CSS and worker loaded only when a map is drawn,
the worker served by the frontend (no `blob:` in the Content Security Policy); it shows the world with no point and the
street of one, and never draws HTML from data. `mapStyle(config)` turns `runtimeConfig.public.map` into the style
(the configured vector style, or a raster style of the configured tiles with their attribution). `resolveMapAdapter()`
answers the layer's adapter (`kit:map:adapter`) or MapLibre's. See [Maps](configuration/maps.md).

What a location picker does besides drawing the map is core's too, for any address form:

- `app/services/geocoding.ts`: `searchPlaces(query, country, signal)` and `reversePlace(point, signal)`, the backend's
  `POST /geocoding/search` and `/reverse` (Geocoding), never retried, with the text and the point in the body, never in
  an address. A place (`GeoPlace`) has a `label`, its point and its address split as a form's (`line1`, `line2`, `city`,
  `state`, `postalCode`, `country`).
- `countryLabel(code, locale)` and `countryOptions(codes, locale)` (`intl-names.ts`): a country by its name in the
  screen's language, and the countries the API takes as a select's options, sorted by that name.
- `useLocationPicker({ address, point })`: typing the address (`addressTyped()`, called by the fields' input, never by a
  fill) waits for a 900 ms pause, with a street of three characters and a city, then searches (the form's country as a
  hint) and moves the pin to the first place, leaving the address as typed; moving the pin (`pinMoved(point)`, a drag, a
  click or `locateMe()`, the browser's location on the person's click) keeps the point at once, rounded to 6 decimals,
  and, while `fillFromPin` is on, fills the address from it once the pin rests for 400 ms; `clearPin()` takes it away.
  Each question cancels the one before (an `AbortController`) and a late answer is dropped. A failure never toasts:
  `status` (`idle`, `searching`, `found`, `not_found`, `busy`, `failed`, `location_denied`) says it in the line under the
  map (`core.location.status.*`). A busy provider (429 `geocoding.busy`) is asked nothing more for the seconds the API
  names in `meta.retryAfter` (2 when it names none): whatever the person types or moves meanwhile waits, and goes as one
  question once the time is up, while the line says the search is busy. `addressQuery(address)` and `addressOf(place, country)` turn one into the other.
- `LocationPicker` puts it on screen: `v-model:address` (`AddressValue`: `addressLine1`, `addressLine2`, `city`, `state`,
  `postalCode`, `country`, empty text for a blank field) and `v-model:point` (`MapPoint` or null), with `countries` (the
  ISO codes the API takes), `idPrefix` (the ids and test ids: `<prefix>-addressLine1`, `<prefix>-map`,
  `<prefix>-clear-pin`, `<prefix>-location-status`), `disabled` and `errors` (by field; `latitude` or `longitude` shows in
  the status line). It draws `AddressFields` (the five text fields and the country, searchable, by name), the switch
  "Fill the address from the pin", "Use my location" (when the browser can tell) and "Remove the pin", the map and the
  status line. The map (`LocationMap`) is drawn in the browser only (`ClientOnly`), by the adapter, and says so when it
  cannot load (no WebGL): the address still works. Its element carries `data-map-ready` once it is drawn (`true`) or
  failed (`false`). At rest with a pin already placed, the status line says how to move it
  (`core.location.status.pinned`). See [Maps](configuration/maps.md#use-the-picker-in-a-module).

Run a `kit:auth:*` call inside `useAction`, which toasts a failure:

```ts
const app = useNuxtApp();
const signOut = useAction(() => app.callHook("kit:auth:sign-out"));
```

A module whose package adds keys to `GET /me` reads them in a plugin of its layer; auth reads only `user` and `tenant`,
and hands the rest over untouched. Read the value without trusting its shape:

```ts
// layers/billing/app/plugins/billing-session.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:session:me", (me) => {
    useBillingStore().customerId = typeof me.billingCustomer === "string" ? me.billingCustomer : null;
  });
});
```

The rbac layer (`rbac-session.ts`: permissions and roles), the settings layer (`settings-session.ts`: brand,
localization, theme) and the plans layer (`plans-session.ts`: the plan) are the models. Core's `readWorkspaceBrand()`,
`readUserTheme()`, `readWorkspaceLocalization()` and `readPlanContext()` read a value into core's own states, and
`withUsage()` adds to a plan what GET /me/subscription counted of each quota. When the session ends, `clearSessionState()`
(core, called by auth) empties the session, the permissions, the theme, the localization and the plan before
`kit:auth:logout` runs.

A store of your own that keeps something belonging to the user clears it in a plugin:

```ts
// layers/billing/app/plugins/billing-session.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:auth:logout", () => {
    useInvoicesStore().clear();
  });
});
```

## The dashboard's home

The home draws what `GET /dashboard` lists, in the API's order, each widget by the component a layer registered under its
`key` through `kit:dashboard:widgets`. Every component draws inside core's `DashboardWidgetCard` (`widget`, an optional
`to` with its `linkTooltip`, and its figures in the default slot), so every card looks the same: a title, a link to the
page it sums up, and the figures (mood-ui's `Stat`). When the widget's data could not be worked out (`failed`), the card
says so in place of its content. The `size` (`small`, `medium`, `large`) is a third, two thirds or all of a wide row, and
one column on a phone. A widget the API lists with no component registered is not drawn. `quotaView()` (core's
`utils/quota-tone.ts`) gives a quota's percentage and tone for every screen that shows one (the subscription, the home).
The widgets themselves are described in [Dashboard](packages/dashboard.md).

## Gating an action by plan

A permission hides; a plan disables with a tooltip. An action the person may not take is hidden (`v-can`); one the
workspace's plan does not allow (a feature it leaves out, a quota that is full) stays on screen, disabled, with a tooltip
that says it is the plan, so the person knows an upgrade would open it. Core's `usePlanGate()` decides from
`usePlanContext()`:

```ts
const { t } = useI18n();
const gate = usePlanGate({ feature: "reports", quota: "members" });
```

```vue
<KitButton
  v-can="'team.invite'"
  :disabled="gate.blocked"
  :tooltip="gate.tooltip ?? t('team.tooltips.invite')"
  :label="t('team.invite')"
  @click="invite()"
/>
```

`gate` is a computed `{ blocked, reason, tooltip, limit }`: `reason` is `feature` or `quota`, and `tooltip` is core's "Not in
your plan" or "Plan limit reached" while it is blocked, null otherwise. The gate takes a getter or a ref too, for a gate
that changes. A gate on a quota with a limit asks the plans layer, once, for what the workspace uses
(`kit:plan:load-usage`); only someone with `subscription.view` loads it, and a failure is toasted. When the gate cannot
tell (no plan yet, a quota with no limit, a use it does not know) it lets the action through: the API refuses anyway, 403
`plans.feature_not_included` or 422 `plans.quota_exceeded` (see [Plans](packages/plans.md#api)), and the screen shows
that message.

A page that knows the use itself passes it as `usage` (`{ used, limit }`), and the gate trusts it and asks the plans
layer for nothing, even before the session says the plan. The team's Invite button does: it reads its places from
`GET /team/seats`, which whoever sees the team may read, so a manager without `subscription.view` still sees the limit.
While the gate blocks for a quota, `limit` is that quota's limit (null otherwise), for a tooltip of the page's own that
names it:

```ts
const seats = useAsyncState(async () => (await getSeats()).data);
const gate = usePlanGate(() => (seats.data.value ? { quota: "members", usage: seats.data.value } : {}));
// "Your plan includes 10 members", and a link to KIT_ROUTES.subscription for whoever has `subscription.view`
const tooltip = computed(() => (gate.value.limit !== null ? t("team.tooltips.plan_members", { count: gate.value.limit }) : gate.value.tooltip));
```

## Pages

| Page meta | Effect |
| --------- | ------ |
| `layout: 'dashboard'` | the signed-in shell: sidebar from `GET /menu`, top bar with the profile menu. It builds the page's breadcrumb (mood-ui's `Breadcrumbs`, with the menu's icons) and hands it to the page's `PageHeader`, which shows it from two levels down. It is core's `AppFrame` (the shell, the scrolling area with the kit's gutter, the banners and the action bar's strip) with the dashboard's top bar and its menu in core's `MenuSidebar` (the menu with its loading and failed states; `menuIcon()` maps the API's icon names, `activeMenuRoute()` picks the active entry). The admin's `platform` layout is the same frame. |
| `layout: 'auth'` | the public-screen layout from `core` |
| `auth: 'required'` | signed-out visitors go to `/login?redirect=...`; the session loads before the page |
| `auth: 'guest'` | signed-in visitors go on to `/dashboard` |
| `permission: 'x.view'` or a list | without all of them, the person goes to `/dashboard` |
| `breadcrumb: 'my.i18n.key'` | the crumb of a dashboard page the menu does not list (`/dashboard/me/profile`), or of a page under a menu entry (`/dashboard/team/:id` is "Member"); without it the crumb comes from the route name, or is "Detail" for an id under a menu entry. Declared in `layers/core/app/types/page-meta.d.ts`. |

A page that depends on who is signed in is rendered in the browser only: the session lives in
`localStorage`, so a server render would draw it for nobody. Give its path core's `browserOnlyRule()` (`ssr: false` and
`X-Robots-Tag: noindex`) in its layer's `nuxt.config.ts`:

```ts
import { browserOnlyRule } from "../core/app/utils/kit-routes";

export default defineNuxtConfig({
  routeRules: { "/billing/**": browserOnlyRule() },
});
```

`/dashboard` and `/dashboard/**` already have it (the dashboard layer's config), so a module's pages under
`pages/dashboard/` need nothing.

An editing page calls core's `useLeaveGuard()`: leaving it for another screen of the app with changes not saved
(`useDirtySections()`) asks first, and closing or reloading the tab gets the browser's own prompt. The settings page
and My profile use it.

A layer never spells out the path of another layer's page: core's `KIT_ROUTES` names the ones that cross
(`dashboard`, `login`, `profile` (My profile), `findWorkspace`, `handoff`, `signup`, `notificationDeliveries`, the delivery log, which a
module opens with `?subjectType=...&subjectId=...` for one record's history, `platform`, the admin's panel, and
`waitlist`, the root domain's public waitlist, and `subscription`, where a gate on the plan links whoever may see it), each owned by the layer it belongs to.

A new public screen in a layer of its own uses `layout: 'auth'` and `<AuthShell>` from `core`, which also
provides `FormSubmitButton` (the full-width submit button of the public forms, with `arrow` on the sign-in screens),
`CaptchaWidget` with `useCaptcha()`, `PasswordStrength`, the password and email rules, `useAuthPage`,
the address helpers `workspaceUrl()` and `rootDomainUrl()`, `useRootDomain()`, the root domain from the settings, and
`takeLinkFragment(names)`, which reads what an emailed link carries in its fragment (`#token=...`: no server, log or
`Referer` sees it), each value given once, and has the router take the fragment off the address at once (the password
reset and the notifications' preference center).

## Page anatomy

Every page of a module in the dashboard is built the same way, top to bottom, on a `flex flex-col gap-6` root:

1. **`PageHeader`** (core): the breadcrumb, the title, the subtitle, and the primary action at the
   right of the title, which moves under the title and subtitle below `sm`. It is mood-ui's `PageHeader` as it comes, at its default size: the title is its heading style, an `h2`. Dashboard
   pages are behind login and `noindex`, so they need no level 1 heading for SEO. The kit will switch back to `h1` with a
   one-line change in core's `PageHeader` once mood-ui lets the title tag be chosen;
   the trail comes from the dashboard layout through `usePageBreadcrumb()`, so the page passes only its texts.
2. **Tabs**, when the page has them: mood-ui's `Tabs` with `variant="line"` (the bottom-border indicator; never `pill`
   or `segmented`), right after the header, with the toolbar and the content of each tab in its `#panel-<value>` slot
   (mood-ui's `Tabs` always draws its panels, so it does not go inside the header). The kit has no wrapper for tabs, so
   every `Tabs` sets the variant itself, even though `line` is mood-ui's default, to keep it from changing under a new
   default.
3. **`PageToolbar`** (core), when the page has a search, filters or secondary actions: a layout of three slots,
   `#search` at the left (mood-ui's `SearchInput`), `#filters` and `#actions` at the right. The search takes the room the
   filters leave, up to its own width, and narrows first (down to 12rem) before the filters wrap. On a phone they stack.
4. **The content**: a table, sections, a form.
5. **`PageActionBar`** (core), on a page that edits something and saves it on demand: the last child of the root,
   always visible for whoever may edit, its actions disabled until something changes. See
   [The action bar](#the-action-bar).

```vue
<!-- layers/billing/app/pages/dashboard/invoices/index.vue -->
<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="t('billing.invoices.title')" :subtitle="t('billing.invoices.subtitle')">
      <template #actions="{ tooltipPlacement }">
        <KitButton :label="t('billing.invoices.new')" :tooltip="t('billing.tooltips.new')" :tooltip-placement="tooltipPlacement" color="primary" size="small" @click="create()" />
      </template>
    </PageHeader>

    <PageToolbar>
      <template #search>
        <SearchInput v-model="search" :aria-label="t('billing.invoices.search')" :placeholder="t('billing.invoices.searchHint')" full-width />
      </template>
      <template #actions>
        <KitButton :label="t('billing.invoices.export')" :tooltip="t('billing.tooltips.export')" tooltip-placement="top-end" variant="outline" size="small" />
      </template>
    </PageToolbar>

    <AsyncBoundary :status="status" :error="error" :loaded="hasLoaded">
      <Table :data="shown" :columns="columns" row-key="id" />
    </AsyncBoundary>
  </div>
</template>
```

The `actions` slot of `PageHeader` passes `tooltipPlacement` (`top-end` beside the title, `top-start` under it). A
subtitle with more than text (the role editor's badge) goes in its `#subtitle` slot; pass that slot always, even while
its data loads, since mood-ui's header decides whether it has a subtitle when it mounts. The roles list
(`layers/rbac/app/pages/dashboard/roles/index.vue`) and the role editor (`[id].vue` next to it) are the models.

### The action bar

Every editing page ends in core's `PageActionBar`, and has no Save of its own anywhere else. It is always visible on an
editing page, for whoever may edit, once there is something to edit: while what the page edits first loads, when it fails
to load, and when it does not exist (a role id of another workspace) the page shows its message with no bar under it
(`v-if` on the permission and on the loaded data). It holds only its buttons (no text), and its actions are disabled
until something changes (`dirty`). They sit at the right, each a `KitButton` with its tooltip at `top-end`:

| Button | Look | Emits | Shown | Disabled |
| ------ | ---- | ----- | ----- | -------- |
| Cancel | `ghost` | `cancel`: throw the changes away | always | without changes, or while saving |
| Undo | `outline` | `undo`: step back through the changes | with `undoable`, on a page that can | without changes, while saving, or with `canUndo` false (no step to take back) |
| Review changes | `outline` | opens the review of changes; its Save emits `save` | while the page's change set has changes | while saving |
| Save | primary, the workspace's brand color; `saving` shows its loading state | `save` | always; `saveLabel` rewords it | without changes |

Below `sm` Cancel, Undo and Review changes are icons (an X, an arrow back, an eye), each with its tooltip and its words as
its aria label, so the bar keeps one line on a phone; Save keeps its words.

It is a full-width strip attached to the bottom, not a card: a line above it, the page's background, no shadow or
rounded corners. The dashboard layout (and the admin's, both on core's `AppFrame`) scrolls the page in an area of its own
and keeps a strip under that area; the bar is teleported into it (`providePageActionBarTarget()` in the frame,
`usePageActionBarTarget()` in the bar), so it runs
from the sidebar's edge to the right edge of the window whether the sidebar is open, collapsed or a drawer on a phone,
stays at the bottom, and never covers the page: never pad a page for it, and never make it `fixed`. Its content has the
page's own width and gutter (`PAGE_GUTTER`, the util the layout pads the page with), so its buttons end at the content's
right edge. Outside the dashboard layout (a test, a layout of your own)
it stays where the page put it, sticky at the bottom. Put it last, straight in the page's `flex flex-col gap-6` root,
never inside `AsyncBoundary` or `Tabs`, and hide it with `v-if` from someone who may only look:

```vue
<!-- layers/billing/app/pages/dashboard/invoices/[id].vue -->
<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="t('billing.invoice.title')" />

    <AsyncBoundary :status="status" :error="error" :loaded="hasLoaded">
      <InvoiceForm v-model="draft" />
    </AsyncBoundary>

    <PageActionBar v-if="can('invoices.edit')" :dirty="isDirty" :saving="isSubmitting" @save="onSubmit()" @cancel="form.resetForm()" />
  </div>
</template>
```

A page that registers its fields in a change set (below) gets Review changes in the bar too; `dirty` then comes from it.

A page whose every choice is saved the moment it is made has no bar (the kit has none since My profile gained its
details). My profile has one for its details (name, phone, language), through the same `provideSettingsSaver()` as the
settings page; its photo, password, email and sessions are actions of their own. The role
editor passes `undoable`, `canUndo` while its draft has a step to take back, and words Save with the count of changes.
The settings page has one bar for all its sections: `provideSettingsSaver()` (core) collects the sections built with
`useSettingsForm`, and Save sends one PATCH per section with changes, in the page's order, each with its own versions; a
section the API refuses opens and shows why (the field errors on its fields), a confirmation resends that section alone,
and the other sections keep their save. Cancel throws away every section's changes.

The dashboard's scrolling area has `container-type: size`, so a page can size something to the visible part of it
(`100cqh`): the role editor's impact panel is sticky and as tall as its pane, up to that height. The area is then the
containing block of a `fixed` element inside it; every mood-ui overlay (tooltip, menu, dialog, drawer) is teleported to
`<body>`, so none is affected, but do not put a `fixed` element of your own in a page.

### What will be saved: the change set

Every editing page tells the person what will be saved, through core's change set. The page provides it and registers
each field it saves, by group, with its label, the value saved, the value now and a format:

```ts
const changes = provideChangeSet();
const invoice = changes.group("invoice", () => t("billing.invoice.title"));
invoice.field("dueDate", { label: () => t("billing.invoice.dueDate"), original: () => loaded.value?.dueDate, current: dueDate });
invoice.field("tags", { label: () => t("billing.invoice.tags"), original: () => loaded.value?.tags ?? [], current: tags, format: formatAsSet() });
const dirty = invoice.isDirty; // the bar's `dirty`: nothing else keeps a copy
```

| Exposes | What |
| ------- | ---- |
| `isDirty`, `group(id).isDirty` | whether the page, or a group, has changes |
| `isFieldDirty(group, key)`, `isGroupDirty(group)` | the same, for one field or group |
| `dirtyGroups` | the groups with changes, `{ id, label }`, in the page's order (`provideChangeSet({ order })`) |
| `diff` | group → field → `before` and `after` (`{ text, swatch? }`), or a set's `added` and `removed` labels |
| `count` | one per value changed, one per item added or removed |

It keeps no copy of any value: after a save `original` is the new value, after a cancel `current` is the saved one, and
the changes are gone. A field is registered until the component that registered it unmounts (or until the function
`field()` returns is called). The formats, all in core's utils, word a value in the screen's language:

| Format | Shows |
| ------ | ----- |
| `formatAsText(show?)` (the default) | the value, or `show(value)` |
| `formatAsColor(name?, paint?)` | a round swatch and the color's name (its hex upper case without one) |
| `formatAsTimezone()` | `America/Tijuana (UTC-07:00)` |
| `formatAsCurrency()` | `MXN — Mexican Peso` |
| `formatAsLanguage()` | `Spanish`, `Español` |
| `formatAsList(item?)` | a list in its order, joined: `Red, Green, and Blue` |
| `formatAsSet(item?)` | compared as a set; shown as the items added (green, `+`) and removed (red, `−`) |

With a change set, the page's `PageActionBar` offers **Review changes**: core's `KitDialog` (mood-ui's `Dialog`) with every change by group
(the group's name only when the page has more than one), each field's label and its value before (muted) → after
(emphasised), a color as its swatch, a set as added and removed badges, and two actions: Close (nothing happens) and
Save changes (the page's save). A part of the page with changes shows core's `UnsavedDot` (`group`): a warning dot named
"Unsaved changes" by its tooltip and aria label. `SettingsSection` uses it in its header, open or closed; My profile's
cards beside their title. The settings sections register through `useSettingsForm`'s `label` and
`fields`, and the role editor through `useRoleEditor(id, { changes })`. A value that is saved the moment it is chosen
(the logo) is not a field.

A module's form built with vee-validate registers its fields the same way, against the record it loaded:

```vue
<!-- layers/billing/app/pages/dashboard/invoices/[id].vue -->
<script setup lang="ts">
import { getInvoice, updateInvoice } from "../../../services/invoices";

definePageMeta({ layout: "dashboard", auth: "required", permission: "invoices.view" });

const route = useRoute();
const { t } = useI18n();
const { can } = usePermissions();
const invoice = useAsyncState(async () => (await getInvoice(String(route.params.id))).data);
const form = useForm({ initialValues: { reference: "", currency: "USD", tags: [] as string[] } });
const [reference] = form.defineField("reference");
const [currency] = form.defineField("currency");
watch(invoice.data, (loaded) => loaded && form.resetForm({ values: { reference: loaded.reference, currency: loaded.currency, tags: [...loaded.tags] } }));

const changes = provideChangeSet();
const fields = changes.group("invoice", () => t("billing.invoice.title"));
fields.field("reference", { label: () => t("billing.invoice.reference"), original: () => invoice.data.value?.reference ?? "", current: reference });
fields.field("currency", { label: () => t("billing.invoice.currency"), original: () => invoice.data.value?.currency, current: currency, format: formatAsCurrency() });
fields.field("tags", { label: () => t("billing.invoice.tags"), original: () => invoice.data.value?.tags ?? [], current: () => form.values.tags, format: formatAsSet() });

const { onSubmit, isSubmitting, formError } = useFormSubmit({
  form,
  submit: (values) => updateInvoice(String(route.params.id), values),
  onSuccess: () => invoice.execute(),
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="t('billing.invoice.title')" />
    <AsyncBoundary :status="invoice.status.value" :error="invoice.error.value" :loaded="invoice.hasLoaded.value">
      <InvoiceForm v-model:reference="reference" v-model:currency="currency" :error="formError" />
    </AsyncBoundary>
    <PageActionBar v-if="can('invoices.edit')" :dirty="changes.isDirty.value" :saving="isSubmitting" @save="onSubmit()" @cancel="form.resetForm()" />
  </div>
</template>
```

## Design rules

- Build screens from mood-ui components (`import { Table, Typography } from "mood-ui"`). ESLint fails
  on a plain `<button>`, `<input>`, `<select>` or `<textarea>` and names the component to use.
- Free text that can run past one line (a description, notes, a message, a body) goes in mood-ui's `Textarea` as it comes,
  never in a one-line `Input`: `:rows="3"`, `:max-length` at the API's limit and `show-counter`, as the template editor's
  body does with eight. When the API takes the text on one line (`PlainName`), bind `:model-value` and pass what is typed
  through core's `joinLines` on `@update:model-value`, so Enter or a pasted paragraph becomes spaces, not a refusal:

  ```vue
  <Textarea
    id="role-editor-description"
    :model-value="description"
    :label="t('rbac.create.description_label')"
    :rows="3"
    :max-length="500"
    show-counter
    full-width
    @update:model-value="(value: string) => (description = joinLines(value))"
  />
  ```
- mood-ui's components are used as they come: their own props, variants, sizes, colors and slots, laid out from
  outside. No forced utilities (`text-2xl!`), no selectors into their internals (`[&_.modo-…]`), no classes that fight
  their sizes, heights, colors or radius, no hand-made replacement of a control mood-ui has. ESLint
  `mood-kit/no-mood-ui-overrides` catches the first two, in `class` and in every `*Class` prop (`cellClass`,
  `wrapperClass`), in a template or in a script's column definitions, and a `SurfaceCard` without `:framed="false"`. Where mood-ui lacks something, use its closest option and
  list the gap below.
- Every button is core's `KitButton`, which wraps mood-ui's `PressButton` (it presses in and springs back) in mood-ui's `MorphTooltip` (core's `KitTooltip`) and requires the tooltip's text;
  an icon-only one also needs `ariaLabel` (ESLint `mood-kit/kit-button`, and `nuxt typecheck` for the tooltip). The
  text is one short line, two to five words and at most 40 characters, under a key with a `tooltips` segment, which a
  core test checks in every locale file (each plural form of a `one | many` message on its own). A button at the right edge takes `tooltipPlacement="top-end"` (`bottom-end`
  in the top bar). A text link is a `KitButton` with `to` and `variant="text"` (mood-ui has no link component): an `<a>`
  with the page's address, opened by the router on a plain click, and by the browser for another host or `target="_blank"`.
  Its tooltip shows while a mouse rests on it and on keyboard focus, never on a touch (a tap on a phone shows none), and
  closes when the button is pressed and when the route changes, so it never stays over the dialog, drawer or page the
  button opened (`useButtonTooltip`, through mood-ui's controlled `open`).
  The button is the only element a `KitButton` puts in the page (the tooltip is teleported), so a class that lays it out
  in its parent (`ml-auto`, `self-center`) goes on it as `class`.
  A control that is its own element (a swatch, the profile menu's avatar, a choice card) gets core's `KitTooltip` alone
  around it, driven the same way (`:open` from `useButtonTooltip()`, its listeners on the control), so its tooltip never
  stays over the menu or the choice it opened; without `open`, `KitTooltip` opens on hover and focus (a badge, a note).
  A value picker is core's `KitSelect` (mood-ui's `MorphSelect`, `searchable` for a long list, `icon` for a leading glyph,
  `noneLabel` for an option of nothing chosen, first in the list, which shows for `null` and `""` and answers `null`);
  a set of ids is the same `KitSelect` with `multiple` and `v-model:values`. An action menu is mood-ui's `Menu` (`MenuTrigger`, `MenuContent`, `MenuLabel`, `MenuItem`,
  `MenuSeparator`). A switch is mood-ui's `GlassSwitch`. A card is mood-ui's `SurfaceCard` with `framed: false` (a single
  border, never its default inner frame): `<SurfaceCard :framed="false">`, which `mood-kit/no-mood-ui-overrides` requires.
  ESLint `mood-kit/kit-button` keeps mood-ui's `PressButton` inside `KitButton` and its `MorphTooltip` inside
  `KitTooltip`, and the plain `Button` and `Tooltip` out of the kit:

  ```vue
  <KitButton :label="t('billing.send')" :tooltip="t('billing.tooltips.send')" color="primary" @click="send.run()" />
  <KitButton :icon="TrashIcon" :aria-label="t('billing.delete')" :tooltip="t('billing.tooltips.delete')" variant="ghost" />
  <KitButton :to="KIT_ROUTES.login" variant="text" color="primary" size="small" :label="t('billing.sign_in')" :tooltip="t('billing.tooltips.sign_in')" />
  ```
- A choice between views or modes (all or unread, monthly or yearly prices, the default color or one of its own) is
  mood-ui's `Tabs` in the `line` variant, with what each shows in its panel (`#panel-<value>`, or `#panel` with `lazy` and
  `:keep-mounted="false"` when every tab shows the same thing for another value), never `Segmented`. A setting's value
  picked in a row of several (a notification's channel: at once, daily summary, off) is not a view: it stays
  `Segmented`.
- A card groups related fields and leaves no large empty area: fields that belong together share one card, laid out in
  columns on a wide screen (the platform's Brand card: name and color at the left, the logo at the right; the workspace's
  Identity section the same), rather than a narrow column with half the card empty, or a card for one field.
- In a table, a row's actions are outline `KitButton`s at its end (icons with their tooltip and aria label), only those its
  state allows, and the name is plain text, never a button or a link that opens the row: Open is an action like the others.
  The branches and the admin's workspaces are the model.
- Colors come from tokens. `mood-kit/no-raw-colors` fails on Tailwind palette classes (`bg-blue-600`,
  `text-white`), hex values, color functions that do not wrap a `var()`, and named colors in inline styles,
  `<style>` blocks and SVG attributes.
- The tokens: mood-ui's semantic classes (`bg-primary`, `text-foreground`, `bg-background`, `bg-muted`),
  `ink-*` for neutrals, `accent-*` for the kit's fixed blue, `danger-50` and `danger-800` for error
  surfaces, and `tenant-*` for the workspace's brand scale. They are defined in
  `frontend/app/assets/css/main.css`.
- Every source file has at most 300 lines, blank lines and comments not counted (ESLint `max-lines`).
- Light and dark mode both ship. mood-ui keeps the choice in `localStorage` (`modo-color-mode`), and a
  script in `<head>` applies it before the first paint.
- Inline `eslint-disable` comments do nothing: ESLint ignores inline config.

## i18n

- `en` is the default and fallback locale; `es` ships too. The URL carries no locale prefix; the choice is
  kept in the `i18n_redirected` cookie, then the browser's language is used.
- Every visible string, page titles included, goes through `t()`. ESLint fails on bare text in a template
  and in attributes such as `label` and `placeholder`; it cannot see strings in scripts or bound literals
  (`:label="'Email'"`).
- A message that counts something (`{count} members`, `{days} days`, `{total} steps`) has its plural forms, one and many,
  in every language where they differ (`"Your plan includes {count} member | Your plan includes {count} members"`), and the
  code passes the number that chooses the form: `t("team.tooltips.plan_members", { count }, count)`. The backend does the
  same with Laravel's `one|many` lines: `trans_choice()` in a mail, and a `DomainError` whose replacements carry an integer
  `count` is rendered in its plural form.
- App messages are in `frontend/i18n/locales/<code>.json`; each layer's are in
  `layers/<name>/i18n/locales/<code>.json`, namespaced by layer (`core.*`, `rbac.*`). Every key segment is snake_case
  (`rbac.editor.save_with_count`); a core test fails on any other.
- Missing keys fall back to English at run time; a core test (`locales.test.ts`) fails when a locale file of the app or
  of any layer lacks a key `en.json` has, leaves one blank, or misses a literal key the layer's code asks for.
- mood-ui's own texts (table pagination, selects, dates, aria labels) follow the active locale through
  `ModoProvider` in `app.vue`. mood-ui ships `en` and `es`.

To add a language, see [Add a locale](guides/add-a-locale.md).

## Known gaps in mood-ui

What mood-ui lacks, which the kit does not patch from outside (it uses the closest option and accepts the
difference):

- `Sidebar`'s collapse button has a fixed English aria label, so screen readers read it in English in any
  locale.
- `Accordion`'s header has a title only: settings sections show their description inside the open panel.
- `Accordion` keeps closed panels in the page, folded.
- `Accordion`'s header has no slot after the title: `SettingsSection` lays its unsaved dot over the header's right end,
  sized to mood-ui's medium header.
- `FileInput`'s drop area always has its own Browse button; its one-line variant does not fit its hint and Browse in
  its frame, so the logo uploader uses the drop area in both states.
- `SurfaceCardBody` keeps its content's height, so a row of cards cannot put their buttons at the same height on their
  own: the billing layer's `PlanCard` lays the body out as the card's growing column (`flex flex-1 flex-col`).
- `SurfaceCard` has no chosen state: a choice card is a `SurfaceCard` with a `Radio`. Its `as="button"` card is a
  `<button>`, which cannot hold the radio, so the choice card is an `interactive` card that takes the pointer and the radio
  is the control.
- `PageHeader` keeps its actions beside the title at every width: core's `PageHeader` moves them to its `hero` slot
  below `sm`.
- `PageHeader` decides whether it has a subtitle when it mounts, so a subtitle slot that appears later is not shown.
- `Tabs` always renders its panels after the bar, so it cannot sit inside a header as a bar alone.
- A `MorphSelect` takes the value `""` for nothing chosen and shows its placeholder, so an option whose value is `""`
  never shows as chosen: core's `KitSelect` gives that option with `noneLabel` instead.
- A `Dialog` closes on a pointer down outside its panel, and a `MorphSelect`'s list and a `DateField`'s calendar are
  teleported out of it: a dialog that holds one is `KitDialog` with `:dismissable="false"`, closed by its button and its
  actions only.
- `SearchInput`'s clear button has no tooltip and takes none from outside. After a row is chosen it keeps the focus and
  opens its list again when the field empties: the search palette blurs the field when a row is chosen. Its results are
  drawn outside its own box, so the palette in the phone's dialog is `KitDialog` with `:dismissable="false"` too.
- `AvatarUpload` calls one `save` listener twice for a photo (it is both its `onSave` prop and its `save` event): My
  profile sends the photo once and answers both calls the same. Its picture's `alt` is fixed Spanish in any locale.
- mood-ui has no text link: a link is its text `PressButton` as an anchor, with a control's height and padding.
- `paletteFromHex` places the chosen color at shade 700, and mood-ui's light primary is shade 600, so a brand color shows
  lighter on buttons than its swatch (teal `#14b8a6` paints buttons `#18ddc7`), and some colors darker (violet `#8b5cf6`
  paints them `#500de8`). The kit uses the palette as mood-ui derives it.
- `PageHeader` has no prop for the title's heading tag: at its default size the title is always an `h2`, and `as` only
  sets the root `header` tag.
- `PageHeader`'s title is bold, heavier than every other heading, with no prop for its weight.
- A vertical `Stepper` has no space between its steps: the setup wizard lists its steps in the kit's own list.
- `Stepper` names its list with a fixed English aria label ("Stepper"), as signup's screens read it.
- In dark mode, dividers and an unchecked checkbox's border are under 3:1 against the surface.
- `ColorPicker`'s chip has no outline: `#000000` disappears on a dark field.

## Tests

Layer tests are Vitest files in `layers/<name>/tests/`, with coverage enforced per file over the `.ts` files
of each layer's `app/` (and of `shared/`); `.vue` files and type-only files are not measured. Visual tests are
Playwright specs in `frontend/tests/e2e/`, compared against screenshots in light and dark mode. See
[Testing and quality gates](guides/testing.md).
