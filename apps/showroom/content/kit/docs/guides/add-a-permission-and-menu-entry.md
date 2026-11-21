# Add a permission and a menu entry

This guide gives a feature of your own a permission, guards its routes with it, and puts its screen in the
dashboard menu for the members who hold it. The example is a tickets screen in a `Tickets` package of your own.

## Before you start

- You have a backend package, here `backend/packages/Tickets` with the namespace `MoodKit\Tickets\` and a
  `TicketsServiceProvider`. To create one, follow "Packages" in `AGENTS.md`. Its screens are a layer in
  `frontend/layers/`. See [Architecture](../concepts/architecture.md#where-your-code-goes).
- A package of yours falls under the same coverage gate as the kit's: `composer check` fails when its
  `src/` is under 85%, on its own.
- Its provider loads its translations under the `tickets` namespace:
  `$this->loadTranslationsFrom(__DIR__.'/../lang', 'tickets');`.
- You have a frontend layer for its screens, here `frontend/layers/tickets`.

## 1. Declare the permissions and the menu entry

Create one class that implements the provider interfaces you need. The kernel's own,
`MoodKit\Rbac\KernelRbacProvider` (permissions and roles) and `KernelMenuProvider` (sections and entries), are the
templates.

```php
<?php

declare(strict_types=1);

namespace MoodKit\Tickets;

use MoodKit\Rbac\Contracts\MenuItem;
use MoodKit\Rbac\Contracts\MenuItemProvider;
use MoodKit\Rbac\Contracts\MenuSection;
use MoodKit\Rbac\Contracts\MenuSectionProvider;
use MoodKit\Rbac\Contracts\PermissionDefinition;
use MoodKit\Rbac\Contracts\PermissionProvider;

final readonly class TicketsRbacProvider implements MenuItemProvider, MenuSectionProvider, PermissionProvider
{
    public function permissions(): array
    {
        return [
            new PermissionDefinition(
                'tickets.view',
                'tickets',
                'tickets::permissions.tickets.view.label',
                'tickets::permissions.tickets.view.description',
            ),
            new PermissionDefinition(
                'tickets.archive',
                'tickets',
                'tickets::permissions.tickets.archive.label',
                'tickets::permissions.tickets.archive.description',
                requires: ['tickets.view'],
            ),
        ];
    }

    public function menuSections(): array
    {
        return [new MenuSection('tickets', 'tickets::menu.sections.tickets', order: 50)];
    }

    public function menuItems(): array
    {
        return [
            new MenuItem('/dashboard/tickets', 'tickets::menu.tickets', 'briefcase', 'tickets', order: 10, permission: 'tickets.view'),
        ];
    }
}
```

`PermissionDefinition($name, $module, $labelKey, $descriptionKey = null, ownerCritical: false, requires: [], platformOnly: false)`:

- `name` is `<module>.<action>` in lowercase letters, digits and underscores: `tickets.archive`.
- `module` groups permissions on the roles screen. Its label is `<namespace>::modules.<module>`.
- `requires` lists permissions that this one makes no sense without. Saving a role adds them.
- `ownerCritical: true` makes it the owner's alone, for a permission that lets its holder take over the
  workspace (as `rbac.manage` does). A permission that requires an owner-critical one must be owner-critical
  too.

`MenuItem($route, $labelKey, $icon, $section, $order = 0, $permission = null, $featureFlag = null)`:

- `route` starts with `/` and is unique across all providers.
- `icon` is one of the names in `frontend/layers/core/app/utils/menu-icon.ts`
  ([list](../packages/rbac.md#menu-sections)); an unknown one shows a question mark.
- `section` is the slug of a section some provider declares: the kernel's `workspace` or `administration`, or one of
  your own. The registry refuses an item in a section nobody declares.

`MenuSection($slug, $labelKey, $order = 50)` (from `menuSections()`, a `MenuSectionProvider`):

- `slug` is a lowercase word, declared once across all providers.
- `order` places it among the others, lower first, then by slug: the kernel's `workspace` is `0` and
  `administration` is `100`, so `50` lands between them.
- Without a `permission`, every member sees the entry. With one, it must be a permission some provider
  declares: the registry refuses a menu item that names any other.
- `featureFlag` is the slug of a [platform flag](add-a-platform-flag.md) (`tickets.enabled`). `GET /menu` passes it through
  untouched, and the dashboard's sidebar (and the search palette's page shortcuts) leaves the entry out while that flag is off
  for the workspace, as `GET /me`'s `platformFlags` says. It hides the entry only: the module's routes keep the guard
  (`platform-flag:<slug>`).

## 2. Tag the provider

In `TicketsServiceProvider::register()`:

```php
$this->app->tag([TicketsRbacProvider::class], ['rbac.permissions', 'rbac.menu_sections', 'rbac.menu']);
```

## 3. Add the translations, in English and Spanish

`backend/packages/Tickets/lang/en/permissions.php`:

```php
<?php

