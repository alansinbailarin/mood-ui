<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    AdjustmentsHorizontalIcon,
    XMarkIcon,
    ArrowPathIcon,
    SparklesIcon,
    CheckIcon,
    PlayIcon,
    PauseIcon,
    BackwardIcon,
    ForwardIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BoltIcon,
    FireIcon,
    HeartIcon,
    ChatBubbleLeftEllipsisIcon,
    PaperAirplaneIcon,
    EllipsisHorizontalIcon,
    PlusIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    BeakerIcon,
    UsersIcon,
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    BellIcon,
    FolderIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
} from '@heroicons/vue/24/outline';

import Canvas from '../../../components/layout/Canvas.vue';
import ModoProvider from '../../../components/ModoProvider.vue';
import Card from '../../../components/data-display/Card.vue';
import Typography from '../../../components/data-display/Typography.vue';
import Button from '../../../components/forms/Button.vue';
import Input from '../../../components/forms/Input.vue';
import Switch from '../../../components/forms/Switch.vue';
import Slider from '../../../components/forms/Slider.vue';
import Segmented from '../../../components/forms/Segmented.vue';
import Badge from '../../../components/feedback/Badge.vue';
import Stat from '../../../components/data-display/Stat.vue';
import Avatar from '../../../components/data-display/avatar/Avatar.vue';
import AvatarGroup from '../../../components/data-display/avatar/AvatarGroup.vue';
import ColorPicker from '../../../components/forms/ColorPicker.vue';
import ProgressBar from '../../../components/feedback/ProgressBar.vue';
import SearchInput from '../../../components/forms/SearchInput.vue';
import Tabs from '../../../components/navigation/Tabs.vue';
import Calendar from '../../../components/data-display/calendar/Calendar.vue';
import Timeline from '../../../components/data-display/Timeline.vue';
import Tooltip from '../../../components/feedback/Tooltip.vue';

import type { ModoColor, ModoRadius, ModoSize, ModoHalo, ModoTheme } from '../../../config/ModoConfig';
import type { ModoPalette } from '../../../config/palettes';
import { paletteFromHex } from '../../../config/palettes';
import { darkSurfaces as darkSurfacePresets, type DarkSurfacePreset } from '../../../config/surfaces';
import { tintedLightSurfaces, tintedDarkSurfaces } from '../../utils/tintedSurfaces';

// ── State ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'mood-ui:theme-studio:v5';

interface ThemeState {
    theme:         ModoTheme;
    color:         ModoColor;
    radius:        ModoRadius;
    size:          ModoSize;
    halo:          ModoHalo;
    primaryHex:    string;
    accentHex:     string;
    baseIntensity: number;
    darkSurface:   DarkSurfacePreset;
}

const defaults: ThemeState = {
    theme: 'light', color: 'primary', radius: 'medium',
    size: 'medium', halo: 'tinted',
    primaryHex: '#6366f1', accentHex: '#6366f1',
    baseIntensity: 0, darkSurface: 'default',
};

const state = ref<ThemeState>({ ...defaults });
try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.value = { ...defaults, ...JSON.parse(raw) };
} catch { /* noop */ }
watch(state, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { /* noop */ }
}, { deep: true });

// ── ModoProvider derived props ────────────────────────────────────────────────
const palettes = computed<{ primary?: Partial<ModoPalette> }>(() => ({
    primary: paletteFromHex(state.value.primaryHex),
}));
const tintedSurfaces = computed(() =>
    state.value.baseIntensity > 0
        ? tintedLightSurfaces(state.value.accentHex, state.value.baseIntensity / 100)
        : undefined,
);
const darkSurfaceComputed = computed(() => {
    const base = darkSurfacePresets[state.value.darkSurface];
    if (state.value.baseIntensity === 0) return base;
    const tinted = tintedDarkSurfaces(state.value.accentHex, state.value.baseIntensity / 100);
    return { ...base, ...tinted };
});

// ── Panel ─────────────────────────────────────────────────────────────────────
const panelOpen = ref(false);

function reset() { state.value = { ...defaults }; }

const RAND_COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#0ea5e9','#8b5cf6','#ef4444','#14b8a6','#f97316','#d946ef'];
const RAND_RADII:    ModoRadius[]        = ['none','small','medium','large','full'];
const RAND_HALOS:    ModoHalo[]          = ['tinted','neutral'];
const RAND_SIZES:    ModoSize[]          = ['small','medium','large'];
const RAND_SURFACES: DarkSurfacePreset[] = ['default','navy','zinc','charcoal','midnight','forest'];

function random() {
    const hex = RAND_COLORS[Math.floor(Math.random() * RAND_COLORS.length)];
    state.value = {
        ...state.value,
        radius:        RAND_RADII[Math.floor(Math.random() * RAND_RADII.length)],
        size:          RAND_SIZES[Math.floor(Math.random() * RAND_SIZES.length)],
        halo:          RAND_HALOS[Math.floor(Math.random() * RAND_HALOS.length)],
        primaryHex:    hex, accentHex: hex,
        baseIntensity: Math.floor(Math.random() * 22),
        darkSurface:   RAND_SURFACES[Math.floor(Math.random() * RAND_SURFACES.length)],
    };
}

