<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Input from '../../../components/forms/Input.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import { EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import type { PropDoc } from '../../types';

const v = ref('');
const errored = ref('not-an-email');

const pgVariant = ref<'outline' | 'filled' | 'ghost'>('outline');
const pgColor = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const pgSize = ref<'small' | 'medium' | 'large'>('medium');
const pgPlaceholder = ref('Escribe algo…');
const pgLabel = ref('Mi campo');
const pgHint = ref('Texto de ayuda opcional');
const pgError = ref('');
const pgDisabled = ref(false);
const pgReadonly = ref(false);
const pgClearable = ref(true);
const pgValue = ref('');

const variantOpts = [
    { value: 'outline', label: 'outline' },
    { value: 'filled', label: 'filled' },
    { value: 'ghost', label: 'ghost' },
];
const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'primary', label: 'primary' },
    { value: 'danger', label: 'danger' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
];
const sizeOpts = [
    { value: 'small', label: 'small' },
    { value: 'medium', label: 'medium' },
    { value: 'large', label: 'large' },
];

const props: PropDoc[] = [
    { name: 'modelValue', type: 'string | number', description: 'Valor del input (v-model).' },
    { name: 'label', type: 'string', description: 'Etiqueta visible.' },
    { name: 'placeholder', type: 'string', description: 'Placeholder cuando está vacío.' },
    { name: 'hint', type: 'string', description: 'Texto auxiliar bajo el input.' },
    { name: 'errorText', type: 'string', description: 'Mensaje de error que marca el input como inválido.' },
    { name: 'variant', type: "'outline' | 'filled' | 'ghost'", default: "'outline'", description: 'Estilo visual del campo.' },
    { name: 'color', type: "'default' | 'primary' | ...", default: "'default'", description: 'Color semántico del foco.' },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'", description: 'Tamaño visual.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Deshabilita el input.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Solo lectura.' },
    { name: 'clearable', type: 'boolean', default: 'false', description: 'Muestra botón ✕ para limpiar.' },
    { name: 'iconLeft / iconRight', type: 'Component', description: 'Iconos en cada lado.' },
    { name: 'prefix / suffix', type: 'string', description: 'Texto adyacente al input.' },
];
</script>

<template>
    <DocPage
        title="Input"
        category="Forms"
        import-path="import Input from '@/components/forms/Input.vue'"
        description="Input de texto polimórfico con label, hint, mensajes de error, iconos, prefijos/sufijos y tres variantes visuales."
        :props-list="props"
    >
        <template #examples>
            <Example title="Default" description="Input simple con label y placeholder.">
                <Input v-model="v" label="Email" placeholder="tu@email.com" class="w-72" />
            </Example>

            <Example title="Variantes" description="outline (default), filled y ghost.">
                <Input variant="outline" placeholder="outline" class="w-48" />
                <Input variant="filled" placeholder="filled" class="w-48" />
                <Input variant="ghost" placeholder="ghost" class="w-48" />
            </Example>

            <Example title="Tamaños">
                <Input size="small" placeholder="small" class="w-48" />
                <Input size="medium" placeholder="medium" class="w-48" />
                <Input size="large" placeholder="large" class="w-48" />
            </Example>

            <Example title="Iconos y affixes" description="iconLeft, iconRight, prefix, suffix.">
                <Input :icon-left="EnvelopeIcon" placeholder="Email" class="w-64" />
                <Input :icon-right="MagnifyingGlassIcon" placeholder="Buscar" class="w-64" />
                <Input prefix="$" suffix="USD" placeholder="0.00" class="w-48" />
            </Example>

            <Example title="Estados" description="disabled, readonly y error.">
                <Input disabled placeholder="Disabled" class="w-48" />
                <Input readonly model-value="Solo lectura" class="w-48" />
                <Input v-model="errored" error-text="Email inválido" label="Email" class="w-64" />
            </Example>

            <Example title="Clearable">
                <Input v-model="v" clearable placeholder="Escribe y limpia" class="w-64" />
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <Input
                        v-model="pgValue"
                        :variant="pgVariant"
                        :color="pgColor"
                        :size="pgSize"
                        :label="pgLabel"
                        :placeholder="pgPlaceholder"
                        :hint="pgHint || undefined"
                        :error-text="pgError || undefined"
                        :disabled="pgDisabled"
                        :readonly="pgReadonly"
                        :clearable="pgClearable"
                    />
                </Card>

                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Label</Typography>
                            <Input v-model="pgLabel" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Placeholder</Typography>
                            <Input v-model="pgPlaceholder" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Hint</Typography>
                            <Input v-model="pgHint" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Error</Typography>
                            <Input v-model="pgError" size="small" placeholder="Vacío = sin error" />
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
                            <Typography variant="caption" color="muted">Disabled</Typography>
                            <Switch v-model="pgDisabled" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Readonly</Typography>
                            <Switch v-model="pgReadonly" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Clearable</Typography>
                            <Switch v-model="pgClearable" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
