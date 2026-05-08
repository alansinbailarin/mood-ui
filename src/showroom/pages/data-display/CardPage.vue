<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import Card from "../../../components/data-display/Card.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import type { PropDoc, SlotDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";
import TbToggle from "../../components/toolbar/TbToggle.vue";
import TbSep from "../../components/toolbar/TbSep.vue";

const { t } = useI18n();

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
  return `<Card${attrs} class="w-80">\n  Contenido del card\n</Card>`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<Card class="w-80">
  <Typography variant="title" size="medium">Plan Pro</Typography>
  <Typography variant="body" color="muted">
    $29 / mes con todas las funciones.
  </Typography>
</Card>`;

const headerFooterCode = `<Card class="w-80">
  <template #header>
    <Typography variant="title" size="small">Suscripción</Typography>
  </template>
  <Typography variant="body">$29 / mes con todas las funciones.</Typography>
  <template #footer>
    <div class="flex justify-end gap-2">
      <Button variant="ghost" size="small">Cancelar</Button>
      <Button color="primary" size="small">Suscribir</Button>
    </div>
  </template>
</Card>`;

const imageCode = `<Card padding="none" class="w-80">
  <template #image>
    <img src="https://picsum.photos/400/200" class="w-full h-32 object-cover" />
  </template>
  <div class="p-5">
    <Typography variant="title" size="small">Mountain view</Typography>
    <Typography variant="body" color="muted">Foto del día.</Typography>
  </div>
</Card>`;

const hoverCode = `<Card hoverable class="w-80">
  <Typography variant="title" size="small">Pasa el cursor</Typography>
  <Typography variant="body" color="muted">Reacciona al hover.</Typography>
</Card>`;

const clickableCode = `<Card clickable hoverable class="w-80" @click="onClick">
  <Typography variant="title" size="small">Card clickeable</Typography>
  <Typography variant="body" color="muted">Botón completo accesible.</Typography>
</Card>`;

// ── API docs ──────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  {
    name: "variant",
    type: "'elevated' | 'outlined' | 'filled'",
    default: "'outlined'",
    description: t("pages.dataDisplay.card.props.variant"),
  },
  {
    name: "padding",
    type: "'none' | 'small' | 'medium' | 'large'",
    default: "'medium'",
    description: t("pages.dataDisplay.card.props.padding"),
  },
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.dataDisplay.card.props.radius"),
  },
  {
    name: "hoverable",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.card.props.hoverable"),
  },
  {
    name: "clickable",
    type: "boolean",
    default: "false",
    description: t("pages.dataDisplay.card.props.clickable"),
  },
  {
    name: "divided",
    type: "boolean",
    default: "true",
    description: t("pages.dataDisplay.card.props.divided"),
  },
]);

const slotsList = computed<SlotDoc[]>(() => [
  { name: "default", description: t("pages.dataDisplay.card.slots.default") },
  { name: "header", description: t("pages.dataDisplay.card.slots.header") },
  { name: "image", description: t("pages.dataDisplay.card.slots.image") },
  { name: "footer", description: t("pages.dataDisplay.card.slots.footer") },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.dataDisplay.card.title')"
    category="Data Display"
    import-path="import { Card } from 'mood-ui'"
    :description="t('pages.dataDisplay.card.description')"
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
        :title="t('pages.dataDisplay.card.examples.basic.title')"
        :description="t('pages.dataDisplay.card.examples.basic.desc')"
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
        :title="t('pages.dataDisplay.card.examples.headerFooter.title')"
        :description="t('pages.dataDisplay.card.examples.headerFooter.desc')"
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
        :title="t('pages.dataDisplay.card.examples.image.title')"
        :description="t('pages.dataDisplay.card.examples.image.desc')"
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
        :title="t('pages.dataDisplay.card.examples.hover.title')"
        :description="t('pages.dataDisplay.card.examples.hover.desc')"
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
        :title="t('pages.dataDisplay.card.examples.clickable.title')"
        :description="t('pages.dataDisplay.card.examples.clickable.desc')"
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
  </ComponentDoc>
</template>
