import type { VNode } from 'vue'; 
 
/** 
 * Logical type of a column. Used for two purposes only: 
 *  1. Default cell formatting (right-align numbers, em-dash for null, etc.). 
 *  2. Default `skeletonShape` when `loading` is true. 
 * 
 * Consumers can always override via the `cell` slot or `skeletonShape`. 
 */ 
export type TableColumnType = 
    | 'text' 
    | 'number' 
    | 'date' 
    | 'boolean' 
    | 'chip' 
    | 'avatar' 
    | 'custom'; 
 
export type TableColumnAlign = 'left' | 'center' | 'right'; 
 
/** 
 * One column declaration (used by the array API and as the normalized form 
 * after collecting `<TableColumn>` children). 
 * 
 * `key` is the column id and the lookup path into each row by default. For 
 * nested fields use `accessor` (a function) instead. 
 */ 
export interface TableColumn<TRow = any> { 
    /** Stable identifier. Also the default field path into the row. */ 
    key: string; 
 
    /** Header text. Use `headerSlot` or `<TableColumn>` children for rich content. */ 
    header?: string; 
 
    /** 
     * Optional descriptive text shown in a tooltip on the column header. 
     * Useful for explaining abbreviations, units, or business rules. 
     * Wraps the header label in a `<Tooltip>` (Phase 5e). 
     */ 
    description?: string; 
 
    /** 
     * Custom value extractor. When omitted, the value is `row[key]` (with 
     * a single level of dot-path support, e.g. `'profile.name'`). 
     */ 
    accessor?: (row: TRow, index: number) => unknown; 
 
    /** 
     * Logical type. Drives: 
     *  - default `align` (numbers → right, others → left). 
     *  - default `skeletonShape` when loading. 
     *  - default cell formatting (date → locale string, boolean → ✓/—). 
     * @default 'text' 
     */ 
    type?: TableColumnType; 
 
    /** Horizontal alignment override. */ 
    align?: TableColumnAlign; 
 
    /** 
     * Fixed width. Accepts any CSS length (`'12rem'`, `120`, `'10%'`). 
     * Omit for auto-sizing. 
     */ 
    width?: string | number; 
 
    /** Minimum width — useful with `overflow="truncate"` to avoid collapse. */ 
    minWidth?: string | number; 
 
    /** 
     * Reserved for Fase 2: enables sort UI and `aria-sort` on the header. 
     * Already part of the contract so consumers can declare it now. 
     */ 
    sortable?: boolean; 
 
    /** 
     * Pins the column to the start (`'left'`) or end (`'right'`) of the 
     * scroll viewport. Pinned columns stay visible while the rest scroll 
     * horizontally. Order within a pin group follows declaration order 
     * (or `columnsState.order` if provided). Reordering is allowed but 
     * does not move columns across pin groups. 
     */ 
    pinned?: 'left' | 'right'; 
 
    /** Extra classes applied to every body `<td>` of this column. */ 
    cellClass?: string; 
 
    /** Extra classes applied to the column's `<th>` header. */ 
    headerClass?: string; 
 
    /** 
     * Controls the auto-tooltip applied to truncated cells (when the 
     * parent `<Table overflow="truncate">`). 
     * 
     *  - `undefined` (default): use a native `title` with the formatted 
     *    value, but only when there is no custom `renderCell` or 
     *    `#cell-{key}` slot (the host owns those). 
     *  - `false`: never set a title for this column. 
     *  - `(row, value, index) => string`: custom title (useful for 
     *    formatted slots — e.g. show full ISO date when slot prints 
     *    short locale date). 
     */ 
    truncateTooltip?: false | ((row: TRow, value: unknown, index: number) => string | null | undefined); 
 
    /** 
     * Override the skeleton shape when `loading=true`. If omitted, the 
     * shape is inferred from `type` (text → `text`, chip → `chip`, …). 
     */ 
    skeletonShape?: 
        | 'text' | 'title' | 'rect' | 'circle' | 'avatar' | 'button' 
        | 'chip' | 'badge'; 
 