interface Preset { name: string; primaryHex: string; accentHex: string; radius: ModoRadius; halo: ModoHalo; }
const presets: Preset[] = [
    { name: 'Indigo',  primaryHex: '#6366f1', accentHex: '#8b5cf6', radius: 'medium', halo: 'tinted'  },
    { name: 'Rose',    primaryHex: '#ec4899', accentHex: '#f472b6', radius: 'small',  halo: 'tinted'  },
    { name: 'Emerald', primaryHex: '#10b981', accentHex: '#34d399', radius: 'large',  halo: 'tinted'  },
    { name: 'Amber',   primaryHex: '#f59e0b', accentHex: '#fbbf24', radius: 'medium', halo: 'tinted'  },
    { name: 'Sky',     primaryHex: '#0ea5e9', accentHex: '#38bdf8', radius: 'full',   halo: 'tinted'  },
    { name: 'Violet',  primaryHex: '#8b5cf6', accentHex: '#a78bfa', radius: 'medium', halo: 'tinted'  },
    { name: 'Slate',   primaryHex: '#475569', accentHex: '#64748b', radius: 'small',  halo: 'neutral' },
    { name: 'Teal',    primaryHex: '#14b8a6', accentHex: '#2dd4bf', radius: 'large',  halo: 'tinted'  },
];
function applyPreset(p: Preset) {
    state.value = { ...state.value, primaryHex: p.primaryHex, accentHex: p.accentHex, radius: p.radius, halo: p.halo };
}
function selectDarkSurface(key: DarkSurfacePreset) {
    state.value = { ...state.value, darkSurface: key, theme: 'dark' };
}

const darkSurfaceSwatches: { key: DarkSurfacePreset; label: string; bg: string }[] = [
    { key: 'default',  label: 'Default',  bg: 'oklch(0.145 0.005 264)'  },
    { key: 'navy',     label: 'Navy',     bg: 'oklch(0.155 0.04 250)'   },
    { key: 'zinc',     label: 'Zinc',     bg: 'oklch(0.15 0.001 264)'   },
    { key: 'charcoal', label: 'Charcoal', bg: 'oklch(0.155 0.007 50)'   },
    { key: 'midnight', label: 'Midnight', bg: 'oklch(0.13 0.025 280)'   },
    { key: 'forest',   label: 'Forest',   bg: 'oklch(0.15 0.02 148)'    },
];

const radiusOptions: { value: ModoRadius; label: string; rem: string }[] = [
    { value: 'none',   label: 'None', rem: '0'      },
    { value: 'small',  label: 'S',    rem: '3px'    },
    { value: 'medium', label: 'M',    rem: '8px'    },
    { value: 'large',  label: 'L',    rem: '12px'   },
    { value: 'full',   label: 'Full', rem: '9999px' },
];

// ── Demo state ────────────────────────────────────────────────────────────────
const activeTab    = ref('overview');
const sliderVolume = ref(64);
const isPlaying    = ref(true);
const trackTime    = ref(112);
const searchVal    = ref('');
const calendarDate = ref<Date | null>(new Date(2026, 4, 14));
const newMessage   = ref('');
const swAlerts     = ref(true);
const swSync       = ref(true);
const swBeta       = ref(false);
const sw2fa        = ref(true);

const revenueBars = [42,55,38,70,62,88,75,92,80,95,110,102,120,118];

const tasks = [
    { id: 1, title: 'Migrate billing to Stripe v2',      owner: 'SC', due: 'May 12', status: 'In review',  color: 'warning' as const },
    { id: 2, title: 'Refactor dashboard chart pipeline', owner: 'ML', due: 'May 14', status: 'In progress',color: 'primary' as const },
    { id: 3, title: 'Onboarding flow A/B test',          owner: 'AJ', due: 'May 16', status: 'Backlog',    color: 'default' as const },
    { id: 4, title: 'Q2 OKR review',                     owner: 'DR', due: 'May 18', status: 'Blocked',    color: 'danger'  as const },
    { id: 5, title: 'Release notes v0.6',                owner: 'SC', due: 'May 20', status: 'Done',       color: 'success' as const },
];

const chatThread = ref([
    { from: 'them', author: 'Marcus Lee',  initials: 'ML', text: 'Acabo de subir el preview de pricing 🎯',   time: '10:24' },
    { from: 'me',   author: 'You',         initials: 'AS', text: '¡Genial! Reviso los breakpoints en un rato.',time: '10:26' },
    { from: 'them', author: 'Diana Reyes', initials: 'DR', text: 'Compartí los analytics de la campaña.',     time: '10:31' },
    { from: 'me',   author: 'You',         initials: 'AS', text: 'Perfecto, los conecto al deck.',             time: '10:33' },
]);

const activityItems = [
    { id: 1, title: 'Deploy a producción · v0.5.2',  description: '142 tests passing', timestamp: '4 min',  icon: RocketLaunchIcon, color: 'success' as const, variant: 'icon' as const },
    { id: 2, title: 'Diana R. aprobó tu PR #312',    description: 'merge a main',      timestamp: '22 min', icon: CheckCircleIcon,  color: 'primary' as const, variant: 'icon' as const },
    { id: 3, title: 'Migración de DB completada',    description: '4.2GB en 12s',      timestamp: '1h',     icon: BeakerIcon,       color: 'warning' as const, variant: 'icon' as const },
    { id: 4, title: '12 nuevos miembros del equipo', description: 'invitaciones aceptadas', timestamp: '2h',icon: UsersIcon,        color: 'default' as const, variant: 'icon' as const },
];

