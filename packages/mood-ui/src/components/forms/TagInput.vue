<template>
    <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : 'inline-flex']">
        <label
            v-if="label"
            :for="fieldId"
            class="text-caption font-medium text-foreground"
        >
            {{ label }}
        </label>

        <div
            :class="[
                'flex flex-wrap items-center gap-1.5 transition-shadow',
                wrapperVariantClasses,
                radiusClasses,
                paddingClasses,
                fullWidth ? 'w-full' : '',
                isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-text',
                readonly ? 'pointer-events-none' : '',
            ]"
            @click="focusInput"
        >
            <span
                v-for="(tag, idx) in modelValue"
                :key="`${tag}-${idx}`"
                :class="[
                    'inline-flex items-center gap-1 font-medium whitespace-nowrap',
                    chipSizeClasses,
                    chipRadiusClasses,
                    chipColorClasses,
                ]"
            >
                {{ tag }}
                <button
                    v-if="!readonly && !disabled"
                    type="button"
                    :aria-label="`Eliminar ${tag}`"
                    class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-foreground/10 transition-colors"
                    @click.stop="removeTag(idx)"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
            </span>

            <input
                :id="fieldId"
                ref="inputEl"
                v-model="draft"
                type="text"
                :placeholder="modelValue?.length ? '' : placeholder"
                :aria-label="label ? undefined : (ariaLabel ?? 'Tags')"
                :aria-invalid="hasError || undefined"
                :aria-describedby="describedBy"
                :disabled="isDisabled || readonly || (max !== undefined && (modelValue?.length ?? 0) >= max)"
                :class="[
                    'modo-field-native flex-1 min-w-[6rem] bg-transparent p-0 text-foreground placeholder:text-muted-foreground',
                    inputSizeClasses,
                ]"
                @keydown="onKeydown"
                @blur="commitDraft"
                @paste="onPaste"
            />
        </div>

        <div v-if="errorText || helperText" class="flex items-start">
            <p
                v-if="errorText"
                :id="errorId"
                class="text-caption text-destructive"
            >
                {{ errorText }}
            </p>
            <p
                v-else-if="helperText"
                :id="helperId"
                class="text-caption text-muted-foreground"
            >
                {{ helperText }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TagInput } from '../../interfaces/forms/TagInput.interface';
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig';
import { useFieldState, useFieldClasses } from '../../composables/useField';

const props = withDefaults(defineProps<TagInput>(), {
    modelValue: () => [],
    placeholder: 'Añade un tag y pulsa Enter…',
    unique: true,
    delimiters: () => [','],
    color: 'default',
    variant: 'subtle',
    fieldVariant: 'outline',
    fullWidth: false,
});

const emit = defineEmits<{
    'update:modelValue': [v: string[]];
    'add': [tag: string];
    'remove': [tag: string, index: number];
    'change': [v: string[]];
}>();

/* ── Field system (same as Input / Select / Combobox) ── */
const { fieldId, radius, stateColor, hasError, isDisabled, errorId, helperId, describedBy } =
    useFieldState(props, { componentName: 'TagInput', idPrefix: 'modo-tag-input' });

const { wrapperVariantClasses, radiusClasses } = useFieldClasses({
    variant: () => props.fieldVariant ?? 'outline',
    stateColor,
    hasError,
    radius,
    halo: () => props.halo,
});

/* ── Chip color (separate from field state color) ── */
const resolvedSize = useResolvedSize(() => props.size);
const resolvedColor = useResolvedColor(() => props.color);

/* ── Input state ── */
const draft = ref('');
const inputEl = ref<HTMLInputElement | null>(null);

function focusInput() {
    inputEl.value?.focus();
}

function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (props.max !== undefined && (props.modelValue?.length ?? 0) >= props.max) return;
    if (props.unique && props.modelValue?.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    if (props.validator && !props.validator(tag)) return;
    const next = [...(props.modelValue ?? []), tag];
    emit('update:modelValue', next);
    emit('add', tag);
    emit('change', next);
}

function removeTag(idx: number) {
    const tag = props.modelValue?.[idx];
    if (tag === undefined) return;
    const next = [...(props.modelValue ?? [])];
    next.splice(idx, 1);
    emit('update:modelValue', next);
    emit('remove', tag, idx);
    emit('change', next);
}

function commitDraft() {
    if (draft.value.trim()) {
        addTag(draft.value);
        draft.value = '';
    }
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        e.preventDefault();
        commitDraft();
    } else if ((e.key === 'Backspace') && draft.value === '' && (props.modelValue?.length ?? 0) > 0) {
        removeTag(props.modelValue!.length - 1);
    } else if (props.delimiters?.includes(e.key)) {
        e.preventDefault();
        commitDraft();
    }
}

function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text');
    if (!text) return;
    const parts = text.split(/[,\n\t]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
        e.preventDefault();
        for (const p of parts) addTag(p);
        draft.value = '';
    }
}

/* ── Size classes ── */
const paddingClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'p-1.5 min-h-[2rem]';
        case 'large':  return 'p-2.5 min-h-[3rem]';
        case 'medium':
        default:       return 'p-2 min-h-[2.5rem]';
    }
});

const inputSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-xs h-5';
        case 'large':  return 'text-base h-7';
        case 'medium':
        default:       return 'text-sm h-6';
    }
});

const chipSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'h-5 px-2 text-[11px]';
        case 'large':  return 'h-7 px-3 text-sm';
        case 'medium':
        default:       return 'h-6 px-2.5 text-xs';
    }
});

const chipRadiusClasses = computed(() => {
    switch (radius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded';
        case 'large':  return 'rounded-lg';
        case 'full':   return 'rounded-full';
        case 'medium':
        default:       return 'rounded-md';
    }
});

const chipColorClasses = computed(() => {
    const c = resolvedColor.value;
    const map: Record<string, Record<string, string>> = {
        default: {
            subtle:  'bg-muted text-foreground',
            outline: 'border border-border text-foreground',
            solid:   'bg-foreground text-background',
        },
        primary: {
            subtle:  'bg-primary/12 text-primary',
            outline: 'border border-primary/40 text-primary',
            solid:   'bg-primary text-primary-foreground',
        },
        danger: {
            subtle:  'bg-destructive/10 text-destructive',
            outline: 'border border-destructive/40 text-destructive',
            solid:   'bg-destructive text-destructive-foreground',
        },
        success: {
            subtle:  'bg-success/10 text-success',
            outline: 'border border-success/40 text-success',
            solid:   'bg-success text-success-foreground',
        },
        warning: {
            subtle:  'bg-warning/10 text-warning',
            outline: 'border border-warning/40 text-warning',
            solid:   'bg-warning text-warning-foreground',
        },
    };
    return map[c]?.[props.variant] ?? map.default.subtle;
});
</script>

