import { 
    computed, 
    ref, 
    shallowRef, 
    watch, 
    type ComputedRef, 
    type Ref, 
} from 'vue'; 
import type { 
    TableFilterState, 
    TablePaginationState, 
    TableSortState, 
} from '../interfaces/data-display/table/Table.interface'; 
 
/** 
 * Server-side query orchestrator for `<Table>`. 
 * 
 * Wraps the (otherwise manual) wiring of `serverSide=true`: when any of 
 * `sort`, `filter`, `globalSearch`, or `pagination` change, runs your 
 * `fetcher` and exposes the result reactively. 
 * 
 * Wires up: 
 *   - `data`         → bind to `<Table :data>` 
 *   - `pagination`   → bind to `<Table v-model:pagination>` (with `total`) 
 *   - `sort`         → bind to `<Table v-model:sort>` 
 *   - `filter`       → bind to `<Table v-model:filter>` 
 *   - `globalSearchTerm` → bind to `<Table v-model:globalSearchTerm>` 
 *   - `loading` / `error` / `refetch()` for UI affordances. 
 * 
 * Behavior: 
 *   - **Debounce** filter + globalSearchTerm changes (default 300ms) so 
 *     fast typing emits one request. Sort/page changes fire instantly. 
 *   - **Cancellation**: each new request aborts the previous via 
 *     `AbortController`; aborted responses are ignored. 
 *   - **Page reset**: when sort, filter, or search changes, pagination 
 *     resets to page 1 automatically (configurable). 
 *   - **Initial fetch**: runs once on creation (configurable). 
 * 
 * Design notes: 
 *   - `data` is a `shallowRef` to avoid Vue tracking deep mutations of 
 *     server payloads (and to dodge the generic `UnwrapRefSimple` issue 
 *     we hit elsewhere in this codebase). 
 *   - The composable doesn't know about your transport (fetch / axios / 
 *     gRPC). It only awaits a `fetcher` function and reads two fields 
 *     from the result: `items` and `total`. 
 */ 
 
export interface TableQueryParams { 
    page: number; 
    pageSize: number; 
    sort: TableSortState; 
    filter: TableFilterState; 
    globalSearchTerm: string; 
    /** Aborted by the composable when a newer request supersedes this one. */ 
    signal: AbortSignal; 
} 
 
export interface TableQueryResult<TRow> { 
    items: TRow[]; 
    total: number; 
} 
 
export interface UseTableQueryOptions<TRow> { 
    /** Async function that fetches one page from the backend. */ 
    fetcher: (params: TableQueryParams) => Promise<TableQueryResult<TRow>>; 
 
    /** Initial sort. @default [] */ 
    initialSort?: TableSortState; 
    /** Initial filter. @default {} */ 
    initialFilter?: TableFilterState; 
    /** Initial global search term. @default '' */ 
    initialSearch?: string; 
    /** Initial page (1-based). @default 1 */ 
    initialPage?: number; 
    /** Initial page size. @default 10 */ 
    initialPageSize?: number; 
 
    /** ms to debounce filter / globalSearchTerm changes. @default 300 */ 
    debounceMs?: number; 
    /** Reset page to 1 when sort/filter/search change. @default true */ 
    resetPageOnQueryChange?: boolean; 
    /** Run the first fetch immediately. @default true */ 
    immediate?: boolean; 
} 
 
export interface UseTableQueryApi<TRow> { 
    /** Server payload for the current page. */ 
    data: Ref<TRow[]>; 
    /** v-model:pagination — `total` is set from the latest fetch. */ 
    pagination: Ref<TablePaginationState>; 
    /** v-model:sort. */ 
    sort: Ref<TableSortState>; 
    /** v-model:filter. */ 
    filter: Ref<TableFilterState>; 
    /** v-model:globalSearchTerm. */ 
    globalSearchTerm: Ref<string>; 
 
    /** True while a fetch is in flight (after debounce). */ 
    loading: Ref<boolean>; 
    /** Last error thrown by the fetcher (cleared on success). */ 
    error: Ref<unknown>; 
    /** Number of fetches that have completed (success or error). */ 
    fetchCount: ComputedRef<number>; 
 
    /** Force a refetch with the current params. */ 
    refetch: () => Promise<void>; 
    /** Cancel any in-flight request without refetching. */ 
    cancel: () => void; 
} 
 
