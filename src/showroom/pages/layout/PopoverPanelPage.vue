<script setup lang="ts">
import { ref } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';
import DropdownMenu from '../../../components/navigation/DropdownMenu.vue';
import Select from '../../../components/forms/Select.vue';
import Button from '../../../components/forms/Button.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const v = ref<string | number | null>('vue');
const opts = [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
    { value: 'svelte', label: 'Svelte' },
];

const overviewCode = `<!-- PopoverPanel es una primitiva interna.
     En la mayoría de casos usa los componentes que la integran: -->
<Tooltip text="Soy un popover anclado">
    <Button variant="outline">Hover me</Button>
</Tooltip>`;

const tooltipCode = `<Tooltip text="Soy un popover anclado al trigger" trigger="click">
    <Button variant="outline">Click me</Button>
</Tooltip>`;

const selectCode = `<Select
    v-model="value"
    :options="[
        { value: 'vue',    label: 'Vue' },
        { value: 'react',  label: 'React' },
        { value: 'svelte', label: 'Svelte' },
    ]"
    class="w-56"
/>`;

const dropdownCode = `<DropdownMenu
    trigger-label="Acciones"
    :items="[
        { id: 1, label: 'Editar' },
        { id: 2, label: 'Duplicar' },
        { type: 'divider' },
        { id: 3, label: 'Eliminar', danger: true },
    ]"
/>`;

const directCode = `<!-- Uso directo (avanzado) — combina usePopover + PopoverPanel -->
<script setup lang="ts">
import { usePopover } from 'mood-ui';
import PopoverPanel from '@/components/layout/PopoverPanel.vue';

const { open, style, panelRef, triggerRef } = usePopover({ placement: 'bottom-start' });
</\u200bscript>

<template>
    <button ref="triggerRef" @click="open = !open">Trigger</button>
    <PopoverPanel :open="open" :style="style" @update:panel-ref="panelRef = $event">
        <div class="p-3">Contenido del popover</div>
    </PopoverPanel>
</template>`;

const propsList: PropDoc[] = [
    { name: 'open',       type: 'boolean',                                            required: true,  description: 'Controla la visibilidad del panel.' },
    { name: 'style',      type: 'Record<string, string>',                                              description: 'Estilo (top/left/width/zIndex) calculado por usePopover.' },
    { name: 'radius',     type: "'none' | 'small' | 'medium' | 'large' | 'full'",                     description: 'Radio de las esquinas. Si no se pasa, hereda del provider.' },
    { name: 'role',       type: 'string',                                              default: "'dialog'", description: 'ARIA role aplicado al panel.' },
    { name: 'labelledBy', type: 'string',                                                              description: 'Id del elemento que nombra al panel.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:panelRef', payload: 'HTMLElement | null', description: 'Emitido cuando el elemento raíz cambia. Necesario para que usePopover lo posicione.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido del panel flotante.' },
];
</script>

<template>
    <ComponentDoc
        title="PopoverPanel"
        category="Layout"
        import-path="import { PopoverPanel } from 'mood-ui'"
        description="Primitiva interna usada por componentes flotantes (Select, MultiSelect, DropdownMenu, Tooltip, DateField, Combobox…). Renderiza un panel teleportado al body con tema y palette del provider preservados."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="200px">
                <Tooltip text="Soy un popover anclado al trigger" trigger="hover">
                    <Button variant="outline">Hover me</Button>
                </Tooltip>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Tooltip"
                description="Tooltip usa PopoverPanel para su contenido."
                :code="tooltipCode"
            >
                <Tooltip text="Soy un popover anclado al trigger" trigger="click">
                    <Button variant="outline">Click me</Button>
                </Tooltip>
            </ComponentPreview>

            <ComponentPreview
                title="Select"
                description="El menú desplegable de Select renderiza dentro de un PopoverPanel."
                :code="selectCode"
            >
                <Select v-model="v" :options="opts" class="w-56" />
            </ComponentPreview>

            <ComponentPreview
                title="DropdownMenu"
                description="DropdownMenu encapsula trigger + PopoverPanel + items."
                :code="dropdownCode"
            >
                <DropdownMenu
                    trigger-label="Acciones"
                    :items="[
                        { id: 1, label: 'Editar' },
                        { id: 2, label: 'Duplicar' },
                        { type: 'divider' },
                        { id: 3, label: 'Eliminar', danger: true },
                    ]"
                />
            </ComponentPreview>

            <ComponentPreview
                title="Uso directo"
                description="Combina usePopover (open, style, panelRef) con PopoverPanel para casos no cubiertos por los componentes de alto nivel."
                :code="directCode"
            >
                <p class="text-sm text-muted-foreground text-center max-w-md">
                    Para casos comunes (menús, selects, tooltips) usa los componentes de alto nivel que ya integran <code class="font-mono text-foreground">PopoverPanel</code>.
                </p>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
