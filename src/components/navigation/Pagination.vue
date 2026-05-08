<template>
    <nav
        :aria-label="ariaLabel"
        :aria-disabled="disabled || undefined"
        class="modo-pagination inline-flex items-center gap-0.5"
    >
        <!-- First -->
        <Button
            v-if="showFirstLast"
            variant="text"
            color="default"
            :size="resolvedSize"
            :radius="resolvedRadius"
            :icon="ChevronDoubleLeftIcon"
            aria-label="First page"
            :disabled="disabled || isFirst"
            class="!text-muted-foreground hover:!text-foreground"
            @click="goTo(1)"
        />

        <!-- Prev -->
        <Button
            v-if="showPrevNext"
            variant="text"
            color="default"
            :size="resolvedSize"
            :radius="resolvedRadius"
            :icon="ChevronLeftIcon"
            aria-label="Previous page"
            :disabled="disabled || isFirst"
            class="!text-muted-foreground hover:!text-foreground"
            @click="goTo(modelValue - 1)"
        />

        <!-- Page numbers -->
        <template v-for="(token, idx) in pageTokens" :key="idx">
            <span
                v-if="token === 'ellipsis'"
                :class="[pageBtnBase, 'text-muted-foreground select-none pointer-events-none']"
                aria-hidden="true"
            >…</span>
            <Button
                v-else
                :variant="token === modelValue ? 'normal' : 'text'"
                :color="token === modelValue ? resolvedColor : 'default'"
                :size="resolvedSize"
                :radius="resolvedRadius"
                :label="String(token)"
                :aria-label="`Page ${token}`"
                :aria-current="token === modelValue ? 'page' : undefined"
                :disabled="disabled"
                :class="token !== modelValue ? '!text-muted-foreground hover:!text-foreground' : ''"
                @click="goTo(token as number)"
            />
        </template>

        <!-- Next -->
        <Button
            v-if="showPrevNext"
            variant="text"
            color="default"
            :size="resolvedSize"
            :radius="resolvedRadius"
            :icon="ChevronRightIcon"
            aria-label="Next page"
            :disabled="disabled || isLast"
            class="!text-muted-foreground hover:!text-foreground"
            @click="goTo(modelValue + 1)"
        />

        <!-- Last -->
        <Button
            v-if="showFirstLast"
            variant="text"
            color="default"
            :size="resolvedSize"
            :radius="resolvedRadius"
            :icon="ChevronDoubleRightIcon"
            aria-label="Last page"
            :disabled="disabled || isLast"
            class="!text-muted-foreground hover:!text-foreground"
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

/* pageBtnBase is still used for the ellipsis span */
const pageBtnBase = 'inline-flex items-center justify-center font-medium outline-none';

/* -------------------------------------------------------------------- */
/*  Page token computation                                               */
/*                                                                       */
/*  Output: array of `number | 'ellipsis'`. Standard sibling/boundary   */
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

