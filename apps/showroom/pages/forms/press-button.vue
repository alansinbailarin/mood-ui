<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import { Typography, PressButton } from "mood-ui";
import {
  HeartIcon,
  ArrowRightIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CheckIcon,
} from "@heroicons/vue/20/solid";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const k = (key: string) => t(`pages.forms.pressButton.${key}`);

type Variant = "normal" | "outline" | "ghost" | "text";
type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Space", "Enter"], action: k("a11y.kbActivate") },
  { keys: ["Tab"], action: k("a11y.kbTab") },
  { keys: ["Shift+Tab"], action: k("a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "type", value: '"button"', desc: k("a11y.ariaType") },
  { attribute: "aria-busy", value: "true", desc: k("a11y.ariaBusy") },
  { attribute: "aria-disabled", value: "true", desc: k("a11y.ariaDisabled") },
  { attribute: "aria-label", value: "string", desc: k("a11y.ariaLabel") },
]);

const a11yFocus = computed<string[]>(() => [
  k("a11y.focusNative"),
  k("a11y.focusReducedMotion"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
// Size and radius start undefined so the button follows the showroom's
// ModoProvider until a pill is picked.
const pgVariant = ref<Variant>("normal");
const pgColor = ref<Color>("default");
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgLoading = ref(false);
const pgDisabled = ref(false);
const pgFullWidth = ref(false);
const pgGradient = ref(false);
const pgSkeleton = ref(false);

function resetPlayground() {
  pgVariant.value = "normal";
  pgColor.value = "default";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgLoading.value = false;
  pgDisabled.value = false;
  pgFullWidth.value = false;
  pgGradient.value = false;
  pgSkeleton.value = false;
}

const colorDots = computed(() => [
  { value: "default", bg: "var(--color-slate-400)", label: k("controls.colors.default") },
  { value: "primary", bg: "var(--primary)", label: k("controls.colors.primary") },
  { value: "success", bg: "var(--color-emerald-500)", label: k("controls.colors.success") },
  { value: "warning", bg: "var(--color-amber-500)", label: k("controls.colors.warning") },
  { value: "danger", bg: "var(--color-red-500)", label: k("controls.colors.danger") },
]);

const exampleColors: Color[] = ["default", "primary", "success", "warning", "danger"];
const exampleSizes: Size[] = ["xsmall", "small", "medium", "large"];

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "normal") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value) parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value) parts.push(`radius="${pgRadius.value}"`);
  if (pgGradient.value) parts.push("gradient");
  if (pgLoading.value) parts.push("loading");
  if (pgDisabled.value) parts.push("disabled");
  if (pgFullWidth.value) parts.push("full-width");
  if (pgSkeleton.value) parts.push("skeleton");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<PressButton${attrs}>Press me</PressButton>`;
});

// Interactive zero-shift loading demo
const isSaving = ref(false);
function triggerSave() {
  if (isSaving.value) return;
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
  }, 1400);
}

// ── Example code strings ──────────────────────────────────────────────────────
const variantsCode = `<script setup lang="ts">
import { PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButton variant="normal"  color="primary">Normal</PressButton>
  <PressButton variant="outline" color="primary">Outline</PressButton>
  <PressButton variant="ghost"   color="primary">Ghost</PressButton>
  <PressButton variant="text"    color="primary">Text</PressButton>
</template>`;

const colorsCode = `<script setup lang="ts">
import { PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButton color="default">Default</PressButton>
  <PressButton color="primary">Primary</PressButton>
  <PressButton color="success">Success</PressButton>
  <PressButton color="warning">Warning</PressButton>
  <PressButton color="danger">Danger</PressButton>
</template>`;

const sizesCode = `<script setup lang="ts">
import { PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButton size="xsmall">Extra small</PressButton>
  <PressButton size="small">Small</PressButton>
  <PressButton size="medium">Medium</PressButton>
  <PressButton size="large">Large</PressButton>
</template>`;

const gradientCode = `<script setup lang="ts">
import { PressButton } from 'mood-ui';
import { SparklesIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <PressButton gradient color="primary" :start-icon="SparklesIcon">
    Get started
  </PressButton>
</template>`;

const iconsCode = `<script setup lang="ts">
import { PressButton } from 'mood-ui';
import {
  SparklesIcon,
  ArrowRightIcon,
  HeartIcon,
  Cog6ToothIcon,
  CheckIcon,
} from '@heroicons/vue/20/solid';
<\/script>

<template>
  <PressButton :start-icon="SparklesIcon" :end-icon="ArrowRightIcon" color="primary">
    Continue
  </PressButton>
  <PressButton :icon="Cog6ToothIcon" variant="outline" icon-only aria-label="Settings" />
  <PressButton :icon="HeartIcon" variant="ghost" color="danger" icon-only aria-label="Like" />
  <PressButton :icon="CheckIcon" color="success" icon-only aria-label="Confirm" />
</template>`;

const loadingCode = `<script setup lang="ts">
import { ref } from 'vue';
import { PressButton } from 'mood-ui';

const isSaving = ref(false);

function save() {
  isSaving.value = true;
  setTimeout(() => (isSaving.value = false), 1400);
}
<\/script>

<template>
  <PressButton :loading="isSaving" color="primary" @click="save">
    Save changes
  </PressButton>
  <PressButton loading loading-text="Processing…" variant="ghost" color="primary">
    Submit
  </PressButton>
</template>`;

const linkCode = `<script setup lang="ts">
import { PressButton } from 'mood-ui';
<\/script>

<template>
  <PressButton as="a" href="https://mood-ui.com" target="_blank" variant="outline" color="primary">
    Visit documentation
  </PressButton>
  <PressButton as="a" href="https://mood-ui.com" disabled variant="outline">
    Disabled link
  </PressButton>
</template>`;

const typesCode = `type PressButtonVariant = 'normal' | 'outline' | 'ghost' | 'text';

export interface PressButton {
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: PressButtonVariant;
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  gradient?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  cursor?: CSSProperties['cursor'];
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: Component;
  iconPosition?: 'left' | 'right';
  startIcon?: Component;
  endIcon?: Component;
  iconOnly?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
  skeleton?: boolean;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  { name: "label", type: "string", description: k("props.label") },
  {
    name: "type",
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: k("props.type"),
  },
  {
    name: "variant",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'normal'",
    description: k("props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: k("props.color"),
  },
  {
    name: "gradient",
    type: "boolean",
    default: "false",
    description: k("props.gradient"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    default: "ModoProvider",
    description: k("props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "ModoProvider",
    description: k("props.radius"),
  },
  {
    name: "cursor",
    type: "CSSProperties['cursor']",
    description: k("props.cursor"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: k("props.loading"),
  },
  { name: "loadingText", type: "string", description: k("props.loadingText") },
  { name: "icon", type: "Component", description: k("props.icon") },
  {
    name: "iconPosition",
    type: "'left' | 'right'",
    default: "'left'",
    description: k("props.iconPosition"),
  },
  { name: "startIcon", type: "Component", description: k("props.startIcon") },
  { name: "endIcon", type: "Component", description: k("props.endIcon") },
  {
    name: "iconOnly",
    type: "boolean",
    default: "false",
    description: k("props.iconOnly"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: k("props.fullWidth"),
  },
  { name: "ariaLabel", type: "string", description: k("props.ariaLabel") },
  {
    name: "skeleton",
    type: "boolean",
    default: "false",
    description: k("props.skeleton"),
  },
  {
    name: "as",
    type: "'button' | 'a'",
    default: "'button'",
    description: k("props.as"),
  },
  { name: "href", type: "string", description: k("props.href") },
  { name: "target", type: "string", description: k("props.target") },
  { name: "rel", type: "string", description: k("props.rel") },
]);

const emitsList = computed<EmitDoc[]>(() => [
  { name: "click", payload: "MouseEvent", description: k("emits.click") },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: k("slots.default") },
  { name: "startIcon", description: k("slots.startIcon") },
  { name: "endIcon", description: k("slots.endIcon") },
  { name: "loadingText", description: k("slots.loadingText") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    import-path="import { PressButton } from 'mood-ui'"
    :description="k('description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            v-model="pgVariant"
            :label="k('controls.variant')"
            :options="[
              { value: 'normal' },
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'text' },
            ]"
          />
          <TbSep />
          <TbDots
            v-model="pgColor"
            :label="k('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbPills
            v-model="pgSize"
            :label="k('controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
          />
          <TbSep />
          <TbPills
            v-model="pgRadius"
            :label="k('controls.radius')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
          />
          <TbSep />
          <TbToggle v-model="pgLoading" :label="k('controls.loading')" />
          <TbToggle v-model="pgDisabled" :label="k('controls.disabled')" />
          <TbToggle v-model="pgFullWidth" :label="k('controls.fullWidth')" />
          <TbToggle v-model="pgGradient" :label="k('controls.gradient')" />
          <TbToggle v-model="pgSkeleton" :label="k('controls.skeleton')" />
        </template>

        <PressButton
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :radius="pgRadius"
          :gradient="pgGradient"
          :loading="pgLoading"
          :disabled="pgDisabled"
          :full-width="pgFullWidth"
          :skeleton="pgSkeleton"
        >
          {{ k("playground.label") }}
        </PressButton>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.variants.title')"
        :description="k('examples.variants.desc')"
        :code="variantsCode"
      >
        <PressButton variant="normal" color="primary">
          {{ k("examples.variants.normal") }}
        </PressButton>
        <PressButton variant="outline" color="primary">
          {{ k("examples.variants.outline") }}
        </PressButton>
        <PressButton variant="ghost" color="primary">
          {{ k("examples.variants.ghost") }}
        </PressButton>
        <PressButton variant="text" color="primary">
          {{ k("examples.variants.text") }}
        </PressButton>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.colors.title')"
        :description="k('examples.colors.desc')"
        :code="colorsCode"
      >
        <PressButton v-for="c in exampleColors" :key="c" :color="c">
          {{ k(`controls.colors.${c}`) }}
        </PressButton>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.sizes.title')"
        :description="k('examples.sizes.desc')"
        :code="sizesCode"
      >
        <PressButton v-for="s in exampleSizes" :key="s" :size="s">
          {{ k(`examples.sizes.${s}`) }}
        </PressButton>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.gradient.title')"
        :description="k('examples.gradient.desc')"
        :code="gradientCode"
      >
        <PressButton gradient color="primary" :start-icon="SparklesIcon">
          {{ k("examples.gradient.label") }}
        </PressButton>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.icons.title')"
        :description="k('examples.icons.desc')"
        :code="iconsCode"
      >
        <PressButton
          :start-icon="SparklesIcon"
          :end-icon="ArrowRightIcon"
          color="primary"
        >
          {{ k("examples.icons.continue") }}
        </PressButton>
        <PressButton
          :icon="Cog6ToothIcon"
          variant="outline"
          icon-only
          :aria-label="k('examples.icons.settings')"
        />
        <PressButton
          :icon="HeartIcon"
          variant="ghost"
          color="danger"
          icon-only
          :aria-label="k('examples.icons.like')"
        />
        <PressButton
          :icon="CheckIcon"
          color="success"
          icon-only
          :aria-label="k('examples.icons.confirm')"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.loading.title')"
        :description="k('examples.loading.desc')"
        :code="loadingCode"
      >
        <PressButton :loading="isSaving" color="primary" @click="triggerSave">
          {{ k("examples.loading.save") }}
        </PressButton>
        <PressButton
          loading
          :loading-text="k('examples.loading.processing')"
          variant="ghost"
          color="primary"
        >
          {{ k("examples.loading.submit") }}
        </PressButton>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.link.title')"
        :description="k('examples.link.desc')"
        :code="linkCode"
      >
        <PressButton
          as="a"
          href="https://mood-ui.com"
          target="_blank"
          rel="noopener"
          variant="outline"
          color="primary"
        >
          {{ k("examples.link.visit") }}
        </PressButton>
        <PressButton as="a" href="https://mood-ui.com" disabled variant="outline">
          {{ k("examples.link.disabled") }}
        </PressButton>
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ k("types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ k("types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
