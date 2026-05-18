<script setup lang="ts">
import { ref, computed } from "vue";
import { AppShell, Sidebar, Topbar, Typography } from "mood-ui";
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
} from "@heroicons/vue/24/outline";
import type { PropDoc, SlotDoc } from "~/types/component-doc";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.layout.appShell.title"),
  description: () => t("pages.layout.appShell.description"),
  ogTitle: () => `${t("pages.layout.appShell.title")} · mood-ui`,
  ogDescription: () => t("pages.layout.appShell.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.appShell.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.appShell.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.appShell.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.appShell.a11y.focusNative"),
]);

const pgVariant = ref<"standard" | "rail" | "dual">("standard");
const pgAppearance = ref<"flush" | "contained">("flush");
const pgCollapsed = ref(false);
const pgTopbarSpan = ref<'full' | 'content'>('full');
const isCollapsed = ref(true);

function resetPlayground() {
  pgVariant.value = "standard";
  pgAppearance.value = "flush";
  pgCollapsed.value = false;
  pgTopbarSpan.value = 'full';
}

const active = ref<string | number>("home");
const items = computed(() => [
  { id: "home", label: t("pages.layout.appShell.menu.home"), icon: HomeIcon },
  {
    id: "inbox",
    label: t("pages.layout.appShell.menu.inbox"),
    icon: InboxIcon,
    badge: 3,
    badgeColor: "primary" as const,
  },
  { id: "team", label: t("pages.layout.appShell.menu.team"), icon: UsersIcon },
  {
    id: "reports",
    label: t("pages.layout.appShell.menu.reports"),
    icon: ChartBarIcon,
  },
  {
    id: "settings",
    label: t("pages.layout.appShell.menu.settings"),
    icon: Cog6ToothIcon,
  },
]);

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "standard")
    parts.push(`variant="${pgVariant.value}"`);
  if (pgAppearance.value !== "flush")
    parts.push(`appearance="${pgAppearance.value}"`);
  if (pgCollapsed.value) parts.push('v-model:collapsed="collapsed"');
  if (pgTopbarSpan.value !== 'full') parts.push(`topbar-span="${pgTopbarSpan.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<AppShell${attrs}>
    <template #topbar><Topbar title="App" divider /></template>
    <template #sidebar><Sidebar :items="items" v-model:active-id="active" /></template>
    <main>…</main>
</AppShell>`;
});

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AppShell, Topbar, Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
];
<\/script>

<template>
  <AppShell>
    <template #topbar><Topbar title="Modo UI" divider /></template>
    <template #sidebar>
      <Sidebar :items="items" v-model:active-id="active" />
    </template>
    <div class="p-6">…</div>
  </AppShell>
</template>`;

const railCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AppShell, Topbar, Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
];
<\/script>

<template>
  <AppShell variant="rail">
    <template #topbar><Topbar title="App" divider /></template>
    <template #rail>
      <Sidebar :items="items" :active-id="active" collapsed />
    </template>
    <div class="p-6">…</div>
  </AppShell>
</template>`;

const collapsedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { AppShell, Topbar, Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active = ref('home');
const isCollapsed = ref(true);
const items = [
  { id: 'home', label: 'Home', icon: HomeIcon },
];
<\/script>

<template>
  <AppShell v-model:collapsed="isCollapsed">
    <template #topbar><Topbar title="App" divider /></template>
    <template #sidebar="{ collapsed }">
      <Sidebar :items="items" :active-id="active" :collapsed="collapsed" />
    </template>
    <div class="p-6">…</div>
  </AppShell>
</template>`;

const noSidebarCode = `<script setup lang="ts">
import { AppShell, Topbar } from 'mood-ui';
<\/script>

<template>
  <AppShell>
    <template #topbar><Topbar title="App" divider /></template>
    <div class="p-6">…</div>
  </AppShell>
</template>`;

const topbarSpanCode = `<template>
  <AppShell topbar-span="content" v-model:collapsed="isCollapsed" style="height: 400px">
    <template #sidebar="{ collapsed, toggleCollapsed }">
      <Sidebar
        :items="items"
        v-model:active-id="active"
        :collapsed="collapsed"
        show-toggle
        @click.native="toggleCollapsed"
      />
    </template>
    <template #topbar><Topbar title="App" divider /></template>
    <div class="p-6">Main content</div>
  </AppShell>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'standard' | 'rail' | 'dual'",
    default: "'standard'",
    description: t("pages.layout.appShell.props.variant"),
  },
  {
    name: "appearance",
    type: "'flush' | 'contained'",
    default: "'flush'",
    description: t("pages.layout.appShell.props.appearance"),
  },
  {
    name: "sidebarPosition",
    type: "'left' | 'right'",
    default: "'left'",
    description: t("pages.layout.appShell.props.sidebarPosition"),
  },
  {
    name: "sidebarWidth",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.appShell.props.sidebarWidth"),
  },
  {
    name: "collapsedWidth",
    type: "'small' | 'medium'",
    default: "'small'",
    description: t("pages.layout.appShell.props.collapsedWidth"),
  },
  {
    name: "railWidth",
    type: "'small' | 'medium'",
    default: "'small'",
    description: t("pages.layout.appShell.props.railWidth"),
  },
  {
    name: "collapsed",
    type: "boolean",
    default: "false",
    description: t("pages.layout.appShell.props.collapsed"),
  },
  {
    name: "mobileOpen",
    type: "boolean",
    default: "false",
    description: t("pages.layout.appShell.props.mobileOpen"),
  },
  {
    name: "breakpoint",
    type: "'md' | 'lg' | 'xl'",
    default: "'lg'",
    description: t("pages.layout.appShell.props.breakpoint"),
  },
  {
    name: "stickyTopbar",
    type: "boolean",
    default: "false",
    description: t("pages.layout.appShell.props.stickyTopbar"),
  },
  {
    name: "stickySidebar",
    type: "boolean",
    default: "false",
    description: t("pages.layout.appShell.props.stickySidebar"),
  },
  {
    name: "divider",
    type: "boolean",
    default: "true",
    description: t("pages.layout.appShell.props.divider"),
  },
  {
    name: "mainPadding",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'none'",
    description: t("pages.layout.appShell.props.mainPadding"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "provider",
    description: t("pages.layout.appShell.props.radius"),
  },
  {
    name: "topbarSpan",
    type: "'full' | 'content'",
    default: "'full'",
    description: t("pages.layout.appShell.props.topbarSpan"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "topbar",
    bindings:
      "{ collapsed, mobileOpen, toggleSidebar, openMobile, closeMobile }",
    description: t("pages.layout.appShell.slots.topbar"),
  },
  {
    name: "sidebar",
    bindings: "{ collapsed, toggleCollapsed, isMobile, closeMobile }",
    description: t("pages.layout.appShell.slots.sidebar"),
  },
  {
    name: "sidebar-header",
    bindings: "{ collapsed }",
    description: t("pages.layout.appShell.slots.sidebarHeader"),
  },
  {
    name: "sidebar-footer",
    bindings: "{ collapsed }",
    description: t("pages.layout.appShell.slots.sidebarFooter"),
  },
  {
    name: "rail",
    bindings: "{ collapsed, toggleCollapsed }",
    description: t("pages.layout.appShell.slots.rail"),
  },
  {
    name: "rail-header",
    description: t("pages.layout.appShell.slots.railHeader"),
  },
  {
    name: "rail-footer",
    description: t("pages.layout.appShell.slots.railFooter"),
  },
  { name: "default", description: t("pages.layout.appShell.slots.default") },
  { name: "footer", description: t("pages.layout.appShell.slots.footer") },
]);

