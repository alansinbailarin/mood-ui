<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  UserIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/vue/24/outline";

import Card from "../../../components/data-display/Card.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import FormField from "../../../components/forms/FormField.vue";
import Input from "../../../components/forms/Input.vue";
import Textarea from "../../../components/forms/Textarea.vue";
import Switch from "../../../components/forms/Switch.vue";
import Avatar from "../../../components/data-display/avatar/Avatar.vue";
import Badge from "../../../components/feedback/Badge.vue";
import Banner from "../../../components/feedback/Banner.vue";

const { t } = useI18n();

const sections = computed(() => [
  {
    id: "account",
    label: t("pages.templates.settings.navAccount"),
    icon: UserIcon,
  },
  {
    id: "team",
    label: t("pages.templates.settings.navTeam"),
    icon: BuildingOfficeIcon,
  },
  {
    id: "billing",
    label: t("pages.templates.settings.navBilling"),
    icon: CreditCardIcon,
  },
  {
    id: "notif",
    label: t("pages.templates.settings.navNotif"),
    icon: BellIcon,
  },
  {
    id: "security",
    label: t("pages.templates.settings.navSecurity"),
    icon: ShieldCheckIcon,
  },
  {
    id: "apikeys",
    label: t("pages.templates.settings.navApiKeys"),
    icon: KeyIcon,
  },
]);

const active = ref("account");
const fullName = ref("Alan Sin Bailarín");
const email = ref("alan@mood-ui.dev");
const bio = ref("Creador de mood-ui. Diseño y código.");
const notifyEmail = ref(true);
const notifyPush = ref(false);
const notifyMarketing = ref(false);
</script>

<template>
  <div
    class="min-h-[800px] grid grid-cols-[260px_1fr] bg-background rounded-2xl border border-border overflow-hidden"
  >
    <!-- Sidebar -->
    <aside class="border-r border-border bg-card p-4 flex flex-col gap-1">
      <div class="px-2 py-3 mb-2 flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-black"
        >
          m
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold leading-tight">{{
            t("pages.templates.settings.workspaceLabel")
          }}</span>
          <span class="text-xs text-muted-foreground">{{
            t("pages.templates.settings.workspaceSubtitle")
          }}</span>
        </div>
      </div>
      <button
        v-for="s in sections"
        :key="s.id"
        :class="[
          'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors',
          active === s.id
            ? 'bg-muted text-foreground font-medium'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        ]"
        @click="active = s.id"
      >
        <component :is="s.icon" class="w-4 h-4" aria-hidden="true" />
        {{ s.label }}
      </button>
    </aside>

    <!-- Content -->
    <main class="p-8 max-w-3xl flex flex-col gap-6">
      <!-- Cuenta -->
      <template v-if="active === 'account'">
        <div class="flex flex-col gap-1">
          <Typography variant="title" size="medium">{{
            t("pages.templates.settings.accountTitle")
          }}</Typography>
          <Typography variant="body" color="muted">{{
            t("pages.templates.settings.accountSubtitle")
          }}</Typography>
        </div>

        <Card class="p-6 flex flex-col gap-5">
          <div class="flex items-center gap-4">
            <Avatar fallback="AS" size="large" />
            <div class="flex flex-col gap-2">
              <Button size="small" variant="outline">{{
                t("pages.templates.settings.changePhoto")
              }}</Button>
              <Typography variant="caption" color="muted">{{
                t("pages.templates.settings.photoHint")
              }}</Typography>
            </div>
          </div>
          <FormField :label="t('pages.templates.settings.fieldFullName')">
            <Input v-model="fullName" />
          </FormField>
          <FormField
            :label="t('pages.templates.settings.fieldEmail')"
            :hint="t('pages.templates.settings.emailHint')"
          >
            <Input v-model="email" type="email" />
          </FormField>
          <FormField :label="t('pages.templates.settings.fieldBio')">
            <Textarea v-model="bio" :rows="3" />
          </FormField>
          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost">{{
              t("pages.templates.settings.cancel")
            }}</Button>
            <Button color="primary">{{
              t("pages.templates.settings.saveChanges")
            }}</Button>
          </div>
        </Card>
      </template>

      <!-- Notificaciones -->
      <template v-else-if="active === 'notif'">
        <div class="flex flex-col gap-1">
          <Typography variant="title" size="medium">{{
            t("pages.templates.settings.notifTitle")
          }}</Typography>
          <Typography variant="body" color="muted">{{
            t("pages.templates.settings.notifSubtitle")
          }}</Typography>
        </div>
        <Card class="p-6 flex flex-col divide-y divide-border">
          <div class="flex items-start justify-between gap-4 py-4 first:pt-0">
            <div>
              <p class="font-medium">
                {{ t("pages.templates.settings.notifEmailLabel") }}
              </p>
              <Typography variant="caption" color="muted">{{
                t("pages.templates.settings.notifEmailDesc")
              }}</Typography>
            </div>
            <Switch v-model="notifyEmail" />
          </div>
          <div class="flex items-start justify-between gap-4 py-4">
            <div>
              <p class="font-medium">
                {{ t("pages.templates.settings.notifPushLabel") }}
              </p>
              <Typography variant="caption" color="muted">{{
                t("pages.templates.settings.notifPushDesc")
              }}</Typography>
            </div>
            <Switch v-model="notifyPush" />
          </div>
          <div class="flex items-start justify-between gap-4 py-4 last:pb-0">
            <div>
              <p class="font-medium">
                {{ t("pages.templates.settings.notifMarketingLabel") }}
              </p>
              <Typography variant="caption" color="muted">{{
                t("pages.templates.settings.notifMarketingDesc")
              }}</Typography>
            </div>
            <Switch v-model="notifyMarketing" />
          </div>
        </Card>
      </template>

      <!-- Facturación -->
      <template v-else-if="active === 'billing'">
        <div class="flex flex-col gap-1">
          <Typography variant="title" size="medium">{{
            t("pages.templates.settings.billingTitle")
          }}</Typography>
          <Typography variant="body" color="muted">{{
            t("pages.templates.settings.billingSubtitle")
          }}</Typography>
        </div>
        <Banner
          color="info"
          :title="t('pages.templates.settings.billingBannerTitle')"
          :description="t('pages.templates.settings.billingBannerDesc')"
        />
        <Card class="p-6 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md bg-muted grid place-items-center">
              <CreditCardIcon class="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p class="font-medium">Visa **** 4242</p>
              <Typography variant="caption" color="muted"
                >Vence 09/27</Typography
              >
            </div>
          </div>
          <Button variant="outline" size="small">{{
            t("pages.templates.settings.changeCard")
          }}</Button>
        </Card>
      </template>

      <!-- Default placeholder -->
      <template v-else>
        <div class="flex flex-col gap-1">
          <Typography variant="title" size="medium">{{
            sections.find((s) => s.id === active)?.label ?? ""
          }}</Typography>
          <Typography variant="body" color="muted">{{
            t("pages.templates.settings.defaultSectionSubtitle")
          }}</Typography>
        </div>
        <Card class="p-12 text-center flex flex-col items-center gap-3">
          <Badge color="default" variant="subtle">Coming soon</Badge>
          <Typography variant="body" color="muted" class="text-sm max-w-sm">
            {{ t("pages.templates.settings.comingSoonDesc") }}
          </Typography>
        </Card>
      </template>
    </main>
  </div>
</template>
