# Data

What a module offers to read and to do, said once and checked by the kit. Data keeps no tables. It holds two registries: the
**datasets** each package declares (a read view of its records: which columns, behind which permission) and the **actions** each
package declares (a create or an edit, through the module's own Action). Data knows no package that registers one.

Today the contract serves three things: the tests of a module (a dataset is the one place that says what a person may read of it, so a
test of isolation reads through it), `php artisan data:verify`, which stops a deploy on a dataset that cannot work, and a module of
your own that wants to list records, or make and change them, as a person of a workspace. These contracts are what an assistant add-on can consume: it can read what datasets declare and run what actions declare, and
nothing else.

Data depends on Support, Tenancy and the contracts of Rbac, Plans and Platform. A package that declares a dataset or an action
reaches Data only through `MoodKit\Data\Contracts\*`, as every package reaches another.

## Datasets

A package declares its datasets with a `DatasetProvider`, bound and tagged `data.datasets` from its service provider:

```php
$this->app->tag([NotesData::class], 'data.datasets');
```

| Contract | What it is |
| -------- | ---------- |
| `Contracts\DatasetProvider` | `datasets()`: the list of `Dataset` the package declares |
| `Contracts\Datasets\Dataset` | one dataset, built with `Dataset::make('notes.notes')->...->build()` |
| `Contracts\Datasets\Column` | one column that may leave the dataset, built with `Column::string('name')`, `text`, `enum`, `int`, `decimal`, `money`, `bool`, `date`, `datetime` or `id` |
| `Contracts\Datasets\Relation` | a link to another declared dataset: `Relation::belongsTo('branch', 'branches.branches', 'branch_id')` |
| `Contracts\DatasetScope` | a module's rule of what a person sees in it: `narrow($query, $viewer)` |
| `Contracts\Viewer` | who reads: a workspace id and a user id, taken from the session |
| `Contracts\DatasetCatalog` | `all()` and `find($key)`: what exists, checked on first use |

A scope's `narrow()` takes and answers the Eloquent builder as `Illuminate\Contracts\Database\Eloquent\Builder`, the contract that keeps
the `Contracts\` namespace free of the database layer. It calls `where()` and the rest as on an Eloquent builder. It runs first, and
the reader then wraps everything the source, the scope and the model's global scopes asked for in one group and ANDs the workspace's
filter to it, so a scope can only narrow.

A `Dataset` has:

| Field | What it is |
| ----- | ---------- |
| `key` | `<package>.<what>` in lowercase (`projects.projects`), unique among every dataset |
| `label`, `description` | translation keys with a line in English and in Spanish. The description says what the records are, in a line |
| `source` | a closure that returns an Eloquent query and already leaves out what must never be seen: the trash, a client erased for privacy |
| `permission` | required: the permission the person needs to read it, declared by some package |
| `scope` | optional: a class that implements `DatasetScope` |
| `columns` | the only columns that exist for a reader. Each has a name, a type, a label and, when it is not the column of that name in the source's table, an `expression` (`users.name`) |
| `metrics` | `count`, or `sum:`, `avg:`, `min:` or `max:` over a column that is `int`, `decimal` or `money` |
| `relations` | the links to other datasets, by a column of its own |
| `link` | the dashboard page of one row, with `{id}` where its id goes (`/dashboard/notes/{id}`) |
| `flag`, `feature` | the platform flag and the plan feature that must allow it for the workspace |

A column with no label of its own takes `<the dataset's label key without ".label">.columns.<name>`: with the label key
`notes::data.notes.label`, the column `title` is `notes::data.notes.columns.title`, and both languages need that line.

A column marked `->sensitive('clients.export')` (an email, a phone, notes) leaves the dataset only for someone who holds that
permission. `->sensitive()` with no permission is for nobody.

### What the registry checks

`MoodKit\Data\Datasets\DatasetRegistry` gathers every provider tagged `data.datasets` on first use and refuses a dataset, with a
message that names it and says what is wrong, when:

- its key is not `<package>.<what>` in lowercase, or it is declared twice;
- its permission, or the permission of a sensitive column, is declared by no package;
- a label, a description or a column's label has no line in English or in Spanish;
- two columns have one name, or a name is not a word;
- a metric is not over a numeric column;
- a relation points at a dataset nobody declared, or at a column it does not have;
- its scope is not a `DatasetScope`, its link is not a page of the dashboard, or its flag or feature is not shaped as the
  platform's and the plans' names are.

A refusal is a `Contracts\Datasets\DatasetInvalid`: a mistake in code, which `data:verify` turns into a failed deploy
instead of a failed request.

### The kernel's datasets

| Key | Package | Permission | Flag | Sensitive columns (permission) | Who sees which rows |
| --- | ------- | ---------- | ---- | ------------------------------ | ------------------- |
| `branches.branches` | Branches | `branches.view` | none | `phone`, `email` (`branches.manage`) | every branch for whoever sees every branch, else the ones they work at ([Branches](branches.md#dataset)) |
| `clients.clients` | Clients | `clients.view` | none | `email`, `phone`, `birthday`, `address_line_1`, `notes` (`clients.export`) | the clients of the branches the person may see and of none, or all of them; never the trash, the erased or the merged ([Clients](clients.md#dataset)) |
| `projects.projects` | Projects | `projects.view` | `projects.enabled` | none | the projects of the branches the person may see and of none, or all of them ([Projects](projects.md#dataset)) |
| `team.members` | Team | `team.view` | none | `email` (`team.manage`) | the active members for whoever does not manage the team, the deactivated ones too for whoever does; there is no branch rule, as the member profile endpoint has none ([Team](team.md#dataset)) |

## Reading a dataset

`MoodKit\Data\Contracts\ReadsDatasets` reads a dataset as a person:

```php
$rows = resolve(ReadsDatasets::class)->rows('projects.projects', new Viewer($tenantId, $userId), ['name', 'status'], limit: 50);
```

The `Viewer` is the workspace and the person of the request, never something a caller was told. `rows($key, $viewer, $columns,
$limit)` answers a `DatasetRows`: the `columns` (names), the `rows` (lists of values in that order), the `total` of rows the person
sees and whether the answer is `truncated`. It checks, every time and in this order:

1. The dataset exists, or `DatasetUnknown`.
2. The request works in the viewer's workspace and is signed in as the viewer. Otherwise it is a `WrongWorkspace` or a `WrongViewer`:
   a mistake in the caller's code, not an answer.
3. The person holds the dataset's permission, its platform flag is on for the workspace and its plan includes its feature, or
   `DatasetForbidden`.
4. The query is the dataset's `source`, narrowed by its `scope`, with the model's global scopes applied, and then **confined**:
   everything asked for so far is held in one group and `tenant_id = <the viewer's workspace>` on the dataset's table is ANDed to it.
   The same goes for every table the query joins by name (`->join('users', ...)` or `->join('users as u', ...)`) that has a
   `tenant_id` column: its `tenant_id` must equal the dataset table's, inside the join's own condition, so a left join stays a left
   join. That is added whatever the source or the scope did, so a source that forgot the workspace, a scope or a global scope
   whose conditions end in an `OR`, or a join to a row of another workspace still cannot reach a row of another workspace. It
   comes on top of row-level security, which stays on. What it does **not** inspect is a joined subquery, a join given as an
   expression and a correlated subquery inside a column's `expression`: those rely on row-level security alone, so every table
   they read needs `TenantRls::enable()` (`data:verify` checks the tables it can name). Team's `role` column reads
   `model_has_roles` and `roles` in such a subquery: both carry a `tenant_id` with forced row-level security (Rbac's migration), and the
   subquery also compares their `tenant_id` with the membership's.
5. Only declared columns come out, each under its own name. A sensitive column comes out only for someone who holds its
   permission. Asking for a column that is not declared, or one that is sensitive for this person, is the same
   `DatasetForbidden`, so the answer never says which. With no columns asked (or an empty list), the person gets every column they may see.
6. At most 200 rows (`limit` is cut to 200; a negative one is 0), in the dataset's order or by id.

All of it runs in a read-only transaction that is rolled back, with `SET LOCAL statement_timeout = '3s'`. A source that tries to
write fails with a Postgres error, and a statement that runs longer than three seconds is stopped: the limit is for each statement,
so the count and the select of one read may take up to three seconds each. Inside a transaction of the caller's
(a test, a job) the same settings end when the read ends, and the caller can write again.

Values come as the database holds them, with three changes: a `datetime` is a UTC moment (`2026-03-01T10:00:00Z`), a `bool` is a
boolean and an `int` is an integer.

The reader works inside a request only: the viewer must be the person the request is signed in as (`RequestViewer`), and a queued job
or a command has no signed-in person, so neither can read a dataset today. Metrics, filters, groupings and joined relations are not part of this reader: it reads rows. The columns a dataset declares are what
a module that does more can build on.

## Verifying

`php artisan data:verify` runs in every deploy (after `platform:verify`, see the
[production checklist](../configuration/production.md)) and in CI, after the migrations. It builds both registries, so a bad
declaration stops the deploy, then builds each dataset's query for a workspace and a person that do not exist and runs it for no
rows, which fails on a column or an expression its table does not have, and checks that the table the dataset reads, and every table it joins by name that has a `tenant_id`, has forced
row-level security (the same check as `tenancy:verify-rls`). It checks the kernel's own datasets too, so a kernel table you changed
(a column a dataset reads that you dropped, say) fails the deploy until you adjust the dataset. A joined table with no `tenant_id` (`users`) is shared: it is allowed and the output names it. It names the dataset and says what to change, stops
with a non-zero code, and on success says how many datasets and actions it verified.

It needs a migrated database, so it is not part of `composer check`, which runs before one exists in CI. Run it after `migrate`.

## Actions

A package declares its actions with an `ActionProvider`, bound and tagged `data.actions`:

```php
$this->app->tag([NotesData::class], ['data.datasets', 'data.actions']);
```

| Contract | What it is |
| -------- | ---------- |
| `Contracts\ActionProvider` | `operations()`: the list of `Operation` the package declares |
| `Contracts\Operations\Operation` | one action: key, label, permission, fields, handler, summary, flag, feature and `duringImpersonation` |
| `Contracts\Operations\Field` | one input, built with `Field::string('name')->max(120)->required()` |
| `Contracts\PerformsAction` | the handler: `perform($input, $viewer)` calls the module's own Action and answers an `OperationResult` |
| `Contracts\Operations\OperationResult` | the dataset, the id and the dashboard page of what was made or changed |
| `Contracts\OperationCatalog` | `all()` and `find($key)` |

A `Field` says an input once and gives both what Laravel validates and what a model is shown: `rules()` and `schema()`.
`Field::string('name')->max(120)->required()` is `['required', 'string', 'max:120']` and `{"type": "string", "maxLength": 120}`.
An enum is `Rule::enum()` and its values, a date `date_format:Y-m-d` and `{"type": "string", "format": "date"}`, an id of a
record `uuid` and a description that names the dataset it points at. A field is optional unless `required()`, and it holds null
only when `nullable()`. `also()` adds rules of the module's own (the ones its API request uses). `Operation::schema()` is the
whole input as a closed JSON Schema object: only the declared fields, all the required ones, `additionalProperties: false`.

`MoodKit\Data\Operations\OperationRegistry` checks the same things for an action (the key, a permission that exists, a label in
both languages, a handler that implements `PerformsAction`, one name for each field) and one more: **an action that deletes cannot
be declared.** A key with one of the words `delete`, `destroy`, `erase`, `remove`, `purge`, `wipe`, `void`, `drop`, `truncate` or `forget` in it (anywhere, joined by `.` or `_`, in any case) is refused
with `Contracts\Operations\OperationInvalid`, whatever the action is called otherwise. Only creates and edits can be declared. This is a guard on the **name**, not a guarantee about what the handler does: an action called
`cancel`, `revoke` or `archive` passes the check, and so does one named `update` whose handler deletes. The author of a module is
responsible for what the handler's Action does, and the review of an action is where that is checked.

A field that carries a password or a secret is not trimmed by the runner (see below): name it `password`, `password_confirmation` or
`current_password`, or mark it with `Field::string('pin')->secret()`.

## Running an action

`MoodKit\Data\Contracts\RunsOperations` runs an action as a person:

```php
$result = resolve(RunsOperations::class)->run('projects.create', ['name' => 'Roof repair', 'dueOn' => '2027-03-01'], new Viewer($tenantId, $userId));
```

It answers the handler's `OperationResult` (the dataset, the id and the dashboard page of the record), after checking, in this order:

1. The action exists, or `OperationUnknown`.
2. The request works in the viewer's workspace and is signed in as the viewer, or `WrongWorkspace` or `WrongViewer`. The permission checked and
   the audit entry the module's Action writes then name one person.
3. The session is not a super admin's acting as the person, unless the action says `duringImpersonation: true`, or
   `Support\Errors\ImpersonationForbidden` (403 `auth.impersonation_forbidden`, what the `not-impersonating` middleware answers). Say
   `true` only for what the action's own HTTP route allows with `impersonation-allowed`: the kernel's two do (`projects.create` and
   `projects.update`), and `OperationImpersonationTest` compares each action with its route (`<package>.create` with `<package>.store`,
   `<package>.update` with `<package>.update`). Money, the account and anything the person keeps stay `false`, the default.
4. The person holds the action's permission, its platform flag is on for the workspace and its plan includes its feature, or
   `OperationForbidden`. This comes before the input is looked at, so someone who may not run an action learns nothing of its fields.
5. The input is read as the HTTP stack reads a request: a string is trimmed and an empty one is `null`, so `""` means what it means in the API.
   A field named `password`, `password_confirmation` or `current_password` (or marked `secret()`) is not trimmed, as `TrimStrings` does not
   trim it; an empty one is still `null`.
   Then it is valid. Laravel validates it with the rules of the fields and answers a `ValidationException` with the error of each
   field. **A key that is not one of the fields is refused too**, by name, and nothing of it reaches the handler: an action takes
   nothing it did not declare (the workspace, a deletion date, a column the API never takes).
6. The handler runs, with the input the fields kept, in the workspace's context that is already there. It calls the module's own
   Action, so the module's rules apply as they do in the API: a branch the person may not use, a record of another workspace or of a
   branch out of sight that is not found.

The runner does not audit and does not ask for a confirmation. The module's Action writes the audit entry, naming whoever the request
is signed in as, so run an action in the request of the person it is run for. Like the reader, the runner works inside a request only.

A caller that shows a confirmation card asks `RunsOperations::summarize($key, $input, $viewer)`, which makes the same checks as `run()`
(the request's viewer, the impersonation rule, the permission, the flag, the feature and the input) and then answers the action's
summary line, written in the language of the request. The summary closure of an `Operation` is private to the runner: nothing else
calls it, so what it reads (the name of a project, say) is never given to someone who may not run the action.

### The kernel's actions

| Key | Package | Permission | Flag | Fields |
| --- | ------- | ---------- | ---- | ------ |
| `projects.create` | Projects | `projects.manage` | `projects.enabled` | `name` (required), `description`, `status`, `dueOn`, `branchId` ([Projects](projects.md#actions)) |
| `projects.update` | Projects | `projects.manage` | `projects.enabled` | `id` (required), and the same as `projects.create`, all optional |

Clients, Team and Branches declare no action: only what a module needs is declared.

## Errors

| Class | When | Status |
| ----- | ---- | ------ |
| `Errors\DatasetUnknown`, code `data.dataset_unknown` | no package declares that key | 404 |
| `Errors\DatasetForbidden`, code `data.dataset_forbidden` | the person lacks the permission, the flag is off or the feature is not in the plan; or asked for a column that is not declared or that they may not see | 403 |
| `Errors\OperationUnknown`, code `data.operation_unknown` | no package declares that key | 404 |
| `Errors\OperationForbidden`, code `data.operation_forbidden` | the person lacks the permission, the flag is off or the feature is not in the plan | 403 |
| `Support\Errors\ImpersonationForbidden`, code `auth.impersonation_forbidden` | a session of a super admin acting as the person ran an action that does not allow it | 403 |
| `Errors\WrongWorkspace` | a read or a run for a workspace that is not the one the request works in: a mistake in the caller's code | none: it is reported, never shown |

Each is a `DomainError` with a message in English and Spanish under `data::errors`.