    /** 
     * Enables a per-column filter input rendered below the header. When 
     * `true`, a basic text "contains" filter is used; for richer UX use 
     * the `#filter-{key}` slot or the `filter` shape below. 
     */ 
    filterable?: boolean; 
 
    /** 
     * Filter behavior when `filterable=true`. Defaults to `'contains'` 
     * with case-insensitive `String(value).includes(input)`. 
     *  - `'contains' | 'startsWith' | 'equals'` — string ops on the value. 
     *  - `(value, input, row) => boolean` — fully custom predicate. 
     */ 
    filter?: 
        | 'contains' 
        | 'startsWith' 
        | 'equals' 
        | ((value: unknown, input: string, row: TRow) => boolean); 
 
    /** 
     * Opt this column out of user column resizing even when the parent 
     * `<Table>` has `resizable` enabled. The column keeps its declared 
     * `width` / `minWidth`. @default true (resizable when parent is) 
     */ 
    resizable?: boolean; 
 
    /** 
     * Opt this column out of user column reordering. Useful for sticky 
     * identity columns (checkboxes, avatars). @default true when parent 
     * `reorderable` is on. 
     */ 
    reorderable?: boolean; 
 
    /* ---------- Editable (Phase 4a) ---------- */ 
 
    /** 
     * Enables inline cell editing for this column. When `true`, double-click 
     * (or `F2` / `Enter` on a focused cell) switches the cell to an 
     * `<input>` editor. Pass a predicate to allow editing only on certain 
     * rows (e.g. status-dependent). @default false 
     */ 
    editable?: boolean | ((row: TRow, index: number) => boolean); 
 
    /** 
     * Input type used by the inline editor. When omitted, it's inferred 
     * from `type` (`number` → `'number'`, otherwise `'text'`). 
     */ 
    editType?: 'text' | 'number'; 
 
    /** 
     * Validates the draft value before commit. Return `null`/`undefined` 
     * when valid, or a non-empty string with an error message to keep the 
     * editor open and announce the error. Receives the parsed value 
     * (string or number depending on `editType`). 
     */ 
    editValidator?: ( 
        value: string | number, 
        row: TRow, 
        index: number, 
    ) => string | null | undefined; 
 
    /* ---------- Aggregation (Phase 4c-group) ---------- */ 
 
    /** 
     * Reducer that produces a summary value for this column. Used by 
     * group headers (when `<Table groupBy>` is set) and may also be 
     * surfaced via the `#footer` slot. 
     * 
     *  - `'sum' | 'avg' | 'min' | 'max'` — numeric reducers, ignore non-numbers. 
     *  - `'count'` — number of rows in the group. 
     *  - `(rows, key) => unknown` — fully custom reducer. 
     * 
     * The result is rendered through `defaultFormat` (numbers → locale 
     * string, dates → date string, etc.) unless a `#group-header` or 
     * `#cell-{key}` slot intercepts the rendering. 
     */ 
    aggregate?: 
        | 'sum' 
        | 'avg' 
        | 'min' 
        | 'max' 
        | 'count' 
        | ((rows: TRow[], key: string) => unknown); 
} 
 
/** 
 * Internal: a fully-resolved column. Always has `align` + `type` set. 
 * Components only ever consume this shape. 
 */ 
