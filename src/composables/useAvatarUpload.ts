import { ref, onUnmounted } from 'vue';

const DEFAULT_ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const TARGET_SIZE = 512;
const WEBP_QUALITY = 0.85;

export interface AvatarUploadValidationError {
    code: 'size' | 'type';
    file: File;
}

/**
 * Handles file selection, validation, resize and compression.
 * Returns a temporary object URL for immediate preview and a
 * processed Blob (512×512 image/webp) for the cropper / emit.
 */
export function useAvatarUpload(options: {
    maxSize?: () => number | undefined;
    accept?: () => string[] | undefined;
}) {
    const isProcessing = ref(false);
    const uploadError = ref<Error | null>(null);

    // Track object URLs for cleanup
    const objectUrls: string[] = [];

    onUnmounted(() => {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
    });

    function createObjectUrl(blob: Blob | File): string {
        const url = URL.createObjectURL(blob);
        objectUrls.push(url);
        return url;
    }

    function revokeUrl(url: string): void {
        URL.revokeObjectURL(url);
        const idx = objectUrls.indexOf(url);
        if (idx !== -1) objectUrls.splice(idx, 1);
    }

    function validate(file: File): AvatarUploadValidationError | null {
        const acceptList = options.accept?.() ?? DEFAULT_ACCEPT;
        if (!acceptList.includes(file.type)) {
            return { code: 'type', file };
        }
        const maxSize = options.maxSize?.() ?? DEFAULT_MAX_SIZE;
        if (file.size > maxSize) {
            return { code: 'size', file };
        }
        return null;
    }

    /**
     * Resize the image to TARGET_SIZE × TARGET_SIZE using a canvas,
     * preserving aspect ratio (cover crop centered).
     * Returns an image/webp Blob at WEBP_QUALITY.
     */
    async function resizeToBlob(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const srcUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(srcUrl);

                const canvas = document.createElement('canvas');
                canvas.width = TARGET_SIZE;
                canvas.height = TARGET_SIZE;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas 2D context unavailable'));
                    return;
                }

                // Cover-fit: scale to fill TARGET_SIZE square, centered
                const scale = Math.max(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
                const scaledW = img.width * scale;
                const scaledH = img.height * scale;
                const offsetX = (TARGET_SIZE - scaledW) / 2;
                const offsetY = (TARGET_SIZE - scaledH) / 2;

                ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas toBlob failed'));
                    },
                    'image/webp',
                    WEBP_QUALITY,
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(srcUrl);
                reject(new Error('Failed to load image'));
            };

            img.src = srcUrl;
        });
    }

    /**
     * Process a File: validate → resize → return preview URL + blob.
     * Throws an AvatarUploadValidationError-shaped Error on validation failure.
     */
    async function processFile(file: File): Promise<{ previewUrl: string; blob: Blob }> {
        uploadError.value = null;
        isProcessing.value = true;

        try {
            const validationError = validate(file);
            if (validationError) {
                const err = Object.assign(
                    new Error(`Avatar upload rejected: ${validationError.code}`),
                    validationError,
                );
                throw err;
            }

            const blob = await resizeToBlob(file);
            const previewUrl = createObjectUrl(blob);

            return { previewUrl, blob };
        } catch (err) {
            uploadError.value = err instanceof Error ? err : new Error(String(err));
            throw uploadError.value;
        } finally {
            isProcessing.value = false;
        }
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getAllowedExtensions(accept: string[]): string {
        return accept
            .map((t) => t.replace('image/', '.').toUpperCase())
            .join(', ');
    }

    return {
        isProcessing,
        uploadError,
        processFile,
        createObjectUrl,
        revokeUrl,
        formatFileSize,
        getAllowedExtensions,
        DEFAULT_ACCEPT,
        DEFAULT_MAX_SIZE,
    };
}
