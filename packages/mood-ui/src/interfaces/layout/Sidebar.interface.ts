import type { Component } from 'vue'; 
 
/** 
 * A single navigation item. 
 * 
 * Items are rendered as `<a>` (when `href` is provided), `<router-link>` 
 * (when `to` is provided), or `<button>` (otherwise — fires `@select`). 
 */ 
export interface SidebarItem { 
    /** Stable identifier; used for active matching, keyed render and selection. */ 
    id: string | number; 
    /** Visible text label. */ 
    label: string; 
    /** Leading icon component. */ 
    icon?: Component; 
    /** Plain anchor target. */ 
    href?: string; 
    /** Vue Router target (used as-is on `to=` of router-link). */ 
    to?: string | Record<string, unknown>; 
    /** Open external links in a new tab. Sets `target="_blank" rel="noopener"`. */ 
    external?: boolean; 
    /** Trailing badge content (string/number renders as `<Badge>` automatically). */ 
    badge?: string | number; 
    /** Color of the auto-rendered badge. */ 
    badgeColor?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Disable the item (non-interactive, dimmed). */ 
    disabled?: boolean; 
    /** Render as a danger item (e.g. logout). */ 
    danger?: boolean; 
    /** Optional sub-items (one level of nesting). Renders a chevron and toggles on click. */ 
    children?: SidebarItem[]; 
    /** Forces the item to render as initially expanded when it has children. */ 
    defaultExpanded?: boolean; 
    /** Free-form metadata for hosts that use slots. */ 
    meta?: Record<string, unknown>; 
} 
 
export interface SidebarSection { 
    /** Section identifier (for keys / aria-labelledby). */ 
    id: string | number; 
    /** Optional uppercase section title. */ 
    title?: string; 
    /** Items in this section. */ 
    items: SidebarItem[]; 
} 
 
export interface Sidebar { 
    /** Polymorphic root tag. Defaults to `'nav'`. */ 
    as?: string; 
 
    /** Sections to render. Use either `sections` or `items` (which becomes a single anonymous section). */ 
    sections?: SidebarSection[]; 
    /** Shortcut: a flat list of items rendered as a single section. */ 
    items?: SidebarItem[]; 
 
    /** 
     * Currently selected item id (v-model). When the user activates an item 
     * without `href`/`to`, it becomes the active id and `@update:activeId` 
     * is emitted alongside `@select`. 
     */ 
    activeId?: string | number | null; 
 
    /** 
     * Collapse the sidebar to icon-only mode. When `true`, labels, badges, 
     * sub-items and section titles hide; tooltips appear on hover/focus. 
     */ 
    collapsed?: boolean; 
 
    /** Visual size of the rows. */ 
    size?: 'small' | 'medium' | 'large'; 
 
    /** Radius of the row hit-area. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** Color of the active state. */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
 
    /** 
     * How the active state is rendered: 
     * - `'tonal'`  — soft `bg-X/10 text-X` (default). 
     * - `'solid'`  — filled `bg-X text-X-foreground`. 
     * - `'bar'`    — a left/right vertical bar accent + tonal text. 
     */ 
    activeVariant?: 'tonal' | 'solid' | 'bar'; 
 
    /** Side where the active `bar` accent renders (only if `activeVariant="bar"`). */ 
    barSide?: 'start' | 'end'; 
 
    /** Aria label for the root nav element. @default 'Sidebar' */ 
    ariaLabel?: string; 
 
    /** Accessible label for the sub-items expander toggle (icon-only). */ 
    expandAriaLabel?: string; 
 
    /** Padding around the inner list. */ 
    padding?: 'none' | 'small' | 'medium' | 'large'; 
 
    /** 
     * Render dividing borders between header / body / footer regions. 
     * @default true 
     */ 
    dividers?: boolean; 
}
