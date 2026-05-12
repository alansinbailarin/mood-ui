<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, Typography, useColorMode } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";



import type { PropDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";

const { t } = useI18n();

useSeoMeta({
  title: () => t("pages.composables.useColorMode.title"),
  description: () => t("pages.composables.useColorMode.description"),
  ogTitle: () => `${t("pages.composables.useColorMode.title")} · mood-ui`,
  ogDescription: () => t("pages.composables.useColorMode.description"),
});
const { mode, resolved, isDark, set, toggle } = useColorMode();

const pgMode = ref<"light" | "dark" | "system">(mode.value);

function onPgModeChange(v: string) {
  set(v as "light" | "dark" | "system");
}

function resetPlayground() {
  set("system");
  pgMode.value = "system";
}

// Sync pgMode when mode changes externally
import { watch } from "vue";
watch(mode, (v) => {
  pgMode.value = v;
});

const overviewCode = computed(() => {
  return `<script setup lang="ts">
import { useColorMode } from 'mood-ui';

const { mode, resolved, isDark, set, toggle } = useColorMode();
<\/script>

<template>
  <p>Chosen mode: {{ mode }}</p>
  <p>Resolved mode: {{ resolved }}</p>
  <p>Is dark: {{ isDark }}</p>

  <button @click="set('light')">Light</button>
  <button @click="set('dark')">Dark</button>
  <button @click="set('system')">System</button>
  <button @click="toggle">Toggle</button>
<\/template>`;
});

const basicCode = `<script setup lang="ts">
import { useColorMode } from 'mood-ui';

const { resolved, isDark } = useColorMode();
<\/script>

<template>
  <div :class="isDark ? 'bg-neutral-900 text-white' : 'bg-white text-black'">
    Content adapts to {{ resolved }} mode.
  <\/div>
<\/template>`;

const toggleCode = `<script setup lang="ts">
import { useColorMode } from 'mood-ui';

const { toggle, isDark } = useColorMode();
<\/script>

<template>
  <button @click="toggle">
    Switch to {{ isDark ? 'light' : 'dark' }}
  <\/button>
<\/template>`;

const systemCode = `<script setup lang="ts">
import { useColorMode } from 'mood-ui';

const { mode, resolved } = useColorMode();

// Set once; it will follow OS preference reactively
mode.value = 'system';
<\/script>

<template>
  <p>OS preference → {{ resolved }}</p>
<\/template>`;

const typesCode = `type ColorMode = 'light' | 'dark' | 'system';

interface UseColorModeReturn {
  mode: Ref<ColorMode>;
  resolved: ComputedRef<string>;
  isDark: ComputedRef<boolean>;
  set: (value: ColorMode) => void;
  toggle: () => void;
}

function useColorMode(): UseColorModeReturn;`;

const returnPropsList = computed<PropDoc[]>(() => [
  {
    name: "mode",
    type: "Ref<'light' | 'dark' | 'system'>",
    description: t("pages.composables.useColorMode.props.mode"),
  },
  {
    name: "resolved",
    type: "ComputedRef<'light' | 'dark'>",
    description: t("pages.composables.useColorMode.props.resolved"),
  },
  {
    name: "isDark",
    type: "ComputedRef<boolean>",
    description: t("pages.composables.useColorMode.props.isDark"),
  },
  {
    name: "set",
    type: "(v: 'light' | 'dark' | 'system') => void",
    description: t("pages.composables.useColorMode.props.set"),
  },
  {
    name: "toggle",
    type: "() => void",
    description: t("pages.composables.useColorMode.props.toggle"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useColorMode.title')"
    category="Composables"
    import-path="import { useColorMode } from 'mood-ui'"
    :description="t('pages.composables.useColorMode.description')"
    :props-list="returnPropsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Mode"
            :options="[
              { value: 'light' },
              { value: 'dark' },
              { value: 'system' },
            ]"
            v-model="pgMode"
            @update:model-value="onPgModeChange"
          />
        </template>

        <div class="flex flex-col gap-3">
          <Typography variant="body" size="small">
            <strong>mode:</strong> {{ mode }}
          </Typography>
          <Typography variant="body" size="small">
            <strong>resolved:</strong> {{ resolved }}
          </Typography>
          <Typography variant="body" size="small">
            <strong>isDark:</strong> {{ isDark }}
          </Typography>

          <div class="flex gap-2 mt-1">
            <Button variant="outline" size="small" @click="set('light')">
              Light
            </Button>
            <Button variant="outline" size="small" @click="set('dark')">
              Dark
            </Button>
            <Button variant="outline" size="small" @click="set('system')">
              System
            </Button>
            <Button color="primary" size="small" @click="toggle">
              Toggle
            </Button>
          </div>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.composables.useColorMode.examples.basic.title')"
        :description="t('pages.composables.useColorMode.examples.basic.desc')"
        :code="basicCode"
        min-height="160px"
      >
        <Typography variant="body" size="small">
          Resolved: <strong>{{ resolved }}</strong> | isDark:
          <strong>{{ isDark }}</strong>
        </Typography>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useColorMode.examples.toggle.title')"
        :description="t('pages.composables.useColorMode.examples.toggle.desc')"
        :code="toggleCode"
        min-height="160px"
      >
        <Button @click="toggle">
          Switch to {{ isDark ? "light" : "dark" }}
        </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useColorMode.examples.system.title')"
        :description="t('pages.composables.useColorMode.examples.system.desc')"
        :code="systemCode"
        min-height="160px"
      >
        <Typography variant="body" size="small">
          OS preference → <strong>{{ resolved }}</strong>
        </Typography>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useColorMode.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useColorMode.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
