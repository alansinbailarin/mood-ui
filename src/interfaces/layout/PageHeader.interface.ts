import type { Component } from 'vue'; 
 
export interface PageHeader { 
    /** Visible title text. Use the `title` slot if you need rich content. */ 
    title?: string; 
    /** Secondary text under the title. Use the `subtitle` slot for rich content. */ 
    subtitle?: string; 
    /** Show a back button to the left of the title. Emits `@back` on click. */ 
    backButton?: boolean; 
    /** Icon component for the back button. Defaults to a chevron-left. */ 
    backIcon?: Component; 
    /** Accessible name for the (icon-only) back button. */ 
    backAriaLabel?: string; 
    /** Visual size of the title. Default `'medium'`. */ 
    size?: 'small' | 'medium' | 'large'; 
    /** Render a bottom border separating the header from page content. */ 
    divider?: boolean; 
    /** Make the header `position: sticky` to the top with a translucent background. */ 
    sticky?: boolean; 
    /** Padding around the header content. */ 
    padding?: 'none' | 'small' | 'medium' | 'large'; 
    /** Polymorphic root tag. Defaults to `'header'`. */ 
    as?: string; 
}
