<template> 
    <component 
        :is="as" 
        class="modo-canvas" 
        :class="[surfaceClasses, radiusClasses, bordered ? 'border border-border' : '']" 
        :style="canvasStyle" 
        :data-pattern="pattern" 
    > 
        <slot /> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed, type CSSProperties } from 'vue'; 
import type { Canvas } from '../../interfaces/layout/Canvas.interface'; 
import { useResolvedRadius } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Canvas>(), { 
    pattern: 'dots', 
    cellSize: 16, 
    intensity: 'subtle', 
    surface: 'card', 
    bordered: false, 
    as: 'div', 
}); 
 
const resolvedRadius = useResolvedRadius(() => props.radius); 
 
const surfaceClasses = computed(() => { 
    switch (props.surface) { 
        case 'background': return 'bg-background'; 
        case 'muted': return 'bg-muted'; 
        case 'card': 
        default: return 'bg-card'; 
    } 
}); 
 
const radiusClasses = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-md'; 
    } 
}); 
 
/** Map intensity → opacity applied to the foreground stroke. */ 
const intensityAlpha = computed(() => { 
    switch (props.intensity) { 
        case 'strong': return 0.55; 
        case 'normal': return 0.32; 
        case 'subtle': 
        default: return 0.18; 
    } 
}); 
 
const canvasStyle = computed<CSSProperties>(() => ({ 
    '--canvas-cell': `${props.cellSize}px`, 
    '--canvas-stroke-alpha': String(intensityAlpha.value), 
} as CSSProperties)); 
</script> 
 
<style scoped> 
.modo-canvas { 
    /* Foreground stroke uses the border token, alpha modulated by intensity. 
       `color-mix` keeps it light/dark/palette-aware automatically. */ 
    --canvas-stroke: color-mix( 
        in oklch, 
        var(--border) calc(var(--canvas-stroke-alpha) * 100%), 
        transparent 
    ); 
    background-color: inherit; 
} 
 
.modo-canvas[data-pattern='dots'] { 
    background-image: radial-gradient( 
        circle at 1px 1px, 
        var(--canvas-stroke) 1px, 
        transparent 0 
    ); 
    background-size: var(--canvas-cell) var(--canvas-cell); 
} 
 
.modo-canvas[data-pattern='grid'] { 
    background-image: 
        linear-gradient(to right, var(--canvas-stroke) 1px, transparent 1px), 
        linear-gradient(to bottom, var(--canvas-stroke) 1px, transparent 1px); 
    background-size: var(--canvas-cell) var(--canvas-cell); 
} 
 
.modo-canvas[data-pattern='lines'] { 
    background-image: linear-gradient( 
        to bottom, 
        var(--canvas-stroke) 1px, 
        transparent 1px 
    ); 
    background-size: 100% var(--canvas-cell); 
} 
 
.modo-canvas[data-pattern='none'] { 
    background-image: none; 
} 
 
@media print { 
    .modo-canvas { 
        background-image: none !important; 
    } 
} 
</style>
