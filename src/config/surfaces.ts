import type { ModoSurfaces } from './ModoConfig';

/**
 * Maps ModoSurfaces keys to their CSS custom property names.
 * These are the "surface tokens" that control backgrounds, borders
 * and neutral fills — completely separate from the primary/default palettes.
 */
const SURFACE_VAR_MAP: Record<keyof ModoSurfaces, string> = {
    background:          '--background',
    foreground:          '--foreground',
    card:                '--card',
    cardForeground:      '--card-foreground',
    popover:             '--popover',
    popoverForeground:   '--popover-foreground',
    secondary:           '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted:               '--muted',
    mutedForeground:     '--muted-foreground',
    accent:              '--accent',
    accentForeground:    '--accent-foreground',
    border:              '--border',
    input:               '--input',
    ring:                '--ring',
};

/**
 * Converts a ModoSurfaces object into a CSS-vars record ready to be
 * spread onto an element's `style` binding.
 * Accepts any CSS color string: hex, oklch(), hsl(), rgb(), etc.
 */
export function surfacesToCssVars(surfaces: ModoSurfaces): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, val] of Object.entries(surfaces)) {
        if (val !== undefined) {
            const cssVar = SURFACE_VAR_MAP[key as keyof ModoSurfaces];
            if (cssVar) out[cssVar] = val as string;
        }
    }
    return out;
}

/* ------------------------------------------------------------------ *
 * Dark surface presets                                                *
 * Ready-to-use dark mode surface schemes. Pass any of these to       *
 * `<ModoProvider :darkSurfaces="darkSurfaces.navy" />`               *
 * ------------------------------------------------------------------ */

/** Default dark surfaces — near-black with slate undertone (built-in default). */
const defaultDark: ModoSurfaces = {
    background:          'oklch(0.145 0 0)',
    foreground:          'oklch(0.985 0 0)',
    card:                'oklch(0.205 0 0)',
    cardForeground:      'oklch(0.985 0 0)',
    popover:             'oklch(0.269 0 0)',
    popoverForeground:   'oklch(0.985 0 0)',
    secondary:           'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted:               'oklch(0.269 0 0)',
    mutedForeground:     'oklch(0.708 0 0)',
    accent:              'oklch(0.371 0 0)',
    accentForeground:    'oklch(0.985 0 0)',
    border:              'oklch(0.275 0 0)',
    input:               'oklch(0.325 0 0)',
    ring:                'oklch(0.556 0 0)',
};

/** Navy — deep blue-navy surfaces. Rich and modern. */
const navyDark: ModoSurfaces = {
    background:          'oklch(0.15 0.04 260)',
    foreground:          'oklch(0.96 0.01 240)',
    card:                'oklch(0.20 0.045 258)',
    cardForeground:      'oklch(0.96 0.01 240)',
    popover:             'oklch(0.25 0.05 256)',
    popoverForeground:   'oklch(0.96 0.01 240)',
    secondary:           'oklch(0.25 0.045 258)',
    secondaryForeground: 'oklch(0.90 0.02 240)',
    muted:               'oklch(0.25 0.04 258)',
    mutedForeground:     'oklch(0.68 0.03 248)',
    accent:              'oklch(0.32 0.06 255)',
    accentForeground:    'oklch(0.96 0.01 240)',
    border:              'oklch(0.28 0.05 258)',
    input:               'oklch(0.30 0.05 256)',
    ring:                'oklch(0.55 0.07 255)',
};

/** Zinc — pure neutral zinc. Clean, corporate, high contrast. */
const zincDark: ModoSurfaces = {
    background:          'oklch(0.14 0 0)',
    foreground:          'oklch(0.98 0 0)',
    card:                'oklch(0.19 0 0)',
    cardForeground:      'oklch(0.98 0 0)',
    popover:             'oklch(0.24 0 0)',
    popoverForeground:   'oklch(0.98 0 0)',
    secondary:           'oklch(0.24 0 0)',
    secondaryForeground: 'oklch(0.98 0 0)',
    muted:               'oklch(0.24 0 0)',
    mutedForeground:     'oklch(0.70 0 0)',
    accent:              'oklch(0.33 0 0)',
    accentForeground:    'oklch(0.98 0 0)',
    border:              'oklch(0.27 0 0)',
    input:               'oklch(0.30 0 0)',
    ring:                'oklch(0.55 0 0)',
};

