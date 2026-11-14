# Module system

> [!SOON] The module recipe is not written yet. This page will explain what a module is, how it plugs into the kit and how to create one.

What the kit docs already say about modules, until then:

- A module is your own code that sits on top of the kernel packages. It uses their contracts and extension points, the same ones the kit's own packages use. The [Architecture](/kit/concepts/architecture) page shows where your code goes and which four ways a package reaches another.
- The guides cover each extension point a module uses: [permissions and menu entries](/kit/guides/add-a-permission-and-menu-entry), [quotas and feature flags](/kit/guides/add-a-quota-or-feature), [notification event types](/kit/guides/add-a-notification-event-type), [onboarding steps](/kit/guides/add-an-onboarding-step), [data attached to clients](/kit/guides/attach-data-to-clients), [members](/kit/guides/attach-data-to-members) and [branches](/kit/guides/attach-data-to-branches), and [scoping data by branch](/kit/guides/scope-data-by-branch).
- The rules a module has to follow are in [AGENTS.md](/kit/agents-md), and the checks that enforce them run with `composer check` and `pnpm --filter ./frontend check`.
