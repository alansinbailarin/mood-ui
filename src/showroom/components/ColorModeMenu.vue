<script setup lang="ts">
import { ref, computed } from 'vue';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline';

import Button from '../../components/forms/Button.vue';
import Tooltip from '../../components/feedback/Tooltip.vue';
import PopoverPanel from '../../components/layout/PopoverPanel.vue';
import { usePopover } from '../../composables/usePopover';

import type { ModoTheme } from '../../config/ModoConfig';

const props = defineProps<{ modelValue: ModoTheme }>();
const emit = defineEmits<{ 'update:modelValue': [v: ModoTheme] }>();

const { triggerRef, panelRef, isOpen, panelStyle, toggle, close } = usePopover({
    placement: 'bottom-end',
    offset: 8,
});

const options = [
    { value: 'light' as const,  label: 'Claro',   icon: SunIcon },
    { value: 'dark' as const,   label: 'Oscuro',  icon: MoonIcon },
    { value: 'system' as const, label: 'Sistema', icon: ComputerDesktopIcon },
];

const currentIcon = computed(() => {
    if (props.modelValue === 'light') return SunIcon;
    if (props.modelValue === 'dark') return MoonIcon;
    return ComputerDesktopIcon;
});

function pick(v: ModoTheme) {
    emit('update:modelValue', v);
    close();
}
</script>

<template>
    <span ref="triggerRef" class="inline-flex">
        <Tooltip :content="`Modo: ${modelValue}`">
            <Button
                variant="ghost"
                size="small"
                icon-only
                aria-label="Cambiar modo"
                :aria-expanded="isOpen"
                @click="toggle"
            >
                <component :is="currentIcon" class="w-5 h-5" />
            </Button>
        </Tooltip>
    </span>

    <PopoverPanel
        :open="isOpen"
        :style="panelStyle"
        radius="medium"
        role="menu"
        aria-label="Modo de color"
        @update:panelRef="panelRef = $event"
    >
        <div class="w-44 p-1.5">
            <button
                v-for="opt in options"
                :key="opt.value"
                type="button"
                role="menuitem"
                class="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm transition-colors"
                :class="modelValue === opt.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted/60'"
                @click="pick(opt.value)"
            >
                <component :is="opt.icon" class="w-4 h-4" />
                <span>{{ opt.label }}</span>
                <span v-if="modelValue === opt.value" class="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
        </div>
    </PopoverPanel>
</template>
