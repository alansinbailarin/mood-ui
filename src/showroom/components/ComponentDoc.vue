<script setup lang="ts">
import { ref, provide, onMounted, watch, nextTick } from 'vue';
import Typography from '../../components/data-display/Typography.vue';
import { ClipboardIcon, CheckIcon } from '@heroicons/vue/24/outline';
import { vReveal } from '../composables/useScrollReveal';
import { useShowroomT } from '../composables/useShowroomLocale';
import { createDocToc, DOC_TOC_KEY } from '../composables/useDocToc';
import DocToc from './DocToc.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../types';

const props = defineProps<{
    title: string;
    category: string;
    description: string;
    importPath: string;
    propsList?: PropDoc[];
    emitsList?: EmitDoc[];
    slotsList?: SlotDoc[];
}>();

const t = useShowroomT();
const copied = ref(false);

function copyImport() {
    navigator.clipboard.writeText(props.importPath).then(() => {
        copied.value = true;
        setTimeout(() => (copied.value = false), 2000);
    });
}

// ── TOC ──────────────────────────────────────────────────────────────────────
const toc = createDocToc();
provide(DOC_TOC_KEY, toc);

// Re-register fixed sections when locale changes (labels are translated)
function registerFixedSections() {
    toc.register({ id: 'overview', label: t.value.docSection_overview, level: 1 });
    if (slots.examples) toc.register({ id: 'examples', label: t.value.docSection_examples, level: 1 });
    const hasApi = (props.propsList?.length || props.emitsList?.length || props.slotsList?.length);
    if (hasApi) {
        toc.register({ id: 'api', label: t.value.docSection_api, level: 1 });
        if (props.propsList?.length) toc.register({ id: 'api-props', label: t.value.docSection_props, level: 2 });
        if (props.emitsList?.length) toc.register({ id: 'api-emits', label: t.value.docSection_emits, level: 2 });
        if (props.slotsList?.length) toc.register({ id: 'api-slots', label: t.value.docSection_slots, level: 2 });
    }
}

import { useSlots } from 'vue';
const slots = useSlots();

onMounted(() => {
    registerFixedSections();
    nextTick(() => {
        // anchor on initial hash
        if (location.hash) {
            const el = document.getElementById(location.hash.slice(1));
            el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
        }
    });
});

watch(
    () => t.value.lang,
    () => registerFixedSections(),
);
</script>

