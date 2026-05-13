import { Project } from "ts-morph";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type ExportKind = "component" | "composable" | "type" | "constant";

export interface ExportRecord {
  name: string;
  kind: ExportKind;
  /** Source module path as written in index.ts (without leading "./"). */
  sourcePath: string;
  /** Group inferred from sourcePath: "forms", "feedback", etc. "" for top-level. */
  group: string;
}

const LIB_ROOT = resolve(__dirname, "../../../../packages/mood-ui/src");

export function extractExports(): ExportRecord[] {
  const project = new Project({
    tsConfigFilePath: resolve(LIB_ROOT, "../tsconfig.lib.json"),
    skipAddingFilesFromTsConfig: true,
  });
  const indexFile = project.addSourceFileAtPath(resolve(LIB_ROOT, "index.ts"));
  const records: ExportRecord[] = [];
  const seen = new Set<string>();

  for (const decl of indexFile.getExportDeclarations()) {
    const module = decl.getModuleSpecifierValue();
    if (!module) continue;
    const sourcePath = module.replace(/^\.\//, "");
    const group = inferGroup(sourcePath);
    const declIsTypeOnly = decl.isTypeOnly();

    for (const named of decl.getNamedExports()) {
      const exportedName = named.getAliasNode()?.getText() ?? named.getName();
      if (seen.has(exportedName)) continue;
      seen.add(exportedName);

      const isTypeOnly = declIsTypeOnly || named.isTypeOnly();
      const kind = classify(exportedName, sourcePath, isTypeOnly);
      records.push({ name: exportedName, kind, sourcePath, group });
    }
  }
  return records;
}

function inferGroup(sourcePath: string): string {
  const m = sourcePath.match(/^(?:components|interfaces)\/([^/]+)\//);
  return m?.[1] ?? "";
}

function classify(name: string, sourcePath: string, isTypeOnly: boolean): ExportKind {
  if (isTypeOnly) return "type";
  if (sourcePath.endsWith(".vue")) return "component";
  if (sourcePath.includes("/components/")) return "component";
  if (name.startsWith("use") && /^use[A-Z]/.test(name)) return "composable";
  return "constant";
}
