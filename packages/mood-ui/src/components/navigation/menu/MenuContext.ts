import { inject } from 'vue'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ModoColor, ModoRadius, ModoSize } from '../../../config/ModoConfig'
import type { MorphPhase, MorphPreset } from '../../../utils/morph/morphEngine'

export interface MenuContextValue {
  open: Ref<boolean>
  phase: Ref<MorphPhase>
  setOpen: (next: boolean) => void
  setPhase: (next: MorphPhase) => void
  triggerEl: Ref<HTMLElement | null>
  /** Id of the element that names the menu (the trigger), when one exists. */
  triggerId: Ref<string | undefined>
  menuId: string
  preset?: MorphPreset
  pointBloom?: boolean
  /** Trigger color resolved against the provider. */
  color: ComputedRef<ModoColor>
  /**
   * Color rows inherit when they have no `color` of their own: only an
   * explicit local `color` on the menu counts (never the provider color),
   * like `DropdownMenu`.
   */
  itemColor: ComputedRef<ModoColor>
  /** Radius / size resolved against the provider (overridden by `MenuContent`). */
  radius: ComputedRef<ModoRadius>
  size: ComputedRef<ModoSize>
}

export const MENU_CONTEXT_KEY: InjectionKey<MenuContextValue> = Symbol('ModoMenuContext')

export function useMenuContext(): MenuContextValue {
  const ctx = inject(MENU_CONTEXT_KEY, null)
  if (!ctx) {
    throw new Error('[mood-ui] Menu subcomponents must be used inside <Menu> or <ContextMenu>')
  }
  return ctx
}

export const CONTEXT_MENU_POINT_KEY: InjectionKey<(point: { x: number; y: number }) => void> =
  Symbol('ModoContextMenuPoint')

export function useContextMenuPoint() {
  const setPoint = inject(CONTEXT_MENU_POINT_KEY, null)
  if (!setPoint) {
    throw new Error('[mood-ui] ContextMenu.Trigger must be used inside <ContextMenu>')
  }
  return setPoint
}
