export type PaletteShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950; 
 
export type ModoPalette = Record<PaletteShade, string>; 
 
export interface ModoPalettes { 
    default: ModoPalette; 
    primary: ModoPalette; 
} 
 
/** Tailwind `gray` — used as the neutral/default accent. */ 
export const defaultPalette: ModoPalette = { 
    50: '#f9fafb', 
    100: '#f3f4f6', 
    200: '#e5e7eb', 
    300: '#d1d5db', 
    400: '#9ca3af', 
    500: '#6b7280', 
    600: '#4b5563', 
    700: '#374151', 
    800: '#1f2937', 
    900: '#111827', 
    950: '#030712', 
}; 
 
/** Tailwind `blue` — default brand color. */ 
export const primaryPalette: ModoPalette = { 
    50: '#eff6ff', 
    100: '#dbeafe', 
    200: '#bfdbfe', 
    300: '#93c5fd', 
    400: '#60a5fa', 
    500: '#3b82f6', 
    600: '#2563eb', 
    700: '#1d4ed8', 
    800: '#1e40af', 
    900: '#1e3a8a', 
    950: '#172554', 
}; 
 
export const defaultPalettes: ModoPalettes = { 
    default: defaultPalette, 
    primary: primaryPalette, 
}; 
 
const hexToChannels = (hex: string): string => { 
    const h = hex.replace('#', ''); 
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h; 
    const r = parseInt(full.slice(0, 2), 16); 
    const g = parseInt(full.slice(2, 4), 16); 
    const b = parseInt(full.slice(4, 6), 16); 
    return `${r} ${g} ${b}`; 
}; 
 
/* ------------------------------------------------------------------ * 
 * Palette synthesis from a single seed hex.                          *
 * Lets the user pick ONE color and get a full 11-shade ramp tuned    *
 * to the same hue/saturation, varying only lightness (HSL).          *
 * ------------------------------------------------------------------ */ 
const SHADE_L: Record<PaletteShade, number> = { 
    50: 97, 100: 94, 200: 86, 300: 77, 400: 66, 500: 56, 
    600: 48, 700: 40, 800: 32, 900: 25, 950: 16, 
}; 
 
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => { 
    const R = r / 255, G = g / 255, B = b / 255; 
    const max = Math.max(R, G, B), min = Math.min(R, G, B); 
    const l = (max + min) / 2; 
    let h = 0, s = 0; 
    if (max !== min) { 
        const d = max - min; 
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min); 
        switch (max) { 
            case R: h = ((G - B) / d + (G < B ? 6 : 0)); break; 
            case G: h = ((B - R) / d + 2); break; 
            default: h = ((R - G) / d + 4); 
        } 
        h *= 60; 
    } 
    return [h, s * 100, l * 100]; 
}; 
 
const hslToHex = (h: number, s: number, l: number): string => { 
    const S = s / 100, L = l / 100; 
    const k = (n: number) => (n + h / 30) % 12; 
    const a = S * Math.min(L, 1 - L); 
    const f = (n: number) => { 
        const c = L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); 
        return Math.round(c * 255).toString(16).padStart(2, '0'); 
    }; 
    return `#${f(0)}${f(8)}${f(4)}`; 
}; 
 
/** 
 * Generates a Tailwind-shaped 11-shade palette from a single seed hex. 
 * Hue/saturation are preserved; lightness is mapped per shade. 
 */ 
export function paletteFromHex(hex: string): ModoPalette { 
    const h = hex.replace('#', ''); 
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h; 
    const r = parseInt(full.slice(0, 2), 16); 
    const g = parseInt(full.slice(2, 4), 16); 
    const b = parseInt(full.slice(4, 6), 16); 
    const [hue, sat] = rgbToHsl(r, g, b); 
    // Slightly damp saturation at extremes so 50/950 don't look neon. 
    const out = {} as ModoPalette; 
    (Object.keys(SHADE_L) as unknown as PaletteShade[]).forEach((shade) => { 
        const targetL = SHADE_L[shade]; 
        const damp = targetL > 90 || targetL < 20 ? 0.6 : 1; 
        out[shade] = hslToHex(hue, Math.min(sat * damp, 100), targetL); 
    }); 
    return out; 
} 
 
/** Merges partial overrides over defaults (or an optional `base` palettes). */ 
export function mergePalettes( 
    overrides?: { default?: Partial<ModoPalette>; primary?: Partial<ModoPalette> }, 
    base?: ModoPalettes, 
): ModoPalettes { 
    const baseDefault = base?.default ?? defaultPalette; 
    const basePrimary = base?.primary ?? primaryPalette; 
    return { 
        default: { ...baseDefault, ...(overrides?.default ?? {}) }, 
        primary: { ...basePrimary, ...(overrides?.primary ?? {}) }, 
    }; 
} 
 
/** Produces CSS var declarations (channel form, e.g. "59 130 246") for use with rgb(var(--x) / 0.1). */ 
export function palettesToCssVars(palettes: ModoPalettes): Record<string, string> { 
    const out: Record<string, string> = {}; 
    (Object.keys(palettes) as (keyof ModoPalettes)[]).forEach((name) => { 
        const palette = palettes[name]; 
        (Object.keys(palette) as unknown as PaletteShade[]).forEach((shade) => { 
            out[`--modo-${name}-${shade}`] = hexToChannels(palette[shade]); 
        }); 
    }); 
    return out; 
} 
 
/** 
 * Derives OKLCH semantic tokens from palettes (matching the `--primary-*` 
 * tokens that ModoProvider exposes). Exported so teleported surfaces 
 * (PopoverPanel, modals, tooltips) can re-apply them once they leave the 
 * provider's DOM subtree. 
 */ 
export function semanticTokensFromPalettes( 
    palettes: ModoPalettes, 
    toOklchString: (hex: string) => string, 
    pickForegroundOklchStr: (hex: string) => string, 
): Record<string, string> { 
    const p = palettes.primary; 
    const mkLD = (lightHex: string, darkHex: string) => 
        `light-dark(${toOklchString(lightHex)}, ${toOklchString(darkHex)})`; 
    return { 
        '--primary': mkLD(p[600], p[400]), 
        '--primary-foreground': `light-dark(${pickForegroundOklchStr(p[600])}, ${pickForegroundOklchStr(p[400])})`, 
        '--primary-subtle': mkLD(p[100], p[900]), 
        '--primary-hover': mkLD(p[700], p[300]), 
        '--primary-active': mkLD(p[800], p[200]), 
    }; 
}
