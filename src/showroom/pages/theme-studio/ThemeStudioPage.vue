<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ClipboardDocumentIcon, CheckIcon, ArrowDownTrayIcon, BookmarkIcon } from '@heroicons/vue/24/outline';

import ModoProvider from '../../../components/ModoProvider.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Button from '../../../components/forms/Button.vue';
import Input from '../../../components/forms/Input.vue';
import FormField from '../../../components/forms/FormField.vue';
import Switch from '../../../components/forms/Switch.vue';
import Checkbox from '../../../components/forms/Checkbox.vue';
import Select from '../../../components/forms/Select.vue';
import Slider from '../../../components/forms/Slider.vue';
import Segmented from '../../../components/forms/Segmented.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Banner from '../../../components/feedback/Banner.vue';
import Stat from '../../../components/data-display/Stat.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import Rating from '../../../components/forms/Rating.vue';
import ColorPicker from '../../../components/forms/ColorPicker.vue';

import type { ModoColor, ModoRadius, ModoSize, ModoHalo } from '../../../config/ModoConfig';

const STORAGE_KEY = 'mood-ui:theme-studio:v1';

interface ThemeState {
    color: ModoColor;
    radius: ModoRadius;
    size: ModoSize;
    halo: ModoHalo;
    primaryHex: string;
    radiusRem: number;
    theme: 'light' | 'dark';
}

const defaults: ThemeState = {
    color: 'primary',
    radius: 'medium',
    size: 'medium',
    halo: 'tinted',
    primaryHex: '#6366f1',
    radiusRem: 0.5,
    theme: 'light',
};

const state = ref<ThemeState>({ ...defaults });

// Hydrate from localStorage
try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.value = { ...defaults, ...JSON.parse(raw) };
} catch { /* noop */ }

watch(state, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { /* noop */ }
}, { deep: true });

function reset() { state.value = { ...defaults }; }

// Live CSS vars injected on the preview wrapper
const previewStyle = computed(() => ({
    '--primary': hexToOklch(state.value.primaryHex),
    '--radius': `${state.value.radiusRem}rem`,
} as Record<string, string>));

// Quick-and-dirty: keep the hex on the var directly. Tailwind layers using
// `bg-primary` will resolve via `--color-primary: var(--primary)`.
function hexToOklch(hex: string): string {
    // We just inject the hex; modern browsers accept hex everywhere oklch is used.
    return hex;
}

// Presets
interface Preset { name: string; primaryHex: string; radius: ModoRadius; halo: ModoHalo; }
const presets: Preset[] = [
    { name: 'Indigo (default)', primaryHex: '#6366f1', radius: 'medium', halo: 'tinted' },
    { name: 'Emerald soft',     primaryHex: '#10b981', radius: 'large',  halo: 'tinted' },
    { name: 'Rose punk',        primaryHex: '#ec4899', radius: 'small',  halo: 'tinted' },
    { name: 'Slate quiet',      primaryHex: '#475569', radius: 'medium', halo: 'neutral' },
    { name: 'Amber warm',       primaryHex: '#f59e0b', radius: 'large',  halo: 'tinted' },
    { name: 'Sky breeze',       primaryHex: '#0ea5e9', radius: 'full',   halo: 'tinted' },
];
function applyPreset(p: Preset) {
    state.value = { ...state.value, primaryHex: p.primaryHex, radius: p.radius, halo: p.halo };
}

// Copy snippets
const copied = ref<string | null>(null);
async function copy(label: string, text: string) {
    try {
        await navigator.clipboard.writeText(text);
        copied.value = label;
        setTimeout(() => { if (copied.value === label) copied.value = null; }, 1500);
    } catch { /* noop */ }
}

const cssSnippet = computed(() => `:root {
  --primary: ${state.value.primaryHex};
  --radius: ${state.value.radiusRem}rem;
}`);

const providerSnippet = computed(() => `<ModoProvider
  color="${state.value.color}"
  size="${state.value.size}"
  radius="${state.value.radius}"
  halo="${state.value.halo}"
  theme="${state.value.theme}"
>
  <App />
</ModoProvider>`);

