# Search

The global search of the dashboard: what someone types, looked up in every kind of record they may open. Search keeps no
tables and knows nothing of members, branches or clients. It holds a registry of **sources**: each package declares what it
finds and how, and Search asks every source the person may use.

Search depends on Support, Tenancy, and the contracts of Auth, Rbac and Plans. Platform depends on Search, never the reverse: the platform flag a source of the
admin's palette may need is asked through `Contracts\GatesPlatformSources`, which Platform binds. No package depends on Search except through
its contracts: a package that adds a source implements `MoodKit\Search\Contracts\*`, and Search never names it.

## Sources

A source is one kind of record the search finds. A package declares its sources with a `SearchSourceProvider`, bound and
tagged `search.sources` from its service provider:

```php
$this->app->tag([NotesSearchProvider::class], 'search.sources');
```

| Contract | What it is |
| -------- | ---------- |
| `MoodKit\Search\Contracts\SearchSourceProvider` | `searchSources()`: the list of `SearchSource` the package declares |
| `MoodKit\Search\Contracts\SearchSource` | one source, field by field below |
| `MoodKit\Search\Contracts\FindsRecords` | `find($tenantId, $userId, $term, $limit)`: at most `$limit` hits, best first, as a list of `SearchHit` |
| `MoodKit\Search\Contracts\RequestingPerson` | `mustBe($tenantId, $userId)`: for a finder whose list reads the branch bar from the current request (as the team's and the clients' do). It throws a `LogicException` unless the person signed in, in the current workspace, is that one: with no one signed in the branch scope would be the whole workspace |
| `MoodKit\Search\Contracts\SearchHit` | one record found, as the palette shows it: `id`, `title`, `subtitle` (null: none) and `route`, the dashboard page that opens it (a path that starts with `/dashboard/`). Nothing else of the record travels |

A `SearchSource` has:

| Field | What it is |
| ----- | ---------- |
| `key` | `<package>.<what>` in lowercase letters, digits and `_` (`clients.clients`), unique among every source |
| `labelKey` | the translation key of the group's title, with a line in every language the kit speaks |
| `icon` | a Heroicons outline name in kebab-case, from the same catalog as the menu's icons |
| `finder` | the class that finds the records: it implements `FindsRecords` and is resolved from the container |
| `permission` | required: the permission the person needs for the source to be asked at all, shaped as Rbac names them (`clients.view`), or `null` on purpose for a source any member may ask. A finder's list query does not check its list's view permission (the route does), so the source must name it |
| `order` | where the group goes among the others, smallest first (0 by default); sources with the same order go by key |
| `feature` | the plan feature the workspace needs for the source to be asked at all (null: none), a feature slug as Plans names them (`notes_premium`, no dots) |

A finder is asked as the workspace, by someone who has the source's permission and feature. It runs **the same query as
its package's own list** (its visibility, the branch, the trash), so the search never shows what the list hides. The term
it gets is trimmed, 2 to 100 characters of one line, and a `%` or `_` in it is a letter, not a wildcard. A finder never writes the term to a log, an audit entry or an exception it reports
itself: a failure reaches Search, which reports it without the term.

### What the registry checks

`MoodKit\Search\Registry\SearchRegistry` gathers every provider tagged `search.sources` on first use and checks each
source: a key shaped `<package>.<what>`, declared once, a finder that implements `FindsRecords`, a permission (when there
is one) shaped as Rbac's permission names, and a feature (when there is one) shaped as a plan feature's slug. A source that breaks one of these throws `MoodKit\Search\Errors\InvalidRegistry`:
a mistake in code, which fails the first search instead of showing up as a search that never answers. The registry
checks shapes only; that the permission and the feature are declared by some package is checked by a test of the kit.

### The kernel's sources

