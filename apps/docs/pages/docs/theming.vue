<script setup lang="ts">
import { allEntries } from "~/utils/nav-manifest";
import { inject, onMounted, watch } from "vue";
import { Banner, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import { CubeIcon, GlobeAltIcon } from "@heroicons/vue/24/outline";




import CodePreview from "~/components/CodePreview.vue";
import { vReveal } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const providerProps = `<ModoProvider
  color="primary"          // brand color
  theme="system"           // 'light' | 'dark' | 'system'
  radius="medium"          // 'none' | 'small' | 'medium' | 'large' | 'full'
  size="medium"            // 'small' | 'medium' | 'large'
  halo="tinted"            // focus ring style
  locale="es"              // 'es' | 'en' or full ModoLocale
>
  <App />
</ModoProvider>`;

const customPalette = `<script setup lang="ts">
import { ModoProvider, paletteFromHex } from 'mood-ui';

const palettes = {
  primary: paletteFromHex('#6366f1'), // generates 50→900 scale
};
<\/script>

<template>
  <ModoProvider :palettes="palettes" color="primary">
    <App />
  </ModoProvider>
</template>`;

const surfaces = `<script setup lang="ts">
import { ModoProvider, type ModoSurfaces } from 'mood-ui';

const surfaces: ModoSurfaces = {
  background: '#fafafa',
  card:       '#ffffff',
  border:     '#e5e7eb',
  primary:    '#6366f1',
  // …14 semantic tokens total
};
<\/script>

<template>
  <ModoProvider :surfaces="surfaces">
    <App />
  </ModoProvider>
</template>`;

const darkSurfaces = `<script setup lang="ts">
import { ModoProvider, darkSurfaces } from 'mood-ui';

// 6 built-in presets: default · navy · zinc · charcoal · midnight · forest
<\/script>

<template>
  <ModoProvider :dark-surfaces="darkSurfaces.midnight" theme="dark">
    <App />
  </ModoProvider>
</template>`;

const cssOverride = `/* tailwind.config / your global css */
:root {
  --primary:           #6366f1;
  --primary-foreground: #ffffff;
  --background:        #fafafa;
  --foreground:        #0a0a0a;
  --border:            #e5e7eb;
  /* …override any of the 14 semantic tokens */
}

.dark {
  --primary:           #818cf8;
  --background:        #0a0a0a;
  --foreground:        #fafafa;
}`;

const tokens = [
  { name: "background", usage: "App background" },
  { name: "foreground", usage: "Default text color" },
  { name: "card", usage: "Card / panel surfaces" },
  { name: "card-foreground", usage: "Text inside cards" },
  { name: "popover", usage: "Popover / dropdown surfaces" },
  { name: "popover-foreground", usage: "Text inside popovers" },
  { name: "primary", usage: "Brand color" },
  { name: "primary-foreground", usage: "Text on primary" },
  { name: "secondary", usage: "Secondary surface" },
  { name: "muted", usage: "Muted backgrounds" },
  { name: "muted-foreground", usage: "Subdued text" },
  { name: "accent", usage: "Accent / hover surfaces" },
  { name: "border", usage: "Hairlines, separators" },
  { name: "input", usage: "Input borders" },
  { name: "ring", usage: "Focus ring color" },
];

const _router = useRouter();
function go(idOrPath: string) {
  if (idOrPath.startsWith("/")) return _router.push(idOrPath);
  const _e = allEntries.find((e) => e.id === idOrPath);
  if (_e) _router.push(_e.route);
}
const { t, locale } = useI18n();


useSeoMeta({
  title: () => t("pages.docs.theming.title"),
  description: () => t("pages.docs.theming.description"),
  ogTitle: () => `${t("pages.docs.theming.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.theming.description"),
});
const toc = inject(DOC_TOC_KEY, null);

function registerToc() {
  if (!toc) return;
  toc.register({
    id: "provider-props",
    label: t("pages.docs.theming.providerPropsTitle"),
    level: 1,
  });
  toc.register({
    id: "custom-palette",
    label: t("pages.docs.theming.customPaletteTitle"),
    level: 1,
  });
  toc.register({
    id: "surfaces",
    label: t("pages.docs.theming.surfacesTitle"),
    level: 1,
  });
  toc.register({
    id: "dark-presets",
    label: t("pages.docs.theming.darkPresetsTitle"),
    level: 1,
  });
  toc.register({
    id: "css-override",
    label: t("pages.docs.theming.cssOverrideTitle"),
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
        {{ t("pages.docs.theming.overline") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.theming.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.theming.subtitle") }}
      </Typography>
    </header>

    <!-- Provider props -->
    <section id="provider-props" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.theming.providerPropsTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{
          t("pages.docs.theming.providerPropsDesc", { code: "ModoProvider" })
        }}
      </Typography>
      <CodePreview :code="providerProps" lang="vue" code-only />
    </section>

    <!-- Custom palette -->
    <section id="custom-palette" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.theming.customPaletteTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{
          t("pages.docs.theming.customPaletteDesc", {
            code: "paletteFromHex()",
          })
        }}
      </Typography>
      <CodePreview :code="customPalette" lang="vue" code-only />
    </section>

    <!-- Surfaces -->
    <section id="surfaces" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.theming.surfacesTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{ t("pages.docs.theming.surfacesDesc") }}
      </Typography>
      <CodePreview :code="surfaces" lang="vue" code-only />

      <Card variant="outlined" padding="large">
        <Stack direction="column" spacing="small">
          <Typography variant="title" size="small" weight="bold">{{
            t("pages.docs.theming.availableTokens")
          }}</Typography>
          <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm font-mono">
            <div
              v-for="token in tokens"
              :key="token.name"
              class="flex items-center gap-2 py-1 border-b border-border/50 last:border-0"
            >
              <code class="text-primary">{{ token.name }}</code>
              <span class="text-muted-foreground text-xs ml-auto">{{
                token.usage
              }}</span>
            </div>
          </div>
        </Stack>
      </Card>
    </section>

    <!-- Dark surfaces presets -->
    <section id="dark-presets" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.theming.darkPresetsTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{
          t("pages.docs.theming.darkPresetsDesc", {
            default: "default",
            navy: "navy",
            zinc: "zinc",
            charcoal: "charcoal",
            midnight: "midnight",
            forest: "forest",
          })
        }}
      </Typography>
      <CodePreview :code="darkSurfaces" lang="vue" code-only />
    </section>

    <!-- CSS override -->
    <section id="css-override" v-reveal class="flex flex-col gap-4">
      <Typography variant="title" size="large" weight="medium" as="h2">{{
        t("pages.docs.theming.cssOverrideTitle")
      }}</Typography>
      <Typography variant="body" size="small" color="muted" weight="light">
        {{
          t("pages.docs.theming.cssOverrideDesc", {
            root: ":root",
            dark: ".dark",
          })
        }}
      </Typography>
      <CodePreview :code="cssOverride" lang="css" code-only />

      <Banner color="warning" variant="subtle">
        <strong>Recommendation:</strong>
        {{
          t("pages.docs.theming.cssOverrideTip", {
            palettes: ":palettes",
            surfaces: ":surfaces",
          })
        }}
      </Banner>
    </section>

    <!-- Next steps -->
    <section v-reveal class="flex flex-col gap-4">
      <Typography variant="heading" size="large" weight="medium">
        {{ t("pages.docs.theming.nextSteps") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-4">
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('button')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <CubeIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">{{
              t("pages.docs.theming.componentsCard")
            }}</Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.theming.componentsCardDesc") }}
            </Typography>
          </Stack>
        </Card>
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('i18n')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors"
            >
              <GlobeAltIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">{{
              t("pages.docs.theming.i18nCard")
            }}</Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.theming.i18nCardDesc") }}
            </Typography>
          </Stack>
        </Card>
      </div>
    </section>
  </div>
</template>
