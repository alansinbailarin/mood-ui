<template>
    <div
        :class="['modo-avatar-upload inline-flex flex-col items-center gap-4', { 'opacity-50 pointer-events-none': props.disabled }]"
        :aria-disabled="props.disabled || undefined"
    >
        <!-- Screen-reader live region for AI status announcements -->
        <div
            aria-live="polite"
            aria-atomic="true"
            class="sr-only"
        >{{ srAnnouncement }}</div>

        <!-- Preview + dropzone -->
        <div class="relative">
            <button
                type="button"
                :class="[
                    'modo-avatar-dropzone relative flex items-center justify-center',
                    'rounded-full overflow-hidden cursor-pointer transition-all duration-200',
                    'border-2 border-dashed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    previewUrl
                        ? 'border-transparent hover:border-primary/40'
                        : 'border-border hover:border-primary/60 hover:bg-muted/40 bg-muted/20',
                    sizeClasses,
                ]"
                :aria-label="loc.uploadLabel"
                :aria-busy="isLoading || undefined"
                :disabled="props.disabled || props.readonly || undefined"
                @click="openFilePicker"
                @keydown.enter.prevent="openFilePicker"
                @keydown.space.prevent="openFilePicker"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
            >
                <!-- Loading skeleton -->
                <Skeleton
                    v-if="isLoading"
                    shape="circle"
                    :width="previewSizePx"
                    :height="previewSizePx"
                    class="absolute inset-0"
                />

                <!-- Avatar with current image -->
                <template v-else-if="previewUrl">
                    <img
                        :src="previewUrl"
                        :alt="avatarAlt"
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <!-- Hover overlay -->
                    <div
                        v-if="!props.readonly"
                        :class="[
                            'absolute inset-0 flex items-center justify-center',
                            'bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200',
                        ]"
                        aria-hidden="true"
                    >
                        <component :is="CameraIcon" class="w-6 h-6 text-white" />
                    </div>
                </template>

                <!-- Empty state -->
                <template v-else>
                    <component
                        :is="UserCircleIcon"
                        class="text-muted-foreground pointer-events-none"
                        :class="emptyIconClass"
                        aria-hidden="true"
                    />
                </template>

                <!-- Drag overlay -->
                <div
                    v-if="isDragging"
                    class="absolute inset-0 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center"
                    aria-hidden="true"
                >
                    <component :is="ArrowUpTrayIcon" class="w-6 h-6 text-primary" />
                </div>
            </button>

            <!-- Lightbox expand button -->
            <Tooltip v-if="props.lightbox && previewUrl" content="View full size" placement="top">
                <button
                    type="button"
                    class="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    :aria-label="'View full size'"
                    @click.stop="showLightbox = true"
                >
                    <component :is="ArrowsPointingOutIcon" class="w-3 h-3" />
                </button>
            </Tooltip>

            <!-- AI-generated badge -->
            <div
                v-if="isAiGenerated && previewUrl"
                class="absolute -bottom-1 -right-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                :aria-label="loc.aiLabel"
            >
                <component :is="SparklesIcon" class="w-3 h-3" aria-hidden="true" />
                <span class="hidden sm:inline">{{ loc.aiLabel }}</span>
            </div>

            <!-- Unsaved indicator -->
            <div
                v-if="hasPendingImage && effectiveSaveMode !== 'none'"
                class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-warning border-2 border-background"
                :aria-label="'Unsaved changes'"
                role="status"
            />
        </div>

        <!-- Error message -->
        <p
            v-if="errorMessage"
            role="alert"
            class="text-xs text-destructive text-center max-w-[200px]"
        >{{ errorMessage }}</p>

        <!-- Hint text (no image, not readonly) -->
        <p
            v-if="!previewUrl && !props.readonly && !errorMessage"
            class="text-xs text-muted-foreground text-center"
        >{{ loc.dragPrompt }}</p>

        <!-- Action buttons -->
        <div
            v-if="!props.readonly"
            class="flex items-center gap-1.5 flex-wrap justify-center"
        >
            <!-- Upload button -->
            <slot
                name="actions"
                :generate="handleGenerate"
                :upload="openFilePicker"
                :remove="handleRemove"
                :save="handleSave"
                :loading="isLoading"
                :has-pending-image="hasPendingImage"
            >
                <Tooltip :content="loc.uploadLabel" placement="bottom">
                    <Button
                        variant="outline"
                        size="small"
                        :icon="ArrowUpTrayIcon"
                        :aria-label="loc.uploadLabel"
                        :disabled="props.disabled || isSaving"
                        @click="openFilePicker"
                    />
                </Tooltip>

                <!-- Remove button (only when there's an image) -->
                <Tooltip v-if="previewUrl" :content="loc.removeLabel" placement="bottom">
                    <Button
                        variant="outline"
                        size="small"
                        :icon="TrashIcon"
                        :aria-label="loc.removeLabel"
                        :disabled="props.disabled || isLoading || isSaving"
                        @click="handleRemove"
                    />
                </Tooltip>

                <!-- AI buttons -->
                <template v-if="props.ai && hasProvider">
                    <!-- Generate -->
                    <Tooltip :content="loc.generateLabel" placement="bottom">
                        <Button
                            variant="outline"
                            size="small"
                            :icon="SparklesIcon"
                            :aria-label="loc.generateLabel"
                            :loading="isGenerating"
                            :disabled="props.disabled || isSaving"
                            @click="handleGenerate"
                        />
                    </Tooltip>

                    <!-- Regenerate (after first generation) -->
                    <Tooltip v-if="props.regenerate !== false && isAiGenerated" :content="loc.regenerateLabel" placement="bottom">
                        <Button
                            variant="ghost"
                            size="small"
                            :icon="ArrowPathIcon"
                            :aria-label="loc.regenerateLabel"
                            :loading="isGenerating"
                            :disabled="props.disabled || isSaving"
                            @click="handleRegenerate"
                        />
                    </Tooltip>
                </template>

                <!-- Save button -->
                <Tooltip v-if="showSaveButton" :content="loc.saveLabel" placement="bottom">
                    <slot
                        name="save-button"
                        :save="handleSave"
                        :loading="isSaving"
                        :has-pending-image="hasPendingImage"
                    >
                        <Button
                            color="primary"
                            size="small"
                            :icon="CheckIcon"
                            :label="loc.saveLabel"
                            :loading="isSaving"
                            :aria-label="loc.saveLabel"
                            :aria-busy="isSaving || undefined"
                            :disabled="props.disabled || !hasPendingImage"
                            @click="handleSave"
                        />
                    </slot>
                </Tooltip>
            </slot>
        </div>

        <!-- AI Prompt area -->
        <div
            v-if="props.ai && hasProvider"
            class="w-full max-w-[280px] flex flex-col gap-2"
        >
            <!-- Variant selector -->
            <div
                role="radiogroup"
                :aria-label="loc.variantLabel"
                class="flex flex-wrap gap-1.5"
            >
                <button
                    v-for="v in VARIANTS"
                    :key="v.value"
                    type="button"
                    role="radio"
                    :aria-checked="currentVariant === v.value"
                    :class="[
                        'px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer',
                        currentVariant === v.value
                            ? 'bg-primary/10 border-primary/50 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-accent',
                    ]"
                    @click="currentVariant = v.value"
                    @keydown.space.prevent="currentVariant = v.value"
                >
                    {{ v.label }}
                </button>
            </div>

            <!-- Prompt suggestions -->
            <div
                v-if="props.promptSuggestions?.length"
                class="flex flex-wrap gap-1.5"
                role="group"
                :aria-label="loc.promptSuggestionsLabel"
            >
                <button
                    v-for="s in props.promptSuggestions"
                    :key="s"
                    type="button"
                    :aria-pressed="prompt === s"
                    :class="[
                        'px-2.5 py-1 rounded-full text-xs border transition-colors cursor-pointer',
                        prompt === s
                            ? 'bg-secondary border-secondary-foreground/30 text-secondary-foreground font-medium'
                            : 'border-border text-muted-foreground hover:border-foreground/30 hover:bg-accent',
                    ]"
                    :disabled="props.disabled || isGenerating || isSaving || undefined"
                    @click="prompt = prompt === s ? '' : s"
                >
                    {{ s }}
                </button>
            </div>

            <!-- Prompt input -->
            <div class="flex gap-2">
                <input
                    v-model="prompt"
                    type="text"
                    :placeholder="props.promptPlaceholder ?? loc.promptPlaceholder"
                    :disabled="props.disabled || isGenerating || isSaving"
                    class="flex-1 min-w-0 px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-colors"
                    @keydown.enter.prevent="handleGenerate"
                />
                <Button
                    color="primary"
                    size="small"
                    :icon="SparklesIcon"
                    :aria-label="loc.generateLabel"
                    :loading="isGenerating"
                    :disabled="props.disabled || isSaving"
                    @click="handleGenerate"
                />
            </div>
        </div>

        <!-- Hidden file input -->
        <input
            ref="fileInputRef"
            type="file"
            :accept="acceptString"
            class="sr-only"
            tabindex="-1"
            aria-hidden="true"
            @change="handleFileInput"
        />

        <!-- Lightbox modal -->
        <Modal
            v-if="props.lightbox && previewUrl"
            v-model="showLightbox"
            size="large"
            :closable="true"
        >
            <template #body>
                <div class="flex items-center justify-center p-2">
                    <img
                        :src="previewUrl"
                        :alt="avatarAlt"
                        class="max-w-full max-h-[80vh] rounded-lg object-contain"
                    />
                </div>
            </template>
        </Modal>

        <!-- Crop modal -->
        <AvatarCropper
            v-if="cropSrc"
            v-model="showCropper"
            :image-src="cropSrc"
            @confirm="handleCropConfirm"
            @cancel="handleCropCancel"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    UserCircleIcon,
    CameraIcon,
    ArrowUpTrayIcon,
    TrashIcon,
    ArrowPathIcon,
    CheckIcon,
    SparklesIcon,
    ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline';
