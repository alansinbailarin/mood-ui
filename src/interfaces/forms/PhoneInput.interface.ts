export interface PhoneInput {
    /**
     * v-model — the phone number value.
     * - `format='national'` (default): the raw digits/characters the user typed.
     * - `format='international'`: full E.164-style string, e.g. `'+15551234567'`.
     * - `format='e164'`: digits-only E.164, e.g. `'+15551234567'` (same as international but always digit-clean).
     */
    modelValue?: string;

    /**
     * ISO 3166-1 alpha-2 country code (e.g. `'US'`, `'ES'`, `'GB'`).
     * Bind with `v-model:country` for controlled mode.
     */
    country?: string;

    /**
     * Default country shown on first render (uncontrolled).
     * Ignored when `country` is bound.
     * @default 'US'
     */
    defaultCountry?: string;

    /**
     * Output format emitted via `update:modelValue`.
     * - `'national'` (default): just what the user typed.
     * - `'international'`: `+{dialCode}{local}`.
     * - `'e164'`: `+{dialCode}` followed by digits-only local part.
     */
    format?: 'national' | 'international' | 'e164';

    /** Visible label above the field. */
    label?: string;
    /** Placeholder for the number input. */
    placeholder?: string;
    /** Helper text (hidden when errorText is present). */
    helperText?: string;
    /** Error message. Marks the field as invalid when set. */
    errorText?: string;

    /** Visual style. */
    variant?: 'outline' | 'filled' | 'ghost';
    /** Semantic color applied to focus and accent states. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Field size. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius. Inherits from ModoProvider when omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /**
     * Persistent halo (ring) style.
     * - `'tinted'`: tinted to the active color (default).
     * - `'neutral'`: always grey.
     * - `'off'`: no persistent ring, only focus-visible ring.
     */
    halo?: 'tinted' | 'neutral' | 'off';

    /** Applies `w-full` to the root element. */
    fullWidth?: boolean;
    /** Disables the entire field. */
    disabled?: boolean;
    /** Read-only: maintains normal styling but prevents editing. */
    readonly?: boolean;
    /** Marks the field as required (visual indicator + attribute). */
    required?: boolean;
    /** Shows a spinner and disables the field during async operations. */
    loading?: boolean;

    /** HTML `name` attribute for form submission. */
    name?: string;
    /** Input id. Auto-generated if omitted. */
    id?: string;
    /** HTML `autocomplete` attribute. */
    autocomplete?: string;
    /** Auto-focus on mount. */
    autofocus?: boolean;

    /** Accessible name when no visible `label` is provided. */
    ariaLabel?: string;
    /** Forces the invalid state without rendering `errorText`. Useful inside `FormField`. */
    invalid?: boolean;
    /** Extra IDs to concatenate into `aria-describedby` (e.g. provided by `FormField`). */
    ariaDescribedBy?: string;
}
