<template> 
    <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']"> 
        <label 
            v-if="label" 
            :for="fieldId" 
            class="text-caption font-medium text-foreground" 
        > 
            {{ label }} 
            <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
        </label> 
 
        <div 
            role="group" 
            :aria-labelledby="label ? undefined : undefined" 
            :class="[ 
                'modo-field-wrapper flex items-center gap-2', 
                wrapperVariantClasses, 
                wrapperSizeClasses, 
                radiusClasses, 
                fullWidth ? 'w-full' : '', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : '', 
            ]" 
        > 
            <!-- Stepper izquierdo (split) --> 
            <Button 
                v-if="steppers && stepperPosition === 'split'" 
                variant="text" 
                :size="stepperButtonSize" 
                radius="medium" 
                :icon="MinusIcon" 
                :ariaLabel="loc.numberInput.decrement" 
                :disabled="isDisabled || readonly || !canDecrement" 
                tabindex="-1" 
                :class="['shrink-0', affordanceActionClass]" 
                @pointerdown.prevent="startHold(-1)" 
                @pointerup="stopHold" 
                @pointerleave="stopHold" 
                @pointercancel="stopHold" 
            /> 
 
            <component 
                :is="iconLeft" 
                v-if="iconLeft" 
                aria-hidden="true" 
                :class="['shrink-0', affordanceIconClass, iconSizeClasses]" 
            /> 
            <span 
                v-if="prefix" 
                aria-hidden="true" 
                class="shrink-0 text-muted-foreground select-none" 
            > 
                {{ prefix }} 
            </span> 
 
            <input 
                :id="fieldId" 
                ref="inputRef" 
                type="text" 
                inputmode="decimal" 
                :value="displayValue" 
                :placeholder="placeholder" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :autocomplete="autocomplete" 
                :autofocus="autofocus" 
                role="spinbutton" 
                :aria-valuenow="modelValue ?? undefined" 
                :aria-valuemin="min" 
                :aria-valuemax="max" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                :aria-required="required || undefined" 
                :class="[ 
                    'modo-field-native flex-1 min-w-0 bg-transparent p-0', 
                    'text-foreground placeholder:text-muted-foreground', 
                    'disabled:cursor-not-allowed tabular-nums', 
                    inputTextClasses, 
                ]" 
                @input="onInput" 
                @keydown="onKeydown" 
                @blur="onBlur" 
                @focus="onFocus" 
            /> 
 
            <span 
                v-if="suffix" 
                aria-hidden="true" 
                class="shrink-0 text-muted-foreground select-none" 
            > 
                {{ suffix }} 
            </span> 
 
            <Loader 
                v-if="loading" 
                :size="size === 'large' ? 'medium' : 'small'" 
                :class="['shrink-0', affordanceIconClass]" 
            /> 
 
            <!-- Steppers a la derecha (right) --> 
            <div 
                v-if="steppers && stepperPosition === 'right' && !loading" 
                class="flex flex-col shrink-0 -my-1" 
            > 
                <button 
                    type="button" 
                    :class="stackedStepperClasses" 
                    :aria-label="loc.numberInput.increment" 
                    :disabled="isDisabled || readonly || !canIncrement" 
                    tabindex="-1" 
                    @pointerdown.prevent="startHold(1)" 
                    @pointerup="stopHold" 
                    @pointerleave="stopHold" 
                    @pointercancel="stopHold" 
                > 
                    <ChevronUpIcon class="w-3 h-3" aria-hidden="true" /> 
                </button> 
                <button 
                    type="button" 
                    :class="stackedStepperClasses" 
                    :aria-label="loc.numberInput.decrement" 
                    :disabled="isDisabled || readonly || !canDecrement" 
                    tabindex="-1" 
                    @pointerdown.prevent="startHold(-1)" 
                    @pointerup="stopHold" 
                    @pointerleave="stopHold" 
                    @pointercancel="stopHold" 
                > 
                    <ChevronDownIcon class="w-3 h-3" aria-hidden="true" /> 
                </button> 
            </div> 
 
            <!-- Stepper derecho (split) --> 
            <Button 
                v-if="steppers && stepperPosition === 'split' && !loading" 
                variant="text" 
                :size="stepperButtonSize" 
                radius="medium" 
                :icon="PlusIcon" 
                :ariaLabel="loc.numberInput.increment" 
                :disabled="isDisabled || readonly || !canIncrement" 
                tabindex="-1" 
                :class="['shrink-0', affordanceActionClass]" 
                @pointerdown.prevent="startHold(1)" 
                @pointerup="stopHold" 
                @pointerleave="stopHold" 
                @pointercancel="stopHold" 
            /> 
        </div> 
 
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'; 
import type { NumberInput } from '../../interfaces/forms/NumberInput.interface'; 
import {
    useFieldState,
    useFieldClasses,
    FIELD_AFFORDANCE_ACTION_BY_COLOR,
    FIELD_AFFORDANCE_ICON_BY_COLOR,
} from '../../composables/useField'; 
import { useModoLocale, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig';
import Loader from '../feedback/Loader.vue'; 
import Button from './Button.vue'; 
import { ChevronUpIcon, ChevronDownIcon, MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'; 
import Typography from '../data-display/Typography.vue'; 
 
const loc = useModoLocale(); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: number | null]; 
    change: [value: number | null]; 
    focus: [event: FocusEvent]; 
    blur: [event: FocusEvent]; 
}>(); 
 
