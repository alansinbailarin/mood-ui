<script setup lang="ts">
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { navManifest } from "~/utils/nav-manifest";

const props = defineProps<{
  /** Override visibility (mobile drawer). When undefined the desktop styles apply. */
  open?: boolean;
}>();

const emit = defineEmits<{
  "open-search": [];
  close: [];
}>();

const route = useRoute();
</script>

<template>
  <div
    :class="props.open !== undefined ? 'lg:hidden' : 'hidden lg:block w-[220px] shrink-0 border-r border-border'"
  >
    <aside
      class="sticky top-8 flex flex-col max-h-[calc(100dvh-4rem)] pr-4 pt-6"
      aria-label="Section navigation"
    >
      <div class="pb-4">
        <button
          type="button"
          class="w-full flex items-center gap-2 h-9 px-2.5 pr-2 rounded-full border border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors text-xs"
          aria-label="Search (⌘K)"
          @click="emit('open-search')"
        >
          <MagnifyingGlassIcon class="w-3.5 h-3.5" />
          <span class="text-[12px]">Search…</span>
          <kbd
            class="ml-auto font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]"
            >⌘K</kbd
          >
        </button>
      </div>

      <div class="overflow-y-auto pb-4">
        <nav>
          <div
            v-for="section in navManifest"
            :key="section.id"
            class="mb-8"
          >
            <div class="mb-3 text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
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
                  @click="emit('close')"
                >
                  <span class="docs-sidebar-link__label relative">
                    {{ item.label }}
                    <span
                      class="docs-sidebar-link__underline pointer-events-none absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-200 ease-out"
                      :class="route.path === item.route ? 'scale-x-100 bg-primary' : ''"
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
