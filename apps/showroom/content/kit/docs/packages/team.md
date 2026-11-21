# Team

A workspace's people: inviting them by email, the members list and what can be done to a member (change their role,
deactivate, reactivate, remove), and the weekly hours and skills of each, which a module may read. Team depends on Auth,
Rbac, Plans, Notifications, Onboarding, Settings, Signup, Search, Audit, Support and Tenancy through their contracts, and none of them
depends on it: remove the package and the `members` quota counts active members alone again.

## Permissions and the menu

| Permission | Lets a member | Requires |
| ---------- | ------------- | -------- |
| `team.view` | see the members of the workspace, their roles, hours and skills | |
| `team.invite` | invite people by email, resend or withdraw an invitation, and see the invitations | `team.view` |
| `team.manage` | deactivate, reactivate and remove members, set their hours and skills, and keep the list of skills | `team.view` |

The owner has every permission. The manager gets the three through its template (`all`). Team gives the `member` role
`team.view`, since teammates see who is on the team, and adds `manager` to who may give the `member` role
(`grantableBy`): a manager invites as a member. The owner is still the only one who gives `manager` or a role the
workspace made, and nobody gives `owner`. Changing someone's role stays Rbac's (`rbac.manage`, `PUT /users/{user}/role`).

The menu entry is `/dashboard/team` ("Team", icon `users`), in the `administration` section with order 5, for whoever has
`team.view`.

## Configuration

`backend/packages/Team/config/team.php` holds the defaults; `backend/config/team.php` overrides `invitation_days` from the
environment.

| Key | Env | Default | |
| --- | --- | ------- | - |
| `team.invitation_days` | `TEAM_INVITATION_DAYS` | 7 | how many days an invitation works, from when it was (last) sent |
| `team.changes_per_minute` | | 30 | changes one member may make to members, hours and skills in a minute (the `team` limiter) |
| `team.invitations_per_minute` | | 10 | invitations and resends one member may send in a minute (`team-invite`) |
| `team.invitations_per_workspace_per_hour` | | 50 | invitations and resends a workspace may send in an hour (`team-invite`) |
| `team.lookups_per_minute` | | 30 | looks at an invitation from one address in a minute (`team-lookup`) |
| `team.accepts_per_minute` | | 10 | tries to accept an invitation from one address in a minute (`team-accept`) |
| `team.accepts_per_invitation_per_hour` | | 10 | tries to accept one invitation in an hour, counted by the hash of its token (`team-accept`) |
| `team.members_per_page`, `team.invitations_per_page` | | 25, 25 | rows of a page of the members and of the invitations |
| `team.skills_per_workspace`, `team.skills_per_member` | | 50, 10 | skills a workspace may have, and a member may hold |
| `team.onboarding_invitations` | | 10 | invitations the onboarding step sends at most |

## Limiters

Every route of Team has a named limiter, never `throttle:n,m`:

| Limiter | Counts |
| ------- | ------ |
| `team` | changes to members, hours and skills, per member |
| `team-invite` | invitations and resends, per member and per workspace |
| `team-lookup` | looks at an invitation, per address |
| `team-accept` | tries to accept, per address and per invitation (the SHA-256 of the token sent, never the token) |

Team registers `token`, `password` and `captchaToken` with Support's `SecretFields`, so the public acceptance never sends
them to Sentry (Auth registers the same names; Team says what it reads).

## Invitations

### The table

`team_invitations` (row-level security with `FORCE`, like every table of a workspace) keeps one row per invitation:
the email (in lowercase, a `CHECK` says so), the role it brings (`role_id`, set to null when the role is deleted), who
sent it, when it was (last) sent and how many times, when it expires, and when it was accepted or withdrawn and by whom.
The token is never stored: only its SHA-256 (`token_hash`, unique), and the model hides that column. The token itself is
48 random characters (`Invitations\InvitationToken`), and exists only in the email and in the fragment of its link.

A workspace has one live invitation per email at a time (a unique index on `(tenant_id, email)` of the rows neither
accepted nor withdrawn), and any number that ended. An invitation is never both accepted and withdrawn (a `CHECK`).

Its status is worked out from its dates, in this order (`Enums\InvitationStatus`):

| Status | When |
| ------ | ---- |
| `revoked` | `revoked_at` is set: withdrawn by someone, or replaced by a new invitation to the same email once it expired |
| `accepted` | `accepted_at` is set |
| `expired` | `expires_at` has passed |
| `pending` | none of the above |

### The place it holds

A pending invitation holds a place in the plan's `members` quota: `Invitations\PendingInvitationSeats` is a
`Plans\Contracts\MemberSeats` tagged `plans.member_seats`, so the quota counts active members plus pending invitations. A
workspace never invites more people than its plan allows, and accepting asks for no place: it was held already. An
expired, accepted or withdrawn invitation holds nothing.

### Inviting

