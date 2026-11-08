<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Badge, Menu, PressButton, Typography } from "mood-ui";
import {
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon,
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

const k = (key: string) => t(`pages.navigation.menu.${key}`);

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Enter", "Space", "ArrowDown"], action: k("a11y.kbOpen") },
  {
    keys: ["ArrowDown", "ArrowUp", "Home", "End"],
    action: k("a11y.kbArrows"),
  },
  { keys: ["A–Z"], action: k("a11y.kbTypeahead") },
  { keys: ["⌘D", "⌫"], action: k("a11y.kbShortcuts") },
  { keys: ["Escape", "Tab"], action: k("a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"menu" / "menuitem" / "separator"',
    desc: k("a11y.ariaMenu"),
  },
  {
    attribute: "aria-haspopup / aria-expanded",
    value: '"menu" / boolean',
    desc: k("a11y.ariaTrigger"),
  },
  {
    attribute: "aria-disabled",
    value: '"true"',
    desc: k("a11y.ariaDisabled"),
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
const lastAction = ref<string | null>(null);

function resetPlayground() {
  pgColor.value = "default";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgVariant.value = "outline";
  pgSide.value = "auto";
  pgAlign.value = "auto";
  pgSurface.value = "auto";
  pgDisabled.value = false;
  lastAction.value = null;
}

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

  return `<Menu${a(root)}>
  <Menu.Trigger${a(trigger)}>${k("demo.trigger")}</Menu.Trigger>
  <Menu.Content${a(content)}>
    <Menu.Label>${k("demo.label")}</Menu.Label>
    <Menu.Item :icon="PencilSquareIcon" shortcut="E" @select="onEdit">
      ${k("demo.edit")}
    </Menu.Item>
    <Menu.Item :icon="DocumentDuplicateIcon" shortcut="D" @select="onDuplicate">
      ${k("demo.duplicate")}
    </Menu.Item>
    <Menu.Item :icon="ShareIcon" shortcut="S">${k("demo.share")}</Menu.Item>
    <Menu.Item :icon="ArchiveBoxIcon" disabled>${k("demo.archive")}</Menu.Item>
    <Menu.Separator />
    <Menu.Item :icon="TrashIcon" shortcut="⌫" color="danger" @select="onDelete">
      ${k("demo.delete")}
    </Menu.Item>
  </Menu.Content>
</Menu>`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const aligns = ["start", "center", "end"] as const;

// ── Example code ──────────────────────────────────────────────────────────────
const asChildCode = `<script setup lang="ts">
import { Menu, PressButton } from 'mood-ui';
import { EllipsisHorizontalIcon, ShareIcon, DocumentDuplicateIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <Menu>
    <!-- as-child: your element becomes the trigger -->
    <Menu.Trigger as-child>
      <PressButton variant="ghost" :icon="EllipsisHorizontalIcon" aria-label="More actions" />
    </Menu.Trigger>
    <Menu.Content align="end">
      <Menu.Item :icon="ShareIcon" shortcut="S">Share link</Menu.Item>
      <Menu.Item :icon="DocumentDuplicateIcon" shortcut="D">Duplicate</Menu.Item>
    </Menu.Content>
  </Menu>
</template>`;

const dangerCode = `<template>
  <!-- Single destructive row -->
  <Menu>
    <Menu.Trigger>Project</Menu.Trigger>
    <Menu.Content>
      <Menu.Item :icon="PencilSquareIcon">Rename</Menu.Item>
      <Menu.Separator />
      <Menu.Item :icon="TrashIcon" shortcut="⌫" color="danger">Delete project</Menu.Item>
    </Menu.Content>
  </Menu>

  <!-- color="danger" on Menu turns every row without its own color red -->
  <Menu color="danger">
    <Menu.Trigger>Danger zone</Menu.Trigger>
    <Menu.Content>
      <Menu.Item :icon="ArchiveBoxIcon">Archive all</Menu.Item>
      <Menu.Item :icon="TrashIcon">Delete all</Menu.Item>
    </Menu.Content>
  </Menu>
</template>`;

const surfaceCode = `<template>
  <Menu color="primary">
    <Menu.Trigger variant="normal">Workspace</Menu.Trigger>
    <Menu.Content surface="trigger">
      <Menu.Label>Workspace</Menu.Label>
      <Menu.Item :icon="ShareIcon" shortcut="S">Share link</Menu.Item>
      <Menu.Item :icon="DocumentDuplicateIcon" shortcut="D">Duplicate</Menu.Item>
      <Menu.Separator />
      <Menu.Item :icon="ArchiveBoxIcon" shortcut="A">Archive</Menu.Item>
    </Menu.Content>
  </Menu>
</template>`;

const placementCode = `<template>
  <Menu v-for="align in ['start', 'center', 'end']" :key="align">
    <Menu.Trigger>Align: {{ align }}</Menu.Trigger>
    <Menu.Content side="bottom" :align="align">
      <Menu.Item :icon="PencilSquareIcon">Edit</Menu.Item>
      <Menu.Item :icon="ShareIcon">Share link</Menu.Item>
    </Menu.Content>
  </Menu>
</template>`;

const typesCode = `import type { Component } from 'vue';
import type { ModoColor, ModoRadius, ModoSize } from 'mood-ui';

export interface MenuProps {
  open?: boolean;          // v-model:open
  modelValue?: boolean;    // v-model
  defaultOpen?: boolean;   // default false
  color?: ModoColor;       // default 'default'; 'danger' tints every item
  radius?: ModoRadius;     // inherits ModoProvider
  size?: ModoSize;         // inherits ModoProvider
}

export interface MenuTriggerProps {
  asChild?: boolean;                                   // default false
  variant?: 'normal' | 'outline' | 'ghost' | 'text';  // default 'outline'
  disabled?: boolean;                                  // default false
}

export interface MenuContentProps {
  side?: 'auto' | 'top' | 'bottom';             // default 'auto'
  align?: 'auto' | 'start' | 'center' | 'end';  // default 'auto'
  surface?: 'auto' | 'trigger';                 // default 'auto'
  radius?: ModoRadius;                          // overrides Menu
  size?: ModoSize;                              // overrides Menu
}

export interface MenuItemProps {
  icon?: Component;
  shortcut?: string;       // e.g. '⌘D', '⌫', '⇧⌘P'
  color?: ModoColor;       // 'danger' for destructive rows
  disabled?: boolean;      // default false
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
    name: "asChild (Menu.Trigger)",
    type: "boolean",
    default: "false",
    description: k("props.triggerAsChild"),
  },
  {
    name: "variant (Menu.Trigger)",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'outline'",
    description: k("props.triggerVariant"),
  },
  {
    name: "disabled (Menu.Trigger)",
    type: "boolean",
    default: "false",
    description: k("props.triggerDisabled"),
  },
  {
    name: "side (Menu.Content)",
    type: "'auto' | 'top' | 'bottom'",
    default: "'auto'",
    description: k("props.side"),
  },
  {
    name: "align (Menu.Content)",
    type: "'auto' | 'start' | 'center' | 'end'",
    default: "'auto'",
    description: k("props.align"),
  },
  {
    name: "surface (Menu.Content)",
    type: "'auto' | 'trigger'",
    default: "'auto'",
    description: k("props.surface"),
  },
  {
    name: "radius / size (Menu.Content)",
    type: "ModoRadius / ModoSize",
    description: k("props.contentOverrides"),
  },
  {
    name: "icon (Menu.Item)",
    type: "Component",
    description: k("props.icon"),
  },
  {
    name: "shortcut (Menu.Item)",
    type: "string",
    description: k("props.shortcut"),
  },
  {
    name: "color (Menu.Item)",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    description: k("props.itemColor"),
  },
  {
    name: "disabled (Menu.Item)",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
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
  { name: "select (Menu.Item)", payload: "—", description: k("emits.select") },
  { name: "click (Menu.Item)", payload: "MouseEvent", description: k("emits.click") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    bindings: "{ open, phase, setOpen }",
    description: k("slots.default"),
  },
  {
    name: "default (Menu.Trigger)",
    bindings: "{ open }",
    description: k("slots.trigger"),
  },
  { name: "default (Menu.Item)", description: k("slots.item") },
  { name: "icon (Menu.Item)", description: k("slots.icon") },
  { name: "shortcut (Menu.Item)", description: k("slots.shortcut") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    :description="k('description')"
    import-path="import { Menu } from 'mood-ui'"
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

        <div class="flex flex-col items-center gap-3">
          <Menu :color="pgColor" :size="pgSize" :radius="pgRadius">
            <Menu.Trigger :variant="pgVariant" :disabled="pgDisabled">
              {{ k("demo.trigger") }}
            </Menu.Trigger>
            <Menu.Content :side="pgSide" :align="pgAlign" :surface="pgSurface">
              <Menu.Label>{{ k("demo.label") }}</Menu.Label>
              <Menu.Item
                :icon="PencilSquareIcon"
                shortcut="E"
                @select="lastAction = k('demo.edit')"
              >
                {{ k("demo.edit") }}
              </Menu.Item>
              <Menu.Item
                :icon="DocumentDuplicateIcon"
                shortcut="D"
                @select="lastAction = k('demo.duplicate')"
              >
                {{ k("demo.duplicate") }}
              </Menu.Item>
              <Menu.Item
                :icon="ShareIcon"
                shortcut="S"
                @select="lastAction = k('demo.share')"
              >
                {{ k("demo.share") }}
              </Menu.Item>
              <Menu.Item :icon="ArchiveBoxIcon" disabled>
                {{ k("demo.archive") }}
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item
                :icon="TrashIcon"
                shortcut="⌫"
                color="danger"
                @select="lastAction = k('demo.delete')"
              >
                {{ k("demo.delete") }}
              </Menu.Item>
            </Menu.Content>
          </Menu>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{{ k("demo.lastAction") }}</span>
            <Badge color="primary" variant="subtle">
              {{ lastAction ?? k("demo.none") }}
            </Badge>
          </div>
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.asChild.title')"
        :description="k('examples.asChild.desc')"
        :code="asChildCode"
      >
        <Menu>
          <Menu.Trigger as-child>
            <PressButton
              variant="ghost"
              :icon="EllipsisHorizontalIcon"
              :aria-label="k('demo.moreActions')"
            />
          </Menu.Trigger>
          <Menu.Content align="end">
            <Menu.Item :icon="ShareIcon" shortcut="S">
              {{ k("demo.share") }}
            </Menu.Item>
            <Menu.Item :icon="DocumentDuplicateIcon" shortcut="D">
              {{ k("demo.duplicate") }}
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.danger.title')"
        :description="k('examples.danger.desc')"
        :code="dangerCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Menu>
            <Menu.Trigger>{{ k("demo.danger.project") }}</Menu.Trigger>
            <Menu.Content>
              <Menu.Item :icon="PencilSquareIcon">
                {{ k("demo.danger.rename") }}
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item :icon="TrashIcon" shortcut="⌫" color="danger">
                {{ k("demo.danger.deleteProject") }}
              </Menu.Item>
            </Menu.Content>
          </Menu>
          <Menu color="danger">
            <Menu.Trigger>{{ k("demo.danger.zone") }}</Menu.Trigger>
            <Menu.Content>
              <Menu.Item :icon="ArchiveBoxIcon">
                {{ k("demo.danger.archiveAll") }}
              </Menu.Item>
              <Menu.Item :icon="TrashIcon">
                {{ k("demo.danger.deleteAll") }}
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.surface.title')"
        :description="k('examples.surface.desc')"
        :code="surfaceCode"
      >
        <Menu color="primary">
          <Menu.Trigger variant="normal">{{ k("demo.workspace") }}</Menu.Trigger>
          <Menu.Content surface="trigger">
            <Menu.Label>{{ k("demo.workspace") }}</Menu.Label>
            <Menu.Item :icon="ShareIcon" shortcut="S">
              {{ k("demo.share") }}
            </Menu.Item>
            <Menu.Item :icon="DocumentDuplicateIcon" shortcut="D">
              {{ k("demo.duplicate") }}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item :icon="ArchiveBoxIcon" shortcut="A">
              {{ k("demo.archiveShort") }}
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.placement.title')"
        :description="k('examples.placement.desc')"
        :code="placementCode"
      >
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Menu v-for="align in aligns" :key="align">
            <Menu.Trigger>
              {{ t("pages.navigation.menu.demo.alignTrigger", { align }) }}
            </Menu.Trigger>
            <Menu.Content side="bottom" :align="align">
              <Menu.Item :icon="PencilSquareIcon">{{ k("demo.edit") }}</Menu.Item>
              <Menu.Item :icon="ShareIcon">{{ k("demo.share") }}</Menu.Item>
            </Menu.Content>
          </Menu>
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
