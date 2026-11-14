# Add a digest contributor

A member who chooses the daily summary gets one email a day with what their notifications said and what your module
adds. A contributor gives a few lines about the period, in the person's language.

## 1. Write it

```php
use MoodKit\Notifications\Contracts\DigestContributor;
use MoodKit\Notifications\Contracts\DigestPeriod;

final readonly class BookingsSummary implements DigestContributor
{
    public function slug(): string
    {
        return 'bookings';
    }

    public function order(): int
    {
        return 10; // before the kernel's list of kept notifications (100)
    }

    public function lines(string $tenantId, string $userId, DigestPeriod $period, string $locale): array
    {
        $count = Booking::query()->where('tenant_id', $tenantId)
            ->where('created_at', '>', $period->from)->where('created_at', '<=', $period->to)->count();

        return $count === 0 ? [] : [trans_choice('bookings::digest.booked', $count, ['count' => $count], $locale)];
    }
}
```

It runs as the workspace, once per person and summary, so filter by the workspace (and by the person, when the lines are
theirs: the summary goes to them alone). Times in `$period` are UTC, from the end of their last summary (excluded) to now;
show them in `$period->timezone`. Return plain text: no Markdown, no HTML, no links (the summary's button opens the
inbox). Only read: it is asked inside the transaction that writes the summary.

## 2. Tag it

In your package's service provider:

```php
$this->app->tag([BookingsSummary::class], 'notifications.digest_contributors');
```

Two contributors with one slug fail when the registry is built. A contributor that throws is reported and left out; a
summary with no line from anyone is not sent. See [Notifications](../packages/notifications.md#digests).
