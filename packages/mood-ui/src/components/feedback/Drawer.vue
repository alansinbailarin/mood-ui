<template> 
    <Teleport to="body"> 
        <Transition :css="false" @enter="onOverlayEnter" @leave="onOverlayLeave" appear> 
            <div 
                v-if="modelValue" 
                ref="overlayRef" 
                :class="[ 
                    'modo-drawer-overlay fixed inset-0 z-1200 flex opacity-0', 
                    inset ? 'p-2.5' : '', 
                    positionClasses, 
                ]" 
                :style="overlayStyle" 
                :data-modo-theme="scopedTheme || undefined" 
                @mousedown="onOverlayMouseDown" 
                @click="onOverlayClick" 
            > 
                <!-- Scrim (shared Valux material, dark veil in both modes) -->
                <div
                    aria-hidden="true"
                    class="modo-scrim pointer-events-none absolute inset-0"
                    :data-modo-scrim="scrimVariant"
                />
                <div 
                    ref="panelRef" 
                    data-modo-drawer-panel 
                    role="dialog" 
                    aria-modal="true" 
                    :aria-labelledby="title ? titleId : undefined" 
                    :aria-describedby="description ? descriptionId : undefined" 
                    :aria-label="!title ? ariaLabel : undefined" 
                    :class="[ 
                        'modo-drawer modo-drawer-glass relative flex flex-col text-foreground overflow-hidden', 
                        'outline-none focus:outline-none focus-visible:outline-none', 
                        sideBorderClass, 
                        sizeClasses, 
                        radiusClasses, 
                    ]" 
                    tabindex="-1" 
                    @click.stop 
                    @keydown="onPanelKeydown" 
                > 
                    <!-- Inner border layer --> 
                    <span 
                        v-if="innerBorder" 
                        aria-hidden="true" 
                        :class="[ 
                            'pointer-events-none absolute inset-1 border border-border/40', 
                            innerBorderRadiusClass, 
                        ]" 
                    /> 
 
                    <!-- Close button --> 
                    <div v-if="showClose" class="absolute top-3 right-3.5 z-10"> 
                        <button
                            type="button"
                            class="modo-drawer__x"
                            :aria-label="closeLabelText"
                            @click="close"
                        >
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                                <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                            </svg>
                        </button>
                    </div> 
 
                    <!-- Content wrapper --> 
                    <div ref="contentRef" data-modo-drawer-content class="flex flex-col min-h-0 flex-1"> 
                        <!-- Header --> 
                        <header 
                            v-if="$slots.header || title || description" 
                            :class="[ 
                                'relative flex flex-col gap-1 px-5 pt-5', 
                                showClose ? 'pr-14' : '', 
                                $slots.default || $slots.body || $slots.footer ? 'pb-4' : 'pb-6', 
                            ]" 
                        > 
                            <slot name="header"> 
                                <Typography 
                                    v-if="title" 
                                    :id="titleId" 
                                    variant="title" 
                                    size="medium" 
                                    as="h2" 
                                    weight="semibold" 
                                > 
                                    {{ title }} 
                                </Typography> 
                                <Typography 
                                    v-if="description" 
                                    :id="descriptionId" 
                                    variant="body" 
                                    size="small" 
                                    color="muted" 
                                > 
                                    {{ description }} 
                                </Typography> 
                            </slot> 
                        </header> 
 
                        <!-- Body --> 
                        <div 
                            v-if="$slots.default || $slots.body" 
                            :class="[ 
                                'relative flex-1 overflow-auto px-5', 
                                ($slots.header || title || description) ? '' : 'pt-5', 
                                $slots.footer ? 'pb-4' : 'pb-6', 
                            ]" 
                        > 
                            <slot name="body"> 
                                <slot /> 
                            </slot> 
                        </div> 
 
                        <!-- Footer --> 
                        <footer 
                            v-if="$slots.footer" 
                            class="relative flex items-center justify-end gap-2 px-5 py-4" 
                        > 
                            <span 
                                v-if="innerBorder" 
                                aria-hidden="true" 
                                class="pointer-events-none absolute top-0 left-1 right-1 h-px bg-border/40" 
                            /> 
                            <span 
                                v-else 
                                aria-hidden="true" 
                                class="pointer-events-none absolute top-0 left-0 right-0 h-px bg-border" 
                            /> 
                            <slot name="footer" :close="close" /> 
                        </footer> 
                    </div> 
                </div> 
            </div> 
        </Transition> 
    </Teleport> 
</template> 
 
