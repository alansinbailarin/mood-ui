import type { Component } from 'vue'; 
 
import type { ModoSize } from '../../config/ModoConfig';
export interface Badge { 
    label?: string; 
    variant?: 'solid' | 'outline' | 'subtle'; 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    gradient?: boolean; 
    size?: ModoSize; 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    icon?: Component; 
    removable?: boolean; 
    dot?: boolean; 
    /** When `removable`, overrides the default `loc.badge.remove` accessible name on the close button. */ 
    removeAriaLabel?: string; 
}
