<script setup lang="ts">
import Typography from '../../components/data-display/Typography.vue';
import Card from '../../components/data-display/Card.vue';

defineProps<{
    title?: string;
    description?: string;
    code?: string;
}>();
</script>

<template>
    <section class="flex flex-col gap-3">
        <div v-if="title || description" class="flex flex-col gap-1">
            <Typography v-if="title" variant="title" size="medium">{{ title }}</Typography>
            <Typography v-if="description" variant="body" color="muted">{{ description }}</Typography>
        </div>

        <Card variant="outlined" padding="large">
            <div class="flex flex-wrap items-center gap-3">
                <slot />
            </div>
        </Card>

        <pre v-if="code" class="text-xs bg-muted/60 border border-border rounded-md p-4 overflow-x-auto font-mono text-muted-foreground"><code>{{ code }}</code></pre>
    </section>
</template>
