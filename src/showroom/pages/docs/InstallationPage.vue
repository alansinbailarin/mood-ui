<script setup lang="ts">
import { inject, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  BoltIcon,
  CubeIcon,
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/vue/24/outline";
import Typography from "../../../components/data-display/Typography.vue";
import Card from "../../../components/data-display/Card.vue";
import Stack from "../../../components/layout/Stack.vue";
import Badge from "../../../components/feedback/Badge.vue";
import Button from "../../../components/forms/Button.vue";
import Banner from "../../../components/feedback/Banner.vue";
import CodePreview from "../../components/CodePreview.vue";
import { useShowroomRouter } from "../../composables/useShowroomRouter";
import { vReveal } from "../../composables/useScrollReveal";
import { DOC_TOC_KEY } from "../../composables/useDocToc";

const { go } = useShowroomRouter();
const { t, locale } = useI18n();

const toc = inject(DOC_TOC_KEY, null);

function registerToc() {
  if (!toc) return;
  toc.register({
    id: "step-1",
    label: t("pages.docs.installation.step1Title"),
    level: 1,
  });
  toc.register({
    id: "step-2",
    label: t("pages.docs.installation.step2Title"),
    level: 1,
  });
  toc.register({
    id: "step-3",
    label: t("pages.docs.installation.step3Title"),
    level: 1,
  });
  toc.register({
    id: "step-4",
    label: t("pages.docs.installation.step4Title"),
    level: 1,
  });
  toc.register({
    id: "step-5",
    label: t("pages.docs.installation.step5Title"),
    level: 1,
  });
  toc.register({
    id: "next-steps",
    label: t("pages.docs.installation.nextSteps"),
    level: 1,
  });
}

onMounted(registerToc);
watch(locale, registerToc);

const installCmd = `npm install mood-ui`;
const yarnCmd = `yarn add mood-ui`;
const pnpmCmd = `pnpm add mood-ui`;

const peerDeps = `npm install vue@^3.5 tailwindcss@^4`;

const setupCss = `/* main.ts or main.css */
@import "tailwindcss";
@import "mood-ui/style.css";`;

const setupApp = `// main.ts
import { createApp } from 'vue';
import App from '../../../App.vue';
import './style.css';

createApp(App).mount('#app');`;

const wrapApp = `<!-- App.vue -->
<script setup lang="ts">
import { ModoProvider } from 'mood-ui';
<\/script>

<template>
  <ModoProvider
    color="primary"
    theme="system"
    radius="medium"
    size="medium"
    locale="es"
  >
    <RouterView />
  </ModoProvider>
</template>`;

const useComponent = `<script setup lang="ts">
import { Button, Input, Card } from 'mood-ui';
import { ref } from 'vue';

const email = ref('');
<\/script>

<template>
  <Card padding="large">
    <Input v-model="email" label="Email" placeholder="you@example.com" />
    <Button color="primary">Suscribirme</Button>
  </Card>
</template>`;
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- Header -->
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.installation.overline") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.installation.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.installation.subtitle") }}
      </Typography>
    </header>

    <!-- Steps: timeline -->
    <ol
      v-reveal
      class="relative flex flex-col gap-10 pl-8 border-l border-border ml-3"
    >
      <!-- Step 1 -->
      <li id="step-1" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >1</span
        >
        <Typography variant="title" size="large" weight="medium">{{
          t("pages.docs.installation.step1Title")
        }}</Typography>
        <CodePreview :code="installCmd" lang="bash" code-only />
        <details class="group">
          <summary
            class="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors select-none"
          >
            {{ t("pages.docs.installation.step1Alt") }}
          </summary>
          <div class="mt-3 flex flex-col gap-3">
            <CodePreview :code="yarnCmd" lang="bash" code-only />
            <CodePreview :code="pnpmCmd" lang="bash" code-only />
          </div>
        </details>
      </li>

      <!-- Step 2 -->
      <li id="step-2" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >2</span
        >
        <Typography variant="title" size="large" weight="medium">{{
          t("pages.docs.installation.step2Title")
        }}</Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.installation.step2Desc") }}
        </Typography>
        <CodePreview :code="peerDeps" lang="bash" code-only />
      </li>

      <!-- Step 3 -->
      <li id="step-3" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >3</span
        >
        <Typography variant="title" size="large" weight="medium">{{
          t("pages.docs.installation.step3Title")
        }}</Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{
            t("pages.docs.installation.step3Desc", {
              code: "mood-ui/style.css",
            })
          }}
        </Typography>
        <CodePreview :code="setupCss" lang="css" code-only />
        <Banner color="info" variant="subtle">
          <strong>Tip:</strong> mood-ui usa <code>@theme inline</code> para
          mapear sus CSS vars a tokens de Tailwind. No necesitas configurar nada
          en <code>tailwind.config</code>.
        </Banner>
      </li>

      <!-- Step 4 -->
      <li id="step-4" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >4</span
        >
        <Typography variant="title" size="large" weight="medium">{{
          t("pages.docs.installation.step4Title")
        }}</Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.installation.step4Desc", { code: "ModoProvider" }) }}
        </Typography>
        <CodePreview :code="wrapApp" lang="vue" code-only />
      </li>

      <!-- Step 5 -->
      <li id="step-5" class="relative flex flex-col gap-4">
        <span
          class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none"
          >5</span
        >
        <Typography variant="title" size="large" weight="medium">{{
          t("pages.docs.installation.step5Title")
        }}</Typography>
        <Typography variant="body" size="small" color="muted" weight="light">
          {{ t("pages.docs.installation.step5Desc") }}
        </Typography>
        <CodePreview :code="useComponent" lang="vue" code-only />
      </li>
    </ol>

    <!-- Next steps -->
    <section id="next-steps" v-reveal class="flex flex-col gap-4">
      <Typography variant="heading" size="large" weight="medium">
        {{ t("pages.docs.installation.nextSteps") }}
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
              <BoltIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">{{
              t("pages.docs.installation.themeCard")
            }}</Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.installation.themeCardDesc") }}
            </Typography>
          </Stack>
        </Card>
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('button')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors"
            >
              <CubeIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">{{
              t("pages.docs.installation.componentsCard")
            }}</Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.installation.componentsCardDesc") }}
            </Typography>
          </Stack>
        </Card>
      </div>

      <div class="flex gap-2 pt-2">
        <Button
          as="a"
          href="https://www.npmjs.com/package/mood-ui"
          target="_blank"
          rel="noopener"
          variant="text"
          size="small"
        >
          <span class="inline-flex items-center gap-1.5">
            {{ t("pages.docs.installation.viewOnNpm") }}
            <ArrowTopRightOnSquareIcon class="size-3.5" />
          </span>
        </Button>
        <Button
          as="a"
          href="https://github.com/alansinbailarin/mood-ui"
          target="_blank"
          rel="noopener"
          variant="text"
          size="small"
        >
          <span class="inline-flex items-center gap-1.5">
            {{ t("pages.docs.installation.viewOnGithub") }}
            <ArrowTopRightOnSquareIcon class="size-3.5" />
          </span>
        </Button>
      </div>
    </section>
  </div>
</template>
