# Set up the first super admin

A super admin runs the platform from the [admin host](../configuration/admin-host.md): the workspaces, the flags, the
brand, who signs up. It is not a role of a workspace and gives nothing inside one. The only record of who is one is the
table `platform_admins`, which the app cannot write: only the three commands below write it, connected as the schema
owner, like `migrate`. Run them with `DB_MIGRATION_USERNAME` and `DB_MIGRATION_PASSWORD` set, as `plans:sync` is.

## The first one

1. Put their email in `PLATFORM_BOOTSTRAP_ADMINS` (several, separated by commas):

   ```dotenv
   PLATFORM_BOOTSTRAP_ADMINS=you@example.com
   ```

2. Run, from `backend/`:

   ```bash
   php artisan platform:setup
   ```

   Each listed email that has an account becomes a super admin. An email with no account is skipped with a warning; with
   `--create`, the command asks for that person's name and password (the app's password rules) and makes the account, in
   no workspace. It fails when the list is empty, or when nobody on it was made one.

`platform:setup` does nothing once the platform has a super admin, so it is safe in every deploy (see
[Production](../configuration/production.md#every-deploy)). From then on the list grants nothing, whatever it says.

Locally (`APP_ENV=local`), `db:seed` makes `owner@demo.test`, the demo workspace's owner, a super admin itself, the way
`platform:setup` does, so there is nothing to run. `.env.example` still lists it in `PLATFORM_BOOTSTRAP_ADMINS`, which
`platform:setup` reads if you start from a database with no admin. In `testing` the seeder makes no admin.

## More, or fewer

```bash
php artisan platform:grant-admin someone@example.com [--create]
php artisan platform:revoke-admin someone@example.com
```

`platform:revoke-admin` never takes the role from the last super admin; it ends the person's sessions on the admin host at
once, and their impersonations: the ones open in a workspace and the codes they have not used yet. A person whose account is deleted is no super admin. There is no screen or HTTP endpoint that makes one. Every
change is written to the platform's trail.

## Their password

A super admin signs in on the admin host with their own account's email and password, the same as in a workspace they
belong to. Forgetting it, they reset it from the sign-in page of any workspace they belong to: the admin host has no reset
screen. A super admin who belongs to no workspace (made with `--create`) has no way to reset it, so give the role to
someone who belongs to one, or have them join one.
