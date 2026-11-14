# Redis and the queue

Redis holds the cache, the queue and the scheduler's locks. A queue worker sends the emails, builds new workspaces after signup, runs client imports and publishes realtime changes. The reference is [Queues and the scheduler](/kit/configuration/queues-and-scheduler).

## Local

Docker Compose starts Redis. `.env.example` already points the app at it:

```dotenv
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CACHE_STORE=redis
QUEUE_CONNECTION=redis
```

Run a worker in its own terminal. Without it no email goes out and no new workspace is built:

```bash
cd backend
php artisan queue:work
```

The worker needs the `pcntl` and `posix` PHP extensions to stop a job that outlives its timeout. The kit does not ship Laravel Horizon.

## Production

- Use a persistent Redis shared by every server. Set `REDIS_HOST`, `REDIS_PORT` and `REDIS_PASSWORD` (or `REDIS_URL`).
- Run one or more `php artisan queue:work` processes under a supervisor, and restart them on every deploy with `php artisan queue:restart`.
- Give the worker the same `memory_limit` as the web server, `128M` at least: the largest client import takes about 55 MB above what the app itself uses.
- Every job's timeout must stay below `retry_after` (`REDIS_QUEUE_RETRY_AFTER`, 90 seconds by default). Raise both together.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
