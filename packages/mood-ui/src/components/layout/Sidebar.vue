<template> 
    <component
        :is="as"
        class="relative flex flex-col h-full min-h-0 bg-card text-foreground"
        :data-collapsed="collapsed"
        :aria-label="ariaLabel ?? 'Sidebar'"
        role="navigation"
    >
        <!-- HEADER -->
        <div
            v-if="$slots.header"
            :class="[
                'relative shrink-0',
                dividers ? 'border-b border-border' : '',
            ]"
        >
            <slot name="header" :collapsed="collapsed" />

            <!-- Collapse toggle: vertically centered on the header so it lines
                 up with a Switcher / brand placed in the header slot. -->
            <button
                v-if="showToggle"
                type="button"
                data-modo-sidebar-toggle
                :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                :class="['absolute top-1/2 -translate-y-1/2', toggleButtonClass]"
                @click="$emit('update:collapsed', !collapsed)"
            >
                <ChevronLeftIcon v-if="!collapsed" class="size-3.5" />
                <ChevronRightIcon v-else class="size-3.5" />
            </button>
        </div>
 
        <!-- BODY --> 
        <div 
            :style="bodyStyle"
            :class="[ 
                'flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col gap-4',
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
                :aria-label="section.title"
                role="group" 
            > 
                <!-- Reserve the heading's height in both states. Removing it
                     makes every row below it jump during collapse. -->
                <div v-if="section.title" class="relative h-7 shrink-0 overflow-hidden">
                    <p
                        class="sidebar-section-title px-3 pt-1 pb-1 text-caption uppercase tracking-wide text-muted-foreground select-none whitespace-nowrap"
                        :data-collapsed="collapsed"
                        :aria-hidden="collapsed || undefined"
                    >
                        {{ section.title }}
                    </p>
                    <span
                        v-if="sectionIdx > 0"
                        aria-hidden="true"
                        class="absolute left-3 top-1/2 h-px w-5 bg-border transition-opacity duration-fast motion-reduce:transition-none"
                        :class="collapsed ? 'opacity-100' : 'opacity-0'"
                    />
                </div>

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

        <!-- COLLAPSE TOGGLE (no header: anchored near the top edge) -->
        <button
            v-if="showToggle && !$slots.header"
            type="button"
            data-modo-sidebar-toggle
            :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
            :class="['absolute top-[16px]', toggleButtonClass]"
            @click="$emit('update:collapsed', !collapsed)"
        >
            <ChevronLeftIcon v-if="!collapsed" class="size-3.5" />
            <ChevronRightIcon v-else class="size-3.5" />
        </button>
    </component>
</template> 
 
<script setup lang="ts"> 
import { computed, useSlots } from 'vue'; 
import type { Sidebar, SidebarItem, SidebarSection } from '../../interfaces/layout/Sidebar.interface'; 
import { useResolvedColor, useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
import SidebarRow from './SidebarRow.vue';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';
 
const props = withDefaults(defineProps<Sidebar>(), { 
    as: 'nav', 
    activeId: null, 
    collapsed: false, 
    activeVariant: 'tonal', 
    barSide: 'start', 
    padding: 'small',
    dividers: true,
    showToggle: false,
    toggleSide: 'end',
}); 
 
const emit = defineEmits<{
    'update:activeId': [value: string | number | null];
    'update:collapsed': [value: boolean];
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

const bodyStyle = computed(() => ({
    '--modo-sidebar-padding': {
        none: '0rem', small: '0.5rem', medium: '0.75rem', large: '1rem',
    }[props.padding],
}));

const togglePositionClass = computed(() =>
    props.toggleSide === 'start' ? '-left-3' : '-right-3',
);

// Shared look for the collapse toggle. Vertical anchoring differs by placement
// (centered on the header slot, or near the top edge when there is no header),
// so those classes are applied at the call site instead.
const toggleButtonClass = computed(() => [
    'z-20 size-6 rounded-full',
    'border border-border bg-card shadow-sm',
    'flex items-center justify-center cursor-pointer',
    'text-muted-foreground hover:text-foreground',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    togglePositionClass.value,
]);

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

<style scoped>
.sidebar-section-title {
    opacity: 1;
    transition: opacity var(--sidebar-label-duration, 140ms) ease-out var(--sidebar-label-delay, 70ms);
}

.sidebar-section-title[data-collapsed="true"] {
    opacity: 0;
    transition: opacity var(--sidebar-label-exit-duration, 80ms) ease-out;
}

@media (prefers-reduced-motion: reduce) {
    .sidebar-section-title { transition: none; }
}
</style>
