<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Topbar from "../../../components/layout/Topbar.vue";
import Button from "../../../components/forms/Button.vue";
import SearchInput from "../../../components/forms/SearchInput.vue";
import Avatar from "../../../components/data-display/avatar/Avatar.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";
import { BellIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.topbar.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.topbar.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.topbar.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.topbar.a11y.focusNative"),
]);

const pgSize = ref<"small" | "medium" | "large">("medium");
const pgDivider = ref(true);
const pgMenuToggle = ref(false);

function resetPlayground() {
  pgSize.value = "medium";
  pgDivider.value = true;
  pgMenuToggle.value = false;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgDivider.value) parts.push("divider");
  if (pgMenuToggle.value) parts.push("menu-toggle");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Topbar${attrs} title="Modo UI" subtitle="${t("pages.layout.topbar.demo.subtitle")}">
    <template #logo><div class="size-8 rounded bg-primary" /></template>
    <template #actions>…</template>
    <template #user>…</template>
</Topbar>`;
});

const basicCode = `<script setup lang="ts">
import { Topbar } from 'mood-ui';
<\/script>

<template>
  <Topbar title="Modo UI" divider>
    <template #logo>
      <div class="size-8 rounded bg-primary" />
    </template>
  </Topbar>
</template>`;

const searchCode = `<script setup lang="ts">
import { Topbar, SearchInput, Avatar } from 'mood-ui';
<\/script>

<template>
  <Topbar title="App" divider>
    <template #logo><div class="size-8 rounded bg-primary" /></template>
    <template #search>
      <SearchInput placeholder="Search…" full-width />
    </template>
    <template #user>
      <Avatar name="Jane Doe" size="small" />
    </template>
  </Topbar>
</template>`;

const actionsCode = `<script setup lang="ts">
import { Topbar, Avatar } from 'mood-ui';
<\/script>

<template>
  <Topbar title="Dashboard" divider>
    <template #logo><div class="size-8 rounded bg-primary" /></template>
    <template #actions>…</template>
    <template #user><Avatar name="Jane Doe" size="small" /></template>
  </Topbar>
</template>`;

const transparentCode = `<script setup lang="ts">
import { Topbar } from 'mood-ui';
<\/script>

<template>
  <Topbar title="Hero" :divider="false">
    <template #logo><div class="size-8 rounded bg-primary" /></template>
  </Topbar>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "title",
    type: "string",
    description: t("pages.layout.topbar.props.title"),
  },
  {
    name: "subtitle",
    type: "string",
    description: t("pages.layout.topbar.props.subtitle"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.topbar.props.size"),
  },
  {
    name: "divider",
    type: "boolean",
    default: "false",
    description: t("pages.layout.topbar.props.divider"),
  },
  {
    name: "sticky",
    type: "boolean",
    default: "false",
    description: t("pages.layout.topbar.props.sticky"),
  },
  {
    name: "padding",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.topbar.props.padding"),
  },
  {
    name: "menuToggle",
    type: "boolean",
    default: "false",
    description: t("pages.layout.topbar.props.menuToggle"),
  },
  {
    name: "menuIcon",
    type: "Component",
    description: t("pages.layout.topbar.props.menuIcon"),
  },
  {
    name: "menuAriaLabel",
    type: "string",
    description: t("pages.layout.topbar.props.menuAriaLabel"),
  },
  {
    name: "as",
    type: "string",
    default: "'header'",
    description: t("pages.layout.topbar.props.as"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "menu-toggle",
    payload: "MouseEvent",
    description: t("pages.layout.topbar.emits.menuToggle"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "logo", description: t("pages.layout.topbar.slots.logo") },
  { name: "nav", description: t("pages.layout.topbar.slots.nav") },
  { name: "search", description: t("pages.layout.topbar.slots.search") },
  { name: "actions", description: t("pages.layout.topbar.slots.actions") },
  { name: "user", description: t("pages.layout.topbar.slots.user") },
  { name: "default", description: t("pages.layout.topbar.slots.default") },
]);

const typesCode = `export interface Topbar {
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  divider?: boolean;
  sticky?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  as?: string;
  menuToggle?: boolean;
  menuIcon?: Component;
  menuAriaLabel?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.topbar.title')"
    :category="t('pages.layout.topbar.category')"
    import-path="import { Topbar } from 'mood-ui'"
    :description="t('pages.layout.topbar.description')"
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
            label="Size"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle label="Divider" v-model="pgDivider" />
          <TbToggle label="Menu" v-model="pgMenuToggle" />
        </template>

        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <Topbar
            :size="pgSize"
            :divider="pgDivider"
            :menu-toggle="pgMenuToggle"
            title="Modo UI"
            :subtitle="t('pages.layout.topbar.demo.subtitle')"
          >
            <template #logo><div class="size-8 rounded bg-primary" /></template>
            <template #actions>
              <div class="relative">
                <Button
                  variant="ghost"
                  size="small"
                  :icon="BellIcon"
                  :aria-label="t('pages.layout.topbar.demo.notifs')"
                />
                <span
                  class="absolute top-1 right-1 size-2 rounded-full bg-destructive ring-2 ring-card"
                />
              </div>
              <Button
                variant="ghost"
                size="small"
                :icon="Cog6ToothIcon"
                :aria-label="t('pages.layout.topbar.demo.settings')"
              />
            </template>
            <template #user>
              <Avatar :name="t('pages.layout.topbar.demo.user')" size="small" />
            </template>
          </Topbar>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.topbar.examples.basic.title')"
        :description="t('pages.layout.topbar.examples.basic.desc')"
        :code="basicCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <Topbar title="Modo UI" divider>
            <template #logo><div class="size-8 rounded bg-primary" /></template>
          </Topbar>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.topbar.examples.search.title')"
        :description="t('pages.layout.topbar.examples.search.desc')"
        :code="searchCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <Topbar title="App" divider>
            <template #logo><div class="size-8 rounded bg-primary" /></template>
            <template #search>
              <SearchInput
                :placeholder="t('pages.layout.topbar.demo.searchPh')"
                full-width
              />
            </template>
            <template #user>
              <Avatar :name="t('pages.layout.topbar.demo.user')" size="small" />
            </template>
          </Topbar>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.topbar.examples.actions.title')"
        :description="t('pages.layout.topbar.examples.actions.desc')"
        :code="actionsCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <Topbar title="Dashboard" divider>
            <template #logo><div class="size-8 rounded bg-primary" /></template>
            <template #actions>
              <div class="relative">
                <Button
                  variant="ghost"
                  size="small"
                  :icon="BellIcon"
                  :aria-label="t('pages.layout.topbar.demo.notifs')"
                />
                <span
                  class="absolute top-1 right-1 size-2 rounded-full bg-destructive ring-2 ring-card"
                />
              </div>
              <Button
                variant="ghost"
                size="small"
                :icon="Cog6ToothIcon"
                :aria-label="t('pages.layout.topbar.demo.settings')"
              />
            </template>
            <template #user>
              <Avatar :name="t('pages.layout.topbar.demo.user')" size="small" />
            </template>
          </Topbar>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.topbar.examples.transparent.title')"
        :description="t('pages.layout.topbar.examples.transparent.desc')"
        :code="transparentCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <Topbar title="Hero" :divider="false">
            <template #logo><div class="size-8 rounded bg-primary" /></template>
          </Topbar>
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
        {{ t("pages.layout.topbar.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.topbar.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
