<script setup lang="ts" generic="TRow"> 
/** 
 * Table · Phase 1+2+3a. 
 * 
 * Phase 1 — static rendering: dual column API, sizing, striping, hover, 
 * borders, sticky header, radius, overflow, loading skeletons, empty. 
 * 
 * Phase 2 — interaction: sort (single & multi), selection 
 * (`none|single|multi`, shift-range, indeterminate header), roving 
 * tabindex keyboard nav, density, live region. 
 * 
 * Phase 3a — data scaling layer: 
 *  - **Filter** (`v-model:filter` + `column.filterable` + `column.filter`): 
 *    contains/startsWith/equals or custom predicate per column. Filter 
 *    inputs render in a sub-row below the header when `filterRow` is on. 
 *  - **Row expansion** (`v-model:expanded`, `expandable`, `#row-expanded` 
 *    slot): chevron column auto-injected, accessible toggle button. 
 *  - **Pagination** (`v-model:pagination` + `pageSizeOptions`): standalone 
 *    `<TablePagination>` footer; client-side slicing or server mode 
 *    (`serverSide` skips local filter/sort/slice and trusts the parent). 
 * 
 * Pipeline (client mode): 
 *   data → filter → sort → paginate → visibleData (rendered) 
 * 
 * Selection / keyboard / aria-rowindex all operate over `visibleData`, 
 * mirroring what the user actually sees on screen. 
 */ 
import { computed, h, nextTick, ref, useSlots, watch, type VNode } from 'vue'; 
import type { 
    Table as TableProps, 
    TableSelection, 
    TableSortState, 
    TableFilterState, 
    TableExpansionState, 
    TablePaginationState, 
    TableColumnState, 
    TableCellEditEvent, 
    TableStateSnapshot, 
} from '../../../interfaces/data-display/table/Table.interface'; 
import { useResolvedRadius, useModoLocale, useResolvedSize } from '../../../composables/useModoConfig'; 
import { 
    useTableColumns, 
    resolveCellValue, 
    resolveRowKey, 
    toCssLength, 
} from '../../../composables/useTable'; 
import { useTableSort } from '../../../composables/useTableSort'; 
import { useTableSelection } from '../../../composables/useTableSelection'; 
import { useTableKeyboard } from '../../../composables/useTableKeyboard'; 
import { useTableFilter } from '../../../composables/useTableFilter'; 
import { useTablePagination } from '../../../composables/useTablePagination'; 
import { useTableColumnsState } from '../../../composables/useTableColumnsState'; 
import { useTableVirtual } from '../../../composables/useTableVirtual'; 
import { useTableTree } from '../../../composables/useTableTree'; 
import { interpolate } from '../../../config/ModoLocale'; 
import Skeleton from '../../feedback/Skeleton.vue'; 
import Loader from '../../feedback/Loader.vue'; 
import Checkbox from '../../forms/Checkbox.vue'; 
import Button from '../../forms/Button.vue'; 
import Input from '../../forms/Input.vue'; 
import SearchInput from '../../forms/SearchInput.vue'; 
import PopoverPanel from '../../layout/PopoverPanel.vue'; 
import Tooltip from '../../feedback/Tooltip.vue'; 
import { usePopover } from '../../../composables/usePopover'; 
import TablePagination from './TablePagination.vue'; 
import { 
    ChevronUpIcon, 
    ChevronDownIcon, 
    ChevronUpDownIcon, 
    ChevronRightIcon, 
} from '@heroicons/vue/20/solid'; 
 
