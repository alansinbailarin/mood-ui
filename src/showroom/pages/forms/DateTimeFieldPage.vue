<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import DateTimeField from "../../../components/forms/DateTimeField.vue";
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
  { keys: ["Tab"], action: t("pages.forms.dateTimeField.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.forms.dateTimeField.a11y.kbShiftTab"),
  },
  { keys: ["Enter"], action: t("pages.forms.dateTimeField.a11y.kbEnter") },
  { keys: ["Escape"], action: t("pages.forms.dateTimeField.a11y.kbEsc") },
  {
    keys: ["↑", "↓", "←", "→"],
    action: t("pages.forms.dateTimeField.a11y.kbArrow"),
  },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-expanded",
    value: "true",
    desc: t("pages.forms.dateTimeField.a11y.ariaExpanded"),
  },
  {
    attribute: "aria-invalid",
    value: "true",
    desc: t("pages.forms.dateTimeField.a11y.ariaInvalid"),
  },
  {
    attribute: "aria-describedby",
    value: "id",
    desc: t("pages.forms.dateTimeField.a11y.ariaDescribedBy"),
  },
  {
    attribute: "aria-required",
    value: "true",
    desc: t("pages.forms.dateTimeField.a11y.ariaRequired"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.dateTimeField.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.dateTimeField.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.dateTimeField.a11y.focusNative"),
  t("pages.forms.dateTimeField.a11y.focusTrap"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgFormat = ref<"24h" | "12h">("24h");
const pgClearable = ref(false);
const pgDisabled = ref(false);

const pgValue = ref<Date | null>(new Date());

function resetPlayground() {
  pgSize.value = "medium";
  pgFormat.value = "24h";
  pgClearable.value = false;
  pgDisabled.value = false;
  pgValue.value = new Date();
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="value"', 'label="Inicio"'];
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgFormat.value !== "24h") parts.push(`format="${pgFormat.value}"`);
  if (pgClearable.value) parts.push("clearable");
  if (pgDisabled.value) parts.push("disabled");
  return `<DateTimeField\n    ${parts.join("\n    ")}\n    class="w-80"\n/>`;
});

// ── Examples state ────────────────────────────────────────────────────────────
const dValue = ref<Date | null>(new Date());
const d12h = ref<Date | null>(new Date());
const dConstrained = ref<Date | null>(null);
const dClearable = ref<Date | null>(new Date());
const today = new Date();
const maxDate = new Date(Date.now() + 7 * 86400000);

const basicCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimeField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimeField v-model="value" label="Start" class="w-80" />
</template>`;

const format12hCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimeField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimeField v-model="value" label="Start" format="12h" class="w-80" />
</template>`;

const constraintsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimeField } from 'mood-ui';

const value = ref<Date | null>(null);
const today   = new Date();
const maxDate = new Date(Date.now() + 7 * 86400000);
<\/script>

<template>
  <DateTimeField
    v-model="value"
    label="Appointment within the next 7 days"
    :min-date="today"
    :max-date="maxDate"
    class="w-80"
  />
</template>`;

const clearableCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimeField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimeField v-model="value" label="Start" clearable class="w-80" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { DateTimeField } from 'mood-ui';

const value = ref<Date | null>(new Date());
<\/script>

<template>
  <DateTimeField :model-value="value" label="Start" disabled class="w-80" />
</template>`;

