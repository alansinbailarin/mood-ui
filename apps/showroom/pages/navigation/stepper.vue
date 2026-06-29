<script setup lang="ts">
import { ref, computed } from "vue";
import { Stepper, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import {
  UserIcon,
  CreditCardIcon,
  CheckBadgeIcon,
} from "@heroicons/vue/24/outline";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { PropDoc, EmitDoc } from "~/types/component-doc";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.navigation.stepper.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.navigation.stepper.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.navigation.stepper.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.navigation.stepper.a11y.focusNative"),
]);

const pgOrientation = ref<"horizontal" | "vertical">("horizontal");
const pgVariant = ref<"numbered" | "dots" | "progress">("numbered");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgCurrent = ref(1);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);

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

function resetPlayground() {
  pgOrientation.value = "horizontal";
  pgVariant.value = "numbered";
  pgSize.value = "medium";
  pgCurrent.value = 1;
  pgColor.value = "primary";
}

const playgroundSteps = computed(() => [
  {
    id: "account",
    label: t("pages.navigation.stepper.playgroundSteps.account.label"),
    description: t(
      "pages.navigation.stepper.playgroundSteps.account.description",
    ),
  },
  {
    id: "billing",
    label: t("pages.navigation.stepper.playgroundSteps.billing.label"),
    description: t(
      "pages.navigation.stepper.playgroundSteps.billing.description",
    ),
  },
  {
    id: "review",
    label: t("pages.navigation.stepper.playgroundSteps.review.label"),
    description: t(
      "pages.navigation.stepper.playgroundSteps.review.description",
    ),
  },
]);

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgOrientation.value !== "horizontal")
    parts.push(`orientation="${pgOrientation.value}"`);
  if (pgVariant.value !== "numbered")
    parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgColor.value !== "primary") parts.push(`color="${pgColor.value}"`);
  if (pgCurrent.value !== 1) parts.push(`:current="${pgCurrent.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Stepper :steps="steps" :current="${pgCurrent.value}"${attrs} class="w-full" />`;
});

const basicSteps = computed(() => [
  { id: "a", label: t("pages.navigation.stepper.basicSteps.cart") },
  { id: "b", label: t("pages.navigation.stepper.basicSteps.shipping") },
  { id: "c", label: t("pages.navigation.stepper.basicSteps.payment") },
]);

const detailedSteps = computed(() => [
  {
    id: "account",
    label: t("pages.navigation.stepper.detailedSteps.account.label"),
    description: t(
      "pages.navigation.stepper.detailedSteps.account.description",
    ),
    icon: UserIcon,
  },
  {
    id: "billing",
    label: t("pages.navigation.stepper.detailedSteps.billing.label"),
    description: t(
      "pages.navigation.stepper.detailedSteps.billing.description",
    ),
    icon: CreditCardIcon,
  },
  {
    id: "review",
    label: t("pages.navigation.stepper.detailedSteps.review.label"),
    description: t("pages.navigation.stepper.detailedSteps.review.description"),
    icon: CheckBadgeIcon,
  },
]);

const verticalSteps = computed(() => [
  {
    id: "a",
    label: t("pages.navigation.stepper.verticalSteps.personal.label"),
    description: t(
      "pages.navigation.stepper.verticalSteps.personal.description",
    ),
  },
  {
    id: "b",
    label: t("pages.navigation.stepper.verticalSteps.address.label"),
    description: t(
      "pages.navigation.stepper.verticalSteps.address.description",
    ),
  },
  {
    id: "c",
    label: t("pages.navigation.stepper.verticalSteps.payment.label"),
    description: t(
      "pages.navigation.stepper.verticalSteps.payment.description",
    ),
  },
  {
    id: "d",
    label: t("pages.navigation.stepper.verticalSteps.confirmation.label"),
    description: t(
      "pages.navigation.stepper.verticalSteps.confirmation.description",
    ),
  },
]);

const errorSteps = computed(() => [
  { id: "a", label: t("pages.navigation.stepper.errorSteps.data") },
  {
    id: "b",
    label: t("pages.navigation.stepper.errorSteps.payment"),
    description: t("pages.navigation.stepper.errorSteps.paymentDesc"),
    state: "error" as const,
  },
  { id: "c", label: t("pages.navigation.stepper.errorSteps.confirm") },
]);

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Stepper } from 'mood-ui';

