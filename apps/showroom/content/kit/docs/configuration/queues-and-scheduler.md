# Queues and the scheduler

Besides the web server, the API needs two long-running processes: a **queue worker**, which runs the jobs
the app queues, and the **scheduler**, which runs the periodic commands. Without the worker no email is sent
and no signup becomes a workspace.

## The queue

The queue runs on Redis (`QUEUE_CONNECTION=redis`), on the `default` queue.

| Job | Queued by | Does |
| --- | --------- | ---- |
| `MoodKit\Auth\Jobs\DeliverPasswordResetLink` | `POST /auth/forgot-password` | looks the email up, makes the reset token and sends the email. 3 tries. |
| `MoodKit\Signup\Mail\SignupVerificationMail` | starting a signup, a resend | sends the verification email. Queued encrypted. |
| `MoodKit\Signup\Jobs\ProvisionWorkspaceJob` | confirming a signup, `signup:prune` | builds the workspace. 3 tries, 5 and 30 seconds apart; unique per signup. |
| `MoodKit\Settings\Jobs\DeleteLogoObject` | replacing or removing a workspace's logo, once the change commits | deletes the old logo's file and row. 5 tries, from 10 seconds to 5 minutes apart. |
| `MoodKit\Clients\Jobs\ProcessClientImport` | running an import (`POST /clients/imports/{import}/run`), once it commits | imports one part of a CSV of clients (`clients.import.chunk`, 200 rows), as the person who ran it, then queues the next part once it commits. 1 try per part, each stopped after `clients.import.timeout_seconds` (80; a part takes a second or two); an import whose job fails or is stopped ends failed, and one whose job was lost is ended by `clients:prune-imports`. Without a worker, an import never runs. |
| `MoodKit\Clients\Portal\Jobs\DeliverPortalCode` | asking for a sign-in code of the client portal (`POST /portal/code`) | looks the email up among the workspace's live clients, makes the code and sends the email, from the same run (the code is never queued). Queued encrypted, since it holds the email. 3 tries, 10 and 60 seconds apart (a failed run keeps no code; a retry makes a new one). Without a worker, no client can sign in to the portal. |
| `MoodKit\Notifications\Listeners\QueueNotificationDeliveries` | `NotificationRequested`, sent by a module after its commit | decides who gets a notification, reserves each send in the delivery log and queues it. 3 tries, 10 and 60 seconds apart; a retry never sends twice. |
| `MoodKit\Notifications\Jobs\SendDelivery` | the listener above, a resend | sends one reserved notification and marks it sent. `notifications.send_tries` tries (3), `notifications.send_backoff_seconds` apart (60 and 300 seconds); then the delivery is recorded as failed. One run per delivery at a time, each stopped after `notifications.send_timeout_seconds` (60). |

A job queued inside a database transaction is sent once the transaction commits, and never if it rolls back: every
connection in `config/queue.php` has `after_commit` on, so a worker never runs on rows it cannot see yet. A job that
must go at once whatever happens to the transaction calls `->beforeCommit()`.

