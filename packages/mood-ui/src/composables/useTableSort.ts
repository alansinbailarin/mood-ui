import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'; 
import type { 
    NormalizedTableColumn, 
    TableSortDirection, 
    TableSortState, 
} from '../interfaces/data-display/table/Table.interface'; 
import { resolveCellValue } from './useTable'; 
 
/** 
 * Sort state machine for `<Table>`. 
 * 
 * Behaviors: 
 *  - **Single-column** (`multi=false`): clicking a sortable header replaces 
 *    the entire sort with that column. The cycle is asc → desc → none 
 *    when `clearable`; asc → desc → asc otherwise. 
 *  - **Multi-column** (`multi=true`): plain click still replaces the sort, 
 *    but **shift+click** appends/cycles the criterion at the end of the 
 *    current sort array. Removing a criterion when its direction reaches 
 *    `none` keeps the others intact and preserves their priority order. 
 * 
 * The sort can be **controlled** (consumer passes `state` + listens to 
 * `update:sort`) or **uncontrolled** (consumer omits `state`; the 
 * composable owns its own ref). Uncontrolled is the default. 
 */ 
export interface UseTableSortOptions<TRow> { 
    columns: ComputedRef<NormalizedTableColumn<TRow>[]>; 
    /** Controlled state. Pass `undefined` to use the internal ref. */ 
    state?: () => TableSortState | undefined; 
    /** Emit handler when controlled. Called whenever the state changes. */ 
    onUpdate?: (next: TableSortState) => void; 
    /** Default value used when the state arrives as `undefined`. */ 
    initial?: TableSortState; 
    /** Allow shift+click to add criteria. */ 
    multi?: () => boolean; 
    /** When true, the cycle is asc → desc → none; otherwise asc ↔ desc. */ 
    clearable?: () => boolean; 
} 
 
