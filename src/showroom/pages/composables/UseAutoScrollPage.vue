<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import { useAutoScroll } from "../../../composables/useAutoScroll";
import type { PropDoc } from "../../types";

const { t } = useI18n();

const scrollEl = ref<HTMLElement | null>(null);
const { handleAutoScroll, stopAutoScroll } = useAutoScroll({
  scrollRef: scrollEl,
  enabled: () => true,
  zone: 40,
  maxSpeed: 8,
});

function onPointerMove(e: PointerEvent) {
  handleAutoScroll(e.clientY);
}
function onPointerUp() {
  stopAutoScroll();
}

const overviewCode = `import { ref } from 'vue';
import { useAutoScroll } from 'mood-ui';

const scrollRef = ref<HTMLElement | null>(null);

const { handleAutoScroll, stopAutoScroll } = useAutoScroll({
  scrollRef,
  enabled: () => isDragging.value,
  zone: 40,     // px from edge to trigger scroll
  maxSpeed: 12, // px per frame
});

// On drag, call with pointer Y position
handleAutoScroll(clientY);

// On drag end
stopAutoScroll();`;

const typesCode = `interface UseAutoScrollOptions {
  scrollRef: Ref<HTMLElement | null>;
  enabled?: () => boolean;
  zone?: number;
  maxSpeed?: number;
}

function useAutoScroll(options: UseAutoScrollOptions): {
  handleAutoScroll: (clientY: number) => void;
  stopAutoScroll: () => void;
};`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "handleAutoScroll",
    type: "(clientY: number) => void",
    description: t("pages.composables.useAutoScroll.api.handleAutoScroll"),
  },
  {
    name: "stopAutoScroll",
    type: "() => void",
    description: t("pages.composables.useAutoScroll.api.stopAutoScroll"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.composables.useAutoScroll.title')"
    category="Composables"
    import-path="import { useAutoScroll } from 'mood-ui'"
    :description="t('pages.composables.useAutoScroll.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="280px" lang="ts">
        <div class="flex flex-col gap-2">
          <Typography variant="body" size="small">
            {{ t("pages.composables.useAutoScroll.playground.instruction") }}
          </Typography>

          <div
            ref="scrollEl"
            class="h-40 overflow-y-auto border border-border rounded-md p-3 space-y-2 select-none"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerUp"
          >
            <div
              v-for="i in 20"
              :key="i"
              class="h-8 rounded bg-muted flex items-center px-3 text-sm"
            >
              Item {{ i }}
            </div>
          </div>
        </div>
      </ComponentPreview>
    </template>
    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.composables.useAutoScroll.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.composables.useAutoScroll.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
