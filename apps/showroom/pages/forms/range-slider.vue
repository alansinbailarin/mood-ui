<script setup lang="ts">
import { ref, computed } from "vue";
import { RangeSlider, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.rangeSlider.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.rangeSlider.a11y.kbShiftTab") },
  {
    keys: ["↑", "↓", "←", "→"],
    action: t("pages.forms.rangeSlider.a11y.kbArrow"),
  },
  { keys: ["Home"], action: t("pages.forms.rangeSlider.a11y.kbHome") },
  { keys: ["End"], action: t("pages.forms.rangeSlider.a11y.kbEnd") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-valuenow",
    value: "number",
    desc: t("pages.forms.rangeSlider.a11y.ariaValueNow"),
  },
  {
    attribute: "aria-valuemin",
    value: "number",
    desc: t("pages.forms.rangeSlider.a11y.ariaValueMin"),
  },
  {
    attribute: "aria-valuemax",
    value: "number",
    desc: t("pages.forms.rangeSlider.a11y.ariaValueMax"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.rangeSlider.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.rangeSlider.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.rangeSlider.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.rangeSlider.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.rangeSlider.a11y.focusThumbs"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<[number, number]>([20, 70]);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgMarks = ref(false);
const pgDisabled = ref(false);
const pgReadonly = ref(false);

function resetPlayground() {
  pgValue.value = [20, 70];
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgMarks.value = false;
  pgDisabled.value = false;
  pgReadonly.value = false;
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
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgMarks.value) parts.push(':marks="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgReadonly.value) parts.push(':readonly="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<RangeSlider
    v-model="range"
    :min="0"
    :max="100"
    show-value${attrs}
/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RangeSlider } from 'mood-ui';

const range = ref<[number, number]>([20, 80]);
<\/script>

<template>
  <RangeSlider v-model="range" show-value label="Range" />
</template>`;

const marksCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RangeSlider } from 'mood-ui';

const range = ref<[number, number]>([20, 80]);
<\/script>

<template>
  <RangeSlider
    v-model="range"
    :min="0"
    :max="100"
    :step="20"
    :marks="true"
    label="Age"
    show-value
  />
</template>`;

const formattedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RangeSlider } from 'mood-ui';

const price = ref<[number, number]>([100, 600]);
const formatPrice = (v: number) => '€' + v;
<\/script>

<template>
  <RangeSlider
    v-model="price"
    :min="0"
    :max="1000"
    :step="10"
    :format-value="formatPrice"
    show-value
    label="Price"
  />
</template>`;

const colorCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RangeSlider } from 'mood-ui';

const range = ref<[number, number]>([20, 70]);
<\/script>

<template>
  <RangeSlider v-model="range" color="success" show-value label="Success" />
  <RangeSlider v-model="range" color="warning" show-value label="Warning" />
  <RangeSlider v-model="range" color="danger"  show-value label="Danger" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { RangeSlider } from 'mood-ui';
<\/script>

<template>
  <RangeSlider :model-value="[30, 70]" disabled show-value label="Disabled" />
</template>`;

const ex1 = ref<[number, number]>([20, 80]);
const ex2 = ref<[number, number]>([20, 80]);
const ex3 = ref<[number, number]>([100, 600]);
const ex4a = ref<[number, number]>([20, 70]);
const ex4b = ref<[number, number]>([20, 70]);
const ex4c = ref<[number, number]>([20, 70]);

const formatPrice = (v: number) => "€" + v;

const typesCode = `export interface RangeSlider {
  modelValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
  showValue?: boolean;
  formatValue?: (v: number) => string;
  marks?: boolean | number[] | { value: number; label?: string }[];
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  helperText?: string;
  errorText?: string;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  fullWidth?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "[number, number]",
    description: t("pages.forms.rangeSlider.props.modelValue"),
  },
  {
    name: "min",
    type: "number",
    default: "0",
    description: t("pages.forms.rangeSlider.props.min"),
  },
  {
    name: "max",
    type: "number",
    default: "100",
    description: t("pages.forms.rangeSlider.props.max"),
  },
  {
    name: "step",
    type: "number",
    default: "1",
    description: t("pages.forms.rangeSlider.props.step"),
  },
  {
    name: "minDistance",
    type: "number",
    description: t("pages.forms.rangeSlider.props.minDistance"),
  },
  {
    name: "showValue",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rangeSlider.props.showValue"),
  },
  {
    name: "formatValue",
    type: "(v: number) => string",
    description: t("pages.forms.rangeSlider.props.formatValue"),
  },
  {
    name: "marks",
    type: "boolean | number[] | { value, label? }[]",
    description: t("pages.forms.rangeSlider.props.marks"),
  },
  {
    name: "orientation",
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: t("pages.forms.rangeSlider.props.orientation"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.rangeSlider.props.label"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.rangeSlider.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.rangeSlider.props.errorText"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.rangeSlider.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.rangeSlider.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'full'",
    description: t("pages.forms.rangeSlider.props.radius"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rangeSlider.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rangeSlider.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rangeSlider.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rangeSlider.props.required"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "[number, number]",
    description: t("pages.forms.rangeSlider.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "[number, number]",
    description: t("pages.forms.rangeSlider.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.rangeSlider.title')"
    category="Forms"
    import-path="import { RangeSlider } from 'mood-ui'"
    :description="t('pages.forms.rangeSlider.description')"
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
          <TbDots
            :label="t('pages.forms.rangeSlider.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.rangeSlider.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.forms.rangeSlider.controls.marks')"
            v-model="pgMarks"
          />
          <TbToggle
            :label="t('pages.forms.rangeSlider.controls.disabled')"
            v-model="pgDisabled"
          />
          <TbToggle
            :label="t('pages.forms.rangeSlider.controls.readonly')"
            v-model="pgReadonly"
          />
        </template>

        <RangeSlider
          v-model="pgValue"
          :min="0"
          :max="100"
          :color="pgColor"
          :size="pgSize"
          :marks="pgMarks"
          :disabled="pgDisabled"
          :readonly="pgReadonly"
          show-value
          :label="t('pages.forms.rangeSlider.playground.label')"
          class="w-72"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.rangeSlider.examples.basic.title')"
        :description="t('pages.forms.rangeSlider.examples.basic.desc')"
        :code="basicCode"
      >
        <RangeSlider
          v-model="ex1"
          show-value
          :label="t('pages.forms.rangeSlider.examples.basic.label')"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rangeSlider.examples.marks.title')"
        :description="t('pages.forms.rangeSlider.examples.marks.desc')"
        :code="marksCode"
      >
        <RangeSlider
          v-model="ex2"
          :min="0"
          :max="100"
          :step="20"
          :marks="true"
          :label="t('pages.forms.rangeSlider.examples.marks.label')"
          show-value
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rangeSlider.examples.formatted.title')"
        :description="t('pages.forms.rangeSlider.examples.formatted.desc')"
        :code="formattedCode"
      >
        <RangeSlider
          v-model="ex3"
          :min="0"
          :max="1000"
          :step="10"
          :format-value="formatPrice"
          show-value
          :label="t('pages.forms.rangeSlider.examples.formatted.label')"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rangeSlider.examples.colors.title')"
        :description="t('pages.forms.rangeSlider.examples.colors.desc')"
        :code="colorCode"
      >
        <div class="flex flex-col gap-4">
          <RangeSlider
            v-model="ex4a"
            color="success"
            show-value
            label="Success"
            class="w-72"
          />
          <RangeSlider
            v-model="ex4b"
            color="warning"
            show-value
            label="Warning"
            class="w-72"
          />
          <RangeSlider
            v-model="ex4c"
            color="danger"
            show-value
            label="Danger"
            class="w-72"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rangeSlider.examples.disabled.title')"
        :description="t('pages.forms.rangeSlider.examples.disabled.desc')"
        :code="disabledCode"
      >
        <RangeSlider
          :model-value="[30, 70]"
          disabled
          show-value
          :label="t('pages.forms.rangeSlider.examples.disabled.label')"
          class="w-72"
        />
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
        {{ t("pages.forms.rangeSlider.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.rangeSlider.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
