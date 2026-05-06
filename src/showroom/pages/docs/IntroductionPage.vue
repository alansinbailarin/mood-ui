<script setup lang="ts">
import { computed } from 'vue';
import {
    SparklesIcon,
    SwatchIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    BoltIcon,
    PuzzlePieceIcon,
    CodeBracketIcon,
    ArrowRightIcon,
} from '@heroicons/vue/24/outline';

import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Button from '../../../components/forms/Button.vue';
import Badge from '../../../components/feedback/Badge.vue';

import { useShowroomRouter } from '../../composables/useShowroomRouter';
import { useShowroomT } from '../../composables/useShowroomLocale';
import { vReveal, vRevealChildren } from '../../composables/useScrollReveal';
import { showroomNav } from '../../registry';
import Typography from '../../../components/data-display/Typography.vue';

const { go } = useShowroomRouter();
const t = useShowroomT();

const totalComponents = showroomNav
    .filter((c) => !['getting-started', 'docs', 'templates', 'theme-studio'].includes(c.id))
    .reduce((acc, c) => acc + c.entries.length, 0);

// Per-card visual identity: icon colors + geometric background patterns.
// Patterns use CSS background-image with `currentColor` + opacity so they
// adapt to any theme color mode automatically.
const cardStyles = [
    {
        // Theming — square grid
        iconClasses:    'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
        patternClasses: 'text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]',
        hoverBorder:    'hover:border-primary/50',
    },
    {
        // i18n — dot matrix, success green
        iconClasses:    'bg-success/10 text-success group-hover:bg-success group-hover:text-white',
        patternClasses: 'text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]',
        hoverBorder:    'hover:border-success/40',
    },
    {
        // Accessible — diagonal stripes, warning amber
        iconClasses:    'bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white',
        patternClasses: 'text-warning [background-image:repeating-linear-gradient(-60deg,currentColor_0,currentColor_1px,transparent_0,transparent_12px)]',
        hoverBorder:    'hover:border-warning/40',
    },
    {
        // Tree-shakeable — crosshatch, danger
        iconClasses:    'bg-danger/10 text-danger group-hover:bg-danger group-hover:text-white',
        patternClasses: 'text-danger [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:14px_14px]',
        hoverBorder:    'hover:border-danger/40',
    },
    {
        // Tailwind — large dots, primary
        iconClasses:    'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
        patternClasses: 'text-primary [background-image:radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:28px_28px]',
        hoverBorder:    'hover:border-primary/50',
    },
    {
        // TypeScript — horizontal scan-lines, success
        iconClasses:    'bg-success/10 text-success group-hover:bg-success group-hover:text-white',
        patternClasses: 'text-success [background-image:repeating-linear-gradient(0deg,currentColor_0,currentColor_1px,transparent_0,transparent_18px)]',
        hoverBorder:    'hover:border-success/40',
    },
];

const principles = computed(() => t.value.lang === 'es' ? [
    { icon: SwatchIcon,      title: 'Theming reactivo',    text: 'Cada token es una CSS var. Cambia color, radius, halo o densidad y todos los componentes responden al instante, sin remount.' },
    { icon: GlobeAltIcon,    title: 'i18n integrado',      text: 'Diccionarios ES y EN incluidos por defecto, con API para extender o sobreescribir cualquier cadena.' },
    { icon: ShieldCheckIcon, title: 'Accesible por defecto', text: 'Roles ARIA, focus rings visibles, navegación por teclado y contrastes verificados — sin trabajo extra.' },
    { icon: BoltIcon,        title: 'Tree-shakeable',      text: 'Importa solo lo que uses. Bundle inicial mínimo, ESM moderno, tipos completos.' },
    { icon: PuzzlePieceIcon, title: 'Tailwind v4 nativo',  text: '@theme inline + design tokens. Override desde tu propio config sin hacks.' },
    { icon: CodeBracketIcon, title: 'TypeScript first',    text: 'Cada prop, slot y evento tipado. IntelliSense útil de verdad.' },
] : [
    { icon: SwatchIcon,      title: 'Reactive theming',     text: 'Every token is a CSS var. Change color, radius, halo or density and every component reacts instantly — no remount.' },
    { icon: GlobeAltIcon,    title: 'Built-in i18n',        text: 'Spanish and English dictionaries by default, with an API to extend or override any string.' },
    { icon: ShieldCheckIcon, title: 'Accessible by default', text: 'ARIA roles, visible focus rings, keyboard nav and verified contrast ratios — no extra work.' },
    { icon: BoltIcon,        title: 'Tree-shakeable',       text: 'Import only what you use. Minimal initial bundle, modern ESM, full types.' },
    { icon: PuzzlePieceIcon, title: 'Tailwind v4 native',   text: '@theme inline + design tokens. Override from your own config without hacks.' },
    { icon: CodeBracketIcon, title: 'TypeScript first',     text: 'Every prop, slot and event typed. IntelliSense that actually helps.' },
]);
</script>

