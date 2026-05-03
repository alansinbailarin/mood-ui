<template> 
    <nav :aria-label="ariaLabel" :class="['modo-breadcrumbs flex items-center min-w-0', sizeClass]"> 
        <ol class="flex items-center gap-1.5 min-w-0 flex-wrap"> 
            <template v-for="(node, idx) in renderNodes" :key="idx"> 
                <!-- Separator --> 
                <li 
                    v-if="idx > 0" 
                    aria-hidden="true" 
                    class="modo-breadcrumb-sep text-muted-foreground/70 select-none flex items-center" 
                > 
                    <component v-if="!separatorText && separator === 'chevron'" :is="ChevronRightIcon" class="w-3.5 h-3.5" /> 
                    <component v-else-if="!separatorText && separator === 'arrow'" :is="ArrowRightIcon" class="w-3.5 h-3.5" /> 
                    <span v-else-if="!separatorText && separator === 'dot'" class="text-base leading-none">·</span> 
                    <span v-else-if="!separatorText && separator === 'slash'" class="text-muted-foreground/70">/</span> 
                    <span v-else>{{ separatorText }}</span> 
                </li> 
 
                <!-- Ellipsis collapse --> 
                <li v-if="node.kind === 'ellipsis'" class="flex items-center"> 
                    <button 
                        v-if="node.collapsed.length > 0" 
                        type="button" 
                        :class="['modo-breadcrumb-ellipsis inline-flex items-center justify-center px-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-fast ease-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1']" 
                        :aria-label="`Show ${node.collapsed.length} hidden items`" 
                        @click="onEllipsisClick(node.collapsed)" 
                    > 
                        <component :is="EllipsisHorizontalIcon" class="w-4 h-4" /> 
                    </button> 
                </li> 
 
                <!-- Item --> 
                <li v-else class="flex items-center min-w-0"> 
                    <component 
                        :is="elementFor(node.item)" 
                        v-bind="bindingsFor(node.item)" 
                        :class="['modo-breadcrumb-item inline-flex items-center gap-1.5 min-w-0 transition-colors duration-fast ease-standard', 
                            isCurrent(node.idx) ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground', 
                            node.item.disabled ? 'opacity-50 pointer-events-none' : '', 
                            isInteractive(node.item, node.idx) ? 'rounded-md hover:bg-muted px-1.5 py-0.5 -mx-1.5 -my-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1' : '', 
                        ]" 
                        :aria-current="isCurrent(node.idx) ? 'page' : undefined" 
                        @click="(e: MouseEvent) => onItemClick(e, node.item, node.idx)" 
                    > 
                        <component 
                            v-if="iconFor(node.item, node.idx)" 
                            :is="iconFor(node.item, node.idx)" 
                            class="w-4 h-4 shrink-0" 
                            aria-hidden="true" 
                        /> 
                        <span class="truncate">{{ node.item.label }}</span> 
                    </component> 
                </li> 
            </template> 
        </ol> 
    </nav> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref, type Component } from 'vue'; 
import { 
    ChevronRightIcon, 
    ArrowRightIcon, 
    EllipsisHorizontalIcon, 
    HomeIcon, 
} from '@heroicons/vue/24/outline'; 
import type { Breadcrumbs, BreadcrumbItem } from '../../interfaces/navigation/Breadcrumbs.interface'; 
import { useResolvedSize } from '../../composables/useModoConfig'; 
 
const props = withDefaults(defineProps<Breadcrumbs>(), { 
    max: 0, 
    separator: 'chevron', 
    showHomeIcon: false, 
    ariaLabel: 'Breadcrumb', 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const emit = defineEmits<{ 
    /** Fired when an interactive item (with `to`) is clicked. */ 
    navigate: [item: BreadcrumbItem, index: number]; 
}>(); 
 
/* ------------------------------------------------------------------ */ 
/*  Collapse logic                                                      */ 
/* ------------------------------------------------------------------ */ 
 
const expanded = ref(false); 
 
type RenderNode = 
    | { kind: 'item'; item: BreadcrumbItem; idx: number } 
    | { kind: 'ellipsis'; collapsed: BreadcrumbItem[] }; 
 
const renderNodes = computed<RenderNode[]>(() => { 
    const items = props.items; 
    const max = props.max; 
    if (!max || expanded.value || items.length <= max) { 
        return items.map((item, idx) => ({ kind: 'item', item, idx })); 
    } 
    // Always keep first and last; collapse the middle. 
    const head = items[0]; 
    const tail = items[items.length - 1]; 
    const visible = Math.max(2, max); 
    const tailCount = Math.max(1, visible - 2); 
    const tailStart = items.length - tailCount; 
    const tailItems = items.slice(tailStart); 
    const collapsed = items.slice(1, tailStart); 
    const out: RenderNode[] = [{ kind: 'item', item: head, idx: 0 }]; 
    if (collapsed.length > 0) out.push({ kind: 'ellipsis', collapsed }); 
    tailItems.forEach((item, i) => { 
        out.push({ kind: 'item', item, idx: tailStart + i }); 
    }); 
    // Edge case: visible >= items.length but unreachable due to early 
    // return; ignore. Also handle the case where head and tail overlap 
    // (max === 1). 
    if (visible <= 1) return [{ kind: 'item', item: tail, idx: items.length - 1 }]; 
    return out; 
}); 
 
function onEllipsisClick(_collapsed: BreadcrumbItem[]) { 
    expanded.value = true; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Item helpers                                                         */ 
/* ------------------------------------------------------------------ */ 
 
function isCurrent(idx: number) { 
    return idx === props.items.length - 1; 
} 
 
function isInteractive(item: BreadcrumbItem, idx: number) { 
    if (item.disabled || isCurrent(idx)) return false; 
    return !!(item.to || item.href); 
} 
 
function elementFor(item: BreadcrumbItem): string { 
    if (item.href) return 'a'; 
    if (item.to) return 'button'; 
    return 'span'; 
} 
 
function bindingsFor(item: BreadcrumbItem) { 
    if (item.href) return { href: item.href }; 
    if (item.to) return { type: 'button' }; 
    return {}; 
} 
 
function iconFor(item: BreadcrumbItem, idx: number): Component | undefined { 
    if (item.icon) return item.icon; 
    if (idx === 0 && props.showHomeIcon) return HomeIcon; 
    return undefined; 
} 
 
function onItemClick(_e: MouseEvent, item: BreadcrumbItem, idx: number) { 
    if (item.disabled) return; 
    if (item.href) return; // Native anchor; no SPA emit. 
    if (item.to) emit('navigate', item, idx); 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Size                                                                 */ 
/* ------------------------------------------------------------------ */ 
 
const sizeClass = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'text-caption'; 
        case 'large': return 'text-body-lg'; 
        case 'medium': 
        default: return 'text-body'; 
    } 
}); 
</script>
