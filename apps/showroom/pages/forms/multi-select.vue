<script setup lang="ts">
import { ref, computed } from "vue";
import { MultiSelect, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";


import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.multiSelect.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.multiSelect.a11y.kbShiftTab") },
  { keys: ["Enter"], action: t("pages.forms.multiSelect.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.forms.multiSelect.a11y.kbEsc") },
  {
    keys: ["↑", "↓", "Space"],
    action: t("pages.forms.multiSelect.a11y.kbArrow"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.forms.multiSelect.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.multiSelect.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.multiSelect.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.multiSelect.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.multiSelect.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.multiSelect.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.multiSelect.a11y.focusNative"),
  t("pages.forms.multiSelect.a11y.focusTrap"),
]);

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "grape", label: "Grape" },
  { value: "kiwi", label: "Kiwi" },
  { value: "mango", label: "Mango" },
  { value: "orange", label: "Orange" },
  { value: "pear", label: "Pear" },
  { value: "strawberry", label: "Strawberry" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<(string | number)[]>(["apple", "banana"]);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgMaxChips = ref<2 | 4 | 99>(99);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = ["apple", "banana"];
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgMaxChips.value = 99;
  pgDisabled.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "#64748b", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "#22c55e", label: "Success" },
  { value: "warning" as const, bg: "#f59e0b", label: "Warning" },
  { value: "danger" as const, bg: "#ef4444", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgMaxChips.value !== 99)
    parts.push(`:max-visible-chips="${pgMaxChips.value}"`);
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<MultiSelect\n    v-model="values"\n    :options="fruits"\n    label="Fruits"${attrs}\n/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MultiSelect } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const picks = ref<(string | number)[]>([]);

const fruits: SelectOption[] = [
  { value: 'apple',      label: 'Apple' },
  { value: 'banana',     label: 'Banana' },
  { value: 'cherry',     label: 'Cherry' },
  { value: 'date',       label: 'Date' },
  { value: 'grape',      label: 'Grape' },
  { value: 'kiwi',       label: 'Kiwi' },
  { value: 'mango',      label: 'Mango' },
  { value: 'orange',     label: 'Orange' },
  { value: 'pear',       label: 'Pear' },
  { value: 'strawberry', label: 'Strawberry' },
];
<\/script>

<template>
  <MultiSelect
    v-model="picks"
    :options="fruits"
    label="Fruits"
    placeholder="Choose one or more"
  />
</template>`;

const searchableCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MultiSelect } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const picks = ref<(string | number)[]>(['apple', 'kiwi', 'mango']);

const fruits: SelectOption[] = [
  { value: 'apple',      label: 'Apple' },
  { value: 'banana',     label: 'Banana' },
  { value: 'cherry',     label: 'Cherry' },
  { value: 'date',       label: 'Date' },
  { value: 'grape',      label: 'Grape' },
  { value: 'kiwi',       label: 'Kiwi' },
  { value: 'mango',      label: 'Mango' },
  { value: 'orange',     label: 'Orange' },
  { value: 'pear',       label: 'Pear' },
  { value: 'strawberry', label: 'Strawberry' },
];
<\/script>

<template>
  <MultiSelect
    v-model="picks"
    :options="fruits"
    label="Fruits"
    searchable
    show-select-all
  />
</template>`;

const maxChipsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MultiSelect } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const picks = ref<(string | number)[]>(['apple', 'banana', 'cherry', 'date']);

const fruits: SelectOption[] = [
  { value: 'apple',      label: 'Apple' },
  { value: 'banana',     label: 'Banana' },
  { value: 'cherry',     label: 'Cherry' },
  { value: 'date',       label: 'Date' },
  { value: 'grape',      label: 'Grape' },
  { value: 'kiwi',       label: 'Kiwi' },
  { value: 'mango',      label: 'Mango' },
  { value: 'orange',     label: 'Orange' },
  { value: 'pear',       label: 'Pear' },
  { value: 'strawberry', label: 'Strawberry' },
];
<\/script>

<template>
  <MultiSelect
    v-model="picks"
    :options="fruits"
    label="Compact"
    :max-visible-chips="2"
  />
</template>`;

const maxSelectedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MultiSelect } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const picks = ref<(string | number)[]>(['apple']);

const fruits: SelectOption[] = [
  { value: 'apple',  label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date',   label: 'Date' },
  { value: 'grape',  label: 'Grape' },
];
<\/script>

<template>
  <MultiSelect
    v-model="picks"
    :options="fruits"
    label="Up to 3"
    :max-selected="3"
    helper-text="Maximum 3 options"
  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { MultiSelect } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const fruits: SelectOption[] = [
  { value: 'apple',  label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];
<\/script>

<template>
  <MultiSelect :options="fruits" size="small"  placeholder="Small" />
  <MultiSelect :options="fruits" size="medium" placeholder="Medium" />
  <MultiSelect :options="fruits" size="large"  placeholder="Large" />
</template>`;

const ex1 = ref<(string | number)[]>([]);
const ex2 = ref<(string | number)[]>(["apple", "kiwi", "mango"]);
const ex3 = ref<(string | number)[]>(["apple", "banana", "cherry", "date"]);
const ex4 = ref<(string | number)[]>(["apple"]);

