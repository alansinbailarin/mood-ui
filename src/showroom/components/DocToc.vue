<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';
import Typography from '../../components/data-display/Typography.vue';
import { useShowroomT } from '../composables/useShowroomLocale';
import type { DocTocApi } from '../composables/useDocToc';

const props = defineProps<{ toc: DocTocApi }>();
const t = useShowroomT();

let observer: IntersectionObserver | null = null;
const visibleIds = ref<Set<string>>(new Set());

function setupObserver() {
    if (typeof window === 'undefined') return;
    teardown();

    observer = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (e.isIntersecting) visibleIds.value.add(e.target.id);
                else visibleIds.value.delete(e.target.id);
            }
            // Active = first item from registry that is currently visible
            const ordered = props.toc.items.value;
            for (const item of ordered) {
                if (visibleIds.value.has(item.id)) {
                    if (props.toc.activeId.value !== item.id) {
                        props.toc.setActive(item.id);
                    }
                    return;
                }
            }
        },
        {
            rootMargin: '-80px 0px -65% 0px',
            threshold: [0, 1],
        },
    );

    for (const item of props.toc.items.value) {
        const el = document.getElementById(item.id);
        if (el) observer.observe(el);
    }
}

function teardown() {
    observer?.disconnect();
    observer = null;
    visibleIds.value.clear();
}

onMounted(() => {
    // Wait for refs to mount
    setTimeout(setupObserver, 50);
});
onBeforeUnmount(teardown);

// Re-observe when items change
watch(
    () => props.toc.items.value.map((i) => i.id).join(','),
    () => setTimeout(setupObserver, 50),
);

function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
}
</script>

<template>
    <nav v-if="toc.items.value.length" class="hidden xl:block w-56 shrink-0">
        <div class="sticky top-20 flex flex-col gap-3">
            <Typography variant="overline" size="small" color="muted" weight="semibold">
                {{ t.onThisPage }}
            </Typography>
            <ul class="flex flex-col gap-1 border-l border-border">
                <li v-for="item in toc.items.value" :key="item.id">
                    <button
                        type="button"
                        class="w-full text-left text-sm py-1 px-3 -ml-px border-l-2 transition-colors cursor-pointer"
                        :class="[
                            item.level === 2 ? 'pl-6 text-xs' : 'pl-3',
                            toc.activeId.value === item.id
                                ? 'border-primary text-primary font-medium'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                        ]"
                        @click="go(item.id)"
                    >
                        {{ item.label }}
                    </button>
                </li>
            </ul>
        </div>
    </nav>
</template>
