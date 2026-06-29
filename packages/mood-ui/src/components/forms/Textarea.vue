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
                'modo-field-wrapper flex items-start gap-2',
                wrapperVariantClasses,
                wrapperPaddingClasses,
                wrapperMinHeightClass,
                radiusClasses,
                fullWidth ? 'w-full' : '',
                isDisabled ? 'opacity-60 cursor-not-allowed' : '',
            ]"
        > 
            <textarea 
                :id="fieldId" 
                ref="textareaRef" 
                :value="modelValue ?? ''" 
                :placeholder="placeholder" 
                :disabled="isDisabled" 
                :readonly="readonly" 
                :required="required" 
                :name="name" 
                :autofocus="autofocus" 
                :maxlength="maxLength" 
                :rows="rows" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                :aria-required="required || undefined" 
                :class="[ 
                    'modo-field-native flex-1 min-w-0 bg-transparent p-0', 
                    'text-foreground placeholder:text-muted-foreground', 
                    'disabled:cursor-not-allowed', 
                    textareaTextClasses, 
                    resizeClass, 
                    autoresize ? 'overflow-hidden' : '', 
                ]" 
                @input="onInput" 
                @change="onChange" 
                @focus="$emit('focus', $event)" 
                @blur="$emit('blur', $event)" 
            /> 
 
            <div class="flex flex-col items-center gap-1 shrink-0 pt-0.5"> 
                <Button 
                    v-if="clearable && hasValue && !isDisabled && !readonly" 
                    variant="text" 
                    size="xs" 
                    radius="full" 
                    :icon="XMarkIcon" 
                    :ariaLabel="loc.textarea.clear" 
                    tabindex="-1" 
                    class="text-muted-foreground hover:text-foreground" 
                    @click="onClear" 
                /> 
 
                <Loader 
                    v-if="loading" 
                    :size="size === 'large' ? 'medium' : 'small'" 
                    class="text-muted-foreground" 
                /> 
            </div> 
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'; 
import type { Textarea } from '../../interfaces/forms/Textarea.interface'; 
import { useFieldState, useFieldClasses } from '../../composables/useField'; 
import Loader from '../feedback/Loader.vue'; 
import Button from './Button.vue'; 
import { XMarkIcon } from '@heroicons/vue/24/outline'; 
import Typography from '../data-display/Typography.vue'; 
import { useModoLocale, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig';
 
const loc = useModoLocale(); 
 
const emit = defineEmits<{ 
    'update:modelValue': [value: string]; 
    change: [value: string]; 
    focus: [event: FocusEvent]; 
    blur: [event: FocusEvent]; 
    clear: []; 
}>(); 
 
const props = withDefaults(defineProps<Textarea>(), { 
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
    rows: 3, 
    autoresize: false, 
    maxRows: 8, 
    resize: 'vertical', 
}); 
 
const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size);

const textareaRef = ref<HTMLTextAreaElement | null>(null); 
 
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
} = useFieldState(props, { componentName: 'Textarea', idPrefix: 'modo-textarea' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, 
    hasError, 
    radius, 
    fullRadiusClass: 'rounded-2xl', 
    halo: () => props.halo, 
}); 
 
/** Horizontal padding from tokens; vertical padding stays size-stepped. */
const wrapperPaddingClasses = computed(() => {
    const pyByControl: Record<string, string> = {
        'h-8': 'py-1', 'h-9': 'py-1.5', 'h-10': 'py-2', 'h-12': 'py-3',
    };
    const py = pyByControl[sz.value.control] ?? 'py-2';
    return `${sz.value.padX} ${py}`;
});

/** Min-height mirrors the control scale (h-8/h-9/h-10/h-12 → min-h-8/9/10/12). */
const wrapperMinHeightClass = computed(() => sz.value.control.replace('h-', 'min-h-'));

const textareaTextClasses = computed(() => `${sz.value.text} leading-relaxed`); 
 
const resizeClass = computed(() => { 
    if (props.autoresize) return 'resize-none'; 
    switch (props.resize) { 
        case 'none': return 'resize-none'; 
        case 'horizontal': return 'resize-x'; 
        case 'both': return 'resize'; 
        case 'vertical': 
        default: return 'resize-y'; 
    } 
}); 
 
function adjustHeight() { 
    if (!props.autoresize) return; 
    const el = textareaRef.value; 
    if (!el) return; 
 
    el.style.height = 'auto'; 
 
    const styles = window.getComputedStyle(el); 
    const lineHeight = parseFloat(styles.lineHeight) || 20; 
    const paddingTop = parseFloat(styles.paddingTop) || 0; 
    const paddingBottom = parseFloat(styles.paddingBottom) || 0; 
    const borderTop = parseFloat(styles.borderTopWidth) || 0; 
    const borderBottom = parseFloat(styles.borderBottomWidth) || 0; 
 
    const maxHeight = 
        lineHeight * props.maxRows + paddingTop + paddingBottom + borderTop + borderBottom; 
    const next = Math.min(el.scrollHeight, maxHeight); 
 
    el.style.height = `${next}px`; 
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'; 
} 
 
function onInput(e: Event) { 
    const target = e.target as HTMLTextAreaElement; 
    emit('update:modelValue', target.value); 
    if (props.autoresize) nextTick(adjustHeight); 
} 
 
function onChange(e: Event) { 
    const target = e.target as HTMLTextAreaElement; 
    emit('change', target.value); 
} 
 
function onClear() { 
    emit('update:modelValue', ''); 
    emit('clear'); 
    textareaRef.value?.focus(); 
    if (props.autoresize) nextTick(adjustHeight); 
} 
 
watch(() => props.modelValue, () => { 
    if (props.autoresize) nextTick(adjustHeight); 
}); 
watch(() => props.autoresize, (v) => { 
    if (v) nextTick(adjustHeight); 
    else if (textareaRef.value) { 
        textareaRef.value.style.height = ''; 
        textareaRef.value.style.overflowY = ''; 
    } 
}); 
watch(() => props.maxRows, () => { 
    if (props.autoresize) nextTick(adjustHeight); 
}); 
 
onMounted(() => { 
    if (props.autoresize) adjustHeight(); 
}); 
 
defineExpose({ 
    focus: () => textareaRef.value?.focus(), 
    blur: () => textareaRef.value?.blur(), 
    select: () => textareaRef.value?.select(), 
    textareaRef, 
}); 
</script>
