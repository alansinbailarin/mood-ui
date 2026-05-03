<template> 
    <nav 
        :aria-label="ariaLabel" 
        :aria-disabled="disabled || undefined" 
        class="modo-pagination inline-flex items-center gap-1" 
    > 
        <!-- First --> 
        <Button 
            v-if="showFirstLast" 
            :variant="edgeVariant" 
            :color="resolvedColor" 
            :size="resolvedSize" 
            :radius="resolvedRadius" 
            :icon="ChevronDoubleLeftIcon" 
            ariaLabel="First page" 
            :disabled="disabled || isFirst" 
            @click="goTo(1)" 
        /> 
 
        <!-- Prev --> 
        <Button 
            v-if="showPrevNext" 
            :variant="edgeVariant" 
            :color="resolvedColor" 
            :size="resolvedSize" 
            :radius="resolvedRadius" 
            :icon="ChevronLeftIcon" 
            ariaLabel="Previous page" 
            :disabled="disabled || isFirst" 
            @click="goTo(modelValue - 1)" 
        /> 
 
        <!-- Page numbers --> 
        <template v-for="(token, idx) in pageTokens" :key="idx"> 
            <span 
                v-if="token === 'ellipsis'" 
                class="px-2 text-muted-foreground select-none" 
                aria-hidden="true" 
            >…</span> 
            <Button 
                v-else 
                :variant="token === modelValue ? 'normal' : 'text'" 
                :color="token === modelValue ? resolvedColor : 'default'" 
                :size="resolvedSize" 
                :radius="resolvedRadius" 
                :label="String(token)" 
                :ariaLabel="`Page ${token}`" 
                :aria-current="token === modelValue ? 'page' : undefined" 
                :disabled="disabled" 
                class="modo-pag-page" 
                :class="token === modelValue ? 'modo-pag-active' : ''" 
                @click="goTo(token)" 
            /> 
        </template> 
 
        <!-- Next --> 
        <Button 
            v-if="showPrevNext" 
            :variant="edgeVariant" 
            :color="resolvedColor" 
            :size="resolvedSize" 
            :radius="resolvedRadius" 
            :icon="ChevronRightIcon" 
            ariaLabel="Next page" 
            :disabled="disabled || isLast" 
            @click="goTo(modelValue + 1)" 
        /> 
 
        <!-- Last --> 
        <Button 
            v-if="showFirstLast" 
            :variant="edgeVariant" 
            :color="resolvedColor" 
            :size="resolvedSize" 
            :radius="resolvedRadius" 
            :icon="ChevronDoubleRightIcon" 
            ariaLabel="Last page" 
            :disabled="disabled || isLast" 
            @click="goTo(pageCount)" 
        /> 
    </nav> 
</template> 
 
