<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import DropdownMenu from '../../../components/navigation/DropdownMenu.vue';
import {
    PencilSquareIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    UserIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline';
import type { DropdownMenuEntry } from '../../../interfaces/navigation/DropdownMenu.interface';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgPlacement = ref<'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'>('bottom-start');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');

function resetPlayground() {
    pgPlacement.value = 'bottom-start';
    pgSize.value      = 'medium';
}

const playgroundItems: DropdownMenuEntry[] = [
    { id: 'edit',   label: 'Editar',   icon: PencilSquareIcon },
    { id: 'dup',    label: 'Duplicar', icon: DocumentDuplicateIcon },
    { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgPlacement.value !== 'bottom-start') parts.push(`placement="${pgPlacement.value}"`);
    if (pgSize.value      !== 'medium')       parts.push(`size="${pgSize.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<DropdownMenu trigger-label="Acciones" :items="items"${attrs} />`;
});

// ── Example data ──────────────────────────────────────────────────────────────
const basicItems: DropdownMenuEntry[] = [
    { id: 'edit',   label: 'Editar' },
    { id: 'dup',    label: 'Duplicar' },
    { id: 'export', label: 'Exportar' },
];

const iconItems: DropdownMenuEntry[] = [
    { id: 'edit',   label: 'Editar',   icon: PencilSquareIcon, shortcut: '⌘E' },
    { id: 'dup',    label: 'Duplicar', icon: DocumentDuplicateIcon, shortcut: '⌘D' },
    { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon, description: 'Descargar como JSON' },
];

const dividerItems: DropdownMenuEntry[] = [
    { type: 'header', label: 'Acciones' },
    { id: 'edit',   label: 'Editar',   icon: PencilSquareIcon },
    { id: 'dup',    label: 'Duplicar', icon: DocumentDuplicateIcon },
    { type: 'divider' },
    { id: 'open',   label: 'Abrir en nueva pestaña', icon: ArrowTopRightOnSquareIcon, href: '#', external: true },
];

const userMenuItems: DropdownMenuEntry[] = [
    { type: 'header', label: 'modo@ejemplo.com' },
    { id: 'profile',  label: 'Mi perfil',     icon: UserIcon },
    { id: 'settings', label: 'Preferencias',  icon: Cog6ToothIcon },
    { type: 'divider' },
    { id: 'logout',   label: 'Cerrar sesión', icon: ArrowRightOnRectangleIcon },
];

const dangerItems: DropdownMenuEntry[] = [
    { id: 'edit',   label: 'Editar',   icon: PencilSquareIcon },
    { id: 'dup',    label: 'Duplicar', icon: DocumentDuplicateIcon },
    { type: 'divider' },
    { id: 'delete', label: 'Eliminar', icon: TrashIcon, danger: true, shortcut: '⌫' },
];

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `const items = [
    { id: 'edit',   label: 'Editar' },
    { id: 'dup',    label: 'Duplicar' },
    { id: 'export', label: 'Exportar' },
];

<DropdownMenu trigger-label="Acciones" :items="items" />`;

const iconsCode = `const items = [
    { id: 'edit',   label: 'Editar',   icon: PencilSquareIcon, shortcut: '⌘E' },
    { id: 'dup',    label: 'Duplicar', icon: DocumentDuplicateIcon, shortcut: '⌘D' },
    { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon, description: 'Descargar como JSON' },
];

<DropdownMenu trigger-label="Acciones" :items="items" />`;

const dividersCode = `const items = [
    { type: 'header', label: 'Acciones' },
    { id: 'edit', label: 'Editar', icon: PencilSquareIcon },
    { id: 'dup',  label: 'Duplicar', icon: DocumentDuplicateIcon },
    { type: 'divider' },
    { id: 'open', label: 'Abrir en nueva pestaña', icon: ArrowTopRightOnSquareIcon, href: '#', external: true },
];

<DropdownMenu trigger-label="Más" :items="items" />`;

const userMenuCode = `const items = [
    { type: 'header', label: 'modo@ejemplo.com' },
    { id: 'profile',  label: 'Mi perfil',    icon: UserIcon },
    { id: 'settings', label: 'Preferencias', icon: Cog6ToothIcon },
    { type: 'divider' },
    { id: 'logout',   label: 'Cerrar sesión', icon: ArrowRightOnRectangleIcon },
];

<DropdownMenu trigger-label="modo@ejemplo.com" :items="items" trigger-variant="ghost" />`;

const dangerCode = `const items = [
    { id: 'edit',   label: 'Editar',   icon: PencilSquareIcon },
    { id: 'dup',    label: 'Duplicar', icon: DocumentDuplicateIcon },
    { type: 'divider' },
    { id: 'delete', label: 'Eliminar', icon: TrashIcon, danger: true, shortcut: '⌫' },
];

<DropdownMenu trigger-label="Acciones" :items="items" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'items',             type: 'DropdownMenuEntry[]',                                       required: true,         description: 'Lista heterogénea de items, headers y dividers.' },
    { name: 'triggerLabel',      type: 'string',                                                                            description: 'Texto del trigger por defecto. Ignorado si usas el slot `#trigger`.' },
    { name: 'triggerIcon',       type: 'Component',                                                                         description: 'Icono opcional del trigger por defecto.' },
    { name: 'triggerVariant',    type: "'normal' | 'outline' | 'ghost' | 'text'",                   default: "'outline'",   description: 'Variante del Button usado como trigger.' },
    { name: 'color',             type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",  default: "'default'",   description: 'Color del trigger por defecto.' },
    { name: 'size',              type: "'small' | 'medium' | 'large'",                              default: "'medium'",    description: 'Tamaño del trigger y de los items del menú.' },
    { name: 'radius',            type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                    description: 'Radio aplicado a trigger y panel.' },
    { name: 'showChevron',       type: 'boolean',                                                   default: 'true',        description: 'Muestra un chevron en el trigger por defecto.' },
    { name: 'placement',         type: "'bottom-start' | 'bottom-end' | 'bottom-center' | 'top-start' | 'top-end' | 'top-center'", default: "'bottom-start'", description: 'Posición del panel respecto al trigger.' },
    { name: 'matchTriggerWidth', type: 'boolean',                                                   default: 'false',       description: 'Fuerza al panel a tener el mismo ancho que el trigger.' },
    { name: 'minWidth',          type: 'string',                                                    default: "'12rem'",     description: 'Ancho mínimo del panel (CSS length).' },
    { name: 'disabled',          type: 'boolean',                                                   default: 'false',       description: 'Deshabilita el menú completo.' },
    { name: 'closeOnSelect',     type: 'boolean',                                                   default: 'true',        description: 'Cierra el menú tras seleccionar un item no deshabilitado.' },
    { name: 'ariaLabel',         type: 'string',                                                                            description: 'Etiqueta accesible aplicada al panel.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:open', payload: 'boolean',          description: 'Emitido cuando el menú se abre o se cierra.' },
    { name: 'select',      payload: 'DropdownMenuItem', description: 'Emitido al activar un item (click o teclado), no se dispara para headers/dividers.' },
];

const slotsList: SlotDoc[] = [
    { name: 'trigger', bindings: '{ open, toggle }', description: 'Sustituye el trigger por defecto. Útil para envolver un Avatar u otro componente.' },
];
</script>

<template>
    <ComponentDoc
        title="DropdownMenu"
        category="Navigation"
        import-path="import { DropdownMenu } from 'mood-ui'"
        description="Menú flotante de acciones con headers, dividers, atajos de teclado, descripciones, items destructivos y enlaces externos."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="260px" @reset="resetPlayground">
                <template #controls>
                    <!-- Placement -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Placement</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="p in ['bottom-start', 'bottom-end', 'top-start', 'top-end']"
                                :key="p"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgPlacement === p
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgPlacement = (p as typeof pgPlacement)"
                            >{{ p }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Size -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>
                </template>

                <DropdownMenu
                    trigger-label="Acciones"
                    :items="playgroundItems"
                    :placement="pgPlacement"
                    :size="pgSize"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Menú mínimo: una lista de items con label. El trigger por defecto usa el componente Button."
                :code="basicCode"
                min-height="220px"
            >
                <DropdownMenu trigger-label="Acciones" :items="basicItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos y atajos"
                description="Cada item soporta `icon`, `shortcut` y `description` opcionales para enriquecer la lectura."
                :code="iconsCode"
                min-height="240px"
            >
                <DropdownMenu trigger-label="Acciones" :items="iconItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Con headers y dividers"
                description="Agrupa items con entradas tipo `header` y separa secciones con `divider`."
                :code="dividersCode"
                min-height="260px"
            >
                <DropdownMenu trigger-label="Más" :items="dividerItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Menú de usuario"
                description="Patrón habitual: header con email, opciones y un divider antes de cerrar sesión."
                :code="userMenuCode"
                min-height="280px"
            >
                <DropdownMenu
                    trigger-label="modo@ejemplo.com"
                    :items="userMenuItems"
                    trigger-variant="ghost"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Item destructivo"
                description="Marca un item como `danger` para teñirlo del color destructivo y reforzar acciones irreversibles."
                :code="dangerCode"
                min-height="240px"
            >
                <DropdownMenu trigger-label="Acciones" :items="dangerItems" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
