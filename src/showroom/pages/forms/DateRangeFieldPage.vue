<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DateRangeField from '../../../components/forms/DateRangeField.vue';
import type { PropDoc, EmitDoc } from '../../types';

type Range = [Date | null, Date | null];

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgPresets  = ref(false);
const pgClearable = ref(false);
const pgDisabled = ref(false);

const pgValue = ref<Range>([new Date(), new Date(Date.now() + 5 * 86400000)]);

function resetPlayground() {
    pgSize.value      = 'medium';
    pgPresets.value   = false;
    pgClearable.value = false;
    pgDisabled.value  = false;
    pgValue.value     = [new Date(), new Date(Date.now() + 5 * 86400000)];
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="range"', 'label="Periodo"'];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgPresets.value)           parts.push('show-presets');
    if (pgClearable.value)         parts.push('clearable');
    if (pgDisabled.value)          parts.push('disabled');
    return `<DateRangeField\n    ${parts.join('\n    ')}\n    class="w-96"\n/>`;
});

// ── Examples state ────────────────────────────────────────────────────────────
const rBasic       = ref<Range>([new Date(), new Date(Date.now() + 3 * 86400000)]);
const rPresets     = ref<Range>([null, null]);
const rConstrained = ref<Range>([null, null]);
const rDisabled    = ref<Range>([new Date(), new Date(Date.now() + 7 * 86400000)]);
const today        = new Date();
const maxDate      = new Date(Date.now() + 60 * 86400000);

const basicCode = `<DateRangeField v-model="range" label="Periodo" class="w-96" />`;

const presetsCode = `<DateRangeField v-model="range" label="Periodo" show-presets class="w-96" />`;

const constraintsCode = `<DateRangeField
    v-model="range"
    label="Reservar en los próximos 60 días"
    :min-date="new Date()"
    :max-date="new Date(Date.now() + 60 * 86400000)"
    class="w-96"
/>`;

const disabledCode = `<DateRangeField :model-value="range" label="Periodo" disabled class="w-96" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: '[Date | null, Date | null]',           default: '[null, null]', description: 'Rango seleccionado [start, end]. Soporta v-model.' },
    { name: 'label',       type: 'string',                                                        description: 'Etiqueta visible encima del campo.' },
    { name: 'placeholder', type: 'string',                                default: "'Select date range…'", description: 'Texto cuando no hay rango seleccionado.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",         default: "'medium'",     description: 'Tamaño del input.' },
    { name: 'months',      type: 'number',                                default: '2',           description: 'Número de meses visibles en el popover.' },
    { name: 'showPresets', type: 'boolean',                               default: 'false',       description: 'Muestra una columna con presets (hoy, semana, mes…).' },
    { name: 'minDate',     type: 'Date',                                                          description: 'Fecha mínima seleccionable en el calendario.' },
    { name: 'maxDate',     type: 'Date',                                                          description: 'Fecha máxima seleccionable en el calendario.' },
    { name: 'minRange',    type: 'number',                                                        description: 'Número mínimo de días entre start y end.' },
    { name: 'maxRange',    type: 'number',                                                        description: 'Número máximo de días entre start y end.' },
    { name: 'clearable',   type: 'boolean',                               default: 'false',       description: 'Muestra un botón para limpiar el rango.' },
    { name: 'disabled',    type: 'boolean',                               default: 'false',       description: 'Deshabilita el campo.' },
    { name: 'readonly',    type: 'boolean',                               default: 'false',       description: 'Hace el campo no interactivo.' },
    { name: 'fullWidth',   type: 'boolean',                               default: 'false',       description: 'Ocupa el 100% del ancho disponible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: '[Date | null, Date | null]', description: 'Emitido al cambiar el rango.' },
    { name: 'change',            payload: '[Date | null, Date | null]', description: 'Alias semántico de update:modelValue.' },
    { name: 'open',              payload: 'void',                       description: 'Emitido al abrir el popover.' },
    { name: 'close',             payload: 'void',                       description: 'Emitido al cerrar el popover.' },
    { name: 'clear',             payload: 'void',                       description: 'Emitido al limpiar el rango.' },
];
</script>

<template>
    <ComponentDoc
        title="DateRangeField"
        category="Forms"
        import-path="import { DateRangeField } from 'mood-ui'"
        description="Selector de rango de fechas con popover de doble calendario y soporte de presets."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="300px" @reset="resetPlayground">
                <template #controls>
                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgPresets
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgPresets = !pgPresets"
                    >Presets</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgClearable
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgClearable = !pgClearable"
                    >Clearable</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <DateRangeField
                    v-model="pgValue"
                    label="Periodo"
                    :size="pgSize"
                    :show-presets="pgPresets"
                    :clearable="pgClearable"
                    :disabled="pgDisabled"
                    class="w-96"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Selector con popover de doble calendario y formato medio por defecto."
                :code="basicCode"
            >
                <DateRangeField v-model="rBasic" label="Periodo" class="w-96" />
            </ComponentPreview>

            <ComponentPreview
                title="Con presets"
                description="Activa show-presets para añadir atajos rápidos como hoy, semana o mes."
                :code="presetsCode"
            >
                <DateRangeField v-model="rPresets" label="Periodo" show-presets class="w-96" />
            </ComponentPreview>

            <ComponentPreview
                title="Min y max"
                description="Limita el rango seleccionable con minDate y maxDate."
                :code="constraintsCode"
            >
                <DateRangeField
                    v-model="rConstrained"
                    label="Reservar en los próximos 60 días"
                    :min-date="today"
                    :max-date="maxDate"
                    class="w-96"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="El campo se atenúa, bloquea el popover y conserva el rango visible."
                :code="disabledCode"
            >
                <DateRangeField :model-value="rDisabled" label="Periodo" disabled class="w-96" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
