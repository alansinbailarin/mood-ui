<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

useSeoMeta({
  title: () => t("pages.themeStudio.seoTitle"),
  description: () => t("pages.themeStudio.seoDescription"),
  ogTitle: () => `${t("pages.themeStudio.seoTitle")} · mood-ui`,
  ogDescription: () => t("pages.themeStudio.seoDescription"),
});

useHead({
  link: [{ rel: "canonical", href: "https://mood-ui.com/theme-studio" }],
});
</script>

<template>
  <ClientOnly>
    <ThemeStudioApp />
    <template #fallback>
      <div class="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <h1 class="text-2xl font-semibold">Theme Studio</h1>
        <p class="text-sm text-muted-foreground max-w-md">
          Loading the interactive theme playground… You'll be able to tune the
          brand color, radius and surfaces in a moment.
        </p>
      </div>
    </template>
  </ClientOnly>
</template>
