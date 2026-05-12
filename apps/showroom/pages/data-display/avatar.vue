<script setup lang="ts">
import { ref, computed } from "vue";
import { Avatar, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc } from "~/types/component-doc";
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


useSeoMeta({
  title: () => t("pages.dataDisplay.avatar.title"),
  description: () => t("pages.dataDisplay.avatar.description"),
  ogTitle: () => `${t("pages.dataDisplay.avatar.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.avatar.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.avatar.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.avatar.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.avatar.a11y.ariaLabel"),
  },
  {
    attribute: "role",
    value: '"img"',
    desc: t("pages.data-display.avatar.a11y.ariaImg"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.avatar.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize = ref<"xs" | "small" | "medium" | "large" | "xl">("medium");
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("full");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgMode = ref<"image" | "initials" | "icon">("image");
const pgBordered = ref(false);
const pgStatus = ref<"" | "online" | "offline" | "away" | "busy">("");

function resetPlayground() {
  pgSize.value = "medium";
  pgRadius.value = "full";
  pgColor.value = "primary";
  pgMode.value = "image";
  pgBordered.value = false;
  pgStatus.value = "";
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const typesCode = `export interface Avatar {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  status?: 'online' | 'offline' | 'away' | 'busy';
  bordered?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  ariaLabel?: string;
  skeleton?: boolean;
}`;

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value !== "full") parts.push(`radius="${pgRadius.value}"`);
  if (
    (pgMode.value === "initials" || pgMode.value === "icon") &&
    pgColor.value !== "default"
  )
    parts.push(`color="${pgColor.value}"`);
  if (pgBordered.value) parts.push(':bordered="true"');
  if (pgStatus.value) parts.push(`status="${pgStatus.value}"`);
  if (pgMode.value === "image")
    parts.push('src="https://i.pravatar.cc/80?img=12"');
  if (pgMode.value === "initials") parts.push('initials="AP"');
  return `<Avatar ${parts.join(" ")} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const imageCode = `<script setup lang="ts">
import { Avatar } from 'mood-ui';
<\/script>

<template>
  <Avatar src="https://i.pravatar.cc/80?img=1" />
  <Avatar src="https://i.pravatar.cc/80?img=2" />
  <Avatar src="https://i.pravatar.cc/80?img=3" />
</template>`;

const initialsCode = `<script setup lang="ts">
import { Avatar } from 'mood-ui';
<\/script>

<template>
  <Avatar initials="AP" color="primary" />
  <Avatar initials="MR" color="success" />
  <Avatar initials="JS" color="warning" />
  <Avatar initials="NK" color="danger"  />
</template>`;

const iconCode = `<script setup lang="ts">
import { Avatar } from 'mood-ui';
<\/script>

<template>
  <Avatar />
  <Avatar color="primary" />
  <Avatar color="success" />
  <Avatar color="danger"  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Avatar } from 'mood-ui';
<\/script>

<template>
  <Avatar src="https://i.pravatar.cc/80?img=4" size="xs"     />
  <Avatar src="https://i.pravatar.cc/80?img=4" size="small"  />
  <Avatar src="https://i.pravatar.cc/80?img=4" size="medium" />
  <Avatar src="https://i.pravatar.cc/80?img=4" size="large"  />
  <Avatar src="https://i.pravatar.cc/80?img=4" size="xl"     />
</template>`;

const statusCode = `<script setup lang="ts">
import { Avatar } from 'mood-ui';
<\/script>

<template>
  <Avatar src="https://i.pravatar.cc/80?img=5" status="online"  />
  <Avatar src="https://i.pravatar.cc/80?img=6" status="busy"    />
  <Avatar src="https://i.pravatar.cc/80?img=7" status="away"    />
  <Avatar src="https://i.pravatar.cc/80?img=8" status="offline" />
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "src",
    type: "string",
    description: t("pages.data-display.avatar.props.src"),
  },
  {
    name: "alt",
    type: "string",
    description: t("pages.data-display.avatar.props.alt"),
  },
  {
    name: "initials",
    type: "string",
    description: t("pages.data-display.avatar.props.initials"),
  },
  {
    name: "size",
    type: "'xs' | 'small' | 'medium' | 'large' | 'xl'",
    default: "'medium'",
    description: t("pages.data-display.avatar.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.avatar.props.radius"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.data-display.avatar.props.color"),
  },
  {
    name: "status",
    type: "'online' | 'offline' | 'away' | 'busy'",
    description: t("pages.data-display.avatar.props.status"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.avatar.props.bordered"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.data-display.avatar.props.ariaLabel"),
  },
  {
    name: "skeleton",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.avatar.props.skeleton"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.avatar.title')"
    category="Data Display"
    import-path="import { Avatar } from 'mood-ui'"
    :description="t('pages.data-display.avatar.description')"
    :props-list="propsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.data-display.avatar.controls.mode')"
            :options="[
              { value: 'image' },
              { value: 'initials' },
              { value: 'icon' },
            ]"
            v-model="pgMode"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.avatar.controls.size')"
            :options="[
              { value: 'xs' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'xl' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.avatar.controls.radius')"
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
          <TbDots
            :label="t('pages.data-display.avatar.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.avatar.controls.status')"
            :options="[
              { value: '', label: 'none' },
              { value: 'online' },
              { value: 'offline' },
              { value: 'away' },
              { value: 'busy' },
            ]"
            v-model="pgStatus"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.data-display.avatar.controls.bordered')"
            v-model="pgBordered"
          />
        </template>

        <Avatar
          v-if="pgMode === 'image'"
          src="https://i.pravatar.cc/80?img=12"
          :size="pgSize"
          :radius="pgRadius"
          :bordered="pgBordered"
          :status="pgStatus || undefined"
        />
        <Avatar
          v-else-if="pgMode === 'initials'"
          initials="AP"
          :size="pgSize"
          :radius="pgRadius"
          :color="pgColor"
          :bordered="pgBordered"
          :status="pgStatus || undefined"
        />
        <Avatar
          v-else
          :size="pgSize"
          :radius="pgRadius"
          :color="pgColor"
          :bordered="pgBordered"
          :status="pgStatus || undefined"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.avatar.examples.image.title')"
        :description="t('pages.data-display.avatar.examples.image.desc')"
        :code="imageCode"
      >
        <Avatar src="https://i.pravatar.cc/80?img=1" />
        <Avatar src="https://i.pravatar.cc/80?img=2" />
        <Avatar src="https://i.pravatar.cc/80?img=3" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatar.examples.initials.title')"
        :description="t('pages.data-display.avatar.examples.initials.desc')"
        :code="initialsCode"
      >
        <Avatar initials="AP" color="primary" />
        <Avatar initials="MR" color="success" />
        <Avatar initials="JS" color="warning" />
        <Avatar initials="NK" color="danger" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatar.examples.iconFallback.title')"
        :description="t('pages.data-display.avatar.examples.iconFallback.desc')"
        :code="iconCode"
      >
        <Avatar />
        <Avatar color="primary" />
        <Avatar color="success" />
        <Avatar color="danger" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatar.examples.sizes.title')"
        :description="t('pages.data-display.avatar.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Avatar src="https://i.pravatar.cc/80?img=4" size="xs" />
        <Avatar src="https://i.pravatar.cc/80?img=4" size="small" />
        <Avatar src="https://i.pravatar.cc/80?img=4" size="medium" />
        <Avatar src="https://i.pravatar.cc/80?img=4" size="large" />
        <Avatar src="https://i.pravatar.cc/80?img=4" size="xl" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatar.examples.status.title')"
        :description="t('pages.data-display.avatar.examples.status.desc')"
        :code="statusCode"
      >
        <Avatar src="https://i.pravatar.cc/80?img=5" status="online" />
        <Avatar src="https://i.pravatar.cc/80?img=6" status="busy" />
        <Avatar src="https://i.pravatar.cc/80?img=7" status="away" />
        <Avatar src="https://i.pravatar.cc/80?img=8" status="offline" />
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
        {{ t("pages.data-display.avatar.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.avatar.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
