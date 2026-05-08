<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import AvatarGroup from "../../../components/data-display/avatar/AvatarGroup.vue";
import Avatar from "../../../components/data-display/avatar/Avatar.vue";
import type { PropDoc, SlotDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

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
const basicCode = `<AvatarGroup>
  <Avatar src="https://i.pravatar.cc/80?img=1" />
  <Avatar src="https://i.pravatar.cc/80?img=2" />
  <Avatar src="https://i.pravatar.cc/80?img=3" />
</AvatarGroup>`;

const maxCode = `<AvatarGroup :max="3">
  <Avatar src="https://i.pravatar.cc/80?img=5" />
  <Avatar src="https://i.pravatar.cc/80?img=6" />
  <Avatar src="https://i.pravatar.cc/80?img=7" />
  <Avatar src="https://i.pravatar.cc/80?img=8" />
  <Avatar src="https://i.pravatar.cc/80?img=9" />
  <Avatar src="https://i.pravatar.cc/80?img=10" />
</AvatarGroup>`;

const sizesCode = `<AvatarGroup size="small">…</AvatarGroup>
<AvatarGroup size="medium">…</AvatarGroup>
<AvatarGroup size="large">…</AvatarGroup>`;

const mixedCode = `<AvatarGroup :max="4">
  <Avatar src="https://i.pravatar.cc/80?img=20" />
  <Avatar initials="AP" color="primary" />
  <Avatar src="https://i.pravatar.cc/80?img=21" />
  <Avatar initials="MR" color="success" />
  <Avatar />
</AvatarGroup>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "max",
    type: "number",
    description: t("pages.dataDisplay.avatarGroup.props.max"),
  },
  {
    name: "size",
    type: "'xs' | 'small' | 'medium' | 'large' | 'xl'",
    default: "'medium'",
    description: t("pages.dataDisplay.avatarGroup.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.dataDisplay.avatarGroup.props.radius"),
  },
  {
    name: "bordered",
    type: "boolean",
    default: "true",
    description: t("pages.dataDisplay.avatarGroup.props.bordered"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.dataDisplay.avatarGroup.props.ariaLabel"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  {
    name: "default",
    description: t("pages.dataDisplay.avatarGroup.slots.default"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.dataDisplay.avatarGroup.title')"
    category="Data Display"
    import-path="import { AvatarGroup } from 'mood-ui'"
    :description="t('pages.dataDisplay.avatarGroup.description')"
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
        :title="t('pages.dataDisplay.avatarGroup.examples.basic.title')"
        :description="t('pages.dataDisplay.avatarGroup.examples.basic.desc')"
        :code="basicCode"
      >
        <AvatarGroup>
          <Avatar src="https://i.pravatar.cc/80?img=1" />
          <Avatar src="https://i.pravatar.cc/80?img=2" />
          <Avatar src="https://i.pravatar.cc/80?img=3" />
        </AvatarGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.avatarGroup.examples.max.title')"
        :description="t('pages.dataDisplay.avatarGroup.examples.max.desc')"
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
        :title="t('pages.dataDisplay.avatarGroup.examples.sizes.title')"
        :description="t('pages.dataDisplay.avatarGroup.examples.sizes.desc')"
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
        :title="t('pages.dataDisplay.avatarGroup.examples.mixed.title')"
        :description="t('pages.dataDisplay.avatarGroup.examples.mixed.desc')"
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
  </ComponentDoc>
</template>
