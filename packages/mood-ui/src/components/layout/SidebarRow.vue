<template> 
    <li> 
        <!-- Keep one row mounted so toggling the tooltip never resets focus
             or replaces icons midway through the width transition. -->
        <Tooltip
            :disabled="!collapsed || depth > 0 || item.disabled"
            :content="item.label"
            placement="right"
            wrapper-class="!flex !w-full min-w-0"
        >
            <component
                :is="rowTag"
                v-bind="rowAttrs"
                :type="isButton ? 'button' : undefined"
                :aria-disabled="item.disabled || undefined"
                :aria-current="isActive ? 'page' : undefined"
                :aria-expanded="hasChildren ? expanded && !collapsed : undefined"
                :aria-label="collapsed ? item.label : undefined"
                :tabindex="item.disabled ? -1 : 0"
                :class="rowClasses"
                :style="indentStyle"
                @click="onActivate"
                @keydown.enter.prevent="onActivate"
                @keydown.space.prevent="onActivate"
            >
                <RowContent
                    :item="item"
                    :depth="depth"
                    :collapsed="collapsed"
                    :expanded="expanded"
                    :is-active="isActive"
                    :has-children="hasChildren"
                    :active-variant="activeVariant"
                    :bar-side="barSide"
                    :bar-color-class="barColorClass"
                >
                    <template v-if="$slots.icon" #icon="slotProps">
                        <slot name="icon" v-bind="slotProps" />
                    </template>
                </RowContent>
            </component>
        </Tooltip>

        <!-- Children — animated expand/collapse via CSS grid-template-rows. 
             Children stay mounted to preserve their state. Hidden branches are
             inert so keyboard navigation cannot enter clipped content. -->
        <div 
            v-if="hasChildren" 
            :class="[ 
                'grid transition-[grid-template-rows] duration-base ease-standard motion-reduce:transition-none', 
            ]" 
            :style="{ gridTemplateRows: expanded && !collapsed ? '1fr' : '0fr' }" 
            :aria-hidden="!expanded || collapsed"
            :inert="!expanded || collapsed ? true : undefined"
        > 
            <div class="overflow-hidden min-h-0"> 
                <ul class="flex flex-col gap-0.5 mt-0.5" role="list"> 
                    <SidebarRow 
                        v-for="child in item.children" 
                        :key="child.id" 
                        :item="child" 
                        :depth="depth + 1" 
                        :collapsed="false" 
                        :active-id="activeId" 
                        :size="size" 
                        :radius="radius" 
                        :color="color" 
                        :active-variant="activeVariant" 
                        :bar-side="barSide" 
                        :expand-aria-label="expandAriaLabel" 
                        @select="(it: unknown) => emit('select', it as any)" 
                    /> 
                </ul> 
            </div> 
        </div> 
    </li> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref } from 'vue'; 
import type { SidebarItem } from '../../interfaces/layout/Sidebar.interface'; 
import type { ModoColor, ModoRadius, ModoSize } from '../../config/ModoConfig'; 
import Tooltip from '../feedback/Tooltip.vue'; 
import RowContent from './SidebarRowContent.vue'; 
 
interface Props { 
    item: SidebarItem; 
    depth: number; 
    collapsed: boolean; 
    activeId: string | number | null; 
    size: ModoSize; 
    radius: ModoRadius; 
    color: ModoColor; 
    activeVariant: 'tonal' | 'solid' | 'bar'; 
    barSide: 'start' | 'end'; 
    expandAriaLabel: string; 
} 
 
const props = defineProps<Props>(); 
 
const emit = defineEmits<{ 
    select: [item: SidebarItem]; 
}>(); 
 
const expanded = ref<boolean>(!!props.item.defaultExpanded || hasActiveDescendant(props.item)); 
 
function hasActiveDescendant(item: SidebarItem): boolean { 
    if (!item.children?.length) return false; 
    return item.children.some( 
        (c) => c.id === props.activeId || hasActiveDescendant(c), 
    ); 
} 
 
const hasChildren = computed(() => !!props.item.children?.length); 
const isActive = computed(() => props.activeId === props.item.id); 
 
// Decide rendered tag. 
const rowTag = computed(() => { 
    if (props.item.href) return 'a'; 
    if (props.item.to) return 'router-link'; 
    return 'button'; 
}); 
 
const isButton = computed(() => rowTag.value === 'button'); 
 
