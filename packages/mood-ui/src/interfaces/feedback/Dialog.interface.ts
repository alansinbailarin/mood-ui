import type { Component } from 'vue'
import type { ModoColor, ModoRadius, ModoSize } from '../../config/ModoConfig'

export type DialogPlacement = 'trigger' | 'center'
export type DialogSide = 'auto' | 'top' | 'bottom'
export type DialogAlign = 'auto' | 'start' | 'center' | 'end'
export type DialogSurface = 'auto' | 'trigger'
/** Panel width preset, same names and steps as `ModalSize`. */
export type DialogWidth = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'full'
export type DialogButtonVariant = 'normal' | 'outline' | 'ghost' | 'text'

export interface DialogProps {
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
   * Accent color shared by the trigger, close buttons and icon.
   * Inherits from `ModoProvider` when omitted.
   */
  color?: ModoColor
}

export interface DialogContentProps {
  /**
   * Where the dialog settles on screen:
   * - `'trigger'` — collision-aware position near the trigger element
   * - `'center'` — centered in the viewport with a dimmed backdrop
   * @default 'trigger'
   */
  placement?: DialogPlacement

  /**
   * Preferred vertical side relative to the trigger when `placement="trigger"`.
   * @default 'auto'
   */
  side?: DialogSide

  /**
   * Horizontal alignment relative to the trigger when `placement="trigger"`.
   * @default 'auto'
   */
  align?: DialogAlign

  /**
   * Surface color adoption:
   * - `'auto'` — uses the standard dialog surface (`--card`)
   * - `'trigger'` — inherits the trigger's background (lightly tinted with the
   *   resolved `color`) and text color
   * @default 'auto'
   */
  surface?: DialogSurface

  /**
   * Panel width, same steps as `Modal`'s `size`:
   * `xsmall` 20rem · `small` 24rem · `medium` 28rem · `large` 42rem ·
   * `xlarge` 56rem · `full` the whole viewport.
   * @default 'medium'
   */
  width?: DialogWidth

  /**
   * Density (panel padding). Inherits from `ModoProvider` when omitted.
   */
  size?: ModoSize

  /**
   * Accent color for the close button and icon. Inherits from `<Dialog>` and then `ModoProvider`.
   */
  color?: ModoColor

  /**
   * Corner radius. Inherits from `ModoProvider` when omitted.
   */
  radius?: ModoRadius

  /**
   * Whether outside click, `Escape`, and pull-to-close gestures dismiss the dialog.
   * Automatically defaults to `false` when `alert` is `true` unless explicitly overridden.
   */
  dismissable?: boolean

  /**
   * Switches semantics to `role="alertdialog"`, disables outside dismissal by default,
   * and hides the header close button so the user must pick an explicit action.
   * @default false
   */
  alert?: boolean

  /**
   * Accessible label for the header close button. Defaults to the locale's `common.close`.
   */
  closeLabel?: string

  /**
   * Accessible name used when there is no `DialogTitle`. Defaults to the locale's `dialog.label`.
   */
  ariaLabel?: string
}

/** Props shared by the default (non-`asChild`) Trigger and Close buttons. */
export interface DialogButtonProps {
  /**
   * Render the slotted element instead of a `Button`.
   * @default false
   */
  asChild?: boolean

  /** Button text when no slot is given. */
  label?: string

  /** `Button` variant. */
  variant?: DialogButtonVariant

  /** Button color. Inherits from the dialog / sheet, then `ModoProvider`. */
  color?: ModoColor

  /** Button size. Inherits from `ModoProvider` when omitted. */
  size?: ModoSize

  /** Button radius. Inherits from `ModoProvider` when omitted. */
  radius?: ModoRadius

  /** Optional leading icon. */
  icon?: Component

  /** Disables the button. */
  disabled?: boolean
}

export type DialogTriggerProps = DialogButtonProps
export type DialogCloseProps = DialogButtonProps

export interface DialogIconProps {
  /**
   * Icon tile color. Inherits from the dialog content, then `ModoProvider`.
   */
  color?: ModoColor

  /**
   * Tile size (32/36/40/48px). Inherits from the dialog content, then `ModoProvider`.
   */
  size?: ModoSize

  /**
   * Tile corner radius. Inherits from the dialog content, then `ModoProvider`.
   */
  radius?: ModoRadius
}
