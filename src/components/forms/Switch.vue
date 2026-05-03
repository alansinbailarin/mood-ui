<template> 
    <div :class="['flex flex-col gap-1', fullWidth ? 'w-full' : 'inline-flex']"> 
        <label 
            :for="fieldId" 
            :class="[ 
                'modo-switch group inline-flex items-start gap-2.5 select-none', 
                labelPosition === 'left' ? 'flex-row-reverse justify-end' : '', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer', 
            ]" 
        > 
            <input 
                :id="fieldId" 
                ref="inputEl" 
                type="checkbox" 
                role="switch" 
                class="peer sr-only" 
                :checked="isChecked" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                :aria-checked="isChecked" 
                @change="onChange" 
            /> 
 
            <span 
                aria-hidden="true" 
                :class="[ 
                    'modo-switch-track relative shrink-0 inline-flex items-center', 
                    trackRadiusClass, 
                    'border border-transparent transition-all duration-base ease-standard', 
                    'ring-4 ring-border/25', 
                    'peer-focus-visible:ring-4', 
                    trackSizeClasses, 
                    trackStateClasses, 
                    'mt-0.5', 
                ]" 
            > 
                <span 
                    :class="[ 
                        'modo-switch-thumb inline-block bg-background rounded-full shadow-sm transition-transform duration-base ease-emphasized', 
                        thumbSizeClasses, 
                        thumbTransformClasses, 
                    ]" 
                /> 
            </span> 
 
            <span v-if="label || description" class="flex flex-col gap-0.5"> 
                <span 
                    v-if="label" 
                    :class="['font-medium text-foreground', labelSizeClasses]" 
                > 
                    {{ label }} 
                    <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
                </span> 
                <span 
                    v-if="description" 
                    class="text-caption text-muted-foreground" 
                > 
                    {{ description }} 
                </span> 
            </span> 
        </label> 
 
        <Typography 
            v-if="hasError" 
            :id="errorId" 
            variant="caption" 
            size="medium" 
            color="danger" 
            as="p" 
            role="alert" 
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
</template> 
 
<script setup lang="ts"> 
import { computed, ref } from 'vue'; 
import { useFieldState } from '../../composables/useField'; 
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
import type { Switch as SwitchProps } from '../../interfaces/forms/Switch.interface'; 
import Typography from '../data-display/Typography.vue'; 
 
const props = withDefaults(defineProps<SwitchProps & { fullWidth?: boolean }>(), { 
    modelValue: false, 
    color: 'default', 
    labelPosition: 'right', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
// Track radius (default pill). Thumb stays circular regardless. 
const resolvedRadius = useResolvedRadius(() => props.radius ?? 'full'); 
const trackRadiusClass = computed(() => { 
    switch (resolvedRadius.value) { 
        case 'none':   return 'rounded-none'; 
        case 'small':  return 'rounded-sm'; 
        case 'medium': return 'rounded-md'; 
        case 'large':  return 'rounded-lg'; 
        case 'full': 
        default:       return 'rounded-full'; 
    } 
}); 
 
const emit = defineEmits<{ 
    (e: 'update:modelValue', value: boolean): void; 
    (e: 'change', value: boolean): void; 
}>(); 
 
const { 
    fieldId, 
    stateColor, 
    hasError, 
    isDisabled, 
    errorId, 
    helperId, 
    describedBy, 
} = useFieldState(props, { componentName: 'Switch', idPrefix: 'modo-switch' }); 
 
const inputEl = ref<HTMLInputElement | null>(null); 
 
const isChecked = computed(() => !!props.modelValue); 
 
function onChange(e: Event) { 
    if (props.readonly) { 
        if (inputEl.value) inputEl.value.checked = isChecked.value; 
        return; 
    } 
    const next = (e.target as HTMLInputElement).checked; 
    emit('update:modelValue', next); 
    emit('change', next); 
} 
 
/* ---------- Sizes ---------- */ 
const trackSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-8 h-5 p-0.5'; 
        case 'large': return 'w-14 h-8 p-0.5'; 
        case 'medium': 
        default: return 'w-10 h-6 p-0.5'; 
    } 
}); 
const thumbSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'w-4 h-4'; 
        case 'large': return 'w-7 h-7'; 
        case 'medium': 
        default: return 'w-5 h-5'; 
    } 
}); 
const thumbTransformClasses = computed(() => { 
    if (!isChecked.value) return 'translate-x-0'; 
    switch (resolvedSize.value) { 
        case 'small': return 'translate-x-3'; 
        case 'large': return 'translate-x-6'; 
        case 'medium': 
        default: return 'translate-x-4'; 
    } 
}); 
const labelSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'text-caption'; 
        case 'large': return 'text-body-lg'; 
        case 'medium': 
        default: return 'text-body'; 
    } 
}); 
 
/* ---------- State colors ---------- */ 
const CHECKED_BG_BY_COLOR: Record<string, string> = { 
    default: 'bg-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
 
const FOCUS_RING_BY_COLOR: Record<string, string> = { 
    default: 'peer-focus-visible:ring-ring/25', 
    primary: 'peer-focus-visible:ring-primary/25', 
    danger: 'peer-focus-visible:ring-destructive/25', 
    success: 'peer-focus-visible:ring-success/25', 
    warning: 'peer-focus-visible:ring-warning/25', 
}; 
 
const HOVER_BG_BY_COLOR: Record<string, string> = { 
    default: 'group-hover:bg-muted', 
    primary: 'group-hover:bg-muted', 
    danger: 'group-hover:bg-muted', 
    success: 'group-hover:bg-muted', 
    warning: 'group-hover:bg-muted', 
}; 
 
const trackStateClasses = computed(() => { 
    const c = stateColor.value; 
    const ring = FOCUS_RING_BY_COLOR[c]; 
    if (isChecked.value) { 
        return [CHECKED_BG_BY_COLOR[c], ring].join(' '); 
    } 
    return [ 
        'bg-input', 
        HOVER_BG_BY_COLOR[c], 
        hasError.value ? 'bg-destructive/20' : '', 
        ring, 
    ].join(' '); 
}); 
</script> 
 
<style scoped> 
.modo-switch-track { 
    transition-property: background-color, box-shadow, --tw-ring-color; 
} 
</style>
