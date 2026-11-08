import type { Component, VNodeChild } from 'vue'
import type { ModoRadius, ModoSize } from '../../config/ModoConfig'
import type { ToastColor, ToastPlacement, ToastVariant } from './Toast.interface'
import type { LiquidToastController } from '../../components/feedback/liquid-toast/liquidToast'

/** Same color scale as the native `Toast` / `useToast`. @default 'neutral' */
export type LiquidToastColor = ToastColor | 'neutral'
/** Same variants and token mapping as the native `Toast`. @default 'liquid' */
export type LiquidToastVariant = ToastVariant | 'liquid'
/** Same placements as the native `ToastContainer`. */
export type LiquidToastPlacement = ToastPlacement

/** Same shape as the native `ToastAction`: dismisses after `onClick` unless `keepOpen`. */
export interface LiquidToastAction {
  label: string
  onClick?: (close: () => void) => void
  keepOpen?: boolean
}

export interface LiquidToastOptions {
  /** Stable id. Re-showing with the same id updates the toast in place. */
  id?: string | number
  title: VNodeChild
  description?: VNodeChild
  /** @default 'neutral' */
  color?: LiquidToastColor
  /** @default the toaster's `defaultVariant` ('liquid') */
  variant?: LiquidToastVariant
  /** @default the toaster's `radius`, then the provider */
  radius?: ModoRadius
  /** @default the toaster's `size`, then the provider */
  size?: ModoSize
  /** Custom glyph inside the dot. Defaults to a per-color glyph. */
  icon?: Component
  /** Hide the dot entirely. */
  hideIcon?: boolean
  /** Milliseconds; `0` keeps the toast until dismissed. @default the toaster's `defaultDuration` (4000) */
  duration?: number
  action?: LiquidToastAction
  loading?: boolean
  /** Show the close button (and allow click-to-dismiss). @default true */
  dismissable?: boolean
  /** Pause the timer while the pointer is over the toast (remaining time is kept). @default true */
  pauseOnHover?: boolean
  /** Per-toast placement override. @default the toaster's `placement` */
  placement?: LiquidToastPlacement
}

export interface LiquidToastItem extends Omit<LiquidToastOptions, 'id'> {
  id: string | number
  color: LiquidToastColor
  revision: number
  leaving: boolean
}

/**
 * Host that renders the liquid toasts pushed through `liquidToast` (or a
 * `createLiquidToast()` instance). Mount it once; it follows ModoProvider for
 * color, radius, size and dark mode.
 */
export interface LiquidToasterProps {
  /** Stack placement. @default 'top-center' */
  placement?: LiquidToastPlacement
  /** Toasts on stage per placement; the rest wait as peeks behind the last one. @default 1 */
  max?: number
  /** Duration for toasts that don't set one. @default 4000 */
  defaultDuration?: number
  /** Variant for toasts that don't set one. @default 'liquid' */
  defaultVariant?: LiquidToastVariant
  /** Distance from the viewport edge in px. @default 16 */
  offset?: number
  /** Radius for every toast (a toast's own `radius` wins). @default provider */
  radius?: ModoRadius
  /** Size for every toast (a toast's own `size` wins). @default provider */
  size?: ModoSize
  /** Isolated state from `createLiquidToast()`. @default the shared `liquidToast` */
  controller?: LiquidToastController
  /** Accessible name of the region. @default locale `liquidToast.region` */
  ariaLabel?: string
}
