<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Sidebar from '../../../components/layout/Sidebar.vue';
import { HomeIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, InboxIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const pgCollapsed = ref(false);
const pgVariant = ref<'tonal' | 'solid' | 'bar'>('tonal');
const pgColor = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');

function resetPlayground() {
    pgCollapsed.value = false;
    pgVariant.value = 'tonal';
    pgColor.value = 'primary';
}

const active = ref<string | number>('home');
const items = [
    { id: 'home',    label: 'Inicio',   icon: HomeIcon },
    { id: 'inbox',   label: 'Inbox',    icon: InboxIcon, badge: 4, badgeColor: 'primary' as const },
    { id: 'team',    label: 'Equipo',   icon: UsersIcon },
    { id: 'reports', label: 'Reportes', icon: ChartBarIcon },
];

const sectionsData = [
    {
        id: 'main',
        title: 'Principal',
        items: [
            { id: 'home',    label: 'Inicio',   icon: HomeIcon },
            { id: 'inbox',   label: 'Inbox',    icon: InboxIcon, badge: 4, badgeColor: 'primary' as const },
            { id: 'team',    label: 'Equipo',   icon: UsersIcon },
        ],
    },
    {
        id: 'cfg',
        title: 'Configuración',
        items: [
            { id: 'reports',  label: 'Reportes', icon: ChartBarIcon },
            { id: 'settings', label: 'Ajustes',  icon: Cog6ToothIcon },
        ],
    },
];

const colorDots = [
    { value: 'default'  as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary'  as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success'  as const, bg: '#22c55e',        label: 'Success' },
    { value: 'danger'   as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgCollapsed.value) parts.push('collapsed');
    if (pgVariant.value !== 'tonal') parts.push(`active-variant="${pgVariant.value}"`);
    if (pgColor.value !== 'default') parts.push(`color="${pgColor.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Sidebar
    :items="items"
    v-model:active-id="active"${attrs}
/>`;
});

const basicCode = `<Sidebar
    :items="items"
    v-model:active-id="active"
    color="primary"
/>`;

const collapsedCode = `<Sidebar :items="items" :active-id="active" collapsed />`;

const sectionsCode = `<Sidebar
    :sections="sections"
    v-model:active-id="active"
    color="primary"
/>`;

const footerCode = `<Sidebar :sections="sections" v-model:active-id="active">
    <template #footer="{ collapsed }">
        <button class="…">
            <ArrowRightOnRectangleIcon />
            <span v-if="!collapsed">Salir</span>
        </button>
    </template>
</Sidebar>`;

const propsList: PropDoc[] = [
    { name: 'sections',       type: 'SidebarSection[]',                                                 description: 'Secciones a renderizar (cada una con título e items).' },
    { name: 'items',          type: 'SidebarItem[]',                                                    description: 'Atajo: lista plana de items renderizada como sección anónima.' },
    { name: 'activeId',       type: 'string | number | null',                                           description: 'v-model del item activo.' },
    { name: 'collapsed',      type: 'boolean',                              default: 'false',           description: 'Modo icon-only: oculta labels, badges y sub-items.' },
    { name: 'size',           type: "'small' | 'medium' | 'large'",         default: "'medium'",        description: 'Tamaño visual de las filas.' },
    { name: 'radius',         type: "'none' | 'small' | 'medium' | 'large' | 'full'", default: 'provider', description: 'Radio del hit-area de las filas.' },
    { name: 'color',          type: "'default' | 'primary' | 'danger' | 'success' | 'warning'", default: "'default'", description: 'Color del estado activo.' },
    { name: 'activeVariant',  type: "'tonal' | 'solid' | 'bar'",            default: "'tonal'",         description: 'Cómo se renderiza el estado activo.' },
    { name: 'barSide',        type: "'start' | 'end'",                      default: "'start'",         description: 'Lado del accent bar (solo activeVariant="bar").' },
    { name: 'padding',        type: "'none' | 'small' | 'medium' | 'large'", default: "'medium'",       description: 'Padding alrededor de la lista interior.' },
    { name: 'dividers',       type: 'boolean',                              default: 'true',            description: 'Renderiza bordes entre header / body / footer.' },
    { name: 'ariaLabel',      type: 'string',                              default: "'Sidebar'",       description: 'Aria-label del nav raíz.' },
    { name: 'as',             type: 'string',                              default: "'nav'",           description: 'Etiqueta raíz a renderizar.' },
];

const emitsList: EmitDoc[] = [
    { name: 'select',           payload: 'SidebarItem', description: 'Emitido al activar un item.' },
    { name: 'update:activeId',  payload: 'string | number | null', description: 'v-model del item activo.' },
];

const slotsList: SlotDoc[] = [
    { name: 'header', bindings: '{ collapsed }', description: 'Contenido renderizado encima de las secciones (logo, brand…).' },
    { name: 'footer', bindings: '{ collapsed }', description: 'Contenido renderizado debajo de las secciones (logout, perfil…).' },
];
</script>

<template>
    <ComponentDoc
        title="Sidebar"
        category="Layout"
        import-path="import { Sidebar } from 'mood-ui'"
        description="Navegación lateral con secciones, items, iconos y badges. Soporta modo colapsado (solo iconos), items anidados y diferentes estilos de activo."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="380px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['tonal','solid','bar']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125' : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgCollapsed ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgCollapsed = !pgCollapsed"
                    >Collapsed</button>
                </template>

                <div
                    class="border border-border rounded-md overflow-hidden bg-card transition-[width] duration-200"
                    :class="pgCollapsed ? 'w-16' : 'w-64'"
                    style="height: 320px;"
                >
                    <Sidebar
                        :sections="sectionsData"
                        v-model:active-id="active"
                        :collapsed="pgCollapsed"
                        :active-variant="pgVariant"
                        :color="pgColor"
                    />
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Lista plana de items con activo controlado."
                :code="basicCode"
            >
                <div class="w-64 h-80 border border-border rounded-md overflow-hidden bg-card">
                    <Sidebar :items="items" v-model:active-id="active" color="primary" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Colapsado (rail)"
                description="Modo icon-only con tooltips automáticos en hover."
                :code="collapsedCode"
            >
                <div class="w-16 h-80 border border-border rounded-md overflow-hidden bg-card">
                    <Sidebar :items="items" :active-id="active" collapsed />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con secciones"
                description="Agrupa items bajo títulos para mejor organización."
                :code="sectionsCode"
            >
                <div class="w-64 h-80 border border-border rounded-md overflow-hidden bg-card">
                    <Sidebar :sections="sectionsData" v-model:active-id="active" color="primary" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con footer"
                description="Slot footer para botones de logout o perfil."
                :code="footerCode"
            >
                <div class="w-64 h-80 border border-border rounded-md overflow-hidden bg-card">
                    <Sidebar :sections="sectionsData" v-model:active-id="active" color="primary">
                        <template #footer="{ collapsed }">
                            <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                                <ArrowRightOnRectangleIcon class="size-4 shrink-0" />
                                <span v-if="!collapsed">Salir</span>
                            </button>
                        </template>
                    </Sidebar>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
