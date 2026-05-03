export interface ColorPicker {
    /** Selected color in hex (v-model). */
    modelValue?: string;
    /** Optional preset swatches shown in the popover. */
    swatches?: string[];
    /** Show the hex input field. */
    showHex?: boolean;
    /** Show the native color input as a fallback / advanced picker. */
    showNative?: boolean;
    /** Disable interaction. */
    disabled?: boolean;
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Optional accessible name for the trigger button. */
    ariaLabel?: string;
    /** Placement of the popover relative to the trigger. */
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}
