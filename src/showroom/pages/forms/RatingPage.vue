<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Rating from '../../../components/forms/Rating.vue';

const value = ref(3);
const halfValue = ref(2.5);
const reviewValue = ref(4);
</script>

<template>
    <DocPage
        title="Rating"
        category="Forms"
        import-path="import { Rating } from 'mood-ui'"
        description="Componente de valoración por estrellas. Soporta medias estrellas, modo readonly, valor numérico visible y navegación por teclado (←/→/Home/End)."
    >
        <template #examples>
            <Example title="Básico" :code="`<Rating v-model=\&quot;value\&quot; />`">
                <div class="flex flex-col gap-2">
                    <Rating v-model="value" />
                    <p class="text-xs text-muted-foreground font-mono">value: {{ value }}</p>
                </div>
            </Example>

            <Example title="Medias estrellas" :code="`<Rating v-model=\&quot;value\&quot; allow-half />`">
                <div class="flex flex-col gap-2">
                    <Rating v-model="halfValue" allow-half show-value />
                    <p class="text-xs text-muted-foreground font-mono">value: {{ halfValue }}</p>
                </div>
            </Example>

            <Example title="Mostrar valor" :code="`<Rating v-model=\&quot;value\&quot; show-value />`">
                <Rating v-model="value" show-value />
            </Example>

            <Example title="Tamaños">
                <div class="flex flex-col gap-3">
                    <Rating :model-value="4" size="small" readonly show-value />
                    <Rating :model-value="4" size="medium" readonly show-value />
                    <Rating :model-value="4" size="large" readonly show-value />
                </div>
            </Example>

            <Example title="Colores">
                <div class="flex flex-col gap-2">
                    <Rating :model-value="4" color="warning" readonly />
                    <Rating :model-value="4" color="primary" readonly />
                    <Rating :model-value="4" color="success" readonly />
                    <Rating :model-value="4" color="danger" readonly />
                </div>
            </Example>

            <Example title="Readonly / disabled">
                <div class="flex flex-col gap-2">
                    <Rating :model-value="3.5" allow-half readonly show-value />
                    <Rating :model-value="3" disabled />
                </div>
            </Example>

            <Example title="Cantidad personalizada (max)">
                <Rating v-model="reviewValue" :max="10" allow-half show-value />
            </Example>
        </template>
    </DocPage>
</template>