| Key | Package | Permission | Feature | Group | Finds | Follows the branch |
| --- | ------- | ---------- | ------- | ----- | ----- | ------------------ |
| `team.members` | Team | `team.view` | none | "Team", `users`, order 10 | the members by name or email, as the team list shows them (the active ones alone without `team.manage`); the name (or the email), the email, `/dashboard/team/{id}` | yes, as the team list ([Team](team.md#search)) |
| `branches.branches` | Branches | `branches.view` | none | "Branches", `map-pin`, order 20 | the branches by name or city, as the branches list shows them (active or not; the ones the person works at without `branches.all`); the name (or the slug), the city, `/dashboard/branches/{id}` | the branches the person may see, not the one chosen in the switcher ([Branches](branches.md#search)) |
| `clients.clients` | Clients | `clients.view` | none | "Clients", `identification`, order 30 | the clients by name, email or phone, as the clients list shows them with no filter (never the trash nor the erased); the name, the email (else the phone), `/dashboard/clients/{id}` | yes, as the clients list: the top bar's branch and the clients of none ([Clients](clients.md#search)) |
| `rbac.roles` | Rbac | `rbac.view` | none | "Roles", `shield-check`, order 40 | the roles by name (a system role by its name in the language of the request) or slug, as the roles list has them; the name, how many members hold it, `/dashboard/roles/{id}` | no: roles are the workspace's, not a branch's ([Rbac](rbac.md#search)) |

## The route

`POST /api/v1/search` is the palette's search, with what was typed in a JSON body (`{"q": "ana"}`). Any signed-in member
of the workspace may call it (`workspace`); it takes no permission of its own, since each source checks its own. It is a
`POST` so what was typed never sits in a URL, a browser's history or an access log, like the map's searches; a `q` in the
query string is not read. It writes nothing and is not audited, so a super admin acting as the person may search too.

`q` is required, in the body: one line of visible characters (`PlainName`: no new line, tab, NUL, direction mark or byte
that is not UTF-8), 2 to 100 characters once the app has trimmed it. A `%`, `_` or `\` in it is a letter. Anything else
is 422 with the error on `q`.

For each source, in the registry's order, Search checks the source's permission and feature first: a source the person
may not use is never made nor asked, so it runs no query and costs no time. The others are asked for `per_source` hits
each, and a source that found nothing has no group:

```json
{
  "data": {
    "groups": [
      {
        "source": "clients.clients",
        "label": "Clients",
        "icon": "identification",
        "hits": [
          { "id": "0195...", "title": "Ana López", "subtitle": "ana@example.com", "route": "/dashboard/clients/0195..." }
        ]
      }
    ]
  },
  "meta": {},
  "errors": []
}
```

`label` is the source's `labelKey` in the language of the request. A source that fails does not fail the search: the
others still answer and `meta.incomplete` is `true`. Search reports the failure as `MoodKit\Search\Errors\SourceFailed`,
with the source's key, the exception's class (and its SQLSTATE for a database error) and the file and line where it was
thrown; never its message, which for a database error holds the query's values, what was searched, and never the
exception itself. A source fails too when it answers something that is not a list of `SearchHit` (`InvalidHit`), or a hit
whose `route` is not a page of the dashboard (`UnsafeHitRoute`): a path that starts with `/dashboard/`, with no `\` and no
`//`, since the palette navigates to whatever route it gets. A source that answers more than `per_source` hits is cut
short.

What was searched is kept nowhere: no table, no audit entry, no log. `q` is registered in `SentryOnlyFields`, so Sentry
gets it blanked wherever it collects it: the request body and, for a stray `?q=`, the query string and the URL, and the term is a `#[SensitiveParameter]` of `RunSearch`, so even a
trace with every call's arguments does not carry it.

The answers hold people's names, emails and phones, so they are kept out of every cache and referrer
(`Cache-Control: no-store, private`, `Referrer-Policy: no-referrer`), the limiter's refusal included. The named limiter
`search` allows `per_minute` searches a minute to each member in each workspace; it counts apart from every other route.

## The search layer

`frontend/layers/search` holds the palette's side of the route: the types of the answer, `searchWorkspace()` (the
`POST /search` call, with what was typed trimmed in the body) and the rows the palette shows. A page offered by the
dashboard's menu is a row under "Pages"; each group of the answer is a row group of its own, titled by the API. A phone
in a subtitle (the clients') is written to be read (`+52 664 123 4567`), and a failure of the API, or `meta.incomplete`,
is a muted row that does nothing when chosen.

### The palette

The palette is mood-ui's `SearchInput` as it comes, in the dashboard's top bar before the bell (`kit:topbar:items`, order
5). `Cmd+K` (`Ctrl+K` outside macOS) focuses it from any page of the dashboard.

- **With nothing typed**, focusing it offers the first eight pages of the menu, under "Pages". It asks the API nothing.
- **With something typed**, the pages whose name holds it come first, and from two characters the API's groups follow
  (clients, team, branches, and what a module adds), each under its own title. The search waits a moment after the last
  key, and only the last one asked is shown. It asks again, with what is typed, when the language or the branch of the
  top bar changes (the answer follows both; the front never sends the branch).
- **Choosing a row** opens its page, empties the field and leaves it. "Nothing matches what you typed" shows only after a
  real search.
- **A failure** of the API shows its message in a muted row under "Search", and the results of an older search are hidden;
  an answer missing a source adds "Some results could not be loaded". Neither row can be chosen.
- **In the admin** the same palette sits in the admin's top bar (`kit:platform:topbar:items`, order 5, the layer's
  `PlatformSearchTopbarItem`), with the same `Cmd+K`, phone dialog and rows, worded "Search the admin" and asking
  `POST /platform/search` (`SearchPalette scope="platform"`; it has no branch to follow). Its pages are the admin's menu
  (the platform layer's `platform-search-shortcuts` plugin), and its groups the platform's sources: choosing a workspace opens
  its page, a waitlist entry or an invitation opens the waitlist filtered to its email, a plan opens its editor.
- **On a phone** the bar has a magnifying glass instead of the field. It opens the same palette in a dialog, which closes
  when a row is chosen or with its close button. There is no `Cmd+K` on a phone.

## The admin's palette

The super admin has a palette of its own, in the admin's top bar: `POST /api/v1/platform/search`. It has its own registry
and its own sources, because what an admin finds (workspaces, super admins, the waitlist) is nobody's data inside a
workspace, and the dashboard's route refuses an admin's token. Nothing of the dashboard's palette changes.

A package declares its admin sources with a `PlatformSearchSourceProvider`, bound and tagged `search.platform_sources`:

```php
$this->app->tag([NotesPlatformSearchProvider::class], 'search.platform_sources');
```

| Contract | What it is |
| -------- | ---------- |
| `MoodKit\Search\Contracts\PlatformSearchSourceProvider` | `platformSearchSources()`: the list of `PlatformSearchSource` the package declares |
| `MoodKit\Search\Contracts\PlatformSearchSource` | `key` (`<package>.<what>`), `labelKey`, `icon`, `finder`, `reads` (what it searches, in a few words: `name, slug`), `order` and `flag` |
| `MoodKit\Search\Contracts\FindsPlatformRecords` | `find($adminId, $term, $limit)`: at most `$limit` `SearchHit`s, best first, each with a `route` that starts with `/platform/` |

There is no permission: the route takes the `platform` group (the admin's guard and host, no workspace), so only a signed-in
super admin asks, and every super admin may use every source. A source that belongs to a module that ships off by default
names the platform flag it needs in `flag` (`<package>.<what>`): while it is off the source is never made nor asked. A
finder that reads data of workspaces does it only through `ReadsAcrossWorkspaces` (the platform's read role, logged in
`platform_reads` with its purpose), and never writes the term into that log's scope, an audit entry or a message.

`PlatformSearchRegistry` checks them as `SearchRegistry` does (`InvalidRegistry`): the key, declared once, a finder that
implements `FindsPlatformRecords`, and the shape of the flag. The answer has the dashboard's shape (`{groups: [{source,
label, icon, hits}]}`, `meta.incomplete` when a source failed), so the palette draws it as it draws that one; a source that
fails is reported as `SourceFailed` without its message, and a hit whose route is not under `/platform/` (or has `\` or `//`)
fails its source (`UnsafeHitRoute`).

The platform's own sources (`MoodKit\Platform\Search`), in this order:

| Key | Finds | Read through | Opens |
| --- | ----- | ------------ | ----- |
| `platform.workspaces` | workspaces by name or slug (a deleted one is never found) | the platform read role, purpose `platform.search_workspaces`, scope `{source}` only (see below for Postgres' log) | `/platform/workspaces/{id}` |
| `platform.plans` | plans by name in any language or slug, retired ones too, without accents or case | the plan editor's own read of the catalog (`ShowPlans`) | `/platform/plans/{slug}` |
| `platform.waitlist` | waitlist entries by email | the app's role (the table has no workspace) | `/platform/waitlist?entry=<id>` |
| `platform.invitations` | invitations by email | the app's role | `/platform/waitlist?tab=invitations&entry=<id>` |
| `platform.admins` | super admins (people that still exist) by name or email | the app's role | `/platform/settings` (there is no page per admin) |

Each matches as the dashboard's finders do (`FuzzyMatch`: contains the word, or resembles it, closest first; a `%`, `_` or
`\` is a letter), served by GIN trigram indexes on the lowered workspace name and slug and on the waitlist and invitation
emails (`Platform`'s `add_trigram_indexes_for_the_admin_search`). The route, its body, validation, `no-store` headers and
`PlainName` rule are the dashboard's; its named limiter is `platform-search` (`search.platform_per_minute`, 30 a minute per
admin). Every search of workspaces writes one `platform_reads` row (kept, as the audit of reads across workspaces asks), so that
limit is also the most rows an admin can add to it a minute; the trigram indexes serve the contains half of the match, and the
resemblance half reads each row of tables of a few thousand at most.

**What Postgres logs.** The platform read role has `log_statement = 'all'`, so that a read that skipped the app's own log still
shows in the server's. The workspace source sends what the admin typed as a bound value, so without a limit the server's log would
keep the term. Set `log_parameter_max_length = 0` on the role (`deploy/postgres-init/01-roles.sh` and
[Production](../configuration/production.md) do): the statements stay in the log and the bound values are dropped. The waitlist and
invitation sources run as the app's role, which logs no statements. The app never writes the term (`platform_reads` keeps the purpose
and the source only), and a hit opens a row by its id, so no address or log of the app holds an email.

## An index outside Postgres

By default Postgres answers every search and no index exists. A package whose records can grow without a limit may also
keep them in an index outside Postgres (Meilisearch, through Laravel Scout), which only proposes ids: the source still runs
its list's query over them, so Postgres decides what each person sees. In the kernel only the clients may have one (set up
in [Search configuration](../configuration/search.md)); a module can add its own.

Search knows nothing of Scout or Meilisearch. A package with an index implements
`MoodKit\Search\Contracts\ReindexesSearch` and tags it `search.indexes` from its service provider:

```php
$this->app->tag([NotesIndex::class], 'search.indexes');
```

| Method | What it does |
| ------ | ------------ |
| `enabled()` | whether an index outside Postgres is configured for these records now; off, it is never asked to send anything |
| `reindex($tenantId)` | sends every live record of the workspace to the index and answers how many it sent. It is asked as that workspace (its tenant context and RLS), one workspace at a time |

`reindex()` sends synchronously, before it returns, and never through the queue: the count it answers is what reached the
index, and a failure is the command's to report. A queued send would report success for documents not sent yet, need a
worker running, and fail in that worker for a suspended workspace (a queued job of a suspended workspace never runs). With
Scout, that means its synchronous path (`searchableSync()`, or the engine's `update()`), never `searchable()` with
`scout.queue` on. Sending a record twice must do no harm: the index adds the document or replaces it by its id.

### Sending the records again

`php artisan search:reindex` sends every record of every open workspace to each index that is on: after turning an index
on, or to send everything again. `--workspace=<slug>` sends one workspace's alone.

- Each index is asked for one workspace at a time, as that workspace (`RunAsTenant`), so it never reads another workspace's
  rows. A closed workspace is left out. A suspended workspace is sent like an active one: its records stay searchable for
  the day it is reactivated, and nobody can search them while it is suspended.
- A slug no open workspace has, or `--workspace=` with no slug, is refused before anything is sent, with a failure, even
  while no index is on: a typo never passes for success.
- With no index on (`SCOUT_DRIVER=database`, the default) it says there is nothing to send and exits with success.
- It only adds and updates documents: it never removes one the index keeps for a record that is gone. To rebuild an index
  from nothing, empty it first, then send everything again:

  ```bash
  php artisan scout:flush "MoodKit\Clients\Models\Client"
  php artisan search:reindex
  ```

- An index that fails for a workspace does not stop the others: it is reported as `MoodKit\Search\Errors\ReindexFailed`
  (the workspace's id, the index's class, the failure's class, its SQLSTATE for a database error, and the file and line
  where it was thrown; never its message, which can hold the documents it was sent, and never the exception itself), the
  output names the workspace's slug, and the command ends in failure once every workspace was tried. Run it again: sending
  a record twice does no harm.

## Configuration

The defaults live in `backend/packages/Search/config/search.php`, with no environment overrides: change them there or in a
`backend/config/search.php` of your own.

| Key | Default | What it sets |
| --- | ------- | ------------ |
| `per_source` | 5 | hits per source in one answer: the palette shows a few of each kind, never a list |
| `min_length` | 2 | the shortest text that is searched |
| `max_length` | 100 | the longest text that is searched |
| `per_minute` | 60 | searches per member and workspace per minute (the named limiter `search`) |
| `platform_per_minute` | 30 | searches per super admin per minute (the named limiter `platform-search`) |
| `index_candidates` | 4 | with a search index, how many candidates per hit a source asks the index for before Postgres keeps what the person may see |

## For a module

A module adds what the palette finds with a source of its own: a finder that runs its list's query and a
`SearchSourceProvider` tagged `search.sources`, with its permission, its labels and, if its records grow without a limit,
an index. Step by step: [Add a search source](../guides/add-a-search-source.md).

## Reference

### Routes

| Route | Middleware | Permission | Limiter | Impersonation | Answers |
| ----- | ---------- | ---------- | ------- | ------------- | ------- |
| `POST /search` (`{q}`) | `workspace`, `KeepOutOfCachesAndReferrers`, `throttle:search` | none (each source checks its own) | `search` | allowed | `{groups: [{source, label, icon, hits: [{id, title, subtitle, route}]}]}`; `meta.incomplete` when a source failed |

| Route | Middleware | Permission | Limiter | Answers |
| ----- | ---------- | ---------- | ------- | ------- |
| `POST /platform/search` (`{q}`) | `platform` (`KeepOutOfCachesAndReferrers`, no workspace, the admin's host, `auth:platform`), `throttle:platform-search` | none: a signed-in super admin; a source may need a platform flag | `platform-search` | the same shape, from the sources tagged `search.platform_sources` |

| Limiter | Counts | Setting |
| ------- | ------ | ------- |
| `search` | 60 a minute, per member and workspace | `search.per_minute` |
| `platform-search` | 30 a minute, per super admin | `search.platform_per_minute` |

### Commands

| Command | Scheduled | Does |
| ------- | --------- | ---- |
| `search:reindex [--workspace=<slug>]` | no: run it by hand, or in the deploy that turns an index on | sends every record of each open workspace (or of one) to the indexes that are on, as that workspace (see [Sending the records again](#sending-the-records-again)) |

### Errors

The route has no error of its own. It answers the kernel's: 401 `auth.unauthenticated` (nobody signed in, a token of
another workspace or the admin's), 422 validation errors on `q` (and 422 `validation.json_object` when the JSON body is not an object, such as a bare string or a list), 429 `http.too_many_requests`. What Search reports, never
answers:

| Class | When |
| ----- | ---- |
| `MoodKit\Search\Errors\InvalidRegistry` | a provider declared a source the registry refuses |
| `MoodKit\Search\Errors\SourceFailed` | a source failed: reported without the failure's message and with nothing chained; the answer goes on with `meta.incomplete` |
| `MoodKit\Search\Errors\InvalidHit` | a finder answered something that is not a list of `SearchHit` (its class is named in the `SourceFailed` reported) |
| `MoodKit\Search\Errors\ReindexFailed` | `search:reindex`: an index failed for a workspace; reported without the failure's message and with nothing chained, and the command goes on with the rest |
| `MoodKit\Search\Errors\UnsafeHitRoute` | a finder answered a hit whose route is not a page of the dashboard, or of the admin for the admin's palette (its class is named in the `SourceFailed` reported) |
