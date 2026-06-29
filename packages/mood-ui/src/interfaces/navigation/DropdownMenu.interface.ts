import type { Component } from 'vue'; 
 
import type { ModoSize } from '../../config/ModoConfig';
/** Single actionable item in a `DropdownMenu`. */ 
export interface DropdownMenuItem { 
    /** Stable id; defaults to the index when omitted. Useful for `select` payload. */ 
    id?: string | number; 
    /** Visible label. */ 
    label: string; 
    /** Optional secondary text shown muted below the label. */ 
    description?: string; 
    /** Leading icon (Vue component, not a string). Decorative — wrapper handles a11y. */ 
    icon?: Component; 
    /** Inline keyboard hint shown right-aligned (e.g. `'⌘K'`). Purely visual. */ 
    shortcut?: string; 
    /** Disables interaction and dims the row. */ 
    disabled?: boolean; 
    /** Renders the item with the danger color set (destructive actions). */ 
    danger?: boolean; 
    /** Optional click handler. The parent's `select` event always fires too. */ 
    onClick?: (item: DropdownMenuItem) => void; 
    /** External link. Renders the row as `<a>` instead of `<button>`. */ 
    href?: string; 
    /** Opens `href` in a new tab with `rel="noopener noreferrer"`. */ 
    external?: boolean; 
} 
 
/** Visual divider between groups. Non-interactive. */ 
export interface DropdownMenuDivider { 
    type: 'divider'; 
} 
 
/** Group header (small caps label). Non-interactive. */ 
export interface DropdownMenuHeader { 
    type: 'header'; 
    label: string; 
} 
 
/** Discriminated union of everything a `DropdownMenu` accepts as `items[i]`. */ 
export type DropdownMenuEntry = DropdownMenuItem | DropdownMenuDivider | DropdownMenuHeader; 
 
import type { PopoverPlacement } from '../../composables/usePopover'; 
 
export interface DropdownMenu { 
    /** Items to render. Order is preserved. */ 
    items: DropdownMenuEntry[]; 
    /** Visible text on the default trigger button. Ignored if `#trigger` slot is used. */ 
    triggerLabel?: string; 
    /** Icon for the default trigger. */ 
    triggerIcon?: Component; 
    /** Trigger button variant. @default 'outline' */ 
    triggerVariant?: 'normal' | 'outline' | 'ghost' | 'text'; 
    /** Trigger color (Action/Content set per §12.2). @default 'default' */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Size — cascades from `ModoProvider`. */ 
    size?: ModoSize; 
    /** Radius for both trigger and panel. Cascades from `ModoProvider`. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Show a chevron after the trigger label. @default true */ 
    showChevron?: boolean; 
    /** Popover placement. @default 'bottom-start' */ 
    placement?: PopoverPlacement; 
    /** Force the panel width to match the trigger. @default false */ 
    matchTriggerWidth?: boolean; 
    /** Minimum panel width (CSS length). @default '12rem' */ 
    minWidth?: string; 
    /** Disables the whole menu. */ 
    disabled?: boolean; 
    /** Accessible name for the menu (used on the panel `aria-label`). */ 
    ariaLabel?: string; 
    /** Close the menu after a non-disabled item is selected. @default true */ 
    closeOnSelect?: boolean; 
} 
 
export interface DropdownMenuEmits { 
    /** Fires when the open state toggles. */ 
    'update:open': [value: boolean]; 
    /** Fires when a non-disabled item is clicked / activated via keyboard. */ 
    select: [item: DropdownMenuItem]; 
}
