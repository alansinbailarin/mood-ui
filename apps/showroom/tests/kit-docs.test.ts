// apps/showroom/tests/kit-docs.test.ts
// The Kit section's pure logic, run against the real synced docs in
// content/kit/: slugs, link resolution, heading anchors, the sidebar tree and
// the "Let an agent do it" coverage. If the kit changes a doc, `pnpm kit:sync`
// then this suite says what broke.
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  buildManifest,
  canonicalPath,
  createSlugger,
  extractDescription,
  extractTitle,
  isKitPath,
  resolveLink,
  resolveRepoPath,
  slugForFile,
  slugFromPath,
} from "../utils/kit-docs";
import { renderKitMarkdown } from "../utils/kit-markdown";
import { agentBlockFor, agentPrompt, AGENT_PAGE_SLUGS } from "../utils/kit-agents";
import { kitDocRoutes, kitPageList, kitSteps, kitGroups } from "../utils/kit-nav";
import { KIT_BUY_URL, KIT_FAQ_IDS } from "../utils/kit-config";

const ROOT = resolve(__dirname, "../content");

function walk(dir: string, base = ""): string[] {
  return readdirSync(join(dir, base)).flatMap((n) => {
    const rel = base ? `${base}/${n}` : n;
    return statSync(join(dir, rel)).isDirectory() ? walk(dir, rel) : [rel];
  });
}
const kitFiles = Object.fromEntries(
  walk(join(ROOT, "kit"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => [f, readFileSync(join(ROOT, "kit", f), "utf8")]),
);
const siteFiles = Object.fromEntries(
  walk(join(ROOT, "kit-site")).map((f) => [f, readFileSync(join(ROOT, "kit-site", f), "utf8")]),
);
const pages = kitPageList();
const known = new Set(pages.map((p) => p.slug));

describe("paths and slugs", () => {
  it("maps repo files to slugs", () => {
    expect(slugForFile("docs/README.md")).toBe("overview");
    expect(slugForFile("docs/packages/auth.md")).toBe("packages/auth");
    expect(slugForFile("AGENTS.md")).toBe("agents-md");
    expect(slugForFile("backend/x.md")).toBeNull();
    expect(slugForFile("docs/diagram.png")).toBeNull();
  });
  it("strips the locale and recognizes kit paths", () => {
    expect(canonicalPath("/es/kit/packages/auth/")).toBe("/kit/packages/auth");
    expect(slugFromPath("/es/kit/packages/auth")).toBe("packages/auth");
    expect(isKitPath("/es/nuxt-saas-boilerplate")).toBe(true);
    expect(isKitPath("/forms/button")).toBe(false);
  });
  it("resolves relative paths and refuses to leave the repo", () => {
    expect(resolveRepoPath("docs/packages/auth.md", "../concepts/multi-tenancy.md")).toBe("docs/concepts/multi-tenancy.md");
    expect(resolveRepoPath("docs/packages/auth.md", "../../../x.md")).toBeNull();
  });
  it("classifies links", () => {
    const k = new Set(["packages/auth", "agents-md"]);
    expect(resolveLink("docs/guides/x.md", "../packages/auth.md#me", k)).toEqual({ kind: "page", slug: "packages/auth", hash: "#me" });
    expect(resolveLink("docs/README.md", "../AGENTS.md", k)).toEqual({ kind: "page", slug: "agents-md", hash: "" });
    expect(resolveLink("docs/x.md", "https://stripe.com", k).kind).toBe("external");
    expect(resolveLink("docs/x.md", "#a", k).kind).toBe("anchor");
    expect(resolveLink("docs/x.md", "../backend/a.php", k).kind).toBe("unresolved");
  });
  it("slugs headings like GitHub, with repeats numbered", () => {
    const s = createSlugger();
    expect(s("The .env file")).toBe("the-env-file");
    expect(s("Local: MinIO")).toBe("local-minio");
    expect(s("Setup")).toBe("setup");
    expect(s("Setup")).toBe("setup-1");
  });
  it("extracts a title and a one-line description", () => {
    const md = "# The `.env` file\n\nOne **bold** [link](x.md) text.\n\n## Next";
    expect(extractTitle(md)).toBe("The .env file");
    expect(extractDescription(md)).toBe("One bold link text.");
  });
});

describe("synced kit docs", () => {
  it("has the manifest and a copy of every page it lists", () => {
    expect(existsSync(join(ROOT, "kit/manifest.json"))).toBe(true);
    for (const p of pages.filter((p) => p.source === "kit")) {
      expect(kitFiles[p.file], p.file).toBeDefined();
    }
  });
  it("the manifest matches what the sync script would write", () => {
    const files = Object.fromEntries(Object.entries(kitFiles).filter(([f]) => f !== "manifest.json"));
    const manifest = JSON.parse(kitFiles["manifest.json"] ?? readFileSync(join(ROOT, "kit/manifest.json"), "utf8"));
    const { manifest: fresh, missingFromIndex, brokenIndexLinks } = buildManifest(files, manifest.source);
    expect(fresh).toEqual(manifest);
    expect(brokenIndexLinks).toEqual([]);
    expect(missingFromIndex).toEqual([]);
  });
  it("every page has a title and a description", () => {
    for (const p of pages) {
      expect(p.title, p.slug).not.toBe("");
      expect(p.description, p.slug).not.toBe("");
      expect(p.description.length, p.slug).toBeLessThanOrEqual(160);
    }
  });
});

describe("rendering", () => {
  it("every relative link and in-page anchor of every page resolves", async () => {
    const heads = new Map<string, Set<string>>();
    const rendered = new Map<string, Awaited<ReturnType<typeof renderKitMarkdown>>>();
    for (const p of pages) {
      const src = (p.source === "kit" ? kitFiles[p.file] : siteFiles[p.file]) ?? "";
      const r = await renderKitMarkdown(src, { file: p.source === "kit" ? p.file : `site/${p.file}`, knownSlugs: known });
      rendered.set(p.slug, r);
      heads.set(p.slug, new Set(r.anchors));
    }
    const problems: string[] = [];
    for (const [slug, r] of rendered) {
      expect(r.unresolved, `${slug} links to files the site does not render`).toEqual([]);
      for (const m of r.html.matchAll(/href="([^"]+)"/g)) {
        const href = (m[1] ?? "").replace(/&amp;/g, "&");
        const [path, hash] = href.split("#");
        if (/^https?:/.test(href)) continue;
        const target = !path ? slug : slugFromPath(path);
        if (!target || !known.has(target)) {
          problems.push(`${slug}: ${href} is not a page`);
          continue;
        }
        if (hash && !heads.get(target)!.has(hash)) problems.push(`${slug}: ${href} has no such heading`);
      }
    }
    expect(problems).toEqual([]);
  }, 60_000);

  it("highlights code, wraps tables, builds callouts and drops the H1", async () => {
    const md = "# Title\n\n## Part\n\n```php\necho 1;\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n> [!UNVERIFIED] Check this.\n";
    const r = await renderKitMarkdown(md, { file: "docs/x.md", knownSlugs: known });
    expect(r.html).not.toContain("<h1");
    expect(r.html).toContain("shiki");
    expect(r.html).toContain("kit-table-wrap");
    expect(r.html).toContain('data-callout="unverified"');
    expect(r.html).not.toContain("[!UNVERIFIED]");
    expect(r.headings).toEqual([{ id: "part", text: "Part", level: 2 }]);
  });
  it("prefixes internal links for the Spanish site", async () => {
    const r = await renderKitMarkdown("# T\n\n[x](packages/auth.md)", { file: "docs/README.md", knownSlugs: known, localePrefix: "/es" });
    expect(r.html).toContain('href="/es/kit/packages/auth"');
  });
});

