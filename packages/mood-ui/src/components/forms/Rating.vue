<template>
    <div
        :role="readonly ? 'img' : 'slider'"
        :aria-label="ariaLabel ?? 'Rating'"
        :aria-valuenow="modelValue"
        :aria-valuemin="0"
        :aria-valuemax="max"
        :tabindex="readonly || disabled ? -1 : 0"
        :class="[
            'inline-flex items-center gap-1 select-none',
            disabled ? 'opacity-50 pointer-events-none' : '',
            readonly ? '' : 'cursor-pointer',
        ]"
        @keydown="onKeydown"
    >
        <span
            v-for="i in max"
            :key="i"
            :class="['relative inline-flex', sizeClasses]"
            @mouseenter="onHover(i)"
            @mouseleave="onLeave"
            @click="onClick($event, i)"
        >
            <!-- Empty (background) star -->
            <StarOutlineIcon :class="['shrink-0 text-muted-foreground/40', sizeClasses]" />
            <!-- Filled overlay clipped to the value width -->
            <span
                class="absolute inset-0 overflow-hidden pointer-events-none"
                :style="{ width: fillWidth(i) }"
            >
                <StarSolidIcon :class="['shrink-0', sizeClasses, fillColor]" />
            </span>
            <!-- Half hit-zones (only when allowHalf and not readonly) -->
            <template v-if="allowHalf && !readonly && !disabled">
                <span
                    class="absolute inset-y-0 left-0 w-1/2"
                    @mouseenter.stop="onHover(i - 0.5)"
                    @click.stop="onClick($event, i - 0.5)"
                />
                <span
                    class="absolute inset-y-0 right-0 w-1/2"
                    @mouseenter.stop="onHover(i)"
                    @click.stop="onClick($event, i)"
                />
            </template>
        </span>
        <span v-if="showValue" :class="['ml-2 font-mono text-muted-foreground', valueSizeClass]">
            {{ formatValue(displayValue) }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/vue/24/outline';
import type { Rating } from '../../interfaces/forms/Rating.interface';
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Rating>(), {
    modelValue: 0,
    max: 5,
    allowHalf: false,
    readonly: false,
    disabled: false,
    clearable: true,
    color: 'warning',
    showValue: false,
});

const emit = defineEmits<{
    'update:modelValue': [v: number];
    'change': [v: number];
}>();

const resolvedSize = useResolvedSize(() => props.size);
const resolvedColor = useResolvedColor(() => props.color);
const hoverValue = ref<number | null>(null);

const displayValue = computed(() => hoverValue.value ?? props.modelValue);

function fillWidth(i: number): string {
    const v = displayValue.value;
    if (v >= i) return '100%';
    if (v >= i - 0.5) return '50%';
    return '0%';
}

function onHover(v: number) {
    if (props.readonly || props.disabled) return;
    hoverValue.value = v;
}

function onLeave() {
    hoverValue.value = null;
}

function onClick(_e: MouseEvent, v: number) {
    if (props.readonly || props.disabled) return;
    let next = v;
    if (props.clearable && next === props.modelValue) next = 0;
    emit('update:modelValue', next);
    emit('change', next);
}

function onKeydown(e: KeyboardEvent) {
    if (props.readonly || props.disabled) return;
    const step = props.allowHalf ? 0.5 : 1;
    let next = props.modelValue;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        next = Math.min(props.max, props.modelValue + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        next = Math.max(0, props.modelValue - step);
    } else if (e.key === 'Home') {
        next = 0;
    } else if (e.key === 'End') {
        next = props.max;
    } else {
        return;
    }
    e.preventDefault();
    emit('update:modelValue', next);
    emit('change', next);
}

function formatValue(v: number): string {
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

const sizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-4 h-4';
        case 'large':  return 'w-7 h-7';
        case 'medium':
        default:       return 'w-5 h-5';
    }
});

const valueSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-xs';
        case 'large':  return 'text-base';
        case 'medium':
        default:       return 'text-sm';
    }
});

const fillColor = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'text-primary';
        case 'danger':  return 'text-destructive';
        case 'success': return 'text-success';
        case 'warning': return 'text-warning';
        case 'default':
        default:        return 'text-foreground';
    }
});
</script>
