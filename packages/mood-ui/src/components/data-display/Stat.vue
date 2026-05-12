<template>
    <div
        :class="[
            'relative flex flex-col',
            cardClasses,
            paddingClasses,
        ]"
    >
        <!-- Header: label + icon -->
        <div class="flex items-start justify-between gap-3">
            <span :class="['font-medium text-muted-foreground leading-none', labelSizeClass]">{{ label }}</span>
            <span
                v-if="icon"
                :class="[
                    'shrink-0 inline-flex items-center justify-center rounded-xl',
                    iconBoxClass,
                    iconColorClasses,
                ]"
            >
                <component :is="icon" :class="iconSizeClass" aria-hidden="true" />
            </span>
        </div>

        <!-- Value -->
        <div :class="['mt-3', icon ? '' : '']">
            <div v-if="loading" :class="['bg-muted animate-pulse rounded-lg', skeletonClass]" />
            <span v-else :class="['font-semibold text-foreground tabular-nums leading-none', valueSizeClass]">
                {{ value }}
            </span>
        </div>

        <!-- Trend + description -->
        <div v-if="trend || description" :class="['flex items-center gap-2 flex-wrap', trendGapClass]">
            <span
                v-if="trend"
                :class="[
                    'inline-flex items-center gap-0.5 font-medium tabular-nums rounded-md px-1.5 py-0.5',
                    trendSizeClass,
                    trendBadgeClasses,
                ]"
            >
                <ArrowUpIcon v-if="trendDirection === 'up'" :class="trendIconClass" />
                <ArrowDownIcon v-else-if="trendDirection === 'down'" :class="trendIconClass" />
                <MinusIcon v-else :class="trendIconClass" />
                {{ trendLabel }}
            </span>
            <span v-if="description" :class="['text-muted-foreground', descSizeClass]">{{ description }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/20/solid';
import type { Stat } from '../../interfaces/data-display/Stat.interface';
import { useResolvedColor, useResolvedSize, useResolvedRadius } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Stat>(), {
    variant: 'plain',
    color: 'default',
    loading: false,
});

const resolvedSize = useResolvedSize(() => props.size);
const resolvedColor = useResolvedColor(() => props.color);
const resolvedRadius = useResolvedRadius(() => (props as any).radius);

const trendDirection = computed<'up' | 'down' | 'neutral'>(() => {
    if (!props.trend) return 'neutral';
    if (props.trend.direction) return props.trend.direction;
    if (props.trend.value > 0) return 'up';
    if (props.trend.value < 0) return 'down';
    return 'neutral';
});

const trendLabel = computed(() => {
    if (!props.trend) return '';
    if (props.trend.label) return props.trend.label;
    const sign = props.trend.value > 0 ? '+' : '';
    return `${sign}${props.trend.value}%`;
});

const radiusClass = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-sm';
        case 'large':  return 'rounded-xl';
        case 'full':   return 'rounded-3xl';
        case 'medium':
        default:       return 'rounded-lg';
    }
});

const cardClasses = computed(() => {
    switch (props.variant) {
        case 'outlined': return `border border-border bg-card ${radiusClass.value} shadow-sm`;
        case 'filled':   return `bg-muted/50 border border-border/60 ${radiusClass.value}`;
        case 'plain':
        default:         return '';
    }
});

const paddingClasses = computed(() => {
    if (props.variant === 'plain') return '';
    switch (resolvedSize.value) {
        case 'small':  return 'p-3.5';
        case 'large':  return 'p-6';
        case 'medium':
        default:       return 'p-5';
    }
});

const labelSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[11px] tracking-wide uppercase';
        case 'large':  return 'text-sm tracking-wide uppercase';
        case 'medium':
        default:       return 'text-xs tracking-wide uppercase';
    }
});

const valueSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-2xl';
        case 'large':  return 'text-4xl';
        case 'medium':
        default:       return 'text-3xl';
    }
});

const trendGapClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'mt-2.5';
        case 'large':  return 'mt-4';
        default:       return 'mt-3';
    }
});

const skeletonClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'h-7 w-20 mt-3';
        case 'large':  return 'h-10 w-32 mt-3';
        default:       return 'h-8 w-24 mt-3';
    }
});

const descSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[11px]';
        case 'large':  return 'text-sm';
        case 'medium':
        default:       return 'text-xs';
    }
});

const trendSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'large':  return 'text-xs';
        default:       return 'text-[11px]';
    }
});

const trendIconClass = computed(() => {
    switch (resolvedSize.value) {
        case 'large':  return 'w-3.5 h-3.5';
        default:       return 'w-3 h-3';
    }
});

const iconBoxClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-7 h-7 rounded-lg';
        case 'large':  return 'w-12 h-12 rounded-xl';
        case 'medium':
        default:       return 'w-9 h-9 rounded-xl';
    }
});

const iconSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-3.5 h-3.5';
        case 'large':  return 'w-6 h-6';
        case 'medium':
        default:       return 'w-4 h-4';
    }
});

const iconColorClasses = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'bg-primary/10 text-primary';
        case 'danger':  return 'bg-destructive/10 text-destructive';
        case 'success': return 'bg-success/10 text-success';
        case 'warning': return 'bg-warning/10 text-warning';
        case 'default':
        default:        return 'bg-muted text-muted-foreground';
    }
});

const trendBadgeClasses = computed(() => {
    if (trendDirection.value === 'up')   return 'bg-success/10 text-success';
    if (trendDirection.value === 'down') return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
});
</script>

