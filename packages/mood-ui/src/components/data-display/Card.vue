<template> 
    <component 
        :is="clickable ? 'button' : 'div'" 
        :type="clickable ? 'button' : undefined"
        :class="[
            baseClasses,
            variantClasses,
            radiusClasses,
            hoverable ? hoverClasses : '',
            clickable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 text-left w-full' : '',
        ]" 
    > 
        <div v-if="$slots.header" :class="[divided ? 'border-b border-border' : '', paddingClasses]"> 
            <slot name="header" /> 
        </div> 
 
        <div v-if="$slots.image"> 
            <slot name="image" /> 
        </div> 
 
        <div :class="paddingClasses"> 
            <slot /> 
        </div> 
 
        <div v-if="$slots.footer" :class="[divided ? 'border-t border-border' : '', paddingClasses]"> 
            <slot name="footer" /> 
        </div> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { Card } from '../../interfaces/data-display/Card.interface'; 
import { useResolvedRadius } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Card>(), { 
    variant: 'outlined', 
    padding: 'medium', 
    hoverable: false, 
    clickable: false, 
    divided: true, 
}); 
 
const radius = useResolvedRadius(() => props.radius); 
 
const baseClasses = 'block overflow-hidden transition-all duration-200 text-foreground'; 
 
const variantClasses = computed(() => { 
    switch (props.variant) { 
        case 'outlined': 
            return 'border border-border bg-transparent'; 
        case 'filled': 
            return 'modo-card--filled border border-transparent text-card-foreground'; 
        default: 
            return 'border border-border bg-card text-card-foreground shadow-sm'; 
    } 
}); 
 
const radiusClasses = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-3xl'; 
        default: return 'rounded-lg'; 
    } 
}); 
 
const hoverClasses = computed(() => { 
    switch (props.variant) { 
        case 'outlined': 
            return 'hover:border-foreground/25 hover:bg-muted/30'; 
        case 'filled': 
            return 'modo-card--filled-hover'; 
        default: 
            return 'hover:shadow-lg'; 
    } 
}); 
 
const paddingClasses = computed(() => { 
    switch (props.padding) { 
        case 'none': return ''; 
        case 'small': return 'p-3'; 
        case 'large': return 'p-8'; 
        default: return 'p-5'; 
    } 
}); 
</script>

<style scoped>
@layer base {
    /* Subtle surface fill: uses exact `--card` surface in dark mode (what `outlined`
     * used previously) and a soft `--muted`/`--card` blend in light mode where `--card`
     * is pure white, while remaining overridable by consumer utility classes. */
    .modo-card--filled {
        background-color: light-dark(
            color-mix(in oklab, var(--muted) 65%, var(--card) 35%),
            var(--card)
        );
    }

    .modo-card--filled.modo-card--filled-hover:hover {
        background-color: light-dark(
            var(--muted),
            color-mix(in oklab, var(--card) 68%, var(--muted) 32%)
        );
    }
}
</style>
