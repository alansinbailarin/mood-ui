<script setup lang="ts">
import { ref, computed } from "vue";
import { Switcher, Avatar } from "mood-ui";
import type { SwitcherItem } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
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

// ── Data ──────────────────────────────────────────────────────────────────────
const branches = computed<SwitcherItem[]>(() => [
  { value: "a", title: "Studio Office", subtitle: "05064005868", icon: BuildingOffice2Icon },
  { value: "b", title: "Sweet Home", subtitle: "05064005214", icon: HomeIcon },
  { value: "c", title: "Cake Shop", subtitle: "05064004220", icon: BuildingStorefrontIcon },
]);

const profiles = computed<SwitcherItem[]>(() => [
  { value: "ryan", title: "Ryan Johnson", subtitle: "ryan@kevdu.co", avatar: { initials: "RJ" } },
  { value: "tim", title: "Tim Johnson", subtitle: "tim@kevdu.co", avatar: { initials: "TJ" } },
]);

const longList = computed<SwitcherItem[]>(() =>
  Array.from({ length: 14 }, (_, i) => ({
    value: `ws-${i}`,
    title: `Workspace ${i + 1}`,
    subtitle: `Team #${String(1000 + i)}`,
    icon: BuildingOffice2Icon,
  })),
);

// ── Playground ────────────────────────────────────────────────────────────────
const pgChevron = ref<"updown" | "down" | "none">("updown");
const pgTriggerVariant = ref<"outline" | "ghost" | "filled">("outline");
const pgSearchable = ref(false);
const pgCompact = ref(false);
const pgDisabled = ref(false);
const pgValue = ref<string | number | null>("a");

function resetPlayground() {
  pgChevron.value = "updown";
  pgTriggerVariant.value = "outline";
  pgSearchable.value = false;
  pgCompact.value = false;
  pgDisabled.value = false;
  pgValue.value = "a";
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgChevron.value !== "updown") parts.push(`chevron="${pgChevron.value}"`);
  if (pgTriggerVariant.value !== "outline")
    parts.push(`trigger-variant="${pgTriggerVariant.value}"`);
  if (pgSearchable.value) parts.push("searchable");
  if (pgCompact.value) parts.push("compact-trigger");
  if (pgDisabled.value) parts.push("disabled");
  const attrs = parts.length ? "\n  " + parts.join("\n  ") + "\n" : " ";
  return `<Switcher\n  v-model="branchId"\n  :items="branches"${attrs}/>`;
});

// ── Example code snippets ─────────────────────────────────────────────────────
const branchValue = ref<string | number | null>("a");
const branchCode = `<Switcher v-model="branchId" :items="branches">
  <template #footer="{ close }">
    <button class="modo-footer-row" @click="close()">
      <PlusIcon class="size-5 text-muted-foreground" />
      <span>Add consumer</span>
    </button>
  </template>
</Switcher>`;

const profileValue = ref<string | number | null>("ryan");
const profileCode = `<Switcher
  v-model="profileId"
  :items="profiles"
  panel-title="Switch profile"
>
  <template #item-trailing="{ item }">
    <button class="modo-icon-btn" :aria-label="\`Edit \${item.title}\`">
      <PencilIcon class="size-4" />
    </button>
  </template>
  <template #footer="{ close }">
    <button class="modo-footer-row" @click="close()">
      <PlusIcon class="size-5" /> <span>Add new</span>
    </button>
    <hr class="my-1 border-t border-border" />
    <button class="modo-footer-row">
      <CreditCardIcon class="size-5" /> <span>Membership</span>
    </button>
    <button class="modo-footer-row">
      <ArrowRightOnRectangleIcon class="size-5" /> <span>Sign out</span>
    </button>
  </template>
</Switcher>`;

const compactValue = ref<string | number | null>("ryan");
const compactCode = `<!-- compactTrigger hides the subtitle line -->
<Switcher v-model="value" :items="profiles" compact-trigger />

<!-- Avatar-only trigger via the #trigger slot -->
<Switcher v-model="value" :items="profiles">
  <template #trigger="{ activeItem, toggle }">
    <button class="modo-avatar-trigger" @click="toggle">
      <Avatar :initials="activeItem?.avatar?.initials" size="medium" />
    </button>
  </template>
</Switcher>`;