import Avatar from '../data-display/avatar/Avatar.vue';
import Button from './Button.vue';
import Skeleton from '../feedback/Skeleton.vue';
import Tooltip from '../feedback/Tooltip.vue';
import Modal from '../feedback/Modal.vue';
import AvatarCropper from './AvatarCropper.vue';
import { useAvatarProvider } from '../../composables/useAvatarProvider';
import { useAvatarUpload } from '../../composables/useAvatarUpload';
import { useModoLocale } from '../../composables/useModoConfig';
import { interpolate } from '../../config/ModoLocale';
import type { AvatarUpload, AvatarSavePayload, AvatarVariant } from '../../interfaces/forms/AvatarUpload.interface';

// Suppress unused import warning — Avatar is available for slot use
void Avatar;

const props = withDefaults(defineProps<AvatarUpload>(), {
    ai: false,
    crop: true,
    maxSize: 5 * 1024 * 1024,
    accept: () => ['image/png', 'image/jpeg', 'image/webp'],
    preview: true,
    size: 'medium',
});

const emit = defineEmits<{
    'update:modelValue': [value: string];
    'generated': [url: string];
    'uploaded': [file: File];
    'error': [err: Error];
    'loading': [state: boolean];
    'change': [value: string | null];
    'remove': [];
    'save': [payload: AvatarSavePayload];
    'saved': [finalUrl: string];
    'save-error': [err: Error];
}>();

