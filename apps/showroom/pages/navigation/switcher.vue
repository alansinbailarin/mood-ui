<script setup lang="ts">
import { ref, computed } from "vue";
import { Switcher, Button, Avatar } from "mood-ui";
import type { SwitcherItem } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import {
  BuildingOffice2Icon,
  HomeIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  PencilIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();

useSeoMeta({
  title: () => t("pages.navigation.switcher.title"),
  description: () => t("pages.navigation.switcher.description"),
  ogTitle: () => `${t("pages.navigation.switcher.title")} · mood-ui`,
  ogDescription: () => t("pages.navigation.switcher.description"),
});

const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Enter", "Space", "↓", "↑"], action: t("pages.navigation.switcher.a11y.kbArrow") },
  { keys: ["Home", "End"], action: t("pages.navigation.switcher.a11y.kbHomeEnd") },
  { keys: ["Enter"], action: t("pages.navigation.switcher.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.navigation.switcher.a11y.kbEsc") },
  { keys: ["A–Z", "0–9"], action: t("pages.navigation.switcher.a11y.kbTypeAhead") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: "combobox / listbox / option",
    desc: t("pages.navigation.switcher.a11y.ariaCombobox"),
  },
  {
    attribute: "aria-activedescendant",
    value: "id ref",
    desc: t("pages.navigation.switcher.a11y.ariaActiveDesc"),
  },
]);

// Demo 1: branches
const branchValue = ref<string | number | null>("a");
const branches = computed<SwitcherItem[]>(() => [
  { value: "a", title: "Studio Office", subtitle: "05064005868", icon: BuildingOffice2Icon },
  { value: "b", title: "Sweet Home", subtitle: "05064005214", icon: HomeIcon },
  { value: "c", title: "Cake Shop", subtitle: "05064004220", icon: BuildingStorefrontIcon },
]);

// Demo 2: profiles
const profileValue = ref<string | number | null>("ryan");
const profiles = computed<SwitcherItem[]>(() => [
  { value: "ryan", title: "Ryan Johnson", avatar: { initials: "RJ" } },
  { value: "tim", title: "Tim Johnson", avatar: { initials: "TJ" } },
]);

// Demo 3: compact + custom trigger
const compactValue = ref<string | number | null>("ryan");

// Demo 4: searchable
const searchableValue = ref<string | number | null>(null);
const longList = computed<SwitcherItem[]>(() =>
  Array.from({ length: 14 }, (_, i) => ({
    value: `item-${i}`,
    title: `Workspace ${i + 1}`,
    subtitle: `#${String(1000 + i)}`,
    icon: BuildingOffice2Icon,
  })),
);

const basicCode = `<Switcher v-model="branchId" :items="branches">
  <template #footer="{ close }">
    <Button variant="ghost" :icon="PlusIcon" @click="close()">Add consumer</Button>
  </template>
</Switcher>`;

const profileCode = `<Switcher
  v-model="profileId"
  :items="profiles"
  panel-title="Switch profile"
>
  <template #item-trailing="{ item }">
    <Button variant="ghost" size="small" :icon="PencilIcon" />
  </template>
  <template #footer="{ close }">
    <Button variant="ghost" :icon="PlusIcon" @click="close()">Add new</Button>
    <hr class="my-1 border-t border-border" />
    <Button variant="ghost" :icon="CreditCardIcon">Membership</Button>
    <Button variant="ghost" :icon="ArrowRightOnRectangleIcon">Sign out</Button>
  </template>
</Switcher>`;

const compactCode = `<!-- compactTrigger hides the subtitle line -->
<Switcher v-model="value" :items="profiles" compact-trigger />

<!-- Override via #trigger slot -->
<Switcher v-model="value" :items="profiles">
  <template #trigger="{ activeItem, toggle }">
    <button @click="toggle">
      <Avatar :initials="activeItem?.avatar?.initials" size="small" />
    </button>
  </template>
</Switcher>`;

const searchableCode = `<Switcher v-model="workspaceId" :items="longList" searchable />`;
</script>

<template>
  <ComponentDoc
    :title="t('pages.navigation.switcher.title')"
    :category="t('pages.navigation.switcher.category')"
    import-path="import { Switcher } from 'mood-ui'"
    :description="t('pages.navigation.switcher.description')"
  >
    <template #examples>
      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.basicTitle')"
        :description="t('pages.navigation.switcher.examples.basicDesc')"
        :code="basicCode"
        min-height="220px"
      >
        <Switcher v-model="branchValue" :items="branches">
          <template #footer="{ close }">
            <Button variant="ghost" :icon="PlusIcon" @click="close()">
              {{ t('pages.navigation.switcher.labels.addBranch') }}
            </Button>
          </template>
        </Switcher>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.profileTitle')"
        :description="t('pages.navigation.switcher.examples.profileDesc')"
        :code="profileCode"
        min-height="260px"
      >
        <Switcher
          v-model="profileValue"
          :items="profiles"
          :panel-title="t('pages.navigation.switcher.labels.switchProfile')"
        >
          <template #item-trailing="{ item }">
            <Button
              variant="ghost"
              size="small"
              :icon="PencilIcon"
              :aria-label="t('pages.navigation.switcher.labels.editAria', { name: item.title })"
            />
          </template>
          <template #footer="{ close }">
            <div class="flex flex-col">
              <Button variant="ghost" :icon="PlusIcon" @click="close()">
                {{ t('pages.navigation.switcher.labels.addProfile') }}
              </Button>
              <hr class="my-1 border-t border-border" />
              <Button variant="ghost" :icon="CreditCardIcon">
                {{ t('pages.navigation.switcher.labels.membership') }}
              </Button>
              <Button variant="ghost" :icon="ArrowRightOnRectangleIcon">
                {{ t('pages.navigation.switcher.labels.signOut') }}
              </Button>
            </div>
          </template>
        </Switcher>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.compactTitle')"
        :description="t('pages.navigation.switcher.examples.compactDesc')"
        :code="compactCode"
        min-height="180px"
      >
        <div class="flex items-center gap-6">
          <Switcher v-model="compactValue" :items="profiles" compact-trigger />
          <Switcher v-model="compactValue" :items="profiles">
            <template #trigger="{ activeItem, toggle }">
              <button
                type="button"
                class="inline-flex items-center gap-2 p-1 rounded-full hover:bg-accent border border-border"
                @click="toggle"
              >
                <Avatar :initials="activeItem?.avatar?.initials" size="small" />
              </button>
            </template>
          </Switcher>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.searchableTitle')"
        :description="t('pages.navigation.switcher.examples.searchableDesc')"
        :code="searchableCode"
        min-height="200px"
      >
        <Switcher v-model="searchableValue" :items="longList" searchable />
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc :keyboard-rows="a11yKeyboard" :aria-rows="a11yAria" />
    </template>
  </ComponentDoc>
</template>
