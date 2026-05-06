<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import MultiSelect from '../../../components/forms/MultiSelect.vue';
import type { PropDoc, EmitDoc } from '../../types';

const fruits = [
    { value: 'apple',      label: 'Manzana' },
    { value: 'banana',     label: 'Plátano' },
    { value: 'cherry',     label: 'Cereza' },
    { value: 'date',       label: 'Dátil' },
    { value: 'grape',      label: 'Uva' },
    { value: 'kiwi',       label: 'Kiwi' },
    { value: 'mango',      label: 'Mango' },
    { value: 'orange',     label: 'Naranja' },
    { value: 'pear',       label: 'Pera' },
    { value: 'strawberry', label: 'Fresa' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue   = ref<(string | number)[]>(['apple', 'banana']);
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgMaxChips = ref<2 | 4 | 99>(99);
const pgDisabled = ref(false);

function resetPlayground() {
    pgValue.value    = ['apple', 'banana'];
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgMaxChips.value = 99;
    pgDisabled.value = false;
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
    if (pgMaxChips.value !== 99)     parts.push(`:max-visible-chips="${pgMaxChips.value}"`);
    if (pgDisabled.value)            parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<MultiSelect\n    v-model="values"\n    :options="fruits"\n    label="Frutas"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Frutas"
    placeholder="Elige una o varias"
/>`;

const searchableCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Frutas"
    searchable
    show-select-all
/>`;

const maxChipsCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Compactado"
    :max-visible-chips="2"
/>`;

const maxSelectedCode = `<MultiSelect
    v-model="picks"
    :options="fruits"
    label="Hasta 3"
    :max-selected="3"
    helper-text="Máximo 3 opciones"
/>`;

const sizesCode = `<MultiSelect :options="fruits" size="small"  placeholder="Small" />
<MultiSelect :options="fruits" size="medium" placeholder="Medium" />
<MultiSelect :options="fruits" size="large"  placeholder="Large" />`;

const ex1 = ref<(string | number)[]>([]);
const ex2 = ref<(string | number)[]>(['apple', 'kiwi', 'mango']);
const ex3 = ref<(string | number)[]>(['apple', 'banana', 'cherry', 'date']);
const ex4 = ref<(string | number)[]>(['apple']);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',       type: '(string | number)[]',                                              default: '[]',     description: 'Array de valores seleccionados (v-model).' },
    { name: 'options',          type: 'SelectOption[]',                                                                       description: 'Lista de opciones disponibles.', required: true },
    { name: 'label',            type: 'string',                                                                               description: 'Etiqueta visible sobre el campo.' },
    { name: 'placeholder',      type: 'string',                                              default: "'Select…'",            description: 'Texto cuando no hay nada seleccionado.' },
    { name: 'helperText',       type: 'string',                                                                               description: 'Texto de ayuda bajo el campo.' },
    { name: 'errorText',        type: 'string',                                                                               description: 'Mensaje de error que reemplaza al helperText.' },
    { name: 'variant',          type: "'outline' | 'filled' | 'ghost'",                      default: "'outline'",            description: 'Estilo visual del trigger.' },
    { name: 'color',            type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'",       description: 'Color semántico del control y los chips.' },
    { name: 'size',             type: "'small' | 'medium' | 'large'",                        default: "'medium'",             description: 'Altura del trigger y tamaño de los chips.' },
    { name: 'radius',           type: "'none' | 'small' | 'medium' | 'large' | 'full'",      default: "'medium'",             description: 'Radio de esquinas del trigger y los chips.' },
    { name: 'clearable',        type: 'boolean',                                              default: 'false',                description: 'Muestra botón X para limpiar todas las selecciones.' },
    { name: 'searchable',       type: 'boolean',                                              default: 'false',                description: 'Activa el input de búsqueda en el panel.' },
    { name: 'showSelectAll',    type: 'boolean',                                              default: 'false',                description: 'Muestra un botón "Seleccionar todo" en el panel.' },
    { name: 'maxSelected',      type: 'number',                                                                               description: 'Máximo de opciones seleccionables.' },
    { name: 'maxVisibleChips',  type: 'number',                                                                               description: 'Cantidad de chips antes de colapsar a "+N".' },
    { name: 'disabled',         type: 'boolean',                                              default: 'false',                description: 'Deshabilita el control.' },
    { name: 'readonly',         type: 'boolean',                                              default: 'false',                description: 'Modo solo lectura — bloquea cambios.' },
    { name: 'required',         type: 'boolean',                                              default: 'false',                description: 'Marca el campo como requerido.' },
    { name: 'loading',          type: 'boolean',                                              default: 'false',                description: 'Muestra spinner en lugar del chevron.' },
    { name: 'fullWidth',        type: 'boolean',                                              default: 'false',                description: 'Aplica w-full al control raíz.' },
    { name: 'iconLeft',         type: 'Component',                                                                            description: 'Icono renderizado a la izquierda del trigger.' },
    { name: 'name',             type: 'string',                                                                               description: 'Genera inputs ocultos para envío en formularios.' },
    { name: 'ariaLabel',        type: 'string',                                                                               description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: '(string | number)[]', description: 'Emitido al cambiar el array de selecciones.' },
    { name: 'change',            payload: '(string | number)[]', description: 'Emitido tras cada cambio confirmado.' },
    { name: 'open',              payload: 'void',                description: 'Emitido cuando el panel se abre.' },
    { name: 'close',             payload: 'void',                description: 'Emitido cuando el panel se cierra.' },
];
</script>

<template>
    <ComponentDoc
        title="MultiSelect"
        category="Forms"
        import-path="import { MultiSelect } from 'mood-ui'"
        description="Selector múltiple con chips, búsqueda y selección masiva. Pensado para listas medianas donde el usuario marca varias opciones."
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

                    <!-- Max chips -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">CHIPS</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="m in [2, 4, 99] as const"
                                :key="m"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgMaxChips === m
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgMaxChips = m"
                            >{{ m === 99 ? 'all' : m }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <MultiSelect
                    v-model="pgValue"
                    :options="fruits"
                    label="Frutas"
                    :color="pgColor"
                    :size="pgSize"
                    :max-visible-chips="pgMaxChips === 99 ? undefined : pgMaxChips"
                    :disabled="pgDisabled"
                    class="w-72"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Selección múltiple con chips removibles."
                :code="basicCode"
            >
                <MultiSelect v-model="ex1" :options="fruits" label="Frutas" placeholder="Elige una o varias" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Buscable y seleccionar todo"
                description="Combina búsqueda con un toggle para marcar / desmarcar todo de una vez."
                :code="searchableCode"
            >
                <MultiSelect v-model="ex2" :options="fruits" label="Frutas" searchable show-select-all class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Chips compactados"
                description="Cuando hay muchas selecciones, max-visible-chips colapsa el resto en un +N."
                :code="maxChipsCode"
            >
                <MultiSelect v-model="ex3" :options="fruits" label="Compactado" :max-visible-chips="2" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Límite de selección"
                description="max-selected impide superar el número indicado de opciones."
                :code="maxSelectedCode"
            >
                <MultiSelect v-model="ex4" :options="fruits" label="Hasta 3" :max-selected="3" helper-text="Máximo 3 opciones" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños para distintos contextos de formulario."
                :code="sizesCode"
            >
                <MultiSelect :options="fruits" size="small"  placeholder="Small"  class="w-48" />
                <MultiSelect :options="fruits" size="medium" placeholder="Medium" class="w-48" />
                <MultiSelect :options="fruits" size="large"  placeholder="Large"  class="w-48" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
