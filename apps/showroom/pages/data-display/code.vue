<script setup lang="ts">
import { ref, computed } from "vue";
import { Code, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


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


useSeoMeta({
  title: () => t("pages.dataDisplay.code.title"),
  description: () => t("pages.dataDisplay.code.description"),
  ogTitle: () => `${t("pages.dataDisplay.code.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.code.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.code.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.data-display.code.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.code.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.code.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"subtle" | "outline" | "ghost">("subtle");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "default",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");

function resetPlayground() {
  pgVariant.value = "subtle";
  pgColor.value = "default";
  pgSize.value = "medium";
  pgRadius.value = "medium";
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

const typesCode = `export interface Code {
  size?: 'small' | 'medium' | 'large';
  variant?: 'subtle' | 'outline' | 'ghost';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}`;

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "subtle") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Code${attrs}>npm install mood-ui</Code>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { Code } from 'mood-ui';
<\/script>

<template>
  <Code>npm install mood-ui</Code>
</template>`;

const variantsCode = `<script setup lang="ts">
import { Code } from 'mood-ui';
<\/script>

<template>
  <Code variant="subtle">useLocale()</Code>
  <Code variant="outline">useLocale()</Code>
  <Code variant="ghost">useLocale()</Code>
</template>`;

const colorsCode = `<script setup lang="ts">
import { Code } from 'mood-ui';
<\/script>

<template>
  <Code color="default">foo</Code>
  <Code color="primary">primary</Code>
  <Code color="success">success</Code>
  <Code color="warning">warning</Code>
  <Code color="danger">danger</Code>
</template>`;

const sizesCode = `<script setup lang="ts">
import { Code } from 'mood-ui';
<\/script>

<template>
  <Code size="small">v0.4.0</Code>
  <Code size="medium">v0.4.0</Code>
  <Code size="large">v0.4.0</Code>
</template>`;

const inlineCode = `<script setup lang="ts">
import { Code } from 'mood-ui';
<\/script>

<template>
  <p>Call <Code color="primary">useLocale().set('es')</Code> to change the language.</p>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.data-display.code.props.size"),
  },
  {
    name: "variant",
    type: "'subtle' | 'outline' | 'ghost'",
    default: "'subtle'",
    description: t("pages.data-display.code.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.data-display.code.props.color"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.code.props.radius"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.data-display.code.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.code.title')"
    category="Data Display"
    import-path="import { Code } from 'mood-ui'"
    :description="t('pages.data-display.code.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="160px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('controls.variant')"
            :options="[
              { value: 'subtle' },
              { value: 'outline' },
              { value: 'ghost' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
            v-model="pgRadius"
          />
        </template>

        <Code
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :radius="pgRadius"
          >npm install mood-ui</Code
        >
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.code.examples.basic.title')"
        :description="t('pages.data-display.code.examples.basic.desc')"
        :code="basicCode"
      >
        <Code>npm install mood-ui</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.code.examples.variants.title')"
        :description="t('pages.data-display.code.examples.variants.desc')"
        :code="variantsCode"
      >
        <Code variant="subtle">useLocale()</Code>
        <Code variant="outline">useLocale()</Code>
        <Code variant="ghost">useLocale()</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.code.examples.colors.title')"
        :description="t('pages.data-display.code.examples.colors.desc')"
        :code="colorsCode"
      >
        <Code color="default">foo</Code>
        <Code color="primary">primary</Code>
        <Code color="success">success</Code>
        <Code color="warning">warning</Code>
        <Code color="danger">danger</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.code.examples.sizes.title')"
        :description="t('pages.data-display.code.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Code size="small">v0.4.0</Code>
        <Code size="medium">v0.4.0</Code>
        <Code size="large">v0.4.0</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.code.examples.inline.title')"
        :description="t('pages.data-display.code.examples.inline.desc')"
        :code="inlineCode"
      >
        <p class="text-sm">
          Call <Code color="primary">useLocale().set('es')</Code> to change the
          language.
        </p>
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
        {{ t("pages.data-display.code.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.code.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
