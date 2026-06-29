<script setup lang="ts">
import { ref, computed } from "vue";
import { Breadcrumbs, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import { HomeIcon, FolderIcon, DocumentIcon } from "@heroicons/vue/24/outline";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.navigation.breadcrumbs.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.navigation.breadcrumbs.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.navigation.breadcrumbs.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.navigation.breadcrumbs.a11y.focusNative"),
]);

const pgSeparator = ref<"chevron" | "slash" | "dot" | "arrow">("chevron");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgShowHomeIcon = ref(false);

function resetPlayground() {
  pgSeparator.value = "chevron";
  pgSize.value = "medium";
  pgShowHomeIcon.value = false;
}

const playgroundItems = computed(() => [
  { label: t("pages.navigation.breadcrumbs.items.home"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.projects"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.modo"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.breadcrumbs") },
]);

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSeparator.value !== "chevron")
    parts.push(`separator="${pgSeparator.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgShowHomeIcon.value) parts.push("show-home-icon");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Breadcrumbs :items="items"${attrs} />`;
});

const basicItems = computed(() => [
  { label: t("pages.navigation.breadcrumbs.items.home"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.products"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.detail") },
]);

const iconItems = computed(() => [
  {
    label: t("pages.navigation.breadcrumbs.items.home"),
    href: "#",
    icon: HomeIcon,
  },
  {
    label: t("pages.navigation.breadcrumbs.items.documents"),
    href: "#",
    icon: FolderIcon,
  },
  { label: t("pages.navigation.breadcrumbs.items.report"), icon: DocumentIcon },
]);

