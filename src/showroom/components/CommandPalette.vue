<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import {
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    ComputerDesktopIcon,
    SwatchIcon,
    GlobeAltIcon,
    ArrowTopRightOnSquareIcon,
    HomeIcon,
    BookOpenIcon,
    PaintBrushIcon,
    LanguageIcon,
    HashtagIcon,
} from '@heroicons/vue/24/outline';
import { showroomNav } from '../registry';
import { useShowroomRouter } from '../composables/useShowroomRouter';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [v: boolean];
    'theme': [t: 'light' | 'dark' | 'system'];
    'color': [hex: string];
    'locale': [l: 'es' | 'en'];
}>();

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
});

const { go } = useShowroomRouter();

const query = ref('');
const activeIndex = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);
const listEl = ref<HTMLElement | null>(null);

// ── Items ─────────────────────────────────────────────────────────────────────
type CmdItem = {
    id: string;
    label: string;
    group: string;
    icon: any;
    keywords?: string;
    shortcut?: string[];
    run: () => void;
};

const componentItems = computed<CmdItem[]>(() =>
    showroomNav.flatMap((cat) =>
        cat.entries.map((e) => ({
            id: `nav:${e.id}`,
            label: e.label,
            group: cat.title,
            icon: HashtagIcon,
            keywords: cat.title,
            run: () => {
                go(e.id);
                close();
            },
        })),
    ),
);

const docItems: CmdItem[] = [
    { id: 'doc:welcome',      label: 'Welcome',       group: 'Docs', icon: HomeIcon,     run: () => { go('welcome'); close(); } },
    { id: 'doc:installation', label: 'Installation',  group: 'Docs', icon: BookOpenIcon, run: () => { go('installation'); close(); } },
    { id: 'doc:theming',      label: 'Theming',       group: 'Docs', icon: PaintBrushIcon, run: () => { go('theming'); close(); } },
    { id: 'doc:i18n',         label: 'i18n',          group: 'Docs', icon: LanguageIcon, run: () => { go('i18n'); close(); } },
];

