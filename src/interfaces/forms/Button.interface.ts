import type { Component } from 'vue'; 
 
export interface Button { 
    label?: string; 
    type?: 'button' | 'submit' | 'reset'; 
    disabled?: boolean; 
    loading?: boolean; 
    loadingText?: string; 
    variant?: 'normal' | 'outline' | 'ghost' | 'text'; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    gradient?: boolean; 
    size?: 'xs' | 'small' | 'medium' | 'large'; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    fullWidth?: boolean; 
    icon?: Component; 
    iconPosition?: 'left' | 'right'; 
    /** Accessible name. Required when the button has no visible text (icon-only). */ 
    ariaLabel?: string; 
    /** 
     * When true, renders a `Skeleton` placeholder with the same footprint 
     * (size + radius + fullWidth) instead of the real button content. Use 
     * this while the surrounding data is loading so the layout does not 
     * shift when the button activates. 
     * @default false 
     */ 
    skeleton?: boolean; 
}
