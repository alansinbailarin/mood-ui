<script setup lang="ts">
import { computed } from 'vue';
import {
    SwatchIcon,
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    ArrowPathIcon,
} from '@heroicons/vue/24/outline';

import { useI18n } from 'vue-i18n';

import Tooltip from '../../components/feedback/Tooltip.vue';
import PopoverPanel from '../../components/layout/PopoverPanel.vue';
import { usePopover } from '../../composables/usePopover';
import type { ShowroomLocale } from '../i18n';

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

const { t } = useI18n();

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
    { value: 'light' as const,  label: t('settings.light'),  icon: SunIcon },
    { value: 'dark' as const,   label: t('settings.dark'),   icon: MoonIcon },
    { value: 'system' as const, label: t('settings.system'), icon: ComputerDesktopIcon },
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
    <!-- Trigger: colored gradient dot + swatch icon -->
    <Tooltip :content="t('settings.customizeTheme')">
        <button
            ref="triggerRef"
            type="button"
            :aria-label="t('settings.customizeTheme')"
            :aria-expanded="isOpen"
            class="relative inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-muted/60"
            @click="toggle"
        >
            <SwatchIcon class="w-5 h-5 transition-colors" :style="{ color: primaryHex }" />
        </button>
    </Tooltip>

    <PopoverPanel
        :open="isOpen"
        :style="panelStyle"
        radius="large"
        role="dialog"
        :aria-label="t('settings.customizeTheme')"
        @update:panelRef="panelRef = $event"
    >
        <div class="w-[252px] flex flex-col rounded-2xl overflow-hidden">
            <!-- Header -->
            <div class="px-3 py-2 border-b border-border/50 shrink-0 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                    <div class="size-3 rounded-full shrink-0" :style="{ background: `linear-gradient(135deg, ${primaryHex}, ${accentHex})` }" />
                    <span class="text-[11px] font-semibold text-foreground tracking-tight truncate">{{ t('settings.customizeTheme') }}</span>
                </div>
                <Tooltip :content="t('settings.reset')">
                    <button type="button" class="size-6 shrink-0 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors" @click="emit('reset')">
                        <ArrowPathIcon class="w-3 h-3" />
                    </button>
                </Tooltip>
            </div>

            <!-- Body -->
            <div class="max-h-[min(80vh,560px)] overflow-y-auto overscroll-contain">
                <div class="p-3 flex flex-col gap-3">

                    <!-- ── Mode ── -->
                    <section>
                        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">{{ t('settings.colorMode') }}</p>
                        <div class="grid grid-cols-3 gap-1">
                            <button
                                v-for="opt in themeOptions"
                                :key="opt.value"
                                type="button"
                                class="flex items-center justify-center gap-1 py-2 rounded-lg border text-[10px] font-medium transition-all duration-150"
                                :class="theme === opt.value ? 'border-transparent' : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'"
                                :style="theme === opt.value ? { background: primaryHex + '12', boxShadow: `0 0 0 1.5px ${primaryHex}`, color: primaryHex } : {}"
                                @click="emit('update:theme', opt.value)"
                            >
                                <component :is="opt.icon" class="w-3 h-3 shrink-0" />
                                {{ opt.label }}
                            </button>
                        </div>
                    </section>

                    <!-- ── Accent ── -->
                    <section>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{{ t('settings.accent') }}</p>
                            <span v-if="activeAccent" class="text-[9px] text-muted-foreground">{{ activeAccent.name }}</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                            <Tooltip v-for="s in swatches" :key="`accent-${s.hex}`" :content="s.name">
                                <button
                                    type="button"
                                    :aria-label="`Accent ${s.name}`"
                                    class="size-4 rounded-full border-[1.5px] transition-transform hover:scale-125"
                                    :class="accentHex.toLowerCase() === s.hex.toLowerCase() ? 'border-foreground scale-125' : 'border-transparent'"
                                    :style="{ backgroundColor: s.hex }"
                                    @click="emit('update:accentHex', s.hex)"
                                />
                            </Tooltip>
                        </div>
                    </section>

                    <!-- ── Base intensity ── -->
                    <section>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{{ t('settings.base') }}</p>
                            <span class="text-[9px] font-semibold tabular-nums" :style="{ color: baseIntensity > 0 ? accentHex : undefined }">{{ baseIntensity }}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" step="5"
                            :value="baseIntensity"
                            :aria-label="t('settings.base')"
                            class="w-full accent-primary h-1 cursor-pointer"
                            @input="(e: Event) => emit('update:baseIntensity', Number((e.target as HTMLInputElement).value))"
                        />
                    </section>

                    <!-- ── Primary ── -->
                    <section>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{{ t('settings.primary') }}</p>
                            <span v-if="activePrimary" class="text-[9px] text-muted-foreground">{{ activePrimary.name }}</span>
                        </div>
                        <div class="flex flex-wrap gap-1 mb-1.5">
                            <Tooltip v-for="s in swatches" :key="`prim-${s.hex}`" :content="s.name">
                                <button
                                    type="button"
                                    :aria-label="`Primary ${s.name}`"
                                    class="size-4 rounded-full border-[1.5px] transition-transform hover:scale-125"
                                    :class="primaryHex.toLowerCase() === s.hex.toLowerCase() ? 'border-foreground scale-125' : 'border-transparent'"
                                    :style="{ backgroundColor: s.hex }"
                                    @click="emit('update:primaryHex', s.hex)"
                                />
                            </Tooltip>
                        </div>
                        <label class="flex items-center gap-1.5">
                            <input
                                type="color" :value="primaryHex" :aria-label="t('settings.primary')"
                                class="w-5 h-5 rounded cursor-pointer bg-transparent border border-border"
                                @input="(e: Event) => emit('update:primaryHex', (e.target as HTMLInputElement).value)"
                            />
                            <code class="text-[10px] font-mono text-muted-foreground">{{ primaryHex.toUpperCase() }}</code>
                        </label>
                    </section>

                    <!-- ── Semantic color ── -->
                    <section>
                        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">Color</p>
                        <div class="grid grid-cols-5 gap-1">
                            <button
                                v-for="sc in semanticColors"
                                :key="sc.value"
                                type="button"
                                :aria-label="sc.label"
                                class="flex flex-col items-center gap-1.5 py-2 rounded-md border text-[9px] font-medium transition-all duration-150"
                                :class="color === sc.value ? 'border-transparent' : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'"
                                :style="color === sc.value ? { background: sc.hex + '15', boxShadow: `0 0 0 1.5px ${sc.hex}`, color: sc.hex } : {}"
                                @click="emit('update:color', sc.value)"
                            >
                                <span class="size-3 rounded-full shrink-0" :style="{ background: sc.hex }" />
                                <span>{{ sc.label.slice(0,3) }}</span>
                            </button>
                        </div>
                    </section>

                    <!-- ── Radius ── -->
                    <section>
                        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">{{ t('settings.radius') }}</p>
                        <div class="grid grid-cols-5 gap-1">
                            <button
                                v-for="opt in radiusOptions"
                                :key="opt.value"
                                type="button"
                                class="py-1.5 rounded-md border text-[10px] font-medium transition-all duration-150"
                                :class="radius === opt.value ? 'border-transparent' : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'"
                                :style="radius === opt.value ? { background: primaryHex + '12', boxShadow: `0 0 0 1.5px ${primaryHex}`, color: primaryHex } : {}"
                                @click="emit('update:radius', opt.value)"
                            >{{ opt.label }}</button>
                        </div>
                    </section>

                    <!-- ── Size ── -->
                    <section>
                        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">{{ t('settings.density') }}</p>
                        <div class="grid grid-cols-3 gap-1">
                            <button
                                v-for="opt in sizeOptions"
                                :key="opt.value"
                                type="button"
                                class="py-1.5 rounded-md border text-[10px] font-medium transition-all duration-150"
                                :class="size === opt.value ? 'border-transparent' : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'"
                                :style="size === opt.value ? { background: primaryHex + '12', boxShadow: `0 0 0 1.5px ${primaryHex}`, color: primaryHex } : {}"
                                @click="emit('update:size', opt.value)"
                            >{{ opt.label }}</button>
                        </div>
                    </section>

                    <!-- ── Halo ── -->
                    <section>
                        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">{{ t('settings.focusHalo') }}</p>
                        <div class="grid grid-cols-3 gap-1">
                            <button
                                v-for="opt in haloOptions"
                                :key="opt.value"
                                type="button"
                                class="py-1.5 rounded-md border text-[10px] font-medium transition-all duration-150"
                                :class="halo === opt.value ? 'border-transparent' : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'"
                                :style="halo === opt.value ? { background: primaryHex + '12', boxShadow: `0 0 0 1.5px ${primaryHex}`, color: primaryHex } : {}"
                                @click="emit('update:halo', opt.value)"
                            >{{ opt.label }}</button>
                        </div>
                    </section>

                    <!-- ── Dark surface ── -->
                    <section>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">{{ t('settings.surface') }}</p>
                            <span class="text-[9px] text-muted-foreground capitalize">{{ darkSurface }}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <button
                                v-for="opt in surfaceOptions"
                                :key="opt.value"
                                type="button"
                                class="flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-all duration-150"
                                :class="darkSurface === opt.value ? 'border-transparent' : 'border-border hover:border-foreground/20'"
                                :style="darkSurface === opt.value ? { boxShadow: `0 0 0 1.5px ${primaryHex}` } : {}"
                                @click="emit('update:darkSurface', opt.value)"
                            >
                                <div class="size-3.5 rounded-sm shrink-0 ring-1 ring-inset ring-white/10" :style="{ background: opt.sample }" />
                                <span class="text-[9px] font-medium text-muted-foreground truncate">{{ opt.label }}</span>
                            </button>
                        </div>
                    </section>

                    <!-- ── Language ── -->
                    <section>
                        <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1.5">{{ t('settings.language') }}</p>
                        <div class="grid grid-cols-2 gap-1">
                            <button
                                v-for="opt in localeOptions"
                                :key="opt.value"
                                type="button"
                                class="py-1.5 rounded-md border text-[10px] font-medium transition-all duration-150"
                                :class="locale === opt.value ? 'border-transparent' : 'border-border text-muted-foreground hover:border-foreground/20'"
                                :style="locale === opt.value ? { background: primaryHex + '12', boxShadow: `0 0 0 1.5px ${primaryHex}`, color: primaryHex } : {}"
                                @click="emit('update:locale', opt.value)"
                            >{{ opt.label }}</button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    </PopoverPanel>
</template>
