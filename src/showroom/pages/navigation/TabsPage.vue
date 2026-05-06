<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Tabs from '../../../components/navigation/Tabs.vue';
import { HomeIcon, ChartBarIcon, Cog6ToothIcon, BellIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'line' | 'pill' | 'segmented'>('line');
const pgColor   = ref<'default' | 'primary' | 'danger' | 'success' | 'warning'>('primary');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgActive  = ref<string | number>('overview');

function resetPlayground() {
    pgVariant.value = 'line';
    pgColor.value   = 'primary';
    pgSize.value    = 'medium';
    pgActive.value  = 'overview';
}

const playgroundItems = [
    { value: 'overview',  label: 'Resumen' },
    { value: 'analytics', label: 'Analítica' },
    { value: 'settings',  label: 'Ajustes' },
];

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'line')    parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    const attrs = parts.length ? ' ' + parts.join(' ') : '';
    return `<Tabs v-model="active" :items="items"${attrs} class="w-full max-w-md" />`;
});

// ── Example data ──────────────────────────────────────────────────────────────
const variantsActive   = ref<string | number>('overview');
const iconsActive      = ref<string | number>('home');
const verticalActive   = ref<string | number>('account');
const controlledActive = ref<string | number>('inbox');
const badgesActive     = ref<string | number>('inbox');

const iconItems = [
    { value: 'home',     label: 'Inicio',       icon: HomeIcon },
    { value: 'stats',    label: 'Estadísticas', icon: ChartBarIcon },
    { value: 'settings', label: 'Ajustes',      icon: Cog6ToothIcon },
];

const verticalItems = [
    { value: 'account',  label: 'Cuenta' },
    { value: 'security', label: 'Seguridad' },
    { value: 'billing',  label: 'Facturación' },
];

const badgeItems = [
    { value: 'inbox',  label: 'Bandeja',    icon: BellIcon, badge: 12 },
    { value: 'sent',   label: 'Enviados',   badge: 3 },
    { value: 'drafts', label: 'Borradores' },
];

// ── Example code strings ──────────────────────────────────────────────────────
const variantsCode = `<Tabs v-model="active" :items="items" variant="line" />
<Tabs v-model="active" :items="items" variant="pill" />
<Tabs v-model="active" :items="items" variant="segmented" />`;

const iconsCode = `const items = [
    { value: 'home',     label: 'Inicio',       icon: HomeIcon },
    { value: 'stats',    label: 'Estadísticas', icon: ChartBarIcon },
    { value: 'settings', label: 'Ajustes',      icon: Cog6ToothIcon },
];

<Tabs v-model="active" :items="items" variant="pill" color="primary" />`;

const verticalCode = `<Tabs v-model="active" :items="items" variant="line">
    <template #panel-account>
        <div class="p-4 text-sm">Datos de tu cuenta</div>
    </template>
    <template #panel-security>
        <div class="p-4 text-sm">Contraseña y 2FA</div>
    </template>
    <template #panel-billing>
        <div class="p-4 text-sm">Métodos de pago</div>
    </template>
</Tabs>`;

const controlledCode = `const active = ref('inbox');

<Tabs v-model="active" :items="items" variant="segmented" />
<p>Tab activa: {{ active }}</p>`;

