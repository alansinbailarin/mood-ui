import type { Component } from 'vue'; 
 
/** 
 * Topbar (L04 · layout) — application top bar with logo, navigation, 
 * search, actions and user menu slots. Designed to drop into the 
 * `#topbar` slot of `AppShell`, but usable standalone too. 
 */ 
export interface Topbar { 
    /** Brand title shown next to the logo. Use the `title` slot for rich content. */ 
    title?: string; 
    /** Secondary text under the title. Use the `subtitle` slot for rich content. */ 
    subtitle?: string; 
    /** Visual height of the bar. Default `'medium'`. */ 
    size?: 'small' | 'medium' | 'large'; 
    /** Render a bottom border separating the bar from page content. */ 
    divider?: boolean; 
    /** Make the bar `position: sticky` to the top with a translucent background. */ 
    sticky?: boolean; 
    /** Horizontal padding token. Default `'medium'`. */ 
    padding?: 'none' | 'small' | 'medium' | 'large'; 
    /** Polymorphic root tag. Defaults to `'header'`. */ 
    as?: string; 
    /** Show a hamburger menu button on the left side. Emits `@menu-toggle` on click. */ 
    menuToggle?: boolean; 
    /** Icon for the menu toggle button. Defaults to a hamburger glyph. */ 
    menuIcon?: Component; 
    /** Accessible name for the (icon-only) menu toggle button. */ 
    menuAriaLabel?: string; 
}
