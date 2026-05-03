import type { Component } from 'vue'; 
 
/** 
 * Visual flavor of a toast. Mirrors the `Banner` color scale so visual 
 * recognition transfers across the system. 
 */ 
export type ToastColor = 'info' | 'success' | 'warning' | 'danger'; 
 
/** 
 * Visual variant. Toasts default to `subtle` because they overlay other 
 * content; `filled` is for bolder system messages. 
 */ 
export type ToastVariant = 'filled' | 'subtle' | 'outline'; 
 
/** 
 * Where the stack lives on screen. `top-right` is the most common choice; 
 * mobile-first apps tend to prefer `top-center` or `bottom-center`. 
 */ 
export type ToastPlacement = 
    | 'top-right' 
    | 'top-left' 
    | 'top-center' 
    | 'bottom-right' 
    | 'bottom-left' 
    | 'bottom-center'; 
 
/** 
 * Optional inline action shown on the right side of a toast (e.g. "Undo"). 
 * Clicking it dismisses the toast unless `keepOpen: true`. 
 */ 
export interface ToastAction { 
    label: string; 
    onClick?: (close: () => void) => void; 
    keepOpen?: boolean; 
} 
 
/** 
 * Public input accepted by `useToast().push()`. Fields are intentionally 
 * forgiving — you can pass just a `title` for a 90 % use case. 
 */ 
export interface ToastInput { 
    title?: string; 
    description?: string; 
    color?: ToastColor; 
    variant?: ToastVariant; 
    /** Custom leading icon. Defaults to a per-color icon. */ 
    icon?: Component; 
    /** Hide the icon entirely. */ 
    hideIcon?: boolean; 
    /** Auto-close timeout in ms. Use `0` to keep the toast pinned. */ 
    duration?: number; 
    /** Inline call-to-action button. */ 
    action?: ToastAction; 
    /** Allow the user to dismiss with the close button. @default true */ 
    dismissable?: boolean; 
    /** Pause the auto-close timer while the pointer is over the toast. @default true */ 
    pauseOnHover?: boolean; 
    /** Stable id. If you re-push with the same id, the toast is updated in place. */ 
    id?: string | number; 
    /** Custom radius override (otherwise inherits ModoProvider). */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Per-toast placement override. Defaults to the container's `placement`. */ 
    placement?: ToastPlacement; 
} 
 
/** Internal queue item — `ToastInput` after defaults are merged. */ 
export interface ToastEntry extends Required<Pick<ToastInput, 'duration' | 'dismissable' | 'pauseOnHover'>> { 
    id: string | number; 
    title?: string; 
    description?: string; 
    color: ToastColor; 
    variant: ToastVariant; 
    icon?: Component; 
    hideIcon?: boolean; 
    action?: ToastAction; 
    radius?: ToastInput['radius']; 
    placement?: ToastPlacement; 
    /** Internal: timestamp when the toast was pushed (used for animations). */ 
    pushedAt: number; 
} 
 
/** 
 * Props of the `<ToastContainer>`. Mount once near the root of your app 
 * (e.g. inside `<AppShell>`'s default slot or right after `<ModoProvider>`). 
 */ 
export interface ToastContainer { 
    /** Stack placement on the viewport. @default 'top-right' */ 
    placement?: ToastPlacement; 
    /** Maximum visible toasts; older ones are evicted. @default 5 */ 
    max?: number; 
    /** Default `duration` for toasts that don't specify one. @default 4500 */ 
    defaultDuration?: number; 
    /** Default `variant` for `push()` calls. @default 'subtle' */ 
    defaultVariant?: ToastVariant; 
    /** Distance from the viewport edge in px. @default 16 */ 
    offset?: number; 
    /** When the user prefers reduced motion, animations collapse to a fade. */ 
    reducedMotion?: 'auto' | 'force'; 
}
