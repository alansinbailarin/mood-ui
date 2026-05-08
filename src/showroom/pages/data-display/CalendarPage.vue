<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Calendar from "../../../components/data-display/calendar/Calendar.vue";
import type { PropDoc, EmitDoc } from "../../types";

const { t } = useI18n();

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue = ref<Date | null>(new Date());
const pgVariant = ref<"filled" | "outline">("filled");
const pgColor = ref<"default" | "primary" | "danger" | "success" | "warning">(
  "primary",
);
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");
const pgShowOutsideDays = ref(true);
const pgShowHeader = ref(true);

function resetPlayground() {
  pgValue.value = new Date();
  pgVariant.value = "filled";
  pgColor.value = "primary";
  pgRadius.value = "medium";
  pgShowOutsideDays.value = true;
  pgShowHeader.value = true;
}

const colorDots = [
  { value: "default" as const, bg: "#64748b", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  { value: "success" as const, bg: "#22c55e", label: "Success" },
  { value: "warning" as const, bg: "#f59e0b", label: "Warning" },
  { value: "danger" as const, bg: "#ef4444", label: "Danger" },
];

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="date"'];
  if (pgVariant.value !== "filled") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  if (!pgShowOutsideDays.value) parts.push(':show-outside-days="false"');
  if (!pgShowHeader.value) parts.push(':show-header="false"');
  return `<Calendar ${parts.join(" ")} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref<Date | null>(new Date());
const dateRange = ref<Date | null>(new Date());
const dateOutline = ref<Date | null>(new Date());
const dateLocale = ref<Date | null>(new Date());

const basicCode = `<Calendar v-model="date" />`;

const minMaxCode = `<Calendar
    v-model="date"
    :min-date="new Date()"
    :max-date="new Date(Date.now() + 30 * 86400000)"
    color="primary"
/>`;

const outlineCode = `<Calendar v-model="date" variant="outline" color="primary" radius="large" />`;

const localeCode = `<Calendar v-model="date" locale="en-US" :first-day-of-week="0" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "Date | null",
    description: t("pages.dataDisplay.calendar.props.modelValue"),
  },
  {
    name: "month",
    type: "number",
    description: t("pages.dataDisplay.calendar.props.month"),
  },
  {
    name: "year",
    type: "number",
    description: t("pages.dataDisplay.calendar.props.year"),
  },
  {
    name: "locale",
    type: "string",
    description: t("pages.dataDisplay.calendar.props.locale"),
  },
  {
    name: "firstDayOfWeek",
    type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
    description: t("pages.dataDisplay.calendar.props.firstDayOfWeek"),
  },
  {
    name: "minDate",
    type: "Date",
    description: t("pages.dataDisplay.calendar.props.minDate"),
  },
  {
    name: "maxDate",
    type: "Date",
    description: t("pages.dataDisplay.calendar.props.maxDate"),
  },
  {
    name: "disabledDates",
    type: "Date[]",
    description: t("pages.dataDisplay.calendar.props.disabledDates"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",
    default: "'default'",
    description: t("pages.dataDisplay.calendar.props.color"),
  },
  {
    name: "variant",
    type: "'filled' | 'outline'",
    default: "'filled'",
    description: t("pages.dataDisplay.calendar.props.variant"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.dataDisplay.calendar.props.radius"),
  },
  {
    name: "showOutsideDays",
    type: "boolean",
    default: "true",
    description: t("pages.dataDisplay.calendar.props.showOutsideDays"),
  },
  {
    name: "showHeader",
    type: "boolean",
    default: "true",
    description: t("pages.dataDisplay.calendar.props.showHeader"),
  },
  {
    name: "fixedWeeks",
    type: "boolean",
    default: "true",
    description: t("pages.dataDisplay.calendar.props.fixedWeeks"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "Date",
    description: t("pages.dataDisplay.calendar.emits.updateModelValue"),
  },
  {
    name: "monthChange",
    payload: "{ month: number; year: number }",
    description: t("pages.dataDisplay.calendar.emits.monthChange"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.dataDisplay.calendar.title')"
    category="Calendar"
    import-path="import { Calendar } from 'mood-ui'"
    :description="t('pages.dataDisplay.calendar.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="380px"
        @reset="resetPlayground"
      >
        <template #controls>
          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >Variante</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="v in ['filled', 'outline']"
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

          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >Color</span
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

          <div class="flex items-center gap-1.5">
            <span
              class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline"
              >Radio</span
            >
            <div class="flex rounded-md border border-border overflow-hidden">
              <button
                v-for="r in ['none', 'small', 'medium', 'large', 'full']"
                :key="r"
                type="button"
                class="px-2 py-1 text-xs transition-colors"
                :class="
                  pgRadius === r
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/60'
                "
                @click="pgRadius = r as typeof pgRadius"
              >
                {{ r }}
              </button>
            </div>
          </div>

          <span class="w-px h-4 bg-border shrink-0" />

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowOutsideDays
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowOutsideDays = !pgShowOutsideDays"
          >
            Días externos
          </button>

          <button
            type="button"
            class="px-2 py-1 rounded-md text-xs border transition-colors"
            :class="
              pgShowHeader
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted/60'
            "
            @click="pgShowHeader = !pgShowHeader"
          >
            Cabecera
          </button>
        </template>

        <Calendar
          v-model="pgValue"
          :variant="pgVariant"
          :color="pgColor"
          :radius="pgRadius"
          :show-outside-days="pgShowOutsideDays"
          :show-header="pgShowHeader"
        />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.dataDisplay.calendar.examples.basic.title')"
        :description="t('pages.dataDisplay.calendar.examples.basic.desc')"
        :code="basicCode"
        min-height="380px"
      >
        <Calendar v-model="dateBasic" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.calendar.examples.minMax.title')"
        :description="t('pages.dataDisplay.calendar.examples.minMax.desc')"
        :code="minMaxCode"
        min-height="380px"
      >
        <Calendar
          v-model="dateRange"
          :min-date="new Date()"
          :max-date="new Date(Date.now() + 30 * 86400000)"
          color="primary"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.calendar.examples.outline.title')"
        :description="t('pages.dataDisplay.calendar.examples.outline.desc')"
        :code="outlineCode"
        min-height="380px"
      >
        <Calendar
          v-model="dateOutline"
          variant="outline"
          color="primary"
          radius="large"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.dataDisplay.calendar.examples.locale.title')"
        :description="t('pages.dataDisplay.calendar.examples.locale.desc')"
        :code="localeCode"
        min-height="380px"
      >
        <Calendar v-model="dateLocale" locale="en-US" :first-day-of-week="0" />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
