# Testing and quality gates

The kit has four gates. CI runs the same ones on every pull request and every push to `main`, so a gate you
skip locally fails there. This guide shows what each runs, how to run them, and how to update the visual
baselines.

## The gates

Run them from the repo root:

```bash
(cd backend && composer check)   # needs Docker running (Postgres and MinIO) and pcov
pnpm --filter ./frontend check
pnpm quality
pnpm lint:secrets                # needs the gitleaks binary
```

| Gate | Runs |
| ---- | ---- |
| `composer check` | Pint (style), Deptrac (layers), Larastan level 8, a Rector dry run, then Pest: the architecture tests, and the rest in parallel with coverage, at least 85% in total and in every package |
| `pnpm --filter ./frontend check` | ESLint, `nuxt typecheck`, Vitest with coverage per file, a production build, then Playwright |
| `pnpm quality` | `lint:dup` (jscpd: any clone of 8 lines and 60 tokens in PHP, TS, JS or Vue fails) and `lint:dead` (knip: unused files, exports and dependencies) |
| `pnpm lint:secrets` | gitleaks over the whole git history |

Never weaken a gate to get a green run: no lowered thresholds, no new exclusions in `deptrac.yaml`,
`.jscpd.json` or `knip.jsonc`, no `@phpstan-ignore`. Inline `eslint-disable` comments do nothing.

## Backend

### Scripts

From `backend/`:

| Command | Does |
| ------- | ---- |
| `composer lint` / `composer lint:fix` | check / fix style with Pint |
| `composer deps` | Deptrac, and fail on a class outside every layer |
| `composer analyse` | Larastan at level 8 |
| `composer refactor:check` / `composer refactor` | list / apply Rector's changes |
| `composer test` | Pest in parallel, no coverage |
| `composer test:coverage` | the architecture tests on their own, then the rest of Pest in parallel with coverage, failing under 85% in total or in any package |

Coverage is measured with pcov on `packages/*/src` only. `backend/app` is outside the gate, so keep it thin.

The architecture tests (`tests/Architecture`) run in a process of their own, without coverage: they keep every class
they parse, and PHPStan's container, in memory until their process ends, which in a coverage worker comes on top of
the coverage of every test the worker runs. They execute no package code that the other tests do not.

### The test database

Tests connect with the host, port, users and passwords of the root `.env`, to the database
`<DB_DATABASE>_test` (`mood_kit_test` by default), so they never touch your development data. Without a root
`.env`, as in CI, they use `backend/.env.testing`.

The storage tests write to a real S3 API, the MinIO of Docker Compose, in the bucket `<ASSETS_BUCKET>-test`, which
they create themselves. They take the keys and endpoint of the root `.env` when it names a bucket and an endpoint,
and the MinIO defaults of `backend/.env.testing` otherwise. CI starts a MinIO of its own.

- The suite refuses to start unless the connected database name ends in `_test` (or `_test_<n>` in parallel
  runs). With a root `.env` the tests always use its `DB_DATABASE` plus `_test`, whatever your shell exports.
  Without one, an exported `DB_DATABASE` replaces the one in `backend/.env.testing`: the guard still refuses a
  name that does not end in `_test`, and one that does is the database the suite wipes. Do not export it.
- Tests connect as the runtime role (`DB_USERNAME`), never the superuser, and migrate as the schema owner
  (`DB_MIGRATION_USERNAME`), as production does. `DatabaseRoleTest` fails if the runtime role is a superuser, has
  `BYPASSRLS` or owns a table. `tests/TestDatabaseOwner.php` makes a parallel worker's database as the schema owner
  and, in the test databases only, lets the runtime role create tables and schemas, for the tests that make scratch
  tables. A test that changes a kit table's definition (a migration's `down()` and `up()`, a policy turned off) runs
  it with `asSchemaOwner()` (`packages/Support/tests/Support/schema-owner.php`), in a transaction of the owner's own.
- The test database is created on the first boot of an empty Postgres volume. If `composer check` cannot
  connect, or cannot create a table, your volume predates that script or the schema owner:
  `docker compose down -v` (erases all local data), then `docker compose up -d --wait` and `php artisan migrate`.
- Pest's parallel workers each wipe and migrate a database of their own at once, and wiping one takes a lock per table,
  index and sequence in one transaction. Docker Compose starts Postgres with `max_locks_per_transaction=256` (CI sets the
  same with `ALTER SYSTEM`); with Postgres' default of 64 a run fails with "out of shared memory". A container started
  before that setting gets it with `docker compose up -d postgres` (it keeps its volume), and
  `docker compose exec postgres psql -U mood_kit_admin -d mood_kit -c 'SHOW max_locks_per_transaction'` says 256. Your own
  Postgres needs the same setting in `postgresql.conf` (a restart applies it).

