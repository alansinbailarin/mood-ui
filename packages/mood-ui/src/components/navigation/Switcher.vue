<template>
  <div class="modo-switcher inline-flex" :class="{ 'w-full': fullWidth }">
    <button
      ref="triggerEl"
      type="button"
      data-modo-switcher-trigger
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-label="resolvedAriaLabel"
      :disabled="disabled"
      :class="[
        'inline-flex items-center gap-3 px-3 py-2 text-left transition-colors',
        'border bg-card text-card-foreground border-border',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        radiusClass,
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="onTriggerClick"
    >
      <span v-if="activeItem?.avatar" class="shrink-0">
        <Avatar
          :src="activeItem.avatar.src"
          :initials="activeItem.avatar.initials"
          :name="activeItem.title"
          size="small"
        />
      </span>
      <span
        v-else-if="activeItem?.icon"
        class="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent/60 text-foreground"
      >
        <component :is="activeItem.icon" class="w-5 h-5" aria-hidden="true" />
      </span>
      <span class="flex flex-col min-w-0 flex-1">
        <span class="truncate text-body font-medium">
          {{ activeItem ? activeItem.title : resolvedPlaceholder }}
        </span>
        <span
          v-if="!compactTrigger && activeItem?.subtitle"
          class="truncate text-caption text-muted-foreground"
        >
          {{ activeItem.subtitle }}
        </span>
      </span>
      <ChevronUpDownIcon
        v-if="chevron === 'updown'"
        class="w-4 h-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <ChevronDownIcon
        v-else-if="chevron === 'down'"
        class="w-4 h-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>

    <PopoverPanel
      :open="isOpen"
      :style="panelStyle"
      :radius="resolvedRadius"
      role="dialog"
      :aria-label="resolvedAriaLabel"
      @update:panelRef="panelRef = $event"
    >
      <div
        data-modo-switcher-panel
        class="modo-switcher-panel overflow-y-auto"
        :style="{ maxHeight: panelMaxHeightStyle }"
      >
        <div
          v-if="panelTitle"
          class="px-3 pt-3 pb-2 text-caption text-muted-foreground uppercase tracking-wider"
        >
          {{ panelTitle }}
        </div>

        <template v-if="loading">
          <slot name="loading">
            <div class="p-2 flex flex-col gap-1">
              <div
                v-for="i in 3"
                :key="i"
                data-modo-switcher-skeleton
              >
                <Skeleton height="44px" />
              </div>
            </div>
          </slot>
        </template>

        <template v-else-if="items.length === 0">
          <slot name="empty">
            <div class="px-3 py-6 text-center text-muted-foreground text-body">
              {{ resolvedEmptyText }}
            </div>
          </slot>
        </template>

        <ul
          v-else
          role="listbox"
          :id="listboxId"
          class="flex flex-col py-1"
        >
          <li
            v-for="(item, idx) in items"
            :key="item.value"
            role="option"
            :id="`${listboxId}-opt-${idx}`"
            :aria-selected="String(item.value === modelValue)"
            :aria-current="item.value === modelValue ? 'true' : undefined"
            :aria-disabled="item.disabled || undefined"
            :data-active="item.value === modelValue || undefined"
            :tabindex="-1"
            class="modo-switcher-item flex items-center gap-3 px-3 py-2 cursor-pointer"
            :class="[
              item.value === modelValue ? 'bg-accent/40' : 'hover:bg-accent',
              item.disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            @click="selectItem(item)"
          >
            <span v-if="item.avatar" class="shrink-0">
              <Avatar
                :src="item.avatar.src"
                :initials="item.avatar.initials"
                :name="item.title"
                size="small"
              />
            </span>
            <span
              v-else-if="item.icon"
              data-modo-switcher-iconwrap
              class="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md bg-accent/60 text-foreground"
            >
              <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
            </span>
            <span class="flex flex-col min-w-0 flex-1">
              <span class="truncate text-body font-medium">{{ item.title }}</span>
              <span
                v-if="item.subtitle"
                class="truncate text-caption text-muted-foreground"
              >{{ item.subtitle }}</span>
            </span>
            <CheckIcon
              v-if="item.value === modelValue"
              class="w-4 h-4 shrink-0"
              aria-hidden="true"
            />
          </li>
        </ul>
      </div>
    </PopoverPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch, watchEffect } from "vue";
import { ChevronUpDownIcon, ChevronDownIcon, CheckIcon } from "@heroicons/vue/24/outline";
import PopoverPanel from "../layout/PopoverPanel.vue";
import Avatar from "../data-display/avatar/Avatar.vue";
import Skeleton from "../feedback/Skeleton.vue";
import { usePopover } from "../../composables/usePopover";
import {
  useResolvedRadius,
  useModoLocale,
} from "../../composables/useModoConfig";
import type {
  Switcher as SwitcherProps,
  SwitcherEmits,
  SwitcherItem,
  SwitcherValue,
} from "../../interfaces/navigation/Switcher.interface";

const props = withDefaults(defineProps<SwitcherProps>(), {
  modelValue: null,
  chevron: "updown",
  triggerVariant: "outline",
  compactTrigger: false,
  fullWidth: false,
  panelWidth: "trigger",
  panelMaxHeight: 320,
  placement: "bottom-start",
  searchable: false,
  loading: false,
  disabled: false,
});

const emit = defineEmits<SwitcherEmits>();

const locale = useModoLocale();
const resolvedRadius = useResolvedRadius(() => props.radius);
const listboxId = useId();

const resolvedPlaceholder = computed(
  () => props.placeholder ?? locale.value.switcher.placeholder,
);
const resolvedAriaLabel = computed(
  () => props.ariaLabel ?? locale.value.switcher.ariaLabel,
);
const resolvedEmptyText = computed(
  () => props.emptyText ?? locale.value.switcher.empty,
);

const radiusClass = computed(() => {
  switch (resolvedRadius.value) {
    case "none": return "rounded-none";
    case "small": return "rounded-sm";
    case "large": return "rounded-lg";
    case "full": return "rounded-full";
    default: return "rounded-md";
  }
});

const panelMaxHeightStyle = computed(() => {
  const v = props.panelMaxHeight;
  return typeof v === "number" ? `${v}px` : v;
});

const activeItem = computed<SwitcherItem | null>(() => {
  if (props.modelValue == null) return null;
  return props.items.find((i) => i.value === props.modelValue) ?? null;
});

const {
  triggerRef,
  panelRef,
  isOpen,
  panelStyle,
  open,
  close,
  toggle,
} = usePopover({
  placement: () => props.placement,
  matchTriggerWidth: () => props.panelWidth === "trigger",
  onOpen: () => emit("open"),
  onClose: () => emit("close"),
});

const triggerEl = ref<HTMLElement | null>(null);
watch(triggerEl, (el) => {
  triggerRef.value = el;
});

function onTriggerClick() {
  if (props.disabled) return;
  toggle();
}

function selectItem(item: SwitcherItem) {
  if (item.disabled || props.disabled) return;
  emit("update:modelValue", item.value);
  emit("change", item.value, item);
  close();
}

// Dev-only: warn once per offending item when both icon and avatar are set.
if (import.meta.env?.DEV ?? true) {
  const warned = new Set<SwitcherValue>();
  watchEffect(() => {
    for (const item of props.items) {
      if (item.icon && item.avatar && !warned.has(item.value)) {
        warned.add(item.value);
        console.warn(
          `[Switcher] item "${item.value}" declares both \`icon\` and \`avatar\`; \`avatar\` wins. Pick one.`,
        );
      }
    }
  });
}

defineExpose({ open, close, toggle });
</script>
