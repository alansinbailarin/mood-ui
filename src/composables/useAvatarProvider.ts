import { ref, computed, inject } from 'vue';
import { MODO_CONFIG } from '../config/ModoConfig';
import type { AvatarProvider } from '../interfaces/forms/AvatarUpload.interface';

/**
 * Resolves the avatar AI provider and handles invocation with loading state,
 * error handling, cancellation via AbortController, and session-level caching.
 *
 * Provider resolution order:
 *   1. `localProvider` argument (`:provider` prop on the component)
 *   2. Global `ModoProvider` `ai.avatarProvider` config
 *   3. `undefined` → AI features disabled
 */
export function useAvatarProvider(localProvider: () => AvatarProvider | undefined) {
    const config = inject(MODO_CONFIG, undefined);

    const resolvedProvider = computed<AvatarProvider | undefined>(
        () => localProvider() ?? config?.value.ai?.avatarProvider,
    );

    const hasProvider = computed(() => resolvedProvider.value !== undefined);

    const isGenerating = ref(false);
    const generateError = ref<Error | null>(null);
    let abortController: AbortController | null = null;

    function cacheKey(prompt: string | undefined, variant: string | undefined): string {
        return `modo-avatar-gen:${prompt ?? ''}:${variant ?? ''}`;
    }

    function getCached(key: string): string | null {
        try {
            const val = sessionStorage.getItem(key);
            if (!val) return null;
            // Evict stale remote URLs (e.g. expired Azure Blob signed URLs from OpenAI)
            if (val.startsWith('http://') || val.startsWith('https://')) {
                console.log('[mood-ui AvatarProvider] evicting stale remote URL from cache:', key);
                sessionStorage.removeItem(key);
                return null;
            }
            console.log('[mood-ui AvatarProvider] cache hit:', key);
            return val;
        } catch {
            return null;
        }
    }

    function setCached(key: string, value: string): void {
        try {
            sessionStorage.setItem(key, value);
        } catch {
            // sessionStorage unavailable (SSR, private mode quota) — silently skip
        }
    }

    async function generate(options: {
        prompt?: string;
        image?: File;
        variant?: string;
    }): Promise<string | null> {
        const provider = resolvedProvider.value;
        if (!provider) return null;

        // Cancel any in-flight request
        abortController?.abort();
        abortController = new AbortController();

        // Check cache only for text-to-image (no source image)
        if (!options.image) {
            const key = cacheKey(options.prompt, options.variant);
            console.log('[mood-ui AvatarProvider] checking cache key:', key);
            const cached = getCached(key);
            if (cached) {
                console.log('[mood-ui AvatarProvider] returning cached result, skipping API call');
                return cached;
            }
        }

        isGenerating.value = true;
        generateError.value = null;

        try {
            console.log('[mood-ui AvatarProvider] calling provider with:', { prompt: options.prompt, variant: options.variant, hasImage: !!options.image });
            const result = await provider(options, abortController.signal);
            console.log('[mood-ui AvatarProvider] provider returned:', result?.slice(0, 80));

            // Only cache blob: / data: URLs — remote URLs from AI APIs are
            // typically signed and expire quickly, so caching them causes
            // "URL expired" errors on repeated prompts.
            const isCacheable = result.startsWith('blob:') || result.startsWith('data:');
            if (!options.image && isCacheable) {
                setCached(cacheKey(options.prompt, options.variant), result);
            }

            return result;
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return null;
            generateError.value = err instanceof Error ? err : new Error(String(err));
            throw generateError.value;
        } finally {
            isGenerating.value = false;
        }
    }

    function cancel(): void {
        abortController?.abort();
        abortController = null;
        isGenerating.value = false;
    }

    return {
        hasProvider,
        isGenerating,
        generateError,
        generate,
        cancel,
    };
}
