<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';
import Button from '../../../components/forms/Button.vue';
</script>

<template>
    <DocPage
        title="Tooltip"
        category="Feedback"
        import-path="import Tooltip from '@/components/feedback/Tooltip.vue'"
        description="Pista contextual sobre un elemento al hover/focus. Soporta múltiples placements, delays y triggers."
    >
        <template #examples>
            <Example title="Placements">
                <Tooltip content="Top" placement="top"><Button>Top</Button></Tooltip>
                <Tooltip content="Right" placement="right"><Button>Right</Button></Tooltip>
                <Tooltip content="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
                <Tooltip content="Left" placement="left"><Button>Left</Button></Tooltip>
            </Example>

            <Example title="Colores">
                <Tooltip content="default" color="default"><Button variant="ghost">default</Button></Tooltip>
                <Tooltip content="primary" color="primary"><Button variant="ghost">primary</Button></Tooltip>
                <Tooltip content="success" color="success"><Button variant="ghost">success</Button></Tooltip>
                <Tooltip content="warning" color="warning"><Button variant="ghost">warning</Button></Tooltip>
                <Tooltip content="danger" color="danger"><Button variant="ghost">danger</Button></Tooltip>
                <Tooltip content="inverted" color="inverted"><Button variant="ghost">inverted</Button></Tooltip>
            </Example>

            <Example title="Delay">
                <Tooltip content="Aparezco con delay" :open-delay="600"><Button>Hover lento</Button></Tooltip>
            </Example>

            <Example title="Click trigger">
                <Tooltip content="Soy un popover por click" trigger="click"><Button>Click me</Button></Tooltip>
            </Example>
        </template>
    </DocPage>
</template>
