<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import RangeSlider from '../../../components/forms/RangeSlider.vue';

const v = ref<[number, number]>([20, 80]);
const price = ref<[number, number]>([100, 500]);
</script>

<template>
    <DocPage
        title="RangeSlider"
        category="Forms"
        import-path="import RangeSlider from '@/components/forms/RangeSlider.vue'"
        description="Selector de un rango (par mín/máx). Útil para filtros de precio, edad, fecha, etc."
    >
        <template #examples>
            <Example title="Default">
                <RangeSlider v-model="v" show-value class="w-80" />
            </Example>

            <Example title="Filtro de precio" description="Con format y minDistance.">
                <RangeSlider
                    v-model="price"
                    :min="0"
                    :max="1000"
                    :step="10"
                    :min-distance="50"
                    :format-value="(v: number) => `$${v}`"
                    show-value
                    class="w-80"
                />
            </Example>

            <Example title="Tamaños">
                <RangeSlider :model-value="[20, 60] as [number, number]" size="small" class="w-64" />
                <RangeSlider :model-value="[20, 60] as [number, number]" size="medium" class="w-64" />
                <RangeSlider :model-value="[20, 60] as [number, number]" size="large" class="w-64" />
            </Example>

            <Example title="Disabled">
                <RangeSlider :model-value="[30, 70] as [number, number]" disabled class="w-64" />
            </Example>
        </template>
    </DocPage>
</template>
