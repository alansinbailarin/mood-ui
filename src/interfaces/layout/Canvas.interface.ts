/** 
 * `<Canvas>` is a thin layout primitive that renders a Figma/Storybook-like 
 * patterned background. It pairs well as the preview area of a 
 * `PropsPlayground`, the drop zone of a `FileInput`, the body of an 
 * `EmptyState`, or any place where you want to hint "this is a workspace". 
 * 
 * It is purely visual — no JS, no listeners. Tokens drive the colors so it 
 * adapts automatically to light/dark and to the active palette. 
 */ 
export interface Canvas { 
    /** 
     * Visual pattern. 
     * - `dots` (default): radial dots grid, classic playground feel. 
     * - `grid`: 1px line grid (graph paper). 
     * - `lines`: horizontal 1px rules (notebook). 
     * - `none`: flat surface, no pattern. 
     */ 
    pattern?: 'dots' | 'grid' | 'lines' | 'none'; 
    /** Cell size in px. Bigger cell = more breathing room. @default 16 */ 
    cellSize?: number; 
    /** 
     * Pattern intensity (alpha applied on top of the surface). 
     * @default 'subtle' 
     */ 
    intensity?: 'subtle' | 'normal' | 'strong'; 
    /** 
     * Background surface token. 
     * @default 'card' 
     */ 
    surface?: 'card' | 'background' | 'muted'; 
    /** 
     * Corner radius. Inherits from `ModoProvider` if omitted. 
     */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Adds a 1px token border. @default false */ 
    bordered?: boolean; 
    /** Polymorphic root tag. @default 'div' */ 
    as?: string; 
}
