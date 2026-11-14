# Add a portal section

A workspace's clients sign in to the client portal, on the workspace's address, to see and change their details (see
[Clients: Client portal](../packages/clients.md#client-portal)). A module adds what it keeps for a client there: their
visits, their appointments, their purchases. This guide adds a "Your visits" section for a `spa` module that keeps its
visits in a `spa_visits` table hung from the client (see [Attach data to clients](attach-data-to-clients.md)).

A section has three parts: the backend says which sections a client sees, the module's own route of the portal serves the
section's data, and the module's layer draws it.

## Before you start

- Your package hangs its rows from a client by `(tenant_id, client_id)` and reads Clients only through its `Contracts\`.
- Your package loads its translations under its own namespace (here `spa`), with a line in every language (`en`, `es`).
- The portal is open in the workspace (the plan's feature `clients_portal` and Settings → Client portal): until it is,
  nobody signs in and no section is asked for.

## 1. Declare it

Implement `MoodKit\Clients\Contracts\PortalSectionProvider`. It is asked for one client, as that workspace, on every read
of the client's account (`GET /portal/me`), and answers the sections that client sees, as `PortalSection` value objects:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Spa;

use MoodKit\Clients\Contracts\PortalSection;
use MoodKit\Clients\Contracts\PortalSectionProvider;
use MoodKit\Plans\Contracts\ChecksFeatures;
use MoodKit\Spa\Models\SpaVisit;

final readonly class SpaPortalSections implements PortalSectionProvider
{
    public function __construct(private ChecksFeatures $features) {}

    public function portalSections(string $tenantId, string $clientId): array
    {
        if (! $this->features->allows($tenantId, 'spa_visits')) {
            return [];
        }

        $visited = SpaVisit::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)->exists();

        return $visited ? [new PortalSection('spa.visits', 'spa::portal.visits', order: 20)] : [];
    }
}
```

Tag it in your service provider's `register()`:

```php
$this->app->tag([SpaPortalSections::class], 'clients.portal_sections');
```

- **The key** is `<module>.<section>` in snake case (`spa.visits`), and names one section of one package: a key in
  another shape, or one declared more than once, is refused with an `InvalidArgumentException` (the account fails to load
  until it is fixed). The frontend draws a section by this key.
- **The label** is a translation key, translated in the request's language (the one the portal is shown in). Give it a
  line in every language. The portal's page shows it as the section's title.
- **The order** places it among the others, smallest first, then by key.
- **Decide per client.** Answer the section only when the client has something in it, or when your plan includes it
  (`Plans\Contracts\ChecksFeatures::allows()`). A section the API does not list is not drawn.
- **Keep it cheap.** It runs on every read of the account, for every installed module: an `exists()` by
  `(tenant_id, client_id)`, never the section's data. An exception fails the whole account, so answer nothing for what may
  be missing.

## 2. Serve its data

The section's data comes from a route of your package in the `portal` middleware group. Load the file from your service
provider's `boot()`, as Clients does:

```php
Route::middleware('api')->prefix('api/v1')->group(__DIR__.'/../routes/portal.php');
```

```php
<?php

// routes/portal.php of the spa package.

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use MoodKit\Spa\Http\Controllers\PortalVisitsController;

// A signed-in client's visits: the `portal` group (Clients) authenticates the client and limits every request per client.
Route::middleware('portal')->group(function (): void {
    Route::get('portal/spa/visits', [PortalVisitsController::class, 'index'])->name('spa.portal.visits');
});
```

The group already does what a portal route needs, in this order whatever order a route lists them in: the workspace
(`tenant`), no cache nor referrer (`KeepOutOfCachesAndReferrers`), the client's session (`AuthenticatePortalClient`, 401
without one), the portal still open (`EnsurePortalOpen`, 403 `clients.portal_closed` once it closes) and the `portal`
limiter, per client. Take the group alone: never `workspace` (a client is no member), never `auth:*`, and never
`throttle:portal` again, which the group has. A route that writes and needs a tighter cap than the group's takes a named
limiter of its own as well (AGENTS.md: never `throttle:n,m`), keyed by the client.

Read the client from `MoodKit\Clients\Contracts\CurrentPortalClient`, and the workspace from Tenancy's `CurrentTenant`:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Spa\Http\Controllers;

use Illuminate\Http\JsonResponse;
use MoodKit\Clients\Contracts\CurrentPortalClient;
use MoodKit\Spa\Models\SpaVisit;
use MoodKit\Support\Http\ApiResponse;
use MoodKit\Tenancy\Contracts\CurrentTenant;

final readonly class PortalVisitsController
{
    public function __construct(private CurrentPortalClient $client, private CurrentTenant $tenant) {}

    public function index(): JsonResponse
    {
        $visits = SpaVisit::query()
            ->where('tenant_id', $this->tenant->requireId())
            ->where('client_id', $this->client->requireId())
            ->latest('visited_at')->limit(50)->get()
            ->map(static fn (SpaVisit $visit): array => ['id' => $visit->id, 'visitedAt' => $visit->visited_at->toIso8601ZuluString(), 'treatment' => $visit->treatment]);

        return ApiResponse::data($visits->all());
    }
}
```

- **The client is the session's.** `CurrentPortalClient::requireId()` is the signed-in client (401 when there is none);
  `id()` is null anywhere else, a member's request included. **Never take a client's id from the browser** (the URL, the
  query string or the body): a client who sends another's id must still get only their own rows. A row of yours that the
  URL names (`portal/spa/visits/{visit}`) is looked up with `where('client_id', $this->client->requireId())`, and one that
  is not theirs is the same 404 as one that does not exist.
- **Nobody else is signed in.** In a portal request Auth's `CurrentUser` and `auth()->id()` are null, and an audit entry
  has no actor: nothing of yours may require a member there.
- **Show the client only what is theirs to see.** Never a member's notes about them, another client's name, or what the
  business keeps for itself. There is no branch bar in the portal: a row of a branch is shown with its own branch.
- **Writes** (a client cancels an appointment) check the row is the client's inside the transaction, are audited with no
  actor, and send their own errors (`spa.*`) like any route.

## 3. Draw it

The clients layer's `/portal/account` page asks the layers for their sections through core's `kit:portal:sections` hook,
then draws only the ones `GET /portal/me` listed for this client, in the API's order, each under its label as a heading. A
module pushes its component from a plugin of its layer, with the section's key as `id`:

```ts
// layers/spa/app/plugins/portal-sections.ts
import SpaVisitsSection from "../components/SpaVisitsSection.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:portal:sections", (sections) => {
    sections.push({ id: "spa.visits", order: 20, component: SpaVisitsSection });
  });
});
```

The component gets no props: the page has already given it its title, and the client is the session's. It loads its data
through its layer's services, which call the API with `session: "portal"`: core then sends the client's portal token,
never a member's (a browser may hold both on one workspace's address), and a 401 goes to `kit:portal:unauthenticated`
(the clients layer sends the client back to sign in), not to the team's sign-in.

```ts
// layers/spa/app/services/portal-visits.ts
import type { SpaPortalVisit } from "../types/spa";

