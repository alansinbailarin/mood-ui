import { shallowRef } from 'vue';
import { locales, type LocaleKey } from '../config/locales';
import type { ModoLocale } from '../config/ModoLocale';

/** Module-level singleton so all callers share the same reactive state. */
const _locale = shallowRef<ModoLocale>(locales.en);
const _key = shallowRef<LocaleKey>('en');

/**
 * Global reactive locale switcher.
 *
 * @example
 * ```vue
 * <!-- App.vue -->
 * <script setup>
 * import { useLocale } from 'mood-ui';
 * const { locale, current, set } = useLocale();
 * </script>
 *
 * <template>
 *   <!-- Pass the reactive ref directly — ModoProvider watches it -->
 *   <ModoProvider :locale="locale">
 *     <button @click="set('es')">Español</button>
 *     <button @click="set('en')">English</button>
 *   </ModoProvider>
 * </template>
 * ```
 */
export function useLocale() {
    /**
     * Change the active locale globally.
     * @param lang - one of the built-in locale keys (`'en'` | `'es'`)
     */
    function set(lang: LocaleKey): void {
        _key.value = lang;
        _locale.value = locales[lang];
    }

    return {
        /** Reactive `ModoLocale` object — pass directly to `<ModoProvider :locale>` */
        locale: _locale,
        /** Currently active locale key (e.g. `'en'` | `'es'`) */
        current: _key,
        set,
    };
}
