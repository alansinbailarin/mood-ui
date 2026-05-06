<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Topbar from '../../../components/layout/Topbar.vue';
import Button from '../../../components/forms/Button.vue';
import { BellIcon, MagnifyingGlassIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const pgSize = ref<'small' | 'medium' | 'large'>('medium');
const pgDivider = ref(true);
const pgMenuToggle = ref(false);

function resetPlayground() {
    pgSize.value = 'medium';
    pgDivider.value = true;
    pgMenuToggle.value = false;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgDivider.value) parts.push('divider');
    if (pgMenuToggle.value) parts.push('menu-toggle');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Topbar${attrs} title="Modo UI" subtitle="Workspace #1">
    <template #logo><div class="size-8 rounded bg-primary" /></template>
    <template #actions>
        <Button variant="ghost" size="small" :icon="BellIcon" aria-label="Notificaciones" />
    </template>
</Topbar>`;
});

const basicCode = `<Topbar title="Modo UI" divider>
    <template #logo>
        <div class="size-8 rounded bg-primary" />
    </template>
</Topbar>`;

const searchCode = `<Topbar title="App" divider>
    <template #logo><div class="size-8 rounded bg-primary" /></template>
    <template #search>
        <input class="…" placeholder="Buscar…" />
    </template>
</Topbar>`;

const actionsCode = `<Topbar title="Dashboard" divider>
    <template #logo><div class="size-8 rounded bg-primary" /></template>
    <template #actions>
        <Button variant="ghost" size="small" :icon="BellIcon"      aria-label="Notificaciones" />
        <Button variant="ghost" size="small" :icon="Cog6ToothIcon" aria-label="Ajustes"        />
    </template>
    <template #user>
        <div class="size-8 rounded-full bg-muted" />
    </template>
</Topbar>`;

const transparentCode = `<Topbar title="Hero" :divider="false">
    <template #logo><div class="size-8 rounded bg-primary" /></template>
</Topbar>`;

const propsList: PropDoc[] = [
    { name: 'title',          type: 'string',                                          description: 'Título visible junto al logo.' },
    { name: 'subtitle',       type: 'string',                                          description: 'Texto secundario debajo del título.' },
    { name: 'size',           type: "'small' | 'medium' | 'large'",   default: "'medium'", description: 'Altura visual de la barra.' },
    { name: 'divider',        type: 'boolean',                        default: 'false',    description: 'Renderiza un borde inferior.' },
    { name: 'sticky',         type: 'boolean',                        default: 'false',    description: 'Activa position: sticky con fondo translúcido.' },
    { name: 'padding',        type: "'none' | 'small' | 'medium' | 'large'", default: "'medium'", description: 'Padding horizontal de la barra.' },
    { name: 'menuToggle',     type: 'boolean',                        default: 'false',    description: 'Muestra un botón hamburguesa a la izquierda.' },
    { name: 'menuIcon',       type: 'Component',                                       description: 'Icono del botón menú (por defecto hamburguesa).' },
    { name: 'menuAriaLabel',  type: 'string',                                          description: 'Nombre accesible para el botón menú icon-only.' },
    { name: 'as',             type: 'string',                        default: "'header'", description: 'Etiqueta raíz a renderizar.' },
];

const emitsList: EmitDoc[] = [
    { name: 'menu-toggle', payload: 'MouseEvent', description: 'Emitido al hacer click en el botón menú.' },
];

const slotsList: SlotDoc[] = [
    { name: 'logo',     description: 'Logo o marca al inicio de la barra.' },
    { name: 'title',    description: 'Reemplaza el título plano por contenido rico.' },
    { name: 'subtitle', description: 'Reemplaza el subtítulo plano por contenido rico.' },
    { name: 'nav',      description: 'Navegación principal (links, tabs).' },
    { name: 'search',   description: 'Zona de búsqueda en el centro/derecha.' },
    { name: 'actions',  description: 'Acciones rápidas (notificaciones, ajustes…).' },
    { name: 'user',     description: 'Avatar / menú de usuario al final.' },
];
</script>

<template>
    <ComponentDoc
        title="Topbar"
        category="Layout"
        import-path="import { Topbar } from 'mood-ui'"
        description="Barra superior de aplicación con slots logo, title, subtitle, nav, search, actions y user. Diseñada para usarse dentro de AppShell o de forma standalone."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Size</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small','medium','large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDivider ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDivider = !pgDivider"
                    >Divider</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgMenuToggle ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgMenuToggle = !pgMenuToggle"
                    >Menu</button>
                </template>

                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <Topbar
                        :size="pgSize"
                        :divider="pgDivider"
                        :menu-toggle="pgMenuToggle"
                        title="Modo UI"
                        subtitle="Workspace #1"
                    >
                        <template #logo><div class="size-8 rounded bg-primary" /></template>
                        <template #actions>
                            <Button variant="ghost" size="small" :icon="BellIcon" aria-label="Notificaciones" />
                        </template>
                        <template #user>
                            <div class="size-8 rounded-full bg-muted" />
                        </template>
                    </Topbar>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Logo y título — la versión más simple."
                :code="basicCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <Topbar title="Modo UI" divider>
                        <template #logo><div class="size-8 rounded bg-primary" /></template>
                    </Topbar>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con búsqueda"
                description="Slot search en el centro de la barra."
                :code="searchCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <Topbar title="App" divider>
                        <template #logo><div class="size-8 rounded bg-primary" /></template>
                        <template #search>
                            <div class="relative w-full max-w-md">
                                <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    class="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Buscar…"
                                />
                            </div>
                        </template>
                    </Topbar>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con acciones y usuario"
                description="Combinación típica para una app autenticada."
                :code="actionsCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <Topbar title="Dashboard" divider>
                        <template #logo><div class="size-8 rounded bg-primary" /></template>
                        <template #actions>
                            <Button variant="ghost" size="small" :icon="BellIcon"      aria-label="Notificaciones" />
                            <Button variant="ghost" size="small" :icon="Cog6ToothIcon" aria-label="Ajustes" />
                        </template>
                        <template #user>
                            <div class="size-8 rounded-full bg-muted" />
                        </template>
                    </Topbar>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Sin divider"
                description="Sin borde inferior — útil para integrarse con un hero o canvas."
                :code="transparentCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <Topbar title="Hero" :divider="false">
                        <template #logo><div class="size-8 rounded bg-primary" /></template>
                    </Topbar>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
