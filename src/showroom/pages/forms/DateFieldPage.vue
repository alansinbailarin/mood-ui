<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DateField from '../../../components/forms/DateField.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgVariant   = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgClearable = ref(false);
const pgDisabled  = ref(false);

const pgValue = ref<Date | null>(new Date());

function resetPlayground() {
    pgSize.value      = 'medium';
    pgVariant.value   = 'outline';
    pgClearable.value = false;
    pgDisabled.value  = false;
    pgValue.value     = new Date();
}

const overviewCode = computed(() => {
    const parts: string[] = ['v-model="value"', 'label="Fecha"'];
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgVariant.value !== 'outline') parts.push(`variant="${pgVariant.value}"`);
    if (pgClearable.value)             parts.push('clearable');
    if (pgDisabled.value)              parts.push('disabled');
    return `<DateField\n    ${parts.join('\n    ')}\n    class="w-72"\n/>`;
});

// ── Examples state ────────────────────────────────────────────────────────────
const dValue       = ref<Date | null>(new Date());
const dConstrained = ref<Date | null>(null);
const dClearable   = ref<Date | null>(new Date());
const today        = new Date();
const maxDate      = new Date(Date.now() + 30 * 86400000);

const basicCode = `<DateField v-model="value" label="Fecha" class="w-72" />`;

const sizesCode = `<DateField v-model="value" size="small"  label="Small"  class="w-72" />
<DateField v-model="value" size="medium" label="Medium" class="w-72" />
<DateField v-model="value" size="large"  label="Large"  class="w-72" />`;

const constraintsCode = `<DateField
    v-model="value"
    label="Reservar entre hoy y +30 días"
    :min-date="new Date()"
    :max-date="new Date(Date.now() + 30 * 86400000)"
    class="w-72"
/>`;

const clearableCode = `<DateField v-model="value" label="Fecha" clearable class="w-72" />`;

const disabledCode = `<DateField :model-value="value" label="Fecha" disabled class="w-72" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: 'Date | null',                          default: 'null',       description: 'Fecha seleccionada. Soporta v-model.' },
    { name: 'label',         type: 'string',                                                      description: 'Etiqueta visible encima del campo.' },
    { name: 'placeholder',   type: 'string',                                default: "'Select date…'", description: 'Texto mostrado cuando no hay fecha seleccionada.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",         default: "'medium'",   description: 'Tamaño del input.' },
    { name: 'variant',       type: "'outline' | 'filled' | 'ghost'",       default: "'outline'",  description: 'Estilo visual del wrapper.' },
    { name: 'displayFormat', type: "'short' | 'medium' | 'long' | 'full'", default: "'medium'",   description: 'Formato Intl usado para mostrar la fecha seleccionada.' },
    { name: 'minDate',       type: 'Date',                                                        description: 'Fecha mínima seleccionable en el calendario.' },
    { name: 'maxDate',       type: 'Date',                                                        description: 'Fecha máxima seleccionable en el calendario.' },
    { name: 'clearable',     type: 'boolean',                               default: 'false',     description: 'Muestra un botón para limpiar el valor cuando hay fecha.' },
    { name: 'disabled',      type: 'boolean',                               default: 'false',     description: 'Deshabilita el campo y bloquea la apertura del popover.' },
    { name: 'readonly',      type: 'boolean',                               default: 'false',     description: 'Hace el campo no interactivo conservando el valor visible.' },
    { name: 'required',      type: 'boolean',                               default: 'false',     description: 'Marca el campo como obligatorio para validación.' },
    { name: 'fullWidth',     type: 'boolean',                               default: 'false',     description: 'El campo ocupa el 100% del ancho disponible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'Date | null', description: 'Emitido cuando el usuario selecciona o limpia la fecha.' },
    { name: 'change',            payload: 'Date | null', description: 'Alias semántico de update:modelValue.' },
    { name: 'open',              payload: 'void',        description: 'Emitido al abrir el popover del calendario.' },
    { name: 'close',             payload: 'void',        description: 'Emitido al cerrar el popover.' },
    { name: 'clear',             payload: 'void',        description: 'Emitido al pulsar el botón de limpiar.' },
];
</script>

<template>
    <ComponentDoc
        title="DateField"
        category="Forms"
        import-path="import { DateField } from 'mood-ui'"
        description="Input de fecha con popover de calendario. Localizable, con minDate / maxDate y formato configurable."
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

                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['outline', 'filled', 'ghost']"
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

                <DateField
                    v-model="pgValue"
                    label="Fecha"
                    :size="pgSize"
                    :variant="pgVariant"
                    :clearable="pgClearable"
                    :disabled="pgDisabled"
                    class="w-72"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Campo con label, popover de calendario y formato medio por defecto."
                :code="basicCode"
            >
                <DateField v-model="dValue" label="Fecha" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Disponible en small, medium y large compartiendo proporciones del input."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3">
                    <DateField v-model="dValue" size="small"  label="Small"  class="w-72" />
                    <DateField v-model="dValue" size="medium" label="Medium" class="w-72" />
                    <DateField v-model="dValue" size="large"  label="Large"  class="w-72" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Min y max"
                description="Limita el rango seleccionable usando minDate y maxDate."
                :code="constraintsCode"
            >
                <DateField
                    v-model="dConstrained"
                    label="Reservar entre hoy y +30 días"
                    :min-date="today"
                    :max-date="maxDate"
                    class="w-72"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Clearable"
                description="Aparece un botón ✕ cuando hay valor para limpiar la fecha rápidamente."
                :code="clearableCode"
            >
                <DateField v-model="dClearable" label="Fecha" clearable class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="El campo se atenúa, bloquea el popover y conserva el valor visible."
                :code="disabledCode"
            >
                <DateField :model-value="dValue" label="Fecha" disabled class="w-72" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
