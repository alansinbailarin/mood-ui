import type { ModoColor, ModoRadius, ModoSize } from '../../config/ModoConfig'

/**
 * GlassSwitch — same API as the native `Switch`, plus the drag-to-toggle
 * glass lens. Uncontrolled use is supported through `defaultChecked`.
 */
export interface GlassSwitchProps {
  /** v-model (boolean). When omitted the switch is uncontrolled (`defaultChecked`). */
  modelValue?: boolean
  /** Initial state when uncontrolled; also the value restored on form reset. */
  defaultChecked?: boolean

  /** Visible label next to the control. */
  label?: string
  /** Secondary text under the label. */
  description?: string
  /** Helper text under the control (hidden when `errorText` is set). */
  helperText?: string
  /** Error message under the control. */
  errorText?: string
  /** Forces the invalid state without rendering `errorText` (e.g. inside FormField). */
  invalid?: boolean

  /** Semantic family for the "on" state. Cascades from `ModoProvider`. */
  color?: ModoColor
  /** Size. Cascades from `ModoProvider`. */
  size?: ModoSize
  /** Track radius. The thumb stays round. @default 'full' (pill) */
  radius?: ModoRadius

  disabled?: boolean
  readonly?: boolean
  required?: boolean
  /** Disables the control while an async change is pending. */
  loading?: boolean

  /** Label position relative to the control. */
  labelPosition?: 'left' | 'right'
  /** Stretches the field to the container width. */
  fullWidth?: boolean

  /** Input id (auto-generated when omitted). */
  id?: string
  /** HTML name. */
  name?: string
  /** HTML value submitted when checked. @default 'on' */
  value?: string
  /** Accessible name when there is no visible `label`. */
  ariaLabel?: string
}
