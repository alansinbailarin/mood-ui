<script setup lang="ts">
/**
 * Terms of sale for Mood Kit. Written once per language (kit.terms in the
 * locale files), shown before checkout and linked from the landing. The LICENSE
 * file in the kit repository is the governing text; this page summarizes it.
 * A static route, so it wins over the docs catch-all at /kit/[...slug].
 */
import { Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import { KIT_SUPPORT_EMAIL, KIT_TERMS_IDS, KIT_TERMS_POINT_IDS } from "~/utils/kit-config";
import { KIT_LANDING, KIT_TERMS } from "~/utils/kit-docs";

const { t } = useI18n();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const site = useSiteConfig();

const title = t("kit.terms.seo.title");
const description = t("kit.terms.seo.description");
const url = site.url + localePath(KIT_TERMS);
const enUrl = site.url + switchLocalePath("en");

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
// Each language has its own text, so each canonical is its own URL.
useHead({
  link: [
    { rel: "canonical", href: url },
    { rel: "alternate", hreflang: "en", href: enUrl },
    { rel: "alternate", hreflang: "es", href: site.url + switchLocalePath("es") },
    { rel: "alternate", hreflang: "x-default", href: enUrl },
  ],
});
defineOgImage("Default", { title, description, category: "Mood Kit" });
useSchemaOrg([
  { "@type": "WebPage", name: title, description, url },
  defineBreadcrumb({
    itemListElement: [
      { name: "mood-ui", item: site.url + localePath("/") },
      { name: "Mood Kit", item: site.url + localePath(KIT_LANDING) },
      { name: t("kit.terms.h1"), item: url },
    ],
  }),
]);
</script>

<template>
  <article class="flex flex-col gap-10 pb-16 max-w-3xl">
    <header class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <Typography variant="overline" size="medium" color="muted">Mood Kit</Typography>
        <NuxtLinkLocale :to="KIT_LANDING" class="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">
          {{ t("kit.terms.backToKit") }}
        </NuxtLinkLocale>
      </div>
      <h1 class="text-3xl sm:text-4xl font-medium tracking-tight leading-[1.08]">{{ t("kit.terms.h1") }}</h1>
      <p class="text-base text-muted-foreground leading-relaxed font-light">{{ t("kit.terms.lead") }}</p>
    </header>

    <section v-for="id in KIT_TERMS_IDS" :key="id" class="flex flex-col gap-2" :aria-labelledby="`terms-${id}`">
      <h2 :id="`terms-${id}`" class="text-xl font-semibold tracking-tight">{{ t(`kit.terms.${id}.title`) }}</h2>
      <i18n-t :keypath="`kit.terms.${id}.body`" tag="p" scope="global" class="text-sm text-muted-foreground leading-relaxed">
        <template #email>
          <a :href="`mailto:${KIT_SUPPORT_EMAIL}`" class="text-primary underline underline-offset-4">{{ KIT_SUPPORT_EMAIL }}</a>
        </template>
      </i18n-t>
      <ul v-if="id === 'license'" class="flex flex-col gap-1.5 list-disc pl-5 text-sm text-muted-foreground leading-relaxed">
        <li v-for="p in KIT_TERMS_POINT_IDS" :key="p">{{ t(`kit.terms.license.points.${p}`) }}</li>
      </ul>
    </section>
  </article>
</template>
