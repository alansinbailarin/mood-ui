/**
 * The Kit section's page tree: the synced kit docs (from `content/kit/manifest.json`,
 * written by `pnpm kit:sync`) plus the pages the site writes itself
 * (`content/kit-site/`). One list drives the sidebar, prev/next, the sitemap
 * and the route prerender.
 */
import manifestJson from "../content/kit/manifest.json";
import { KIT_LANDING, routeForSlug, type KitManifest } from "./kit-docs";
import type { NavCategory, NavEntry } from "./nav-manifest";

export const kitManifest = manifestJson as KitManifest;

export type KitPageSource = "kit" | "site";

export interface KitPage {
  slug: string;
  source: KitPageSource;
  /** Repo file (kit pages) or file under `content/kit-site/` (site pages). */
  file: string;
  title: string;
  label: string;
  description: string;
}

/** Pages the site writes. Setup pages are Local + Production per service. */
const SITE_PAGES: Omit<KitPage, "source">[] = [
  {
    slug: "setup/domains",
    file: "setup/domains.md",
    title: "Domains and subdomains",
    label: "Domains and subdomains",
    description:
      "Set up Mood Kit's root domain, tenant wildcard and admin host: localhost for local, DNS and a wildcard certificate for production, and the matching env values.",
  },
  {
    slug: "setup/database",
    file: "setup/database.md",
    title: "Database and its roles",
    label: "Database and roles",
    description:
      "Configure PostgreSQL for Mood Kit: the app, owner, platform and catalog roles, row-level security and the check that fails a deploy when a role can do too much.",
  },
  {
    slug: "setup/redis-and-queue",
    file: "setup/redis-and-queue.md",
    title: "Redis and the queue",
    label: "Redis and the queue",
    description:
      "Run Redis and the queue worker for Mood Kit locally and in production: the env values, the worker process and the timeout rule.",
  },
  {
    slug: "setup/mail",
    file: "setup/mail.md",
    title: "Mail",
    label: "Mail",
    description:
      "Mood Kit email setup: Mailpit locally, and SMTP, SES, Postmark or Resend in production with a verified sending domain.",
  },
  {
    slug: "setup/captcha",
    file: "setup/captcha.md",
    title: "Captcha",
    label: "Captcha",
    description:
      "Turn on Cloudflare Turnstile for login, signup and the client portal in Mood Kit, and what the require flags do in local and in production.",
  },
  {
    slug: "setup/storage",
    file: "setup/storage.md",
    title: "Storage",
    label: "Storage",
    description:
      "Configure the assets bucket of Mood Kit: MinIO locally, Cloudflare R2 in production, presigned uploads and the Content Security Policy values.",
  },
  {
    slug: "setup/stripe",
    file: "setup/stripe.md",
    title: "Stripe",
    label: "Stripe",
    description:
      "Set up Stripe Billing for Mood Kit with a sandbox and the Stripe CLI, then go live.",
  },
  {
    slug: "setup/reverb",
    file: "setup/reverb.md",
    title: "Reverb (realtime)",
    label: "Reverb",
    description:
      "Run Laravel Reverb for Mood Kit's live inbox locally, and put it behind TLS in production with allowed origins and rate limiting.",
  },
  {
    slug: "setup/sentry",
    file: "setup/sentry.md",
    title: "Sentry",
    label: "Sentry",
    description:
      "Send Mood Kit's errors to Sentry with the secrets scrubbed, and check the setup with php artisan sentry:test.",
  },
  {
    slug: "setup/scheduler",
    file: "setup/scheduler.md",
    title: "Scheduler and cron",
    label: "Scheduler and cron",
    description:
      "Run the Mood Kit scheduler locally with schedule:work and in production with one cron entry or one supervised process.",
  },
  {
    slug: "setup/deployment",
    file: "setup/deployment.md",
    title: "Deployment",
    label: "Deployment",
    description:
      "What a Mood Kit deployment runs and the commands to run on every deploy, on any host that runs PHP, Node, Postgres and Redis.",
  },
  {
    slug: "working-with-agents",
    file: "working-with-agents.md",
    title: "Working with agents",
    label: "Working with agents",
    description:
      "How AGENTS.md steers Claude Code, Cursor and other coding agents in Mood Kit, the rules it enforces and recommended prompts for common tasks.",
  },
];

const sitePage = (slug: string): KitPage => {
  const p = SITE_PAGES.find((s) => s.slug === slug);
  if (!p) throw new Error(`Unknown site page ${slug}`);
  return { ...p, source: "site" };
};

