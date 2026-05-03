<script setup lang="ts"> 
/** 
 * TablePagination · standalone footer for `<Table>`. 
 * 
 * Layout (LTR): 
 *   [ rows-per-page Select ]   [ range readout ]   [ « ‹ › » ] 
 * 
 * Designed to be embedded inside `<Table>` automatically (when the host 
 * passes `pagination`) or used standalone for custom layouts. Emits a 
 * single `update:pagination` event with the *full* next state so v-model 
 * stays simple. 
 * 
 * A11y: 
 *  - Wrapped in `<nav role="navigation">` with `aria-label`. 
 *  - Each button gets a localized `aria-label`; current page is announced 
 *    via `aria-current="page"` on the page readout. 
 *  - First/Last buttons are hidden when `hideEdgeButtons=true`. 
 */ 
import { computed } from 'vue'; 
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ChevronDoubleLeftIcon, 
    ChevronDoubleRightIcon, 
} from '@heroicons/vue/20/solid'; 
import type { TablePagination as TablePaginationProps } from '../../../interfaces/data-display/table/TablePagination.interface'; 
import type { TablePaginationState } from '../../../interfaces/data-display/table/Table.interface'; 
import { useModoLocale, useResolvedSize } from '../../../composables/useModoConfig'; 
import { interpolate } from '../../../config/ModoLocale'; 
import Select from '../../forms/Select.vue'; 
import Button from '../../forms/Button.vue'; 
 
const props = withDefaults(defineProps<TablePaginationProps>(), { 
    pageSizeOptions: () => [10, 25, 50, 100], 
    hidePageSize: false, 
    hideEdgeButtons: false, 
    disabled: false, 
}); 
 
const resolvedSize = useResolvedSize(() => props.size); 
 
const emit = defineEmits<{ 
    'update:pagination': [next: TablePaginationState]; 
}>(); 
 
const loc = useModoLocale(); 
 
const total = computed(() => props.pagination.total ?? 0); 
const pageSize = computed(() => Math.max(1, props.pagination.pageSize || 1)); 
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value))); 
 
const range = computed<[number, number]>(() => { 
    if (total.value === 0) return [0, 0]; 
    const from = (props.pagination.page - 1) * pageSize.value + 1; 
    const to = Math.min(props.pagination.page * pageSize.value, total.value); 
    return [from, to]; 
}); 
 
const rangeText = computed(() => { 
    if (props.pagination.total == null) { 
        return interpolate(loc.value.table.pagination.rangeUnknown, { 
            from: range.value[0], 
            to: range.value[1], 
        }); 
    } 
    return interpolate(loc.value.table.pagination.range, { 
        from: range.value[0], 
        to: range.value[1], 
        total: total.value, 
    }); 
}); 
 
const pageText = computed(() => 
    interpolate(loc.value.table.pagination.page, { 
        current: props.pagination.page, 
        total: pageCount.value, 
    }), 
); 
 
const isFirst = computed(() => props.pagination.page <= 1); 
const isLast = computed(() => props.pagination.page >= pageCount.value); 
 
function emitNext(partial: Partial<TablePaginationState>) { 
    emit('update:pagination', { ...props.pagination, ...partial }); 
} 
 
function go(to: number) { 
    if (props.disabled) return; 
    const clamped = Math.min(Math.max(1, to), pageCount.value); 
    if (clamped === props.pagination.page) return; 
    emitNext({ page: clamped }); 
} 
 
function onPageSizeChange(next: number) { 
    if (props.disabled) return; 
    // Reset to page 1 so the user always sees the top of the new slice. 
    emitNext({ page: 1, pageSize: Number(next) }); 
} 
 
const pageSizeSelectOptions = computed(() => 
    props.pageSizeOptions.map((n) => ({ value: n, label: String(n) })), 
); 
 
/* ---------- Sizing tokens ---------- */ 
const textSizeClass = computed(() => { 
    if (resolvedSize.value === 'small') return 'text-caption'; 
    if (resolvedSize.value === 'large') return 'text-body-lg'; 
    return 'text-body'; 
}); 
 
/** Map pagination size to Button size. */ 
const btnSize = computed<'xs' | 'small' | 'medium'>(() => { 
    if (resolvedSize.value === 'small') return 'xs'; 
    if (resolvedSize.value === 'large') return 'medium'; 
    return 'small'; 
}); 
</script> 
 
<template> 
    <nav 
        role="navigation" 
        :aria-label="ariaLabel ?? 'Pagination'" 
        :class="[ 
            'flex flex-wrap items-center gap-3 px-3 py-2', 
            'bg-card border-t border-border', 
            textSizeClass, 
        ]" 
    > 
        <!-- Rows per page --> 
        <div v-if="!hidePageSize" class="flex items-center gap-2"> 
            <span class="text-muted-foreground">{{ loc.table.pagination.rowsPerPage }}</span> 
            <Select 
                :model-value="pageSize" 
                :options="pageSizeSelectOptions" 
                :disabled="disabled" 
                size="small" 
                aria-label="Rows per page" 
                @update:model-value="(v: any) => onPageSizeChange(Number(v))" 
            /> 
        </div> 
 
        <!-- Range readout (push to right) --> 
        <div class="ml-auto flex items-center gap-3"> 
            <span class="text-muted-foreground tabular-nums">{{ rangeText }}</span> 
 
            <!-- Buttons --> 
            <div class="flex items-center gap-1"> 
                <Button 
                    v-if="!hideEdgeButtons" 
                    variant="outline" 
                    :size="btnSize" 
                    :icon="ChevronDoubleLeftIcon" 
                    :ariaLabel="loc.table.pagination.first" 
                    :disabled="disabled || isFirst" 
                    @click="go(1)" 
                /> 
                <Button 
                    variant="outline" 
                    :size="btnSize" 
                    :icon="ChevronLeftIcon" 
                    :ariaLabel="loc.table.pagination.previous" 
                    :disabled="disabled || isFirst" 
                    @click="go(pagination.page - 1)" 
                /> 
 
                <span 
                    class="px-2 text-muted-foreground tabular-nums" 
                    aria-current="page" 
                >{{ pageText }}</span> 
 
                <Button 
                    variant="outline" 
                    :size="btnSize" 
                    :icon="ChevronRightIcon" 
                    :ariaLabel="loc.table.pagination.next" 
                    :disabled="disabled || isLast" 
                    @click="go(pagination.page + 1)" 
                /> 
                <Button 
                    v-if="!hideEdgeButtons" 
                    variant="outline" 
                    :size="btnSize" 
                    :icon="ChevronDoubleRightIcon" 
                    :ariaLabel="loc.table.pagination.last" 
                    :disabled="disabled || isLast" 
                    @click="go(pageCount)" 
                /> 
            </div> 
        </div> 
    </nav> 
</template>
