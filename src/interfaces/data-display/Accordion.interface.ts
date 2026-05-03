import type { Component } from 'vue';

export interface AccordionItem {
    /** Unique value. Used in `modelValue` to identify open items. */
    value: string | number;
    /** Visible title shown in the header trigger. */
    title: string;
    /** Optional plain-text content. Use the `#item-<value>` slot for rich content. */
    content?: string;
    /** Optional leading icon shown in the header. */
    icon?: Component;
    /** Disable interaction with this item. */
    disabled?: boolean;
}

export interface Accordion {
    /** Items to render in order. */
    items: AccordionItem[];
    /**
     * Open value(s).
     * - `multiple: false` (default) → `string | number | null`.
     * - `multiple: true` → `(string | number)[]`.
     */
    modelValue?: string | number | (string | number)[] | null;
    /** Allow multiple items to be open simultaneously. */
    multiple?: boolean;
    /** Visual variant. */
    variant?: 'separated' | 'bordered' | 'flush';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: 'small' | 'medium' | 'large';
    /** Corner radius (only for `separated` and `bordered`). */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Position of the chevron icon. */
    iconPosition?: 'start' | 'end';
}
