<template> 
    <!-- Modo overlay: cuando hay children, envolvemos en un wrapper relative 
         y posicionamos el chip absolute en la esquina indicada. --> 
    <span v-if="hasAnchor" class="relative inline-flex"> 
        <slot /> 
        <span 
            v-if="!invisible && !isHiddenZero" 
            :class="[chipClasses, placementClasses]" 
            :role="ariaLabel ? 'status' : undefined" 
            :aria-label="ariaLabel" 
            :aria-hidden="ariaLabel ? undefined : 'true'" 
        > 
            <template v-if="!dot"> 
                <component :is="icon" v-if="icon" aria-hidden="true" :class="iconSizeClasses" /> 
                <span>{{ displayContent }}</span> 
            </template> 
        </span> 
    </span> 
 
    <!-- Modo inline (sin anchor) → chip en flujo como pill. --> 
    <span 
        v-else-if="!invisible && !isHiddenZero" 
        :class="chipClasses" 
        :role="ariaLabel ? 'status' : undefined" 
        :aria-label="ariaLabel" 
        :aria-hidden="ariaLabel ? undefined : (dot ? 'true' : undefined)" 
    > 
        <template v-if="!dot"> 
            <component :is="icon" v-if="icon" aria-hidden="true" :class="iconSizeClasses" /> 
            <span>{{ displayContent }}</span> 
        </template> 
    </span> 
</template> 
 
<script setup lang="ts"> 
import { computed, useSlots } from 'vue'; 
import type { Chip } from '../../interfaces/feedback/Chip.interface'; 
import { useResolvedColor, useResolvedRadius, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Chip>(), { 
    variant: 'solid', 
    color: 'danger', 
    dot: false, 
    invisible: false, 
    showZero: false, 
    max: 99, 
    placement: 'top-right', 
}); 
 
const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size); 
 
const slots = useSlots(); 
const color = useResolvedColor(() => props.color); 
const radius = useResolvedRadius(() => props.radius); 
 
const hasAnchor = computed(() => !!slots.default); 
 
const isHiddenZero = computed(() => { 
    if (props.dot) return false; 
    if (props.showZero) return false; 
    return props.content === 0 || props.content === '0'; 
}); 
 
const displayContent = computed(() => { 
    if (props.content === undefined || props.content === null) return ''; 
    if (typeof props.content === 'number' && props.max && props.content > props.max) { 
        return `${props.max}+`; 
    } 
    return props.content; 
}); 
 
const variantClasses = computed(() => { 
    const map: Record<string, Record<string, string>> = { 
        default: { 
            solid: 'bg-foreground text-background', 
            outline: 'border border-border text-foreground bg-background', 
            subtle: 'bg-muted text-foreground', 
        }, 
        primary: { 
            solid: 'bg-primary text-primary-foreground', 
            outline: 'border border-primary/40 text-primary bg-background', 
            subtle: 'bg-primary-subtle text-primary', 
        }, 
        danger: { 
            solid: 'bg-destructive text-destructive-foreground', 
            outline: 'border border-destructive/40 text-destructive bg-background', 
            subtle: 'bg-destructive-subtle text-destructive', 
        }, 
        success: { 
            solid: 'bg-success text-success-foreground', 
            outline: 'border border-success/40 text-success bg-background', 
            subtle: 'bg-success-subtle text-success', 
        }, 
        warning: { 
            solid: 'bg-warning text-warning-foreground', 
            outline: 'border border-warning/40 text-warning bg-background', 
            subtle: 'bg-warning-subtle text-warning', 
        }, 
    }; 
    return map[color.value]?.[props.variant] ?? map.default.solid; 
}); 
 
const sizeClasses = computed(() => { 
    if (props.dot) { 
        switch (resolvedSize.value) { 
            case 'small': return 'w-2 h-2'; 
            case 'large': return 'w-3.5 h-3.5'; 
            default: return 'w-2.5 h-2.5'; 
        } 
    } 
    const h = sz.value.label;
    switch (resolvedSize.value) {
        case 'small': return `min-w-[16px] ${h} ${sz.value.text} px-1`;
        case 'large': return `min-w-[24px] ${h} ${sz.value.text} px-2`;
        default: return `min-w-[20px] ${h} ${sz.value.text} px-1.5`;
    }
}); 
 
const radiusClasses = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'medium': return 'rounded-md'; 
        case 'large': return 'rounded-lg'; 
        default: return 'rounded-full'; 
    } 
}); 
 
const iconSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-2.5 h-2.5'; 
        case 'large': return 'w-4 h-4'; 
        default: return 'w-3 h-3'; 
    } 
}); 
 
const placementClasses = computed(() => { 
    // Offsets para desbordar ligeramente la esquina del anchor. 
    // `pointer-events-none` por defecto: es un indicador, no interactivo. 
    const base = 'absolute z-10 pointer-events-none transform transition-transform duration-base ease-standard'; 
    switch (props.placement) { 
        case 'top-left': return `${base} top-0 left-0 -translate-x-1/2 -translate-y-1/2`; 
        case 'bottom-right': return `${base} bottom-0 right-0 translate-x-1/2 translate-y-1/2`; 
        case 'bottom-left': return `${base} bottom-0 left-0 -translate-x-1/2 translate-y-1/2`; 
        default: return `${base} top-0 right-0 translate-x-1/2 -translate-y-1/2`; 
    } 
}); 
 
const chipClasses = computed(() => { 
    const flex = props.dot 
        ? 'inline-block' 
        : 'inline-flex items-center justify-center gap-1 font-medium leading-none whitespace-nowrap'; 
    return [flex, variantClasses.value, sizeClasses.value, radiusClasses.value] 
        .filter(Boolean) 
        .join(' '); 
}); 
</script>
