<template> 
    <component 
        :is="as" 
        class="flex flex-col h-full min-h-0 bg-card text-foreground" 
        :aria-label="ariaLabel ?? 'Sidebar'" 
        role="navigation" 
    > 
        <!-- HEADER --> 
        <div 
            v-if="$slots.header" 
            :class="[ 
                'shrink-0', 
                dividers ? 'border-b border-border' : '', 
            ]" 
        > 
            <slot name="header" :collapsed="collapsed" /> 
        </div> 
 
        <!-- BODY --> 
        <div 
            :class="[ 
                'flex-1 min-h-0 overflow-y-auto flex flex-col gap-4', 
                paddingClass, 
            ]" 
        > 
            <!-- Free-form body via default slot --> 
            <slot :collapsed="collapsed" :active-id="activeId ?? null" /> 
 
            <!-- Or auto-generated sections/items --> 
            <div 
                v-for="(section, sectionIdx) in resolvedSections" 
                :key="section.id" 
                class="flex flex-col gap-1" 
                :aria-labelledby="section.title ? `sidebar-section-${section.id}` : undefined" 
                role="group" 
            > 
                <Transition 
                    enter-active-class="transition-opacity duration-base ease-standard motion-reduce:transition-none" 
                    leave-active-class="transition-opacity duration-fast ease-standard motion-reduce:transition-none" 
                    enter-from-class="opacity-0" 
                    leave-to-class="opacity-0" 
                > 
                    <p 
                        v-if="section.title && !collapsed" 
                        :id="`sidebar-section-${section.id}`" 
                        class="px-3 pt-1 pb-1 text-caption uppercase tracking-wide text-muted-foreground select-none" 
                    > 
                        {{ section.title }} 
                    </p> 
                    <p 
                        v-else-if="section.title && collapsed && sectionIdx > 0" 
                        aria-hidden="true" 
                        class="mx-2 my-1 h-px bg-border" 
                    /> 
                </Transition> 
 
                <ul class="flex flex-col gap-1" role="list"> 
                    <SidebarRow 
                        v-for="item in section.items" 
                        :key="item.id" 
                        :item="item" 
                        :depth="0" 
                        :collapsed="collapsed" 
                        :active-id="activeId ?? null" 
                        :size="resolvedSize" 
                        :radius="resolvedRadius" 
                        :color="resolvedColor" 
                        :active-variant="activeVariant" 
                        :bar-side="barSide" 
                        :expand-aria-label="expandAriaLabel ?? 'Toggle sub-items'" 
                        @select="onSelect" 
                    /> 
                </ul> 
            </div> 
        </div> 
 
        <!-- FOOTER --> 
        <div 
            v-if="$slots.footer" 
            :class="[ 
                'shrink-0', 
                dividers ? 'border-t border-border' : '', 
            ]" 
        > 
            <slot name="footer" :collapsed="collapsed" /> 
        </div> 
    </component> 
</template> 
 
<script setup lang="ts"> 
import { computed, useSlots } from 'vue'; 
import type { Sidebar, SidebarItem, SidebarSection } from '../../interfaces/layout/Sidebar.interface'; 
import { useResolvedColor, useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
import SidebarRow from './SidebarRow.vue'; 
 
const props = withDefaults(defineProps<Sidebar>(), { 
    as: 'nav', 
    activeId: null, 
    collapsed: false, 
    activeVariant: 'tonal', 
    barSide: 'start', 
    padding: 'small', 
    dividers: true, 
}); 
 
const emit = defineEmits<{ 
    'update:activeId': [value: string | number | null]; 
    select: [item: SidebarItem]; 
}>(); 
 
useSlots(); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
const resolvedSize = useResolvedSize(() => props.size); 
 
/** Normalize either `sections` or `items` into a section array. */ 
const resolvedSections = computed<SidebarSection[]>(() => { 
    if (props.sections?.length) return props.sections; 
    if (props.items?.length) { 
        return [{ id: '_default', items: props.items }]; 
    } 
    return []; 
}); 
 
const paddingClass = computed(() => { 
    switch (props.padding) { 
        case 'none': return ''; 
        case 'medium': return 'p-3'; 
        case 'large': return 'p-4'; 
        default: return 'p-2'; 
    } 
}); 
 
function onSelect(item: SidebarItem) { 
    if (item.disabled) return; 
    // Items with their own navigation target keep behaving as links. 
    // For pure "button" items we update the active id internally so the 
    // host can rely on the v-model without writing extra plumbing. 
    if (!item.href && !item.to && !item.children) { 
        emit('update:activeId', item.id); 
    } 
    emit('select', item); 
} 
</script>