export interface NormalizedTableColumn<TRow = any> extends TableColumn<TRow> { 
    align: TableColumnAlign; 
    type: TableColumnType; 
    /** 
     * When the column was declared via `<TableColumn>` children, this holds 
     * its render functions (cell + header) so the parent `<Table>` can 
     * project them into the right `<td>`/`<th>`. 
     */ 
    renderCell?: (ctx: { row: TRow; value: unknown; index: number }) => VNode | VNode[] | string | number | null | undefined; 
    renderHeader?: () => VNode | VNode[] | string | number | null | undefined; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Sort                                                                */ 
/* ------------------------------------------------------------------ */ 
 
export type TableSortDirection = 'asc' | 'desc'; 
 
/** One sort criterion (column key + direction). */ 
export interface TableSortCriterion { 
    key: string; 
    direction: TableSortDirection; 
} 
 
/** 
 * Sort state. An array enables multi-column sorting (priority = order). 
 * `null` means no sort. Use a single-element array for single-column sort. 
 */ 
export type TableSortState = TableSortCriterion[]; 
 
/* ------------------------------------------------------------------ */ 
/*  Selection                                                           */ 
/* ------------------------------------------------------------------ */ 
 
export type TableSelectionMode = 'none' | 'single' | 'multi'; 
 
/** 
 * Selected row keys. For `single` it's a 0/1-element array (kept as array 
 * for API uniformity so consumers don't need to branch on the mode). 
 */ 
export type TableSelection = (string | number)[]; 
 
/* ------------------------------------------------------------------ */ 
/*  Columns state (Phase 3b — resize / reorder / visibility)           */ 
/* ------------------------------------------------------------------ */ 
 
/** 
 * Per-column runtime state: width (after user resize), order position, 
 * and hidden flag. Bound to `<Table>` via `v-model:columnsState` so the 
 * host can persist user preferences (localStorage, URL, backend). 
 * 
 * Entries not present in the state default to the declared column's 
 * width + natural order + visible. 
 */ 
export interface TableColumnState { 
    /** Column identifier — must match `column.key`. */ 
    key: string; 
    /** User-resized width in CSS pixels. Omit to use the declared width. */ 
    width?: number; 
    /** 
     * Logical position, 0-based. Columns without an `order` render after 
     * ones with an order (in declaration sequence). Duplicates are 
     * stable-sorted by original index. 
     */ 
    order?: number; 
    /** When true the column is not rendered (toolbar / column chooser). */ 
    hidden?: boolean; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Aggregate state snapshot (Phase 10 — v-model:state)                 */ 
/* ------------------------------------------------------------------ */ 
 
/** 
 * Single serializable snapshot of every user-controlled bit of state in 
 * a `<Table>`. Useful to persist UI preferences in one go (localStorage, 
 * URL hash, backend user-settings) instead of wiring each v-model 
 * separately. Each field is optional so callers can opt-in piecemeal. 
 * 
 * The shape is plain JSON — no Date / Map / Set — so `JSON.stringify` 
 * round-trips without custom replacers. 
 */ 
export interface TableStateSnapshot { 
    sort?: TableSortState; 
    filter?: TableFilterState; 
    /** 1-based page + page size + (optional) total. */ 
    pagination?: { page: number; pageSize: number; total?: number }; 
    /** Per-column user state (resize / reorder / visibility). */ 
    columnsState?: TableColumnState[]; 
    /** Global search box value. */ 
    globalSearchTerm?: string; 
    /** Selected row keys. */ 
    selected?: TableSelection; 
    /** Schema version. Bump this in your app when shape changes so old 
     *  persisted snapshots can be migrated/dropped. @default 1 */ 
    version?: number; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Filter                                                              */ 
/* ------------------------------------------------------------------ */ 
 
/** Map of `{ [columnKey]: filterValue }`. Empty/undefined entries are ignored. */ 
export type TableFilterState = Record<string, string>; 
 
/* ------------------------------------------------------------------ */ 
/*  Expansion                                                           */ 
/* ------------------------------------------------------------------ */ 
 
/** Set of expanded row keys (resolved via `rowKey`). */ 
export type TableExpansionState = (string | number)[]; 
 
/* ------------------------------------------------------------------ */ 
/*  Pagination                                                          */ 
/* ------------------------------------------------------------------ */ 
 
/** 
 * Pagination state. Bind with `v-model:pagination` for controlled mode, 
 * or pass an initial object and let the table mutate it. 
 * 
 * `total` is optional in client-side mode (the table derives it from 
 * the filtered row count). For server-side pagination set `total` 
 * yourself when each page arrives. 
 */ 
export interface TablePaginationState { 
    /** 1-based page index. @default 1 */ 
    page: number; 
    /** Rows per page. @default 10 */ 
    pageSize: number; 
    /** Total rows across every page (server mode). Optional in client mode. */ 
    total?: number; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Table                                                              */ 
/* ------------------------------------------------------------------ */ 
 
export interface Table<TRow = any> { 
    /** Row data. Keyed by `rowKey` for v-model:selected and Vue keying. */ 
    data: TRow[]; 
 
