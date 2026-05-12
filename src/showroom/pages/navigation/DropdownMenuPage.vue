<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import DropdownMenu from "../../../components/navigation/DropdownMenu.vue";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import {
  PencilSquareIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";
import type { DropdownMenuEntry } from "../../../interfaces/navigation/DropdownMenu.interface";
import type { PropDoc, EmitDoc, SlotDoc } from "../../types";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.navigation.dropdownMenu.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.navigation.dropdownMenu.a11y.kbShiftTab"),
  },
  { keys: ["Enter"], action: t("pages.navigation.dropdownMenu.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.navigation.dropdownMenu.a11y.kbEsc") },
  { keys: ["↑", "↓"], action: t("pages.navigation.dropdownMenu.a11y.kbArrow") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.navigation.dropdownMenu.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.navigation.dropdownMenu.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.navigation.dropdownMenu.a11y.focusTrigger"),
  t("pages.navigation.dropdownMenu.a11y.focusTrap"),
]);

const pgPlacement = ref<
  "bottom-start" | "bottom-end" | "top-start" | "top-end"
>("bottom-start");
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgTriggerVariant = ref<"normal" | "outline" | "ghost" | "text">(
  "outline",
);
const pgDisabled = ref(false);

function resetPlayground() {
  pgPlacement.value = "bottom-start";
  pgSize.value = "medium";
  pgTriggerVariant.value = "outline";
  pgDisabled.value = false;
}

const playgroundItems = computed<DropdownMenuEntry[]>(() => [
  {
    id: "edit",
    label: t("pages.navigation.dropdownMenu.items.edit"),
    icon: PencilSquareIcon,
  },
  {
    id: "dup",
    label: t("pages.navigation.dropdownMenu.items.duplicate"),
    icon: DocumentDuplicateIcon,
  },
  {
    id: "export",
    label: t("pages.navigation.dropdownMenu.items.export"),
    icon: ArrowDownTrayIcon,
  },
]);

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgPlacement.value !== "bottom-start")
    parts.push(`placement="${pgPlacement.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgTriggerVariant.value !== "outline")
    parts.push(`trigger-variant="${pgTriggerVariant.value}"`);
  if (pgDisabled.value) parts.push("disabled");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<DropdownMenu trigger-label="${t("pages.navigation.dropdownMenu.trigger.actions")}" :items="items"${attrs} />`;
});

const basicItems = computed<DropdownMenuEntry[]>(() => [
  { id: "edit", label: t("pages.navigation.dropdownMenu.items.edit") },
  { id: "dup", label: t("pages.navigation.dropdownMenu.items.duplicate") },
  { id: "export", label: t("pages.navigation.dropdownMenu.items.export") },
]);

const iconItems = computed<DropdownMenuEntry[]>(() => [
  {
    id: "edit",
    label: t("pages.navigation.dropdownMenu.items.edit"),
    icon: PencilSquareIcon,
    shortcut: "⌘E",
  },
  {
    id: "dup",
    label: t("pages.navigation.dropdownMenu.items.duplicate"),
    icon: DocumentDuplicateIcon,
    shortcut: "⌘D",
  },
  {
    id: "export",
    label: t("pages.navigation.dropdownMenu.items.export"),
    icon: ArrowDownTrayIcon,
    description: t("pages.navigation.dropdownMenu.items.exportDesc"),
  },
]);

const dividerItems = computed<DropdownMenuEntry[]>(() => [
  {
    type: "header",
    label: t("pages.navigation.dropdownMenu.items.actionsHeader"),
  },
  {
    id: "edit",
    label: t("pages.navigation.dropdownMenu.items.edit"),
    icon: PencilSquareIcon,
  },
  {
    id: "dup",
    label: t("pages.navigation.dropdownMenu.items.duplicate"),
    icon: DocumentDuplicateIcon,
  },
  { type: "divider" },
  {
    id: "open",
    label: t("pages.navigation.dropdownMenu.items.openTab"),
    icon: ArrowTopRightOnSquareIcon,
    href: "#",
    external: true,
  },
]);

const userMenuItems = computed<DropdownMenuEntry[]>(() => [
  { type: "header", label: t("pages.navigation.dropdownMenu.items.userEmail") },
  {
    id: "profile",
    label: t("pages.navigation.dropdownMenu.items.profile"),
    icon: UserIcon,
  },
  {
    id: "settings",
    label: t("pages.navigation.dropdownMenu.items.preferences"),
    icon: Cog6ToothIcon,
  },
  { type: "divider" },
  {
    id: "logout",
    label: t("pages.navigation.dropdownMenu.items.logout"),
    icon: ArrowRightOnRectangleIcon,
  },
]);

