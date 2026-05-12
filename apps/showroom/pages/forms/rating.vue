<script setup lang="ts">
import { ref, computed } from "vue";
import { Rating, Typography } from "mood-ui";
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
  title: () => t("pages.forms.rating.title"),
  description: () => t("pages.forms.rating.description"),
  ogTitle: () => `${t("pages.forms.rating.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.rating.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.rating.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.rating.a11y.kbShiftTab") },
  { keys: ["↑", "↓", "←", "→"], action: t("pages.forms.rating.a11y.kbArrow") },
  { keys: ["Enter"], action: t("pages.forms.rating.a11y.kbEnter") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.rating.a11y.ariaLabel"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.rating.a11y.ariaDisabled"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.rating.a11y.focusNative"),
  t("pages.forms.rating.a11y.focusReadonly"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref(3);
const pgMax = ref("5");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "warning",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgAllowHalf = ref(false);
const pgReadonly = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = 3;
  pgMax.value = "5";
  pgColor.value = "warning";
  pgSize.value = "medium";
  pgAllowHalf.value = false;
  pgReadonly.value = false;
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
  if (pgMax.value !== "5") parts.push(`:max="${pgMax.value}"`);
  if (pgColor.value !== "warning") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgAllowHalf.value) parts.push("allow-half");
  if (pgReadonly.value) parts.push("readonly");
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Rating v-model="rating"${attrs} />`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Rating } from 'mood-ui';

const rating = ref(3);
<\/script>

<template>
  <Rating v-model="rating" />
</template>`;

const halfCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Rating } from 'mood-ui';

const rating = ref(3.5);
<\/script>

<template>
  <Rating v-model="rating" allow-half show-value />
</template>`;

const colorsCode = `<script setup lang="ts">
import { Rating } from 'mood-ui';
<\/script>

<template>
  <Rating :model-value="4" color="primary" />
  <Rating :model-value="4" color="success" />
  <Rating :model-value="4" color="warning" />
  <Rating :model-value="4" color="danger"  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Rating } from 'mood-ui';
<\/script>

<template>
  <Rating :model-value="4" size="small"  />
  <Rating :model-value="4" size="medium" />
  <Rating :model-value="4" size="large"  />
</template>`;

const readonlyCode = `<script setup lang="ts">
import { Rating } from 'mood-ui';
<\/script>

<template>
  <Rating :model-value="3.5" allow-half readonly show-value />
  <Rating :model-value="2"   disabled />
</template>`;

const ex1 = ref(3);
const ex2 = ref(3.5);

const typesCode = `export interface Rating {
  modelValue?: number;
  max?: number;
  allowHalf?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "number",
    default: "0",
    description: t("pages.forms.rating.props.modelValue"),
  },
  {
    name: "max",
    type: "number",
    default: "5",
    description: t("pages.forms.rating.props.max"),
  },
  {
    name: "allowHalf",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rating.props.allowHalf"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rating.props.readonly"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rating.props.disabled"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "true",
    description: t("pages.forms.rating.props.clearable"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'warning'",
    description: t("pages.forms.rating.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.rating.props.size"),
  },
  {
    name: "showValue",
    type: "boolean",
    default: "false",
    description: t("pages.forms.rating.props.showValue"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.rating.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "number",
    description: t("pages.forms.rating.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "number",
    description: t("pages.forms.rating.emits.change"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.rating.title')"
    category="Forms"
    import-path="import { Rating } from 'mood-ui'"
    :description="t('pages.forms.rating.description')"
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
            :label="t('pages.forms.rating.controls.max')"
            :options="[{ value: '3' }, { value: '5' }, { value: '10' }]"
            v-model="pgMax"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.rating.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.rating.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.forms.rating.controls.half')"
            v-model="pgAllowHalf"
          />
          <TbToggle
            :label="t('pages.forms.rating.controls.readonly')"
            v-model="pgReadonly"
          />
          <TbToggle
            :label="t('pages.forms.rating.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <Rating
          v-model="pgValue"
          :max="Number(pgMax) as any"
          :color="pgColor"
          :size="pgSize"
          :allow-half="pgAllowHalf"
          :readonly="pgReadonly"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.rating.examples.basic.title')"
        :description="t('pages.forms.rating.examples.basic.desc')"
        :code="basicCode"
      >
        <Rating v-model="ex1" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rating.examples.half.title')"
        :description="t('pages.forms.rating.examples.half.desc')"
        :code="halfCode"
      >
        <Rating v-model="ex2" allow-half show-value />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rating.examples.colors.title')"
        :description="t('pages.forms.rating.examples.colors.desc')"
        :code="colorsCode"
      >
        <div class="flex flex-col gap-3">
          <Rating :model-value="4" color="primary" />
          <Rating :model-value="4" color="success" />
          <Rating :model-value="4" color="warning" />
          <Rating :model-value="4" color="danger" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rating.examples.sizes.title')"
        :description="t('pages.forms.rating.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-3">
          <Rating :model-value="4" size="small" />
          <Rating :model-value="4" size="medium" />
          <Rating :model-value="4" size="large" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.rating.examples.readonlyDisabled.title')"
        :description="t('pages.forms.rating.examples.readonlyDisabled.desc')"
        :code="readonlyCode"
      >
        <div class="flex flex-col gap-3">
          <Rating :model-value="3.5" allow-half readonly show-value />
          <Rating :model-value="2" disabled />
        </div>
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
        {{ t("pages.forms.rating.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.rating.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
