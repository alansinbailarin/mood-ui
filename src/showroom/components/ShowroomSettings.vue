<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    AdjustmentsHorizontalIcon,
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    ArrowPathIcon,
} from '@heroicons/vue/24/outline';

import Button from '../../components/forms/Button.vue';
import Tooltip from '../../components/feedback/Tooltip.vue';
import PopoverPanel from '../../components/layout/PopoverPanel.vue';
import { usePopover } from '../../composables/usePopover';

import type { ModoColor, ModoRadius, ModoSize, ModoTheme, ModoHalo } from '../../config/ModoConfig';

const props = defineProps<{
    theme: ModoTheme;
    color: ModoColor;
    radius: ModoRadius;
    size: ModoSize;
    halo: ModoHalo;
    primaryHex: string;
    locale: 'es' | 'en';
}>();

const emit = defineEmits<{
    'update:theme': [v: ModoTheme];
    'update:color': [v: ModoColor];
    'update:radius': [v: ModoRadius];
    'update:size': [v: ModoSize];
    'update:halo': [v: ModoHalo];
    'update:primaryHex': [v: string];
    'update:locale': [v: 'es' | 'en'];
    reset: [];
}>();

const { triggerRef, panelRef, isOpen, panelStyle, toggle } = usePopover({
    placement: 'bottom-end',
    offset: 10,
});

// ── Color presets (named, like the screenshot) ───────────────────────────────
interface Swatch { name: string; hex: string; }
const presetColors: Swatch[] = [
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

const themeOptions = [
    { value: 'light' as const,  label: 'Light',  icon: SunIcon },
    { value: 'dark' as const,   label: 'Dark',   icon: MoonIcon },
    { value: 'system' as const, label: 'System', icon: ComputerDesktopIcon },
];

const localeOptions = [
    { value: 'es' as const, label: 'ES' },
    { value: 'en' as const, label: 'EN' },
];

const activeSwatch = computed(() =>
    presetColors.find((s) => s.hex.toLowerCase() === props.primaryHex.toLowerCase()),
);
</script>

<template>
    <span ref="triggerRef" class="inline-flex">
        <Tooltip content="Personalizar tema">
            <Button
                variant="ghost"
                size="small"
                icon-only
                aria-label="Personalizar tema"
                :aria-expanded="isOpen"
                @click="toggle"
            >
                <AdjustmentsHorizontalIcon class="w-5 h-5" />
            </Button>
        </Tooltip>
    </span>

    <PopoverPanel
        :open="isOpen"
        :style="panelStyle"
        radius="large"
        role="dialog"
        aria-label="Personalizar tema"
        @update:panelRef="panelRef = $event"
    >
        <div class="w-[320px] max-h-[min(80vh,640px)] overflow-y-auto p-5 space-y-5">
            <!-- ── Color Mode ────────────────────────────────────────── -->
            <section class="space-y-2">
                <header class="flex items-center justify-between">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color mode</h3>
                </header>
                <div class="grid grid-cols-3 gap-1.5">
                    <button
                        v-for="opt in themeOptions"
                        :key="opt.value"
                        type="button"
                        class="flex flex-col items-center justify-center gap-1.5 h-16 rounded-lg border text-xs font-medium transition-colors"
                        :class="theme === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-foreground hover:bg-muted/50'"
                        @click="emit('update:theme', opt.value)"
                    >
                        <component :is="opt.icon" class="w-4 h-4" />
                        <span>{{ opt.label }}</span>
                    </button>
                </div>
            </section>

            <!-- ── Primary color ─────────────────────────────────────── -->
            <section class="space-y-2">
                <header class="flex items-center justify-between">
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary</h3>
                    <span v-if="activeSwatch" class="text-[10px] font-mono text-muted-foreground">
                        {{ activeSwatch.name }}
                    </span>
                </header>
                <div class="grid grid-cols-6 gap-1.5">
                    <Tooltip
                        v-for="s in presetColors"
                        :key="s.hex"
                        :content="s.name"
                    >
                        <button
                            type="button"
                            :aria-label="`Color primario ${s.name}`"
                            class="w-full aspect-square rounded-md border transition-transform hover:scale-110"
                            :class="primaryHex.toLowerCase() === s.hex.toLowerCase()
                                ? 'border-foreground ring-2 ring-foreground/30 ring-offset-1 ring-offset-card scale-110'
                                : 'border-border'"
                            :style="{ backgroundColor: s.hex }"
                            @click="emit('update:primaryHex', s.hex)"
                        />
                    </Tooltip>
                </div>
                <label class="flex items-center gap-2 mt-2">
                    <input
                        type="color"
                        :value="primaryHex"
                        aria-label="Color primario personalizado"
                        class="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
                        @input="(e: Event) => emit('update:primaryHex', (e.target as HTMLInputElement).value)"
                    />
                    <code class="text-xs font-mono text-muted-foreground">{{ primaryHex.toUpperCase() }}</code>
                </label>
            </section>

            <!-- ── Color (semantic) ──────────────────────────────────── -->
            <section class="space-y-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accent</h3>
                <div class="flex flex-wrap gap-1">
                    <button
                        v-for="opt in colorOptions"
                        :key="opt.value"
                        type="button"
                        class="px-2.5 py-1 rounded-md border text-xs transition-colors"
                        :class="color === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:color', opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Radius ────────────────────────────────────────────── -->
            <section class="space-y-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Radius</h3>
                <div class="grid grid-cols-5 gap-1">
                    <button
                        v-for="opt in radiusOptions"
                        :key="opt.value"
                        type="button"
                        class="h-9 rounded-md border text-xs font-medium transition-colors"
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
            <section class="space-y-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Density</h3>
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="opt in sizeOptions"
                        :key="opt.value"
                        type="button"
                        class="h-9 rounded-md border text-xs font-medium transition-colors"
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
            <section class="space-y-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Focus halo</h3>
                <div class="grid grid-cols-3 gap-1">
                    <button
                        v-for="opt in haloOptions"
                        :key="opt.value"
                        type="button"
                        class="h-9 rounded-md border text-xs font-medium transition-colors"
                        :class="halo === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted/50 text-foreground'"
                        @click="emit('update:halo', opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </section>

            <!-- ── Locale ────────────────────────────────────────────── -->
            <section class="space-y-2">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Language</h3>
                <div class="grid grid-cols-2 gap-1">
                    <button
                        v-for="opt in localeOptions"
                        :key="opt.value"
                        type="button"
                        class="h-9 rounded-md border text-xs font-medium transition-colors"
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
                    Restablecer valores por defecto
                </button>
            </div>
        </div>
    </PopoverPanel>
</template>
