<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import MonthView from '../../../components/data-display/calendar/MonthView.vue';
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface';
import type { PropDoc, EmitDoc } from '../../types';

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
const propsList: PropDoc[] = [
    { name: 'modelValue',          type: 'Date',                                                                description: 'Fecha visible (v-model). Determina el mes mostrado.' },
    { name: 'events',              type: 'CalendarEvent[]',                                                     description: 'Lista de eventos a renderizar en cada celda.' },
    { name: 'locale',              type: 'string',                                                              description: 'Locale BCP-47 para nombres de mes y días.' },
    { name: 'firstDayOfWeek',      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',                                            description: 'Primer día de la semana (0 = domingo, 1 = lunes).' },
    { name: 'color',               type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",            description: 'Color semántico de la selección y los acentos.' },
    { name: 'radius',              type: "'none' | 'small' | 'medium' | 'large' | 'full'",                      description: 'Radio de borde del contenedor.' },
    { name: 'maxEventsPerDay',     type: 'number',                                                              description: 'Máximo de eventos visibles por celda; el resto se agrupa en “+N”.' },
    { name: 'showWeekNumbers',     type: 'boolean',                                       default: 'false',     description: 'Muestra una columna inicial con el número de semana ISO.' },
    { name: 'fixedWeeks',          type: 'boolean',                                       default: 'true',      description: 'Renderiza siempre 6 semanas para mantener altura constante.' },
    { name: 'showOutsideDays',     type: 'boolean',                                       default: 'true',      description: 'Muestra días del mes anterior y siguiente.' },
    { name: 'showHeader',          type: 'boolean',                                       default: 'true',      description: 'Muestra cabecera con navegación.' },
    { name: 'bordered',            type: 'boolean',                                       default: 'true',      description: 'Dibuja líneas divisorias entre celdas.' },
    { name: 'highlightWeekends',   type: 'boolean',                                       default: 'false',     description: 'Resalta visualmente sábado y domingo.' },
    { name: 'minDate / maxDate',   type: 'Date',                                                                description: 'Limita el rango de fechas seleccionables.' },
    { name: 'disabledDates',       type: 'Date[]',                                                              description: 'Fechas individuales deshabilitadas.' },
    { name: 'disabledDaysOfWeek',  type: 'number[]',                                                            description: 'Días de la semana deshabilitados (0-6).' },
    { name: 'draggableEvents',     type: 'boolean',                                       default: 'false',     description: 'Permite arrastrar eventos entre días.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'Date',                                                                          description: 'Emitido al seleccionar un día.' },
    { name: 'event-click',       payload: '(event: CalendarEvent, nativeEvent: MouseEvent)',                                description: 'Emitido al hacer click sobre un evento.' },
    { name: 'day-click',         payload: '(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)',                 description: 'Emitido al hacer click sobre una celda de día.' },
    { name: 'more-click',        payload: '(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)',                 description: 'Emitido al hacer click sobre el indicador “+N”.' },
    { name: 'create-event',      payload: '(date: Date, nativeEvent: MouseEvent | KeyboardEvent)',                          description: 'Emitido al solicitar la creación de un evento.' },
    { name: 'event-drop',        payload: '(event: CalendarEvent, newStart: Date, newEnd: Date | undefined)',               description: 'Emitido al soltar un evento arrastrado en otra fecha.' },
];
</script>

<template>
    <ComponentDoc
        title="MonthView"
        category="Calendar"
        import-path="import { MonthView } from 'mood-ui'"
        description="Vista mensual tipo grilla para mostrar eventos por día. Soporta números de semana, semana iniciando en cualquier día y arrastre de eventos."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="400px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Inicio</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="d in [{ v: 0, l: 'Dom' }, { v: 1, l: 'Lun' }]"
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
                    >Nº semana</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgFixedWeeks
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgFixedWeeks = !pgFixedWeeks"
                    >6 semanas fijas</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowOutsideDays
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowOutsideDays = !pgShowOutsideDays"
                    >Días externos</button>
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
                title="Básico"
                description="Vista mensual sin eventos vinculada a una fecha."
                :code="basicCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateBasic" /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Con eventos"
                description="Renderiza una colección de CalendarEvent distribuidos por día."
                :code="eventsCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateEvents" :events="sampleEvents" /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Con números de semana"
                description="Activa show-week-numbers para mostrar la numeración ISO."
                :code="weekNumCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateWeekN" :events="sampleEvents" show-week-numbers /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Semana iniciando en domingo"
                description="Configura first-day-of-week=0 para iniciar en domingo."
                :code="sundayCode"
                min-height="400px"
            >
                <div class="w-full"><MonthView v-model="dateSunday" :events="sampleEvents" :first-day-of-week="0" /></div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
