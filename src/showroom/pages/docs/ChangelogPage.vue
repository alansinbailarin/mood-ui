<script setup lang="ts">
import { computed } from 'vue';
import { TagIcon, BookOpenIcon, PaintBrushIcon } from '@heroicons/vue/24/outline';

import Typography from '../../../components/data-display/Typography.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';

import { useShowroomT } from '../../composables/useShowroomLocale';
import { vReveal } from '../../composables/useScrollReveal';
import { useShowroomRouter } from '../../composables/useShowroomRouter';

const t = useShowroomT();
const { go } = useShowroomRouter();

interface Release {
    version: string;
    date: string;
    tag: 'major' | 'minor' | 'patch';
    es: { title: string; items: string[] };
    en: { title: string; items: string[] };
}

const releases: Release[] = [
    {
        version: 'v0.5.2',
        date: '2026-05-01',
        tag: 'patch',
        es: {
            title: 'Pulido de showroom + a11y',
            items: [
                'Nuevo selector de surface preset en la barra de configuración.',
                'Search palette ahora usa el componente SearchInput nativo.',
                'View transitions entre páginas (Chromium / Safari TP).',
                'Headline del welcome más liviano y con scroll-reveal.',
                'Botón "Star on GitHub" en el header con traducción ES/EN.',
            ],
        },
        en: {
            title: 'Showroom polish + a11y',
            items: [
                'New surface-preset picker inside the settings popover.',
                'Search palette now uses the native SearchInput component.',
                'View transitions between routes (Chromium / Safari TP).',
                'Lighter welcome headline with scroll-reveal animations.',
                '"Star on GitHub" button in the header, translated ES/EN.',
            ],
        },
    },
    {
        version: 'v0.5.0',
        date: '2026-04-22',
        tag: 'minor',
        es: {
            title: 'Plantillas + theme studio',
            items: [
                'Plantillas: Dashboard, Auth, Pricing y Settings.',
                'Theme Studio interactivo con preview en vivo.',
                'Nuevo componente Scheduler con drag & drop.',
                'Soporte para 6 dark surface presets.',
            ],
        },
        en: {
            title: 'Templates + theme studio',
            items: [
                'Templates: Dashboard, Auth, Pricing and Settings.',
                'Interactive Theme Studio with live preview.',
                'New Scheduler component with drag & drop.',
                'Support for 6 dark surface presets.',
            ],
        },
    },
    {
        version: 'v0.4.0',
        date: '2026-03-30',
        tag: 'minor',
        es: {
            title: 'Calendar suite + Table',
            items: [
                'Calendar, MonthView, WeekView, DayView, AgendaView.',
                'Table: virtualización, multi-sort, server-side, tree rows.',
                'DateRangePicker y DateTimePicker.',
            ],
        },
        en: {
            title: 'Calendar suite + Table',
            items: [
                'Calendar, MonthView, WeekView, DayView, AgendaView.',
                'Table: virtualization, multi-sort, server-side, tree rows.',
                'DateRangePicker and DateTimePicker.',
            ],
        },
    },
    {
        version: 'v0.3.0',
        date: '2026-02-14',
        tag: 'minor',
        es: {
            title: 'Dark surfaces + i18n',
            items: [
                'Dark surface presets (navy, zinc, charcoal, midnight, forest).',
                'i18n built-in con dicts ES/EN.',
                'useToast / useConfirm composables.',
            ],
        },
        en: {
            title: 'Dark surfaces + i18n',
            items: [
                'Dark surface presets (navy, zinc, charcoal, midnight, forest).',
                'Built-in i18n with ES/EN dicts.',
                'useToast / useConfirm composables.',
            ],
        },
    },
    {
        version: 'v0.1.0',
        date: '2026-01-08',
        tag: 'major',
        es: {
            title: 'Primer release público',
            items: [
                '40+ componentes base.',
                'ModoProvider con theming reactivo.',
                'Tailwind v4 + design tokens.',
            ],
        },
        en: {
            title: 'First public release',
            items: [
                '40+ base components.',
                'ModoProvider with reactive theming.',
                'Tailwind v4 + design tokens.',
            ],
        },
    },
];

const tagColor = (tag: Release['tag']) =>
    tag === 'major' ? 'danger' as const : tag === 'minor' ? 'primary' as const : 'success' as const;

const items = computed(() => releases.map((r) => ({
    ...r,
    body: t.value.lang === 'es' ? r.es : r.en,
})));
</script>

<template>
    <article class="flex flex-col gap-12 pb-12">
        <header v-reveal class="flex flex-col gap-3">
            <Typography variant="overline" size="medium" color="muted">
                Documentación
            </Typography>
            <Typography variant="display" size="medium" as="h1" weight="medium" class="tracking-tight leading-[1.05]">
                {{ t.changelog }}
            </Typography>
            <Typography variant="body" size="medium" color="muted" weight="light">
                {{ t.lang === 'es'
                    ? 'Cada release listado de más reciente a más antiguo. Seguimos SemVer.'
                    : 'Every release listed newest first. We follow SemVer.' }}
            </Typography>
        </header>

        <ol class="relative flex flex-col gap-6 border-l border-border pl-6 ml-2">
            <li v-for="r in items" :key="r.version" v-reveal="'left'" class="relative">
                <span
                    class="absolute -left-[34px] top-2 grid place-items-center size-7 rounded-full bg-card ring-1 ring-primary/40 text-primary"
                >
                    <TagIcon class="size-3.5" />
                </span>
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="small">
                        <div class="flex items-center gap-3 flex-wrap">
                            <Typography variant="title" size="large" as="h2" weight="semibold">{{ r.version }}</Typography>
                            <Badge :color="tagColor(r.tag)" variant="subtle" class="capitalize">
                                {{ r.tag }}
                            </Badge>
                            <time :datetime="r.date" class="text-xs font-mono text-muted-foreground ml-auto">{{ r.date }}</time>
                        </div>
                        <Typography variant="body" size="medium" weight="medium">{{ r.body.title }}</Typography>
                        <ul class="space-y-1.5 text-sm text-muted-foreground list-disc pl-4">
                            <li v-for="(item, idx) in r.body.items" :key="idx">{{ item }}</li>
                        </ul>
                    </Stack>
                </Card>
            </li>
        </ol>

        <!-- Next steps -->
        <section v-reveal class="flex flex-col gap-4">
            <Typography variant="heading" size="large" weight="medium">
                Próximos pasos
            </Typography>
            <div class="grid sm:grid-cols-2 gap-4">
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('introduction')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <BookOpenIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Introducción</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            Fundamentos, arquitectura y por qué mood-ui.
                        </Typography>
                    </Stack>
                </Card>
                <Card
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
                    @click="go('theming')"
                >
                    <div class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                    <Stack direction="column" spacing="small" class="relative">
                        <div class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors">
                            <PaintBrushIcon class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="medium" as="h3">Theming</Typography>
                        <Typography variant="body" size="small" color="muted" weight="light">
                            Tokens, palettes, surfaces y dark mode.
                        </Typography>
                    </Stack>
                </Card>
            </div>
        </section>
    </article>
</template>
