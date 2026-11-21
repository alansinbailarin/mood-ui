# Auth

`backend/packages/Auth`, namespace `MoodKit\Auth\`, and the frontend layer `frontend/layers/auth`. Users,
memberships, login tokens, password reset, moving between workspaces, the captcha and `GET /me`.

## The model

- **Users are global.** One email is one person and one row, whatever the number of workspaces. A user has
  no `tenant_id` and no RLS. Emails are taken in ASCII only, and strict (`email:strict`, a dot-atom address), everywhere (signup, login,
  recovery, reset: `ApiRequest::EMAIL`; the sign-in and recovery forms check the same with
  `emailAcceptedByBackend(value, true)` before sending), so
  no Unicode spelling of a mailbox becomes a second person; an international domain is taken in its `xn--`
  form.
  A person also has a phone (`phone`, E.164, with `phone_country`, ISO 3166 alpha-2: both or neither, checked by the
  database) and an avatar (`avatar_key`), the same in every workspace (see [My profile](#my-profile)).
- **A membership puts a person in a workspace**: `memberships (tenant_id, user_id, status)`, with status
  `active`, `inactive` or `invited`. Only an active member can sign in.
- **A login token belongs to one workspace.** Tokens are Sanctum personal access tokens with a `tenant_id`
  and RLS, so a token presented in another workspace is not found and answers 401 like any unknown token.
  Deleting a membership, its user or its workspace deletes its tokens (a foreign key with `ON DELETE
  CASCADE`).
  Each token keeps the browser it was issued to (`user_agent`): `IssueToken` takes it from the request of the sign-in or
  the handoff, makes it valid UTF-8 (a broken byte becomes `?`), takes its control and format characters out and cuts it
  to 255 characters, and writes it in the same transaction as the token, so a failure leaves no session behind. No
  address is kept.

## Configuration

| Key | Env | Default | Meaning |
| --- | --- | ------- | ------- |
| `auth-kit.token_ttl_minutes` | `SANCTUM_TOKEN_TTL_MINUTES` | `43200` (30 days) | lifetime of a login token |
| `auth-kit.captcha.driver` | `AUTH_CAPTCHA_DRIVER` | `null` | `null` (accepts everything) or `turnstile` |
| `auth-kit.captcha.turnstile_secret` | `TURNSTILE_SECRET_KEY` | empty | required by the `turnstile` driver |
| `auth-kit.login_attempts_per_minute` | none | `5` | per email and IP address |
| `auth-kit.login_attempts_per_address_per_minute` | none | `20` | logins per IP address, whatever the email (password spraying) |
| `auth-kit.login_attempts_per_email_per_hour` | none | `30` | logins per email, whatever the address (one account tried from many) |
| `auth-kit.forgot_password_attempts_per_hour` | none | `5` | per email and IP address |
| `auth-kit.handoff_attempts_per_minute` | none | `20` | per IP address |
| `auth-kit.reset_attempts_per_minute` | none | `10` | per IP address |
| `auth-kit.handoff_ttl_seconds` | none | `60` | lifetime of a workspace-switch code |
| `auth-kit.impersonation_minutes` | none | `30` | lifetime of a super admin's session as someone else; never renewed |
| `auth-kit.sensitive_attempts` | none | `5` | password and email changes a person may try in the window below (`auth-sensitive`) |
| `auth-kit.sensitive_decay_minutes` | none | `15` | the window of `auth-kit.sensitive_attempts`, in minutes |
| `auth-kit.email_change.code_ttl_minutes` | none | `30` | how long a change of email waits for its code |
| `auth-kit.email_change.max_attempts` | none | `5` | wrong codes a change of email takes before it is forgotten, all its codes together |
| `auth-kit.email_change.max_sends` | none | `3` | codes a change of email may send in all |
| `auth-kit.email_change.resend_after_seconds` | none | `60` | how long a new code waits after the last |
| `auth-kit.email_change.requests_per_person_per_day` | none | `10` | changes of email a person may ask for a day (`auth-email-change`) |
| `auth-kit.email_change.requests_per_address_per_day` | none | `5` | changes of email to one address a day, whoever asks (`auth-email-change`) |
| `auth-kit.email_change.requests_per_ip_per_hour` | none | `20` | changes of email asked from one IP address an hour (`auth-email-change`) |
| `auth-kit.email_change.codes_per_address_per_hour` | none | `15` | codes typed or asked for again for one address an hour, whoever asks (`auth-email-code`) |
| `auth-kit.email_change.codes_per_ip_per_hour` | none | `60` | codes typed or asked for again from one IP address an hour (`auth-email-code`) |
| `auth-kit.email_code_attempts_per_minute` | none | `10` | codes a person may type or ask for again a minute (`auth-email-code`) |
| `auth-kit.avatar.max_bytes` | none | `2097152` (2 MiB) | the largest photo a person may upload |
| `auth-kit.avatar.uploads_per_minute` | none | `10` | photo uploads per person a minute (`auth-avatar`) |
| `auth-kit.avatar.max_side` | none | `512` | the side, in pixels, a photo is shrunk to fit within |
| `auth.passwords.users.expire` | none | `30` | minutes a password reset link lasts (`backend/config/auth.php`) |
| `auth.passwords.users.throttle` | none | `60` | seconds before another reset link goes to the same user; a request inside that time sends nothing, and still answers 202 (`backend/config/auth.php`) |

Links in emails and workspace switches take the scheme and port of `tenancy.frontend_url` (`APP_FRONTEND_URL`); the
host is always `<slug>.<root domain>`.

Keys without an env variable are changed in `backend/packages/Auth/config/auth-kit.php`. An unknown
captcha driver, or `turnstile` without a secret, is a configuration error that fails the request. See
[Captcha](../configuration/captcha.md).

`TRUSTED_PROXIES` (`backend/config/trustedproxy.php`) matters here: behind a load balancer without it,
every request seems to come from the balancer, and the login limiter counts everyone as one address. See
[Production checklist](../configuration/production.md).

## Routes

All under `/api/v1`. Public routes take the `tenant` middleware and a limiter of their own; member routes
take the `workspace` group: `tenant`, then `auth:sanctum`, then `EnsureTokenTenant` (the token must be the kit's, issued in
this workspace, with its `tenant:{id}` ability; the wildcard does not count), then `ApplyUserContext` (the user for RLS,
their locale over `Accept-Language`, and a super admin acting as them, see [Impersonation](#impersonation)), then
`GuardImpersonation`. The router's priority list keeps that order. A route that would hand the account over also takes
`not-impersonating`, which runs right after the token check, ahead of the route's own limiters.

| Method and path | Access | Body | Answers |
| --------------- | ------ | ---- | ------- |
| `POST /auth/login` | public, `throttle:auth-login` | `email`, `password`, `captchaToken` | `{token, tokenType, expiresInMinutes, user, tenant}` |
| `POST /auth/forgot-password` | public, `throttle:auth-forgot` | `email`, `captchaToken` | always `202`, `data: null` |
| `POST /auth/reset-password` | public, `throttle:auth-reset` | `token`, `email`, `password`, `passwordConfirmation` | `data: null` |
| `POST /auth/handoff` | public, `throttle:auth-handoff` | `code` | a login payload, plus `next` |
| `POST /auth/logout` | member | none | `data: null`; a session of an impersonation ends it too |
| `POST /auth/impersonation/end` | member | none | `{returnUrl}`: ends this session of an impersonation (see [Impersonation](#impersonation)); 409 `auth.not_impersonating` for a session of the person's own |
| `GET /me` | member | none | `user` (with `avatarUrl`, null without a photo), `tenant`, `membership`, `impersonation` (`{by: {name}, endsAt}` while a super admin acts as the person, else `null`), plus what packages add (Rbac adds `roles` and `permissions`; Platform adds `isSuperAdmin` and `platformFlags`; Settings adds `brand`, `localization` and `theme`; Plans adds `plan`; Onboarding adds `onboarding`; Notifications adds `inbox`) |
| `PATCH /me/locale` | member | `locale`, one of `support.locales` | `{locale}` |
| `GET /me/profile` | member | none | the person's own account: `name`, `email`, `phone`, `phoneCountry`, `locale`, `avatarUrl`, `pendingEmail` (see [My profile](#my-profile)) |
| `PATCH /me/profile` | member | any of `name`, `phone` and `phoneCountry` (both or neither), `locale` | the profile, as `GET /me/profile` |
| `POST /me/avatar` | member, `throttle:auth-avatar` | multipart, one field `file` | 201 `{avatarUrl}` |
| `DELETE /me/avatar` | member | none | `{avatarUrl: null}`; a person with no photo is answered the same |
| `POST /me/password` | member, `not-impersonating`, `throttle:auth-sensitive` | `currentPassword`, `password`, `passwordConfirmation` | `{revokedSessions}`: how many other sessions of the person ended, in every workspace |
| `POST /me/email` | member, `not-impersonating`, `throttle:auth-sensitive`, `throttle:auth-email-change` | `email`, `currentPassword` | 202 `{pendingEmail: {email, expiresAt}}`: a code goes to the new address; the same answer whether the address is free or not |
| `POST /me/email/verify` | member, `not-impersonating`, `throttle:auth-email-code` | `code` (6 digits) | the profile, as `GET /me/profile`, with the new email |
| `POST /me/email/resend` | member, `not-impersonating`, `throttle:auth-email-code` | none | 202, `data: null`: another code, at most three in all and one a minute; the same answer when none goes |
| `DELETE /me/email` | member | none | `data: null`: the change waiting for its code is forgotten |
| `GET /me/sessions` | member | none | the person's live sessions in this workspace, each `{id, name, userAgent, createdAt, lastUsedAt, expiresAt, current, impersonatedBy}` (`impersonatedBy`: the super admin's name for a session of an impersonation, else `null`), the current one first, then the most recently used |
| `GET /me/impersonations` | member | none | the times a super admin entered as the person in this workspace in the last 90 days, newest first, each `{id, by, startedAt, endedAt, expiresAt}`; never the reason |
| `DELETE /me/sessions/{id}` | member | none | `data: null`: that session is signed out. The current one, its id in any case, is 422 `auth.session_is_current` (use `POST /auth/logout`); an id of no session of the person here is 404 `auth.session_not_found` |
| `POST /me/sessions/revoke-others` | member, `not-impersonating` | none | `{revoked}`: every other session of the person in this workspace, expired ones included, is signed out |
| `GET /me/memberships` | member | none | the workspaces the person can switch to, each `{slug, name, current}` |
| `POST /me/switch` | member, `not-impersonating` | `tenantSlug`, optional `next` (a path inside the app) | `{url}`: the destination's `/handoff` address with a one-time code |

Every request of this package reads its fields from the JSON body only (`ReadsJsonBodyOnly`); the photo's file travels
in the multipart files, which that leaves alone.

Its errors: `auth.invalid_credentials` (401), `auth.session_deactivated` (401, `meta.workspace`), `auth.membership_deactivated` (403, a login), `auth.handoff_invalid` (401), `auth.captcha_failed` (422),
`auth.password_reset_invalid` (400), `auth.membership_not_found` (404), and on the profile `auth.avatar_invalid_type`
(422) and `auth.avatar_too_large` (422, `meta.maxBytes`), both on `file`, and `auth.current_password_invalid` (422, on
`currentPassword`), `auth.session_not_found` (404), `auth.session_is_current` (422), `auth.email_unchanged` and `auth.email_taken` (422, on
`email`), and `auth.email_code_invalid` and `auth.email_change_invalid` (422, on `code`). While a super admin acts as the
person, `auth.impersonation_forbidden` (403); Exit from a session of the person's own, `auth.not_impersonating` (409).

## Impersonation

A super admin of the platform can enter a workspace as one of its people, to see what they see. Auth knows nothing of super
admins: whoever decides who may impersonate whom (Platform) asks
`Contracts\IssuesImpersonationLinks::issue($tenantId, $userId, new ImpersonationRequest($impersonatorUserId,
$impersonatorName, $reason, $returnUrl))`.

- **The address.** Only for an active member of a workspace that is neither suspended nor deleted (else
  `auth.membership_not_found`). It writes the impersonation in the workspace (`auth_impersonations`, under row-level
  security: who, as whom, why, where Exit goes back to) and its trail (`auth.impersonation.started` on the person, with
  the admin, never the reason), and answers a `HandoffLink` to `<slug>.<root domain>/handoff?code=...`: the same one-time code
  as a switch of workspace, which lives `auth-kit.handoff_ttl_seconds` and names the impersonation on the server.
- **The session.** `POST /auth/handoff` trades it for a token named `impersonation`, marked with the impersonation
  (`personal_access_tokens.impersonation_id`), that lasts `auth-kit.impersonation_minutes` (30) and is never renewed:
  `expiresInMinutes` says so. An impersonation starts once: a second exchange, or one of an impersonation that started or
  ended, is `auth.handoff_invalid`.
- **While it lasts.** Every request of that session puts the admin in `Support\Context\Impersonation`, so every entry of
  the audit trail names them (`impersonator_user_id`, see [Audit](audit.md)), the jobs it queues included. A token of an
  impersonation that ended, or is gone, is no session (401). What would hand the account over, touch money or leave a change
  that outlasts the session refuses it with 403 `auth.impersonation_forbidden`: the routes with `not-impersonating`, and
  every `DELETE` of the `workspace` group, whatever route a package adds (`GuardImpersonation`). The guards throw Support's
  `ImpersonationForbidden`, which any package may throw too. Refusing spends none of the person's limits. The kit's routes, by what they do:

  | During an impersonation | Routes |
  | ----------------------- | ------ |
  | Refused (`not-impersonating`) | `POST /me/password`, `POST /me/email`, `/me/email/verify` and `/me/email/resend`, `POST /me/sessions/revoke-others`, `POST /me/switch`, `PATCH /me/profile`, `POST /me/avatar`, `PUT /me/notification-preferences`; Billing's `POST /billing/checkout`, `/billing/checkout/confirm`, `/billing/subscription/change` and `/billing/portal`; Rbac's `PUT /users/{user}/role`, `POST /rbac/roles`, `PATCH /rbac/roles/{role}` and `POST /rbac/roles/{role}/undo`; Notifications' `PUT /notifications/audiences`, `PUT /notifications/templates`, `POST /notifications/deliveries/{id}/resend`, `POST /notifications/inbox/read-all` and `PATCH /notifications/inbox/{item}` (nothing is hidden from the person) |
  | Allowed on purpose (support may need them; the trail names the admin) | `POST /auth/logout` and `/auth/impersonation/end`, `PATCH /me/locale`, `PATCH /me/theme`, `POST /realtime/auth`, Settings' `PATCH /settings/{group}` and the logo routes, `PUT /notifications/settings`, the onboarding's actions, and the two previews that change nothing (`POST /notifications/templates/preview`, `POST /rbac/roles/{role}/preview-impact`) |
  | Refused (`GuardImpersonation`) | every `DELETE` |

  `ImpersonationRoutesTest` holds both lists and fails on a route of the `workspace` group that writes and is in neither: a
  new one is refused, or allowed on purpose.
- **Switched off.** `Contracts\AllowsImpersonation::allows($tenantId, $impersonatorUserId)` is asked when a code is
  exchanged and on every request of the session. Auth's own answer is always yes; Platform binds its own: the
  `platform.impersonation` flag is on and the admin is still a super admin. Once it says no, a code is
  `auth.handoff_invalid` and the session ends there (its token deleted, the impersonation marked ended, 401), for good.
- **Ended from outside.** `Contracts\EndsImpersonations`, asked as the workspace, ends impersonations without their session:
  `endBy($tenantId, $impersonatorUserId)` every one of that admin that is open or whose code is still waiting (Platform's
  `platform:revoke-admin`), `endPending($tenantId)` every code not exchanged yet. Each is marked ended (audited
  `auth.impersonation.ended`) and its token deleted; a code of one is then `auth.handoff_invalid`.
- **Exit.** `POST /auth/impersonation/end` deletes the token, marks the impersonation ended (audited
  `auth.impersonation.ended`) and answers `{returnUrl}`, where the admin came from. Signing out ends it the same way.
- **What the person sees.** `GET /me/impersonations` lists who entered as them and when, the last 90 days; the session
  that is open says `impersonatedBy` in `GET /me/sessions`. The reason is the platform's note: the workspace's trail does not have it either; the caller keeps it in its own.

## My profile

What a person keeps about themselves is global, like the person: the same name, phone, language, photo and email in every
workspace they belong to. A change is audited in the workspace it was made from (`AuditEntries`, resource `User`), since
an audit entry belongs to a workspace.

- **Name, phone and language** (`PATCH /me/profile`). Only the fields sent change. `name` is plain text (`PlainName`), at
  most 120 characters. `phone` is E.164 (`+` and 7 to 15 digits) and `phoneCountry` the ISO 3166-1 alpha-2 country it was
  typed for, one of the 249 that standard assigns (Support's `CountryCodes`, in capitals; `ZZ`, `XK` or `UK` is 422
  `validation.in`), both or neither: `phone: null` takes the country away too, and a `phoneCountry` sent without `phone`
  (even `null` or empty) is 422 `validation.present_with` on `phone`. The number is not checked further (no
  libphonenumber): the kit sends no SMS. `locale` is one of `support.locales`; `PATCH /me/locale` still saves it alone.
  What changed is audited as `auth.user.profile_updated` (before and after, by field); a request that changes nothing
  writes no entry.
- **Photo** (`POST`/`DELETE /me/avatar`). Saved the moment it is sent, not with the rest of the profile. What a file is
  comes from its bytes (Support's `RasterImage`): PNG, JPEG or WEBP, at most 8192 px a side and 16 megapixels, else 422
  `auth.avatar_invalid_type`; over `auth-kit.avatar.max_bytes` it is 422 `auth.avatar_too_large`, with `meta.maxBytes`.
  A file PHP refused before the app saw it (over `upload_max_filesize`, or a form's `MAX_FILE_SIZE`) is the same
  `auth.avatar_too_large`, its `meta.maxBytes` the lower of the two limits; a request body over `post_max_size` is 413
  `http.error`. Keep `upload_max_filesize` at least `auth-kit.avatar.max_bytes` (2 MiB; PHP's default `2M` is just
  enough) and `post_max_size` a little above it (see the [production checklist](../configuration/production.md#environment)).
  The server never keeps the bytes it was sent: GD writes the picture again, shrunk to fit within
  `auth-kit.avatar.max_side` (512 px), under a new key of the person, `users/<id>/avatar/<uuid>.<ext>`, on the assets
  disk. The file replaced or taken away is deleted by the queued `DeleteAvatarObject` once the change commits, only
  when it is a key of that person's and nobody has it as their avatar. Audited as `auth.user.avatar_changed` (before
  `{file}`, after `{file, mime, sizeBytes}`) and `auth.user.avatar_removed`. There is no upload straight to the bucket.
- **Password** (`POST /me/password`). The current password, then the new one by the rules of every password
  (`ApiRequest::newPassword()`), other than the current one, typed twice (`passwordConfirmation`). Every other session of
  the person ends, in every workspace (`RevokeAllTokens` keeps only the token of the request), the answer says how
  many (`revokedSessions`), and `PasswordChangedNotification` tells the person by email. Every way into a session that
  was waiting goes too: the reset links of the person's email (`password_reset_tokens`) and their workspace-switch codes
  not exchanged yet (`RevokeHandoffs`: the cache keeps when they were revoked, for as long as a code lives, and
  `POST /auth/handoff` refuses a code made until then with `auth.handoff_invalid`). Audited as
  `auth.user.password_changed` (after `{otherSessionsEnded}`), never with a password.
- **Sessions** (`/me/sessions`). A session is a login token: those of the person in this workspace (row-level security
  shows no other workspace's), with the browser it was opened from (`userAgent`, as the browser named itself; no
  address is kept) and when it was last used. Signing one out, or every other one, needs no password: protecting the
  account never does. It acts in this workspace only; a password change is what ends the sessions everywhere. Audited
  as `auth.session.revoked` (resource `Session`, before `{userId, device}`) and `auth.session.others_revoked` (resource
  `User`, after `{revoked}`, only when one ended).
- **Email** (`/me/email`). The person asks with their current password and the new address; a change waiting from
  before is replaced. The queued `DeliverEmailChangeCode` makes a six-digit code and mails it to the new address
  (`EmailChangeCodeNotification`, never queued itself), with a neutral greeting and nothing the person typed, not even
  their name: nobody has proved the address yet, so it must not carry text of someone's choosing to a stranger.
  `email_changes` keeps only its HMAC (keyed by `APP_KEY`), one row per person, global like `users`.
  `POST /me/email/verify` with the right code makes it the person's email, confirmed, forgets the reset links of the old address, mails the old address a notice with the new one masked
  (`a***@example.com`), audits `auth.user.email_changed` (before and after) and sends `UserEmailChanged` after the
  commit. Asking is audited as `auth.user.email_change_requested`. Other sessions stay open: a password change is what
  ends them.

## Commands and schedule

| Command | Schedule | Does |
| ------- | -------- | ---- |
| `php artisan auth:prune-tokens {--hours=24}` | daily, on one server | deletes the tokens that expired at least that many hours ago (and the `revoked_tokens` of sessions a deactivation ended, which lapse the same way), acting as each workspace in turn. `sanctum:prune-expired` cannot: RLS hides every token from it. |
| `php artisan auth:warm-dummy-hash` | hourly, on one server | makes the dummy password hash that logins with an unknown email are checked against. Run it in your deploy script too. |

## Security behaviour

- **Login failures are all the same**: no such email, a wrong or missing password, no membership in the workspace and an
  invited one all answer 401 `auth.invalid_credentials`. An unknown email is still checked against a dummy hash kept in
  the cache, so the timing does not tell either. That needs a persistent cache store (Redis); a hash made per
  request would be the difference it hides.
- **A deactivated member is told so, and only they.** Deactivating a member deletes their tokens, as ever. For each one
  it keeps the token's SHA-256 hash (never the token) in `revoked_tokens`, tied to the membership, hidden from every other
  workspace by RLS, until the token would have expired. A request whose token Sanctum no longer knows is answered 401
  `auth.session_deactivated` (`meta.workspace` is the workspace's name) instead of `auth.unauthenticated` only when its own
  `id|secret` matches one of those hashes in the workspace it is sent to: a stranger, a made-up token, a token on another
  workspace or one of a member who was removed gets the plain 401. Activating the member forgets the hashes. The frontend
  ends the session as for any dead token and lands on the sign-in page with a notice above the form ("Your access to Acme
  was turned off. Talk to whoever runs the workspace."), kept only until the page is left or reloaded.
- **One exception, for someone who proved who they are**: an email and password that are right for a membership in this
  workspace that was *deactivated* answer 403 `auth.membership_deactivated` ("Your access to this workspace is turned off.")
  and issue no token. The password was checked first (the hash costs the same), so the answer tells a stranger nothing about
  which emails have an account; a wrong password stays the generic 401. It counts against the login limits like any other try.
- **Login is limited three ways**: per email and address, per address across emails, and per email across
  addresses. Whichever runs out answers the same 429 `http.too_many_requests`.
- **The captcha is checked before the credentials**, on login and on password recovery.
- **Password recovery says nothing.** `POST /auth/forgot-password` answers 202 and queues
  `DeliverPasswordResetLink`; the lookup, the token and the email all happen in the worker, so neither the
  answer nor its timing tells who has an account. The email goes out only while a worker runs.
- **The reset link keeps its token out of every log.** The email links to
  `<workspace>/auth/reset-password#token=<token>&email=<email>`: a fragment, which no server, proxy log or `Referer`
  ever sees. Nothing of it is in the query.
