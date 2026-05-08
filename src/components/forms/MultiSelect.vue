<template> 
    <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']"> 
        <label 
            v-if="label" 
            :for="fieldId" 
            class="text-caption font-medium text-foreground" 
            @click="openAndFocus" 
        > 
            {{ label }} 
            <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
        </label> 
 
        <!-- Trigger --> 
        <button 
            :id="fieldId" 
            ref="triggerEl" 
            type="button" 
            :disabled="isDisabled" 
            :aria-label="!label ? ariaLabel : undefined" 
            :aria-invalid="hasError || undefined" 
            :aria-describedby="describedBy" 
            :aria-required="required || undefined" 
            :aria-haspopup="'listbox'" 
            :aria-expanded="isOpen" 
            :aria-controls="listboxId" 
            :aria-activedescendant="isOpen && activeId ? activeId : undefined" 
            role="combobox" 
            :class="[ 
                'modo-field-wrapper flex items-center gap-2 text-left min-h-10', 
                wrapperVariantClasses, 
                wrapperSizeClasses, 
                radiusClasses, 
                fullWidth ? 'w-full' : '', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer', 
            ]" 
            @click="onTriggerClick" 
            @keydown="onTriggerKeydown" 
        > 
            <component 
                :is="iconLeft" 
                v-if="iconLeft" 
                aria-hidden="true" 
                :class="['shrink-0', affordanceIconClass, iconSizeClasses]" 
            /> 
 
            <!-- Chips --> 
            <!-- 
              NOTE: the TransitionGroup stays always mounted; if we toggle it 
              with `v-if`, removing the last chip unmounts the group before 
              Vue can play the leave transition on that chip. A sibling 
              placeholder handles the empty state visually. 
            --> 
            <TransitionGroup 
                name="modo-chip" 
                tag="div" 
                class="min-w-0 flex flex-wrap items-center gap-1 py-1" 
                :class="[selectedOptions.length ? 'flex-1' : '']" 
                @after-leave="onChipAfterLeave" 
            > 
                <Badge 
                    v-for="opt in visibleChips" 
                    :key="`chip-${opt.value}`" 
                    variant="subtle" 
                    :color="badgeColor" 
                    size="medium" 
                    :radius="radius" 
                    :removable="!isDisabled && !readonly" 
                    :removeAriaLabel="`Remove ${opt.label}`" 
                    :label="opt.label" 
                    class="modo-chip max-w-50" 
                    @remove="removeValue(opt.value)" 
                /> 
                <Badge 
                    v-if="hiddenChipCount > 0" 
                    :key="'chip-overflow'" 
                    variant="subtle" 
                    :color="badgeColor" 
                    size="medium" 
                    :radius="radius" 
                    :label="`+${hiddenChipCount}`" 
                    class="modo-chip" 
                /> 
            </TransitionGroup> 
            <span 
                v-if="showPlaceholder" 
                :class="['flex-1 min-w-0 truncate text-muted-foreground', inputTextClasses]" 
            > 
                {{ placeholder }} 
            </span> 
 
            <Loader 
                v-if="loading" 
                :size="size === 'large' ? 'medium' : 'small'" 
                :class="['shrink-0', affordanceIconClass]" 
            /> 
 
            <Button 
                v-else-if="clearable && selectedOptions.length && !isDisabled && !readonly" 
                variant="text" 
                size="xs" 
                radius="full" 
                :icon="XMarkIcon" 
                :ariaLabel="loc.multiSelect.clear" 
                tabindex="-1" 
                :class="['shrink-0', affordanceActionClass]" 
                @click.stop="clear" 
            /> 
 
            <ChevronDownIcon 
                v-if="!loading" 
                aria-hidden="true" 
                :class="[ 
                    'shrink-0 transition-transform duration-base ease-standard', 
                    affordanceIconClass,
                    iconSizeClasses, 
                    isOpen ? 'rotate-180' : '', 
                ]" 
            /> 
        </button> 
 
        <!-- Hidden inputs for form integration --> 
        <template v-if="name"> 
            <input 
                v-for="val in modelValue" 
                :key="`hidden-${val}`" 
                type="hidden" 
                :name="`${name}[]`" 
                :value="val" 
            /> 
        </template> 
 
        <!-- Dropdown --> 
        <PopoverPanel 
            :open="isOpen" 
            :style="panelStyle" 
            :radius="radius" 
            role="listbox" 
            :labelledBy="label ? fieldId : undefined" 
            @update:panelRef="panelRef = $event" 
        > 
            <div class="flex flex-col max-h-72"> 
                <div v-if="searchable" class="px-3 py-2 border-b border-border shrink-0"> 
                    <div class="flex items-center gap-2 h-7"> 
                        <MagnifyingGlassIcon 
                            v-if="!isSearching" 
                            :class="['w-4 h-4 shrink-0', affordanceIconClass]" 
                            aria-hidden="true" 
                        /> 
                        <Loader 
                            v-else 
                            size="small" 
                            class="shrink-0 text-primary" 
                        /> 
                        <input 
                            ref="searchEl" 
                            v-model="searchQuery" 
                            type="text" 
                            autocomplete="off" 
                            spellcheck="false" 
                            :placeholder="searchPlaceholder" 
                            class="modo-field-native flex-1 min-w-0 bg-transparent p-0 text-caption text-foreground placeholder:text-muted-foreground" 
                            @keydown="onSearchKeydown" 
                        /> 
                        <Button 
                            v-if="searchQuery" 
                            variant="text" 
                            size="xs" 
                            radius="full" 
                            :icon="XMarkIcon" 
                            :ariaLabel="loc.multiSelect.clearSearch" 
                            tabindex="-1" 
                            :class="['shrink-0', affordanceActionClass]" 
                            @click="searchQuery = ''" 
                        /> 
                    </div> 
                </div> 
 
                <!-- Select all --> 
                <button 
                    v-if="showSelectAll && selectableOptions.length > 0" 
                    type="button" 
                    :class="['flex items-center justify-between gap-2 px-3 py-2 border-b border-border text-caption font-medium text-foreground transition-colors duration-fast ease-standard', optionHover]"
                    @click="toggleAll" 
                > 
                    <span>{{ allSelected ? deselectAllLabel : selectAllLabel }}</span> 
                    <span class="text-muted-foreground"> 
                        {{ selectedCountOfFiltered }} / {{ selectableOptions.length }} 
                    </span> 
                </button> 
 
                <ul 
                    :id="listboxId" 
                    role="listbox" 
                    aria-multiselectable="true" 
                    class="modo-stagger flex-1 overflow-y-auto" 
                    tabindex="-1" 
                > 
                    <template v-if="groupedOptions.length === 0"> 
                        <li class="px-3 py-4 text-caption text-muted-foreground text-center"> 
                            {{ emptyText }} 
                        </li> 
                    </template> 
 
                    <template v-for="(group, gi) in groupedOptions" :key="group.name ?? gi"> 
                        <li 
                            v-if="group.name" 
                            class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" 
                            role="presentation" 
                        > 
                            {{ group.name }} 
                        </li> 
                        <li 
                            v-for="opt in group.items" 
                            :id="optionDomId(opt.value)" 
                            :key="String(opt.value)" 
                            role="option" 
                            :aria-selected="isSelected(opt.value)" 
                            :aria-disabled="isOptionDisabled(opt) || undefined" 
                            :class="[ 
                                'flex items-center gap-2 px-3 py-2 text-body cursor-pointer select-none', 
                                'transition-colors duration-fast ease-standard', 
                                isOptionDisabled(opt)
                                    ? 'text-muted-foreground/60 cursor-not-allowed'
                                    : ['text-foreground', optionHover],
                                activeValue === opt.value && !isOptionDisabled(opt) ? optionSurface : '', 
                                isSelected(opt.value) ? 'font-medium' : '', 
                            ]" 
                            @pointerenter="setActive(opt.value)" 
                            @click="toggleOption(opt)" 
                        > 
                            <!-- Checkbox marker --> 
                            <span 
                                :class="[ 
                                    'shrink-0 inline-flex items-center justify-center w-4 h-4 rounded border transition-colors duration-fast ease-standard', 
                                    isSelected(opt.value) 
                                        ? [checkFillClass, 'border-transparent'] 
                                        : 'border-border bg-transparent', 
                                ]" 
                                aria-hidden="true" 
                            > 
                                <CheckIcon 
                                    v-if="isSelected(opt.value)" 
                                    :class="['w-3 h-3', checkIconClass]" 
                                /> 
                            </span> 
 
                            <component 
                                :is="opt.icon" 
                                v-if="opt.icon" 
                                aria-hidden="true" 
                                :class="['w-4 h-4 shrink-0', affordanceIconClass]" 
                            /> 
                            <div class="flex-1 min-w-0"> 
                                <div class="truncate">{{ opt.label }}</div> 
                                <div v-if="opt.description" class="text-caption text-muted-foreground truncate"> 
                                    {{ opt.description }} 
                                </div> 
                            </div> 
                        </li> 
                    </template> 
                </ul> 
 
                <slot name="footer" /> 
            </div> 
        </PopoverPanel> 
 
        <div v-if="errorText || helperText || maxSelected" class="flex items-start gap-2"> 
            <Typography 
                v-if="errorText" 
                :id="errorId" 
                variant="caption" 
                size="medium" 
                color="danger" 
                as="p" 
                class="flex-1" 
            > 
                {{ errorText }} 
            </Typography> 
            <Typography 
                v-else-if="helperText" 
                :id="helperId" 
                variant="caption" 
                size="medium" 
                color="muted" 
                as="p" 
                class="flex-1" 
            > 
                {{ helperText }} 
            </Typography> 
            <p 
                v-if="maxSelected" 
                class="text-caption text-muted-foreground ml-auto" 
            > 
                {{ modelValue?.length ?? 0 }} / {{ maxSelected }} 
            </p> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, nextTick, ref, useId, watch } from 'vue'; 
