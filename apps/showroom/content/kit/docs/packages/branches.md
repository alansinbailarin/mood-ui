# Branches

A workspace's branches: where it works. Each has a name, an address and its point on the map, a timezone, contact details,
its opening hours and the people who work there. Branches depends on Auth, Rbac, Plans, Settings, Onboarding, Signup (its `WorkspaceProvisioned`), Search, Audit, Team,
Support and Tenancy through their contracts, and none of them depends on it: remove the package and nothing else changes
(the location picker, which lives in the frontend's `core` and asks [Geocoding](geocoding.md), keeps working). Only
[Clients](clients.md) depends on it: a client's home branch is a branch, so Clients needs Branches installed.

## Permissions and the menu

| Permission | Lets a member | Requires |
| ---------- | ------------- | -------- |
| `branches.view` | see the branches of the workspace, where they are, their hours and their people | |
| `branches.all` | see the records of every branch, not only those of the branches where they work, and choose "All branches" in the sidebar's switcher | |
| `branches.manage` | add, edit, deactivate, reactivate and delete branches, and set their hours and people | `branches.view`, `branches.all` |

The owner has every permission. The manager gets all three through its template (`all`). Branches gives the `member` role
`branches.view`: people work at branches and see where. A custom role may hold `branches.all` too (a front desk for every
branch). Managing the set of branches is the whole workspace's, so `branches.manage` requires `branches.all`: whoever adds a
branch sees it afterwards.

After a deploy that brings `branches.all`, `php artisan rbac:sync` gives it to the owner and the manager of every workspace,
and to every role of a workspace's own that holds `branches.manage` (a role saved before `branches.manage` required it;
the migration `2026_11_29_000001_complete_what_roles_require` does the same once). Until then such a role still manages only
the branches its holder works at: every action on one branch (edit, hours, people, deactivate, reactivate, delete) looks it
up as the person may see it (`Places\BranchLookup`), and any other is the same 404 `branches.not_found`.

The menu entry is `/dashboard/branches` ("Branches", icon `map-pin`), in the `administration` section with order 7 (after
Team), for whoever has `branches.view`.

## Configuration

`backend/packages/Branches/config/branches.php` holds the defaults; nothing is read from the environment.

| Key | Default | |
| --- | ------- | - |
| `branches.changes_per_minute` | 30 | changes one member may make to branches (data, status, hours, people) in a minute (the `branches` limiter) |
| `branches.switches_per_minute` | 60 | times one member may change the branch they work at in a minute (the `branch-switch` limiter) |
| `branches.impersonation_choice_minutes` | 60 | how long the branch a super admin picks while acting as someone is kept, apart from the person's own choice |
| `branches.history_entries` | 20 | latest changes a branch's history lists |
| `branches.branches_per_page` | 25 | rows of a page of the list |
| `branches.member_options` | 50 | people the picker of a branch's people offers at most |
| `branches.members_per_branch` | 500 | people a branch may have |

## Branches

### The tables

`branches` (row-level security with `FORCE`) keeps one row per branch:

| Column | Type | |
| ------ | ---- | - |
| `id`, `tenant_id` | uuid | the branch, and its workspace (`tenants`, cascades) |
| `name` | 120 | what people call it; unique in the workspace whatever its case (`lower(name)`) |
| `slug` | 80 | a short name for addresses (`^[a-z0-9]+(-[a-z0-9]+)*$`, a `CHECK` says so); unique in the workspace |
| `is_active` | boolean | whether it is open for business; true when made |
| `address_line_1`, `address_line_2` | 180 | the street and number, and the rest (optional) |
| `city`, `state`, `postal_code` | 120, 120, 20 | the city; the state and postal code are optional |
| `country` | char 2 | ISO 3166-1 alpha-2, uppercase (a `CHECK` says so) |
| `latitude`, `longitude` | `decimal(9,6)` | the point on the map: both or neither, within -90 to 90 and -180 to 180 (a `CHECK`); six decimals is about 0.1 m |
| `timezone` | 64 | the zone its opening hours are in |
| `phone`, `email` | 32, 190 | contact details, optional; the email in lowercase (a `CHECK`) |
| `notes` | 1000 | free text, optional |
| `created_at`, `updated_at` | `timestamptz` | |

Besides `(tenant_id, slug)` and `(tenant_id, lower(name))`, `(tenant_id, id)` is unique too: a module's rows hang from a
branch by `(tenant_id, branch_id)` → `branches (tenant_id, id)`, so no workspace can point at another's branch even if
its code fails.

A branch is active or not (`is_active`), not one of a catalog of statuses: open or closed is all the kernel knows, and a
module that needs more (closed for works, opening soon) keeps it in its own table.

