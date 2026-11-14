# Add a role template

A role template is a system role every workspace gets, with the permissions its template grants. The kit
declares three (`owner`, `manager`, `member`, in `MoodKit\Rbac\KernelRbacProvider`). A module adds its own
roles, or adds its permissions to the kernel's, with a `RoleTemplateProvider`.

## Before you start

- The permissions the template grants are declared by a `PermissionProvider`. See
  [Add a permission and a menu entry](add-a-permission-and-menu-entry.md).
- Your package loads its translations under its own namespace (here `billing`).

## 1. Declare the template

```php
<?php

declare(strict_types=1);

namespace MoodKit\Billing;

use MoodKit\Rbac\Contracts\RoleTemplate;
use MoodKit\Rbac\Contracts\RoleTemplateProvider;

final readonly class BillingRoles implements RoleTemplateProvider
{
    public function roleTemplates(): array
    {
        return [
            // A new system role.
            new RoleTemplate(
                'accountant',
                'billing::roles.accountant.name',
                permissions: ['invoices.view', 'invoices.send'],
                grantableBy: ['owner'],
                descriptionKey: 'billing::roles.accountant.description',
            ),
            // Adds a permission to the kernel's member role.
            new RoleTemplate('member', 'rbac::roles.member.name', permissions: ['invoices.view']),
        ];
    }
}
```

`RoleTemplate($slug, $nameKey, permissions: [], all: false, exceptOwnerCritical: false, grantableBy: [], descriptionKey: null)`:

| Argument | Meaning |
| -------- | ------- |
| `slug` | `a-z`, `0-9`, `-` and `_`. Unique among system roles; a workspace can never take it for a custom role. |
| `nameKey`, `descriptionKey` | translation keys. A system role is named in the language of the request. |
| `permissions` | the names it gets. Each must be declared, and must not be `platformOnly`. |
| `all` | every workspace permission, those of modules installed later too |
| `exceptOwnerCritical` | with `all`, leave out the owner's permissions. Required for any role but the owner's. |
| `grantableBy` | slugs of the roles whose members may give this role. Empty means nobody can. Giving a role through the API also needs `rbac.manage`, which only the owner holds, so today only owners give roles. |

Two templates with the same slug are added together: their permissions and their `grantableBy`. That is how
the second entry above gives `invoices.view` to every member without redeclaring the role.

## 2. Tag the provider

In your provider's `register()`:

```php
$this->app->tag([BillingRoles::class], 'rbac.roles');
```

One class may implement several provider interfaces and take several tags:
`$this->app->tag([BillingRbac::class], ['rbac.permissions', 'rbac.roles', 'rbac.menu'])`.

## 3. Translate the name and the description

`backend/packages/Billing/lang/en/roles.php`, and the same in `lang/es/roles.php`:

```php
<?php

declare(strict_types=1);

return [
    'accountant' => [
        'name' => 'Accountant',
        'description' => 'Sees and sends the invoices of the workspace.',
    ],
];
```

`RegistryTranslationsTest` fails when a template's name or description key is missing in a locale.

## 4. Sync existing workspaces

New workspaces get the role when they are created. For existing ones:

```bash
cd backend
php artisan rbac:sync
```

For each workspace, `rbac:sync` creates the roles it does not have yet, and gives existing system roles the
template permissions they were not offered before. It never takes a permission away: if a workspace removed
`invoices.view` from its member role, a later sync does not put it back, because the role remembers what its
template offered it.

If a workspace already has a custom role with the slug `accountant`, its update stops at that role and the
workspace is named in the output. The system roles that come before it in the registry's order are already
updated by then (there is no transaction around one workspace's sync); the ones after it are not. The command
goes on with the other workspaces and exits with a failure. Rename that role, then run the sync again: it
finishes the rest.

## Rules the registry enforces

`RbacRegistry` checks the templates the first time it is used, and `rbac:sync` reports the same problems
before it changes anything:

- The owner role is declared once, by the kernel. A module never redeclares it: the owner already has
  everything.
- No role but the owner's gets an owner-critical permission, whether listed or through `all` without
  `exceptOwnerCritical`.
- The owner role has no `grantableBy`: a workspace keeps the owner it was created with.
- Every slug in `grantableBy` is a template.
- A template grants the permissions its permissions `require`.

## Check it

1. `php artisan rbac:sync` succeeds.
2. On `/dashboard/roles` of the demo workspace, **Accountant** is listed as a system role.
3. An owner can give it to a member with `POST /api/v1/users/{user}/role` (`{"roleId": "..."}`).
4. `composer check` passes.
