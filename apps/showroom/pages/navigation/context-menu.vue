<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Badge, ContextMenu, SurfaceCard, Typography } from "mood-ui";
import {
  DocumentDuplicateIcon,
  FolderPlusIcon,
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

const k = (key: string) => t(`pages.navigation.contextMenu.${key}`);

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  {
    keys: ["ArrowDown", "ArrowUp", "Home", "End"],
    action: k("a11y.kbArrows"),
  },
  { keys: ["A–Z"], action: k("a11y.kbTypeahead") },
  { keys: ["N", "⌫"], action: k("a11y.kbShortcuts") },
  { keys: ["Escape", "Tab"], action: k("a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"menu" / "menuitem" / "separator"',
    desc: k("a11y.ariaMenu"),
  },
  {
    attribute: "aria-disabled",
    value: '"true"',
    desc: k("a11y.ariaDisabled"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  k("a11y.focusOpen"),
  k("a11y.focusKeyboard"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

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
const pgShortcuts = ref(true);
const pgIcons = ref(true);
const lastAction = ref<string | null>(null);

function resetPlayground() {
  pgColor.value = "default";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgShortcuts.value = true;
  pgIcons.value = true;
  lastAction.value = null;
}

const overviewCode = computed(() => {
  const root: string[] = [];
  if (pgColor.value !== "default") root.push(`color="${pgColor.value}"`);
  if (pgSize.value) root.push(`size="${pgSize.value}"`);
  if (pgRadius.value) root.push(`radius="${pgRadius.value}"`);
  const a = (list: string[]) => (list.length ? " " + list.join(" ") : "");
  const item = (icon: string, shortcut: string, extra = "") => {
    const parts: string[] = [];
    if (pgIcons.value) parts.push(`:icon="${icon}"`);
    if (pgShortcuts.value) parts.push(`shortcut="${shortcut}"`);
    if (extra) parts.push(extra);
    return a(parts);
  };

  return `<ContextMenu${a(root)}>
  <ContextMenu.Trigger>
    <SurfaceCard variant="elevated" class="w-80">
      <SurfaceCard.Header as="hgroup">
        <SurfaceCard.Title>${k("demo.cardTitle")}</SurfaceCard.Title>
        <SurfaceCard.Subtitle>${k("demo.cardSubtitle")}</SurfaceCard.Subtitle>
      </SurfaceCard.Header>
    </SurfaceCard>
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Label>${k("demo.label")}</ContextMenu.Label>
    <ContextMenu.Item${item("FolderPlusIcon", "N")}>${k("demo.newFolder")}</ContextMenu.Item>
    <ContextMenu.Item${item("PencilSquareIcon", "E")}>${k("demo.rename")}</ContextMenu.Item>
    <ContextMenu.Item${item("DocumentDuplicateIcon", "D")}>${k("demo.duplicate")}</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item${item("TrashIcon", "⌫", 'color="danger"')}>${k("demo.delete")}</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const files = ["Design Tokens.fig", "Release Plan.md"];
const controlledOpen = ref(false);

// ── Example code ──────────────────────────────────────────────────────────────
const cardsCode = `<script setup lang="ts">
import { ContextMenu, SurfaceCard } from 'mood-ui';
import { PencilSquareIcon, ShareIcon, TrashIcon } from '@heroicons/vue/20/solid';

const files = ['Design Tokens.fig', 'Release Plan.md'];
<\/script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <ContextMenu v-for="file in files" :key="file">
      <ContextMenu.Trigger>
        <SurfaceCard variant="elevated">
          <SurfaceCard.Header as="hgroup">
            <SurfaceCard.Title>{{ file }}</SurfaceCard.Title>
            <SurfaceCard.Subtitle>Right-click for file actions</SurfaceCard.Subtitle>
          </SurfaceCard.Header>
        </SurfaceCard>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>{{ file }}</ContextMenu.Label>
        <ContextMenu.Item :icon="PencilSquareIcon" shortcut="R">Rename</ContextMenu.Item>
        <ContextMenu.Item :icon="ShareIcon" shortcut="S">Copy share link</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item :icon="TrashIcon" shortcut="⌫" color="danger">
          Move to trash
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  </div>
</template>`;

const controlledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { ContextMenu } from 'mood-ui';

const open = ref(false);
<\/script>

<template>
  <ContextMenu v-model:open="open" @open-change="(value) => console.log(value)">
    <ContextMenu.Trigger>
      <div class="rounded-lg border border-dashed p-8">Right-click here</div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item>Paste</ContextMenu.Item>
      <ContextMenu.Item disabled>Paste as plain text</ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu>
  <span>{{ open ? 'Open' : 'Closed' }}</span>
</template>`;

const typesCode = `import type { Component } from 'vue';
import type { ModoColor, ModoRadius, ModoSize } from 'mood-ui';

export interface ContextMenuProps {
  open?: boolean;          // v-model:open
  modelValue?: boolean;    // v-model
  color?: ModoColor;       // default 'default'; 'danger' tints every item
  radius?: ModoRadius;     // inherits ModoProvider
  size?: ModoSize;         // inherits ModoProvider
}

// ContextMenu.Content / Item / Label / Separator are the same parts as Menu.
export interface MenuContentProps {
  radius?: ModoRadius;     // overrides ContextMenu
  size?: ModoSize;         // overrides ContextMenu
}

export interface MenuItemProps {
  icon?: Component;
  shortcut?: string;
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
    name: "radius / size (ContextMenu.Content)",
    type: "ModoRadius / ModoSize",
    description: k("props.contentOverrides"),
  },
  {
    name: "icon (ContextMenu.Item)",
    type: "Component",
    description: k("props.icon"),
  },
  {
    name: "shortcut (ContextMenu.Item)",
    type: "string",
    description: k("props.shortcut"),
  },
  {
    name: "color (ContextMenu.Item)",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    description: k("props.itemColor"),
  },
  {
    name: "disabled (ContextMenu.Item)",
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
  {
    name: "select (ContextMenu.Item)",
    payload: "—",
    description: k("emits.select"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    bindings: "{ open, phase, setOpen }",
    description: k("slots.default"),
  },
  { name: "default (ContextMenu.Trigger)", description: k("slots.trigger") },
  { name: "icon / shortcut (ContextMenu.Item)", description: k("slots.item") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    :description="k('description')"
    import-path="import { ContextMenu } from 'mood-ui'"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="260px"
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
          <TbToggle :label="k('controls.icons')" v-model="pgIcons" />
          <TbToggle :label="k('controls.shortcuts')" v-model="pgShortcuts" />
        </template>

        <div class="flex flex-col items-center gap-4">
          <ContextMenu :color="pgColor" :size="pgSize" :radius="pgRadius">
            <ContextMenu.Trigger>
              <SurfaceCard
                variant="elevated"
                class="w-80 cursor-context-menu select-none sm:w-96"
              >
                <SurfaceCard.Header as="hgroup">
                  <SurfaceCard.Title>{{ k("demo.cardTitle") }}</SurfaceCard.Title>
                  <SurfaceCard.Subtitle>
                    {{ k("demo.cardSubtitle") }}
                  </SurfaceCard.Subtitle>
                </SurfaceCard.Header>
                <SurfaceCard.Separator />
                <SurfaceCard.Footer align="between">
                  <span class="text-xs text-muted-foreground">
                    {{ k("demo.lastAction") }}
                  </span>
                  <Badge color="primary" variant="subtle">
                    {{ lastAction ?? k("demo.none") }}
                  </Badge>
                </SurfaceCard.Footer>
              </SurfaceCard>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Label>{{ k("demo.label") }}</ContextMenu.Label>
              <ContextMenu.Item
                :icon="pgIcons ? FolderPlusIcon : undefined"
                :shortcut="pgShortcuts ? 'N' : undefined"
                @select="lastAction = k('demo.newFolder')"
              >
                {{ k("demo.newFolder") }}
              </ContextMenu.Item>
              <ContextMenu.Item
                :icon="pgIcons ? PencilSquareIcon : undefined"
                :shortcut="pgShortcuts ? 'E' : undefined"
                @select="lastAction = k('demo.rename')"
              >
                {{ k("demo.rename") }}
              </ContextMenu.Item>
              <ContextMenu.Item
                :icon="pgIcons ? DocumentDuplicateIcon : undefined"
                :shortcut="pgShortcuts ? 'D' : undefined"
                @select="lastAction = k('demo.duplicate')"
              >
                {{ k("demo.duplicate") }}
              </ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item
                :icon="pgIcons ? TrashIcon : undefined"
                :shortcut="pgShortcuts ? '⌫' : undefined"
                color="danger"
                @select="lastAction = k('demo.delete')"
              >
                {{ k("demo.delete") }}
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.cards.title')"
        :description="k('examples.cards.desc')"
        :code="cardsCode"
      >
        <div class="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          <ContextMenu v-for="file in files" :key="file">
            <ContextMenu.Trigger>
              <SurfaceCard variant="elevated" class="select-none">
                <SurfaceCard.Header as="hgroup">
                  <SurfaceCard.Title>{{ file }}</SurfaceCard.Title>
                  <SurfaceCard.Subtitle>
                    {{ k("demo.fileHint") }}
                  </SurfaceCard.Subtitle>
                </SurfaceCard.Header>
              </SurfaceCard>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Label>{{ file }}</ContextMenu.Label>
              <ContextMenu.Item :icon="PencilSquareIcon" shortcut="R">
                {{ k("demo.rename") }}
              </ContextMenu.Item>
              <ContextMenu.Item :icon="ShareIcon" shortcut="S">
                {{ k("demo.copyLink") }}
              </ContextMenu.Item>
              <ContextMenu.Separator />
              <ContextMenu.Item :icon="TrashIcon" shortcut="⌫" color="danger">
                {{ k("demo.trash") }}
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.controlled.title')"
        :description="k('examples.controlled.desc')"
        :code="controlledCode"
      >
        <div class="flex flex-col items-center gap-3">
          <ContextMenu v-model:open="controlledOpen">
            <ContextMenu.Trigger>
              <div
                class="grid h-32 w-80 cursor-context-menu select-none place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground"
              >
                {{ k("demo.zone") }}
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item>{{ k("demo.paste") }}</ContextMenu.Item>
              <ContextMenu.Item disabled>{{ k("demo.pastePlain") }}</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu>
          <Badge :color="controlledOpen ? 'primary' : 'default'" variant="subtle">
            {{ controlledOpen ? k("demo.open") : k("demo.closed") }}
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
