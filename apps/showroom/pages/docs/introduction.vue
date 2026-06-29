<script setup lang="ts">
import { navManifest } from "~/utils/nav-manifest";
import { computed, inject, onMounted, watch } from "vue";
import { Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  SwatchIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon,
  PuzzlePieceIcon,
  CodeBracketIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";



import { vReveal, vRevealChildren } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const go = useEntryNav();
const { t, locale } = useI18n();


useSeoMeta({
  title: () => t("pages.docs.introduction.title"),
  description: () => t("pages.docs.introduction.description"),
  ogTitle: () => `${t("pages.docs.introduction.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.introduction.description"),
});

defineOgImage("Default", {
  title: t("pages.docs.introduction.title"),
  description: t("pages.docs.introduction.description"),
  category: "Docs",
});
const toc = inject(DOC_TOC_KEY, null);

function registerToc() {
  if (!toc) return;
  toc.register({
    id: "why-modo",
    label: t("pages.docs.introduction.whyTitle"),
    level: 1,
  });
  toc.register({
    id: "get-started",
    label: t("pages.docs.introduction.orgTitle"),
    level: 1,
  });
}

onMounted(registerToc);
watch(locale, registerToc);

const totalComponents = navManifest
  .filter(
    (c) =>
      !["getting-started", "docs", "templates", "theme-studio"].includes(c.id),
  )
  .reduce((acc, c) => acc + c.entries.length, 0);

const cardStyles = [
  {
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]",
    hoverBorder: "hover:border-primary/50",
  },
  {
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]",
    hoverBorder: "hover:border-success/40",
  },
  {
    iconClasses:
      "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white",
    patternClasses:
      "text-warning [background-image:repeating-linear-gradient(-60deg,currentColor_0,currentColor_1px,transparent_0,transparent_12px)]",
    hoverBorder: "hover:border-warning/40",
  },
  {
    iconClasses:
      "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white",
    patternClasses:
      "text-destructive [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:14px_14px]",
    hoverBorder: "hover:border-destructive/40",
  },
  {
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:28px_28px]",
    hoverBorder: "hover:border-primary/50",
  },
  {
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:repeating-linear-gradient(0deg,currentColor_0,currentColor_1px,transparent_0,transparent_18px)]",
    hoverBorder: "hover:border-success/40",
  },
];

const principles = computed(() => [
  {
    icon: SwatchIcon,
    title: t("pages.docs.introduction.principles.theming.title"),
    text: t("pages.docs.introduction.principles.theming.text"),
  },
  {
    icon: GlobeAltIcon,
    title: t("pages.docs.introduction.principles.i18n.title"),
    text: t("pages.docs.introduction.principles.i18n.text"),
  },
  {
    icon: ShieldCheckIcon,
    title: t("pages.docs.introduction.principles.a11y.title"),
    text: t("pages.docs.introduction.principles.a11y.text"),
  },
  {
    icon: BoltIcon,
    title: t("pages.docs.introduction.principles.treeShake.title"),
    text: t("pages.docs.introduction.principles.treeShake.text"),
  },
  {
    icon: PuzzlePieceIcon,
    title: t("pages.docs.introduction.principles.tailwind.title"),
    text: t("pages.docs.introduction.principles.tailwind.text"),
  },
  {
    icon: CodeBracketIcon,
    title: t("pages.docs.introduction.principles.ts.title"),
    text: t("pages.docs.introduction.principles.ts.text"),
  },
]);
</script>

<template>
  <article
    class="prose prose-neutral dark:prose-invert max-w-none flex flex-col gap-12 pb-12"
  >
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.introduction.kicker") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.introduction.title") }}
      </Typography>

      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.introduction.intro", { n: totalComponents }) }}
      </Typography>
    </header>

    <section id="why-modo" v-reveal class="flex flex-col gap-4 not-prose">
      <Typography variant="heading" size="large" weight="medium" class="!m-0">
        {{ t("pages.docs.introduction.whyTitle") }}
      </Typography>
      <div v-reveal-children class="grid sm:grid-cols-2 gap-4">
        <Card
          v-for="(p, i) in principles"
          :key="p.title"
          variant="outlined"
          padding="large"
          class="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
          :class="cardStyles[i].hoverBorder"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065]"
            :class="cardStyles[i].patternClasses"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl grid place-items-center transition-colors"
              :class="cardStyles[i].iconClasses"
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
      </div>
    </section>

    <section id="get-started" v-reveal class="flex flex-col gap-4 not-prose">
      <Typography variant="heading" size="large" weight="medium" class="!m-0">
        {{ t("pages.docs.introduction.orgTitle") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.introduction.orgIntro") }}
      </Typography>

      <div class="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
          @click="go('installation')"
        >
          <h3 class="text-base font-semibold text-foreground !m-0 mb-1">
            {{ t("docsNav.installation") }}
          </h3>
          <p class="text-sm text-muted-foreground !m-0">
            {{ t("pages.docs.introduction.tiles.installation.desc") }}
          </p>
          <span
            class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all"
          >
            {{ t("pages.docs.introduction.tiles.installation.cta") }}
            <ArrowRightIcon class="size-4" />
          </span>
        </button>
        <button
          type="button"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
          @click="go('theming')"
        >
          <h3 class="text-base font-semibold text-foreground !m-0 mb-1">
            {{ t("docsNav.theming") }}
          </h3>
          <p class="text-sm text-muted-foreground !m-0">
            {{ t("pages.docs.introduction.tiles.theming.desc") }}
          </p>
          <span
            class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all"
          >
            {{ t("pages.docs.introduction.tiles.theming.cta") }}
            <ArrowRightIcon class="size-4" />
          </span>
        </button>
        <button
          type="button"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
          @click="go('i18n')"
        >
          <h3 class="text-base font-semibold text-foreground !m-0 mb-1">
            {{ t("docsNav.i18n") }}
          </h3>
          <p class="text-sm text-muted-foreground !m-0">
            {{ t("pages.docs.introduction.tiles.i18n.desc") }}
          </p>
          <span
            class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all"
          >
            {{ t("pages.docs.introduction.tiles.i18n.cta") }}
            <ArrowRightIcon class="size-4" />
          </span>
        </button>
        <button
          type="button"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group"
          @click="go('changelog')"
        >
          <h3 class="text-base font-semibold text-foreground !m-0 mb-1">
            {{ t("docsNav.changelog") }}
          </h3>
          <p class="text-sm text-muted-foreground !m-0">
            {{ t("pages.docs.introduction.tiles.changelog.desc") }}
          </p>
          <span
            class="inline-flex items-center gap-1 text-primary text-sm font-medium mt-2 group-hover:gap-2 transition-all"
          >
            {{ t("pages.docs.introduction.tiles.changelog.cta") }}
            <ArrowRightIcon class="size-4" />
          </span>
        </button>
      </div>
    </section>
  </article>
</template>
