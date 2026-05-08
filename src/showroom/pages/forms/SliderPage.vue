<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Slider from '../../../components/forms/Slider.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref(50);
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgStep     = ref('1');
const pgMarks    = ref(false);
const pgDisabled = ref(false);
const pgReadonly = ref(false);

function resetPlayground() {
    pgValue.value    = 50;
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgStep.value     = '1';
    pgMarks.value    = false;
    pgDisabled.value = false;
    pgReadonly.value = false;
}

const colorDots = [
    { value: 'default' as const, bg: 'var(--color-slate-400)',   label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)',            label: 'Primary' },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgStep.value  !== '1')       parts.push(`:step="${pgStep.value}"`);
    if (pgMarks.value)               parts.push(':marks="true"');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    if (pgReadonly.value)            parts.push(':readonly="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<Slider
    v-model="value"
    :min="0"
    :max="100"
    show-value${attrs}
/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Slider v-model="volume" show-value label="Volumen" />`;

const marksCode = `<Slider
    v-model="value"
    :min="0"
    :max="100"
    :step="25"
    :marks="true"
    label="Calidad"
    show-value
/>`;

const stepCode = `<Slider v-model="value" :min="0" :max="50" :step="5" show-value label="Step de 5" />`;

const colorCode = `<Slider v-model="value" color="success" show-value label="Success" />
<Slider v-model="value" color="warning" show-value label="Warning" />
<Slider v-model="value" color="danger"  show-value label="Danger" />`;

const disabledCode = `<Slider :model-value="40" disabled show-value label="Disabled" />`;

const ex1 = ref(35);
const ex2 = ref(50);
const ex3 = ref(20);
const ex4a = ref(60);
const ex4b = ref(60);
const ex4c = ref(60);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: 'number',                                                             description: 'Valor actual del slider (v-model).' },
    { name: 'min',         type: 'number',                                              default: '0',  description: 'Valor mínimo permitido.' },
    { name: 'max',         type: 'number',                                              default: '100',description: 'Valor máximo permitido.' },
    { name: 'step',        type: 'number',                                              default: '1',  description: 'Incremento entre valores.' },
    { name: 'showValue',   type: 'boolean',                                             default: 'false', description: 'Muestra el valor numérico junto al label.' },
    { name: 'formatValue', type: '(v: number) => string',                                              description: 'Función para formatear el valor mostrado.' },
    { name: 'marks',       type: 'boolean | number[] | { value, label? }[]',                           description: 'Marcas discretas. true = una por step.' },
    { name: 'orientation', type: "'horizontal' | 'vertical'",                          default: "'horizontal'", description: 'Orientación del slider.' },
    { name: 'label',       type: 'string',                                                             description: 'Etiqueta visible sobre el control.' },
    { name: 'helperText',  type: 'string',                                                             description: 'Texto de ayuda bajo el control.' },
    { name: 'errorText',   type: 'string',                                                             description: 'Mensaje de error que reemplaza al helperText.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico del relleno y thumb.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                        default: "'medium'", description: 'Tamaño del track y del thumb.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",      default: "'full'",   description: 'Radio del track.' },
    { name: 'fullWidth',   type: 'boolean',                                             default: 'false', description: 'Aplica w-full al wrapper.' },
    { name: 'disabled',    type: 'boolean',                                             default: 'false', description: 'Deshabilita el slider.' },
    { name: 'readonly',    type: 'boolean',                                             default: 'false', description: 'Bloquea cambios manteniendo el valor visible.' },
    { name: 'required',    type: 'boolean',                                             default: 'false', description: 'Marca el campo como requerido.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'number', description: 'Emitido al cambiar el valor (sincroniza v-model).' },
    { name: 'change',            payload: 'number', description: 'Emitido cuando finaliza un drag/teclado.' },
];
</script>

<template>
    <ComponentDoc
        title="Slider"
        category="Forms"
        import-path="import { Slider } from 'mood-ui'"
        description="Slider numérico de un único valor con soporte de marcas, formateo, label y todas las variantes habituales."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills label="Step" :options="[{value:'1'},{value:'5'},{value:'10'}]" v-model="pgStep" />
                    <TbSep />
                    <TbToggle label="Marks" v-model="pgMarks" />
                    <TbToggle label="Disabled" v-model="pgDisabled" />
                    <TbToggle label="Readonly" v-model="pgReadonly" />
                </template>

                <Slider
                    v-model="pgValue"
                    :min="0"
                    :max="100"
                    :step="Number(pgStep)"
                    :color="pgColor"
                    :size="pgSize"
                    :marks="pgMarks"
                    :disabled="pgDisabled"
                    :readonly="pgReadonly"
                    show-value
                    label="Valor"
                    class="w-72"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Slider con valor visible y label."
                :code="basicCode"
            >
                <Slider v-model="ex1" show-value label="Volumen" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Con marcas"
                description="Activa marks para mostrar puntos de referencia a lo largo del track."
                :code="marksCode"
            >
                <Slider v-model="ex2" :min="0" :max="100" :step="25" :marks="true" label="Calidad" show-value class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Step personalizado"
                description="Controla la granularidad del slider con la prop step."
                :code="stepCode"
            >
                <Slider v-model="ex3" :min="0" :max="50" :step="5" show-value label="Step de 5" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas para distintos contextos."
                :code="colorCode"
            >
                <div class="flex flex-col gap-4">
                    <Slider v-model="ex4a" color="success" show-value label="Success" class="w-72" />
                    <Slider v-model="ex4b" color="warning" show-value label="Warning" class="w-72" />
                    <Slider v-model="ex4c" color="danger"  show-value label="Danger"  class="w-72" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor visible."
                :code="disabledCode"
            >
                <Slider :model-value="40" disabled show-value label="Disabled" class="w-72" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
