import { computed, inject, type ComputedRef } from 'vue';
import { MODO_CONFIG, defaultModoConfig, type ModoColor, type ModoRadius, type ModoSize, type ModoTheme, type ModoHalo } from '../config/ModoConfig';
import { MODO_LOCALE, defaultLocale, interpolate, type ModoLocale } from '../config/ModoLocale';
import { SIZE_TOKENS, normalizeSize, type SizeTokenSet } from '../config/sizes';
 
export function useModoConfig() { 
    return inject(MODO_CONFIG, undefined); 
} 
 
/** 
 * Resolves a component's `color` prop. 
 * - Semantic values ('primary'|'danger'|'success'|'warning') ALWAYS win. 
 * - 'default' (or undefined) falls back to the global brand color. 
 */ 
export function useResolvedColor(localGetter: () => ModoColor | undefined): ComputedRef<ModoColor> { 
    const cfg = useModoConfig(); 
    return computed(() => { 
        const local = localGetter(); 
        if (local && local !== 'default') return local; 
        return cfg?.value.color ?? defaultModoConfig.color; 
    }); 
} 
 
/** Local prop wins if set, otherwise falls back to global. */ 
export function useResolvedRadius(localGetter: () => ModoRadius | undefined): ComputedRef<ModoRadius> { 
    const cfg = useModoConfig(); 
    return computed(() => localGetter() ?? cfg?.value.radius ?? defaultModoConfig.radius); 
} 
 
/** 
 * Resolves the canonical `size` (small | medium | large). 
 * Local prop wins, then provider, then default. Components that expose a 
 * wider scale (xs/xl) only call this when the resolved size is one of the 
 * canonical three; otherwise they keep their own value. 
 */ 
export function useResolvedSize(localGetter: () => ModoSize | undefined): ComputedRef<ModoSize> {
    const cfg = useModoConfig();
    return computed(() => localGetter() ?? cfg?.value.size ?? defaultModoConfig.size);
}

/**
 * Resolves a component's size to its full token set (heights, icon, text,
 * padding…). Local prop wins, then provider, then default — same precedence as
 * useResolvedSize — and legacy `xs`/`xl` are normalised onto the scale.
 */
export function useSizeTokens(localGetter: () => ModoSize | undefined): ComputedRef<SizeTokenSet> {
    const cfg = useModoConfig();
    return computed(() => {
        const s = localGetter() ?? cfg?.value.size ?? defaultModoConfig.size;
        return SIZE_TOKENS[normalizeSize(s)];
    });
}

export function useResolvedTheme(localGetter?: () => ModoTheme | undefined): ComputedRef<ModoTheme> { 
    const cfg = useModoConfig(); 
    return computed(() => localGetter?.() ?? cfg?.value.theme ?? defaultModoConfig.theme); 
} 
 
/** Local prop wins if set, otherwise falls back to global. Default is 'tinted'. */ 
export function useResolvedHalo(localGetter?: () => ModoHalo | undefined): ComputedRef<ModoHalo> { 
    const cfg = useModoConfig(); 
    return computed(() => localGetter?.() ?? cfg?.value.halo ?? defaultModoConfig.halo); 
} 
 
/** 
 * Returns the fully-resolved locale (deep-merged with `defaultLocale`). 
 * Works outside a `ModoProvider` too — falls back to the default. 
 */ 
export function useModoLocale(): ComputedRef<ModoLocale> { 
    const injected = inject(MODO_LOCALE, undefined); 
    return computed(() => injected?.value ?? defaultLocale); 
} 
 
/** Convenience: resolve + interpolate `{name}` placeholders in one call. */ 
export function useLocaleString( 
    getter: (l: ModoLocale) => string, 
    vars?: () => Record<string, string | number> | undefined, 
): ComputedRef<string> { 
    const loc = useModoLocale(); 
    return computed(() => interpolate(getter(loc.value), vars?.())); 
}
