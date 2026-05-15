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
        class="modo-switcher-panel"
        :style="{ maxHeight: panelMaxHeightStyle }"
      >
        <!-- Items / search / footer slots come in later tasks -->
      </div>
    </PopoverPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronUpDownIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import PopoverPanel from "../layout/PopoverPanel.vue";
import { usePopover } from "../../composables/usePopover";
import {
  useResolvedRadius,
  useModoLocale,
} from "../../composables/useModoConfig";
import type {
  Switcher as SwitcherProps,
  SwitcherEmits,
  SwitcherItem,
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

const resolvedPlaceholder = computed(
  () => props.placeholder ?? locale.value.switcher.placeholder,
);
const resolvedAriaLabel = computed(
  () => props.ariaLabel ?? locale.value.switcher.ariaLabel,
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

defineExpose({ open, close, toggle });
</script>
