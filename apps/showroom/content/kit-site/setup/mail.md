# Mail

The kit sends signup verification, password reset, invitations and notification emails. The reference is [Mail](/kit/configuration/mail).

## Local

Mailpit catches every email. It runs in Docker Compose and `.env.example` already points at it:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM_ADDRESS=hello@example.com
```

Open http://localhost:8025 to read what the kit sent. A queue worker has to be running for the emails to arrive.

## Production

1. Pick a transport: SMTP, Amazon SES, or Postmark or Resend. SMTP and SES work as installed. Postmark and Resend need their API transport installed first with Composer (their SMTP endpoints need nothing).
2. Verify a sending domain with the provider (SPF and DKIM records) and set `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME` to an address on it.
3. Set the provider's credentials in the server's environment, never in a file in the image.
4. With SES, route bounces and complaints back to the app: an SNS topic in `NOTIFICATIONS_SES_TOPIC_ARNS` subscribed to `/api/v1/webhooks/notifications/ses`, and a configuration set in `AWS_SES_CONFIGURATION_SET` that publishes Bounce and Complaint to it.
5. Set `NOTIFICATIONS_HASH_KEY` and `NOTIFICATIONS_LINK_KEY` once, before going live, each to its own long random value. Changing them later breaks every preference link already sent.
6. Check it: sign up on the root domain, receive the email, and request a password reset.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
