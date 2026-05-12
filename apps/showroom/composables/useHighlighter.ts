/**
 * Singleton Shiki highlighter for the showroom.
 * Lazy-loaded — only the first call to `getHighlighter()` triggers the
 * dynamic import + theme/lang fetches.
 */
import type { Highlighter, BundledLanguage, BundledTheme } from 'shiki';

let _instance: Highlighter | null = null;
let _pending: Promise<Highlighter> | null = null;

const THEMES: BundledTheme[] = ['github-dark-default', 'github-light-default'];
const LANGS: BundledLanguage[] = ['vue', 'typescript', 'javascript', 'bash', 'html', 'css', 'json', 'tsx'];

export async function getHighlighter(): Promise<Highlighter> {
    if (_instance) return _instance;
    if (_pending) return _pending;

    _pending = (async () => {
        const { createHighlighter } = await import('shiki');
        const hl = await createHighlighter({
            themes: THEMES,
            langs: LANGS,
        });
        _instance = hl;
        return hl;
    })();

    return _pending;
}

export type { BundledLanguage, BundledTheme };
