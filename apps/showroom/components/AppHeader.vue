<script setup lang="ts">
import {
  Bars3Icon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";
import { ColorModeSwitch, Select, useColorMode } from "mood-ui";
import type { ModoTheme } from "mood-ui";

const props = defineProps<{
  showBurger?: boolean;
}>();

const emit = defineEmits<{
  burger: [];
  "open-search": [];
}>();

// Color mode: tied to the lib's useColorMode singleton so the docs site
// shares dark/light state with every demo on every page.
const { mode } = useColorMode();
function onColorMode(v: ModoTheme) {
  mode.value = v;
}

// Locale: @nuxtjs/i18n owns the canonical state; the lib's locale prop on
// ModoProvider is wired up in the default layout.
const { locale, locales, setLocale } = useI18n();
const localeOptions = computed(() =>
  locales.value.map((l) => ({ value: l.code, label: l.code.toUpperCase() })),
);
function onLocale(v: unknown) {
  if (typeof v === "string") setLocale(v as "en" | "es");
}
</script>

<template>
  <div class="max-w-9xl mx-auto flex items-center gap-2 px-3 sm:px-6 h-12 lg:h-16 lg:gap-3">
    <button
      v-if="props.showBurger"
      type="button"
      class="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      aria-label="Open menu"
      @click="emit('burger')"
    >
      <Bars3Icon class="w-5 h-5" />
    </button>

    <NuxtLink to="/" class="flex items-center gap-2 group shrink-0" aria-label="Home">
      <!-- Two logos toggled via Tailwind's dark variant. `logo_dark` is
           the dark/black artwork shown on light backgrounds; `logo_light`
           is the inverted version shown when .dark is active. Using two
           <img> tags (instead of swapping src reactively) avoids a flash
           on color-mode toggle and keeps both files cached. -->
      <img
        src="/logo_dark.png"
        alt="mood-ui"
        class="block dark:hidden w-7 h-7 lg:w-8 lg:h-8 object-contain group-hover:scale-110 transition-transform"
      />
      <img
        src="/logo_light.png"
        alt="mood-ui"
        class="hidden dark:block w-7 h-7 lg:w-8 lg:h-8 object-contain group-hover:scale-110 transition-transform"
      />
      <span class="hidden sm:inline text-lg tracking-tight">
        <span class="font-medium text-foreground">Mood</span><span class="font-bold ml-1 uppercase text-primary">UI</span>
      </span>
    </NuxtLink>

    <!-- Center pill tabs (Docs / Components / Templates / Theme Studio) -->
    <div class="flex-1 hidden lg:flex justify-center">
      <AppHeaderNav />
    </div>
    <div class="flex-1 lg:hidden" />

    <!-- Right cluster.
         Each interactive control is wrapped in <ClientOnly> with a rich
         fallback that mirrors the final visual shape, so the header looks
         complete on first paint (no width/height collapse, no late-popping
         elements) but the real interactive widgets hydrate without the
         SSR/CSR mismatch we hit when removing ClientOnly entirely. -->
    <div class="flex items-center gap-1">
      <div class="hidden sm:block w-[88px] shrink-0">
        <ClientOnly>
          <Select
            :model-value="locale"
            :options="localeOptions"
            size="small"
            radius="full"
            :full-width="true"
            aria-label="Language"
            @update:model-value="onLocale"
          />
          <template #fallback>
            <div
              class="flex items-center justify-between gap-1 h-8 px-3 rounded-full border border-border bg-background text-xs text-foreground/80"
              aria-hidden="true"
            >
              <GlobeAltIcon class="w-3.5 h-3.5 shrink-0" />
              <span class="font-medium">{{ locale.toUpperCase() }}</span>
              <span class="text-muted-foreground/60">▾</span>
            </div>
          </template>
        </ClientOnly>
      </div>

      <ClientOnly>
        <ColorModeSwitch
          variant="collapsed"
          :model-value="mode"
          size="small"
          @update:model-value="onColorMode"
        />
        <template #fallback>
          <button
            type="button"
            class="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-muted/60 text-muted-foreground"
            aria-hidden="true"
            tabindex="-1"
          >
            <SunIcon v-if="mode === 'light'" class="w-4 h-4" />
            <MoonIcon v-else-if="mode === 'dark'" class="w-4 h-4" />
            <ComputerDesktopIcon v-else class="w-4 h-4" />
          </button>
        </template>
      </ClientOnly>

      <ClientOnly>
        <AppShowroomSettings />
        <template #fallback>
          <span
            class="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground"
            aria-hidden="true"
          >
            <!-- Swatch icon placeholder, same size as the real button -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 1 1 3 17.25 3.75 3.75 0 0 1 6.75 21Z" />
            </svg>
          </span>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
