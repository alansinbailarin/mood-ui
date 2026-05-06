<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import PageHeader from '../../../components/layout/PageHeader.vue';
import Button from '../../../components/forms/Button.vue';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

const pgSize = ref<'small' | 'medium' | 'large'>('medium');
const pgWithActions = ref(true);
const pgDivider = ref(true);

function resetPlayground() {
    pgSize.value = 'medium';
    pgWithActions.value = true;
    pgDivider.value = true;
}

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSize.value !== 'medium') parts.push(`size="${pgSize.value}"`);
    if (pgDivider.value) parts.push('divider');
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    const actions = pgWithActions.value
        ? `\n    <template #actions>\n        <Button variant="outline" size="small">Filtros</Button>\n        <Button color="primary" size="small">Nuevo</Button>\n    </template>\n`
        : '';
    return `<PageHeader${attrs} title="Proyectos" subtitle="Gestiona los proyectos del workspace">${actions}</PageHeader>`;
});

const basicCode = `<PageHeader
    title="Proyectos"
    subtitle="Gestiona los proyectos del workspace"
    divider
/>`;

const breadcrumbsCode = `<PageHeader title="Editar proyecto" divider>
    <template #breadcrumbs>
        <nav class="text-xs text-muted-foreground">
            Workspace · Proyectos · <span class="text-foreground">Editar</span>
        </nav>
    </template>
</PageHeader>`;

const tabsCode = `<PageHeader title="Reportes" divider>
    <template #tabs>
        <div class="flex gap-4 -mb-px">
            <button class="px-1 py-2 border-b-2 border-primary text-primary text-sm font-medium">Resumen</button>
            <button class="px-1 py-2 border-b-2 border-transparent text-muted-foreground text-sm">Detalle</button>
            <button class="px-1 py-2 border-b-2 border-transparent text-muted-foreground text-sm">Auditoría</button>
        </div>
    </template>
</PageHeader>`;

const actionsCode = `<PageHeader back-button title="Detalle" subtitle="Volver a la lista">
    <template #actions>
        <Button variant="outline" size="small">Cancelar</Button>
        <Button color="primary" size="small">Guardar</Button>
    </template>
</PageHeader>`;

const propsList: PropDoc[] = [
    { name: 'title',         type: 'string',                                            description: 'Título principal de la página.' },
    { name: 'subtitle',      type: 'string',                                            description: 'Texto secundario debajo del título.' },
    { name: 'backButton',    type: 'boolean',                          default: 'false', description: 'Muestra un botón back a la izquierda del título.' },
    { name: 'backIcon',      type: 'Component',                                         description: 'Icono del botón back. Por defecto chevron-left.' },
    { name: 'backAriaLabel', type: 'string',                                            description: 'Nombre accesible para el botón back icon-only.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",     default: "'medium'", description: 'Tamaño visual del título.' },
    { name: 'divider',       type: 'boolean',                          default: 'false', description: 'Renderiza un borde inferior separando el header del contenido.' },
    { name: 'sticky',        type: 'boolean',                          default: 'false', description: 'Activa position: sticky al inicio del scroll.' },
    { name: 'padding',       type: "'none' | 'small' | 'medium' | 'large'", default: "'medium'", description: 'Padding alrededor del contenido del header.' },
    { name: 'as',            type: 'string',                          default: "'header'", description: 'Etiqueta raíz a renderizar.' },
];

const emitsList: EmitDoc[] = [
    { name: 'back', payload: 'MouseEvent', description: 'Emitido al hacer click en el botón back.' },
];

const slotsList: SlotDoc[] = [
    { name: 'breadcrumbs', description: 'Breadcrumbs renderizados encima del título.' },
    { name: 'title',       description: 'Reemplaza el título plano por contenido rico.' },
    { name: 'subtitle',    description: 'Reemplaza el subtítulo plano por contenido rico.' },
    { name: 'actions',     description: 'Acciones a la derecha del header (botones, menús).' },
    { name: 'hero',        description: 'Zona destacada (banner, métricas) debajo del header principal.' },
    { name: 'tabs',        description: 'Tabs renderizadas debajo del header, alineadas con el divider.' },
];
</script>

<template>
    <ComponentDoc
        title="PageHeader"
        category="Layout"
        import-path="import { PageHeader } from 'mood-ui'"
        description="Cabecera de página con título, subtítulo, botón back opcional, breadcrumbs, tabs y zona de acciones."
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
                        :class="pgWithActions ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgWithActions = !pgWithActions"
                    >Actions</button>

                    <button
                        type="button"
                        class="px-2 py-1 rounded-md text-xs border transition-colors"
                        :class="pgDivider ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-muted/60'"
                        @click="pgDivider = !pgDivider"
                    >Divider</button>
                </template>

                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <PageHeader
                        :size="pgSize"
                        :divider="pgDivider"
                        title="Proyectos"
                        subtitle="Gestiona los proyectos del workspace"
                    >
                        <template v-if="pgWithActions" #actions>
                            <Button variant="outline" size="small">Filtros</Button>
                            <Button color="primary" size="small">Nuevo</Button>
                        </template>
                    </PageHeader>
                </div>
            </ComponentPreview>
        </template>

        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Título, subtítulo y divider — la combinación más común."
                :code="basicCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <PageHeader title="Proyectos" subtitle="Gestiona los proyectos del workspace" divider />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con breadcrumbs"
                description="Usa el slot breadcrumbs para mostrar la jerarquía de navegación."
                :code="breadcrumbsCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <PageHeader title="Editar proyecto" divider>
                        <template #breadcrumbs>
                            <nav class="text-xs text-muted-foreground">
                                Workspace · Proyectos · <span class="text-foreground">Editar</span>
                            </nav>
                        </template>
                    </PageHeader>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con tabs"
                description="Las tabs se alinean con el divider para una transición visual fluida."
                :code="tabsCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <PageHeader title="Reportes" divider>
                        <template #tabs>
                            <div class="flex gap-4 -mb-px">
                                <button class="px-1 py-2 border-b-2 border-primary text-primary text-sm font-medium">Resumen</button>
                                <button class="px-1 py-2 border-b-2 border-transparent text-muted-foreground text-sm hover:text-foreground">Detalle</button>
                                <button class="px-1 py-2 border-b-2 border-transparent text-muted-foreground text-sm hover:text-foreground">Auditoría</button>
                            </div>
                        </template>
                    </PageHeader>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con back y acciones"
                description="Combinación típica para vistas de detalle o edición."
                :code="actionsCode"
            >
                <div class="w-full border border-border rounded-md overflow-hidden bg-card">
                    <PageHeader back-button title="Detalle" subtitle="Volver a la lista" divider>
                        <template #actions>
                            <Button variant="outline" size="small">Cancelar</Button>
                            <Button color="primary" size="small">Guardar</Button>
                        </template>
                    </PageHeader>
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
