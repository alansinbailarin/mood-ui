<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { MorphTooltipContentProps } from '../../../interfaces/feedback/MorphTooltip.interface'
import type { ModoColor, ModoRadius } from '../../../config/ModoConfig'
import { useResolvedColor } from '../../../composables/useModoConfig'
import { useTeleportedModoTheme } from '../../../composables/useTeleportedModoTheme'
import { prefersReducedMotion } from '../../../utils/morph/morphEngine'
import { TOOLTIP_ARROW_SIZE, tooltipArrowCross, tooltipArrowInset } from '../../../utils/tooltipArrow'
import { useMorphTooltip } from './MorphTooltipContext'
import { resolveTooltipPosition, type TooltipSide } from './tooltipPlacement'
import './morph-tooltip.css'

const props = withDefaults(defineProps<MorphTooltipContentProps>(), {
  side: 'top', align: 'auto', offset: 8, arrow: true, color: 'default', maxWidth: 260,
})
const { id, phase, trigger, disabled, hide } = useMorphTooltip()
const panel = ref<HTMLElement | null>(null)
const { scopedTheme, providerStyle, resolvedRadius, resolvedSize } = useTeleportedModoTheme({
  radius: () => props.radius, size: () => props.size,
})

/* ---------- Style maps (same as the native Tooltip) ---------- */
const isInverted = computed(() => props.color === 'inverted')
const resolvedColor = useResolvedColor(() => isInverted.value ? undefined : props.color as ModoColor | undefined)
const COLOR_CLASSES: Record<string, string> = {
  default: 'bg-foreground text-background',
  inverted: 'bg-background text-foreground border border-border',
  primary: 'bg-primary text-primary-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
}
const ARROW_COLOR_CLASSES: Record<string, string> = {
  default: 'bg-foreground',
  inverted: 'bg-background',
  primary: 'bg-primary',
  danger: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
}
const colorKey = computed(() => isInverted.value ? 'inverted' : resolvedColor.value)
const colorClasses = computed(() => COLOR_CLASSES[colorKey.value] ?? COLOR_CLASSES.default)
const arrowColorClass = computed(() => ARROW_COLOR_CLASSES[colorKey.value] ?? ARROW_COLOR_CLASSES.default)
const sizeClasses = computed(() => {
  switch (resolvedSize.value) {
    case 'xsmall':
    case 'small': return 'px-2 py-1 text-[11px]'
    case 'large': return 'px-3.5 py-2 text-body'
    default: return 'px-2.5 py-1.5 text-caption'
  }
})
// Resolved radius as a CSS value so the morph keyframes land exactly on the
// class the native Tooltip uses (rounded-none / sm / md / lg / full).
const RADIUS_VALUE: Record<ModoRadius, string> = {
  none: '0px',
  small: 'var(--radius-sm, calc(var(--radius) - 4px))',
  medium: 'var(--radius-md, calc(var(--radius) - 2px))',
  large: 'var(--radius-lg, var(--radius))',
  full: '9999px',
}
// The streak the tooltip grows from: a capsule, except when the provider asks
// for square corners (then it stays square all the way).
const SEED_RADIUS_VALUE: Record<ModoRadius, string> = {
  none: '0px',
  small: 'var(--radius-md, calc(var(--radius) - 2px))',
  medium: '9999px',
  large: '9999px',
  full: '9999px',
}

/* ---------- Positioning ---------- */
const pos = ref<{ left: number; top: number; side: TooltipSide; cross: number } | null>(null)
function position() {
  const el = panel.value, t = trigger.value
  if (!el || !t) return
  const rect = t.getBoundingClientRect()
  const width = el.offsetWidth, height = el.offsetHeight
  const p = resolveTooltipPosition(rect, { width, height }, { width: innerWidth, height: innerHeight }, props.side, props.align, props.offset)
  const vertical = p.side === 'top' || p.side === 'bottom'
  const edge = vertical ? width : height
  const cross = tooltipArrowCross(
    vertical ? rect.left + rect.width / 2 - p.left : rect.top + rect.height / 2 - p.top,
    edge,
    tooltipArrowInset(resolvedRadius.value, edge),
  )
  pos.value = { ...p, cross }
}

