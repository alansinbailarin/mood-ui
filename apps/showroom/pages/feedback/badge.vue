<script setup lang="ts">
import { ref, computed } from "vue";
import { Badge, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";

import ComponentPreview from "~/components/ComponentPreview.vue";

import { CheckCircleIcon, StarIcon, BoltIcon } from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
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


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.badge.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.badge.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.feedback.badge.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.badge.a11y.focusNative"),
]);

const pgVariant = ref<"solid" | "subtle" | "outline">("subtle");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgDot = ref(false);
const pgRemovable = ref(false);
const pgGradient = ref(false);

function resetPlayground() {
  pgVariant.value = "subtle";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgDot.value = false;
  pgRemovable.value = false;
  pgGradient.value = false;
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
  if (pgDot.value) parts.push("dot");
  if (pgRemovable.value) parts.push("removable");
  if (pgGradient.value) parts.push("gradient");
  parts.push(`label="${t("pages.feedback.badge.demo.label")}"`);
  return `<Badge ${parts.join(" ")} />`;
});

const variantsCode = `<script setup lang="ts">
import { Badge } from 'mood-ui';
<\/script>

<template>
  <Badge label="Solid"   variant="solid"   color="primary" />
  <Badge label="Subtle"  variant="subtle"  color="primary" />
  <Badge label="Outline" variant="outline" color="primary" />
</template>`;

const colorsCode = `<script setup lang="ts">
import { Badge } from 'mood-ui';
<\/script>

<template>
  <Badge label="default" color="default" />
  <Badge label="primary" color="primary" />
  <Badge label="success" color="success" />
  <Badge label="warning" color="warning" />
  <Badge label="danger"  color="danger"  />
</template>`;

const iconCode = `<script setup lang="ts">
import { Badge } from 'mood-ui';
import { CheckCircleIcon, StarIcon, BoltIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Badge label="Active"   :icon="CheckCircleIcon" color="success" />
  <Badge label="Featured" :icon="StarIcon"        color="warning" />
  <Badge label="Pro"      :icon="BoltIcon"        color="primary" variant="solid" />
</template>`;

const dotCode = `<script setup lang="ts">
import { Badge } from 'mood-ui';
<\/script>

<template>
  <Badge label="Online"  dot color="success" />
  <Badge label="Away"    dot color="warning" />
  <Badge label="Offline" dot color="default" />
</template>`;

const typesCode = `export interface Badge {
  label?: string;
  variant?: 'solid' | 'outline' | 'subtle';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  gradient?: boolean;
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  icon?: Component;
  removable?: boolean;
  dot?: boolean;
  removeAriaLabel?: string;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "label",
    type: "string",
    description: t("pages.feedback.badge.props.label"),
  },
  {
    name: "variant",
    type: "'solid' | 'subtle' | 'outline'",
    default: "'subtle'",
    description: t("pages.feedback.badge.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.feedback.badge.props.color"),
  },
  {
    name: "gradient",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.badge.props.gradient"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    description: t("pages.feedback.badge.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.badge.props.radius"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.feedback.badge.props.icon"),
  },
  {
    name: "removable",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.badge.props.removable"),
  },
  {
    name: "dot",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.badge.props.dot"),
  },
  {
    name: "removeAriaLabel",
    type: "string",
    description: t("pages.feedback.badge.props.removeAriaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "remove",
    payload: "—",
    description: t("pages.feedback.badge.emits.remove"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.feedback.badge.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.badge.title')"
    :category="t('pages.feedback.badge.category')"
    import-path="import { Badge } from 'mood-ui'"
    :description="t('pages.feedback.badge.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="180px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Variant"
            :options="[
              { value: 'solid' },
              { value: 'subtle' },
              { value: 'outline' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots label="Color" :options="colorDots" v-model="pgColor" />
          <TbSep />
          <TbPills
            label="Size"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle label="Dot" v-model="pgDot" />
          <TbToggle label="Removable" v-model="pgRemovable" />
          <TbToggle label="Gradient" v-model="pgGradient" />
        </template>

        <Badge
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :dot="pgDot"
          :removable="pgRemovable"
          :gradient="pgGradient"
          :label="t('pages.feedback.badge.demo.label')"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.badge.examples.variants.title')"
        :description="t('pages.feedback.badge.examples.variants.desc')"
        :code="variantsCode"
      >
        <Badge label="Solid" variant="solid" color="primary" />
        <Badge label="Subtle" variant="subtle" color="primary" />
        <Badge label="Outline" variant="outline" color="primary" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.badge.examples.colors.title')"
        :description="t('pages.feedback.badge.examples.colors.desc')"
        :code="colorsCode"
      >
        <Badge label="default" color="default" variant="subtle" />
        <Badge label="primary" color="primary" variant="subtle" />
        <Badge label="success" color="success" variant="subtle" />
        <Badge label="warning" color="warning" variant="subtle" />
        <Badge label="danger" color="danger" variant="subtle" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.badge.examples.icon.title')"
        :description="t('pages.feedback.badge.examples.icon.desc')"
        :code="iconCode"
      >
        <Badge
          :label="t('pages.feedback.badge.demo.active')"
          :icon="CheckCircleIcon"
          color="success"
          variant="subtle"
        />
        <Badge
          :label="t('pages.feedback.badge.demo.featured')"
          :icon="StarIcon"
          color="warning"
          variant="subtle"
        />
        <Badge
          :label="t('pages.feedback.badge.demo.pro')"
          :icon="BoltIcon"
          color="primary"
          variant="solid"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.badge.examples.dot.title')"
        :description="t('pages.feedback.badge.examples.dot.desc')"
        :code="dotCode"
      >
        <Badge
          :label="t('pages.feedback.badge.demo.online')"
          dot
          color="success"
          variant="subtle"
        />
        <Badge
          :label="t('pages.feedback.badge.demo.away')"
          dot
          color="warning"
          variant="subtle"
        />
        <Badge
          :label="t('pages.feedback.badge.demo.offline')"
          dot
          color="default"
          variant="subtle"
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
        {{ t("pages.feedback.badge.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.badge.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
