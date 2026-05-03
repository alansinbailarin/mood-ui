<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Badge from '../../../components/feedback/Badge.vue';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';
</script>

<template>
    <DocPage
        title="Badge"
        category="Feedback"
        import-path="import Badge from '@/components/feedback/Badge.vue'"
        description="Etiqueta inline para mostrar estado, conteos o categorías. Soporta variantes solid / subtle / outline, colores, tamaños, icono y dot."
    >
        <template #examples>
            <Example title="Variantes">
                <Badge label="Solid" variant="solid" color="primary" />
                <Badge label="Subtle" variant="subtle" color="primary" />
                <Badge label="Outline" variant="outline" color="primary" />
            </Example>

            <Example title="Colores (subtle)">
                <Badge label="default" color="default" variant="subtle" />
                <Badge label="primary" color="primary" variant="subtle" />
                <Badge label="success" color="success" variant="subtle" />
                <Badge label="warning" color="warning" variant="subtle" />
                <Badge label="danger" color="danger" variant="subtle" />
            </Example>

            <Example title="Tamaños">
                <Badge label="small" size="small" color="primary" />
                <Badge label="medium" size="medium" color="primary" />
                <Badge label="large" size="large" color="primary" />
            </Example>

            <Example title="Con icono y dot">
                <Badge label="Activo" :icon="CheckCircleIcon" color="success" variant="subtle" />
                <Badge label="Online" dot color="success" variant="subtle" />
            </Example>

            <Example title="Removable">
                <Badge label="Filtro: rojo" removable color="primary" variant="subtle" />
            </Example>
        </template>
    </DocPage>
</template>
