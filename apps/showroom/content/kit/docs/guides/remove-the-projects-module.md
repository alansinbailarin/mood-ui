# Remove the Projects module

Projects is the kit's example module. Nothing of the kernel depends on it, so you can delete it whenever you stop needing a
worked example. These are the steps, in order. Run them from the repository root, on a branch. The steps are tested: they were followed to the letter on a copy of the
repository, and Pint, Deptrac, Larastan, Rector, the architecture tests, the frontend's lint and typecheck, and the dead-code and
duplicate checks all passed.

## 1. Decide what becomes of its data

If you ran the migrations, the `projects` table exists in your database. Choose one:

- In a **development** database you can lose, do nothing now: after step 2, `php artisan migrate:fresh --seed` (from
  `backend/`) rebuilds the database without the table.
- To keep the rest of the development data, drop the table as the schema owner and forget its migration:

  ```sql
  DROP TABLE projects;
  DELETE FROM migrations WHERE migration = '2026_11_30_000001_create_projects_table';
  ```

- In a database that holds real projects, decide first what becomes of them. `migrate:fresh` refuses to run in production, on
  purpose, and the kit never drops a table for you.

Its example rows in a public demo are `backend/database/seeders/DemoProjectsSeeder.php`, which lives in the app so the module's files stay what `kit:make-module` writes. Delete that file too, and in `backend/database/seeders/DatabaseSeeder.php` the `use MoodKit\Projects\Actions\CreateProject;` line and the `if (class_exists(CreateProject::class))` block that calls it.

The platform flag `projects.enabled` may have a row in `platform_flags`; the admin's Flags page stops listing it as soon as
the package is gone, and the row is harmless.

## 2. Take the package out of Composer

```bash
cd backend
composer remove mood-kit/projects
```

That deletes the `require` and rewrites `composer.lock`. Then remove the line `"mood-kit/projects": "dev-main"` from the
`versions` map of the path repository in `backend/composer.json` (Composer does not touch it), and delete the folder:

```bash
rm -rf packages/Projects
composer dump-autoload
```

Deptrac needs no change: its layers are found by namespace, so a package that is gone leaves nothing behind.

## 3. Delete the frontend layer and the e2e harness

```bash
rm -rf frontend/layers/projects
rm frontend/tests/e2e/projects.spec.ts frontend/tests/e2e/support/modules/stub-projects.ts
pnpm install
```

`pnpm install` removes the `frontend/layers/projects` importer from `pnpm-lock.yaml`. Nothing else of the e2e harness names
Projects: the stub API finds the stub of a module by its file name in `frontend/tests/e2e/support/modules/`, so deleting the
file is all it takes.

In `.jscpd.json`, take `backend/packages/Projects/**` and `frontend/layers/projects/**` out of the `ignore` list (the duplicate
check ignores the template, which the modules made by `kit:make-module` copy).

## 4. Take it out of the docs

- Delete `docs/packages/projects.md` and this guide.
- `docs/README.md`: the Projects line under "Packages and layers", the line of this guide under "Guides", and "plus Projects,
  the example module" in the opening paragraph.
- `docs/guides/build-a-module.md`: the two links to Projects (in its opening paragraph, and in "Taking a module out"). The
  stubs of `kit:make-module` stay: they do not need Projects, and `ModuleStubsDriftTest` skips itself without it.
- `AGENTS.md`: the paragraph that starts "`backend/packages/Projects` and `frontend/layers/projects` are the **reference
  module**" in "Layout", and the section "Modules" (its rules are the standard for a module of yours: keep the section and
  delete only the lines that name Projects' tests if you want to keep them).
- `CHANGELOG.md`: the Projects bullet under `Added` and, in the `Upgrading` list of `[Unreleased]`, the two Projects bullets: the one that starts "If your app already has anything named
  `projects`" and the one that starts "Run `composer install` in `backend/` and `pnpm install` at the root (a new package" (keep the other entries).

Nothing else mentions the module. What it added to the kernel stays, because a module of your own uses it: the dashboard's
handling of a menu entry's `featureFlag`, core's `platformFlag` page meta (`docs/frontend.md`) and Auth's `impersonation-allowed`
route middleware.

## 5. Check

```bash
(cd backend && composer check)
pnpm --filter ./frontend check
pnpm quality
```

While no module has a stub in `frontend/tests/e2e/support/modules/`, Knip prints a configuration hint that its entry pattern
`tests/e2e/support/modules/stub-*.ts` matches nothing. It is only a hint: the check still passes, and the pattern is
needed again as soon as you make a module.

After a deploy of the removal, `php artisan rbac:sync` is not needed: it only adds, and `projects.view` and `projects.manage`
are no longer declared, so no role is offered them again. A custom role that held them keeps two unused rows in `permissions`,
which you may delete.
