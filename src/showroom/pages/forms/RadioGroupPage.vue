<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import RadioGroup from '../../../components/forms/RadioGroup.vue';

const v = ref('m');
const v2 = ref('a');

const sizes = [
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
];

const plans = [
    { value: 'a', label: 'Free', description: 'Hasta 3 proyectos' },
    { value: 'b', label: 'Pro', description: 'Proyectos ilimitados y soporte prioritario' },
    { value: 'c', label: 'Enterprise', description: 'SLA, SSO y onboarding dedicado' },
];
</script>

<template>
    <DocPage
        title="Radio & RadioGroup"
        category="Forms"
        import-path="import RadioGroup from '@/components/forms/RadioGroup.vue'"
        description="Selección excluyente entre varias opciones. Maneja el roving tabindex y el estado activo. Las opciones pueden incluir descripción para presentar planes / configuraciones."
    >
        <template #examples>
            <Example title="Vertical (default)">
                <RadioGroup v-model="v" :options="sizes" label="Tamaño" />
            </Example>

            <Example title="Horizontal">
                <RadioGroup v-model="v" :options="sizes" orientation="horizontal" />
            </Example>

            <Example title="Con descripciones" description="Ideal para selectores de plan.">
                <RadioGroup v-model="v2" :options="plans" label="Plan" />
            </Example>

            <Example title="Disabled">
                <RadioGroup :model-value="'m'" :options="sizes" disabled />
            </Example>
        </template>
    </DocPage>
</template>
