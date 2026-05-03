<script setup lang="ts">
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Stack from '../../../components/layout/Stack.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';
import DropdownMenu from '../../../components/navigation/DropdownMenu.vue';
import Select from '../../../components/forms/Select.vue';
import Button from '../../../components/forms/Button.vue';
import { ref } from 'vue';
import type { PropDoc } from '../../types';

const v = ref<string | number | null>('vue');
const opts = [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
    { value: 'svelte', label: 'Svelte' },
];

const propsList: PropDoc[] = [
    { name: 'open', type: 'boolean', required: true, description: 'Controla la visibilidad del panel.' },
    { name: 'style', type: 'Record<string, string>', description: 'Top/left/width/zIndex calculados por `usePopover`.' },
    { name: 'radius', type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: 'Si no se pasa, hereda del provider.' },
    { name: 'role', type: 'string', default: "'dialog'", description: 'ARIA role.' },
    { name: 'labelledBy', type: 'string', description: 'Id del elemento que nombra al panel.' },
];
</script>

<template>
    <DocPage
        title="PopoverPanel"
        category="Layout"
        import-path="import PopoverPanel from '@/components/layout/PopoverPanel.vue'"
        description="Primitiva interna usada por componentes flotantes (Select, MultiSelect, DropdownMenu, Tooltip, DateField, Combobox…). No suele usarse de forma directa: aquí mostramos los componentes que la consumen."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Tooltip (usa PopoverPanel)">
                <Tooltip text="Soy un popover anclado al trigger" trigger="click">
                    <Button variant="outline">Click me</Button>
                </Tooltip>
            </Example>

            <Example title="Select (usa PopoverPanel)">
                <Select v-model="v" :options="opts" class="w-56" />
            </Example>

            <Example title="DropdownMenu (usa PopoverPanel)">
                <DropdownMenu
                    trigger-label="Acciones"
                    :items="[
                        { id: 1, label: 'Editar' },
                        { id: 2, label: 'Duplicar' },
                        { type: 'divider' },
                        { id: 3, label: 'Eliminar', danger: true },
                    ]"
                />
            </Example>
        </template>

        <template #playground>
            <Card variant="outlined" padding="large">
                <Stack direction="column" spacing="medium">
                    <Typography variant="title" size="small">¿Cómo se usa directamente?</Typography>
                    <Typography color="muted">
                        Combina <code>usePopover</code> (que provee <code>style</code>, <code>open</code>,
                        <code>panelRef</code>) con <code>&lt;PopoverPanel&gt;</code> dentro de un <code>&lt;Teleport to="body"&gt;</code>.
                        Para casos comunes (menús, selects, tooltips) usa los componentes de alto nivel que ya lo integran.
                    </Typography>
                </Stack>
            </Card>
        </template>
    </DocPage>
</template>
