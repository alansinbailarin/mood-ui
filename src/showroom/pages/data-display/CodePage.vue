<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Code from '../../../components/data-display/Code.vue';
import type { PropDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'subtle' | 'outline' | 'ghost'>('subtle');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('default');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgRadius  = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');

function resetPlayground() {
    pgVariant.value = 'subtle';
    pgColor.value = 'default';
    pgSize.value = 'medium';
    pgRadius.value = 'medium';
}

const colorDots = [
    { value: 'default'  as const, bg: 'var(--color-slate-400)',  label: 'Default'  },
    { value: 'primary'  as const, bg: 'var(--primary)',           label: 'Primary'  },
    { value: 'success'  as const, bg: 'var(--color-emerald-500)', label: 'Success'  },
    { value: 'warning'  as const, bg: 'var(--color-amber-500)',   label: 'Warning'  },
    { value: 'danger'   as const, bg: 'var(--color-red-500)',     label: 'Danger'   },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'subtle')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgRadius.value  !== 'medium')  parts.push(`radius="${pgRadius.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Code${attrs}>npm install mood-ui</Code>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode  = `<Code>npm install mood-ui</Code>`;
const variantsCode = `<Code variant="subtle">useLocale()</Code>
<Code variant="outline">useLocale()</Code>
<Code variant="ghost">useLocale()</Code>`;
const colorsCode = `<Code color="default">foo</Code>
<Code color="primary">primary</Code>
<Code color="success">success</Code>
<Code color="warning">warning</Code>
<Code color="danger">danger</Code>`;
const sizesCode  = `<Code size="small">v0.4.0</Code>
<Code size="medium">v0.4.0</Code>
<Code size="large">v0.4.0</Code>`;
const inlineCode = `<p>Llama a <Code color="primary">useLocale().set('es')</Code> para cambiar el idioma.</p>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'size',    type: "'small' | 'medium' | 'large'",                                    default: "'medium'", description: 'Tamaño del texto del fragmento.' },
    { name: 'variant', type: "'subtle' | 'outline' | 'ghost'",                                  default: "'subtle'", description: 'Estilo visual del fondo / borde.' },
    { name: 'color',   type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",        default: "'default'", description: 'Color semántico aplicado al fragmento.' },
    { name: 'radius',  type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                       description: 'Radio de borde. Hereda del ModoProvider si se omite.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido del fragmento de código (texto plano o expresión corta).' },
];
</script>

<template>
    <ComponentDoc
        title="Code"
        category="Data Display"
        import-path="import { Code } from 'mood-ui'"
        description="Fragmentos de código inline para resaltar valores, props o errores en docs y mensajes."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="160px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Variant" :options="[{value:'subtle'},{value:'outline'},{value:'ghost'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Size" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills label="Radius" :options="[{value:'none'},{value:'small'},{value:'medium'},{value:'large'},{value:'full'}]" v-model="pgRadius" />
                </template>

                <Code :variant="pgVariant" :color="pgColor" :size="pgSize" :radius="pgRadius">npm install mood-ui</Code>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Fragmento de código inline con estilos por defecto."
                :code="basicCode"
            >
                <Code>npm install mood-ui</Code>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes"
                description="subtle (relleno), outline (borde) y ghost (transparente)."
                :code="variantsCode"
            >
                <Code variant="subtle">useLocale()</Code>
                <Code variant="outline">useLocale()</Code>
                <Code variant="ghost">useLocale()</Code>
            </ComponentPreview>

            <ComponentPreview
                title="Colores semánticos"
                description="Cinco colores para diferenciar valores, errores o estados."
                :code="colorsCode"
            >
                <Code color="default">foo</Code>
                <Code color="primary">primary</Code>
                <Code color="success">success</Code>
                <Code color="warning">warning</Code>
                <Code color="danger">danger</Code>
            </ComponentPreview>

            <ComponentPreview
                title="Tamaños"
                description="Tres escalas que se alinean con el texto que las rodea."
                :code="sizesCode"
            >
                <Code size="small">v0.4.0</Code>
                <Code size="medium">v0.4.0</Code>
                <Code size="large">v0.4.0</Code>
            </ComponentPreview>

            <ComponentPreview
                title="Inline en texto"
                description="Se alinea verticalmente y conserva la línea de base."
                :code="inlineCode"
            >
                <p class="text-sm">
                    Llama a <Code color="primary">useLocale().set('es')</Code> para cambiar el idioma.
                </p>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
