<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import A11yDoc from "~/components/A11yDoc.vue";
import type { A11yKeyboardRow, A11yAriaRow } from "~/components/A11yDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import { Typography, ModeOrb, SurfaceCard, useColorMode } from "mood-ui";
import type { PropDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbDots from "~/components/toolbar/TbDots.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();
const k = (key: string) => t(`pages.forms.modeOrb.${key}`);

type Color = "default" | "primary" | "success" | "warning" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";

// The color mode only exists in the browser (localStorage + prefers-color-scheme),
// so the server cannot know it. The label renders after mount to avoid a
// hydration mismatch, then tracks the global mode the orb toggles.
const { resolved } = useColorMode();
const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
const themeLabel = computed(() =>
  resolved.value === "dark" ? k("playground.dark") : k("playground.light"),
);

// ── Overview playground state ─────────────────────────────────────────────────
// Size starts undefined so the orb follows the showroom's ModoProvider.
const pgSize = ref<Size | undefined>(undefined);
const pgColor = ref<Color>("default");
const pgDisabled = ref(false);
const pgFixed = ref(false);

function resetPlayground() {
  pgSize.value = undefined;
  pgColor.value = "default";
  pgDisabled.value = false;
  pgFixed.value = false;
}

const colorDots = computed(() => [
  { value: "default", bg: "var(--foreground)", label: k("controls.colors.default") },
  { value: "primary", bg: "var(--primary)", label: k("controls.colors.primary") },
  { value: "success", bg: "var(--color-emerald-500)", label: k("controls.colors.success") },
  { value: "warning", bg: "var(--color-amber-500)", label: k("controls.colors.warning") },
  { value: "danger", bg: "var(--color-red-500)", label: k("controls.colors.danger") },
]);

const exampleColors: Color[] = ["default", "primary", "success", "warning", "danger"];
const corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

const overviewCode = computed(() => {
  const attrs: string[] = [];
  if (pgSize.value) attrs.push(`size="${pgSize.value}"`);
  if (pgColor.value !== "default") attrs.push(`color="${pgColor.value}"`);
  if (pgDisabled.value) attrs.push("disabled");
  if (pgFixed.value) attrs.push("fixed");
  const attrStr = attrs.length ? " " + attrs.join(" ") : "";
  return `<ModeOrb${attrStr} />`;
});

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: k("a11y.kbTab") },
  { keys: ["Space", "Enter"], action: k("a11y.kbActivate") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  { attribute: "aria-label", value: "string", desc: k("a11y.ariaLabel") },
  { attribute: "aria-pressed", value: "true", desc: k("a11y.ariaPressed") },
]);

const a11yFocus = computed<string[]>(() => [k("a11y.focusReducedMotion")]);

// ── Example code strings ──────────────────────────────────────────────────────
const inlineCode = `<script setup lang="ts">
import { ModeOrb, SurfaceCard } from 'mood-ui';
<\/script>

<template>
  <SurfaceCard variant="elevated" class="w-full max-w-md">
    <SurfaceCard.Header class="flex flex-row items-center justify-between gap-4">
      <div>
        <SurfaceCard.Title>Appearance</SurfaceCard.Title>
        <SurfaceCard.Subtitle>Click the sphere to switch the theme</SurfaceCard.Subtitle>
      </div>
      <ModeOrb />
    </SurfaceCard.Header>
  </SurfaceCard>
</template>`;

const cornersCode = `<script setup lang="ts">
import { ModeOrb, SurfaceCard } from 'mood-ui';

const positions = ['Top left', 'Top right', 'Bottom left', 'Bottom right'];
<\/script>

<template>
  <div class="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
    <SurfaceCard v-for="pos in positions" :key="pos" variant="elevated">
      <SurfaceCard.Body class="flex items-center justify-between gap-3">
        <span class="text-sm font-medium">{{ pos }}</span>
        <ModeOrb />
      </SurfaceCard.Body>
    </SurfaceCard>
  </div>
</template>`;

const colorsCode = `<script setup lang="ts">
import { ModeOrb } from 'mood-ui';
<\/script>

<template>
  <ModeOrb color="default" />
  <ModeOrb color="primary" />
  <ModeOrb color="success" />
  <ModeOrb color="warning" />
  <ModeOrb color="danger" />
</template>`;

const fixedCode = `<script setup lang="ts">
import { ModeOrb } from 'mood-ui';
<\/script>

<template>
  <!-- Pinned to the bottom-right corner of the viewport -->
  <ModeOrb fixed aria-label="Switch color theme" />
</template>`;

const typesCode = `export interface ModeOrbProps {
  fixed?: boolean;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  ariaLabel?: string;
}`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "fixed",
    type: "boolean",
    default: "false",
    description: k("props.fixed"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    default: "ModoProvider",
    description: k("props.size"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
    default: "'default'",
    description: k("props.color"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
  },
  { name: "ariaLabel", type: "string", description: k("props.ariaLabel") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    :category="k('category')"
    :description="k('description')"
    import-path="import { ModeOrb } from 'mood-ui'"
    :props-list="propsList"
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
          <TbDots
            v-model="pgColor"
            :label="k('controls.color')"
            :options="colorDots"
          />
          <TbSep />
          <TbToggle v-model="pgDisabled" :label="k('controls.disabled')" />
          <TbToggle v-model="pgFixed" :label="k('controls.fixed')" />
        </template>

        <SurfaceCard variant="elevated" class="w-full max-w-sm">
          <SurfaceCard.Body class="flex items-center justify-between gap-4">
            <div class="text-left">
              <div class="text-sm font-semibold text-foreground">
                {{ k("playground.theme") }}:
                <span class="inline-block min-w-[3.5rem] text-primary">
                  <template v-if="mounted">{{ themeLabel }}</template>
                </span>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ k("playground.hint") }}
              </div>
            </div>
            <ModeOrb
              :size="pgSize"
              :color="pgColor"
              :disabled="pgDisabled"
              :fixed="pgFixed"
            />
          </SurfaceCard.Body>
        </SurfaceCard>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.inline.title')"
        :description="k('examples.inline.desc')"
        :code="inlineCode"
      >
        <SurfaceCard variant="elevated" class="w-full max-w-md">
          <SurfaceCard.Header
            class="flex flex-row items-center justify-between gap-4"
          >
            <div>
              <SurfaceCard.Title>
                {{ k("examples.inline.cardTitle") }}
              </SurfaceCard.Title>
              <SurfaceCard.Subtitle>
                {{ k("examples.inline.cardSubtitle") }}
              </SurfaceCard.Subtitle>
            </div>
            <ModeOrb />
          </SurfaceCard.Header>
        </SurfaceCard>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.corners.title')"
        :description="k('examples.corners.desc')"
        :code="cornersCode"
      >
        <div class="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
          <SurfaceCard v-for="pos in corners" :key="pos" variant="elevated">
            <SurfaceCard.Body class="flex items-center justify-between gap-3">
              <span class="text-sm font-medium text-foreground">
                {{ k(`examples.corners.${pos}`) }}
              </span>
              <ModeOrb />
            </SurfaceCard.Body>
          </SurfaceCard>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.colors.title')"
        :description="k('examples.colors.desc')"
        :code="colorsCode"
      >
        <ModeOrb
          v-for="c in exampleColors"
          :key="c"
          :color="c"
        />
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.fixed.title')"
        :description="k('examples.fixed.desc')"
        :code="fixedCode"
      >
        <ModeOrb />
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
