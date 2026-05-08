<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DateRangePicker from '../../../components/data-display/date-picker/DateRangePicker.vue';
import type { PropDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ─────────────────────────────────────────────────
const pgRange   = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const pgMonths  = ref<1 | 2>(2);
const pgPresets = ref(false);
const pgVariant = ref<'filled' | 'outline'>('filled');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('default');
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');

function resetPlayground() {
    pgRange.value   = [new Date(), new Date(Date.now() + 7 * 86400000)];
    pgMonths.value  = 2;
    pgPresets.value = false;
    pgVariant.value = 'filled';
    pgColor.value   = 'default';
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
    if (pgMonths.value  !== 2)        parts.push(`:months="${pgMonths.value}"`);
    if (pgVariant.value !== 'filled') parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgPresets.value)              parts.push('show-presets');
    if (pgRadius.value  !== 'medium') parts.push(`radius="${pgRadius.value}"`);
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<DateRangePicker v-model="range"${attrs} />`;
});

// ── Example codes ─────────────────────────────────────────────────────────────
const twoMonthsCode = `<DateRangePicker v-model="range" :months="2" />`;
const oneMonthCode  = `<DateRangePicker v-model="range" :months="1" />`;
const presetsCode   = `<DateRangePicker v-model="range" :months="2" show-presets />`;
const colorCode     = `<DateRangePicker v-model="range" :months="2" color="primary" />`;
const outlineCode   = `<DateRangePicker v-model="range" :months="2" variant="outline" color="primary" />`;

const ex1 = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const ex2 = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const ex3 = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const ex4 = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const ex5 = ref<[Date | null, Date | null]>([new Date(), new Date(Date.now() + 7 * 86400000)]);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: '[Date | null, Date | null]',                                                default: '[null, null]',  description: 'Tupla con la fecha de inicio y fin del rango (v-model).' },
    { name: 'months',        type: '1 | 2',                                                                     default: '2',             description: 'Número de meses visibles simultáneamente.' },
    { name: 'showPresets',   type: 'boolean',                                                                   default: 'false',         description: 'Muestra el panel lateral con rangos predefinidos (hoy, esta semana, etc.).' },
    { name: 'presets',       type: 'RangePreset[]',                                                                                       description: 'Presets personalizados. Cada uno tiene label y una función range() que retorna la tupla.' },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",                 default: "'default'",     description: 'Color de acento para el rango seleccionado.' },
    { name: 'variant',       type: "'filled' | 'outline'",                                                     default: "'filled'",      description: 'Estilo visual del panel.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                                     description: 'Radio de borde del panel.' },
    { name: 'minDate',       type: 'Date',                                                                                                description: 'Fecha mínima seleccionable.' },
    { name: 'maxDate',       type: 'Date',                                                                                                description: 'Fecha máxima seleccionable.' },
    { name: 'minRange',      type: 'number',                                                                                              description: 'Mínimo de días que debe abarcar el rango.' },
    { name: 'maxRange',      type: 'number',                                                                                              description: 'Máximo de días que puede abarcar el rango.' },
    { name: 'disabledDates', type: 'Date[]',                                                                                              description: 'Fechas no seleccionables.' },
    { name: 'locale',        type: 'string',                                                                                              description: 'Locale para nombres de mes y día.' },
    { name: 'firstDayOfWeek', type: '0 | 1 | 2 | 3 | 4 | 5 | 6',                                              default: '1',             description: 'Día de inicio de semana (0=Dom, 1=Lun).' },
];
</script>

<template>
    <ComponentDoc
        title="DateRangePicker"
        category="Data Display"
        import-path="import { DateRangePicker } from 'mood-ui'"
        description="Selector inline de rango de fechas. Soporta uno o dos meses visibles, presets rápidos, restricciones de longitud mínima/máxima y fechas deshabilitadas."
        :props-list="propsList"
    >
        <!-- ── Overview ─────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="360px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Meses" :options="[{value:'1'},{value:'2'}]" :model-value="String(pgMonths)" @update:model-value="pgMonths = Number($event) as 1|2" />
                    <TbSep />
                    <TbPills label="Variante" :options="[{value:'filled'},{value:'outline'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Radius" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgRadius" />
                    <TbSep />
                    <TbToggle label="Presets" v-model="pgPresets" />
                </template>

                <DateRangePicker
                    v-model="pgRange"
                    :months="pgMonths"
                    :variant="pgVariant"
                    :color="pgColor"
                    :show-presets="pgPresets"
                    :radius="pgRadius"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ─────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Dos meses (por defecto)"
                description="Muestra dos calendarios lado a lado para seleccionar rangos largos cómodamente."
                :code="twoMonthsCode"
                min-height="340px"
            >
                <DateRangePicker v-model="ex1" :months="2" />
            </ComponentPreview>

            <ComponentPreview
                title="Un mes"
                description="Modo compacto con un solo calendario, ideal para rangos cortos."
                :code="oneMonthCode"
                min-height="340px"
            >
                <DateRangePicker v-model="ex2" :months="1" />
            </ComponentPreview>

            <ComponentPreview
                title="Con presets"
                description="show-presets añade un panel lateral con atajos (hoy, esta semana, este mes, últimos 30 días…)."
                :code="presetsCode"
                min-height="340px"
            >
                <DateRangePicker v-model="ex3" :months="2" show-presets />
            </ComponentPreview>

            <ComponentPreview
                title="Color primary"
                description="El color afecta el fondo del rango seleccionado y los días de inicio/fin."
                :code="colorCode"
                min-height="340px"
            >
                <DateRangePicker v-model="ex4" :months="2" color="primary" />
            </ComponentPreview>

            <ComponentPreview
                title="Variante outline"
                description="Borde perimetral visible, útil en fondos neutrales."
                :code="outlineCode"
                min-height="340px"
            >
                <DateRangePicker v-model="ex5" :months="2" variant="outline" color="primary" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>

