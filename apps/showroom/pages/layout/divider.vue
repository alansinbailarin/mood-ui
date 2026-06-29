<script setup lang="ts">
import { ref, computed } from "vue";
import { Divider, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import A11yDoc from "~/components/A11yDoc.vue";
import type { PropDoc, SlotDoc } from "~/types/component-doc";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import { StarIcon } from "@heroicons/vue/24/outline";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.divider.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.divider.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.divider.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.divider.a11y.focusNative"),
]);

const pgOrientation = ref<"horizontal" | "vertical">("horizontal");
const pgVariant = ref<"solid" | "dashed" | "dotted">("solid");
const pgEmphasis = ref<"subtle" | "default" | "strong">("default");
const pgSpacing = ref<"none" | "small" | "medium" | "large">("medium");

function resetPlayground() {
  pgOrientation.value = "horizontal";
  pgVariant.value = "solid";
  pgEmphasis.value = "default";
  pgSpacing.value = "medium";
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgOrientation.value !== "horizontal")
    parts.push(`orientation="${pgOrientation.value}"`);
  if (pgVariant.value !== "solid") parts.push(`variant="${pgVariant.value}"`);
  if (pgEmphasis.value !== "default")
    parts.push(`emphasis="${pgEmphasis.value}"`);
  if (pgSpacing.value !== "medium") parts.push(`spacing="${pgSpacing.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Divider${attrs} />`;
});

const orientationsCode = `<script setup lang="ts">
import { Divider } from 'mood-ui';
<\/script>

<template>
  <Divider />
  <div class="flex items-center gap-3 h-12">
    <span>A</span>
    <Divider orientation="vertical" />
    <span>B</span>
  </div>
</template>`;

const labelCode = `<script setup lang="ts">
import { Divider } from 'mood-ui';
import { StarIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Divider label="or" />
  <Divider :icon="StarIcon" label="Featured" />
  <Divider label="Section" label-align="start" />
</template>`;

const variantsCode = `<script setup lang="ts">
import { Divider } from 'mood-ui';
<\/script>

<template>
  <Divider variant="solid"  label="solid"  />
  <Divider variant="dashed" label="dashed" />
  <Divider variant="dotted" label="dotted" />
</template>`;

const emphasisCode = `<script setup lang="ts">
import { Divider } from 'mood-ui';
<\/script>

<template>
  <Divider emphasis="subtle"  label="subtle"  />
  <Divider emphasis="default" label="default" />
  <Divider emphasis="strong"  label="strong"  />
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "orientation",
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: t("pages.layout.divider.props.orientation"),
  },
  {
    name: "variant",
    type: "'solid' | 'dashed' | 'dotted'",
    default: "'solid'",
    description: t("pages.layout.divider.props.variant"),
  },
  {
    name: "emphasis",
    type: "'subtle' | 'default' | 'strong'",
    default: "'default'",
    description: t("pages.layout.divider.props.emphasis"),
  },
  {
    name: "spacing",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.divider.props.spacing"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.layout.divider.props.label"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.layout.divider.props.icon"),
  },
  {
    name: "labelAlign",
    type: "'start' | 'center' | 'end'",
    default: "'center'",
    description: t("pages.layout.divider.props.labelAlign"),
  },
  {
    name: "decorative",
    type: "boolean",
    default: "false",
    description: t("pages.layout.divider.props.decorative"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.layout.divider.slots.default") },
]);

const typesCode = `export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerEmphasis = 'subtle' | 'default' | 'strong';
export type DividerSpacing = 'none' | 'small' | 'medium' | 'large';
export type DividerLabelAlign = 'start' | 'center' | 'end';

export interface Divider {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  emphasis?: DividerEmphasis;
  spacing?: DividerSpacing;
  label?: string;
  icon?: Component;
  labelAlign?: DividerLabelAlign;
  decorative?: boolean;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.divider.title')"
    :category="t('pages.layout.divider.category')"
    import-path="import { Divider } from 'mood-ui'"
    :description="t('pages.layout.divider.description')"
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
            label="Orientation"
            :options="[{ value: 'horizontal' }, { value: 'vertical' }]"
            v-model="pgOrientation"
          />
          <TbSep />
          <TbPills
            label="Variant"
            :options="[
              { value: 'solid' },
              { value: 'dashed' },
              { value: 'dotted' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            label="Emphasis"
            :options="[
              { value: 'subtle' },
              { value: 'default' },
              { value: 'strong' },
            ]"
            v-model="pgEmphasis"
          />
          <TbSep />
          <TbPills
            label="Spacing"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSpacing"
          />
        </template>

        <div v-if="pgOrientation === 'horizontal'" class="w-full max-w-md">
          <Divider
            :variant="pgVariant"
            :emphasis="pgEmphasis"
            :spacing="pgSpacing"
          />
        </div>
        <div v-else class="flex items-center gap-3 h-16">
          <span class="text-sm text-muted-foreground">A</span>
          <Divider
            orientation="vertical"
            :variant="pgVariant"
            :emphasis="pgEmphasis"
            :spacing="pgSpacing"
          />
          <span class="text-sm text-muted-foreground">B</span>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.divider.examples.orientations.title')"
        :description="t('pages.layout.divider.examples.orientations.desc')"
        :code="orientationsCode"
      >
        <div class="w-full flex flex-col gap-3">
          <Divider />
          <div class="flex items-center gap-3 h-12 justify-center">
            <span class="text-sm">A</span>
            <Divider orientation="vertical" />
            <span class="text-sm">B</span>
            <Divider orientation="vertical" />
            <span class="text-sm">C</span>
          </div>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.divider.examples.label.title')"
        :description="t('pages.layout.divider.examples.label.desc')"
        :code="labelCode"
      >
        <div class="w-full flex flex-col gap-3">
          <Divider :label="t('pages.layout.divider.labels.or')" />
          <Divider
            :icon="StarIcon"
            :label="t('pages.layout.divider.labels.featured')"
          />
          <Divider
            :label="t('pages.layout.divider.labels.section')"
            label-align="start"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.divider.examples.variants.title')"
        :description="t('pages.layout.divider.examples.variants.desc')"
        :code="variantsCode"
      >
        <div class="w-full flex flex-col gap-3">
          <Divider variant="solid" label="solid" />
          <Divider variant="dashed" label="dashed" />
          <Divider variant="dotted" label="dotted" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.divider.examples.emphasis.title')"
        :description="t('pages.layout.divider.examples.emphasis.desc')"
        :code="emphasisCode"
      >
        <div class="w-full flex flex-col gap-3">
          <Divider emphasis="subtle" label="subtle" />
          <Divider emphasis="default" label="default" />
          <Divider emphasis="strong" label="strong" />
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
        {{ t("pages.layout.divider.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.divider.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
