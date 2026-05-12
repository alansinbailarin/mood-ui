<template> 
    <component 
        :is="tag" 
        :class="[variantClasses, weightClasses, alignClasses, colorClasses, truncate ? 'truncate' : '', italic ? 'italic' : '', underline ? 'underline' : '', strikethrough ? 'line-through' : '']" 
    > 
        <slot /> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import type { Typography } from '../../interfaces/data-display/Typography.interface'; 
import { useResolvedSize } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Typography>(), { 
    variant: 'body', 
    color: 'default', 
    truncate: false, 
    italic: false, 
    underline: false, 
    strikethrough: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const defaultTagMap: Record<string, Record<string, string>> = { 
    display:  { small: 'h1', medium: 'h1', large: 'h1' }, 
    heading:  { small: 'h3', medium: 'h2', large: 'h1' }, 
    title:    { small: 'h5', medium: 'h4', large: 'h3' }, 
    subtitle: { small: 'h6', medium: 'h6', large: 'h5' }, 
    body:     { small: 'p',  medium: 'p',  large: 'p' }, 
    caption:  { small: 'small', medium: 'small', large: 'small' }, 
    overline: { small: 'span', medium: 'span', large: 'span' }, 
}; 
 
const tag = computed(() => props.as ?? defaultTagMap[props.variant]?.[resolvedSize.value] ?? 'p'); 
 
const hasCustomColor = computed(() => props.color !== 'default'); 
 
const variantClasses = computed(() => { 
    const styles: Record<string, Record<string, string>> = { 
        display: { 
            small: 'text-4xl tracking-tight', 
            medium: 'text-5xl tracking-tight', 
            large: 'text-6xl tracking-tight', 
        }, 
        heading: { 
            small: 'text-xl', 
            medium: 'text-2xl tracking-tight', 
            large: 'text-3xl tracking-tight', 
        }, 
        title: { 
            small: 'text-base', 
            medium: 'text-lg', 
            large: 'text-xl', 
        }, 
        subtitle: { 
            small: 'text-xs', 
            medium: 'text-sm', 
            large: 'text-base', 
        }, 
        body: { 
            small: 'text-sm leading-relaxed', 
            medium: 'text-base leading-relaxed', 
            large: 'text-lg leading-relaxed', 
        }, 
        caption: { 
            small: 'text-[10px]', 
            medium: 'text-xs', 
            large: 'text-sm', 
        }, 
        overline: { 
            small: 'text-[10px] uppercase tracking-widest', 
            medium: 'text-xs uppercase tracking-widest', 
            large: 'text-sm uppercase tracking-widest', 
        }, 
    }; 
    return styles[props.variant]?.[resolvedSize.value] ?? styles.body.medium; 
}); 
 
const defaultWeightMap: Record<string, string> = { 
    display: 'font-extrabold', 
    heading: 'font-bold', 
    title: 'font-semibold', 
    subtitle: 'font-medium', 
    body: 'font-normal', 
    caption: 'font-normal', 
    overline: 'font-semibold', 
}; 
 
const defaultColorMap: Record<string, string> = { 
    display: 'text-foreground', 
    heading: 'text-foreground', 
    title: 'text-foreground', 
    subtitle: 'text-muted-foreground', 
    body: 'text-foreground', 
    caption: 'text-muted-foreground', 
    overline: 'text-muted-foreground', 
}; 
 
const weightClasses = computed(() => { 
    if (props.weight) { 
        const map: Record<string, string> = { 
            light: 'font-light', 
            normal: 'font-normal', 
            medium: 'font-medium', 
            semibold: 'font-semibold', 
            bold: 'font-bold', 
            extrabold: 'font-extrabold', 
        }; 
        return map[props.weight] ?? ''; 
    } 
    return defaultWeightMap[props.variant] ?? 'font-normal'; 
}); 
 
const colorClasses = computed(() => { 
    if (hasCustomColor.value) { 
        const map: Record<string, string> = { 
            muted: 'text-muted-foreground', 
            primary: 'text-primary', 
            danger: 'text-destructive', 
            success: 'text-success', 
            warning: 'text-warning', 
        }; 
        return map[props.color] ?? ''; 
    } 
    return defaultColorMap[props.variant] ?? 'text-foreground'; 
}); 
 
const alignClasses = computed(() => { 
    if (!props.align) return ''; 
    switch (props.align) { 
        case 'center': return 'text-center'; 
        case 'right': return 'text-right'; 
        default: return 'text-left'; 
    } 
}); 
</script>