const longItems = computed(() => [
  { label: t("pages.navigation.breadcrumbs.items.home"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.spaces"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.team"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.projects"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.modo"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.components"), href: "#" },
  { label: t("pages.navigation.breadcrumbs.items.navigation") },
]);

const basicCode = `<script setup lang="ts">
import { Breadcrumbs } from 'mood-ui';

const items = [
  { label: 'Home',     href: '#' },
  { label: 'Products', href: '#' },
  { label: 'Detail' },
];
<\/script>

<template>
  <Breadcrumbs :items="items" />
</template>`;

const iconsCode = `<script setup lang="ts">
import { Breadcrumbs } from 'mood-ui';
import { HomeIcon, FolderIcon, DocumentIcon } from '@heroicons/vue/24/outline';

const items = [
  { label: 'Home',      href: '#', icon: HomeIcon },
  { label: 'Documents', href: '#', icon: FolderIcon },
  { label: 'Report',    icon: DocumentIcon },
];
<\/script>

<template>
  <Breadcrumbs :items="items" />
</template>`;

const homeCode = `<script setup lang="ts">
import { Breadcrumbs } from 'mood-ui';

const items = [
  { label: 'Home',     href: '#' },
  { label: 'Products', href: '#' },
  { label: 'Detail' },
];
<\/script>

<template>
  <Breadcrumbs :items="items" show-home-icon />
</template>`;

const customSepCode = `<script setup lang="ts">
import { Breadcrumbs } from 'mood-ui';

const items = [
  { label: 'Home',     href: '#' },
  { label: 'Products', href: '#' },
  { label: 'Detail' },
];
<\/script>

<template>
  <Breadcrumbs :items="items" separator="slash" />
  <Breadcrumbs :items="items" separator="dot" />
  <Breadcrumbs :items="items" separator="arrow" />
  <Breadcrumbs :items="items" separator-text="›" />
</template>`;

const truncatedCode = `<script setup lang="ts">
import { Breadcrumbs } from 'mood-ui';

const longItems = [
  { label: 'Home',       href: '#' },
  { label: 'Spaces',     href: '#' },
  { label: 'Team',       href: '#' },
  { label: 'Projects',   href: '#' },
  { label: 'Mood UI',    href: '#' },
  { label: 'Components', href: '#' },
  { label: 'Navigation' },
];
<\/script>

<template>
  <Breadcrumbs :items="longItems" :max="4" />
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "items",
    type: "BreadcrumbItem[]",
    required: true,
    description: t("pages.navigation.breadcrumbs.props.items"),
  },
  {
    name: "max",
    type: "number",
    default: "0",
    description: t("pages.navigation.breadcrumbs.props.max"),
  },
  {
    name: "separator",
    type: "'chevron' | 'slash' | 'dot' | 'arrow'",
    default: "'chevron'",
    description: t("pages.navigation.breadcrumbs.props.separator"),
  },
  {
    name: "separatorText",
    type: "string",
    description: t("pages.navigation.breadcrumbs.props.separatorText"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.navigation.breadcrumbs.props.size"),
  },
  {
    name: "showHomeIcon",
    type: "boolean",
    default: "false",
    description: t("pages.navigation.breadcrumbs.props.showHomeIcon"),
  },
  {
    name: "ariaLabel",
    type: "string",
    default: "'Breadcrumb'",
    description: t("pages.navigation.breadcrumbs.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "navigate",
    payload: "(item: BreadcrumbItem, index: number)",
    description: t("pages.navigation.breadcrumbs.emits.navigate"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.navigation.breadcrumbs.slots.default"),
  },
]);

const typesCode = `export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  to?: string | Record<string, unknown>;
  external?: boolean;
  disabled?: boolean;
  icon?: Component;
}

export interface Breadcrumbs {
  items?: BreadcrumbItem[];
  max?: number;
  separator?: 'slash' | 'chevron' | 'arrow' | 'bullet' | 'none';
  separatorIcon?: Component;
  size?: 'small' | 'medium' | 'large';
  ariaLabel?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.navigation.breadcrumbs.title')"
    :category="t('pages.navigation.breadcrumbs.category')"
    import-path="import { Breadcrumbs } from 'mood-ui'"
    :description="t('pages.navigation.breadcrumbs.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="160px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Separator"
            :options="[
              { value: 'chevron' },
              { value: 'slash' },
              { value: 'dot' },
              { value: 'arrow' },
            ]"
            v-model="pgSeparator"
          />
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
          <TbToggle label="Home icon" v-model="pgShowHomeIcon" />
        </template>

        <Breadcrumbs
          :items="playgroundItems"
          :separator="pgSeparator"
          :size="pgSize"
          :show-home-icon="pgShowHomeIcon"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.navigation.breadcrumbs.examples.basic.title')"
        :description="t('pages.navigation.breadcrumbs.examples.basic.desc')"
        :code="basicCode"
      >
        <Breadcrumbs :items="basicItems" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.breadcrumbs.examples.icons.title')"
        :description="t('pages.navigation.breadcrumbs.examples.icons.desc')"
        :code="iconsCode"
      >
        <Breadcrumbs :items="iconItems" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.breadcrumbs.examples.homeIcon.title')"
        :description="t('pages.navigation.breadcrumbs.examples.homeIcon.desc')"
        :code="homeCode"
      >
        <Breadcrumbs :items="basicItems" show-home-icon />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.breadcrumbs.examples.separators.title')"
        :description="
          t('pages.navigation.breadcrumbs.examples.separators.desc')
        "
        :code="customSepCode"
      >
        <div class="flex flex-col gap-3 w-full">
          <Breadcrumbs :items="basicItems" separator="slash" />
          <Breadcrumbs :items="basicItems" separator="dot" />
          <Breadcrumbs :items="basicItems" separator="arrow" />
          <Breadcrumbs :items="basicItems" separator-text="›" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.breadcrumbs.examples.truncated.title')"
        :description="t('pages.navigation.breadcrumbs.examples.truncated.desc')"
        :code="truncatedCode"
      >
        <Breadcrumbs :items="longItems" :max="4" />
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
        {{ t("pages.navigation.breadcrumbs.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.navigation.breadcrumbs.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