const typesCode = `export interface AppShell {
  as?: string;
  variant?: 'standard' | 'rail' | 'dual';
  appearance?: 'flush' | 'contained';
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'small' | 'medium' | 'large';
  collapsedWidth?: 'small' | 'medium';
  railWidth?: 'small' | 'medium';
  collapsed?: boolean;
  mobileOpen?: boolean;
  breakpoint?: 'md' | 'lg' | 'xl';
  stickyTopbar?: boolean;
  stickySidebar?: boolean;
  divider?: boolean;
  mainPadding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  drawerAriaLabel?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.appShell.title')"
    :category="t('pages.layout.appShell.category')"
    import-path="import { AppShell } from 'mood-ui'"
    :description="t('pages.layout.appShell.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="420px"
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
                v-for="v in ['standard', 'rail', 'dual']"
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
              >Appearance</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="a in ['flush', 'contained']"
                :key="a"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgAppearance === a
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgAppearance = a as typeof pgAppearance"
              >
                {{ a }}
              </button>
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

          <span class="w-px h-4 bg-border shrink-0" />

          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >Layout</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="s in ['full', 'content']"
                :key="s"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgTopbarSpan === s
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgTopbarSpan = s as typeof pgTopbarSpan"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </template>

        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
          style="height: 360px"
        >
          <AppShell
            :variant="pgVariant"
            :appearance="pgAppearance"
            :collapsed="pgCollapsed"
            :topbar-span="pgTopbarSpan"
            breakpoint="md"
            class="h-full"
          >
            <template #topbar>
              <Topbar
                title="Modo UI"
                :subtitle="t('pages.layout.appShell.content.subtitleDemo')"
                divider
              >
                <template #logo
                  ><div class="size-7 rounded bg-primary"
                /></template>
              </Topbar>
            </template>
            <template #sidebar="{ collapsed }">
              <Sidebar
                :items="items"
                v-model:active-id="active"
                :collapsed="collapsed"
                color="primary"
              />
            </template>
            <template #rail="{ collapsed }">
              <Sidebar
                :items="items"
                :active-id="active"
                :collapsed="collapsed || true"
                color="primary"
              />
            </template>
            <div class="p-6 text-sm text-muted-foreground">
              {{ t("pages.layout.appShell.content.main") }}
            </div>
          </AppShell>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.appShell.examples.basic.title')"
        :description="t('pages.layout.appShell.examples.basic.desc')"
        :code="basicCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
          style="height: 320px"
        >
          <AppShell breakpoint="md" class="h-full">
            <template #topbar>
              <Topbar title="Modo UI" divider>
                <template #logo
                  ><div class="size-7 rounded bg-primary"
                /></template>
              </Topbar>
            </template>
            <template #sidebar>
              <Sidebar
                :items="items"
                v-model:active-id="active"
                color="primary"
              />
            </template>
            <div class="p-6 text-sm">
              {{ t("pages.layout.appShell.content.basic") }}
            </div>
          </AppShell>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.appShell.examples.rail.title')"
        :description="t('pages.layout.appShell.examples.rail.desc')"
        :code="railCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
          style="height: 320px"
        >
          <AppShell variant="rail" breakpoint="md" class="h-full">
            <template #topbar>
              <Topbar title="App" divider>
                <template #logo
                  ><div class="size-7 rounded bg-primary"
                /></template>
              </Topbar>
            </template>
            <template #rail>
              <Sidebar
                :items="items"
                :active-id="active"
                collapsed
                color="primary"
              />
            </template>
            <div class="p-6 text-sm">
              {{ t("pages.layout.appShell.content.rail") }}
            </div>
          </AppShell>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.appShell.examples.collapsed.title')"
        :description="t('pages.layout.appShell.examples.collapsed.desc')"
        :code="collapsedCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
          style="height: 320px"
        >
          <AppShell
            v-model:collapsed="isCollapsed"
            breakpoint="md"
            class="h-full"
          >
            <template #topbar>
              <Topbar title="App" divider>
                <template #logo
                  ><div class="size-7 rounded bg-primary"
                /></template>
              </Topbar>
            </template>
            <template #sidebar="{ collapsed }">
              <Sidebar
                :items="items"
                :active-id="active"
                :collapsed="collapsed"
                color="primary"
              />
            </template>
            <div class="p-6 text-sm">
              {{ t("pages.layout.appShell.content.collapsed") }}
            </div>
          </AppShell>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.appShell.examples.noSidebar.title')"
        :description="t('pages.layout.appShell.examples.noSidebar.desc')"
        :code="noSidebarCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
          style="height: 280px"
        >
          <AppShell breakpoint="md" class="h-full">
            <template #topbar>
              <Topbar title="App" divider>
                <template #logo
                  ><div class="size-7 rounded bg-primary"
                /></template>
              </Topbar>
            </template>
            <div class="p-6 text-sm">
              {{ t("pages.layout.appShell.content.noSidebar") }}
            </div>
          </AppShell>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.appShell.examples.topbarSpan.title')"
        :description="t('pages.layout.appShell.examples.topbarSpan.desc')"
        :code="topbarSpanCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
          style="height: 320px"
        >
          <AppShell
            topbar-span="content"
            v-model:collapsed="isCollapsed"
            breakpoint="md"
            class="h-full"
          >
            <template #topbar>
              <Topbar title="App" divider>
                <template #logo
                  ><div class="size-7 rounded bg-primary"
                /></template>
              </Topbar>
            </template>
            <template #sidebar="{ collapsed }">
              <Sidebar
                :items="items"
                v-model:active-id="active"
                :collapsed="collapsed"
                show-toggle
                color="primary"
              />
            </template>
            <div class="p-6 text-sm">
              {{ t("pages.layout.appShell.content.main") }}
            </div>
          </AppShell>
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
        {{ t("pages.layout.appShell.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.appShell.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
