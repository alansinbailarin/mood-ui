<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, Tooltip, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";

import ComponentPreview from "~/components/ComponentPreview.vue";


import { HeartIcon } from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.tooltip.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.tooltip.a11y.kbShiftTab") },
  { keys: ["Escape"], action: t("pages.feedback.tooltip.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"tooltip"',
    desc: t("pages.feedback.tooltip.a11y.ariaTooltip"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.feedback.tooltip.a11y.ariaDescribedBy"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.tooltip.a11y.focusNative"),
  t("pages.feedback.tooltip.a11y.focusKeyboard"),
]);

type Placement = "top" | "right" | "bottom" | "left";
type Color =
  | "default"
  | "primary"
  | "danger"
  | "success"
  | "warning"
  | "inverted";

const pgPlacement = ref<Placement>("top");
const pgColor = ref<Color>("default");
const pgDelay = ref<0 | 200 | 500>(200);
const pgDelayStr = computed({
  get: () => String(pgDelay.value),
  set: (v: string) => {
    pgDelay.value = Number(v) as 0 | 200 | 500;
  },
});
const pgArrow = ref(true);
const pgDisabled = ref(false);

function resetPlayground() {
  pgPlacement.value = "top";
  pgColor.value = "default";
  pgDelay.value = 200;
  pgArrow.value = true;
  pgDisabled.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-800)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
  {
    value: "inverted" as const,
    bg: "var(--color-slate-100)",
    label: "Inverted",
  },
];

