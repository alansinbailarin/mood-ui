#!/usr/bin/env node
/**
 * Consolidate 234 per-page i18n JSONs from the legacy showroom into
 * 12 category-grouped files per locale that @nuxtjs/i18n can lazy-load.
 *
 * Source (recovered from main into /tmp/showroom-legacy):
 *   src/showroom/i18n/locales/{en,es}/
 *     common.json
 *     doc.json
 *     pages/welcome.json
 *     pages/themeStudio.json
 *     pages/<category>/<componentName>.json
 *     pages/composables/<useThing>.json
 *
 * Target:
 *   apps/docs/i18n/locales/{en,es}/
 *     common.json        (= source common.json — shell strings)
 *     doc.json           (= source doc.json — ComponentDoc shared strings)
 *     welcome.json       (= source pages/welcome.json)
 *     theme-studio.json  (= source pages/themeStudio.json)
 *     forms.json
 *     feedback.json
 *     data-display.json  (merges pages/data-display + pages/dataDisplay)
 *     layout.json
 *     navigation.json
 *     composables.json
 *     utilities.json
 *     templates.json
 *     docs.json
 *
 * Inside the grouped files, keys preserve the original semantic path:
 *
 *   forms.json:
 *     {
 *       "pages": {
 *         "forms": {
 *           "button": { ... },
 *           "buttonGroup": { ... },
 *           ...
 *         }
 *       }
 *     }
 *
 * So existing `t('pages.forms.button.title')` calls keep working after the
 * migration as long as Nuxt loads all category files into the same locale.
 *
 * Run: node scripts/consolidate-i18n.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_BASE = "/tmp/showroom-legacy/src/showroom/i18n/locales";
const DEST_BASE = join(ROOT, "apps/docs/i18n/locales");

const LOCALES = ["en", "es"];

/** category id (filename) ← source path matcher */
const CATEGORY_MAP = {
  forms:           ["pages/forms"],
  feedback:        ["pages/feedback"],
  "data-display":  ["pages/data-display", "pages/dataDisplay"],
  layout:          ["pages/layout"],
  navigation:      ["pages/navigation"],
  composables:     ["pages/composables"],
  utilities:       ["pages/utilities"],
  templates:       ["pages/templates"],
  docs:            ["pages/docs"],
  welcome:         ["pages/welcome.json"],
  "theme-studio":  ["pages/themeStudio.json"],
};

/**
 * Files copied directly into the locale (no `pages.*` nesting).
 *
 * `common.json` is special: its keys merge at the locale root (so the
 * legacy `t('home')`, `t('components')`, … shortcuts still work). Every
 * other root-level file is wrapped under its filename as a namespace,
 * matching the behaviour of the legacy showroom's i18n loader:
 *
 *   locales/en/doc.json → messages.en.doc.*
 *
 * Without the wrap, `t('doc.section.overview')` would resolve to a
 * literal `doc.section.overview` string because the merge would put
 * `section` at the root of the locale.
 */
const ROOT_FILES = [
  { src: "common.json", wrap: false },
  { src: "doc.json", wrap: true, key: "doc" },
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Deep-merge object b into a; primitive collisions on b win. */
function merge(a, b) {
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) {
      a[k] = a[k] || {};
      merge(a[k], b[k]);
    } else {
      a[k] = b[k];
    }
  }
  return a;
}

/** Walk a directory tree and return absolute paths of every .json file. */
function* walkJson(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* walkJson(full);
    } else if (name.endsWith(".json")) {
      yield full;
    }
  }
}

/**
 * Reconstruct the nested key path that the legacy `vue-i18n` would have
 * assembled from the file's location. For
 *   pages/forms/button.json  →  pages.forms.button
 *   pages/composables/useToast.json → pages.composables.useToast
 *   pages/welcome.json → pages.welcome
 */
function keyPathFromRelative(rel) {
  // Strip the `.json` suffix and split on path separators.
  const noExt = rel.replace(/\.json$/, "");
  return noExt.split("/");
}

/** Wrap a JSON value inside a nested object built from `keyPath`. */
function nest(keyPath, value) {
  let out = value;
  for (let i = keyPath.length - 1; i >= 0; i--) {
    out = { [keyPath[i]]: out };
  }
  return out;
}

/**
 * Like `nest`, but if the value already starts with the same nesting as
 * `keyPath` (e.g. file at `pages/themeStudio.json` whose contents are
 * `{ pages: { themeStudio: { … } } }`), return the value as-is to avoid
 * doubling the prefix. Some legacy files were wrapped, others weren't —
 * this normalises both shapes into the same merged tree.
 */
function smartNest(keyPath, value) {
  let probe = value;
  let matches = true;
  for (const k of keyPath) {
    if (probe && typeof probe === "object" && k in probe && Object.keys(probe).length === 1) {
      probe = probe[k];
    } else {
      matches = false;
      break;
    }
  }
  return matches ? value : nest(keyPath, value);
}

function consolidateLocale(locale) {
  const srcDir = join(SRC_BASE, locale);
  const destDir = join(DEST_BASE, locale);
  mkdirSync(destDir, { recursive: true });

  let totalSource = 0;
  let totalGroups = 0;

  // 1) Root files: common.json plain, doc.json wrapped under `doc.*`
  for (const entry of ROOT_FILES) {
    const src = join(srcDir, entry.src);
    if (!existsSync(src)) continue;
    const dst = join(destDir, entry.src);
    const raw = readJson(src);
    const out = entry.wrap ? { [entry.key]: raw } : raw;
    writeFileSync(dst, JSON.stringify(out, null, 2) + "\n");
    totalSource++;
    totalGroups++;
    console.log(`  ${locale}/${entry.src} ← ${entry.src}${entry.wrap ? ` (wrapped under "${entry.key}.")` : ""}`);
  }

  // 2) Category-grouped files
  for (const [categoryId, sources] of Object.entries(CATEGORY_MAP)) {
    let merged = {};
    let count = 0;

    for (const source of sources) {
      const srcPath = join(srcDir, source);
      if (!existsSync(srcPath)) continue;

      const st = statSync(srcPath);
      if (st.isFile()) {
        // Direct .json: nest under the path implied by `source` — unless
        // the file already wraps its own contents under the same path
        // (themeStudio.json does this; welcome.json does not).
        const rel = source;
        const keyPath = keyPathFromRelative(rel);
        const value = readJson(srcPath);
        merged = merge(merged, smartNest(keyPath, value));
        count++;
        totalSource++;
      } else if (st.isDirectory()) {
        // Walk the dir and accumulate each file under its semantic path
        for (const filePath of walkJson(srcPath)) {
          const rel = relative(srcDir, filePath);
          const keyPath = keyPathFromRelative(rel);
          const value = readJson(filePath);
          merged = merge(merged, smartNest(keyPath, value));
          count++;
          totalSource++;
        }
      }
    }

    if (count === 0) continue;
    const dst = join(destDir, `${categoryId}.json`);
    writeFileSync(dst, JSON.stringify(merged, null, 2) + "\n");
    totalGroups++;
    console.log(`  ${locale}/${categoryId}.json ← ${count} file(s)`);
  }

  return { totalSource, totalGroups };
}

console.log("Consolidating i18n into apps/docs/i18n/locales/");
let grandSource = 0;
let grandGroups = 0;
for (const locale of LOCALES) {
  console.log(`\n[${locale}]`);
  const { totalSource, totalGroups } = consolidateLocale(locale);
  grandSource += totalSource;
  grandGroups += totalGroups;
}
console.log(`\nDone. ${grandSource} source files → ${grandGroups} consolidated files.`);
