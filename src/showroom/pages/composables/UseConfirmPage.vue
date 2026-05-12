<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import { useConfirm } from "../../../composables/useConfirm";
import type { PropDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";

const { t } = useI18n();
const confirm = useConfirm();

const pgColor = ref<"primary" | "danger" | "warning">("primary");
const pgHideCancel = ref(false);
const pgDismissable = ref(true);

const lastResult = ref<boolean | null>(null);

function resetPlayground() {
  pgColor.value = "primary";
  pgHideCancel.value = false;
  pgDismissable.value = true;
}

async function runConfirm() {
  const ok = await confirm.confirm({
    title: t("pages.composables.useConfirm.playground.title"),
    description: t("pages.composables.useConfirm.playground.description"),
    color: pgColor.value,
    hideCancel: pgHideCancel.value,
    dismissable: pgDismissable.value,
    confirmLabel: pgHideCancel.value
      ? t("pages.composables.useConfirm.playground.okLabel")
      : t("pages.composables.useConfirm.playground.confirmLabel"),
    cancelLabel: t("pages.composables.useConfirm.playground.cancelLabel"),
  });
  lastResult.value = ok;
}

async function runBasic() {
  const ok = await confirm.confirm({
    title: "Delete project?",
    description: "This action cannot be undone.",
    color: "danger",
    confirmLabel: "Delete",
  });
}

async function runAlert() {
  await confirm.confirm({
    title: "Session expired",
    description: "Your session has expired. Please log in again.",
    hideCancel: true,
    confirmLabel: "Understood",
  });
}

async function runChain() {
  const step1 = await confirm.confirm({
    title: "Step 1 of 3",
    description: "Confirm your email address.",
  });
  if (!step1) return;

  const step2 = await confirm.confirm({
    title: "Step 2 of 3",
    description: "Accept the terms of service.",
    color: "primary",
  });
  if (!step2) return;

  await confirm.confirm({
    title: "Done",
    description: "All steps completed successfully.",
    hideCancel: true,
    confirmLabel: "Finish",
  });
}

const overviewCode = computed(() => {
  const lines = [
    `import { useConfirm } from 'mood-ui';`,
    ``,
    `const confirm = useConfirm();`,
    ``,
    `async function handleDelete() {`,
    `  const ok = await confirm.confirm({`,
    `    title: 'Delete project?',`,
    `    description: 'This action cannot be undone.',`,
    `    color: '${pgColor.value}',`,
    pgHideCancel.value ? `    hideCancel: true,` : "",
    !pgDismissable.value ? `    dismissable: false,` : "",
    `  });`,
    `  if (ok) {`,
    `    // proceed`,
    `  }`,
    `}`,
  ];
  return lines.filter(Boolean).join("\n");
});

const basicCode = `import { useConfirm } from 'mood-ui';
const confirm = useConfirm();

async function onDelete() {
  const ok = await confirm.confirm({
    title: 'Delete project?',
    description: 'This action cannot be undone.',
    color: 'danger',
    confirmLabel: 'Delete',
  });

  if (ok) {
    // perform deletion
  }
}`;

const alertCode = `import { useConfirm } from 'mood-ui';
const confirm = useConfirm();

async function showNotice() {
  await confirm.confirm({
    title: 'Session expired',
    description: 'Your session has expired. Please log in again.',
    hideCancel: true,
    confirmLabel: 'Understood',
  });
  // always resolves true when hideCancel is set
}`;

const chainCode = `import { useConfirm } from 'mood-ui';
const confirm = useConfirm();

async function runWizard() {
  const step1 = await confirm.confirm({
    title: 'Step 1 of 3',
    description: 'Confirm your email address.',
  });
  if (!step1) return;

  const step2 = await confirm.confirm({
    title: 'Step 2 of 3',
    description: 'Accept the terms of service.',
    color: 'primary',
  });
  if (!step2) return;

  await confirm.confirm({
    title: 'Done',
    description: 'All steps completed successfully.',
    hideCancel: true,
    confirmLabel: 'Finish',
  });
}`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "confirm",
    type: "(input?: ConfirmInput | string) => Promise<boolean>",
    description: t("pages.composables.useConfirm.api.confirm"),
  },
]);

