/**
 * Tiny hash-based router for the showroom.
 *
 * URL format: `#<entryId>` (e.g. `#button`). We deliberately drop the
 * `#/cat/` prefix so the URL bar reads cleaner. Routing still uses the
 * hash so deep-links survive on GitHub Pages without SPA fallback.
 *
 * Page transitions are wrapped in `document.startViewTransition` when
 * available so route changes get a free crossfade.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { showroomNav, findEntry } from '../registry';

const current = ref<string>(parseHash());

function parseHash(): string {
    if (typeof window === 'undefined') return defaultEntryId();
    const raw = window.location.hash.replace(/^#\/?/, '');
    if (!raw) return defaultEntryId();
    const parts = raw.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return defaultEntryId();
    return findEntry(id) ? id : defaultEntryId();
}

function defaultEntryId(): string {
    return showroomNav[0]?.entries[0]?.id ?? 'welcome';
}

type ViewTransitionDoc = Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

function runWithTransition(cb: () => void) {
    const d = (typeof document !== 'undefined' ? document : null) as ViewTransitionDoc | null;
    const reduce = typeof window !== 'undefined'
        && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!d || reduce || typeof d.startViewTransition !== 'function') {
        cb();
        return;
    }
    d.startViewTransition(cb);
}

function onHashChange() {
    const next = parseHash();
    if (next === current.value) return;
    runWithTransition(() => { current.value = next; });
}

if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', onHashChange);
}

export function useShowroomRouter() {
    onMounted(() => { /* listener is module-level */ });
    onUnmounted(() => { /* listener is module-level */ });

    const entry = computed(() => findEntry(current.value));
    const category = computed(() => {
        for (const cat of showroomNav) {
            if (cat.entries.some((e) => e.id === current.value)) return cat;
        }
        return null;
    });

    function go(id: string) {
        if (typeof window !== 'undefined') {
            const target = `#${id}`;
            if (window.location.hash !== target) {
                history.pushState(null, '', target);
            }
        }
        runWithTransition(() => { current.value = id; });
    }

    return { currentId: current, entry, category, go };
}
