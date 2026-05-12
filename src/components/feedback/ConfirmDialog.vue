<template>
  <Modal
    :model-value="isOpen"
    :title="current?.title"
    :description="current?.description"
    :size="current?.size ?? 'small'"
    :radius="current?.radius ?? props.radius"
    :color="current?.color ?? 'default'"
    :close-on-overlay="current?.dismissable ?? true"
    :close-on-escape="current?.dismissable ?? true"
    :show-close="current?.dismissable ?? true"
    @update:model-value="onModelValue"
  >
    <template v-if="!current?.hideIcon" #header>
      <div class="flex items-start gap-3">
        <div :class="['shrink-0 mt-0.5', iconColorClasses]">
          <component :is="resolvedIcon" class="w-6 h-6" aria-hidden="true" />
        </div>
        <div class="flex-1 min-w-0">
          <Typography
            v-if="current?.title"
            variant="title"
            size="medium"
            as="h2"
            weight="semibold"
          >
            {{ current.title }}
          </Typography>
          <Typography
            v-if="current?.description"
            variant="body"
            size="small"
            color="muted"
            class="mt-1"
          >
            {{ current.description }}
          </Typography>
        </div>
      </div>
    </template>

    <template #footer>
      <Button
        v-if="!current?.hideCancel"
        variant="ghost"
        :label="current?.cancelLabel ?? 'Cancel'"
        @click="cancel"
      />
      <Button
        ref="confirmBtnRef"
        variant="normal"
        :color="current?.color ?? 'default'"
        :label="current?.confirmLabel ?? 'Confirm'"
        @click="confirm"
      />
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";
import Modal from "./Modal.vue";
import Button from "../forms/Button.vue";
import Typography from "../data-display/Typography.vue";
import { useConfirm, useConfirmQueue } from "../../composables/useConfirm";
import type { ConfirmDialog } from "../../interfaces/feedback/ConfirmDialog.interface";

const props = withDefaults(defineProps<ConfirmDialog>(), {});

const queue = useConfirmQueue();
const { resolveCurrent } = useConfirm();

/* ------------------------------------------------------------------ */
/*  Current request                                                     */
/* ------------------------------------------------------------------ */

const current = computed(() => queue.queue[0]);
const isOpen = computed(() => !!current.value);

const confirmBtnRef = ref<InstanceType<typeof Button> | null>(null);

watch(isOpen, async (open) => {
  if (!open) return;
  if (current.value?.autoFocusConfirm === false) return;
  await nextTick();
  // Tiny delay so Modal's open animation finishes before focusing,
  // otherwise the focus ring sometimes flashes off-screen.
  setTimeout(() => {
    const el = (confirmBtnRef.value as unknown as { $el?: HTMLElement } | null)
      ?.$el;
    const btn =
      el instanceof HTMLElement
        ? el.tagName === "BUTTON"
          ? (el as HTMLButtonElement)
          : el.querySelector("button")
        : undefined;
    (btn as HTMLButtonElement | null)?.focus?.();
  }, 60);
});

function confirm() {
  resolveCurrent(true);
}
function cancel() {
  resolveCurrent(false);
}
function onModelValue(value: boolean) {
  // Only fires when the Modal is asking to close (false).
  if (!value) cancel();
}

/* ------------------------------------------------------------------ */
/*  Icon resolution                                                     */
/* ------------------------------------------------------------------ */

const resolvedIcon = computed(() => {
  if (current.value?.icon) return current.value.icon;
  switch (current.value?.color) {
    case "danger":
      return XCircleIcon;
    case "warning":
      return ExclamationTriangleIcon;
    case "success":
      return CheckCircleIcon;
    case "primary":
      return QuestionMarkCircleIcon;
    case "default":
    default:
      return QuestionMarkCircleIcon;
  }
});

const iconColorClasses = computed(() => {
  switch (current.value?.color) {
    case "danger":
      return "text-destructive";
    case "warning":
      return "text-warning";
    case "success":
      return "text-success";
    case "primary":
      return "text-primary";
    case "default":
    default:
      return "text-muted-foreground";
  }
});
</script>
