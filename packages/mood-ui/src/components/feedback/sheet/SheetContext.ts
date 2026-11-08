import { inject } from 'vue'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ModoColor } from '../../../config/ModoConfig'
import type { MorphPhase } from '../../../utils/morph/morphEngine'

export interface SheetContextValue {
  open: Ref<boolean>
  phase: Ref<MorphPhase>
  setOpen: (next: boolean) => void
  setPhase: (next: MorphPhase) => void
  triggerEl: Ref<HTMLElement | null>
  /** Raw `color` prop of the root (undefined → provider). */
  color: ComputedRef<ModoColor | undefined>
  sheetId: string
}

export const SHEET_CONTEXT_KEY: InjectionKey<SheetContextValue> = Symbol('ModoSheetContext')

export function useSheetContext(): SheetContextValue {
  const ctx = inject(SHEET_CONTEXT_KEY, null)
  if (!ctx) {
    throw new Error('[mood-ui] Sheet subcomponents must be used inside <Sheet>')
  }
  return ctx
}