Whoever has `team.invite` invites an email with a role (`Actions\InviteMember`, which the onboarding's step uses too). The
checks run in this order:

1. While a super admin acts as the person, 403 `auth.impersonation_forbidden`: the route takes `not-impersonating`, and the
   action refuses too, for a route that lets an impersonation through (the onboarding's).
2. The person must be allowed to give the role, by Rbac's rule (`MemberRoles::mayGrant`, the one of
   `PUT /users/{user}/role`): 422 `team.role_not_grantable` on `roleId`. An owner gives any role but owner; a manager
   gives `member`, never `manager` nor a role the workspace made (Rbac's `RoleGrants`: a role of the workspace's own is
   given by an owner alone, and a system role by the roles its template lists in `grantableBy`).
3. An email that has a place in the workspace, active or not, is 422 `team.already_member` on `email`. Whoever invites
   already sees the members, so this tells nothing about anyone outside the workspace; whether an email has an account
   on the platform is never said.
4. In one transaction, under a lock of the email (`team:invitation:<tenant>:<email>`): an invitation to the email that
   still waits is 422 `team.already_invited` on `email` (send it again from the list); one that expired is withdrawn to
   make room (audited as `team.invitation.revoked`). Then Plans' `ensureCanCreate($tenantId, 'members')` asks for a place
   under the quota's lock, counting active members and pending invitations: 422 `plans.quota_exceeded` when the plan is
   full, before anything is written.
5. The row is written with the token's hash, audited as `team.invitation.sent` (the email and the role, never the token),
   and `Events\InvitationSent` goes out after the commit.

The email (`Mail\TeamInvitationMail`) is queued encrypted (`ShouldBeEncrypted`), since the token is in it. Its link is
`<slug>.<root>/join#invitation=<token>`: the token travels in the fragment, so no server, log or `Referer` sees it. It is
written in the workspace's language (the invitee has none yet), and names the workspace, who invites and the role in that
language, and how many days the link works. Every name in it is escaped for Markdown and HTML (Support's `MarkdownText`), so a
name with `[a link](...)`, `<style>` or `<img>` in it shows as typed. It is not a notification of
Notifications on purpose: the delivery log keeps what it sends to send it again, and a link that makes an account for
the email must be in no log.

### Sending again and withdrawing

An invitation that is pending or expired may be sent again or withdrawn, by whoever has `team.invite`; each reads it locked
until its transaction ends, so a resend, a withdrawal and an acceptance of one invitation take turns.

- **Sending again** makes a new token (the old link stops working), gives it another full term (`team.invitation_days`
  from now), counts the send and mails it, audited as `team.invitation.resent`. Only someone who may give its role sends
  it, since it keeps the invitation alive: a manager does not send again an owner's invitation as a manager (422
  `team.role_not_grantable`). Whoever sends it again becomes its inviter (`invited_by_user_id`): the one who stands behind
  it from then on. An expired invitation held no place, so it asks the plan for one again (422 `plans.quota_exceeded` when
  the plan is full); a pending one keeps its own.
- **Withdrawing** marks it `revoked` (`revoked_at`, `revoked_by_user_id`), audited as `team.invitation.revoked`: its link
  stops working and its place is free. Only someone who may give its role withdraws it, as for sending it again: a manager
  does not undo an owner's invitation of a manager (403 `team.above_your_role`).

An invitation whose role was deleted since would make a member, so anyone with `team.invite` may send it again or
withdraw it.

An invitation lives only while its inviter stands behind it. Deactivating or removing a member withdraws every invitation
they sent that is still open, pending or expired, in the same transaction (`revoked_by_user_id` is whoever made the change;
the audit entry's `after` says `"reason": "inviter_left"`). And accepting checks again, under the invitation's lock, that
the inviter is an active member who may still give its role: when not (they left another way, or lost the right to give
the role), the link answers as one that does not work and the invitation is withdrawn (`revoked_by_user_id` null,
`"reason": "inviter_gone"`). Inviting again over an expired invitation withdraws it with `"reason": "replaced"`.

One that was accepted or withdrawn already is 409 `team.invitation_not_pending`; an id the workspace has no invitation
with, another workspace's included, is 404 `team.invitation_not_found`.

### Accepting an invitation

The link of the email opens `<slug>.<root>/join#invitation=<token>`, on the workspace's own host. The page reads the token
from the fragment, takes it out of the address, and makes two calls, both public (whoever accepts is not a member yet),
on that host (`tenant`), with the token in the JSON body (`ReadsJsonBodyOnly`: a token in the query string is not read),
neither cached nor sent as a referrer (`KeepOutOfCachesAndReferrers`), each with a limiter of its own:

- **`POST /team/invitations/lookup`** `{token}` (`team-lookup`) answers what the page explains:
  `{workspace, email, role, invitedBy, expiresAt, account}`. `role` is the role's name in the request's language (the
  member role's when the role was deleted), `invitedBy` the inviter's name and `account`
  is `existing` when the email has an account on the platform, `new` when it has none. Only whoever holds the token learns
  that, and the token reached that mailbox.
- **`POST /team/invitations/accept`** `{token, password, name?, replacePassword?, captchaToken}` (`team-accept`) checks the
  captcha first, before the token is looked at, by Signup's rule (`ChecksSignupCaptcha`), since accepting may make an
  account: with `SIGNUP_REQUIRE_CAPTCHA` on (the default outside `local` and `testing`) a missing token, or any token
  while `AUTH_CAPTCHA_DRIVER` is `null`, is 422 `auth.captcha_failed`. Then, in one transaction
  that locks the invitation's row before anything else (`Actions\AcceptInvitation`), goes one of three ways, by the
  invitation's email and never by what was sent:
  - **An account, with its password:** checked as the login checks it (`ChecksCredentials`): a wrong one is Auth's 401
    `auth.invalid_credentials`, and the invitation keeps waiting. `name` is ignored.
  - **An account, with a new password** (`replacePassword: true`): only for an account a reset link reaches (Auth's
    `ResetsPasswords::reaches()`: an active place in some workspace, and no super admin of the platform); any other answers
    422 `team.password_reset_elsewhere`, and the person joins with the password they have or resets it where they sign
    in. Then the password must be one a person may choose (422 on `password`), and Auth's `ResetsPasswords` puts it in
    place as a reset does: every session of the person ends, in every workspace, the reset links and switch codes waiting
    die, it is audited and they are told by email. Whoever holds the email decides the password, which is what the reset
    link already allows, and no more; the person who forgot theirs is not sent to another workspace to reset it.
  - **Nobody:** `name` (2 to 120 characters, a plain name) and a password a person may choose (422 on the field) make the
    account through Auth's `CreatesMembers`, with the email confirmed (the link reached it). If the email got an account
    in the meantime, 409 `team.account_exists`, and the page asks again.

  Then the person gets the role of the invitation (`MemberRoles::giveOnJoin`: the member role when that role was deleted),
  the invitation is used (`accepted_at`, `accepted_by_user_id`), audited as `team.invitation.accepted`, and
  `Events\InvitationAccepted` goes out after the commit. The answer is `{handoffUrl}`: a one-time code of 60 seconds to
  the workspace's `/handoff` (Auth's `IssuesHandoffLinks`), made after the commit, which lands the person on `/dashboard`.
  A public route never answers a session token. The page follows the address only when it is `/handoff` on its own
  origin.

Every link that does not work answers the same 404 `team.invitation_invalid`, to both calls: an unknown token, one of
another workspace, an invitation that expired, was used or was withdrawn, a link replaced by a resend, an invitation whose
inviter no longer stands behind it (above), and an email whose account was deleted or whose place in the workspace was
left inactive (that is a reactivation). The answer tells nothing the token does not own. An invitation to an email whose
account was deleted can never be accepted: the address stays taken by the deleted account (a new person cannot have it),
and the account cannot sign in; withdraw the invitation, and invite another address.

Accepting asks for no place in the plan: the invitation held one since it was sent. It takes the plan's lock of members
after the invitation's row (`EnforcesQuotas::hold()`), since the place moves from the invitation to the member: an
invitation, a resend or a reactivation counting at that moment waits for it. A workspace that moved to a smaller
plan with invitations waiting lets them be accepted; only making new ones is refused.

Two acceptances of one link take turns on the invitation's row: the second one waits, then finds it used (404). An
acceptance and a withdrawal take turns the same way: a withdrawal that comes second is 409 `team.invitation_not_pending`,
an acceptance that comes second is 404.

### Routes

Every route is in the `workspace` group.

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /team/seats` | `team.view` | `{used, limit, active, pending}`: what the `members` quota counts and its limit (null for none; the lower of the plan's and that of a plan the workspace moves down to), and of it the active members and pending invitations. For the Invite button of whoever may not see the subscription |
| `GET /team/roles` | `team.view` | the workspace's roles (`id`, `name`, `slug`, `isSystem`) with `grantable`: whether the person may give it |
| `GET /team/invitations` | `team.invite` | the workspace's invitations, newest first, a page at a time (`team.invitations_per_page`; `page`, `perPage`: the total is in `meta.pagination`); `status` narrows to `pending`, `expired`, `accepted` or `revoked` |
| `POST /team/invitations` | `team.invite`, `not-impersonating`, `team-invite` | `{email, roleId}`: invites; 201 with the invitation |
| `POST /team/invitations/{invitation}/resend` | `team.invite`, `not-impersonating`, `team-invite` | sends a pending or expired invitation again; 200 with the invitation |
| `DELETE /team/invitations/{invitation}` | `team.invite`, `team-invite` (and `GuardImpersonation`, as every `DELETE`) | withdraws a pending or expired invitation; `data: null` |

The acceptance's two routes are public, outside the `workspace` group:

| Route | Takes | Does |
| ----- | ----- | ---- |
| `POST /team/invitations/lookup` | `tenant`, `team-lookup` | `{token}`: what the invitation is |
| `POST /team/invitations/accept` | `tenant`, `team-accept`, a captcha | `{token, password, name?, replacePassword?, captchaToken}`: joins; `{handoffUrl}` |

An invitation as the API shows it: `{id, email, status, role: {id, name, slug} | null, invitedBy, sendCount, sentAt,
expiresAt, acceptedAt, revokedAt, createdAt, allowed: {resend, revoke}}`, times in ISO 8601 UTC. Never its token or hash.
`invitedBy` is whoever sent it last (sending again makes the sender its inviter). `allowed` is what the person asking may
do to it, by the rule the two actions check again: both true while it is open (pending or expired) and its role is one
they could give, or was deleted since (Team's `Members\Reach`, the reach of the members' list without an owner's pass: even
an owner does not give the owner role). A hint for the screen, never a permission.

## Members

### The list

`GET /team/members` (`team.view`) lists the people with a place in the workspace, active and inactive, by when they
joined, the oldest first (the owner on top), a page at a time (`team.members_per_page`, 25; `page`, `perPage` up to 100, and `meta.pagination.total` counts what the filters and the person's branch leave). It narrows by:

| Query | Narrows to |
| ----- | ---------- |
| `search` | words of the name or the email, any case, a typo forgiven ("Aln" finds "Alan": see [Search](../configuration/search.md#the-default-postgres)); up to 100 characters; `%` and `_` are letters |
| `status` | `active` or `inactive` |
| `role` | the holders of a role of the workspace, by id (nobody for another workspace's) |
| `skill` | the members with a skill of the workspace, by id (nobody for another workspace's) |

Who someone was and when they last signed in is for whoever manages the team. A person without `team.manage` (a member
with `team.view`) sees the active members alone (`status=inactive` gives an empty page), and `lastLoginAt` is null on
every row; `GET /team/members/{user}` of an inactive member answers them 404 `team.member_not_found`.

The list follows the branch the person works at (Tenancy's `CurrentBranch`, which the Branches package answers; see
[Branches](branches.md#the-branch-someone-works-at)): working at a branch, it shows only that branch's people, and the
filters above narrow within them; working at no branch of a workspace that works by branch (`none`), it shows nobody;
with "All branches", or while the workspace does not work by branch (fewer than two active branches, or no Branches
package), it shows everyone. The client never sends the branch. A member's own page (`GET /team/members/{user}`) does not
follow it: people belong to the whole workspace.

A value the list does not take (a status of its own, an id that is not a UUID, a `page` that is no number) is 422 on its
field. Roles and skills are worked out first (Rbac's `WorkspaceRoles::holders`, `ReadsSkills::holders`), then Auth's
`ListsMembers` pages the people.

Each row:

```json
{
  "id": "…", "name": "Mia", "email": "mia@example.com", "avatarUrl": null, "status": "active",
  "role": {"id": "…", "name": "Manager", "slug": "manager"}, "isOwner": false, "isYou": false,
  "joinedAt": "2026-11-20T10:00:00.000000Z", "lastLoginAt": null,
  "skills": [{"id": "…", "name": "Design"}],
  "allowed": {"role": false, "deactivate": true, "reactivate": false, "remove": true}
}
```

`role` is the role's name in the request's language (null for someone who holds none). `allowed` is what the person asking
may do to that member, worked out by the server (`Members\Powers`), so the screen shows only the actions that will work:

| Key | True when the person asking |
| --- | --------------------------- |
| `role` | has `rbac.manage`, the member is not them, is active, and is someone they reach or holds no role (the rule `PUT /users/{user}/role` enforces: 403 `rbac.above_your_role` otherwise); an owner's role only for another owner, while the workspace has more than one active owner (Rbac's rule: never the last owner, 403 `rbac.last_owner`) |
| `deactivate` | has `team.manage`, the member is not them, is active, and is someone they reach (below) |
| `reactivate` | the same, for an inactive member |
| `remove` | has `team.manage`, the member is not them, and is someone they reach |

Whom someone reaches (`Members\Reach`): an owner reaches everyone; anybody else reaches only a member whose role they could
give themselves (Rbac's rule, `MemberRoles::grantable`, the one `PUT /users/{user}/role` and invitations use). A member
who holds no role is an owner's alone, for their place, hours and skills: a role that is missing could as well be one that
was not found. So a manager reaches members, but neither an owner, another manager, someone with a role the workspace made
(only an owner gives one) nor someone with no role. Rbac's `AssignRole` applies the same reach to a change of role, except
that anyone who may give a role may give one to someone who holds none.

A member's id is read as the database spells it, in lowercase, wherever it comes in (the `{user}` of a path, Branches'
`userIds`, `MemberAccess`): Postgres finds a uuid in capitals too, so `01A1...` is the same member as `01a1...`, under the
same rule and the same lock.

The actions check the same rules again: `allowed` is a hint for the screen, never a permission.

### One member

`GET /team/members/{user}` (`team.view`) answers the same row, plus `hours` (the seven days as `PUT .../hours` answers them,
or null when the member said none) and `canEdit` (whether the person asking has `team.manage` and the member is them or
someone they reach, which the page uses for its
hours and skills). Someone with no place in the workspace is 404 `team.member_not_found`.

### Deactivating, reactivating and removing

Whoever has `team.manage` changes a member's place through Auth's `ManagesMemberships` (the membership's own methods, its
guards, tokens and events); Team never touches Auth's models.

| Route | Does |
| ----- | ---- |
| `POST /team/members/{user}/deactivate` | ends the member's access without removing them: every session of theirs in the workspace ends at once (Auth deletes their tokens); `team.member.deactivated` |
| `POST /team/members/{user}/reactivate` | gives an inactive member their access back; `team.member.reactivated` |
| `DELETE /team/members/{user}` | takes them off the team for good; `team.member.removed` |

Each answers `data: null` and takes `team.manage`, `not-impersonating` and the `team` limiter (a `DELETE` is refused during
an impersonation anyway, by `GuardImpersonation`). The rules, in this order:

1. Nobody does it to themselves: 422 `team.cannot_act_on_self` (they would lock themselves out; leaving a workspace is not
   in Team yet).
2. Someone with no place in the workspace, active or inactive, is 404 `team.member_not_found`.
3. Only an owner acts on an owner: 403 `team.owner_only`. Anybody else acts only on someone they reach (see the members'
   list): 403 `team.above_your_role` otherwise.
4. Deactivating someone inactive is 409 `team.member_not_active`; reactivating someone active, 409
   `team.member_not_inactive`. The status is read again inside the change, with the member held (a lock of the member,
   which deactivating, reactivating, removing and saving hours or skills all take first), so two requests at once change
   it once, and a reactivation and a removal take turns.
5. Reactivating makes one more active member, so it asks the plan for a place (`ensureCanCreate($tenantId, 'members')`,
   counting active members and pending invitations, under the quota's lock): 422 `plans.quota_exceeded` when the plan is
   full.
6. A workspace keeps its last active owner: Rbac's `KeepsLastOwner`, a guard Auth asks inside the change, answers 422
   `rbac.last_owner`. With the rules above it only shows when two owners shut each other out at once: the guard locks the
   workspace's owners, so the second waits and is refused.

Deactivating and removing someone also withdraw the invitations they sent that are still open (see
[Sending again and withdrawing](#sending-again-and-withdrawing)). Removing someone takes their place, their sessions and
roles in the workspace, and what the workspace kept of them (hours and skills, by the foreign keys). Their account stays, in other workspaces too, and they can be invited again. The audit
entry keeps their email and status before; `Events\TeamMemberRemoved` (after the commit) carries who they were (`name`,
`email`, `locale`), since they are no member to ask Auth about once it is sent, and who removed them.

### Changing a role

The team page changes a role through Rbac's own endpoint, `PUT /users/{user}/role` `{roleId}` (`rbac.manage`, refused
during an impersonation): the same rule of who gives which role as an invitation (`MemberRoles::mayGrant`), and the same
`workspace.member_role_changed` notification to the member.


## Skills

What a workspace's people are good at, kept as a catalog per workspace and given to members. Skills have a name and
nothing else (no color, no order): a neutral badge shows them, and a module reads them to match people to work.

### The catalog

`team_skills` (row-level security with `FORCE`) keeps the workspace's skills: a name of 1 to 60 characters, one line of
plain text, unique in the workspace whatever its case (an index on `(tenant_id, lower(name))`). A workspace has at most
`team.skills_per_workspace` (50) skills: creating one takes a lock of the workspace's catalog, so two at once do not pass
the cap together. Every change is audited (`team.skill.created`, `.updated`, `.deleted`, with the name before and after).

| Error | When |
| ----- | ---- |
| 422 `team.skill_taken` on `name` | the workspace has a skill with that name already, whatever its case |
| 422 `team.skills_full` (`meta.max`) | the catalog is full |
| 404 `team.skill_not_found` | no skill of the workspace has that id (another workspace's included) |

Deleting a skill takes it off every member who had it (the foreign key).

### A member's skills

`team_member_skills` keeps who has which skill. It hangs from the membership by `(tenant_id, user_id)` and from the skill
by `(tenant_id, skill_id)`, both with foreign keys that cascade: removing someone takes their skills with them, nobody
without a place in the workspace can be given one, and no workspace can give another's.

`PUT /team/members/{user}/skills` `{skillIds}` replaces a member's skills with those (an empty list takes them all off), up
to `team.skills_per_member` (10), and answers them by name. It is audited as `team.member.skills_updated` with the names
before and after. A skill that is not the workspace's is 422 `team.skill_not_found` on `skillIds`; more than the cap,
422 `team.too_many_skills` on `skillIds` (`meta.max`); someone with no place in the workspace, 404
`team.member_not_found`. One's own skills, or those of someone one reaches (see the members' list): an owner's are for
an owner (403 `team.owner_only`), and anyone else's for whoever could give their role (403 `team.above_your_role`).

### Who changes them

The catalog and a member's skills take `team.manage`; reading the catalog, `team.view`. A super admin acting as someone may
change them (support may need to fix them), and the trail names the admin (`impersonator_user_id`); deleting a skill is a
`DELETE`, which an impersonation never does.

### For a module: `ReadsSkills`

`MoodKit\Team\Contracts\ReadsSkills`, asked as the workspace:

- `of($tenantId, $userIds)`: each one's skills (`SkillSummary`: `id`, `name`) by name, by user id; someone with none is
  left out.
- `holders($tenantId, $skillId)`: who has the skill.

### Routes

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /team/skills` | `team.view` | the catalog by name: `[{id, name, members}]`, `members` being how many have it |
| `POST /team/skills` | `team.manage`, `team` | `{name}`: adds one; 201 with `{id, name, members}` |
| `PATCH /team/skills/{skill}` | `team.manage`, `team` | `{name}`: renames it; `{id, name, members}` |
| `DELETE /team/skills/{skill}` | `team.manage`, `team` (and `GuardImpersonation`) | deletes it; `data: null` |
| `PUT /team/members/{user}/skills` | `team.manage`, `team` | `{skillIds}`: the member's skills from now on; `[{id, name}]` |

## Working hours

A member's working week, generic and optional: one span per day they work, in the workspace's time.

### The shape

`team_member_hours` (row-level security with `FORCE`) keeps one row per day worked: the ISO weekday (`weekday`, Monday 1
to Sunday 7, a `CHECK` says so) and its span (`starts_at`, `ends_at`, Postgres `time`, a `CHECK` that it ends after it
starts). A day with no row is off; a member with no rows has said no hours, which is not "never works". The rows hang from
the membership by `(tenant_id, user_id)` with a foreign key that cascades: removing someone takes their week with them.

The times are wall-clock times of the workspace, in its timezone (Settings `localization.timezone`): nothing is stored per
row and nothing is converted. A workspace that changes its timezone keeps the same `09:00`, which now means nine in the new
zone. A module that needs another zone, or a span past midnight, keeps it in its own table.

### Saving it

`PUT /team/members/{user}/hours` `{days}` (`team.manage`, the `team` limiter) always sends the seven days, each once, as
`{weekday, enabled, startsAt, endsAt}`. For a day worked (`enabled: true`) both times are `H:i` (`00:00` to `23:59`, no
seconds) and it ends after it starts; the times of a day off are not read. It replaces the whole week, answers the seven
days as the page shows them (`startsAt`/`endsAt` null on a day off), and is audited as `team.member.hours_updated` with the
seven days before and after. A week with every day off forgets the member's hours. Two saves of one member take turns (a
lock of the member). One's own week, or that of someone one reaches, as for skills. A super admin acting as someone may
save it (support may need to), and the trail names the admin.

| Error | When |
| ----- | ---- |
| 422 on `days` | not seven days |
| 422 on `days.<n>.weekday` | not 1 to 7, or a day twice |
| 422 on `days.<n>.startsAt` / `days.<n>.endsAt` | a day worked without a time, a time that is not `H:i`, or an end that is not after the start |
| 404 `team.member_not_found` | the person has no place in the workspace |
| 403 `team.owner_only` / `team.above_your_role` | an owner's week by someone who is not an owner; anyone else's by someone who could not give their role |

### For a module: `ReadsWorkingHours`

`MoodKit\Team\Contracts\ReadsWorkingHours::weekly($tenantId, $userId): ?WeeklyHours`, asked as the workspace. The week is
Support's (`MoodKit\Support\Contracts\Hours\WeeklyHours`, see [Support](support.md#hours)), the model Branches keeps a
branch's opening hours in: the days worked (`days`, a list of `DayHours`: `weekday`, `startsAt`, `endsAt` as `H:i`) and
`day($weekday)`, null on a day off; the whole answer is null when the member has said no hours. To turn a day into moments,
take the date you plan for in the workspace's timezone (Settings' `ReadsWorkspaceSettings::timezone()`, as the workspace)
and set those times on it:

