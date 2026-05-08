<script setup lang="ts">
import { ref, computed } from 'vue';
import ComponentDoc from '../../components/ComponentDoc.vue';
import ComponentPreview from '../../components/ComponentPreview.vue';
import Timeline from '../../../components/data-display/Timeline.vue';
import {
    CheckCircleIcon, RocketLaunchIcon, BeakerIcon, BugAntIcon,
} from '@heroicons/vue/24/solid';
import type { PropDoc, SlotDoc } from '../../types';
import TbPills from '../../components/toolbar/TbPills.vue';
import TbDots from '../../components/toolbar/TbDots.vue';
import TbSep from '../../components/toolbar/TbSep.vue';

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<'dot' | 'icon' | 'outline'>('dot');
const pgSize    = ref<'small' | 'medium' | 'large'>('medium');
const pgColor   = ref<'default' | 'primary' | 'success' | 'warning' | 'danger'>('primary');
const pgSide    = ref<'left' | 'right'>('left');

function resetPlayground() {
    pgVariant.value = 'dot';
    pgSize.value    = 'medium';
    pgColor.value   = 'primary';
    pgSide.value    = 'left';
}

const colorDots = [
    { value: 'default' as const, bg: 'var(--color-slate-400)',  label: 'Default' },
    { value: 'primary' as const, bg: 'var(--primary)',           label: 'Primary' },
    { value: 'success' as const, bg: 'var(--color-emerald-500)', label: 'Success' },
    { value: 'warning' as const, bg: 'var(--color-amber-500)',   label: 'Warning' },
    { value: 'danger'  as const, bg: 'var(--color-red-500)',     label: 'Danger'  },
];

const playgroundItems = [
    { id: 1, title: 'Pedido recibido',  timestamp: '10:24' },
    { id: 2, title: 'Pago confirmado',  timestamp: '10:31' },
    { id: 3, title: 'En preparación',   timestamp: '10:48' },
    { id: 4, title: 'Enviado',          timestamp: '14:02' },
];

const overviewCode = computed(() => {
    const parts: string[] = [':items="items"'];
    if (pgVariant.value !== 'dot')     parts.push(`variant="${pgVariant.value}"`);
    if (pgSize.value    !== 'medium')  parts.push(`size="${pgSize.value}"`);
    if (pgColor.value   !== 'primary') parts.push(`color="${pgColor.value}"`);
    if (pgSide.value    !== 'left')    parts.push(`side="${pgSide.value}"`);
    return `<Timeline ${parts.join(' ')} />`;
});

// ── Example data ──────────────────────────────────────────────────────────────
const orderItems = [
    { id: 1, title: 'Pedido recibido',  timestamp: '10:24' },
    { id: 2, title: 'Pago confirmado',  timestamp: '10:31' },
    { id: 3, title: 'En preparación',   timestamp: '10:48' },
    { id: 4, title: 'Enviado',          timestamp: '14:02' },
];

const releaseItems = [
    { id: 1, title: 'v0.4.0 publicado', timestamp: '3 May 2026',  description: 'Nuevos componentes Tier S: Kbd, Code, Stepper.', icon: RocketLaunchIcon, variant: 'icon' as const },
    { id: 2, title: 'v0.3.1 hotfix',    timestamp: '20 Abr 2026', description: 'Fix de theming en superficies oscuras.',         icon: BugAntIcon,       variant: 'icon' as const, color: 'warning' as const },
    { id: 3, title: 'v0.3.0',           timestamp: '15 Abr 2026', description: 'Presets de surfaces y soporte i18n.',            icon: BeakerIcon,       variant: 'icon' as const },
    { id: 4, title: 'v0.2.0',           timestamp: '5 Abr 2026',  description: 'Calendar, Scheduler y Table iniciales.',         icon: CheckCircleIcon,  variant: 'icon' as const, color: 'success' as const },
];

const coloredItems = [
    { id: 1, title: 'Build pasó',     timestamp: 'hace 2 m', color: 'success' as const },
    { id: 2, title: 'Tests con warns', timestamp: 'hace 5 m', color: 'warning' as const },
    { id: 3, title: 'Deploy fallido', timestamp: 'hace 8 m', color: 'danger'  as const },
];

