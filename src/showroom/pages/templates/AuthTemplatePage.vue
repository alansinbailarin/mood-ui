<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";

import Card from "../../../components/data-display/Card.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import FormField from "../../../components/forms/FormField.vue";
import Input from "../../../components/forms/Input.vue";
import PasswordInput from "../../../components/forms/PasswordInput.vue";
import Switch from "../../../components/forms/Switch.vue";
import Segmented from "../../../components/forms/Segmented.vue";

const { t } = useI18n();
const mode = ref<"login" | "signup">("login");
const email = ref("");
const password = ref("");
const name = ref("");
const remember = ref(true);
</script>

<template>
  <div
    class="min-h-[800px] bg-muted/40 grid place-items-center p-6 rounded-2xl border border-border"
  >
    <Card class="w-full max-w-md p-8 flex flex-col gap-6">
      <div class="flex flex-col items-center gap-3 text-center">
        <div
          class="w-12 h-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-black text-xl"
        >
          m
        </div>
        <Typography variant="title" size="medium">{{
          mode === "login"
            ? t("pages.templates.auth.titleLogin")
            : t("pages.templates.auth.titleSignup")
        }}</Typography>
        <Typography variant="body" color="muted">
          {{
            mode === "login"
              ? t("pages.templates.auth.subtitleLogin")
              : t("pages.templates.auth.subtitleSignup")
          }}
        </Typography>
      </div>

      <Segmented
        v-model="mode"
        :items="[
          { value: 'login', label: t('pages.templates.auth.tabLogin') },
          { value: 'signup', label: t('pages.templates.auth.tabSignup') },
        ]"
        color="primary"
        full-width
      />

      <form class="flex flex-col gap-4" @submit.prevent>
        <FormField
          v-if="mode === 'signup'"
          :label="t('pages.templates.auth.fieldName')"
        >
          <Input v-model="name" :icon-left="UserIcon" placeholder="Ana López" />
        </FormField>
        <FormField :label="t('pages.templates.auth.fieldEmail')">
          <Input
            v-model="email"
            :icon-left="EnvelopeIcon"
            type="email"
            placeholder="me@example.com"
          />
        </FormField>
        <FormField
          :label="t('pages.templates.auth.fieldPassword')"
          :hint="
            mode === 'signup' ? t('pages.templates.auth.passwordHint') : ''
          "
        >
          <PasswordInput
            v-model="password"
            :icon-left="LockClosedIcon"
            placeholder="••••••••"
          />
        </FormField>

        <div v-if="mode === 'login'" class="flex items-center justify-between">
          <Switch
            v-model="remember"
            :label="t('pages.templates.auth.remember')"
          />
          <a href="#" class="text-sm text-primary hover:underline">{{
            t("pages.templates.auth.forgotPassword")
          }}</a>
        </div>

        <Button color="primary" full-width>
          {{
            mode === "login"
              ? t("pages.templates.auth.btnLogin")
              : t("pages.templates.auth.btnSignup")
          }}
        </Button>

        <div class="relative my-1">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border" />
          </div>
          <div
            class="relative flex justify-center text-xs uppercase tracking-wider"
          >
            <span class="bg-card px-2 text-muted-foreground">{{
              t("pages.templates.auth.orContinueWith")
            }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Button variant="outline">Google</Button>
          <Button variant="outline">GitHub</Button>
        </div>
      </form>

      <Typography variant="caption" color="muted" class="text-center">
        {{
          mode === "login"
            ? t("pages.templates.auth.footerLogin")
            : t("pages.templates.auth.footerSignup")
        }}
        <a
          href="#"
          class="text-primary hover:underline"
          @click.prevent="mode = mode === 'login' ? 'signup' : 'login'"
        >
          {{
            mode === "login"
              ? t("pages.templates.auth.footerLinkSignup")
              : t("pages.templates.auth.footerLinkLogin")
          }}
        </a>
      </Typography>
    </Card>
  </div>
</template>
