<template> 
    <!-- Vertical: simple line --> 
    <span 
        v-if="orientation === 'vertical'" 
        :role="decorative ? undefined : 'separator'" 
        :aria-orientation="decorative ? undefined : 'vertical'" 
        :class="['modo-divider self-stretch inline-block', verticalClasses]" 
    /> 
 
    <!-- Horizontal without label --> 
    <hr 
        v-else-if="!hasLabel" 
        :role="decorative ? 'presentation' : 'separator'" 
        :aria-orientation="decorative ? undefined : 'horizontal'" 
        :class="['modo-divider w-full border-0', horizontalLineClasses, horizontalSpacingClasses]" 
    /> 
 
    <!-- Horizontal with label/slot --> 
    <div 
        v-else 
        :role="decorative ? undefined : 'separator'" 
        :aria-orientation="decorative ? undefined : 'horizontal'" 
        :class="['modo-divider flex items-center gap-3 w-full', horizontalSpacingClasses]" 
    > 
        <span 
            aria-hidden="true" 
            :class="['modo-divider-line flex-1', horizontalLineClasses]" 
            :style="leadingFlexStyle" 
        /> 
        <span :class="['modo-divider-label inline-flex items-center gap-1.5 text-caption', labelColorClass]"> 
            <component v-if="icon" :is="icon" class="w-3.5 h-3.5" aria-hidden="true" /> 
            <slot>{{ label }}</slot> 
        </span> 
        <span 
            aria-hidden="true" 
            :class="['modo-divider-line flex-1', horizontalLineClasses]" 
            :style="trailingFlexStyle" 
        /> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, useSlots } from 'vue'; 
import type { Divider } from '../../interfaces/layout/Divider.interface'; 
 
const props = withDefaults(defineProps<Divider>(), { 
    orientation: 'horizontal', 
    variant: 'solid', 
    emphasis: 'default', 
    spacing: 'medium', 
    labelAlign: 'center', 
    decorative: false, 
}); 
 
const slots = useSlots(); 
const hasLabel = computed(() => !!props.label || !!slots.default); 
 
/* ------------------------------------------------------------------ */ 
/*  Color via emphasis                                                   */ 
/* ------------------------------------------------------------------ */ 
 
const borderColorClass = computed(() => { 
    switch (props.emphasis) { 
        case 'subtle': return 'border-border/50'; 
        case 'strong': return 'border-foreground/40'; 
        case 'default': 
        default: return 'border-border'; 
    } 
}); 
 
const labelColorClass = computed(() => 
    props.emphasis === 'strong' ? 'text-foreground' : 'text-muted-foreground', 
); 
 
/* ------------------------------------------------------------------ */ 
/*  Variant (solid/dashed/dotted)                                        */ 
/* ------------------------------------------------------------------ */ 
 
const variantClass = computed(() => { 
    switch (props.variant) { 
        case 'dashed': return 'border-dashed'; 
        case 'dotted': return 'border-dotted'; 
        case 'solid': 
        default: return 'border-solid'; 
    } 
}); 
 
/* ------------------------------------------------------------------ */ 
/*  Horizontal classes                                                   */ 
/* ------------------------------------------------------------------ */ 
 
const horizontalLineClasses = computed(() => [ 
    'border-t', 
    variantClass.value, 
    borderColorClass.value, 
]); 
 
const horizontalSpacingClasses = computed(() => { 
    switch (props.spacing) { 
        case 'none': return 'my-0'; 
        case 'small': return 'my-2'; 
        case 'large': return 'my-6'; 
        case 'medium': 
        default: return 'my-4'; 
    } 
}); 
 
/* ------------------------------------------------------------------ */ 
/*  Vertical classes                                                     */ 
/* ------------------------------------------------------------------ */ 
 
const verticalClasses = computed(() => { 
    const spacing = (() => { 
        switch (props.spacing) { 
            case 'none': return 'mx-0'; 
            case 'small': return 'mx-2'; 
            case 'large': return 'mx-6'; 
            case 'medium': 
            default: return 'mx-4'; 
        } 
    })(); 
    return ['border-l', variantClass.value, borderColorClass.value, spacing, 'min-h-[1em]']; 
}); 
 
/* ------------------------------------------------------------------ */ 
/*  Label alignment via flex-grow weights                                */ 
/* ------------------------------------------------------------------ */ 
 
const leadingFlexStyle = computed(() => { 
    if (props.labelAlign === 'start') return { flex: '0 0 16px' }; 
    if (props.labelAlign === 'end') return { flex: '1 1 0' }; 
    return { flex: '1 1 0' }; 
}); 
const trailingFlexStyle = computed(() => { 
    if (props.labelAlign === 'end') return { flex: '0 0 16px' }; 
    return { flex: '1 1 0' }; 
}); 
</script>
