import type { AvatarProvider } from '../interfaces/forms/AvatarUpload.interface';

export interface CreateAvatarProviderOptions {
    /** URL of your backend endpoint (or AI API directly, for testing only). */
    url: string;
    /** Extra headers — e.g. Authorization for direct API calls during development. */
    headers?: Record<string, string>;
    /**
     * Override the JSON body for text-to-image requests (no source image).
     * By default sends `{ prompt, variant }`.
     */
    body?: (opts: { prompt?: string; variant?: string }) => Record<string, unknown>;
    /**
     * Override the FormData for image-to-image requests (when a source image is present).
     * By default appends `image`, `prompt`, and `variant` fields.
     */
    imageBody?: (opts: { prompt?: string; variant?: string; image: File }, form: FormData) => void;
    /**
     * Extract the image URL from the JSON response.
     * If omitted, common shapes are detected automatically:
     *   { url }, { imageUrl }, { image }, { data[0].url } (OpenAI), { output[0] } (Replicate)
     */
    extractUrl?: (data: unknown) => string;
}

/**
 * Factory that turns a URL + optional config into an AvatarProvider function.
 *
 * - When called **without** a source image: sends `application/json` with `{ prompt, variant }`.
 * - When called **with** a source image: sends `multipart/form-data` with `image`, `prompt`, and
 *   `variant` fields so the backend can pass it to an img2img model.
 *
 * For production, point it at your own backend endpoint — never expose API keys in the browser.
 * For local testing you can point it directly at an AI API (see examples in the showroom).
 *
 * @example
 * // Backend endpoint (recommended)
 * const provider = createAvatarProvider({ url: '/api/generate-avatar' });
 *
 * @example
 * // OpenAI direct (dev/testing only — keeps key out of production builds)
 * const provider = createAvatarProvider({
 *   url: 'https://api.openai.com/v1/images/generations',
 *   headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
 *   body: ({ prompt }) => ({ model: 'dall-e-3', prompt: prompt ?? 'professional avatar', n: 1, size: '1024x1024' }),
 *   extractUrl: (d: any) => d.data[0].url,
 * });
 */
export function createAvatarProvider(options: CreateAvatarProviderOptions): AvatarProvider {
    const { url, headers = {}, body, imageBody, extractUrl } = options;

    return async ({ prompt, variant, image }, signal) => {
        let res: Response;

        if (image) {
            // Image-to-image: send as multipart/form-data
            const form = new FormData();
            if (imageBody) {
                imageBody({ prompt, variant, image }, form);
            } else {
                form.append('image', image);
                if (prompt)  form.append('prompt', prompt);
                if (variant) form.append('variant', variant);
            }
            // Do NOT set Content-Type — the browser sets it automatically with the boundary
            res = await fetch(url, { method: 'POST', signal, headers, body: form });
        } else {
            // Text-to-image: send as JSON
            const reqBody = body ? body({ prompt, variant }) : { prompt, variant };
            res = await fetch(url, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(reqBody),
            });
        }

        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            throw new Error(`Avatar generation failed (${res.status}): ${text}`);
        }

        const data = await res.json() as Record<string, unknown>;

        if (extractUrl) return extractUrl(data);

        // Auto-detect common response shapes
        if (typeof data?.url === 'string')              return data.url;
        if (typeof data?.imageUrl === 'string')         return data.imageUrl;
        if (typeof data?.image === 'string')            return data.image;
        const openaiUrl = (data?.data as Array<{ url?: string; b64_json?: string }>)?.[0];
        if (openaiUrl?.url)      return openaiUrl.url;
        if (openaiUrl?.b64_json) return `data:image/png;base64,${openaiUrl.b64_json}`;
        const replicate = (data?.output as string[])?.[0];
        if (typeof replicate === 'string')              return replicate;

        throw new Error(
            'createAvatarProvider: could not extract an image URL from the AI response. ' +
            'Use the extractUrl option to specify how to read the URL.',
        );
    };
}