const notifications = [
    { icon: RocketLaunchIcon, color: 'primary' as const, title: 'New feature: Dark mode presets',  time: '2 min ago',  badge: 'NEW'  },
    { icon: CheckCircleIcon,  color: 'success' as const, title: 'PR #312 merged successfully',      time: '22 min ago', badge: null   },
    { icon: BeakerIcon,       color: 'warning' as const, title: 'CPU spike: 95% for 3 min',         time: '1h ago',     badge: 'WARN' },
    { icon: UsersIcon,        color: 'default' as const, title: '12 new team members joined',        time: '2h ago',     badge: null   },
];

const storageItems = [
    { label: 'Documents', icon: FolderIcon,   used: 24, total: 50, color: 'primary' as const  },
    { label: 'Images',    icon: GlobeAltIcon, used: 12, total: 50, color: 'success' as const  },
    { label: 'Videos',    icon: BoltIcon,     used: 6,  total: 50, color: 'warning' as const  },
    { label: 'Backups',   icon: ShieldCheckIcon, used: 8, total: 50, color: 'default' as const },
];

const tabItems = [
    { value: 'overview', label: 'Overview' },
    { value: 'tasks',    label: 'Tasks', badge: tasks.length },
    { value: 'team',     label: 'Team'  },
];

function statusColorFor(s: string): 'success'|'warning'|'danger'|'default'|'primary' {
    if (s === 'Done')        return 'success';
    if (s === 'Blocked')     return 'danger';
    if (s === 'In review')   return 'warning';
    if (s === 'In progress') return 'primary';
    return 'default';
}
function fmtTime(sec: number) {
    return `${Math.floor(sec/60)}:${Math.floor(sec%60).toString().padStart(2,'0')}`;
}
function sendMessage() {
    const t = newMessage.value.trim();
    if (!t) return;
    chatThread.value.push({ from: 'me', author: 'You', initials: 'AS', text: t, time: 'ahora' });
    newMessage.value = '';
}
</script>

