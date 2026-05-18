import type { DocsThemeState } from "../composables/useDocsTheme";
import { tintedLightSurfaces, tintedDarkSurfaces } from "./tintedSurfaces";

/** Serialize a surface-token object into an indented multi-line JS literal. */
function serializeSurfaces(
  surfaces: Record<string, string | undefined>,
): string {
  const entries = Object.entries(surfaces)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `  ${k}: '${v}',`);
  return `{\n${entries.join("\n")}\n}`;
}

/**
 * Build a ready-to-paste `<ModoProvider>` Vue snippet from the current
 * palette settings. All palette props are emitted explicitly. `:theme`
 * (color mode) is intentionally excluded — it is owned by ColorModeSwitch.
 *
 * When `baseIntensity > 0` the tinted surfaces are inlined as `const`
 * literals (the tinted helpers are showroom-only, not exported by mood-ui),
 * making the snippet fully self-contained.
 */
export function buildModoProviderSnippet(state: DocsThemeState): string {
  const { radius, size, halo, primaryHex, baseIntensity, darkSurface } = state;
  const tinted = baseIntensity > 0;

  const providerLines = [
    `    radius="${radius}"`,
    `    size="${size}"`,
    `    halo="${halo}"`,
    `    :palettes="{ primary: paletteFromHex('${primaryHex}') }"`,
  ];

  if (tinted) {
    const light = serializeSurfaces(
      tintedLightSurfaces(primaryHex, baseIntensity / 100),
    );
    const dark = serializeSurfaces(
      tintedDarkSurfaces(primaryHex, baseIntensity / 100),
    );
    providerLines.push(`    :surfaces="surfaces"`);
    providerLines.push(`    :dark-surfaces="darkSurfaces"`);

    return `<script setup lang="ts">
import { ModoProvider, paletteFromHex } from 'mood-ui';

const surfaces = ${light};

const darkSurfaces = ${dark};
</script>

<template>
  <ModoProvider
${providerLines.join("\n")}
  >
    <!-- your app -->
  </ModoProvider>
</template>`;
  }

  providerLines.push(`    :dark-surfaces="darkSurfaces.${darkSurface}"`);

  return `<script setup lang="ts">
import { ModoProvider, paletteFromHex, darkSurfaces } from 'mood-ui';
</script>

<template>
  <ModoProvider
${providerLines.join("\n")}
  >
    <!-- your app -->
  </ModoProvider>
</template>`;
}
