<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Avatar, AvatarGroup, Badge, Button, Calendar, Canvas, Card, ColorPicker, Input, ModoProvider, ProgressBar, SearchInput, Segmented, Slider, Stat, Switch, Tabs, Timeline, Tooltip, Typography, darkSurfaces as darkSurfacePresets, paletteFromHex, type DarkSurfacePreset } from "mood-ui";
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
} from "@heroicons/vue/24/outline";





















import type {
  ModoColor,
  ModoRadius,
  ModoSize,
  ModoHalo,
  ModoTheme,
  ModoPalette,
} from "mood-ui";

import {
  tintedLightSurfaces,
  tintedDarkSurfaces,
} from "~/utils/tintedSurfaces";

// ── State ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mood-ui:theme-studio:v5";

interface ThemeState {
  theme: ModoTheme;
  color: ModoColor;
  radius: ModoRadius;
  size: ModoSize;
  halo: ModoHalo;
  primaryHex: string;
  accentHex: string;
  baseIntensity: number;
  darkSurface: DarkSurfacePreset;
}

const defaults: ThemeState = {
  theme: "light",
  color: "primary",
  radius: "medium",
  size: "medium",
  halo: "tinted",
  primaryHex: "#6366f1",
  accentHex: "#6366f1",
  baseIntensity: 0,
  darkSurface: "default",
};

const state = ref<ThemeState>({ ...defaults });
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    state.value = { ...defaults, ...parsed };
    // The slider used to be `v-model="state.baseIntensity"` on a native
    // `<input type="range">`, which silently coerces every emission to a
    // string. Persisted runs from that era have `"0"` in storage, and
    // `"0" === 0` is false — so `darkSurfaceComputed` would skip the
    // early return and let `tintedDarkSurfaces` overwrite the user's
    // chosen preset with neutral values. Normalize on read so the
    // numeric `=== 0` check downstream stays meaningful.
    if (typeof state.value.baseIntensity !== "number") {
      state.value.baseIntensity = Number(state.value.baseIntensity) || 0;
    }
  }
} catch {
  /* noop */
}
watch(
  state,
  (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch {
      /* noop */
    }
  },
  { deep: true },
);

// ── ModoProvider derived props ────────────────────────────────────────────────
const palettes = computed<{ primary?: Partial<ModoPalette> }>(() => ({
  primary: paletteFromHex(state.value.primaryHex),
}));
const tintedSurfaces = computed(() =>
  state.value.baseIntensity > 0
    ? tintedLightSurfaces(
        state.value.accentHex,
        state.value.baseIntensity / 100,
      )
    : undefined,
);
const darkSurfaceComputed = computed(() => {
  const base = darkSurfacePresets[state.value.darkSurface];
  if (state.value.baseIntensity === 0) return base;
  const tinted = tintedDarkSurfaces(
    state.value.accentHex,
    state.value.baseIntensity / 100,
  );
  return { ...base, ...tinted };
});

// ── Panel ─────────────────────────────────────────────────────────────────────
const panelOpen = ref(false);

function reset() {
  state.value = { ...defaults };
}

const RAND_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#d946ef",
];
const RAND_RADII: ModoRadius[] = ["none", "small", "medium", "large", "full"];
const RAND_HALOS: ModoHalo[] = ["tinted", "neutral"];
const RAND_SIZES: ModoSize[] = ["small", "medium", "large"];
const RAND_SURFACES: DarkSurfacePreset[] = [
  "default",
  "navy",
  "zinc",
  "charcoal",
  "midnight",
  "forest",
];

function random() {
  const hex = RAND_COLORS[Math.floor(Math.random() * RAND_COLORS.length)];
  state.value = {
    ...state.value,
    radius: RAND_RADII[Math.floor(Math.random() * RAND_RADII.length)],
    size: RAND_SIZES[Math.floor(Math.random() * RAND_SIZES.length)],
    halo: RAND_HALOS[Math.floor(Math.random() * RAND_HALOS.length)],
    primaryHex: hex,
    accentHex: hex,
    baseIntensity: Math.floor(Math.random() * 22),
    darkSurface:
      RAND_SURFACES[Math.floor(Math.random() * RAND_SURFACES.length)],
  };
}

interface Preset {
  name: string;
  primaryHex: string;
  accentHex: string;
  radius: ModoRadius;
  halo: ModoHalo;
}
const presets: Preset[] = [
  {
    name: "Indigo",
    primaryHex: "#6366f1",
    accentHex: "#8b5cf6",
    radius: "medium",
    halo: "tinted",
  },
  {
    name: "Rose",
    primaryHex: "#ec4899",
    accentHex: "#f472b6",
    radius: "small",
    halo: "tinted",
  },
  {
    name: "Emerald",
    primaryHex: "#10b981",
    accentHex: "#34d399",
    radius: "large",
    halo: "tinted",
  },
  {
    name: "Amber",
    primaryHex: "#f59e0b",
    accentHex: "#fbbf24",
    radius: "medium",
    halo: "tinted",
  },
  {
    name: "Sky",
    primaryHex: "#0ea5e9",
    accentHex: "#38bdf8",
    radius: "full",
    halo: "tinted",
  },
  {
    name: "Violet",
    primaryHex: "#8b5cf6",
    accentHex: "#a78bfa",
    radius: "medium",
    halo: "tinted",
  },
  {
    name: "Slate",
    primaryHex: "#475569",
    accentHex: "#64748b",
    radius: "small",
    halo: "neutral",
  },
  {
    name: "Teal",
    primaryHex: "#14b8a6",
    accentHex: "#2dd4bf",
    radius: "large",
    halo: "tinted",
  },
];
function applyPreset(p: Preset) {
  state.value = {
    ...state.value,
    primaryHex: p.primaryHex,
    accentHex: p.accentHex,
    radius: p.radius,
    halo: p.halo,
  };
}
function selectDarkSurface(key: DarkSurfacePreset) {
  state.value = { ...state.value, darkSurface: key, theme: "dark" };
}

