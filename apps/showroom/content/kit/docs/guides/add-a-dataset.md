# Add a dataset

This guide declares the records of a module of your own as a dataset: a read view that says which columns may leave it and
who may read them. The example is the tickets of a `Tickets` package. What a dataset is and what the registry checks is in
[Data](../packages/data.md).

A dataset is the one place that says what a person may read of a module. The module's tests read through it to prove two
workspaces never see each other's rows, `php artisan data:verify` stops a deploy on one that cannot work, and an assistant add-on can
read only what datasets declare.

## Before you start

- You have a backend package, here `backend/packages/Tickets` with the namespace `MoodKit\Tickets\`, a `Ticket` model on a table
  with a `tenant_id` and forced row-level security, and the permission `tickets.view`. To create a package, follow "Packages"
  in `AGENTS.md`.
- Its `composer.json` requires `"mood-kit/data": "@dev"`. Your package reaches Data only through `MoodKit\Data\Contracts\*`.
- If tickets belong to a branch, read [Scope data by branch](scope-data-by-branch.md) first: the dataset follows the same rule.

## 1. The provider

In `backend/packages/Tickets/src/TicketsData.php`:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Tickets;

use MoodKit\Data\Contracts\Datasets\Column;
use MoodKit\Data\Contracts\Datasets\Dataset;
use MoodKit\Data\Contracts\Datasets\Relation;
use MoodKit\Data\Contracts\DatasetProvider;
use MoodKit\Tickets\Data\TicketsScope;
use MoodKit\Tickets\Enums\TicketStatus;
use MoodKit\Tickets\Models\Ticket;

/** What Tickets offers to read: its tickets, by a person who has `tickets.view`. */
final readonly class TicketsData implements DatasetProvider
{
    public function datasets(): array
    {
        return [
            Dataset::make('tickets.tickets')
                ->label('tickets::data.tickets.label')
                ->description('tickets::data.tickets.description')
                ->source(static fn () => Ticket::query())
                ->permission('tickets.view')
                ->scope(TicketsScope::class)
                ->columns([
                    Column::id('id'),
                    Column::string('subject'),
                    Column::enum('status', TicketStatus::class),
                    Column::datetime('created_at'),
                    Column::id('branch_id'),
                    Column::text('notes')->sensitive('tickets.manage'),
                ])
                ->metrics(['count'])
                ->relations([Relation::belongsTo('branch', 'branches.branches', 'branch_id')])
                ->link('/dashboard/tickets/{id}'),
        ];
    }
}
```

- The key is `<package>.<what>` in lowercase and nobody else uses it.
- `source` is a closure that returns an Eloquent query, and it already leaves out what nobody may see: the trash (a model with
  soft deletes does it by itself), a record erased for privacy, a record merged into another. It is the module's place to
  decide that, because only the module knows what its records are.
- Only the columns you list exist for a reader. Leave out internal columns, ids of other tables that mean nothing alone and
  timestamps of the system. A column reads the column of that name in the source's table; for anything else give an
  expression: `Column::string('name')->expression('users.name')`.
- `->sensitive('tickets.manage')` keeps a column (an email, a phone, notes) from anyone who does not hold that permission.
  `->sensitive()` with no permission keeps it from everyone.
- A `flag('tickets.enabled')` makes the platform flag of the module gate the dataset, and a `feature('tickets_pro')` the plan's
  feature, as they gate the routes.
- `metrics` are `count`, and `sum:<column>`, `avg:<column>`, `min:<column>` or `max:<column>` over a column that is `int`,
  `decimal` or `money`.

## 2. The scope

A scope is the module's rule of who sees which row. It runs first, and the reader then wraps everything the source and the scope asked for in one group and ANDs the workspace's own filter to it, so a scope only narrows. Take the
branches the person may see from `BranchAccess` (not from the branch chosen in the top bar: a reader asks about
everything the person is allowed to see):

```php
<?php

declare(strict_types=1);

namespace MoodKit\Tickets\Data;

use Illuminate\Contracts\Database\Eloquent\Builder;
use MoodKit\Data\Contracts\DatasetScope;
use MoodKit\Data\Contracts\Viewer;
use MoodKit\Tenancy\Contracts\BranchAccess;

/** The tickets a person sees: those of the branches they may see, and those of none. */
final readonly class TicketsScope implements DatasetScope
{
    public function __construct(private BranchAccess $access) {}

    public function narrow(Builder $query, Viewer $viewer): Builder
    {
        $ids = $this->access->visibleTo($viewer->tenantId, $viewer->userId);

        return $ids === null ? $query : $query->where(static fn ($seen) => $seen->whereNull('tickets.branch_id')->orWhereIn('tickets.branch_id', $ids));
    }
}
```

`visibleTo()` is `null` when nothing is narrowed (the person sees every branch, or the workspace does not work by branch) and a
list of ids otherwise, which may be empty. A dataset with no `scope` shows every row of the workspace to whoever holds its
permission: say so on purpose, as the team's does.

## 3. The words

Both languages need the lines, or the registry refuses the dataset. In `lang/en/data.php`:

```php
return [
    'tickets' => [
        'label' => 'Tickets',
        'description' => 'The support tickets of the workspace, one per request, with their status and branch.',
        'columns' => [
            'id' => 'Id', 'subject' => 'Subject', 'status' => 'Status', 'created_at' => 'Created', 'branch_id' => 'Branch', 'notes' => 'Notes',
        ],
    ],
];
```

and the same in `lang/es/data.php`. The description is what a reader of the catalog sees, so say what a row is.

## 4. Register it

In `TicketsServiceProvider::register()`:

```php
$this->app->tag([TicketsData::class], 'data.datasets');
```

## 5. Test it

Read the dataset through `MoodKit\Data\Contracts\ReadsDatasets`, as a person of workspace A that has a second workspace B with rows
of its own, with the request acting as A (`$this->actingAsTenant($alpha)`):

```php
$rows = resolve(ReadsDatasets::class)->rows('tickets.tickets', new Viewer($alpha->id, $olga->id), ['subject']);

expect(array_column($rows->rows, 0))->toBe(['Alpha ticket'])->and($rows->total)->toBe(1);
```

The test proves four things: no row of B comes out, a person who works at another branch does not see the branch's rows (and does see
those of none), a sensitive column leaves only with its permission, and someone without `tickets.view` gets `DatasetForbidden`. If
the module has a platform flag, a read with the flag off is a `DatasetForbidden` too. The kernel's four datasets have such tests
(`ProjectsDatasetTest`, `ClientsDatasetTest`, `BranchesDatasetTest`, `TeamDatasetTest`): copy the nearest one.

Then run `php artisan data:verify` on a migrated database. It builds the query of your dataset for no rows, so a column that its table
does not have fails there and not in front of someone.
