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

import Typography from '../../../components/data-display/Typography.vue';
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
import { showroomNav } from '../../registry';

import logoUrl from '../../../assets/logo-mood-ui.png';

const { go } = useShowroomRouter();
const totalComponents = showroomNav.reduce((acc, c) => acc + c.entries.length, 0);

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

// Stats
const stats = [
    { label: 'Componentes', value: String(totalComponents) },
    { label: 'Composables', value: '24' },
    { label: 'Idiomas', value: 'ES · EN' },
    { label: 'Bundle (gzip)', value: '131 KB' },
];

// Features
const features = [
    {
        icon: SwatchIcon,
        title: 'Theming reactivo',
        text: 'Cambia color, radius, tamaño, halo y modo claro/oscuro en vivo. Todos los componentes responden al instante.',
    },
    {
        icon: GlobeAltIcon,
        title: 'i18n integrado',
        text: 'Español e Inglés incluidos. Cambia idioma globalmente con `useLocale().set("es")`.',
    },
    {
        icon: MoonIcon,
        title: 'Dark mode + surfaces',
        text: '6 presets de superficies oscuras (navy, zinc, charcoal…) o personaliza los 14 tokens semánticos.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Accesibilidad WAI-ARIA',
        text: 'Roles, focus rings, navegación por teclado y lectores de pantalla cubiertos por defecto.',
    },
    {
        icon: BoltIcon,
        title: 'Tree-shakeable · TS first',
        text: 'Importa solo lo que usas. Tipos completos, autocompletado IntelliSense, ESM + CJS.',
    },
    {
        icon: PuzzlePieceIcon,
        title: 'Tailwind v4 native',
        text: 'CSS-vars, design tokens y `@theme inline`. Override desde tu `tailwind.config` sin hacks.',
    },
];

// Categories preview
const categoryHighlights = computed(() =>
    showroomNav
        .filter((c) => c.id !== 'welcome')
        .map((c) => ({
            id: c.id,
            title: c.title,
            count: c.entries.length,
            firstEntryId: c.entries[0]?.id,
        })),
);