const panelStyle = computed<Record<string, string | undefined>>(() => {
  const p = pos.value
  const origin = !p ? undefined
    : p.side === 'top' ? `${p.cross}px 100%`
    : p.side === 'bottom' ? `${p.cross}px 0%`
    : p.side === 'left' ? `100% ${p.cross}px`
    : `0% ${p.cross}px`
  return {
    ...providerStyle.value,
    position: 'fixed',
    left: p ? `${p.left}px` : '0px',
    top: p ? `${p.top}px` : '0px',
    maxWidth: `${props.maxWidth}px`,
    transformOrigin: origin,
    '--modo-morph-tooltip-radius': RADIUS_VALUE[resolvedRadius.value],
    '--modo-morph-tooltip-seed-radius': SEED_RADIUS_VALUE[resolvedRadius.value],
  }
})
const arrowStyle = computed(() => {
  const p = pos.value
  if (!p) return {}
  const cross = `${p.cross - TOOLTIP_ARROW_SIZE / 2}px`
  const out = `-${TOOLTIP_ARROW_SIZE / 2}px`
  switch (p.side) {
    case 'top': return { left: cross, bottom: out }
    case 'bottom': return { left: cross, top: out }
    case 'left': return { top: cross, right: out }
    default: return { top: cross, left: out }
  }
})
// Only the two outward faces of the rotated square get a border (inverted only).
const arrowBorderClass = computed(() => {
  if (!isInverted.value || !pos.value) return ''
  switch (pos.value.side) {
    case 'top': return 'border-r border-b border-border'
    case 'bottom': return 'border-t border-l border-border'
    case 'left': return 'border-t border-r border-border'
    default: return 'border-b border-l border-border'
  }
})

/* ---------- Lifecycle ---------- */
let fallback: ReturnType<typeof setTimeout> | undefined
function finish() { if (phase.value === 'opening') phase.value = 'open'; else if (phase.value === 'closing') { phase.value = 'closed'; pos.value = null } }
function key(e: KeyboardEvent) { if (e.key === 'Escape') hide() }
function reposition() { if (phase.value !== 'closed') position() }
function outsideTouch(e: Event) {
  const target = e.target as Node | null
  if (trigger.value?.contains(target) || panel.value?.contains(target)) return
  hide()
}
watch(phase, async (value, _, cleanup) => {
  clearTimeout(fallback)
  let cancelled = false; cleanup(() => { cancelled = true })
  if (value === 'closed') { pos.value = null; return }
  await nextTick(); if (cancelled) return
  position()
  if (value === 'opening' || value === 'closing') {
    if (prefersReducedMotion()) finish()
    // Safety net in case animationend never fires (tokens: slow 320ms / base 220ms).
    else fallback = setTimeout(finish, value === 'opening' ? 360 : 260)
  }
}, { immediate: true })
watch([() => props.side, () => props.align, () => props.offset], reposition, { flush: 'post' })
watch(() => phase.value !== 'closed', (visible, _, cleanup) => {
  if (!visible || typeof document === 'undefined') return
  // Follow the trigger on scroll/resize (like the native Tooltip) instead of closing.
  document.addEventListener('keydown', key)
  window.addEventListener('scroll', reposition, true)
  window.addEventListener('resize', reposition)
  // Touch has no pointer leave: an outside tap or a scroll gesture ends it.
  document.addEventListener('touchstart', outsideTouch, { passive: true })
  document.addEventListener('touchmove', hide, { passive: true })
  let observer: ResizeObserver | undefined
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(reposition)
    if (trigger.value) observer.observe(trigger.value)
    void nextTick(() => { if (panel.value) observer?.observe(panel.value) })
  }
  cleanup(() => {
    document.removeEventListener('keydown', key)
    window.removeEventListener('scroll', reposition, true)
    window.removeEventListener('resize', reposition)
    document.removeEventListener('touchstart', outsideTouch)
    document.removeEventListener('touchmove', hide)
    observer?.disconnect()
  })
}, { immediate: true })
onBeforeUnmount(() => { clearTimeout(fallback) })
</script>
<template>
  <Teleport to="body">
    <div
      v-if="phase !== 'closed' && !disabled"
      :id="id"
      ref="panel"
      role="tooltip"
      data-modo-morph-tooltip=""
      :data-modo-phase="phase"
      :data-modo-side="pos?.side"
      :data-modo-theme="scopedTheme"
      :class="['pointer-events-none select-none shadow-md', colorClasses, sizeClasses]"
      :style="panelStyle"
      @animationend.self="finish"
    >
      <slot />
      <span
        v-if="arrow && pos"
        aria-hidden="true"
        :class="['modo-morph-tooltip__arrow absolute w-2 h-2 rotate-45', arrowColorClass, arrowBorderClass]"
        :style="arrowStyle"
      />
    </div>
  </Teleport>
</template>
