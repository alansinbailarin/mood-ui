# Attach data to clients

A module often keeps something about each client of a workspace: their appointments, their visits, a loyalty card, the
notes of a treatment. This guide shows how to hang it from a client so that no workspace can point at another's, how to
read the client without touching Clients' tables, which branch rule applies, how to follow the client through the trash,
a merge and an erasure, and how to show it on the client's page: a field, an activity entry, a tab.

Clients' contracts and events are in `MoodKit\Clients\Contracts\` and `MoodKit\Clients\Events\`; a module reaches Clients
through them alone (see [Clients](../packages/clients.md#for-a-module)).

## 1. The table

Give the table `tenant_id`, a foreign key to `tenants` that cascades (as `clients` has), and `client_id`, with a
composite foreign key to `clients (tenant_id, id)`, and turn on row-level security. `clients` has a unique index on
`(tenant_id, id)` for this: Postgres checks that the client is one of the same workspace, even if your code forgets to.

Give the key to `clients` **no action**. A client is never deleted from its table: the trash keeps its row
(`deleted_at`), a merge sends one of the two to the trash, and an erasure keeps the row, anonymized, so your rows keep
pointing at it. Only the workspace's own deletion removes clients, and your `tenant_id` key takes your rows in the same
statement; a key with no action is checked at the statement's end, once they are gone. Without that cascade nothing
deletes your rows in time, and a key that holds a client or a branch refuses the workspace's deletion. A key with no
action also makes sure nothing ever deletes a client your rows hold.

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use MoodKit\Support\Database\TenantRls;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spa_visits', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->uuid('client_id');
            $table->uuid('branch_id');
            $table->text('treatment');
            $table->timestampTz('visited_at');
            $table->timestampsTz();
            $table->unique(['tenant_id', 'id']);
            $table->index(['tenant_id', 'client_id', 'visited_at']);
            $table->foreign(['tenant_id', 'client_id'], 'spa_visits_client_foreign')
                ->references(['tenant_id', 'id'])->on('clients');
            $table->foreign(['tenant_id', 'branch_id'], 'spa_visits_branch_foreign')
                ->references(['tenant_id', 'id'])->on('branches')->restrictOnDelete();
        });

        TenantRls::enable('spa_visits');
    }

    public function down(): void
    {
        Schema::dropIfExists('spa_visits');
    }
};
```

`TenantRls::enable()` turns on row-level security with `FORCE`, and `php artisan tenancy:verify-rls` fails the build on a
tenant table without it. Index `(tenant_id, client_id)` first: everything below reads by client.

Keep in your table only what is yours. The client's name, email and phone are Clients': read them when you show them
(section 2), never copy them, or an erasure would leave them in your table.

## 2. Reading the client

`MoodKit\Clients\Contracts\ReadsClients` answers a client as a module may know it, asked as the workspace, with its id
first and the client's id in any case:

| Method | Answers |
| ------ | ------- |
| `find($tenantId, $clientId)` | a `ClientSummary` (`id`, `name`, `email`, `phone`, `homeBranchId`, `deleted`, `erased`), or `null` when the workspace has no client of that id (or it is no id) |
| `visibleTo($tenantId, $userId, $clientId)` | whether that person may see the client by its home branch: it has none, or one they may see (Tenancy's `BranchAccess`); `false` when the workspace has no client of that id |

`find()` answers a client in the trash too (`deleted: true`), and an erased one (`deleted` and `erased`, its name a dash,
`—`, its email and phone `null`): your rows still point at it. Show such a client as gone, and never let someone book or
sell to one in the trash. A client merged into another is in the trash: its rows moved during the merge (section 4).

`visibleTo()` applies the branch rule alone. It does not check that the person is a member of the workspace nor that
they hold `clients.view`: your route checks its own permission. And it answers `true` for a client in the trash or
erased too: `find()`'s `deleted` and `erased` say so.

```php
final readonly class BookVisit
{
    public function __construct(private ReadsClients $clients) {}

    public function handle(string $tenantId, string $userId, string $clientId, array $visit): SpaVisit
    {
        $client = $this->clients->find($tenantId, $clientId);

        if (! $client instanceof ClientSummary || $client->deleted || ! $this->clients->visibleTo($tenantId, $userId, $client->id)) {
            throw new VisitClientNotFound;
        }

        // ...
    }
}
```

The example reads the client twice, in `find()` and again in `visibleTo()`: two lookups by key, so that the branch rule
stays Clients' to apply. Answer a client the person may not see as one that is not there, with the same error: whether
it exists is something only whoever sees it may learn. Never read the `clients` table, nor join it in a query: that is
Clients' to change.

## 3. Following the branch

A client's home branch says who may open the client: a person sees a client with no home branch, or one whose home branch
they may see, whatever branch the top bar is on ([Clients](../packages/clients.md#following-the-branch)). That rule is the
client's, not your rows'.

- **Your rows belong to a branch** (a visit at Centro, an appointment at Playas): give them a `branch_id` and follow
  [Scope data by branch](scope-data-by-branch.md): the list follows the top bar with `CurrentBranch::scope()->branchIds()`,
  one row opens with `BranchAccess::allows()` on its own branch. A client of Playas may have a visit at Centro: the
  client's home branch does not narrow its visits.
- **Your rows belong to the client alone** (a loyalty card, an allergy): they follow the client. Open them when
  `visibleTo()` says the person sees the client, and list them only inside the client's page.

Your audit entries and events about a row pass its own branch as `branchId`; one about the client alone passes the
client's home branch (`ClientSummary::homeBranchId`).

## 4. Reacting to the client's life

The events are sent after the commit, with ids in lower case, and each carries `tenantId`, `clientId` and `branchId` (the
client's home branch, or `null`):

| Event | When | What a module does |
| ----- | ---- | ------------------ |
| `ClientCreated` | a client was added, by hand, by an import or by a module | start what a new client gets (a welcome card) |
| `ClientDeleted` | a client went to the trash | cancel what is ahead (future appointments), or leave it for whoever restores the client |
| `ClientRestored` | a client came back from the trash | nothing, or undo what `ClientDeleted` did |
| `ClientsMerged` | two clients became one: `clientId` stays, `mergedId` went to the trash | a cache or a search index; your rows already moved |
| `ClientErased` | a client was erased for good, once for it and once for each client merged into it | delete files or copies kept elsewhere; your rows already went |

**Merging.** Your rows of the client that goes to the trash must move to the one that stays, in the merge's transaction,
so nothing is ever left half merged. Implement `ClientMergeParticipant` and tag it `clients.merge`:

```php
final class SpaVisitsMerge implements ClientMergeParticipant
{
    public function merge(string $tenantId, string $fromId, string $intoId): void
    {
        SpaVisit::query()->where('tenant_id', $tenantId)->where('client_id', $fromId)->update(['client_id' => $intoId]);
    }
}
```

```php
$this->app->tag([SpaVisitsMerge::class], 'clients.merge');
```

It runs with both clients' rows held, as the workspace; an exception undoes the whole merge. It may run twice for one
merge (the transaction is tried again after a deadlock), so it writes only to the database: a file, a queued job or a call
to another service goes in a listener of `ClientsMerged`. A row of yours that may hold only one per client (a loyalty card)
decides here which one stays.

**Data rights.** When the owner downloads what is kept about a client, or erases one, each module adds its part with a
`ClientDataContributor` tagged `clients.data`:

```php
final class SpaVisitsData implements ClientDataContributor
{
    public function key(): string
    {
        return 'spa';
    }

