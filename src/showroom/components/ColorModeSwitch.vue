<script setup lang="ts">
/**
 * Three-state segmented switch for color mode (light · system · dark)
 * with an animated sliding indicator. Matches the Tabs / Segmented look.
 */
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline';

import type { ModoTheme } from '../../config/ModoConfig';

const props = withDefaults(defineProps<{
    modelValue: ModoTheme;
    ariaLabel?: string;
}>(), {
    ariaLabel: 'Color mode',
});

const emit = defineEmits<{ 'update:modelValue': [v: ModoTheme] }>();

const options = [
    { value: 'light' as const,  icon: SunIcon,              label: 'Light'  },
    { value: 'system' as const, icon: ComputerDesktopIcon,  label: 'System' },
    { value: 'dark' as const,   icon: MoonIcon,             label: 'Dark'   },
];

const trackEl = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);
const indicatorStyle = ref<Record<string, string>>({ opacity: '0' });
const firstMeasureDone = ref(false);

function setItemRef(el: unknown, idx: number) {
    if (el) itemRefs.value[idx] = el as HTMLElement;
}

function activeIndex(): number {
    const i = options.findIndex((o) => o.value === props.modelValue);
    return i >= 0 ? i : 1;
}

function measure(animated: boolean) {
    const track = trackEl.value;
    const item = itemRefs.value[activeIndex()];
    if (!track || !item) return;

    const trackRect = track.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    indicatorStyle.value = {
        transform: `translateX(${(itemRect.left - trackRect.left).toFixed(2)}px)`,
        width: `${itemRect.width.toFixed(2)}px`,
        height: `${itemRect.height.toFixed(2)}px`,
        opacity: '1',
        transition: animated
            ? 'transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1)'
            : 'none',
    };
    firstMeasureDone.value = true;
}

let ro: ResizeObserver | null = null;
onMounted(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => measure(false)));
    if (typeof ResizeObserver !== 'undefined' && trackEl.value) {
        ro = new ResizeObserver(() => measure(false));
        ro.observe(trackEl.value);
    }
    window.addEventListener('resize', onResize);
});
onBeforeUnmount(() => {
    ro?.disconnect();
    window.removeEventListener('resize', onResize);
});
function onResize() { measure(false); }

watch(() => props.modelValue, () => {
    nextTick(() => measure(firstMeasureDone.value));
});

function pick(v: ModoTheme) {
    emit('update:modelValue', v);
}
</script>

<template>
    <div
        ref="trackEl"
        role="radiogroup"
        :aria-label="ariaLabel"
        class="relative inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-0.5"
    >
        <span
            class="absolute pointer-events-none rounded-full bg-card shadow-sm border border-border/60"
            :style="indicatorStyle"
        />
        <button
            v-for="(opt, i) in options"
            :key="opt.value"
            :ref="(el) => setItemRef(el, i)"
            type="button"
            role="radio"
            :aria-checked="modelValue === opt.value"
            :aria-label="opt.label"
            class="relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground transition-colors duration-150"
            :class="modelValue === opt.value ? 'text-foreground' : ''"
            @click="pick(opt.value)"
        >
            <component :is="opt.icon" class="w-4 h-4" />
        </button>
    </div>
</template>
