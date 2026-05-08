<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import type { PropDoc, SlotDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<
  "display" | "heading" | "title" | "subtitle" | "body" | "caption" | "overline"
>("heading");
const pgSize = ref<"small" | "medium" | "large">("large");
const pgWeight = ref<
  "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold"
>("semibold");
const pgColor = ref<
  "default" | "muted" | "primary" | "success" | "warning" | "danger"
>("default");
const pgAlign = ref<"left" | "center" | "right">("left");
const pgTruncate = ref(false);
const pgItalic = ref(false);
const pgUnderline = ref(false);
const pgStrike = ref(false);

function resetPlayground() {
  pgVariant.value = "heading";
  pgSize.value = "large";
  pgWeight.value = "semibold";
  pgColor.value = "default";
  pgAlign.value = "left";
  pgTruncate.value = false;
  pgItalic.value = false;
  pgUnderline.value = false;
  pgStrike.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--foreground)", label: "Default" },
  { value: "muted" as const, bg: "var(--muted-foreground)", label: "Muted" },
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
  if (pgVariant.value !== "body") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgWeight.value !== "normal") parts.push(`weight="${pgWeight.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgAlign.value !== "left") parts.push(`align="${pgAlign.value}"`);
  if (pgTruncate.value) parts.push("truncate");
  if (pgItalic.value) parts.push("italic");
  if (pgUnderline.value) parts.push("underline");
  if (pgStrike.value) parts.push("strikethrough");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Typography${attrs}>\n  Mood UI Typography\n</Typography>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const variantsCode = `<Typography variant="display" size="large">Display</Typography>
<Typography variant="heading" size="large">Heading</Typography>
<Typography variant="title"   size="medium">Title</Typography>
<Typography variant="subtitle">Subtitle</Typography>
<Typography variant="body">Body — Lorem ipsum dolor sit amet.</Typography>
<Typography variant="caption" color="muted">Caption auxiliar</Typography>
<Typography variant="overline" color="muted">Overline</Typography>`;

const sizesCode = `<Typography variant="heading" size="small">Heading small</Typography>
<Typography variant="heading" size="medium">Heading medium</Typography>
<Typography variant="heading" size="large">Heading large</Typography>`;

const weightsCode = `<Typography weight="light">Light</Typography>
<Typography weight="normal">Normal</Typography>
<Typography weight="medium">Medium</Typography>
<Typography weight="semibold">Semibold</Typography>
<Typography weight="bold">Bold</Typography>
<Typography weight="extrabold">Extrabold</Typography>`;

const colorsCode = `<Typography color="default">default</Typography>
<Typography color="muted">muted</Typography>
<Typography color="primary">primary</Typography>
<Typography color="success">success</Typography>
<Typography color="warning">warning</Typography>
<Typography color="danger">danger</Typography>`;

const truncateCode = `<div class="w-48">
  <Typography truncate>
    Texto que se trunca con ellipsis cuando no cabe en una sola línea.
  </Typography>
</div>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline'",
    default: "'body'",
    description: t("pages.dataDisplay.typography.props.variant"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    description: t("pages.dataDisplay.typography.props.size"),
  },
  {
    name: "as",
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'small' | 'strong' | 'em'",
    description: t("pages.dataDisplay.typography.props.as"),
  },
  {
    name: "weight",
    type: "'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'",
    description: t("pages.dataDisplay.typography.props.weight"),
  },
  {
    name: "align",
    type: "'left' | 'center' | 'right'",
    description: t("pages.dataDisplay.typography.props.align"),
  },
  {
    name: "color",
    type: "'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.dataDisplay.typography.props.color"),
  },
  {
    name: "truncate",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.typography.props.truncate"),
  },
  {
    name: "italic",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.typography.props.italic"),
  },
  {
    name: "underline",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.typography.props.underline"),
  },
  {
    name: "strikethrough",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.typography.props.strikethrough"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.dataDisplay.typography.slots.default"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.dataDisplay.typography.title')"
    category="Data Display"
    import-path="import { Typography } from 'mood-ui'"
    :description="t('pages.dataDisplay.typography.description')"
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
            :label="t('controls.variant')"
            :options="[
              { value: 'display' },
              { value: 'heading' },
              { value: 'title' },
              { value: 'subtitle' },
              { value: 'body' },
              { value: 'caption' },
              { value: 'overline' },
            ]"
            v-model="pgVariant"
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
            :label="t('controls.weight')"
            :options="[
              { value: 'light' },
              { value: 'normal' },
              { value: 'medium' },
              { value: 'semibold' },
              { value: 'bold' },
              { value: 'extrabold' },
            ]"
            v-model="pgWeight"
          />
          <TbSep />
          <TbPills
            :label="t('controls.align')"
            :options="[
              { value: 'left' },
              { value: 'center' },
              { value: 'right' },
            ]"
            v-model="pgAlign"
          />
          <TbSep />
          <TbDots
            :label="t('controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbToggle :label="t('controls.truncated')" v-model="pgTruncate" />
          <TbToggle :label="t('controls.italic')" v-model="pgItalic" />
          <TbToggle :label="t('controls.underline')" v-model="pgUnderline" />
          <TbToggle :label="t('controls.strikethrough')" v-model="pgStrike" />
        </template>

        <Typography
          :variant="pgVariant"
          :size="pgSize"
          :weight="pgWeight"
          :color="pgColor"
          :align="pgAlign"
          :truncate="pgTruncate"
          :italic="pgItalic"
          :underline="pgUnderline"
          :strikethrough="pgStrike"
        >
          Mood UI Typography
        </Typography>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.dataDisplay.typography.examples.variants.title')"
        :description="t('pages.dataDisplay.typography.examples.variants.desc')"
        :code="variantsCode"
      >
        <div class="flex flex-col gap-2 items-start">
          <Typography variant="display" size="large">Display</Typography>
          <Typography variant="heading" size="large">Heading</Typography>
          <Typography variant="title" size="medium">Title</Typography>
          <Typography variant="subtitle">Subtitle</Typography>
          <Typography variant="body"
            >Body — Lorem ipsum dolor sit amet.</Typography
          >
          <Typography variant="caption" color="muted"
            >Caption auxiliar</Typography
          >
          <Typography variant="overline" color="muted">Overline</Typography>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.typography.examples.sizes.title')"
        :description="t('pages.dataDisplay.typography.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-2 items-start">
          <Typography variant="heading" size="small">Heading small</Typography>
          <Typography variant="heading" size="medium"
            >Heading medium</Typography
          >
          <Typography variant="heading" size="large">Heading large</Typography>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.typography.examples.weights.title')"
        :description="t('pages.dataDisplay.typography.examples.weights.desc')"
        :code="weightsCode"
      >
        <div class="flex flex-col gap-1 items-start">
          <Typography weight="light">Light</Typography>
          <Typography weight="normal">Normal</Typography>
          <Typography weight="medium">Medium</Typography>
          <Typography weight="semibold">Semibold</Typography>
          <Typography weight="bold">Bold</Typography>
          <Typography weight="extrabold">Extrabold</Typography>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.typography.examples.colors.title')"
        :description="t('pages.dataDisplay.typography.examples.colors.desc')"
        :code="colorsCode"
      >
        <div class="flex flex-col gap-1 items-start">
          <Typography color="default">default</Typography>
          <Typography color="muted">muted</Typography>
          <Typography color="primary">primary</Typography>
          <Typography color="success">success</Typography>
          <Typography color="warning">warning</Typography>
          <Typography color="danger">danger</Typography>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.typography.examples.truncate.title')"
        :description="t('pages.dataDisplay.typography.examples.truncate.desc')"
        :code="truncateCode"
      >
        <div class="w-48">
          <Typography truncate>
            Texto que se trunca con ellipsis cuando no cabe en una sola línea.
          </Typography>
        </div>
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
