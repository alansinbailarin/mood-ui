<script setup lang="ts">
import { ref, computed } from "vue";
import { Sidebar, Typography, useLocalStorage } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  InboxIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.layout.sidebar.title"),
  description: () => t("pages.layout.sidebar.description"),
  ogTitle: () => `${t("pages.layout.sidebar.title")} · mood-ui`,
  ogDescription: () => t("pages.layout.sidebar.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.sidebar.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.sidebar.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.sidebar.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.sidebar.a11y.focusNative"),
]);

const pgCollapsed = useLocalStorage('docs:sidebar:collapsed', false);
const pgShowToggle = useLocalStorage('docs:sidebar:showToggle', true);
const pgVariant = ref<"tonal" | "solid" | "bar">("tonal");
const pgColor = ref<"default" | "primary" | "danger" | "success" | "warning">(
  "primary",
);

function resetPlayground() {
  pgCollapsed.value = false;
  pgShowToggle.value = true;
  pgVariant.value = "tonal";
  pgColor.value = "primary";
}

const active = ref<string | number>("home");
const items = computed(() => [
  { id: "home", label: t("pages.layout.sidebar.menu.home"), icon: HomeIcon },
  {
    id: "inbox",
    label: t("pages.layout.sidebar.menu.inbox"),
    icon: InboxIcon,
    badge: 4,
    badgeColor: "primary" as const,
  },
  { id: "team", label: t("pages.layout.sidebar.menu.team"), icon: UsersIcon },
  {
    id: "reports",
    label: t("pages.layout.sidebar.menu.reports"),
    icon: ChartBarIcon,
  },
]);

const sectionsData = computed(() => [
  {
    id: "main",
    title: t("pages.layout.sidebar.sections.main"),
    items: [
      {
        id: "home",
        label: t("pages.layout.sidebar.menu.home"),
        icon: HomeIcon,
      },
      {
        id: "inbox",
        label: t("pages.layout.sidebar.menu.inbox"),
        icon: InboxIcon,
        badge: 4,
        badgeColor: "primary" as const,
      },
      {
        id: "team",
        label: t("pages.layout.sidebar.menu.team"),
        icon: UsersIcon,
      },
    ],
  },
  {
    id: "cfg",
    title: t("pages.layout.sidebar.sections.config"),
    items: [
      {
        id: "reports",
        label: t("pages.layout.sidebar.menu.reports"),
        icon: ChartBarIcon,
      },
      {
        id: "settings",
        label: t("pages.layout.sidebar.menu.settings"),
        icon: Cog6ToothIcon,
      },
    ],
  },
]);

const colorDots = [
  { value: "default" as const, bg: "#64748b", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "#22c55e", label: "Success" },
  { value: "danger" as const, bg: "#ef4444", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgShowToggle.value) parts.push('show-toggle');
  if (pgCollapsed.value) parts.push('v-model:collapsed="collapsed"');
  if (pgVariant.value !== "tonal")
    parts.push(`active-variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<script setup>
import { useLocalStorage, Sidebar } from 'mood-ui';

const collapsed = useLocalStorage('app:sidebar:collapsed', false);
<\/script>

<template>
  <Sidebar
    :items="items"
    v-model:active-id="active"${attrs}
  />
</template>`;
});

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
];
<\/script>

<template>
  <Sidebar
    :items="items"
    v-model:active-id="active"
    color="primary"
  />
</template>`;

const collapsedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
];
<\/script>

<template>
  <Sidebar :items="items" :active-id="active" collapsed />
</template>`;

const sectionsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Sidebar } from 'mood-ui';
import { HomeIcon, ChartBarIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const sections = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', icon: HomeIcon },
    ],
  },
  {
    id: 'cfg',
    title: 'Config',
    items: [
      { id: 'reports', label: 'Reports', icon: ChartBarIcon },
    ],
  },
];
<\/script>

