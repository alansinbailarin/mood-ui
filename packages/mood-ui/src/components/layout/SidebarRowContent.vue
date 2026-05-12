<template> 
    <!-- Active bar accent (only `bar` variant). Always rendered when in bar 
         mode so opacity + scale-y can fade in/out as the active row changes. --> 
    <span 
        v-if="activeVariant === 'bar' && !collapsed" 
        aria-hidden="true" 
        :class="[ 
            'absolute inset-y-0 w-1 origin-center', 
            'transition-[opacity,transform] duration-base ease-standard motion-reduce:transition-none', 
            barColorClass, 
            barSide === 'end' ? 'right-0' : 'left-0', 
            isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50', 
        ]" 
    /> 
 
    <!-- Leading icon --> 
    <span 
        v-if="item.icon || $slots.icon" 
        aria-hidden="true" 
        class="shrink-0 inline-flex items-center justify-center w-5 h-5" 
    > 
        <slot name="icon" :item="item"> 
            <component :is="item.icon" class="w-full h-full" /> 
        </slot> 
    </span> 
    <span 
        v-else-if="depth === 0" 
        aria-hidden="true" 
        class="shrink-0 inline-flex items-center justify-center w-5 h-5" 
    > 
        <span class="w-2 h-2 rounded-full bg-current/40" /> 
    </span> 
 
    <!-- Label --> 
    <span 
        v-if="!collapsed" 
        class="flex-1 min-w-0 truncate text-left transition-opacity duration-fast ease-standard motion-reduce:transition-none" 
    > 
        {{ item.label }} 
    </span> 
 
    <!-- Trailing badge --> 
    <Badge 
        v-if="!collapsed && item.badge !== undefined && item.badge !== null && item.badge !== ''" 
        :label="String(item.badge)" 
        :color="item.badgeColor ?? 'default'" 
        variant="subtle" 
        size="small" 
    /> 
 
    <!-- Chevron for children --> 
    <span 
        v-if="hasChildren && !collapsed" 
        aria-hidden="true" 
        :class="[ 
            'shrink-0 inline-flex items-center justify-center w-4 h-4 text-muted-foreground', 
            'transition-transform duration-base ease-standard motion-reduce:transition-none', 
            expanded ? 'rotate-90' : '', 
        ]" 
    > 
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="w-3.5 h-3.5" 
        > 
            <polyline points="9 18 15 12 9 6" /> 
        </svg> 
    </span> 
</template> 
 
<script setup lang="ts"> 
import type { SidebarItem } from '../../interfaces/layout/Sidebar.interface'; 
import Badge from '../feedback/Badge.vue'; 
 
interface Props { 
    item: SidebarItem; 
    depth: number; 
    collapsed: boolean; 
    expanded: boolean; 
    isActive: boolean; 
    hasChildren: boolean; 
    activeVariant: 'tonal' | 'solid' | 'bar'; 
    barSide: 'start' | 'end'; 
    barColorClass: string; 
} 
 
defineProps<Props>(); 
</script>