// Preview state for the demo widgets
const switchVal = ref(true);
const checkVal = ref(true);
const sliderVal = ref(60);
const inputVal = ref('hello@mood-ui.dev');
const ratingVal = ref(4);
const segVal = ref('grid');
const colorPickerVal = ref('#10b981');
</script>

<template>
    <div class="flex flex-col gap-8">
        <header class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <Badge color="primary" variant="subtle">Beta</Badge>
                <span class="text-[11px] uppercase tracking-[0.16em] font-bold text-muted-foreground">Live editor</span>
            </div>
            <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05]">
                Theme Studio
            </h1>
            <p class="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
                Edita el tema en vivo. La preview reacciona al instante. Cuando te guste, copia el snippet
                CSS o las props del <code class="text-xs bg-muted px-1 py-0.5 rounded">&lt;ModoProvider&gt;</code>.
            </p>
        </header>

        <!-- Preview — FIRST, takes the full width -->
        <div class="flex flex-col gap-4">
                <ModoProvider
                    scoped
                    :color="state.color"
                    :radius="state.radius"
                    :size="state.size"
                    :halo="state.halo"
                    :theme="state.theme"
                >
                    <div :style="previewStyle" class="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
                        <div class="flex items-center justify-between">
                            <Typography variant="title" size="small">Live preview</Typography>
                            <Segmented
                                v-model="state.theme"
                                :items="[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]"
                                size="small"
                            />
                        </div>

                        <!-- Buttons row -->
                        <div class="flex flex-wrap gap-2">
                            <Button color="primary">Primary</Button>
                            <Button color="primary" variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button color="success">Success</Button>
                            <Button color="warning">Warning</Button>
                            <Button color="danger">Danger</Button>
                        </div>

                        <!-- Form row -->
                        <div class="grid sm:grid-cols-2 gap-4">
                            <FormField label="Email">
                                <Input v-model="inputVal" type="email" />
                            </FormField>
                            <FormField label="Plan">
                                <Select
                                    :model-value="'pro'"
                                    :options="[{ value: 'starter', label: 'Starter' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Team' }]"
                                />
                            </FormField>
                            <div class="flex items-center gap-4">
                                <Switch v-model="switchVal" label="Notificaciones" />
                                <Checkbox v-model="checkVal" label="Acepto" />
                            </div>
                            <div class="flex items-center gap-3">
                                <Rating v-model="ratingVal" />
                                <Segmented
                                    v-model="segVal"
                                    :items="[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]"
                                    size="small"
                                />
                            </div>
                            <FormField label="Volumen" class="sm:col-span-2">
                                <Slider v-model="sliderVal" />
                            </FormField>
                        </div>

                        <!-- Cards / KPIs -->
                        <div class="grid sm:grid-cols-3 gap-3">
                            <Stat label="Revenue" value="$48k" variant="outlined" :trend="{ value: 12 }" />
                            <Stat label="Users"   value="12.4k" variant="outlined" :trend="{ value: 8 }" />
                            <Stat label="Churn"   value="1.2%"  variant="outlined" :trend="{ value: -0.4, label: '-0.4pp' }" />
                        </div>

                        <!-- Misc -->
                        <Banner color="info" title="Heads up" description="Este es un Banner reaccionando al tema en vivo." />
                        <div class="flex items-center gap-3">
                            <Avatar fallback="AS" />
                            <Avatar fallback="ML" />
                            <Avatar fallback="DR" />
                            <Badge color="primary">Nuevo</Badge>
                            <Badge color="success" variant="subtle">Activo</Badge>
                            <ColorPicker v-model="colorPickerVal" />
                        </div>
                    </div>
                </ModoProvider>

                <!-- Snippets -->
                <div class="grid md:grid-cols-2 gap-4">
                    <Card class="p-4 flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">CSS variables</Typography>
                            <button
                                class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                @click="copy('css', cssSnippet)"
                            >
                                <CheckIcon v-if="copied === 'css'" class="w-3.5 h-3.5 text-success" />
                                <ClipboardDocumentIcon v-else class="w-3.5 h-3.5" />
                                {{ copied === 'css' ? 'Copiado' : 'Copiar' }}
                            </button>
                        </div>
                        <pre class="text-xs font-mono bg-muted/40 rounded-md p-3 overflow-x-auto">{{ cssSnippet }}</pre>
                    </Card>

                    <Card class="p-4 flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <Typography variant="caption" color="muted">ModoProvider props</Typography>
                            <button
                                class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                @click="copy('provider', providerSnippet)"
                            >
                                <CheckIcon v-if="copied === 'provider'" class="w-3.5 h-3.5 text-success" />
                                <ArrowDownTrayIcon v-else class="w-3.5 h-3.5" />
                                {{ copied === 'provider' ? 'Copiado' : 'Copiar' }}
                            </button>
                        </div>
                        <pre class="text-xs font-mono bg-muted/40 rounded-md p-3 overflow-x-auto">{{ providerSnippet }}</pre>
                    </Card>
                </div>
        </div>

        <!-- Controls — BELOW the preview, organized like the header settings popover -->
        <section class="rounded-2xl border border-border bg-card p-6 flex flex-col gap-6">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 class="text-lg font-bold tracking-tight text-foreground">Controls</h2>
                    <p class="text-xs text-muted-foreground mt-0.5">
                        Toca cualquier control y la preview reacciona al instante. Auto-guardado en este navegador.
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        <BookmarkIcon class="w-3 h-3" /> Auto-guardado
                    </span>
                    <Button size="small" variant="ghost" @click="reset">Reset</Button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <FormField label="Color primario">
                    <ColorPicker v-model="state.primaryHex" />
                </FormField>

                <FormField label="Color semántico">
                    <Segmented
                        v-model="state.color"
                        :items="[
                            { value: 'default', label: 'Default' },
                            { value: 'primary', label: 'Primary' },
                            { value: 'success', label: 'Success' },
                            { value: 'warning', label: 'Warning' },
                            { value: 'danger',  label: 'Danger'  },
                        ]"
                        size="small"
                        full-width
                    />
                </FormField>

                <FormField label="Tema">
                    <Segmented
                        v-model="state.theme"
                        :items="[
                            { value: 'light', label: 'Light' },
                            { value: 'dark',  label: 'Dark'  },
                        ]"
                        size="small"
                        full-width
                    />
                </FormField>

                <FormField label="Radius">
                    <Segmented
                        v-model="state.radius"
                        :items="[
                            { value: 'none',   label: 'None' },
                            { value: 'small',  label: 'S'    },
                            { value: 'medium', label: 'M'    },
                            { value: 'large',  label: 'L'    },
                            { value: 'full',   label: 'Full' },
                        ]"
                        size="small"
                        full-width
                    />
                </FormField>

                <FormField label="Tamaño base">
                    <Segmented
                        v-model="state.size"
                        :items="[
                            { value: 'small',  label: 'Small'  },
                            { value: 'medium', label: 'Medium' },
                            { value: 'large',  label: 'Large'  },
                        ]"
                        size="small"
                        full-width
                    />
                </FormField>

                <FormField label="Halo (focus ring)">
                    <Segmented
                        v-model="state.halo"
                        :items="[
                            { value: 'tinted',  label: 'Tinted'  },
                            { value: 'neutral', label: 'Neutral' },
                            { value: 'off',     label: 'Off'     },
                        ]"
                        size="small"
                        full-width
                    />
                </FormField>

                <FormField :label="`Radius CSS (${state.radiusRem}rem)`" class="md:col-span-2 lg:col-span-3">
                    <Slider v-model="state.radiusRem" :min="0" :max="2" :step="0.05" />
                </FormField>
            </div>

            <div class="border-t border-border pt-5">
                <div class="text-[11px] uppercase tracking-[0.14em] font-bold text-foreground/90 mb-3">Presets</div>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <button
                        v-for="p in presets"
                        :key="p.name"
                        class="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 text-left transition-colors"
                        @click="applyPreset(p)"
                    >
                        <span class="w-3 h-3 rounded-full border border-border shrink-0" :style="{ backgroundColor: p.primaryHex }" />
                        <span class="text-xs truncate">{{ p.name }}</span>
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
