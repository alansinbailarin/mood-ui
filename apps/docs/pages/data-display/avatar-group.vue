<script setup lang="ts">
import { ref, computed } from "vue";
import { Avatar, AvatarGroup, Typography } from "mood-ui";
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
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.dataDisplay.avatarGroup.title"),
  description: () => t("pages.dataDisplay.avatarGroup.description"),
  ogTitle: () => `${t("pages.dataDisplay.avatarGroup.title")} · mood-ui`,
  ogDescription: () => t("pages.dataDisplay.avatarGroup.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.avatarGroup.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.data-display.avatarGroup.a11y.kbShiftTab"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.avatarGroup.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.avatarGroup.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize = ref<"xs" | "small" | "medium" | "large" | "xl">("medium");
const pgMax = ref<3 | 4 | 5 | 6>(4);
const pgBordered = ref(true);
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("full");

function resetPlayground() {
  pgSize.value = "medium";
  pgMax.value = 4;
  pgBordered.value = true;
  pgRadius.value = "full";
}

const typesCode = `export interface AvatarGroup {
  max?: number;
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  bordered?: boolean;
  ariaLabel?: string;
}`;

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  parts.push(`:max="${pgMax.value}"`);
  if (!pgBordered.value) parts.push(':bordered="false"');
  if (pgRadius.value !== "full") parts.push(`radius="${pgRadius.value}"`);
  const attrs = " " + parts.join(" ");
  return `<AvatarGroup${attrs}>
  <Avatar src="https://i.pravatar.cc/80?img=1" />
  <Avatar src="https://i.pravatar.cc/80?img=2" />
  <Avatar src="https://i.pravatar.cc/80?img=3" />
  <Avatar src="https://i.pravatar.cc/80?img=4" />
  <Avatar src="https://i.pravatar.cc/80?img=5" />
  <Avatar src="https://i.pravatar.cc/80?img=6" />
</AvatarGroup>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { AvatarGroup, Avatar } from 'mood-ui';
<\/script>

<template>
  <AvatarGroup>
    <Avatar src="https://i.pravatar.cc/80?img=1" />
    <Avatar src="https://i.pravatar.cc/80?img=2" />
    <Avatar src="https://i.pravatar.cc/80?img=3" />
  </AvatarGroup>
</template>`;

const maxCode = `<script setup lang="ts">
import { AvatarGroup, Avatar } from 'mood-ui';
<\/script>

<template>
  <AvatarGroup :max="3">
    <Avatar src="https://i.pravatar.cc/80?img=5" />
    <Avatar src="https://i.pravatar.cc/80?img=6" />
    <Avatar src="https://i.pravatar.cc/80?img=7" />
    <Avatar src="https://i.pravatar.cc/80?img=8" />
    <Avatar src="https://i.pravatar.cc/80?img=9" />
    <Avatar src="https://i.pravatar.cc/80?img=10" />
  </AvatarGroup>
</template>`;

const sizesCode = `<script setup lang="ts">
import { AvatarGroup, Avatar } from 'mood-ui';
<\/script>

<template>
  <AvatarGroup size="small">
    <Avatar src="https://i.pravatar.cc/80?img=11" />
    <Avatar src="https://i.pravatar.cc/80?img=12" />
    <Avatar src="https://i.pravatar.cc/80?img=13" />
  </AvatarGroup>
  <AvatarGroup size="medium">
    <Avatar src="https://i.pravatar.cc/80?img=14" />
    <Avatar src="https://i.pravatar.cc/80?img=15" />
    <Avatar src="https://i.pravatar.cc/80?img=16" />
  </AvatarGroup>
  <AvatarGroup size="large">
    <Avatar src="https://i.pravatar.cc/80?img=17" />
    <Avatar src="https://i.pravatar.cc/80?img=18" />
    <Avatar src="https://i.pravatar.cc/80?img=19" />
  </AvatarGroup>
</template>`;

const mixedCode = `<script setup lang="ts">
import { AvatarGroup, Avatar } from 'mood-ui';
<\/script>

<template>
  <AvatarGroup :max="4">
    <Avatar src="https://i.pravatar.cc/80?img=20" />
    <Avatar initials="AP" color="primary" />
    <Avatar src="https://i.pravatar.cc/80?img=21" />
    <Avatar initials="MR" color="success" />
    <Avatar />
  </AvatarGroup>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "max",
    type: "number",
    description: t("pages.data-display.avatarGroup.props.max"),
  },
  {
    name: "size",
    type: "'xs' | 'small' | 'medium' | 'large' | 'xl'",
    default: "'medium'",
    description: t("pages.data-display.avatarGroup.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.avatarGroup.props.radius"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.avatarGroup.props.bordered"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.data-display.avatarGroup.props.ariaLabel"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.data-display.avatarGroup.slots.default"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.avatarGroup.title')"
    category="Data Display"
    import-path="import { AvatarGroup } from 'mood-ui'"
    :description="t('pages.data-display.avatarGroup.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="180px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('controls.size')"
            :options="[
              { value: 'xs' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'xl' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbPills
            :label="t('controls.max')"
            :options="[
              { value: '3' },
              { value: '4' },
              { value: '5' },
              { value: '6' },
            ]"
            :model-value="String(pgMax)"
            @update:model-value="pgMax = Number($event) as 3 | 4 | 5 | 6"
          />
          <TbSep />
          <TbPills
            :label="t('controls.radius')"
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
          <TbToggle :label="t('controls.bordered')" v-model="pgBordered" />
        </template>

        <AvatarGroup
          :size="pgSize"
          :max="pgMax"
          :bordered="pgBordered"
          :radius="pgRadius"
        >
          <Avatar src="https://i.pravatar.cc/80?img=1" />
          <Avatar src="https://i.pravatar.cc/80?img=2" />
          <Avatar src="https://i.pravatar.cc/80?img=3" />
          <Avatar src="https://i.pravatar.cc/80?img=4" />
          <Avatar src="https://i.pravatar.cc/80?img=5" />
          <Avatar src="https://i.pravatar.cc/80?img=6" />
        </AvatarGroup>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.avatarGroup.examples.basic.title')"
        :description="t('pages.data-display.avatarGroup.examples.basic.desc')"
        :code="basicCode"
      >
        <AvatarGroup>
          <Avatar src="https://i.pravatar.cc/80?img=1" />
          <Avatar src="https://i.pravatar.cc/80?img=2" />
          <Avatar src="https://i.pravatar.cc/80?img=3" />
        </AvatarGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatarGroup.examples.max.title')"
        :description="t('pages.data-display.avatarGroup.examples.max.desc')"
        :code="maxCode"
      >
        <AvatarGroup :max="3">
          <Avatar src="https://i.pravatar.cc/80?img=5" />
          <Avatar src="https://i.pravatar.cc/80?img=6" />
          <Avatar src="https://i.pravatar.cc/80?img=7" />
          <Avatar src="https://i.pravatar.cc/80?img=8" />
          <Avatar src="https://i.pravatar.cc/80?img=9" />
          <Avatar src="https://i.pravatar.cc/80?img=10" />
        </AvatarGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatarGroup.examples.sizes.title')"
        :description="t('pages.data-display.avatarGroup.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-4 items-start">
          <AvatarGroup size="small">
            <Avatar src="https://i.pravatar.cc/80?img=11" />
            <Avatar src="https://i.pravatar.cc/80?img=12" />
            <Avatar src="https://i.pravatar.cc/80?img=13" />
          </AvatarGroup>
          <AvatarGroup size="medium">
            <Avatar src="https://i.pravatar.cc/80?img=14" />
            <Avatar src="https://i.pravatar.cc/80?img=15" />
            <Avatar src="https://i.pravatar.cc/80?img=16" />
          </AvatarGroup>
          <AvatarGroup size="large">
            <Avatar src="https://i.pravatar.cc/80?img=17" />
            <Avatar src="https://i.pravatar.cc/80?img=18" />
            <Avatar src="https://i.pravatar.cc/80?img=19" />
          </AvatarGroup>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.avatarGroup.examples.mixed.title')"
        :description="t('pages.data-display.avatarGroup.examples.mixed.desc')"
        :code="mixedCode"
      >
        <AvatarGroup :max="4">
          <Avatar src="https://i.pravatar.cc/80?img=20" />
          <Avatar initials="AP" color="primary" />
          <Avatar src="https://i.pravatar.cc/80?img=21" />
          <Avatar initials="MR" color="success" />
          <Avatar />
        </AvatarGroup>
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
        {{ t("pages.data-display.avatarGroup.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.avatarGroup.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
