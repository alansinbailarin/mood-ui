<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import Input from '../../../components/forms/Input.vue';
import { GlobeAltIcon, BoltIcon, CodeBracketIcon } from '@heroicons/vue/24/outline';
import type { PropDoc } from '../../types';

const v = ref<string | number | null>('vue');
const v2 = ref<string | number | null>(null);
const v3 = ref<string | number | null>('vue');

const opts = [
    { value: 'vue', label: 'Vue', icon: BoltIcon },
    { value: 'react', label: 'React', icon: CodeBracketIcon },
    { value: 'svelte', label: 'Svelte', icon: GlobeAltIcon },
    { value: 'angular', label: 'Angular', icon: CodeBracketIcon },
    { value: 'solid', label: 'Solid', icon: BoltIcon, disabled: true },
];

const grouped = [
    { value: 'es', label: 'Español', group: 'Europa' },
    { value: 'fr', label: 'Francés', group: 'Europa' },
    { value: 'de', label: 'Alemán', group: 'Europa' },
    { value: 'en', label: 'Inglés', group: 'América' },
    { value: 'pt', label: 'Portugués', group: 'América' },
    { value: 'ja', label: 'Japonés', group: 'Asia' },
    { value: 'zh', label: 'Chino', group: 'Asia' },
];

// playground
const variant = ref<'outline' | 'filled' | 'ghost'>('outline');
const size = ref<'small' | 'medium' | 'large'>('medium');
const color = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const radius = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');
const placeholder = ref('Selecciona…');
const clearable = ref(true);
const searchable = ref(true);
const disabled = ref(false);
const loading = ref(false);
const fullWidth = ref(false);

const variantOpts = [
    { value: 'outline', label: 'outline' },
    { value: 'filled', label: 'filled' },
    { value: 'ghost', label: 'ghost' },
];
const sizeOpts = [
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];
const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'primary', label: 'primary' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
    { value: 'danger', label: 'danger' },
];
const radiusOpts = [
    { value: 'none', label: 'none' },
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
    { value: 'full', label: 'full' },
];

const propsList: PropDoc[] = [
    { name: 'options', type: 'SelectOption[]', required: true, description: 'Opciones disponibles. Soporta `description`, `icon`, `disabled` y `group`.' },
    { name: 'modelValue', type: 'string | number | null' },
    { name: 'variant', type: "'outline' | 'filled' | 'ghost'", default: "'outline'" },
    { name: 'color', type: "'default' | 'primary' | 'danger' | 'success' | 'warning'" },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'searchable', type: 'boolean', default: 'false' },
    { name: 'placeholder', type: 'string' },
    { name: 'helperText / errorText', type: 'string' },
    { name: 'disabled / loading / readonly / required', type: 'boolean' },
    { name: 'fullWidth', type: 'boolean', default: 'false' },
];
</script>

<template>
    <DocPage
        title="Select"
        category="Forms"
        import-path="import Select from '@/components/forms/Select.vue'"
        description="Select de un solo valor con búsqueda integrada, opciones agrupadas, iconos por opción, descripción y todas las variantes visuales del Input."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <Select v-model="v" :options="opts" label="Framework" class="w-64" />
            </Example>

            <Example title="Searchable + clearable">
                <Select v-model="v2" :options="opts" searchable clearable placeholder="Busca un framework" class="w-64" />
            </Example>

            <Example title="Opciones agrupadas">
                <Select v-model="v3" :options="grouped" label="Idioma" class="w-64" />
            </Example>

            <Example title="Variantes">
                <Select :model-value="'vue'" :options="opts" variant="outline" class="w-48" />
                <Select :model-value="'vue'" :options="opts" variant="filled" class="w-48" />
                <Select :model-value="'vue'" :options="opts" variant="ghost" class="w-48" />
            </Example>

            <Example title="Estados">
                <Select :model-value="'vue'" :options="opts" disabled class="w-48" />
                <Select :model-value="'vue'" :options="opts" loading class="w-48" />
                <Select :model-value="'vue'" :options="opts" error-text="Selección inválida" class="w-48" />
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[160px] flex items-center justify-center">
                        <Select
                            v-model="v"
                            :options="opts"
                            :variant="variant"
                            :color="color"
                            :size="size"
                            :radius="radius"
                            :placeholder="placeholder"
                            :clearable="clearable"
                            :searchable="searchable"
                            :disabled="disabled"
                            :loading="loading"
                            :full-width="fullWidth"
                            :class="fullWidth ? 'w-full' : 'w-72'"
                        />
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Placeholder</Typography>
                            <Input v-model="placeholder" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Variant</Typography>
                            <Select v-model="variant" :options="variantOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="color" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="size" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Radius</Typography>
                            <Select v-model="radius" :options="radiusOpts" size="small" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Clearable</Typography>
                            <Switch v-model="clearable" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Searchable</Typography>
                            <Switch v-model="searchable" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Disabled</Typography>
                            <Switch v-model="disabled" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Loading</Typography>
                            <Switch v-model="loading" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Full width</Typography>
                            <Switch v-model="fullWidth" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
