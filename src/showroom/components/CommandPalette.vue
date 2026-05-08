<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    GlobeAltIcon,
    ArrowTopRightOnSquareIcon,
    HomeIcon,
    BookOpenIcon,
    PaintBrushIcon,
    LanguageIcon,
    HashtagIcon,
    MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';
import Modal from '../../components/feedback/Modal.vue';
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

const { t } = useI18n();

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
    description?: string;
    group: string;
    icon: any;
    keywords?: string;
    shortcut?: string[];
    run: () => void;
};

// Brand color swatches — available via command palette actions only (no inline grid)
type ColorSwatch = { id: string; label: string; hex: string };
const brandColors: ColorSwatch[] = [
    { id: 'c:indigo',  label: 'Indigo',  hex: '#6366f1' },
    { id: 'c:violet',  label: 'Violet',  hex: '#8b5cf6' },
    { id: 'c:pink',    label: 'Pink',    hex: '#ec4899' },
    { id: 'c:rose',    label: 'Rose',    hex: '#ef4444' },
    { id: 'c:amber',   label: 'Amber',   hex: '#f59e0b' },
    { id: 'c:emerald', label: 'Emerald', hex: '#10b981' },
    { id: 'c:sky',     label: 'Sky',     hex: '#0ea5e9' },
];
void brandColors; // kept for future use

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

const docItems = computed<CmdItem[]>(() => [
    { id: 'doc:welcome',      label: t('home'),                  description: t('search.descWelcome'),      group: t('search.groupDocs'), icon: HomeIcon,       run: () => { go('welcome'); close(); } },
    { id: 'doc:introduction', label: t('docsNav.introduction'),  description: t('search.descIntroduction'), group: t('search.groupDocs'), icon: BookOpenIcon,   run: () => { go('introduction'); close(); } },
    { id: 'doc:installation', label: t('docsNav.installation'),  description: t('search.descInstallation'), group: t('search.groupDocs'), icon: BookOpenIcon,   run: () => { go('installation'); close(); } },
    { id: 'doc:theming',      label: t('docsNav.theming'),       description: t('search.descTheming'),      group: t('search.groupDocs'), icon: PaintBrushIcon, run: () => { go('theming'); close(); } },
    { id: 'doc:i18n',         label: t('docsNav.i18n'),          description: t('search.descI18n'),         group: t('search.groupDocs'), icon: LanguageIcon,   run: () => { go('i18n'); close(); } },
    { id: 'doc:changelog',    label: t('docsNav.changelog'),     description: t('search.descChangelog'),    group: t('search.groupDocs'), icon: BookOpenIcon,   run: () => { go('changelog'); close(); } },
]);

const actionItems = computed<CmdItem[]>(() => [
    {
        id: 'locale:es',
        label: 'Español',
        description: t('search.actionLanguageEsDesc'),
        group: t('search.groupActions'),
        icon: GlobeAltIcon,
        keywords: 'spanish español idioma',
        run: () => { emit('locale', 'es'); close(); }
    },
    {
        id: 'locale:en',
        label: 'English',
        description: t('search.actionLanguageEnDesc'),
        group: t('search.groupActions'),
        icon: GlobeAltIcon,
        keywords: 'english ingles language',
        run: () => { emit('locale', 'en'); close(); }
    },
    {
        id: 'link:github',
        label: 'GitHub',
        description: 'alansinbailarin/mood-ui',
        group: t('search.groupLinks'),
        icon: ArrowTopRightOnSquareIcon,
        run: () => { window.open('https://github.com/alansinbailarin/mood-ui', '_blank'); close(); },
    },
    {
        id: 'link:npm',
        label: 'npm',
        description: 'npmjs.com/package/mood-ui',
        group: t('search.groupLinks'),
        icon: ArrowTopRightOnSquareIcon,
        run: () => { window.open('https://www.npmjs.com/package/mood-ui', '_blank'); close(); },
    },
]);

const allItems = computed<CmdItem[]>(() => [
    ...docItems.value,
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

    if (e.key === 'ArrowDown') {
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
    } else {
        query.value = '';
        activeIndex.value = 0;
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
    <Modal
        v-model="open"
        size="large"
        position="top"
        :show-close="false"
        :inner-border="false"
        overlay="glass"
        :aria-label="t('search.label')"
    >
        <!-- Full-bleed wrapper that cancels the Modal body padding -->
        <div class="-mx-6 -my-6">
            <!-- Search input: full-bleed native -->
            <div class="flex items-center gap-3 px-4 border-b border-border">
                <MagnifyingGlassIcon class="size-4 text-muted-foreground shrink-0" />
                <input
                    ref="inputEl"
                    v-model="query"
                    type="text"
                    :placeholder="t('search.placeholder')"
                    autocomplete="off"
                    spellcheck="false"
                    style="outline: none !important; box-shadow: none !important;"
                    class="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted-foreground [&:focus]:outline-none [&:focus-visible]:outline-none [&::-webkit-search-cancel-button]:hidden"
                    @keydown.stop
                />
            </div>

            <!-- Results -->
            <div ref="listEl" class="max-h-[50vh] overflow-y-auto py-1.5">
                <div
                    v-if="filtered.length === 0"
                    class="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                    {{ t('search.empty', { q: query }) }}
                </div>

                <!-- Regular grouped items -->
                <div
                    v-for="g in groupedItems"
                    :key="g.group"
                    class="mb-0.5"
                >
                    <div class="px-4 py-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                        {{ g.group }}
                    </div>
                    <button
                        v-for="(item, idx) in g.items"
                        :key="item.id"
                        :data-cmd-index="flatIndex(g.group, idx)"
                        type="button"
                        class="w-full flex items-center gap-2.5 px-4 py-1.5 text-sm text-left transition-colors"
                        :class="flatIndex(g.group, idx) === activeIndex ? 'bg-primary/10 text-foreground' : 'text-foreground/90 hover:bg-muted/40'"
                        @mouseenter="activeIndex = flatIndex(g.group, idx)"
                        @click="item.run()"
                    >
                        <component :is="item.icon" class="size-3.5 text-muted-foreground shrink-0" />
                        <span class="flex-1 min-w-0">
                            <span class="block text-sm truncate">{{ item.label }}</span>
                            <span v-if="item.description" class="block text-xs text-muted-foreground truncate">{{ item.description }}</span>
                        </span>
                        <span
                            v-if="flatIndex(g.group, idx) === activeIndex"
                            class="text-[10px] font-mono text-muted-foreground shrink-0"
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
                        {{ t('search.navigate') }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                        <kbd class="font-mono font-semibold px-1 rounded border border-border bg-card">↵</kbd>
                        {{ t('search.select') }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                        <kbd class="font-mono font-semibold px-1 rounded border border-border bg-card">ESC</kbd>
                        {{ t('search.esc') }}
                    </span>
                </div>
                <span>mood-ui</span>
            </div>
        </div>
    </Modal>
</template>
