<script setup lang="ts">
defineProps<{
  options: Array<{ value: string; bg: string; label?: string }>;
  modelValue: string;
  label?: string;
}>();
defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div class="flex items-center gap-1.5">
    <span
      v-if="label"
      class="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest shrink-0 hidden sm:inline"
    >
      {{ label }}
    </span>
    <div class="flex items-center gap-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="size-5 rounded-full transition-all duration-150 shrink-0 cursor-pointer grid place-items-center"
        :class="
          modelValue === opt.value
            ? 'border-2 border-current bg-transparent'
            : 'opacity-50 hover:opacity-90 hover:scale-110'
        "
        :style="
          modelValue === opt.value
            ? { color: opt.bg }
            : { background: opt.bg }
        "
        :title="opt.label ?? opt.value"
        :aria-pressed="modelValue === opt.value"
        @click="$emit('update:modelValue', opt.value)"
      >
        <!-- Inner dot — same color as the swatch, sized so the total
             visible diameter (border + gap + dot) matches the inactive
             swatches exactly, instead of growing larger like the legacy
             scale-110 + ring-offset design did. -->
        <span
          v-if="modelValue === opt.value"
          class="block size-2 rounded-full"
          :style="{ background: opt.bg }"
        />
      </button>
    </div>
  </div>
</template>
