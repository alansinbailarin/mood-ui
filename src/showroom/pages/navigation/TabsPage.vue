<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Tabs from '../../../components/navigation/Tabs.vue';
import { ChartBarIcon, Cog6ToothIcon, HomeIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, SlotDoc } from '../../types';

const active = ref<string | number>('overview');

const items = [
    { value: 'overview', label: 'Overview', icon: HomeIcon },
    { value: 'analytics', label: 'Analytics', icon: ChartBarIcon, badge: 'beta' },
    { value: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

// playground
const variant = ref<'line' | 'pill' | 'segmented'>('line');
const size = ref<'small' | 'medium' | 'large'>('medium');
const color = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const fullWidth = ref(false);
const lazy = ref(false);

const variantOpts = [
    { value: 'line', label: 'line' },
    { value: 'pill', label: 'pill' },
    { value: 'segmented', label: 'segmented' },
];
const sizeOpts = [
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];
const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'primary', label: 'primary' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
    { value: 'danger', label: 'danger' },
];
const propsList: PropDoc[] = [
    { name: 'items', type: 'TabItem[]', required: true },
    { name: 'modelValue', type: 'string | number | null' },
    { name: 'variant', type: "'line' | 'pill' | 'segmented'", default: "'line'" },
    { name: 'color', type: "'default' | 'primary' | 'danger' | 'success' | 'warning'" },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { name: 'fullWidth', type: 'boolean', default: 'false' },
    { name: 'lazy', type: 'boolean', default: 'false' },
    { name: 'keepMounted', type: 'boolean', default: 'false' },
];
const slotsList: SlotDoc[] = [
    { name: 'panel-<value>', description: 'Contenido de cada panel; el slot recibe el value como sufijo del nombre.' },
];
</script>

<template>
    <DocPage
        title="Tabs"
        category="Navigation"
        import-path="import Tabs from '@/components/navigation/Tabs.vue'"
        description="Tabs accesibles con tres variantes (line, pill, segmented), iconos, badges y orientación horizontal/vertical. Soporta paneles vía slots `panel-<value>`."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #examples>
            <Example title="Variantes">
                <Stack direction="column" spacing="small" class="w-full">
                    <Tabs v-model="active" :items="items" variant="line" />
                    <Tabs v-model="active" :items="items" variant="pill" />
                    <Tabs v-model="active" :items="items" variant="segmented" />
                </Stack>
            </Example>

            <Example title="Con paneles">
                <div class="w-full">
                    <Tabs v-model="active" :items="items" variant="line">
                        <template #panel-overview>
                            <Card variant="filled" padding="medium" class="mt-3">
                                <Typography>Resumen del proyecto.</Typography>
                            </Card>
                        </template>
                        <template #panel-analytics>
                            <Card variant="filled" padding="medium" class="mt-3">
                                <Typography>Métricas y gráficas.</Typography>
                            </Card>
                        </template>
                        <template #panel-settings>
                            <Card variant="filled" padding="medium" class="mt-3">
                                <Typography>Ajustes y preferencias.</Typography>
                            </Card>
                        </template>
                    </Tabs>
                </div>
            </Example>

            <Example title="Full width">
                <Tabs v-model="active" :items="items" full-width variant="segmented" />
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[160px]">
                        <Tabs
                            v-model="active"
                            :items="items"
                            :variant="variant"
                            :color="color"
                            :size="size"
                            :full-width="fullWidth"
                            :lazy="lazy"
                        />
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Variant</Typography>
                            <Select v-model="variant" :options="variantOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="color" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="size" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Full width</Typography>
                            <Switch v-model="fullWidth" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Lazy</Typography>
                            <Switch v-model="lazy" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
