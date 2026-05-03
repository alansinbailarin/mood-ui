import type { InjectionKey, Ref } from 'vue'; 
 
/** 
 * Design-system locale strings. 
 * 
 * Every namespace corresponds to a component (or a small group). Keys are 
 * stable contract — renaming a key is a breaking change for consumers. 
 * 
 * Rules: 
 *  - Keep entries short and component-scoped. This is UI copy, not i18n 
 *    for user content. 
 *  - Never use HTML. These strings are injected as text / aria-label. 
 *  - Placeholders use `{name}` interpolation (see `interpolate()`). 
 * 
 * Precedence resolved by components: 
 *   component prop (e.g. `rejectMessages`) → provider locale → default EN. 
 */ 
export interface ModoLocale { 
    /** Shared strings used across multiple components. */ 
    common: { 
        clear: string; 
        loading: string; 
        close: string; 
        dismiss: string; 
        remove: string; 
    }; 
    input: { 
        clear: string; 
    }; 
    textarea: { 
        clear: string; 
    }; 
    select: { 
        empty: string; 
        clear: string; 
        clearSearch: string; 
    }; 
    multiSelect: { 
        clear: string; 
        clearSearch: string; 
    }; 
    combobox: { 
        clear: string; 
        toggleOptions: string; 
    }; 
    numberInput: { 
        increment: string; 
        decrement: string; 
    }; 
    searchInput: { 
        clear: string; 
    }; 
    passwordInput: { 
        show: string; 
        hide: string; 
        /** Label per strength score. Empty string `''` is valid for score 0. */ 
        strength: { 
            0: string; 
            1: string; 
            2: string; 
            3: string; 
            4: string; 
        }; 
    }; 
    dateField: { 
        clear: string; 
    }; 
    dateTimeField: { 
        clear: string; 
    }; 
    dateRangeField: { 
        clear: string; 
    }; 
    calendar: { 
        prevYear: string; 
        prevMonth: string; 
        nextMonth: string; 
        nextYear: string; 
        today: string; 
    }; 
    agenda: { 
        empty: string; 
    }; 
    fileInput: { 
        /** Trigger / inline placeholder. */ 
        placeholder: string; 
        /** aria-label when variant='area' and no explicit label is given. */ 
        uploadFiles: string; 
        /** Default for `dropzoneLabel` when variant='area' and nothing selected. */ 
        dropzoneLabel: string; 
        dropzoneLabelMultiple: string; 
        /** Default for helper text under the trigger ("up to 5MB · max 3"). */ 
        hintUpTo: string; 
        hintMax: string; 
        /** Action labels for the inline browse button. */ 
        browse: string; 
        addMore: string; 
        replace: string; 
        /** Headline when several files are selected: `{count} files selected`. */ 
        filesSelected: string; 
        reject: { 
            size: string; 
            sizeNoLimit: string; 
            type: string; 
            count: string; 
            countNoLimit: string; 
        }; 
    }; 
    banner: { 
        dismiss: string; 
    }; 
    badge: { 
        remove: string; 
    }; 
    avatarGroup: { 
        /** `{count}` placeholder: total users in the group. */ 
        group: string; 
    }; 
    slider: { 
        /** Generic aria-label when no label / ariaLabel is provided. */ 
        aria: string; 
    }; 
    skeleton: { 
        loading: string; 
    }; 
    /** 
     * Strings for the `Table` component family. Phase 1 only ships a small 
     * subset (empty/loading/caption); later phases extend this namespace 
     * with sort, selection, pagination, filter, edit, group, toolbar. 
     */ 
    table: { 
        /** Empty state when `data` is empty and no filter is applied. */ 
        empty: string; 
        /** Empty state when filtering produced zero rows. */ 
        noResults: string; 
        /** Visually hidden caption / aria-label fallback. */ 
        defaultLabel: string; 
        /** SR-only announcement while `loading` is true. */ 
        loading: string; 
        /** Sortable column hints (announced via `aria-sort` + button label). */ 
        sortAscending: string; 
        sortDescending: string; 
        sortNone: string; 
        /** Live region announcement when a column gets sorted. */ 
        sortedBy: string; 
        /** Selection a11y. */ 
        selectAllRows: string; 
        selectRow: string; 
        /** Live region after a row is (de)selected: `{count} selected`. */ 
        selectedCount: string; 
        /** Row expansion controls. */ 
        expandRow: string; 
        collapseRow: string; 
        /** Filter row UX. */ 
        filterPlaceholder: string; 
        clearFilter: string; 
        /** Global search input (Phase 5a · toolbar). */ 
        searchPlaceholder: string; 
        /** Toolbar column-visibility menu (Phase 5b). */ 
        columnVisibility: string; 
        /** Toolbar export menu (Phase 5c). */ 
        export: string; 
        exportCsv: string; 
        exportJson: string; 
        exportClipboard: string; 
        /** Live region after Ctrl/Cmd+C copy of selected rows (Phase 5e). */ 
        copiedRows: string; 
        /** Column resize handle (aria-label). */ 
        resizeColumn: string; 
        /** Column reorder drag handle / announcement. */ 
        reorderColumn: string; 
        /** Live region: `Moved {column} to position {position}`. */ 
        movedColumn: string; 
        /** Pagination controls (used by `<TablePagination>`). */ 
        pagination: { 
            previous: string; 
            next: string; 
            first: string; 
            last: string; 
            /** `Page {current} of {total}` when both numbers are known. */ 
            page: string; 
            rowsPerPage: string; 
            /** Range readout: `{from}-{to} of {total}`. */ 
            range: string; 
            /** Range readout when total is unknown: `{from}-{to}`. */ 
            rangeUnknown: string; 
        }; 
        /** Inline cell editing (Phase 4a). */ 
        edit: { 
            /** Aria-label / tooltip on an editable cell's editor. */ 
            editCell: string; 
            /** Hint shown after entering edit mode (sr-only). */ 
            commitHint: string; 
            /** Generic invalid-value message used when no validator runs. */ 
            invalid: string; 
        }; 
    }; 
} 
 
