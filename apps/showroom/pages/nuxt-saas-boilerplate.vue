<script setup lang="ts">
/**
 * Mood Kit's landing page. URL and keywords follow the kit SEO spec: the primary
 * keyword is "nuxt saas boilerplate"; "laravel nuxt saas starter kit" and
 * "multi-tenant saas boilerplate" sit in the copy. Structured data: a
 * SoftwareApplication with a placeholder Offer, FAQPage and a breadcrumb.
 */
import { Button, Card, Typography } from "mood-ui";
import { ArrowRightIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import {
  KIT_BUY_URL,
  KIT_FACT_IDS,
  KIT_FAQ_IDS,
  KIT_FEATURE_IDS,
  KIT_PRICE_USD,
  KIT_STACK_IDS,
} from "~/utils/kit-config";
import { KIT_LANDING, routeForSlug } from "~/utils/kit-docs";

const { t } = useI18n();
const localePath = useLocalePath();
const router = useRouter();
const site = useSiteConfig();

const title = t("kit.landing.seo.title");
const description = t("kit.landing.seo.description");
const ogTitle = t("kit.landing.seo.ogTitle");
const url = site.url + localePath(KIT_LANDING);

useSeoMeta({
  title,
  description,
  ogTitle,
  ogDescription: description,
  ogType: "website",
  twitterTitle: ogTitle,
  twitterDescription: description,
});
// The canonical is this locale's own URL; the alternates name both, and English as the default.
const switchLocalePath = useSwitchLocalePath();
const enUrl = site.url + switchLocalePath("en");
useHead({
  link: [
    { rel: "canonical", href: url },
    { rel: "alternate", hreflang: "en", href: enUrl },
    { rel: "alternate", hreflang: "es", href: site.url + switchLocalePath("es") },
    { rel: "alternate", hreflang: "x-default", href: enUrl },
  ],
});
defineOgImage("Default", { title: ogTitle, description, category: "Mood Kit" });

const faq = KIT_FAQ_IDS.map((id) => ({
  id,
  q: t(`kit.landing.faq.${id}.q`),
  a: t(`kit.landing.faq.${id}.a`),
}));

useSchemaOrg([
  {
    "@type": "SoftwareApplication",
    name: "Mood Kit",
    description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    softwareRequirements: "PHP 8.4, Node.js 22 or 24, PostgreSQL, Redis, Docker",
    inLanguage: ["en", "es"],
    keywords:
      "nuxt saas boilerplate, vue saas boilerplate, laravel nuxt saas starter kit, laravel vue saas starter kit, multi-tenant saas boilerplate, nuxt saas template",
    // Price and checkout link come from utils/kit-config.ts.
    offers: {
      "@type": "Offer",
      url: KIT_BUY_URL,
      priceCurrency: "USD",
      ...(KIT_PRICE_USD ? { price: KIT_PRICE_USD } : {}),
      availability: "https://schema.org/InStock",
    },
  },
  {
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  defineBreadcrumb({
    itemListElement: [
      { name: "mood-ui", item: site.url + localePath("/") },
      { name: "Mood Kit", item: url },
    ],
  }),
]);

function go(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  router.push(localePath(path));
}

const docsLinks = [
  { id: "start", path: routeForSlug("getting-started") },
  { id: "concepts", path: routeForSlug("concepts/multi-tenancy") },
  { id: "setup", path: routeForSlug("setup/domains") },
  { id: "agents", path: routeForSlug("working-with-agents") },
  { id: "guides", path: routeForSlug("guides/add-a-permission-and-menu-entry") },
] as const;
</script>

<template>
  <div class="flex flex-col gap-14 pb-16 max-w-4xl">
    <!-- Hero -->
    <header class="flex flex-col gap-5">
      <div class="flex items-center gap-3">
        <Typography variant="overline" size="medium" color="muted">
          {{ t("kit.landing.overline") }}
        </Typography>
        <NuxtLinkLocale to="/templates" class="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
          {{ t("kit.landing.backToTemplates") }}
        </NuxtLinkLocale>
      </div>
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.08]">
        {{ t("kit.landing.h1") }}
      </h1>
      <p class="text-base lg:text-lg text-muted-foreground leading-relaxed font-light max-w-3xl">
        {{ t("kit.landing.lead") }}
      </p>
      <div class="flex flex-wrap items-center gap-3 pt-1">
        <Button
          as="a"
          color="primary"
          size="large"
          :href="localePath(routeForSlug('getting-started'))"
          @click="go($event, routeForSlug('getting-started'))"
        >
          {{ t("kit.landing.ctaStart") }}
          <template #suffix><ArrowRightIcon class="size-5" /></template>
        </Button>
        <Button
          as="a"
          variant="outline"
          size="large"
          :href="localePath(routeForSlug('overview'))"
          @click="go($event, routeForSlug('overview'))"
        >
          {{ t("kit.landing.ctaDocs") }}
        </Button>
        <Button as="a" variant="outline" size="large" :href="KIT_BUY_URL" rel="nofollow noopener">
          {{ t("kit.landing.ctaBuy") }}
        </Button>
      </div>
      <p class="text-sm text-muted-foreground">{{ t("kit.landing.pricingNote") }}</p>
    </header>

    <!-- Facts -->
    <section class="flex flex-col gap-4" aria-labelledby="kit-facts">
      <h2 id="kit-facts" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.factsTitle") }}</h2>
      <ul class="grid gap-3 sm:grid-cols-2">
        <li
          v-for="id in KIT_FACT_IDS"
          :key="id"
          class="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed"
        >
          {{ t(`kit.landing.facts.${id}`) }}
        </li>
      </ul>
    </section>

    <!-- Who -->
    <section class="grid gap-6 sm:grid-cols-2" aria-labelledby="kit-for">
      <div class="flex flex-col gap-2">
        <h2 id="kit-for" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.forTitle") }}</h2>
        <p class="text-sm text-muted-foreground leading-relaxed">{{ t("kit.landing.forBody") }}</p>
      </div>
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold tracking-tight">{{ t("kit.landing.notForTitle") }}</h2>
        <p class="text-sm text-muted-foreground leading-relaxed">{{ t("kit.landing.notForBody") }}</p>
      </div>
    </section>

    <!-- Included -->
    <section class="flex flex-col gap-4" aria-labelledby="kit-included">
      <div class="flex flex-col gap-1">
        <h2 id="kit-included" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.includedTitle") }}</h2>
        <p class="text-sm text-muted-foreground">{{ t("kit.landing.includedLead") }}</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <Card v-for="id in KIT_FEATURE_IDS" :key="id" variant="outlined" padding="large">
          <h3 class="text-base font-semibold mb-1.5">{{ t(`kit.landing.features.${id}.title`) }}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{{ t(`kit.landing.features.${id}.text`) }}</p>
        </Card>
      </div>
    </section>

    <!-- Stack -->
    <section class="flex flex-col gap-4" aria-labelledby="kit-stack">
      <div class="flex flex-col gap-1">
        <h2 id="kit-stack" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.stackTitle") }}</h2>
        <p class="text-sm text-muted-foreground">{{ t("kit.landing.stackLead") }}</p>
      </div>
      <dl class="rounded-xl border border-border divide-y divide-border overflow-hidden">
        <div v-for="id in KIT_STACK_IDS" :key="id" class="grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-4 px-4 py-3 text-sm">
          <dt class="font-medium">{{ t(`kit.landing.stack.${id}.name`) }}</dt>
          <dd class="text-muted-foreground">{{ t(`kit.landing.stack.${id}.value`) }}</dd>
        </div>
      </dl>
    </section>


    <!-- Docs -->
    <section class="flex flex-col gap-3" aria-labelledby="kit-docs">
      <div class="flex flex-col gap-1">
        <h2 id="kit-docs" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.docsTitle") }}</h2>
        <p class="text-sm text-muted-foreground">{{ t("kit.landing.docsLead") }}</p>
      </div>
      <ul class="flex flex-col gap-2">
        <li v-for="l in docsLinks" :key="l.id">
          <NuxtLinkLocale :to="l.path" class="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4">
            <CheckIcon class="size-4" aria-hidden="true" />
            {{ t(`kit.landing.docsLinks.${l.id}`) }}
          </NuxtLinkLocale>
        </li>
      </ul>
    </section>

    <!-- FAQ -->
    <section class="flex flex-col gap-4" aria-labelledby="kit-faq">
      <h2 id="kit-faq" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.faqTitle") }}</h2>
      <div class="flex flex-col gap-3">
        <details v-for="f in faq" :key="f.id" class="group rounded-xl border border-border bg-card px-4 py-3">
          <summary class="cursor-pointer text-sm font-medium list-none flex items-center justify-between gap-3">
            {{ f.q }}
            <span class="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{{ f.a }}</p>
        </details>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6" aria-labelledby="kit-cta">
      <h2 id="kit-cta" class="text-xl font-semibold tracking-tight">{{ t("kit.landing.ctaTitle") }}</h2>
      <p class="text-sm text-muted-foreground leading-relaxed">{{ t("kit.landing.ctaBody") }}</p>
      <div class="flex flex-wrap gap-3 pt-1">
        <Button
          as="a"
          color="primary"
          :href="localePath(routeForSlug('getting-started'))"
          @click="go($event, routeForSlug('getting-started'))"
        >
          {{ t("kit.landing.ctaStart") }}
        </Button>
        <Button as="a" variant="outline" :href="KIT_BUY_URL" rel="nofollow noopener">
          {{ t("kit.landing.ctaBuy") }}
        </Button>
      </div>
    </section>
  </div>
</template>