const current = ref(1);
const steps = [
  { id: 'cart',     label: 'Cart' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment',  label: 'Payment' },
];
<\/script>

<template>
  <Stepper :steps="steps" :current="current" />
</template>`;

const descriptionsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Stepper } from 'mood-ui';
import { UserIcon, CreditCardIcon, CheckBadgeIcon } from '@heroicons/vue/24/outline';

const current = ref(1);
const steps = [
  { id: 'account', label: 'Account',  description: 'Log in or create an account', icon: UserIcon },
  { id: 'billing', label: 'Billing',  description: 'Enter payment details',     icon: CreditCardIcon },
  { id: 'review',  label: 'Review',   description: 'Confirm your order',          icon: CheckBadgeIcon },
];
<\/script>

<template>
  <Stepper :steps="steps" :current="current" />
</template>`;

const verticalCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Stepper } from 'mood-ui';

const current = ref(1);
const steps = [
  { id: 'personal',     label: 'Personal',     description: 'Name and email' },
  { id: 'address',      label: 'Address',      description: 'Shipping address' },
  { id: 'payment',      label: 'Payment',      description: 'Payment method' },
  { id: 'confirmation', label: 'Confirmation', description: 'Review and confirm' },
];
<\/script>

<template>
  <Stepper :steps="steps" :current="current" orientation="vertical" />
</template>`;

const errorsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Stepper } from 'mood-ui';

const current = ref(1);
const steps = [
  { id: 'data',    label: 'Data' },
  { id: 'payment', label: 'Payment', description: 'Card declined', state: 'error' as const },
  { id: 'confirm', label: 'Confirm' },
];
<\/script>

<template>
  <Stepper :steps="steps" :current="current" />
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "steps",
    type: "StepperStep[]",
    required: true,
    description: t("pages.navigation.stepper.props.steps"),
  },
  {
    name: "current",
    type: "number",
    default: "0",
    description: t("pages.navigation.stepper.props.current"),
  },
  {
    name: "variant",
    type: "'numbered' | 'dots' | 'progress'",
    default: "'numbered'",
    description: t("pages.navigation.stepper.props.variant"),
  },
  {
    name: "orientation",
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: t("pages.navigation.stepper.props.orientation"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'primary'",
    description: t("pages.navigation.stepper.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.navigation.stepper.props.size"),
  },
  {
    name: "clickable",
    type: "boolean",
    default: "false",
    description: t("pages.navigation.stepper.props.clickable"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "step-click",
    payload: "(step: StepperStep, index: number)",
    description: t("pages.navigation.stepper.emits.stepClick"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.navigation.stepper.title')"
    :category="t('pages.navigation.stepper.category')"
    import-path="import { Stepper } from 'mood-ui'"
    :description="t('pages.navigation.stepper.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Orientation"
            :options="[{ value: 'horizontal' }, { value: 'vertical' }]"
            v-model="pgOrientation"
          />
          <TbSep />
          <TbPills
            label="Variant"
            :options="[
              { value: 'numbered' },
              { value: 'dots' },
              { value: 'progress' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            label="Size"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbDots label="Color" :options="colorDots" v-model="pgColor" />
        </template>

        <div class="w-full max-w-lg flex flex-col gap-4">
          <Stepper
            :steps="playgroundSteps"
            :current="pgCurrent"
            :orientation="pgOrientation"
            :variant="pgVariant"
            :size="pgSize"
            :color="pgColor"
            class="w-full"
          />
          <div class="flex justify-center gap-2">
            <button
              type="button"
              class="px-3 py-1.5 rounded-md text-xs border border-border text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              :disabled="pgCurrent === 0"
              @click="pgCurrent--"
            >
              {{ t("pages.navigation.stepper.demo.prev") }}
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-md text-xs border border-primary bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              :disabled="pgCurrent === playgroundSteps.length - 1"
              @click="pgCurrent++"
            >
              {{ t("pages.navigation.stepper.demo.next") }}
            </button>
          </div>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.navigation.stepper.examples.basic.title')"
        :description="t('pages.navigation.stepper.examples.basic.desc')"
        :code="basicCode"
      >
        <Stepper :steps="basicSteps" :current="1" class="w-full max-w-xl" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.stepper.examples.descriptions.title')"
        :description="t('pages.navigation.stepper.examples.descriptions.desc')"
        :code="descriptionsCode"
      >
        <Stepper :steps="detailedSteps" :current="1" class="w-full max-w-xl" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.stepper.examples.vertical.title')"
        :description="t('pages.navigation.stepper.examples.vertical.desc')"
        :code="verticalCode"
        min-height="320px"
      >
        <Stepper :steps="verticalSteps" :current="1" orientation="vertical" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.stepper.examples.error.title')"
        :description="t('pages.navigation.stepper.examples.error.desc')"
        :code="errorsCode"
      >
        <Stepper :steps="errorSteps" :current="1" class="w-full max-w-xl" />
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
        {{ t("pages.navigation.stepper.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.navigation.stepper.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
