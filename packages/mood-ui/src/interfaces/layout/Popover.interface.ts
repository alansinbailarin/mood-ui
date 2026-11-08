import type { ModoColor, ModoRadius, ModoSize } from '../../config/ModoConfig'
import type { Button } from '../forms/Button.interface'

export type PopoverSide = 'auto' | 'top' | 'bottom'
export type PopoverAlign = 'auto' | 'start' | 'center' | 'end'
export type PopoverSurface = 'auto' | 'trigger'

export interface PopoverProps {
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
   * Semantic color of the default trigger and close buttons. `'default'`
   * follows the `ModoProvider` color.
   * @default 'default'
   */
  color?: ModoColor

  /**
   * Corner radius of the panel and the default trigger (inherits from
   * `ModoProvider` by default).
   */
  radius?: ModoRadius

  /**
   * Size of the default trigger and the panel padding (inherits from
   * `ModoProvider` by default).
   */
  size?: ModoSize
}

export interface PopoverTriggerProps {
  /**
   * Use the slotted element as the trigger instead of rendering a `Button`.
   * @default false
   */
  asChild?: boolean

  /**
   * Variant of the default `Button` trigger.
   * @default 'outline'
   */
  variant?: Button['variant']

  /**
   * Disables the default trigger.
   * @default false
   */
  disabled?: boolean
}

export interface PopoverCloseProps {
  /**
   * Use the slotted element as the close control instead of rendering a `Button`.
   * @default false
   */
  asChild?: boolean

  /**
   * Variant of the default `Button`. Without slot content it renders an
   * icon-only close button labelled with `locale.common.close`.
   * @default 'text'
   */
  variant?: Button['variant']
}

export interface PopoverContentProps {
  /**
   * Preferred vertical placement relative to the trigger.
   * @default 'auto'
   */
  side?: PopoverSide

  /**
   * Preferred horizontal alignment relative to the trigger.
   * @default 'auto'
   */
  align?: PopoverAlign

  /**
   * Surface color adoption:
   * - `'auto'` — uses standard popover surface tokens
   * - `'trigger'` — inherits the trigger's computed background, text, and border colors
   * @default 'auto'
   */
  surface?: PopoverSurface

  /**
   * Whether outside click, `Escape`, and pull-to-close gestures dismiss the popover.
   * @default true
   */
  dismissable?: boolean

  /**
   * Corner radius override for the panel (defaults to the `Popover` / provider radius).
   */
  radius?: ModoRadius

  /**
   * Padding scale override for the panel (defaults to the `Popover` / provider size).
   */
  size?: ModoSize
}