const props = withDefaults(defineProps<NumberInput>(), { 
    variant: 'outline', 
    color: 'default', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
    step: 1, 
    steppers: true, 
    stepperPosition: 'right', 
    allowInvalid: false, 
    thousandSeparator: false, 
    autofocus: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size);

const inputRef = ref<HTMLInputElement | null>(null); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    isDisabled, 
    errorId, 
    helperId, 
    describedBy, 
} = useFieldState(props, { componentName: 'NumberInput', idPrefix: 'modo-number' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    halo: () => props.halo, 
}); 

const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground');
const affordanceActionClass = computed(() => FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ?? 'text-muted-foreground hover:text-foreground');
 
/** Texto en edición. Separado del modelValue para permitir 
 *  estados intermedios ("-", "1.", "1,5", vacío…). */ 
const rawText = ref(''); 
const focused = ref(false); 
 
const canIncrement = computed(() => { 
    if (props.max === undefined) return true; 
    const v = props.modelValue ?? props.min ?? 0; 
    return v + props.step <= props.max + 1e-9; 
}); 
const canDecrement = computed(() => { 
    if (props.min === undefined) return true; 
    const v = props.modelValue ?? props.max ?? 0; 
    return v - props.step >= props.min - 1e-9; 
}); 
 
/** Qué texto pintar en el input. */ 
const displayValue = computed(() => { 
    if (focused.value) return rawText.value; 
    const v = props.modelValue; 
    if (v === null || v === undefined || Number.isNaN(v)) return ''; 
    return formatNumber(v); 
}); 
 
function formatNumber(v: number): string { 
    let str: string; 
    if (props.precision !== undefined) { 
        str = v.toFixed(props.precision); 
    } else { 
        str = String(v); 
    } 
    if (props.thousandSeparator) { 
        const [intPart, decPart] = str.split('.'); 
        const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ','); 
        str = decPart !== undefined ? `${withSep}.${decPart}` : withSep; 
    } 
    return str; 
} 
 
/** Convierte texto libre a number o null. Acepta `,` como decimal. */ 
function parseNumber(text: string): number | null { 
    if (text == null) return null; 
    const trimmed = String(text).trim(); 
    if (trimmed === '' || trimmed === '-' || trimmed === '.') return null; 
    const normalized = trimmed.replace(/,/g, '.').replace(/\s/g, ''); 
    // Solo permitimos un signo inicial y un punto. 
    if (!/^-?\d*(\.\d*)?$/.test(normalized)) return null; 
    const n = Number(normalized); 
    return Number.isFinite(n) ? n : null; 
} 
 
function clamp(v: number): number { 
    let r = v; 
    if (props.min !== undefined && r < props.min) r = props.min; 
    if (props.max !== undefined && r > props.max) r = props.max; 
    return r; 
} 
 
/** Redondea al múltiplo de step más cercano, relativo a `min` si existe. */ 
function snapToStep(v: number): number { 
    if (!props.step || props.step <= 0) return v; 
    const base = props.min ?? 0; 
    const steps = Math.round((v - base) / props.step); 
    const snapped = base + steps * props.step; 
    // Evita errores de punto flotante (0.1 + 0.2…). 
    const digits = (String(props.step).split('.')[1] || '').length; 
    return Number(snapped.toFixed(digits)); 
} 
 
function onInput(e: Event) { 
    const target = e.target as HTMLInputElement; 
    rawText.value = target.value; 
    const parsed = parseNumber(target.value); 
    if (parsed === null) { 
        // Permitir vacío → null; estados intermedios no emiten. 
        if (target.value.trim() === '') emit('update:modelValue', null); 
        return; 
    } 
    const next = props.allowInvalid ? parsed : clamp(parsed); 
    emit('update:modelValue', next); 
} 
 
