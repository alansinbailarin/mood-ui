<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import Button from "../../../components/forms/Button.vue";
import { useToast } from "../../../composables/useToast";
import type { PropDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";

const { t } = useI18n();
const toast = useToast();

const pgPlacement = ref<
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
>("top-right");

function resetPlayground() {
  pgPlacement.value = "top-right";
}

const overviewCode = computed(
  () =>
    `import { useToast } from 'mood-ui';

const toast = useToast();

// Convenience wrappers — pre-set color
toast.success({ title: 'Saved', description: 'Changes applied' });
toast.danger({ title: 'Error', description: 'Something went wrong.' });
toast.info({ title: 'Syncing…', duration: 0 }); // pinned
toast.warning({
  title: 'Attention',
  description: 'Review before continuing.',
  action: { label: 'Review', onClick: (close) => close() },
});

// Imperative control
const id = toast.push({ title: 'Uploading…', color: 'info' });
// …later…
toast.dismiss(id);
toast.dismissAll();`,
);

const basicCode = `import { useToast } from 'mood-ui';
const toast = useToast();

toast.success({ title: 'Profile updated' });
toast.danger({ title: 'Network error', description: 'Try again later.' });
toast.info({ title: 'New message' });
toast.warning({ title: 'Session expiring soon' });`;

const actionCode = `import { useToast } from 'mood-ui';
const toast = useToast();

toast.warning({
  title: 'Unsaved changes',
  description: 'You have unsaved edits.',
  action: {
    label: 'Undo',
    onClick: (close) => {
      // restore previous state
      close();
    },
  },
});`;

const pinnedCode = `import { useToast } from 'mood-ui';
const toast = useToast();

// duration: 0 keeps the toast pinned until dismissed
toast.info({
  title: 'Syncing',
  description: 'Applying latest changes…',
  duration: 0,
});`;

const updateCode = `import { useToast } from 'mood-ui';
const toast = useToast();

const id = toast.success({ title: 'Uploading… 0%' });

// Re-push with the same id to update in place
let progress = 0;
const interval = setInterval(() => {
  progress += 25;
  toast.success({
    id,
    title: \`Uploading… \${progress}%\`,
    description: progress === 100 ? 'Done!' : undefined,
  });
  if (progress >= 100) clearInterval(interval);
}, 800);`;

const dismissAllCode = `import { useToast } from 'mood-ui';
const toast = useToast();

toast.success({ title: 'A' });
toast.info({    title: 'B' });
toast.warning({ title: 'C' });

// Clear everything
toast.dismissAll();`;

function pushSuccess() {
  toast.success({
    title: "Saved",
    description: "Changes applied successfully.",
    placement: pgPlacement.value,
  });
}
function pushDanger() {
  toast.danger({
    title: "Network error",
    description: "Could not reach the server.",
    placement: pgPlacement.value,
  });
}
function pushInfo() {
  toast.info({
    title: "Syncing",
    description: "Applying latest changes…",
    placement: pgPlacement.value,
  });
}
function pushWarn() {
  toast.warning({
    title: "Attention",
    description: "Review the data before continuing.",
    placement: pgPlacement.value,
    action: { label: "Review", onClick: (close) => close() },
  });
}
function pushPinned() {
  toast.info({
    title: "Pinned toast",
    description: "This toast stays until you dismiss it.",
    duration: 0,
    placement: pgPlacement.value,
  });
}
function pushUpdate() {
  const id = toast.success({
    title: "Uploading… 0%",
    placement: pgPlacement.value,
  });
  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    toast.success({
      id,
      title: `Uploading… ${progress}%`,
      description: progress === 100 ? "Done!" : undefined,
      placement: pgPlacement.value,
    });
    if (progress >= 100) clearInterval(interval);
  }, 600);
}

