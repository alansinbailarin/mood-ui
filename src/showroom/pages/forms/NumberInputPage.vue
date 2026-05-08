<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import NumberInput from "../../../components/forms/NumberInput.vue";
import type { PropDoc, EmitDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<number | null>(10);
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgSteppers = ref(true);
const pgStepperPosition = ref<"right" | "split">("right");
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = 10;
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgSteppers.value = true;
  pgStepperPosition.value = "right";
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
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (!pgSteppers.value) parts.push(':steppers="false"');
  if (pgStepperPosition.value !== "right")
    parts.push(`stepper-position="${pgStepperPosition.value}"`);
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<NumberInput v-model="quantity" label="Cantidad"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<NumberInput v-model="quantity" label="Cantidad" />`;

const minMaxCode = `<NumberInput v-model="qty" label="Unidades" :min="0" :max="10" :step="1" />`;

const priceCode = `<NumberInput
    v-model="price"
    label="Precio"
    prefix="$"
    suffix="USD"
    :precision="2"
    :step="0.01"
    thousand-separator
/>`;

const splitCode = `<NumberInput v-model="qty" stepper-position="split" />`;

const disabledCode = `<NumberInput :model-value="42" disabled label="Cantidad" />`;

// Example state
const exBasic = ref<number | null>(0);
const exQty = ref<number | null>(1);
const exPrice = ref<number | null>(1299.99);
const exSplit = ref<number | null>(5);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "number | null",
    description: t("pages.forms.numberInput.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.numberInput.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.numberInput.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.numberInput.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.numberInput.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.numberInput.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.numberInput.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.numberInput.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.numberInput.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.numberInput.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.loading"),
  },
  {
    name: "min",
    type: "number",
    description: t("pages.forms.numberInput.props.min"),
  },
  {
    name: "max",
    type: "number",
    description: t("pages.forms.numberInput.props.max"),
  },
  {
    name: "step",
    type: "number",
    default: "1",
    description: t("pages.forms.numberInput.props.step"),
  },
  {
    name: "precision",
    type: "number",
    description: t("pages.forms.numberInput.props.precision"),
  },
  {
    name: "steppers",
    type: "boolean",
    default: "true",
    description: t("pages.forms.numberInput.props.steppers"),
  },
  {
    name: "stepperPosition",
    type: "'right' | 'split'",
    default: "'right'",
    description: t("pages.forms.numberInput.props.stepperPosition"),
  },
  {
    name: "allowInvalid",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.allowInvalid"),
  },
  {
    name: "thousandSeparator",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.thousandSeparator"),
  },
  {
    name: "prefix",
    type: "string",
    description: t("pages.forms.numberInput.props.prefix"),
  },
  {
    name: "suffix",
    type: "string",
    description: t("pages.forms.numberInput.props.suffix"),
  },
  {
    name: "iconLeft",
    type: "Component",
    description: t("pages.forms.numberInput.props.iconLeft"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.numberInput.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.numberInput.props.id"),
  },
  {
    name: "autocomplete",
    type: "string",
    description: t("pages.forms.numberInput.props.autocomplete"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.numberInput.props.autofocus"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.numberInput.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "number | null",
    description: t("pages.forms.numberInput.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "number | null",
    description: t("pages.forms.numberInput.emits.change"),
  },
  {
    name: "focus",
    payload: "FocusEvent",
    description: t("pages.forms.numberInput.emits.focus"),
  },
  {
    name: "blur",
    payload: "FocusEvent",
    description: t("pages.forms.numberInput.emits.blur"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.numberInput.title')"
    category="Forms"
    import-path="import { NumberInput } from 'mood-ui'"
    :description="t('pages.forms.numberInput.description')"
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
          <TbPills
            label="Variant"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
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
            label="Steppers"
            :options="[{ value: 'right' }, { value: 'split' }]"
            v-model="pgStepperPosition"
          />
          <TbSep />
          <TbToggle label="Steppers" v-model="pgSteppers" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <NumberInput
          v-model="pgValue"
          label="Cantidad"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :steppers="pgSteppers"
          :stepper-position="pgStepperPosition"
          :disabled="pgDisabled"
          style="width: 220px"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.numberInput.examples.basic.title')"
        :description="t('pages.forms.numberInput.examples.basic.desc')"
        :code="basicCode"
      >
        <NumberInput v-model="exBasic" label="Cantidad" style="width: 220px" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.numberInput.examples.minMax.title')"
        :description="t('pages.forms.numberInput.examples.minMax.desc')"
        :code="minMaxCode"
      >
        <NumberInput
          v-model="exQty"
          label="Unidades"
          :min="0"
          :max="10"
          :step="1"
          style="width: 220px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.numberInput.examples.price.title')"
        :description="t('pages.forms.numberInput.examples.price.desc')"
        :code="priceCode"
      >
        <NumberInput
          v-model="exPrice"
          label="Precio"
          prefix="$"
          suffix="USD"
          :precision="2"
          :step="0.01"
          thousand-separator
          style="width: 240px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.numberInput.examples.split.title')"
        :description="t('pages.forms.numberInput.examples.split.desc')"
        :code="splitCode"
      >
        <NumberInput
          v-model="exSplit"
          stepper-position="split"
          style="width: 220px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.numberInput.examples.disabled.title')"
        :description="t('pages.forms.numberInput.examples.disabled.desc')"
        :code="disabledCode"
      >
        <NumberInput
          :model-value="42"
          disabled
          label="Cantidad"
          style="width: 220px"
        />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
