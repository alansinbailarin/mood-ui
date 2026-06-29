<script setup lang="ts">
import { ref, computed } from "vue";
import { Input, Switch, Badge, Button, Sidebar, Typography, useLocalStorage } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yAriaRow } from "~/components/A11yDoc.vue";
import type { PropDoc } from "~/types/component-doc";
import {
  HomeIcon,
  InboxIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

// ── Live demo state ─────────────────────────────────────────────────────────
const name       = useLocalStorage("docs:demo-name", "mood-ui");
const prefs      = useLocalStorage("docs:demo-prefs", { notifications: true, compact: false, autoSave: true });
const collapsed  = useLocalStorage("docs:demo-sidebar-collapsed", false);

const active = ref<string | number>("home");
const items = computed(() => [
  { id: "home",     label: "Home",     icon: HomeIcon },
  { id: "inbox",    label: "Inbox",    icon: InboxIcon, badge: 4, badgeColor: "primary" as const },
  { id: "team",     label: "Team",     icon: UsersIcon },
  { id: "reports",  label: "Reports",  icon: ChartBarIcon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
]);

// ── A11y ────────────────────────────────────────────────────────────────────
const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "SSR-safe",
    value: "try/catch",
    desc: t("pages.composables.useLocalStorage.a11y.ssr"),
  },
]);

// ── Code snippets ────────────────────────────────────────────────────────────
const overviewCode = computed(
  () => `<script setup lang="ts">
import { useLocalStorage } from 'mood-ui';

const name = useLocalStorage('my-app:name', 'mood-ui');
<\/script>

<template>
  <Input v-model="name" placeholder="Enter a name…" />
  <p>Stored: {{ name }}</p>
</template>`,
);

const stringCode = `<script setup lang="ts">
import { useLocalStorage } from 'mood-ui';

// Reads stored value on mount; writes back on every change.
// Falls back to default on parse errors or missing key.
const username = useLocalStorage('app:username', '');
<\/script>

<template>
  <Input v-model="username" label="Username" placeholder="Your name…" />
</template>`;

const objectCode = `<script setup lang="ts">
import { useLocalStorage } from 'mood-ui';

// Deep-watches objects — any nested mutation is persisted automatically.
const prefs = useLocalStorage('app:prefs', {
  notifications: true,
  compact: false,
  autoSave: true,
});
<\/script>

<template>
  <Switch v-model="prefs.notifications" label="Notifications" />
  <Switch v-model="prefs.compact"       label="Compact mode" />
  <Switch v-model="prefs.autoSave"      label="Auto-save" />
</template>`;

const sidebarCode = `<script setup lang="ts">
import { ref } from 'vue';
import { useLocalStorage, Sidebar } from 'mood-ui';
import { HomeIcon } from '@heroicons/vue/24/outline';

const active    = ref('home');
const collapsed = useLocalStorage('app:sidebar:collapsed', false);
const items     = [{ id: 'home', label: 'Home', icon: HomeIcon }];
<\/script>

<template>
  <div :class="collapsed ? 'w-16' : 'w-64'" class="h-80 border border-border rounded-md overflow-visible bg-card transition-[width] duration-200">
    <Sidebar
      :items="items"
      v-model:active-id="active"
      v-model:collapsed="collapsed"
      show-toggle
      color="primary"
    />
  </div>
</template>`;

const typesCode = `function useLocalStorage<T>(key: string, defaultValue: T): Ref<T>`;

// ── API docs ─────────────────────────────────────────────────────────────────
const apiList = computed<PropDoc[]>(() => [
  {
    name: "key",
    type: "string",
    description: t("pages.composables.useLocalStorage.api.key"),
  },
  {
    name: "defaultValue",
    type: "T",
    description: t("pages.composables.useLocalStorage.api.defaultValue"),
  },
  {
    name: "→ returns",
    type: "Ref<T>",
    description: t("pages.composables.useLocalStorage.api.returns"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useLocalStorage.title')"
    category="Composables"
    import-path="import { useLocalStorage } from 'mood-ui'"
    :description="t('pages.composables.useLocalStorage.description')"
    :props-list="apiList"
  >
    <!-- ── OVERVIEW ────────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="160px" lang="ts">
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <Input
            v-model="name"
            :label="t('pages.composables.useLocalStorage.overview.label')"
            placeholder="Type something…"
          />
          <div class="flex items-center gap-2">
            <Badge color="default" variant="soft">
              {{ t('pages.composables.useLocalStorage.overview.stored') }}: {{ name }}
            </Badge>
            <Button size="small" variant="ghost" @click="name = 'mood-ui'">
              {{ t('pages.composables.useLocalStorage.overview.reset') }}
            </Button>
          </div>
        </div>
      </ComponentPreview>
    </template>

    <!-- ── EXAMPLES ────────────────────────────────────────────────────────── -->
    <template #examples>
      <!-- String -->
      <ComponentPreview
        :title="t('pages.composables.useLocalStorage.examples.string.title')"
        :description="t('pages.composables.useLocalStorage.examples.string.desc')"
        :code="stringCode"
        min-height="160px"
        lang="ts"
      >
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <Input
            v-model="name"
            :label="t('pages.composables.useLocalStorage.examples.string.label')"
            placeholder="Your name…"
          />
          <div class="flex gap-2">
            <Button size="small" variant="outline" @click="name = 'Alice'">Alice</Button>
            <Button size="small" variant="outline" @click="name = 'Bob'">Bob</Button>
            <Button size="small" variant="ghost"   @click="name = 'mood-ui'">Reset</Button>
          </div>
        </div>
      </ComponentPreview>

      <!-- Object -->
      <ComponentPreview
        :title="t('pages.composables.useLocalStorage.examples.object.title')"
        :description="t('pages.composables.useLocalStorage.examples.object.desc')"
        :code="objectCode"
        min-height="200px"
        lang="ts"
      >
        <div class="flex flex-col gap-3 w-full max-w-xs">
          <Switch
            v-model="prefs.notifications"
            :label="t('pages.composables.useLocalStorage.examples.object.notifications')"
            color="primary"
          />
          <Switch
            v-model="prefs.compact"
            :label="t('pages.composables.useLocalStorage.examples.object.compact')"
            color="primary"
          />
          <Switch
            v-model="prefs.autoSave"
            :label="t('pages.composables.useLocalStorage.examples.object.autoSave')"
            color="primary"
          />
          <Button
            size="small"
            variant="ghost"
            class="self-start"
            @click="prefs = { notifications: true, compact: false, autoSave: true }"
          >
            Reset
          </Button>
        </div>
      </ComponentPreview>

      <!-- Sidebar collapsed -->
      <ComponentPreview
        :title="t('pages.composables.useLocalStorage.examples.sidebar.title')"
        :description="t('pages.composables.useLocalStorage.examples.sidebar.desc')"
        :code="sidebarCode"
        min-height="340px"
        lang="ts"
      >
        <div
          class="border border-border rounded-md overflow-visible bg-card transition-[width] duration-200"
          :class="collapsed ? 'w-16' : 'w-64'"
          style="height: 300px"
        >
          <Sidebar
            :items="items"
            v-model:active-id="active"
            v-model:collapsed="collapsed"
            show-toggle
            color="primary"
          />
        </div>
      </ComponentPreview>
    </template>

    <!-- ── EXTRA: Types ────────────────────────────────────────────────────── -->
    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useLocalStorage.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useLocalStorage.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
