# Search

The palette (`Cmd+K`) finds the team's members, the branches and the clients a person may open: see
[Search](../packages/search.md) for how it works and how a module adds what it finds. This page is about where the search
runs: in Postgres, the default, or, for the clients, also in Meilisearch.

## The default: Postgres

With `SCOUT_DRIVER=database`, the default, there is nothing to install and nothing to run. Each source runs its own list's
query: the clients are matched by name (any case, accents or not), email, or phone once what was typed has three digits,
with `LIKE` and the `%`, `_` and `\` someone typed taken as letters. Laravel Scout is installed (the Clients package
requires it) but watches no client: the Clients package turns its syncing off at boot, so nothing is queued and nothing
leaves Postgres.

The members and the branches are always searched in Postgres: a plan caps them at tens. The clients are the one set with
no cap (a plan may allow any number), so they are the ones an index can help.

## When to turn on Meilisearch

Turn it on when a workspace has tens of thousands of clients and the search slows down, or when you want a search that
forgives typos ("lopes" finds "López"). Below that, Postgres is enough, and one service less to run.

What changes for the clients, and only for them:

- Meilisearch finds the candidates, by name, email and phone, typos forgiven, ranked by how well they match. The palette
  shows them in that order instead of by name.
- A phone is one word to Meilisearch (`+526641234567`): typing its first digits finds it, typing it in pieces
  (`664 123`) does not, as it does in Postgres.
- The index is asked only for the clients of the branches the list shows (the top bar's, and those of no branch), so
  someone who works at one branch gets as many hits as Postgres would find for them, and how many never hints at clients
  of other branches. Postgres still keeps only the candidates the person may see (see
  [Why the index cannot leak](#why-the-index-cannot-leak)). The index is asked for
  `search.per_source × search.index_candidates` candidates (5 × 4 = 20): the spare ones cover what Postgres still drops (a
  change the queue has not sent yet). Raise `index_candidates` in `backend/packages/Search/config/search.php` if hits go missing.
- Deleting a branch leaves its clients with no home branch in Postgres, with no model event, so their documents in the
  index would keep the branch. The Clients package listens for `BranchDeleted` and, through the queue (the deletion never
  waits on Meilisearch), asks the index for the clients it still holds in that branch of that workspace, and only those,
  and sends them again as that workspace (500 per job with `SCOUT_QUEUE=true`). It is one job per workspace and branch,
  so repeating the event queues it once. Until it runs, people who work at one branch may miss those clients in the
  palette (never see more). Meilisearch hands out at most `pagination.maxTotalHits` hits per search (1000 by default), so
  of a branch with more clients than that the first ones are sent, and `php artisan search:reindex` sends the rest. With
  the database driver nothing is queued.

## Locally

1. Start Meilisearch, which `docker compose up` leaves alone (it is in the profile `meilisearch`):

   ```bash
   docker compose --profile meilisearch up -d --wait
   ```

2. Install its PHP client, which the kit only suggests:

   ```bash
   cd backend
   composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
   ```

3. In the root `.env`: `SCOUT_DRIVER=meilisearch`. `MEILISEARCH_HOST` and `MEILISEARCH_KEY` already point at the
   container (`http://localhost:7700`, the master key `mood_kit_meili_local_dev`, a public development default).
4. Create the index with its settings, then send every workspace's clients (run `scout:sync-index-settings` again after
   an upgrade that changes the index's settings in `backend/config/scout.php`, such as a new filterable attribute):

   ```bash
   php artisan scout:sync-index-settings
   php artisan search:reindex
   ```

5. Keep a queue worker running (`php artisan queue:work`): with `SCOUT_QUEUE=true`, the default, each change reaches the
   index from a queued job. With `SCOUT_QUEUE=false` it is sent inside the request instead, which also works locally, but
   not for production: with Meilisearch down, saving a client commits and then answers 500, and the index misses the
   change.

## In production

