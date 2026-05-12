<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Typography from "../../components/data-display/Typography.vue";
import Card from "../../components/data-display/Card.vue";
import { CursorArrowRaysIcon } from "@heroicons/vue/24/outline";

export interface A11yKeyboardRow {
  keys: string[];
  action: string;
}

export interface A11yAriaRow {
  attribute: string;
  value: string;
  desc: string;
}

defineProps<{
  keyboardRows?: A11yKeyboardRow[];
  ariaRows?: A11yAriaRow[];
  focusNotes?: string[];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Keyboard -->
    <div v-if="keyboardRows?.length" class="flex flex-col gap-3">
      <Typography variant="title" size="small" weight="medium" as="h3">
        {{ t("doc.a11y.keyboard") }}
      </Typography>
      <div class="overflow-hidden rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="px-4 py-2.5 w-[40%] text-xs font-medium text-muted-foreground">
                {{ t("doc.a11y.colKey") }}
              </th>
              <th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                {{ t("doc.a11y.colAction") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in keyboardRows"
              :key="i"
              class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td class="px-4 py-2.5">
                <div class="flex flex-wrap gap-1">
                  <kbd
                    v-for="k in row.keys"
                    :key="k"
                    class="inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded border border-border bg-muted text-foreground"
                  >{{ k }}</kbd>
                </div>
              </td>
              <td class="px-4 py-2.5 text-muted-foreground text-xs">{{ row.action }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ARIA -->
    <div v-if="ariaRows?.length" class="flex flex-col gap-3">
      <Typography variant="title" size="small" weight="medium" as="h3">
        {{ t("doc.a11y.aria") }}
      </Typography>
      <div class="overflow-hidden rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40 text-left">
              <th class="px-4 py-2.5 w-[28%] text-xs font-medium text-muted-foreground">
                {{ t("doc.a11y.colAttr") }}
              </th>
              <th class="px-4 py-2.5 w-[24%] text-xs font-medium text-muted-foreground">
                {{ t("doc.a11y.colValue") }}
              </th>
              <th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                {{ t("doc.a11y.colDesc") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in ariaRows"
              :key="i"
              class="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
            >
              <td class="px-4 py-2.5 font-mono text-xs text-primary">{{ row.attribute }}</td>
              <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ row.value }}</td>
              <td class="px-4 py-2.5 text-muted-foreground text-xs">{{ row.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Focus -->
    <div v-if="focusNotes?.length" class="flex flex-col gap-3">
      <Typography variant="title" size="small" weight="medium" as="h3">
        {{ t("doc.a11y.focus") }}
      </Typography>
      <Card variant="outlined" padding="large">
        <ul class="flex flex-col gap-2.5 list-none p-0 m-0">
          <li
            v-for="(note, i) in focusNotes"
            :key="i"
            class="flex items-start gap-3 text-sm text-muted-foreground"
          >
            <div
              class="size-5 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5"
            >
              <CursorArrowRaysIcon class="size-3" />
            </div>
            {{ note }}
          </li>
        </ul>
      </Card>
    </div>
  </div>
</template>
