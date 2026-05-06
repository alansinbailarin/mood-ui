<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Canvas from '../../../components/layout/Canvas.vue';
import type { PropDoc, SlotDoc } from '../../types';

const pgPattern = ref<'dots' | 'grid' | 'lines' | 'none'>('dots');
const pgIntensity = ref<'subtle' | 'normal' | 'strong'>('subtle');
const pgBordered = ref(false);

function resetPlayground() {
    pgPattern.value = 'dots';
    pgIntensity.value = 'subtle';
    pgBordered.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgPattern.value !== 'dots') parts.push(`pattern="${pgPattern.value}"`);
    if (pgIntensity.value !== 'subtle') parts.push(`intensity="${pgIntensity.value}"`);
    if (pgBordered.value) parts.push('bordered');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Canvas${attrs} class="h-48" />`;
});

const patternsCode = `<Canvas pattern="dots"  class="h-32" />
<Canvas pattern="grid"  class="h-32" />
<Canvas pattern="lines" class="h-32" />`;

const intensityCode = `<Canvas pattern="dots" intensity="subtle" class="h-24" />
<Canvas pattern="dots" intensity="normal" class="h-24" />
<Canvas pattern="dots" intensity="strong" class="h-24" />`;

const borderedCode = `<Canvas pattern="grid" :cell-size="24" bordered class="h-32" />`;

const propsList: PropDoc[] = [
    { name: 'pattern',   type: "'dots' | 'grid' | 'lines' | 'none'",                   default: "'dots'",   description: 'Patrón visual del fondo.' },
    { name: 'cellSize',  type: 'number',                                                default: '16',       description: 'Tamaño de la celda del patrón en píxeles.' },
    { name: 'intensity', type: "'subtle' | 'normal' | 'strong'",                       default: "'subtle'", description: 'Intensidad alfa del patrón.' },
    { name: 'surface',   type: "'card' | 'background' | 'muted'",                      default: "'card'",   description: 'Token de superficie del fondo base.' },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",       default: 'provider', description: 'Radio de las esquinas. Hereda del ModoProvider.' },
    { name: 'bordered',  type: 'boolean',                                                default: 'false',   description: 'Añade un borde de 1px usando el token border.' },
    { name: 'as',        type: 'string',                                                 default: "'div'",   description: 'Etiqueta raíz a renderizar.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido renderizado encima del patrón.' },
];
</script>

<template>
    <ComponentDoc
        title="Canvas"
        category="Layout"
        import-path="import { Canvas } from 'mood-ui'"
        description="Superficie con patrón decorativo (puntos, grid o líneas). Útil para áreas de trabajo, drop zones o hero sections que insinúan un workspace."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="280px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Pattern</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="p in ['dots','grid','lines','none']"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgPattern === p ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgPattern = (p as typeof pgPattern)"
                            >{{ p }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Intensity</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="i in ['subtle','normal','strong']"
                                :key="i"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgIntensity === i ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgIntensity = (i as typeof pgIntensity)"
                            >{{ i }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgBordered
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgBordered = !pgBordered"
                    >Bordered</button>
                </template>

                <Canvas
                    :pattern="pgPattern"
                    :intensity="pgIntensity"
                    :bordered="pgBordered"
                    class="w-full h-48"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Patrones"
                description="dots (default), grid (cuadrícula) y lines (renglones)."
                :code="patternsCode"
            >
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Canvas pattern="dots"  bordered class="h-32" />
                    <Canvas pattern="grid"  bordered class="h-32" />
                    <Canvas pattern="lines" bordered class="h-32" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Intensidad"
                description="Controla la opacidad del patrón sobre la superficie."
                :code="intensityCode"
            >
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Canvas pattern="dots" intensity="subtle" bordered class="h-24" />
                    <Canvas pattern="dots" intensity="normal" bordered class="h-24" />
                    <Canvas pattern="dots" intensity="strong" bordered class="h-24" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Bordered + cellSize"
                description="Combina un cellSize mayor y borde para áreas de trabajo amplias."
                :code="borderedCode"
            >
                <Canvas pattern="grid" :cell-size="24" bordered class="w-full h-40" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
