<script setup lang="ts">
/**
 * Desktop docs sidebar — 220px column on the left of every component /
 * docs page. Hidden below the `lg` breakpoint; the mobile drawer lives
 * inline in `layouts/default.vue` because it needs to dismiss on link
 * click and share state with the burger trigger.
 */
import { computed } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import { navManifest } from "~/utils/nav-manifest";

defineEmits<{ "open-search": [] }>();

const route = useRoute();
const { t } = useI18n();

// Categories flagged `hiddenInSidebar` (Theme Studio at the moment) live
// only in the top pill nav — they're top-level shortcuts that already
// have a dedicated tab and don't need to take a slot in the left rail.
const sidebarSections = computed(() =>
  navManifest.filter((c) => !c.hiddenInSidebar),
);
</script>

<template>
  <div class="hidden lg:block w-[220px] shrink-0 border-r border-border">
    <aside
      class="sticky top-8 flex flex-col max-h-[calc(100dvh-4rem)] pr-4 pt-6"
      aria-label="Section navigation"
    >
      <div class="pb-4">
        <button
          type="button"
          class="w-full flex items-center gap-2 h-9 px-2.5 pr-2 rounded-full border border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors text-xs"
          :aria-label="`${t('search.label')} (⌘K)`"
          @click="$emit('open-search')"
        >
          <MagnifyingGlassIcon class="w-3.5 h-3.5" />
          <span class="text-[12px]">{{ t("search.label") }}…</span>
          <kbd
            class="ml-auto font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]"
            >⌘K</kbd
          >
        </button>
      </div>

      <div class="overflow-y-auto pb-4">
        <nav>
          <div v-for="section in sidebarSections" :key="section.id" class="mb-8">
            <div
              class="mb-3 text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground"
            >
              {{ section.title }}
            </div>
            <ul class="flex flex-col gap-0.5">
              <li v-for="item in section.entries" :key="item.id">
                <NuxtLink
                  :to="item.route"
                  class="docs-sidebar-link group relative inline-flex items-center gap-2 py-1 text-sm transition-colors"
                  :class="
                    route.path === item.route
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  "
                >
                  <span class="docs-sidebar-link__label relative">
                    {{ item.label }}
                    <span
                      class="docs-sidebar-link__underline pointer-events-none absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-200 ease-out"
                      :class="
                        route.path === item.route ? 'scale-x-100 bg-primary' : ''
                      "
                    />
                  </span>
                  <span
                    v-if="item.badge"
                    class="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {{ item.badge }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.docs-sidebar-link:hover .docs-sidebar-link__underline {
  transform: scaleX(1);
}
</style>
