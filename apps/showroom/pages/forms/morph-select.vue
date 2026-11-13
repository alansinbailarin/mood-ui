<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { MorphSelect, Typography } from "mood-ui";
import { GlobeAmericasIcon } from "@heroicons/vue/24/outline";
import type { MorphSelectOption } from "mood-ui";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const k = (key: string) => t(`pages.forms.morphSelect.${key}`);

type Variant = "outline" | "filled" | "ghost";
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: k("a11y.kbTab") },
  { keys: ["Shift+Tab"], action: k("a11y.kbShiftTab") },
  { keys: ["↑", "↓"], action: k("a11y.kbOpen") },
  { keys: ["Home", "End"], action: k("a11y.kbHomeEnd") },
  { keys: ["Enter", "Space"], action: k("a11y.kbSelect") },
  { keys: ["Escape"], action: k("a11y.kbEsc") },
  { keys: ["A–Z"], action: k("a11y.kbType") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "role", value: '"combobox"', desc: k("a11y.roleCombobox") },
  { attribute: "aria-expanded", value: "true", desc: k("a11y.ariaExpanded") },
  { attribute: "aria-selected", value: "true", desc: k("a11y.ariaSelected") },
  { attribute: "aria-multiselectable", value: "true", desc: k("a11y.ariaMultiselectable") },
  { attribute: "aria-invalid", value: "true", desc: k("a11y.ariaInvalid") },
  { attribute: "aria-required", value: "true", desc: k("a11y.ariaRequired") },
  { attribute: "aria-describedby", value: "id", desc: k("a11y.ariaDescribedBy") },
  { attribute: "aria-label", value: "string", desc: k("a11y.ariaLabel") },
]);

const a11yFocus = computed<string[]>(() => [
  k("a11y.focusOpen"),
  k("a11y.focusReducedMotion"),
]);

// ── Options ───────────────────────────────────────────────────────────────────
const countries = computed<MorphSelectOption[]>(() => [
  { value: "mx", label: k("options.mx"), description: "MXN" },
  { value: "us", label: k("options.us"), description: "USD" },
  { value: "ca", label: k("options.ca"), description: "CAD" },
  { value: "br", label: k("options.br"), description: "BRL", disabled: true },
  { value: "ar", label: k("options.ar"), description: "ARS" },
  { value: "co", label: k("options.co"), description: "COP" },
]);

// ── Overview playground state ─────────────────────────────────────────────────
// Size and radius start undefined so the field follows the showroom's
// ModoProvider until a pill is picked.
const pgValue = ref("mx");
const pgVariant = ref<Variant>("outline");
const pgColor = ref<Color>("primary");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgSearchable = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgValue.value = "mx";
  pgVariant.value = "outline";
  pgColor.value = "primary";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgSearchable.value = false;
  pgDisabled.value = false;
}

const colorDots = computed(() => [
  { value: "default", bg: "var(--color-slate-400)", label: k("controls.colors.default") },
  { value: "primary", bg: "var(--primary)", label: k("controls.colors.primary") },
  { value: "success", bg: "var(--color-emerald-500)", label: k("controls.colors.success") },
  { value: "warning", bg: "var(--color-amber-500)", label: k("controls.colors.warning") },
  { value: "danger", bg: "var(--color-red-500)", label: k("controls.colors.danger") },
]);

const exampleVariants: Variant[] = ["outline", "filled", "ghost"];
const exampleSizes: Size[] = ["small", "medium", "large"];

