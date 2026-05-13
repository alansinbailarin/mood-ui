<script setup lang="ts">
import { computed, inject, onMounted, watch } from "vue";
import {
  MagnifyingGlassIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ShareIcon,
  ChartBarIcon,
  CommandLineIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { Banner, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";

import CodePreview from "~/components/CodePreview.vue";
import { vReveal } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const { t, locale } = useI18n();

useSeoMeta({
  title: () => t("pages.docs.seo.title"),
  description: () => t("pages.docs.seo.description"),
  ogTitle: () => `${t("pages.docs.seo.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.seo.description"),
});
useHead({
  link: [{ rel: "canonical", href: "https://mood-ui.com/docs/seo" }],
});

const toc = inject(DOC_TOC_KEY, null);
function registerToc() {
  if (!toc) return;
  toc.register({ id: "why-ssg", label: t("pages.docs.seo.step1Title"), level: 1 });
  toc.register({ id: "meta-tags", label: t("pages.docs.seo.step2Title"), level: 1 });
  toc.register({ id: "sitemap", label: t("pages.docs.seo.step3Title"), level: 1 });
  toc.register({ id: "robots", label: t("pages.docs.seo.step4Title"), level: 1 });
  toc.register({ id: "structured-data", label: t("pages.docs.seo.step5Title"), level: 1 });
  toc.register({ id: "social", label: t("pages.docs.seo.step6Title"), level: 1 });
  toc.register({ id: "checklist", label: t("pages.docs.seo.checklistTitle"), level: 1 });
  toc.register({ id: "tools", label: t("pages.docs.seo.toolsTitle"), level: 1 });
}
onMounted(registerToc);
watch(locale, registerToc);

const seoMetaExample = `<!-- pages/products/[slug].vue -->
<script setup lang="ts">
const product = await useFetch(\`/api/products/\${route.params.slug}\`)

useSeoMeta({
  title: product.value.name,
  description: product.value.shortDescription,
  ogTitle: \`\${product.value.name} | Acme Store\`,
  ogDescription: product.value.shortDescription,
  ogImage: product.value.heroImage,
  ogUrl: \`https://acme.com/products/\${product.value.slug}\`,
  ogType: 'product',
  twitterCard: 'summary_large_image',
  twitterTitle: product.value.name,
  twitterDescription: product.value.shortDescription,
  twitterImage: product.value.heroImage,
})

useHead({
  link: [{
    rel: 'canonical',
    href: \`https://acme.com/products/\${product.value.slug}\`,
  }],
})
<\/script>`;

const sitemapModule = `// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: {
    url: 'https://your-site.com',
    name: 'Your Site Name',
  },
  sitemap: {
    autoLastmod: true,
    // For dynamic pages, fetch them once at build time:
    sources: ['/api/__sitemap__/urls'],
  },
})

// server/api/__sitemap__/urls.ts
export default defineSitemapEventHandler(async () => {
  const products = await $fetch('https://api.acme.com/products')
  return products.map((p) => ({
    loc: \`/products/\${p.slug}\`,
    lastmod: p.updatedAt,
    changefreq: 'weekly',
    priority: 0.8,
  }))
})`;

const robotsTxt = `# public/robots.txt
User-agent: *
Allow: /

# Block private/admin routes
Disallow: /admin
Disallow: /api/

Sitemap: https://your-site.com/sitemap.xml`;

const jsonLdExample = `<script setup lang="ts">
const article = await useFetch(\`/api/articles/\${slug}\`)

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.value.title,
      datePublished: article.value.publishedAt,
      dateModified: article.value.updatedAt,
      author: {
        '@type': 'Person',
        name: article.value.author.name,
      },
      image: article.value.heroImage,
      description: article.value.excerpt,
    }),
  }],
})
<\/script>`;

const ogImageGen = `// server/api/og/[slug].png.ts
// Generate Open Graph images on-the-fly (1200x630)
import { Resvg } from '@resvg/resvg-js'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const article = await getArticle(slug)

  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#fff"/>
    <text x="60" y="120" font-size="64" font-weight="bold">
      \${article.title}
    </text>
    <text x="60" y="200" font-size="32" fill="#666">
      \${article.excerpt}
    </text>
  </svg>\`

  const png = new Resvg(svg).render().asPng()
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return png
})`;

const pillars = computed(() => [
  {
    icon: GlobeAltIcon,
    title: t("pages.docs.seo.pillars.ssgTitle"),
    text: t("pages.docs.seo.pillars.ssgText"),
  },
  {
    icon: DocumentTextIcon,
    title: t("pages.docs.seo.pillars.metaTitle"),
    text: t("pages.docs.seo.pillars.metaText"),
  },
  {
    icon: ShareIcon,
    title: t("pages.docs.seo.pillars.ogTitle"),
    text: t("pages.docs.seo.pillars.ogText"),
  },
  {
    icon: ChartBarIcon,
    title: t("pages.docs.seo.pillars.structuredTitle"),
    text: t("pages.docs.seo.pillars.structuredText"),
  },
]);

const checklist = computed(() => [
  t("pages.docs.seo.checklist.item1"),
  t("pages.docs.seo.checklist.item2"),
  t("pages.docs.seo.checklist.item3"),
  t("pages.docs.seo.checklist.item4"),
  t("pages.docs.seo.checklist.item5"),
  t("pages.docs.seo.checklist.item6"),
  t("pages.docs.seo.checklist.item7"),
  t("pages.docs.seo.checklist.item8"),
  t("pages.docs.seo.checklist.item9"),
  t("pages.docs.seo.checklist.item10"),
]);

const tools = computed(() => [
  {
    name: "Google Search Console",
    url: "https://search.google.com/search-console",
    desc: t("pages.docs.seo.tools.gsc"),
  },
  {
    name: "Lighthouse",
    url: "https://developer.chrome.com/docs/lighthouse",
    desc: t("pages.docs.seo.tools.lighthouse"),
  },
  {
    name: "Schema Validator",
    url: "https://validator.schema.org/",
    desc: t("pages.docs.seo.tools.schema"),
  },
  {
    name: "Rich Results Test",
    url: "https://search.google.com/test/rich-results",
    desc: t("pages.docs.seo.tools.rich"),
  },
  {
    name: "PageSpeed Insights",
    url: "https://pagespeed.web.dev/",
    desc: t("pages.docs.seo.tools.pagespeed"),
  },
]);
</script>

<template>
  <article class="flex flex-col gap-12 pb-12">
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.seo.kicker") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.seo.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.seo.subtitle") }}
      </Typography>
    </header>

    <!-- Pillars -->
    <section v-reveal class="grid sm:grid-cols-2 gap-4 not-prose">
      <Card
        v-for="p in pillars"
        :key="p.title"
        variant="outlined"
        padding="large"
      >
        <Stack direction="column" spacing="small">
          <div
            class="size-9 rounded-xl grid place-items-center bg-primary/10 text-primary"
          >
            <component :is="p.icon" class="size-5" />
          </div>
          <Typography variant="title" size="small" as="h3">{{
            p.title
          }}</Typography>
          <Typography variant="body" size="small" color="muted">{{
            p.text
          }}</Typography>
        </Stack>
      </Card>
    </section>

    <!-- Steps -->
    <ol
      v-reveal
      class="relative flex flex-col gap-10 pl-8 border-l border-border ml-3"
    >
      <li id="why-ssg" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >1</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.seo.step1Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.seo.step1Desc") }}
        </Typography>
      </li>

      <li id="meta-tags" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >2</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.seo.step2Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.seo.step2Desc") }}
        </Typography>
        <CodePreview :code="seoMetaExample" lang="vue" code-only />
      </li>

      <li id="sitemap" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >3</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.seo.step3Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.seo.step3Desc") }}
        </Typography>
        <CodePreview :code="sitemapModule" lang="typescript" code-only />
      </li>

      <li id="robots" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >4</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.seo.step4Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.seo.step4Desc") }}
        </Typography>
        <CodePreview :code="robotsTxt" lang="bash" code-only />
      </li>

      <li id="structured-data" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >5</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.seo.step5Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.seo.step5Desc") }}
        </Typography>
        <CodePreview :code="jsonLdExample" lang="vue" code-only />
        <Banner color="info" variant="subtle">
          <strong>{{ t("pages.docs.seo.tip") }}:</strong>
          {{ t("pages.docs.seo.step5Tip") }}
        </Banner>
      </li>

      <li id="social" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >6</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.seo.step6Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.seo.step6Desc") }}
        </Typography>
        <CodePreview :code="ogImageGen" lang="typescript" code-only />
      </li>
    </ol>

    <!-- Checklist -->
    <section id="checklist" v-reveal class="flex flex-col gap-4 not-prose">
      <div class="flex items-center gap-2">
        <CheckCircleIcon class="size-5 text-success" />
        <Typography variant="heading" size="large" weight="medium" class="!m-0">
          {{ t("pages.docs.seo.checklistTitle") }}
        </Typography>
      </div>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.seo.checklistIntro") }}
      </Typography>
      <Card variant="outlined" padding="large">
        <ul class="space-y-2.5">
          <li
            v-for="(item, i) in checklist"
            :key="i"
            class="flex items-start gap-2 text-sm"
          >
            <CheckCircleIcon
              class="size-4 text-success shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span>{{ item }}</span>
          </li>
        </ul>
      </Card>
    </section>

    <!-- Tools -->
    <section id="tools" v-reveal class="flex flex-col gap-4 not-prose">
      <div class="flex items-center gap-2">
        <CommandLineIcon class="size-5 text-primary" />
        <Typography variant="heading" size="large" weight="medium" class="!m-0">
          {{ t("pages.docs.seo.toolsTitle") }}
        </Typography>
      </div>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.seo.toolsIntro") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-3">
        <a
          v-for="tool in tools"
          :key="tool.name"
          :href="tool.url"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-4 group cursor-pointer"
        >
          <div class="flex items-center gap-2 mb-1">
            <MagnifyingGlassIcon class="size-4 text-muted-foreground" />
            <Typography variant="title" size="small" weight="semibold">
              {{ tool.name }}
            </Typography>
          </div>
          <Typography variant="body" size="small" color="muted">
            {{ tool.desc }}
          </Typography>
        </a>
      </div>
    </section>

    <!-- Warnings -->
    <section v-reveal class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <ExclamationTriangleIcon class="size-5 text-warning" />
        <Typography variant="heading" size="large" weight="medium" class="!m-0">
          {{ t("pages.docs.seo.pitfallsTitle") }}
        </Typography>
      </div>
      <Card variant="outlined" padding="medium">
        <Typography variant="title" size="small" weight="semibold" class="!mb-1">
          {{ t("pages.docs.seo.pitfalls.clientOnlyTitle") }}
        </Typography>
        <Typography variant="body" size="small" color="muted">
          {{ t("pages.docs.seo.pitfalls.clientOnlyText") }}
        </Typography>
      </Card>
      <Card variant="outlined" padding="medium">
        <Typography variant="title" size="small" weight="semibold" class="!mb-1">
          {{ t("pages.docs.seo.pitfalls.duplicateTitle") }}
        </Typography>
        <Typography variant="body" size="small" color="muted">
          {{ t("pages.docs.seo.pitfalls.duplicateText") }}
        </Typography>
      </Card>
      <Card variant="outlined" padding="medium">
        <Typography variant="title" size="small" weight="semibold" class="!mb-1">
          {{ t("pages.docs.seo.pitfalls.lazyTitle") }}
        </Typography>
        <Typography variant="body" size="small" color="muted">
          {{ t("pages.docs.seo.pitfalls.lazyText") }}
        </Typography>
      </Card>
    </section>
  </article>
</template>
