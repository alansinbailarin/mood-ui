<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Table from '../../../components/data-display/table/Table.vue';
import type { PropDoc, EmitDoc } from '../../types';

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
const pgBordered     = ref(false);
const pgStickyHeader = ref(false);
const pgSize         = ref<'small' | 'medium' | 'large'>('medium');
const pgDensity      = ref<'compact' | 'comfortable' | 'spacious'>('comfortable');

function resetPlayground() {
    pgStriped.value      = false;
    pgHover.value        = true;
    pgBordered.value     = false;
    pgStickyHeader.value = false;
    pgSize.value         = 'medium';
    pgDensity.value      = 'comfortable';
}

const overviewCode = computed(() => {
    const parts: string[] = [':data="rows"', ':columns="cols"', 'row-key="id"'];
    if (pgStriped.value)               parts.push('striped');
    if (!pgHover.value)                parts.push(':hover="false"');
    if (pgBordered.value)              parts.push('bordered="all"');
    if (pgStickyHeader.value)          parts.push('sticky-header');
    if (pgSize.value !== 'medium')     parts.push(`size="${pgSize.value}"`);
    if (pgDensity.value !== 'comfortable') parts.push(`density="${pgDensity.value}"`);
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
const propsList: PropDoc[] = [
    { name: 'data',         type: 'T[]',                                        required: true,        description: 'Filas a renderizar.' },
    { name: 'columns',      type: 'TableColumn<T>[]',                           required: true,        description: 'Definición de columnas (key, header, accessor, sortable, align…).' },
    { name: 'rowKey',       type: 'string | (row: T) => string | number',                              description: 'Identificador único de fila usado por v-for y selección.' },
    { name: 'size',         type: "'small' | 'medium' | 'large'",               default: "'medium'",   description: 'Tamaño de fuente y altura base de las filas.' },
    { name: 'density',      type: "'compact' | 'comfortable' | 'spacious'",     default: "'comfortable'", description: 'Padding vertical aplicado a las celdas.' },
    { name: 'striped',      type: 'boolean',                                    default: 'false',      description: 'Aplica un fondo alterno a las filas pares.' },
    { name: 'hover',        type: 'boolean',                                    default: 'true',       description: 'Resalta la fila bajo el cursor.' },
    { name: 'bordered',     type: "'none' | 'rows' | 'cols' | 'all'",           default: "'rows'",     description: 'Configura los bordes internos de la tabla.' },
    { name: 'stickyHeader', type: 'boolean',                                    default: 'false',      description: 'Mantiene la cabecera visible al hacer scroll vertical.' },
    { name: 'selectable',   type: "'none' | 'single' | 'multi'",                default: "'none'",     description: 'Activa selección de filas con checkboxes.' },
    { name: 'pageSize',     type: 'number',                                                            description: 'Activa paginación cliente con el tamaño indicado.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:sort',       payload: 'TableSortState',       description: 'Emitido al cambiar el orden de las columnas.' },
    { name: 'update:selected',   payload: '(string | number)[]',  description: 'Emitido al cambiar la selección de filas.' },
    { name: 'update:pagination', payload: 'TablePaginationState', description: 'Emitido al cambiar de página o page size.' },
];
</script>

<template>
    <ComponentDoc
        title="Table"
        category="Data Display"
        import-path="import { Table } from 'mood-ui'"
        description="Tabla potente con sorting, paginación, selección, sticky header, filas expandibles y soporte de árbol. Las columnas se definen con key + accessor."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="320px" @reset="resetPlayground">
                <template #controls>
                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Density -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Densidad</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="d in ['compact', 'comfortable', 'spacious']"
                                :key="d"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgDensity === d
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgDensity = (d as typeof pgDensity)"
                            >{{ d }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgStriped
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgStriped = !pgStriped"
                    >Striped</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgHover
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgHover = !pgHover"
                    >Hover</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgBordered
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgBordered = !pgBordered"
                    >Bordered</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgStickyHeader
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgStickyHeader = !pgStickyHeader"
                    >Sticky header</button>
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
                        :bordered="pgBordered ? 'all' : 'rows'"
                        :sticky-header="pgStickyHeader"
                    />
                </div>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básica"
                description="Configuración por defecto con cuatro columnas y tipografía estándar."
                :code="basicCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="cols" row-key="id" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Striped + bordered"
                description="Filas alternas y bordes completos para mejor lectura en tablas densas."
                :code="stripedCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="cols" row-key="id" striped bordered="all" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con orden"
                description="Marca cualquier columna como sortable para activar el orden ascendente / descendente."
                :code="sortCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="sortableCols" row-key="id" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Densidad compacta"
                description="Reduce el padding vertical para mostrar más filas en menos espacio."
                :code="denseCode"
            >
                <div class="w-full">
                    <Table :data="rows" :columns="cols" row-key="id" density="compact" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Sticky header"
                description="La cabecera permanece fija mientras se hace scroll dentro del contenedor."
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
