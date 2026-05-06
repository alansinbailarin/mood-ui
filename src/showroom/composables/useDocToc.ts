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
}

export interface DocTocApi {
    items: Ref<TocItem[]>;
    register: (item: TocItem) => void;
    unregister: (id: string) => void;
    activeId: Ref<string>;
    setActive: (id: string) => void;
}

export const DOC_TOC_KEY: InjectionKey<DocTocApi> = Symbol('DocToc');

export function createDocToc(): DocTocApi {
    const items = ref<TocItem[]>([]);
    const activeId = ref<string>('');

    function register(item: TocItem) {
        const idx = items.value.findIndex((i) => i.id === item.id);
        if (idx === -1) items.value.push(item);
        else items.value[idx] = item;
    }
    function unregister(id: string) {
        const idx = items.value.findIndex((i) => i.id === id);
        if (idx !== -1) items.value.splice(idx, 1);
    }
    function setActive(id: string) {
        activeId.value = id;
    }
    return { items, register, unregister, activeId, setActive };
}

export function slugify(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}
