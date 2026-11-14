# Reverb (realtime)

The notification inbox updates live through Laravel Reverb. With `BROADCAST_CONNECTION=null` realtime is off and the frontend asks for the unread count every minute instead. The reference is [Realtime (Reverb)](/kit/configuration/realtime).

## Local

`.env.example` turns it on with development keys. Run the server beside the others:

```bash
cd backend
php artisan reverb:start
```

Without it the frontend falls back to polling, and the queued publish fails after its timeout.

## Production

1. Make three new values for `REVERB_APP_ID`, `REVERB_APP_KEY` and `REVERB_APP_SECRET`, and set `BROADCAST_CONNECTION=reverb`.
2. Run `php artisan reverb:start` as a long-running process under a supervisor, restarted on deploy with `php artisan reverb:restart`.
3. Put it behind your proxy over TLS on a host such as `ws.example.com`, forwarding to port 8080 with the `Upgrade` and `Connection` headers. Set `REVERB_PUBLIC_HOST`, `REVERB_PUBLIC_PORT=443`, `REVERB_PUBLIC_SCHEME=https` and `NUXT_SECURITY_REALTIME_URL=wss://ws.example.com`.
4. Set `REVERB_ALLOWED_ORIGINS=example.com,*.example.com`. Never `*` alone.
5. Turn on Reverb's rate limiting: `REVERB_APP_RATE_LIMITING_ENABLED=true` and `REVERB_APP_RATE_LIMIT_TERMINATE=true`.
6. A queue worker must run: it publishes the changes.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
