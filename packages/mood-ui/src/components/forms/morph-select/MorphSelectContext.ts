import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { ModoColor, ModoHalo, ModoRadius, ModoSize } from '../../../config/ModoConfig'
import type { MorphSelectOption } from '../../../interfaces/forms/MorphSelect.interface'
import type { MorphPhase } from '../../../utils/morph/morphEngine'
interface SelectContext {
  /** Trigger id (FormField-aware); the listbox is `${fieldId}-listbox`. */
  fieldId: ComputedRef<string>
  options: Ref<readonly MorphSelectOption[]>; value: Ref<string>
  disabled: ComputedRef<boolean>; readonly: ComputedRef<boolean>; required: ComputedRef<boolean>
  label: ComputedRef<string | undefined>; ariaLabel: ComputedRef<string | undefined>
  helperText: ComputedRef<string | undefined>; errorText: ComputedRef<string | undefined>
  hasError: ComputedRef<boolean>; stateColor: ComputedRef<ModoColor>
  radius: ComputedRef<ModoRadius>; size: ComputedRef<ModoSize>; halo: ComputedRef<ModoHalo | undefined>
  fullWidth: ComputedRef<boolean>
  errorId: ComputedRef<string>; helperId: ComputedRef<string>; describedBy: ComputedRef<string | undefined>
  phase: Ref<MorphPhase>; open: Ref<boolean>; trigger: Ref<HTMLElement | null>; button: Ref<HTMLButtonElement | null>
  select: (value: string) => void; setOpen: (value: boolean, restore?: boolean) => void; restoreFocus: Ref<boolean>
}
export const selectKey: InjectionKey<SelectContext> = Symbol('MorphSelect')
export function useMorphSelect() { const ctx = inject(selectKey); if (!ctx) throw new Error('[mood-ui] MorphSelect parts require MorphSelect'); return ctx }
