# Add a quota or a feature flag

A module limits how many of something a workspace may create with a **quota resource**, and turns a whole feature on per
plan with a **feature flag**. Both are declared by a provider of the module, and every plan of the catalog then says
what it gives. See [Plans](../packages/plans.md) for what the package does with them.

## 1. Declare them

```php
use MoodKit\Plans\Contracts\FeatureFlag;
use MoodKit\Plans\Contracts\FeatureFlagProvider;
use MoodKit\Plans\Contracts\QuotaPeriod;
use MoodKit\Plans\Contracts\QuotaResource;
use MoodKit\Plans\Contracts\QuotaResourceProvider;

final readonly class ReportsPlans implements QuotaResourceProvider, FeatureFlagProvider
{
    public function quotaResources(): array
    {
        return [new QuotaResource('dashboards', 'reports::quotas.dashboards', DashboardsCounter::class, QuotaPeriod::Total)];
    }

    public function features(): array
    {
        return [new FeatureFlag('reports', 'reports::features.reports', 'reports::features.reports_description')];
    }
}

// In the module's service provider:
$this->app->tag([ReportsPlans::class], ['plans.quota_resources', 'plans.features']);
```

- Branches' `branches` (`BranchesPlansProvider`, counted by `ActiveBranchesCounter`) is another example of a package's
  resource: it counts only the rows still in use (active branches), so deactivating one frees its place.
- Slugs are snake case, at most 64 characters, and unique across packages.
- Every label and description key has an `en` and an `es` line (`PlansTranslationsTest`).
- The counter implements `QuotaCounter::count($tenantId, $from, $until)`. It runs as the workspace, inside the
  transaction that is about to create one more, and counts what that transaction sees. `QuotaPeriod::Monthly` counts
  what was made this calendar month, in UTC (`$from` is the first instant of the month, `$until` the first of the next).
- `order` sorts resources and features on the subscription page.
- `retiredPlanLimit` is the limit of the resource on the plans the config does not have (the ones taken out of it and the
  ones made in the admin): the config cannot name them, so `plans:sync` writes it for them. `null` (the default) is no
  limit, so a workspace kept on an old plan is not locked out of what your module brings; pass a number to cap it there.

## 2. Give every plan a value

In `backend/config/plans.php`, every plan lists the features it includes and a limit for every resource (`null` is no
limit), then run `php artisan plans:sync`. It refuses a catalog that names an unknown flag or resource, or that leaves a
resource out. A plan of the config takes the config's limit unless the super admin edited that limit in the admin (see
"The catalog in the database" in [Plans](../packages/plans.md)). The plans the config does not have, retired or made in the
admin, get the resource's `retiredPlanLimit` instead: set it in the admin's editor afterwards. A new feature stays off on
the plans made in the admin until the admin turns it on there.

## 3. Gate a route, or ask

```php
Route::middleware(['workspace', 'permission:reports.view', 'feature.enabled:reports'])->get('reports', ReportsController::class);

if (! $features->allows($tenantId, 'reports')) { /* ChecksFeatures, from a job or your own check */ }
```

`feature.enabled:<slug>` goes after `workspace` and `permission:`. A plan that does not include the feature answers 403
`plans.feature_not_included`, with `meta.feature`, `meta.plan` and `meta.upgradeAvailable` (whether an available plan of a
higher tier includes it); a route that names a feature nobody registers fails with a 500, so a typo never ships quietly.
`Plans\Contracts\ChecksFeatures::allows($tenantId, $feature)` answers the same for code that decides by itself, as the
workspace; a feature nobody registers is never allowed.

## 4. Enforce a quota

```php
DB::transaction(function () use ($tenantId, $data): Dashboard {
    $this->quotas->ensureCanCreate($tenantId, 'dashboards');   // EnforcesQuotas, before the insert

    return Dashboard::query()->create($data);
});
```

- Call it inside the transaction that creates, as the workspace: it locks the workspace's resource until that
  transaction ends, so two creations at once take turns and the second counts the first. Outside a transaction it throws,
  and so it does in a transaction stricter than `READ COMMITTED` (Postgres's default), which would not see what the other
  creation committed. Pass `adding:` (at least 1) when one request creates several.
- Over the limit it answers 422 `plans.quota_exceeded`, with `meta.resource`, `limit`, `used`, `plan`,
  `upgradeAvailable` (whether an available plan of a higher tier allows more) and `scheduledPlan`: while a move down to a
  smaller plan is scheduled for the end of the period, the lower limit of the two holds, and this names that plan.
- Only creating is refused: after a downgrade, what a workspace has over its limit stays.

## Seats a package reserves

The kernel's `members` quota counts active members and the places a package holds for people who are not members yet.
A package that takes such a place (Team's pending invitations) implements `Plans\Contracts\MemberSeats` and tags it
`plans.member_seats`:

```php
final readonly class PendingInvitationSeats implements MemberSeats
{
    public function reserved(string $tenantId): Builder
    {
        return Invitation::query()->where('tenant_id', $tenantId)->pending()->select('id');
    }
}

$this->app->tag([PendingInvitationSeats::class], 'plans.member_seats');
```

`reserved()` answers a query of the rows that each hold one place (`Illuminate\Contracts\Database\Query\Builder`, an
Eloquent or a query builder), never a number: the quota counts them in the same statement as the active members, so a
place that turns into a member at that moment is counted once. It is asked as the workspace, inside the transaction of
whoever is about to add someone, under the quota's lock. Hold a place by calling `ensureCanCreate($tenantId, 'members')`
before you write it, and let it go by no longer counting it. A change that turns a held place into a member (accepting an
invitation) takes the quota's lock with `EnforcesQuotas::hold($tenantId, 'members')`, after its own row locks, so a count
never sees half of it. To show where a workspace stands without creating anything, ask
`Plans\Contracts\ReadsQuotas::standing($tenantId, 'members')`.
