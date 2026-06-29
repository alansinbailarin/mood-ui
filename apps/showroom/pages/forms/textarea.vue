<script setup lang="ts">
import { ref, computed } from "vue";
import { Textarea, Typography } from "mood-ui";
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
  title: () => t("pages.forms.textarea.title"),
  description: () => t("pages.forms.textarea.description"),
  ogTitle: () => `${t("pages.forms.textarea.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.textarea.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.textarea.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.textarea.a11y.kbShiftTab") },
  { keys: ["Type"], action: t("pages.forms.textarea.a11y.kbType") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.textarea.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.textarea.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.textarea.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.textarea.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.textarea.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.textarea.a11y.focusNative"),
  t("pages.forms.textarea.a11y.focusResize"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref("Hello mood-ui 👋");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgAutoresize = ref(false);
const pgDisabled = ref(false);
const pgClearable = ref(false);
const pgReadonly = ref(false);

function resetPlayground() {
  pgValue.value = "Hello mood-ui 👋";
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgAutoresize.value = false;
  pgDisabled.value = false;
  pgClearable.value = false;
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
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgAutoresize.value) parts.push("autoresize");
  if (pgClearable.value) parts.push("clearable");
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgReadonly.value) parts.push(':readonly="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Textarea v-model="value" label="Comment" placeholder="Write something…"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Textarea } from 'mood-ui';

const comment = ref('');
<\/script>

<template>
  <Textarea v-model="comment" label="Comment" placeholder="Write something…" :rows="4" />
</template>`;

const variantsCode = `<script setup lang="ts">
import { Textarea } from 'mood-ui';
<\/script>

<template>
  <Textarea variant="outline" placeholder="outline" :rows="2" />
  <Textarea variant="filled"  placeholder="filled"  :rows="2" />
  <Textarea variant="ghost"   placeholder="ghost"   :rows="2" />
</template>`;

const autoresizeCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Textarea } from 'mood-ui';

const bio = ref('');
<\/script>

<template>
  <Textarea
    v-model="bio"
    label="Bio"
    autoresize
    :max-rows="6"
    :max-length="200"
    show-counter
    placeholder="Tell us about yourself"
  />
</template>`;

const errorCode = `<script setup lang="ts">
import { Textarea } from 'mood-ui';
<\/script>

<template>
  <Textarea
    label="Description"
    error-text="Description is required"
    :rows="3"
  />
</template>`;

const disabledCode = `<script setup lang="ts">
import { Textarea } from 'mood-ui';
<\/script>

<template>
  <Textarea disabled model-value="Not editable" :rows="2" />
</template>`;

const resizeCode = `<script setup lang="ts">
import { Textarea } from 'mood-ui';
<\/script>

<template>
  <Textarea resize="none"      placeholder="none"       :rows="2" />
  <Textarea resize="vertical"  placeholder="vertical"   :rows="2" />
  <Textarea resize="horizontal" placeholder="horizontal" :rows="2" />
  <Textarea resize="both"       placeholder="both"       :rows="2" />