<template>
  <Sidebar
    :sections="sections"
    v-model:active-id="active"
    color="primary"
  />
</template>`;

const footerCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Sidebar } from 'mood-ui';
import { HomeIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const sections = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'home', label: 'Home', icon: HomeIcon },
    ],
  },
];
<\/script>

<template>
  <Sidebar :sections="sections" v-model:active-id="active">
    <template #footer="{ collapsed }">
      <button class="…">
        <ArrowRightOnRectangleIcon />
        <span v-if="!collapsed">Log out</span>
      </button>
    </template>
  </Sidebar>
</template>`;

const toggleCode = `<script setup lang="ts">
import { ref } from 'vue';
import { useLocalStorage, Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const collapsed = useLocalStorage('app:sidebar:collapsed', false);
const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
];
<\/script>

<template>
  <Sidebar
    :items="items"
    v-model:active-id="active"
    show-toggle
    v-model:collapsed="collapsed"
  />
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "sections",
    type: "SidebarSection[]",
    description: t("pages.layout.sidebar.props.sections"),
  },
  {
    name: "items",
    type: "SidebarItem[]",
    description: t("pages.layout.sidebar.props.items"),
  },
  {
    name: "activeId",
    type: "string | number | null",
    description: t("pages.layout.sidebar.props.activeId"),
  },
  {
    name: "collapsed",
    type: "boolean",
    default: "false",
    description: t("pages.layout.sidebar.props.collapsed"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.sidebar.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "provider",
    description: t("pages.layout.sidebar.props.radius"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.layout.sidebar.props.color"),
  },
  {
    name: "activeVariant",
    type: "'tonal' | 'solid' | 'bar'",
    default: "'tonal'",
    description: t("pages.layout.sidebar.props.activeVariant"),
  },
  {
    name: "barSide",
    type: "'start' | 'end'",
    default: "'start'",
    description: t("pages.layout.sidebar.props.barSide"),
  },
  {
    name: "padding",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.sidebar.props.padding"),
  },
  {
    name: "dividers",
    type: "boolean",
    default: "true",
    description: t("pages.layout.sidebar.props.dividers"),
  },
  {
    name: "showToggle",
    type: "boolean",
    default: "false",
    description: t("pages.layout.sidebar.props.showToggle"),
  },
  {
    name: "toggleSide",
    type: "'start' | 'end'",
    default: "'end'",
    description: t("pages.layout.sidebar.props.toggleSide"),
  },
  {
    name: "ariaLabel",
    type: "string",
    default: "'Sidebar'",
    description: t("pages.layout.sidebar.props.ariaLabel"),
  },
  {
    name: "as",
    type: "string",
    default: "'nav'",
    description: t("pages.layout.sidebar.props.as"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "select",
    payload: "SidebarItem",
    description: t("pages.layout.sidebar.emits.select"),
  },
  {
    name: "update:activeId",
    payload: "string | number | null",
    description: t("pages.layout.sidebar.emits.updateActiveId"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "header",
    bindings: "{ collapsed }",
    description: t("pages.layout.sidebar.slots.header"),
  },
  {
    name: "footer",
    bindings: "{ collapsed }",
    description: t("pages.layout.sidebar.slots.footer"),
  },
]);

const typesCode = `export interface SidebarItem {
  id: string | number;
  label: string;
  icon?: Component;
  href?: string;
  to?: string | Record<string, unknown>;
  external?: boolean;
  badge?: string | number;
  badgeColor?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  danger?: boolean;
  children?: SidebarItem[];
  defaultExpanded?: boolean;
  meta?: Record<string, unknown>;
}

export interface SidebarSection {
  id: string | number;
  title?: string;
  items: SidebarItem[];
}

