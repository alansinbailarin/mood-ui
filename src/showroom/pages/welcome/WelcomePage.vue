<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    ArrowRightIcon,
    SparklesIcon,
    SwatchIcon,
    GlobeAltIcon,
    MoonIcon,
    BoltIcon,
    ShieldCheckIcon,
    PuzzlePieceIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    ArrowTopRightOnSquareIcon,
    HeartIcon,
} from '@heroicons/vue/24/outline';
import { CheckBadgeIcon } from '@heroicons/vue/24/solid';

import Card from '../../../components/data-display/Card.vue';
import Stack from '../../../components/layout/Stack.vue';
import Button from '../../../components/forms/Button.vue';
import Input from '../../../components/forms/Input.vue';
import Switch from '../../../components/forms/Switch.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import AvatarGroup from '../../../components/data-display/avatar/AvatarGroup.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';

import { useShowroomRouter } from '../../composables/useShowroomRouter';
import { useShowroomT } from '../../composables/useShowroomLocale';
import { vReveal, vRevealChildren } from '../../composables/useScrollReveal';
import { showroomNav } from '../../registry';

const { go } = useShowroomRouter();
const t = useShowroomT();

const totalComponents = showroomNav
    .filter((c) => !['getting-started', 'docs', 'templates', 'theme-studio'].includes(c.id))
    .reduce((acc, c) => acc + c.entries.length, 0);

// Live mini-demo state
const demoEmail = ref('jane@mood-ui.dev');
const demoNotif = ref(true);
const demoStatus = ref<'live' | 'building' | 'failed'>('live');

const statusMap = {
    live:     { color: 'success' as const, label: 'Live' },
    building: { color: 'warning' as const, label: 'Building' },
    failed:   { color: 'danger'  as const, label: 'Failed' },
};
const statusBadge = computed(() => statusMap[demoStatus.value]);

const stats = computed(() => [
    { label: t.value.components, value: String(totalComponents) },
    { label: 'Composables',      value: '24' },
    { label: t.value.language,   value: 'ES · EN' },
    { label: 'Bundle (gzip)',    value: '131 KB' },
]);

const featureList = computed(() => {
    const isEs = t.value.lang === 'es';
    return isEs
        ? [
            { icon: SwatchIcon,        title: 'Theming reactivo',    text: 'Cambia color, radius, tamaño, halo y modo claro/oscuro en vivo. Todos los componentes responden al instante.' },
            { icon: GlobeAltIcon,      title: 'i18n integrado',      text: 'Español e inglés incluidos. Cambia idioma globalmente con useLocale().set("es").' },
            { icon: MoonIcon,          title: 'Dark mode + surfaces', text: '6 presets de superficies oscuras (navy, zinc, charcoal…) o personaliza los 14 tokens semánticos.' },
            { icon: ShieldCheckIcon,   title: 'Accesibilidad WAI-ARIA', text: 'Roles, focus rings, navegación por teclado y lectores de pantalla cubiertos por defecto.' },
            { icon: BoltIcon,          title: 'Tree-shakeable · TS first', text: 'Importa solo lo que usas. Tipos completos, autocompletado IntelliSense, ESM + CJS.' },
            { icon: PuzzlePieceIcon,   title: 'Tailwind v4 native',  text: 'CSS-vars, design tokens y @theme inline. Override desde tu tailwind.config sin hacks.' },
        ]
        : [
            { icon: SwatchIcon,        title: 'Reactive theming',    text: 'Change color, radius, size, halo and light/dark mode live. Every component reacts instantly.' },
            { icon: GlobeAltIcon,      title: 'Built-in i18n',       text: 'Spanish and English included. Switch language globally with useLocale().set("en").' },
            { icon: MoonIcon,          title: 'Dark mode + surfaces', text: '6 dark surface presets (navy, zinc, charcoal…) or tune all 14 semantic tokens yourself.' },
            { icon: ShieldCheckIcon,   title: 'WAI-ARIA accessible', text: 'Roles, focus rings, keyboard navigation and screen readers covered out of the box.' },
            { icon: BoltIcon,          title: 'Tree-shakeable · TS first', text: 'Import only what you use. Full types, IntelliSense autocomplete, ESM + CJS.' },
            { icon: PuzzlePieceIcon,   title: 'Tailwind v4 native',  text: 'CSS vars, design tokens and @theme inline. Override from your tailwind.config — no hacks.' },
        ];
});

const categoryHighlights = computed(() =>
    showroomNav
        .filter((c) => !['getting-started', 'docs', 'templates', 'theme-studio'].includes(c.id))
        .map((c) => ({
            id: c.id,
            title: c.title,
            count: c.entries.length,
            firstEntryId: c.entries[0]?.id,
        })),
);

