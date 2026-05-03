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
                :class="['shrink-0 text-muted-foreground', iconSizeClasses]" 
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
                :type="nativeType" 
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
                    visible ? '' : 'tracking-widest', 
                ]" 
                spellcheck="false" 
                @input="onInput" 
                @change="onChange" 
                @focus="$emit('focus', $event)" 
                @blur="$emit('blur', $event)" 
            /> 
 
            <Loader 
                v-if="loading" 
                :size="size === 'large' ? 'medium' : 'small'" 
                class="shrink-0 text-muted-foreground" 
            /> 
 
            <Button 
                v-if="toggleVisibility && !loading" 
                variant="text" 
                size="small" 
                radius="full" 
                :icon="visible ? EyeSlashIcon : EyeIcon" 
                :ariaLabel="visible ? loc.passwordInput.hide : loc.passwordInput.show" 
                :disabled="isDisabled" 
                tabindex="-1" 
                :aria-pressed="visible" 
                class="shrink-0" 
                @click="toggleVisible" 
            /> 
        </div> 
 
        <!-- Strength meter --> 
        <div v-if="strengthMeter" class="flex items-center gap-2"> 
            <div class="flex-1 flex gap-1" aria-hidden="true"> 
                <span 
                    v-for="i in 4" 
                    :key="i" 
                    :class="[ 
                        'h-1 flex-1 rounded-full transition-colors duration-base ease-standard', 
                        i <= strength.score ? strength.barClass : 'bg-border', 
                    ]" 
                /> 
            </div> 
            <span 
                class="text-caption text-muted-foreground tabular-nums w-14 text-right" 
                role="status" 
                aria-live="polite" 
            > 
                {{ strength.label }} 
            </span> 
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
import { computed, ref, watch } from 'vue'; 
import type { 
    PasswordInput, 
    PasswordStrengthScore, 
} from '../../interfaces/forms/PasswordInput.interface'; 
import { useFieldState, useFieldClasses } from '../../composables/useField'; 
import { useModoLocale, useResolvedSize } from '../../composables/useModoConfig'; 
import Loader from '../feedback/Loader.vue'; 
import Button from './Button.vue'; 
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'; 
import Typography from '../data-display/Typography.vue'; 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: string]; 
    change: [value: string]; 
    focus: [event: FocusEvent]; 
    blur: [event: FocusEvent]; 
    'update:visible': [value: boolean]; 
    'strength-change': [score: PasswordStrengthScore]; 
}>(); 
 
const props = withDefaults(defineProps<PasswordInput>(), { 
    variant: 'outline', 
    color: 'default', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
    showCounter: false, 
    toggleVisibility: true, 
    defaultVisible: false, 
    strengthMeter: false, 
    autocomplete: 'current-password', 
    autofocus: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const inputRef = ref<HTMLInputElement | null>(null); 
const visible = ref(props.defaultVisible); 
 
const { 
    fieldId, 
    radius, 
    stateColor, 
    hasError, 
    isDisabled, 
    currentLength, 
    showCounterEffective, 
    counterOverflow, 
    errorId, 
    helperId, 
    counterId, 
    describedBy, 
} = useFieldState(props, { componentName: 'PasswordInput', idPrefix: 'modo-password' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    halo: () => props.halo, 
}); 
 
const nativeType = computed(() => (visible.value ? 'text' : 'password')); 
 
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
 
/** 
 * Labels por defecto (inglés). Se usan como fallback cuando el consumidor 
 * no provee `strengthLabels` ni ha configurado `locale.passwordInput.strength` 
 * en el `ModoProvider`. Prioridad: prop > locale > default EN. 
 */ 
const loc = useModoLocale(); 
 
function resolveStrengthLabel(score: PasswordStrengthScore): string { 
    const override = props.strengthLabels?.[score]; 
    if (typeof override === 'string') return override; 
    return loc.value.passwordInput.strength[score]; 
} 
 
/** Score 0..4 + label + clase de color para la barra. */ 
const strength = computed(() => { 
    const value = String(props.modelValue ?? ''); 
    if (!value) { 
        return { score: 0 as PasswordStrengthScore, label: resolveStrengthLabel(0), barClass: 'bg-border' }; 
    } 
 
    let score = 0; 
    if (value.length >= 8) score++; 
    if (value.length >= 12) score++; 
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++; 
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++; 
    score = Math.min(score, 4); 
    // Si hay contenido pero aún 0 puntos, mostrar al menos 1 segmento rojo. 
    if (value.length > 0 && score === 0) score = 1; 
 
    const s = score as PasswordStrengthScore; 
    const barClass = ['bg-border', 'bg-destructive/60', 'bg-warning/70', 'bg-success/70', 'bg-success'][s]; 
 
    return { score: s, label: resolveStrengthLabel(s), barClass }; 
}); 
 
// Emit score changes for consumers that want to i18n the label themselves 
// or react to strength (e.g. block submit until "Good"). Fires only when 
// the numeric score actually changes, not on every keystroke. 
watch( 
    () => strength.value.score, 
    (score) => emit('strength-change', score), 
); 
 
function onInput(e: Event) { 
    const target = e.target as HTMLInputElement; 
    emit('update:modelValue', target.value); 
} 
 
function onChange(e: Event) { 
    const target = e.target as HTMLInputElement; 
    emit('change', target.value); 
} 
 
function toggleVisible() { 
    visible.value = !visible.value; 
    emit('update:visible', visible.value); 
    inputRef.value?.focus(); 
} 
 
defineExpose({ 
    focus: () => inputRef.value?.focus(), 
    blur: () => inputRef.value?.blur(), 
    select: () => inputRef.value?.select(), 
    toggle: toggleVisible, 
    visible, 
    inputRef, 
}); 
</script>
