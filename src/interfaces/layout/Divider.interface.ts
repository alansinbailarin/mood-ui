import type { Component } from 'vue'; 
 
/** 
 * Visual orientation of the divider. 
 * - `horizontal` (default): a thin line across the available width 
 * - `vertical`: a thin line across the available height (host needs flex/grid) 
 */ 
export type DividerOrientation = 'horizontal' | 'vertical'; 
 
/** 
 * Visual style of the divider line. 
 * - `solid` (default): single line 
 * - `dashed`: dashed pattern 
 * - `dotted`: dotted pattern 
 */ 
export type DividerVariant = 'solid' | 'dashed' | 'dotted'; 
 
/** 
 * Visual weight (intensity) of the divider. 
 * - `subtle` (default): low contrast — separates content blocks 
 * - `default`: standard `--border` token 
 * - `strong`: foreground/40 — emphasizes section breaks 
 */ 
export type DividerEmphasis = 'subtle' | 'default' | 'strong'; 
 
/** 
 * Spacing applied along the perpendicular axis (top/bottom for horizontal, 
 * left/right for vertical). Maps to the system spacing scale. 
 */ 
export type DividerSpacing = 'none' | 'small' | 'medium' | 'large'; 
 
/** 
 * Alignment of an inline label/icon along the divider. 
 * Only applies to `horizontal` orientation when a label or `#default` slot 
 * is provided. 
 */ 
export type DividerLabelAlign = 'start' | 'center' | 'end'; 
 
export interface Divider { 
    /** @default 'horizontal' */ 
    orientation?: DividerOrientation; 
    /** @default 'solid' */ 
    variant?: DividerVariant; 
    /** @default 'default' */ 
    emphasis?: DividerEmphasis; 
    /** Margin perpendicular to the line. @default 'medium' */ 
    spacing?: DividerSpacing; 
    /** Optional inline label (horizontal only). */ 
    label?: string; 
    /** Optional leading icon next to the label. */ 
    icon?: Component; 
    /** Where to position the label. @default 'center' */ 
    labelAlign?: DividerLabelAlign; 
    /** 
     * If `true`, the divider is purely decorative for assistive tech. 
     * If `false`, it gets `role="separator"`. @default false 
     */ 
    decorative?: boolean; 
}
