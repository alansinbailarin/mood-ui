<script setup lang="ts">
import { ref, computed, defineAsyncComponent, h, watch } from "vue";
import ModoProvider from "./components/ModoProvider.vue";
import ToastContainer from "./components/feedback/ToastContainer.vue";
import Loader from "./components/feedback/Loader.vue";

import { showroomNav } from "./showroom/registry";
import { useShowroomRouter } from "./showroom/composables/useShowroomRouter";
import CommandPalette from "./showroom/components/CommandPalette.vue";
import DocsShell from "./showroom/components/DocsShell.vue";
import HeaderBar from "./showroom/components/HeaderBar.vue";
import { useShowroomPreferences } from "./showroom/composables/useShowroomPreferences";
import {
  setShowroomLocale,
  type ShowroomLocale,
} from "./showroom/composables/useShowroomLocale";
import {
  tintedLightSurfaces,
  tintedDarkSurfaces,
} from "./showroom/utils/tintedSurfaces";

import type {
  ModoColor,
  ModoRadius,
  ModoSize,
  ModoTheme,
  ModoHalo,
} from "./config/ModoConfig";
import type { ModoPalette } from "./config/palettes";
import { paletteFromHex } from "./config/palettes";
import {
  darkSurfaces as darkSurfacePresets,
  type DarkSurfacePreset,
} from "./config/surfaces";
import type { PartialLocale } from "./config/ModoLocale";
import type { NavSection } from "./showroom/components/DocsShell.vue";

// ── Provider state (persisted in localStorage) ───────────────────────────────
const {
  theme,
  color,
  radius,
  size,
  halo,
  primaryHex,
  accentHex,
  baseIntensity,
  darkSurface,
  localeName,
  reset: resetTheme,
  DEFAULTS,
} = useShowroomPreferences();

const paletteOpen = ref(false);

// Sync global locale singleton so pages and command palette read it
// without prop drilling.
watch(localeName, (v) => setShowroomLocale(v), { immediate: true });

// Keep accentHex in sync with primaryHex (single color model)
watch(
  primaryHex,
  (v) => {
    accentHex.value = v;
  },
  { immediate: true },
);

const palettes = computed<{ primary?: Partial<ModoPalette> }>(() => ({
  primary: paletteFromHex(primaryHex.value),
}));

const tintedSurfaces = computed(() =>
  baseIntensity.value > 0
    ? tintedLightSurfaces(primaryHex.value, baseIntensity.value / 100)
    : undefined,
);

const darkSurfaceComputed = computed(() => {
  const base = darkSurfacePresets[darkSurface.value];
  if (baseIntensity.value === 0) return base;
  const tinted = tintedDarkSurfaces(
    primaryHex.value,
    baseIntensity.value / 100,
  );
  return { ...base, ...tinted };
});

// ── i18n ──────────────────────────────────────────────────────────────────────
const localeMap: Record<ShowroomLocale, PartialLocale> = {
  es: {},
  en: {
    common: {
      close: "Close",
      clear: "Clear",
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading…",
      search: "Search",
    } as PartialLocale["common"],
  } as PartialLocale,
};
const locale = computed<PartialLocale>(() => localeMap[localeName.value]);

// ── Router & route classification ─────────────────────────────────────────────
const { entry, currentId, go } = useShowroomRouter();

// Scroll to top whenever the active page changes
watch(currentId, () => {
  window.scrollTo({ top: 0, behavior: "instant" });
});

const activeCategoryId = computed<string | null>(() => {
  const cat = showroomNav.find((c) =>
    c.entries.some((e) => e.id === currentId.value),
  );
  return cat?.id ?? null;
});

const isWelcome = computed(() => !entry.value || currentId.value === "welcome");
const isThemeStudio = computed(() => activeCategoryId.value === "theme-studio");

// ── Left-nav sections — always unified (Docs + Templates + all components) ───
// Categories that should NOT appear in the sidebar.
const COMPONENT_HIDDEN = new Set(["getting-started", "theme-studio"]);

const contentNavSections = computed<NavSection[]>(() => {
  if (isWelcome.value || isThemeStudio.value) return [];

  return showroomNav
    .filter((cat) => !COMPONENT_HIDDEN.has(cat.id))
    .map((cat) => ({
      title: cat.title,
      items: cat.entries.map((e) => ({
        id: e.id,
        label: e.label,
        badge: e.badge,
      })),
    }));
});

// ── Active page (async lazy) ──────────────────────────────────────────────────
const ActivePage = computed(() => {
  const e = entry.value;
  if (!e) return null;
  return defineAsyncComponent({
    loader: () => e.page().then((m) => m.default),
    loadingComponent: {
      render() {
        return h("div", { class: "flex items-center justify-center py-24" }, [
          h(Loader, { size: "medium" }),
        ]);
      },
    },
    delay: 80,
  });
});

function onHeaderNavigate(id: string) {
  go(id);
}

// ── Shared HeaderBar props helper (avoids repetition in template) ─────────────
// (All @update:* events are passed inline in the template — no helper needed.)
</script>

