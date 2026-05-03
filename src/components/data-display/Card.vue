<template> 
    <component 
        :is="clickable ? 'button' : 'div'" 
        :class="[baseClasses, variantClasses, radiusClasses, hoverable ? hoverClasses : '', clickable ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring text-left w-full' : '']" 
        :tabindex="clickable ? 0 : undefined" 
    > 
        <div v-if="$slots.header" :class="[divided ? 'border-b border-inherit' : '', paddingClasses]"> 
            <slot name="header" /> 
        </div> 
 
        <div v-if="$slots.image"> 
            <slot name="image" /> 
        </div> 
 
        <div :class="paddingClasses"> 
            <slot /> 
        </div> 
 
        <div v-if="$slots.footer" :class="[divided ? 'border-t border-inherit' : '', paddingClasses]"> 
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
 
const baseClasses = 'block overflow-hidden transition-all duration-200 border-border text-card-foreground'; 
 
const variantClasses = computed(() => { 
    switch (props.variant) { 
        case 'outlined': 
            return 'border bg-card'; 
        case 'filled': 
            return 'bg-muted'; 
        default: 
            return 'bg-card border shadow-sm'; 
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
            return 'hover:border-border/70 hover:shadow-md'; 
        case 'filled': 
            return 'hover:bg-muted/80'; 
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
