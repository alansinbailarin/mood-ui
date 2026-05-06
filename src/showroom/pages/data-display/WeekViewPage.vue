<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import WeekView from '../../../components/data-display/calendar/WeekView.vue';
import type { CalendarEvent } from '../../../interfaces/data-display/calendar/MonthView.interface';
import type { PropDoc, EmitDoc } from '../../types';

// ── Sample events ─────────────────────────────────────────────────────────────
const today = new Date();
function at(h: number, m = 0, dayOffset = 0): Date {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d;
}
const sampleEvents: CalendarEvent[] = [
    { id: '1', title: 'Stand-up',     start: at(9),         end: at(9, 30),       color: 'primary' },
    { id: '2', title: 'Diseño UI',    start: at(10),        end: at(12),          color: 'success' },
    { id: '3', title: 'Lunch',        start: at(13),        end: at(14),          color: 'warning' },
    { id: '4', title: 'Code review',  start: at(15, 0, 1),  end: at(16, 30, 1),   color: 'info' },
    { id: '5', title: 'Demo cliente', start: at(11, 0, 2),  end: at(12, 0, 2),    color: 'danger' },
    { id: '6', title: 'Conferencia',  start: at(0, 0, 3),   end: at(23, 59, 3),   color: 'purple', allDay: true },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate       = ref(new Date());
const pgFormat     = ref<'12h' | '24h'>('24h');
const pgShowAllDay = ref(true);
const pgBordered   = ref(true);
const pgShowNowPill = ref(true);

function resetPlayground() {
    pgDate.value        = new Date();
    pgFormat.value      = '24h';
    pgShowAllDay.value  = true;
    pgBordered.value    = true;
    pgShowNowPill.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="date"', ':events="events"'];
    if (pgFormat.value !== '24h')   parts.push(`format="${pgFormat.value}"`);
    if (!pgShowAllDay.value)        parts.push(':show-all-day-row="false"');
    if (!pgBordered.value)          parts.push(':bordered="false"');
    if (!pgShowNowPill.value)       parts.push(':show-now-pill="false"');
    return `<WeekView ${parts.join(' ')} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic  = ref(new Date());
const dateAllDay = ref(new Date());
const date12h    = ref(new Date());
const dateBiz    = ref(new Date());

const basicCode  = `<WeekView v-model="date" :events="events" />`;
const allDayCode = `<WeekView v-model="date" :events="events" show-all-day-row />`;
const fmt12hCode = `<WeekView v-model="date" :events="events" format="12h" />`;
const bizCode    = `<WeekView
    v-model="date"
    :events="events"
    :business-hours="{ start: '09:00', end: '18:00' }"
    :hour-start="7"
    :hour-end="20"
/>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',         type: 'Date',                                                              description: 'Fecha visible. La semana se calcula a partir de ella.' },
    { name: 'events',             type: 'CalendarEvent[]',                                                   description: 'Eventos a renderizar en la grilla horaria.' },
    { name: 'locale',             type: 'string',                                                            description: 'Locale BCP-47 para encabezados y formatos.' },
    { name: 'firstDayOfWeek',     type: '0 | 1 | 2 | 3 | 4 | 5 | 6',                                          description: 'Primer día de la semana.' },
    { name: 'color',              type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",          description: 'Color semántico aplicado a acentos.' },
    { name: 'format',             type: "'12h' | '24h'",                              default: "'24h'",      description: 'Formato horario de la columna de horas.' },
    { name: 'hourStart',          type: 'number',                                     default: '0',          description: 'Hora inicial visible (0-23).' },
    { name: 'hourEnd',            type: 'number',                                     default: '24',         description: 'Hora final visible (1-24).' },
    { name: 'slotMinutes',        type: '15 | 30 | 60',                               default: '30',         description: 'Granularidad de los slots de tiempo.' },
    { name: 'slotHeight',         type: 'number',                                                            description: 'Altura en px de cada slot horario.' },
    { name: 'minDayWidth',        type: 'number',                                     default: '140',        description: 'Ancho mínimo por columna de día antes de hacer scroll horizontal.' },
    { name: 'showAllDayRow',      type: 'boolean',                                    default: 'true',       description: 'Muestra la fila para eventos all-day.' },
    { name: 'showHeader',         type: 'boolean',                                    default: 'true',       description: 'Muestra la cabecera con navegación.' },
    { name: 'showCurrentTime',    type: 'boolean',                                    default: 'true',       description: 'Dibuja la línea de hora actual.' },
    { name: 'showNowPill',        type: 'boolean',                                    default: 'true',       description: 'Muestra una píldora con la hora actual sobre la columna del día.' },
    { name: 'businessHours',      type: 'BusinessHours | BusinessHours[]',                                   description: 'Resalta el rango de horas laborales.' },
    { name: 'disabledTimeRanges', type: 'DisabledTimeRange[]',                                               description: 'Rangos horarios no seleccionables.' },
    { name: 'bordered',           type: 'boolean',                                    default: 'true',       description: 'Dibuja borde alrededor de la grilla.' },
    { name: 'draggableEvents',    type: 'boolean',                                    default: 'false',      description: 'Permite arrastrar eventos.' },
    { name: 'resizableEvents',    type: 'boolean',                                    default: 'false',      description: 'Permite redimensionar eventos.' },
    { name: 'allowRangeSelection',type: 'boolean',                                    default: 'false',      description: 'Permite seleccionar un rango arrastrando sobre slots vacíos.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'Date',                                                                                  description: 'Emitido al cambiar la semana visible.' },
    { name: 'event-click',       payload: '(event: CalendarEvent, nativeEvent: MouseEvent)',                                        description: 'Click sobre un evento.' },
    { name: 'day-click',         payload: '(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)',                         description: 'Click sobre el encabezado de un día.' },
    { name: 'slot-click',        payload: '(date: Date, nativeEvent: MouseEvent)',                                                  description: 'Click sobre un slot vacío.' },
    { name: 'create-event',      payload: '(date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent)',                 description: 'Solicitud de creación de evento.' },
    { name: 'event-drop',        payload: '(event: CalendarEvent, newStart: Date, newEnd: Date | undefined)',                       description: 'Evento arrastrado a una nueva posición.' },
    { name: 'event-resize',      payload: '(event: CalendarEvent, newStart: Date, newEnd: Date)',                                   description: 'Evento redimensionado.' },
    { name: 'select-range',      payload: '(start: Date, end: Date)',                                                               description: 'Rango seleccionado arrastrando.' },
];
</script>

<template>
    <ComponentDoc
        title="WeekView"
        category="Calendar"
        import-path="import { WeekView } from 'mood-ui'"
        description="Vista semanal con grilla horaria. Soporta business hours, rangos deshabilitados, drag & drop y redimensionado de eventos."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="400px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Formato</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="f in ['24h', '12h']"
                                :key="f"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgFormat === f
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgFormat = (f as typeof pgFormat)"
                            >{{ f }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowAllDay
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowAllDay = !pgShowAllDay"
                    >Fila all-day</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgBordered
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgBordered = !pgBordered"
                    >Bordes</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowNowPill
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowNowPill = !pgShowNowPill"
                    >Hora actual</button>
                </template>

                <div class="w-full">
                    <WeekView
                        v-model="pgDate"
                        :events="sampleEvents"
                        :format="pgFormat"
                        :show-all-day-row="pgShowAllDay"
                        :bordered="pgBordered"
                        :show-now-pill="pgShowNowPill"
                    />
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Semana en formato 24 horas con eventos timed."
                :code="basicCode"
                min-height="400px"
            >
                <div class="w-full"><WeekView v-model="dateBasic" :events="sampleEvents" /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Con fila all-day"
                description="La fila superior agrupa eventos all-day y multi-día."
                :code="allDayCode"
                min-height="400px"
            >
                <div class="w-full"><WeekView v-model="dateAllDay" :events="sampleEvents" show-all-day-row /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Formato 12 horas"
                description="Cambia el formato horario a AM/PM."
                :code="fmt12hCode"
                min-height="400px"
            >
                <div class="w-full"><WeekView v-model="date12h" :events="sampleEvents" format="12h" /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Business hours"
                description="Resalta horario laboral y limita el rango horario visible."
                :code="bizCode"
                min-height="400px"
            >
                <div class="w-full">
                    <WeekView
                        v-model="dateBiz"
                        :events="sampleEvents"
                        :business-hours="{ start: '09:00', end: '18:00' }"
                        :hour-start="7"
                        :hour-end="20"
                    />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
