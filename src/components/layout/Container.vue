<template> 
    <component  
        :is="as"  
        :class="[maxWidthClasses, heightClasses, centered ? 'mx-auto' : '', centerContent ? 'flex items-center justify-center' : '', paddingClasses]" 
    > 
        <slot /> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { Container } from '../../interfaces/layout/Container.interface'; 
 
const props = withDefaults(defineProps<Container>(), { 
    as: 'div', 
    maxWidth: 'xl', 
    height: 'auto', 
    centered: true, 
    centerContent: false, 
    padding: 'medium', 
}); 
 
const maxWidthClasses = computed(() => { 
    switch (props.maxWidth) { 
        case 'sm': return 'max-w-screen-sm'; 
        case 'md': return 'max-w-screen-md'; 
        case 'lg': return 'max-w-screen-lg'; 
        case 'xl': return 'max-w-screen-xl'; 
        case '2xl': return 'max-w-screen-2xl'; 
        case 'full': return 'w-full'; 
        case 'none': return ''; 
        default: return 'max-w-screen-xl'; 
    } 
}); 
 
const heightClasses = computed(() => { 
    switch (props.height) { 
        case 'screen': return 'h-dvh'; 
        case 'fill': return 'flex-1'; 
        case 'full': return 'h-full'; 
        default: return ''; 
    } 
}); 
 
const paddingClasses = computed(() => { 
    switch (props.padding) { 
        case 'none': return ''; 
        case 'small': return 'p-4'; 
        case 'large': return 'p-8'; 
        default: return 'p-5'; 
    } 
}); 
</script>
