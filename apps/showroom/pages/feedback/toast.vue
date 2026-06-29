<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, Typography, useToast } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";

import ComponentPreview from "~/components/ComponentPreview.vue";


import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.toast.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.feedback.toast.a11y.kbShiftTab") },
  { keys: ["Escape"], action: t("pages.feedback.toast.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"status"',
    desc: t("pages.feedback.toast.a11y.ariaStatus"),
  },
  {
    attribute: "aria-live",
    value: "polite",
    desc: t("pages.feedback.toast.a11y.ariaLive"),
  },
  {
    attribute: "aria-atomic",
    value: "true",
    desc: t("pages.feedback.toast.a11y.ariaAtomic"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.toast.a11y.focusNative"),
  t("pages.feedback.toast.a11y.focusDismiss"),
]);

type Placement =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

const toast = useToast();

const pgPlacement = ref<Placement>("top-right");

function resetPlayground() {
  pgPlacement.value = "top-right";
}

const overviewCode = computed(
  () => `<!-- Mount once near the root -->
<ToastContainer placement="${pgPlacement.value}" />

// From any component:
import { useToast } from 'mood-ui';
const toast = useToast();
toast.success({ title: 'Saved', description: 'Changes applied' });`,
);

const successCode = `import { useToast } from 'mood-ui';
const toast = useToast();
toast.success({ title: 'Saved', description: 'Changes applied' });`;

const errorCode = `import { useToast } from 'mood-ui';
const toast = useToast();
toast.danger({
  title: 'Network error',
  description: 'Could not reach the server.',
});`;

const infoCode = `import { useToast } from 'mood-ui';
const toast = useToast();
toast.info({
  title: 'Syncing',
  description: 'Applying latest changes…',
  duration: 0, // pinned until dismissed
});`;

const warningCode = `import { useToast } from 'mood-ui';
const toast = useToast();
toast.warning({
  title: 'Attention',
  description: 'Review the data before continuing.',
  action: { label: 'Review', onClick: (close) => { /* … */ close(); } },
});`;

const dismissAllCode = `import { useToast } from 'mood-ui';
const toast = useToast();

// Push several toasts…
toast.success({ title: 'Saved',   description: 'Draft saved.' });
toast.info({    title: 'Syncing', description: 'Fetching latest data…' });
toast.warning({ title: 'Slow connection', description: 'Response is taking longer than usual.' });

// …then clear them all at once
toast.dismissAll();`;

function pushSuccess() {
  toast.success({
    title: "Saved",
    description: "Changes applied",
    placement: pgPlacement.value,
  });
}
function pushError() {
  toast.danger({
    title: "Network error",
    description: "Could not reach the server.",
    placement: pgPlacement.value,
  });
}
function pushInfo() {
  toast.info({
    title: "Syncing",
    description: "Applying latest changes…",
    placement: pgPlacement.value,
  });
}
function pushWarn() {
  toast.warning({
    title: "Attention",
    description: "Review the data before continuing.",
    placement: pgPlacement.value,
    action: { label: "Review", onClick: (close) => close() },
  });
}
function pushMultiple() {
  toast.success({
    title: "Saved",
    description: "Draft saved.",
    placement: pgPlacement.value,
  });
  toast.info({
    title: "Syncing",
    description: "Fetching latest data…",
    placement: pgPlacement.value,
  });
  toast.warning({
    title: "Slow connection",
    description: "Response is taking longer than usual.",
    placement: pgPlacement.value,
  });
}

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
    name: "placement",
    type: "'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'",
    default: "'top-right'",
    description: t("pages.feedback.toast.props.placement"),
  },
  {
    name: "max",
    type: "number",
    default: "5",
    description: t("pages.feedback.toast.props.max"),
  },
  {
    name: "defaultDuration",
    type: "number",
    default: "4500",
    description: t("pages.feedback.toast.props.defaultDuration"),
  },
  {
    name: "defaultVariant",
    type: "'filled' | 'subtle' | 'outline'",
    default: "'subtle'",
    description: t("pages.feedback.toast.props.defaultVariant"),
  },
  {
    name: "offset",
    type: "number",
    default: "16",
    description: t("pages.feedback.toast.props.offset"),
  },
  {
    name: "reducedMotion",
    type: "'auto' | 'force'",
    description: t("pages.feedback.toast.props.reducedMotion"),
  },
]);

const emitsList: EmitDoc[] = [];
const slotsList: SlotDoc[] = [];
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.toast.title')"
    category="Feedback"
    import-path="import { ToastContainer, useToast } from 'mood-ui'"
    :description="t('pages.feedback.toast.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        lang="vue"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.toast.controls.placement')"
            :options="[
              { value: 'top-left' },
              { value: 'top-center' },
              { value: 'top-right' },
              { value: 'bottom-left' },
              { value: 'bottom-center' },
              { value: 'bottom-right' },
            ]"
            v-model="pgPlacement"
          />
        </template>

        <Button color="primary" @click="pushSuccess">{{
          t("pages.feedback.toast.playground.launch")
        }}</Button>
        <Button variant="outline" @click="toast.dismissAll()">{{
          t("pages.feedback.toast.playground.dismissAll")
        }}</Button>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.toast.examples.success.title')"
        :description="t('pages.feedback.toast.examples.success.desc')"
        :code="successCode"
        min-height="160px"
      >
        <Button color="success" @click="pushSuccess">success()</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toast.examples.error.title')"
        :description="t('pages.feedback.toast.examples.error.desc')"
        :code="errorCode"
        min-height="160px"
      >
        <Button color="danger" @click="pushError">danger()</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toast.examples.info.title')"
        :description="t('pages.feedback.toast.examples.info.desc')"
        :code="infoCode"
        min-height="160px"
      >
        <Button @click="pushInfo">{{
          t("pages.feedback.toast.examples.info.cta")
        }}</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toast.examples.warning.title')"
        :description="t('pages.feedback.toast.examples.warning.desc')"
        :code="warningCode"
        min-height="160px"
      >
        <Button color="warning" @click="pushWarn">warning()</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.toast.examples.dismissAll.title')"
        :description="t('pages.feedback.toast.examples.dismissAll.desc')"
        :code="dismissAllCode"
        min-height="160px"
      >
        <Button @click="pushMultiple">{{
          t("pages.feedback.toast.examples.dismissAll.pushCta")
        }}</Button>
        <Button variant="outline" @click="toast.dismissAll()">{{
          t("pages.feedback.toast.playground.dismissAll")
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
        {{ t("pages.feedback.toast.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.toast.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
