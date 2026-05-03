<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import EmptyState from '../../../components/feedback/EmptyState.vue';
import Button from '../../../components/forms/Button.vue';
import { InboxIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
</script>

<template>
    <DocPage
        title="EmptyState"
        category="Feedback"
        import-path="import EmptyState from '@/components/feedback/EmptyState.vue'"
        description="Estado vacío para listas, búsquedas y secciones sin datos. Soporta icono, descripción, acciones y variantes."
    >
        <template #examples>
            <Example title="Default">
                <EmptyState
                    :icon="InboxIcon"
                    title="Sin notificaciones"
                    description="Cuando recibas algo aparecerá aquí."
                />
            </Example>

            <Example title="Con acción">
                <EmptyState
                    :icon="MagnifyingGlassIcon"
                    title="Sin resultados"
                    description="Intenta con otra búsqueda o limpia los filtros."
                >
                    <template #actions>
                        <Button color="primary">Limpiar filtros</Button>
                    </template>
                </EmptyState>
            </Example>

            <Example title="Variant outline">
                <EmptyState
                    :icon="ExclamationTriangleIcon"
                    title="Algo salió mal"
                    description="Reintenta en unos segundos."
                    variant="outline"
                />
            </Example>
        </template>
    </DocPage>
</template>
