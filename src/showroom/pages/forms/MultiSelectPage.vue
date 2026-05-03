<script setup lang="ts">
import { ref } from 'vue';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Select from '../../../components/forms/Select.vue';
import Switch from '../../../components/forms/Switch.vue';
import MultiSelect from '../../../components/forms/MultiSelect.vue';
import type { PropDoc } from '../../types';

const v = ref<(string | number)[]>(['vue', 'react']);
const v2 = ref<(string | number)[]>([]);

const opts = [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'angular', label: 'Angular' },
    { value: 'solid', label: 'Solid' },
    { value: 'qwik', label: 'Qwik' },
];

// playground
const variant = ref<'outline' | 'filled' | 'ghost'>('outline');
const size = ref<'small' | 'medium' | 'large'>('medium');
const color = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const clearable = ref(true);
const searchable = ref(true);
const showSelectAll = ref(true);
const maxVisibleChips = ref<number>(3);

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
const chipsOpts = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
];

const propsList: PropDoc[] = [
    { name: 'options', type: 'SelectOption[]', required: true },
    { name: 'modelValue', type: 'SelectValue[]', default: '[]' },
    { name: 'searchable', type: 'boolean', default: 'false' },
    { name: 'showSelectAll', type: 'boolean', default: 'false' },
    { name: 'clearable', type: 'boolean', default: 'false' },
    { name: 'maxVisibleChips', type: 'number', default: '3', description: 'Después de N muestra “+N more”.' },
    { name: 'variant / color / size / radius / halo', type: 'token', description: 'Hereda del provider.' },
];
</script>

<template>
    <DocPage
        title="MultiSelect"
        category="Forms"
        import-path="import MultiSelect from '@/components/forms/MultiSelect.vue'"
        description="Selección múltiple con chips, búsqueda integrada y opción de seleccionar / deseleccionar todo."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <MultiSelect v-model="v" :options="opts" label="Tecnologías" class="w-72" />
            </Example>

            <Example title="Searchable + select all">
                <MultiSelect
                    v-model="v2"
                    :options="opts"
                    searchable
                    show-select-all
                    placeholder="Selecciona uno o varios"
                    class="w-72"
                />
            </Example>

            <Example title="Disabled">
                <MultiSelect :model-value="['vue']" :options="opts" disabled class="w-72" />
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[180px] flex items-center justify-center">
                        <MultiSelect
                            v-model="v"
                            :options="opts"
                            :variant="variant"
                            :color="color"
                            :size="size"
                            :clearable="clearable"
                            :searchable="searchable"
                            :show-select-all="showSelectAll"
                            :max-visible-chips="maxVisibleChips"
                            class="w-80"
                        />
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
                            <Typography variant="caption" color="muted">Color</Typography>
                            <Select v-model="color" :options="colorOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Size</Typography>
                            <Select v-model="size" :options="sizeOpts" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Max visible chips</Typography>
                            <Select v-model="maxVisibleChips" :options="chipsOpts" size="small" />
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
                            <Typography variant="caption" color="muted">Show select all</Typography>
                            <Switch v-model="showSelectAll" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
