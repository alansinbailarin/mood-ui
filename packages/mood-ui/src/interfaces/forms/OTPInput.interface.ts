import type { ModoSize } from '../../config/ModoConfig';

export interface OTPInput {
  /** The full OTP string value (v-model). */
  modelValue?: string;

  /**
   * Number of input slots.
   * @default 6
   */
  length?: number;

  /**
   * Mask slot values (render as `•` using `type="password"`).
   * @default false
   */
  mask?: boolean;

  /**
   * Restrict input to digits only. Set to `false` for alphanumeric OTPs.
   * @default true
   */
  numeric?: boolean;

  /**
   * Slot index after which a separator dash `—` is rendered.
   * E.g. `separator=3` on a 6-slot OTP renders `XXX — XXX`.
   */
  separator?: number;

  /** Visible label above the slots. */
  label?: string;
  /** Helper text (hidden when errorText is present). */
  helperText?: string;
  /** Error message. Marks the field as invalid when set. */
  errorText?: string;

  /** Semantic color applied to focus ring and accent states. */
  color?: "default" | "primary" | "danger" | "success" | "warning";
  /** Slot size. */
  size?: ModoSize;
  /** Corner radius for each slot. Inherits from ModoProvider when omitted. */
  radius?: "none" | "small" | "medium" | "large" | "full";
  /**
   * Persistent halo (ring) style.
   * - `'tinted'` (default): tinted to the active color on hover/focus.
   * - `'neutral'`: always grey.
   * - `'off'`: no persistent ring, only focus-visible ring.
   */
  halo?: "tinted" | "neutral" | "off";

  /** Applies `w-full` to the root element. */
  fullWidth?: boolean;
  /** Disables all slots. */
  disabled?: boolean;
  /** Read-only mode: shows values but prevents editing. */
  readonly?: boolean;
  /** Marks the group as required. */
  required?: boolean;
  /** Auto-focus the first slot on mount. */
  autofocus?: boolean;
  /** Shows a loading spinner (implies disabled). */
  loading?: boolean;

  /** HTML `name` attribute for the hidden native input (form submission). */
  name?: string;
  /** id prefix. Auto-generated if omitted. */
  id?: string;

  /** Accessible name for the slot group when no visible `label` is provided. */
  ariaLabel?: string;
  /** Forces the invalid state without rendering `errorText`. Useful inside `FormField`. */
  invalid?: boolean;
  /** Extra IDs to concatenate into `aria-describedby`. */
  ariaDescribedBy?: string;
}
