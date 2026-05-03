<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckIcon } from '@heroicons/vue/24/solid';

import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Button from '../../../components/forms/Button.vue';
import Switch from '../../../components/forms/Switch.vue';

const yearly = ref(true);

interface Plan {
    name: string;
    description: string;
    monthly: number;
    yearly: number;
    features: string[];
    highlight?: boolean;
    cta: string;
}

const plans: Plan[] = [
    {
        name: 'Starter',
        description: 'Para proyectos personales y prototipos.',
        monthly: 0, yearly: 0,
        features: ['Hasta 3 proyectos', 'Componentes básicos', 'Comunidad Discord', 'Updates mensuales'],
        cta: 'Empezar gratis',
    },
    {
        name: 'Pro',
        description: 'Para equipos pequeños lanzando productos reales.',
        monthly: 29, yearly: 24,
        features: ['Proyectos ilimitados', 'Todos los componentes', 'Theme Studio', 'Templates premium', 'Soporte por email'],
        highlight: true,
        cta: 'Empezar 14 días gratis',
    },
    {
        name: 'Team',
        description: 'Para empresas que necesitan SLA y onboarding.',
        monthly: 79, yearly: 64,
        features: ['Todo de Pro', 'SSO + audit log', 'Soporte prioritario', 'Onboarding guiado', 'SLA 99.9%'],
        cta: 'Hablar con ventas',
    },
];

function priceFor(p: Plan): number {
    return yearly.value ? p.yearly : p.monthly;
}

const savingsLabel = computed(() => yearly.value ? 'Ahorra ~17%' : '');
</script>

<template>
    <div class="min-h-[800px] bg-background py-12 px-6 rounded-2xl border border-border">
        <div class="max-w-5xl mx-auto flex flex-col gap-10">
            <div class="text-center flex flex-col gap-3 items-center">
                <Badge color="primary" variant="subtle">Pricing</Badge>
                <Typography variant="title" size="large">Pagas solo lo que necesitas</Typography>
                <Typography variant="body" color="muted" class="max-w-xl">
                    Empieza gratis y escala cuando tu producto crezca. Sin sorpresas, cancela cuando quieras.
                </Typography>
                <div class="flex items-center gap-3 mt-4">
                    <span :class="yearly ? 'text-muted-foreground' : 'font-semibold text-foreground'">Mensual</span>
                    <Switch v-model="yearly" />
                    <span :class="!yearly ? 'text-muted-foreground' : 'font-semibold text-foreground'">Anual</span>
                    <Badge v-if="yearly" color="success" variant="subtle">{{ savingsLabel }}</Badge>
                </div>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
                <Card
                    v-for="plan in plans"
                    :key="plan.name"
                    :class="[
                        'relative flex flex-col gap-5 p-6',
                        plan.highlight ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : '',
                    ]"
                >
                    <Badge
                        v-if="plan.highlight"
                        color="primary"
                        variant="solid"
                        class="absolute -top-3 left-1/2 -translate-x-1/2"
                    >Más popular</Badge>

                    <div class="flex flex-col gap-1">
                        <Typography variant="title" size="small">{{ plan.name }}</Typography>
                        <Typography variant="body" color="muted" class="text-sm">{{ plan.description }}</Typography>
                    </div>

                    <div class="flex items-baseline gap-1">
                        <span class="text-4xl font-bold tracking-tight">${{ priceFor(plan) }}</span>
                        <span class="text-sm text-muted-foreground">/{{ yearly ? 'mes (anual)' : 'mes' }}</span>
                    </div>

                    <ul class="flex flex-col gap-2 text-sm">
                        <li v-for="f in plan.features" :key="f" class="flex items-start gap-2">
                            <CheckIcon class="w-4 h-4 mt-0.5 shrink-0 text-success" />
                            <span>{{ f }}</span>
                        </li>
                    </ul>

                    <Button
                        :color="plan.highlight ? 'primary' : 'default'"
                        :variant="plan.highlight ? 'normal' : 'outline'"
                        full-width
                    >{{ plan.cta }}</Button>
                </Card>
            </div>

            <p class="text-center text-xs text-muted-foreground">
                Todos los precios en USD. Impuestos no incluidos. Cancela cuando quieras.
            </p>
        </div>
    </div>
</template>
