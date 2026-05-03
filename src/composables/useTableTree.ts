/** 
 * useTableTree — hierarchical row flattening for `<Table tree>`. 
 * 
 * Given the (already filtered + sorted) top-level rows, this composable 
 * produces a flat list `flatRows` where each entry carries its `depth` 
 * and tree metadata (`hasChildren`, `expanded`, `isLoading`, `parentKey`, 
 * `aria-setsize`, `aria-posinset`). The table renders directly from 
 * `flatRows`, so all existing concerns (sort, filter, selection, 
 * keyboard nav) operate on the visually-rendered list without any 
 * special-case branches. 
 * 
 * Children are read from `childrenKey` (default `'children'`). When a 
 * `loadChildren` callback is provided and a row has no `childrenKey` 
 * yet, the chevron is still rendered *if* `hasChildrenHint` returns 
 * true (or `loadChildren` is defined). On expand the callback fires; 
 * while pending the row sets `isLoading=true` so the host can render 
 * a placeholder. 
 * 
 * The composable does NOT recursively filter/sort — that is the parent 
 * `<Table>`'s job (it walks the tree before flattening). Keeping this 
 * one-purpose makes it cheap to compute on every render. 
 */ 
import { computed, ref, shallowRef, type Ref } from 'vue'; 
import { resolveRowKey } from './useTable'; 
 
export interface UseTableTreeOptions<TRow> { 
    /** Top-level rows (already filtered + sorted). */ 
    rows: () => TRow[]; 
    /** Field that holds the children array on each row. */ 
    childrenKey: () => string; 
    /** Resolves a row → stable key (mirrors `<Table rowKey>`). */ 
    rowKey: () => string | ((row: TRow, index: number) => string | number) | undefined; 
    /** Currently-expanded row keys (controlled). When omitted, internal state is used. */ 
    expanded: () => (string | number)[] | undefined; 
    /** Emit a new expanded array (controlled). */ 
    onUpdate: (next: (string | number)[]) => void; 
    /** 
     * Lazy loader for a row's children. When set, rows that have no 
     * pre-loaded children but pass `hasChildrenHint` show the chevron; 
     * expansion triggers the loader and the result replaces `row[childrenKey]`. 
     */ 
    loadChildren?: (row: TRow, index: number) => Promise<TRow[]>; 
    /** 
     * Hint for "this row probably has children" used only when 
     * `loadChildren` is set and the children are not yet known. Default 
     * returns false (i.e. only show chevrons for already-loaded children). 
     */ 
    hasChildrenHint?: (row: TRow, index: number) => boolean; 
} 
 
/** One flattened entry returned by the composable. */ 
export interface FlatTreeRow<TRow> { 
    row: TRow; 
    /** Original index of the *top-level* row in the input array. For 
     *  nested rows this is the index inside the parent's children array. */ 
    index: number; 
    /** 0-based depth. Root rows are 0. */ 
    depth: number; 
    /** True if the row has (or is hinted to have) children. */ 
    hasChildren: boolean; 
    /** True when expanded. */ 
    expanded: boolean; 
    /** True while a lazy load is in flight. */ 
    isLoading: boolean; 
    /** Stable key — same as `resolveRowKey`. */ 
    key: string | number; 
    /** Key of the parent row, or `null` for root rows. */ 
    parentKey: string | number | null; 
    /** Position within siblings (1-based) for `aria-posinset`. */ 
    posInSet: number; 
    /** Sibling count for `aria-setsize`. */ 
    setSize: number; 
} 
 
