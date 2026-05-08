<script setup lang="ts">
defineProps<{
    options: Array<{ value: string; label?: string }>;
    modelValue: string;
    label?: string;
}>();
defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
    <div class="flex items-center gap-1.5">
        <span v-if="label" class="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest shrink-0 hidden sm:inline">{{ label }}</span>
        <div class="inline-flex items-center bg-muted/50 rounded-lg p-0.5 gap-px">
            <button
                v-for="opt in options"
                :key="opt.value"
                type="button"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer capitalize"
                :class="modelValue === opt.value
                    ? 'bg-background text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground'"
                @click="$emit('update:modelValue', opt.value)"
            >{{ opt.label ?? opt.value }}</button>
        </div>
    </div>
</template>
