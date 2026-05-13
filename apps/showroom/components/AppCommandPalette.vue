<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import {
  MagnifyingGlassIcon,
  HashtagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/vue/24/outline";
import { Modal } from "mood-ui";
import { navManifest, allEntries } from "~/utils/nav-manifest";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [v: boolean] }>();

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const router = useRouter();
const query = ref("");
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const listEl = ref<HTMLElement | null>(null);

function categoryForEntry(entryId: string): string {
  for (const cat of navManifest) {
    if (cat.entries.some((e) => e.id === entryId)) return cat.title;
  }
  return "";
}

const allItems = computed(() =>
  allEntries.map((e) => ({
    id: e.id,
    label: e.label,
    group: categoryForEntry(e.id),
    route: e.route,
  })),
);

function score(haystack: string, q: string): number {
  if (!q) return 1;
  const h = haystack.toLowerCase();
  const needle = q.toLowerCase();
  if (h === needle) return 100;
  if (h.startsWith(needle)) return 50;
  if (h.includes(needle)) return 25;
  return 0;
}

const filtered = computed(() => {
  const q = query.value.trim();
  return allItems.value
    .map((it) => ({ ...it, _score: score(it.label, q) + score(it.group, q) * 0.5 }))
    .filter((it) => it._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 30);
});

const grouped = computed(() => {
  const g = new Map<string, typeof filtered.value>();
  for (const it of filtered.value) {
    if (!g.has(it.group)) g.set(it.group, []);
    g.get(it.group)!.push(it);
  }
  return Array.from(g.entries());
});

const flatItems = computed(() => filtered.value);

function run(idx: number) {
  const it = flatItems.value[idx];
  if (!it) return;
  emit("update:modelValue", false);
  // Defer the navigation one tick so Modal's close transition has a chance
  // to start before Nuxt unmounts the source route. Without this the
  // Modal's leave animation gets cancelled mid-flight and the new page
  // flashes underneath the still-fading overlay.
  nextTick(() => router.push(it.route));
}

// All keyboard navigation hangs off the search input. Earlier this lived
// on a wrapper `<div @keydown>` and relied on bubbling from the input —
// which works in plain HTML but proved flaky inside the Modal/Teleport
// stack (the inner panel's own `@keydown` for Tab/Escape would land
// first and Enter never reached our handler). Binding directly to the
// input is both simpler and immune to that ordering.
function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, flatItems.value.length - 1);
    scrollActiveIntoView();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    scrollActiveIntoView();
  } else if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    run(activeIndex.value);
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const el = listEl.value?.querySelector<HTMLElement>(
      `[data-cmd-idx="${activeIndex.value}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  });
}

watch(open, async (v) => {
  if (v) {
    query.value = "";
    activeIndex.value = 0;
    await nextTick();
    inputEl.value?.focus();
  }
});

watch(filtered, () => {
  activeIndex.value = 0;
});

function onGlobalKeydown(e: KeyboardEvent) {
  const isMod = e.metaKey || e.ctrlKey;
  if (isMod && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    emit("update:modelValue", !props.modelValue);
  }
}

onMounted(() => window.addEventListener("keydown", onGlobalKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onGlobalKeydown));
</script>

<template>
  <Modal v-model="open" size="large" :show-close="false">
    <!-- The Modal body has `px-6 pt-6 pb-6`. Cancel it with negative
         margins so the search header, results, and footer hints can run
         edge-to-edge like every other command palette people are used
         to (Linear, Raycast, Notion). -->
    <div class="flex flex-col overflow-hidden -mx-6 -mt-6 -mb-6">
      <!-- Search header -->
      <div class="flex items-center gap-3 px-4 h-12 border-b border-border">
        <MagnifyingGlassIcon class="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          placeholder="Search components, docs, composables…"
          autocomplete="off"
          spellcheck="false"
          class="modo-field-native flex-1 bg-transparent border-0 text-sm placeholder:text-muted-foreground/70 appearance-none"
          @keydown="onKey"
        />
        <kbd
          class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border text-muted-foreground select-none"
        >
          ESC
        </kbd>
      </div>

      <!-- Results -->
      <div
        ref="listEl"
        class="max-h-[55vh] overflow-y-auto overscroll-contain py-2"
      >
        <div
          v-if="!flatItems.length"
          class="px-4 py-10 text-center"
        >
          <div class="text-sm text-foreground">No results for "{{ query }}"</div>
          <div class="text-xs text-muted-foreground mt-1">
            Try a different keyword or browse the sidebar.
          </div>
        </div>

        <div v-for="[group, items] in grouped" :key="group" class="px-2 pb-2 last:pb-1">
          <div
            class="px-2 pt-2 pb-1.5 text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground/80"
          >
            {{ group }}
          </div>
          <button
            v-for="it in items"
            :key="it.id"
            type="button"
            :data-cmd-idx="flatItems.indexOf(it)"
            class="w-full flex items-center gap-2.5 px-2.5 h-9 rounded-md text-left text-sm transition-colors select-none"
            :class="
              flatItems.indexOf(it) === activeIndex
                ? 'bg-primary/10 text-primary'
                : 'text-foreground'
            "
            @mouseenter="activeIndex = flatItems.indexOf(it)"
            @click="run(flatItems.indexOf(it))"
          >
            <HashtagIcon
              class="w-3.5 h-3.5 shrink-0"
              :class="
                flatItems.indexOf(it) === activeIndex
                  ? 'text-primary/80'
                  : 'text-muted-foreground'
              "
            />
            <span class="flex-1 truncate">{{ it.label }}</span>
            <kbd
              v-if="flatItems.indexOf(it) === activeIndex"
              class="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-primary/70"
              aria-hidden="true"
            >
              ↵ Open
            </kbd>
          </button>
        </div>
      </div>

      <!-- Footer hints -->
      <div
        class="flex items-center justify-between gap-3 px-4 h-9 border-t border-border bg-muted/30 text-[11px] text-muted-foreground"
      >
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1">
            <kbd
              class="inline-flex items-center justify-center w-4 h-4 rounded border border-border bg-background"
            >
              <ArrowUpIcon class="w-2.5 h-2.5" />
            </kbd>
            <kbd
              class="inline-flex items-center justify-center w-4 h-4 rounded border border-border bg-background"
            >
              <ArrowDownIcon class="w-2.5 h-2.5" />
            </kbd>
            Navigate
          </span>
          <span class="inline-flex items-center gap-1">
            <kbd
              class="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded border border-border bg-background font-mono text-[10px]"
            >
              ↵
            </kbd>
            Open
          </span>
        </div>
        <span class="hidden sm:inline-flex items-center gap-1">
          <kbd
            class="inline-flex items-center justify-center px-1.5 h-4 rounded border border-border bg-background font-mono text-[10px] font-semibold"
          >
            ⌘K
          </kbd>
          Toggle
        </span>
      </div>
    </div>
  </Modal>
</template>
