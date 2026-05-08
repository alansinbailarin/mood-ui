<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Slider from "../../../components/forms/Slider.vue";
import type { PropDoc, EmitDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref(50);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
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

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Slider v-model="volume" show-value label="Volumen" />`;

const marksCode = `<Slider
    v-model="value"
    :min="0"
    :max="100"
    :step="25"
    :marks="true"
    label="Calidad"
    show-value
/>`;

const stepCode = `<Slider v-model="value" :min="0" :max="50" :step="5" show-value label="Step de 5" />`;

const colorCode = `<Slider v-model="value" color="success" show-value label="Success" />
<Slider v-model="value" color="warning" show-value label="Warning" />
<Slider v-model="value" color="danger"  show-value label="Danger" />`;

const disabledCode = `<Slider :model-value="40" disabled show-value label="Disabled" />`;

const ex1 = ref(35);
const ex2 = ref(50);
const ex3 = ref(20);
const ex4a = ref(60);
const ex4b = ref(60);
const ex4c = ref(60);

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
  </ComponentDoc>
</template>
