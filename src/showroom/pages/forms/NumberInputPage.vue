<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import NumberInput from '../../../components/forms/NumberInput.vue';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue           = ref<number | null>(10);
const pgVariant         = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor           = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize            = ref<'small' | 'medium' | 'large'>('medium');
const pgSteppers        = ref(true);
const pgStepperPosition = ref<'right' | 'split'>('right');
const pgDisabled        = ref(false);

function resetPlayground() {
    pgValue.value           = 10;
    pgVariant.value         = 'outline';
    pgColor.value           = 'primary';
    pgSize.value            = 'medium';
    pgSteppers.value        = true;
    pgStepperPosition.value = 'right';
    pgDisabled.value        = false;
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
    if (pgVariant.value         !== 'outline') parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value           !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value            !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (!pgSteppers.value)                     parts.push(':steppers="false"');
    if (pgStepperPosition.value !== 'right')   parts.push(`stepper-position="${pgStepperPosition.value}"`);
    if (pgDisabled.value)                      parts.push(':disabled="true"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<NumberInput v-model="quantity" label="Cantidad"${attrs} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<NumberInput v-model="quantity" label="Cantidad" />`;

const minMaxCode = `<NumberInput v-model="qty" label="Unidades" :min="0" :max="10" :step="1" />`;

const priceCode = `<NumberInput
    v-model="price"
    label="Precio"
    prefix="$"
    suffix="USD"
    :precision="2"
    :step="0.01"
    thousand-separator
/>`;

const splitCode = `<NumberInput v-model="qty" stepper-position="split" />`;

const disabledCode = `<NumberInput :model-value="42" disabled label="Cantidad" />`;

// Example state
const exBasic = ref<number | null>(0);
const exQty   = ref<number | null>(1);
const exPrice = ref<number | null>(1299.99);
const exSplit = ref<number | null>(5);

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',        type: 'number | null',                                            description: 'Valor numérico (v-model). null cuando el input está vacío.' },
    { name: 'label',             type: 'string',                                                   description: 'Etiqueta visible encima del input.' },
    { name: 'placeholder',       type: 'string',                                                   description: 'Placeholder cuando está vacío.' },
    { name: 'helperText',        type: 'string',                                                   description: 'Texto de ayuda. Oculto si hay errorText.' },
    { name: 'errorText',         type: 'string',                                                   description: 'Mensaje de error que marca el input como inválido.' },
    { name: 'variant',           type: "'outline' | 'filled' | 'ghost'",                           default: "'outline'", description: 'Estilo visual.' },
    { name: 'color',             type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico aplicado al estado de foco.' },
    { name: 'size',              type: "'small' | 'medium' | 'large'",                             default: "'medium'",  description: 'Tamaño visual.' },
    { name: 'radius',            type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                  description: 'Radio de las esquinas. Hereda del ModoProvider si se omite.' },
    { name: 'halo',              type: "'tinted' | 'neutral' | 'off'",                                                    description: 'Estilo del halo persistente (ring).' },
    { name: 'fullWidth',         type: 'boolean',                                                  default: 'false',     description: 'Aplica w-full al root.' },
    { name: 'disabled',          type: 'boolean',                                                  default: 'false',     description: 'Deshabilita el input.' },
    { name: 'readonly',          type: 'boolean',                                                  default: 'false',     description: 'Solo lectura: oculta steppers y bloquea edición.' },
    { name: 'required',          type: 'boolean',                                                  default: 'false',     description: 'Marca el campo como requerido.' },
    { name: 'loading',           type: 'boolean',                                                  default: 'false',     description: 'Estado de carga.' },
    { name: 'min',               type: 'number',                                                                         description: 'Valor mínimo permitido.' },
    { name: 'max',               type: 'number',                                                                         description: 'Valor máximo permitido.' },
    { name: 'step',              type: 'number',                                                   default: '1',         description: 'Incremento de los steppers y flechas de teclado.' },
    { name: 'precision',         type: 'number',                                                                         description: 'Decimales forzados al formatear el display tras el blur.' },
    { name: 'steppers',          type: 'boolean',                                                  default: 'true',      description: 'Muestra los botones +/− para incrementar/decrementar.' },
    { name: 'stepperPosition',   type: "'right' | 'split'",                                        default: "'right'",   description: "Posición de los steppers: apilados a la derecha o separados (− izquierda, + derecha)." },
    { name: 'allowInvalid',      type: 'boolean',                                                  default: 'false',     description: 'Permite valores fuera de min/max mientras se escribe; clampea al blur.' },
    { name: 'thousandSeparator', type: 'boolean',                                                  default: 'false',     description: 'Formatea el display con separador de miles tras el blur.' },
    { name: 'prefix',            type: 'string',                                                                         description: 'Texto fijo a la izquierda (ej. "$").' },
    { name: 'suffix',            type: 'string',                                                                         description: 'Texto fijo a la derecha (ej. "%", "kg").' },
    { name: 'iconLeft',          type: 'Component',                                                                      description: 'Icono renderizado a la izquierda del input.' },
    { name: 'name',              type: 'string',                                                                         description: 'Atributo name HTML.' },
    { name: 'id',                type: 'string',                                                                         description: 'id del input. Se autogenera si se omite.' },
    { name: 'autocomplete',      type: 'string',                                                                         description: 'Atributo autocomplete HTML.' },
    { name: 'autofocus',         type: 'boolean',                                                  default: 'false',     description: 'Foco automático al montar.' },
    { name: 'ariaLabel',         type: 'string',                                                                         description: 'Nombre accesible cuando no hay label visible.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'number | null', description: 'Emitido en cada cambio del valor (sincroniza v-model).' },
    { name: 'change',            payload: 'number | null', description: 'Emitido tras un cambio confirmado por el usuario.' },
    { name: 'focus',             payload: 'FocusEvent',    description: 'Emitido cuando el input recibe foco.' },
    { name: 'blur',              payload: 'FocusEvent',    description: 'Emitido cuando el input pierde foco.' },
];
</script>

<template>
    <ComponentDoc
        title="NumberInput"
        category="Forms"
        import-path="import { NumberInput } from 'mood-ui'"
        description="Input numérico con steppers, min/max, precisión decimal, separador de miles y prefijo/sufijo."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Variant" :options="[{value:'outline'},{value:'filled'},{value:'ghost'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills label="Steppers" :options="[{value:'right'},{value:'split'}]" v-model="pgStepperPosition" />
                    <TbSep />
                    <TbToggle label="Steppers" v-model="pgSteppers" />
                    <TbToggle label="Disabled" v-model="pgDisabled" />
                </template>

                <NumberInput
                    v-model="pgValue"
                    label="Cantidad"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    :steppers="pgSteppers"
                    :stepper-position="pgStepperPosition"
                    :disabled="pgDisabled"
                    style="width: 220px"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Input numérico con steppers a la derecha (default)."
                :code="basicCode"
            >
                <NumberInput v-model="exBasic" label="Cantidad" style="width: 220px" />
            </ComponentPreview>

            <ComponentPreview
                title="Min / max + step"
                description="Limita el rango del valor y el incremento de los steppers."
                :code="minMaxCode"
            >
                <NumberInput v-model="exQty" label="Unidades" :min="0" :max="10" :step="1" style="width: 220px" />
            </ComponentPreview>

            <ComponentPreview
                title="Precio con prefix y separador"
                description="Combina precision, step decimal, prefix/suffix y formato con separador de miles."
                :code="priceCode"
            >
                <NumberInput
                    v-model="exPrice"
                    label="Precio"
                    prefix="$"
                    suffix="USD"
                    :precision="2"
                    :step="0.01"
                    thousand-separator
                    style="width: 240px"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Stepper split"
                description="− a la izquierda y + a la derecha del input."
                :code="splitCode"
            >
                <NumberInput v-model="exSplit" stepper-position="split" style="width: 220px" />
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando el valor."
                :code="disabledCode"
            >
                <NumberInput :model-value="42" disabled label="Cantidad" style="width: 220px" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
