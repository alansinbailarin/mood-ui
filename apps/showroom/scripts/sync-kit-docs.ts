/**
 * Copies the Mood Kit's buyer docs into the showroom, so the site renders them
 * without forking the text.
 *
 *   pnpm --filter showroom kit:sync                       # kit at ../mood-kit, its HEAD
 *   pnpm --filter showroom kit:sync -- --ref v0.3.0       # a tag, branch or commit
 *   pnpm --filter showroom kit:sync -- --working-tree     # uncommitted edits too
 *   pnpm --filter showroom kit:sync -- --kit /path/to/mood-kit
 *   MOOD_KIT_DIR=/path/to/mood-kit pnpm --filter showroom kit:sync
 *
 * Reads `docs/**\/*.md` and `AGENTS.md` and writes them, byte for byte, to
 * `apps/showroom/content/kit/`, next to a `manifest.json` (sidebar order,
 * titles, descriptions, and the kit commit they came from). Files the kit no
 * longer has are deleted. Review `git diff content/kit` and commit it.
 *
 * Never edit `content/kit/` by hand: the next sync overwrites it. Site-only
 * pages (setup, working with agents) live in `content/kit-site/`.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AGENTS_FILE, buildManifest } from "../utils/kit-docs.js";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../content/kit");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

const kitDir = resolve(
  arg("kit") ?? process.env.MOOD_KIT_DIR ?? resolve(here, "../../../../mood-kit"),
);
const ref = arg("ref") ?? "HEAD";
const workingTree = process.argv.includes("--working-tree");

function git(...args: string[]): string {
  return execFileSync("git", ["-C", kitDir, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

if (!existsSync(join(kitDir, "docs"))) {
  console.error(
    `No kit docs at ${kitDir}/docs. Pass --kit <path> or set MOOD_KIT_DIR.`,
  );
  process.exit(1);
}

const isDocFile = (f: string) =>
  f === AGENTS_FILE || (f.startsWith("docs/") && f.endsWith(".md"));

function walk(dir: string, base = ""): string[] {
  return readdirSync(join(dir, base)).flatMap((name) => {
    const rel = base ? `${base}/${name}` : name;
    return statSync(join(dir, rel)).isDirectory() ? walk(dir, rel) : [rel];
  });
}

const files: Record<string, string> = {};
if (workingTree) {
  for (const f of [...walk(kitDir, "docs").map((r) => r), AGENTS_FILE]) {
    if (isDocFile(f)) files[f] = readFileSync(join(kitDir, f), "utf8");
  }
} else {
  const listed = git("ls-tree", "-r", "--name-only", ref, "--", "docs", AGENTS_FILE)
    .split("\n")
    .filter(isDocFile);
  for (const f of listed) files[f] = git("show", `${ref}:${f}`);
}

const commit = git("rev-parse", "--short=12", workingTree ? "HEAD" : ref).trim();
const dirty = workingTree && git("status", "--porcelain", "--", "docs", AGENTS_FILE).trim() !== "";

rmSync(OUT, { recursive: true, force: true });
for (const [f, text] of Object.entries(files)) {
  const dest = join(OUT, f);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, text);
}

const { manifest, missingFromIndex, brokenIndexLinks } = buildManifest(files, {
  commit,
  ref: workingTree ? "working-tree" : ref,
  dirty,
});
writeFileSync(join(OUT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const count = Object.keys(files).length;
console.log(`Synced ${count} files from ${kitDir} @ ${commit}${dirty ? " (+ uncommitted edits)" : ""}.`);
if (missingFromIndex.length) {
  console.warn(`Not in docs/README.md, added under "More": ${missingFromIndex.join(", ")}`);
}
if (brokenIndexLinks.length) {
  console.warn(`docs/README.md links to files that do not exist: ${brokenIndexLinks.join(", ")}`);
}
