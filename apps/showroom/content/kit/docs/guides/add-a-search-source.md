# Add a search source

This guide makes the records of a module of your own show up in the dashboard's global search (the palette, `Cmd+K`): a
group of its own, with the records the person may open. The example is the tickets of a `Tickets` package. How the
search works is in [Search](../packages/search.md).

> Part of the checklist every new module follows: [Build a module](build-a-module.md).

## Before you start

- You have a backend package, here `backend/packages/Tickets` with the namespace `MoodKit\Tickets\` and a
  `TicketsServiceProvider` that loads its translations under `tickets`. To create one, follow "Packages" in
  `AGENTS.md`.
- Its records already have a list: an action, here `ListTickets`, that the route of the list calls, with its permission
  (`tickets.view`) on the route. The search reuses that action; if your module has no list yet, write it first.
- Its composer.json requires `"mood-kit/search": "@dev"`. Your package reaches Search only through
  `MoodKit\Search\Contracts\*`, as Team, Branches and Clients do.

## 1. The finder

A finder is a class that implements `MoodKit\Search\Contracts\FindsRecords`. It runs **its list's own query**: the list
already knows who may see what (its visibility, the branch, the trash), and a second query written for the search could
show what the list hides. Give the list's action an optional page size, so the finder asks for a few rows instead of a
page, as `ListTeamMembers` and `ListBranches` do:

If the list reads the branch bar (or anything else) from the current request instead of from `$userId`, ask
`RequestingPerson::mustBe($tenantId, $userId)` first in `find()`: a finder called for no one, or for someone else, then
throws instead of answering from the whole workspace.

```php
public function handle(string $tenantId, string $actorId, TicketQuery $query, PageRequest $page, ?int $perPage = null): LengthAwarePaginator
{
    // ... the list's query, as it was ...

    return Paginate::of($page, $tickets, $perPage ?? (int) $this->config->get('tickets.per_page'));
}
```

Then the finder, in `backend/packages/Tickets/src/Search/TicketsFinder.php`:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Tickets\Search;

use MoodKit\Tickets\Actions\ListTickets;
use MoodKit\Tickets\Dto\TicketQuery;
use MoodKit\Tickets\Models\Ticket;
use MoodKit\Search\Contracts\FindsRecords;
use MoodKit\Search\Contracts\SearchHit;

/**
 * The tickets the global search finds: the tickets list's own query (the branch of the top bar, never the trash), by
 * name or code. It runs inside the requesting person's request: the list reads the branch of the top bar from the current
 * workspace and person (CurrentBranch), the rows under the workspace's row-level security.
 */
final readonly class TicketsFinder implements FindsRecords
{
    public function __construct(private ListTickets $tickets) {}

    public function find(string $tenantId, string $userId, string $term, int $limit): array
    {
        $page = $this->tickets->handle($tenantId, $userId, new TicketQuery(search: $term), null, max(1, $limit));

        return array_map(
            static fn (Ticket $ticket): SearchHit => new SearchHit($ticket->id, $ticket->name, $ticket->code, "/dashboard/tickets/{$ticket->id}"),
            array_values($page->items()),
        );
    }
}
```

- `$term` is trimmed, 2 to 100 characters of one line. A `%`, `_` or `\` in it is a letter: the list's search must escape
  them (`addcslashes($term, '%_\\')`), as the kernel's lists do.
- Ask for `max(1, $limit)` rows: a page size of 0 would mean "the default" to some paginators. Search cuts an answer longer
  than `$limit` anyway.
- Write in the docblock that the finder runs inside the person's request: a list that reads the top bar
  (`CurrentBranch`) or the signed-in person reads them from the request, not from `$userId`. Search only calls a finder
  from the route, so this holds; a job or a command that called it would not.
- A `SearchHit` is `id`, `title`, `subtitle` (null: none) and `route`. Nothing else of the record travels, so choose the
  subtitle as the list would show it to this person. A title must not be blank: fall back to something that never is
  (Branches titles a blank name by its slug).
- Never write the term to a log, an audit entry or an exception of your own, and do not catch failures: Search reports a
  finder that fails as `SourceFailed`, without its message (which, for a database error, holds what was searched), and the
  other sources still answer.

## 2. The source

Declare it with a `SearchSourceProvider`, in `backend/packages/Tickets/src/TicketsSearchProvider.php`:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Tickets;

use MoodKit\Tickets\Search\TicketsFinder;
use MoodKit\Search\Contracts\SearchSource;
use MoodKit\Search\Contracts\SearchSourceProvider;

/** What Tickets brings to the global search: the tickets the person may list, for whoever sees them. */
final readonly class TicketsSearchProvider implements SearchSourceProvider
{
    public function searchSources(): array
    {
        return [new SearchSource('tickets.tickets', 'tickets::search.tickets', 'briefcase', TicketsFinder::class, permission: 'tickets.view', order: 40)];
    }
}
```

