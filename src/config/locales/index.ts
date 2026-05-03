import { defaultLocale } from '../ModoLocale';
import { es } from './es';

/**
 * Built-in locale presets for mood-ui.
 *
 * Usage:
 * ```ts
 * import { locales } from 'mood-ui';
 *
 * // In your ModoProvider:
 * // <ModoProvider :locale="locales.es" />
 *
 * // Or with createModoUI:
 * const modoUI = createModoUI({ locale: locales.es });
 * ```
 */
export const locales = {
    /** English (default) */
    en: defaultLocale,
    /** Español */
    es,
} as const;

export type LocaleKey = keyof typeof locales;

export { es };
