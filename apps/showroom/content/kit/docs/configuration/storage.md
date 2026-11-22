# Storage

Files people upload (a workspace's logo, for now) live in an S3 bucket. The kit writes, links and deletes them through
one class, `MoodKit\Support\Storage\AssetDisk`, on the disk `ASSETS_DISK` names (`assets` by default, the `assets`
disk of `backend/config/filesystems.php`). Locally that disk is MinIO, in Docker; in production it is Cloudflare R2.
Both speak the S3 API, so the code is the same.

The `assets` disk streams its reads (`stream_reads`): reading the first bytes of a file downloads only those, never the
whole object. Keep it on if you point `ASSETS_DISK` at a disk of your own.

The disk has keys of its own, the `ASSETS_*` variables, never the `AWS_*` ones: those are Laravel's `s3` disk and the
SES mailer's. So the token that writes the bucket can send no email, and the mailer's keys can touch no file.

Files are public: anyone with the address can load them, which is what a logo and an avatar need. The bucket's own
policy makes them public, never a per-file ACL (R2 has none). Every file gets a new, random key
(`tenants/<workspace>/<area>/<uuid>.<ext>`, or `users/<person>/<area>/<uuid>.<ext>` for a person's avatar), so a file
never changes once written, and it is served with `Cache-Control: public, max-age=31536000, immutable`.

## Locally: MinIO

`docker compose up -d --wait` starts MinIO with the user and password of `ASSETS_ACCESS_KEY_ID` and
`ASSETS_SECRET_ACCESS_KEY`. Its S3 API is on `127.0.0.1:9000` (`MINIO_PORT`) and its console at http://localhost:9001
(`MINIO_CONSOLE_PORT`). Create the bucket once:

    cd backend && php artisan assets:prepare-bucket

It creates `ASSETS_BUCKET` if it is missing and gives it a policy that lets anyone read the files under `tenants/` and
`users/`, and nothing in `uploads/` (see below). Running it again only sets the policy again. It refuses to run in
production.

The tests use their own bucket, `<ASSETS_BUCKET>-test`, and create it themselves; CI starts a MinIO of its own.

MinIO stopped publishing community images in late 2025 and took the published ones off Docker Hub and Quay.
`docker-compose.yml` and CI run `bitnamilegacy/minio:2025.7.23-debian-12-r5`, pinned by its digest, Bitnami's last
build of the community server, from its frozen legacy archive. It is for development and CI only: production uses R2.

## In production: Cloudflare R2

1. In the Cloudflare dashboard, create a bucket (R2 → Create bucket).
2. Give it a public address: either its `r2.dev` subdomain (Settings → Public access) or, better, a custom domain of
   yours (`assets.example.com`). That address is `ASSETS_URL`. With uploads straight to the bucket on
   (`SETTINGS_LOGO_PRESIGN=true`) a custom domain is required and `r2.dev` must stay off: see
   [Keep `uploads/` from being served](#keep-uploads-from-being-served).
3. Create an API token with "Object Read & Write" on that bucket only. Its access key and secret are
   `ASSETS_ACCESS_KEY_ID` and `ASSETS_SECRET_ACCESS_KEY`.
4. Set:

       ASSETS_DISK=assets
       ASSETS_ACCESS_KEY_ID=<token access key>
       ASSETS_SECRET_ACCESS_KEY=<token secret>
       ASSETS_REGION=auto
       ASSETS_BUCKET=<bucket name>
       ASSETS_ENDPOINT=https://<account id>.r2.cloudflarestorage.com
       ASSETS_URL=https://assets.example.com
       ASSETS_USE_PATH_STYLE_ENDPOINT=false

   `false` is the value of `deploy/.env.example` and the one the kit's public demo runs on R2. (`true` is for MinIO locally.)

5. If you turn on uploads straight to the bucket, use a custom domain with `r2.dev` off, and add the lifecycle rule
   and the block on `uploads/`, as described below.

Do not run `assets:prepare-bucket` in production; it refuses to.

To check the bucket before the app uses it, write, read through the custom domain and delete a file with `curl`. First put the
values of step 4 in the shell (`read -rs SECRET` keeps the secret off the screen and out of the history). The answers are `200`,
`200` and `204`:

```bash
ASSETS_ENDPOINT=https://<account id>.r2.cloudflarestorage.com
ASSETS_BUCKET=<bucket name>
ASSETS_URL=https://assets.example.com
read -r ID
read -rs SECRET
curl -s -o /dev/null -w "%{http_code}\n" --aws-sigv4 "aws:amz:auto:s3" --user "$ID:$SECRET" -X PUT --data "ok" "$ASSETS_ENDPOINT/$ASSETS_BUCKET/healthcheck/x.txt"
curl -s -o /dev/null -w "%{http_code}\n" "$ASSETS_URL/healthcheck/x.txt"
curl -s -o /dev/null -w "%{http_code}\n" --aws-sigv4 "aws:amz:auto:s3" --user "$ID:$SECRET" -X DELETE "$ASSETS_ENDPOINT/$ASSETS_BUCKET/healthcheck/x.txt"
```

The whole path to a server is in [Deploy to a VPS](../guides/deploy-to-a-vps.md#7-set-up-file-storage-r2).

## Uploads straight to the bucket (presign)

By default the browser sends a file to the API and the API writes it to the bucket, so the bucket needs no CORS. With
`SETTINGS_LOGO_PRESIGN=true` the browser asks the API for a short-lived upload address, PUTs the file straight to the
bucket and asks the API to confirm it. This takes the upload off your API servers, and needs CORS on the bucket for the
origins of your workspaces. See [Settings](../packages/settings.md#uploading-straight-to-the-bucket) for the endpoints.

The public page's images work the same way with `PUBLIC_PAGE_MEDIA_PRESIGN=true`: the same CORS, the same `uploads/` area and the
same lifecycle rule. See [PublicPage](../packages/public-page.md#images) for the endpoints.

S3 cannot sign the type, the size or the cache headers of such an upload, and the address works until it expires, so
the browser uploads to `uploads/<workspace>/<uuid>`, a key no file is served from. The API reads the upload, checks it
(its key, size and real type), writes the bytes it checked to the workspace's own key with their real type and cache
headers, and deletes the upload. A refused upload is deleted too.

R2 (bucket → Settings → CORS policy):

    [
      {
        "AllowedOrigins": ["https://*.example.com"],
        "AllowedMethods": ["PUT"],
        "AllowedHeaders": ["Content-Type"],
        "MaxAgeSeconds": 3600
      }
    ]

Check in Cloudflare's documentation that your origins are written as it accepts them (a wildcard subdomain, or each
origin listed). Locally MinIO answers CORS for any origin, so nothing is needed.

### Unconfirmed uploads

An upload never confirmed stays in `uploads/`. Delete it with a lifecycle rule on that prefix, which holds nothing
else: R2 (bucket → Settings → Object lifecycle rules) → Add rule, prefix `uploads/`, delete objects 1 day after they
were uploaded. Confirmed files live under `tenants/` and `users/`, which the rule never touches.

### Keep `uploads/` from being served

Nothing in `uploads/` is checked yet, and whoever uploads chooses its type, so it must not be readable at the public
address. Locally `assets:prepare-bucket` makes only `tenants/` and `users/` public. R2's public access covers the whole
bucket, and a WAF rule applies only to a domain of your Cloudflare zone, never to `r2.dev`. So with
`SETTINGS_LOGO_PRESIGN=true` or `PUBLIC_PAGE_MEDIA_PRESIGN=true`:

1. Serve the bucket from a custom domain only, and turn its `r2.dev` address off (bucket → Settings → Public access →
   R2.dev subdomain → Disallow access). `ASSETS_URL` is the custom domain.
2. On that domain add a rule that blocks the path: Security → WAF → Custom rules, `URI Path starts with "/uploads/"`,
   action Block. The API reads uploads with its keys, never through the public address, so the block costs nothing.

With both presigns off, nothing is ever written to `uploads/`, and `r2.dev` is fine.
