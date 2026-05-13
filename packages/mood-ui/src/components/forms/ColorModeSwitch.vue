<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/vue/24/outline";
import type { ModoTheme } from "../../config/ModoConfig";

const props = withDefaults(
  defineProps<{
    modelValue: ModoTheme;
    /** Accessible name for the radiogroup. */
    ariaLabel?: string;
    /** Show text labels next to each icon. */
    showLabels?: boolean;
    /** Size variant. */
    size?: "small" | "medium" | "large";
    /** Disabled state — prevents selection changes. */
    disabled?: boolean;
    /**
     * `default` — always shows all three options.
     * `collapsed` — shows only the active option at rest; expands on hover (mouse)
     *               or on first tap (touch) to reveal all three.
     */
    variant?: "default" | "collapsed";
  }>(),
  {
    ariaLabel: "Color mode",
    showLabels: false,
    size: "medium",
    disabled: false,
    variant: "default",
  },
);

const emit = defineEmits<{ "update:modelValue": [v: ModoTheme] }>();

const options: { value: ModoTheme; icon: object; label: string }[] = [
  { value: "light", icon: SunIcon, label: "Light" },
  { value: "system", icon: ComputerDesktopIcon, label: "System" },
  { value: "dark", icon: MoonIcon, label: "Dark" },
];

const trackEl = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);
const indicatorStyle = ref<Record<string, string>>({
  opacity: "0",
  left: "0",
  top: "0",
});
const firstMeasureDone = ref(false);

// ── Collapsed variant expand state ───────────────────────────────────────────
const isExpanded = ref(false);

function setItemRef(el: unknown, idx: number) {
  if (el) itemRefs.value[idx] = el as HTMLElement;
}

function activeIndex(): number {
  const i = options.findIndex((o) => o.value === props.modelValue);
  return i >= 0 ? i : 1;
}

function measure(animated: boolean) {
  const track = trackEl.value;
  const item = itemRefs.value[activeIndex()];
  if (!track || !item) return;
  if (item.offsetWidth === 0 && item.offsetHeight === 0) return;

  indicatorStyle.value = {
    transform: `translate3d(${item.offsetLeft}px, ${item.offsetTop}px, 0)`,
    width: `${item.offsetWidth}px`,
    height: `${item.offsetHeight}px`,
    top: "0",
    left: "0",
    opacity: "1",
    transition: animated
      ? "transform 280ms cubic-bezier(0.4,0,0.2,1), width 280ms cubic-bezier(0.4,0,0.2,1)"
      : "none",
  };
  firstMeasureDone.value = true;
}

// After the max-width CSS transition ends the active button's offsetLeft has
// changed (siblings expanded/collapsed), so we snap the indicator.
function onTransitionEnd() {
  if (props.variant === "collapsed") measure(false);
}

// ── Pointer handlers — work for both mouse and touch ─────────────────────────
function onTrackPointerEnter(e: PointerEvent) {
  if (props.variant !== "collapsed" || props.disabled) return;
  // Mouse/pen: expand immediately on hover.
  if (e.pointerType !== "touch") isExpanded.value = true;
}

function onTrackPointerLeave(e: PointerEvent) {
  if (props.variant !== "collapsed") return;
  if (e.pointerType !== "touch") isExpanded.value = false;
}

// Collapse when the user taps/clicks outside the track.
function onDocumentPointerDown(e: PointerEvent) {
  if (props.variant !== "collapsed" || !isExpanded.value) return;
  if (trackEl.value && !trackEl.value.contains(e.target as Node)) {
    isExpanded.value = false;
  }
}