- **A reset belongs to the person.** It sets the one password and revokes every token they hold in every
  workspace.
- **Names in the email are text.** The reset email greets the person by name and names the workspace; both are
  escaped for Markdown and HTML (`MarkdownText`), so a name like `Acme [Verify](https://evil.example)` or
  `<style>...</style>` shows as typed and never becomes a link or markup in the platform's voice. Escape any value people
  type that you add to a Markdown email: `MarkdownText::line()` for a translated line with values in it.
- **The account's emails speak for the platform.** The reset link, the changed password and email, and the code of a new
  email are signed with the platform's name (Support's `PlatformBrand`: the admin's Settings, else `PLATFORM_NAME` or
  `APP_NAME`), never a workspace's.
- **Passwords** are at least 12 characters, with upper and lower case and a number.
- **Changing the password asks for the current one** (`CheckCurrentPassword`: 422 `auth.current_password_invalid` on
  `currentPassword`), allows five attempts per person every fifteen minutes (`auth-sensitive`), ends every other session
  the person has, in every workspace, forgets their reset links and switch codes waiting to be used, and emails them a notice with a link to choose another password from this
  workspace. Protecting the account (signing sessions out) never asks for the password.
- **A token never travels in a URL.** `POST /me/switch` returns the destination's address with a one-time
  code: 48 random characters, good for 60 seconds, kept only as a SHA-256 hash in the cache and bound to the
  user and the destination. The destination's frontend exchanges it at `POST /auth/handoff`. Where to land
  (`next`) stays on the server and must be a path inside the app.
