<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Pagination from '../../../components/navigation/Pagination.vue';
import type { PropDoc } from '../../types';

const page = ref(3);
const page2 = ref(1);

// playground
const pageCount = ref(20);
const siblingCount = ref(1);
const boundaryCount = ref(1);
const color = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const size = ref<'small' | 'medium' | 'large'>('medium');
const radius = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');
const showFirstLast = ref(true);
const showPrevNext = ref(true);
const disabled = ref(false);

const numOpts = (n: number) => Array.from({ length: n }, (_, i) => ({ value: i, label: String(i) }));
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
const radiusOpts = [
    { value: 'none', label: 'none' },
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
    { value: 'full', label: 'full' },
];
const pageCountOpts = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
];

const propsList: PropDoc[] = [
    { name: 'modelValue', type: 'number', required: true, description: 'Página actual (1-indexed).' },
    { name: 'pageCount', type: 'number', required: true },
    { name: 'siblingCount', type: 'number', default: '1' },
    { name: 'boundaryCount', type: 'number', default: '1' },
    { name: 'showFirstLast', type: 'boolean', default: 'true' },
    { name: 'showPrevNext', type: 'boolean', default: 'true' },
    { name: 'color', type: "'default' | 'primary' | 'danger' | 'success' | 'warning'" },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { name: 'disabled', type: 'boolean', default: 'false' },
];
</script>

<template>
    <DocPage
        title="Pagination"
        category="Navigation"
        import-path="import Pagination from '@/components/navigation/Pagination.vue'"
        description="Paginador accesible con saltos a primera/última página, hermanos configurables y todos los tokens visuales del sistema."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <Pagination v-model="page" :page-count="20" />
            </Example>

            <Example title="Sin first/last">
                <Pagination v-model="page2" :page-count="10" :show-first-last="false" />
            </Example>

            <Example title="Tamaños">
                <Stack direction="column" spacing="small">
                    <Pagination :model-value="3" :page-count="10" size="small" />
                    <Pagination :model-value="3" :page-count="10" size="medium" />
                    <Pagination :model-value="3" :page-count="10" size="large" />
                </Stack>
            </Example>

            <Example title="Colores">
                <Stack direction="column" spacing="small">
                    <Pagination :model-value="3" :page-count="10" color="primary" />
                    <Pagination :model-value="3" :page-count="10" color="success" />
                    <Pagination :model-value="3" :page-count="10" color="warning" />
                    <Pagination :model-value="3" :page-count="10" color="danger" />
                </Stack>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[120px] flex items-center justify-center">
                        <Pagination
                            v-model="page"
                            :page-count="pageCount"
                            :sibling-count="siblingCount"
                            :boundary-count="boundaryCount"
                            :color="color"
                            :size="size"
                            :radius="radius"
                            :show-first-last="showFirstLast"
                            :show-prev-next="showPrevNext"
                            :disabled="disabled"
                        />
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Page count</Typography>
                            <Select v-model="pageCount" :options="pageCountOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Sibling count</Typography>
                            <Select v-model="siblingCount" :options="numOpts(4)" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Boundary count</Typography>
                            <Select v-model="boundaryCount" :options="numOpts(4)" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="color" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="size" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Radius</Typography>
                            <Select v-model="radius" :options="radiusOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">First / last</Typography>
                            <Switch v-model="showFirstLast" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Prev / next</Typography>
                            <Switch v-model="showPrevNext" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Disabled</Typography>
                            <Switch v-model="disabled" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
