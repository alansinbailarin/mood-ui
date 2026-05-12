import { onScopeDispose, watch, type Ref } from 'vue'; 
import type { 
    TableFilterState, 
    TablePaginationState, 
    TableSortDirection, 
    TableSortState, 
} from '../interfaces/data-display/table/Table.interface'; 
 
/** 
 * Two-way sync between `<Table>` state and the URL querystring. 
 * 
 * Goal: shareable links / browser back-forward navigation that restore 
 * exactly the table the user was looking at. 
 * 
 * Defaults follow conventional shorthand: 
 *   - `sort=name:asc,role:desc`   → `[{key:'name',direction:'asc'}, …]` 
 *   - `filter.email=foo`          → `{ email: 'foo' }` 
 *   - `q=foo`                     → globalSearchTerm 
 *   - `page=2`                    → pagination.page 
 *   - `pageSize=25`               → pagination.pageSize 
 * 
 * The composable: 
 *   - Reads the URL once on creation and hydrates the bound refs. 
 *   - Watches the refs and updates the URL via `history.replaceState` 
 *     (so the user's history isn't polluted by every keystroke). 
 *   - Listens to `popstate` so back/forward buttons restore state. 
 * 
 * It is transport-agnostic: works with vanilla `window.location` by 
 * default, but you can swap the URL adapter for vue-router or any 
 * other history provider via `urlAdapter`. 
 */ 
 
export type TableUrlAdapter = { 
    /** Returns the current URL search string (including the leading '?'). */ 
    read: () => string; 
    /** Writes the new search string. Receives `?key=value&…` or '' to clear. */ 
    write: (search: string) => void; 
    /** Subscribes to back/forward navigation. Returns cleanup. */ 
    onChange: (cb: () => void) => () => void; 
}; 
 
const defaultAdapter: TableUrlAdapter = { 
    read: () => 
        typeof window !== 'undefined' ? window.location.search : '', 
    write: (search) => { 
        if (typeof window === 'undefined') return; 
        const url = new URL(window.location.href); 
        url.search = search; 
        window.history.replaceState(null, '', url.toString()); 
    }, 
    onChange: (cb) => { 
        if (typeof window === 'undefined') return () => undefined; 
        window.addEventListener('popstate', cb); 
        return () => window.removeEventListener('popstate', cb); 
    }, 
}; 
 
export interface UseTableUrlSyncOptions { 
    sort?: Ref<TableSortState>; 
    filter?: Ref<TableFilterState>; 
    pagination?: Ref<TablePaginationState>; 
    globalSearchTerm?: Ref<string>; 
 
    /** 
     * Optional prefix for every key. Useful when you have multiple 
     * independent tables on the same page (e.g. `users.` and `orders.`). 
     * @default '' 
     */ 
    prefix?: string; 
 
    /** 
     * Override per-field key names. Defaults shown. 
     */ 
    keys?: { 
        sort?: string;            // 'sort' 
        filterPrefix?: string;    // 'filter.' → `filter.email` 
        page?: string;            // 'page' 
        pageSize?: string;        // 'pageSize' 
        search?: string;          // 'q' 
    }; 
 
    /** Custom URL adapter (for vue-router / SSR). */ 
    urlAdapter?: TableUrlAdapter; 
} 
 
export interface UseTableUrlSyncApi { 
    /** Apply the current refs to the URL once (no waiting for changes). */ 
    syncToUrl: () => void; 
    /** Re-read the URL and update bound refs. */ 
    syncFromUrl: () => void; 
    /** Stop syncing (also called automatically on scope dispose). */ 
    dispose: () => void; 
} 
 
