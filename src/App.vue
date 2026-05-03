<script setup lang="ts">
import { ref, computed, defineAsyncComponent, h } from 'vue';
import {
    SunIcon, MoonIcon, ComputerDesktopIcon,
    AdjustmentsHorizontalIcon, BookOpenIcon, RectangleGroupIcon,
    Bars3Icon, MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';

import logoUrl from './assets/icon-mood-ui.png';

import ModoProvider from './components/ModoProvider.vue';
import AppShell from './components/layout/AppShell.vue';
import Topbar from './components/layout/Topbar.vue';
import Sidebar from './components/layout/Sidebar.vue';
import Container from './components/layout/Container.vue';
import Button from './components/forms/Button.vue';
import Select from './components/forms/Select.vue';
import Tooltip from './components/feedback/Tooltip.vue';
import ToastContainer from './components/feedback/ToastContainer.vue';
import Typography from './components/data-display/Typography.vue';
import Loader from './components/feedback/Loader.vue';
import Drawer from './components/feedback/Drawer.vue';
import Stack from './components/layout/Stack.vue';

import { showroomNav } from './showroom/registry';
import { useShowroomRouter } from './showroom/composables/useShowroomRouter';
import CommandPalette from './showroom/components/CommandPalette.vue';

import type { ModoColor, ModoRadius, ModoSize, ModoTheme, ModoHalo } from './config/ModoConfig';
import type { ModoPalette } from './config/palettes';
import { paletteFromHex } from './config/palettes';
import type { PartialLocale } from './config/ModoLocale';

// ── Provider state ────────────────────────────────────────────────────────────
const theme = ref<ModoTheme>('system');
const color = ref<ModoColor>('primary');
const radius = ref<ModoRadius>('medium');
const size = ref<ModoSize>('medium');
const halo = ref<ModoHalo>('tinted');
const primaryHex = ref<string>('#6366f1');
const localeName = ref<'es' | 'en'>('es');
const settingsOpen = ref(false);
const paletteOpen = ref(false);

// AppShell state
const sidebarCollapsed = ref(false);
const sidebarMobileOpen = ref(false);

const palettes = computed<{ primary?: Partial<ModoPalette> }>(() => ({
    primary: paletteFromHex(primaryHex.value),
}));

const localeMap: Record<'es' | 'en', PartialLocale> = {
    es: {},
    en: {
        common: {
            close: 'Close',
            clear: 'Clear',
            cancel: 'Cancel',
            confirm: 'Confirm',
            loading: 'Loading…',
            search: 'Search',
        } as PartialLocale['common'],
    } as PartialLocale,
};
const locale = computed<PartialLocale>(() => localeMap[localeName.value]);

// ── Router ────────────────────────────────────────────────────────────────────
const { entry, currentId, go } = useShowroomRouter();

const sidebarSections = computed(() =>
    showroomNav.map((cat) => ({
        id: cat.id,
        title: cat.title,
        items: cat.entries.map((e) => ({
            id: e.id,
            label: e.label,
            badge: e.badge,
            badgeColor: 'primary' as const,
        })),
    })),
);

function onSidebarSelect(item: { id: string | number }) {
    go(String(item.id));
    sidebarMobileOpen.value = false;
}

// ── Async page render ─────────────────────────────────────────────────────────
const ActivePage = computed(() => {
    const e = entry.value;
    if (!e) return null;
    return defineAsyncComponent({
        loader: () => e.page().then((m) => m.default),
        loadingComponent: {
            render() {
                return h('div', { class: 'flex items-center justify-center py-24' }, [h(Loader, { size: 'medium' })]);
            },
        },
        delay: 80,
    });
});

// ── Options ───────────────────────────────────────────────────────────────────
const themeOptions = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' },
];
const colorOptions = [
    { value: 'default', label: 'Default' },
    { value: 'primary', label: 'Primary' },
    { value: 'danger', label: 'Danger' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
];
const radiusOptions = [
    { value: 'none', label: 'None' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'full', label: 'Full' },
];
const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
];
const haloOptions = [
    { value: 'tinted', label: 'Tinted' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'off', label: 'Off' },
];
const localeOptions = [
    { value: 'es', label: 'ES' },
    { value: 'en', label: 'EN' },
];

const themeIcon = computed(() => {
    if (theme.value === 'light') return SunIcon;
    if (theme.value === 'dark') return MoonIcon;
    return ComputerDesktopIcon;
});

function cycleTheme() {
    const order: ModoTheme[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme.value) + 1) % order.length];
    theme.value = next;
}

const presetColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#14b8a6', '#0ea5e9',
];
</script>

<template>
    <ModoProvider
        :theme="theme"
        :color="color"
        :radius="radius"
        :size="size"
        :halo="halo"
        :palettes="palettes"
        :locale="locale"
    >
        <AppShell
            v-model:collapsed="sidebarCollapsed"
            v-model:mobile-open="sidebarMobileOpen"
            variant="standard"
            appearance="flush"
            sidebar-width="medium"
            collapsed-width="small"
            sticky-topbar
            sticky-sidebar
            main-padding="none"
            breakpoint="lg"
        >
            <!-- TOPBAR -->
            <template #topbar>
                <Topbar :divider="true" padding="medium">
                    <template #logo>
                        <div class="flex items-center gap-2">
                            <!-- Mobile menu trigger -->
                            <Button
                                variant="ghost"
                                size="small"
                                icon-only
                                class="lg:hidden"
                                aria-label="Abrir menú"
                                @click="sidebarMobileOpen = true"
                            >
                                <Bars3Icon class="w-5 h-5" />
                            </Button>
                            <!-- Desktop collapse trigger -->
                            <Button
                                variant="ghost"
                                size="small"
                                icon-only
                                class="hidden lg:inline-flex"
                                :aria-label="sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
                                @click="sidebarCollapsed = !sidebarCollapsed"
                            >
                                <Bars3Icon class="w-5 h-5" />
                            </Button>
                        </div>
                    </template>

                    <template #title>
                        <a
                            href="#/welcome"
                            class="flex items-center gap-2.5 group"
                            aria-label="Ir al inicio"
                        >
                            <img
                                :src="logoUrl"
                                alt="mood-ui"
                                class="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
                            />
                            <Typography variant="title" size="medium" weight="bold" class="tracking-tight">mood-ui</Typography>
                            <span class="hidden sm:inline-flex text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                v0.3.1
                            </span>
                        </a>
                    </template>

                    <template #actions>
                        <div class="flex items-center gap-1.5">
                            <!-- Inline provider controls (lg+) -->
                            <div class="hidden 2xl:flex items-center gap-1.5">
                                <Select v-model="color" :options="colorOptions" size="small" aria-label="Color" />
                                <Select v-model="radius" :options="radiusOptions" size="small" aria-label="Radius" />
                                <Select v-model="size" :options="sizeOptions" size="small" aria-label="Tamaño" />
                            </div>

                            <!-- Color preset swatches (md+) -->
                            <div class="hidden md:flex items-center gap-1">
                                <Tooltip
                                    v-for="hex in presetColors.slice(0, 5)"
                                    :key="hex"
                                    :content="hex"
                                >
                                    <button
                                        type="button"
                                        :aria-label="`Set primary color ${hex}`"
                                        class="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
                                        :class="primaryHex === hex ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''"
                                        :style="{ backgroundColor: hex }"
                                        @click="primaryHex = hex"
                                    />
                                </Tooltip>
                            </div>

                            <!-- ⌘K Command palette trigger -->
                            <Tooltip content="Buscar (⌘K)">
                                <button
                                    type="button"
                                    aria-label="Buscar"
                                    class="hidden sm:inline-flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                                    @click="paletteOpen = true"
                                >
                                    <MagnifyingGlassIcon class="w-4 h-4" />
                                    <span class="hidden md:inline">Buscar…</span>
                                    <kbd class="hidden md:inline-flex items-center font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-card text-[10px]">⌘K</kbd>
                                </button>
                            </Tooltip>
                            <Tooltip content="Buscar (⌘K)">
                                <Button
                                    variant="ghost"
                                    size="small"
                                    icon-only
                                    aria-label="Buscar"
                                    class="sm:hidden"
                                    @click="paletteOpen = true"
                                >
                                    <MagnifyingGlassIcon class="w-5 h-5" />
                                </Button>
                            </Tooltip>

                            <!-- Theme cycle (always visible) -->
                            <Tooltip :content="`Tema: ${theme} (click para cambiar)`">
                                <Button
                                    variant="ghost"
                                    size="small"
                                    icon-only
                                    aria-label="Cambiar tema"
                                    @click="cycleTheme"
                                >
                                    <component :is="themeIcon" class="w-5 h-5" />
                                </Button>
                            </Tooltip>

                            <!-- Settings drawer (always visible) -->
                            <Tooltip content="Configuración del provider">
                                <Button
                                    variant="ghost"
                                    size="small"
                                    icon-only
                                    aria-label="Configuración"
                                    @click="settingsOpen = true"
                                >
                                    <AdjustmentsHorizontalIcon class="w-5 h-5" />
                                </Button>
                            </Tooltip>

                            <Tooltip content="Welcome">
                                <Button
                                    as="a"
                                    href="#/welcome"
                                    variant="ghost"
                                    size="small"
                                    icon-only
                                    aria-label="Welcome"
                                    class="hidden sm:inline-flex"
                                >
                                    <BookOpenIcon class="w-5 h-5" />
                                </Button>
                            </Tooltip>

                            <!-- GitHub link -->
                            <Tooltip content="GitHub">
                                <Button
                                    as="a"
                                    href="https://github.com/alansinbailarin/mood-ui"
                                    target="_blank"
                                    rel="noopener"
                                    variant="ghost"
                                    size="small"
                                    icon-only
                                    aria-label="GitHub repository"
                                >
                                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                    </svg>
                                </Button>
                            </Tooltip>
                        </div>
                    </template>
                </Topbar>
            </template>

            <!-- SIDEBAR -->
            <template #sidebar="{ collapsed }">
                <!-- No `color` prop: Sidebar inherits the global color from <ModoProvider>. -->
                <Sidebar
                    :sections="sidebarSections"
                    :active-id="currentId"
                    :collapsed="collapsed"
                    active-variant="tonal"
                    size="small"
                    padding="small"
                    @select="onSidebarSelect"
                />
            </template>

            <!-- MAIN -->
            <Container max-width="xl" class="px-4 sm:px-6 py-6 sm:py-8">
                <Suspense>
                    <component :is="ActivePage" v-if="ActivePage" />
                    <template #fallback>
                        <div class="flex items-center justify-center py-24">
                            <Loader size="medium" />
                        </div>
                    </template>
                </Suspense>
            </Container>
        </AppShell>

        <ToastContainer position="bottom-right" />

        <!-- Settings drawer with FULL provider controls -->
        <Drawer
            v-model="settingsOpen"
            side="right"
            size="small"
            title="Configuración del provider"
            description="Cambia los tokens del provider en vivo y mira cómo reacciona toda la librería."
        >
            <Stack direction="column" spacing="medium" class="p-1">
                <label class="flex flex-col gap-1">
                    <Typography variant="caption" weight="medium" color="muted">Modo de color</Typography>
                    <Select v-model="theme" :options="themeOptions" size="medium" />
                </label>
                <label class="flex flex-col gap-1">
                    <Typography variant="caption" weight="medium" color="muted">Color global</Typography>
                    <Select v-model="color" :options="colorOptions" size="medium" />
                </label>
                <label class="flex flex-col gap-1">
                    <Typography variant="caption" weight="medium" color="muted">Radius</Typography>
                    <Select v-model="radius" :options="radiusOptions" size="medium" />
                </label>
                <label class="flex flex-col gap-1">
                    <Typography variant="caption" weight="medium" color="muted">Tamaño</Typography>
                    <Select v-model="size" :options="sizeOptions" size="medium" />
                </label>
                <label class="flex flex-col gap-1">
                    <Typography variant="caption" weight="medium" color="muted">Halo de focus</Typography>
                    <Select v-model="halo" :options="haloOptions" size="medium" />
                </label>
                <label class="flex flex-col gap-1">
                    <Typography variant="caption" weight="medium" color="muted">Idioma</Typography>
                    <Select v-model="localeName" :options="localeOptions" size="medium" />
                </label>
                <label class="flex flex-col gap-2">
                    <Typography variant="caption" weight="medium" color="muted">Color primario</Typography>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="hex in presetColors"
                            :key="hex"
                            type="button"
                            :aria-label="`Set primary color ${hex}`"
                            class="w-8 h-8 rounded-full border border-border hover:scale-110 transition-transform"
                            :class="primaryHex === hex ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : ''"
                            :style="{ backgroundColor: hex }"
                            @click="primaryHex = hex"
                        />
                        <input
                            type="color"
                            :value="primaryHex"
                            aria-label="Custom primary color"
                            class="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
                            @input="(e) => (primaryHex = (e.target as HTMLInputElement).value)"
                        />
                    </div>
                </label>
            </Stack>
        </Drawer>

        <!-- ⌘K Command palette -->
        <CommandPalette
            v-model="paletteOpen"
            @theme="theme = $event"
            @color="primaryHex = $event"
            @locale="localeName = $event"
        />
    </ModoProvider>
</template>
