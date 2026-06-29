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
import { useResolvedRadius, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Kbd>(), {
    variant: 'subtle',
});

const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);

const sizeClasses = computed(() => {
    const h = sz.value.label;
    switch (resolvedSize.value) {
        case 'small':  return `${sz.value.text} px-1 min-w-[1.25rem] ${h}`;
        case 'large':  return `${sz.value.text} px-2 min-w-[1.75rem] ${h}`;
        case 'medium':
        default:       return `${sz.value.text} px-1.5 min-w-[1.5rem] ${h}`;
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
