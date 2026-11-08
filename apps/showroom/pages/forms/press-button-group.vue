<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import { Typography, PressButton, PressButtonGroup } from "mood-ui";
import { BoltIcon, SparklesIcon, CheckIcon } from "@heroicons/vue/20/solid";
import type { PropDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const k = (key: string) => t(`pages.forms.pressButtonGroup.${key}`);
const label = (key: string) => k(`labels.${key}`);

type Variant = "normal" | "outline" | "ghost" | "text";
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: k("a11y.kbTab") },
  { keys: ["Shift+Tab"], action: k("a11y.kbShiftTab") },
  { keys: ["Space", "Enter"], action: k("a11y.kbActivate") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"group"', desc: k("a11y.ariaGroup") },
  { attribute: "aria-label", value: "string", desc: k("a11y.ariaLabel") },
  { attribute: "disabled", value: "true", desc: k("a11y.ariaDisabled") },
]);

const a11yFocus = computed<string[]>(() => [k("a11y.focusNoTrap")]);

// ── Overview playground state ─────────────────────────────────────────────────
// Size and radius start undefined so the group follows the showroom's
// ModoProvider until a pill is picked.
const pgVariant = ref<Variant>("outline");
const pgColor = ref<Color>("default");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgOrientation = ref<"horizontal" | "vertical">("horizontal");
const pgDisabled = ref(false);
const pgGradient = ref(false);
const pgFullWidth = ref(false);

function resetPlayground() {
  pgVariant.value = "outline";
  pgColor.value = "default";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgOrientation.value = "horizontal";
  pgDisabled.value = false;
  pgGradient.value = false;
  pgFullWidth.value = false;
}

const colorDots = computed(() => [
  { value: "default", bg: "var(--color-slate-400)", label: k("controls.colors.default") },
  { value: "primary", bg: "var(--primary)", label: k("controls.colors.primary") },
  { value: "success", bg: "var(--color-emerald-500)", label: k("controls.colors.success") },
  { value: "warning", bg: "var(--color-amber-500)", label: k("controls.colors.warning") },
  { value: "danger", bg: "var(--color-red-500)", label: k("controls.colors.danger") },
]);

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "normal") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value) parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value) parts.push(`radius="${pgRadius.value}"`);
  if (pgOrientation.value !== "horizontal")
    parts.push(`orientation="${pgOrientation.value}"`);
  if (pgGradient.value) parts.push("gradient");
  if (pgDisabled.value) parts.push("disabled");
  if (pgFullWidth.value) parts.push("full-width");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<PressButtonGroup${attrs} aria-label="Time range">
  <PressButton>Day</PressButton>
  <PressButton>Week</PressButton>
  <PressButton>Month</PressButton>
  <PressButton>Year</PressButton>
