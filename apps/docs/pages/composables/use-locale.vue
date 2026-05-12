<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, Typography, useLocale } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";



import type { PropDoc } from "~/types/component-doc";

const { t } = useI18n();

useSeoMeta({
  title: () => t("pages.composables.useLocale.title"),
  description: () => t("pages.composables.useLocale.description"),
  ogTitle: () => `${t("pages.composables.useLocale.title")} · mood-ui`,
  ogDescription: () => t("pages.composables.useLocale.description"),
});
const { current, set } = useLocale();

const localGreeting = computed(() =>
  current.value === "es" ? "¡Hola mundo!" : "Hello world!",
);

function switchLocale(lang: "en" | "es") {
  set(lang); // Mood UI locale singleton
}

const overviewCode = computed(
  () => `import { useLocale } from 'mood-ui';

const { locale, current, set } = useLocale();

// current is the locale key: 'en' | 'es'
// locale is the reactive ModoLocale object

function switchToSpanish() {
  set('es');
}

// Pass locale directly to ModoProvider
// <ModoProvider :locale="locale">
//   <App />
// </ModoProvider>`,
);

const basicCode = `import { useLocale } from 'mood-ui';

const { current, set } = useLocale();

// current.value is 'en' or 'es'
// set('es') switches globally`;

const providerCode = `import { useLocale } from 'mood-ui';
import { ModoProvider } from 'mood-ui';

const { locale, set } = useLocale();

// Bind the reactive locale to the provider
// so all child components re-render translated`;

const typesCode = `interface UseLocaleReturn {
  locale: Ref<string>;
  setLocale: (locale: string) => void;
  dir: ComputedRef<'ltr' | 'rtl'>;
}

function useLocale(): UseLocaleReturn;`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "locale",
    type: "ShallowRef<ModoLocale>",
    description: t("pages.composables.useLocale.api.locale"),
  },
  {
    name: "current",
    type: "ShallowRef<LocaleKey>",
    description: t("pages.composables.useLocale.api.current"),
  },
  {
    name: "set",
    type: "(lang: 'en' | 'es') => void",
    description: t("pages.composables.useLocale.api.set"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useLocale.title')"
    category="Composables"
    import-path="import { useLocale } from 'mood-ui'"
    :description="t('pages.composables.useLocale.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="220px" lang="ts">
        <div class="flex flex-col gap-3">
          <Typography variant="body" size="small">
            <strong>current:</strong> {{ current }}
          </Typography>

          <div class="flex gap-2">
            <Button
              size="small"
              variant="outline"
              :color="current === 'en' ? 'primary' : undefined"
              @click="switchLocale('en')"
            >
              English
            </Button>
            <Button
              size="small"
              variant="outline"
              :color="current === 'es' ? 'primary' : undefined"
              @click="switchLocale('es')"
            >
              Español
            </Button>
          </div>

          <Typography variant="body" size="small">
            <strong>greeting:</strong> {{ localGreeting }}
          </Typography>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.composables.useLocale.examples.basic.title')"
        :description="t('pages.composables.useLocale.examples.basic.desc')"
        :code="basicCode"
        min-height="160px"
        lang="ts"
      >
        <div class="flex flex-col gap-2">
          <Typography variant="body" size="small">
            <strong>greeting:</strong> {{ localGreeting }}
          </Typography>
          <div class="flex gap-2">
            <Button
              size="small"
              variant="outline"
              :color="current === 'en' ? 'primary' : undefined"
              @click="switchLocale('en')"
            >
              English
            </Button>
            <Button
              size="small"
              variant="outline"
              :color="current === 'es' ? 'primary' : undefined"
              @click="switchLocale('es')"
            >
              Español
            </Button>
          </div>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useLocale.examples.provider.title')"
        :description="t('pages.composables.useLocale.examples.provider.desc')"
        :code="providerCode"
        min-height="160px"
        lang="ts"
      >
        <Typography variant="body" size="small">
          {{ t("pages.composables.useLocale.examples.provider.body") }}
        </Typography>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useLocale.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useLocale.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
