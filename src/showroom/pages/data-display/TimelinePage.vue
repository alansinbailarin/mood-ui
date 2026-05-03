<script setup lang="ts">
import {
    CheckCircleIcon, RocketLaunchIcon, BeakerIcon, BugAntIcon,
} from '@heroicons/vue/24/solid';
import DocPage from '../../components/DocPage.vue';
import Example from '../../components/Example.vue';
import Timeline from '../../../components/data-display/Timeline.vue';

const releases = [
    { id: 1, title: 'v0.4.0 publicado', timestamp: '3 May 2026', description: 'Tier S: Kbd, Code, Segmented, Stepper, Accordion.', icon: RocketLaunchIcon, variant: 'icon' as const },
    { id: 2, title: 'v0.3.1', timestamp: '20 Abr 2026', description: 'Fix: theming en surfaces oscuros.', icon: BugAntIcon, color: 'warning' as const, variant: 'icon' as const },
    { id: 3, title: 'v0.3.0', timestamp: '15 Abr 2026', description: 'Dark surfaces presets + i18n ES.', icon: BeakerIcon, variant: 'icon' as const },
    { id: 4, title: 'v0.2.0', timestamp: '5 Abr 2026', description: 'Calendar, Scheduler, Table.', icon: CheckCircleIcon, color: 'success' as const, variant: 'icon' as const },
];

const simple = [
    { id: 1, title: 'Pedido recibido', timestamp: '10:24' },
    { id: 2, title: 'Pago confirmado', timestamp: '10:31' },
    { id: 3, title: 'En preparación', timestamp: '10:48' },
    { id: 4, title: 'Enviado', timestamp: '14:02' },
];
</script>

<template>
    <DocPage
        title="Timeline"
        category="Data display"
        import-path="import { Timeline } from 'mood-ui'"
        description="Línea de tiempo vertical para mostrar eventos en orden cronológico. Útil para historial, changelogs, tracking y feeds de actividad."
    >
        <template #examples>
            <Example title="Básico" :code="`<Timeline :items=\&quot;items\&quot; />`">
                <Timeline :items="simple" />
            </Example>

            <Example title="Con iconos" description="Pasa `variant: 'icon'` por item y un componente `icon`.">
                <Timeline :items="releases" />
            </Example>

            <Example title="Variantes">
                <div class="grid md:grid-cols-3 gap-6">
                    <div>
                        <p class="text-xs uppercase tracking-wider text-muted-foreground mb-2">dot</p>
                        <Timeline :items="simple.slice(0, 3)" variant="dot" />
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-muted-foreground mb-2">outline</p>
                        <Timeline :items="simple.slice(0, 3)" variant="outline" />
                    </div>
                    <div>
                        <p class="text-xs uppercase tracking-wider text-muted-foreground mb-2">icon</p>
                        <Timeline :items="releases.slice(0, 3)" />
                    </div>
                </div>
            </Example>

            <Example title="Colores">
                <div class="grid sm:grid-cols-2 gap-6">
                    <Timeline :items="simple.slice(0, 3)" color="success" />
                    <Timeline :items="simple.slice(0, 3)" color="warning" />
                    <Timeline :items="simple.slice(0, 3)" color="danger" />
                    <Timeline :items="simple.slice(0, 3)" color="default" />
                </div>
            </Example>

            <Example title="Tamaños">
                <div class="grid md:grid-cols-3 gap-6">
                    <Timeline :items="simple.slice(0, 3)" size="small" />
                    <Timeline :items="simple.slice(0, 3)" size="medium" />
                    <Timeline :items="simple.slice(0, 3)" size="large" />
                </div>
            </Example>
        </template>
    </DocPage>
</template>
