<script setup lang="ts">
import RenderContent from '../../../utils/RenderContent'
import type { LiquidToastItem } from '../../../interfaces/feedback/LiquidToast.interface'
/**
 * One copy of the toast silhouette. LiquidToast renders it three times: a
 * shade layer (shadow token), the goo layer (fused fill) and the ink layer
 * (text and controls). Only the ink copy is interactive; the others are
 * sizing twins, so every control exists in all of them as a plain span.
 */
const props = defineProps<{ item: LiquidToastItem; ink?: boolean; dismissable?: boolean; progress?: boolean; closeLabel?: string }>()
const emit = defineEmits<{ action: []; dismiss: [] }>()
const glyphs = { neutral: 'M4 8h8', success: 'M3.5 8.5l3 3 6-7', danger: 'M4.5 4.5l7 7m0-7l-7 7', warning: 'M8 4v5m0 3v.01', info: 'M8 7v5m0-8v.01' }
const hasPanel = () => !!(props.item.description || props.item.action)
</script>
<template>
  <div class="modo-liquid-toast__pill">
    <span v-if="!item.hideIcon || item.loading" :key="`dot-${item.revision}`" class="modo-liquid-toast__dot" aria-hidden="true">
      <svg v-if="item.loading" viewBox="0 0 16 16" fill="none" class="modo-liquid-toast__spinner"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="26" stroke-dashoffset="18" /></svg>
      <component :is="item.icon" v-else-if="item.icon" class="modo-liquid-toast__glyph" />
      <svg v-else viewBox="0 0 16 16" fill="none"><path :d="glyphs[item.color]" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
    <span :key="`title-${item.revision}`" class="modo-liquid-toast__title"><RenderContent :content="item.title" /></span>
    <template v-if="dismissable">
      <button v-if="ink" type="button" class="modo-liquid-toast__close" :aria-label="closeLabel" @click.stop="emit('dismiss')">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 4.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
      </button>
      <span v-else class="modo-liquid-toast__close" />
    </template>
    <span v-if="ink && progress && !hasPanel()" class="modo-liquid-toast__progress" aria-hidden="true"><span :key="`bar-${item.revision}`" class="modo-liquid-toast__bar" /></span>
  </div>
  <div v-if="hasPanel()" :key="`panel-${item.revision}`" class="modo-liquid-toast__panel">
    <p v-if="item.description" class="modo-liquid-toast__description"><RenderContent :content="item.description" /></p>
    <button v-if="item.action && ink" type="button" class="modo-liquid-toast__action" @click.stop="emit('action')">{{ item.action.label }}</button>
    <span v-else-if="item.action" class="modo-liquid-toast__action">{{ item.action.label }}</span>
    <span v-if="ink && progress" class="modo-liquid-toast__progress" aria-hidden="true"><span :key="`bar-${item.revision}`" class="modo-liquid-toast__bar" /></span>
  </div>
</template>
