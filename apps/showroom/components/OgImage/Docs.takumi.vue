<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    category?: string;
  }>(),
  {
    title: "mood-ui",
    description: "",
    category: "",
  },
);

// Renderers have no reliable multi-line clamp; trim to one readable line so
// long component descriptions never overflow the card.
const desc = computed(() =>
  props.description.length > 110
    ? props.description.slice(0, 107).trimEnd() + "…"
    : props.description,
);
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between"
    style="padding: 80px; background-color: #0b0b0f; font-family: 'Poppins', sans-serif;"
  >
    <!-- brand wordmark -->
    <div class="flex items-center" style="gap: 16px;">
      <div
        style="width: 44px; height: 44px; border-radius: 12px; background-image: linear-gradient(135deg, #6366f1, #8b5cf6);"
      />
      <span style="font-size: 34px; font-weight: 600; color: #ffffff;">mood-ui</span>
    </div>

    <!-- title block -->
    <div class="flex flex-col" style="gap: 14px;">
      <span
        v-if="category"
        style="font-size: 26px; letter-spacing: 6px; color: #8b8b9a; text-transform: uppercase;"
        >{{ category }}</span
      >
      <span style="font-size: 76px; font-weight: 800; line-height: 1.05; color: #ffffff;">{{
        title
      }}</span>
      <span v-if="desc" style="font-size: 28px; color: #a1a1aa; max-width: 940px;">{{
        desc
      }}</span>
    </div>

    <!-- footer: accent bar + url -->
    <div class="flex items-center justify-between">
      <div
        style="width: 220px; height: 8px; border-radius: 9999px; background-image: linear-gradient(90deg, #6366f1, #8b5cf6);"
      />
      <span style="font-size: 26px; color: #71717a;">mood-ui.com</span>
    </div>
  </div>
</template>
