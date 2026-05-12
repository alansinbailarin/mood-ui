<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import PageHeader from "../../../components/layout/PageHeader.vue";
import Button from "../../../components/forms/Button.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.pageHeader.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.pageHeader.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.pageHeader.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.pageHeader.a11y.focusNative"),
]);

const pgSize = ref<"small" | "medium" | "large">("medium");
const pgWithActions = ref(true);
const pgDivider = ref(true);
const pgBackButton = ref(false);
const pgPadding = ref<"none" | "small" | "medium" | "large">("medium");

function resetPlayground() {
  pgSize.value = "medium";
  pgWithActions.value = true;
  pgDivider.value = true;
  pgBackButton.value = false;
  pgPadding.value = "medium";
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgDivider.value) parts.push("divider");
  if (pgBackButton.value) parts.push("back-button");
  if (pgPadding.value !== "medium") parts.push(`padding="${pgPadding.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  const actions = pgWithActions.value
    ? `\n    <template #actions>\n        <Button variant="outline" size="small">${t("pages.layout.pageHeader.demo.filters")}</Button>\n        <Button color="primary" size="small">${t("pages.layout.pageHeader.demo.new")}</Button>\n    </template>\n`
    : "";
  return `<PageHeader${attrs} title="${t("pages.layout.pageHeader.demo.title")}" subtitle="${t("pages.layout.pageHeader.demo.subtitle")}">${actions}</PageHeader>`;
});

const basicCode = `<script setup lang="ts">
import { PageHeader } from 'mood-ui';
<\/script>

<template>
  <PageHeader
    title="Dashboard"
    subtitle="Overview of your project"
    divider
  />
</template>`;

const breadcrumbsCode = `<script setup lang="ts">
import { PageHeader } from 'mood-ui';
<\/script>

<template>
  <PageHeader title="Edit user" divider>
    <template #breadcrumbs>
      <nav class="text-xs text-muted-foreground">
        Users <span class="text-foreground">Edit</span>
      </nav>
    </template>
  </PageHeader>
</template>`;

const tabsCode = `<script setup lang="ts">
import { PageHeader } from 'mood-ui';
<\/script>

<template>
  <PageHeader title="Reports" divider>
    <template #tabs>
      <div class="flex gap-4 -mb-px">
        <button>Summary</button>
        <button>Detail</button>
        <button>Audit</button>
      </div>
    </template>
  </PageHeader>
</template>`;

