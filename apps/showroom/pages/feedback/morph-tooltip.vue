<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Button, Typography, MorphTooltip } from "mood-ui";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  InformationCircleIcon,
} from "@heroicons/vue/20/solid";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const p = (key: string) => t(`pages.feedback.morphTooltip.${key}`);

// ── Playground ────────────────────────────────────────────────────────────────
type Side = "top" | "right" | "bottom" | "left";
type Color = "default" | "inverted" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";

const pgSide = ref<Side>("top");
const pgColor = ref<Color>("default");
const pgSize = ref<Size | undefined>(undefined);
const pgDelay = ref<"0" | "200" | "500">("200");
const pgArrow = ref(true);
const pgDisabled = ref(false);

function resetPlayground() {
  pgSide.value = "top";
  pgColor.value = "default";
  pgSize.value = undefined;
  pgDelay.value = "200";
  pgArrow.value = true;
  pgDisabled.value = false;
}

const colorDots = [
  { value: "default", bg: "var(--color-slate-800)", label: "Default" },
  { value: "inverted", bg: "var(--color-slate-100)", label: "Inverted" },
  { value: "primary", bg: "var(--primary)", label: "Primary" },
  { value: "success", bg: "var(--color-emerald-500)", label: "Success" },
  { value: "warning", bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger", bg: "var(--color-red-500)", label: "Danger" },
];

const overviewCode = computed(() => {
  const rootAttrs: string[] = [];
  if (pgDelay.value !== "200") rootAttrs.push(`:open-delay="${pgDelay.value}"`);
  if (pgDisabled.value) rootAttrs.push("disabled");
  const contentAttrs: string[] = [];
  if (pgSide.value !== "top") contentAttrs.push(`side="${pgSide.value}"`);
  if (pgColor.value !== "default") contentAttrs.push(`color="${pgColor.value}"`);
  if (pgSize.value) contentAttrs.push(`size="${pgSize.value}"`);
  if (!pgArrow.value) contentAttrs.push(':arrow="false"');
  const root = rootAttrs.length ? " " + rootAttrs.join(" ") : "";
  const content = contentAttrs.length ? " " + contentAttrs.join(" ") : "";

  return `<script setup lang="ts">
import { MorphTooltip } from 'mood-ui';
<\/script>

<template>
  <MorphTooltip${root}>
    <MorphTooltip.Trigger variant="outline">Save</MorphTooltip.Trigger>
    <MorphTooltip.Content${content}>Save changes</MorphTooltip.Content>
  </MorphTooltip>
</template>`;
});

// ── Examples ──────────────────────────────────────────────────────────────────
const sides: Side[] = ["top", "right", "bottom", "left"];

const toolbar = computed(() => [
  { key: "bold", icon: BoldIcon, label: p("examples.warm.bold") },
  { key: "italic", icon: ItalicIcon, label: p("examples.warm.italic") },
  { key: "underline", icon: UnderlineIcon, label: p("examples.warm.underline") },
  { key: "link", icon: LinkIcon, label: p("examples.warm.link") },
]);

const manualOpen = ref(false);

const sidesCode = `<script setup lang="ts">
import { MorphTooltip } from 'mood-ui';
<\/script>

<template>
  <MorphTooltip v-for="side in ['top', 'right', 'bottom', 'left']" :key="side">
    <MorphTooltip.Trigger variant="outline">{{ side }}</MorphTooltip.Trigger>
    <MorphTooltip.Content :side="side">Opens on the {{ side }}</MorphTooltip.Content>
  </MorphTooltip>
</template>`;

const richCode = `<script setup lang="ts">
import { MorphTooltip, Button } from 'mood-ui';
<\/script>

<template>
  <MorphTooltip>
    <MorphTooltip.Trigger as-child>
      <Button variant="outline">Version history</Button>
    </MorphTooltip.Trigger>
    <MorphTooltip.Content color="inverted" :max-width="240">
      <MorphTooltip.Title>Version history</MorphTooltip.Title>
      <MorphTooltip.Description>
        Review and restore earlier versions of this document.
      </MorphTooltip.Description>
    </MorphTooltip.Content>
  </MorphTooltip>
</template>`;

const warmCode = `<script setup lang="ts">
import { MorphTooltip } from 'mood-ui';
import { BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon } from '@heroicons/vue/20/solid';

const tools = [
  { icon: BoldIcon, label: 'Bold' },
  { icon: ItalicIcon, label: 'Italic' },
  { icon: UnderlineIcon, label: 'Underline' },
  { icon: LinkIcon, label: 'Insert link' },
];
<\/script>

<template>
  <!-- After the first tooltip opens, its neighbours open instantly -->
  <MorphTooltip v-for="tool in tools" :key="tool.label">
    <MorphTooltip.Trigger variant="ghost" :icon="tool.icon" :aria-label="tool.label" />
    <MorphTooltip.Content side="bottom">{{ tool.label }}</MorphTooltip.Content>
  </MorphTooltip>
</template>`;

const clickCode = `<script setup lang="ts">
import { MorphTooltip } from 'mood-ui';
import { InformationCircleIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <MorphTooltip trigger="click">
    <MorphTooltip.Trigger variant="text" :icon="InformationCircleIcon" aria-label="What is this?" />
    <MorphTooltip.Content color="primary">
      Opens on click and closes on the next click, Escape or an outside tap.
    </MorphTooltip.Content>
  </MorphTooltip>
</template>`;

const manualCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MorphTooltip, Button } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Button @click="open = !open">Toggle from outside</Button>

  <MorphTooltip v-model:open="open" trigger="manual">
    <MorphTooltip.Trigger variant="outline">Target</MorphTooltip.Trigger>
    <MorphTooltip.Content side="right" color="success">Controlled with v-model:open</MorphTooltip.Content>
  </MorphTooltip>