```php
use MoodKit\Support\Contracts\Hours\WeeklyHours;

$zone = $settings->timezone();
$week = $hours->weekly($tenantId, $userId); // ?WeeklyHours
$day = $week?->day($date->isoWeekday());
$from = $day === null ? null : CarbonImmutable::parse("{$date->toDateString()} {$day->startsAt}", $zone)->utc();
```

Compare the result with `timestamptz` columns in UTC (`->utc()`), never in the workspace's zone.

`WeeklyHours` and `DayHours` used to be `MoodKit\Team\Contracts\`: a module written against those names imports them from
`MoodKit\Support\Contracts\Hours\` now; nothing else changed.

Not here, and left to the modules that need them: more than one span a day, exceptions and holidays, and hours per branch.

### For a module: `MemberAccess`

A package that keeps something about a member (the branches they work at, their shifts) lets the people who may change a
member's hours change it, through `MoodKit\Team\Contracts\MemberAccess`, asked as the workspace:

- `ensureCanEdit($tenantId, $actorId, $userId)`: Team's rule for hours and skills. Oneself, or someone the actor reaches
  (an owner reaches everyone; anybody else, someone whose role they could give, never someone who holds none). The ids may
  come in any case. It throws Team's own errors: 404
  `team.member_not_found` for someone with no place, 403 `team.owner_only` for an owner the actor does not own, 403
  `team.above_your_role` for someone whose role the actor could not give. The route's own permission is the package's to
  check.
- `hold($tenantId, $userId)`: takes the member's lock until the transaction ends, the one Team's own changes of that member
  take (their place, hours and skills), so they take turns; 404 `team.member_not_found` once the member has no place. Call
  it inside the transaction, **before any lock or row of your own that a change of the member could wait for**: the
  member's lock first is the order Team keeps, and two orders deadlock. A lock that only your own saves take, and that Team
  never waits for, may come first (Branches takes a branch's people lock, then the members').

Use it on a route that changes something of a member; [Attach data to members](../guides/attach-data-to-members.md#5-the-routes)
shows it.

## Search

Team brings the source `team.members` to the global search ([Search](search.md)), through `TeamSearchProvider` (tagged
`search.sources`): the group "Team" (icon `users`, order 10), for whoever has `team.view`. Without it the source is never
asked, so nobody without `team.view` sees a member's name or email in the palette. It needs no feature of the plan.

`Search\MembersFinder` runs the list's own query (`ListTeamMembers` with `MemberQuery(search: ...)`, asking for
`search.per_source` rows), so it finds whom the list shows and nobody else:

- words of the name or the email, any case; a `%`, `_` or `\` is a letter;
- the active members alone for someone without `team.manage`;
- the branch the person works at, as the list: that branch's people; nobody while working at no branch (`none`); everyone
  with "All branches" or while the workspace does not work by branch;
- the oldest first.

Each hit is the member's name (their email when they have none), their email under it, and their page,
`/dashboard/team/{id}`.

## Dataset

Team declares the dataset `team.members` to [Data](data.md), through `TeamData` (tagged `data.datasets`): the workspace's people,
for whoever has `team.view`. It needs no flag and no feature of the plan.

- **The rows:** a membership (the `id` is the membership's, not the account's) joined to the account for the name. Someone invited
  who has not joined, and an account that was deleted, are not in it. Team reads the `memberships` table through its own read-only
  model, `Models\TeamMember`, since Auth's model is Auth's.
- **Columns:** `id`, `name`, `role` (the name the workspace stored for the role the person holds), `status`, `last_login_at` and
  `created_at`. The `email` is sensitive: it comes out only for someone who holds `team.manage`. Nothing else of the account is
  declared. The metric is `count`.
- **Who sees which:** `Data\TeamScope`, as the list: whoever manages the team sees the active members and the deactivated ones,
  anyone else the active ones. There is no branch rule: the list's one follows the branch of the top bar, which is the request's
  and not the person's.

## On the dashboard

Team brings the widget `team.members` to the home ([Dashboard](dashboard.md)), through `TeamDashboardProvider` (tagged
`dashboard.widgets`): the card "Team", small, order 10, for whoever has `team.view`. It needs no feature of the plan. Its data:

| Key | What it is |
| --- | ---------- |
| `active` | the active members the person sees: the list's own rule (`ListTeamMembers::filters`), so the branch they work at narrows it (nobody while working at no branch, everyone with "All branches" or while the workspace does not work by branch); inactive members never count, whoever asks |
| `pending` | the workspace's open invitations (not accepted, not revoked, not expired) for whoever has `team.invite`; `null` for anyone else. The invitations' list is the whole workspace's, so it does not follow the branch |

The list reads the branch bar from the current request, so the widget answers only for the person signed in
(`Search\Contracts\RequestingPerson`, as the global search's finder does): a call for someone else's id, or with nobody signed
in, throws instead of answering the whole workspace.

## Notifications

Team declares two event types (`TeamNotificationsProvider`, tagged `notifications.event_types`), which a workspace turns
on or off and rewrites in Settings → Notifications like any other. Both are asked for by listeners of Team's own events,
after the commit, through Notifications' `SendsWorkspaceNotices`: a notice that cannot be built is reported (with the
addresses masked) and never undoes or fails the acceptance or the removal that caused it.

| Event type | Asked for on | Goes to | Says | Channels |
| ---------- | ------------ | ------- | ---- | -------- |
| `team.invitation_accepted` | `InvitationAccepted` | whoever sent the invitation (`system:inviter`, by default), and any role the workspace adds; nobody when that person is gone | the member's name and email, the role they got (in every language) and the workspace, with a button to `/dashboard/team` | email, in the app |
| `team.member_removed` | `TeamMemberRemoved` | the person removed, at their address and in their language (`system:member`, `Recipient::address`), since they are no member any more; about them alone (`personal`) | the workspace and their name; no button, they cannot sign in to it | email |

`team.invitation_accepted` is sent once per invitation (its key is the invitation's id) and does not count against the
plan's monthly emails; each removal is news of its own.

The invitation itself is not an event type on purpose: its link makes an account for its email, and Notifications' delivery
log keeps what it sends so it can be sent again. It is Team's own mail, queued encrypted (`TeamInvitationMail`); its words
are in the package's `lang/{en,es}/mail.php`.

Changing a role from the team page calls Rbac's `PUT /users/{user}/role`, which sends Rbac's `MemberRoleAssigned`, and the
kernel's `workspace.member_role_changed` tells the member (a test of Team keeps it so).

## Onboarding

Team brings the optional onboarding step `team.invite` ("Invite your team", order 100), through
`TeamOnboardingProvider` (tagged `onboarding.steps`). Whoever may onboard the workspace and has `team.invite` does it;
anyone else sees it read-only.

`POST /onboarding/steps/team.invite/complete` takes `{invitations: [{email, roleId}]}`: 0 to `team.onboarding_invitations`
(10) rows, no email twice (any case), each row with only those two fields. It starts empty (`values` is
`{invitations: []}`), and an empty list counts as done: nobody to invite yet.

Each row goes through `InviteMember`, the action of the Team page: the same rule of who gives which role, the same
`team.already_member` and `team.already_invited`, the same place in the plan's members and the same audit. All the rows go
in the transaction that records the step, so one refused keeps none of them and none is mailed (the mails wait for the
commit). A refusal about a field lands on its row's field with its own code: `team.already_member` on
`invitations.1.email`, `team.role_not_grantable` on `invitations.0.roleId`; one about the whole request (a full plan,
`plans.quota_exceeded`) stays as it is.

The rows go in three passes: every row is checked (role, a place already), then every email is locked with its open
invitation, in the order of the emails, and only then does each row ask the plan for its place. The plan's lock comes after
every email and invitation the step holds, as it does for the page, so a step and a page invitation or resend of one of its
emails take turns instead of waiting for each other.

The onboarding lets a super admin acting as someone through, but `InviteMember` does not: the step answers 403
`auth.impersonation_forbidden` and invites nobody.

## Reference

### Every route

All under `/api/v1`. "Impersonation" says whether a super admin acting as someone may use it.

| Route | Permission | Limiter | Impersonation |
| ----- | ---------- | ------- | ------------- |
| `POST /team/invitations/lookup` | public (`tenant`) | `team-lookup` | (no session) |
| `POST /team/invitations/accept` | public (`tenant`), captcha | `team-accept` | (no session) |
| `GET /team/seats` | `team.view` | | yes |
| `GET /team/roles` | `team.view` | | yes |
| `GET /team/skills` | `team.view` | | yes |
| `GET /team/members` | `team.view` | | yes |
| `GET /team/members/{user}` | `team.view` | | yes |
| `GET /team/invitations` | `team.invite` | | yes |
| `POST /team/invitations` | `team.invite` | `team-invite` | no |
| `POST /team/invitations/{invitation}/resend` | `team.invite` | `team-invite` | no |
| `DELETE /team/invitations/{invitation}` | `team.invite` | `team-invite` | no (every `DELETE`) |
| `POST /team/members/{user}/deactivate` | `team.manage` | `team` | no |
| `POST /team/members/{user}/reactivate` | `team.manage` | `team` | no |
| `DELETE /team/members/{user}` | `team.manage` | `team` | no (every `DELETE`) |
| `PUT /team/members/{user}/hours` | `team.manage` | `team` | yes, audited with the admin |
| `PUT /team/members/{user}/skills` | `team.manage` | `team` | yes, audited with the admin |
| `POST /team/skills` | `team.manage` | `team` | yes, audited with the admin |
| `PATCH /team/skills/{skill}` | `team.manage` | `team` | yes, audited with the admin |
| `DELETE /team/skills/{skill}` | `team.manage` | `team` | no (every `DELETE`) |
| `PUT /users/{user}/role` (Rbac's) | `rbac.manage` | Rbac's | no |
| `POST /onboarding/steps/team.invite/complete` (Onboarding's) | `onboarding.manage`, `team.invite` | `onboarding` | the route yes, the invitations no |

`TeamRoutesTest` keeps every route of a member behind `workspace` and a `permission:team.*`, every write behind `team` or
`team-invite`, and the two public ones on `tenant` with their own limiter and `KeepOutOfCachesAndReferrers`.

### Errors

| Code | Status | When |
| ---- | ------ | ---- |
| `team.role_not_grantable` (`roleId`) | 422 | inviting, or sending again, with a role the person may not give |
| `team.already_member` (`email`) | 422 | inviting someone with a place in the workspace |
| `team.already_invited` (`email`) | 422 | inviting an email whose invitation still waits |
| `team.invitation_not_found` | 404 | no invitation of the workspace has that id |
| `team.invitation_not_pending` | 409 | sending again or withdrawing one accepted or withdrawn |
| `team.invitation_invalid` | 404 | looking at or accepting a link that does not work, whatever the reason |
| `team.password_reset_elsewhere` | 422 | accepting with a new password for an account no reset link reaches (a super admin, or someone with no active place anywhere) |
| `team.account_exists` | 409 | accepting as a new person when the email got an account in the meantime |
| `team.member_not_found` | 404 | someone with no place in the workspace |
| `team.cannot_act_on_self` | 422 | deactivating, reactivating or removing oneself |
| `team.owner_only` | 403 | someone who is not an owner acting on an owner |
| `team.above_your_role` | 403 | acting on a member (status, hours, skills) or withdrawing an invitation whose role the person could not give |
| `team.member_not_active` / `team.member_not_inactive` | 409 | a status the member is in already |
| `team.skill_not_found` | 404, or 422 on `skillIds` | no skill of the workspace has that id |
| `team.skill_taken` (`name`) | 422 | a skill's name the workspace has, whatever its case |
| `team.skills_full` | 422 | the catalog is full (`meta.max`) |
| `team.too_many_skills` (`skillIds`) | 422 | more skills for a member than the cap (`meta.max`) |

Team's routes also answer the kit's own: `auth.impersonation_forbidden` (403), `auth.forbidden` (403,
`meta.requiredPermission`), `auth.invalid_credentials` (401, accepting with a wrong password), `auth.captcha_failed`
(422), `plans.quota_exceeded` (422), `rbac.last_owner` (422), `validation.*` (422) and `http.too_many_requests` (429).

### Events

| Event | When | Carries |
| ----- | ---- | ------- |
| `Events\InvitationSent` | an invitation was sent or sent again (after the commit) | `tenantId`, `invitationId`, `invitedByUserId` |
| `Events\InvitationAccepted` | someone joined from an invitation (after the commit) | `tenantId`, `invitationId`, `userId`, `roleId`, `invitedByUserId` (null when gone) |
| `Events\TeamMemberRemoved` | someone was removed (after the commit) | `tenantId`, `userId`, `name`, `email`, `locale`, `removedByUserId` |

### Contracts for modules

- `Contracts\ReadsWorkingHours::weekly($tenantId, $userId): ?WeeklyHours`, Support's `Contracts\Hours\WeeklyHours` ([Working hours](#for-a-module-readsworkinghours)).
- `Contracts\ReadsSkills::of($tenantId, $userIds)` and `holders($tenantId, $skillId)` ([Skills](#for-a-module-readsskills)).
- `Contracts\MemberAccess::ensureCanEdit($tenantId, $actorId, $userId)` and `hold($tenantId, $userId)`
  ([MemberAccess](#for-a-module-memberaccess)).

A module that keeps its own data about members: [Attach data to members](../guides/attach-data-to-members.md). Trying the
whole flow: [Invite your team](../guides/invite-your-team.md).

## The team layer

`frontend/layers/team` draws the team: the Team page, a member's page, the public `/join` page and the screen of the
onboarding step. Its messages are `team.*` in `i18n/locales/{en,es}.json`; its API calls are `app/services/{team,invitations}.ts`.

### The Team page

`/dashboard/team` (`team.view`; the menu's "Team" entry), in the kit's page anatomy:

- **`PageHeader`** with **Invite** for whoever has `team.invite`. The button is always in view for them:
  - with room in the plan, it opens the dialog;
  - at the limit of `members` (active members plus pending invitations, read from `GET /team/seats`, which `team.view`
    may read) it is disabled with the tooltip "Your plan includes N members", and, for whoever has `subscription.view`,
    a **See plans** link to `KIT_ROUTES.subscription` sits beside it (core's `usePlanGate` with `usage` and `limit`,
    [Frontend](../frontend.md#gating-an-action-by-plan));
  - while a super admin acts as the person it is disabled with core's impersonation tooltip.
- **`Tabs`** (`line`): **Members**, **Invitations** (only with `team.invite`) and **Skills**.
- **Members:** a `PageToolbar` with the search (sent 300 ms after the person stops typing, core's `useDebouncedValue`) and
  the role, status (only for whoever has `team.manage`, the only ones the API shows inactive members to) and skill
  filters; the table (who, with "You" on one's own row, role, status, skills, since when) and a pager. Each row's
  actions are icons with their tooltip: open the member, change role, deactivate or reactivate, remove. Which show comes
  from the row's `allowed` (the API's answer for the person asking; never worked out on the screen), and the ones that
  change someone's place are disabled during an impersonation. Change role lists the roles of `GET /team/roles` with
  `grantable`; deactivating and removing ask first. Every dialog has two actions. A refusal is a toast with the API's
  message; one that says the list was out of date (403 `team.above_your_role`, `team.owner_only` or
  `rbac.above_your_role`, someone whose role changed meanwhile) also reads the list again, so its `allowed` is current.
  The list follows the branch the person works at (the API's; the screen never sends it): it loads again when they switch
  branch in the sidebar's switcher (core's `useBranchReload()`), says "Showing the people of {branch}." under the toolbar while they
  work at one, and counts the branch as a filter, so an empty list says nothing matches.
- **Invitations:** a status filter and the table (email, role, status, sent, expires), with **Send again** and
  **Withdraw** on a pending or expired one, each off with a tooltip that says why when the invitation's `allowed` says
  no (a role the person could not give). A refusal (a role the person may no longer give, 422
  `team.role_not_grantable`; 403 `team.above_your_role`; an invitation answered meanwhile) is a toast, and the list is
  read again.
- **Skills:** the catalog with how many members have each; **New skill**, rename and delete for `team.manage` (delete is
  off during an impersonation; renaming is allowed).

What changes the plan's places (an invitation sent, sent again or withdrawn, a member deactivated, reactivated or removed)
reads `GET /team/seats` again, so Invite follows at once.

### A member's page

`/dashboard/team/:id` (`team.view`): the member's name, email, status, role and since when, then the sections the layers
bring through core's `kit:team:member-sections`, by `order`: Team's **Working hours** (10: core's `WeekHoursEditor`, a switch
per day and its two times, in the workspace's timezone, refused before sending when a day ends before it starts) and **Skills** (20: the
workspace's catalog, up to 10, the backend's `team.skills_per_member`; change both together). Whoever may edit this member
(the API's `canEdit`) saves every section that changed with the page's `PageActionBar`, one request each, with the
sections' fields in the page's change set (Review changes); anyone else reads them, with no bar. Leaving with changes not
saved asks first. A member the API answers 404 `team.member_not_found` for (someone with no place, or an inactive member
for whoever does not manage the team) shows an empty state that leads back to the team, with no retry.

A module adds its own section from a plugin of its layer:

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:team:member-sections", (sections) => {
    sections.push({ id: "shifts.member", order: 50, component: MemberShiftsSection });
  });
});
```