/** Default locale (English). Serves as the non-breaking fallback. */ 
export const defaultLocale: ModoLocale = { 
    common: { 
        clear: 'Clear', 
        loading: 'Loading', 
        close: 'Close', 
        dismiss: 'Dismiss', 
        remove: 'Remove', 
    }, 
    input: { clear: 'Clear input' }, 
    textarea: { clear: 'Clear textarea' }, 
    select: { 
        empty: 'No results.', 
        clear: 'Clear selection', 
        clearSearch: 'Clear search', 
    }, 
    multiSelect: { 
        clear: 'Clear selection', 
        clearSearch: 'Clear search', 
    }, 
    combobox: { 
        clear: 'Clear', 
        toggleOptions: 'Toggle options', 
    }, 
    numberInput: { 
        increment: 'Increment', 
        decrement: 'Decrement', 
    }, 
    searchInput: { clear: 'Clear search' }, 
    passwordInput: { 
        show: 'Show password', 
        hide: 'Hide password', 
        strength: { 0: '', 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' }, 
    }, 
    dateField: { clear: 'Clear date' }, 
    dateTimeField: { clear: 'Clear datetime' }, 
    dateRangeField: { clear: 'Clear range' }, 
    calendar: { 
        prevYear: 'Previous year', 
        prevMonth: 'Previous month', 
        nextMonth: 'Next month', 
        nextYear: 'Next year', 
        today: 'Go to today', 
    }, 
    agenda: { empty: 'No upcoming events' }, 
    fileInput: { 
        placeholder: 'Click or drop files…', 
        uploadFiles: 'Upload files', 
        dropzoneLabel: 'Drag a file here or click to browse', 
        dropzoneLabelMultiple: 'Drag files here or click to browse', 
        hintUpTo: 'up to {limit}', 
        hintMax: 'max {limit}', 
        browse: 'Browse', 
        addMore: 'Add more', 
        replace: 'Replace', 
        filesSelected: '{count} files selected', 
        reject: { 
            size: 'Too big (max {limit})', 
            sizeNoLimit: 'File too big', 
            type: 'Type not allowed', 
            count: 'Too many files (max {limit})', 
            countNoLimit: 'Too many files', 
        }, 
    }, 
    banner: { dismiss: 'Dismiss' }, 
    badge: { remove: 'Remove' }, 
    avatarGroup: { group: 'Group of {count} users' }, 
    slider: { aria: 'Slider' }, 
    skeleton: { loading: 'Loading' }, 
    table: { 
        empty: 'No data', 
        noResults: 'No results match your filters', 
        defaultLabel: 'Data table', 
        loading: 'Loading rows', 
        sortAscending: 'Sort ascending', 
        sortDescending: 'Sort descending', 
        sortNone: 'Clear sort', 
        sortedBy: 'Sorted by {column} {direction}', 
        selectAllRows: 'Select all rows', 
        selectRow: 'Select row', 
        selectedCount: '{count} selected', 
        expandRow: 'Expand row', 
        collapseRow: 'Collapse row', 
        filterPlaceholder: 'Filter…', 
        clearFilter: 'Clear filter', 
        searchPlaceholder: 'Search…', 
        columnVisibility: 'Columns', 
        export: 'Export', 
        exportCsv: 'Download CSV', 
        copiedRows: '{count} rows copied', 
        exportJson: 'Download JSON', 
        exportClipboard: 'Copy to clipboard', 
        resizeColumn: 'Resize column', 
        reorderColumn: 'Reorder column', 
        movedColumn: 'Moved {column} to position {position}', 
        pagination: { 
            previous: 'Previous page', 
            next: 'Next page', 
            first: 'First page', 
            last: 'Last page', 
            page: 'Page {current} of {total}', 
            rowsPerPage: 'Rows per page', 
            range: '{from}-{to} of {total}', 
            rangeUnknown: '{from}-{to}', 
        }, 
        edit: { 
            editCell: 'Edit cell', 
            commitHint: 'Press Enter to save, Escape to cancel.', 
            invalid: 'Invalid value', 
        }, 
    }, 
}; 
 
/** Deep-partial for consumer overrides. Each leaf string stays optional. */ 
export type DeepPartial<T> = { 
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]; 
}; 
 