    public function export(string $tenantId, string $clientId): array
    {
        return ['visits' => SpaVisit::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)->orderBy('visited_at')
            ->get(['visited_at', 'treatment'])->map(fn (SpaVisit $visit): array => [
                'visitedAt' => $visit->visited_at->toIso8601ZuluString(), 'treatment' => $visit->treatment,
            ])->all()];
    }

    public function erase(string $tenantId, string $clientId): void
    {
        SpaVisit::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)->update(['treatment' => '']);
    }
}
```

`export()` answers plain values (no models), under its `key()` in the client's data. `erase()` runs inside the erasure's
transaction: delete what is only the person's, or keep the row and blank what says who they were (a sale's total stays for
the books; the treatment does not). A failure undoes the erasure, and it may run twice, so it writes only to the database.
Both are asked for every client merged into the one exported or erased as well: what is left of the same person in the
trash.

## 5. Fields on the client

A field a module keeps on every client (a spa's skin type, a gym's membership number) is not a table of yours: declare it
with a `ClientFieldProvider` tagged `clients.fields`, and Clients keeps it in the client's `custom`, checks it by its type
on every write, shows it in the client's "More details" card and gives it to `GET /clients/fields`:

```php
final class SpaClientFields implements ClientFieldProvider
{
    public function clientFields(): array
    {
        return [
            new ClientField('spa.skin', 'spa::clients.skin', ClientField::CHOICE, ['dry' => 'spa::clients.skin_dry', 'oily' => 'spa::clients.skin_oily'], order: 10),
            new ClientField('spa.since', 'spa::clients.since', ClientField::DATE, order: 20),
        ];
    }
}
```

```php
$this->app->tag([SpaClientFields::class], 'clients.fields');
```

The key is `<module>.<field>` in snake case, the label a translation key with a line in every language. The types, their
values and what a declaration may not do are in [Clients](../packages/clients.md#custom-fields). An erasure empties
`custom`, and a merge keeps the stayer's values and takes the rest from the other: nothing to do for either.

## 6. Activity

A client's page lists what happened to it, newest first: Clients' audit entries and what each module adds. Add yours with a
`ClientActivitySource` tagged `clients.activity`:

```php
final class SpaClientActivity implements ClientActivitySource
{
    public function __construct(private CurrentUser $user, private BranchAccess $branches) {}

