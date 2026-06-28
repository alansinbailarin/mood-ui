<script setup lang="ts">
import { computed } from "vue";
import {
  ToastContainer,
  ConfirmDialog,
  ModoProvider,
  paletteFromHex,
  darkSurfaces,
  useColorMode,
} from "mood-ui";
import { useDocsTheme } from "~/composables/useDocsTheme";
import { tintedLightSurfaces, tintedDarkSurfaces } from "~/utils/tintedSurfaces";
import { resolveHash } from "~/utils/hash-redirects";
import { ogCategory } from "~/utils/ogCategory";

// Pass the RAW mode (not the resolved theme) to this ModoProvider too.
// ModoProvider's `watch(theme) → setColorMode` would otherwise overwrite
// `mode` back to the resolved value whenever the user picks `system`
// from a state where the OS preference disagrees — that's the bug that
// made the ColorModeSwitch capsule jump to sun/moon instead of staying
// on the system icon. See the long-form note in `layouts/default.vue`.
const { mode: colorMode } = useColorMode();

// The globals (`<ToastContainer>` / `<ConfirmDialog>`) live in their own
// `<ModoProvider>` here in app.vue — outside the layouts. We feed them the
// same docs-theme state the layouts use, otherwise the dialog buttons
// would render with the lib's default blue primary instead of whatever
// color the user picked in the settings panel.
const { state: docsTheme } = useDocsTheme();
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

/**
 * Redirect legacy hash URLs (`mood-ui.com/#button`) to their Nuxt route
 * before the first paint. The hash is never sent to the server, so this
 * has to run on the client — but it has to run *early* so we don't
 * flash the landing page on the way to the canonical page. Hooking the
 * Nuxt app:created event runs us during hydration, before the route
 * resolves the first match.
 *
 * In-page anchors (e.g. `#ex-skeleton` set by the TOC scroll-spy) are
 * left alone: resolveHash() returns null for any id that isn't a known
 * component, doc or composable id.
 */
const router = useRouter();

if (import.meta.client && window.location.hash) {
  const target = resolveHash(window.location.hash);
  if (target) {
    const stripped = `${window.location.pathname}${window.location.search}`;
    // Only redirect if we're on `/` — preserve in-page anchors on
    // component pages (the user landed on /forms/button#api intentionally).
    if (stripped === "/" || stripped === "") {
      router.replace(target);
    }
  }
}

// ── SEO / OG ──────────────────────────────────────────────────────────────────
// Piece 3: default twitter card for every page.
useSeoMeta({ twitterCard: "summary_large_image" });

// Piece 4: reactive <html lang> driven by the active i18n locale.
const { locale } = useI18n();
useHead({ htmlAttrs: { lang: locale } });

// Piece 2: wire per-page category into the site-wide OG image.
// nuxt-og-image v6 lazily injects title/description from useSeoMeta / useHead
// after all component setups complete, so we only supply the category prop here;
// the page-level `useSeoMeta({ ogTitle, ogDescription })` calls continue to
// populate title and description inside the rendered card automatically.
// route.path is already resolved when this runs, and each route prerenders
// fresh during `nuxt generate`, so a plain call is enough — no computed needed.
const route = useRoute();
defineOgImage("OgImageDefaultTakumi", { category: ogCategory(route.path) });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Global feedback singletons. `useToast()` and `useConfirm()` push
       items into shared queues; without these mounted somewhere global,
       the queue fills but no UI ever renders.
       Wrapped in their own ModoProvider with the resolved color mode so
       Modal / Toast (which internally call `useResolvedTheme`) read the
       same theme the user toggled to. Without this wrapper they fall
       back to `'system'` and apply `data-modo-theme="dark"` whenever the
       OS prefers dark, turning the confirm popup into the dark variant
       even while the page itself is light. -->
  <ClientOnly>
    <ModoProvider
      :theme="colorMode"
      :radius="docsTheme.radius"
      :size="docsTheme.size"
      :halo="docsTheme.halo"
      :palettes="primaryPalette"
      :surfaces="lightSurfacesConfig"
      :dark-surfaces="darkSurfaceConfig"
    >
      <ToastContainer placement="bottom-right" />
      <ConfirmDialog />
    </ModoProvider>
  </ClientOnly>
</template>