</template>`;

const typesCode = `export type MorphTooltipSide = 'auto' | 'top' | 'bottom' | 'left' | 'right';
export type MorphTooltipAlign = 'auto' | 'start' | 'center' | 'end';
export type MorphTooltipTriggerMode = 'hover' | 'focus' | 'click' | 'manual';
export type MorphTooltipColor = 'default' | 'inverted' | 'primary' | 'danger' | 'success' | 'warning';

export interface MorphTooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  trigger?: MorphTooltipTriggerMode | MorphTooltipTriggerMode[];
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
}

export interface MorphTooltipTriggerProps {
  asChild?: boolean;
}

export interface MorphTooltipContentProps {
  side?: MorphTooltipSide;
  align?: MorphTooltipAlign;
  offset?: number;
  arrow?: boolean;
  color?: MorphTooltipColor;
  size?: ModoSize;
  radius?: ModoRadius;
  maxWidth?: number;
}`;

// ── API tables ────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  { name: "open / v-model:open", type: "boolean", default: "undefined", description: p("props.open") },
  { name: "defaultOpen", type: "boolean", default: "false", description: p("props.defaultOpen") },
  { name: "trigger", type: "'hover' | 'focus' | 'click' | 'manual' | array", default: "['hover','focus']", description: p("props.trigger") },
  { name: "openDelay", type: "number", default: "200", description: p("props.openDelay") },
  { name: "closeDelay", type: "number", default: "100", description: p("props.closeDelay") },
  { name: "disabled", type: "boolean", default: "false", description: p("props.disabled") },
  { name: "asChild (MorphTooltip.Trigger)", type: "boolean", default: "false", description: p("props.asChild") },
  { name: "side (MorphTooltip.Content)", type: "'auto' | 'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: p("props.side") },
  { name: "align (MorphTooltip.Content)", type: "'auto' | 'start' | 'center' | 'end'", default: "'auto'", description: p("props.align") },
  { name: "offset (MorphTooltip.Content)", type: "number", default: "8", description: p("props.offset") },
  { name: "arrow (MorphTooltip.Content)", type: "boolean", default: "true", description: p("props.arrow") },
  { name: "color (MorphTooltip.Content)", type: "'default' | 'inverted' | 'primary' | 'danger' | 'success' | 'warning'", default: "'default'", description: p("props.color") },
  { name: "size (MorphTooltip.Content)", type: "'xsmall' | 'small' | 'medium' | 'large'", description: p("props.size") },
  { name: "radius (MorphTooltip.Content)", type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: p("props.radius") },
  { name: "maxWidth (MorphTooltip.Content)", type: "number", default: "260", description: p("props.maxWidth") },
]);

const emitsList = computed<EmitDoc[]>(() => [
  { name: "update:open", payload: "boolean", description: p("emits.updateOpen") },
  { name: "openChange", payload: "boolean", description: p("emits.openChange") },
  { name: "show", payload: "—", description: p("emits.show") },
  { name: "hide", payload: "—", description: p("emits.hide") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: p("slots.default") },
  { name: "default (Trigger)", description: p("slots.trigger") },
  { name: "default (Content)", description: p("slots.content") },
]);

// ── A11y ──────────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: p("a11y.kbTab") },
  { keys: ["Shift+Tab"], action: p("a11y.kbShiftTab") },
  { keys: ["Escape"], action: p("a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"tooltip"', desc: p("a11y.ariaTooltip") },
  { attribute: "aria-describedby", value: "id", desc: p("a11y.ariaDescribedBy") },
]);

const a11yFocus = computed<string[]>(() => [
  p("a11y.focusVisible"),
  p("a11y.focusNonInteractive"),
  p("a11y.reducedMotion"),
]);
</script>

<template>
  <ComponentDoc
    :title="p('title')"
    :category="p('category')"
    :description="p('description')"
    import-path="import { MorphTooltip } from 'mood-ui'"
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
            v-model="pgSide"
            :label="p('controls.side')"
            :options="[
              { value: 'top' },
              { value: 'right' },
              { value: 'bottom' },
              { value: 'left' },
            ]"
          />
          <TbSep />
          <TbDots
            v-model="pgColor"
            :label="p('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgSize"
            :label="p('controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgDelay"
            :label="p('controls.delay')"
            :options="[
              { value: '0', label: '0ms' },
              { value: '200', label: '200ms' },
              { value: '500', label: '500ms' },
            ]"
          />
          <TbSep />
          <TbToggle v-model="pgArrow" :label="p('controls.arrow')" />
          <TbToggle v-model="pgDisabled" :label="p('controls.disabled')" />
        </template>

        <MorphTooltip :open-delay="Number(pgDelay)" :disabled="pgDisabled">
          <MorphTooltip.Trigger variant="outline" :size="pgSize">
            {{ p("playground.trigger") }}
          </MorphTooltip.Trigger>
          <MorphTooltip.Content
            :side="pgSide"
            :color="pgColor"
            :size="pgSize"
            :arrow="pgArrow"
          >
            {{ p("playground.content") }}
          </MorphTooltip.Content>
        </MorphTooltip>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="p('examples.sides.title')"
        :description="p('examples.sides.desc')"
        :code="sidesCode"
        min-height="200px"
      >
        <MorphTooltip v-for="side in sides" :key="side">
          <MorphTooltip.Trigger variant="outline">{{ side }}</MorphTooltip.Trigger>
          <MorphTooltip.Content :side="side">
            {{ p(`examples.sides.${side}`) }}
          </MorphTooltip.Content>
        </MorphTooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.rich.title')"
        :description="p('examples.rich.desc')"
        :code="richCode"
        min-height="200px"
      >
        <MorphTooltip>
          <MorphTooltip.Trigger as-child>
            <Button variant="outline">{{ p("examples.rich.heading") }}</Button>
          </MorphTooltip.Trigger>
          <MorphTooltip.Content color="inverted" :max-width="240">
            <MorphTooltip.Title>{{ p("examples.rich.heading") }}</MorphTooltip.Title>
            <MorphTooltip.Description>
              {{ p("examples.rich.body") }}
            </MorphTooltip.Description>
          </MorphTooltip.Content>
        </MorphTooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.warm.title')"
        :description="p('examples.warm.desc')"
        :code="warmCode"
        min-height="180px"
      >
        <div class="flex items-center gap-1">
          <MorphTooltip v-for="tool in toolbar" :key="tool.key">
            <MorphTooltip.Trigger
              variant="ghost"
              :icon="tool.icon"
              :aria-label="tool.label"
            />
            <MorphTooltip.Content side="bottom">{{ tool.label }}</MorphTooltip.Content>
          </MorphTooltip>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.click.title')"
        :description="p('examples.click.desc')"
        :code="clickCode"
        min-height="180px"
      >
        <MorphTooltip trigger="click">
          <MorphTooltip.Trigger
            variant="text"
            :icon="InformationCircleIcon"
            :aria-label="p('examples.click.label')"
          />
          <MorphTooltip.Content color="primary">
            {{ p("examples.click.content") }}
          </MorphTooltip.Content>
        </MorphTooltip>
      </ComponentPreview>

      <ComponentPreview
        :title="p('examples.manual.title')"
        :description="p('examples.manual.desc')"
        :code="manualCode"
        min-height="180px"
      >
        <Button @click="manualOpen = !manualOpen">
          {{ p("examples.manual.cta") }}
        </Button>
        <MorphTooltip v-model:open="manualOpen" trigger="manual">
          <MorphTooltip.Trigger variant="outline">
            {{ p("examples.manual.target") }}
          </MorphTooltip.Trigger>
          <MorphTooltip.Content side="right" color="success">
            {{ p("examples.manual.content") }}
          </MorphTooltip.Content>
        </MorphTooltip>
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
        {{ p("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ p("types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