export function useTableUrlSync( 
    opts: UseTableUrlSyncOptions, 
): UseTableUrlSyncApi { 
    const adapter = opts.urlAdapter ?? defaultAdapter; 
    const prefix = opts.prefix ?? ''; 
    const k = { 
        sort: prefix + (opts.keys?.sort ?? 'sort'), 
        filterPrefix: prefix + (opts.keys?.filterPrefix ?? 'filter.'), 
        page: prefix + (opts.keys?.page ?? 'page'), 
        pageSize: prefix + (opts.keys?.pageSize ?? 'pageSize'), 
        search: prefix + (opts.keys?.search ?? 'q'), 
    }; 
 
    /** Set to true while we're applying a URL change to refs, so the 
     *  watchers don't immediately push it back to the URL. */ 
    let applying = false; 
 
    function parseSort(raw: string): TableSortState { 
        if (!raw) return []; 
        return raw 
            .split(',') 
            .map((token) => { 
                const [key, dir] = token.split(':'); 
                if (!key) return null; 
                const direction: TableSortDirection = 
                    dir === 'desc' ? 'desc' : 'asc'; 
                return { key, direction }; 
            }) 
            .filter((x): x is { key: string; direction: TableSortDirection } => !!x); 
    } 
 
    function stringifySort(sort: TableSortState): string { 
        return sort.map((c) => `${c.key}:${c.direction}`).join(','); 
    } 
 
    function syncFromUrl() { 
        applying = true; 
        try { 
            const params = new URLSearchParams(adapter.read()); 
 
            if (opts.sort) { 
                const raw = params.get(k.sort) ?? ''; 
                opts.sort.value = parseSort(raw); 
            } 
 
            if (opts.filter) { 
                const next: TableFilterState = {}; 
                params.forEach((value, key) => { 
                    if (key.startsWith(k.filterPrefix)) { 
                        next[key.slice(k.filterPrefix.length)] = value; 
                    } 
                }); 
                opts.filter.value = next; 
            } 
 
            if (opts.globalSearchTerm) { 
                opts.globalSearchTerm.value = params.get(k.search) ?? ''; 
            } 
 
            if (opts.pagination) { 
                const page = Number(params.get(k.page)); 
                const pageSize = Number(params.get(k.pageSize)); 
                opts.pagination.value = { 
                    ...opts.pagination.value, 
                    page: Number.isFinite(page) && page > 0 
                        ? page 
                        : opts.pagination.value.page, 
                    pageSize: Number.isFinite(pageSize) && pageSize > 0 
                        ? pageSize 
                        : opts.pagination.value.pageSize, 
                }; 
            } 
        } finally { 
            // Defer reset so any synchronous watcher fired by the ref 
            // assignments above sees `applying=true`. 
            queueMicrotask(() => { applying = false; }); 
        } 
    } 
 
    function syncToUrl() { 
        const params = new URLSearchParams(adapter.read()); 
 
        if (opts.sort) { 
            const s = stringifySort(opts.sort.value); 
            if (s) params.set(k.sort, s); 
            else params.delete(k.sort); 
        } 
 
        if (opts.filter) { 
            // Drop existing filter.* keys first (handles cleared filters). 
            const toDelete: string[] = []; 
            params.forEach((_v, key) => { 
                if (key.startsWith(k.filterPrefix)) toDelete.push(key); 
            }); 
            for (const key of toDelete) params.delete(key); 
            for (const [key, value] of Object.entries(opts.filter.value)) { 
                if (value && value.trim().length > 0) { 
                    params.set(k.filterPrefix + key, value); 
                } 
            } 
        } 
 
        if (opts.globalSearchTerm) { 
            const v = opts.globalSearchTerm.value; 
            if (v) params.set(k.search, v); 
            else params.delete(k.search); 
        } 
 
        if (opts.pagination) { 
            const { page, pageSize } = opts.pagination.value; 
            // Page 1 is the default — keep the URL clean by omitting it. 
            if (page > 1) params.set(k.page, String(page)); 
            else params.delete(k.page); 
            params.set(k.pageSize, String(pageSize)); 
        } 
 
        const search = params.toString(); 
        adapter.write(search ? `?${search}` : ''); 
    } 
 
    /* ------------------ Wiring ------------------ */ 
 
    // 1. Hydrate refs from the URL. 
    syncFromUrl(); 
 
    // 2. When refs change, push to URL — but skip the first push that 
    //    is fired by the hydration above. 
    function pushIfNotApplying() { 
        if (applying) return; 
        syncToUrl(); 
    } 
 
    const stops: Array<() => void> = []; 
    if (opts.sort) 
        stops.push(watch(() => opts.sort!.value, pushIfNotApplying, { deep: true })); 
    if (opts.filter) 
        stops.push(watch(() => opts.filter!.value, pushIfNotApplying, { deep: true })); 
    if (opts.globalSearchTerm) 
        stops.push(watch(() => opts.globalSearchTerm!.value, pushIfNotApplying)); 
    if (opts.pagination) 
        stops.push(watch( 
            () => [opts.pagination!.value.page, opts.pagination!.value.pageSize] as const, 
            pushIfNotApplying, 
        )); 
 
    // 3. React to back/forward navigation. 
    const offPopstate = adapter.onChange(syncFromUrl); 
 
    function dispose() { 
        for (const s of stops) s(); 
        offPopstate(); 
    } 
 
    onScopeDispose(dispose); 
 
    return { syncToUrl, syncFromUrl, dispose }; 
}
