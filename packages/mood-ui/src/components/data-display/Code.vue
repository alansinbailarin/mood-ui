<template>
    <code
        :class="[
            'inline-flex items-center font-mono whitespace-nowrap align-middle',
            sizeClasses,
            variantClasses,
            radiusClasses,
        ]"
    >
        <slot />
    </code>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Code } from '../../interfaces/data-display/Code.interface';
import { useResolvedColor, useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Code>(), {
    variant: 'subtle',
    color: 'default',
});

const resolvedSize = useResolvedSize(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);
const resolvedColor = useResolvedColor(() => props.color);

const sizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[11px] px-1 py-px';
        case 'large':  return 'text-sm px-1.5 py-0.5';
        case 'medium':
        default:       return 'text-xs px-1.5 py-0.5';
    }
});

const radiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-[3px]';
        case 'large':  return 'rounded-md';
        case 'full':   return 'rounded-md';
        case 'medium':
        default:       return 'rounded';
    }
});

const variantClasses = computed(() => {
    const color = resolvedColor.value;
    const map: Record<string, Record<string, string>> = {
        default: {
            subtle:  'bg-muted text-foreground',
            outline: 'border border-border text-foreground',
            ghost:   'text-foreground',
        },
        primary: {
            subtle:  'bg-primary-subtle text-primary',
            outline: 'border border-primary/40 text-primary',
            ghost:   'text-primary',
        },
        danger: {
            subtle:  'bg-destructive-subtle text-destructive',
            outline: 'border border-destructive/40 text-destructive',
            ghost:   'text-destructive',
        },
        success: {
            subtle:  'bg-success-subtle text-success',
            outline: 'border border-success/40 text-success',
            ghost:   'text-success',
        },
        warning: {
            subtle:  'bg-warning-subtle text-warning',
            outline: 'border border-warning/40 text-warning',
            ghost:   'text-warning',
        },
    };
    return map[color]?.[props.variant] ?? map.default[props.variant];
});
</script>
