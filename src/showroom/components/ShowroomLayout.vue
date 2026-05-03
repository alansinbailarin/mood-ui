<script setup lang="ts">
/**
 * Minimal sidebar+main layout used only by the showroom.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────┐
 *   │ Sidebar    │  Topbar (search · theme · ⚙)   │
 *   │ (full     ├─────────────────────────────────│
 *   │  height)  │                                 │
 *   │           │   <slot> (page content)         │
 *   └─────────────────────────────────────────────┘
 *
 * The sidebar reaches the very top of the viewport (no topbar above it),
 * and the open/close trigger is exposed via `v-model:collapsed`.
 */
import { computed } from 'vue';

const props = defineProps<{
    collapsed?: boolean;
    mobileOpen?: boolean;
    sidebarWidth?: number;
    collapsedWidth?: number;
}>();

const emit = defineEmits<{
    'update:collapsed': [v: boolean];
    'update:mobileOpen': [v: boolean];
}>();

const expandedW = computed(() => props.sidebarWidth ?? 240);
const collapsedW = computed(() => props.collapsedWidth ?? 64);
const desktopWidth = computed(() => (props.collapsed ? collapsedW.value : expandedW.value));

function closeMobile() {
    emit('update:mobileOpen', false);
}
</script>

<template>
    <div class="modo-showroom-layout flex h-dvh w-full bg-background text-foreground overflow-hidden">
        <!-- ── DESKTOP SIDEBAR (full height, leftmost) ──────────────── -->
        <aside
            class="hidden lg:flex shrink-0 flex-col bg-card border-r border-border overflow-hidden transition-[width] duration-200 ease-out"
            :style="{ width: `${desktopWidth}px` }"
            aria-label="Navegación"
        >
            <slot name="sidebar" :collapsed="!!collapsed" :is-mobile="false" :close-mobile="closeMobile" />
        </aside>

        <!-- ── MOBILE SIDEBAR DRAWER ────────────────────────────────── -->
        <Transition
            enter-active-class="transition-opacity duration-150 ease-out"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-150 ease-in"
            leave-to-class="opacity-0"
        >
            <div
                v-if="mobileOpen"
                class="lg:hidden fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
                @click="closeMobile"
            />
        </Transition>
        <Transition
            enter-active-class="transition-transform duration-200 ease-out"
            enter-from-class="-translate-x-full"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-to-class="-translate-x-full"
        >
            <aside
                v-if="mobileOpen"
                class="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border w-[280px] shadow-xl"
                aria-label="Navegación"
            >
                <slot name="sidebar" :collapsed="false" :is-mobile="true" :close-mobile="closeMobile" />
            </aside>
        </Transition>

        <!-- ── MAIN COLUMN (topbar + content) ───────────────────────── -->
        <div class="flex flex-col flex-1 min-w-0">
            <header
                class="shrink-0 sticky top-0 z-20 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border"
            >
                <slot name="topbar" />
            </header>

            <main class="flex-1 min-h-0 overflow-y-auto">
                <slot />
            </main>
        </div>
    </div>
</template>
