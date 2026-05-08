<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Code from "../../../components/data-display/Code.vue";
import type { PropDoc, SlotDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

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
const basicCode = `<Code>npm install mood-ui</Code>`;
const variantsCode = `<Code variant="subtle">useLocale()</Code>
<Code variant="outline">useLocale()</Code>
<Code variant="ghost">useLocale()</Code>`;
const colorsCode = `<Code color="default">foo</Code>
<Code color="primary">primary</Code>
<Code color="success">success</Code>
<Code color="warning">warning</Code>
<Code color="danger">danger</Code>`;
const sizesCode = `<Code size="small">v0.4.0</Code>
<Code size="medium">v0.4.0</Code>
<Code size="large">v0.4.0</Code>`;
const inlineCode = `<p>Llama a <Code color="primary">useLocale().set('es')</Code> para cambiar el idioma.</p>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.dataDisplay.code.props.size"),
  },
  {
    name: "variant",
    type: "'subtle' | 'outline' | 'ghost'",
    default: "'subtle'",
    description: t("pages.dataDisplay.code.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.dataDisplay.code.props.color"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.dataDisplay.code.props.radius"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.dataDisplay.code.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.dataDisplay.code.title')"
    category="Data Display"
    import-path="import { Code } from 'mood-ui'"
    :description="t('pages.dataDisplay.code.description')"
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
        :title="t('pages.dataDisplay.code.examples.basic.title')"
        :description="t('pages.dataDisplay.code.examples.basic.desc')"
        :code="basicCode"
      >
        <Code>npm install mood-ui</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.code.examples.variants.title')"
        :description="t('pages.dataDisplay.code.examples.variants.desc')"
        :code="variantsCode"
      >
        <Code variant="subtle">useLocale()</Code>
        <Code variant="outline">useLocale()</Code>
        <Code variant="ghost">useLocale()</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.code.examples.colors.title')"
        :description="t('pages.dataDisplay.code.examples.colors.desc')"
        :code="colorsCode"
      >
        <Code color="default">foo</Code>
        <Code color="primary">primary</Code>
        <Code color="success">success</Code>
        <Code color="warning">warning</Code>
        <Code color="danger">danger</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.code.examples.sizes.title')"
        :description="t('pages.dataDisplay.code.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Code size="small">v0.4.0</Code>
        <Code size="medium">v0.4.0</Code>
        <Code size="large">v0.4.0</Code>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.code.examples.inline.title')"
        :description="t('pages.dataDisplay.code.examples.inline.desc')"
        :code="inlineCode"
      >
        <p class="text-sm">
          Llama a <Code color="primary">useLocale().set('es')</Code> para
          cambiar el idioma.
        </p>
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
