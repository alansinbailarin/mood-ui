<script setup lang="ts">
import { ref, computed } from "vue";
import { Typography, VStack } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { PropDoc, SlotDoc } from "~/types/component-doc";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.vstack.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.vstack.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.vstack.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.vstack.a11y.focusNative"),
]);

const pgSpacing = ref<
  "none" | "xsmall" | "small" | "medium" | "large" | "xlarge"
>("medium");
const pgAlign = ref<"start" | "center" | "end" | "stretch" | "baseline">(
  "stretch",
);
const pgJustify = ref<
  "start" | "center" | "end" | "between" | "around" | "evenly"
>("start");
const pgDivider = ref(false);

function resetPlayground() {
  pgSpacing.value = "medium";
  pgAlign.value = "stretch";
  pgJustify.value = "start";
  pgDivider.value = false;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSpacing.value !== "medium") parts.push(`spacing="${pgSpacing.value}"`);
  if (pgAlign.value !== "stretch") parts.push(`align="${pgAlign.value}"`);
  if (pgJustify.value !== "start") parts.push(`justify="${pgJustify.value}"`);
  if (pgDivider.value) parts.push("divider");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<VStack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</VStack>`;
});

const basicCode = `<script setup lang="ts">
import { VStack } from 'mood-ui';
<\/script>

<template>
  <VStack spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </VStack>
</template>`;

const gapCode = `<script setup lang="ts">
import { VStack } from 'mood-ui';
<\/script>

<template>
  <VStack spacing="small">…</VStack>
  <VStack spacing="medium">…</VStack>
  <VStack spacing="large">…</VStack>
</template>`;

const alignmentsCode = `<script setup lang="ts">
import { VStack } from 'mood-ui';
<\/script>

<template>
  <VStack align="start">…</VStack>
  <VStack align="center">…</VStack>
  <VStack align="end">…</VStack>
  <VStack align="stretch">…</VStack>
</template>`;

const dividerCode = `<script setup lang="ts">
import { VStack } from 'mood-ui';
<\/script>

<template>
  <VStack spacing="medium" divider>
    <span>First</span>
    <span>Second</span>
    <span>Third</span>
  </VStack>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "spacing",
    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",
    default: "'medium'",
    description: t("pages.layout.vstack.props.spacing"),
  },
  {
    name: "align",
    type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
    default: "'stretch'",
    description: t("pages.layout.vstack.props.align"),
  },
  {
    name: "justify",
    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
    default: "'start'",
    description: t("pages.layout.vstack.props.justify"),
  },
  {
    name: "wrap",
    type: "'nowrap' | 'wrap' | 'wrap-reverse'",
    default: "'nowrap'",
    description: t("pages.layout.vstack.props.wrap"),
  },
  {
    name: "divider",
    type: "boolean",
    default: "false",
    description: t("pages.layout.vstack.props.divider"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.layout.vstack.props.fullWidth"),
  },
  {
    name: "fullHeight",
    type: "boolean",
    default: "false",
    description: t("pages.layout.vstack.props.fullHeight"),
  },
  {
    name: "as",
    type: "string",
    default: "'div'",
    description: t("pages.layout.vstack.props.as"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.layout.vstack.slots.default") },
]);

const typesCode = `export type VStack = Omit<Stack, 'direction'>;`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.vstack.title')"
    :category="t('pages.layout.vstack.category')"
    import-path="import { VStack } from 'mood-ui'"
    :description="t('pages.layout.vstack.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Gap"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSpacing"
          />
          <TbSep />
          <TbPills
            label="Align"
            :options="[
              { value: 'start' },
              { value: 'center' },
              { value: 'end' },
              { value: 'stretch' },
            ]"
            v-model="pgAlign"
          />
          <TbSep />
          <TbPills
            label="Justify"
            :options="[
              { value: 'start' },
              { value: 'center' },
              { value: 'end' },
              { value: 'between' },
            ]"
            v-model="pgJustify"
          />
          <TbSep />
          <TbToggle label="Divider" v-model="pgDivider" />
        </template>

        <VStack
          :spacing="pgSpacing"
          :align="pgAlign"
          :justify="pgJustify"
          :divider="pgDivider"
          class="w-full max-w-xs p-4 border border-dashed border-border rounded-md min-h-[200px]"
        >
          <div
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            1
          </div>
          <div
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            2
          </div>
          <div
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            3
          </div>
        </VStack>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.vstack.examples.basic.title')"
        :description="t('pages.layout.vstack.examples.basic.desc')"
        :code="basicCode"
      >
        <VStack spacing="medium" class="w-full max-w-xs">
          <div
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            1
          </div>
          <div
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            2
          </div>
          <div
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            3
          </div>
        </VStack>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.vstack.examples.spacings.title')"
        :description="t('pages.layout.vstack.examples.spacings.desc')"
        :code="gapCode"
      >
        <div class="flex gap-6 items-start">
          <VStack spacing="small">
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
          </VStack>
          <VStack spacing="medium">
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
          </VStack>
          <VStack spacing="large">
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
          </VStack>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.vstack.examples.alignments.title')"
        :description="t('pages.layout.vstack.examples.alignments.desc')"
        :code="alignmentsCode"
      >
        <div class="flex gap-3 w-full">
          <VStack
            align="start"
            class="border border-dashed border-border rounded-md p-2 flex-1"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-8 bg-primary/10 rounded-md"
          /></VStack>
          <VStack
            align="center"
            class="border border-dashed border-border rounded-md p-2 flex-1"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-8 bg-primary/10 rounded-md"
          /></VStack>
          <VStack
            align="end"
            class="border border-dashed border-border rounded-md p-2 flex-1"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-8 bg-primary/10 rounded-md"
          /></VStack>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.vstack.examples.divider.title')"
        :description="t('pages.layout.vstack.examples.divider.desc')"
        :code="dividerCode"
      >
        <VStack spacing="medium" divider class="w-full max-w-xs">
          <span class="text-sm">{{
            t("pages.layout.vstack.sections.s1")
          }}</span>
          <span class="text-sm">{{
            t("pages.layout.vstack.sections.s2")
          }}</span>
          <span class="text-sm">{{
            t("pages.layout.vstack.sections.s3")
          }}</span>
        </VStack>
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
        {{ t("pages.layout.vstack.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.vstack.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
