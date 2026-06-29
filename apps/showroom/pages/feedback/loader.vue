<script setup lang="ts">
import { ref, computed } from "vue";
import { Loader, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";

import ComponentPreview from "~/components/ComponentPreview.vue";

import type { PropDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.loader.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.loader.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"status"',
    desc: t("pages.feedback.loader.a11y.ariaStatus"),
  },
  {
    attribute: "aria-live",
    value: "polite",
    desc: t("pages.feedback.loader.a11y.ariaLive"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.feedback.loader.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.loader.a11y.focusNative"),
]);

type Variant = "normal" | "outline";
type Size = "xsmall" | "small" | "medium" | "large";

const pgVariant = ref<Variant>("normal");
const pgSize = ref<Size>("medium");
const pgColor = ref<string>("currentColor");

function resetPlayground() {
  pgVariant.value = "normal";
  pgSize.value = "medium";
  pgColor.value = "currentColor";
}

const colorDots = [
  { value: "currentColor", bg: "#1f2937", label: "Default" },
  { value: "#3b82f6", bg: "#3b82f6", label: "Primary" },
  { value: "#22c55e", bg: "#22c55e", label: "Success" },
  { value: "#f59e0b", bg: "#f59e0b", label: "Warning" },
  { value: "#ef4444", bg: "#ef4444", label: "Danger" },
  { value: "#ec4899", bg: "#ec4899", label: "Pink" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "normal") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgColor.value !== "currentColor") parts.push(`color="${pgColor.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Loader${attrs} />`;
});

const variantsCode = `<script setup lang="ts">
import { Loader } from 'mood-ui';
<\/script>

<template>
  <Loader variant="normal" />
  <Loader variant="outline" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Loader } from 'mood-ui';
<\/script>

<template>
  <Loader size="small" />
  <Loader size="medium" />
  <Loader size="large" />
</template>`;

const colorsCode = `<script setup lang="ts">
import { Loader } from 'mood-ui';
<\/script>

<template>
  <Loader color="#3b82f6" />
  <Loader color="#22c55e" />
  <Loader color="#ef4444" />
  <Loader color="#ec4899" />
</template>`;

const inlineCode = `<script setup lang="ts">
import { Loader } from 'mood-ui';
<\/script>

<template>
  <span class="inline-flex items-center gap-2">
    <Loader size="small" />
    <span>Loading projects…</span>
  </span>
</template>`;

const typesCode = `export interface Loader {
  variant?: 'normal' | 'outline' | 'ghost' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'normal'",
    description: t("pages.feedback.loader.props.variant"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.feedback.loader.props.size"),
  },
  {
    name: "color",
    type: "string",
    default: "'currentColor'",
    description: t("pages.feedback.loader.props.color"),
  },
  {
    name: "label",
    type: "string",
    default: "'Loading'",
    description: t("pages.feedback.loader.props.label"),
  },
]);

const slotsList: SlotDoc[] = [];
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.loader.title')"
    category="Feedback"
    import-path="import { Loader } from 'mood-ui'"
    :description="t('pages.feedback.loader.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.loader.controls.variant')"
            :options="[{ value: 'normal' }, { value: 'outline' }]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.loader.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbDots
            :label="t('pages.feedback.loader.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
        </template>

        <Loader :variant="pgVariant" :size="pgSize" :color="pgColor" />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.loader.examples.variants.title')"
        :description="t('pages.feedback.loader.examples.variants.desc')"
        :code="variantsCode"
        min-height="160px"
      >
        <Loader variant="normal" />
        <Loader variant="outline" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.loader.examples.sizes.title')"
        :description="t('pages.feedback.loader.examples.sizes.desc')"
        :code="sizesCode"
        min-height="160px"
      >
        <Loader size="small" />
        <Loader size="medium" />
        <Loader size="large" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.loader.examples.colors.title')"
        :description="t('pages.feedback.loader.examples.colors.desc')"
        :code="colorsCode"
        min-height="160px"
      >
        <Loader color="#3b82f6" />
        <Loader color="#22c55e" />
        <Loader color="#ef4444" />
        <Loader color="#ec4899" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.loader.examples.inline.title')"
        :description="t('pages.feedback.loader.examples.inline.desc')"
        :code="inlineCode"
        min-height="160px"
      >
        <span class="inline-flex items-center gap-2">
          <Loader size="small" />
          <span>{{ t("pages.feedback.loader.examples.inline.loading") }}</span>
        </span>
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
        {{ t("pages.feedback.loader.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.loader.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
