<script setup lang="ts">
import { ref, computed } from "vue";
import { Switch, Typography } from "mood-ui";
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
  { keys: ["Tab"], action: t("pages.forms.switch.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.switch.a11y.kbShiftTab") },
  { keys: ["Space"], action: t("pages.forms.switch.a11y.kbSpace") },
  { keys: ["Enter"], action: t("pages.forms.switch.a11y.kbEnter") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-checked",
    value: "true",
    desc: t("pages.forms.switch.a11y.ariaChecked"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.switch.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.switch.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.switch.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.switch.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.switch.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.switch.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgChecked = ref(true);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
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
  return `<Switch v-model="checked" label="Notifications"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from 'mood-ui';

const pushEnabled = ref(true);
const darkMode    = ref(false);
<\/script>

<template>
  <Switch v-model="pushEnabled" label="Push notifications" />
  <Switch v-model="darkMode"    label="Dark mode" />
</template>`;

const descriptionCode = `<script setup lang="ts">
import { Switch } from 'mood-ui';
<\/script>

<template>
  <Switch
    label="Marketing"
    description="Receive product updates."
    :model-value="true"
  />
</template>`;

const labelLeftCode = `<script setup lang="ts">
import { Switch } from 'mood-ui';
<\/script>

<template>
  <Switch label-position="left" label="Active" :model-value="true" />
</template>`;

const colorsCode = `<script setup lang="ts">
import { Switch } from 'mood-ui';
<\/script>

<template>
  <Switch :model-value="true" color="primary" label="primary" />
  <Switch :model-value="true" color="success" label="success" />
  <Switch :model-value="true" color="warning" label="warning" />
  <Switch :model-value="true" color="danger"  label="danger" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Switch } from 'mood-ui';
<\/script>

<template>
  <Switch :model-value="true" size="small"  label="small" />
  <Switch :model-value="true" size="medium" label="medium" />
  <Switch :model-value="true" size="large"  label="large" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { Switch } from 'mood-ui';
<\/script>

<template>
  <Switch :model-value="true"  disabled label="Disabled on" />
  <Switch :model-value="false" disabled label="Disabled off" />
</template>`;

// Example state
const ex1A = ref(true);
const ex1B = ref(false);

const typesCode = `export interface Switch {
  modelValue?: boolean;
  label?: string;
  description?: string;
  helperText?: string;
  errorText?: string;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  labelPosition?: 'left' | 'right';
  id?: string;
  name?: string;
  ariaLabel?: string;
}`;

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
              { value: 'xsmall' },
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
          label="Notifications"
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
          <Switch v-model="ex1A" label="Push notifications" />
          <Switch v-model="ex1B" label="Dark mode" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.description.title')"
        :description="t('pages.forms.switch.examples.description.desc')"
        :code="descriptionCode"
      >
        <Switch
          label="Marketing"
          description="Receive product updates."
          :model-value="true"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.switch.examples.labelLeft.title')"
        :description="t('pages.forms.switch.examples.labelLeft.desc')"
        :code="labelLeftCode"
      >
        <Switch label-position="left" label="Active" :model-value="true" />
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

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.switch.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.switch.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
