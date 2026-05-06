<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Radio from '../../../components/forms/Radio.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref<string>('a');
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgDisabled = ref(false);

function resetPlayground() {
    pgValue.value    = 'a';
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
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
    if (pgDisabled.value)            parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Radio v-model="choice" value="a" label="Opción A"${attrs} />
<Radio v-model="choice" value="b" label="Opción B"${attrs} />
<Radio v-model="choice" value="c" label="Opción C"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Radio v-model="choice" value="a" label="Opción A" />
<Radio v-model="choice" value="b" label="Opción B" />
<Radio v-model="choice" value="c" label="Opción C" />`;

const descriptionCode = `<Radio
    v-model="plan"
    value="free"
    label="Free"
    description="Para uso personal con funciones básicas."
/>
<Radio
    v-model="plan"
    value="pro"
    label="Pro"
    description="Para equipos pequeños con funciones avanzadas."
/>`;

const colorsCode = `<Radio :model-value="'x'" value="x" color="primary" label="primary" />
<Radio :model-value="'x'" value="x" color="success" label="success" />
<Radio :model-value="'x'" value="x" color="warning" label="warning" />
<Radio :model-value="'x'" value="x" color="danger"  label="danger" />`;

const sizesCode = `<Radio :model-value="'x'" value="x" size="small"  label="small" />
<Radio :model-value="'x'" value="x" size="medium" label="medium" />
<Radio :model-value="'x'" value="x" size="large"  label="large" />`;

const disabledCode = `<Radio model-value="x" value="x" label="Seleccionado disabled" disabled />
<Radio model-value="x" value="y" label="No seleccionado disabled" disabled />`;

// Example state
const choice = ref('a');
const plan   = ref('pro');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'string | number | null',                                                                  description: 'Valor seleccionado del grupo (v-model). Se compara contra value para determinar checked.' },
    { name: 'value',       type: 'string | number',                                                                          description: 'Valor que emite este radio cuando se selecciona.', required: true },
    { name: 'label',       type: 'string',                                                                                   description: 'Etiqueta visible a la derecha del control.' },
    { name: 'description', type: 'string',                                                                                   description: 'Texto descriptivo secundario bajo el label.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",            default: "'default'", description: 'Color semántico aplicado en estado checked.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                                        default: "'medium'",  description: 'Tamaño del control y del label.' },
    { name: 'disabled',    type: 'boolean',                                                             default: 'false',     description: 'Deshabilita el radio e impide la interacción.' },
    { name: 'required',    type: 'boolean',                                                             default: 'false',     description: 'Marca el campo como requerido.' },
    { name: 'loading',     type: 'boolean',                                                             default: 'false',     description: 'Estado de carga durante operaciones asíncronas.' },
    { name: 'name',        type: 'string',                                                                                   description: 'Atributo name HTML. Se hereda automáticamente si está dentro de un RadioGroup.' },
    { name: 'id',          type: 'string',                                                                                   description: 'id del input. Se autogenera si se omite.' },
    { name: 'ariaLabel',   type: 'string',                                                                                   description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string | number', description: 'Emitido al seleccionar este radio (sincroniza v-model con su value).' },
    { name: 'change',            payload: 'string | number', description: 'Emitido tras cada selección confirmada por el usuario.' },
];
</script>

<template>
    <ComponentDoc
        title="Radio"
        category="Forms"
        import-path="import { Radio } from 'mood-ui'"
        description="Botón radio individual. Para grupos prefiere RadioGroup, que gestiona el roving tabindex y comparte name automáticamente."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
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
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <div class="flex flex-col gap-2">
                    <Radio v-model="pgValue" value="a" label="Opción A" :color="pgColor" :size="pgSize" :disabled="pgDisabled" />
                    <Radio v-model="pgValue" value="b" label="Opción B" :color="pgColor" :size="pgSize" :disabled="pgDisabled" />
                    <Radio v-model="pgValue" value="c" label="Opción C" :color="pgColor" :size="pgSize" :disabled="pgDisabled" />
                </div>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Tres radios compartiendo el mismo v-model. Solo uno puede estar seleccionado a la vez."
                :code="basicCode"
            >
                <div class="flex flex-col gap-2">
                    <Radio v-model="choice" value="a" label="Opción A" />
                    <Radio v-model="choice" value="b" label="Opción B" />
                    <Radio v-model="choice" value="c" label="Opción C" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con descripción"
                description="Texto secundario para añadir contexto a cada opción."
                :code="descriptionCode"
            >
                <div class="flex flex-col gap-3">
                    <Radio v-model="plan" value="free" label="Free" description="Para uso personal con funciones básicas." />
                    <Radio v-model="plan" value="pro"  label="Pro"  description="Para equipos pequeños con funciones avanzadas." />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas para el estado checked."
                :code="colorsCode"
            >
                <Radio :model-value="'x'" value="x" color="primary" label="primary" />
                <Radio :model-value="'x'" value="x" color="success" label="success" />
                <Radio :model-value="'x'" value="x" color="warning" label="warning" />
                <Radio :model-value="'x'" value="x" color="danger"  label="danger" />
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres tamaños para adaptarse a la densidad del formulario."
                :code="sizesCode"
            >
                <Radio :model-value="'x'" value="x" size="small"  label="small" />
                <Radio :model-value="'x'" value="x" size="medium" label="medium" />
                <Radio :model-value="'x'" value="x" size="large"  label="large" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor visual."
                :code="disabledCode"
            >
                <Radio model-value="x" value="x" label="Seleccionado disabled" disabled />
                <Radio model-value="x" value="y" label="No seleccionado disabled" disabled />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
