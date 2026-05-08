import { computed } from 'vue';
import { useLocalStorage } from './useLocalStorage';
import type { ModoTheme, ModoColor, ModoRadius, ModoSize, ModoHalo } from '../../config/ModoConfig';
import type { DarkSurfacePreset } from '../../config/surfaces';
import type { ShowroomLocale } from '../i18n';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShowroomPrefs {
    theme: ModoTheme;
    color: ModoColor;
    radius: ModoRadius;
    size: ModoSize;
    halo: ModoHalo;
    primaryHex: string;
    accentHex: string;
    baseIntensity: number;
    darkSurface: DarkSurfacePreset;
    locale: ShowroomLocale;
}

export const PREFS_DEFAULTS: ShowroomPrefs = {
    theme:         'system',
    color:         'primary',
    radius:        'medium',
    size:          'medium',
    halo:          'tinted',
    primaryHex:    '#6366f1',
    accentHex:     '#6366f1',
    baseIntensity: 0,
    darkSurface:   'default',
    locale:        'en',
};

const STORAGE_KEY = 'mood-ui:showroom-prefs';

// ── Composable ────────────────────────────────────────────────────────────────

/**
 * Persists all showroom UI preferences in a single localStorage entry.
 *
 * Returns individual writable computed refs so existing bindings
 * (`:theme="theme"`, `@update:theme="theme = $event"`) work unchanged.
 *
 * Any new keys added to PREFS_DEFAULTS are merged in on load, so old
 * stored values don't break when the schema grows.
 */
export function useShowroomPreferences() {
    const prefs = useLocalStorage<ShowroomPrefs>(STORAGE_KEY, PREFS_DEFAULTS);

    // Forward-compat: merge defaults so new fields always exist.
    prefs.value = { ...PREFS_DEFAULTS, ...prefs.value };

    // Individual writable computeds — drop-in replacements for plain refs.
    const theme         = computed({ get: () => prefs.value.theme,         set: (v) => { prefs.value = { ...prefs.value, theme: v };         } });
    const color         = computed({ get: () => prefs.value.color,         set: (v) => { prefs.value = { ...prefs.value, color: v };         } });
    const radius        = computed({ get: () => prefs.value.radius,        set: (v) => { prefs.value = { ...prefs.value, radius: v };        } });
    const size          = computed({ get: () => prefs.value.size,          set: (v) => { prefs.value = { ...prefs.value, size: v };          } });
    const halo          = computed({ get: () => prefs.value.halo,          set: (v) => { prefs.value = { ...prefs.value, halo: v };          } });
    const primaryHex    = computed({ get: () => prefs.value.primaryHex,    set: (v) => { prefs.value = { ...prefs.value, primaryHex: v };    } });
    const accentHex     = computed({ get: () => prefs.value.accentHex,     set: (v) => { prefs.value = { ...prefs.value, accentHex: v };     } });
    const baseIntensity = computed({ get: () => prefs.value.baseIntensity, set: (v) => { prefs.value = { ...prefs.value, baseIntensity: v }; } });
    const darkSurface   = computed({ get: () => prefs.value.darkSurface,   set: (v) => { prefs.value = { ...prefs.value, darkSurface: v };   } });
    const localeName    = computed({ get: () => prefs.value.locale,        set: (v) => { prefs.value = { ...prefs.value, locale: v };        } });

    function reset() {
        prefs.value = { ...PREFS_DEFAULTS };
    }

    return {
        theme,
        color,
        radius,
        size,
        halo,
        primaryHex,
        accentHex,
        baseIntensity,
        darkSurface,
        localeName,
        reset,
        DEFAULTS: PREFS_DEFAULTS,
    };
}
