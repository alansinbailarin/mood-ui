# Build a module

A module of your own is a backend package plus a frontend layer (see [Architecture](../concepts/architecture.md#where-your-code-goes)).
You do not start one from an empty folder. One command makes it, as a copy of the kit's template module
([Projects](../packages/projects.md)) under a name of your own, with its tests, wired to every screen that has to know about it:

```bash
cd backend
php artisan kit:make-module Invoices --es="factura,facturas,f"
```

That makes a working, tested module of invoices that follows every standard of the kit: a table with row-level security, a list
with search, filter and pages, a form, permissions, an entry in the sidebar, a search source, a card on the home, a **+** action
in the top bar, words in English and Spanish, and a platform flag that keeps it off until you turn it on. It also declares what
the module offers to read and to do, a dataset and two actions, and ships the test that proves its records never cross a
workspace. You then change its fields into yours. Nothing of the kit's own code is edited, so the kit's tests and checks keep passing.

## What the command takes

| Argument or option | What it is |
| ------------------ | ---------- |
| `name` | The module in the **plural**, in StudlyCase: `Invoices`, `PriceLists`. From 3 to 40 characters, letters and digits only. It is the name of the package, of its URLs (`/api/v1/price-lists`) and of its table (`price_lists`). |
| `--singular=` | The singular, when it is not the name without its plural: `--singular=Person` for `People`. The command works out the usual ones (`Invoice`, `Category`, `Status`) and tells you which it chose. It is the name of the model and of every class of one record. |
| `--es=` | The Spanish words, as `singular,plural,gender` with the gender `m` or `f`: `--es="factura,facturas,f"`, `--es="aparato,aparatos,m"`, `--es="orden de compra,órdenes de compra,f"`. The gender decides the articles and the endings of every Spanish text ("Nueva factura", "Nuevo aparato", "Activa", "Activo"). If you leave it out, the command asks for the three, and it refuses when it cannot ask. |
| `--en=` | The English words, as `singular,plural`, when the name's own are not right: `PriceLists` is "price list" and "price lists" without it. Write an acronym in capitals (`--en="SMS,SMSs"`) and it is kept as written. It picks "a" or "an" by how the word sounds ("an SMS"). |
| `--no-install` | Does not run `composer update mood-kit/<name>`; it tells you to. |

A feminine noun that takes "el" in the singular (`el agua`) needs a small edit of the Spanish files afterwards.

The command writes code, so it runs only where you develop, never in production. It checks everything before it writes
anything, never overwrites a file, and takes back what it wrote if something fails halfway. It refuses, and says why and what
to do, when:

- the name is not StudlyCase, is too short, or is too long (33 characters once written as snake case, so that the names of the
  table's indexes and constraints stay within the 63 characters Postgres keeps), is a word PHP reserves (`List`, `Class`,
  `Array`...), a global type or reserved word of TypeScript the frontend would use as a name (`Record`, `Event`, `Date`,
  `Request`, `File`, `Export`, `Import`, `Delete`...), or is a name the kit uses itself (`Support`, `Platform`, `Billing`,
  `Users`...);
- the singular is the same word as the plural, or is not StudlyCase;
- a singular, in English or in Spanish, is longer than three words or 27 characters (the kit's tooltips are five words and 40
  characters at most, and "Keep the <singular>" must fit): shorten the English ones with `--en="line adjustment,line adjustments"`;
- a package, a frontend layer, a config file, a table, a route, a screen of the dashboard or a key of the words already has the
  name, or another package declares a permission, a flag, a menu entry, a limiter or a words namespace of the same name
  (`Invoices` is refused, since Billing has `invoices.view`);
- a class of the module would have the name of one it imports (a module of `Models` and `Model`);
- the Spanish or English words have anything but letters and spaces (digits, dashes and punctuation are refused);
- any file it would write exists already, or `backend/composer.json` has no place for the package.

## What it makes

| What | Where |
| ---- | ----- |
| The backend package: model, actions, form requests, rules, resource, controller, routes, search source, widget, permissions, role templates, menu entry, platform flag, migration, words in `en` and `es`, and its Pest tests | `backend/packages/<Name>` |
| Its dataset and its two actions for [Data](../packages/data.md): `<Name>Data` (tagged `data.datasets` and `data.actions`), the scope that narrows rows by branch, the create and update operations and the line each confirmation shows, with their words and their tests | `backend/packages/<Name>/src/<Name>Data.php`, `src/Data`, `lang/{en,es}/data.php`, `tests/Feature/<Name>DatasetTest.php`, `<Name>OperationsTest.php` |
| The isolation test: it seeds a record in two workspaces and fails if the list, the detail or the search of one ever gives the other's | `backend/packages/<Name>/tests/Feature/<Name>IsolationTest.php` (uses `AssertsIsolation`, see [Testing](testing.md)) |
| The frontend layer: list, new and edit pages, form, table, service, composables, plugin for the home and the **+** menu, words in `en` and `es`, and its Vitest tests | `frontend/layers/<name>` |
| An end-to-end spec and its stub of the API (the stub is found by its file name: no file of the e2e harness is edited) | `frontend/tests/e2e/<name>.spec.ts`, `frontend/tests/e2e/support/modules/stub-<name>.ts` |
| A page for the docs | `docs/packages/<name>.md` |
| The package in `backend/composer.json` (`require` and the path repository's `versions`) | and `composer update mood-kit/<name>` is run for you |
| The module's two folders in the `ignore` list of `.jscpd.json` | a copy of the template repeats it on purpose; delete the two lines when the module no longer looks like it |

The migration is dated now, and never before the tables it hangs from. The module starts **off**: its platform flag
`<name>.enabled` has to be turned on in the admin before anyone sees it.

## After the command

1. `php artisan migrate`, in `backend/`: creates the table.
2. `php artisan rbac:sync`: gives `<name>.view` and `<name>.manage` to the roles that exist (the owner and the manager have both,
   the member can only see).
3. In the admin, on the Flags page, turn on `<name>.enabled`.
4. `pnpm install` at the root, so the new layer is linked, and restart `pnpm dev` so Nuxt sees it.
5. Open the module in the sidebar and try it.
6. When the module no longer looks like the template, remove its two lines from the `ignore` list of `.jscpd.json` (the command
   added them so `pnpm lint:dup` does not report a copy) and run `pnpm lint:dup`. It is the only exclusion the kit allows, and it
   is temporary.

## What it leaves to you

The command decides nothing that depends on what your records are. After it, you decide:

- **The dataset's columns.** It declares the template's columns. Add yours, and mark a column `sensitive` (behind a permission of
  its own) when it holds contact data or anything a reader with plain `<name>.view` should not get. See
  [Add a dataset](add-a-dataset.md).
- **The actions' fields.** The create and update operations take the template's fields. Change them with the form's. Neither
  deletes, and a delete action can never be declared. See [Add an action](add-an-action.md).
- **Whether it is offered at all.** If the module should not appear in `data:verify`'s list, remove `<Name>Data` and its two tags,
  and the two tests with it.
- **The routes that need no permission.** Every route the command writes takes `<name>.view` or `<name>.manage`. A route of your own
  with none, or outside every signed-in group, must be declared (see
  [Declare open and public routes](declare-open-and-public-routes.md)), or `RoutesAreClassifiedTest` fails.
- **The isolation test's record.** It seeds a record with the helper of `tests/Support/<name>-world.php`. If you add a field the record
  needs, add it there too.
- **What the isolation test covers.** The generated test proves the list, the detail and the search never give another workspace's record. A
  write to another workspace's record is covered by the operations test (`<Name>OperationsTest`: a record of another workspace is not
  found) and by row-level security, not by this test.

`php artisan data:verify` checks the new dataset and actions on every deploy, and the CI job "Generated module" runs it after it
makes two modules.

## What to change first

The fields are the template's: a name, a description, a status and an optional due date and branch. The page the command writes
for your module (`docs/packages/<name>.md`) lists, in order, where each one lives: the migration, the model, the DTOs and rules,
the presenter, the types, the form, the table's columns and the words. Change the migration first (it has not run anywhere you
care about yet), then let the module's tests tell you what else follows. Every file starts with a short comment that says why it
is there. Also change:

- the icon of the sidebar entry, of the search group and of the **+** action, which is a briefcase everywhere;
- who gets the permissions, in `src/<Name>RoleTemplates.php`;
- the status values, or take the status away;
- the branch: keep it if a record may belong to a branch, and read [Scope data by branch](scope-data-by-branch.md) for the
  rule; if records never do, take the column, the rule and the select out.

## What the command already did

A new screen of the kit only knows about a module once the module has told it. These are the four things a module has to
register, and the command registers each of them. Each has a guide for changing it, and a test in the kit (the registries refuse
a malformed entry, and the translations tests fail on a label missing in a language). Nothing fails when a module simply leaves
one out, which is why they are a list:

1. **Its search source.** The module's records show up in the global search (`Cmd+K`) as a group of their own, for whoever may
   see them: a `SearchSourceProvider` tagged `search.sources`, a finder that runs the list's own query, and the permission it
   needs. Guide: [Add a search source](add-a-search-source.md).
2. **Its Create action.** The layer pushes `{ id, order, labelKey, icon, to, permission, offWhileImpersonating? }` to the
   `kit:topbar:actions` hook, and the "+" menu offers it to whoever has the permission. Flag it `offWhileImpersonating` when the
   API refuses it for a super admin acting as the person. See [Frontend](../frontend.md) (the hooks table).
3. **Its dashboard widget.** A `DashboardWidgetProvider` tagged `dashboard.widgets` on the backend and a component for the
   `kit:dashboard:widgets` hook. Guide: [Add a dashboard widget](add-a-dashboard-widget.md).
4. **Its menu entry and its permissions.** `<name>.view` at least, the guard of its routes, a place in the role templates and
   an entry in the sidebar. Guides: [Add a permission and a menu entry](add-a-permission-and-menu-entry.md) and
   [Add a role template](add-a-role-template.md).

Beyond the four, the module follows the rest of the standards in AGENTS.md ("Modules"): the platform flag gates its routes, its
search and its widget; the list, the search and the widget start from one query that holds the branch rule; every write route
says whether a super admin acting as the person may use it; and the status is a string with a `CHECK` and a backed enum.

If you write a module by hand instead, go through the same four and the same rules, and read the template beside them.

## No `module.json`

The kit has no manifest file for a module. What a module brings (permissions, menu, flags, search, widgets, blocks) is declared
by providers tagged with the registry they feed, each registry refuses a malformed entry, and a package and a layer are found
by Composer and by Nuxt on their own. A manifest would repeat that, and could disagree with it.

## The template and its stubs

The command does not copy `Projects` at run time, since you may have deleted it. It writes from the stubs in
`backend/packages/Support/stubs/module`: the files of Projects with its name and its words replaced by `%%tokens%%`
(`%%Plural%%`, `%%singular_kebab%%`, `%%es_el%%`...). `Support\Modules\ModuleTokens` lists them, and
`Support\Modules\ModuleStubs` renders them. The comments are kept, so a module you make explains itself as Projects does (the dataset, the operations and the isolation test included, which are Projects'
files with the names taken out), and the `use` lines of each PHP file are put in
Pint's order again, since your module's classes sort differently from Projects'.

**The stubs and Projects never drift.** A Pest test (`ModuleStubsDriftTest`) renders the stubs as `Projects` and compares every
file with the real module, in both directions, so a change to one that the other did not get fails the suite. When you change
Projects (a standard changed), change the same line in its stub. The test skips itself in a repository that removed Projects.

## Taking a module out

Delete `backend/packages/<Name>` and `frontend/layers/<name>`, the two e2e files, the page of the docs, the module's lines in
`backend/composer.json` (`require` and `versions`) and in `.jscpd.json`; then run `composer update` in `backend/` and
`pnpm install`. The same steps remove Projects: see [Remove the Projects module](remove-the-projects-module.md).
