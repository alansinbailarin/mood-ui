<template>
    <div ref="rootEl" class="relative inline-block">
        <button
            ref="triggerEl"
            type="button"
            :aria-label="ariaLabel ?? 'Pick a color'"
            :aria-haspopup="'dialog'"
            :aria-expanded="open"
            :disabled="disabled"
            :class="[
                'inline-flex items-center gap-2 border border-border bg-card text-foreground',
                'transition-colors hover:border-foreground/40',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30',
                triggerSizeClasses,
                triggerRadiusClasses,
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @click="toggle"
        >
            <span
                :class="['shrink-0 border border-border', swatchSizeClasses, swatchRadiusClasses]"
                :style="{ backgroundColor: modelValue }"
                aria-hidden="true"
            />
            <span class="font-mono">{{ modelValue }}</span>
        </button>

        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="open"
                role="dialog"
                aria-label="Color picker"
                :class="[
                    'absolute z-50 mt-2 w-64 p-3 bg-popover border border-border shadow-lg',
                    panelRadiusClasses,
                    panelPlacement,
                ]"
            >
                <!-- Swatches -->
                <div v-if="resolvedSwatches.length > 0" class="grid grid-cols-8 gap-1.5 mb-3">
                    <button
                        v-for="hex in resolvedSwatches"
                        :key="hex"
                        type="button"
                        :aria-label="`Color ${hex}`"
                        :class="[
                            'aspect-square w-full border border-border transition-transform hover:scale-110',
                            swatchRadiusClasses,
                            modelValue.toLowerCase() === hex.toLowerCase()
                                ? 'ring-2 ring-foreground ring-offset-2 ring-offset-popover'
                                : '',
                        ]"
                        :style="{ backgroundColor: hex }"
                        @click="select(hex)"
                    />
                </div>

                <!-- Hex input + native picker -->
                <div v-if="showHex || showNative" class="flex items-center gap-2">
                    <input
                        v-if="showHex"
                        :value="hexDraft"
                        type="text"
                        spellcheck="false"
                        maxlength="7"
                        placeholder="#000000"
                        :class="[
                            'flex-1 px-2 py-1.5 bg-background border border-border text-foreground font-mono text-sm',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30',
                            swatchRadiusClasses,
                        ]"
                        @input="onHexInput"
                        @keydown.enter="commitHex"
                        @blur="commitHex"
                    />
                    <input
                        v-if="showNative"
                        :value="modelValue"
                        type="color"
                        aria-label="Native color picker"
                        :class="[
                            'w-9 h-9 cursor-pointer bg-transparent border border-border',
                            swatchRadiusClasses,
                        ]"
                        @input="(e: Event) => select((e.target as HTMLInputElement).value)"
                    />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { ColorPicker } from '../../interfaces/forms/ColorPicker.interface';
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig';

const DEFAULT_SWATCHES = [
    '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff', '#fef3c7',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const props = withDefaults(defineProps<ColorPicker>(), {
    modelValue: '#6366f1',
    showHex: true,
    showNative: true,
    disabled: false,
    placement: 'bottom-start',
});

const emit = defineEmits<{
    'update:modelValue': [v: string];
    'change': [v: string];
}>();

const resolvedSize = useResolvedSize(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);

const open = ref(false);
const hexDraft = ref(props.modelValue);
const rootEl = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLButtonElement | null>(null);

const resolvedSwatches = computed(() => props.swatches ?? DEFAULT_SWATCHES);

watch(() => props.modelValue, (v) => { hexDraft.value = v; });

function toggle() {
    if (props.disabled) return;
    open.value = !open.value;
}
function close() { open.value = false; }

function select(hex: string) {
    if (!isValidHex(hex)) return;
    emit('update:modelValue', hex);
    emit('change', hex);
    hexDraft.value = hex;
}

function onHexInput(e: Event) {
    let v = (e.target as HTMLInputElement).value.trim();
    if (v && !v.startsWith('#')) v = `#${v}`;
    hexDraft.value = v;
}

function commitHex() {
    if (isValidHex(hexDraft.value)) {
        select(hexDraft.value);
    } else {
        hexDraft.value = props.modelValue;
    }
}

function isValidHex(v: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(v);
}

function onDocClick(e: MouseEvent) {
    if (!open.value) return;
    if (rootEl.value && !rootEl.value.contains(e.target as Node)) close();
}

function onEsc(e: KeyboardEvent) {
    if (e.key === 'Escape' && open.value) {
        close();
        triggerEl.value?.focus();
    }
}

onMounted(() => {
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onEsc);
});

const triggerSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'h-7 px-2 text-xs';
        case 'large':  return 'h-10 px-3.5 text-base';
        case 'medium':
        default:       return 'h-9 px-3 text-sm';
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

const triggerRadiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded';
        case 'large':  return 'rounded-xl';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded-md';
    }
});

const swatchRadiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-[3px]';
        case 'large':  return 'rounded-md';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded';
    }
});

const panelRadiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded';
        case 'large':  return 'rounded-2xl';
        case 'full':   return 'rounded-2xl';
        case 'medium':
        default:       return 'rounded-lg';
    }
});

const panelPlacement = computed(() => {
    switch (props.placement) {
        case 'bottom-end':  return 'right-0 top-full';
        case 'top-start':   return 'left-0 bottom-full mb-2';
        case 'top-end':     return 'right-0 bottom-full mb-2';
        case 'bottom-start':
        default:            return 'left-0 top-full';
    }
});
</script>