const dangerItems = computed<DropdownMenuEntry[]>(() => [
  {
    id: "edit",
    label: t("pages.navigation.dropdownMenu.items.edit"),
    icon: PencilSquareIcon,
  },
  {
    id: "dup",
    label: t("pages.navigation.dropdownMenu.items.duplicate"),
    icon: DocumentDuplicateIcon,
  },
  { type: "divider" },
  {
    id: "delete",
    label: t("pages.navigation.dropdownMenu.items.delete"),
    icon: TrashIcon,
    danger: true,
    shortcut: "⌫",
  },
]);

const basicCode = `<script setup lang="ts">
import { DropdownMenu } from 'mood-ui';

const items = [
  { id: 'edit',   label: 'Edit' },
  { id: 'dup',    label: 'Duplicate' },
  { id: 'export', label: 'Export' },
];
<\/script>

<template>
  <DropdownMenu trigger-label="Actions" :items="items" />
</template>`;

const iconsCode = `<script setup lang="ts">
import { DropdownMenu } from 'mood-ui';
import { PencilSquareIcon, DocumentDuplicateIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline';

const items = [
  { id: 'edit',   label: 'Edit',      icon: PencilSquareIcon, shortcut: '⌘E' },
  { id: 'dup',    label: 'Duplicate', icon: DocumentDuplicateIcon, shortcut: '⌘D' },
  { id: 'export', label: 'Export',    icon: ArrowDownTrayIcon, description: 'Download as PDF' },
];
<\/script>

<template>
  <DropdownMenu trigger-label="Actions" :items="items" />
</template>`;

const dividersCode = `<script setup lang="ts">
import { DropdownMenu } from 'mood-ui';
import { PencilSquareIcon, DocumentDuplicateIcon, ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline';

const items = [
  { type: 'header', label: 'Actions' },
  { id: 'edit',   label: 'Edit',      icon: PencilSquareIcon },
  { id: 'dup',    label: 'Duplicate', icon: DocumentDuplicateIcon },
  { type: 'divider' },
  { id: 'open',   label: 'Open in new tab', icon: ArrowTopRightOnSquareIcon, href: '#', external: true },
];
<\/script>

<template>
  <DropdownMenu trigger-label="More" :items="items" />
</template>`;

const userMenuCode = `<script setup lang="ts">
import { DropdownMenu } from 'mood-ui';
import { UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';

const items = [
  { type: 'header', label: 'jane@example.com' },
  { id: 'profile',  label: 'Profile',     icon: UserIcon },
  { id: 'settings', label: 'Preferences', icon: Cog6ToothIcon },
  { type: 'divider' },
  { id: 'logout',   label: 'Log out',     icon: ArrowRightOnRectangleIcon },
];
<\/script>

<template>
  <DropdownMenu trigger-label="User" :items="items" trigger-variant="ghost" />
</template>`;

const dangerCode = `<script setup lang="ts">
import { DropdownMenu } from 'mood-ui';
import { PencilSquareIcon, DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline';

const items = [
  { id: 'edit',   label: 'Edit',      icon: PencilSquareIcon },
  { id: 'dup',    label: 'Duplicate', icon: DocumentDuplicateIcon },
  { type: 'divider' },
  { id: 'delete', label: 'Delete',    icon: TrashIcon, danger: true, shortcut: '⌫' },
];
<\/script>

<template>
  <DropdownMenu trigger-label="Actions" :items="items" />
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "items",
    type: "DropdownMenuEntry[]",
    required: true,
    description: t("pages.navigation.dropdownMenu.props.items"),
  },
  {
    name: "triggerLabel",
    type: "string",
    description: t("pages.navigation.dropdownMenu.props.triggerLabel"),
  },
  {
    name: "triggerIcon",
    type: "Component",
    description: t("pages.navigation.dropdownMenu.props.triggerIcon"),
  },
  {
    name: "triggerVariant",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'outline'",
    description: t("pages.navigation.dropdownMenu.props.triggerVariant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.navigation.dropdownMenu.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.navigation.dropdownMenu.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.navigation.dropdownMenu.props.radius"),
  },
  {
    name: "showChevron",
    type: "boolean",
    default: "true",
    description: t("pages.navigation.dropdownMenu.props.showChevron"),
  },
  {
    name: "placement",
    type: "'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center'",
    default: "'bottom-start'",
    description: t("pages.navigation.dropdownMenu.props.placement"),
  },
  {
    name: "matchTriggerWidth",
    type: "boolean",
    default: "false",
    description: t("pages.navigation.dropdownMenu.props.matchTriggerWidth"),
  },
  {
    name: "minWidth",
    type: "string",
    default: "'12rem'",
    description: t("pages.navigation.dropdownMenu.props.minWidth"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.navigation.dropdownMenu.props.disabled"),
  },
  {
    name: "closeOnSelect",
    type: "boolean",
    default: "true",
    description: t("pages.navigation.dropdownMenu.props.closeOnSelect"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.navigation.dropdownMenu.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:open",
    payload: "boolean",
    description: t("pages.navigation.dropdownMenu.emits.updateOpen"),
  },
  {
    name: "select",
    payload: "DropdownMenuItem",
    description: t("pages.navigation.dropdownMenu.emits.select"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.navigation.dropdownMenu.slots.default"),
  },
  {
    name: "trigger",
    description: t("pages.navigation.dropdownMenu.slots.trigger"),
  },
]);

const typesCode = `export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: Component;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  href?: string;
  to?: string | Record<string, unknown>;
  external?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuDivider {
  type: 'divider';
}

