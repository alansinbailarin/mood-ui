<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Segmented from '../../../components/forms/Segmented.vue';
import {
    ListBulletIcon,
    Squares2X2Icon,
    TableCellsIcon,
} from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc } from '../../types';
import TbPills  from '../../components/toolbar/TbPills.vue';
import TbDots   from '../../components/toolbar/TbDots.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep    from '../../components/toolbar/TbSep.vue';

const viewItems = [
    { value: 'list', label: 'Lista' },
    { value: 'grid', label: 'Cuadrícula' },
    { value: 'table', label: 'Tabla' },
];

const iconItems = [
    { value: 'list',  label: 'Lista',     icon: ListBulletIcon },
    { value: 'grid',  label: 'Cuadrícula', icon: Squares2X2Icon },
    { value: 'table', label: 'Tabla',     icon: TableCellsIcon },
];

const periodItems = [
    { value: 'd', label: 'Día' },
    { value: 'w', label: 'Semana' },
    { value: 'm', label: 'Mes' },
    { value: 'y', label: 'Año' },
];

// ── Overview playground state ─────────────────────────────────────────────────
const pgValue     = ref<string | number>('grid');
const pgColor     = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');
const pgFullWidth = ref(false);
const pgDisabled  = ref(false);

function resetPlayground() {
    pgValue.value     = 'grid';
    pgColor.value     = 'primary';
    pgSize.value      = 'medium';
    pgFullWidth.value = false;
    pgDisabled.value  = false;
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
    if (pgColor.value !== 'primary') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value  !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgFullWidth.value)           parts.push('full-width');
    if (pgDisabled.value)            parts.push(':disabled="true"');
    const attrs = parts.length ? '\n    ' + parts.join('\n    ') : '';
    return `<Segmented\n    v-model="view"\n    :items="items"${attrs}\n/>`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `const items = [
    { value: 'list',  label: 'Lista' },
    { value: 'grid',  label: 'Cuadrícula' },
    { value: 'table', label: 'Tabla' },
];

<Segmented v-model="view" :items="items" />`;

const iconsCode = `const items = [
    { value: 'list',  label: 'Lista',     icon: ListBulletIcon },
    { value: 'grid',  label: 'Cuadrícula', icon: Squares2X2Icon },
    { value: 'table', label: 'Tabla',     icon: TableCellsIcon },
];

<Segmented v-model="view" :items="items" />`;

const colorsCode = `<Segmented v-model="v" :items="items" color="primary" />
<Segmented v-model="v" :items="items" color="success" />
<Segmented v-model="v" :items="items" color="warning" />
<Segmented v-model="v" :items="items" color="danger" />`;

const sizesCode = `<Segmented v-model="v" :items="items" size="small"  />
<Segmented v-model="v" :items="items" size="medium" />
<Segmented v-model="v" :items="items" size="large"  />`;

const fullWidthCode = `<Segmented v-model="period" :items="periodItems" full-width />`;

const ex1 = ref<string | number>('list');
const ex2 = ref<string | number>('grid');
const ex3 = ref<string | number>('grid');
const ex4 = ref<string | number>('grid');
const ex5 = ref<string | number>('w');

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'items',      type: 'SegmentedItem[]',                                                                       description: 'Lista de segmentos { value, label?, icon?, disabled?, ariaLabel? }.', required: true },
    { name: 'modelValue', type: 'string | number | null',                                                                description: 'Valor seleccionado (v-model).' },
    { name: 'color',      type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'primary'",        description: 'Color semántico aplicado al segmento activo.' },
    { name: 'size',       type: "'small' | 'medium' | 'large'",                              default: "'medium'",        description: 'Altura y tipografía de los segmentos.' },
    { name: 'radius',     type: "'none' | 'small' | 'medium' | 'large' | 'full'",            default: "'medium'",        description: 'Radio de las esquinas del track y los segmentos.' },
    { name: 'fullWidth',  type: 'boolean',                                                    default: 'false',          description: 'Estira el control para ocupar todo el contenedor; los segmentos se reparten el ancho.' },
    { name: 'disabled',   type: 'boolean',                                                    default: 'false',          description: 'Deshabilita el control completo.' },
    { name: 'ariaLabel',  type: 'string',                                                                                description: 'Nombre accesible para el radiogroup.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string | number', description: 'Emitido al cambiar el segmento activo (sincroniza v-model).' },
    { name: 'change',            payload: 'string | number', description: 'Emitido tras cada selección confirmada por el usuario.' },
];
</script>

<template>
    <ComponentDoc
        title="Segmented"
        category="Forms"
        import-path="import { Segmented } from 'mood-ui'"
        description="Selector de un único valor en formato pill group, con indicador deslizante. Ideal para alternar vistas o filtros breves."
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
                    <TbToggle label="Full width" v-model="pgFullWidth" />
                    <TbToggle label="Disabled" v-model="pgDisabled" />
                </template>

                <div :class="pgFullWidth ? 'w-96' : ''">
                    <Segmented
                        v-model="pgValue"
                        :items="viewItems"
                        :color="pgColor"
                        :size="pgSize"
                        :full-width="pgFullWidth"
                        :disabled="pgDisabled"
                    />
                </div>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Uso básico"
                description="Tres segmentos sólo con label."
                :code="basicCode"
            >
                <Segmented v-model="ex1" :items="viewItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos"
                description="Cada segmento puede tener un icono opcional a la izquierda del label."
                :code="iconsCode"
            >
                <Segmented v-model="ex2" :items="iconItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Variantes semánticas aplicadas al texto e indicador del segmento activo."
                :code="colorsCode"
            >
                <div class="flex flex-col gap-3">
                    <Segmented v-model="ex3" :items="viewItems" color="primary" />
                    <Segmented v-model="ex3" :items="viewItems" color="success" />
                    <Segmented v-model="ex3" :items="viewItems" color="warning" />
                    <Segmented v-model="ex3" :items="viewItems" color="danger" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres alturas para distintas densidades."
                :code="sizesCode"
            >
                <div class="flex flex-col gap-3">
                    <Segmented v-model="ex4" :items="viewItems" size="small"  />
                    <Segmented v-model="ex4" :items="viewItems" size="medium" />
                    <Segmented v-model="ex4" :items="viewItems" size="large"  />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Full width"
                description="Con full-width el track ocupa el contenedor y los segmentos se reparten el ancho."
                :code="fullWidthCode"
            >
                <div class="w-80">
                    <Segmented v-model="ex5" :items="periodItems" full-width />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
