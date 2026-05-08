<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import MonthView from '../../../components/data-display/calendar/MonthView.vue';
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface';
import type { PropDoc, EmitDoc } from '../../types';

const { t } = useI18n();

// ── Sample events ─────────────────────────────────────────────────────────────
const today = new Date();
const sampleEvents: CalendarEvent[] = [
    { id: '1', title: 'Stand-up',    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(),    9,  0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(),    9, 30), color: 'primary' },
    { id: '2', title: 'Diseño UI',   start: new Date(today.getFullYear(), today.getMonth(), today.getDate(),   11,  0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(),   12,  0), color: 'success' },
    { id: '3', title: 'Demo cliente',start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 30), color: 'warning' },
    { id: '4', title: 'Workshop',    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 10, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 12,  0), color: 'info', allDay: true },
    { id: '5', title: 'Lanzamiento', start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5,  9, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 18,  0), color: 'danger' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate              = ref(new Date());
const pgShowWeekNumbers   = ref(false);
const pgFirstDayOfWeek    = ref<0 | 1>(1);
const pgFixedWeeks        = ref(true);
const pgShowOutsideDays   = ref(true);

function resetPlayground() {
    pgDate.value            = new Date();
    pgShowWeekNumbers.value = false;
    pgFirstDayOfWeek.value  = 1;
    pgFixedWeeks.value      = true;
    pgShowOutsideDays.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="date"', ':events="events"'];
    if (pgShowWeekNumbers.value)              parts.push('show-week-numbers');
    if (pgFirstDayOfWeek.value !== 1)         parts.push(`:first-day-of-week="${pgFirstDayOfWeek.value}"`);
    if (!pgFixedWeeks.value)                  parts.push(':fixed-weeks="false"');
    if (!pgShowOutsideDays.value)             parts.push(':show-outside-days="false"');
    return `<MonthView ${parts.join(' ')} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic   = ref(new Date());
const dateEvents  = ref(new Date());
const dateWeekN   = ref(new Date());
const dateSunday  = ref(new Date());

const basicCode    = `<MonthView v-model="date" />`;
const eventsCode   = `<MonthView v-model="date" :events="events" />`;
const weekNumCode  = `<MonthView v-model="date" :events="events" show-week-numbers />`;
const sundayCode   = `<MonthView v-model="date" :events="events" :first-day-of-week="0" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
    { name: 'modelValue',          type: 'Date',                                                                description: t('pages.dataDisplay.monthView.props.modelValue') },
    { name: 'events',              type: 'CalendarEvent[]',                                                     description: t('pages.dataDisplay.monthView.props.events') },
    { name: 'locale',              type: 'string',                                                              description: t('pages.dataDisplay.monthView.props.locale') },
    { name: 'firstDayOfWeek',      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',                                          description: t('pages.dataDisplay.monthView.props.firstDayOfWeek') },
    { name: 'color',               type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",            description: t('pages.dataDisplay.monthView.props.color') },
    { name: 'radius',              type: "'none' | 'small' | 'medium' | 'large' | 'full'",                      description: t('pages.dataDisplay.monthView.props.radius') },
    { name: 'maxEventsPerDay',     type: 'number',                                                              description: t('pages.dataDisplay.monthView.props.maxEventsPerDay') },
    { name: 'showWeekNumbers',     type: 'boolean',                                       default: 'false',     description: t('pages.dataDisplay.monthView.props.showWeekNumbers') },
    { name: 'fixedWeeks',          type: 'boolean',                                       default: 'true',      description: t('pages.dataDisplay.monthView.props.fixedWeeks') },
    { name: 'showOutsideDays',     type: 'boolean',                                       default: 'true',      description: t('pages.dataDisplay.monthView.props.showOutsideDays') },
    { name: 'showHeader',          type: 'boolean',                                       default: 'true',      description: t('pages.dataDisplay.monthView.props.showHeader') },
    { name: 'bordered',            type: 'boolean',                                       default: 'true',      description: t('pages.dataDisplay.monthView.props.bordered') },
    { name: 'highlightWeekends',   type: 'boolean',                                       default: 'false',     description: t('pages.dataDisplay.monthView.props.highlightWeekends') },
    { name: 'minDate / maxDate',   type: 'Date',                                                                description: t('pages.dataDisplay.monthView.props.minDateMaxDate') },
    { name: 'disabledDates',       type: 'Date[]',                                                              description: t('pages.dataDisplay.monthView.props.disabledDates') },
    { name: 'disabledDaysOfWeek',  type: 'number[]',                                                            description: t('pages.dataDisplay.monthView.props.disabledDaysOfWeek') },
    { name: 'draggableEvents',     type: 'boolean',                                       default: 'false',     description: t('pages.dataDisplay.monthView.props.draggableEvents') },
]);

const emitsList = computed<EmitDoc[]>(() => [
    { name: 'update:modelValue', payload: 'Date',                                                                          description: t('pages.dataDisplay.monthView.emits.updateModelValue') },
    { name: 'event-click',       payload: '(event: CalendarEvent, nativeEvent: MouseEvent)',                                description: t('pages.dataDisplay.monthView.emits.eventClick') },
    { name: 'day-click',         payload: '(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)',                 description: t('pages.dataDisplay.monthView.emits.dayClick') },
    { name: 'more-click',        payload: '(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)',                 description: t('pages.dataDisplay.monthView.emits.moreClick') },
    { name: 'create-event',      payload: '(date: Date, nativeEvent: MouseEvent | KeyboardEvent)',                          description: t('pages.dataDisplay.monthView.emits.createEvent') },
    { name: 'event-drop',        payload: '(event: CalendarEvent, newStart: Date, newEnd: Date | undefined)',               description: t('pages.dataDisplay.monthView.emits.eventDrop') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.dataDisplay.monthView.title')"
        category="Calendar"
        import-path="import { MonthView } from 'mood-ui'"
        :description="t('pages.dataDisplay.monthView.description')"
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="400px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">{{ t('pages.dataDisplay.monthView.controls.weekStart') }}</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="d in [{ v: 0, l: t('pages.dataDisplay.monthView.controls.sun') }, { v: 1, l: t('pages.dataDisplay.monthView.controls.mon') }]"
                                :key="d.v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgFirstDayOfWeek === d.v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgFirstDayOfWeek = (d.v as 0 | 1)"
                            >{{ d.l }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowWeekNumbers
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowWeekNumbers = !pgShowWeekNumbers"
                    >{{ t('pages.dataDisplay.monthView.controls.weekNumbers') }}</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgFixedWeeks
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgFixedWeeks = !pgFixedWeeks"
                    >{{ t('pages.dataDisplay.monthView.controls.fixedWeeks') }}</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowOutsideDays
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowOutsideDays = !pgShowOutsideDays"
                    >{{ t('pages.dataDisplay.monthView.controls.outsideDays') }}</button>
                </template>

                <div class="w-full">
                    <MonthView
                        v-model="pgDate"
                        :events="sampleEvents"
                        :show-week-numbers="pgShowWeekNumbers"
                        :first-day-of-week="pgFirstDayOfWeek"
                        :fixed-weeks="pgFixedWeeks"
                        :show-outside-days="pgShowOutsideDays"
                    />
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.dataDisplay.monthView.examples.basic.title')"
                :description="t('pages.dataDisplay.monthView.examples.basic.desc')"
                :code="basicCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateBasic" /></div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.monthView.examples.events.title')"
                :description="t('pages.dataDisplay.monthView.examples.events.desc')"
                :code="eventsCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateEvents" :events="sampleEvents" /></div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.monthView.examples.weekNumbers.title')"
                :description="t('pages.dataDisplay.monthView.examples.weekNumbers.desc')"
                :code="weekNumCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateWeekN" :events="sampleEvents" show-week-numbers /></div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.dataDisplay.monthView.examples.sundayStart.title')"
                :description="t('pages.dataDisplay.monthView.examples.sundayStart.desc')"
                :code="sundayCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateSunday" :events="sampleEvents" :first-day-of-week="0" /></div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
