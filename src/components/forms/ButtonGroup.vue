<template> 
    <div  
        role="group" 
        :class="[ 
            'inline-flex', 
            radiusClasses, 
            orientation === 'vertical' ? 'flex-col' : 'flex-row', 
            orientation === 'vertical' ? 'button-group-vertical' : 'button-group-horizontal', 
            haloClasses, 
        ]" 
    > 
        <slot /> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, provide, reactive, watchEffect } from 'vue'; 
import type { ButtonGroup } from '../../interfaces/forms/ButtonGroup.interface'; 
import { useResolvedColor, useResolvedHalo, useResolvedRadius } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<ButtonGroup>(), { 
    orientation: 'horizontal', 
}); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
const resolvedHalo = useResolvedHalo(); 
 
const groupCtx = reactive<{ 
    variant?: ButtonGroup['variant']; 
    color?: ButtonGroup['color']; 
    size?: ButtonGroup['size']; 
    radius?: ButtonGroup['radius']; 
    disabled?: ButtonGroup['disabled']; 
    gradient?: ButtonGroup['gradient']; 
}>({}); 
 
watchEffect(() => { 
    groupCtx.variant = props.variant; 
    groupCtx.color = resolvedColor.value; 
    groupCtx.size = props.size; 
    // Push the *resolved* radius (after provider cascade) so children 
    // collapse their outer corners to match the group instead of the 
    // global provider default. 
    groupCtx.radius = resolvedRadius.value; 
    groupCtx.disabled = props.disabled; 
    groupCtx.gradient = props.gradient; 
}); 
 
provide('buttonGroup', groupCtx); 
 
// Radius del group (se aplica al wrapper y recorta los bordes de los hijos). 
const radiusClasses = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-lg'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-md'; 
    } 
}); 
 
// Halo alrededor del group (solo variante rellena "normal" o default). 
const haloClasses = computed(() => { 
    const variant = props.variant ?? 'normal'; 
    if (variant !== 'normal') return ''; 
 
    const haloMode = resolvedHalo.value; 
    const transition = 'transition-[--tw-ring-color] duration-base ease-standard'; 
 
    // 'off' (default): sin ring idle. Aparece solo en hover/focus-within, neutro. 
    if (haloMode === 'off') { 
        return `hover:ring-[3px] hover:ring-foreground/12 focus-within:ring-[3px] focus-within:ring-foreground/20 ${transition}`; 
    } 
 
    // 'neutral': idle + hover/focus siempre gris. 
    if (haloMode === 'neutral') { 
        return `ring-[3px] ring-foreground/10 hover:ring-foreground/15 focus-within:ring-foreground/25 ${transition}`; 
    } 
 
    // 'tinted' (legacy): tintado al color. 
    const map: Record<string, string> = { 
        default: 'ring-[3px] ring-foreground/10 hover:ring-foreground/15 focus-within:ring-foreground/25', 
        primary: 'ring-[3px] ring-primary/15 hover:ring-primary/25 focus-within:ring-primary/35', 
        danger: 'ring-[3px] ring-destructive/15 hover:ring-destructive/25 focus-within:ring-destructive/35', 
        success: 'ring-[3px] ring-success/15 hover:ring-success/25 focus-within:ring-success/35', 
        warning: 'ring-[3px] ring-warning/15 hover:ring-warning/25 focus-within:ring-warning/35', 
    }; 
    return `${map[resolvedColor.value] ?? map.default} ${transition}`; 
}); 
</script> 
 
<style scoped> 
.button-group-horizontal :deep(> :not(:first-child):not(:last-child)) { 
    border-radius: 0; 
} 
.button-group-horizontal :deep(> :first-child) { 
    border-top-right-radius: 0; 
    border-bottom-right-radius: 0; 
} 
.button-group-horizontal :deep(> :last-child) { 
    border-top-left-radius: 0; 
    border-bottom-left-radius: 0; 
} 
.button-group-horizontal :deep(> :not(:first-child)) { 
    border-left-width: 0; 
} 
 
.button-group-vertical :deep(> :not(:first-child):not(:last-child)) { 
    border-radius: 0; 
} 
.button-group-vertical :deep(> :first-child) { 
    border-bottom-left-radius: 0; 
    border-bottom-right-radius: 0; 
} 
.button-group-vertical :deep(> :last-child) { 
    border-top-left-radius: 0; 
    border-top-right-radius: 0; 
} 
.button-group-vertical :deep(> :not(:first-child)) { 
    border-top-width: 0; 
} 
 
:deep(> :hover), 
:deep(> :focus-visible) { 
    z-index: 1; 
    position: relative; 
} 
</style>
