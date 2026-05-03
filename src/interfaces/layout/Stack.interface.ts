/** 
 * Layout primitive that arranges children in a row or column with 
 * consistent spacing. `Stack` is the generic primitive; `HStack` and 
 * `VStack` are convenience wrappers that fix the direction. 
 * 
 * Inspired by Chakra/Radix/SwiftUI stacks. Uses `flex` under the hood. 
 */ 
 
export type StackDirection = 'row' | 'column'; 
 
/** 
 * Spacing between children. Maps to the system spacing scale. 
 * Values map roughly to Tailwind's `gap-*` scale (`small` = `gap-2`, 
 * `medium` = `gap-4`, etc.). Use `none` to disable the gap entirely. 
 */ 
export type StackSpacing = 'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'; 
 
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'; 
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'; 
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse'; 
 
export interface Stack { 
    /** Layout direction. @default 'column' */ 
    direction?: StackDirection; 
    /** Gap between children. @default 'medium' */ 
    spacing?: StackSpacing; 
    /** Cross-axis alignment (`align-items`). @default 'stretch' */ 
    align?: StackAlign; 
    /** Main-axis justification (`justify-content`). @default 'start' */ 
    justify?: StackJustify; 
    /** Wrap behavior. @default 'nowrap' */ 
    wrap?: StackWrap; 
    /** Inline divider rendered between children. */ 
    divider?: boolean; 
    /** When `true`, the stack fills the available width. @default false */ 
    fullWidth?: boolean; 
    /** When `true`, the stack fills the available height. @default false */ 
    fullHeight?: boolean; 
    /** Render as a different element (e.g. `'section'`). @default 'div' */ 
    as?: string; 
} 
 
/** 
 * `HStack` and `VStack` accept the same props as `Stack` minus `direction`. 
 */ 
export type HStack = Omit<Stack, 'direction'>; 
export type VStack = Omit<Stack, 'direction'>;
