<template>
    <ol
        :class="[
            'flex',
            orientation === 'vertical' ? 'flex-col gap-0' : 'flex-row items-start gap-0 w-full',
        ]"
        :aria-label="'Stepper'"
    >
        <li
            v-for="(step, idx) in steps"
            :key="step.id"
            :class="[
                'relative flex',
                orientation === 'vertical'
                    ? 'flex-row items-start gap-3'
                    : 'flex-col items-center flex-1',
                step.disabled ? 'opacity-50' : '',
            ]"
            :aria-current="resolveState(step, idx) === 'active' ? 'step' : undefined"
        >
            <!-- Connector (line between steps) -->
            <span
                v-if="variant !== 'progress' && idx < steps.length - 1"
                aria-hidden="true"
                class="absolute pointer-events-none"
                :style="orientation === 'vertical'
                    ? `left:${dotHalfPx}px;top:${dotSizePx}px;height:calc(100% - ${dotSizePx}px);width:1px`
                    : `top:${dotHalfPx}px;left:calc(50% + ${dotHalfPx}px);width:calc(100% - ${dotSizePx}px);height:1px`"
            >
                <span
                    class="block w-full h-full transition-colors"
                    :class="resolveState(step, idx) === 'completed' || resolveState(steps[idx + 1], idx + 1) !== 'pending'
                        ? completedConnector
                        : 'bg-border'"
                />
            </span>

            <!-- Indicator -->
            <component
                :is="clickable && !step.disabled ? 'button' : 'div'"
                :type="clickable && !step.disabled ? 'button' : undefined"
                :tabindex="clickable && !step.disabled ? 0 : undefined"
                :aria-label="`${step.label}${step.description ? ': ' + step.description : ''}`"
                :class="[
                    'relative z-10 inline-flex items-center justify-center font-semibold transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    focusRingClass,
                    indicatorSizeClasses,
                    indicatorRadiusClass,
                    indicatorStateClasses(step, idx),
                    clickable && !step.disabled ? 'cursor-pointer' : '',
                ]"
                @click="onStepClick(step, idx)"
            >
                <component
                    :is="step.icon"
                    v-if="step.icon && resolveState(step, idx) !== 'completed'"
                    :class="iconSizeClasses"
                    aria-hidden="true"
                />
                <CheckIcon
                    v-else-if="resolveState(step, idx) === 'completed'"
                    :class="iconSizeClasses"
                    aria-hidden="true"
                />
                <ExclamationTriangleIcon
                    v-else-if="resolveState(step, idx) === 'error'"
                    :class="iconSizeClasses"
                    aria-hidden="true"
                />
                <span v-else-if="variant === 'numbered'">{{ idx + 1 }}</span>
                <!-- dots variant: render empty (background dot) -->
            </component>

            <!-- Labels -->
            <div
                v-if="variant !== 'dots' && (step.label || step.description)"
                :class="[
                    'flex flex-col gap-0.5',
                    orientation === 'vertical'
                        ? 'pt-0.5 pb-6 last:pb-0'
                        : 'mt-2 text-center px-1',
                ]"
            >
                <span :class="['font-medium', labelSizeClass, resolveState(step, idx) === 'active' ? 'text-foreground' : 'text-muted-foreground']">
                    {{ step.label }}
                </span>
                <span v-if="step.description" :class="['text-muted-foreground', descSizeClass]">
                    {{ step.description }}
                </span>
            </div>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid';
import type { Stepper, StepperStep } from '../../interfaces/navigation/Stepper.interface';
import { useResolvedColor, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Stepper>(), {
    current: 0,
    variant: 'numbered',
    orientation: 'horizontal',
    color: 'primary',
    clickable: false,
});

const emit = defineEmits<{
    'step-click': [step: StepperStep, index: number];
}>();

const resolvedSize = useResolvedSize(() => props.size);
const resolvedColor = useResolvedColor(() => props.color);

function resolveState(step: StepperStep | undefined, idx: number): 'pending' | 'active' | 'completed' | 'error' {
    if (!step) return 'pending';
    if (step.state) return step.state;
    if (idx < props.current) return 'completed';
    if (idx === props.current) return 'active';
    return 'pending';
}

function onStepClick(step: StepperStep, idx: number) {
    if (!props.clickable || step.disabled) return;
    emit('step-click', step, idx);
}

const indicatorSizePx = computed(() => {
    if (props.variant === 'dots') {
        switch (resolvedSize.value) {
            case 'small':  return 8;
            case 'large':  return 14;
            default:       return 10;
        }
    }
    switch (resolvedSize.value) {
        case 'small':  return 24;
        case 'large':  return 40;
        default:       return 32;
    }
});

const dotSizePx = computed(() => indicatorSizePx.value);
const dotHalfPx = computed(() => Math.floor(indicatorSizePx.value / 2));

const indicatorSizeClasses = computed(() => {
    if (props.variant === 'dots') {
        switch (resolvedSize.value) {
            case 'small':  return 'w-2 h-2 text-[0px]';
            case 'large':  return 'w-3.5 h-3.5 text-[0px]';
            default:       return 'w-2.5 h-2.5 text-[0px]';
        }
    }
    switch (resolvedSize.value) {
        case 'small':  return 'w-6 h-6 text-xs';
        case 'large':  return 'w-10 h-10 text-base';
        default:       return 'w-8 h-8 text-sm';
    }
});

const iconSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-3 h-3';
        case 'large':  return 'w-5 h-5';
        default:       return 'w-4 h-4';
    }
});

const labelSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-xs';
        case 'large':  return 'text-base';
        default:       return 'text-sm';
    }
});

const descSizeClass = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-[10px]';
        case 'large':  return 'text-sm';
        default:       return 'text-xs';
    }
});

const indicatorRadiusClass = computed(() => 'rounded-full');

function indicatorStateClasses(step: StepperStep, idx: number): string {
    const state = resolveState(step, idx);
    const c = resolvedColor.value;
    if (state === 'completed') {
        switch (c) {
            case 'primary': return 'bg-primary text-primary-foreground';
            case 'danger':  return 'bg-destructive text-destructive-foreground';
            case 'success': return 'bg-success text-success-foreground';
            case 'warning': return 'bg-warning text-warning-foreground';
            default:        return 'bg-foreground text-background';
        }
    }
    if (state === 'active') {
        switch (c) {
            case 'primary': return 'bg-primary text-primary-foreground ring-4 ring-primary/20';
            case 'danger':  return 'bg-destructive text-destructive-foreground ring-4 ring-destructive/20';
            case 'success': return 'bg-success text-success-foreground ring-4 ring-success/20';
            case 'warning': return 'bg-warning text-warning-foreground ring-4 ring-warning/20';
            default:        return 'bg-foreground text-background ring-4 ring-foreground/15';
        }
    }
    if (state === 'error') {
        return 'bg-destructive text-destructive-foreground';
    }
    return 'bg-muted text-muted-foreground border border-border';
}

const completedConnector = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'bg-primary';
        case 'danger':  return 'bg-destructive';
        case 'success': return 'bg-success';
        case 'warning': return 'bg-warning';
        default:        return 'bg-foreground';
    }
});

const focusRingClass = computed(() => {
    switch (resolvedColor.value) {
        case 'primary': return 'focus-visible:ring-primary';
        case 'danger':  return 'focus-visible:ring-destructive';
        case 'success': return 'focus-visible:ring-success';
        case 'warning': return 'focus-visible:ring-warning';
        default:        return 'focus-visible:ring-foreground/30';
    }
});
</script>
