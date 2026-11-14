/**
 * Pure helpers for the Kit docs section. No Nuxt, no Node APIs: both the sync
 * script (`scripts/sync-kit-docs.ts`) and the app import this file, and the
 * tests run it as is.
 *
 * Vocabulary:
 *  - "file"  a path inside the kit repo, posix, relative to its root
 *            (`docs/packages/auth.md`, `AGENTS.md`).
 *  - "slug"  the page's path below `/kit/` (`packages/auth`, `agents-md`).
 */

export const KIT_BASE = "/kit";

/** The landing page. Its URL follows the SEO spec, not the docs tree. */
export const KIT_LANDING = "/nuxt-saas-boilerplate";

/** Repo file for the agents rules, rendered as a docs page. */
export const AGENTS_FILE = "AGENTS.md";

/** Maps a kit repo file to its page slug, or null for files that are not pages. */
export function slugForFile(file: string): string | null {
  if (file === AGENTS_FILE) return "agents-md";
  if (!file.startsWith("docs/") || !file.endsWith(".md")) return null;
  const rel = file.slice("docs/".length, -".md".length);
  return rel === "README" ? "overview" : rel;
}

export function routeForSlug(slug: string): string {
  return `${KIT_BASE}/${slug}`;
}

/** Strips a locale prefix and a trailing slash: `/es/kit/x/` -> `/kit/x`. */
export function canonicalPath(path: string): string {
  const noLocale = path.replace(/^\/es(?=\/|$)/, "") || "/";
  return noLocale.length > 1 ? noLocale.replace(/\/$/, "") : noLocale;
}

/** The slug of a `/kit/...` path, or null when the path is not a kit docs page. */
export function slugFromPath(path: string): string | null {
  const p = canonicalPath(path);
  if (!p.startsWith(`${KIT_BASE}/`)) return null;
  return p.slice(KIT_BASE.length + 1) || null;
}

/** True for the landing and every docs page: they share the Kit sidebar. */
export function isKitPath(path: string): boolean {
  const p = canonicalPath(path);
  return p === KIT_LANDING || p === KIT_BASE || p.startsWith(`${KIT_BASE}/`);
}

function dirname(file: string): string {
  const i = file.lastIndexOf("/");
  return i === -1 ? "" : file.slice(0, i);
}

/** Resolves `href` against the directory of `fromFile`, collapsing `.` and `..`. */
export function resolveRepoPath(fromFile: string, href: string): string | null {
  const parts = (href.startsWith("/") ? "" : dirname(fromFile))
    .split("/")
    .filter(Boolean);
  for (const seg of href.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      if (parts.length === 0) return null; // climbs out of the repo
      parts.pop();
    } else parts.push(seg);
  }
  return parts.join("/");
}

export type LinkTarget =
  | { kind: "external"; href: string }
  | { kind: "anchor"; hash: string }
  | { kind: "site"; href: string }
  | { kind: "page"; slug: string; hash: string }
  | { kind: "unresolved"; href: string };

/**
 * Classifies a markdown link found in `fromFile`. `knownSlugs` decides whether
 * a relative `.md` link points at a page the site renders.
 */
export function resolveLink(
  fromFile: string,
  href: string,
  knownSlugs: ReadonlySet<string>,
): LinkTarget {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) {
    return { kind: "external", href };
  }
  if (href.startsWith("#")) return { kind: "anchor", hash: href };
  // Site-authored pages link to the site by absolute path: `/kit/...`.
  if (href.startsWith("/")) return { kind: "site", href };
  const [pathPart = "", ...rest] = href.split("#");
  const hash = rest.length ? `#${rest.join("#")}` : "";
  const target = resolveRepoPath(fromFile, pathPart);
  const slug = target ? slugForFile(target) : null;
  if (slug && knownSlugs.has(slug)) return { kind: "page", slug, hash };
  return { kind: "unresolved", href };
}

/** GitHub-style heading id, with `-1`, `-2`… for repeats within a page. */
export function createSlugger(): (text: string) => string {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s/g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}

