<script setup lang="ts" generic="TRow = any"> 
/** 
 * `<TableColumn>` — renderless companion to `<Table>`. 
 * 
 * This component intentionally renders nothing. Its only job is to carry 
 * column metadata (props) and slot definitions (`#header`, `#cell`) up to 
 * the parent `<Table>`, which collects them via `useTableColumns()` and 
 * turns them into a `NormalizedTableColumn[]`. 
 * 
 * The parent identifies these children by the `__isTableColumn` flag set 
 * via `defineOptions`. Avoid renaming or removing it. 
 */ 
import type { TableColumnProps } from '../../../interfaces/data-display/table/TableColumn.interface'; 
 
defineOptions({ 
    name: 'TableColumn', 
    /** 
     * Tag used by `useTableColumns` to detect column children regardless 
     * of the import path. Reading from a stable boolean is more robust 
     * than comparing component identities across HMR boundaries. 
     */ 
    __isTableColumn: true, 
}); 
 
// Props are typed but never used in this template — they live on `node.props` 
// when the parent inspects its default slot. 
defineProps<TableColumnProps<TRow>>(); 
 
// Declaring slots so TypeScript can type-check `<template #cell>` usage in 
// consumer code. The actual render is performed by the parent table. 
defineSlots<{ 
    cell?: (ctx: { row: TRow; value: unknown; index: number }) => any; 
    header?: () => any; 
}>(); 
</script> 
 
<template> 
    <!-- Renderless: parent <Table> projects our slots itself. --> 
</template>
