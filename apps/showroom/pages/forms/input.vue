<script setup lang="ts">
import { ref, computed } from "vue";
import { Input, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import { EnvelopeIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
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
  title: () => t("pages.forms.input.title"),
  description: () => t("pages.forms.input.description"),
  ogTitle: () => `${t("pages.forms.input.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.input.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.input.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.input.a11y.kbShiftTab") },
  { keys: ["Type"], action: t("pages.forms.input.a11y.kbType") },
  { keys: ["Enter"], action: t("pages.forms.input.a11y.kbEnter") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.input.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.input.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.input.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.input.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.input.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.input.a11y.focusNative"),
  t("pages.forms.input.a11y.focusClear"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref("mood@example.com");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgClearable = ref(true);
const pgDisabled = ref(false);
const pgReadonly = ref(false);
const pgLoading = ref(false);

function resetPlayground() {
  pgValue.value = "mood@example.com";
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgClearable.value = true;
  pgDisabled.value = false;
  pgReadonly.value = false;
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
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgClearable.value) parts.push("clearable");
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgReadonly.value) parts.push(':readonly="true"');
  if (pgLoading.value) parts.push(':loading="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Input v-model="value" label="Email" placeholder="tu@email.com"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Input } from 'mood-ui';

const email = ref('');
<\/script>

<template>
  <Input v-model="email" label="Email" placeholder="tu@email.com" />
</template>`;

const variantsCode = `<script setup lang="ts">
import { Input } from 'mood-ui';
<\/script>

<template>
  <Input variant="outline" placeholder="outline" />
  <Input variant="filled"  placeholder="filled"  />
  <Input variant="ghost"   placeholder="ghost"   />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Input } from 'mood-ui';
<\/script>

<template>
  <Input size="small"  placeholder="small"  />
  <Input size="medium" placeholder="medium" />
  <Input size="large"  placeholder="large"  />
</template>`;

const iconsCode = `<script setup lang="ts">
import { Input } from 'mood-ui';
import { EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Input :icon-left="EnvelopeIcon"        placeholder="Email" />
  <Input :icon-right="MagnifyingGlassIcon" placeholder="Search" />
  <Input prefix="$" suffix="USD"           placeholder="0.00" />
</template>`;

const statesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Input } from 'mood-ui';

const email = ref('not-an-email');
<\/script>

<template>
  <Input disabled placeholder="Disabled" />
  <Input readonly model-value="Read-only" />
  <Input v-model="email" error-text="Invalid email" label="Email" />
</template>`;

// Example state
const exBasic = ref("");
const exErr = ref("not-an-email");

const typesCode = `export interface Input {
  modelValue?: string | number | null;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  type?: 'text' | 'email' | 'url' | 'tel' | 'search';
  variant?: 'outline' | 'filled' | 'ghost';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  fullWidth?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  clearable?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  iconLeft?: Component;
  iconRight?: Component;
  prefix?: string;
  suffix?: string;
  id?: string;
  name?: string;
  autocomplete?: string;
  autofocus?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | number | null",
    description: t("pages.forms.input.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.input.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.input.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.input.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.input.props.errorText"),
  },
  {
    name: "type",
    type: "'text' | 'email' | 'url' | 'tel' | 'search'",
    default: "'text'",
    description: t("pages.forms.input.props.type"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.input.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.input.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.input.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.input.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.input.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.loading"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.clearable"),
  },
  {
    name: "maxLength",
    type: "number",
    description: t("pages.forms.input.props.maxLength"),
  },
  {
    name: "showCounter",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.showCounter"),
  },
  {
    name: "iconLeft",
    type: "Component",
    description: t("pages.forms.input.props.iconLeft"),
  },
  {
    name: "iconRight",
    type: "Component",
    description: t("pages.forms.input.props.iconRight"),
  },
  {
    name: "prefix",
    type: "string",
    description: t("pages.forms.input.props.prefix"),
  },
  {
    name: "suffix",
    type: "string",
    description: t("pages.forms.input.props.suffix"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.input.props.name"),
  },
  { name: "id", type: "string", description: t("pages.forms.input.props.id") },
  {
    name: "autocomplete",
    type: "string",
    description: t("pages.forms.input.props.autocomplete"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.input.props.autofocus"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.input.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string",
    description: t("pages.forms.input.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string",
    description: t("pages.forms.input.emits.change"),
  },
  {
    name: "focus",
    payload: "FocusEvent",
    description: t("pages.forms.input.emits.focus"),
  },
  {
    name: "blur",
    payload: "FocusEvent",
    description: t("pages.forms.input.emits.blur"),
  },
  {
    name: "clear",
    payload: "void",
    description: t("pages.forms.input.emits.clear"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.input.title')"
    category="Forms"
    import-path="import { Input } from 'mood-ui'"
    :description="t('pages.forms.input.description')"
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
            :label="t('pages.forms.input.controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.input.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.input.controls.size')"
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
            :label="t('pages.forms.input.controls.clearable')"
            v-model="pgClearable"
          />
          <TbToggle
            :label="t('pages.forms.input.controls.loading')"
            v-model="pgLoading"
          />
          <TbToggle
            :label="t('pages.forms.input.controls.disabled')"
            v-model="pgDisabled"
          />
          <TbToggle
            :label="t('pages.forms.input.controls.readonly')"
            v-model="pgReadonly"
          />
        </template>

        <Input
          v-model="pgValue"
          :label="t('pages.forms.input.playground.label')"
          :placeholder="t('pages.forms.input.playground.placeholder')"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :clearable="pgClearable"
          :disabled="pgDisabled"
          :readonly="pgReadonly"
          :loading="pgLoading"
          style="width: 280px"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.input.examples.basic.title')"
        :description="t('pages.forms.input.examples.basic.desc')"
        :code="basicCode"
      >
        <Input
          v-model="exBasic"
          :label="t('pages.forms.input.examples.basic.label')"
          :placeholder="t('pages.forms.input.examples.basic.ph')"
          style="width: 280px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.input.examples.variants.title')"
        :description="t('pages.forms.input.examples.variants.desc')"
        :code="variantsCode"
      >
        <Input variant="outline" placeholder="outline" ariaLabel="outline" style="width: 200px" />
        <Input variant="filled" placeholder="filled" ariaLabel="filled" style="width: 200px" />
        <Input variant="ghost" placeholder="ghost" ariaLabel="ghost" style="width: 200px" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.input.examples.sizes.title')"
        :description="t('pages.forms.input.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Input size="small" placeholder="small" ariaLabel="small" style="width: 200px" />
        <Input size="medium" placeholder="medium" ariaLabel="medium" style="width: 200px" />
        <Input size="large" placeholder="large" ariaLabel="large" style="width: 200px" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.input.examples.icons.title')"
        :description="t('pages.forms.input.examples.icons.desc')"
        :code="iconsCode"
      >
        <Input
          :icon-left="EnvelopeIcon"
          :placeholder="t('pages.forms.input.examples.icons.emailPh')"
          ariaLabel="Email"
          style="width: 240px"
        />
        <Input
          :icon-right="MagnifyingGlassIcon"
          :placeholder="t('pages.forms.input.examples.icons.searchPh')"
          ariaLabel="Search"
          style="width: 240px"
        />
        <Input
          prefix="$"
          suffix="USD"
          placeholder="0.00"
          ariaLabel="Amount in USD"
          style="width: 200px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.input.examples.states.title')"
        :description="t('pages.forms.input.examples.states.desc')"
        :code="statesCode"
      >
        <Input disabled placeholder="Disabled" ariaLabel="Disabled" style="width: 200px" />
        <Input
          readonly
          :model-value="t('pages.forms.input.examples.states.readonlyVal')"
          ariaLabel="Read-only"
          style="width: 200px"
        />
        <Input
          v-model="exErr"
          :error-text="t('pages.forms.input.examples.states.errorText')"
          :label="t('pages.forms.input.examples.states.errorLabel')"
          style="width: 240px"
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
        {{ t("pages.forms.input.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.input.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
