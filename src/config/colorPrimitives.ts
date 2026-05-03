/** 
 * Color primitives — sRGB hex → OKLCH, foreground picker. 
 * Used by ModoProvider to derive semantic tokens from user palettes. 
 */ 
 
const srgbToLinear = (c: number): number => { 
    const n = c / 255; 
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); 
}; 
 
const parseHex = (hex: string): [number, number, number] => { 
    const h = hex.replace('#', ''); 
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h; 
    return [ 
        parseInt(full.slice(0, 2), 16), 
        parseInt(full.slice(2, 4), 16), 
        parseInt(full.slice(4, 6), 16), 
    ]; 
}; 
 
/** Converts a sRGB hex color to Oklab. */ 
const hexToOklab = (hex: string): { L: number; a: number; b: number } => { 
    const [R, G, B] = parseHex(hex); 
    const r = srgbToLinear(R); 
    const g = srgbToLinear(G); 
    const b = srgbToLinear(B); 
 
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b); 
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b); 
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); 
 
    return { 
        L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 
        a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 
        b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s, 
    }; 
}; 
 
/** Returns a CSS `oklch(L C H)` string for the given hex color. */ 
export function hexToOklchString(hex: string): string { 
    const { L, a, b } = hexToOklab(hex); 
    const C = Math.sqrt(a * a + b * b); 
    let h = (Math.atan2(b, a) * 180) / Math.PI; 
    if (h < 0) h += 360; 
    return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(2)})`; 
} 
 
/* ------------------------------------------------------------------ * 
 * APCA (v0.98G-4g) simplified — enough fidelity for a foreground picker. 
 * See https://github.com/Myndex/SAPC-APCA for the full spec. 
 * ------------------------------------------------------------------ */ 
const APCA_TRC = 2.4; 
const APCA_B_THRESHOLD = 0.022; 
const APCA_B_CLIP = 1.414; 
 
const apcaY = (r: number, g: number, b: number): number => { 
    const rs = Math.pow(r / 255, APCA_TRC); 
    const gs = Math.pow(g / 255, APCA_TRC); 
    const bs = Math.pow(b / 255, APCA_TRC); 
    return 0.2126729 * rs + 0.7151522 * gs + 0.0721750 * bs; 
}; 
 
const apcaSoftClip = (y: number): number => 
    y < APCA_B_THRESHOLD ? y + Math.pow(APCA_B_THRESHOLD - y, APCA_B_CLIP) : y; 
 
/** APCA Lc score (absolute value); > ~75 for body text, > ~60 for large text. */ 
export function apcaLc(textHex: string, bgHex: string): number { 
    const [tr, tg, tb] = parseHex(textHex); 
    const [br, bg, bb] = parseHex(bgHex); 
    const Ytxt = apcaSoftClip(apcaY(tr, tg, tb)); 
    const Ybg = apcaSoftClip(apcaY(br, bg, bb)); 
    if (Math.abs(Ybg - Ytxt) < 0.0005) return 0; 
    let S: number; 
    if (Ybg > Ytxt) S = Math.pow(Ybg, 0.56) - Math.pow(Ytxt, 0.57); 
    else S = Math.pow(Ybg, 0.65) - Math.pow(Ytxt, 0.62); 
    const C = S * 1.14; 
    if (Math.abs(C) < 0.1) return 0; 
    return Math.abs(C > 0 ? (C - 0.027) * 100 : (C + 0.027) * 100); 
} 
 
/** 
 * Picks a readable foreground (near-black or near-white) for the given hex color, 
 * using APCA Lc. Returns an `oklch()` string suitable for CSS tokens. 
 */ 
export function pickForegroundOklch(bgHex: string): string { 
    const vsBlack = apcaLc('#000000', bgHex); 
    const vsWhite = apcaLc('#ffffff', bgHex); 
    return vsBlack >= vsWhite ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)'; 
}
