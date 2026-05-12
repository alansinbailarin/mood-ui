<template>
    <Modal
        :model-value="modelValue"
        :title="loc.cropTitle"
        size="small"
        :close-on-overlay="false"
        :show-close="true"
        @update:model-value="$emit('update:modelValue', $event)"
        @close="$emit('cancel')"
    >
        <template #body>
            <div class="modo-avatar-cropper flex flex-col items-center gap-4">
                <!-- Canvas -->
                <div class="relative">
                    <canvas
                        :ref="(el) => { crop.canvasRef.value = el as HTMLCanvasElement | null; }"
                        :width="CANVAS_SIZE"
                        :height="CANVAS_SIZE"
                        :style="{ width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }"
                        class="rounded-full cursor-grab active:cursor-grabbing touch-none select-none"
                        :aria-label="loc.cropTitle"
                        role="img"
                        @pointerdown="crop.onPointerDown"
                        @pointermove="crop.onPointerMove"
                        @pointerup="crop.onPointerUp"
                        @pointerleave="crop.onPointerUp"
                        @wheel.prevent="crop.onWheel"
                        @touchstart.prevent="crop.onTouchStart"
                        @touchmove.prevent="crop.onTouchMove"
                        @touchend="crop.onTouchEnd"
                    />
                    <Skeleton
                        v-if="!crop.isReady.value"
                        shape="circle"
                        :width="CANVAS_SIZE"
                        :height="CANVAS_SIZE"
                        class="absolute inset-0"
                    />
                </div>

                <!-- Zoom slider -->
                <div class="flex items-center gap-3 w-full px-1">
                    <component :is="MagnifyingGlassMinusIcon" class="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <input
                        type="range"
                        :min="crop.MIN_ZOOM"
                        :max="crop.MAX_ZOOM"
                        :step="0.05"
                        :value="crop.zoom.value"
                        class="w-full accent-primary h-1 rounded-full cursor-pointer"
                        :aria-label="'Zoom'"
                        @input="crop.setZoom(Number(($event.target as HTMLInputElement).value))"
                    />
                    <component :is="MagnifyingGlassPlusIcon" class="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                </div>
            </div>
        </template>

        <template #footer="{ close }">
            <div class="flex items-center justify-between w-full gap-3">
                <Button
                    :label="loc.cropReset"
                    variant="ghost"
                    size="small"
                    @click="crop.reset()"
                />
                <div class="flex gap-2">
                    <Button
                        :label="loc.cancelLabel"
                        variant="outline"
                        size="small"
                        @click="close(); $emit('cancel')"
                    />
                    <Button
                        :label="loc.cropConfirm"
                        color="primary"
                        size="small"
                        :loading="isExporting"
                        @click="handleConfirm"
                    />
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/vue/24/outline';
import Modal from '../feedback/Modal.vue';
import Button from './Button.vue';
import Skeleton from '../feedback/Skeleton.vue';
import { useAvatarCrop } from '../../composables/useAvatarCrop';
import { useModoLocale } from '../../composables/useModoConfig';

const CANVAS_SIZE = 280;

const props = defineProps<{
    modelValue: boolean;
    imageSrc: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'confirm': [blob: Blob];
    'cancel': [];
}>();

const localeRef = useModoLocale();
const loc = computed(() => localeRef.value.avatarUpload);
const crop = useAvatarCrop();
const isExporting = ref(false);

// Load image whenever the modal opens or the source changes
watch(
    () => [props.modelValue, props.imageSrc] as const,
    ([open, src]) => {
        if (open && src) {
            crop.loadImage(src, CANVAS_SIZE);
        }
    },
    { immediate: true },
);

async function handleConfirm() {
    isExporting.value = true;
    try {
        const blob = await crop.exportCroppedBlob();
        emit('confirm', blob);
        emit('update:modelValue', false);
    } finally {
        isExporting.value = false;
    }
}
</script>
