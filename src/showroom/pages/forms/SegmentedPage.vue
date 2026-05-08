<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Segmented from "../../../components/forms/Segmented.vue";
import {
  ListBulletIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

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

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `const items = [
    { value: 'list',  label: 'Lista' },
    { value: 'grid',  label: 'Cuadrícula' },
    { value: 'table', label: 'Tabla' },
];

<Segmented v-model="view" :items="items" />`;

const iconsCode = `const items = [
    { value: 'list',  label: 'Lista',     icon: ListBulletIcon },
    { value: 'grid',  label: 'Cuadrícula', icon: Squares2X2Icon },
    { value: 'table', label: 'Tabla',     icon: TableCellsIcon },
];

<Segmented v-model="view" :items="items" />`;

const colorsCode = `<Segmented v-model="v" :items="items" color="primary" />
<Segmented v-model="v" :items="items" color="success" />
<Segmented v-model="v" :items="items" color="warning" />
<Segmented v-model="v" :items="items" color="danger" />`;

const sizesCode = `<Segmented v-model="v" :items="items" size="small"  />
<Segmented v-model="v" :items="items" size="medium" />
<Segmented v-model="v" :items="items" size="large"  />`;

const fullWidthCode = `<Segmented v-model="period" :items="periodItems" full-width />`;

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
  </ComponentDoc>
</template>
