<script setup lang="ts">
import { ref, computed } from "vue";
import { PasswordInput, Typography } from "mood-ui";
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
  title: () => t("pages.forms.passwordInput.title"),
  description: () => t("pages.forms.passwordInput.description"),
  ogTitle: () => `${t("pages.forms.passwordInput.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.passwordInput.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.passwordInput.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.forms.passwordInput.a11y.kbShiftTab"),
  },
  { keys: ["Type"], action: t("pages.forms.passwordInput.a11y.kbType") },
  {
    keys: ["Space", "Enter"],
    action: t("pages.forms.passwordInput.a11y.kbToggle"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.passwordInput.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.passwordInput.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.passwordInput.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.passwordInput.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.passwordInput.a11y.ariaLabel"),
  },
  {
    attribute: "aria-pressed",
    value: "true",
    desc: t("pages.forms.passwordInput.a11y.ariaPressed"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.passwordInput.a11y.focusNative"),
  t("pages.forms.passwordInput.a11y.focusToggle"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref("SuperSecret123");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgToggleVisibility = ref(true);
const pgStrengthMeter = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "SuperSecret123";
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgToggleVisibility.value = true;
  pgStrengthMeter.value = false;
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
  if (!pgToggleVisibility.value) parts.push(':toggle-visibility="false"');
  if (pgStrengthMeter.value) parts.push("strength-meter");
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<PasswordInput v-model="password" label="Password"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PasswordInput } from 'mood-ui';

const password = ref('');
<\/script>

<template>
  <PasswordInput v-model="password" label="Password" placeholder="Enter your password" />
</template>`;

const strengthCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PasswordInput } from 'mood-ui';

const password = ref('');
<\/script>

<template>
  <PasswordInput v-model="password" label="New password" strength-meter />
</template>`;

const noToggleCode = `<script setup lang="ts">
import { PasswordInput } from 'mood-ui';
<\/script>

<template>
  <PasswordInput :toggle-visibility="false" placeholder="No toggle" />
</template>`;

const defaultVisibleCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PasswordInput } from 'mood-ui';

const password = ref('SuperSecret123');
<\/script>

<template>
  <PasswordInput v-model="password" label="Password" default-visible />
</template>`;

const sizesCode = `<script setup lang="ts">
import { PasswordInput } from 'mood-ui';
<\/script>

<template>
  <PasswordInput size="small"  model-value="secret" />
  <PasswordInput size="medium" model-value="secret" />
  <PasswordInput size="large"  model-value="secret" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { PasswordInput } from 'mood-ui';
<\/script>

<template>
  <PasswordInput disabled model-value="hidden" label="Password" />
</template>`;

// Example state
const exBasic = ref("");
const exStrength = ref("Mood-UI-2025!");

