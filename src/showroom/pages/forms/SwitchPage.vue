<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Switch from '../../../components/forms/Switch.vue';
import Stack from '../../../components/layout/Stack.vue';

const a = ref(true);
const b = ref(false);
</script>

<template>
    <DocPage
        title="Switch"
        category="Forms"
        import-path="import Switch from '@/components/forms/Switch.vue'"
        description="Toggle on/off semánticamente accesible. Soporta label en cualquier lado, descripción y estados de carga / disabled."
    >
        <template #examples>
            <Example title="Default">
                <Stack direction="column" spacing="small">
                    <Switch v-model="a" label="Notificaciones push" />
                    <Switch v-model="b" label="Modo oscuro" />
                </Stack>
            </Example>

            <Example title="Con descripción">
                <Switch label="Marketing" description="Recibir novedades de producto." :model-value="true" />
            </Example>

            <Example title="Label a la izquierda">
                <Switch label-position="left" label="Activo" :model-value="true" />
            </Example>

            <Example title="Colores">
                <Switch :model-value="true" color="primary" label="primary" />
                <Switch :model-value="true" color="success" label="success" />
                <Switch :model-value="true" color="warning" label="warning" />
                <Switch :model-value="true" color="danger" label="danger" />
            </Example>

            <Example title="Tamaños">
                <Switch :model-value="true" size="small" label="small" />
                <Switch :model-value="true" size="medium" label="medium" />
                <Switch :model-value="true" size="large" label="large" />
            </Example>

            <Example title="Disabled">
                <Switch :model-value="true" disabled label="Disabled on" />
                <Switch :model-value="false" disabled label="Disabled off" />
            </Example>
        </template>
    </DocPage>
</template>
