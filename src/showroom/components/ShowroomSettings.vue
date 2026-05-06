<script setup lang="ts">
import { computed } from 'vue';
import {
    SwatchIcon,
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    ArrowPathIcon,
} from '@heroicons/vue/24/outline';

import Tooltip from '../../components/feedback/Tooltip.vue';
import PopoverPanel from '../../components/layout/PopoverPanel.vue';
import { usePopover } from '../../composables/usePopover';
import { useShowroomI18n, type ShowroomLocale } from '../composables/useShowroomI18n';

import type { ModoColor, ModoRadius, ModoSize, ModoTheme, ModoHalo } from '../../config/ModoConfig';
import type { DarkSurfacePreset } from '../../config/surfaces';

const props = defineProps<{
    theme: ModoTheme;
    color: ModoColor;
    radius: ModoRadius;
    size: ModoSize;
    halo: ModoHalo;
    primaryHex: string;
    accentHex: string;
    /** 0–100 — how strongly the page surfaces are tinted with the accent. */
    baseIntensity: number;
    /** Active dark-mode surface preset. */
    darkSurface: DarkSurfacePreset;
    locale: ShowroomLocale;
}>();

const emit = defineEmits<{
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
    reset: [];
}>();

const t = useShowroomI18n(() => props.locale);

const { triggerRef, panelRef, isOpen, panelStyle, toggle } = usePopover({
    placement: 'bottom-end',
    offset: 10,
});

interface Swatch { name: string; hex: string; }

// Same palette used for primary AND accent (different fields).
const swatches: Swatch[] = [
    { name: 'Indigo',  hex: '#6366f1' },
    { name: 'Violet',  hex: '#8b5cf6' },
    { name: 'Purple',  hex: '#a855f7' },
    { name: 'Fuchsia', hex: '#d946ef' },
    { name: 'Pink',    hex: '#ec4899' },
    { name: 'Rose',    hex: '#f43f5e' },
    { name: 'Red',     hex: '#ef4444' },
    { name: 'Orange',  hex: '#f97316' },
    { name: 'Amber',   hex: '#f59e0b' },
    { name: 'Yellow',  hex: '#eab308' },
    { name: 'Lime',    hex: '#84cc16' },
    { name: 'Green',   hex: '#22c55e' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Teal',    hex: '#14b8a6' },
    { name: 'Cyan',    hex: '#06b6d4' },
    { name: 'Sky',     hex: '#0ea5e9' },
    { name: 'Blue',    hex: '#3b82f6' },
    { name: 'Slate',   hex: '#64748b' },
];

const radiusOptions: { value: ModoRadius; label: string }[] = [
    { value: 'none',   label: '0' },
    { value: 'small',  label: 'sm' },
    { value: 'medium', label: 'md' },
    { value: 'large',  label: 'lg' },
    { value: 'full',   label: 'full' },
];

const sizeOptions: { value: ModoSize; label: string }[] = [
    { value: 'small',  label: 'sm' },
    { value: 'medium', label: 'md' },
    { value: 'large',  label: 'lg' },
];

const haloOptions: { value: ModoHalo; label: string }[] = [
    { value: 'tinted',  label: 'Tinted' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'off',     label: 'Off' },
];

const colorOptions: { value: ModoColor; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'primary', label: 'Primary' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'danger',  label: 'Danger' },
];

const themeOptions = computed(() => [
    { value: 'light' as const,  label: t.value.light,  icon: SunIcon },
    { value: 'dark' as const,   label: t.value.dark,   icon: MoonIcon },
    { value: 'system' as const, label: t.value.system, icon: ComputerDesktopIcon },
]);

const localeOptions: { value: ShowroomLocale; label: string }[] = [
    { value: 'es', label: 'ES' },
    { value: 'en', label: 'EN' },
];

const surfaceOptions: { value: DarkSurfacePreset; label: string; sample: string }[] = [
    { value: 'default',  label: 'Default',  sample: '#0b1220' },
    { value: 'navy',     label: 'Navy',     sample: '#0a1530' },
    { value: 'zinc',     label: 'Zinc',     sample: '#18181b' },
    { value: 'charcoal', label: 'Charcoal', sample: '#1c1917' },
    { value: 'midnight', label: 'Midnight', sample: '#0a0a1a' },
    { value: 'forest',   label: 'Forest',   sample: '#0f1c14' },
];

