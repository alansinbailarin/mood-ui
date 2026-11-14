# Send a notification

Once your event type is declared ([guide](add-a-notification-event-type.md)), ask for it with `NotificationRequested`
where the thing happens. Send it from inside your transaction: it waits for the commit, and nothing is sent for work
that rolled back.

```php
use MoodKit\Notifications\Contracts\Recipient;
use MoodKit\Notifications\Events\NotificationRequested;

event(new NotificationRequested(
    tenantId: $tenantId,
    eventType: 'invoices.paid',
    eventKey: "invoices.paid:{$invoice->id}",
    variables: [
        'customer.name' => $invoice->customer_name,
        'invoice.paid_at' => $invoice->paid_at->toIso8601ZuluString(),
        'action.url' => $workspaceUrl->to($slug, "/dashboard/invoices/{$invoice->id}"),
    ],
    audiences: ['customer' => [Recipient::address($invoice->customer_email, $invoice->customer_name)]],
    context: ['invoiceId' => $invoice->id],
    subjectType: 'invoice',
    subjectId: $invoice->id,
));
```

- `eventKey` names this one notification: an address gets one send per key and channel, however often it is asked for.
  Put in it what makes the occurrence unique (an id, a date for something that can happen again). It has 1 to 190
  characters.
- A value can be one string, or one per language (`['en' => 'Owner', 'es' => 'Propietario']`). A date is ISO 8601. A
  `lines` variable takes a list of strings.
- `audiences` says who each of the type's system audiences is: `Recipient::member($userId)` for a member (written to in
  their language, while their membership is active) or `Recipient::address(...)`. Role audiences and other addresses come
  from the workspace's settings.
- `context` carries the ids your attachments need; `subjectType` and `subjectId` are what the delivery history is about.
- `timezone` writes the dates in that timezone instead of the workspace's, for a notification about one person's day
  (the daily summary passes the person's own).

### From a listener, after the commit

When the notification follows an event of your own that is sent after the commit (`ShouldDispatchAfterCommit`), the
request that caused it has already succeeded: a failure to build the notice must not turn it into an error. Ask for it
through `SendsWorkspaceNotices`, which builds it as the workspace and reports a failure instead of throwing it. Team's
`NotifyMemberRemoved` does this:

```php
use MoodKit\Notifications\Contracts\Recipient;
use MoodKit\Notifications\Contracts\SendsWorkspaceNotices;
use MoodKit\Notifications\Events\NotificationRequested;
use MoodKit\Tenancy\Contracts\TenantSummary;

final readonly class NotifyMemberRemoved
{
    public function __construct(private SendsWorkspaceNotices $notices) {}

    public function handle(TeamMemberRemoved $event): void
    {
        $this->notices->send($event->tenantId, static fn (TenantSummary $tenant): NotificationRequested => new NotificationRequested(
            tenantId: $event->tenantId,
            eventType: 'team.member_removed',
            eventKey: "team.member_removed:{$event->userId}:".now()->format('YmdHisu'),
            variables: ['workspace.name' => $tenant->name, 'member.name' => $event->name],
            audiences: ['member' => [Recipient::address($event->email, $event->name, $event->locale)]],
        ));
    }
}
```

Register the listener in your provider's `boot()` (`$events->listen(TeamMemberRemoved::class, NotifyMemberRemoved::class)`).

Never send a notification email yourself, and never write `notification_deliveries`: what happens next is on the queue.
The workspace's settings, the plan's email quota and the suppression list decide, and every decision is a row of the
delivery log with its reason (see [Notifications](../packages/notifications.md#how-a-notification-is-sent)).

In a test, fake the mail and run what the listener would:

```php
Mail::fake();
Bus::fake([SendDelivery::class]);
resolve(DispatchNotification::class)->handle($event);
Bus::dispatched(SendDelivery::class)->each(fn (SendDelivery $job) => app()->call($job->handle(...)));
```
