<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Combobox from "../../../components/forms/Combobox.vue";
import type { PropDoc, EmitDoc } from "../../types";
import type { SelectOption } from "../../../interfaces/forms/Select.interface";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.combobox.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.combobox.a11y.kbShiftTab") },
  { keys: ["Type"], action: t("pages.forms.combobox.a11y.kbType") },
  { keys: ["Enter"], action: t("pages.forms.combobox.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.forms.combobox.a11y.kbEsc") },
  { keys: ["↑", "↓"], action: t("pages.forms.combobox.a11y.kbArrow") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.forms.combobox.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.combobox.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.combobox.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.combobox.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.combobox.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.combobox.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.combobox.a11y.focusNative"),
  t("pages.forms.combobox.a11y.focusTrap"),
]);

const frameworks = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik" },
  { value: "astro", label: "Astro" },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<string | null>("Vue");
const pgColor = ref<"default" | "primary" | "success" | "warning" | "danger">(
  "primary",
);
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgFreeSolo = ref(true);
const pgClearable = ref(true);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "Vue";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgFreeSolo.value = true;
  pgClearable.value = true;
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
  if (pgFreeSolo.value) parts.push("free-solo");
  if (pgClearable.value) parts.push("clearable");
  if (pgDisabled.value) parts.push(':disabled="true"');
  const attrs = parts.length ? "\n    " + parts.join("\n    ") : "";
  return `<Combobox\n    v-model="value"\n    :options="frameworks"\n    label="Framework"${attrs}\n/>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Combobox } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const value = ref<string | null>(null);

const frameworks: SelectOption[] = [
  { value: 'vue',     label: 'Vue' },
  { value: 'react',   label: 'React' },
  { value: 'svelte',  label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid',   label: 'Solid' },
  { value: 'qwik',    label: 'Qwik' },
  { value: 'astro',   label: 'Astro' },
];
<\/script>

<template>
  <Combobox
    v-model="value"
    :options="frameworks"
    label="Framework"
    placeholder="Search framework…"
  />
</template>`;

const freeSoloCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Combobox } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const value = ref<string | null>(null);

const frameworks = ref<SelectOption[]>([
  { value: 'vue',     label: 'Vue' },
  { value: 'react',   label: 'React' },
  { value: 'svelte',  label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid',   label: 'Solid' },
  { value: 'qwik',    label: 'Qwik' },
  { value: 'astro',   label: 'Astro' },
]);

function onChange(val: string, option: SelectOption | null) {
  if (!option && !frameworks.value.some((o) => o.value === val)) {
    frameworks.value.push({ value: val, label: val });
  }
}
<\/script>

<template>
  <Combobox
    v-model="value"
    :options="frameworks"
    label="Framework (add your own)"
    free-solo
    placeholder="Vue, React, or yours…"
    @change="onChange"
  />
</template>`;

const strictCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Combobox } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const value = ref<string | null>(null);

const frameworks: SelectOption[] = [
  { value: 'vue',     label: 'Vue' },
  { value: 'react',   label: 'React' },
  { value: 'svelte',  label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid',   label: 'Solid' },
  { value: 'qwik',    label: 'Qwik' },
  { value: 'astro',   label: 'Astro' },
];
<\/script>

<template>
  <Combobox
    v-model="value"
    :options="frameworks"
    label="Listed frameworks only"
    :free-solo="false"
    placeholder="Start typing…"
  />
</template>`;

const asyncCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Combobox } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const value = ref<string | null>(null);

async function loadOptions(query: string): Promise<SelectOption[]> {
  const res = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
  return res.json();
}
<\/script>

<template>
  <Combobox
    v-model="value"
    :load-options="loadOptions"
    :debounce="250"
    :min-chars="2"
    label="Búsqueda async"
  />
</template>`;

const sizesCode = `<script setup lang="ts">
import { Combobox } from 'mood-ui';
import type { SelectOption } from 'mood-ui';

