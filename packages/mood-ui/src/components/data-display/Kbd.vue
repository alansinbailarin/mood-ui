<template>
    <kbd
        :class="[
            'inline-flex items-center justify-center font-mono font-semibold whitespace-nowrap leading-none select-none align-middle',
            sizeClasses,
            variantClasses,
            radiusClasses,
        ]"
    >
        <slot />
    </kbd>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Kbd } from '../../interfaces/data-display/Kbd.interface';
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Kbd>(), {
    variant: 'subtle',
});

const resolvedSize = useResolvedSize(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);

const sizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[10px] px-1 py-0.5 min-w-[1.25rem] h-4';
        case 'large':  return 'text-sm px-2 py-1 min-w-[1.75rem] h-7';
        case 'medium':
        default:       return 'text-xs px-1.5 py-0.5 min-w-[1.5rem] h-5';
    }
});

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'outline': return 'border border-border bg-transparent text-foreground';
        case 'solid':   return 'bg-foreground text-background';
        case 'subtle':
        default:        return 'border border-border bg-muted text-muted-foreground';
    }
});

const radiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-[3px]';
        case 'large':  return 'rounded-md';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded';
    }
});
</script>
