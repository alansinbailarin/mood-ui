# Add a dashboard widget

This guide puts a card of a module of your own on the dashboard's home: a few figures, for the people who may see them. The
example is the bookings of a `Booking` package: how many are coming up in the next 7 days. How the home works is in
[Dashboard](../packages/dashboard.md).

## Before you start

- You have a backend package, here `backend/packages/Booking` with the namespace `MoodKit\Booking\` and a
  `BookingServiceProvider` that loads its translations under `booking`. To create one, follow "Packages" in `AGENTS.md`.
- Its records already have a list: a class, here `BookingSearch`, that builds the list's query for a person, with the
  list's permission (`booking.view`) on the route. The widget reuses that query; if your module has no list yet, write it
  first.
- Its composer.json requires `"mood-kit/dashboard": "@dev"` (and `"mood-kit/search": "@dev"`, for `RequestingPerson`). Your
  package reaches Dashboard only through `MoodKit\Dashboard\Contracts\*`, as Team, Branches and Clients do.

## 1. The data

A widget's data is a class that implements `MoodKit\Dashboard\Contracts\WidgetData`. It works out its figures with **its
list's own query**: the list already knows who may see what (its visibility, the branch, the trash), and a second query
written for the home could count what the list hides. Count the list's query, never page it.

If the list reads the branch bar (or anything else) from the current request instead of from `$userId`, ask
`RequestingPerson::mustBe($tenantId, $userId)` first in `for()`: a widget worked out for no one, or for someone else, then
throws instead of counting the whole workspace. Dashboard only calls a widget from its route, so this holds; a job or a
command that called it would not.

```php
<?php

declare(strict_types=1);

namespace MoodKit\Booking\Widgets;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use MoodKit\Booking\Dto\BookingQuery;
use MoodKit\Booking\Models\Booking;
use MoodKit\Booking\Records\BookingSearch;
use MoodKit\Dashboard\Contracts\WidgetData;
use MoodKit\Search\Contracts\RequestingPerson;

/**
 * booking.upcoming: the bookings the list would show the person with no filter (the branch of the top bar, never the trash),
 * and of those the ones that start in the next 7 days. Days in UTC, never the workspace's "today", which would need its time
 * zone. The list reads the branch bar from the current request, so the widget answers only for the person signed in
 * (RequestingPerson).
 */
final readonly class UpcomingBookingsWidget implements WidgetData
{
    private const int NEXT_DAYS = 7;

    public function __construct(private BookingSearch $search, private RequestingPerson $requester) {}

    public function for(string $tenantId, string $userId): array
    {
        $this->requester->mustBe($tenantId, $userId);

        // The list's query is ordered; Postgres refuses an order in a count.
        /** @var Closure(): Builder<Booking> $bookings */
        $bookings = fn (): Builder => $this->search->query($tenantId, $userId, new BookingQuery)->reorder();

        return [
            'total' => $bookings()->count(),
            'upcoming' => $bookings()->whereBetween('bookings.starts_at', [now()->utc(), now()->utc()->addDays(self::NEXT_DAYS)])->count(),
            'upcomingDays' => self::NEXT_DAYS,
        ];
    }
}
```

- The answer is a JSON object with camelCase keys: a few values, never a list of people, and nothing a person with this
  permission may not know. A count of a list that follows the branch counts only what the person sees, so it never hints at
  a hidden record.
- Answer `null` when there is nothing to show for this person now (a figure only some people with the permission may read,
  and this person is not one of them): the card is left out. A widget that fails does not fail the home; do not catch the
  failure. Dashboard reports it as `WidgetFailed`, without its message (which, for a database error, holds the values of
  the query), and draws the card with a notice.
- Keep it cheap: the home loads on every visit, and each widget is worked out one after the other.
- Never write a figure, a name or an address to a log, an audit entry or an exception of your own.

## 2. The widget

Declare it with a `DashboardWidgetProvider`, in `backend/packages/Booking/src/BookingDashboardProvider.php`:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Booking;

use MoodKit\Booking\Widgets\UpcomingBookingsWidget;
use MoodKit\Dashboard\Contracts\DashboardWidget;
use MoodKit\Dashboard\Contracts\DashboardWidgetProvider;

/** What Booking brings to the dashboard's home: the bookings the person sees, and how many come up soon. */
final readonly class BookingDashboardProvider implements DashboardWidgetProvider
{
    public function dashboardWidgets(): array
    {
        return [new DashboardWidget('booking.upcoming', 'booking::widgets.upcoming', UpcomingBookingsWidget::class, order: 40, permission: 'booking.view')];
    }
}
```

`DashboardWidget($key, $labelKey, $data, $size = 'small', $order = 0, $permission = null, $feature = null)`:

- `key` is `<package>.<what>` in lowercase letters, digits and `_`, declared once among every widget. The frontend registers
  its component under it.
