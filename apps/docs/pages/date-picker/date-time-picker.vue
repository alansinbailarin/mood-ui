<script setup lang="ts">
import { ref, computed } from "vue";
import { DateTimePicker, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.dataDisplay.dateTimePicker.title"),
  description: () => t("pages.dataDisplay.dateTimePicker.description"),
  ogTitle: () => `${t("pages.dataDisplay.dateTimePicker.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.dateTimePicker.description"),
});
// ── Overview playground state ──────────────────────────────────────────────────
const pgDate = ref<Date | null>(new Date());
const pgFormat = ref<"24h" | "12h">("24h");
const pgVariant = ref<"filled" | "outline">("filled");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "default",
);
const pgStep = ref<number>(1);
const pgSeconds = ref(false);
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");

function resetPlayground() {
  pgDate.value = new Date();
  pgFormat.value = "24h";
  pgVariant.value = "filled";
  pgColor.value = "default";
  pgStep.value = 1;
  pgSeconds.value = false;
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
  if (pgFormat.value !== "24h") parts.push(`format="${pgFormat.value}"`);
  if (pgVariant.value !== "filled") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgStep.value !== 1) parts.push(`:step="${pgStep.value}"`);
  if (pgSeconds.value) parts.push("show-seconds");
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<DateTimePicker v-model="date"${attrs} />`;
});

// ── Example codes ─────────────────────────────────────────────────────────────
const basic24Code = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimePicker } from 'mood-ui';

const date = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimePicker v-model="date" />
</template>`;

const format12Code = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimePicker } from 'mood-ui';

const date = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimePicker v-model="date" format="12h" />
</template>`;

const secondsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimePicker } from 'mood-ui';

const date = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimePicker v-model="date" format="12h" show-seconds />
</template>`;

const stepCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimePicker } from 'mood-ui';

const date = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimePicker v-model="date" :step="15" color="primary" />
</template>`;

const outlineCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimePicker } from 'mood-ui';

const date = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimePicker v-model="date" variant="outline" color="primary" />
</template>`;

// Example state
const ex1 = ref<Date | null>(new Date());
const ex2 = ref<Date | null>(new Date());
const ex3 = ref<Date | null>(new Date());
const ex4 = ref<Date | null>(new Date());
const ex5 = ref<Date | null>(new Date());

const typesCode = `export interface DateTimePicker {
  modelValue?: Date | null;
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  variant?: 'filled' | 'outline';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  format?: '12h' | '24h';
  step?: number;
  showSeconds?: boolean;
  minTime?: string;
  maxTime?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date | null",
    default: "null",
    description: t("pages.data-display.dateTimePicker.props.modelValue"),
  },
  {
    name: "format",
    type: "'12h' | '24h'",
    default: "'24h'",
    description: t("pages.data-display.dateTimePicker.props.format"),
  },
  {
    name: "step",
    type: "number",
    default: "1",
    description: t("pages.data-display.dateTimePicker.props.step"),
  },
  {
    name: "showSeconds",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.dateTimePicker.props.showSeconds"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.data-display.dateTimePicker.props.color"),
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description: t("pages.data-display.dateTimePicker.props.variant"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.dateTimePicker.props.radius"),
  },
  {
    name: "minDate",
    type: "Date",
    description: t("pages.data-display.dateTimePicker.props.minDate"),
  },
  {
    name: "maxDate",
    type: "Date",
    description: t("pages.data-display.dateTimePicker.props.maxDate"),
  },
  {
    name: "disabledDates",
    type: "Date[]",
    description: t("pages.data-display.dateTimePicker.props.disabledDates"),
  },
  {
    name: "minTime",
    type: "string",
    description: t("pages.data-display.dateTimePicker.props.minTime"),
  },
  {
    name: "maxTime",
    type: "string",
    description: t("pages.data-display.dateTimePicker.props.maxTime"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.data-display.dateTimePicker.props.locale"),
  },
  {
    name: "firstDayOfWeek",
    type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
    default: "1",
    description: t("pages.data-display.dateTimePicker.props.firstDayOfWeek"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.dateTimePicker.title')"
    category="Data Display"
    import-path="import { DateTimePicker } from 'mood-ui'"
    :description="t('pages.data-display.dateTimePicker.description')"
    :props-list="propsList"
  >
    <!-- ── Overview ─────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="360px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('controls.format')"
            :options="[{ value: '24h' }, { value: '12h' }]"
            v-model="pgFormat"
          />
          <TbSep />
          <TbPills
            :label="t('controls.variant')"
            :options="[{ value: 'filled' }, { value: 'outline' }]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('controls.step')"
            :options="[
              { value: '1', label: '1m' },
              { value: '5', label: '5m' },
              { value: '10', label: '10m' },
              { value: '15', label: '15m' },
              { value: '30', label: '30m' },
            ]"
            :model-value="String(pgStep)"
            @update:model-value="pgStep = Number($event)"
          />
          <TbSep />
          <TbPills
            :label="t('controls.radius')"
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
          <TbToggle :label="t('controls.seconds')" v-model="pgSeconds" />
        </template>

        <DateTimePicker
          v-model="pgDate"
          :format="pgFormat"
          :variant="pgVariant"
          :color="pgColor"
          :step="pgStep"
          :show-seconds="pgSeconds"
          :radius="pgRadius"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ──────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.dateTimePicker.examples.basic24.title')"
        :description="
          t('pages.data-display.dateTimePicker.examples.basic24.desc')
        "
        :code="basic24Code"
        min-height="360px"
      >
        <DateTimePicker v-model="ex1" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dateTimePicker.examples.format12.title')"
        :description="
          t('pages.data-display.dateTimePicker.examples.format12.desc')
        "
        :code="format12Code"
        min-height="360px"
      >
        <DateTimePicker v-model="ex2" format="12h" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dateTimePicker.examples.seconds.title')"
        :description="
          t('pages.data-display.dateTimePicker.examples.seconds.desc')
        "
        :code="secondsCode"
        min-height="360px"
      >
        <DateTimePicker v-model="ex3" format="12h" show-seconds />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dateTimePicker.examples.step.title')"
        :description="t('pages.data-display.dateTimePicker.examples.step.desc')"
        :code="stepCode"
        min-height="360px"
      >
        <DateTimePicker v-model="ex4" :step="15" color="primary" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.dateTimePicker.examples.outline.title')"
        :description="
          t('pages.data-display.dateTimePicker.examples.outline.desc')
        "
        :code="outlineCode"
        min-height="360px"
      >
        <DateTimePicker v-model="ex5" variant="outline" color="primary" />
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.data-display.dateTimePicker.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.dateTimePicker.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
