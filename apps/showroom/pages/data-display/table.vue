<script setup lang="ts">
import { ref, computed } from "vue";
import { Badge, Table, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";



import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.table.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.table.a11y.kbShiftTab"),
  },
  { keys: ["Enter"], action: t("pages.data-display.table.a11y.kbEnter") },
  { keys: ["Space"], action: t("pages.data-display.table.a11y.kbSpace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-sort",
    value: "'ascending' | 'descending' | 'none'",
    desc: t("pages.data-display.table.a11y.ariaSort"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.table.a11y.ariaLabel"),
  },
  {
    attribute: "aria-selected",
    value: "'true' | 'false'",
    desc: t("pages.data-display.table.a11y.ariaSelected"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.table.a11y.focusNative"),
  t("pages.data-display.table.a11y.focusTrap"),
]);

interface Person {
  id: number;
  name: string;
  role: string;
  country: string;
  salary: number;
}

const rows: Person[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    role: "Engineer",
    country: "UK",
    salary: 95000,
  },
  {
    id: 2,
    name: "Linus Torvalds",
    role: "Creator",
    country: "FI",
    salary: 110000,
  },
  {
    id: 3,
    name: "Grace Hopper",
    role: "Admiral",
    country: "US",
    salary: 80000,
  },
  {
    id: 4,
    name: "Alan Turing",
    role: "Mathematician",
    country: "UK",
    salary: 75000,
  },
];

const typesCode = `export interface TableColumn<TRow = any> {
  key: string;
  header?: string;
  accessor?: (row: TRow, index: number) => unknown;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'chip' | 'avatar' | 'custom';
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  width?: number | string;
  minWidth?: number;
}

export type TableSortState = { key: string; direction: 'asc' | 'desc' }[];

export type TableFilterState = Record<string, string>;

export interface TablePaginationState {
  page: number;
  pageSize: number;
  total?: number;
}

export interface TableCellEditEvent<TRow = any> {
  key: string;
  row: TRow;
  index: number;
  oldValue: unknown;
  newValue: unknown;
}

export interface TableColumnState {
  key: string;
  width?: number;
  order?: number;
  visible?: boolean;
}

export interface Table<TRow = any> {
  data: TRow[];
  columns?: TableColumn<TRow>[];
  rowKey?: string | ((row: TRow, index: number) => string | number);
  size?: 'small' | 'medium' | 'large';
  density?: 'comfortable' | 'compact' | 'spacious';
  striped?: boolean;
  bordered?: 'none' | 'rows' | 'cols' | 'all';
  hover?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  loadingRows?: number;
  loadingMode?: 'skeleton' | 'overlay';
  emptyText?: string;
  ariaLabel?: string;
  sort?: TableSortState;
  multiSort?: boolean;
  selectable?: 'none' | 'single' | 'multi';
  selected?: (string | number)[];
  filter?: TableFilterState;
  filterRow?: boolean;
  expandable?: boolean;
  expanded?: (string | number)[];
  pagination?: TablePaginationState;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  virtual?: boolean;
  tree?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
}`;

const cols = [
  { key: "name", header: "Nombre", accessor: (r: Person) => r.name },
  { key: "role", header: "Rol", accessor: (r: Person) => r.role },
  { key: "country", header: "País", accessor: (r: Person) => r.country },
  {
    key: "salary",
    header: "Salario",
    accessor: (r: Person) => `$${r.salary.toLocaleString()}`,
    type: "number" as const,
    sortable: true,
  },
];

const sortableCols = cols.map((c) => ({ ...c, sortable: true }));

const paginationRows: Person[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    role: "Engineer",
    country: "UK",
    salary: 95000,
  },
  {
    id: 2,
    name: "Linus Torvalds",
    role: "Creator",
    country: "FI",
    salary: 110000,
  },
  {
    id: 3,
    name: "Grace Hopper",
    role: "Admiral",
    country: "US",
    salary: 80000,
  },
  {
    id: 4,
    name: "Alan Turing",
    role: "Mathematician",
    country: "UK",
    salary: 75000,
  },
  {
    id: 5,
    name: "Margaret Hamilton",
    role: "Director",
    country: "US",
    salary: 98000,
  },
  {
    id: 6,
    name: "Donald Knuth",
    role: "Professor",
    country: "US",
    salary: 87000,
  },
];

