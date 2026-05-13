# llms.txt for mood-ui — Design

**Date:** 2026-05-13
**Author:** Alan Pacheco
**Status:** Draft (pending user review)

## Problem

External AI agents (Claude, Cursor, Copilot, etc.) cannot reliably author code
that uses `mood-ui` because they have no compact, structured reference of the
library's public API. Crawling the showroom HTML is lossy, training-data
snapshots get stale, and there is no canonical entry point an AI can fetch.

## Goal

Publish two markdown files at the showroom's web root, following the
[llmstxt.org](https://llmstxt.org) standard:

- `https://mood-ui.com/llms.txt` — short index (~80 lines) with links into
  the full reference.
- `https://mood-ui.com/llms-full.txt` — full plain-text reference: every
  exported component, composable, and config type with props, JSDoc,
  defaults, emits, and referenced sub-types.

Both files are **auto-generated** from source on every showroom build, so
they cannot drift from the API.

## Non-goals

- Usage examples extracted from showroom pages (deferred to phase 2).
- Spanish translation (llms.txt convention is English; the showroom keeps its
  bilingual UI).
- A custom MCP server (separate future initiative).
- Bundling the files inside the npm `mood-ui` package — they live only on the
  showroom site.

## Audience and content split

| File | Audience | Length target |
|---|---|---|
| `llms.txt` | AI doing a quick lookup; index only | < 4 KB |
| `llms-full.txt` | AI authoring code or contributing; full API | 60–150 KB |

`llms-full.txt` covers BOTH usage and contribution context (philosophy,
naming convention, `ModoProvider` setup, theming) so a single fetch is
enough for any task.

## Architecture

### File layout

```
apps/showroom/
  public/
    llms.txt              ← generated, gitignored
    llms-full.txt         ← generated, gitignored
  scripts/
    generate-llms.ts      ← entry point
    llms/
      extract-exports.ts  ← parses packages/mood-ui/src/index.ts
      extract-props.ts    ← parses *.interface.ts via ts-morph
      extract-composables.ts ← parses composables/*.ts via ts-morph
      render.ts           ← writes markdown
      template.md         ← static curated content (intro, philosophy, setup)
  nuxt.config.ts          ← hook 'build:before' invokes the generator
```

### Pipeline

1. **extract-exports.ts** reads `packages/mood-ui/src/index.ts` and classifies
   each export as `component | composable | type | constant`. The component
   set drives prop extraction; the composable set drives composable
   extraction.
2. **extract-props.ts** opens each component's interface file
   (`packages/mood-ui/src/interfaces/<group>/<Name>.interface.ts`) with
   `ts-morph` and produces, per component:
   - description, resolved with this fallback chain:
     1. i18n key `pages.<group>.<kebabName>.description` from
        `apps/showroom/i18n/locales/en/pages/<group>/<kebab-name>.json`
        (curated, complete sentences — preferred source),
     2. JSDoc on the main interface,
     3. JSDoc at file top,
     4. empty + warning logged.
   - list of props `{ name, type, optional, defaultValue, description }`,
   - exported helper types used in props (e.g. `AvatarVariant`, `AvatarProvider`),
   - emits list (parsed from a sibling `<Name>Emits` interface when present;
     otherwise empty — emits will be added later as interfaces standardise).
3. **extract-composables.ts** opens each composable file
   (`packages/mood-ui/src/composables/*.ts`) and extracts the exported
   function signature + JSDoc for each name that appeared in step 1.
4. **render.ts** combines the static `template.md` (intro, install,
   `ModoProvider` setup, theming, philosophy) with the dynamic sections, and
   writes both output files.

### Generation trigger

`nuxt.config.ts` registers a `build:before` hook that spawns the generator
with `tsx`. The script also has a CLI entry so it can be invoked manually
(`pnpm --filter showroom generate:llms`) for local verification.

The hook runs on every `nuxt build` / `nuxt generate`, which is what Vercel
invokes for the showroom deploy. No CI changes required.

### gitignore

`apps/showroom/public/llms.txt` and `llms-full.txt` are added to the
showroom's `.gitignore`. They are pure build artefacts.

## Output format

### llms.txt

```
# mood-ui

> Vue 3 + TypeScript + Tailwind CSS component library.
> Bring-your-own-AI: mood-ui never calls AI providers directly —
> developers pass provider functions for AI features.

## Quick start
- [Installation](https://mood-ui.com/llms-full.txt#installation)
- [ModoProvider setup](https://mood-ui.com/llms-full.txt#modoprovider)
- [Theming](https://mood-ui.com/llms-full.txt#theming)

## Components
- [AvatarUpload](https://mood-ui.com/llms-full.txt#avatarupload) — short description
- [Button](https://mood-ui.com/llms-full.txt#button) — short description
- ...

## Composables
- [useToast](https://mood-ui.com/llms-full.txt#usetoast) — short description
- ...

## Types
- [ModoConfig](https://mood-ui.com/llms-full.txt#modoconfig)
- ...
```

### llms-full.txt

```markdown
# mood-ui — Full Reference

## Installation
[from template.md]

## ModoProvider
[from template.md]

## Theming
[from template.md]

## Components

### AvatarUpload
Avatar with upload + AI generation. (JSDoc-derived.)

**Import:**
    import { AvatarUpload } from 'mood-ui'

**Props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| modelValue | string | — | Current avatar URL or base64 (v-model). |
| ai | boolean | false | Enable AI generation features. |
| ...

**Referenced types:**
    type AvatarVariant = 'default' | 'realistic' | ...
    type AvatarProvider = (
      options: { prompt?: string; image?: File; variant?: string },
      signal?: AbortSignal,
    ) => Promise<string>

**Emits:**
- save(payload: AvatarSavePayload)

---

### Button
...

## Composables

### useToast
[signature + JSDoc]

...
```

Anchor convention: lowercase component name, no spaces (`#avatarupload`,
`#usetoast`). This is what GitHub-flavored Markdown produces by default.

## Static template content (template.md)

Hand-written sections that don't change per-component, written in English:

1. **Installation** — `npm install mood-ui`, peer-dependency on Vue 3 and
   Tailwind, CSS import line.
2. **ModoProvider** — minimal example showing `<ModoProvider :config="...">`
   wrapping the app, and the typed `ModoConfig` shape.
3. **Theming** — light/dark via `useColorMode`, palettes, surfaces, CSS
   variables.
4. **Philosophy** — bring-your-own-AI rule, no `M` prefix on components,
   provider pattern.
5. **Conventions** — `withDefaults(defineProps<…>(), {…})`, `provide/inject`
   with `InjectionKey`, locale via `useModoLocale()`.

## Verification

- Type-check the generator: `pnpm --filter showroom exec vue-tsc --noEmit -p scripts/tsconfig.json`.
- Smoke-run the generator locally. Assertions in the script:
  - every name exported by `packages/mood-ui/src/index.ts` as a component or
    composable appears in the output (fail the build otherwise);
  - no prop row contains the literal type string `unknown` or `any`
    (warn, do not fail);
  - `llms-full.txt` total size is under 200 KB (warn at 150 KB).
- Manual diff: check that AvatarUpload, Button, and useToast all render
  correctly as a sanity sample before merging.

## Risk and trade-offs

- **JSDoc discipline.** Components whose `.interface.ts` lacks JSDoc on
  props will render with empty description cells. Mitigation: the
  verification step lists those props in the build log so they get fixed
  incrementally.
- **ts-morph adds ~5 MB to devDependencies.** Acceptable given the
  alternative (hand-rolled TS-compiler walking) is ~4x the code.
- **Template drift.** The hand-written `template.md` can become stale if
  the install / `ModoProvider` story changes. Mitigation: it's a single
  short file, and reviewers will notice during showroom updates.
- **Emits coverage.** The current codebase doesn't have a uniform
  `<Name>Emits` interface convention; emits will appear only where one
  exists. Documenting this gap is acceptable for phase 1.

## Phase 2 (out of scope here)

- Extract first `<CodePreview>` block per page as an "Example" section.
- A `pnpm run llms:check` GitHub Action that diffs the generated output on PRs.
- Publish the same files inside the npm package for offline AI usage.
