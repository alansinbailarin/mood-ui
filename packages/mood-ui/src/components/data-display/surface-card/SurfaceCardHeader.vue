<template>
  <component
    :is="as"
    data-modo-surface-card-header=""
    :data-modo-surface="surface"
    :data-modo-padding="padding"
    class="modo-surface-card__header"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { SurfaceCardHeaderProps } from "../../../interfaces/data-display/SurfaceCard.interface";

withDefaults(defineProps<SurfaceCardHeaderProps>(), {
  as: "div",
  surface: "none",
});
</script>
