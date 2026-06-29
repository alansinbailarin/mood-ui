<script setup lang="ts">
import { ref, computed } from "vue";
import { Accordion, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/vue/24/outline";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.dataDisplay.accordion.title"),
  description: () => t("pages.dataDisplay.accordion.description"),
  ogTitle: () => `${t("pages.dataDisplay.accordion.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.accordion.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.accordion.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.accordion.a11y.kbShiftTab"),
  },
  { keys: ["↑", "↓"], action: t("pages.data-display.accordion.a11y.kbArrow") },
  { keys: ["Enter"], action: t("pages.data-display.accordion.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.data-display.accordion.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"region"',
    desc: t("pages.data-display.accordion.a11y.ariaRegion"),
  },
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.data-display.accordion.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-controls",
    value: "id",
    desc: t("pages.data-display.accordion.a11y.ariaControls"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.accordion.a11y.focusNative"),
]);

// ── Items ───────────────────────────────────────────────────────────────────
const typesCode = `export interface AccordionItem {
  value: string | number;
  title: string;
  content?: string;
  icon?: Component;
  disabled?: boolean;
}

export interface Accordion {
  items: AccordionItem[];
  modelValue?: string | number | (string | number)[] | null;
  multiple?: boolean;
  variant?: 'separated' | 'bordered' | 'flush';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  iconPosition?: 'start' | 'end';
}`;

const faqItems = [
  {
    value: "what",
    title: "¿Qué es mood-ui?",
    content:
      "Una librería de componentes Vue 3 totalmente tipada, con theming en runtime, dark mode e i18n.",
  },
  {
    value: "license",
    title: "¿Cuál es la licencia?",
    content:
      "MIT. Puedes usarla en proyectos personales y comerciales sin restricción.",
  },
  {
    value: "install",
    title: "¿Cómo se instala?",
    content:
      "npm install mood-ui — luego importa los estilos y envuelve tu app con <ModoProvider>.",
  },
];

const iconItems = [
  {
    value: "pay",
    title: "Pagos seguros",
    content: "Procesamos pagos con Stripe usando tokenización end-to-end.",
    icon: CreditCardIcon,
  },
  {
    value: "sec",
    title: "Seguridad",
    content: "Cumplimos con SOC 2 Type II y GDPR.",
    icon: ShieldCheckIcon,
  },
  {
    value: "speed",
    title: "Rendimiento",
    content: "Servidores edge en 200+ ubicaciones para latencia mínima.",
    icon: BoltIcon,
  },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"separated" | "bordered" | "flush">("separated");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgMultiple = ref(false);
const pgSingle = ref<string | number | null>("what");
const pgMulti = ref<(string | number)[]>(["what"]);
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");
const pgIconPosition = ref<"start" | "end">("end");

function resetPlayground() {
  pgVariant.value = "separated";
  pgSize.value = "medium";
  pgMultiple.value = false;
  pgSingle.value = "what";
  pgMulti.value = ["what"];
  pgRadius.value = "medium";
  pgIconPosition.value = "end";
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="open"', ':items="items"'];
  if (pgVariant.value !== "separated")
    parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgMultiple.value) parts.push("multiple");
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  if (pgIconPosition.value !== "end")
    parts.push(`icon-position="${pgIconPosition.value}"`);
  return `<Accordion ${parts.join(" ")} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Accordion } from 'mood-ui';

const open = ref('what');
const items = [
  { value: 'what',    title: 'What is mood-ui?',    content: 'A fully typed Vue 3 component library with runtime theming, dark mode and i18n.' },
  { value: 'license', title: 'What is the license?', content: 'MIT. You can use it in personal and commercial projects without restriction.' },
  { value: 'install', title: 'How do I install?',  content: 'npm install mood-ui — then import the styles and wrap your app with <ModoProvider>.' },
];
<\/script>

<template>
  <Accordion v-model="open" :items="items" />
</template>`;

const multipleCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Accordion } from 'mood-ui';

const open = ref<string[]>(['what']);
const items = [
  { value: 'what',    title: 'What is mood-ui?',    content: 'A fully typed Vue 3 component library with runtime theming, dark mode and i18n.' },
  { value: 'license', title: 'What is the license?', content: 'MIT. You can use it in personal and commercial projects without restriction.' },
];
<\/script>

<template>
  <Accordion v-model="open" :items="items" multiple />
</template>`;

const variantsCode = `<script setup lang="ts">
import { Accordion } from 'mood-ui';

const items = [
  { value: 'a', title: 'Question A', content: 'Answer A.' },
  { value: 'b', title: 'Question B', content: 'Answer B.' },
];
<\/script>

<template>
  <Accordion :items="items" variant="separated" />
  <Accordion :items="items" variant="bordered"  />
  <Accordion :items="items" variant="flush"     />
</template>`;