defineExpose({ reset, generate: handleGenerate, clear: handleRemove });

// -----------------------------------------------------------------
// Locale
// -----------------------------------------------------------------
const localeRef = useModoLocale();
const loc = computed(() => localeRef.value.avatarUpload);

// -----------------------------------------------------------------
// Composables
// -----------------------------------------------------------------
const { hasProvider, isGenerating, generate, cancel: cancelGenerate } = useAvatarProvider(
    () => props.provider,
);
const {
    isProcessing,
    processFile,
    createObjectUrl,
    revokeUrl,
    formatFileSize,
    getAllowedExtensions,
    DEFAULT_MAX_SIZE,
    DEFAULT_ACCEPT,
} = useAvatarUpload({
    maxSize: () => props.maxSize,
    accept: () => props.accept,
});

// -----------------------------------------------------------------
// State
// -----------------------------------------------------------------
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string>(props.modelValue ?? '');
const pendingBlob = ref<Blob | null>(null);
const pendingRemoteUrl = ref<string | undefined>(undefined);
const isAiGenerated = ref(false);
const hasPendingImage = ref(false);
const isSaving = ref(false);
const prompt = ref('');
const currentVariant = ref<AvatarVariant>(props.variant ?? 'default');
const isDragging = ref(false);
const errorMessage = ref('');
const srAnnouncement = ref('');
const showCropper = ref(false);
const cropSrc = ref('');
const lastGeneratedPrompt = ref('');
const showLightbox = ref(false);

// -----------------------------------------------------------------
// Computed
// -----------------------------------------------------------------
const isLoading = computed(() => isProcessing.value || isGenerating.value || isSaving.value);

const effectiveSaveMode = computed<'auto' | 'manual' | 'none'>(() => {
    if (props.saveMode) return props.saveMode;
    return props.onSave ? 'manual' : 'none';
});

const showSaveButton = computed(
    () => effectiveSaveMode.value === 'manual' && hasPendingImage.value,
);

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'small':  return 'w-16 h-16';
        case 'large':  return 'w-28 h-28';
        default:       return 'w-20 h-20';
    }
});

const previewSizePx = computed(() => {
    switch (props.size) {
        case 'small':  return 64;
        case 'large':  return 112;
        default:       return 80;
    }
});

