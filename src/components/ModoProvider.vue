<template> 
    <div 
        :style="cssVarStyle" 
        :class="scoped ? 'modo-scope' : 'contents'" 
        :data-modo-theme="scoped ? resolvedScopedTheme : undefined" 
    > 
        <slot /> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { ref, computed, watch, provide, inject } from 'vue';
import { MODO_CONFIG, defaultModoConfig, type ModoAiConfig, type ModoColor, type ModoConfig, type ModoHalo, type ModoRadius, type ModoSize, type ModoTheme, type ModoSurfaces } from '../config/ModoConfig'; 
import { MODO_LOCALE, defaultLocale, mergeLocale, type ModoLocale, type PartialLocale } from '../config/ModoLocale'; 
import { mergePalettes, palettesToCssVars, semanticTokensFromPalettes, type ModoPalette } from '../config/palettes'; 
import { surfacesToCssVars } from '../config/surfaces';
import { hexToOklchString, pickForegroundOklch } from '../config/colorPrimitives'; 
import { useColorMode, resolveColorMode } from '../composables/useColorMode'; 
 
const props = withDefaults(defineProps<{ 
    color?: ModoColor; 
    radius?: ModoRadius; 
    /** 
     * Canonical size (`small` | `medium` | `large`) that cascades to 
     * components sharing this scale (Button, Input, Select, Tabs…). 
     * Components with extended scales keep their own value. 
     */ 
    size?: ModoSize; 
    /** 
     * `'light' | 'dark' | 'system'`. 
     * - Global provider (`scoped=false`, default): delegates to `useColorMode()`. 
     * - Scoped provider (`scoped=true`): applies the theme only to this subtree 
     *   via `data-modo-theme`, without touching the global state. 
     */ 
    theme?: ModoTheme; 
    /** 
     * Halo style for form fields (ring persistente). 
     * - `'tinted'` (default): gris en idle, tintado al color en hover/focus. 
     * - `'neutral'`: gris en idle + hover/focus. Discreto. 
     * - `'off'`: sin halo persistente; solo focus-visible ring para a11y. 
     */ 
    halo?: ModoHalo; 
    palettes?: { default?: Partial<ModoPalette>; primary?: Partial<ModoPalette> };
    /**
     * Override surface tokens (backgrounds, card, popover, border, muted…)
     * for **light mode**. Any valid CSS color string is accepted.
     * Only the keys you provide are overridden; the rest keep their defaults.
     */
    surfaces?: ModoSurfaces;
    /**
     * Override surface tokens for **dark mode**.
     * Applied automatically when the resolved theme is `'dark'`.
     * Use the built-in `darkSurfaces` presets from `mood-ui` or build your own:
     * ```ts
     * import { darkSurfaces } from 'mood-ui';
     * // <ModoProvider :darkSurfaces="darkSurfaces.navy" />
     * ```
     */
    darkSurfaces?: ModoSurfaces;
    /** 
     * Deep-partial override of the design-system copy (aria labels, empty 
     * states, reject messages, etc.). Cascades like palettes: inherits from 
     * parent provider; component-level props (e.g. `rejectMessages`, 
     * `strengthLabels`, `emptyText`) still win per-instance. See 
     * `src/config/ModoLocale.ts` for the full shape. 
     */ 
    locale?: PartialLocale; 
    /**
     * Global AI provider config. Passes AI functions down to any AI-enabled
     * component (`<AvatarUpload ai />`, etc.) without requiring per-instance
     * `:provider` props. The developer supplies their own API key / model.
     * Mood UI never provides or manages AI services.
     */
    ai?: ModoAiConfig;
    /**
     * When true, the provider becomes a self-contained theme island:
     * renders a real `<div>`, sets `data-modo-theme` on it, and does not
     * mutate the global color mode. Useful for nested sections with their
     * own palette / light/dark mode.
     */
    scoped?: boolean;
}>(), { 
    scoped: false, 
}); 
 
const { set: setColorMode } = useColorMode(); 
 
// Parent provider (if any). Nested scoped providers inherit unset props 
// from the parent, so a `<ModoProvider scoped theme="dark">` inside a global 
// provider with `radius="large"` keeps radius="large". 
const parent = inject(MODO_CONFIG, undefined); 
 
function pick<T>(local: T | undefined, parentValue: T | undefined, fallback: T): T { 
    if (local !== undefined) return local; 
    if (parentValue !== undefined) return parentValue; 
    return fallback; 
} 
 
// Only the *global* provider (non-scoped) pushes theme to the global composable. 
watch( 
    () => props.theme, 
    (t) => { if (t && !props.scoped) setColorMode(t); }, 
    { immediate: true }, 
); 
 
const resolvedScopedTheme = computed<'light' | 'dark' | undefined>(() => { 
    if (!props.scoped || !props.theme) return undefined; 
    return resolveColorMode(props.theme); 
}); 
 
