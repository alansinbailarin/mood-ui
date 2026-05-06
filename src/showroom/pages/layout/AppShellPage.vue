<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import AppShell from '../../../components/layout/AppShell.vue';
import Topbar from '../../../components/layout/Topbar.vue';
import Sidebar from '../../../components/layout/Sidebar.vue';
import { HomeIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon, InboxIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, SlotDoc } from '../../types';

const pgVariant = ref<'standard' | 'rail' | 'dual'>('standard');
const pgAppearance = ref<'flush' | 'contained'>('flush');
const pgCollapsed = ref(false);

function resetPlayground() {
    pgVariant.value = 'standard';
    pgAppearance.value = 'flush';
    pgCollapsed.value = false;
}

const active = ref<string | number>('home');
const items = [
    { id: 'home',    label: 'Inicio',   icon: HomeIcon },
    { id: 'inbox',   label: 'Inbox',    icon: InboxIcon, badge: 3, badgeColor: 'primary' as const },
    { id: 'team',    label: 'Equipo',   icon: UsersIcon },
    { id: 'reports', label: 'Reportes', icon: ChartBarIcon },
    { id: 'settings', label: 'Ajustes', icon: Cog6ToothIcon },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'standard') parts.push(`variant="${pgVariant.value}"`);
    if (pgAppearance.value !== 'flush') parts.push(`appearance="${pgAppearance.value}"`);
    if (pgCollapsed.value) parts.push('v-model:collapsed="collapsed"');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<AppShell${attrs}>
    <template #topbar><Topbar title="App" divider /></template>
    <template #sidebar><Sidebar :items="items" v-model:active-id="active" /></template>
    <main>Contenido…</main>
</AppShell>`;
});

const basicCode = `<AppShell>
    <template #topbar><Topbar title="Modo UI" divider /></template>
    <template #sidebar>
        <Sidebar :items="items" v-model:active-id="active" />
    </template>
    <div class="p-6">Contenido principal</div>
</AppShell>`;

const railCode = `<AppShell variant="rail">
    <template #topbar><Topbar title="App" divider /></template>
    <template #rail>
        <Sidebar :items="items" :active-id="active" collapsed />
    </template>
    <div class="p-6">Rail icon-only</div>
</AppShell>`;

const collapsedCode = `<AppShell v-model:collapsed="collapsed">
    <template #topbar><Topbar title="App" divider /></template>
    <template #sidebar="{ collapsed }">
        <Sidebar :items="items" :active-id="active" :collapsed="collapsed" />
    </template>
    <div class="p-6">Sidebar plegable</div>
</AppShell>`;

const noSidebarCode = `<AppShell>
    <template #topbar><Topbar title="App" divider /></template>
    <div class="p-6">Layout sin sidebar (ej. landing autenticada)</div>
