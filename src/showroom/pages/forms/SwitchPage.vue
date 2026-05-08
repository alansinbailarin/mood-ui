<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Switch from "../../../components/forms/Switch.vue";
import type { PropDoc, EmitDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgChecked = ref(true);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgLabelPos = ref<"left" | "right">("right");
const pgDisabled = ref(false);
const pgLoading = ref(false);

function resetPlayground() {
  pgChecked.value = true;
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgLabelPos.value = "right";
  pgDisabled.value = false;
  pgLoading.value = false;
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
  if (pgLabelPos.value !== "right")
    parts.push(`label-position="${pgLabelPos.value}"`);
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgLoading.value) parts.push(':loading="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Switch v-model="checked" label="Notificaciones"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Switch v-model="pushEnabled" label="Notificaciones push" />
<Switch v-model="darkMode"    label="Modo oscuro" />`;

const descriptionCode = `<Switch
    label="Marketing"
    description="Recibir novedades de producto."
    :model-value="true"
/>`;

const labelLeftCode = `<Switch label-position="left" label="Activo" :model-value="true" />`;

const colorsCode = `<Switch :model-value="true" color="primary" label="primary" />
<Switch :model-value="true" color="success" label="success" />
<Switch :model-value="true" color="warning" label="warning" />
<Switch :model-value="true" color="danger"  label="danger" />`;

const sizesCode = `<Switch :model-value="true" size="small"  label="small" />
<Switch :model-value="true" size="medium" label="medium" />
<Switch :model-value="true" size="large"  label="large" />`;

const disabledCode = `<Switch :model-value="true"  disabled label="Disabled on" />
<Switch :model-value="false" disabled label="Disabled off" />`;

// Example state
const ex1A = ref(true);
const ex1B = ref(false);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "boolean",
    default: "false",
    description: t("pages.forms.switch.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.switch.props.label"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.forms.switch.props.description"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.switch.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.switch.props.errorText"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.switch.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.switch.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'full'",
    description: t("pages.forms.switch.props.radius"),
  },
  {
    name: "labelPosition",
    type: "'left' | 'right'",
    default: "'right'",
    description: t("pages.forms.switch.props.labelPosition"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.switch.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.switch.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.switch.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.switch.props.loading"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.switch.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.switch.props.id"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.switch.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "boolean",
    description: t("pages.forms.switch.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "boolean",
    description: t("pages.forms.switch.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.switch.title')"
    category="Forms"
    import-path="import { Switch } from 'mood-ui'"
    :description="t('pages.forms.switch.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="180px"
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
            label="Label"
            :options="[{ value: 'left' }, { value: 'right' }]"
            v-model="pgLabelPos"
          />
          <TbSep />
          <TbToggle label="Loading" v-model="pgLoading" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <Switch
          v-model="pgChecked"
          label="Notificaciones"
          :color="pgColor"
          :size="pgSize"
          :label-position="pgLabelPos"
          :loading="pgLoading"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.switch.examples.basic.title')"
        :description="t('pages.forms.switch.examples.basic.desc')"
        :code="basicCode"
      >
        <div class="flex flex-col gap-3">
          <Switch v-model="ex1A" label="Notificaciones push" />
          <Switch v-model="ex1B" label="Modo oscuro" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.description.title')"
        :description="t('pages.forms.switch.examples.description.desc')"
        :code="descriptionCode"
      >
        <Switch
          label="Marketing"
          description="Recibir novedades de producto."
          :model-value="true"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.labelLeft.title')"
        :description="t('pages.forms.switch.examples.labelLeft.desc')"
        :code="labelLeftCode"
      >
        <Switch label-position="left" label="Activo" :model-value="true" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.colors.title')"
        :description="t('pages.forms.switch.examples.colors.desc')"
        :code="colorsCode"
      >
        <Switch :model-value="true" color="primary" label="primary" />
        <Switch :model-value="true" color="success" label="success" />
        <Switch :model-value="true" color="warning" label="warning" />
        <Switch :model-value="true" color="danger" label="danger" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.sizes.title')"
        :description="t('pages.forms.switch.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Switch :model-value="true" size="small" label="small" />
        <Switch :model-value="true" size="medium" label="medium" />
        <Switch :model-value="true" size="large" label="large" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.disabled.title')"
        :description="t('pages.forms.switch.examples.disabled.desc')"
        :code="disabledCode"
      >
        <Switch :model-value="true" disabled label="Disabled on" />
        <Switch :model-value="false" disabled label="Disabled off" />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