<template>
  <ModoProvider
    :theme="theme"
    color="default"
    :radius="radius"
    :size="size"
    halo="off"
    :palettes="palettes"
    :surfaces="tintedSurfaces"
    :dark-surfaces="darkSurfaceComputed"
    :locale="locale"
  >
    <!-- ─────────────────────────────────────────────────────────────
             WELCOME — standalone landing (no nav column)
        ───────────────────────────────────────────────────────────── -->
    <div v-if="isWelcome" class="min-h-dvh bg-background text-foreground">
      <header
        class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border"
      >
        <HeaderBar
          :active-id="currentId"
          :show-logo="true"
          :theme="theme"
          :color="color"
          :radius="radius"
          :size="size"
          :halo="halo"
          :primary-hex="primaryHex"
          :accent-hex="accentHex"
          :base-intensity="baseIntensity"
          :dark-surface="darkSurface"
          :locale="localeName"
          @navigate="onHeaderNavigate"
          @open-search="paletteOpen = true"
          @update:theme="theme = $event"
          @update:color="color = $event"
          @update:radius="radius = $event"
          @update:size="size = $event"
          @update:halo="halo = $event"
          @update:primary-hex="primaryHex = $event"
          @update:accent-hex="accentHex = $event"
          @update:base-intensity="baseIntensity = $event"
          @update:dark-surface="darkSurface = $event"
          @update:locale="localeName = $event"
          @reset="resetTheme"
        />
      </header>
      <div style="view-transition-name: showroom-content">
        <Suspense>
          <component :is="ActivePage" v-if="ActivePage" />
          <template #fallback>
            <div class="flex items-center justify-center py-24">
              <Loader size="medium" />
            </div>
          </template>
        </Suspense>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
             THEME STUDIO — full-width, no left nav
        ───────────────────────────────────────────────────────────── -->
    <div
      v-else-if="isThemeStudio"
      class="min-h-dvh bg-background text-foreground"
    >
      <header
        class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border"
      >
        <HeaderBar
          :active-id="currentId"
          :show-logo="true"
          :theme="theme"
          :color="color"
          :radius="radius"
          :size="size"
          :halo="halo"
          :primary-hex="primaryHex"
          :accent-hex="accentHex"
          :base-intensity="baseIntensity"
          :dark-surface="darkSurface"
          :locale="localeName"
          @navigate="onHeaderNavigate"
          @open-search="paletteOpen = true"
          @update:theme="theme = $event"
          @update:color="color = $event"
          @update:radius="radius = $event"
          @update:size="size = $event"
          @update:halo="halo = $event"
          @update:primary-hex="primaryHex = $event"
          @update:accent-hex="accentHex = $event"
          @update:base-intensity="baseIntensity = $event"
          @update:dark-surface="darkSurface = $event"
          @update:locale="localeName = $event"
          @reset="resetTheme"
        />
      </header>
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 py-8"
        style="view-transition-name: showroom-content"
      >
        <Suspense>
          <component :is="ActivePage" v-if="ActivePage" />
          <template #fallback>
            <div class="flex items-center justify-center py-24">
              <Loader size="medium" />
            </div>
          </template>
        </Suspense>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────
             DOCS / TEMPLATES / COMPONENTS — ContentShell (unified layout)
             Left nav column (flush to left edge) + scrollable content
        ───────────────────────────────────────────────────────────── -->
    <DocsShell
      v-else
      :nav-sections="contentNavSections"
      :active-id="currentId"
      :locale="localeName"
      @navigate="onHeaderNavigate"
      @open-search="paletteOpen = true"
      @update:locale="localeName = $event"
    >
      <template #header>
        <HeaderBar
          :active-id="currentId"
          :show-logo="true"
          :theme="theme"
          :color="color"
          :radius="radius"
          :size="size"
          :halo="halo"
          :primary-hex="primaryHex"
          :accent-hex="accentHex"
          :base-intensity="baseIntensity"
          :dark-surface="darkSurface"
          :locale="localeName"
          @navigate="onHeaderNavigate"
          @open-search="paletteOpen = true"
          @update:theme="theme = $event"
          @update:color="color = $event"
          @update:radius="radius = $event"
          @update:size="size = $event"
          @update:halo="halo = $event"
          @update:primary-hex="primaryHex = $event"
          @update:accent-hex="accentHex = $event"
          @update:base-intensity="baseIntensity = $event"
          @update:dark-surface="darkSurface = $event"
          @update:locale="localeName = $event"
          @reset="resetTheme"
        />
      </template>

      <!-- DocsShell already gives main its own padding & view-transition-name. -->
      <Suspense>
        <component :is="ActivePage" v-if="ActivePage" />
        <template #fallback>
          <div class="flex items-center justify-center py-24">
            <Loader size="medium" />
          </div>
        </template>
      </Suspense>
    </DocsShell>

    <ToastContainer position="bottom-right" />

    <CommandPalette
      v-model="paletteOpen"
      @theme="theme = $event"
      @color="primaryHex = $event"
      @locale="localeName = $event"
    />
  </ModoProvider>
</template>
