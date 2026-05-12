import type { InjectionKey, Ref } from 'vue';
import { defaultPalettes, type ModoPalette } from './palettes';
import type { AvatarProvider } from '../interfaces/forms/AvatarUpload.interface';

/**
 * Surface tokens — backgrounds, cards, popovers, borders and neutral fills.
 * Each value is any valid CSS color string (hex, oklch(), hsl(), rgb()…).
 * Partial: only override the tokens you want to change.
 */
export interface ModoSurfaces {
    background?:          string;
    foreground?:          string;
    card?:                string;
    cardForeground?:      string;
    popover?:             string;
    popoverForeground?:   string;
    secondary?:           string;
    secondaryForeground?: string;
    muted?:               string;
    mutedForeground?:     string;
    accent?:              string;
    accentForeground?:    string;
    border?:              string;
    input?:               string;
    ring?:                string;
}
 
export type ModoColor = 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
export type ModoRadius = 'none' | 'small' | 'medium' | 'large' | 'full'; 
/** 
 * Global size scale. Components that share this scale (Button, Input, 
 * Select, Tabs…) inherit it from `ModoProvider`. Components with a 
 * larger scale (e.g. Avatar's `xs`/`xl`) keep their own values; this only 
 * cascades the canonical `small` | `medium` | `large` triplet. 
 */ 
export type ModoSize = 'small' | 'medium' | 'large'; 
export type ModoTheme = 'light' | 'dark' | 'system'; 
/** 
 * Estilo del halo (ring persistente) en campos de formulario. 
 * - `tinted`  — idle gris tenue → hover/focus tintado al color del campo. 
 * - `neutral` — idle + hover/focus siempre neutros (gris). Más discreto. 
 * - `off`     — sin halo persistente; solo focus-visible ring para a11y. 
 */ 
export type ModoHalo = 'tinted' | 'neutral' | 'off'; 
 
/** Global AI configuration. Each field maps to a specific AI-enabled component. */
export interface ModoAiConfig {
    /**
     * Default avatar generation function used by `<AvatarUpload ai />` when
     * no `:provider` prop is passed. The developer implements this with their
     * own API key / model. Mood UI never provides AI directly.
     */
    avatarProvider?: AvatarProvider;
}

export interface ModoConfig {
    color: ModoColor;
    radius: ModoRadius;
    size: ModoSize;
    theme: ModoTheme;
    halo: ModoHalo;
    palettes: {
        default: ModoPalette;
        primary: ModoPalette;
    };
    surfaces?: ModoSurfaces;
    darkSurfaces?: ModoSurfaces;
    /** Optional AI provider config. See `ModoAiConfig`. */
    ai?: ModoAiConfig;
} 
 
export const MODO_CONFIG: InjectionKey<Ref<ModoConfig>> = Symbol('modo-config'); 
 
export const defaultModoConfig: ModoConfig = { 
    color: 'default', 
    radius: 'medium', 
    size: 'medium', 
    theme: 'system', 
    halo: 'off', 
    palettes: defaultPalettes, 
};
