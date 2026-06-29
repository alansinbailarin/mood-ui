<script setup lang="ts">
import { ref, computed } from "vue";
import { Radio } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";

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
  title: () => t("pages.forms.radio.title"),
  description: () => t("pages.forms.radio.description"),
  ogTitle: () => `${t("pages.forms.radio.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.radio.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.radio.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.radio.a11y.kbShiftTab") },
  { keys: ["Space"], action: t("pages.forms.radio.a11y.kbSpace") },
  { keys: ["↑", "↓", "←", "→"], action: t("pages.forms.radio.a11y.kbArrow") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-checked",
    value: "true",
    desc: t("pages.forms.radio.a11y.ariaChecked"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.radio.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.radio.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.radio.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.radio.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.radio.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.radio.a11y.focusNative"),
  t("pages.forms.radio.a11y.focusGroup"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<string>("a");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgDisabled = ref(false);
const pgLoading = ref(false);

function resetPlayground() {
  pgValue.value = "a";
  pgColor.value = "primary";
  pgSize.value = "medium";
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
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgLoading.value) parts.push(':loading="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Radio v-model="choice" value="a" label="Option A"${attrs} />
<Radio v-model="choice" value="b" label="Option B"${attrs} />
<Radio v-model="choice" value="c" label="Option C"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from 'mood-ui';

const choice = ref('a');
<\/script>

<template>
  <Radio v-model="choice" value="a" label="Option A" />
  <Radio v-model="choice" value="b" label="Option B" />
  <Radio v-model="choice" value="c" label="Option C" />
</template>`;

const descriptionCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Radio } from 'mood-ui';

const plan = ref('pro');
<\/script>

<template>
  <Radio
    v-model="plan"
    value="free"
    label="Free"
    description="For personal use with basic features."
  />
  <Radio
    v-model="plan"
    value="pro"
    label="Pro"
    description="For small teams with advanced features."
  />
</template>`;

const colorsCode = `<script setup lang="ts">
import { Radio } from 'mood-ui';
<\/script>

<template>
  <Radio :model-value="'x'" value="x" color="primary" label="primary" />
  <Radio :model-value="'x'" value="x" color="success" label="success" />
  <Radio :model-value="'x'" value="x" color="warning" label="warning" />
  <Radio :model-value="'x'" value="x" color="danger"  label="danger" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Radio } from 'mood-ui';
<\/script>

<template>
  <Radio :model-value="'x'" value="x" size="small"  label="small" />
  <Radio :model-value="'x'" value="x" size="medium" label="medium" />
  <Radio :model-value="'x'" value="x" size="large"  label="large" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { Radio } from 'mood-ui';
<\/script>

<template>
  <Radio model-value="x" value="x" label="Selected disabled" disabled />
  <Radio model-value="x" value="y" label="Not selected disabled" disabled />
</template>`;

// Example state
const choice = ref("a");
const plan = ref("pro");

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | number | null",
    description: t("pages.forms.radio.props.modelValue"),
  },
  {
    name: "value",
    type: "string | number",
    description: t("pages.forms.radio.props.value"),
    required: true,
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.radio.props.label"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.forms.radio.props.description"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.radio.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.radio.props.size"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.radio.props.disabled"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.radio.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.radio.props.loading"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.radio.props.name"),
  },
  { name: "id", type: "string", description: t("pages.forms.radio.props.id") },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.radio.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | number",
    description: t("pages.forms.radio.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string | number",
    description: t("pages.forms.radio.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.radio.title')"
    category="Forms"
    import-path="import { Radio } from 'mood-ui'"
    :description="t('pages.forms.radio.description')"
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
            :label="t('pages.forms.radio.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.radio.controls.size')"
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
            :label="t('pages.forms.radio.controls.loading')"
            v-model="pgLoading"
          />
          <TbToggle
            :label="t('pages.forms.radio.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <div class="flex flex-col gap-2">
          <Radio
            v-model="pgValue"
            value="a"
            :label="t('pages.forms.radio.playground.optionA')"
            :color="pgColor"
            :size="pgSize"
            :loading="pgLoading"
            :disabled="pgDisabled"
          />
          <Radio
            v-model="pgValue"
            value="b"
            :label="t('pages.forms.radio.playground.optionB')"
            :color="pgColor"
            :size="pgSize"
            :loading="pgLoading"
            :disabled="pgDisabled"
          />
          <Radio
            v-model="pgValue"
            value="c"
            :label="t('pages.forms.radio.playground.optionC')"
            :color="pgColor"
            :size="pgSize"
            :loading="pgLoading"
            :disabled="pgDisabled"
          />
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.radio.examples.basic.title')"
        :description="t('pages.forms.radio.examples.basic.desc')"
        :code="basicCode"
      >
        <div class="flex flex-col gap-2">
          <Radio
            v-model="choice"
            value="a"
            :label="t('pages.forms.radio.examples.basic.optionA')"
          />
          <Radio
            v-model="choice"
            value="b"
            :label="t('pages.forms.radio.examples.basic.optionB')"
          />
          <Radio
            v-model="choice"
            value="c"
            :label="t('pages.forms.radio.examples.basic.optionC')"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radio.examples.description.title')"
        :description="t('pages.forms.radio.examples.description.desc')"
        :code="descriptionCode"
      >
        <div class="flex flex-col gap-3">
          <Radio
            v-model="plan"
            value="free"
            :label="t('pages.forms.radio.examples.description.freeLabel')"
            :description="t('pages.forms.radio.examples.description.freeDesc')"
          />
          <Radio
            v-model="plan"
            value="pro"
            :label="t('pages.forms.radio.examples.description.proLabel')"
            :description="t('pages.forms.radio.examples.description.proDesc')"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radio.examples.colors.title')"
        :description="t('pages.forms.radio.examples.colors.desc')"
        :code="colorsCode"
      >
        <Radio :model-value="'x'" value="x" color="primary" label="primary" />
        <Radio :model-value="'x'" value="x" color="success" label="success" />
        <Radio :model-value="'x'" value="x" color="warning" label="warning" />
        <Radio :model-value="'x'" value="x" color="danger" label="danger" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radio.examples.sizes.title')"
        :description="t('pages.forms.radio.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Radio :model-value="'x'" value="x" size="small" label="small" />
        <Radio :model-value="'x'" value="x" size="medium" label="medium" />
        <Radio :model-value="'x'" value="x" size="large" label="large" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radio.examples.disabled.title')"
        :description="t('pages.forms.radio.examples.disabled.desc')"
        :code="disabledCode"
      >
        <Radio
          model-value="x"
          value="x"
          :label="t('pages.forms.radio.examples.disabled.selectedLabel')"
          disabled
        />
        <Radio
          model-value="x"
          value="y"
          :label="t('pages.forms.radio.examples.disabled.notSelectedLabel')"
          disabled
        />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
