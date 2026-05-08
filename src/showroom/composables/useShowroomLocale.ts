/**
 * Module-level reactive signal for the active showroom locale, kept in sync
 * with the vue-i18n instance. Owned by `App.vue` (it calls `setShowroomLocale`);
 * pages and child components read it via `useShowroomLocale()` without prop drilling.
 */
import { ref, computed } from 'vue';
import { setShowroomI18nLocale, type ShowroomLocale } from '../i18n';

export type { ShowroomLocale };

const locale = ref<ShowroomLocale>('en');

export function setShowroomLocale(v: ShowroomLocale): void {
    locale.value = v;
    setShowroomI18nLocale(v);
}

export function useShowroomLocale(): { locale: typeof locale } {
    return { locale };
}

export const currentShowroomLocale = computed(() => locale.value);
