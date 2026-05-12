<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import ProgressBar from "../../../components/feedback/ProgressBar.vue";
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

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.progressBar.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.feedback.progressBar.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"progressbar"',
    desc: t("pages.feedback.progressBar.a11y.ariaProgress"),
  },
  {
    attribute: "aria-valuenow",
    value: "number",
    desc: t("pages.feedback.progressBar.a11y.ariaValueNow"),
  },
  {
    attribute: "aria-valuemin",
    value: "0",
    desc: t("pages.feedback.progressBar.a11y.ariaValueMin"),
  },
  {
    attribute: "aria-valuemax",
    value: "100",
    desc: t("pages.feedback.progressBar.a11y.ariaValueMax"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.progressBar.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<number>(50);
const pgValueStr = computed({
  get: () => String(pgValue.value),
  set: (v: string) => {
    pgValue.value = parseInt(v);
    pgIndeterminate.value = false;
  },
});
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgIndeterminate = ref(false);
const pgStriped = ref(false);
const pgShowValue = ref(false);

function resetPlayground() {
  pgValue.value = 50;
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgIndeterminate.value = false;
  pgStriped.value = false;
  pgShowValue.value = false;
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
  if (!pgIndeterminate.value) parts.push(`:value="${pgValue.value}"`);
  if (pgColor.value !== "primary") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgStriped.value) parts.push("striped");
  if (pgShowValue.value) parts.push("show-value");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<ProgressBar${attrs} />`;
});

// ── Animated demo ─────────────────────────────────────────────────────────────
const animValue = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => {
    animValue.value = (animValue.value + 7) % 105;
  }, 700);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

// ── Example code strings ──────────────────────────────────────────────────────
const labelCode = `<script setup lang="ts">
import { ProgressBar } from 'mood-ui';
<\/script>

<template>
  <ProgressBar :value="33" label="Uploading file" show-value />
</template>`;

const indeterminateCode = `<script setup lang="ts">
import { ProgressBar } from 'mood-ui';
<\/script>

<template>
  <ProgressBar color="primary" />
  <ProgressBar color="success" />
</template>`;

const colorsCode = `<script setup lang="ts">
import { ProgressBar } from 'mood-ui';
<\/script>

<template>
  <ProgressBar :value="40" color="primary" />
  <ProgressBar :value="60" color="success" />
  <ProgressBar :value="75" color="warning" />
  <ProgressBar :value="90" color="danger"  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { ProgressBar } from 'mood-ui';
<\/script>

<template>
  <ProgressBar :value="50" size="small"  />
  <ProgressBar :value="50" size="medium" />
  <ProgressBar :value="50" size="large"  />
</template>`;

const stripedCode = `<script setup lang="ts">
import { ProgressBar } from 'mood-ui';
<\/script>

<template>
  <ProgressBar :value="65" striped color="primary" show-value />
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const typesCode = `export type ProgressBarColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';
export type ProgressBarSize = 'small' | 'medium' | 'large';

export interface ProgressBar {
  value?: number;
  min?: number;
  max?: number;
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  showValue?: boolean;
  label?: string;
  ariaLabel?: string;
  striped?: boolean;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "value",
    type: "number",
    description: t("pages.feedback.progressBar.props.value"),
  },
  {
    name: "min",
    type: "number",
    default: "0",
    description: t("pages.feedback.progressBar.props.min"),
  },
  {
    name: "max",
    type: "number",
    default: "100",
    description: t("pages.feedback.progressBar.props.max"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'primary'",
    description: t("pages.feedback.progressBar.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.feedback.progressBar.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'full'",
    description: t("pages.feedback.progressBar.props.radius"),
  },
  {
    name: "showValue",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.progressBar.props.showValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.feedback.progressBar.props.label"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.feedback.progressBar.props.ariaLabel"),
  },
  {
    name: "striped",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.progressBar.props.striped"),
  },
]);

const emitsList: EmitDoc[] = [];
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.progressBar.title')"
    category="Feedback"
    import-path="import { ProgressBar } from 'mood-ui'"
    :description="t('pages.feedback.progressBar.description')"
    :props-list="propsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="180px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.progressBar.controls.value')"
            :options="[
              { value: '0' },
              { value: '25' },
              { value: '50' },
              { value: '75' },
              { value: '100' },
            ]"
            v-model="pgValueStr"
          />
          <TbSep />
          <TbDots
            :label="t('pages.feedback.progressBar.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.progressBar.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.feedback.progressBar.controls.indeterminate')"
            v-model="pgIndeterminate"
          />
          <TbToggle
            :label="t('pages.feedback.progressBar.controls.striped')"
            v-model="pgStriped"
          />
          <TbToggle
            :label="t('pages.feedback.progressBar.controls.showValue')"
            v-model="pgShowValue"
          />
        </template>

        <ProgressBar
          class="w-72"
          :value="pgIndeterminate ? undefined : pgValue"
          :color="pgColor"
          :size="pgSize"
          :striped="pgStriped"
          :show-value="pgShowValue"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.progressBar.examples.label.title')"
        :description="t('pages.feedback.progressBar.examples.label.desc')"
        :code="labelCode"
      >
        <ProgressBar
          class="w-72"
          :value="animValue"
          :label="t('pages.feedback.progressBar.examples.label.uploadLabel')"
          show-value
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.progressBar.examples.indeterminate.title')"
        :description="
          t('pages.feedback.progressBar.examples.indeterminate.desc')
        "
        :code="indeterminateCode"
      >
        <div class="flex flex-col gap-3 w-72">
          <ProgressBar color="primary" />
          <ProgressBar color="success" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.progressBar.examples.colors.title')"
        :description="t('pages.feedback.progressBar.examples.colors.desc')"
        :code="colorsCode"
      >
        <div class="flex flex-col gap-2 w-72">
          <ProgressBar :value="40" color="primary" />
          <ProgressBar :value="60" color="success" />
          <ProgressBar :value="75" color="warning" />
          <ProgressBar :value="90" color="danger" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.progressBar.examples.sizes.title')"
        :description="t('pages.feedback.progressBar.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-3 w-72">
          <ProgressBar :value="50" size="small" />
          <ProgressBar :value="50" size="medium" />
          <ProgressBar :value="50" size="large" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.progressBar.examples.striped.title')"
        :description="t('pages.feedback.progressBar.examples.striped.desc')"
        :code="stripedCode"
      >
        <ProgressBar
          class="w-72"
          :value="65"
          striped
          color="primary"
          show-value
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
        {{ t("pages.feedback.progressBar.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.progressBar.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
