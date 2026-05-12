import type { TableColumn } from './Table.interface'; 
 
/** 
 * Props for `<TableColumn>`, the declarative companion to `<Table>`. 
 * 
 * Every prop maps 1:1 to {@link TableColumn} so column metadata can be 
 * declared inline next to the slot template. The component itself renders 
 * nothing — the parent `<Table>` collects its children, reads their props 
 * and slots, and builds a `NormalizedTableColumn[]` from them. 
 */ 
export type TableColumnProps<TRow = any> = TableColumn<TRow>;
