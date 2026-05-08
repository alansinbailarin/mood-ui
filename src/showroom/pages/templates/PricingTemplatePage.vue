<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { CheckIcon } from "@heroicons/vue/24/solid";

import Card from "../../../components/data-display/Card.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Badge from "../../../components/feedback/Badge.vue";
import Button from "../../../components/forms/Button.vue";
import Switch from "../../../components/forms/Switch.vue";

const { t } = useI18n();
const yearly = ref(true);

interface Plan {
  name: string;
  description: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
  cta: string;
}

const plans = computed<Plan[]>(() => [
  {
    name: "Starter",
    description: t("pages.templates.pricing.starterDesc"),
    monthly: 0,
    yearly: 0,
    features: [
      t("pages.templates.pricing.starterF1"),
      t("pages.templates.pricing.starterF2"),
      t("pages.templates.pricing.starterF3"),
      t("pages.templates.pricing.starterF4"),
    ],
    cta: t("pages.templates.pricing.starterCta"),
  },
  {
    name: "Pro",
    description: t("pages.templates.pricing.proDesc"),
    monthly: 29,
    yearly: 24,
    features: [
      t("pages.templates.pricing.proF1"),
      t("pages.templates.pricing.proF2"),
      t("pages.templates.pricing.proF3"),
      t("pages.templates.pricing.proF4"),
      t("pages.templates.pricing.proF5"),
    ],
    highlight: true,
    cta: t("pages.templates.pricing.proCta"),
  },
  {
    name: "Team",
    description: t("pages.templates.pricing.teamDesc"),
    monthly: 79,
    yearly: 64,
    features: [
      t("pages.templates.pricing.teamF1"),
      t("pages.templates.pricing.teamF2"),
      t("pages.templates.pricing.teamF3"),
      t("pages.templates.pricing.teamF4"),
      t("pages.templates.pricing.teamF5"),
    ],
    cta: t("pages.templates.pricing.teamCta"),
  },
]);

function priceFor(p: Plan): number {
  return yearly.value ? p.yearly : p.monthly;
}

const savingsLabel = computed(() =>
  yearly.value ? t("pages.templates.pricing.savings") : "",
);
</script>

<template>
  <div
    class="min-h-[800px] bg-background py-12 px-6 rounded-2xl border border-border"
  >
    <div class="max-w-5xl mx-auto flex flex-col gap-10">
      <div class="text-center flex flex-col gap-3 items-center">
        <Badge color="primary" variant="subtle">Pricing</Badge>
        <Typography variant="title" size="large">{{
          t("pages.templates.pricing.title")
        }}</Typography>
        <Typography variant="body" color="muted" class="max-w-xl">
          {{ t("pages.templates.pricing.subtitle") }}
        </Typography>
        <div class="flex items-center gap-3 mt-4">
          <span
            :class="
              yearly ? 'text-muted-foreground' : 'font-semibold text-foreground'
            "
            >{{ t("pages.templates.pricing.monthly") }}</span
          >
          <Switch v-model="yearly" />
          <span
            :class="
              !yearly
                ? 'text-muted-foreground'
                : 'font-semibold text-foreground'
            "
            >{{ t("pages.templates.pricing.yearly") }}</span
          >
          <Badge v-if="yearly" color="success" variant="subtle">{{
            savingsLabel
          }}</Badge>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <Card
          v-for="plan in plans"
          :key="plan.name"
          :class="[
            'relative flex flex-col gap-5 p-6',
            plan.highlight ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : '',
          ]"
        >
          <Badge
            v-if="plan.highlight"
            color="primary"
            variant="solid"
            class="absolute -top-3 left-1/2 -translate-x-1/2"
            >{{ t("pages.templates.pricing.mostPopular") }}</Badge
          >

          <div class="flex flex-col gap-1">
            <Typography variant="title" size="small">{{
              plan.name
            }}</Typography>
            <Typography variant="body" color="muted" class="text-sm">{{
              plan.description
            }}</Typography>
          </div>

          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-bold tracking-tight"
              >${{ priceFor(plan) }}</span
            >
            <span class="text-sm text-muted-foreground"
              >/{{
                yearly
                  ? t("pages.templates.pricing.perMonthYearly")
                  : t("pages.templates.pricing.perMonth")
              }}</span
            >
          </div>

          <ul class="flex flex-col gap-2 text-sm">
            <li
              v-for="f in plan.features"
              :key="f"
              class="flex items-start gap-2"
            >
              <CheckIcon class="w-4 h-4 mt-0.5 shrink-0 text-success" />
              <span>{{ f }}</span>
            </li>
          </ul>

          <Button
            :color="plan.highlight ? 'primary' : 'default'"
            :variant="plan.highlight ? 'normal' : 'outline'"
            full-width
            >{{ plan.cta }}</Button
          >
        </Card>
      </div>

      <p class="text-center text-xs text-muted-foreground">
        {{ t("pages.templates.pricing.footer") }}
      </p>
    </div>
  </div>
</template>
