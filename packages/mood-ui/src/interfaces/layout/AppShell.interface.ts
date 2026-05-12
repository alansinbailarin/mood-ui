/** 
 * AppShell — application frame layout. 
 * 
 * Three structural variants: 
 *  - `standard` — single sidebar with main + footer. 
 *  - `rail`     — compact icon-only rail (no labels). 
 *  - `dual`     — persistent rail + expandable secondary sidebar panel 
 *                 (the "Flup pattern": rail always visible, panel collapses). 
 * 
 * Two appearances: 
 *  - `flush`     — the shell is the page (full-bleed). 
 *  - `contained` — the shell sits inside a rounded card on a muted page 
 *                  background, with breathing room around it. 
 */ 
export interface AppShell { 
    /** Polymorphic root tag. Defaults to `'div'`. */ 
    as?: string; 
 
    /** Structural layout. */ 
    variant?: 'standard' | 'rail' | 'dual'; 
 
    /** Visual framing of the whole shell. */ 
    appearance?: 'flush' | 'contained'; 
 
    /** Side where the sidebar (or rail) lives. */ 
    sidebarPosition?: 'left' | 'right'; 
 
    /** Width preset of the expanded sidebar / secondary panel. */ 
    sidebarWidth?: 'small' | 'medium' | 'large'; 
 
    /** Width preset of the collapsed sidebar (icon-only column, only `standard`). */ 
    collapsedWidth?: 'small' | 'medium'; 
 
    /** Width of the rail in `rail` and `dual` variants. */ 
    railWidth?: 'small' | 'medium'; 
 
    /** 
     * v-model — desktop sidebar collapsed state. 
     * - `standard`: collapses width to `collapsedWidth`. 
     * - `dual`: hides the secondary panel (rail stays). 
     * - `rail`: ignored (rail is already collapsed). 
     */ 
    collapsed?: boolean; 
 
    /** 
     * v-model — mobile drawer open state. Below the breakpoint the 
     * sidebar / panel is hidden and toggled imperatively. 
     */ 
    mobileOpen?: boolean; 
 
    /** Tailwind breakpoint at which the sidebar becomes permanent. */ 
    breakpoint?: 'md' | 'lg' | 'xl'; 
 
    /** Stick the topbar to the top of the viewport. */ 
    stickyTopbar?: boolean; 
 
    /** Stick the sidebar (desktop) so it scrolls with the viewport. */ 
    stickySidebar?: boolean; 
 
    /** Render dividing borders between regions (sidebar/main, topbar/body…). */ 
    divider?: boolean; 
 
    /** Padding around the main content area. */ 
    mainPadding?: 'none' | 'small' | 'medium' | 'large'; 
 
    /** Radius of the contained shell card. Ignored when `appearance="flush"`. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** Accessible label for the mobile navigation drawer (dialog). */ 
    drawerAriaLabel?: string; 
}