    /** 
     * Column definitions. Optional — you can also declare columns 
     * inline as `<TableColumn>` children of `<Table>`. When both are 
     * provided, `columns` wins (children are ignored). 
     */ 
    columns?: TableColumn<TRow>[]; 
 
    /** 
     * Row identity. Either a property key on the row or a function. Used 
     * for Vue's `:key` and for `v-model:selected`. 
     * @default 'id' 
     */ 
    rowKey?: string | ((row: TRow, index: number) => string | number); 
 
    /** 
     * Sizing scale. Drives row height + cell padding + font size. 
     * @default 'medium' 
     */ 
    size?: 'small' | 'medium' | 'large'; 
 
    /** Alternating row background. @default false */ 
    striped?: boolean; 
 
    /** 
     * Border layout. `'rows'` only horizontal separators between rows; 
     * `'cols'` only vertical between columns; `'all'` both; `'none'` clean. 
     * @default 'rows' 
     */ 
    bordered?: 'none' | 'rows' | 'cols' | 'all'; 
 
    /** Highlight the row under the cursor. @default true */ 
    hover?: boolean; 
 
    /** 
     * Density mirrors a real component prop and supersedes `dense`. 
     *  - `comfortable` (default) — full padding per `size`. 
     *  - `compact` — half padding, ~32 px row. 
     *  - `spacious` — extra padding, suited to avatar+two-line rows. 
     * @default 'comfortable' 
     */ 
    density?: 'comfortable' | 'compact' | 'spacious'; 
 
    /** 
     * @deprecated Use `density="compact"` instead. Kept for backward 
     * compatibility with Phase 1 callers; ignored when `density` is set. 
     */ 
    dense?: boolean; 
 
    /** Sticky `<thead>` that stays visible while the body scrolls. @default false */ 
    stickyHeader?: boolean; 
 
    /** Outer wrapper radius (provider cascade applies). */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
 
    /** 
     * Horizontal overflow strategy: 
     *  - `'scroll'` — the wrapper scrolls; columns keep their natural width. 
     *  - `'truncate'` — cells clip with ellipsis (use `minWidth` per column). 
     * @default 'scroll' 
     */ 
    overflow?: 'scroll' | 'truncate'; 
 
    /** 
     * Replaces every body row with a `<Skeleton>` placeholder. Header stays 
     * real so the layout doesn't shift. 
     */ 
    loading?: boolean; 
 
    /** Number of skeleton rows to render while loading. @default 5 */ 
    loadingRows?: number; 
 
    /** 
     * How to visually represent the `loading` state. 
     *  - `'skeleton'` (default): replaces body rows with `<Skeleton>` — 
     *    best for the *first* load when there is no data to show. 
     *  - `'overlay'`: keeps the previous data visible behind a translucent 
     *    backdrop with a centered loader — best for *refetches* (server 
     *    pagination, filter changes) so the layout doesn't flash. 
     */ 
    loadingMode?: 'skeleton' | 'overlay'; 
 
    /** Override the default empty-state copy. */ 
    emptyText?: string; 
 
    /** 
     * Override the default no-results copy (Fase 4 behavior, included now 
     * for forward-compat). Falls back to `emptyText` if not provided. 
     */ 
    noResultsText?: string; 
 
    /** Forwarded to the `<table>` element for screen readers. */ 
    ariaLabel?: string; 
 
    /* ---------- Sort (Phase 2) ---------- */ 
 
    /** 
     * Sort state. Bind with `v-model:sort` to control externally; omit 
     * for an uncontrolled table that manages its own state internally. 
     * Pass an empty array to clear the sort. 
     */ 
    sort?: TableSortState; 
 