const overviewCode = computed(() => {
  const root: string[] = ['v-model="country"', ':options="countries"', 'label="Country"'];
  if (pgColor.value !== "default") root.push(`color="${pgColor.value}"`);
  if (pgSize.value) root.push(`size="${pgSize.value}"`);
  if (pgRadius.value) root.push(`radius="${pgRadius.value}"`);
  if (pgDisabled.value) root.push("disabled");
  const trigger =
    pgVariant.value !== "outline"
      ? `<MorphSelect.Trigger placeholder="Choose a country" variant="${pgVariant.value}" />`
      : `<MorphSelect.Trigger placeholder="Choose a country" />`;
  const content = pgSearchable.value
    ? "<MorphSelect.Content searchable />"
    : "<MorphSelect.Content />";
  return `<MorphSelect
  ${root.join("\n  ")}
>
  ${trigger}
  ${content}
</MorphSelect>`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const ex1 = ref<string | undefined>(undefined);
const ex2 = ref("ca");
const exMulti = ref<string[]>(["mx", "ca"]);
const exIcon = ref("us");
const exVariant = ref("us");

// ── Example code strings (self-contained) ─────────────────────────────────────
const optionsSnippet = `const countries: MorphSelectOption[] = [
  { value: 'mx', label: 'Mexico',        description: 'MXN' },
  { value: 'us', label: 'United States', description: 'USD' },
  { value: 'ca', label: 'Canada',        description: 'CAD' },
  { value: 'br', label: 'Brazil',        description: 'BRL', disabled: true },
  { value: 'ar', label: 'Argentina',     description: 'ARS' },
  { value: 'co', label: 'Colombia',      description: 'COP' },
];`;

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MorphSelect } from 'mood-ui';
import type { MorphSelectOption } from 'mood-ui';

const country = ref<string>();

${optionsSnippet}
<\/script>

<template>
  <MorphSelect v-model="country" :options="countries" label="Country">
    <MorphSelect.Trigger placeholder="Choose a country" />
    <MorphSelect.Content />
  </MorphSelect>
</template>`;

const searchableCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MorphSelect } from 'mood-ui';
import type { MorphSelectOption } from 'mood-ui';

const country = ref('ca');

${optionsSnippet}
<\/script>

<template>
  <MorphSelect v-model="country" :options="countries" label="Country">
    <MorphSelect.Trigger />
    <MorphSelect.Content
      searchable
      search-placeholder="Search countries…"
      empty-message="No matching countries"
    />
  </MorphSelect>
</template>`;

const multipleCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MorphSelect } from 'mood-ui';
import type { MorphSelectOption } from 'mood-ui';

// With multiple, v-model is an array in option order.
const markets = ref<string[]>(['mx', 'ca']);

${optionsSnippet}
<\/script>

<template>
  <MorphSelect v-model="markets" multiple name="markets" :options="countries" label="Markets">
    <MorphSelect.Trigger placeholder="Pick markets" />
    <MorphSelect.Content searchable />
  </MorphSelect>
</template>`;

const iconCode = `<script setup lang="ts">
import { ref } from 'vue';
import { MorphSelect } from 'mood-ui';
import { GlobeAmericasIcon } from '@heroicons/vue/24/outline';

const country = ref('us');
<\/script>

<template>
  <MorphSelect v-model="country" :options="countries" label="Country">
    <!-- or <template #icon>…</template> for any custom glyph -->
    <MorphSelect.Trigger :icon="GlobeAmericasIcon" />
    <MorphSelect.Content />
  </MorphSelect>
</template>`;

const variantsCode = `<template>
  <MorphSelect v-model="country" :options="countries" aria-label="Outline">
    <MorphSelect.Trigger variant="outline" />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect v-model="country" :options="countries" aria-label="Filled">
    <MorphSelect.Trigger variant="filled" />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect v-model="country" :options="countries" aria-label="Ghost">
    <MorphSelect.Trigger variant="ghost" />
    <MorphSelect.Content />
  </MorphSelect>
</template>`;

const sizesCode = `<template>
  <MorphSelect :options="countries" size="small"  default-value="mx" aria-label="Small">
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect :options="countries" size="medium" default-value="mx" aria-label="Medium">
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect :options="countries" size="large"  default-value="mx" aria-label="Large">
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
</template>`;

const statesCode = `<template>
  <MorphSelect :options="countries" label="Country" helper-text="Choose the billing country.">
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect :options="countries" label="Disabled" default-value="mx" disabled>
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect :options="countries" label="Read only" default-value="us" readonly>
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
  <MorphSelect :options="countries" label="Country" required error-text="Choose a supported country.">
    <MorphSelect.Trigger />
    <MorphSelect.Content />
  </MorphSelect>
</template>`;

const formCode = `<script setup lang="ts">
import { MorphSelect } from 'mood-ui';
import type { MorphSelectOption } from 'mood-ui';

${optionsSnippet}
<\/script>