const actionsCode = `<script setup lang="ts">
import { PageHeader, Button } from 'mood-ui';
<\/script>

<template>
  <PageHeader back-button title="User detail" subtitle="Back to list">
    <template #actions>
      <Button variant="outline" size="small">Cancel</Button>
      <Button color="primary" size="small">Save</Button>
    </template>
  </PageHeader>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "title",
    type: "string",
    description: t("pages.layout.pageHeader.props.title"),
  },
  {
    name: "subtitle",
    type: "string",
    description: t("pages.layout.pageHeader.props.subtitle"),
  },
  {
    name: "backButton",
    type: "boolean",
    default: "false",
    description: t("pages.layout.pageHeader.props.backButton"),
  },
  {
    name: "backIcon",
    type: "Component",
    description: t("pages.layout.pageHeader.props.backIcon"),
  },
  {
    name: "backAriaLabel",
    type: "string",
    description: t("pages.layout.pageHeader.props.backAriaLabel"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.pageHeader.props.size"),
  },
  {
    name: "divider",
    type: "boolean",
    default: "false",
    description: t("pages.layout.pageHeader.props.divider"),
  },
  {
    name: "sticky",
    type: "boolean",
    default: "false",
    description: t("pages.layout.pageHeader.props.sticky"),
  },
  {
    name: "padding",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.layout.pageHeader.props.padding"),
  },
  {
    name: "as",
    type: "string",
    default: "'header'",
    description: t("pages.layout.pageHeader.props.as"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "back",
    payload: "MouseEvent",
    description: t("pages.layout.pageHeader.emits.back"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "breadcrumbs",
    description: t("pages.layout.pageHeader.slots.breadcrumbs"),
  },
  { name: "title", description: t("pages.layout.pageHeader.slots.title") },
  {
    name: "subtitle",
    description: t("pages.layout.pageHeader.slots.subtitle"),
  },
  { name: "actions", description: t("pages.layout.pageHeader.slots.actions") },
  { name: "hero", description: t("pages.layout.pageHeader.slots.hero") },
  { name: "tabs", description: t("pages.layout.pageHeader.slots.tabs") },
]);

const typesCode = `export interface PageHeader {
  title?: string;
  subtitle?: string;
  backButton?: boolean;
  backIcon?: Component;
  backAriaLabel?: string;
  size?: 'small' | 'medium' | 'large';
  divider?: boolean;
  sticky?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  as?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.pageHeader.title')"
    :category="t('pages.layout.pageHeader.category')"
    import-path="import { PageHeader } from 'mood-ui'"
    :description="t('pages.layout.pageHeader.description')"
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
          <TbPills
            label="Padding"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgPadding"
          />
          <TbSep />
          <TbToggle label="Back" v-model="pgBackButton" />
          <TbToggle label="Actions" v-model="pgWithActions" />
          <TbToggle label="Divider" v-model="pgDivider" />
        </template>

        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <PageHeader
            :size="pgSize"
            :divider="pgDivider"
            :back-button="pgBackButton"
            :padding="pgPadding"
            :title="t('pages.layout.pageHeader.demo.title')"
            :subtitle="t('pages.layout.pageHeader.demo.subtitle')"
          >
            <template v-if="pgWithActions" #actions>
              <Button variant="outline" size="small">{{
                t("pages.layout.pageHeader.demo.filters")
              }}</Button>
              <Button color="primary" size="small">{{
                t("pages.layout.pageHeader.demo.new")
              }}</Button>
            </template>
          </PageHeader>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.pageHeader.examples.basic.title')"
        :description="t('pages.layout.pageHeader.examples.basic.desc')"
        :code="basicCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <PageHeader
            :title="t('pages.layout.pageHeader.demo.title')"
            :subtitle="t('pages.layout.pageHeader.demo.subtitle')"
            divider
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.pageHeader.examples.breadcrumbs.title')"
        :description="t('pages.layout.pageHeader.examples.breadcrumbs.desc')"
        :code="breadcrumbsCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <PageHeader :title="t('pages.layout.pageHeader.demo.edit')" divider>
            <template #breadcrumbs>
              <nav class="text-xs text-muted-foreground">
                {{ t("pages.layout.pageHeader.demo.crumbs") }}
                <span class="text-foreground">{{
                  t("pages.layout.pageHeader.demo.crumbCurrent")
                }}</span>
              </nav>
            </template>
          </PageHeader>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.pageHeader.examples.tabs.title')"
        :description="t('pages.layout.pageHeader.examples.tabs.desc')"
        :code="tabsCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <PageHeader
            :title="t('pages.layout.pageHeader.demo.reports')"
            divider
          >
            <template #tabs>
              <div class="flex gap-4 -mb-px">
                <button
                  class="px-1 py-2 border-b-2 border-primary text-primary text-sm font-medium"
                >
                  {{ t("pages.layout.pageHeader.demo.tabSummary") }}
                </button>
                <button
                  class="px-1 py-2 border-b-2 border-transparent text-muted-foreground text-sm hover:text-foreground"
                >
                  {{ t("pages.layout.pageHeader.demo.tabDetail") }}
                </button>
                <button
                  class="px-1 py-2 border-b-2 border-transparent text-muted-foreground text-sm hover:text-foreground"
                >
                  {{ t("pages.layout.pageHeader.demo.tabAudit") }}
                </button>
              </div>
            </template>
          </PageHeader>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.pageHeader.examples.actions.title')"
        :description="t('pages.layout.pageHeader.examples.actions.desc')"
        :code="actionsCode"
      >
        <div
          class="w-full border border-border rounded-md overflow-hidden bg-card"
        >
          <PageHeader
            back-button
            :title="t('pages.layout.pageHeader.demo.detail')"
            :subtitle="t('pages.layout.pageHeader.demo.back')"
            divider
          >
            <template #actions>
              <Button variant="outline" size="small">{{
                t("pages.layout.pageHeader.demo.cancel")
              }}</Button>
              <Button color="primary" size="small">{{
                t("pages.layout.pageHeader.demo.save")
              }}</Button>
            </template>
          </PageHeader>
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
        {{ t("pages.layout.pageHeader.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.pageHeader.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