    public function forClient(string $tenantId, string $clientId, int $limit): array
    {
        return SpaVisit::query()->where('tenant_id', $tenantId)->where('client_id', $clientId)->latest('visited_at')->limit($limit)->get()
            ->filter(fn (SpaVisit $visit): bool => $this->branches->allows($tenantId, $this->user->requireId(), $visit->branch_id))
            ->map(fn (SpaVisit $visit): ClientActivityItem => new ClientActivityItem(
                "spa.visit:{$visit->id}", 'spa.visit', __('spa::activity.visit'), $visit->visited_at->toImmutable(),
            ))->values()->all();
    }
}
```

It is asked as the workspace, only once the client opened for the person, and answers its latest `$limit` entries, newest
first, with labels already translated that say nothing of another person. Whatever it answers is shown: leave out the
entries of a branch the person does not see, as above. An exception fails the whole activity, so a source that reads
something that may be missing answers nothing for it. See [Clients](../packages/clients.md#activity).

## 7. A tab on the client's page

The `clients` layer's client page (`/dashboard/clients/[id]`) has the tabs "Profile" and "Activity", and asks the layers for
more through core's `kit:clients:tabs` hook. A module pushes its own from a plugin of its layer:

```ts
// layers/spa/app/plugins/clients-tabs.ts
import ClientVisitsTab from "../components/ClientVisitsTab.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:clients:tabs", (tabs) => {
    tabs.push({ id: "spa.visits", order: 50, labelKey: "spa.client.visits_tab", component: ClientVisitsTab });
  });
});
```

The tabs are drawn by `order`, then by id: Clients' own are 10 and 20, a module's go from 50. The component gets the
client's id as the `clientId` prop (a string) and loads its part through its layer's services, inside core's request
composables, like any other screen; the label key is translated with the module's own `en` and `es` lines. A tab shows
only what its own permission allows: check it in the component (`usePermissions()`) and show nothing without it.
