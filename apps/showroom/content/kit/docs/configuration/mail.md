# Mail

The kit sends the account emails (Auth: the password reset link and the notices about a person's account), the signup
verification email (Signup) and each workspace's notifications (Notifications, see below). They are all queued, so they
leave only while a queue worker runs. Locally they go to Mailpit; in production
you point Laravel's mailer at an SMTP server or a provider.

## Local: Mailpit

`.env.example` sends every email to the Mailpit container:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=${MAILPIT_SMTP_PORT}
MAIL_FROM_ADDRESS=hello@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

Open the inbox at http://localhost:8025 (`MAILPIT_UI_PORT`). Mailpit accepts any SMTP login and keeps the
last 5000 messages. Nothing leaves your machine.

If an email does not show up, check that `php artisan queue:work` is running in `backend/`.

## The sender

| Variable | Meaning |
| -------- | ------- |
| `MAIL_FROM_ADDRESS` | the address every email is sent from. Use one on the domain you verify with your provider. |
| `MAIL_FROM_NAME` | the sender name; `${APP_NAME}` by default |
| `PLATFORM_NAME`, `PLATFORM_LOGO_URL` | the platform's name (empty: `APP_NAME`) and logo in the emails that speak for the platform (signup's verification, an account's emails, the invitation), until the admin's Settings change them: see [Brand the platform](../guides/brand-the-platform.md). Without a logo, the email shows the name. |

## Notification emails

A workspace's notifications ([Notifications](../packages/notifications.md)) go out in the kit's mail frame, the one the
account emails use: a badge, the subject as the title, the paragraphs of the template, a button when the event has one
(colored by its accent) and a footer that names the workspace. Everything a workspace or a person wrote is escaped, so it
shows as written and is never a link.

- **The sender.** Every notification comes from `MAIL_FROM_ADDRESS`, under the name the workspace chooses in Settings →
  Notifications (its own name until it chooses one). A workspace never sends from an address of its own.
- **Tags.** Each email carries two metadata values, `kit_tenant` (the workspace's id) and `kit_delivery` (the delivery's
  id). Laravel's SES transport sends them as message tags, and SES returns them with a bounce or complaint when the
  configuration set publishes events; Postmark, Resend and Mailgun send them as metadata. That is how a bounce finds the
  delivery it is about.
- **The provider's id.** The delivery log keeps the id the provider gave the message: SES's (`X-SES-Message-ID`), another
  transport's `X-Message-ID`, or the message's own `Message-ID`.
- **Unsubscribing.** Each one links to the recipient's preference center, and one they may turn off carries
  `List-Unsubscribe` with `List-Unsubscribe-Post` (one-click, RFC 8058), which Gmail and Yahoo ask of senders of bulk mail.
  See [Notifications](../packages/notifications.md#preferences).

## Production

Pick one of the options below and set `MAIL_MAILER` to match. Whichever you use, verify your sending
domain with the provider (SPF and DKIM records at your DNS, and a DMARC policy), or the emails land in spam
or are refused.

### SMTP

Any SMTP service works with the mailer that is already set up. Your provider gives you a host, a port and
credentials:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.your-provider.example
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=hello@example.com
```

Set `MAIL_SCHEME=smtps` for a provider that wants implicit TLS (usually port 465). Postmark and Resend both
offer SMTP as well, which avoids installing their API clients.

### Amazon SES

Works as installed: the AWS SDK it needs is already there.

1. In the AWS console, open SES in the region you will send from and verify your domain (SES gives you the
   DNS records).
2. Request production access: a new SES account can only send to verified addresses.
3. Create IAM credentials allowed to send email (`ses:SendRawEmail`).
4. Set:

```dotenv
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_REGION=us-east-1
MAIL_FROM_ADDRESS=hello@example.com
```

`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are also the credentials of Laravel's S3 disk. If you later
use S3 with other credentials, give SES its own in `backend/config/services.php`.

#### Bounces and complaints (Amazon SES)

An address that bounces for good, or whose owner marks a notification as spam, is suppressed for the whole platform:
no workspace sends it a notification again (see [Notifications](../packages/notifications.md#suppressions)). SES tells
the app through SNS:

1. Create an SNS topic in the region you send from, and put its ARN in `NOTIFICATIONS_SES_TOPIC_ARNS` (comma separated
   for several) and deploy, **before** subscribing: the webhook refuses every message of a topic it does not know.
2. Subscribe `https://<your API host>/api/v1/webhooks/notifications/ses` to the topic (protocol HTTPS). The webhook
   confirms the subscription by itself: it fetches the confirmation address only from an `sns.<region>.amazonaws.com`
   host over https.
3. Create an SES configuration set with an event destination of type SNS to that topic, for the *Bounce* and
   *Complaint* events, and set `AWS_SES_CONFIGURATION_SET` to its name. With event publishing, SES returns the email's
   tags (`kit_tenant`, `kit_delivery`), and the delivery log marks the delivery `bounced` or `complained`. An identity's
   feedback notifications sent to the same topic work too, without tags: they suppress the address and mark nothing.

The webhook believes a message only when it comes from an allowed topic and Amazon's validator
(`aws/aws-php-sns-message-validator`) shows SNS signed it; anything else is 403 `notifications.webhook_refused`, never a
500, and nothing about it is reported. It checks, in order, so that a request it cannot believe never makes the app reach
out to anyone:

1. the body is an SNS message: a JSON object whose signed fields are strings;
2. its topic is in `NOTIFICATIONS_SES_TOPIC_ARNS`;
3. its `Timestamp` is less than an hour old and at most five minutes ahead of the server's clock (keep it in sync), so a
   signed message someone kept cannot be played again later;
4. its signing certificate is at SNS's certificate path (`/SimpleNotificationService-<hex>.pem`, no query) of an
   `sns.<region>.amazonaws.com` host over https;
5. the signature, with that certificate, fetched without following a redirect and kept an hour.

A message is taken once: its `MessageId` is remembered in the cache for two hours once what it reported is recorded, and
the same message again (SNS retrying, or someone replaying it within the hour) is answered 200 and changes nothing, a
subscription confirmation included. One whose recording failed is taken again when SNS retries it. The cache must be
shared by every server, as the queue's Redis is.

A certificate or a confirmation address that cannot be fetched (an error status, a host that does not answer) is refused
the same way. The webhook is limited per address by `notifications-webhook` (`notifications.webhook_requests_per_minute`,
120). Only a permanent bounce or a complaint suppresses: a soft bounce (a
full mailbox) changes nothing.

Once an address's owner fixed it, let notifications reach it again:

```bash
php artisan notifications:release-suppression someone@example.com --reason="mailbox fixed"
```

It connects as the schema owner, like `migrate` (the app's role cannot lift a suppression), and keeps the suppression,
released, as history.

**Another provider.** Write a class that implements `MoodKit\Notifications\Bounces\BounceDriver`: `handle($body)` proves
the request comes from the provider (its signature) before believing anything, and returns the addresses it reports as
`BounceReport`s. Refuse what it cannot prove with `WebhookRefused`, a malformed body and a failed call to the provider
included: anything else it throws is a 500, reported. To take each of the provider's messages once, return its id as the
outcome's `messageId` (the webhook remembers it once recorded, in `Bounces\ProcessedMessages`) and ask
`ProcessedMessages::seen()` before anything the driver does by itself, as SES's driver does before a confirmation. Name it in `backend/config/notifications.php`, under `bounce_drivers`
(`'postmark' => PostmarkBounces::class`), and point the provider at `/api/v1/webhooks/notifications/postmark`.

### Postmark

The Postmark API transport is not installed. Install it first, from `backend/`:

```bash
composer require symfony/postmark-mailer symfony/http-client
```

1. In Postmark, create a server and verify your sender domain.
2. Copy the server's API token.
3. Set:

```dotenv
MAIL_MAILER=postmark
POSTMARK_API_KEY=...
MAIL_FROM_ADDRESS=hello@example.com
```

### Resend

The Resend API transport is not installed. Install it first, from `backend/`:

```bash
composer require resend/resend-php
```

1. In Resend, add and verify your domain.
2. Create an API key with sending access.
3. Set:

```dotenv
MAIL_MAILER=resend
RESEND_API_KEY=...
MAIL_FROM_ADDRESS=hello@example.com
```

## Check it

1. Start a worker: `php artisan queue:work`.
2. On a workspace's sign-in page, ask for a password reset for an existing user, or start a signup on the
   root domain.
3. The email arrives. If it does not, `php artisan queue:failed` lists jobs that failed, with the error.

## Related

- [Queues and the scheduler](queues-and-scheduler.md)
- [Signup](../packages/signup.md#email-limits): how many verification emails an address can receive.
