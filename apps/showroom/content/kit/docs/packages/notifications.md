# Notifications

The `Notifications` package (`backend/packages/Notifications`) sends a workspace's notifications: modules declare event
types, the workspace chooses which ones send an email and to whom, with the words it wants, and every decision is in a
delivery log. The `notifications` layer adds its section to the settings page.

## Permissions

| Permission | Lets a member |
| ---------- | ------------- |
| `notification_settings.view` | see the section, the templates and the delivery log |
| `notification_settings.edit` | turn events on or off, choose audiences, change the sender's name |
| `notification_templates.edit` | change a template, or restore the default |
| `notifications.resend` | resend a delivery to its recipient |

The owner has them all; the manager gets them through its template.

## The sender

Emails come from `MAIL_FROM_ADDRESS`, under the name the workspace chooses in Settings → Notifications (`senderName`,
the workspace's name until someone changes it). The name is one line of visible characters, 2 to 80, without `=?` (422
`validation.no_encoded_words`): a mail program reads `=?...?=` in a header as an RFC 2047 encoded word and would show
another name than the one stored. It is the `notifications` settings group: seeing it takes
`notification_settings.view` besides `settings.view`, and saving it `notification_settings.edit` (the group's
`editPermission`), not `settings.edit`, like the rest of the section. Its `canEdit` in `GET /settings` says the same.

## Event types and channels

Modules declare what Notifications knows with providers, the way they declare permissions:

| Tag | Returns | Declares |
| --- | ------- | -------- |
| `notifications.channels` | `ChannelProvider::channels()`, `ChannelDefinition` values | a way to reach someone; one not available is listed with its reason, and one nobody registers is not listed |
| `notifications.event_types` | `EventTypeProvider::eventTypes()`, `EventType` values | something that can notify a workspace: its variables, audiences, channels, look and default template |
| `notifications.attachments` | `AttachmentProvider` objects | a file a workspace may add to an event's messages |
| `notifications.digest_contributors` | `DigestContributor` objects | lines of a member's daily summary (see Digests) |

`Registry\NotificationsRegistry` gathers them on first use and checks them as a whole: slugs, the channels and
attachments an event type names, its default audiences, its button (a `url` variable), and that its default template
exists in every language of `support.locales` and uses only its variables. A mistake throws
`InvalidNotificationsRegistry`, naming the event and the key.

An event type may be **personal** (`personal: true`, the daily summary): what it says is about the one person it names, so
it goes only to its system audiences. The settings offer no role and no other addresses for it, a save that names one is
422 `notifications.unknown_audience`, and the dispatcher ignores any such row; its default audiences may only be system
ones.

An event type may be **branched** (`branched: true`): its requests name the branch they are about (`branchId`), so a
workspace may send it to the people of that branch (see Audiences).