</AppShell>`;

const propsList: PropDoc[] = [
    { name: 'variant',         type: "'standard' | 'rail' | 'dual'",        default: "'standard'", description: 'Estructura del shell.' },
    { name: 'appearance',      type: "'flush' | 'contained'",               default: "'flush'",    description: 'Encuadre visual: full-bleed o tarjeta.' },
    { name: 'sidebarPosition', type: "'left' | 'right'",                    default: "'left'",     description: 'Lado del sidebar.' },
    { name: 'sidebarWidth',    type: "'small' | 'medium' | 'large'",        default: "'medium'",   description: 'Ancho del sidebar expandido.' },
    { name: 'collapsedWidth',  type: "'small' | 'medium'",                  default: "'small'",    description: 'Ancho del sidebar colapsado (variant standard).' },
    { name: 'railWidth',       type: "'small' | 'medium'",                  default: "'small'",    description: 'Ancho del rail (variants rail / dual).' },
    { name: 'collapsed',       type: 'boolean',                              default: 'false',      description: 'v-model — sidebar plegado en escritorio.' },
    { name: 'mobileOpen',      type: 'boolean',                              default: 'false',      description: 'v-model — drawer móvil abierto.' },
    { name: 'breakpoint',      type: "'md' | 'lg' | 'xl'",                  default: "'lg'",       description: 'Breakpoint donde el sidebar se vuelve permanente.' },
    { name: 'stickyTopbar',    type: 'boolean',                              default: 'false',      description: 'Hace sticky el topbar.' },
    { name: 'stickySidebar',   type: 'boolean',                              default: 'false',      description: 'Hace sticky el sidebar en escritorio.' },
    { name: 'divider',         type: 'boolean',                              default: 'true',       description: 'Renderiza bordes entre regiones.' },
    { name: 'mainPadding',     type: "'none' | 'small' | 'medium' | 'large'", default: "'none'",   description: 'Padding alrededor del contenido principal.' },
    { name: 'radius',          type: "'none' | 'small' | 'medium' | 'large' | 'full'", default: 'provider', description: 'Radio cuando appearance="contained".' },
];

const slotsList: SlotDoc[] = [
    { name: 'topbar',          bindings: '{ collapsed, mobileOpen, toggleSidebar, openMobile, closeMobile }', description: 'Barra superior de la aplicación.' },
    { name: 'sidebar',         bindings: '{ collapsed, toggleCollapsed, isMobile, closeMobile }',             description: 'Sidebar en variants standard y dual (panel secundario).' },
    { name: 'sidebar-header',  bindings: '{ collapsed }', description: 'Cabecera fija del sidebar.' },
    { name: 'sidebar-footer',  bindings: '{ collapsed }', description: 'Pie fijo del sidebar.' },
    { name: 'rail',            bindings: '{ collapsed, toggleCollapsed }', description: 'Rail icon-only (variants rail y dual).' },
    { name: 'rail-header',     description: 'Cabecera fija del rail.' },
    { name: 'rail-footer',     description: 'Pie fijo del rail.' },
    { name: 'default',         description: 'Contenido principal de la aplicación.' },
    { name: 'footer',          description: 'Pie global del shell.' },
];
</script>

<template>
    <ComponentDoc
        title="AppShell"
        category="Layout"
        import-path="import { AppShell } from 'mood-ui'"
        description="Frame de aplicación: topbar + sidebar + contenido principal con drawer móvil automático. Soporta variantes standard, rail (icon-only) y dual (rail + panel)."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="420px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['standard','rail','dual']"
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Appearance</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="a in ['flush','contained']"
                                :key="a"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgAppearance === a ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgAppearance = (a as typeof pgAppearance)"
                            >{{ a }}</button>
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

                <div class="w-full border border-border rounded-md overflow-hidden bg-card" style="height: 360px;">
                    <AppShell
                        :variant="pgVariant"
                        :appearance="pgAppearance"
                        :collapsed="pgCollapsed"
                        breakpoint="md"
                        class="h-full"
                    >
                        <template #topbar>
                            <Topbar title="Modo UI" subtitle="Demo" divider>
                                <template #logo><div class="size-7 rounded bg-primary" /></template>
                            </Topbar>
                        </template>
                        <template #sidebar="{ collapsed }">
                            <Sidebar :items="items" v-model:active-id="active" :collapsed="collapsed" color="primary" />
                        </template>
                        <template #rail="{ collapsed }">
                            <Sidebar :items="items" :active-id="active" :collapsed="collapsed || true" color="primary" />
                        </template>
                        <div class="p-6 text-sm text-muted-foreground">
                            Contenido principal del shell — esta zona es el slot default.
                        </div>
                    </AppShell>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Topbar + sidebar + contenido — la composición más usada."
                :code="basicCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card" style="height: 320px;">
                    <AppShell breakpoint="md" class="h-full">
                        <template #topbar>
                            <Topbar title="Modo UI" divider>
                                <template #logo><div class="size-7 rounded bg-primary" /></template>
                            </Topbar>
                        </template>
                        <template #sidebar>
                            <Sidebar :items="items" v-model:active-id="active" color="primary" />
                        </template>
                        <div class="p-6 text-sm">Contenido principal</div>
                    </AppShell>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Variant rail"
                description="Rail icon-only persistente, ideal para apps densas."
                :code="railCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card" style="height: 320px;">
                    <AppShell variant="rail" breakpoint="md" class="h-full">
                        <template #topbar>
                            <Topbar title="App" divider>
                                <template #logo><div class="size-7 rounded bg-primary" /></template>
                            </Topbar>
                        </template>
                        <template #rail>
                            <Sidebar :items="items" :active-id="active" collapsed color="primary" />
                        </template>
                        <div class="p-6 text-sm">Rail icon-only</div>
                    </AppShell>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Sidebar colapsado"
                description="v-model:collapsed permite plegar el sidebar manteniendo los iconos."
                :code="collapsedCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card" style="height: 320px;">
                    <AppShell :collapsed="true" breakpoint="md" class="h-full">
                        <template #topbar>
                            <Topbar title="App" divider>
                                <template #logo><div class="size-7 rounded bg-primary" /></template>
                            </Topbar>
                        </template>
                        <template #sidebar="{ collapsed }">
                            <Sidebar :items="items" :active-id="active" :collapsed="collapsed" color="primary" />
                        </template>
                        <div class="p-6 text-sm">Sidebar plegado</div>
                    </AppShell>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Sin sidebar"
                description="Layout solo con topbar — útil para landings o flujos lineales."
                :code="noSidebarCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card" style="height: 280px;">
                    <AppShell breakpoint="md" class="h-full">
                        <template #topbar>
                            <Topbar title="App" divider>
                                <template #logo><div class="size-7 rounded bg-primary" /></template>
                            </Topbar>
                        </template>
                        <div class="p-6 text-sm">Layout sin sidebar (ej. landing autenticada)</div>
                    </AppShell>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
