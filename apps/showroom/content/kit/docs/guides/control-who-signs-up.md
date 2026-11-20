# Control who signs up

The platform's **access mode** decides who may make a new workspace through signup. It never touches the workspaces that
exist: their people sign in, pay and work as before whatever the mode, so closing signups never locks out a customer.

| Mode | Who may make a workspace | The public waitlist |
| ---- | ------------------------ | ------------------- |
| `open` | anyone | closed (403 `platform.waitlist_closed`) |
| `waitlist` | only someone with an invitation for their email | takes emails |
| `closed` | only someone with an invitation for their email | closed |

## Choose the mode

- **On the admin host**, in Settings (`PATCH /platform/settings` with `accessMode`, see
  [Brand the platform](brand-the-platform.md)). It takes effect at once.
- **In the environment**, `PLATFORM_ACCESS_MODE`, the mode until an admin saves one. Unset or empty is `open`.

The mode fails closed: a value that is not one of the three (a typo such as `opne`) is read as `closed` and reported to
Sentry, and `php artisan platform:verify` fails the deploy on it. The table the panel saves to takes only the three.

## When it is asked

Signup asks the mode through its gates (see [Signup](../packages/signup.md#gates)) three times:

1. **When the signup starts.** In `waitlist` or `closed`, a signup with no invitation is 403 `signup.closed`, and one with
   an invitation that is not pending or is for another email (unknown, expired, used, taken away, replaced by a newer one)
   is 422 `signup.invite_invalid`. Nothing is saved.
2. **When the email is confirmed.** A signup started while the platform was open is refused (403 `signup.closed`) once it
   is not: the signup waits, and goes through if signups open again. So is one whose invitation was taken away or ran out
   meanwhile.
3. **When the workspace is made**, inside its transaction: the invitation is used up (`accepted_at`, and the workspace it
   made in `workspace_id`), and the waitlist entry of that email becomes `joined`. If the mode closed in between and there
   is no invitation that still works (taken away or past its date), the workspace is not made and the signup fails with
   `signup_closed`.

In `open`, an invitation that works is still taken, so its conversion shows in the panel; one that does not is ignored.

## The waitlist

`POST /api/v1/platform/waitlist` is public, for the root domain's `/waitlist` page: `{email, name, company?, note?,
locale?, captchaToken}`. It answers 202 with `data: null` whether the email was there already or not, and the first entry
stays as it was: the form never tells whether an address asked before. It sends no email, so nobody can use it to write to
a stranger. It takes a captcha by Signup's rule (`SIGNUP_REQUIRE_CAPTCHA`: where signups need one, a driver that checks
nothing refuses), and its limiter, `platform-waitlist`, allows 5 an hour per email and address and 20 an hour per address.
Its answers are never cached. The page explains itself: there is no "we put you on the list" email.

## Invite

From the admin host:

| Route | What |
| ----- | ---- |
| `GET /platform/waitlist` | the waitlist, newest first, 25 a page, with the total; `page`, `perPage`; `status` (`waiting`, `invited`, `joined`), `search` (email, name or company) |
| `POST /platform/waitlist/{id}/invite` | invites that entry's email |
| `POST /platform/invitations` | `{email}`: invites any email, on the waitlist or not |
| `GET /platform/invitations` | the invitations, newest first, each `pending`, `accepted`, `revoked` or `expired` |
| `DELETE /platform/invitations/{id}` | takes an invitation away; one used or already taken away stays as it is |

An invitation is a token of 48 random characters bound to one email. Only its SHA-256 is kept. The email, queued
encrypted and in the person's language (the waitlist entry's, else the app's), carries the platform's brand and the link
`<APP_FRONTEND_URL>/signup#invite=<token>`: the token is in the fragment, which no server, log or `Referer` sees. It works
once, for `PLATFORM_INVITATION_DAYS` (14). Inviting an email again takes the previous invitation away. An email that
already has an account is refused (422 `platform.email_has_account`): its signup would be. Every invitation, its
acceptance and its revocation are written to the platform's trail.
