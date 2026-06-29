import type { TablePaginationState } from './Table.interface'; 
import type { ModoSize } from '../../../config/ModoConfig';
 
/** 
 * `<TablePagination>` props. The component renders a self-contained 
 * footer (range readout + page-size select + first/prev/next/last 
 * buttons) that can be embedded anywhere — typically wired via 
 * `v-model:pagination` on `<Table>`, but exported as a standalone 
 * primitive so consumers can build custom pagers. 
 */ 
export interface TablePagination { 
    /** 
     * Pagination state. Bind with `v-model:pagination` (parent emits the 
     * same object back with `page`/`pageSize` updated). 
     */ 
    pagination: TablePaginationState; 
 
    /** Page-size options. @default [10, 25, 50, 100] */ 
    pageSizeOptions?: number[]; 
 
    /** 
     * When `true`, hide the page-size select (some hosts only need 
     * page navigation). @default false 
     */ 
    hidePageSize?: boolean; 
 
    /** Hide first/last buttons (only show prev/next). @default false */ 
    hideEdgeButtons?: boolean; 
 
    /** 
     * Disables every control. Useful while the host is fetching a new 
     * page. @default false 
     */ 
    disabled?: boolean; 
 
    /** Sizing scale, mirrors `<Table>`. @default 'medium' */ 
    size?: ModoSize; 
 
    /** Forwarded to the wrapping `<nav>` for screen readers. */ 
    ariaLabel?: string; 
}
