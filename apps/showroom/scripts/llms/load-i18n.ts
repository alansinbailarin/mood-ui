import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_EN = resolve(__dirname, "../../i18n/locales/en");

interface I18nNode { [key: string]: I18nNode | string; }

let mergedCache: I18nNode | null = null;

function loadMerged(): I18nNode {
  if (mergedCache) return mergedCache;
  const merged: I18nNode = {};
  for (const file of readdirSync(I18N_EN)) {
    if (!file.endsWith(".json")) continue;
    const data = JSON.parse(readFileSync(resolve(I18N_EN, file), "utf8")) as I18nNode;
    deepMerge(merged, data);
  }
  mergedCache = merged;
  return merged;
}

function deepMerge(target: I18nNode, source: I18nNode): void {
  for (const [k, v] of Object.entries(source)) {
    if (typeof v === "string") {
      target[k] = v;
    } else {
      if (typeof target[k] !== "object" || target[k] === null) target[k] = {};
      deepMerge(target[k] as I18nNode, v);
    }
  }
}

/**
 * Look up a dotted key in the merged i18n tree.
 * Returns undefined when missing.
 */
export function i18nLookup(dottedKey: string): string | undefined {
  const parts = dottedKey.split(".");
  let cursor: I18nNode | string | undefined = loadMerged();
  for (const p of parts) {
    if (typeof cursor !== "object" || cursor === null) return undefined;
    cursor = cursor[p];
  }
  return typeof cursor === "string" ? cursor : undefined;
}

/** Convert PascalCase → camelCase. */
export function toCamelKey(pascal: string): string {
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
