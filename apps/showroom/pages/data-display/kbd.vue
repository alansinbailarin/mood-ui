<script setup lang="ts">
import { ref, computed } from "vue";
import { Kbd, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.dataDisplay.kbd.title"),
  description: () => t("pages.dataDisplay.kbd.description"),
  ogTitle: () => `${t("pages.dataDisplay.kbd.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.kbd.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.kbd.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.data-display.kbd.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.kbd.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.kbd.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"subtle" | "outline" | "solid">("subtle");
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");

function resetPlayground() {
  pgVariant.value = "subtle";
  pgSize.value = "medium";
  pgRadius.value = "medium";
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "subtle") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Kbd${attrs}>⌘K</Kbd>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const typesCode = `export interface Kbd {
  size?: 'small' | 'medium' | 'large';
  variant?: 'subtle' | 'outline' | 'solid';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}`;

const basicCode = `<script setup lang="ts">
import { Kbd } from 'mood-ui';
<\/script>

<template>
  <Kbd>Enter</Kbd>
  <Kbd>Esc</Kbd>
  <Kbd>Tab</Kbd>
</template>`;

const comboCode = `<script setup lang="ts">
import { Kbd } from 'mood-ui';
<\/script>

<template>
  <Kbd>⌘</Kbd>
  <span class="text-muted-foreground">+</span>
  <Kbd>Shift</Kbd>
  <span class="text-muted-foreground">+</span>
  <Kbd>P</Kbd>
</template>`;

const variantsCode = `<script setup lang="ts">
import { Kbd } from 'mood-ui';
<\/script>

<template>
  <Kbd variant="subtle">Esc</Kbd>
  <Kbd variant="outline">Esc</Kbd>
  <Kbd variant="solid">Esc</Kbd>
</template>`;

const sizesCode = `<script setup lang="ts">
import { Kbd } from 'mood-ui';
<\/script>

<template>
  <Kbd size="small">Tab</Kbd>
  <Kbd size="medium">Tab</Kbd>
  <Kbd size="large">Tab</Kbd>
</template>`;

const inlineCode = `<script setup lang="ts">
import { Kbd } from 'mood-ui';
<\/script>

<template>
  <p>Press <Kbd>⌘K</Kbd> to open quick search.</p>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.data-display.kbd.props.size"),
  },
  {
    name: "variant",
    type: "'subtle' | 'outline' | 'solid'",
    default: "'subtle'",
    description: t("pages.data-display.kbd.props.variant"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.kbd.props.radius"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.data-display.kbd.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.kbd.title')"
    category="Data Display"
    import-path="import { Kbd } from 'mood-ui'"
    :description="t('pages.data-display.kbd.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="160px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.data-display.kbd.controls.variant')"
            :options="[
              { value: 'subtle' },
              { value: 'outline' },
              { value: 'solid' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.kbd.controls.size')"
            :options="[
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('pages.data-display.kbd.controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
            v-model="pgRadius"
          />
        </template>

        <Kbd :variant="pgVariant" :size="pgSize" :radius="pgRadius">⌘K</Kbd>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.kbd.examples.basic.title')"
        :description="t('pages.data-display.kbd.examples.basic.desc')"
        :code="basicCode"
      >
        <Kbd>Enter</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.kbd.examples.combo.title')"
        :description="t('pages.data-display.kbd.examples.combo.desc')"
        :code="comboCode"
      >
        <div class="inline-flex items-center gap-1">
          <Kbd>⌘</Kbd>
          <span class="text-muted-foreground">+</span>
          <Kbd>Shift</Kbd>
          <span class="text-muted-foreground">+</span>
          <Kbd>P</Kbd>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.kbd.examples.variants.title')"
        :description="t('pages.data-display.kbd.examples.variants.desc')"
        :code="variantsCode"
      >
        <Kbd variant="subtle">Esc</Kbd>
        <Kbd variant="outline">Esc</Kbd>
        <Kbd variant="solid">Esc</Kbd>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.kbd.examples.sizes.title')"
        :description="t('pages.data-display.kbd.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Kbd size="small">Tab</Kbd>
        <Kbd size="medium">Tab</Kbd>
        <Kbd size="large">Tab</Kbd>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.kbd.examples.inline.title')"
        :description="t('pages.data-display.kbd.examples.inline.desc')"
        :code="inlineCode"
      >
        <p class="text-sm">Press <Kbd>⌘K</Kbd> to open quick search.</p>
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
        {{ t("pages.data-display.kbd.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.kbd.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
