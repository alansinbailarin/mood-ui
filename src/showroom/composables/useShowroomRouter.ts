/**
 * Tiny hash-based router for the showroom.
 *
 * URL format: `#/<categoryId>/<entryId>` (e.g. `#/forms/button`).
 * Falls back to the first entry of the first category when the hash is empty
 * or doesn't match anything in the registry.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { showroomNav, findEntry } from '../registry';

const current = ref<string>(parseHash());

function parseHash(): string {
    if (typeof window === 'undefined') return defaultEntryId();
    const raw = window.location.hash.replace(/^#\/?/, '');
    if (!raw) return defaultEntryId();
    // Accept both `cat/id` and bare `id`.
    const parts = raw.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return defaultEntryId();
    return findEntry(id) ? id : defaultEntryId();
}

function defaultEntryId(): string {
    return showroomNav[0]?.entries[0]?.id ?? 'welcome';
}

function onHashChange() {
    current.value = parseHash();
}

if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', onHashChange);
}

export function useShowroomRouter() {
    onMounted(() => {
        // No-op; listener is module-level so it survives across mounts.
    });
    onUnmounted(() => {
        // Listener is intentionally global; do not remove.
    });

    const entry = computed(() => findEntry(current.value));
    const category = computed(() => {
        for (const cat of showroomNav) {
            if (cat.entries.some((e) => e.id === current.value)) return cat;
        }
        return null;
    });

    function go(id: string) {
        const cat = showroomNav.find((c) => c.entries.some((e) => e.id === id));
        const path = cat ? `${cat.id}/${id}` : id;
        if (typeof window !== 'undefined') {
            window.location.hash = `#/${path}`;
        }
        current.value = id;
    }

    return { currentId: current, entry, category, go };
}