- [ ] A Meilisearch you run or a hosted one, reached over HTTPS (`MEILISEARCH_HOST=https://...`).
- [ ] `MEILISEARCH_KEY` is a key made for this app, limited to the clients' index, never the master key. It has no
  `indexes.delete`, so `scout:delete-index` fails with it: delete the index with the master key (see
  [Turning it off](#turning-it-off)). Make it once with the master key, for example:

  ```bash
  curl -X POST "$MEILISEARCH_HOST/keys" -H "Authorization: Bearer $MASTER_KEY" -H 'Content-Type: application/json' \
    --data '{"name": "mood-kit", "actions": ["search", "documents.add", "documents.delete", "indexes.create", "settings.update", "tasks.get"], "indexes": ["clients"], "expiresAt": null}'
  ```

  With `SCOUT_PREFIX`, the index is `<prefix>clients`: name that one.
- [ ] `SCOUT_PREFIX` set when one Meilisearch serves several installs (`staging_`, `production_`), so they never share an
  index.
- [ ] `SCOUT_QUEUE=true` and a queue worker always running (see [Queues and the scheduler](queues-and-scheduler.md)).
  Each job carries the workspace of the change, and the worker applies it before it runs.
- [ ] Failed jobs watched (`php artisan queue:failed`). Each Scout job is tried 5 times, from 10 seconds to 15 minutes
  apart (`scout.jobs` in `backend/config/scout.php`), so Meilisearch restarting loses nothing. A `RemoveFromSearch` that
  still ends in `failed_jobs` left a client that was trashed, merged or erased in the index (Postgres never shows it, but
  its name, email and phone stay there): run `php artisan queue:retry <id>` once Meilisearch is back, or start over
  ([Sending everything again](#sending-everything-again)).
- [ ] A retried `RemoveFromSearch` that runs after the client was restored takes the restored client out: it is missing
  from the palette until it is saved again or you run `search:reindex` (a missed result, never a leak).
- [ ] In the deploy that turns it on (and after changing `SCOUT_PREFIX`), once, after `config:cache`:

  ```bash
  php artisan scout:sync-index-settings
  php artisan search:reindex
  ```

- [ ] After an upgrade that changes the index's settings (`index-settings` in `backend/config/scout.php`, such as the
  `branch` filterable attribute or `displayedAttributes`), run `php artisan scout:sync-index-settings` again, after `config:cache`: until then
  Meilisearch rejects the searches that filter on the new attribute, and the palette leaves the clients out
  (`meta.incomplete`).
- [ ] Your privacy policy names the Meilisearch provider if someone else runs it (see
  [What leaves Postgres](#what-leaves-postgres)).

## What leaves Postgres

For each live client, the index keeps its id, its workspace's id, its name, its email, its phone and its home branch's id
(`branch`, or `workspace` for a client of the whole workspace), and nothing else (no notes, address, birthday, tags or
custom fields: `Client::toSearchableArray()`). The branch is there so the index ranks only among the clients the person's
list shows. A client sent to the trash, merged into another or erased leaves the index; one restored comes back. Erasing a
client takes it out in the same flow that anonymizes it. Taking a client out is tried again if Meilisearch fails (see
[In production](#in-production)), and a job queued before the client left that runs after sends nothing of it. The removal is a job of its own
(`RemoveClientsFromSearch`): it reloads the client first and leaves it in the index if it is searchable again (restored
while the removal waited), and it runs even when the workspace is suspended, since it only deletes by id.

A closed or deleted workspace leaves its clients' documents in the index (nothing in it is searched again: every search
names a live workspace) until you start over ([Sending everything again](#sending-everything-again)).

## Why the index cannot leak

The index only proposes ids. For each search it is asked for the candidates of the current workspace alone (filtered on
`tenant_id`) and of the branches the list shows (filtered on `branch`), and anything it answers that is not an id is
dropped. Then the clients list's own query runs over those ids in Postgres: row-level security, the branch of the top
bar, the trash and the erased decide what the person sees, in the index's order. A client of another workspace that the
index proposed by mistake never shows: Postgres hides its row. What was typed goes to the index, never to Postgres. An
index that proposes nobody still runs that query, over no id, so how long the answer takes tells nothing about clients
the person cannot see. The index gives back nothing but ids: its settings display only `id` (`displayedAttributes`) and each
search asks for only that (`attributesToRetrieve`), so a Meilisearch search key that leaks, or a search sent straight to
Meilisearch, reads no name, email nor phone from it. (The documents are still stored with those fields, and the master key
reads them: keep it, and the search key, out of the browser and out of the repository.) An index that fails (Meilisearch down) leaves the clients out of that answer, marked
`meta.incomplete`, reported without what was typed; the rest of the search goes on.

## Sending everything again

`php artisan search:reindex` sends every live client of every open workspace (or of one, `--workspace=<slug>`), as that
workspace, right away and never through the queue (see
[Sending the records again](../packages/search.md#sending-the-records-again)). It only adds and replaces documents. To
start over from an empty index:

```bash
php artisan scout:flush "MoodKit\Clients\Models\Client"
php artisan search:reindex
```

Run them after Meilisearch lost data, or after it was down long enough for the queued changes to fail (a
`RemoveFromSearch` in `failed_jobs` you no longer want to retry included).

Never use `scout:import` or `scout:queue-import`: they run with no workspace, so row-level security hides every client
and they send nothing (or fail). `scout:flush` and `scout:sync-index-settings` are fine. `scout:delete-index`
is too, but the app's key cannot delete an index: use the master key ([Turning it off](#turning-it-off)).

## Turning it off

Set `SCOUT_DRIVER=database` again (and `config:cache`): Postgres answers every search and nothing more is sent. The
documents stay in Meilisearch until you delete the index, with the master key (the app's key has no `indexes.delete`):

```bash
curl -X DELETE "$MEILISEARCH_HOST/indexes/clients" -H "Authorization: Bearer $MASTER_KEY"
```

With `SCOUT_PREFIX`, the index is `<prefix>clients`. Where the app's config names the master key (locally),
`php artisan scout:delete-index clients` does the same and adds `SCOUT_PREFIX` itself.

## Tests

No test reaches Meilisearch: `backend/phpunit.xml` pins `SCOUT_DRIVER=database`, whatever the shell or an `.env` says,
and the Clients tests of the index install a fake engine of their own (`packages/Clients/tests/Support/fake-index.php`).
