import type { Component } from 'vue'; 
 
export interface Banner { 
    color?: 'info' | 'warning' | 'danger' | 'success'; 
    variant?: 'filled' | 'subtle' | 'outline'; 
    title?: string; 
    description?: string; 
    dismissable?: boolean; 
    dismissAnimation?: 'collapse' | 'shrink'; 
    icon?: Component; 
    showIcon?: boolean; 
    position?: 'inline' | 'sticky-top' | 'sticky-bottom'; 
    fullWidth?: boolean; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
}
