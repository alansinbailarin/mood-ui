<template> 
    <label 
        :class="[ 
            'modo-radio group inline-flex items-start gap-2.5 select-none', 
            isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer', 
        ]" 
    > 
        <input 
            :id="fieldId" 
            ref="inputEl" 
            type="radio" 
            class="peer sr-only" 
            :checked="isChecked" 
            :disabled="isDisabled" 
            :required="required" 
            :name="resolvedName" 
            :value="value" 
            :aria-label="!label ? ariaLabel : undefined" 
            :aria-invalid="hasError || undefined" 
            :aria-describedby="describedBy" 
            @change="onChange" 
        /> 
 
        <span 
            aria-hidden="true" 
            :class="[ 
                'modo-radio-dot relative shrink-0 inline-flex items-center justify-center rounded-full', 
                'border transition-all duration-base ease-standard', 
                'ring-4 ring-border/25', 
                'peer-focus-visible:ring-4', 
                boxSizeClasses, 
                dotStateClasses, 
                'mt-0.5', 
            ]" 
        > 
            <span 
                v-if="isChecked" 
                :class="['rounded-full bg-current', innerSizeClasses]" 
            /> 
        </span> 
 
        <span v-if="label || description" class="flex flex-col gap-0.5"> 
            <span 
                v-if="label" 
                :class="['font-medium text-foreground', labelSizeClasses]" 
            > 
                {{ label }} 
                <span v-if="showAsterisk" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
            </span> 
            <span 
                v-if="description" 
                class="text-caption text-muted-foreground" 
            > 
                {{ description }} 
            </span> 
        </span> 
    </label> 
</template> 
 
<script setup lang="ts"> 
import { computed, inject, useId } from 'vue'; 
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig'; 
import type { Radio as RadioProps } from '../../interfaces/forms/Radio.interface'; 
import { RADIO_GROUP_KEY } from '../../interfaces/forms/RadioGroup.context'; 
 
const props = withDefaults(defineProps<RadioProps>(), { 
    modelValue: null, 
    color: 'default', 
    disabled: false, 
    required: false, 
    loading: false, 
}); 
 
const emit = defineEmits<{ 
    (e: 'update:modelValue', value: string | number): void; 
    (e: 'change', value: string | number): void; 
}>(); 
 
const group = inject(RADIO_GROUP_KEY, null); 
 
const autoId = useId(); 
const fieldId = computed(() => props.id ?? `modo-radio-${autoId}`); 
const resolvedName = computed(() => props.name ?? group?.name.value ?? fieldId.value); 
 
const localColor = useResolvedColor(() => props.color); 
const resolvedSize = useResolvedSize(() => props.size); 
const stateColor = computed(() => group?.color.value ?? localColor.value); 
const sizeResolved = computed(() => group?.size.value ?? resolvedSize.value); 
 
const groupDisabled = computed(() => !!group?.disabled.value); 
const isDisabled = computed(() => !!props.disabled || !!props.loading || groupDisabled.value); 
const hasError = computed(() => !!group?.hasError.value); 
const describedBy = computed(() => group?.describedBy.value); 
const required = computed(() => !!props.required || !!group?.required.value); 
// Show '*' only for an own `required` prop. Group-level required is rendered 
// once on the group's <legend> — children should not duplicate it. 
const showAsterisk = computed(() => !!props.required && !group); 
 
const isChecked = computed(() => { 
    const v = group ? group.value.value : props.modelValue; 
    return v !== null && v !== undefined && v === props.value; 
}); 
 
function onChange() { 
    if (isDisabled.value) return; 
    if (group) { 
        group.select(props.value); 
    } else { 
        emit('update:modelValue', props.value); 
    } 
    emit('change', props.value); 
} 
 
/* ---------- Sizes ---------- */ 
const boxSizeClasses = computed(() => { 
    switch (sizeResolved.value) { 
        case 'small': return 'w-4 h-4'; 
        case 'large': return 'w-6 h-6'; 
        case 'medium': 
        default: return 'w-5 h-5'; 
    } 
}); 
const innerSizeClasses = computed(() => { 
    switch (sizeResolved.value) { 
        case 'small': return 'w-1.5 h-1.5'; 
        case 'large': return 'w-2.5 h-2.5'; 
        case 'medium': 
        default: return 'w-2 h-2'; 
    } 
}); 
const labelSizeClasses = computed(() => { 
    switch (sizeResolved.value) { 
        case 'small': return 'text-caption'; 
        case 'large': return 'text-body-lg'; 
        case 'medium': 
        default: return 'text-body'; 
    } 
}); 
 
/* ---------- State colors ---------- */ 
const CHECKED_COLOR: Record<string, string> = { 
    default: 'border-foreground text-foreground', 
    primary: 'border-primary text-primary', 
    danger: 'border-destructive text-destructive', 
    success: 'border-success text-success', 
    warning: 'border-warning text-warning', 
}; 
 
const FOCUS_RING_BY_COLOR: Record<string, string> = { 
    default: 'peer-focus-visible:ring-ring/25', 
    primary: 'peer-focus-visible:ring-primary/25', 
    danger: 'peer-focus-visible:ring-destructive/25', 
    success: 'peer-focus-visible:ring-success/25', 
    warning: 'peer-focus-visible:ring-warning/25', 
}; 
 
const HOVER_BORDER_BY_COLOR: Record<string, string> = { 
    default: 'group-hover:border-foreground/60', 
    primary: 'group-hover:border-primary/60', 
    danger: 'group-hover:border-destructive/60', 
    success: 'group-hover:border-success/60', 
    warning: 'group-hover:border-warning/60', 
}; 
 
const dotStateClasses = computed(() => { 
    const c = hasError.value ? 'danger' : stateColor.value; 
    const ring = FOCUS_RING_BY_COLOR[c]; 
    if (isChecked.value) { 
        return ['bg-background', CHECKED_COLOR[c], ring].join(' '); 
    } 
    return [ 
        'bg-background border-input text-transparent', 
        HOVER_BORDER_BY_COLOR[c], 
        hasError.value ? 'border-destructive' : '', 
        ring, 
    ].join(' '); 
}); 
</script> 
 
<style scoped> 
.modo-radio-dot { 
    transition-property: background-color, border-color, color, box-shadow, --tw-ring-color; 
} 
</style>
