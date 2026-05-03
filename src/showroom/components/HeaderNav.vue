<script setup lang="ts">
/**
 * Top-of-page nav showing the main showroom sections as pill tabs,
 * with an animated sliding indicator like the Tabs component.
 *
 * Clicking a tab routes to the first entry of its category.
 */
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';

import { showroomNav } from '../registry';
import { useShowroomI18n, type ShowroomLocale } from '../composables/useShowroomI18n';

const props = defineProps<{
    /** Active route id (so we can highlight the section it belongs to). */
    activeId: string;
    /** Showroom locale for tab labels. */
    locale: ShowroomLocale;
}>();

const emit = defineEmits<{ navigate: [id: string] }>();

const t = useShowroomI18n(() => props.locale);

interface Tab { key: string; label: string; entryId: string; categoryIds: string[]; }

const tabs = computed<Tab[]>(() => {
    const findFirst = (catId: string) =>
        showroomNav.find((c) => c.id === catId)?.entries[0]?.id ?? '';

    // First component category that exists ('forms' or whatever's there).
    const componentsCat = showroomNav.find(
        (c) => !['getting-started', 'docs', 'templates', 'theme-studio'].includes(c.id),
    );
    const componentEntryId = componentsCat?.entries[0]?.id ?? 'button';

    return [
        {
            key: 'components',
            label: t.value.components,
            entryId: componentEntryId,
            categoryIds: showroomNav
                .filter((c) => !['getting-started', 'docs', 'templates', 'theme-studio'].includes(c.id))
                .map((c) => c.id),
        },
        {
            key: 'templates',
            label: t.value.templates,
            entryId: findFirst('templates'),
            categoryIds: ['templates'],
        },
        {
            key: 'theme-studio',
            label: t.value.themeStudio,
            entryId: findFirst('theme-studio'),
            categoryIds: ['theme-studio'],
        },
        {
            key: 'docs',
            label: t.value.docs,
            entryId: findFirst('docs'),
            categoryIds: ['docs'],
        },
    ].filter((tab) => tab.entryId);
});

/** Map active route id → owning tab key (so the indicator follows). */
const activeTabKey = computed(() => {
    for (const tab of tabs.value) {
        for (const catId of tab.categoryIds) {
            const cat = showroomNav.find((c) => c.id === catId);
            if (cat?.entries.some((e) => e.id === props.activeId)) return tab.key;
        }
    }
    return null;
});

// ── Sliding indicator ────────────────────────────────────────────────────────
const trackEl = ref<HTMLElement | null>(null);
const tabRefs = ref<Record<string, HTMLElement>>({});
const indicatorStyle = ref<Record<string, string>>({ opacity: '0' });
let firstDone = false;

function setTabRef(key: string, el: unknown) {
    if (el) tabRefs.value[key] = el as HTMLElement;
}

function measure(animated: boolean) {
    const track = trackEl.value;
    const key = activeTabKey.value;
    const item = key ? tabRefs.value[key] : null;
    if (!track || !item) {
        indicatorStyle.value = { opacity: '0' };
        return;
    }
    const trackRect = track.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    indicatorStyle.value = {
        transform: `translateX(${(itemRect.left - trackRect.left).toFixed(2)}px)`,
        top: `${(itemRect.top - trackRect.top).toFixed(2)}px`,
        width: `${itemRect.width.toFixed(2)}px`,
        height: `${itemRect.height.toFixed(2)}px`,
        opacity: '1',
        transition: animated
            ? 'transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1)'
            : 'none',
    };
    firstDone = true;
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

watch([activeTabKey, () => tabs.value.length], () => {
    nextTick(() => measure(firstDone));
});

function go(tab: Tab) {
    emit('navigate', tab.entryId);
}
</script>

<template>
    <div
        ref="trackEl"
        role="tablist"
        :aria-label="t.components"
        class="relative inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 p-1"
    >
        <span
            class="absolute pointer-events-none rounded-full bg-card shadow-sm border border-border/60"
            :style="indicatorStyle"
        />
        <button
            v-for="tab in tabs"
            :key="tab.key"
            :ref="(el) => setTabRef(tab.key, el)"
            type="button"
            role="tab"
            :aria-selected="activeTabKey === tab.key"
            class="relative z-10 inline-flex items-center justify-center h-8 px-3.5 rounded-full text-sm font-medium transition-colors duration-150"
            :class="activeTabKey === tab.key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'"
            @click="go(tab)"
        >
            {{ tab.label }}
        </button>
    </div>
</template>
