<script setup lang="ts">
import { ref, computed } from "vue";
import { RadioGroup, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";

import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
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
  { keys: ["Tab"], action: t("pages.forms.radioGroup.a11y.kbTab") },
  {
    keys: ["↑", "↓", "←", "→"],
    action: t("pages.forms.radioGroup.a11y.kbArrow"),
  },
  { keys: ["Space"], action: t("pages.forms.radioGroup.a11y.kbSpace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"radiogroup"',
    desc: t("pages.forms.radioGroup.a11y.ariaGroup"),
  },
  {
    attribute: "aria-labelledby",
    value: "id",
    desc: t("pages.forms.radioGroup.a11y.ariaLabelledBy"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.radioGroup.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.radioGroup.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.radioGroup.a11y.ariaRequired"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.radioGroup.a11y.focusGroup"),
  t("pages.forms.radioGroup.a11y.focusDisabled"),
]);

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];

const plansDescribed = [
  {
    value: "free",
    label: "Free",
    description: "Great for getting started and personal projects.",
  },
  {
    value: "pro",
    label: "Pro",
    description: "For professionals who need more capacity.",
  },
  {
    value: "team",
    label: "Team",
    description: "Advanced collaboration for growing teams.",
  },
];

const colors = [
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<string | number | null>("pro");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgOrientation = ref<"vertical" | "horizontal">("vertical");
const pgDisabled = ref(false);
const pgLoading = ref(false);

function resetPlayground() {
  pgValue.value = "pro";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgOrientation.value = "vertical";
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
  if (pgOrientation.value !== "vertical")
    parts.push(`orientation="${pgOrientation.value}"`);
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgLoading.value) parts.push(':loading="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<RadioGroup
    v-model="plan"
    :options="plans"
    label="Plan"${attrs}
/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RadioGroup } from 'mood-ui';
import type { RadioOption } from 'mood-ui';

const plan = ref<string | number | null>('pro');

const plans: RadioOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro',  label: 'Pro' },
  { value: 'team', label: 'Team' },
];
<\/script>

<template>
  <RadioGroup v-model="plan" :options="plans" label="Plan" />
</template>`;

const describedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RadioGroup } from 'mood-ui';
import type { RadioOption } from 'mood-ui';

const plan = ref<string | number | null>('pro');

const plansDescribed: RadioOption[] = [
  { value: 'free', label: 'Free', description: 'Great for getting started and personal projects.' },
  { value: 'pro',  label: 'Pro',  description: 'For professionals who need more capacity.' },
  { value: 'team', label: 'Team', description: 'Advanced collaboration for growing teams.' },
];
<\/script>

<template>
  <RadioGroup v-model="plan" :options="plansDescribed" label="Choose your plan" color="primary" />
</template>`;

const horizontalCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RadioGroup } from 'mood-ui';
import type { RadioOption } from 'mood-ui';

const color = ref<string | number | null>('green');

const colors: RadioOption[] = [
  { value: 'red',   label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue',  label: 'Blue' },
];
<\/script>

<template>
  <RadioGroup
    v-model="color"
    :options="colors"
    label="Favorite color"
    orientation="horizontal"
    color="primary"
  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RadioGroup } from 'mood-ui';
import type { RadioOption } from 'mood-ui';

const plan = ref<string | number | null>('free');

const plans: RadioOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro',  label: 'Pro' },
  { value: 'team', label: 'Team' },
];
<\/script>

<template>
  <RadioGroup v-model="plan" :options="plans" size="small"  label="Small" />
  <RadioGroup v-model="plan" :options="plans" size="medium" label="Medium" />
  <RadioGroup v-model="plan" :options="plans" size="large"  label="Large" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { RadioGroup } from 'mood-ui';
import type { RadioOption } from 'mood-ui';

const plan = ref<string | number | null>('pro');

const plans: RadioOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro',  label: 'Pro' },
  { value: 'team', label: 'Team' },
];
<\/script>