describe("navigation", () => {
  it("lists every kit doc exactly once", () => {
    const slugs = pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const f of Object.keys(kitFiles).filter((f) => f.endsWith(".md"))) {
      expect(slugs, f).toContain(slugForFile(f));
    }
  });
  it("has the sections the design spec asks for", () => {
    const titles = kitGroups().map((g) => g.title);
    expect(titles).toEqual(expect.arrayContaining(["Concepts", "Configuration", "Set up a service", "Modules", "Working with agents"]));
  });
  it("walks the landing, then every page, once", () => {
    const steps = kitSteps();
    expect(steps[0]?.route).toBe("/nuxt-saas-boilerplate");
    expect(steps.length).toBe(pages.length + 1);
  });
  it("prerenders English routes and leaves the stub out of the sitemap list", () => {
    expect(kitDocRoutes()).toContain("/kit/getting-started");
    expect(kitDocRoutes()).toContain("/kit/setup/stripe");
  });
});

describe("Let an agent do it", () => {
  it("is on Getting started and every configuration page", () => {
    const config = pages.filter((p) => p.slug.startsWith("configuration/")).map((p) => p.slug);
    for (const slug of ["getting-started", ...config, ...pages.filter((p) => p.slug.startsWith("setup/")).map((p) => p.slug)]) {
      expect(agentBlockFor(slug), slug).not.toBeNull();
    }
    expect(AGENT_PAGE_SLUGS.every((s) => known.has(s))).toBe(true);
  });
  it("points at AGENTS.md and refuses real secrets", () => {
    const prompt = agentPrompt(agentBlockFor("configuration/stripe")!);
    expect(prompt).toContain("AGENTS.md");
    expect(prompt).toContain("docs/configuration/stripe.md");
    expect(prompt).toMatch(/Never read, print or invent real secrets/);
  });
  it("every setup page has Local and Production parts and flags what is unverified", () => {
    for (const [f, src] of Object.entries(siteFiles).filter(([f]) => f.startsWith("setup/"))) {
      expect(src, f).toMatch(/^## Local$/m);
      expect(src, f).toMatch(/^## Production$/m);
      expect(src, f).toContain("[!UNVERIFIED] This section will be verified when the configuration guide is finalized.");
    }
  });
});

describe("landing", () => {
  it("keeps the buy link a placeholder until the owner sets it, and has Spanish copy for every FAQ", () => {
    expect(KIT_BUY_URL).toContain("TODO");
    for (const l of ["en", "es"]) {
      const kit = JSON.parse(readFileSync(resolve(__dirname, `../i18n/locales/${l}/kit.json`), "utf8")).kit;
      for (const id of KIT_FAQ_IDS) {
        expect(kit.landing.faq[id].q, `${l}.${id}`).toBeTruthy();
        expect(kit.landing.faq[id].a, `${l}.${id}`).toBeTruthy();
      }
      expect(kit.agent.title).toBe(l === "es" ? "Hazlo con un agente" : "Let an agent do it");
      expect(kit.landing.seo.description.length).toBeLessThanOrEqual(165);
    }
  });
});
