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
 
        <button 
            :id="fieldId" 
            ref="triggerEl" 
            type="button" 
            :disabled="isDisabled" 
            :aria-label="!label ? ariaLabel : undefined" 
            :aria-invalid="hasError || undefined" 
            :aria-describedby="describedBy" 
            :aria-required="required || undefined" 
            :aria-haspopup="'dialog'" 
            :aria-expanded="isOpen" 
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
                :is="iconLeft ?? ClockIcon" 
                aria-hidden="true" 
                :class="['shrink-0', affordanceIconClass, iconSizeClasses]" 
            /> 
 
            <span 
                v-if="modelValue" 
                :class="['flex-1 min-w-0 truncate text-foreground', inputTextClasses]" 
            > 
                {{ displayText }} 
            </span> 
            <span
                v-else
                :class="['flex-1 min-w-0 truncate text-muted-foreground', inputTextClasses]"
            >
                {{ resolvedPlaceholder }}
            </span> 
 
            <Loader 
                v-if="loading" 
                :size="size === 'large' ? 'medium' : 'small'" 
                :class="['shrink-0', affordanceIconClass]" 
            /> 
            <Button 
                v-else-if="clearable && modelValue && !isDisabled && !readonly" 
                variant="text" 
                size="xs" 
                radius="full" 
                :icon="XMarkIcon" 
                :ariaLabel="loc.dateTimeField.clear" 
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
 
        <PopoverPanel 
            :open="isOpen" 
            :style="panelStyle" 
            :radius="radius" 
            role="dialog" 
            :labelledBy="label ? fieldId : undefined" 
            @update:panelRef="panelRef = $event" 
        > 
            <div class="p-2"> 
                <DateTimePicker 
                    :modelValue="modelValue ?? null" 
                    :locale="locale" 
                    :first-day-of-week="firstDayOfWeek" 
                    :min-date="minDate" 
                    :max-date="maxDate" 
                    :disabled-dates="disabledDates" 
                    :format="format" 
                    :step="step" 
                    :show-seconds="showSeconds" 
                    :min-time="minTime"
                    :max-time="maxTime"
                    :time-only="timeOnly"
                    :color="stateColor === 'default' ? 'default' : (stateColor as 'primary' | 'danger' | 'success' | 'warning')" 
                    variant="filled" 
                    :radius="radius" 
                    @update:modelValue="onPickerUpdate" 
                /> 
            </div> 
        </PopoverPanel> 
 
        <div v-if="errorText || helperText" class="flex items-start gap-2"> 
            <Typography v-if="errorText" :id="errorId" variant="caption" size="medium" color="danger" as="p">{{ errorText }}</Typography> 
            <Typography v-else-if="helperText" :id="helperId" variant="caption" size="medium" color="muted" as="p">{{ helperText }}</Typography> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref, watch } from 'vue'; 
import type { DateTimeField } from '../../interfaces/forms/DateTimeField.interface'; 
import {
    useFieldState,
    useFieldClasses,
    FIELD_AFFORDANCE_ACTION_BY_COLOR,
    FIELD_AFFORDANCE_ICON_BY_COLOR,
} from '../../composables/useField'; 
import { usePopover } from '../../composables/usePopover'; 
import PopoverPanel from '../layout/PopoverPanel.vue'; 
import DateTimePicker from '../data-display/date-picker/DateTimePicker.vue'; 
import Typography from '../data-display/Typography.vue'; 
import Loader from '../feedback/Loader.vue'; 
import { ClockIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/vue/24/outline'; 
import Button from './Button.vue'; 
import { useModoLocale, useResolvedSize } from '../../composables/useModoConfig'; 
 
const loc = useModoLocale(); 
 
const props = withDefaults(defineProps<DateTimeField>(), {
    modelValue: null,
    dateFormat: 'medium',
    timeFormat: 'short',
    separator: ' · ',
    format: '24h',
    step: 5,
    showSeconds: false,
    variant: 'outline',
    color: 'default',
    disabled: false,
    readonly: false,
    required: false,
    loading: false,
    fullWidth: false,
    clearable: false,
    timeOnly: false,
    autofocus: false,
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: Date | null]; 
    change: [value: Date | null]; 
    open: []; 
    close: []; 
    clear: []; 
}>(); 
 
const { 
    fieldId, radius, stateColor, hasError, isDisabled, 
    errorId, helperId, describedBy, 
} = useFieldState(props, { componentName: 'DateTimeField', idPrefix: 'modo-datetime' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, hasError, radius, 
    forceFocus: () => isOpen.value, 
    halo: () => props.halo, 
}); 

const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground');
const affordanceActionClass = computed(() => FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ?? 'text-muted-foreground hover:text-foreground');

const resolvedPlaceholder = computed(() =>
    props.placeholder ?? (props.timeOnly ? 'Select time…' : 'Select date and time…')
);

const triggerEl = ref<HTMLButtonElement | null>(null); 
 
const { 
    triggerRef, panelRef, isOpen, panelStyle, 
    open: openPopover, close: closePopover, toggle: togglePopover, 
} = usePopover({ 
    placement: 'bottom-start', 
    onOpen: () => emit('open'), 
    onClose: () => emit('close'), 
}); 
watch(triggerEl, (el) => (triggerRef.value = el)); 
 
function onTriggerClick() { 
    if (isDisabled.value || props.readonly) return; 
    togglePopover(); 
} 
function onTriggerKeydown(e: KeyboardEvent) { 
    if (isDisabled.value || props.readonly) return; 
    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { 
        e.preventDefault(); 
        if (!isOpen.value) openPopover(); 
    } else if (e.key === 'Escape' && isOpen.value) { 
        e.preventDefault(); 
        closePopover(); 
    } 
} 
function openAndFocus() { 
    if (isDisabled.value || props.readonly) return; 
    if (!isOpen.value) openPopover(); 
    triggerEl.value?.focus(); 
} 
 
function onPickerUpdate(value: Date | null) { 
    emit('update:modelValue', value); 
    emit('change', value); 
    // No cerramos auto: el usuario suele ajustar la hora después de elegir el día. 
} 
 
function clear() { 
    emit('update:modelValue', null); 
    emit('change', null); 
    emit('clear'); 
    triggerEl.value?.focus(); 
} 
 
/* ---------- Formatting ---------- */ 
 
const displayText = computed(() => {
    if (!props.modelValue) return '';
    const locale = props.locale ?? undefined;

    const timePart = (() => {
        const f = props.timeFormat;
        if (typeof f === 'function') return f(props.modelValue!);
        const opts: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: props.format === '12h',
        };
        if (f === 'medium' || props.showSeconds) opts.second = '2-digit';
        return new Intl.DateTimeFormat(locale, opts).format(props.modelValue!);
    })();

    if (props.timeOnly) return timePart;

    const datePart = (() => {
        const f = props.dateFormat;
        if (typeof f === 'function') return f(props.modelValue!);
        switch (f) {
            case 'short':
                return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(props.modelValue!);
            case 'long':
                return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(props.modelValue!);
            case 'iso': {
                const y = props.modelValue!.getFullYear();
                const m = String(props.modelValue!.getMonth() + 1).padStart(2, '0');
                const d = String(props.modelValue!.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
            case 'medium':
            default:
                return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(props.modelValue!);
        }
    })();

    return `${datePart}${props.separator}${timePart}`;
}); 
 
/* ---------- Size maps ---------- */ 
const wrapperSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'h-8 px-2.5'; 
        case 'large': return 'h-12 px-4'; 
        default: return 'h-10 px-3'; 
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
</script>
