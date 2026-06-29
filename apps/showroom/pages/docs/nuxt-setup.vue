<script setup lang="ts">
import { computed, inject, onMounted, watch } from "vue";
import {
  CubeIcon,
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
  SwatchIcon,
  ServerIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { Banner, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";

import CodePreview from "~/components/CodePreview.vue";
import { vReveal } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";
const go = useEntryNav();
const { t, locale } = useI18n();

useSeoMeta({
  title: () => t("pages.docs.nuxtSetup.title"),
  description: () => t("pages.docs.nuxtSetup.description"),
  ogTitle: () => `${t("pages.docs.nuxtSetup.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.nuxtSetup.description"),
});

defineOgImage("Default", {
  title: t("pages.docs.nuxtSetup.title"),
  description: t("pages.docs.nuxtSetup.description"),
  category: "Docs",
});

const toc = inject(DOC_TOC_KEY, null);
function registerToc() {
  if (!toc) return;
  toc.register({ id: "install", label: t("pages.docs.nuxtSetup.step1Title"), level: 1 });
  toc.register({ id: "app-vue", label: t("pages.docs.nuxtSetup.step2Title"), level: 1 });
  toc.register({ id: "nuxt-config", label: t("pages.docs.nuxtSetup.step3Title"), level: 1 });
  toc.register({ id: "theme-state", label: t("pages.docs.nuxtSetup.step4Title"), level: 1 });
  toc.register({ id: "tailwind", label: t("pages.docs.nuxtSetup.step5Title"), level: 1 });
  toc.register({ id: "ssg-demos", label: t("pages.docs.nuxtSetup.step6Title"), level: 1 });
  toc.register({ id: "pitfalls", label: t("pages.docs.nuxtSetup.pitfallsTitle"), level: 1 });
}
onMounted(registerToc);
watch(locale, registerToc);

const installCmd = `npm install mood-ui`;

const appVueSetup = `<!-- app.vue -->
<script setup lang="ts">
import {
  ModoProvider,
  ToastContainer,
  ConfirmDialog,
  useColorMode,
  paletteFromHex,
} from 'mood-ui'
import { computed } from 'vue'

// Resolved is always 'light' | 'dark', never 'system'.
// Passing this to ModoProvider keeps every teleported overlay
// (Modal, Tooltip, PopoverPanel) in lock-step with the toggle.
const { resolved } = useColorMode()

// Optional: derive a brand palette from a single hex.
const palettes = computed(() => ({
  primary: paletteFromHex('#6366f1'),
}))
<\/script>

<template>
  <ModoProvider :theme="resolved" :palettes="palettes">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global overlay singletons. useToast() / useConfirm() push
         to a queue; these components render the queue. -->
    <ClientOnly>
      <ToastContainer placement="bottom-right" />
      <ConfirmDialog />
    </ClientOnly>
  </ModoProvider>
</template>`;

const nuxtConfig = `// nuxt.config.ts
export default defineNuxtConfig({
  // The lib ships its own pre-compiled CSS; load it once at the root.
  css: ['mood-ui/style.css'],

  app: {
    head: {
      script: [
        {
          // Anti-FOUC. Runs before <body> parses so the right .dark
          // class is set BEFORE the first paint. Without this the
          // SSG-rendered HTML flashes light → dark on hydration.
          tagPosition: 'head',
          innerHTML: \`(function(){try{
            var s=localStorage.getItem('modo-color-mode');
            var p=matchMedia('(prefers-color-scheme: dark)').matches;
            var d=s==='dark'||(s!=='light'&&p);
            if(d)document.documentElement.classList.add('dark');
          }catch(e){}})();\`,
        },
      ],
    },
  },
})`;

const themeStatePattern = `// composables/useAppTheme.ts
import { paletteFromHex, darkSurfaces, type ModoRadius } from 'mood-ui'

interface AppTheme {
  primaryHex: string
  radius: ModoRadius
  baseIntensity: number  // 0–100
}

const STORAGE_KEY = 'app:theme'
const DEFAULTS: AppTheme = {
  primaryHex: '#6366f1',
  radius: 'medium',
  baseIntensity: 0,
}

export function useAppTheme() {
  const state = useState<AppTheme>('app-theme', () => ({ ...DEFAULTS }))

  // Hydrate from localStorage on the client.
  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) state.value = { ...DEFAULTS, ...JSON.parse(raw) }
    } catch { /* private mode */ }
  })

  // Persist on every change.
  watch(state, (v) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) }
    catch { /* quota */ }
  }, { deep: true })

  return { state }
}`;

const tailwindSetup = `/* assets/app.css */
@import "tailwindcss";

/* Tell Tailwind v4 to scan the library sources so responsive
 * utilities the lib relies on (sm:flex-row, sm:w-32, …) end up in
 * your bundle at the right layer. */
@source "../node_modules/mood-ui/dist/**/*.{js,mjs}";

/* Mirror the lib's dark-mode trigger so 'dark:' variants stay
 * consistent between your code and the lib. */
@custom-variant dark (&:where(.dark, .dark *, [data-modo-theme="dark"], [data-modo-theme="dark"] *));`;

const ssgDemoPattern = `<script setup lang="ts">
import { Button, Modal } from 'mood-ui'
import { ref } from 'vue'

const open = ref(false)
<\/script>

<template>
  <!-- Texto, headings, descripciones, props tables: SSR-rendered.
       Google indexa todo esto. -->
  <h1>My component demo</h1>
  <p>This page is statically generated and fully indexable.</p>

  <!-- Demos interactivos (overlays, drag, viewport-dependent state):
       envolverlos en <ClientOnly>. El HTML estático sigue siendo
       indexable; el demo hidrata en cliente. -->
  <ClientOnly>
    <Button @click="open = true">Open modal</Button>
    <Modal v-model="open" title="Hello">
      Component preview here.
    </Modal>
  </ClientOnly>
</template>`;

const features = computed(() => [
  {
    icon: CubeIcon,
    title: t("pages.docs.nuxtSetup.features.providerTitle"),
    text: t("pages.docs.nuxtSetup.features.providerText"),
  },
  {
    icon: ServerIcon,
    title: t("pages.docs.nuxtSetup.features.ssrTitle"),
    text: t("pages.docs.nuxtSetup.features.ssrText"),
  },
  {
    icon: PaintBrushIcon,
    title: t("pages.docs.nuxtSetup.features.themeTitle"),
    text: t("pages.docs.nuxtSetup.features.themeText"),
  },
  {
    icon: SwatchIcon,
    title: t("pages.docs.nuxtSetup.features.tailwindTitle"),
    text: t("pages.docs.nuxtSetup.features.tailwindText"),
  },
]);

const pitfalls = computed(() => [
  {
    title: t("pages.docs.nuxtSetup.pitfalls.queueTitle"),
    text: t("pages.docs.nuxtSetup.pitfalls.queueText"),
  },
  {
    title: t("pages.docs.nuxtSetup.pitfalls.themeTitle"),
    text: t("pages.docs.nuxtSetup.pitfalls.themeText"),
  },
  {
    title: t("pages.docs.nuxtSetup.pitfalls.providerTitle"),
    text: t("pages.docs.nuxtSetup.pitfalls.providerText"),
  },
  {
    title: t("pages.docs.nuxtSetup.pitfalls.fofTitle"),
    text: t("pages.docs.nuxtSetup.pitfalls.fofText"),
  },
  {
    title: t("pages.docs.nuxtSetup.pitfalls.tailwindTitle"),
    text: t("pages.docs.nuxtSetup.pitfalls.tailwindText"),
  },
]);
</script>

<template>
  <article class="flex flex-col gap-12 pb-12">
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.nuxtSetup.kicker") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.nuxtSetup.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.nuxtSetup.subtitle") }}
      </Typography>
    </header>

    <!-- Feature pills -->
    <section v-reveal class="grid sm:grid-cols-2 gap-4 not-prose">
      <Card
        v-for="f in features"
        :key="f.title"
        variant="outlined"
        padding="large"
      >
        <Stack direction="column" spacing="small">
          <div
            class="size-9 rounded-xl grid place-items-center bg-primary/10 text-primary"
          >
            <component :is="f.icon" class="size-5" />
          </div>
          <Typography variant="title" size="small" as="h3">{{
            f.title
          }}</Typography>
          <Typography variant="body" size="small" color="muted">{{
            f.text
          }}</Typography>
        </Stack>
      </Card>
    </section>

    <!-- Steps -->
    <ol
      v-reveal
      class="relative flex flex-col gap-10 pl-8 border-l border-border ml-3"
    >
      <li id="install" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >1</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.nuxtSetup.step1Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.nuxtSetup.step1Desc") }}
        </Typography>
        <CodePreview :code="installCmd" lang="bash" code-only />
      </li>

      <li id="app-vue" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >2</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.nuxtSetup.step2Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.nuxtSetup.step2Desc") }}
        </Typography>
        <CodePreview :code="appVueSetup" lang="vue" code-only />
        <Banner color="info" variant="subtle">
          <strong>{{ t("pages.docs.nuxtSetup.tip") }}:</strong>
          {{ t("pages.docs.nuxtSetup.step2Tip") }}
        </Banner>
      </li>

      <li id="nuxt-config" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >3</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.nuxtSetup.step3Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.nuxtSetup.step3Desc") }}
        </Typography>
        <CodePreview :code="nuxtConfig" lang="typescript" code-only />
        <Banner color="warning" variant="subtle">
          <strong>{{ t("pages.docs.nuxtSetup.warning") }}:</strong>
          {{ t("pages.docs.nuxtSetup.step3Warning") }}
        </Banner>
      </li>

      <li id="theme-state" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >4</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.nuxtSetup.step4Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.nuxtSetup.step4Desc") }}
        </Typography>
        <CodePreview :code="themeStatePattern" lang="typescript" code-only />
      </li>

      <li id="tailwind" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >5</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.nuxtSetup.step5Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.nuxtSetup.step5Desc") }}
        </Typography>
        <CodePreview :code="tailwindSetup" lang="css" code-only />
      </li>

      <li id="ssg-demos" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >6</span
        >
        <Typography variant="title" size="large" weight="medium">
          {{ t("pages.docs.nuxtSetup.step6Title") }}
        </Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.nuxtSetup.step6Desc") }}
        </Typography>

        <!-- Quick reference: when ClientOnly is required vs optional -->
        <div class="mt-2 flex flex-col gap-3">
          <Typography variant="title" size="small" weight="semibold">
            {{ t("pages.docs.nuxtSetup.ssgTableTitle") }}
          </Typography>
          <Typography variant="body" size="small" color="muted" weight="light">
            {{ t("pages.docs.nuxtSetup.ssgTableIntro") }}
          </Typography>
          <div class="grid sm:grid-cols-2 gap-3">
            <Card variant="outlined" padding="medium">
              <div class="flex items-start gap-2 mb-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-warning/15 text-warning"
                  >ClientOnly</span
                >
              </div>
              <Typography
                variant="title"
                size="small"
                as="h4"
                weight="semibold"
                class="!mb-1"
              >
                {{ t("pages.docs.nuxtSetup.ssgClientOnly") }}
              </Typography>
              <Typography variant="body" size="small" color="muted">
                {{ t("pages.docs.nuxtSetup.ssgClientOnlyText") }}
              </Typography>
            </Card>
            <Card variant="outlined" padding="medium">
              <div class="flex items-start gap-2 mb-2">
                <span
                  class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-success/15 text-success"
                  >SSR</span
                >
              </div>
              <Typography
                variant="title"
                size="small"
                as="h4"
                weight="semibold"
                class="!mb-1"
              >
                {{ t("pages.docs.nuxtSetup.ssgServerSafe") }}
              </Typography>
              <Typography variant="body" size="small" color="muted">
                {{ t("pages.docs.nuxtSetup.ssgServerSafeText") }}
              </Typography>
            </Card>
          </div>
          <Banner color="info" variant="subtle">
            <strong>{{ t("pages.docs.nuxtSetup.ssgWhyMost") }}:</strong>
            {{ t("pages.docs.nuxtSetup.ssgWhyMostText") }}
          </Banner>
        </div>

        <CodePreview :code="ssgDemoPattern" lang="vue" code-only />
      </li>
    </ol>

    <!-- Pitfalls -->
    <section id="pitfalls" v-reveal class="flex flex-col gap-4 not-prose">
      <div class="flex items-center gap-2">
        <ExclamationTriangleIcon class="size-5 text-warning" />
        <Typography variant="heading" size="large" weight="medium" class="!m-0">
          {{ t("pages.docs.nuxtSetup.pitfallsTitle") }}
        </Typography>
      </div>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.nuxtSetup.pitfallsIntro") }}
      </Typography>
      <div class="flex flex-col gap-3">
        <Card
          v-for="p in pitfalls"
          :key="p.title"
          variant="outlined"
          padding="medium"
        >
          <Typography
            variant="title"
            size="small"
            as="h3"
            weight="semibold"
            class="!mb-1"
            >{{ p.title }}</Typography
          >
          <Typography variant="body" size="small" color="muted">{{
            p.text
          }}</Typography>
        </Card>
      </div>
    </section>

    <!-- Next steps -->
    <section v-reveal class="flex flex-col gap-4">
      <Typography variant="heading" size="large" weight="medium">
        {{ t("pages.docs.nuxtSetup.nextTitle") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group cursor-pointer"
          @click="go('theming')"
        >
          <div class="flex items-center gap-2 mb-2">
            <PaintBrushIcon class="size-4 text-muted-foreground" />
            <Typography variant="title" size="small" weight="semibold">
              {{ t("pages.docs.nuxtSetup.nextTheming") }}
            </Typography>
          </div>
          <Typography variant="body" size="small" color="muted">
            {{ t("pages.docs.nuxtSetup.nextThemingDesc") }}
          </Typography>
        </button>
        <button
          type="button"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group cursor-pointer"
          @click="go('button')"
        >
          <div class="flex items-center gap-2 mb-2">
            <CubeIcon class="size-4 text-muted-foreground" />
            <Typography variant="title" size="small" weight="semibold">
              {{ t("pages.docs.nuxtSetup.nextComponents") }}
            </Typography>
          </div>
          <Typography variant="body" size="small" color="muted">
            {{ t("pages.docs.nuxtSetup.nextComponentsDesc") }}
          </Typography>
        </button>
        <a
          href="https://nuxt.com/docs/getting-started/installation"
          target="_blank"
          rel="noopener noreferrer"
          class="text-left rounded-xl border border-border bg-card hover:border-primary/60 transition-colors p-5 group cursor-pointer"
        >
          <div class="flex items-center gap-2 mb-2">
            <BookOpenIcon class="size-4 text-muted-foreground" />
            <Typography variant="title" size="small" weight="semibold">
              {{ t("pages.docs.nuxtSetup.nextNuxt") }}
            </Typography>
            <ArrowTopRightOnSquareIcon class="size-3.5 text-muted-foreground" />
          </div>
          <Typography variant="body" size="small" color="muted">
            {{ t("pages.docs.nuxtSetup.nextNuxtDesc") }}
          </Typography>
        </a>
      </div>
    </section>
  </article>
</template>
