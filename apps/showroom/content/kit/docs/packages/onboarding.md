# Onboarding

The first steps of a new workspace: a wizard its owner goes through after signup, a checklist on the dashboard for what
is left, and the workspace template the workspace starts from. Every step is declared by a package (the kernel's two
here, a module's its own), and the backend keeps what each workspace did.

## Permissions

| Permission | Lets a member |
| ---------- | ------------- |
| `onboarding.manage` | see the onboarding, do or skip its steps, leave it for later, resume it and hide the checklist |

It is not the owner's alone, so the manager gets it through its template. A step may ask for one more permission to be
done (its `permission`), and its handler may ask for more (`AuthorizesStep`): the two of the kernel ask Settings whether
the member may change every group they save (`settings.edit`, unless a group names its own). Without it the step shows
read-only and, if it is optional, can be skipped. No menu entry: the dashboard sends whoever may onboard to the wizard.

## Steps

A package declares its steps with a provider tagged `onboarding.steps`, returning `OnboardingStep` value objects
(`MoodKit\Onboarding\Contracts\`). See [Add an onboarding step](../guides/add-an-onboarding-step.md).

| Field | |
| ----- | - |
| `slug` | `<module>.<step>`, snake case: the frontend registers the step's screen for it |
| `labelKey`, `descriptionKey` | its title and its line, translation keys in every language |
| `handler` | a `StepHandler`: `rules()` and `attributes()` of what its form sends, `values($tenantId)` it starts with, `handle($tenantId, $userId, $input)` |
| `order` | smallest first; the kernel's are 10 and 20, a module's from 100 |
| `required` | it cannot be skipped, and until it is done the workspace is held back (see [What a required step holds back](#what-a-required-step-holds-back)) |
| `prerequisites` | required steps of a lower order that must be done first |
| `permission` | what a member needs, besides `onboarding.manage`, to do it |

A handler that also implements `AuthorizesStep` says itself who may do the step: `missingPermission($tenantId, $userId)`
returns the permission the member lacks, or null. It is asked for `canComplete` and before the form is checked, after
`permission`.

The registry checks it all the first time it is read, and a mistake fails with the step and what is wrong: a slug that is
not `<module>.<step>`, two providers with one slug, a handler that is not a `StepHandler`, a prerequisite that does not
exist, is optional or comes after. Nothing of it is in the database: there is no catalog to sync. `php artisan
onboarding:verify`, in the deploy script, builds all of it (steps, template sections and templates) and checks that
`onboarding.template` names a template some package declares, so a mistake fails the deploy instead of the first
signup.

## The kernel's steps

| Step | Required | Order | Saves | Needs |
| ---- | -------- | ----- | ----- | ----- |
| `workspace.profile` | yes | 10 | the workspace's name (`identity.name`), timezone, default language and currency (`localization`) | to change `identity` and `localization` |
| `workspace.appearance` | no | 20 | its brand color (`identity.primaryColor`); the logo uploads on the spot through Settings | to change `identity` |

Both save through `UpdatesWorkspaceSettings`, so a value the settings page refuses is refused here in the same words,
and the history and the audit trail have it. The profile saves its two groups as one (`updateGroups()`): one 422 names
every field refused, and both groups are kept or neither. When a module says a change affects its records (a
`ChangeImpactProvider`: the upcoming visits a new timezone moves), the step answers 409 `settings.confirmation_required`
with `meta.impacts`, as the settings page does, and saves once the form is sent again with `"confirm": true`. Who may do them is who the settings page lets change those groups
(`ChecksSettingsAccess`): `settings.edit`, or a group's `editPermission`, and a group's `permission`. Their screens are the `settings` layer's.

### Steps the kit's packages bring

| Step | Package | Required | Order | Does | Needs |
| ---- | ------- | -------- | ----- | ---- | ----- |
| `team.invite` | Team | no | 100 | invites up to `team.onboarding_invitations` (10) people by email and role, with the rules of the Team page | `team.invite` |
| `branches.first_branch` | Branches | no | 110 | "Confirm your main branch": where the workspace's main branch is (its address and point), never adding another; with `branches.create_main_branch` off, "Add your first branch" (its name, place and contact), or edits the oldest when there is one | `branches.manage` |

Inviting the team is Team's step and adding the first branch is Branches', not the kernel's: remove the package and its
step goes with it. See [Team](team.md#onboarding) and [Branches](branches.md#onboarding); the
[guide](../guides/add-an-onboarding-step.md) uses Team's as its example.

## What a required step holds back

A workspace with no `completed_at` and a required step not done is **held back**:

- the dashboard sends whoever may onboard it to the wizard (unless they left it for later);
- the routes behind the `onboarded` middleware refuse, for every member, with 403 `onboarding.incomplete` and
  `meta.steps` (the required steps left).

No route of the kit takes `onboarded`: sign-in, `/me`, settings, roles, the subscription and the onboarding itself are
always there, so the way out is never behind it. A module puts it on what makes no sense in a workspace not set up yet:

```php
Route::middleware(['workspace', 'permission:booking.publish', 'onboarded'])
    ->post('booking/page/publish', PublishBookingPageController::class);
```

Code that runs without a route (a job) asks `MoodKit\Onboarding\Contracts\ChecksOnboarding`:
`isComplete($tenantId)`, or `ensureComplete($tenantId)`, which throws the same refusal. It answers only as that
workspace: a job queued inside it (or a `TenantScopedJob`) runs as it, and anything else (a command, a job of the
scheduler) wraps the call in `RunAsTenant`. With no workspace current it throws `tenancy.required`, and about another
workspace `tenancy.mismatch`: row-level security would hide the onboarding, and none would read as never held back.

Leaving the onboarding for later does not lift it. A completed onboarding never holds back again, not even for a
required step a module adds later: new steps reach only the workspaces still being set up. A workspace with no onboarding
(made before the package, or by a seeder) is never held back.

## What a workspace keeps

| Table | Holds |
| ----- | ----- |
| `tenant_onboarding` | one row per workspace: the template it started from, `started_at`, `postponed_at`, `completed_at` |
| `tenant_onboarding_steps` | one row per step the workspace decided: `completed` or `skipped`, who and when |

A step with no row is pending, so a step a module adds later shows up pending in every workspace still being set up, with
no migration. A decision about a step no package declares any more is ignored. Both tables have row-level security.

A step is `pending`, `completed` or `skipped`. The onboarding is `in_progress`, `postponed` or `completed`: completed once
every step is decided, and never postponed then. Workspaces made before the package was installed start completed.

## When it is completed

Once every step is decided, the onboarding is completed: `completed_at` is set (and `postponed_at` cleared), the audit
trail gets `onboarding.progress.completed`, and `MoodKit\Onboarding\Events\OnboardingCompleted` (`tenantId`, `userId`:
who made the last decision) is sent after the commit. Required steps cannot be skipped, so a completed onboarding has
every required step done. After that, nothing of it changes: the workspace edits the same things in Settings.

Every change takes the workspace's lock for its transaction, so two members finishing at once complete it once.

## The email of a set-up workspace

Onboarding declares the notification event type `onboarding.completed` (see [Notifications](notifications.md)). When the
onboarding is completed, its owner gets an email ("Acme Studio is set up") saying who finished it, with a button to the
dashboard, and the same in their inbox (`in_app`). Its key is the workspace's, so it is sent once per workspace. It goes to `role:owner` by default, and its sends
to the workspace's people do not count against the plan's email quota (to other addresses, or sent again, they count,
like the plan's notices). The workspace changes its words and its audiences in Settings → Notifications. Asking for it
never fails the change that completed the onboarding: a failure is reported as Support's `MaskedFailure`, with every
address hidden.
Run `php artisan notifications:sync` after installing the package (the deploy script does).

## Starting, and workspace templates

When Signup makes a workspace (`WorkspaceProvisioned`, inside its transaction), the workspace's onboarding starts, and
the workspace template the app names in `onboarding.template` (`ONBOARDING_TEMPLATE`) is applied: the one place a
template is applied. A template is sections, each applied by the package that declares it; the kernel brings `settings`.
See [Add a workspace template](../guides/add-a-workspace-template.md). The kernel ships no template: with
`ONBOARDING_TEMPLATE` empty, a workspace starts with its packages' defaults. With no step declared at all (the kernel's provider
taken out), the onboarding is completed as it starts, which sends `OnboardingCompleted` like any other completion.

The demo workspace's onboarding is already completed (`DemoOnboardingSeeder`). To go through the wizard, create a
workspace through signup.

## API

Every route is under the `workspace` group and `permission:onboarding.manage`. Every change answers with the whole
onboarding, like `GET /onboarding`, and has the `onboarding` limiter (`onboarding.changes_per_minute` per member).

### `GET /onboarding`

```json
{
  "data": {
    "status": "in_progress",
    "template": null,
    "startedAt": "2026-06-01T10:00:00Z",
    "postponedAt": null,
    "completedAt": null,
    "requiredLeft": 1,
    "left": 2,
    "nextStep": "workspace.profile",
    "steps": [
      {
        "slug": "workspace.profile", "label": "Your workspace", "description": "Its name, timezone, currency and default language.",
        "order": 10, "required": true, "prerequisites": [], "status": "pending", "available": true, "canComplete": true,
        "values": { "name": "Acme Studio", "timezone": "UTC", "locale": "en", "currency": "USD" }, "decidedAt": null
      }
    ]
  }
}
```

- `status`: `in_progress`, `postponed` or `completed`. `requiredLeft`: required steps not done; `left`: steps with no
  decision; `nextStep`: the first of those, where the wizard goes (null once every step is decided).
- A step's `status` is `pending`, `completed` or `skipped`. `available` says its prerequisites are done; `canComplete`,
  that this member may do it; `values`, what its form starts with, sent only when `canComplete` is true (`{}` otherwise:
  a member who may not do a step does not read what it holds). A handler whose `values()` fails is reported and its
  step sent with `{}`: the rest of the answer, and a change already kept, are not lost to it.
- Labels are in the language of the request. A workspace with no onboarding is 404 `onboarding.not_found`.

### The onboarding in `GET /me`

`onboarding` is `{status, requiredLeft, left, nextStep}` for whoever may set the workspace up, and `null` for anyone
else or a workspace with no onboarding.

### `POST /onboarding/steps/{step}/complete`

The fields of the step's form at the top of the body (`{"name": "Acme", "timezone": "America/Tijuana", ...}`), checked
with its handler's rules; a field it does not take is refused (`validation.prohibited`), whatever it holds, `null` included: one no rule names at the top
(`items.*.name` takes `items`), or one sent with a dot in its name. A body that is not a JSON object is 422
`validation.json_object`. Whether the member may
do the step is asked first (403 `auth.forbidden` with `meta.requiredPermission`: the step's `permission`, or what its
handler asks). Its work and its record run in one transaction: a
refusal of the work (a `ValidationException`) lands on its field and keeps nothing.

- 409 `onboarding.prerequisites_missing` (with `meta.steps`) when it waits for steps not done yet.
- 409 `settings.confirmation_required` (with `meta.impacts`) from a kernel step whose change a module says affects its
  records; send the same fields again with `"confirm": true`.
- 409 `onboarding.already_completed` once the onboarding is completed.
- 404 `onboarding.step_not_found` for a step no package declares.

A step done or skipped before can be done again while the onboarding goes on.

### `POST /onboarding/steps/{step}/skip`

Skips an optional step that is pending; a done or skipped step is left as it is. A required one is 409
`onboarding.step_required`. No body.

### `POST /onboarding/postpone`, `/resume` and `/dismiss`

No body.

- `postpone`: the dashboard stops sending to the wizard and shows the checklist instead. What a required step holds back
  stays held back.
- `resume`: undoes it (opening the wizard resumes too).
- `dismiss`: hides the checklist for good. It skips every step left, which completes the onboarding. While a required
  step is left it is 409 `onboarding.required_steps_pending` (with `meta.steps`).

Postponing twice, or resuming what is not postponed, changes nothing. Once the onboarding is completed, all three are
409 `onboarding.already_completed`.

## The `onboarding` layer

- **The summary:** `onboarding-session.ts` reads `onboarding` from `GET /me` into the layer's `useOnboardingSummary()`,
  emptied on sign-out.
- **The redirect:** the global `onboarding` middleware sends whoever may set the workspace up from any `/dashboard` page
  to `/onboarding` while a required step is left and the setup was not left for later, and from `/onboarding` back to the
  dashboard once the workspace is set up.
- **The wizard (`/onboarding`):** its own layout (the whole window), drawn by the browser. From top to bottom:
  - the top bar: the workspace's logo and name (core's `WorkspaceMark`, as in the dashboard's), and Finish later
    (postpone);
  - from `lg`, a sidebar the whole height at the left, on its own surface with a line at its right: the progress, then
    the steps with room between them, each with its number (a check once done), its title and where it stands, the one
    on screen highlighted, and a button to open a decided step or the next one left (the kit's own list of mood-ui's
    parts: mood-ui's vertical `Stepper` puts no space between its steps). Below `lg`, a progress bar in a strip under
    the top bar;
  - the step's title and line as the page's header (mood-ui's `PageHeader`, large: the page's `h1`), then its screen,
    which a layer registers through core's `kit:onboarding:steps`;
  - the footer, the whole width with the top bar's padding, so its buttons line up with Finish later: Back, Skip (an
    optional step) and Continue, Finish on the last step left. Below `sm` Back and Skip are icons with their tooltip.

  Continue sends the screen's form (core's `useOnboardingStepForm()`). When a kernel step answers 409
  `settings.confirmation_required`, the wizard asks as the settings page does (core's `useImpactConfirmation()`, what the
  change affects, Save anyway and Cancel) and sends the same form again with `"confirm": true`; a no keeps the step on
  screen, and the next Continue asks again. After each step it goes on to the first step left,
  and reloads the session, so a new name or brand shows at once. A step with no screen, or one the person may not do,
  says so. Opening the wizard resumes a setup left for later.
- **The checklist:** a banner above every dashboard page (`kit:dashboard:banners`, after the past-due notice) while
  something is left that the dashboard does not send to the wizard for, in the warning color (its progress bar, its
  badges and its buttons too, as the past-due notice). It shows the progress and the steps left (Required, To do,
  Skipped), with Continue setup and Hide. Hide shows only once no required step is left; it asks
  first, then skips the rest.

The screens of the kernel's two steps are the `settings` layer's (see [Settings](settings.md#the-settings-layer)).

## Configuration

| Key | Env | Default | |
| --- | --- | ------- | - |
| `onboarding.template` | `ONBOARDING_TEMPLATE` | empty | the workspace template every new workspace starts from; `onboarding:verify` fails on one no package declares |
| `onboarding.changes_per_minute` | | 60 | changes one member may make to the onboarding in a minute (the `onboarding` limiter) |
