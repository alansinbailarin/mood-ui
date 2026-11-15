# Dashboard

The home of the dashboard: a card for each thing a person may want to know at a glance. Dashboard keeps no tables and knows
nothing of members, branches or clients. It holds a registry of **widgets**: each package declares its own, with the
permission and the plan feature it needs, and Dashboard gathers the ones a person may see.

Dashboard depends on Support, Tenancy, and the contracts of Auth, Rbac and Plans. No package depends on Dashboard except
through its contracts: a package that adds a widget implements `MoodKit\Dashboard\Contracts\*`, and Dashboard never names it.
Plans cannot register widgets (Dashboard depends on Plans), so the widget of the plan's usage belongs to Dashboard.

## Widgets

A widget is one card of the home. A package declares its widgets with a `DashboardWidgetProvider`, bound and tagged
`dashboard.widgets` from its service provider:

```php
$this->app->tag([NotesDashboardProvider::class], 'dashboard.widgets');
```

| Contract | What it is |
| -------- | ---------- |
| `MoodKit\Dashboard\Contracts\DashboardWidgetProvider` | `dashboardWidgets()`: the list of `DashboardWidget` the package declares |
| `MoodKit\Dashboard\Contracts\DashboardWidget` | one widget, field by field below |
| `MoodKit\Dashboard\Contracts\WidgetData` | `for($tenantId, $userId)`: the data of the widget, a JSON object with camelCase keys, or `null` when there is nothing to show now (the widget is left out) |

A `DashboardWidget` has:

| Field | What it is |
| ----- | ---------- |
| `key` | `<package>.<what>` in lowercase letters, digits and `_` (`clients.overview`), unique among every widget; the frontend registers its component under this key |
| `labelKey` | the translation key of the card's title, with a line in every language the kit speaks |
| `data` | the class that works out the data: it implements `WidgetData` and is resolved from the container |
| `size` | `small` (a third of a wide row), `medium` (two thirds) or `large` (the whole row); `small` by default |
| `order` | where the card goes among the others, smallest first (0 by default); widgets with the same order go by key |
| `permission` | the permission the person needs for the widget to be shown at all, as Rbac names it (`clients.view`), or `null` for any member |
| `feature` | the plan feature the workspace needs (null: none), a feature slug as Plans names them (`notes_premium`, no dots) |

A widget's data is asked as the workspace, by someone who has the widget's permission and feature. It should work out its
numbers **with the same rule as its package's own list** (its visibility, the branch, the trash), so the home never shows
what the list hides. Keep it cheap: counts and a few values, never a list of people.

The registry checks every widget on first use and fails loudly (`InvalidRegistry`) on a key that is not
`<package>.<what>` in lowercase, a key declared twice, a size other than the three, or data that does not implement
`WidgetData`.

## The kernel's widgets

| Key | Package | Permission | Size | Order | Data |
| --- | ------- | ---------- | ---- | ----- | ---- |
| `dashboard.plan_usage` | Dashboard | `subscription.view` | medium | 90 | the plan's name in the language of the request, and for each limit the installed packages register (in their order) its `resource`, `label`, `period`, `limit` (null: none) and `used` |

The plan widget is the workspace's whole: it never follows the branch, and it shows the same limit and use Plans holds
(`ReadsCatalog`, `ReadsPlan` and `ReadsQuotas`; the lower limit while a move to a lower plan waits). It belongs to
Dashboard, not to Plans, because Plans cannot depend on Dashboard (Dashboard asks Plans for the features of a plan). It is
declared by `MoodKit\Dashboard\KernelWidgets`, tagged `dashboard.widgets` from the service provider, after the packages'
counts. Its card is the dashboard layer's `DashboardPlanUsageWidget` (registered for `dashboard.plan_usage` by the layer's
`dashboard-home` plugin): the plan's name, and for each limit what is used with a bar colored by how full it is (core's
`quotaView`), or "used, no limit" when it has none.

## The route

`GET /api/v1/dashboard` is the home. Any signed-in member of the workspace may call it (`workspace`); it takes no permission
of its own, since each widget checks its own. It reads and writes nothing of its own, so a super admin acting as the person
may load it too.

For each widget, in the registry's order, Dashboard checks the widget's permission and feature first: a widget the person
may not see is never made nor asked, so it runs no query. The others are worked out as the person who asks, and a widget
that answers `null` has nothing to show and is left out:

```json
{
  "data": {
    "widgets": [
      { "key": "team.members", "label": "Team", "size": "small", "data": { "active": 4, "pending": 1 }, "failed": false },
      { "key": "notes.board", "label": "Notes", "size": "medium", "data": null, "failed": true }
    ]
  },
  "meta": {},
  "errors": []
}
```

`label` is the widget's `labelKey` in the language of the request, and `data` is always an object. A widget that fails does
not fail the home: it comes with `failed: true` and `data: null`, so the layer draws its card with a notice, and the others
still show. Dashboard reports the failure as `MoodKit\Dashboard\Errors\WidgetFailed`, with the widget's key, the exception's
class (and its SQLSTATE for a database error) and the file and line where it was thrown; never its message, which for a
database error holds the values of the query, and never the exception itself.

The answers hold what the widgets count for that person (the people of their branch, their clients), so they are kept out of
every cache and referrer (`Cache-Control: no-store, private`, `Referrer-Policy: no-referrer`), the limiter's refusal
included. The named limiter `dashboard` allows `per_minute` loads a minute to each member in each workspace; it counts apart
from every other route.

## The top bar's Create menu

The dashboard layer puts a **+** button in the top bar (a `kit:topbar:items` entry with order 8, between the search at 5 and
the bell at 10), an icon alone on desktop and on a phone. It opens a menu, **Create**, with what the layers let people create:
each layer pushes `{ id, order, labelKey, icon, to, permission, offWhileImpersonating? }` into `kit:topbar:actions`, and the menu lists the ones whose
permission the person has, by order. A person who may create nothing does not see the button. The permissions arrive with the
session, so the menu asks again when they change. An item opens the page that creates it, which still checks the plan itself. While a super admin
acts as the person, what is flagged `offWhileImpersonating` (New branch, New client, Invite: the API refuses them) is left out, and the button with it when nothing is left ([Add a dashboard widget](../guides/add-a-dashboard-widget.md#6-a-quick-action-in-the-top-bar)).

## For a module

- To put a card on the home, implement a `DashboardWidgetProvider` and tag it `dashboard.widgets`, with a `WidgetData` that
  counts with your list's own query ([Add a dashboard widget](../guides/add-a-dashboard-widget.md)).
- To offer something people create often from the top bar, register it with `kit:topbar:actions`.
- Depend only on `MoodKit\Dashboard\Contracts\*`, and add `"mood-kit/dashboard": "@dev"` to your package's composer.json.

## Reference

| Route | Middleware | What it does |
| ----- | ---------- | ------------ |
| `GET /api/v1/dashboard` | `workspace`, no-store, `throttle:dashboard` | the widgets the person may see, with their data |

| Config | Default | What it is |
| ------ | ------- | ---------- |
| `dashboard.per_minute` | `30` | loads of the home per member per minute (the named limiter `dashboard`) |
