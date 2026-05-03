<template> 
    <span role="status" class="modo-loader inline-flex items-center justify-center align-middle"> 
        <svg 
            class="spinner" 
            aria-hidden="true" 
            focusable="false" 
            viewBox="0 0 50 50" 
        > 
            <circle 
                class="track" 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
            /> 
            <circle 
                class="arc" 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke-linecap="round" 
            /> 
        </svg> 
        <span class="sr-only">{{ label || 'Loading' }}</span> 
    </span> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { Loader } from '../../interfaces/feedback/Loader.interface'; 
import { useResolvedSize } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Loader>(), { 
    variant: 'normal', 
    color: 'currentColor', 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const sizeValue = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return '14px'; 
        case 'medium': return '18px'; 
        case 'large': return '22px'; 
        default: return '18px'; 
    } 
}); 
 
// Stroke width scales with size so it looks balanced 
const strokeWidth = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return '5'; 
        case 'large': return '4.5'; 
        default: return '5'; 
    } 
}); 
 
// Track (background ring) opacity — only visible on 'outline' variant 
const trackOpacity = computed(() => (props.variant === 'outline' ? '0.2' : '0')); 
</script> 
 
<style scoped> 
  .modo-loader { 
      /* Reserve a square box so surrounding layout never reflows as the 
         spinner rotates. */ 
      width: v-bind(sizeValue); 
      height: v-bind(sizeValue); 
      flex-shrink: 0; 
  } 
 
  .spinner { 
      width: 100%; 
      height: 100%; 
      /* GPU layer + steady transform origin eliminate subpixel jitter when 
         rotated inside small containers (like buttons). */ 
      transform: translateZ(0); 
      transform-origin: 50% 50%; 
      backface-visibility: hidden; 
      animation: modo-loader-rotate 0.9s linear infinite; 
      will-change: transform; 
  } 
 
  .track { 
      stroke: v-bind(color); 
      stroke-width: v-bind(strokeWidth); 
      opacity: v-bind(trackOpacity); 
  } 
 
  .arc { 
      stroke: v-bind(color); 
      stroke-width: v-bind(strokeWidth); 
      /* Fixed dash — ~25% of the circle. No dash animation = no jitter. */ 
      stroke-dasharray: 31.4 125.6; 
      stroke-dashoffset: 0; 
  } 
 
  @keyframes modo-loader-rotate { 
      from { transform: translateZ(0) rotate(0deg); } 
      to   { transform: translateZ(0) rotate(360deg); } 
  } 
 
  @media (prefers-reduced-motion: reduce) { 
      .spinner { 
          animation-duration: 2.5s; 
      } 
  } 
</style>
