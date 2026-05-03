<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { Skeleton } from '../../interfaces/feedback/Skeleton.interface'; 
import { useResolvedRadius, useModoLocale, useResolvedSize } from '../../composables/useModoConfig'; 
import type { ModoRadius } from '../../config/ModoConfig'; 
 
defineOptions({ inheritAttrs: false }); 
 
const loc = useModoLocale(); 
 
const props = withDefaults(defineProps<Skeleton>(), { 
    shape: 'rect', 
    lines: 1, 
    animation: 'shimmer', 
    fullWidth: false, 
    withLabel: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
type Shape = NonNullable<Skeleton['shape']>; 
type Size = NonNullable<Skeleton['size']>; 
 
/* ---------------- Shape presets ---------------- 
 * Single source of truth for footprint. Later phases add entries here 
 * (input, textarea, select, switch, etc.) — the rest of the component 
 * stays untouched. Heights match the real components pixel-for-pixel. 
 * 
 *   height        — per-size box height (CSS length). 
 *   defaultWidth  — fallback width when neither `width` nor `fullWidth` is set. 
 *                   For square shapes (circle/avatar) this is ignored — width 
 *                   tracks height so the shape stays square. 
 *   forceFull     — when true, locks `radius` to `full` (circle/avatar/switch). 
 *   square        — when true, width == height regardless of defaultWidth. 
 *   render        — non-default rendering: 
 *                     'slider'      : horizontal track + 1 thumb 
 *                     'rangeSlider' : horizontal track + 2 thumbs 
 *                     'profileRow'  : avatar + 2 stacked text lines (row) 
 *                     'mediaCard'   : media rect + title + 2 body lines 
 *                     'listRow'     : small circle + title + meta (row) 
 *                   (default 'bar' is the simple filled rectangle). 
 *   labelSide     — when `withLabel` is set, where to place the mini label 
 *                   bar. 'top' (default) stacks above; 'right' puts it 
 *                   inline next to the control (used by checkbox/radio/ 
 *                   switch which sit inline with their label in real life). 
 */ 
interface ShapePreset { 
    height: Record<Size, string>; 
    defaultWidth: Record<Size, string>; 
    forceFull?: boolean; 
    square?: boolean; 
    render?: 'bar' | 'slider' | 'rangeSlider' | 'profileRow' | 'mediaCard' | 'listRow'; 
    labelSide?: 'top' | 'right'; 
} 
 
const SHAPE_PRESETS: Record<Shape, ShapePreset> = { 
    text: { 
        height: { small: '0.75rem', medium: '0.875rem', large: '1rem' }, 
        defaultWidth: { small: '100%', medium: '100%', large: '100%' }, 
    }, 
    title: { 
        height: { small: '1.25rem', medium: '1.5rem', large: '1.875rem' }, 
        defaultWidth: { small: '55%', medium: '60%', large: '65%' }, 
    }, 
    rect: { 
        height: { small: '3rem', medium: '4rem', large: '6rem' }, 
        defaultWidth: { small: '100%', medium: '100%', large: '100%' }, 
    }, 
    circle: { 
        height: { small: '1.5rem', medium: '2rem', large: '2.5rem' }, 
        defaultWidth: { small: '1.5rem', medium: '2rem', large: '2.5rem' }, 
        square: true, 
    }, 
    // Matches `Avatar` sizes exactly (small=2rem/32, medium=2.5rem/40, large=3rem/48). 
    // Radius cascades from prop > provider > default ('medium'). The real 
    // `Avatar` follows the same cascade unless `shape='circle'` overrides 
    // (which we do not have here — use `radius: 'full'` for a round avatar). 
    avatar: { 
        height: { small: '2rem', medium: '2.5rem', large: '3rem' }, 
        defaultWidth: { small: '2rem', medium: '2.5rem', large: '3rem' }, 
        square: true, 
    }, 
    // Matches `Button` heights exactly. Radius respects the prop/provider 
    // (no longer forced to full — Fase 1 bugfix). 
    button: { 
        height: { small: '2rem', medium: '2.5rem', large: '3rem' }, 
        defaultWidth: { small: '5rem', medium: '6rem', large: '8rem' }, 
    }, 
 
    /* --- Fase 2: form-field shapes --- 
     * All single-line form fields share the `Input` height grid (32/40/48). 
     * The visual is identical — a flat bar — so they all reuse FORM_LINE. 
     * We still expose separate shape names so the markup reads 1:1 with the 
     * real component (`<Skeleton shape="passwordInput" />`). 
     */ 
    input:           { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    select:          { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    multiSelect:     { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    combobox:        { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    numberInput:     { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    searchInput:     { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    passwordInput:   { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    fileInput:       { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    dateField:       { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    dateTimeField:   { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
    dateRangeField:  { height: { small: '2rem', medium: '2.5rem', large: '3rem' }, defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' } }, 
 
    // Multi-line area — approx. 3 rows of content per size. 
    textarea: { 
        height: { small: '5rem', medium: '6.5rem', large: '8rem' }, 
        defaultWidth: { small: '14rem', medium: '16rem', large: '20rem' }, 
    }, 
 
    // File drop-zone — matches FileInput `min-h-[120/180/240]` per size. 
    fileInputArea: { 
        height: { small: '7.5rem', medium: '11.25rem', large: '15rem' }, 
        defaultWidth: { small: '100%', medium: '100%', large: '100%' }, 
    }, 
 
    /* --- Fase 3: selection + range controls --- */ 
 
    // Matches `Checkbox` box (w-4/5/6). Labels sit inline on the right. 
    checkbox: { 
        height: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        defaultWidth: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        square: true, 
        labelSide: 'right', 
    }, 
    // Matches `Radio` (same footprint as checkbox, but always full radius). 
    radio: { 
        height: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        defaultWidth: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        forceFull: true, 
        square: true, 
        labelSide: 'right', 
    }, 
    // Matches `Switch` track (32×20 / 40×24 / 56×32 px). 
    switch: { 
        height: { small: '1.25rem', medium: '1.5rem', large: '2rem' }, 
        defaultWidth: { small: '2rem', medium: '2.5rem', large: '3.5rem' }, 
        forceFull: true, 
        labelSide: 'right', 
    }, 
    // Slider — thin track spanning the width + one centered thumb. 
    // Heights refer to the *overall* box (thumb is what dictates it); the 
    // inner track is drawn thinner via the template. 
    slider: { 
        height: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        defaultWidth: { small: '10rem', medium: '14rem', large: '18rem' }, 
        render: 'slider', 
    }, 
    rangeSlider: { 
        height: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        defaultWidth: { small: '10rem', medium: '14rem', large: '18rem' }, 
        render: 'rangeSlider', 
    }, 
 
    /* --- Fase 4: display chips, containers, composites --- */ 
 
    // Matches `Chip` — pill-shaped by default, but respects provider radius 
    // (the real Chip falls back to `rounded-full` only when no radius is 
    // configured; if the user sets `radius: 'small'` globally, both the 
    // real Chip and this skeleton must follow). Hence no `forceFull`. 
    chip: { 
        height: { small: '1.25rem', medium: '1.5rem', large: '1.75rem' }, 
        defaultWidth: { small: '3.5rem', medium: '4.5rem', large: '5.5rem' }, 
    }, 
    // Matches `Badge` — same cascade rules as Chip. 
    badge: { 
        height: { small: '1rem', medium: '1.25rem', large: '1.5rem' }, 
        defaultWidth: { small: '2rem', medium: '2.5rem', large: '3rem' }, 
    }, 
    // Matches `Banner` base: gap-3 + px-4 py-3 + text-sm ≈ 48 px tall. 
    // Spans the container by default. 
    banner: { 
        height: { small: '2.5rem', medium: '3rem', large: '3.5rem' }, 
        defaultWidth: { small: '100%', medium: '100%', large: '100%' }, 
    }, 
    // Generic card — respects radius. Used for bulk list/grid placeholders. 
    card: { 
        height: { small: '8rem', medium: '12rem', large: '16rem' }, 
        defaultWidth: { small: '100%', medium: '100%', large: '100%' }, 
    }, 
 
    // Composites — the box is a flex container; children are drawn in the 
    // template. Width/height act as the *outer* bounds; inner sizing is 
    // driven by `size`. 
    profileRow: { 
        height: { small: '2rem', medium: '2.5rem', large: '3rem' }, 
        defaultWidth: { small: '14rem', medium: '18rem', large: '22rem' }, 
        render: 'profileRow', 
    }, 
    mediaCard: { 
        height: { small: '12rem', medium: '15rem', large: '18rem' }, 
        defaultWidth: { small: '12rem', medium: '16rem', large: '20rem' }, 
        render: 'mediaCard', 
    }, 
    listRow: { 
        height: { small: '2rem', medium: '2.5rem', large: '3rem' }, 
        defaultWidth: { small: '16rem', medium: '20rem', large: '24rem' }, 
        render: 'listRow', 
    }, 
}; 
 
const preset = computed<ShapePreset>(() => SHAPE_PRESETS[props.shape]); 
 
/* ---------------- Dimension resolution ---------------- */ 
 
function toCssLength(v: string | number | undefined): string | undefined { 
    if (v === undefined || v === null) return undefined; 
    if (typeof v === 'number') return `${v}px`; 
    return v; 
} 
 
const resolvedHeight = computed(() => toCssLength(props.height) ?? preset.value.height[resolvedSize.value]); 
 
const resolvedWidth = computed(() => { 
    // Explicit width wins. 
    const explicit = toCssLength(props.width); 
    if (explicit) return explicit; 
    // fullWidth stretches horizontally (unless the shape is square). 
    if (props.fullWidth && !preset.value.square) return '100%'; 
    // Square shapes mirror the height. 
    if (preset.value.square) return resolvedHeight.value; 
    return preset.value.defaultWidth[resolvedSize.value]; 
}); 
 
/* ---------------- Radius resolution ---------------- 
 * 1. Shapes with `forceFull` (circle, avatar) always win. 
 * 2. Otherwise: local prop > provider > 'medium' default. 
 * Output is a Tailwind class (no arbitrary values). 
 */ 
const providerRadius = useResolvedRadius(() => props.radius as ModoRadius | undefined); 
 
const shapeRadiusClass = computed(() => { 
    if (preset.value.forceFull) return 'rounded-full'; 
    switch (providerRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-lg'; 
        case 'full': return 'rounded-full'; 
        default: return 'rounded-md'; 
    } 
}); 
 
/* ---------------- Text-lines variant ---------------- */ 
 
const resolvedLines = computed(() => Math.max(1, props.lines ?? 1)); 
 
// Varied widths so multi-line text doesn't look mechanical. Last line is 
// intentionally shorter, matching real paragraphs. 
const lineWidths = computed<string[]>(() => { 
    const n = resolvedLines.value; 
    const base = ['100%', '92%', '96%', '88%', '94%', '90%']; 
    return Array.from({ length: n }, (_, i) => { 
        if (i === n - 1 && n > 1) return '70%'; 
        return base[i % base.length]; 
    }); 
}); 
 
const isMultilineText = computed(() => props.shape === 'text' && resolvedLines.value > 1); 
 
// Slider/rangeSlider render a composite shape (track + thumb(s)) instead of 
// a plain rectangle. The track height is derived from the box height so it 
// scales naturally with `size` without a separate table. 
const isSlider = computed(() => preset.value.render === 'slider' || preset.value.render === 'rangeSlider'); 
const sliderTrackHeight = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return '0.25rem'; 
        case 'large': return '0.5rem'; 
        default: return '0.375rem'; 
    } 
}); 
 
// Composite layouts render a curated arrangement — `withLabel` is ignored 
// because the layout already encodes its own labels. 
const isComposite = computed(() => { 
    const r = preset.value.render; 
    return r === 'profileRow' || r === 'mediaCard' || r === 'listRow'; 
}); 
 
// Per-size font bar heights for the inner text placeholders of composites. 
// Kept in sync with the `text` / `title` preset so the visual weights match. 
const compositeTitleHeight = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return '0.75rem'; 
        case 'large': return '1.125rem'; 
        default: return '0.875rem'; 
    } 
}); 
const compositeLineHeight = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return '0.625rem'; 
        case 'large': return '0.875rem'; 
        default: return '0.75rem'; 
    } 
}); 
 
// Label bar is a labelled-field affordance — meaningless for pure text 
// blocks or composite layouts (which already carry their own labels). 
const showLabel = computed( 
    () => 
        props.withLabel && 
        props.shape !== 'text' && 
        props.shape !== 'title' && 
        !isComposite.value, 
); 
 
// Where the label sits relative to the control. Defaults to 'top' unless 
// the preset overrides (checkbox/radio/switch → inline right). 
const labelSide = computed<'top' | 'right'>(() => preset.value.labelSide ?? 'top'); 
 
const inlineStyle = computed(() => ({ 
    width: resolvedWidth.value, 
    height: resolvedHeight.value, 
})); 
 
const animationClass = computed(() => { 
    switch (props.animation) { 
        case 'pulse': return 'modo-skeleton--pulse'; 
        case 'none': return 'modo-skeleton--static'; 
        default: return 'modo-skeleton--shimmer'; 
    } 
}); 
</script> 
 
<template> 
    <!-- Multi-line paragraph variant (`shape="text"` with lines>1). --> 
    <div 
        v-if="isMultilineText" 
        :class="['flex flex-col gap-2', $attrs.class as string]" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <span 
            v-for="(w, i) in lineWidths" 
            :key="i" 
            class="modo-skeleton block" 
            :class="[animationClass, shapeRadiusClass]" 
            :style="{ width: w, height: resolvedHeight }" 
        /> 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
 
    <!-- Labelled variant. Layout direction depends on preset.labelSide: 
         - 'top'   → column (form fields, button, etc.). 
         - 'right' → row (checkbox / radio / switch). 
         Screen readers only hear the outer wrapper's status. --> 
    <div 
        v-else-if="showLabel" 
        :class="[ 
            'flex', 
            labelSide === 'right' ? 'flex-row items-center gap-2' : 'flex-col gap-1.5', 
            $attrs.class as string, 
        ]" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <!-- Top-label: mini bar above the control. --> 
        <span 
            v-if="labelSide === 'top'" 
            class="modo-skeleton block rounded-sm" 
            :class="animationClass" 
            :style="{ width: '30%', height: '0.75rem' }" 
        /> 
 
        <!-- Control: slider composite or plain bar. --> 
        <span 
            v-if="isSlider" 
            class="relative inline-flex items-center" 
            :style="inlineStyle" 
        > 
            <span 
                class="modo-skeleton block w-full rounded-full" 
                :class="animationClass" 
                :style="{ height: sliderTrackHeight }" 
            /> 
            <!-- Single thumb (slider) at ~35% for visual interest. --> 
            <span 
                v-if="preset.render === 'slider'" 
                class="modo-skeleton absolute rounded-full" 
                :class="animationClass" 
                :style="{ 
                    width: resolvedHeight, height: resolvedHeight, 
                    left: '35%', transform: 'translateX(-50%)', 
                }" 
            /> 
            <!-- Two thumbs (rangeSlider). --> 
            <template v-else> 
                <span 
                    class="modo-skeleton absolute rounded-full" 
                    :class="animationClass" 
                    :style="{ 
                        width: resolvedHeight, height: resolvedHeight, 
                        left: '25%', transform: 'translateX(-50%)', 
                    }" 
                /> 
                <span 
                    class="modo-skeleton absolute rounded-full" 
                    :class="animationClass" 
                    :style="{ 
                        width: resolvedHeight, height: resolvedHeight, 
                        left: '70%', transform: 'translateX(-50%)', 
                    }" 
                /> 
            </template> 
        </span> 
        <span 
            v-else 
            :class="['modo-skeleton block', animationClass, shapeRadiusClass]" 
            :style="inlineStyle" 
        /> 
 
        <!-- Right-label: mini bar beside the control. Grows to fill row. --> 
        <span 
            v-if="labelSide === 'right'" 
            class="modo-skeleton block rounded-sm grow" 
            :class="animationClass" 
            :style="{ maxWidth: '12rem', height: '0.75rem' }" 
        /> 
 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
 
    <!-- Slider / rangeSlider without label. --> 
    <div 
        v-else-if="isSlider" 
        :class="['relative inline-flex items-center', $attrs.class as string]" 
        :style="inlineStyle" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <span 
            class="modo-skeleton block w-full rounded-full" 
            :class="animationClass" 
            :style="{ height: sliderTrackHeight }" 
        /> 
        <span 
            v-if="preset.render === 'slider'" 
            class="modo-skeleton absolute rounded-full" 
            :class="animationClass" 
            :style="{ 
                width: resolvedHeight, height: resolvedHeight, 
                left: '35%', transform: 'translateX(-50%)', 
            }" 
        /> 
        <template v-else> 
            <span 
                class="modo-skeleton absolute rounded-full" 
                :class="animationClass" 
                :style="{ 
                    width: resolvedHeight, height: resolvedHeight, 
                    left: '25%', transform: 'translateX(-50%)', 
                }" 
            /> 
            <span 
                class="modo-skeleton absolute rounded-full" 
                :class="animationClass" 
                :style="{ 
                    width: resolvedHeight, height: resolvedHeight, 
                    left: '70%', transform: 'translateX(-50%)', 
                }" 
            /> 
        </template> 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
 
    <!-- Composite layouts: curated multi-element arrangement. --> 
    <div 
        v-else-if="isComposite && preset.render === 'profileRow'" 
        :class="['flex flex-row items-center gap-3', $attrs.class as string]" 
        :style="{ width: resolvedWidth }" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <!-- Avatar --> 
        <span 
            class="modo-skeleton block rounded-full shrink-0" 
            :class="animationClass" 
            :style="{ width: resolvedHeight, height: resolvedHeight }" 
        /> 
        <!-- Two stacked lines (title + subtitle) --> 
        <span class="flex flex-col gap-1.5 grow min-w-0"> 
            <span 
                class="modo-skeleton block rounded-sm" 
                :class="animationClass" 
                :style="{ width: '60%', height: compositeTitleHeight }" 
            /> 
            <span 
                class="modo-skeleton block rounded-sm" 
                :class="animationClass" 
                :style="{ width: '40%', height: compositeLineHeight }" 
            /> 
        </span> 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
 
    <div 
        v-else-if="isComposite && preset.render === 'mediaCard'" 
        :class="['flex flex-col gap-3', $attrs.class as string]" 
        :style="{ width: resolvedWidth }" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <!-- Media rect occupies ~60% of the total card height. --> 
        <span 
            :class="['modo-skeleton block', animationClass, shapeRadiusClass]" 
            :style="{ width: '100%', height: `calc(${resolvedHeight} * 0.6)` }" 
        /> 
        <span 
            class="modo-skeleton block rounded-sm" 
            :class="animationClass" 
            :style="{ width: '70%', height: compositeTitleHeight }" 
        /> 
        <span 
            class="modo-skeleton block rounded-sm" 
            :class="animationClass" 
            :style="{ width: '100%', height: compositeLineHeight }" 
        /> 
        <span 
            class="modo-skeleton block rounded-sm" 
            :class="animationClass" 
            :style="{ width: '85%', height: compositeLineHeight }" 
        /> 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
 
    <div 
        v-else-if="isComposite && preset.render === 'listRow'" 
        :class="['flex flex-row items-center gap-3', $attrs.class as string]" 
        :style="{ width: resolvedWidth, height: resolvedHeight }" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <!-- Leading icon (small circle). --> 
        <span 
            class="modo-skeleton block rounded-full shrink-0" 
            :class="animationClass" 
            :style="{ width: `calc(${resolvedHeight} * 0.5)`, height: `calc(${resolvedHeight} * 0.5)` }" 
        /> 
        <!-- Title (grows) --> 
        <span 
            class="modo-skeleton block rounded-sm grow" 
            :class="animationClass" 
            :style="{ height: compositeTitleHeight, maxWidth: '60%' }" 
        /> 
        <!-- Trailing meta (short bar, right-aligned). --> 
        <span 
            class="modo-skeleton block rounded-sm shrink-0" 
            :class="animationClass" 
            :style="{ width: '3rem', height: compositeLineHeight }" 
        /> 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
 
    <!-- Plain bar (default). --> 
    <div 
        v-else 
        :class="['modo-skeleton', animationClass, shapeRadiusClass, $attrs.class as string]" 
        :style="inlineStyle" 
        role="status" 
        aria-busy="true" 
        :aria-label="ariaLabel ?? loc.skeleton.loading" 
    > 
        <span class="sr-only">{{ ariaLabel ?? loc.skeleton.loading }}</span> 
    </div> 
