<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DateTimeField from '../../../components/forms/DateTimeField.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgFormat    = ref<'24h' | '12h'>('24h');
const pgClearable = ref(false);
const pgDisabled  = ref(false);

const pgValue = ref<Date | null>(new Date());

function resetPlayground() {
    pgSize.value      = 'medium';
    pgFormat.value    = '24h';
    pgClearable.value = false;
    pgDisabled.value  = false;
    pgValue.value     = new Date();
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="value"', 'label="Inicio"'];
    if (pgSize.value   !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgFormat.value !== '24h')    parts.push(`format="${pgFormat.value}"`);
    if (pgClearable.value)           parts.push('clearable');
    if (pgDisabled.value)            parts.push('disabled');
    return `<DateTimeField\n    ${parts.join('\n    ')}\n    class="w-80"\n/>`;
});

// ── Examples state ────────────────────────────────────────────────────────────
const dValue       = ref<Date | null>(new Date());
const d12h         = ref<Date | null>(new Date());
const dConstrained = ref<Date | null>(null);
const dClearable   = ref<Date | null>(new Date());
const today        = new Date();
const maxDate      = new Date(Date.now() + 7 * 86400000);

const basicCode = `<DateTimeField v-model="value" label="Inicio" class="w-80" />`;

const format12hCode = `<DateTimeField v-model="value" label="Inicio" format="12h" class="w-80" />`;

const constraintsCode = `<DateTimeField
    v-model="value"
    label="Cita en los próximos 7 días"
    :min-date="new Date()"
    :max-date="new Date(Date.now() + 7 * 86400000)"
    class="w-80"
/>`;

const clearableCode = `<DateTimeField v-model="value" label="Inicio" clearable class="w-80" />`;

const disabledCode = `<DateTimeField :model-value="value" label="Inicio" disabled class="w-80" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'Date | null',                          default: 'null',         description: 'Fecha + hora seleccionada. Soporta v-model.' },
    { name: 'label',       type: 'string',                                                        description: 'Etiqueta visible encima del campo.' },
    { name: 'placeholder', type: 'string',                                default: "'Select date and time…'", description: 'Texto cuando no hay valor.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",         default: "'medium'",     description: 'Tamaño del input.' },
    { name: 'format',      type: "'24h' | '12h'",                        default: "'24h'",        description: 'Formato del selector de hora.' },
    { name: 'step',        type: 'number',                                default: '5',            description: 'Granularidad de los minutos en el picker.' },
    { name: 'showSeconds', type: 'boolean',                               default: 'false',        description: 'Muestra columna de segundos en el picker.' },
    { name: 'minDate',     type: 'Date',                                                          description: 'Fecha y hora mínima seleccionable.' },
    { name: 'maxDate',     type: 'Date',                                                          description: 'Fecha y hora máxima seleccionable.' },
    { name: 'clearable',   type: 'boolean',                               default: 'false',        description: 'Muestra un botón para limpiar el valor.' },
    { name: 'disabled',    type: 'boolean',                               default: 'false',        description: 'Deshabilita el campo.' },
    { name: 'readonly',    type: 'boolean',                               default: 'false',        description: 'Hace el campo no interactivo.' },
    { name: 'required',    type: 'boolean',                               default: 'false',        description: 'Marca el campo como obligatorio.' },
    { name: 'fullWidth',   type: 'boolean',                               default: 'false',        description: 'Ocupa el 100% del ancho disponible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'Date | null', description: 'Emitido al seleccionar o limpiar el valor.' },
    { name: 'change',            payload: 'Date | null', description: 'Alias semántico de update:modelValue.' },
    { name: 'open',              payload: 'void',        description: 'Emitido al abrir el popover.' },
    { name: 'close',             payload: 'void',        description: 'Emitido al cerrar el popover.' },
    { name: 'clear',             payload: 'void',        description: 'Emitido al limpiar el valor.' },
];
</script>

<template>
    <ComponentDoc
        title="DateTimeField"
        category="Forms"
        import-path="import { DateTimeField } from 'mood-ui'"
        description="Input combinado de fecha y hora con popover de calendario + selector de hora interno."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="280px" @reset="resetPlayground">
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

                    <!-- Format -->
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

                <DateTimeField
                    v-model="pgValue"
                    label="Inicio"
                    :size="pgSize"
                    :format="pgFormat"
                    :clearable="pgClearable"
                    :disabled="pgDisabled"
                    class="w-80"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Selector combinado de fecha y hora con formato 24h por defecto."
                :code="basicCode"
            >
                <DateTimeField v-model="dValue" label="Inicio" class="w-80" />
            </ComponentPreview>

            <ComponentPreview
                title="Formato 12h"
                description="Cambia el selector de hora a formato AM/PM con format='12h'."
                :code="format12hCode"
            >
                <DateTimeField v-model="d12h" label="Inicio" format="12h" class="w-80" />
            </ComponentPreview>

            <ComponentPreview
                title="Min y max"
                description="Limita el rango con minDate y maxDate aplicados a fecha y hora."
                :code="constraintsCode"
            >
                <DateTimeField
                    v-model="dConstrained"
                    label="Cita en los próximos 7 días"
                    :min-date="today"
                    :max-date="maxDate"
                    class="w-80"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Clearable"
                description="Botón ✕ visible cuando hay valor para limpiar la selección."
                :code="clearableCode"
            >
                <DateTimeField v-model="dClearable" label="Inicio" clearable class="w-80" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="El campo se atenúa y bloquea la apertura del popover."
                :code="disabledCode"
            >
                <DateTimeField :model-value="dValue" label="Inicio" disabled class="w-80" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
