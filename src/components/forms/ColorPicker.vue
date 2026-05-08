<template>
    <div :class="['flex flex-col gap-1.5', 'inline-flex']">
        <!-- Label -->
        <label
            v-if="label"
            class="text-caption font-medium text-foreground cursor-pointer"
            @click="onTriggerClick"
        >{{ label }}</label>

        <!-- Trigger — identical markup/classes to Select.vue -->
        <button
            ref="triggerEl"
            type="button"
            :disabled="disabled"
            :aria-label="!label ? (ariaLabel ?? 'Pick a color') : undefined"
            :aria-haspopup="'dialog'"
            :aria-expanded="isOpen"
            :class="[
                'modo-field-wrapper flex items-center gap-2 text-left',
                wrapperVariantClasses,
                wrapperSizeClasses,
                radiusClasses,
                disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @click="onTriggerClick"
        >
            <span
                :class="['shrink-0 border border-black/10', swatchSizeClasses, radiusClasses, 'color-swatch-transition']"
                :style="{ backgroundColor: modelValue }"
                aria-hidden="true"
            />
            <span :class="['flex-1 min-w-0 truncate font-mono text-foreground', inputTextClasses]">{{ modelValue }}</span>
            <ChevronDownIcon
                aria-hidden="true"
                :class="['shrink-0 text-muted-foreground transition-transform duration-200', iconSizeClasses, isOpen ? 'rotate-180' : '']"
            />
        </button>

        <!-- Dropdown — same PopoverPanel as Select/MultiSelect -->
        <PopoverPanel
            :open="isOpen"
            :style="panelStyle"
            role="dialog"
            :aria-label="label ?? ariaLabel ?? 'Color picker'"
            @update:panelRef="panelRef = $event"
        >
            <div class="flex flex-col w-64">
                <!-- Swatches grid -->
                <div v-if="resolvedSwatches.length > 0" class="p-3 pb-2.5">
                    <div class="grid grid-cols-8 gap-1.5">
                        <button
                            v-for="hex in resolvedSwatches"
                            :key="hex"
                            type="button"
                            :aria-label="`Color ${hex}`"
                            :aria-pressed="isSelected(hex)"
                            :class="[
                                'relative aspect-square w-full flex items-center justify-center',
                                'border border-black/10',
                                'transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40',
                                radiusClasses,
                            ]"
                            :style="{ backgroundColor: hex }"
                            @click="select(hex)"
                        >
                            <Transition name="check-pop">
                                <CheckIcon
                                    v-if="isSelected(hex)"
                                    class="w-3.5 h-3.5 pointer-events-none drop-shadow"
                                    :style="{ color: swatchForeground(hex) }"
                                />
                            </Transition>
                        </button>
                    </div>
                </div>

                <!-- Divider before custom section -->
                <div class="mx-3 h-px bg-border shrink-0" />

                <!-- Custom color section -->
                <div v-if="showHex || advanced" class="p-3 pt-2.5 flex flex-col gap-2.5">
                    <!-- Advanced HSV picker -->
                    <template v-if="advanced">
                        <!-- Saturation/Value canvas -->
                        <div
                            ref="canvasWrapEl"
                            class="relative w-full h-36 rounded cursor-crosshair select-none touch-none"
                            :style="{ background: `hsl(${hsv.h}, 100%, 50%)` }"
                            @pointerdown.prevent="onCanvasPointerdown"
                        >
                            <!-- White → transparent (left to right) -->
                            <div class="absolute inset-0 rounded" style="background: linear-gradient(to right, #fff, transparent)" />
                            <!-- Transparent → black (top to bottom) -->
                            <div class="absolute inset-0 rounded" style="background: linear-gradient(to bottom, transparent, #000)" />
                            <!-- Cursor -->
                            <div
                                class="absolute w-3.5 h-3.5 rounded-full border-2 border-white shadow pointer-events-none -translate-x-1/2 -translate-y-1/2"
                                :style="{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }"
                            />
                        </div>

                        <!-- Hue slider -->
                        <div ref="hueSliderEl" class="relative h-3 rounded-full cursor-pointer select-none touch-none" @pointerdown.prevent="onHuePointerdown">
                            <div
                                class="absolute inset-0 rounded-full"
                                style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
                            />
                            <div
                                class="absolute top-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                :style="{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }"
                            />
                        </div>
                    </template>

                    <!-- Hex input row -->
                    <div v-if="showHex" class="flex items-center gap-2">
                        <!-- Small color swatch preview -->
                        <span
                            class="shrink-0 w-5 h-5 rounded-full border border-black/10 color-swatch-transition"
                            :style="{ backgroundColor: isValidHex(hexDraft) ? hexDraft : modelValue }"
                            aria-hidden="true"
                        />
                        <!-- Hex text Input component -->
                        <ModeInput
                            :model-value="hexDraft"
                            size="small"
                            variant="outline"
                            placeholder="#000000"
                            :max-length="7"
                            full-width
                            class="font-mono"
                            aria-label="Hex color value"
                            @update:model-value="onHexInputValue"
                            @blur="commitHex"
                            @keydown.enter.prevent="commitHex"
                        />
                    </div>
                </div>
            </div>
        </PopoverPanel>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import type { ColorPicker } from '../../interfaces/forms/ColorPicker.interface';