<script setup lang="ts"> 
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'; 
import { gsap } from 'gsap'; 
import Typography from '../data-display/Typography.vue'; 
import type { Drawer } from '../../interfaces/feedback/Drawer.interface'; 
import { 
    useResolvedRadius, 
    useResolvedTheme, 
    useModoConfig, 
    useModoLocale,
} from '../../composables/useModoConfig'; 
import { resolveColorMode } from '../../composables/useColorMode';
import { lockBodyScroll, unlockBodyScroll } from '../../composables/useBodyScrollLock';
import { palettesToCssVars, semanticTokensFromPalettes } from '../../config/palettes'; 
import { hexToOklchString, pickForegroundOklch } from '../../config/colorPrimitives'; 
import { surfacesToCssVars } from '../../config/surfaces';
import type { ModoRadius } from '../../config/ModoConfig'; 
 
const props = withDefaults(defineProps<Drawer>(), { 
    modelValue: false, 
    side: 'right', 
    size: 'medium', 
    inset: true,
    closeOnOverlay: true, 
    closeOnEscape: true, 
    showClose: true, 
    lockScroll: true, 
    color: 'default', 
    overlay: 'blur', 
    innerBorder: false, 
});
// Close button label: prop wins, then the provider locale (`common.close`).
const loc = useModoLocale();
const closeLabelText = computed(() => props.closeLabel ?? loc.value.common.close);
 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: boolean]; 
    open: []; 
    close: []; 
    afterLeave: []; 
}>(); 
 
const autoId = useId(); 
const titleId = computed(() => `modo-drawer-${autoId}-title`); 
const descriptionId = computed(() => `modo-drawer-${autoId}-desc`); 
 
const overlayRef = ref<HTMLElement | null>(null); 
const panelRef = ref<HTMLElement | null>(null); 
const contentRef = ref<HTMLElement | null>(null); 
 
const resolvedRadius = useResolvedRadius(() => props.radius as ModoRadius | undefined); 
 
const cfg = useModoConfig(); 
const theme = useResolvedTheme(); 
const scopedTheme = computed(() => resolveColorMode(theme.value)); 
 
const overlayStyle = computed(() => { 
    const providerVars = cfg?.value.palettes 
        ? { 
            ...palettesToCssVars(cfg.value.palettes), 
            ...semanticTokensFromPalettes(cfg.value.palettes, hexToOklchString, pickForegroundOklch), 
        } 
        : {};
    const surfaceVars = cfg?.value.surfaces
        ? surfacesToCssVars(cfg.value.surfaces)
        : {};
    const darkSurfaceVars = (scopedTheme.value === 'dark' && cfg?.value.darkSurfaces)
        ? surfacesToCssVars(cfg.value.darkSurfaces)
        : {};
    return { ...providerVars, ...surfaceVars, ...darkSurfaceVars }; 
}); 
 
function close() { 
    if (!props.modelValue) return; 
    emit('update:modelValue', false); 
    emit('close'); 
} 
 
/* ---------- Click outside ---------- */ 
let mouseDownOnOverlay = false; 
function onOverlayMouseDown(e: MouseEvent) { 
    mouseDownOnOverlay = e.target === overlayRef.value; 
} 
function onOverlayClick(e: MouseEvent) { 
    if (!props.closeOnOverlay) return; 
    if (e.target !== overlayRef.value) return; 
    if (!mouseDownOnOverlay) return; 
    close(); 
} 
 
/* ---------- Keydown (Escape + focus trap) ---------- */ 
function onPanelKeydown(e: KeyboardEvent) { 
    if (props.closeOnEscape && e.key === 'Escape') { 
        e.preventDefault(); 
        close(); 
        return; 
    } 
    if (e.key === 'Tab' && panelRef.value) { 
        const focusables = getFocusable(panelRef.value); 
        if (focusables.length === 0) { 
            e.preventDefault(); 
            return; 
        } 
        const first = focusables[0]; 
        const last = focusables[focusables.length - 1]; 
        const active = document.activeElement as HTMLElement | null; 
        if (e.shiftKey && active === first) { 
            e.preventDefault(); 
            last.focus(); 
        } else if (!e.shiftKey && active === last) { 
            e.preventDefault(); 
            first.focus(); 
        } 
    } 
} 
 
const FOCUSABLE_SELECTOR = 
    'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'; 
 
function getFocusable(container: HTMLElement): HTMLElement[] { 
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) 
        .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null); 
} 
 
/* ---------- Animations (slide from edge) ---------- */ 
 
function prefersReducedMotion() { 
    return typeof window !== 'undefined' 
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches; 
} 
 
let activeTimeline: gsap.core.Timeline | null = null; 
 
