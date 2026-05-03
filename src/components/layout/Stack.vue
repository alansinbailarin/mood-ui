<template> 
    <component :is="as" :class="['modo-stack flex', layoutClasses]"> 
        <template v-if="!divider"> 
            <slot /> 
        </template> 
        <template v-else> 
            <template v-for="(node, idx) in renderableChildren" :key="idx"> 
                <Divider 
                    v-if="idx > 0" 
                    :orientation="direction === 'row' ? 'vertical' : 'horizontal'" 
                    spacing="none" 
                    emphasis="subtle" 
                /> 
                <component :is="node" /> 
            </template> 
        </template> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed, useSlots, type VNode } from 'vue'; 
import Divider from './Divider.vue'; 
import type { Stack } from '../../interfaces/layout/Stack.interface'; 
 
const props = withDefaults(defineProps<Stack>(), { 
    direction: 'column', 
    spacing: 'medium', 
    align: 'stretch', 
    justify: 'start', 
    wrap: 'nowrap', 
    divider: false, 
    fullWidth: false, 
    fullHeight: false, 
    as: 'div', 
}); 
 
const slots = useSlots(); 
 
/* ------------------------------------------------------------------ */ 
/*  Children resolution (for divider injection)                          */ 
/* ------------------------------------------------------------------ */ 
 
const renderableChildren = computed<VNode[]>(() => { 
    const raw = slots.default?.() ?? []; 
    // Filter out comment nodes / whitespace-only text nodes. 
    return raw.filter((vnode) => { 
        if (typeof vnode.type === 'symbol') { 
            // Fragment / Comment / Text — keep fragments and meaningful text. 
            const txt = typeof vnode.children === 'string' ? vnode.children.trim() : ''; 
            return !!txt; 
        } 
        return true; 
    }); 
}); 
 
/* ------------------------------------------------------------------ */ 
/*  Class composition                                                    */ 
/* ------------------------------------------------------------------ */ 
 
const directionClass = computed(() => 
    props.direction === 'row' ? 'flex-row' : 'flex-col', 
); 
 
const wrapClass = computed(() => { 
    switch (props.wrap) { 
        case 'wrap': return 'flex-wrap'; 
        case 'wrap-reverse': return 'flex-wrap-reverse'; 
        case 'nowrap': 
        default: return 'flex-nowrap'; 
    } 
}); 
 
const alignClass = computed(() => { 
    switch (props.align) { 
        case 'start': return 'items-start'; 
        case 'center': return 'items-center'; 
        case 'end': return 'items-end'; 
        case 'baseline': return 'items-baseline'; 
        case 'stretch': 
        default: return 'items-stretch'; 
    } 
}); 
 
const justifyClass = computed(() => { 
    switch (props.justify) { 
        case 'center': return 'justify-center'; 
        case 'end': return 'justify-end'; 
        case 'between': return 'justify-between'; 
        case 'around': return 'justify-around'; 
        case 'evenly': return 'justify-evenly'; 
        case 'start': 
        default: return 'justify-start'; 
    } 
}); 
 
const spacingClass = computed(() => { 
    switch (props.spacing) { 
        case 'none': return 'gap-0'; 
        case 'xsmall': return 'gap-1'; 
        case 'small': return 'gap-2'; 
        case 'large': return 'gap-6'; 
        case 'xlarge': return 'gap-8'; 
        case 'medium': 
        default: return 'gap-4'; 
    } 
}); 
 
const layoutClasses = computed(() => [ 
    directionClass.value, 
    wrapClass.value, 
    alignClass.value, 
    justifyClass.value, 
    spacingClass.value, 
    props.fullWidth ? 'w-full' : '', 
    props.fullHeight ? 'h-full' : '', 
]); 
</script>