</template>`;

// Example state
const exBasic = ref("");
const exBio = ref("Hello mood-ui");

const typesCode = `export interface Textarea {
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
  clearable?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  rows?: number;
  autoresize?: boolean;
  maxRows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  id?: string;
  name?: string;
  autofocus?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "string | null",
    description: t("pages.forms.textarea.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.textarea.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.textarea.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.textarea.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.textarea.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.textarea.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.textarea.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.textarea.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.forms.textarea.props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    description: t("pages.forms.textarea.props.halo"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.fullWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.loading"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.clearable"),
  },
  {
    name: "maxLength",
    type: "number",
    description: t("pages.forms.textarea.props.maxLength"),
  },
  {
    name: "showCounter",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.showCounter"),
  },
  {
    name: "rows",
    type: "number",
    default: "3",
    description: t("pages.forms.textarea.props.rows"),
  },
  {
    name: "autoresize",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.autoresize"),
  },
  {
    name: "maxRows",
    type: "number",
    default: "8",
    description: t("pages.forms.textarea.props.maxRows"),
  },
  {
    name: "resize",
    type: "'none' | 'vertical' | 'horizontal' | 'both'",
    default: "'vertical'",
    description: t("pages.forms.textarea.props.resize"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.textarea.props.name"),
  },
  {
    name: "id",
    type: "string",
    description: t("pages.forms.textarea.props.id"),
  },
  {
    name: "autofocus",
    type: "boolean",
    default: "false",
    description: t("pages.forms.textarea.props.autofocus"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.textarea.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string",
    description: t("pages.forms.textarea.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string",
    description: t("pages.forms.textarea.emits.change"),
  },
  {
    name: "focus",
    payload: "FocusEvent",
    description: t("pages.forms.textarea.emits.focus"),
  },
  {
    name: "blur",
    payload: "FocusEvent",
    description: t("pages.forms.textarea.emits.blur"),
  },
  {
    name: "clear",
    payload: "void",
    description: t("pages.forms.textarea.emits.clear"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.textarea.title')"
    category="Forms"
    import-path="import { Textarea } from 'mood-ui'"
    :description="t('pages.forms.textarea.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.forms.textarea.controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.textarea.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.textarea.controls.size')"
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
            :label="t('pages.forms.textarea.controls.autoresize')"
            v-model="pgAutoresize"
          />
          <TbToggle
            :label="t('pages.forms.textarea.controls.clearable')"
            v-model="pgClearable"
          />
          <TbToggle
            :label="t('pages.forms.textarea.controls.disabled')"
            v-model="pgDisabled"
          />
          <TbToggle
            :label="t('pages.forms.textarea.controls.readonly')"
            v-model="pgReadonly"
          />
        </template>

        <Textarea
          v-model="pgValue"
          :label="t('pages.forms.textarea.playground.label')"
          :placeholder="t('pages.forms.textarea.playground.placeholder')"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :autoresize="pgAutoresize"
          :clearable="pgClearable"
          :disabled="pgDisabled"
          :readonly="pgReadonly"
          :rows="3"
          style="width: 360px"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.textarea.examples.basic.title')"
        :description="t('pages.forms.textarea.examples.basic.desc')"
        :code="basicCode"
      >
        <Textarea
          v-model="exBasic"
          :label="t('pages.forms.textarea.examples.basic.label')"
          :placeholder="t('pages.forms.textarea.examples.basic.placeholder')"
          :rows="4"
          style="width: 360px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.textarea.examples.variants.title')"
        :description="t('pages.forms.textarea.examples.variants.desc')"
        :code="variantsCode"
      >
        <Textarea
          variant="outline"
          placeholder="outline"
          ariaLabel="outline"
          :rows="2"
          style="width: 240px"
        />
        <Textarea
          variant="filled"
          placeholder="filled"
          ariaLabel="filled"
          :rows="2"
          style="width: 240px"
        />
        <Textarea
          variant="ghost"
          placeholder="ghost"
          ariaLabel="ghost"
          :rows="2"
          style="width: 240px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.textarea.examples.autoresize.title')"
        :description="t('pages.forms.textarea.examples.autoresize.desc')"
        :code="autoresizeCode"
      >
        <Textarea
          v-model="exBio"
          :label="t('pages.forms.textarea.examples.autoresize.label')"
          autoresize
          :max-rows="6"
          :max-length="200"
          show-counter
          :placeholder="
            t('pages.forms.textarea.examples.autoresize.placeholder')
          "
          style="width: 360px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.textarea.examples.error.title')"
        :description="t('pages.forms.textarea.examples.error.desc')"
        :code="errorCode"
      >
        <Textarea
          :label="t('pages.forms.textarea.examples.error.label')"
          :error-text="t('pages.forms.textarea.examples.error.errorText')"
          :rows="3"
          style="width: 360px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.textarea.examples.disabled.title')"
        :description="t('pages.forms.textarea.examples.disabled.desc')"
        :code="disabledCode"
      >
        <Textarea
          disabled
          :model-value="t('pages.forms.textarea.examples.disabled.value')"
          ariaLabel="Disabled"
          :rows="2"
          style="width: 280px"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.textarea.examples.resize.title')"
        :description="t('pages.forms.textarea.examples.resize.desc')"
        :code="resizeCode"
      >
        <Textarea
          resize="none"
          placeholder="none"
          ariaLabel="none"
          :rows="2"
          style="width: 200px"
        />
        <Textarea
          resize="vertical"
          placeholder="vertical"
          ariaLabel="vertical"
          :rows="2"
          style="width: 200px"
        />
        <Textarea
          resize="horizontal"
          placeholder="horizontal"
          ariaLabel="horizontal"
          :rows="2"
          style="width: 200px"
        />
        <Textarea
          resize="both"
          placeholder="both"
          ariaLabel="both"
          :rows="2"
          style="width: 200px"
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
        {{ t("pages.forms.textarea.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.textarea.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
