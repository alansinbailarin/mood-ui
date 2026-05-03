import type { Component } from 'vue';

export interface SegmentedItem {
    /** Unique value emitted via `update:modelValue`. */
    value: string | number;
    /** Visible label. Optional when `icon` is provided. */
    label?: string;
    /** Optional leading icon (decorative). */
    icon?: Component;
    /** Disable this segment. */
    disabled?: boolean;
    /** Override the accessible name. Required when `label` is omitted. */
    ariaLabel?: string;
}

export interface Segmented {
    /** Segments to render. Order is preserved. */
    items: SegmentedItem[];
    /** Currently selected value (v-model). */
    modelValue?: string | number | null;
    /** Semantic color family for the active segment. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Stretch the control to fill its container. */
    fullWidth?: boolean;
    /** Disable the entire control. */
    disabled?: boolean;
    /** Accessible name for the radiogroup. */
    ariaLabel?: string;
}
