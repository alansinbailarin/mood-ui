import { inject } from 'vue'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { ModoColor } from '../../../config/ModoConfig'
import type { MorphPhase } from '../../../utils/morph/morphEngine'

export interface DialogContextValue {
  open: Ref<boolean>
  phase: Ref<MorphPhase>
  setOpen: (next: boolean) => void
  setPhase: (next: MorphPhase) => void
  triggerEl: Ref<HTMLElement | null>
  /** Raw `color` prop of the root (undefined → provider). */
  color: ComputedRef<ModoColor | undefined>
  dialogId: string
}

export const DIALOG_CONTEXT_KEY: InjectionKey<DialogContextValue> = Symbol('ModoDialogContext')

export function useDialogContext(): DialogContextValue {
  const ctx = inject(DIALOG_CONTEXT_KEY, null)
  if (!ctx) {
    throw new Error('[mood-ui] Dialog subcomponents must be used inside <Dialog>')
  }
  return ctx
}
