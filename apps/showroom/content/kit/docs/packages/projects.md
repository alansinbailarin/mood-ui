# Projects

> **Upgrading from a version before Projects?** If your app already has anything named `projects` (a `projects` table, `projects.*`
> permissions, `/api/v1/projects` routes or a `/dashboard/projects` page), follow
> [Remove the Projects module](../guides/remove-the-projects-module.md) BEFORE `composer install` and `php artisan migrate`.

The example module. A workspace's projects, each with a name, a description, a status, an optional due date and an optional
branch. Projects does nothing a real business needs; it exists so that you have one small module that follows every standard
of the kit, to read, to copy and to delete. `php artisan kit:make-module` makes a module of your own from it: its stubs are
these files with the names taken out, and a test keeps them equal to what is here (see
[Build a module](../guides/build-a-module.md#the-template-and-its-stubs)). [Build a module](../guides/build-a-module.md) is
the command's guide and the checklist, and this page is the worked example of each line.

Projects depends on Audit, Auth, Branches, Dashboard, Platform, Rbac, Search, Settings, Support and Tenancy through their contracts, and
nothing depends on it: [remove it](../guides/remove-the-projects-module.md) and the kit builds as before. It is **off by
default**: a platform flag (`projects.enabled`) hides it from everyone until the platform's admin turns it on.

Read the code in this order: the migration, the model, `ProjectsServiceProvider`, the routes, the actions, then the tests.
Each file starts with a short comment that says why it is there.

## What a person sees

| Screen | Path | Needs |
| ------ | ---- | ----- |
| The list: search, status filter, table, pager | `/dashboard/projects` | `projects.view` |
| New project | `/dashboard/projects/new` | `projects.manage` |
| One project, to read or to edit | `/dashboard/projects/<id>` | `projects.view` (read), `projects.manage` (edit) |

In the list a row has outline icon buttons (the name is plain text, never a link): **Edit** and **Delete** for whoever manages
projects, **Open** (the read-only page) for anyone who only sees them.

The sidebar has a **Projects** entry in the workspace section. The top bar's **+** menu offers **New project**, the home has a
card of the active projects, how many are due in the next 7 days and how many are overdue, and the global search (`Cmd+K`) has a **Projects** group.
All of them are hidden while the flag is off.

## Permissions, roles and the menu

| Permission | Lets a member | Requires |
| ---------- | ------------- | -------- |
| `projects.view` | see the projects, in the list, the search and the home | |
| `projects.manage` | add, edit and delete projects | `projects.view` |

The owner and the manager have both through their templates (`all`; neither permission is owner-critical). The `member`
role gets `projects.view`, added to the kernel's template by `ProjectsRoleTemplates`. A custom role may hold
either. After a deploy that brings the module, `php artisan rbac:sync` gives the permissions to the existing workspaces.
Guides: [Add a permission and a menu entry](../guides/add-a-permission-and-menu-entry.md) and
[Add a role template](../guides/add-a-role-template.md).

## The platform flag

`projects.enabled` (label "Projects") is declared by `ProjectsPlatformFlags` and tagged `platform.flags`. It starts off and
has no rollout. While it is off for a workspace:

- every route answers 503 `platform.flag_off` (the `platform-flag:projects.enabled` middleware, after `workspace`: someone not
  signed in still gets 401);
- the global search finds nothing of projects and the home has no card (the finder and the widget ask
  `ChecksPlatformFlags`);
- the sidebar leaves the entry out and the **+** menu does not offer **New project**: the menu entry names the flag in its
  `featureFlag`, which the dashboard layer reads from `GET /me`'s `platformFlags`, and the layer's plugin checks the same flag;
- the three pages name it in `definePageMeta({ platformFlag })`: core's route guard sends whoever opens their address to the
  dashboard (see [Frontend](../frontend.md#pages)).

The menu API still lists the entry (the flag is judged by the frontend, as for any `featureFlag`); what a person cannot do is
reach the data. Guide: [Add a platform flag](../guides/add-a-platform-flag.md).

## The API

Every route is under `/api/v1`, takes the `workspace` middleware group (a signed-in member of the workspace), the flag, a
permission and a named limiter. Answers use the envelope ([Errors and the API](../concepts/errors-and-api.md)).

| Method and path | Permission | Limiter | What it does |
| --------------- | ---------- | ------- | ------------ |
| `GET /projects` | `projects.view` | `projects-read` | a page of the list: `search` (the name, a typo forgiven), `status`, `page`, `perPage` |
| `GET /projects/{project}` | `projects.view` | `projects-read` | one project |
| `POST /projects` | `projects.manage` | `projects` | makes a project (201) |
| `PATCH /projects/{project}` | `projects.manage` | `projects` | changes the fields sent, and only those |
| `DELETE /projects/{project}` | `projects.manage` | `projects` | puts a project in the trash, answers `data: null` |

A project is `{ id, name, description, status, dueOn, branch, createdAt, updatedAt }`: `status` is `active`, `on_hold` or
`done`; `dueOn` is a plain `YYYY-MM-DD` (a due date has no time zone); `branch` is `{ id, name, isActive }` or `null`. The
list's meta carries `pagination: { page, perPage, total, lastPage }`: the page and its total come from one query, so a
project a person may not see is never counted.

The fields of a body: `name` (required when making one, 120 characters, one line), `description` (up to 2000, several lines,
`null` to take it away), `status`, `dueOn` (`null` to take it away) and `branchId` (`null` for none). A bad value is a 422 whose
error names the field; the names in messages come from `lang/*/validation.php`.

| Code | Status | When |
| ---- | ------ | ---- |
| `projects.not_found` | 404 | the id is no uuid, is not there, is another workspace's, is in the trash, or is of a branch the person may not see: one answer for all |
| `projects.branch_not_allowed` | 422, field `branchId` | the branch is not there, is another workspace's, is closed, or is not one the person works at |
| `platform.flag_off` | 503 | the flag is off (`meta.flag`) |
| `auth.forbidden` | 403 | no `projects.view` or `projects.manage` (`meta.requiredPermission`) |

Configuration: `backend/packages/Projects/config/projects.php` holds `per_page` (25), `changes_per_minute` (60) and
`reads_per_minute` (120); nothing is read from the environment.

## The table

`projects` (one migration) has a uuid key, `tenant_id` (with `TenantRls::enable()` and `FORCE`, the way every table of a
workspace has it), `branch_id` (nullable), `name` (120), `description` (text, a `CHECK` of 2000 characters), `status` (a string
with a `CHECK` of the three values: the kit keeps its catalogs as strings and a backed enum, `Enums\ProjectStatus`), `due_on`
(date), timestamps and soft deletes. The branch hangs from `branches (tenant_id, id)` and is let go with `ON DELETE SET NULL
(branch_id)` when the branch is deleted: the project is then the whole workspace's, as a client's home branch. The search reads `lower(name)`
with no index of its own: a workspace has few projects. A module whose table grows adds a GIN trigram index, as Branches does (it
is listed in Search's `TrigramSetupTest`). Guide: [Attach data to branches](../guides/attach-data-to-branches.md).

## Following the branch

The branch is optional, so the pattern is the one for "a record that belongs to a branch or to the whole workspace" in
[Scope data by branch](../guides/scope-data-by-branch.md), in `Scope\ProjectVisibility`:

- the **list** (and the search and the widget, which run the same query) keeps the branch of the top bar and the projects of
  no branch (`CurrentBranch`), and only the projects of no branch for someone who works at none;
- **one project** opens when the person may see its branch, whichever the top bar is on (`BranchAccess::allows`); any other is
  the same 404 as one that is not there;
- the **branch of a project** comes in the body and is checked (`Records\ProjectBranches`: active, of the workspace, one the
  person may choose); the server never takes it from the top bar. The form starts at the top bar's branch, which is the
  frontend's convenience;
- every **audit entry** carries the project's own branch.

## Dataset

Projects declares the dataset `projects.projects` to [Data](data.md), through `ProjectsData` (tagged `data.datasets`): the workspace's
projects, for whoever has `projects.view`, and only while the platform flag `projects.enabled` is on for the workspace.

- **The rows:** live projects; the trash is never in it.
- **Columns:** `id`, `name`, `description`, `status`, `due_on`, `created_at` and `branch_id`. None is sensitive. The metric is
  `count`; the relation `branch` points at `branches.branches`.
- **Who sees which:** `Data\ProjectsScope`: the projects of every branch the person may see (`BranchAccess::visibleTo()`, never
  the branch of the top bar) and those of no branch, or all of them for whoever sees every branch. It is the rule of
  [Following the branch](#following-the-branch), for a person who is not the one in the request.

## Actions

Projects declares two actions to [Data](data.md), through the same `ProjectsData` (tagged `data.actions` too): `projects.create` and
`projects.update`, for whoever has `projects.manage` while `projects.enabled` is on. Each calls the Action the API's controller calls
(`CreateProject`, `UpdateProject`), through `Data\CreateProjectOperation` and `Data\UpdateProjectOperation`, so a branch the person may
not use is a `BranchNotAllowed`, a project of another workspace or of a branch out of sight is a `ProjectNotFound`, and the audit
entries are the API's.

- **Fields:** `name` (required, one line, 120 characters), `description` (2000, may be null), `status` (`active`, `on_hold` or
  `done`), `dueOn` (a day, `YYYY-MM-DD`, may be null) and `branchId` (an id of `branches.branches`, may be null). `projects.update`
  adds `id` (required), and every other field is optional: only what comes changes, and `null` takes away a description, a due date or a
  branch. The fields use the API's rules (`ProjectRules`, `PlainName`, `MultilineText`), so one name is valid in both.
- **No delete:** deleting a project is never declared, and the registry would refuse it.
- **Summary:** each action has a line for a confirmation card, in the language of the request: "Create the project "Roof", due
  2027-03-01" and "Change the project "Roof": status, due date". An edit names the project as the person may see it; one they may not
  see is "this project".

## Where each piece is

| Piece | File (under `backend/packages/Projects/`) | Guide or rule it follows |
| ----- | ----------------------------------------- | ------------------------ |
| The package | `composer.json`, `src/ProjectsServiceProvider.php` | AGENTS.md, "Packages": the manifest, `require` and `versions` in `backend/composer.json`, `composer update mood-kit/projects` |
| Layers | `src/Http`, `Actions`, `Records`, `Scope`, `Models`, `Dto`, `Enums` | AGENTS.md, "Layers": Deptrac reads the namespace, so nothing is registered |
| Controller | `src/Http/Controllers/ProjectsController.php` | queries nothing, calls an action, answers with `ApiResponse` |
| Requests | `src/Http/Requests`, `src/Validation/ProjectRules.php` | `ApiRequest`, `PlainName` for the name, `MultilineText` for the description |
| Actions | `src/Actions` (list, show, create, update, delete) | one class each, in a transaction when they write, workspace first then person |
| The list's one query | `src/Records/ProjectSearch.php` | the list, the search and the widget start from it |
| Errors | `src/Errors`, `lang/*/errors.php` | `DomainError`, stable codes |
| Audit | `src/Records/ProjectTrail.php`, `src/AuditEntries.php` | `<package>.<resource>.<what happened>`, with the project's branch |
| Permissions, role templates, menu | `src/ProjectsRbacProvider.php`, `src/ProjectsRoleTemplates.php` | [Add a permission and a menu entry](../guides/add-a-permission-and-menu-entry.md) |
| Platform flag | `src/ProjectsPlatformFlags.php` | [Add a platform flag](../guides/add-a-platform-flag.md) |
| Search source | `src/ProjectsSearchProvider.php`, `src/Search/ProjectsFinder.php` | [Add a search source](../guides/add-a-search-source.md) |
| Dashboard widget | `src/ProjectsDashboardProvider.php`, `src/Widgets/ProjectsWidget.php` | [Add a dashboard widget](../guides/add-a-dashboard-widget.md) |
| Translations | `lang/{en,es}` | every key in both languages, none blank (`ProjectsTranslationsTest`) |
| Tests | `tests/Feature`, `tests/Unit`, `tests/Support/projects-world.php` | [Testing](../guides/testing.md): the world is Branches' with the flag on |

Audit entries are `projects.project.created`, `projects.project.updated` (only the fields that changed, before and after, and
none when nothing changed) and `projects.project.deleted`. The package has no history screen, so it has no words for them:
whoever shows a trail words its entries.

A super admin acting as someone may make and edit projects but not delete them. The two write routes say so themselves, in the
package's `routes/api.php`, with `impersonation-allowed` (a middleware that does nothing; the trail names the admin), and every
`DELETE` of the `workspace` group is refused. `ImpersonationRoutesTest` wants each write route to carry that or
`not-impersonating`, so a module never edits the kernel's tests.

## The frontend layer

`frontend/layers/projects` (messages under `projects.*`):

| Piece | File (under `app/`) | What it shows |
| ----- | ------------------- | ------------- |
| The list page | `pages/dashboard/projects/index.vue` | the page anatomy: header with **New project**, toolbar (search at the left, status filter at the right), table, pager, delete dialog of two actions |
| New and edit pages | `pages/dashboard/projects/new.vue`, `[id].vue` | a form in the page's change set, the action bar (Save, Undo, Cancel), errors by field from the envelope |
| The form | `components/ProjectForm.vue` | mood-ui's `Input`, `Textarea`, `DateField` and core's `KitSelect` as they come |
| The table and its actions | `components/ProjectsTable.vue`, `ProjectRowActions.vue` | outline icon buttons per row, each with a tooltip; the name is plain text |
| Service | `services/projects.ts` | the only code that calls the API |
| Composables | `composables/useProjectList.ts`, `useProjectActions.ts`, `useProjectEditor.ts` | the list's query, delete, and what the two form pages share |
| Plugins | `plugins/projects-dashboard.ts` | the home's card (`kit:dashboard:widgets`) and **New project** in the **+** menu (`kit:topbar:actions`), honoring the permission and the flag |
| The card | `components/ProjectsOverviewWidget.vue` | core's `DashboardStatCard` |

The tests are in `layers/projects/tests` (Vitest) and `frontend/tests/e2e/projects.spec.ts` (Playwright, against the stub API in
`tests/e2e/support/modules/stub-projects.ts`, which the stub API finds by its file name). The spec is functional: it asserts what the pages list, send and hide, and takes no
screenshots.

A change to any file of Projects is a change to the stubs of `kit:make-module` too: `ModuleStubsDriftTest` fails until the same
line is changed in `backend/packages/Support/stubs/module`.

Projects needed two general changes of the kernel, which stay if you remove it: the dashboard layer's `useDashboardMenu()` leaves
out a menu entry whose `featureFlag` is a platform flag that is off for the workspace (the search palette's page shortcuts follow
the same list), and core's `platformFlag` page meta. In the backend, Auth's `impersonation-allowed` route middleware.

## The widget

`projects.overview` counts the **active** projects the person's list would show, and of those the ones **due** from today through
the next 7 days and the ones **overdue** (due before today). A due date is a plain day, so "today" is the workspace's own, from
Settings' `ReadsWorkspaceSettings::timezone()`, not UTC: at 19:00 in Tijuana it is still that day. A project with no due date, or
that is on hold or done, is in neither figure.
