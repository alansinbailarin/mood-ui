<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Divider from '../../../components/layout/Divider.vue';
import { StarIcon } from '@heroicons/vue/24/outline';
</script>

<template>
    <DocPage
        title="Divider"
        category="Layout"
        import-path="import Divider from '@/components/layout/Divider.vue'"
        description="Línea separadora horizontal o vertical, opcionalmente con label o icono central."
    >
        <template #examples>
            <Example title="Horizontal">
                <div class="w-full flex flex-col gap-2">
                    <span>Antes</span>
                    <Divider />
                    <span>Después</span>
                </div>
            </Example>

            <Example title="Con label">
                <div class="w-full"><Divider label="o" /></div>
            </Example>

            <Example title="Con icono">
                <div class="w-full"><Divider :icon="StarIcon" label="Featured" /></div>
            </Example>

            <Example title="Variantes">
                <div class="w-full flex flex-col gap-3">
                    <Divider variant="solid" label="solid" />
                    <Divider variant="dashed" label="dashed" />
                    <Divider variant="dotted" label="dotted" />
                </div>
            </Example>

            <Example title="Vertical">
                <div class="flex items-center gap-3 h-12">
                    <span>A</span>
                    <Divider orientation="vertical" />
                    <span>B</span>
                    <Divider orientation="vertical" />
                    <span>C</span>
                </div>
            </Example>
        </template>
    </DocPage>
</template>