const typesCode = `export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export type PasswordStrengthLabels = Partial<Record<PasswordStrengthScore, string>>;

export interface PasswordInput {
  modelValue?: string | null;
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
  maxLength?: number;
  showCounter?: boolean;
  toggleVisibility?: boolean;
  defaultVisible?: boolean;
  strengthMeter?: boolean;
  strengthLabels?: PasswordStrengthLabels;
  iconLeft?: Component;
  prefix?: string;
  id?: string;
  name?: string;
  autocomplete?: string;
  autofocus?: boolean;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | null",
    description: t("pages.forms.passwordInput.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.passwordInput.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.passwordInput.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.passwordInput.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.passwordInput.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.passwordInput.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.passwordInput.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.passwordInput.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.passwordInput.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.passwordInput.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.loading"),
  },
  {
    name: "maxLength",
    type: "number",
    description: t("pages.forms.passwordInput.props.maxLength"),
  },
  {
    name: "showCounter",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.showCounter"),
  },
  {
    name: "toggleVisibility",
    type: "boolean",
    default: "true",
    description: t("pages.forms.passwordInput.props.toggleVisibility"),
  },
  {
    name: "defaultVisible",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.defaultVisible"),
  },
  {
    name: "strengthMeter",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.strengthMeter"),
  },
  {
    name: "strengthLabels",
    type: "PasswordStrengthLabels",
    description: t("pages.forms.passwordInput.props.strengthLabels"),
  },
  {
    name: "iconLeft",
    type: "Component",
    description: t("pages.forms.passwordInput.props.iconLeft"),
  },
  {
    name: "prefix",
    type: "string",
    description: t("pages.forms.passwordInput.props.prefix"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.passwordInput.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.passwordInput.props.id"),
  },
  {
    name: "autocomplete",
    type: "string",
    default: "'current-password'",
    description: t("pages.forms.passwordInput.props.autocomplete"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.passwordInput.props.autofocus"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.passwordInput.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string",
    description: t("pages.forms.passwordInput.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string",
    description: t("pages.forms.passwordInput.emits.change"),
  },
  {
    name: "focus",
    payload: "FocusEvent",
    description: t("pages.forms.passwordInput.emits.focus"),
  },
  {
    name: "blur",
    payload: "FocusEvent",
    description: t("pages.forms.passwordInput.emits.blur"),
  },
  {
    name: "update:visible",
    payload: "boolean",
    description: t("pages.forms.passwordInput.emits.updateVisible"),
  },
  {
    name: "strength-change",
    payload: "PasswordStrengthScore",
    description: t("pages.forms.passwordInput.emits.strengthChange"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.passwordInput.title')"
    category="Forms"
    import-path="import { PasswordInput } from 'mood-ui'"
    :description="t('pages.forms.passwordInput.description')"
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
            :label="t('pages.forms.passwordInput.controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.passwordInput.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.passwordInput.controls.size')"
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
            :label="t('pages.forms.passwordInput.controls.toggle')"
            v-model="pgToggleVisibility"
          />
          <TbToggle
            :label="t('pages.forms.passwordInput.controls.strength')"
            v-model="pgStrengthMeter"
          />
          <TbToggle
            :label="t('pages.forms.passwordInput.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <PasswordInput
          v-model="pgValue"
          :label="t('pages.forms.passwordInput.playground.label')"
          :placeholder="t('pages.forms.passwordInput.playground.placeholder')"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :toggle-visibility="pgToggleVisibility"
          :strength-meter="pgStrengthMeter"
          :disabled="pgDisabled"
          style="width: 280px"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.passwordInput.examples.basic.title')"
        :description="t('pages.forms.passwordInput.examples.basic.desc')"
        :code="basicCode"
      >
        <PasswordInput
          v-model="exBasic"
          :label="t('pages.forms.passwordInput.examples.basic.label')"
          :placeholder="t('pages.forms.passwordInput.examples.basic.ph')"
          style="width: 280px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.passwordInput.examples.strength.title')"
        :description="t('pages.forms.passwordInput.examples.strength.desc')"
        :code="strengthCode"
      >
        <PasswordInput
          v-model="exStrength"
          :label="t('pages.forms.passwordInput.examples.strength.label')"
          strength-meter
          style="width: 280px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.passwordInput.examples.noToggle.title')"
        :description="t('pages.forms.passwordInput.examples.noToggle.desc')"
        :code="noToggleCode"
      >
        <PasswordInput
          :toggle-visibility="false"
          :placeholder="t('pages.forms.passwordInput.examples.noToggle.ph')"
          ariaLabel="Password"
          style="width: 280px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.passwordInput.examples.defaultVisible.title')"
        :description="
          t('pages.forms.passwordInput.examples.defaultVisible.desc')
        "
        :code="defaultVisibleCode"
      >
        <PasswordInput
          model-value="SuperSecret123"
          label="Password"
          default-visible
          style="width: 280px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.passwordInput.examples.sizes.title')"
        :description="t('pages.forms.passwordInput.examples.sizes.desc')"
        :code="sizesCode"
      >
        <PasswordInput size="small" model-value="secret" ariaLabel="Password" style="width: 220px" />
        <PasswordInput
          size="medium"
          model-value="secret"
          ariaLabel="Password"
          style="width: 220px"
        />
        <PasswordInput size="large" model-value="secret" ariaLabel="Password" style="width: 220px" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.passwordInput.examples.disabled.title')"
        :description="t('pages.forms.passwordInput.examples.disabled.desc')"
        :code="disabledCode"
      >
        <PasswordInput
          disabled
          model-value="hidden"
          :label="t('pages.forms.passwordInput.examples.disabled.label')"
          style="width: 280px"
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
        {{ t("pages.forms.passwordInput.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.passwordInput.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