<template>
    <article class="prose prose-neutral dark:prose-invert max-w-none flex flex-col gap-12 pb-12">
        <header v-reveal class="flex flex-col gap-3">
            <Typography variant="overline" size="medium" color="muted">
                {{ t.home }}
            </Typography>
            <Typography variant="display" size="medium" as="h1" weight="medium" class="tracking-tight leading-[1.05]">       
            Mood-UI</Typography>

             <Typography
                variant="body"
                size="medium"
                color="muted"
                weight="light"
            >
                {{ t.lang === 'es'
                    ? `Una librería de componentes Vue 3 con ${totalComponents}+ piezas accesibles, theming reactivo y dark mode con superficies personalizables. Pensada para shippear rápido sin pelearte con el design system.`
                    : `A Vue 3 component library with ${totalComponents}+ accessible pieces, reactive theming and dark mode with customizable surfaces. Built to ship fast without fighting your design system.` }}
            </Typography>
        </header>

        <section v-reveal class="flex flex-col gap-4 not-prose">
            <Typography variant="heading" size="large" weight="medium" class="!m-0">
                {{ t.lang === 'es' ? '¿Por qué mood-ui?' : 'Why mood-ui?' }}
            </Typography>
            <div v-reveal-children class="grid sm:grid-cols-2 gap-4">
                <Card
                    v-for="(p, i) in principles"
                    :key="p.title"
                    variant="outlined"
                    padding="large"
                    class="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
                    :class="cardStyles[i].hoverBorder"
                >
                    <!-- Subtle geometric background unique to each card -->
                    <div
                        class="pointer-events-none absolute inset-0 opacity-[0.065]"
                        :class="cardStyles[i].patternClasses"
                    />
                    <Stack direction="column" spacing="small" class="relative">
                        <div
                            class="size-10 rounded-xl grid place-items-center transition-colors"
                            :class="cardStyles[i].iconClasses"
                        >
                            <component :is="p.icon" class="size-5" />
                        </div>
                        <Typography variant="title" size="small" as="h3">{{ p.title }}</Typography>
                        <Typography variant="body" size="small" color="muted">{{ p.text }}</Typography>
                    </Stack>
                </Card>
            </div>
        </section>

        <section v-reveal class="flex flex-col gap-4 not-prose">
            <Typography variant="heading" size="large" weight="medium" class="!m-0">
                {{ t.lang === 'es' ? '¿Cómo está organizado?' : 'How is it organized?' }}
            </Typography>
            <Typography variant="body"
                size="medium"
                color="muted"
                weight="light">
                {{ t.lang === 'es'
                ? 'La documentación se divide en cuatro grandes áreas. Empieza por instalación, dale una vuelta al theming y luego salta al catálogo de componentes.'
                : 'The docs are split into four big areas. Start with installation, take a tour through theming, then jump into the component catalog.' }}
            </Typography>
           
            <div class="grid sm:grid-cols-2 gap-3">
                <button
                    type="button"
                    class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
                    @click="go('installation')"
                >
                    <h3 class="text-base font-semibold text-foreground !m-0 mb-1">{{ t.installation }}</h3>
                    <p class="text-sm text-muted-foreground !m-0">npm, peer deps y setup en 60 segundos.</p>
                    <span class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all">
                        {{ t.lang === 'es' ? 'Empezar' : 'Start' }} <ArrowRightIcon class="size-4" />
                    </span>
                </button>
                <button
                    type="button"
                    class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
                    @click="go('theming')"
                >
                    <h3 class="text-base font-semibold text-foreground !m-0 mb-1">{{ t.theming }}</h3>
                    <p class="text-sm text-muted-foreground !m-0">{{ t.lang === 'es' ? 'Tokens, palettes, surfaces y dark mode.' : 'Tokens, palettes, surfaces and dark mode.' }}</p>
                    <span class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all">
                        {{ t.lang === 'es' ? 'Personalizar' : 'Customize' }} <ArrowRightIcon class="size-4" />
                    </span>
                </button>
                <button
                    type="button"
                    class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
                    @click="go('i18n')"
                >
                    <h3 class="text-base font-semibold text-foreground !m-0 mb-1">{{ t.i18n }}</h3>
                    <p class="text-sm text-muted-foreground !m-0">{{ t.lang === 'es' ? 'Cambia idiomas en runtime, extiende dicts.' : 'Switch languages at runtime, extend dicts.' }}</p>
                    <span class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all">
                        {{ t.lang === 'es' ? 'Traducir' : 'Translate' }} <ArrowRightIcon class="size-4" />
                    </span>
                </button>
                <button
                    type="button"
                    class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
                    @click="go('changelog')"
                >
                    <h3 class="text-base font-semibold text-foreground !m-0 mb-1">{{ t.changelog }}</h3>
                    <p class="text-sm text-muted-foreground !m-0">{{ t.lang === 'es' ? 'Qué hay nuevo en cada release.' : "What's new in every release." }}</p>
                    <span class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all">
                        {{ t.lang === 'es' ? 'Ver historial' : 'See history' }} <ArrowRightIcon class="size-4" />
                    </span>
                </button>
            </div>
        </section>
    </article>
</template>
