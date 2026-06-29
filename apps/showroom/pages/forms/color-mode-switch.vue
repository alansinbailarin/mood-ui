<script setup lang="ts">
import { ref, computed } from "vue";
import { ColorModeSwitch, useColorMode } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";


import type { PropDoc, EmitDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import type { ModoTheme } from "../../../config/ModoConfig";

const { t } = useI18n();


useSeoMeta({
  title: () => t("pages.forms.colorModeSwitch.title"),
  description: () => t("pages.forms.colorModeSwitch.description"),
  ogTitle: () => `${t("pages.forms.colorModeSwitch.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.colorModeSwitch.description"),
});
// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.forms.colorModeSwitch.a11y.kbTab") },
  {
    keys: ["↑", "↓", "←", "→"],
    action: t("pages.forms.colorModeSwitch.a11y.kbArrow"),
  },
  { keys: ["Space"], action: t("pages.forms.colorModeSwitch.a11y.kbSpace") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"radiogroup"',
    desc: t("pages.forms.colorModeSwitch.a11y.ariaGroup"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.colorModeSwitch.a11y.ariaLabel"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.colorModeSwitch.a11y.ariaDisabled"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.colorModeSwitch.a11y.focusGroup"),
  t("pages.forms.colorModeSwitch.a11y.focusCollapsed"),
]);

// Global color mode — the overview playground and basic example actually change the theme
const { mode } = useColorMode();

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"default" | "collapsed">("default");
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgShowLabels = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgVariant.value = "default";
  pgSize.value = "medium";
  pgShowLabels.value = false;
  pgDisabled.value = false;
}

const overviewCode = computed(() => {
  const parts: string[] = ['v-model="colorMode"'];
  if (pgVariant.value !== "default") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgShowLabels.value) parts.push(':show-labels="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  return `<ColorModeSwitch ${parts.join(" ")} />`;
});

// ── Example code strings ──────────────────────────────────────────────────────
const basicCode = `<script setup>
import { ColorModeSwitch, useColorMode } from 'mood-ui';
const { mode } = useColorMode();
<\/script>

<ColorModeSwitch v-model="mode" />`;

const collapsedCode = `<script setup>
import { ColorModeSwitch, useColorMode } from 'mood-ui';
const { mode } = useColorMode();
<\/script>

<!-- Muestra solo el modo activo; en hover se expande -->
<ColorModeSwitch v-model="mode" variant="collapsed" />`;

const sizesCode = `<script setup lang="ts">
import { ref } from 'vue';
import { ColorModeSwitch } from 'mood-ui';
import type { ModoTheme } from 'mood-ui';

const modeS = ref<ModoTheme>('system');
const modeM = ref<ModoTheme>('light');
const modeL = ref<ModoTheme>('dark');
<\/script>

<template>
  <ColorModeSwitch v-model="modeS" size="small" />
  <ColorModeSwitch v-model="modeM" size="medium" />
  <ColorModeSwitch v-model="modeL" size="large" />
</template>`;

const withLabelsCode = `<script setup lang="ts">
import { ref } from 'vue';
import { ColorModeSwitch } from 'mood-ui';
import type { ModoTheme } from 'mood-ui';

const mode = ref<ModoTheme>('system');
<\/script>

<template>
  <ColorModeSwitch v-model="mode" :show-labels="true" />
</template>`;

const disabledCode = `<script setup lang="ts">
import { ref } from 'vue';
import { ColorModeSwitch } from 'mood-ui';
import type { ModoTheme } from 'mood-ui';

const mode = ref<ModoTheme>('system');
<\/script>

<template>
  <ColorModeSwitch v-model="mode" :disabled="true" />
</template>`;

// Example local state (visual only — not connected to global theme)
const exSizeS = ref<ModoTheme>("system");
const exSizeM = ref<ModoTheme>("light");
const exSizeL = ref<ModoTheme>("dark");
const exLabels = ref<ModoTheme>("system");
const exDisabled = ref<ModoTheme>("system");

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "modelValue",
    type: "'light' | 'system' | 'dark'",
    description: t("pages.forms.colorModeSwitch.props.modelValue"),
  },
  {
    name: "variant",
    type: "'default' | 'collapsed'",
    default: "'default'",
    description: t("pages.forms.colorModeSwitch.props.variant"),
  },
  {
    name: "ariaLabel",
    type: "string",
    default: "'Color mode'",
    description: t("pages.forms.colorModeSwitch.props.ariaLabel"),
  },
  {
    name: "showLabels",
    type: "boolean",
    default: "false",
    description: t("pages.forms.colorModeSwitch.props.showLabels"),
  },
  {
    name: "size",
    type: "'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.colorModeSwitch.props.size"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.colorModeSwitch.props.disabled"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "update:modelValue",
    payload: "'light' | 'system' | 'dark'",
    description: t("pages.forms.colorModeSwitch.emits.updateModelValue"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.colorModeSwitch.title')"
    category="Forms"
    import-path="import { ColorModeSwitch } from 'mood-ui'"
    :description="t('pages.forms.colorModeSwitch.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="140px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Variant"
            :options="[{ value: 'default' }, { value: 'collapsed' }]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            label="Size"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
          <TbSep />
          <TbToggle label="Labels" v-model="pgShowLabels" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
        </template>

        <ColorModeSwitch
          v-model="mode"
          :variant="pgVariant"
          :size="pgSize"
          :show-labels="pgShowLabels"
          :disabled="pgDisabled"
        />
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <!-- Basic: connected to global color mode -->
      <ComponentPreview
        :title="t('pages.forms.colorModeSwitch.examples.basic.title')"
        :description="t('pages.forms.colorModeSwitch.examples.basic.desc')"
        :code="basicCode"
      >
        <ColorModeSwitch v-model="mode" />
      </ComponentPreview>

      <!-- Collapsed variant -->
      <ComponentPreview
        :title="t('pages.forms.colorModeSwitch.examples.collapsed.title')"
        :description="t('pages.forms.colorModeSwitch.examples.collapsed.desc')"
        :code="collapsedCode"
      >
        <ColorModeSwitch v-model="mode" variant="collapsed" />
      </ComponentPreview>

      <!-- Sizes -->
      <ComponentPreview
        :title="t('pages.forms.colorModeSwitch.examples.sizes.title')"
        :description="t('pages.forms.colorModeSwitch.examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="flex flex-col items-start gap-3">
          <ColorModeSwitch v-model="exSizeS" size="small" />
          <ColorModeSwitch v-model="exSizeM" size="medium" />
          <ColorModeSwitch v-model="exSizeL" size="large" />
        </div>
      </ComponentPreview>

      <!-- With labels -->
      <ComponentPreview
        :title="t('pages.forms.colorModeSwitch.examples.withLabels.title')"
        :description="t('pages.forms.colorModeSwitch.examples.withLabels.desc')"
        :code="withLabelsCode"
      >
        <ColorModeSwitch v-model="exLabels" :show-labels="true" />
      </ComponentPreview>

      <!-- Disabled -->
      <ComponentPreview
        :title="t('pages.forms.colorModeSwitch.examples.disabled.title')"
        :description="t('pages.forms.colorModeSwitch.examples.disabled.desc')"
        :code="disabledCode"
      >
        <ColorModeSwitch v-model="exDisabled" :disabled="true" />
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>
  </ComponentDoc>
</template>
