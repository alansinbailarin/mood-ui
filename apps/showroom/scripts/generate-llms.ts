import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractExports } from "./llms/extract-exports.js";
import { extractComponent } from "./llms/extract-props.js";
import { extractComposable } from "./llms/extract-composables.js";
import { renderShortIndex, renderFull } from "./llms/render.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "../public");

async function main(): Promise<void> {
  const exports = extractExports();
  const componentRecords = exports.filter(e => e.kind === "component");
  const composableRecords = exports.filter(e => e.kind === "composable");

  const components = componentRecords.map(e =>
    extractComponent(e.name, e.group, e.sourcePath),
  );

  const composables = composableRecords
    .map(e => extractComposable(e.name))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  components.sort((a, b) => a.name.localeCompare(b.name));
  composables.sort((a, b) => a.name.localeCompare(b.name));

  const missingComposables = composableRecords
    .map(e => e.name)
    .filter(name => !composables.some(c => c.name === name));
  if (missingComposables.length > 0) {
    console.error("[llms] FATAL: missing composable docs:", missingComposables);
    process.exit(1);
  }

  const noDesc = components.filter(c => !c.description).map(c => c.name);
  if (noDesc.length > 0) {
    console.warn(`[llms] WARN: ${noDesc.length} components have no description: ${noDesc.join(", ")}`);
  }

  const noProps = components.filter(c => c.props.length === 0).map(c => c.name);
  if (noProps.length > 0) {
    console.warn(`[llms] WARN: ${noProps.length} components have no props (no interface file or empty interface): ${noProps.join(", ")}`);
  }

  const shortText = renderShortIndex({ components, composables });
  const fullText = renderFull({ components, composables });

  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(resolve(PUBLIC_DIR, "llms.txt"), shortText, "utf8");
  writeFileSync(resolve(PUBLIC_DIR, "llms-full.txt"), fullText, "utf8");

  const fullBytes = Buffer.byteLength(fullText, "utf8");
  const shortBytes = Buffer.byteLength(shortText, "utf8");
  if (fullBytes > 200 * 1024) {
    console.error(`[llms] FATAL: llms-full.txt is ${fullBytes} bytes (> 200KB cap)`);
    process.exit(1);
  }
  if (fullBytes > 150 * 1024) {
    console.warn(`[llms] WARN: llms-full.txt is ${fullBytes} bytes (> 150KB soft cap)`);
  }

  console.log(`[llms] OK — components=${components.length}, composables=${composables.length}, full=${fullBytes}B, short=${shortBytes}B`);
}

main().catch(err => {
  console.error("[llms] FAILED:", err);
  process.exit(1);
});
