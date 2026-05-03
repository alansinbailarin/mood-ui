import { computed, ref, watch, type ComputedRef } from 'vue'; 
import type { 
    NormalizedTableColumn, 
    TableColumnState, 
} from '../interfaces/data-display/table/Table.interface'; 
 
/** 
 * Applies persistent per-column user preferences (width / order / hidden) 
 * on top of the declared column list. 
 * 
 * Decoupled from the DOM on purpose — pointer/drag handlers live in the 
 * component; this composable just: 
 *  1. Merges incoming `state` onto `columns` and returns the ordered, 
 *     visible "view columns". 
 *  2. Exposes `setWidth(key, px)` / `move(fromKey, toKey, 'before'|'after')` 
 *     which commit a new state via `onUpdate`. 
 * 
 * The state list is the single source of truth for widths after the first 
 * resize — before that, the column uses its declared `width`. We normalize 
 * the `order` to dense integers every time we commit so persisted state 
 * stays compact. 
 */ 
export interface UseTableColumnsStateOptions<TRow> { 
    columns: ComputedRef<NormalizedTableColumn<TRow>[]>; 
    /** Controlled state getter. */ 
    state?: () => TableColumnState[] | undefined; 
    /** Emit when state changes. */ 
    onUpdate?: (next: TableColumnState[]) => void; 
    /** Initial state for uncontrolled mode. */ 
    initial?: TableColumnState[]; 
    /** Minimum column width in pixels. @default 48 */ 
    minWidth?: () => number; 
} 
 
export interface ViewColumn<TRow> extends NormalizedTableColumn<TRow> { 
    /** Effective width (user-resized → state; else declared). */ 
    effectiveWidth?: string | number; 
    /** Normalized 0-based order position. */ 
    orderIndex: number; 
} 
 
export interface UseTableColumnsStateApi<TRow> { 
    /** Declared columns + state, ordered, visible only. */ 
    viewColumns: ComputedRef<ViewColumn<TRow>[]>; 
    /** Current state, always an array (empty when untouched). */ 
    state: ComputedRef<TableColumnState[]>; 
    /** Commit a new width for `key`. Clamped to `minWidth`. */ 
    setWidth: (key: string, width: number) => void; 
    /** Move `fromKey` before/after `toKey`. */ 
    move: (fromKey: string, toKey: string, position: 'before' | 'after') => void; 
    /** Move `fromKey` by delta positions (-1 = left, +1 = right). */ 
    moveBy: (fromKey: string, delta: number) => void; 
    /** Show/hide a column. */ 
    setHidden: (key: string, hidden: boolean) => void; 
    /** Reset every preference. */ 
    reset: () => void; 
} 
 
export function useTableColumnsState<TRow>( 
    opts: UseTableColumnsStateOptions<TRow>, 
): UseTableColumnsStateApi<TRow> { 
    const internal = ref<TableColumnState[]>([...(opts.initial ?? [])]); 
 
    if (opts.state) { 
        watch( 
            () => opts.state!(), 
            (next) => { 
                if (next) internal.value = [...next]; 
            }, 
            { immediate: true, deep: true }, 
        ); 
    } 
 
    const state = computed<TableColumnState[]>(() => opts.state?.() ?? internal.value); 
 
    function stateMap(): Map<string, TableColumnState> { 
        const m = new Map<string, TableColumnState>(); 
        for (const s of state.value) m.set(s.key, s); 
        return m; 
    } 
 
    function commit(next: TableColumnState[]) { 
        // Drop entries that are entirely default (no width/order/hidden). 
        const cleaned = next.filter( 
            (s) => s.width != null || s.order != null || s.hidden, 
        ); 
        internal.value = cleaned; 
        opts.onUpdate?.(cleaned); 
    } 
 
    /** 
     * Build the view-columns list by applying the state map, then sorting 
     * stably: columns with an explicit `order` first (ascending), then 
     * unordered columns in declaration sequence. 
     */ 
    const viewColumns = computed<ViewColumn<TRow>[]>(() => { 
        const sm = stateMap(); 
        const decorated = opts.columns.value.map((col, declIndex) => { 
            const s = sm.get(col.key); 
            return { 
                col, 
                declIndex, 
                state: s, 
                hidden: !!s?.hidden, 
            }; 
        }); 
 
        decorated.sort((a, b) => { 
            const ao = a.state?.order; 
            const bo = b.state?.order; 
            if (ao != null && bo != null) { 
                if (ao !== bo) return ao - bo; 
                return a.declIndex - b.declIndex; 
            } 
            if (ao != null) return -1; 
            if (bo != null) return 1; 
            return a.declIndex - b.declIndex; 
        }); 
 
        return decorated 
            .filter((d) => !d.hidden) 
            .map((d, i): ViewColumn<TRow> => ({ 
                ...d.col, 
                effectiveWidth: d.state?.width ?? d.col.width, 
                orderIndex: i, 
            })); 
    }); 
 
    function upsert(next: Map<string, TableColumnState>, patch: TableColumnState) { 
        const prev = next.get(patch.key); 
        next.set(patch.key, { ...prev, ...patch }); 
    } 
 
    function setWidth(key: string, width: number) { 
        const min = opts.minWidth?.() ?? 48; 
        const w = Math.max(min, Math.round(width)); 
        const sm = new Map(stateMap()); 
        upsert(sm, { key, width: w }); 
        commit(Array.from(sm.values())); 
    } 
 
    /** 
     * Reorder by rebuilding the full order from the current view and 
     * assigning dense indices. This keeps the state list stable and makes 
     * the next `move()` call predictable. 
     */ 
    function rewriteOrderFromView(view: NormalizedTableColumn<TRow>[]) { 
        const sm = new Map(stateMap()); 
        view.forEach((col, i) => { 
            upsert(sm, { key: col.key, order: i }); 
        }); 
        commit(Array.from(sm.values())); 
    } 
 
    function move(fromKey: string, toKey: string, position: 'before' | 'after') { 
        if (fromKey === toKey) return; 
        const view = viewColumns.value.slice(); 
        const fromIdx = view.findIndex((c) => c.key === fromKey); 
        const toIdx = view.findIndex((c) => c.key === toKey); 
        if (fromIdx < 0 || toIdx < 0) return; 
 
        // Check reorderable flags. 
        const fromCol = view[fromIdx]; 
        const toCol = view[toIdx]; 
        if (fromCol?.reorderable === false || toCol?.reorderable === false) return; 
 
        const [moved] = view.splice(fromIdx, 1); 
        if (!moved) return; 
        let insertAt = view.findIndex((c) => c.key === toKey); 
        if (insertAt < 0) return; 
        if (position === 'after') insertAt += 1; 
        view.splice(insertAt, 0, moved); 
        rewriteOrderFromView(view); 
    } 
 
    function moveBy(fromKey: string, delta: number) { 
        const view = viewColumns.value.slice(); 
        const idx = view.findIndex((c) => c.key === fromKey); 
        if (idx < 0) return; 
        const next = Math.max(0, Math.min(view.length - 1, idx + delta)); 
        if (next === idx) return; 
        const target = view[next]; 
        if (!target) return; 
        move(fromKey, target.key, delta > 0 ? 'after' : 'before'); 
    } 
 
    function setHidden(key: string, hidden: boolean) { 
        const sm = new Map(stateMap()); 
        upsert(sm, { key, hidden }); 
        commit(Array.from(sm.values())); 
    } 
 
    function reset() { 
        commit([]); 
    } 
 
    return { 
        viewColumns, 
        state, 
        setWidth, 
        move, 
        moveBy, 
        setHidden, 
        reset, 
    }; 
}