const emptyIconClass = computed(() => {
    switch (props.size) {
        case 'small': return 'w-8 h-8';
        case 'large': return 'w-14 h-14';
        default:      return 'w-10 h-10';
    }
});

const avatarAlt = computed(() => {
    if (isAiGenerated.value) return loc.value.generated;
    if (props.name) return `Avatar de ${props.name}`;
    return 'Avatar';
});

const acceptString = computed(() =>
    (props.accept ?? DEFAULT_ACCEPT).join(','),
);

// -----------------------------------------------------------------
// Variant options
// -----------------------------------------------------------------
const VARIANTS: { value: AvatarVariant; label: string }[] = [
    { value: 'default',      label: 'Default' },
    { value: 'realistic',    label: 'Realistic' },
    { value: 'illustration', label: 'Illustration' },
    { value: 'watercolor',   label: 'Watercolor' },
    { value: 'oilpainting',  label: 'Oil painting' },
    { value: 'anime',        label: 'Anime' },
    { value: 'cartoon',      label: 'Cartoon' },
    { value: 'chibi',        label: 'Chibi' },
    { value: 'minimal',      label: 'Minimal' },
    { value: 'cyberpunk',    label: 'Cyberpunk' },
    { value: 'sketch',       label: 'Sketch' },
    { value: 'pixel',        label: 'Pixel' },
    { value: '3d',           label: '3D' },
    { value: 'retro',        label: 'Retro' },
    { value: 'fantasy',      label: 'Fantasy' },
    { value: 'gaming',       label: 'Gaming' },
    { value: 'nft',          label: 'NFT' },
];

// -----------------------------------------------------------------
// Watch external modelValue changes
// -----------------------------------------------------------------
watch(
    () => props.modelValue,
    (val) => {
        if (val && val !== previewUrl.value) {
            previewUrl.value = val;
            hasPendingImage.value = false;
        }
    },
);

watch(
    () => props.variant,
    (v) => { if (v) currentVariant.value = v; },
);

// -----------------------------------------------------------------
// Loading emit sync
// -----------------------------------------------------------------
watch(isLoading, (v) => emit('loading', v));

// -----------------------------------------------------------------
// File picker
// -----------------------------------------------------------------
function openFilePicker() {
    if (props.disabled || props.readonly) return;
    fileInputRef.value?.click();
}

async function handleFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    (e.target as HTMLInputElement).value = '';
    await processUploadedFile(file);
}

function handleDrop(e: DragEvent) {
    isDragging.value = false;
    const file = e.dataTransfer?.files[0];
    if (file) processUploadedFile(file);
}

async function processUploadedFile(file: File) {
    errorMessage.value = '';
    try {
        const { previewUrl: newUrl, blob } = await processFile(file);

        if (props.crop) {
            cropSrc.value = newUrl;
            showCropper.value = true;
            // Store blob for after crop
            pendingBlob.value = blob;
        } else {
            await setNewImage(blob, newUrl, 'upload');
        }

        emit('uploaded', file);
    } catch (err) {
        const error = err as Error & { code?: string };
        if (error.code === 'size') {
            errorMessage.value = interpolate(loc.value.errorSize, {
                limit: formatFileSize(props.maxSize ?? DEFAULT_MAX_SIZE),
            });
        } else if (error.code === 'type') {
            errorMessage.value = interpolate(loc.value.errorType, {
                types: getAllowedExtensions(props.accept ?? DEFAULT_ACCEPT),
            });
        } else {
            errorMessage.value = loc.value.errorUpload;
        }
        emit('error', error);
    }
}

// -----------------------------------------------------------------
// Crop
// -----------------------------------------------------------------
async function handleCropConfirm(blob: Blob) {
    showCropper.value = false;
    if (cropSrc.value) revokeUrl(cropSrc.value);
    cropSrc.value = '';
    const url = createObjectUrl(blob);
    await setNewImage(blob, url, 'upload');
    isAiGenerated.value = false;
}

function handleCropCancel() {
    showCropper.value = false;
    if (cropSrc.value) revokeUrl(cropSrc.value);
    cropSrc.value = '';
    pendingBlob.value = null;
}

