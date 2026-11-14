# Attach data to branches

A module often keeps something about each branch of a workspace: its closures and holidays, the services and prices it
offers, the cash register's daily cuts, the bookings made there. This guide shows how to hang it from a branch so that
no workspace can point at another's, what to do when the branch is deleted, how to read the branches without touching
Branches' models, and how to react when one closes.

## 1. The table

Give the table `tenant_id` and `branch_id`, with a composite foreign key to `branches (tenant_id, id)`, and turn on
row-level security. `branches` has a unique index on `(tenant_id, id)` for this: Postgres checks that the branch is one of
the same workspace, even if your code forgets to.

Choose what happens when the branch is deleted:

- **`cascadeOnDelete()`** for what is only the branch's and means nothing without it (its menu of services, its
  closures): it goes with the branch, in the same transaction.
- **`restrictOnDelete()`** for what must not be lost (past bookings, cash cuts, invoices): Postgres refuses the deletion,
  Branches answers 409 `branches.in_use`, and the branch's page suggests deactivating it instead. A key with no action
  (the default when you name neither) refuses it the same way, deferred to the commit or not: the deletion makes every
  constraint immediate (`SET CONSTRAINTS ALL IMMEDIATE`) before it deletes.

Branches keeps no closures, holidays or exceptions: what one is (the whole day or part of it, once or every year, who sees
it) depends on the module that uses it. A module that needs them keeps a table like this one, one closure per day:

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use MoodKit\Support\Database\TenantRls;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_closures', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('branch_id');
            $table->date('date');
            $table->string('reason', 120)->nullable();
            $table->timestampsTz();
            $table->unique(['tenant_id', 'branch_id', 'date']);
            $table->foreign(['tenant_id', 'branch_id'], 'branch_closures_branch_foreign')
                ->references(['tenant_id', 'id'])->on('branches')->cascadeOnDelete();
        });

        TenantRls::enable('branch_closures');
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_closures');
    }
};
```

`TenantRls::enable()` turns on row-level security with `FORCE`, and `php artisan tenancy:verify-rls` fails the build on a
tenant table without it. A row that hangs from a member as well (who works a shift at a branch) adds `user_id` with a
second composite key to `memberships (tenant_id, user_id)` that cascades, as
[Attach data to members](attach-data-to-members.md) shows.

Deactivating a branch keeps every row: it is still the workspace's branch, only out of work.

## 2. Reading the branches

Read the branches through `MoodKit\Branches\Contracts\ReadsBranches`, asked as the workspace with its id first, never
through Branches' models or tables:

| Method | Answers |
| ------ | ------- |
| `find($tenantId, $branchId)` | a `BranchSummary`, or null (another workspace's branch, or not an id) |
| `allActiveForSystem($tenantId)` | every active branch, oldest first, as `BranchSummary`, for the system itself (a job, a schedule, a public page); never shown to a person as it is |
| `visibleTo($tenantId, $userId)` | the active branches that person may see, oldest first: what a module lists to a person |
| `hours($tenantId, $branchId)` | the branch's week (Support's `WeeklyHours`), or null when it said none |
| `members($tenantId, $branchId)` | the user ids of who works there |
| `branchesOf($tenantId, $userId)` | the ids of the branches someone works at |

`BranchSummary` carries what a module needs to work with a branch: `id`, `name`, `slug`, `isActive`, `timezone`,
`addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `latitude` and `longitude`. No phone, email or
notes: they are for people, on the branch's page.

A branch's hours are wall-clock times of **its own** timezone, not the workspace's. Turn a day into moments with the
branch's zone, and compare them with `timestamptz` columns in UTC:

```php
use Carbon\CarbonImmutable;
use MoodKit\Branches\Contracts\ReadsBranches;

$branch = $branches->find($tenantId, $branchId);           // ?BranchSummary
$day = $branches->hours($tenantId, $branchId)?->day($date->isoWeekday());
$opens = $day === null ? null : CarbonImmutable::parse("{$date->toDateString()} {$day->startsAt}", $branch->timezone)->utc();
$closes = $day === null ? null : CarbonImmutable::parse("{$date->toDateString()} {$day->endsAt}", $branch->timezone)->utc();
```

To show each person only the records of the branch they work at, and never one of a branch they may not see, see
[Scope data by branch](scope-data-by-branch.md): lists narrow with Tenancy's `CurrentBranch`, a record is checked with
`BranchAccess`.

Null hours mean the branch said none, which is not "always closed": decide what it means in your module. Who can work a
slot at a branch is the cross of three readings: `ReadsBranches::members()` (who works there), Team's
`ReadsWorkingHours::weekly()` (each one's week, in the workspace's zone) and `ReadsBranches::hours()` (when the branch
opens, in its zone). A member's week is one for every branch they work at.

## 3. Reacting to a branch that closes

Branches sends three events, after the commit:

- `MoodKit\Branches\Events\BranchDeactivated` (`tenantId`, `branchId`, `byUserId`): the branch stopped taking work. Stop
  booking it, hide it from a public page.
- `MoodKit\Branches\Events\BranchReactivated` (`tenantId`, `branchId`, `byUserId`): it takes work again.
- `MoodKit\Branches\Events\BranchDeleted` (`tenantId`, `branchId`, `name`, `slug`, `byUserId`): it is gone, with its hours
  and people and your rows that cascade. It carries its name and slug, since there is nothing left to read.

A listener that writes runs in a queued job or a request of its own; one that runs with no request enters the workspace
with `RunAsTenant`.

## 4. Showing it

A section on a branch's page is the `branches` layer's work: in this version it has no hook for other layers' sections,
so a module shows its data on a page of its own and links to the branch (`/dashboard/branches/{id}`). On a member's page, a
module adds a section through core's `kit:team:member-sections`, as [Attach data to members](attach-data-to-members.md)
shows.

## 5. The routes

Give the module's routes `permission:branches.manage` to change a branch's data (or a permission of the module's own), a
named limiter, and decide whether a super admin acting as someone may use them: every new write route of the `workspace`
group goes in one of the two lists of `backend/tests/Architecture/ImpersonationRoutesTest.php`, which fails until it does.
Branches lets an impersonation change a branch's data, hours and people (support may need to; the trail names the admin)
and refuses it a new branch and a branch's status.

Look the branch up with `ReadsBranches::find()` and answer your own 404 when it is null. Write your rows inside a
transaction and let the composite foreign key guard the branch: Postgres locks the branch's row while it checks the key,
so a deletion of the branch at the same moment waits for your insert, then refuses or cascades.
