<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Canvas from '../../../components/layout/Canvas.vue';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbToggle from '../../components/toolbar/TbToggle.vue';
import TbSep from '../../components/toolbar/TbSep.vue';
import type { PropDoc, SlotDoc } from '../../types';

const { t } = useI18n();

const pgPattern = ref<'dots' | 'grid' | 'lines' | 'none'>('dots');
const pgIntensity = ref<'subtle' | 'normal' | 'strong'>('subtle');
const pgBordered = ref(false);
const pgSurface = ref<'card' | 'background' | 'muted'>('card');

function resetPlayground() {
    pgPattern.value = 'dots';
    pgIntensity.value = 'subtle';
    pgBordered.value = false;
    pgSurface.value = 'card';
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgPattern.value !== 'dots') parts.push(`pattern="${pgPattern.value}"`);
    if (pgIntensity.value !== 'subtle') parts.push(`intensity="${pgIntensity.value}"`);
    if (pgBordered.value) parts.push('bordered');
    if (pgSurface.value !== 'card') parts.push(`surface="${pgSurface.value}"`);
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

const propsList = computed<PropDoc[]>(() => [
    { name: 'pattern',   type: "'dots' | 'grid' | 'lines' | 'none'",                   default: "'dots'",   description: t('pages.layout.canvas.props.pattern') },
    { name: 'cellSize',  type: 'number',                                                default: '16',       description: t('pages.layout.canvas.props.cellSize') },
    { name: 'intensity', type: "'subtle' | 'normal' | 'strong'",                       default: "'subtle'", description: t('pages.layout.canvas.props.intensity') },
    { name: 'surface',   type: "'card' | 'background' | 'muted'",                      default: "'card'",   description: t('pages.layout.canvas.props.surface') },
    { name: 'radius',    type: "'none' | 'small' | 'medium' | 'large' | 'full'",       default: 'provider', description: t('pages.layout.canvas.props.radius') },
    { name: 'bordered',  type: 'boolean',                                                default: 'false',   description: t('pages.layout.canvas.props.bordered') },
    { name: 'as',        type: 'string',                                                 default: "'div'",   description: t('pages.layout.canvas.props.as') },
]);

const slotsList = computed<SlotDoc[]>(() => [
    { name: 'default', description: t('pages.layout.canvas.slots.default') },
]);
</script>

<template>
    <ComponentDoc
        :title="t('pages.layout.canvas.title')"
        :category="t('pages.layout.canvas.category')"
        import-path="import { Canvas } from 'mood-ui'"
        :description="t('pages.layout.canvas.description')"
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="280px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Pattern" :options="[{value:'dots'},{value:'grid'},{value:'lines'},{value:'none'}]" v-model="pgPattern" />
                    <TbSep />
                    <TbPills label="Intensity" :options="[{value:'subtle'},{value:'normal'},{value:'strong'}]" v-model="pgIntensity" />
                    <TbSep />
                    <TbPills label="Surface" :options="[{value:'card'},{value:'background'},{value:'muted'}]" v-model="pgSurface" />
                    <TbSep />
                    <TbToggle label="Bordered" v-model="pgBordered" />
                </template>

                <Canvas
                    :pattern="pgPattern"
                    :intensity="pgIntensity"
                    :bordered="pgBordered"
                    :surface="pgSurface"
                    class="w-full h-48"
                />
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                :title="t('pages.layout.canvas.examples.patterns.title')"
                :description="t('pages.layout.canvas.examples.patterns.desc')"
                :code="patternsCode"
            >
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Canvas pattern="dots"  bordered class="h-32" />
                    <Canvas pattern="grid"  bordered class="h-32" />
                    <Canvas pattern="lines" bordered class="h-32" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.canvas.examples.intensity.title')"
                :description="t('pages.layout.canvas.examples.intensity.desc')"
                :code="intensityCode"
            >
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Canvas pattern="dots" intensity="subtle" bordered class="h-24" />
                    <Canvas pattern="dots" intensity="normal" bordered class="h-24" />
                    <Canvas pattern="dots" intensity="strong" bordered class="h-24" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                :title="t('pages.layout.canvas.examples.bordered.title')"
                :description="t('pages.layout.canvas.examples.bordered.desc')"
                :code="borderedCode"
            >
                <Canvas pattern="grid" :cell-size="24" bordered class="w-full h-40" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