const actionItems = computed<CmdItem[]>(() => [
    { id: 'theme:light',  label: 'Tema: Claro',   group: 'Acciones', icon: SunIcon,             keywords: 'light claro mode',  run: () => { emit('theme', 'light');  close(); } },
    { id: 'theme:dark',   label: 'Tema: Oscuro',  group: 'Acciones', icon: MoonIcon,            keywords: 'dark oscuro night', run: () => { emit('theme', 'dark');   close(); } },
    { id: 'theme:system', label: 'Tema: Sistema', group: 'Acciones', icon: ComputerDesktopIcon, keywords: 'system auto',       run: () => { emit('theme', 'system'); close(); } },
    { id: 'locale:es',    label: 'Idioma: Español', group: 'Acciones', icon: GlobeAltIcon,      keywords: 'spanish español',  run: () => { emit('locale', 'es');    close(); } },
    { id: 'locale:en',    label: 'Idioma: English', group: 'Acciones', icon: GlobeAltIcon,      keywords: 'english ingles',   run: () => { emit('locale', 'en');    close(); } },
    { id: 'color:indigo', label: 'Color: Indigo', group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#6366f1'); close(); } },
    { id: 'color:violet', label: 'Color: Violet', group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#8b5cf6'); close(); } },
    { id: 'color:pink',   label: 'Color: Pink',   group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#ec4899'); close(); } },
    { id: 'color:rose',   label: 'Color: Rose',   group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#ef4444'); close(); } },
    { id: 'color:amber',  label: 'Color: Amber',  group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#f59e0b'); close(); } },
    { id: 'color:emerald',label: 'Color: Emerald',group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#10b981'); close(); } },
    { id: 'color:sky',    label: 'Color: Sky',    group: 'Acciones', icon: SwatchIcon, keywords: 'primary brand', run: () => { emit('color', '#0ea5e9'); close(); } },
    {
        id: 'link:github',
        label: 'Abrir GitHub',
        group: 'Enlaces',
        icon: ArrowTopRightOnSquareIcon,
        run: () => { window.open('https://github.com/alansinbailarin/mood-ui', '_blank'); close(); },
    },
    {
        id: 'link:npm',
        label: 'Abrir npm',
        group: 'Enlaces',
        icon: ArrowTopRightOnSquareIcon,
        run: () => { window.open('https://www.npmjs.com/package/mood-ui', '_blank'); close(); },
    },
]);

const allItems = computed<CmdItem[]>(() => [
    ...docItems,
    ...componentItems.value,
    ...actionItems.value,
]);

const filtered = computed<CmdItem[]>(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return allItems.value;
    return allItems.value.filter((it) =>
        it.label.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q) ||
        (it.keywords?.toLowerCase().includes(q) ?? false),
    );
});

// Group items for display
const groupedItems = computed(() => {
    const map = new Map<string, CmdItem[]>();
    for (const it of filtered.value) {
        if (!map.has(it.group)) map.set(it.group, []);
        map.get(it.group)!.push(it);
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
});

// ── Keyboard handling ────────────────────────────────────────────────────────
function close() {
    open.value = false;
    query.value = '';
    activeIndex.value = 0;
}

function onKeydown(e: KeyboardEvent) {
    // Toggle on ⌘K / Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open.value = !open.value;
        return;
    }
    if (!open.value) return;

    if (e.key === 'Escape') {
        e.preventDefault();
        close();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
        scrollIntoView();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
        scrollIntoView();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered.value[activeIndex.value];
        if (item) item.run();
    }
}

function scrollIntoView() {
    nextTick(() => {
        const el = listEl.value?.querySelector(`[data-cmd-index="${activeIndex.value}"]`);
        (el as HTMLElement | null)?.scrollIntoView({ block: 'nearest' });
    });
}

watch(query, () => { activeIndex.value = 0; });
watch(open, async (v) => {
    if (v) {
        await nextTick();
        inputEl.value?.focus();
    }
});

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// Index helper for flat list (with grouping)
function flatIndex(group: string, idxInGroup: number): number {
    let i = 0;
    for (const g of groupedItems.value) {
        if (g.group === group) return i + idxInGroup;
        i += g.items.length;
    }
    return -1;
}
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-150"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="open"
                class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                @click="close"
            />
        </Transition>

        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="open"
                role="dialog"
                aria-modal="true"
                aria-label="Búsqueda rápida"
                class="fixed left-1/2 top-[15vh] -translate-x-1/2 z-[101] w-[min(640px,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5 overflow-hidden"
                @click.stop
            >
                <!-- Search input -->
                <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <MagnifyingGlassIcon class="size-5 text-muted-foreground shrink-0" />
                    <input
                        ref="inputEl"
                        v-model="query"
                        type="text"
                        placeholder="Buscar componentes, acciones, docs…"
                        class="flex-1 bg-transparent border-0 outline-none text-base text-foreground placeholder:text-muted-foreground"
                    />
                    <kbd class="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                        ESC
                    </kbd>
                </div>

                <!-- Results -->
                <div ref="listEl" class="max-h-[50vh] overflow-y-auto py-2">
                    <div
                        v-if="filtered.length === 0"
                        class="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                        Sin resultados para "{{ query }}"
                    </div>

                    <div
                        v-for="g in groupedItems"
                        :key="g.group"
                        class="mb-1"
                    >
                        <div class="px-4 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                            {{ g.group }}
                        </div>
                        <button
                            v-for="(item, idx) in g.items"
                            :key="item.id"
                            :data-cmd-index="flatIndex(g.group, idx)"
                            type="button"
                            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors"
                            :class="flatIndex(g.group, idx) === activeIndex ? 'bg-primary/10 text-foreground' : 'text-foreground/90 hover:bg-muted/40'"
                            @mouseenter="activeIndex = flatIndex(g.group, idx)"
                            @click="item.run()"
                        >
                            <component :is="item.icon" class="size-4 text-muted-foreground shrink-0" />
                            <span class="flex-1">{{ item.label }}</span>
                            <span
                                v-if="flatIndex(g.group, idx) === activeIndex"
                                class="text-[10px] font-mono text-muted-foreground"
                            >
                                ↵
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between gap-3 px-4 py-2 border-t border-border bg-muted/20 text-[11px] text-muted-foreground">
                    <div class="flex items-center gap-3">
                        <span class="inline-flex items-center gap-1">
                            <kbd class="font-mono font-semibold px-1 rounded border border-border bg-card">↑</kbd>
                            <kbd class="font-mono font-semibold px-1 rounded border border-border bg-card">↓</kbd>
                            navegar
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <kbd class="font-mono font-semibold px-1 rounded border border-border bg-card">↵</kbd>
                            seleccionar
                        </span>
                    </div>
                    <span>mood-ui</span>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
