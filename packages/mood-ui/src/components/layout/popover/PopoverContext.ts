import { inject } from 'vue'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ModoColor, ModoRadius, ModoSize } from '../../../config/ModoConfig'
import type { MorphPhase } from '../../../utils/morph/morphEngine'

export interface PopoverContextValue {
  open: Ref<boolean>
  phase: Ref<MorphPhase>
  setOpen: (next: boolean) => void
  setPhase: (next: MorphPhase) => void
  triggerEl: Ref<HTMLElement | null>
  /** Id of the element that names the panel (the trigger), when one exists. */
  triggerId: Ref<string | undefined>
  popoverId: string
  /** Color / radius / size resolved against the provider on `<Popover>`. */
  color: ComputedRef<ModoColor>
  radius: ComputedRef<ModoRadius>
  size: ComputedRef<ModoSize>
}

export const POPOVER_CONTEXT_KEY: InjectionKey<PopoverContextValue> = Symbol('ModoPopoverContext')

export function usePopoverContext(): PopoverContextValue {
  const ctx = inject(POPOVER_CONTEXT_KEY, null)
  if (!ctx) {
    throw new Error('[mood-ui] Popover subcomponents must be used inside <Popover>')
  }
  return ctx
}
