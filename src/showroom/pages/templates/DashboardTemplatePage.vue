<script setup lang="ts">
import { ref } from 'vue';
import {
    UsersIcon, BanknotesIcon, ShoppingCartIcon, ArrowTrendingUpIcon,
    BellIcon, MagnifyingGlassIcon, RocketLaunchIcon, CheckCircleIcon, BeakerIcon,
} from '@heroicons/vue/24/outline';

import Stat from '../../../components/data-display/Stat.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Button from '../../../components/forms/Button.vue';
import SearchInput from '../../../components/forms/SearchInput.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import Timeline from '../../../components/data-display/Timeline.vue';
import Segmented from '../../../components/forms/Segmented.vue';

const range = ref('7d');
const search = ref('');

const orders = [
    { id: '#3201', user: 'Ana López',    plan: 'Pro',     status: 'paid',    amount: '$249' },
    { id: '#3202', user: 'Mateo Ríos',   plan: 'Starter', status: 'pending', amount: '$49'  },
    { id: '#3203', user: 'Sofía Vega',   plan: 'Pro',     status: 'paid',    amount: '$249' },
    { id: '#3204', user: 'Diego Núñez',  plan: 'Team',    status: 'failed',  amount: '$499' },
    { id: '#3205', user: 'Lucía Pardo',  plan: 'Pro',     status: 'paid',    amount: '$249' },
];

function statusColor(s: string): 'success' | 'warning' | 'danger' {
    if (s === 'paid')    return 'success';
    if (s === 'pending') return 'warning';
    return 'danger';
}

const activity = [
    { id: 1, title: 'Nuevo deploy en producción', timestamp: 'hace 4 min', icon: RocketLaunchIcon, variant: 'icon' as const },
    { id: 2, title: '12 pagos procesados',         timestamp: 'hace 22 min', icon: CheckCircleIcon, color: 'success' as const, variant: 'icon' as const },
    { id: 3, title: 'Migración DB completada',     timestamp: 'hace 1 h',   icon: BeakerIcon, color: 'warning' as const, variant: 'icon' as const },
    { id: 4, title: 'Nuevo usuario: lucia@…',      timestamp: 'hace 2 h',   icon: UsersIcon,  variant: 'icon' as const },
];
</script>

<template>
    <div class="min-h-[800px] bg-background text-foreground rounded-2xl border border-border overflow-hidden">
        <!-- Topbar -->
        <header class="flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-card">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-black">m</div>
                <span class="font-semibold">mood-ui · admin</span>
            </div>
            <div class="flex-1 max-w-md">
                <SearchInput v-model="search" placeholder="Buscar pedidos, usuarios…" />
            </div>
            <div class="flex items-center gap-2">
                <Button variant="ghost" :icon="BellIcon" aria-label="Notificaciones" />
                <Avatar fallback="AS" size="small" />
            </div>
        </header>

        <div class="p-6 flex flex-col gap-6">
            <!-- Header row -->
            <div class="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <Typography variant="title" size="medium">Buenas tardes, Alan</Typography>
                    <Typography variant="body" color="muted">Aquí tienes un resumen de tu negocio.</Typography>
                </div>
                <Segmented
                    v-model="range"
                    :items="[
                        { value: '24h', label: '24h' },
                        { value: '7d',  label: '7d'  },
                        { value: '30d', label: '30d' },
                        { value: 'ytd', label: 'YTD' },
                    ]"
                    color="primary"
                />
            </div>

            <!-- KPIs -->
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Revenue"    value="$48,592" :icon="BanknotesIcon"        color="success" variant="outlined" :trend="{ value: 12.5 }" description="vs. 7d" />
                <Stat label="Users"      value="12,403"  :icon="UsersIcon"            color="primary" variant="outlined" :trend="{ value: 8.2 }"  description="nuevos: 312" />
                <Stat label="Orders"     value="3,201"   :icon="ShoppingCartIcon"     color="warning" variant="outlined" :trend="{ value: -3.1 }" description="vs. 7d" />
                <Stat label="Conversion" value="3.42%"   :icon="ArrowTrendingUpIcon"  color="danger"  variant="outlined" :trend="{ value: -1.5, label: '-1.5pp' }" description="vs. 7d" />
            </div>

            <!-- Bottom grid -->
            <div class="grid lg:grid-cols-3 gap-4">
                <Card class="lg:col-span-2 p-0 overflow-hidden">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-border">
                        <Typography variant="title" size="small">Pedidos recientes</Typography>
                        <Button size="small" variant="ghost">Ver todos</Button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="text-left text-muted-foreground bg-muted/40">
                                    <th class="py-2 px-5 font-medium">ID</th>
                                    <th class="py-2 px-5 font-medium">Cliente</th>
                                    <th class="py-2 px-5 font-medium">Plan</th>
                                    <th class="py-2 px-5 font-medium">Estado</th>
                                    <th class="py-2 px-5 font-medium text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="o in orders" :key="o.id" class="border-t border-border hover:bg-muted/30">
                                    <td class="py-3 px-5 font-mono text-xs">{{ o.id }}</td>
                                    <td class="py-3 px-5">{{ o.user }}</td>
                                    <td class="py-3 px-5 text-muted-foreground">{{ o.plan }}</td>
                                    <td class="py-3 px-5">
                                        <Badge :color="statusColor(o.status)" variant="subtle">{{ o.status }}</Badge>
                                    </td>
                                    <td class="py-3 px-5 text-right font-mono">{{ o.amount }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card class="p-5">
                    <Typography variant="title" size="small" class="mb-4">Actividad</Typography>
                    <Timeline :items="activity" size="small" />
                </Card>
            </div>
        </div>
    </div>
</template>