function onFocus(e: FocusEvent) { 
    focused.value = true; 
    rawText.value = 
        props.modelValue === null || props.modelValue === undefined 
            ? '' 
            : String(props.modelValue); 
    emit('focus', e); 
} 
 
function onBlur(e: FocusEvent) { 
    focused.value = false; 
    const parsed = parseNumber(rawText.value); 
    if (parsed === null) { 
        if (rawText.value.trim() === '') { 
            emit('update:modelValue', null); 
            emit('change', null); 
        } 
        return; 
    } 
    const final = clamp(snapToStep(parsed)); 
    if (final !== props.modelValue) { 
        emit('update:modelValue', final); 
    } 
    emit('change', final); 
    emit('blur', e); 
} 
 
function stepBy(direction: 1 | -1, multiplier = 1) { 
    if (props.readonly || isDisabled.value) return; 
    const current = 
        props.modelValue ?? 
        (direction > 0 ? props.min ?? 0 : props.max ?? 0); 
    const delta = props.step * multiplier * direction; 
    const next = clamp(snapToStep(current + delta)); 
    const digits = (String(props.step).split('.')[1] || '').length; 
    const rounded = Number(next.toFixed(Math.max(digits, props.precision ?? 0))); 
    if (rounded !== props.modelValue) { 
        emit('update:modelValue', rounded); 
    } 
    if (focused.value) rawText.value = String(rounded); 
} 
 
function onKeydown(e: KeyboardEvent) { 
    if (props.readonly || isDisabled.value) return; 
    const mult = e.shiftKey ? 10 : 1; 
    switch (e.key) { 
        case 'ArrowUp': 
            e.preventDefault(); 
            stepBy(1, mult); 
            break; 
        case 'ArrowDown': 
            e.preventDefault(); 
            stepBy(-1, mult); 
            break; 
        case 'PageUp': 
            e.preventDefault(); 
            stepBy(1, 10); 
            break; 
        case 'PageDown': 
            e.preventDefault(); 
            stepBy(-1, 10); 
            break; 
        case 'Home': 
            if (props.min !== undefined) { 
                e.preventDefault(); 
                emit('update:modelValue', props.min); 
                rawText.value = String(props.min); 
            } 
            break; 
        case 'End': 
            if (props.max !== undefined) { 
                e.preventDefault(); 
                emit('update:modelValue', props.max); 
                rawText.value = String(props.max); 
            } 
            break; 
    } 
} 
 
/** Hold-to-repeat con aceleración. */ 
let holdTimeout: number | null = null; 
let holdInterval: number | null = null; 
 
function startHold(direction: 1 | -1) { 
    stepBy(direction); 
    holdTimeout = window.setTimeout(() => { 
        holdInterval = window.setInterval(() => stepBy(direction), 80); 
    }, 400); 
} 
 
function stopHold() { 
    if (holdTimeout !== null) { 
        clearTimeout(holdTimeout); 
        holdTimeout = null; 
    } 
    if (holdInterval !== null) { 
        clearInterval(holdInterval); 
        holdInterval = null; 
    } 
} 
 
onBeforeUnmount(stopHold); 
 
// Sync externo: si cambian min/max, reclampar. 
watch( 
    () => [props.min, props.max] as const, 
    () => { 
        if (props.modelValue === null || props.modelValue === undefined) return; 
        const clamped = clamp(props.modelValue); 
        if (clamped !== props.modelValue) emit('update:modelValue', clamped); 
    }, 
); 
 
/* ---------- Classes ---------- */ 
 
const wrapperSizeClasses = computed(() => `${sz.value.control} ${sz.value.padX}`);

const inputTextClasses = computed(() => sz.value.text);

const iconSizeClasses = computed(() => sz.value.icon); 
 
const stepperButtonSize = computed<'xs' | 'small'>(() => (resolvedSize.value === 'large' ? 'small' : 'xs')); 
 
const stackedStepperClasses = computed(() => [ 
    'inline-flex items-center justify-center w-6 h-4', 
    affordanceActionClass.value,
    stateColor.value === 'default' ? 'hover:bg-foreground/10' : '',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring', 
    'disabled:opacity-40 disabled:pointer-events-none', 
    'transition-colors duration-base ease-standard rounded-sm', 
]); 
 
defineExpose({ 
    focus: () => inputRef.value?.focus(), 
    blur: () => inputRef.value?.blur(), 
    select: () => inputRef.value?.select(), 
    increment: () => stepBy(1), 
    decrement: () => stepBy(-1), 
    inputRef, 
}); 
</script>
