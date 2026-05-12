<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import OTPInput from "../../../components/forms/OTPInput.vue";
import type { PropDoc, EmitDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ──────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.otpInput.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.otpInput.a11y.kbShiftTab") },
  { keys: ["0-9 / A-Z"], action: t("pages.forms.otpInput.a11y.kbType") },
  { keys: ["Backspace"], action: t("pages.forms.otpInput.a11y.kbBackspace") },
  { keys: ["←", "→"], action: t("pages.forms.otpInput.a11y.kbArrow") },
  { keys: ["Home"], action: t("pages.forms.otpInput.a11y.kbHome") },
  { keys: ["End"], action: t("pages.forms.otpInput.a11y.kbEnd") },
  { keys: ["Ctrl+V"], action: t("pages.forms.otpInput.a11y.kbPaste") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: "group",
    desc: t("pages.forms.otpInput.a11y.ariaGroup"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.otpInput.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.otpInput.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.otpInput.a11y.ariaLabel"),
  },
  {
    attribute: "autocomplete",
    value: "one-time-code",
    desc: t("pages.forms.otpInput.a11y.autocomplete"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.otpInput.a11y.focusNative"),
]);

// ── Playground state ───────────────────────────────────────────────────────────
const pgValue = ref("");
const pgLength = ref("6");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "default",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgMask = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "";
  pgLength.value = "6";
  pgColor.value = "default";
  pgSize.value = "medium";
  pgMask.value = false;
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
  if (pgLength.value !== "6") parts.push(`:length="${pgLength.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgMask.value) parts.push(':mask="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<OTPInput v-model="code" label="Verification code"${attrs} />`;
});

// ── Example code strings ───────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { OTPInput } from 'mood-ui';

const code = ref('');
<\/script>

<template>
  <OTPInput v-model="code" label="Verification code" />
</template>`;

const separatorCode = `<script setup lang="ts">
import { ref } from 'vue';
import { OTPInput } from 'mood-ui';

const code = ref('');
<\/script>

<template>
  <OTPInput v-model="code" :separator="3" label="Enter code" />
</template>`;

const maskCode = `<script setup lang="ts">
import { ref } from 'vue';
import { OTPInput } from 'mood-ui';

const pin = ref('');
<\/script>

<template>
  <OTPInput v-model="pin" :length="4" mask label="PIN" />
</template>`;

const alphanumericCode = `<script setup lang="ts">
import { ref } from 'vue';
import { OTPInput } from 'mood-ui';

const code = ref('');
<\/script>

<template>
  <OTPInput v-model="code" :numeric="false" label="Invitation code" />
</template>`;

const statesCode = `<script setup lang="ts">
import { OTPInput } from 'mood-ui';
<\/script>

<template>
  <OTPInput
    model-value="123"
    error-text="Invalid code. Please try again."
    label="Error"
  />
  <OTPInput model-value="123456" disabled label="Disabled" />
  <OTPInput loading label="Loading" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { OTPInput } from 'mood-ui';
<\/script>

<template>
  <OTPInput size="small"  label="Small"  />
  <OTPInput size="medium" label="Medium" />
  <OTPInput size="large"  label="Large"  />
</template>`;

// ── Example state ──────────────────────────────────────────────────────────────
const exBasic = ref("");
const exSeparator = ref("");
const exMask = ref("");
const exAlpha = ref("");

// ── Types string ───────────────────────────────────────────────────────────────
const typesCode = `export interface OTPInput {
  modelValue?: string;
  length?: number;
  mask?: boolean;
  numeric?: boolean;
  separator?: number;
  label?: string;
  helperText?: string;
  errorText?: string;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  fullWidth?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  autofocus?: boolean;
  loading?: boolean;
  name?: string;
  id?: string;
  ariaLabel?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}`;

// ── API docs ───────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string",
    description: t("pages.forms.otpInput.props.modelValue"),
  },
  {
    name: "length",
    type: "number",
    default: "6",
    description: t("pages.forms.otpInput.props.length"),
  },
  {
    name: "mask",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.mask"),
  },
  {
    name: "numeric",
    type: "boolean",
    default: "true",
    description: t("pages.forms.otpInput.props.numeric"),
  },
  {
    name: "separator",
    type: "number",
    description: t("pages.forms.otpInput.props.separator"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.otpInput.props.label"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.otpInput.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.otpInput.props.errorText"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.otpInput.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.otpInput.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.otpInput.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.otpInput.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.required"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.autofocus"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.otpInput.props.loading"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.otpInput.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.otpInput.props.id"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.otpInput.props.ariaLabel"),
  },
  {
    name: "invalid",
    type: "boolean",
    description: t("pages.forms.otpInput.props.invalid"),
  },
  {
    name: "ariaDescribedBy",
    type: "string",
    description: t("pages.forms.otpInput.props.ariaDescribedBy"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string",
    description: t("pages.forms.otpInput.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string",
    description: t("pages.forms.otpInput.emits.change"),
  },
  {
    name: "complete",
    payload: "string",
    description: t("pages.forms.otpInput.emits.complete"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.otpInput.title')"
    category="Forms"
    import-path="import { OTPInput } from 'mood-ui'"
    :description="t('pages.forms.otpInput.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="140px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbDots label="Color" :options="colorDots" v-model="pgColor" />
          <TbSep />
          <TbPills
            label="Length"
            :options="[{ value: '4' }, { value: '6' }, { value: '8' }]"
            v-model="pgLength"
          />
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
          <TbToggle label="Mask" v-model="pgMask" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <OTPInput
          v-model="pgValue"
          :label="t('pages.forms.otpInput.playground.label')"
          :length="Number(pgLength)"
          :color="pgColor"
          :size="pgSize"
          :mask="pgMask"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <!-- Basic -->
      <ComponentPreview
        :title="t('pages.forms.otpInput.examples.basic.title')"
        :description="t('pages.forms.otpInput.examples.basic.desc')"
        :code="basicCode"
      >
        <OTPInput
          v-model="exBasic"
          :label="t('pages.forms.otpInput.playground.label')"
        />
      </ComponentPreview>

      <!-- Separator -->
      <ComponentPreview
        :title="t('pages.forms.otpInput.examples.separator.title')"
        :description="t('pages.forms.otpInput.examples.separator.desc')"
        :code="separatorCode"
      >
        <OTPInput v-model="exSeparator" :separator="3" label="Enter code" />
      </ComponentPreview>

      <!-- Mask -->
      <ComponentPreview
        :title="t('pages.forms.otpInput.examples.mask.title')"
        :description="t('pages.forms.otpInput.examples.mask.desc')"
        :code="maskCode"
      >
        <OTPInput v-model="exMask" :length="4" mask label="PIN" />
      </ComponentPreview>

      <!-- Alphanumeric -->
      <ComponentPreview
        :title="t('pages.forms.otpInput.examples.alphanumeric.title')"
        :description="t('pages.forms.otpInput.examples.alphanumeric.desc')"
        :code="alphanumericCode"
      >
        <OTPInput v-model="exAlpha" :numeric="false" label="Invitation code" />
      </ComponentPreview>

      <!-- States -->
      <ComponentPreview
        :title="t('pages.forms.otpInput.examples.states.title')"
        :description="t('pages.forms.otpInput.examples.states.desc')"
        :code="statesCode"
      >
        <OTPInput
          model-value="123"
          :error-text="t('pages.forms.otpInput.examples.states.errorText')"
          :label="t('pages.forms.otpInput.examples.states.errorLabel')"
        />
        <OTPInput
          model-value="123456"
          disabled
          :label="t('pages.forms.otpInput.examples.states.disabledLabel')"
        />
        <OTPInput
          loading
          :label="t('pages.forms.otpInput.examples.states.loadingLabel')"
        />
      </ComponentPreview>

      <!-- Sizes -->
      <ComponentPreview
        :title="t('pages.forms.otpInput.examples.sizes.title')"
        :description="t('pages.forms.otpInput.examples.sizes.desc')"
        :code="sizesCode"
      >
        <OTPInput size="small" label="Small" />
        <OTPInput size="medium" label="Medium" />
        <OTPInput size="large" label="Large" />
      </ComponentPreview>
    </template>

    <!-- ── A11y ─────────────────────────────────────────────────────────── -->
    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <!-- ── Extra (Types) ─────────────────────────────────────────────────── -->
    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.otpInput.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.otpInput.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