</template> 
 
<style scoped> 
.modo-skeleton { 
    display: block; 
    background-color: var(--muted); 
    position: relative; 
    overflow: hidden; 
    /* Prevents the shimmer from bleeding past rounded corners. */ 
    isolation: isolate; 
} 
 
/* Shimmer: moving highlight gradient swept across the bar. Uses a 
 * pseudo-element so the underlying background-color remains stable and the 
 * gradient keeps its aspect regardless of bar size. */ 
.modo-skeleton--shimmer::after { 
    content: ''; 
    position: absolute; 
    inset: 0; 
    background: linear-gradient( 
        90deg, 
        transparent 0%, 
        color-mix(in oklch, var(--foreground) 6%, transparent) 50%, 
        transparent 100% 
    ); 
    background-size: 200% 100%; 
    background-repeat: no-repeat; 
    animation: modo-skeleton-shimmer 1.4s linear infinite; 
} 
 
.dark .modo-skeleton--shimmer::after, 
[data-modo-theme="dark"] .modo-skeleton--shimmer::after { 
    background: linear-gradient( 
        90deg, 
        transparent 0%, 
        color-mix(in oklch, var(--foreground) 10%, transparent) 50%, 
        transparent 100% 
    ); 
    background-size: 200% 100%; 
    background-repeat: no-repeat; 
} 
 
.modo-skeleton--pulse { 
    animation: modo-skeleton-pulse 1.6s ease-in-out infinite; 
} 
 
/* `static` variant intentionally has no animation — useful for tests and 
 * when a non-moving placeholder is desired. */ 
.modo-skeleton--static { 
    /* no-op */ 
} 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-skeleton--shimmer::after, 
    .modo-skeleton--pulse { 
        animation: none; 
    } 
} 
</style>
