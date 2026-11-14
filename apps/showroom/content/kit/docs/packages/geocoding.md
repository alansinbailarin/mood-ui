# Geocoding

Places from an address and an address from a point, through the provider the app configures: the backend side of the
location picker (Branches' address, or any address a module of yours keeps). The browser never talks to a geocoding
provider: it asks the API, which keeps the keys, the cache and the pace the provider asks for.

Geocoding depends on Support alone, and only Support's contracts reach it. It is a kernel package and not a part of
Branches because the picker lives in the frontend's `core` and any module uses it: removing Branches leaves the picker
working.

## Contracts

| Contract | What it is |
| -------- | ---------- |
| `MoodKit\Geocoding\Contracts\Geocoder` | what the app asks: `search($query, ?$country)` (a list of `Place`, best first) and `reverse($latitude, $longitude)` (a `Place` or null), in the request's language, through the configured driver and its cache; a text with nothing to search once its spaces are folded answers `[]` without asking the provider. Throws 503 `geocoding.unavailable` and 429 `geocoding.busy` |
| `MoodKit\Geocoding\Contracts\GeocodingDriver` | a provider: `name()`, `search($query, $country, $locale, $limit)` and `reverse($latitude, $longitude, $locale)`, called without a cache |
| `MoodKit\Geocoding\Contracts\Place` | a place found: `label` (how the provider names it), `latitude`, `longitude`, and its address split as a form is: `line1` (street and number), `line2` (neighbourhood), `city`, `state`, `postalCode` and `country` (ISO 3166-1 alpha-2, uppercase, or null). A part the provider does not know is empty. `toArray()` is what the API answers |

## Drivers

`GEOCODING_DRIVER` names the driver that answers, read as written: env() would turn `null`, `empty` or `(null)` into no
value at all, so the config reads the variable raw, and only a variable that is not set (or empty) takes the default,
`nominatim`. A name no package registers never falls back to another provider: `php artisan geocoding:verify`, in the deploy
script, fails on it, and the first search stops with `Unknown geocoding driver [...]: Use none, nominatim, ...`, naming the
ones there are (for `null`, the name the no-op driver had, it says that driver is now `none`). The command also warns, without
failing, when production searches the public Nominatim server.

### `nominatim` (the default)

OpenStreetMap's [Nominatim](https://nominatim.org), with no key: the public server (`https://nominatim.openstreetmap.org`)
unless `GEOCODING_NOMINATIM_URL` names your own. A search is `GET /search` and a point `GET /reverse` (zoom 18), each with
what was typed (`q`) or the point (`lat`, `lon`), the country to favour (`countrycodes`, lowercase) and the number of places
(`limit`) on a search, the request's language (`accept-language`), `format=jsonv2` and `addressdetails=1`, and the email of
`GEOCODING_NOMINATIM_EMAIL` when it is set. Every request says who the app is, as the usage policy asks: the User-Agent is
the platform's name and `APP_URL` (`Acme geocoding (https://app.acme.com)`).

The public server allows one request per second for a whole application. The driver keeps that pace for the app, counted in
the cache across every process (`nominatim_requests_per_second`, 1 by default; raise it only on a server of your own). A
search over the pace waits for a free second, a quarter of a second at a time, up to a second and a half; only if none comes
is it 429 `geocoding.busy`, with the seconds to wait in `meta.retryAfter` and the `Retry-After` header, and the picker says
it is busy and asks nothing more until then. One workspace searching fast slows the others a little rather than shutting
them out, but the pace is the whole app's: the public server suits development and small installs, and production wants a
paid provider or a Nominatim of its own. Answers are cached (see the
Geocoder) and the picker waits for a pause in typing, which the policy asks for too.

A result becomes a `Place` this way: `line1` is the road (or pedestrian way, or footway) followed by the house number, the
order of Mexico and most of Europe and Latin America (in the United States the number goes first: whoever edits the address
fixes it); `line2` the neighbourhood (or suburb, or quarter); `city` the city, town, village, municipality or hamlet;
`state` the state or region; `postalCode` the postcode; `country` the country code in uppercase. A result without a point is
left out, and a point where Nominatim knows nothing answers null.

### `google`

Google's [Geocoding API](https://developers.google.com/maps/documentation/geocoding), with the key of
`GEOCODING_GOOGLE_KEY`, sent from the server only (never to a browser). A search sends `address`, the country to favour as
`components=country:XX` and `language`; a point sends `latlng` (six decimals) and `language`. A status other than `OK` or
`ZERO_RESULTS` (a refused key, a spent quota) is `geocoding.unavailable`. In Google Cloud, enable the Geocoding API alone for
that key and restrict it to the server's IP addresses. A result's parts become the `Place`: `line1` the route and street
number, `line2` the sublocality (or neighborhood), `city` the locality (or postal town, or second administrative level),
`state` the first administrative level, `postalCode` and `country` (its short name). Without a key, the first search stops
with `GEOCODING_DRIVER=google needs GEOCODING_GOOGLE_KEY.`

### `mapbox`

Mapbox's [Geocoding API v6](https://docs.mapbox.com/api/search/geocoding/) (`/search/geocode/v6/forward` and `/reverse`),
with the token of `GEOCODING_MAPBOX_TOKEN`: a secret token made for the server, never the public token a Mapbox map style
carries in the browser. A search sends `q`, `country` (lowercase), `limit` and `language`; a point sends `latitude`,
`longitude`, `limit=1` and `language`. An error status (a refused token) is `geocoding.unavailable`. A feature becomes a
`Place` from its `full_address` and its context (`address` or `street`, `neighborhood` or `locality`, `place` or `district`,
`region`, `postcode`, `country`). Mapbox's temporary results may not be stored: set `GEOCODING_CACHE_DAYS=0` unless your
account allows permanent storage. Without a token, the first search stops with
`GEOCODING_DRIVER=mapbox needs GEOCODING_MAPBOX_TOKEN.`

### `none`

Finds nothing, ever: the picker works by hand (the address typed, the pin placed). For an app that wants no provider.

### Your own driver

Implement `GeocodingDriver` and tag the class `geocoding.drivers` from your package's provider:

```php
$this->app->tag([PeliasDriver::class], 'geocoding.drivers');
```

Then set `GEOCODING_DRIVER` to its `name()`. Two drivers with one name are refused. A driver sends the provider the text
or the point and the language, nothing about who asks, and turns every failure of the provider (no answer, an error
status, a body it cannot read) into `MoodKit\Geocoding\Errors\GeocodingUnavailable`: never let its HTTP client's
exception out, since its message holds the address and maybe a key.

## Privacy

What reaches the provider is what was typed (cleaned to one line) or the point, the country to favour and the language:
never an id, an email, a name or the workspace. Nothing else is sent with it: no cookie, no `Authorization` header.

The drivers call the provider through their own HTTP client, `MoodKit\Geocoding\Drivers\GeocodingHttp`: Laravel's,
made without an event dispatcher. A call sends no `RequestSending` or `ResponseReceived` event, so Sentry's HTTP
integration keeps no breadcrumb and no span of it (its URL holds the address and, for Google and Mapbox, the key), and the
app's own global HTTP middleware never sees it. It follows no redirect. Every failure of the provider (no answer in time,
an error status, a body that is not JSON) is `geocoding.unavailable`: the client's exception, whose message holds the URL,
never leaves the driver, and it is never reported.