export type PartialLocale = DeepPartial<ModoLocale>; 
 
/** Deep-merge `override` into `base`. Non-destructive; returns a new object. */ 
export function mergeLocale(base: ModoLocale, override?: PartialLocale): ModoLocale { 
    if (!override) return base; 
    const out: any = {}; 
    for (const key of Object.keys(base) as (keyof ModoLocale)[]) { 
        const b = (base as any)[key]; 
        const o = (override as any)[key]; 
        if (o === undefined) { 
            out[key] = b; 
        } else if (b && typeof b === 'object' && !Array.isArray(b)) { 
            out[key] = deepMergeObj(b, o); 
        } else { 
            out[key] = o; 
        } 
    } 
    return out as ModoLocale; 
} 
 
function deepMergeObj(base: any, override: any): any { 
    if (!override) return base; 
    const out: any = { ...base }; 
    for (const key of Object.keys(override)) { 
        const b = base[key]; 
        const o = override[key]; 
        if (b && typeof b === 'object' && !Array.isArray(b) && o && typeof o === 'object' && !Array.isArray(o)) { 
            out[key] = deepMergeObj(b, o); 
        } else if (o !== undefined) { 
            out[key] = o; 
        } 
    } 
    return out; 
} 
 
/** 
 * Simple `{name}` interpolator. Values not provided pass through (keeps the 
 * placeholder untouched), so missing data never throws. 
 */ 
export function interpolate(template: string, vars?: Record<string, string | number>): string { 
    if (!template || !vars) return template; 
    return template.replace(/\{(\w+)\}/g, (match, k) => { 
        const v = vars[k]; 
        return v === undefined || v === null ? match : String(v); 
    }); 
} 
 
export const MODO_LOCALE: InjectionKey<Ref<ModoLocale>> = Symbol('modo-locale');
