export interface ColorPicker {
    /** Selected color in hex (v-model). */
    modelValue?: string;
    /** Optional preset swatches shown in the popover. */
    swatches?: string[];
    /** Show the hex input field in the custom section. */
    showHex?: boolean;
    /** Show an HSV canvas + hue slider for advanced picking (replaces native input). */
    advanced?: boolean;
    /** Disable interaction. */
    disabled?: boolean;
    /** Field variant — same as Input/Select. */
    variant?: 'outline' | 'filled' | 'ghost';
    /** Semantic color for focus ring — same as Input/Select. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Optional accessible name for the trigger button. */
    ariaLabel?: string;
    /** Optional label rendered above the trigger. */
    label?: string;
    /** Placement of the popover relative to the trigger. */
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}
