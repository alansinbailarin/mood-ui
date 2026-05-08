<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CodePreview from './CodePreview.vue';
import Typography from '../../components/data-display/Typography.vue';
import ModoProvider from '../../components/ModoProvider.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import { DOC_TOC_KEY, slugify, type DocTocApi } from '../composables/useDocToc';
import type { BundledLanguage } from '../composables/useHighlighter';

const props = withDefaults(
    defineProps<{
        /** Reactive code string to show in the Code tab. */
        code: string;
        /** Optional section title above the card. Used for the TOC anchor too. */
        title?: string;
        /** Optional description below the title. */
        description?: string;
        /** Shiki language for syntax highlight. */
        lang?: BundledLanguage;
        /** Minimum height of the preview canvas. */
        minHeight?: string;
        /** Skip the isolated ModoProvider wrapper. */
        noScope?: boolean;
    }>(),
    {
        lang: 'vue',
        minHeight: '200px',
        noScope: false,
    },
);

defineEmits<{ reset: [] }>();

const { t } = useI18n();
const activeTab = ref<'preview' | 'code'>('preview');

// ── TOC auto-registration ────────────────────────────────────────────────────
const toc = inject<DocTocApi | null>(DOC_TOC_KEY, null);
const sectionId = computed(() => (props.title ? `ex-${slugify(props.title)}` : ''));

onMounted(() => {
    if (toc && props.title && sectionId.value) {
        toc.register({ id: sectionId.value, label: props.title, level: 2 });
    }
});
onBeforeUnmount(() => {
    if (toc && sectionId.value) toc.unregister(sectionId.value);
});
</script>

<template>
    <div class="flex flex-col gap-2" :id="sectionId || undefined">
        <!-- Optional title + description -->
        <div v-if="title || description" class="flex flex-col gap-0.5">
            <Typography v-if="title" variant="title" size="medium" weight="medium" as="h3">
                {{ title }}
            </Typography>
            <Typography v-if="description" variant="body" size="small" color="muted">
                {{ description }}
            </Typography>
        </div>

        <!-- Card -->
        <div class="rounded-xl border border-border">
            <!-- Toolbar -->
            <div class="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20 min-h-[44px] rounded-t-xl overflow-x-auto no-scrollbar">
                <div class="flex items-center gap-2 shrink-0">
                    <slot name="controls" />
                </div>

                <div class="ml-auto flex items-center gap-2 shrink-0">
                    <button
                        v-if="$slots.controls"
                        type="button"
                        :title="t('doc.reset')"
                        class="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                        @click="$emit('reset')"
                    >
                        <ArrowPathIcon class="size-3.5" />
                    </button>
                    <div class="flex items-center rounded-lg border border-border bg-muted/30 p-0.5 gap-0.5">
                        <button
                            type="button"
                            class="px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
                            :class="activeTab === 'preview'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'"
                            @click="activeTab = 'preview'"
                        >
                            {{ t('doc.preview') }}
                        </button>
                        <button
                            type="button"
                            class="px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
                            :class="activeTab === 'code'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'"
                            @click="activeTab = 'code'"
                        >
                            {{ t('doc.code') }}
                        </button>
                    </div>
                </div>
            </div>

            <Transition name="tab-fade" mode="out-in">
                <!-- Preview canvas (isolated Modo scope) -->
                <div
                    v-if="activeTab === 'preview'"
                    key="preview"
                    class="relative bg-background rounded-b-xl overflow-y-auto"
                    :style="`max-height: 560px;`"
                >
                    <div
                        class="pointer-events-none absolute inset-0 opacity-[0.45]"
                        style="background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(to right, var(--border) 1px, transparent 1px); background-size: 24px 24px;"
                    />
                    <div
                        class="relative z-10 flex flex-wrap items-center justify-center gap-3"
                        :style="`min-height: ${minHeight}; padding: 2.5rem;`"
                    >
                        <ModoProvider v-if="!noScope" scoped class="w-full flex flex-wrap items-center justify-center gap-3">
                            <slot />
                        </ModoProvider>
                        <template v-else>
                            <slot />
                        </template>
                    </div>
                </div>

                <!-- Code viewer -->
                <div v-else key="code" class="overflow-hidden">
                    <CodePreview :code="code" :lang="lang" code-only />
                </div>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
    transition: opacity 140ms ease, transform 140ms ease;
}
.tab-fade-enter-from {
    opacity: 0;
    transform: translateY(5px);
}
.tab-fade-leave-to {
    opacity: 0;
    transform: translateY(-5px);
}
</style>
