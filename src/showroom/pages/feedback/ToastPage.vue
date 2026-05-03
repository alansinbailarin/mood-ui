<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Button from '../../../components/forms/Button.vue';
import Typography from '../../../components/data-display/Typography.vue';
import { useToast } from '../../../composables/useToast';

const t = useToast();
</script>

<template>
    <DocPage
        title="ToastContainer"
        category="Feedback"
        import-path="import ToastContainer from '@/components/feedback/ToastContainer.vue'"
        description="Contenedor singleton donde aparecen los toasts. Móntalo una vez cerca del root y úsalo desde cualquier parte mediante useToast()."
    >
        <template #examples>
            <Example title="Lanzar toasts" description="Helpers info / success / warning / danger.">
                <Button @click="t.info({ title: 'Información', description: 'Algo informativo' })">info()</Button>
                <Button color="success" @click="t.success({ title: 'Guardado', description: 'Cambios aplicados' })">success()</Button>
                <Button color="warning" @click="t.warning({ title: 'Atención', description: 'Revisa antes de continuar' })">warning()</Button>
                <Button color="danger" @click="t.danger({ title: 'Error', description: 'No se pudo completar' })">danger()</Button>
                <Button variant="outline" @click="t.dismissAll()">dismissAll()</Button>
            </Example>

            <Example title="Uso programático">
                <Typography variant="caption">
                    Llama a <code class="font-mono">useToast()</code> en cualquier <code class="font-mono">setup()</code>
                    y dispara <code class="font-mono">.success / .info / .warning / .danger / .show</code>.
                </Typography>
            </Example>
        </template>
    </DocPage>
</template>
