<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Button from "../../../components/forms/Button.vue";
import { useToast } from "../../../composables/useToast";
import { SparklesIcon } from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbDots from "../../components/toolbar/TbDots.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.toastItem.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.feedback.toastItem.a11y.kbShiftTab"),
  },
  { keys: ["Escape"], action: t("pages.feedback.toastItem.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"status"',
    desc: t("pages.feedback.toastItem.a11y.ariaStatus"),
  },
  {
    attribute: "aria-live",
    value: "polite",
    desc: t("pages.feedback.toastItem.a11y.ariaLive"),
  },
  {
    attribute: "aria-atomic",
    value: "true",
    desc: t("pages.feedback.toastItem.a11y.ariaAtomic"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.toastItem.a11y.focusNative"),
  t("pages.feedback.toastItem.a11y.focusDismiss"),
]);

type Color = "info" | "success" | "warning" | "danger";
type Variant = "filled" | "subtle" | "outline";

const toast = useToast();

const pgColor = ref<Color>("info");
const pgVariant = ref<Variant>("subtle");

function resetPlayground() {
  pgColor.value = "info";
  pgVariant.value = "subtle";
}

const colorDots = [
  { value: "info" as const, bg: "var(--color-blue-500)", label: "Info" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

const overviewCode = computed(
  () => `import { useToast } from 'mood-ui';
const toast = useToast();
toast.push({
  title: 'Notification',
  description: 'Sample message',
  color: '${pgColor.value}',
  variant: '${pgVariant.value}',
});`,
);

function pushOverview() {
  toast.push({
    title: t("pages.feedback.toastItem.playground.title"),
    description: t("pages.feedback.toastItem.playground.description"),
    color: pgColor.value,
    variant: pgVariant.value,
  });
}

function pushColor(color: Color, label: string) {
  toast[color]({ title: label, description: `${color} toast message.` });
}

function pushAction() {
  toast.info({
    title: t("pages.feedback.toastItem.examples.action.toastTitle"),
    description: t("pages.feedback.toastItem.examples.action.toastDesc"),
    action: {
      label: t("pages.feedback.toastItem.examples.action.undo"),
      onClick: (close) => {
        toast.success({
          title: t("pages.feedback.toastItem.examples.action.restored"),
        });
        close();
      },
    },
  });
}

function pushIcon() {
  toast.success({
    title: t("pages.feedback.toastItem.examples.icon.toastTitle"),
    description: t("pages.feedback.toastItem.examples.icon.toastDesc"),
    icon: SparklesIcon,
  });
}

function pushPinned() {
  toast.warning({
    title: t("pages.feedback.toastItem.examples.pinned.toastTitle"),
    description: t("pages.feedback.toastItem.examples.pinned.toastDesc"),
    duration: 0,
  });
}

const colorsCode = `import { useToast } from 'mood-ui';
const toast = useToast();
toast.info({ title: 'Info' });
toast.success({ title: 'Success' });
toast.warning({ title: 'Warning' });
toast.danger({ title: 'Error' });`;

const actionCode = `import { useToast } from 'mood-ui';
const toast = useToast();
toast.info({
  title: 'File moved',
  description: 'It was sent to the trash.',
  action: {
    label: 'Undo',
    onClick: (close) => { /* restore(); */ close(); },
  },
});`;

const iconCode = `import { useToast } from 'mood-ui';
import { SparklesIcon } from '@heroicons/vue/24/outline';

const toast = useToast();
toast.success({
  title: 'Achievement unlocked',
  description: 'You completed the product tour.',
  icon: SparklesIcon,
});`;

const pinnedCode = `import { useToast } from 'mood-ui';
const toast = useToast();
// duration: 0 → toast persists until explicitly dismissed
toast.warning({
  title: 'Unstable connection',
  description: 'Retrying…',
  duration: 0,
});`;

const typesCode = `export type ToastColor = 'info' | 'success' | 'warning' | 'danger';
export type ToastVariant = 'filled' | 'subtle' | 'outline';
export type ToastPlacement = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick?: (close: () => void) => void;
  keepOpen?: boolean;
}

export interface ToastInput {
  title?: string;
  description?: string;
  color?: ToastColor;
  variant?: ToastVariant;
  icon?: Component;
  hideIcon?: boolean;
  duration?: number;
  action?: ToastAction;
  dismissable?: boolean;
  pauseOnHover?: boolean;
  id?: string | number;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  placement?: ToastPlacement;
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "title",
    type: "string",
    description: t("pages.feedback.toastItem.props.title"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.feedback.toastItem.props.description"),
  },
  {
    name: "color",
    type: "'info' | 'success' | 'warning' | 'danger'",
    default: "'info'",
    description: t("pages.feedback.toastItem.props.color"),
  },
  {
    name: "variant",
    type: "'filled' | 'subtle' | 'outline'",
    default: "'subtle'",
    description: t("pages.feedback.toastItem.props.variant"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.feedback.toastItem.props.icon"),
  },
  {
    name: "hideIcon",
    type: "boolean",
    description: t("pages.feedback.toastItem.props.hideIcon"),
  },
  {
    name: "duration",
    type: "number",
    default: "4500",
    description: t("pages.feedback.toastItem.props.duration"),
  },
  {
    name: "action",
    type: "{ label, onClick(close), keepOpen? }",
    description: t("pages.feedback.toastItem.props.action"),
  },
  {
    name: "dismissable",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.toastItem.props.dismissable"),
  },
  {
    name: "pauseOnHover",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.toastItem.props.pauseOnHover"),
  },
  {
    name: "id",
    type: "string | number",
    description: t("pages.feedback.toastItem.props.id"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.toastItem.props.radius"),
  },
  {
    name: "placement",
    type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'",
    description: t("pages.feedback.toastItem.props.placement"),
  },
]);

const emitsList: EmitDoc[] = [];
const slotsList: SlotDoc[] = [];
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.toastItem.title')"
    category="Feedback"
    import-path="import { useToast } from 'mood-ui'"
    :description="t('pages.feedback.toastItem.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
        lang="ts"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbDots
            :label="t('pages.feedback.toastItem.controls.color')"
            :options="colorDots"
            v-model="pgColor"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.toastItem.controls.variant')"
            :options="[
              { value: 'filled' },
              { value: 'subtle' },
              { value: 'outline' },
            ]"
            v-model="pgVariant"
          />
        </template>

        <Button color="primary" @click="pushOverview">{{
          t("pages.feedback.toastItem.playground.launch")
        }}</Button>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.toastItem.examples.colors.title')"
        :description="t('pages.feedback.toastItem.examples.colors.desc')"
        :code="colorsCode"
        min-height="160px"
      >
        <Button
          @click="
            pushColor(
              'info',
              t('pages.feedback.toastItem.examples.colors.info'),
            )
          "
          >info</Button
        >
        <Button
          color="success"
          @click="
            pushColor(
              'success',
              t('pages.feedback.toastItem.examples.colors.success'),
            )
          "
          >success</Button
        >
        <Button
          color="warning"
          @click="
            pushColor(
              'warning',
              t('pages.feedback.toastItem.examples.colors.warning'),
            )
          "
          >warning</Button
        >
        <Button
          color="danger"
          @click="
            pushColor(
              'danger',
              t('pages.feedback.toastItem.examples.colors.danger'),
            )
          "
          >danger</Button
        >
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toastItem.examples.action.title')"
        :description="t('pages.feedback.toastItem.examples.action.desc')"
        :code="actionCode"
        min-height="160px"
      >
        <Button @click="pushAction">{{
          t("pages.feedback.toastItem.examples.action.cta")
        }}</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toastItem.examples.icon.title')"
        :description="t('pages.feedback.toastItem.examples.icon.desc')"
        :code="iconCode"
        min-height="160px"
      >
        <Button color="success" @click="pushIcon">{{
          t("pages.feedback.toastItem.examples.icon.cta")
        }}</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toastItem.examples.pinned.title')"
        :description="t('pages.feedback.toastItem.examples.pinned.desc')"
        :code="pinnedCode"
        min-height="160px"
      >
        <Button color="warning" @click="pushPinned">{{
          t("pages.feedback.toastItem.examples.pinned.cta")
        }}</Button>
        <Button variant="outline" @click="toast.dismissAll()">{{
          t("pages.feedback.toastItem.examples.pinned.dismissAll")
        }}</Button>
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
        {{ t("pages.feedback.toastItem.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.toastItem.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