export function useTableTree<TRow>(opts: UseTableTreeOptions<TRow>) { 
    const internalExpanded = ref<(string | number)[]>([]); 
    const expandedKeys = computed<(string | number)[]>( 
        () => opts.expanded() ?? internalExpanded.value, 
    ); 
    const expandedSet = computed(() => new Set(expandedKeys.value)); 
 
    /** Tracks rows currently being lazy-loaded. */ 
    const loadingKeys = ref<Set<string | number>>(new Set()); 
    /** Tracks lazy-loaded children per row key (so a re-expand doesn't refetch). 
     *  `shallowRef` keeps `TRow` from being unwrapped by Vue's reactive proxy. */ 
    const lazyChildren = shallowRef<Map<string | number, TRow[]>>(new Map()); 
 
    function getChildren(row: TRow): TRow[] | undefined { 
        const k = (row as any)?.[opts.childrenKey()]; 
        if (Array.isArray(k)) return k as TRow[]; 
        // Fall back to lazily-loaded children. 
        const key = resolveRowKey(opts.rowKey(), row, 0); 
        return lazyChildren.value.get(key); 
    } 
 
    function rowHasChildren(row: TRow, index: number): boolean { 
        const c = getChildren(row); 
        if (c && c.length > 0) return true; 
        if (opts.loadChildren && opts.hasChildrenHint?.(row, index)) return true; 
        return false; 
    } 
 
    function isExpanded(row: TRow, index: number): boolean { 
        const k = resolveRowKey(opts.rowKey(), row, index); 
        return expandedSet.value.has(k); 
    } 
 
    function setExpanded(key: string | number, value: boolean): void { 
        const next = new Set(expandedKeys.value); 
        if (value) next.add(key); 
        else next.delete(key); 
        const arr = Array.from(next); 
        if (opts.expanded() === undefined) internalExpanded.value = arr; 
        opts.onUpdate(arr); 
    } 
 
    async function toggle(row: TRow, index: number) { 
        const key = resolveRowKey(opts.rowKey(), row, index); 
        const open = expandedSet.value.has(key); 
        if (open) { 
            setExpanded(key, false); 
            return; 
        } 
        // Opening: trigger lazy load if needed. 
        const existing = getChildren(row); 
        if ((!existing || existing.length === 0) && opts.loadChildren) { 
            loadingKeys.value.add(key); 
            // Force reactivity on the Set. 
            loadingKeys.value = new Set(loadingKeys.value); 
            try { 
                const kids = await opts.loadChildren(row, index); 
                lazyChildren.value.set(key, kids); 
                // Force reactivity on the Map. 
                lazyChildren.value = new Map(lazyChildren.value); 
            } finally { 
                loadingKeys.value.delete(key); 
                loadingKeys.value = new Set(loadingKeys.value); 
            } 
        } 
        setExpanded(key, true); 
    } 
 
    /** Walk the tree depth-first, producing the flat render list. */ 
    const flatRows = computed<FlatTreeRow<TRow>[]>(() => { 
        const out: FlatTreeRow<TRow>[] = []; 
        const childrenKey = opts.childrenKey(); 
        const rk = opts.rowKey(); 
 
        function walk( 
            siblings: TRow[], 
            depth: number, 
            parentKey: string | number | null, 
        ) { 
            const setSize = siblings.length; 
            for (let i = 0; i < siblings.length; i++) { 
                const row = siblings[i]!; 
                const key = resolveRowKey(rk, row, i); 
                const childArr = (row as any)?.[childrenKey]; 
                const lazy = lazyChildren.value.get(key); 
                const kids = (Array.isArray(childArr) && childArr.length > 0) ? childArr as TRow[] 
                    : (lazy && lazy.length > 0) ? lazy 
                    : undefined; 
                const hasKids = !!kids 
                    || (!!opts.loadChildren && (opts.hasChildrenHint?.(row, i) ?? false)); 
                const open = expandedSet.value.has(key); 
                out.push({ 
                    row, 
                    index: i, 
                    depth, 
                    hasChildren: hasKids, 
                    expanded: open, 
                    isLoading: loadingKeys.value.has(key), 
                    key, 
                    parentKey, 
                    posInSet: i + 1, 
                    setSize, 
                }); 
                if (open && kids && kids.length > 0) { 
                    walk(kids, depth + 1, key); 
                } 
            } 
        } 
 
        walk(opts.rows(), 0, null); 
        return out; 
    }); 
 
    return { 
        flatRows, 
        toggle, 
        isExpanded, 
        rowHasChildren, 
        loadingKeys: loadingKeys as Ref<Set<string | number>>, 
    }; 
}
