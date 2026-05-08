<template>
    <div
        :class="[
            'modo-toast pointer-events-auto relative flex items-start gap-3 p-3.5 shadow-md',
            colorClasses,
            radiusClasses,
            'min-w-72 max-w-sm w-full pb-4',
        ]"
        role="status"
        aria-live="polite"
        @mouseenter="$emit('pointer-enter')"
        @mouseleave="$emit('pointer-leave')"
    >
        <!-- Icon badge -->
        <div
            v-if="!entry.hideIcon"
            :class="[
                'shrink-0 flex items-center justify-center w-8 h-8 rounded-full',
                iconBadgeClasses,
                iconTextClasses,
            ]"
        >
            <component
                :is="resolvedIcon"
                class="w-5 h-5"
                aria-hidden="true"
            />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pt-0.5">
            <p v-if="entry.title" :class="['text-[13px] font-semibold leading-snug break-words', titleColorClasses]">
                {{ entry.title }}
            </p>
            <p
                v-if="entry.description"
                :class="[
                    entry.title ? 'mt-0.5' : '',
                    'text-[13px] leading-snug break-words',
                    descriptionColorClasses,
                ]"
            >
                {{ entry.description }}
            </p>

            <div v-if="entry.action" class="mt-2">
                <button
                    type="button"
                    :class="['text-xs font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:underline transition-colors', actionColorClasses]"
                    @click="onAction"
                >
                    {{ entry.action.label }}
                </button>
            </div>
        </div>

        <!-- Dismiss -->
        <button
            v-if="entry.dismissable"
            type="button"
            :class="[
                'shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md',
                'transition-colors duration-fast ease-standard',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                dismissClasses,
            ]"
            aria-label="Dismiss notification"
            @click="$emit('dismiss')"
        >
            <XMarkIcon class="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <!-- Bottom progress bar (auto-dismiss countdown) -->
        <div
            v-if="entry.duration > 0"
            class="absolute left-2 right-2 bottom-1.5 h-0.5 rounded-full overflow-hidden"
            :class="trackClasses"
        >
            <div
                class="h-full rounded-full origin-left"
                :class="barClasses"
                :style="progressStyle"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import type { ToastEntry } from '../../interfaces/feedback/Toast.interface';
import { useResolvedRadius } from '../../composables/useModoConfig';

const props = defineProps<{
    entry: ToastEntry;
    /** Time elapsed in ms since push (driven by the container). */
    elapsed: number;
    /** Whether the auto-dismiss timer is currently paused. */
    paused: boolean;
}>();

const emit = defineEmits<{
    dismiss: [];
    'pointer-enter': [];
    'pointer-leave': [];
}>();

const resolvedRadius = useResolvedRadius(() => props.entry.radius);

const radiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded-sm';
        case 'large':  return 'rounded-xl';
        case 'full':   return 'rounded-2xl';
        case 'medium':
        default:       return 'rounded-lg';
    }
});

const resolvedIcon = computed(() => {
    if (props.entry.icon) return props.entry.icon;
    switch (props.entry.color) {
        case 'success': return CheckCircleIcon;
        case 'warning': return ExclamationTriangleIcon;
        case 'danger':  return XCircleIcon;
        case 'info':
        default:        return InformationCircleIcon;
    }
});

/* ── Card background & border ── */
const colorClasses = computed(() => {
    const { color, variant } = props.entry;
    const map: Record<string, Record<string, string>> = {
        info: {
            filled:  'bg-info text-info-foreground',
            subtle:  'bg-card border border-border/80',
            outline: 'bg-card border-2 border-info/40',
        },
        success: {
            filled:  'bg-success text-success-foreground',
            subtle:  'bg-card border border-border/80',
            outline: 'bg-card border-2 border-success/40',
        },
        warning: {
            filled:  'bg-warning text-warning-foreground',
            subtle:  'bg-card border border-border/80',
            outline: 'bg-card border-2 border-warning/40',
        },
        danger: {
            filled:  'bg-destructive text-destructive-foreground',
            subtle:  'bg-card border border-border/80',
            outline: 'bg-card border-2 border-destructive/40',
        },
    };
    return map[color][variant];
});

/* ── Icon container — sets currentColor for SVG ring + icon ── */
const iconTextClasses = computed(() => {
    if (props.entry.variant === 'filled') return 'text-current/90';
    const map: Record<string, string> = {
        info:    'text-info',
        success: 'text-success',
        warning: 'text-warning',
        danger:  'text-destructive',
    };
    return map[props.entry.color];
});

/* ── Icon badge background ── */
const iconBadgeClasses = computed(() => {
    if (props.entry.variant === 'filled') return 'bg-current/15';
    const map: Record<string, string> = {
        info:    'bg-info/10',
        success: 'bg-success/10',
        warning: 'bg-warning/10',
        danger:  'bg-destructive/10',
    };
    return map[props.entry.color];
});

/* ── Text ── */
const titleColorClasses = computed(() =>
    props.entry.variant === 'filled' ? '' : 'text-foreground',
);

const descriptionColorClasses = computed(() =>
    props.entry.variant === 'filled' ? 'opacity-85' : 'text-muted-foreground',
);

const actionColorClasses = computed(() => {
    if (props.entry.variant === 'filled') return 'text-current/90 hover:text-current';
    const map: Record<string, string> = {
        info:    'text-info',
        success: 'text-success',
        warning: 'text-warning',
        danger:  'text-destructive',
    };
    return map[props.entry.color];
});

const dismissClasses = computed(() =>
    props.entry.variant === 'filled'
        ? 'text-current/70 hover:text-current hover:bg-current/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
);

/* ── Bottom progress bar ── */
const trackClasses = computed(() => {
    if (props.entry.variant === 'filled') return 'bg-current/20';
    const map: Record<string, string> = {
        info:    'bg-info/15',
        success: 'bg-success/15',
        warning: 'bg-warning/15',
        danger:  'bg-destructive/15',
    };
    return map[props.entry.color];
});

const barClasses = computed(() => {
    if (props.entry.variant === 'filled') return 'bg-current/60';
    const map: Record<string, string> = {
        info:    'bg-info/70',
        success: 'bg-success/70',
        warning: 'bg-warning/70',
        danger:  'bg-destructive/70',
    };
    return map[props.entry.color];
});

const progressStyle = computed(() => {
    const total = props.entry.duration;
    if (!total) return { transform: 'scaleX(1)' };
    const remaining = Math.max(0, total - props.elapsed) / total;
    return {
        transform: `scaleX(${remaining})`,
        transition: props.paused ? 'none' : 'transform 100ms linear',
    };
});

function onAction() {
    const action = props.entry.action;
    if (!action) return;
    const close = () => emit('dismiss');
    action.onClick?.(close);
    if (!action.keepOpen) close();
}
</script>

<style scoped>
@media (prefers-reduced-motion: reduce) {
    .modo-toast {
        transition: none !important;
    }
}
</style>

