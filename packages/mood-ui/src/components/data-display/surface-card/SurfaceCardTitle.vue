<template>
  <component
    :is="as"
    data-modo-surface-card-title=""
    class="modo-surface-card__title"
  >
    <a
      v-if="href"
      :href="href"
      :target="target"
      :rel="rel"
      :class="[
        'modo-surface-card__title-link',
        stretchedLink ? 'modo-surface-card__stretched-link' : '',
      ]"
    >
      <slot />
    </a>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import type { SurfaceCardTitleProps } from "../../../interfaces/data-display/SurfaceCard.interface";

withDefaults(defineProps<SurfaceCardTitleProps>(), {
  as: "h3",
  stretchedLink: false,
});
</script>
