<template> 
    <div :class="['modo-empty-state flex flex-col', alignClasses, paddingClasses, surfaceClasses, radiusClasses]" role="status"> 
        <div v-if="resolvedIcon" :class="['modo-empty-state-icon mb-3', iconWrapClasses]"> 
            <component :is="resolvedIcon" :class="iconSizeClass" aria-hidden="true" /> 
        </div> 
 
        <Typography 
            v-if="title" 
            :variant="titleVariant" 
            :size="titleSize" 
            as="h3" 
            weight="semibold" 
            :class="centered ? 'text-center' : ''" 
        > 
            {{ title }} 
        </Typography> 
 
        <Typography 
            v-if="description" 
            variant="body" 
            :size="descriptionSize" 
            color="muted" 
            as="p" 
            :class="['mt-1 max-w-prose', centered ? 'text-center' : '']" 
        > 
            {{ description }} 
        </Typography> 
 
        <div v-if="$slots.actions" :class="['modo-empty-state-actions mt-5 flex flex-wrap gap-2', centered ? 'justify-center' : '']"> 
            <slot name="actions" /> 
        </div> 
 
        <div v-if="$slots.default" :class="['modo-empty-state-content mt-4', centered ? 'text-center' : '']"> 
            <slot /> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import { InboxIcon } from '@heroicons/vue/24/outline'; 
import Typography from '../data-display/Typography.vue'; 
import type { EmptyState } from '../../interfaces/feedback/EmptyState.interface'; 
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
import type { ModoRadius } from '../../config/ModoConfig'; 
 
const props = withDefaults(defineProps<EmptyState>(), { 
    variant: 'subtle', 
    centered: true, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const resolvedRadius = useResolvedRadius(() => props.radius as ModoRadius | undefined); 
 
/* ------------------------------------------------------------------ */ 
/*  Icon (default falls back to Inbox)                                   */ 
/* ------------------------------------------------------------------ */ 
 
const resolvedIcon = computed(() => props.icon ?? InboxIcon); 
 
const iconSizeClass = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-6 h-6'; 
        case 'large': return 'w-12 h-12'; 
        case 'medium': 
        default: return 'w-9 h-9'; 
    } 
}); 
 
const iconWrapClasses = computed(() => { 
    const base = 'inline-flex items-center justify-center text-muted-foreground'; 
    if (resolvedSize.value === 'small') return [base, 'p-2 rounded-md bg-muted/60']; 
    if (resolvedSize.value === 'large') return [base, 'p-4 rounded-xl bg-muted/60']; 
    return [base, 'p-3 rounded-lg bg-muted/60']; 
}); 
 
/* ------------------------------------------------------------------ */ 
/*  Typography sizing                                                    */ 
/* ------------------------------------------------------------------ */ 
 
const titleVariant = computed(() => (resolvedSize.value === 'small' ? 'body' : 'title')); 
const titleSize = computed(() => { 
    if (resolvedSize.value === 'small') return 'medium'; 
    if (resolvedSize.value === 'large') return 'medium'; 
    return 'small'; 
}); 
const descriptionSize = computed(() => (resolvedSize.value === 'small' ? 'small' : 'medium')); 
 
/* ------------------------------------------------------------------ */ 
/*  Layout & surface                                                     */ 
/* ------------------------------------------------------------------ */ 
 
const alignClasses = computed(() => (props.centered ? 'items-center' : 'items-start')); 
 
const paddingClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'px-4 py-6'; 
        case 'large': return 'px-8 py-16'; 
        case 'medium': 
        default: return 'px-6 py-10'; 
    } 
}); 
 
const surfaceClasses = computed(() => { 
    switch (props.variant) { 
        case 'solid': return 'bg-card border border-border'; 
        case 'outline': return 'bg-transparent border border-dashed border-border'; 
        case 'subtle': 
        default: return ''; 
    } 
}); 
 
const radiusClasses = computed(() => { 
    if (props.variant === 'subtle') return ''; 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-full'; 
        case 'medium': 
        default: return 'rounded-md'; 
    } 
}); 
</script>
