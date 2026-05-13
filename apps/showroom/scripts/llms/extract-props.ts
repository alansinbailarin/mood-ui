import { Project, InterfaceDeclaration, JSDoc, SourceFile } from "ts-morph";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { i18nLookup, toCamelKey } from "./load-i18n.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_ROOT = resolve(__dirname, "../../../../packages/mood-ui/src");

export interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  description: string;
}

export interface ReferencedType {
  name: string;
  text: string;
}

export interface ComponentDoc {
  name: string;
  group: string;
  description: string;
  props: PropDoc[];
  referencedTypes: ReferencedType[];
}

const project = new Project({ skipAddingFilesFromTsConfig: true });

/**
 * Derive the interface file path from the export's sourcePath.
 * `components/forms/Button.vue` → `interfaces/forms/Button.interface.ts`
 * `components/data-display/calendar/Calendar.vue` → `interfaces/data-display/calendar/Calendar.interface.ts`
 * `components/ModoProvider.vue` → `interfaces/ModoProvider.interface.ts` (likely won't exist)
 */
function interfacePathFor(sourcePath: string, componentName: string): string {
  // Strip the leading components/ segment, replace filename with <Name>.interface.ts.
  const withoutComponents = sourcePath.replace(/^components\//, "");
  const withoutFile = withoutComponents.replace(/[^/]+$/, "");
  return resolve(LIB_ROOT, "interfaces", withoutFile + `${componentName}.interface.ts`);
}

export function extractComponent(
  componentName: string,
  group: string,
  sourcePath: string,
): ComponentDoc {
  const interfacePath = interfacePathFor(sourcePath, componentName);

  if (!existsSync(interfacePath)) {
    return {
      name: componentName,
      group,
      description: resolveDescription(componentName, group, undefined, undefined),
      props: [],
      referencedTypes: [],
    };
  }

  const source = project.addSourceFileAtPath(interfacePath);
  // The primary interface is the one whose name matches the component.
  const mainInterface =
    source.getInterface(componentName) ?? source.getInterfaces()[0];
  const props = mainInterface ? extractProps(mainInterface) : [];
  const referencedTypes = collectReferencedTypes(source, mainInterface);
  const fileLeading = source.getStatements()[0]
    ?.getLeadingCommentRanges()[0]
    ?.getText();

  return {
    name: componentName,
    group,
    description: resolveDescription(componentName, group, mainInterface, fileLeading),
    props,
    referencedTypes,
  };
}

function extractProps(iface: InterfaceDeclaration): PropDoc[] {
  return iface.getProperties().map(prop => ({
    name: prop.getName(),
    type: prop.getTypeNode()?.getText() ?? prop.getType().getText(),
    optional: prop.hasQuestionToken(),
    description: jsdocText(prop.getJsDocs()),
  }));
}

function collectReferencedTypes(
  source: SourceFile,
  mainInterface: InterfaceDeclaration | undefined,
): ReferencedType[] {
  if (!mainInterface) return [];
  const out: ReferencedType[] = [];
  const seen = new Set<string>([mainInterface.getName()]);

  const refNames = new Set<string>();
  for (const prop of mainInterface.getProperties()) {
    const typeText = prop.getTypeNode()?.getText() ?? "";
    for (const id of typeText.matchAll(/\b([A-Z][A-Za-z0-9_]*)\b/g)) {
      refNames.add(id[1]);
    }
  }

  for (const alias of source.getTypeAliases()) {
    if (seen.has(alias.getName())) continue;
    if (!refNames.has(alias.getName())) continue;
    if (!alias.isExported()) continue;
    out.push({ name: alias.getName(), text: alias.getText() });
    seen.add(alias.getName());
  }
  for (const iface of source.getInterfaces()) {
    if (seen.has(iface.getName())) continue;
    if (!refNames.has(iface.getName())) continue;
    if (!iface.isExported()) continue;
    out.push({ name: iface.getName(), text: iface.getText() });
    seen.add(iface.getName());
  }
  return out;
}

function jsdocText(docs: JSDoc[]): string {
  if (docs.length === 0) return "";
  return docs
    .map(d => d.getDescription().trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

function resolveDescription(
  componentName: string,
  group: string,
  mainInterface: InterfaceDeclaration | undefined,
  fileLeadingComment: string | undefined,
): string {
  const i18nKey = `pages.${group}.${toCamelKey(componentName)}.description`;
  const fromI18n = i18nLookup(i18nKey);
  if (fromI18n) return fromI18n;

  if (mainInterface) {
    const fromIface = jsdocText(mainInterface.getJsDocs());
    if (fromIface) return fromIface;
  }

  if (fileLeadingComment) {
    const cleaned = fileLeadingComment
      .replace(/^\s*\/\*\*?|\*\/\s*$|\s*\*\s?/gm, "")
      .trim();
    if (cleaned) return cleaned;
  }

  return "";
}
