<template> 
    <div class="modo-dropdown inline-flex"> 
        <!-- Trigger: prefer the `#trigger` slot (full control, e.g. wrap an 
             Avatar). Default trigger uses <Button> per §14 (no raw <button>). --> 
        <span ref="triggerEl" class="inline-flex"> 
            <slot name="trigger" :open="isOpen" :toggle="toggle"> 
                <Button 
                    :variant="triggerVariant" 
                    :color="resolvedColor" 
                    :size="resolvedSize" 
                    :radius="resolvedRadius" 
                    :icon="effectiveTriggerIcon" 
                    :iconPosition="triggerLabel ? 'right' : 'left'" 
                    :label="triggerLabel" 
                    :ariaLabel="ariaLabel" 
                    :disabled="disabled" 
                    aria-haspopup="menu" 
                    :aria-expanded="isOpen" 
                    @click="toggle" 
                /> 
            </slot> 
        </span> 
 
        <PopoverPanel 
            :open="isOpen" 
            :style="panelStyle" 
            :radius="resolvedRadius" 
            role="menu" 
            :aria-label="ariaLabel || triggerLabel || 'Menu'" 
            @update:panelRef="panelRef = $event" 
        > 
            <ul 
                ref="listEl" 
                class="modo-dropdown-list flex flex-col py-1" 
                :style="{ minWidth }" 
                @keydown="onKeydown" 
            > 
                <template v-for="(entry, idx) in entries" :key="idx"> 
                    <li v-if="isDivider(entry)" role="separator" class="my-1 h-px bg-border" /> 
 
                    <li 
                        v-else-if="isHeader(entry)" 
                        role="presentation" 
                        class="px-3 pt-2 pb-1 text-caption font-semibold uppercase tracking-wider text-muted-foreground select-none" 
                    > 
                        {{ entry.label }} 
                    </li> 
 
                    <li v-else role="none" class="px-1"> 
                        <component 
                            :is="entry.href ? 'a' : 'button'" 
                            :type="entry.href ? undefined : 'button'" 
                            :href="entry.href && !entry.disabled ? entry.href : undefined" 
                            :target="entry.external ? '_blank' : undefined" 
                            :rel="entry.external ? 'noopener noreferrer' : undefined" 
                            role="menuitem" 
                            :tabindex="-1" 
                            :aria-disabled="entry.disabled || undefined" 
                            :data-active="idx === activeIndex || undefined" 
                            :class="[ 
                                'modo-dropdown-item w-full flex items-center gap-2 px-2.5 py-1.5 text-left', 
                                'text-body transition-colors duration-fast ease-standard', 
                                rowRadiusClass, 
                                entry.disabled 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : entry.danger 
                                        ? 'text-destructive hover:bg-destructive-subtle data-[active=true]:bg-destructive-subtle cursor-pointer' 
                                        : 'text-foreground hover:bg-muted data-[active=true]:bg-muted cursor-pointer', 
                            ]" 
                            @click="onItemClick(entry, $event)" 
                            @mouseenter="setActive(idx)" 
                            @focus="setActive(idx)" 
                        > 
                            <component 
                                :is="entry.icon" 
                                v-if="entry.icon" 
                                :class="[iconSizeClass, 'shrink-0', entry.danger ? 'text-destructive' : 'text-muted-foreground']" 
                                aria-hidden="true" 
                            /> 
                            <span class="flex flex-col min-w-0 flex-1"> 
                                <span class="truncate">{{ entry.label }}</span> 
                                <span 
                                    v-if="entry.description" 
                                    class="text-caption text-muted-foreground truncate" 
                                >{{ entry.description }}</span> 
                            </span> 
                            <span 
                                v-if="entry.shortcut" 
                                class="ml-2 text-caption text-muted-foreground tabular-nums" 
                                aria-hidden="true" 
                            >{{ entry.shortcut }}</span> 
                        </component> 
                    </li> 
                </template> 
            </ul> 
        </PopoverPanel> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref, watch, nextTick } from 'vue'; 
