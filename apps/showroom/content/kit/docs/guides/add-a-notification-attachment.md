# Add a notification attachment

An attachment is a file a workspace may add to an event's emails, audience by audience (the owner gets the invoice PDF,
the customer does not). The module that knows how to make the file provides it.

```php
use MoodKit\Notifications\Contracts\AttachmentProvider;
use MoodKit\Notifications\Contracts\NotificationAttachment;

final readonly class InvoicePdfAttachment implements AttachmentProvider
{
    public function __construct(private InvoicePdfs $pdfs) {}

    public function slug(): string
    {
        return 'invoice_pdf';
    }

    public function labelKey(): string
    {
        return 'invoices::notifications.attachments.invoice_pdf';
    }

    public function build(string $tenantId, array $context, string $locale): ?NotificationAttachment
    {
        $pdf = $this->pdfs->find($context['invoiceId'] ?? '', $locale);

        return $pdf === null ? null : new NotificationAttachment("invoice-{$pdf->number}.pdf", 'application/pdf', $pdf->bytes);
    }
}

// In the module's service provider:
$this->app->tag([InvoicePdfAttachment::class], 'notifications.attachments');
```

1. List its slug in the event type's `attachments`.
2. Put the ids it needs in the `context` of the `NotificationRequested` ([Send a notification](send-a-notification.md)).
3. The workspace turns it on for an audience in Settings → Notifications.

It is built when the email is sent (a resend builds it again), as the workspace, in the recipient's language: it must not
read anything the workspace cannot see, and must be quick, since it runs inside the send job. Return `null` when there
is nothing to attach. A provider that returns null or throws leaves the email without that file, and the log says so: the
email still goes.
