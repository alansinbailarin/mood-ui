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
  props.description.length > 104
    ? props.description.slice(0, 101).trimEnd() + "…"
    : props.description,
);
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between"
    style="padding: 80px; background-color: #09090b; font-family: 'Poppins', sans-serif;"
  >
    <!-- brand lockup: real M mark + wordmark -->
    <div class="flex items-center" style="gap: 18px;">
      <img src="/og-logo.png" width="64" height="57" />
      <span style="font-size: 35px; font-weight: 600; color: #fafafa; letter-spacing: -0.5px;"
        >mood-ui</span
      >
    </div>

    <!-- title block -->
    <div class="flex flex-col" style="gap: 18px;">
      <span
        v-if="category"
        style="font-size: 23px; font-weight: 600; letter-spacing: 4px; color: #6b6b76; text-transform: uppercase;"
        >{{ category }}</span
      >
      <span
        style="font-size: 82px; font-weight: 800; line-height: 1.0; letter-spacing: -2px; color: #fafafa;"
        >{{ title }}</span
      >
      <span v-if="desc" style="font-size: 29px; line-height: 1.35; color: #9b9ba6; max-width: 880px;"
        >{{ desc }}</span
      >
    </div>

    <!-- footer: hairline + value-prop tagline + domain -->
    <div class="flex flex-col">
      <div style="width: 100%; height: 1px; background-color: #27272a; margin-bottom: 26px;" />
      <div class="flex items-center justify-between">
        <span style="font-size: 23px; color: #6b6b76;">Vue 3 · TypeScript · Tailwind v4</span>
        <span style="font-size: 23px; font-weight: 500; color: #d4d4d8;">mood-ui.com</span>
      </div>
    </div>
  </div>
</template>
