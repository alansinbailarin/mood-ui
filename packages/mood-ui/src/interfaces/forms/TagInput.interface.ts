export interface TagInput {
    /** Current array of tags (v-model). */
    modelValue?: string[];
    /** Placeholder shown when the input is empty. */
    placeholder?: string;
    /** Optional max number of tags. Further input is ignored. */
    max?: number;
    /** Forbid duplicate tags (case-insensitive comparison). */
    unique?: boolean;
    /** Optional validator. Return false to reject the tag. */
    validator?: (tag: string) => boolean;
    /** Characters that, when typed, also commit the current tag. */
    delimiters?: string[];
    /** Disable interaction. */
    disabled?: boolean;
    /** Mark as readonly (display, no edits). */
    readonly?: boolean;
    /** Semantic color family — applies to both chips and the field focus ring. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Visual variant for the chips (subtle / outline / solid). */
    variant?: 'subtle' | 'outline' | 'solid';
    /** Visual variant for the field wrapper. Matches Input/Select/Combobox. */
    fieldVariant?: 'outline' | 'filled' | 'ghost';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Halo style. Inherits from `ModoProvider` if omitted. */
    halo?: 'tinted' | 'neutral' | 'off';
    /** Optional accessible name for the input. */
    ariaLabel?: string;
    /** Visible label rendered above the field. */
    label?: string;
    /** Optional DOM id for the internal input. */
    id?: string;
    /** Error message — activates error state and renders below the field. */
    errorText?: string;
    /** Helper text rendered below the field when there is no error. */
    helperText?: string;
    /** Forces error state without rendering an error message (e.g. from FormField). */
    invalid?: boolean;
    /** Stretch to full container width. */
    fullWidth?: boolean;
}
