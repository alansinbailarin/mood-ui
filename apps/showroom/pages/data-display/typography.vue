<script setup lang="ts">
import { ref, computed } from "vue";
import { Typography } from "mood-ui";
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
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.dataDisplay.typography.title"),
  description: () => t("pages.dataDisplay.typography.description"),
  ogTitle: () => `${t("pages.dataDisplay.typography.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.typography.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.typography.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.typography.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-hidden",
    value: "true",
    desc: t("pages.data-display.typography.a11y.ariaHidden"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.typography.a11y.focusNative"),
]);

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
const variantsCode = `<script setup lang="ts">
import { Typography } from 'mood-ui';
<\/script>

<template>
  <Typography variant="display" size="large">Display</Typography>
  <Typography variant="heading" size="large">Heading</Typography>
  <Typography variant="title"   size="medium">Title</Typography>
  <Typography variant="subtitle">Subtitle</Typography>
  <Typography variant="body">Body — Lorem ipsum dolor sit amet.</Typography>
  <Typography variant="caption" color="muted">Caption helper</Typography>
  <Typography variant="overline" color="muted">Overline</Typography>
</template>`;

const sizesCode = `<script setup lang="ts">
import { Typography } from 'mood-ui';
<\/script>

<template>
  <Typography variant="heading" size="small">Heading small</Typography>
  <Typography variant="heading" size="medium">Heading medium</Typography>
  <Typography variant="heading" size="large">Heading large</Typography>
</template>`;

const weightsCode = `<script setup lang="ts">
import { Typography } from 'mood-ui';
<\/script>

<template>
  <Typography weight="light">Light</Typography>
  <Typography weight="normal">Normal</Typography>
  <Typography weight="medium">Medium</Typography>
  <Typography weight="semibold">Semibold</Typography>
  <Typography weight="bold">Bold</Typography>
  <Typography weight="extrabold">Extrabold</Typography>
</template>`;

const colorsCode = `<script setup lang="ts">
import { Typography } from 'mood-ui';
<\/script>

<template>
  <Typography color="default">default</Typography>
  <Typography color="muted">muted</Typography>
  <Typography color="primary">primary</Typography>
  <Typography color="success">success</Typography>
  <Typography color="warning">warning</Typography>
  <Typography color="danger">danger</Typography>
</template>`;

const typesCode = `export interface Typography {
  variant?: 'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline';
  size?: 'small' | 'medium' | 'large';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'small' | 'strong' | 'em';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  color?: 'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning';
  truncate?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}`;

const truncateCode = `<script setup lang="ts">
import { Typography } from 'mood-ui';
<\/script>

<template>
  <div class="w-48">
    <Typography truncate>
      Text that truncates with ellipsis when it does not fit on a single line.
    </Typography>
  </div>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'display' | 'heading' | 'title' | 'subtitle' | 'body' | 'caption' | 'overline'",
    default: "'body'",
    description: t("pages.data-display.typography.props.variant"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    description: t("pages.data-display.typography.props.size"),
  },
  {
    name: "as",
    type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'small' | 'strong' | 'em'",
    description: t("pages.data-display.typography.props.as"),
  },
  {
    name: "weight",
    type: "'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'",
    description: t("pages.data-display.typography.props.weight"),
  },
  {
    name: "align",
    type: "'left' | 'center' | 'right'",
    description: t("pages.data-display.typography.props.align"),
  },
  {
    name: "color",
    type: "'default' | 'muted' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.data-display.typography.props.color"),
  },
  {
    name: "truncate",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.typography.props.truncate"),
  },
  {
    name: "italic",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.typography.props.italic"),
  },
  {
    name: "underline",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.typography.props.underline"),
  },
  {
    name: "strikethrough",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.typography.props.strikethrough"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.data-display.typography.slots.default"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.typography.title')"
    category="Data Display"
    import-path="import { Typography } from 'mood-ui'"
    :description="t('pages.data-display.typography.description')"
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
        :title="t('pages.data-display.typography.examples.variants.title')"
        :description="t('pages.data-display.typography.examples.variants.desc')"
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
        :title="t('pages.data-display.typography.examples.sizes.title')"
        :description="t('pages.data-display.typography.examples.sizes.desc')"
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
        :title="t('pages.data-display.typography.examples.weights.title')"
        :description="t('pages.data-display.typography.examples.weights.desc')"
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
        :title="t('pages.data-display.typography.examples.colors.title')"
        :description="t('pages.data-display.typography.examples.colors.desc')"
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
        :title="t('pages.data-display.typography.examples.truncate.title')"
        :description="t('pages.data-display.typography.examples.truncate.desc')"
        :code="truncateCode"
      >
        <div class="w-48">
          <Typography truncate>
            Texto que se trunca con ellipsis cuando no cabe en una sola línea.
          </Typography>
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
        {{ t("pages.data-display.typography.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.typography.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