const typesCode = `export interface MultiSelect {
  modelValue?: SelectValue[];
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'outline' | 'filled' | 'ghost';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  fullWidth?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  clearable?: boolean;
  showSelectAll?: boolean;
  selectAllLabel?: string;
  deselectAllLabel?: string;
  maxSelected?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  iconLeft?: Component;
  maxVisibleChips?: number;
  id?: string;
  name?: string;
  autofocus?: boolean;
  ariaLabel?: string;
  invalid?: boolean;
  ariaDescribedBy?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "(string | number)[]",
    default: "[]",
    description: t("pages.forms.multiSelect.props.modelValue"),
  },
  {
    name: "options",
    type: "SelectOption[]",
    description: t("pages.forms.multiSelect.props.options"),
    required: true,
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.multiSelect.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Select…'",
    description: t("pages.forms.multiSelect.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.multiSelect.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.multiSelect.props.errorText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.multiSelect.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.multiSelect.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.multiSelect.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.multiSelect.props.radius"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.clearable"),
  },
  {
    name: "searchable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.searchable"),
  },
  {
    name: "showSelectAll",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.showSelectAll"),
  },
  {
    name: "maxSelected",
    type: "number",
    description: t("pages.forms.multiSelect.props.maxSelected"),
  },
  {
    name: "maxVisibleChips",
    type: "number",
    description: t("pages.forms.multiSelect.props.maxVisibleChips"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.loading"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.multiSelect.props.fullWidth"),
  },
  {
    name: "iconLeft",
    type: "Component",
    description: t("pages.forms.multiSelect.props.iconLeft"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.multiSelect.props.name"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.multiSelect.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "(string | number)[]",
    description: t("pages.forms.multiSelect.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "(string | number)[]",
    description: t("pages.forms.multiSelect.emits.change"),
  },
  {
    name: "open",
    payload: "void",
    description: t("pages.forms.multiSelect.emits.open"),
  },
  {
    name: "close",
    payload: "void",
    description: t("pages.forms.multiSelect.emits.close"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.multiSelect.title')"
    category="Forms"
    import-path="import { MultiSelect } from 'mood-ui'"
    :description="t('pages.forms.multiSelect.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <!-- Color dots -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >COLOR</span
            >
            <div class="flex items-center gap-1">
              <button
                v-for="c in colorDots"
                :key="c.value"
                type="button"
                class="size-4 rounded-full transition-all duration-150"
                :class="
                  pgColor === c.value
                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                    : 'hover:scale-110 opacity-70 hover:opacity-100'
                "
                :style="`background: ${c.bg}`"
                :title="c.label"
                @click="pgColor = c.value"
              />
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <!-- Size -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >SIZE</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="s in ['xsmall', 'small', 'medium', 'large']"
                :key="s"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgSize === s
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgSize = s as typeof pgSize"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <!-- Max chips -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >CHIPS</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="m in [2, 4, 99] as const"
                :key="m"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
                :class="
                  pgMaxChips === m
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgMaxChips = m"
              >
                {{ m === 99 ? "all" : m }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgDisabled
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgDisabled = !pgDisabled"
          >
            Disabled
          </button>
        </template>

        <MultiSelect
          v-model="pgValue"
          :options="fruits"
          label="Frutas"
          :color="pgColor"
          :size="pgSize"
          :max-visible-chips="pgMaxChips === 99 ? undefined : pgMaxChips"
          :disabled="pgDisabled"
          class="w-72"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.multiSelect.examples.basic.title')"
        :description="t('pages.forms.multiSelect.examples.basic.desc')"
        :code="basicCode"
      >
        <MultiSelect
          v-model="ex1"
          :options="fruits"
          label="Frutas"
          placeholder="Elige una o varias"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.multiSelect.examples.searchable.title')"
        :description="t('pages.forms.multiSelect.examples.searchable.desc')"
        :code="searchableCode"
      >
        <MultiSelect
          v-model="ex2"
          :options="fruits"
          label="Frutas"
          searchable
          show-select-all
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.multiSelect.examples.maxChips.title')"
        :description="t('pages.forms.multiSelect.examples.maxChips.desc')"
        :code="maxChipsCode"
      >
        <MultiSelect
          v-model="ex3"
          :options="fruits"
          label="Compactado"
          :max-visible-chips="2"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.multiSelect.examples.maxSelected.title')"
        :description="t('pages.forms.multiSelect.examples.maxSelected.desc')"
        :code="maxSelectedCode"
      >
        <MultiSelect
          v-model="ex4"
          :options="fruits"
          label="Hasta 3"
          :max-selected="3"
          helper-text="Máximo 3 opciones"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.multiSelect.examples.sizes.title')"
        :description="t('pages.forms.multiSelect.examples.sizes.desc')"
        :code="sizesCode"
      >
        <MultiSelect
          :options="fruits"
          size="small"
          placeholder="Small"
          ariaLabel="Small"
          class="w-48"
        />
        <MultiSelect
          :options="fruits"
          size="medium"
          placeholder="Medium"
          ariaLabel="Medium"
          class="w-48"
        />
        <MultiSelect
          :options="fruits"
          size="large"
          placeholder="Large"
          ariaLabel="Large"
          class="w-48"
        />
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.multiSelect.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.multiSelect.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
