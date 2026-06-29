<script setup lang="ts">
import { ref, computed } from "vue";
import { HStack, Typography } from "mood-ui";
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
  { keys: ["Tab"], action: t("pages.layout.hstack.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.hstack.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.hstack.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.hstack.a11y.focusNative"),
]);

const pgSpacing = ref<
  "none" | "xsmall" | "small" | "medium" | "large" | "xlarge"
>("medium");
const pgAlign = ref<"start" | "center" | "end" | "stretch" | "baseline">(
  "center",
);
const pgJustify = ref<
  "start" | "center" | "end" | "between" | "around" | "evenly"
>("start");
const pgWrap = ref<"nowrap" | "wrap" | "wrap-reverse">("nowrap");
const pgDivider = ref(false);

function resetPlayground() {
  pgSpacing.value = "medium";
  pgAlign.value = "center";
  pgJustify.value = "start";
  pgWrap.value = "nowrap";
  pgDivider.value = false;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSpacing.value !== "medium") parts.push(`spacing="${pgSpacing.value}"`);
  if (pgAlign.value !== "stretch") parts.push(`align="${pgAlign.value}"`);
  if (pgJustify.value !== "start") parts.push(`justify="${pgJustify.value}"`);
  if (pgWrap.value !== "nowrap") parts.push(`wrap="${pgWrap.value}"`);
  if (pgDivider.value) parts.push("divider");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<HStack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</HStack>`;
});

const basicCode = `<script setup lang="ts">
import { HStack } from 'mood-ui';
<\/script>

<template>
  <HStack spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </HStack>
</template>`;

const gapCode = `<script setup lang="ts">
import { HStack } from 'mood-ui';
<\/script>

<template>
  <HStack spacing="xsmall"><!-- ... --></HStack>
  <HStack spacing="small"><!-- ... --></HStack>
  <HStack spacing="medium"><!-- ... --></HStack>
  <HStack spacing="large"><!-- ... --></HStack>
</template>`;

const alignmentsCode = `<script setup lang="ts">
import { HStack } from 'mood-ui';
<\/script>

<template>
  <HStack justify="start"   align="center">…</HStack>
  <HStack justify="center"  align="center">…</HStack>
  <HStack justify="end"     align="center">…</HStack>
  <HStack justify="between" align="center">…</HStack>
</template>`;

const wrapCode = `<script setup lang="ts">
import { HStack } from 'mood-ui';
<\/script>

<template>
  <HStack spacing="small" wrap="wrap">
    <div v-for="n in 8" :key="n">{{ n }}</div>
  </HStack>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "spacing",
    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",
    default: "'medium'",
    description: t("pages.layout.hstack.props.spacing"),
  },
  {
    name: "align",
    type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
    default: "'stretch'",
    description: t("pages.layout.hstack.props.align"),
  },
  {
    name: "justify",
    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
    default: "'start'",
    description: t("pages.layout.hstack.props.justify"),
  },
  {
    name: "wrap",
    type: "'nowrap' | 'wrap' | 'wrap-reverse'",
    default: "'nowrap'",
    description: t("pages.layout.hstack.props.wrap"),
  },
  {
    name: "divider",
    type: "boolean",
    default: "false",
    description: t("pages.layout.hstack.props.divider"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.layout.hstack.props.fullWidth"),
  },
  {
    name: "fullHeight",
    type: "boolean",
    default: "false",
    description: t("pages.layout.hstack.props.fullHeight"),
  },
  {
    name: "as",
    type: "string",
    default: "'div'",
    description: t("pages.layout.hstack.props.as"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.layout.hstack.slots.default") },
]);

const typesCode = `export type HStack = Omit<Stack, 'direction'>;`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.hstack.title')"
    :category="t('pages.layout.hstack.category')"
    import-path="import { HStack } from 'mood-ui'"
    :description="t('pages.layout.hstack.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="200px"
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
          <TbPills
            label="Wrap"
            :options="[
              { value: 'nowrap' },
              { value: 'wrap' },
              { value: 'wrap-reverse', label: 'wrap-rev' },
            ]"
            v-model="pgWrap"
          />
          <TbSep />
          <TbToggle label="Divider" v-model="pgDivider" />
        </template>

        <HStack
          :spacing="pgSpacing"
          :align="pgAlign"
          :justify="pgJustify"
          :wrap="pgWrap"
          :divider="pgDivider"
          class="w-full p-4 border border-dashed border-border rounded-md min-h-[120px]"
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
        </HStack>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.hstack.examples.basic.title')"
        :description="t('pages.layout.hstack.examples.basic.desc')"
        :code="basicCode"
      >
        <HStack spacing="medium">
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
        </HStack>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.hstack.examples.spacings.title')"
        :description="t('pages.layout.hstack.examples.spacings.desc')"
        :code="gapCode"
      >
        <div class="flex flex-col gap-3 w-full">
          <HStack spacing="xsmall"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
          <HStack spacing="small"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
          <HStack spacing="medium"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
          <HStack spacing="large"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.hstack.examples.alignments.title')"
        :description="t('pages.layout.hstack.examples.alignments.desc')"
        :code="alignmentsCode"
      >
        <div class="flex flex-col gap-2 w-full">
          <HStack
            justify="start"
            align="center"
            class="border border-dashed border-border rounded-md p-2"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
          <HStack
            justify="center"
            align="center"
            class="border border-dashed border-border rounded-md p-2"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
          <HStack
            justify="end"
            align="center"
            class="border border-dashed border-border rounded-md p-2"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
          <HStack
            justify="between"
            align="center"
            class="border border-dashed border-border rounded-md p-2"
            ><div class="size-10 bg-primary/10 rounded-md" />
            <div class="size-10 bg-primary/10 rounded-md"
          /></HStack>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.hstack.examples.wrapping.title')"
        :description="t('pages.layout.hstack.examples.wrapping.desc')"
        :code="wrapCode"
      >
        <HStack spacing="small" wrap="wrap" class="max-w-[260px]">
          <div
            v-for="n in 8"
            :key="n"
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            {{ n }}
          </div>
        </HStack>
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
        {{ t("pages.layout.hstack.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.hstack.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