const installCmd = 'npm install mood-ui';
const usageCode = `import { ModoProvider, Button } from 'mood-ui';
import 'mood-ui/style.css';

<ModoProvider color="primary" theme="system">
  <Button color="primary">Hello mood-ui</Button>
</ModoProvider>`;

const copied = ref<'install' | 'usage' | null>(null);
async function copy(value: string, kind: 'install' | 'usage') {
    try {
        await navigator.clipboard.writeText(value);
        copied.value = kind;
        setTimeout(() => (copied.value = null), 1500);
    } catch { /* no-op */ }
}

const teamUsers = [
    { name: 'Olivia',  src: 'https://i.pravatar.cc/64?img=47' },
    { name: 'Phoenix', src: 'https://i.pravatar.cc/64?img=12' },
    { name: 'Lana',    src: 'https://i.pravatar.cc/64?img=32' },
    { name: 'Demi',    src: 'https://i.pravatar.cc/64?img=5'  },
    { name: 'Candice', src: 'https://i.pravatar.cc/64?img=24' },
];
</script>

<template>
    <!-- ─────────────────────────  HERO  ───────────────────────── -->
    <section class="relative overflow-hidden pt-10 lg:pt-16">
            <!-- Soft, breathing gradient backdrop -->
            <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div class="showroom-hero-glow absolute -top-40 left-1/2 w-[1200px] h-[640px] rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl"></div>
                <div class="absolute top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-accent/25 to-transparent blur-3xl opacity-70"></div>
                <!-- Faint grid -->
                <div
                    class="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
                ></div>
            </div>

            <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
                <!-- LEFT — Headline -->
                <div v-reveal class="flex flex-col gap-7">
                    <a
                        href="https://github.com/alansinbailarin/mood-ui"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
                    >
                        <span class="size-1.5 rounded-full bg-success animate-pulse"></span>
                        v0.5.2 · {{ t.welcomeBadge }}
                        <ArrowTopRightOnSquareIcon class="size-3.5" />
                    </a>

                    <h1 class="text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-light leading-[1.02] tracking-[-0.04em] text-foreground">
                        {{ t.welcomeHeadline1 }}
                        <span class="block font-medium bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                            {{ t.welcomeHeadline2 }}
                        </span>
                    </h1>

                    <p class="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed font-light">
                        {{ t.welcomeLead(totalComponents) }}
                    </p>

                    <div class="flex flex-wrap items-center gap-3 pt-2">
                        <Button color="primary" size="large" @click="go('button')">
                            {{ t.ctaExplore }}
                            <template #suffix><ArrowRightIcon class="size-5" /></template>
                        </Button>
                        <Button
                            as="a"
                            href="https://github.com/alansinbailarin/mood-ui"
                            target="_blank"
                            rel="noopener"
                            variant="outline"
                            size="large"
                        >
                            {{ t.ctaGithub }}
                        </Button>
                    </div>

                    <!-- Trust strip -->
                    <div class="flex items-center gap-4 pt-5">
                        <AvatarGroup size="small" :max="5">
                            <Avatar
                                v-for="u in teamUsers"
                                :key="u.name"
                                :src="u.src"
                                :alt="u.name"
                                size="small"
                            />
                        </AvatarGroup>
                        <div class="text-sm text-muted-foreground">
                            <span class="text-foreground font-semibold">320+</span>
                            {{ t.trustLine }}
                        </div>
                    </div>
                </div>

                <!-- RIGHT — Live mini app preview -->
                <div v-reveal="'right'" class="relative">
                    <div class="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-2xl"></div>

                    <Card variant="elevated" padding="none" class="overflow-hidden shadow-2xl ring-1 ring-border/60">
                        <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                            <div class="flex items-center gap-1.5">
                                <span class="size-2.5 rounded-full bg-danger/70"></span>
                                <span class="size-2.5 rounded-full bg-warning/70"></span>
                                <span class="size-2.5 rounded-full bg-success/70"></span>
                            </div>
                            <span class="text-[11px] text-muted-foreground font-mono">app.mood-ui.dev</span>
                            <span class="size-2.5"></span>
                        </div>

                        <div class="p-6 flex flex-col gap-5">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <Avatar :src="teamUsers[0].src" alt="Olivia" size="medium" />
                                    <div>
                                        <div class="text-sm font-semibold text-foreground">Olivia Rhye</div>
                                        <div class="text-xs text-muted-foreground">Product Designer</div>
                                    </div>
                                </div>
                                <Badge :color="statusBadge.color" variant="subtle">
                                    {{ statusBadge.label }}
                                </Badge>
                            </div>

                            <Input
                                v-model="demoEmail"
                                label="Email"
                                placeholder="you@example.com"
                                size="medium"
                            />

                            <div class="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                                <div>
                                    <div class="text-sm font-medium text-foreground">
                                        {{ t.lang === 'es' ? 'Notificaciones' : 'Notifications' }}
                                    </div>
                                    <div class="text-xs text-muted-foreground">
                                        {{ t.lang === 'es' ? 'Recibe updates por email' : 'Receive email updates' }}
                                    </div>
                                </div>
                                <Switch v-model="demoNotif" size="medium" />
                            </div>

                            <div class="flex items-center gap-2">
                                <Tooltip content="Cambiar el estado de deploy">
                                    <Button
                                        size="small"
                                        variant="outline"
                                        @click="demoStatus = demoStatus === 'live' ? 'building' : demoStatus === 'building' ? 'failed' : 'live'"
                                    >
                                        Toggle status
                                    </Button>
                                </Tooltip>
                                <Button size="small" color="primary" class="ml-auto">
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div class="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-1.5 bg-card border border-border rounded-full pl-1 pr-3 py-1 shadow-lg">
                        <span class="size-6 rounded-full bg-success/15 grid place-items-center">
                            <CheckBadgeIcon class="size-4 text-success" />
                        </span>
                        <span class="text-xs font-medium">100% accesible</span>
                    </div>
                </div>
            </div>
            </div>
    </section>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-28 pt-28 pb-20">

        <!-- ───────────────────────  STATS STRIP  ─────────────────── -->
        <section v-reveal>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border">
                <div
                    v-for="s in stats"
                    :key="s.label"
                    class="bg-card p-6 flex flex-col gap-1"
                >
                    <span class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                        {{ s.label }}
                    </span>
                    <span class="text-3xl lg:text-4xl font-light tracking-tight text-foreground">
                        {{ s.value }}
                    </span>
                </div>
            </div>
        </section>

        <!-- ───────────────────────  FEATURES  ────────────────────── -->
        <section class="flex flex-col gap-12">
            <div v-reveal class="flex flex-col gap-3 max-w-2xl">
                <Badge color="primary" variant="subtle" class="self-start">
                    <SparklesIcon class="size-3.5 mr-1" />
                    {{ t.featuresKicker }}
                </Badge>
                <h2 class="text-3xl lg:text-5xl font-light tracking-tight text-foreground leading-[1.1]">
                    {{ t.featuresTitle }}
                </h2>
                <p class="text-base lg:text-lg text-muted-foreground font-light leading-relaxed">
                    {{ t.featuresSubtitle }}
                </p>
            </div>

            <div v-reveal-children class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                    v-for="f in featureList"
                    :key="f.title"
                    variant="outlined"
                    padding="large"
                    class="group hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Stack direction="column" spacing="medium">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <component :is="f.icon" class="size-5" />
                        </div>
                        <h3 class="text-lg font-semibold text-foreground">{{ f.title }}</h3>
                        <p class="text-sm text-muted-foreground leading-relaxed">{{ f.text }}</p>
                    </Stack>
                </Card>
            </div>
        </section>

        <!-- ───────────────────────  INSTALL  ─────────────────────── -->
        <section class="flex flex-col gap-10">
            <div v-reveal class="flex flex-col gap-3 max-w-2xl">
                <Badge color="success" variant="subtle" class="self-start">
                    {{ t.installKicker }}
                </Badge>
                <h2 class="text-3xl lg:text-5xl font-light tracking-tight text-foreground">
                    {{ t.installTitle }}
                </h2>
            </div>

            <div v-reveal class="grid lg:grid-cols-2 gap-4">
                <Card variant="outlined" padding="none" class="overflow-hidden">
                    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                        <span class="text-xs font-mono text-muted-foreground">terminal</span>
                        <Tooltip :content="copied === 'install' ? 'Copiado!' : 'Copiar'">
                            <button
                                type="button"
                                aria-label="Copiar comando de instalación"
                                class="text-muted-foreground hover:text-foreground transition-colors"
                                @click="copy(installCmd, 'install')"
                            >
                                <CheckIcon v-if="copied === 'install'" class="size-4 text-success" />
                                <ClipboardDocumentIcon v-else class="size-4" />
                            </button>
                        </Tooltip>
                    </div>
                    <pre class="p-5 font-mono text-sm overflow-x-auto"><span class="text-muted-foreground select-none">$ </span><span class="text-foreground">{{ installCmd }}</span></pre>
                </Card>

                <Card variant="outlined" padding="none" class="overflow-hidden lg:row-span-2">
                    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                        <span class="text-xs font-mono text-muted-foreground">App.vue</span>
                        <Tooltip :content="copied === 'usage' ? 'Copiado!' : 'Copiar'">
                            <button
                                type="button"
                                aria-label="Copiar código de uso"
                                class="text-muted-foreground hover:text-foreground transition-colors"
                                @click="copy(usageCode, 'usage')"
                            >
                                <CheckIcon v-if="copied === 'usage'" class="size-4 text-success" />
                                <ClipboardDocumentIcon v-else class="size-4" />
                            </button>
                        </Tooltip>
                    </div>
                    <pre class="p-5 font-mono text-sm overflow-x-auto leading-relaxed text-foreground"><code>{{ usageCode }}</code></pre>
                </Card>

                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="small">
                        <h3 class="text-lg font-semibold">{{ t.nextSteps }}</h3>
                        <p class="text-sm text-muted-foreground">{{ t.nextStepsBody }}</p>
                        <div class="flex flex-wrap gap-2 pt-2">
                            <Button size="small" variant="outline" @click="go('button')">
                                {{ t.components }}
                            </Button>
                            <Button size="small" variant="outline" @click="go('theming')">
                                {{ t.theming }}
                            </Button>
                            <Button
                                as="a"
                                href="https://www.npmjs.com/package/mood-ui"
                                target="_blank"
                                rel="noopener"
                                size="small"
                                variant="ghost"
                            >
                                npm
                                <template #suffix><ArrowTopRightOnSquareIcon class="size-3.5" /></template>
                            </Button>
                        </div>
                    </Stack>
                </Card>
            </div>
        </section>

        <!-- ───────────────────────  CATALOG WALL  ─────────────────── -->
        <section class="flex flex-col gap-12">
            <div v-reveal class="flex flex-col gap-3 max-w-2xl">
                <Badge color="warning" variant="subtle" class="self-start">
                    {{ t.catalogKicker }}
                </Badge>
                <h2 class="text-3xl lg:text-5xl font-light tracking-tight text-foreground">
                    {{ t.catalogTitle(totalComponents) }}
                </h2>
                <p class="text-base lg:text-lg text-muted-foreground font-light leading-relaxed">
                    {{ t.catalogSubtitle }}
                </p>
            </div>

            <div v-reveal-children class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card
                    v-for="cat in categoryHighlights"
                    :key="cat.id"
                    variant="outlined"
                    padding="large"
                    class="group cursor-pointer hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    @click="cat.firstEntryId && go(cat.firstEntryId)"
                >
                    <Stack direction="column" spacing="small">
                        <div class="flex items-center justify-between">
                            <h3 class="text-base font-semibold">{{ cat.title }}</h3>
                            <Badge color="primary" variant="subtle">{{ cat.count }}</Badge>
                        </div>
                        <span class="text-xs text-muted-foreground">{{ t.clickToExplore }}</span>
                        <div class="flex items-center text-primary text-sm font-medium pt-2 group-hover:gap-2 gap-1 transition-all">
                            {{ t.viewComponents }}
                            <ArrowRightIcon class="size-4" />
                        </div>
                    </Stack>
                </Card>
            </div>
        </section>

        <!-- ───────────────────────  FOOTER CTA  ─────────────────── -->
        <section v-reveal="'scale'">
            <Card
                variant="elevated"
                padding="large"
                class="relative overflow-hidden bg-gradient-to-br from-primary/8 via-card to-accent/8 border-primary/20"
            >
                <div class="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/15 blur-3xl"></div>

                <div class="relative grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
                    <div class="flex flex-col gap-4">
                        <h2 class="text-3xl lg:text-5xl font-light tracking-tight text-foreground">
                            {{ t.finalCtaTitle }}
                        </h2>
                        <p class="text-base lg:text-lg text-muted-foreground font-light leading-relaxed">
                            {{ t.finalCtaBody }}
                        </p>
                        <div class="flex flex-wrap gap-3 pt-2">
                            <Button color="primary" size="large" @click="go('button')">
                                {{ t.ctaExplore }}
                                <template #suffix><ArrowRightIcon class="size-5" /></template>
                            </Button>
                            <Button
                                as="a"
                                href="https://github.com/alansinbailarin/mood-ui"
                                target="_blank"
                                rel="noopener"
                                variant="ghost"
                                size="large"
                            >
                                <template #prefix><HeartIcon class="size-5" /></template>
                                {{ t.starOnGithub }}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    </div>
</template>
