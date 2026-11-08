<template>
  <component
    :is="as"
    data-modo-surface-card-body=""
    :data-modo-surface="surface"
    :data-modo-padding="padding"
    class="modo-surface-card__body"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { SurfaceCardBodyProps } from "../../../interfaces/data-display/SurfaceCard.interface";

withDefaults(defineProps<SurfaceCardBodyProps>(), {
  as: "div",
  surface: "none",
});
</script>
