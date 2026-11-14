# Scheduler and cron

The scheduler runs the periodic tasks the packages register: expiring unconfirmed signups, ending trials, sending digests and pruning old rows. Each task takes a cache lock, so several servers running it do not run a task twice, but you should still run exactly one scheduler. The reference is [Queues and the scheduler](/kit/configuration/queues-and-scheduler#the-scheduler).

## Local

In its own terminal:

```bash
cd backend
php artisan schedule:work
```

## Production

Run it one of two ways, and only one of them on the whole install:

- a cron entry that runs `php artisan schedule:run` every minute:

```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

- or a single long-running `php artisan schedule:work` process under a supervisor.

Redis holds the locks, so it must be shared and persistent if you run more than one server.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
