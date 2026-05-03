<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import NumberInput from '../../../components/forms/NumberInput.vue';

const v = ref<number | null>(0);
const price = ref<number | null>(99.99);
const qty = ref<number | null>(1);
</script>

<template>
    <DocPage
        title="NumberInput"
        category="Forms"
        import-path="import NumberInput from '@/components/forms/NumberInput.vue'"
        description="Input numérico con steppers, min/max, precisión decimal, separador de miles y prefijo/sufijo."
    >
        <template #examples>
            <Example title="Default" description="Con steppers a la derecha.">
                <NumberInput v-model="v" label="Cantidad" steppers class="w-48" />
            </Example>

            <Example title="Min / max + step">
                <NumberInput v-model="qty" label="Unidades" :min="0" :max="10" :step="1" steppers class="w-48" />
            </Example>

            <Example title="Precio con prefix">
                <NumberInput
                    v-model="price"
                    label="Precio"
                    prefix="$"
                    suffix="USD"
                    :precision="2"
                    :step="0.01"
                    thousand-separator
                    class="w-48"
                />
            </Example>

            <Example title="Stepper split">
                <NumberInput v-model="v" stepper-position="split" steppers class="w-48" />
            </Example>

            <Example title="Disabled">
                <NumberInput :model-value="42" disabled steppers class="w-48" />
            </Example>
        </template>
    </DocPage>
</template>
