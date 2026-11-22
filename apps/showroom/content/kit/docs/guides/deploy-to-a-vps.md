# Deploy to a VPS

Put the kit on one rented server, with its own domain, wildcard certificate, file storage and mail, from an empty server to a
signed-in workspace. The steps come from a real deployment: the public demo at `demo.mood-ui.com`, done on a Contabo server in
November 2026. [What was tested](#what-was-tested) says which parts ran on a real server and which did not.

You end up with the stack of [Docker images and the production stack](../configuration/docker.md) on one machine: Caddy on ports
80 and 443, the API, the frontend, Postgres and Redis. This page is the path to a server; the reference for what runs on it is
that page, and the list of what a deployment needs is the [Production checklist](../configuration/production.md).

## Before you start

You need:

- a domain whose DNS is on Cloudflare (the free plan is enough). Caddy gets the wildcard certificate through Cloudflare's DNS,
  so a zone elsewhere does not work with `CADDY_TLS=cloudflare`;
- a Cloudflare account for file storage (R2), and a Cloudflare Turnstile widget (see [Captcha](../configuration/captcha.md));
- an account at a mail provider (the examples use Resend);
- a copy of the kit on your computer, as a git repository;
- a terminal with `ssh`, `scp`, `git` and `dig`.

In the commands, `SERVER_IP` is the server's IPv4 address, `example.com` is your root domain (`ROOT_DOMAIN`) and `deploy` is the
user that runs the stack. Replace them.

## 1. Choose a server

The stack runs on any x86_64 Linux server with Docker. The script in this guide targets Ubuntu 24.04.

| Use | Memory | Notes |
| --- | ------ | ----- |
| One app | 4 GB minimum, with the swap file the script adds | |
| A public demo, or several apps | 8 to 12 GB | the demo ran on 6 vCPU, 12 GB and 200 GB of disk |

What the demo used, idle: about 580 MB of RAM for its containers and 14 GB of disk with the images. Disk grows with the images
you build and with Docker's layers, so leave room for a few builds.

Prices change, so this page gives none. The demo used a Contabo Cloud VPS, because the cheaper ARM plans we looked at elsewhere
were unavailable at the time. We deployed on Contabo only. A provider that gives you a public IPv4, root over SSH and Ubuntu
24.04 should behave the same from step 3 on, but images differ (some restrict root's SSH key, see step 4), so read what the
script prints.

**Contabo.** At order time Contabo asks for a root password and adds SSH keys afterwards, so the first login is by password and
step 2 installs your key.

## 2. Make an SSH key and install it

On your computer:

```bash
ssh-keygen -t ed25519
```

If you give the key a passphrase, load it into the SSH agent, or every `ssh` and `scp` below asks for it. On macOS:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

and keep it loaded across restarts with this in `~/.ssh/config`:

```text
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

Install the public key on the server. Some providers take it in their panel when you create the server; where they only take a
root password (Contabo), use:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@SERVER_IP
```

Check that `ssh root@SERVER_IP` now logs in without asking for the password.

## 3. Open the provider's firewall

Cloud providers filter traffic before it reaches the server. Open TCP 22 (ssh), 80 and 443 (web), and ICMP (ping). Nothing else
needs to be open: the stack publishes only Caddy's 80 and 443.

### Contabo (tested)

1. Open **Network > Firewall** and create a firewall. A new one starts with a "Block all traffic" rule that drops everything.
2. Add ACCEPT rules for TCP 22, 80 and 443, and for ICMP.
3. Open the firewall's **VPS/VDS** tab and assign your server to it. A firewall nobody is assigned to does nothing.

### Hetzner Cloud (firewall tested, server not)

Under **Firewalls**, add inbound rules for TCP 22, 80 and 443 and for ICMP. Add no outbound rules. Pick the firewall when you
create the server. See Hetzner's [Firewalls documentation](https://docs.hetzner.com/cloud/firewalls/).

### DigitalOcean, Vultr, OVH (not tested)

Each has a cloud firewall that works the same way: allow inbound TCP 22, 80, 443 and ICMP, and attach it to the server. We did
not use them. DigitalOcean documents it as [Cloud Firewalls](https://docs.digitalocean.com/products/networking/firewalls/);
for Vultr and OVHcloud, search their documentation for "firewall".

## 4. Prepare the server

`deploy/server-setup.sh` does the base setup in one go. Run it from the root of the kit on your computer:

```bash
ssh root@SERVER_IP 'bash -s -- --user deploy --swap-gb 4' < deploy/server-setup.sh
```

In this order, it:

1. waits for the first-boot `apt` lock, upgrades the system, and installs `ufw`, `fail2ban`, `unattended-upgrades`,
   `ca-certificates`, `curl` and `gnupg`;
2. creates the user `deploy`, adds it to the `sudo` group, gives it passwordless sudo in `/etc/sudoers.d/90-deploy` (checked
   with `visudo -cf`), and copies root's `authorized_keys` to it. A `command=` restriction some images put in front of root's
   key (it only prints "please login as ubuntu") is dropped from the copy, and a line `ssh-keygen` cannot read is skipped;
3. adds a swap file (4 GB by default) and sets `vm.swappiness=10`;
4. turns on `ufw`: deny incoming, allow outgoing, allow TCP 80 and 443 and the port `sshd` listens on (22 unless you changed it);
5. turns on automatic security updates and `fail2ban`;
6. installs Docker from Docker's own apt repository, or from the source for it that is already there (`docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`,
   `docker-compose-plugin`), adds `deploy` to the `docker` group and rotates container logs in `/etc/docker/daemon.json`
   (`json-file`, 10 MB, 3 files).

It does not lock the door yet. Options: `--user`, `--existing-user`, `--swap-gb`, `--hostname`, `--no-docker`, `--harden`,
`--help`. At the end it tells you if the server wants a reboot.

Running it again is safe: it checks each step first. Where something is already there and differs, it leaves it alone and says so:
a sudoers rule at `/etc/sudoers.d/90-deploy` that is not the one above, a `daemon.json` that is not its own, swap that already
exists. It stops, before changing anything, when `--user` names a user that already exists (other than `deploy`) unless you add
`--existing-user`, because that user would get passwordless sudo. It also stops when Ubuntu's own `docker.io` package is installed:
it does not replace someone's Docker.

Docker's published ports bypass `ufw`. That is why the stack publishes only Caddy's 80 and 443, and why the provider firewall of
step 3 matters.

### Lock the door

Hardening turns off root and password logins. Do it only after you have proved that the new user can log in, or you lock
yourself out. In a new terminal:

```bash
ssh deploy@SERVER_IP 'sudo -n true && echo ok'
```

When that prints `ok`, run the script again with `--harden`:

```bash
ssh root@SERVER_IP 'bash -s -- --user deploy --harden' < deploy/server-setup.sh
```

The script refuses to harden, and says why, when the user has no authorized key that works: one `ssh-keygen` reads and that has
no `command=` option. Otherwise it writes
`/etc/ssh/sshd_config.d/01-hardening.conf`:

```text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers deploy
```

The file is named `01-` on purpose. `sshd` keeps the first value it reads for each keyword, and the server image ships its own
files in `sshd_config.d`. We first named ours `99-hardening.conf` and password logins stayed on. Then it runs `sshd -t`, reloads
`ssh`, and checks `sshd -T` for the two logins and, for the user, `sshd -T -C user=deploy,...`: if the image's own configuration
(an `AllowUsers`, `AllowGroups` or `Deny...` line) would keep the user out, it removes its file, reloads `ssh` and stops.

Root can no longer log in after this. To run the script again later (it is safe to), go through the new user and `sudo`:

```bash
ssh deploy@SERVER_IP 'sudo bash -s -- --harden' < deploy/server-setup.sh
```

Check from your computer. The first command must work, the second must be refused:

```bash
ssh deploy@SERVER_IP 'sudo -n true && echo ok'
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password deploy@SERVER_IP
```

```text
deploy@SERVER_IP: Permission denied (publickey).
```

From here on you log in as `deploy`, never as root.

## 5. Point DNS at the server

On Cloudflare, add two `A` records to the zone, both **DNS only** (grey cloud, not proxied):

| Type | Name | Content |
| ---- | ---- | ------- |
| A | `example.com` (or `@`) | `SERVER_IP` |
| A | `*.example.com` | `SERVER_IP` |

When your root domain is itself a subdomain, as in `demo.mood-ui.com`, the names are `demo` and `*.demo`. That wildcard is
second level, which Cloudflare's free Universal SSL does not cover, so proxying it breaks TLS. Keep it DNS only: Caddy gets the
certificate itself. The kit's [Domains](../configuration/domains.md) page says which hosts exist.

Check:

```bash
dig +short example.com
dig +short anything.example.com
```

Both print `SERVER_IP`.

## 6. Make a Cloudflare API token for Caddy

Caddy proves it owns the domain, to get the wildcard certificate, by writing a DNS record through Cloudflare.

1. In Cloudflare, open **My Profile > API Tokens > Create Token**.
2. Use the template **Edit zone DNS**, and under **Zone Resources** choose **Specific zone** and your zone.
3. Copy the token. It is shown once. It becomes `CLOUDFLARE_API_TOKEN`.

Check it without printing it. Paste it when `read` waits for it:

```bash
read -rs CF_TOKEN
curl -s -H "Authorization: Bearer $CF_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify | grep -o '"status":"[a-z]*"'
curl -s -H "Authorization: Bearer $CF_TOKEN" "https://api.cloudflare.com/client/v4/zones?name=example.com" | grep -o '"name":"example.com"'
unset CF_TOKEN
```

The first prints `"status":"active"`, the second finds your zone.

## 7. Set up file storage (R2)

Uploads (logos, public page images) go to object storage; the stack needs it. [Storage](../configuration/storage.md#in-production-cloudflare-r2)
explains the settings. The steps we followed:

1. Create an R2 bucket.
2. In the bucket's **Settings > Custom Domains**, connect `assets.example.com`. Keep the `r2.dev` public URL off.
3. Create an R2 API token with **Object Read & Write**, limited to that bucket. Keep its access key ID and secret.

The values you need:

| Variable | Value |
| -------- | ----- |
| `ASSETS_ENDPOINT` | `https://<account id>.r2.cloudflarestorage.com`, without the bucket |
| `ASSETS_BUCKET` | the bucket's name |
| `ASSETS_URL` | `https://assets.example.com` |
| `ASSETS_USE_PATH_STYLE_ENDPOINT` | `false`, the value in `deploy/.env.example` (the demo runs with it) |
| `ASSETS_ACCESS_KEY_ID`, `ASSETS_SECRET_ACCESS_KEY` | from the token |

With the defaults (`SETTINGS_LOGO_PRESIGN=false`, `PUBLIC_PAGE_MEDIA_PRESIGN=false`) uploads go through the API, so the bucket
needs no CORS rules.

Check the bucket before the app depends on it: write, read through the custom domain, delete.

```bash
ENDPOINT=https://<account id>.r2.cloudflarestorage.com
BUCKET=<bucket name>
read -r ID
read -rs SECRET
curl -s -o /dev/null -w "%{http_code}\n" --aws-sigv4 "aws:amz:auto:s3" --user "$ID:$SECRET" -X PUT --data "ok" "$ENDPOINT/$BUCKET/healthcheck/x.txt"
curl -s -o /dev/null -w "%{http_code}\n" https://assets.example.com/healthcheck/x.txt
curl -s -o /dev/null -w "%{http_code}\n" --aws-sigv4 "aws:amz:auto:s3" --user "$ID:$SECRET" -X DELETE "$ENDPOINT/$BUCKET/healthcheck/x.txt"
unset ID SECRET
```

The three answers are `200`, `200` and `204`.

## 8. Set up mail

Use a real provider and a sending domain you control. A subdomain such as `mail.example.com` keeps the reputation of your root
domain apart from your app's mail. The example is Resend; see [Mail](../configuration/mail.md) for the others.

1. In Resend, add the domain `mail.example.com`. Add the DNS records it asks for; with the domain on Cloudflare, Resend can add
   them for you (its Cloudflare auto-configure).
2. Create an API key with sending access, limited to that domain.
3. Add the DMARC record described below.
4. The variables:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=<the API key>
MAIL_FROM_ADDRESS=hello@mail.example.com
```

**DMARC.** SPF and DKIM pass with Resend's records, but Gmail still shows DMARC as failed until the sender's domain publishes a
DMARC policy. Add a TXT record on the root domain:

| Type | Name | Content |
| ---- | ---- | ------- |
| TXT | `_dmarc` | `v=DMARC1; p=none; adkim=r; aspf=r;` |

`p=none` reports and blocks nothing. Once your mail passes, tighten it to `p=quarantine`. After you add the record, Gmail can
keep its earlier "no record" answer for up to about 30 minutes, so wait before you test again.

Another SMTP provider (Postmark, Amazon SES, Mailgun) works the same way: its SMTP host, port and credentials in the same
variables. We tested only Resend.

You test mail from the running stack in [step 12](#12-verify).

## 9. Put the code on the server

The recommended way sends the code over SSH, so the server never holds a GitHub credential. From the root of your repository on
your computer:

```bash
git archive main | ssh deploy@SERVER_IP 'mkdir -p ~/app/kit && tar -x -C ~/app/kit'
```

`git archive` sends the files of the branch as committed, without `.git` and without ignored files such as `deploy/.env`.

The alternative is a read-only deploy key: on the server run `ssh-keygen -t ed25519` as `deploy`, add the public key to your
repository under **Settings > Deploy keys** without write access, and `git clone` it into `~/app/kit`. Updates are then
`git pull`. The trade-off is that the server now holds a credential that can read your code: whoever gets into the server can
read the repository.

## 10. Make the `.env`

From the kit's root on the server (`ssh deploy@SERVER_IP`, then `cd ~/app/kit`), `deploy/make-env` makes `deploy/.env` from
`deploy/.env.example`. It generates every secret that belongs to the stack, on the server, and never prints one: `APP_KEY`, the
five database passwords (`DB_PASSWORD`, `DB_MIGRATION_PASSWORD`, `DB_PLATFORM_PASSWORD`, `DB_CATALOG_PASSWORD`,
`DB_ADMIN_PASSWORD`), `REDIS_PASSWORD` and `REVERB_APP_ID`, `REVERB_APP_KEY` and `REVERB_APP_SECRET`.

The keys of your own accounts (Cloudflare token, R2, mail, Turnstile, Stripe) go in a file on your computer, outside any
repository, with mode 600. One `KEY=VALUE` per line, as in a `.env`:

```dotenv
# ~/mood-kit-keys.env
PLATFORM_BOOTSTRAP_ADMINS=you@example.com
CLOUDFLARE_API_TOKEN=
ASSETS_ACCESS_KEY_ID=
ASSETS_SECRET_ACCESS_KEY=
ASSETS_BUCKET=
ASSETS_ENDPOINT=https://<account id>.r2.cloudflarestorage.com
ASSETS_URL=https://assets.example.com
MAIL_HOST=smtp.resend.com
MAIL_USERNAME=resend
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=hello@mail.example.com
TURNSTILE_SECRET_KEY=
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Fill it in, then copy it to the server and run the script:

```bash
chmod 600 ~/mood-kit-keys.env
scp ~/mood-kit-keys.env deploy@SERVER_IP:keys.env
ssh deploy@SERVER_IP 'cd ~/app/kit && { deploy/make-env --domain example.com --keys ~/keys.env; rc=$?; rm -f ~/keys.env; exit $rc; }'
```

The keys file on the server is removed whether the script worked or not. Write each value as it is, with no escaping and no
quotes needed: the script puts quotes around a value that has spaces, `#`, quotes or backslashes, and doubles every `$`, which
Compose would otherwise read as a variable. One pair of quotes around a value is dropped. A value cannot span lines. Blank lines,
comments and keys with an empty value are ignored. A line that is not `KEY=VALUE` is skipped with a warning that names its line
number, never its content. The file `deploy/.env` is built under a temporary name and moved into place at the end, so a failed
run leaves none, and it gets mode 600. The script prints only
names: the keys it generated, the keys it set from your file, and the required keys that are still empty. Add what is missing
to your file and run `deploy/make-env --update ~/keys.env`: it replaces only the keys that are in that file, and refuses a key
the script generates (the passwords, `APP_KEY`, the Reverb keys) unless you add `--force`.

For a value the script does not ask for, such as `APP_NAME` or `PLATFORM_NAME`, put it in the same file. See
[The `.env` file](../configuration/environment.md) and the comments in `deploy/.env.example`.

Never generate the database passwords again once the Postgres volume exists. The roles were created with the first set and keep
it; a new `.env` would lock the app out of its own database. That is why a plain `deploy/make-env` refuses when `deploy/.env`
exists. Back `deploy/.env` up somewhere private.

## 11. Build and start

On the server, in `~/app/kit`:

```bash
docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env build
docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env up -d --wait
```

`--wait` returns when every service is healthy: `backend`, `frontend`, `caddy`, `postgres` and `redis`. The backend's first start
runs the migrations and the other deploy commands under a lock; see [`APP_RUN_DEPLOY` and the deploy lock](../configuration/docker.md#app_run_deploy-and-the-deploy-lock).
Check with:

```bash
docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env ps
```

### The first super admin

On a real install, sign up with the email in `PLATFORM_BOOTSTRAP_ADMINS` on `https://example.com/signup`, then restart the
backend. [Set up the first super admin](set-up-the-first-super-admin.md) has the details.

### A public demo instead

For a demo, set in `deploy/.env` (add them to your keys file and `--update`, then `up -d --wait` again):

```dotenv
DEMO_MODE=true
PLATFORM_BOOTSTRAP_ADMINS=owner@demo.test
```

and make the demo data once:

```bash
docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env exec -T backend php artisan demo:reset
```

[Run a public demo](run-a-public-demo.md) explains what the mode locks and the daily reset. Never turn it on for a stack that
holds real data.

## 12. Verify

HTTP, with `example.com` and a workspace called `demo`. That workspace exists on a demo because `demo:reset` makes it; on any
other install use the slug of a workspace you signed up:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://example.com/
curl -s -o /dev/null -w "%{http_code}\n" https://api.example.com/up
curl -s -o /dev/null -w "%{http_code}\n" https://admin.example.com/
curl -s -o /dev/null -w "%{http_code}\n" https://demo.example.com/
```

Expected: `200`, `200`, `302` (the admin sends you to its sign-in) and `200`.

The certificate is a wildcard from Let's Encrypt:

```bash
curl -sv https://demo.example.com/ 2>&1 | grep -E "subject:|issuer:"
```

The subject is `CN=*.example.com` and the issuer is Let's Encrypt.

The websocket answers `101`. Use HTTP/1.1: over HTTP/2, curl gets a misleading `500`. The key is public, it is the one the
browser uses:

```bash
KEY=$(grep '^REVERB_APP_KEY=' deploy/.env | cut -d= -f2)
curl -s -o /dev/null -w "%{http_code}\n" --max-time 5 --http1.1 \
  -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: $(openssl rand -base64 16)" "https://ws.example.com/app/$KEY"
```

The connection stays open, so curl may report a timeout after printing `101`. The printed code is the answer.

Mail, from the stack. A test calls the `smtp` mailer by name, because in demo mode the default mailer is forced to `log`:

```bash
docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env exec -T backend php artisan tinker --execute 'Illuminate\Support\Facades\Mail::mailer("smtp")->raw("test", fn ($m) => $m->to("you@example.com")->subject("Mood Kit mail test"));'
```

In Gmail, open the message and choose **Show original**: SPF, DKIM and DMARC should all say `PASS`.

What the box is using:

```bash
docker stats --no-stream
df -h /
docker system df
```

The rest of the post-deploy list is in [After the first deploy](../configuration/production.md#after-the-first-deploy).

## 13. Update

Send the new code the same way, build and start again:

```bash
git archive main | ssh deploy@SERVER_IP 'mkdir -p ~/app/kit && tar -x -C ~/app/kit'
ssh deploy@SERVER_IP 'cd ~/app/kit && docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env build && docker compose -p mood-kit -f deploy/compose.yml --env-file deploy/.env up -d --wait'
```

`deploy/.env` is not in the archive, so it stays as it is. The backend's deploy step runs the migrations under its lock; see
[Docker images and the production stack](../configuration/docker.md#app_run_deploy-and-the-deploy-lock). A file you deleted in the
new version stays on the server until you delete it. Read the changelog's **Upgrading** notes first.

## Troubleshooting

**Password logins still work after hardening.** `sshd` keeps the first value it reads, and the image's own files in
`/etc/ssh/sshd_config.d` come before one named `99-`. The drop-in must be `01-hardening.conf`. `sshd -T | grep -i passwordauth`
shows the value in force; the script checks it for you.

**The script says it skipped or stripped a key, or refuses to harden.** Some images put `command="...exit 142"` in front of
root's key, so root can only print a message. The script copies the key without that prefix. If `deploy` still has no key that
works, add yours with `ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@SERVER_IP` (the login must work first) and run `--harden`
again.

**Locked out of the server after hardening.** Use your provider's web console or rescue mode to restore access, then add your key
to `/home/deploy/.ssh/authorized_keys`. This is why the script refuses to harden without an authorized key, and why you test
the login first.

**The script says it is waiting, or `apt` reports a lock.** A new server runs updates on first boot. The script waits up to 15
minutes for the lock.

**Nothing answers on 80 or 443.** On Contabo, check the firewall is assigned to the server in its **VPS/VDS** tab and has the
ACCEPT rules above its "Block all traffic" rule. Then `docker compose ... ps` and `docker compose ... logs caddy`.

**The certificate is not issued, or the browser shows a TLS error on a subdomain of the root.** The Cloudflare token must be
valid for the zone (step 6), `CADDY_TLS=cloudflare`, and the records must be DNS only. A proxied wildcard under a subdomain root
(`*.demo.example.com`) is not covered by Cloudflare's free certificate and breaks TLS.

**The websocket check returns `500`.** You used HTTP/2. Add `--http1.1`.

**The app cannot connect to the database after you changed `.env`.** The five database passwords were fixed when the Postgres
volume was first made. Put the old values back, or change the roles inside Postgres with `ALTER ROLE` too. On an install with no
data you can start over with `docker compose ... down -v`, which deletes the database for good.

**Mail reaches Gmail but shows DMARC fail.** Add the `_dmarc` record of step 8, then wait up to about 30 minutes: Gmail caches
the earlier "no record" answer.

**The mail test shows nothing in the inbox in demo mode.** The default mailer is `log`. The test in step 12 names the `smtp`
mailer on purpose. After you change `MAIL_*`, run `up -d --wait` again so the backend reads the new values.

**`ssh` or `scp` asks for the key's passphrase every time.** Load the key into the agent (step 2).

## More than one app on a server

One server can host more than one app only after a change to the stack that is not built or tested yet: the stack's own Caddy
binds ports 80 and 443, so a second stack cannot start beside it. Until then, use one server per app.

## What was tested

Tested end to end on 2026-11-21, by hand, command by command: a Contabo Cloud VPS (6 vCPU, 12 GB, x86_64, Ubuntu 24.04) with
Cloudflare DNS, an R2 bucket on a custom domain, Resend for mail, the Contabo firewall, the code sent with `git archive`, the
build, `up -d --wait` with all five services healthy, and the checks of step 12, for the public demo at `demo.mood-ui.com`.

The scripts, in the version this guide ships, then ran on that same server:

- `deploy/server-setup.sh --harden`, through `deploy` and `sudo`: every step found its work done, it reused the Docker apt source
  that was already there, opened 22, 80 and 443 for IPv4 and IPv6, wrote the drop-in, and `sshd -T` showed root and password
  logins off with `deploy` allowed. A password login was refused. It asked for a reboot after a kernel update; after
  `sudo reboot` the five services came back healthy on their own and the demo answered 200.
- `deploy/make-env` in a temporary folder: a fresh run, a refused second run, `--update` refusing `DB_PASSWORD`, and values with a
  space and a `$` that reached a container exactly as written, through `${...}` and through `env_file`.
- Both scripts pass `shellcheck`.

Not tested on a real server:

- `deploy/server-setup.sh` on a brand new server, and the cases we never met: root's key restricted by `command=` (Oracle,
  AWS-style and some OVH images), a non-standard SSH port, an image whose `AllowUsers` or group rules keep the user out, a leftover
  `docker.io`, a sudoers rule that already differs. Tests that stub the system cover them.
- The Hetzner server (only its firewall was set up), and DigitalOcean, Vultr and OVHcloud.
- An ARM server (aarch64). The demo ran on x86_64.
- Mail providers other than Resend, and a DNS provider other than Cloudflare.
- The deploy key route of step 9.