<template>
    <div class="relative" style="height: calc(100dvh - 57px - 4rem);">
        <ModoProvider
            scoped class="h-full"
            :theme="state.theme"
            :color="state.color"
            :radius="state.radius"
            :size="state.size"
            :halo="state.halo"
            :palettes="palettes"
            :surfaces="tintedSurfaces"
            :dark-surfaces="darkSurfaceComputed"
        >
            <!-- Canvas is the scroll host — radius is ALWAYS large (not user-controlled) -->
            <Canvas pattern="dots" :cell-size="22" intensity="subtle" surface="background" radius="large" bordered class="h-full overflow-y-auto">
                <div class="min-h-full p-5 sm:p-6 lg:p-8 pb-32 max-w-[1280px] mx-auto">

                    <!-- ── Workspace header ── -->
                    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div class="flex items-center gap-3">
                            <div class="size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center font-black text-lg shadow-sm">A</div>
                            <div>
                                <Typography variant="title" size="medium" class="!leading-tight">Acme Workspace</Typography>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <Typography variant="caption" color="muted">Q2 plan · 14 members</Typography>
                                    <span class="size-1 rounded-full bg-muted-foreground/40" />
                                    <span class="inline-flex items-center gap-1 text-xs text-success">
                                        <span class="size-1.5 rounded-full bg-success" /> live
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <SearchInput v-model="searchVal" placeholder="Search anything…" class="w-56" />
                            <AvatarGroup size="small" :max="5">
                                <Avatar fallback="SC" size="small" />
                                <Avatar fallback="ML" size="small" />
                                <Avatar fallback="DR" size="small" />
                                <Avatar fallback="AJ" size="small" />
                                <Avatar fallback="LP" size="small" />
                                <Avatar fallback="JN" size="small" />
                            </AvatarGroup>
                            <Tooltip content="Invite member">
                                <Button :icon="PlusIcon" variant="outline" size="small" aria-label="Invite" />
                            </Tooltip>
                        </div>
                    </div>

                    <!-- ── KPI row ── -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <Stat label="MRR"          value="$48,592" :icon="ArrowTrendingUpIcon"   color="success" variant="outlined" :trend="{ value: 12.4 }"            description="vs. abril" />
                        <Stat label="Active users" value="12,403"  :icon="UsersIcon"             color="primary" variant="outlined" :trend="{ value: 8.2 }"             description="nuevos: 312" />
                        <Stat label="Conversion"   value="3.42%"   :icon="BoltIcon"              color="warning" variant="outlined" :trend="{ value: -1.5, label: '-1.5pp' }" description="vs. 7d" />
                        <Stat label="Churn"        value="1.18%"   :icon="ArrowTrendingDownIcon" color="danger"  variant="outlined" :trend="{ value: -0.4, label: '-0.4pp' }" description="vs. 7d" />
                    </div>

                    <!-- ── Masonry bento ── -->
                    <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">

                        <!-- Revenue chart -->
                        <Card variant="outlined" padding="none" class="break-inside-avoid mb-4 overflow-hidden">
                            <div class="flex items-start justify-between p-5 pb-3">
                                <div>
                                    <Typography variant="overline" size="small" color="muted">Revenue · last 14 days</Typography>
                                    <div class="flex items-baseline gap-3 mt-1">
                                        <Typography variant="display" size="small" weight="medium">$48,592</Typography>
                                        <Badge color="success" variant="subtle" size="small">+12.4%</Badge>
                                    </div>
                                </div>
                                <Segmented :model-value="'14d'" :items="[{value:'24h',label:'24h'},{value:'7d',label:'7d'},{value:'14d',label:'14d'},{value:'30d',label:'30d'}]" size="small" />
                            </div>
                            <div class="px-5 pb-5">
                                <div class="flex items-end gap-1.5 h-36">
                                    <div
                                        v-for="(h, i) in revenueBars" :key="i"
                                        class="flex-1 rounded-md transition-all cursor-pointer group relative"
                                        :class="i === revenueBars.length - 1 ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'"
                                        :style="{ height: `${h}%` }"
                                    >
                                        <div class="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                                            ${{ (h * 35).toLocaleString() }}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex justify-between mt-2 text-[10px] text-muted-foreground">
                                    <span>Apr 24</span><span>Apr 27</span><span>Apr 30</span><span>May 3</span><span>May 6</span><span>Today</span>
                                </div>
                            </div>
                        </Card>

                        <!-- Activity rings -->
                        <Card variant="outlined" padding="large" class="break-inside-avoid mb-4 flex flex-col gap-4">
                            <Typography variant="overline" size="small" color="muted">Today's goals</Typography>
                            <div class="flex items-center justify-around gap-2">
                                <div v-for="g in [
                                    { label: 'Move',  pct: 78, color: 'var(--primary)',      icon: FireIcon  },
                                    { label: 'Focus', pct: 62, color: 'oklch(0.6 0.17 150)', icon: BoltIcon  },
                                    { label: 'Heart', pct: 91, color: 'oklch(0.65 0.22 10)', icon: HeartIcon },
                                ]" :key="g.label" class="flex flex-col items-center gap-1.5">
                                    <div class="size-16 rounded-full grid place-items-center relative" :style="{ background: `conic-gradient(${g.color} ${g.pct * 3.6}deg, color-mix(in oklch, ${g.color} 14%, transparent) 0)` }">
                                        <div class="size-12 rounded-full bg-card grid place-items-center">
                                            <component :is="g.icon" class="size-5" :style="{ color: g.color }" />
                                        </div>
                                    </div>
                                    <Typography variant="caption" weight="medium">{{ g.label }}</Typography>
                                    <Typography variant="caption" color="muted">{{ g.pct }}%</Typography>
                                </div>
                            </div>
                            <ProgressBar :value="(78+62+91)/3" color="primary" label="Daily completion" :show-value="true" />
                        </Card>

                        <!-- Tasks with Tabs -->
                        <Card variant="outlined" padding="none" class="break-inside-avoid mb-4 flex flex-col">
                            <div class="px-5 pt-4">
                                <Tabs v-model="activeTab" :items="tabItems" variant="line" color="primary" />
                            </div>
                            <div class="p-4 pt-3">
                                <div v-if="activeTab === 'overview'" class="grid grid-cols-3 gap-1.5">
                                    <div v-for="col in [
                                        { title: 'Backlog',     count: 8,  dot: 'bg-muted-foreground/30' },
                                        { title: 'In progress', count: 5,  dot: 'bg-primary'             },
                                        { title: 'Done',        count: 12, dot: 'bg-success'             },
                                    ]" :key="col.title" class="rounded-lg border border-border bg-muted/30 p-2 flex flex-col gap-1.5">
                                        <div class="flex items-center justify-between">
                                            <span class="size-1.5 rounded-full" :class="col.dot" />
                                            <Typography variant="caption" color="muted" class="text-[10px]">{{ col.count }}</Typography>
                                        </div>
                                        <Typography variant="caption" weight="medium" class="text-[10px] leading-tight">{{ col.title }}</Typography>
                                        <div v-for="t in tasks.slice(0,2)" :key="`${col.title}-${t.id}`" class="rounded-md bg-card border border-border p-1.5 flex flex-col gap-1">
                                            <Typography variant="body" size="small" weight="medium" class="!leading-snug line-clamp-2 text-[10px]">{{ t.title }}</Typography>
                                            <Badge :color="t.color" variant="subtle" size="small" class="self-start text-[9px] !px-1 !py-0">{{ t.due }}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <ul v-else-if="activeTab === 'tasks'" class="flex flex-col divide-y divide-border">
                                    <li v-for="t in tasks" :key="t.id" class="flex items-center gap-3 py-2.5">
                                        <Avatar :fallback="t.owner" size="small" />
                                        <div class="flex-1 min-w-0">
                                            <Typography variant="body" size="small" weight="medium" class="truncate">{{ t.title }}</Typography>
                                            <Typography variant="caption" color="muted">due {{ t.due }}</Typography>
                                        </div>
                                        <Badge :color="statusColorFor(t.status)" variant="subtle" size="small">{{ t.status }}</Badge>
                                        <Button :icon="EllipsisHorizontalIcon" variant="ghost" size="small" aria-label="More" />
                                    </li>
                                </ul>
                                <div v-else class="grid grid-cols-2 gap-2">
                                    <div v-for="m in [
                                        { name: 'Sarah Connor', role: 'Design',   initials: 'SC' },
                                        { name: 'Marcus Lee',   role: 'Frontend', initials: 'ML' },
                                        { name: 'Diana Reyes',  role: 'Product',  initials: 'DR' },
                                        { name: 'Alex Johnson', role: 'Backend',  initials: 'AJ' },
                                    ]" :key="m.name" class="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-muted/30">
                                        <Avatar :fallback="m.initials" size="small" />
                                        <div class="min-w-0">
                                            <Typography variant="body" size="small" weight="medium" class="truncate text-xs">{{ m.name }}</Typography>
                                            <Typography variant="caption" color="muted" class="text-[10px]">{{ m.role }}</Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <!-- Calendar -->
                        <Card variant="outlined" padding="none" class="break-inside-avoid mb-4 flex flex-col">
                            <div class="flex items-center justify-between px-4 pt-3 pb-1">
                                <Typography variant="overline" size="small" color="muted">Schedule</Typography>
                                <Badge color="primary" variant="subtle" size="small">3 events today</Badge>
                            </div>
                            <div class="px-3 pb-2">
                            <Calendar v-model="calendarDate" color="primary" />
                            </div>
                            <div class="flex flex-col gap-1 px-4 pb-3">
                                <div v-for="ev in [
                                    { color: 'bg-primary',   text: 'Design review · 15:00'     },
                                    { color: 'bg-success',   text: 'Sprint retro · 16:30'       },
                                    { color: 'bg-warning',   text: 'Q2 demo · 18:00'            },
                                ]" :key="ev.text" class="flex items-center gap-2">
                                    <span class="size-1.5 rounded-full shrink-0" :class="ev.color" />
                                    <Typography variant="caption" color="muted">{{ ev.text }}</Typography>
                                </div>
                            </div>
                        </Card>

                        <!-- Now Playing -->
                        <Card variant="outlined" padding="large" class="break-inside-avoid mb-4 flex flex-col gap-4 relative overflow-hidden">
                            <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(circle_at_30%_20%,var(--primary),transparent_55%),radial-gradient(circle_at_80%_80%,oklch(0.65_0.22_10),transparent_55%)]" />
                            <div class="relative flex items-center gap-3">
                                <div class="size-14 rounded-xl bg-gradient-to-br from-primary to-primary/40 grid place-items-center shadow-md">
                                    <PlayIcon class="size-6 text-primary-foreground" />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <Typography variant="overline" size="small" color="muted">Now playing</Typography>
                                    <Typography variant="title" size="small" class="truncate">Midnight City</Typography>
                                    <Typography variant="caption" color="muted">M83 · Hurry Up, We're Dreaming</Typography>
                                </div>
                            </div>
                            <div class="relative flex flex-col gap-1">
                                <Slider v-model="trackTime" :min="0" :max="240" />
                                <div class="flex justify-between text-[10px] text-muted-foreground tabular-nums">
                                    <span>{{ fmtTime(trackTime) }}</span><span>4:00</span>
                                </div>
                            </div>
                            <div class="relative flex items-center justify-between">
                                <Button :icon="HeartIcon" variant="ghost" size="small" aria-label="Like" />
                                <div class="flex items-center gap-1">
                                    <Button :icon="BackwardIcon" variant="ghost" size="small" aria-label="Prev" />
                                    <Button :icon="isPlaying ? PauseIcon : PlayIcon" color="primary" size="medium" @click="isPlaying = !isPlaying" aria-label="Play" />
                                    <Button :icon="ForwardIcon" variant="ghost" size="small" aria-label="Next" />
                                </div>
                                <div class="w-20">
                                    <Slider v-model="sliderVolume" :min="0" :max="100" />
                                </div>
                            </div>
                        </Card>

                        <!-- Notifications -->
                        <Card variant="outlined" padding="none" class="break-inside-avoid mb-4 overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                                <div class="flex items-center gap-2">
                                    <BellIcon class="size-4 text-muted-foreground" />
                                    <Typography variant="title" size="small">Notifications</Typography>
                                </div>
                                <Badge color="primary" variant="subtle" size="small">4 new</Badge>
                            </div>
                            <ul class="divide-y divide-border">
                                <li v-for="n in notifications" :key="n.title" class="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-default">
                                    <div class="mt-0.5 size-7 rounded-full grid place-items-center shrink-0" :class="{
                                        'bg-primary/10 text-primary':  n.color === 'primary',
                                        'bg-success/10 text-success':  n.color === 'success',
                                        'bg-warning/10 text-warning':  n.color === 'warning',
                                        'bg-muted text-muted-foreground': n.color === 'default',
                                    }">
                                        <component :is="n.icon" class="size-3.5" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <Typography variant="body" size="small" weight="medium" class="truncate leading-snug">{{ n.title }}</Typography>
                                        <Typography variant="caption" color="muted">{{ n.time }}</Typography>
                                    </div>
                                    <Badge v-if="n.badge" :color="n.badge === 'NEW' ? 'primary' : 'warning'" variant="subtle" size="small">{{ n.badge }}</Badge>
                                </li>
                            </ul>
                        </Card>

                        <!-- Chat -->
                        <Card variant="outlined" padding="none" class="break-inside-avoid mb-4 flex flex-col overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                                <div class="flex items-center gap-2">
                                    <ChatBubbleLeftEllipsisIcon class="size-4 text-muted-foreground" />
                                    <Typography variant="title" size="small">#design-system</Typography>
                                </div>
                                <Badge color="success" variant="subtle" size="small">4 online</Badge>
                            </div>
                            <div class="flex-1 p-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
                                <div
                                    v-for="(m, i) in chatThread" :key="i"
                                    class="flex items-end gap-2"
                                    :class="m.from === 'me' ? 'flex-row-reverse' : ''"
                                >
                                    <Avatar :fallback="m.initials" size="small" />
                                    <div class="max-w-[80%] flex flex-col" :class="m.from === 'me' ? 'items-end' : 'items-start'">
                                        <div class="px-3 py-2 text-sm leading-snug" :class="m.from === 'me' ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'">
                                            {{ m.text }}
                                        </div>
                                        <Typography variant="caption" color="muted" class="mt-0.5 px-1">{{ m.author }} · {{ m.time }}</Typography>
                                    </div>
                                </div>
                            </div>
                            <form class="flex items-center gap-2 p-3 border-t border-border" @submit.prevent="sendMessage">
                                <Input v-model="newMessage" placeholder="Escribe un mensaje…" class="flex-1" />
                                <Button :icon="PaperAirplaneIcon" color="primary" type="submit" aria-label="Send" />
                            </form>
                        </Card>

                        <!-- Activity timeline -->
                        <Card variant="outlined" padding="large" class="break-inside-avoid mb-4 flex flex-col gap-4">
                            <div class="flex items-center justify-between">
                                <Typography variant="title" size="small">Activity</Typography>
                                <Button variant="ghost" size="small">See all</Button>
                            </div>
                            <Timeline :items="activityItems" size="small" />
                        </Card>

                        <!-- Quick settings -->
                        <Card variant="outlined" padding="large" class="break-inside-avoid mb-4 flex flex-col gap-1">
                            <div class="flex items-center gap-2 mb-3">
                                <Cog6ToothIcon class="size-4 text-muted-foreground" />
                                <Typography variant="title" size="small">Quick Settings</Typography>
                            </div>
                            <div v-for="item in [
                                { label: 'Email notifications', desc: 'Alerts and digests',  model: swAlerts, color: 'primary' as const },
                                { label: 'Auto-sync',           desc: 'Sync across devices', model: swSync,   color: 'primary' as const },
                                { label: 'Beta features',       desc: 'Early access',        model: swBeta,   color: 'warning' as const },
                                { label: 'Two-factor auth',     desc: '2FA enabled',         model: sw2fa,    color: 'success' as const },
                            ]" :key="item.label" class="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                                <div>
                                    <Typography variant="body" size="small" weight="medium">{{ item.label }}</Typography>
                                    <Typography variant="caption" color="muted">{{ item.desc }}</Typography>
                                </div>
                                <Switch v-model="item.model" :color="item.color" />
                            </div>
                        </Card>

                        <!-- File storage -->
                        <Card variant="outlined" padding="large" class="break-inside-avoid mb-4 flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <FolderIcon class="size-4 text-muted-foreground" />
                                    <Typography variant="title" size="small">Storage</Typography>
                                </div>
                                <Typography variant="caption" color="muted">200 GB total</Typography>
                            </div>
                            <div class="p-2.5 rounded-xl border border-border bg-muted/30 flex flex-col gap-0.5">
                                <div class="flex justify-between mb-1">
                                    <Typography variant="caption" weight="medium">50 GB used of 200 GB</Typography>
                                    <Typography variant="caption" color="muted">25%</Typography>
                                </div>
                                <ProgressBar :value="25" color="primary" :show-value="false" />
                            </div>
                            <div class="flex flex-col gap-2.5">
                                <div v-for="s in storageItems" :key="s.label" class="flex items-center gap-2.5">
                                    <div class="size-7 rounded-lg bg-muted grid place-items-center shrink-0">
                                        <component :is="s.icon" class="size-3.5 text-muted-foreground" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex justify-between mb-1">
                                            <Typography variant="body" size="small" weight="medium">{{ s.label }}</Typography>
                                            <Typography variant="caption" color="muted">{{ s.used }} GB</Typography>
                                        </div>
                                        <ProgressBar :value="(s.used / 200) * 100" :color="s.color === 'default' ? 'primary' : s.color" :show-value="false" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <!-- Plan / Billing -->
                        <Card variant="outlined" padding="large" class="break-inside-avoid mb-4 flex flex-col gap-4 relative overflow-hidden">
                            <div class="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle_at_80%_10%,var(--primary),transparent_50%)]" />
                            <div class="relative flex items-start justify-between">
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <CreditCardIcon class="size-4 text-muted-foreground" />
                                        <Typography variant="overline" size="small" color="muted">Current plan</Typography>
                                    </div>
                                    <Typography variant="title" size="medium">Pro · $49/mo</Typography>
                                </div>
                                <Badge color="primary" variant="subtle">Active</Badge>
                            </div>
                            <div class="relative flex flex-col gap-2">
                                <div v-for="feat in [
                                    { text: 'Unlimited team members', ok: true  },
                                    { text: 'Advanced analytics',     ok: true  },
                                    { text: 'SSO & SAML',             ok: true  },
                                    { text: 'Custom domains',         ok: false },
                                ]" :key="feat.text" class="flex items-center gap-2">
                                    <CheckIcon v-if="feat.ok" class="size-3.5 text-success shrink-0" />
                                    <span v-else class="size-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                                    <Typography variant="body" size="small" :color="feat.ok ? 'default' : 'muted'">{{ feat.text }}</Typography>
                                </div>
                            </div>
                            <Button variant="outline" size="small" class="relative self-start">Upgrade to Enterprise</Button>
                        </Card>

                    </div>
                </div>
            </Canvas>
        </ModoProvider>
    </div>

    <!-- FAB + Panel teleported outside the scoped provider -->
    <Teleport to="body">

        <!-- Backdrop: closes panel on click outside -->
        <div v-if="panelOpen" class="fixed inset-0 z-[58]" @click="panelOpen = false" />

        <!-- FAB -->
        <button
            type="button"
            class="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] transition-all duration-200 bg-foreground text-background hover:opacity-90 active:scale-95"
            @click="panelOpen = !panelOpen"
        >
            <component :is="panelOpen ? XMarkIcon : AdjustmentsHorizontalIcon" class="size-3.5 shrink-0" />
            {{ panelOpen ? 'Close' : 'Customize' }}
        </button>

        <!-- Panel -->
        <Transition
            enter-active-class="transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
            enter-from-class="opacity-0 translate-y-2 scale-[0.98]"
            leave-active-class="transition-all duration-150 ease-in"
            leave-to-class="opacity-0 translate-y-1"
        >
            <div
                v-if="panelOpen"
                class="fixed right-6 z-[59] w-72 flex flex-col rounded-2xl overflow-hidden border border-border/60 bg-card/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.04)]"
                style="bottom: 4.75rem; max-height: calc(100dvh - 6.5rem); backdrop-filter: blur(20px);"
            >
                <!-- Header -->
                <div class="px-3 py-2.5 border-b border-border/50 shrink-0">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                            <div class="size-4 rounded-full shadow-sm shrink-0" :style="{ background: `linear-gradient(135deg, ${state.primaryHex}, ${state.accentHex})` }" />
                            <span class="text-[12px] font-semibold text-foreground tracking-tight">Theme Studio</span>
                        </div>
                        <div class="flex items-center">
                            <!-- State chips -->
                            <span v-for="chip in [state.radius, state.size, state.theme]" :key="chip"
                                class="text-[9px] font-medium px-1 py-0.5 rounded bg-muted/70 border border-border/50 text-muted-foreground capitalize leading-none mr-0.5">
                                {{ chip }}
                            </span>
                            <span v-if="state.baseIntensity > 0"
                                class="text-[9px] font-medium px-1 py-0.5 rounded leading-none text-white mr-1"
                                :style="{ background: state.accentHex + 'cc' }">
                                {{ state.baseIntensity }}%
                            </span>
                            <Tooltip content="Random">
                                <button type="button" class="size-6 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors" @click="random">
                                    <SparklesIcon class="size-3" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Reset">
                                <button type="button" class="size-6 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors" @click="reset">
                                    <ArrowPathIcon class="size-3" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <!-- Body -->
                <div class="flex-1 overflow-y-auto overscroll-contain">
                    <div class="p-2.5 flex flex-col gap-2.5">

                        <!-- ── Appearance ── -->
                        <section>
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Appearance</p>
                            <div class="grid grid-cols-3 gap-1">
                                <button
                                    v-for="mode in [
                                        { value: 'light',  label: 'Light',  icon: SunIcon             },
                                        { value: 'dark',   label: 'Dark',   icon: MoonIcon            },
                                        { value: 'system', label: 'System', icon: ComputerDesktopIcon },
                                    ]" :key="mode.value"
                                    type="button"
                                    class="flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all duration-150"
                                    :class="state.theme === mode.value
                                        ? 'border-transparent'
                                        : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'"
                                    :style="state.theme === mode.value ? { background: state.primaryHex + '12', boxShadow: `0 0 0 1.5px ${state.primaryHex}`, color: state.primaryHex } : {}"
                                    @click="state.theme = mode.value as ModoTheme"
                                >
                                    <component :is="mode.icon" class="size-3" />
                                    {{ mode.label }}
                                </button>
                            </div>
                        </section>

                        <!-- ── Presets ── -->
                        <section>
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Presets</p>
                            <div class="grid grid-cols-4 gap-1">
                                <button
                                    v-for="p in presets" :key="p.name"
                                    type="button"
                                    class="flex flex-col items-center gap-0.5 py-1 rounded-md border transition-all duration-150"
                                    :class="state.primaryHex === p.primaryHex ? 'border-transparent' : 'border-border hover:border-foreground/20'"
                                    :style="state.primaryHex === p.primaryHex ? { boxShadow: `0 0 0 1.5px ${p.primaryHex}`, background: p.primaryHex + '0d' } : {}"
                                    @click="applyPreset(p)"
                                >
                                    <div class="relative size-6 rounded-full shadow-sm" :style="{ background: `linear-gradient(135deg, ${p.primaryHex}, ${p.accentHex})` }">
                                        <CheckIcon v-if="state.primaryHex === p.primaryHex" class="absolute inset-0 m-auto size-3 text-white drop-shadow" />
                                    </div>
                                    <span class="text-[8px] font-medium text-muted-foreground leading-none">{{ p.name }}</span>
                                </button>
                            </div>
                        </section>

                        <!-- ── Colors ── -->
                        <section>
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Colors</p>
                            <div class="h-4 rounded-md mb-1.5" :style="{ background: `linear-gradient(90deg, ${state.primaryHex}, ${state.accentHex})` }" />
                            <div class="grid grid-cols-2 gap-1.5">
                                <div class="flex flex-col gap-0.5">
                                    <span class="text-[9px] font-medium text-muted-foreground">Primary</span>
                                    <ColorPicker v-model="state.primaryHex" />
                                </div>
                                <div class="flex flex-col gap-0.5">
                                    <span class="text-[9px] font-medium text-muted-foreground">Accent</span>
                                    <ColorPicker v-model="state.accentHex" />
                                </div>
                            </div>
                        </section>

                        <!-- ── Surfaces ── -->
                        <section>
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Surfaces</p>
                            <div class="mb-1.5 px-2 py-1.5 rounded-md bg-muted/40 border border-border/40">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-[9px] font-medium text-muted-foreground">Light tint</span>
                                    <span class="text-[9px] font-semibold tabular-nums" :style="{ color: state.baseIntensity > 0 ? state.accentHex : undefined }">{{ state.baseIntensity }}%</span>
                                </div>
                                <Slider v-model="state.baseIntensity" :min="0" :max="35" />
                            </div>
                            <span class="text-[9px] font-medium text-muted-foreground block mb-1">Dark preset <span class="opacity-50">· switches dark</span></span>
                            <div class="grid grid-cols-3 gap-1">
                                <button
                                    v-for="s in darkSurfaceSwatches" :key="s.key"
                                    type="button"
                                    class="flex flex-col items-center gap-0.5 p-1 rounded-md border transition-all duration-150"
                                    :class="state.darkSurface === s.key ? 'border-transparent' : 'border-border hover:border-foreground/20'"
                                    :style="state.darkSurface === s.key ? { boxShadow: `0 0 0 1.5px ${state.primaryHex}` } : {}"
                                    @click="selectDarkSurface(s.key)"
                                >
                                    <div class="size-5 rounded-sm ring-1 ring-inset ring-white/10" :style="{ background: s.bg }" />
                                    <span class="text-[8px] font-medium text-muted-foreground leading-none">{{ s.label }}</span>
                                </button>
                            </div>
                        </section>

                        <!-- ── Semantic ── -->
                        <section>
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Semantic</p>
                            <div class="flex gap-1">
                                <button
                                    v-for="c in [
                                        { value: 'default', color: '#94a3b8', label: 'Def' },
                                        { value: 'primary', color: state.primaryHex, label: 'Pri' },
                                        { value: 'success', color: '#10b981', label: 'Suc' },
                                        { value: 'warning', color: '#f59e0b', label: 'War' },
                                        { value: 'danger',  color: '#ef4444', label: 'Dan' },
                                    ]" :key="c.value"
                                    type="button"
                                    class="flex-1 flex flex-col items-center gap-0.5 py-1 rounded-md border transition-all duration-150"
                                    :class="state.color === c.value ? 'border-transparent' : 'border-border hover:border-foreground/20'"
                                    :style="state.color === c.value ? { boxShadow: `0 0 0 1.5px ${c.color}`, background: c.color + '12' } : {}"
                                    @click="state.color = c.value as ModoColor"
                                >
                                    <span class="size-2.5 rounded-full block" :style="{ background: c.color }" />
                                    <span class="text-[8px] font-medium text-muted-foreground">{{ c.label }}</span>
                                </button>
                            </div>
                        </section>

                        <!-- ── Shape ── -->
                        <section>
                            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Shape</p>
                            <div class="flex gap-1">
                                <button
                                    v-for="r in radiusOptions" :key="r.value"
                                    type="button"
                                    class="flex-1 flex flex-col items-center gap-0.5 py-1 rounded-md border transition-all duration-150"
                                    :class="state.radius === r.value ? 'border-transparent' : 'border-border hover:border-foreground/20'"
                                    :style="state.radius === r.value ? { boxShadow: `0 0 0 1.5px ${state.primaryHex}`, background: state.primaryHex + '12' } : {}"
                                    @click="state.radius = r.value"
                                >
                                    <div
                                        class="size-3.5 border-[1.5px] transition-all"
                                        :class="state.radius === r.value ? 'border-primary' : 'border-muted-foreground/40'"
                                        :style="{ borderRadius: r.rem }"
                                    />
                                    <span class="text-[8px] font-medium text-muted-foreground">{{ r.label }}</span>
                                </button>
                            </div>
                        </section>

                        <!-- ── Size + Ring ── -->
                        <section class="grid grid-cols-2 gap-1.5">
                            <div>
                                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Size</p>
                                <Segmented v-model="state.size" :items="[{value:'small',label:'S'},{value:'medium',label:'M'},{value:'large',label:'L'}]" :full-width="true" size="small" />
                            </div>
                            <div>
                                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Ring</p>
                                <Segmented v-model="state.halo" :items="[{value:'tinted',label:'Tint'},{value:'neutral',label:'Neu'},{value:'off',label:'Off'}]" :full-width="true" size="small" />
                            </div>
                        </section>

                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/20 shrink-0">
                    <div class="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span class="size-1.5 rounded-full bg-success animate-pulse" />
                        Auto-saved
                    </div>
                    <button type="button" class="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors" @click="reset">
                        Reset all
                    </button>
                </div>

            </div>
        </Transition>

    </Teleport>
</template>