    /** 
     * Allow multi-column sort (shift+click adds a criterion). Requires at 
     * least one sortable column. @default false 
     */ 
    multiSort?: boolean; 
 
    /** 
     * When true the sort cycle is `asc → desc → none`. When false the 
     * cycle is `asc → desc → asc` (no clearable state). @default true 
     */ 
    sortClearable?: boolean; 
 
    /* ---------- Selection (Phase 2) ---------- */ 
 
    /** Row selection mode. @default 'none' */ 
    selectable?: TableSelectionMode; 
 
    /** 
     * Selected row keys. Bind with `v-model:selected`. For `selectable='single'` 
     * it's an empty or 1-element array. 
     */ 
    selected?: TableSelection; 
 
    /** 
     * Disables selection for individual rows. Receives the row + index and 
     * returns `true` to disable. The header "select-all" checkbox skips 
     * disabled rows automatically. 
     */ 
    isRowSelectable?: (row: TRow, index: number) => boolean; 
 
    /* ---------- Filter (Phase 3) ---------- */ 
 
    /** 
     * Per-column filter values. Bind with `v-model:filter`. Keys match 
     * `column.key`; values are the raw user input (string). 
     */ 
    filter?: TableFilterState; 
 
    /** 
     * When true, every column's filter input is rendered as a sub-row 
     * below the header. Individual columns can opt out by setting 
     * `filterable: false` on the column. 
     */ 
    filterRow?: boolean; 
 
    /* ---------- Row expansion (Phase 3) ---------- */ 
 
    /** 
     * When set, an expand/collapse chevron column is auto-injected. The 
     * `#row-expanded` slot renders the panel below the row when 
     * expanded. Use `v-model:expanded` to control externally. 
     */ 
    expandable?: boolean; 
 
    /** Expanded row keys. Bind with `v-model:expanded`. */ 
    expanded?: TableExpansionState; 
 
    /** 
     * When `expandable`, this predicate determines whether a given row 
     * even has expansion content. Returning `false` hides the chevron 
     * for that row. @default () => true 
     */ 
    isRowExpandable?: (row: TRow, index: number) => boolean; 
 
    /* ---------- Pagination (Phase 3) ---------- */ 
 
    /** 
     * Pagination state. When set, the table renders a `<TablePagination>` 
     * footer and slices `data` accordingly in client mode. Bind with 
     * `v-model:pagination` to control externally. 
     */ 
    pagination?: TablePaginationState; 
 
    /** 
     * Available page-size options shown in the pagination footer. 
     * @default [10, 25, 50, 100] 
     */ 
    pageSizeOptions?: number[]; 
 
    /** 
     * Server-side mode. When `true`, the table does NOT slice `data`, 
     * filter, or sort — it just emits state changes for the host to 
     * refetch. Use together with the explicit `total` on the 
     * pagination object so the footer can show the correct range. 
     * @default false 
     */ 
    serverSide?: boolean; 
 
    /* ---------- Column resize / reorder (Phase 3b) ---------- */ 
 
    /** 
     * Enables user column resizing. A drag handle appears on the right 
     * edge of every resizable `<th>`. Columns can opt out via 
     * `column.resizable = false`. @default false 
     */ 
    resizable?: boolean; 
 
    /** 
     * Enables user column reordering via HTML5 drag-and-drop on the 
     * header. A drop indicator line shows the insertion target. 
     * Keyboard: Alt+Left/Right on a focused header moves the column. 
     * @default false 
     */ 
    reorderable?: boolean; 
 
    /** 
     * Columns state (widths / order / hidden). Bind with 
     * `v-model:columnsState` to persist user preferences. 
     */ 
    columnsState?: TableColumnState[]; 
 
    /** 
     * Aggregate state snapshot — every user-controlled bit (sort, 
     * filter, pagination, columnsState, globalSearchTerm, selected) in 
     * one serializable object. Bind with `v-model:state` to persist 
     * everything to localStorage / URL / backend in a single line. 
     * 
     * When `state` is provided, it acts as a *one-way* hydrator: the 
     * snapshot is applied to the underlying refs once on mount and 
     * whenever the snapshot reference changes. Subsequent user 
     * interactions emit `update:state` so the host can save it. 
     * 
     * `state` is independent from the per-feature v-models — you can 
     * use both (the per-feature ones win on conflicts since they are 
     * applied last). 
     */ 
    state?: TableStateSnapshot; 
 
