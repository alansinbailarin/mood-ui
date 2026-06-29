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
                'modo-field-wrapper transition-colors', 
                dashed ? dashedWrapperClasses : wrapperVariantClasses, 
                isAreaVariant ? '' : wrapperSizeClasses, 
                radiusClasses, 
                colorBorderClass, 
                fullWidth ? 'w-full' : '', 
                isDisabled ? 'opacity-60 cursor-not-allowed' : '', 
                isDragOver ? dragOverRingClass : '', 
                isAreaVariant && clickToSelect && !isDisabled && !readonly ? 'cursor-pointer' : '', 
            ]" 
            :role="isAreaVariant ? 'button' : undefined" 
            :tabindex="isAreaVariant && !isDisabled && !readonly ? 0 : undefined" 
            :aria-label="isAreaVariant ? (ariaLabel ?? label ?? dropzoneLabel ?? loc.fileInput.uploadFiles) : undefined" 
            @dragover.prevent="onDragOver" 
            @dragleave.prevent="onDragLeave" 
            @drop.prevent="onDrop" 
            @click="onWrapperClick" 
            @keydown="onWrapperKeydown" 
        > 
            <!-- Area variant --> 
            <div 
                v-if="isAreaVariant" 
                :class="[ 
                    'flex flex-col items-center justify-center text-center gap-2 px-4', 
                    areaHeightClasses, 
                ]" 
            > 
                <component 
                    :is="iconLeft ?? ArrowUpTrayIcon" 
                    aria-hidden="true" 
                    :class="[ 
                        'shrink-0 transition-colors duration-base ease-standard', 
                        isDragOver ? accentTextClass : accentTextIdleClass, 
                        areaIconSizeClasses, 
                    ]" 
                /> 
                <Typography variant="body" :size="size" weight="medium"> 
                    {{ areaPrimaryText }} 
                </Typography> 
                <Typography v-if="areaSecondaryText" variant="caption" size="medium" color="muted" as="p"> 
                    {{ areaSecondaryText }} 
                </Typography> 
                <div @click.stop> 
                    <Button 
                        :disabled="isDisabled || readonly" 
                        :color="color" 
                        :size="size" 
                        :radius="radius" 
                        :icon="ArrowUpTrayIcon" 
                        variant="outline" 
                        :label="browseLabel" 
                        class="mt-1" 
                        @click="openFilePicker" 
                    /> 
                </div> 
            </div> 
 
            <!-- Inline variant (default) --> 
            <div v-else class="flex items-center gap-3"> 
                <component 
                    :is="iconLeft ?? ArrowUpTrayIcon" 
                    aria-hidden="true" 
                    :class="['shrink-0', accentTextIdleClass, iconSizeClasses]" 
                /> 
                <div class="flex-1 min-w-0"> 
                    <Typography variant="body" :size="size" weight="medium" :truncate="true"> 
                        {{ files.length === 0 ? (placeholder ?? loc.fileInput.placeholder) : headlineText }} 
                    </Typography> 
                    <Typography v-if="helperInlineText" variant="caption" size="medium" color="muted" :truncate="true" as="p"> 
                        {{ helperInlineText }} 
                    </Typography> 
                </div> 
                <div @click.stop> 
                    <Button 
                        :disabled="isDisabled || readonly" 
                        :color="color" 
                        :size="size" 
                        :radius="radius" 
                        :icon="ArrowUpTrayIcon" 
                        variant="outline" 
                        :label="browseLabel" 
                        @click="openFilePicker" 
                    /> 
                </div> 
            </div> 
 
            <!-- Hidden native input --> 
            <input 
                :id="fieldId" 
                ref="inputEl" 
                type="file" 
                class="sr-only" 
                :name="name" 
                :accept="accept" 
                :multiple="multiple" 
                :disabled="isDisabled" 
                :required="required" 
                :aria-label="!label ? ariaLabel : undefined" 
                :aria-invalid="hasError || undefined" 
                :aria-describedby="describedBy" 
                @change="onPickerChange" 
            /> 
        </div> 
 
        <!-- File list / previews (fuera del dropzone para no romper su forma) --> 
        <TransitionGroup 
            v-show="files.length" 
            appear 
            name="modo-file" 
            tag="ul" 
            :class="[ 
                'flex flex-col mt-1', 
                previews ? 'md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-2' : '', 
            ]" 
        > 
            <li 
                v-for="entry in files" 
                :key="entry.id" 
                :class="[ 
                    'modo-file-item relative flex items-center gap-2 p-2 border border-border bg-background', 
                    // Vertical spacing via margin-bottom (not parent gap) so 
                    // it can animate to 0 on leave without causing a sibling 
                    // snap. Using mb (not mt) means when an item is removed 
                    // the newly-exposed sibling keeps its position. 
                    '[&:not(:last-child)]:mb-1.5 md:[&:not(:last-child)]:mb-0', 
                    itemRadiusClass, 
                ]" 
            > 
                <div 
                    v-if="previews && entry.previewUrl" 
                    :class="[ 
                        'shrink-0 w-10 h-10 overflow-hidden bg-muted', 
                        itemThumbRadiusClass, 
                    ]" 
                > 
                    <img :src="entry.previewUrl" :alt="entry.name" class="w-full h-full object-cover" /> 
                </div> 
                <component 
                    v-else 
                    :is="isImage(entry) ? PhotoIcon : DocumentIcon" 
                    aria-hidden="true" 
                    :class="[ 
                        'shrink-0 w-8 h-8 text-muted-foreground p-1.5 bg-muted', 
                        itemThumbRadiusClass, 
                    ]" 
                /> 
 
                <div class="flex-1 min-w-0"> 
                    <Typography variant="caption" size="medium" weight="medium" :truncate="true" as="p">{{ entry.name }}</Typography> 
                    <p class="text-[11px] text-muted-foreground"> 
                        {{ formatBytes(entry.size) }} 
                        <span v-if="entry.error" class="text-destructive">· {{ entry.error }}</span> 
                    </p> 
                    <!-- Progress bar --> 
                    <div 
                        v-if="typeof entry.progress === 'number' && entry.progress >= 0 && entry.progress < 100" 
                        :class="['mt-1 h-1 overflow-hidden', progressRadiusClass, 'bg-muted']" 
                    > 
                        <div 
                            :class="['h-full transition-all duration-base ease-standard', progressFillClass]" 
                            :style="{ width: `${entry.progress}%` }" 
                        /> 
                    </div> 
                </div> 
 
                <div v-if="!isDisabled && !readonly" @click.stop> 
                    <Button 
                        variant="text" 
                        :color="color" 
                        size="small" 
                        :icon="XMarkIcon" 
                        :ariaLabel="`Remove ${entry.name}`" 
                        @click="removeFile(entry.id)" 
                    /> 
                </div> 
            </li> 
        </TransitionGroup> 
 
        <div v-if="errorText || helperText" class="flex items-start gap-2"> 
            <Typography v-if="errorText" :id="errorId" variant="caption" size="medium" color="danger" as="p">{{ errorText }}</Typography> 
            <Typography v-else-if="helperText" :id="helperId" variant="caption" size="medium" color="muted" as="p">{{ helperText }}</Typography> 
        </div> 
    </div> 
