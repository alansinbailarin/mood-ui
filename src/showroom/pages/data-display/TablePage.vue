<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Table from '../../../components/data-display/table/Table.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

const { t } = useI18n();

interface Person { id: number; name: string; role: string; country: string; salary: number; }

const rows: Person[] = [
    { id: 1, name: 'Ada Lovelace',     role: 'Engineer',      country: 'UK', salary: 95000 },
    { id: 2, name: 'Linus Torvalds',   role: 'Creator',       country: 'FI', salary: 110000 },
    { id: 3, name: 'Grace Hopper',     role: 'Admiral',       country: 'US', salary: 80000 },
    { id: 4, name: 'Alan Turing',      role: 'Mathematician', country: 'UK', salary: 75000 },
];

const cols = [
    { key: 'name',    header: 'Nombre',  accessor: (r: Person) => r.name },
    { key: 'role',    header: 'Rol',     accessor: (r: Person) => r.role },
    { key: 'country', header: 'País',    accessor: (r: Person) => r.country },
    { key: 'salary',  header: 'Salario', accessor: (r: Person) => `$${r.salary.toLocaleString()}`, type: 'number' as const, sortable: true },
];

const sortableCols = cols.map(c => ({ ...c, sortable: true }));

// ── Overview playground state ─────────────────────────────────────────────────
const pgStriped      = ref(false);
const pgHover        = ref(true);
const pgBordered     = ref<'none' | 'rows' | 'cols' | 'all'>('rows');
const pgStickyHeader = ref(false);
const pgSize         = ref<'small' | 'medium' | 'large'>('medium');
const pgDensity      = ref<'compact' | 'comfortable' | 'spacious'>('comfortable');
const pgSelectable   = ref<'none' | 'single' | 'multi'>('none');

function resetPlayground() {
    pgStriped.value      = false;
    pgHover.value        = true;
    pgBordered.value     = 'rows';
    pgStickyHeader.value = false;
    pgSize.value         = 'medium';
    pgDensity.value      = 'comfortable';
    pgSelectable.value   = 'none';
}

