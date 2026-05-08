<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import DateRangePicker from "../../../components/data-display/date-picker/DateRangePicker.vue";
import type { PropDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgRange = ref<[Date | null, Date | null]>([
  new Date(),
  new Date(Date.now() + 7 * 86400000),
]);
const pgMonths = ref<1 | 2>(2);
const pgPresets = ref(false);
const pgVariant = ref<"filled" | "outline">("filled");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "default",
);
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");

function resetPlayground() {
  pgRange.value = [new Date(), new Date(Date.now() + 7 * 86400000)];
  pgMonths.value = 2;
  pgPresets.value = false;
  pgVariant.value = "filled";
  pgColor.value = "default";
  pgRadius.value = "medium";
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
  if (pgMonths.value !== 2) parts.push(`:months="${pgMonths.value}"`);
  if (pgVariant.value !== "filled") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgPresets.value) parts.push("show-presets");
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<DateRangePicker v-model="range"${attrs} />`;
});

// ── Example codes ─────────────────────────────────────────────────────────────
const twoMonthsCode = `<DateRangePicker v-model="range" :months="2" />`;
const oneMonthCode = `<DateRangePicker v-model="range" :months="1" />`;
const presetsCode = `<DateRangePicker v-model="range" :months="2" show-presets />`;
const colorCode = `<DateRangePicker v-model="range" :months="2" color="primary" />`;
const outlineCode = `<DateRangePicker v-model="range" :months="2" variant="outline" color="primary" />`;

const ex1 = ref<[Date | null, Date | null]>([
  new Date(),
  new Date(Date.now() + 7 * 86400000),
]);
const ex2 = ref<[Date | null, Date | null]>([
  new Date(),
  new Date(Date.now() + 7 * 86400000),
]);
const ex3 = ref<[Date | null, Date | null]>([
  new Date(),
  new Date(Date.now() + 7 * 86400000),
]);
const ex4 = ref<[Date | null, Date | null]>([
  new Date(),
  new Date(Date.now() + 7 * 86400000),
]);
const ex5 = ref<[Date | null, Date | null]>([
  new Date(),
  new Date(Date.now() + 7 * 86400000),
]);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "[Date | null, Date | null]",
    default: "[null, null]",
    description: t("pages.dataDisplay.dateRangePicker.props.modelValue"),
  },
  {
    name: "months",
    type: "1 | 2",
    default: "2",
    description: t("pages.dataDisplay.dateRangePicker.props.months"),
  },
  {
    name: "showPresets",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.dateRangePicker.props.showPresets"),
  },
  {
    name: "presets",
    type: "RangePreset[]",
    description: t("pages.dataDisplay.dateRangePicker.props.presets"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.dataDisplay.dateRangePicker.props.color"),
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description: t("pages.dataDisplay.dateRangePicker.props.variant"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.dataDisplay.dateRangePicker.props.radius"),
  },
  {
    name: "minDate",
    type: "Date",
    description: t("pages.dataDisplay.dateRangePicker.props.minDate"),
  },
  {
    name: "maxDate",
    type: "Date",
    description: t("pages.dataDisplay.dateRangePicker.props.maxDate"),
  },
  {
    name: "minRange",
    type: "number",
    description: t("pages.dataDisplay.dateRangePicker.props.minRange"),
  },
  {
    name: "maxRange",
    type: "number",
    description: t("pages.dataDisplay.dateRangePicker.props.maxRange"),
  },
  {
    name: "disabledDates",
    type: "Date[]",
    description: t("pages.dataDisplay.dateRangePicker.props.disabledDates"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.dataDisplay.dateRangePicker.props.locale"),
  },
  {
    name: "firstDayOfWeek",
    type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
    default: "1",
    description: t("pages.dataDisplay.dateRangePicker.props.firstDayOfWeek"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.dataDisplay.dateRangePicker.title')"
    category="Data Display"
    import-path="import { DateRangePicker } from 'mood-ui'"
    :description="t('pages.dataDisplay.dateRangePicker.description')"
    :props-list="propsList"
  >
    <!-- ── Overview ─────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="360px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Meses"
            :options="[{ value: '1' }, { value: '2' }]"
            :model-value="String(pgMonths)"
            @update:model-value="pgMonths = Number($event) as 1 | 2"
          />
          <TbSep />
          <TbPills
            label="Variante"
            :options="[{ value: 'filled' }, { value: 'outline' }]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots label="Color" :options="colorDots" v-model="pgColor" />
          <TbSep />
          <TbPills
            label="Radius"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
            v-model="pgRadius"
          />
          <TbSep />
          <TbToggle label="Presets" v-model="pgPresets" />
        </template>

        <DateRangePicker
          v-model="pgRange"
          :months="pgMonths"
          :variant="pgVariant"
          :color="pgColor"
          :show-presets="pgPresets"
          :radius="pgRadius"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ─────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.dataDisplay.dateRangePicker.examples.twoMonths.title')"
        :description="
          t('pages.dataDisplay.dateRangePicker.examples.twoMonths.desc')
        "
        :code="twoMonthsCode"
        min-height="340px"
      >
        <DateRangePicker v-model="ex1" :months="2" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.dateRangePicker.examples.oneMonth.title')"
        :description="
          t('pages.dataDisplay.dateRangePicker.examples.oneMonth.desc')
        "
        :code="oneMonthCode"
        min-height="340px"
      >
        <DateRangePicker v-model="ex2" :months="1" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.dateRangePicker.examples.presets.title')"
        :description="
          t('pages.dataDisplay.dateRangePicker.examples.presets.desc')
        "
        :code="presetsCode"
        min-height="340px"
      >
        <DateRangePicker v-model="ex3" :months="2" show-presets />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.dateRangePicker.examples.color.title')"
        :description="
          t('pages.dataDisplay.dateRangePicker.examples.color.desc')
        "
        :code="colorCode"
        min-height="340px"
      >
        <DateRangePicker v-model="ex4" :months="2" color="primary" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.dateRangePicker.examples.outline.title')"
        :description="
          t('pages.dataDisplay.dateRangePicker.examples.outline.desc')
        "
        :code="outlineCode"
        min-height="340px"
      >
        <DateRangePicker
          v-model="ex5"
          :months="2"
          variant="outline"
          color="primary"
        />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
