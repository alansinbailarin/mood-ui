<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Calendar from '../../../components/data-display/calendar/Calendar.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue   = ref<Date | null>(new Date());
const pgVariant = ref<'filled' | 'outline'>('filled');
const pgColor   = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');
const pgShowOutsideDays = ref(true);
const pgShowHeader      = ref(true);

function resetPlayground() {
    pgValue.value   = new Date();
    pgVariant.value = 'filled';
    pgColor.value   = 'primary';
    pgRadius.value  = 'medium';
    pgShowOutsideDays.value = true;
    pgShowHeader.value      = true;
}

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="date"'];
    if (pgVariant.value !== 'filled')    parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default')   parts.push(`color="${pgColor.value}"`);
    if (pgRadius.value  !== 'medium')    parts.push(`radius="${pgRadius.value}"`);
    if (!pgShowOutsideDays.value)        parts.push(':show-outside-days="false"');
    if (!pgShowHeader.value)             parts.push(':show-header="false"');
    return `<Calendar ${parts.join(' ')} />`;
});

// ── Example state ─────────────────────────────────────────────────────────────
const dateBasic   = ref<Date | null>(new Date());
const dateRange   = ref<Date | null>(new Date());
const dateOutline = ref<Date | null>(new Date());
const dateLocale  = ref<Date | null>(new Date());

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
const propsList: PropDoc[] = [
    { name: 'modelValue',      type: 'Date | null',                                                       description: 'Fecha seleccionada (v-model).' },
    { name: 'month',           type: 'number',                                                            description: 'Mes inicial mostrado (0-11). Por defecto el mes actual.' },
    { name: 'year',            type: 'number',                                                            description: 'Año inicial mostrado.' },
    { name: 'locale',          type: 'string',                                                            description: 'Locale BCP-47 para nombres de mes y días.' },
    { name: 'firstDayOfWeek',  type: '0 | 1 | 2 | 3 | 4 | 5 | 6',                                          description: 'Primer día de la semana (0 = domingo, 1 = lunes).' },
    { name: 'minDate',         type: 'Date',                                                              description: 'Fecha mínima seleccionable.' },
    { name: 'maxDate',         type: 'Date',                                                              description: 'Fecha máxima seleccionable.' },
    { name: 'disabledDates',   type: 'Date[]',                                                            description: 'Fechas individuales a deshabilitar.' },
    { name: 'color',           type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",          default: "'default'", description: 'Color semántico aplicado a la selección y al hover.' },
    { name: 'variant',         type: "'filled' | 'outline'",                                              default: "'filled'",  description: 'Variante visual del contenedor.' },
    { name: 'radius',          type: "'none' | 'small' | 'medium' | 'large' | 'full'",                    default: "'medium'",  description: 'Radio de borde del calendario y de las celdas.' },
    { name: 'showOutsideDays', type: 'boolean',                                                            default: 'true',     description: 'Muestra días del mes anterior y siguiente que completan la grilla.' },
    { name: 'showHeader',      type: 'boolean',                                                            default: 'true',     description: 'Muestra la cabecera con navegación de mes y año.' },
    { name: 'fixedWeeks',      type: 'boolean',                                                            default: 'true',     description: 'Siempre muestra 6 semanas para mantener una altura constante.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'Date',                              description: 'Emitido al seleccionar una fecha.' },
    { name: 'monthChange',       payload: '{ month: number; year: number }',  description: 'Emitido al cambiar el mes o año visible mediante navegación.' },
];
</script>

<template>
    <ComponentDoc
        title="Calendar"
        category="Calendar"
        import-path="import { Calendar } from 'mood-ui'"
        description="Calendario mensual para seleccionar una fecha. Soporta minDate, maxDate, fechas deshabilitadas, locale y variantes visuales."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="380px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['filled', 'outline']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value
                                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                                    : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Radio</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="r in ['none', 'small', 'medium', 'large', 'full']"
                                :key="r"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgRadius === r
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgRadius = (r as typeof pgRadius)"
                            >{{ r }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowOutsideDays
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowOutsideDays = !pgShowOutsideDays"
                    >Días externos</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgShowHeader
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgShowHeader = !pgShowHeader"
                    >Cabecera</button>
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
                title="Básico"
                description="Calendario por defecto vinculado a una fecha mediante v-model."
                :code="basicCode"
                min-height="380px"
            >
                <Calendar v-model="dateBasic" />
            </ComponentPreview>

            <ComponentPreview
                title="Con rango de fechas"
                description="Limita el rango seleccionable usando min-date y max-date."
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
                title="Variante outline"
                description="Variante con borde visible y radio grande."
                :code="outlineCode"
                min-height="380px"
            >
                <Calendar v-model="dateOutline" variant="outline" color="primary" radius="large" />
            </ComponentPreview>

            <ComponentPreview
                title="Locale personalizado"
                description="Cambia el locale y el primer día de la semana."
                :code="localeCode"
                min-height="380px"
            >
                <Calendar v-model="dateLocale" locale="en-US" :first-day-of-week="0" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
