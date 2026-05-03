<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Container from '../../../components/layout/Container.vue';
import Typography from '../../../components/data-display/Typography.vue';
</script>

<template>
    <DocPage
        title="Container"
        category="Layout"
        import-path="import Container from '@/components/layout/Container.vue'"
        description="Wrapper centrado con max-width y padding semántico para limitar el ancho del contenido en cualquier breakpoint."
    >
        <template #examples>
            <Example title="maxWidth">
                <Container max-width="sm" centered class="bg-surface-muted">
                    <Typography>sm (640px)</Typography>
                </Container>
                <Container max-width="md" centered class="bg-surface-muted">
                    <Typography>md (768px)</Typography>
                </Container>
                <Container max-width="lg" centered class="bg-surface-muted">
                    <Typography>lg (1024px)</Typography>
                </Container>
            </Example>

            <Example title="Padding">
                <Container max-width="sm" padding="none" class="bg-surface-muted"><Typography>none</Typography></Container>
                <Container max-width="sm" padding="small" class="bg-surface-muted"><Typography>small</Typography></Container>
                <Container max-width="sm" padding="large" class="bg-surface-muted"><Typography>large</Typography></Container>
            </Example>
        </template>
    </DocPage>
</template>
