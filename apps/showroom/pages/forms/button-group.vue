<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, ButtonGroup, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";



import { HeartIcon, ArrowRightIcon, BoltIcon } from "@heroicons/vue/24/outline";
import type { PropDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.forms.buttonGroup.title"),
  description: () => t("pages.forms.buttonGroup.description"),
  ogTitle: () => `${t("pages.forms.buttonGroup.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.buttonGroup.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.buttonGroup.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.buttonGroup.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"group"',
    desc: t("pages.forms.buttonGroup.a11y.ariaGroup"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.buttonGroup.a11y.ariaLabel"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.buttonGroup.a11y.ariaDisabled"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.buttonGroup.a11y.focusNoTrap"),
  t("pages.forms.buttonGroup.a11y.focusDisabled"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"normal" | "outline" | "ghost" | "text">("normal");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgGradient = ref(false);
const pgDisabled = ref(false);
const pgFullWidth = ref(false);

function resetPlayground() {
  pgVariant.value = "normal";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgGradient.value = false;
  pgDisabled.value = false;
  pgFullWidth.value = false;
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
  if (pgVariant.value !== "normal") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgGradient.value) parts.push(':gradient="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgFullWidth.value) parts.push(':full-width="true"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<ButtonGroup${attrs}>
    <Button color="primary">One</Button>
    <Button color="primary">Two</Button>
    <Button color="primary">Three</Button>
</ButtonGroup>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ButtonGroup, Button } from 'mood-ui';
<\/script>

<template>
  <ButtonGroup color="primary">
    <Button>Left</Button>
    <Button>Center</Button>
    <Button>Right</Button>
  </ButtonGroup>
</template>`;

const mixedCode = `<script setup lang="ts">
import { ButtonGroup, Button } from 'mood-ui';
<\/script>

<template>
  <ButtonGroup variant="outline">
    <Button color="success">Approve</Button>
    <Button color="warning">Review</Button>
    <Button color="danger">Reject</Button>
  </ButtonGroup>
</template>`;

const fullWidthCode = `<script setup lang="ts">
import { ButtonGroup, Button } from 'mood-ui';
<\/script>

<template>
  <ButtonGroup color="primary" full-width>
    <Button>Day</Button>
    <Button>Week</Button>
    <Button>Month</Button>
    <Button>Year</Button>
  </ButtonGroup>
</template>`;

const verticalCode = `<script setup lang="ts">
import { ButtonGroup, Button } from 'mood-ui';
<\/script>

<template>
  <ButtonGroup orientation="vertical" variant="outline" color="primary">
    <Button>Edit</Button>
    <Button>Duplicate</Button>
    <Button>Archive</Button>
    <Button>Delete</Button>
  </ButtonGroup>
</template>`;

const iconsCode = `<script setup lang="ts">
import { ButtonGroup, Button } from 'mood-ui';
import { HeartIcon, BoltIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <ButtonGroup color="primary">
    <Button :icon="HeartIcon" ariaLabel="Like" />
    <Button :icon="BoltIcon" ariaLabel="Boost" />
    <Button :icon="ArrowRightIcon" ariaLabel="Next" />
  </ButtonGroup>
</template>`;

const typesCode = `export interface ButtonGroup {
  orientation?: "horizontal" | "vertical";
  variant?: "normal" | "outline" | "ghost" | "text";
  color?: "default" | "primary" | "danger" | "success" | "warning";
  size?: "small" | "medium" | "large";
  radius?: "none" | "small" | "medium" | "large" | "full";
  disabled?: boolean;
  gradient?: boolean;
  fullWidth?: boolean;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "orientation",
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: t("pages.forms.buttonGroup.props.orientation"),
  },
  {
    name: "variant",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'normal'",
    description: t("pages.forms.buttonGroup.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.buttonGroup.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.buttonGroup.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.buttonGroup.props.radius"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.buttonGroup.props.disabled"),
  },
  {
    name: "gradient",
    type: "boolean",
    default: "false",
    description: t("pages.forms.buttonGroup.props.gradient"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.buttonGroup.props.fullWidth"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.forms.buttonGroup.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.buttonGroup.title')"
    :category="t('pages.forms.buttonGroup.category')"
    import-path="import { ButtonGroup, Button } from 'mood-ui'"
    :description="t('pages.forms.buttonGroup.description')"
    :props-list="propsList"
    :slots-list="slotsList"
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
            :label="t('pages.forms.buttonGroup.controls.variant')"
            :options="[
              { value: 'normal' },
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'text' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.forms.buttonGroup.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.forms.buttonGroup.controls.size')"
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
            :label="t('pages.forms.buttonGroup.controls.gradient')"
            v-model="pgGradient"
          />
          <TbToggle
            :label="t('pages.forms.buttonGroup.controls.disabled')"
            v-model="pgDisabled"
          />
          <TbToggle
            :label="t('pages.forms.buttonGroup.controls.fullWidth')"
            v-model="pgFullWidth"
          />
        </template>

        <ButtonGroup
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :gradient="pgGradient"
          :disabled="pgDisabled"
          :full-width="pgFullWidth"
        >
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </ButtonGroup>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.buttonGroup.examples.basic.title')"
        :description="t('pages.forms.buttonGroup.examples.basic.desc')"
        :code="basicCode"
      >
        <ButtonGroup color="primary">
          <Button>Left</Button>
          <Button>Center</Button>
          <Button>Right</Button>
        </ButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.buttonGroup.examples.mixed.title')"
        :description="t('pages.forms.buttonGroup.examples.mixed.desc')"
        :code="mixedCode"
      >
        <ButtonGroup variant="outline">
          <Button color="success">Approve</Button>
          <Button color="warning">Review</Button>
          <Button color="danger">Reject</Button>
        </ButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.buttonGroup.examples.fullWidth.title')"
        :description="t('pages.forms.buttonGroup.examples.fullWidth.desc')"
        :code="fullWidthCode"
      >
        <ButtonGroup color="primary" full-width>
          <Button>Day</Button>
          <Button>Week</Button>
          <Button>Month</Button>
          <Button>Year</Button>
        </ButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.buttonGroup.examples.vertical.title')"
        :description="t('pages.forms.buttonGroup.examples.vertical.desc')"
        :code="verticalCode"
      >
        <ButtonGroup orientation="vertical" variant="outline" color="primary">
          <Button>Edit</Button>
          <Button>Duplicate</Button>
          <Button>Archive</Button>
          <Button>Delete</Button>
        </ButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.buttonGroup.examples.icons.title')"
        :description="t('pages.forms.buttonGroup.examples.icons.desc')"
        :code="iconsCode"
      >
        <ButtonGroup color="primary">
          <Button :icon="HeartIcon" ariaLabel="Like" />
          <Button :icon="BoltIcon" ariaLabel="Boost" />
          <Button :icon="ArrowRightIcon" ariaLabel="Next" />
        </ButtonGroup>
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
        {{ t("pages.forms.buttonGroup.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.buttonGroup.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
