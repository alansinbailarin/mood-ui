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
            :class="[ 
                'modo-field-wrapper flex items-center gap-2', 
                wrapperVariantClasses, 
                wrapperSizeClasses, 
                radiusClasses, 
                fullWidth ? 'w-full' : '', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : '', 
            ]" 
        > 
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
                :type="type" 
                :value="modelValue ?? ''" 
                :placeholder="placeholder" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :autocomplete="autocomplete" 
                :autofocus="autofocus" 
                :maxlength="maxLength" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                :aria-required="required || undefined" 
                :class="[ 
                    'modo-field-native flex-1 min-w-0 bg-transparent p-0', 
                    'text-foreground placeholder:text-muted-foreground', 
                    'disabled:cursor-not-allowed', 
                    inputTextClasses, 
                ]" 
                @input="onInput" 
                @change="onChange" 
                @focus="$emit('focus', $event)" 
                @blur="$emit('blur', $event)" 
            /> 
 
            <span 
                v-if="suffix" 
                aria-hidden="true" 
                class="shrink-0 text-muted-foreground select-none" 
            > 
                {{ suffix }} 
            </span> 
 
            <Button 
                v-if="clearable && hasValue && !isDisabled && !readonly" 
                variant="text" 
                size="xs" 
                radius="full" 
                :icon="XMarkIcon" 
                :ariaLabel="loc.input.clear" 
                tabindex="-1" 
                :class="['shrink-0', affordanceActionClass]" 
                @click="onClear" 
            /> 
 
            <Loader 
                v-if="loading" 
                :size="size === 'large' ? 'medium' : 'small'" 
                :class="['shrink-0', affordanceIconClass]" 
            /> 
 
            <component 
                :is="iconRight" 
                v-if="iconRight && !loading && !(clearable && hasValue)" 
                aria-hidden="true" 
                :class="['shrink-0', affordanceIconClass, iconSizeClasses]" 
            /> 
        </div> 
 
        <div 
            v-if="errorText || helperText || showCounterEffective" 
            class="flex items-start justify-between gap-2" 
        > 
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
            <span v-else class="flex-1" /> 
 
            <span 
                v-if="showCounterEffective" 
                :id="counterId" 
                :class="[ 
                    'text-caption shrink-0 tabular-nums', 
                    counterOverflow ? 'text-destructive' : 'text-muted-foreground', 
                ]" 
            > 
                {{ currentLength }}/{{ maxLength }} 
            </span> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, ref } from 'vue'; 
import type { Input } from '../../interfaces/forms/Input.interface'; 
import {
    useFieldState,
    useFieldClasses,
    FIELD_AFFORDANCE_ACTION_BY_COLOR,
    FIELD_AFFORDANCE_ICON_BY_COLOR,
} from '../../composables/useField'; 
import { useModoLocale, useResolvedSize } from '../../composables/useModoConfig'; 
import Loader from '../feedback/Loader.vue'; 
import Button from './Button.vue'; 
import Typography from '../data-display/Typography.vue'; 
import { XMarkIcon } from '@heroicons/vue/24/outline'; 
 
const loc = useModoLocale(); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: string]; 
    change: [value: string]; 
    focus: [event: FocusEvent]; 
    blur: [event: FocusEvent]; 
    clear: []; 
}>(); 
 
const props = withDefaults(defineProps<Input>(), { 
    type: 'text', 
    variant: 'outline', 
    color: 'default', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    clearable: false, 
    fullWidth: false, 
    showCounter: false, 
    autofocus: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const inputRef = ref<HTMLInputElement | null>(null); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    hasValue, 
    isDisabled, 
    currentLength, 
    showCounterEffective, 
    counterOverflow, 
    errorId, 
    helperId, 
    counterId, 
    describedBy, 
} = useFieldState(props, { componentName: 'Input', idPrefix: 'modo-input' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    halo: () => props.halo, 
}); 

const affordanceIconClass = computed(() => FIELD_AFFORDANCE_ICON_BY_COLOR[stateColor.value] ?? 'text-muted-foreground');
const affordanceActionClass = computed(() => FIELD_AFFORDANCE_ACTION_BY_COLOR[stateColor.value] ?? 'text-muted-foreground hover:text-foreground');
 
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
 
function onInput(e: Event) { 
    const target = e.target as HTMLInputElement; 
    emit('update:modelValue', target.value); 
} 
 
function onChange(e: Event) { 
    const target = e.target as HTMLInputElement; 
    emit('change', target.value); 
} 
 
function onClear() { 
    emit('update:modelValue', ''); 
    emit('clear'); 
    inputRef.value?.focus(); 
} 
 
defineExpose({ 
    focus: () => inputRef.value?.focus(), 
    blur: () => inputRef.value?.blur(), 
    select: () => inputRef.value?.select(), 
    inputRef, 
}); 
</script>