const overviewCode = computed(() => {
  const parts: string[] = [`content="Message"`];
  if (pgPlacement.value !== "top")
    parts.push(`placement="${pgPlacement.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgDelay.value !== 200) parts.push(`:open-delay="${pgDelay.value}"`);
  if (!pgArrow.value) parts.push(':arrow="false"');
  if (pgDisabled.value) parts.push("disabled");
  return `<Tooltip ${parts.join(" ")}>
  <Button>Hover me</Button>
</Tooltip>`;
});

const placementsCode = `<script setup lang="ts">
import { Tooltip, Button } from 'mood-ui';
<\/script>

<template>
  <Tooltip content="Top" placement="top"><Button>Top</Button></Tooltip>
  <Tooltip content="Right" placement="right"><Button>Right</Button></Tooltip>
  <Tooltip content="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
  <Tooltip content="Left" placement="left"><Button>Left</Button></Tooltip>
</template>`;

const richCode = `<script setup lang="ts">
import { Tooltip, Button } from 'mood-ui';
<\/script>

<template>
  <Tooltip placement="top" :max-width="280">
    <template #content>
      <div class="flex flex-col gap-1">
        <strong>Keyboard shortcut</strong>
        <span class="opacity-80">Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to open the search.</span>
      </div>
    </template>
    <Button variant="outline">View shortcut</Button>
  </Tooltip>
</template>`;

const iconCode = `<script setup lang="ts">
import { Tooltip, Button } from 'mood-ui';
import { HeartIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Tooltip content="Like">
    <Button :icon="HeartIcon" color="danger" variant="ghost" ariaLabel="Like" />
  </Tooltip>
</template>`;

const delayCode = `<script setup lang="ts">
import { Tooltip, Button } from 'mood-ui';
<\/script>

<template>
  <Tooltip content="No delay" :open-delay="0"><Button>Immediate</Button></Tooltip>
  <Tooltip content="Short delay" :open-delay="200"><Button>200 ms</Button></Tooltip>
  <Tooltip content="Long delay" :open-delay="600"><Button>600 ms</Button></Tooltip>
</template>`;

const typesCode = `export type TooltipPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual';

export interface Tooltip {
  content?: string;
  placement?: TooltipPlacement;
  offset?: number;
  trigger?: TooltipTrigger | TooltipTrigger[];
  openDelay?: number;
  closeDelay?: number;
  arrow?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'inverted';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  disabled?: boolean;
  open?: boolean;
  maxWidth?: number;
  id?: string;
  wrapperClass?: string;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "content",
    type: "string",
    description: t("pages.feedback.tooltip.props.content"),
  },
  {
    name: "placement",
    type: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'",
    default: "'top'",
    description: t("pages.feedback.tooltip.props.placement"),
  },
  {
    name: "offset",
    type: "number",
    default: "8",
    description: t("pages.feedback.tooltip.props.offset"),
  },
  {
    name: "trigger",
    type: "'hover' | 'focus' | 'click' | 'manual' | array",
    default: "['hover','focus']",
    description: t("pages.feedback.tooltip.props.trigger"),
  },
  {
    name: "openDelay",
    type: "number",
    default: "200",
    description: t("pages.feedback.tooltip.props.openDelay"),
  },
  {
    name: "closeDelay",
    type: "number",
    default: "100",
    description: t("pages.feedback.tooltip.props.closeDelay"),
  },
  {
    name: "arrow",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.tooltip.props.arrow"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning' | 'inverted'",
    default: "'default'",
    description: t("pages.feedback.tooltip.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.feedback.tooltip.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.tooltip.props.radius"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.tooltip.props.disabled"),
  },
  {
    name: "open",
    type: "boolean",
    description: t("pages.feedback.tooltip.props.open"),
  },
  {
    name: "maxWidth",
    type: "number",
    default: "260",
    description: t("pages.feedback.tooltip.props.maxWidth"),
  },
  {
    name: "wrapperClass",
    type: "string",
    description: t("pages.feedback.tooltip.props.wrapperClass"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:open",
    payload: "boolean",
    description: t("pages.feedback.tooltip.emits.updateOpen"),
  },
  {
    name: "show",
    payload: "—",
    description: t("pages.feedback.tooltip.emits.show"),
  },
  {
    name: "hide",
    payload: "—",
    description: t("pages.feedback.tooltip.emits.hide"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.feedback.tooltip.slots.default") },
  { name: "content", description: t("pages.feedback.tooltip.slots.content") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.tooltip.title')"
    category="Feedback"
    import-path="import { Tooltip } from 'mood-ui'"
    :description="t('pages.feedback.tooltip.description')"
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
            :label="t('pages.feedback.tooltip.controls.placement')"
            :options="[
              { value: 'top' },
              { value: 'right' },
              { value: 'bottom' },
              { value: 'left' },
            ]"
            v-model="pgPlacement"
          />
          <TbSep />
          <TbDots
            :label="t('pages.feedback.tooltip.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.tooltip.controls.delay')"
            :options="[
              { value: '0', label: '0ms' },
              { value: '200', label: '200ms' },
              { value: '500', label: '500ms' },
            ]"
            v-model="pgDelayStr"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.feedback.tooltip.controls.arrow')"
            v-model="pgArrow"
          />
          <TbToggle
            :label="t('pages.feedback.tooltip.controls.disabled')"
            v-model="pgDisabled"
          />
        </template>

        <Tooltip
          content="Mensaje"
          :placement="pgPlacement"
          :color="pgColor"
          :open-delay="pgDelay"
          :arrow="pgArrow"
          :disabled="pgDisabled"
        >
          <Button>Hover me</Button>
        </Tooltip>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.tooltip.examples.placements.title')"
        :description="t('pages.feedback.tooltip.examples.placements.desc')"
        :code="placementsCode"
        min-height="200px"
      >
        <Tooltip content="Top" placement="top"><Button>Top</Button></Tooltip>
        <Tooltip content="Right" placement="right"
          ><Button>Right</Button></Tooltip
        >
        <Tooltip content="Bottom" placement="bottom"
          ><Button>Bottom</Button></Tooltip
        >
        <Tooltip content="Left" placement="left"><Button>Left</Button></Tooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.tooltip.examples.rich.title')"
        :description="t('pages.feedback.tooltip.examples.rich.desc')"
        :code="richCode"
        min-height="200px"
      >
        <Tooltip placement="top" :max-width="280">
          <template #content>
            <div class="flex flex-col gap-1">
              <strong>{{
                t("pages.feedback.tooltip.examples.rich.heading")
              }}</strong>
              <span class="opacity-80">{{
                t("pages.feedback.tooltip.examples.rich.shortcut")
              }}</span>
            </div>
          </template>
          <Button variant="outline">{{
            t("pages.feedback.tooltip.examples.rich.cta")
          }}</Button>
        </Tooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.tooltip.examples.icon.title')"
        :description="t('pages.feedback.tooltip.examples.icon.desc')"
        :code="iconCode"
        min-height="180px"
      >
        <Tooltip :content="t('pages.feedback.tooltip.examples.icon.tooltip')">
          <Button
            :icon="HeartIcon"
            color="danger"
            variant="ghost"
            aria-label="Like"
          />
        </Tooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.tooltip.examples.delays.title')"
        :description="t('pages.feedback.tooltip.examples.delays.desc')"
        :code="delayCode"
        min-height="180px"
      >
        <Tooltip
          :content="t('pages.feedback.tooltip.examples.delays.zero')"
          :open-delay="0"
        >
          <Button>{{
            t("pages.feedback.tooltip.examples.delays.zeroBtn")
          }}</Button>
        </Tooltip>
        <Tooltip
          :content="t('pages.feedback.tooltip.examples.delays.short')"
          :open-delay="200"
        >
          <Button>200 ms</Button>
        </Tooltip>
        <Tooltip
          :content="t('pages.feedback.tooltip.examples.delays.long')"
          :open-delay="600"
        >
          <Button>600 ms</Button>
        </Tooltip>
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
        {{ t("pages.feedback.tooltip.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.tooltip.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
