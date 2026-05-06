/**
 * Module-level reactive signal for the active showroom locale.
 *
 * Owned by `App.vue` (it calls `setShowroomLocale`); pages and child
 * components read it via `useShowroomLocale()` without prop drilling.
 */
import { ref, computed, type ComputedRef } from 'vue';
import type { ShowroomLocale, ShowroomDict } from './useShowroomI18n';
import { useShowroomI18n } from './useShowroomI18n';

const locale = ref<ShowroomLocale>('es');

export function setShowroomLocale(v: ShowroomLocale) {
    locale.value = v;
}

export function useShowroomLocale(): { locale: typeof locale; t: ComputedRef<ShowroomDict> } {
    const t = useShowroomI18n(() => locale.value);
    return { locale, t };
}

export function useShowroomT(): ComputedRef<ShowroomDict> {
    return useShowroomI18n(() => locale.value);
}

// Helper for use outside Vue render (rare).
export const currentShowroomLocale = computed(() => locale.value);
