# Data

What a module declares as readable and as doable, said once and checked by the kit. Data keeps no tables. It holds two registries: the
**datasets** each package declares (the description of a read view of its records: which columns, behind which permission) and the
**actions** each package declares (a create or an edit, through the module's own Action). Data knows no package that registers one.

These are declarations: metadata and nothing else. The kit does not read a row through a dataset and does not run an action as a person.
What it does with them is check them: the tests of a module, and `php artisan data:verify`, which stops a deploy on a dataset or an
action that cannot work. Declarations are also what the paid Mood Kit AI add-on reads; the kit itself needs no add-on.

Data depends on Rbac (to check that a permission exists) and Tenancy (to check row-level security). A package that declares a
dataset or an action reaches Data only through `MoodKit\Data\Contracts\*`, as every package reaches another.

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
| `Contracts\Viewer` | the person a scope or a summary is for: a workspace id and a user id |
| `Contracts\DatasetCatalog` | `all()` and `find($key)`: what exists, checked on first use |

A scope's `narrow()` takes and answers the Eloquent builder as `Illuminate\Contracts\Database\Eloquent\Builder`, the contract that keeps
the `Contracts\` namespace free of the database layer. It calls `where()` and the rest as on an Eloquent builder. A scope only narrows:
it adds conditions to the query it was given and never takes any away.

A `Dataset` has:

| Field | What it is |
| ----- | ---------- |
| `key` | `<package>.<what>` in lowercase (`projects.projects`), unique among every dataset |
| `label`, `description` | translation keys with a line in English and in Spanish. The description says what the records are, in a line |
| `source` | a closure that returns an Eloquent query and already leaves out what must never be seen: the trash, a client erased for privacy |
| `permission` | required: the permission a person needs to read it, declared by some package |
| `scope` | optional: a class that implements `DatasetScope` |
| `columns` | the only columns the dataset declares. Each has a name, a type, a label and, when it is not the column of that name in the source's table, an `expression` (`users.name`) |
| `metrics` | `count`, or `sum:`, `avg:`, `min:` or `max:` over a column that is `int`, `decimal` or `money` |
| `relations` | the links to other datasets, by a column of its own |
| `link` | the dashboard page of one row, with `{id}` where its id goes (`/dashboard/notes/{id}`) |
| `flag`, `feature` | the platform flag and the plan feature that must allow it for the workspace |

A column with no label of its own takes `<the dataset's label key without ".label">.columns.<name>`: with the label key
`notes::data.notes.label`, the column `title` is `notes::data.notes.columns.title`, and both languages need that line.

A column marked `->sensitive('clients.export')` (an email, a phone, notes) declares that only someone who holds that
permission may see it. `->sensitive()` with no permission is for nobody.

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

## Verifying

`php artisan data:verify` runs in every deploy (after `platform:verify`, see the
[production checklist](../configuration/production.md)) and in CI, after the migrations. It builds both registries, so a bad
declaration stops the deploy. Then it builds each dataset's query and runs it for no rows (`limit 0`, in a transaction that cannot write
and is rolled back), which fails on a column or an expression its table does not have, and checks that the table the dataset reads,
and every table it joins by name that has a `tenant_id`, has forced row-level security (the same check as `tenancy:verify-rls`). To
build the query it uses a small class of Data's own, `DatasetProbe`, marked `@internal`: it checks no permission, adds no filter of a
workspace and returns no row, and it is not a contract of the kit.

It checks the kernel's own datasets too, so a kernel table you changed (a column a dataset reads that you dropped, say) fails the deploy
until you adjust the dataset. A joined table with no `tenant_id` (`users`) is shared: it is allowed and the output names it. It names the
dataset and says what to change, stops with a non-zero code, and on success says how many datasets and actions it verified.

It needs a migrated database, so it is not part of `composer check`, which runs before one exists in CI. Run it after `migrate`.

## Actions

A package declares its actions with an `ActionProvider`, bound and tagged `data.actions`:

```php
$this->app->tag([NotesData::class], ['data.datasets', 'data.actions']);
```

| Contract | What it is |
| -------- | ---------- |
| `Contracts\ActionProvider` | `operations()`: the list of `Operation` the package declares |
| `Contracts\Operations\Operation` | one action: key, label, permission, fields, handler, summary, flag, feature and `duringImpersonation`. The summary closure is private to the declaration |
| `Contracts\Operations\Field` | one input, built with `Field::string('name')->max(120)->required()` |
| `Contracts\PerformsAction` | the handler: `perform($input, $viewer)` calls the module's own Action and answers an `OperationResult`. It stays with the module |
| `Contracts\Operations\OperationResult` | the dataset, the id and the dashboard page of what a handler made or changed |
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

A field that carries a password or a secret is declared so: name it `password`, `password_confirmation` or `current_password`, or mark it
with `Field::string('pin')->secret()`.

`duringImpersonation` says whether a super admin acting as the person may use the action. It is `false` unless the action's HTTP route
allows it with `impersonation-allowed`: the kernel's two do (`projects.create` and `projects.update`), and `OperationImpersonationTest`
compares each action with its route (`<package>.create` with `<package>.store`, `<package>.update` with `<package>.update`). Money,
the account and anything the person keeps stay `false`, the default.

### The kernel's actions

| Key | Package | Permission | Flag | Fields |
| --- | ------- | ---------- | ---- | ------ |
| `projects.create` | Projects | `projects.manage` | `projects.enabled` | `name` (required), `description`, `status`, `dueOn`, `branchId` ([Projects](projects.md#actions)) |
| `projects.update` | Projects | `projects.manage` | `projects.enabled` | `id` (required), and the same as `projects.create`, all optional |

Clients, Team and Branches declare no action: only what a module needs is declared.
