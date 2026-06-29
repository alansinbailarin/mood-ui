<script setup lang="ts">
import { ref, computed } from "vue";
import { Tabs, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import {
  HomeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/vue/24/outline";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.navigation.tabs.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.navigation.tabs.a11y.kbShiftTab") },
  { keys: ["←", "→"], action: t("pages.navigation.tabs.a11y.kbArrow") },
  { keys: ["Enter"], action: t("pages.navigation.tabs.a11y.kbEnter") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.navigation.tabs.a11y.ariaLabel"),
  },
  {
    attribute: "aria-selected",
    value: "true",
    desc: t("pages.navigation.tabs.a11y.ariaSelected"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.navigation.tabs.a11y.focusNative"),
]);

const pgVariant = ref<"line" | "pill" | "segmented">("line");
const pgColor = ref<"default" | "primary" | "danger" | "success" | "warning">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgActive = ref<string | number>("overview");
const pgFullWidth = ref(false);

function resetPlayground() {
  pgVariant.value = "line";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgActive.value = "overview";
  pgFullWidth.value = false;
}

const playgroundItems = computed(() => [
  { value: "overview", label: t("pages.navigation.tabs.playground.overview") },
  {
    value: "analytics",
    label: t("pages.navigation.tabs.playground.analytics"),
  },
  { value: "settings", label: t("pages.navigation.tabs.playground.settings") },
]);

const colorDots = [
  { value: "default" as const, bg: "#64748b", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "#22c55e", label: "Success" },
  { value: "warning" as const, bg: "#f59e0b", label: "Warning" },
  { value: "danger" as const, bg: "#ef4444", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "line") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgFullWidth.value) parts.push("full-width");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Tabs v-model="active" :items="items"${attrs} class="w-full max-w-md" />`;
});

const variantsActive = ref<string | number>("overview");
const iconsActive = ref<string | number>("home");
const verticalActive = ref<string | number>("account");
const controlledActive = ref<string | number>("inbox");
const badgesActive = ref<string | number>("inbox");

const iconItems = computed(() => [
  {
    value: "home",
    label: t("pages.navigation.tabs.icons.home"),
    icon: HomeIcon,
  },
  {
    value: "stats",
    label: t("pages.navigation.tabs.icons.stats"),
    icon: ChartBarIcon,
  },
  {
    value: "settings",
    label: t("pages.navigation.tabs.icons.settings"),
    icon: Cog6ToothIcon,
  },
]);

const verticalItems = computed(() => [
  { value: "account", label: t("pages.navigation.tabs.vertical.account") },
  { value: "security", label: t("pages.navigation.tabs.vertical.security") },
  { value: "billing", label: t("pages.navigation.tabs.vertical.billing") },
]);

const badgeItems = computed(() => [
  {
    value: "inbox",
    label: t("pages.navigation.tabs.badges.inbox"),
    icon: BellIcon,
    badge: 12,
  },
  { value: "sent", label: t("pages.navigation.tabs.badges.sent"), badge: 3 },
  { value: "drafts", label: t("pages.navigation.tabs.badges.drafts") },
]);

const variantsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from 'mood-ui';

const active = ref('overview');
const items = [
  { value: 'overview',  label: 'Overview' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'settings',  label: 'Settings' },
];
<\/script>

<template>
  <Tabs v-model="active" :items="items" variant="line" />
  <Tabs v-model="active" :items="items" variant="pill" />
  <Tabs v-model="active" :items="items" variant="segmented" />
</template>`;

const iconsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from 'mood-ui';
import { HomeIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const items = [
  { value: 'home',     label: 'Home',     icon: HomeIcon },
  { value: 'stats',    label: 'Stats',    icon: ChartBarIcon },
  { value: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];
<\/script>

<template>
  <Tabs v-model="active" :items="items" variant="pill" color="primary" />
</template>`;

const verticalCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from 'mood-ui';

const active = ref('account');
const items = [
  { value: 'account',  label: 'Account' },
  { value: 'security', label: 'Security' },
  { value: 'billing',  label: 'Billing' },
];
<\/script>

<template>
  <Tabs v-model="active" :items="items" variant="line">
    <template #panel-account>Account content</template>
    <template #panel-security>Security content</template>
    <template #panel-billing>Billing content</template>
  </Tabs>
</template>`;

const controlledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from 'mood-ui';

const active = ref('inbox');
const items = [
  { value: 'inbox', label: 'Inbox', badge: 12 },
  { value: 'sent',  label: 'Sent',  badge: 3 },
  { value: 'drafts', label: 'Drafts' },
];
<\/script>

<template>
  <Tabs v-model="active" :items="items" variant="segmented" />
</template>`;

const badgesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Tabs } from 'mood-ui';
import { BellIcon } from '@heroicons/vue/24/outline';

const active = ref('inbox');
const items = [
  { value: 'inbox',  label: 'Inbox',  icon: BellIcon, badge: 12 },
  { value: 'sent',   label: 'Sent',   badge: 3 },
  { value: 'drafts', label: 'Drafts' },
];
<\/script>

<template>
  <Tabs v-model="active" :items="items" variant="pill" color="danger" />
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "items",
    type: "TabItem[]",
    required: true,
    description: t("pages.navigation.tabs.props.items"),
  },
  {
    name: "modelValue",
    type: "string | number | null",
    description: t("pages.navigation.tabs.props.modelValue"),
  },
  {
    name: "variant",
    type: "'line' | 'pill' | 'segmented'",
    default: "'line'",
    description: t("pages.navigation.tabs.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.navigation.tabs.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.navigation.tabs.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.navigation.tabs.props.radius"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.navigation.tabs.props.fullWidth"),
  },
  {
    name: "lazy",
    type: "boolean",
    default: "false",
    description: t("pages.navigation.tabs.props.lazy"),
  },
  {
    name: "keepMounted",
    type: "boolean",
    default: "true",
    description: t("pages.navigation.tabs.props.keepMounted"),
  },
  {
    name: "linkComponent",
    type: "string | Component",
    default: "'a'",
    description: t("pages.navigation.tabs.props.linkComponent"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.navigation.tabs.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | number",
    description: t("pages.navigation.tabs.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "(value, item: TabItem)",
    description: t("pages.navigation.tabs.emits.change"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.navigation.tabs.slots.default") },
  { name: "content", description: t("pages.navigation.tabs.slots.content") },
  {
    name: "panel-<value>",
    bindings: "{ item, active }",
    description: t("pages.navigation.tabs.slots.panelByValue"),
  },
  {
    name: "panel",
    bindings: "{ item, active }",
    description: t("pages.navigation.tabs.slots.panel"),
  },
]);

const typesCode = `export interface TabItem {
  id: string;
  label: string;
  icon?: Component;
  badge?: string | number;
  disabled?: boolean;
}

export interface Tabs {
  modelValue?: string;
  items?: TabItem[];
  variant?: 'underline' | 'pill' | 'outline' | 'ghost';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  stretch?: boolean;
  showContent?: boolean;
  animated?: boolean;
  ariaLabel?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.navigation.tabs.title')"
    :category="t('pages.navigation.tabs.category')"
    import-path="import { Tabs } from 'mood-ui'"
    :description="t('pages.navigation.tabs.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Variant"
            :options="[
              { value: 'line' },
              { value: 'pill' },
              { value: 'segmented' },
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
          <TbToggle label="Full width" v-model="pgFullWidth" />
        </template>

        <Tabs
          v-model="pgActive"
          :items="playgroundItems"
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :full-width="pgFullWidth"
          class="w-full max-w-md"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.navigation.tabs.examples.variants.title')"
        :description="t('pages.navigation.tabs.examples.variants.desc')"
        :code="variantsCode"
      >
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Tabs
            v-model="variantsActive"
            :items="playgroundItems"
            variant="line"
          />
          <Tabs
            v-model="variantsActive"
            :items="playgroundItems"
            variant="pill"
            color="primary"
          />
          <Tabs
            v-model="variantsActive"
            :items="playgroundItems"
            variant="segmented"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.tabs.examples.icons.title')"
        :description="t('pages.navigation.tabs.examples.icons.desc')"
        :code="iconsCode"
      >
        <Tabs
          v-model="iconsActive"
          :items="iconItems"
          variant="pill"
          color="primary"
          class="w-full max-w-md"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.tabs.examples.panels.title')"
        :description="t('pages.navigation.tabs.examples.panels.desc')"
        :code="verticalCode"
      >
        <Tabs
          v-model="verticalActive"
          :items="verticalItems"
          variant="line"
          class="w-full max-w-md"
        >
          <template #panel-account>
            <div class="p-4 text-sm">
              {{ t("pages.navigation.tabs.vertical.panelAccount") }}
            </div>
          </template>
          <template #panel-security>
            <div class="p-4 text-sm">
              {{ t("pages.navigation.tabs.vertical.panelSecurity") }}
            </div>
          </template>
          <template #panel-billing>
            <div class="p-4 text-sm">
              {{ t("pages.navigation.tabs.vertical.panelBilling") }}
            </div>
          </template>
        </Tabs>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.tabs.examples.controlled.title')"
        :description="t('pages.navigation.tabs.examples.controlled.desc')"
        :code="controlledCode"
      >
        <div class="flex flex-col items-center gap-3 w-full max-w-md">
          <Tabs
            v-model="controlledActive"
            :items="badgeItems"
            variant="segmented"
            class="w-full"
          />
          <p class="text-xs text-muted-foreground">
            {{ t("pages.navigation.tabs.controlled") }}
            <code class="font-mono text-primary">{{ controlledActive }}</code>
          </p>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.tabs.examples.badges.title')"
        :description="t('pages.navigation.tabs.examples.badges.desc')"
        :code="badgesCode"
      >
        <Tabs
          v-model="badgesActive"
          :items="badgeItems"
          variant="pill"
          color="danger"
          class="w-full max-w-md"
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
        {{ t("pages.navigation.tabs.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.navigation.tabs.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
