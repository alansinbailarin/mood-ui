<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import AgendaView from '../../../components/data-display/calendar/AgendaView.vue';
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
    { id: '1', title: 'Stand-up',        start: at(9, 0, 0),  end: at(9, 30, 0),  color: 'primary' },
    { id: '2', title: 'Revisión sprint', start: at(11, 0, 0), end: at(12, 0, 0),  color: 'success' },
    { id: '3', title: 'Demo cliente',    start: at(15, 0, 1), end: at(16, 0, 1),  color: 'info' },
    { id: '4', title: 'Onboarding',      start: at(10, 0, 3), end: at(11, 30, 3), color: 'warning' },
    { id: '5', title: 'Workshop UX',     start: at(14, 0, 5), end: at(17, 0, 5),  color: 'purple' },
    { id: '6', title: 'Lanzamiento',     start: at(9, 0, 7),  end: at(18, 0, 7),  color: 'danger', allDay: true },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgDate          = ref(new Date());
const pgDaysToShow    = ref(7);
const pgShowEmptyDays = ref(false);
const pgFormat        = ref<'12h' | '24h'>('24h');
const pgBordered      = ref(true);

function resetPlayground() {
    pgDate.value          = new Date();
    pgDaysToShow.value    = 7;
    pgShowEmptyDays.value = false;
    pgFormat.value        = '24h';
    pgBordered.value      = true;
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="date"', ':events="events"'];
    if (pgDaysToShow.value !== 7)   parts.push(`:days-to-show="${pgDaysToShow.value}"`);
    if (pgShowEmptyDays.value)      parts.push('show-empty-days');
    if (pgFormat.value !== '24h')   parts.push(`format="${pgFormat.value}"`);
    if (!pgBordered.value)          parts.push(':bordered="false"');
    return `<AgendaView ${parts.join(' ')} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic = ref(new Date());
const dateLong  = ref(new Date());
const dateEmpty = ref(new Date());
const date12h   = ref(new Date());

const emptyEvents: CalendarEvent[] = [];

const basicCode = `<AgendaView v-model="date" :events="events" :days-to-show="7" />`;
const longCode  = `<AgendaView v-model="date" :events="events" :days-to-show="14" />`;
const emptyCode = `<AgendaView
    v-model="date"
    :events="[]"
    :days-to-show="7"
    show-empty-days
    empty-text="Sin eventos próximos"
/>`;
const fmt12hCode = `<AgendaView v-model="date" :events="events" :days-to-show="7" format="12h" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',           type: 'Date',                                                              description: 'Fecha ancla a partir de la cual se calcula el rango.' },
    { name: 'events',               type: 'CalendarEvent[]',                                                   description: 'Lista de eventos a mostrar.' },
    { name: 'locale',               type: 'string',                                                            description: 'Locale BCP-47 para fechas y nombres de día.' },
    { name: 'color',                type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",          description: 'Color semántico aplicado a los acentos.' },
    { name: 'daysToShow',           type: 'number',                                     default: '30',         description: 'Cantidad de días hacia adelante a mostrar.' },
    { name: 'daysBefore',           type: 'number',                                     default: '0',          description: 'Días hacia atrás incluidos antes de la fecha ancla.' },
    { name: 'showEmptyDays',        type: 'boolean',                                    default: 'false',      description: 'Muestra los días sin eventos como filas vacías.' },
    { name: 'showMonthSeparator',   type: 'boolean',                                    default: 'true',       description: 'Inserta un separador al cambiar de mes.' },
    { name: 'showHeader',           type: 'boolean',                                    default: 'true',       description: 'Muestra la cabecera con navegación.' },
    { name: 'format',               type: "'12h' | '24h'",                              default: "'24h'",      description: 'Formato horario de los eventos.' },
    { name: 'emptyText',            type: 'string',                                                            description: 'Texto mostrado cuando no hay eventos en el rango.' },
    { name: 'highlightedDates',     type: 'Date[]',                                                            description: 'Fechas resaltadas visualmente.' },
    { name: 'disabledDates',        type: 'Date[]',                                                            description: 'Fechas deshabilitadas.' },
    { name: 'bordered',             type: 'boolean',                                    default: 'true',       description: 'Dibuja borde alrededor del contenedor.' },
    { name: 'loadMoreChunk',        type: 'number',                                                            description: 'Número de días añadidos al cargar más eventos.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'Date',                                                                                  description: 'Emitido al cambiar el rango visible.' },
    { name: 'event-click',       payload: '(event: CalendarEvent, nativeEvent: MouseEvent)',                                        description: 'Click sobre un evento.' },
    { name: 'day-click',         payload: '(date: Date, events: CalendarEvent[], nativeEvent: MouseEvent)',                         description: 'Click sobre la fila de un día.' },
    { name: 'create-event',      payload: '(date: Date, allDay: boolean, nativeEvent: MouseEvent | KeyboardEvent)',                 description: 'Solicitud de creación de evento.' },
    { name: 'load-more',         payload: "'forward' | 'backward'",                                                                  description: 'Solicitud de cargar más días al final del listado.' },
];
</script>

<template>
    <ComponentDoc
        title="AgendaView"
        category="Calendar"
        import-path="import { AgendaView } from 'mood-ui'"
        description="Lista cronológica de eventos por día. Ideal para secciones “próximos eventos”, dashboards y agendas compactas."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="400px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Días</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="d in [3, 7, 14, 30]"
                                :key="d"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgDaysToShow === d
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgDaysToShow = d"
                            >{{ d }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

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
                        :class="pgShowEmptyDays
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowEmptyDays = !pgShowEmptyDays"
                    >Días vacíos</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgBordered
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgBordered = !pgBordered"
                    >Bordes</button>
                </template>

                <div class="w-full max-w-2xl">
                    <AgendaView
                        v-model="pgDate"
                        :events="sampleEvents"
                        :days-to-show="pgDaysToShow"
                        :show-empty-days="pgShowEmptyDays"
                        :format="pgFormat"
                        :bordered="pgBordered"
                    />
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Lista de los próximos 7 días agrupada por día."
                :code="basicCode"
                min-height="400px"
            >
                <div class="w-full max-w-2xl"><AgendaView v-model="dateBasic" :events="sampleEvents" :days-to-show="7" /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Rango extendido"
                description="Aumenta days-to-show para mostrar más días por adelantado."
                :code="longCode"
                min-height="400px"
            >
                <div class="w-full max-w-2xl"><AgendaView v-model="dateLong" :events="sampleEvents" :days-to-show="14" /></div>
            </ComponentPreview>

            <ComponentPreview
                title="Estado vacío"
                description="Cuando no hay eventos, muestra un mensaje configurable."
                :code="emptyCode"
                min-height="320px"
            >
                <div class="w-full max-w-2xl">
                    <AgendaView
                        v-model="dateEmpty"
                        :events="emptyEvents"
                        :days-to-show="7"
                        show-empty-days
                        empty-text="Sin eventos próximos"
                    />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Formato 12 horas"
                description="Muestra los horarios de los eventos en formato AM/PM."
                :code="fmt12hCode"
                min-height="400px"
            >
                <div class="w-full max-w-2xl"><AgendaView v-model="date12h" :events="sampleEvents" :days-to-show="7" format="12h" /></div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
