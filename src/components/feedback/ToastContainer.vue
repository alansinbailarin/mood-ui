<template> 
    <Teleport to="body"> 
        <!-- One zone per placement. Empty zones still render an empty wrapper 
             but the `pointer-events-none` keeps them inert. --> 
        <div
            v-for="zone in zones"
            :key="zone.placement"
            :class="['modo-toast-container fixed z-[9999] flex flex-col gap-2 pointer-events-none', zone.classes]"
            :style="{ ...zone.style, ...cssVarStyle }"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        > 
            <TransitionGroup 
                :name="zone.transition" 
                tag="div" 
                class="flex flex-col gap-2" 
            > 
                <Toast 
                    v-for="entry in zone.entries" 
                    :key="String(entry.id)" 
                    :entry="entry" 
                    :elapsed="elapsedFor(entry.id)" 
                    :paused="pausedSet.has(entry.id)" 
                    class="pointer-events-auto" 
                    @dismiss="onDismiss(entry.id)" 
                    @pointer-enter="onEnter(entry.id)" 
                    @pointer-leave="onLeave(entry.id)" 
                /> 
            </TransitionGroup> 
        </div> 
    </Teleport> 
</template> 
 
<script setup lang="ts"> 
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Toast from './Toast.vue';
import { useToast, useToastQueue } from '../../composables/useToast';
import type {
    ToastContainer,
    ToastEntry,
    ToastPlacement,
} from '../../interfaces/feedback/Toast.interface';
import { useModoConfig, useResolvedTheme } from '../../composables/useModoConfig';
import { resolveColorMode } from '../../composables/useColorMode';
import { palettesToCssVars, semanticTokensFromPalettes } from '../../config/palettes';
import { surfacesToCssVars } from '../../config/surfaces';
import { hexToOklchString, pickForegroundOklch } from '../../config/colorPrimitives'; 
 
const props = withDefaults(defineProps<ToastContainer>(), { 
    placement: 'top-right', 
    max: 5, 
    defaultDuration: 4500, 
    defaultVariant: 'subtle', 
    offset: 16, 
    reducedMotion: 'auto', 
}); 
 
const queue = useToastQueue();
const { dismiss } = useToast();

const cfg = useModoConfig();
const theme = useResolvedTheme();
const scopedTheme = computed(() => resolveColorMode(theme.value));

const cssVarStyle = computed(() => {
    const paletteVars = cfg?.value.palettes
        ? {
              ...palettesToCssVars(cfg.value.palettes),
              ...semanticTokensFromPalettes(cfg.value.palettes, hexToOklchString, pickForegroundOklch),
          }
        : {};
    const surfaceVars = cfg?.value.surfaces ? surfacesToCssVars(cfg.value.surfaces) : {};
    const darkSurfaceVars =
        scopedTheme.value === 'dark' && cfg?.value.darkSurfaces
            ? surfacesToCssVars(cfg.value.darkSurfaces)
            : {};
    return { ...paletteVars, ...surfaceVars, ...darkSurfaceVars };
}); 
 
/* ------------------------------------------------------------------ */ 
/*  Per-toast timer state                                               */ 
/* ------------------------------------------------------------------ */ 
 
const elapsedById = ref<Map<string | number, number>>(new Map()); 
const pausedSet = ref<Set<string | number>>(new Set()); 
 
let _raf: number | null = null; 
let _lastFrame = 0; 
 
function tick(now: number) { 
    const dt = _lastFrame ? now - _lastFrame : 0; 
    _lastFrame = now; 
    for (const entry of queue.queue) { 
        if (entry.duration <= 0) continue; 
        if (pausedSet.value.has(entry.id)) continue; 
        const cur = elapsedById.value.get(entry.id) ?? 0; 
        const next = cur + dt; 
        elapsedById.value.set(entry.id, next); 
        if (next >= entry.duration) { 
            dismiss(entry.id); 
            elapsedById.value.delete(entry.id); 
        } 
    } 
    _raf = requestAnimationFrame(tick); 
} 
 
onMounted(() => { 
    _lastFrame = 0; 
    _raf = requestAnimationFrame(tick); 
}); 
 
onBeforeUnmount(() => { 
    if (_raf !== null) cancelAnimationFrame(_raf); 
    _raf = null; 
}); 
 
watch( 
    () => queue.queue.map((t) => t.id), 
    (currentIds) => { 
        const set = new Set(currentIds); 
        for (const id of [...elapsedById.value.keys()]) { 
            if (!set.has(id)) elapsedById.value.delete(id); 
        } 
        for (const id of [...pausedSet.value]) { 
            if (!set.has(id)) pausedSet.value.delete(id); 
        } 
    }, 
); 
 
