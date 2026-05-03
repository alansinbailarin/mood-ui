/**
 * Showroom-only helper that derives `surfaces` / `darkSurfaces` overrides
 * from a single accent hex + an "intensity" (0–1).
 *
 * Inspired by HeroUI's "Base" slider: at intensity = 0 the surfaces stay
 * neutral; as it grows, the page background, cards, borders, etc. all gain
 * a low-chroma tint along the accent's hue.
 */
import type { ModoSurfaces } from '../../config/ModoConfig';

interface OklchTuple { l: number; c: number; h: number; }

const srgbToLinear = (c: number) => {
    const n = c / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
};

const parseHex = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return [
        parseInt(full.slice(0, 2), 16) || 0,
        parseInt(full.slice(2, 4), 16) || 0,
        parseInt(full.slice(4, 6), 16) || 0,
    ];
};

function hexToOklch(hex: string): OklchTuple {
    const [R, G, B] = parseHex(hex);
    const r = srgbToLinear(R);
    const g = srgbToLinear(G);
    const b = srgbToLinear(B);

    const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    const c = Math.sqrt(a * a + bb * bb);
    let h = (Math.atan2(bb, a) * 180) / Math.PI;
    if (h < 0) h += 360;
    return { l: L, c, h };
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Light-mode surface set, tinted toward the accent hue.
 * `intensity` 0 → neutral white/gray, 1 → strongly tinted (still WCAG-safe).
 */
export function tintedLightSurfaces(accentHex: string, intensity: number): ModoSurfaces {
    const { h } = hexToOklch(accentHex);
    const t = clamp01(intensity);
    const H = h.toFixed(2);

    const bg     = (1.000 - 0.020 * t).toFixed(4);
    const card   = (0.998 - 0.010 * t).toFixed(4);
    const muted  = (0.965 - 0.040 * t).toFixed(4);
    const acc    = (0.955 - 0.045 * t).toFixed(4);
    const border = (0.925 - 0.050 * t).toFixed(4);
    const input  = (0.945 - 0.045 * t).toFixed(4);

    const cBg     = (0.040 * t).toFixed(4);
    const cCard   = (0.020 * t).toFixed(4);
    const cMuted  = (0.030 * t).toFixed(4);
    const cAcc    = (0.045 * t).toFixed(4);
    const cBorder = (0.030 * t).toFixed(4);
    const cInput  = (0.030 * t).toFixed(4);
    const cFg     = (0.020 * t).toFixed(4);
    const cMutedFg= (0.020 * t).toFixed(4);
    const cRing   = (0.05 + 0.10 * t).toFixed(4);

    return {
        background:          `oklch(${bg} ${cBg} ${H})`,
        foreground:          `oklch(0.18 ${cFg} ${H})`,
        card:                `oklch(${card} ${cCard} ${H})`,
        cardForeground:      `oklch(0.18 ${cFg} ${H})`,
        popover:             `oklch(${card} ${cCard} ${H})`,
        popoverForeground:   `oklch(0.18 ${cFg} ${H})`,
        secondary:           `oklch(${muted} ${cMuted} ${H})`,
        secondaryForeground: `oklch(0.20 ${cFg} ${H})`,
        muted:               `oklch(${muted} ${cMuted} ${H})`,
        mutedForeground:     `oklch(0.55 ${cMutedFg} ${H})`,
        accent:              `oklch(${acc} ${cAcc} ${H})`,
        accentForeground:    `oklch(0.18 ${cFg} ${H})`,
        border:              `oklch(${border} ${cBorder} ${H})`,
        input:               `oklch(${input} ${cInput} ${H})`,
        ring:                `oklch(0.55 ${cRing} ${H})`,
    };
}

/**
 * Dark-mode surface set, tinted toward the accent hue.
 */
export function tintedDarkSurfaces(accentHex: string, intensity: number): ModoSurfaces {
    const { h } = hexToOklch(accentHex);
    const t = clamp01(intensity);
    const H = h.toFixed(2);

    const bg     = (0.145 + 0.005 * t).toFixed(4);
    const card   = (0.205 + 0.008 * t).toFixed(4);
    const popo   = (0.270 + 0.010 * t).toFixed(4);
    const muted  = (0.270 + 0.010 * t).toFixed(4);
    const acc    = (0.370 + 0.015 * t).toFixed(4);
    const border = (0.275 + 0.015 * t).toFixed(4);
    const input  = (0.325 + 0.015 * t).toFixed(4);

    const cBg     = (0.040 * t).toFixed(4);
    const cCard   = (0.045 * t).toFixed(4);
    const cPopo   = (0.050 * t).toFixed(4);
    const cMuted  = (0.045 * t).toFixed(4);
    const cAcc    = (0.060 * t).toFixed(4);
    const cBorder = (0.050 * t).toFixed(4);
    const cInput  = (0.050 * t).toFixed(4);
    const cRing   = (0.05 + 0.07 * t).toFixed(4);

    return {
        background:          `oklch(${bg} ${cBg} ${H})`,
        foreground:          'oklch(0.985 0 0)',
        card:                `oklch(${card} ${cCard} ${H})`,
        cardForeground:      'oklch(0.985 0 0)',
        popover:             `oklch(${popo} ${cPopo} ${H})`,
        popoverForeground:   'oklch(0.985 0 0)',
        secondary:           `oklch(${muted} ${cMuted} ${H})`,
        secondaryForeground: 'oklch(0.96 0 0)',
        muted:               `oklch(${muted} ${cMuted} ${H})`,
        mutedForeground:     'oklch(0.708 0 0)',
        accent:              `oklch(${acc} ${cAcc} ${H})`,
        accentForeground:    'oklch(0.985 0 0)',
        border:              `oklch(${border} ${cBorder} ${H})`,
        input:               `oklch(${input} ${cInput} ${H})`,
        ring:                `oklch(0.556 ${cRing} ${H})`,
    };
}
