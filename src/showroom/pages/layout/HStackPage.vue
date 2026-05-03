<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import HStack from '../../../components/layout/HStack.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
</script>

<template>
    <DocPage
        title="HStack"
        category="Layout"
        import-path="import HStack from '@/components/layout/HStack.vue'"
        description="Atajo de Stack en dirección horizontal. Útil para alinear ítems en fila con spacing y align consistentes."
    >
        <template #examples>
            <Example title="Default" description="Distribuye hijos horizontalmente con spacing.">
                <HStack spacing="medium">
                    <Card variant="filled" padding="medium">A</Card>
                    <Card variant="filled" padding="medium">B</Card>
                    <Card variant="filled" padding="medium">C</Card>
                </HStack>
            </Example>

            <Example title="Spacings">
                <HStack spacing="xsmall">
                    <Typography variant="body">xsmall</Typography>
                    <Typography variant="body">·</Typography>
                    <Typography variant="body">·</Typography>
                </HStack>
                <HStack spacing="large">
                    <Typography variant="body">large</Typography>
                    <Typography variant="body">·</Typography>
                    <Typography variant="body">·</Typography>
                </HStack>
            </Example>
        </template>
    </DocPage>
</template>