const overviewCode = computed(() => {
    const parts: string[] = [':data="rows"', ':columns="cols"', 'row-key="id"'];
    if (pgStriped.value)                    parts.push('striped');
    if (!pgHover.value)                     parts.push(':hover="false"');
    if (pgBordered.value !== 'rows')        parts.push(`bordered="${pgBordered.value}"`);
    if (pgStickyHeader.value)               parts.push('sticky-header');
    if (pgSize.value !== 'medium')          parts.push(`size="${pgSize.value}"`);
    if (pgDensity.value !== 'comfortable')  parts.push(`density="${pgDensity.value}"`);
    if (pgSelectable.value !== 'none')      parts.push(`selectable="${pgSelectable.value}"`);
    return `<Table\n    ${parts.join('\n    ')}\n/>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Table :data="rows" :columns="cols" row-key="id" />`;

const stripedCode = `<Table :data="rows" :columns="cols" row-key="id" striped bordered="all" />`;

const sortCode = `const cols = [
    { key: 'name',    header: 'Nombre',  accessor: r => r.name,    sortable: true },
    { key: 'role',    header: 'Rol',     accessor: r => r.role,    sortable: true },
    { key: 'country', header: 'País',    accessor: r => r.country, sortable: true },
    { key: 'salary',  header: 'Salario', accessor: r => r.salary,  sortable: true,
      type: 'number' },
];

<Table :data="rows" :columns="cols" row-key="id" />`;

const denseCode = `<Table :data="rows" :columns="cols" row-key="id" density="compact" />`;

const stickyCode = `<div class="h-48 overflow-auto">
    <Table :data="rows" :columns="cols" row-key="id" sticky-header />
</div>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'data',         type: 'T[]',                                        required: true,        description: t('pages.dataDisplay.table.props.data') },
    { name: 'columns',      type: 'TableColumn<T>[]',                           required: true,        description: t('pages.dataDisplay.table.props.columns') },
    { name: 'rowKey',       type: 'string | (row: T) => string | number',                              description: t('pages.dataDisplay.table.props.rowKey') },
    { name: 'size',         type: "'small' | 'medium' | 'large'",               default: "'medium'",   description: t('pages.dataDisplay.table.props.size') },
    { name: 'density',      type: "'compact' | 'comfortable' | 'spacious'",     default: "'comfortable'", description: t('pages.dataDisplay.table.props.density') },
    { name: 'striped',      type: 'boolean',                                    default: 'false',      description: t('pages.dataDisplay.table.props.striped') },
    { name: 'hover',        type: 'boolean',                                    default: 'true',       description: t('pages.dataDisplay.table.props.hover') },
    { name: 'bordered',     type: "'none' | 'rows' | 'cols' | 'all'",           default: "'rows'",     description: t('pages.dataDisplay.table.props.bordered') },
    { name: 'stickyHeader', type: 'boolean',                                    default: 'false',      description: t('pages.dataDisplay.table.props.stickyHeader') },
    { name: 'selectable',   type: "'none' | 'single' | 'multi'",                default: "'none'",     description: t('pages.dataDisplay.table.props.selectable') },
    { name: 'pageSize',     type: 'number',                                                            description: t('pages.dataDisplay.table.props.pageSize') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:sort',       payload: 'TableSortState',       description: t('pages.dataDisplay.table.emits.updateSort') },
    { name: 'update:selected',   payload: '(string | number)[]',  description: t('pages.dataDisplay.table.emits.updateSelected') },
    { name: 'update:pagination', payload: 'TablePaginationState', description: t('pages.dataDisplay.table.emits.updatePagination') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.dataDisplay.table.title')"
        category="Data Display"
        import-path="import { Table } from 'mood-ui'"
        :description="t('pages.dataDisplay.table.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="320px" @reset="resetPlayground">
                <template #controls>
                    <TbPills :label="t('pages.dataDisplay.table.controls.size')" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.table.controls.density')" :options="[{value:'compact'},{value:'comfortable'},{value:'spacious'}]" v-model="pgDensity" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.table.controls.bordered')" :options="[{value:'none'},{value:'rows'},{value:'cols'},{value:'all'}]" v-model="pgBordered" />
                    <TbSep />
                    <TbPills :label="t('pages.dataDisplay.table.controls.select')" :options="[{value:'none'},{value:'single'},{value:'multi'}]" v-model="pgSelectable" />
                    <TbSep />
                    <TbToggle :label="t('pages.dataDisplay.table.controls.striped')" v-model="pgStriped" />
                    <TbToggle :label="t('pages.dataDisplay.table.controls.hover')" v-model="pgHover" />
                    <TbToggle :label="t('pages.dataDisplay.table.controls.stickyHeader')" v-model="pgStickyHeader" />
                </template>

                <div class="w-full">
                    <Table
                        :data="rows"
                        :columns="cols"
                        row-key="id"
                        :size="pgSize"
                        :density="pgDensity"
                        :striped="pgStriped"
                        :hover="pgHover"
                        :bordered="pgBordered"
                        :sticky-header="pgStickyHeader"
                        :selectable="pgSelectable"
                    />
                </div>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                :title="t('pages.dataDisplay.table.examples.basic.title')"
                :description="t('pages.dataDisplay.table.examples.basic.desc')"
                :code="basicCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="cols" row-key="id" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.table.examples.striped.title')"
                :description="t('pages.dataDisplay.table.examples.striped.desc')"
                :code="stripedCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="cols" row-key="id" striped bordered="all" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.table.examples.sort.title')"
                :description="t('pages.dataDisplay.table.examples.sort.desc')"
                :code="sortCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="sortableCols" row-key="id" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.table.examples.compact.title')"
                :description="t('pages.dataDisplay.table.examples.compact.desc')"
                :code="denseCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="cols" row-key="id" density="compact" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.table.examples.stickyHeader.title')"
                :description="t('pages.dataDisplay.table.examples.stickyHeader.desc')"
                :code="stickyCode"
                min-height="260px"
            >
                <div class="w-full h-48 overflow-auto">
                    <Table :data="rows" :columns="cols" row-key="id" sticky-header />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
