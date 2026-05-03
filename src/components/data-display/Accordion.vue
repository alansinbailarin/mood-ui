<template>
    <div
        :class="[
            'w-full',
            variant === 'separated' ? 'flex flex-col gap-2' : '',
            variant === 'bordered' ? `border border-border ${rootRadiusClasses} overflow-hidden divide-y divide-border` : '',
            variant === 'flush' ? 'divide-y divide-border' : '',
        ]"
    >
        <div
            v-for="item in items"
            :key="item.value"
            :class="[
                variant === 'separated' ? `border border-border ${rootRadiusClasses} overflow-hidden bg-card` : '',
                item.disabled ? 'opacity-60' : '',
            ]"
        >
            <h3 class="m-0">
                <button
                    type="button"
                    :id="`accordion-trigger-${item.value}`"
                    :aria-expanded="isOpen(item.value)"
                    :aria-controls="`accordion-panel-${item.value}`"
                    :aria-disabled="item.disabled || undefined"
                    :disabled="item.disabled"
                    :class="[
                        'group w-full flex items-center gap-3 text-left transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30',
                        triggerSizeClasses,
                        item.disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted/40',
                        iconPosition === 'start' ? 'flex-row' : 'flex-row',
                    ]"
                    @click="toggle(item.value)"
                >
                    <ChevronDownIcon
                        v-if="iconPosition === 'start'"
                        :class="[
                            'shrink-0 text-muted-foreground transition-transform duration-200',
                            chevronSizeClasses,
                            isOpen(item.value) ? 'rotate-180' : 'rotate-0',
                        ]"
                        aria-hidden="true"
                    />
                    <component
                        :is="item.icon"
                        v-if="item.icon"
                        :class="['shrink-0 text-muted-foreground', chevronSizeClasses]"
                        aria-hidden="true"
                    />
                    <span :class="['flex-1 font-medium text-foreground', titleSizeClasses]">
                        {{ item.title }}
                    </span>
                    <ChevronDownIcon
                        v-if="iconPosition === 'end'"
                        :class="[
                            'shrink-0 text-muted-foreground transition-transform duration-200',
                            chevronSizeClasses,
                            isOpen(item.value) ? 'rotate-180' : 'rotate-0',
                        ]"
                        aria-hidden="true"
                    />
                </button>
            </h3>

            <div
                :id="`accordion-panel-${item.value}`"
                role="region"
                :aria-labelledby="`accordion-trigger-${item.value}`"
                :class="[
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    isOpen(item.value) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                ]"
            >
                <div class="overflow-hidden">
                    <div :class="[contentSizeClasses, 'text-foreground/80']">
                        <slot :name="`item-${item.value}`" :item="item">
                            {{ item.content }}
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import type { Accordion, AccordionItem } from '../../interfaces/data-display/Accordion.interface';
import { useResolvedRadius, useResolvedSize } from '../../composables/useModoConfig';

const props = withDefaults(defineProps<Accordion>(), {
    multiple: false,
    variant: 'separated',
    iconPosition: 'end',
});

const emit = defineEmits<{
    'update:modelValue': [value: Accordion['modelValue']];
    'change': [value: Accordion['modelValue']];
}>();

const resolvedSize = useResolvedSize(() => props.size);
const resolvedRadius = useResolvedRadius(() => props.radius);

function isOpen(value: string | number): boolean {
    const m = props.modelValue;
    if (props.multiple) {
        return Array.isArray(m) ? m.includes(value) : false;
    }
    return m === value;
}

function toggle(value: string | number) {
    const item = props.items.find((i) => i.value === value);
    if (item?.disabled) return;
    if (props.multiple) {
        const arr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        const idx = arr.indexOf(value);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(value);
        emit('update:modelValue', arr);
        emit('change', arr);
    } else {
        const next = props.modelValue === value ? null : value;
        emit('update:modelValue', next);
        emit('change', next);
    }
}

const rootRadiusClasses = computed(() => {
    switch (resolvedRadius.value) {
        case 'none':   return 'rounded-none';
        case 'small':  return 'rounded';
        case 'large':  return 'rounded-xl';
        case 'full':   return 'rounded-2xl';
        case 'medium':
        default:       return 'rounded-lg';
    }
});

const triggerSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'px-3 py-2 text-sm';
        case 'large':  return 'px-5 py-4 text-base';
        case 'medium':
        default:       return 'px-4 py-3 text-sm';
    }
});

const titleSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'text-sm';
        case 'large':  return 'text-base';
        case 'medium':
        default:       return 'text-sm';
    }
});

const chevronSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'w-4 h-4';
        case 'large':  return 'w-5 h-5';
        case 'medium':
        default:       return 'w-4 h-4';
    }
});

const contentSizeClasses = computed(() => {
    switch (resolvedSize.value) {
        case 'small':  return 'px-3 pb-3 text-xs';
        case 'large':  return 'px-5 pb-4 text-base';
        case 'medium':
        default:       return 'px-4 pb-3 text-sm';
    }
});
</script>