`branch_hours` keeps the opening week and `branch_members` the people: see [Opening hours](#opening-hours) and
[People](#people). Both hang from the branch by `(tenant_id, branch_id)` and go with it.

`branch_selections` (row-level security with `FORCE`) keeps the branch each person chose to work at, one row per
membership: `tenant_id`, `user_id`, `branch_id` and `updated_at`. No row means the person never chose, and no branch
(`branch_id` null) means "All branches". It hangs from the membership by `(tenant_id, user_id)` → `memberships` and from the
branch by `(tenant_id, branch_id)` → `branches (tenant_id, id)`, both cascading: removing someone or deleting the branch
takes the choice away, and nobody can choose another workspace's branch. Only the person's own `PUT /me/branch` writes it,
and what it says is checked again on every request (see [The branch someone works at](#the-branch-someone-works-at)).

### Adding a branch

`POST /branches` (`branches.manage`) adds an active branch:

- **Required:** `name`, `addressLine1`, `city` and `country`. Everything else is optional: a branch with no point on the map,
  no phone and no email exists.
- **Checked:** the name, the address lines, the city, the state and the postal code are plain text on one line (Support's
  `PlainName`: no control or direction-turning characters); `country` is one of the 249 ISO 3166-1 alpha-2 codes, in
  capitals (Support's `CountryCodes`); `latitude` and `longitude` come together or not at all, within -90 to 90 and -180
  to 180, and are kept to six decimals; `timezone` is an IANA name (`timezone:all`); `phone` is E.164 (`+526641234567`,
  what mood-ui's `PhoneInput` gives); `email` is ASCII and strict, kept in lowercase; `notes` may run over several lines,
  up to 1000 characters, with no control character but line breaks and tabs, no bytes that are not UTF-8 and none that
  reorder the text (Support's `MultilineText`, 422 `validation.multiline_text`). Text is trimmed and a blank field is kept as nothing. The rules live in
  `Validation\BranchRules`, which the onboarding step uses too.
- **Name:** unique in the workspace whatever its case: another branch's name is 422 `branches.name_taken` on `name`.
- **Slug:** a short name a module may put in addresses (`^[a-z0-9]+(-[a-z0-9]+)*$`, up to 80). Without one, it comes from
  the name (`Café Ñandú` is `cafe-nandu`; a name that gives none is `branch`) and, when the workspace has that one, the
  next free `-2`, `-3`…, under a lock of the workspace's slugs, so two branches named alike take turns. A slug someone
  chose that another branch has is 422 `branches.slug_taken` on `slug`.
- **Timezone:** the workspace's (Settings' `localization.timezone`) unless one was given. From then on it is the
  branch's: a later change of the workspace's timezone does not touch it.
- **Plan:** one more active branch, asked of the plan inside the transaction (see [Quota](#quota)).
- **Impersonation:** never while a super admin acts as someone (403 `auth.impersonation_forbidden`): a branch spends a
  place the workspace pays for. The route takes `not-impersonating`, and `CreateBranch` refuses it too, for the onboarding
  step.
- **Audit:** `branches.branch.created`, with the branch as the API names its fields, its status, and two names of the
  trail's own: the point as `point` (`{lat, lng}`, or null) and the postal code as `postal`. Auth registers `code` as a
  secret field, so Audit would redact any key with that word (`postalCode`); a branch's place is business data, not a
  secret, so it is kept under keys Audit leaves alone. (Geocoding's `latitude` and `longitude` are kept out of Sentry
  only, with `SentryOnlyFields`, which Audit does not read.)

The answer (201) is the branch as its page shows it (see [Reference](#reference)).

### Editing a branch

`PATCH /branches/{branch}` (`branches.manage`) changes the fields that came and nothing else, by the same rules as adding
one; `name`, `addressLine1`, `city` and `country` cannot be emptied. `latitude` and `longitude` still come together, even
when only one moves: both null take the point away. A `slug` or a `timezone` sent empty keeps the one the branch has.

- **Slug:** renaming a branch keeps its slug, since a module may have put it in a public address; change it only by
  sending a new `slug` (422 `branches.slug_taken` when another branch has it).
- **Locks:** the branch's row is locked, so two edits take turns; a chosen slug takes the workspace's slug lock first, as
  adding a branch does.
- **Audit:** `branches.branch.updated`, with only what changed, before and after (the point as `point`, the postal code as
  `postal`); an edit that changes nothing writes nothing.
- **Impersonation:** allowed: support may need to fix a branch's data or place. The entry names the admin
  (`impersonator_user_id`).

### Deactivating and reactivating

`POST /branches/{branch}/deactivate` takes a branch out of work and `POST /branches/{branch}/reactivate` puts it back
(`branches.manage`). A deactivated branch keeps its data, hours and people, and frees its place in the plan; reactivating
asks the plan for one again (the row's lock, then the quota's), so at the limit it is 422 `plans.quota_exceeded`. A branch
already in that status is 409 `branches.not_active` or `branches.not_inactive`. Each is audited
(`branches.branch.deactivated`, `branches.branch.reactivated`, with `isActive` before and after) and tells modules after
the commit (see [Events](#events)). Never while a super admin acts as someone: whether a branch takes work is the
business's call, and its customers see it.

Nothing in the kernel needs an active branch: a workspace may deactivate its last one.

### Deleting a branch

`DELETE /branches/{branch}` (`branches.manage`) deletes the branch with its hours and people, which cascade, and any
module's rows that cascade with it. A module's row that holds on to the branch (`restrictOnDelete()`, or a key's default,
no action, even one `DEFERRABLE INITIALLY DEFERRED`: the deletion makes every constraint immediate first) stops the
deletion: 409 `branches.in_use`, and nothing changes; deactivate it instead. It is audited
(`branches.branch.deleted`, with everything the branch held) and tells modules after the commit. The clients whose home
branch it was are left with none (the key is `ON DELETE SET NULL (home_branch_id)`): they become the whole workspace's, and
never stop the deletion. A super admin acting as
someone never deletes (every `DELETE` of a member's routes is refused during an impersonation).

## Location

A branch's place is its address (`addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`) and, if it has
one, its point on the map (`latitude`, `longitude`, both or neither). The two are kept as they came: the backend never
fills one from the other. The screens do, through the location picker of the frontend's `core`, which asks
[Geocoding](geocoding.md) to turn an address into a point and a point into an address; what the person accepts is what
the page sends.

The trail keeps the point as `point: {lat, lng}` and the postal code as `postal` (see [Adding a branch](#adding-a-branch)).
What someone typed in the map's search never reaches a branch's trail: Geocoding's two searches change nothing and audit
nothing, and only the address and point that were saved are kept.

## Opening hours

`branch_hours` (row-level security with `FORCE`) keeps one row per day the branch opens, as Support's [week of
hours](support.md#hours) is kept: the ISO weekday (Monday 1 to Sunday 7, a `CHECK`) and its span (`starts_at`, `ends_at`,
Postgres `time`, ending after it starts, a `CHECK`). A day with no row is closed; a branch with no rows has said no hours.
The times are wall-clock times of the branch's own `timezone`, not the workspace's.

`PUT /branches/{branch}/hours` (`branches.manage`) replaces the week with the seven days it is sent, in Support's shape
(`WeekRequest`): `days` is a list of exactly seven `{weekday, enabled, startsAt, endsAt}`, each weekday once; an open day
has one span, `H:i`, closing after it opens; the times of a closed day are not read. A week with every day closed forgets
the hours (`hours: null` on the branch's page). The answer is the seven days, with null times on a closed day. The branch's
row is locked while the week is replaced. It is audited (`branches.branch.hours_updated`, with the seven days before and
after) and an impersonation may do it (support may need to fix it; the entry names the admin).

What the week does not hold: more than one span a day (a break at noon), closures, holidays and exceptions. What a closure
is (the whole day or part of it, once or every year, who sees it) depends on the module that uses it (Booking), so the
module keeps it in a table of its own: see [Attach data to branches](../guides/attach-data-to-branches.md). A module reads a
branch's week with `ReadsBranches::hours()` (see [For a module](#for-a-module)).

## People

`branch_members` (row-level security with `FORCE`) says who works at each branch: `(tenant_id, branch_id, user_id)`, with a
foreign key to the branch and another to the membership (`memberships (tenant_id, user_id)`), both cascading. Removing
someone from the workspace takes them off their branches; deleting a branch takes its people off it; nobody without a
place in the workspace can be put on one.

`PUT /branches/{branch}/members` (`branches.manage`) leaves exactly the people of `userIds` on the branch (a list of user
ids, each once, up to `branches.members_per_branch`; an empty list takes everybody off). An id is read in lowercase, as the
database spells it, so one sent in capitals is the same person (and the same one twice is once). Only who changes is checked
and written:

- **Members first:** someone added must have a place in the workspace, active or inactive; anyone else is 422
  `branches.member_not_found` on `userIds`.
- **Team's rule:** the person acting must reach each one added or taken off, as for a member's hours and skills: oneself
  always, an owner everyone, anybody else only someone whose role they could give (never someone who holds no role).
  Branches asks Team through
  `Team\Contracts\MemberAccess::ensureCanEdit()`, so the refusals are Team's: 403 `team.owner_only` (an owner, for someone
  who is not one) and 403 `team.above_your_role` (a manager on another manager). Those who do not change are not asked
  about: a manager may add someone to a branch where an owner works.
- **Locks:** first the branch's own (`branches:people:<tenant>:<branch>`), so two saves of one branch's people take turns
  and each works out who changes from what the one before left (two managers saving at once lose nothing: the last one's
  list is what stays). Then, in Team's order, each member who changes, by id, with Team's own lock
  (`MemberAccess::hold()`, the one a member's place, hours and skills take), then the branch shared (`FOR SHARE`), so a
  deletion of the branch waits and two changes of one member take turns. Someone removed from the workspace in the meantime is 404 `team.member_not_found`.
- **Audit:** `branches.branch.members_updated`, with the people by name, sorted, before and after, as they were under the
  locks; a change that changes nothing writes nothing. An impersonation may do it (the entry names the admin).

The answer is the branch's people, as its page lists them (`{id, name, email, status}`, oldest member first). People's
emails are for whoever may see the team (`team.view`), as on the team's screens: anyone else gets `email: null`, here, on
the branch's page and in `member-options`, and reads names alone. (`member-options` still matches its `search` against
emails: whoever manages branches without `team.view` can tell whether a member's email contains some text, never read it.)

`GET /branches/member-options` (`branches.manage`) offers the workspace's members to choose from: up to
`branches.member_options`, oldest member first, narrowed by `search` (words of the name or the email, up to 100
characters), each as `{id, name, email, status}`. A member's page shows the branches they work at from
`GET /branches?member={userId}`.

People are written only from a branch's page: one way to write keeps one order of locks. A member's working hours stay
one week (Team's): a module that needs who works where and when (Booking) crosses `ReadsWorkingHours`,
`ReadsBranches::hours()` and `ReadsBranches::members()`.

## Who sees which branch

A workspace works by branch once it has two active branches or more. Below that, nothing follows a branch: everyone sees
everything, and there is no branch to choose.

The line between the two is a cliff, not a slope, and it moves with the active branches alone:

- **From one to two active branches** (adding or reactivating the second), filtering starts at once, on the next request:
  someone without `branches.all` sees only the branches they work at, the team list follows the branch each person
  chose, and whoever works at no branch sees nothing of one and gets the "no branch" notice. Set who works where before
  the second branch goes live.
- **From two to one** (deactivating or deleting one), filtering stops at once: everyone sees everything again, the records
  of the inactive branch included (its page, its history, a module's rows that point at it), and the sidebar's switcher is
  gone. What each person chose is kept and applies again once there are two.
- Nothing is copied or moved either way: it is a rule read on every request (`BranchAccess::inUse()`), so a module that
  follows the branch through the contracts needs no step of its own when the count changes.

From two active branches on:

- whoever holds `branches.all` sees every branch: the owner and the manager by their templates, and any role given it;
- anyone else sees the branches they work at (`branch_members`), active or not, and nothing of the others: the list
  (`GET /branches`) shows them theirs alone, and any other branch's page answers the same 404 `branches.not_found` as one
  that is not there.

Every package and module asks this through Tenancy's `Contracts\BranchAccess` (`Scope\BranchAccessResolver` here):
`inUse()`, `seesAll()`, `visibleTo()`, `allows()` and `peopleOf()`. Nothing outside Branches reads `branch_members` or the
`branches.all` permission. See [Tenancy](tenancy.md#contracts-and-classes-for-other-packages).

## The branch someone works at

Each person works at one branch at a time in a workspace, or at every branch, and the server keeps that choice per person
and per workspace: the same on every device. A client never sends the branch it works at; the server works it out on every
request (`Scope\CurrentBranchResolver`, bound to Tenancy's `Contracts\CurrentBranch`) from what the person chose, checked
again against what they may choose right now:

- **The choices:** the active branches the person sees, by name: every one with `branches.all`, else those they work at.
  With `branches.all`, "All branches" is a choice too.
- **What was chosen counts** while it is one of those choices. A branch closed or deleted, or one the person no longer works
  at, falls back to the default; so does "All branches" for someone who lost `branches.all`.
- **The default** (nothing chosen, or a choice that no longer counts): every branch for whoever sees them all, the first of
  their branches by name for anyone else, and none for someone who works at no active branch they may see.
- **Below two active branches** nothing follows a branch (`workspace`), and there is nothing to choose.

What a request worked out is kept on that request alone (its attributes), so it is read once per request and never carried
to the next one. A queue worker runs every job on one request, so what was kept is forgotten before each job
(`Queue::before`). A job or a command, with nobody signed in, works with the whole workspace.

While a super admin acts as someone, what the admin picks is kept apart, in the cache under that impersonation, for
`branches.impersonation_choice_minutes`, and read before the person's own choice: the person's choice never changes, and
nothing the admin picked outlasts the impersonation.

`GET /me` carries it as `branch`, and `GET /me/branch` and `PUT /me/branch` answer the same shape:

```json
{
  "inUse": true,
  "mode": "branch",
  "current": { "id": "0195f0a0-…", "name": "Centro" },
  "canChooseAll": true,
  "choices": [{ "id": "0195f0a0-…", "name": "Centro" }, { "id": "0195f0a1-…", "name": "Norte" }]
}
```

- `inUse`: whether the workspace works by branch. While it is false, `mode` is `workspace`, `choices` is empty and there
  is nothing to choose.
- `mode`: `workspace`, `all`, `branch` or `none` (Tenancy's `BranchScope`); `current` is the branch in use for `branch`, and
  null otherwise.
- `canChooseAll`: whether "All branches" is the person's to choose (`branches.all`).
- `choices`: the active branches the person may choose, by name.

`PUT /me/branch` takes `{"branchId": "<uuid>"}`, or `{"branchId": null}` for every branch; the field must be there, and an
empty or blank id is 422 `validation.filled` on `branchId`, never every branch. Any
member may call it: choosing only narrows what they see. Anything that is not one of their choices (no branch of the
workspace, a closed one, one they do not work at, another workspace's, every branch without `branches.all`, or any while
the workspace does not work by branch) is the same 422 `branches.not_selectable` on `branchId`: the answer never tells
whether a branch exists. A choice takes turns with a closing of that branch and a change of its people, and is checked
again once it has its turn. It is limited by `branch-switch` (`branches.switches_per_minute` per member).

## History

`GET /branches/{branch}/history` (`branches.manage`) lists a branch's latest changes, newest first, up to
`branches.history_entries` (20), from the audit trail of the branch itself: created, updated, deactivated, reactivated,
hours updated and people updated (a deletion leaves no page to read it on). Each is:

```json
{ "id": "0193…", "action": "updated", "actorName": "Olga", "impersonated": false, "at": "2026-11-12T18:04:00Z", "fields": ["name", "phone"] }
```

- `action`: `created`, `updated`, `deactivated`, `reactivated`, `hours_updated` or `members_updated`.
- `actorName`: who did it, or null for someone who is no member any more.
- `impersonated`: whether a super admin did it acting as that person.
- `fields`: for `updated`, the names the trail keeps of what changed (`name`, `phone`, `point`, `postal`...); empty for
  every other action.

It follows the rule of a branch's page: a branch the person may not see is the same 404 `branches.not_found`. Every entry
Branches writes carries the branch's id as its `branchId` (see [Audit](audit.md)), so a module can read a branch's trail
with `AuditTrail::forBranch()`.

## Quota

Branches registers the plan resource `branches` (`BranchesPlansProvider`, through `plans.quota_resources`): the workspace's
**active** branches, whenever they were made (`ActiveBranchesCounter`, `QuotaPeriod::Total`). An inactive branch holds no
place, so deactivating one frees it.

Every plan of the catalog says its limit. The kit's example in `backend/config/plans.php`: Free 1, Pro 5, Business no
limit (`null`). Plans retired before Branches was installed have no limit.

Creating a branch and reactivating one ask for a place with `EnforcesQuotas::ensureCanCreate($tenantId, 'branches')` inside
the transaction that writes, under the quota's lock, so two at once never pass the limit; at the limit they answer 422
`plans.quota_exceeded`.

## The main branch

Every new workspace starts with its main branch. Branches listens to Signup's `WorkspaceProvisioned` and, inside the
transaction that makes the workspace, adds it through `Actions\CreateMainBranch`:

- **Its name** is "Main branch" in the language the owner signed up in ("Sucursal principal" in Spanish,
  `branches::defaults.main_branch`), with a free slug from it (`main-branch`, `sucursal-principal`).
- **Its zone** is the workspace's timezone, and **its country** the one that zone names (`America/Tijuana`: `MX`); a zone
  of no country, such as `UTC`, leaves the country empty. **It has no address yet**: its street, city and country wait
  for the onboarding's step or the branch's page, so `addressLine1`, `city` and `country` are null until someone says
  where it is (the branches list says "No address yet"). A branch someone adds still needs all three.
- **It is one of the plan's `branches`** (Free allows one, so Free's place is taken): it takes the workspace's slug lock
  and then the quota's, and is not made when the plan has no place (a plan with `branches` 0). It never sends the "limit
  reached" notice a new workspace would otherwise get.
- It is made only for a workspace with no branch at all, audited as any new branch (`branches.branch.created`, no actor).

`branches.create_main_branch` (`BRANCHES_CREATE_MAIN_BRANCH`, default `true`) turns it off: no branch is made, and the
onboarding's step adds the first one instead. The migration `2026_11_29_000002_give_every_workspace_its_main_branch`
gives every workspace that has no branch its main branch, the same way, once (with the config off it makes none). The demo
workspace gets one from `DemoMainBranchSeeder`.

## Onboarding

Branches brings the optional step `branches.first_branch` (`BranchesOnboardingProvider`, order 110, after Team's
invitations), for whoever may onboard the workspace and has `branches.manage`. While every workspace starts with its main
branch it is **"Confirm your main branch"**:

- **Its form:** where the branch is and nothing else (`addressLine1`, `addressLine2`, `city`, `state`, `postalCode`,
  `country`, `latitude`, `longitude`), with the page's rules for a new branch (street, city and country required); a
  field it does not name is refused.
- **What it starts with:** the oldest branch's place (the main branch's, empty until confirmed).
- **What it does:** it edits the oldest branch through `UpdateBranch`, done again or not. It never adds another while the
  workspace has a branch; a workspace left with none (it deleted its main branch) gets its main branch here, at that
  address, through `CreateBranch` (the plan's place; never while a super admin acts as someone).

With `branches.create_main_branch` off it is **"Add your first branch"**, the same slug, so a workspace's progress keeps
its place:

- **Its form:** the fields of a branch but the slug and the notes (`name`, `addressLine1`, `addressLine2`, `city`, `state`,
  `postalCode`, `country`, `latitude`, `longitude`, `timezone`, `phone`, `email`), with the page's rules
  (`BranchRules::without(true, 'slug', 'notes')`); a field it does not name is refused. A refusal lands on its field.
- **What it starts with:** the workspace's oldest branch, or empty fields (the point null) and the workspace's timezone.
- **What it does:** with no branch yet, it adds one through `CreateBranch` (the plan's place, 422 `plans.quota_exceeded`
  at the limit; never while a super admin acts as someone, 403 `auth.impersonation_forbidden`); once the workspace has a
  branch, done again or not, it edits the oldest through `UpdateBranch` (its slug stays), which an impersonation may do.
  It never makes a second branch: it takes the workspace's slug lock before it looks for the oldest, so two at once take
  turns and the second edits what the first made.

Both run inside the transaction that records the step: if the branch is refused, the step is not done.

## Search

Branches brings the source `branches.branches` to the global search ([Search](search.md)), through
`BranchesSearchProvider` (tagged `search.sources`): the group "Branches" (icon `map-pin`, order 20), for whoever has
`branches.view`. Without it the source is never asked, so nobody without `branches.view` sees a branch's name or city in
the palette. It needs no feature of the plan.

`Search\BranchesFinder` runs the list's own query (`ListBranches` with `BranchQuery(search: ...)`, asking for
`search.per_source` rows), so it finds what the list shows and nothing else:

- words of the name or the city, any case; a `%`, `_` or `\` is a letter;
- active and inactive branches, as the list; a deleted branch is gone;
- the branches the person may see ([Who sees which branch](#who-sees-which-branch)): every one with `branches.all` or while
  the workspace does not work by branch, else the ones they work at. It is not narrowed to the branch chosen in the
  sidebar's switcher: someone who works at two branches finds both whichever one they work at right now;
- the oldest first.

Each hit is the branch's name (its slug when the name is blank), its city under it (nothing while it has none), and its
page, `/dashboard/branches/{id}`.

## Dataset

Branches declares the dataset `branches.branches` to [Data](data.md), through `BranchesData` (tagged `data.datasets`): the workspace's
branches, for whoever has `branches.view`. It needs no flag and no feature of the plan.

- **Columns:** `id`, `name`, `is_active`, `city`, `state`, `country`, `timezone` and `created_at`; the street, the notes and the
  place on the map are not declared. `phone` and `email` are sensitive: they are for someone
  who holds `branches.manage`. The metric is `count`.
- **Who sees which:** `Data\BranchesScope` is the rule of the list ([Who sees which branch](#who-sees-which-branch)): every
  branch for whoever has `branches.all` or while the workspace does not work by branch, else the ones the person works at. It
  does not read the branch of the top bar. Closed branches are in; deleted ones are gone.

## For a module

A module that works at branches (Booking's availability, a cash register per branch, a public page) reads them through
`MoodKit\Branches\Contracts\ReadsBranches`, asked as the workspace (bound to `Places\BranchDirectory`):

- `find($tenantId, $branchId): ?BranchSummary`: one branch of the workspace, or null (another's, or not an id).
- `allActiveForSystem($tenantId)`: every active branch, oldest first, for the system itself (a job, a schedule, a public
  page by branch). It knows nobody: before it is shown to a person, filter it through Tenancy's `BranchAccess`, or ask
  `visibleTo()`.
- `visibleTo($tenantId, $userId)`: the active branches that person may see, oldest first (every one for someone who sees
  every branch, or while the workspace does not work by branch; else those they work at).
- `hours($tenantId, $branchId): ?WeeklyHours`: Support's week, in wall-clock times of the branch's own `timezone`; null
  when the branch said none, which is not "always closed".
- `members($tenantId, $branchId)`: the user ids of who works there.
- `branchesOf($tenantId, $userId)`: the ids of the branches someone works at.
- `Contracts\ListsPublicBranches::forPublicPage($tenantId, $ids, $limit)`: the active branches a workspace shows the world (all,
  oldest first, or the ids given, in their order), each a `PublicBranch` with its address, point, zone, phone and week. It is
  what a public page shows (PublicPage's branches block), so it knows nobody and never carries a branch's email or notes.

`BranchSummary` is `id`, `name`, `slug`, `isActive`, `timezone`, `addressLine1`, `addressLine2`, `city`, `state`,
`postalCode`, `country`, `latitude`, `longitude`: what a module needs to work with a branch, without its phone, email or
notes. The [events](#events) tell a module when a branch stops or starts taking work, or is deleted.

A module that keeps its own data about branches (closures, services, bookings): [Attach data to
branches](../guides/attach-data-to-branches.md).

## Reference

### Every route

All under `/api/v1`, in the `workspace` group. "Impersonation" says whether a super admin acting as someone may use it.

| Route | Permission | Limiter | Impersonation |
| ----- | ---------- | ------- | ------------- |
| `GET /branches` | `branches.view` | | yes |
| `GET /branches/quota` | `branches.view` | | yes |
| `GET /branches/options` | `branches.view` | | yes |
| `GET /branches/member-options` | `branches.manage` | | yes |
| `GET /branches/{branch}` | `branches.view` | | yes |
| `GET /branches/{branch}/history` | `branches.manage` | | yes |
| `POST /branches` | `branches.manage` | `branches` | no |
| `PATCH /branches/{branch}` | `branches.manage` | `branches` | yes, audited with the admin |
| `POST /branches/{branch}/deactivate` | `branches.manage` | `branches` | no |
| `POST /branches/{branch}/reactivate` | `branches.manage` | `branches` | no |
| `DELETE /branches/{branch}` | `branches.manage` | `branches` | no (every `DELETE`) |
| `PUT /branches/{branch}/hours` | `branches.manage` | `branches` | yes, audited with the admin |
| `PUT /branches/{branch}/members` | `branches.manage` | `branches` | yes, audited with the admin |
| `GET /me/branch` | any member | | yes |
| `PUT /me/branch` | any member | `branch-switch` | yes, kept apart for that impersonation alone |
| `POST /onboarding/steps/branches.first_branch/complete` (Onboarding's) | `onboarding.manage`, `branches.manage` | `onboarding` | the route yes, a new branch no |
| `POST /geocoding/search`, `POST /geocoding/reverse` (Geocoding's) | any member | `geocoding` | yes (they change nothing) |

`BranchesRoutesTest` keeps every route behind `workspace` and a `permission:branches.*` after it, every write behind
`branches.manage` and the `branches` limiter, and the fixed paths ahead of `{branch}`; it keeps `me/branch` in `workspace`
with no permission, its `PUT` behind `branch-switch`, an impersonation allowed.

A branch's id in the path is a plain string: one that is not a branch of the workspace (another workspace's, or not an
id at all) is 404 `branches.not_found`.

### The list

`GET /branches` answers the workspace's branches a page at a time (`branches.branches_per_page`, 25), oldest first, with
its page and total (`page`, `perPage`: at most 100) in `meta.pagination`; the total counts only the branches the person sees and the filters leave. It is
narrowed by:

- `search`: words of the name or the city, any case, a typo forgiven (see [Search](../configuration/search.md#the-default-postgres)), up to 100 characters (`%` and `_` are letters);
- `status`: `active` or `inactive` (both when left out);
- `member`: a user id: only the branches that person works at.

Someone who does not see every branch (see [Who sees which branch](#who-sees-which-branch)) lists only the branches they
work at, whatever they ask for: `member` narrows within those.

Each row is what the list shows of a branch:

```json
{
  "id": "0193…", "name": "Centro", "slug": "centro", "isActive": true, "addressLine1": "Av. Revolución 1234",
  "city": "Tijuana", "state": "Baja California", "country": "MX", "latitude": 32.5332, "longitude": -117.0368,
  "timezone": "America/Tijuana", "memberCount": 3
}
```

The list keeps no cache: it is short, and the plan bounds how many branches are active.

### Around the forms

- `GET /branches/quota` answers `{used, limit}`: the workspace's active branches and the plan's limit (`null`: none), read
  through Plans' `ReadsQuotas`, for the **New branch** button of whoever sees the branches but not the subscription. It
  only informs: creating still asks the plan under its lock.
- `GET /branches/options` answers `{timezones, countries}`: every IANA timezone the API takes (`timezone:all`) and the 249
  country codes, so a form offers exactly what the API accepts. The screens name each country in their own language.

### A branch

`GET /branches/{branch}`, and the answer of every write to a branch:

```json
{
  "id": "0193…", "name": "Centro", "slug": "centro", "isActive": true,
  "addressLine1": "Av. Revolución 1234", "addressLine2": "Zona Centro", "city": "Tijuana", "state": "Baja California",
  "postalCode": "22000", "country": "MX", "latitude": 32.5332, "longitude": -117.0368, "timezone": "America/Tijuana",
  "phone": "+526641234567", "email": "centro@example.com", "notes": "Parking at the back.",
  "memberCount": 1,
  "hours": [{ "weekday": 1, "enabled": true, "startsAt": "10:00", "endsAt": "20:00" }, "… seven days"],
  "members": [{ "id": "0193…", "name": "Max", "email": "max@example.com", "status": "active" }],
  "canEdit": true
}
```

- `latitude` and `longitude` are numbers or both null; `addressLine2`, `state`, `postalCode`, `phone`, `email` and
  `notes` may be null.
- `hours` is the seven days (Support's week: a closed day has `enabled: false` and null times) or null when the branch
  said none.
- `members` are the people who work there, oldest member first; `status` is `active` or `inactive`.
- `canEdit` says whether the person asking has `branches.manage`.

A branch the person asking may not see (one they do not work at, without `branches.all`, while the workspace works by
branch) is the same 404 `branches.not_found` as one that is not there.

`POST /branches` takes the fields of [Adding a branch](#adding-a-branch): `name`, `slug`, `addressLine1`, `addressLine2`,
`city`, `state`, `postalCode`, `country`, `latitude`, `longitude`, `timezone`, `phone`, `email`, `notes`. It answers 201
with the branch. `PATCH /branches/{branch}` takes any of them ([Editing a branch](#editing-a-branch)); `deactivate` and
`reactivate` take no body; each answers the branch. `DELETE /branches/{branch}` answers `data: null`.

### A branch's hours and people

- `PUT /branches/{branch}/hours` takes `{"days": [{"weekday": 1, "enabled": true, "startsAt": "10:00", "endsAt": "20:00"},
  … seven days]}` and answers the seven days ([Opening hours](#opening-hours)).
- `PUT /branches/{branch}/members` takes `{"userIds": ["0193…"]}` and answers the branch's people, `[{id, name, email,
  status}]` ([People](#people)).
- `GET /branches/member-options?search=` answers up to `branches.member_options` members, `[{id, name, email, status}]`.

### Contracts for modules

- `Contracts\ReadsBranches` (`find`, `active`, `hours`, `members`, `branchesOf`) and `Contracts\BranchSummary`
  ([For a module](#for-a-module)); `Contracts\ListsPublicBranches` and `Contracts\PublicBranch` (what a public page shows).

### Errors

| Code | Status | When |
| ---- | ------ | ---- |
| `branches.not_found` | 404 | no branch of the workspace has that id |
| `branches.name_taken` (`name`) | 422 | another branch of the workspace has that name, whatever its case |
| `branches.slug_taken` (`slug`) | 422 | another branch of the workspace has that slug |
| `branches.not_active` | 409 | deactivating a branch that is inactive already |
| `branches.not_inactive` | 409 | reactivating a branch that is active already |
| `branches.in_use` | 409 | deleting a branch a module's row holds on to; deactivate it instead |
| `branches.member_not_found` (`userIds`) | 422 | putting on a branch someone with no place in the workspace |
| `branches.not_selectable` (`branchId`) | 422 | choosing a branch to work at that is not one of yours, every branch without `branches.all`, or any while the workspace does not work by branch |

Branches' routes also answer the kit's own: `auth.impersonation_forbidden` (403), `auth.forbidden` (403,
`meta.requiredPermission`), `plans.quota_exceeded` (422), Team's `team.owner_only` (403), `team.above_your_role` (403) and
`team.member_not_found` (404) from a branch's people, `validation.*` (422) and `http.too_many_requests` (429).

### Events

Sent after the commit, for modules (Branches itself sends no notice to anyone):

| Event | When | Carries |
| ----- | ---- | ------- |
| `Events\BranchDeactivated` | a branch stopped taking work | `tenantId`, `branchId`, `byUserId` |
| `Events\BranchReactivated` | a branch takes work again | `tenantId`, `branchId`, `byUserId` |
| `Events\BranchDeleted` | a branch was deleted, with its hours and people | `tenantId`, `branchId`, `name`, `slug`, `byUserId` |

## The branches layer

`frontend/layers/branches` draws the branches: the list, a new branch, a branch's page, a section of a member's page and
the screen of the onboarding step, and the branch switcher at the top of the sidebar and the notice of someone who works at no branch. Its messages are `branches.*` in `i18n/locales/{en,es}.json`; its API calls are
`app/services/branches.ts`. The map, the address fields and the week editor are core's (`LocationPicker`,
`WeekHoursEditor`; see [Frontend](../frontend.md) and [Maps](../configuration/maps.md)).

### The list

`/dashboard/branches` (`branches.view`; the menu's "Branches" entry, `map-pin`), in the kit's page anatomy:

- **`PageHeader`** with **New branch** for whoever has `branches.manage`. The button is always in view for them:
  - with room in the plan, it opens `/dashboard/branches/new`;
  - at the limit of `branches` (the active branches, read from `GET /branches/quota`, which `branches.view` may read) it
    is disabled with the tooltip "Your plan includes N branches" ("1 branch" in the singular, in every language), and, for whoever has `subscription.view`, a **See
    plans** link to the subscription sits beside it (core's `usePlanGate` with `usage`);
  - while a super admin acts as the person it is disabled with core's impersonation tooltip.
- **`PageToolbar`:** the search by name or city (sent 300 ms after the person stops typing) and the status filter.
- **The table** (a table, not cards with a map each: a map per row would be a WebGL context per row): the branch and its
  slug, its address (street, then city, state and the country by name), its timezone, how many people work there, its
  status, and a pager. Each row's actions are icons with their tooltip: open the branch (anyone who sees the
  branches), deactivate or reactivate, and delete (whoever has `branches.manage`). Deactivating and deleting ask first
  (core's `ConfirmActionDialog`, two actions); reactivating does not. A refusal is a toast with the API's message:
  deleting a branch a module's records hold on to (409 `branches.in_use`) says to deactivate it instead, and reactivating
  over the plan's limit is `plans.quota_exceeded`. While a super admin acts as the person the three stay in view,
  disabled, with the impersonation's tooltip (the API refuses them too). Whatever changes the plan's places reads the
  list and the quota again.

### A new branch

`/dashboard/branches/new` (`branches.manage`): **Details** (name, timezone, the workspace's to start, searchable with its
offset, phone in E.164 from mood-ui's `PhoneInput`, whose flag is the number's own calling code, so a `+1` number of a
branch in Mexico keeps `+1`, the branch's country while there is no number, and an emptied field is no phone, as on a
client's page and in a branch's details and the onboarding's first branch, email and notes in a `Textarea` with its
counter) and **Location** (core's `LocationPicker`, its country the browser's when the API takes it). The page's `PageActionBar` saves once the name,
the street, the city and the country are there: Save creates the branch and opens its page with "Branch created. Now set
its opening hours and people."; Cancel goes back to the list. A refused field shows on it, any other refusal (the plan's
limit) above the form. Leaving with something typed asks first.

### A branch's page

`/dashboard/branches/:id` (`branches.view`): the branch's name, with its status, slug and city in the header, then four
sections, each a group of the page's change set with its dot of changes not saved. The timezones and countries
(`GET /branches/options`) are asked for once, by the page, and shared with the two sections that need them
(`shareBranchOptions()`; `useBranchOptions()` reads them, or asks on its own where no page shares them):

- **Details:** name, slug ("Short name", kept when the branch is renamed), timezone, phone, email and notes
  (`PATCH /branches/{branch}`).
- **Location:** core's `LocationPicker`; the address and the pin are sent together (`PATCH`, both coordinates or neither).
- **Opening hours:** core's `WeekHoursEditor`, in the branch's own timezone (`PUT .../hours`).
- **People:** a `KitSelect` with `multiple` (and its search) of the workspace's members (`GET /branches/member-options`), plus whoever works there already
  (`PUT .../members`). Someone the person does not reach by Team's rule is Team's 403, toasted.

Whoever may edit the branch (the API's `canEdit`) saves every section that changed with the page's one `PageActionBar`,
one request each; anyone else reads them (the people as names), with no bar. The people's emails come only to whoever has
`team.view` (null otherwise); the page shows names either way. A refused field shows on it. A branch that is
not there (404 `branches.not_found`) shows an empty state that leads back to the list.

Whoever manages the branches (`branches.manage`) also gets **History** at the end of the page (`BranchHistorySection`,
from `GET /branches/{branch}/history`): the latest changes, newest first, each with what changed ("Changed the phone, the
notes" for an edit, by the trail's field names; "Changed its hours", "Deactivated it"...), who did it ("Someone who left"
for a person who is no member any more, "{name}, through support" for a change a super admin made acting as them) and
when, in the person's own time. It is read only and outside the page's bar; someone who may only look does not get it.

### A member's branches

The team layer's page of a member gains **Branches** (core's `kit:team:member-sections`, order 50, after Team's own): the
branches the member works at (`GET /branches?member=`), each a link to its page. It is read-only (people are changed from
a branch's page) and draws nothing, and asks nothing, for whoever lacks `branches.view`.

### The onboarding step

The screen of `branches.first_branch` (core's `kit:onboarding:steps`): confirming the main branch, core's `LocationPicker`
alone (the API gives the step the branch's place and nothing else); adding the first branch, the name, timezone, phone and
email too. It is sent by the wizard's Continue. It starts with the step's values (the oldest branch's, or empty with the
workspace's timezone), says what is missing before sending, and puts a refusal on its field. Whoever may not do the step
reads it; while a super admin acts as the person the fields are read-only, since the API adds no branch then.

### The branch switcher

The branch the person works at sits at the top of the dashboard's sidebar, above the menu (core's `kit:sidebar:top`, order
10, `BranchSwitcher`): mood-ui's `Switcher` as it comes, the width of the sidebar, titled "Branch you work at", with "All
branches" first for whoever may choose it (`canChooseAll`, a grid icon; "Todas" in Spanish, which fits the sidebar where
"Todas las sucursales" was cut), then the person's branches by name (a pin icon), and a search field once there are more
than eight options. Its tooltip, at its right, names the branch in use in full ("Branch you work at: All branches",
"Todas las sucursales" in Spanish, or a long branch's whole name); it does not show while the list is open. It is there only while the workspace works by branch (`inUse`)
and the person has two options or more; with one, there is nothing to choose and each list says whose it is. In a
collapsed sidebar it is an icon (the Switcher's trigger slot, core's `KitButton` with the tooltip "Switch branch" and the
branch in use in its aria label) that opens the same list under it, over the page. On a phone it is at the top of the
side menu's drawer.

Choosing sends `PUT /me/branch` (disabled while it runs) and puts the answer in core's `useCurrentBranch()`, so every list
that follows the branch loads again (`useBranchReload()`). A refused choice (the branch closed meanwhile) is toasted with
the API's message, and where the person stands is read again (`GET /me/branch`). It is read again too when the tab comes
back to the front, since another tab or device may have switched; a read that fails keeps what is on screen.

### Someone who works at no branch

While the workspace works by branch and the person works at no branch they may see (`mode: none`), a notice sits above
every screen of the dashboard (core's `kit:dashboard:banners`, order 20, `BranchMissingBanner`, mood-ui's `Banner` in the
`info` color): "You do not work at any branch yet", and that what belongs to a branch shows once someone who manages the
branches adds them to one. It cannot be closed: it goes when they are on a branch. There is no switcher then (nothing to
choose), and the lists that follow the branch show nothing of one.

## On the dashboard

Branches brings the widget `branches.overview` to the home ([Dashboard](dashboard.md)), through `BranchesDashboardProvider`
(tagged `dashboard.widgets`): the card "Branches", small, order 20, for whoever has `branches.view`. It needs no feature of
the plan. Its data:

| Key | What it is |
| --- | ---------- |
| `active` | the branches the person sees that take work |
| `inactive` | the branches the person sees that do not |

Both count only the branches the person may see, by the list's own rule (`Places\VisibleBranches`, which `ListBranches` uses
too): everyone with "All branches" sees the whole workspace's, anyone else the ones they work at. So someone who works at one
branch learns nothing of the others, not even how many there are.

The frontend draws it in `frontend/layers/branches` (`BranchesOverviewWidget`, registered by the `branches-dashboard` plugin
through `kit:dashboard:widgets`): `DashboardWidgetCard` linking to the branches, with two mood-ui `Stat`s, "Active branches"
and "Inactive branches" (singular for one). The same plugin adds New branch to the top bar's Create menu
(`kit:topbar:actions`, order 20, to `/dashboard/branches/new`) for whoever has `branches.manage`, which the page itself
requires too.
