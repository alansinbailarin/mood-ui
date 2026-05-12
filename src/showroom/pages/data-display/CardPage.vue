<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Card from "../../../components/data-display/Card.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import type { PropDoc, SlotDoc } from "../../types";
import A11yDoc from "../../components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "../../components/A11yDoc.vue";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.data-display.card.a11y.kbTab") },
  { keys: ["Shift+Tab"], action: t("pages.data-display.card.a11y.kbShiftTab") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "aria-label",
    value: "string",
    desc: t("pages.data-display.card.a11y.ariaLabel"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.data-display.card.a11y.focusNative"),
]);

// ── Overview playground state ─────────────────────────────────────────────────
const pgVariant = ref<"elevated" | "outlined" | "filled">("outlined");
const pgPadding = ref<"none" | "small" | "medium" | "large">("medium");
const pgRadius = ref<"none" | "small" | "medium" | "large" | "full">("medium");
const pgHover = ref(false);
const pgClickable = ref(false);
const pgDivided = ref(true);

function resetPlayground() {
  pgVariant.value = "outlined";
  pgPadding.value = "medium";
  pgRadius.value = "medium";
  pgHover.value = false;
  pgClickable.value = false;
  pgDivided.value = true;
}

const overviewCode = computed(() => {
  const parts: string[] = [];
  if (pgVariant.value !== "outlined")
    parts.push(`variant="${pgVariant.value}"`);
  if (pgPadding.value !== "medium") parts.push(`padding="${pgPadding.value}"`);
  if (pgRadius.value !== "medium") parts.push(`radius="${pgRadius.value}"`);
  if (pgHover.value) parts.push(':hoverable="true"');
  if (pgClickable.value) parts.push(':clickable="true"');
  if (!pgDivided.value) parts.push(':divided="false"');
  const attrs = parts.length ? " " + parts.join(" ") : "";
  return `<Card${attrs} class="w-80">\n  Card content goes here\n</Card>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const typesCode = `export interface Card {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  hoverable?: boolean;
  clickable?: boolean;
  divided?: boolean;
}`;

const basicCode = `<script setup lang="ts">
import { Card, Typography } from 'mood-ui';
<\/script>

<template>
  <Card class="w-80">
    <Typography variant="title" size="medium">Pro Plan</Typography>
    <Typography variant="body" color="muted">
      $29 / month with all features.
    </Typography>
  </Card>
</template>`;

const headerFooterCode = `<script setup lang="ts">
import { Card, Typography, Button } from 'mood-ui';
<\/script>

<template>
  <Card class="w-80">
    <template #header>
      <Typography variant="title" size="small">Subscription</Typography>
    </template>
    <Typography variant="body">$29 / month with all features.</Typography>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" size="small">Cancel</Button>
        <Button color="primary" size="small">Subscribe</Button>
      </div>
    </template>
  </Card>
</template>`;

const imageCode = `<script setup lang="ts">
import { Card, Typography } from 'mood-ui';
<\/script>

<template>
  <Card padding="none" class="w-80">
    <template #image>
      <img src="https://picsum.photos/400/200" class="w-full h-32 object-cover" />
    </template>
    <div class="p-5">
      <Typography variant="title" size="small">Mountain view</Typography>
      <Typography variant="body" color="muted">Photo of the day.</Typography>
    </div>
  </Card>
</template>`;

const hoverCode = `<script setup lang="ts">
import { Card, Typography } from 'mood-ui';
<\/script>

<template>
  <Card hoverable class="w-80">
    <Typography variant="title" size="small">Hover me</Typography>
    <Typography variant="body" color="muted">Reacts to hover.</Typography>
  </Card>
</template>`;

const clickableCode = `<script setup lang="ts">
import { Card, Typography } from 'mood-ui';

function onClick() {
  console.log('Card clicked');
}
<\/script>

<template>
  <Card clickable hoverable class="w-80" @click="onClick">
    <Typography variant="title" size="small">Clickable card</Typography>
    <Typography variant="body" color="muted">Full accessible button.</Typography>
  </Card>
</template>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'elevated' | 'outlined' | 'filled'",
    default: "'outlined'",
    description: t("pages.data-display.card.props.variant"),
  },
  {
    name: "padding",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.data-display.card.props.padding"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.data-display.card.props.radius"),
  },
  {
    name: "hoverable",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.card.props.hoverable"),
  },
  {
    name: "clickable",
    type: "boolean",
    default: "false",
    description: t("pages.data-display.card.props.clickable"),
  },
  {
    name: "divided",
    type: "boolean",
    default: "true",
    description: t("pages.data-display.card.props.divided"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.data-display.card.slots.default") },
  { name: "header", description: t("pages.data-display.card.slots.header") },
  { name: "image", description: t("pages.data-display.card.slots.image") },
  { name: "footer", description: t("pages.data-display.card.slots.footer") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.data-display.card.title')"
    category="Data Display"
    import-path="import { Card } from 'mood-ui'"
    :description="t('pages.data-display.card.description')"
    :props-list="propsList"
    :slots-list="slotsList"
  >
    <!-- ── Overview ────────────────────────────────────────────────────── -->
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="260px"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('controls.variant')"
            :options="[
              { value: 'elevated' },
              { value: 'outlined' },
              { value: 'filled' },
            ]"
            v-model="pgVariant"
          />
          <TbSep />
          <TbPills
            :label="t('controls.padding')"
            :options="[
              { value: 'none' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgPadding"
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
          <TbToggle :label="t('controls.hoverable')" v-model="pgHover" />
          <TbToggle :label="t('controls.clickable')" v-model="pgClickable" />
          <TbToggle :label="t('controls.divided')" v-model="pgDivided" />
        </template>

        <Card
          :variant="pgVariant"
          :padding="pgPadding"
          :radius="pgRadius"
          :hoverable="pgHover"
          :clickable="pgClickable"
          :divided="pgDivided"
          class="w-80"
        >
          <Typography variant="title" size="small">Card de ejemplo</Typography>
          <Typography variant="body" color="muted">
            Ajusta los controles para ver los cambios en vivo.
          </Typography>
        </Card>
      </ComponentPreview>
    </template>

    <!-- ── Examples ────────────────────────────────────────────────────── -->
    <template #examples>
      <ComponentPreview
        :title="t('pages.data-display.card.examples.basic.title')"
        :description="t('pages.data-display.card.examples.basic.desc')"
        :code="basicCode"
      >
        <Card class="w-80">
          <Typography variant="title" size="medium">Plan Pro</Typography>
          <Typography variant="body" color="muted">
            $29 / mes con todas las funciones.
          </Typography>
        </Card>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.card.examples.headerFooter.title')"
        :description="t('pages.data-display.card.examples.headerFooter.desc')"
        :code="headerFooterCode"
      >
        <Card class="w-80">
          <template #header>
            <Typography variant="title" size="small">Suscripción</Typography>
          </template>
          <Typography variant="body"
            >$29 / mes con todas las funciones.</Typography
          >
          <template #footer>
            <div class="flex justify-end gap-2">
              <Button variant="ghost" size="small">Cancelar</Button>
              <Button color="primary" size="small">Suscribir</Button>
            </div>
          </template>
        </Card>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.card.examples.image.title')"
        :description="t('pages.data-display.card.examples.image.desc')"
        :code="imageCode"
      >
        <Card padding="none" class="w-80">
          <template #image>
            <img
              src="https://picsum.photos/400/200"
              class="w-full h-32 object-cover"
            />
          </template>
          <div class="p-5">
            <Typography variant="title" size="small">Mountain view</Typography>
            <Typography variant="body" color="muted">Foto del día.</Typography>
          </div>
        </Card>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.card.examples.hover.title')"
        :description="t('pages.data-display.card.examples.hover.desc')"
        :code="hoverCode"
      >
        <Card hoverable class="w-80">
          <Typography variant="title" size="small">Pasa el cursor</Typography>
          <Typography variant="body" color="muted"
            >Reacciona al hover.</Typography
          >
        </Card>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.data-display.card.examples.clickable.title')"
        :description="t('pages.data-display.card.examples.clickable.desc')"
        :code="clickableCode"
      >
        <Card clickable hoverable class="w-80">
          <Typography variant="title" size="small">Card clickeable</Typography>
          <Typography variant="body" color="muted"
            >Botón completo accesible.</Typography
          >
        </Card>
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
        {{ t("pages.data-display.card.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.data-display.card.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
