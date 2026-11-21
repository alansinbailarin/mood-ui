/**
 * "Let an agent do it" blocks, appended to Getting started and to every
 * configuration page of the Kit section. They are site copy, not kit docs:
 * the kit's own pages stay untouched. Each block gives the prompt to paste, what
 * an agent can do by itself and what only a person can do. Agents never handle
 * real secrets, so every `humanMust` list says who creates the account and
 * who pastes the key.
 */

export interface AgentBlock {
  /** Kit docs file(s) the prompt points the agent at. */
  docs: string[];
  /** The task, in the user's voice. */
  task: string;
  agentCan: string[];
  humanMust: string[];
}

const SECRETS_RULE =
  "Never read, print or invent real secrets: leave every secret empty or as a placeholder and tell me which ones I must create and put in my environment myself.";

/** The text the reader pastes into the agent. */
export function agentPrompt(block: AgentBlock): string {
  const docs = block.docs.join(" and ");
  return [
    `Read AGENTS.md at the root of the repository, then ${docs}.`,
    block.task,
    SECRETS_RULE,
    "Run the verify commands the docs name and tell me what fails and why, instead of working around it.",
  ].join(" ");
}

const BLOCKS: Record<string, AgentBlock> = {
  "getting-started": {
    docs: ["docs/getting-started.md"],
    task: "Set the kit up on this machine following the guide: copy .env.example to .env, start the Docker services, install the dependencies, run the migrations and the seeder, then run php artisan tenancy:verify-rls. Do not change a value in .env that the guide does not ask you to change. List the URLs and the demo sign-in at the end.",
    agentCan: [
      "Copy .env.example to .env and run key:generate.",
      "Start Docker Compose, install dependencies, run migrate and db:seed.",
      "Run php artisan tenancy:verify-rls, platform:verify, onboarding:verify and geocoding:verify.",
      "Start the API, frontend, queue worker and scheduler and say what failed.",
    ],
    humanMust: [
      "Install Docker, PHP 8.4 with its extensions, Node and pnpm.",
      "Decide whether to open the demo sign-in beyond your machine (do not).",
    ],
  },
  environment: {
    docs: ["docs/configuration/environment.md", "docs/configuration/production.md"],
    task: "Compare my .env against .env.example and list every variable that is missing, empty or still a public development default, with the page that explains it. Fill in what is not a secret.",
    agentCan: [
      "Diff .env against .env.example and explain each variable.",
      "Edit non-secret values (hosts, ports, drivers, flags).",
      "Generate APP_KEY with php artisan key:generate.",
    ],
    humanMust: [
      "Generate and store every password and key, in your host's secret store.",
      "Never commit a .env file.",
    ],
  },
  domains: {
    docs: ["docs/configuration/domains.md", "docs/configuration/admin-host.md"],
    task: "Check that TENANCY_ROOT_DOMAIN, NUXT_PUBLIC_TENANCY_ROOT_DOMAIN, APP_URL, APP_FRONTEND_URL, NUXT_PUBLIC_API_BASE_URL and the admin host agree for <local | root domain>, and edit them if not. Then run php artisan platform:verify.",
    agentCan: [
      "Edit the domain variables in .env and make them agree.",
      "Run php artisan platform:verify and read where the admin host lives.",
      "Add /etc/hosts lines for workspaces locally, if you approve the edit.",
    ],
    humanMust: [
      "Buy the domain and create the DNS records, including the wildcard.",
      "Issue the wildcard certificate.",
    ],
  },
  "admin-host": {
    docs: ["docs/configuration/admin-host.md"],
    task: "Check that PLATFORM_HOST and NUXT_PUBLIC_PLATFORM_HOST are alike and that the admin host is reachable. Run php artisan platform:verify and php artisan platform:setup.",
    agentCan: [
      "Align PLATFORM_HOST and NUXT_PUBLIC_PLATFORM_HOST.",
      "Run platform:verify and platform:setup.",
    ],
    humanMust: [
      "Choose the emails in PLATFORM_BOOTSTRAP_ADMINS and sign in as the first super admin.",
      "Create the DNS record and certificate of the admin host.",
    ],
  },
  database: {
    docs: ["docs/concepts/multi-tenancy.md", "docs/configuration/environment.md"],
    task: "Check the five DB_* role settings, run the migrations and run php artisan tenancy:verify-rls. If it fails, explain which role has too much power and which statement fixes it, but do not run it against a database I did not name.",
    agentCan: [
      "Run php artisan migrate and php artisan tenancy:verify-rls locally.",
      "Read the failure and write the SQL that fixes a role.",
      "Fix local DB_* values to match docker-compose.yml.",
    ],
    humanMust: [
      "Create the roles on the production database as its superuser, with new passwords.",
      "Run the SQL on production yourself, and set up backups.",
    ],
  },
  "redis-and-queue": {
    docs: ["docs/configuration/queues-and-scheduler.md"],
    task: "Check that Redis is reachable with the REDIS_* settings, that QUEUE_CONNECTION=redis, and start a queue worker. Send a test password reset and confirm the job ran.",
    agentCan: [
      "Check the REDIS_* and QUEUE_* settings and start php artisan queue:work.",
      "Write a supervisor program file for the worker, for you to install.",
    ],
    humanMust: [
      "Provision Redis in production and install the supervisor program.",
      "Set the Redis password in the server's environment.",
    ],
  },
  mail: {
    docs: ["docs/configuration/mail.md"],
    task: "Check that local mail reaches Mailpit: trigger a password reset and confirm the email is in the inbox. For production prepare the MAIL_* variables for <SMTP | SES | Postmark | Resend> without values for the secrets.",
    agentCan: [
      "Trigger a local email and read Mailpit's API to confirm it arrived.",
      "Edit MAIL_FROM_* and MAIL_MAILER, and install the Postmark or Resend transport with Composer if you ask for it.",
    ],
    humanMust: [
      "Create the provider account, verify the sending domain (SPF, DKIM) and create the credentials.",
      "Create the SNS topic and configuration set when you use SES.",
      "Paste the credentials into the server's environment.",
    ],
  },
  captcha: {
    docs: ["docs/configuration/captcha.md"],
    task: "Explain what AUTH_CAPTCHA_DRIVER, SIGNUP_REQUIRE_CAPTCHA and CLIENTS_PORTAL_REQUIRE_CAPTCHA do for <local | production> in this .env and set the driver. Leave both Turnstile keys empty.",
    agentCan: [
      "Set AUTH_CAPTCHA_DRIVER and the two require flags.",
      "Check that production does not end up with the null driver and the flags empty, which closes signup.",
    ],
    humanMust: [
      "Create the Cloudflare Turnstile widget.",
      "Paste TURNSTILE_SECRET_KEY and NUXT_PUBLIC_TURNSTILE_SITE_KEY into the environment.",
    ],
  },
  storage: {
    docs: ["docs/configuration/storage.md"],
    task: "Prepare the local MinIO bucket with php artisan assets:prepare-bucket and check that a workspace logo uploads. For production list the ASSETS_* variables and the NUXT_SECURITY_ASSETS_* values for Cloudflare R2, without values for the keys.",
    agentCan: [
      "Run php artisan assets:prepare-bucket against the local MinIO.",
      "Edit ASSETS_ENDPOINT, ASSETS_BUCKET, ASSETS_URL and NUXT_SECURITY_ASSETS_* values.",
    ],
    humanMust: [
      "Create the R2 bucket, its API token, the custom domain, the CORS rule, the WAF rule and the lifecycle rule.",
      "Paste ASSETS_ACCESS_KEY_ID and ASSETS_SECRET_ACCESS_KEY into the environment.",
    ],
  },
  stripe: {
    docs: ["docs/configuration/stripe.md", "docs/packages/billing.md"],
    task: "Prepare billing for the Stripe sandbox: run php artisan plans:sync and php artisan billing:sync-plans --dry-run and explain what it would create. Do not call Stripe with a live key.",
    agentCan: [
      "Run plans:sync and billing:sync-plans --dry-run.",
      "Run billing:sync-plans against a sandbox key you have put in .env yourself.",
      "Explain which webhook events and which Customer Portal settings are needed.",
    ],
    humanMust: [
      "Create the Stripe account, the sandbox and the live keys, and paste them into the environment.",
      "Add the webhook endpoint and its signing secret, and configure the Customer Portal.",
      "Make real payments and refunds when you go live.",
    ],
  },
  reverb: {
    docs: ["docs/configuration/realtime.md"],
    task: "Check that BROADCAST_CONNECTION and the REVERB_* values work locally and start php artisan reverb:start. For production list the values to change (REVERB_ALLOWED_ORIGINS, the public host, rate limiting) without making up keys.",
    agentCan: [
      "Start php artisan reverb:start and check the inbox updates live.",
      "Edit the non-secret REVERB_* values and NUXT_SECURITY_REALTIME_URL.",
      "Write the nginx block for the websocket host, for you to install.",
    ],
    humanMust: [
      "Generate the production REVERB_APP_ID, REVERB_APP_KEY and REVERB_APP_SECRET and store them.",
      "Create the websocket host, its DNS record and its certificate.",
    ],
  },
  sentry: {
    docs: ["docs/configuration/sentry.md"],
    task: "Prepare Sentry: set SENTRY_TRACES_SAMPLE_RATE, leave SENTRY_LARAVEL_DSN empty and explain how to test with php artisan sentry:test once I paste the DSN.",
    agentCan: [
      "Set SENTRY_TRACES_SAMPLE_RATE and check zend.exception_ignore_args in php.ini.",
      "Run php artisan sentry:test after you have set the DSN.",
    ],
    humanMust: [
      "Create the Sentry project and paste its DSN into the environment.",
    ],
  },
  scheduler: {
    docs: ["docs/configuration/queues-and-scheduler.md"],
    task: "Run the scheduler locally with php artisan schedule:work, list the tasks with php artisan schedule:list, and write the cron entry or supervisor program for production.",
    agentCan: [
      "Run schedule:work and schedule:list.",
      "Write the cron line or supervisor file, for you to install.",
    ],
    humanMust: [
      "Install the cron entry or supervisor program on the server, on one server only.",
    ],
  },
  deployment: {
    docs: ["docs/configuration/production.md"],
    task: "Make a deployment checklist for <host> from the production checklist, with the deploy commands in order. Write the deploy script, but do not run it against any server.",
    agentCan: [
      "Write the deploy script with the commands in order, and a pre-deploy check of .env.",
      "Run the verify commands locally: tenancy:verify-rls, onboarding:verify, geocoding:verify, platform:verify.",
      "Run pnpm --filter ./frontend build.",
    ],
    humanMust: [
      "Provision the servers, database, Redis and DNS, and set the environment variables with the real secrets.",
      "Run the deploy and watch the first one.",
    ],
  },
  docker: {
    docs: ["docs/configuration/docker.md", "docs/configuration/production.md"],
    task: "Explain what the three images and the Compose stack in deploy/ do, then prepare deploy/.env from deploy/.env.example for <a test on this machine | a server> without values for the secrets. Build the three images and validate the stack with docker compose config. Do not start the stack against a server.",
    agentCan: [
      "Build the backend, frontend and Caddy images from the repo root.",
      "Copy deploy/.env.example to deploy/.env, fill the non-secret values and list the required ones that are still empty.",
      "Run docker compose config to validate the stack, and the one machine test with CADDY_TLS=internal when you ask for it.",
      "Choose the APP_ROLE of each service and check that only one scheduler runs.",
    ],
    humanMust: [
      "Generate and set APP_KEY, the database and Redis passwords and the REVERB_APP_* keys in deploy/.env.",
      "Create the Cloudflare API token for the wildcard certificate and point the DNS at the server.",
      "Set up the S3 or R2 bucket for uploads, since the stack keeps none.",
      "Run the stack on the server, sign up the first super admin and run the deploy again.",
    ],
  },
  maps: {
    docs: ["docs/configuration/maps.md"],
    task: "Check GEOCODING_DRIVER and run php artisan geocoding:verify. For production recommend a provider fit for real traffic and say what its terms allow.",
    agentCan: [
      "Set GEOCODING_DRIVER and run php artisan geocoding:verify.",
      "Explain the cache and the limits of each provider.",
    ],
    humanMust: [
      "Create the Google or Mapbox account and key, and restrict the key.",
      "Read the provider's terms on storing results.",
    ],
  },
  search: {
    docs: ["docs/configuration/search.md"],
    task: "Check SCOUT_DRIVER. If I want Meilisearch, set the variables the page lists, then run php artisan scout:sync-index-settings and php artisan search:reindex. Tell me which Meilisearch key I must create myself.",
    agentCan: [
      "Set SCOUT_DRIVER, SCOUT_PREFIX and SCOUT_QUEUE and explain what each one changes.",
      "Run php artisan scout:sync-index-settings and php artisan search:reindex.",
      "Check that a queue worker is running and read php artisan queue:failed.",
    ],
    humanMust: [
      "Create the Meilisearch key for the clients' index and keep the master key out of the app.",
      "Provision the hosted Meilisearch you run in production.",
    ],
  },
};

