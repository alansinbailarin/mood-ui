<script setup lang="ts">
/**
 * Center pill-tabs in the header: Docs · Components · Templates · Theme Studio.
 * Mirrors the legacy showroom HeaderNav with a sliding indicator. The active
 * tab is derived from `useRoute().path` against the navManifest categories so
 * we don't need a separate `activeId` prop.
 */
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { navManifest, COMPONENT_CATEGORY_IDS } from "~/utils/nav-manifest";

const { t } = useI18n();
const route = useRoute();

interface Tab {
  key: string;
  label: string;
  route: string;
  categoryIds: string[];
}

const tabs = computed<Tab[]>(() => {
  const findFirstRoute = (catId: string) =>
    navManifest.find((c) => c.id === catId)?.entries[0]?.route ?? "";

  const componentCats = navManifest.filter((c) =>
    (COMPONENT_CATEGORY_IDS as readonly string[]).includes(c.id),
  );
  const componentEntryRoute = componentCats[0]?.entries[0]?.route ?? "/forms/button";

  return (
    [
      {
        key: "docs",
        label: t("docs"),
        route: findFirstRoute("docs"),
        categoryIds: ["docs"],
      },
      {
        key: "components",
        label: t("components"),
        route: componentEntryRoute,
        categoryIds: componentCats.map((c) => c.id),
      },
      {
        key: "templates",
        label: t("templates"),
        route: findFirstRoute("templates"),
        categoryIds: ["templates"],
      },
      {
        key: "theme-studio",
        label: t("themeStudio"),
        route: findFirstRoute("theme-studio"),
        categoryIds: ["theme-studio"],
      },
    ] as Tab[]
  ).filter((tab) => tab.route);
});

const activeTabKey = computed(() => {
  for (const tab of tabs.value) {
    for (const catId of tab.categoryIds) {
      const cat = navManifest.find((c) => c.id === catId);
      if (cat?.entries.some((e) => e.route === route.path)) return tab.key;
    }
  }
  return null;
});

const trackEl = ref<HTMLElement | null>(null);
const tabRefs = ref<Record<string, HTMLElement>>({});
const indicatorStyle = ref<Record<string, string>>({ opacity: "0", left: "0", top: "0" });
let firstDone = false;

function setTabRef(key: string, el: unknown) {
  if (el) tabRefs.value[key] = el as HTMLElement;
}

function measure(animated: boolean) {
  const track = trackEl.value;
  const key = activeTabKey.value;
  const item = key ? tabRefs.value[key] : null;
  if (!track || !item) {
    indicatorStyle.value = { opacity: "0" };
    return;
  }
  indicatorStyle.value = {
    transform: `translate3d(${item.offsetLeft}px, ${item.offsetTop}px, 0)`,
    width: `${item.offsetWidth}px`,
    height: `${item.offsetHeight}px`,
    top: "0",
    left: "0",
    opacity: "1",
    transition: animated
      ? "transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1)"
      : "none",
  };
  firstDone = true;
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  requestAnimationFrame(() => requestAnimationFrame(() => measure(false)));
  if (typeof ResizeObserver !== "undefined" && trackEl.value) {
    ro = new ResizeObserver(() => measure(false));
    ro.observe(trackEl.value);
  }
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  ro?.disconnect();
  window.removeEventListener("resize", onResize);
});

function onResize() {
  measure(false);
}

watch([activeTabKey, () => tabs.value.length], () => {
  nextTick(() => measure(firstDone));
});
</script>

<template>
  <div
    ref="trackEl"
    role="tablist"
    :aria-label="t('components')"
    class="relative inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/30 p-0.5"
  >
    <span
      class="absolute pointer-events-none rounded-full bg-card shadow-sm border border-border/60"
      :style="indicatorStyle"
    />
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.key"
      :ref="(el: unknown) => setTabRef(tab.key, el)"
      :to="tab.route"
      role="tab"
      :aria-selected="activeTabKey === tab.key"
      class="relative z-10 inline-flex items-center justify-center h-7 px-3 rounded-full text-xs font-medium transition-colors duration-150 no-underline"
      :class="
        activeTabKey === tab.key
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      "
    >
      {{ tab.label }}
    </NuxtLink>
  </div>
</template>
