<script setup lang="ts">
import { computed } from 'vue';
import {
    ChartBarIcon,
    LockClosedIcon,
    CurrencyDollarIcon,
    Cog6ToothIcon,
    ArrowRightIcon,
} from '@heroicons/vue/24/outline';

import Card from '../../../components/data-display/Card.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Stack from '../../../components/layout/Stack.vue';

import { useShowroomRouter } from '../../composables/useShowroomRouter';
import { useShowroomT } from '../../composables/useShowroomLocale';
import { vReveal, vRevealChildren } from '../../composables/useScrollReveal';

const { go } = useShowroomRouter();
const t = useShowroomT();

interface Tpl {
    id: string;
    icon: unknown;
    es: { title: string; desc: string };
    en: { title: string; desc: string };
    tone: 'primary' | 'success' | 'warning' | 'danger';
}

const templates: Tpl[] = [
    { id: 'dashboard', icon: ChartBarIcon,       tone: 'primary', es: { title: 'Dashboard', desc: 'Panel de control con KPIs, tabla de pedidos y timeline de actividad.' }, en: { title: 'Dashboard', desc: 'Admin panel with KPIs, orders table and activity timeline.' } },
    { id: 'auth',      icon: LockClosedIcon,     tone: 'success', es: { title: 'Auth', desc: 'Login, registro y recuperación con layout dual y branding flexible.' }, en: { title: 'Auth', desc: 'Login, signup and recovery with dual layout and flexible branding.' } },
    { id: 'pricing',   icon: CurrencyDollarIcon, tone: 'warning', es: { title: 'Pricing', desc: 'Tabla comparativa de planes con badges, FAQ y CTA destacado.' }, en: { title: 'Pricing', desc: 'Comparative plan table with badges, FAQ and highlighted CTA.' } },
    { id: 'settings',  icon: Cog6ToothIcon,      tone: 'danger',  es: { title: 'Settings', desc: 'Página de ajustes con secciones agrupadas, tabs y forms accesibles.' }, en: { title: 'Settings', desc: 'Settings page with grouped sections, tabs and accessible forms.' } },
];

const items = computed(() => templates.map((tpl) => ({
    ...tpl,
    body: t.value.lang === 'es' ? tpl.es : tpl.en,
})));
</script>

<template>
    <div class="flex flex-col gap-10 pb-12">
        <header v-reveal class="flex flex-col gap-3 max-w-2xl">
            <Badge color="primary" variant="subtle" class="self-start">
                {{ t.templates }}
            </Badge>
            <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
                {{ t.templatesPickTitle }}
            </h1>
            <p class="text-lg text-muted-foreground font-light leading-relaxed">
                {{ t.templatesPickSubtitle }}
            </p>
        </header>

        <div v-reveal-children class="grid sm:grid-cols-2 gap-5">
            <Card
                v-for="tpl in items"
                :key="tpl.id"
                variant="outlined"
                padding="none"
                class="group cursor-pointer overflow-hidden hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                @click="go(tpl.id)"
            >
                <!-- Faux preview surface -->
                <div
                    class="relative h-48 border-b border-border overflow-hidden"
                    :class="{
                        'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent': tpl.tone === 'primary',
                        'bg-gradient-to-br from-success/15 via-success/5 to-transparent': tpl.tone === 'success',
                        'bg-gradient-to-br from-warning/15 via-warning/5 to-transparent': tpl.tone === 'warning',
                        'bg-gradient-to-br from-danger/15  via-danger/5  to-transparent': tpl.tone === 'danger',
                    }"
                >
                    <!-- Faux UI shapes -->
                    <div class="absolute inset-0 p-5 flex flex-col gap-2">
                        <div class="h-3 w-1/2 rounded bg-card/80 ring-1 ring-border"></div>
                        <div class="h-2.5 w-1/3 rounded bg-card/60 ring-1 ring-border"></div>
                        <div class="grid grid-cols-3 gap-2 mt-2">
                            <div class="h-12 rounded bg-card/80 ring-1 ring-border"></div>
                            <div class="h-12 rounded bg-card/80 ring-1 ring-border"></div>
                            <div class="h-12 rounded bg-card/80 ring-1 ring-border"></div>
                        </div>
                        <div class="flex-1 rounded bg-card/70 ring-1 ring-border mt-2"></div>
                    </div>

                    <!-- Icon badge -->
                    <div class="absolute top-3 right-3 size-9 rounded-lg bg-card/90 ring-1 ring-border grid place-items-center text-foreground/80 group-hover:scale-110 transition-transform">
                        <component :is="tpl.icon" class="size-5" />
                    </div>
                </div>

                <Stack direction="column" spacing="small" class="p-5">
                    <h3 class="text-lg font-semibold text-foreground !m-0">{{ tpl.body.title }}</h3>
                    <p class="text-sm text-muted-foreground leading-relaxed">{{ tpl.body.desc }}</p>
                    <span class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-1 group-hover:gap-2 transition-all">
                        {{ t.openTemplate }}
                        <ArrowRightIcon class="size-4" />
                    </span>
                </Stack>
            </Card>
        </div>
    </div>
</template>