declare(strict_types=1);

return [
    'tickets' => [
        'view' => ['label' => 'View tickets', 'description' => 'Open the tickets of the workspace.'],
        'archive' => ['label' => 'Archive tickets', 'description' => 'Archive a ticket of the workspace.'],
    ],
];
```

`backend/packages/Tickets/lang/en/modules.php`:

```php
<?php

declare(strict_types=1);

return ['tickets' => 'Tickets'];
```

`backend/packages/Tickets/lang/en/menu.php`:

```php
<?php

declare(strict_types=1);

return ['tickets' => 'Tickets', 'sections' => ['tickets' => 'Tickets']];
```

Then the same three files in `lang/es/`. `RegistryTranslationsTest` checks every key the registry points at
in both locales, including `<namespace>::modules.<module>` and the label of every section. It fails when a
permission's Spanish label equals its English one.

## 4. Guard the routes

Routes live in the package's own `routes/api.php`, here `backend/packages/Tickets/routes/api.php`, which its
provider loads in `boot()`, as `RbacServiceProvider` does:

```php
Route::middleware('api')->prefix('api/v1')->group(__DIR__.'/../routes/api.php');
```

Then, in that file:

```php
use Illuminate\Support\Facades\Route;

Route::middleware('workspace')->group(function (): void {
    Route::middleware('permission:tickets.view')->get('tickets', ListTicketsController::class);
    Route::middleware('permission:tickets.archive')->post('tickets/{ticket}/archive', ArchiveTicketController::class);
});
```

A member without the permission gets 403 `auth.forbidden` with `meta.requiredPermission`. For a check with
no request (a job, a command), inject `MoodKit\Rbac\Contracts\ChecksPermissions` and call
`allows($tenantId, $userId, 'tickets.archive')`.

## 5. Give the permissions to roles

A permission goes to the roles whose template grants it. The owner and manager templates use `all`, so
they get every workspace permission, these included (the manager gets all but the owner-critical ones). The
member role does not. To give a permission to `member`, or to a new role, see
[Add a role template](add-a-role-template.md). Owners can also give it to any custom role from the roles
screen.

Workspaces created from now on get the roles as they are. Existing workspaces get the new permissions when
you run:

```bash
cd backend
php artisan rbac:sync
```

Expected output: `Created 2 permissions. Gave new permissions to <n> roles across <m> workspaces.` If the
registry has a problem (an unknown `requires`, a duplicate route, a bad name), the command prints it and
changes nothing. Run it after every deploy that adds permissions.

## 6. Add the screen

In `frontend/layers/tickets/app/pages/dashboard/tickets/index.vue`:

```ts
definePageMeta({ layout: "dashboard", auth: "required", permission: "tickets.view" });
```

The menu entry comes from the backend, so there is nothing to register in the frontend. Show or hide
actions with `v-can="'tickets.archive'"` or `usePermissions().can('tickets.archive')`. Build the page in the standard
anatomy, `PageHeader`, then tabs if any, then `PageToolbar`, then the content ([Page
anatomy](../frontend.md#page-anatomy)); see [Frontend](../frontend.md#calling-the-api) for loading data on the page.

## An entry of the admin host

The admin host's menu comes from the same registries. Put the entry in a section of the `platform` area, yours or one of
Platform's (`platform_overview`, `platform_admin`), with a route under `/platform` and no permission:

```php
new MenuSection('tickets_ops', 'tickets::menu.sections.ops', order: 50, area: MenuSection::PLATFORM);
new MenuItem('/platform/tickets', 'tickets::menu.all', 'briefcase', 'tickets_ops', order: 10);
```

It never shows in a workspace's dashboard, and the registry refuses a platform entry outside `/platform` or behind a
permission. See [Platform](../packages/platform.md#the-admins-menu).

## Check it

1. `php artisan rbac:sync` reports the new permissions.
2. Sign in to the demo workspace as `owner@demo.test`: **Tickets** shows under **Tickets**, and
   `/dashboard/roles` lists the **Tickets** module with both permissions.
3. As `member@demo.test`, the entry is hidden, `/dashboard/tickets` sends you back to `/dashboard`, and
   `GET /api/v1/tickets` answers 403.
4. `composer check` passes, `RegistryTranslationsTest` included.