<script setup lang="ts"> 
import { computed } from 'vue'; 
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ChevronDoubleLeftIcon, 
    ChevronDoubleRightIcon, 
} from '@heroicons/vue/24/outline'; 
import Button from '../forms/Button.vue'; 
import { useResolvedColor, useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig'; 
import type { Pagination, PaginationEmits } from '../../interfaces/navigation/Pagination.interface'; 
 
const props = withDefaults(defineProps<Pagination>(), { 
    siblingCount: 1, 
    boundaryCount: 1, 
    showFirstLast: true, 
    showPrevNext: true, 
    color: 'primary', 
    disabled: false, 
    ariaLabel: 'Pagination', 
}); 
 
const emit = defineEmits<PaginationEmits>(); 
 
const resolvedColor = useResolvedColor(() => props.color); 
const resolvedRadius = useResolvedRadius(() => props.radius); 
const resolvedSize = useResolvedSize(() => props.size); 
 
const isFirst = computed(() => props.modelValue <= 1); 
const isLast = computed(() => props.modelValue >= props.pageCount); 
 
/** Edge buttons (first/prev/next/last) stay neutral so the active page 
 *  number is the only colored item — better focal point. */ 
const edgeVariant = computed<'text'>(() => 'text'); 
 
/* -------------------------------------------------------------------- */ 
/*  Page token computation                                              */ 
/*                                                                       */ 
/*  Output: array of `number | 'ellipsis'`. Standard sibling/boundary    */ 
/*  algorithm — same one used by MUI/Mantine.                            */ 
/* -------------------------------------------------------------------- */ 
const pageTokens = computed<(number | 'ellipsis')[]>(() => { 
    const total = Math.max(1, props.pageCount); 
    const current = Math.min(Math.max(1, props.modelValue), total); 
    const siblings = Math.max(0, props.siblingCount); 
    const boundaries = Math.max(0, props.boundaryCount); 
 
    // If the gap is small enough, just show all pages. 
    const totalNumbers = boundaries * 2 + siblings * 2 + 3; // first..siblings..current..siblings..last + 2 ellipsis slots 
    if (total <= totalNumbers) { 
        return range(1, total); 
    } 
 
    const startPages = range(1, Math.min(boundaries, total)); 
    const endPages = range(Math.max(total - boundaries + 1, boundaries + 1), total); 
 
    const siblingsStart = Math.max( 
        Math.min(current - siblings, total - boundaries - siblings * 2 - 1), 
        boundaries + 2, 
    ); 
    const siblingsEnd = Math.min( 
        Math.max(current + siblings, boundaries + siblings * 2 + 2), 
        endPages.length > 0 ? endPages[0] - 2 : total - 1, 
    ); 
 
    const tokens: (number | 'ellipsis')[] = [...startPages]; 
 
    if (siblingsStart > boundaries + 2) { 
        tokens.push('ellipsis'); 
    } else if (boundaries + 1 < total - boundaries) { 
        tokens.push(boundaries + 1); 
    } 
 
    tokens.push(...range(siblingsStart, siblingsEnd)); 
 
    if (siblingsEnd < total - boundaries - 1) { 
        tokens.push('ellipsis'); 
    } else if (total - boundaries > boundaries) { 
        tokens.push(total - boundaries); 
    } 
 
    tokens.push(...endPages); 
 
    // Dedupe (defensive — algorithm above can overlap on small ranges). 
    const seen = new Set<number | 'ellipsis'>(); 
    return tokens.filter((t) => { 
        if (t === 'ellipsis') return true; 
        if (seen.has(t)) return false; 
        seen.add(t); 
        return true; 
    }); 
}); 
 
function range(start: number, end: number): number[] { 
    const out: number[] = []; 
    for (let i = start; i <= end; i++) out.push(i); 
    return out; 
} 
 
function goTo(page: number) { 
    if (props.disabled) return; 
    const next = Math.min(Math.max(1, page), props.pageCount); 
    if (next === props.modelValue) return; 
    emit('update:modelValue', next); 
    emit('change', next); 
} 
</script> 
 
<style scoped> 
/* Smooth crossfade between active and inactive page buttons. 
 * The transition is on transform so the active page does a subtle pop and 
 * neighbouring pages settle back into place when the user navigates. */ 
.modo-pag-page { 
    transition: 
        transform var(--motion-duration-base, 220ms) var(--motion-ease-emphasized, cubic-bezier(0.2, 0, 0, 1)), 
        background-color var(--motion-duration-base, 220ms) var(--motion-ease-standard, cubic-bezier(0.2, 0, 0, 1)), 
        color var(--motion-duration-base, 220ms) var(--motion-ease-standard, cubic-bezier(0.2, 0, 0, 1)); 
    will-change: transform; 
} 
 
.modo-pag-active { 
    transform: scale(1.12); 
    animation: modo-pag-pop var(--motion-duration-slow, 320ms) var(--motion-ease-emphasized, cubic-bezier(0.2, 0, 0, 1)) both; 
} 
 
@keyframes modo-pag-pop { 
    0%   { transform: scale(0.85); } 
    55%  { transform: scale(1.18); } 
    100% { transform: scale(1.12); } 
} 
 
@media (prefers-reduced-motion: reduce) { 
    .modo-pag-page, 
    .modo-pag-active { 
        transition: none; 
        animation: none; 
        transform: none; 
    } 
} 
</style>
