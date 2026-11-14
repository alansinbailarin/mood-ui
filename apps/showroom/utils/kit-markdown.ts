/**
 * Renders a kit doc (markdown) to HTML. Server side in a static generate: the
 * output lands in the page payload, so the browser never runs this code.
 *
 * - Relative links between docs become routes of the Kit section.
 * - Headings get GitHub-style ids, so `#anchor` links written for GitHub work.
 * - Fenced code is highlighted with Shiki (light and dark in one pass).
 * - `> [!NOTE]`, `> [!UNVERIFIED]` and `> [!SOON]` blockquotes become callouts.
 */
import MarkdownIt from "markdown-it";
import type { Highlighter } from "shiki";
import {
  createSlugger,
  resolveLink,
  routeForSlug,
  stripInline,
} from "./kit-docs";

export interface RenderedHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface RenderedDoc {
  html: string;
  headings: RenderedHeading[];
  /** Every heading id of any level, for checking `#anchor` links. */
  anchors: string[];
  /** Relative links that point at nothing the site renders. */
  unresolved: string[];
}

export interface RenderOptions {
  /** Repo file the markdown came from, to resolve its relative links. */
  file: string;
  knownSlugs: ReadonlySet<string>;
  /** `""` for English, `"/es"` for Spanish: prefix of internal links. */
  localePrefix?: string;
}

const LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "bash",
  env: "dotenv",
  yml: "yaml",
  txt: "text",
  plaintext: "text",
};
const LANGS = [
  "php",
  "bash",
  "dotenv",
  "json",
  "typescript",
  "javascript",
  "vue",
  "sql",
  "ini",
  "nginx",
  "csv",
  "yaml",
  "html",
  "css",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= import("shiki").then(({ createHighlighter }) =>
    createHighlighter({
      themes: ["github-light-default", "github-dark-default"],
      langs: [...LANGS],
    }),
  );
  return highlighterPromise;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CALLOUTS: Record<string, string> = {
  NOTE: "Note",
  UNVERIFIED: "Unverified",
  SOON: "Coming soon",
};

export async function renderKitMarkdown(
  markdown: string,
  opts: RenderOptions,
): Promise<RenderedDoc> {
  const hl = await getHighlighter();
  const loaded = new Set(hl.getLoadedLanguages());

  const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

  md.options.highlight = (code, rawLang) => {
    const lang = LANG_ALIASES[rawLang] ?? rawLang;
    const out = loaded.has(lang)
      ? hl.codeToHtml(code.replace(/\n$/, ""), {
          lang,
          themes: { light: "github-light-default", dark: "github-dark-default" },
          defaultColor: false,
        })
      : `<pre class="shiki"><code>${esc(code.replace(/\n$/, ""))}</code></pre>`;
    return out;
  };
  // Wrap the highlighted pre so it can scroll on its own and carry its language.
  md.renderer.rules.fence = (tokens, idx, options) => {
    const t = tokens[idx]!;
    const lang = t.info.trim().split(/\s+/)[0] ?? "";
    const body = options.highlight!(t.content, lang, "");
    return `<div class="kit-code"${lang ? ` data-lang="${esc(lang)}"` : ""}>${body}</div>\n`;
  };

  md.renderer.rules.table_open = () => '<div class="kit-table-wrap"><table>\n';
  md.renderer.rules.table_close = () => "</table></div>\n";

  const headings: RenderedHeading[] = [];
  const anchors: string[] = [];
  const unresolved: string[] = [];
  const slug = createSlugger();

  // Core pass over tokens: drop the H1, name the headings, build callouts.
  md.core.ruler.push("kit", (state) => {
    const tokens = state.tokens;
    const h1 = tokens.findIndex((t) => t.type === "heading_open" && t.tag === "h1");
    if (h1 !== -1) tokens.splice(h1, 3);

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (!t) continue;
      if (t.type === "heading_open") {
        const text = stripInline(tokens[i + 1]?.content ?? "");
        const id = slug(text);
        t.attrSet("id", id);
        t.meta = { id };
        anchors.push(id);
        if (t.tag === "h2" || t.tag === "h3") {
          headings.push({ id, text, level: t.tag === "h2" ? 2 : 3 });
        }
      }
      if (
        t.type === "blockquote_open" &&
        tokens[i + 1]?.type === "paragraph_open" &&
        tokens[i + 2]?.type === "inline"
      ) {
        const inline = tokens[i + 2]!;
        const m = /^\[!(NOTE|UNVERIFIED|SOON)\]\s*/.exec(inline.content);
        if (m) {
          t.attrSet("data-callout", (m[1] ?? "").toLowerCase());
          t.attrSet("data-label", CALLOUTS[m[1] ?? ""] ?? "");
          inline.content = inline.content.slice(m[0].length);
          const first = inline.children?.[0];
          if (first?.type === "text") first.content = first.content.replace(/^\[!\w+\]\s*/, "");
        }
      }
    }
  });

  // Anchor on each heading.
  const defaultRender = (tokens: any[], idx: number, options: any, _env: any, self: any) =>
    self.renderToken(tokens, idx, options);
  md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
    let j = idx - 1;
    while (j >= 0 && tokens[j]?.type !== "heading_open") j--;
    const id = tokens[j]?.meta?.id as string | undefined;
    const anchor = id
      ? `<a class="kit-anchor" href="#${esc(id)}" aria-label="Link to this section">#</a>`
      : "";
    return anchor + defaultRender(tokens, idx, options, env, self);
  };

  // Links.
  const stack: boolean[] = [];
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const t = tokens[idx]!;
    const href = t.attrGet("href") ?? "";
    const target = resolveLink(opts.file, href, opts.knownSlugs);
    const prefix = opts.localePrefix ?? "";
    switch (target.kind) {
      case "external":
        t.attrSet("target", "_blank");
        t.attrSet("rel", "noopener noreferrer");
        stack.push(true);
        break;
      case "anchor":
        stack.push(true);
        break;
      case "page":
        t.attrSet("href", `${prefix}${routeForSlug(target.slug)}${target.hash}`);
        t.attrSet("data-kit-link", "");
        stack.push(true);
        break;
      case "site":
        t.attrSet("href", `${prefix}${target.href}`);
        t.attrSet("data-kit-link", "");
        stack.push(true);
        break;
      default:
        unresolved.push(href);
        t.tag = "span";
        t.attrs = [["class", "kit-unresolved"], ["title", "This file is in the kit repository, not in these docs."]];
        stack.push(false);
    }
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules.link_close = (tokens, idx, options, _env, self) => {
    const isLink = stack.pop();
    if (!isLink) tokens[idx]!.tag = "span";
    return self.renderToken(tokens, idx, options);
  };

  const html = md.render(markdown);
  return { html, headings, anchors, unresolved };
}