const selected = ref<(string | number)[]>([]);
const paginationState = ref({ page: 1, pageSize: 3, total: 6 });
const loadingDemo = ref(true);

// ── Overview playground state ─────────────────────────────────────────────────
const pgStriped = ref(false);
const pgHover = ref(true);
const pgBordered = ref<"none" | "rows" | "cols" | "all">("rows");
const pgStickyHeader = ref(false);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgDensity = ref<"compact" | "comfortable" | "spacious">("comfortable");
const pgSelectable = ref<"none" | "single" | "multi">("none");

function resetPlayground() {
  pgStriped.value = false;
  pgHover.value = true;
  pgBordered.value = "rows";
  pgStickyHeader.value = false;
  pgSize.value = "medium";
  pgDensity.value = "comfortable";
  pgSelectable.value = "none";
}

const overviewCode = computed(() => {
  const parts: string[] = [':data="rows"', ':columns="cols"', 'row-key="id"'];
  if (pgStriped.value) parts.push("striped");
  if (!pgHover.value) parts.push(':hover="false"');
  if (pgBordered.value !== "rows") parts.push(`bordered="${pgBordered.value}"`);
  if (pgStickyHeader.value) parts.push("sticky-header");
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgDensity.value !== "comfortable")
    parts.push(`density="${pgDensity.value}"`);
  if (pgSelectable.value !== "none")
    parts.push(`selectable="${pgSelectable.value}"`);
  return `<Table\n    ${parts.join("\n    ")}\n/>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number;
  name: string;
  role: string;
  country: string;
  salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',       country: 'US', salary: 80000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  {
    key: 'salary',
    header: 'Salary',
    accessor: (row) => row.salary,
    type: 'number',
    sortable: true,
  },
];
<\/script>

<template>
  <Table :data="rows" :columns="cols" row-key="id" />
</template>`;

const stripedCode = `<script setup lang="ts">
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer', country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',  country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',  country: 'US', salary: 80000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', accessor: (row) => '$' + row.salary.toLocaleString(), type: 'number' },
];
<\/script>

<template>
  <Table :data="rows" :columns="cols" row-key="id" striped bordered="all" />
</template>`;

const sortCode = `<script setup lang="ts">
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',       country: 'US', salary: 80000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name',    sortable: true },
  { key: 'role',    header: 'Role',    sortable: true },
  { key: 'country', header: 'Country', sortable: true },
  { key: 'salary',  header: 'Salary',  sortable: true, accessor: (row) => row.salary, type: 'number' },
];
<\/script>

<template>
  <Table :data="rows" :columns="cols" row-key="id" />
</template>`;

const denseCode = `<script setup lang="ts">
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',       country: 'US', salary: 80000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', type: 'number', accessor: (row) => row.salary },
];
<\/script>

<template>
  <Table :data="rows" :columns="cols" row-key="id" density="compact" />
</template>`;

const stickyCode = `<script setup lang="ts">
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',       country: 'US', salary: 80000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', type: 'number', accessor: (row) => row.salary },
];
<\/script>

<template>
  <div class="h-48 overflow-auto">
    <Table :data="rows" :columns="cols" row-key="id" sticky-header />
  </div>
</template>`;

const selectionCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',       country: 'US', salary: 80000 },
  { id: 4, name: 'Alan Turing',    role: 'Mathematician', country: 'UK', salary: 75000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', type: 'number', accessor: (row) => row.salary },
];

const selected = ref<(string | number)[]>([]);
<\/script>

<template>
  <div class="flex flex-col gap-3">
    <Table
      :data="rows"
      :columns="cols"
      row-key="id"
      selectable="multi"
      :selected="selected"
      @update:selected="selected = $event"
    />
    <p class="text-sm text-muted-foreground">
      Selected IDs: {{ selected.length ? selected.join(', ') : 'none' }}
    </p>
  </div>
</template>`;

const paginationCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Table, type TableColumn, type TablePaginationState } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',      role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds',    role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',      role: 'Admiral',       country: 'US', salary: 80000 },
  { id: 4, name: 'Alan Turing',       role: 'Mathematician', country: 'UK', salary: 75000 },
  { id: 5, name: 'Margaret Hamilton', role: 'Director',      country: 'US', salary: 98000 },
  { id: 6, name: 'Donald Knuth',      role: 'Professor',     country: 'US', salary: 87000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', type: 'number', accessor: (row) => row.salary },
];

const pagination = ref<TablePaginationState>({ page: 1, pageSize: 3, total: 6 });
<\/script>

<template>
  <Table
    :data="rows"
    :columns="cols"
    row-key="id"
    :pagination="pagination"
    @update:pagination="pagination = $event"
  />
</template>`;

const loadingCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Table, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', type: 'number' },
];

