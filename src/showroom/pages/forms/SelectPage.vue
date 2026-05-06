<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Select from '../../../components/forms/Select.vue';
import type { PropDoc, EmitDoc } from '../../types';

const countries = [
    { value: 'es', label: 'España' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'co', label: 'Colombia' },
    { value: 'cl', label: 'Chile' },
    { value: 'pe', label: 'Perú' },
];

const grouped = [
    { value: 'es', label: 'Español', group: 'Europa' },
    { value: 'fr', label: 'Francés', group: 'Europa' },
    { value: 'de', label: 'Alemán', group: 'Europa' },
    { value: 'en', label: 'Inglés', group: 'América' },
    { value: 'pt', label: 'Portugués', group: 'América' },
    { value: 'ja', label: 'Japonés', group: 'Asia' },
    { value: 'zh', label: 'Chino', group: 'Asia' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue     = ref<string | number | null>('mx');
const pgColor     = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgClearable = ref(true);
const pgDisabled  = ref(false);

function resetPlayground() {
    pgValue.value     = 'mx';
    pgColor.value     = 'primary';
    pgSize.value      = 'medium';
    pgClearable.value = true;
    pgDisabled.value  = false;
}

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgClearable.value)           parts.push('clearable');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<Select\n    v-model="value"\n    :options="countries"\n    label="País"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Select v-model="country" :options="countries" label="País" placeholder="Elige un país" />`;

const searchableCode = `<Select
    v-model="lang"
    :options="grouped"
    label="Idioma"
    searchable
    placeholder="Buscar idioma…"
/>`;

const groupedCode = `<Select
    v-model="lang"
    :options="grouped"
    label="Idioma"
/>`;

const sizesCode = `<Select :options="countries" size="small"  placeholder="Small" />
<Select :options="countries" size="medium" placeholder="Medium" />
<Select :options="countries" size="large"  placeholder="Large" />`;

const statesCode = `<Select :options="countries" label="Loading" loading  placeholder="Cargando…" />
<Select :options="countries" label="Disabled" disabled placeholder="No editable" />
<Select :options="countries" label="Error" error-text="Selecciona un país" />`;

const ex1 = ref<string | number | null>(null);
const ex2 = ref<string | number | null>(null);
const ex3 = ref<string | number | null>('es');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',    type: 'string | number | null',                                           description: 'Valor seleccionado (v-model). null cuando no hay selección.' },
    { name: 'options',       type: 'SelectOption[]',                                                   description: 'Lista de opciones { value, label, description?, icon?, disabled?, group? }.', required: true },
    { name: 'label',         type: 'string',                                                                                description: 'Etiqueta visible sobre el campo.' },
    { name: 'placeholder',   type: 'string',                                            default: "'Select…'",               description: 'Texto mostrado cuando no hay valor seleccionado.' },
    { name: 'helperText',    type: 'string',                                                                                description: 'Texto de ayuda bajo el campo.' },
    { name: 'errorText',     type: 'string',                                                                                description: 'Mensaje de error que reemplaza al helperText.' },
    { name: 'variant',       type: "'outline' | 'filled' | 'ghost'",                    default: "'outline'",               description: 'Estilo visual del trigger.' },
    { name: 'color',         type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'",        description: 'Color semántico del foco y acento.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                      default: "'medium'",                description: 'Altura y tipografía del trigger.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",    default: "'medium'",                description: 'Radio de esquinas del trigger y panel.' },
    { name: 'clearable',     type: 'boolean',                                            default: 'false',                  description: 'Muestra un botón X para limpiar la selección.' },
    { name: 'searchable',    type: 'boolean',                                            default: 'false',                  description: 'Muestra un input de búsqueda dentro del panel.' },
    { name: 'disabled',      type: 'boolean',                                            default: 'false',                  description: 'Deshabilita el control.' },
    { name: 'readonly',      type: 'boolean',                                            default: 'false',                  description: 'Modo solo lectura — bloquea cambios.' },
    { name: 'required',      type: 'boolean',                                            default: 'false',                  description: 'Marca el campo como requerido.' },
    { name: 'loading',       type: 'boolean',                                            default: 'false',                  description: 'Muestra un spinner en lugar del chevron.' },
    { name: 'fullWidth',     type: 'boolean',                                            default: 'false',                  description: 'Aplica w-full al control raíz.' },
    { name: 'iconLeft',      type: 'Component',                                                                              description: 'Icono renderizado a la izquierda del trigger.' },
    { name: 'panelWidth',    type: "'trigger' | 'auto'",                                default: "'trigger'",               description: 'Calcula el ancho del panel según el trigger o su contenido.' },
    { name: 'name',          type: 'string',                                                                                description: 'Atributo name HTML para envío en formularios.' },
    { name: 'id',            type: 'string',                                                                                description: 'id del control. Se autogenera si se omite.' },
    { name: 'ariaLabel',     type: 'string',                                                                                description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string | number | null', description: 'Emitido al cambiar el valor (sincroniza v-model).' },
    { name: 'change',            payload: 'string | number | null', description: 'Emitido tras cada selección confirmada por el usuario.' },
    { name: 'open',              payload: 'void',                   description: 'Emitido cuando el panel se abre.' },
    { name: 'close',             payload: 'void',                   description: 'Emitido cuando el panel se cierra.' },
];
</script>

<template>
    <ComponentDoc
        title="Select"
        category="Forms"
        import-path="import { Select } from 'mood-ui'"
        description="Selector accesible de un único valor con panel desplegable. Soporta búsqueda, agrupación, iconos y los modos visuales habituales."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="240px" @reset="resetPlayground">
                <template #controls>
                    <!-- Color dots -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">COLOR</span>
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

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">SIZE</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
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

                <Select
                    v-model="pgValue"
                    :options="countries"
                    label="País"
                    :color="pgColor"
                    :size="pgSize"
                    :clearable="pgClearable"
                    :disabled="pgDisabled"
                    class="w-64"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Selector simple con opciones estáticas y un placeholder."
                :code="basicCode"
            >
                <Select v-model="ex1" :options="countries" label="País" placeholder="Elige un país" class="w-64" />
            </ComponentPreview>

            <ComponentPreview
                title="Buscable"
                description="Activa searchable para mostrar un buscador dentro del panel."
                :code="searchableCode"
            >
                <Select v-model="ex2" :options="grouped" label="Idioma" searchable placeholder="Buscar idioma…" class="w-64" />
            </ComponentPreview>

            <ComponentPreview
                title="Opciones agrupadas"
                description="Las opciones con la misma propiedad group se renderizan bajo un encabezado."
                :code="groupedCode"
            >
                <Select v-model="ex3" :options="grouped" label="Idioma" class="w-64" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños para encajar con la densidad del formulario."
                :code="sizesCode"
            >
                <Select :options="countries" size="small"  placeholder="Small" class="w-40" />
                <Select :options="countries" size="medium" placeholder="Medium" class="w-40" />
                <Select :options="countries" size="large"  placeholder="Large" class="w-40" />
            </ComponentPreview>

            <ComponentPreview
                title="Estados"
                description="Loading, disabled y error con feedback inline."
                :code="statesCode"
            >
                <Select :options="countries" label="Loading"  loading  placeholder="Cargando…" class="w-48" />
                <Select :options="countries" label="Disabled" disabled placeholder="No editable" class="w-48" />
                <Select :options="countries" label="Error"   error-text="Selecciona un país" class="w-48" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
