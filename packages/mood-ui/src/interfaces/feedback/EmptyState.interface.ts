import type { Component } from 'vue'; 
import type { ModoSize } from '../../config/ModoConfig';
 
/** 
 * Visual size of the empty state. Larger sizes are appropriate when the 
 * empty state takes the full page; smaller sizes fit inside cards/panels. 
 */ 
export type EmptyStateSize = ModoSize; 
 
/** 
 * Visual treatment. 
 * - `subtle` (default): no border, just spacing — for inline use 
 * - `solid`: bordered surface with `bg-card` 
 * - `outline`: dashed border, transparent — for drop-zone affordances 
 * 
 * Matches the Surface preset in MODO_UI_RULES §12.1. 
 */ 
export type EmptyStateVariant = 'subtle' | 'solid' | 'outline'; 
 
export interface EmptyState { 
    /** Heading. */ 
    title?: string; 
    /** Supporting copy under the title. */ 
    description?: string; 
    /** Leading icon. Shown above the title. */ 
    icon?: Component; 
    /** @default 'medium' */ 
    size?: EmptyStateSize; 
    /** @default 'subtle' */ 
    variant?: EmptyStateVariant; 
    /** Center-align the contents. @default true */ 
    centered?: boolean; 
    /** Radius override for the card/outlined surface. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
}
