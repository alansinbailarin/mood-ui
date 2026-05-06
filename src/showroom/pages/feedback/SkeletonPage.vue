<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Skeleton from '../../../components/feedback/Skeleton.vue';
import Card from '../../../components/data-display/Card.vue';
import type { PropDoc, SlotDoc } from '../../types';

type Shape = 'text' | 'circle' | 'rect';
type Size  = 'small' | 'medium' | 'large';

const pgShape = ref<Shape>('rect');
const pgSize  = ref<Size>('medium');

function resetPlayground() {
    pgShape.value = 'rect';
    pgSize.value  = 'medium';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgShape.value !== 'rect')   parts.push(`shape="${pgShape.value}"`);
    if (pgSize.value  !== 'medium') parts.push(`size="${pgSize.value}"`);
    parts.push(':width="160"');
    if (pgShape.value === 'circle') parts.push(':height="48"');
    return `<Skeleton ${parts.join(' ')} />`;
});

const textCode = `<div class="w-80">
  <Skeleton shape="text" :lines="4" />
</div>`;

const profileCode = `<div class="flex items-center gap-3">
  <Skeleton shape="circle" :width="40" :height="40" />
  <div class="flex flex-col gap-2">
    <Skeleton shape="text" :width="160" />
    <Skeleton shape="text" :width="100" />
  </div>
</div>`;

const cardCode = `<Card variant="outlined" padding="medium" class="w-72">
  <Skeleton shape="rect" :height="120" full-width />
  <div class="flex flex-col gap-2 mt-3">
    <Skeleton shape="text" :width="180" />
    <Skeleton shape="text" :lines="2" />
  </div>
</Card>`;

const buttonCode = `<Skeleton shape="button" size="small" :width="96" />
<Skeleton shape="button" size="medium" :width="120" />
<Skeleton shape="button" size="large" :width="144" />`;

const propsList: PropDoc[] = [
    { name: 'shape',     type: "'text' | 'title' | 'rect' | 'circle' | 'avatar' | 'button' | 'input' | 'card' | …", default: "'rect'", description: 'Preset visual que define alto, ancho y radius por defecto. Mira la interface para todos los presets disponibles.' },
    { name: 'size',      type: "'small' | 'medium' | 'large'",                       default: "'medium'", description: 'Mapea al size del componente real para mantener pixel-parity.' },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",                          description: 'Radio de las esquinas. circle / avatar siempre fuerzan full.' },
    { name: 'width',     type: 'string | number',                                                          description: 'Ancho explícito. Acepta cualquier longitud CSS.' },
    { name: 'height',    type: 'string | number',                                                          description: 'Alto explícito.' },
    { name: 'fullWidth', type: 'boolean',                                            default: 'false',     description: 'Hace que width colapse a 100% del contenedor.' },
    { name: 'withLabel', type: 'boolean',                                            default: 'false',     description: 'Renderiza una mini-barra de label encima de la forma.' },
    { name: 'lines',     type: 'number',                                             default: '1',         description: 'Para shape="text": número de líneas apiladas.' },
    { name: 'animation', type: "'shimmer' | 'pulse' | 'none'",                       default: "'shimmer'", description: 'Animación de carga.' },
    { name: 'ariaLabel', type: 'string',                                                                   description: 'Etiqueta accesible (anuncia qué se está cargando).' },
];

const slotsList: SlotDoc[] = [];
</script>

<template>
    <ComponentDoc
        title="Skeleton"
        category="Feedback"
        import-path="import { Skeleton } from 'mood-ui'"
        description="Placeholder animado que reserva el espacio del contenido mientras carga. Soporta presets que replican el footprint exacto de los componentes reales para evitar layout shifts."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Forma</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in (['text', 'circle', 'rect'] as Shape[])"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgShape === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgShape = s"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in (['small', 'medium', 'large'] as Size[])"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = s"
                            >{{ s }}</button>
                        </div>
                    </div>
                </template>

                <Skeleton
                    :shape="pgShape"
                    :size="pgSize"
                    :width="160"
                    :height="pgShape === 'circle' ? 48 : undefined"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Texto multi-línea"
                description="Usa shape='text' con lines para simular un párrafo. La última línea se acorta automáticamente."
                :code="textCode"
                min-height="180px"
            >
                <div class="w-80">
                    <Skeleton shape="text" :lines="4" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Avatar + texto"
                description="Composición típica para listas de usuarios: círculo + dos líneas apiladas."
                :code="profileCode"
                min-height="180px"
            >
                <div class="flex items-center gap-3">
                    <Skeleton shape="circle" :width="40" :height="40" />
                    <div class="flex flex-col gap-2">
                        <Skeleton shape="text" :width="160" />
                        <Skeleton shape="text" :width="100" />
                    </div>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Card placeholder"
                description="Reserva el footprint de una tarjeta con imagen, título y descripción."
                :code="cardCode"
                min-height="280px"
            >
                <Card variant="outlined" padding="medium" class="w-72">
                    <Skeleton shape="rect" :height="120" full-width />
                    <div class="flex flex-col gap-2 mt-3">
                        <Skeleton shape="text" :width="180" />
                        <Skeleton shape="text" :lines="2" />
                    </div>
                </Card>
            </ComponentPreview>

            <ComponentPreview
                title="Button skeleton"
                description="El preset button respeta el alto por size para hacer match con el botón real."
                :code="buttonCode"
                min-height="180px"
            >
                <Skeleton shape="button" size="small"  :width="96" />
                <Skeleton shape="button" size="medium" :width="120" />
                <Skeleton shape="button" size="large"  :width="144" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
