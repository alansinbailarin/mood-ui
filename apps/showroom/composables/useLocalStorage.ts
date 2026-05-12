import { ref, watch } from 'vue';
import type { Ref } from 'vue';

/**
 * Reactive ref backed by localStorage.
 *
 * - Reads the stored value on mount (falls back to `defaultValue` on parse errors).
 * - Writes back on every change (deep watch for objects/arrays).
 * - Safe to call in SSR contexts (try/catch around storage access).
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
    let initial: T;
    try {
        const raw = localStorage.getItem(key);
        initial = raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
        initial = defaultValue;
    }

    const state = ref<T>(initial) as Ref<T>;

    watch(
        state,
        (val) => {
            try {
                localStorage.setItem(key, JSON.stringify(val));
            } catch { /* quota exceeded or private mode — silently ignore */ }
        },
        { deep: true },
    );

    return state;
}
