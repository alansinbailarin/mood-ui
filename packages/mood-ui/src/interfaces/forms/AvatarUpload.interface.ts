import type { ModoRadius, ModoSize } from '../../config/ModoConfig';

export type AvatarVariant =
    | 'default'
    | 'realistic'
    | 'illustration'
    | 'watercolor'
    | 'oilpainting'
    | 'anime'
    | 'cartoon'
    | 'chibi'
    | 'minimal'
    | 'cyberpunk'
    | 'sketch'
    | 'pixel'
    | '3d'
    | 'retro'
    | 'fantasy'
    | 'gaming'
    | 'nft';

/**
 * Provider function implemented by the developer. Mood UI never provides AI
 * directly — the developer connects their own model/API/backend.
 *
 * @param options - prompt text, source image for img2img, and style variant
 * @param signal  - AbortSignal for cancellation support
 * @returns URL or base64 string of the generated image
 */
export type AvatarProvider = (
    options: { prompt?: string; image?: File; variant?: string },
    signal?: AbortSignal,
) => Promise<string>;

/** Payload emitted with the `save` event so the developer can upload to their backend. */
export interface AvatarSavePayload {
    /**
     * Processed blob ready to upload.
     * `null` when the AI provider returned a remote URL that could not be
     * fetched due to CORS — in that case use `remoteUrl` and have your
     * backend download the image server-side.
     */
    blob: Blob | null;
    /** Display URL — may be a local blob URL or the original remote URL. */
    url: string;
    /**
     * Original URL returned by the AI provider.
     * Only present when `blob` is `null` (CORS prevented browser download).
     * Your backend should fetch this URL to obtain the image data.
     */
    remoteUrl?: string;
    /** How the image was produced. */
    source: 'upload' | 'generated' | 'transformed';
    mimeType: string;
    /** File size in bytes. 0 when blob is null. */
    size: number;
}

export interface AvatarUpload {
    /** Current avatar URL or base64 (v-model). */
    modelValue?: string;
    /** Enable AI generation features (prompt input, variant selector, regenerate). */
    ai?: boolean;
    /**
     * AI generation function. If omitted, falls back to the global
     * `ModoProvider` `ai.avatarProvider` config. Without a provider the
     * component operates in upload-only mode regardless of `ai` prop.
     */
    provider?: AvatarProvider;
    /** Visual style passed to the provider. Default: 'default'. */
    variant?: AvatarVariant;
    /**
     * User's display name — used to derive initials for the fallback avatar.
     * Example: "Eduardo Aranda" → "AP".
     */
    name?: string;
    size?: ModoSize;
    radius?: ModoRadius;
    disabled?: boolean;
    readonly?: boolean;
    /** Show interactive crop after upload. Default: true. */
    crop?: boolean;
    /** Max upload size in bytes. Default: 5_242_880 (5 MB). */
    maxSize?: number;
    /** Accepted MIME types. Default: ['image/png', 'image/jpeg', 'image/webp']. */
    accept?: string[];
    /** Fallback image URL shown when no avatar is set and there are no initials. */
    fallback?: string;
    /**
     * Show a regenerate button after a successful generation.
     * Defaults to `true` when `ai=true` and a provider is available.
     */
    regenerate?: boolean;
    /** Show circular preview. Default: true. */
    preview?: boolean;
    /**
     * When `true`, clicking the avatar preview opens a full-size view in a modal.
     * Works in both edit and read-only modes.
     */
    lightbox?: boolean;
    /** Placeholder text for the AI prompt input. */
    promptPlaceholder?: string;
    /**
     * Quick-pick prompt suggestions shown as clickable chips above the text input.
     * Clicking a chip sets (or clears, if already active) the prompt field.
     * The user can still edit freely after selecting one.
     *
     * @example
     * :prompt-suggestions="['LinkedIn professional', 'Cartoon', 'Anime', 'Pixel art']"
     */
    promptSuggestions?: string[];
    /**
     * Controls when `onSave` is invoked:
     * - `'manual'`  — (default when `onSave` provided) show "Save" button; user triggers upload.
     * - `'auto'`    — call `onSave` immediately after image is ready.
     * - `'none'`    — (default without `onSave`) emit `update:modelValue` with the local blob URL.
     */
    saveMode?: 'auto' | 'manual' | 'none';
    /**
     * Optional async upload function. Receives the ready-to-upload payload and
     * must return the final persistent URL (CDN, backend, etc.).
     * When provided and `saveMode !== 'none'`, the component shows a save
     * loading state and emits `saved` with the returned URL.
     */
    onSave?: (payload: AvatarSavePayload) => Promise<string>;
}