/** First level-1 heading of a markdown file. */
export function extractTitle(markdown: string): string {
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^#\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) return stripInline(m[1] ?? "");
  }
  return "";
}

/** Plain text of an inline markdown fragment: no code ticks, links or emphasis. */
export function stripInline(s: string): string {
  // Code spans are kept literally (an underscore in `A_B_C` is not emphasis),
  // so split on them and strip emphasis only from the text between.
  return s
    .split(/(`[^`]*`)/)
    .map((part) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 1
        ? part.slice(1, -1)
        : part
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
            .replace(/(\*\*|__|\*|_)(.+?)\1/g, "$2"),
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** First prose paragraph, flattened and cut at a word boundary for a meta description. */
export function extractDescription(markdown: string, max = 158): string {
  const lines = markdown.split("\n");
  let i = 0;
  let inFence = false;
  const para: string[] = [];
  for (; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const isProse =
      line.trim() !== "" && !/^(#|>|\||[-*+]\s|\d+\.\s|<)/.test(line.trim());
    if (isProse) para.push(line.trim());
    else if (para.length) break;
  }
  const text = stripInline(para.join(" "));
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export interface KitPageMeta {
  slug: string;
  /** Repo file the page was copied from. */
  file: string;
  /** H1 of the file. */
  title: string;
  /** Short label for the sidebar, from the docs index. */
  label: string;
  description: string;
}

export interface KitGroup {
  id: string;
  title: string;
  pages: KitPageMeta[];
}

export interface KitManifest {
  source: { commit: string; ref: string; dirty: boolean };
  groups: KitGroup[];
}

/**
 * Reads the docs index (`docs/README.md`) for the order of the sidebar: each
 * `## Heading` is a group and each bullet's first `.md` link is a page. A
 * page the index forgets lands in the last group, so a new doc is never
 * silently dropped. `missingFromIndex` lists them, for the sync report.
 */
export function buildManifest(
  files: Record<string, string>,
  source: KitManifest["source"],
): { manifest: KitManifest; missingFromIndex: string[]; brokenIndexLinks: string[] } {
  const readme = files["docs/README.md"] ?? "";
  const groups: KitGroup[] = [];
  const placed = new Set<string>();
  const brokenIndexLinks: string[] = [];
  let current: KitGroup | null = null;

  const metaFor = (file: string, label?: string): KitPageMeta | null => {
    const slug = slugForFile(file);
    const text = files[file];
    if (!slug || text === undefined) return null;
    const title = extractTitle(text);
    return {
      slug,
      file,
      title,
      label: label ?? title,
      description: extractDescription(text),
    };
  };

  for (const line of readme.split("\n")) {
    const h = /^##\s+(.+)$/.exec(line);
    if (h) {
      current = {
        id: createSlugger()(stripInline(h[1] ?? "")),
        title: stripInline(h[1] ?? ""),
        pages: [],
      };
      groups.push(current);
      continue;
    }
    const li = /^-\s+\[([^\]]+)\]\(([^)#]+\.md)(?:#[^)]*)?\)/.exec(line);
    if (!li || !current) continue;
    const href = li[2] ?? "";
    const file = resolveRepoPath("docs/README.md", href);
    const page = file ? metaFor(file, stripInline(li[1] ?? "")) : null;
    if (!file || !page) {
      brokenIndexLinks.push(href);
      continue;
    }
    if (!placed.has(file)) {
      placed.add(file);
      current.pages.push(page);
    }
  }

  const missingFromIndex = Object.keys(files)
    .filter((f) => f.startsWith("docs/") && f !== "docs/README.md" && !placed.has(f))
    .sort();
  if (missingFromIndex.length) {
    const extra: KitGroup = { id: "more", title: "More", pages: [] };
    for (const f of missingFromIndex) {
      const p = metaFor(f);
      if (p) extra.pages.push(p);
    }
    groups.push(extra);
  }

  return {
    manifest: { source, groups: groups.filter((g) => g.pages.length) },
    missingFromIndex,
    brokenIndexLinks,
  };
}
