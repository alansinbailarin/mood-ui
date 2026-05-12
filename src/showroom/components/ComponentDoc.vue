<script setup lang="ts">
import {
  ref,
  provide,
  inject,
  onMounted,
  watch,
  nextTick,
  computed,
} from "vue";
import { useI18n } from "vue-i18n";
import Typography from "../../components/data-display/Typography.vue";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { createDocToc, DOC_TOC_KEY } from "../composables/useDocToc";
import { showroomNav } from "../registry";
import { useShowroomRouter } from "../composables/useShowroomRouter";
import type { PropDoc, EmitDoc, SlotDoc } from "../types";

const props = defineProps<{
  title: string;
  category: string;
  description: string;
  importPath: string;
  propsList?: PropDoc[];
  emitsList?: EmitDoc[];
  slotsList?: SlotDoc[];
}>();

const { t, locale } = useI18n();
const copied = ref(false);

// ── Prev / Next navigation ────────────────────────────────────────────────────
const { currentId, go } = useShowroomRouter();

// Flat ordered list of all component entries (exclude non-component categories)
const HIDDEN = new Set([
  "getting-started",
  "docs",
  "templates",
  "theme-studio",
]);
const allEntries = showroomNav
  .filter((c) => !HIDDEN.has(c.id))
  .flatMap((c) => c.entries);

const currentIdx = computed(() =>
  allEntries.findIndex((e) => e.id === currentId.value),
);
const prevEntry = computed(() =>
  currentIdx.value > 0 ? allEntries[currentIdx.value - 1] : null,
);
const nextEntry = computed(() =>
  currentIdx.value < allEntries.length - 1
    ? allEntries[currentIdx.value + 1]
    : null,
);

function copyImport() {
  navigator.clipboard.writeText(props.importPath).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });
}

// ── TOC ──────────────────────────────────────────────────────────────────────
// Prefer the toc provided by a parent (DocsShell), fall back to own instance
// when rendered standalone (e.g. tests / storybook).
const toc = inject(DOC_TOC_KEY, null) ?? createDocToc();
provide(DOC_TOC_KEY, toc);

import { useSlots } from "vue";
const slots = useSlots();

// Re-register fixed sections when locale changes (labels are translated).
// Called synchronously at setup time so the fixed sections (Overview, Examples,
// API Reference, A11y) are always registered BEFORE child ComponentPreview
// instances run their onMounted — Vue mounts children before the parent, so
// without this the examples would appear first in the TOC.
function registerFixedSections() {
  toc.register({ id: "overview", label: t("doc.section.overview"), level: 1 });
  if (slots.examples)
    toc.register({
      id: "examples",
      label: t("doc.section.examples"),
      level: 1,
    });
  if (slots.extra)
    toc.register({ id: "extra", label: t("doc.section.types"), level: 1 });
  // a11y before API so the order matches the page layout
  if (slots.a11y)
    toc.register({ id: "a11y", label: t("doc.section.a11y"), level: 1 });
  const hasApi =
    props.propsList?.length ||
    props.emitsList?.length ||
    props.slotsList?.length;
  if (hasApi) {
    toc.register({ id: "api", label: t("doc.section.api"), level: 1 });
    if (props.propsList?.length)
      toc.register({
        id: "api-props",
        label: t("doc.section.props"),
        level: 2,
        parentId: "api",
      });
    if (props.emitsList?.length)
      toc.register({
        id: "api-emits",
        label: t("doc.section.emits"),
        level: 2,
        parentId: "api",
      });
    if (props.slotsList?.length)
      toc.register({
        id: "api-slots",
        label: t("doc.section.slots"),
        level: 2,
        parentId: "api",
      });
  }
}

// Register immediately (synchronous) — children mount after this returns.
registerFixedSections();
watch(locale, () => registerFixedSections());

onMounted(() => {
  nextTick(() => {
    // anchor on initial hash
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      el?.scrollIntoView({
        behavior: "instant" as ScrollBehavior,
        block: "start",
      });
    }
  });
});
</script>