export interface KitGroupView {
  id: string;
  title: string;
  pages: KitPage[];
}

/** Sidebar order. The landing page is not a docs page and is added in `kitNavManifest`. */
export function kitGroups(): KitGroupView[] {
  const byGroup = new Map(kitManifest.groups.map((g) => [g.id, g]));
  const fromKit = (id: string): KitGroupView | null => {
    const g = byGroup.get(id);
    return g ? { id: g.id, title: g.title, pages: g.pages.map((p) => ({ ...p, source: "kit" as const })) } : null;
  };
  const known = new Set(["start-here", "concepts", "packages-and-layers", "configuration", "guides"]);
  const rest = kitManifest.groups
    .filter((g) => !known.has(g.id))
    .map((g) => fromKit(g.id)!);
  const overview = kitManifest.groups.length
    ? [
        {
          slug: "overview",
          source: "kit" as const,
          file: "docs/README.md",
          title: "Documentation index",
          label: "Documentation index",
          description: "The index of the Mood Kit documentation.",
        },
      ]
    : [];
  return [
    { id: "kit", title: "Mood Kit", pages: overview },
    fromKit("start-here"),
    fromKit("concepts"),
    fromKit("packages-and-layers"),
    fromKit("configuration"),
    {
      id: "setup",
      title: "Set up a service",
      pages: SITE_PAGES.filter((p) => p.slug.startsWith("setup/")).map((p) => sitePage(p.slug)),
    },
    fromKit("guides"),
    {
      id: "agents",
      title: "Working with agents",
      pages: [
        sitePage("working-with-agents"),
        {
          slug: "agents-md",
          source: "kit" as const,
          file: "AGENTS.md",
          title: "AGENTS.md",
          label: "AGENTS.md",
          description: "The rules the Mood Kit code follows, for developers and coding agents.",
        },
      ],
    },
    ...rest,
  ].filter((g): g is KitGroupView => !!g && g.pages.length > 0);
}

/** Every docs page, in reading order. */
export function kitPageList(): KitPage[] {
  const seen = new Set<string>();
  return kitGroups()
    .flatMap((g) => g.pages)
    .filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)));
}

export function findKitPage(slug: string): KitPage | undefined {
  return kitPageList().find((p) => p.slug === slug);
}

/** Landing first, then docs: what prev/next walks. */
export interface KitStep {
  label: string;
  route: string;
}
export function kitSteps(): KitStep[] {
  return [
    { label: "Mood Kit", route: KIT_LANDING },
    ...kitPageList().map((p) => ({ label: p.label, route: routeForSlug(p.slug) })),
  ];
}

/** The same tree in the shape the sidebar and the mobile drawer already render. */
export const kitNavManifest: NavCategory[] = (() => {
  const toEntry = (p: KitPage): NavEntry => ({
    id: p.slug,
    label: p.label,
    route: routeForSlug(p.slug),
  });
  const groups = kitGroups();
  return groups.map((g, i) => ({
    id: `kit-${g.id}`,
    title: g.title,
    entries:
      i === 0
        ? [{ id: "kit-landing", label: "Overview", route: KIT_LANDING }, ...g.pages.map(toEntry)]
        : g.pages.map(toEntry),
  }));
})();

/**
 * Directory-like paths (`/kit/setup`, `/kit/packages`…) are small generated
 * index pages listing their section, so no URL under `/kit/` is ever a bare
 * directory on a static host.
 */
const SECTION_GROUPS: Record<string, string> = {
  concepts: "concepts",
  packages: "packages-and-layers",
  configuration: "configuration",
  guides: "guides",
  setup: "setup",
};
export interface KitSection {
  slug: string;
  title: string;
  description: string;
  pages: KitPage[];
}
export function kitSectionFor(slug: string): KitSection | null {
  const gid = SECTION_GROUPS[slug];
  const g = gid ? kitGroups().find((x) => x.id === gid) : undefined;
  if (!g) return null;
  return {
    slug,
    title: g.title,
    description: `Every page in the ${g.title} part of the Mood Kit documentation.`,
    pages: g.pages,
  };
}
export const kitSectionSlugs = () =>
  Object.keys(SECTION_GROUPS).filter((s) => kitSectionFor(s));

/** Routes to prerender and list in the sitemap. English only: Spanish shows the same text. */
export function kitDocRoutes(): string[] {
  return [
    ...kitPageList().map((p) => routeForSlug(p.slug)),
    ...kitSectionSlugs().map((s) => routeForSlug(s)),
  ];
}
