<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import VStack from '../../../components/layout/VStack.vue';
import Card from '../../../components/data-display/Card.vue';
</script>

<template>
    <DocPage
        title="VStack"
        category="Layout"
        import-path="import VStack from '@/components/layout/VStack.vue'"
        description="Atajo de Stack en dirección vertical. Aplica spacing y align consistentes a una columna de hijos."
    >
        <template #examples>
            <Example title="Default" description="Apila hijos verticalmente.">
                <VStack spacing="medium" class="w-64">
                    <Card variant="filled" padding="medium">Item A</Card>
                    <Card variant="filled" padding="medium">Item B</Card>
                    <Card variant="filled" padding="medium">Item C</Card>
                </VStack>
            </Example>

            <Example title="Spacing large">
                <VStack spacing="large" class="w-64">
                    <Card variant="outlined" padding="medium">Card 1</Card>
                    <Card variant="outlined" padding="medium">Card 2</Card>
                </VStack>
            </Example>
        </template>
    </DocPage>
</template>
