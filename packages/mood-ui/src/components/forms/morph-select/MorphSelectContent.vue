<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { MorphSelectContentProps } from '../../../interfaces/forms/MorphSelect.interface'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { useModoLocale } from '../../../composables/useModoConfig'
import { MENU_PRESET, runMorph } from '../../../utils/morph/morphEngine'
import { attachCloseScrub, isTopMorphLayer, resolvePlacement } from '../../../utils/morph/morphHelpers'
import { CheckIcon } from '@heroicons/vue/24/outline'
import RenderContent from '../../../utils/RenderContent'
import { useMorphSelect } from './MorphSelectContext'
import { useMorphSelectKeyboard } from './useMorphSelectKeyboard'
const props = withDefaults(defineProps<MorphSelectContentProps>(), { side: 'auto', align: 'auto' })
const { fieldId, options, value, phase, trigger, button, select, setOpen, restoreFocus, stateColor, radius, size } = useMorphSelect()
const loc = useModoLocale()
const searchLabel = computed(() => props.searchPlaceholder ?? loc.value.morphSelect.searchPlaceholder)
const emptyLabel = computed(() => props.emptyMessage ?? loc.value.morphSelect.empty)
// Same option surfaces and check colors as the native Select, per state color.
const OPTION_HOVER: Record<string, string> = {
  default: 'hover:bg-muted focus-visible:bg-muted',
  primary: 'hover:bg-primary/10 focus-visible:bg-primary/10',
  danger: 'hover:bg-destructive/10 focus-visible:bg-destructive/10',
  success: 'hover:bg-success/10 focus-visible:bg-success/10',
  warning: 'hover:bg-warning/10 focus-visible:bg-warning/10',
}
const CHECK_COLOR: Record<string, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  danger: 'text-destructive',
  success: 'text-success',
  warning: 'text-warning',
}
const optionClass = computed(() => OPTION_HOVER[stateColor.value] ?? OPTION_HOVER.default)
const checkClass = computed(() => CHECK_COLOR[stateColor.value] ?? CHECK_COLOR.default)
const panel = ref<HTMLElement | null>(null), ghost = ref<HTMLElement | null>(null)
const filter = ref('')
const shown = computed(() => options.value.filter(option => (option.textValue ?? String(option.label)).toLocaleLowerCase().includes(filter.value.toLocaleLowerCase())))
const { scopedTheme, providerStyle } = useTeleportedModoTheme({ radius, size })
const key = useMorphSelectKeyboard(panel, () => setOpen(false))
function position() {
  const p = panel.value, t = trigger.value
  if (!p || !t) return
  const rect = t.getBoundingClientRect()
  p.style.width = `${rect.width}px`
  if (button.value) { const cs = getComputedStyle(button.value); p.style.setProperty('--modo-morph-select-ghost-px', cs.paddingLeft); p.style.setProperty('--modo-morph-select-ghost-fs', cs.fontSize) }
  const pos = resolvePlacement(rect, { width: p.offsetWidth, height: p.offsetHeight }, { width: innerWidth, height: innerHeight }, props.side, props.align)
  p.style.left = `${pos.left}px`; p.style.top = `${pos.top}px`
  p.style.transformOrigin = `${pos.align === 'end' ? '100%' : pos.align === 'center' ? '50%' : '0%'} ${pos.side === 'top' ? '100%' : '0%'}`
}
watch(phase, async (current, previous, cleanup) => {
  let cancelled = false
  cleanup(() => { cancelled = true; panel.value?.getAnimations?.().forEach(animation => animation.cancel()) })
  if (current === 'closed') {
    filter.value = ''
    if (previous !== 'closed' && restoreFocus.value) button.value?.focus()
    return
  }
  await nextTick(); if (cancelled) return
  position()
  const p = panel.value
  if (!p) return
  if (current === 'opening' || current === 'closing') {
    runMorph({ panel: p, trigger: trigger.value, ghost: ghost.value, preset: MENU_PRESET, direction: current === 'opening' ? 'open' : 'close', onFinish: () => { if (!cancelled) phase.value = current === 'opening' ? 'open' : 'closed' } })
  } else if (current === 'open') {
    (props.searchable ? p.querySelector<HTMLElement>('input') : p.querySelector<HTMLElement>('[role="option"][aria-selected="true"]:not([disabled])') ?? p.querySelector<HTMLElement>('[role="option"]:not([disabled])') ?? p)?.focus()
  }
}, { immediate: true })
watch([() => phase.value === 'open', panel], ([active, el], _, cleanup) => {
  if (!active || !el || !trigger.value) return
  const stop = attachCloseScrub(el, trigger.value, MENU_PRESET, () => setOpen(false))
  cleanup(stop)
}, { flush: 'post' })
watch(() => phase.value === 'opening' || phase.value === 'open', (active, _, cleanup) => {
  if (!active) return
  function outside(event: PointerEvent) { const p = panel.value, target = event.target as Node; if (p && isTopMorphLayer(p) && !p.contains(target) && !trigger.value?.contains(target)) setOpen(false, false) }
  function scroll(event: Event) { if (!panel.value?.contains(event.target as Node)) setOpen(false, false) }
  function resize() { setOpen(false) }
  document.addEventListener('pointerdown', outside); document.addEventListener('scroll', scroll, true); window.addEventListener('resize', resize)
  cleanup(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', resize) })
})
watch([filter, () => props.side, () => props.align, () => options.value.length], () => nextTick(position))
onBeforeUnmount(() => panel.value?.getAnimations?.().forEach(animation => animation.cancel()))
</script>
<template>
  <Teleport to="body">
    <div v-if="phase !== 'closed'" ref="panel" tabindex="-1" class="modo-morph-select-panel text-foreground" data-modo-morph-select-panel="" data-modo-morph-layer=""
      :data-modo-phase="phase" :data-modo-theme="scopedTheme" :data-modo-color="stateColor" :inert="phase === 'closing'" :style="[providerStyle, { position: 'fixed' }]" @keydown="key">
      <div v-if="searchable" class="modo-morph-select__search">
        <input v-model="filter" type="text" autocomplete="off" spellcheck="false" :placeholder="searchLabel" :aria-label="searchLabel" :aria-controls="`${fieldId}-listbox`"
          class="modo-morph-select__search-input w-full border border-input bg-transparent text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60" />
      </div>
      <div :id="`${fieldId}-listbox`" role="listbox" :aria-labelledby="fieldId" class="modo-morph-select__list">
        <button v-for="option in shown" :key="option.value" type="button" role="option" tabindex="-1"
          :class="['modo-morph-select__option outline-none', option.value === value ? 'font-medium' : '', option.disabled ? 'text-muted-foreground/60' : optionClass]"
          :aria-selected="option.value === value" :disabled="option.disabled" :data-text-value="option.textValue ?? String(option.label)" @click="select(option.value)">
          <span class="modo-morph-select__option-text"><slot name="option" :option="option" :selected="option.value === value"><span class="truncate"><RenderContent :content="option.label" /></span><span v-if="option.description" class="text-caption text-muted-foreground font-normal"><RenderContent :content="option.description" /></span></slot></span>
          <CheckIcon v-if="option.value === value" :class="['modo-morph-select__check shrink-0', checkClass]" aria-hidden="true" />
        </button>
      </div>
      <p v-if="!shown.length" role="status" class="modo-morph-select__empty text-caption text-muted-foreground text-center">{{ emptyLabel }}</p>
      <div v-if="phase === 'closing'" class="modo-morph-select-ghost" aria-hidden="true"><span ref="ghost" class="modo-morph-select-ghost__inner"><RenderContent :content="options.find(option => option.value === value)?.label" /></span></div>
    </div>
  </Teleport>
</template>
