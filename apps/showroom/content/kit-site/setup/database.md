# Database and its roles

PostgreSQL holds every workspace in the same tables, kept apart by row-level security. That only works when the app connects as a role that cannot bypass it, so the kit uses several roles instead of one. The reference is [Multi-tenancy](/kit/concepts/multi-tenancy) and the Database part of the [production checklist](/kit/configuration/production).

| Role | Env | What it does |
| ---- | --- | ------------ |
| app (runtime) | `DB_USERNAME`, `DB_PASSWORD` | what the API connects as. Owns nothing, cannot bypass RLS. |
| owner | `DB_MIGRATION_USERNAME`, `DB_MIGRATION_PASSWORD` | owns the schema. `migrate`, `plans:sync` and `notifications:sync` connect as it. |
| platform | `DB_PLATFORM_USERNAME`, `DB_PLATFORM_PASSWORD` | read-only role that bypasses RLS, for the admin's reads across workspaces. Every read is logged. Optional. |
| catalog | `DB_CATALOG_USERNAME`, `DB_CATALOG_PASSWORD` | writes the catalog of plans and its Stripe prices, nothing else. Optional: without it the admin's plan editor is read-only. |
| admin | `DB_ADMIN_USERNAME`, `DB_ADMIN_PASSWORD` | the superuser Docker Compose creates the others with. Admin work only, never the app. |

## Local

Docker Compose starts Postgres and creates all five roles with the public development passwords of `.env.example`.

```bash
docker compose up -d --wait
cd backend
php artisan migrate
php artisan db:seed
php artisan tenancy:verify-rls
```

Postgres applies the roles only when it first creates its volume. If you change a role or password in `.env` afterwards, recreate the volume (`docker compose down -v`) or alter the role by hand. The test database is named after `DB_DATABASE` with a `_test` suffix.

## Production

1. Create the schema owner and the runtime role as plain roles: `NOSUPERUSER`, `NOBYPASSRLS`, never the managed database's admin user. The owner owns the database; the runtime role owns nothing.
2. Create the platform role (`BYPASSRLS`, read-only, `log_statement = 'all'`) and the catalog role (`log_statement = 'mod'`) as the database superuser, before the first migration, because the migrations grant them their tables. The SQL is in the production checklist. Some hosted plans do not allow `BYPASSRLS`: leave `DB_PLATFORM_USERNAME` empty and only the reads across workspaces are unavailable.
3. Use new passwords. The ones in `.env.example` are public.
4. Set `TENANCY_ENFORCE_RLS=true`, so the app refuses a role that is a superuser or has `BYPASSRLS`.
5. Connect directly, or through a pooler in session mode. Transaction mode would leak the workspace between requests.
6. Run the migrations as the owner, then `php artisan tenancy:verify-rls` on every deploy. It fails the deploy when a role has more power than it should.
7. Take backups. The app cannot edit or truncate the audit trail.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
