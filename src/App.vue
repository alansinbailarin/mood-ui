<script setup lang="ts">
import { ref, computed, defineAsyncComponent, h, watch } from 'vue';
import {
    Bars3Icon, MagnifyingGlassIcon, XMarkIcon,
    SparklesIcon, BookOpenIcon, RectangleGroupIcon, SwatchIcon,
    CubeTransparentIcon, ChatBubbleLeftRightIcon, ChartBarIcon,
    CalendarDaysIcon, CalendarIcon, Squares2X2Icon, ArrowRightOnRectangleIcon,
    HomeIcon,
} from '@heroicons/vue/24/outline';

import logoUrl from './assets/icon-mood-ui.png';

import ModoProvider from './components/ModoProvider.vue';
import Sidebar from './components/layout/Sidebar.vue';
import ToastContainer from './components/feedback/ToastContainer.vue';
import Typography from './components/data-display/Typography.vue';
import Loader from './components/feedback/Loader.vue';

import { showroomNav } from './showroom/registry';
import { useShowroomRouter } from './showroom/composables/useShowroomRouter';
import CommandPalette from './showroom/components/CommandPalette.vue';
import ShowroomLayout from './showroom/components/ShowroomLayout.vue';
import ShowroomSettings from './showroom/components/ShowroomSettings.vue';
import ColorModeSwitch from './showroom/components/ColorModeSwitch.vue';
import HeaderNav from './showroom/components/HeaderNav.vue';
import { useShowroomI18n, type ShowroomLocale } from './showroom/composables/useShowroomI18n';
import { tintedLightSurfaces, tintedDarkSurfaces } from './showroom/utils/tintedSurfaces';

import type { ModoColor, ModoRadius, ModoSize, ModoTheme, ModoHalo } from './config/ModoConfig';
import type { ModoPalette } from './config/palettes';
import { paletteFromHex } from './config/palettes';
import type { PartialLocale } from './config/ModoLocale';

// ── Provider state ────────────────────────────────────────────────────────────
const DEFAULTS = {
    theme:         'system'  as ModoTheme,
    color:         'primary' as ModoColor,
    radius:        'medium'  as ModoRadius,
    size:          'medium'  as ModoSize,
    halo:          'tinted'  as ModoHalo,
    primaryHex:    '#6366f1',
    accentHex:     '#6366f1',
    baseIntensity: 0,
    locale:        'es' as ShowroomLocale,
};

const theme         = ref<ModoTheme>(DEFAULTS.theme);
const color         = ref<ModoColor>(DEFAULTS.color);
const radius        = ref<ModoRadius>(DEFAULTS.radius);
const size          = ref<ModoSize>(DEFAULTS.size);
const halo          = ref<ModoHalo>(DEFAULTS.halo);
const primaryHex    = ref<string>(DEFAULTS.primaryHex);
const accentHex     = ref<string>(DEFAULTS.accentHex);
const baseIntensity = ref<number>(DEFAULTS.baseIntensity);
const localeName    = ref<ShowroomLocale>(DEFAULTS.locale);

const paletteOpen        = ref(false);
const sidebarCollapsed   = ref(false);
const sidebarMobileOpen  = ref(false);

const palettes = computed<{ primary?: Partial<ModoPalette> }>(() => ({
    primary: paletteFromHex(primaryHex.value),
}));

// Tinted surfaces — applied only when baseIntensity > 0 so we don't shadow
// the library defaults for users who never touch the slider.
const tintedSurfaces = computed(() =>
    baseIntensity.value > 0
        ? tintedLightSurfaces(accentHex.value, baseIntensity.value / 100)
        : undefined,
);
const tintedDark = computed(() =>
    baseIntensity.value > 0
        ? tintedDarkSurfaces(accentHex.value, baseIntensity.value / 100)
        : undefined,
);

// ── i18n ──────────────────────────────────────────────────────────────────────
const t = useShowroomI18n(() => localeName.value);

