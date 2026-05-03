<template>
    <div
        role="radiogroup"
        :aria-label="ariaLabel"
        :aria-disabled="disabled || undefined"
        :class="[
            'relative inline-flex items-center p-1 bg-muted gap-0.5',
            radiusClasses,
            fullWidth ? 'w-full' : '',
            disabled ? 'opacity-60 pointer-events-none' : '',
        ]"
    >
        <button
            v-for="item in items"
            :key="item.value"
            type="button"
            role="radio"
            :aria-checked="isActive(item) ? 'true' : 'false'"
            :aria-label="item.ariaLabel ?? item.label"
            :aria-disabled="item.disabled || undefined"
            :disabled="item.disabled || disabled"
            :tabindex="isActive(item) ? 0 : -1"
            :class="[
                'relative inline-flex items-center justify-center gap-1.5 font-medium select-none whitespace-nowrap',
                'transition-colors duration-150 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-muted',
                focusRingClass,
                sizeClasses,
                innerRadiusClasses,
                fullWidth ? 'flex-1' : '',
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                isActive(item)
                    ? activeClasses
                    : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="onSelect(item)"
            @keydown="onKeydown($event, item)"
        >
            <component :is="item.icon" v-if="item.icon" :class="iconSizeClasses" aria-hidden="true" />
            <span v-if="item.label">{{ item.label }}</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Segmented, SegmentedItem } from '../../interfaces/forms/Segmented.interface';
import { useResolvedColor, useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Segmented>(), {
    color: 'primary',
    fullWidth: false,
    disabled: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: string | number];
    'change': [value: string | number];
}>();

const resolvedSize = useResolvedSize(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);
const resolvedColor = useResolvedColor(() => props.color);

function isActive(item: SegmentedItem): boolean {
    return props.modelValue === item.value;
}

function onSelect(item: SegmentedItem) {
    if (item.disabled || props.disabled) return;
    if (isActive(item)) return;
    emit('update:modelValue', item.value);
    emit('change', item.value);
}

function onKeydown(e: KeyboardEvent, item: SegmentedItem) {
    if (props.disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveFocus(item, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveFocus(item, -1);
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onSelect(item);
    }
}

function moveFocus(current: SegmentedItem, dir: 1 | -1) {
    const enabled = props.items.filter((i) => !i.disabled);
    if (enabled.length === 0) return;
    const idx = enabled.findIndex((i) => i.value === current.value);
    const next = enabled[(idx + dir + enabled.length) % enabled.length];
    if (next) onSelect(next);
}

const sizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'h-7 px-2.5 text-xs';
        case 'large':  return 'h-10 px-4 text-base';
        case 'medium':
        default:       return 'h-8 px-3 text-sm';
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

const radiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded';
        case 'large':  return 'rounded-xl';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded-lg';
    }
});

const innerRadiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-[3px]';
        case 'large':  return 'rounded-lg';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded-md';
    }
});

const activeClasses = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'bg-card text-primary shadow-sm';
        case 'danger':  return 'bg-card text-destructive shadow-sm';
        case 'success': return 'bg-card text-success shadow-sm';
        case 'warning': return 'bg-card text-warning shadow-sm';
        case 'default':
        default:        return 'bg-card text-foreground shadow-sm';
    }
});

const focusRingClass = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'focus-visible:ring-primary';
        case 'danger':  return 'focus-visible:ring-destructive';
        case 'success': return 'focus-visible:ring-success';
        case 'warning': return 'focus-visible:ring-warning';
        case 'default':
        default:        return 'focus-visible:ring-foreground/30';
    }
});
</script>
