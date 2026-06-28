<script setup lang="ts">
import { computed } from "vue";
import { Card, Stack, Typography } from "mood-ui";
import {
  ChartBarIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";




import { useI18n } from "vue-i18n";
import { vReveal, vRevealChildren } from "~/composables/useScrollReveal";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.templates.index.title"),
  description: () => t("pages.templates.index.subtitle"),
  ogTitle: () => `${t("pages.templates.index.title")} · mood-ui`,
  ogDescription: () => t("pages.templates.index.subtitle"),
});

defineOgImage("Default", {
  title: t("pages.templates.index.title"),
  description: t("pages.templates.index.subtitle"),
});
interface Tpl {
  id: "dashboard" | "auth" | "pricing" | "settings";
  icon: unknown;
  tone: "primary" | "success" | "warning" | "danger";
}

const templates: Tpl[] = [
  { id: "dashboard", icon: ChartBarIcon, tone: "primary" },
  { id: "auth", icon: LockClosedIcon, tone: "success" },
  { id: "pricing", icon: CurrencyDollarIcon, tone: "warning" },
  { id: "settings", icon: Cog6ToothIcon, tone: "danger" },
];

const cardStyles = [
  {
    // Dashboard — grid lines, primary
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:22px_22px]",
    hoverBorder: "hover:border-primary/50",
    barClasses: "text-primary",
    barHeights: ["h-3", "h-6", "h-4", "h-8", "h-5", "h-7", "h-2"],
  },
  {
    // Auth — dot matrix, success
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]",
    hoverBorder: "hover:border-success/40",
    barClasses: "text-success",
    barHeights: ["h-6", "h-3", "h-7", "h-4", "h-8", "h-2", "h-5"],
  },
  {
    // Pricing — diagonal stripes, warning
    iconClasses:
      "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white",
    patternClasses:
      "text-warning [background-image:repeating-linear-gradient(-55deg,currentColor_0,currentColor_1px,transparent_0,transparent_14px)]",
    hoverBorder: "hover:border-warning/40",
    barClasses: "text-warning",
    barHeights: ["h-8", "h-5", "h-7", "h-3", "h-6", "h-4", "h-8"],
  },
  {
    // Settings — crosshatch, danger
    iconClasses:
      "bg-danger/10 text-danger group-hover:bg-danger group-hover:text-white",
    patternClasses:
      "text-danger [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:14px_14px]",
    hoverBorder: "hover:border-danger/40",
    barClasses: "text-danger",
    barHeights: ["h-4", "h-7", "h-3", "h-6", "h-8", "h-5", "h-4"],
  },
];

const items = computed(() =>
  templates.map((tpl, i) => ({
    ...tpl,
    body: {
      title: t(`pages.templates.index.items.${tpl.id}.title`),
      desc: t(`pages.templates.index.items.${tpl.id}.desc`),
    },
    style: cardStyles[i],
  })),
);
</script>

<template>
  <div class="flex flex-col gap-10 pb-12">
    <header v-reveal class="flex flex-col gap-3 max-w-2xl">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("templates") }}
      </Typography>
      <Typography variant="display" size="medium" as="h1" weight="medium">
        {{ t("pages.templates.index.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.templates.index.subtitle") }}
      </Typography>
    </header>

    <div v-reveal-children class="grid sm:grid-cols-2 gap-5">
      <Card
        v-for="tpl in items"
        :key="tpl.id"
        variant="outlined"
        padding="none"
        class="relative overflow-hidden group cursor-default transition-all duration-300"
        :class="tpl.style.hoverBorder"
      >
        <!-- Geometric pattern overlay -->
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.055]"
          :class="tpl.style.patternClasses"
        />

        <!-- Lock badge -->
        <div
          class="absolute top-3 right-3 z-10 size-7 rounded-full bg-background/80 backdrop-blur-sm border border-border grid place-items-center"
        >
          <LockClosedIcon class="size-3.5 text-muted-foreground" />
        </div>

        <div class="relative flex flex-col gap-6 p-6">
          <!-- Header: icon + mini bar chart -->
          <div class="flex items-end justify-between">
            <div
              class="size-11 rounded-xl grid place-items-center transition-colors duration-300 shrink-0"
              :class="tpl.style.iconClasses"
            >
              <component :is="tpl.icon" class="size-5" />
            </div>

            <!-- Faux bar chart — decorative, tone-colored -->
            <div
              class="flex items-end gap-1 opacity-25 group-hover:opacity-50 transition-opacity duration-300"
              :class="tpl.style.barClasses"
            >
              <div
                v-for="(h, j) in tpl.style.barHeights"
                :key="j"
                class="w-2 rounded-sm bg-current"
                :class="h"
              />
            </div>
          </div>

          <!-- Text -->
          <Stack direction="column" spacing="xsmall">
            <Typography variant="title" size="medium" as="h3">{{
              tpl.body.title
            }}</Typography>
            <Typography variant="body" size="small" color="muted">{{
              tpl.body.desc
            }}</Typography>
          </Stack>

          <!-- CTA -->
          <span
            class="inline-flex items-center gap-1.5 text-muted-foreground text-sm"
          >
            <LockClosedIcon class="size-3.5" />
            {{ t("pages.templates.index.comingSoon") }}
          </span>
        </div>
      </Card>
    </div>
  </div>
</template>
