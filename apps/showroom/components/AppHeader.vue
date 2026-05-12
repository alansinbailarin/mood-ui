<script setup lang="ts">
import { Bars3Icon, GlobeAltIcon } from "@heroicons/vue/24/outline";
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
      <img
        src="/icon-mood-ui.png"
        alt="mood-ui"
        class="w-7 h-7 lg:w-8 lg:h-8 object-contain group-hover:scale-110 transition-transform"
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
            <div class="flex items-center gap-1 h-9 px-3 rounded-full border border-border text-xs text-muted-foreground">
              <GlobeAltIcon class="w-3.5 h-3.5" />
              {{ locale.toUpperCase() }}
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
      </ClientOnly>

      <ClientOnly>
        <AppShowroomSettings />
      </ClientOnly>
    </div>
  </div>
</template>
