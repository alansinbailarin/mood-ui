<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import ProgressBar from '../../../components/feedback/ProgressBar.vue';

const v = ref(0);
let id: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
    id = setInterval(() => {
        v.value = (v.value + 7) % 105;
    }, 700);
});
onBeforeUnmount(() => id && clearInterval(id));
</script>

<template>
    <DocPage
        title="ProgressBar"
        category="Feedback"
        import-path="import ProgressBar from '@/components/feedback/ProgressBar.vue'"
        description="Barra de progreso determinista o indeterminada. Muestra valor opcional, etiqueta y soporta animaciones striped."
    >
        <template #examples>
            <Example title="Animado">
                <div class="w-80"><ProgressBar :value="v" show-value /></div>
            </Example>

            <Example title="Colores">
                <div class="flex flex-col gap-2 w-80">
                    <ProgressBar :value="40" color="primary" />
                    <ProgressBar :value="60" color="success" />
                    <ProgressBar :value="75" color="warning" />
                    <ProgressBar :value="90" color="danger" />
                </div>
            </Example>

            <Example title="Tamaños">
                <div class="flex flex-col gap-2 w-80">
                    <ProgressBar :value="50" size="small" />
                    <ProgressBar :value="50" size="medium" />
                    <ProgressBar :value="50" size="large" />
                </div>
            </Example>

            <Example title="Striped">
                <div class="w-80"><ProgressBar :value="65" striped color="primary" show-value /></div>
            </Example>

            <Example title="Con label">
                <div class="w-80"><ProgressBar :value="33" label="Subiendo archivo" show-value /></div>
            </Example>
        </template>
    </DocPage>
</template>
