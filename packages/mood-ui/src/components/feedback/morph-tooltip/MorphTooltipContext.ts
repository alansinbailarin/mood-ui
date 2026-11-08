import { inject, type InjectionKey, type Ref } from 'vue'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
export interface TooltipContext {
  id: string
  open: Ref<boolean>
  phase: Ref<MorphPhase>
  trigger: Ref<HTMLElement | null>
  disabled: Ref<boolean>
  /** Opens immediately (keyboard focus, touch, click). */
  show: () => void
  /** Closes immediately (Escape, outside touch, scroll on touch). */
  hide: () => void
  onPointerEnter: (e: PointerEvent) => void
  onPointerLeave: (e: PointerEvent) => void
  onPointerDown: (e: PointerEvent) => void
  onClick: () => void
  onFocus: (e: FocusEvent) => void
  onBlur: () => void
}
export const tooltipKey: InjectionKey<TooltipContext> = Symbol('MorphTooltip')
export function useMorphTooltip() { const value = inject(tooltipKey); if (!value) throw new Error('[mood-ui] MorphTooltip parts require MorphTooltip'); return value }
let lastHiddenAt = 0
export function markTooltipHidden() { lastHiddenAt = Date.now() }
export function tooltipsAreWarm() { return Date.now() - lastHiddenAt < 300 }
