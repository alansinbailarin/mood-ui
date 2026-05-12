import type { Component } from 'vue'; 
import type { ModalSize } from './Modal.interface'; 
 
/** 
 * Color of the confirm action. Mirrors the Action/Content set used by 
 * `Button` and `Modal` (§12.2 of MODO_UI_RULES). Use `default` for 
 * neutral confirms, `primary` for happy-path actions, and `danger` for 
 * destructive operations. 
 */ 
export type ConfirmColor = 'default' | 'primary' | 'danger' | 'warning' | 'success'; 
 
/** 
 * Public input accepted by `useConfirm().confirm()`. Every field is 
 * optional — passing only `title` is enough for a yes/no prompt. 
 */ 
export interface ConfirmInput { 
    /** Heading shown at the top of the dialog. */ 
    title?: string; 
    /** Supporting copy under the title. Plain text only — pass HTML via slot in custom usage. */ 
    description?: string; 
    /** Custom leading icon next to the title. Defaults to a per-color icon. */ 
    icon?: Component; 
    /** Hide the icon entirely. */ 
    hideIcon?: boolean; 
    /** Label for the confirm button. @default 'Confirm' */ 
    confirmLabel?: string; 
    /** Label for the cancel button. @default 'Cancel' */ 
    cancelLabel?: string; 
    /** Color of the confirm button. @default 'primary' */ 
    color?: ConfirmColor; 
    /** Modal size. @default 'small' */ 
    size?: ModalSize; 
    /** Radius override (otherwise inherits ModoProvider). */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Hide the cancel button (turns into an alert dialog). @default false */ 
    hideCancel?: boolean; 
    /** Allow dismiss via overlay click / Escape. @default true */ 
    dismissable?: boolean; 
    /** Auto-focus the confirm button when opened. @default true */ 
    autoFocusConfirm?: boolean; 
} 
 
/** Internal queue entry — `ConfirmInput` plus the promise resolver. */ 
export interface ConfirmRequest extends ConfirmInput { 
    id: string; 
    resolve: (value: boolean) => void; 
} 
 
/** Props of the `<ConfirmDialog>` host. Mount once near the app root. */ 
export interface ConfirmDialog { 
    /** Default radius for confirm dialogs that don't specify one. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
}