const detailItems = [
    { id: 1, title: 'Reunión con cliente',  timestamp: '09:00', description: 'Kickoff del nuevo proyecto y revisión de alcance.' },
    { id: 2, title: 'Diseño aprobado',      timestamp: '12:30', description: 'Mockups validados por el equipo de producto.' },
    { id: 3, title: 'Sprint planning',      timestamp: '16:00', description: 'Definición de objetivos para el siguiente ciclo.' },
];

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<Timeline :items="items" />`;

const iconsCode = `<Timeline :items="releases" variant="icon" />`;

const colorsCode = `<Timeline :items="[
    { id: 1, title: 'Build pasó',     color: 'success' },
    { id: 2, title: 'Tests con warns', color: 'warning' },
    { id: 3, title: 'Deploy fallido', color: 'danger'  },
]" />`;

const descriptionCode = `<Timeline :items="[
    { id: 1, title: 'Reunión con cliente', timestamp: '09:00',
      description: 'Kickoff del nuevo proyecto.' },
    { id: 2, title: 'Diseño aprobado',     timestamp: '12:30',
      description: 'Mockups validados.' },
]" />`;

const rightSideCode = `<Timeline :items="items" side="right" />`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList: PropDoc[] = [
    { name: 'items',   type: 'TimelineItem[]',                                            required: true,                description: 'Eventos a renderizar en orden cronológico.' },
    { name: 'variant', type: "'dot' | 'icon' | 'outline'",                                default: "'dot'",              description: 'Estilo del marcador por defecto. Cada item puede sobreescribirlo.' },
    { name: 'color',   type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'primary'",          description: 'Color semántico por defecto del marcador.' },
    { name: 'size',    type: "'small' | 'medium' | 'large'",                              default: "'medium'",           description: 'Escala visual del marcador y la tipografía.' },
    { name: 'side',    type: "'left' | 'right'",                                          default: "'left'",             description: 'Lado donde se renderiza la línea de marcadores.' },
];

const slotsList: SlotDoc[] = [
    { name: 'item-{id}', description: 'Contenido extra renderizado debajo del título y descripción del item con el id correspondiente.' },
];
</script>

<template>
    <ComponentDoc
        title="Timeline"
        category="Data Display"
        import-path="import { Timeline } from 'mood-ui'"
        description="Línea de tiempo vertical para mostrar eventos en orden cronológico. Útil para historial, changelogs, tracking y feeds de actividad."
        :props-list="propsList"
        :slots-list="slotsList"
    >
        <!-- ── Overview ────────────────────────────────────────────────────── -->
        <template #overview>
            <ComponentPreview :code="overviewCode" min-height="320px" @reset="resetPlayground">
                <template #controls>
                    <TbPills label="Variante" :options="[{value:'dot'},{value:'icon'},{value:'outline'}]" v-model="pgVariant" />
                    <TbSep />
                    <TbDots label="Color" :options="colorDots" v-model="pgColor" />
                    <TbSep />
                    <TbPills label="Tamaño" :options="[{value:'small'},{value:'medium'},{value:'large'}]" v-model="pgSize" />
                    <TbSep />
                    <TbPills label="Lado" :options="[{value:'left'},{value:'right'}]" v-model="pgSide" />
                </template>

                <div class="w-full max-w-md">
                    <Timeline
                        :items="playgroundItems"
                        :variant="pgVariant"
                        :size="pgSize"
                        :color="pgColor"
                        :side="pgSide"
                    />
                </div>
            </ComponentPreview>
        </template>

        <!-- ── Examples ────────────────────────────────────────────────────── -->
        <template #examples>
            <ComponentPreview
                title="Básico"
                description="Lista simple de eventos con título y timestamp."
                :code="basicCode"
            >
                <div class="w-full max-w-md">
                    <Timeline :items="orderItems" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con iconos"
                description="Cada item define un componente icon y variant 'icon'."
                :code="iconsCode"
            >
                <div class="w-full max-w-md">
                    <Timeline :items="releaseItems" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Colores por evento"
                description="El color del marcador puede sobreescribirse por item para reflejar estados."
                :code="colorsCode"
            >
                <div class="w-full max-w-md">
                    <Timeline :items="coloredItems" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Con descripción"
                description="Añade texto secundario debajo del título para dar contexto al evento."
                :code="descriptionCode"
            >
                <div class="w-full max-w-md">
                    <Timeline :items="detailItems" />
                </div>
            </ComponentPreview>

            <ComponentPreview
                title="Lado derecho"
                description="Inversión del rail con side='right' — útil para layouts asimétricos."
                :code="rightSideCode"
            >
                <div class="w-full max-w-md">
                    <Timeline :items="orderItems" side="right" />
                </div>
            </ComponentPreview>
        </template>
    </ComponentDoc>
</template>
