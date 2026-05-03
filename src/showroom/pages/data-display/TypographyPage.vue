<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Input from '../../../components/forms/Input.vue';
import type { PropDoc } from '../../types';

const variant = ref<'display' | 'heading' | 'title' | 'body' | 'caption'>('heading');
const size = ref<'small' | 'medium' | 'large'>('large');
const weight = ref<'normal' | 'medium' | 'semibold' | 'bold'>('semibold');
const color = ref<'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger'>('default');
const text = ref('Mood UI Typography');
const truncate = ref(false);

const variantOpts = [
    { value: 'display', label: 'display' },
    { value: 'heading', label: 'heading' },
    { value: 'title', label: 'title' },
    { value: 'body', label: 'body' },
    { value: 'caption', label: 'caption' },
];
const sizeOpts = [
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];
const weightOpts = [
    { value: 'normal', label: 'normal' },
    { value: 'medium', label: 'medium' },
    { value: 'semibold', label: 'semibold' },
    { value: 'bold', label: 'bold' },
];
const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'muted', label: 'muted' },
    { value: 'primary', label: 'primary' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
    { value: 'danger', label: 'danger' },
];

const propsList: PropDoc[] = [
    { name: 'variant', type: "'display' | 'heading' | 'title' | 'body' | 'caption' | 'overline'", default: "'body'", description: 'Estilo tipográfico semántico.' },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'", description: 'Tamaño dentro del variant.' },
    { name: 'weight', type: "'normal' | 'medium' | 'semibold' | 'bold'", default: "'normal'", description: 'Peso de la fuente.' },
    { name: 'color', type: "'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color del texto.' },
    { name: 'truncate', type: 'boolean', default: 'false', description: 'Trunca con ellipsis a una línea.' },
    { name: 'as', type: 'string', description: 'Tag HTML a renderizar (h1, h2, span, p, …).' },
];
</script>

<template>
    <DocPage
        title="Typography"
        category="Data display"
        import-path="import Typography from '@/components/data-display/Typography.vue'"
        description="Sistema tipográfico con variantes semánticas (display, heading, title, body, caption), tamaños y pesos. Soporta el color global del provider y el atributo as para mapear a la etiqueta HTML correcta."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Variantes">
                <Stack direction="column" spacing="small">
                    <Typography variant="display" size="large">Display</Typography>
                    <Typography variant="heading" size="large">Heading</Typography>
                    <Typography variant="title" size="medium">Title</Typography>
                    <Typography variant="body">Body — Lorem ipsum dolor sit amet.</Typography>
                    <Typography variant="caption" color="muted">Caption auxiliar</Typography>
                </Stack>
            </Example>

            <Example title="Pesos">
                <Typography weight="normal">Normal</Typography>
                <Typography weight="medium">Medium</Typography>
                <Typography weight="semibold">Semibold</Typography>
                <Typography weight="bold">Bold</Typography>
            </Example>

            <Example title="Colores semánticos">
                <Typography color="default">default</Typography>
                <Typography color="muted">muted</Typography>
                <Typography color="primary">primary</Typography>
                <Typography color="success">success</Typography>
                <Typography color="warning">warning</Typography>
                <Typography color="danger">danger</Typography>
            </Example>

            <Example title="Truncate">
                <div class="w-48">
                    <Typography truncate>
                        Texto que se trunca con ellipsis cuando no cabe en una sola línea.
                    </Typography>
                </div>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[160px] flex items-center justify-center text-center">
                        <Typography
                            :variant="variant"
                            :size="size"
                            :weight="weight"
                            :color="color"
                            :truncate="truncate"
                        >
                            {{ text || 'Mood UI' }}
                        </Typography>
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Texto</Typography>
                            <Input v-model="text" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Variant</Typography>
                            <Select v-model="variant" :options="variantOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="size" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Weight</Typography>
                            <Select v-model="weight" :options="weightOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="color" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Truncate</Typography>
                            <Switch v-model="truncate" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
