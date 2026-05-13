<script setup lang="ts">
import { ref, computed, provide } from "vue";
import { ModoProvider, paletteFromHex, darkSurfaces, useColorMode } from "mood-ui";
import { createDocToc, DOC_TOC_KEY } from "~/composables/useDocToc";
import { useDocsTheme } from "~/composables/useDocsTheme";
import { usePersistedThemeVars } from "~/composables/usePersistedThemeVars";
import { tintedLightSurfaces, tintedDarkSurfaces } from "~/utils/tintedSurfaces";

const { state: docsTheme } = useDocsTheme();

// Mirror the resolved CSS custom properties into localStorage on every
// theme change so the inline anti-FOUC script in nuxt.config can apply
// them before the first paint on the next page load.
usePersistedThemeVars();

// Pass the RAW mode (`'light' | 'dark' | 'system'`) — not the resolved
// theme — to ModoProvider. The provider has an `immediate: true` watch
// that mirrors `:theme` into `setColorMode`, so feeding it `resolved`
// (i.e. `'light'` when the user picked `'system'` on a light-OS) would
// clobber `mode` back to the resolved value the moment the user clicks
// `system` — making the ColorModeSwitch indicator slide to the sun /
// moon icon instead of staying on the system icon. The lib resolves
// `'system'` internally via `resolveColorMode` for overlay theming
// (PopoverPanel, Tooltip), so we don't need to pre-resolve here.
const { mode: colorMode } = useColorMode();
const primaryPalette = computed(() => ({
  primary: paletteFromHex(docsTheme.value.primaryHex),
}));
const lightSurfacesConfig = computed(() =>
  docsTheme.value.baseIntensity > 0
    ? tintedLightSurfaces(docsTheme.value.primaryHex, docsTheme.value.baseIntensity / 100)
    : undefined,
);
const darkSurfaceConfig = computed(() => {
  const preset = darkSurfaces[docsTheme.value.darkSurface];
  if (docsTheme.value.baseIntensity === 0) return preset;
  const tinted = tintedDarkSurfaces(docsTheme.value.primaryHex, docsTheme.value.baseIntensity / 100);
  return { ...preset, ...tinted };
});

const cmdkOpen = ref(false);

const toc = createDocToc();
provide(DOC_TOC_KEY, toc);

// Wipe the TOC right before the new page's components run their setup
// hook (router lifecycle event happens before the new view mounts).
// Without this guard, stale entries from the previous page leak into
// pages that don't register their own (Templates, /docs/installation,
// etc.). Doing the wipe via a route guard instead of a `watch` keeps
// the timing deterministic: the new ComponentDoc's setup-time
// `registerFixedSections()` always runs AFTER the wipe, so its
// level-1 entries (Overview, Examples, API…) never get clobbered.
const router = useRouter();
router.beforeEach((_to, from) => {
  if (from && from.path !== "/") toc.clear();
});
</script>

<template>
  <ModoProvider
    :theme="colorMode"
    :radius="docsTheme.radius"
    :size="docsTheme.size"
    :halo="docsTheme.halo"
    :palettes="primaryPalette"
    :surfaces="lightSurfacesConfig"
    :dark-surfaces="darkSurfaceConfig"
  >
    <div class="flex flex-col min-h-dvh bg-background text-foreground">
      <header class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border">
        <AppHeader @open-search="cmdkOpen = true" />
      </header>

      <div class="flex-1 max-w-9xl w-full mx-auto px-4 sm:px-6">
        <div class="flex gap-8 lg:gap-10">
          <!-- Desktop sidebar -->
          <AppSidebar @open-search="cmdkOpen = true" />

          <!-- Mobile floating trigger + slide-in drawer -->
          <AppMobileNav @open-search="cmdkOpen = true" />

          <!-- Main content. Page-level fade is handled by Nuxt's global
               `app.pageTransition` (configured in nuxt.config). Wrapping
               the `<slot />` in a local `<Transition>` keyed on route.path
               caused a visual "double-paint" — the new page would render
               into the slot first, then fade out + fade back in. -->
          <main class="flex-1 min-w-0 py-8">
            <slot />
          </main>

          <!-- Right "On This Page" TOC — registered by ComponentDoc/DocPage
               and inhabited by ComponentPreview anchors. Hidden below xl
               because the docs sidebar already steals horizontal real
               estate on smaller screens. -->
          <DocToc :toc="toc" />
        </div>
      </div>

      <!-- Command palette (Cmd+K) -->
      <ClientOnly>
        <AppCommandPalette v-model="cmdkOpen" />
      </ClientOnly>
    </div>
  </ModoProvider>
</template>