// Install snippet copy
const installCmd = 'npm install mood-ui';
const usageCode = `import { ModoProvider, Button } from 'mood-ui';
import 'mood-ui/style.css';

<ModoProvider color="primary" theme="system">
  <Button color="primary">Hola mood-ui</Button>
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
    <div class="flex flex-col gap-24 pb-16">
        <!-- ─────────────────────────  HERO  ───────────────────────── -->
        <section class="relative overflow-hidden">
            <!-- Decorative gradient backdrop -->
            <div class="pointer-events-none absolute inset-0 -z-10">
                <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-3xl"></div>
                <div class="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl opacity-70"></div>
            </div>

            <div class="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center pt-8">
                <!-- LEFT — Headline -->
                <div class="flex flex-col gap-6">
                    <a
                        href="https://github.com/alansinbailarin/mood-ui"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
                    >
                        <span class="size-1.5 rounded-full bg-success animate-pulse"></span>
                        v0.5.2 · Latest release
                        <ArrowTopRightOnSquareIcon class="size-3.5" />
                    </a>

                    <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                        La librería Vue 3
                        <span class="block bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent">
                            con la mejor vibra.
                        </span>
                    </h1>

                    <p class="text-lg text-muted-foreground max-w-xl leading-relaxed">
                        {{ totalComponents }}+ componentes accesibles, theming reactivo, dark mode con
                        superficies personalizables e <strong class="text-foreground">i18n built-in</strong>
                        (Español + Inglés). Construido con Vue 3, TypeScript y Tailwind v4.
                    </p>

                    <div class="flex flex-wrap items-center gap-3 pt-2">
                        <Button color="primary" size="large" @click="go('button')">
                            Explorar componentes
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
                            Ver en GitHub
                        </Button>
                    </div>

                    <!-- Trust strip -->
                    <div class="flex items-center gap-4 pt-4">
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
                            <span class="text-foreground font-semibold">320+</span> developers
                            ya construyendo con mood-ui
                        </div>
                    </div>
                </div>

                <!-- RIGHT — Live mini app preview -->
                <div class="relative">
                    <!-- Decorative grid behind the card -->
                    <div class="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-2xl"></div>

                    <Card variant="elevated" padding="none" class="overflow-hidden shadow-xl ring-1 ring-border/60">
                        <!-- Faux window chrome -->
                        <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                            <div class="flex items-center gap-1.5">
                                <span class="size-2.5 rounded-full bg-danger/70"></span>
                                <span class="size-2.5 rounded-full bg-warning/70"></span>
                                <span class="size-2.5 rounded-full bg-success/70"></span>
                            </div>
                            <Typography variant="caption" color="muted">app.mood-ui.dev</Typography>
                            <span class="size-2.5"></span>
                        </div>

                        <!-- Demo content -->
                        <div class="p-6 flex flex-col gap-5">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <Avatar :src="teamUsers[0].src" alt="Olivia" size="medium" />
                                    <div>
                                        <Typography variant="title" size="small" weight="bold">
                                            Olivia Rhye
                                        </Typography>
                                        <Typography variant="caption" color="muted">
                                            Product Designer
                                        </Typography>
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
                                    <Typography variant="body" weight="medium">
                                        Notificaciones
                                    </Typography>
                                    <Typography variant="caption" color="muted">
                                        Recibe updates por email
                                    </Typography>
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

                            <div class="text-[11px] text-muted-foreground/80 text-center pt-1 border-t border-border/60 -mx-6 px-6 mt-1 -mb-2 pb-2">
                                ☝︎ Cambia color, radius o tema en la barra superior
                            </div>
                        </div>
                    </Card>

                    <!-- Floating chip below card -->
                    <div class="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-1.5 bg-card border border-border rounded-full pl-1 pr-3 py-1 shadow-lg">
                        <span class="size-6 rounded-full bg-success/15 grid place-items-center">
                            <CheckBadgeIcon class="size-4 text-success" />
                        </span>
                        <span class="text-xs font-medium">100% accesible</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- ───────────────────────  STATS STRIP  ─────────────────── -->
        <section>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border">
                <div
                    v-for="s in stats"
                    :key="s.label"
                    class="bg-card p-6 flex flex-col gap-1"
                >
                    <Typography variant="caption" color="muted" class="uppercase tracking-wider">
                        {{ s.label }}
                    </Typography>
                    <Typography variant="display" size="small" weight="bold" class="!text-3xl lg:!text-4xl">
                        {{ s.value }}
                    </Typography>
                </div>
            </div>
        </section>

        <!-- ───────────────────────  FEATURES  ────────────────────── -->
        <section class="flex flex-col gap-10">
            <div class="flex flex-col gap-3 max-w-2xl">
                <Badge color="primary" variant="subtle" class="self-start">
                    <SparklesIcon class="size-3.5 mr-1" />
                    Por qué mood-ui
                </Badge>
                <Typography variant="display" size="small" weight="bold">
                    Todo lo que necesitas, nada de lo que estorba.
                </Typography>
                <Typography variant="body" size="large" color="muted">
                    Pensado para diseñadores y developers que quieren shipping rápido sin
                    sacrificar calidad ni a11y.
                </Typography>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                    v-for="f in features"
                    :key="f.title"
                    variant="outlined"
                    padding="large"
                    class="group hover:border-primary/50 hover:shadow-md transition-all"
                >
                    <Stack direction="column" spacing="medium">
                        <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <component :is="f.icon" class="size-5" />
                        </div>
                        <Typography variant="title" size="medium" weight="bold">
                            {{ f.title }}
                        </Typography>
                        <Typography variant="body" color="muted">
                            {{ f.text }}
                        </Typography>
                    </Stack>
                </Card>
            </div>
        </section>

        <!-- ───────────────────────  INSTALL  ─────────────────────── -->
        <section class="flex flex-col gap-8">
            <div class="flex flex-col gap-3 max-w-2xl">
                <Badge color="success" variant="subtle" class="self-start">
                    Empezar en 60 segundos
                </Badge>
                <Typography variant="display" size="small" weight="bold">
                    Instalación
                </Typography>
            </div>

            <div class="grid lg:grid-cols-2 gap-4">
                <!-- Install command -->
                <Card variant="outlined" padding="none" class="overflow-hidden">
                    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                        <Typography variant="caption" weight="medium" class="font-mono">
                            terminal
                        </Typography>
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

                <!-- Usage code -->
                <Card variant="outlined" padding="none" class="overflow-hidden lg:row-span-2">
                    <div class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
                        <Typography variant="caption" weight="medium" class="font-mono">
                            App.vue
                        </Typography>
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

                <!-- Quick links card -->
                <Card variant="outlined" padding="large">
                    <Stack direction="column" spacing="small">
                        <Typography variant="title" size="medium" weight="bold">
                            Próximos pasos
                        </Typography>
                        <Typography variant="body" color="muted">
                            Configura el provider, explora componentes o personaliza el theming.
                        </Typography>
                        <div class="flex flex-wrap gap-2 pt-2">
                            <Button size="small" variant="outline" @click="go('button')">
                                Componentes
                            </Button>
                            <Button size="small" variant="outline" @click="go('typography')">
                                Tokens
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
        <section class="flex flex-col gap-10">
            <div class="flex items-end justify-between gap-4 flex-wrap">
                <div class="flex flex-col gap-3 max-w-2xl">
                    <Badge color="warning" variant="subtle" class="self-start">
                        Catálogo
                    </Badge>
                    <Typography variant="display" size="small" weight="bold">
                        {{ totalComponents }} componentes listos para usar
                    </Typography>
                    <Typography variant="body" size="large" color="muted">
                        Forms, feedback, layout, navegación, calendario, tabla… todo con la
                        misma API y design tokens.
                    </Typography>
                </div>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Card
                    v-for="cat in categoryHighlights"
                    :key="cat.id"
                    variant="outlined"
                    padding="large"
                    class="group cursor-pointer hover:border-primary/60 hover:shadow-md transition-all"
                    @click="cat.firstEntryId && go(cat.firstEntryId)"
                >
                    <Stack direction="column" spacing="small">
                        <div class="flex items-center justify-between">
                            <Typography variant="title" size="medium" weight="bold">
                                {{ cat.title }}
                            </Typography>
                            <Badge color="primary" variant="subtle">{{ cat.count }}</Badge>
                        </div>
                        <Typography variant="caption" color="muted">
                            Click para explorar
                        </Typography>
                        <div class="flex items-center text-primary text-sm font-medium pt-2 group-hover:gap-2 gap-1 transition-all">
                            Ver componentes
                            <ArrowRightIcon class="size-4" />
                        </div>
                    </Stack>
                </Card>
            </div>
        </section>

        <!-- ───────────────────────  FOOTER CTA  ─────────────────── -->
        <section>
            <Card
                variant="elevated"
                padding="large"
                class="relative overflow-hidden bg-gradient-to-br from-primary/8 via-card to-accent/8 border-primary/20"
            >
                <div class="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/15 blur-3xl"></div>

                <div class="relative grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
                    <div class="flex flex-col gap-4">
                        <Typography variant="display" size="small" weight="bold">
                            Empieza a construir hoy.
                        </Typography>
                        <Typography variant="body" size="large" color="muted">
                            Open source, MIT, sin lock-in. Solo Vue 3 + Tailwind v4 +
                            tu propia creatividad.
                        </Typography>
                        <div class="flex flex-wrap gap-3 pt-2">
                            <Button color="primary" size="large" @click="go('button')">
                                Explorar componentes
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
                                Star en GitHub
                            </Button>
                        </div>
                    </div>

                    <div class="hidden lg:flex justify-end">
                        <img
                            :src="logoUrl"
                            alt="mood-ui"
                            class="size-48 object-contain drop-shadow-xl"
                        />
                    </div>
                </div>
            </Card>
        </section>
    </div>
</template>
