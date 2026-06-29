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
                'modo-field-wrapper flex items-center gap-2 text-left', 
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
 
            <component 
                :is="selectedOption.icon" 
                v-if="selectedOption && selectedOption.icon" 
                aria-hidden="true" 
                :class="['shrink-0', affordanceIconClass, iconSizeClasses]" 
            /> 
 
            <span 
                v-if="selectedOption" 
                :class="['flex-1 min-w-0 truncate text-foreground', inputTextClasses]" 
            > 
                {{ selectedOption.label }} 
            </span> 
            <span 
                v-else 
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
                v-else-if="clearable && selectedOption && !isDisabled && !readonly" 
                variant="text" 
                size="xs" 
                radius="full" 
                :icon="XMarkIcon" 
                :ariaLabel="loc.select.clear" 
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
 
        <!-- Hidden native input for form integration --> 
        <input 
            v-if="name" 
            type="hidden" 
            :name="name" 
            :value="modelValue ?? ''" 
        /> 
 
        <!-- Dropdown --> 
        <PopoverPanel 
            :open="isOpen" 
            :style="mergedPanelStyle" 
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
                            :ariaLabel="loc.select.clearSearch" 
                            tabindex="-1" 
                            :class="['shrink-0', affordanceActionClass]" 
                            @click="searchQuery = ''" 
                        /> 
                    </div> 
                </div> 
 
                <ul 
                    :id="listboxId" 
                    role="listbox" 
                    class="modo-stagger flex-1 overflow-y-auto" 
                    tabindex="-1" 
                > 
                    <template v-if="groupedOptions.length === 0"> 
                        <li class="px-3 py-4 text-caption text-muted-foreground text-center"> 
                            {{ emptyText ?? loc.select.empty }} 
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
                            :aria-selected="opt.value === modelValue" 
                            :aria-disabled="opt.disabled || undefined" 
                            :class="[ 
                                'flex items-center gap-2 px-3 py-2 text-body cursor-pointer select-none', 
                                'transition-colors duration-fast ease-standard', 
                                opt.disabled
                                    ? 'text-muted-foreground/60 cursor-not-allowed'
                                    : ['text-foreground', optionHover],
                                activeValue === opt.value && !opt.disabled ? optionSurface : '', 
                                opt.value === modelValue ? 'font-medium' : '', 
                            ]" 
                            @pointerenter="setActive(opt.value)" 
                            @click="selectOption(opt)" 
                        > 
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
                            <CheckIcon 
                                v-if="opt.value === modelValue" 
                                :class="['w-4 h-4 shrink-0', checkColorClass]" 
                                aria-hidden="true" 
                            /> 
                        </li> 
                    </template> 
                </ul> 
 
                <slot name="footer" /> 
            </div> 
        </PopoverPanel> 
 
        <div v-if="errorText || helperText" class="flex items-start gap-2"> 
            <Typography 
                v-if="errorText" 
                :id="errorId" 
                variant="caption" 
                size="medium" 
                color="danger" 
                as="p" 
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
            > 
                {{ helperText }} 
            </Typography> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, nextTick, ref, useId, watch } from 'vue'; 
import type { Select, SelectOption, SelectValue } from '../../interfaces/forms/Select.interface'; 
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
import Button from './Button.vue'; 
import { ChevronDownIcon, XMarkIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'; 
import { useModoLocale, useSizeTokens } from '../../composables/useModoConfig';

const loc = useModoLocale(); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: SelectValue | null]; 
    change: [value: SelectValue | null]; 
    open: []; 
    close: []; 
    clear: []; 
}>(); 
 
const props = withDefaults(defineProps<Select>(), { 
    variant: 'outline', 
    color: 'default', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
    clearable: false, 
    searchable: false, 
    searchPlaceholder: 'Search…', 
    // emptyText falls back to locale when undefined. 
    placeholder: 'Select…', 
    autofocus: false, 
    panelWidth: 'trigger', 
}); 
 
const sz = useSizeTokens(() => props.size); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    isDisabled, 
    errorId, 
    helperId, 
    describedBy, 
} = useFieldState(props, { componentName: 'Select', idPrefix: 'modo-select' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    forceFocus: () => isOpen.value, 
    halo: () => props.halo, 
}); 
 
