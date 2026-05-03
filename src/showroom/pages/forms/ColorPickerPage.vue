<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import ColorPicker from '../../../components/forms/ColorPicker.vue';

const color = ref('#6366f1');
const brandColor = ref('#10b981');
const minimal = ref('#ec4899');

const brandSwatches = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#14b8a6', '#0ea5e9',
];
</script>

<template>
    <DocPage
        title="ColorPicker"
        category="Forms"
        import-path="import { ColorPicker } from 'mood-ui'"
        description="Selector de color con popover de swatches, input hex y picker nativo. Ideal para personalización de tema, branding y editores visuales."
    >
        <template #examples>
            <Example title="Básico" :code="`<ColorPicker v-model=\&quot;color\&quot; />`">
                <div class="flex flex-col gap-2">
                    <ColorPicker v-model="color" />
                    <p class="text-xs text-muted-foreground font-mono">value: {{ color }}</p>
                </div>
            </Example>

            <Example title="Swatches personalizados" :code="`<ColorPicker v-model=\&quot;color\&quot; :swatches=\&quot;brandSwatches\&quot; />`">
                <ColorPicker v-model="brandColor" :swatches="brandSwatches" />
            </Example>

            <Example title="Solo swatches (sin hex ni native)">
                <ColorPicker v-model="minimal" :show-hex="false" :show-native="false" />
            </Example>

            <Example title="Tamaños">
                <div class="flex items-center gap-3">
                    <ColorPicker v-model="color" size="small" />
                    <ColorPicker v-model="color" size="medium" />
                    <ColorPicker v-model="color" size="large" />
                </div>
            </Example>

            <Example title="Placement del popover">
                <div class="flex items-center gap-3 flex-wrap">
                    <ColorPicker v-model="color" placement="bottom-start" />
                    <ColorPicker v-model="color" placement="bottom-end" />
                    <ColorPicker v-model="color" placement="top-start" />
                    <ColorPicker v-model="color" placement="top-end" />
                </div>
            </Example>

            <Example title="Disabled">
                <ColorPicker v-model="color" disabled />
            </Example>
        </template>
    </DocPage>
</template>
