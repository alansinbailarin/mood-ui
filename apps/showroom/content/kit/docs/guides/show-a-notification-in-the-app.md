# Show a notification in the app

A module's notification reaches the members it is for in their inbox (the bell and the notifications page) when its
event type goes through the `in_app` channel. Nothing else is needed: the same request, audiences, templates and
preferences as the email.

## 1. List the channel

In your `EventTypeProvider`:

```php
new EventType(
    slug: 'invoices.paid',
    // ...
    channels: ['email', 'in_app'],
    allowsOptOut: true, // a person may turn it off, or keep its email for their daily summary
);
```

Run `php artisan notifications:sync` after the deploy: each workspace gets the default audiences of the new channel
(`defaultAudiences`, the same as the email's), and the workspace can turn it on or off per event in Settings →
Notifications.

## 2. Name members

The inbox reaches members only. A role audience brings its members; a system audience brings who your event names with
`Recipient::member($userId)`. An address (`Recipient::address(...)`, other addresses) never has an inbox.

```php
event(new NotificationRequested($tenantId, 'invoices.paid', "invoices.paid:{$invoice->id}", [
    'invoice.number' => $invoice->number,
    'action.url' => $urls->to($slug, "/dashboard/invoices/{$invoice->id}"),
], ['customer_owner' => [Recipient::member($invoice->owner_id)]]));
```

Never write `notification_inbox` yourself: only the channel's sender does, once per delivery, and only it tells the
person's browser that something arrived.

## 3. Give it a button

The inbox item shows the template's subject as its title, its paragraphs, the badge and the button of the event type's
`Presentation`. The button opens `action.url`: give one that points at the record, in the workspace's address
(Tenancy's `WorkspaceUrl`), so a click from the bell lands where the notification is about.

## What the person sees

The bell counts what they have not read, live through Reverb ([Realtime](../configuration/realtime.md)) or every minute
without it. The dropdown shows the latest eight; the notifications page, everything, with "Mark all as read". Each person
chooses in My profile whether a category reaches their inbox. Items are pruned 30 days after they are read and after 90
days in any case.
