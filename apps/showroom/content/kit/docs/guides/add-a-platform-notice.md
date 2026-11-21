# Add a platform notice

A **platform notice** is a line in the bell of the admin's top bar: something that happened on the platform that every super
admin may want to know, such as a workspace being made, a payment failing or, in your module, a ticket going to the
platform's attention. Each super admin has an inbox of their own (read or unread by admin), kept 60 days. It sends no email.
See [Platform](../packages/platform.md#the-admins-bell) for what the package does with them.

| Use | When |
| --- | ---- |
| a platform notice | the people who run the platform should see it in the admin, whatever workspace it came from |
| a [notification](send-a-notification.md) | someone in a workspace should hear of it (email, the workspace's own inbox) |

## 1. Declare the kind of notice

```php
use MoodKit\Platform\Contracts\PlatformNoticeProvider;
use MoodKit\Platform\Contracts\PlatformNoticeType;

final readonly class TicketsPlatformNotices implements PlatformNoticeProvider
{
    public function platformNotices(): array
    {
        return [
            new PlatformNoticeType(
                key: 'tickets.escalated',
                titleKey: 'tickets::platform.escalated.title',
                bodyKey: 'tickets::platform.escalated.body',
                icon: 'flag',
                accent: 'warning',
                route: '/platform/tickets/{ticketId}',
            ),
        ];
    }
}

// In the module's service provider:
$this->app->tag([TicketsPlatformNotices::class], 'platform.notices');
```

- `key` is `<package>.<what>`, lower case (letters, digits and `_`), unique across packages.
- `titleKey` and `bodyKey` are translation keys with a line in every language the kit speaks. A `:name` in a line is filled
  from the notice's data when the admin reads it, in the admin's language (`:ticket`, `:workspace`...).
- `icon` is a Heroicons outline name in kebab-case from core's `menuIcon` catalog (a question mark when it is not there).
- `accent` is `info`, `success`, `warning` or `danger`: the color of the line's badge.
- `route` is the admin's page the line opens: a path that starts with `/platform/`, with no `\` and no `//`. `{name}` is
  replaced by the notice's data of that name, URL-encoded. `null` makes a line that opens nothing.

- `resolver` (optional) is for a notice about a person. Never copy a name or an email into the notice's `data`: it would stay in
  `platform_notices` for 60 days for every admin, after the person was erased. Store the record's id, and name a class that
  implements `Contracts\ResolvesNoticeData`: its `resolve(array $data)` returns the placeholders (`:name`, `:email`) read from the
  record when the notice is read, or `null` when the record is gone. The line then is the type's `removed` message (next to its
  `body`, in every language: `waitlist_joined.removed`) and opens nothing. The kernel's `ResolvesWaitlistNotice` is the example.

`PlatformNoticeRegistry` refuses a malformed type (a key that is not `<package>.<what>`, one declared twice, an accent it does
not know, a route off the admin) with `InvalidNotice` the first time it is used.

## 2. Raise it

Send the event after the commit of what happened:

```php
use MoodKit\Platform\Events\PlatformNoticeRequested;

event(new PlatformNoticeRequested('tickets.escalated', key: $ticket->id, data: ['ticketId' => $ticket->id, 'workspace' => $tenant->name]));
```

- `key` is unique to the occurrence: the same type and key writes nothing twice, so a retried job is safe. Use the record's
  id, or `<id>:<moment>` when the same record can raise it again.
- `data` holds scalars only (strings, numbers, booleans, null), the values the title, the line and the route are made of.
  Put no more in it than the line says: it is kept in the platform's inbox for 60 days.
- Platform queues the event (`RaiseModuleNotice`, three tries) and writes one row per super admin who exists when it runs.
  A type nobody declared, a blank key, or data that is not scalar fails the job with `InvalidNotice`.

The event is sent after the commit (`ShouldDispatchAfterCommit`), so a rolled-back change never reaches the bell. Your module
depends on Platform for this; a package of the kernel raises its notices from listeners of its own events, as Platform does.

## 3. Test it

```php
event(new PlatformNoticeRequested('tickets.escalated', 'ticket-9', ['ticketId' => '9', 'workspace' => 'Acme']));

expect(PlatformNotice::query()->where('type', 'tickets.escalated')->count())->toBe($admins);
```

Check the title and the line in each language the way `PlatformNoticesTest` does for the kernel's, and that the route is a page
that exists.

## Check it

1. Sign in to the admin as a super admin, trigger what raises the notice, and open the bell: the line shows with its badge
   and opens its page. Within a minute it appears without a reload.
2. Another super admin has their own copy: marking yours read does not mark theirs.
3. `composer check` passes.
