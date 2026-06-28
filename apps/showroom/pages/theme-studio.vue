<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Theme Studio is a full-bleed interactive playground. It uses the
// landing layout (header only, no sidebar, no DocToc) so the entire
// viewport is available for the live preview panel.
definePageMeta({ layout: "landing" });

const { t } = useI18n();

useSeoMeta({
  title: () => t("pages.themeStudio.seoTitle"),
  description: () => t("pages.themeStudio.seoDescription"),
  ogTitle: () => `${t("pages.themeStudio.seoTitle")} · mood-ui`,
  ogDescription: () => t("pages.themeStudio.seoDescription"),
});


</script>

<template>
  <!-- Same container as AppHeader: `max-w-9xl` centered with `px-3 sm:px-6`.
       Keeps the studio content visually aligned with the brand logo and
       the right-side controls in the sticky header. -->
  <div class="max-w-9xl mx-auto w-full px-3 sm:px-6 py-6">
    <ClientOnly>
      <ThemeStudioApp />
      <template #fallback>
        <div class="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <h1 class="text-2xl font-semibold">Theme Studio</h1>
          <p class="text-sm text-muted-foreground max-w-md">
            Loading the interactive theme playground…
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
