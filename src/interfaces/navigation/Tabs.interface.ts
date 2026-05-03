import type { Component } from 'vue'; 
 
/** 
 * Single item descriptor for `<Tabs :items="..." />`. 
 * 
 * The `value` is what is emitted via `update:modelValue` and what identifies 
 * the tab when matching the named panel slot (`#panel-<value>`). 
 */ 
export interface TabItem { 
    /** Unique identifier. Used as the active key and as the slot suffix. */ 
    value: string | number; 
    /** Visible label. */ 
    label: string; 
    /** Optional leading icon (decorative — `aria-hidden`). */ 
    icon?: Component; 
    /** Optional trailing badge (number of items, status…). */ 
    badge?: string | number; 
    /** Disable this individual tab. */ 
    disabled?: boolean; 
    /** 
     * Optional href / route string. When provided the tab renders as `<a>` 
     * (or `linkComponent`, see Tabs.linkComponent) instead of `<button>`. 
     * Selection still toggles via `update:modelValue`; the consumer is 
     * responsible for actual navigation. 
     */ 
    to?: string; 
    /** Override the accessible name of the tab. */ 
    ariaLabel?: string; 
} 
 
export interface Tabs { 
    /** Tabs to render. Order is preserved. */ 
    items: TabItem[]; 
    /** Currently active tab value (v-model). */ 
    modelValue?: string | number | null; 
    /** 
     * Visual style. 
     * - `line` → bottom-border indicator (default). 
     * - `pill` → pill-shaped active background. 
     * - `segmented` → connected segmented control on a muted track. 
     */ 
    variant?: 'line' | 'pill' | 'segmented'; 
    /** Semantic color family (active state). */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Tab height / padding scale. */ 
    size?: 'small' | 'medium' | 'large'; 
    /** 
     * Corner radius for `pill` and `segmented` variants. Inherits from 
     * `ModoProvider` if omitted. Ignored for `line` (no fill). 
     */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Stretch the tablist to fill the container width. Items grow equally. */ 
    fullWidth?: boolean; 
    /** 
     * Don't mount panels until their tab is activated for the first time. 
     * @default false 
     */ 
    lazy?: boolean; 
    /** 
     * Once mounted (e.g. via `lazy`), keep the panel in the DOM hidden when 
     * inactive. When `false`, panels are unmounted on deactivation. 
     * @default true 
     */ 
    keepMounted?: boolean; 
    /** 
     * Component to use as anchor when an item declares `to`. Defaults to 
     * `'a'`. Pass e.g. `RouterLink` for vue-router integration. 
     */ 
    linkComponent?: string | Component; 
    /** Accessible name for the tablist (`aria-label`). */ 
    ariaLabel?: string; 
} 
 
export interface TabsEmits { 
    (e: 'update:modelValue', value: string | number): void; 
    (e: 'change', value: string | number, item: TabItem): void; 
}