/** Which block each page gets. Pages not listed get none. */
const PAGE_TO_BLOCK: Record<string, string> = {
  "getting-started": "getting-started",
  "configuration/environment": "environment",
  "configuration/domains": "domains",
  "configuration/admin-host": "admin-host",
  "configuration/mail": "mail",
  "configuration/captcha": "captcha",
  "configuration/storage": "storage",
  "configuration/stripe": "stripe",
  "configuration/realtime": "reverb",
  "configuration/sentry": "sentry",
  "configuration/queues-and-scheduler": "scheduler",
  "configuration/maps": "maps",
  "configuration/search": "search",
  "configuration/docker": "docker",
  "configuration/production": "deployment",
  "setup/domains": "domains",
  "setup/database": "database",
  "setup/redis-and-queue": "redis-and-queue",
  "setup/mail": "mail",
  "setup/captcha": "captcha",
  "setup/storage": "storage",
  "setup/stripe": "stripe",
  "setup/reverb": "reverb",
  "setup/sentry": "sentry",
  "setup/scheduler": "scheduler",
  "setup/deployment": "deployment",
};

export function agentBlockFor(slug: string): AgentBlock | null {
  const key = PAGE_TO_BLOCK[slug];
  return (key ? BLOCKS[key] : undefined) ?? null;
}

/** Slugs that must carry a block: tests check the map covers them all. */
export const AGENT_PAGE_SLUGS = Object.keys(PAGE_TO_BLOCK);
