/**
 * Right-side "On This Page" TOC for ComponentDoc pages.
 *
 * - ComponentDoc provides the registry and renders <DocToc />
 * - ComponentPreview auto-registers itself when it has a `title`
 * - DocToc subscribes via IntersectionObserver for scroll-spy
 */
import { ref, type InjectionKey, type Ref } from 'vue';

export interface TocItem {
    id: string;
    label: string;
    /** 1 = top-level section, 2 = nested (e.g. example title) */
    level: 1 | 2;
    /**
     * For level-2 items: the id of the parent level-1 section.
     * When provided, the item is inserted right after all existing items
     * that share the same parentId (or right after the parent itself if
     * no children exist yet), keeping examples nested under "examples"
     * even though they register asynchronously in onMounted.
     */
    parentId?: string;
}

export interface DocTocApi {
    items: Ref<TocItem[]>;
    register: (item: TocItem) => void;
    unregister: (id: string) => void;
    clear: () => void;
    activeId: Ref<string>;
    setActive: (id: string) => void;
}

export const DOC_TOC_KEY: InjectionKey<DocTocApi> = Symbol('DocToc');

export function createDocToc(): DocTocApi {
    const items = ref<TocItem[]>([]);
    const activeId = ref<string>('');

    function register(item: TocItem) {
        const idx = items.value.findIndex((i) => i.id === item.id);
        if (idx !== -1) {
            items.value[idx] = item; // update label/level in place
            return;
        }
        if (item.parentId) {
            // Insert right after the last sibling (same parentId) or after the
            // parent itself, so children always stay grouped under their section.
            let insertAt = -1;
            for (let i = items.value.length - 1; i >= 0; i--) {
                if (items.value[i].parentId === item.parentId || items.value[i].id === item.parentId) {
                    insertAt = i + 1;
                    break;
                }
            }
            if (insertAt !== -1) {
                items.value.splice(insertAt, 0, item);
                return;
            }
        }
        items.value.push(item);
    }
    function unregister(id: string) {
        const idx = items.value.findIndex((i) => i.id === id);
        if (idx !== -1) items.value.splice(idx, 1);
    }
    function clear() {
        items.value = [];
        activeId.value = '';
    }
    function setActive(id: string) {
        activeId.value = id;
    }
    return { items, register, unregister, clear, activeId, setActive };
}

export function slugify(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