### Writing tests

| Directory | Kind |
| --------- | ---- |
| `tests/Unit`, `packages/<Name>/tests/Unit` | plain Pest: no framework boot, no database |
| `tests/Feature`, `packages/<Name>/tests/Feature` | boots Laravel, `RefreshDatabase` on Postgres |

Name files `*Test.php`; nothing else runs. A feature test inside a workspace uses
`uses(MoodKit\Tenancy\Testing\ActsAsTenant::class)` and `$this->actingAsTenant($tenant)`. A test of a package that follows the branch
(Team, Notifications, a module) and must not touch the Branches tables binds Tenancy's contracts to
`MoodKit\Tenancy\Testing\FakeBranches`: `FakeBranches::bind(BranchScope::branch($centro), people: [$centro => [$max->id]],
seeAll: [$olga->id])` sets the scope of every request, who works where and who sees every branch. A migration that
enables RLS sets `FORCE ROW LEVEL SECURITY` (`TenantRls::enable()` does), or the schema owner, which owns the
table, skips the policies.

A test of a module that hangs data from clients can start from Clients' own world
(`packages/Clients/tests/Support/clients-world.php`): `clientsWorld($this)` makes two workspaces with their people and
branches (alpha with Olga the owner, Mia the manager, Max a member, and the branches Centro and Playas; bravo with Zed and
Norte), a plan catalog with the `clients` quota, and binds `FakeBranches`; `clientsSeenFrom($this, $scope)` changes who sees
which branch, `aClient($this, $tenant, $name, $columns)` adds a client, and `withClientFields()`
(`client-fields.php`) registers a module's fields. What two requests or two workers do to each other is tested with two
real database sessions (`packages/Support/tests/Support/two-sessions.php`: `startTwoSessions()`, `inSecondSession()`,
`forgetTwoSessions()` in `afterEach`); a change that commits between what reads a row and what holds it, with
`DB::beforeExecuting()` on the statement that holds it, as Clients' `beforeImportHeld()` does.