import { useResolvedSize } from '../../composables/useModoConfig';
import { useFieldState, useFieldClasses } from '../../composables/useField';
import { usePopover } from '../../composables/usePopover';
import PopoverPanel from '../layout/PopoverPanel.vue';
import ModeInput from './Input.vue';
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline';

const DEFAULT_SWATCHES = [
    '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff', '#fef3c7',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const props = withDefaults(defineProps<ColorPicker>(), {
    modelValue: '#6366f1',
    showHex: true,
    advanced: false,
    disabled: false,
    variant: 'outline',
    color: 'default',
    placement: 'bottom-start',
});

const emit = defineEmits<{
    'update:modelValue': [v: string];
    'change': [v: string];
}>();

const resolvedSize = useResolvedSize(() => props.size);

// Use the exact same field state system as Select/Input
const { radius, stateColor, hasError, isDisabled } = useFieldState(
    props as any,
    { componentName: 'ColorPicker', idPrefix: 'modo-colorpicker' },
);
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({
    variant: () => props.variant ?? 'outline',
    stateColor,
    hasError,
    radius,
    forceFocus: () => isOpen.value,
    halo: () => undefined,
});

const hexDraft = ref(props.modelValue ?? '#6366f1');
const triggerEl = ref<HTMLButtonElement | null>(null);
const canvasWrapEl = ref<HTMLElement | null>(null);
const hueSliderEl = ref<HTMLElement | null>(null);

const resolvedSwatches = computed(() => props.swatches ?? DEFAULT_SWATCHES);

watch(() => props.modelValue, (v) => {
    if (v) {
        hexDraft.value = v;
        const parsed = hexToHsv(v);
        if (parsed) hsv.value = parsed;
    }
});

// ── HSV state ────────────────────────────────────────────────────────────────
const hsv = ref(hexToHsv(props.modelValue ?? '#6366f1') ?? { h: 0, s: 100, v: 100 });

function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
    if (!isValidHex(hex)) return null;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    const v = max * 100;
    const s = max === 0 ? 0 : (d / max) * 100;
    let h = 0;
    if (d !== 0) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
            case g: h = ((b - r) / d + 2) * 60; break;
            case b: h = ((r - g) / d + 4) * 60; break;
        }
    }
    return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

function hsvToHex(h: number, s: number, v: number): string {
    s /= 100; v /= 100;
    const f = (n: number) => {
        const k = (n + h / 60) % 6;
        return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
}

function applyHsv() {
    const hex = hsvToHex(hsv.value.h, hsv.value.s, hsv.value.v);
    hexDraft.value = hex;
    emit('update:modelValue', hex);
    emit('change', hex);
}

// Canvas drag
let canvasDragging = false;
function onCanvasPointerdown(e: PointerEvent) {
    canvasDragging = true;
    updateCanvas(e);
    window.addEventListener('pointermove', onCanvasPointermove);
    window.addEventListener('pointerup', stopCanvasDrag);
}
function onCanvasPointermove(e: PointerEvent) {
    if (!canvasDragging) return;
    updateCanvas(e);
}
function stopCanvasDrag() {
    canvasDragging = false;
    window.removeEventListener('pointermove', onCanvasPointermove);
    window.removeEventListener('pointerup', stopCanvasDrag);
}
function updateCanvas(e: PointerEvent) {
    const el = canvasWrapEl.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100;
    const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)) * 100;
    hsv.value = { ...hsv.value, s: Math.round(s), v: Math.round(v) };
    applyHsv();
}

