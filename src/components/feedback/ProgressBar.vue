<template> 
    <div class="modo-progress flex flex-col gap-1.5 w-full"> 
        <div v-if="label || showValue" class="flex items-center justify-between text-caption"> 
            <span v-if="label" class="text-foreground font-medium truncate">{{ label }}</span> 
            <span v-else /> 
            <span v-if="showValue && !indeterminate" class="text-muted-foreground tabular-nums">{{ percentDisplay }}%</span> 
        </div> 
 
        <div 
            :class="['modo-progress-track relative overflow-hidden bg-muted', trackHeightClass, roundedClass]" 
            role="progressbar" 
            :aria-label="label ?? ariaLabel" 
            :aria-valuemin="indeterminate ? undefined : min" 
            :aria-valuemax="indeterminate ? undefined : max" 
            :aria-valuenow="indeterminate ? undefined : clampedValue" 
            :aria-valuetext="indeterminate ? 'Loading' : `${percentDisplay}%`" 
        > 
            <!-- Determinate fill --> 
            <div 
                v-if="!indeterminate" 
                :class="['modo-progress-fill h-full transition-[width] duration-base ease-decelerate', fillColorClass, roundedClass, striped ? 'modo-progress-striped' : '']" 
                :style="{ width: `${percent}%` }" 
            /> 
            <!-- Indeterminate slider --> 
            <div 
                v-else 
                :class="['modo-progress-indeterminate absolute inset-y-0 w-1/3', fillColorClass, roundedClass]" 
            /> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { ProgressBar } from '../../interfaces/feedback/ProgressBar.interface'; 
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<ProgressBar>(), { 
    min: 0, 
    max: 100, 
    color: 'primary', 
    showValue: false, 
    striped: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
// ProgressBar defaults to a pill (full) when no radius is set anywhere — this 
// preserves the previous look for consumers that don't override the prop. 
const resolvedRadius = useResolvedRadius(() => props.radius ?? 'full'); 
 
const indeterminate = computed(() => props.value === undefined || props.value === null); 
 
const clampedValue = computed(() => { 
    const v = props.value ?? 0; 
    return Math.min(props.max, Math.max(props.min, v)); 
}); 
 
const percent = computed(() => { 
    const range = props.max - props.min; 
    if (range <= 0) return 0; 
    return ((clampedValue.value - props.min) / range) * 100; 
}); 
 
const percentDisplay = computed(() => Math.round(percent.value)); 
 
/* ------------------------------------------------------------------ */ 
/*  Visual classes                                                       */ 
/* ------------------------------------------------------------------ */ 
 
const trackHeightClass = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'h-1'; 
        case 'large': return 'h-3'; 
        case 'medium': 
        default: return 'h-2'; 
    } 
}); 
 
const roundedClass = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none':   return 'rounded-none'; 
        case 'small':  return 'rounded-sm'; 
        case 'medium': return 'rounded-md'; 
        case 'large':  return 'rounded-lg'; 
        case 'full': 
        default:       return 'rounded-full'; 
    } 
}); 
 
const fillColorClass = computed(() => { 
    switch (props.color) { 
        case 'success': return 'bg-success'; 
        case 'warning': return 'bg-warning'; 
        case 'danger': return 'bg-destructive'; 
        case 'default': return 'bg-foreground'; 
        case 'primary': 
        default: return 'bg-primary'; 
    } 
}); 
</script> 
 
<style scoped> 
.modo-progress-striped { 
    background-image: linear-gradient( 
        45deg, 
        rgba(255, 255, 255, 0.18) 25%, 
        transparent 25%, 
        transparent 50%, 
        rgba(255, 255, 255, 0.18) 50%, 
        rgba(255, 255, 255, 0.18) 75%, 
        transparent 75%, 
        transparent 
    ); 
    background-size: 1rem 1rem; 
    animation: modo-progress-stripes 1s linear infinite; 
} 
 
.modo-progress-indeterminate { 
    animation: modo-progress-indeterminate 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
} 
 
@keyframes modo-progress-stripes { 
    from { background-position: 0 0; } 
    to   { background-position: 1rem 0; } 
} 
 
@keyframes modo-progress-indeterminate { 
    0%   { left: -33%; } 
    100% { left: 100%; } 
} 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-progress-striped { animation: none; } 
    .modo-progress-indeterminate { 
        animation: none; 
        left: 0; 
        width: 100%; 
        opacity: 0.5; 
    } 
} 
</style>
