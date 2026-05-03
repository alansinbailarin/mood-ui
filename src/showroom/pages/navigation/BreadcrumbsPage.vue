<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Breadcrumbs from '../../../components/navigation/Breadcrumbs.vue';
import { FolderIcon, DocumentIcon } from '@heroicons/vue/24/outline';
import type { PropDoc } from '../../types';

const items = [
    { label: 'Inicio', href: '#' },
    { label: 'Proyectos', href: '#', icon: FolderIcon },
    { label: 'Modo', href: '#', icon: FolderIcon },
    { label: 'Componentes', href: '#' },
    { label: 'Breadcrumbs', icon: DocumentIcon },
];

// playground
const separator = ref<'chevron' | 'slash' | 'dot' | 'arrow'>('chevron');
const size = ref<'small' | 'medium' | 'large'>('medium');
const max = ref<number>(0);
const showHomeIcon = ref(false);

const sepOpts = [
    { value: 'chevron', label: 'chevron' },
    { value: 'slash', label: 'slash' },
    { value: 'dot', label: 'dot' },
    { value: 'arrow', label: 'arrow' },
];
const sizeOpts = [
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];
const maxOpts = [
    { value: 0, label: 'sin límite' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
];

const propsList: PropDoc[] = [
    { name: 'items', type: 'BreadcrumbItem[]', required: true, description: 'Cada item soporta `label`, `icon`, `to`, `href`, `disabled`.' },
    { name: 'max', type: 'number', description: 'Si supera N, colapsa los del medio en `…`.' },
    { name: 'separator', type: "'chevron' | 'slash' | 'dot' | 'arrow'", default: "'chevron'" },
    { name: 'separatorText', type: 'string', description: 'Sustituye el separador por texto literal.' },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { name: 'showHomeIcon', type: 'boolean', default: 'false' },
];
</script>

<template>
    <DocPage
        title="Breadcrumbs"
        category="Navigation"
        import-path="import Breadcrumbs from '@/components/navigation/Breadcrumbs.vue'"
        description="Migas de pan accesibles con iconos por item, separadores intercambiables y colapsado opcional cuando hay muchos niveles."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <Breadcrumbs :items="items" />
            </Example>

            <Example title="Separadores">
                <Stack direction="column" spacing="small">
                    <Breadcrumbs :items="items" separator="chevron" />
                    <Breadcrumbs :items="items" separator="slash" />
                    <Breadcrumbs :items="items" separator="dot" />
                    <Breadcrumbs :items="items" separator="arrow" />
                </Stack>
            </Example>

            <Example title="Colapsado (max)">
                <Breadcrumbs :items="items" :max="3" />
            </Example>

            <Example title="Tamaños">
                <Stack direction="column" spacing="small">
                    <Breadcrumbs :items="items" size="small" />
                    <Breadcrumbs :items="items" size="medium" />
                    <Breadcrumbs :items="items" size="large" />
                </Stack>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[80px] flex items-center">
                        <Breadcrumbs
                            :items="items"
                            :separator="separator"
                            :size="size"
                            :max="max || undefined"
                            :show-home-icon="showHomeIcon"
                        />
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Separator</Typography>
                            <Select v-model="separator" :options="sepOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="size" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Max</Typography>
                            <Select v-model="max" :options="maxOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Home icon</Typography>
                            <Switch v-model="showHomeIcon" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
