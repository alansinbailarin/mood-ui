import type { ModoRadius, ModoSize } from '../../config/ModoConfig'

export type MorphTooltipSide = 'auto' | 'top' | 'bottom' | 'left' | 'right'
export type MorphTooltipAlign = 'auto' | 'start' | 'center' | 'end'
/** Same open modes as the native `Tooltip`. `manual` only follows `v-model:open`. */
export type MorphTooltipTriggerMode = 'hover' | 'focus' | 'click' | 'manual'
/** Same palette as the native `Tooltip`; `inverted` is tooltip-only (not a `ModoColor`). */
export type MorphTooltipColor = 'default' | 'inverted' | 'primary' | 'danger' | 'success' | 'warning'

export interface MorphTooltipProps {
  /** v-model:open. Controls visibility from outside (pair with `trigger="manual"`). */
  open?: boolean
  /** Uncontrolled initial state. @default false */
  defaultOpen?: boolean
  /** How the tooltip opens. @default ['hover','focus'] */
  trigger?: MorphTooltipTriggerMode | MorphTooltipTriggerMode[]
  /** Delay before opening on hover (ms). Skipped while another tooltip just closed. @default 200 */
  openDelay?: number
  /** Delay before closing on hover leave (ms). @default 100 */
  closeDelay?: number
  /** Never opens while true. @default false */
  disabled?: boolean
}

export interface MorphTooltipTriggerProps {
  /** Bind the behaviour to the single slotted element instead of rendering a native `Button`. */
  asChild?: boolean
}

export interface MorphTooltipContentProps {
  /** Preferred side; flips when it does not fit. @default 'top' */
  side?: MorphTooltipSide
  /** Alignment along the side. @default 'auto' (centered) */
  align?: MorphTooltipAlign
  /** Distance from the trigger in px. @default 8 */
  offset?: number
  /** Arrow pointing at the trigger, shown once the morph lands. @default true */
  arrow?: boolean
  /** @default 'default' (provider color; `inverted` swaps to the page surface) */
  color?: MorphTooltipColor
  /** @default provider size */
  size?: ModoSize
  /** @default provider radius */
  radius?: ModoRadius
  /** Max width in px. @default 260 */
  maxWidth?: number
}
