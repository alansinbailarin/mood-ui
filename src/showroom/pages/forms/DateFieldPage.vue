<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import DateField from "../../../components/forms/DateField.vue";
import Typography from "../../../components/data-display/Typography.vue";
import type { PropDoc, EmitDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.dateField.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.dateField.a11y.kbShiftTab") },
  { keys: ["Enter"], action: t("pages.forms.dateField.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.forms.dateField.a11y.kbEsc") },
  {
    keys: ["↑", "↓", "←", "→"],
    action: t("pages.forms.dateField.a11y.kbArrow"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.forms.dateField.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.dateField.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.dateField.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.dateField.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.dateField.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.dateField.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.dateField.a11y.focusNative"),
  t("pages.forms.dateField.a11y.focusTrap"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgVariant = ref<"outline" | "filled" | "ghost">("outline");
const pgClearable = ref(false);
const pgDisabled = ref(false);

const pgValue = ref<Date | null>(new Date());

function resetPlayground() {
  pgSize.value = "medium";
  pgVariant.value = "outline";
  pgClearable.value = false;
  pgDisabled.value = false;
  pgValue.value = new Date();
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="value"', 'label="Fecha"'];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgClearable.value) parts.push("clearable");
  if (pgDisabled.value) parts.push("disabled");
  return `<DateField\n    ${parts.join("\n    ")}\n    class="w-72"\n/>`;
});

// ── Examples state ────────────────────────────────────────────────────────────
const dValue = ref<Date | null>(new Date());
const dConstrained = ref<Date | null>(null);
const dClearable = ref<Date | null>(new Date());
const today = new Date();
const maxDate = new Date(Date.now() + 30 * 86400000);

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateField v-model="value" label="Date" class="w-72" />
</template>`;

const sizesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateField v-model="value" size="small"  label="Small"  class="w-72" />
  <DateField v-model="value" size="medium" label="Medium" class="w-72" />
  <DateField v-model="value" size="large"  label="Large"  class="w-72" />
</template>`;

const constraintsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateField } from 'mood-ui';

const value = ref<Date | null>(null);
const today   = new Date();
const maxDate = new Date(Date.now() + 30 * 86400000);
<\/script>

<template>
  <DateField
    v-model="value"
    label="Book between today and +30 days"
    :min-date="today"
    :max-date="maxDate"
    class="w-72"
  />
</template>`;

const clearableCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateField v-model="value" label="Date" clearable class="w-72" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateField :model-value="value" label="Date" disabled class="w-72" />
</template>`;

const typesCode = `export interface DateField {
  modelValue?: Date | null;
  displayFormat?: DateDisplayFormat;
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showOutsideDays?: boolean;
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
  closeOnSelect?: boolean;
  iconLeft?: Component;
  id?: string;
  name?: string;
  autofocus?: boolean;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date | null",
    default: "null",
    description: t("pages.forms.dateField.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.dateField.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Select date…'",
    description: t("pages.forms.dateField.props.placeholder"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.dateField.props.size"),
  },
  {
    name: "variant",
    type: "'outline' | 'filled' | 'ghost'",
    default: "'outline'",
    description: t("pages.forms.dateField.props.variant"),
  },
  {
    name: "displayFormat",
    type: "'short' | 'medium' | 'long' | 'full'",
    default: "'medium'",
    description: t("pages.forms.dateField.props.displayFormat"),
  },
  {
    name: "minDate",
    type: "Date",
    description: t("pages.forms.dateField.props.minDate"),
  },
  {
    name: "maxDate",
    type: "Date",
    description: t("pages.forms.dateField.props.maxDate"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateField.props.clearable"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateField.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateField.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateField.props.required"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateField.props.fullWidth"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date | null",
    description: t("pages.forms.dateField.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "Date | null",
    description: t("pages.forms.dateField.emits.change"),
  },
  {
    name: "open",
    payload: "void",
    description: t("pages.forms.dateField.emits.open"),
  },
  {
    name: "close",
    payload: "void",
    description: t("pages.forms.dateField.emits.close"),
  },
  {
    name: "clear",
    payload: "void",
    description: t("pages.forms.dateField.emits.clear"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.dateField.title')"
    :category="t('pages.forms.dateField.category')"
    import-path="import { DateField } from 'mood-ui'"
    :description="t('pages.forms.dateField.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="280px"
        @reset="resetPlayground"
      >
        <template #controls>
          <!-- Size -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >{{
                t("pages.forms.dateField.controls.size").toUpperCase()
              }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="s in ['small', 'medium', 'large']"
                :key="s"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
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

          <!-- Variant -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >{{
                t("pages.forms.dateField.controls.variant").toUpperCase()
              }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="v in ['outline', 'filled', 'ghost']"
                :key="v"
                type="button"
                class="px-2 py-1 text-xs transition-colors capitalize"
                :class="
                  pgVariant === v
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgVariant = v as typeof pgVariant"
              >
                {{ v }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

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
            {{ t("pages.forms.dateField.controls.clearable") }}
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
            {{ t("pages.forms.dateField.controls.disabled") }}
          </button>
        </template>

        <DateField
          v-model="pgValue"
          :label="t('pages.forms.dateField.playground.label')"
          :size="pgSize"
          :variant="pgVariant"
          :clearable="pgClearable"
          :disabled="pgDisabled"
          class="w-72"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.dateField.examples.basic.title')"
        :description="t('pages.forms.dateField.examples.basic.desc')"
        :code="basicCode"
      >
        <DateField v-model="dValue" label="Fecha" class="w-72" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateField.examples.sizes.title')"
        :description="t('pages.forms.dateField.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col gap-3">
          <DateField v-model="dValue" size="small" label="Small" class="w-72" />
          <DateField
            v-model="dValue"
            size="medium"
            label="Medium"
            class="w-72"
          />
          <DateField v-model="dValue" size="large" label="Large" class="w-72" />
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateField.examples.minMax.title')"
        :description="t('pages.forms.dateField.examples.minMax.desc')"
        :code="constraintsCode"
      >
        <DateField
          v-model="dConstrained"
          label="Reservar entre hoy y +30 días"
          :min-date="today"
          :max-date="maxDate"
          class="w-72"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateField.examples.clearable.title')"
        :description="t('pages.forms.dateField.examples.clearable.desc')"
        :code="clearableCode"
      >
        <DateField v-model="dClearable" label="Fecha" clearable class="w-72" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateField.examples.disabled.title')"
        :description="t('pages.forms.dateField.examples.disabled.desc')"
        :code="disabledCode"
      >
        <DateField :model-value="dValue" label="Fecha" disabled class="w-72" />
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
        {{ t("pages.forms.dateField.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.dateField.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
