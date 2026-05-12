<script setup lang="ts">
defineProps<{
    modelValue: boolean;
    label: string;
}>();
defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<template>
    <button
        type="button"
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border"
        :class="modelValue
            ? 'bg-primary/10 text-primary border-primary/30'
            : 'bg-transparent text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/40'"
        @click="$emit('update:modelValue', !modelValue)"
    >{{ label }}</button>
</template>