function getEnterTransform() { 
    const marginOffset = props.inset ? 28 : 0;
    switch (props.side) { 
        case 'left': return { xPercent: -100, x: -marginOffset, yPercent: 0, y: 0 }; 
        case 'right': return { xPercent: 100, x: marginOffset, yPercent: 0, y: 0 }; 
        case 'top': return { xPercent: 0, x: 0, yPercent: -100, y: -marginOffset }; 
        case 'bottom': return { xPercent: 0, x: 0, yPercent: 100, y: marginOffset }; 
        default: return { xPercent: 100, x: marginOffset, yPercent: 0, y: 0 }; 
    } 
} 
 
function onOverlayEnter(el: Element, done: () => void) { 
    const overlay = (el as HTMLElement) ?? overlayRef.value; 
    const panel = 
        overlay?.querySelector<HTMLElement>('[data-modo-drawer-panel]') 
        ?? panelRef.value; 
    if (!overlay || !panel) { done(); return; } 
 
    activeTimeline?.kill(); 
 
    if (prefersReducedMotion()) { 
        gsap.set([overlay, panel], { opacity: 1, clearProps: 'transform' }); 
        done(); 
        return; 
    } 
 
    const enter = getEnterTransform(); 
    const tl = gsap.timeline({ onComplete: () => { activeTimeline = null; done(); } }); 
    activeTimeline = tl; 
 
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: 'power2.out' }, 0); 
 
    tl.fromTo( 
        panel, 
        { xPercent: enter.xPercent, x: enter.x, yPercent: enter.yPercent, y: enter.y, opacity: 1 }, 
        { xPercent: 0, x: 0, yPercent: 0, y: 0, opacity: 1, duration: 0.38, ease: 'power4.out' }, 
        0, 
    ); 
} 
 
function onOverlayLeave(el: Element, done: () => void) { 
    const overlay = el as HTMLElement; 
    const panel = 
        overlay.querySelector<HTMLElement>('[data-modo-drawer-panel]') 
        ?? panelRef.value; 
    // Bail out without animating, but never without releasing the lock.
    if (!overlay || !panel) { releaseScrollLock(); done(); return; }
 
    activeTimeline?.kill(); 
 
    if (prefersReducedMotion()) { 
        gsap.to(overlay, { 
            opacity: 0, 
            duration: 0.12, 
            onComplete: () => { releaseScrollLock(); done(); }, 
        }); 
        return; 
    } 
 
    const enter = getEnterTransform(); 
    const tl = gsap.timeline({ 
        onComplete: () => { 
            activeTimeline = null; 
            releaseScrollLock(); 
            done(); 
        }, 
    }); 
    activeTimeline = tl; 
 
    tl.to( 
        panel, 
        { xPercent: enter.xPercent, x: enter.x, yPercent: enter.yPercent, y: enter.y, duration: 0.28, ease: 'power3.in' }, 
        0, 
    ); 
    tl.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in' }, 0.04); 
} 
 
/* ---------- Scroll lock + focus management ---------- */
let previouslyFocused: HTMLElement | null = null;
let scrollLocked = false;

function releaseScrollLock() {
    if (!scrollLocked) return;
    scrollLocked = false;
    unlockBodyScroll();
}

watch( 
    () => props.modelValue, 
    (open) => { 
        if (open) { 
            const active = document.activeElement as HTMLElement | null; 
            previouslyFocused = active; 
 
            if (props.lockScroll && !scrollLocked) {
                scrollLocked = true;
                lockBodyScroll();
            }
            emit('open'); 
            nextTick(() => { 
                if (!panelRef.value) return; 
                const focusables = getFocusable(panelRef.value); 
                (focusables[0] ?? panelRef.value).focus(); 
            }); 
        } else { 
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') { 
                previouslyFocused.focus(); 
            } 
            previouslyFocused = null; 
            emit('afterLeave'); 
        } 
    }, 
); 
 
onBeforeUnmount(() => { 
    activeTimeline?.kill(); 
    releaseScrollLock(); 
}); 
 
/* ---------- Style maps ---------- */ 
 
const isHorizontal = computed(() => props.side === 'left' || props.side === 'right'); 
 
const positionClasses = computed(() => { 
    switch (props.side) { 
        case 'left': return 'flex-row items-stretch justify-start'; 
        case 'right': return 'flex-row items-stretch justify-end'; 
        case 'top': return 'flex-col items-stretch justify-start'; 
        case 'bottom': return 'flex-col items-stretch justify-end'; 
        default: return 'flex-row items-stretch justify-end'; 
    } 
}); 
 
