<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import ComponentDoc from "../../components/ComponentDoc.vue";
import ComponentPreview from "../../components/ComponentPreview.vue";
import CodePreview from "../../components/CodePreview.vue";
import Typography from "../../../components/data-display/Typography.vue";
import {
  eventColorClass,
  eventColorClassStrong,
  hexToRgba,
} from "../../../composables/eventColors";
import type { PropDoc } from "../../types";
import TbPills from "../../components/toolbar/TbPills.vue";

const { t } = useI18n();

const pgVariant = ref<"soft" | "strong">("soft");

const colors = [
  "default",
  "primary",
  "danger",
  "success",
  "warning",
  "info",
  "purple",
  "pink",
] as const;

const previewClass = computed(() =>
  pgVariant.value === "soft"
    ? (c: string) => eventColorClass(c as any)
    : (c: string) => eventColorClassStrong(c as any),
);

const overviewCode = computed(
  () => `import { eventColorClass, eventColorClassStrong } from 'mood-ui';

// Soft variant for WeekView / DayView / Scheduler
const soft = eventColorClass('primary');
// → 'bg-primary/15 text-primary border-l-2 border-primary'

// Stronger variant for MonthView pills
const strong = eventColorClassStrong('primary');
// → 'bg-primary/20 text-primary border-l-2 border-primary'

// Convert hex to rgba for custom calendar colors
const rgba = hexToRgba('#6366f1', 0.12);
// → 'rgba(99, 102, 241, 0.12)'`,
);

const basicCode = `import { eventColorClass } from 'mood-ui';

function getEventClasses(event: CalendarEvent) {
  return eventColorClass(event.color);
}`;

const hexCode = `import { hexToRgba } from 'mood-ui';

// Use custom hex colors in calendar events
const background = hexToRgba('#6366f1', 0.12);
// → 'rgba(99, 102, 241, 0.12)'`;

const typesCode = `type EventColor = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'neutral' | 'cyan' | 'purple' | 'fuchsia' | 'pink';

function eventColorClass(color: EventColor): string;
function eventColorClassStrong(color: EventColor): string;
function hexToRgba(hex: string, alpha?: number): string;`;

const apiList = computed<PropDoc[]>(() => [
  {
    name: "eventColorClass",
    type: "(color?: EventColor | null) => string",
    description: t("pages.utilities.eventColors.api.eventColorClass"),
  },
  {
    name: "eventColorClassStrong",
    type: "(color?: EventColor | null) => string",
    description: t("pages.utilities.eventColors.api.eventColorClassStrong"),
  },
  {
    name: "hexToRgba",
    type: "(hex: string, alpha: number) => string",
    description: t("pages.utilities.eventColors.api.hexToRgba"),
  },
]);
</script>

<template>
  <ComponentDoc
    :title="t('pages.utilities.eventColors.title')"
    category="Utilities"
    import-path="import { eventColorClass } from 'mood-ui'"
    :description="t('pages.utilities.eventColors.description')"
    :props-list="apiList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="260px" lang="ts">
        <template #controls>
          <TbPills
            label="Variant"
            :options="[{ value: 'soft' }, { value: 'strong' }]"
            v-model="pgVariant"
          />
        </template>

        <div class="flex flex-col gap-2">
          <div
            v-for="c in colors"
            :key="c"
            class="px-3 py-2 rounded text-sm"
            :class="previewClass(c)"
          >
            {{ c }} — {{ t("pages.utilities.eventColors.playground.event") }}
          </div>
        </div>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.utilities.eventColors.examples.basic.title')"
        :description="t('pages.utilities.eventColors.examples.basic.desc')"
        :code="basicCode"
        min-height="160px"
        lang="ts"
      >
        <div
          class="px-3 py-2 rounded text-sm bg-primary/15 text-primary border-l-2 border-primary"
        >
          {{ t("pages.utilities.eventColors.examples.basic.preview") }}
        </div>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.utilities.eventColors.examples.hex.title')"
        :description="t('pages.utilities.eventColors.examples.hex.desc')"
        :code="hexCode"
        min-height="160px"
        lang="ts"
      >
        <div
          class="px-3 py-2 rounded text-sm"
          :style="{
            backgroundColor: hexToRgba('#6366f1', 0.12),
            color: '#6366f1',
          }"
        >
          {{ t("pages.utilities.eventColors.examples.hex.preview") }}
        </div>
      </ComponentPreview>
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.utilities.eventColors.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.utilities.eventColors.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
