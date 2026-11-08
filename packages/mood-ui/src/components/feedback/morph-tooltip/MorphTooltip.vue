<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, toRef, useId, watch } from 'vue'
import type { MorphTooltipProps, MorphTooltipTriggerMode } from '../../../interfaces/feedback/MorphTooltip.interface'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
import { tooltipKey, markTooltipHidden, tooltipsAreWarm } from './MorphTooltipContext'

const props = withDefaults(defineProps<MorphTooltipProps>(), {
  open: undefined,
  defaultOpen: false,
  trigger: () => ['hover', 'focus'] as MorphTooltipTriggerMode[],
  openDelay: 200,
  closeDelay: 100,
  disabled: false,
})
const emit = defineEmits<{ 'update:open': [value: boolean]; openChange: [value: boolean]; show: []; hide: [] }>()

const internal = ref(props.defaultOpen)
const isControlled = computed(() => props.open !== undefined)
const open = computed(() => !props.disabled && (isControlled.value ? !!props.open : internal.value))
const phase = ref<MorphPhase>('closed')
const trigger = ref<HTMLElement | null>(null)
const modes = computed<MorphTooltipTriggerMode[]>(() => Array.isArray(props.trigger) ? props.trigger : [props.trigger])
const has = (mode: MorphTooltipTriggerMode) => modes.value.includes(mode)

let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
let lastPointer = ''
function clearTimers() { clearTimeout(openTimer); clearTimeout(closeTimer); openTimer = closeTimer = undefined }
function set(value: boolean) {
  clearTimers()
  if (value && props.disabled) return
  if (value === open.value) return
  internal.value = value
  if (!value) markTooltipHidden()
  emit('update:open', value); emit('openChange', value); if (value) emit('show'); else emit('hide')
}
const show = () => set(true)
const hide = () => set(false)
function scheduleOpen() {
  if (props.disabled) return
  clearTimeout(closeTimer); closeTimer = undefined
  if (open.value || openTimer) return
  if (tooltipsAreWarm()) { show(); return }
  openTimer = setTimeout(show, Math.max(0, props.openDelay))
}
function scheduleClose() {
  clearTimeout(openTimer); openTimer = undefined
  if (!open.value || closeTimer) return
  closeTimer = setTimeout(hide, Math.max(0, props.closeDelay))
}

function onPointerEnter(e: PointerEvent) { if (e.pointerType !== 'touch' && has('hover')) scheduleOpen() }
function onPointerLeave(e: PointerEvent) { if (e.pointerType !== 'touch' && has('hover')) scheduleClose() }
function onPointerDown(e: PointerEvent) {
  lastPointer = e.pointerType
  // Touch has no hover: a tap toggles the tooltip instead (outside taps and
  // scrolling close it, see MorphTooltipContent).
  if (e.pointerType === 'touch') { if (has('hover') || has('click')) set(!open.value); return }
  // Pressing the control dismisses an informational (hover) tooltip.
  if (!has('click')) hide()
}
function onClick() {
  const fromTouch = lastPointer === 'touch'
  lastPointer = ''
  if (fromTouch || !has('click')) return
  set(!open.value)
}
function onFocus(e: FocusEvent) {
  if (!has('focus')) return
  let visible = true
  try { visible = (e.currentTarget as HTMLElement).matches(':focus-visible') } catch { /* old engines */ }
  if (visible) show()
}
function onBlur() { if (has('focus')) hide() }

watch(() => props.disabled, value => { if (value) hide() })
watch(open, value => { phase.value = value ? 'opening' : phase.value === 'closed' ? 'closed' : 'closing' }, { immediate: true })
onBeforeUnmount(clearTimers)
provide(tooltipKey, {
  id: `modo-morph-tooltip-${useId()}`, open, phase, trigger, disabled: toRef(props, 'disabled'),
  show, hide, onPointerEnter, onPointerLeave, onPointerDown, onClick, onFocus, onBlur,
})
</script>
<template><slot :open="open" /></template>
