<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Banner from '../../../components/feedback/Banner.vue';

const visible = ref(true);
</script>

<template>
    <DocPage
        title="Banner"
        category="Feedback"
        import-path="import Banner from '@/components/feedback/Banner.vue'"
        description="Aviso prominente para comunicar estado a nivel de página o sección. Soporta colores semánticos, dismiss y posición sticky."
    >
        <template #examples>
            <Example title="Colores">
                <div class="flex flex-col gap-2 w-full">
                    <Banner color="info" title="Información" description="Tu cuenta se sincronizará en unos minutos." />
                    <Banner color="success" title="Listo" description="Los cambios se guardaron correctamente." />
                    <Banner color="warning" title="Atención" description="Tu plan caduca en 5 días." />
                    <Banner color="danger" title="Error" description="No pudimos procesar el pago." />
                </div>
            </Example>

            <Example title="Variantes">
                <div class="flex flex-col gap-2 w-full">
                    <Banner color="info" variant="filled" title="Filled" description="Estilo sólido." />
                    <Banner color="info" variant="subtle" title="Subtle" description="Estilo suave (default)." />
                    <Banner color="info" variant="outline" title="Outline" description="Estilo con borde." />
                </div>
            </Example>

            <Example title="Dismissable" description="Click la X para cerrar.">
                <Banner v-if="visible" color="info" title="Tip" description="Puedes cerrar este aviso." dismissable @dismiss="visible = false" />
                <button v-else class="text-sm underline" @click="visible = true">Mostrar de nuevo</button>
            </Example>
        </template>
    </DocPage>
</template>
