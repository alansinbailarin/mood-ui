<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Divider from '../../../components/layout/Divider.vue';
import { StarIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, SlotDoc } from '../../types';

const pgOrientation = ref<'horizontal' | 'vertical'>('horizontal');
const pgVariant = ref<'solid' | 'dashed' | 'dotted'>('solid');
const pgEmphasis = ref<'subtle' | 'default' | 'strong'>('default');

function resetPlayground() {
    pgOrientation.value = 'horizontal';
    pgVariant.value = 'solid';
    pgEmphasis.value = 'default';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgOrientation.value !== 'horizontal') parts.push(`orientation="${pgOrientation.value}"`);
    if (pgVariant.value !== 'solid') parts.push(`variant="${pgVariant.value}"`);
    if (pgEmphasis.value !== 'default') parts.push(`emphasis="${pgEmphasis.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Divider${attrs} />`;
});

const orientationsCode = `<!-- Horizontal -->
<Divider />

<!-- Vertical (el host necesita flex/grid) -->
<div class="flex items-center gap-3 h-12">
    <span>A</span>
    <Divider orientation="vertical" />
    <span>B</span>
</div>`;

const labelCode = `<Divider label="o" />
<Divider :icon="StarIcon" label="Featured" />
<Divider label="Sección" label-align="start" />`;

const variantsCode = `<Divider variant="solid"  label="solid"  />
<Divider variant="dashed" label="dashed" />
<Divider variant="dotted" label="dotted" />`;

const emphasisCode = `<Divider emphasis="subtle"  label="subtle"  />
<Divider emphasis="default" label="default" />
<Divider emphasis="strong"  label="strong"  />`;

const propsList: PropDoc[] = [
    { name: 'orientation', type: "'horizontal' | 'vertical'",            default: "'horizontal'", description: 'Orientación del separador.' },
    { name: 'variant',     type: "'solid' | 'dashed' | 'dotted'",        default: "'solid'",      description: 'Estilo de la línea.' },
    { name: 'emphasis',    type: "'subtle' | 'default' | 'strong'",      default: "'default'",    description: 'Intensidad visual del divisor.' },
    { name: 'spacing',     type: "'none' | 'small' | 'medium' | 'large'", default: "'medium'",    description: 'Margen perpendicular a la línea.' },
    { name: 'label',       type: 'string',                                                        description: 'Etiqueta inline (solo orientación horizontal).' },
    { name: 'icon',        type: 'Component',                                                     description: 'Icono opcional junto al label.' },
    { name: 'labelAlign',  type: "'start' | 'center' | 'end'",            default: "'center'",    description: 'Posición del label dentro del divisor.' },
    { name: 'decorative',  type: 'boolean',                                default: 'false',      description: 'Si es decorativo, se ignora por tecnologías de asistencia.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido inline alternativo a la prop label.' },
];
</script>

<template>
    <ComponentDoc
        title="Divider"
        category="Layout"
        import-path="import { Divider } from 'mood-ui'"
        description="Línea separadora horizontal o vertical, opcionalmente con label o icono central."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Orientación</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="o in ['horizontal','vertical']"
                                :key="o"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgOrientation === o
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgOrientation = (o as typeof pgOrientation)"
                            >{{ o }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['solid','dashed','dotted']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Emphasis</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="e in ['subtle','default','strong']"
                                :key="e"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgEmphasis === e
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgEmphasis = (e as typeof pgEmphasis)"
                            >{{ e }}</button>
                        </div>
                    </div>
                </template>

                <div v-if="pgOrientation === 'horizontal'" class="w-full max-w-md">
                    <Divider :variant="pgVariant" :emphasis="pgEmphasis" />
                </div>
                <div v-else class="flex items-center gap-3 h-16">
                    <span class="text-sm text-muted-foreground">A</span>
                    <Divider orientation="vertical" :variant="pgVariant" :emphasis="pgEmphasis" />
                    <span class="text-sm text-muted-foreground">B</span>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Orientaciones"
                description="Horizontal por defecto; vertical cuando el host es flex/grid."
                :code="orientationsCode"
            >
                <div class="w-full flex flex-col gap-3">
                    <Divider />
                    <div class="flex items-center gap-3 h-12 justify-center">
                        <span class="text-sm">A</span>
                        <Divider orientation="vertical" />
                        <span class="text-sm">B</span>
                        <Divider orientation="vertical" />
                        <span class="text-sm">C</span>
                    </div>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con label e icono"
                description="Inserta una etiqueta o icono centrado en horizontal."
                :code="labelCode"
            >
                <div class="w-full flex flex-col gap-3">
                    <Divider label="o" />
                    <Divider :icon="StarIcon" label="Featured" />
                    <Divider label="Sección" label-align="start" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Variantes de línea"
                description="Solid, dashed y dotted para distintos niveles de jerarquía."
                :code="variantsCode"
            >
                <div class="w-full flex flex-col gap-3">
                    <Divider variant="solid"  label="solid"  />
                    <Divider variant="dashed" label="dashed" />
                    <Divider variant="dotted" label="dotted" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Énfasis"
                description="Controla el contraste de la línea respecto al fondo."
                :code="emphasisCode"
            >
                <div class="w-full flex flex-col gap-3">
                    <Divider emphasis="subtle"  label="subtle"  />
                    <Divider emphasis="default" label="default" />
                    <Divider emphasis="strong"  label="strong"  />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