The client portal has a world of its own on top of that one (`packages/Clients/tests/Support/portal-world.php`):
`portalWorld($this, open: true)` puts alpha and bravo on a plan with `clients_portal`, opens alpha's portal (or leaves it
closed) and adds Ana (`ana@example.com`, who speaks Spanish) as a client of alpha. `portalOpen($this, $tenant, $open)`
opens or closes a workspace's portal as its settings page would; `portalSignIn($this, $client)` gives a portal session
of alpha (Ana's unless another client is given) and answers its token; `portalAs($this, $token, $slug)` is a request to
that workspace's portal with that token or none, with no guard's user left from an earlier request; and
`portalCodeFor($email)` reads the code mailed to `$email` off `Mail::fake()` (it fails the test when no `PortalCodeMail`
went at all, and answers `''` when codes went to other addresses only).

A platform read (`ReadsAcrossWorkspaces`) runs in a session of its own, which cannot see the rows of a test's
transaction: write what it must read with `committedConnection()` (and `asCommittedTenant()` for a tenant table), delete
it in `afterEach`, and close the sessions with `closePlatformSessions()` (`packages/Support/tests/Support/committed.php`).
The tests need the platform role (`DB_PLATFORM_USERNAME` of the root `.env`, or `backend/.env.testing`'s), and the
catalog's writer (`DB_CATALOG_USERNAME`) too.

The catalog of plans is written by `plans:sync` as the schema owner, and by the admin's plan editor as the catalog's writer,
each on a session of its own, so it is not inside a test's transaction either: it commits, and `tests/TestCase.php` deletes
it after every test that opened the owner's session or the writer's (`tests/TestDatabaseOwner.php`).
Each test starts with no catalog, and a test that makes a workspace through Signup (whose subscription needs the default
plan) writes one first: `writePlanCatalog()` in Signup's tests, `plansWorld()` or `SyncPlanCatalog` in Plans'. The
catalog of notifications (`notifications:sync`) works the same way: `notificationsWorld()` writes it.

Architecture tests in `backend/tests/Architecture` check the package boundaries and strict types, and Pest's
`php` and `security` presets ban calls such as `dump`, `var_dump`, `exec`, `md5` and `unserialize`.

## Frontend

From the repo root:

| Command | Does |
| ------- | ---- |
| `pnpm --filter ./frontend lint` | `nuxt prepare`, then ESLint. `lint:fix` applies fixes. |
| `pnpm --filter ./frontend typecheck` | `nuxt typecheck` |
| `pnpm --filter ./frontend test` | Vitest |
| `pnpm --filter ./frontend test:coverage` | Vitest with coverage; prints a summary and writes no files |
| `pnpm --filter ./frontend test:coverage:html` | also writes the HTML report to `frontend/coverage/` (git-ignored) |
| `pnpm --filter ./frontend test:e2e` | builds, then runs Playwright |

Vitest collects `layers/*/tests/**/*.test.ts` and the ESLint rules' tests. Coverage applies to each file:
85% of lines, functions and statements and 80% of branches, over the `.ts` files of every layer's `app/` and
the ESLint rules (type-only files left out).

Test files are named in camelCase (`useRoleEditor.test.ts`). A test never waits on the clock: to let what a step set
off finish, it awaits `flushAll()` from `layers/core/tests/support/flush.ts`, and a test of code with a delay of its
own (a vee-validate form, a debounce) calls `useFormTimers()` in its file and moves the fake clock with `flushAll()` or
`vi.advanceTimersByTimeAsync()`.

No Vitest test reaches the network: `frontend/tests/setup/no-network.ts`, Vitest's setup file, refuses every request to
an address with a scheme (`http://`, `https://`) as if the machine were offline, before the app the `nuxt` environment
boots runs its plugins. So a dev API running on port 8000 changes nothing (the platform's brand plugin reads no
`/platform/public` from it), and a test that needs an answer mocks `useApi` or the service (`mockNuxtImport`), as the
layers' tests do. Endpoints a test registers with `registerEndpoint` still answer.

If a test still reports `X is not defined` after you add `X`, delete `node_modules/.vitest-cache` at the repo
root.

### Visual tests

Playwright runs `frontend/tests/e2e/*.spec.ts` against the production build on port 4173, with a stub API
(`tests/e2e/support/stub-api.ts`), so it needs neither Docker nor the backend. Install the browser once:

```bash
pnpm --filter ./frontend exec playwright install chromium
```

A spec imports `test` and `expect` from `./support/visual` and calls `capture()`:

```ts
import { expect, test } from "./support/visual";

test("home renders the kit title", async ({ page, capture }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-title")).toBeVisible();
  await capture("home");
});
```

`capture` checks the locale and color scheme, waits for hydration, fonts and animations, then compares a
full-page screenshot in the `light` and `dark` projects. The per-pixel threshold is 0 and at most 100 pixels
may differ.

`capture(name, { mask })` covers what is not drawn the same to the pixel on every machine: the location picker's map, drawn
by WebGL (`capture("branches-new", { mask: [page.getByTestId("branch-map")] })`). The map's tiles come from the stub
(`NUXT_PUBLIC_MAP_TILES_URL` in `playwright.config.ts`), never from the internet. The page's clock is frozen
(`FROZEN_NOW`), and mood-ui's dialogs leave by an animation that counts on it: a test that closes a dialog lets the clock
run first (`page.clock.setSystemTime(FROZEN_NOW)`), as `branches.spec.ts` does.

The branch switcher shows only for three sessions of the stub's workspace `pier` (`support/stub-branches.ts`) and the
clients' owner of `shop`, the only ones whose `GET /me` has a `branch`: `STUB_BRANCH_ALL_TOKEN` (sees every branch, as
`STUB_CLIENTS_TOKEN` does), `STUB_BRANCH_STAFF_TOKEN` (works at Centro and Playas, on Centro) and `STUB_BRANCH_NONE_TOKEN`
(works at none). Every other session's captures have no switcher. `branch-switch.spec.ts` is the model.

Clients show only in the stub's workspace `shop`, signed in with `STUB_CLIENTS_TOKEN` (`support/stub-clients.ts`): the owner
with the clients' permissions, on every branch of a workspace that works by branch (so the list's branch filter and the
form's home branch show), on a plan with the `clients_import` feature and the `clients` quota (6 of 100). It has six
clients, three tags, Ana's page with her activity and a possible duplicate, and an import that an upload answers (its
columns, then a preview with three errors) and one that finished. Every other session's menu has no Clients, so their
captures never change. The dashboard scrolls inside its own frame, so a full-page capture is as tall as the window: a long
page sets the window's height first (`page.setViewportSize`), as `clients.spec.ts` does.

