<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Badge, Input, Popover, PressButton, Switch, Typography } from "mood-ui";
import { ShareIcon } from "@heroicons/vue/20/solid";
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

const k = (key: string, params?: Record<string, unknown>) =>
  params
    ? t(`pages.layout.popover.${key}`, params)
    : t(`pages.layout.popover.${key}`);

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Enter", "Space"], action: k("a11y.kbToggle") },
  { keys: ["Tab", "Shift+Tab"], action: k("a11y.kbTab") },
  { keys: ["Escape"], action: k("a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"dialog" (non-modal)',
    desc: k("a11y.ariaDialog"),
  },
  {
    attribute: "aria-haspopup / aria-expanded / aria-controls",
    value: '"dialog" / boolean / id',
    desc: k("a11y.ariaTrigger"),
  },
  {
    attribute: "aria-label (Popover.Close)",
    value: "locale.common.close",
    desc: k("a11y.ariaClose"),
  },
]);

const a11yFocus = computed<string[]>(() => [k("a11y.focusRestore")]);

// ── Overview playground state ─────────────────────────────────────────────────
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";
type TriggerVariant = "normal" | "outline" | "ghost" | "text";

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "var(--color-emerald-500)", label: "Success" },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const pgColor = ref<Color>("default");
// `undefined` = follow the ModoProvider (showroom theme controls).
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgVariant = ref<TriggerVariant>("outline");
const pgSide = ref<"auto" | "top" | "bottom">("auto");
const pgAlign = ref<"auto" | "start" | "center" | "end">("auto");
const pgSurface = ref<"auto" | "trigger">("auto");
const pgDisabled = ref(false);

function resetPlayground() {
  pgColor.value = "default";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgVariant.value = "outline";
  pgSide.value = "auto";
  pgAlign.value = "auto";
  pgSurface.value = "auto";
  pgDisabled.value = false;
}

const widthVal = ref("100%");
const maxWidthVal = ref("320px");
const snapGrid = ref(true);

