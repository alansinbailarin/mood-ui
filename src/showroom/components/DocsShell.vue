<script setup lang="ts">
/**
 * ContentShell — universal layout for Docs, Components and Templates.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  Header (sticky, full-width, inner max-w-7xl)            │
 *   ├──────────────────────────────────────────────────────────┤
 *   │  ┌────────────────  max-w-7xl mx-auto  ────────────────┐ │
 *   │  │  Aside (links)  │  Main content                    │ │
 *   │  └─────────────────────────────────────────────────────┘ │
 *   └──────────────────────────────────────────────────────────┘
 *
 * The body uses the SAME centered container as the header so left/right
 * edges align with the brand logo and the action cluster.
 *
 * The aside renders link-style entries (NOT buttons): plain text with
 * a hover underline that slides in from the bottom. Categories are
 * spaced generously and use a heavier kicker style to stand apart.
 */
import { ref, provide, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
} from "@heroicons/vue/24/outline";
import Typography from "../../components/data-display/Typography.vue";
import DocToc from "./DocToc.vue";
import { createDocToc, DOC_TOC_KEY } from "../composables/useDocToc";
import type { ShowroomLocale } from "../i18n";

export interface NavItem {
  id: string;
  label: string;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const props = defineProps<{
  navSections: NavSection[];
  activeId: string;
  locale?: ShowroomLocale;
}>();

const emit = defineEmits<{
  navigate: [id: string];
  "open-search": [];
  "update:locale": [v: ShowroomLocale];
}>();

const mobileNavOpen = ref(false);
const { t } = useI18n();

// ── TOC (provided to all descendant pages) ───────────────────────────────────
const toc = createDocToc();
provide(DOC_TOC_KEY, toc);

// Clear TOC items whenever navigation changes so stale items from the
// previous page don't bleed into the next one.
watch(
  () => props.activeId,
  () => toc.clear(),
);

function navigate(id: string) {
  emit("navigate", id);
  mobileNavOpen.value = false;
}
</script>

<template>
  <div class="flex flex-col min-h-dvh bg-background text-foreground">
    <!-- ── Sticky full-width header ───────────────────────────────── -->
    <header
      class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border"
    >
      <slot name="header" />
    </header>

    <!-- ── Body: nav + content sharing the header's container ────── -->
    <div class="flex-1 max-w-9xl w-full mx-auto px-4 sm:px-6">
      <div class="flex gap-8 lg:gap-10">
        <!-- Mobile nav trigger (rendered outside the aside) -->
        <button
          v-if="navSections.length"
          type="button"
          class="lg:hidden fixed bottom-5 right-5 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Open navigation"
          @click="mobileNavOpen = true"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>

        <!-- Desktop aside: full-height column with sticky inner nav -->
        <div
          v-if="navSections.length"
          class="hidden lg:block w-[220px] shrink-0 border-r border-border"
        >
          <aside
            class="sticky top-8 flex flex-col max-h-[calc(100dvh-4rem)] pr-4 pt-6"
            aria-label="Section navigation"
          >
            <!-- Search button at top (not scrollable) -->
            <div class="pb-4">
              <button
                type="button"
                class="w-full flex items-center gap-2 h-9 px-2.5 pr-2 rounded-full border border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors text-xs"
                :aria-label="`${t('search.label')} (⌘K)`"
                @click="emit('open-search')"
              >
                <MagnifyingGlassIcon class="w-3.5 h-3.5" />
                <span class="text-[12px]">{{ t("search.label") }}…</span>
                <kbd
                  class="ml-auto font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]"
                  >⌘K</kbd
                >
              </button>
            </div>