const sizeClasses = computed(() => { 
    if (isHorizontal.value) { 
        if (props.inset) {
            const baseCls = 'h-full max-h-full max-w-full';
            switch (props.size) { 
                case 'xsmall': return `${baseCls} w-[16rem]`; 
                case 'small': return `${baseCls} w-[18rem]`; 
                case 'large': return `${baseCls} w-[28rem]`; 
                case 'full': return `${baseCls} w-full`; 
                default: return `${baseCls} w-[22rem]`; 
            }
        }
        const heightCls = 'h-full'; 
        switch (props.size) { 
            case 'xsmall': return `${heightCls} w-[17rem] max-w-[88vw]`; 
            case 'small': return `${heightCls} w-[20rem] max-w-[90vw]`; 
            case 'large': return `${heightCls} w-[36rem] max-w-[95vw]`; 
            case 'full': return `${heightCls} w-screen`; 
            default: return `${heightCls} w-[28rem] max-w-[92vw]`; 
        } 
    } else { 
        if (props.inset) {
            const baseCls = 'w-full max-w-full max-h-full';
            switch (props.size) { 
                case 'xsmall': return `${baseCls} h-[14rem]`; 
                case 'small': return `${baseCls} h-[18rem]`; 
                case 'large': return `${baseCls} h-[32rem] sm:max-h-[88dvh]`; 
                case 'full': return `${baseCls} h-full`; 
                default: return `${baseCls} h-[24rem] sm:max-h-[85dvh]`; 
            }
        }
        const widthCls = 'w-full'; 
        switch (props.size) { 
            case 'xsmall': return `${widthCls} h-[14rem] max-h-[75vh]`; 
            case 'small': return `${widthCls} h-[18rem] max-h-[80vh]`; 
            case 'large': return `${widthCls} h-[32rem] max-h-[90vh]`; 
            case 'full': return `${widthCls} h-screen`; 
            default: return `${widthCls} h-[24rem] max-h-[85vh]`; 
        } 
    } 
}); 
 
const sideBorderClass = computed(() => { 
    if (props.inset) return 'border';
    switch (props.side) { 
        case 'left': return 'border-r'; 
        case 'right': return 'border-l'; 
        case 'top': return 'border-b'; 
        case 'bottom': return 'border-t'; 
        default: return 'border-l'; 
    } 
}); 
 
/** 
 * Cuando `inset` está activo (default), el panel flota despegado en sus 4 lados
 * y redondea las 4 esquinas respetando `radius`. Si `inset=false`, solo redondea
 * las dos esquinas internas al viewport.
 */ 
const radiusClasses = computed(() => { 
    if (props.inset) {
        // Same radius scale as Sheet / Dialog (--modo-dialog-radius).
        switch (resolvedRadius.value) {
            case 'none': return 'rounded-none';
            case 'small': return 'rounded-[0.5rem]';
            case 'large': return 'rounded-[1.25rem]';
            case 'full': return 'rounded-[1.75rem]';
            default: return 'rounded-[0.875rem]';
        }
    }
    if (props.size === 'full') return 'rounded-none'; 
    const map = { 
        none: { 
            left: 'rounded-none', right: 'rounded-none', 
            top: 'rounded-none', bottom: 'rounded-none', 
        }, 
        small: { 
            left: 'rounded-r-md', right: 'rounded-l-md', 
            top: 'rounded-b-md', bottom: 'rounded-t-md', 
        }, 
        medium: { 
            left: 'rounded-r-xl', right: 'rounded-l-xl', 
            top: 'rounded-b-xl', bottom: 'rounded-t-xl', 
        }, 
        large: { 
            left: 'rounded-r-2xl', right: 'rounded-l-2xl', 
            top: 'rounded-b-2xl', bottom: 'rounded-t-2xl', 
        }, 
        full: { 
            left: 'rounded-r-3xl', right: 'rounded-l-3xl', 
            top: 'rounded-b-3xl', bottom: 'rounded-t-3xl', 
        }, 
    } as const; 
    const r = (resolvedRadius.value ?? 'medium') as keyof typeof map; 
    const safeR = map[r] ? r : 'medium'; 
    return map[safeR][props.side]; 
}); 
 
const innerBorderRadiusClass = computed(() => { 
    if (!props.inset && props.size === 'full') return 'rounded-none'; 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-[calc(0.5rem-4px)]';
        case 'large': return 'rounded-[calc(1.25rem-4px)]';
        case 'full': return 'rounded-[calc(1.75rem-4px)]';
        default: return 'rounded-[calc(0.875rem-4px)]'; 
    } 
}); 
 
const scrimVariant = computed(() => props.overlay ?? 'blur'); 
</script>
