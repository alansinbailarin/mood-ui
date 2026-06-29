<script setup lang="ts">
import { ref, computed } from "vue";
import { Timeline, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import {
  CheckCircleIcon,
  RocketLaunchIcon,
  BeakerIcon,
  BugAntIcon,
} from "@heroicons/vue/24/solid";
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
  { keys: ["Tab"], action: t("pages.data-display.timeline.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.timeline.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.timeline.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.timeline.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"dot" | "icon" | "outline">("dot");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSide = ref<"left" | "right">("left");

function resetPlayground() {
  pgVariant.value = "dot";
  pgSize.value = "medium";
  pgColor.value = "primary";
  pgSide.value = "left";
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

const typesCode = `export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: Component;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  variant?: 'dot' | 'icon' | 'outline';
}

export interface Timeline {
  items: TimelineItem[];
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  side?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  variant?: 'dot' | 'icon' | 'outline';
}`;

const playgroundItems = [
  { id: 1, title: "Order received", timestamp: "10:24" },
  { id: 2, title: "Payment confirmed", timestamp: "10:31" },
  { id: 3, title: "Preparing", timestamp: "10:48" },
  { id: 4, title: "Shipped", timestamp: "14:02" },
];

const overviewCode = computed(() => {
  const parts: string[] = [':items="items"'];
  if (pgVariant.value !== "dot") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgColor.value !== "primary") parts.push(`color="${pgColor.value}"`);
  if (pgSide.value !== "left") parts.push(`side="${pgSide.value}"`);
  return `<Timeline ${parts.join(" ")} />`;
});

// ── Example data ──────────────────────────────────────────────────────────────
const orderItems = [
  { id: 1, title: "Order received", timestamp: "10:24" },
  { id: 2, title: "Payment confirmed", timestamp: "10:31" },
  { id: 3, title: "Preparing", timestamp: "10:48" },
  { id: 4, title: "Shipped", timestamp: "14:02" },
];

const releaseItems = [
  {
    id: 1,
    title: "v0.4.0 released",
    timestamp: "3 May 2026",
    description: "New Tier S components: Kbd, Code, Stepper.",
    icon: RocketLaunchIcon,
    variant: "icon" as const,
  },
  {
    id: 2,
    title: "v0.3.1 hotfix",
    timestamp: "20 Apr 2026",
    description: "Fixed theming on dark surfaces.",
    icon: BugAntIcon,
    variant: "icon" as const,
    color: "warning" as const,
  },
  {
    id: 3,
    title: "v0.3.0",
    timestamp: "15 Apr 2026",
    description: "Surface presets and i18n support.",
    icon: BeakerIcon,
    variant: "icon" as const,
  },
  {
    id: 4,
    title: "v0.2.0",
    timestamp: "5 Apr 2026",
    description: "Initial Calendar, Scheduler and Table.",
    icon: CheckCircleIcon,
    variant: "icon" as const,
    color: "success" as const,
  },
];

const coloredItems = [
  {
    id: 1,
    title: "Build passed",
    timestamp: "2m ago",
    color: "success" as const,
  },
  {
    id: 2,
    title: "Tests with warnings",
    timestamp: "5m ago",
    color: "warning" as const,
  },
  {
    id: 3,
    title: "Deploy failed",
    timestamp: "8m ago",
    color: "danger" as const,
  },
];

const detailItems = [
  {
    id: 1,
    title: "Client meeting",
    timestamp: "09:00",
    description: "Kickoff of the new project and scope review.",
  },
  {
    id: 2,
    title: "Design approved",
    timestamp: "12:30",
    description: "Mockups validated by the product team.",
  },
  {
    id: 3,
    title: "Sprint planning",
    timestamp: "16:00",
    description: "Definition of objectives for the next cycle.",
  },
];

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { Timeline } from 'mood-ui';

const items = [
  { id: 1, title: "Order received", timestamp: "10:24" },
  { id: 2, title: "Payment confirmed", timestamp: "10:31" },
];
<\/script>

<template>
  <Timeline :items="items" />
</template>`;

const iconsCode = `<script setup lang="ts">
import { Timeline } from 'mood-ui';
import { RocketLaunchIcon, BugAntIcon, BeakerIcon, CheckCircleIcon } from '@heroicons/vue/24/solid';

const releases = [
  { id: 1, title: 'v0.4.0 released', timestamp: '3 May 2026', description: 'New Tier S components.', icon: RocketLaunchIcon, variant: 'icon' as const },
  { id: 2, title: 'v0.3.1 hotfix',    timestamp: '20 Apr 2026', description: 'Fixed theming on dark surfaces.', icon: BugAntIcon,     variant: 'icon' as const, color: 'warning' as const },
];
<\/script>

<template>
  <Timeline :items="releases" variant="icon" />
</template>`;

const colorsCode = `<script setup lang="ts">
import { Timeline } from 'mood-ui';

const items = [
  { id: 1, title: 'Build passed',      color: 'success' },
  { id: 2, title: 'Tests with warnings', color: 'warning' },
  { id: 3, title: 'Deploy failed',       color: 'danger'  },
];
<\/script>

<template>
  <Timeline :items="items" />
</template>`;

const descriptionCode = `<script setup lang="ts">
import { Timeline } from 'mood-ui';

const items = [
  { id: 1, title: 'Client meeting',  timestamp: '09:00', description: 'Kickoff of the new project.' },
  { id: 2, title: 'Design approved', timestamp: '12:30', description: 'Mockups validated.' },
];
<\/script>

<template>
  <Timeline :items="items" />
</template>`;

const rightSideCode = `<script setup lang="ts">
import { Timeline } from 'mood-ui';

const items = [
  { id: 1, title: "Order received", timestamp: "10:24" },
];
<\/script>

<template>
  <Timeline :items="items" side="right" />
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "items",
    type: "TimelineItem[]",
    required: true,
    description: t("pages.data-display.timeline.props.items"),
  },
  {
    name: "variant",
    type: "'dot' | 'icon' | 'outline'",
    default: "'dot'",
    description: t("pages.data-display.timeline.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'primary'",
    description: t("pages.data-display.timeline.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.data-display.timeline.props.size"),
  },
  {
    name: "side",
    type: "'left' | 'right'",
    default: "'left'",
    description: t("pages.data-display.timeline.props.side"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "item-{id}",
    description: t("pages.data-display.timeline.slots.itemId"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.timeline.title')"
    category="Data Display"
    import-path="import { Timeline } from 'mood-ui'"
    :description="t('pages.data-display.timeline.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="320px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('controls.variant')"
            :options="[
              { value: 'dot' },
              { value: 'icon' },
              { value: 'outline' },
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
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('controls.side')"
            :options="[{ value: 'left' }, { value: 'right' }]"
            v-model="pgSide"
          />
        </template>

        <div class="w-full max-w-md">
          <Timeline
            :items="playgroundItems"
            :variant="pgVariant"
            :size="pgSize"
            :color="pgColor"
            :side="pgSide"
          />
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.timeline.examples.basic.title')"
        :description="t('pages.data-display.timeline.examples.basic.desc')"
        :code="basicCode"
      >
        <div class="w-full max-w-md">
          <Timeline :items="orderItems" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.timeline.examples.icons.title')"
        :description="t('pages.data-display.timeline.examples.icons.desc')"
        :code="iconsCode"
      >
        <div class="w-full max-w-md">
          <Timeline :items="releaseItems" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.timeline.examples.colors.title')"
        :description="t('pages.data-display.timeline.examples.colors.desc')"
        :code="colorsCode"
      >
        <div class="w-full max-w-md">
          <Timeline :items="coloredItems" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.timeline.examples.descriptions.title')"
        :description="
          t('pages.data-display.timeline.examples.descriptions.desc')
        "
        :code="descriptionCode"
      >
        <div class="w-full max-w-md">
          <Timeline :items="detailItems" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.timeline.examples.right.title')"
        :description="t('pages.data-display.timeline.examples.right.desc')"
        :code="rightSideCode"
      >
        <div class="w-full max-w-md">
          <Timeline :items="orderItems" side="right" />
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
        {{ t("pages.data-display.timeline.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.timeline.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
