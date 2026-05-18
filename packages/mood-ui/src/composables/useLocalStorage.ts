import { ref, watch } from 'vue';
import type { Ref } from 'vue';

/**
 * Reactive ref backed by localStorage.
 *
 * - Reads the stored value on mount (falls back to `defaultValue` on parse errors).
 * - Writes back on every change (deep watch for objects/arrays).
 * - SSR-safe: on the server it returns a `defaultValue`-backed ref and never
 *   touches storage (avoids Node's experimental global `localStorage`).
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
    const state = ref<T>(defaultValue) as Ref<T>;

    // No DOM / no Web Storage — bail before referencing `localStorage` at all.
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return state;
    }

    try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) state.value = JSON.parse(raw) as T;
    } catch { /* parse error — keep defaultValue */ }

    watch(
        state,
        (val) => {
            try {
                window.localStorage.setItem(key, JSON.stringify(val));
            } catch { /* quota exceeded or private mode — silently ignore */ }
        },
        { deep: true },
    );

    return state;
}
