<script setup lang="ts">
/**
 * Showroom-wide header bar.
 */
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    Bars3Icon, MagnifyingGlassIcon, StarIcon, ChevronDownIcon, XMarkIcon,
    BookOpenIcon, CubeIcon, RectangleGroupIcon, SwatchIcon,
} from '@heroicons/vue/24/outline';

import logoUrl from '../../assets/icon-mood-ui.png';

import ColorModeSwitch from './ColorModeSwitch.vue';
import HeaderNav from './HeaderNav.vue';
import ShowroomSettings from './ShowroomSettings.vue';

import type { ModoColor, ModoRadius, ModoSize, ModoTheme, ModoHalo } from '../../config/ModoConfig';
import type { DarkSurfacePreset } from '../../config/surfaces';
import type { ShowroomLocale } from '../i18n';
import { showroomNav } from '../registry';

const props = defineProps<{
    activeId: string;
    showBurger?: boolean;
    showLogo?: boolean;
    theme: ModoTheme;
    color: ModoColor;
    radius: ModoRadius;
    size: ModoSize;
    halo: ModoHalo;
    primaryHex: string;
    accentHex: string;
    baseIntensity: number;
    darkSurface: DarkSurfacePreset;
    locale: ShowroomLocale;
}>();

const emit = defineEmits<{
    burger: [];
    'open-search': [];
    'update:theme': [v: ModoTheme];
    'update:color': [v: ModoColor];
    'update:radius': [v: ModoRadius];
    'update:size': [v: ModoSize];
    'update:halo': [v: ModoHalo];
    'update:primaryHex': [v: string];
    'update:accentHex': [v: string];
    'update:baseIntensity': [v: number];
    'update:darkSurface': [v: DarkSurfacePreset];
    'update:locale': [v: ShowroomLocale];
    'navigate': [id: string];
    reset: [];
}>();

const { t } = useI18n();
const REPO_URL = 'https://github.com/alansinbailarin/mood-ui';

// ── Mobile section switcher ──────────────────────────────────────────────────
const mobileSectionOpen = ref(false);

const COMPONENT_CATS = new Set(['getting-started', 'docs', 'templates', 'theme-studio']);

interface SectionTab {
    key: string;
    label: string;
    description: string;
    entryId: string;
    categoryIds: string[];
    icon: unknown;
}

const sectionTabs = computed<SectionTab[]>(() => {
    const findFirst = (catId: string) =>
        showroomNav.find((c) => c.id === catId)?.entries[0]?.id ?? '';

    const componentsCat = showroomNav.find((c) => !COMPONENT_CATS.has(c.id));
    const componentEntryId = componentsCat?.entries[0]?.id ?? 'button';

    return [
        { key: 'docs', label: t('docs'), description: t('header.docsDesc'), entryId: findFirst('docs'), categoryIds: ['docs'], icon: BookOpenIcon },
        { key: 'components', label: t('components'), description: t('header.componentsDesc'), entryId: componentEntryId, categoryIds: showroomNav.filter((c) => !COMPONENT_CATS.has(c.id)).map((c) => c.id), icon: CubeIcon },
        { key: 'templates', label: t('templates'), description: t('header.templatesDesc'), entryId: findFirst('templates'), categoryIds: ['templates'], icon: RectangleGroupIcon },
        { key: 'theme-studio', label: t('themeStudio'), description: t('header.themeStudioDesc'), entryId: findFirst('theme-studio'), categoryIds: ['theme-studio'], icon: SwatchIcon },
    ].filter((s) => s.entryId);
});

const activeSection = computed(() => {
    for (const s of sectionTabs.value) {
        for (const catId of s.categoryIds) {
            const cat = showroomNav.find((c) => c.id === catId);
            if (cat?.entries.some((e) => e.id === props.activeId)) return s;
        }
    }
    return sectionTabs.value[0] ?? null;
});

function goSection(tab: SectionTab) {
    emit('navigate', tab.entryId);
    mobileSectionOpen.value = false;
}
</script>

