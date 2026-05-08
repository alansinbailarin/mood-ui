<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import MultiSelect from "../../../components/forms/MultiSelect.vue";
import type { PropDoc, EmitDoc } from "../../types";

const { t } = useI18n();

const fruits = [
  { value: "apple", label: "Manzana" },
  { value: "banana", label: "Plátano" },
  { value: "cherry", label: "Cereza" },
  { value: "date", label: "Dátil" },
  { value: "grape", label: "Uva" },
  { value: "kiwi", label: "Kiwi" },
  { value: "mango", label: "Mango" },
  { value: "orange", label: "Naranja" },
  { value: "pear", label: "Pera" },
  { value: "strawberry", label: "Fresa" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<(string | number)[]>(["apple", "banana"]);
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
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
  return `<MultiSelect\n    v-model="values"\n    :options="fruits"\n    label="Frutas"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Frutas"
    placeholder="Elige una o varias"
/>`;

const searchableCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Frutas"
    searchable
    show-select-all
/>`;

const maxChipsCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Compactado"
    :max-visible-chips="2"
/>`;

const maxSelectedCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Hasta 3"
    :max-selected="3"
    helper-text="Máximo 3 opciones"
/>`;

const sizesCode = `<MultiSelect :options="fruits" size="small"  placeholder="Small" />
<MultiSelect :options="fruits" size="medium" placeholder="Medium" />
<MultiSelect :options="fruits" size="large"  placeholder="Large" />`;

const ex1 = ref<(string | number)[]>([]);
const ex2 = ref<(string | number)[]>(["apple", "kiwi", "mango"]);
const ex3 = ref<(string | number)[]>(["apple", "banana", "cherry", "date"]);
const ex4 = ref<(string | number)[]>(["apple"]);

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
                v-for="s in ['small', 'medium', 'large']"
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
          class="w-48"
        />
        <MultiSelect
          :options="fruits"
          size="medium"
          placeholder="Medium"
          class="w-48"
        />
        <MultiSelect
          :options="fruits"
          size="large"
          placeholder="Large"
          class="w-48"
        />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
