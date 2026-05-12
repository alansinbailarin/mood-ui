<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import {
  useModoConfig,
  useResolvedColor,
} from "../../../composables/useModoConfig";
import type { PropDoc } from "../../types";

const { t } = useI18n();

const cfg = useModoConfig();
const demoColor = ref<string | undefined>(undefined);
const resolved = useResolvedColor(() => demoColor.value as any);

const overviewCode = `import {
  useModoConfig,
  useResolvedColor,
  useResolvedRadius,
  useResolvedSize,
  useResolvedTheme,
  useResolvedHalo,
  useModoLocale,
  useLocaleString,
} from 'mood-ui';

// Read the full config object (requires being inside <ModoProvider>)
const config = useModoConfig();

// Resolve a prop with fallback to global / default
const color = useResolvedColor(() => props.color);
const radius = useResolvedRadius(() => props.radius);
const size = useResolvedSize(() => props.size);
const theme = useResolvedTheme(() => props.theme);
const halo = useResolvedHalo(() => props.halo);`;

const resolveCode = `import { useResolvedColor } from 'mood-ui';

// If prop color is 'default' or undefined, falls back to global brand color
const resolvedColor = useResolvedColor(() => props.color);

// Semantic values ('primary', 'danger', 'success', 'warning') always win
// 'default' or undefined falls back to the provider's color`;

const localeCode = `import { useModoLocale, useLocaleString } from 'mood-ui';

// Deep-merged locale — works even outside <ModoProvider>
const locale = useModoLocale();

// Resolve + interpolate placeholders in one call
const greeting = useLocaleString(
  (l) => l.greeting,
  () => ({ name: 'Ana' })
);`;

const typesCode = `type ModoColor = 'default' | 'primary' | 'danger' | 'success' | 'warning';
type ModoRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
type ModoSize = 'small' | 'medium' | 'large';
type ModoTheme = 'light' | 'dark' | 'system';
type HaloVariant = 'none' | 'ring' | 'glow' | 'shadow';

interface ModoConfig {
  color?: ModoColor;
  radius?: ModoRadius;
  size?: ModoSize;
  theme?: ModoTheme;
  halo?: HaloVariant;
}

function useModoConfig(): {
  config: Ref<ModoConfig>;
  set: (patch: ModoConfig) => void;
};`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "useModoConfig",
    type: "() => ModoConfig | undefined",
    description: t("pages.composables.useModoConfig.api.config"),
  },
  {
    name: "useResolvedColor",
    type: "(localGetter) => ComputedRef<ModoColor>",
    description: t("pages.composables.useModoConfig.api.resolvedColor"),
  },
  {
    name: "useResolvedRadius",
    type: "(localGetter) => ComputedRef<ModoRadius>",
    description: t("pages.composables.useModoConfig.api.resolvedRadius"),
  },
  {
    name: "useResolvedSize",
    type: "(localGetter) => ComputedRef<ModoSize>",
    description: t("pages.composables.useModoConfig.api.resolvedSize"),
  },
  {
    name: "useResolvedTheme",
    type: "(localGetter?) => ComputedRef<ModoTheme>",
    description: t("pages.composables.useModoConfig.api.resolvedTheme"),
  },
  {
    name: "useResolvedHalo",
    type: "(localGetter?) => ComputedRef<ModoHalo>",
    description: t("pages.composables.useModoConfig.api.resolvedHalo"),
  },
  {
    name: "useModoLocale",
    type: "() => ComputedRef<ModoLocale>",
    description: t("pages.composables.useModoConfig.api.modoLocale"),
  },
  {
    name: "useLocaleString",
    type: "(getter, vars?) => ComputedRef<string>",
    description: t("pages.composables.useModoConfig.api.localeString"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useModoConfig.title')"
    category="Composables"
    import-path="import { useModoConfig } from 'mood-ui'"
    :description="t('pages.composables.useModoConfig.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="260px" lang="ts">
        <div class="flex flex-col gap-3">
          <Typography variant="body" size="small">
            <strong>Provider color:</strong>
            {{ cfg?.color ?? "default" }}
          </Typography>
          <Typography variant="body" size="small">
            <strong>Provider radius:</strong>
            {{ cfg?.radius ?? "medium" }}
          </Typography>
          <Typography variant="body" size="small">
            <strong>Resolved color (demo):</strong> {{ resolved }}
          </Typography>

          <div class="flex gap-2">
            <Button
              size="small"
              variant="outline"
              @click="demoColor = 'primary'"
            >
              primary
            </Button>
            <Button
              size="small"
              variant="outline"
              color="danger"
              @click="demoColor = 'danger'"
            >
              danger
            </Button>
            <Button
              size="small"
              variant="outline"
              @click="demoColor = undefined"
            >
              reset
            </Button>
          </div>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.composables.useModoConfig.examples.resolve.title')"
        :description="
          t('pages.composables.useModoConfig.examples.resolve.desc')
        "
        :code="resolveCode"
        min-height="160px"
        lang="ts"
      >
        <div class="flex flex-col gap-2">
          <Typography variant="body" size="small">
            Local: <strong>{{ demoColor ?? "undefined" }}</strong>
          </Typography>
          <Typography variant="body" size="small">
            Resolved: <strong>{{ resolved }}</strong>
          </Typography>
          <div class="flex gap-2">
            <Button size="small" @click="demoColor = 'primary'">primary</Button>
            <Button size="small" color="danger" @click="demoColor = 'danger'"
              >danger</Button
            >
            <Button size="small" variant="ghost" @click="demoColor = undefined"
              >reset</Button
            >
          </div>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useModoConfig.examples.locale.title')"
        :description="t('pages.composables.useModoConfig.examples.locale.desc')"
        :code="localeCode"
        min-height="160px"
        lang="ts"
      >
        <Typography variant="body" size="small">
          {{ t("pages.composables.useModoConfig.examples.locale.body") }}
        </Typography>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useModoConfig.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useModoConfig.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
