<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import { useCalendar } from "../../../composables/useCalendar";
import type { PropDoc } from "../../types";

const { t } = useI18n();

const selectedDate = ref<Date | null>(new Date());
const currentMonth = ref<number | undefined>(new Date().getMonth());
const pgYear = ref<number | undefined>(new Date().getFullYear());

const {
  monthLabel,
  currentYear,
  weekDayLabels,
  calendarDays,
  prevMonth,
  nextMonth,
  goToToday,
} = useCalendar({
  modelValue: selectedDate,
  month: currentMonth,
  year: pgYear,
});

const overviewCode = computed(() => {
  return `import { ref } from 'vue';
import { useCalendar } from 'mood-ui';

const selected = ref(new Date());
const month = ref(new Date().getMonth());
const year  = ref(new Date().getFullYear());

const {
  monthLabel,
  weekDayLabels,
  calendarDays,
  prevMonth, nextMonth,
  goToToday,
} = useCalendar({ modelValue: selected, month, year });

// calendarDays is an array of CalendarDay objects
// Each has: date, day, isToday, isSelected, isOutside, disabled`;
});

const basicCode = `import { ref } from 'vue';
import { useCalendar } from 'mood-ui';

const selected = ref<Date | null>(null);
const month = ref(new Date().getMonth());
const year  = ref(new Date().getFullYear());

const { monthLabel, weekDayLabels, calendarDays, prevMonth, nextMonth } =
  useCalendar({ modelValue: selected, month, year });`;

const rangeCode = `import { ref } from 'vue';
import { useCalendar } from 'mood-ui';

const range = ref<[Date | null, Date | null]>([null, null]);

const { calendarDays, isDateDisabled } = useCalendar({
  rangeValue: range,
  minDate: ref(new Date(2025, 0, 1)),
  maxDate: ref(new Date(2025, 11, 31)),
});`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "monthLabel",
    type: "ComputedRef<string>",
    description: t("pages.composables.useCalendar.api.monthLabel"),
  },
  {
    name: "weekDayLabels",
    type: "ComputedRef<string[]>",
    description: t("pages.composables.useCalendar.api.weekDayLabels"),
  },
  {
    name: "calendarDays",
    type: "ComputedRef<CalendarDay[]>",
    description: t("pages.composables.useCalendar.api.calendarDays"),
  },
  {
    name: "prevMonth / nextMonth",
    type: "() => void",
    description: t("pages.composables.useCalendar.api.navMonth"),
  },
  {
    name: "prevYear / nextYear",
    type: "() => void",
    description: t("pages.composables.useCalendar.api.navYear"),
  },
  {
    name: "goToToday",
    type: "() => Date",
    description: t("pages.composables.useCalendar.api.goToToday"),
  },
  {
    name: "goToDate",
    type: "(date: Date) => void",
    description: t("pages.composables.useCalendar.api.goToDate"),
  },
  {
    name: "isDateDisabled",
    type: "(date: Date) => boolean",
    description: t("pages.composables.useCalendar.api.isDateDisabled"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useCalendar.title')"
    category="Composables"
    import-path="import { useCalendar } from 'mood-ui'"
    :description="t('pages.composables.useCalendar.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="360px" lang="ts">
        <div class="flex flex-col gap-3 max-w-xs">
          <div class="flex items-center justify-between">
            <Typography variant="body" size="small" class="font-medium">
              {{ monthLabel }} {{ currentYear }}
            </Typography>
            <div class="flex gap-1">
              <Button size="small" variant="ghost" @click="prevMonth">
                ‹
              </Button>
              <Button size="small" variant="ghost" @click="nextMonth">
                ›
              </Button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1 text-center">
            <div
              v-for="label in weekDayLabels"
              :key="label"
              class="text-[10px] uppercase text-muted-foreground"
            >
              {{ label }}
            </div>
            <button
              v-for="d in calendarDays"
              :key="d.date.toISOString()"
              type="button"
              class="h-7 w-7 rounded text-xs flex items-center justify-center transition-colors"
              :class="[
                d.isSelected
                  ? 'bg-primary text-primary-foreground'
                  : d.isToday
                    ? 'ring-1 ring-primary text-primary'
                    : d.isOutside
                      ? 'text-muted-foreground/50'
                      : 'hover:bg-muted',
                d.disabled && 'opacity-40 cursor-not-allowed',
              ]"
              :disabled="d.disabled"
              @click="selectedDate = d.date"
            >
              {{ d.day }}
            </button>
          </div>

          <Button size="small" variant="ghost" @click="goToToday">
            {{ t("pages.composables.useCalendar.playground.today") }}
          </Button>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.composables.useCalendar.examples.basic.title')"
        :description="t('pages.composables.useCalendar.examples.basic.desc')"
        :code="basicCode"
        min-height="160px"
        lang="ts"
      >
        <Typography variant="body" size="small">
          Selected:
          <strong>{{ selectedDate?.toLocaleDateString() ?? "—" }}</strong>
        </Typography>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useCalendar.examples.range.title')"
        :description="t('pages.composables.useCalendar.examples.range.desc')"
        :code="rangeCode"
        min-height="160px"
        lang="ts"
      >
        <Typography variant="body" size="small">
          {{ t("pages.composables.useCalendar.examples.range.body") }}
        </Typography>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useCalendar.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useCalendar.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
