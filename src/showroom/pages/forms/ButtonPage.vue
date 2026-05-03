<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Button from '../../../components/forms/Button.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Input from '../../../components/forms/Input.vue';
import { HeartIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// Playground state
const pgVariant = ref<'normal' | 'outline' | 'ghost' | 'text'>('normal');
const pgColor = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const pgSize = ref<'xs' | 'small' | 'medium' | 'large'>('medium');
const pgLabel = ref('Click me');
const pgLoading = ref(false);
const pgDisabled = ref(false);
const pgFullWidth = ref(false);

const variantOpts = [
    { value: 'normal', label: 'normal' },
    { value: 'outline', label: 'outline' },
    { value: 'ghost', label: 'ghost' },
    { value: 'text', label: 'text' },
];
const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'primary', label: 'primary' },
    { value: 'danger', label: 'danger' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
];
const sizeOpts = [
    { value: 'xs', label: 'xs' },
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];

const props: PropDoc[] = [
    { name: 'label', type: 'string', description: 'Texto del botón.' },
    { name: 'variant', type: "'normal' | 'outline' | 'ghost' | 'text'", default: "'normal'", description: 'Variante visual.' },
    { name: 'color', type: "'default' | 'primary' | 'danger' | 'success' | 'warning'", default: "'default'", description: 'Color semántico.' },
    { name: 'size', type: "'xs' | 'small' | 'medium' | 'large'", default: "'medium'", description: 'Tamaño visual.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Muestra spinner y deshabilita el botón.' },
    { name: 'loadingText', type: 'string', description: 'Texto opcional mientras carga.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Deshabilita el botón.' },
    { name: 'icon', type: 'Component', description: 'Icono a renderizar (heroicons o cualquier componente).' },
    { name: 'iconPosition', type: "'left' | 'right'", default: "'left'", description: 'Posición del icono.' },
    { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Ocupa todo el ancho disponible.' },
    { name: 'ariaLabel', type: 'string', description: 'Label accesible para botones icon-only.' },
];

const emits: EmitDoc[] = [
    { name: 'click', payload: 'MouseEvent', description: 'Emitido al hacer click cuando no está deshabilitado ni cargando.' },
];

const slots: SlotDoc[] = [
    { name: 'default', description: 'Contenido del botón. Si está vacío usa la prop `label`.' },
];
</script>

<template>
    <DocPage
        title="Button"
        category="Forms"
        import-path="import Button from '@/components/forms/Button.vue'"
        description="El botón es la acción primaria de cualquier interfaz: tiene cuatro variantes, cinco colores semánticos, cuatro tamaños y soporta iconos, estado de carga y modo full-width."
        :props-list="props"
        :emits-list="emits"
        :slots-list="slots"
    >
        <template #examples>
            <Example title="Variantes" description="Cuatro estilos visuales para distintos niveles de jerarquía.">
                <Button variant="normal" color="primary">Normal</Button>
                <Button variant="outline" color="primary">Outline</Button>
                <Button variant="ghost" color="primary">Ghost</Button>
                <Button variant="text" color="primary">Text</Button>
            </Example>

            <Example title="Colores" description="Mapean al sistema de colores semánticos del provider.">
                <Button color="default">Default</Button>
                <Button color="primary">Primary</Button>
                <Button color="success">Success</Button>
                <Button color="warning">Warning</Button>
                <Button color="danger">Danger</Button>
            </Example>

            <Example title="Tamaños" description="Cuatro escalas: xs, small, medium y large.">
                <Button size="xs" color="primary">XS</Button>
                <Button size="small" color="primary">Small</Button>
                <Button size="medium" color="primary">Medium</Button>
                <Button size="large" color="primary">Large</Button>
            </Example>

            <Example title="Con iconos" description="Acepta cualquier componente icon en `left` o `right`.">
                <Button :icon="HeartIcon" color="danger" variant="outline">Me gusta</Button>
                <Button :icon="ArrowRightIcon" icon-position="right" color="primary">Continuar</Button>
                <Button :icon="HeartIcon" color="primary" aria-label="Like" />
            </Example>

            <Example title="Estados" description="Loading y disabled.">
                <Button loading color="primary">Guardando…</Button>
                <Button loading loading-text="Procesando" color="primary">Enviar</Button>
                <Button disabled color="primary">Disabled</Button>
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[160px] flex items-center justify-center">
                        <Button
                            :variant="pgVariant"
                            :color="pgColor"
                            :size="pgSize"
                            :loading="pgLoading"
                            :disabled="pgDisabled"
                            :full-width="pgFullWidth"
                        >
                            {{ pgLabel || 'Button' }}
                        </Button>
                    </div>
                </Card>

                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Label</Typography>
                            <Input v-model="pgLabel" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Variant</Typography>
                            <Select v-model="pgVariant" :options="variantOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="pgColor" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="pgSize" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Loading</Typography>
                            <Switch v-model="pgLoading" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Disabled</Typography>
                            <Switch v-model="pgDisabled" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Full width</Typography>
                            <Switch v-model="pgFullWidth" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
