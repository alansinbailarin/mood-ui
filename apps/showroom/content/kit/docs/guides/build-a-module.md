# Build a module: the checklist

A module of your own is a backend package plus a frontend layer (see [Architecture](../concepts/architecture.md#where-your-code-goes)).
Whatever it does, the kit's screens only know about it once it has told them. Go through this list for every new module,
and tick each line or write down why it does not apply:

1. **Its search source.** Its records show up in the global search (`Cmd+K`) as a group of their own, for whoever may see
   them: a `SearchSourceProvider` tagged `search.sources`, a finder that runs its list's own query, and the permission it
   needs. Roles, the team, the branches and the clients all do. Guide: [Add a search source](add-a-search-source.md).
2. **Its Create action**, if the module creates things. A layer pushes `{ id, order, labelKey, icon, to, permission,
   offWhileImpersonating? }` to the `kit:topbar:actions` hook, and the "+" menu in the dashboard's top bar offers it to
   whoever has the permission. Flag it `offWhileImpersonating` when the API refuses it for a super admin acting as the
   person. See [Frontend](../frontend.md) (the hooks table).
3. **Its dashboard widget**, if it has figures worth a card on the home: a `DashboardWidgetProvider` tagged
   `dashboard.widgets` on the backend and a component for the `kit:dashboard:widgets` hook. Guide:
   [Add a dashboard widget](add-a-dashboard-widget.md).
4. **Its menu entry and its permissions**, always: `<module>.view` at least, the guard of its routes, a place in the role
   templates and an entry in the sidebar. Guides: [Add a permission and a menu entry](add-a-permission-and-menu-entry.md)
   and [Add a role template](add-a-role-template.md).

Each of the four has a test in the kit (the registries refuse a malformed entry, and the translations tests fail on a label
missing in a language), so a module that forgets one still builds: nothing fails when a module is simply absent from the
search, the "+" menu or the home. That is why this is a list.
