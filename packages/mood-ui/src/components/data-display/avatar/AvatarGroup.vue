<template> 
    <div 
        class="flex items-center" 
        :class="overlapClasses" 
        role="group" 
        :aria-label="ariaLabel || groupAriaLabel" 
    > 
        <template v-for="(child, index) in visibleChildren" :key="index"> 
            <component :is="child" /> 
        </template> 
        <span 
            v-if="max && totalCount > max" 
            :class="['relative inline-flex items-center justify-center font-medium bg-muted text-muted-foreground ring-2 ring-card', counterSizeClasses, shapeClasses, counterFontClasses]" 
            :aria-label="`${totalCount - max} more`" 
        > 
            <span aria-hidden="true">+{{ totalCount - max }}</span> 
        </span> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, provide, useSlots, type VNode } from 'vue'; 
import type { AvatarGroup } from '../../../interfaces/data-display/avatar/AvatarGroup.interface'; 
import type { ModoSize } from '../../../config/ModoConfig';
import { useResolvedRadius, useModoLocale, useSizeTokens } from '../../../composables/useModoConfig'; 
import { interpolate } from '../../../config/ModoLocale'; 
 
const props = withDefaults(defineProps<AvatarGroup>(), { 
    size: 'medium', 
    bordered: true, 
}); 
 
const resolvedRadius = useResolvedRadius(() => props.radius); 
const sz = useSizeTokens(() => (props.size === 'xl' ? 'large' : props.size) as ModoSize | undefined);
const loc = useModoLocale(); 
 
const slots = useSlots(); 
 
const flatChildren = computed(() => { 
    const defaultSlot = slots.default?.(); 
    if (!defaultSlot) return []; 
    const children: VNode[] = []; 
    for (const vnode of defaultSlot) { 
        if (Array.isArray(vnode.children)) { 
            children.push(...(vnode.children as VNode[])); 
        } else { 
            children.push(vnode); 
        } 
    } 
    return children; 
}); 
 
const totalCount = computed(() => flatChildren.value.length); 
 
const groupAriaLabel = computed(() => 
    interpolate(loc.value.avatarGroup.group, { count: totalCount.value }), 
); 
 
const visibleChildren = computed(() => { 
    if (props.max && totalCount.value > props.max) { 
        return flatChildren.value.slice(0, props.max); 
    } 
    return flatChildren.value; 
}); 
 
provide('avatarGroup', { 
    // Reactive getters so children pick up live changes from this group's 
    // props (size / radius / bordered). A plain object would freeze the 
    // values at provide-time and break playground / dynamic updates. 
    size: computed(() => props.size), 
    radius: computed(() => props.radius), 
    bordered: computed(() => props.bordered), 
    grouped: true, 
}); 
 
const overlapClasses = computed(() => {
    switch (props.size) {
        case 'xsmall': return '-space-x-1.5';
        case 'small': return '-space-x-2';
        case 'large': return '-space-x-3.5';
        case 'xl': return '-space-x-5';
        default: return '-space-x-2.5';
    }
});
 
const shapeClasses = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'medium': return 'rounded-md'; 
        case 'large': return 'rounded-lg'; 
        default: return 'rounded-full'; 
    } 
}); 
 
const counterSizeClasses = computed(() => {
    if (props.size === 'xl') return 'w-20 h-20';
    return `${sz.value.control} ${sz.value.control.replace('h-', 'w-')}`;
});

const counterFontClasses = computed(() => {
    switch (props.size) {
        case 'xsmall': return 'text-[10px]';
        case 'small': return 'text-xs';
        case 'large': return 'text-lg';
        case 'xl': return 'text-2xl';
        default: return 'text-sm';
    }
});
</script>