export function useTableQuery<TRow>( 
    opts: UseTableQueryOptions<TRow>, 
): UseTableQueryApi<TRow> { 
    const { 
        fetcher, 
        initialSort = [], 
        initialFilter = {}, 
        initialSearch = '', 
        initialPage = 1, 
        initialPageSize = 10, 
        debounceMs = 300, 
        resetPageOnQueryChange = true, 
        immediate = true, 
    } = opts; 
 
    // shallowRef avoids deep-reactivity overhead on payloads and sidesteps 
    // generic-ref unwrap quirks with TRow. 
    const data = shallowRef<TRow[]>([]) as Ref<TRow[]>; 
    const sort = ref<TableSortState>(initialSort) as Ref<TableSortState>; 
    const filter = ref<TableFilterState>({ ...initialFilter }); 
    const globalSearchTerm = ref(initialSearch); 
    const pagination = ref<TablePaginationState>({ 
        page: initialPage, 
        pageSize: initialPageSize, 
        total: 0, 
    }); 
    const loading = ref(false); 
    const error = ref<unknown>(null); 
    const _fetchCount = ref(0); 
    const fetchCount = computed(() => _fetchCount.value); 
 
    let activeController: AbortController | null = null; 
    let debounceTimer: ReturnType<typeof setTimeout> | null = null; 
    /** Monotonic id so out-of-order responses are dropped even if they 
     *  somehow weren't aborted (e.g. a fetcher that ignores `signal`). */ 
    let requestSeq = 0; 
 
    function cancel() { 
        if (debounceTimer) { 
            clearTimeout(debounceTimer); 
            debounceTimer = null; 
        } 
        if (activeController) { 
            activeController.abort(); 
            activeController = null; 
        } 
    } 
 
    async function runFetch(): Promise<void> { 
        cancel(); 
        const controller = new AbortController(); 
        activeController = controller; 
        const seq = ++requestSeq; 
        loading.value = true; 
        try { 
            const result = await fetcher({ 
                page: pagination.value.page, 
                pageSize: pagination.value.pageSize, 
                sort: sort.value, 
                filter: { ...filter.value }, 
                globalSearchTerm: globalSearchTerm.value, 
                signal: controller.signal, 
            }); 
            // Drop the response if a newer request superseded this one. 
            if (seq !== requestSeq) return; 
            data.value = result.items; 
            pagination.value = { 
                ...pagination.value, 
                total: result.total, 
            }; 
            error.value = null; 
        } catch (err) { 
            if (seq !== requestSeq) return; 
            // AbortError isn't a real failure — just a superseded request. 
            const isAbort = 
                err instanceof DOMException && err.name === 'AbortError'; 
            if (!isAbort) error.value = err; 
        } finally { 
            if (seq === requestSeq) { 
                loading.value = false; 
                activeController = null; 
                _fetchCount.value++; 
            } 
        } 
    } 
 
    function refetch() { 
        return runFetch(); 
    } 
 
    /** Schedule a fetch after debounceMs (used for filter / search). */ 
    function scheduleDebounced() { 
        if (debounceTimer) clearTimeout(debounceTimer); 
        debounceTimer = setTimeout(() => { 
            debounceTimer = null; 
            void runFetch(); 
        }, debounceMs); 
    } 
 
    /* ---------------- Wiring ---------------- */ 
 
    // Sort & page changes are immediate (sort is a button click, paging 
    // is a click — no need to debounce those). 
    watch( 
        () => sort.value, 
        () => { 
            if (resetPageOnQueryChange && pagination.value.page !== 1) { 
                pagination.value = { ...pagination.value, page: 1 }; 
                // The pagination watcher below will fire the request. 
                return; 
            } 
            void runFetch(); 
        }, 
        { deep: true }, 
    ); 
 
    watch( 
        () => [pagination.value.page, pagination.value.pageSize] as const, 
        (next, prev) => { 
            // pageSize change → reset to page 1 to avoid landing past the 
            // last page. 
            if (prev && next[1] !== prev[1] && next[0] !== 1) { 
                pagination.value = { ...pagination.value, page: 1 }; 
                return; 
            } 
            void runFetch(); 
        }, 
    ); 
 
    watch( 
        () => filter.value, 
        () => { 
            if (resetPageOnQueryChange && pagination.value.page !== 1) { 
                pagination.value = { ...pagination.value, page: 1 }; 
                // Still debounce the actual request so typing coalesces. 
            } 
            scheduleDebounced(); 
        }, 
        { deep: true }, 
    ); 
 
    watch( 
        () => globalSearchTerm.value, 
        () => { 
            if (resetPageOnQueryChange && pagination.value.page !== 1) { 
                pagination.value = { ...pagination.value, page: 1 }; 
            } 
            scheduleDebounced(); 
        }, 
    ); 
 
    if (immediate) { 
        void runFetch(); 
    } 
 
    return { 
        data, 
        pagination, 
        sort, 
        filter, 
        globalSearchTerm, 
        loading, 
        error, 
        fetchCount, 
        refetch, 
        cancel, 
    }; 
}