const searchableValue = ref<string | number | null>(null);
const searchableCode = `<Switcher
  v-model="workspaceId"
  :items="longList"
  searchable
/>`;

// ── A11y ──────────────────────────────────────────────────────────────────────
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
    value: "combobox · listbox · option",
    desc: t("pages.navigation.switcher.a11y.ariaCombobox"),
  },
  {
    attribute: "aria-activedescendant",
    value: "id ref",
    desc: t("pages.navigation.switcher.a11y.ariaActiveDesc"),
  },
]);

// ── API reference ─────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
  { name: "modelValue", type: "string | number | null", default: "null", description: "v-model — value of the active item." },
  { name: "items", type: "SwitcherItem[]", required: true, description: "Items rendered in the panel." },
  { name: "placeholder", type: "string", default: "locale", description: "Trigger primary text when no item is active." },
  { name: "compactTrigger", type: "boolean", default: "false", description: "Hides the secondary line in the trigger." },
  { name: "chevron", type: "'updown' | 'down' | 'none'", default: "'updown'", description: "Indicator icon shown on the trigger." },
  { name: "triggerVariant", type: "'outline' | 'ghost' | 'filled'", default: "'outline'", description: "Visual style of the default trigger." },
  { name: "fullWidth", type: "boolean", default: "false", description: "Trigger spans the full width of its container." },
  { name: "panelTitle", type: "string", description: "Optional heading rendered above the list." },
  { name: "panelWidth", type: "'trigger' | 'auto'", default: "'trigger'", description: "Whether the panel matches the trigger width or sizes to content." },
  { name: "panelMinWidth", type: "number | string", default: "'15rem'", description: "Minimum panel width — floors a narrow trigger." },
  { name: "panelMaxHeight", type: "number | string", default: "320", description: "Max panel height; the list scrolls beyond it." },
  { name: "placement", type: "PopoverPlacement", default: "'bottom-start'", description: "Panel placement relative to the trigger." },
  { name: "searchable", type: "boolean", default: "false", description: "Renders a search input at the top of the panel." },
  { name: "searchPlaceholder", type: "string", default: "locale", description: "Placeholder for the search input." },
  { name: "searchFields", type: "Array<'title' | 'subtitle'>", default: "['title','subtitle']", description: "Fields used for local filtering." },
  { name: "noResultsText", type: "string", default: "locale", description: "Text shown when the filter matches no items." },
  { name: "loading", type: "boolean", default: "false", description: "Replaces items with three skeleton rows." },
  { name: "emptyText", type: "string", default: "locale", description: "Text shown when items is empty." },
  { name: "disabled", type: "boolean", default: "false", description: "Disables the whole switcher." },
  { name: "color", type: "ModoColor", description: "Semantic color. Inherits from ModoProvider." },
  { name: "radius", type: "ModoRadius", description: "Corner radius. Inherits from ModoProvider." },
  { name: "size", type: "ModoSize", description: "Size scale. Inherits from ModoProvider." },
  { name: "ariaLabel", type: "string", default: "locale", description: "Accessible name for the trigger." },
];

const emitsList: EmitDoc[] = [
  { name: "update:modelValue", payload: "value", description: "Fired when a new item is selected (v-model)." },
  { name: "change", payload: "value, item", description: "Like update:modelValue, but also passes the full item." },
  { name: "open", payload: "—", description: "Fired when the panel opens." },
  { name: "close", payload: "—", description: "Fired when the panel closes." },
  { name: "search", payload: "query", description: "Fired on every search input change (for remote search)." },
];

const slotsList: SlotDoc[] = [
  { name: "trigger", bindings: "{ activeItem, isOpen, toggle }", description: "Replaces the default trigger pill entirely." },
  { name: "item-trailing", bindings: "{ item, active, close }", description: "Content on the right of each item (edit pencil, badge…)." },
  { name: "footer", bindings: "{ close }", description: "Free zone below the items, separated by a divider." },
  { name: "empty", description: "Overrides the empty state." },
  { name: "loading", description: "Overrides the loading state." },
];
</script>