Jobs carry their workspace with them, and the worker applies it before running a job (see
[Multi-tenancy](../concepts/multi-tenancy.md#code-that-runs-outside-a-request)).

Run a worker locally with:

```bash
cd backend
php artisan queue:work
```

The kit does not ship Laravel Horizon; its docs and defaults use `queue:work`. Give the worker the `pcntl`
and `posix` PHP extensions: without them `queue:work` cannot stop a job that outlives its timeout, and a stop
signal does not let the current job finish first. Keep its `memory_limit` at PHP's default `128M` or more: the import of
the largest CSV of clients takes about 55 MB above what the app itself takes, in each of its parts (see
[Production](production.md)).

**Timeouts and `retry_after`.** A connection hands a job that has run for `retry_after` seconds (90 by default:
`REDIS_QUEUE_RETRY_AFTER`, `DB_QUEUE_RETRY_AFTER`) to another worker, as if the first had died. Every job's timeout must
stay below it, or two workers run it at once: `SendDelivery` stops after `notifications.send_timeout_seconds` (60), and
`ProcessClientImport` after `clients.import.timeout_seconds` (80) for each part of an import (a job per part, so a large file
never needs a longer timeout). If you raise one, raise the other.

With the `database` queue driver on the app's own connection and a failed-job driver that is not the database
(`QUEUE_FAILED_DRIVER`), a part of an import that times out inside its transaction takes the deletion of its job row
down with it: the job shows up once more after `retry_after`, past its tries, and is failed again. It is harmless (the import
ended the first time; the second is one more failed-job entry). To avoid it, point `DB_QUEUE_CONNECTION` at a connection of
its own (a second entry in `config/database.php`); Redis, the default, never does it.

## The scheduler

Packages add their tasks from their service providers. Each runs `onOneServer()`, which takes a lock in the
cache, so several servers running the scheduler do not run a task twice.

| Command | When | Does |
| ------- | ---- | ---- |
| `signup:prune` | every minute | expires unconfirmed signups, queues again a confirmed one whose job was lost, fails one stuck for 15 minutes, deletes old ones |
| `auth:warm-dummy-hash` | hourly | keeps the dummy hash that unknown-email logins are checked against in the cache |
| `auth:prune-tokens` | daily | deletes login tokens that expired more than 24 hours ago, in every workspace |
| `plans:end-grants` | every fifteen minutes, never overlapping | moves every workspace whose plan from the platform has reached its end back to the default plan, as its workspace, telling the owner what is over its limits |
| `plans:end-trials` | hourly, never overlapping | makes every trial that ended active, with a monthly period, as its workspace; leaves alone a subscription Stripe moves |
| `plans:trial-reminders` | daily at 09:00 UTC, never overlapping | sends `TrialEndingSoon` once per threshold of `plans.trial_reminder_days` (3 and 1 days) for every trial about to end; leaves alone a subscription Stripe moves |
| `notifications:fail-stale` | every ten minutes, never overlapping | marks failed (`stale`) every notification delivery still pending or sending after `notifications.stale_after_minutes` (60): its job was lost or its worker died mid-send. It never sends one again. |
| `notifications:send-digests` | every hour, on one server, never overlapping | sends each member who chose a daily summary their summary when it is their hour in their timezone (or the workspace's): once per person and local day, never empty; when the workspace turned the summary off, sends what was kept for it one by one |
| `notifications:prune` | daily at 03:30 UTC, never overlapping | drops, workspace by workspace, the notification deliveries older than `notifications.deliveries_keep_days` (180) with their resends, once the newest resend is that old too, the inbox items read more than `inbox_read_keep_days` (30) ago and any older than `inbox_keep_days` (90) |
| `clients:prune-imports` | daily at 03:40 UTC, never overlapping | in every workspace (deleted ones too), as the workspace: ends as failed an import of clients queued or running with no progress for `clients.import.stuck_after_minutes` (60), whose job was lost; forgets, with their files and errors, the uploads never run after `clients.import.upload_ttl_hours` (24), the imports that ended more than `clients.import.retention_days` (30) ago and those whose uploader left; deletes the file an ended import could not. Each import is held and looked at again before it is touched. An import or a workspace that fails is reported and the rest go on |
| `clients:prune-imports --stuck` | every fifteen minutes, on one server, never overlapping | only ends as failed, as above, the imports of clients whose job was lost. An import that waited queued for longer behind a queue that fell behind is failed too, and its job does nothing when it comes |
| `clients:prune-portal` | daily at 03:50 UTC, on one server, never overlapping | in every workspace (deleted ones too), as the workspace: forgets the client portal's sign-in codes past their time and its sessions past their life (`clients.portal.session_minutes`) or unused longer than `clients.portal.idle_minutes`: no request can use them any more. A workspace that fails is reported and the rest go on |
| `platform:delete-closed-workspaces` | daily at 04:10 UTC, never overlapping | deletes (soft: their rows stay, their slug stays taken) the workspaces an admin closed whose grace (`platform.deletion_grace_days`, 30) is over, each as itself and written to both trails; one that fails is reported and the others go on. Needs `DB_PLATFORM_USERNAME`: it finds them with a platform read |
| `platform:prune-sessions` | daily, on one server | deletes the admin host's sessions that ended, past their life (`PLATFORM_SESSION_MINUTES`) or unused longer than `PLATFORM_IDLE_MINUTES`: no request can use them any more |

Locally, run it in the foreground:

```bash
cd backend
php artisan schedule:work
```

List the tasks with `php artisan schedule:list` (it needs Redis running).

## In production

Keep one or more workers and exactly one scheduler entry running, under a process supervisor that restarts
them.

**Worker.** Run `php artisan queue:work` under your platform's process manager: a Supervisor program, a
systemd service, or a worker process or container on your host. For example, with Supervisor:

```ini
[program:mood-kit-worker]
command=php /var/www/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
numprocs=2
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stopwaitsecs=3600
```

A worker keeps the code it booted with. Restart workers on every deploy with `php artisan queue:restart`,
which tells each to exit after its current job; the supervisor starts them again.

**Scheduler.** Either a cron entry that runs the scheduler every minute:

```cron
* * * * * cd /var/www/backend && php artisan schedule:run >> /dev/null 2>&1
```

or one long-running `php artisan schedule:work` process under the supervisor. Not both.

## Requirements

- Redis must be persistent and shared by every server: the queue, the scheduler's locks, the dummy password
  hash and the signup email counters all live there.
- Failed jobs are stored in the database (`failed_jobs`). List them with `php artisan queue:failed` and retry
  one with `php artisan queue:retry <id>`.

## Related

- [Mail](mail.md)
- [Signup](../packages/signup.md#commands-and-schedule)
- [Production checklist](production.md)
