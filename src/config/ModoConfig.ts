import type { InjectionKey, Ref } from 'vue'; 
import { defaultPalettes, type ModoPalette } from './palettes'; 
 
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