<template>
  <form>
    <!-- Submits shipping=co; a form reset restores defaultValue -->
    <MorphSelect :options="countries" name="shipping" default-value="co" label="Shipping country">
      <MorphSelect.Trigger />
      <MorphSelect.Content />
    </MorphSelect>
  </form>
</template>`;

const typesCode = `export interface MorphSelectOption {
  value: string;
  label: VNodeChild;
  description?: VNodeChild;
  disabled?: boolean;
  textValue?: string;
}

export interface MorphSelectProps {
  options: readonly MorphSelectOption[];
  modelValue?: string;
  defaultValue?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  invalid?: boolean;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  halo?: 'tinted' | 'neutral' | 'off';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface MorphSelectTriggerProps {
  placeholder?: string;
  variant?: 'outline' | 'filled' | 'ghost';
}

export interface MorphSelectContentProps {
  side?: 'auto' | 'top' | 'bottom';
  align?: 'auto' | 'start' | 'center' | 'end';
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "options",
    type: "MorphSelectOption[]",
    required: true,
    description: k("props.options"),
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: k("props.multiple"),
  },
  { name: "modelValue", type: "string | string[]", description: k("props.modelValue") },
  {
    name: "defaultValue",
    type: "string | string[]",
    default: "''",
    description: k("props.defaultValue"),
  },
  { name: "label", type: "string", description: k("props.label") },
  { name: "helperText", type: "string", description: k("props.helperText") },
  { name: "errorText", type: "string", description: k("props.errorText") },
  {
    name: "invalid",
    type: "boolean",
    default: "false",
    description: k("props.invalid"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: k("props.color"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    default: "ModoProvider",
    description: k("props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "ModoProvider",
    description: k("props.radius"),
  },
  {
    name: "halo",
    type: "'tinted' | 'neutral' | 'off'",
    default: "ModoProvider",
    description: k("props.halo"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: k("props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: k("props.required"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "true",
    description: k("props.fullWidth"),
  },
  { name: "id", type: "string", description: k("props.id") },
  { name: "name", type: "string", description: k("props.name") },
  { name: "ariaLabel", type: "string", description: k("props.ariaLabel") },
  {
    name: "ariaDescribedBy",
    type: "string",
    description: k("props.ariaDescribedBy"),
  },
  {
    name: "Trigger.placeholder",
    type: "string",
    description: k("props.triggerPlaceholder"),
  },
  {
    name: "Trigger.icon",
    type: "Component",
    description: k("props.triggerIcon"),
  },
  {
    name: "Trigger.variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: k("props.triggerVariant"),
  },
  {
    name: "Content.side",
    type: "'auto' | 'top' | 'bottom'",
    default: "'auto'",
    description: k("props.contentSide"),
  },
  {
    name: "Content.align",
    type: "'auto' | 'start' | 'center' | 'end'",
    default: "'auto'",
    description: k("props.contentAlign"),
  },
  {
    name: "Content.searchable",
    type: "boolean",
    default: "false",
    description: k("props.contentSearchable"),
  },
  {
    name: "Content.searchPlaceholder",
    type: "string",
    description: k("props.contentSearchPlaceholder"),
  },
  {
    name: "Content.emptyMessage",
    type: "string",
    description: k("props.contentEmptyMessage"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "string | string[]",
    description: k("emits.updateModelValue"),
  },
  { name: "change", payload: "string | string[]", description: k("emits.change") },
  { name: "openChange", payload: "boolean", description: k("emits.openChange") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: k("slots.default") },
  { name: "Trigger · default", description: k("slots.trigger") },
  { name: "Trigger · icon", description: k("slots.triggerIcon") },
  { name: "Content · option", description: k("slots.option") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    import-path="import { MorphSelect } from 'mood-ui'"
    :description="k('description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="240px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            v-model="pgVariant"
            :label="k('controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'filled' },
              { value: 'ghost' },
            ]"
          />
          <TbSep />
          <TbDots
            v-model="pgColor"
            :label="k('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgSize"
            :label="k('controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgRadius"
            :label="k('controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
          />
          <TbSep />
          <TbToggle v-model="pgSearchable" :label="k('controls.searchable')" />
          <TbToggle v-model="pgDisabled" :label="k('controls.disabled')" />
        </template>

        <div class="w-72">
          <MorphSelect
            v-model="pgValue"
            :options="countries"
            :label="k('playground.label')"
            :helper-text="k('playground.helper')"
            :color="pgColor"
            :size="pgSize"
            :radius="pgRadius"
            :disabled="pgDisabled"
          >
            <MorphSelect.Trigger
              :placeholder="k('playground.placeholder')"
              :variant="pgVariant"
            />
            <MorphSelect.Content :searchable="pgSearchable" />
          </MorphSelect>
        </div>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.basic.title')"
        :description="k('examples.basic.desc')"
        :code="basicCode"
      >
        <div class="w-64">
          <MorphSelect
            v-model="ex1"
            :options="countries"
            :label="k('examples.basic.label')"
          >
            <MorphSelect.Trigger :placeholder="k('examples.basic.placeholder')" />
            <MorphSelect.Content />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.searchable.title')"
        :description="k('examples.searchable.desc')"
        :code="searchableCode"
      >
        <div class="w-64">
          <MorphSelect
            v-model="ex2"
            :options="countries"
            :label="k('examples.searchable.label')"
          >
            <MorphSelect.Trigger />
            <MorphSelect.Content
              searchable
              :search-placeholder="k('examples.searchable.search')"
              :empty-message="k('examples.searchable.empty')"
            />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.multiple.title')"
        :description="k('examples.multiple.desc')"
        :code="multipleCode"
      >
        <div class="w-72">
          <MorphSelect
            v-model="exMulti"
            multiple
            :options="countries"
            :label="k('examples.multiple.label')"
          >
            <MorphSelect.Trigger :placeholder="k('examples.multiple.placeholder')" />
            <MorphSelect.Content searchable />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.icon.title')"
        :description="k('examples.icon.desc')"
        :code="iconCode"
      >
        <div class="w-64">
          <MorphSelect
            v-model="exIcon"
            :options="countries"
            :label="k('examples.icon.label')"
          >
            <MorphSelect.Trigger :icon="GlobeAmericasIcon" />
            <MorphSelect.Content />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.variants.title')"
        :description="k('examples.variants.desc')"
        :code="variantsCode"
      >
        <div v-for="v in exampleVariants" :key="v" class="w-48">
          <MorphSelect v-model="exVariant" :options="countries" :aria-label="v">
            <MorphSelect.Trigger :variant="v" />
            <MorphSelect.Content />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.sizes.title')"
        :description="k('examples.sizes.desc')"
        :code="sizesCode"
      >
        <div v-for="s in exampleSizes" :key="s" class="w-44">
          <MorphSelect :options="countries" :size="s" default-value="mx" :aria-label="s">
            <MorphSelect.Trigger />
            <MorphSelect.Content />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.states.title')"
        :description="k('examples.states.desc')"
        :code="statesCode"
      >
        <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
          <MorphSelect
            :options="countries"
            :label="k('examples.states.helperLabel')"
            :helper-text="k('examples.states.helperText')"
          >
            <MorphSelect.Trigger />
            <MorphSelect.Content />
          </MorphSelect>
          <MorphSelect
            :options="countries"
            :label="k('examples.states.disabledLabel')"
            default-value="mx"
            disabled
          >
            <MorphSelect.Trigger />
            <MorphSelect.Content />
          </MorphSelect>
          <MorphSelect
            :options="countries"
            :label="k('examples.states.readonlyLabel')"
            default-value="us"
            readonly
          >
            <MorphSelect.Trigger />
            <MorphSelect.Content />
          </MorphSelect>
          <MorphSelect
            :options="countries"
            :label="k('examples.states.errorLabel')"
            required
            :error-text="k('examples.states.errorText')"
          >
            <MorphSelect.Trigger />
            <MorphSelect.Content />
          </MorphSelect>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.form.title')"
        :description="k('examples.form.desc')"
        :code="formCode"
      >
        <form class="w-64" @submit.prevent>
          <MorphSelect
            :options="countries"
            name="shipping"
            default-value="co"
            :label="k('examples.form.label')"
          >
            <MorphSelect.Trigger />
            <MorphSelect.Content />
          </MorphSelect>
        </form>
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
        {{ k("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ k("types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
