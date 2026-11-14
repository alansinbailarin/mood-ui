# Realtime (Reverb)

The inbox (the bell, the notifications page) shows a new notification the moment it arrives through
[Laravel Reverb](https://reverb.laravel.com), the websocket server that runs with the app. Without it the kit works the same,
and the browser asks for the unread count every minute (`notifications.inbox_poll_seconds`).

## What you set

| Variable | |
| -------- | - |
| `BROADCAST_CONNECTION` | `reverb` to turn realtime on, `null` to turn it off |
| `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` | the app's id, public key and secret. Make them yourself: any long random strings (`openssl rand -hex 20`). The secret signs every channel sign-in: never share it |
| `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` | where the app publishes to Reverb |
| `REVERB_CLIENT_TIMEOUT`, `REVERB_CLIENT_CONNECT_TIMEOUT` | seconds the app waits for Reverb to answer and to connect when it publishes (2 each) |
| `REVERB_PUBLIC_HOST`, `REVERB_PUBLIC_PORT`, `REVERB_PUBLIC_SCHEME` | where the browser reaches Reverb, when it is not the above (a proxy in front, wss on 443). Empty: the same |
| `REVERB_SERVER_HOST`, `REVERB_SERVER_PORT` | where `reverb:start` listens (`0.0.0.0:8080`) |
| `REVERB_ALLOWED_ORIGINS` | the frontend's hosts, comma separated, `*` a wildcard: `example.com,*.example.com` for the root domain and every workspace (`*` in development) |
| `REVERB_APP_RATE_LIMITING_ENABLED`, `REVERB_APP_RATE_LIMIT_MAX_ATTEMPTS`, `REVERB_APP_RATE_LIMIT_DECAY_SECONDS`, `REVERB_APP_RATE_LIMIT_TERMINATE` | Reverb's own limit on the messages one connection sends (off by default) |
| `NUXT_SECURITY_REALTIME_URL` | the websocket's address for the pages' Content Security Policy (`wss://ws.example.com`) |

With `BROADCAST_CONNECTION=reverb` and any of `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` or `REVERB_HOST`
empty, the app does not start: the error names the variable. The frontend never has a key of its own: `GET /me` hands it
the public key, the address and the person's channel (`inbox.realtime`), so the two sides cannot disagree.

The app publishes a change from the queue (`InboxChanged` is queued after the commit): the queue worker talks to Reverb,
never a request, so a write to the inbox answers at once even when Reverb is down or hangs. A Reverb that does not answer
holds the worker for `REVERB_CLIENT_TIMEOUT` seconds at most, and the job fails; the browser sees the change on its next
poll. Run a queue worker wherever realtime is on.

The browser signs into a person's channel through the API (`POST /api/v1/realtime/auth`), never Laravel's
`/broadcasting/auth`: see [Notifications](../packages/notifications.md#the-inbox).

## In development

`.env.example` turns it on with local keys. Run the server beside the others, in `backend/`:

```bash
php artisan reverb:start
```

Without it the frontend falls back to asking every minute, and the queued publish fails after its timeout (with the
`sync` queue, the backend logs a warning instead).

## In production

1. Make the three keys and set them, with `BROADCAST_CONNECTION=reverb`.
2. Run `php artisan reverb:start` as a long-running process (a container or a supervisor program, like the queue worker),
   on the release's code, restarted on deploy (`php artisan reverb:restart`).
3. Put it behind your proxy over TLS: a host such as `ws.example.com` that forwards to port 8080 with the `Upgrade` and
   `Connection` headers. Set `REVERB_PUBLIC_HOST=ws.example.com`, `REVERB_PUBLIC_PORT=443`, `REVERB_PUBLIC_SCHEME=https`,
   and `NUXT_SECURITY_REALTIME_URL=wss://ws.example.com`.
4. Set `REVERB_ALLOWED_ORIGINS` to your root domain and its workspaces, `example.com,*.example.com` (Reverb compares the
   host of the page's origin with each, `*` a wildcard), never `*` alone: it is how Reverb refuses a page of another site.
5. Turn on Reverb's own rate limiting, which the app's limiters do not cover: they see `POST /realtime/auth`, not the
   socket. A browser of the kit subscribes to one channel and pings about once a minute, so
   `REVERB_APP_RATE_LIMITING_ENABLED=true` with the defaults, 60 messages a connection per 60 seconds, leaves it plenty;
   set `REVERB_APP_RATE_LIMIT_TERMINATE=true` so a connection over the limit is closed rather than only told. Bound the
   connections too with `REVERB_APP_MAX_CONNECTIONS` if your server is small.
6. More than one Reverb server: `REVERB_SCALING_ENABLED=true`, with Redis.

A minimal nginx block:

```nginx
location / {
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass http://127.0.0.1:8080;
}
```

## When something is off

| Symptom | Cause |
| ------- | ----- |
| The app does not start: "BROADCAST_CONNECTION is reverb but REVERB_... is empty" | set that variable, or `BROADCAST_CONNECTION=null` |
| The bell changes only every minute | the browser could not connect: check `REVERB_PUBLIC_*`, the proxy's `Upgrade` headers, `REVERB_ALLOWED_ORIGINS` and `NUXT_SECURITY_REALTIME_URL` (the browser's console names a Content Security Policy refusal) |
| Failed `BroadcastEvent` jobs, or "Could not publish an inbox change" in the logs | the worker cannot reach `REVERB_HOST:REVERB_PORT`, or the change could not be queued; the notification is in the inbox all the same |
