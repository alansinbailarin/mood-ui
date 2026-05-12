<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, DropdownMenu, PopoverPanel, Select, Tooltip, Typography, usePopover } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";







import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.layout.popoverPanel.title"),
  description: () => t("pages.layout.popoverPanel.description"),
  ogTitle: () => `${t("pages.layout.popoverPanel.title")} · mood-ui`,
  ogDescription: () => t("pages.layout.popoverPanel.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.popoverPanel.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.layout.popoverPanel.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.popoverPanel.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.popoverPanel.a11y.focusNative"),
]);

const v = ref<string | number | null>("vue");
const opts = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

const dropdownItems = computed(() => [
  { id: 1, label: t("pages.layout.popoverPanel.demo.edit") },
  { id: 2, label: t("pages.layout.popoverPanel.demo.duplicate") },
  { type: "divider" as const },
  { id: 3, label: t("pages.layout.popoverPanel.demo.delete"), danger: true },
]);

const {
  isOpen: overviewOpen,
  panelStyle: overviewPanelStyle,
  panelRef: overviewPanelRef,
  triggerRef: overviewTriggerRef,
  toggle: overviewToggle,
  close: overviewClose,
} = usePopover({ placement: "bottom-start" });

const overviewCode = `<script setup lang="ts">
import { ref } from 'vue';
import { usePopover, PopoverPanel } from 'mood-ui';

const triggerRef = ref(null);
const { open, panelStyle, panelRef, toggle } = usePopover({ placement: 'bottom-start' });
<\/script>

<template>
    <Button ref="triggerRef" variant="outline" @click="toggle">…</Button>
    <PopoverPanel :open="open" :style="panelStyle" @update:panel-ref="panelRef = $event">
        <div class="p-4">…</div>
    </PopoverPanel>
</template>`;

const tooltipCode = `<script setup lang="ts">
import { Tooltip, Button } from 'mood-ui';
<\/script>

<template>
  <Tooltip text="Tooltip content" color="inverted" trigger="click">
    <Button variant="outline">Click me</Button>
  </Tooltip>
</template>`;

const selectCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Select } from 'mood-ui';

const value = ref('vue');
const options = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
];
<\/script>

<template>
  <Select v-model="value" :options="options" class="w-56" />
</template>`;

const dropdownCode = `<script setup lang="ts">
import { DropdownMenu } from 'mood-ui';

const items = [
  { id: 1, label: 'Edit' },
  { id: 2, label: 'Delete', danger: true },
];
<\/script>

<template>
  <DropdownMenu trigger-label="Actions" :items="items" />
</template>`;

const directCode = `<script setup lang="ts">
import { ref } from 'vue';
import { usePopover, PopoverPanel, Button } from 'mood-ui';

const triggerRef = ref(null);
const { open, panelStyle, panelRef, toggle } = usePopover({ placement: 'bottom-start' });
<\/script>

<template>
  <Button ref="triggerRef" variant="outline" @click="toggle">Open</Button>
  <PopoverPanel :open="open" :style="panelStyle" @update:panel-ref="panelRef = $event">
    <div class="p-4">Custom content</div>
  </PopoverPanel>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "open",
    type: "boolean",
    required: true,
    description: t("pages.layout.popoverPanel.props.open"),
  },
  {
    name: "style",
    type: "Record<string, string>",
    description: t("pages.layout.popoverPanel.props.style"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.layout.popoverPanel.props.radius"),
  },
  {
    name: "role",
    type: "string",
    default: "'dialog'",
    description: t("pages.layout.popoverPanel.props.role"),
  },
  {
    name: "labelledBy",
    type: "string",
    description: t("pages.layout.popoverPanel.props.labelledBy"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:panelRef",
    payload: "HTMLElement | null",
    description: t("pages.layout.popoverPanel.emits.updatePanelRef"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.layout.popoverPanel.slots.default"),
  },
  { name: "header", description: t("pages.layout.popoverPanel.slots.header") },
  { name: "footer", description: t("pages.layout.popoverPanel.slots.footer") },
]);

const typesCode = `export interface PopoverPanel {
  open?: boolean;
  panelRef?: HTMLElement | null;
  triggerRef?: HTMLElement | null;
  placement?: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
  offset?: number;
  flip?: boolean;
  shift?: boolean;
  autoUpdate?: boolean;
  autoPlacement?: boolean;
  strategy?: 'absolute' | 'fixed';
  arrow?: boolean;
  arrowPadding?: number;
  role?: string;
  labelledBy?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.popoverPanel.title')"
    :category="t('pages.layout.popoverPanel.category')"
    import-path="import { PopoverPanel } from 'mood-ui'"
    :description="t('pages.layout.popoverPanel.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="200px">
        <div class="relative">
          <Button
            :ref="
              (el: any) => {
                overviewTriggerRef = el?.$el ?? el;
              }
            "
            variant="outline"
            @click="overviewToggle"
          >
            {{ t("pages.layout.popoverPanel.demo.openPanel") }}
          </Button>
          <PopoverPanel
            :open="overviewOpen"
            :style="overviewPanelStyle"
            @update:panel-ref="overviewPanelRef = $event"
          >
            <div class="p-4 flex flex-col gap-3 min-w-52">
              <p class="text-sm font-medium text-foreground">
                {{ t("pages.layout.popoverPanel.demo.customTitle") }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ t("pages.layout.popoverPanel.demo.customBody") }}
              </p>
              <Button size="small" variant="outline" @click="overviewClose">{{
                t("pages.layout.popoverPanel.demo.close")
              }}</Button>
            </div>
          </PopoverPanel>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.popoverPanel.examples.tooltip.title')"
        :description="t('pages.layout.popoverPanel.examples.tooltip.desc')"
        :code="tooltipCode"
      >
        <Tooltip
          :text="t('pages.layout.popoverPanel.demo.tooltipText')"
          color="inverted"
          trigger="click"
        >
          <Button variant="outline">{{
            t("pages.layout.popoverPanel.demo.click")
          }}</Button>
        </Tooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.popoverPanel.examples.select.title')"
        :description="t('pages.layout.popoverPanel.examples.select.desc')"
        :code="selectCode"
      >
        <Select v-model="v" :options="opts" class="w-56" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.popoverPanel.examples.dropdown.title')"
        :description="t('pages.layout.popoverPanel.examples.dropdown.desc')"
        :code="dropdownCode"
      >
        <DropdownMenu
          :trigger-label="t('pages.layout.popoverPanel.demo.actions')"
          :items="dropdownItems"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.popoverPanel.examples.direct.title')"
        :description="t('pages.layout.popoverPanel.examples.direct.desc')"
        :code="directCode"
      >
        <p class="text-sm text-muted-foreground text-center max-w-md">
          {{ t("pages.layout.popoverPanel.demo.directNote") }}
          <code class="font-mono text-foreground">PopoverPanel</code>.
        </p>
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
        {{ t("pages.layout.popoverPanel.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.popoverPanel.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