- **Changing the email tells nobody which addresses have an account.** `POST /me/email` answers 202 the same for any
  address. An address that is already somebody's gets a code that is kept and never mailed, so nobody can confirm it,
  and a wrong code is answered as for any other address. Only after the right code is the address checked again and,
  if it was taken meanwhile, refused with `auth.email_taken`: whoever typed the code proved the address is theirs. A
  code lives 30 minutes, at most three are sent, one a minute, and the change takes five wrong tries in all: a new code
  does not start the count again.
- **Guessing a code is bounded per person and per address.** Asking for a change needs the current password
  (`auth-sensitive`) and is counted per person (ten a day), per address the code goes to (five a day, whoever asks) and
  per IP address (twenty an hour) by `auth-email-change`; typing a code or asking for one again is counted per person
  (ten a minute), per address (fifteen an hour) and per IP address (sixty an hour) by `auth-email-code`. Whichever runs
  out answers the same 429 `http.too_many_requests`, whether the address has an account or not. So a person can guess at
  most 50 codes a day, and an address is mailed at most 15 codes a day. An address is counted by its HMAC (keyed by
  `APP_KEY`, `EmailChangeLimitKeys`): the cache never holds it.
- **Membership changes go through the model.** Change a status only with `Membership::deactivate()`,
  `activate()` and `remove()`. Through the model, leaving `active` (or returning to it) deletes the
  member's tokens in that workspace, and the change is announced. A bulk update skips both, and old tokens
  would work again once the membership is active.

