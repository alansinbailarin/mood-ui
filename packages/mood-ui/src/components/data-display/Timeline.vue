<template>
    <ol :class="['relative flex flex-col', side === 'right' ? 'items-end' : 'items-start']">
        <li
            v-for="(item, idx) in items"
            :key="item.id"
            :class="[
                'relative w-full grid gap-3',
                side === 'right'
                    ? `grid-cols-[1fr_${markerColPx}px]`
                    : `grid-cols-[${markerColPx}px_1fr]`,
            ]"
            :style="side === 'right'
                ? `grid-template-columns: 1fr ${markerColPx}px`
                : `grid-template-columns: ${markerColPx}px 1fr`"
        >
            <!-- Right side first when side='right' -->
            <template v-if="side === 'right'">
                <div :class="['flex flex-col text-right', contentPadding]">
                    <p v-if="item.timestamp" :class="['text-muted-foreground tabular-nums', tsSizeClass]">{{ item.timestamp }}</p>
                    <p :class="['font-semibold text-foreground', titleSizeClass]">{{ item.title }}</p>
                    <p v-if="item.description" :class="['text-muted-foreground', descSizeClass]">{{ item.description }}</p>
                    <slot :name="`item-${item.id}`" :item="item" />
                </div>
            </template>

            <!-- Marker column -->
            <div class="relative flex justify-center">
                <span
                    v-if="idx < items.length - 1"
                    aria-hidden="true"
                    class="absolute top-0 bottom-0 w-px bg-border"
                    :style="`top:${markerSizePx}px`"
                />
                <span
                    :class="[
                        'relative z-10 inline-flex items-center justify-center shrink-0 rounded-full',
                        markerSizeClass,
                        resolveMarkerClasses(item),
                    ]"
                >
                    <component
                        v-if="(item.variant ?? variant) === 'icon' && item.icon"
                        :is="item.icon"
                        :class="iconSizeClass"
                        aria-hidden="true"
                    />
                </span>
            </div>

            <template v-if="side === 'left'">
                <div :class="['flex flex-col', contentPadding]">
                    <p v-if="item.timestamp" :class="['text-muted-foreground tabular-nums', tsSizeClass]">{{ item.timestamp }}</p>
                    <p :class="['font-semibold text-foreground', titleSizeClass]">{{ item.title }}</p>
                    <p v-if="item.description" :class="['text-muted-foreground', descSizeClass]">{{ item.description }}</p>
                    <slot :name="`item-${item.id}`" :item="item" />
                </div>
            </template>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Timeline, TimelineItem } from '../../interfaces/data-display/Timeline.interface';
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Timeline>(), {
    color: 'primary',
    side: 'left',
    variant: 'dot',
});

const resolvedSize = useResolvedSize(() => props.size);
const resolvedColor = useResolvedColor(() => props.color);

const markerSizePx = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 16;
        case 'large':  return 32;
        case 'medium':
        default:       return 24;
    }
});
const markerColPx = computed(() => markerSizePx.value);

const markerSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-4 h-4';
        case 'large':  return 'w-8 h-8';
        case 'medium':
        default:       return 'w-6 h-6';
    }
});

const iconSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-2.5 h-2.5';
        case 'large':  return 'w-4 h-4';
        case 'medium':
        default:       return 'w-3.5 h-3.5';
    }
});

const titleSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-sm';
        case 'large':  return 'text-base';
        case 'medium':
        default:       return 'text-sm';
    }
});

const descSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-xs';
        case 'large':  return 'text-sm';
        case 'medium':
        default:       return 'text-sm';
    }
});

const tsSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[11px]';
        case 'large':  return 'text-sm';
        case 'medium':
        default:       return 'text-xs';
    }
});

const contentPadding = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'pb-4';
        case 'large':  return 'pb-8';
        case 'medium':
        default:       return 'pb-6';
    }
});

function resolveMarkerClasses(item: TimelineItem): string {
    const variant = item.variant ?? props.variant;
    const color = item.color ?? resolvedColor.value;

    const solidByColor: Record<string, string> = {
        default: 'bg-foreground text-background',
        primary: 'bg-primary text-primary-foreground',
        danger:  'bg-destructive text-destructive-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
    };
    const outlineByColor: Record<string, string> = {
        default: 'border-2 border-foreground bg-background',
        primary: 'border-2 border-primary bg-background',
        danger:  'border-2 border-destructive bg-background',
        success: 'border-2 border-success bg-background',
        warning: 'border-2 border-warning bg-background',
    };

    if (variant === 'outline') return outlineByColor[color] ?? outlineByColor.default;
    return solidByColor[color] ?? solidByColor.default;
}
</script>
