<template> 
    <!-- Active bar accent (only `bar` variant). Always rendered when in bar 
         mode so opacity + scale-y can fade in/out as the active row changes. --> 
    <span 
        v-if="activeVariant === 'bar'"
        aria-hidden="true" 
        :class="[ 
            'absolute inset-y-0 w-1 origin-center', 
            'transition-[opacity,transform] duration-base ease-standard motion-reduce:transition-none', 
            barColorClass, 
            barSide === 'end' ? 'right-0' : 'left-0', 
            isActive && !collapsed ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50',
        ]" 
    /> 
 
    <!-- The row centers this fixed column within the shell's compact width.
         Keep it identical in both states so the icon never shifts. -->
    <span 
        v-if="item.icon || $slots.icon" 
        aria-hidden="true" 
        class="sidebar-row-icon shrink-0 inline-flex items-center justify-center h-5"
    > 
        <slot name="icon" :item="item"> 
            <component :is="item.icon" class="w-5 h-5" />
        </slot> 
    </span> 
    <span 
        v-else-if="depth === 0" 
        aria-hidden="true" 
        class="sidebar-row-icon shrink-0 inline-flex items-center justify-center h-5"
    > 
        <span class="w-2 h-2 rounded-full bg-current/40" /> 
    </span> 
 
    <!-- Labels stay mounted and keep their leading edge anchored. Only
         opacity changes; the parent row clips the trailing content. -->
    <span
        class="sidebar-row-details flex flex-1 min-w-0 items-center gap-[inherit]"
        :data-collapsed="collapsed"
        :aria-hidden="collapsed || undefined"
    >
        <!-- Label -->
        <span
            class="flex-1 min-w-0 truncate text-left"
        >
            {{ item.label }}
        </span>

        <!-- Trailing badge -->
        <Badge
            v-if="item.badge !== undefined && item.badge !== null && item.badge !== ''"
            :label="String(item.badge)"
            :color="item.badgeColor ?? 'default'"
            variant="subtle"
            size="small"
        />

        <!-- Chevron for children -->
        <span
            v-if="hasChildren"
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

<style scoped>
.sidebar-row-icon {
    width: var(--modo-sidebar-icon-width, 1.5rem);
}

.sidebar-row-details {
    opacity: 1;
    visibility: visible;
    transition: opacity var(--sidebar-label-duration, 140ms) ease-out var(--sidebar-label-delay, 70ms), visibility 0s;
}

.sidebar-row-details[data-collapsed="true"] {
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--sidebar-label-exit-duration, 80ms) ease-out, visibility 0s var(--sidebar-label-exit-duration, 80ms);
}

@media (prefers-reduced-motion: reduce) {
    .sidebar-row-details { transition: none; }
}
</style>
