# Force a flag for a workspace

A [platform flag](add-a-platform-flag.md) is on, off or rolled out to a share of the workspaces for the whole platform. Sometimes
one workspace needs to be different: a customer who tries a module before the launch, or one that must not have a feature while the
rest do. The admin forces the flag on or off for that workspace, and the workspace ignores the global state for that flag until the
exception is taken back.

## From the admin

1. Open **Workspaces** and then the workspace.
2. Open the **Features** tab. It lists every flag a package declares, with its name, its description and a switch that shows
   what is in force for this workspace.
3. Move the switch. It saves at once and a message says so. If the save fails, the switch goes back and the message says why.

A flag with an exception shows a **Forced** badge, a **Reset** button and a field for a reason. **Reset** takes the exception
back: the workspace follows the global state again. The reason is optional, up to 200 characters. It is saved with the exception
and shown in this tab, and it saves when you leave the field.

The switch always shows the value in force for the workspace. A workspace with no exception shows the global value, so you create an
exception by moving the switch away from it: with the flag on for everyone, switching it off forces it off for this workspace. There is
no single click that forces a flag to the value it already has globally, and none is needed while the global state stays as it is.
To pin a workspace to today's global value anyway, move the switch away and back: the exception stays, with the value you ended on.

The **Flags** page says how many workspaces each flag is forced for ("2 workspaces forced"), so an exception is never forgotten. It counts only workspaces that still exist.
The exceptions of a workspace are also in its **Activity** tab, as "Flag forced" and "Forced flag taken back".

## What decides the answer

For a workspace, a flag answers in this order, and the first rule that applies wins:

1. the workspace's exception, on or off;
2. the flag's global state: off for everyone, or on;
3. the rollout, when the flag is on and has one.

| Global state | Exception | The workspace gets |
| ------------ | --------- | ------------------ |
| off | on | the flag on |
| on | off | the flag off |
| on, rolled out to 30% | on | the flag on, even if its bucket is out of the 30% |
| on, rolled out to 30% | none | the flag on only if its bucket is inside the 30% |

Every exception is cached in one entry, together with the flag states, so exceptions are meant for a handful of workspaces per flag (beta testers, one-off cases), not for hundreds. To reach many workspaces, use the flag's rollout instead.

Code that asks without a workspace (`ChecksPlatformFlags::enabled($slug)`) never sees exceptions. A route behind
`platform-flag:<slug>`, `GET /me` and the menu follow a change at once: the cache is forgotten after the commit.

An exception for a flag that no package declares any more (you removed a module) is ignored, and it is cleaned up when the workspace
is deleted. In a public demo, `platform.impersonation` cannot be forced or reset (403 `demo.locked`); any other flag can.

## From code

The admin's API has the same operations, for a script or a test. All of them need a signed-in super admin on the admin host.

```http
GET    /api/v1/platform/workspaces/{id}/flags
PUT    /api/v1/platform/workspaces/{id}/flags/projects.enabled   {"enabled": true, "reason": "Beta customer"}
DELETE /api/v1/platform/workspaces/{id}/flags/projects.enabled
```

Each flag comes back as `{slug, label, description, global, override, effective}`. The full contract, the errors and the audit
entries are in [Platform](../packages/platform.md#platform-flags).