const activePrimary = computed(() =>
    swatches.find((s) => s.hex.toLowerCase() === props.primaryHex.toLowerCase()),
);
const activeAccent = computed(() =>
    swatches.find((s) => s.hex.toLowerCase() === props.accentHex.toLowerCase()),
);

// Semantic color dots for the COLOR section
interface SemanticColor { value: ModoColor; label: string; hex: string; }
const semanticColors = computed<SemanticColor[]>(() => [
    { value: 'default', label: 'Default', hex: '#64748b' },
    { value: 'primary', label: 'Primary', hex: props.primaryHex },
    { value: 'success', label: 'Success', hex: '#22c55e' },
    { value: 'warning', label: 'Warning', hex: '#f59e0b' },
    { value: 'danger',  label: 'Danger',  hex: '#ef4444' },
]);
</script>

<template>
    <button
        ref="triggerRef"
        type="button"
        :aria-label="t.customizeTheme"
        :aria-expanded="isOpen"
        class="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        @click="toggle"
    >
        <SwatchIcon class="w-5 h-5" />
    </button>

    <PopoverPanel
        :open="isOpen"
        :style="panelStyle"
        radius="large"
        role="dialog"
        :aria-label="t.customizeTheme"
        @update:panelRef="panelRef = $event"
    >
        <div class="w-[300px] max-h-[min(85vh,680px)] overflow-y-auto p-4 space-y-4">
            <!-- ── Color Mode ────────────────────────────────────────── -->
            <section class="space-y-1.5">
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {{ t.colorMode }}
                </h3>
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="opt in themeOptions"
                        :key="opt.value"
                        type="button"
                        class="flex items-center justify-center gap-1.5 h-8 rounded-md border text-xs font-medium transition-colors"
                        :class="theme === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-foreground hover:bg-muted/50'"
                        @click="emit('update:theme', opt.value)"
                    >
                        <component :is="opt.icon" class="w-3.5 h-3.5" />
                        <span>{{ opt.label }}</span>
                    </button>
                </div>
            </section>

            <!-- ── Accent (controls page tint) ───────────────────────── -->
            <section class="space-y-1.5">
                <header class="flex items-center justify-between">
                    <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ t.accent }}
                    </h3>
                    <span v-if="activeAccent" class="text-[10px] font-mono text-muted-foreground">
                        {{ activeAccent.name }}
                    </span>
                </header>
                <div class="flex flex-wrap gap-1.5">
                    <Tooltip
                        v-for="s in swatches"
                        :key="`accent-${s.hex}`"
                        :content="s.name"
                    >
                        <button
                            type="button"
                            :aria-label="`Accent ${s.name}`"
                            class="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
                            :class="accentHex.toLowerCase() === s.hex.toLowerCase()
                                ? 'border-foreground scale-125'
                                : 'border-transparent'"
                            :style="{ backgroundColor: s.hex }"
                            @click="emit('update:accentHex', s.hex)"
                        />
                    </Tooltip>
                </div>
            </section>

            <!-- ── Base intensity ─────────────────────────────────────── -->
            <section class="space-y-1.5">
                <header class="flex items-center justify-between">
                    <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ t.base }}
                    </h3>
                    <span class="text-[10px] font-mono text-muted-foreground">{{ baseIntensity }}%</span>
                </header>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    :value="baseIntensity"
                    :aria-label="t.base"
                    class="w-full accent-primary h-1.5 cursor-pointer"
                    @input="(e: Event) => emit('update:baseIntensity', Number((e.target as HTMLInputElement).value))"
                />
                <p class="text-[10px] text-muted-foreground leading-tight">{{ t.baseHelp }}</p>
            </section>

            <!-- ── Primary (component-level) ─────────────────────────── -->
            <section class="space-y-1.5">
                <header class="flex items-center justify-between">
                    <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ t.primary }}
                    </h3>
                    <span v-if="activePrimary" class="text-[10px] font-mono text-muted-foreground">
                        {{ activePrimary.name }}
                    </span>
                </header>
                <div class="flex flex-wrap gap-1.5">
                    <Tooltip
                        v-for="s in swatches"
                        :key="`prim-${s.hex}`"
                        :content="s.name"
                    >
                        <button
                            type="button"
                            :aria-label="`Primary ${s.name}`"
                            class="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
                            :class="primaryHex.toLowerCase() === s.hex.toLowerCase()
                                ? 'border-foreground scale-125'
                                : 'border-transparent'"
                            :style="{ backgroundColor: s.hex }"
                            @click="emit('update:primaryHex', s.hex)"
                        />
                    </Tooltip>
                </div>
                <label class="flex items-center gap-2 mt-1">
                    <input
                        type="color"
                        :value="primaryHex"
                        :aria-label="t.primary"
                        class="w-6 h-6 rounded cursor-pointer bg-transparent border border-border"
                        @input="(e: Event) => emit('update:primaryHex', (e.target as HTMLInputElement).value)"
                    />
                    <code class="text-[11px] font-mono text-muted-foreground">{{ primaryHex.toUpperCase() }}</code>
                </label>
            </section>

            <!-- ── Color (semantic circles) ──────────────────────────── -->
            <section class="space-y-1.5">
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Color</h3>
                <div class="flex flex-wrap gap-2">
                    <Tooltip v-for="sc in semanticColors" :key="sc.value" :content="sc.label">
                        <button
                            type="button"
                            :aria-label="sc.label"
                            class="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
                            :class="color === sc.value
                                ? 'border-foreground scale-125'
                                : 'border-transparent'"
                            :style="{ backgroundColor: sc.hex }"
                            @click="emit('update:color', sc.value)"
                        />
                    </Tooltip>
                </div>
            </section>

            <!-- ── Radius ────────────────────────────────────────────── -->
            <section class="space-y-1.5">
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{{ t.radius }}</h3>
                <div class="grid grid-cols-5 gap-1">
                    <button
                        v-for="opt in radiusOptions"
                        :key="opt.value"
                        type="button"
                        class="h-7 rounded-md border text-xs font-medium transition-colors"
                        :class="radius === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:radius', opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Size ──────────────────────────────────────────────── -->
            <section class="space-y-1.5">
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{{ t.density }}</h3>
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="opt in sizeOptions"
                        :key="opt.value"
                        type="button"
                        class="h-7 rounded-md border text-xs font-medium transition-colors"
                        :class="size === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:size', opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Focus halo ────────────────────────────────────────── -->
            <section class="space-y-1.5">
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{{ t.focusHalo }}</h3>
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="opt in haloOptions"
                        :key="opt.value"
                        type="button"
                        class="h-7 rounded-md border text-xs font-medium transition-colors"
                        :class="halo === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:halo', opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Dark surface preset ─────────────────────── -->
            <section class="space-y-1.5">
                <header class="flex items-center justify-between">
                    <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ t.surface }}
                    </h3>
                    <span class="text-[10px] font-mono text-muted-foreground capitalize">
                        {{ darkSurface }}
                    </span>
                </header>
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="opt in surfaceOptions"
                        :key="opt.value"
                        type="button"
                        class="flex items-center gap-1.5 h-8 px-2 rounded-md border text-xs font-medium transition-colors text-left"
                        :class="darkSurface === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:darkSurface', opt.value)"
                    >
                        <span
                            class="size-3 rounded-full ring-1 ring-border shrink-0"
                            :style="{ backgroundColor: opt.sample }"
                        />
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Locale ────────────────────────────────────────────── -->
            <section class="space-y-1.5">
                <h3 class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{{ t.language }}</h3>
                <div class="grid grid-cols-2 gap-1">
                    <button
                        v-for="opt in localeOptions"
                        :key="opt.value"
                        type="button"
                        class="h-7 rounded-md border text-xs font-medium transition-colors"
                        :class="locale === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:locale', opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Reset ─────────────────────────────────────────────── -->
            <div class="pt-2 border-t border-border">
                <button
                    type="button"
                    class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    @click="emit('reset')"
                >
                    <ArrowPathIcon class="w-3.5 h-3.5" />
                    {{ t.reset }}
                </button>
            </div>
        </div>
    </PopoverPanel>
</template>