export function useTableSort<TRow>(opts: UseTableSortOptions<TRow>) { 
    const internal = ref<TableSortState>(opts.initial ?? []) as Ref<TableSortState>; 
 
    /** Resolved current state — controlled or internal. */ 
    const sort = computed<TableSortState>(() => { 
        const ext = opts.state?.(); 
        return Array.isArray(ext) ? ext : internal.value; 
    }); 
 
    function commit(next: TableSortState) { 
        internal.value = next; 
        opts.onUpdate?.(next); 
    } 
 
    /** Direction for a given column key, or `undefined` if not sorted. */ 
    function directionFor(key: string): TableSortDirection | undefined { 
        return sort.value.find((c) => c.key === key)?.direction; 
    } 
 
    /** 1-based priority for multi-sort UI; 0 if not in the sort. */ 
    function priorityFor(key: string): number { 
        const idx = sort.value.findIndex((c) => c.key === key); 
        return idx === -1 ? 0 : idx + 1; 
    } 
 
    /** 
     * Translate a column's sort state to the appropriate `aria-sort` value 
     * (per WAI-ARIA: 'ascending' | 'descending' | 'none' | undefined). 
     * Non-sortable columns return `undefined` so the attribute is omitted. 
     */ 
    function ariaSortFor(column: NormalizedTableColumn<TRow>): 'ascending' | 'descending' | 'none' | undefined { 
        if (!column.sortable) return undefined; 
        const dir = directionFor(column.key); 
        if (dir === 'asc') return 'ascending'; 
        if (dir === 'desc') return 'descending'; 
        return 'none'; 
    } 
 
    /** Cycle a single criterion: asc → desc → (none|asc). */ 
    function nextDirection(current: TableSortDirection | undefined, clearable: boolean): TableSortDirection | null { 
        if (current === undefined) return 'asc'; 
        if (current === 'asc') return 'desc'; 
        return clearable ? null : 'asc'; 
    } 
 
    /** 
     * Toggle the sort for a column. `additive` corresponds to a 
     * shift+click — only honored when `multi` is enabled. 
     */ 
    function toggle(key: string, additive: boolean): void { 
        const clearable = opts.clearable?.() ?? true; 
        const allowMulti = (opts.multi?.() ?? false) && additive; 
        const current = sort.value; 
        const existing = current.find((c) => c.key === key); 
        const next = nextDirection(existing?.direction, clearable); 
 
        if (!allowMulti) { 
            // Single-column: replace the whole sort. 
            if (next === null) commit([]); 
            else commit([{ key, direction: next }]); 
            return; 
        } 
 
        // Multi-column: mutate only this criterion in the array. 
        if (existing) { 
            if (next === null) commit(current.filter((c) => c.key !== key)); 
            else commit(current.map((c) => (c.key === key ? { key, direction: next } : c))); 
        } else { 
            // Adding a new criterion always starts at 'asc'. 
            commit([...current, { key, direction: 'asc' }]); 
        } 
    } 
 
    /** Clear sort entirely (used by the toolbar or programmatically). */ 
    function clear(): void { 
        commit([]); 
    } 
 
    /** 
     * Apply the current sort to a list of rows. Returns a new array; the 
     * original `data` is never mutated. 
     * 
     * Comparison is value-based: 
     *  - `null` / `undefined` are pushed to the end regardless of direction. 
     *  - Numbers, dates, booleans and strings use natural comparators. 
     *  - Strings use `localeCompare` so accent-aware sorting just works. 
     *  - For multi-sort, ties cascade to the next criterion. 
     */ 
    function apply(rows: TRow[]): TRow[] { 
        const current = sort.value; 
        if (!current.length) return rows; 
        const cols = opts.columns.value; 
        const criteria: { col: NormalizedTableColumn<TRow>; dir: 1 | -1 }[] = []; 
        for (const c of current) { 
            const col = cols.find((x) => x.key === c.key); 
            if (!col) continue; 
            criteria.push({ col, dir: c.direction === 'desc' ? -1 : 1 }); 
        } 
        if (!criteria.length) return rows; 
 
        // Decorate-sort-undecorate keeps the original index for stability. 
        const tmp = rows.map((row, i) => ({ row, i })); 
        tmp.sort((a, b) => { 
            for (const { col, dir } of criteria) { 
                const va = resolveCellValue(col, a.row, a.i) as any; 
                const vb = resolveCellValue(col, b.row, b.i) as any; 
                // NULLS LAST regardless of direction: keep nil ordering 
                // out of the dir multiplication so empties never bubble 
                // to the top in descending sorts. 
                const aNil = va === null || va === undefined || va === ''; 
                const bNil = vb === null || vb === undefined || vb === ''; 
                if (aNil && bNil) continue; 
                if (aNil) return 1; 
                if (bNil) return -1; 
                const cmp = compareValues(va, vb); 
                if (cmp !== 0) return cmp * dir; 
            } 
            return a.i - b.i; // Stable. 
        }); 
        return tmp.map((x) => x.row); 
    } 
 
    return { sort, toggle, clear, directionFor, priorityFor, ariaSortFor, apply }; 
} 
 
/* ---------------- Comparator ---------------- */ 
 
function compareValues(a: unknown, b: unknown): number { 
    // Nulls last (same shape as PostgreSQL "NULLS LAST"). Helps avoid 
    // surprises where `null < "Z"` would put empties at the top. 
    const aNil = a === null || a === undefined || a === ''; 
    const bNil = b === null || b === undefined || b === ''; 
    if (aNil && bNil) return 0; 
    if (aNil) return 1; 
    if (bNil) return -1; 
 
    if (typeof a === 'number' && typeof b === 'number') return a - b; 
    if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b); 
 
    // Date instances or ISO date strings. 
    const ad = toDate(a); 
    const bd = toDate(b); 
    if (ad !== null && bd !== null) return ad - bd; 
 
    const sa = String(a); 
    const sb = String(b); 
    return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: 'base' }); 
} 
 
function toDate(v: unknown): number | null { 
    if (v instanceof Date) return v.getTime(); 
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) { 
        const t = Date.parse(v); 
        return Number.isNaN(t) ? null : t; 
    } 
    return null; 
} 
 
/* ---------------- Re-exports for callers that need watchers ---------------- */ 
export { watch };
