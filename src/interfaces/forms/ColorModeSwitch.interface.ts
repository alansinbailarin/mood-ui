export interface ColorModeSwitch {
    /** Color mode value (v-model). One of 'light' | 'system' | 'dark'. */
    modelValue: 'light' | 'system' | 'dark';

    /**
     * Control appearance.
     * - `'default'` — always shows all three options.
     * - `'collapsed'` — shows only the active option at rest; expands on hover to reveal all three.
     * @default 'default'
     */
    variant?: 'default' | 'collapsed';

    /** Accessible name for the radiogroup wrapper. @default 'Color mode' */
    ariaLabel?: string;

    /** Show text labels next to each icon. @default false */
    showLabels?: boolean;

    /** Size variant. @default 'medium' */
    size?: 'small' | 'medium' | 'large';

    /** Disabled state — prevents selection changes. @default false */
    disabled?: boolean;
}