The client portal answers from the same file: it is open in `shop` (and in `panaderia-la-esperanza-del-centro`, whose
long name is for the narrowest phones) and closed in every other workspace, so `http://demo.localhost:4173/portal` shows a
closed portal. Asking for a code always answers 202, and the one code that signs in is `12345678`; Ana's portal session is
`STUB_PORTAL_TOKEN`, kept under `mood-kit.portal-token` (`localStorage.setItem("mood-kit.portal-token",
STUB_PORTAL_TOKEN)` before the page loads, as `client-portal.spec.ts` does). It is no member's: `GET /me` with it is a 401.
A change of her details or her consent answers `{client}` with what was sent applied, and keeps nothing. Ana's page shows
two portal sessions, and the clients' owner sees the portal's section in Settings.

The admin's editor of the plans answers from `support/stub-platform-plans.ts`, behind the stub's admin token
(`STUB_PLATFORM_TOKEN`): Free (the default), Pro (its monthly price not on Stripe yet) and Legacy (off sale), three
resources and one feature, with a catalog writer and Stripe set up. It answers like the API (see
[Editing the plans](../packages/platform.md#editing-the-plans)) and keeps nothing: a save at another version is 409
`platform.plan_changed`; one that changes a price, lowers a limit or takes a feature away without `confirm` is 409
`platform.plan_change_unconfirmed` with `meta.impacts` and `meta.workspaces`; else it answers `{plan, stripe}`, the plan as
sent. A new plan is a copy of `from`, off sale and last. `platform-plans.spec.ts` is the model.

The projects ask for reduced motion, and under it `main.css` removes every animation, so a capture never catches one
mid-way. Locally the run uses at most 40% of the cores, which keeps a busy machine from failing pages on timeouts.

Baselines are per platform, in `tests/e2e/__screenshots__/<spec>/<name>-<project>-<platform>.png`. Both
sets are committed: `darwin` for macOS, `linux` for CI. CI runs inside the official Playwright Docker image,
whose tag in `.github/workflows/ci.yml` must equal the pinned `@playwright/test` version
(`1.64.1`); bumping one means regenerating the Linux set.

### Updating baselines

Only for an intended design change, after reading the diff, and in the same commit as that change.

On macOS:

```bash
pnpm --filter ./frontend build
pnpm --filter ./frontend exec playwright test --update-snapshots
```

The Linux set is generated only inside the Playwright image, so fonts and the Chromium build match CI.
Commit your change first (`git archive` copies what is committed), then, from the repo root (add
`--platform linux/amd64` to `docker create` on Apple Silicon, since the CI runners are x86-64):

```bash
docker create --name pw --ipc=host -w /work mcr.microsoft.com/playwright:v1.64.1-noble sleep infinity
docker start pw
git archive HEAD | docker cp - pw:/work
docker exec pw sh -c 'npm install --global pnpm@10.33.0 && cd /work && HUSKY=0 pnpm install --frozen-lockfile \
  && pnpm --filter ./frontend build && pnpm --filter ./frontend exec playwright test --update-snapshots'
docker exec pw sh -c 'cd /work/frontend/tests/e2e/__screenshots__ && ls */*-linux.png' | while read f; do
  docker cp "pw:/work/frontend/tests/e2e/__screenshots__/$f" "frontend/tests/e2e/__screenshots__/$f"
done
docker rm -f pw
```

Look at the new `-linux.png` files, light and dark, before committing them.

## Git hooks

`pnpm install` sets up Husky:

- **pre-commit**: lint-staged runs Pint on staged PHP and `eslint --fix` on staged frontend `.ts`, `.vue` and
  `.mjs`, then gitleaks scans the staged changes (skipped, with a notice, when gitleaks is not installed).
- **commit-msg**: commitlint checks Conventional Commits. Allowed types: `feat`, `fix`, `docs`, `chore`,
  `test`, `refactor`, `perf`, `ci`. Example: `feat(billing): add invoices`.

Do not skip hooks with `--no-verify`.

## CI

`.github/workflows/ci.yml` runs on every pull request and every push to `main`; a newer push to the same
branch cancels the run in progress.

| Job | Runs |
| --- | ---- |
| Secrets scan | gitleaks over the full history |
| Backend (PHP 8.4), Backend (PHP 8.5) | with PostgreSQL 18, as the runtime role, migrated by the schema owner: `composer check`, then `migrate:fresh` and `tenancy:verify-rls` on the test database, then `composer audit` |
| Frontend quality, tests and build | `pnpm --filter ./frontend check` in the Playwright image; the report is kept when it fails |
| Duplication, dead code and commit messages | `pnpm lint:dup`, `pnpm lint:dead`, commitlint on the commits of the push or pull request |

A red run is a failed gate: fix the cause rather than re-running it.