import { ChevronDownIcon } from '@heroicons/vue/24/outline'; 
import Button from '../forms/Button.vue'; 
import PopoverPanel from '../layout/PopoverPanel.vue'; 
import { usePopover } from '../../composables/usePopover'; 
import { useResolvedColor, useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
import type { 
    DropdownMenu, 
    DropdownMenuEntry, 
    DropdownMenuItem, 
    DropdownMenuDivider, 
    DropdownMenuHeader, 
    DropdownMenuEmits, 
} from '../../interfaces/navigation/DropdownMenu.interface'; 
 
const props = withDefaults(defineProps<DropdownMenu>(), { 
    triggerVariant: 'outline', 
    color: 'default', 
    showChevron: true, 
    placement: 'bottom-start', 
    matchTriggerWidth: false, 
    minWidth: '12rem', 
    disabled: false, 
    closeOnSelect: true, 
}); 
 
const emit = defineEmits<DropdownMenuEmits>(); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
const resolvedSize = useResolvedSize(() => props.size); 
 
const entries = computed<DropdownMenuEntry[]>(() => props.items ?? []); 
 
function isDivider(e: DropdownMenuEntry): e is DropdownMenuDivider { 
    return (e as { type?: string }).type === 'divider'; 
} 
function isHeader(e: DropdownMenuEntry): e is DropdownMenuHeader { 
    return (e as { type?: string }).type === 'header'; 
} 
function isItem(e: DropdownMenuEntry): e is DropdownMenuItem { 
    return !isDivider(e) && !isHeader(e); 
} 
 
/* ---------- Trigger ---------- */ 
const effectiveTriggerIcon = computed(() => { 
    if (props.triggerIcon) return props.triggerIcon; 
    if (props.showChevron && props.triggerLabel) return ChevronDownIcon; 
    if (props.showChevron && !props.triggerLabel) return ChevronDownIcon; 
    return undefined; 
}); 
 
/* ---------- Popover ---------- */ 
const { 
    triggerRef, 
    panelRef, 
    isOpen, 
    panelStyle, 
    open, 
    close, 
    toggle, 
} = usePopover({ 
    placement: () => props.placement, 
    matchTriggerWidth: () => props.matchTriggerWidth, 
    onOpen: () => emit('update:open', true), 
    onClose: () => { 
        emit('update:open', false); 
        activeIndex.value = -1; 
    }, 
}); 
 
const triggerEl = ref<HTMLElement | null>(null); 
watch(triggerEl, (el) => { triggerRef.value = el; }); 
 
/* ---------- Active item & keyboard ---------- */ 
const listEl = ref<HTMLElement | null>(null); 
const activeIndex = ref(-1); 
 
const itemIndices = computed(() => 
    entries.value 
        .map((e, i) => (isItem(e) && !e.disabled ? i : -1)) 
        .filter((i) => i !== -1), 
); 
 
function setActive(idx: number) { 
    activeIndex.value = idx; 
} 
 
function moveActive(delta: number) { 
    const order = itemIndices.value; 
    if (!order.length) return; 
    const cur = order.indexOf(activeIndex.value); 
    const next = cur === -1 
        ? (delta > 0 ? 0 : order.length - 1) 
        : (cur + delta + order.length) % order.length; 
    activeIndex.value = order[next]; 
    focusActive(); 
} 
 
function focusActive() { 
    nextTick(() => { 
        const el = listEl.value?.querySelector<HTMLElement>('[data-active="true"]'); 
        el?.focus({ preventScroll: true }); 
    }); 
} 
 
watch(isOpen, async (v) => { 
    if (v) { 
        await nextTick(); 
        const order = itemIndices.value; 
        if (order.length) { 
            activeIndex.value = order[0]; 
            focusActive(); 
        } 
    } 
}); 
 
function onKeydown(e: KeyboardEvent) { 
    switch (e.key) { 
        case 'ArrowDown': 
            e.preventDefault(); 
            moveActive(1); 
            break; 
        case 'ArrowUp': 
            e.preventDefault(); 
            moveActive(-1); 
            break; 
        case 'Home': 
            e.preventDefault(); 
            if (itemIndices.value.length) { 
                activeIndex.value = itemIndices.value[0]; 
                focusActive(); 
            } 
            break; 
        case 'End': 
            e.preventDefault(); 
            if (itemIndices.value.length) { 
                activeIndex.value = itemIndices.value[itemIndices.value.length - 1]; 
                focusActive(); 
            } 
            break; 
        case 'Enter': 
        case ' ': { 
            const entry = entries.value[activeIndex.value]; 
            if (entry && isItem(entry) && !entry.disabled) { 
                e.preventDefault(); 
                onItemClick(entry); 
            } 
            break; 
        } 
        case 'Tab': 
            close(); 
            break; 
    } 
} 
 
function onItemClick(entry: DropdownMenuItem, evt?: MouseEvent) { 
    if (entry.disabled) { 
        evt?.preventDefault(); 
        return; 
    } 
    entry.onClick?.(entry); 
    emit('select', entry); 
    if (props.closeOnSelect) close(); 
} 
 
/* ---------- Visual scaling tied to size ---------- */ 
const iconSizeClass = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-3.5 h-3.5'; 
        case 'large': return 'w-5 h-5'; 
        default: return 'w-4 h-4'; 
    } 
}); 
 
const rowRadiusClass = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-lg'; 
        case 'full': return 'rounded-full'; 
        default: return 'rounded-md'; 
    } 
}); 
 
defineExpose({ open, close, toggle }); 
</script> 
 
<style scoped> 
.modo-dropdown-item { 
    /* Native focus ring is suppressed: hover/data-active styling provides 
       the visual cue. Container is `role="menu"`, items are reachable via 
       roving tabindex. */ 
    outline: none; 
} 
.modo-dropdown-item:focus-visible { 
    outline: none; 
} 
</style>
