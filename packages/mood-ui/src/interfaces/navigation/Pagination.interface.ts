import type { ModoSize } from '../../config/ModoConfig';
export interface Pagination { 
    /** Current page (1-based). v-model. */ 
    modelValue: number; 
    /** Total page count. Must be ≥ 1. */ 
    pageCount: number; 
    /** 
     * Sibling page numbers shown around the current page. Default 1 
     * means: `… 4 [5] 6 …`. Use 2 for `… 3 4 [5] 6 7 …`. 
     * @default 1 
     */ 
    siblingCount?: number; 
    /** 
     * Page numbers pinned at the start and end. Default 1 means the 
     * first and last pages are always visible. 
     * @default 1 
     */ 
    boundaryCount?: number; 
    /** Show first/last edge buttons. @default true */ 
    showFirstLast?: boolean; 
    /** Show prev/next buttons. @default true */ 
    showPrevNext?: boolean; 
    /** Color for the active page button (Action/Content set per §12.2). @default 'primary' */ 
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning'; 
    /** Size — cascades from `ModoProvider`. */ 
    size?: ModoSize; 
    /** Radius for buttons. Cascades from `ModoProvider`. */ 
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full'; 
    /** Disables the whole pagination. */ 
    disabled?: boolean; 
    /** Accessible name on the wrapping `<nav>`. @default 'Pagination' */ 
    ariaLabel?: string; 
} 
 
export interface PaginationEmits { 
    'update:modelValue': [page: number]; 
    /** Fires whenever the page changes (same payload as `update:modelValue`). */ 
    change: [page: number]; 
}