// Hue slider drag
let hueDragging = false;
function onHuePointerdown(e: PointerEvent) {
    hueDragging = true;
    updateHue(e);
    window.addEventListener('pointermove', onHuePointermove);
    window.addEventListener('pointerup', stopHueDrag);
}
function onHuePointermove(e: PointerEvent) {
    if (!hueDragging) return;
    updateHue(e);
}
function stopHueDrag() {
    hueDragging = false;
    window.removeEventListener('pointermove', onHuePointermove);
    window.removeEventListener('pointerup', stopHueDrag);
}
function updateHue(e: PointerEvent) {
    const el = hueSliderEl.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 360);
    hsv.value = { ...hsv.value, h };
    applyHsv();
}

onBeforeUnmount(() => {
    stopCanvasDrag();
    stopHueDrag();
});

// ── Popover ──────────────────────────────────────────────────────────────────
const {
    triggerRef,
    panelRef,
    isOpen,
    panelStyle,
    open: openPopover,
    close: closePopover,
    toggle: togglePopover,
} = usePopover({
    placement: props.placement as any,
    onClose: () => { hexDraft.value = props.modelValue ?? '#6366f1'; },
});

watch(triggerEl, (el) => (triggerRef.value = el));

function onTriggerClick() {
    if (props.disabled) return;
    togglePopover();
}

// ── Color helpers ────────────────────────────────────────────────────────────
function isSelected(hex: string) {
    return (props.modelValue ?? '').toLowerCase() === hex.toLowerCase();
}

function swatchForeground(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#1a1a1a' : '#ffffff';
}

function select(hex: string) {
    if (!isValidHex(hex)) return;
    emit('update:modelValue', hex);
    emit('change', hex);
    hexDraft.value = hex;
    const parsed = hexToHsv(hex);
    if (parsed) hsv.value = parsed;
}

function onHexInputValue(v: string) {
    let val = v.trim();
    if (val && !val.startsWith('#')) val = `#${val}`;
    hexDraft.value = val;
}

function onHexInput(e: Event) {
    onHexInputValue((e.target as HTMLInputElement).value);
}

function commitHex() {
    if (isValidHex(hexDraft.value)) {
        select(hexDraft.value);
    } else {
        hexDraft.value = props.modelValue ?? '#6366f1';
    }
}

function isValidHex(v: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(v);
}

// ── Size classes (same scale as Select) ─────────────────────────────────────
const wrapperSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'h-8 px-2.5';
        case 'large':  return 'h-12 px-4';
        case 'medium':
        default:       return 'h-10 px-3';
    }
});

const inputTextClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small': return 'text-caption';
        case 'large': return 'text-body-lg';
        default:      return 'text-body';
    }
});

const swatchSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-4 h-4';
        case 'large':  return 'w-6 h-6';
        case 'medium':
        default:       return 'w-5 h-5';
    }
});

const iconSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-3.5 h-3.5';
        case 'large':  return 'w-5 h-5';
        case 'medium':
        default:       return 'w-4 h-4';
    }
});

defineExpose({ open: openPopover, close: closePopover, toggle: togglePopover });
</script>

<style scoped>
.color-swatch-transition {
    transition: background-color 220ms ease;
}
.check-pop-enter-active {
    transition: opacity 160ms ease, transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-pop-leave-active {
    transition: opacity 100ms ease, transform 100ms ease;
}
.check-pop-enter-from {
    opacity: 0;
    transform: scale(0.3);
}
.check-pop-leave-to {
    opacity: 0;
    transform: scale(0.5);
}
</style>
