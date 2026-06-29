<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import { Typography, Button } from "mood-ui";
import { HeartIcon, ArrowRightIcon } from "@heroicons/vue/24/outline";
import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();

useSeoMeta({
  title: () => t("pages.forms.button.title"),
  description: () => t("pages.forms.button.description"),
  ogTitle: () => `${t("pages.forms.button.title")} · mood-ui`,
  ogDescription: () => t("pages.forms.button.description"),
});

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Space", "Enter"], action: t("pages.forms.button.a11y.kbActivate") },
  { keys: ["Tab"], action: t("pages.forms.button.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.forms.button.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "type",
    value: '"button"',
    desc: t("pages.forms.button.a11y.ariaType"),
  },
  {
    attribute: "aria-disabled",
    value: "true",
    desc: t("pages.forms.button.a11y.ariaDisabled"),
  },
  {
    attribute: "aria-busy",
    value: "true",
    desc: t("pages.forms.button.a11y.ariaBusy"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.forms.button.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.forms.button.a11y.focusNative"),
  t("pages.forms.button.a11y.focusDisabled"),
  t("pages.forms.button.a11y.focusRing"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"normal" | "outline" | "ghost" | "text">("normal");
const pgColor = ref<"default" | "primary" | "danger" | "success" | "warning">(
  "primary",
);
const pgSize = ref<"xsmall" | "small" | "medium" | "large">("medium");
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");
const pgLoading = ref(false);
const pgDisabled = ref(false);
const pgFullWidth = ref(false);
const pgGradient = ref(false);
const pgSkeleton = ref(false);

function resetPlayground() {
  pgVariant.value = "normal";
  pgColor.value = "primary";
  pgSize.value = "medium";
  pgRadius.value = "medium";
  pgLoading.value = false;
  pgDisabled.value = false;
  pgFullWidth.value = false;
  pgGradient.value = false;
  pgSkeleton.value = false;
}

const colorDots = [
  { value: "default" as const, bg: "var(--color-slate-400)", label: "Default" },
  { value: "primary" as const, bg: "var(--primary)", label: "Primary" },
  {
    value: "success" as const,
    bg: "var(--color-emerald-500)",
    label: "Success",
  },
  { value: "warning" as const, bg: "var(--color-amber-500)", label: "Warning" },
  { value: "danger" as const, bg: "var(--color-red-500)", label: "Danger" },
];

// Reactive code — only non-default attrs appear
const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "normal") parts.push(`variant="${pgVariant.value}"`);
  if (pgColor.value !== "default") parts.push(`color="${pgColor.value}"`);
  if (pgSize.value !== "medium") parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  if (pgLoading.value) parts.push(':loading="true"');
  if (pgDisabled.value) parts.push(':disabled="true"');
  if (pgFullWidth.value) parts.push(':full-width="true"');
  if (pgGradient.value) parts.push(':gradient="true"');
  if (pgSkeleton.value) parts.push(':skeleton="true"');

  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Button${attrs}>Click me</Button>`;
});

// ── Example code strings (self-contained) ─────────────────────────────────────
const variantsCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button variant="normal"  color="primary">Normal</Button>
  <Button variant="outline" color="primary">Outline</Button>
  <Button variant="ghost"   color="primary">Ghost</Button>
  <Button variant="text"    color="primary">Text</Button>
</template>`;

const colorsCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button color="default">Default</Button>
  <Button color="primary">Primary</Button>
  <Button color="success">Success</Button>
  <Button color="warning">Warning</Button>
  <Button color="danger">Danger</Button>
</template>`;

const sizesCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button size="xs"     color="primary">XS</Button>
  <Button size="small"  color="primary">Small</Button>
  <Button size="medium" color="primary">Medium</Button>
  <Button size="large"  color="primary">Large</Button>
</template>`;

const iconsCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
import { HeartIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
<\/script>

<template>
  <Button :icon="HeartIcon"      color="danger"   variant="outline">Like</Button>
  <Button :icon="ArrowRightIcon" icon-position="right" color="primary">Continue</Button>
  <Button :icon="HeartIcon"      color="primary" ariaLabel="Like" />
</template>`;

const statesCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button loading                          color="primary">Saving…</Button>
  <Button loading loading-text="Processing" color="primary">Submit</Button>
  <Button disabled                          color="primary">Disabled</Button>
</template>`;

const gradientCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button gradient color="primary">Primary gradient</Button>
  <Button gradient color="success">Success gradient</Button>
  <Button gradient color="danger">Danger gradient</Button>
</template>`;

const radiusCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button radius="none"  color="primary">None</Button>
  <Button radius="small" color="primary">Small</Button>
  <Button radius="medium" color="primary">Medium</Button>
  <Button radius="large"  color="primary">Large</Button>
  <Button radius="full"   color="primary">Full</Button>
</template>`;

const linkCode = `<script setup lang="ts">
import { Button } from 'mood-ui';
<\/script>

<template>
  <Button as="a" href="https://mood-ui.com" target="_blank" color="primary">
    Open site
  </Button>
</template>`;

const skeletonCode = `<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'mood-ui';

const isLoading = ref(true);
<\/script>

<template>
  <Button :skeleton="isLoading" color="primary" size="medium">
    Save changes
  </Button>
</template>`;

const typesCode = `export interface Button {
  label?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: 'normal' | 'outline' | 'ghost' | 'text';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  gradient?: boolean;
  size?: 'xs' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  fullWidth?: boolean;
  icon?: Component;
  iconPosition?: 'left' | 'right';
  ariaLabel?: string;
  skeleton?: boolean;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'normal' | 'outline' | 'ghost' | 'text'",
    default: "'normal'",
    description: t("pages.forms.button.props.variant"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: t("pages.forms.button.props.color"),
  },
  {
    name: "size",
    type: "'xs' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.forms.button.props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    default: "'medium'",
    description: t("pages.forms.button.props.radius"),
  },
  {
    name: "label",
    type: "string",
    description: t("pages.forms.button.props.label"),
  },
  {
    name: "type",
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: t("pages.forms.button.props.type"),
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: t("pages.forms.button.props.loading"),
  },
  {
    name: "loadingText",
    type: "string",
    description: t("pages.forms.button.props.loadingText"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: t("pages.forms.button.props.disabled"),
  },
  {
    name: "icon",
    type: "Component",
    description: t("pages.forms.button.props.icon"),
  },
  {
    name: "iconPosition",
    type: "'left' | 'right'",
    default: "'left'",
    description: t("pages.forms.button.props.iconPosition"),
  },
  {
    name: "fullWidth",
    type: "boolean",
    default: "false",
    description: t("pages.forms.button.props.fullWidth"),
  },
  {
    name: "gradient",
    type: "boolean",
    default: "false",
    description: t("pages.forms.button.props.gradient"),
  },
  {
    name: "skeleton",
    type: "boolean",
    default: "false",
    description: t("pages.forms.button.props.skeleton"),
  },
  {
    name: "as",
    type: "string | Component",
    default: "'button'",
    description: t("pages.forms.button.props.as"),
  },
  {
    name: "href",
    type: "string",
    description: t("pages.forms.button.props.href"),
  },
  {
    name: "target",
    type: "string",
    description: t("pages.forms.button.props.target"),
  },
  {
    name: "rel",
    type: "string",
    description: t("pages.forms.button.props.rel"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: t("pages.forms.button.props.ariaLabel"),
  },
]);

const emitsList = computed<EmitDoc[]>(() => [
  {
    name: "click",
    payload: "MouseEvent",
    description: t("pages.forms.button.emits.click"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.forms.button.slots.default") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.button.title')"
    :category="t('pages.forms.button.category')"
    import-path="import { Button } from 'mood-ui'"
    :description="t('pages.forms.button.description')"
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
            label="Variant"
            :options="[
              { value: 'normal' },
              { value: 'outline' },
              { value: 'ghost' },
              { value: 'text' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbDots label="Color" :options="colorDots" v-model="pgColor" />
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
          <TbPills
            label="Radius"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
              { value: 'full' },
            ]"
            v-model="pgRadius"
          />
          <TbSep />
          <TbToggle label="Loading" v-model="pgLoading" />
          <TbToggle label="Disabled" v-model="pgDisabled" />
          <TbToggle label="Full width" v-model="pgFullWidth" />
          <TbToggle label="Gradient" v-model="pgGradient" />
          <TbToggle label="Skeleton" v-model="pgSkeleton" />
        </template>

        <Button
          :variant="pgVariant"
          :color="pgColor"
          :size="pgSize"
          :radius="pgRadius"
          :loading="pgLoading"
          :disabled="pgDisabled"
          :full-width="pgFullWidth"
          :gradient="pgGradient"
          :skeleton="pgSkeleton"
        >
          Click me
        </Button>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.button.examples.variants.title')"
        :description="t('pages.forms.button.examples.variants.desc')"
        :code="variantsCode"
      >
        <Button variant="normal" color="primary">Normal</Button>
        <Button variant="outline" color="primary">Outline</Button>
        <Button variant="ghost" color="primary">Ghost</Button>
        <Button variant="text" color="primary">Text</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.colors.title')"
        :description="t('pages.forms.button.examples.colors.desc')"
        :code="colorsCode"
      >
        <Button color="default">Default</Button>
        <Button color="primary">Primary</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button color="danger">Danger</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.sizes.title')"
        :description="t('pages.forms.button.examples.sizes.desc')"
        :code="sizesCode"
      >
        <Button size="xs" color="primary">XS</Button>
        <Button size="small" color="primary">Small</Button>
        <Button size="medium" color="primary">Medium</Button>
        <Button size="large" color="primary">Large</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.icons.title')"
        :description="t('pages.forms.button.examples.icons.desc')"
        :code="iconsCode"
      >
        <Button :icon="HeartIcon" color="danger" variant="outline">Like</Button>
        <Button :icon="ArrowRightIcon" icon-position="right" color="primary"
          >Continue</Button
        >
        <Button :icon="HeartIcon" color="primary" ariaLabel="Like" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.states.title')"
        :description="t('pages.forms.button.examples.states.desc')"
        :code="statesCode"
      >
        <Button loading color="primary">Saving…</Button>
        <Button loading loading-text="Processing" color="primary"
          >Submit</Button
        >
        <Button disabled color="primary">Disabled</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.gradient.title')"
        :description="t('pages.forms.button.examples.gradient.desc')"
        :code="gradientCode"
      >
        <Button gradient color="primary">Primary gradient</Button>
        <Button gradient color="success">Success gradient</Button>
        <Button gradient color="danger">Danger gradient</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.radius.title')"
        :description="t('pages.forms.button.examples.radius.desc')"
        :code="radiusCode"
      >
        <Button radius="none" color="primary">None</Button>
        <Button radius="small" color="primary">Small</Button>
        <Button radius="medium" color="primary">Medium</Button>
        <Button radius="large" color="primary">Large</Button>
        <Button radius="full" color="primary">Full</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.link.title')"
        :description="t('pages.forms.button.examples.link.desc')"
        :code="linkCode"
      >
        <Button
          as="a"
          href="https://mood-ui.com"
          target="_blank"
          color="primary"
        >
          Open site
        </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.button.examples.skeleton.title')"
        :description="t('pages.forms.button.examples.skeleton.desc')"
        :code="skeletonCode"
      >
        <Button :skeleton="true" color="primary" size="medium"
          >Save changes</Button
        >
        <Button :skeleton="false" color="primary" size="medium"
          >Save changes</Button
        >
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
        {{ t("pages.forms.button.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.forms.button.types.desc") }}
      </Typography>

      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
