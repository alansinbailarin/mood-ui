<template>
  <div
    data-modo-surface-card-media=""
    class="modo-surface-card__media"
    :style="mediaStyle"
  >
    <img
      v-if="src"
      v-bind="imgAttrs"
      :class="['modo-surface-card__media-img', imgClass]"
      :src="src"
      :alt="alt"
    />
    <div v-if="$slots.default" class="modo-surface-card__media-overlay">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { SurfaceCardMediaProps } from "../../../interfaces/data-display/SurfaceCard.interface";

const props = withDefaults(defineProps<SurfaceCardMediaProps>(), {
  alt: "",
  ratio: 16 / 9,
});

const mediaStyle = computed<CSSProperties>(() => ({
  aspectRatio: String(props.ratio),
}));

const imgClass = computed(() => props.imgProps?.class);

const imgAttrs = computed(() => {
  if (!props.imgProps) return undefined;
  const { class: _cls, ...rest } = props.imgProps;
  return rest;
});
</script>
