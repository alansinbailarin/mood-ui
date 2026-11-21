# Signup

`backend/packages/Signup`, namespace `MoodKit\Signup\`, and the frontend layer `frontend/layers/signup`.
A person creates a workspace from the root domain, signed out: they fill in a form, confirm their email
address, and a queued job builds the workspace and makes them its owner.

## The flow

1. **Start.** The form on `/signup` sends `POST /auth/signup`. The API saves a pending signup (the password
   only as a hash), queues the verification email and answers `202` with a `token` that only this browser
   keeps.
2. **Wait for the email.** `/signup/verify-email` polls `GET /auth/signup/status` with that token in the
   `X-Signup-Token` header, and can ask for the email again (`POST /auth/signup/resend`).
3. **Confirm.** The email links to `<APP_FRONTEND_URL>/signup/confirm#verification=<secret>`. The secret is
   in the URL fragment, which no server, log or referrer sees. The confirm screen sends the secret with a
   password to `POST /auth/signup/verify` and receives a `claim` token.
4. **Build.** Confirming queues `ProvisionWorkspaceJob`. The worker creates the workspace, the owner and
   their membership, the roles and the owner role, in one transaction.
5. **Enter.** `/signup/processing` polls the status with the claim. When the workspace is ready, the answer
   carries a `handoffUrl` that signs the owner in on `<slug>.<root domain>` and lands on `/dashboard`.

Three tokens keep the steps apart, so that only the person who can read the email gets in:

| Token | Who has it | What it can do |
| ----- | ---------- | -------------- |
| `token` | the browser that started the signup | read the status, resend the email. Never signs anyone in. |
| verification secret | whoever reads the email | confirm the signup, once |
| `claim` | the browser that confirmed | read the status, and get the `handoffUrl` once the workspace is ready |

The database keeps all three only as SHA-256 hashes.

## Confirming: whoever holds the email decides the password

The confirm screen offers two ways to confirm, and both prove the person holds the address:

| Request | Meaning |
| ------- | ------- |
| `{verification, password}` | the password chosen when the signup started. It must match: a wrong one is 422 `signup.password_mismatch`, changes nothing and leaves the secret good. |
| `{verification, password, replacePassword: true}` | a new password, which replaces the one the signup started with. It must meet the password rules (at least 12 characters, upper and lower case, a number). |

`replacePassword` is a JSON boolean or left out; `"true"`, `1` and `null` are refused.

This is why anyone can sign up with any address without locking its owner out: the owner of an address
somebody else used finishes with their own password, and the person who typed the address never gets the
email. The one thing the owner inherits is what the starter typed: the business name and owner name, shown
in the workspace address before anything is confirmed.

Password checks against one secret are limited to 10 an hour (`password_checks_per_secret_per_hour`),
counted under a lock on the signup's row, and answered 429 `http.too_many_requests` beyond that. The secret
stays good, and choosing a new password is never counted, so the holder can always finish.

An unknown, used or expired secret is 404 `signup.token_unknown`, and no password is looked at. Confirming
uses the secret up, marks the signup `verified` and, in the same transaction, ends every other signup still
waiting for that email as `superseded`.

## Routes

All under `/api/v1/auth/signup`, public, with no `tenant` middleware: they answer on the root domain
whatever workspace a header names. Each has a limiter of its own, counted by IP address.

| Method and path | Limiter | Body or header | Answers |
| --------------- | ------- | -------------- | ------- |
| `POST /auth/signup` | `signup`, 5 a minute | `businessName`, `ownerName`, `email`, `password`, `locale`, `acceptTerms`, `captchaToken`, optional `invite` | `202 {token, candidateSlug, expiresAt}` |
| `GET /auth/signup/check-slug?candidate=` | `signup-slug`, 30 a minute | query `candidate` | `{candidateSlug, isAvailable}` |
| `POST /auth/signup/verify` | `signup-verify`, 30 a minute | `verification`, `password`, `replacePassword` | `{claim}` |
| `GET /auth/signup/status` | `signup-status`, 60 a minute | header `X-Signup-Token`: the token or the claim | `{status, candidateSlug, tenantSlug, errorCode, handoffUrl}` |
| `POST /auth/signup/resend` | `signup-resend`, 5 a minute per IP and signup | header `X-Signup-Token` | `202`, `data: null`, always |

