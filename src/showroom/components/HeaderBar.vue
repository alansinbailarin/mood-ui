<script setup lang="ts">
/**
 * Showroom-wide header bar.
 *
 * Used by:
 *   · WelcomePage shell (App.vue, branch isWelcome)
 *   · DocsShell      (App.vue, branch isDocs)
 *   · ShowroomLayout topbar (App.vue, default branch)
 *
 * Centralizes: logo (Mood UI), header tabs, search trigger,
 * Star on GitHub button, color mode switch, settings popover.
 */
import {
    Bars3Icon, MagnifyingGlassIcon, StarIcon,
} from '@heroicons/vue/24/outline';

import logoUrl from '../../assets/icon-mood-ui.png';

import ColorModeSwitch from './ColorModeSwitch.vue';
import HeaderNav from './HeaderNav.vue';
import ShowroomSettings from './ShowroomSettings.vue';

import type { ModoColor, ModoRadius, ModoSize, ModoTheme, ModoHalo } from '../../config/ModoConfig';
import type { DarkSurfacePreset } from '../../config/surfaces';
import { useShowroomI18n, type ShowroomLocale } from '../composables/useShowroomI18n';

const props = defineProps<{
    activeId: string;
    /** Show the burger button (mobile sidebar toggle) on the left. */
    showBurger?: boolean;
    /** Hide the centered HeaderNav tabs (welcome/docs already show them). */
    showLogo?: boolean;
    // Provider state pass-through
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

const t = useShowroomI18n(() => props.locale);

const REPO_URL = 'https://github.com/alansinbailarin/mood-ui';
</script>

<template>
    <div class="max-w-9xl mx-auto flex items-center gap-3 px-4 sm:px-6 h-16">
        <!-- Burger (mobile only) -->
        <button
            v-if="showBurger"
            type="button"
            class="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            :aria-label="t.openMenu"
            @click="emit('burger')"
        >
            <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Logo -->
        <a
            v-if="showLogo"
            href="#welcome"
            class="flex items-center gap-2.5 group shrink-0"
            aria-label="Home"
        >
            <img :src="logoUrl" alt="mood-ui" class="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
            <span class="text-lg tracking-tight">
                <span class="font-medium text-foreground">Mood</span><span class="font-bold ml-1 uppercase text-primary">UI</span>
            </span>
            <span class="hidden sm:inline-flex text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                v0.5.2
            </span>
        </a>

        <!-- Center: header tabs -->
        <div class="hidden lg:flex flex-1 justify-center">
            <HeaderNav :active-id="activeId" :locale="locale" @navigate="emit('navigate', $event)" />
        </div>
        <div class="lg:hidden flex-1" />

        <!-- Right cluster -->
        <div class="flex items-center gap-1.5">
            <button
                type="button"
                class="hidden md:inline-flex items-center gap-2 h-9 px-2.5 pr-2 rounded-full border border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors text-xs"
                :aria-label="`${t.search} (⌘K)`"
                @click="emit('open-search')"
            >
                <MagnifyingGlassIcon class="w-3.5 h-3.5" />
                <span class="text-[12px]">{{ t.search }}…</span>
                <kbd class="font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]">⌘K</kbd>
            </button>

            <a
                :href="REPO_URL"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity text-xs font-medium"
                :aria-label="t.starOnGithub"
            >
                <StarIcon class="w-4 h-4" />
                <span class="hidden sm:inline">{{ t.starOnGithub }}</span>
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
</template>