</PressButtonGroup>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { PressButtonGroup, PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButtonGroup variant="outline" aria-label="Time range">
    <PressButton>Day</PressButton>
    <PressButton>Week</PressButton>
    <PressButton>Month</PressButton>
    <PressButton>Year</PressButton>
  </PressButtonGroup>
</template>`;

const variantsCode = `<script setup lang="ts">
import { PressButtonGroup, PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButtonGroup variant="ghost" color="primary">
    <PressButton>Left</PressButton>
    <PressButton>Center</PressButton>
    <PressButton>Right</PressButton>
  </PressButtonGroup>

  <PressButtonGroup variant="normal" color="primary">
    <PressButton>Draft</PressButton>
    <PressButton>Review</PressButton>
    <PressButton>Publish</PressButton>
  </PressButtonGroup>
</template>`;

const pillCode = `<script setup lang="ts">
import { PressButtonGroup, PressButton } from 'mood-ui';
import { BoltIcon, SparklesIcon, CheckIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <PressButtonGroup variant="normal" color="primary" radius="full">
    <PressButton :start-icon="BoltIcon">Fast</PressButton>
    <PressButton :start-icon="SparklesIcon">Auto</PressButton>
    <PressButton :start-icon="CheckIcon">Precise</PressButton>
  </PressButtonGroup>
</template>`;

const verticalCode = `<script setup lang="ts">
import { PressButtonGroup, PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButtonGroup orientation="vertical" variant="ghost">
    <PressButton>Edit</PressButton>
    <PressButton>Duplicate</PressButton>
    <PressButton>Archive</PressButton>
  </PressButtonGroup>
</template>`;

const fullWidthCode = `<script setup lang="ts">
import { PressButtonGroup, PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButtonGroup variant="outline" color="primary" full-width>
    <PressButton>Overview</PressButton>
    <PressButton>Metrics</PressButton>
    <PressButton>Logs</PressButton>
    <PressButton>Settings</PressButton>
  </PressButtonGroup>
</template>`;

const typesCode = `type PressButtonVariant = 'normal' | 'outline' | 'ghost' | 'text';

export interface PressButtonGroup {
  orientation?: 'horizontal' | 'vertical';
  variant?: PressButtonVariant;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  disabled?: boolean;
  gradient?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "orientation",
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: k("props.orientation"),
  },
  {
    name: "variant",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'normal'",
    description: k("props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: k("props.color"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    default: "ModoProvider",
    description: k("props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "ModoProvider",
    description: k("props.radius"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
  },
  {
    name: "gradient",
    type: "boolean",
    default: "false",
    description: k("props.gradient"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: k("props.fullWidth"),
  },
  { name: "ariaLabel", type: "string", description: k("props.ariaLabel") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: k("slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    import-path="import { PressButtonGroup, PressButton } from 'mood-ui'"
    :description="k('description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            v-model="pgVariant"
            :label="k('controls.variant')"
            :options="[
              { value: 'normal' },
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'text' },
            ]"
          />
          <TbSep />
          <TbDots
            v-model="pgColor"
            :label="k('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgSize"
            :label="k('controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgRadius"
            :label="k('controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgOrientation"
            :label="k('controls.orientation')"
            :options="[{ value: 'horizontal' }, { value: 'vertical' }]"
          />
          <TbSep />
          <TbToggle v-model="pgGradient" :label="k('controls.gradient')" />
          <TbToggle v-model="pgDisabled" :label="k('controls.disabled')" />
          <TbToggle v-model="pgFullWidth" :label="k('controls.fullWidth')" />
        </template>

        <div :class="pgFullWidth ? 'w-full max-w-lg' : ''">
          <PressButtonGroup
            :variant="pgVariant"
            :color="pgColor"
            :size="pgSize"
            :radius="pgRadius"
            :orientation="pgOrientation"
            :gradient="pgGradient"
            :disabled="pgDisabled"
            :full-width="pgFullWidth"
            :aria-label="label('groupLabel')"
          >
            <PressButton>{{ label("day") }}</PressButton>
            <PressButton>{{ label("week") }}</PressButton>
            <PressButton>{{ label("month") }}</PressButton>
            <PressButton>{{ label("year") }}</PressButton>
          </PressButtonGroup>
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.basic.title')"
        :description="k('examples.basic.desc')"
        :code="basicCode"
      >
        <PressButtonGroup variant="outline" :aria-label="label('groupLabel')">
          <PressButton>{{ label("day") }}</PressButton>
          <PressButton>{{ label("week") }}</PressButton>
          <PressButton>{{ label("month") }}</PressButton>
          <PressButton>{{ label("year") }}</PressButton>
        </PressButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.variants.title')"
        :description="k('examples.variants.desc')"
        :code="variantsCode"
      >
        <PressButtonGroup variant="ghost" color="primary">
          <PressButton>{{ label("left") }}</PressButton>
          <PressButton>{{ label("center") }}</PressButton>
          <PressButton>{{ label("right") }}</PressButton>
        </PressButtonGroup>

        <PressButtonGroup variant="normal" color="primary">
          <PressButton>{{ label("draft") }}</PressButton>
          <PressButton>{{ label("review") }}</PressButton>
          <PressButton>{{ label("publish") }}</PressButton>
        </PressButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.pill.title')"
        :description="k('examples.pill.desc')"
        :code="pillCode"
      >
        <PressButtonGroup variant="normal" color="primary" radius="full">
          <PressButton :start-icon="BoltIcon">{{ label("fast") }}</PressButton>
          <PressButton :start-icon="SparklesIcon">{{ label("auto") }}</PressButton>
          <PressButton :start-icon="CheckIcon">{{ label("precise") }}</PressButton>
        </PressButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.vertical.title')"
        :description="k('examples.vertical.desc')"
        :code="verticalCode"
      >
        <PressButtonGroup orientation="vertical" variant="ghost">
          <PressButton>{{ label("edit") }}</PressButton>
          <PressButton>{{ label("duplicate") }}</PressButton>
          <PressButton>{{ label("archive") }}</PressButton>
        </PressButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.fullWidth.title')"
        :description="k('examples.fullWidth.desc')"
        :code="fullWidthCode"
      >
        <div class="w-full max-w-lg">
          <PressButtonGroup variant="outline" color="primary" full-width>
            <PressButton>{{ label("overview") }}</PressButton>
            <PressButton>{{ label("metrics") }}</PressButton>
            <PressButton>{{ label("logs") }}</PressButton>
            <PressButton>{{ label("settings") }}</PressButton>
          </PressButtonGroup>
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
        {{ k("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ k("types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
