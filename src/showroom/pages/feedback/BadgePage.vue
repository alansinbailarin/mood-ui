<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Badge from '../../../components/feedback/Badge.vue';
import { CheckCircleIcon, StarIcon, BoltIcon } from '@heroicons/vue/24/outline';
import type { PropDoc, EmitDoc, SlotDoc } from '../../types';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'solid' | 'subtle' | 'outline'>('subtle');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');

function resetPlayground() {
    pgVariant.value = 'subtle';
    pgColor.value   = 'primary';
    pgSize.value    = 'medium';
}

const colorDots = [
    { value: 'default' as const, bg: '#64748b',        label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)', label: 'Primary' },
    { value: 'success' as const, bg: '#22c55e',        label: 'Success' },
    { value: 'warning' as const, bg: '#f59e0b',        label: 'Warning' },
    { value: 'danger'  as const, bg: '#ef4444',        label: 'Danger'  },
];

const overviewCode = computed(() => {
    const parts: string[] = [];
    if (pgVariant.value !== 'subtle')  parts.push(`variant="${pgVariant.value}"`);
    if (pgColor.value   !== 'default') parts.push(`color="${pgColor.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    parts.push('label="Etiqueta"');
    return `<Badge ${parts.join(' ')} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const variantsCode = `<Badge label="Solid"   variant="solid"   color="primary" />
<Badge label="Subtle"  variant="subtle"  color="primary" />
<Badge label="Outline" variant="outline" color="primary" />`;

const colorsCode = `<Badge label="default" color="default" variant="subtle" />
<Badge label="primary" color="primary" variant="subtle" />
<Badge label="success" color="success" variant="subtle" />
<Badge label="warning" color="warning" variant="subtle" />
<Badge label="danger"  color="danger"  variant="subtle" />`;

const iconCode = `<Badge label="Activo"     :icon="CheckCircleIcon" color="success" variant="subtle" />
<Badge label="Destacado"  :icon="StarIcon"        color="warning" variant="subtle" />
<Badge label="Pro"        :icon="BoltIcon"        color="primary" variant="solid"  />`;

const dotCode = `<Badge label="Online"   dot color="success" variant="subtle" />
<Badge label="Ausente"  dot color="warning" variant="subtle" />
<Badge label="Offline"  dot color="default" variant="subtle" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'label',           type: 'string',                                                                  description: 'Texto del badge. Equivalente al slot default para contenido plano.' },
    { name: 'variant',         type: "'solid' | 'subtle' | 'outline'",                  default: "'subtle'",     description: 'Estilo visual aplicado al badge.' },
    { name: 'color',           type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color semántico aplicado al badge.' },
    { name: 'gradient',        type: 'boolean',                                          default: 'false',       description: 'Aplica un gradiente sutil (solo con variant solid).' },
    { name: 'size',            type: "'small' | 'medium' | 'large'",                                             description: 'Tamaño del badge. Cascada desde ModoProvider si se omite.' },
    { name: 'radius',          type: "'none' | 'small' | 'medium' | 'large' | 'full'",                          description: 'Radio de las esquinas. Cascada desde ModoProvider.' },
    { name: 'icon',            type: 'Component',                                                                description: 'Componente de icono renderizado a la izquierda del label.' },
    { name: 'removable',       type: 'boolean',                                          default: 'false',       description: 'Muestra un botón de cierre que emite el evento remove.' },
    { name: 'dot',             type: 'boolean',                                          default: 'false',       description: 'Reemplaza el icono por un pequeño punto coloreado.' },
    { name: 'removeAriaLabel', type: 'string',                                                                   description: 'Sobrescribe el aria-label del botón de remove.' },
];

const emitsList: EmitDoc[] = [
    { name: 'remove', payload: '—', description: 'Emitido al hacer click en el botón de cierre cuando removable está activo.' },
];

const slotsList: SlotDoc[] = [
    { name: 'default', description: 'Contenido personalizado del badge. Reemplaza la prop label cuando se necesita HTML o componentes internos.' },
];
</script>

<template>
    <ComponentDoc
        title="Badge"
        category="Feedback"
        import-path="import { Badge } from 'mood-ui'"
        description="Etiqueta inline para mostrar estado, conteos o categorías. Soporta variantes solid / subtle / outline, colores semánticos, tamaños, icono y modo dot."
        :props-list="propsList"
        :emits-list="emitsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="180px" @reset="resetPlayground">
                <template #controls>
                    <!-- Variant -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Variante</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="v in ['solid', 'subtle', 'outline']"
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
                        <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide hidden sm:inline">Tamaño</span>
                        <div class="flex rounded-md border border-border overflow-hidden">
                            <button
                                v-for="s in ['small', 'medium', 'large']"
                                :key="s"
                                type="button"
                                class="px-2 py-1 text-xs transition-colors capitalize"
                                :class="pgSize === s
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:bg-muted/60'"
                                @click="pgSize = (s as typeof pgSize)"
                            >{{ s }}</button>
                        </div>
                    </div>
                </template>

                <Badge :variant="pgVariant" :color="pgColor" :size="pgSize" label="Etiqueta" />
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Variantes"
                description="Tres tratamientos visuales: solid para énfasis, subtle por defecto y outline para discreción."
                :code="variantsCode"
            >
                <Badge label="Solid"   variant="solid"   color="primary" />
                <Badge label="Subtle"  variant="subtle"  color="primary" />
                <Badge label="Outline" variant="outline" color="primary" />
            </ComponentPreview>

            <ComponentPreview
                title="Colores"
                description="Paleta semántica en variante subtle."
                :code="colorsCode"
            >
                <Badge label="default" color="default" variant="subtle" />
                <Badge label="primary" color="primary" variant="subtle" />
                <Badge label="success" color="success" variant="subtle" />
                <Badge label="warning" color="warning" variant="subtle" />
                <Badge label="danger"  color="danger"  variant="subtle" />
            </ComponentPreview>

            <ComponentPreview
                title="Con icono"
                description="Añade un icono a la izquierda del label para reforzar el significado."
                :code="iconCode"
            >
                <Badge label="Activo"    :icon="CheckCircleIcon" color="success" variant="subtle" />
                <Badge label="Destacado" :icon="StarIcon"        color="warning" variant="subtle" />
                <Badge label="Pro"       :icon="BoltIcon"        color="primary" variant="solid"  />
            </ComponentPreview>

            <ComponentPreview
                title="Modo dot"
                description="Reemplaza el icono por un punto para indicar estado de presencia o disponibilidad."
                :code="dotCode"
            >
                <Badge label="Online"  dot color="success" variant="subtle" />
                <Badge label="Ausente" dot color="warning" variant="subtle" />
                <Badge label="Offline" dot color="default" variant="subtle" />
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
