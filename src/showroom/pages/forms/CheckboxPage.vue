<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Checkbox from '../../../components/forms/Checkbox.vue';
import Stack from '../../../components/layout/Stack.vue';

const a = ref(true);
const b = ref(false);
const indet = ref(false);
</script>

<template>
    <DocPage
        title="Checkbox"
        category="Forms"
        import-path="import Checkbox from '@/components/forms/Checkbox.vue'"
        description="Checkbox accesible con soporte para estado indeterminado, descripción y todas las variantes de color y tamaño."
    >
        <template #examples>
            <Example title="Default">
                <Stack direction="column" spacing="small">
                    <Checkbox v-model="a" label="Acepto los términos" />
                    <Checkbox v-model="b" label="Suscribirme al newsletter" />
                </Stack>
            </Example>

            <Example title="Con descripción">
                <Checkbox label="Notificaciones" description="Recibe alertas por email cuando hay actividad." />
            </Example>

            <Example title="Indeterminado" description="Útil para “seleccionar todos” parcial.">
                <Checkbox :indeterminate="true" :model-value="indet" label="Selección parcial" />
            </Example>

            <Example title="Colores">
                <Checkbox :model-value="true" color="primary" label="primary" />
                <Checkbox :model-value="true" color="success" label="success" />
                <Checkbox :model-value="true" color="warning" label="warning" />
                <Checkbox :model-value="true" color="danger" label="danger" />
            </Example>

            <Example title="Tamaños">
                <Checkbox :model-value="true" size="small" label="small" />
                <Checkbox :model-value="true" size="medium" label="medium" />
                <Checkbox :model-value="true" size="large" label="large" />
            </Example>

            <Example title="Disabled">
                <Checkbox :model-value="true" disabled label="Disabled marcado" />
                <Checkbox :model-value="false" disabled label="Disabled vacío" />
            </Example>
        </template>
    </DocPage>
</template>
