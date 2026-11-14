# Add a notification event type

A module that wants to notify a workspace declares an **event type**: what happened, which values its message may use,
who it can go to, and its default words in every language. The workspace then chooses, in Settings → Notifications,
whether it sends, to whom and with what words.

## 1. Declare it

```php
final readonly class InvoicesNotifications implements EventTypeProvider
{
    public function eventTypes(): array
    {
        return [
            new EventType(
                slug: 'invoices.paid',
                module: 'invoices',
                moduleLabelKey: 'invoices::notifications.module',
                labelKey: 'invoices::notifications.paid.label',
                descriptionKey: 'invoices::notifications.paid.description',
                templateKey: 'invoices::notification_templates.paid',
                variables: [
                    Variable::under('invoices::notifications.variables', 'customer.name'),
                    Variable::under('invoices::notifications.variables', 'invoice.paid_at', VariableKind::Date),
                    Variable::button('invoices::notifications.variables'),
                ],
                systemAudiences: [new SystemAudience('customer', 'invoices::notifications.audiences.customer')],
                defaultAudiences: ['system:customer', 'role:owner'],
                presentation: new Presentation(Accent::Success, 'invoices::notifications.badge', 'invoices::notifications.view', 'action.url'),
            ),
        ];
    }
}

// In the module's service provider:
$this->app->tag([InvoicesNotifications::class], 'notifications.event_types');
```

- `slug` is `<module>.<event>`, snake case. Variables are dotted snake case (`customer.name`); a `Date` is sent in ISO 8601
  and written in the recipient's language and the workspace's timezone; a `Lines` variable takes a list of texts (a
  paragraph that is that variable alone becomes a paragraph per line; inside a sentence they are joined with ` · `); only
  a `Url` variable can be a button.
- `Variable::under($keys, $name)` takes its label and sample from `<keys>.<name with _ for .>.label` and `.sample`
  (`invoices::notifications.variables.customer_name.label`); `Variable::button($keys)` is `action.url`, the `Url` the
  button opens. `new Variable($name, $labelKey, $sampleKey, $kind)` takes any keys.
- `defaultAudiences` is what a workspace starts with: `role:<slug of a role template>` (`owner`, `manager`, `member`, or a
  module's) and `system:<one of its system audiences>`.
- `channels`: `email` (the default) and `in_app` (the inbox, see
  [Show a notification in the app](show-a-notification-in-the-app.md)).
- `allowsOptOut`: whether a person may turn it off or keep it for their daily summary (Preferences): leave it false for
  what must always arrive (security, billing).
- `personal: true` for a notice about the one person it names: it goes only to its system audiences, never to a role or
  other addresses, whatever the workspace chooses.
- `countsTowardsQuota: false` for a notice the workspace must get even over its email quota. Only its sends to a role or
  a system audience are exempt: to other addresses (`extra`), and every resend, it counts like any send.

Every label and sample key needs a line in each language of `support.locales`.

## 2. Write its default template in every language

`<templateKey>.subject` and `<templateKey>.body` in every `lang/<locale>/` of the module: plain text, a blank line between
paragraphs, `{{ name }}` for a variable. No Markdown and no HTML: everything is escaped; links go through the button.

```php
// lang/en/notification_templates.php
return ['paid' => [
    'subject' => '{{ customer.name }} paid',
    'body' => "{{ customer.name }} paid on {{ invoice.paid_at }}.\n\nThe invoice is now closed.",
]];
```

The registry checks it all the first time it is read: a template missing in a language, or using a variable the event
does not declare, fails with the event and the key.

## 3. Write it to the database

Run `php artisan notifications:sync` (the deploy script does). It writes the event type and gives every workspace its
default audiences once. Then [send it](send-a-notification.md).
