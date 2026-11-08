<template>
  <component
    :is="as"
    data-modo-surface-card-footer=""
    :data-modo-surface="surface"
    :data-modo-padding="padding"
    :data-modo-align="align"
    class="modo-surface-card__footer"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { SurfaceCardFooterProps } from "../../../interfaces/data-display/SurfaceCard.interface";

withDefaults(defineProps<SurfaceCardFooterProps>(), {
  as: "footer",
  surface: "none",
  align: "end",
});
</script>
