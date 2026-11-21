# Add a platform flag

A **platform flag** switches something of a module on or off for the whole platform (a kill switch), or releases it to a
share of the workspaces the platform's admin chooses (a gradual rollout). It is the platform's decision, made on the admin
host, and it is not what a plan includes: that is a plan's feature (see
[Add a quota or a feature flag](add-a-quota-or-feature.md)). See [Platform](../packages/platform.md#platform-flags) for what
the package does with them.

| Use | When |
| --- | ---- |
| a feature of a plan (`feature.enabled:<slug>`) | the workspace pays for it: it comes with some plans and not with others |
| a platform flag (`platform-flag:<slug>`) | you need to turn it off everywhere at once, or try it on some workspaces before all |

A route can take both: the plan says whether the workspace bought it, the flag whether the platform serves it today.

## 1. Declare it

```php
use MoodKit\Platform\Contracts\PlatformFlag;
use MoodKit\Platform\Contracts\PlatformFlagProvider;

final readonly class ReportsPlatformFlags implements PlatformFlagProvider
{
    public function flags(): array
    {
        return [
            new PlatformFlag('reports.export', 'reports::flags.export.label', 'reports::flags.export.description', default: false, rollout: true),
        ];
    }
}

// In the module's service provider:
$this->app->tag([ReportsPlatformFlags::class], 'platform.flags');
```

- The slug is `<package>.<what>`, lower case (letters, digits and `_`), and unique across packages. The registry refuses
  anything else the first time it is built, and `php artisan platform:verify` builds it in every deploy, so the mistake
  stops the deploy.
- The label and the description are translation keys with an `en` and an `es` line (`PlatformTranslationsTest`): the admin's
  Flags page shows them.
- `default` is the state until an admin changes it. `rollout: true` lets the admin give it to a percentage of the
  workspaces instead of all of them; without it, the flag is only on or off.

Your module depends on Platform for this: a package of the kernel never does (the kernel's one flag, `platform.impersonation`,
is Platform's own).

## 2. Guard a route, or ask

```php
Route::middleware(['workspace', 'permission:reports.view', 'platform-flag:reports.export'])->post('reports/export', ExportController::class);

if ($flags->enabled('reports.export', $tenantId)) { /* ChecksPlatformFlags, from a job or your own check */ }
```

`platform-flag:<slug>` answers 503 `platform.flag_off` (with `meta.flag`) while the flag is off for the request's workspace.
`Platform\Contracts\ChecksPlatformFlags::enabled($slug, $tenantId)` answers the same in code. A flag nobody declares is off.

How a flag answers, in this order:

- the workspace's exception, if the admin set one: forced on or off, whatever the rest says (see
  [Force a flag for a workspace](force-a-flag-for-a-workspace.md)). Asked with no workspace, exceptions do not count;
- off: off for every workspace;
- on, with no rollout (or a rollout of 100): on for every workspace;
- on, with a rollout of `n`: on for the workspaces whose bucket, `crc32("<slug>:<workspace id>") % 100`, is below `n`. The
  bucket is stable, so a workspace keeps its answer while the percentage only grows, and each flag spreads the workspaces
  differently. Asked with no workspace, a rollout under 100 is off.

So a flag that is off, or rolled out to 0, can still be on for one workspace (a customer in a beta), and a flag that is on can be
off for one.

## 3. Read it in the frontend

`GET /me` carries `platformFlags`, every declared flag by slug with its answer for the workspace
(`{"reports.export": false, "platform.impersonation": true}`): show or hide what the flag guards from it. The route stays
the guard: the frontend only follows it.
