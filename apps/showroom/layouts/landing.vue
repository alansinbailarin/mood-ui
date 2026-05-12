<script setup lang="ts">
import { computed } from "vue";
import { ModoProvider, paletteFromHex, darkSurfaces } from "mood-ui";
import { useDocsTheme } from "~/composables/useDocsTheme";

/**
 * Full-bleed layout for the landing page. Same header as the docs shell
 * (logo + nav tabs + locale + color mode + settings) but **without** the
 * 220px sidebar that the docs/component pages need. The landing wants the
 * full viewport so the hero gradient, floating tiles and section grids
 * line up correctly.
 */

const { state } = useDocsTheme();
const primaryPalette = computed(() => ({
  primary: paletteFromHex(state.value.primaryHex),
}));
const darkSurfaceConfig = computed(
  () => darkSurfaces[state.value.darkSurface],
);
</script>

<template>
  <ModoProvider
    :radius="state.radius"
    :size="state.size"
    :halo="state.halo"
    :palettes="primaryPalette"
    :dark-surfaces="darkSurfaceConfig"
  >
    <div class="flex flex-col min-h-dvh bg-background text-foreground">
      <header
        class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border"
      >
        <AppHeader :show-burger="false" />
      </header>
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </ModoProvider>
</template>
