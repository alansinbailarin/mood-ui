<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Loader from '../../../components/feedback/Loader.vue';
</script>

<template>
    <DocPage
        title="Loader"
        category="Feedback"
        import-path="import Loader from '@/components/feedback/Loader.vue'"
        description="Spinner para indicar carga. Disponible en distintos tamaños y aceptando label opcional para accesibilidad."
    >
        <template #examples>
            <Example title="Tamaños">
                <Loader size="small" />
                <Loader size="medium" />
                <Loader size="large" />
            </Example>

            <Example title="Con label">
                <Loader label="Cargando proyectos…" />
            </Example>

            <Example title="Color custom">
                <Loader color="#10b981" />
                <Loader color="#ec4899" />
            </Example>
        </template>
    </DocPage>
</template>
