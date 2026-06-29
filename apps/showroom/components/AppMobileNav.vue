<script setup lang="ts">
/**
 * Mobile-only navigation. Two pieces:
 *   1. A floating round trigger pinned bottom-right of the viewport.
 *   2. A left-side slide-in <aside> drawer with the full nav manifest
 *      plus a search-and-locale row at the top.
 *
 * Both pieces live in this component so the docs layout and the landing
 * layout can drop in one tag and get the same UX. The drawer also
 * surfaces Theme Studio (which is hidden from the desktop sidebar) so
 * mobile visitors have a way to reach it without scrolling the landing.
 */
import { ref, watch } from "vue";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
} from "@heroicons/vue/24/outline";
import { navManifest } from "~/utils/nav-manifest";

const emit = defineEmits<{
  "open-search": [];
}>();

const route = useRoute();
const { t, locale, setLocale } = useI18n();

const open = ref(false);

// Close on every navigation. Without this the drawer would stay open
// after a NuxtLink click and overlap the page the user just landed on.
watch(
  () => route.path,
  () => {
    open.value = false;
  },
);

function toggleLocale() {
  setLocale(locale.value === "es" ? "en" : "es");
}

function onSearch() {
  open.value = false;
  emit("open-search");
}

// The desktop sidebar hides `theme-studio` (it has its own dedicated
// header pill on lg+). On phones we don't render those center pills, so
// Theme Studio needs an explicit entry here. We keep the rest of the
// `hiddenInSidebar` filter intact so generic placeholder categories
// stay out.
const mobileSections = computed(() =>
  navManifest.filter((c) => !c.hiddenInSidebar || c.id === "theme-studio"),
);
</script>

<template>
  <!-- Floating round trigger. Pinned to the viewport so it shadows the
       page on every route without needing the layout to wrap content. -->
  <button
    type="button"
    class="lg:hidden fixed bottom-5 right-5 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 active:opacity-80 transition-opacity"
    :aria-label="t('openMenu')"
    :aria-expanded="open"
    aria-haspopup="dialog"
    @click="open = true"
  >
    <Bars3Icon class="w-5 h-5" />
  </button>

  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-150 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-100 ease-in"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
      @click="open = false"
    />
  </Transition>

  <!-- Slide-in panel -->
  <Transition
    enter-active-class="transition-transform duration-200 ease-out"
    enter-from-class="-translate-x-full"
    leave-active-class="transition-transform duration-150 ease-in"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="open"
      class="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-card border-r border-border shadow-xl overflow-y-auto"
      :aria-label="t('menu')"
    >
      <div class="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border">
        <span class="text-sm font-semibold text-foreground">{{ t("menu") }}</span>
        <button
          type="button"
          class="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          :aria-label="t('closeMenu')"
          @click="open = false"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <div class="px-4 py-3 flex items-center gap-2 border-b border-border">
        <button
          type="button"
          class="flex-1 flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs"
          @click="onSearch"
        >
          <MagnifyingGlassIcon class="w-3.5 h-3.5 shrink-0" />
          <span class="text-[12px]">{{ t("search.label") }}…</span>
          <kbd class="ml-auto font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]">⌘K</kbd>
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium shrink-0"
          @click="toggleLocale"
        >
          <GlobeAltIcon class="w-3.5 h-3.5" />
          {{ locale.toUpperCase() }}
        </button>
      </div>

      <nav class="flex-1 py-5 px-4 overflow-y-auto">
        <div
          v-for="section in mobileSections"
          :key="section.id"
          class="mb-7"
        >
          <div class="text-[11px] uppercase tracking-[0.14em] font-bold text-foreground/90 mb-3">
            {{ section.title }}
          </div>
          <ul class="flex flex-col gap-0.5">
            <li v-for="item in section.entries" :key="item.id">
              <NuxtLinkLocale
                :to="item.route"
                class="inline-flex items-center gap-2 py-1.5 text-sm transition-colors"
                :class="
                  route.path === item.route
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                "
                @click="open = false"
              >
                {{ item.label }}
                <span
                  v-if="item.badge"
                  class="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {{ item.badge }}
                </span>
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  </Transition>
</template>
