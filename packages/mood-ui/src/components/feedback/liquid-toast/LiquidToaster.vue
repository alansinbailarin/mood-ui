<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import type { LiquidToasterProps, LiquidToastItem, LiquidToastPlacement } from '../../../interfaces/feedback/LiquidToast.interface'
import { useModoLocale } from '../../../composables/useModoConfig'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { liquidToast } from './liquidToast'
import LiquidToast from './LiquidToast.vue'

const props = withDefaults(defineProps<LiquidToasterProps>(), {
  placement: 'top-center', max: 1, defaultDuration: 4000, defaultVariant: 'liquid', offset: 16,
})
const loc = useModoLocale()
const store = computed(() => props.controller ?? liquidToast)
const count = computed(() => Math.max(1, Math.floor(props.max) || 1))
const PLACEMENTS: LiquidToastPlacement[] = ['top-center', 'top-left', 'top-right', 'bottom-center', 'bottom-left', 'bottom-right']
// One zone per placement in use; inside it the first `max` toasts are on stage
// and the next two wait as peeks behind the last stage card.
const zones = computed(() => PLACEMENTS.map(placement => {
  const items = store.value.items.value.filter(item => (item.placement ?? props.placement) === placement)
  const visible = items.slice(0, count.value)
  const stacks: LiquidToastItem[][] = visible.map((item, index) => index === visible.length - 1 ? [item, ...items.slice(count.value, count.value + 2)] : [item])
  return { placement, stacks }
}).filter(zone => zone.stacks.length))
const zoneStyle = (placement: LiquidToastPlacement) => {
  const o = `${props.offset}px`
  return {
    [placement.startsWith('top') ? 'top' : 'bottom']: placement.startsWith('top') ? `max(${o}, env(safe-area-inset-top))` : `max(${o}, env(safe-area-inset-bottom))`,
    ...(placement.endsWith('left') ? { left: o } : placement.endsWith('right') ? { right: o } : {}),
  }
}
const latest = computed(() => store.value.items.value.filter(item => !item.leaving).at(-1))
const announcement = computed(() => latest.value ? [latest.value.title, latest.value.description].filter(part => typeof part === 'string').join('. ') : '')
const urgent = computed(() => latest.value?.color === 'danger' || latest.value?.color === 'warning')
const ready = ref(false)
onMounted(() => { ready.value = true })
const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const gooId = `modo-liquid-toast-goo-${uid}`
const tightId = `modo-liquid-toast-goo-tight-${uid}`
const { scopedTheme, providerStyle } = useTeleportedModoTheme({ radius: () => props.radius, size: () => props.size })
const rootStyle = computed(() => [providerStyle.value, {
  '--modo-liquid-toast-goo': `url(#${gooId})`,
  '--modo-liquid-toast-goo-tight': `url(#${tightId})`,
}])
</script>
<template>
  <Teleport v-if="ready" to="body">
    <div data-modo-liquid-toast-region="" role="region" :aria-label="ariaLabel ?? loc.liquidToast.region" :data-modo-theme="scopedTheme" :style="rootStyle">
      <div aria-live="polite" aria-atomic="true" data-modo-announcer="">{{ !urgent ? announcement : '' }}</div>
      <div aria-live="assertive" aria-atomic="true" data-modo-announcer="">{{ urgent ? announcement : '' }}</div>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
        <defs>
          <filter :id="gooId" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -19" /></filter>
          <filter :id="tightId" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -19" /></filter>
        </defs>
      </svg>
      <div v-for="zone in zones" :key="zone.placement" data-modo-liquid-toaster="" :data-modo-position="zone.placement" :style="zoneStyle(zone.placement)">
        <div v-for="(stack, index) in zone.stacks" :key="index" class="modo-liquid-toast-slot">
          <LiquidToast v-for="(item, depth) in stack" :key="item.id" :item="item" :peek="depth"
            :default-duration="defaultDuration" :default-variant="defaultVariant" :radius="radius" :size="size"
            @dismiss="store.dismiss" @remove="store.remove" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