## Contracts for other packages

All in `MoodKit\Auth\Contracts\`, by id, never a model.

| Contract | Use |
| -------- | --- |
| `CurrentUser` | `id()` and `requireId()` (throws a 401) of the acting user |
| `MemberDirectory` | `userIdByEmail()`, `emailInUse()`, `isActiveMember()`, `activeMembers()`, `countActiveMembers($tenantId, ...$alsoCounting)` (Plans' `members` quota: the active members plus the rows of each query given, the places another package holds, in one statement), `profiles()`, `displayNames()` (a name, or the email when the name is blank), `recipients()` (name, email and own language of the active members among some users, for Notifications) |
| `CreatesMembers` | `create($tenantId, $name, $email, $passwordHash, $locale)`: a user and their active membership, in one transaction, from a bcrypt or argon2 hash someone else made. No token, no role. |
| `CreatesUsers` | `create($name, $email, $passwordHash, $locale)`: a person who belongs to no workspace yet (the platform's first admin, from `platform:setup --create`), from a bcrypt or argon2 hash someone else made, with the address counted as confirmed. The email must be free (`MemberDirectory::emailInUse()`). |
| `ChecksCredentials` | `userId($email, $password, $mayEnter)`: checks an email and a password the way a workspace's login does, for a sign-in of another kind (the admin host's). `$mayEnter($userId)` is asked only once the password matched; every failure, someone it turns away included, is the one `auth.invalid_credentials` (401), and an unknown email still costs a hash. |
| `IssuesImpersonationLinks` | `issue($tenantId, $userId, ImpersonationRequest $request)`: the one-time address that lets a super admin into a workspace as one of its people (see [Impersonation](#impersonation)). Returns a `HandoffLink`. |
| `AllowsImpersonation` | `allows($tenantId, $impersonatorUserId)`: whether that admin may impersonate in the workspace now. Auth binds an answer that is always yes; a package with a switch for it, or a rule of who may, binds its own (Platform: the `platform.impersonation` flag, and a super admin still). |
| `EndsImpersonations` | `endBy($tenantId, $impersonatorUserId)` and `endPending($tenantId)`, as the workspace: end an admin's open impersonations and waiting codes, or every code not exchanged yet (see [Impersonation](#impersonation)). |
| `IssuesHandoffLinks` | `handle($tenantId, $userId, $next, $replacing = null)`: a one-time sign-in address for a workspace, for code with no signed-in user (Signup uses it). Returns a `HandoffLink` with `url` and `reference`. |
| `CaptchaVerifier` | `passes($token, $ip)`: the configured captcha driver; `isEnforcing()`: whether it checks anything (false for `null`) |
| `ListsMembers` | `page($tenantId, MemberFilters $filters, PageRequest $page, $perPage)`: a page, with the total of the people the filters leave, of the people with a place in a workspace, active or inactive, as `MemberRow`s (`userId`, `name`, `email`, `avatarUrl`, `status`, `joinedAt`, `lastLoginAt`, `locale`; times in ISO 8601 UTC with microseconds), oldest first. `MemberFilters` narrows by words of the name or the email (`%` and `_` are letters), a status and a set of people another package chose (null is anyone, an empty list nobody). Pages are numbered, not cursors: the caller passes a `PageRequest` (a page from 1 and an optional size, at most 100) and Support's `Paginate` cuts the query by it, so the result is a `LengthAwarePaginator` with the total. People come oldest first by when each joined, ties broken by id; with `bestMatch` on a word search, the closest to the words come first. `count($tenantId, MemberFilters $filters)`: how many people the same filters keep, the ones `page()` lists without paging. `joinedPerDay($tenantId, $filters, $now, $days)`: how many joined on each of the last days (UTC, oldest first, ending today), the line the dashboard draws. `find($tenantId, $userId)` returns one member, or null. |
| `ManagesMemberships` | `status()` (`active`, `inactive` or null), `join()` (an active place for a person who has an account; false when they had one already, a `LogicException` for an inactive one: that is a reactivation), `deactivate()`, `activate()` and `remove()`. Always through the membership's own methods, so the leave guards are asked (`rbac.last_owner`), the tokens go with a change of status and Auth's events follow. Whether the caller may do it is the caller's to decide; someone with no place is `auth.membership_not_found` (404). |
| `ResetsPasswords` | `reset($userId, $passwordHash)`: a new password for a person whose mailbox the caller has just proved (a one-time secret it mailed there was used: Team's invitation), as a reset link would. Every session of theirs ends in every workspace, the reset links and switch codes waiting die, it is audited in the current workspace (`auth.user.password_replaced`) and the person is told by email. Takes a bcrypt or argon2 hash, never the password. `reaches($userId)`: whether a reset link could reach the person, asked first: an active place in some workspace, and no super admin of the platform. `reset()` throws a `LogicException` for anyone else, so proving a mailbox never gives more than the link would. |
| `IdentifiesPlatformAdmins` | `isAdmin($userId)`: whether the person is a super admin of the platform, whose password only their own reset changes. Auth binds an answer that is always no; a package that keeps super admins binds its own (Platform). |

## Events

`MoodKit\Auth\Events\MembershipRemoved`, `MembershipDeactivated` and `MembershipActivated`, each with
`tenantId` and `userId`, follow a change made through the model. Rbac listens to them to forget a member's
cached access.

`MoodKit\Auth\Events\UserEmailChanged` (`userId`) follows a confirmed change of email, after the commit: a package that
keeps the address elsewhere follows it from there.

`MoodKit\Auth\Events\ImpersonationEnded` (`tenantId`, `userId`, `impersonatorUserId`, `impersonationId`) follows the end of
an impersonation, however it ended (Exit, a sign-out, switched off, or ended from outside, a code not used yet included),
after the commit: Platform writes it to its own trail.

## Extension points

**Add keys to `GET /me`.** Implement `MePayloadContributor` and tag it `auth.me` in your provider's
`register()`. It receives ids, and it cannot replace `user`, `tenant` or `membership`.

```php
use MoodKit\Auth\Contracts\MePayloadContributor;

