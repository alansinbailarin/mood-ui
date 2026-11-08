<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Badge,
  PressButton,
  SurfaceCard,
  Switch,
  Typography,
} from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import CodePreview from "~/components/CodePreview.vue";
import type { PropDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/vue/20/solid";

const { t } = useI18n();

const k = (key: string) => t(`pages.dataDisplay.surfaceCard.${key}`);

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: k("a11y.kbTab") },
  { keys: ["Shift+Tab"], action: k("a11y.kbShiftTab") },
  { keys: ["Enter", "Space"], action: k("a11y.kbActivate") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "<article>",
    value: "root",
    desc: k("a11y.ariaArticle"),
  },
  {
    attribute: "aria-disabled",
    value: '"true"',
    desc: k("a11y.ariaDisabled"),
  },
  {
    attribute: "aria-label",
    value: "string",
    desc: k("a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  k("a11y.focusStretched"),
  k("a11y.focusMedia"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
type Size = "xsmall" | "small" | "medium" | "large";
type Radius = "none" | "small" | "medium" | "large" | "full";

const pgVariant = ref<"outline" | "elevated" | "soft">("elevated");
// `undefined` = follow the ModoProvider (showroom theme controls).
const pgSize = ref<Size | undefined>(undefined);
const pgRadius = ref<Radius | undefined>(undefined);
const pgPadding = ref<"default" | "none">("default");
const pgFramed = ref(true);
const pgInteractive = ref(false);
const pgDisabled = ref(false);

function resetPlayground() {
  pgVariant.value = "elevated";
  pgSize.value = undefined;
  pgRadius.value = undefined;
  pgPadding.value = "default";
  pgFramed.value = true;
  pgInteractive.value = false;
  pgDisabled.value = false;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "outline") parts.push(`variant="${pgVariant.value}"`);
  if (pgSize.value) parts.push(`size="${pgSize.value}"`);
  if (pgRadius.value) parts.push(`radius="${pgRadius.value}"`);
  if (pgPadding.value !== "default") parts.push(`padding="${pgPadding.value}"`);
  if (!pgFramed.value) parts.push(':framed="false"');
  if (pgInteractive.value) parts.push('as="button"');
  if (pgDisabled.value) parts.push("disabled");
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<SurfaceCard${attrs} class="w-80">
  <SurfaceCard.Header as="hgroup">
    <SurfaceCard.Title>${k("demo.overview.title")}</SurfaceCard.Title>
    <SurfaceCard.Subtitle>${k("demo.overview.subtitle")}</SurfaceCard.Subtitle>
  </SurfaceCard.Header>
  <SurfaceCard.Separator />
  <SurfaceCard.Body>
    ${k("demo.overview.body")}
  </SurfaceCard.Body>
</SurfaceCard>`;
});

// ── Demo state ────────────────────────────────────────────────────────────────
const sizes: Size[] = ["xsmall", "small", "medium", "large"];
const pushNotifications = ref(true);
const weeklyDigest = ref(false);
const actionClicks = ref(0);
const isSaved = ref(false);

const editorialCoverSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#312e81" />
        </linearGradient>
        <radialGradient id="glow" cx="72%" cy="28%" r="55%">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.55" />
          <stop offset="55%" stop-color="#818cf8" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="450" fill="url(#bg)" />
      <rect width="800" height="450" fill="url(#glow)" />
      <g fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1.5">
        <rect x="96" y="74" width="250" height="156" rx="18" fill="rgba(255,255,255,0.04)" />
        <rect x="378" y="114" width="326" height="204" rx="22" fill="rgba(255,255,255,0.06)" />
      </g>
    </svg>
  `);

// ── Example code strings ──────────────────────────────────────────────────────
const variantsCode = `<script setup lang="ts">
import { SurfaceCard } from 'mood-ui';
<\/script>

<template>
  <SurfaceCard variant="outline">
    <SurfaceCard.Header as="hgroup">
      <SurfaceCard.Title>Outline</SurfaceCard.Title>
      <SurfaceCard.Subtitle>Hairline border</SurfaceCard.Subtitle>
    </SurfaceCard.Header>
    <SurfaceCard.Body>Card surface with a 1px border and no shadow.</SurfaceCard.Body>
  </SurfaceCard>

  <SurfaceCard variant="elevated">
    <SurfaceCard.Header as="hgroup">
      <SurfaceCard.Title>Elevated</SurfaceCard.Title>
      <SurfaceCard.Subtitle>Border + shadow</SurfaceCard.Subtitle>
    </SurfaceCard.Header>
    <SurfaceCard.Body>Raised plane that lifts further on hover when interactive.</SurfaceCard.Body>
  </SurfaceCard>

  <SurfaceCard variant="soft">
    <SurfaceCard.Header as="hgroup">
      <SurfaceCard.Title>Soft</SurfaceCard.Title>
      <SurfaceCard.Subtitle>Muted fill</SurfaceCard.Subtitle>
    </SurfaceCard.Header>
    <SurfaceCard.Body>Uniform muted surface for dense panels and settings.</SurfaceCard.Body>
  </SurfaceCard>
</template>`;

const sizesCode = `<script setup lang="ts">
import { SurfaceCard } from 'mood-ui';
<\/script>

<template>
  <!-- Omit size to follow ModoProvider -->
  <SurfaceCard v-for="size in ['xsmall', 'small', 'medium', 'large']" :key="size" :size="size">
    <SurfaceCard.Header as="hgroup">
      <SurfaceCard.Title>{{ size }}</SurfaceCard.Title>
      <SurfaceCard.Subtitle>Padding, gaps and type scale</SurfaceCard.Subtitle>
    </SurfaceCard.Header>
    <SurfaceCard.Body>Every section reads its spacing from size.</SurfaceCard.Body>
  </SurfaceCard>

  <!-- padding="none" zeroes every section -->
  <SurfaceCard padding="none">...</SurfaceCard>
</template>`;

const editorialCode = `<script setup lang="ts">
import { SurfaceCard, PressButton, Badge } from 'mood-ui';
import { ArrowRightIcon } from '@heroicons/vue/20/solid';
<\/script>

<template>
  <SurfaceCard variant="elevated" class="w-80">
    <SurfaceCard.Media src="/cover.jpg" alt="Abstract cover" :ratio="16 / 9" />
    <SurfaceCard.Header as="hgroup">
      <SurfaceCard.Title>Design tokens at scale</SurfaceCard.Title>
      <SurfaceCard.Subtitle>5 min read · Engineering</SurfaceCard.Subtitle>
    </SurfaceCard.Header>
    <SurfaceCard.Body>
      How semantic OKLCH variables keep light and dark modes coherent.
    </SurfaceCard.Body>
    <SurfaceCard.Footer align="between">
      <Badge color="primary" variant="subtle">New</Badge>
      <PressButton size="small" variant="ghost" color="primary" :end-icon="ArrowRightIcon">
        Read
      </PressButton>
    </SurfaceCard.Footer>
  </SurfaceCard>
</template>`;

const groupedCode = `<script setup lang="ts">
import { ref } from 'vue';
import { SurfaceCard, Switch, PressButton } from 'mood-ui';

const pushNotifications = ref(true);
const weeklyDigest = ref(false);
<\/script>

<template>
  <SurfaceCard variant="elevated" class="w-full max-w-md">
    <SurfaceCard.Header as="hgroup">
      <SurfaceCard.Title>Notifications</SurfaceCard.Title>
      <SurfaceCard.Subtitle>Choose how and when we reach you.</SurfaceCard.Subtitle>
    </SurfaceCard.Header>
    <SurfaceCard.Separator />
    <SurfaceCard.Body surface="subtle">
      <div class="flex items-center justify-between gap-4">
        <span>Push notifications</span>
        <Switch v-model="pushNotifications" />
      </div>
    </SurfaceCard.Body>
    <SurfaceCard.Separator inset="content" />
    <SurfaceCard.Body surface="subtle">
      <div class="flex items-center justify-between gap-4">
        <span>Weekly digest</span>
        <Switch v-model="weeklyDigest" />
      </div>
    </SurfaceCard.Body>
    <SurfaceCard.Separator />
    <SurfaceCard.Footer align="between">
      <span class="text-xs text-muted-foreground">Synced automatically</span>
      <PressButton size="small" variant="outline">Done</PressButton>
    </SurfaceCard.Footer>
  </SurfaceCard>
</template>`;

const interactiveCode = `<script setup lang="ts">
import { ref } from 'vue';
import { SurfaceCard, PressButton } from 'mood-ui';

const clicks = ref(0);
<\/script>

<template>
  <!-- Whole card as a tactile button -->
  <SurfaceCard as="button" variant="elevated" @click="clicks++">
    <SurfaceCard.Header>
      <SurfaceCard.Title>Direct action</SurfaceCard.Title>
    </SurfaceCard.Header>
    <SurfaceCard.Body>Press and hold, then release for the spring rebound.</SurfaceCard.Body>
  </SurfaceCard>

  <!-- Stretched-link card with an independent footer button -->
  <SurfaceCard variant="outline">
    <SurfaceCard.Header>
      <SurfaceCard.Title href="/articles/tokens" stretched-link>
        Stretched link + action
      </SurfaceCard.Title>
    </SurfaceCard.Header>
    <SurfaceCard.Body>The whole card follows the title link.</SurfaceCard.Body>
    <SurfaceCard.Footer>
      <PressButton size="small" variant="ghost">Bookmark</PressButton>
    </SurfaceCard.Footer>
  </SurfaceCard>
</template>`;

const typesCode = `import type { ModoRadius, ModoSize } from 'mood-ui';

export interface SurfaceCard {
  variant?: 'outline' | 'elevated' | 'soft' | 'outlined' | 'filled'; // default 'outline'
  padding?: 'default' | 'none';  // default 'default' (follows size)
  size?: ModoSize;               // inherits ModoProvider
  radius?: ModoRadius;           // inherits ModoProvider
  framed?: boolean;              // default true
  as?: 'article' | 'div' | 'section' | 'button' | 'a';
  interactive?: boolean;
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export interface SurfaceCardSectionProps {      // Header, Body, Footer
  surface?: 'none' | 'subtle';
  padding?: 'default' | 'none';
}
export interface SurfaceCardFooterProps extends SurfaceCardSectionProps {
  as?: 'footer' | 'div';
  align?: 'end' | 'between' | 'start' | 'stretch';
}
export interface SurfaceCardSeparatorProps { inset?: 'none' | 'content' }
export interface SurfaceCardMediaProps {
  src?: string;
  alt?: string;
  ratio?: number | string;       // default 16 / 9
  imgProps?: Omit<ImgHTMLAttributes, 'src' | 'alt'>;
}
export interface SurfaceCardTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';  // default 'h3'
  href?: string;
  target?: string;
  rel?: string;
  stretchedLink?: boolean;
}

// Compound parts (SurfaceCard.* or flat named imports):
// SurfaceCard.Media, .Header, .Title, .Subtitle, .Body, .Footer, .Separator`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'outline' | 'elevated' | 'soft' | 'outlined' | 'filled'",
    default: "'outline'",
    description: k("props.variant"),
  },
  {
    name: "size",
    type: "'xsmall' | 'small' | 'medium' | 'large'",
    description: k("props.size"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: k("props.radius"),
  },
  {
    name: "padding",
    type: "'default' | 'none'",
    default: "'default'",
    description: k("props.padding"),
  },
  {
    name: "framed",
    type: "boolean",
    default: "true",
    description: k("props.framed"),
  },
  {
    name: "as",
    type: "'article' | 'div' | 'section' | 'button' | 'a'",
    default: "'article'",
    description: k("props.as"),
  },
  {
    name: "interactive",
    type: "boolean",
    description: k("props.interactive"),
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: k("props.disabled"),
  },
  {
    name: "href / target / rel",
    type: "string",
    description: k("props.href"),
  },
  {
    name: "type",
    type: "'button' | 'submit' | 'reset'",
    default: "'button'",
    description: k("props.type"),
  },
  {
    name: "ariaLabel",
    type: "string",
    description: k("props.ariaLabel"),
  },
  {
    name: "surface (Header / Body / Footer)",
    type: "'none' | 'subtle'",
    default: "'none'",
    description: k("props.sectionSurface"),
  },
  {
    name: "padding (Header / Body / Footer)",
    type: "'default' | 'none'",
    default: "'default'",
    description: k("props.sectionPadding"),
  },
  {
    name: "align (SurfaceCard.Footer)",
    type: "'end' | 'between' | 'start' | 'stretch'",
    default: "'end'",
    description: k("props.footerAlign"),
  },
  {
    name: "inset (SurfaceCard.Separator)",
    type: "'none' | 'content'",
    default: "'none'",
    description: k("props.separatorInset"),
  },
  {
    name: "src / alt / ratio (SurfaceCard.Media)",
    type: "string / string / number | string",
    default: "ratio: 16 / 9",
    description: k("props.media"),
  },
  {
    name: "stretchedLink (SurfaceCard.Title)",
    type: "boolean",
    default: "false",
    description: k("props.stretchedLink"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: k("slots.default") },
  { name: "default (SurfaceCard.Media)", description: k("slots.media") },
]);
</script>

<template>
  <ComponentDoc
    :title="k('title')"
    category="Data Display"
    import-path="import { SurfaceCard } from 'mood-ui'"
    :description="k('description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="280px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('controls.variant')"
            :options="[
              { value: 'outline' },
              { value: 'elevated' },
              { value: 'soft' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('controls.size')"
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
            :label="t('controls.radius')"
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
          <TbPills
            :label="t('controls.padding')"
            :options="[{ value: 'default' }, { value: 'none' }]"
            v-model="pgPadding"
          />
          <TbSep />
          <TbToggle :label="k('controls.framed')" v-model="pgFramed" />
          <TbToggle
            :label="k('controls.interactive')"
            v-model="pgInteractive"
          />
          <TbToggle :label="k('controls.disabled')" v-model="pgDisabled" />
        </template>

        <SurfaceCard
          :variant="pgVariant"
          :size="pgSize"
          :radius="pgRadius"
          :padding="pgPadding"
          :framed="pgFramed"
          :as="pgInteractive ? 'button' : 'article'"
          :disabled="pgDisabled"
          class="w-80"
        >
          <SurfaceCard.Header as="hgroup">
            <SurfaceCard.Title>{{ k("demo.overview.title") }}</SurfaceCard.Title>
            <SurfaceCard.Subtitle>
              {{ k("demo.overview.subtitle") }}
            </SurfaceCard.Subtitle>
          </SurfaceCard.Header>
          <SurfaceCard.Separator />
          <SurfaceCard.Body>
            {{ k("demo.overview.body") }}
          </SurfaceCard.Body>
        </SurfaceCard>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="k('examples.variants.title')"
        :description="k('examples.variants.desc')"
        :code="variantsCode"
      >
        <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <SurfaceCard
            v-for="variant in (['outline', 'elevated', 'soft'] as const)"
            :key="variant"
            :variant="variant"
          >
            <SurfaceCard.Header as="hgroup">
              <SurfaceCard.Title>
                {{ k(`demo.variants.${variant}.title`) }}
              </SurfaceCard.Title>
              <SurfaceCard.Subtitle>
                {{ k(`demo.variants.${variant}.subtitle`) }}
              </SurfaceCard.Subtitle>
            </SurfaceCard.Header>
            <SurfaceCard.Body>
              {{ k(`demo.variants.${variant}.body`) }}
            </SurfaceCard.Body>
          </SurfaceCard>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.sizes.title')"
        :description="k('examples.sizes.desc')"
        :code="sizesCode"
      >
        <div class="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-2">
          <SurfaceCard
            v-for="size in sizes"
            :key="size"
            :size="size"
            variant="elevated"
          >
            <SurfaceCard.Header as="hgroup">
              <SurfaceCard.Title>{{ size }}</SurfaceCard.Title>
              <SurfaceCard.Subtitle>
                {{ k("demo.sizes.subtitle") }}
              </SurfaceCard.Subtitle>
            </SurfaceCard.Header>
            <SurfaceCard.Body>{{ k("demo.sizes.body") }}</SurfaceCard.Body>
          </SurfaceCard>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.editorial.title')"
        :description="k('examples.editorial.desc')"
        :code="editorialCode"
      >
        <SurfaceCard variant="elevated" class="w-80">
          <SurfaceCard.Media
            :src="editorialCoverSvg"
            :alt="k('demo.editorial.alt')"
            :ratio="16 / 9"
          />
          <SurfaceCard.Header as="hgroup">
            <SurfaceCard.Title>{{ k("demo.editorial.title") }}</SurfaceCard.Title>
            <SurfaceCard.Subtitle>
              {{ k("demo.editorial.subtitle") }}
            </SurfaceCard.Subtitle>
          </SurfaceCard.Header>
          <SurfaceCard.Body>{{ k("demo.editorial.body") }}</SurfaceCard.Body>
          <SurfaceCard.Footer align="between">
            <Badge color="primary" variant="subtle">
              {{ k("demo.editorial.badge") }}
            </Badge>
            <PressButton
              size="small"
              variant="ghost"
              color="primary"
              :end-icon="ArrowRightIcon"
            >
              {{ k("demo.editorial.action") }}
            </PressButton>
          </SurfaceCard.Footer>
        </SurfaceCard>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.grouped.title')"
        :description="k('examples.grouped.desc')"
        :code="groupedCode"
      >
        <SurfaceCard variant="elevated" class="w-full max-w-md">
          <SurfaceCard.Header as="hgroup">
            <SurfaceCard.Title>{{ k("demo.grouped.title") }}</SurfaceCard.Title>
            <SurfaceCard.Subtitle>
              {{ k("demo.grouped.subtitle") }}
            </SurfaceCard.Subtitle>
          </SurfaceCard.Header>
          <SurfaceCard.Separator />
          <SurfaceCard.Body surface="subtle">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="font-medium text-foreground">
                  {{ k("demo.grouped.pushTitle") }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ k("demo.grouped.pushDesc") }}
                </div>
              </div>
              <Switch
                v-model="pushNotifications"
                :aria-label="k('demo.grouped.pushTitle')"
              />
            </div>
          </SurfaceCard.Body>
          <SurfaceCard.Separator inset="content" />
          <SurfaceCard.Body surface="subtle">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="font-medium text-foreground">
                  {{ k("demo.grouped.digestTitle") }}
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ k("demo.grouped.digestDesc") }}
                </div>
              </div>
              <Switch
                v-model="weeklyDigest"
                :aria-label="k('demo.grouped.digestTitle')"
              />
            </div>
          </SurfaceCard.Body>
          <SurfaceCard.Separator />
          <SurfaceCard.Footer align="between">
            <span class="text-xs text-muted-foreground">
              {{ k("demo.grouped.synced") }}
            </span>
            <PressButton size="small" variant="outline" :start-icon="CheckIcon">
              {{ k("demo.grouped.done") }}
            </PressButton>
          </SurfaceCard.Footer>
        </SurfaceCard>
      </ComponentPreview>

      <ComponentPreview
        :title="k('examples.interactive.title')"
        :description="k('examples.interactive.desc')"
        :code="interactiveCode"
      >
        <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <SurfaceCard as="button" variant="elevated" @click="actionClicks++">
            <SurfaceCard.Header as="hgroup">
              <SurfaceCard.Title>
                <span class="inline-flex items-center gap-1.5">
                  <SparklesIcon class="h-4 w-4 text-primary" />
                  {{ k("demo.interactive.buttonTitle") }}
                </span>
              </SurfaceCard.Title>
              <SurfaceCard.Subtitle>as="button"</SurfaceCard.Subtitle>
            </SurfaceCard.Header>
            <SurfaceCard.Body>
              {{ k("demo.interactive.buttonBody") }}
            </SurfaceCard.Body>
            <SurfaceCard.Footer align="between">
              <span class="text-xs text-muted-foreground">
                {{ k("demo.interactive.activations") }}
              </span>
              <Badge color="primary" variant="subtle">{{ actionClicks }}</Badge>
            </SurfaceCard.Footer>
          </SurfaceCard>

          <SurfaceCard variant="outline">
            <SurfaceCard.Header as="hgroup">
              <SurfaceCard.Title href="#examples" stretched-link>
                <span class="inline-flex items-center gap-1.5">
                  {{ k("demo.interactive.linkTitle") }}
                  <ArrowTopRightOnSquareIcon
                    class="h-4 w-4 text-muted-foreground"
                  />
                </span>
              </SurfaceCard.Title>
              <SurfaceCard.Subtitle>
                {{ k("demo.interactive.linkSubtitle") }}
              </SurfaceCard.Subtitle>
            </SurfaceCard.Header>
            <SurfaceCard.Body>
              {{ k("demo.interactive.linkBody") }}
            </SurfaceCard.Body>
            <SurfaceCard.Footer align="end">
              <PressButton
                size="small"
                :variant="isSaved ? 'normal' : 'ghost'"
                :color="isSaved ? 'primary' : 'default'"
                :start-icon="BookmarkIcon"
                @click="isSaved = !isSaved"
              >
                {{
                  isSaved
                    ? k("demo.interactive.saved")
                    : k("demo.interactive.bookmark")
                }}
              </PressButton>
            </SurfaceCard.Footer>
          </SurfaceCard>
        </div>
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
