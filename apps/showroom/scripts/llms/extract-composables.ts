import { Project, FunctionDeclaration, VariableStatement } from "ts-morph";
import { existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB_ROOT = resolve(__dirname, "../../../../packages/mood-ui/src");
const COMPOSABLES_DIR = resolve(LIB_ROOT, "composables");

export interface ComposableDoc {
  name: string;
  signature: string;
  description: string;
}

const project = new Project({ skipAddingFilesFromTsConfig: true });

export function extractComposable(name: string): ComposableDoc | null {
  const direct = resolve(COMPOSABLES_DIR, `${name}.ts`);
  const candidates = existsSync(direct)
    ? [direct]
    : readdirSync(COMPOSABLES_DIR)
        .filter(f => f.endsWith(".ts"))
        .map(f => resolve(COMPOSABLES_DIR, f));

  for (const filePath of candidates) {
    const source = project.addSourceFileAtPath(filePath);
    const fn = source.getFunction(name);
    if (fn && fn.isExported()) {
      return { name, signature: signatureOf(fn), description: jsdocOfFn(fn) };
    }
    const variable = source.getVariableDeclaration(name);
    if (variable && variable.isExported()) {
      const stmt = variable.getVariableStatement();
      return {
        name,
        signature: `const ${name} = ${variable.getInitializer()?.getText() ?? "..."}`,
        description: stmt ? jsdocOfVar(stmt) : "",
      };
    }
  }
  return null;
}

function signatureOf(fn: FunctionDeclaration): string {
  const params = fn.getParameters().map(p => p.getText()).join(", ");
  const ret = fn.getReturnTypeNode()?.getText() ?? fn.getReturnType().getText();
  const generics = fn.getTypeParameters().map(t => t.getText()).join(", ");
  const genericPart = generics ? `<${generics}>` : "";
  return `function ${fn.getName()}${genericPart}(${params}): ${ret}`;
}

function jsdocOfFn(fn: FunctionDeclaration): string {
  return fn
    .getJsDocs()
    .map(d => d.getDescription().trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

function jsdocOfVar(stmt: VariableStatement): string {
  return stmt
    .getJsDocs()
    .map(d => d.getDescription().trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}
