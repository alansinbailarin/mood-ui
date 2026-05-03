<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Radio from '../../../components/forms/Radio.vue';
import { ref } from 'vue';

const choice = ref('a');
</script>

<template>
    <DocPage
        title="Radio"
        category="Forms"
        import-path="import Radio from '@/components/forms/Radio.vue'"
        description="Botón radio individual. Para grupos prefiere RadioGroup, que gestiona el roving tabindex y el v-model."
    >
        <template #examples>
            <Example title="Default" description="Radio individual con v-model.">
                <Radio v-model="choice" value="a" label="Opción A" />
                <Radio v-model="choice" value="b" label="Opción B" />
                <Radio v-model="choice" value="c" label="Opción C" />
            </Example>

            <Example title="Disabled">
                <Radio model-value="x" value="x" label="Seleccionado disabled" disabled />
                <Radio model-value="x" value="y" label="No seleccionado disabled" disabled />
            </Example>
        </template>
    </DocPage>
</template>