const badgesCode = `const items = [
    { value: 'inbox',  label: 'Bandeja',    icon: BellIcon, badge: 12 },
    { value: 'sent',   label: 'Enviados',   badge: 3 },
    { value: 'drafts', label: 'Borradores' },
];

<Tabs v-model="active" :items="items" variant="pill" color="danger" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'items',         type: 'TabItem[]',                                                 required: true,       description: 'Lista de tabs. Cada item acepta value, label, icon, badge, disabled, to.' },
    { name: 'modelValue',    type: 'string | number | null',                                                          description: 'Valor de la tab activa. Usa v-model.' },
    { name: 'variant',       type: "'line' | 'pill' | 'segmented'",                             default: "'line'",    description: 'Estilo visual del tablist.' },
    { name: 'color',         type: "'default' | 'primary' | 'danger' | 'success' | 'warning'",  default: "'default'", description: 'Color semántico aplicado a la tab activa.' },
    { name: 'size',          type: "'small' | 'medium' | 'large'",                              default: "'medium'",  description: 'Tamaño y padding de cada tab.' },
    { name: 'radius',        type: "'none' | 'small' | 'medium' | 'large' | 'full'",                                  description: 'Radio de las pills/segmented. Hereda de ModoProvider.' },
    { name: 'fullWidth',     type: 'boolean',                                                   default: 'false',     description: 'Estira el tablist al 100% y reparte items por igual.' },
    { name: 'lazy',          type: 'boolean',                                                   default: 'false',     description: 'Solo monta los paneles al activarlos por primera vez.' },
    { name: 'keepMounted',   type: 'boolean',                                                   default: 'true',      description: 'Mantiene los paneles montados (ocultos) al cambiar de tab.' },
    { name: 'linkComponent', type: 'string | Component',                                        default: "'a'",       description: 'Componente para items con `to`. Usa RouterLink para vue-router.' },
    { name: 'ariaLabel',     type: 'string',                                                                          description: 'Etiqueta accesible del tablist.' },
];

const emitsList: EmitDoc[] = [
    { name: 'update:modelValue', payload: 'string | number',        description: 'Emitido al cambiar de tab. Usado por v-model.' },
    { name: 'change',            payload: '(value, item: TabItem)', description: 'Emitido tras un cambio de tab con el item completo.' },
];

const slotsList: SlotDoc[] = [
    { name: 'panel-<value>', bindings: '{ item, active }', description: 'Contenido del panel para cada item, identificado por su value.' },
    { name: 'panel',         bindings: '{ item, active }', description: 'Slot fallback aplicado a los paneles que no definen su propio slot.' },
];
</script>

<template>
    <ComponentDoc
        title="Tabs"
        category="Navigation"
        import-path="import { Tabs } from 'mood-ui'"
        description="Tabs accesibles con tres variantes (line, pill, segmented), iconos, badges y soporte para paneles vía slots `panel-<value>`."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="220px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variant</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['line', 'pill', 'segmented']"
                                :key="v"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgVariant === v
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgVariant = (v as typeof pgVariant)"
                            >{{ v }}</button>
                        </div>
                    </div>

                    <span class="w-px h-4 bg-border shrink-0" />

                    <!-- Color dots -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Color</span>
                        <div class="flex items-center gap-1">
                            <button
                                v-for="c in colorDots"
                                :key="c.value"
                                type="button"
                                class="size-4 rounded-full transition-all duration-150"
                                :class="pgColor === c.value
                                    ? 'ring-2 ring-offset-1 ring-foreground/30 scale-125'
                                    : 'hover:scale-110 opacity-70 hover:opacity-100'"
                                :style="`background: ${c.bg}`"
                                :title="c.label"
                                @click="pgColor = c.value"
                            />
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

                <Tabs
                    v-model="pgActive"
                    :items="playgroundItems"
                    :variant="pgVariant"
                    :color="pgColor"
                    :size="pgSize"
                    class="w-full max-w-md"
                />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Variantes"
                description="Tres estilos visuales: línea inferior, pill rellena y control segmentado."
                :code="variantsCode"
            >
                <div class="flex flex-col gap-4 w-full max-w-md">
                    <Tabs v-model="variantsActive" :items="playgroundItems" variant="line" />
                    <Tabs v-model="variantsActive" :items="playgroundItems" variant="pill" color="primary" />
                    <Tabs v-model="variantsActive" :items="playgroundItems" variant="segmented" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos"
                description="Cada item puede declarar un icono opcional que se renderiza a la izquierda del label."
                :code="iconsCode"
            >
                <Tabs v-model="iconsActive" :items="iconItems" variant="pill" color="primary" class="w-full max-w-md" />
            </ComponentPreview>

            <ComponentPreview
                title="Con paneles"
                description="Define un slot `panel-<value>` por cada tab para mostrar contenido sincronizado con la selección."
                :code="verticalCode"
            >
                <Tabs v-model="verticalActive" :items="verticalItems" variant="line" class="w-full max-w-md">
                    <template #panel-account>
                        <div class="p-4 text-sm">Datos de tu cuenta</div>
                    </template>
                    <template #panel-security>
                        <div class="p-4 text-sm">Contraseña y 2FA</div>
                    </template>
                    <template #panel-billing>
                        <div class="p-4 text-sm">Métodos de pago</div>
                    </template>
                </Tabs>
            </ComponentPreview>

            <ComponentPreview
                title="Controlado"
                description="El estado activo vive en tu componente; lee y escribe vía v-model."
                :code="controlledCode"
            >
                <div class="flex flex-col items-center gap-3 w-full max-w-md">
                    <Tabs v-model="controlledActive" :items="badgeItems" variant="segmented" class="w-full" />
                    <p class="text-xs text-muted-foreground">Tab activa: <code class="font-mono text-primary">{{ controlledActive }}</code></p>
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con badges"
                description="Cada item soporta un `badge` numérico o de texto que se muestra a la derecha del label."
                :code="badgesCode"
            >
                <Tabs v-model="badgesActive" :items="badgeItems" variant="pill" color="danger" class="w-full max-w-md" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
