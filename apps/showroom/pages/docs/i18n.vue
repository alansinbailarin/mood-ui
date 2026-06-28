<script setup lang="ts">
import { allEntries } from "~/utils/nav-manifest";
import { inject, onMounted, watch } from "vue";
import { Badge, Banner, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import { PaintBrushIcon, BookOpenIcon } from "@heroicons/vue/24/outline";





import CodePreview from "~/components/CodePreview.vue";
import { vReveal } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const usePreset = `<script setup lang="ts">
import { ModoProvider, locales } from 'mood-ui';
<\/script>

<template>
  <ModoProvider :locale="locales.es">
    <App />
  </ModoProvider>
</template>`;

const useLocaleComposable = `<script setup lang="ts">
import { ModoProvider, useLocale } from 'mood-ui';

const { locale, current, set } = useLocale();
<\/script>

<template>
  <ModoProvider :locale="locale">
    <button @click="set('es')">Español</button>
    <button @click="set('en')">English</button>
    <p>Idioma actual: {{ current }}</p>
  </ModoProvider>
</template>`;

const partialOverride = `<script setup lang="ts">
import { ModoProvider, locales, type PartialLocale } from 'mood-ui';

// Start from Spanish, override only the strings you want
const customEs: PartialLocale = {
  common: {
    clear: 'Borrar',  // override
  },
  table: {
    empty: 'No hay datos para mostrar',
  },
};
<\/script>

<template>
  <ModoProvider :locale="customEs">
    <App />
  </ModoProvider>
</template>`;

const customLocale = `<script setup lang="ts">
import { ModoProvider, defaultLocale, mergeLocale, type ModoLocale } from 'mood-ui';

// Build a full Portuguese locale by deep-merging from English
const pt: ModoLocale = mergeLocale(defaultLocale, {
  common: {
    clear:   'Limpar',
    loading: 'Carregando',
  },
  table: {
    empty:     'Sem dados',
    noResults: 'Nenhum resultado',
  },
  // …override any namespace
});
<\/script>

<template>
  <ModoProvider :locale="pt">
    <App />
  </ModoProvider>
</template>`;

const namespaces = [
  "common",
  "input",
  "textarea",
  "select",
  "multiSelect",
  "combobox",
  "numberInput",
  "searchInput",
  "passwordInput",
  "dateField",
  "dateTimeField",
  "dateRangeField",
  "calendar",
  "agenda",
  "fileInput",
  "banner",
  "badge",
  "avatarGroup",
  "slider",
  "skeleton",
  "table",
];

const _router = useRouter();
function go(idOrPath: string) {
  if (idOrPath.startsWith("/")) return _router.push(idOrPath);
  const _e = allEntries.find((e) => e.id === idOrPath);
  if (_e) _router.push(_e.route);
}
const { t, locale } = useI18n();


useSeoMeta({
  title: () => t("pages.docs.i18n.title"),
  description: () => t("pages.docs.i18n.description"),
  ogTitle: () => `${t("pages.docs.i18n.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.i18n.description"),
});

defineOgImage("Default", {
  title: t("pages.docs.i18n.title"),
  description: t("pages.docs.i18n.description"),
  category: "Docs",
});
const toc = inject(DOC_TOC_KEY, null);

function registerToc() {
  if (!toc) return;
  toc.register({
    id: "preset",
    label: t("pages.docs.i18n.presetTitle"),
    level: 1,
  });
  toc.register({
    id: "dynamic",
    label: t("pages.docs.i18n.dynamicTitle"),
    level: 1,
  });
  toc.register({
    id: "partial",
    label: t("pages.docs.i18n.partialTitle"),
    level: 1,
  });
  toc.register({
    id: "custom-locale",
    label: t("pages.docs.i18n.customTitle"),
    level: 1,
  });
  toc.register({
    id: "namespaces",
    label: t("pages.docs.i18n.namespacesTitle"),
    level: 1,
  });
}

onMounted(registerToc);
watch(locale, registerToc);
</script>

<template>
  <div class="flex flex-col gap-10 pb-12">
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.i18n.overline") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.i18n.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.i18n.subtitle") }}
      </Typography>
    </header>

    <!-- Preset -->
    <section id="preset" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.i18n.presetTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.i18n.presetDesc", { code: "locales" }) }}
      </Typography>
      <CodePreview :code="usePreset" lang="vue" code-only />
    </section>

    <!-- useLocale composable -->
    <section id="dynamic" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.i18n.dynamicTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{
          t("pages.docs.i18n.dynamicDesc", {
            code: "useLocale()",
            set: "set('en')",
          })
        }}
      </Typography>
      <CodePreview :code="useLocaleComposable" lang="vue" code-only />

      <Banner color="info" variant="subtle">
        <strong>Tip:</strong>
        {{ t("pages.docs.i18n.dynamicTip", { code: "useLocale()" }) }}
      </Banner>
    </section>

    <!-- Partial override -->
    <section id="partial" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.i18n.partialTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.i18n.partialDesc", { code: "PartialLocale" }) }}
      </Typography>
      <CodePreview :code="partialOverride" lang="vue" code-only />
    </section>

    <!-- Custom locale -->
    <section id="custom-locale" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.i18n.customTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.i18n.customDesc", { code: "mergeLocale()" }) }}
      </Typography>
      <CodePreview :code="customLocale" lang="vue" code-only />
    </section>

    <!-- Namespaces -->
    <section id="namespaces" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.i18n.namespacesTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.i18n.namespacesDesc", { code: "ModoLocale" }) }}
      </Typography>
      <Card variant="outlined" padding="large">
        <Stack direction="column" spacing="small">
          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="ns in namespaces"
              :key="ns"
              color="default"
              variant="subtle"
              class="font-mono text-xs"
            >
              {{ ns }}
            </Badge>
          </div>
        </Stack>
      </Card>
    </section>

    <!-- Next steps -->
    <section v-reveal class="flex flex-col gap-4">
      <Typography variant="heading" size="large" weight="medium">
        {{ t("pages.docs.i18n.nextSteps") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-4">
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('theming')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <PaintBrushIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">{{
              t("pages.docs.i18n.themingCard")
            }}</Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.i18n.themingCardDesc") }}
            </Typography>
          </Stack>
        </Card>
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('introduction')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors"
            >
              <BookOpenIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">{{
              t("pages.docs.i18n.introCard")
            }}</Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.i18n.introCardDesc") }}
            </Typography>
          </Stack>
        </Card>
      </div>
    </section>
  </div>
</template>
