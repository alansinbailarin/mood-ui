<template> 
    <Teleport to="body"> 
        <Transition :css="false" @enter="onOverlayEnter" @leave="onOverlayLeave" appear> 
            <div 
                v-if="modelValue" 
                ref="overlayRef" 
                :class="[ 
                    'modo-modal-overlay fixed inset-0 z-1200 flex opacity-0', 
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
                    data-modo-modal-panel 
                    role="dialog" 
                    aria-modal="true" 
                    :aria-labelledby="title ? titleId : undefined" 
                    :aria-describedby="description ? descriptionId : undefined" 
                    :aria-label="!title ? ariaLabel : undefined" 
                    :class="[ 
                        'modo-modal relative flex flex-col w-full bg-card text-foreground overflow-hidden', 
                        'dark:bg-card/85 dark:backdrop-blur-xl', 
                        'border border-border shadow-xl outline-none focus:outline-none focus-visible:outline-none', 
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
 
                    <!-- Close button (usa nuestro Button en modo icono) --> 
                    <div v-if="showClose" class="absolute top-3 right-3 z-10"> 
                        <Button 
                            variant="text" 
                            size="small" 
                            :color="resolvedColor" 
                            :icon="XMarkIcon" 
                            :ariaLabel="closeLabelText" 
                            @click="close" 
                        /> 
                    </div> 
 
                    <!-- Content wrapper --> 
                    <div ref="contentRef" data-modo-modal-content class="flex flex-col min-h-0 flex-1"> 
                        <!-- Header --> 
                        <header 
                            v-if="$slots.header || title || description" 
                            :class="[ 
                                'relative flex flex-col gap-1 px-6 pt-6', 
                                showClose ? 'pr-12' : '', 
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
                                'relative flex-1 overflow-auto px-6', 
                                ($slots.header || title || description) ? '' : 'pt-6', 
                                $slots.footer ? 'pb-4' : 'pb-6', 
                            ]" 
                        > 
                            <slot name="body"> 
                                <slot /> 
                            </slot> 
                        </div> 
 
                        <!-- Footer (divider respeta inner border con inset) --> 
                        <footer 
                            v-if="$slots.footer" 
                            class="relative flex items-center justify-end gap-2 px-6 py-4" 
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'; 
import { gsap } from 'gsap'; 
import { XMarkIcon } from '@heroicons/vue/24/outline'; 
import Button from '../forms/Button.vue'; 
import Typography from '../data-display/Typography.vue'; 
import type { Modal } from '../../interfaces/feedback/Modal.interface'; 
import { 
    useResolvedColor, 
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
import type { ModoColor, ModoRadius } from '../../config/ModoConfig'; 
 
const props = withDefaults(defineProps<Modal>(), { 
    modelValue: false, 
    size: 'medium', 
    position: 'center', 
    closeOnOverlay: true, 
    closeOnEscape: true, 
    showClose: true, 
    lockScroll: true, 
    color: 'default', 
    overlay: 'blur', 
    innerBorder: true, 
    disableOriginAnimation: false, 
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
const titleId = computed(() => `modo-modal-${autoId}-title`); 
const descriptionId = computed(() => `modo-modal-${autoId}-desc`); 
 
const overlayRef = ref<HTMLElement | null>(null); 
const panelRef = ref<HTMLElement | null>(null); 
const contentRef = ref<HTMLElement | null>(null); 
 
const resolvedColor = useResolvedColor(() => props.color as ModoColor | undefined); 
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
 
/* ---------- Animations (staged open/close) ---------- */ 
 
function prefersReducedMotion() { 
    return typeof window !== 'undefined' 
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches; 
} 
 
let capturedOrigin: HTMLElement | null = null; 
let lastPointerTrigger: { el: HTMLElement; time: number } | null = null;

function onWindowPointerDown(e: PointerEvent) {
    const target = e.target as Element | null;
    const trigger = target?.closest?.('button, a, [role="button"], [tabindex]') as HTMLElement | null;
    if (trigger) {
        lastPointerTrigger = { el: trigger, time: Date.now() };
    }
}

function getOriginEl(): HTMLElement | null { 
    if (props.origin) return props.origin; 
    return capturedOrigin; 
} 
 
let activeTimeline: gsap.core.Timeline | null = null; 
 
function onOverlayEnter(el: Element, done: () => void) { 
    const overlay = (el as HTMLElement) ?? overlayRef.value; 
    const panel = 
        overlay?.querySelector<HTMLElement>('[data-modo-modal-panel]') 
        ?? panelRef.value; 
    if (!overlay || !panel) { done(); return; } 
 
    activeTimeline?.kill(); 
 
    if (prefersReducedMotion()) { 
        gsap.set([overlay, panel], { opacity: 1, clearProps: 'transform' }); 
        done(); 
        return; 
    } 
 
    const origin = !props.disableOriginAnimation ? getOriginEl() : null; 
    const pRect = panel.getBoundingClientRect(); 
 
    const tl = gsap.timeline({ onComplete: () => { activeTimeline = null; done(); } }); 
    activeTimeline = tl; 
 
    // 1. Overlay fade in 
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0); 
 
    // 2. Panel + contenido emergen juntos desde el trigger hasta su tamaño real
    if (origin && document.body.contains(origin)) { 
        const oRect = origin.getBoundingClientRect(); 
        const dx = oRect.left + oRect.width / 2 - (pRect.left + pRect.width / 2); 
        const dy = oRect.top + oRect.height / 2 - (pRect.top + pRect.height / 2); 
        const scaleX = Math.max(oRect.width / pRect.width, 0.05); 
        const scaleY = Math.max(oRect.height / pRect.height, 0.05); 
        tl.fromTo( 
            panel, 
            { x: dx, y: dy, scaleX, scaleY, opacity: 0.85, transformOrigin: 'center center' }, 
            { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }, 
            0.05, 
        ); 
    } else { 
        tl.fromTo( 
            panel, 
            { y: 16, scale: 0.95, opacity: 0 }, 
            { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' }, 
            0, 
        ); 
    } 
} 
 
function onOverlayLeave(el: Element, done: () => void) { 
    // Durante el leave, los template refs de Vue ya fueron desvinculados, 
    // así que resolvemos los nodos desde el elemento que Transition nos entrega. 
    const overlay = el as HTMLElement; 
    const panel = 
        overlay.querySelector<HTMLElement>('[data-modo-modal-panel]') 
        ?? panelRef.value; 
    // Bail out without animating, but never without releasing the lock — this
    // path is the one that used to strand `overflow: hidden` on <body>.
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

    const origin = !props.disableOriginAnimation ? getOriginEl() : null; 
    const pRect = panel.getBoundingClientRect(); 
 
    const tl = gsap.timeline({ 
        onComplete: () => { 
            activeTimeline = null; 
            releaseScrollLock(); 
            done(); 
        }, 
    }); 
    activeTimeline = tl; 
 
    // El panel regresa con todo su contenido visible hacia su lugar de origen;
    // el overlay (padre del panel) solo cae en opacidad al final del recorrido
    // para no ocultar el vuelo de regreso antes de llegar al trigger.
    if (origin && document.body.contains(origin)) { 
        const oRect = origin.getBoundingClientRect(); 
        const dx = oRect.left + oRect.width / 2 - (pRect.left + pRect.width / 2); 
        const dy = oRect.top + oRect.height / 2 - (pRect.top + pRect.height / 2); 
        const scaleX = Math.max(oRect.width / pRect.width, 0.05); 
        const scaleY = Math.max(oRect.height / pRect.height, 0.05); 
        tl.to( 
            panel, 
            { x: dx, y: dy, scaleX, scaleY, transformOrigin: 'center center', duration: 0.38, ease: 'power3.in' }, 
            0, 
        ); 
        tl.to(overlay, { opacity: 0, duration: 0.28, ease: 'power3.in' }, 0.1); 
    } else { 
        tl.to( 
            panel, 
            { y: 10, scale: 0.95, opacity: 0, duration: 0.24, ease: 'power2.in' }, 
            0, 
        ); 
        tl.to(overlay, { opacity: 0, duration: 0.24, ease: 'power2.in' }, 0.04); 
    } 
} 
 
/* ---------- Scroll lock + focus management ---------- */
let previouslyFocused: HTMLElement | null = null;
let scrollLocked = false;

function releaseScrollLock() {
    if (!scrollLocked) return;
    scrollLocked = false;
    unlockBodyScroll();
}

onMounted(() => {
    if (typeof window !== 'undefined') {
        window.addEventListener('pointerdown', onWindowPointerDown, { capture: true, passive: true });
    }
});

watch( 
    () => props.modelValue, 
    (open) => { 
        if (open) { 
            const active = document.activeElement as HTMLElement | null; 
            const recentPointer =
                lastPointerTrigger
                && Date.now() - lastPointerTrigger.time < 600
                && document.body.contains(lastPointerTrigger.el)
                    ? lastPointerTrigger.el
                    : null;
            const triggerEl =
                active && active !== document.body && active !== document.documentElement
                    ? active
                    : recentPointer;
            previouslyFocused = triggerEl; 
            capturedOrigin = triggerEl; 
 
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
            // El scroll lock se libera en onOverlayLeave cuando termina la 
            // animación, para evitar que aparezca el scrollbar y empuje el 
            // modal antes de que desaparezca. 
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') { 
                previouslyFocused.focus(); 
            } 
            previouslyFocused = null; 
            emit('afterLeave'); 
        } 
    }, 
); 
 
onBeforeUnmount(() => { 
    if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', onWindowPointerDown, { capture: true });
    }
    activeTimeline?.kill(); 
    releaseScrollLock(); 
}); 
 
/* ---------- Style maps ---------- */ 
const sizeClasses = computed(() => { 
    switch (props.size) { 
        case 'xsmall': return 'max-w-xs';
        case 'small': return 'max-w-sm'; 
        case 'large': return 'max-w-2xl'; 
        case 'xlarge': return 'max-w-4xl'; 
        case 'full': return 'max-w-none w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]'; 
        default: return 'max-w-md'; 
    } 
}); 
 
const radiusClasses = computed(() => { 
    if (props.size === 'full') return 'rounded-xl'; 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-md'; 
        case 'large': return 'rounded-2xl'; 
        case 'full': return 'rounded-3xl'; 
        default: return 'rounded-xl'; 
    } 
}); 
 
const innerBorderRadiusClass = computed(() => { 
    if (props.size === 'full') return 'rounded-lg'; 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-[calc(1.5rem-4px)]'; 
        default: return 'rounded-lg'; 
    } 
}); 
 
const positionClasses = computed(() => { 
    if (props.position === 'top') return 'items-start justify-center p-4 sm:p-6 pt-[10vh]'; 
    return 'items-center justify-center p-4 sm:p-6'; 
}); 
 
const scrimVariant = computed(() => props.overlay ?? 'blur'); 
</script>
