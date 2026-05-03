<template> 
    <span :class="[baseClasses, variantClasses, sizeClasses, radiusClasses]"> 
        <span v-if="dot" :class="['rounded-full', dotSizeClasses, dotColorClasses]" /> 
        <component :is="icon" v-if="icon && !dot" :class="iconSizeClasses" /> 
        <slot>{{ label }}</slot> 
        <button  
            v-if="removable"  
            type="button"  
            @click="$emit('remove')"  
            :class="['ml-1 inline-flex items-center justify-center rounded-full cursor-pointer hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1', removeSizeClasses]" 
            :aria-label="removeAriaLabel ?? loc.badge.remove" 
        > 
            <svg :class="removeIconClasses" viewBox="0 0 20 20" fill="currentColor"> 
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /> 
            </svg> 
        </button> 
    </span> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { Badge } from '../../interfaces/feedback/Badge.interface'; 
import { useResolvedColor, useResolvedRadius, useModoLocale, useResolvedSize } from '../../composables/useModoConfig'; 
 
const loc = useModoLocale(); 
 
defineEmits<{ 
    remove: []; 
}>(); 
 
const props = withDefaults(defineProps<Badge>(), { 
    variant: 'subtle', 
    color: 'default', 
    gradient: false, 
    removable: false, 
    dot: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const color = useResolvedColor(() => props.color); 
const radius = useResolvedRadius(() => props.radius); 
 
const baseClasses = 'inline-flex items-center gap-1.5 font-medium transition-colors'; 
 
const variantClasses = computed(() => { 
    const isGradient = props.gradient; 
    const map: Record<string, Record<string, string>> = { 
        default: { 
            solid: isGradient 
                ? 'bg-gradient-to-r from-foreground to-foreground/80 text-background' 
                : 'bg-foreground text-background', 
            outline: 'border border-border text-foreground', 
            subtle: 'bg-muted text-foreground', 
        }, 
        primary: { 
            solid: isGradient 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground' 
                : 'bg-primary text-primary-foreground', 
            outline: 'border border-primary/40 text-primary', 
            subtle: 'bg-primary-subtle text-primary', 
        }, 
        danger: { 
            solid: isGradient 
                ? 'bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground' 
                : 'bg-destructive text-destructive-foreground', 
            outline: 'border border-destructive/40 text-destructive', 
            subtle: 'bg-destructive-subtle text-destructive', 
        }, 
        success: { 
            solid: isGradient 
                ? 'bg-gradient-to-r from-success to-success/80 text-success-foreground' 
                : 'bg-success text-success-foreground', 
            outline: 'border border-success/40 text-success', 
            subtle: 'bg-success-subtle text-success', 
        }, 
        warning: { 
            solid: isGradient 
                ? 'bg-gradient-to-r from-warning to-warning/80 text-warning-foreground' 
                : 'bg-warning text-warning-foreground', 
            outline: 'border border-warning/40 text-warning', 
            subtle: 'bg-warning-subtle text-warning', 
        }, 
    }; 
    return map[color.value]?.[props.variant] ?? map.default.subtle; 
}); 
 
const sizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'text-[10px] px-2 py-0.5'; 
        case 'large': return 'text-sm px-3 py-1'; 
        default: return 'text-xs px-2.5 py-0.5'; 
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
        case 'small': return 'w-3 h-3'; 
        case 'large': return 'w-4 h-4'; 
        default: return 'w-3.5 h-3.5'; 
    } 
}); 
 
const dotSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-1.5 h-1.5'; 
        case 'large': return 'w-2.5 h-2.5'; 
        default: return 'w-2 h-2'; 
    } 
}); 
 
const dotColorClasses = computed(() => { 
    switch (color.value) { 
        case 'primary': return 'bg-primary'; 
        case 'danger': return 'bg-destructive'; 
        case 'success': return 'bg-success'; 
        case 'warning': return 'bg-warning'; 
        default: return 'bg-muted-foreground'; 
    } 
}); 
 
const removeSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-3 h-3'; 
        case 'large': return 'w-4.5 h-4.5'; 
        default: return 'w-3.5 h-3.5'; 
    } 
}); 
 
const removeIconClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-2.5 h-2.5'; 
        case 'large': return 'w-3.5 h-3.5'; 
        default: return 'w-3 h-3'; 
    } 
}); 
</script>
