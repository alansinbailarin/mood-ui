<template>
  <component
    :is="as"
    data-modo-surface-card-subtitle=""
    class="modo-surface-card__subtitle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import type { SurfaceCardSubtitleProps } from "../../../interfaces/data-display/SurfaceCard.interface";

withDefaults(defineProps<SurfaceCardSubtitleProps>(), {
  as: "p",
});
</script>
