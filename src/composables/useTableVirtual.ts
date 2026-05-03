import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue'; 
 
/** 
 * Fixed-height row virtualization for `<Table>`. 
 * 
 * Strategy: a single scroll viewport (the table wrapper) reports its 
 * `scrollTop` and `clientHeight` via a ResizeObserver + scroll listener. 
 * From those numbers + a fixed `rowHeight` we compute the slice 
 * `[startIndex, endIndex)` of visible rows plus an overscan band so 
 * the user never sees a blank gap during fast scrolling. 
 * 
 * Why fixed height? 
 *  - It's the only model that lets us compute scroll positions in O(1) 
 *    without measuring the DOM. Variable heights need a measurement 
 *    cache + binary search and break sticky <thead> alignment. 
 *  - Phase 3c excludes `expandable` rows, which is the only case where 
 *    real heights would diverge. 
 * 
 * The composable is DOM-aware: pass it the viewport ref (the element 
 * that actually scrolls). It returns reactive indices the template 
 * uses to slice the row array, plus `topSpacer` / `bottomSpacer` 
 * heights for the placeholder rows that preserve the scrollbar. 
 */ 
export interface UseTableVirtualOptions { 
    /** Total row count (after filter/sort/paginate, in row order). */ 
    total: () => number; 
    /** Fixed row height in pixels. */ 
    rowHeight: () => number; 
    /** Extra rows rendered outside the viewport on each side. @default 5 */ 
    overscan?: () => number; 
    /** Active flag — when false, the API yields the full range. */ 
    enabled: () => boolean; 
    /** The scrolling DOM node. Provided by the parent via a template ref. */ 
    viewport: Ref<HTMLElement | null>; 
} 
 
export interface UseTableVirtualApi { 
    startIndex: ComputedRef<number>; 
    endIndex: ComputedRef<number>; 
    topSpacer: ComputedRef<number>; 
    bottomSpacer: ComputedRef<number>; 
    /** True when virtualization is active AND there are enough rows for it to matter. */ 
    isActive: ComputedRef<boolean>; 
} 
 
export function useTableVirtual(opts: UseTableVirtualOptions): UseTableVirtualApi { 
    const scrollTop = ref(0); 
    const viewportHeight = ref(0); 
 
    let scrollListener: ((e: Event) => void) | null = null; 
    let resizeObserver: ResizeObserver | null = null; 
 
    function attach(el: HTMLElement) { 
        viewportHeight.value = el.clientHeight; 
        scrollTop.value = el.scrollTop; 
 
        scrollListener = () => { 
            scrollTop.value = el.scrollTop; 
        }; 
        el.addEventListener('scroll', scrollListener, { passive: true }); 
 
        if (typeof ResizeObserver !== 'undefined') { 
            resizeObserver = new ResizeObserver(() => { 
                viewportHeight.value = el.clientHeight; 
            }); 
            resizeObserver.observe(el); 
        } 
    } 
 
    function detach(el: HTMLElement | null) { 
        if (el && scrollListener) el.removeEventListener('scroll', scrollListener); 
        scrollListener = null; 
        resizeObserver?.disconnect(); 
        resizeObserver = null; 
    } 
 
    // Re-attach whenever the viewport ref changes (e.g. flag toggled). 
    watch( 
        () => opts.viewport.value, 
        (next, prev) => { 
            detach(prev ?? null); 
            if (next) attach(next); 
        }, 
        { flush: 'post', immediate: true }, 
    ); 
 
    onScopeDispose(() => detach(opts.viewport.value)); 
 
    const isActive = computed(() => { 
        if (!opts.enabled()) return false; 
        const h = opts.rowHeight(); 
        if (!h || h <= 0) return false; 
        return opts.total() > 0; 
    }); 
 
    const overscanCount = computed(() => Math.max(0, opts.overscan?.() ?? 5)); 
 
    const startIndex = computed(() => { 
        if (!isActive.value) return 0; 
        const h = opts.rowHeight(); 
        const i = Math.floor(scrollTop.value / h) - overscanCount.value; 
        return Math.max(0, i); 
    }); 
 
    const endIndex = computed(() => { 
        const total = opts.total(); 
        if (!isActive.value) return total; 
        const h = opts.rowHeight(); 
        const visible = Math.ceil((viewportHeight.value || 0) / h); 
        // `+1` so a partially-visible last row still renders. 
        const i = startIndex.value + visible + overscanCount.value * 2 + 1; 
        return Math.min(total, i); 
    }); 
 
    const topSpacer = computed(() => { 
        if (!isActive.value) return 0; 
        return startIndex.value * opts.rowHeight(); 
    }); 
 
    const bottomSpacer = computed(() => { 
        if (!isActive.value) return 0; 
        return (opts.total() - endIndex.value) * opts.rowHeight(); 
    }); 
 
    return { startIndex, endIndex, topSpacer, bottomSpacer, isActive }; 
}