            <!-- Scrollable nav section -->
            <div class="overflow-y-auto pb-4">
              <nav>
                <div
                  v-for="(section, sIdx) in navSections"
                  :key="section.title"
                  :class="sIdx === 0 ? 'mb-8' : 'mb-8'"
                >
                  <div class="mb-3">
                    <Typography variant="overline" size="small" color="muted">
                      {{ section.title }}
                    </Typography>
                  </div>
                  <ul class="flex flex-col gap-0.5">
                    <li v-for="item in section.items" :key="item.id">
                      <a
                        href="#"
                        class="content-shell-link group relative inline-flex items-center gap-2 py-1 text-sm transition-colors"
                        :class="
                          props.activeId === item.id
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        "
                        @click.prevent="navigate(item.id)"
                      >
                        <span class="content-shell-link__label relative">
                          {{ item.label }}
                          <span
                            class="content-shell-link__underline pointer-events-none absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-200 ease-out"
                            :class="
                              props.activeId === item.id
                                ? 'scale-x-100 bg-primary'
                                : ''
                            "
                          />
                        </span>
                        <span
                          v-if="item.badge"
                          class="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {{ item.badge }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </aside>
        </div>

        <!-- Mobile nav drawer -->
        <Transition
          enter-active-class="transition-opacity duration-150 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-100 ease-in"
          leave-to-class="opacity-0"
        >
          <div
            v-if="mobileNavOpen"
            class="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
            @click="mobileNavOpen = false"
          />
        </Transition>
        <Transition
          enter-active-class="transition-transform duration-200 ease-out"
          enter-from-class="-translate-x-full"
          leave-active-class="transition-transform duration-150 ease-in"
          leave-to-class="-translate-x-full"
        >
          <aside
            v-if="mobileNavOpen"
            class="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-card border-r border-border shadow-xl overflow-y-auto"
            aria-label="Section navigation"
          >
            <div
              class="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border"
            >
              <span class="text-sm font-semibold text-foreground">Menu</span>
              <button
                type="button"
                class="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                @click="mobileNavOpen = false"
                aria-label="Close navigation"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Search + language row -->
            <div
              class="px-4 py-3 flex items-center gap-2 border-b border-border"
            >
              <button
                type="button"
                class="flex-1 flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs"
                @click="
                  emit('open-search');
                  mobileNavOpen = false;
                "
              >
                <MagnifyingGlassIcon class="w-3.5 h-3.5 shrink-0" />
                <span class="text-[12px]">{{ t("search.label") }}…</span>
                <kbd
                  class="ml-auto font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]"
                  >⌘K</kbd
                >
              </button>
              <button
                v-if="locale !== undefined"
                type="button"
                class="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium shrink-0"
                @click="emit('update:locale', locale === 'es' ? 'en' : 'es')"
              >
                <GlobeAltIcon class="w-3.5 h-3.5" />
                {{ locale === "es" ? "ES" : "EN" }}
              </button>
            </div>

            <nav class="flex-1 py-5 px-4 overflow-y-auto">
              <div
                v-for="section in navSections"
                :key="section.title"
                class="mb-7"
              >
                <div
                  class="text-[11px] uppercase tracking-[0.14em] font-bold text-foreground/90 mb-3"
                >
                  {{ section.title }}
                </div>
                <ul class="flex flex-col gap-0.5">
                  <li v-for="item in section.items" :key="item.id">
                    <a
                      href="#"
                      class="inline-flex items-center gap-2 py-1.5 text-sm transition-colors"
                      :class="
                        props.activeId === item.id
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground'
                      "
                      @click.prevent="navigate(item.id)"
                    >
                      {{ item.label }}
                      <span
                        v-if="item.badge"
                        class="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {{ item.badge }}
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>
        </Transition>

        <!-- Main content. Keyed on activeId so Vue re-mounts the slot
             content on route changes, triggering the page-fade transition. -->
        <Transition
          enter-active-class="transition-opacity duration-200 ease-out"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-100 ease-in"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <main :key="activeId" class="flex-1 min-w-0 py-8">
            <slot />
          </main>
        </Transition>

        <!-- Right TOC column — shown on xl+ when there are items -->
        <DocToc :toc="toc" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hover underline that slides in from the left for inactive links. */
.content-shell-link:hover .content-shell-link__underline {
  transform: scaleX(1);
}
</style>