- `size` is `small` (a third of a wide row), `medium` (two thirds) or `large` (the whole row).
- `order` places the card among the others, smallest first: the kernel's are 10 (Team), 20 (Branches), 30 (Clients) and 90
  (the plan's use).
- `permission` is the permission of the list's route, as Rbac names it. Write `null` only for a card every member of the
  workspace may see, on purpose: the route takes no permission of its own, so a widget without it shows to everyone.
- `feature` is the plan feature the workspace needs, when the list's route has a `feature.enabled:` guard; a slug as Plans
  names them (`booking_premium`, no dots).

The registry refuses a malformed widget on first use (`InvalidRegistry`). `DashboardTranslationsTest` checks that the label
has a line in every language.

Tag the provider in `BookingServiceProvider::register()`:

```php
// Its bookings on the dashboard's home, through Dashboard's registry.
$this->app->tag([BookingDashboardProvider::class], 'dashboard.widgets');
```

And give the card its title, `backend/packages/Booking/lang/en/widgets.php`:

```php
<?php

declare(strict_types=1);

return ['upcoming' => 'Bookings'];
```

and `lang/es/widgets.php`, with `'Reservas'`.

## 3. Following the branch

Nothing to do: the widget runs the list's query, so it follows the branch exactly as the list does. A list that keeps the
top bar's branch makes a card that keeps it; a list that shows every branch the person may see makes a card that shows them.
Dashboard never reads the branch itself. If your list does not follow the branch yet and it should, fix the list
([Scope data by branch](scope-data-by-branch.md)); the card follows. What belongs to the whole workspace (the plan's use) is
not scoped on purpose, and says so in its docblock.

## 4. Time

Count periods in UTC: "the last 30 days", "the next 7 days", with `now()->utc()`. A business's "today" or "this week" needs
the workspace's time zone (`ReadsWorkspaceSettings`), and then the bounds must be converted to UTC before they are compared
with a `timestamptz` column (comparing a bound in the branch's zone against UTC columns double-books a Tijuana evening).
When in doubt, take the period in days.

## 5. The card

On the frontend, the widget's component lives in your module's layer and draws in core's `DashboardWidgetCard` (the title,
an optional link to the list, the notice of a failed widget) with mood-ui's `Stat` for each figure. Receive the `widget`
prop (`DashboardWidgetView`: `key`, `label`, `size`, `data`, `failed`) and register the component under the widget's key
from a plugin of the layer:

```ts
export default defineNuxtPlugin(() => {
  useNuxtApp().hook("kit:dashboard:widgets", (widgets) => {
    widgets.push({ key: "booking.upcoming", component: UpcomingBookingsWidget });
  });
});
```

A widget with no component registered is not drawn. The card's anatomy is in [Frontend](../frontend.md); the kernel's
layers (`team`, `branches`, `clients`) are the models.

## 6. A quick action in the top bar

A thing people do often can go in the top bar's **Create** menu. A layer registers it with `kit:topbar:actions`, with the
permission it needs and the page it opens:

```ts
useNuxtApp().hook("kit:topbar:actions", (actions) => {
  actions.push({ id: "booking-new", order: 40, labelKey: "booking.actions.new", icon: CalendarDaysIcon, to: "/dashboard/booking/new", permission: "booking.create", offWhileImpersonating: true });
});
```

`icon` is a component (a heroicon, say), `labelKey` a message key of your layer. The menu is the **+** button in the top
bar, between the search and the bell, an icon alone on a phone too; it shows only the actions the person has the permission
for, and it is not drawn when there are none. Flag `offWhileImpersonating: true` on whatever creates something: the API refuses
it while a super admin acts as the person, so the menu leaves it out then. The page it opens still checks the plan.

## 7. Testing it

Ask `GET /api/v1/dashboard` as the home does, and read your widget by its key. Start from your package's own world (for one
on top of the team, Team's `team-world.php`; Dashboard's `dashboardWorld()` and `widgetsOf()` are in
[Testing](testing.md#writing-tests)):

```php
<?php

declare(strict_types=1);

use MoodKit\Tenancy\Contracts\BranchScope;
use MoodKit\Tenancy\Testing\ActsAsTenant;
use MoodKit\Tenancy\Testing\FakeBranches;

uses(ActsAsTenant::class);

require_once __DIR__.'/../Support/booking-world.php';

beforeEach(function (): void {
    bookingWorld($this);
    // The widget the home answers for that person, in workspace alpha: null when it is not there.
    $this->widget = fn (string $token): ?array => collect(bookingAs($this, $token)->getJson('/api/v1/dashboard')->assertOk()->json('data.widgets'))
        ->firstWhere('key', 'booking.upcoming');
});

it('counts the bookings and the ones coming up', function (): void {
    expect(($this->widget)($this->maxToken))->toMatchArray([
        'label' => 'Bookings', 'size' => 'small', 'data' => ['total' => 3, 'upcoming' => 2, 'upcomingDays' => 7], 'failed' => false,
    ]);
});

it('is left out for someone without the permission, and works nothing out for them', function (): void {
    roleOf($this, $this->alpha, 'member')->revokePermissionTo('booking.view');

    expect(($this->widget)($this->maxToken))->toBeNull();
});

it('follows the branch, as the list does', function (): void {
    FakeBranches::bind(BranchScope::branch($this->playas->id), people: [$this->playas->id => [$this->max->id]]);

    expect(($this->widget)($this->maxToken)['data']['total'])->toBe(1);
});
```

Test what the list hides too: the trash, another workspace, a booking just inside the period and one just outside it (with
`travelTo()`), and the plan's feature if the widget has one. Dashboard's own helpers (`dashboardWorld()`, `withWidgets()`)
install widgets of a test's own; a real widget needs none.

## Check it

1. Sign in to the demo workspace as `owner@demo.test`: the home has a **Bookings** card with its figures and a link to the
   list.
2. As a member without `booking.view`, the card never shows, and the answer of `GET /api/v1/dashboard` holds nothing of
   bookings.
3. `composer check` passes, `DashboardTranslationsTest` included.
