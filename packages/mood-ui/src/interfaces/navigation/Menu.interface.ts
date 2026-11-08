import type { Component } from 'vue'
import type { ModoColor, ModoRadius, ModoSize } from '../../config/ModoConfig'
import type { Button } from '../forms/Button.interface'

export type MenuSide = 'auto' | 'top' | 'bottom'
export type MenuAlign = 'auto' | 'start' | 'center' | 'end'
export type MenuSurface = 'auto' | 'trigger'

interface MenuThemeProps {
  /**
   * Semantic color. On `Menu` it colors the default trigger (`'default'`
   * follows the `ModoProvider` color). An explicit `'danger'` also turns
   * every item without its own `color` into a danger row, like `DropdownMenu`.
   * @default 'default'
   */
  color?: ModoColor

  /**
   * Corner radius of the panel, its rows and the default trigger (inherits
   * from `ModoProvider` by default).
   */
  radius?: ModoRadius

  /**
   * Size of the default trigger, the row padding and the item icons
   * (inherits from `ModoProvider` by default).
   */
  size?: ModoSize
}

export interface MenuProps extends MenuThemeProps {
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
}

export interface MenuTriggerProps {
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

export interface MenuContentProps {
  /**
   * Preferred vertical placement relative to the trigger (`Menu` only).
   * @default 'auto'
   */
  side?: MenuSide

  /**
   * Preferred horizontal alignment relative to the trigger (`Menu` only).
   * @default 'auto'
   */
  align?: MenuAlign

  /**
   * Surface color adoption (`Menu` only):
   * - `'auto'` — uses standard menu surface tokens
   * - `'trigger'` — inherits the trigger's computed background, text, and border colors
   * @default 'auto'
   */
  surface?: MenuSurface

  /**
   * Corner radius override for the panel (defaults to the `Menu` / provider radius).
   */
  radius?: ModoRadius

  /**
   * Size override for the panel rows (defaults to the `Menu` / provider size).
   */
  size?: ModoSize
}

export interface MenuItemProps {
  /**
   * Optional leading icon component (e.g. from `@heroicons/vue`).
   */
  icon?: Component

  /**
   * Optional keyboard shortcut string (e.g. `'⌘D'`, `'⌫'`, `'⇧⌘P'`, `'Ctrl+S'`).
   * Displays a muted hint AND binds a live keydown listener while the menu is open.
   */
  shortcut?: string

  /**
   * Semantic color of the row. `'danger'` renders a destructive action
   * (red text, red-tinted highlight), like `DropdownMenu` danger items.
   * When omitted the row inherits an explicit `'danger'` from the menu,
   * otherwise it stays neutral.
   */
  color?: ModoColor

  /**
   * Disables click, keyboard selection, and shortcut execution.
   * @default false
   */
  disabled?: boolean
}

export interface ContextMenuProps extends MenuThemeProps {
  /**
   * Controlled open state (`v-model:open` or `v-model`).
   */
  open?: boolean

  /**
   * Alias for `v-model` open state.
   */
  modelValue?: boolean
}