<template>
    <div class="max-w-9xl mx-auto flex items-center gap-2 px-3 sm:px-6 h-12 lg:h-16 lg:gap-3">
        <!-- Burger (mobile only) -->
        <button
            v-if="showBurger"
            type="button"
            class="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            :aria-label="t('sidebar.openMenu')"
            @click="emit('burger')"
        >
            <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Logo -->
        <a
            v-if="showLogo"
            href="#welcome"
            class="flex items-center gap-2 group shrink-0"
            aria-label="Home"
        >
            <img :src="logoUrl" alt="mood-ui" class="w-7 h-7 lg:w-8 lg:h-8 object-contain group-hover:scale-110 transition-transform" />
            <span class="hidden sm:inline text-lg tracking-tight">
                <span class="font-medium text-foreground">Mood</span><span class="font-bold ml-1 uppercase text-primary">UI</span>
            </span>
            <span class="hidden lg:inline-flex text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                v0.5.2
            </span>
        </a>

        <!-- Center: header tabs (desktop) -->
        <div class="hidden lg:flex flex-1 justify-center">
            <HeaderNav :active-id="activeId" @navigate="emit('navigate', $event)" />
        </div>

        <!-- Center: mobile section switcher pill -->
        <div class="lg:hidden flex-1 flex justify-center">
            <button
                type="button"
                class="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-xs font-medium text-foreground"
                @click="mobileSectionOpen = true"
            >
                <component :is="activeSection?.icon" class="w-3 h-3 text-primary shrink-0" />
                <span>{{ activeSection?.label }}</span>
                <ChevronDownIcon class="w-3 h-3 text-muted-foreground shrink-0" />
            </button>
        </div>

        <!-- Right cluster -->
        <div class="flex items-center gap-1">
            <button
                type="button"
                class="hidden md:inline-flex items-center gap-2 h-9 px-2.5 pr-2 rounded-full border border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors text-xs"
                :aria-label="`${t('search.label')} (⌘K)`"
                @click="emit('open-search')"
            >
                <MagnifyingGlassIcon class="w-3.5 h-3.5" />
                <span class="text-[12px]">{{ t('search.label') }}…</span>
                <kbd class="font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]">⌘K</kbd>
            </button>

            <a
                :href="REPO_URL"
                target="_blank"
                rel="noopener"
                class="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity text-xs font-medium"
                :aria-label="t('starOnGithub')"
            >
                <StarIcon class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">{{ t('starOnGithub') }}</span>
            </a>

            <ColorModeSwitch :model-value="theme" @update:model-value="emit('update:theme', $event)" />

            <ShowroomSettings
                :theme="theme"
                :color="color"
                :radius="radius"
                :size="size"
                :halo="halo"
                :primary-hex="primaryHex"
                :accent-hex="accentHex"
                :base-intensity="baseIntensity"
                :dark-surface="darkSurface"
                :locale="locale"
                @update:theme="emit('update:theme', $event)"
                @update:color="emit('update:color', $event)"
                @update:radius="emit('update:radius', $event)"
                @update:size="emit('update:size', $event)"
                @update:halo="emit('update:halo', $event)"
                @update:primary-hex="emit('update:primaryHex', $event)"
                @update:accent-hex="emit('update:accentHex', $event)"
                @update:base-intensity="emit('update:baseIntensity', $event)"
                @update:dark-surface="emit('update:darkSurface', $event)"
                @update:locale="emit('update:locale', $event)"
                @reset="emit('reset')"
            />
        </div>
    </div>

    <!-- Mobile section bottom sheet (lg:hidden) -->
    <Teleport to="body">
        <!-- Backdrop -->
        <Transition
            enter-active-class="transition-opacity duration-200 ease-out"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-150 ease-in"
            leave-to-class="opacity-0"
        >
            <div
                v-if="mobileSectionOpen"
                class="lg:hidden fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
                @click="mobileSectionOpen = false"
            />
        </Transition>

        <!-- Sheet -->
        <Transition
            enter-active-class="transition-transform duration-250 ease-out"
            enter-from-class="translate-y-full"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-to-class="translate-y-full"
        >
            <div
                v-if="mobileSectionOpen"
                class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card shadow-2xl border-t border-border"
            >
                <!-- Handle -->
                <div class="flex justify-center pt-3 pb-1">
                    <div class="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                <!-- Header -->
                <div class="flex items-center justify-between px-5 py-3">
                    <span class="text-sm font-semibold text-foreground">{{ t('header.sections') }}</span>
                    <button
                        type="button"
                        class="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                        @click="mobileSectionOpen = false"
                    >
                        <XMarkIcon class="w-4 h-4" />
                    </button>
                </div>

                <!-- Section tiles -->
                <div class="grid grid-cols-2 gap-3 px-5 pb-6">
                    <button
                        v-for="section in sectionTabs"
                        :key="section.key"
                        type="button"
                        class="flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left"
                        :class="activeSection?.key === section.key
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-muted/20 hover:bg-muted/40 text-foreground'"
                        @click="goSection(section)"
                    >
                        <component
                            :is="section.icon"
                            class="w-5 h-5 shrink-0"
                            :class="activeSection?.key === section.key ? 'text-primary' : 'text-muted-foreground'"
                        />
                        <div>
                            <div class="text-sm font-semibold leading-tight">{{ section.label }}</div>
                            <div class="mt-0.5 text-[11px] leading-snug"
                                :class="activeSection?.key === section.key ? 'text-primary/70' : 'text-muted-foreground'">
                                {{ section.description }}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
