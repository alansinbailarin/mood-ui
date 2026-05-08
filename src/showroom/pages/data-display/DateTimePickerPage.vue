<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DateTimePicker from '../../../components/data-display/date-picker/DateTimePicker.vue';
import type { PropDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ──────────────────────────────────────────────────
const pgDate    = ref<Date | null>(new Date());
const pgFormat  = ref<'24h' | '12h'>('24h');
const pgVariant = ref<'filled' | 'outline'>('filled');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('default');
const pgStep    = ref<number>(1);
const pgSeconds = ref(false);
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');

function resetPlayground() {
    pgDate.value    = new Date();
    pgFormat.value  = '24h';
    pgVariant.value = 'filled';
    pgColor.value   = 'default';
    pgStep.value    = 1;
    pgSeconds.value = false;
    pgRadius.value  = 'medium';
}

const colorDots = [
    { value: 'default'  as const, bg: 'var(--color-slate-400)',  label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)',           label: 'Primary'  },
    { value: 'success'  as const, bg: 'var(--color-emerald-500)', label: 'Success'  },
    { value: 'warning'  as const, bg: 'var(--color-amber-500)',   label: 'Warning'  },
    { value: 'danger'   as const, bg: 'var(--color-red-500)',     label: 'Danger'   },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgFormat.value  !== '24h')    parts.push(`format="${pgFormat.value}"`);
    if (pgVariant.value !== 'filled') parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgStep.value    !== 1)        parts.push(`:step="${pgStep.value}"`);
    if (pgSeconds.value)              parts.push('show-seconds');
    if (pgRadius.value  !== 'medium') parts.push(`radius="${pgRadius.value}"`);
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<DateTimePicker v-model="date"${attrs} />`;
});

// ── Example codes ─────────────────────────────────────────────────────────────
const basic24Code = `<DateTimePicker v-model="date" />`;

const format12Code = `<DateTimePicker v-model="date" format="12h" />`;

const secondsCode = `<DateTimePicker v-model="date" format="12h" show-seconds />`;

const stepCode = `<DateTimePicker v-model="date" :step="15" color="primary" />`;

const outlineCode = `<DateTimePicker v-model="date" variant="outline" color="primary" />`;

// Example state
const ex1 = ref<Date | null>(new Date());
const ex2 = ref<Date | null>(new Date());
const ex3 = ref<Date | null>(new Date());
const ex4 = ref<Date | null>(new Date());
const ex5 = ref<Date | null>(new Date());

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: 'Date | null',                                                    default: 'null',       description: 'Fecha y hora seleccionada (v-model).' },
    { name: 'format',        type: "'12h' | '24h'",                                                  default: "'24h'",      description: 'Formato de hora del selector de tiempo.' },
    { name: 'step',          type: 'number',                                                         default: '1',          description: 'Incremento en minutos para la columna de minutos.' },
    { name: 'showSeconds',   type: 'boolean',                                                        default: 'false',      description: 'Muestra la columna de segundos.' },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",      default: "'default'",  description: 'Color de acento para el día seleccionado.' },
    { name: 'variant',       type: "'filled' | 'outline'",                                          default: "'filled'",   description: 'Estilo visual del panel de calendario.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                       description: 'Radio de borde del panel.' },
    { name: 'minDate',       type: 'Date',                                                                                  description: 'Fecha mínima seleccionable.' },
    { name: 'maxDate',       type: 'Date',                                                                                  description: 'Fecha máxima seleccionable.' },
    { name: 'disabledDates', type: 'Date[]',                                                                                description: 'Lista de fechas deshabilitadas.' },
    { name: 'minTime',       type: 'string',                                                                                description: 'Hora mínima en formato HH:MM.' },
    { name: 'maxTime',       type: 'string',                                                                                description: 'Hora máxima en formato HH:MM.' },
    { name: 'locale',        type: 'string',                                                                                description: 'Locale para nombres de mes y día (ej. es-MX).' },
    { name: 'firstDayOfWeek', type: '0 | 1 | 2 | 3 | 4 | 5 | 6',                                   default: '1',          description: 'Día de inicio de semana (0=Dom, 1=Lun).' },
];
</script>

<template>
    <ComponentDoc
        title="DateTimePicker"
        category="Data Display"
        import-path="import { DateTimePicker } from 'mood-ui'"
        description="Selector inline de fecha y hora. Muestra un calendario mensual junto a columnas de tiempo deslizables. Soporta formatos 12/24h, segundos y step de minutos."
        :props-list="propsList"
    >
        <!-- ── Overview ─────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="360px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Formato" :options="[{value:'24h'},{value:'12h'}]" v-model="pgFormat" />
                    <TbSep />
                    <TbPills label="Variante" :options="[{value:'filled'},{value:'outline'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Step" :options="[{value:'1',label:'1m'},{value:'5',label:'5m'},{value:'10',label:'10m'},{value:'15',label:'15m'},{value:'30',label:'30m'}]" :model-value="String(pgStep)" @update:model-value="pgStep = Number($event)" />
                    <TbSep />
                    <TbPills label="Radius" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgRadius" />
                    <TbSep />
                    <TbToggle label="Segundos" v-model="pgSeconds" />
                </template>

                <DateTimePicker
                    v-model="pgDate"
                    :format="pgFormat"
                    :variant="pgVariant"
                    :color="pgColor"
                    :step="pgStep"
                    :show-seconds="pgSeconds"
                    :radius="pgRadius"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ──────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="24h (por defecto)"
                description="Modo 24 horas con columnas de hora y minutos."
                :code="basic24Code"
                min-height="360px"
            >
                <DateTimePicker v-model="ex1" />
            </ComponentPreview>

            <ComponentPreview
                title="Formato 12h"
                description="Añade la columna AM/PM para regiones que prefieren el reloj de 12 horas."
                :code="format12Code"
                min-height="360px"
            >
                <DateTimePicker v-model="ex2" format="12h" />
            </ComponentPreview>

            <ComponentPreview
                title="12h con segundos"
                description="Activa show-seconds para mostrar la columna de segundos."
                :code="secondsCode"
                min-height="360px"
            >
                <DateTimePicker v-model="ex3" format="12h" show-seconds />
            </ComponentPreview>

            <ComponentPreview
                title="Step 15 minutos"
                description='step="15" agrupa los minutos en saltos de 15, ideal para agendas.'
                :code="stepCode"
                min-height="360px"
            >
                <DateTimePicker v-model="ex4" :step="15" color="primary" />
            </ComponentPreview>

            <ComponentPreview
                title="Variante outline"
                description="Borde perimetral para fondos neutros o tarjetas."
                :code="outlineCode"
                min-height="360px"
            >
                <DateTimePicker v-model="ex5" variant="outline" color="primary" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