const CHECK_COLOR_BY_STATE: Record<string, string> = { 
    default: 'text-foreground', 
    primary: 'text-primary', 
    danger: 'text-destructive', 
    success: 'text-success', 
    warning: 'text-warning', 
}; 
const checkColorClass = computed(() => CHECK_COLOR_BY_STATE[stateColor.value] ?? 'text-foreground');
const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground');
const affordanceActionClass = computed(() => FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ?? 'text-muted-foreground hover:text-foreground');

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
const listboxId = computed(() => `modo-select-listbox-${autoListboxId}`); 
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
 
const selectedOption = computed<SelectOption | undefined>(() => 
    props.options.find((o) => o.value === props.modelValue), 
); 
 
const filteredOptions = computed(() => { 
    if (!props.searchable || !searchQuery.value.trim()) return props.options; 
    const q = searchQuery.value.trim().toLowerCase(); 
    return props.options.filter((o) => 
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
 
/** Lista plana (en orden de render) para navegación de teclado. */ 
const flatOptions = computed<SelectOption[]>(() => 
    groupedOptions.value.flatMap((g) => g.items), 
); 
 
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
    matchTriggerWidth: props.panelWidth === 'trigger', 
    onOpen: () => { 
        emit('open'); 
        // Enfocar el valor seleccionado si existe, si no la primera activable. 
        const initial = 
            selectedOption.value ?? 
            flatOptions.value.find((o) => !o.disabled); 
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
 
// El triggerRef de usePopover es un alias del elemento button. 
const triggerEl = ref<HTMLButtonElement | null>(null); 
watch(triggerEl, (el) => (triggerRef.value = el)); 
 
const mergedPanelStyle = computed(() => { 
    const base = { ...panelStyle.value } as Record<string, string>; 
    if (props.panelMinWidth !== undefined) { 
        base.minWidth = typeof props.panelMinWidth === 'number' 
            ? `${props.panelMinWidth}px` 
            : props.panelMinWidth; 
    } 
    return base; 
}); 
 
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
 
function selectOption(opt: SelectOption) { 
    if (opt.disabled) return; 
    emit('update:modelValue', opt.value); 
    emit('change', opt.value); 
    closePopover(); 
    triggerEl.value?.focus(); 
} 
 
function clear() { 
    emit('update:modelValue', null); 
    emit('change', null); 
    emit('clear'); 
    triggerEl.value?.focus(); 
} 
 
/* ---------- Keyboard ---------- */ 
 
function moveActive(direction: 1 | -1) { 
    const list = flatOptions.value.filter((o) => !o.disabled); 
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
    const list = flatOptions.value.filter((o) => !o.disabled); 
    if (list.length === 0) return; 
    activeValue.value = pos === 'first' ? list[0].value : list[list.length - 1].value; 
    scrollActiveIntoView(); 
} 
 
/** Typeahead cuando no searchable: salta a la primera opción cuyo label empiece con la letra. */ 
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
        (o) => !o.disabled && o.label.toLowerCase().startsWith(typeaheadBuffer), 
    ); 
    if (match) { 
        activeValue.value = match.value; 
        scrollActiveIntoView(); 
    } 
} 
 
function onTriggerKeydown(e: KeyboardEvent) { 
    if (isDisabled.value || props.readonly) return; 
 
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
            if (opt) selectOption(opt); 
            break; 
        } 
        case 'Tab': 
            closePopover(); 
            break; 
        default: 
            // Typeahead (sólo si no hay buscador activo y es un carácter imprimible). 
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
            if (opt) selectOption(opt); 
            break; 
        } 
        case 'Escape': 
            // Deja que el popover maneje el cierre global. 
            break; 
    } 
} 
 
/* Reset activo si la query filtra al activo fuera de la lista. */ 
watch(filteredOptions, (list) => { 
    if (!list.find((o) => o.value === activeValue.value)) { 
        activeValue.value = list.find((o) => !o.disabled)?.value ?? null; 
    } 
}); 
 
/* ---------- Classes ---------- */

const wrapperSizeClasses = computed(() => `${sz.value.control} ${sz.value.padX}`);
const inputTextClasses = computed(() => sz.value.text);
const iconSizeClasses = computed(() => sz.value.icon); 
 
defineExpose({ 
    open: openPopover, 
    close: closePopover, 
    toggle: togglePopover, 
    focus: () => triggerEl.value?.focus(), 
    triggerEl, 
}); 
</script>