const config = ref<ModoConfig>({
    color: pick(props.color, parent?.value.color, defaultModoConfig.color),
    radius: pick(props.radius, parent?.value.radius, defaultModoConfig.radius),
    size: pick(props.size, parent?.value.size, defaultModoConfig.size),
    theme: pick(props.theme, parent?.value.theme, defaultModoConfig.theme),
    halo: pick(props.halo, parent?.value.halo, defaultModoConfig.halo),
    palettes: mergePalettes(props.palettes, parent?.value.palettes),
    surfaces: props.surfaces ?? parent?.value.surfaces,
    darkSurfaces: props.darkSurfaces ?? parent?.value.darkSurfaces,
    ai: props.ai ?? parent?.value.ai,
});
 
watch( 
    () => [props.color, props.radius, props.size, props.theme, props.halo] as const, 
    ([c, r, s, t, h]) => { 
        config.value.color = pick(c, parent?.value.color, defaultModoConfig.color); 
        config.value.radius = pick(r, parent?.value.radius, defaultModoConfig.radius); 
        config.value.size = pick(s, parent?.value.size, defaultModoConfig.size); 
        config.value.theme = pick(t, parent?.value.theme, defaultModoConfig.theme); 
        config.value.halo = pick(h, parent?.value.halo, defaultModoConfig.halo); 
    }, 
); 
 
// If the parent provider changes any of its config values and we don't set 
// that prop locally, reflect the change. 
watch( 
    () => [parent?.value.color, parent?.value.radius, parent?.value.size, parent?.value.theme, parent?.value.halo] as const, 
    ([pc, pr, ps, pt, ph]) => { 
        if (props.color === undefined) config.value.color = pc ?? defaultModoConfig.color; 
        if (props.radius === undefined) config.value.radius = pr ?? defaultModoConfig.radius; 
        if (props.size === undefined) config.value.size = ps ?? defaultModoConfig.size; 
        if (props.theme === undefined) config.value.theme = pt ?? defaultModoConfig.theme; 
        if (props.halo === undefined) config.value.halo = ph ?? defaultModoConfig.halo; 
    }, 
); 
 
watch( 
    () => props.palettes, 
    (p) => { config.value.palettes = mergePalettes(p, parent?.value.palettes); }, 
    { deep: true }, 
); 
// Inherit parent palette changes when we don't override them.
watch(
    () => parent?.value.palettes,
    (pp) => {
        if (!props.palettes) config.value.palettes = mergePalettes(undefined, pp);
    },
    { deep: true },
);

// Sync surfaces / darkSurfaces props into config.
// Fall back to parent's value when local prop is not set.
watch(() => props.surfaces,    (v) => { config.value.surfaces     = v ?? parent?.value.surfaces; }, { deep: true });
watch(() => props.darkSurfaces, (v) => { config.value.darkSurfaces = v ?? parent?.value.darkSurfaces; }, { deep: true });
watch(() => props.ai,           (v) => { config.value.ai           = v ?? parent?.value.ai; }, { deep: true });
// Inherit parent surface changes when we don't override them locally.
watch(
    () => parent?.value.surfaces,
    (ps) => { if (props.surfaces === undefined) config.value.surfaces = ps; },
    { deep: true },
);
watch(
    () => parent?.value.darkSurfaces,
    (pds) => { if (props.darkSurfaces === undefined) config.value.darkSurfaces = pds; },
    { deep: true },
);

const { isDark } = useColorMode();

// For scoped providers the dark state is determined by the locally resolved
// theme (light / dark after resolving "system"), NOT by the global isDark
// signal. This is critical: without this, light-surface CSS vars applied as
// inline styles would override the dark-mode CSS custom properties that the
// browser sets via [data-modo-theme="dark"] selectors, making dark mode
// invisible whenever a tinted surface override is active.
const isDarkLocal = computed(() =>
    (props.scoped && resolvedScopedTheme.value !== undefined)
        ? resolvedScopedTheme.value === 'dark'
        : isDark.value,
);

const cssVarStyle = computed(() => {
    const legacy = palettesToCssVars(config.value.palettes);
    const derived = semanticTokensFromPalettes(
        config.value.palettes,
        hexToOklchString,
        pickForegroundOklch,
    );
    // Light surface overrides are skipped in dark mode so they don't take
    // precedence over the dark-mode CSS vars via [data-modo-theme="dark"].
    const surfaceVars = (!isDarkLocal.value && config.value.surfaces)
        ? surfacesToCssVars(config.value.surfaces)
        : {};
    const darkSurfaceVars = (isDarkLocal.value && config.value.darkSurfaces)
        ? surfacesToCssVars(config.value.darkSurfaces)
        : {};
    return { ...legacy, ...derived, ...surfaceVars, ...darkSurfaceVars };
}); 
 
provide(MODO_CONFIG, config); 
 
// Locale cascade: 
// defaultLocale ← parent locale ← local `locale` prop. 
// Each level is deep-merged so consumers only override the keys they need. 
const parentLocale = inject(MODO_LOCALE, undefined); 
const resolvedLocale = computed<ModoLocale>(() => { 
    const inheritedBase = parentLocale?.value ?? defaultLocale; 
    return props.locale ? mergeLocale(inheritedBase, props.locale) : inheritedBase; 
}); 
provide(MODO_LOCALE, resolvedLocale); 
</script>
