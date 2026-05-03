<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Skeleton from '../../../components/feedback/Skeleton.vue';
import Card from '../../../components/data-display/Card.vue';
</script>

<template>
    <DocPage
        title="Skeleton"
        category="Feedback"
        import-path="import Skeleton from '@/components/feedback/Skeleton.vue'"
        description="Placeholder animado para contenido en carga. Disponible en distintas formas (rect/text/circle) y animaciones (shimmer/pulse)."
    >
        <template #examples>
            <Example title="Formas básicas">
                <Skeleton shape="circle" :width="48" :height="48" />
                <Skeleton shape="rect" :width="120" :height="48" />
                <Skeleton shape="text" :width="180" />
            </Example>

            <Example title="Texto multi-línea">
                <div class="w-96">
                    <Skeleton shape="text" :lines="4" />
                </div>
            </Example>

            <Example title="Card placeholder">
                <Card variant="outlined" padding="medium" class="w-72">
                    <div class="flex gap-3 items-center">
                        <Skeleton shape="circle" :width="40" :height="40" />
                        <div class="flex-1">
                            <Skeleton shape="text" :width="120" />
                            <Skeleton shape="text" :width="80" />
                        </div>
                    </div>
                    <Skeleton shape="rect" :height="120" full-width class="mt-3" />
                </Card>
            </Example>

            <Example title="Animaciones">
                <Skeleton :width="120" :height="32" animation="shimmer" />
                <Skeleton :width="120" :height="32" animation="pulse" />
                <Skeleton :width="120" :height="32" animation="none" />
            </Example>
        </template>
    </DocPage>
</template>
