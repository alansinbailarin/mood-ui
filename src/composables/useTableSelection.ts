import { computed, ref, type ComputedRef, type Ref } from 'vue'; 
import type { 
    TableSelection, 
    TableSelectionMode, 
} from '../interfaces/data-display/table/Table.interface'; 
import { resolveRowKey } from './useTable'; 
 
/** 
 * Selection state machine for `<Table>`. 
 * 
 * Modes: 
 *  - `'none'`   — selection disabled. The header checkbox column is hidden. 
 *  - `'single'` — only one row at a time. Clicking another row replaces. 
 *  - `'multi'`  — toggleable per row, plus shift+click range selection 
 *    (anchored at the last interacted row). 
 * 
 * State can be controlled (`v-model:selected`) or uncontrolled (internal). 
 * 
 * Keys are derived through the same `rowKey` resolver used elsewhere so 
 * a row's identity stays stable across data shuffling/sorting/pagination. 
 */ 
export interface UseTableSelectionOptions<TRow> { 
    mode: () => TableSelectionMode; 
    /** Visible rows (post-sort/post-filter). Required for shift+click ranges. */ 
    rows: ComputedRef<TRow[]>; 
    rowKey?: () => string | ((row: TRow, index: number) => string | number) | undefined; 
    /** Controlled state. Pass `undefined` to use the internal ref. */ 
    state?: () => TableSelection | undefined; 
    onUpdate?: (next: TableSelection) => void; 
    /** Disable selection per row (e.g. system accounts). */ 
    isRowSelectable?: (row: TRow, index: number) => boolean; 
} 
 
export function useTableSelection<TRow>(opts: UseTableSelectionOptions<TRow>) { 
    const internal = ref<TableSelection>([]) as Ref<TableSelection>; 
    const anchorIndex = ref<number | null>(null); 
 
    const selected = computed<TableSelection>(() => { 
        const ext = opts.state?.(); 
        return Array.isArray(ext) ? ext : internal.value; 
    }); 
 
    /** Set of selected keys for O(1) membership in templates. */ 
    const selectedSet = computed<Set<string | number>>(() => new Set(selected.value)); 
 
    function commit(next: TableSelection) { 
        internal.value = next; 
        opts.onUpdate?.(next); 
    } 
 
    function keyOf(row: TRow, index: number): string | number { 
        return resolveRowKey<TRow>(opts.rowKey?.(), row, index); 
    } 
 
    function isSelectable(row: TRow, index: number): boolean { 
        return opts.isRowSelectable ? opts.isRowSelectable(row, index) : true; 
    } 
 
    function isSelected(row: TRow, index: number): boolean { 
        return selectedSet.value.has(keyOf(row, index)); 
    } 
 
    /** 
     * Toggle a row. 
     * 
     * - `additive`        : Ctrl/⌘+click → add/remove without clearing others. 
     * - `range`           : Shift+click  → select range from `anchorIndex` 
     *                       (set on the last non-shift interaction) to here. 
     * 
     * `single` mode ignores both flags — it always replaces. 
     */ 
    function toggle(row: TRow, index: number, opts2?: { additive?: boolean; range?: boolean }): void { 
        const mode = opts.mode(); 
        if (mode === 'none') return; 
        if (!isSelectable(row, index)) return; 
        const k = keyOf(row, index); 
 
        if (mode === 'single') { 
            const already = selected.value.length === 1 && selected.value[0] === k; 
            commit(already ? [] : [k]); 
            anchorIndex.value = index; 
            return; 
        } 
 
        // Multi mode below. 
        if (opts2?.range && anchorIndex.value !== null) { 
            const rows = opts.rows.value; 
            const a = Math.min(anchorIndex.value, index); 
            const b = Math.max(anchorIndex.value, index); 
            const rangeKeys: (string | number)[] = []; 
            for (let i = a; i <= b; i++) { 
                const r = rows[i]; 
                if (r != null && isSelectable(r, i)) rangeKeys.push(keyOf(r, i)); 
            } 
            // Range select unions with existing selection. This matches 
            // OS file-manager behavior (shift+click extends, doesn't clear). 
            const merged = new Set([...selected.value, ...rangeKeys]); 
            commit([...merged]); 
            return; 
        } 
 
        const set = new Set(selected.value); 
        if (set.has(k)) set.delete(k); 
        else set.add(k); 
 
        if (opts2?.additive) { 
            commit([...set]); 
        } else { 
            // Plain click in multi mode also toggles (treat like additive 
            // for keyboard / Space). Most data-grids do the same. 
            commit([...set]); 
        } 
        anchorIndex.value = index; 
    } 
 
    /** Header checkbox state — true / false / 'indeterminate'. */ 
    const headerState = computed<'all' | 'none' | 'indeterminate'>(() => { 
        if (opts.mode() !== 'multi') return 'none'; 
        const rows = opts.rows.value; 
        let total = 0; 
        let picked = 0; 
        for (let i = 0; i < rows.length; i++) { 
            const r = rows[i]; 
            if (r == null || !isSelectable(r, i)) continue; 
            total++; 
            if (selectedSet.value.has(keyOf(r, i))) picked++; 
        } 
        if (total === 0) return 'none'; 
        if (picked === 0) return 'none'; 
        if (picked === total) return 'all'; 
        return 'indeterminate'; 
    }); 
 
    /** Toggle every selectable row (used by the header checkbox). */ 
    function toggleAll(): void { 
        if (opts.mode() !== 'multi') return; 
        if (headerState.value === 'all') { 
            commit([]); 
            return; 
        } 
        const rows = opts.rows.value; 
        const next: (string | number)[] = []; 
        for (let i = 0; i < rows.length; i++) { 
            const r = rows[i]; 
            if (r != null && isSelectable(r, i)) next.push(keyOf(r, i)); 
        } 
        commit(next); 
    } 
 
    function clear(): void { 
        commit([]); 
        anchorIndex.value = null; 
    } 
 
    return { 
        selected, 
        selectedSet, 
        isSelected, 
        isSelectable, 
        toggle, 
        toggleAll, 
        headerState, 
        clear, 
    }; 
}