const rowAttrs = computed(() => { 
    if (props.item.href) { 
        return { 
            href: props.item.disabled ? undefined : props.item.href, 
            target: props.item.external ? '_blank' : undefined, 
            rel: props.item.external ? 'noopener noreferrer' : undefined, 
        }; 
    } 
    if (props.item.to) { 
        return { to: props.item.to }; 
    } 
    return {}; 
}); 
 
// --- Visual classes --------------------------------------------------------- 
const sizeClass = computed(() => { 
    switch (props.size) { 
        case 'small': return 'h-8 px-3 text-caption gap-2';
        case 'large': return 'h-11 px-3 text-body-lg gap-3'; 
        default: return 'h-9 px-3 text-body gap-3'; 
    } 
}); 
 
const radiusClass = computed(() => { 
    switch (props.radius) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-full'; 
        default: return 'rounded-md'; 
    } 
}); 
 
const indentStyle = computed(() => { 
    if (props.collapsed) return undefined; 
    if (props.depth === 0) return undefined; 
    return { paddingLeft: `${0.75 + props.depth * 1.25}rem` }; 
}); 
 
// NOTE: the design system's CSS token for the destructive/error family is 
// `--destructive` (not `--danger`). The component API still uses 'danger' 
// (semantic), so we translate it to the right Tailwind utilities here. 
const colorTonalMap: Record<ModoColor, string> = { 
    default: 'bg-accent text-accent-foreground', 
    primary: 'bg-primary/10 text-primary', 
    danger: 'bg-destructive/10 text-destructive', 
    success: 'bg-success/10 text-success', 
    warning: 'bg-warning/10 text-warning', 
}; 
 
const colorSolidMap: Record<ModoColor, string> = { 
    default: 'bg-foreground text-background', 
    primary: 'bg-primary text-primary-foreground', 
    danger: 'bg-destructive text-destructive-foreground', 
    success: 'bg-success text-success-foreground', 
    warning: 'bg-warning text-warning-foreground', 
}; 
 
const colorBarMap: Record<ModoColor, string> = { 
    default: 'bg-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
 
const activeClasses = computed(() => { 
    const c = props.item.danger ? 'danger' : props.color; 
    if (props.activeVariant === 'solid') return colorSolidMap[c]; 
    if (props.activeVariant === 'bar') return `${colorTonalMap[c]} font-medium`; 
    return `${colorTonalMap[c]} font-medium`; 
}); 
 
const idleHoverClass = computed(() => { 
    if (props.item.danger) { 
        return 'text-destructive hover:bg-destructive/10 hover:text-destructive'; 
    } 
    return `${props.depth > 0 ? 'text-muted-foreground' : 'text-foreground'} hover:bg-accent hover:text-accent-foreground`; 
}); 
 
const rowClasses = computed(() => [ 
    'relative flex items-center w-full whitespace-nowrap overflow-hidden', 
    'transition-[background-color,color] duration-fast ease-standard motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', 
    sizeClass.value, 
    radiusClass.value, 
    props.depth === 0 ? 'sidebar-top-level-row' : '',
    props.item.disabled 
        ? 'opacity-50 cursor-not-allowed pointer-events-none' 
        : 'cursor-pointer', 
    isActive.value 
        ? activeClasses.value 
        : `${idleHoverClass.value}`, 
]); 
 
const barColorClass = computed(() => { 
    const c = props.item.danger ? 'danger' : props.color; 
    return colorBarMap[c]; 
}); 
 
// --- Activation ------------------------------------------------------------- 
function onActivate(_e: Event) { 
    if (props.item.disabled) return; 
    if (hasChildren.value) { 
        expanded.value = !expanded.value; 
        return; 
    } 
    emit('select', props.item); 
} 
</script> 
 
<style scoped> 
/* Center the fixed 24px icon column in the shell's compact content width.
   The inset is the same expanded and collapsed; only the row background grows. */
.sidebar-top-level-row {
    --modo-sidebar-icon-width: clamp(1.25rem, calc(var(--modo-sidebar-collapsed-width, 4rem) - 2 * var(--modo-sidebar-padding, 0.5rem)), 1.5rem);
    padding-inline: max(0px, calc((var(--modo-sidebar-collapsed-width, 4rem) - 2 * var(--modo-sidebar-padding, 0.5rem) - var(--modo-sidebar-icon-width)) / 2));
}

/* Keep the focus ring visible above the bar accent. */ 
.relative:focus-visible { 
    z-index: 1; 
} 
</style>
