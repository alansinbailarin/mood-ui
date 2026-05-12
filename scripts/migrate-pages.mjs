#!/usr/bin/env node
/**
 * Bulk-migrate the showroom's XxxPage.vue files to Nuxt's file-based
 * pages tree. Uses docs/migration/hash-route-map.json as the source of
 * truth for source → destination paths so the URLs match what was
 * promised in Fase 0.
 *
 * For every page that has not been migrated by hand yet (button.vue is
 * the manually-validated pilot), the script:
 *
 *   1. Reads the legacy file from /tmp/showroom-legacy/.
 *   2. Rewrites its imports:
 *      - `../../components/<x>.vue`            → `~/components/<x>.vue`
 *        (these point at the shared doc primitives ComponentDoc,
 *        ComponentPreview, etc. that already live in apps/docs/)
 *      - `../../../components/<dir>/<X>.vue`   → consolidated into a
 *        single `import { X, Y } from "mood-ui"` import. Same for
 *        `../../../composables/...` lib composables.
 *      - `../../types`                         → `~/types/component-doc`
 *      - `../../composables/useDocToc`         → `~/composables/useDocToc`
 *      - `../../composables/useHighlighter`    → `~/composables/useHighlighter`
 *   3. Injects a `useSeoMeta(...)` + `useHead(...)` block right after
 *      `const { t } = useI18n();`. Titles come from
 *      `pages.<category>.<id>.title` and descriptions from
 *      `pages.<category>.<id>.description`, which after Fase 2's
 *      consolidation live in the matching category JSON (forms.json,
 *      feedback.json, …) but keep their original semantic key path.
 *
 * Pages skipped (handled by hand later):
 *   - welcome           — landing, will be reformed in Fase 6
 *   - theme-studio      — entire page goes under <ClientOnly>
 *   - introduction, installation, theming, i18n, accessibility,
 *     changelog — docs/ pages use DocPage, not ComponentDoc; need a
 *     slightly different SEO block
 *
 * Run: node scripts/migrate-pages.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_ROOT = "/tmp/showroom-legacy/src/showroom/pages";
const DEST_PAGES = join(ROOT, "apps/docs/pages");
const MAP_PATH = join(ROOT, "docs/migration/hash-route-map.json");

const map = JSON.parse(readFileSync(MAP_PATH, "utf8"));

const SKIP_IDS = new Set([
  "welcome",
  "theme-studio",
  "introduction",
  "installation",
  "theming",
  "i18n",
  "accessibility",
  "changelog",
]);

// Derive the i18n key namespace from the legacy pageFile path.
// `pageFile: "forms/ButtonPage.vue"` → namespace `pages.forms.button`
// `pageFile: "composables/UseToastPage.vue"` → `pages.composables.useToast`
// Calendar / date-picker pages live in data-display/ on disk but use
// pages.dataDisplay.* in the legacy JSONs; the same camelCase path is
// preserved by the i18n consolidation script.
function i18nNamespace(pageFile) {
  // strip "Page.vue" and convert the basename to camelCase
  const m = pageFile.match(/^([^/]+)\/(.+)Page\.vue$/);
  if (!m) return null;
  const [, dir, base] = m;
  const dirKey =
    dir === "data-display"
      ? "dataDisplay"
      : dir;
  // PascalCase basename → camelCase by lowering the first char
  const baseKey = base.charAt(0).toLowerCase() + base.slice(1);
  return `pages.${dirKey}.${baseKey}`;
}

function transformImports(content) {
  // Collect lib-side specifiers from the legacy explicit imports.
  const libSpecifiers = new Set();

  // 1) Default imports of single .vue / .ts files from the library tree
  //    e.g.  import Button from "../../../components/forms/Button.vue";
  //          import { useToast } from "../../../composables/useToast";
  content = content.replace(
    /^import\s+(\w+)\s+from\s+["']\.\.\/\.\.\/\.\.\/components\/[^"']+\.vue["'];?\s*$/gm,
    (_, name) => {
      libSpecifiers.add(name);
      return ""; // drop, we'll rewrite as a single mood-ui import
    },
  );
  content = content.replace(
    /^import\s+\{\s*([^}]+)\}\s+from\s+["']\.\.\/\.\.\/\.\.\/composables\/[^"']+["'];?\s*$/gm,
    (_, names) => {
      for (const n of names.split(",").map((s) => s.trim()).filter(Boolean)) {
        libSpecifiers.add(n);
      }
      return "";
    },
  );
  content = content.replace(
    /^import\s+\{\s*([^}]+)\}\s+from\s+["']\.\.\/\.\.\/\.\.\/[^"']+["'];?\s*$/gm,
    (_, names) => {
      // catch-all for any other named import from the lib (e.g. types, config).
      for (const n of names.split(",").map((s) => s.trim()).filter(Boolean)) {
        libSpecifiers.add(n);
      }
      return "";
    },
  );

  // 2) Shared showroom doc primitives — now live in apps/docs/components/
  content = content.replace(
    /from\s+["']\.\.\/\.\.\/components\/([^"']+)["']/g,
    (_, rest) => `from "~/components/${rest}"`,
  );

  // 3) Showroom composables → moved to apps/docs/composables/
  content = content.replace(
    /from\s+["']\.\.\/\.\.\/composables\/(useDocToc|useHighlighter)["']/g,
    (_, name) => `from "~/composables/${name}"`,
  );

  // 4) Showroom types
  content = content.replace(
    /from\s+["']\.\.\/\.\.\/types["']/g,
    `from "~/types/component-doc"`,
  );

  // 5) Synthesize the consolidated mood-ui import line.
  if (libSpecifiers.size > 0) {
    const list = Array.from(libSpecifiers).sort().join(", ");
    const newImport = `import { ${list} } from "mood-ui";\n`;
    // Insert after the existing `from "vue"` line if present, else after
    // the first `import` statement so it stays adjacent to other imports.
    if (content.includes('from "vue"') || content.includes("from 'vue'")) {
      content = content.replace(
        /(from ['"]vue['"];?\s*\n)/,
        (m) => m + newImport,
      );
    } else {
      content = content.replace(
        /(^import [^\n]+;?\s*\n)/m,
        (m) => m + newImport,
      );
    }
  }

  return content;
}

function injectSeo(content, namespace) {
  const seoBlock = `
useSeoMeta({
  title: () => t("${namespace}.title"),
  description: () => t("${namespace}.description"),
  ogTitle: () => \`\${t("${namespace}.title")} · mood-ui\`,
  ogDescription: () => t("${namespace}.description"),
});
`;
  // After `const { t } = useI18n();` — that line exists in every page.
  if (!content.includes("const { t } = useI18n()")) return content;
  return content.replace(
    /(const\s*\{\s*t\s*\}\s*=\s*useI18n\(\);?\s*\n)/,
    (m) => m + seoBlock,
  );
}

function destPath(route) {
  // route '/forms/button' → apps/docs/pages/forms/button.vue
  // route '/'              → apps/docs/pages/index.vue (handled by skip)
  if (route === "/") return join(DEST_PAGES, "index.vue");
  return join(DEST_PAGES, route.slice(1) + ".vue");
}

let migrated = 0;
let skipped = 0;
let missing = 0;

for (const [id, info] of Object.entries(map.redirects)) {
  if (SKIP_IDS.has(id)) {
    skipped++;
    continue;
  }
  const src = join(SRC_ROOT, info.pageFile);
  if (!existsSync(src)) {
    console.log(`  ⚠️  ${info.pageFile} not found in legacy tree — skipping`);
    missing++;
    continue;
  }
  const dst = destPath(info.route);

  // Don't overwrite the manual pilot.
  if (existsSync(dst) && id === "button") {
    console.log(`  · ${info.route} (pilot, keep)`);
    skipped++;
    continue;
  }

  let content = readFileSync(src, "utf8");
  content = transformImports(content);

  const ns = i18nNamespace(info.pageFile);
  if (ns) content = injectSeo(content, ns);

  mkdirSync(dirname(dst), { recursive: true });
  writeFileSync(dst, content);
  migrated++;
  console.log(`  ✓ ${info.pageFile} → ${info.route}`);
}

console.log(`\nDone. ${migrated} migrated, ${skipped} skipped, ${missing} missing.`);
