<script setup lang="ts">
defineProps<{
    options: Array<{ value: string; bg: string; label?: string }>;
    modelValue: string;
    label?: string;
}>();
defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
    <div class="flex items-center gap-1.5">
        <span v-if="label" class="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest shrink-0 hidden sm:inline">{{ label }}</span>
        <div class="flex items-center gap-1.5">
            <button
                v-for="opt in options"
                :key="opt.value"
                type="button"
                class="size-5 rounded-full transition-all duration-150 shrink-0 cursor-pointer"
                :class="modelValue === opt.value
                    ? 'ring-2 ring-offset-2 ring-foreground/40 scale-110'
                    : 'opacity-50 hover:opacity-90 hover:scale-110'"
                :style="`background: ${opt.bg}`"
                :title="opt.label ?? opt.value"
                @click="$emit('update:modelValue', opt.value)"
            />
        </div>
    </div>
</template>
