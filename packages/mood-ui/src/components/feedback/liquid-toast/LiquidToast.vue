<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LiquidToastItem, LiquidToastVariant } from '../../../interfaces/feedback/LiquidToast.interface'
import type { ModoRadius, ModoSize } from '../../../config/ModoConfig'
import { useModoLocale, useResolvedRadius, useResolvedSize } from '../../../composables/useModoConfig'
import { prefersReducedMotion } from '../../../utils/morph/morphEngine'
import LiquidToastShape from './LiquidToastShape.vue'
import './liquid-toast.css'

const props = withDefaults(defineProps<{
  item: LiquidToastItem
  peek?: number
  /** Fallbacks from the toaster; the item's own values win. */
  defaultDuration?: number
  defaultVariant?: LiquidToastVariant
  radius?: ModoRadius
  size?: ModoSize
}>(), { peek: 0, defaultDuration: 4500, defaultVariant: 'subtle' })
const emit = defineEmits<{ dismiss: [id: string | number]; remove: [id: string | number] }>()
const loc = useModoLocale()
const resolvedRadius = useResolvedRadius(() => props.item.radius ?? props.radius)
const resolvedSize = useResolvedSize(() => props.item.size ?? props.size)
const variant = computed(() => props.item.variant ?? props.defaultVariant)
const duration = computed(() => props.item.duration ?? props.defaultDuration)
const dismissable = computed(() => props.item.dismissable ?? true)

// Same steps as the native Toast (rounded-none / sm / lg / xl / 2xl). The pill
// keeps its capsule from medium up; none/small square it, and the goo filter is
// tightened (small) or dropped (none) so it can't re-round square corners.
const PANEL_RADIUS: Record<ModoRadius, string> = {
  none: '0px',
  small: 'var(--radius-sm, calc(var(--radius) - 4px))',
  medium: 'var(--radius-lg, var(--radius))',
  large: 'var(--radius-xl, calc(var(--radius) + 4px))',
  full: '1rem',
}
const PILL_RADIUS: Record<ModoRadius, string> = { none: '0px', small: 'var(--radius-sm, calc(var(--radius) - 4px))', medium: '9999px', large: '9999px', full: '9999px' }
const CONTROL_RADIUS: Record<ModoRadius, string> = {
  none: '0px',
  small: 'var(--radius-sm, calc(var(--radius) - 4px))',
  medium: 'var(--radius-md, calc(var(--radius) - 2px))',
  large: 'var(--radius-lg, var(--radius))',
  full: '9999px',
}
const style = computed(() => ({
  '--modo-liquid-toast-radius': PANEL_RADIUS[resolvedRadius.value],
  '--modo-liquid-toast-pill-radius': PILL_RADIUS[resolvedRadius.value],
  '--modo-liquid-toast-seed-radius': PILL_RADIUS[resolvedRadius.value],
  '--modo-liquid-toast-control-radius': CONTROL_RADIUS[resolvedRadius.value],
  '--modo-liquid-toast-duration': `${duration.value}ms`,
}))