import type { MultiSelect, SelectOption, SelectValue } from '../../interfaces/forms/Select.interface'; 
import {
    useFieldState,
    useFieldClasses,
    FIELD_AFFORDANCE_ACTION_BY_COLOR,
    FIELD_AFFORDANCE_ICON_BY_COLOR,
} from '../../composables/useField'; 
import { usePopover } from '../../composables/usePopover'; 
import PopoverPanel from '../layout/PopoverPanel.vue'; 
import Typography from '../data-display/Typography.vue'; 
import Loader from '../feedback/Loader.vue'; 
import Badge from '../feedback/Badge.vue'; 
import { ChevronDownIcon, XMarkIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'; 
import Button from './Button.vue'; 
import { useModoLocale, useResolvedSize } from '../../composables/useModoConfig'; 
 
const loc = useModoLocale(); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: SelectValue[]]; 
    change: [value: SelectValue[]]; 
    open: []; 
    close: []; 
    clear: []; 
}>(); 
 
const props = withDefaults(defineProps<MultiSelect>(), { 
    modelValue: () => [], 
    variant: 'outline', 
    color: 'default', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
    clearable: false, 
    searchable: false, 
    showSelectAll: false, 
    selectAllLabel: 'Select all', 
    deselectAllLabel: 'Deselect all', 
    searchPlaceholder: 'Search…', 
    emptyText: 'No results.', 
    placeholder: 'Select…', 
    autofocus: false, 
    maxVisibleChips: 3, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    isDisabled, 
    errorId, 
    helperId, 
    describedBy, 
} = useFieldState(props, { componentName: 'MultiSelect', idPrefix: 'modo-multiselect' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    forceFocus: () => isOpen.value, 
    halo: () => props.halo, 
}); 
 
/* ---------- Color / radius maps (chip + check) ---------- */ 
 
const CHECK_FILL_BY_STATE: Record<string, string> = { 
    default: 'bg-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
const CHECK_ICON_BY_STATE: Record<string, string> = { 
    default: 'text-background', 
    primary: 'text-primary-foreground', 
    danger: 'text-destructive-foreground', 
    success: 'text-success-foreground', 
    warning: 'text-warning-foreground', 
}; 
const checkFillClass = computed(() => CHECK_FILL_BY_STATE[stateColor.value] ?? 'bg-foreground'); 
const checkIconClass = computed(() => CHECK_ICON_BY_STATE[stateColor.value] ?? 'text-background'); 
const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground');
const affordanceActionClass = computed(() => FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ?? 'text-muted-foreground hover:text-foreground');
 
/** Map field's stateColor to Badge color (identical union). */ 
const badgeColor = computed<'default' | 'primary' | 'danger' | 'success' | 'warning'>(
    () => (stateColor.value as 'default' | 'primary' | 'danger' | 'success' | 'warning'),
);

const OPTION_SURFACE: Record<string, string> = {
    default: 'bg-muted',
    primary: 'bg-primary/10',
    danger:  'bg-destructive/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
};
const OPTION_HOVER: Record<string, string> = {
    default: 'hover:bg-muted',
    primary: 'hover:bg-primary/10',
    danger:  'hover:bg-destructive/10',
    success: 'hover:bg-success/10',
    warning: 'hover:bg-warning/10',
};
const optionSurface = computed(() => OPTION_SURFACE[stateColor.value] ?? 'bg-muted');
const optionHover = computed(() => OPTION_HOVER[stateColor.value] ?? 'hover:bg-muted');

const autoListboxId = useId(); 
const listboxId = computed(() => `modo-multiselect-listbox-${autoListboxId}`); 
const optionDomId = (v: SelectValue) => `${listboxId.value}-opt-${String(v)}`; 
 
const searchQuery = ref(''); 
const isSearching = ref(false); 
let searchingTimer: number | null = null; 
watch(searchQuery, () => { 
    isSearching.value = true; 
    if (searchingTimer !== null) clearTimeout(searchingTimer); 
    searchingTimer = window.setTimeout(() => { 
        isSearching.value = false; 
        searchingTimer = null; 
    }, 220); 
}); 
const searchEl = ref<HTMLInputElement | null>(null); 
 
const selectedSet = computed(() => new Set<SelectValue>(props.modelValue ?? [])); 
 
const selectedOptions = computed<SelectOption[]>(() => 
    props.options.filter((o) => selectedSet.value.has(o.value)), 
); 
 
/* Placeholder visibility: stays hidden while the last chip is still 
 * playing its leave transition, so removing the last selection does not 
 * cause the placeholder text to appear to animate in alongside the chip. */ 
const showPlaceholder = ref(selectedOptions.value.length === 0); 
watch( 
    () => selectedOptions.value.length, 
    (n, prev) => { 
        if (n > 0) { 
            showPlaceholder.value = false; 
        } else if (prev === 0) { 
            // No chip is leaving (e.g. initial state, options swap): show now. 
            showPlaceholder.value = true; 
        } 
        // n === 0 && prev > 0 → wait for @after-leave from TransitionGroup. 
    }, 
); 
function onChipAfterLeave() { 
    if (selectedOptions.value.length === 0) { 
        showPlaceholder.value = true; 
    } 
} 
 
const visibleChips = computed(() => 
    selectedOptions.value.slice(0, props.maxVisibleChips), 
); 
const hiddenChipCount = computed(() => 
    Math.max(0, selectedOptions.value.length - props.maxVisibleChips), 
); 
 
function isSelected(v: SelectValue) { 
    return selectedSet.value.has(v); 
} 
 
const atMax = computed( 
    () => typeof props.maxSelected === 'number' && (props.modelValue?.length ?? 0) >= props.maxSelected, 
); 
 
function isOptionDisabled(opt: SelectOption) { 
    if (opt.disabled) return true; 
    return atMax.value && !isSelected(opt.value); 
} 
 
const filteredOptions = computed(() => { 
    if (!props.searchable || !searchQuery.value.trim()) return props.options; 
    const q = searchQuery.value.trim().toLowerCase(); 
    return props.options.filter( 
        (o) => 
            o.label.toLowerCase().includes(q) || 
            (o.description ? o.description.toLowerCase().includes(q) : false), 
    ); 
}); 
 
interface OptionGroup { 
    name?: string; 
    items: SelectOption[]; 
} 
 
const groupedOptions = computed<OptionGroup[]>(() => { 
    const list = filteredOptions.value; 
    if (!list.some((o) => o.group)) { 
        return list.length ? [{ items: list }] : []; 
    } 
    const map = new Map<string | undefined, SelectOption[]>(); 
    for (const opt of list) { 
        const key = opt.group; 
        if (!map.has(key)) map.set(key, []); 
        map.get(key)!.push(opt); 
    } 
    const groups: OptionGroup[] = []; 
    for (const [name, items] of map) groups.push({ name, items }); 
    return groups; 
}); 
 
const flatOptions = computed<SelectOption[]>(() => 
    groupedOptions.value.flatMap((g) => g.items), 
); 
 
/* Opciones activables para "select all" (las filtradas + no deshabilitadas). */ 
const selectableOptions = computed(() => 
    flatOptions.value.filter((o) => !o.disabled), 
); 
const selectedCountOfFiltered = computed( 
    () => selectableOptions.value.filter((o) => isSelected(o.value)).length, 
); 
const allSelected = computed( 
    () => 
        selectableOptions.value.length > 0 && 
        selectedCountOfFiltered.value === selectableOptions.value.length, 
); 
 
function toggleAll() { 
    if (isDisabled.value || props.readonly) return; 
    const current = new Set<SelectValue>(props.modelValue ?? []); 
    if (allSelected.value) { 
        // Deselect sólo las visibles/filtradas. 
        for (const opt of selectableOptions.value) current.delete(opt.value); 
    } else { 
        // Select todas las filtradas, respetando maxSelected. 
        for (const opt of selectableOptions.value) { 
            if ( 
                typeof props.maxSelected === 'number' && 
                current.size >= props.maxSelected 
            ) break; 
            current.add(opt.value); 
        } 
    } 
    const next = Array.from(current); 
    emit('update:modelValue', next); 
    emit('change', next); 
} 
 
/* ---------- Popover ---------- */ 
 
const { 
    triggerRef, 
    panelRef, 
    isOpen, 
    panelStyle, 
    open: openPopover, 
    close: closePopover, 
    toggle: togglePopover, 
} = usePopover({ 
    placement: 'bottom-start', 
    matchTriggerWidth: true, 
    onOpen: () => { 
        emit('open'); 
        const initial = 
            selectedOptions.value[0] ?? flatOptions.value.find((o) => !isOptionDisabled(o)); 
        activeValue.value = initial ? initial.value : null; 
        nextTick(() => { 
            if (props.searchable) searchEl.value?.focus(); 
            scrollActiveIntoView(); 
        }); 
    }, 
    onClose: () => { 
        emit('close'); 
        searchQuery.value = ''; 
    }, 
}); 
 
const triggerEl = ref<HTMLButtonElement | null>(null); 
watch(triggerEl, (el) => (triggerRef.value = el)); 
 
const activeValue = ref<SelectValue | null>(null); 
const activeId = computed(() => 
    activeValue.value !== null ? optionDomId(activeValue.value) : '', 
); 
 
function setActive(v: SelectValue) { 
    activeValue.value = v; 
} 
 
function scrollActiveIntoView() { 
    if (activeValue.value === null) return; 
    const el = document.getElementById(optionDomId(activeValue.value)); 
    el?.scrollIntoView({ block: 'nearest' }); 
} 
 
/* ---------- Actions ---------- */ 
 
function openAndFocus() { 
    if (isDisabled.value || props.readonly) return; 
    if (!isOpen.value) openPopover(); 
    triggerEl.value?.focus(); 
} 
 
function onTriggerClick() { 
    if (isDisabled.value || props.readonly) return; 
    togglePopover(); 
} 
 
function toggleOption(opt: SelectOption) { 
    console.log('toggleOption', opt);
    if (isOptionDisabled(opt)) return; 
    const current = [...(props.modelValue ?? [])]; 
    const idx = current.indexOf(opt.value); 
    if (idx >= 0) { 
        current.splice(idx, 1); 
    } else { 
        current.push(opt.value); 
    } 
    emit('update:modelValue', current); 
    emit('change', current); 
} 
 
function removeValue(v: SelectValue) { 
    isOpen.value = false;
    event?.stopPropagation();
    const current = (props.modelValue ?? []).filter((x) => x !== v); 
    emit('update:modelValue', current); 
    emit('change', current); 
} 
 
function clear() { 
    emit('update:modelValue', []); 
    emit('change', []); 
    emit('clear'); 
    triggerEl.value?.focus(); 
} 
 
/* ---------- Keyboard ---------- */ 
 
function moveActive(direction: 1 | -1) { 
    const list = flatOptions.value.filter((o) => !isOptionDisabled(o)); 
    if (list.length === 0) return; 
    const currentIdx = list.findIndex((o) => o.value === activeValue.value); 
    let nextIdx: number; 
    if (currentIdx === -1) { 
        nextIdx = direction > 0 ? 0 : list.length - 1; 
    } else { 
        nextIdx = (currentIdx + direction + list.length) % list.length; 
    } 
    activeValue.value = list[nextIdx].value; 
    scrollActiveIntoView(); 
} 
 
function jumpTo(pos: 'first' | 'last') { 
    const list = flatOptions.value.filter((o) => !isOptionDisabled(o)); 
    if (list.length === 0) return; 
    activeValue.value = pos === 'first' ? list[0].value : list[list.length - 1].value; 
    scrollActiveIntoView(); 
} 
 
let typeaheadBuffer = ''; 
let typeaheadTimer: number | null = null; 
function typeaheadJump(key: string) { 
    if (typeaheadTimer !== null) clearTimeout(typeaheadTimer); 
    typeaheadBuffer += key.toLowerCase(); 
    typeaheadTimer = window.setTimeout(() => { 
        typeaheadBuffer = ''; 
        typeaheadTimer = null; 
    }, 500); 
 
    const match = flatOptions.value.find( 
        (o) => !isOptionDisabled(o) && o.label.toLowerCase().startsWith(typeaheadBuffer), 
    ); 
    if (match) { 
        activeValue.value = match.value; 
        scrollActiveIntoView(); 
    } 
} 
 
function onTriggerKeydown(e: KeyboardEvent) { 
    if (isDisabled.value || props.readonly) return; 
 
    // Backspace en trigger vacío: elimina la última selección. 
    if (!isOpen.value && e.key === 'Backspace' && selectedOptions.value.length > 0) { 
        e.preventDefault(); 
        const current = [...(props.modelValue ?? [])]; 
        current.pop(); 
        emit('update:modelValue', current); 
        emit('change', current); 
        return; 
    } 
 
    if (!isOpen.value) { 
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { 
            e.preventDefault(); 
            openPopover(); 
        } 
        return; 
    } 
 
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
            jumpTo('first'); 
            break; 
        case 'End': 
            e.preventDefault(); 
            jumpTo('last'); 
            break; 
        case 'Enter': 
        case ' ': { 
            e.preventDefault(); 
            const opt = flatOptions.value.find((o) => o.value === activeValue.value); 
            if (opt) toggleOption(opt); 
            break; 
        } 
        case 'Tab': 
            closePopover(); 
            break; 
        default: 
            if (!props.searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { 
                typeaheadJump(e.key); 
            } 
            break; 
    } 
} 
 
function onSearchKeydown(e: KeyboardEvent) { 
    switch (e.key) { 
        case 'ArrowDown': 
            e.preventDefault(); 
            moveActive(1); 
            break; 
        case 'ArrowUp': 
            e.preventDefault(); 
            moveActive(-1); 
            break; 
        case 'Enter': { 
            e.preventDefault(); 
            const opt = flatOptions.value.find((o) => o.value === activeValue.value); 
            if (opt) toggleOption(opt); 
            break; 
        } 
        case 'Backspace': 
            if (!searchQuery.value && selectedOptions.value.length > 0) { 
                e.preventDefault(); 
                const current = [...(props.modelValue ?? [])]; 
                current.pop(); 
                emit('update:modelValue', current); 
                emit('change', current); 
            } 
            break; 
        case 'Escape': 
            break; 
    } 
} 
 
watch(filteredOptions, (list) => { 
    if (!list.find((o) => o.value === activeValue.value)) { 
        activeValue.value = list.find((o) => !isOptionDisabled(o))?.value ?? null; 
    } 
}); 
 
/* ---------- Classes ---------- */ 
 
const wrapperSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'min-h-8 px-2.5 py-1'; 
        case 'large': return 'min-h-12 px-4 py-1.5'; 
        default: return 'min-h-10 px-3 py-1'; 
    } 
}); 
 
const inputTextClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'text-caption'; 
        case 'large': return 'text-body-lg'; 
        default: return 'text-body'; 
    } 
}); 
 
const iconSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-4 h-4'; 
        case 'large': return 'w-5 h-5'; 
        default: return 'w-4 h-4'; 
    } 
}); 
 
defineExpose({ 
    open: openPopover, 
    close: closePopover, 
    toggle: togglePopover, 
    focus: () => triggerEl.value?.focus(), 
    triggerEl, 
}); 
</script> 
 
<style scoped> 
/* Chip transitions for enter/leave + move. */ 
.modo-chip-enter-active, 
.modo-chip-leave-active { 
    transition: 
        transform 280ms cubic-bezier(0.2, 0, 0, 1), 
        opacity 240ms cubic-bezier(0.2, 0, 0, 1), 
        margin 280ms cubic-bezier(0.2, 0, 0, 1), 
        max-width 280ms cubic-bezier(0.2, 0, 0, 1); 
} 
.modo-chip-move { 
    transition: transform 320ms cubic-bezier(0.2, 0, 0, 1); 
} 
.modo-chip-enter-from, 
.modo-chip-leave-to { 
    opacity: 0; 
    transform: scale(0.7) translateY(-2px); 
    /* Collapse the space smoothly so siblings can slide in. */ 
    max-width: 0; 
    margin-left: -0.125rem; 
    margin-right: -0.125rem; 
} 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-chip-enter-active, 
    .modo-chip-leave-active, 
    .modo-chip-move { 
        transition: none; 
    } 
    .modo-chip-enter-from, 
    .modo-chip-leave-to { 
        opacity: 1; 
        transform: none; 
        max-width: none; 
        margin: 0; 
    } 
} 
</style>
