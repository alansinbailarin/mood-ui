# Impersonate a member

A super admin can enter a workspace as one of its people, to see what they see when they ask for help. It is a short,
visible and recorded session, and some things are out of its reach.

## Who may, and when

- The flag `platform.impersonation` must be on (it is by default; see
  [Platform flags](../packages/platform.md#platform-flags)). Switching it off refuses new ones, refuses a code already
  handed, and ends every open one on its next request.
- The workspace must be active: not suspended and not closing (409 `platform.workspace_unavailable`). To look at a
  suspended one, resume it first; that is recorded too. Suspending or closing a workspace ends the codes not used yet.
- The person must be an active member of it (404 `platform.member_not_found`), and never another super admin (403
  `platform.impersonation_of_admin`).
- A reason, 10 to 500 characters, is required.
- An admin may start 20 an hour (`platform.impersonations_per_hour`).
- The admin must still be a super admin: a code of one who is no longer is refused, and their open sessions end on their
  next request. `platform:revoke-admin` ends them at once, with the codes they have not used yet.

## The flow

1. On the admin host, Workspaces, open the workspace, then Members, and choose Enter as on the person, with a reason. The
   panel calls `POST /api/v1/platform/workspaces/{id}/impersonations` with `{userId, reason}`.
2. The answer is a one-time address, `<slug>.<root domain>/handoff?code=...`: the code lives a minute, works once and names
   the impersonation on the server. The browser opens it and is signed in as the person.
3. The session lasts 30 minutes (`auth-kit.impersonation_minutes`), and is never renewed: to go on, enter again, with a
   reason. A banner says who is acting, with Exit, which ends the session and goes back to the workspace on the admin
   host. Signing out ends it too.

## What it cannot do

Every request of the session that would hand the account over, touch money or leave a change that outlasts it answers 403
`auth.impersonation_forbidden`, and refusing spends none of the person's own limits:

- the account: changing the password or the email (and its code), signing other sessions out, switching to another
  workspace, the person's profile and photo;
- money: paying, confirming a checkout, changing the plan, opening the billing portal;
- lasting changes: making or changing roles, giving someone a role, undoing a change of a role, the notifications'
  audiences and templates, resending a notification;
- what is the person's own: their notification preferences, and marking their inbox read (nothing is hidden from them);
- every `DELETE` of the workspace's API.

Allowed on purpose, since support may need them and the trail names the admin: signing out and Exit, the session's language
and theme, its realtime channel, the workspace's settings and logo, which notifications go out
(`PUT /notifications/settings`), the onboarding, and the two previews that change nothing. The full list, by route, is in
[Auth](../packages/auth.md#impersonation).

## What is recorded, and where

- **The workspace's trail**: `auth.impersonation.started` and `auth.impersonation.ended` on the person, with the admin (not
  the reason); and every entry written during the session names the admin in `impersonator_user_id`, besides the person as
  the actor.
- **The platform's trail**: `platform.impersonation.started`, on the person, about the workspace, with the reason: the only
  place it is written; and `platform.impersonation.ended`, however it ended, with the admin as the actor.
- **The person**: My profile lists who entered as them and when, for the last 90 days (`GET /me/impersonations`), and
  marks a session that is open (`impersonatedBy` in `GET /me/sessions`). The reason is the platform's note: neither the person nor
  the workspace's trail has it.

## A route of your own

A module route that would hand the account over, touch money or leave a change that outlasts the session takes
`not-impersonating` after `workspace`, and one that writes and does not take it is listed as allowed on purpose in
`tests/Architecture/ImpersonationRoutesTest.php` (the test fails on a write route in neither list):

```php
Route::middleware(['workspace', 'not-impersonating', 'permission:invoices.send'])->post('invoices/{id}/send', SendInvoiceController::class);
```

A `DELETE` needs nothing: the `workspace` group refuses every one during an impersonation. In code, the admin acting is in
`Support\Context\Impersonation` for the whole request and the jobs it queues. See [Auth](../packages/auth.md#impersonation).
