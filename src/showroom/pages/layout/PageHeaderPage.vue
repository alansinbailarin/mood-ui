<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import PageHeader from '../../../components/layout/PageHeader.vue';
import Button from '../../../components/forms/Button.vue';
</script>

<template>
    <DocPage
        title="PageHeader"
        category="Layout"
        import-path="import PageHeader from '@/components/layout/PageHeader.vue'"
        description="Cabecera de página con título, subtítulo, botón back opcional y zona de acciones."
    >
        <template #examples>
            <Example title="Default">
                <div class="w-full border border-border rounded-lg overflow-hidden">
                    <PageHeader title="Proyectos" subtitle="Gestiona los proyectos del workspace" :divider="true">
                        <template #actions>
                            <Button variant="outline" size="small">Filtros</Button>
                            <Button color="primary" size="small">Nuevo proyecto</Button>
                        </template>
                    </PageHeader>
                </div>
            </Example>

            <Example title="Con back button">
                <div class="w-full border border-border rounded-lg overflow-hidden">
                    <PageHeader back-button title="Detalle" subtitle="Volver a la lista" />
                </div>
            </Example>

            <Example title="Tamaños">
                <div class="w-full flex flex-col gap-2">
                    <PageHeader size="small" title="Small" />
                    <PageHeader size="medium" title="Medium" />
                    <PageHeader size="large" title="Large" />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
