import { computed, type ComputedRef, type Slots, type VNode } from 'vue'; 
import type { 
    NormalizedTableColumn, 
    TableColumn, 
    TableColumnAlign, 
    TableColumnType, 
} from '../interfaces/data-display/table/Table.interface'; 
 
/** 
 * Resolves the cell value for a row + column pair. 
 * 
 * Lookup order: 
 *   1. `column.accessor(row, index)` if defined. 
 *   2. `row[column.key]` (single-level dot path supported, e.g. `profile.name`). 
 * 
 * Returns `undefined` when the path doesn't exist; consumers decide how to 
 * render `null`/`undefined`. 
 */ 
export function resolveCellValue<TRow>( 
    column: NormalizedTableColumn<TRow>, 
    row: TRow, 
    index: number, 
): unknown { 
    if (typeof column.accessor === 'function') return column.accessor(row, index); 
    const path = column.key; 
    if (!path) return undefined; 
    if (!path.includes('.')) return (row as any)?.[path]; 
    return path.split('.').reduce<any>((acc, k) => (acc == null ? acc : acc[k]), row); 
} 
 
/** Sensible alignment per column type (numbers right-aligned, rest left). */ 
function defaultAlignFor(type: TableColumnType): TableColumnAlign { 
    return type === 'number' ? 'right' : 'left'; 
} 
 
/** Map column type → Skeleton shape. Consumer override always wins. */ 
function defaultSkeletonShapeFor(type: TableColumnType): NormalizedTableColumn['skeletonShape'] { 
    switch (type) { 
        case 'avatar': return 'avatar'; 
        case 'chip': return 'chip'; 
        case 'boolean': return 'rect'; 
        case 'number': 
        case 'date': 
        case 'text': 
        default: 
            return 'text'; 
    } 
} 
 
function normalizeOne<TRow>( 
    raw: TableColumn<TRow>, 
    extras?: Partial<NormalizedTableColumn<TRow>>, 
): NormalizedTableColumn<TRow> { 
    const type: TableColumnType = raw.type ?? 'text'; 
    return { 
        ...raw, 
        type, 
        align: raw.align ?? defaultAlignFor(type), 
        skeletonShape: raw.skeletonShape ?? defaultSkeletonShapeFor(type), 
        ...extras, 
    }; 
} 
 
/** 
 * Detects whether a Vue slot child is a `<TableColumn>` instance. 
 * 
 * We don't rely on the literal component identity (would couple this 
 * composable to the .vue file) — instead we look at the rendered VNode's 
 * `type.__isTableColumn` flag set by `TableColumn.vue` via 
 * `defineOptions({ __isTableColumn: true })`. Fragments are recursively 
 * walked so `<template v-for>` blocks just work. 
 */ 
function collectColumnVNodes(nodes: VNode[] | undefined, out: VNode[]): void { 
    if (!nodes) return; 
    for (const n of nodes) { 
        if (!n) continue; 
        const t: any = n.type; 
        if (t && t.__isTableColumn) { 
            out.push(n); 
            continue; 
        } 
        // Fragment / template: walk children. 
        if (Array.isArray(n.children)) { 
            collectColumnVNodes(n.children as VNode[], out); 
        } 
    } 
} 
 
/** 
 * Reads `<TableColumn>` children from the parent's default slot and turns 
 * each into a `NormalizedTableColumn`. The render functions for `cell` and 
 * `header` slots travel along so the table parent can project them into 
 * the right `<td>`/`<th>`. 
 */ 
function normalizeFromSlots<TRow>(slots: Slots): NormalizedTableColumn<TRow>[] { 
    const defaultSlot = slots.default?.(); 
    const columnNodes: VNode[] = []; 
    collectColumnVNodes(defaultSlot, columnNodes); 
 
    return columnNodes.map((node) => { 
        const props = (node.props ?? {}) as TableColumn<TRow>; 
        // VNode children of a component are its slot functions when 
        // declared as an object (`{ default, header, cell }`). 
        const slotMap = (node.children ?? {}) as Record<string, ((ctx: any) => any) | undefined>; 
        const cellFn = typeof slotMap.cell === 'function' ? slotMap.cell : undefined; 
        const headerFn = typeof slotMap.header === 'function' ? slotMap.header : undefined; 
        return normalizeOne<TRow>(props, { 
            renderCell: cellFn, 
            // The slot signature is `() => …` for header (no args), but Vue 
            // typings allow extra args. Wrap to drop the implicit context. 
            renderHeader: headerFn ? () => (headerFn as any)() : undefined, 
        }); 
    }); 
} 
 
/** 
 * Normalizes columns from either: 
 *   - the `columns` prop (array form, wins when both are present), or 
 *   - `<TableColumn>` children of the table's default slot. 
 * 
 * Returns a reactive `NormalizedTableColumn[]` that the table consumes. 
 */ 
export function useTableColumns<TRow>( 
    columnsProp: () => TableColumn<TRow>[] | undefined, 
    slots: Slots, 
): ComputedRef<NormalizedTableColumn<TRow>[]> { 
    return computed(() => { 
        const arr = columnsProp(); 
        if (arr && arr.length) return arr.map((c) => normalizeOne<TRow>(c)); 
        return normalizeFromSlots<TRow>(slots); 
    }); 
} 
 
/** 
 * Resolves the row key for a single row. Mirrors Vue's `:key` semantics 
 * but is reused outside the template (e.g. to build `<TableRow>` keys 
 * and, in Fase 2, to track selection). 
 */ 
export function resolveRowKey<TRow>( 
    rowKeyOpt: string | ((row: TRow, index: number) => string | number) | undefined, 
    row: TRow, 
    index: number, 
): string | number { 
    if (typeof rowKeyOpt === 'function') return rowKeyOpt(row, index); 
    const key = rowKeyOpt ?? 'id'; 
    const v = (row as any)?.[key]; 
    return v ?? index; 
} 
 
/** Convert `string | number` → CSS length. Numbers become `${n}px`. */ 
export function toCssLength(v: string | number | undefined): string | undefined { 
    if (v === undefined || v === null) return undefined; 
    if (typeof v === 'number') return `${v}px`; 
    return v; 
}
