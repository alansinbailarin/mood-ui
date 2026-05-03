<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import Typography from '../../components/data-display/Typography.vue';
import Card from '../../components/data-display/Card.vue';
import Tabs from '../../components/navigation/Tabs.vue';
import Badge from '../../components/feedback/Badge.vue';
import Stack from '../../components/layout/Stack.vue';
import Divider from '../../components/layout/Divider.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../types';

const props = defineProps<{
    title: string;
    description?: string;
    category?: string;
    importPath?: string;
    propsList?: PropDoc[];
    emitsList?: EmitDoc[];
    slotsList?: SlotDoc[];
}>();

const slots = useSlots();
const hasPlayground = computed(() => !!slots.playground);

const tabs = computed(() => {
    const t: { value: string; label: string }[] = [{ value: 'examples', label: 'Examples' }];
    if (hasPlayground.value) t.push({ value: 'playground', label: 'Playground' });
    t.push({ value: 'api', label: 'API' });
    return t;
});
const active = ref<string>('examples');
</script>

<template>
    <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-2">
            <div v-if="props.category" class="flex items-center gap-2">
                <Typography variant="overline" color="muted">{{ props.category }}</Typography>
            </div>
            <Typography variant="display" size="small">{{ props.title }}</Typography>
            <Typography v-if="props.description" variant="body" size="large" color="muted">
                {{ props.description }}
            </Typography>
            <div v-if="props.importPath" class="mt-2">
                <code class="px-3 py-1.5 rounded bg-muted text-sm font-mono text-muted-foreground border border-border inline-block">
                    {{ props.importPath }}
                </code>
            </div>
        </header>

        <Divider />

        <Tabs v-model="active" :items="tabs" variant="line">
            <template #panel-examples>
                <Stack direction="column" spacing="large" class="pt-6">
                    <slot name="examples" />
                </Stack>
            </template>

            <template #panel-playground>
                <div class="pt-6">
                    <slot name="playground" />
                </div>
            </template>

            <template #panel-api>
                <div class="pt-6 flex flex-col gap-8">
                    <section v-if="props.propsList && props.propsList.length">
                        <Typography variant="heading" size="small" as="h2" class="mb-3">Props</Typography>
                        <Card variant="outlined" padding="none" class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-muted/40 text-left text-muted-foreground">
                                    <tr>
                                        <th class="px-4 py-2 font-medium">Prop</th>
                                        <th class="px-4 py-2 font-medium">Type</th>
                                        <th class="px-4 py-2 font-medium">Default</th>
                                        <th class="px-4 py-2 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="p in props.propsList" :key="p.name" class="border-t border-border align-top">
                                        <td class="px-4 py-3 font-mono text-foreground whitespace-nowrap">
                                            {{ p.name }}
                                            <Badge v-if="p.required" color="danger" variant="subtle" size="small" class="ml-1">required</Badge>
                                        </td>
                                        <td class="px-4 py-3 font-mono text-primary text-xs">{{ p.type }}</td>
                                        <td class="px-4 py-3 font-mono text-muted-foreground text-xs">{{ p.default ?? '—' }}</td>
                                        <td class="px-4 py-3 text-muted-foreground">{{ p.description }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card>
                    </section>

                    <section v-if="props.emitsList && props.emitsList.length">
                        <Typography variant="heading" size="small" as="h2" class="mb-3">Events</Typography>
                        <Card variant="outlined" padding="none" class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-muted/40 text-left text-muted-foreground">
                                    <tr>
                                        <th class="px-4 py-2 font-medium">Name</th>
                                        <th class="px-4 py-2 font-medium">Payload</th>
                                        <th class="px-4 py-2 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="e in props.emitsList" :key="e.name" class="border-t border-border align-top">
                                        <td class="px-4 py-3 font-mono text-foreground">{{ e.name }}</td>
                                        <td class="px-4 py-3 font-mono text-primary text-xs">{{ e.payload }}</td>
                                        <td class="px-4 py-3 text-muted-foreground">{{ e.description }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card>
                    </section>

                    <section v-if="props.slotsList && props.slotsList.length">
                        <Typography variant="heading" size="small" as="h2" class="mb-3">Slots</Typography>
                        <Card variant="outlined" padding="none" class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-muted/40 text-left text-muted-foreground">
                                    <tr>
                                        <th class="px-4 py-2 font-medium">Name</th>
                                        <th class="px-4 py-2 font-medium">Bindings</th>
                                        <th class="px-4 py-2 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="s in props.slotsList" :key="s.name" class="border-t border-border align-top">
                                        <td class="px-4 py-3 font-mono text-foreground">{{ s.name }}</td>
                                        <td class="px-4 py-3 font-mono text-primary text-xs">{{ s.bindings ?? '—' }}</td>
                                        <td class="px-4 py-3 text-muted-foreground">{{ s.description }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card>
                    </section>

                    <Card v-if="!(props.propsList?.length || props.emitsList?.length || props.slotsList?.length)" variant="outlined" padding="large">
                        <Typography variant="body" color="muted">
                            La documentación detallada de la API está pendiente para este componente.
                        </Typography>
                    </Card>
                </div>
            </template>
        </Tabs>
    </div>
</template>