const typesCode = `export interface DateTimeField {
  modelValue?: Date | null;
  dateFormat?: DateDisplayFormat;
  timeFormat?: TimeDisplayFormat;
  separator?: string;
  locale?: string;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  format?: '12h' | '24h';
  step?: number;
  showSeconds?: boolean;
  minTime?: string;
  maxTime?: string;
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
    description: t("pages.forms.dateTimeField.props.modelValue"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.dateTimeField.props.label"),
  },
  {
    name: "placeholder",
    type: "string",
    default: "'Select date and time…'",
    description: t("pages.forms.dateTimeField.props.placeholder"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.dateTimeField.props.size"),
  },
  {
    name: "format",
    type: "'24h' | '12h'",
    default: "'24h'",
    description: t("pages.forms.dateTimeField.props.format"),
  },
  {
    name: "step",
    type: "number",
    default: "5",
    description: t("pages.forms.dateTimeField.props.step"),
  },
  {
    name: "showSeconds",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateTimeField.props.showSeconds"),
  },
  {
    name: "minDate",
    type: "Date",
    description: t("pages.forms.dateTimeField.props.minDate"),
  },
  {
    name: "maxDate",
    type: "Date",
    description: t("pages.forms.dateTimeField.props.maxDate"),
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateTimeField.props.clearable"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateTimeField.props.disabled"),
  },
  {
    name: "readonly",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateTimeField.props.readonly"),
  },
  {
    name: "required",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateTimeField.props.required"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.dateTimeField.props.fullWidth"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date | null",
    description: t("pages.forms.dateTimeField.emits.updateModelValue"),
  },
  {
    name: "change",
    payload: "Date | null",
    description: t("pages.forms.dateTimeField.emits.change"),
  },
  {
    name: "open",
    payload: "void",
    description: t("pages.forms.dateTimeField.emits.open"),
  },
  {
    name: "close",
    payload: "void",
    description: t("pages.forms.dateTimeField.emits.close"),
  },
  {
    name: "clear",
    payload: "void",
    description: t("pages.forms.dateTimeField.emits.clear"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.dateTimeField.title')"
    :category="t('pages.forms.dateTimeField.category')"
    import-path="import { DateTimeField } from 'mood-ui'"
    :description="t('pages.forms.dateTimeField.description')"
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
                t("pages.forms.dateTimeField.controls.size").toUpperCase()
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

          <!-- Format -->
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >{{
                t("pages.forms.dateTimeField.controls.format").toUpperCase()
              }}</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="f in ['24h', '12h']"
                :key="f"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
                :class="
                  pgFormat === f
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgFormat = f as typeof pgFormat"
              >
                {{ f }}
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
            {{ t("pages.forms.dateTimeField.controls.clearable") }}
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
            {{ t("pages.forms.dateTimeField.controls.disabled") }}
          </button>
        </template>

        <DateTimeField
          v-model="pgValue"
          :label="t('pages.forms.dateTimeField.playground.label')"
          :size="pgSize"
          :format="pgFormat"
          :clearable="pgClearable"
          :disabled="pgDisabled"
          class="w-80"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.dateTimeField.examples.basic.title')"
        :description="t('pages.forms.dateTimeField.examples.basic.desc')"
        :code="basicCode"
      >
        <DateTimeField v-model="dValue" label="Inicio" class="w-80" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateTimeField.examples.format12h.title')"
        :description="t('pages.forms.dateTimeField.examples.format12h.desc')"
        :code="format12hCode"
      >
        <DateTimeField
          v-model="d12h"
          label="Inicio"
          format="12h"
          class="w-80"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateTimeField.examples.minMax.title')"
        :description="t('pages.forms.dateTimeField.examples.minMax.desc')"
        :code="constraintsCode"
      >
        <DateTimeField
          v-model="dConstrained"
          label="Cita en los próximos 7 días"
          :min-date="today"
          :max-date="maxDate"
          class="w-80"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateTimeField.examples.clearable.title')"
        :description="t('pages.forms.dateTimeField.examples.clearable.desc')"
        :code="clearableCode"
      >
        <DateTimeField
          v-model="dClearable"
          label="Inicio"
          clearable
          class="w-80"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.dateTimeField.examples.disabled.title')"
        :description="t('pages.forms.dateTimeField.examples.disabled.desc')"
        :code="disabledCode"
      >
        <DateTimeField
          :model-value="dValue"
          label="Inicio"
          disabled
          class="w-80"
        />
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
        {{ t("pages.forms.dateTimeField.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.dateTimeField.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
