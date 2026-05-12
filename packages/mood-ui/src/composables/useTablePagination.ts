import { computed, ref, watch, type ComputedRef } from 'vue'; 
import type { TablePaginationState } from '../interfaces/data-display/table/Table.interface'; 
 
/** 
 * Pagination state machine for `<Table>` and the standalone 
 * `<TablePagination>` primitive. 
 * 
 * Concerns: 
 *  - Bridges controlled (`v-model:pagination`) and uncontrolled modes. 
 *  - Clamps `page` to the valid range whenever `total` or `pageSize` change 
 *    so the table never renders an empty page after a filter narrows the 
 *    dataset. 
 *  - Provides `apply(rows)` so callers running in client mode can slice 
 *    the array with one call. Server-side hosts ignore `apply` and just 
 *    listen to `onUpdate`. 
 */ 
export interface UseTablePaginationOptions { 
    /** Controlled state getter (returns parent's `v-model:pagination`). */ 
    state?: () => TablePaginationState | undefined; 
    /** Emit when state changes. */ 
    onUpdate?: (next: TablePaginationState) => void; 
    /** Initial state for uncontrolled mode. */ 
    initial?: TablePaginationState; 
    /** 
     * Total row count after filter+sort. Required in client mode for 
     * range / pageCount math. In server mode the parent supplies the 
     * authoritative `total` on the state object instead. 
     */ 
    derivedTotal?: () => number; 
    /** When true, `apply()` is a no-op (server returns the page itself). */ 
    serverSide?: () => boolean; 
} 
 
export interface UseTablePaginationApi<TRow> { 
    pagination: ComputedRef<TablePaginationState>; 
    /** Effective row count used for `pageCount` / `range`. */ 
    total: ComputedRef<number>; 
    /** Total page count, always at least 1. */ 
    pageCount: ComputedRef<number>; 
    /** Range tuple `[from, to]`, both 1-based inclusive (0/0 when empty). */ 
    range: ComputedRef<[number, number]>; 
    setPage: (next: number) => void; 
    setPageSize: (next: number) => void; 
    apply: (rows: TRow[]) => TRow[]; 
} 
 
const DEFAULT: TablePaginationState = { page: 1, pageSize: 10 }; 
 
export function useTablePagination<TRow>( 
    opts: UseTablePaginationOptions = {}, 
): UseTablePaginationApi<TRow> { 
    const internal = ref<TablePaginationState>({ ...DEFAULT, ...(opts.initial ?? {}) }); 
 
    if (opts.state) { 
        watch( 
            () => opts.state!(), 
            (next) => { 
                if (next) internal.value = { ...next }; 
            }, 
            { immediate: true, deep: true }, 
        ); 
    } 
 
    const pagination = computed<TablePaginationState>(() => opts.state?.() ?? internal.value); 
 
    const total = computed(() => { 
        const explicit = pagination.value.total; 
        if (typeof explicit === 'number') return explicit; 
        return opts.derivedTotal?.() ?? 0; 
    }); 
 
    const pageCount = computed(() => { 
        const ps = Math.max(1, pagination.value.pageSize || 1); 
        return Math.max(1, Math.ceil(total.value / ps)); 
    }); 
 
    function commit(next: TablePaginationState) { 
        // Clamp page to valid range. 
        const ps = Math.max(1, next.pageSize || 1); 
        const pc = Math.max(1, Math.ceil((next.total ?? opts.derivedTotal?.() ?? 0) / ps)); 
        const clamped: TablePaginationState = { 
            ...next, 
            pageSize: ps, 
            page: Math.min(Math.max(1, next.page), pc), 
        }; 
        internal.value = clamped; 
        opts.onUpdate?.(clamped); 
    } 
 
    function setPage(next: number) { 
        commit({ ...pagination.value, page: next }); 
    } 
 
    function setPageSize(next: number) { 
        // Reset to page 1 on size change so users always see fresh top. 
        commit({ ...pagination.value, page: 1, pageSize: next }); 
    } 
 
    // Reactively clamp when `total` shrinks (e.g. a filter narrowed the data). 
    watch(total, () => { 
        const cur = pagination.value; 
        const pc = pageCount.value; 
        if (cur.page > pc) commit({ ...cur, page: pc }); 
    }); 
 
    const range = computed<[number, number]>(() => { 
        if (total.value === 0) return [0, 0]; 
        const ps = pagination.value.pageSize; 
        const from = (pagination.value.page - 1) * ps + 1; 
        const to = Math.min(pagination.value.page * ps, total.value); 
        return [from, to]; 
    }); 
 
    function apply(rows: TRow[]): TRow[] { 
        if (opts.serverSide?.()) return rows; 
        const ps = pagination.value.pageSize; 
        const start = (pagination.value.page - 1) * ps; 
        return rows.slice(start, start + ps); 
    } 
 
    return { 
        pagination, 
        total, 
        pageCount, 
        range, 
        setPage, 
        setPageSize, 
        apply, 
    }; 
}
