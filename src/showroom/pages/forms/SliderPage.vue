<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Slider from '../../../components/forms/Slider.vue';

const v = ref(50);
const v2 = ref(20);
const v3 = ref(3);
</script>

<template>
    <DocPage
        title="Slider"
        category="Forms"
        import-path="import Slider from '@/components/forms/Slider.vue'"
        description="Selector de un valor numérico en un rango. Soporta marks, formatValue, mostrar valor y orientación vertical."
    >
        <template #examples>
            <Example title="Default" description="0–100, paso 1.">
                <Slider v-model="v" show-value class="w-80" />
            </Example>

            <Example title="Con marks numéricos">
                <Slider v-model="v2" :marks="[0, 25, 50, 75, 100]" show-value class="w-80" />
            </Example>

            <Example title="Con marks etiquetados">
                <Slider
                    v-model="v3"
                    :min="1"
                    :max="5"
                    :step="1"
                    :marks="[
                        { value: 1, label: 'XS' },
                        { value: 2, label: 'S' },
                        { value: 3, label: 'M' },
                        { value: 4, label: 'L' },
                        { value: 5, label: 'XL' },
                    ]"
                    show-value
                    class="w-80"
                />
            </Example>

            <Example title="Tamaños">
                <Slider :model-value="40" size="small" class="w-64" />
                <Slider :model-value="40" size="medium" class="w-64" />
                <Slider :model-value="40" size="large" class="w-64" />
            </Example>

            <Example title="Disabled">
                <Slider :model-value="60" disabled class="w-64" />
            </Example>
        </template>
    </DocPage>
</template>
