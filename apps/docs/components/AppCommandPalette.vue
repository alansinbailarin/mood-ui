<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { MagnifyingGlassIcon, HashtagIcon } from "@heroicons/vue/24/outline";
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
  router.push(it.route);
  emit("update:modelValue", false);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, flatItems.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    run(activeIndex.value);
  }
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
  <Modal v-model="open" size="medium" :show-close="false">
    <div class="flex flex-col" @keydown="onKey">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MagnifyingGlassIcon class="w-4 h-4 text-muted-foreground" />
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          placeholder="Search components, docs…"
          class="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        <kbd class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground">
          ESC
        </kbd>
      </div>

      <div class="max-h-[60vh] overflow-y-auto py-2">
        <div v-if="!flatItems.length" class="px-4 py-8 text-center text-sm text-muted-foreground">
          No results.
        </div>

        <div v-for="[group, items] in grouped" :key="group" class="px-2 py-1.5">
          <div class="px-2 py-1 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
            {{ group }}
          </div>
          <button
            v-for="it in items"
            :key="it.id"
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors"
            :class="
              flatItems.indexOf(it) === activeIndex
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted/40'
            "
            @mouseenter="activeIndex = flatItems.indexOf(it)"
            @click="run(flatItems.indexOf(it))"
          >
            <HashtagIcon class="w-3.5 h-3.5 text-muted-foreground" />
            <span>{{ it.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>
