# Invite your team

How a workspace brings its people in, end to end, what you can change, and how to try it locally. The rules behind each
step are in [Team](../packages/team.md).

## The flow

1. **Invite.** On **Team**, whoever has `team.invite` presses **Invite** and gives an email and a role. The owner may give
   any role but owner; a manager gives `member`. The invitation holds a place in the plan's members at once.
2. **The email.** The person gets an email in the workspace's default language, naming the workspace, who invites and the
   role, with a link that works for `team.invitation_days` (7). The link is `<slug>.<root>/join#invitation=<token>`: the
   token is in the fragment, so no server or log sees it.
3. **`/join`.** The page explains the invitation (the workspace, who invites, the role, the email and until when) and asks
   what it needs:
   - an email that has an account on the platform: its password, or, if the person forgot it, a new one (which ends every
     session of theirs, as a reset would, and tells them by email);
   - an email with no account: a name and a password.
   A captcha guards it when one is set up ([Captcha](../configuration/captcha.md)).
4. **The dashboard.** Accepting signs the person in to the workspace with a one-time link and opens `/dashboard`. Whoever
   invited them is told (`team.invitation_accepted`).

From **Team → Invitations** an invitation can be sent again (a new link; the old one stops working) or withdrawn. A link
that no longer works, for whatever reason, says so in the same words.

A new workspace's setup wizard has the optional step **Invite your team**, with up to `team.onboarding_invitations` (10)
rows and the same rules.

## What you can change

| What | Where |
| ---- | ----- |
| How many days a link works | `TEAM_INVITATION_DAYS` in `.env` |
| The caps (skills per workspace and per member, rows of the onboarding step, pages) and the limiters | `backend/packages/Team/config/team.php` (override a key in `backend/config/team.php`) |
| The invitation email's words | `backend/packages/Team/lang/{en,es}/mail.php` |
| The words of "someone joined" and "you were removed" | Settings → Notifications, per workspace; the defaults in `backend/packages/Team/lang/{en,es}/notification_templates.php` |
| Who may invite, and with which role | the roles' permissions (`team.invite`) on **Roles**; who gives a role is Rbac's `grantableBy` ([Add a role template](add-a-role-template.md)) |

## How the plan's limit counts

The plan's `members` quota counts active members plus invitations still waiting. A workspace on the limit cannot invite
(the **Invite** button says how many members the plan includes and, to whoever may see the subscription, links to the
plans), and an expired invitation sent again, or a member reactivated, asks for a place too. Accepting asks for none: the
invitation held it. A workspace that moved to a smaller plan with invitations waiting lets them be accepted.

`GET /team/seats` answers `{used, limit, active, pending}` for whoever has `team.view`, so the button knows without the
subscription's page.

## Someone who already has an account

An email can belong to someone who is in another workspace already. The invitation never tells whoever invites whether it
does; only the person holding the link sees "sign in with your password". If they forgot it, the page lets them choose a
new one: holding the email is what a reset link proves too. Someone deactivated in the workspace is not invited again but
reactivated from the members list.

## Try it locally

1. Start the services and the worker as [Getting started](../getting-started.md) says, and sign in to
   http://demo.localhost:3000 as `owner@demo.test`.
2. Open **Team** and invite an address of your own invention, for example `ana@example.com`, as a member.
3. Open Mailpit at http://localhost:8025 and open the email.
4. Open its link in a private window (you are signed in as the owner in the other one), choose a name and a password, and
   accept. You land on the demo workspace's dashboard as Ana.
5. Back as the owner, Mailpit has "Ana joined", and **Team** lists Ana.

Locally the captcha's driver is `null`, which lets every request through.
