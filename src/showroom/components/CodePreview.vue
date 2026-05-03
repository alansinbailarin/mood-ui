<script setup lang="ts">
import { ref, computed, watch, onMounted, shallowRef } from 'vue';
import { CodeBracketIcon, EyeIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline';
import Card from '../../components/data-display/Card.vue';
import Tooltip from '../../components/feedback/Tooltip.vue';
import { useColorMode } from '../../composables/useColorMode';
import { getHighlighter, type BundledLanguage } from '../composables/useHighlighter';

const props = withDefaults(defineProps<{
    /** Source code to display in the Code tab. If absent, only Preview is shown. */
    code?: string;
    /** Shiki language id. */
    lang?: BundledLanguage;
    /** Initial active tab. */
    initial?: 'preview' | 'code';
    /** Hide the tab switcher (used for code-only blocks). */
    codeOnly?: boolean;
    /** Hide the preview frame (used for code-only blocks). */
    previewOnly?: boolean;
}>(), {
    lang: 'vue',
    initial: 'preview',
    codeOnly: false,
    previewOnly: false,
});

const tab = ref<'preview' | 'code'>(props.codeOnly ? 'code' : props.initial);
const html = shallowRef<string>('');
const copied = ref(false);

const { isDark } = useColorMode();
const theme = computed(() => (isDark.value ? 'github-dark-default' : 'github-light-default'));

const hasCode = computed(() => !!props.code && !props.previewOnly);
const showTabs = computed(() => hasCode.value && !props.codeOnly);

async function render() {
    if (!props.code) {
        html.value = '';
        return;
    }
    try {
        const hl = await getHighlighter();
        html.value = hl.codeToHtml(props.code, {
            lang: props.lang,
            theme: theme.value,
        });
    } catch {
        // Fallback: plain pre
        html.value = `<pre class="shiki"><code>${escape(props.code)}</code></pre>`;
    }
}

function escape(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function copy() {
    if (!props.code) return;
    try {
        await navigator.clipboard.writeText(props.code);
        copied.value = true;
        setTimeout(() => (copied.value = false), 1400);
    } catch { /* no-op */ }
}

onMounted(render);
watch(() => [props.code, props.lang, theme.value], render);
</script>

<template>
    <Card variant="outlined" padding="none" class="overflow-hidden">
        <!-- Toolbar -->
        <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/30">
            <!-- Tab switcher (Preview ⇄ Code) -->
            <div v-if="showTabs" class="inline-flex items-center rounded-md border border-border bg-card p-0.5 text-xs">
                <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors"
                    :class="tab === 'preview' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'"
                    @click="tab = 'preview'"
                >
                    <EyeIcon class="size-3.5" />
                    Preview
                </button>
                <button
                    type="button"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors"
                    :class="tab === 'code' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'"
                    @click="tab = 'code'"
                >
                    <CodeBracketIcon class="size-3.5" />
                    Code
                </button>
            </div>
            <span v-else class="text-[11px] font-mono text-muted-foreground uppercase tracking-wider px-1">
                {{ codeOnly ? lang : 'preview' }}
            </span>

            <!-- Copy button (only when there's code) -->
            <Tooltip v-if="hasCode" :content="copied ? 'Copiado!' : 'Copiar código'">
                <button
                    type="button"
                    aria-label="Copiar código"
                    class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
                    @click="copy"
                >
                    <CheckIcon v-if="copied" class="size-4 text-success" />
                    <ClipboardDocumentIcon v-else class="size-4" />
                </button>
            </Tooltip>
        </div>

        <!-- Preview pane -->
        <div
            v-show="!codeOnly && tab === 'preview'"
            class="p-6 bg-card"
        >
            <div class="flex flex-wrap items-center gap-3">
                <slot />
            </div>
        </div>

        <!-- Code pane -->
        <div
            v-show="hasCode && (codeOnly || tab === 'code')"
            class="code-pane font-mono text-[13px] overflow-x-auto"
            v-html="html"
        />
    </Card>
</template>

<style scoped>
.code-pane :deep(pre.shiki) {
    margin: 0;
    padding: 1rem 1.25rem;
    background: transparent !important;
    line-height: 1.6;
}
.code-pane :deep(pre.shiki code) {
    background: transparent;
    padding: 0;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}
</style>