// -----------------------------------------------------------------
// AI generation
// -----------------------------------------------------------------
async function handleGenerate() {
    if (!hasProvider.value) return;
    errorMessage.value = '';
    srAnnouncement.value = loc.value.generating;

    try {
        // If the user already has an uploaded image in the component, pass it to
        // the provider so it can be used as a reference (img2img). Providers that
        // only support text-to-image simply ignore this parameter.
        const imageFile = pendingBlob.value
            ? new File([pendingBlob.value], 'avatar.webp', { type: pendingBlob.value.type || 'image/webp' })
            : undefined;

        const result = await generate({
            prompt: prompt.value || undefined,
            image: imageFile,
            variant: currentVariant.value !== 'default' ? currentVariant.value : undefined,
        });

        if (!result) return; // cancelled

        lastGeneratedPrompt.value = prompt.value;

        // Use the provider URL directly — <img src> loads any URL without CORS.
        // We only download as a blob if the developer provides an onSave callback
        // AND the URL is fetchable (same-origin or CORS-enabled backend URL).
        // For direct AI API calls in dev (e.g. OpenAI → Azure Blob), the URL is
        // CORS-restricted for fetch but works fine in <img>; blob stays null and
        // remoteUrl is available in the save payload for server-side proxying.
        let imageBlob: Blob | null = null;
        let imageUrl = result;

        if (props.onSave || effectiveSaveMode.value === 'auto') {
            // Attempt blob download only when a save callback will actually use it
            try {
                const res = await fetch(result);
                if (res.ok) {
                    imageBlob = await res.blob();
                    imageUrl = createObjectUrl(imageBlob);
                }
            } catch {
                // CORS-blocked — fall back to remote URL; onSave will get remoteUrl
            }
        }

        await setNewImage(imageBlob, imageUrl, 'generated', result);
        isAiGenerated.value = true;
        srAnnouncement.value = loc.value.generated;
        emit('generated', result);
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        errorMessage.value = loc.value.errorGenerate;
        srAnnouncement.value = loc.value.errorGenerate;
        emit('error', error);
    }
}

async function handleRegenerate() {
    // Keep same prompt but force a new result (no cache hit for img2img)
    await handleGenerate();
}

// -----------------------------------------------------------------
// Shared image setter
// -----------------------------------------------------------------
async function setNewImage(
    blob: Blob | null,
    url: string,
    source: AvatarSavePayload['source'],
    remoteUrl?: string,
) {
    const old = previewUrl.value;
    // Revoke previous object URLs (not remote URLs)
    if (old?.startsWith('blob:')) revokeUrl(old);

    previewUrl.value = url;
    pendingBlob.value = blob;
    pendingRemoteUrl.value = remoteUrl;
    hasPendingImage.value = true;
    emit('change', url);

    if (effectiveSaveMode.value === 'auto') {
        await handleSave(source);
    } else if (effectiveSaveMode.value === 'none') {
        // Emit immediately — developer handles persistence
        emit('update:modelValue', url);
        hasPendingImage.value = false;
    }
}

// -----------------------------------------------------------------
// Save
// -----------------------------------------------------------------
async function handleSave(source: AvatarSavePayload['source'] = 'upload') {
    if (!previewUrl.value) return;

    const blob = pendingBlob.value;
    const payload: AvatarSavePayload = {
        blob,
        url: previewUrl.value,
        remoteUrl: pendingRemoteUrl.value,
        source: isAiGenerated.value ? 'generated' : source,
        mimeType: blob?.type || 'image/webp',
        size: blob?.size ?? 0,
    };

    emit('save', payload);

    if (!props.onSave) return;

    isSaving.value = true;
    srAnnouncement.value = loc.value.saving;

    try {
        const finalUrl = await props.onSave(payload);
        if (previewUrl.value?.startsWith('blob:')) revokeUrl(previewUrl.value);
        previewUrl.value = finalUrl;
        pendingBlob.value = null;
        hasPendingImage.value = false;
        srAnnouncement.value = loc.value.saved;
        emit('update:modelValue', finalUrl);
        emit('saved', finalUrl);
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        errorMessage.value = loc.value.errorSave;
        srAnnouncement.value = loc.value.errorSave;
        emit('save-error', error);
        emit('error', error);
    } finally {
        isSaving.value = false;
    }
}

// -----------------------------------------------------------------
// Remove
// -----------------------------------------------------------------
function handleRemove() {
    cancelGenerate();
    if (previewUrl.value?.startsWith('blob:')) revokeUrl(previewUrl.value);
    previewUrl.value = '';
    pendingBlob.value = null;
    pendingRemoteUrl.value = undefined;
    isAiGenerated.value = false;
    hasPendingImage.value = false;
    errorMessage.value = '';
    prompt.value = '';
    srAnnouncement.value = '';
    emit('update:modelValue', '');
    emit('change', null);
    emit('remove');
}

// -----------------------------------------------------------------
// Public API
// -----------------------------------------------------------------
function reset() {
    handleRemove();
    currentVariant.value = props.variant ?? 'default';
}
</script>