const overviewCode = computed(() => {
  const root: string[] = [];
  if (pgColor.value !== "default") root.push(`color="${pgColor.value}"`);
  if (pgSize.value) root.push(`size="${pgSize.value}"`);
  if (pgRadius.value) root.push(`radius="${pgRadius.value}"`);
  const trigger: string[] = [];
  if (pgVariant.value !== "outline") trigger.push(`variant="${pgVariant.value}"`);
  if (pgDisabled.value) trigger.push("disabled");
  const content: string[] = [];
  if (pgSide.value !== "auto") content.push(`side="${pgSide.value}"`);
  if (pgAlign.value !== "auto") content.push(`align="${pgAlign.value}"`);
  if (pgSurface.value !== "auto") content.push(`surface="${pgSurface.value}"`);
  const a = (list: string[]) => (list.length ? " " + list.join(" ") : "");

  return `<Popover${a(root)}>
  <Popover.Trigger${a(trigger)}>${k("demo.trigger")}</Popover.Trigger>
  <Popover.Content${a(content)} class="w-80 space-y-3">
    <div class="flex items-start justify-between gap-3">
      <div class="text-sm font-semibold">${k("demo.heading")}</div>
      <Popover.Close />
    </div>
    <Input v-model="width" label="${k("demo.width")}" />
    <Input v-model="maxWidth" label="${k("demo.maxWidth")}" />
    <Switch v-model="snap" label="${k("demo.snap")}" />
    <div class="flex justify-end">
      <Popover.Close variant="normal">${k("demo.done")}</Popover.Close>
    </div>
  </Popover.Content>
</Popover>`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const aligns = ["start", "center", "end"] as const;
const controlledOpen = ref(false);

// ── Example code ──────────────────────────────────────────────────────────────
const asChildCode = `<script setup lang="ts">
import { Popover, PressButton } from 'mood-ui';
import { ShareIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <Popover>
    <!-- as-child: your element becomes the trigger -->
    <Popover.Trigger as-child>
      <PressButton :start-icon="ShareIcon">Share</PressButton>
    </Popover.Trigger>
    <Popover.Content class="w-72 space-y-3">
      <div class="text-sm font-semibold">Share this board</div>
      <p class="text-xs text-muted-foreground">Anyone with the link can view.</p>
      <div class="flex justify-end gap-2">
        <Popover.Close>Cancel</Popover.Close>
        <Popover.Close as-child>
          <PressButton size="small">Copy link</PressButton>
        </Popover.Close>
      </div>
    </Popover.Content>
  </Popover>
</template>`;

const placementCode = `<template>
  <Popover v-for="align in ['start', 'center', 'end']" :key="align">
    <Popover.Trigger>Align: {{ align }}</Popover.Trigger>
    <Popover.Content side="bottom" :align="align" class="w-64 space-y-2">
      <div class="text-sm font-semibold">Aligned {{ align }}</div>
      <p class="text-xs text-muted-foreground">
        Flips to the other side when the viewport is tight.
      </p>
    </Popover.Content>
  </Popover>
</template>`;

const surfaceCode = `<template>
  <Popover color="primary">
    <Popover.Trigger variant="normal">Tinted trigger</Popover.Trigger>
    <Popover.Content surface="trigger" class="w-64 space-y-2">
      <div class="text-sm font-semibold">Inherited surface</div>
      <p class="text-xs opacity-80">
        Adopts the trigger's background, text and border colors.
      </p>
    </Popover.Content>
  </Popover>
</template>`;

const controlledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Popover, Button } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <Button variant="ghost" @click="open = !open">Toggle from outside</Button>

  <Popover v-model:open="open">
    <Popover.Trigger>Filters</Popover.Trigger>
    <Popover.Content :dismissable="false" class="w-64 space-y-2">
      <div class="flex items-start justify-between gap-3">
        <div class="text-sm font-semibold">Filters</div>
        <Popover.Close />
      </div>
      <p class="text-xs text-muted-foreground">
        Outside clicks and Escape are ignored; close it with the X or the outside button.
      </p>
    </Popover.Content>
  </Popover>
</template>`;

const typesCode = `import type { ModoColor, ModoRadius, ModoSize } from 'mood-ui';

export interface PopoverProps {
  open?: boolean;          // v-model:open
  modelValue?: boolean;    // v-model
  defaultOpen?: boolean;   // default false
  color?: ModoColor;       // default 'default' (follows ModoProvider)
  radius?: ModoRadius;     // inherits ModoProvider
  size?: ModoSize;         // inherits ModoProvider
}

export interface PopoverTriggerProps {
  asChild?: boolean;                                   // default false
  variant?: 'normal' | 'outline' | 'ghost' | 'text';  // default 'outline'
  disabled?: boolean;                                  // default false
}

export interface PopoverContentProps {
  side?: 'auto' | 'top' | 'bottom';                   // default 'auto'
  align?: 'auto' | 'start' | 'center' | 'end';        // default 'auto'
  surface?: 'auto' | 'trigger';                       // default 'auto'
  dismissable?: boolean;                              // default true
  radius?: ModoRadius;                                // overrides Popover
  size?: ModoSize;                                    // overrides Popover
}

export interface PopoverCloseProps {
  asChild?: boolean;                                   // default false
  variant?: 'normal' | 'outline' | 'ghost' | 'text';  // default 'text'
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "open / v-model",
    type: "boolean",
    default: "undefined",
    description: k("props.open"),
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: k("props.defaultOpen"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: k("props.color"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    description: k("props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: k("props.radius"),
  },
  {
    name: "asChild (Popover.Trigger)",
    type: "boolean",
    default: "false",
    description: k("props.triggerAsChild"),
  },
  {
    name: "variant (Popover.Trigger)",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'outline'",
    description: k("props.triggerVariant"),
  },
  {
    name: "disabled (Popover.Trigger)",
    type: "boolean",
    default: "false",
    description: k("props.triggerDisabled"),
  },
  {
    name: "side (Popover.Content)",
    type: "'auto' | 'top' | 'bottom'",
    default: "'auto'",
    description: k("props.side"),
  },
  {
    name: "align (Popover.Content)",
    type: "'auto' | 'start' | 'center' | 'end'",
    default: "'auto'",
    description: k("props.align"),
  },
  {
    name: "surface (Popover.Content)",
    type: "'auto' | 'trigger'",
    default: "'auto'",
    description: k("props.surface"),
  },
  {
    name: "dismissable (Popover.Content)",
    type: "boolean",
    default: "true",
    description: k("props.dismissable"),
  },
  {
    name: "radius / size (Popover.Content)",
    type: "ModoRadius / ModoSize",
    description: k("props.contentOverrides"),
  },
  {
    name: "asChild (Popover.Close)",
    type: "boolean",
    default: "false",
    description: k("props.closeAsChild"),
  },
  {
    name: "variant (Popover.Close)",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'text'",
    description: k("props.closeVariant"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  { name: "update:open", payload: "boolean", description: k("emits.updateOpen") },
  {
    name: "update:modelValue",
    payload: "boolean",
    description: k("emits.updateModelValue"),
  },
  { name: "openChange", payload: "boolean", description: k("emits.openChange") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    bindings: "{ open, phase, setOpen }",
    description: k("slots.default"),
  },
  {
    name: "default (Popover.Trigger)",
    bindings: "{ open }",
    description: k("slots.trigger"),
  },
  { name: "default (Popover.Content)", description: k("slots.content") },
  {
    name: "default (Popover.Close)",
    bindings: "{ close }",
    description: k("slots.close"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    :description="k('description')"
    import-path="import { Popover } from 'mood-ui'"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbDots
            :label="t('controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
            v-model="pgRadius"
          />
          <TbSep />
          <TbPills
            :label="t('controls.variant')"
            :options="[
              { value: 'normal' },
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'text' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('controls.side')"
            :options="[{ value: 'auto' }, { value: 'top' }, { value: 'bottom' }]"
            v-model="pgSide"
          />
          <TbSep />
          <TbPills
            :label="t('controls.align')"
            :options="[
              { value: 'auto' },
              { value: 'start' },
              { value: 'center' },
              { value: 'end' },
            ]"
            v-model="pgAlign"
          />
          <TbSep />
          <TbPills
            :label="k('controls.surface')"
            :options="[{ value: 'auto' }, { value: 'trigger' }]"
            v-model="pgSurface"
          />
          <TbSep />
          <TbToggle :label="k('controls.disabled')" v-model="pgDisabled" />
        </template>

        <Popover :color="pgColor" :size="pgSize" :radius="pgRadius">
          <Popover.Trigger :variant="pgVariant" :disabled="pgDisabled">
            {{ k("demo.trigger") }}
          </Popover.Trigger>
          <Popover.Content
            :side="pgSide"
            :align="pgAlign"
            :surface="pgSurface"
            class="w-80 space-y-3.5"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-foreground">
                  {{ k("demo.heading") }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ k("demo.hint") }}
                </div>
              </div>
              <Popover.Close />
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <Input
                v-model="widthVal"
                :label="k('demo.width')"
                placeholder="100%"
                full-width
              />
              <Input
                v-model="maxWidthVal"
                :label="k('demo.maxWidth')"
                placeholder="320px"
                full-width
              />
            </div>
            <Switch v-model="snapGrid" :label="k('demo.snap')" />
            <div class="flex justify-end">
              <Popover.Close variant="normal">{{ k("demo.done") }}</Popover.Close>
            </div>
          </Popover.Content>
        </Popover>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.asChild.title')"
        :description="k('examples.asChild.desc')"
        :code="asChildCode"
      >
        <Popover>
          <Popover.Trigger as-child>
            <PressButton :start-icon="ShareIcon">
              {{ k("demo.asChild.trigger") }}
            </PressButton>
          </Popover.Trigger>
          <Popover.Content class="w-72 space-y-3">
            <div class="text-sm font-semibold text-foreground">
              {{ k("demo.asChild.heading") }}
            </div>
            <p class="text-xs text-muted-foreground">
              {{ k("demo.asChild.body") }}
            </p>
            <div class="flex justify-end gap-2">
              <Popover.Close>{{ k("demo.asChild.cancel") }}</Popover.Close>
              <Popover.Close as-child>
                <PressButton size="small">{{ k("demo.asChild.copy") }}</PressButton>
              </Popover.Close>
            </div>
          </Popover.Content>
        </Popover>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.placement.title')"
        :description="k('examples.placement.desc')"
        :code="placementCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Popover v-for="align in aligns" :key="align">
            <Popover.Trigger>
              {{ k("demo.placement.trigger", { align }) }}
            </Popover.Trigger>
            <Popover.Content side="bottom" :align="align" class="w-64 space-y-2">
              <div class="text-sm font-semibold text-foreground">
                {{ k("demo.placement.heading", { align }) }}
              </div>
              <p class="text-xs text-muted-foreground">
                {{ k("demo.placement.body") }}
              </p>
            </Popover.Content>
          </Popover>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.surface.title')"
        :description="k('examples.surface.desc')"
        :code="surfaceCode"
      >
        <Popover color="primary">
          <Popover.Trigger variant="normal">
            {{ k("demo.surface.trigger") }}
          </Popover.Trigger>
          <Popover.Content surface="trigger" class="w-64 space-y-2">
            <div class="text-sm font-semibold">{{ k("demo.surface.heading") }}</div>
            <p class="text-xs opacity-80">{{ k("demo.surface.body") }}</p>
          </Popover.Content>
        </Popover>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.controlled.title')"
        :description="k('examples.controlled.desc')"
        :code="controlledCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <PressButton variant="ghost" @click="controlledOpen = !controlledOpen">
            {{ k("demo.controlled.toggle") }}
          </PressButton>
          <Popover v-model:open="controlledOpen">
            <Popover.Trigger>{{ k("demo.controlled.trigger") }}</Popover.Trigger>
            <Popover.Content :dismissable="false" class="w-64 space-y-2">
              <div class="flex items-start justify-between gap-3">
                <div class="text-sm font-semibold text-foreground">
                  {{ k("demo.controlled.heading") }}
                </div>
                <Popover.Close />
              </div>
              <p class="text-xs text-muted-foreground">
                {{ k("demo.controlled.body") }}
              </p>
            </Popover.Content>
          </Popover>
          <Badge :color="controlledOpen ? 'primary' : 'default'" variant="subtle">
            {{ controlledOpen ? k("demo.controlled.open") : k("demo.controlled.closed") }}
          </Badge>
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
        {{ k("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ k("types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
