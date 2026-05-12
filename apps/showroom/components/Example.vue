<script setup lang="ts">
import { Typography, Card } from 'mood-ui';
import CodePreview from './CodePreview.vue';

defineProps<{
    title?: string;
    description?: string;
    code?: string;
    /** Shiki language id. Defaults to 'vue'. */
    lang?: 'vue' | 'typescript' | 'javascript' | 'bash' | 'html' | 'css' | 'json' | 'tsx';
}>();
</script>

<template>
    <section class="flex flex-col gap-3">
        <div v-if="title || description" class="flex flex-col gap-1">
            <Typography v-if="title" variant="title" size="medium">{{ title }}</Typography>
            <Typography v-if="description" variant="body" color="muted">{{ description }}</Typography>
        </div>

        <!-- With code → toggleable Preview/Code via CodePreview -->
        <CodePreview v-if="code" :code="code" :lang="lang ?? 'vue'">
            <slot />
        </CodePreview>

        <!-- Without code → simple preview card (back-compat) -->
        <Card v-else variant="outlined" padding="large">
            <div class="flex flex-wrap items-center gap-3">
                <slot />
            </div>
        </Card>
    </section>
</template>

