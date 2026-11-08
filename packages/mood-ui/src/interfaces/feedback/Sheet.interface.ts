import type { ModoColor, ModoRadius, ModoSize } from '../../config/ModoConfig'
import type { DialogButtonProps } from './Dialog.interface'

export type SheetHeight = 'auto' | 'half' | 'full'

export interface SheetProps {
  /**
   * Controlled open state (`v-model:open` or `v-model`).
   */
  open?: boolean

  /**
   * Alias for `v-model` open state.
   */
  modelValue?: boolean

  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean

  /**
   * Accent color shared by the trigger and close buttons.
   * Inherits from `ModoProvider` when omitted.
   */
  color?: ModoColor
}

export interface SheetContentProps {
  /**
   * Resting detent height of the bottom sheet:
   * - `'auto'` — sizes to content up to `85dvh`
   * - `'half'` — `50dvh`
   * - `'full'` — the viewport minus the top safe area
   * @default 'auto'
   */
  height?: SheetHeight

  /**
   * Allows dragging the sheet upward (or scrolling past the top) into the full-height detent.
   * @default false
   */
  expandable?: boolean

  /**
   * Allows backdrop click, `Escape` key, and downward pull-to-dismiss gestures.
   * @default true
   */
  dismissable?: boolean

  /**
   * Density (panel padding). Inherits from `ModoProvider` when omitted.
   */
  size?: ModoSize

  /**
   * Accent color for the close button. Inherits from `<Sheet>` and then `ModoProvider`.
   */
  color?: ModoColor

  /**
   * Corner radius. Inherits from `ModoProvider` when omitted.
   */
  radius?: ModoRadius

  /**
   * Accessible label for the header close button. Defaults to the locale's `common.close`.
   */
  closeLabel?: string

  /**
   * Accessible name used when there is no `SheetTitle`. Defaults to the locale's `sheet.label`.
   */
  ariaLabel?: string
}

export type SheetTriggerProps = DialogButtonProps
export type SheetCloseProps = DialogButtonProps