    /** 
     * Minimum column width in pixels when resizing. Prevents users from 
     * collapsing a column to nothing. @default 48 
     */ 
    minColumnWidth?: number; 
 
    /* ---------- Virtualization (Phase 3c) ---------- */ 
 
    /** 
     * Enables row virtualization. Only the rows visible in the viewport 
     * (plus an `overscan` band) are mounted, which keeps render time 
     * constant for thousands of rows. 
     * 
     * Caveats: 
     *  - Requires a fixed `rowHeight` (auto-derived from `size`/`density` 
     *    if you don't pass one). Variable-height rows are not supported. 
     *  - Not compatible with `expandable` (the panel changes the row 
     *    height). Setting both is a no-op for expansion. 
     *  - The host must allow vertical space — set `virtualHeight` or use 
     *    `stickyHeader` so the scroll viewport has a bounded height. 
     * 
     * @default false 
     */ 
    virtual?: boolean; 
 
    /** 
     * Pixel height of a single row in virtual mode. When omitted, the 
     * value is derived from the active `size` + `density` combination 
     * (matches what the unscrolled table would render). 
     */ 
    rowHeight?: number; 
 
    /** 
     * Number of extra rows rendered outside the viewport on each side 
     * during virtualization. Bigger overscan = smoother scroll, more DOM. 
     * @default 5 
     */ 
    overscan?: number; 
 
    /** 
     * CSS height of the virtualization viewport. Defaults to `'60vh'` 
     * — same as `stickyHeader` — so the scroll container has bounds. 
     */ 
    virtualHeight?: string | number; 
 
    /* ---------- Tree rows (Phase 4c) ---------- */ 
 
    /** 
     * Renders rows hierarchically. Each row may have a children array 
     * under `childrenKey` (default `'children'`). A chevron toggle is 
     * auto-injected before the first data column and indents the cell 
     * content per `depth`. 
     * 
     * Mutually exclusive with `expandable` (use one expansion model) 
     * and with `pagination` (paging a flattened tree is undefined). 
     * Both are silently ignored when `tree=true`. 
     * @default false 
     */ 
    tree?: boolean; 
 
    /** Field name on each row holding the children array. @default 'children' */ 
    childrenKey?: string; 
 
    /** 
     * Currently-expanded row keys (controlled). Bind with 
     * `v-model:treeExpanded`. Same key resolution as `selected`. 
     */ 
    treeExpanded?: (string | number)[]; 
 
    /** 
     * Lazy children loader. When set, the chevron is rendered for any 
     * row where `hasChildrenHint` returns true, and expansion calls 
     * this function. While the promise pends, the row is marked 
     * `isLoading` (a small spinner is shown next to the chevron). 
     */ 
    loadChildren?: (row: TRow, index: number) => Promise<TRow[]>; 
 
    /** 
     * Predicate used together with `loadChildren` to decide whether a 
     * row that has no preloaded children should still show the 
     * expansion chevron. @default () => false 
     */ 
    hasChildrenHint?: (row: TRow, index: number) => boolean; 
 
    /* ---------- Grouping (Phase 4c-group) ---------- */ 
 
    /** 
     * Groups rows by the result of this accessor. Either a column key 
     * (the value at `row[key]`) or a function returning the group 
     * value. A collapsible group header row is rendered before each 
     * group; aggregation results from `column.aggregate` are shown 
     * inline. 
     * 
     * Mutually exclusive with `tree` and `pagination`. Both are 
     * silently ignored when `groupBy` is set. 
     */ 
    groupBy?: string | ((row: TRow) => string | number); 
 
    /** 
     * Currently-expanded group keys (controlled). Bind with 
     * `v-model:groupExpanded`. When omitted, every group starts 
     * expanded. 
     */ 
    groupExpanded?: (string | number)[]; 
 
