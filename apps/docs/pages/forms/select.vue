<script setup lang="ts">
import { ref, computed } from "vue";
import { Select, Typography } from "mood-ui";
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
  title: () => t("pages.forms.select.title"),
  description: () => t("pages.forms.select.description"),
  ogTitle: () => `${t("pages.forms.select.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.select.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.select.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.select.a11y.kbShiftTab") },
  { keys: ["Enter"], action: t("pages.forms.select.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.forms.select.a11y.kbEsc") },
  { keys: ["↑", "↓"], action: t("pages.forms.select.a11y.kbArrow") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.forms.select.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.select.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.select.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.select.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.select.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.select.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.select.a11y.focusNative"),
  t("pages.forms.select.a11y.focusTrap"),
]);

const countries = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
];

const grouped = [
  { value: "es", label: "Spanish", group: "Europe" },
  { value: "fr", label: "French", group: "Europe" },
  { value: "de", label: "German", group: "Europe" },
  { value: "en", label: "English", group: "Americas" },
  { value: "pt", label: "Portuguese", group: "Americas" },
  { value: "ja", label: "Japanese", group: "Asia" },
  { value: "zh", label: "Chinese", group: "Asia" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<string | number | null>("us");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgClearable = ref(true);
const pgSearchable = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "mx";
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgClearable.value = true;
  pgSearchable.value = false;
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
  if (pgClearable.value) parts.push("clearable");
  if (pgSearchable.value) parts.push("searchable");
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<Select\n    v-model="value"\n    :options="countries"\n    label="Country"${attrs}\n/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const country = ref<string | number | null>(null);

const countries: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];
<\/script>

<template>
  <Select v-model="country" :options="countries" label="Country" placeholder="Choose a country" />
</template>`;

const searchableCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const lang = ref<string | number | null>(null);

const grouped: SelectOption[] = [
  { value: 'es', label: 'Spanish',    group: 'Europe' },
  { value: 'fr', label: 'French',     group: 'Europe' },
  { value: 'de', label: 'German',     group: 'Europe' },
  { value: 'en', label: 'English',    group: 'Americas' },
  { value: 'pt', label: 'Portuguese', group: 'Americas' },
  { value: 'ja', label: 'Japanese',   group: 'Asia' },
  { value: 'zh', label: 'Chinese',    group: 'Asia' },
];
<\/script>

<template>
  <Select
    v-model="lang"
    :options="grouped"
    label="Language"
    searchable
    placeholder="Search language…"
  />
</template>`;

const groupedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const lang = ref<string | number | null>('es');

const grouped: SelectOption[] = [
  { value: 'es', label: 'Spanish',    group: 'Europe' },
  { value: 'fr', label: 'French',     group: 'Europe' },
  { value: 'de', label: 'German',     group: 'Europe' },
  { value: 'en', label: 'English',    group: 'Americas' },
  { value: 'pt', label: 'Portuguese', group: 'Americas' },
  { value: 'ja', label: 'Japanese',   group: 'Asia' },
  { value: 'zh', label: 'Chinese',    group: 'Asia' },
];
<\/script>

<template>
  <Select v-model="lang" :options="grouped" label="Language" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const countries: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];
<\/script>

<template>
  <Select :options="countries" size="small"  placeholder="Small" />
  <Select :options="countries" size="medium" placeholder="Medium" />
  <Select :options="countries" size="large"  placeholder="Large" />
</template>`;

const statesCode = `<script setup lang="ts">
import { Select } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const countries: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];
<\/script>

<template>
  <Select :options="countries" label="Loading" loading  placeholder="Loading…" />
  <Select :options="countries" label="Disabled" disabled placeholder="Not editable" />
  <Select :options="countries" label="Error" error-text="Select a country" />
</template>`;

const typesCode = `export interface Select {
  modelValue?: SelectValue | null;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
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
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  iconLeft?: Component;
  panelWidth?: 'trigger' | 'auto';
  panelMinWidth?: number | string;
  id?: string;
  name?: string;
  autofocus?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}`;