<template>
  <ComponentDoc
    :title="t('pages.navigation.switcher.title')"
    :category="t('pages.navigation.switcher.category')"
    import-path="import { Switcher } from 'mood-ui'"
    :description="t('pages.navigation.switcher.description')"
    :props-list="propsList"
    :emits-list="emitsList"
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
            label="Chevron"
            :options="[
              { value: 'updown' },
              { value: 'down' },
              { value: 'none' },
            ]"
            v-model="pgChevron"
          />
          <TbSep />
          <TbPills
            label="Trigger"
            :options="[
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'filled' },
            ]"
            v-model="pgTriggerVariant"
          />
          <TbSep />
          <TbToggle label="Searchable" v-model="pgSearchable" />
          <TbToggle label="Compact" v-model="pgCompact" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <Switcher
          v-model="pgValue"
          :items="branches"
          :chevron="pgChevron"
          :trigger-variant="pgTriggerVariant"
          :searchable="pgSearchable"
          :compact-trigger="pgCompact"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.basicTitle')"
        :description="t('pages.navigation.switcher.examples.basicDesc')"
        :code="branchCode"
        min-height="240px"
      >
        <Switcher v-model="branchValue" :items="branches">
          <template #footer="{ close }">
            <button type="button" class="modo-footer-row" @click="close()">
              <PlusIcon class="size-5 text-muted-foreground" />
              <span>{{ t('pages.navigation.switcher.labels.addBranch') }}</span>
            </button>
          </template>
        </Switcher>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.profileTitle')"
        :description="t('pages.navigation.switcher.examples.profileDesc')"
        :code="profileCode"
        min-height="300px"
      >
        <Switcher
          v-model="profileValue"
          :items="profiles"
          :panel-title="t('pages.navigation.switcher.labels.switchProfile')"
        >
          <template #item-trailing="{ item }">
            <button
              type="button"
              class="modo-icon-btn"
              :aria-label="t('pages.navigation.switcher.labels.editAria', { name: item.title })"
              @click.stop
            >
              <PencilIcon class="size-4" />
            </button>
          </template>
          <template #footer="{ close }">
            <button type="button" class="modo-footer-row" @click="close()">
              <PlusIcon class="size-5 text-muted-foreground" />
              <span>{{ t('pages.navigation.switcher.labels.addProfile') }}</span>
            </button>
            <hr class="my-1 border-t border-border" />
            <button type="button" class="modo-footer-row">
              <CreditCardIcon class="size-5 text-muted-foreground" />
              <span>{{ t('pages.navigation.switcher.labels.membership') }}</span>
            </button>
            <button type="button" class="modo-footer-row">
              <ArrowRightOnRectangleIcon class="size-5 text-muted-foreground" />
              <span>{{ t('pages.navigation.switcher.labels.signOut') }}</span>
            </button>
          </template>
        </Switcher>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.compactTitle')"
        :description="t('pages.navigation.switcher.examples.compactDesc')"
        :code="compactCode"
        min-height="220px"
      >
        <div class="flex items-center gap-8">
          <Switcher v-model="compactValue" :items="profiles" compact-trigger />
          <Switcher v-model="compactValue" :items="profiles">
            <template #trigger="{ activeItem, toggle }">
              <button
                type="button"
                class="rounded-full p-0.5 ring-1 ring-border hover:ring-primary/40 transition-shadow cursor-pointer"
                @click="toggle"
              >
                <Avatar :initials="activeItem?.avatar?.initials" size="medium" />
              </button>
            </template>
          </Switcher>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.navigation.switcher.examples.searchableTitle')"
        :description="t('pages.navigation.switcher.examples.searchableDesc')"
        :code="searchableCode"
        min-height="260px"
      >
        <Switcher v-model="searchableValue" :items="longList" searchable />
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc :keyboard-rows="a11yKeyboard" :aria-rows="a11yAria" />
    </template>
  </ComponentDoc>
</template>

<style scoped>
/* Footer rows — full-width menu-style buttons used inside #footer. */
.modo-footer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--foreground);
  cursor: pointer;
  transition: background-color 120ms ease;
}
.modo-footer-row:hover {
  background-color: var(--accent);
}

/* Small square icon button used in #item-trailing. */
.modo-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: background-color 120ms ease;
}
.modo-icon-btn:hover {
  background-color: var(--accent);
  color: var(--foreground);
}
</style>
