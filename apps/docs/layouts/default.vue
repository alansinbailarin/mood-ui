<script setup lang="ts">
import { ref, provide, watch } from "vue";
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, GlobeAltIcon } from "@heroicons/vue/24/outline";
import { ModoProvider } from "mood-ui";
import { navManifest } from "~/utils/nav-manifest";
import { createDocToc, DOC_TOC_KEY } from "~/composables/useDocToc";

const route = useRoute();
const { locale, setLocale } = useI18n();

const mobileNavOpen = ref(false);
const cmdkOpen = ref(false);

const toc = createDocToc();
provide(DOC_TOC_KEY, toc);

// Clear the per-page TOC whenever route changes so stale items don't leak.
watch(
  () => route.path,
  () => {
    toc.clear();
    mobileNavOpen.value = false;
  },
);

function toggleLocale() {
  setLocale(locale.value === "es" ? "en" : "es");
}
</script>

<template>
  <ModoProvider>
    <div class="flex flex-col min-h-dvh bg-background text-foreground">
      <header class="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/85 border-b border-border">
        <AppHeader :show-burger="true" @burger="mobileNavOpen = true" @open-search="cmdkOpen = true" />
      </header>

      <div class="flex-1 max-w-9xl w-full mx-auto px-4 sm:px-6">
        <div class="flex gap-8 lg:gap-10">
          <!-- Mobile nav trigger (floating bottom-right) -->
          <button
            type="button"
            class="lg:hidden fixed bottom-5 right-5 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-opacity"
            aria-label="Open navigation"
            @click="mobileNavOpen = true"
          >
            <Bars3Icon class="w-5 h-5" />
          </button>

          <!-- Desktop sidebar -->
          <AppSidebar @open-search="cmdkOpen = true" />

          <!-- Mobile drawer -->
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
              <div class="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border">
                <span class="text-sm font-semibold text-foreground">Menu</span>
                <button
                  type="button"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  aria-label="Close navigation"
                  @click="mobileNavOpen = false"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>

              <div class="px-4 py-3 flex items-center gap-2 border-b border-border">
                <button
                  type="button"
                  class="flex-1 flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs"
                  @click="cmdkOpen = true; mobileNavOpen = false"
                >
                  <MagnifyingGlassIcon class="w-3.5 h-3.5 shrink-0" />
                  <span class="text-[12px]">Search…</span>
                  <kbd class="ml-auto font-mono font-semibold px-1.5 py-0.5 rounded border border-border bg-background text-[10px]">⌘K</kbd>
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium shrink-0"
                  @click="toggleLocale"
                >
                  <GlobeAltIcon class="w-3.5 h-3.5" />
                  {{ locale.toUpperCase() }}
                </button>
              </div>

              <nav class="flex-1 py-5 px-4 overflow-y-auto">
                <div
                  v-for="section in navManifest"
                  :key="section.id"
                  class="mb-7"
                >
                  <div class="text-[11px] uppercase tracking-[0.14em] font-bold text-foreground/90 mb-3">
                    {{ section.title }}
                  </div>
                  <ul class="flex flex-col gap-0.5">
                    <li v-for="item in section.entries" :key="item.id">
                      <NuxtLink
                        :to="item.route"
                        class="inline-flex items-center gap-2 py-1.5 text-sm transition-colors"
                        :class="
                          route.path === item.route
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                        "
                        @click="mobileNavOpen = false"
                      >
                        {{ item.label }}
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
            </aside>
          </Transition>

          <!-- Main content -->
          <main class="flex-1 min-w-0 py-8">
            <slot />
          </main>
        </div>
      </div>

      <!-- Command palette (Cmd+K) -->
      <ClientOnly>
        <AppCommandPalette v-model="cmdkOpen" />
      </ClientOnly>
    </div>
  </ModoProvider>
</template>
