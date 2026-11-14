# Storage

Uploaded files, the workspace logos today, go to an S3-compatible bucket: MinIO locally, Cloudflare R2 in production. The `assets` disk has keys of its own, separate from the AWS ones the SES mailer uses. The reference is [Storage](/kit/configuration/storage).

## Local

MinIO runs in Docker Compose with public development keys. Create the bucket once:

```bash
cd backend
php artisan assets:prepare-bucket
```

`.env.example` already sets `ASSETS_ENDPOINT`, `ASSETS_BUCKET` and `ASSETS_URL` for MinIO. Its console is at http://localhost:9001.

## Production

1. Create an R2 bucket and an API token with read and write access to it.
2. Set `ASSETS_DISK=assets`, `ASSETS_ACCESS_KEY_ID`, `ASSETS_SECRET_ACCESS_KEY`, `ASSETS_BUCKET`, `ASSETS_ENDPOINT` (the R2 endpoint), `ASSETS_REGION=auto`, and `ASSETS_URL`, the bucket's public address.
3. Serve the bucket from a custom domain with `r2.dev` off.
4. With `SETTINGS_LOGO_PRESIGN=true` the browser uploads straight to the bucket, which then needs a CORS rule for your origins.
5. Tell the frontend where to look, or its Content Security Policy blocks the logos: `NUXT_SECURITY_ASSETS_URL` is `ASSETS_URL`, and `NUXT_SECURITY_ASSETS_UPLOAD_URL` is `ASSETS_ENDPOINT`.
6. Run `assets:prepare-bucket` against the production bucket only if you understand what it changes there; the kit's Storage page lists the WAF and lifecycle rules R2 needs.

> [!UNVERIFIED] This section will be verified when the configuration guide is finalized.
