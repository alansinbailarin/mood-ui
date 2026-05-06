<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import RangeSlider from '../../../components/forms/RangeSlider.vue';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue    = ref<[number, number]>([20, 70]);
const pgColor    = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize     = ref<'small' | 'medium' | 'large'>('medium');
const pgMarks    = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
    pgValue.value    = [20, 70];
    pgColor.value    = 'primary';
    pgSize.value     = 'medium';
    pgMarks.value    = false;
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
    if (pgMarks.value)               parts.push(':marks="true"');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<RangeSlider
    v-model="range"
    :min="0"
    :max="100"
    show-value${attrs}
/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<RangeSlider v-model="range" show-value label="Rango" />`;

const marksCode = `<RangeSlider
    v-model="range"
    :min="0"
    :max="100"
    :step="20"
    :marks="true"
    label="Edad"
    show-value
/>`;

const formattedCode = `<RangeSlider
    v-model="price"
    :min="0"
    :max="1000"
    :step="10"
    :format-value="(v) => '€' + v"
    show-value
    label="Precio"
/>`;

const colorCode = `<RangeSlider v-model="range" color="success" show-value label="Success" />
<RangeSlider v-model="range" color="warning" show-value label="Warning" />
<RangeSlider v-model="range" color="danger"  show-value label="Danger" />`;

const disabledCode = `<RangeSlider :model-value="[30, 70]" disabled show-value label="Disabled" />`;

const ex1 = ref<[number, number]>([20, 80]);
const ex2 = ref<[number, number]>([20, 80]);
const ex3 = ref<[number, number]>([100, 600]);
const ex4a = ref<[number, number]>([20, 70]);
const ex4b = ref<[number, number]>([20, 70]);
const ex4c = ref<[number, number]>([20, 70]);

const formatPrice = (v: number) => '€' + v;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'modelValue',  type: '[number, number]',                                                    description: 'Tupla [from, to] con los valores del rango (v-model).' },
    { name: 'min',         type: 'number',                                              default: '0',  description: 'Valor mínimo permitido.' },
    { name: 'max',         type: 'number',                                              default: '100',description: 'Valor máximo permitido.' },
    { name: 'step',        type: 'number',                                              default: '1',  description: 'Incremento entre valores.' },
    { name: 'minDistance', type: 'number',                                                              description: 'Distancia mínima entre los dos thumbs.' },
    { name: 'showValue',   type: 'boolean',                                             default: 'false', description: 'Muestra el rango actual junto al label.' },
    { name: 'formatValue', type: '(v: number) => string',                                              description: 'Función para formatear los valores mostrados.' },
    { name: 'marks',       type: 'boolean | number[] | { value, label? }[]',                           description: 'Marcas discretas a lo largo del track.' },
    { name: 'orientation', type: "'horizontal' | 'vertical'",                          default: "'horizontal'", description: 'Orientación del slider.' },
    { name: 'label',       type: 'string',                                                             description: 'Etiqueta visible sobre el control.' },
    { name: 'helperText',  type: 'string',                                                             description: 'Texto de ayuda bajo el control.' },
    { name: 'errorText',   type: 'string',                                                             description: 'Mensaje de error que reemplaza al helperText.' },
    { name: 'color',       type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico del segmento relleno y thumbs.' },
    { name: 'size',        type: "'small' | 'medium' | 'large'",                        default: "'medium'", description: 'Tamaño del track y de los thumbs.' },
    { name: 'radius',      type: "'none' | 'small' | 'medium' | 'large' | 'full'",      default: "'full'",   description: 'Radio del track.' },
    { name: 'fullWidth',   type: 'boolean',                                             default: 'false', description: 'Aplica w-full al wrapper.' },
    { name: 'disabled',    type: 'boolean',                                             default: 'false', description: 'Deshabilita el slider.' },
    { name: 'readonly',    type: 'boolean',                                             default: 'false', description: 'Bloquea cambios manteniendo los valores visibles.' },
    { name: 'required',    type: 'boolean',                                             default: 'false', description: 'Marca el campo como requerido.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: '[number, number]', description: 'Emitido al cambiar el rango (sincroniza v-model).' },
    { name: 'change',            payload: '[number, number]', description: 'Emitido cuando finaliza un drag/teclado.' },
];
</script>

<template>
    <ComponentDoc
        title="RangeSlider"
        category="Forms"
        import-path="import { RangeSlider } from 'mood-ui'"
        description="Slider con dos thumbs para seleccionar un rango numérico. Soporta marcas, formateo y los modos visuales habituales."
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
                        :class="pgMarks
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgMarks = !pgMarks"
                    >Marks</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDisabled
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDisabled = !pgDisabled"
                    >Disabled</button>
                </template>

                <RangeSlider
                    v-model="pgValue"
                    :min="0"
                    :max="100"
                    :color="pgColor"
                    :size="pgSize"
                    :marks="pgMarks"
                    :disabled="pgDisabled"
                    show-value
                    label="Rango"
                    class="w-72"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Selección de rango con dos thumbs y v-model como tupla."
                :code="basicCode"
            >
                <RangeSlider v-model="ex1" show-value label="Rango" class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Con marcas"
                description="Marcas a intervalos regulares para guiar la selección."
                :code="marksCode"
            >
                <RangeSlider v-model="ex2" :min="0" :max="100" :step="20" :marks="true" label="Edad" show-value class="w-72" />
            </ComponentPreview>

            <ComponentPreview
                title="Valores formateados"
                description="formatValue permite mostrar unidades, prefijos o cualquier formato custom."
                :code="formattedCode"
            >
                <RangeSlider
                    v-model="ex3"
                    :min="0"
                    :max="1000"
                    :step="10"
                    :format-value="formatPrice"
                    show-value
                    label="Precio"
                    class="w-72"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas alineadas con el resto del sistema."
                :code="colorCode"
            >
                <div class="flex flex-col gap-4">
                    <RangeSlider v-model="ex4a" color="success" show-value label="Success" class="w-72" />
                    <RangeSlider v-model="ex4b" color="warning" show-value label="Warning" class="w-72" />
                    <RangeSlider v-model="ex4c" color="danger"  show-value label="Danger"  class="w-72" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Disabled"
                description="Estado deshabilitado preservando los valores visibles."
                :code="disabledCode"
            >
                <RangeSlider :model-value="[30, 70]" disabled show-value label="Disabled" class="w-72" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