export interface Sidebar {
  as?: string;
  sections?: SidebarSection[];
  items?: SidebarItem[];
  activeId?: string | number | null;
  collapsed?: boolean;
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  activeVariant?: 'tonal' | 'solid' | 'bar';
  barSide?: 'start' | 'end';
  ariaLabel?: string;
  expandAriaLabel?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  dividers?: boolean;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.sidebar.title')"
    :category="t('pages.layout.sidebar.category')"
    import-path="import { Sidebar } from 'mood-ui'"
    :description="t('pages.layout.sidebar.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="380px"
        @reset="resetPlayground"
      >
        <template #controls>
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >Variant</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="v in ['tonal', 'solid', 'bar']"
                :key="v"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgVariant === v
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgVariant = v as typeof pgVariant"
              >
                {{ v }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >Color</span
            >
            <div class="flex items-center gap-1">
              <button
                v-for="c in colorDots"
                :key="c.value"
                type="button"
                class="size-4 rounded-full transition-all duration-150"
                :class="
                  pgColor === c.value
                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                    : 'hover:scale-110 opacity-70 hover:opacity-100'
                "
                :style="`background: ${c.bg}`"
                :title="c.label"
                @click="pgColor = c.value"
              />
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgCollapsed
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgCollapsed = !pgCollapsed"
          >
            Collapsed
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowToggle
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowToggle = !pgShowToggle"
          >
            Toggle Button
          </button>
        </template>

        <div
          class="border border-border rounded-md overflow-visible bg-card transition-[width] duration-200"
          :class="pgCollapsed ? 'w-16' : 'w-64'"
          style="height: 320px"
        >
          <Sidebar
            :sections="sectionsData"
            v-model:active-id="active"
            :show-toggle="pgShowToggle"
            v-model:collapsed="pgCollapsed"
            :active-variant="pgVariant"
            :color="pgColor"
          />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.sidebar.examples.basic.title')"
        :description="t('pages.layout.sidebar.examples.basic.desc')"
        :code="basicCode"
      >
        <div
          class="w-64 h-80 border border-border rounded-md overflow-hidden bg-card"
        >
          <Sidebar :items="items" v-model:active-id="active" color="primary" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.sidebar.examples.collapsed.title')"
        :description="t('pages.layout.sidebar.examples.collapsed.desc')"
        :code="collapsedCode"
      >
        <div
          class="w-16 h-80 border border-border rounded-md overflow-hidden bg-card"
        >
          <Sidebar :items="items" :active-id="active" collapsed />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.sidebar.examples.sections.title')"
        :description="t('pages.layout.sidebar.examples.sections.desc')"
        :code="sectionsCode"
      >
        <div
          class="w-64 h-80 border border-border rounded-md overflow-hidden bg-card"
        >
          <Sidebar
            :sections="sectionsData"
            v-model:active-id="active"
            color="primary"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.sidebar.examples.footer.title')"
        :description="t('pages.layout.sidebar.examples.footer.desc')"
        :code="footerCode"
      >
        <div
          class="w-64 h-80 border border-border rounded-md overflow-hidden bg-card"
        >
          <Sidebar
            :sections="sectionsData"
            v-model:active-id="active"
            color="primary"
          >
            <template #footer="{ collapsed }">
              <button
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                <ArrowRightOnRectangleIcon class="size-4 shrink-0" />
                <span v-if="!collapsed">{{
                  t("pages.layout.sidebar.logout")
                }}</span>
              </button>
            </template>
          </Sidebar>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.sidebar.examples.toggle.title')"
        :description="t('pages.layout.sidebar.examples.toggle.desc')"
        :code="toggleCode"
      >
        <div
          class="border border-border rounded-md overflow-visible bg-card transition-[width] duration-200"
          :class="pgCollapsed ? 'w-16' : 'w-64'"
          style="height: 320px"
        >
          <Sidebar
            :sections="sectionsData"
            v-model:active-id="active"
            show-toggle
            v-model:collapsed="pgCollapsed"
            color="primary"
          />
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
        {{ t("pages.layout.sidebar.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.sidebar.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