<template>
  <RadioGroup v-model="plan" :options="plans" label="Disabled" disabled />
</template>`;

const typesCode = `export interface RadioGroup {
  modelValue?: string | number | null;
  name?: string;
  options?: RadioOption[];
  label?: string;
  helperText?: string;
  errorText?: string;
  orientation?: 'vertical' | 'horizontal';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}`;

const ex1 = ref<string | number | null>("pro");
const ex2 = ref<string | number | null>("pro");
const ex3 = ref<string | number | null>("green");
const ex4 = ref<string | number | null>("free");

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | number | null",
    description: t("pages.forms.radioGroup.props.modelValue"),
  },
  {
    name: "options",
    type: "RadioOption[]",
    description: t("pages.forms.radioGroup.props.options"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.radioGroup.props.name"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.radioGroup.props.label"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.radioGroup.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.radioGroup.props.errorText"),
  },
  {
    name: "orientation",
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: t("pages.forms.radioGroup.props.orientation"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.radioGroup.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.radioGroup.props.size"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.radioGroup.props.disabled"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.radioGroup.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.radioGroup.props.loading"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.radioGroup.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | number",
    description: t("pages.forms.radioGroup.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string | number",
    description: t("pages.forms.radioGroup.emits.change"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.forms.radioGroup.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.radioGroup.title')"
    category="Forms"
    import-path="import { RadioGroup } from 'mood-ui'"
    :description="t('pages.forms.radioGroup.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
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
            :label="t('pages.forms.radioGroup.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.radioGroup.controls.size')"
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
            :label="t('pages.forms.radioGroup.controls.layout')"
            :options="[{ value: 'vertical' }, { value: 'horizontal' }]"
            v-model="pgOrientation"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.forms.radioGroup.controls.loading')"
            v-model="pgLoading"
          />
          <TbToggle
            :label="t('pages.forms.radioGroup.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <RadioGroup
          v-model="pgValue"
          :options="plans"
          :label="t('pages.forms.radioGroup.playground.label')"
          :color="pgColor"
          :size="pgSize"
          :orientation="pgOrientation"
          :loading="pgLoading"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.radioGroup.examples.basic.title')"
        :description="t('pages.forms.radioGroup.examples.basic.desc')"
        :code="basicCode"
      >
        <RadioGroup
          v-model="ex1"
          :options="plans"
          :label="t('pages.forms.radioGroup.examples.basic.label')"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radioGroup.examples.described.title')"
        :description="t('pages.forms.radioGroup.examples.described.desc')"
        :code="describedCode"
      >
        <RadioGroup
          v-model="ex2"
          :options="plansDescribed"
          :label="t('pages.forms.radioGroup.examples.described.label')"
          color="primary"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radioGroup.examples.horizontal.title')"
        :description="t('pages.forms.radioGroup.examples.horizontal.desc')"
        :code="horizontalCode"
      >
        <RadioGroup
          v-model="ex3"
          :options="colors"
          :label="t('pages.forms.radioGroup.examples.horizontal.label')"
          orientation="horizontal"
          color="primary"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radioGroup.examples.sizes.title')"
        :description="t('pages.forms.radioGroup.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-6">
          <RadioGroup
            v-model="ex4"
            :options="plans"
            size="small"
            label="Small"
          />
          <RadioGroup
            v-model="ex4"
            :options="plans"
            size="medium"
            label="Medium"
          />
          <RadioGroup
            v-model="ex4"
            :options="plans"
            size="large"
            label="Large"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.radioGroup.examples.disabled.title')"
        :description="t('pages.forms.radioGroup.examples.disabled.desc')"
        :code="disabledCode"
      >
        <RadioGroup
          :model-value="'pro'"
          :options="plans"
          :label="t('pages.forms.radioGroup.examples.disabled.label')"
          disabled
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
        {{ t("pages.forms.radioGroup.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.radioGroup.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