</template> 
 
<script setup lang="ts"> 
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'; 
import type { 
    FileInput, 
    FileInputFile, 
    FileInputRejectCode, 
    FileInputRejectContext, 
    FileInputRejection, 
} from '../../interfaces/forms/FileInput.interface'; 
import { useFieldState, useFieldClasses } from '../../composables/useField'; 
import { useModoLocale, useResolvedSize, useSizeTokens } from '../../composables/useModoConfig';
import { interpolate } from '../../config/ModoLocale'; 
import { ArrowUpTrayIcon, XMarkIcon, PhotoIcon, DocumentIcon } from '@heroicons/vue/24/outline'; 
import Button from './Button.vue'; 
import Typography from '../data-display/Typography.vue'; 
 
const props = withDefaults(defineProps<FileInput>(), { 
    modelValue: null, 
    multiple: false, 
    previews: true, 
    dropzone: true, 
    dropzoneVariant: 'inline', 
    dropzoneHeight: 'medium', 
    dashed: false, 
    clickToSelect: true, 
    variant: 'outline', 
    color: 'default', 
    disabled: false, 
    readonly: false, 
    required: false, 
    loading: false, 
    fullWidth: false, 
    // `placeholder` is resolved at render time against the locale fallback. 
    // Leaving the default undefined so `props.placeholder ?? loc...` works. 
    autofocus: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size);
const sz = useSizeTokens(() => props.size);

const emit = defineEmits<{ 
    'update:modelValue': [files: File[] | null]; 
    change: [files: File[] | null]; 
    add: [files: File[]]; 
    remove: [file: File]; 
    reject: [rejections: FileInputRejection[]]; 
}>(); 
 
const loc = useModoLocale(); 
 
const { 
    fieldId, hasError, isDisabled, errorId, helperId, describedBy, 
    stateColor, radius, 
} = useFieldState(props, { componentName: 'FileInput', idPrefix: 'modo-file' }); 
 
const { wrapperVariantClasses, radiusClasses } = useFieldClasses({ 
    variant: () => props.variant, 
    stateColor, hasError, radius, 
    forceFocus: () => isDragOver.value, 
    halo: () => props.halo, 
}); 
 
const inputEl = ref<HTMLInputElement | null>(null); 
const isDragOver = ref(false); 
const internalFiles = ref<FileInputFile[]>([]); 
const autoId = useId(); 
let counter = 0; 
const makeId = () => `modo-file-${autoId}-${++counter}`; 
 
function isImage(entry: FileInputFile) { 
    return entry.type.startsWith('image/'); 
} 
 
function formatBytes(n: number) { 
    if (n < 1024) return `${n} B`; 
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`; 
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`; 
    return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`; 
} 
 
function openFilePicker() { 
    if (isDisabled.value || props.readonly) return; 
    inputEl.value?.click(); 
} 
 
function validate(file: File): { code: FileInputRejectCode; limit?: number | string } | null { 
    if (props.maxSize && file.size > props.maxSize) { 
        return { code: 'size', limit: props.maxSize }; 
    } 
    // Accept check (simple prefix + ext match) 
    if (props.accept) { 
        const tokens = props.accept.split(',').map((t) => t.trim().toLowerCase()); 
        const name = file.name.toLowerCase(); 
        const type = file.type.toLowerCase(); 
        const ok = tokens.some((t) => { 
            if (t.startsWith('.')) return name.endsWith(t); 
            if (t.endsWith('/*')) return type.startsWith(t.slice(0, -1)); 
            return type === t; 
        }); 
        if (!ok) return { code: 'type', limit: props.accept }; 
    } 
    return null; 
} 
 
/** 
 * Reject message resolver with three-tier precedence: 
 *   1. Per-component prop `rejectMessages` (fn > string with `{limit}`). 
 *   2. `ModoProvider`-level `locale.fileInput.reject`. 
 *   3. Built-in English defaults in `defaultLocale`. 
 */ 
function resolveRejectMessage(ctx: FileInputRejectContext): string { 
    const override = props.rejectMessages?.[ctx.code]; 
    if (typeof override === 'function') return override(ctx); 
    if (typeof override === 'string') { 
        return applyLimit(override, ctx); 
    } 
    // Fall back to locale (which itself falls back to defaultLocale EN). 
    const reject = loc.value.fileInput.reject; 
    let template: string; 
    if (ctx.code === 'size') { 
        template = typeof ctx.limit === 'number' ? reject.size : reject.sizeNoLimit; 
    } else if (ctx.code === 'count') { 
        template = typeof ctx.limit === 'number' ? reject.count : reject.countNoLimit; 
    } else { 
        template = reject.type; 
    } 
    return applyLimit(template, ctx); 
} 
 
function applyLimit(template: string, ctx: FileInputRejectContext): string { 
    if (!template.includes('{limit}')) return template; 
    const value = 
        typeof ctx.limit === 'number' && ctx.code === 'size' 
            ? ctx.formatBytes(ctx.limit) 
            : String(ctx.limit ?? ''); 
    return template.split('{limit}').join(value); 
} 
 
function buildRejection( 
    file: File, 
    code: FileInputRejectCode, 
    limit?: number | string, 
): FileInputRejection { 
    const ctx: FileInputRejectContext = { file, code, limit, formatBytes }; 
    return { file, code, limit, message: resolveRejectMessage(ctx) }; 
} 
 
function addFiles(list: FileList | File[]) { 
    const incoming = Array.from(list); 
    const accepted: FileInputFile[] = []; 
    const rejected: FileInputRejection[] = []; 
 
    for (const file of incoming) { 
        const err = validate(file); 
        if (err) { 
            rejected.push(buildRejection(file, err.code, err.limit)); 
            continue; 
        } 
        const entry: FileInputFile = { 
            id: makeId(), 
            file, 
            name: file.name, 
            size: file.size, 
            type: file.type, 
        }; 
        if (props.previews && file.type.startsWith('image/')) { 
            entry.previewUrl = URL.createObjectURL(file); 
        } 
        accepted.push(entry); 
    } 
 
    // Respect multiple + maxFiles 
    if (!props.multiple) { 
        // Replace with first 
        revokeAll(); 
        internalFiles.value = accepted.slice(0, 1); 
    } else { 
        const next = [...internalFiles.value, ...accepted]; 
        if (props.maxFiles && next.length > props.maxFiles) { 
            const overflow = next.slice(props.maxFiles); 
            overflow.forEach((e) => { 
                if (e.previewUrl) URL.revokeObjectURL(e.previewUrl); 
            }); 
            internalFiles.value = next.slice(0, props.maxFiles); 
            overflow.forEach((e) => 
                rejected.push(buildRejection(e.file, 'count', props.maxFiles)), 
            ); 
        } else { 
            internalFiles.value = next; 
        } 
    } 
 
    if (accepted.length) emit('add', accepted.map((e) => e.file)); 
    if (rejected.length) emit('reject', rejected); 
    emitUpdate(); 
} 
 
function removeFile(id: string) { 
    const idx = internalFiles.value.findIndex((e) => e.id === id); 
    if (idx === -1) return; 
    const [removed] = internalFiles.value.splice(idx, 1); 
    if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl); 
    emit('remove', removed.file); 
    emitUpdate(); 
} 
 
function emitUpdate() { 
    const out = internalFiles.value.map((e) => e.file); 
    emit('update:modelValue', out.length ? out : null); 
    emit('change', out.length ? out : null); 
} 
 
function revokeAll() { 
    internalFiles.value.forEach((e) => { 
        if (e.previewUrl) URL.revokeObjectURL(e.previewUrl); 
    }); 
    internalFiles.value = []; 
} 
 
onBeforeUnmount(() => revokeAll()); 
 
/* ---------- Events ---------- */ 
 
function onPickerChange(e: Event) { 
    const input = e.target as HTMLInputElement; 
    if (input.files && input.files.length) { 
        addFiles(input.files); 
    } 
    // Reset para permitir re-seleccionar el mismo archivo 
    input.value = ''; 
} 
 
function onDragOver(e: DragEvent) { 
    if (!props.dropzone || isDisabled.value || props.readonly) return; 
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; 
    isDragOver.value = true; 
} 
function onDragLeave() { 
    isDragOver.value = false; 
} 
function onDrop(e: DragEvent) { 
    isDragOver.value = false; 
    if (!props.dropzone || isDisabled.value || props.readonly) return; 
    if (e.dataTransfer?.files?.length) { 
        addFiles(e.dataTransfer.files); 
    } 
} 
 
function onWrapperClick(e: MouseEvent) { 
    if (!isAreaVariant.value) return; 
    if (!props.clickToSelect) return; 
    if (isDisabled.value || props.readonly) return; 
    // Ignora clicks provenientes de elementos interactivos (botones, remove) 
    const target = e.target as HTMLElement | null; 
    if (target?.closest('button, a, input, [role="button"][data-modo-item]')) return; 
    openFilePicker(); 
} 
function onWrapperKeydown(e: KeyboardEvent) { 
    if (!isAreaVariant.value) return; 
    if (!props.clickToSelect) return; 
    if (isDisabled.value || props.readonly) return; 
    if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        openFilePicker(); 
    } 
} 
 
/* ---------- Merge external progress / errors ---------- */ 
const files = computed<FileInputFile[]>(() => 
    internalFiles.value.map((e) => ({ 
        ...e, 
        progress: props.progress?.[e.id] ?? e.progress, 
        error: props.errors?.[e.id] ?? e.error, 
    })), 
); 
 
/* ---------- v-model sync from outside ---------- */ 
watch(() => props.modelValue, (v) => { 
    if (!v) { 
        if (internalFiles.value.length) revokeAll(); 
        return; 
    } 
    // Solo sincroniza si el caller reemplazó la lista entera con otras refs. 
    const current = internalFiles.value.map((e) => e.file); 
    if (v.length === current.length && v.every((f, i) => f === current[i])) return; 
    revokeAll(); 
    const wrapped: FileInputFile[] = v.map((file) => { 
        const entry: FileInputFile = { 
            id: makeId(), 
            file, 
            name: file.name, 
            size: file.size, 
            type: file.type, 
        }; 
        if (props.previews && file.type.startsWith('image/')) { 
            entry.previewUrl = URL.createObjectURL(file); 
        } 
        return entry; 
    }); 
    internalFiles.value = wrapped; 
}, { immediate: true }); 
 
/* ---------- Display ---------- */ 
 
const headlineText = computed(() => { 
    if (files.value.length === 1) return files.value[0].name; 
    return interpolate(loc.value.fileInput.filesSelected, { count: files.value.length }); 
}); 
 
const helperInlineText = computed(() => { 
    const bits: string[] = []; 
    if (props.accept) bits.push(props.accept); 
    if (props.maxSize) bits.push(interpolate(loc.value.fileInput.hintUpTo, { limit: formatBytes(props.maxSize) })); 
    if (props.multiple && props.maxFiles) bits.push(interpolate(loc.value.fileInput.hintMax, { limit: props.maxFiles })); 
    return bits.join(' · '); 
}); 
 
const browseLabel = computed(() => 
    props.multiple 
        ? (files.value.length ? loc.value.fileInput.addMore : loc.value.fileInput.browse) 
        : (files.value.length ? loc.value.fileInput.replace : loc.value.fileInput.browse), 
); 
 
/* ---------- Size maps ---------- */
const wrapperSizeClasses = computed(() => `${sz.value.control} ${sz.value.padX}`);
const iconSizeClasses = computed(() => sz.value.icon); 
 
/* ---------- Area variant ---------- */ 
const isAreaVariant = computed(() => props.dropzoneVariant === 'area'); 
 
const areaHeightClasses = computed(() => { 
    switch (props.dropzoneHeight) { 
        case 'small': return 'min-h-[120px] py-4'; 
        case 'large': return 'min-h-[240px] py-10'; 
        default: return 'min-h-[180px] py-8'; 
    } 
}); 
 
const areaIconSizeClasses = computed(() => { 
    switch (props.dropzoneHeight) { 
        case 'small': return 'w-8 h-8'; 
        case 'large': return 'w-14 h-14'; 
        default: return 'w-10 h-10'; 
    } 
}); 
 
const areaPrimaryText = computed(() => { 
    if (props.dropzoneLabel) return props.dropzoneLabel; 
    if (files.value.length === 0) { 
        return props.multiple 
            ? loc.value.fileInput.dropzoneLabelMultiple 
            : loc.value.fileInput.dropzoneLabel; 
    } 
    return headlineText.value; 
}); 
 
const areaSecondaryText = computed<string | undefined>(() => { 
    if (props.dropzoneHint) return props.dropzoneHint; 
    return helperInlineText.value || undefined; 
}); 
 
/* ---------- Color / dashed accents ---------- */ 
const ACCENT_TEXT_BY_COLOR: Record<string, string> = { 
    default: 'text-foreground', 
    primary: 'text-primary', 
    danger: 'text-destructive', 
    success: 'text-success', 
    warning: 'text-warning', 
}; 
const ACCENT_TEXT_IDLE_BY_COLOR: Record<string, string> = { 
    default: 'text-muted-foreground', 
    primary: 'text-primary/70', 
    danger: 'text-destructive/70', 
    success: 'text-success/70', 
    warning: 'text-warning/70', 
}; 
// Dashed variant keeps a transparent surface — colored fills felt heavy 
// against form backgrounds. Color only surfaces via icon/button accents. 
const DRAG_OVER_RING_BY_COLOR: Record<string, string> = { 
    default: 'ring-4 ring-foreground/25 border-foreground', 
    primary: 'ring-4 ring-primary/40 border-primary', 
    danger: 'ring-4 ring-destructive/40 border-destructive', 
    success: 'ring-4 ring-success/40 border-success', 
    warning: 'ring-4 ring-warning/40 border-warning', 
}; 
const PROGRESS_FILL_BY_COLOR: Record<string, string> = { 
    default: 'bg-foreground', 
    primary: 'bg-primary', 
    danger: 'bg-destructive', 
    success: 'bg-success', 
    warning: 'bg-warning', 
}; 
 
const accentTextClass = computed(() => ACCENT_TEXT_BY_COLOR[stateColor.value] ?? ACCENT_TEXT_BY_COLOR.default); 
const accentTextIdleClass = computed(() => ACCENT_TEXT_IDLE_BY_COLOR[stateColor.value] ?? ACCENT_TEXT_IDLE_BY_COLOR.default); 
// Idle border is always neutral — the color only surfaces as accent on 
// drag-over, focus, or in the upload Button. Matches Modal/Card surface pattern. 
const colorBorderClass = computed(() => ''); 
const dragOverRingClass = computed(() => 
    DRAG_OVER_RING_BY_COLOR[stateColor.value] ?? DRAG_OVER_RING_BY_COLOR.default, 
); 
const progressFillClass = computed(() => 
    PROGRESS_FILL_BY_COLOR[stateColor.value] ?? PROGRESS_FILL_BY_COLOR.default, 
); 
 
/** Wrapper classes when `dashed=true` (overrides the field variant entirely). */ 
const dashedWrapperClasses = computed(() => { 
    // Border stays neutral; only error state gets a colored border. 
    const borderTint = hasError.value ? 'border-destructive/50' : 'border-border'; 
    return [ 
        'border-2 border-dashed', 
        borderTint, 
    ].join(' '); 
}); 
 
/* ---------- Radius helpers ---------- */ 
const itemRadiusClass = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-lg'; 
        case 'full': return 'rounded-xl'; 
        default: return 'rounded-md'; 
    } 
}); 
const itemThumbRadiusClass = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-md'; 
        case 'full': return 'rounded-lg'; 
        default: return 'rounded-md'; 
    } 
}); 
const progressRadiusClass = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        default: return 'rounded-full'; 
    } 
}); 
</script> 
 
<style scoped> 
/* File item enter/leave + move. Mirrors the MultiSelect chip pattern but 
 * collapses vertical space (max-height + margin-bottom + padding) so siblings 
 * slide cleanly when files are added or removed. 
 * 
 * NOTE: spacing between items uses margin-bottom (see template), NOT the 
 * parent's `gap`. `gap` cannot animate per-item so removing the first 
 * file would leave a 6px gap that snaps closed when the node unmounts. 
 */ 
.modo-file-enter-active, 
.modo-file-leave-active { 
    transition: 
        opacity 220ms cubic-bezier(0.2, 0, 0, 1), 
        transform 260ms cubic-bezier(0.2, 0, 0, 1), 
        max-height 260ms cubic-bezier(0.2, 0, 0, 1), 
        margin-bottom 260ms cubic-bezier(0.2, 0, 0, 1), 
        padding-top 260ms cubic-bezier(0.2, 0, 0, 1), 
        padding-bottom 260ms cubic-bezier(0.2, 0, 0, 1), 
        border-width 260ms cubic-bezier(0.2, 0, 0, 1); 
    overflow: hidden; 
} 
.modo-file-move { 
    transition: transform 260ms cubic-bezier(0.2, 0, 0, 1); 
} 
.modo-file-enter-from, 
.modo-file-leave-to { 
    opacity: 0; 
    transform: translateY(-4px) scale(0.98); 
    max-height: 0; 
    margin-bottom: 0 !important; 
    padding-top: 0; 
    padding-bottom: 0; 
    border-width: 0; 
} 
.modo-file-enter-to, 
.modo-file-leave-from { 
    /* 5rem comfortably fits the tallest file row (40px thumb + padding). */ 
    max-height: 5rem; 
} 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-file-enter-active, 
    .modo-file-leave-active, 
    .modo-file-move { 
        transition: none; 
    } 
    .modo-file-enter-from, 
    .modo-file-leave-to { 
        opacity: 1; 
        transform: none; 
        max-height: none; 
        margin-bottom: initial !important; 
        padding: initial; 
        border-width: initial; 
    } 
} 
</style>
