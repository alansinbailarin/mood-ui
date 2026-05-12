import type { Component } from 'vue'; 
 
/** 
 * One node in the breadcrumb trail. Either provide `to` (router-style 
 * link string) or `href` (regular anchor); leave both undefined for the 
 * current page (rendered as plain text with `aria-current="page"`). 
 */ 
export interface BreadcrumbItem { 
    /** Visible label. */ 
    label: string; 
    /** Optional leading icon. */ 
    icon?: Component; 
    /** Internal route. Emits `navigate` with the item when clicked. */ 
    to?: string; 
    /** External href — rendered as `<a>`. */ 
    href?: string; 
    /** Disable the item (renders as muted text, not interactive). */ 
    disabled?: boolean; 
} 
 
export interface Breadcrumbs { 
    /** The trail (root-first). The last item is the current page. */ 
    items: BreadcrumbItem[]; 
    /** 
     * Maximum visible items. When the trail is longer, the middle is 
     * collapsed into an ellipsis. The first and last items are always 
     * shown. @default 0 (no collapsing) 
     */ 
    max?: number; 
    /** Separator between items. @default 'chevron' */ 
    separator?: 'chevron' | 'slash' | 'dot' | 'arrow'; 
    /** Custom separator string (overrides `separator`). */ 
    separatorText?: string; 
    /** Visual size. @default 'medium' */ 
    size?: 'small' | 'medium' | 'large'; 
    /** Show a Home icon on the first item when it has no own icon. @default false */ 
    showHomeIcon?: boolean; 
    /** Accessible label for the nav landmark. @default 'Breadcrumb' */ 
    ariaLabel?: string; 
}