export function listPortalVisits() {
  return useApi().request<SpaPortalVisit[]>("/portal/spa/visits", { session: "portal" });
}
```

```vue
<!-- layers/spa/app/components/SpaVisitsSection.vue -->
<script setup lang="ts">
import { EmptyState, Typography } from "mood-ui";
import { listPortalVisits } from "../services/portal-visits";

/** A signed-in client's visits, newest first, in the portal. */
const { t, locale } = useI18n();
const visits = useAsyncState(async () => (await listPortalVisits()).data);
const when = (at: string) => new Intl.DateTimeFormat(locale.value, { dateStyle: "medium" }).format(new Date(at));
</script>

<template>
  <AsyncBoundary :status="visits.status.value" :error="visits.error.value" :loaded="visits.hasLoaded.value" @retry="visits.execute()">
    <EmptyState v-if="(visits.data.value ?? []).length === 0" :title="t('spa.portal.no_visits')" />
    <ul v-else class="flex flex-col gap-2">
      <li v-for="visit in visits.data.value" :key="visit.id">
        <Typography as="p">{{ when(visit.visitedAt) }} · {{ visit.treatment }}</Typography>
      </li>
    </ul>
  </AsyncBoundary>
</template>
```

The portal follows the frontend rules of the rest of the kit: mood-ui as it comes, a tooltip on every `KitButton`, `en`
and `es` keys in snake case, no `v-html`, and it must look right in dark mode and at phone width (the portal's layout does
not force light).

## 4. Test it

Clients' `tests/Support/portal-world.php` builds the world: `portalWorld($this)` (alpha with the portal open, on a plan
with `clients_portal`, and Ana, a client of alpha), `portalSignIn($this, $client)` (a portal session's token, Ana's by
default) and `portalAs($this, $token)` (a request to alpha's portal with that token, `$this->olgaToken` being a member's).
A section that checks a feature of your own needs it in the test's plan: build the world with `clientsWorld()` and the
features, then open the portal with `portalOpen()`, as below.

```php
use MoodKit\Tenancy\Testing\ActsAsTenant;

uses(ActsAsTenant::class);

require_once __DIR__.'/../../../Clients/tests/Support/portal-world.php';

beforeEach(function (): void {
    // Alpha on a plan with the portal and the spa's visits, its portal open, and Ana and Bea its clients.
    clientsWorld($this, null, ['clients_portal', 'spa_visits']);
    portalOpen($this, $this->alpha);
    $this->ana = aClient($this, $this->alpha, 'Ana López', ['email' => 'ana@example.com']);
    $this->bea = aClient($this, $this->alpha, 'Bea Ruiz', ['email' => 'bea@example.com']);
    spaVisitFor($this->ana); // your own helper: a visit written as the workspace
    $this->stopActingAsTenant();
});

it('shows a client their visits, and no section to a client with none', function (): void {
    portalAs($this, portalSignIn($this))->getJson('/api/v1/portal/me')->assertOk()
        ->assertJsonPath('data.sections.0.key', 'spa.visits');
    portalAs($this, portalSignIn($this, $this->bea))->getJson('/api/v1/portal/me')->assertOk()
        ->assertJsonPath('data.sections', []);
});

it('answers a client only their own visits, and nobody without a portal session', function (): void {
    portalAs($this, portalSignIn($this, $this->bea))->getJson('/api/v1/portal/spa/visits')->assertOk()->assertJsonCount(0, 'data');
    portalAs($this, portalSignIn($this))->getJson('/api/v1/portal/spa/visits')->assertOk()->assertJsonCount(1, 'data');
    portalAs($this, $this->olgaToken)->getJson('/api/v1/portal/spa/visits')->assertUnauthorized();
});
```

Test as well a key the browser could send (`?client=` or a visit of another client's in the URL), and, for a write, a
closed portal (`portalOpen($this, $this->alpha, false)`: 403 `clients.portal_closed`). In the layer, test that your plugin
pushes its entry: `collectPortalSections()` (core's `usePortalSections.ts`) returns it, and the component calls its
service with `session: "portal"`.
