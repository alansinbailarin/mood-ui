<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Canvas from '../../../components/layout/Canvas.vue';
import Typography from '../../../components/data-display/Typography.vue';
</script>

<template>
    <DocPage
        title="Canvas"
        category="Layout"
        import-path="import Canvas from '@/components/layout/Canvas.vue'"
        description="Superficie con patrón decorativo (puntos, grid, líneas). Útil para zonas de drop, hero sections y áreas de trabajo."
    >
        <template #examples>
            <Example title="Patrones">
                <Canvas pattern="dots" class="w-64 h-32">
                    <Typography variant="caption" class="p-2">dots</Typography>
                </Canvas>
                <Canvas pattern="grid" class="w-64 h-32">
                    <Typography variant="caption" class="p-2">grid</Typography>
                </Canvas>
                <Canvas pattern="lines" class="w-64 h-32">
                    <Typography variant="caption" class="p-2">lines</Typography>
                </Canvas>
            </Example>

            <Example title="Intensity">
                <Canvas pattern="dots" intensity="subtle" class="w-48 h-24" />
                <Canvas pattern="dots" intensity="normal" class="w-48 h-24" />
                <Canvas pattern="dots" intensity="strong" class="w-48 h-24" />
            </Example>

            <Example title="Bordered + cellSize">
                <Canvas pattern="grid" :cell-size="24" bordered class="w-72 h-32" />
            </Example>
        </template>
    </DocPage>
</template>
