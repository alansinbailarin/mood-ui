import type { ModoSize } from '../../config/ModoConfig';
/** 
 * Skeleton — low-attention placeholder shown while content is loading. 
 * 
 * Skeletons act as a standalone *shape* primitive: they mirror the footprint 
 * of a real component (size + radius) without rendering any of its content. 
 * The idea is that replacing `<Input size="large" radius="full" />` with 
 * `<Skeleton shape="input" size="large" radius="full" />` produces the same 
 * visual box — so the layout doesn't jump when data arrives. 
 * 
 * Resolution order (strongest wins): 
 *   1. Explicit `width` / `height` props. 
 *   2. The `shape` preset (per-size heights + forced-radius rules). 
 *   3. `radius` prop. 
 *   4. `ModoProvider` radius. 
 *   5. Generic default (rounded-md). 
 */ 
export interface Skeleton { 
    /** 
     * Visual preset that determines the default footprint (height, width, 
     * radius behavior). 
     * 
     * Primitives: 
     * - `text` — short horizontal bar. Use with `lines` for paragraphs. 
     * - `title` — taller bar suitable for headings. 
     * - `rect` — raw rectangle, no forced radius. Width: 100%. 
     * - `circle` — square made fully round via `radius: full`. 
     * - `avatar` — circle sized to match `Avatar` per `size`. 
     * - `button` — bar matching `Button` height per `size`. 
     * 
     * Form fields (match the real component pixel-for-pixel, 32/40/48 per 
     * `size`): 
     * - `input`, `select`, `multiSelect`, `combobox`, `numberInput`, 
     *   `searchInput`, `passwordInput`, `dateField`, `dateTimeField`, 
     *   `dateRangeField` — single-line field. 
     * - `fileInput` — compact file trigger (same height as input). 
     * - `textarea` — tall multi-line area (≈ 3 rows). 
     * - `fileInputArea` — drop-zone (120/180/240 px per size). 
     * 
     * Selection controls (compact; `withLabel` renders the label *inline 
     * on the right*, matching the real component): 
     * - `checkbox` — small rounded square (16/20/24 px). 
     * - `radio` — small circle (16/20/24 px). 
     * - `switch` — pill-shaped track (32×20 / 40×24 / 56×32 px). 
     * 
     * Range controls (composite: horizontal track + thumb(s); `withLabel` 
     * places the label above the track): 
     * - `slider` — thin track + single thumb. 
     * - `rangeSlider` — thin track + two thumbs. 
     * 
     * Display chips & containers: 
     * - `chip` — pill-shaped inline token (20/24/28 px tall). 
     * - `badge` — tiny rounded token (16/20/24 px tall). Always `full`. 
     * - `banner` — full-width horizontal strip (~48 px). 
     * - `card` — generic card box (128/192/256 px tall), respects radius. 
     * 
     * Composite layouts (ignore `withLabel`; render a curated arrangement): 
     * - `profileRow` — avatar + 2 stacked text lines, horizontal. 
     * - `mediaCard` — media rect + title + 2 body lines, stacked. 
     * - `listRow` — small circle + title + meta, horizontal. 
     * 
     * @default 'rect' 
     */ 
    shape?: 
        | 'text' | 'title' | 'rect' | 'circle' | 'avatar' | 'button' 
        | 'input' | 'textarea' | 'select' | 'multiSelect' | 'combobox' 
        | 'numberInput' | 'searchInput' | 'passwordInput' 
        | 'fileInput' | 'fileInputArea' 
        | 'dateField' | 'dateTimeField' | 'dateRangeField' 
        | 'checkbox' | 'radio' | 'switch' 
        | 'slider' | 'rangeSlider' 
        | 'chip' | 'badge' | 'banner' | 'card' 
        | 'profileRow' | 'mediaCard' | 'listRow'; 
 
    /** 
     * Component size — mirrors the `size` prop of the real component so the 
     * skeleton keeps pixel-parity. For shapes without a size scale 
     * (`text`, `title`, `rect`), this is a hint used when no explicit 
     * height is given. 
     * 
     * @default 'medium' 
     */ 
    size?: ModoSize; 
 
    /** 
     * Corner radius. 
     * 
     * - `circle` / `avatar` always force `full` regardless of this prop. 
     * - Other shapes: this wins over the `ModoProvider` radius. 
     * - If omitted: provider radius → generic `rounded-md` fallback. 
     */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** 
     * Explicit width. Accepts any CSS length (`'6rem'`, `240`, `'50%'`). 
     * Overrides the shape preset. 
     */ 
    width?: string | number; 
 
    /** 
     * Explicit height. Same rules as `width`. Overrides the size preset. 
     */ 
    height?: string | number; 
 
    /** 
     * When true, `width` collapses to `100%`. Useful when the skeleton 
     * replaces a `fullWidth` form field so the footprint matches. 
     * @default false 
     */ 
    fullWidth?: boolean; 
 
    /** 
     * When true, renders a small label bar above the main shape (mirroring a 
     * labeled form field). The label is a mini text skeleton (~30% width, 
     * ~0.75rem tall). Ignored for `text` and `title`. 
     * @default false 
     */ 
    withLabel?: boolean; 
 
    /** 
     * For `shape="text"`: render N stacked lines with slightly varying widths 
     * so the block reads like a paragraph. Ignored for other shapes. 
     * @default 1 
     */ 
    lines?: number; 
 
    /** 
     * Animation style. 
     * - `shimmer` (default): moving light gradient. 
     * - `pulse`: opacity breathing. 
     * - `none`: static bar (still visible, useful for tests). 
     * @default 'shimmer' 
     */ 
    animation?: 'shimmer' | 'pulse' | 'none'; 
 
    /** 
     * Optional accessible label. Skeletons announce themselves as 
     * `aria-busy` + `role="status"`; use this to describe what is loading 
     * (e.g. `"Loading profile"`). 
     */ 
    ariaLabel?: string; 
}
