<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Button from '../../../components/forms/Button.vue';
import type { PropDoc, SlotDoc } from '../../types';

const variant = ref<'elevated' | 'outlined' | 'filled'>('outlined');
const padding = ref<'none' | 'small' | 'medium' | 'large'>('medium');
const radius = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');
const interactive = ref(false);

const variantOpts = [
    { value: 'elevated', label: 'elevated' },
    { value: 'outlined', label: 'outlined' },
    { value: 'filled', label: 'filled' },
];
const paddingOpts = [
    { value: 'none', label: 'none' },
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];
const radiusOpts = [
    { value: 'none', label: 'none' },
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
    { value: 'full', label: 'full' },
];

const propsList: PropDoc[] = [
    { name: 'variant', type: "'elevated' | 'outlined' | 'filled'", default: "'elevated'", description: 'Estilo visual.' },
    { name: 'padding', type: "'none' | 'small' | 'medium' | 'large'", default: "'medium'", description: 'Padding interno.' },
    { name: 'radius', type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: 'Radio de borde (hereda del provider).' },
    { name: 'interactive', type: 'boolean', default: 'false', description: 'Cursor pointer y hover state.' },
];
const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido del card.' },
    { name: 'header', description: 'Cabecera opcional.' },
    { name: 'footer', description: 'Footer opcional con acciones.' },
];
</script>

<template>
    <DocPage
        title="Card"
        category="Data display"
        import-path="import Card from '@/components/data-display/Card.vue'"
        description="Contenedor estructural con tres variantes (elevated, outlined, filled), control de padding y radius. Útil como bloque base para listados, métricas y secciones."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #examples>
            <Example title="Variantes">
                <Card variant="elevated" padding="medium" class="w-48">Elevated</Card>
                <Card variant="outlined" padding="medium" class="w-48">Outlined</Card>
                <Card variant="filled" padding="medium" class="w-48">Filled</Card>
            </Example>

            <Example title="Padding">
                <Card variant="outlined" padding="none" class="w-32">none</Card>
                <Card variant="outlined" padding="small" class="w-32">small</Card>
                <Card variant="outlined" padding="medium" class="w-32">medium</Card>
                <Card variant="outlined" padding="large" class="w-32">large</Card>
            </Example>

            <Example title="Con header y footer">
                <Card variant="outlined" padding="medium" class="w-72">
                    <template #header>
                        <Typography variant="title" size="small">Plan Pro</Typography>
                    </template>
                    <Typography variant="body">$29 / mes con todas las funciones.</Typography>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <Button variant="ghost" size="small">Cancelar</Button>
                            <Button color="primary" size="small">Suscribir</Button>
                        </div>
                    </template>
                </Card>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[160px] flex items-center justify-center">
                        <Card
                            :variant="variant"
                            :padding="padding"
                            :radius="radius"
                            :interactive="interactive"
                            class="w-72"
                        >
                            <Typography variant="title" size="small">Card de ejemplo</Typography>
                            <Typography variant="body" color="muted">
                                Modifica los controles a la derecha para ver los cambios.
                            </Typography>
                        </Card>
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Variant</Typography>
                            <Select v-model="variant" :options="variantOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Padding</Typography>
                            <Select v-model="padding" :options="paddingOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Radius</Typography>
                            <Select v-model="radius" :options="radiusOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Interactive</Typography>
                            <Switch v-model="interactive" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