<template>
    <div class="flex gap-12">
        <!-- Main content -->
        <article class="flex-1 min-w-0 flex flex-col gap-12 pb-12">
            <!-- Header -->
            <header v-reveal class="flex flex-col gap-4">
                <Typography variant="overline" size="medium" color="muted">
                    {{ category }}
                </Typography>
                <Typography variant="display" size="medium" as="h1" weight="medium" class="tracking-tight leading-[1.05]">
                    {{ title }}
                </Typography>
                <Typography variant="body" size="medium" color="muted" weight="light">
                    {{ description }}
                </Typography>
                <button
                    type="button"
                    class="self-start flex items-center gap-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 px-3 py-1.5 transition-colors group cursor-pointer"
                    @click="copyImport"
                >
                    <code class="text-xs font-mono text-foreground select-none">{{ importPath }}</code>
                    <Transition name="icon-swap" mode="out-in">
                        <CheckIcon v-if="copied" key="check" class="size-3.5 text-success shrink-0" />
                        <ClipboardIcon v-else key="clip" class="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </Transition>
                </button>
            </header>

            <!-- Overview -->
            <section id="overview" v-reveal class="flex flex-col gap-4 scroll-mt-20">
                <Typography variant="heading" size="large" weight="medium" as="h2">{{ t.docSection_overview }}</Typography>
                <slot name="overview" />
            </section>

            <!-- Examples -->
            <section v-if="$slots.examples" id="examples" v-reveal class="flex flex-col gap-6 scroll-mt-20">
                <Typography variant="heading" size="large" weight="medium" as="h2">{{ t.docSection_examples }}</Typography>
                <div class="flex flex-col gap-8">
                    <slot name="examples" />
                </div>
            </section>

            <!-- API Reference -->
            <section
                v-if="propsList?.length || emitsList?.length || slotsList?.length"
                id="api"
                v-reveal
                class="flex flex-col gap-8 scroll-mt-20"
            >
                <Typography variant="heading" size="large" weight="medium" as="h2">{{ t.docSection_api }}</Typography>

                <div v-if="propsList?.length" id="api-props" class="flex flex-col gap-3 scroll-mt-20">
                    <Typography variant="title" size="medium" weight="medium" as="h3">{{ t.docSection_props }}</Typography>
                    <div class="rounded-xl border border-border overflow-auto">
                        <table class="w-full text-sm min-w-[580px]">
                            <thead class="bg-muted/30 border-b border-border">
                                <tr>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32">{{ t.docCol_prop }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{{ t.docCol_type }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28">{{ t.docCol_default }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{{ t.docCol_description }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="p in propsList"
                                    :key="p.name"
                                    class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <code class="text-xs font-mono text-primary">{{ p.name }}</code>
                                        <span v-if="p.required" class="ml-1.5 text-[10px] text-danger font-semibold uppercase tracking-wide">req</span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <code class="text-xs font-mono text-muted-foreground break-all">{{ p.type }}</code>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <code v-if="p.default" class="text-xs font-mono text-muted-foreground">{{ p.default }}</code>
                                        <span v-else class="text-xs text-muted-foreground/40">—</span>
                                    </td>
                                    <td class="px-4 py-3 text-xs text-foreground/80 leading-relaxed">{{ p.description }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="emitsList?.length" id="api-emits" class="flex flex-col gap-3 scroll-mt-20">
                    <Typography variant="title" size="medium" weight="medium" as="h3">{{ t.docSection_emits }}</Typography>
                    <div class="rounded-xl border border-border overflow-auto">
                        <table class="w-full text-sm min-w-[400px]">
                            <thead class="bg-muted/30 border-b border-border">
                                <tr>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32">{{ t.docCol_event }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-36">{{ t.docCol_payload }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{{ t.docCol_description }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="e in emitsList"
                                    :key="e.name"
                                    class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td class="px-4 py-3"><code class="text-xs font-mono text-primary">{{ e.name }}</code></td>
                                    <td class="px-4 py-3"><code class="text-xs font-mono text-muted-foreground">{{ e.payload ?? '—' }}</code></td>
                                    <td class="px-4 py-3 text-xs text-foreground/80 leading-relaxed">{{ e.description }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="slotsList?.length" id="api-slots" class="flex flex-col gap-3 scroll-mt-20">
                    <Typography variant="title" size="medium" weight="medium" as="h3">{{ t.docSection_slots }}</Typography>
                    <div class="rounded-xl border border-border overflow-auto">
                        <table class="w-full text-sm min-w-[400px]">
                            <thead class="bg-muted/30 border-b border-border">
                                <tr>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32">{{ t.docCol_slot }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-40">{{ t.docCol_bindings }}</th>
                                    <th class="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{{ t.docCol_description }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="s in slotsList"
                                    :key="s.name"
                                    class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td class="px-4 py-3"><code class="text-xs font-mono text-primary">{{ s.name }}</code></td>
                                    <td class="px-4 py-3">
                                        <code v-if="s.bindings" class="text-xs font-mono text-muted-foreground">{{ s.bindings }}</code>
                                        <span v-else class="text-xs text-muted-foreground/40">—</span>
                                    </td>
                                    <td class="px-4 py-3 text-xs text-foreground/80 leading-relaxed">{{ s.description }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </article>

        <!-- Right TOC -->
        <DocToc :toc="toc" />
    </div>
</template>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
    transition: opacity 120ms ease, transform 120ms ease;
}
.icon-swap-enter-from { opacity: 0; transform: scale(0.6); }
.icon-swap-leave-to   { opacity: 0; transform: scale(0.6); }
</style>
