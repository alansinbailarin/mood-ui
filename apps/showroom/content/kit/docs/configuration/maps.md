# Maps and geocoding

The location picker (a branch's address, or one of your modules) does two things with a map: it draws one, in the
browser ([The map](#the-map)), and it turns an address into a point and a point into an address, through the API
(geocoding, the rest of this page), which the [Geocoding](../packages/geocoding.md) package does.

The browser never calls a geocoding provider. It asks `POST /api/v1/geocoding/search` and `/reverse`, and the backend
calls the provider with the keys it keeps, caches the answers and keeps the pace the provider asks for.

## The map

Core draws the map with [MapLibre GL JS](https://maplibre.org/), only in the browser and only on a page that shows one.
What it draws comes from the frontend's runtime config, never from code:

| Env | Default | Does |
| --- | ------- | ---- |
| `NUXT_PUBLIC_MAP_STYLE_URL` | empty | a vector style's address; when set, the map draws it and ignores the tiles below |
| `NUXT_PUBLIC_MAP_TILES_URL` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | raster tiles, drawn when there is no style |
| `NUXT_PUBLIC_MAP_ATTRIBUTION` | `© OpenStreetMap contributors` | the credit the map shows in its corner with the raster tiles |
| `NUXT_SECURITY_MAP_ORIGINS` | empty | more origins a style loads from (its glyphs, sprites or tiles on other hosts), comma-separated, for the Content Security Policy |

Leave a variable unset rather than empty: an empty value replaces the default (`.env.example` lists them commented).

**The default: OpenStreetMap's tiles, no key.** Good to start with and for light use: a few people placing their
addresses. OpenStreetMap's servers have a [tile usage policy](https://operations.osmfoundation.org/policies/tiles/): the
attribution must stay on the map (the kit shows it), and heavy traffic is not allowed. For a product with real traffic,
move to a provider.

**A vector style.** MapTiler, Stadia Maps, OpenFreeMap or Mapbox give a style's address; a provider that needs a key puts
its **public** key in that address. That key reaches every browser, so restrict it to your domains in the provider's
panel. For example:

```dotenv
NUXT_PUBLIC_MAP_STYLE_URL=https://api.maptiler.com/maps/streets-v2/style.json?key=your-public-key
NUXT_SECURITY_MAP_ORIGINS=
```

A style often loads its glyphs, sprites or tiles from other hosts: open the map with the browser's console and add each
origin it reports as blocked to `NUXT_SECURITY_MAP_ORIGINS` (`https://fonts.example.com,https://sprites.example.com`).

**What the kit puts in the Content Security Policy** (`contentSecurityPolicy()` through `mapOriginsOf()`): the origins of
the style, of the tiles and of `NUXT_SECURITY_MAP_ORIGINS`, in `connect-src` and `img-src`, and only origins (a key in the
style's address never shows in the header). Not on the admin's host, which has no map. MapLibre's worker is its CSP
build, served by the frontend itself, so the policy needs no `blob:`. See
[Production](production.md#security-headers).

### Another map library

The map is drawn through an adapter (core's `MapAdapter`): `createMapLibreAdapter` by default. A layer of yours can hand
another library's (Google Maps JS, Leaflet) from a plugin, through the `kit:map:adapter` hook:

```ts
// layers/my-maps/app/plugins/my-map.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:map:adapter", (choice) => {
    choice.factory = async (element, { center, interactive }) => {
      const map = await drawMyMap(element, center, interactive); // your library
      return {
        setPin: (point) => map.pin(point),
        flyTo: (point) => map.goTo(point),
        onPinMoved: (callback) => map.whenPinMoves(callback),
        destroy: () => map.remove(),
      };
    };
  });
});
```

`setPin` moves the pin (or takes it away with null) without calling the callback, which is for what the person does (a
drag, a click). The library's script, tiles and API origins are yours to add to `contentSecurityPolicy()` in
`layers/core/app/utils/security-headers.ts`.

### Use the picker in a module

Core's `LocationPicker` is the whole thing: the address fields, the map, the switch that fills the address from the pin,
"Use my location", "Remove the pin" and a status line. A module's form keeps the address and the point and hands it the
countries its API accepts:

```vue
<script setup lang="ts">
import type { AddressValue, MapPoint } from "#layers/core/app/types/map";

const address = ref<AddressValue>({ addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "MX" });
const point = ref<MapPoint | null>(null);
</script>

<template>
  <LocationPicker v-model:address="address" v-model:point="point" :countries="['MX', 'US']" id-prefix="client" :errors="errors" />
</template>
```

Typing the address moves the pin after a 900 ms pause (never on every key: no autocomplete, which public Nominatim
forbids); moving the pin fills the address after 400 ms unless the person turns the switch off to correct it by hand. The
point comes rounded to 6 decimals (about 0.1 m): store `latitude` and `longitude` as `decimal(9,6)`, both or neither, as
Branches does. The picker never toasts a failure of the search; it says it in its status line.

### The map in tests

Vitest never draws a map: hand the picker a fake adapter through `kit:map:adapter`, and mock MapLibre's CSP build with
`vi.mock` to test an adapter (`layers/core/tests/locationPicker.test.ts` and `maplibreAdapter.test.ts`). In Playwright the
tiles come from the stub API (`NUXT_PUBLIC_MAP_TILES_URL` in `playwright.config.ts`), never from the internet, and a
capture covers the map (`capture(name, { mask: [map] })`): WebGL drawn by a software renderer is not the same to the
pixel on every machine.

## Locally: nothing to set

`GEOCODING_DRIVER=nominatim` (the default) uses OpenStreetMap's public Nominatim server, which needs no key. A few
searches while you build are well within its usage policy. Tests never reach it: they fake the client.

## Nominatim

The public server (`https://nominatim.openstreetmap.org`) is free and has a
[usage policy](https://operations.osmfoundation.org/policies/nominatim/) the driver follows for you:

- every request names the application: the User-Agent is the platform's name and `APP_URL`;
- at most one request per second for the whole application, which the driver keeps across every process, counted in the
  cache (a search over it waits up to a second and a half for a free second, then answers 429 `geocoding.busy` with
  `Retry-After`, and the picker says the search is busy and waits that long before it asks again);
- answers are cached (30 days, see [Cache](#cache));
- no search on every key press: the picker waits for a pause in typing.

Set `GEOCODING_NOMINATIM_EMAIL` to an address the server's operators may write to if your app misbehaves.

The public server suits development and small installs only: a few people setting up their addresses. Its pace is one
request per second for the whole app, shared by every workspace, so one workspace searching fast makes the others wait (and
answers `geocoding.busy` once they have waited a second and a half). In production use a paid provider ([Google](#google),
[Mapbox](#mapbox)) or run your own Nominatim, or one a hosting company runs for you, and point the app at it:

```dotenv
GEOCODING_NOMINATIM_URL=https://nominatim.example.com
GEOCODING_NOMINATIM_REQUESTS_PER_SECOND=20
```

## Google

1. In Google Cloud, create a project with billing, and enable the **Geocoding API** alone.
2. Create an API key and restrict it: to the Geocoding API, and to the IP addresses of your servers (the calls come from
   the backend, never a browser).
3. Set:

```dotenv
GEOCODING_DRIVER=google
GEOCODING_GOOGLE_KEY=your-key
```

Read Google Maps Platform's terms on storing results before you leave the 30-day cache on: set `GEOCODING_CACHE_DAYS=0`
if they do not allow it for your use.

## Mapbox

1. In your Mapbox account, create a **secret** token (`sk.`) for the server. Never use the public token (`pk.`) a Mapbox
   map style carries in the browser: that one is public on purpose, this one is not.
2. Set:

```dotenv
GEOCODING_DRIVER=mapbox
GEOCODING_MAPBOX_TOKEN=your-secret-token
GEOCODING_CACHE_DAYS=0
```

Mapbox's temporary geocoding results may not be stored, hence `GEOCODING_CACHE_DAYS=0`; leave the cache on only if your
account has permanent storage.

## No provider

`GEOCODING_DRIVER=none` finds nothing, ever. The picker still works: people type the address and place the pin by hand.
It is not `null`: a driver name nobody registers (the old `null` included) fails `php artisan geocoding:verify` on deploy and
stops every search, rather than send addresses to a provider nobody chose.

## Privacy

- What reaches the provider is what was typed (or the point), the country to favour and the language: never who asks,
  their workspace, an id or an email.
- The two routes are `POST` with a JSON body, so an address or a point never sits in a URL or an access log. Support's
  `SentryOnlyFields` blanks `query`, `latitude` and `longitude` in what goes to Sentry (only there: an audit entry of a
  module may keep a `latitude` of its own).
- The backend calls the provider through a client of its own with no events, so Sentry keeps no breadcrumb or span of the
  call (whose URL holds the address and, for Google and Mapbox, the key), and a failure of the provider is
  `geocoding.unavailable`, never an exception with the URL in it.
- The provider's address comes from the configuration, never from a request.

## Cache

An answer is kept 30 days (`GEOCODING_CACHE_DAYS`; 0 keeps nothing) in the app's cache store, and "nothing found" for 24
hours. A search is kept by its text however it was spaced or cased, a point to five decimals (about a metre). The key is
the SHA-256 of the workspace, the driver, the language and what was asked, so no address is stored as text in the key,
changing the driver never answers with another provider's places, and no workspace can learn from the cache (how fast an
answer comes back) what another one searched. The trade-off: the same address searched in two workspaces costs two requests
to the provider, which counts against its pace and, with a paid provider, its bill.

## Limits

The two routes share the named limiter `geocoding`: 30 searches per member per minute and 300 per workspace per hour, set
in `backend/packages/Geocoding/config/geocoding.php` (`searches_per_minute`, `searches_per_workspace_per_hour`). Over it,
429 `http.too_many_requests`.
