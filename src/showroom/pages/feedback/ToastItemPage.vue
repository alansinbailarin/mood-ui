<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Button from '../../../components/forms/Button.vue';
import { useToast } from '../../../composables/useToast';

const toast = useToast();
</script>

<template>
    <DocPage
        title="Toast (item)"
        category="Feedback"
        import-path="import { useToast } from '@/composables/useToast'"
        description="El componente Toast es renderizado internamente por ToastContainer. Para emitir notificaciones usa el composable useToast() con sus helpers info/success/warning/danger."
    >
        <template #examples>
            <Example title="Disparar toasts" description="Cada botón llama al helper correspondiente del composable.">
                <Button color="primary" @click="toast.info({ title: 'Información', description: 'Mensaje informativo.' })">Info</Button>
                <Button color="success" @click="toast.success({ title: 'Éxito', description: 'Operación completada.' })">Success</Button>
                <Button color="warning" @click="toast.warning({ title: 'Atención', description: 'Revisa los datos.' })">Warning</Button>
                <Button color="danger" @click="toast.danger({ title: 'Error', description: 'Algo salió mal.' })">Danger</Button>
            </Example>

            <Example title="Limpiar todos">
                <Button variant="outline" @click="toast.dismissAll()">Dismiss all</Button>
            </Example>
        </template>
    </DocPage>
</template>