/** Charcoal — warm dark with a brownish/warm undertone. */
const charcoalDark: ModoSurfaces = {
    background:          'oklch(0.16 0.01 60)',
    foreground:          'oklch(0.97 0.005 60)',
    card:                'oklch(0.21 0.012 58)',
    cardForeground:      'oklch(0.97 0.005 60)',
    popover:             'oklch(0.26 0.013 56)',
    popoverForeground:   'oklch(0.97 0.005 60)',
    secondary:           'oklch(0.26 0.012 58)',
    secondaryForeground: 'oklch(0.92 0.007 60)',
    muted:               'oklch(0.26 0.011 58)',
    mutedForeground:     'oklch(0.69 0.01 55)',
    accent:              'oklch(0.34 0.015 55)',
    accentForeground:    'oklch(0.97 0.005 60)',
    border:              'oklch(0.28 0.013 56)',
    input:               'oklch(0.31 0.013 56)',
    ring:                'oklch(0.54 0.015 58)',
};

/** Midnight — very deep, almost pure black with a subtle indigo tint. */
const midnightDark: ModoSurfaces = {
    background:          'oklch(0.11 0.02 280)',
    foreground:          'oklch(0.97 0.008 265)',
    card:                'oklch(0.17 0.025 275)',
    cardForeground:      'oklch(0.97 0.008 265)',
    popover:             'oklch(0.22 0.03 272)',
    popoverForeground:   'oklch(0.97 0.008 265)',
    secondary:           'oklch(0.22 0.025 275)',
    secondaryForeground: 'oklch(0.92 0.01 265)',
    muted:               'oklch(0.22 0.025 275)',
    mutedForeground:     'oklch(0.66 0.02 268)',
    accent:              'oklch(0.30 0.035 270)',
    accentForeground:    'oklch(0.97 0.008 265)',
    border:              'oklch(0.25 0.03 272)',
    input:               'oklch(0.27 0.03 270)',
    ring:                'oklch(0.52 0.05 268)',
};

/** Forest — dark with a subtle green undertone. Calm and natural. */
const forestDark: ModoSurfaces = {
    background:          'oklch(0.14 0.02 155)',
    foreground:          'oklch(0.96 0.01 150)',
    card:                'oklch(0.19 0.025 152)',
    cardForeground:      'oklch(0.96 0.01 150)',
    popover:             'oklch(0.24 0.028 150)',
    popoverForeground:   'oklch(0.96 0.01 150)',
    secondary:           'oklch(0.24 0.025 152)',
    secondaryForeground: 'oklch(0.92 0.012 150)',
    muted:               'oklch(0.24 0.022 152)',
    mutedForeground:     'oklch(0.67 0.018 148)',
    accent:              'oklch(0.32 0.03 148)',
    accentForeground:    'oklch(0.96 0.01 150)',
    border:              'oklch(0.27 0.027 150)',
    input:               'oklch(0.29 0.027 150)',
    ring:                'oklch(0.54 0.04 150)',
};

export const darkSurfaces = {
    /** Built-in default — near-black with slate undertone */
    default:   defaultDark,
    /** Deep blue-navy surfaces */
    navy:      navyDark,
    /** Pure neutral zinc */
    zinc:      zincDark,
    /** Warm brownish/charcoal dark */
    charcoal:  charcoalDark,
    /** Very deep with subtle indigo tint */
    midnight:  midnightDark,
    /** Subtle green undertone, natural feel */
    forest:    forestDark,
} satisfies Record<string, ModoSurfaces>;

export type DarkSurfacePreset = keyof typeof darkSurfaces;