const localeMap: Record<ShowroomLocale, PartialLocale> = {
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

function resetTheme() {
    theme.value         = DEFAULTS.theme;
    color.value         = DEFAULTS.color;
    radius.value        = DEFAULTS.radius;
    size.value          = DEFAULTS.size;
    halo.value          = DEFAULTS.halo;
    primaryHex.value    = DEFAULTS.primaryHex;
    accentHex.value     = DEFAULTS.accentHex;
    baseIntensity.value = DEFAULTS.baseIntensity;
    localeName.value    = DEFAULTS.locale;
}

// ── Router ────────────────────────────────────────────────────────────────────
const { entry, currentId, go } = useShowroomRouter();

const isWelcome = computed(() => !entry.value || currentId.value === 'welcome');

// ── Sidebar sections (with icons per category) ────────────────────────────────
const categoryIcon: Record<string, unknown> = {
    'getting-started': SparklesIcon,
    'docs':            BookOpenIcon,
    'templates':       RectangleGroupIcon,
    'theme-studio':    SwatchIcon,
    'forms':           Squares2X2Icon,
    'feedback':        ChatBubbleLeftRightIcon,
    'data-display':    ChartBarIcon,
    'calendar':        CalendarIcon,
    'date-picker':     CalendarDaysIcon,
    'layout':          CubeTransparentIcon,
    'navigation':      ArrowRightOnRectangleIcon,
};

const sidebarSections = computed(() =>
    showroomNav.map((cat) => ({
        id: cat.id,
        title: cat.title,
        items: cat.entries.map((e, idx) => ({
            id: e.id,
            label: e.label,
            badge: e.badge,
            badgeColor: 'primary' as const,
            // First item of each section gets the category icon so the
            // collapsed rail still shows one glyph per group.
            icon: idx === 0 ? (categoryIcon[cat.id] as never) : undefined,
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

watch(currentId, () => { sidebarMobileOpen.value = false; });

function onHeaderNavigate(id: string) {
    go(id);
}
</script>

<template>
    <ModoProvider
        :theme="theme"
        :color="color"
        :radius="radius"
        :size="size"
        :halo="halo"
        :palettes="palettes"
        :surfaces="tintedSurfaces"
        :dark-surfaces="tintedDark"
        :locale="locale"
    >
        <!-- ─────────────────────────────────────────────────────────────
             WELCOME (standalone landing — no sidebar)
        ───────────────────────────────────────────────────────────── -->
        <div v-if="isWelcome" class="min-h-dvh bg-background text-foreground">
            <header class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border">
                <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 h-14">
                    <a href="#/welcome" class="flex items-center gap-2.5 group" aria-label="Home">
                        <img :src="logoUrl" alt="mood-ui" class="w-7 h-7 object-contain group-hover:scale-110 transition-transform" />
                        <Typography variant="title" size="medium" weight="bold" class="tracking-tight">mood-ui</Typography>
                        <span class="hidden sm:inline-flex text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            v0.5.1
                        </span>
                    </a>

                    <!-- Center: header nav (only on lg+) -->
                    <div class="hidden lg:block">
                        <HeaderNav :active-id="currentId" :locale="localeName" @navigate="onHeaderNavigate" />
                    </div>

                    <nav class="flex items-center gap-1.5">
                        <ColorModeSwitch v-model="theme" />
                        <ShowroomSettings
                            :theme="theme"
                            :color="color"
                            :radius="radius"
                            :size="size"
                            :halo="halo"
                            :primary-hex="primaryHex"
                            :accent-hex="accentHex"
                            :base-intensity="baseIntensity"
                            :locale="localeName"
                            @update:theme="theme = $event"
                            @update:color="color = $event"
                            @update:radius="radius = $event"
                            @update:size="size = $event"
                            @update:halo="halo = $event"
                            @update:primary-hex="primaryHex = $event"
                            @update:accent-hex="accentHex = $event"
                            @update:base-intensity="baseIntensity = $event"
                            @update:locale="localeName = $event"
                            @reset="resetTheme"
                        />
                    </nav>
                </div>
            </header>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <Suspense>
                    <component :is="ActivePage" v-if="ActivePage" />
                    <template #fallback>
                        <div class="flex items-center justify-center py-24">
                            <Loader size="medium" />
                        </div>
                    </template>
                </Suspense>
            </div>
        </div>

        <!-- ─────────────────────────────────────────────────────────────
             SHOWROOM (sidebar full-height + topbar with nav)
        ───────────────────────────────────────────────────────────── -->
        <ShowroomLayout
            v-else
            v-model:collapsed="sidebarCollapsed"
            v-model:mobile-open="sidebarMobileOpen"
            :sidebar-width="248"
            :collapsed-width="64"
        >
            <!-- SIDEBAR -->
            <template #sidebar="{ collapsed, isMobile, closeMobile }">
                <div class="flex items-center gap-2 h-14 px-3 shrink-0 border-b border-border">
                    <a
                        href="#/welcome"
                        class="flex items-center gap-2 min-w-0 flex-1"
                        :title="collapsed && !isMobile ? t.home : undefined"
                    >
                        <img :src="logoUrl" alt="mood-ui" class="w-7 h-7 object-contain shrink-0" />
                        <span v-if="!collapsed || isMobile" class="font-bold tracking-tight truncate">mood-ui</span>
                    </a>
                    <button
                        v-if="!isMobile"
                        type="button"
                        class="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        :aria-label="collapsed ? t.expandSidebar : t.collapseSidebar"
                        @click="sidebarCollapsed = !sidebarCollapsed"
                    >
                        <Bars3Icon class="w-4 h-4" />
                    </button>
                    <button
                        v-else
                        type="button"
                        class="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        :aria-label="t.closeMenu"
                        @click="closeMobile"
                    >
                        <XMarkIcon class="w-4 h-4" />
                    </button>
                </div>

                <div class="px-2 pt-2 shrink-0">
                    <button
                        type="button"
                        class="flex items-center gap-2 w-full h-8 px-2 rounded-md border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs"
                        :aria-label="`${t.search} (⌘K)`"
                        @click="paletteOpen = true"
                    >
                        <MagnifyingGlassIcon class="w-3.5 h-3.5 shrink-0" />
                        <span v-if="!collapsed || isMobile" class="flex-1 text-left">{{ t.search }}…</span>
                        <kbd v-if="!collapsed || isMobile" class="font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-card text-[10px]">⌘K</kbd>
                    </button>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto py-2">
                    <Sidebar
                        :sections="sidebarSections"
                        :active-id="currentId"
                        :collapsed="collapsed && !isMobile"
                        active-variant="tonal"
                        size="small"
                        padding="small"
                        @select="onSidebarSelect"
                    />
                </div>

                <div class="shrink-0 border-t border-border p-2">
                    <button
                        type="button"
                        class="flex items-center gap-2 w-full h-8 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-xs"
                        @click="go('welcome')"
                    >
                        <HomeIcon class="w-4 h-4 shrink-0" />
                        <span v-if="!collapsed || isMobile">{{ t.backHome }}</span>
                    </button>
                </div>
            </template>

            <!-- TOPBAR -->
            <template #topbar>
                <div class="flex items-center gap-2 h-14 px-3 sm:px-4">
                    <button
                        type="button"
                        class="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        :aria-label="t.openMenu"
                        @click="sidebarMobileOpen = true"
                    >
                        <Bars3Icon class="w-5 h-5" />
                    </button>

                    <!-- Center: header nav -->
                    <div class="hidden lg:flex flex-1 justify-center">
                        <HeaderNav :active-id="currentId" :locale="localeName" @navigate="onHeaderNavigate" />
                    </div>
                    <div class="lg:hidden flex-1" />

                    <div class="flex items-center gap-1.5">
                        <ColorModeSwitch v-model="theme" />
                        <ShowroomSettings
                            :theme="theme"
                            :color="color"
                            :radius="radius"
                            :size="size"
                            :halo="halo"
                            :primary-hex="primaryHex"
                            :accent-hex="accentHex"
                            :base-intensity="baseIntensity"
                            :locale="localeName"
                            @update:theme="theme = $event"
                            @update:color="color = $event"
                            @update:radius="radius = $event"
                            @update:size="size = $event"
                            @update:halo="halo = $event"
                            @update:primary-hex="primaryHex = $event"
                            @update:accent-hex="accentHex = $event"
                            @update:base-intensity="baseIntensity = $event"
                            @update:locale="localeName = $event"
                            @reset="resetTheme"
                        />
                    </div>
                </div>
            </template>

            <!-- MAIN -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <Suspense>
                    <component :is="ActivePage" v-if="ActivePage" />
                    <template #fallback>
                        <div class="flex items-center justify-center py-24">
                            <Loader size="medium" />
                        </div>
                    </template>
                </Suspense>
            </div>
        </ShowroomLayout>

        <ToastContainer position="bottom-right" />

        <CommandPalette
            v-model="paletteOpen"
            @theme="theme = $event"
            @color="primaryHex = $event"
            @locale="localeName = $event"
        />
    </ModoProvider>
</template>
