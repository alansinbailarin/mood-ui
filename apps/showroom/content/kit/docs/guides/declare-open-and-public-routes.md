# Declare open and public routes

Every route of the app falls in one of three classes, and a test fails on a route that fits none. The only routes it leaves out
are the framework's own, listed by name in the test (`FRAMEWORK_ROUTES`): Sanctum's cookie, the local storage disk and the
health check. A closure in `routes/web.php` or a route to a class of a vendor is checked like any other:

| Class | What makes it one |
| ----- | ----------------- |
| Member's | the `workspace` middleware group and a `permission:` guard |
| Platform's | the `platform` middleware group (a signed-in super admin on the admin's host) |
| Declared | its package says so: an **open** route (a member's route with no permission) or a **public** route (outside every signed-in group) |

A route you add to the `workspace` group takes `permission:<name>` and needs nothing else. This guide is for the two other
cases, where nothing in the route's middleware says why it is safe, so the package that owns it says it in words. The check is
`backend/tests/Architecture/RoutesAreClassifiedTest.php`. Which permission a route takes is in
[Add a permission and a menu entry](add-a-permission-and-menu-entry.md).

> Part of the checklist every new module follows: [Build a module](build-a-module.md). A module whose routes all take a
> permission has nothing to declare.

## When a route is open

A route of the `workspace` group may have no permission when every member needs it and it reads or changes only what is the
caller's own, or what is filtered by what the caller may see: the person's profile, their sessions, their inbox, the menu, the
global search. If the route returns a record of the workspace that a role may be denied, it is not open: give it a permission.

Declare it with an `OpenRoute`: the route's name, and the reason in one line.

## When a route is public

A route outside every signed-in group (no `workspace`, no `platform`) is public: a sign-in, a webhook, a link from an email,
the portal's session, the page a workspace published. Declare it with a `PublicRoute`: the route's name, and the lock that
stands in for the session (a signed token, a provider's signature, the emailed code, a captcha, the workspace's host and a
limiter). Write the lock the code really applies, and check it in the controller or the middleware before you write it.

The routes of a signed-in client of the portal (the `portal` group) are public routes too: their lock is the portal session.

## 1. A class that says it

In your package, `backend/packages/Tickets/src/TicketsRouteDeclarations.php`:

```php
namespace MoodKit\Tickets;

use MoodKit\Support\Routes\OpenRoute;
use MoodKit\Support\Routes\PublicRoute;
use MoodKit\Support\Routes\RouteDeclarations;

final readonly class TicketsRouteDeclarations implements RouteDeclarations
{
    public function routes(): array
    {
        return [
            new OpenRoute('tickets.mine', 'only the caller\'s own tickets'),
            new PublicRoute('tickets.reply-link', 'a signed token that names the ticket, and a limiter'),
        ];
    }
}
```

A route is declared by its name, so give it one (`->name('tickets.mine')`). The test fails on a route with no name, and on a
name that two routes share, so a new route cannot inherit the declaration of another by reusing its name.

## 2. Tag it

In the package's service provider, from `register()`:

```php
$this->app->tag([TicketsRouteDeclarations::class], 'routes.declarations');
```

Each package declares its own routes, so removing a package leaves nothing behind in a list of the kernel. Your package
requires `mood-kit/support` already.

## 3. Run the test

```bash
cd backend && vendor/bin/pest tests/Architecture/RoutesAreClassifiedTest.php
```

It fails, naming the route and its middleware, when:

- a route is not a member's with a permission, the platform's or declared;
- a route has no name, or two routes have the same one;
- a declaration names a route that does not exist (you renamed or deleted the route);
- a route is declared twice, or an `OpenRoute` is declared on a route that has a permission (delete the declaration), or on a
  route outside the `workspace` group, or a `PublicRoute` on a route of a signed-in group.

The routes of the kernel are declared the same way, in the provider of each package that owns them: Auth, Billing, Branches,
Clients, Dashboard, Geocoding, Notifications, Plans, Platform, PublicPage, Rbac, Search, Settings, Signup, Team and Tenancy.
Read the declarations of the package nearest to your route for the wording.
