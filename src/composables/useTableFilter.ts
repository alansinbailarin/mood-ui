import { computed, ref, watch, type ComputedRef } from 'vue'; 
import type { 
    NormalizedTableColumn, 
    TableFilterState, 
} from '../interfaces/data-display/table/Table.interface'; 
import { resolveCellValue } from './useTable'; 
 
/** 
 * Per-column filter state for `<Table>`. 
 * 
 * Behavior: 
 *  - Each filterable column gets one entry in `state` keyed by `column.key`. 
 *  - `apply(rows)` runs every active filter against every row and returns 
 *    a new array (the input is never mutated). 
 *  - Individual columns choose their match strategy via `column.filter`: 
 *      `'contains' | 'startsWith' | 'equals'` or a custom predicate. 
 * 
 * Empty / whitespace-only inputs are skipped, so consumers can bind 
 * directly to an `<Input>` without writing teardown logic. 
 * 
 * The composable is decoupled from any sort/pagination logic — apply it 
 * before sort + pagination so derived counts (sortedTotal, pageCount) 
 * reflect the filtered set. 
 */ 
export interface UseTableFilterOptions<TRow> { 
    columns: ComputedRef<NormalizedTableColumn<TRow>[]>; 
    /** Controlled state getter (returns parent's `v-model:filter` value). */ 
    state?: () => TableFilterState | undefined; 
    /** Emit when state changes (controlled mode). */ 
    onUpdate?: (next: TableFilterState) => void; 
    /** Initial state for uncontrolled mode. */ 
    initial?: TableFilterState; 
} 
 
export interface UseTableFilterApi<TRow> { 
    filter: ComputedRef<TableFilterState>; 
    setFilter: (key: string, value: string) => void; 
    clearFilter: (key: string) => void; 
    clearAll: () => void; 
    /** True when at least one column has a non-empty filter. */ 
    hasActiveFilter: ComputedRef<boolean>; 
    /** Apply the current filter to a list of rows. */ 
    apply: (rows: TRow[]) => TRow[]; 
} 
 
export function useTableFilter<TRow>( 
    opts: UseTableFilterOptions<TRow>, 
): UseTableFilterApi<TRow> { 
    const internal = ref<TableFilterState>({ ...(opts.initial ?? {}) }); 
 
    // Mirror parent state into internal so reads don't rely on which mode 
    // we're in. Parent always wins when defined. 
    if (opts.state) { 
        watch( 
            () => opts.state!(), 
            (next) => { 
                if (next) internal.value = { ...next }; 
            }, 
            { immediate: true }, 
        ); 
    } 
 
    const filter = computed<TableFilterState>(() => { 
        return opts.state?.() ?? internal.value; 
    }); 
 
    function commit(next: TableFilterState) { 
        internal.value = next; 
        opts.onUpdate?.(next); 
    } 
 
    function setFilter(key: string, value: string) { 
        const cur = { ...filter.value }; 
        if (value == null || value === '') delete cur[key]; 
        else cur[key] = value; 
        commit(cur); 
    } 
 
    function clearFilter(key: string) { 
        const cur = { ...filter.value }; 
        delete cur[key]; 
        commit(cur); 
    } 
 
    function clearAll() { 
        commit({}); 
    } 
 
    const hasActiveFilter = computed(() => 
        Object.values(filter.value).some((v) => v != null && String(v).trim() !== ''), 
    ); 
 
    function matchOne( 
        col: NormalizedTableColumn<TRow>, 
        row: TRow, 
        index: number, 
        input: string, 
    ): boolean { 
        const value = resolveCellValue(col, row, index); 
        const predicate = col.filter ?? 'contains'; 
        if (typeof predicate === 'function') { 
            return !!predicate(value, input, row); 
        } 
        const haystack = stringify(value).toLowerCase(); 
        const needle = input.toLowerCase(); 
        switch (predicate) { 
            case 'startsWith': return haystack.startsWith(needle); 
            case 'equals':     return haystack === needle; 
            case 'contains': 
            default:           return haystack.includes(needle); 
        } 
    } 
 
    function apply(rows: TRow[]): TRow[] { 
        if (!hasActiveFilter.value) return rows; 
        // Snapshot active criteria once so we don't re-resolve per row. 
        const active: Array<{ col: NormalizedTableColumn<TRow>; input: string }> = []; 
        const cols = opts.columns.value; 
        const cur = filter.value; 
        for (const c of cols) { 
            const raw = cur[c.key]; 
            if (raw == null) continue; 
            const trimmed = String(raw).trim(); 
            if (!trimmed) continue; 
            active.push({ col: c, input: trimmed }); 
        } 
        if (!active.length) return rows; 
 
        const out: TRow[] = []; 
        for (let i = 0; i < rows.length; i++) { 
            const row = rows[i]; 
            if (row == null) continue; 
            let pass = true; 
            for (const { col, input } of active) { 
                if (!matchOne(col, row, i, input)) { pass = false; break; } 
            } 
            if (pass) out.push(row); 
        } 
        return out; 
    } 
 
    return { 
        filter, 
        setFilter, 
        clearFilter, 
        clearAll, 
        hasActiveFilter, 
        apply, 
    }; 
} 
 
function stringify(v: unknown): string { 
    if (v == null) return ''; 
    if (v instanceof Date) { 
        // Match the default cell format so visible text and filter input agree. 
        return v.toLocaleDateString(); 
    } 
    if (Array.isArray(v)) return v.join(', '); 
    return String(v); 
}