The component gets the props `memberId` and `editable`, registers its fields with `useChangeSet()` and saves through
core's `useSaverEntry({ group, isDirty, save, discard })`. The backend half is
[Attach data to members](../guides/attach-data-to-members.md).

### `/join`

The page of an invitation's link, on the workspace's host, drawn by the browser (`browserOnlyRule()`). It reads
`#invitation=` with core's `takeLinkFragment` (the address loses it at once) and asks `POST /team/invitations/lookup`.
Before it asks anything it says who invited which email to which workspace, as what, until when, and what to do next:

- **an account with that email:** its password (a wrong one is said on the field, Auth's `auth.invalid_credentials`), or
  "Forgot it? Choose a new password", which asks a new one twice and says it replaces the account's and signs it out
  everywhere else (`replacePassword`). A refusal of that (422 `team.password_reset_elsewhere`) shows its message, and
  "Use my current password" stays;
- **nobody:** a name and a password, with core's strength meter, twice;
- **every link that does not work** (unknown, expired, used, withdrawn, its inviter gone, or no link at all): one neutral
  answer, with what to do and a link to the sign-in.

The captcha comes last. An email that got an account meanwhile (409 `team.account_exists`) asks the API again and wants
the account's password. Once accepted it follows `handoffUrl` only to `/handoff` of the same origin (`trustedJoinHandoff`);
anything else is not followed, and the page says the person joined and links to the sign-in.

### The onboarding step

`InviteTeamStep` is the screen of `team.invite` (registered through `kit:onboarding:steps`): rows of an email and a role
(those the person may give, Member first), up to 10, with "Add another" and remove. Empty rows are not sent; a refusal
lands on its row's field (`invitations.<n>.email` / `.roleId`) and the plan's limit above the rows. The fields are
read-only without `team.invite` and during an impersonation.