const props = withDefaults(defineProps<TableProps<TRow>>(), { 
    striped: false, 
    bordered: 'rows', 
    hover: true, 
    density: 'comfortable', 
    dense: false, 
    stickyHeader: false, 
    overflow: 'scroll', 
    loading: false, 
    loadingRows: 5, 
    multiSort: false, 
    sortClearable: true, 
    selectable: 'none', 
    filterRow: false, 
    expandable: false, 
    pageSizeOptions: () => [10, 25, 50, 100], 
    serverSide: false, 
    resizable: false, 
    reorderable: false, 
    minColumnWidth: 48, 
    virtual: false, 
    overscan: 5, 
    virtualHeight: '60vh', 
    tree: false, 
    childrenKey: 'children', 
    stickyFirstColumn: false, 
    toolbar: false, 
    globalSearch: false, 
    globalSearchScope: 'all', 
    columnVisibility: false, 
    exportable: false, 
    exportFileName: 'table', 
    loadingMode: 'skeleton', 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const emit = defineEmits<{ 
    'update:sort': [next: TableSortState]; 
    'update:selected': [next: TableSelection]; 
    'update:filter': [next: TableFilterState]; 
    'update:expanded': [next: TableExpansionState]; 
    'update:pagination': [next: TablePaginationState]; 
    'update:columnsState': [next: TableColumnState[]]; 
    'update:treeExpanded': [next: (string | number)[]]; 
    'update:groupExpanded': [next: (string | number)[]]; 
    'update:globalSearchTerm': [next: string]; 
    'row-activate': [row: TRow, index: number]; 
    'row-click': [row: TRow, index: number]; 
    'cell-edit': [event: TableCellEditEvent<TRow>]; 
    'cell-edit-cancel': [ctx: { key: string; row: TRow; index: number }]; 
    'update:state': [next: TableStateSnapshot]; 
}>(); 
 
const slots = useSlots(); 
const loc = useModoLocale(); 
const radius = useResolvedRadius(() => props.radius); 
 
defineSlots<{ 
    default?: () => any; 
    caption?: () => any; 
    empty?: (ctx: { message: string }) => any; 
    noResults?: (ctx: { message: string; clear: () => void }) => any; 
    footer?: () => any; 
    toolbar?: (ctx: { 
        searchTerm: string; 
        setSearchTerm: (v: string) => void; 
        clearSearch: () => void; 
    }) => any; 
    'bulk-actions'?: (ctx: { 
        selected: (string | number)[]; 
        rows: TRow[]; 
        count: number; 
        clear: () => void; 
    }) => any; 
    'row-expanded'?: (ctx: { row: TRow; index: number }) => any; 
    'group-header'?: (ctx: { 
        value: string | number; 
        rows: TRow[]; 
        count: number; 
        expanded: boolean; 
        toggle: () => void; 
        aggregations: Record<string, unknown>; 
    }) => any; 
    [name: `cell-${string}`]: ((ctx: { row: TRow; value: unknown; index: number }) => any) | undefined; 
    [name: `header-${string}`]: ((ctx: { column: any }) => any) | undefined; 
    [name: `filter-${string}`]: ((ctx: { column: any; value: string; setValue: (v: string) => void; clear: () => void }) => any) | undefined; 
}>(); 
 
/* ---------------- Columns ---------------- */ 
const columns = useTableColumns<TRow>(() => props.columns, slots); 
 
/* ---------------- Columns state (Phase 3b: resize / reorder / visibility) ---- 
 * The view-columns list is produced by applying user preferences (widths, 
 * order, hidden) on top of the declared columns. Everything downstream 
 * (header render, body render, aria-colcount, keyboard navigation) reads 
 * from `cols` so it transparently reflects the current arrangement. 
 */ 
const columnsStateApi = useTableColumnsState<TRow>({ 
    columns, 
    state: () => props.columnsState ?? props.state?.columnsState, 
    onUpdate: (next) => emit('update:columnsState', next), 
    minWidth: () => props.minColumnWidth ?? 48, 
}); 
 
/* ---------------- Column pinning (Phase 4b) ---------------- 
 * Pinned columns are visually pulled out of the horizontal scroll flow 
 * via `position: sticky`. We sort the view-columns array so that 
 * pinned-left come first and pinned-right last (within each group the 
 * declared/`columnsState` order is preserved). Cumulative widths are 
 * resolved from `effectiveWidth ?? width ?? minWidth ?? FALLBACK_PX` so 
 * sticky offsets line up with what's actually rendered. 
 * 
 * The leading "system" columns (selection checkbox, expansion chevron) 
 * are always rendered first in the DOM and become sticky-left whenever 
 * at least one data column is pinned-left. 
 */ 
const PIN_FALLBACK_PX = 120; // sane default for unset widths 
const LEADING_COL_PX = 40;   // matches `w-10` on selection/expansion cells 
 
function pxFromCss(v: unknown): number { 
    if (v == null) return PIN_FALLBACK_PX; 
    if (typeof v === 'number') return v; 
    const s = String(v).trim(); 
    const m = /^(-?\d+(?:\.\d+)?)(px|rem|em)?$/i.exec(s); 
    if (m && m[1] !== undefined) { 
        const n = Number(m[1]); 
        const unit = (m[2] ?? 'px').toLowerCase(); 
        if (unit === 'px') return n; 
        // rem/em → use the document root font-size at runtime; fall back 
        // to the CSS spec default of 16px during SSR / no DOM. 
        const root = typeof document !== 'undefined' 
            ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 
            : 16; 
        return n * root; 
    } 
    // For % or other unsupported units, conservatively use the fallback. 
    return PIN_FALLBACK_PX; 
} 
 
function colWidthPx(c: any): number { 
    const w = previewWidthFor(c.key) ?? c.effectiveWidth ?? c.width ?? c.minWidth; 
    return Math.max(0, pxFromCss(w)); 
} 
 
const cols = computed(() => { 
    const all = columnsStateApi.viewColumns.value; 
    const left = all.filter((c) => c.pinned === 'left'); 
    const right = all.filter((c) => c.pinned === 'right'); 
    const mid = all.filter((c) => c.pinned !== 'left' && c.pinned !== 'right'); 
    return [...left, ...mid, ...right]; 
}); 
 
/** Whether at least one data column is pinned-left. Used to decide if 
 *  the leading system columns (selection / expansion) must also stick. */ 
const hasLeftPinned = computed(() => cols.value.some((c) => c.pinned === 'left')); 
 
/** Per-key offset map. For `'left'` it's the cumulative px from the 
 *  start; for `'right'` it's the cumulative px from the end. `isEdge` 
 *  marks the last pinned-left / first pinned-right column so we can 
 *  draw the boundary shadow. */ 
const pinMap = computed<Record<string, { side: 'left' | 'right'; offset: number; isEdge: boolean }>>(() => { 
    const out: Record<string, { side: 'left' | 'right'; offset: number; isEdge: boolean }> = {}; 
    const list = cols.value; 
 
    // Leading system columns occupy fixed px before any data column. 
    const leadingPx = leadingColCount.value * LEADING_COL_PX; 
 
    let acc = leadingPx; 
    let lastLeftKey: string | null = null; 
    for (const c of list) { 
        if (c.pinned !== 'left') continue; 
        out[c.key] = { side: 'left', offset: acc, isEdge: false }; 
        acc += colWidthPx(c); 
        lastLeftKey = c.key; 
    } 
    if (lastLeftKey && out[lastLeftKey]) out[lastLeftKey].isEdge = true; 
 
    let racc = 0; 
    let firstRightKey: string | null = null; 
    for (let i = list.length - 1; i >= 0; i--) { 
        const c = list[i]; 
        if (!c || c.pinned !== 'right') continue; 
        out[c.key] = { side: 'right', offset: racc, isEdge: false }; 
        racc += colWidthPx(c); 
        firstRightKey = c.key; 
    } 
    if (firstRightKey && out[firstRightKey]) out[firstRightKey].isEdge = true; 
 
    return out; 
}); 
 
/** Sticky style for a data cell (body or header). Returns `undefined` 
 *  when the column is not pinned so we don't pollute the inline style. */ 
function pinStyle(c: any): Record<string, string> | undefined { 
    const p = pinMap.value[c.key]; 
    if (!p) return undefined; 
    const style: Record<string, string> = { 
        position: 'sticky', 
        zIndex: '1', 
    }; 
    if (p.side === 'left') style.left = p.offset + 'px'; 
    else style.right = p.offset + 'px'; 
    if (p.isEdge) { 
        style.boxShadow = p.side === 'left' 
            ? '4px 0 6px -4px rgb(0 0 0 / 0.18)' 
            : '-4px 0 6px -4px rgb(0 0 0 / 0.18)'; 
    } 
    return style; 
} 
 
/** Same as `pinStyle` but for header cells: bumps z-index above the 
 *  body so a sticky-header + sticky-column corner stays on top. */ 
function pinHeaderStyle(c: any): Record<string, string> | undefined { 
    const s = pinStyle(c); 
    if (!s) return undefined; 
    return { ...s, zIndex: '3' }; 
} 
 
/** Sticky style for the leading system columns. They become sticky-left 
 *  whenever any data column is pinned-left so the pinned region stays 
 *  visually contiguous. `idx` is the 0-based position among leading 
 *  columns (expansion is rendered before selection in the template). */ 
function pinLeadingStyle(idx: number, isHeader = false): Record<string, string> | undefined { 
    if (!hasLeftPinned.value) return undefined; 
    const style: Record<string, string> = { 
        position: 'sticky', 
        left: idx * LEADING_COL_PX + 'px', 
        zIndex: isHeader ? '3' : '1', 
    }; 
    return style; 
} 
 
/** True when the filter row should render (host opted in AND at least 
 *  one column is filterable, or the host gave a custom `#filter-{key}` 
 *  slot that we should still surface). */ 
const hasFilterRow = computed(() => { 
    if (!props.filterRow) return false; 
    return cols.value.some((c) => { 
        if (c.filterable === false) return false; 
        if (c.filterable) return true; 
        return typeof slots[`filter-${c.key}`] === 'function'; 
    }); 
}); 
 
/** Body column count (used by colspan on empty / loading / footer rows). */ 
const colCount = computed(() => { 
    let n = cols.value.length; 
    if (props.selectable !== 'none') n += 1; 
    if (effectiveExpandable.value) n += 1; 
    return n; 
}); 
 
/** Offset added to body column indices to account for prepended columns. */ 
const leadingColCount = computed(() => 
    (props.selectable !== 'none' ? 1 : 0) + (effectiveExpandable.value ? 1 : 0), 
); 
 
/** Tree mode disables row-panel expansion (one expansion model at a time). */ 
const effectiveExpandable = computed(() => !!props.expandable && !props.tree && !props.groupBy); 
 
/** Tree / group modes disable pagination (paging a flattened tree or 
 *  a fully-grouped list is undefined). */ 
const effectivePagination = computed(() => 
    (props.tree || props.groupBy) 
        ? undefined 
        : (props.pagination ?? props.state?.pagination), 
); 
 
/* ---------------- Filter ---------------- */ 
const filterApi = useTableFilter<TRow>({ 
    columns, 
    state: () => props.filter ?? props.state?.filter, 
    onUpdate: (next) => emit('update:filter', next), 
}); 
 
/* ---------------- Global search (Phase 5a) ---------------- 
 * Stringifies every column value (or only `filterable` ones when 
 * `globalSearchScope='filterable'`) and runs a case-insensitive 
 * `contains` match against the search term. Skipped in server mode 
 * — the host owns filtering there. */ 
const internalGlobalSearch = ref(''); 
const globalSearchTerm = computed<string>( 
    () => props.globalSearchTerm ?? props.state?.globalSearchTerm ?? internalGlobalSearch.value, 
); 
function setGlobalSearch(next: string) { 
    if (props.globalSearchTerm === undefined) internalGlobalSearch.value = next; 
    emit('update:globalSearchTerm', next); 
} 
const showToolbar = computed( 
    () => 
        !!props.toolbar || 
        !!props.globalSearch || 
        !!props.columnVisibility || 
        !!props.exportable, 
); 
const hasGlobalSearch = computed(() => !!props.globalSearch); 
 
/* ---------------- Column visibility menu (Phase 5b) ---------------- */ 
const colMenuTriggerEl = ref<{ $el: HTMLElement } | HTMLElement | null>(null); 
const { 
    triggerRef: colMenuTriggerRef, 
    panelRef: colMenuPanelRef, 
    isOpen: colMenuOpen, 
    panelStyle: colMenuPanelStyle, 
    toggle: toggleColMenu, 
} = usePopover({ placement: 'bottom-end' }); 
watch(colMenuTriggerEl, (el) => (colMenuTriggerRef.value = (el && '$el' in el ? el.$el : el) as HTMLElement | null)); 
 
function isColumnHidden(key: string): boolean { 
    const s = columnsStateApi.state.value.find((x) => x.key === key); 
    return !!s?.hidden; 
} 
function toggleColumnHidden(key: string, next: boolean) { 
    columnsStateApi.setHidden(key, next); 
} 
const visibleColumnCount = computed( 
    () => columns.value.filter((c) => !isColumnHidden(c.key)).length, 
); 
 
/* ---------------- Export menu (Phase 5c) ---------------- 
 * Exports the post-filter + post-sort dataset (pre-pagination) using 
 * only visible columns. Values come from `resolveCellValue`, then are 
 * stringified the same way the body cells display them so the export 
 * matches what the user sees. 
 * 
 * - CSV: RFC4180-ish — wraps in double quotes when the value contains 
 *   `"`, `,`, or newline; doubles internal quotes. 
 * - JSON: `[{ key: value, … }]` with raw values (Date → ISO). 
 * - Clipboard: TSV (no quoting; tabs aren't legal inside cell text). */ 
const exportFormats = computed(() => { 
    const e = props.exportable; 
    if (!e) return { csv: false, json: false, clipboard: false }; 
    if (e === true) return { csv: true, json: true, clipboard: true }; 
    return { csv: !!e.csv, json: !!e.json, clipboard: !!e.clipboard }; 
}); 
const hasExport = computed(() => { 
    const f = exportFormats.value; 
    return f.csv || f.json || f.clipboard; 
}); 
 
const exportMenuTriggerEl = ref<{ $el: HTMLElement } | HTMLElement | null>(null); 
const { 
    triggerRef: exportMenuTriggerRef, 
    panelRef: exportMenuPanelRef, 
    isOpen: exportMenuOpen, 
    panelStyle: exportMenuPanelStyle, 
    toggle: toggleExportMenu, 
    close: closeExportMenu, 
} = usePopover({ placement: 'bottom-end' }); 
watch(exportMenuTriggerEl, (el) => (exportMenuTriggerRef.value = (el && '$el' in el ? el.$el : el) as HTMLElement | null)); 
 
function exportRows(): TRow[] { 
    return sortedData.value; 
} 
function exportColumns() { 
    return cols.value; 
} 
function stringifyForExport(v: unknown): string { 
    if (v == null) return ''; 
    if (v instanceof Date) return v.toLocaleDateString(); 
    if (Array.isArray(v)) return v.join(', '); 
    if (typeof v === 'boolean') return v ? 'true' : 'false'; 
    return String(v); 
} 
function csvEscape(s: string): string { 
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) { 
        return `"${s.replace(/"/g, '""')}"`; 
    } 
    return s; 
} 
function buildDelimited(sep: string): string { 
    return buildDelimitedFromRows(exportRows(), sep); 
} 
function buildDelimitedFromRows(rows: TRow[], sep: string): string { 
    const cs = exportColumns(); 
    const header = cs.map((c) => csvEscape(c.header ?? c.key)).join(sep); 
    const lines: string[] = [header]; 
    for (let i = 0; i < rows.length; i++) { 
        const row = rows[i] as TRow; 
        const out: string[] = []; 
        for (const c of cs) { 
            const raw = resolveCellValue(c, row, i); 
            const text = stringifyForExport(raw); 
            out.push(sep === ',' ? csvEscape(text) : text.replace(/\t|\r|\n/g, ' ')); 
        } 
        lines.push(out.join(sep)); 
    } 
    return lines.join('\n'); 
} 
function buildJson(): string { 
    const cs = exportColumns(); 
    const rows = exportRows(); 
    const out = rows.map((row, i) => { 
        const obj: Record<string, unknown> = {}; 
        for (const c of cs) { 
            const raw = resolveCellValue(c, row, i); 
            obj[c.key] = raw instanceof Date ? raw.toISOString() : raw; 
        } 
        return obj; 
    }); 
    return JSON.stringify(out, null, 2); 
} 
function downloadBlob(content: string, mime: string, ext: string) { 
    const blob = new Blob([content], { type: `${mime};charset=utf-8` }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `${props.exportFileName ?? 'table'}.${ext}`; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    URL.revokeObjectURL(url); 
} 
function exportCsv() { 
    downloadBlob(buildDelimited(','), 'text/csv', 'csv'); 
    closeExportMenu(); 
} 
function exportJson() { 
    downloadBlob(buildJson(), 'application/json', 'json'); 
    closeExportMenu(); 
} 
async function exportClipboard() { 
    const tsv = buildDelimited('\t'); 
    try { 
        await navigator.clipboard.writeText(tsv); 
    } catch { 
        // Fallback: textarea + execCommand for older browsers. 
        const ta = document.createElement('textarea'); 
        ta.value = tsv; 
        ta.style.position = 'fixed'; 
        ta.style.opacity = '0'; 
        document.body.appendChild(ta); 
        ta.select(); 
        try { document.execCommand('copy'); } catch { /* noop */ } 
        ta.remove(); 
    } 
    closeExportMenu(); 
} 
 
/** Copies currently selected rows as TSV to the clipboard. Used by Ctrl/Cmd+C 
 *  on a focused cell when a selection is active (Phase 5e). Silent — does not 
 *  open or close any menu. */ 
async function copySelectedAsTsv() { 
    const rows = selectedRowsResolved.value; 
    if (rows.length === 0) return; 
    const tsv = buildDelimitedFromRows(rows, '\t'); 
    try { 
        await navigator.clipboard.writeText(tsv); 
    } catch { 
        const ta = document.createElement('textarea'); 
        ta.value = tsv; 
        ta.style.position = 'fixed'; 
        ta.style.opacity = '0'; 
        document.body.appendChild(ta); 
        ta.select(); 
        try { document.execCommand('copy'); } catch { /* noop */ } 
        ta.remove(); 
    } 
    liveMessage.value = interpolate(loc.value.table.copiedRows, { count: rows.length }); 
} 
 
function stringifyForSearch(v: unknown): string { 
    if (v == null) return ''; 
    if (v instanceof Date) return v.toLocaleDateString(); 
    if (Array.isArray(v)) return v.join(', '); 
    return String(v); 
} 
 
function applyGlobalSearch(rows: TRow[]): TRow[] { 
    const term = globalSearchTerm.value.trim().toLowerCase(); 
    if (!term) return rows; 
    const cols = columns.value.filter((c) => 
        props.globalSearchScope === 'filterable' ? c.filterable !== false : true, 
    ); 
    if (!cols.length) return rows; 
    const out: TRow[] = []; 
    for (let i = 0; i < rows.length; i++) { 
        const row = rows[i]; 
        if (row == null) continue; 
        let match = false; 
        for (const c of cols) { 
            const val = resolveCellValue(c, row, i); 
            if (stringifyForSearch(val).toLowerCase().includes(term)) { 
                match = true; 
                break; 
            } 
        } 
        if (match) out.push(row); 
    } 
    return out; 
} 
 
/** Filtered data — unchanged in server mode (host returns the page itself). */ 
const filteredData = computed<TRow[]>(() => { 
    if (props.serverSide) return props.data; 
    const afterSearch = hasGlobalSearch.value 
        ? applyGlobalSearch(props.data) 
        : props.data; 
    return filterApi.apply(afterSearch); 
}); 
 
/* ---------------- Sort ---------------- */ 
const sortApi = useTableSort<TRow>({ 
    columns, 
    state: () => props.sort ?? props.state?.sort, 
    onUpdate: (next) => emit('update:sort', next), 
    multi: () => props.multiSort, 
    clearable: () => props.sortClearable, 
}); 
 
const sortedData = computed<TRow[]>(() => 
    props.serverSide ? filteredData.value : sortApi.apply(filteredData.value), 
); 
 
/* ---------------- Pagination ---------------- */ 
const paginationApi = useTablePagination<TRow>({ 
    state: () => effectivePagination.value, 
    onUpdate: (next) => emit('update:pagination', next), 
    derivedTotal: () => sortedData.value.length, 
    serverSide: () => !!props.serverSide, 
}); 
 
/** 
 * Final visible slice. When pagination isn't configured we render the full 
 * sorted set (matches Phase 1+2 behavior). In tree mode we replace this 
 * with the flattened (and lazily-expanded) row list — see below. In 
 * group mode we render only rows whose group is currently expanded. 
 */ 
const visibleData = computed<TRow[]>(() => { 
    if (props.tree) return treeFlat.value.map((f) => f.row); 
    if (props.groupBy) return groupedRows.value; 
    if (!effectivePagination.value) return sortedData.value; 
    return paginationApi.apply(sortedData.value); 
}); 
 
/* ---------------- Tree (Phase 4c) ---------------- */ 
const treeApi = useTableTree<TRow>({ 
    rows: () => sortedData.value, 
    childrenKey: () => props.childrenKey ?? 'children', 
    rowKey: () => props.rowKey, 
    expanded: () => props.treeExpanded, 
    onUpdate: (next) => emit('update:treeExpanded', next), 
    loadChildren: props.loadChildren, 
    hasChildrenHint: props.hasChildrenHint, 
}); 
const treeFlat = computed(() => (props.tree ? treeApi.flatRows.value : [])); 
/** Lookup of tree metadata by row index in `visibleData`. */ 
const treeMetaByIndex = computed(() => { 
    if (!props.tree) return null as null | typeof treeFlat.value; 
    return treeFlat.value; 
}); 
 
/** Tree meta for a body row index (or `null` when not in tree mode). */ 
function treeMeta(ri: number) { 
    const t = treeMetaByIndex.value; 
    if (!t) return null; 
    return t[ri] ?? null; 
} 
 
/** Toggle children of a tree row. */ 
function toggleTreeRow(row: TRow, ri: number) { 
    const m = treeMeta(ri); 
    if (!m) return; 
    treeApi.toggle(row, m.index); 
} 
 
/* ---------------- Grouping (Phase 4c-group) ---------------- 
 * Groups the post-filter+sort row set by `groupBy`. The grouped list 
 * is flattened into: 
 * 
 *   - `groupedRows`     — only rows whose group is currently expanded. 
 *                         These are what `visibleData` exposes, so 
 *                         selection / keyboard / aria-rowindex stay 
 *                         numerically aligned with rendered rows. 
 *   - `groupedItems`    — render-only list with `{ kind: 'header' | 'row' }` 
 *                         markers so the template can interleave group 
 *                         header rows between data rows. 
 * 
 * Aggregations are computed over the *full* group (including hidden 
 * rows when collapsed) — they describe the underlying data, not what 
 * is currently rendered. 
 */ 
const internalGroupExpanded = ref<(string | number)[]>([]); 
const groupExpandedKeys = computed<(string | number)[]>( 
    () => props.groupExpanded ?? internalGroupExpanded.value, 
); 
/** When the host hasn't initialised `internalGroupExpanded` yet, treat 
 *  every group as expanded so the table doesn't open empty. */ 
const groupExpandedSet = computed(() => { 
    if (props.groupExpanded === undefined && internalGroupExpanded.value.length === 0) { 
        return null; // sentinel: "all expanded" 
    } 
    return new Set(groupExpandedKeys.value); 
}); 
 
function isGroupExpanded(key: string | number): boolean { 
    const s = groupExpandedSet.value; 
    return s === null ? true : s.has(key); 
} 
 
function toggleGroup(key: string | number) { 
    // Materialise "all expanded" into an explicit list before mutating 
    // so subsequent toggles are stable. 
    let current: (string | number)[]; 
    if (groupExpandedSet.value === null) { 
        current = groupKeys.value.slice(); 
    } else { 
        current = groupExpandedKeys.value.slice(); 
    } 
    const idx = current.indexOf(key); 
    if (idx >= 0) current.splice(idx, 1); 
    else current.push(key); 
    if (props.groupExpanded === undefined) internalGroupExpanded.value = current; 
    emit('update:groupExpanded', current); 
} 
 
/** Read the group value of a single row. */ 
function groupValueFor(row: TRow): string | number { 
    const g = props.groupBy; 
    if (!g) return ''; 
    if (typeof g === 'function') return g(row); 
    const v = (row as any)?.[g]; 
    return v == null ? '' : (v as string | number); 
} 
 
/** Map of `groupKey → rows`, preserving first-seen order. */ 
const groupedMap = computed<Map<string | number, TRow[]>>(() => { 
    const out = new Map<string | number, TRow[]>(); 
    if (!props.groupBy) return out; 
    for (const row of sortedData.value) { 
        const v = groupValueFor(row); 
        let arr = out.get(v); 
        if (!arr) { 
            arr = []; 
            out.set(v, arr); 
        } 
        arr.push(row); 
    } 
    return out; 
}); 
 
const groupKeys = computed(() => Array.from(groupedMap.value.keys())); 
 
/** Compute one column's aggregate over a row set. */ 
function applyAggregate(c: any, rows: TRow[]): unknown { 
    const agg = c.aggregate; 
    if (!agg) return undefined; 
    if (typeof agg === 'function') return agg(rows, c.key); 
    if (agg === 'count') return rows.length; 
    const nums: number[] = []; 
    for (const row of rows) { 
        const raw = resolveCellValue(c, row, 0); 
        const n = typeof raw === 'number' ? raw : Number(raw); 
        if (!Number.isNaN(n)) nums.push(n); 
    } 
    if (nums.length === 0) return undefined; 
    if (agg === 'sum') return nums.reduce((a, b) => a + b, 0); 
    if (agg === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length; 
    if (agg === 'min') return Math.min(...nums); 
    if (agg === 'max') return Math.max(...nums); 
    return undefined; 
} 
 
/** All aggregations for a row set, keyed by column key. */ 
function aggregationsFor(rows: TRow[]): Record<string, unknown> { 
    const out: Record<string, unknown> = {}; 
    for (const c of cols.value) { 
        if (!c.aggregate) continue; 
        out[c.key] = applyAggregate(c, rows); 
    } 
    return out; 
} 
 
/** Rendered rows when grouping is on (rows of expanded groups only). */ 
const groupedRows = computed<TRow[]>(() => { 
    if (!props.groupBy) return []; 
    const out: TRow[] = []; 
    for (const [key, rows] of groupedMap.value) { 
        if (isGroupExpanded(key)) out.push(...rows); 
    } 
    return out; 
}); 
 
/** Interleaved render items for the body when grouping. `ri` on row 
 *  items is the index into `visibleData` (i.e. `groupedRows`). */ 
interface GroupRenderItem { 
    kind: 'header' | 'row'; 
    /** Header-only fields. */ 
    value?: string | number; 
    rows?: TRow[]; 
    count?: number; 
    expanded?: boolean; 
    aggregations?: Record<string, unknown>; 
    /** Row-only fields. */ 
    row?: TRow; 
    ri?: number; 
} 
const groupedItems = computed<GroupRenderItem[]>(() => { 
    if (!props.groupBy) return []; 
    const items: GroupRenderItem[] = []; 
    let ri = 0; 
    for (const [key, rows] of groupedMap.value) { 
        const expanded = isGroupExpanded(key); 
        items.push({ 
            kind: 'header', 
            value: key, 
            rows, 
            count: rows.length, 
            expanded, 
            aggregations: aggregationsFor(rows), 
        }); 
        if (expanded) { 
            for (const row of rows) { 
                items.push({ kind: 'row', row, ri }); 
                ri++; 
            } 
        } 
    } 
    return items; 
}); 
 
/** Unified body items so the template has a single iteration. When 
 *  grouping is on, this is `groupedItems`. Otherwise it wraps the 
 *  (possibly virtualized) `renderedRows` in `{ kind: 'row' }` objects. */ 
const bodyItems = computed<GroupRenderItem[]>(() => { 
    if (props.groupBy) return groupedItems.value; 
    return renderedRows.value.map(({ row, ri }) => ({ kind: 'row', row, ri })); 
}); 
 
/* ---------------- Virtualization (Phase 3c) ---------------- 
 * The scroll viewport is the inner wrapper element. We bind a template 
 * ref so `useTableVirtual` can attach scroll/resize listeners and 
 * derive the visible window. Virtualization activates when: 
 *   - `virtual` prop is true, 
 *   - the dataset is non-empty, 
 *   - and `expandable` is OFF (variable row heights would break math). 
 * 
 * `defaultRowHeight` mirrors the Tailwind sizes used by `rowHeightClass` 
 * so the unscrolled and virtualized renders produce identical row 
 * geometry without the host having to specify a number. 
 */ 
const viewportEl = ref<HTMLElement | null>(null); 
 
const defaultRowHeight = computed<number>(() => { 
    // Self-contained mirror of `rowHeightClass` so we don't depend on 
    // `effectiveDensity` (declared later in the file). 
    const d: 'comfortable' | 'compact' | 'spacious' = 
        props.density && props.density !== 'comfortable' 
            ? props.density 
            : props.dense 
                ? 'compact' 
                : (props.density ?? 'comfortable'); 
    if (d === 'compact') return 32; // h-8 
    if (d === 'spacious') { 
        switch (resolvedSize.value) { 
            case 'small': return 48; // h-12 
            case 'large': return 64; // h-16 
            default: return 56;      // h-14 
        } 
    } 
    switch (resolvedSize.value) { 
        case 'small': return 36; // h-9 
        case 'large': return 56; // h-14 
        default: return 48;      // h-12 
    } 
}); 
 
const isVirtualEnabled = computed( 
    () => !!props.virtual && !effectiveExpandable.value && !props.loading && !props.groupBy, 
); 
 
const virtualApi = useTableVirtual({ 
    total: () => visibleData.value.length, 
    rowHeight: () => props.rowHeight ?? defaultRowHeight.value, 
    overscan: () => props.overscan ?? 5, 
    enabled: () => isVirtualEnabled.value, 
    viewport: viewportEl, 
}); 
 
/** Final array of rows actually mounted in `<tbody>`. Each entry pairs 
 *  the row with its index in `visibleData` so downstream logic 
 *  (selection, expansion, keyboard, aria) keeps using the *real* 
 *  index regardless of how the window has shifted. */ 
const renderedRows = computed<Array<{ row: TRow; ri: number }>>(() => { 
    if (!virtualApi.isActive.value) { 
        return visibleData.value.map((row, ri) => ({ row, ri })); 
    } 
    const start = virtualApi.startIndex.value; 
    const end = virtualApi.endIndex.value; 
    const out: Array<{ row: TRow; ri: number }> = []; 
    for (let i = start; i < end; i++) { 
        const row = visibleData.value[i]; 
        if (row !== undefined) out.push({ row, ri: i }); 
    } 
    return out; 
}); 
 
/* ---------------- Expansion ---------------- 
 * Controlled state via `v-model:expanded` (array of row keys). Internal 
 * fallback when uncontrolled. Membership uses the same `rowKey` resolver 
 * as selection so the two stay aligned semantically. 
 */ 
const internalExpanded = ref<TableExpansionState>([]); 
const expandedKeys = computed<TableExpansionState>(() => 
    props.expanded ?? internalExpanded.value, 
); 
const expandedSet = computed(() => new Set(expandedKeys.value)); 
 
function commitExpanded(next: TableExpansionState) { 
    internalExpanded.value = next; 
    emit('update:expanded', next); 
} 
function isExpanded(row: TRow, index: number): boolean { 
    return expandedSet.value.has(resolveRowKey(props.rowKey, row, index)); 
} 
function isRowExpandable(row: TRow, index: number): boolean { 
    if (!effectiveExpandable.value) return false; 
    return props.isRowExpandable ? props.isRowExpandable(row, index) : true; 
} 
function toggleExpanded(row: TRow, index: number) { 
    if (!isRowExpandable(row, index)) return; 
    const k = resolveRowKey(props.rowKey, row, index); 
    const cur = expandedKeys.value; 
    if (cur.includes(k)) commitExpanded(cur.filter((x) => x !== k)); 
    else commitExpanded([...cur, k]); 
} 
 
/* ---------------- Selection ---------------- */ 
const selectionApi = useTableSelection<TRow>({ 
    mode: () => props.selectable ?? 'none', 
    rows: visibleData, 
    rowKey: () => props.rowKey, 
    state: () => props.selected ?? props.state?.selected, 
    onUpdate: (next) => emit('update:selected', next), 
    isRowSelectable: props.isRowSelectable, 
}); 
 
/* ---------------- Bulk actions (Phase 5d) ---------------- 
 * Resolves the selected keys back into row objects so the slot can 
 * operate on the data, not just IDs. Looks up the original `data` 
 * (not `visibleData`) so selections survive filtering / pagination. */ 
const selectedRowsResolved = computed<TRow[]>(() => { 
    const keys = selectionApi.selected.value; 
    if (keys.length === 0) return []; 
    const set = new Set(keys); 
    const out: TRow[] = []; 
    const rows = props.data; 
    for (let i = 0; i < rows.length; i++) { 
        const row = rows[i] as TRow; 
        const k = resolveRowKey(props.rowKey, row, i); 
        if (set.has(k)) out.push(row); 
    } 
    return out; 
}); 
 
function handleCellKeydown(e: KeyboardEvent, r: number, c: number) { 
    // While editing, the inline `<input>` owns the keyboard. 
    if (editingCell.value && editingCell.value.row === r) return; 
    // F2 / Enter on a focused editable cell opens the inline editor. 
    if (e.key === 'F2' || (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey)) { 
        const col = cols.value[c]; 
        const row = visibleData.value[r]; 
        if (col && row && isColumnEditable(col, row, r)) { 
            e.preventDefault(); 
            startCellEdit(col, row, r); 
            return; 
        } 
    } 
    const result = kb.onCellKeydown(e, r, c, visibleData.value.length, cols.value.length); 
    if (result?.refocus) { 
        // When virtualization is active and the target row is outside the 
        // currently mounted window, the cell DOM node doesn't exist yet. 
        // Scroll the viewport so the row will be rendered, then focus on 
        // the next tick. 
        if ( 
            virtualApi.isActive.value 
            && viewportEl.value 
            && (result.r < virtualApi.startIndex.value 
                || result.r >= virtualApi.endIndex.value) 
        ) { 
            const rh = props.rowHeight ?? defaultRowHeight.value; 
            const vh = viewportEl.value.clientHeight; 
            viewportEl.value.scrollTop = Math.max( 
                0, 
                result.r * rh - Math.max(0, (vh - rh) / 2), 
            ); 
        } 
        nextTick(() => focusCell(result.r, result.c)); 
    } 
} 
 
/* ---------------- Keyboard nav ---------------- */ 
const cellRefs = new Map<string, HTMLTableCellElement>(); 
function setCellRef(r: number, c: number, el: unknown) { 
    const key = `${r}:${c}`; 
    const dom = (el && typeof el === 'object' && '$el' in (el as any) 
        ? (el as any).$el 
        : el) as HTMLTableCellElement | null; 
    if (dom) cellRefs.set(key, dom); 
    else cellRefs.delete(key); 
} 
function focusCell(r: number, c: number) { 
    const node = cellRefs.get(`${r}:${c}`); 
    if (node) node.focus(); 
} 
 
const kb = useTableKeyboard({ 
    onActivate: (r) => { 
        const row = visibleData.value[r]; 
        if (row !== undefined) emit('row-activate', row, r); 
    }, 
    onToggleSelect: (r) => { 
        const row = visibleData.value[r]; 
        if (row !== undefined) selectionApi.toggle(row, r, { additive: true }); 
    }, 
    onSelectAll: () => { 
        if (props.selectable === 'multi') selectionApi.toggleAll(); 
    }, 
}); 
 
/** Root-level keydown handler. Fires for any descendant of the table 
 *  wrapper, so Ctrl/Cmd+C works even when focus is on the checkbox or 
 *  on the viewport (not just on a body cell). When the user has an 
 *  active text selection (e.g. selected text inside a cell), we let 
 *  the browser's native copy take precedence. */ 
function onRootKeydown(e: KeyboardEvent) { 
    if ( 
        (e.key === 'c' || e.key === 'C') 
        && (e.ctrlKey || e.metaKey) 
        && !e.shiftKey 
        && !e.altKey 
        && selectionApi.selected.value.length > 0 
    ) { 
        const sel = typeof window !== 'undefined' ? window.getSelection?.() : null; 
        const hasNativeSelection = !!sel && !sel.isCollapsed && !!sel.toString(); 
        // Don't hijack copy when the user is editing a cell or focused 
        // in a real input/textarea (search box, filter input, editor). 
        const target = e.target as HTMLElement | null; 
        const inEditable = 
            !!target && 
            (target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable); 
        if (!hasNativeSelection && !inEditable) { 
            e.preventDefault(); 
            void copySelectedAsTsv(); 
        } 
    } 
} 
 
/* ---------------- Live region ---------------- */ 
const liveMessage = ref(''); 
let liveBootstrapped = false; 
watch(sortApi.sort, (next) => { 
    if (!liveBootstrapped) return; 
    if (!next.length) { 
        liveMessage.value = loc.value.table.sortNone; 
        return; 
    } 
    const head = next[0]; 
    if (!head) return; 
    const col = cols.value.find((c) => c.key === head.key); 
    const colName = (col?.header ?? head.key) as string; 
    const dir = head.direction === 'asc' 
        ? loc.value.table.sortAscending 
        : loc.value.table.sortDescending; 
    liveMessage.value = interpolate(loc.value.table.sortedBy, { column: colName, direction: dir }); 
}); 
watch(selectionApi.selected, (next) => { 
    if (!liveBootstrapped) return; 
    liveMessage.value = interpolate(loc.value.table.selectedCount, { count: next.length }); 
}); 
nextTick(() => { liveBootstrapped = true; }); 
 
/* ---------------- Aggregate state snapshot (Phase 10) ---------------- 
 * Composes a serializable view of every user-controlled bit of state 
 * and emits `update:state` whenever any field changes. Hosts can bind 
 * `v-model:state` to persist the whole table to localStorage / URL / 
 * backend in one line. 
 * 
 * The snapshot is JSON-safe (no Date / Map / Set). We re-emit only 
 * when the resulting JSON differs from the previously emitted value 
 * to avoid feedback loops when the host echoes the snapshot back via 
 * the `state` prop. */ 
const stateSnapshot = computed<TableStateSnapshot>(() => ({ 
    sort: sortApi.sort.value, 
    filter: { ...filterApi.filter.value }, 
    pagination: effectivePagination.value 
        ? { ...effectivePagination.value } 
        : undefined, 
    columnsState: columnsStateApi.state.value.map((s) => ({ ...s })), 
    globalSearchTerm: globalSearchTerm.value, 
    selected: [...selectionApi.selected.value], 
    version: 1, 
})); 
let lastEmittedStateJson = ''; 
watch( 
    stateSnapshot, 
    (next) => { 
        const json = JSON.stringify(next); 
        if (json === lastEmittedStateJson) return; 
        lastEmittedStateJson = json; 
        emit('update:state', next); 
    }, 
    { deep: true, immediate: true }, 
); 
 
/* ---------------- Sizing tokens ---------------- */ 
const effectiveDensity = computed<'comfortable' | 'compact' | 'spacious'>(() => { 
    if (props.density && props.density !== 'comfortable') return props.density; 
    if (props.dense) return 'compact'; 
    return props.density ?? 'comfortable'; 
}); 
 
const rowHeightClass = computed(() => { 
    const d = effectiveDensity.value; 
    if (d === 'compact') return 'h-8'; 
    if (d === 'spacious') { 
        switch (resolvedSize.value) { 
            case 'small': return 'h-12'; 
            case 'large': return 'h-16'; 
            default: return 'h-14'; 
        } 
    } 
    switch (resolvedSize.value) { 
        case 'small': return 'h-9'; 
        case 'large': return 'h-14'; 
        default: return 'h-12'; 
    } 
}); 
 
const cellPaddingClass = computed(() => { 
    const d = effectiveDensity.value; 
    if (d === 'compact') return 'px-2 py-1'; 
    if (d === 'spacious') return 'px-4 py-3.5'; 
    switch (resolvedSize.value) { 
        case 'small': return 'px-2.5 py-1.5'; 
        case 'large': return 'px-4 py-3'; 
        default: return 'px-3 py-2'; 
    } 
}); 
 
const cellTextClass = computed(() => { 
    if (effectiveDensity.value === 'compact') return 'text-caption'; 
    if (resolvedSize.value === 'small') return 'text-caption'; 
    if (resolvedSize.value === 'large') return 'text-body-lg'; 
    return 'text-body'; 
}); 
 
const cellBorderClass = computed(() => { 
    switch (props.bordered) { 
        case 'cols': 
        case 'all': 
            return 'border-r border-border last:border-r-0'; 
        default: 
            return ''; 
    } 
}); 
const rowBorderClass = computed(() => { 
    switch (props.bordered) { 
        case 'rows': 
        case 'all': 
            return 'border-b border-border last:border-b-0'; 
        default: 
            return ''; 
    } 
}); 
 
const radiusClass = computed(() => { 
    switch (radius.value) { 
        case 'none': return 'rounded-none'; 
        case 'small': return 'rounded-sm'; 
        case 'large': return 'rounded-xl'; 
        case 'full': return 'rounded-2xl'; 
        default: return 'rounded-lg'; 
    } 
}); 
 
/* ---------------- Cell helpers ---------------- */ 
function defaultFormat(value: unknown, type: string): string { 
    if (value === null || value === undefined || value === '') return '—'; 
    if (type === 'date' && (value instanceof Date || typeof value === 'string')) { 
        const d = value instanceof Date ? value : new Date(value as string); 
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString(); 
    } 
    if (type === 'boolean') return value ? '✓' : '—'; 
    if (Array.isArray(value)) return value.join(', '); 
    return String(value); 
} 
 
const headerCellClass = computed(() => [ 
    'font-medium text-muted-foreground select-none', 
    cellPaddingClass.value, 
    cellTextClass.value, 
    cellBorderClass.value, 
]); 
 
const bodyCellClass = computed(() => [ 
    'text-foreground align-middle outline-none', 
    cellPaddingClass.value, 
    cellTextClass.value, 
    cellBorderClass.value, 
    props.overflow === 'truncate' ? 'truncate max-w-0' : '', 
]); 
 
const stripedClass = computed(() => (props.striped ? 'odd:bg-muted/40' : '')); 
const hoverClass = computed(() => (props.hover ? 'hover:bg-muted/60 transition-colors duration-fast' : '')); 
 
function renderCell( 
    column: any, 
    row: TRow, 
    index: number, 
): VNode | VNode[] | string | number { 
    if (!column) return ''; 
    const value = resolveCellValue(column, row, index); 
    if (typeof column.renderCell === 'function') { 
        return (column.renderCell({ row, value, index }) ?? '') as any; 
    } 
    const slotName = `cell-${column.key}`; 
    const parentSlot = slots[slotName]; 
    if (typeof parentSlot === 'function') { 
        return (parentSlot({ row, value, index }) ?? '') as any; 
    } 
    return defaultFormat(value, column.type); 
} 
 
function renderHeader(column: any): VNode | VNode[] | string { 
    if (!column) return ''; 
    if (typeof column.renderHeader === 'function') { 
        return (column.renderHeader() ?? '') as any; 
    } 
    const slotName = `header-${column.key}`; 
    const parentSlot = slots[slotName]; 
    if (typeof parentSlot === 'function') { 
        return (parentSlot({ column }) ?? '') as any; 
    } 
    return column.header ?? column.key; 
} 
 
const loadingRowsArr = computed(() => 
    Array.from({ length: Math.max(1, props.loadingRows) }, (_, i) => i), 
); 
 
function skeletonAlignClass(align: string): string { 
    if (align === 'right') return 'justify-end'; 
    if (align === 'center') return 'justify-center'; 
    return 'justify-start'; 
} 
 
function CellContent(c: any, row: TRow, index: number): VNode { 
    const cls = [ 
        alignTextClass(c.align), 
        // When overflow=truncate, the inner text node owns the ellipsis; 
        // `min-w-0` lets the flex parent shrink below content size. 
        props.overflow === 'truncate' ? 'truncate min-w-0' : '', 
    ].filter(Boolean).join(' '); 
    return h('span', { class: cls }, [renderCell(c, row, index) as any]); 
} 
 
/** 
 * Compute the `title` attribute for a body cell when `overflow="truncate"`. 
 * 
 * Browsers render a native tooltip for any element with a `title`, 
 * which is ideal here: it appears only when the user hovers, costs 
 * nothing at render time, and reveals the full text when the cell is 
 * visually clipped. We skip it when: 
 *   - overflow !== 'truncate' (no clipping → no need), 
 *   - the column has a custom `renderCell` or a `#cell-{key}` slot 
 *     (the host owns the rendering — they can set their own title), 
 *   - the column opts out via `truncateTooltip: false`. 
 * 
 * `truncateTooltip` may also be a function for custom strings (e.g. 
 * formatted dates with timezone, money with currency). 
 */ 
function cellTitle(c: any, row: TRow, index: number): string | undefined { 
    if (props.overflow !== 'truncate') return undefined; 
    if (c.truncateTooltip === false) return undefined; 
    const value = resolveCellValue(c, row, index); 
    if (typeof c.truncateTooltip === 'function') { 
        const out = c.truncateTooltip(row, value, index); 
        return out ? String(out) : undefined; 
    } 
    if (typeof c.renderCell === 'function') return undefined; 
    if (typeof slots[`cell-${c.key}`] === 'function') return undefined; 
    const text = defaultFormat(value, c.type); 
    return text || undefined; 
} 
 
function alignTextClass(align: string): string { 
    if (align === 'right') return 'block text-right'; 
    if (align === 'center') return 'block text-center'; 
    return 'block text-left'; 
} 
 
/* ---------------- Editable cells (Phase 4a) ---------------- 
 * Only one cell can be in edit mode at a time. The editor is a plain 
 * `<input>` that fills the cell so column widths don't jitter when 
 * entering / leaving edit mode. The host owns the data — we only emit 
 * `cell-edit` on a valid commit and let the parent persist. 
 */ 
const editingCell = ref<{ row: number; col: string } | null>(null); 
const editDraft = ref<string>(''); 
const editError = ref<string | null>(null); 
 
function isColumnEditable(c: any, row: TRow, index: number): boolean { 
    if (!c) return false; 
    if (typeof c.editable === 'function') return !!c.editable(row, index); 
    return !!c.editable; 
} 
 
function isCellEditing(c: any, ri: number): boolean { 
    return ( 
        editingCell.value !== null 
        && editingCell.value.row === ri 
        && editingCell.value.col === c.key 
    ); 
} 
 
function resolveEditType(c: any): 'text' | 'number' { 
    if (c.editType) return c.editType; 
    return c.type === 'number' ? 'number' : 'text'; 
} 
 
/** Enter edit mode for `(ri, c)`. No-op if already editing or not editable. */ 
function startCellEdit(c: any, row: TRow, ri: number) { 
    if (props.loading) return; 
    if (!isColumnEditable(c, row, ri)) return; 
    if ( 
        editingCell.value 
        && (editingCell.value.row !== ri || editingCell.value.col !== c.key) 
    ) { 
        // Commit any other open editor before opening a new one. 
        commitCellEdit(); 
    } 
    const value = resolveCellValue(c, row, ri); 
    editDraft.value = value == null ? '' : String(value); 
    editError.value = null; 
    editingCell.value = { row: ri, col: c.key }; 
    nextTick(() => { 
        const input = editorInputs.get(`${ri}:${c.key}`); 
        if (input) { 
            input.focus(); 
            input.select(); 
        } 
    }); 
} 
 
/** Validate + emit `cell-edit` and exit edit mode. Returns whether 
 *  the commit succeeded (false → editor stays open with the error). */ 
function commitCellEdit(): boolean { 
    const target = editingCell.value; 
    if (!target) return true; 
    const c = cols.value.find((x) => x.key === target.col); 
    if (!c) { 
        editingCell.value = null; 
        return true; 
    } 
    const row = visibleData.value[target.row]; 
    if (row === undefined) { 
        editingCell.value = null; 
        return true; 
    } 
    const editType = resolveEditType(c); 
    const raw = editDraft.value; 
    const parsed: string | number = editType === 'number' ? Number(raw) : raw; 
    if (editType === 'number' && raw !== '' && Number.isNaN(parsed as number)) { 
        editError.value = loc.value.table.edit.invalid; 
        return false; 
    } 
    if (typeof c.editValidator === 'function') { 
        const err = c.editValidator(parsed, row, target.row); 
        if (err) { 
            editError.value = err; 
            return false; 
        } 
    } 
    const oldValue = resolveCellValue(c, row, target.row); 
    if (oldValue !== parsed) { 
        emit('cell-edit', { 
            key: c.key, 
            row, 
            index: target.row, 
            oldValue, 
            newValue: parsed, 
        }); 
    } 
    editingCell.value = null; 
    editError.value = null; 
    return true; 
} 
 
/** Discard the draft and exit edit mode, emitting `cell-edit-cancel`. */ 
function cancelCellEdit() { 
    const target = editingCell.value; 
    if (!target) return; 
    const c = cols.value.find((x) => x.key === target.col); 
    const row = visibleData.value[target.row]; 
    if (c && row !== undefined) { 
        emit('cell-edit-cancel', { key: c.key, row, index: target.row }); 
    } 
    editingCell.value = null; 
    editError.value = null; 
} 
 
/** Handle keyboard inside the inline editor. */ 
function onEditorKeydown(e: KeyboardEvent, ri: number, ci: number) { 
    // Stop the cell-level handler (arrow nav, etc.) from running while the 
    // user is typing — caret motion belongs to the input. 
    e.stopPropagation(); 
    if (e.key === 'Enter') { 
        e.preventDefault(); 
        if (commitCellEdit()) { 
            nextTick(() => focusCell(ri, ci)); 
        } 
        return; 
    } 
    if (e.key === 'Escape') { 
        e.preventDefault(); 
        cancelCellEdit(); 
        nextTick(() => focusCell(ri, ci)); 
        return; 
    } 
    if (e.key === 'Tab') { 
        // Commit, then move to the next/previous editable cell on the same 
        // row. If none exists, fall through to native Tab behavior. 
        const dir = e.shiftKey ? -1 : 1; 
        if (!commitCellEdit()) { 
            e.preventDefault(); 
            return; 
        } 
        const next = findNextEditable(ri, ci, dir); 
        if (next) { 
            e.preventDefault(); 
            const row = visibleData.value[next.r]; 
            if (row) { 
                nextTick(() => startCellEdit(cols.value[next.c], row, next.r)); 
            } 
        } 
    } 
} 
 
function findNextEditable( 
    r: number, 
    c: number, 
    dir: 1 | -1, 
): { r: number; c: number } | null { 
    let ci = c + dir; 
    while (ci >= 0 && ci < cols.value.length) { 
        const col = cols.value[ci]; 
        const row = visibleData.value[r]; 
        if (col && row && isColumnEditable(col, row, r)) return { r, c: ci }; 
        ci += dir; 
    } 
    return null; 
} 
 
/** Map of `${ri}:${key}` → `<input>` element so we can autofocus on open. */ 
const editorInputs = new Map<string, HTMLInputElement>(); 
function setEditorRef(ri: number, key: string, el: any) { 
    const id = `${ri}:${key}`; 
    if (el) editorInputs.set(id, el as HTMLInputElement); 
    else editorInputs.delete(id); 
} 
 
/** Body-cell dblclick: open editor for editable columns and swallow the 
 *  event so the row-level `row-activate` doesn't fire for inline edits. */ 
function onCellDblClick(c: any, row: TRow, ri: number, e: MouseEvent) { 
    if (isColumnEditable(c, row, ri)) { 
        e.stopPropagation(); 
        startCellEdit(c, row, ri); 
    } 
} 
 
/* ---------------- Header click → sort ---------------- */ 
function onHeaderClick(column: any, e: MouseEvent) { 
    if (!column.sortable) return; 
    sortApi.toggle(column.key, e.shiftKey); 
} 
function onHeaderKeydown(column: any, e: KeyboardEvent) { 
    // Alt+Arrow reorders columns when `reorderable` is on. Runs before 
    // sort toggle so a user holding Alt doesn't also flip the sort. 
    if (props.reorderable && column.reorderable !== false && e.altKey) { 
        if (e.key === 'ArrowLeft') { 
            e.preventDefault(); 
            columnsStateApi.moveBy(column.key, -1); 
            announceMove(column); 
            return; 
        } 
        if (e.key === 'ArrowRight') { 
            e.preventDefault(); 
            columnsStateApi.moveBy(column.key, 1); 
            announceMove(column); 
            return; 
        } 
    } 
    if (!column.sortable) return; 
    if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        sortApi.toggle(column.key, e.shiftKey); 
    } 
} 
 
function announceMove(column: any) { 
    const idx = cols.value.findIndex((c) => c.key === column.key); 
    const name = (column.header ?? column.key) as string; 
    liveMessage.value = interpolate(loc.value.table.movedColumn, { 
        column: name, 
        position: idx + 1, 
    }); 
} 
 
/* ---------------- Column resize (pointer-driven) ---------------- 
 * We bind pointerdown to a thin handle on the right edge of each 
 * resizable <th>. On move we update a local preview width so the drag 
 * feels instant, and only commit to state on pointerup. The preview 
 * takes precedence over `effectiveWidth` while active. 
 */ 
const resizeKey = ref<string | null>(null); 
const resizePreview = ref<number | null>(null); 
let resizeStartX = 0; 
let resizeStartWidth = 0; 
 
function previewWidthFor(key: string): number | undefined { 
    if (resizeKey.value === key && resizePreview.value != null) { 
        return resizePreview.value; 
    } 
    return undefined; 
} 
 
function onResizeStart(e: PointerEvent, col: any, thEl: HTMLTableCellElement) { 
    if (!props.resizable || col.resizable === false) return; 
    e.preventDefault(); 
    e.stopPropagation(); 
    (e.target as Element).setPointerCapture?.(e.pointerId); 
    resizeKey.value = col.key; 
    resizeStartX = e.clientX; 
    resizeStartWidth = thEl.getBoundingClientRect().width; 
    resizePreview.value = resizeStartWidth; 
 
    const min = props.minColumnWidth ?? 48; 
 
    function onMove(ev: PointerEvent) { 
        const next = Math.max(min, resizeStartWidth + (ev.clientX - resizeStartX)); 
        resizePreview.value = Math.round(next); 
    } 
    function onEnd() { 
        window.removeEventListener('pointermove', onMove); 
        window.removeEventListener('pointerup', onEnd); 
        window.removeEventListener('pointercancel', onEnd); 
        if (resizeKey.value && resizePreview.value != null) { 
            columnsStateApi.setWidth(resizeKey.value, resizePreview.value); 
        } 
        resizeKey.value = null; 
        resizePreview.value = null; 
    } 
    window.addEventListener('pointermove', onMove); 
    window.addEventListener('pointerup', onEnd); 
    window.addEventListener('pointercancel', onEnd); 
} 
 
/* ---------------- Column reorder (HTML5 drag) ---------------- 
 * Drag fires on the header element itself (draggable=true when 
 * reorderable). We show a vertical drop indicator on the target header's 
 * leading/trailing edge based on the cursor position relative to its 
 * midpoint. 
 */ 
const dragKey = ref<string | null>(null); 
const dropKey = ref<string | null>(null); 
const dropSide = ref<'before' | 'after' | null>(null); 
 
function isReorderable(col: any): boolean { 
    return !!props.reorderable && col.reorderable !== false; 
} 
 
function onHeaderDragStart(e: DragEvent, col: any) { 
    if (!isReorderable(col)) return; 
    dragKey.value = col.key; 
    if (e.dataTransfer) { 
        e.dataTransfer.effectAllowed = 'move'; 
        // Firefox refuses to start a drag without any data set. 
        try { e.dataTransfer.setData('text/plain', col.key); } catch { /* noop */ } 
    } 
} 
function onHeaderDragOver(e: DragEvent, col: any) { 
    if (!dragKey.value || !isReorderable(col)) return; 
    if (dragKey.value === col.key) return; 
    e.preventDefault(); 
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); 
    const isAfter = e.clientX - rect.left > rect.width / 2; 
    dropKey.value = col.key; 
    dropSide.value = isAfter ? 'after' : 'before'; 
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; 
} 
function onHeaderDragLeave(_e: DragEvent, col: any) { 
    if (dropKey.value === col.key) { 
        dropKey.value = null; 
        dropSide.value = null; 
    } 
} 
function onHeaderDrop(e: DragEvent, col: any) { 
    if (!dragKey.value || !isReorderable(col)) return; 
    e.preventDefault(); 
    if (dragKey.value !== col.key && dropSide.value) { 
        columnsStateApi.move(dragKey.value, col.key, dropSide.value); 
        const moved = cols.value.find((c) => c.key === dragKey.value); 
        if (moved) announceMove(moved); 
    } 
    dragKey.value = null; 
    dropKey.value = null; 
    dropSide.value = null; 
} 
function onHeaderDragEnd() { 
    dragKey.value = null; 
    dropKey.value = null; 
    dropSide.value = null; 
} 
 
/* ---------------- Row click ---------------- */ 
function onRowClick(row: TRow, index: number, _e: MouseEvent) { 
    emit('row-click', row, index); 
    if (props.selectable === 'single') { 
        selectionApi.toggle(row, index); 
    } 
} 
 
/* ---------------- Selection cell click ---------------- 
 * We stop propagation here so the row-level click handler doesn't fire 
 * (which would re-toggle in single mode). Modifier keys are forwarded to 
 * the selection composable so shift+click ranges work across rows. 
 */ 
function onSelectionCellClick(row: TRow, index: number, e: MouseEvent) { 
    selectionApi.toggle(row, index, { 
        additive: e.ctrlKey || e.metaKey, 
        range: e.shiftKey, 
    }); 
} 
 
const ariaLabel = computed(() => props.ariaLabel ?? loc.value.table.defaultLabel); 
const emptyText = computed(() => props.emptyText ?? loc.value.table.empty); 
const noResultsText = computed( 
    () => props.noResultsText ?? loc.value.table.noResults, 
); 
 
/** Pick which empty copy to show: `noResults` when filters are active, else `empty`. */ 
const showNoResults = computed( 
    () => 
        (filterApi.hasActiveFilter.value || globalSearchTerm.value.trim() !== '') && 
        sortedData.value.length === 0, 
); 
 
/* ---------- Sticky-first column (Phase 4d) ---------- 
 * Pins the first non-pinned data column to the left edge so it stays 
 * visible while the rest of the table scrolls horizontally. Skipped 
 * when `overflow="truncate"` (no horizontal scroll) or when no data 
 * column is available. The left offset matches the leading system 
 * columns (selection / expansion) so the pin region is contiguous. */ 
const stickyFirstKey = computed<string | null>(() => { 
    if (!props.stickyFirstColumn) return null; 
    if (props.overflow === 'truncate') return null; 
    const first = cols.value.find( 
        (c) => c.pinned !== 'left' && c.pinned !== 'right', 
    ); 
    if (!first) return null; 
    if (pinMap.value[first.key]) return null; 
    return first.key; 
}); 
 
const stickyFirstRootClass = computed(() => { 
    if (!stickyFirstKey.value) return ''; 
    return props.stickyFirstColumn === 'mobile' 
        ? 'modo-sticky-first-mobile' 
        : 'modo-sticky-first'; 
}); 
 
const stickyFirstRootStyle = computed<Record<string, string> | undefined>(() => { 
    if (!stickyFirstKey.value) return undefined; 
    return { 
        '--modo-table-first-sticky-left': 
            leadingColCount.value * LEADING_COL_PX + 'px', 
    }; 
}); 
 
function isFirstStickyCell(c: { key: string }): boolean { 
    return c.key === stickyFirstKey.value; 
} 
</script> 
 
<template> 
    <div 
        :class="[ 
            'relative bg-card border border-border overflow-hidden', 
            radiusClass, 
            stickyFirstRootClass, 
        ]" 
        :style="stickyFirstRootStyle" 
        @keydown="onRootKeydown" 
    > 
        <span aria-hidden="true" class="hidden"><slot /></span> 
 
        <!-- Toolbar (Phase 5a). Surfaces global search by default; the 
             `#toolbar` slot lets consumers replace it entirely (e.g. add 
             column-visibility menu, export, bulk actions). --> 
        <div 
            v-if="showToolbar" 
            class="flex items-center gap-3 px-3 py-2 border-b border-border bg-muted/30" 
        > 
            <slot 
                name="toolbar" 
                :searchTerm="globalSearchTerm" 
                :setSearchTerm="setGlobalSearch" 
                :clearSearch="() => setGlobalSearch('')" 
            > 
                <SearchInput 
                    v-if="hasGlobalSearch" 
                    :model-value="globalSearchTerm" 
                    :placeholder="loc.table.searchPlaceholder" 
                    size="small" 
                    clearable 
                    class="max-w-xs" 
                    full-width 
                    @update:model-value="setGlobalSearch" 
                /> 
                <div v-if="columnVisibility || hasExport" class="ml-auto flex items-center gap-2"> 
                    <div v-if="columnVisibility"> 
                    <Button 
                        ref="colMenuTriggerEl" 
                        variant="outline" 
                        size="small" 
                        radius="medium" 
                        :icon="ChevronDownIcon" 
                        iconPosition="right" 
                        :label="loc.table.columnVisibility" 
                        :aria-expanded="colMenuOpen" 
                        aria-haspopup="dialog" 
                        @click="toggleColMenu" 
                    /> 
                    <PopoverPanel 
                        :open="colMenuOpen" 
                        :style="colMenuPanelStyle" 
                        role="dialog" 
                        @update:panelRef="colMenuPanelRef = $event" 
                    > 
                        <div class="flex flex-col gap-1 py-2 min-w-48 max-h-72 overflow-y-auto"> 
                            <div class="px-3 pb-1 text-caption font-medium text-muted-foreground"> 
                                {{ loc.table.columnVisibility }} 
                            </div> 
                            <label 
                                v-for="c in columns" 
                                :key="c.key" 
                                class="flex items-center gap-2 px-3 py-1.5 text-body cursor-pointer hover:bg-muted rounded" 
                            > 
                                <Checkbox 
                                    :model-value="!isColumnHidden(c.key)" 
                                    size="small" 
                                    :disabled="!isColumnHidden(c.key) && visibleColumnCount <= 1" 
                                    @update:model-value="(v: boolean) => toggleColumnHidden(c.key, !v)" 
                                /> 
                                <span class="truncate">{{ c.header ?? c.key }}</span> 
                            </label> 
                        </div> 
                    </PopoverPanel> 
                </div> 
 
                <div v-if="hasExport"> 
                    <Button 
                        ref="exportMenuTriggerEl" 
                        variant="outline" 
                        size="small" 
                        radius="medium" 
                        :icon="ChevronDownIcon" 
                        iconPosition="right" 
                        :label="loc.table.export" 
                        :aria-expanded="exportMenuOpen" 
                        aria-haspopup="menu" 
                        @click="toggleExportMenu" 
                    /> 
                    <PopoverPanel 
                        :open="exportMenuOpen" 
                        :style="exportMenuPanelStyle" 
                        role="menu" 
                        @update:panelRef="exportMenuPanelRef = $event" 
                    > 
                        <div class="flex flex-col py-1 min-w-48"> 
                            <button 
                                v-if="exportFormats.csv" 
                                type="button" 
                                role="menuitem" 
                                class="text-left px-3 py-2 text-body hover:bg-muted focus-visible:bg-muted focus-visible:outline-none" 
                                @click="exportCsv" 
                            >{{ loc.table.exportCsv }}</button> 
                            <button 
                                v-if="exportFormats.json" 
                                type="button" 
                                role="menuitem" 
                                class="text-left px-3 py-2 text-body hover:bg-muted focus-visible:bg-muted focus-visible:outline-none" 
                                @click="exportJson" 
                            >{{ loc.table.exportJson }}</button> 
                            <button 
                                v-if="exportFormats.clipboard" 
                                type="button" 
                                role="menuitem" 
                                class="text-left px-3 py-2 text-body hover:bg-muted focus-visible:bg-muted focus-visible:outline-none" 
                                @click="exportClipboard" 
                            >{{ loc.table.exportClipboard }}</button> 
                        </div> 
                    </PopoverPanel> 
                </div> 
                </div> 
            </slot> 
        </div> 
 
        <!-- Bulk-actions bar (Phase 5d). Renders when at least one row is 
             selected. The slot receives selected keys + resolved rows + 
             a clear() helper. Default rendering shows just the count + a 
             "Clear" button so the bar is meaningful even without a slot. --> 
        <div 
            v-if="$slots['bulk-actions'] && selectionApi.selected.value.length > 0" 
            class="flex items-center gap-3 px-3 py-2 border-b border-border bg-primary/10" 
            role="region" 
            :aria-label="interpolate(loc.table.selectedCount, { count: selectionApi.selected.value.length })" 
        > 
            <span class="text-body font-medium text-foreground"> 
                {{ interpolate(loc.table.selectedCount, { count: selectionApi.selected.value.length }) }} 
            </span> 
            <div class="flex items-center gap-2 ml-auto"> 
                <slot 
                    name="bulk-actions" 
                    :selected="selectionApi.selected.value" 
                    :rows="selectedRowsResolved" 
                    :count="selectionApi.selected.value.length" 
                    :clear="() => selectionApi.clear()" 
                /> 
            </div> 
        </div> 
 
        <div 
            ref="viewportEl" 
            :class="[ 
                overflow === 'scroll' ? 'overflow-x-auto' : 'overflow-x-hidden', 
                (stickyHeader || virtual) ? 'overflow-y-auto' : '', 
            ]" 
            :style="{ 
                maxHeight: virtual 
                    ? toCssLength(virtualHeight) 
                    : (stickyHeader ? '60vh' : undefined), 
            }" 
            :tabindex="overflow === 'scroll' ? 0 : -1" 
            role="region" 
            :aria-label="ariaLabel" 
        > 
            <table 
                role="table" 
                :aria-label="ariaLabel" 
                :aria-busy="loading || undefined" 
                :aria-rowcount="loading ? -1 : sortedData.length" 
                :aria-colcount="colCount" 
                :class="[ 
                    'w-full border-collapse', 
                    overflow === 'truncate' ? 'table-fixed' : 'table-auto', 
                ]" 
            > 
                <caption v-if="$slots.caption" class="sr-only"> 
                    <slot name="caption" /> 
                </caption> 
 
                <thead 
                    :class="[ 
                        'bg-muted', 
                        (stickyHeader || virtual) ? 'sticky top-0 z-10 shadow-xs' : '', 
                    ]" 
                > 
                    <tr> 
                        <!-- Expansion column header (empty, just a spacer). --> 
                        <th 
                            v-if="effectiveExpandable" 
                            scope="col" 
                            :class="[headerCellClass, 'w-10', hasLeftPinned ? 'bg-muted' : '']" 
                            :style="pinLeadingStyle(0, true)" 
                            :aria-colindex="1" 
                        > 
                            <span class="sr-only">{{ loc.table.expandRow }}</span> 
                        </th> 
 
                        <!-- Selection column header. --> 
                        <th 
                            v-if="selectable !== 'none'" 
                            scope="col" 
                            :class="[headerCellClass, 'w-10', hasLeftPinned ? 'bg-muted' : '']" 
                            :style="pinLeadingStyle(effectiveExpandable ? 1 : 0, true)" 
                            :aria-colindex="effectiveExpandable ? 2 : 1" 
                        > 
                            <span class="flex justify-center"> 
                                <Checkbox 
                                    v-if="selectable === 'multi'" 
                                    :model-value="selectionApi.headerState.value === 'all'" 
                                    :indeterminate="selectionApi.headerState.value === 'indeterminate'" 
                                    :disabled="loading || data.length === 0" 
                                    :aria-label="loc.table.selectAllRows" 
                                    size="small" 
                                    @update:model-value="selectionApi.toggleAll()" 
                                /> 
                                <span v-else class="sr-only">{{ loc.table.selectRow }}</span> 
                            </span> 
                        </th> 
 
                        <th 
                            v-for="(c, ci) in cols" 
                            :key="c.key" 
                            scope="col" 
                            :class="[ 
                                headerCellClass, 
                                c.headerClass, 
                                'relative', 
                                pinMap[c.key] ? 'bg-muted' : '', 
                                isFirstStickyCell(c) ? 'modo-sticky-first-cell modo-sticky-first-th' : '', 
                                c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left', 
                                c.sortable ? 'cursor-pointer hover:bg-muted/40 transition-colors duration-fast' : '', 
                                isReorderable(c) ? 'cursor-grab active:cursor-grabbing' : '', 
                                dragKey === c.key ? 'opacity-40' : '', 
                                dropKey === c.key && dropSide === 'before' ? 'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary before:z-10' : '', 
                                dropKey === c.key && dropSide === 'after' ? 'after:absolute after:inset-y-0 after:right-0 after:w-0.5 after:bg-primary after:z-10' : '', 
                            ]" 
                            :style="{ 
                                width: toCssLength(previewWidthFor(c.key) ?? c.effectiveWidth ?? c.width), 
                                minWidth: toCssLength(c.minWidth), 
                                ...(pinHeaderStyle(c) ?? {}), 
                            }" 
                            :aria-colindex="ci + 1 + leadingColCount" 
                            :aria-sort="sortApi.ariaSortFor(c)" 
                            :tabindex="(c.sortable || isReorderable(c)) ? 0 : undefined" 
                            :role="c.sortable ? 'button' : undefined" 
                            :draggable="isReorderable(c) ? true : undefined" 
                            @click="(e: MouseEvent) => onHeaderClick(c, e)"
                            @keydown="(e: KeyboardEvent) => onHeaderKeydown(c, e)"
                            @dragstart="(e: DragEvent) => onHeaderDragStart(e, c)"
                            @dragover="(e: DragEvent) => onHeaderDragOver(e, c)"
                            @dragleave="(e: DragEvent) => onHeaderDragLeave(e, c)"
                            @drop="(e: DragEvent) => onHeaderDrop(e, c)"
                            @dragend="onHeaderDragEnd" 
                        > 
                            <span 
                                :class="[ 
                                    'inline-flex items-center gap-1.5', 
                                    c.align === 'right' ? 'flex-row-reverse' : '', 
                                ]" 
                            > 
                                <Tooltip 
                                    v-if="c.description" 
                                    :content="c.description" 
                                    placement="top" 
                                    size="small" 
                                > 
                                    <component :is="{ render: () => renderHeader(c) }" /> 
                                </Tooltip> 
                                <component v-else :is="{ render: () => renderHeader(c) }" /> 
 
                                <!-- Sort indicator + multi-priority badge. --> 
                                <template v-if="c.sortable"> 
                                    <span 
                                        aria-hidden="true" 
                                        class="inline-flex items-center text-muted-foreground" 
                                    > 
                                        <ChevronUpIcon 
                                            v-if="sortApi.directionFor(c.key) === 'asc'" 
                                            class="w-3.5 h-3.5" 
                                        /> 
                                        <ChevronDownIcon 
                                            v-else-if="sortApi.directionFor(c.key) === 'desc'" 
                                            class="w-3.5 h-3.5" 
                                        /> 
                                        <ChevronUpDownIcon 
                                            v-else 
                                            class="w-3.5 h-3.5 opacity-40" 
                                        /> 
                                    </span> 
                                    <span 
                                        v-if="multiSort && sortApi.sort.value.length > 1 && sortApi.priorityFor(c.key)" 
                                        class="text-caption font-mono text-muted-foreground" 
                                        aria-hidden="true" 
                                    >{{ sortApi.priorityFor(c.key) }}</span> 
                                </template> 
                            </span> 
 
                            <!-- Resize handle: thin, right-edge, pointer-driven. 
                                 Stops click/keydown propagation so dragging 
                                 the handle never toggles sort or triggers 
                                 reorder drag. --> 
                            <span 
                                v-if="resizable && c.resizable !== false" 
                                class="modo-table-resize-handle absolute top-0 right-0 h-full w-1.5 cursor-col-resize select-none touch-none z-20 hover:bg-primary/40 transition-colors duration-fast" 
                                :class="resizeKey === c.key ? 'bg-primary/60' : ''" 
                                role="separator" 
                                :aria-label="loc.table.resizeColumn" 
                                aria-orientation="vertical" 
                                draggable="false" 
                                @pointerdown="(e: PointerEvent) => onResizeStart(e, c, (e.currentTarget as HTMLElement).parentElement as HTMLTableCellElement)" 
                                @click.stop 
                                @dragstart.stop.prevent 
                            /> 
                        </th> 
                    </tr> 
 
                    <!-- Filter row — one input per filterable column. 
                         Rendered as a second row inside <thead> so it sticks 
                         together with the headers under `stickyHeader`. --> 
                    <tr v-if="hasFilterRow" class="bg-muted"> 
                        <th v-if="effectiveExpandable" :class="[headerCellClass, 'w-10', hasLeftPinned ? 'bg-muted' : '']" :style="pinLeadingStyle(0, true)" /> 
                        <th v-if="selectable !== 'none'" :class="[headerCellClass, 'w-10', hasLeftPinned ? 'bg-muted' : '']" :style="pinLeadingStyle(effectiveExpandable ? 1 : 0, true)" /> 
                        <th 
                            v-for="c in cols" 
                            :key="`f-${c.key}`" 
                            :class="[headerCellClass, 'py-1.5', pinMap[c.key] ? 'bg-muted' : '', isFirstStickyCell(c) ? 'modo-sticky-first-cell modo-sticky-first-th' : '']" 
                            :style="pinHeaderStyle(c)" 
                        > 
                            <slot 
                                :name="`filter-${c.key}`" 
                                :column="c" 
                                :value="filterApi.filter.value[c.key] ?? ''" 
                                :set-value="(v: string) => filterApi.setFilter(c.key, v)" 
                                :clear="() => filterApi.clearFilter(c.key)" 
                            > 
                                <Input 
                                    v-if="c.filterable !== false" 
                                    :model-value="filterApi.filter.value[c.key] ?? ''" 
                                    :placeholder="loc.table.filterPlaceholder" 
                                    :clearable="true" 
                                    size="small" 
                                    full-width 
                                    :aria-label="`${c.header ?? c.key} filter`" 
                                    @update:model-value="(v: string) => filterApi.setFilter(c.key, v)" 
                                /> 
                            </slot> 
                        </th> 
                    </tr> 
                </thead> 
 
                <!-- Loading body. Only when `loadingMode === 'skeleton'` 
                     (default). Overlay mode keeps the real data visible. --> 
                <tbody v-if="loading && loadingMode === 'skeleton'"> 
                    <tr 
                        v-for="i in loadingRowsArr" 
                        :key="`sk-${i}`" 
                        :class="[rowHeightClass, rowBorderClass]" 
                    > 
                        <td v-if="effectiveExpandable" :class="[bodyCellClass, 'w-10', hasLeftPinned ? 'bg-card' : '']" :style="pinLeadingStyle(0)" /> 
                        <td v-if="selectable !== 'none'" :class="[bodyCellClass, 'w-10', hasLeftPinned ? 'bg-card' : '']" :style="pinLeadingStyle(effectiveExpandable ? 1 : 0)"> 
                            <span class="flex justify-center"> 
                                <Skeleton shape="checkbox" size="small" /> 
                            </span> 
                        </td> 
                        <td 
                            v-for="c in cols" 
                            :key="c.key" 
                            :class="[bodyCellClass, c.cellClass, pinMap[c.key] ? 'bg-card' : '', isFirstStickyCell(c) ? 'modo-sticky-first-cell' : '']" 
                            :style="pinStyle(c)" 
                        > 
                            <span :class="['flex w-full', skeletonAlignClass(c.align)]"> 
                                <Skeleton 
                                    :shape="c.skeletonShape ?? 'text'" 
                                    :size="size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium'" 
                                    :width="(c.skeletonShape === 'avatar' || c.skeletonShape === 'circle') ? undefined : '70%'" 
                                /> 
                            </span> 
                        </td> 
                    </tr> 
                    <tr class="sr-only" aria-live="polite"> 
                        <td :colspan="colCount">{{ loc.table.loading }}</td> 
                    </tr> 
                </tbody> 
 
                <!-- Empty body. Distinguishes "no data at all" vs "filters 
                     produced zero rows" — the latter offers a Clear filters 
                     affordance so users aren't stuck on a dead end. --> 
                <tbody v-else-if="sortedData.length === 0"> 
                    <tr> 
                        <td :colspan="colCount" class="text-center text-muted-foreground py-10"> 
                            <slot 
                                v-if="showNoResults" 
                                name="noResults" 
                                :clear="() => { filterApi.clearAll(); setGlobalSearch(''); }" 
                                :message="noResultsText" 
                            > 
                                <div class="flex flex-col items-center gap-2"> 
                                    <span class="text-body-lg text-foreground">{{ noResultsText }}</span> 
                                    <button 
                                        type="button" 
                                        class="text-caption text-primary underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none" 
                                        @click="filterApi.clearAll(); setGlobalSearch('');" 
                                    > 
                                        {{ loc.table.clearFilter }} 
                                    </button> 
                                </div> 
                            </slot> 
                            <slot v-else name="empty" :message="emptyText"> 
                                <span class="text-body">{{ emptyText }}</span> 
                            </slot> 
                        </td> 
                    </tr> 
                </tbody> 
 
                <!-- Real data body. --> 
                <tbody v-else> 
                    <tr 
                        v-if="virtualApi.isActive.value && virtualApi.topSpacer.value > 0" 
                        aria-hidden="true" 
                    > 
                        <td 
                            :colspan="colCount" 
                            :style="{ 
                                height: virtualApi.topSpacer.value + 'px', 
                                padding: 0, 
                                border: 0, 
                            }" 
                        /> 
                    </tr> 
                    <template 
                        v-for="item in bodyItems" 
                        :key="item.kind === 'header' ? `g-${item.value}` : resolveRowKey(rowKey, item.row!, item.ri!)" 
                    > 
                        <!-- Group header row (Phase 4c-group). --> 
                        <tr 
                            v-if="item.kind === 'header'" 
                            class="bg-muted/40 border-y border-border" 
                        > 
                            <td 
                                :colspan="colCount" 
                                class="px-3 py-2" 
                            > 
                                <slot 
                                    name="group-header" 
                                    :value="item.value!" 
                                    :rows="item.rows!" 
                                    :count="item.count!" 
                                    :expanded="item.expanded!" 
                                    :aggregations="item.aggregations!" 
                                    :toggle="() => toggleGroup(item.value!)" 
                                > 
                                    <button 
                                        type="button" 
                                        class="inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs" 
                                        :aria-expanded="item.expanded ? 'true' : 'false'" 
                                        @click="toggleGroup(item.value!)" 
                                    > 
                                        <ChevronRightIcon 
                                            :class="[ 
                                                'w-4 h-4 transition-transform duration-base ease-standard', 
                                                item.expanded ? 'rotate-90' : '', 
                                            ]" 
                                            aria-hidden="true" 
                                        /> 
                                        <span class="font-medium text-foreground">{{ item.value }}</span> 
                                        <span class="text-muted-foreground text-caption">· {{ item.count }}</span> 
                                        <template 
                                            v-for="(c, idx) in cols.filter((col: unknown) => (col as any).aggregate)" 
                                            :key="`agg-${c.key}`" 
                                        > 
                                            <span class="text-caption text-muted-foreground"> 
                                                {{ idx === 0 ? '·' : '·' }} 
                                                <span class="font-medium">{{ c.header ?? c.key }}:</span> 
                                                {{ defaultFormat(item.aggregations?.[c.key], c.type) }} 
                                            </span> 
                                        </template> 
                                    </button> 
                                </slot> 
                            </td> 
                        </tr> 
                        <!-- Real data row. --> 
                        <template v-else> 
                            <template v-for="row in [item.row!]" :key="`row-${item.ri}`"> 
                            <template v-for="ri in [item.ri!]" :key="`ri-${ri}`"> 
                            <tr 
                            :class="[ 
                                rowHeightClass, 
                                rowBorderClass, 
                                stripedClass, 
                                hoverClass, 
                                selectionApi.isSelected(row, ri) ? 'bg-primary/5' : '', 
                            ]" 
                            :aria-rowindex="ri + 2" 
                            :aria-selected="selectable !== 'none' ? selectionApi.isSelected(row, ri) : undefined" 
                            :aria-level="tree && treeMeta(ri) ? (treeMeta(ri)!.depth + 1) : undefined" 
                            :aria-setsize="tree && treeMeta(ri) ? treeMeta(ri)!.setSize : undefined" 
                            :aria-posinset="tree && treeMeta(ri) ? treeMeta(ri)!.posInSet : undefined" 
                            :aria-expanded="tree && treeMeta(ri)?.hasChildren ? (treeMeta(ri)!.expanded ? 'true' : 'false') : undefined" 
                            @click="(e: MouseEvent) => onRowClick(row, ri, e)" 
                            @dblclick="emit('row-activate', row, ri)" 
                        > 
                            <!-- Expansion toggle cell. --> 
                            <td 
                                v-if="effectiveExpandable" 
                                :class="[bodyCellClass, 'w-10', hasLeftPinned ? 'bg-card' : '']" 
                                :style="pinLeadingStyle(0)" 
                                @click.stop 
                            > 
                                <button 
                                    v-if="isRowExpandable(row, ri)" 
                                    type="button" 
                                    class="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-fast" 
                                    :aria-expanded="isExpanded(row, ri)" 
                                    :aria-label="isExpanded(row, ri) ? loc.table.collapseRow : loc.table.expandRow" 
                                    tabindex="-1" 
                                    @click="toggleExpanded(row, ri)" 
                                > 
                                    <ChevronRightIcon 
                                        :class="[ 
                                            'w-4 h-4 transition-transform duration-base ease-standard', 
                                            isExpanded(row, ri) ? 'rotate-90' : '', 
                                        ]" 
                                        aria-hidden="true" 
                                    /> 
                                </button> 
                            </td> 
 
                            <td 
                                v-if="selectable !== 'none'" 
                                :class="[bodyCellClass, 'w-10', hasLeftPinned ? 'bg-card' : '']" 
                                :style="pinLeadingStyle(effectiveExpandable ? 1 : 0)" 
                                @click.stop 
                            > 
                                <span 
                                    class="flex justify-center" 
                                    @click.stop="(e: MouseEvent) => { e.preventDefault(); onSelectionCellClick(row, ri, e); }" 
                                > 
                                    <Checkbox 
                                        :model-value="selectionApi.isSelected(row, ri)" 
                                        :disabled="!selectionApi.isSelectable(row, ri)" 
                                        :aria-label="loc.table.selectRow" 
                                        size="small" 
                                        tabindex="-1" 
                                    /> 
                                </span> 
                            </td> 
 
                            <td 
                                v-for="(c, ci) in cols" 
                                :key="c.key" 
                                :ref="(el: unknown) => setCellRef(ri, ci, el as HTMLElement | null)" 
                                :class="[ 
                                    bodyCellClass, 
                                    c.cellClass, 
                                    pinMap[c.key] ? 'bg-card' : '', 
                                    isFirstStickyCell(c) ? 'modo-sticky-first-cell' : '', 
                                    isColumnEditable(c, row, ri) ? 'cursor-text' : '',
                                    'outline-none',
                                    kb.isFocused(ri, ci) ? 'ring-2 ring-ring ring-inset relative z-[1]' : '',
                                ]"
                                :aria-colindex="ci + 1 + leadingColCount" 
                                :tabindex="kb.isFocused(ri, ci) ? 0 : -1" 
                                :title="cellTitle(c, row, ri)" 
                                :style="{ 
                                    width: toCssLength(previewWidthFor(c.key) ?? c.effectiveWidth ?? c.width), 
                                    minWidth: toCssLength(c.minWidth), 
                                    ...(pinStyle(c) ?? {}), 
                                }" 
                                @focus="kb.onCellFocus(ri, ci)"
                                @keydown="(e: KeyboardEvent) => handleCellKeydown(e, ri, ci)"
                                @dblclick="(e: MouseEvent) => onCellDblClick(c, row, ri, e)"
                            > 
                                <input 
                                    v-if="isCellEditing(c, ri)" 
                                    :ref="(el: unknown) => setEditorRef(ri, c.key, el as HTMLInputElement | null)" 
                                    :value="editDraft" 
                                    :type="resolveEditType(c)" 
                                    :aria-label="loc.table.edit.editCell" 
                                    :aria-invalid="editError ? 'true' : undefined" 
                                    :class="[ 
                                        'block w-full bg-transparent outline-none text-foreground', 
                                        cellTextClass, 
                                        alignTextClass(c.align), 
                                        editError ? 'ring-2 ring-destructive ring-inset rounded-xs' : '', 
                                    ]" 
                                    @input="(e: Event) => (editDraft = (e.target as HTMLInputElement).value)"
                                    @keydown="(e: KeyboardEvent) => onEditorKeydown(e, ri, ci)"
                                    @blur="commitCellEdit" 
                                /> 
                                <span v-else :class="['inline-flex items-center gap-1 w-full', overflow === 'truncate' ? 'min-w-0' : '']"> 
                                    <!-- Tree indent + chevron, rendered only on the 
                                         first data column of each tree row. --> 
                                    <template v-if="tree && ci === 0 && treeMeta(ri)"> 
                                        <span 
                                            aria-hidden="true" 
                                            :style="{ width: ((treeMeta(ri)?.depth ?? 0) * 1.25) + 'rem', flex: '0 0 auto' }" 
                                        /> 
                                        <button 
                                            v-if="treeMeta(ri)?.hasChildren" 
                                            type="button" 
                                            class="inline-flex items-center justify-center w-5 h-5 rounded-md hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-fast shrink-0" 
                                            :aria-expanded="treeMeta(ri)?.expanded ? 'true' : 'false'" 
                                            :aria-label="treeMeta(ri)?.expanded ? loc.table.collapseRow : loc.table.expandRow" 
                                            tabindex="-1" 
                                            @click.stop="toggleTreeRow(row, ri)" 
                                        > 
                                            <Loader 
                                                v-if="treeMeta(ri)?.isLoading" 
                                                size="small" 
                                                aria-hidden="true" 
                                            /> 
                                            <ChevronRightIcon 
                                                v-else 
                                                :class="[ 
                                                    'w-4 h-4 transition-transform duration-base ease-standard', 
                                                    treeMeta(ri)?.expanded ? 'rotate-90' : '', 
                                                ]" 
                                                aria-hidden="true" 
                                            /> 
                                        </button> 
                                        <span v-else class="w-5 h-5 shrink-0" aria-hidden="true" /> 
                                    </template> 
                                    <component :is="CellContent(c, row, ri)" /> 
                                </span> 
                            </td> 
                        </tr> 
 
                        <!-- Expanded panel row. Rendered conditionally to 
                             avoid the cost of a hidden subtree per row. --> 
                        <tr 
                            v-if="effectiveExpandable && isExpanded(row, ri)" 
                            class="bg-muted/30" 
                        > 
                            <td :colspan="colCount" class="px-4 py-3 border-b border-border"> 
                                <slot name="row-expanded" :row="row" :index="ri" /> 
                            </td> 
                        </tr> 
                            </template> <!-- /v-for ri alias --> 
                            </template> <!-- /v-for row alias --> 
                        </template> <!-- /v-else (real data row) --> 
                    </template> <!-- /v-for bodyItems --> 
                    <tr 
                        v-if="virtualApi.isActive.value && virtualApi.bottomSpacer.value > 0" 
                        aria-hidden="true" 
                    > 
                        <td 
                            :colspan="colCount" 
                            :style="{ 
                                height: virtualApi.bottomSpacer.value + 'px', 
                                padding: 0, 
                                border: 0, 
                            }" 
                        /> 
                    </tr> 
                </tbody> 
 
                <tfoot v-if="$slots.footer"> 
                    <tr> 
                        <td :colspan="colCount" class="border-t border-border"> 
                            <slot name="footer" /> 
                        </td> 
                    </tr> 
                </tfoot> 
            </table> 
        </div> 
 
        <!-- Pagination footer (only when pagination state is provided). --> 
        <TablePagination 
            v-if="effectivePagination" 
            :pagination="{ 
                ...effectivePagination, 
                total: effectivePagination.total ?? sortedData.length, 
            }" 
            :page-size-options="pageSizeOptions" 
            :size="size" 
            :disabled="loading" 
            @update:pagination="(next: unknown) => emit('update:pagination', next as any)" 
        /> 
 
        <!-- Loading overlay (Phase 9). Translucent backdrop with a 
             centered loader, layered on top of the existing data so 
             the layout never flashes during refetches. Skipped when 
             `loadingMode === 'skeleton'` — that path replaces the body 
             rows instead. --> 
        <div 
            v-if="loading && loadingMode === 'overlay'" 
            class="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[1px] z-20 pointer-events-none" 
            role="status" 
            :aria-label="loc.table.loading" 
        > 
            <Loader size="medium" /> 
            <span class="sr-only">{{ loc.table.loading }}</span> 
        </div> 
 
        <div class="sr-only" aria-live="polite" aria-atomic="true">{{ liveMessage }}</div> 
    </div> 
</template> 
 
<style scoped> 
/* Sticky-first column (Phase 4d). Pins the first non-pinned data column 
   to the left edge while horizontal scrolling. Background uses bg-card 
   tokens so cells stay opaque over scrolled content. */ 
.modo-sticky-first .modo-sticky-first-cell, 
.modo-sticky-first-mobile .modo-sticky-first-cell { 
    position: sticky; 
    left: var(--modo-table-first-sticky-left, 0); 
    z-index: 1; 
    background-color: var(--card); 
    box-shadow: 4px 0 6px -4px rgb(0 0 0 / 0.18); 
} 
 
.modo-sticky-first .modo-sticky-first-th, 
.modo-sticky-first-mobile .modo-sticky-first-th { 
    z-index: 3; 
    background-color: var(--muted); 
} 
 
@media (min-width: 768px) { 
    .modo-sticky-first-mobile .modo-sticky-first-cell { 
        position: static; 
        background-color: transparent; 
        box-shadow: none; 
        z-index: auto; 
    } 
} 
</style>