const typesCode = `type ToastPlacement = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type ToastColor = 'default' | 'primary' | 'danger' | 'success' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastInput {
  id?: string;
  title?: string;
  description?: string;
  placement?: ToastPlacement;
  duration?: number;
  color?: ToastColor;
  icon?: Component;
  actions?: ToastAction[];
  closable?: boolean;
  onClose?: () => void;
}

function useToast(): {
  toasts: Ref<ToastInput[]>;
  push: (input: ToastInput) => string;
  success: (input: Omit<ToastInput, 'color'>) => string;
  danger: (input: Omit<ToastInput, 'color'>) => string;
  warning: (input: Omit<ToastInput, 'color'>) => string;
  info: (input: Omit<ToastInput, 'color'>) => string;
  close: (id: string) => void;
  clearAll: () => void;
};`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "push",
    type: "(input: ToastInput | string) => string | number",
    description: t("pages.composables.useToast.api.push"),
  },
  {
    name: "info",
    type: "(input: Omit<ToastInput, 'color'> | string) => string | number",
    description: t("pages.composables.useToast.api.info"),
  },
  {
    name: "success",
    type: "(input: Omit<ToastInput, 'color'> | string) => string | number",
    description: t("pages.composables.useToast.api.success"),
  },
  {
    name: "warning",
    type: "(input: Omit<ToastInput, 'color'> | string) => string | number",
    description: t("pages.composables.useToast.api.warning"),
  },
  {
    name: "danger",
    type: "(input: Omit<ToastInput, 'color'> | string) => string | number",
    description: t("pages.composables.useToast.api.danger"),
  },
  {
    name: "dismiss",
    type: "(id: string | number) => void",
    description: t("pages.composables.useToast.api.dismiss"),
  },
  {
    name: "dismissAll",
    type: "() => void",
    description: t("pages.composables.useToast.api.dismissAll"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useToast.title')"
    category="Composables"
    import-path="import { useToast } from 'mood-ui'"
    :description="t('pages.composables.useToast.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="280px"
        lang="ts"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            label="Placement"
            :options="[
              { value: 'top-left' },
              { value: 'top-center' },
              { value: 'top-right' },
              { value: 'bottom-left' },
              { value: 'bottom-center' },
              { value: 'bottom-right' },
            ]"
            v-model="pgPlacement"
          />
        </template>

        <div class="flex flex-wrap gap-2">
          <Button color="success" size="small" @click="pushSuccess">
            success()
          </Button>
          <Button color="danger" size="small" @click="pushDanger">
            danger()
          </Button>
          <Button size="small" @click="pushInfo">info()</Button>
          <Button color="warning" size="small" @click="pushWarn">
            warning()
          </Button>
          <Button variant="outline" size="small" @click="pushPinned">
            pinned()
          </Button>
          <Button variant="ghost" size="small" @click="pushUpdate">
            update()
          </Button>
        </div>
        <div class="flex gap-2 mt-2">
          <Button variant="outline" size="small" @click="toast.dismissAll()">
            dismissAll()
          </Button>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.composables.useToast.examples.basic.title')"
        :description="t('pages.composables.useToast.examples.basic.desc')"
        :code="basicCode"
        min-height="160px"
        lang="ts"
      >
        <div class="flex flex-wrap gap-2">
          <Button color="success" size="small" @click="pushSuccess">
            success()
          </Button>
          <Button color="danger" size="small" @click="pushDanger">
            danger()
          </Button>
          <Button size="small" @click="pushInfo">info()</Button>
          <Button color="warning" size="small" @click="pushWarn">
            warning()
          </Button>
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useToast.examples.action.title')"
        :description="t('pages.composables.useToast.examples.action.desc')"
        :code="actionCode"
        min-height="160px"
        lang="ts"
      >
        <Button color="warning" @click="pushWarn">warning() with action</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useToast.examples.pinned.title')"
        :description="t('pages.composables.useToast.examples.pinned.desc')"
        :code="pinnedCode"
        min-height="160px"
        lang="ts"
      >
        <Button variant="outline" @click="pushPinned">Push pinned toast</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useToast.examples.update.title')"
        :description="t('pages.composables.useToast.examples.update.desc')"
        :code="updateCode"
        min-height="160px"
        lang="ts"
      >
        <Button variant="ghost" @click="pushUpdate">Update in place</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.composables.useToast.examples.dismissAll.title')"
        :description="t('pages.composables.useToast.examples.dismissAll.desc')"
        :code="dismissAllCode"
        min-height="160px"
        lang="ts"
      >
        <div class="flex gap-2">
          <Button @click="pushSuccess">Push one</Button>
          <Button variant="outline" @click="toast.dismissAll()"
            >dismissAll()</Button
          >
        </div>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useToast.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useToast.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
