<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog.vue';
import Button from '../../../components/forms/Button.vue';
import { useConfirm } from '../../../composables/useConfirm';
import { useToast } from '../../../composables/useToast';

const { confirm } = useConfirm();
const t = useToast();
const last = ref<string>('—');

async function ask() {
    const ok = await confirm({
        title: '¿Eliminar elemento?',
        description: 'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        color: 'danger',
    });
    last.value = ok ? 'confirmado' : 'cancelado';
    ok ? t.success('Eliminado') : t.info('Cancelado');
}

async function askSimple() {
    const ok = await confirm('¿Confirmas?');
    last.value = String(ok);
}
</script>

<template>
    <DocPage
        title="ConfirmDialog"
        category="Feedback"
        import-path="import ConfirmDialog from '@/components/feedback/ConfirmDialog.vue'"
        description="Diálogo de confirmación imperativo. Móntalo una vez y llama a useConfirm().confirm() para obtener un Promise<boolean>."
    >
        <template #examples>
            <Example title="Setup">
                <ConfirmDialog />
                <Button color="danger" @click="ask">Borrar (con descripción)</Button>
                <Button @click="askSimple">Confirmación simple</Button>
                <span class="text-sm text-text-muted">Última respuesta: {{ last }}</span>
            </Example>
        </template>
    </DocPage>
</template>
