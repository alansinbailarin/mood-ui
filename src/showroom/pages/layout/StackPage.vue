<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Stack from '../../../components/layout/Stack.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
</script>

<template>
    <DocPage
        title="Stack"
        category="Layout"
        import-path="import Stack from '@/components/layout/Stack.vue'"
        description="Wrapper flex con dirección, spacing tokens, alineación y wrap. Atajos: HStack y VStack para casos comunes."
    >
        <template #examples>
            <Example title="Vertical (default)">
                <Stack direction="column" spacing="medium" class="w-72">
                    <Card variant="outlined" padding="small"><Typography>1</Typography></Card>
                    <Card variant="outlined" padding="small"><Typography>2</Typography></Card>
                    <Card variant="outlined" padding="small"><Typography>3</Typography></Card>
                </Stack>
            </Example>

            <Example title="Horizontal">
                <Stack direction="row" spacing="small">
                    <Card variant="outlined" padding="small"><Typography>A</Typography></Card>
                    <Card variant="outlined" padding="small"><Typography>B</Typography></Card>
                    <Card variant="outlined" padding="small"><Typography>C</Typography></Card>
                </Stack>
            </Example>

            <Example title="Spacing tokens">
                <Stack direction="row" spacing="none"><Card padding="small">none</Card><Card padding="small">none</Card></Stack>
                <Stack direction="row" spacing="small"><Card padding="small">small</Card><Card padding="small">small</Card></Stack>
                <Stack direction="row" spacing="medium"><Card padding="small">medium</Card><Card padding="small">medium</Card></Stack>
                <Stack direction="row" spacing="large"><Card padding="small">large</Card><Card padding="small">large</Card></Stack>
            </Example>

            <Example title="Con divider">
                <Stack direction="row" spacing="medium" divider>
                    <Typography>Inicio</Typography>
                    <Typography>Centro</Typography>
                    <Typography>Final</Typography>
                </Stack>
            </Example>
        </template>
    </DocPage>
</template>
