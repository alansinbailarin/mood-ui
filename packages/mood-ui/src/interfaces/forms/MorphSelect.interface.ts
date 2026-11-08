import type { VNodeChild } from 'vue'
import type { ModoColor, ModoHalo, ModoRadius, ModoSize } from '../../config/ModoConfig'

export interface MorphSelectOption { value: string; label: VNodeChild; description?: VNodeChild; disabled?: boolean; textValue?: string }

/**
 * Root of the compound select. Holds the value, the options and every
 * field prop (same set as the native `Select`); `MorphSelect.Trigger`
 * renders the field (label, helper/error) and `MorphSelect.Content` the panel.
 */
export interface MorphSelectProps {
  options: readonly MorphSelectOption[]
  /** v-model. When omitted the select is uncontrolled (`defaultValue`). */
  modelValue?: string
  /** Initial value when uncontrolled; also the value restored on form reset. */
  defaultValue?: string

  /** Visible label above the field. */
  label?: string
  /** Helper text under the field (hidden when `errorText` is set). */
  helperText?: string
  /** Error message under the field. */
  errorText?: string
  /** Forces the invalid state without rendering `errorText` (e.g. inside FormField). */
  invalid?: boolean

  /** Semantic family for focus/selection accents. Cascades from `ModoProvider`. */
  color?: ModoColor
  /** Size. Cascades from `ModoProvider`. */
  size?: ModoSize
  /** Field and panel radius. Cascades from `ModoProvider`. */
  radius?: ModoRadius
  /** Persistent field halo. Cascades from `ModoProvider`. */
  halo?: ModoHalo

  disabled?: boolean
  readonly?: boolean
  required?: boolean
  /** Stretches the field to the container width. @default true */
  fullWidth?: boolean

  /** Trigger id (auto-generated, or taken from a parent FormField). */
  id?: string
  /** HTML name of the hidden input submitted with the form. */
  name?: string
  /** Accessible name when there is no visible `label`. */
  ariaLabel?: string
  /** Extra ids appended to `aria-describedby` (e.g. from a FormField slot). */
  ariaDescribedBy?: string
}

export interface MorphSelectTriggerProps {
  /** Placeholder when nothing is selected. Defaults to the `morphSelect.placeholder` locale string. */
  placeholder?: string
  /** Field look, same variants as the native `Select`. @default 'outline' */
  variant?: 'outline' | 'filled' | 'ghost'
}

export interface MorphSelectContentProps {
  side?: 'auto' | 'top' | 'bottom'
  align?: 'auto' | 'start' | 'center' | 'end'
  searchable?: boolean
  /** Defaults to the `morphSelect.searchPlaceholder` locale string. */
  searchPlaceholder?: string
  /** Defaults to the `morphSelect.empty` locale string. */
  emptyMessage?: string
}
