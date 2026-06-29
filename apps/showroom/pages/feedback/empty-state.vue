<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, EmptyState, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";

import ComponentPreview from "~/components/ComponentPreview.vue";


import {
  InboxIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  FolderOpenIcon,
} from "@heroicons/vue/24/outline";
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


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.emptyState.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.feedback.emptyState.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"region"',
    desc: t("pages.feedback.emptyState.a11y.ariaRegion"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.feedback.emptyState.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.emptyState.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgVariant = ref<"subtle" | "solid" | "outline">("subtle");
const pgCentered = ref(true);

function resetPlayground() {
  pgSize.value = "medium";
  pgVariant.value = "subtle";
  pgCentered.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "subtle") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (!pgCentered.value) parts.push(':centered="false"');
  parts.push(':icon="InboxIcon"');
  parts.push('title="No notifications"');
  parts.push('description="When you receive something it will appear here."');
  return `<EmptyState ${parts.join(" ")} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const actionCode = `<script setup lang="ts">
import { EmptyState, Button } from 'mood-ui';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <EmptyState
    :icon="MagnifyingGlassIcon"
    title="No results"
    description="Try another search or clear the filters."
  >
    <template #actions>
      <Button color="primary">Clear filters</Button>
    </template>
  </EmptyState>
</template>`;

const variantsCode = `<script setup lang="ts">
import { EmptyState } from 'mood-ui';
import { InboxIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <EmptyState :icon="InboxIcon" title="Subtle"  description="No border."        variant="subtle"  />
  <EmptyState :icon="InboxIcon" title="Solid"   description="With surface."     variant="solid"   />
  <EmptyState :icon="InboxIcon" title="Outline" description="Dashed border."    variant="outline" />
</template>`;

const noResultsCode = `<script setup lang="ts">
import { EmptyState } from 'mood-ui';
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <EmptyState
    :icon="MagnifyingGlassIcon"
    title="No results"
    description='We found nothing matching "invoices 2025". Try other terms.'
  />
</template>`;

const errorCode = `<script setup lang="ts">
import { EmptyState, Button } from 'mood-ui';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <EmptyState
    :icon="ExclamationTriangleIcon"
    title="Something went wrong"
    description="Retry in a few seconds."
    variant="outline"
  >
    <template #actions>
      <Button color="primary" variant="outline">Retry</Button>
    </template>
  </EmptyState>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const typesCode = `export type EmptyStateSize = 'small' | 'medium' | 'large';
export type EmptyStateVariant = 'subtle' | 'solid' | 'outline';

export interface EmptyState {
  title?: string;
  description?: string;
  icon?: Component;
  size?: EmptyStateSize;
  variant?: EmptyStateVariant;
  centered?: boolean;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "title",
    type: "string",
    description: t("pages.feedback.emptyState.props.title"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.feedback.emptyState.props.description"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.feedback.emptyState.props.icon"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.feedback.emptyState.props.size"),
  },
  {
    name: "variant",
    type: "'subtle' | 'solid' | 'outline'",
    default: "'subtle'",
    description: t("pages.feedback.emptyState.props.variant"),
  },
  {
    name: "centered",
    type: "boolean",
    default: "true",
    description: t("pages.feedback.emptyState.props.centered"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.emptyState.props.radius"),
  },
]);

const emitsList: EmitDoc[] = [];

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "actions",
    description: t("pages.feedback.emptyState.slots.actions"),
  },
  {
    name: "default",
    description: t("pages.feedback.emptyState.slots.default"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.feedback.emptyState.title')"
    category="Feedback"
    import-path="import { EmptyState } from 'mood-ui'"
    :description="t('pages.feedback.emptyState.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="280px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.emptyState.controls.variant')"
            :options="[
              { value: 'subtle' },
              { value: 'solid' },
              { value: 'outline' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.emptyState.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle
            :label="t('pages.feedback.emptyState.controls.centered')"
            v-model="pgCentered"
          />
        </template>

        <EmptyState
          class="w-full max-w-md"
          :icon="InboxIcon"
          :size="pgSize"
          :variant="pgVariant"
          :centered="pgCentered"
          :title="t('pages.feedback.emptyState.playground.title')"
          :description="t('pages.feedback.emptyState.playground.description')"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.emptyState.examples.action.title')"
        :description="t('pages.feedback.emptyState.examples.action.desc')"
        :code="actionCode"
      >
        <EmptyState
          class="w-full max-w-md"
          :icon="MagnifyingGlassIcon"
          :title="t('pages.feedback.emptyState.examples.action.emptyTitle')"
          :description="
            t('pages.feedback.emptyState.examples.action.emptyDesc')
          "
        >
          <template #actions>
            <Button color="primary">{{
              t("pages.feedback.emptyState.examples.action.cta")
            }}</Button>
          </template>
        </EmptyState>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.emptyState.examples.variants.title')"
        :description="t('pages.feedback.emptyState.examples.variants.desc')"
        :code="variantsCode"
      >
        <div class="flex flex-col gap-3 w-full max-w-md">
          <EmptyState
            :icon="FolderOpenIcon"
            title="Subtle"
            :description="
              t('pages.feedback.emptyState.examples.variants.subtleDesc')
            "
            variant="subtle"
          />
          <EmptyState
            :icon="FolderOpenIcon"
            title="Solid"
            :description="
              t('pages.feedback.emptyState.examples.variants.solidDesc')
            "
            variant="solid"
          />
          <EmptyState
            :icon="FolderOpenIcon"
            title="Outline"
            :description="
              t('pages.feedback.emptyState.examples.variants.outlineDesc')
            "
            variant="outline"
          />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.emptyState.examples.noResults.title')"
        :description="t('pages.feedback.emptyState.examples.noResults.desc')"
        :code="noResultsCode"
      >
        <EmptyState
          class="w-full max-w-md"
          :icon="MagnifyingGlassIcon"
          :title="t('pages.feedback.emptyState.examples.noResults.emptyTitle')"
          :description="
            t('pages.feedback.emptyState.examples.noResults.emptyDesc')
          "
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.emptyState.examples.error.title')"
        :description="t('pages.feedback.emptyState.examples.error.desc')"
        :code="errorCode"
      >
        <EmptyState
          class="w-full max-w-md"
          :icon="ExclamationTriangleIcon"
          :title="t('pages.feedback.emptyState.examples.error.emptyTitle')"
          :description="t('pages.feedback.emptyState.examples.error.emptyDesc')"
          variant="outline"
        >
          <template #actions>
            <Button color="primary" variant="outline">{{
              t("pages.feedback.emptyState.examples.error.cta")
            }}</Button>
          </template>
        </EmptyState>
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
        {{ t("pages.feedback.emptyState.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.emptyState.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
