<template> 
    <component 
        :is="as" 
        :class="[ 
            'w-full', 
            stickyClasses, 
            divider ? 'border-b border-border' : '', 
            paddingClasses, 
        ]" 
    > 
        <div class="flex flex-col gap-3"> 
            <!-- Breadcrumbs slot (top row) --> 
            <div v-if="$slots.breadcrumbs" class="flex items-center min-w-0"> 
                <slot name="breadcrumbs" /> 
            </div> 
 
            <!-- Title row: optional back button + title/subtitle + actions --> 
            <div class="flex items-start gap-3"> 
                <Button 
                    v-if="backButton" 
                    variant="ghost" 
                    color="default" 
                    size="medium" 
                    :icon="backIcon ?? ChevronLeftIcon" 
                    :ariaLabel="backAriaLabel ?? 'Go back'" 
                    class="-ml-2 shrink-0" 
                    @click="emit('back')" 
                /> 
 
                <div class="flex flex-col gap-1 flex-1 min-w-0"> 
                    <Typography 
                        :variant="titleVariant" 
                        :size="titleSize" 
                        weight="bold" 
                        color="default" 
                    > 
                        <slot name="title">{{ title }}</slot> 
                    </Typography> 
 
                    <Typography 
                        v-if="hasSubtitle" 
                        variant="body" 
                        size="medium" 
                        color="muted" 
                    > 
                        <slot name="subtitle">{{ subtitle }}</slot> 
                    </Typography> 
                </div> 
 
                <div 
                    v-if="$slots.actions" 
                    class="flex items-center gap-2 shrink-0" 
                > 
                    <slot name="actions" /> 
                </div> 
            </div> 
 
            <!-- Hero slot (full-width content under subtitle) --> 
            <div v-if="$slots.hero" class="mt-2"> 
                <slot name="hero" /> 
            </div> 
 
            <!-- Tabs slot (bottom of header) --> 
            <div v-if="$slots.tabs" class="mt-2 -mb-px"> 
                <slot name="tabs" /> 
            </div> 
        </div> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed, defineComponent, h, useSlots } from 'vue'; 
import type { PageHeader } from '../../interfaces/layout/PageHeader.interface'; 
import Typography from '../data-display/Typography.vue'; 
import Button from '../forms/Button.vue'; 
import { useResolvedSize } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<PageHeader>(), { 
    divider: false, 
    sticky: false, 
    padding: 'medium', 
    as: 'header', 
    backButton: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const emit = defineEmits<{ back: [] }>(); 
const slots = useSlots(); 
 
// Default chevron-left icon used by the back button when no `backIcon` is 
// provided. Inline SVG keeps the component dependency-free; `aria-hidden` 
// because Button supplies the accessible name via `ariaLabel`. 
const ChevronLeftIcon = defineComponent({ 
    name: 'PageHeaderBackIcon', 
    setup() { 
        return () => 
            h( 
                'svg', 
                { 
                    xmlns: 'http://www.w3.org/2000/svg', 
                    viewBox: '0 0 24 24', 
                    fill: 'none', 
                    stroke: 'currentColor', 
                    'stroke-width': 2, 
                    'stroke-linecap': 'round', 
                    'stroke-linejoin': 'round', 
                    'aria-hidden': 'true', 
                    class: 'h-5 w-5', 
                }, 
                [h('polyline', { points: '15 18 9 12 15 6' })], 
            ); 
    }, 
}); 
 
const hasSubtitle = computed(() => !!props.subtitle || !!slots.subtitle); 
 
// Title typography mapping: keep within the existing Typography variants 
// (no custom font-size) so cascade and tokens stay consistent. 
const titleVariant = computed<'heading' | 'display'>(() => 
    resolvedSize.value === 'large' ? 'display' : 'heading', 
); 
 
const titleSize = computed<'small' | 'medium'>(() => {
    if (resolvedSize.value === 'large') return 'small';   // display/small ≈ text-4xl 
    if (resolvedSize.value === 'small') return 'small';   // heading/small  ≈ text-xl 
    return 'medium';                              // heading/medium ≈ text-2xl 
}); 
 
const paddingClasses = computed(() => { 
    switch (props.padding) { 
        case 'none': return ''; 
        case 'small': return 'px-4 py-3'; 
        case 'large': return 'px-6 py-8'; 
        default: return 'px-6 py-5'; 
    } 
}); 
 
const stickyClasses = computed(() => 
    props.sticky ? 'sticky top-0 z-30 bg-background/85 backdrop-blur' : '', 
); 
</script>