const inputShapeList = computed<PropDoc[]>(() => [
  {
    name: "title",
    type: "string",
    description: t("pages.composables.useConfirm.input.title"),
  },
  {
    name: "description",
    type: "string",
    description: t("pages.composables.useConfirm.input.description"),
  },
  {
    name: "color",
    type: "'default' | 'primary' | 'danger' | 'warning' | 'success'",
    default: "'primary'",
    description: t("pages.composables.useConfirm.input.color"),
  },
  {
    name: "confirmLabel",
    type: "string",
    default: "'Confirm'",
    description: t("pages.composables.useConfirm.input.confirmLabel"),
  },
  {
    name: "cancelLabel",
    type: "string",
    default: "'Cancel'",
    description: t("pages.composables.useConfirm.input.cancelLabel"),
  },
  {
    name: "hideCancel",
    type: "boolean",
    default: "false",
    description: t("pages.composables.useConfirm.input.hideCancel"),
  },
  {
    name: "dismissable",
    type: "boolean",
    default: "true",
    description: t("pages.composables.useConfirm.input.dismissable"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useConfirm.title')"
    category="Composables"
    import-path="import { useConfirm } from 'mood-ui'"
    :description="t('pages.composables.useConfirm.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="260px"
        lang="ts"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Color"
            :options="[
              { value: 'primary' },
              { value: 'danger' },
              { value: 'warning' },
            ]"
            v-model="pgColor"
          />
          <TbPills
            label="Cancel"
            :options="[{ value: 'show' }, { value: 'hide' }]"
            :model-value="pgHideCancel ? 'hide' : 'show'"
            @update:model-value="(v) => (pgHideCancel = v === 'hide')"
          />
          <TbPills
            label="Dismissable"
            :options="[{ value: 'yes' }, { value: 'no' }]"
            :model-value="pgDismissable ? 'yes' : 'no'"
            @update:model-value="(v) => (pgDismissable = v === 'yes')"
          />
        </template>

        <div class="flex flex-col gap-3">
          <Button color="primary" @click="runConfirm">
            {{ t("pages.composables.useConfirm.playground.cta") }}
          </Button>
          <Typography v-if="lastResult !== null" variant="body" size="small">
            {{
              t("pages.composables.useConfirm.playground.result", {
                ok: lastResult,
              })
            }}
          </Typography>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.composables.useConfirm.examples.basic.title')"
        :description="t('pages.composables.useConfirm.examples.basic.desc')"
        :code="basicCode"
        min-height="160px"
        lang="ts"
      >
        <Button color="danger" @click="runBasic"> Delete project </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useConfirm.examples.alert.title')"
        :description="t('pages.composables.useConfirm.examples.alert.desc')"
        :code="alertCode"
        min-height="160px"
        lang="ts"
      >
        <Button variant="outline" @click="runAlert"> Show alert </Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useConfirm.examples.chain.title')"
        :description="t('pages.composables.useConfirm.examples.chain.desc')"
        :code="chainCode"
        min-height="160px"
        lang="ts"
      >
        <Button variant="ghost" @click="runChain"> Start wizard </Button>
      </ComponentPreview>
    </template>

    <template #api-extra>
      <section class="mt-8">
        <Typography variant="heading" class="mb-4">ConfirmInput</Typography>
        <Typography
          variant="body"
          size="small"
          class="mb-4 text-muted-foreground"
        >
          {{ t("pages.composables.useConfirm.input.description") }}
        </Typography>
        <div class="space-y-2">
          <div
            v-for="prop in inputShapeList"
            :key="prop.name"
            class="flex gap-3 p-3 rounded-md border border-border"
          >
            <div class="min-w-35">
              <code class="text-sm font-mono">{{ prop.name }}</code>
              <div class="text-xs text-muted-foreground mt-0.5">
                {{ prop.type }}
              </div>
              <div v-if="prop.default" class="text-xs text-muted-foreground">
                default: {{ prop.default }}
              </div>
            </div>
            <Typography
              variant="body"
              size="small"
              class="text-muted-foreground"
            >
              {{ prop.description }}
            </Typography>
          </div>
        </div>
      </section>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useConfirm.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useConfirm.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