`SearchSource($key, $labelKey, $icon, $finder, $permission, $order = 0, $feature = null)`:

- `key` is `<package>.<what>` in lowercase letters, digits and `_`, declared once among every source.
- `icon` is a name `menuIcon()` knows, as the menu's ([list](../packages/rbac.md#menu-sections)).
- `permission` is required: name the permission of the list's route. The list's action does not check it (the route
  does), so a source without it would show the records to everyone. Write `permission: null` only for a source every
  member of the workspace may ask, on purpose.
- `order` places the group among the others, smallest first: the kernel's are 10 (Team), 20 (Branches) and 30 (Clients).
- `feature` is the plan feature the workspace needs, when the list's route has a `feature.enabled:` guard; a slug as Plans
  names them (`tickets_premium`, no dots).

The registry refuses a malformed source on the first search (`InvalidRegistry`). `InstalledSourcesTest` checks that the
permission and the feature are declared by some package, and `SearchTranslationsTest` that the label has a line in every
language.

Tag the provider in `TicketsServiceProvider::register()`:

```php
// Its tickets in the global search, through Search's registry.
$this->app->tag([TicketsSearchProvider::class], 'search.sources');
```

And give the group its title, `backend/packages/Tickets/lang/en/search.php`:

```php
<?php

declare(strict_types=1);

return ['tickets' => 'Tickets'];
```

and `lang/es/search.php`, with `'Proyectos'`.

## 3. Following the branch

Nothing to do: the finder runs the list's query, so the search follows the branch exactly as the list does. A list that
keeps the top bar's branch makes a search that keeps it; a list that shows every branch the person may see makes a search
that shows them. Search never reads the branch itself. If your list does not follow the branch yet and it should, fix the
list ([Scope data by branch](scope-data-by-branch.md)); the search follows.

## 4. The page it opens

`route` is a page of the dashboard: a path that starts with `/dashboard/`, with no `\` and no `//`. A hit with any other
route fails its source (`UnsafeHitRoute`), since the palette navigates to whatever it gets. The page is your layer's, and
it checks its own permission (`definePageMeta({ permission: "tickets.view" })`) and asks the API for the record, which
refuses one the person may not open: a hit is a way in, never a permission.

## 5. Testing it

Search through the API, as the palette does, and read your source's group. Start from your package's own world (for one
on top of the team, Team's `team-world.php`):

```php
<?php

declare(strict_types=1);

use MoodKit\Tenancy\Contracts\BranchScope;
use MoodKit\Tenancy\Testing\ActsAsTenant;
use MoodKit\Tenancy\Testing\FakeBranches;

uses(ActsAsTenant::class);

require_once __DIR__.'/../Support/tickets-world.php';

beforeEach(function (): void {
    ticketsWorld($this);
    // What the global search found of the tickets for that person, in workspace alpha.
    $this->found = fn (string $token, string $term): array => collect(ticketsAs($this, $token)->postJson('/api/v1/search', ['q' => $term])->assertOk()->json('data.groups'))
        ->firstWhere('source', 'tickets.tickets')['hits'] ?? [];
});

it('finds the tickets by name or code, with the page that opens each', function (): void {
    expect(($this->found)($this->maxToken, 'roof'))->toBe([
        ['id' => $this->roof->id, 'title' => 'Roof repair', 'subtitle' => 'P-104', 'route' => "/dashboard/tickets/{$this->roof->id}"],
    ]);
});

it('is never asked for someone who may not see the tickets', function (): void {
    roleOf($this, $this->alpha, 'member')->revokePermissionTo('tickets.view');

    expect(($this->found)($this->maxToken, 'roof'))->toBe([]);
});

it('follows the branch, as the list does', function (): void {
    FakeBranches::bind(BranchScope::branch($this->playas->id), people: [$this->playas->id => [$this->max->id]]);

    expect(($this->found)($this->maxToken, 'roof'))->toBe([]);
});
```

Test what the list hides too: the trash, another workspace, a `%` or `_` typed as a letter, and the finder called with a
limit of 0 (it still asks for one row). `q` goes in the JSON body, never in the address: `POST /search?q=` is refused.
Search's own helpers (`search-world.php`, `withSearchSources()`) are in [Testing](testing.md#writing-tests).

## 6. An index (optional)

By default Postgres answers every search, and that is enough for records a plan caps at tens or hundreds. Keep an index
outside Postgres (Meilisearch, through Laravel Scout) only for records with no cap, when a workspace has tens of thousands
and the list's `LIKE` slows down. In the kernel only the clients have one; `MoodKit\Clients\Search\ClientIndex` is the model
to copy. The rule: **the index only proposes ids; Postgres decides what each person sees.**

1. Require `"laravel/scout"` in the package's composer.json and add `Laravel\Scout\Searchable` to the model, with the
   smallest document that finds the record and ranks it among what the person may see, and nothing at all of a record in
   the trash or erased (a job queued before it went there reloads it with no scope):

   ```php
   public function toSearchableArray(): array
   {
       if (! $this->shouldBeSearchable()) {
           return [];
       }

       return ['id' => $this->id, 'tenant_id' => $this->tenant_id, 'name' => $this->name, 'code' => $this->code,
           'branch' => $this->branch_id === null ? self::INDEX_WHOLE_WORKSPACE : strtolower($this->branch_id)];
   }

   public function shouldBeSearchable(): bool
   {
       return ! $this->trashed();
   }
   ```

   Clients' document is `id`, `tenant_id`, `name`, `email`, `phone` and `branch` (the home branch, or `workspace` for a
   client of none): `branch` lets the index rank only among the branches the list shows, so how many hits come back never
   hints at hidden records. Add the model's settings to `backend/config/scout.php` under `meilisearch.index-settings`, keyed
   by the model's class (`filterableAttributes` `tenant_id` and `branch`, `searchableAttributes` what is searched).