Start and verify read the JSON body only. Every answer of start, verify and status, errors included, carries
`Cache-Control: no-store, private` and `Referrer-Policy: no-referrer` (Support's `KeepOutOfCachesAndReferrers`). `X-Signup-Token` is registered as a secret header, so Sentry never receives
it; a missing or empty header is a token nobody has.

**Status** values: `pending` (waiting for the email), `verified` (confirmed, waiting for the worker),
`provisioning`, `ready`, `failed` and `expired`. A `superseded` signup is never shown: its status read is 404
`signup.token_unknown`, like a token nobody has. `tenantSlug` is the workspace's own slug,
which may carry a number when the wanted one was taken. `handoffUrl` is null unless the call uses the claim,
the status is `ready` and the signup is still within its day. Each claim read makes a new one-time link and
takes the previous one away.

**Field rules**: `businessName` 2 to 80 characters and `ownerName` 2 to 120, each one line of visible characters with
no control, private-use or formatting characters, so none that turn the direction of the text (`validation.plain_name`,
Support's `PlainName`, the rule of a workspace's name), `email` an ASCII dot-atom address
(`ascii`, `email:strict`) of at most 190, `locale` one of `support.locales`, `acceptTerms` accepted,
`captchaToken` at most 2048 characters, `invite` (the invitation the browser brought, if any) at most 128. `invite` is a
secret field: Sentry never receives it.

**Errors**: `signup.email_taken` (422, field `email`) when the address already belongs to a person, said
on purpose. `auth.captcha_failed` (422) when the captcha fails or is required and missing. `signup.closed` (403) and
`signup.invite_invalid` (422, field `invite`) when a gate turns the signup away (see [Gates](#gates)).

## What the answers never say

A new signup never changes another one, whatever its status: an address may have several signups waiting,
and confirming one ends the others. The `202` of a start is the same whether or not the address had a
signup already, and whether or not an email was sent. A resend always answers `202`. So no answer tells
whoever asks that somebody else used the address.

## Email limits

| Limit | Default | Config key |
| ----- | ------- | ---------- |
| Verification emails to one address per clock hour (UTC) | 3 | `signup.emails_per_hour` |
| ... per day (UTC) | 10 | `signup.emails_per_day` |
| Emails one signup is sent in its whole life (first and resends) | 3 | `signup.emails_per_signup` |
| Hours a link is good for, from when it is sent | 24 | `signup.ttl_hours` |

First emails and resends count alike, whoever asks. The address as typed (trimmed, lowercase) has one
allowance; all the `+tag` spellings of the same mailbox share a second allowance of the same size, which the
plain address never uses. So with the defaults an address with its `+tag` spellings gets at most 6 emails an
hour and 20 a day, and tags cannot use up the plain address's emails. Other aliases of one mailbox (dots in a
Gmail local part, `googlemail.com`) are not merged: each counts as an address of its own.

Each allowance's counts are kept in the cache under the hash of its name, never the address, and read and taken under a
cache lock of that allowance: a request that cannot have the lock within three seconds sends nothing.

A signup started over its address's limit is saved and answered as usual, and sent nothing. A resend over a
limit sends nothing. Sharing the limits locks nobody out: any email that reaches the address lets its owner
finish by choosing their own password.

Each email gives the signup a new day (`expires_at` is set again on each send), so a signup lives at most
`(emails_per_signup + 1) × ttl_hours`. An address that already belongs to a person is sent nothing more.

The verification email contains nothing a person typed except the workspace address made from the
normalized slug: the subject, greeting and body are the platform's words, branded with the platform's name and logo
(Support's `PlatformBrand`: the admin's Settings, else `PLATFORM_NAME` or `APP_NAME` and `PLATFORM_LOGO_URL`; see
[Brand the platform](../guides/brand-the-platform.md)). It is queued encrypted, so the queue never holds the secret in a readable form.

## Captcha

`SIGNUP_REQUIRE_CAPTCHA` (config `signup.require_captcha`) decides whether a signup needs a captcha that is
really checked:

| Value | Result |
| ----- | ------ |
| empty, blank or unset | follows `APP_ENV`: off for `local` and `testing` exactly, on for anything else |
| `true`, `1`, `yes`, `on` (any case) | on |
| `false`, `0`, `no`, `off` (any case) | off |
| anything else | on |

On, a signup without a captcha token is refused with `auth.captcha_failed`, and so is every signup while
`AUTH_CAPTCHA_DRIVER` is `null`, which checks nothing (`CaptchaVerifier::isEnforcing()` is false; `StartSignup` asks it): in production, signup stays closed until Turnstile is
configured. Off, the configured driver alone decides, and `null` lets every signup through. Other public forms that let
someone new in ask the same rule through `Contracts\ChecksSignupCaptcha`: the platform's waitlist and Team's acceptance of
an invitation. Login and password recovery always use the driver as it is. See [Captcha](../configuration/captcha.md).

## Gates

Who may make a new workspace can be decided outside Signup, by a gate: `Signup\Contracts\SignupGate`, bound and tagged
`signup.gates` (Platform's access mode and its invitations are one). Every gate must let a signup through, and each is
asked three times:

1. **When the signup starts**, after the captcha and `signup.email_taken`: `admit($email, $invite)`, with the `invite` the
   browser sent (or null). It answers `SignupAdmission::admitted($reference)` or `SignupAdmission::refused($reason)`: 403
   `signup.closed` for `SignupAdmission::CLOSED`, 422 `signup.invite_invalid` (field `invite`) for
   `SignupAdmission::INVITE_INVALID`. A refused signup is not saved. Signup keeps each gate's reference in
   `pending_signups.admissions` (jsonb, by the gate's `slug()`): an id, never a secret.
2. **When the email is confirmed**: `confirm($email, $reference)`. False is 403 `signup.closed`, with nothing written: the
   signup stays waiting, and confirms once the gate lets it.
3. **When the workspace is made**, inside its transaction, right after the workspace row: `consume($email, $reference,
   $tenantId)`, where a gate takes what admitted the signup. False undoes the workspace and ends the signup as `failed`
   with `signup_closed`.

With no gate registered, everyone may sign up, as before.

## Building the workspace

`ProvisionWorkspace` runs in one transaction, with the signup row locked:

1. the workspace, on the wanted slug or the lowest free `-2` to `-99`; when all of those are taken, a random
   suffix of 6 lowercase letters and digits. A slug taken at the last moment is replaced by the next free one on
   the spot. The gates then take what admitted the signup (see [Gates](#gates));
2. the user and their active membership (`CreatesMembers`);
3. the system roles (`ProvisionsTenantRoles`) and the owner role (`AssignsInitialOwner`);
4. the `signup.workspace.provisioned` audit entry and the `WorkspaceProvisioned` event.

Steps 3 and 4 run as the new workspace. A failure leaves nothing behind. The job is unique per signup and
tries three times, 5 and 30 seconds apart, before the signup becomes `failed` with `provisioning_failed`; an
email that got a user in the meantime fails at once with `email_taken`. When the signup becomes `ready`, the
other signups still waiting for that email end as `superseded`.

## Extension point: `WorkspaceProvisioned`

Settings, plans, onboarding and the main branch (Branches) start from `MoodKit\Signup\Events\WorkspaceProvisioned`
(`tenantId`, `ownerUserId`, `locale`), never by editing Signup.

```php
use Illuminate\Support\Facades\Event;
use MoodKit\Signup\Events\WorkspaceProvisioned;

Event::listen(WorkspaceProvisioned::class, CreateDefaultSettings::class);
```

Settings listens to it: a workspace whose owner signed up in a language the API speaks, other than the default, gets
that language as its `localization.locale`. Onboarding listens to it too: the workspace's onboarding starts, with the
app's workspace template.

Listeners run inside the provisioning transaction, as the new workspace: what they write is undone with it,
and a listener that throws stops the workspace from being made (the job is retried). Queue slow work or
calls to other services from a queued listener or a job: every queue connection sends a job queued inside a
transaction once it commits (`after_commit`), so a job queued here runs only for a workspace that was made.

## Commands and schedule

| Command | Schedule | Does |
| ------- | -------- | ---- |
| `php artisan signup:prune` | every minute, on one server | see below |

On each run it:

- marks `expired` every `pending` signup past its day;
- queues the job again for a signup still `verified` more than `signup.requeue_after_minutes` (2) after it
  was confirmed, in case the job was lost;
- marks `failed` with `provisioning_timeout` a signup `verified` or `provisioning` for more than
  `signup.stuck_minutes` (15), so the status screen stops waiting;
- deletes every signup that lapsed more than `signup.retention_days` (7) ago.

## Configuration

| Key | Env | Default | Meaning |
| --- | --- | ------- | ------- |
| `signup.require_captcha` | `SIGNUP_REQUIRE_CAPTCHA` | follows `APP_ENV` | see [Captcha](#captcha) |
| `signup.ttl_hours` | none | `24` | hours a link is good for |
| `signup.emails_per_hour` | none | `3` | per address and clock hour |
| `signup.emails_per_day` | none | `10` | per address and day |
| `signup.emails_per_signup` | none | `3` | per signup, ever |
| `signup.requeue_after_minutes` | none | `2` | before `signup:prune` queues a confirmed signup again |
| `signup.stuck_minutes` | none | `15` | before `signup:prune` fails a signup stuck with the worker |
| `signup.retention_days` | none | `7` | before a lapsed signup is deleted |
| `signup.attempts_per_minute` | none | `5` | starts per IP |
| `signup.resend_attempts_per_minute` | none | `5` | resends per IP and signup |
| `signup.slug_checks_per_minute` | none | `30` | slug checks per IP |
| `signup.status_checks_per_minute` | none | `60` | status reads per IP. The processing screen asks every two seconds. |
| `signup.verify_attempts_per_minute` | none | `30` | confirmations per IP |
| `signup.password_checks_per_secret_per_hour` | none | `10` | password checks per secret |

Keys without an env variable are changed in `backend/packages/Signup/config/signup.php`. The emails go out
only while a queue worker runs, and `signup:prune` only while the scheduler runs.

To change the verification email's layout, copy `backend/packages/Signup/resources/views/mail/` to
`backend/resources/views/vendor/signup/mail/` and edit the copy: Laravel looks there before the package's own
views. Keep the rule that nothing a person typed goes into it.

## The `signup` layer

| Page | Purpose |
| ---- | ------- |
| `/signup` | the form, with a live preview of the workspace address and the captcha when a site key is set; by invitation while the platform's access mode is not `open` (below) |
| `/signup/verify-email` | "check your email", with resend; follows the status with the browser's token |
| `/signup/confirm` | reads the secret from the fragment, removes it from the address bar, and confirms with the signup password or a new one |
| `/signup/processing` | follows the build with the claim, then opens the `handoffUrl` |
| `/terms` and `/privacy` | the two legal pages the form's checkbox links to (below); public, in the layout of the sign-in screens, drawn by the browser with `X-Robots-Tag: noindex` |

- The four signup screens and the two legal pages are rendered in the browser only, with `X-Robots-Tag: noindex`.
- The token and the email wait in the tab's `sessionStorage` for `/signup/verify-email`; the claim waits
  there for `/signup/processing`. Both are forgotten when the signup ends.
- The processing screen follows `handoffUrl` only to the handoff page of `<tenantSlug>.<root domain>`. The
  browser that started the signup, which has no claim, says the workspace is ready and links to its sign-in
  page.
- The terms and privacy links of the form come from `NUXT_PUBLIC_SIGNUP_TERMS_URL` and
  `NUXT_PUBLIC_SIGNUP_PRIVACY_URL` (`/terms` and `/privacy` by default).
- **The legal pages are templates.** `/terms` and `/privacy` exist so the links of the form never lead to a 404 while
  you build. Each is a short plain text in English and Spanish (six sections, with the platform's name in them) under a
  visible notice that says it is a template and has to be replaced with your own text before you launch. The kit cannot
  know what your product promises, so it is yours to write, with a lawyer. To replace them, either edit the messages
  `signup.legal.terms` and `signup.legal.privacy` in the layer's `i18n/locales/<locale>.json` and drop the notice
  (`signup.legal.notice_title` and `notice_body`, drawn by `LegalPage.vue`), or host your own pages and point the two
  settings above at them: the pages of the kit then are never linked, and you can delete them.
- **By invitation.** An invitation's link is `/signup#invite=<token>`: the page reads the token from the fragment (core's
  `takeLinkFragment`, so no server, log or `Referer` sees it), takes it off the address and sends it as `invite` with the
  signup. While the platform's access mode (core's `usePlatformPublic()`, from `GET /platform/public`) is `waitlist` or
  `closed`, a visit with no invitation shows no form: it says that new workspaces come in by invitation, with **Join the
  waitlist** (to the landing's waitlist, `/#waitlist`) in `waitlist` mode, or that none are taken for now in `closed` mode. With the mode unknown
  (the platform layer could not read it) the form shows and the API decides. A refusal of the access mode
  (`signup.closed`, `signup.invite_invalid`) shows in the form's banner, in the API's words: the mode can change while the
  page is open.