const card = ref<HTMLElement | null>(null)
const bornRevision = props.item.revision, bornAsPeek = props.peek > 0
const phase = computed(() => props.peek > 0 ? 'peek' : props.item.leaving ? 'leaving' : props.item.revision > bornRevision ? 'updating' : bornAsPeek ? 'promoted' : 'entering')
const running = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let exitTimer: ReturnType<typeof setTimeout> | undefined
let started = 0, remaining = duration.value
let hovered = false, focused = false, windowActive = true, mounted = false
let pointer: { id: number; x: number; lastX: number; t: number; velocity: number; moved: boolean } | undefined
let animation: Animation | undefined
let suppressClick = false
/** Stops the clock and keeps the time that was left (like the native Toast). */
function pause() {
  if (!timer) return
  clearTimeout(timer); timer = undefined
  remaining = Math.max(0, remaining - (Date.now() - started))
  running.value = false
}
function resume() {
  if (!mounted || timer || hovered || focused || !windowActive || document.hidden || props.peek || props.item.leaving || props.item.loading || duration.value <= 0) return
  started = Date.now(); running.value = true
  timer = setTimeout(() => { timer = undefined; running.value = false; emit('dismiss', props.item.id) }, remaining)
}
function hover(value: boolean) { hovered = value && (props.item.pauseOnHover ?? true); hovered ? pause() : resume() }
function focus(value: boolean) { focused = value; value ? pause() : resume() }
function visibility() { document.hidden ? pause() : resume() }
function blur() { windowActive = false; pause() }
function wake() { windowActive = true; resume() }
watch(() => [props.item.revision, duration.value, props.peek, props.item.leaving, props.item.loading], () => {
  pause(); remaining = duration.value; clearTimeout(exitTimer)
  if (props.item.leaving) {
    if (props.peek || prefersReducedMotion()) emit('remove', props.item.id)
    else exitTimer = setTimeout(() => emit('remove', props.item.id), 650)
  } else resume()
})
onMounted(() => {
  mounted = true; resume()
  document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', blur); window.addEventListener('focus', wake)
})
onBeforeUnmount(() => {
  clearTimeout(timer); clearTimeout(exitTimer); animation?.cancel()
  document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', blur); window.removeEventListener('focus', wake)
})
function start(e: PointerEvent) {
  if (props.peek || props.item.leaving || !dismissable.value || e.button > 0 || (e.target as HTMLElement).closest('button')) return
  suppressClick = false
  pointer = { id: e.pointerId, x: e.clientX, lastX: e.clientX, t: e.timeStamp, velocity: 0, moved: false }
  pause()
}
function move(e: PointerEvent) {
  if (!pointer || pointer.id !== e.pointerId || !card.value) return
  const dx = e.clientX - pointer.x
  if (Math.abs(dx) > 10) { pointer.moved = true; card.value.setPointerCapture?.(e.pointerId) }
  if (!pointer.moved) return
  pointer.velocity = (e.clientX - pointer.lastX) / Math.max(1, e.timeStamp - pointer.t)
  pointer.lastX = e.clientX; pointer.t = e.timeStamp
  card.value.style.transform = `translateX(${dx}px)`
  card.value.style.opacity = String(Math.max(.2, 1 - Math.abs(dx) / 260))
}
function end(e: PointerEvent) {
  const p = pointer, el = card.value
  if (!p || p.id !== e.pointerId || !el) return
  pointer = undefined
  if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId)
  const dx = e.clientX - p.x
  suppressClick = p.moved
  const dismiss = e.type !== 'pointercancel' && p.moved && (Math.abs(dx) > 90 || Math.abs(p.velocity) > .55)
  el.style.transform = ''; el.style.opacity = ''
  if (dismiss) {
    if (prefersReducedMotion() || !el.animate) { emit('remove', props.item.id); return }
    animation = el.animate([{ transform: `translateX(${dx}px)`, opacity: 1 }, { transform: `translateX(${Math.sign(dx) * (el.offsetWidth + 48)}px)`, opacity: 0 }], { duration: 200, fill: 'forwards' })
    animation.onfinish = () => emit('remove', props.item.id)
  } else {
    if (p.moved && !prefersReducedMotion() && el.animate) animation = el.animate([{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }], { duration: 240, easing: 'cubic-bezier(.25,.8,.3,1)' })
    resume()
  }
}
function click() { if (!suppressClick && !props.peek && dismissable.value) emit('dismiss', props.item.id); suppressClick = false }
function close() { emit('dismiss', props.item.id) }
function action() {
  const a = props.item.action
  if (!a) return
  a.onClick?.(close)
  if (!a.keepOpen) close()
}
</script>
<template>
  <!-- No live role here: the toaster announces through its own two live
       regions, so a toast is never read twice. -->
  <div ref="card" class="modo-liquid-toast" data-modo-liquid-toast=""
    :data-modo-color="item.color" :data-modo-variant="variant" :data-modo-radius="resolvedRadius" :data-modo-size="resolvedSize"
    :data-modo-phase="phase" :data-modo-running="running || undefined"
    :data-modo-peek="peek || undefined" :aria-hidden="peek ? true : undefined" :inert="peek > 0 || item.leaving" :style="style"
    @pointerenter="hover(true)" @pointerleave="hover(false)" @focusin="focus(true)" @focusout="focus(false)"
    @pointerdown="start" @pointermove="move" @pointerup="end" @pointercancel="end" @click="click">
    <div class="modo-liquid-toast__shade" aria-hidden="true"><LiquidToastShape :item="item" :dismissable="dismissable" /></div>
    <div class="modo-liquid-toast__goo" aria-hidden="true"><LiquidToastShape :item="item" :dismissable="dismissable" /></div>
    <div class="modo-liquid-toast__ink"><LiquidToastShape :item="item" ink :dismissable="dismissable" :progress="duration > 0 && !item.loading" :close-label="loc.common.dismiss" @action="action" @dismiss="close" /></div>
  </div>
</template>
