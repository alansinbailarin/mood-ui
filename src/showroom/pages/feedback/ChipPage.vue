<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Chip from "../../../components/feedback/Chip.vue";
import Avatar from "../../../components/data-display/avatar/Avatar.vue";
import {
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.chip.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.chip.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.feedback.chip.a11y.ariaLabel"),
  },
  {
    attribute: "aria-hidden",
    value: "true",
    desc: t("pages.feedback.chip.a11y.ariaHidden"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.chip.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"solid" | "subtle" | "outline">("solid");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "danger",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgDot = ref(false);

function resetPlayground() {
  pgVariant.value = "solid";
  pgColor.value = "danger";
  pgSize.value = "medium";
  pgDot.value = false;
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

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "solid") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "danger") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgDot.value) parts.push("dot");
  else parts.push(':content="3"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Chip${attrs}>
  <BellIcon class="w-7 h-7" />
</Chip>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const counterCode = `<script setup lang="ts">
import { Chip } from 'mood-ui';
import { BellIcon, EnvelopeIcon, ChatBubbleLeftIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Chip :content="3"  color="danger"  placement="top-right">
    <BellIcon class="w-7 h-7" />
  </Chip>
  <Chip :content="12" color="primary" placement="top-right">
    <EnvelopeIcon class="w-7 h-7" />
  </Chip>
  <Chip :content="125" :max="99" color="primary" placement="top-right">
    <ChatBubbleLeftIcon class="w-7 h-7" />
  </Chip>
</template>`;

const dotCode = `<script setup lang="ts">
import { Chip } from 'mood-ui';
import { Avatar } from 'mood-ui';
<\/script>

<template>
  <Chip dot color="success" placement="bottom-right">
    <Avatar src="https://i.pravatar.cc/40?img=1" />
  </Chip>
  <Chip dot color="warning" placement="bottom-right">
    <Avatar src="https://i.pravatar.cc/40?img=2" />
  </Chip>
  <Chip dot color="danger" placement="bottom-right">
    <Avatar src="https://i.pravatar.cc/40?img=3" />
  </Chip>
</template>`;

const variantsCode = `<script setup lang="ts">
import { Chip } from 'mood-ui';
import { BellIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Chip :content="5" variant="solid"   color="primary"><BellIcon class="w-6 h-6" /></Chip>
  <Chip :content="5" variant="subtle"  color="primary"><BellIcon class="w-6 h-6" /></Chip>
  <Chip :content="5" variant="outline" color="primary"><BellIcon class="w-6 h-6" /></Chip>
</template>`;

const inlineCode = `<script setup lang="ts">
import { Chip } from 'mood-ui';
<\/script>

<template>
  <Chip content="New" color="primary" variant="subtle" />
  <Chip content="Beta"  color="warning" variant="outline" />
  <Chip :content="42"      color="success" variant="solid" />
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const typesCode = `export type ChipPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Chip {
  content?: string | number;
  dot?: boolean;
  max?: number;
  invisible?: boolean;
  showZero?: boolean;
  variant?: 'solid' | 'outline' | 'subtle';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  placement?: ChipPlacement;
  icon?: Component;
  ariaLabel?: string;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "content",
    type: "string | number",
    description: t("pages.feedback.chip.props.content"),
  },
  {
    name: "dot",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.chip.props.dot"),
  },
  {
    name: "max",
    type: "number",
    default: "99",
    description: t("pages.feedback.chip.props.max"),
  },
  {
    name: "invisible",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.chip.props.invisible"),
  },
  {
    name: "showZero",
    type: "boolean",
    default: "false",
    description: t("pages.feedback.chip.props.showZero"),
  },
  {
    name: "variant",
    type: "'solid' | 'subtle' | 'outline'",
    default: "'solid'",
    description: t("pages.feedback.chip.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'danger'",
    description: t("pages.feedback.chip.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    description: t("pages.feedback.chip.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.chip.props.radius"),
  },
  {
    name: "placement",
    type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
    default: "'top-right'",
    description: t("pages.feedback.chip.props.placement"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.feedback.chip.props.icon"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.feedback.chip.props.ariaLabel"),
  },
]);

const emitsList: EmitDoc[] = [];

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.feedback.chip.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.chip.title')"
    category="Feedback"
    import-path="import { Chip } from 'mood-ui'"
    :description="t('pages.feedback.chip.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.chip.controls.variant')"
            :options="[
              { value: 'solid' },
              { value: 'subtle' },
              { value: 'outline' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots
            :label="t('pages.feedback.chip.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.chip.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.feedback.chip.controls.dot')"
            v-model="pgDot"
          />
        </template>

        <Chip
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :dot="pgDot"
          :content="pgDot ? undefined : 3"
          placement="top-right"
        >
          <BellIcon class="w-7 h-7" />
        </Chip>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.chip.examples.counter.title')"
        :description="t('pages.feedback.chip.examples.counter.desc')"
        :code="counterCode"
      >
        <Chip :content="3" color="danger" placement="top-right">
          <BellIcon class="w-7 h-7" />
        </Chip>
        <Chip :content="12" color="primary" placement="top-right">
          <EnvelopeIcon class="w-7 h-7" />
        </Chip>
        <Chip :content="125" :max="99" color="primary" placement="top-right">
          <ChatBubbleLeftIcon class="w-7 h-7" />
        </Chip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.chip.examples.dot.title')"
        :description="t('pages.feedback.chip.examples.dot.desc')"
        :code="dotCode"
      >
        <Chip dot color="success" placement="bottom-right">
          <Avatar src="https://i.pravatar.cc/40?img=1" />
        </Chip>
        <Chip dot color="warning" placement="bottom-right">
          <Avatar src="https://i.pravatar.cc/40?img=2" />
        </Chip>
        <Chip dot color="danger" placement="bottom-right">
          <Avatar src="https://i.pravatar.cc/40?img=3" />
        </Chip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.chip.examples.variants.title')"
        :description="t('pages.feedback.chip.examples.variants.desc')"
        :code="variantsCode"
      >
        <Chip :content="5" variant="solid" color="primary"
          ><BellIcon class="w-6 h-6"
        /></Chip>
        <Chip :content="5" variant="subtle" color="primary"
          ><BellIcon class="w-6 h-6"
        /></Chip>
        <Chip :content="5" variant="outline" color="primary"
          ><BellIcon class="w-6 h-6"
        /></Chip>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.chip.examples.inline.title')"
        :description="t('pages.feedback.chip.examples.inline.desc')"
        :code="inlineCode"
      >
        <Chip :content="'Nuevo'" color="primary" variant="subtle" />
        <Chip :content="'Beta'" color="warning" variant="outline" />
        <Chip :content="42" color="success" variant="solid" />
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
        {{ t("pages.feedback.chip.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.chip.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