final readonly class BillingMePayload implements MePayloadContributor
{
    public function contribute(string $tenantId, string $userId): array
    {
        return ['plan' => 'free'];
    }
}

// In BillingServiceProvider::register():
$this->app->tag([BillingMePayload::class], 'auth.me');
```

**Veto a member leaving.** Implement `MembershipLeaveGuard::assertMayLeave($tenantId, $userId)` and tag it
`auth.membership_guards`. It is asked inside the transaction, before an active member is deactivated or
removed, and refuses by throwing a `DomainError`. Rbac's `KeepsLastOwner` uses it to keep the last owner
who can sign in (`rbac.last_owner`). A membership that goes with its user or workspace, or in a bulk delete,
is not asked.

## Seeders

`MoodKit\Auth\Database\Seeders\DemoUserSeeder` creates `owner@demo.test` and `member@demo.test` in the
`demo` workspace, both with the password `Demo-Password-2026`. It refuses to run unless `APP_ENV` is `local`
or `testing`.

## The `auth` layer

| Page | Host | Purpose |
| ---- | ---- | ------- |
| `/login` | workspace | sign in |
| `/auth/forgot-password` | workspace | ask for a reset link |
| `/auth/reset-password` | workspace | the link in the email, `/auth/reset-password#token=<token>&email=<email>`; choose a new password. The page reads both from the fragment and takes it off the address at once. |
| `/handoff` | workspace | exchange a one-time code (from a switch or a finished signup) for a session |
| `/find-workspace` | root domain | type a workspace name, go to its sign-in page |
| `/dashboard/me/profile` | workspace | My profile, the person's own account; linked from **My profile** in the profile menu (`plugins/profile-menu.ts`, through core's `kit:profile-menu:links`) |

