<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Breadcrumbs from '../../../components/navigation/Breadcrumbs.vue';
import { HomeIcon, FolderIcon, DocumentIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgSeparator = ref<'chevron' | 'slash' | 'dot' | 'arrow'>('chevron');
const pgSize      = ref<'small' | 'medium' | 'large'>('medium');

function resetPlayground() {
    pgSeparator.value = 'chevron';
    pgSize.value      = 'medium';
}

const playgroundItems = [
    { label: 'Inicio',       href: '#' },
    { label: 'Proyectos',    href: '#' },
    { label: 'Modo',         href: '#' },
    { label: 'Breadcrumbs' },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgSeparator.value !== 'chevron') parts.push(`separator="${pgSeparator.value}"`);
    if (pgSize.value      !== 'medium')  parts.push(`size="${pgSize.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Breadcrumbs :items="items"${attrs} />`;
});

// ── Example data ──────────────────────────────────────────────────────────────
const basicItems = [
    { label: 'Inicio',    href: '#' },
    { label: 'Productos', href: '#' },
    { label: 'Detalle' },
];

const iconItems = [
    { label: 'Inicio',     href: '#', icon: HomeIcon },
    { label: 'Documentos', href: '#', icon: FolderIcon },
    { label: 'Reporte',    icon: DocumentIcon },
];

const longItems = [
    { label: 'Inicio',      href: '#' },
    { label: 'Espacios',    href: '#' },
    { label: 'Equipo',      href: '#' },
    { label: 'Proyectos',   href: '#' },
    { label: 'Modo',        href: '#' },
    { label: 'Componentes', href: '#' },
    { label: 'Navegación' },
];

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `const items = [
    { label: 'Inicio',    href: '#' },
    { label: 'Productos', href: '#' },
    { label: 'Detalle' },
];

<Breadcrumbs :items="items" />`;

const iconsCode = `const items = [
    { label: 'Inicio',     href: '#', icon: HomeIcon },
    { label: 'Documentos', href: '#', icon: FolderIcon },
    { label: 'Reporte',    icon: DocumentIcon },
];

<Breadcrumbs :items="items" />`;

const homeCode = `<Breadcrumbs :items="items" show-home-icon />`;

const customSepCode = `<Breadcrumbs :items="items" separator="slash" />
<Breadcrumbs :items="items" separator="dot" />
<Breadcrumbs :items="items" separator="arrow" />
<Breadcrumbs :items="items" separator-text="›" />`;

const truncatedCode = `<!-- 7 items, max=4 colapsa los del medio en … -->
<Breadcrumbs :items="longItems" :max="4" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'items',         type: 'BreadcrumbItem[]',                              required: true,          description: 'Trail de migas. Cada item acepta label, icon, to, href, disabled.' },
    { name: 'max',           type: 'number',                                        default: '0',            description: 'Máximo de items visibles. Si se supera, colapsa el medio en `…`.' },
    { name: 'separator',     type: "'chevron' | 'slash' | 'dot' | 'arrow'",         default: "'chevron'",    description: 'Separador visual entre items.' },
    { name: 'separatorText', type: 'string',                                                                  description: 'Texto literal que sustituye el separador (override).' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                  default: "'medium'",     description: 'Tamaño tipográfico del trail.' },
    { name: 'showHomeIcon',  type: 'boolean',                                       default: 'false',        description: 'Muestra un icono Home en el primer item si éste no define `icon`.' },
    { name: 'ariaLabel',     type: 'string',                                        default: "'Breadcrumb'", description: 'Etiqueta accesible del nav.' },
];

const emitsList: EmitDoc[] = [
    { name: 'navigate', payload: '(item: BreadcrumbItem, index: number)', description: 'Emitido al hacer click en un item con `to` (no en items con `href` ni en el actual).' },
];
</script>

<template>
    <ComponentDoc
        title="Breadcrumbs"
        category="Navigation"
        import-path="import { Breadcrumbs } from 'mood-ui'"
        description="Migas de pan accesibles con iconos por item, separadores intercambiables y colapsado opcional cuando el trail supera el máximo."
        :props-list="propsList"
        :emits-list="emitsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="160px" @reset="resetPlayground">
                <template #controls>
                    <!-- Separator -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Separator</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['chevron', 'slash', 'dot', 'arrow']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSeparator === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSeparator = (s as typeof pgSeparator)"
                            >{{ s }}</button>
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

                <Breadcrumbs :items="playgroundItems" :separator="pgSeparator" :size="pgSize" />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Trail simple con separador chevron por defecto. El último item es la página actual."
                :code="basicCode"
            >
                <Breadcrumbs :items="basicItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos"
                description="Cada item puede declarar un icono opcional. Útil para reforzar la jerarquía visual."
                :code="iconsCode"
            >
                <Breadcrumbs :items="iconItems" />
            </ComponentPreview>

            <ComponentPreview
                title="Con icono Home"
                description="`show-home-icon` añade automáticamente un icono Home al primer item cuando éste no define el suyo."
                :code="homeCode"
            >
                <Breadcrumbs :items="basicItems" show-home-icon />
            </ComponentPreview>

            <ComponentPreview
                title="Separadores"
                description="Cuatro separadores integrados (chevron, slash, dot, arrow) o uno propio vía `separator-text`."
                :code="customSepCode"
            >
                <div class="flex flex-col gap-3 w-full">
                    <Breadcrumbs :items="basicItems" separator="slash" />
                    <Breadcrumbs :items="basicItems" separator="dot" />
                    <Breadcrumbs :items="basicItems" separator="arrow" />
                    <Breadcrumbs :items="basicItems" separator-text="›" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Truncado"
                description="Cuando el trail supera `max`, los items del medio colapsan en una elipsis interactiva."
                :code="truncatedCode"
            >
                <Breadcrumbs :items="longItems" :max="4" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
