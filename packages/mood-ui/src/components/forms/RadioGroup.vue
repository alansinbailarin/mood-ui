<template> 
    <fieldset 
        :class="['modo-radio-group flex flex-col gap-2', $attrs.class]" 
        :disabled="isDisabled || undefined" 
        :aria-invalid="hasError || undefined" 
        :aria-describedby="describedBy" 
    > 
        <legend 
            v-if="label" 
            :class="['font-medium text-foreground mb-1', labelSizeClasses]" 
        > 
            {{ label }} 
            <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
        </legend> 
 
        <div 
            :class="[ 
                'flex', 
                orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-6 gap-y-2' : 'flex-col gap-2', 
            ]" 
        > 
            <slot> 
                <Radio 
                    v-for="opt in options" 
                    :key="opt.value" 
                    :value="opt.value" 
                    :label="opt.label" 
                    :description="opt.description" 
                    :disabled="opt.disabled" 
                /> 
            </slot> 
        </div> 
 
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
    </fieldset> 
</template> 
 
<script setup lang="ts"> 
import { computed, provide, ref, useId, watchEffect } from 'vue'; 
import Radio from './Radio.vue'; 
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig'; 
import type { RadioGroup as RadioGroupProps } from '../../interfaces/forms/Radio.interface'; 
import { RADIO_GROUP_KEY } from '../../interfaces/forms/RadioGroup.context'; 
import Typography from '../data-display/Typography.vue'; 
 
defineOptions({ inheritAttrs: false }); 
 
const props = withDefaults(defineProps<RadioGroupProps>(), { 
    modelValue: null, 
    orientation: 'vertical', 
    color: 'default', 
    disabled: false, 
    required: false, 
    loading: false, 
}); 
 
const emit = defineEmits<{ 
    (e: 'update:modelValue', value: string | number): void; 
    (e: 'change', value: string | number): void; 
}>(); 
 
const autoId = useId(); 
const groupId = `modo-radio-group-${autoId}`; 
const errorId = computed(() => `${groupId}-error`); 
const helperId = computed(() => `${groupId}-helper`); 
 
const hasError = computed(() => !!props.errorText); 
const isDisabled = computed(() => !!props.disabled || !!props.loading); 
const required = computed(() => !!props.required); 
 
const describedBy = computed(() => { 
    if (hasError.value) return errorId.value; 
    if (props.helperText) return helperId.value; 
    return undefined; 
}); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedSize = useResolvedSize(() => props.size); 
 
const selected = ref<string | number | null>(props.modelValue ?? null); 
watchEffect(() => { 
    selected.value = props.modelValue ?? null; 
}); 
 
function select(v: string | number) { 
    selected.value = v; 
    emit('update:modelValue', v); 
    emit('change', v); 
} 
 
const name = ref(props.name ?? groupId); 
watchEffect(() => { 
    name.value = props.name ?? groupId; 
}); 
 
provide(RADIO_GROUP_KEY, { 
    name, 
    value: selected, 
    color: computed(() => (hasError.value ? 'danger' : resolvedColor.value)), 
    size: computed(() => resolvedSize.value ?? 'medium'), 
    disabled: isDisabled, 
    required, 
    hasError, 
    describedBy, 
    select, 
}); 
 
const labelSizeClasses = computed(() => { 
    switch (resolvedSize.value) { 
        case 'small': return 'text-caption'; 
        case 'large': return 'text-body-lg'; 
        case 'medium': 
        default: return 'text-body'; 
    } 
}); 
 
if (import.meta.env.DEV && !props.label && !props.ariaLabel) { 
    console.warn('[mood-ui RadioGroup] Se requiere `label` o `ariaLabel` para accesibilidad.'); 
} 
</script>