    /* ---------- Responsive (Phase 4d) ---------- */ 
 
    /** 
     * Pins the first data column to the left edge of the scroll viewport. 
     * Useful on narrow viewports where horizontal scroll is required — 
     * the identity column (name, id, etc.) stays visible while the rest 
     * scrolls. Composes with `pinned` columns: a left-pinned column 
     * already at the start absorbs this behavior. 
     * 
     *  - `true` — always sticky. 
     *  - `'mobile'` — only sticky below the `md` breakpoint (≤ 768px). 
     *  - `false` (default) — never sticky. 
     * 
     * Has no effect when `overflow="truncate"` (no horizontal scroll 
     * occurs) or when virtualization disables horizontal layout. 
     * @default false 
     */ 
    stickyFirstColumn?: boolean | 'mobile'; 
 
    /* ---------- Toolbar & global search (Phase 5a) ---------- */ 
 
    /** 
     * Renders a toolbar above the table. The default toolbar contains 
     * a global search input bound to `globalSearchTerm`. Override the 
     * full toolbar via the `#toolbar` slot — it receives the current 
     * search term + setter so consumers can compose freely. 
     * 
     * Setting `globalSearch=true` is equivalent to `toolbar=true` plus 
     * the default search input. Use `toolbar=true` alone to render the 
     * toolbar surface without the built-in search. 
     * @default false 
     */ 
    toolbar?: boolean; 
 
    /** 
     * Enables a global search input in the toolbar. Filters rows by a 
     * case-insensitive `contains` match on the stringified value of 
     * every column (or only `filterable`-flagged columns when 
     * `globalSearchScope='filterable'`). Runs before column filters 
     * and sort, so paginated counts reflect the searched set. 
     * @default false 
     */ 
    globalSearch?: boolean; 
 
    /** 
     * Restrict global search to columns that opted into `filterable`, 
     * or scan every column. @default 'all' 
     */ 
    globalSearchScope?: 'all' | 'filterable'; 
 
    /** 
     * Current global search term (controlled). Bind with 
     * `v-model:globalSearchTerm` to persist or sync with a URL. 
     */ 
    globalSearchTerm?: string; 
 
    /** 
     * Renders a column-visibility menu in the toolbar. Each column gets 
     * a checkbox; toggling commits to `columnsState`. Implies `toolbar`. 
     * @default false 
     */ 
    columnVisibility?: boolean; 
 
    /** 
     * Renders an Export menu in the toolbar with CSV / JSON / Copy 
     * (TSV → clipboard) actions. Pass `true` to enable all three or 
     * an object to opt-in per format. Exports the post-filter + 
     * post-sort dataset (pre-pagination) using only visible columns. 
     * Implies `toolbar`. 
     * @default false 
     */ 
    exportable?: 
        | boolean 
        | { csv?: boolean; json?: boolean; clipboard?: boolean }; 
 
    /** 
     * Base filename (without extension) for downloaded exports. 
     * @default 'table' 
     */ 
    exportFileName?: string; 
} 
 
/* ------------------------------------------------------------------ */ 
/*  Cell editing (Phase 4a)                                            */ 
/* ------------------------------------------------------------------ */ 
 
/** 
 * Payload of the `@cell-edit` event. Emitted when the user commits a 
 * change in an inline editor (Enter / blur on a valid value). 
 * 
 * The table never mutates `row` itself — the host is responsible for 
 * updating its data source on this event. This keeps editing 
 * controlled / undo-friendly and works in server-mode the same way. 
 */ 
export interface TableCellEditEvent<TRow = any> { 
    /** Column key whose cell was edited. */ 
    key: string; 
    /** The row object before the change. */ 
    row: TRow; 
    /** Row index inside the (filtered/sorted) `visibleData` array. */ 
    index: number; 
    /** Previous value (as resolved by the column's `accessor`/`key`). */ 
    oldValue: unknown; 
    /** New value, parsed by `editType` (string for text, number for number). */ 
    newValue: string | number; 
}