const loading = ref(true);
<\/script>

<template>
  <Table
    :data="[]"
    :columns="cols"
    row-key="id"
    :loading="loading"
    loading-mode="skeleton"
    :loading-rows="4"
  />
</template>`;

const customCellCode = `<script setup lang="ts">
import { Table, Badge, type TableColumn } from 'mood-ui';

interface Person {
  id: number; name: string; role: string; country: string; salary: number;
}

const rows: Person[] = [
  { id: 1, name: 'Ada Lovelace',   role: 'Engineer',      country: 'UK', salary: 95000 },
  { id: 2, name: 'Linus Torvalds', role: 'Creator',       country: 'FI', salary: 110000 },
  { id: 3, name: 'Grace Hopper',   role: 'Admiral',       country: 'US', salary: 80000 },
  { id: 4, name: 'Alan Turing',    role: 'Mathematician', country: 'UK', salary: 75000 },
];

const cols: TableColumn<Person>[] = [
  { key: 'name',    header: 'Name' },
  { key: 'role',    header: 'Role' },
  { key: 'country', header: 'Country' },
  { key: 'salary',  header: 'Salary', type: 'number', accessor: (row) => row.salary },
];
<\/script>

<template>
  <Table :data="rows" :columns="cols" row-key="id">
    <template #cell-role="{ value }">
      <Badge :label="String(value)" color="primary" size="small" />
    </template>
  </Table>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "data",
    type: "T[]",
    required: true,
    description: t("pages.data-display.table.props.data"),
  },
  {
    name: "columns",
    type: "TableColumn<T>[]",
    description: t("pages.data-display.table.props.columns"),
  },
  {
    name: "rowKey",
    type: "string | (row: T) => string | number",
    description: t("pages.data-display.table.props.rowKey"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.data-display.table.props.size"),
  },
  {
    name: "density",
    type: "'compact' | 'comfortable' | 'spacious'",
    default: "'comfortable'",
    description: t("pages.data-display.table.props.density"),
  },
  {
    name: "striped",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.striped"),
  },
  {
    name: "hover",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.table.props.hover"),
  },
  {
    name: "bordered",
    type: "'none' | 'rows' | 'cols' | 'all'",
    default: "'rows'",
    description: t("pages.data-display.table.props.bordered"),
  },
  {
    name: "stickyHeader",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.stickyHeader"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.table.props.radius"),
  },
  {
    name: "overflow",
    type: "'scroll' | 'truncate'",
    default: "'scroll'",
    description: t("pages.data-display.table.props.overflow"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.loading"),
  },
  {
    name: "loadingRows",
    type: "number",
    default: "5",
    description: t("pages.data-display.table.props.loadingRows"),
  },
  {
    name: "loadingMode",
    type: "'skeleton' | 'overlay'",
    default: "'skeleton'",
    description: t("pages.data-display.table.props.loadingMode"),
  },
  {
    name: "emptyText",
    type: "string",
    description: t("pages.data-display.table.props.emptyText"),
  },
  {
    name: "noResultsText",
    type: "string",
    description: t("pages.data-display.table.props.noResultsText"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.data-display.table.props.ariaLabel"),
  },
  {
    name: "sort",
    type: "TableSortState",
    description: t("pages.data-display.table.props.sort"),
  },
  {
    name: "multiSort",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.multiSort"),
  },
  {
    name: "sortClearable",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.table.props.sortClearable"),
  },
  {
    name: "selectable",
    type: "'none' | 'single' | 'multi'",
    default: "'none'",
    description: t("pages.data-display.table.props.selectable"),
  },
  {
    name: "selected",
    type: "(string | number)[]",
    description: t("pages.data-display.table.props.selected"),
  },
  {
    name: "isRowSelectable",
    type: "(row: T, index: number) => boolean",
    description: t("pages.data-display.table.props.isRowSelectable"),
  },
  {
    name: "filter",
    type: "TableFilterState",
    description: t("pages.data-display.table.props.filter"),
  },
  {
    name: "filterRow",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.filterRow"),
  },
  {
    name: "expandable",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.expandable"),
  },
  {
    name: "expanded",
    type: "(string | number)[]",
    description: t("pages.data-display.table.props.expanded"),
  },
  {
    name: "isRowExpandable",
    type: "(row: T, index: number) => boolean",
    description: t("pages.data-display.table.props.isRowExpandable"),
  },
  {
    name: "pagination",
    type: "TablePaginationState",
    description: t("pages.data-display.table.props.pagination"),
  },
  {
    name: "pageSizeOptions",
    type: "number[]",
    default: "[10, 25, 50, 100]",
    description: t("pages.data-display.table.props.pageSizeOptions"),
  },
  {
    name: "serverSide",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.serverSide"),
  },
  {
    name: "resizable",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.resizable"),
  },
  {
    name: "reorderable",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.reorderable"),
  },
  {
    name: "columnsState",
    type: "TableColumnState[]",
    description: t("pages.data-display.table.props.columnsState"),
  },
  {
    name: "state",
    type: "TableStateSnapshot",
    description: t("pages.data-display.table.props.state"),
  },
  {
    name: "minColumnWidth",
    type: "number",
    default: "48",
    description: t("pages.data-display.table.props.minColumnWidth"),
  },
  {
    name: "virtual",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.virtual"),
  },
  {
    name: "rowHeight",
    type: "number",
    description: t("pages.data-display.table.props.rowHeight"),
  },
  {
    name: "overscan",
    type: "number",
    default: "5",
    description: t("pages.data-display.table.props.overscan"),
  },
  {
    name: "virtualHeight",
    type: "string | number",
    default: "'60vh'",
    description: t("pages.data-display.table.props.virtualHeight"),
  },
  {
    name: "tree",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.tree"),
  },
  {
    name: "childrenKey",
    type: "string",
    default: "'children'",
    description: t("pages.data-display.table.props.childrenKey"),
  },
  {
    name: "treeExpanded",
    type: "(string | number)[]",
    description: t("pages.data-display.table.props.treeExpanded"),
  },
  {
    name: "loadChildren",
    type: "(row: T, index: number) => Promise<T[]>",
    description: t("pages.data-display.table.props.loadChildren"),
  },
  {
    name: "hasChildrenHint",
    type: "(row: T, index: number) => boolean",
    description: t("pages.data-display.table.props.hasChildrenHint"),
  },
  {
    name: "groupBy",
    type: "string | (row: T) => string | number",
    description: t("pages.data-display.table.props.groupBy"),
  },
  {
    name: "groupExpanded",
    type: "(string | number)[]",
    description: t("pages.data-display.table.props.groupExpanded"),
  },
  {
    name: "stickyFirstColumn",
    type: "boolean | 'mobile'",
    default: "false",
    description: t("pages.data-display.table.props.stickyFirstColumn"),
  },
  {
    name: "toolbar",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.toolbar"),
  },
  {
    name: "globalSearch",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.globalSearch"),
  },
  {
    name: "globalSearchScope",
    type: "'all' | 'filterable'",
    default: "'all'",
    description: t("pages.data-display.table.props.globalSearchScope"),
  },
  {
    name: "globalSearchTerm",
    type: "string",
    description: t("pages.data-display.table.props.globalSearchTerm"),
  },
  {
    name: "columnVisibility",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.table.props.columnVisibility"),
  },
  {
    name: "exportable",
    type: "boolean | { csv?: boolean; json?: boolean; clipboard?: boolean }",
    default: "false",
    description: t("pages.data-display.table.props.exportable"),
  },
  {
    name: "exportFileName",
    type: "string",
    default: "'table'",
    description: t("pages.data-display.table.props.exportFileName"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:sort",
    payload: "TableSortState",
    description: t("pages.data-display.table.emits.updateSort"),
  },
  {
    name: "update:selected",
    payload: "(string | number)[]",
    description: t("pages.data-display.table.emits.updateSelected"),
  },
  {
    name: "update:filter",
    payload: "TableFilterState",
    description: t("pages.data-display.table.emits.updateFilter"),
  },
  {
    name: "update:expanded",
    payload: "(string | number)[]",
    description: t("pages.data-display.table.emits.updateExpanded"),
  },
  {
    name: "update:pagination",
    payload: "TablePaginationState",
    description: t("pages.data-display.table.emits.updatePagination"),
  },
  {
    name: "update:columnsState",
    payload: "TableColumnState[]",
    description: t("pages.data-display.table.emits.updateColumnsState"),
  },
  {
    name: "update:treeExpanded",
    payload: "(string | number)[]",
    description: t("pages.data-display.table.emits.updateTreeExpanded"),
  },
  {
    name: "update:groupExpanded",
    payload: "(string | number)[]",
    description: t("pages.data-display.table.emits.updateGroupExpanded"),
  },
  {
    name: "update:globalSearchTerm",
    payload: "string",
    description: t("pages.data-display.table.emits.updateGlobalSearchTerm"),
  },
  {
    name: "row-activate",
    payload: "(row: T, index: number)",
    description: t("pages.data-display.table.emits.rowActivate"),
  },
  {
    name: "row-click",
    payload: "(row: T, index: number)",
    description: t("pages.data-display.table.emits.rowClick"),
  },
  {
    name: "cell-edit",
    payload: "TableCellEditEvent<T>",
    description: t("pages.data-display.table.emits.cellEdit"),
  },
  {
    name: "cell-edit-cancel",
    payload: "{ key: string; row: T; index: number }",
    description: t("pages.data-display.table.emits.cellEditCancel"),
  },
  {
    name: "update:state",
    payload: "TableStateSnapshot",
    description: t("pages.data-display.table.emits.updateState"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    bindings: "—",
    description: t("pages.data-display.table.slots.default"),
  },
  {
    name: "caption",
    bindings: "—",
    description: t("pages.data-display.table.slots.caption"),
  },
  {
    name: "empty",
    bindings: "{ message }",
    description: t("pages.data-display.table.slots.empty"),
  },
  {
    name: "noResults",
    bindings: "{ message, clear }",
    description: t("pages.data-display.table.slots.noResults"),
  },
  {
    name: "footer",
    bindings: "—",
    description: t("pages.data-display.table.slots.footer"),
  },
  {
    name: "toolbar",
    bindings: "{ searchTerm, setSearchTerm, clearSearch }",
    description: t("pages.data-display.table.slots.toolbar"),
  },
  {
    name: "bulk-actions",
    bindings: "{ selected, rows, count, clear }",
    description: t("pages.data-display.table.slots.bulkActions"),
  },
  {
    name: "row-expanded",
    bindings: "{ row, index }",
    description: t("pages.data-display.table.slots.rowExpanded"),
  },
  {
    name: "group-header",
    bindings: "{ value, rows, count, expanded, toggle, aggregations }",
    description: t("pages.data-display.table.slots.groupHeader"),
  },
  {
    name: "cell-{key}",
    bindings: "{ row, value, index }",
    description: t("pages.data-display.table.slots.cellKey"),
  },
  {
    name: "header-{key}",
    bindings: "{ column }",
    description: t("pages.data-display.table.slots.headerKey"),
  },
  {
    name: "filter-{key}",
    bindings: "{ column, value, setValue, clear }",
    description: t("pages.data-display.table.slots.filterKey"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.table.title')"
    category="Data Display"
    import-path="import { Table } from 'mood-ui'"
    :description="t('pages.data-display.table.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="320px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.data-display.table.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.table.controls.density')"
            :options="[
              { value: 'compact' },
              { value: 'comfortable' },
              { value: 'spacious' },
            ]"
            v-model="pgDensity"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.table.controls.bordered')"
            :options="[
              { value: 'none' },
              { value: 'rows' },
              { value: 'cols' },
              { value: 'all' },
            ]"
            v-model="pgBordered"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.table.controls.select')"
            :options="[
              { value: 'none' },
              { value: 'single' },
              { value: 'multi' },
            ]"
            v-model="pgSelectable"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.data-display.table.controls.striped')"
            v-model="pgStriped"
          />
          <TbToggle
            :label="t('pages.data-display.table.controls.hover')"
            v-model="pgHover"
          />
          <TbToggle
            :label="t('pages.data-display.table.controls.stickyHeader')"
            v-model="pgStickyHeader"
          />
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
        :title="t('pages.data-display.table.examples.basic.title')"
        :description="t('pages.data-display.table.examples.basic.desc')"
        :code="basicCode"
      >
        <div class="w-full">
          <Table :data="rows" :columns="cols" row-key="id" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.striped.title')"
        :description="t('pages.data-display.table.examples.striped.desc')"
        :code="stripedCode"
      >
        <div class="w-full">
          <Table
            :data="rows"
            :columns="cols"
            row-key="id"
            striped
            bordered="all"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.sort.title')"
        :description="t('pages.data-display.table.examples.sort.desc')"
        :code="sortCode"
      >
        <div class="w-full">
          <Table :data="rows" :columns="sortableCols" row-key="id" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.compact.title')"
        :description="t('pages.data-display.table.examples.compact.desc')"
        :code="denseCode"
      >
        <div class="w-full">
          <Table :data="rows" :columns="cols" row-key="id" density="compact" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.stickyHeader.title')"
        :description="t('pages.data-display.table.examples.stickyHeader.desc')"
        :code="stickyCode"
        min-height="260px"
      >
        <div class="w-full h-48 overflow-auto">
          <Table :data="rows" :columns="cols" row-key="id" sticky-header />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.selection.title')"
        :description="t('pages.data-display.table.examples.selection.desc')"
        :code="selectionCode"
      >
        <div class="flex flex-col gap-3 w-full">
          <Table
            :data="rows"
            :columns="cols"
            row-key="id"
            selectable="multi"
            :selected="selected"
            @update:selected="selected = $event"
          />
          <p class="text-sm text-muted-foreground">
            Selected IDs: {{ selected.length ? selected.join(", ") : "none" }}
          </p>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.pagination.title')"
        :description="t('pages.data-display.table.examples.pagination.desc')"
        :code="paginationCode"
      >
        <div class="w-full">
          <Table
            :data="paginationRows"
            :columns="cols"
            row-key="id"
            :pagination="paginationState"
            @update:pagination="paginationState = $event"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.loading.title')"
        :description="t('pages.data-display.table.examples.loading.desc')"
        :code="loadingCode"
      >
        <div class="flex flex-col gap-3 w-full">
          <div class="flex justify-end">
            <button
              type="button"
              class="text-sm underline text-primary"
              @click="loadingDemo = !loadingDemo"
            >
              {{ loadingDemo ? "Simulate loaded" : "Reset loading" }}
            </button>
          </div>
          <Table
            :data="loadingDemo ? [] : rows"
            :columns="cols"
            row-key="id"
            :loading="loadingDemo"
            loading-mode="skeleton"
            :loading-rows="4"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.table.examples.customCell.title')"
        :description="t('pages.data-display.table.examples.customCell.desc')"
        :code="customCellCode"
      >
        <div class="w-full">
          <Table :data="rows" :columns="cols" row-key="id">
            <template #cell-role="{ value }">
              <Badge :label="String(value)" color="primary" size="small" />
            </template>
          </Table>
        </div>
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.data-display.table.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.table.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