const frameworks: SelectOption[] = [
  { value: 'vue',   label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
];
<\/script>

<template>
  <Combobox :options="frameworks" size="small"  placeholder="Small" />
  <Combobox :options="frameworks" size="medium" placeholder="Medium" />
  <Combobox :options="frameworks" size="large"  placeholder="Large" />
</template>`;

const ex1 = ref<string | null>(null);
const ex2 = ref<string | null>(null);
const ex2Options = ref<SelectOption[]>([
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik" },
  { value: "astro", label: "Astro" },
]);
function onEx2Change(value: string, option: SelectOption | null) {
  if (!option && !ex2Options.value.some((o) => o.value === value)) {
    ex2Options.value.push({ value, label: value });
  }
}
const ex3 = ref<string | null>(null);

async function demoLoad(query: string) {
  await new Promise((r) => setTimeout(r, 300));
  return frameworks.filter((f) =>
    f.label.toLowerCase().includes(query.toLowerCase()),
  );
}
const ex4 = ref<string | null>(null);

const typesCode = `export interface Combobox {
  modelValue?: SelectValue | null;
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
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  iconLeft?: Component;
  panelWidth?: 'trigger' | 'auto';
  panelMinWidth?: number | string;
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
    type: "string | null",
    description: t("pages.forms.combobox.props.modelValue"),
  },
  {
    name: "options",
    type: "SelectOption[]",
    description: t("pages.forms.combobox.props.options"),
  },
  {
    name: "loadOptions",
    type: "(query: string) => Promise<SelectOption[]>",
    description: t("pages.forms.combobox.props.loadOptions"),
  },
  {
    name: "debounce",
    type: "number",
    default: "200",
    description: t("pages.forms.combobox.props.debounce"),
  },
  {
    name: "minChars",
    type: "number",
    default: "0",
    description: t("pages.forms.combobox.props.minChars"),
  },
  {
    name: "freeSolo",
    type: "boolean",
    default: "true",
    description: t("pages.forms.combobox.props.freeSolo"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.combobox.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    description: t("pages.forms.combobox.props.placeholder"),
  },
  {
    name: "helperText",
    type: "string",
    description: t("pages.forms.combobox.props.helperText"),
  },
  {
    name: "errorText",
    type: "string",
    description: t("pages.forms.combobox.props.errorText"),
  },
  {
    name: "emptyText",
    type: "string",
    default: "'No results.'",
    description: t("pages.forms.combobox.props.emptyText"),
  },
  {
    name: "loadingText",
    type: "string",
    description: t("pages.forms.combobox.props.loadingText"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.combobox.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.combobox.props.color"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.combobox.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.combobox.props.radius"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.combobox.props.clearable"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.combobox.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.combobox.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.combobox.props.required"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.combobox.props.loading"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.combobox.props.fullWidth"),
  },
  {
    name: "iconLeft",
    type: "Component",
    description: t("pages.forms.combobox.props.iconLeft"),
  },
  {
    name: "maxLength",
    type: "number",
    description: t("pages.forms.combobox.props.maxLength"),
  },
  {
    name: "name",
    type: "string",
    description: t("pages.forms.combobox.props.name"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.combobox.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | null",
    description: t("pages.forms.combobox.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "string | null",
    description: t("pages.forms.combobox.emits.change"),
  },
  {
    name: "select",
    payload: "SelectOption",
    description: t("pages.forms.combobox.emits.select"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.combobox.title')"
    :category="t('pages.forms.combobox.category')"
    import-path="import { Combobox } from 'mood-ui'"
    :description="t('pages.forms.combobox.description')"
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

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgFreeSolo
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgFreeSolo = !pgFreeSolo"
          >
            Free solo
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgClearable
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgClearable = !pgClearable"
          >
            Clearable
          </button>

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

        <Combobox
          v-model="pgValue"
          :options="frameworks"
          label="Framework"
          :color="pgColor"
          :size="pgSize"
          :free-solo="pgFreeSolo"
          :clearable="pgClearable"
          :disabled="pgDisabled"
          class="w-64"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.combobox.examples.basic.title')"
        :description="t('pages.forms.combobox.examples.basic.desc')"
        :code="basicCode"
      >
        <Combobox
          v-model="ex1"
          :options="frameworks"
          label="Framework"
          placeholder="Buscar framework…"
          class="w-64"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.combobox.examples.freeSolo.title')"
        :description="t('pages.forms.combobox.examples.freeSolo.desc')"
        :code="freeSoloCode"
      >
        <Combobox
          v-model="ex2"
          :options="ex2Options"
          label="Framework (puedes inventar uno)"
          free-solo
          placeholder="Vue, React o el tuyo…"
          class="w-64"
          @change="onEx2Change"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.combobox.examples.strict.title')"
        :description="t('pages.forms.combobox.examples.strict.desc')"
        :code="strictCode"
      >
        <Combobox
          v-model="ex3"
          :options="frameworks"
          label="Solo frameworks listados"
          :free-solo="false"
          placeholder="Empieza a escribir…"
          class="w-64"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.combobox.examples.async.title')"
        :description="t('pages.forms.combobox.examples.async.desc')"
        :code="asyncCode"
      >
        <Combobox
          v-model="ex4"
          :load-options="demoLoad"
          :debounce="250"
          :min-chars="1"
          label="Búsqueda async"
          class="w-64"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.combobox.examples.sizes.title')"
        :description="t('pages.forms.combobox.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Combobox
          :options="frameworks"
          size="small"
          placeholder="Small"
          ariaLabel="Small"
          class="w-48"
        />
        <Combobox
          :options="frameworks"
          size="medium"
          placeholder="Medium"
          ariaLabel="Medium"
          class="w-48"
        />
        <Combobox
          :options="frameworks"
          size="large"
          placeholder="Large"
          ariaLabel="Large"
          class="w-48"
        />
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.forms.combobox.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.combobox.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
