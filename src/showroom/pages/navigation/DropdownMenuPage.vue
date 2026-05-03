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
import DropdownMenu from '../../../components/navigation/DropdownMenu.vue';
import {
    PencilSquareIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    UserIcon,
} from '@heroicons/vue/24/outline';
import type { DropdownMenuEntry } from '../../../interfaces/navigation/DropdownMenu.interface';
import type { PropDoc } from '../../types';

const items: DropdownMenuEntry[] = [
    { type: 'header', label: 'Acciones' },
    { id: 'edit', label: 'Editar', icon: PencilSquareIcon, shortcut: '⌘E' },
    { id: 'dup', label: 'Duplicar', icon: DocumentDuplicateIcon, shortcut: '⌘D' },
    { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon, description: 'Descargar como JSON' },
    { type: 'divider' },
    { id: 'open', label: 'Abrir en nueva pestaña', icon: ArrowTopRightOnSquareIcon, href: '#', external: true },
    { type: 'divider' },
    { id: 'delete', label: 'Eliminar', icon: TrashIcon, danger: true, shortcut: '⌫' },
];

const userItems: DropdownMenuEntry[] = [
    { type: 'header', label: 'modo@ejemplo.com' },
    { id: 'profile', label: 'Mi perfil', icon: UserIcon },
    { id: 'settings', label: 'Preferencias' },
    { type: 'divider' },
    { id: 'logout', label: 'Cerrar sesión', danger: true },
];

// playground
const triggerLabel = ref('Acciones');
const triggerVariant = ref<'normal' | 'outline' | 'ghost' | 'text'>('outline');
const color = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const size = ref<'small' | 'medium' | 'large'>('medium');
const radius = ref<'none' | 'small' | 'medium' | 'large' | 'full'>('medium');
const showChevron = ref(true);
const matchTriggerWidth = ref(false);

const variantOpts = [
    { value: 'normal', label: 'normal' },
    { value: 'outline', label: 'outline' },
    { value: 'ghost', label: 'ghost' },
    { value: 'text', label: 'text' },
];
const colorOpts = [
    { value: 'default', label: 'default' },
    { value: 'primary', label: 'primary' },
    { value: 'success', label: 'success' },
    { value: 'warning', label: 'warning' },
    { value: 'danger', label: 'danger' },
];
const sizeOpts = [
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
    { name: 'items', type: 'DropdownMenuEntry[]', required: true, description: 'Item, divider o header.' },
    { name: 'triggerLabel', type: 'string' },
    { name: 'triggerIcon', type: 'Component' },
    { name: 'triggerVariant', type: "'normal' | 'outline' | 'ghost' | 'text'", default: "'outline'" },
    { name: 'color', type: "'default' | 'primary' | 'danger' | 'success' | 'warning'" },
    { name: 'size', type: "'small' | 'medium' | 'large'", default: "'medium'" },
    { name: 'radius', type: "'none' | 'small' | 'medium' | 'large' | 'full'" },
    { name: 'showChevron', type: 'boolean', default: 'true' },
    { name: 'matchTriggerWidth', type: 'boolean', default: 'false' },
    { name: 'placement', type: 'PopoverPlacement' },
    { name: 'minWidth', type: 'string' },
    { name: 'disabled', type: 'boolean', default: 'false' },
];
</script>

<template>
    <DocPage
        title="DropdownMenu"
        category="Navigation"
        import-path="import DropdownMenu from '@/components/navigation/DropdownMenu.vue'"
        description="Menú flotante de acciones con headers, dividers, atajos de teclado, descripción opcional, items destructivos y enlaces externos."
        :props-list="propsList"
    >
        <template #examples>
            <Example title="Default">
                <DropdownMenu trigger-label="Acciones" :items="items" />
            </Example>

            <Example title="Variantes del trigger">
                <DropdownMenu trigger-label="Normal" :items="items" trigger-variant="normal" color="primary" />
                <DropdownMenu trigger-label="Outline" :items="items" trigger-variant="outline" />
                <DropdownMenu trigger-label="Ghost" :items="items" trigger-variant="ghost" />
                <DropdownMenu trigger-label="Text" :items="items" trigger-variant="text" />
            </Example>

            <Example title="Menú de usuario">
                <DropdownMenu trigger-label="modo@ejemplo.com" :items="userItems" trigger-variant="ghost" />
            </Example>
        </template>

        <template #playground>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card variant="outlined" padding="large" class="lg:col-span-2">
                    <div class="min-h-[200px] flex items-center justify-center">
                        <DropdownMenu
                            :items="items"
                            :trigger-label="triggerLabel"
                            :trigger-variant="triggerVariant"
                            :color="color"
                            :size="size"
                            :radius="radius"
                            :show-chevron="showChevron"
                            :match-trigger-width="matchTriggerWidth"
                        />
                    </div>
                </Card>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="medium">
                        <Typography variant="title" size="small">Controles</Typography>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Trigger label</Typography>
                            <Input v-model="triggerLabel" size="small" />
                        </label>
                        <label class="flex flex-col gap-1">
                            <Typography variant="caption" color="muted">Trigger variant</Typography>
                            <Select v-model="triggerVariant" :options="variantOpts" size="small" />
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
                            <Typography variant="caption" color="muted">Show chevron</Typography>
                            <Switch v-model="showChevron" />
                        </label>
                        <label class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">Match trigger width</Typography>
                            <Switch v-model="matchTriggerWidth" />
                        </label>
                    </Stack>
                </Card>
            </div>
        </template>
    </DocPage>
</template>