export interface DropdownMenuHeader {
  type: 'header';
  label: string;
}

export type DropdownMenuEntry = DropdownMenuItem | DropdownMenuDivider | DropdownMenuHeader;

export interface DropdownMenu {
  triggerLabel?: string;
  triggerIcon?: Component;
  items?: DropdownMenuEntry[];
  placement?: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
  offset?: number;
  shift?: boolean;
  flip?: boolean;
  autoUpdate?: boolean;
  autoPlacement?: boolean;
  triggerClass?: string;
  disabled?: boolean;
  openOnHover?: boolean;
  menuClass?: string;
  role?: string;
  labelledBy?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.navigation.dropdownMenu.title')"
    :category="t('pages.navigation.dropdownMenu.category')"
    import-path="import { DropdownMenu } from 'mood-ui'"
    :description="t('pages.navigation.dropdownMenu.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="260px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Placement"
            :options="[
              { value: 'bottom-start', label: '↙ start' },
              { value: 'bottom-end', label: '↘ end' },
              { value: 'top-start', label: '↖ top-start' },
              { value: 'top-end', label: '↗ top-end' },
            ]"
            v-model="pgPlacement"
          />
          <TbSep />
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
            label="Trigger"
            :options="[
              { value: 'normal' },
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'text' },
            ]"
            v-model="pgTriggerVariant"
          />
          <TbSep />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <DropdownMenu
          :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')"
          :items="playgroundItems"
          :placement="pgPlacement"
          :size="pgSize"
          :trigger-variant="pgTriggerVariant"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.navigation.dropdownMenu.examples.basic.title')"
        :description="t('pages.navigation.dropdownMenu.examples.basic.desc')"
        :code="basicCode"
        min-height="220px"
      >
        <DropdownMenu
          :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')"
          :items="basicItems"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.dropdownMenu.examples.icons.title')"
        :description="t('pages.navigation.dropdownMenu.examples.icons.desc')"
        :code="iconsCode"
        min-height="240px"
      >
        <DropdownMenu
          :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')"
          :items="iconItems"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.dropdownMenu.examples.dividers.title')"
        :description="t('pages.navigation.dropdownMenu.examples.dividers.desc')"
        :code="dividersCode"
        min-height="260px"
      >
        <DropdownMenu
          :trigger-label="t('pages.navigation.dropdownMenu.trigger.more')"
          :items="dividerItems"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.dropdownMenu.examples.user.title')"
        :description="t('pages.navigation.dropdownMenu.examples.user.desc')"
        :code="userMenuCode"
        min-height="280px"
      >
        <DropdownMenu
          :trigger-label="t('pages.navigation.dropdownMenu.items.userEmail')"
          :items="userMenuItems"
          trigger-variant="ghost"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.dropdownMenu.examples.danger.title')"
        :description="t('pages.navigation.dropdownMenu.examples.danger.desc')"
        :code="dangerCode"
        min-height="240px"
      >
        <DropdownMenu
          :trigger-label="t('pages.navigation.dropdownMenu.trigger.actions')"
          :items="dangerItems"
        />
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
        {{ t("pages.navigation.dropdownMenu.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.navigation.dropdownMenu.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
