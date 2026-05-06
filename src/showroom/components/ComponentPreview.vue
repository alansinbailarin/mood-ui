<script setup lang="ts">
import { ref } from 'vue';
import CodePreview from './CodePreview.vue';
import Typography from '../../components/data-display/Typography.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/outline';
import { useShowroomT } from '../composables/useShowroomLocale';
import type { BundledLanguage } from '../composables/useHighlighter';

const emit = defineEmits<{ reset: [] }>();
const t = useShowroomT();

withDefaults(defineProps<{
    /** Reactive code string to show in the Code tab. */
    code: string;
    /** Optional section title above the card. */
    title?: string;
    /** Optional description below the title. */
    description?: string;
    /** Shiki language for syntax highlight. */
    lang?: BundledLanguage;
    /** Minimum height of the preview canvas. */
    minHeight?: string;
}>(), {
    lang: 'vue',
    minHeight: '200px',
});

const activeTab = ref<'preview' | 'code'>('preview');
</script>

<template>
    <div class="flex flex-col gap-2">
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
        <div class="rounded-xl border border-border overflow-hidden">
            <!-- Toolbar -->
            <div class="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/60 flex-wrap min-h-[44px]">
                <!-- Controls (left) -->
                <slot name="controls" />

                <!-- Reset + Preview/Code tabs (right) -->
                <div class="ml-auto flex items-center gap-2 shrink-0">
                    <button
                        v-if="$slots.controls"
                        type="button"
                        :title="t.docReset"
                        class="size-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        @click="emit('reset')"
                    >
                        <ArrowPathIcon class="size-3.5" />
                    </button>
                    <div class="flex items-center rounded-lg border border-border bg-muted/30 p-0.5 gap-0.5">
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                        :class="activeTab === 'preview'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'"
                        @click="activeTab = 'preview'"
                    >
                        {{ t.docPreview }}
                    </button>
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                        :class="activeTab === 'code'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'"
                        @click="activeTab = 'code'"
                    >
                        {{ t.docCode }}
                    </button>
                    </div>
                </div>
            </div>

            <!-- Animated content -->
            <Transition name="tab-fade" mode="out-in">
                <!-- Preview canvas -->
                <div
                    v-if="activeTab === 'preview'"
                    key="preview"
                    class="relative flex items-center justify-center overflow-hidden bg-background"
                    :style="`min-height: ${minHeight}; padding: 2.5rem;`"
                >
                    <!-- Subtle dot grid that adapts to light/dark via --border -->
                    <div
                        class="pointer-events-none absolute inset-0 opacity-[0.55]"
                        style="background-image: radial-gradient(circle, var(--border) 1px, transparent 1px); background-size: 24px 24px;"
                    />
                    <!-- Content: flex-wrap so multiple items sit side by side -->
                    <div class="relative z-10 flex flex-wrap items-center justify-center gap-3">
                        <slot />
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