A test fakes the client the same way it fakes Laravel's: `resolve(GeocodingHttp::class)->fake([...])`, with
`preventStrayRequests()`, so no test reaches a real provider.

## Routes

Both in the `workspace` group, for any signed-in member (whoever edits an address; what they save is checked by the route
that saves it), with the `geocoding` limiter. They are `POST` with a JSON body, so what was typed and where someone is never
sit in a URL or an access log. They change nothing and are not audited; a super admin acting as someone may use them.

| Route | Body | Answer |
| ----- | ---- | ------ |
| `POST /geocoding/search` | `query` (3 to 200 characters, one line of visible text: Support's `PlainName`, so a NUL, a control or reordering character, or bytes that are not UTF-8 are 422 `validation.plain_name` and never reach the provider), `country` (ISO alpha-2, optional: the country to favour) | `data`: up to 5 places, best first, `[]` when nothing matches |
| `POST /geocoding/reverse` | `latitude` (-90 to 90), `longitude` (-180 to 180) | `data`: the place at that point, or null |

A place is `{label, latitude, longitude, line1, line2, city, state, postalCode, country}`; `country` is the ISO code in
uppercase, or null. The answer is in the request's language.

## Cache

`CachedGeocoder`, the `Geocoder` the container binds, keeps a found answer `cache_days` (30) and "nothing found"
`empty_cache_hours` (24) in the app's cache store; `GEOCODING_CACHE_DAYS=0` keeps nothing, for a provider whose terms forbid
it. A search is kept by its text however it was spaced or cased, and a point to five decimals (about a metre). The key is
`geocoding:` and the SHA-256 of the workspace's id, the driver's name, the language and what was asked: no address is stored
as text in a key, a change of driver never answers with another provider's places, and each workspace has its own answers.
A cache shared by every workspace would let one tell another's searches from how fast an answer comes back (and from the
provider's pace it did not spend); the price is that one address searched in two workspaces is asked of the provider twice.
Answers are kept as plain arrays.

## Limits

- `geocoding` (named limiter): 30 searches per member per minute (`searches_per_minute`) and 300 per workspace per hour
  (`searches_per_workspace_per_hour`). Over it, 429 `http.too_many_requests`.
- The provider's own pace, for the whole app: Nominatim's `nominatim_requests_per_second` (1). Over it, 429
  `geocoding.busy`.

## For a package

A package that needs a point on the server (an import of addresses) asks the `Geocoder`, as the workspace or not:

```php
use MoodKit\Geocoding\Contracts\Geocoder;

$place = $geocoder->search('Av. Revolución 1234, Tijuana', 'MX')[0] ?? null;
```

It goes through the same cache and pace as the picker. Catch `GeocodingUnavailable` and `GeocodingBusy` where a failure of
the provider must not stop your work, and keep a queued import under the provider's pace.

## Errors

| Code | Status | When |
| ---- | ------ | ---- |
| `geocoding.unavailable` | 503 | the provider did not answer, or answered an error. Never reported to Sentry: it is the provider's, and the screen says to type the address or place the pin |
| `geocoding.busy` | 429 | the provider's pace for the whole app stayed spent for the second and a half the search waited; `meta.retryAfter` and the `Retry-After` header say in how many seconds to try again |

## Configuration

`backend/packages/Geocoding/config/geocoding.php` holds the defaults; `backend/config/geocoding.php` overrides the driver,
the provider's address and keys and the cache from the environment.

| Key | Env | Default | |
| --- | --- | ------- | - |
| `geocoding.driver` | `GEOCODING_DRIVER` | `nominatim` | the driver that answers |
| `geocoding.results` | | 5 | places a search answers at most |
| `geocoding.timeout_seconds` | | 5 | how long the app waits for the provider |
| `geocoding.cache_days` | `GEOCODING_CACHE_DAYS` | 30 | days a found place is kept; 0 keeps nothing |
| `geocoding.empty_cache_hours` | | 24 | hours "nothing found" is kept |
| `geocoding.searches_per_minute` | | 30 | searches one member may make in a minute (the `geocoding` limiter) |
| `geocoding.searches_per_workspace_per_hour` | | 300 | searches a workspace may make in an hour (`geocoding`) |
| `geocoding.nominatim_url` | `GEOCODING_NOMINATIM_URL` | `https://nominatim.openstreetmap.org` | the Nominatim server |
| `geocoding.nominatim_email` | `GEOCODING_NOMINATIM_EMAIL` | none | an email the server's operators may write to |
| `geocoding.nominatim_requests_per_second` | `GEOCODING_NOMINATIM_REQUESTS_PER_SECOND` | 1 | requests per second to Nominatim, for the whole app |
| `geocoding.google_key` | `GEOCODING_GOOGLE_KEY` | none | Google's Geocoding API key |
| `geocoding.mapbox_token` | `GEOCODING_MAPBOX_TOKEN` | none | Mapbox's secret access token |

Choosing a provider for production, its keys and its terms: [Maps and geocoding](../configuration/maps.md).