const ex1 = ref<string | number | null>(null);
const ex2 = ref<string | number | null>(null);
const ex3 = ref<string | number | null>("es");

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | number | null",
    description: t("pages.forms.select.props.modelValue"),
  },
  {
    name: "options",
    type: "SelectOption[]",
    description: t("pages.forms.select.props.options"),
    required: true,
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.select.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Select…'",
    description: t("pages.forms.select.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.select.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.select.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.select.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.select.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.select.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.select.props.radius"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.clearable"),
  },
  {
    name: "searchable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.searchable"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.loading"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.select.props.fullWidth"),
  },
  {
    name: "iconLeft",
    type: "Component",
    description: t("pages.forms.select.props.iconLeft"),
  },
  {
    name: "panelWidth",
    type: "'trigger' | 'auto'",
    default: "'trigger'",
    description: t("pages.forms.select.props.panelWidth"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.select.props.name"),
  },
  { name: "id", type: "string", description: t("pages.forms.select.props.id") },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.select.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | number | null",
    description: t("pages.forms.select.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string | number | null",
    description: t("pages.forms.select.emits.change"),
  },
  {
    name: "open",
    payload: "void",
    description: t("pages.forms.select.emits.open"),
  },
  {
    name: "close",
    payload: "void",
    description: t("pages.forms.select.emits.close"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.select.title')"
    category="Forms"
    import-path="import { Select } from 'mood-ui'"
    :description="t('pages.forms.select.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.forms.select.controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.select.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.select.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.forms.select.controls.clearable')"
            v-model="pgClearable"
          />
          <TbToggle
            :label="t('pages.forms.select.controls.searchable')"
            v-model="pgSearchable"
          />
          <TbToggle
            :label="t('pages.forms.select.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <Select
          v-model="pgValue"
          :options="countries"
          :label="t('pages.forms.select.playground.label')"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :clearable="pgClearable"
          :searchable="pgSearchable"
          :disabled="pgDisabled"
          class="w-64"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.select.examples.basic.title')"
        :description="t('pages.forms.select.examples.basic.desc')"
        :code="basicCode"
      >
        <Select
          v-model="ex1"
          :options="countries"
          :label="t('pages.forms.select.examples.basic.label')"
          :placeholder="t('pages.forms.select.examples.basic.placeholder')"
          class="w-64"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.select.examples.searchable.title')"
        :description="t('pages.forms.select.examples.searchable.desc')"
        :code="searchableCode"
      >
        <Select
          v-model="ex2"
          :options="grouped"
          :label="t('pages.forms.select.examples.searchable.label')"
          searchable
          :placeholder="t('pages.forms.select.examples.searchable.placeholder')"
          class="w-64"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.select.examples.grouped.title')"
        :description="t('pages.forms.select.examples.grouped.desc')"
        :code="groupedCode"
      >
        <Select
          v-model="ex3"
          :options="grouped"
          :label="t('pages.forms.select.examples.grouped.label')"
          class="w-64"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.select.examples.sizes.title')"
        :description="t('pages.forms.select.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Select
          :options="countries"
          size="small"
          placeholder="Small"
          ariaLabel="Small"
          class="w-40"
        />
        <Select
          :options="countries"
          size="medium"
          placeholder="Medium"
          ariaLabel="Medium"
          class="w-40"
        />
        <Select
          :options="countries"
          size="large"
          placeholder="Large"
          ariaLabel="Large"
          class="w-40"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.select.examples.states.title')"
        :description="t('pages.forms.select.examples.states.desc')"
        :code="statesCode"
      >
        <Select
          :options="countries"
          :label="t('pages.forms.select.examples.states.loadingLabel')"
          loading
          :placeholder="t('pages.forms.select.examples.states.loadingPh')"
          class="w-48"
        />
        <Select
          :options="countries"
          :label="t('pages.forms.select.examples.states.disabledLabel')"
          disabled
          :placeholder="t('pages.forms.select.examples.states.disabledPh')"
          class="w-48"
        />
        <Select
          :options="countries"
          :label="t('pages.forms.select.examples.states.errorLabel')"
          :error-text="t('pages.forms.select.examples.states.errorText')"
          class="w-48"
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
        {{ t("pages.forms.select.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.select.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
