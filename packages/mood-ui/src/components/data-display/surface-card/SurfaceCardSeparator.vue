<template>
  <hr
    data-modo-surface-card-separator=""
    :data-modo-inset="inset"
    class="modo-surface-card__separator"
  />
</template>

<script setup lang="ts">
import type { SurfaceCardSeparatorProps } from "../../../interfaces/data-display/SurfaceCard.interface";

withDefaults(defineProps<SurfaceCardSeparatorProps>(), {
  inset: "none",
});
</script>
