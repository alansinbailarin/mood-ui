<script setup lang="ts">
import { ref, computed } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Table from '../../../components/data-display/table/Table.vue';
import type { PropDoc } from '../../types';

interface Person { id: number; name: string; role: string; country: string; salary: number; }
const allRows: Person[] = [
    { id: 1, name: 'Ada Lovelace', role: 'Engineer', country: 'UK', salary: 95000 },
    { id: 2, name: 'Linus Torvalds', role: 'Creator', country: 'FI', salary: 110000 },
    { id: 3, name: 'Grace Hopper', role: 'Admiral', country: 'US', salary: 80000 },
    { id: 4, name: 'Alan Turing', role: 'Mathematician', country: 'UK', salary: 75000 },
    { id: 5, name: 'Margaret Hamilton', role: 'Engineer', country: 'US', salary: 92000 },
    { id: 6, name: 'Dennis Ritchie', role: 'Creator', country: 'US', salary: 105000 },
    { id: 7, name: 'Tim Berners-Lee', role: 'Inventor', country: 'UK', salary: 120000 },
];
const cols = [
    { key: 'name', header: 'Nombre', accessor: (r: Person) => r.name, sortable: true },
    { key: 'role', header: 'Rol', accessor: (r: Person) => r.role, sortable: true },
    { key: 'country', header: 'País', accessor: (r: Person) => r.country, sortable: true },
    { key: 'salary', header: 'Salario', accessor: (r: Person) => `$${r.salary.toLocaleString()}`, sortable: true, align: 'right' as const },
];

const density = ref<'compact' | 'comfortable'>('comfortable');
const striped = ref(false);
const bordered = ref(true);
const hoverable = ref(true);
const stickyHeader = ref(false);
const selectable = ref(false);
const pageSize = ref<number>(5);

const densityOpts = [
    { value: 'compact', label: 'compact' },
    { value: 'comfortable', label: 'comfortable' },
];
const pageSizeOpts = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 25, label: '25' },
];

const selected = ref<(string | number)[]>([]);

const propsList: PropDoc[] = [
    { name: 'data', type: 'T[]', description: 'Filas a renderizar.', required: true },
    { name: 'columns', type: 'TableColumn<T>[]', description: 'Definición de columnas (key, header, accessor, sortable, align…).', required: true },
    { name: 'rowKey', type: 'string | (row: T) => string | number', description: 'Identificador único de fila.' },
    { name: 'density', type: "'compact' | 'comfortable'", default: "'comfortable'" },
    { name: 'striped', type: 'boolean', default: 'false' },
    { name: 'bordered', type: "'none' | 'rows' | 'cols' | 'all'", default: "'none'" },
    { name: 'hoverable', type: 'boolean', default: 'true' },
    { name: 'stickyHeader', type: 'boolean', default: 'false' },
    { name: 'selectable', type: "'none' | 'single' | 'multi'", default: "'none'" },
    { name: 'pageSize', type: 'number', description: 'Activa paginación cliente.' },
];

const sample = computed(() => allRows.slice(0, 5));
</script>

<template>
    <DocPage
        title="Table"
        category="Data display"
        import-path="import Table from '@/components/data-display/table/Table.vue'"
        description="Tabla potente con sorting, paginación, selección, sticky header, filas expandibles y soporte de árbol. Las columnas se definen con key + accessor."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <div class="w-full"><Table :data="sample" :columns="cols" row-key="id" /></div>
            </Example>

            <Example title="Striped + bordered">
                <div class="w-full"><Table :data="sample" :columns="cols" row-key="id" striped bordered="all" /></div>
            </Example>

            <Example title="Selección múltiple">
                <div class="w-full">
                    <Table v-model:selected="selected" :data="sample" :columns="cols" row-key="id" selectable="multi" />
                    <Typography variant="caption" color="muted" class="mt-2">Seleccionados: {{ selected.length }}</Typography>
                </div>
            </Example>

            <Example title="Paginación cliente">
                <div class="w-full"><Table :data="allRows" :columns="cols" row-key="id" :page-size="3" /></div>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
                <Card variant="outlined" padding="medium" class="xl:col-span-3">
                    <Table
                        :data="allRows"
                        :columns="cols"
                        row-key="id"
                        :density="density"
                        :striped="striped"
                        :bordered="bordered ? 'all' : 'none'"
                        :hoverable="hoverable"
                        :sticky-header="stickyHeader"
                        :selectable="selectable ? 'multi' : 'none'"
                        :page-size="pageSize"
                    />
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Density</Typography>
                            <Select v-model="density" :options="densityOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Page size</Typography>
                            <Select v-model="pageSize" :options="pageSizeOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Striped</Typography>
                            <Switch v-model="striped" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Bordered</Typography>
                            <Switch v-model="bordered" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Hoverable</Typography>
                            <Switch v-model="hoverable" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Sticky header</Typography>
                            <Switch v-model="stickyHeader" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Selectable</Typography>
                            <Switch v-model="selectable" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
