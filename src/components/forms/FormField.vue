<template> 
    <component 
        :is="as" 
        :class="[ 
            'modo-form-field', 
            fullWidth ? 'w-full' : 'inline-flex', 
            isHorizontal ? 'flex flex-row items-start gap-4' : 'flex flex-col gap-1.5', 
        ]" 
    > 
        <!-- Label cluster (label + hint). 
             - Horizontal: fixed-width column on the left. 
             - Vertical: full row above the control. 
             Skipped when there is no `label` and no `#label` slot. --> 
        <div 
            v-if="hasLabel" 
            :class="[ 
                'flex items-center gap-2', 
                isHorizontal ? 'shrink-0 pt-1.5' : 'justify-between', 
            ]" 
            :style="isHorizontal ? { width: labelWidth } : undefined" 
        > 
            <label 
                :for="resolvedId" 
                :class="[ 
                    'text-caption font-medium', 
                    disabled ? 'text-muted-foreground' : 'text-foreground', 
                ]" 
            > 
                <slot name="label">{{ label }}</slot> 
                <span v-if="required" aria-hidden="true" class="text-destructive ml-0.5">*</span> 
            </label> 
            <span 
                v-if="hint && !isHorizontal" 
                aria-hidden="true" 
                class="text-caption text-muted-foreground" 
            >{{ hint }}</span> 
        </div> 
 
        <!-- Control + helper/error column. Takes the remaining width when 
             the field is horizontal so error text wraps below the input. --> 
        <div :class="[isHorizontal ? 'flex-1 min-w-0 flex flex-col gap-1.5' : 'flex flex-col gap-1.5']"> 
            <slot 
                :id="resolvedId" 
                :describedBy="describedBy" 
                :invalid="hasError" 
                :disabled="!!disabled" 
                :required="!!required" 
                :color="hasError ? 'danger' : undefined" 
            /> 
 
            <div 
                v-if="errorText || helperText || $slots.helper" 
                class="flex items-start justify-between gap-2" 
            > 
                <Typography 
                    v-if="errorText" 
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
                    v-else-if="helperText || $slots.helper" 
                    :id="helperId" 
                    variant="caption" 
                    size="medium" 
                    color="muted" 
                    as="p" 
                > 
                    <slot name="helper">{{ helperText }}</slot> 
                </Typography> 
            </div> 
        </div> 
    </component> 
</template> 
 
<script setup lang="ts">
import { computed, provide, useId, useSlots } from 'vue';
import Typography from '../data-display/Typography.vue';
import type { FormField } from '../../interfaces/forms/FormField.interface';
import { FORM_FIELD_ID_KEY } from '../../composables/useField';
 
const props = withDefaults(defineProps<FormField>(), { 
    orientation: 'vertical', 
    labelWidth: '10rem', 
    fullWidth: false, 
    as: 'div', 
}); 
 
const slots = useSlots(); 
 
const autoId = useId();
const resolvedId = computed(() => props.id ?? `modo-field-${autoId}`);

// Provide the resolved id so child form controls (Input, Textarea, etc.) automatically
// use it as their own id — connecting the FormField's <label for="..."> without v-slot.
provide(FORM_FIELD_ID_KEY, resolvedId); 
 
const hasError = computed(() => !!props.errorText); 
const isHorizontal = computed(() => props.orientation === 'horizontal'); 
const hasLabel = computed(() => !!props.label || !!slots.label); 
 
const errorId = computed(() => `${resolvedId.value}-error`); 
const helperId = computed(() => `${resolvedId.value}-helper`); 
 
/** 
 * Combined `aria-describedby` for the inner control. Only error or helper 
 * is announced at a time — never both — to avoid noisy SR output. 
 */ 
const describedBy = computed<string | undefined>(() => { 
    if (hasError.value) return errorId.value; 
    if (props.helperText || slots.helper) return helperId.value; 
    return undefined; 
}); 
</script>
