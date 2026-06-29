<script setup lang="ts">
import { ref, computed } from "vue";
import { Slider, Typography } from "mood-ui";
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


useSeoMeta({
  title: () => t("pages.forms.slider.title"),
  description: () => t("pages.forms.slider.description"),
  ogTitle: () => `${t("pages.forms.slider.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.slider.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.slider.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.slider.a11y.kbShiftTab") },
  { keys: ["↑", "↓", "←", "→"], action: t("pages.forms.slider.a11y.kbArrow") },
  { keys: ["Home"], action: t("pages.forms.slider.a11y.kbHome") },
  { keys: ["End"], action: t("pages.forms.slider.a11y.kbEnd") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-valuenow",
    value: "number",
    desc: t("pages.forms.slider.a11y.ariaValueNow"),
  },
  {
    attribute: "aria-valuemin",
    value: "number",
    desc: t("pages.forms.slider.a11y.ariaValueMin"),
  },
  {
    attribute: "aria-valuemax",
    value: "number",
    desc: t("pages.forms.slider.a11y.ariaValueMax"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.slider.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.slider.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.slider.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.slider.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.slider.a11y.focusThumb"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref(50);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgStep = ref("1");
const pgMarks = ref(false);
const pgDisabled = ref(false);
const pgReadonly = ref(false);

function resetPlayground() {
  pgValue.value = 50;
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgStep.value = "1";
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
  if (pgStep.value !== "1") parts.push(`:step="${pgStep.value}"`);
  if (pgMarks.value) parts.push(':marks="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgReadonly.value) parts.push(':readonly="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<Slider
    v-model="value"
    :min="0"
    :max="100"
    show-value${attrs}
/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from 'mood-ui';

const volume = ref(35);
<\/script>

<template>
  <Slider v-model="volume" show-value label="Volume" />
</template>`;

const marksCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from 'mood-ui';

const value = ref(50);
<\/script>

<template>
  <Slider
    v-model="value"
    :min="0"
    :max="100"
    :step="25"
    :marks="true"
    label="Quality"
    show-value
  />
</template>`;

const stepCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from 'mood-ui';

const value = ref(20);
<\/script>

<template>
  <Slider v-model="value" :min="0" :max="50" :step="5" show-value label="Step of 5" />
</template>`;

const colorCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Slider } from 'mood-ui';

const value = ref(60);
<\/script>

<template>
  <Slider v-model="value" color="success" show-value label="Success" />
  <Slider v-model="value" color="warning" show-value label="Warning" />
  <Slider v-model="value" color="danger"  show-value label="Danger" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { Slider } from 'mood-ui';
<\/script>

<template>
  <Slider :model-value="40" disabled show-value label="Disabled" />
</template>`;

const ex1 = ref(35);
const ex2 = ref(50);
const ex3 = ref(20);
const ex4a = ref(60);
const ex4b = ref(60);
const ex4c = ref(60);

const typesCode = `export interface Slider {
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
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
    type: "number",
    description: t("pages.forms.slider.props.modelValue"),
  },
  {
    name: "min",
    type: "number",
    default: "0",
    description: t("pages.forms.slider.props.min"),
  },
  {
    name: "max",
    type: "number",
    default: "100",
    description: t("pages.forms.slider.props.max"),
  },
  {
    name: "step",
    type: "number",
    default: "1",
    description: t("pages.forms.slider.props.step"),
  },
  {
    name: "showValue",
    type: "boolean",
    default: "false",
    description: t("pages.forms.slider.props.showValue"),
  },
  {
    name: "formatValue",
    type: "(v: number) => string",
    description: t("pages.forms.slider.props.formatValue"),
  },
  {
    name: "marks",
    type: "boolean | number[] | { value, label? }[]",
    description: t("pages.forms.slider.props.marks"),
  },
  {
    name: "orientation",
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: t("pages.forms.slider.props.orientation"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.slider.props.label"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.slider.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.slider.props.errorText"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.slider.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.slider.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'full'",
    description: t("pages.forms.slider.props.radius"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.slider.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.slider.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.slider.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.slider.props.required"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "number",
    description: t("pages.forms.slider.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "number",
    description: t("pages.forms.slider.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.slider.title')"
    category="Forms"
    import-path="import { Slider } from 'mood-ui'"
    :description="t('pages.forms.slider.description')"
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
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            label="Step"
            :options="[{ value: '1' }, { value: '5' }, { value: '10' }]"
            v-model="pgStep"
          />
          <TbSep />
          <TbToggle label="Marks" v-model="pgMarks" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
          <TbToggle label="Readonly" v-model="pgReadonly" />
        </template>

        <Slider
          v-model="pgValue"
          :min="0"
          :max="100"
          :step="Number(pgStep)"
          :color="pgColor"
          :size="pgSize"
          :marks="pgMarks"
          :disabled="pgDisabled"
          :readonly="pgReadonly"
          show-value
          label="Valor"
          class="w-72"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.slider.examples.basic.title')"
        :description="t('pages.forms.slider.examples.basic.desc')"
        :code="basicCode"
      >
        <Slider v-model="ex1" show-value label="Volumen" class="w-72" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.slider.examples.marks.title')"
        :description="t('pages.forms.slider.examples.marks.desc')"
        :code="marksCode"
      >
        <Slider
          v-model="ex2"
          :min="0"
          :max="100"
          :step="25"
          :marks="true"
          label="Calidad"
          show-value
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.slider.examples.step.title')"
        :description="t('pages.forms.slider.examples.step.desc')"
        :code="stepCode"
      >
        <Slider
          v-model="ex3"
          :min="0"
          :max="50"
          :step="5"
          show-value
          label="Step de 5"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.slider.examples.colors.title')"
        :description="t('pages.forms.slider.examples.colors.desc')"
        :code="colorCode"
      >
        <div class="flex flex-col gap-4">
          <Slider
            v-model="ex4a"
            color="success"
            show-value
            label="Success"
            class="w-72"
          />
          <Slider
            v-model="ex4b"
            color="warning"
            show-value
            label="Warning"
            class="w-72"
          />
          <Slider
            v-model="ex4c"
            color="danger"
            show-value
            label="Danger"
            class="w-72"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.slider.examples.disabled.title')"
        :description="t('pages.forms.slider.examples.disabled.desc')"
        :code="disabledCode"
      >
        <Slider
          :model-value="40"
          disabled
          show-value
          label="Disabled"
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
        {{ t("pages.forms.slider.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.slider.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
