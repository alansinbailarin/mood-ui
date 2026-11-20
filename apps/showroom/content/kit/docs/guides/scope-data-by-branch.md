# Scope data by branch

Once a workspace has two active branches or more, each person works at one branch at a time, or at every branch, and
chooses it in the switcher at the top of the sidebar. A module whose records belong to a branch (bookings, cash cuts, a branch's customers) shows
each person the records of the branch they work at, and never a record of a branch they may not see. This guide shows how,
with the two contracts every package and module uses: Tenancy's `CurrentBranch` (the branch of this request) and
`BranchAccess` (who sees which branch).

The rule, in one line: a list narrows with `CurrentBranch`, a record is checked with `BranchAccess`, and the server never
takes the branch from the client as a scope.

## 1. Decide what follows the branch

Not everything does. Write down, in your module's plan, what follows the branch and what does not:

- **Follows it:** what is done at a branch and only makes sense there: a booking, a cash cut, a branch's stock.
- **Does not:** what belongs to the whole workspace: its settings, its catalog of services (unless each branch has its
  own), its customers when they visit every branch.

The kernel's own choices are listed in `AGENTS.md` ("Branch scope"): the team list, the branches, the inbox and the
notifications follow it; settings, roles, the plan and billing, the profile and the onboarding do not.
The global search follows it source by source, as each list does ([Add a search source](add-a-search-source.md#3-following-the-branch)), and so do the dashboard's widgets, each as its list
([Add a dashboard widget](add-a-dashboard-widget.md#3-following-the-branch)); the plan's widget never does.

## 2. The table

A record of a branch has `branch_id`, with the composite foreign key to `branches (tenant_id, id)`. See
[Attach data to branches](attach-data-to-branches.md).

## 3. A list

Ask `MoodKit\Tenancy\Contracts\CurrentBranch` for the scope of the request, and narrow by `branchIds()`:

```php
use Illuminate\Database\Eloquent\Builder;
use MoodKit\Tenancy\Contracts\CurrentBranch;

public function __construct(private CurrentBranch $branch) {}

$branches = $this->branch->scope()->branchIds(); // null, [] or [id]

$appointments = Appointment::query()
    ->where('tenant_id', $tenantId)
    ->when($branches !== null, fn (Builder $query): Builder => $query->whereIn('branch_id', $branches))
    ->latest('starts_at')
    ->paginate(25);
```

| `scope()->mode` | `branchIds()` | The list keeps |
| --------------- | ------------- | -------------- |
| `workspace` | `null` | everything: the workspace does not work by branch, or nobody is signed in |
| `all` | `null` | everything: the person sees every branch and chose "All branches" |
| `branch` | `[id]` | the records of that branch |
| `none` | `[]` | nothing of a branch: the person works at no branch they may see (`whereIn` with `[]` matches nothing) |

The server works the scope out on every request from the person's own choice, checked again against what they may choose
now (a closed branch, one they left, "All branches" without `branches.all` all fall back). Your code never checks the
choice itself.

A filter of your own screen that names a branch (a report "of Centro") is something the person chooses, not their access:
check it with `BranchAccess::allows()` before you use it, and answer a branch they may not see as one that is not there.

**A record whose branch is optional.** Some records belong to a branch or to the whole workspace: a client's home branch
may be none. Then a list keeps the records of the branch **and** those of no branch, and `none` keeps only those of no
branch. Clients does it this way (`Scope\ClientVisibility::narrow()`), with a filter of its own for "every branch I see":

```php
use MoodKit\Support\Database\Ids;
use MoodKit\Tenancy\Contracts\BranchAccess;
use MoodKit\Tenancy\Contracts\CurrentBranch;

// null: the top bar's branch; 'visible': every branch the person may see; else one branch, checked.
if ($filter !== null && $filter !== 'visible') {
    $branchId = Ids::canonical($filter);

    return $this->access->allows($tenantId, $userId, $branchId)
        ? $clients->where('home_branch_id', $branchId)
        : throw new BranchNotAllowed('branch'); // 422 for a branch they do not work at, another's or none (to someone who sees every branch, it lists nobody)
}

$ids = $filter === null ? $this->branch->scope()->branchIds() : $this->access->visibleTo($tenantId, $userId);

return $ids === null ? $clients : $clients->where(fn (Builder $seen): Builder => $seen
    ->whereNull('home_branch_id')->orWhereIn('home_branch_id', $ids));
```

`visibleTo()` gives the ids of every branch the person may see, closed ones included (null for every branch): what "my
branches" means for records, which may belong to a branch that closed. To show those branches to the person by name, ask
`ReadsBranches::visibleTo()` (the active ones). See [Clients](../packages/clients.md#following-the-branch) for the whole
table of what follows the branch there.

## 4. One record

```php
use MoodKit\Tenancy\Contracts\BranchAccess;

if (! $this->access->allows($tenantId, $userId, $appointment->branch_id)) {
    throw new AppointmentNotFound; // the same 404 as one that does not exist
}
```

`allows()` is true for everyone while the workspace does not work by branch, and for whoever sees every branch
(`seesAll()`); anyone else may see the records of the branches they work at, active or not. `visibleTo()` gives those
branches' ids (null for every branch), for a query that needs them all at once.

## 5. Creating

The branch of a new record comes in the body, and is checked with `allows()` (and that it is an active branch of the
workspace, through `ReadsBranches::find()`). The form may start from the branch the person works at (`useCurrentBranch()`
on the frontend), but the server never takes it from the switcher without checking it.

## 6. The audit trail and notifications

- Audit: `AuditLog::record(..., branchId: $appointment->branch_id)`: the branch of the record, never the one the person
  works at in the switcher. A module reads a branch's trail with `AuditTrail::forBranch()`, after `allows()`.
- Notifications: `new NotificationRequested(..., branchId: $appointment->branch_id)`. Mark the event type
  `branched: true` if the workspace may send it to "the people of the branch". No member who may not see that branch gets
  it, whatever audience brings them.
- Domain events of your module carry `branchId`, so a listener knows which branch without reading the record again.

## 7. Jobs and commands

With nobody signed in there is no branch in the switcher: `CurrentBranch` is `workspace`. A job that does something of one
branch receives its id, and a job that acts for a person checks `allows()` with that person's id.

## 8. The frontend

Read where the person works with core's `useCurrentBranch()` (to say "Showing Centro", or to start a form), and load a list
again when it changes with `useBranchReload(reload)`, passing the function that loads your list again. Never send the
branch to the API as a scope: the server knows it.

## 9. Tests

Bind `MoodKit\Tenancy\Testing\FakeBranches` to test your module without the Branches package's tables:

```php
use MoodKit\Tenancy\Contracts\BranchScope;
use MoodKit\Tenancy\Testing\FakeBranches;

FakeBranches::bind(BranchScope::branch($centro), [$centro => [$max->id]], seeAll: [$olga->id]);
```

Test the four modes (`branch`, `none`, `all`, `workspace`), a record of a branch the person may not see (the same 404),
and one test with the real Branches package for `none` (someone who works at no branch).

Never read `branch_members`, `branch_selections` or the `branches.all` permission yourself: `BranchScopeTest` fails the
build when a package other than Branches names them, or the backend's own `app/`, `routes/`, `config/` or `database/` (its
seeders included), even split into literals joined by a dot (`'branches.'.'all'`). To list branches to a person, ask
`ReadsBranches::visibleTo()`; `allActiveForSystem()` is for the system and knows nobody.
