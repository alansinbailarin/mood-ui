<script setup lang="ts">
import { ref, computed } from "vue";
import { Stack, Typography } from "mood-ui";
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


useSeoMeta({
  title: () => t("pages.layout.stack.title"),
  description: () => t("pages.layout.stack.description"),
  ogTitle: () => `${t("pages.layout.stack.title")} · mood-ui`,
  ogDescription: () => t("pages.layout.stack.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.layout.stack.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.layout.stack.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.layout.stack.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.layout.stack.a11y.focusNative"),
]);

const pgDirection = ref<"row" | "column">("column");
const pgSpacing = ref<
  "none" | "xsmall" | "small" | "medium" | "large" | "xlarge"
>("medium");
const pgAlign = ref<"start" | "center" | "end" | "stretch" | "baseline">(
  "stretch",
);
const pgJustify = ref<
  "start" | "center" | "end" | "between" | "around" | "evenly"
>("start");
const pgWrap = ref<"nowrap" | "wrap" | "wrap-reverse">("nowrap");
const pgDivider = ref(false);

function resetPlayground() {
  pgDirection.value = "column";
  pgSpacing.value = "medium";
  pgAlign.value = "stretch";
  pgJustify.value = "start";
  pgWrap.value = "nowrap";
  pgDivider.value = false;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgDirection.value !== "column")
    parts.push(`direction="${pgDirection.value}"`);
  if (pgSpacing.value !== "medium") parts.push(`spacing="${pgSpacing.value}"`);
  if (pgAlign.value !== "stretch") parts.push(`align="${pgAlign.value}"`);
  if (pgJustify.value !== "start") parts.push(`justify="${pgJustify.value}"`);
  if (pgWrap.value !== "nowrap") parts.push(`wrap="${pgWrap.value}"`);
  if (pgDivider.value) parts.push("divider");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Stack${attrs}>
    <div>1</div>
    <div>2</div>
    <div>3</div>
</Stack>`;
});

const verticalCode = `<script setup lang="ts">
import { Stack } from 'mood-ui';
<\/script>

<template>
  <Stack direction="column" spacing="medium">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </Stack>
</template>`;

const horizontalCode = `<script setup lang="ts">
import { Stack } from 'mood-ui';
<\/script>

<template>
  <Stack direction="row" spacing="small">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </Stack>
</template>`;

const dividerCode = `<script setup lang="ts">
import { Stack } from 'mood-ui';
<\/script>

<template>
  <Stack direction="row" spacing="medium" divider>
    <span>Start</span>
    <span>Center</span>
    <span>End</span>
  </Stack>
</template>`;

const wrapCode = `<script setup lang="ts">
import { Stack } from 'mood-ui';
<\/script>

<template>
  <Stack direction="row" spacing="small" wrap="wrap">
    <div v-for="n in 8" :key="n">{{ n }}</div>
  </Stack>
</template>`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "direction",
    type: "'row' | 'column'",
    default: "'column'",
    description: t("pages.layout.stack.props.direction"),
  },
  {
    name: "spacing",
    type: "'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",
    default: "'medium'",
    description: t("pages.layout.stack.props.spacing"),
  },
  {
    name: "align",
    type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
    default: "'stretch'",
    description: t("pages.layout.stack.props.align"),
  },
  {
    name: "justify",
    type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
    default: "'start'",
    description: t("pages.layout.stack.props.justify"),
  },
  {
    name: "wrap",
    type: "'nowrap' | 'wrap' | 'wrap-reverse'",
    default: "'nowrap'",
    description: t("pages.layout.stack.props.wrap"),
  },
  {
    name: "divider",
    type: "boolean",
    default: "false",
    description: t("pages.layout.stack.props.divider"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.layout.stack.props.fullWidth"),
  },
  {
    name: "fullHeight",
    type: "boolean",
    default: "false",
    description: t("pages.layout.stack.props.fullHeight"),
  },
  {
    name: "as",
    type: "string",
    default: "'div'",
    description: t("pages.layout.stack.props.as"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.layout.stack.slots.default") },
]);

const typesCode = `export type StackDirection = 'row' | 'column';
export type StackSpacing = 'none' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export interface Stack {
  direction?: StackDirection;
  spacing?: StackSpacing;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: StackWrap;
  divider?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  as?: string;
}`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.layout.stack.title')"
    :category="t('pages.layout.stack.category')"
    import-path="import { Stack } from 'mood-ui'"
    :description="t('pages.layout.stack.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Dir"
            :options="[{ value: 'row' }, { value: 'column' }]"
            v-model="pgDirection"
          />
          <TbSep />
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

        <Stack
          :direction="pgDirection"
          :spacing="pgSpacing"
          :align="pgAlign"
          :justify="pgJustify"
          :wrap="pgWrap"
          :divider="pgDivider"
          class="w-full p-4 border border-dashed border-border rounded-md min-h-[140px]"
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
        </Stack>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.layout.stack.examples.vertical.title')"
        :description="t('pages.layout.stack.examples.vertical.desc')"
        :code="verticalCode"
      >
        <Stack direction="column" spacing="medium">
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
        </Stack>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.stack.examples.horizontal.title')"
        :description="t('pages.layout.stack.examples.horizontal.desc')"
        :code="horizontalCode"
      >
        <Stack direction="row" spacing="small">
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
        </Stack>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.stack.examples.divider.title')"
        :description="t('pages.layout.stack.examples.divider.desc')"
        :code="dividerCode"
      >
        <Stack direction="row" spacing="medium" divider>
          <span class="text-sm">{{
            t("pages.layout.stack.sections.start")
          }}</span>
          <span class="text-sm">{{
            t("pages.layout.stack.sections.center")
          }}</span>
          <span class="text-sm">{{
            t("pages.layout.stack.sections.end")
          }}</span>
        </Stack>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.layout.stack.examples.wrapping.title')"
        :description="t('pages.layout.stack.examples.wrapping.desc')"
        :code="wrapCode"
      >
        <Stack
          direction="row"
          spacing="small"
          wrap="wrap"
          class="max-w-[260px]"
        >
          <div
            v-for="n in 8"
            :key="n"
            class="size-12 bg-primary/10 rounded-md grid place-items-center text-primary font-medium"
          >
            {{ n }}
          </div>
        </Stack>
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
        {{ t("pages.layout.stack.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.layout.stack.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