A channel may reach members only (`membersOnly`, the kernel's inbox): it takes no other addresses, reaches only the
members a system audience names, and the checks of an address (valid, not suppressed) do not apply to it.
`GET /notifications/settings` says so in each channel's `membersOnly`.

The kernel registers two channels, email and the inbox (`in_app`, members only), and seven event types: six through both
channels and the daily summary through email alone. The settings matrix lists a channel only when a provider registers
it, so there are no SMS, WhatsApp or push columns until a module brings one (see
[Registering a channel](#registering-a-channel)). These are the kernel's own event types; Team, Clients, Billing and
Onboarding add theirs (see [The notices of other packages](#the-notices-of-other-packages)).

| Event type | Default audience | Counts towards the email quota |
| ---------- | ---------------- | ------------------------------ |
| `workspace.member_role_changed` | `system:member`, the person whose role changed | yes |
| `plans.trial_ending` | `role:owner` | not to a role or system audience |
| `plans.past_due_entered` | `role:owner` | not to a role or system audience |
| `plans.limit_reached` | `role:owner` | not to a role or system audience |
| `plans.plan_granted` | `role:owner` | not to a role or system audience |
| `plans.plan_grant_ended` | `role:owner` | not to a role or system audience |
| `notifications.daily_digest` (email only, personal) | `system:member`, the member it is about | no: each email it lists counted when it was kept |

Their default templates are in `lang/<locale>/templates.php` of the package. To add one of your own, see
[Add a notification event type](../guides/add-a-notification-event-type.md).

## The kernel's notices

The kernel's event types are asked for by listeners of Notifications on the events of Rbac and Plans, all sent
after their commit. Each builds its notice as the workspace; one that fails is reported and never reaches whoever caused
the event (a role change still answers 200).

| Event type | Asked for on | Goes to | Key |
| ---------- | ------------ | ------- | --- |
| `workspace.member_role_changed` | `MemberRoleAssigned` | the member (`system:member`), in their language: the new role, who gave it, a button to the dashboard | every change |
| `plans.trial_ending` | `TrialEndingSoon` | the owner: the plan, the end date in the workspace's timezone, the days left, a button to the subscription | once per subscription and threshold |
| `plans.past_due_entered` | `SubscriptionStatusChanged` to `past_due` | the owner, with a button to the subscription | every time it becomes past due |
| `plans.limit_reached` | `QuotaLimitReached` | the owner: the resource and the limit, a button to the subscription | once per resource and calendar month (UTC) |
| `plans.plan_granted` | `PlanGranted` | the owner: the plan the platform gave and until when (`grant.until`, in the words and date format of each language), a button to the subscription; never the admin's reason; not a suspended workspace | once per grant |
| `plans.plan_grant_ended` | `PlanGrantEnded` | the owner: the plan that ended, the plan the workspace is on now (the default plan, or the grant that replaced it, whose own notice follows) and what is over its limits (`excess.summary`); not a suspended workspace | once per grant |

The plan's notices to the workspace's people (a role or a system audience) never count against `email_sends_per_month`
nor are refused by it, so a workspace that used all its emails still hears so. Sent to other addresses (`extra`), or sent
again, they count like any email. The account emails (a password reset, a change of email) stay Auth's own mail: they carry a secret,
which the delivery log would keep and an editable template could drop.

### The notices of other packages

Four packages of the kernel declare event types of their own, through the same provider contract a module uses. All
but `team.member_removed` stay out of the plan's `email_sends_per_month`; that one counts like any email:

| Event type | Declared by | Default audience | Channels | More |
| ---------- | ----------- | ---------------- | -------- | ---- |
| `team.invitation_accepted` | Team | `system:inviter`, whoever sent the invitation | email, in the app | [Team](team.md#notifications) |
| `team.member_removed` | Team | `system:member`, the person removed (personal) | email | [Team](team.md#notifications) |
| `clients.import_finished` | Clients | `system:importer`, whoever started the import (personal) | in the app, email | [Clients](clients.md#notifications) |
| `billing.fell_back_to_default` | Billing | `role:owner` | email, in the app | [Billing](billing.md#notifications) |
| `onboarding.completed` | Onboarding | `role:owner` | email, in the app | [Onboarding](onboarding.md#the-email-of-a-set-up-workspace) |

### Registering a channel

A channel is a way to reach someone. A module adds one by tagging a provider in its service provider:

```php
$this->app->tag([ReportsChannels::class], 'notifications.channels');
```

```php
final class ReportsChannels implements ChannelProvider
{
    public function channels(): array
    {
        return [
            new ChannelDefinition('sms', 'reports::channels.sms', available: true, sender: SmsSender::class, order: 20),
        ];
    }
}
```

The sender implements `Contracts\ChannelSender` and gets an `OutgoingMessage`. Give the channel a label key in every
language, and `quotaResource` if its sends should count against a plan's quota. Then add the channel's slug to the
`channels` of the event types that may go through it, and run `php artisan notifications:sync`. From then on the settings
matrix, My profile's preferences and the delivery log show it. A channel with `available: false` is listed disabled,
with its `unavailableReasonKey` as the reason; the registry refuses one that is neither available nor says why. A
channel nobody registers is not shown at all.

### Asking from a listener: `SendsWorkspaceNotices`

A package that asks for a notice from a listener of its own event, after the commit, uses
`Contracts\SendsWorkspaceNotices` (bound to `KernelNotices`, the way the kernel's notices go):

```php
$notices->send($event->tenantId, fn (TenantSummary $tenant): NotificationRequested => new NotificationRequested(...));
```

The callback runs as that workspace (a deleted one too) and gets its id, slug and name (`Tenancy\Contracts\TenantSummary`).
Anything it throws, or the dispatch throws, is reported as a `Support\Reporting\MaskedFailure` (addresses masked) and
never reaches the caller: the request that caused the event already succeeded, and still answers so.

## Syncing the catalog

`php artisan notifications:sync` writes what the registry holds to two global tables, `notification_channels` and
`notification_event_types` (each event type with what it offers: variables, audiences, channels, accent). Run it after
every deploy that adds or changes an event type or a channel; the deploy script does, after `plans:sync`. It refuses a
registry with a mistake, saying what is wrong.

Nothing is ever deleted: a workspace's settings and deliveries name these rows, so an event type or channel no package
declares any more stays, not available. The command connects as the schema owner (`DB_MIGRATION_USERNAME`); the runtime
role may only read the catalog, and `tenancy:verify-rls` fails if it could write it.

Then it gives every workspace the default audiences of the event types it never had (see Audiences), and says how many
workspaces got some. A workspace it cannot give them to is reported, named in the output, and the command ends with a
failure after trying the rest.

## Audiences

Who receives an event through a channel is the workspace's list of audiences for it, each on or off:

| Audience | Who |
| -------- | --- |
| `system:<slug>` | the people the event names itself, for an audience its type declares (`system:member`: the member whose role changed) |
| `role:<role id>` | the active members who hold that role; a deleted role holds nobody |
| `branch` | the people who work at the branch the notification is about (a `branched` event type only) |
| `extra` | other addresses the workspace adds, up to 20 |

They are read in that order: the system audiences, then the roles, then the people of the branch, then the other
addresses. Each address gets the
message once, compared in lower case: the first audience that brings someone picks their template, and the attachments
of every audience that brings them are joined. A member is written to only while their membership is active, at the
address and in the language of their account.

**The people of a branch.** An event type that is `branched` offers the `branch` audience, between the roles and the
other addresses; no other event type does (a save that names it is 422 `notifications.unknown_audience`). It reaches the
active members who work at the request's `branchId` (Tenancy's `BranchAccess::peopleOf()`, the people set on the branch's
page) and nobody for a request with no branch. Someone who sees every branch without working there is not one of them: they
get it through their role, which the workspace may choose too.

**Nobody hears of a branch they may not see.** For any request with a `branchId`, a member who may not see that branch
(`BranchAccess::allows()`) gets nothing of it, whatever audience brings them: a role, a system audience, the people of the
branch. An address (one of the other addresses, or `Recipient::address()` from a module) that is an active member's
account counts as that member (`Dispatch\BranchReach`, through Auth's `MemberDirectory`): writing a member's address never
goes round the rule. An address of nobody in the workspace is the workspace's call and is not filtered. A resend checks it
again (`Deliveries\CurrentRecipient`): a delivery about a branch goes again only to a member, or a member's address, who
still sees it, and one of the `branch` audience only to someone who still works there.

**Attachments.** An audience may add files to the event's emails, among those the event type offers (its `attachments`):
the owner gets the invoice, the customer does not. They are built when the email is sent, in the recipient's language;
one that cannot be built is left out and logged, and the email still goes. See
[Add a notification attachment](../guides/add-a-notification-attachment.md).

**Defaults.** Each event type says what a workspace starts with (`defaultAudiences`: `system:<slug>`, or
`role:<slug>` for the workspace's system role of that slug). A new workspace gets them when it is made
(`WorkspaceProvisioned`), and `notifications:sync` gives the existing workspaces those of an event type they never had.
`notification_audience_seeds` remembers which event types and channels a workspace already got, so an audience it turned
off or removed never comes back. Only the event types the catalog has are given: a workspace made before the first
`notifications:sync` (or before the sync of a new event type) gets them from that sync. `db:seed` writes the catalog and
gives the demo workspace its defaults.

Defaults are given per event type **and channel**: a channel an event type adds later gets its default audiences in every
workspace on the next `notifications:sync`; what a workspace turned off stays off (`notification_audience_seeds` keeps
`(tenant_id, event_type, channel)`). On a members-only channel the other addresses are refused (422
`notifications.unknown_audience`).

## The delivery log

`notification_deliveries` keeps one row per decision about one recipient of one notification: sent, not sent and why,
failed. It is a tenant table, under row-level security. A row has a status and a reason, one reason per decision:

| Status | Shown as |
| ------ | -------- |
| `pending` | Queued: reserved, waiting for a worker |
| `sending` | Sending: a worker took it and is handing it to the provider |
| `sent` | Sent |
| `skipped` | Not sent, on purpose (the reason says why) |
| `failed` | Failed, after every try |
| `bounced` | Bounced |
| `complained` | Marked as spam |

| Reason | Means |
| ------ | ----- |
| `queued` | On its way |
| `sent` | Delivered to the provider |
| `channel_unavailable` | The channel is not available |
| `disabled_by_workspace` | The workspace turned this event off |
| `no_address` | No valid address |
| `suppressed` | The address bounced or complained before |
| `plan_quota_exceeded` | The plan's monthly limit of emails was reached |
| `duplicate_event` | Already sent for this event |
| `digest_batched` | Saved for the daily summary |
| `opted_out` | The recipient turned it off |
| `dispatch_error` | Could not be prepared |
| `provider_error` | The provider refused it |
| `stale` | Stuck on its way, given up (`notifications:fail-stale`) |
| `bounce` | The address bounced |
| `complaint` | The recipient marked it as spam |

Both lists are checked by the database (a new one takes a migration) and labelled in `lang/<locale>/statuses.php` and
`reasons.php`.

**One send per event key, channel and address.** A unique index lets one row hold the send of an event key, a channel and
an address (`pending`, `sending`, `sent`, `bounced` or `complained`). A `skipped` or `failed` row never holds it, so a failed send can
be tried again, and a resend (`resend_of_id`) is a row of its own, outside the index. `resend_of_id` points at a
delivery of the same workspace (the foreign key is `(tenant_id, resend_of_id)`), and deleting that delivery clears only the
link.

**What is kept, and how:**

- the address is encrypted (`recipient`, with `APP_KEY`), named by an HMAC-SHA256 of it in lower case
  (`recipient_hash`, for the unique index and the suppression list) and shown masked (`recipient_hint`, `a***@example.com`).
  The HMAC's key is derived with HKDF from `NOTIFICATIONS_HASH_KEY`, or `APP_KEY` when it is empty (`Keys\NotificationKeys`,
  under a label of its own, so it is never the link key): set it once, before going live, since changing it makes earlier
  deliveries, suppressions and the opt-outs of addresses unknown to new ones (see
  [Production](../configuration/production.md));
- the rendered message is encrypted (`content`), so a resend sends what was sent;
- the branch the notification is about (`branch_id`, null for the whole workspace), with an index on
  `(tenant_id, branch_id, created_at)` and no foreign key: Notifications depends on no package with branches, and what was
  sent outlives its branch;
- a provider's error is kept with every address replaced by `[email]`, at most 500 characters;
- a failure while dispatching or sending is reported (Sentry, the logs, `failed_jobs`) as Support's `Reporting\MaskedFailure`:
  the original's class and message, with every address replaced by `[email]`, and nothing chained to it. What the bounce
  webhook is posted reaches Sentry without addresses, headers or subjects (see
  [Sentry](../configuration/sentry.md#what-is-scrubbed)).

A workspace's own choices live beside it, under row-level security too: `notification_settings` (whether an event sends
through a channel), `notification_audiences` (who receives it), `notification_templates` (its own words) and
`notification_audience_seeds` (which event types already got their default audiences).

**Suppressions are for the whole platform.** `email_suppressions` lists the addresses nothing is sent to: one that bounced
for good or complained is a mailbox problem, not a workspace's. It has no `tenant_id`, so no workspace can write a row for
another, and it keeps the address's HMAC and a masked hint, never the address. The app may read it and add rows (the bounce
webhook does); it may not update or delete one, so nothing it runs can lift a suppression. A released row stays, as
history.

## How a notification is sent

A module sends `Events\NotificationRequested` after its commit (see [Send a notification](../guides/send-a-notification.md)).
The queued listener `QueueNotificationDeliveries` hands it to `Dispatch\DispatchNotification`, which runs as the
workspace and, for each channel of the event type and each recipient its audiences give:

1. asks the policies (`DeliveryPolicies`): the channel must be available and on for the event (the workspace's switch,
   or the event type's default), the address valid and not suppressed, and, for an event type a person may turn off, not
   turned off by them (see Preferences). Each "no" is a `skipped` row with its reason;
2. composes the message (`MessageComposer`): the recipient's language, their audience's template, the event's values,
   the event's `timezone` for its dates, or the workspace's;
3. reserves the send (`DeliveryClaims`), in one transaction: the plan's quota of the channel first (see below), then a
   `pending` row with the rendered message, which the unique index keeps to one per event key, channel and address.
   When the index refuses it, a reservation of the same request (the listener tried again) writes nothing, and one of
   another request is logged `skipped` as `duplicate_event`. The quota check and the row share a savepoint, so a send the
   index refuses takes nothing from the quota and never announces it full: `QuotaLimitReached` (and the owner's
   `plans.limit_reached`) comes only with a reserved send, after its commit;
4. queues `Jobs\SendDelivery` for the reserved row, once the transaction commits.

A failure while deciding or composing for one recipient is reported, logged as their `failed` row (`dispatch_error`),
and the others go on. An event type no package declares is logged as a warning and sends nothing.

**A notification about a branch.** A request that is about something of a branch (an appointment) names it in `branchId`,
a uuid (anything else throws `InvalidArgumentException`), kept in lower case. Every delivery and inbox item it makes keeps
it (`branch_id`), and a resend keeps the first one's. A request with no `branchId` is about the whole workspace.

`SendDelivery` carries the workspace and the delivery's id, never the address or the words. It sends the row's message
through the channel's sender from the workspace's sender name, and marks it `sent` with the provider's id. It is tried
`notifications.send_tries` times (3), `send_backoff_seconds` apart (60 and 300); after the last try the row is `failed`
(`provider_error`) with the error, its addresses hidden.

**A delivery goes out once, however often its job runs.** A queue may hand a job out twice: it delivers at least once, and
it gives a job that runs past the connection's `retry_after` to another worker. So a worker first takes the row, in one
statement that moves it from `pending` to `sending`, and only the worker whose statement changed it sends; a row that is
no longer `pending` is never sent again. A sender that throws gives the row back (`pending`) for the next try. On top of
that, one run per delivery at a time (`WithoutOverlapping` on the delivery's id; a second one is dropped), and a run is
stopped after `notifications.send_timeout_seconds` (60), which must stay below the `retry_after` of the queue connection
(90 by default, `REDIS_QUEUE_RETRY_AFTER`): raise both together. A worker that dies while sending leaves the row
`sending`. The email may have gone out, so it is never sent again by itself.

**Deliveries stuck on their way.** `php artisan notifications:fail-stale`, scheduled every ten minutes, marks `failed`
(`stale`) every delivery still `pending` or `sending` that has not moved for `notifications.stale_after_minutes` (60): a
pending one whose job was lost, a sending one whose worker died. It never sends one again, since a sending one may have
gone out; someone who may resend can. Keep the setting well above the tries and their backoff (about 6 minutes with the
defaults), or a slow queue would see deliveries failed before their job runs.

**What a failed send costs.** A `failed` delivery, a `stale` one included, does not count against the quota: the plan
pays for what was reserved and sent, not for what never went out (or cannot be known to have). The one exception is a
`stale` delivery that was `sending`, which may have reached the provider: it stops counting all the same, which a
workspace can only gain from when a worker dies mid-send.

**The email quota.** Notifications registers the quota resource `email_sends_per_month` with Plans: the emails a
workspace reserved this calendar month (UTC), `pending`, `sending`, `sent`, `bounced` or `complained`, resends included,
and those kept for a member's daily summary (`digest_batched`), which count when they are kept, as if sent; never another
`skipped` one nor a `failed` one (`stale` included). The summary that lists the kept emails does not count again, and a
kept email the summary never sends (the workspace turned the summary off) goes on its own without counting twice. The reservation checks it with Plans' `EnforcesQuotas` inside its
transaction, under the quota's lock, so two dispatches at once take turns and the second counts the first. Over the
limit, the recipient's row is `skipped` as `plan_quota_exceeded`, and an email that would have been kept for a summary
is not kept either: a full quota never holds mail back for later. An event type with `countsTowardsQuota: false` (the
kernel's `plans.*` notices) is neither counted nor refused when it goes to a role or a system audience: a workspace out
of emails still hears about its plan. Only those are exempt. The same notice to other addresses (`extra`) counts and is
refused like any send, and so does every resend: otherwise a workspace could send its own words to any address past its
limit.

## Templates

The words of a message come from one of three levels, in one language at a time:

1. the audience's own (a workspace wrote words for, say, the member a role change is about);
2. the workspace's own, for everyone;
3. the event type's default, the platform's, in the `lang/` of the package that declares it.

The first that exists in the recipient's language wins. Each language stands alone: a workspace that wrote its own Spanish
keeps the platform's English.

**The language** is the recipient's own, else the workspace's (Settings → Localization), else the first of
`support.locales`, whichever the API speaks first. No code names a language.

**The syntax** is plain text: a blank line separates paragraphs, every other line break is a space, and `{{ name }}`
(spaces inside the braces optional) is a variable of the event, dotted snake case (`member.name`, `trial.ends_at`). A
variable is one of three kinds:

- `text`, written as it comes;
- `date`, sent in ISO 8601 and written in the recipient's language and the workspace's timezone, or the one the request
  names (`June 29, 2026`; the daily summary's date is in the person's own);
- `url`, an address, the only kind the event's button may take. The button shows only for an `http` or `https` address;
- `lines`, a list of texts: a paragraph that is that variable alone becomes a paragraph per line; inside a sentence the
  lines are joined with ` · `. The daily summary's items are one.

A value may come in several languages (`['en' => 'Owner', 'es' => 'Propietario']`): the recipient's is used. A missing
value is empty.

**Escaping.** There is no Markdown and no HTML in a template: what a workspace writes, and every value, is shown as
written, escaped for the channel: HTML and Markdown in the email's HTML part, nothing in its text part, which shows the
words exactly as they were written. Links never come from the words: only the event's button links, to the address the
event gives. One thing the kit cannot stop: many mail programs turn a bare address written in the text
(`https://example.com`, `www.example.com`) into a link of their own, in either part. A workspace can therefore put an
address in front of the people its notifications reach, as plain text in its own words. It reaches only the workspace's
own audiences, under its sender name, and every send that could carry it to an address the workspace chose (other
addresses, resends, any event type that counts) counts against its plan's quota, so the quota is what bounds it; only
the plan's own notices to the workspace's roles go uncounted.

**Headers.** The subject and the names in `From` and `To` are mail headers, where `=?` starts an RFC 2047 encoded word
that a mail program decodes into other text. A template's subject and the sender's name refuse it; a value that brings it
anyway (an event's variable, a person's or a workspace's name) is written `= ?` in the header (`Mail\HeaderText`, the one
place every header of a notification goes through), so the email still goes and shows what was written. Symfony Mime
quotes or encodes each name as it needs (`"Acme, Inc."`, an accented name as UTF-8).

## Channels and the email

An available channel names its sender, a class that implements `Contracts\ChannelSender`: `send(OutgoingMessage)` sends
one message and returns the provider's id of it, or throws when the provider refuses. The registry refuses an available
channel without one. The kernel's email channel is `Channels\EmailChannel`: it sends a `Mail\NotificationMail` through the
app's mailer, in the kit's mail frame, from the workspace's sender name, with the `kit_tenant` and `kit_delivery` tags and
the files of the message attached. See [Mail](../configuration/mail.md#notification-emails).

## The inbox

The `in_app` channel puts a notification in the inbox of each member its audiences bring: the bell of the dashboard and
the notifications page. It is a channel like the email: the workspace turns it on or off per event (Settings →
Notifications), chooses its audiences, and its words come from the same templates, in each person's language. It
reaches members only: no other addresses, no address a system audience names, and an address's bounce never stops it. It
has no quota.

`Channels\InAppChannel` writes one row of `notification_inbox` per delivery (a tenant table, under row-level security):
the title, the paragraphs, the badge, the button and the accent, as the person reads them, and the branch its delivery is
about (`branch_id`, null for the whole workspace, no foreign key). A send job that runs twice
finds its row. Then it tells the person's open screens through Reverb (`Events\InboxChanged`, queued after the commit and
published by the queue worker, see [Realtime](../configuration/realtime.md)): no write of the inbox waits on Reverb, and
if Reverb cannot be reached, the item stays and the screen sees it on its next poll.

**Realtime.** Each member listens to one channel per workspace, `private-workspace.<workspace id>.user.<user id>`. The
browser signs into it through `POST /realtime/auth` (`workspace` group, limited per member by `notifications-realtime`,
`notifications.realtime_auths_per_minute`, 60), with the `socketId` Pusher's client opened and the `channelName`; the
answer is `{auth}`, the channel signed with Reverb's secret. Only the person's own channel in the workspace of their token
is signed: any other is 403 `notifications.channel_forbidden`, and with realtime off it is 503 `notifications.realtime_off`.
The event is `inbox.changed`, with `{unread, itemId}`: never the item's words.

`GET /me` carries `inbox`: `{unread, pollSeconds, realtime}`, where `realtime` is `{key, host, port, scheme, channel}`
(Reverb's public key, the address the browser reaches it at, the person's channel) or null when realtime is off.

## Suppressions

`Suppressions\SuppressionList` is the platform's list of addresses nothing is sent to (`email_suppressions`, see The
delivery log). A recipient on it is logged `skipped` as `suppressed`, and a delivery to it cannot be resent. A module that
mails on its own, outside notifications, asks the list through `Contracts\SuppressedAddresses::isSuppressed($address)`
(bound to the list) and sends nothing to such an address: Clients' portal code does.

Addresses get there from the mail provider, through the bounce webhook `POST /api/v1/webhooks/notifications/{driver}`:
public, with no workspace, limited per address (`notifications-webhook`). The driver of the address
(`notifications.bounce_drivers`; the kit ships `ses`, `Bounces\SesSnsDriver`) proves the request comes from the provider
before believing anything in it, and returns what it reports. A request it cannot prove is 403
`notifications.webhook_refused`, never a 500 and never reported, and SES's driver checks the topic and the certificate's
address before it fetches anything (see [Mail](../configuration/mail.md#bounces-and-complaints-amazon-ses)). What it
reports:

- a permanent bounce or a complaint suppresses the address, once (a second report changes nothing);
- when the report names a delivery (the `kit_tenant` and `kit_delivery` tags, the same address and provider id), that
  delivery becomes `bounced` or `complained`, as its workspace;
- a soft bounce changes nothing.

The app may add suppressions but never lift one: `php artisan notifications:release-suppression <email> --reason=...`
does, as the schema owner, and keeps the row as history. Setting up SES and SNS, and writing a driver for another
provider: [Mail](../configuration/mail.md#bounces-and-complaints-amazon-ses).

## Retention

`php artisan notifications:prune`, every day at 03:30 on one server, drops the delivery log after
`notifications.deliveries_keep_days` (180), an inbox item `inbox_read_keep_days` (30) after it was read, and any inbox item
after `inbox_keep_days` (90). A delivery goes together with its resends, once the newest of them is past the 180 days: a
resend is never left without the delivery it repeats. It goes workspace by workspace, a thousand rows (or deliveries) a
statement; a workspace that fails is reported to Sentry, its addresses masked, and the others are still pruned. An inbox
item whose delivery it drops stays, without the link. Raise the days in `backend/config/notifications.php` if your workspaces need longer; the
log is their history of what was sent.

## Preferences

A person decides what reaches them, for the event types that allow it (`allowsOptOut`). They choose by **category**, an
event type's module (Plan, Workspace, a module's own), and channel, one of three modes:

| Mode | |
| ---- | - |
| `instant` | at once (the default: no row) |
| `daily` | in the daily summary instead (the email only, a member only; see Digests) |
| `off` | not at all: the delivery is `skipped` as `opted_out` |

An event type that does not allow it (a role change, a trial ending, a payment past due) always arrives, whatever its
category says. The kernel's one that does is `plans.limit_reached`. `notification_preferences` keeps a choice per
workspace, person (`user:<id>`, which follows them through a change of email) or address that is no member
(`address:<HMAC>`, the log's hash), category and channel. The policies read it after the channel's and the address's.

**Choosing them.** `GET /me/notification-preferences` (`workspace` group, the member's own) answers:

```json
{
  "categories": [{
    "slug": "plans", "label": "Plan",
    "channels": [
      { "slug": "email", "label": "Email", "mode": "instant", "modes": ["instant", "daily", "off"] },
      { "slug": "in_app", "label": "In the app", "mode": "instant", "modes": ["instant", "off"] }
    ],
    "alwaysOn": ["The trial ends soon", "A payment is past due"]
  }],
  "digest": { "hour": 8, "timezone": null, "workspaceTimezone": "America/Tijuana", "timezones": ["Africa/Abidjan", "..."] }
}
```

`PUT /me/notification-preferences` takes `preferences` (a list of `{category, channel, mode}`), `digest` (`{hour, timezone}`,
the timezone null for the workspace's), or both, and answers the same. Everything is checked first: 422
`notifications.unknown_category` for a category with nothing to choose about, `notifications.mode_not_offered` for a
channel the category does not use or a mode it does not offer there (`daily` is the email's). It is limited per member by
`notifications-preferences` (`notifications.preference_changes_per_minute`, 30 a minute) and audited as
`notifications.preferences.updated` (nothing is audited when nothing changed).

**From an email.** Every notification email ends with "Manage your notifications", a link to the workspace's preference
center (`https://<workspace>.<root domain>/notifications/preferences#token=...`: the token rides in the fragment, which no
server or referrer sees). An email of an event type one may turn off also carries `List-Unsubscribe` and
`List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058), whose address turns that event's category off for that
recipient by email, without opening anything. An email that always arrives has no one-click header: it would turn nothing
off. The inbox has neither.

The token (`Preferences\PreferenceLinks`) signs the workspace, whom it is about (a member's id, or the address's hash for
an address that is no member: never the address itself), the category of the one-click and when it was made, with
HMAC-SHA256 under a key derived with HKDF from `NOTIFICATIONS_LINK_KEY`, or `APP_KEY` when it is empty (never either
itself, and never the key that names addresses). The center's token
names no category and the one-click's names one: each works only where it was sent. A token works for
`notifications.preference_link_days` (365). Set the key once, before going live: changing it breaks every link already
sent.

## Digests

A member who chooses `daily` for a category's email gets those emails once a day, in one summary, instead of one by one.

1. **Keeping.** Such an email is composed as usual (their language, their template) and kept: a `skipped` row with the
   reason `digest_batched` and its words, encrypted like every message in the log, one per event key and address as a
   send is. It counts against the email quota now, and one the quota refuses is `plan_quota_exceeded`, never kept. Their
   inbox is not kept: it follows its own choice. An event type that cannot be turned off is never kept. If the workspace
   turned the summary off (Settings → Notifications, "Your daily summary"), or its member audience, the email goes at
   once: nothing is kept for a summary that would never be sent. Emails kept before the workspace turned it off go at the
   next hourly run, whatever the hour, each on its own (`Digest\KeptEmails`): none is lost.
2. **Sending.** `php artisan notifications:send-digests` runs every hour on one server. For each active member with a
   `daily` choice (or with emails kept in the last two days, so what was kept still goes after they change their mind)
   whose local hour is their summary's (`notification_digest_settings.hour`, 8 by default, `notifications.digest_hour`; in
   their timezone, or the workspace's when they chose none), it covers from where their last summary ended (a day back the
   first time) to now and asks every **contributor** for lines. With at least one line it hands the event type
   `notifications.daily_digest` (email only, personal: to that member and no one else; not counted against the quota)
   to the dispatcher at once, with the key `notifications.daily_digest:<user>:<from>-<to>`, the period it covers in UTC
   (`20261105T080000Z-20261106T080000Z`), so no change of timezone can make two summaries one key. The period moves on
   only once that email is reserved to be sent: a summary that does not go (the address bounced since, say) leaves what
   it would have listed for the next one. A summary with no line is not sent, and the period moves on.
3. **Once a day.** Each person is handled in a transaction that first takes a lock of their own without waiting
   (`TransactionLock::try`; a run that finds it taken leaves them to the run that holds it) and then sees whether a summary
   already covered their local day: a second run that hour, or a later one that day after they change their hour, sends
   nothing and leaves the period alone, so what is kept after today's summary goes in tomorrow's.
4. **Contributors.** A `DigestContributor` tagged `notifications.digest_contributors` adds lines about its module
   (`lines($tenantId, $userId, DigestPeriod, $locale)`), as the workspace. The kernel's, `Digest\BatchedNotifications`,
   lists the person's own emails kept in the period ("09:14 · <subject>", at most 30, then "And N more."). Each is asked in
   a savepoint of its own; one that throws, even in the database, is reported (masked) and left out. See
   [Add a digest contributor](../guides/add-a-digest-contributor.md).

## The preference center

The page an email's "Manage your notifications" opens (`/notifications/preferences` of the workspace, the `notifications`
layer) works with no sign-in, for members and for addresses that are no member alike. Its API is public (no workspace
header, no session). The center is limited per address by `notifications-links` (`notifications.link_requests_per_minute`,
30); the one-click by a limiter of its own, `notifications-unsubscribe` (`notifications.unsubscribe_requests_per_minute`,
300), far looser because mail providers post it from addresses many of their users share. Every answer of both, an error
or a refusal of the limiter included, carries `Cache-Control: no-store, private` and `Referrer-Policy: no-referrer`
(Support's `KeepOutOfCachesAndReferrers`). The token rides in the `X-Notification-Token` header (blanked before anything
reaches Sentry), never in the address:

- `GET /notifications/preference-center`: `{workspace: {name}, recipient, categories: [{slug, label, optedOut}], alwaysOn}`,
  where `recipient` is a member's address, masked (null for an address that is no member, whose hash is all that is kept,
  and for someone no longer a member), the categories are those one may turn off by email, and `alwaysOn` names what
  always arrives by email;
- `PUT /notifications/preference-center` with `{categories: [{slug, optedOut}]}`: the same view. Turning a category back on
  leaves a daily summary as it was. A category one cannot turn off by email is 422 `notifications.unknown_category`
  (`categories.<n>.slug`), and nothing is written. Audited as `notifications.preferences.updated_by_link`, with no actor;
- `POST /notifications/unsubscribe/{token}`: the one-click of RFC 8058 (a mail program posts `List-Unsubscribe=One-Click`),
  its token in the path, as RFC 8058 needs one address to post to (blanked before anything reaches Sentry, through
  Support's `SecretPaths`; a server's access log is yours to configure, see [Sentry](../configuration/sentry.md));
  turns the link's category off by email and answers `data: null`, however often it is posted. A choice is written in one
  statement that changes only a row that holds another mode, so two posts at once make one change and one audit entry.
  A visit (`GET`) changes nothing.

Every bad token (changed, signed with another key, expired, of a workspace that is gone, a one-click token at the center
or the center's at the one-click, a one-click of a category no longer offered) is the same 404
`notifications.link_invalid`, with the same message: the answer never tells whether an address or a person exists. The
signature is checked first, in constant time, and nothing is looked up before it. A link changes only its own recipient
in its own workspace, and only their email: the inbox is chosen from My profile.

## API

Every route is for a signed-in member of the workspace (the `workspace` group), under `/api/v1`, and answers in the
language of the request.

During an impersonation (see [Auth](auth.md#impersonation)), what would outlast it answers 403
`auth.impersonation_forbidden`: `PUT /notifications/audiences`, `PUT` and `DELETE /notifications/templates`, a resend, the
person's `PUT /me/notification-preferences`, and marking their inbox read (`POST /notifications/inbox/read-all`,
`PATCH /notifications/inbox/{item}`), so nothing is hidden from them. `PUT /notifications/settings` (which notifications go
out) and the template preview stay open.

### `GET /notifications/settings`

Takes `notification_settings.view`. Everything the notifications section shows:

```json
{
  "channels": [
    { "slug": "email", "label": "Email", "available": true, "unavailableReason": null, "membersOnly": false },
    { "slug": "in_app", "label": "In the app", "available": true, "unavailableReason": null, "membersOnly": true }
  ],
  "eventTypes": [
    {
      "slug": "workspace.member_role_changed", "module": "workspace", "moduleLabel": "Workspace",
      "label": "A member's role changed", "description": "Someone was given another role in the workspace.",
      "channels": ["email", "in_app"], "allowsOptOut": false,
      "variables": [{ "name": "member.name", "label": "Member name", "kind": "text" }],
      "audiences": [
        { "key": "system:member", "kind": "system", "label": "The member" },
        { "key": "role:0195f0a0-...", "kind": "role", "label": "Owner" },
        { "key": "extra", "kind": "extra", "label": "Other addresses" }
      ],
      "attachments": [{ "slug": "invoice_pdf", "label": "Invoice (PDF)" }]
    }
  ],
  "settings": [{ "eventType": "workspace.member_role_changed", "channel": "email", "enabled": true, "version": 0 }],
  "audiences": [
    {
      "eventType": "workspace.member_role_changed", "channel": "email", "audience": "system:member", "enabled": true,
      "extraEmails": [], "attachments": [], "version": 1
    }
  ],
  "locales": ["en", "es"],
  "canEdit": true,
  "canEditTemplates": true
}
```

- `settings` has a row for every event type and channel it goes through: the workspace's, or the event type's default
  at `version` 0 (off for a channel that is not available).
- `audiences` are the rows the workspace has; an audience the event offers and the workspace has no row for is off.
- `eventTypes[].audiences` is what each event offers: its system audiences, every role of the workspace and the other
  addresses (refused on a channel whose `membersOnly` is true).
- `canEdit` is `notification_settings.edit`, `canEditTemplates` is `notification_templates.edit`.

### `PUT /notifications/settings`

Takes `notification_settings.edit`. Turns events on or off by channel, all or nothing:

```json
{ "settings": [{ "eventType": "plans.trial_ending", "channel": "email", "enabled": false, "version": 0 }] }
```

Each row carries the `version` it was read at. Answers with the whole of `GET /notifications/settings`. Refused with:

- 409 `notifications.version_mismatch` when a row was saved by someone else meanwhile, with `meta.currentVersions`
  (`{"plans.trial_ending:email": 1}`, every row the request named), and nothing saved;
- 422 `notifications.unknown_event_type` on `settings.<n>.eventType` (nobody declares it) or `settings.<n>.channel` (it
  does not go through it);
- 422 `notifications.channel_unavailable` on `settings.<n>.enabled` when turning on a channel that is not available.

### `PUT /notifications/audiences`

Takes `notification_settings.edit`. Saves audiences of events, all or nothing:

```json
{ "audiences": [{
  "eventType": "workspace.member_role_changed", "channel": "email", "audience": "extra", "enabled": true,
  "extraEmails": ["billing@example.com"], "attachments": [], "version": 0
}] }
```

`version` is 0 for an audience with no row yet. Other addresses are kept in lower case, once each, up to
`notifications.extra_emails_max` (20). Answers with the whole of `GET /notifications/settings`. Refused with 409
`notifications.version_mismatch` (keys `<event>:<channel>:<audience>`), 422 `notifications.unknown_event_type`, 422
`notifications.unknown_audience` on `audiences.<n>.audience` (an audience the event does not offer, a role of no such
workspace) or `audiences.<n>.extraEmails` (addresses on an audience other than `extra`), and 422
`notifications.attachment_not_offered` on `audiences.<n>.attachments`.

Both saves leave alone a row that does not change, and record what changed as one audit entry
(`notifications.settings.updated`, `notifications.audiences.updated`), before and after.

### Templates

A template is read and written one level at a time, in one language: `eventType`, `channel`, `locale` (one of
`support.locales`) and `audience` (none, or empty, for the workspace's own words; an audience key the event offers for that
audience's).

| Route | Takes | Does |
| ----- | ----- | ---- |
| `GET /notifications/templates?eventType=&channel=&locale=&audience=` | `notification_settings.view` | the level as it stands |
| `PUT /notifications/templates` | `notification_templates.edit` | saves the level's words |
| `DELETE /notifications/templates?eventType=&channel=&locale=&audience=&version=` | `notification_templates.edit` | removes the level's words, so it inherits again |
| `POST /notifications/templates/preview` | `notification_settings.view` | renders words not saved yet with the event's samples |

The first three answer with the level:

```json
{
  "eventType": "workspace.member_role_changed", "channel": "email", "locale": "es", "audience": null,
  "subject": "Tu rol en {{ workspace.name }} cambió", "body": "Hola, {{ member.name }}:\n\n...",
  "source": "platform", "version": 0
}
```

`source` is where the words come from (`platform`, `workspace` or `audience`). A level with no words of its own shows what
it inherits (an audience's level, the workspace's words or the platform's) at `version` 0.

**Saving** takes the level and `subject` (one line, up to 200 characters, without `=?`: 422
`validation.no_encoded_words`), `body` (up to 5000, no control or invisible formatting characters but line breaks and
tabs: 422 `validation.not_regex`, with a message that names what the text may hold) and `version`: 0 the first time,
which makes the level's row from the words sent (the editor sends the inherited words, edited), then the version it was
read at. A stale version is 409 `notifications.version_mismatch` with `meta.currentVersions: {"template": 2}`. A
variable the event does not have is 422 `notifications.unknown_variables`, on `subject` or `body` (the first that has
one), with every unknown name in `meta.variables`. An event nobody declares, a channel it does not go through or an
audience it does not offer are 422 `notifications.unknown_event_type` or `notifications.unknown_audience`, on
`eventType`, `channel` or `audience`.

**Restoring** takes the `version` the words were read at (409 when stale); a level with no words of its own is left as it
is. Saving and restoring are audited (`notifications.template.updated`, `notifications.template.reset`) with the words
before and after.

**The preview** takes `eventType`, `channel`, `locale`, `subject` and `body`, checked as a save checks them, and answers
with the message a recipient would get, filled with the event's sample values in that language:

```json
{
  "subject": "Hola Ana López", "paragraphs": ["Uno", "Dos Gerente"], "badge": "Equipo",
  "action": { "label": "Abrir el workspace", "url": "https://acme.example.com/dashboard" }, "accent": "neutral"
}
```

Everything in it is plain text: draw it as text, never as HTML. `action` is null when the event has no button or its
address is not `http(s)`; `badge` is null when the event has none.

### The delivery log and resends

`GET /notifications/deliveries` takes `notification_settings.view` and lists the workspace's deliveries, newest first, 25
a page (`page`, `perPage` up to 100; `meta.pagination` carries the total), filtered by any of
`subjectType` with `subjectId` (the record a notification was about), `eventType`, `status` and `branchId` (a uuid, in
any case: the deliveries about that branch; anything else is 422 on `branchId`). The log is the workspace's whole log for
whoever may read it, so the branch is a filter they choose, not their access. A row:

```json
{
  "id": "0195f0a0-...",
  "eventType": { "slug": "workspace.member_role_changed", "label": "A member's role changed" },
  "channel": "email", "audience": "system:member", "recipient": "m***@example.com",
  "status": { "slug": "sent", "label": "Sent" }, "reason": { "slug": "sent", "label": "Delivered to the provider" },
  "subject": "Your role in Alpha Studio changed",
  "attemptedAt": "2026-11-06T12:00:00Z", "sentAt": "2026-11-06T12:00:03Z", "resendOf": null, "canResend": true
}
```

The address is only ever shown masked, and of the message only its subject. `canResend` is true for a delivery that
can be resent (an email, never an `in_app` row, that was `sent` or `failed` and kept its words) when the member asking
holds `notifications.resend`.

`POST /notifications/deliveries/{id}/resend` takes `notifications.resend` and is limited per member by
`notifications-resend` (`notifications.resends_per_member_per_minute`, 10). It sends the delivery again to that recipient
only, with the words it was sent with and its attachments built again, as a new row of the log (`resendOf` names the
first delivery), and answers 202 with that row, `pending`. It is refused with:

- 404 `notifications.delivery_not_found`: no such delivery in the workspace;
- 422 `notifications.channel_not_resendable`: only what went to an address (an email) can be resent; an inbox
  notification (`in_app`) stays in the inbox it reached;
- 422 `notifications.not_resendable`: only a delivery that was `sent` or `failed`, and kept its words, can be resent;
- 422 `notifications.recipient_opted_out`: the recipient (a member, or an address through its email's link) turned the
  event type's category off on that channel since. Only for an event type one may turn off; `daily` does not stop a
  resend;
- 422 `notifications.recipient_suppressed`: the address bounced or complained since;
- 422 `notifications.recipient_gone`: the delivery's audience no longer brings that recipient: a member who left the
  workspace (deactivated or removed), now has another address, or no longer holds the role the delivery went to; an
  address taken off the other addresses. An address a system audience named that is no member cannot be checked again,
  and can be resent to;
- 429 `notifications.resend_limit`, with `meta.retryAfterSeconds`: one delivery and its resends are resent at most
  `notifications.resends_per_delivery_per_hour` (3) times an hour;
- 422 `plans.quota_exceeded`: a resend counts against the plan's emails like any send, a resend of the plan's own notices
  too.

Each resend is audited (`notifications.delivery.resent`).

### The inbox

Every route is the signed-in member's own inbox in the current workspace (`workspace` group, no permission):

- `GET /notifications/inbox`: newest first, 20 a page (`page`, `perPage` up to 100; `meta.pagination` carries the total of the person's own items that match); `?unread=1` for the unread only; `?branch=current` for only what concerns the branch the
  person works at (Tenancy's `CurrentBranch`) plus what concerns no branch (the workspace's own). Working at no branch it
  keeps the workspace's own alone; with "All branches", or while the workspace does not work by branch, it narrows nothing.
  `current` is the only value it takes: the inbox never takes a branch's id from the client (anything else is 422 on
  `branch`). The bell and the unread count are never narrowed. An item:

  ```json
  {
    "id": "0195f0a0-...", "eventType": { "slug": "plans.limit_reached", "label": "A plan limit was reached" },
    "title": "Acme reached its limit of Members",
    "paragraphs": ["Acme now uses all 3 of Members the Free plan includes.", "Nothing more of it can be created until a plan with more is chosen."],
    "badge": "Plan", "action": { "label": "Review the plan", "url": "https://acme.example.com/dashboard/subscription" },
    "accent": "warning", "read": false, "createdAt": "2026-11-06T12:00:00Z"
  }
  ```

- `GET /notifications/inbox/summary`: `{unread, latestId}`, what the bell asks for when it has no realtime.
- `PATCH /notifications/inbox/{id}` with `{read: true|false}`: the item, with `meta.unread`.
- `POST /notifications/inbox/read-all`: `{unread: 0}`.

An item of another person or another workspace is the same 404 `notifications.inbox_item_not_found` as one that does not
exist. The writes are limited per member by `notifications-inbox` (`notifications.inbox_changes_per_minute`, 120) and send
`inbox.changed` to the person's other screens.

## The history of a record

A module that shows the notifications about one of its records on its own screen, behind its own permission, reads them
through `Contracts\DeliveryHistory`, as the workspace:

```php
$records = $history->forSubject($tenantId, 'invoice', $invoice->id); // list<DeliveryRecord>, newest first, 50 by default
```

A `DeliveryRecord` has the id, event type, channel, `recipientHint`, status, reason, subject, `attemptedAt`, `sentAt`,
`resendOfId` and `canResend` (whether the person signed in may resend it; false with nobody signed in); never the
address. Asking for another workspace than the current one throws a
`LogicException`. To let people resend from there, call the API's resend route, which checks `notifications.resend`.

Or link to the page the `notifications` layer brings: `/dashboard/notifications/deliveries`
(`notification_settings.view`) lists the log with the filters of its address. A module's screen links to
`KIT_ROUTES.notificationDeliveries` with `?subjectType=<its type>&subjectId=<the record>` for one record's history:

```vue
<KitButton
  :to="`${KIT_ROUTES.notificationDeliveries}?subjectType=invoice&subjectId=${invoice.id}`"
  :label="t('invoices.notifications')"
  :tooltip="t('invoices.tooltips.notifications')"
  variant="text"
/>
```

Each row has a resend when it allows one (`canResend`). The page also filters by status (`?status=failed`) and by event
type (`?eventType=...`).

## The `notifications` layer

`frontend/layers/notifications` adds the **Notifications** section to the settings page (`/dashboard/settings`). Its
plugin `notifications-sections.ts` hands the section to the page through core's `kit:settings:sections`, so it shows
for whoever sees the `notifications` settings group (`notification_settings.view` besides `settings.view`), after
Localization.

- **The sender.** `SenderNameField` edits `senderName` with core's `useSettingsForm`, like any settings section: a plain
  name of 2 to 80 characters, disabled for someone who may only look. It has no Save of its own: the page's action bar
  saves it with the other sections, and a refusal opens the section and shows why.
- **The events.** Below the sender, every event of `GET /notifications/settings`, grouped by module, each a card with its
  name, what it is and a switch per channel. A channel that is not available, or that the event does not use, is off and
  disabled, and its tooltip says why. **Audiences** opens, under the card, a switch for each audience the event offers
  on each channel it sends by: its system audiences, every role of the workspace, "The people of its branch" for an event
  that is `branched` (audience kind `branch`), and "Other addresses", which takes up to 20 addresses once it is on; when the event offers files, a list of the ones each audience gets. Someone without
  `notification_settings.edit` sees them all disabled.
- **Templates.** **Template** on an event opens `TemplateEditorDialog`: a language (the screen's, when the workspace has it
  among `locales`) and who it is for (everyone, the workspace's own level, or one of the event's audiences), then the subject
  and the text, plain, a blank line between paragraphs. The event's variables are buttons named by what they hold, which
  write `{{ name }}` where the cursor was in the field last used. A variable the event does not have, or an empty subject
  or text, is said under the field and stops Apply (and moving to another level). Beside the fields, a preview asks
  `POST /notifications/templates/preview` once the person stops typing and draws the answer with mood-ui (badge,
  subject, paragraphs and the button in the event's accent), from plain text: no HTML from data. Moving between
  languages and audiences keeps what was written in each. A level with words of its own can **Use the default text**
  instead. **Apply** keeps every level changed as a draft of the section; **Cancel** leaves everything as it was. Without
  `notification_templates.edit` the dialog only reads, with Close.
- **Saving.** Nothing saves by itself. `useNotificationSettings` keeps each change as a draft in the page's change set,
  under the section (its dot, the review of changes before → after, a template's words by their first line, the leave
  guard), and hands the page's saver an entry of its own. Save sends what changed: the matrix
  (`PUT /notifications/settings`), then the audiences (`PUT /notifications/audiences`), then each template (`PUT`, or
  `DELETE` to go back to the default), every row with the version it was read at, skipping a part with nothing in it. A
  refusal is toasted and opens the section. A 409 `notifications.version_mismatch` also says, above the events, that
  someone else saved meanwhile, and loads what is saved now in place of the person's changes to what they saved (for a
  template, its draft alone). A reload in another language keeps the changes. The bar is the settings page's: it shows
  for whoever may edit one of the page's groups.

### The inbox

- **The bell.** The layer puts a bell in the dashboard's top bar (core's `kit:topbar:items`), with the unread count from
  `GET /me` (`inbox`) in mood-ui's `Chip` over it. It is kept up to date through Reverb when `inbox.realtime` is there
  (laravel-echo and pusher-js, loaded only then; the sign-in goes through `POST /realtime/auth`), and by asking
  `GET /notifications/inbox/summary` every `pollSeconds` until the websocket connects, whenever it drops, or always
  without realtime. It opens mood-ui's `Drawer` from the right, titled Notifications (its close button read in the screen's language), with the eight latest (each marked
  read or unread, or opened, which closes the drawer) and two actions in its footer, "Mark all as read" and "See all".
- **The page.** `/dashboard/notifications` lists the whole inbox, every paragraph, under two tabs (`line`): All and Unread, with "Mark all
  as read" as the page's action and core's `ListPagination` (mood-ui's `TablePagination`) for the older ones. Each item opens what it is about (inside the app when its
  button points at this workspace, marking it read) and can be marked read or unread. A change made in another tab, or
  by Reverb, loads the list again. While the person works at one branch (core's `useCurrentBranch()`), a toolbar under the
  tabs has a switch at its right, "Only {branch}" (mood-ui's `GlassSwitch`): on, the list asks `GET /notifications/inbox?branch=current` (what
  concerns that branch and what concerns none; the page never names a branch), and loads again when they switch branch
  in the sidebar. It is off by default and not there with every branch or none; the bell and the unread count never
  follow the branch.
- **My profile.** Its plugin `profile-sections.ts` adds **Notifications** to My profile (core's `kit:profile:sections`,
  order 60, after the appearance): each category with a choice per channel (at once, daily summary, off) and what of it
  always arrives; once a category goes to the summary, the summary's hour and timezone (the workspace's unless the person
  picks one). The choices are changes of the page, like the person's details: `useMyPreferences` tracks each in the
  page's change set (the card's dot, the review of changes, the leave guard) and hands My profile's saver an entry, so
  the page's action bar saves them with `PUT /me/notification-preferences`, sending only the choices that changed and the
  summary's hour and timezone together when either changed. A refusal is toasted and the choices stay.
- **The preference center.** `/notifications/preferences` (public, `auth` layout, drawn by the browser and kept out of
  search engines) is what an email's "Manage your notifications" opens. It reads the token from the link's fragment with
  core's `takeLinkFragment`, which takes the fragment off the address at once, sends it only in `X-Notification-Token`,
  and asks the browser to send no `Referer`. It is written for someone who just clicked a link in an email: the title
  names the workspace ("Your emails from Demo", with its logo above on its host; the auth screens' header keeps the
  platform's name), and the line under it says whose emails these are and to which masked address ("You're getting emails
  from Demo at o***@demo.test. Choose which ones you want."). Each category the recipient may turn off by email is a row:
  its label, a line on what it covers, and a switch labelled "Email me about this". The API sends no description, so the
  line is the page's own, by the category's slug (`notifications.center.categories.<slug>`), and "Emails about {label}."
  for a category the page does not know. What always arrives is a section of its own, **Always sent**, with why ("Needed to
  use your account") and a list of its labels. **Save my choices** is enabled once a switch changes, its tooltip saying
  what it needs, and a line under it says where things stand: nothing changed yet, changes not saved, or "Saved. Changes
  apply to the next email." (no toast). When the recipient is a member (the API masks a member's address and sends
  `recipient: null` for any other), a last line says "For more options (in-app notifications, daily summary), sign in to
  your profile.", the second half a text `KitButton` to the workspace's sign-in with `?redirect=` to My profile
  (`KIT_ROUTES.login` and `KIT_ROUTES.profile`). A missing link and every link the API
  does not take (`notifications.link_invalid`, on loading or on saving) are the same neutral "This link no longer works",
  in the page's own words; any other failure offers to try again.
- **The delivery log.** `/dashboard/notifications/deliveries` (`notification_settings.view`; the menu does not list it)
  shows the log in mood-ui's `Table`: when, the subject (or the event), to whom (masked), the channel, the status in its
  color with the reason under it, and **Send it again** on a row that allows it (`canResend`). The address's query filters
  it (`subjectType` with `subjectId`, `eventType`, `status`), the status from the page's toolbar too, and a pager
  loads older rows. In Settings → Notifications, the section links to it, and a channel that reaches members only (the
  inbox) offers no other addresses.
- While a super admin of the platform acts as a member (core's `useImpersonationGate()`), what the API refuses then stays in
  view and off: the audiences are read-only with a line that says so, the template editor opens to read, Send it again,
  Mark all as read and each item's read or unread are disabled with their tooltip ("Off while impersonating"), opening an
  item marks nothing, and My profile's notification choices are read-only.
