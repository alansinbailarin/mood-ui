<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Segmented from "../../../components/forms/Segmented.vue";
import {
  ListBulletIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";
import Typography from "../../../components/data-display/Typography.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.segmented.a11y.kbTab") },
  {
    keys: ["↑", "↓", "←", "→"],
    action: t("pages.forms.segmented.a11y.kbArrow"),
  },
  { keys: ["Space"], action: t("pages.forms.segmented.a11y.kbSpace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"radiogroup"',
    desc: t("pages.forms.segmented.a11y.ariaGroup"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.segmented.a11y.ariaLabel"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.segmented.a11y.ariaDisabled"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.segmented.a11y.focusGroup"),
  t("pages.forms.segmented.a11y.focusDisabled"),
]);

const viewItems = [
  { value: "list", label: "Lista" },
  { value: "grid", label: "Cuadrícula" },
  { value: "table", label: "Tabla" },
];

const iconItems = [
  { value: "list", label: "Lista", icon: ListBulletIcon },
  { value: "grid", label: "Cuadrícula", icon: Squares2X2Icon },
  { value: "table", label: "Tabla", icon: TableCellsIcon },
];

const periodItems = [
  { value: "d", label: "Día" },
  { value: "w", label: "Semana" },
  { value: "m", label: "Mes" },
  { value: "y", label: "Año" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<string | number>("grid");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgFullWidth = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "grid";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgFullWidth.value = false;
  pgDisabled.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgColor.value !== "primary") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgFullWidth.value) parts.push("full-width");
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<Segmented\n    v-model="view"\n    :items="items"${attrs}\n/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from 'mood-ui';

const view = ref('list');

const items = [
  { value: 'list',  label: 'List' },
  { value: 'grid',  label: 'Grid' },
  { value: 'table', label: 'Table' },
];
<\/script>

<template>
  <Segmented v-model="view" :items="items" />
</template>`;

const iconsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from 'mood-ui';
import { ListBulletIcon, Squares2X2Icon, TableCellsIcon } from '@heroicons/vue/24/outline';

const view = ref('list');

const items = [
  { value: 'list',  label: 'List',     icon: ListBulletIcon },
  { value: 'grid',  label: 'Grid',     icon: Squares2X2Icon },
  { value: 'table', label: 'Table',    icon: TableCellsIcon },
];
<\/script>

<template>
  <Segmented v-model="view" :items="items" />
</template>`;

const colorsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from 'mood-ui';

const v = ref('grid');

const items = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'table', label: 'Table' },
];
<\/script>

<template>
  <Segmented v-model="v" :items="items" color="primary" />
  <Segmented v-model="v" :items="items" color="success" />
  <Segmented v-model="v" :items="items" color="warning" />
  <Segmented v-model="v" :items="items" color="danger" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from 'mood-ui';

const v = ref('grid');

const items = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'table', label: 'Table' },
];
<\/script>

<template>
  <Segmented v-model="v" :items="items" size="small"  />
  <Segmented v-model="v" :items="items" size="medium" />
  <Segmented v-model="v" :items="items" size="large"  />
</template>`;

const fullWidthCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Segmented } from 'mood-ui';

const period = ref('w');

const periodItems = [
  { value: 'd', label: 'Day' },
  { value: 'w', label: 'Week' },
  { value: 'm', label: 'Month' },
  { value: 'y', label: 'Year' },
];
<\/script>

<template>
  <Segmented v-model="period" :items="periodItems" full-width />
</template>`;

const typesCode = `export interface Segmented {
  items: SegmentedItem[];
  modelValue?: string | number | null;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  fullWidth?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}`;

const ex1 = ref<string | number>("list");
const ex2 = ref<string | number>("grid");
const ex3 = ref<string | number>("grid");
const ex4 = ref<string | number>("grid");
const ex5 = ref<string | number>("w");

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "items",
    type: "SegmentedItem[]",
    description: t("pages.forms.segmented.props.items"),
    required: true,
  },
  {
    name: "modelValue",
    type: "string | number | null",
    description: t("pages.forms.segmented.props.modelValue"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'primary'",
    description: t("pages.forms.segmented.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.segmented.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.segmented.props.radius"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.segmented.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.segmented.props.disabled"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.segmented.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | number",
    description: t("pages.forms.segmented.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string | number",
    description: t("pages.forms.segmented.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.segmented.title')"
    category="Forms"
    import-path="import { Segmented } from 'mood-ui'"
    :description="t('pages.forms.segmented.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbDots label="Color" :options="colorDots" v-model="pgColor" />
          <TbSep />
          <TbPills
            label="Size"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle label="Full width" v-model="pgFullWidth" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <div :class="pgFullWidth ? 'w-96' : ''">
          <Segmented
            v-model="pgValue"
            :items="viewItems"
            :color="pgColor"
            :size="pgSize"
            :full-width="pgFullWidth"
            :disabled="pgDisabled"
          />
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.segmented.examples.basic.title')"
        :description="t('pages.forms.segmented.examples.basic.desc')"
        :code="basicCode"
      >
        <Segmented v-model="ex1" :items="viewItems" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.segmented.examples.icons.title')"
        :description="t('pages.forms.segmented.examples.icons.desc')"
        :code="iconsCode"
      >
        <Segmented v-model="ex2" :items="iconItems" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.segmented.examples.colors.title')"
        :description="t('pages.forms.segmented.examples.colors.desc')"
        :code="colorsCode"
      >
        <div class="flex flex-col gap-3">
          <Segmented v-model="ex3" :items="viewItems" color="primary" />
          <Segmented v-model="ex3" :items="viewItems" color="success" />
          <Segmented v-model="ex3" :items="viewItems" color="warning" />
          <Segmented v-model="ex3" :items="viewItems" color="danger" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.segmented.examples.sizes.title')"
        :description="t('pages.forms.segmented.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-3">
          <Segmented v-model="ex4" :items="viewItems" size="small" />
          <Segmented v-model="ex4" :items="viewItems" size="medium" />
          <Segmented v-model="ex4" :items="viewItems" size="large" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.segmented.examples.fullWidth.title')"
        :description="t('pages.forms.segmented.examples.fullWidth.desc')"
        :code="fullWidthCode"
      >
        <div class="w-80">
          <Segmented v-model="ex5" :items="periodItems" full-width />
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
        {{ t("pages.forms.segmented.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.segmented.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