<template>
  <article class="flex-1 min-w-0 flex flex-col gap-12 pb-12">
    <!-- Header -->
    <header class="flex flex-col gap-4">
      <Typography variant="overline" size="medium" color="muted">
        {{ category }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ title }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ description }}
      </Typography>
      <button
        type="button"
        class="self-start flex items-center gap-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 px-3 py-1.5 transition-colors group cursor-pointer"
        @click="copyImport"
      >
        <code class="text-xs font-mono text-foreground select-none">{{
          importPath
        }}</code>
        <Transition name="icon-swap" mode="out-in">
          <CheckIcon
            v-if="copied"
            key="check"
            class="size-3.5 text-success shrink-0"
          />
          <ClipboardIcon
            v-else
            key="clip"
            class="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
          />
        </Transition>
      </button>
    </header>

    <!-- Overview -->
    <section id="overview" class="flex flex-col gap-4 scroll-mt-20">
      <Typography variant="heading" size="large" weight="medium" as="h2">{{
        t("doc.section.overview")
      }}</Typography>
      <slot name="overview" />
    </section>

    <!-- Examples -->
    <section
      v-if="$slots.examples"
      id="examples"
      class="flex flex-col gap-6 scroll-mt-20"
    >
      <Typography variant="heading" size="large" weight="medium" as="h2">{{
        t("doc.section.examples")
      }}</Typography>
      <div class="flex flex-col gap-8">
        <slot name="examples" />
      </div>
    </section>

    <!-- Extra content (Types, custom sections) -->
    <section
      v-if="$slots.extra"
      id="extra"
      class="flex flex-col gap-4 scroll-mt-20"
    >
      <slot name="extra" />
    </section>

    <!-- Accessibility notes -->
    <section
      v-if="$slots.a11y"
      id="a11y"
      class="flex flex-col gap-6 scroll-mt-20"
    >
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("doc.section.a11y") }}
      </Typography>
      <slot name="a11y" />
    </section>

    <!-- API Reference -->
    <section
      v-if="propsList?.length || emitsList?.length || slotsList?.length"
      id="api"
      class="flex flex-col gap-8 scroll-mt-20"
    >
      <Typography variant="heading" size="large" weight="medium" as="h2">{{
        t("doc.section.api")
      }}</Typography>

      <div
        v-if="propsList?.length"
        id="api-props"
        class="flex flex-col gap-3 scroll-mt-20"
      >
        <Typography variant="title" size="medium" weight="medium" as="h3">{{
          t("doc.section.props")
        }}</Typography>
        <div class="rounded-xl border border-border overflow-auto">
          <table class="w-full text-sm min-w-[580px]">
            <thead class="bg-muted/30 border-b border-border">
              <tr>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32"
                >
                  {{ t("doc.col.prop") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {{ t("doc.col.type") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28"
                >
                  {{ t("doc.col.default") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {{ t("doc.col.description") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in propsList"
                :key="p.name"
                class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3 whitespace-nowrap">
                  <code class="text-xs font-mono text-primary">{{
                    p.name
                  }}</code>
                  <span
                    v-if="p.required"
                    class="ml-1.5 text-[10px] text-danger font-semibold uppercase tracking-wide"
                    >req</span
                  >
                </td>
                <td class="px-4 py-3">
                  <code
                    class="text-xs font-mono text-muted-foreground break-all"
                    >{{ p.type }}</code
                  >
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <code
                    v-if="p.default"
                    class="text-xs font-mono text-muted-foreground"
                    >{{ p.default }}</code
                  >
                  <span v-else class="text-xs text-muted-foreground/40">—</span>
                </td>
                <td
                  class="px-4 py-3 text-xs text-foreground/80 leading-relaxed"
                >
                  {{ p.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="emitsList?.length"
        id="api-emits"
        class="flex flex-col gap-3 scroll-mt-20"
      >
        <Typography variant="title" size="medium" weight="medium" as="h3">{{
          t("doc.section.emits")
        }}</Typography>
        <div class="rounded-xl border border-border overflow-auto">
          <table class="w-full text-sm min-w-[400px]">
            <thead class="bg-muted/30 border-b border-border">
              <tr>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32"
                >
                  {{ t("doc.col.event") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-36"
                >
                  {{ t("doc.col.payload") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {{ t("doc.col.description") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in emitsList"
                :key="e.name"
                class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3">
                  <code class="text-xs font-mono text-primary">{{
                    e.name
                  }}</code>
                </td>
                <td class="px-4 py-3">
                  <code class="text-xs font-mono text-muted-foreground">{{
                    e.payload ?? "—"
                  }}</code>
                </td>
                <td
                  class="px-4 py-3 text-xs text-foreground/80 leading-relaxed"
                >
                  {{ e.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="slotsList?.length"
        id="api-slots"
        class="flex flex-col gap-3 scroll-mt-20"
      >
        <Typography variant="title" size="medium" weight="medium" as="h3">{{
          t("doc.section.slots")
        }}</Typography>
        <div class="rounded-xl border border-border overflow-auto">
          <table class="w-full text-sm min-w-[400px]">
            <thead class="bg-muted/30 border-b border-border">
              <tr>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32"
                >
                  {{ t("doc.col.slot") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-40"
                >
                  {{ t("doc.col.bindings") }}
                </th>
                <th
                  class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {{ t("doc.col.description") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in slotsList"
                :key="s.name"
                class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td class="px-4 py-3">
                  <code class="text-xs font-mono text-primary">{{
                    s.name
                  }}</code>
                </td>
                <td class="px-4 py-3">
                  <code
                    v-if="s.bindings"
                    class="text-xs font-mono text-muted-foreground"
                    >{{ s.bindings }}</code
                  >
                  <span v-else class="text-xs text-muted-foreground/40">—</span>
                </td>
                <td
                  class="px-4 py-3 text-xs text-foreground/80 leading-relaxed"
                >
                  {{ s.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ── Page footer: prev/next + npm + issue ─────────────────── -->
    <footer class="flex flex-col gap-8 pt-4 border-t border-border">
      <!-- Prev / Next -->
      <div class="flex items-stretch gap-4">
        <button
          v-if="prevEntry"
          type="button"
          class="group flex-1 flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer"
          @click="go(prevEntry.id)"
        >
          <ChevronLeftIcon
            class="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
          />
          <div class="flex flex-col gap-0.5 min-w-0">
            <span
              class="text-[11px] text-muted-foreground uppercase tracking-wide"
              >{{ t("doc.prev") }}</span
            >
            <span class="text-sm font-medium text-foreground truncate">{{
              prevEntry.label
            }}</span>
          </div>
        </button>
        <div v-else class="flex-1" />

        <button
          v-if="nextEntry"
          type="button"
          class="group flex-1 flex items-center justify-end gap-3 rounded-xl border border-border px-4 py-3 text-right hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer"
          @click="go(nextEntry.id)"
        >
          <div class="flex flex-col gap-0.5 min-w-0">
            <span
              class="text-[11px] text-muted-foreground uppercase tracking-wide"
              >{{ t("doc.next") }}</span
            >
            <span class="text-sm font-medium text-foreground truncate">{{
              nextEntry.label
            }}</span>
          </div>
          <ChevronRightIcon
            class="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"
          />
        </button>
        <div v-else class="flex-1" />
      </div>
    </footer>
  </article>
</template>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
