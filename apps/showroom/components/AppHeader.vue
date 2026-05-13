<script setup lang="ts">
import { computed } from "vue";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  SwatchIcon,
} from "@heroicons/vue/24/outline";
import { ColorModeSwitch, Select, useColorMode } from "mood-ui";
import type { ModoTheme } from "mood-ui";

// Burger trigger lives in the layout (floating bottom-right). Duplicating
// it in the header crowded the top row on phones without adding any
// reachability — the floating button is already the easier target.
defineEmits<{
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
      <div class="w-[76px] sm:w-[88px] shrink-0">
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
            <!-- Mirror the real Select (size=small, radius=full, full-width)
                 so hydration doesn't change pill shape, height or padding. -->
            <div
              class="flex items-center justify-between h-8 px-3 rounded-full border border-border bg-background text-xs font-medium text-foreground/85"
              aria-hidden="true"
            >
              <span>{{ locale.toUpperCase() }}</span>
              <ChevronDownIcon class="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
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
          <!-- Mirror the collapsed ColorModeSwitch: a small pill that
               shows only the active icon, with the same track tokens
               (border + tinted background) so hydration doesn't pop
               the size or background. -->
          <span
            class="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border bg-muted/40 text-foreground"
            aria-hidden="true"
          >
            <SunIcon v-if="mode === 'light'" class="w-4 h-4" />
            <MoonIcon v-else-if="mode === 'dark'" class="w-4 h-4" />
            <ComputerDesktopIcon v-else class="w-4 h-4" />
          </span>
        </template>
      </ClientOnly>

      <ClientOnly>
        <AppShowroomSettings />
        <template #fallback>
          <!-- Mirror the real settings trigger: round button with the
               SwatchIcon colored by `var(--primary)`, which the inline
               anti-FOUC script in nuxt.config has already pinned on the
               root element from the user's cached theme. -->
          <span
            class="inline-flex items-center justify-center w-8 h-8 rounded-full"
            aria-hidden="true"
          >
            <SwatchIcon class="w-5 h-5" style="color: var(--primary)" />
          </span>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