On the root domain, a page that needs a workspace sends the visitor to `/find-workspace`; on a workspace
host, `/find-workspace` sends them to `/login` (or the dashboard when signed in).

- The token lives in `localStorage` under `mood-kit.token`. Storage is per origin, so a token only reaches
  its own workspace. A script in the page can read it: the Content Security Policy is what keeps foreign scripts
  out. See [Where the session token lives](../configuration/production.md#where-the-session-token-lives).
- `definePageMeta({ auth: 'required' })` sends a signed-out visitor to `/login?redirect=...` and loads the
  session before the page; `auth: 'guest'` sends a signed-in one on to where they were going or to
  `/dashboard`. `safeRedirect()` keeps `?redirect=` and a handoff's `next` to the backend's `InternalPath` rule: one
  leading slash, no `//`, no backslash, no `.` or `..` segment, no encoded slash, backslash, dot or control character,
  no scheme, fragment or space, at most 512 characters. Anything else lands on `/dashboard`.
- The auth store writes the session in `core` (`useSession()`, but for the roles the rbac layer reads from `/me`)
  and the API token; it loads `/me` and hands it to the layers that read their own keys of it (the rbac layer fills
  `usePermissionsState()`). Its plugin answers the `kit:auth:*` hooks that other layers
  call: `sign-out`, `switch-workspace`, `save-locale` and `refresh-session`, and fires `kit:auth:logout`
  whenever a session ends. See [Frontend](../frontend.md#sharing-between-layers).
- Pages that depend on who is signed in are rendered in the browser only, with `X-Robots-Tag: noindex`:
  `/login`, `/find-workspace`, `/handoff` and `/auth/**` (route rules in `layers/auth/nuxt.config.ts`), and
  `/dashboard` and `/dashboard/**` (in `layers/dashboard/nuxt.config.ts`). The session lives in `localStorage`, which the server cannot read.
- It owns `/dashboard/me/profile` and the profile menu's link to it. The page draws the sections other layers bring
  after its own cards, through core's `kit:profile:sections` (the settings layer's appearance).
- **My profile** (`/dashboard/me/profile`), top to bottom:
  - **Personal information**: the photo (mood-ui's `AvatarUpload`, cropped in the browser and sent as a 512 px WEBP,
    saved the moment it is cropped; taking it away asks first), and the name, the phone with its country (mood-ui's
    `PhoneInput`, E.164) and the language. Those three are fields of the page's change set (`useProfileForm`): the card
    shows the unsaved dot beside its title, the `PageActionBar` reviews and saves them (`PATCH /me/profile` with only
    what changed), and Cancel throws them away. Once saved, the name, the language and the photo show at once in the
    profile menu and the screen (`applyProfile` on the auth store, no new `/me`); a refused field shows on the field (a
    refused `phoneCountry` on the phone). A refused photo is toasted in the API's words (`auth.avatar_too_large` with its
    limit, `auth.avatar_invalid_type`, `validation.uploaded` for a broken upload), but for a 413, which brings none.
  - **Email**: the address, a change waiting for its code (type it, or cancel it: `DELETE /me/email`) and **Change
    email**, a dialog in two steps: the new address with the current password (`POST /me/email`), then the six digits
    mailed to it (`POST /me/email/verify`), with a quiet **Send the code again** (`POST /me/email/resend`). A wrong
    password shows on its field, and a 429 from the limits on asking (`auth-email-change`) in the banner, in the API's
    words; a code that can no longer be used (`auth.email_change_invalid`) forgets the change and
    goes back to the first step. A confirmed email shows at once in the card and the profile menu.
  - **Password**: a line on the rules and **Change password**, a dialog with the current password, then the new one
    twice (core's `PasswordStrength`, by the kit's rules, other than the current one). The toast says how many other
    sessions ended (`revokedSessions`), and the sessions load again.
  - **Sessions**: the person's sessions in this workspace, this device first, each named by its browser and system
    ("Chrome on macOS", read from `userAgent`) with when it was last used ("Last used 3 hours ago"). Any other one signs
    out with its own button (`DELETE /me/sessions/{id}`), and **Sign out other sessions** ends them all
    (`POST /me/sessions/revoke-others`); neither asks for the password. A session a super admin of the platform opened
    as the person carries a warning badge, "Platform: {name}" (`impersonatedBy`). Under the list, **Platform access**
    lists the times one entered as the person in this workspace, the last 90 days (`GET /me/impersonations`): who, when,
    and when it ended or that it is still open. With none, nothing shows, title included; the reason stays the platform's.
  - then the sections other layers bring.

  Leaving with changes not saved asks first (core's `useLeaveGuard`).
- **While a super admin acts as the person** (`/me.impersonation`, `{by: {name}, endsAt}`), a warning banner sits above
  every dashboard page, first of all (`ImpersonationBanner`, through core's `kit:dashboard:banners`, order 0): who from the
  platform is signed in as the person, what is off (the account, sessions, payments and deletions) and when the session
  ends, with **Exit**, in the banner's color. It cannot be closed. Exit calls `POST /auth/impersonation/end`, forgets the
  session here (the store's `discard()`) and opens the `returnUrl`, the workspace's page on the admin's host. The state is
  core's (`useImpersonationState()`, `kit:impersonation`), filled by this layer from `/me` and emptied when the session
  ends. Every screen reads it through core's `useImpersonationGate()` to keep off what such a session may not do: on My
  profile the details and the photo are shown and not changed (with a line that says so), and changing the password or
  the email and signing sessions out are disabled, with the tooltip "Off while impersonating".
- On the admin's host (`usePlatformHost().isPlatformHost`) the layer does nothing: its plugin restores no token and listens
  to no hook, and its middleware lets every page through. The session there is the platform layer's.
- The captcha widget shows on login and password recovery when `NUXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
- On a workspace host the sign-in screens wear the workspace's brand, public through `GET /tenant`: `AuthShell`
  shows its logo above the title, and the submit button and the links (mood-ui's primary) take its color (black and white
  for a workspace on the default color). On the root domain they keep mood-ui's own primary.
- `fetchMe()` reads only the keys of Auth (`user`, `tenant`) and hands the whole of `GET /me` to the other layers
  through core's `kit:session:me` hook: the rbac layer reads the permissions and roles, the settings layer the brand,
  localization and theme. Ending the session empties core's session states (`clearSessionState()`): the theme and the
  localization go, the brand stays, since it belongs to the workspace.
