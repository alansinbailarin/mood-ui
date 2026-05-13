import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentDoc } from "./extract-props.js";
import type { ComposableDoc } from "./extract-composables.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(__dirname, "template.md");
const FULL_BASE_URL = process.env.LLMS_BASE_URL ?? "https://mood-ui.com";

export interface RenderInput {
  components: ComponentDoc[];
  composables: ComposableDoc[];
}

export function renderShortIndex(input: RenderInput): string {
  const { components, composables } = input;
  const lines: string[] = [];
  lines.push("# mood-ui");
  lines.push("");
  lines.push("> Vue 3 + TypeScript + Tailwind CSS component library.");
  lines.push("> Bring-your-own-AI: mood-ui never calls AI providers directly —");
  lines.push("> developers pass provider functions for AI features.");
  lines.push("");
  lines.push("## Quick start");
  lines.push(`- [Installation](${FULL_BASE_URL}/llms-full.txt#installation)`);
  lines.push(`- [ModoProvider setup](${FULL_BASE_URL}/llms-full.txt#modoprovider)`);
  lines.push(`- [Theming](${FULL_BASE_URL}/llms-full.txt#theming)`);
  lines.push(`- [Philosophy](${FULL_BASE_URL}/llms-full.txt#philosophy)`);
  lines.push("");
  lines.push("## Components");
  for (const c of components) {
    const summary = firstSentence(c.description) || "—";
    lines.push(`- [${c.name}](${FULL_BASE_URL}/llms-full.txt#${anchor(c.name)}) — ${summary}`);
  }
  lines.push("");
  lines.push("## Composables");
  for (const c of composables) {
    const summary = firstSentence(c.description) || "—";
    lines.push(`- [${c.name}](${FULL_BASE_URL}/llms-full.txt#${anchor(c.name)}) — ${summary}`);
  }
  return lines.join("\n") + "\n";
}

export function renderFull(input: RenderInput): string {
  const template = readFileSync(TEMPLATE_PATH, "utf8");
  const out: string[] = [];
  out.push("# mood-ui — Full Reference");
  out.push("");
  out.push(template);
  out.push("");
  out.push("## Components");
  out.push("");
  for (const c of input.components) {
    out.push(renderComponent(c));
    out.push("");
    out.push("---");
    out.push("");
  }
  out.push("## Composables");
  out.push("");
  for (const c of input.composables) {
    out.push(renderComposable(c));
    out.push("");
    out.push("---");
    out.push("");
  }
  return out.join("\n");
}

function renderComponent(c: ComponentDoc): string {
  const lines: string[] = [];
  lines.push(`### ${c.name}`);
  lines.push("");
  if (c.description) lines.push(c.description);
  lines.push("");
  lines.push("**Import:**");
  lines.push("");
  lines.push("```ts");
  lines.push(`import { ${c.name} } from "mood-ui";`);
  lines.push("```");
  lines.push("");
  if (c.props.length > 0) {
    lines.push("**Props:**");
    lines.push("");
    lines.push("| Prop | Type | Required | Description |");
    lines.push("|---|---|---|---|");
    for (const p of c.props) {
      const desc = p.description.replace(/\|/g, "\\|").replace(/\n/g, " ");
      const type = p.type.replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(`| ${p.name} | \`${type}\` | ${p.optional ? "no" : "yes"} | ${desc || "—"} |`);
    }
    lines.push("");
  }
  if (c.referencedTypes.length > 0) {
    lines.push("**Referenced types:**");
    lines.push("");
    lines.push("```ts");
    for (const t of c.referencedTypes) {
      lines.push(t.text);
      lines.push("");
    }
    lines.push("```");
    lines.push("");
  }
  return lines.join("\n");
}

function renderComposable(c: ComposableDoc): string {
  const lines: string[] = [];
  lines.push(`### ${c.name}`);
  lines.push("");
  if (c.description) lines.push(c.description);
  lines.push("");
  lines.push("```ts");
  lines.push(c.signature);
  lines.push("```");
  return lines.join("\n");
}

function firstSentence(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?\n]+[.!?]?/);
  return (match?.[0] ?? trimmed).trim();
}

function anchor(name: string): string {
  return name.toLowerCase();
}