2. An index class that implements `MoodKit\Search\Contracts\ReindexesSearch`:
   - `enabled()`: true only for a Scout driver that keeps an index of its own (not `database`, `collection` or `null`).
   - A method that proposes ids, as `ClientIndex::candidates()`: `Ticket::search($term)->where('tenant_id', $tenantId)`,
     narrowed by `whereIn('branch', [...])` to the top bar's branches, `take($limit * config('search.index_candidates'))`,
     `keys()`, then anything that is not a uuid dropped and the rest through `Support\Database\Ids::canonicalAll()`.
   - A method that narrows the list's query to those ids in the index's order (`whereIn` and `array_position`), as
     `ClientIndex::ordered()`.
   - `reindex($tenantId)`: every live record of the workspace, a chunk at a time, through Scout's **synchronous** path
     (`new Ticket()->syncMakeSearchable($chunk)`), never the queue; it answers how many it sent. `search:reindex` calls it
     as each workspace, one at a time.

3. Wire it in the service provider: tag the index `search.indexes` in `register()`, and in `boot()` turn Scout off for the
   model while no index is on, so nothing is queued and nothing leaves Postgres:

   ```php
   $this->app->tag([TicketIndex::class], 'search.indexes');

   if (! $this->app->make(TicketIndex::class)->enabled()) {
       Ticket::disableSearchSyncing();
   }
   ```

4. In the finder, with the index on, ask it for the candidates and run the list's query **with no words** over them;
   without it, the list's query with the term. An index that proposes none still runs the query, over no id, so how long
   the answer takes tells nothing. See `ClientsFinder`.

5. What changes a document's fields without a model event (a foreign key's `SET NULL`, a bulk `update()`) leaves the index
   stale: listen to the event that says so and send those records again through the queue, as Clients'
   `ResendClientsWithNoBranch` does when a branch is deleted.

Send everything with `php artisan search:reindex`; it never removes a document, so to rebuild an index from nothing, flush
it first (`php artisan scout:flush "MoodKit\Tickets\Models\Ticket"`). Never use `scout:import` or `scout:queue-import`:
they run with no workspace, so row-level security hides every row. Tests use Clients' fake engine
(`withFakeIndex()`, `withoutFakeIndex()` in `afterEach`); `phpunit.xml` pins `SCOUT_DRIVER=database`. How to run
Meilisearch: [Search configuration](../configuration/search.md).

## 7. A source for the admin's palette (optional)

The super admin's palette (`Cmd+K` in the admin) has its own sources. Add one for something the admin manages across
workspaces, in the same three steps with other names:

1. A finder that implements `MoodKit\Search\Contracts\FindsPlatformRecords`: `find($adminId, $term, $limit)`, at most
   `$limit` hits whose `route` starts with `/platform/`. Reads of workspaces go through `ReadsAcrossWorkspaces` (the
   platform's read role, logged with a purpose), and its scope never holds the term. Match with `FuzzyMatch`, as above.
2. A `PlatformSearchSourceProvider` returning `PlatformSearchSource`s (`key`, `labelKey`, `icon`, `finder`, `reads`, `order`
   and, for a module that ships off by default, the platform `flag`), tagged `search.platform_sources`.
3. A page of the admin the route opens (`/platform/...`), and a line of the label in every language.

There is no permission to name: every signed-in super admin may use the source. See
[the admin's palette](../packages/search.md#the-admins-palette).

## Check it

1. Sign in to the demo workspace as `owner@demo.test` and press `Cmd+K` (`Ctrl+K`): typing a ticket's name shows a
   **Tickets** group, and choosing a row opens its page.
2. As a member without `tickets.view`, the group never shows, and the answer of `POST /api/v1/search` holds nothing of a
   ticket.
3. `composer check` passes, `InstalledSourcesTest` and `SearchTranslationsTest` included.
