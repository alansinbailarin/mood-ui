<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Modal from '../../../components/feedback/Modal.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';

const a = ref(false);
const b = ref(false);
const c = ref(false);
</script>

<template>
    <DocPage
        title="Modal"
        category="Feedback"
        import-path="import Modal from '@/components/feedback/Modal.vue'"
        description="Diálogo modal centrado. Soporta tamaños, header con title/description, slot footer y bloqueo de scroll."
    >
        <template #examples>
            <Example title="Default">
                <Button @click="a = true">Abrir modal</Button>
                <Modal v-model="a" title="Confirmar" description="¿Quieres aplicar estos cambios?">
                    <Typography>El cambio es reversible desde el historial.</Typography>
                    <template #footer>
                        <Button variant="ghost" @click="a = false">Cancelar</Button>
                        <Button color="primary" @click="a = false">Aplicar</Button>
                    </template>
                </Modal>
            </Example>

            <Example title="Tamaño large">
                <Button @click="b = true">Abrir modal grande</Button>
                <Modal v-model="b" size="large" title="Detalles" />
            </Example>

            <Example title="Sin overlay click + sin escape">
                <Button @click="c = true">Modal modal-modal</Button>
                <Modal
                    v-model="c"
                    title="Acción crítica"
                    :close-on-overlay="false"
                    :close-on-escape="false"
                    color="danger"
                >
                    <Typography>Cierra solo con el botón.</Typography>
                    <template #footer>
                        <Button color="danger" @click="c = false">OK</Button>
                    </template>
                </Modal>
            </Example>
        </template>
    </DocPage>
</template>
