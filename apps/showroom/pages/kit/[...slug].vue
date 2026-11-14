<script setup lang="ts">
/**
 * One page of the Kit docs. The slug picks a kit doc (copied by
 * `pnpm kit:sync`) or a page the site writes (`content/kit-site/`); both go
 * through the same renderer. Everything is rendered at generate time.
 */
import { computed, inject, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Typography } from "mood-ui";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { DOC_TOC_KEY } from "~/composables/useDocToc";
import { canonicalPath, KIT_LANDING, routeForSlug } from "~/utils/kit-docs";
import { renderKitMarkdown } from "~/utils/kit-markdown";
import { loadKitSource } from "~/utils/kit-content";
import { agentBlockFor } from "~/utils/kit-agents";
import { findKitPage, kitPageList, kitSteps } from "~/utils/kit-nav";

// A fresh component per page, so the table of contents and the scroll reset.
definePageMeta({ key: (route) => route.path });

const route = useRoute();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const site = useSiteConfig();

const slug = computed(() => {
  const p = route.params.slug;
  return Array.isArray(p) ? p.join("/") : (p ?? "");
});

if (!slug.value) {
  await navigateTo(localePath(KIT_LANDING), { redirectCode: 301 });
}

const page = findKitPage(slug.value);
if (!page && slug.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const localePrefix = locale.value === "es" ? "/es" : "";
const { data } = await useAsyncData(`kit:${locale.value}:${slug.value}`, async () => {
  if (!page) return null;
  const source = await loadKitSource(page);
  return renderKitMarkdown(source, {
    file: page.source === "kit" ? page.file : `site/${page.file}`,
    knownSlugs: new Set(kitPageList().map((p) => p.slug)),
    localePrefix,
  });
});

const block = page ? agentBlockFor(page.slug) : null;
const comingSoon = page?.slug === "modules";

// ── SEO ──────────────────────────────────────────────────────────────────────
const metaTitle = `${page?.title ?? ""} · Mood Kit docs`;
const description = page?.description ?? "";
const canonical = site.url + canonicalPath(route.path);
useSeoMeta({
  title: metaTitle,
  description,
  ogTitle: `${metaTitle} · mood-ui`,
  ogDescription: description,
  twitterTitle: `${metaTitle} · mood-ui`,
  twitterDescription: description,
  // Pages that only announce something are not worth indexing yet.
  robots: comingSoon ? "noindex, follow" : undefined,
});
// Spanish shows the same English text, so its canonical is the English page.
useHead({ link: [{ rel: "canonical", href: canonical }] });
defineOgImage("Default", {
  title: page?.title ?? "Mood Kit",
  description,
  category: "Mood Kit docs",
});
useSchemaOrg([
  defineArticle({
    "@type": "TechArticle",
    headline: metaTitle,
    description,
    inLanguage: "en",
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: "mood-ui", item: site.url + "/" },
      { name: "Mood Kit", item: site.url + KIT_LANDING },
      { name: page?.title ?? "", item: canonical },
    ],
  }),
]);

// ── Prev / next ──────────────────────────────────────────────────────────────
const steps = kitSteps();
const idx = steps.findIndex((s) => s.route === routeForSlug(slug.value));
const prev = idx > 0 ? steps[idx - 1] : null;
const next = idx !== -1 && idx < steps.length - 1 ? steps[idx + 1] : null;

// ── Table of contents ────────────────────────────────────────────────────────
const toc = inject(DOC_TOC_KEY, null);
function registerToc() {
  if (!toc || !data.value) return;
  let parent: string | undefined;
  for (const h of data.value.headings) {
    if (h.level === 2) {
      parent = h.id;
      toc.register({ id: h.id, label: h.text, level: 1 });
    } else {
      toc.register({ id: h.id, label: h.text, level: 2, parentId: parent });
    }
  }
  if (block) toc.register({ id: "let-an-agent-do-it", label: t("kit.agent.title"), level: 1 });
}
onMounted(registerToc);
watch(locale, registerToc);

// In-doc links are plain anchors in the HTML (so crawlers follow them); in the
// browser they go through the router so the page does not reload.
const router = useRouter();
function onBodyClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-kit-link]");
  if (!a) return;
  e.preventDefault();
  router.push(a.getAttribute("href") ?? "/");
}
</script>

<template>
  <article v-if="page" class="flex flex-col gap-6 min-w-0">
    <header class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("kit.docsLabel") }}
      </Typography>
      <Typography variant="display" size="medium" as="h1" weight="medium" class="tracking-tight leading-[1.05]">
        {{ page.title }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ page.description }}
      </Typography>
    </header>

    <p v-if="locale === 'es'" class="kit-lang-note" role="note">
      {{ t("kit.englishOnly") }}
    </p>

    <div v-if="data" class="kit-prose" @click="onBodyClick" v-html="data.html" />

    <KitAgentBlock v-if="block" :block="block" />

    <footer class="flex flex-col gap-8 pt-4 border-t border-border">
      <div class="flex items-stretch gap-4">
        <NuxtLinkLocale
          v-if="prev"
          :to="prev.route"
          class="group flex-1 flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left hover:bg-muted/40 hover:border-primary/30 transition-all no-underline"
        >
          <ChevronLeftIcon class="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          <span class="flex flex-col gap-0.5 min-w-0">
            <span class="text-[11px] text-muted-foreground uppercase tracking-wide">{{ t("doc.prev") }}</span>
            <span class="text-sm font-medium text-foreground truncate">{{ prev.label }}</span>
          </span>
        </NuxtLinkLocale>
        <div v-else class="flex-1" />
        <NuxtLinkLocale
          v-if="next"
          :to="next.route"
          class="group flex-1 flex items-center justify-end gap-3 rounded-xl border border-border px-4 py-3 text-right hover:bg-muted/40 hover:border-primary/30 transition-all no-underline"
        >
          <span class="flex flex-col gap-0.5 min-w-0">
            <span class="text-[11px] text-muted-foreground uppercase tracking-wide">{{ t("doc.next") }}</span>
            <span class="text-sm font-medium text-foreground truncate">{{ next.label }}</span>
          </span>
          <ChevronRightIcon class="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </NuxtLinkLocale>
        <div v-else class="flex-1" />
      </div>
    </footer>
  </article>
</template>