function elapsedFor(id: string | number) { 
    return elapsedById.value.get(id) ?? 0; 
} 
function onEnter(id: string | number) { 
    const entry = queue.queue.find((t) => t.id === id); 
    if (entry?.pauseOnHover) pausedSet.value.add(id); 
} 
function onLeave(id: string | number) { 
    pausedSet.value.delete(id); 
} 
function onDismiss(id: string | number) { 
    dismiss(id); 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Placement zones                                                      */ 
/* ------------------------------------------------------------------ */ 
 
const ALL_PLACEMENTS: ToastPlacement[] = [ 
    'top-right', 
    'top-left', 
    'top-center', 
    'bottom-right', 
    'bottom-left', 
    'bottom-center', 
]; 
 
function classesFor(p: ToastPlacement): string { 
    switch (p) { 
        case 'top-left': return 'top-0 left-0 items-start'; 
        case 'top-center': return 'top-0 left-1/2 -translate-x-1/2 items-center'; 
        case 'bottom-right': return 'bottom-0 right-0 items-end'; 
        case 'bottom-left': return 'bottom-0 left-0 items-start'; 
        case 'bottom-center': return 'bottom-0 left-1/2 -translate-x-1/2 items-center'; 
        case 'top-right': 
        default: return 'top-0 right-0 items-end'; 
    } 
} 
 
function styleFor(p: ToastPlacement): Record<string, string> { 
    const o = `${props.offset}px`; 
    const style: Record<string, string> = {}; 
    if (p.startsWith('top')) style.paddingTop = o; 
    else style.paddingBottom = o; 
    if (p.endsWith('right')) style.paddingRight = o; 
    else if (p.endsWith('left')) style.paddingLeft = o; 
    return style; 
} 
 
function transitionFor(p: ToastPlacement): string { 
    if (props.reducedMotion === 'force') return 'modo-toast-fade'; 
    if (p.endsWith('right')) return 'modo-toast-slide-right'; 
    if (p.endsWith('left')) return 'modo-toast-slide-left'; 
    return 'modo-toast-slide-vertical'; 
} 
 
const zones = computed(() => { 
    return ALL_PLACEMENTS.map((placement) => { 
        // Each toast is grouped under its own placement, falling back to 
        // the container's `placement` prop when the push didn't specify one. 
        const matching = queue.queue.filter( 
            (t: ToastEntry) => (t.placement ?? props.placement) === placement, 
        ); 
        const capped = matching.slice(-props.max); 
        // Newest closest to the viewport edge: reverse for top placements. 
        const ordered = placement.startsWith('top') ? [...capped].reverse() : capped; 
        return { 
            placement, 
            entries: ordered, 
            classes: classesFor(placement), 
            style: styleFor(placement), 
            transition: transitionFor(placement), 
        }; 
    }); 
}); 
</script> 
 
<style scoped> 
.modo-toast-slide-right-enter-from { transform: translateX(110%); opacity: 0; } 
.modo-toast-slide-right-leave-to { transform: translateX(110%); opacity: 0; } 
.modo-toast-slide-right-enter-active, 
.modo-toast-slide-right-leave-active { transition: transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease; } 
 
.modo-toast-slide-left-enter-from { transform: translateX(-110%); opacity: 0; } 
.modo-toast-slide-left-leave-to { transform: translateX(-110%); opacity: 0; } 
.modo-toast-slide-left-enter-active, 
.modo-toast-slide-left-leave-active { transition: transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease; } 
 
.modo-toast-slide-vertical-enter-from { transform: translateY(-30%); opacity: 0; } 
.modo-toast-slide-vertical-leave-to { transform: translateY(-30%); opacity: 0; } 
.modo-toast-slide-vertical-enter-active, 
.modo-toast-slide-vertical-leave-active { transition: transform 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease; } 
 
.modo-toast-fade-enter-from, 
.modo-toast-fade-leave-to { opacity: 0; } 
.modo-toast-fade-enter-active, 
.modo-toast-fade-leave-active { transition: opacity 150ms ease; } 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-toast-slide-right-enter-from, 
    .modo-toast-slide-left-enter-from, 
    .modo-toast-slide-vertical-enter-from, 
    .modo-toast-slide-right-leave-to, 
    .modo-toast-slide-left-leave-to, 
    .modo-toast-slide-vertical-leave-to { 
        transform: none; 
    } 
} 
</style>