function pick(v: ModoTheme) {
  if (props.disabled) return;
  // Touch UX: first tap expands, second tap selects.
  if (props.variant === "collapsed" && !isExpanded.value) {
    isExpanded.value = true;
    return;
  }
  emit("update:modelValue", v);
  if (props.variant === "collapsed") isExpanded.value = false;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
let ro: ResizeObserver | null = null;
onMounted(() => {
  requestAnimationFrame(() => requestAnimationFrame(() => measure(false)));
  if (typeof ResizeObserver !== "undefined" && trackEl.value) {
    ro = new ResizeObserver(() => measure(false));
    ro.observe(trackEl.value);
  }
  window.addEventListener("resize", onResize);
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
});
onBeforeUnmount(() => {
  ro?.disconnect();
  window.removeEventListener("resize", onResize);
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
});
function onResize() {
  measure(false);
}

watch(
  () => props.modelValue,
  () => nextTick(() => measure(firstMeasureDone.value)),
);
watch(
  () => props.showLabels,
  () => nextTick(() => measure(false)),
);
watch(
  () => props.variant,
  () => {
    isExpanded.value = false;
    nextTick(() => measure(false));
  },
);
watch(isExpanded, () => nextTick(() => measure(false)));

const sz = {
  small: {
    track: "p-0.5",
    gap: "gap-0.5",
    btn: "w-7 h-7",
    icon: "w-3.5 h-3.5",
    lbl: "text-xs px-2 h-7",
  },
  medium: {
    track: "p-0.5",
    gap: "gap-0.5",
    btn: "w-8 h-8",
    icon: "w-4 h-4",
    lbl: "text-sm px-2.5 h-8",
  },
  large: {
    track: "p-1",
    gap: "gap-1",
    btn: "w-10 h-10",
    icon: "w-5 h-5",
    lbl: "text-sm px-3 h-10",
  },
};
</script>

<template>
  <div
    ref="trackEl"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    class="relative inline-flex items-center rounded-full border border-border bg-muted/40"
    :class="[
      sz[size].track,
      variant === 'collapsed' ? 'gap-0' : sz[size].gap,
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    @transitionend.self.stop="onTransitionEnd"
    @pointerenter="onTrackPointerEnter"
    @pointerleave="onTrackPointerLeave"
  >
    <!-- Sliding indicator -->
    <span
      class="absolute pointer-events-none rounded-full bg-card shadow-sm border border-border/60"
      :style="indicatorStyle"
    />

    <template v-for="(opt, i) in options" :key="opt.value">
      <!--
                collapsed variant: JS isExpanded controls max-width so the same
                logic works on both mouse (pointerenter/leave) and touch (tap).
            -->
      <span
        v-if="variant === 'collapsed'"
        class="overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out"
        :class="
          modelValue !== opt.value
            ? isExpanded
              ? 'max-w-32 opacity-100'
              : 'max-w-0 opacity-0'
            : 'max-w-32 opacity-100'
        "
        @transitionend.stop="onTransitionEnd"
      >
        <button
          :ref="(el) => setItemRef(el, i)"
          type="button"
          role="radio"
          :aria-checked="modelValue === opt.value"
          :aria-label="opt.label"
          :disabled="disabled"
          class="modo-color-mode-option relative z-10 inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-150"
          :class="[
            showLabels ? sz[size].lbl : sz[size].btn,
            modelValue === opt.value
              ? 'text-foreground'
              : 'hover:text-foreground',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          ]"
          @click="pick(opt.value)"
        >
          <component :is="opt.icon" :class="sz[size].icon" />
          <span v-if="showLabels" class="ml-1 select-none">{{
            opt.label
          }}</span>
        </button>
      </span>

      <!-- default variant -->
      <button
        v-else
        :ref="(el) => setItemRef(el, i)"
        type="button"
        role="radio"
        :aria-checked="modelValue === opt.value"
        :aria-label="opt.label"
        :disabled="disabled"
        class="modo-color-mode-option relative z-10 inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-150"
        :class="[
          showLabels ? sz[size].lbl : sz[size].btn,
          modelValue === opt.value
            ? 'text-foreground'
            : 'hover:text-foreground',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ]"
        @click="pick(opt.value)"
      >
        <component :is="opt.icon" :class="sz[size].icon" />
        <span v-if="showLabels" class="ml-1 select-none">{{ opt.label }}</span>
      </button>
    </template>
  </div>
</template>