const darkSurfaceSwatches: {
  key: DarkSurfacePreset;
  label: string;
  bg: string;
}[] = [
  { key: "default", label: "Default", bg: "oklch(0.145 0.005 264)" },
  { key: "navy", label: "Navy", bg: "oklch(0.155 0.04 250)" },
  { key: "zinc", label: "Zinc", bg: "oklch(0.15 0.001 264)" },
  { key: "charcoal", label: "Charcoal", bg: "oklch(0.155 0.007 50)" },
  { key: "midnight", label: "Midnight", bg: "oklch(0.13 0.025 280)" },
  { key: "forest", label: "Forest", bg: "oklch(0.15 0.02 148)" },
];

const radiusOptions: { value: ModoRadius; label: string; rem: string }[] = [
  { value: "none", label: "None", rem: "0" },
  { value: "small", label: "S", rem: "3px" },
  { value: "medium", label: "M", rem: "8px" },
  { value: "large", label: "L", rem: "12px" },
  { value: "full", label: "Full", rem: "9999px" },
];

// ── Demo state ────────────────────────────────────────────────────────────────
const activeTab = ref("overview");
const sliderVolume = ref(64);
const isPlaying = ref(true);
const trackTime = ref(112);
const searchVal = ref("");
const calendarDate = ref<Date | null>(new Date(2026, 4, 14));
const newMessage = ref("");
const swAlerts = ref(true);
const swSync = ref(true);
const swBeta = ref(false);
const sw2fa = ref(true);

const revenueBars = [
  42, 55, 38, 70, 62, 88, 75, 92, 80, 95, 110, 102, 120, 118,
];

const tasks = [
  {
    id: 1,
    title: "Migrate billing to Stripe v2",
    owner: "SC",
    due: "May 12",
    status: "In review",
    color: "warning" as const,
  },
  {
    id: 2,
    title: "Refactor dashboard chart pipeline",
    owner: "ML",
    due: "May 14",
    status: "In progress",
    color: "primary" as const,
  },
  {
    id: 3,
    title: "Onboarding flow A/B test",
    owner: "AJ",
    due: "May 16",
    status: "Backlog",
    color: "default" as const,
  },
  {
    id: 4,
    title: "Q2 OKR review",
    owner: "DR",
    due: "May 18",
    status: "Blocked",
    color: "danger" as const,
  },
  {
    id: 5,
    title: "Release notes v0.6",
    owner: "SC",
    due: "May 20",
    status: "Done",
    color: "success" as const,
  },
];

const chatThread = ref([
  {
    from: "them",
    author: "Marcus Lee",
    initials: "ML",
    text: "Acabo de subir el preview de pricing 🎯",
    time: "10:24",
  },
  {
    from: "me",
    author: "You",
    initials: "AS",
    text: "¡Genial! Reviso los breakpoints en un rato.",
    time: "10:26",
  },
  {
    from: "them",
    author: "Diana Reyes",
    initials: "DR",
    text: "Compartí los analytics de la campaña.",
    time: "10:31",
  },
  {
    from: "me",
    author: "You",
    initials: "AS",
    text: "Perfecto, los conecto al deck.",
    time: "10:33",
  },
]);

const activityItems = [
  {
    id: 1,
    title: "Deploy a producción · v0.9.0",
    description: "142 tests passing",
    timestamp: "4 min",
    icon: RocketLaunchIcon,
    color: "success" as const,
    variant: "icon" as const,
  },
  {
    id: 2,
    title: "Diana R. aprobó tu PR #312",
    description: "merge a main",
    timestamp: "22 min",
    icon: CheckCircleIcon,
    color: "primary" as const,
    variant: "icon" as const,
  },
  {
    id: 3,
    title: "Migración de DB completada",
    description: "4.2GB en 12s",
    timestamp: "1h",
    icon: BeakerIcon,
    color: "warning" as const,
    variant: "icon" as const,
  },
  {
    id: 4,
    title: "12 nuevos miembros del equipo",
    description: "invitaciones aceptadas",
    timestamp: "2h",
    icon: UsersIcon,
    color: "default" as const,
    variant: "icon" as const,
  },
];

const notifications = [
  {
    icon: RocketLaunchIcon,
    color: "primary" as const,
    title: "New feature: Dark mode presets",
    time: "2 min ago",
    badge: "NEW",
  },
  {
    icon: CheckCircleIcon,
    color: "success" as const,
    title: "PR #312 merged successfully",
    time: "22 min ago",
    badge: null,
  },
  {
    icon: BeakerIcon,
    color: "warning" as const,
    title: "CPU spike: 95% for 3 min",
    time: "1h ago",
    badge: "WARN",
  },
  {
    icon: UsersIcon,
    color: "default" as const,
    title: "12 new team members joined",
    time: "2h ago",
    badge: null,
  },
];

const storageItems = [
  {
    label: "Documents",
    icon: FolderIcon,
    used: 24,
    total: 50,
    color: "primary" as const,
  },
  {
    label: "Images",
    icon: GlobeAltIcon,
    used: 12,
    total: 50,
    color: "success" as const,
  },
  {
    label: "Videos",
    icon: BoltIcon,
    used: 6,
    total: 50,
    color: "warning" as const,
  },
  {
    label: "Backups",
    icon: ShieldCheckIcon,
    used: 8,
    total: 50,
    color: "default" as const,
  },
];

const tabItems = [
  { value: "overview", label: "Overview" },
  { value: "tasks", label: "Tasks", badge: tasks.length },
  { value: "team", label: "Team" },
];

