import { ref, type Ref } from 'vue'; 
 
/** 
 * Roving tabindex + arrow-key navigation for `<Table>`. 
 * 
 * Moves focus across body cells using a single tabindex=0 cell at any 
 * given moment; the rest are tabindex=-1. Pressing arrows updates the 
 * focused cell. This matches the WAI-ARIA grid pattern. 
 * 
 * Bindings: 
 *   - `focusedRow` / `focusedCol`     : current cell coordinates. 
 *   - `isFocused(r, c)`              : helper for `:tabindex` and styling. 
 *   - `onCellKeydown(e, r, c, total)`: handler bound to each `<td>`. 
 *   - `onCellFocus(r, c)`            : tracks focus moves from mouse clicks. 
 *   - `setFocus(r, c)`               : programmatic focus (e.g. after sort). 
 * 
 * Total counts come from props each call so resize/data-change is handled 
 * implicitly without re-binding. 
 */ 
export interface UseTableKeyboardOptions { 
    /** Optional callback when the user presses Enter on a cell. */ 
    onActivate?: (row: number, col: number) => void; 
    /** Optional callback when Space is pressed (typically toggles selection). */ 
    onToggleSelect?: (row: number) => void; 
    /** Optional callback when Ctrl/⌘+A is pressed (select all). */ 
    onSelectAll?: () => void; 
} 
 
export function useTableKeyboard(opts: UseTableKeyboardOptions = {}) { 
    const focusedRow: Ref<number> = ref(0); 
    const focusedCol: Ref<number> = ref(0); 
 
    function isFocused(r: number, c: number): boolean { 
        return focusedRow.value === r && focusedCol.value === c; 
    } 
 
    function setFocus(r: number, c: number) { 
        focusedRow.value = r; 
        focusedCol.value = c; 
    } 
 
    function onCellFocus(r: number, c: number) { 
        // Sync state when focus arrives via mouse / programmatic click. 
        focusedRow.value = r; 
        focusedCol.value = c; 
    } 
 
    /** 
     * Move focus by `(dr, dc)`, clamped to `[0, rowCount)` × `[0, colCount)`. 
     * Returns the new coordinates so the caller can imperatively focus the 
     * matching DOM node (we don't query DOM here — keep the composable 
     * pure; the parent handles `focusCell()`). 
     */ 
    function move(dr: number, dc: number, rowCount: number, colCount: number) { 
        const r = clamp(focusedRow.value + dr, 0, rowCount - 1); 
        const c = clamp(focusedCol.value + dc, 0, colCount - 1); 
        setFocus(r, c); 
        return { r, c }; 
    } 
 
    function onCellKeydown( 
        e: KeyboardEvent, 
        r: number, 
        c: number, 
        rowCount: number, 
        colCount: number, 
    ): { r: number; c: number; refocus: boolean } | null { 
        // Ctrl/⌘+A → select all. 
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { 
            e.preventDefault(); 
            opts.onSelectAll?.(); 
            return null; 
        } 
 
        // Sync coords from event origin first — matters when focus came in 
        // via Tab and the saved state is stale. 
        focusedRow.value = r; 
        focusedCol.value = c; 
 
        switch (e.key) { 
            case 'ArrowUp':    e.preventDefault(); return { ...move(-1, 0, rowCount, colCount), refocus: true }; 
            case 'ArrowDown':  e.preventDefault(); return { ...move( 1, 0, rowCount, colCount), refocus: true }; 
            case 'ArrowLeft':  e.preventDefault(); return { ...move(0, -1, rowCount, colCount), refocus: true }; 
            case 'ArrowRight': e.preventDefault(); return { ...move(0,  1, rowCount, colCount), refocus: true }; 
            case 'Home': 
                e.preventDefault(); 
                if (e.ctrlKey) { setFocus(0, 0); return { r: 0, c: 0, refocus: true }; } 
                setFocus(r, 0); 
                return { r, c: 0, refocus: true }; 
            case 'End': 
                e.preventDefault(); 
                if (e.ctrlKey) { setFocus(rowCount - 1, colCount - 1); return { r: rowCount - 1, c: colCount - 1, refocus: true }; } 
                setFocus(r, colCount - 1); 
                return { r, c: colCount - 1, refocus: true }; 
            case 'PageUp': 
                e.preventDefault(); 
                return { ...move(-10, 0, rowCount, colCount), refocus: true }; 
            case 'PageDown': 
                e.preventDefault(); 
                return { ...move(10, 0, rowCount, colCount), refocus: true }; 
            case ' ': 
            case 'Spacebar': 
                e.preventDefault(); 
                opts.onToggleSelect?.(r); 
                return null; 
            case 'Enter': 
                opts.onActivate?.(r, c); 
                return null; 
        } 
        return null; 
    } 
 
    return { 
        focusedRow, 
        focusedCol, 
        isFocused, 
        setFocus, 
        onCellFocus, 
        onCellKeydown, 
    }; 
} 
 
function clamp(v: number, min: number, max: number): number { 
    if (max < min) return min; 
    if (v < min) return min; 
    if (v > max) return max; 
    return v; 
}