const iconsCode = `<script setup lang="ts">
import { Accordion } from 'mood-ui';
import { ShieldCheckIcon } from '@heroicons/vue/24/outline';

const items = [
  { value: 'sec', title: 'Security', content: '…', icon: ShieldCheckIcon },
];
<\/script>

<template>
  <Accordion :items="items" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Accordion } from 'mood-ui';

const items = [
  { value: 'a', title: 'Question A', content: 'Answer A.' },
];
<\/script>

<template>
  <Accordion :items="items" size="small"  />
  <Accordion :items="items" size="medium" />
  <Accordion :items="items" size="large"  />
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "items",
    type: "AccordionItem[]",
    required: true,
    description: t("pages.data-display.accordion.props.items"),
  },
  {
    name: "modelValue",
    type: "string | number | (string | number)[] | null",
    description: t("pages.data-display.accordion.props.modelValue"),
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.accordion.props.multiple"),
  },
  {
    name: "variant",
    type: "'separated' | 'bordered' | 'flush'",
    default: "'separated'",
    description: t("pages.data-display.accordion.props.variant"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    description: t("pages.data-display.accordion.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.accordion.props.radius"),
  },
  {
    name: "iconPosition",
    type: "'start' | 'end'",
    default: "'end'",
    description: t("pages.data-display.accordion.props.iconPosition"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | number | (string|number)[] | null",
    description: t("pages.data-display.accordion.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string | number | (string|number)[] | null",
    description: t("pages.data-display.accordion.emits.change"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "item-<value>",
    description: t("pages.data-display.accordion.slots.itemValue"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.accordion.title')"
    category="Data Display"
    import-path="import { Accordion } from 'mood-ui'"
    :description="t('pages.data-display.accordion.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="280px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.data-display.accordion.controls.variant')"
            :options="[
              { value: 'separated' },
              { value: 'bordered' },
              { value: 'flush' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.accordion.controls.size')"
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
            :label="t('pages.data-display.accordion.controls.radius')"
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
            :label="t('pages.data-display.accordion.controls.icon')"
            :options="[{ value: 'start' }, { value: 'end' }]"
            v-model="pgIconPosition"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.data-display.accordion.controls.multiple')"
            v-model="pgMultiple"
          />
        </template>

        <div class="w-full max-w-md">
          <Accordion
            v-if="pgMultiple"
            v-model="pgMulti"
            :items="faqItems"
            :variant="pgVariant"
            :size="pgSize"
            :radius="pgRadius"
            :icon-position="pgIconPosition"
            multiple
          />
          <Accordion
            v-else
            v-model="pgSingle"
            :items="faqItems"
            :variant="pgVariant"
            :size="pgSize"
            :radius="pgRadius"
            :icon-position="pgIconPosition"
          />
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.accordion.examples.basic.title')"
        :description="t('pages.data-display.accordion.examples.basic.desc')"
        :code="basicCode"
      >
        <div class="w-full max-w-md">
          <Accordion :items="faqItems" :model-value="'what'" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.accordion.examples.multiple.title')"
        :description="t('pages.data-display.accordion.examples.multiple.desc')"
        :code="multipleCode"
      >
        <div class="w-full max-w-md">
          <Accordion
            :items="faqItems"
            :model-value="['what', 'install']"
            multiple
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.accordion.examples.variants.title')"
        :description="t('pages.data-display.accordion.examples.variants.desc')"
        :code="variantsCode"
      >
        <div class="w-full max-w-md flex flex-col gap-6">
          <Accordion
            :items="faqItems.slice(0, 2)"
            variant="separated"
            :model-value="'what'"
          />
          <Accordion
            :items="faqItems.slice(0, 2)"
            variant="bordered"
            :model-value="'what'"
          />
          <Accordion
            :items="faqItems.slice(0, 2)"
            variant="flush"
            :model-value="'what'"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.accordion.examples.icons.title')"
        :description="t('pages.data-display.accordion.examples.icons.desc')"
        :code="iconsCode"
      >
        <div class="w-full max-w-md">
          <Accordion :items="iconItems" :model-value="'sec'" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.accordion.examples.sizes.title')"
        :description="t('pages.data-display.accordion.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="w-full max-w-md flex flex-col gap-6">
          <Accordion
            :items="faqItems.slice(0, 2)"
            size="small"
            :model-value="'what'"
          />
          <Accordion
            :items="faqItems.slice(0, 2)"
            size="medium"
            :model-value="'what'"
          />
          <Accordion
            :items="faqItems.slice(0, 2)"
            size="large"
            :model-value="'what'"
          />
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
        {{ t("pages.data-display.accordion.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.accordion.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