function statusColorFor(
  s: string,
): "success" | "warning" | "danger" | "default" | "primary" {
  if (s === "Done") return "success";
  if (s === "Blocked") return "danger";
  if (s === "In review") return "warning";
  if (s === "In progress") return "primary";
  return "default";
}
function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60)
    .toString()
    .padStart(2, "0")}`;
}
function sendMessage() {
  const t = newMessage.value.trim();
  if (!t) return;
  chatThread.value.push({
    from: "me",
    author: "You",
    initials: "AS",
    text: t,
    time: "ahora",
  });
  newMessage.value = "";
}
</script>

<template>
  <div class="relative" style="height: calc(100dvh - 57px - 4rem)">
    <ModoProvider
      scoped
      class="h-full"
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
      <Canvas
        pattern="dots"
        :cell-size="22"
        intensity="subtle"
        surface="background"
        radius="large"
        bordered
        class="h-full overflow-y-auto"
      >
        <div class="min-h-full p-5 sm:p-6 lg:p-8 pb-32 max-w-[1280px] mx-auto">
          <!-- ── Workspace header ── -->
          <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-3">
              <div
                class="size-11 rounded-xl bg-primary text-primary-foreground grid place-items-center font-black text-lg shadow-sm"
              >
                A
              </div>
              <div>
                <Typography variant="title" size="medium" class="!leading-tight"
                  >Acme Workspace</Typography
                >
                <div class="flex items-center gap-2 mt-0.5">
                  <Typography variant="caption" color="muted"
                    >Q2 plan · 14 members</Typography
                  >
                  <span class="size-1 rounded-full bg-muted-foreground/40" />
                  <span
                    class="inline-flex items-center gap-1 text-xs text-success"
                  >
                    <span class="size-1.5 rounded-full bg-success" /> live
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <SearchInput
                v-model="searchVal"
                placeholder="Search anything…"
                class="w-56"
              />
              <AvatarGroup size="small" :max="5">
                <Avatar fallback="SC" size="small" />
                <Avatar fallback="ML" size="small" />
                <Avatar fallback="DR" size="small" />
                <Avatar fallback="AJ" size="small" />
                <Avatar fallback="LP" size="small" />
                <Avatar fallback="JN" size="small" />
              </AvatarGroup>
              <Tooltip content="Invite member">
                <Button
                  :icon="PlusIcon"
                  variant="outline"
                  size="small"
                  aria-label="Invite"
                />
              </Tooltip>
            </div>
          </div>

          <!-- ── KPI row ── -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Stat
              label="MRR"
              value="$48,592"
              :icon="ArrowTrendingUpIcon"
              color="success"
              variant="outlined"
              :trend="{ value: 12.4 }"
              description="vs. abril"
            />
            <Stat
              label="Active users"
              value="12,403"
              :icon="UsersIcon"
              color="primary"
              variant="outlined"
              :trend="{ value: 8.2 }"
              description="nuevos: 312"
            />
            <Stat
              label="Conversion"
              value="3.42%"
              :icon="BoltIcon"
              color="warning"
              variant="outlined"
              :trend="{ value: -1.5, label: '-1.5pp' }"
              description="vs. 7d"
            />
            <Stat
              label="Churn"
              value="1.18%"
              :icon="ArrowTrendingDownIcon"
              color="danger"
              variant="outlined"
              :trend="{ value: -0.4, label: '-0.4pp' }"
              description="vs. 7d"
            />
          </div>

          <!-- ── Masonry bento ── -->
          <div class="columns-1 sm:columns-2 lg:columns-3 gap-4">
            <!-- Revenue chart -->
            <Card
              variant="outlined"
              padding="none"
              class="break-inside-avoid mb-4 overflow-hidden"
            >
              <div class="flex items-start justify-between p-5 pb-3">
                <div>
                  <Typography variant="overline" size="small" color="muted"
                    >Revenue · last 14 days</Typography
                  >
                  <div class="flex items-baseline gap-3 mt-1">
                    <Typography variant="display" size="small" weight="medium"
                      >$48,592</Typography
                    >
                    <Badge color="success" variant="subtle" size="small"
                      >+12.4%</Badge
                    >
                  </div>
                </div>
                <Segmented
                  :model-value="'14d'"
                  :items="[
                    { value: '24h', label: '24h' },
                    { value: '7d', label: '7d' },
                    { value: '14d', label: '14d' },
                    { value: '30d', label: '30d' },
                  ]"
                  size="small"
                />
              </div>
              <div class="px-5 pb-5">
                <div class="flex items-end gap-1.5 h-36">
                  <div
                    v-for="(h, i) in revenueBars"
                    :key="i"
                    class="flex-1 rounded-md transition-all cursor-pointer group relative"
                    :class="
                      i === revenueBars.length - 1
                        ? 'bg-primary'
                        : 'bg-primary/20 hover:bg-primary/40'
                    "
                    :style="{ height: `${h}%` }"
                  >
                    <div
                      class="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none"
                    >
                      ${{ (h * 35).toLocaleString() }}
                    </div>
                  </div>
                </div>
                <div
                  class="flex justify-between mt-2 text-[10px] text-muted-foreground"
                >
                  <span>Apr 24</span><span>Apr 27</span><span>Apr 30</span
                  ><span>May 3</span><span>May 6</span><span>Today</span>
                </div>
              </div>
            </Card>

            <!-- Activity rings -->
            <Card
              variant="outlined"
              padding="large"
              class="break-inside-avoid mb-4 flex flex-col gap-4"
            >
              <Typography variant="overline" size="small" color="muted"
                >Today's goals</Typography
              >
              <div class="flex items-center justify-around gap-2">
                <div
                  v-for="g in [
                    {
                      label: 'Move',
                      pct: 78,
                      color: 'var(--primary)',
                      icon: FireIcon,
                    },
                    {
                      label: 'Focus',
                      pct: 62,
                      color: 'oklch(0.6 0.17 150)',
                      icon: BoltIcon,
                    },
                    {
                      label: 'Heart',
                      pct: 91,
                      color: 'oklch(0.65 0.22 10)',
                      icon: HeartIcon,
                    },
                  ]"
                  :key="g.label"
                  class="flex flex-col items-center gap-1.5"
                >
                  <div
                    class="size-16 rounded-full grid place-items-center relative"
                    :style="{
                      background: `conic-gradient(${g.color} ${g.pct * 3.6}deg, color-mix(in oklch, ${g.color} 14%, transparent) 0)`,
                    }"
                  >
                    <div
                      class="size-12 rounded-full bg-card grid place-items-center"
                    >
                      <component
                        :is="g.icon"
                        class="size-5"
                        :style="{ color: g.color }"
                      />
                    </div>
                  </div>
                  <Typography variant="caption" weight="medium">{{
                    g.label
                  }}</Typography>
                  <Typography variant="caption" color="muted"
                    >{{ g.pct }}%</Typography
                  >
                </div>
              </div>
              <ProgressBar
                :value="(78 + 62 + 91) / 3"
                color="primary"
                label="Daily completion"
                :show-value="true"
              />
            </Card>

            <!-- Tasks with Tabs -->
            <Card
              variant="outlined"
              padding="none"
              class="break-inside-avoid mb-4 flex flex-col"
            >
              <div class="px-5 pt-4">
                <Tabs
                  v-model="activeTab"
                  :items="tabItems"
                  variant="line"
                  color="primary"
                />
              </div>
              <div class="p-4 pt-3">
                <div
                  v-if="activeTab === 'overview'"
                  class="grid grid-cols-3 gap-1.5"
                >
                  <div
                    v-for="col in [
                      {
                        title: 'Backlog',
                        count: 8,
                        dot: 'bg-muted-foreground/30',
                      },
                      { title: 'In progress', count: 5, dot: 'bg-primary' },
                      { title: 'Done', count: 12, dot: 'bg-success' },
                    ]"
                    :key="col.title"
                    class="rounded-lg border border-border bg-muted/30 p-2 flex flex-col gap-1.5"
                  >
                    <div class="flex items-center justify-between">
                      <span class="size-1.5 rounded-full" :class="col.dot" />
                      <Typography
                        variant="caption"
                        color="muted"
                        class="text-[10px]"
                        >{{ col.count }}</Typography
                      >
                    </div>
                    <Typography
                      variant="caption"
                      weight="medium"
                      class="text-[10px] leading-tight"
                      >{{ col.title }}</Typography
                    >
                    <div
                      v-for="t in tasks.slice(0, 2)"
                      :key="`${col.title}-${t.id}`"
                      class="rounded-md bg-card border border-border p-1.5 flex flex-col gap-1"
                    >
                      <Typography
                        variant="body"
                        size="small"
                        weight="medium"
                        class="!leading-snug line-clamp-2 text-[10px]"
                        >{{ t.title }}</Typography
                      >
                      <Badge
                        :color="t.color"
                        variant="subtle"
                        size="small"
                        class="self-start text-[9px] !px-1 !py-0"
                        >{{ t.due }}</Badge
                      >
                    </div>
                  </div>
                </div>
                <ul
                  v-else-if="activeTab === 'tasks'"
                  class="flex flex-col divide-y divide-border"
                >
                  <li
                    v-for="t in tasks"
                    :key="t.id"
                    class="flex items-center gap-3 py-2.5"
                  >
                    <Avatar :fallback="t.owner" size="small" />
                    <div class="flex-1 min-w-0">
                      <Typography
                        variant="body"
                        size="small"
                        weight="medium"
                        class="truncate"
                        >{{ t.title }}</Typography
                      >
                      <Typography variant="caption" color="muted"
                        >due {{ t.due }}</Typography
                      >
                    </div>
                    <Badge
                      :color="statusColorFor(t.status)"
                      variant="subtle"
                      size="small"
                      >{{ t.status }}</Badge
                    >
                    <Button
                      :icon="EllipsisHorizontalIcon"
                      variant="ghost"
                      size="small"
                      aria-label="More"
                    />
                  </li>
                </ul>
                <div v-else class="grid grid-cols-2 gap-2">
                  <div
                    v-for="m in [
                      { name: 'Sarah Connor', role: 'Design', initials: 'SC' },
                      { name: 'Marcus Lee', role: 'Frontend', initials: 'ML' },
                      { name: 'Diana Reyes', role: 'Product', initials: 'DR' },
                      { name: 'Alex Johnson', role: 'Backend', initials: 'AJ' },
                    ]"
                    :key="m.name"
                    class="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-muted/30"
                  >
                    <Avatar :fallback="m.initials" size="small" />
                    <div class="min-w-0">
                      <Typography
                        variant="body"
                        size="small"
                        weight="medium"
                        class="truncate text-xs"
                        >{{ m.name }}</Typography
                      >
                      <Typography
                        variant="caption"
                        color="muted"
                        class="text-[10px]"
                        >{{ m.role }}</Typography
                      >
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Calendar -->
            <Card
              variant="outlined"
              padding="none"
              class="break-inside-avoid mb-4 flex flex-col"
            >
              <div class="flex items-center justify-between px-4 pt-3 pb-1">
                <Typography variant="overline" size="small" color="muted"
                  >Schedule</Typography
                >
                <Badge color="primary" variant="subtle" size="small"
                  >3 events today</Badge
                >
              </div>
              <div class="px-3 pb-2">
                <Calendar v-model="calendarDate" color="primary" />
              </div>
              <div class="flex flex-col gap-1 px-4 pb-3">
                <div
                  v-for="ev in [
                    { color: 'bg-primary', text: 'Design review · 15:00' },
                    { color: 'bg-success', text: 'Sprint retro · 16:30' },
                    { color: 'bg-warning', text: 'Q2 demo · 18:00' },
                  ]"
                  :key="ev.text"
                  class="flex items-center gap-2"
                >
                  <span
                    class="size-1.5 rounded-full shrink-0"
                    :class="ev.color"
                  />
                  <Typography variant="caption" color="muted">{{
                    ev.text
                  }}</Typography>
                </div>
              </div>
            </Card>

            <!-- Now Playing -->
            <Card
              variant="outlined"
              padding="large"
              class="break-inside-avoid mb-4 flex flex-col gap-4 relative overflow-hidden"
            >
              <div
                class="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(circle_at_30%_20%,var(--primary),transparent_55%),radial-gradient(circle_at_80%_80%,oklch(0.65_0.22_10),transparent_55%)]"
              />
              <div class="relative flex items-center gap-3">
                <div
                  class="size-14 rounded-xl bg-gradient-to-br from-primary to-primary/40 grid place-items-center shadow-md"
                >
                  <PlayIcon class="size-6 text-primary-foreground" />
                </div>
                <div class="min-w-0 flex-1">
                  <Typography variant="overline" size="small" color="muted"
                    >Now playing</Typography
                  >
                  <Typography variant="title" size="small" class="truncate"
                    >Midnight City</Typography
                  >
                  <Typography variant="caption" color="muted"
                    >M83 · Hurry Up, We're Dreaming</Typography
                  >
                </div>
              </div>
              <div class="relative flex flex-col gap-1">
                <Slider v-model="trackTime" :min="0" :max="240" />
                <div
                  class="flex justify-between text-[10px] text-muted-foreground tabular-nums"
                >
                  <span>{{ fmtTime(trackTime) }}</span
                  ><span>4:00</span>
                </div>
              </div>
              <div class="relative flex items-center justify-between">
                <Button
                  :icon="HeartIcon"
                  variant="ghost"
                  size="small"
                  aria-label="Like"
                />
                <div class="flex items-center gap-1">
                  <Button
                    :icon="BackwardIcon"
                    variant="ghost"
                    size="small"
                    aria-label="Prev"
                  />
                  <Button
                    :icon="isPlaying ? PauseIcon : PlayIcon"
                    color="primary"
                    size="medium"
                    @click="isPlaying = !isPlaying"
                    aria-label="Play"
                  />
                  <Button
                    :icon="ForwardIcon"
                    variant="ghost"
                    size="small"
                    aria-label="Next"
                  />
                </div>
                <div class="w-20">
                  <Slider v-model="sliderVolume" :min="0" :max="100" />
                </div>
              </div>
            </Card>

            <!-- Notifications -->
            <Card
              variant="outlined"
              padding="none"
              class="break-inside-avoid mb-4 overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-3 border-b border-border"
              >
                <div class="flex items-center gap-2">
                  <BellIcon class="size-4 text-muted-foreground" />
                  <Typography variant="title" size="small"
                    >Notifications</Typography
                  >
                </div>
                <Badge color="primary" variant="subtle" size="small"
                  >4 new</Badge
                >
              </div>
              <ul class="divide-y divide-border">
                <li
                  v-for="n in notifications"
                  :key="n.title"
                  class="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-default"
                >
                  <div
                    class="mt-0.5 size-7 rounded-full grid place-items-center shrink-0"
                    :class="{
                      'bg-primary/10 text-primary': n.color === 'primary',
                      'bg-success/10 text-success': n.color === 'success',
                      'bg-warning/10 text-warning': n.color === 'warning',
                      'bg-muted text-muted-foreground': n.color === 'default',
                    }"
                  >
                    <component :is="n.icon" class="size-3.5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <Typography
                      variant="body"
                      size="small"
                      weight="medium"
                      class="truncate leading-snug"
                      >{{ n.title }}</Typography
                    >
                    <Typography variant="caption" color="muted">{{
                      n.time
                    }}</Typography>
                  </div>
                  <Badge
                    v-if="n.badge"
                    :color="n.badge === 'NEW' ? 'primary' : 'warning'"
                    variant="subtle"
                    size="small"
                    >{{ n.badge }}</Badge
                  >
                </li>
              </ul>
            </Card>

            <!-- Chat -->
            <Card
              variant="outlined"
              padding="none"
              class="break-inside-avoid mb-4 flex flex-col overflow-hidden"
            >
              <div
                class="flex items-center justify-between px-4 py-3 border-b border-border"
              >
                <div class="flex items-center gap-2">
                  <ChatBubbleLeftEllipsisIcon
                    class="size-4 text-muted-foreground"
                  />
                  <Typography variant="title" size="small"
                    >#design-system</Typography
                  >
                </div>
                <Badge color="success" variant="subtle" size="small"
                  >4 online</Badge
                >
              </div>
              <div
                class="flex-1 p-4 flex flex-col gap-3 max-h-64 overflow-y-auto"
              >
                <div
                  v-for="(m, i) in chatThread"
                  :key="i"
                  class="flex items-end gap-2"
                  :class="m.from === 'me' ? 'flex-row-reverse' : ''"
                >
                  <Avatar :fallback="m.initials" size="small" />
                  <div
                    class="max-w-[80%] flex flex-col"
                    :class="m.from === 'me' ? 'items-end' : 'items-start'"
                  >
                    <div
                      class="px-3 py-2 text-sm leading-snug"
                      :class="
                        m.from === 'me'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                          : 'bg-muted text-foreground rounded-2xl rounded-bl-sm'
                      "
                    >
                      {{ m.text }}
                    </div>
                    <Typography
                      variant="caption"
                      color="muted"
                      class="mt-0.5 px-1"
                      >{{ m.author }} · {{ m.time }}</Typography
                    >
                  </div>
                </div>
              </div>
              <form
                class="flex items-center gap-2 p-3 border-t border-border"
                @submit.prevent="sendMessage"
              >
                <Input
                  v-model="newMessage"
                  placeholder="Escribe un mensaje…"
                  class="flex-1"
                />
                <Button
                  :icon="PaperAirplaneIcon"
                  color="primary"
                  type="submit"
                  aria-label="Send"
                />
              </form>
            </Card>

            <!-- Activity timeline -->
            <Card
              variant="outlined"
              padding="large"
              class="break-inside-avoid mb-4 flex flex-col gap-4"
            >
              <div class="flex items-center justify-between">
                <Typography variant="title" size="small">Activity</Typography>
                <Button variant="ghost" size="small">See all</Button>
              </div>
              <Timeline :items="activityItems" size="small" />
            </Card>

            <!-- Quick settings -->
            <Card
              variant="outlined"
              padding="large"
              class="break-inside-avoid mb-4 flex flex-col gap-1"
            >
              <div class="flex items-center gap-2 mb-3">
                <Cog6ToothIcon class="size-4 text-muted-foreground" />
                <Typography variant="title" size="small"
                  >Quick Settings</Typography
                >
              </div>
              <div
                v-for="item in [
                  {
                    label: 'Email notifications',
                    desc: 'Alerts and digests',
                    model: swAlerts,
                    color: 'primary' as const,
                  },
                  {
                    label: 'Auto-sync',
                    desc: 'Sync across devices',
                    model: swSync,
                    color: 'primary' as const,
                  },
                  {
                    label: 'Beta features',
                    desc: 'Early access',
                    model: swBeta,
                    color: 'warning' as const,
                  },
                  {
                    label: 'Two-factor auth',
                    desc: '2FA enabled',
                    model: sw2fa,
                    color: 'success' as const,
                  },
                ]"
                :key="item.label"
                class="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <div>
                  <Typography variant="body" size="small" weight="medium">{{
                    item.label
                  }}</Typography>
                  <Typography variant="caption" color="muted">{{
                    item.desc
                  }}</Typography>
                </div>
                <Switch v-model="item.model" :color="item.color" />
              </div>
            </Card>

            <!-- File storage -->
            <Card
              variant="outlined"
              padding="large"
              class="break-inside-avoid mb-4 flex flex-col gap-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <FolderIcon class="size-4 text-muted-foreground" />
                  <Typography variant="title" size="small">Storage</Typography>
                </div>
                <Typography variant="caption" color="muted"
                  >200 GB total</Typography
                >
              </div>
              <div
                class="p-2.5 rounded-xl border border-border bg-muted/30 flex flex-col gap-0.5"
              >
                <div class="flex justify-between mb-1">
                  <Typography variant="caption" weight="medium"
                    >50 GB used of 200 GB</Typography
                  >
                  <Typography variant="caption" color="muted">25%</Typography>
                </div>
                <ProgressBar :value="25" color="primary" :show-value="false" />
              </div>
              <div class="flex flex-col gap-2.5">
                <div
                  v-for="s in storageItems"
                  :key="s.label"
                  class="flex items-center gap-2.5"
                >
                  <div
                    class="size-7 rounded-lg bg-muted grid place-items-center shrink-0"
                  >
                    <component
                      :is="s.icon"
                      class="size-3.5 text-muted-foreground"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between mb-1">
                      <Typography variant="body" size="small" weight="medium">{{
                        s.label
                      }}</Typography>
                      <Typography variant="caption" color="muted"
                        >{{ s.used }} GB</Typography
                      >
                    </div>
                    <ProgressBar
                      :value="(s.used / 200) * 100"
                      :color="s.color === 'default' ? 'primary' : s.color"
                      :show-value="false"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <!-- Plan / Billing -->
            <Card
              variant="outlined"
              padding="large"
              class="break-inside-avoid mb-4 flex flex-col gap-4 relative overflow-hidden"
            >
              <div
                class="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle_at_80%_10%,var(--primary),transparent_50%)]"
              />
              <div class="relative flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <CreditCardIcon class="size-4 text-muted-foreground" />
                    <Typography variant="overline" size="small" color="muted"
                      >Current plan</Typography
                    >
                  </div>
                  <Typography variant="title" size="medium"
                    >Pro · $49/mo</Typography
                  >
                </div>
                <Badge color="primary" variant="subtle">Active</Badge>
              </div>
              <div class="relative flex flex-col gap-2">
                <div
                  v-for="feat in [
                    { text: 'Unlimited team members', ok: true },
                    { text: 'Advanced analytics', ok: true },
                    { text: 'SSO & SAML', ok: true },
                    { text: 'Custom domains', ok: false },
                  ]"
                  :key="feat.text"
                  class="flex items-center gap-2"
                >
                  <CheckIcon
                    v-if="feat.ok"
                    class="size-3.5 text-success shrink-0"
                  />
                  <span
                    v-else
                    class="size-3.5 rounded-full border border-muted-foreground/30 shrink-0"
                  />
                  <Typography
                    variant="body"
                    size="small"
                    :color="feat.ok ? 'default' : 'muted'"
                    >{{ feat.text }}</Typography
                  >
                </div>
              </div>
              <Button variant="outline" size="small" class="relative self-start"
                >Upgrade to Enterprise</Button
              >
            </Card>
          </div>
        </div>
      </Canvas>
    </ModoProvider>
  </div>

  <!-- FAB + Panel teleported outside the scoped provider -->
  <Teleport to="body">
    <!-- Backdrop: closes panel on click outside -->
    <div
      v-if="panelOpen"
      class="fixed inset-0 z-[58]"
      @click="panelOpen = false"
    />

    <!-- FAB -->
    <button
      type="button"
      class="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] transition-all duration-200 bg-foreground text-background hover:opacity-90 active:scale-95"
      @click="panelOpen = !panelOpen"
    >
      <component
        :is="panelOpen ? XMarkIcon : AdjustmentsHorizontalIcon"
        class="size-3.5 shrink-0"
      />
      {{ panelOpen ? "Close" : "Customize" }}
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
        style="
          bottom: 4.75rem;
          max-height: calc(100dvh - 6.5rem);
          backdrop-filter: blur(20px);
        "
      >
        <!-- Header -->
        <div class="relative shrink-0 overflow-hidden">
          <!-- Accent line -->
          <div
            class="h-0.5 w-full"
            :style="{
              background: `linear-gradient(90deg, transparent 0%, ${state.primaryHex} 40%, ${state.primaryHex}60 70%, transparent 100%)`,
            }"
          />
          <div
            class="px-3 py-2.5 border-b border-border/50"
            :style="{
              background: `linear-gradient(135deg, ${state.primaryHex}14 0%, transparent 50%)`,
            }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <div
                  class="size-[14px] rounded-full shrink-0"
                  :style="{
                    background: state.primaryHex,
                    boxShadow: `0 0 0 2.5px ${state.primaryHex}30, 0 0 10px ${state.primaryHex}55`,
                  }"
                />
                <span
                  class="text-[11.5px] font-semibold text-foreground tracking-tight truncate"
                >
                  Theme Studio
                </span>
              </div>
              <Tooltip content="Reset">
                <button
                  type="button"
                  class="size-6 shrink-0 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  @click="reset"
                >
                  <ArrowPathIcon class="w-[13px] h-[13px]" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="max-h-[min(80vh,520px)] overflow-y-auto overscroll-contain">
          <div class="px-3 py-2.5 flex flex-col gap-3">
            <!-- divider -->
            <div class="h-px bg-border/40" />

            <!-- ── Theme Mode ── -->
            <section>
              <span
                class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1.5"
                >Mode</span
              >
              <div class="grid grid-cols-3 gap-1">
                <button
                  v-for="mode in [
                    { value: 'light', label: 'Light', icon: SunIcon },
                    { value: 'dark', label: 'Dark', icon: MoonIcon },
                    {
                      value: 'system',
                      label: 'System',
                      icon: ComputerDesktopIcon,
                    },
                  ]"
                  :key="mode.value"
                  type="button"
                  class="flex items-center justify-center gap-1 py-2 rounded-lg border text-[10px] font-medium transition-all duration-150"
                  :class="
                    state.theme === mode.value
                      ? 'border-transparent'
                      : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                  "
                  :style="
                    state.theme === mode.value
                      ? {
                          background: state.primaryHex + '12',
                          boxShadow: `0 0 0 1.5px ${state.primaryHex}`,
                          color: state.primaryHex,
                        }
                      : {}
                  "
                  @click="state.theme = mode.value as ModoTheme"
                >
                  <component :is="mode.icon" class="size-3" />
                  {{ mode.label }}
                </button>
              </div>
            </section>

            <!-- divider -->
            <div class="h-px bg-border/40" />

            <!-- ── Primary Color ── -->
            <section>
              <div class="flex items-center justify-between mb-1.5">
                <span
                  class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest"
                >
                  Primary
                </span>
                <span
                  class="text-[8px] font-bold px-[6px] py-[2px] rounded-full"
                  :style="{
                    background: state.primaryHex + '18',
                    color: state.primaryHex,
                  }"
                  >{{ state.primaryHex }}</span
                >
              </div>

              <!-- Swatch dots -->
              <div class="grid grid-cols-9 gap-y-1.5 gap-x-[5px] mb-2">
                <Tooltip
                  v-for="s in [
                    { name: 'Indigo', hex: '#6366f1' },
                    { name: 'Violet', hex: '#8b5cf6' },
                    { name: 'Purple', hex: '#a855f7' },
                    { name: 'Fuchsia', hex: '#d946ef' },
                    { name: 'Pink', hex: '#ec4899' },
                    { name: 'Rose', hex: '#f43f5e' },
                    { name: 'Red', hex: '#ef4444' },
                    { name: 'Orange', hex: '#f97316' },
                    { name: 'Amber', hex: '#f59e0b' },
                    { name: 'Yellow', hex: '#eab308' },
                    { name: 'Lime', hex: '#84cc16' },
                    { name: 'Green', hex: '#22c55e' },
                    { name: 'Emerald', hex: '#10b981' },
                    { name: 'Teal', hex: '#14b8a6' },
                    { name: 'Cyan', hex: '#06b6d4' },
                    { name: 'Sky', hex: '#0ea5e9' },
                    { name: 'Blue', hex: '#3b82f6' },
                    { name: 'Slate', hex: '#64748b' },
                  ]"
                  :key="`prim-${s.hex}`"
                  :content="s.name"
                >
                  <button
                    type="button"
                    :aria-label="`Primary ${s.name}`"
                    class="size-[14px] rounded-full mx-auto block transition-all duration-150 hover:scale-110"
                    :style="{
                      backgroundColor: s.hex,
                      transform:
                        state.primaryHex.toLowerCase() === s.hex.toLowerCase()
                          ? 'scale(0.78)'
                          : undefined,
                      outline:
                        state.primaryHex.toLowerCase() === s.hex.toLowerCase()
                          ? `2px solid ${s.hex}`
                          : 'none',
                      outlineOffset: '3px',
                    }"
                    @click="
                      state.primaryHex = s.hex;
                      state.accentHex = s.hex;
                    "
                  />
                </Tooltip>
              </div>
            </section>

            <!-- divider -->
            <div class="h-px bg-border/40" />

            <!-- ── Base Intensity ── -->
            <section>
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]"
                  >Base</span
                >
                <span
                  class="text-[8px] font-bold tabular-nums px-[6px] py-[2px] rounded-full transition-all"
                  :style="
                    state.baseIntensity > 0
                      ? {
                          background: state.primaryHex + '18',
                          color: state.primaryHex,
                        }
                      : { color: 'var(--muted-foreground)', opacity: '0.5' }
                  "
                  >{{ state.baseIntensity }}%</span
                >
              </div>
              <div class="relative h-4 flex items-center">
                <div
                  class="absolute inset-x-0 h-[3px] rounded-full pointer-events-none"
                  :style="{
                    background: `linear-gradient(90deg, ${state.primaryHex}30 0%, ${state.primaryHex} 100%)`,
                  }"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  v-model.number="state.baseIntensity"
                  aria-label="Base intensity"
                  class="w-full h-[3px] cursor-pointer bg-transparent appearance-none [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[13px] [&::-webkit-slider-thumb]:h-[13px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.07)] [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:w-[13px] [&::-moz-range-thumb]:h-[13px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
                />
              </div>
            </section>

            <!-- divider -->
            <div class="h-px bg-border/40" />

            <!-- ── Radius ── -->
            <section>
              <span
                class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1.5"
                >Radius</span
              >
              <div class="grid grid-cols-5 gap-1">
                <button
                  v-for="opt in radiusOptions"
                  :key="opt.value"
                  type="button"
                  class="flex flex-col items-center gap-[5px] py-[7px] rounded-lg border transition-all duration-100"
                  :class="
                    state.radius === opt.value
                      ? 'border-transparent'
                      : 'border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/20'
                  "
                  :style="
                    state.radius === opt.value
                      ? {
                          background: state.primaryHex + '12',
                          boxShadow: `0 0 0 1.5px ${state.primaryHex}`,
                          color: state.primaryHex,
                        }
                      : {}
                  "
                  @click="state.radius = opt.value"
                >
                  <div
                    class="size-[12px] border-[1.5px]"
                    :style="{
                      borderColor:
                        state.radius === opt.value
                          ? state.primaryHex
                          : 'currentColor',
                      opacity: state.radius === opt.value ? 1 : 0.4,
                      borderRadius:
                        opt.value === 'none'
                          ? '0'
                          : opt.value === 'small'
                            ? '2px'
                            : opt.value === 'medium'
                              ? '4px'
                              : opt.value === 'large'
                                ? '7px'
                                : '50%',
                    }"
                  />
                </button>
              </div>
            </section>

            <!-- ── Density ── -->
            <section>
              <span
                class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] block mb-1.5"
                >Density</span
              >
              <div class="grid grid-cols-3 gap-1">
                <button
                  v-for="opt in ['small', 'medium', 'large'] as ModoSize[]"
                  :key="opt"
                  type="button"
                  class="flex items-center justify-center py-2.25 rounded-lg border transition-all duration-100"
                  :class="
                    state.size === opt
                      ? 'border-transparent'
                      : 'border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/20'
                  "
                  :style="
                    state.size === opt
                      ? {
                          background: state.primaryHex + '12',
                          boxShadow: `0 0 0 1.5px ${state.primaryHex}`,
                          color: state.primaryHex,
                        }
                      : {}
                  "
                  @click="state.size = opt"
                >
                  <span class="flex items-end gap-[1.5px]" style="height: 10px">
                    <span
                      class="w-0.5 rounded-[1px]"
                      :style="{
                        height:
                          opt === 'small'
                            ? '3px'
                            : opt === 'medium'
                              ? '5px'
                              : '7px',
                        backgroundColor: 'currentColor',
                        opacity: 0.6,
                      }"
                    />
                    <span
                      class="w-0.5 rounded-[1px]"
                      :style="{
                        height:
                          opt === 'small'
                            ? '6px'
                            : opt === 'medium'
                              ? '8px'
                              : '9px',
                        backgroundColor: 'currentColor',
                      }"
                    />
                    <span
                      class="w-0.5 rounded-[1px]"
                      :style="{
                        height:
                          opt === 'small'
                            ? '4px'
                            : opt === 'medium'
                              ? '6px'
                              : '8px',
                        backgroundColor: 'currentColor',
                        opacity: 0.75,
                      }"
                    />
                  </span>
                </button>
              </div>
            </section>

            <!-- divider -->
            <div class="h-px bg-border/40" />

            <!-- ── Surface (Dark) ── -->
            <section>
              <div class="flex items-center justify-between mb-1.5">
                <span
                  class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em]"
                  >Surface</span
                >
                <span
                  class="text-[8px] font-medium text-muted-foreground capitalize"
                  >{{ state.darkSurface }}</span
                >
              </div>
              <div class="grid grid-cols-3 gap-1">
                <button
                  v-for="opt in darkSurfaceSwatches"
                  :key="opt.key"
                  type="button"
                  class="flex flex-col gap-1 p-[5px] rounded-xl border overflow-hidden transition-all duration-100"
                  :class="
                    state.darkSurface === opt.key
                      ? 'border-transparent'
                      : 'border-border hover:border-foreground/15'
                  "
                  :style="
                    state.darkSurface === opt.key
                      ? { boxShadow: `0 0 0 1.5px ${state.primaryHex}` }
                      : {}
                  "
                  @click="selectDarkSurface(opt.key)"
                >
                  <div
                    class="w-full rounded-md ring-1 ring-inset ring-white/10 relative overflow-hidden"
                    :style="{ background: opt.bg, height: '26px' }"
                  >
                    <div class="absolute top-[4px] left-[4px] flex gap-[2px]">
                      <span class="size-[3.5px] rounded-full bg-white/30" />
                      <span class="size-[3.5px] rounded-full bg-white/18" />
                      <span class="size-[3.5px] rounded-full bg-white/10" />
                    </div>
                    <div
                      class="absolute bottom-[4px] left-[4px] right-[4px] flex flex-col gap-[2px]"
                    >
                      <span class="h-[1.5px] rounded-full bg-white/20 w-4/5" />
                      <span class="h-[1.5px] rounded-full bg-white/10 w-3/5" />
                    </div>
                  </div>
                  <span
                    class="text-[7.5px] font-semibold text-muted-foreground text-center leading-none truncate px-0.5"
                    >{{ opt.label }}</span
                  >
                </button>
              </div>
            </section>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between px-3 py-2 border-t border-border/40 shrink-0"
        >
          <div
            class="flex items-center gap-1.5 text-[8px] text-muted-foreground/60"
          >
            <span class="size-[5px] rounded-full bg-success animate-pulse" />
            Live preview
          </div>
          <button
            type="button"
            class="text-[8px] font-semibold text-muted-foreground/50 hover:text-foreground transition-colors"
            @click="reset"
          >
            Reset all
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
