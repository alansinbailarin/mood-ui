<template>
  <Skeleton
    v-if="skeleton"
    shape="button"
    :size="resolvedModoSize"
    :radius="radius"
    :fullWidth="fullWidth"
    :class="attrs.class"
    :style="attrs.style"
  />

  <component
    :is="rootTag"
    v-else
    ref="rootRef"
    v-bind="forwardedAttrs"
    :type="isLink ? undefined : type"
    :role="isLink && !linkHref ? 'link' : undefined"
    :href="linkHref"
    :target="isLink ? target : undefined"
    :rel="isLink ? rel : undefined"
    :disabled="isLink ? undefined : isEffectivelyDisabled"
    :aria-disabled="isLink && isEffectivelyDisabled ? 'true' : undefined"
    :tabindex="resolvedTabIndex"
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="resolvedAriaLabel"
    data-modo-press-button=""
    :data-modo-variant="resolvedVariant"
    :data-modo-color="resolvedColor"
    :data-modo-size="resolvedModoSize"
    :data-modo-pressed="isPressed ? '' : undefined"
    :data-modo-loading="loading ? '' : undefined"
    :data-modo-icon-only="isIconOnly ? '' : undefined"
    :data-modo-full-width="fullWidth ? '' : undefined"
    :data-modo-in-press-group="isInPressGroup ? '' : undefined"
    :data-modo-gradient="gradient && resolvedVariant === 'normal' ? '' : undefined"
    :class="[
      'modo-press-button relative inline-flex items-center justify-center overflow-hidden border font-medium select-none no-underline cursor-pointer',
      CONTROL_FOCUS_RING,
      isInPressGroup ? 'focus-visible:ring-inset' : '',
      isIconOnly ? 'min-w-0' : 'min-w-max',
      sizeClasses,
      radiusClasses,
      haloClasses,
      fullWidth ? 'w-full' : '',
      attrs.class,
    ]"
    :style="[attrs.style, cursorStyle]"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @lostpointercapture="handleLostPointerCapture"
  >
    <span ref="bodyRef" class="modo-press-button__body">
      <span
        :aria-hidden="loading ? 'true' : undefined"
        :class="['modo-press-button__content', sz.gap]"
      >
        <template v-if="isIconOnly">
          <span
            aria-hidden="true"
            :class="['modo-press-button__icon modo-press-button__icon--only', iconSizeClasses]"
          >
            <slot v-if="slots.default" />
            <slot v-else-if="slots.startIcon" name="startIcon" />
            <slot v-else-if="slots.endIcon" name="endIcon" />
            <component
              :is="iconOnlyComponent"
              v-else-if="iconOnlyComponent"
              :class="iconSizeClasses"
            />
          </span>
        </template>

        <template v-else>
          <span
            v-if="hasStartIcon"
            aria-hidden="true"
            :class="['modo-press-button__icon modo-press-button__icon--start', iconSizeClasses]"
          >
            <slot name="startIcon">
              <component
                :is="resolvedStartIcon"
                v-if="resolvedStartIcon"
                :class="iconSizeClasses"
              />
            </slot>
          </span>

          <slot>{{ label }}</slot>

          <span
            v-if="hasEndIcon"
            aria-hidden="true"
            :class="['modo-press-button__icon modo-press-button__icon--end', iconSizeClasses]"
          >
            <slot name="endIcon">
              <component
                :is="resolvedEndIcon"
                v-if="resolvedEndIcon"
                :class="iconSizeClasses"
              />
            </slot>
          </span>
        </template>
      </span>

      <span v-if="loading" :class="['modo-press-button__loading', sz.gap]">
        <span
          aria-hidden="true"
          :class="['modo-press-button__spinner', iconSizeClasses]"
        />
        <span v-if="hasLoadingText" class="modo-press-button__loading-text">
          <slot name="loadingText">{{ loadingText }}</slot>
        </span>
        <span v-else class="sr-only">{{ loc.common.loading }}</span>
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  ref,
  useAttrs,
  useSlots,
  watch,
  type CSSProperties,
} from "vue";
import type {
  PressButton,
  PressButtonVariant,
} from "../../interfaces/forms/PressButton.interface";
import type { ModoColor, ModoRadius, ModoSize } from "../../config/ModoConfig";
import { normalizeSize } from "../../config/sizes";
import {
  useModoLocale,
  useResolvedColor,
  useResolvedHalo,
  useResolvedRadius,
  useResolvedSize,
  useSizeTokens,
} from "../../composables/useModoConfig";
import { CONTROL_FOCUS_RING } from "../../composables/useField";
import Skeleton from "../feedback/Skeleton.vue";
import {
  cancelButtonPress,
  cancelGroupSegmentBody,
  pressButton,
  pressGroupSegmentBody,
  releaseButton,
  releaseGroupSegmentBody,
  resetButtonPress,
  resetGroupSegmentBody,
} from "./pressButtonMotion";

defineOptions({ inheritAttrs: false });

type GroupInjection = {
  isPressGroup?: boolean;
  variant?: string;
  color?: string;
  size?: string;
  radius?: string;
  disabled?: boolean;
  gradient?: boolean;
  fullWidth?: boolean;
  onButtonPressStart?: (el: HTMLElement) => void;
  onButtonPressEnd?: (el: HTMLElement, cancelled: boolean) => void;
};

const pressGroupProps = inject<GroupInjection | null>("pressButtonGroup", null);
const legacyGroupProps = inject<GroupInjection>("buttonGroup", {});
const groupProps = computed<GroupInjection>(
  () => pressGroupProps ?? legacyGroupProps,
);
const isInPressGroup = computed(() => Boolean(pressGroupProps?.isPressGroup));
const isInGroup = computed(() => Object.keys(groupProps.value).length > 0);

const props = withDefaults(defineProps<PressButton>(), {
  disabled: false,
  loading: false,
  variant: "normal",
  color: "default",
  gradient: false,
  type: "button",
  as: "button",
  iconOnly: false,
  fullWidth: false,
  iconPosition: "left",
  skeleton: false,
});

const attrs = useAttrs();
const slots = useSlots();
const rootRef = ref<HTMLButtonElement | HTMLAnchorElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const activePressedEl = ref<HTMLElement | null>(null);
const isPressed = ref(false);

defineExpose({ el: rootRef });

const MANAGED_ATTR_KEYS = new Set([
  "class",
  "style",
  "aria-label",
  "tabindex",
  "tabIndex",
  "onClick",
  "onPointerdown",
  "onPointerDown",
  "onPointerup",
  "onPointerUp",
  "onPointercancel",
  "onPointerCancel",
  "onLostpointercapture",
  "onLostPointerCapture",
]);

const forwardedAttrs = computed(() => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (!MANAGED_ATTR_KEYS.has(key)) {
      out[key] = value;
    }
  }
  return out;
});

function invokeAttrListener(names: string[], event: Event) {
  for (const name of names) {
    const listener = attrs[name];
    if (typeof listener === "function") {
      listener(event);
    } else if (Array.isArray(listener)) {
      for (const fn of listener) {
        if (typeof fn === "function") fn(event);
      }
    }
  }
}

const halo = useResolvedHalo();
const loc = useModoLocale();

const isDisabled = computed(() => groupProps.value.disabled ?? props.disabled);
const isEffectivelyDisabled = computed(() => isDisabled.value || props.loading);
const isLink = computed(() => props.as === "a");
const rootTag = computed(() => (isLink.value ? "a" : "button"));
const linkHref = computed(() =>
  isLink.value && !isEffectivelyDisabled.value ? props.href : undefined,
);

const resolvedTabIndex = computed(() => {
  if (isLink.value && isEffectivelyDisabled.value) return -1;
  const raw = attrs.tabindex ?? attrs.tabIndex;
  return raw !== undefined ? (raw as number | string) : undefined;
});

// Same precedence as the native Button: inside a group the group's variant,
// size, radius, disabled, gradient and fullWidth win; an explicit (non-default)
// color on the child still overrides the group's color.
const resolvedVariant = computed<PressButtonVariant>(
  () => (groupProps.value.variant as PressButtonVariant | undefined) ?? props.variant,
);

const resolvedColor = useResolvedColor(() => {
  if (props.color !== "default") return props.color;
  return (groupProps.value.color as ModoColor | undefined) ?? props.color;
});

const radius = useResolvedRadius(
  () => (groupProps.value.radius as ModoRadius | undefined) ?? props.radius,
);

// The native ButtonGroup may still pass the legacy 'xs' alias; normalise it.
const localSize = computed<ModoSize | undefined>(() => {
  const raw = (groupProps.value.size as string | undefined) ?? props.size;
  return raw === undefined ? undefined : normalizeSize(raw);
});
const resolvedModoSize = useResolvedSize(() => localSize.value);
const sz = useSizeTokens(() => localSize.value);
const gradient = computed(() => groupProps.value.gradient ?? props.gradient);
const fullWidth = computed(() => groupProps.value.fullWidth ?? props.fullWidth);

const hasStartIcon = computed(() =>
  Boolean(
    slots.startIcon ||
      props.startIcon ||
      (props.icon && props.iconPosition === "left"),
  ),
);

const hasEndIcon = computed(() =>
  Boolean(
    slots.endIcon ||
      props.endIcon ||
      (props.icon && props.iconPosition === "right"),
  ),
);

const resolvedStartIcon = computed(
  () =>
    props.startIcon ??
    (props.iconPosition === "left" ? props.icon : undefined),
);

const resolvedEndIcon = computed(
  () =>
    props.endIcon ??
    (props.iconPosition === "right" ? props.icon : undefined),
);

const iconOnlyComponent = computed(
  () => props.icon ?? props.startIcon ?? props.endIcon,
);

const isIconOnly = computed(() => {
  if (props.iconOnly) return true;
  const hasVisibleText = Boolean(props.label || slots.default);
  const hasAnyIcon = Boolean(
    iconOnlyComponent.value || slots.startIcon || slots.endIcon,
  );
  return !hasVisibleText && hasAnyIcon;
});

const hasLoadingText = computed(
  () =>
    !isIconOnly.value &&
    (Boolean(slots.loadingText) ||
      (props.loadingText !== undefined &&
        props.loadingText !== null &&
        props.loadingText !== "")),
);

const resolvedAriaLabel = computed(() => {
  const explicit =
    props.ariaLabel ?? (attrs["aria-label"] as string | undefined);
  if (explicit) return explicit;
  if (!isIconOnly.value && (props.label || slots.default)) return undefined;
  if (import.meta.env.DEV && isIconOnly.value) {
    console.warn(
      "[mood-ui] <PressButton> is icon-only but has no `ariaLabel` — add one for screen readers.",
    );
  }
  return undefined;
});

const cursorStyle = computed<CSSProperties | undefined>(() => {
  if (isEffectivelyDisabled.value) return { cursor: "not-allowed" };
  if (props.cursor) return { cursor: props.cursor };
  return undefined;
});

const sizeClasses = computed(() => {
  if (isIconOnly.value) {
    // icon-only: square, height = control height (same as the native Button)
    return `${sz.value.control} aspect-square px-0 justify-center ${sz.value.text}`;
  }
  return `${sz.value.control} ${sz.value.text} ${sz.value.padX}`;
});

const radiusClasses = computed(() => {
  switch (radius.value) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "large":
      return "rounded-lg";
    case "full":
      return "rounded-[999px]";
    default:
      return "rounded-md";
  }
});

const haloClasses = computed(() => {
  // Idle/hover halo identical to the native Button. The focus ring comes from
  // CONTROL_FOCUS_RING and reuses the same ring, so the halo is never wiped.
  // Suppressed inside groups (the group draws one halo around the whole bar).
  if (isInGroup.value) return "";
  if (resolvedVariant.value !== "normal" && resolvedVariant.value !== "outline") {
    return "";
  }
  const haloMode = halo.value;
  if (haloMode === "off") return "";
  if (haloMode === "neutral") {
    return "ring-[3px] ring-foreground/10 hover:ring-foreground/15";
  }
  const map: Record<ModoColor, string> = {
    default: "ring-[3px] ring-foreground/10 hover:ring-foreground/15",
    primary: "ring-[3px] ring-primary/15 hover:ring-primary/25",
    danger: "ring-[3px] ring-destructive/15 hover:ring-destructive/25",
    success: "ring-[3px] ring-success/15 hover:ring-success/25",
    warning: "ring-[3px] ring-warning/15 hover:ring-warning/25",
  };
  return map[resolvedColor.value] ?? map.default;
});

const iconSizeClasses = computed(() => sz.value.icon);

watch(isEffectivelyDisabled, (disabled) => {
  if (!disabled) return;
  isPressed.value = false;
  if (!activePressedEl.value) return;
  if (isInPressGroup.value) {
    resetGroupSegmentBody(activePressedEl.value, bodyRef.value);
    pressGroupProps?.onButtonPressEnd?.(activePressedEl.value, true);
  } else {
    resetButtonPress(activePressedEl.value);
  }
  activePressedEl.value = null;
});

function handleClick(event: MouseEvent) {
  if (isEffectivelyDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  invokeAttrListener(["onClick"], event);
}

function handlePointerDown(event: PointerEvent) {
  invokeAttrListener(["onPointerdown", "onPointerDown"], event);
  if (
    event.defaultPrevented ||
    isEffectivelyDisabled.value ||
    event.button !== 0
  ) {
    return;
  }
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  activePressedEl.value = target;
  isPressed.value = true;
  if (isInPressGroup.value) {
    pressGroupSegmentBody(
      target,
      bodyRef.value,
      event.pointerId,
      event.pointerType || "mouse",
    );
    pressGroupProps?.onButtonPressStart?.(target);
  } else {
    pressButton(target, event.pointerId, event.pointerType || "mouse");
  }
}

function handlePointerUp(event: PointerEvent) {
  invokeAttrListener(["onPointerup", "onPointerUp"], event);
  isPressed.value = false;
  const target = event.currentTarget as HTMLElement | null;
  if (!isEffectivelyDisabled.value && target) {
    if (isInPressGroup.value) {
      if (releaseGroupSegmentBody(target, bodyRef.value, event.pointerId)) {
        pressGroupProps?.onButtonPressEnd?.(target, false);
      }
    } else {
      releaseButton(target, event.pointerId);
    }
  }
  activePressedEl.value = null;
}

function handlePointerCancel(event: PointerEvent) {
  invokeAttrListener(["onPointercancel", "onPointerCancel"], event);
  isPressed.value = false;
  const target = event.currentTarget as HTMLElement | null;
  if (target) {
    if (isInPressGroup.value) {
      if (cancelGroupSegmentBody(target, bodyRef.value, event.pointerId)) {
        pressGroupProps?.onButtonPressEnd?.(target, true);
      }
    } else {
      cancelButtonPress(target, event.pointerId);
    }
  }
  activePressedEl.value = null;
}

function handleLostPointerCapture(event: PointerEvent) {
  invokeAttrListener(
    ["onLostpointercapture", "onLostPointerCapture"],
    event,
  );
  isPressed.value = false;
  const target = event.currentTarget as HTMLElement | null;
  if (target) {
    if (isInPressGroup.value) {
      if (cancelGroupSegmentBody(target, bodyRef.value, event.pointerId)) {
        pressGroupProps?.onButtonPressEnd?.(target, true);
      }
    } else {
      cancelButtonPress(target, event.pointerId);
    }
  }
  activePressedEl.value = null;
}
</script>

<style scoped>
.modo-press-button {
  isolation: isolate;
  border-color: var(--pb-border, transparent);
  background-color: var(--pb-bg, var(--foreground));
  color: var(--pb-color, var(--background));
  -webkit-tap-highlight-color: transparent;
  /* Same timing as the native Button (duration-base / ease-standard). */
  transition-property:
    border-radius, background-color, border-color, color, box-shadow, opacity,
    --tw-ring-color, --tw-ring-shadow;
  transition-duration: var(--duration-base, 220ms);
  transition-timing-function: var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* ==========================================================
 * Color tokens — same semantic tokens as the native Button:
 * solid / solid-hover / solid-active  → normal fill
 * soft / soft-hover / soft-active      → outline/text hover, ghost fill
 * line                                 → outline border
 * ========================================================== */
.modo-press-button[data-modo-color="default"] {
  --pb-solid: var(--foreground);
  --pb-solid-hover: color-mix(in oklab, var(--foreground) 90%, transparent);
  --pb-solid-active: color-mix(in oklab, var(--foreground) 80%, transparent);
  --pb-on-solid: var(--background);
  --pb-fg: var(--foreground);
  --pb-line: var(--border);
  --pb-soft: var(--muted);
  --pb-soft-hover: var(--muted-hover);
  --pb-soft-active: var(--accent-hover);
}

.modo-press-button[data-modo-color="primary"] {
  --pb-solid: var(--primary);
  --pb-solid-hover: var(--primary-hover);
  --pb-solid-active: var(--primary-active);
  --pb-on-solid: var(--primary-foreground);
  --pb-fg: var(--primary);
  --pb-line: color-mix(in oklab, var(--primary) 40%, transparent);
  --pb-soft: var(--primary-subtle);
  --pb-soft-hover: color-mix(in oklab, var(--primary) 20%, transparent);
  --pb-soft-active: color-mix(in oklab, var(--primary) 25%, transparent);
}

.modo-press-button[data-modo-color="danger"] {
  --pb-solid: var(--destructive);
  --pb-solid-hover: var(--destructive-hover);
  --pb-solid-active: var(--destructive-active);
  --pb-on-solid: var(--destructive-foreground);
  --pb-fg: var(--destructive);
  --pb-line: color-mix(in oklab, var(--destructive) 40%, transparent);
  --pb-soft: var(--destructive-subtle);
  --pb-soft-hover: color-mix(in oklab, var(--destructive) 20%, transparent);
  --pb-soft-active: color-mix(in oklab, var(--destructive) 25%, transparent);
}

.modo-press-button[data-modo-color="success"] {
  --pb-solid: var(--success);
  --pb-solid-hover: var(--success-hover);
  --pb-solid-active: var(--success-active);
  --pb-on-solid: var(--success-foreground);
  --pb-fg: var(--success);
  --pb-line: color-mix(in oklab, var(--success) 40%, transparent);
  --pb-soft: var(--success-subtle);
  --pb-soft-hover: color-mix(in oklab, var(--success) 20%, transparent);
  --pb-soft-active: color-mix(in oklab, var(--success) 25%, transparent);
}

.modo-press-button[data-modo-color="warning"] {
  --pb-solid: var(--warning);
  --pb-solid-hover: var(--warning-hover);
  --pb-solid-active: var(--warning-active);
  --pb-on-solid: var(--warning-foreground);
  --pb-fg: var(--warning);
  --pb-line: color-mix(in oklab, var(--warning) 40%, transparent);
  --pb-soft: var(--warning-subtle);
  --pb-soft-hover: color-mix(in oklab, var(--warning) 20%, transparent);
  --pb-soft-active: color-mix(in oklab, var(--warning) 25%, transparent);
}

/* ==========================================================
 * Variants (same names and states as the native Button)
 * ========================================================== */
.modo-press-button[data-modo-variant="normal"] {
  --pb-bg: var(--pb-solid);
  --pb-bg-hover: var(--pb-solid-hover);
  --pb-bg-active: var(--pb-solid-active);
  --pb-color: var(--pb-on-solid);
  --pb-border: transparent;
}

.modo-press-button[data-modo-variant="outline"] {
  --pb-bg: transparent;
  --pb-bg-hover: var(--pb-soft);
  --pb-bg-active: var(--pb-soft-hover);
  --pb-color: var(--pb-fg);
  --pb-border: var(--pb-line);
}

.modo-press-button[data-modo-variant="ghost"] {
  --pb-bg: var(--pb-soft);
  --pb-bg-hover: var(--pb-soft-hover);
  --pb-bg-active: var(--pb-soft-active);
  --pb-color: var(--pb-fg);
  --pb-border: transparent;
}

.modo-press-button[data-modo-variant="text"] {
  --pb-bg: transparent;
  --pb-bg-hover: var(--pb-soft);
  --pb-bg-active: var(--pb-soft-hover);
  --pb-color: var(--pb-fg);
  --pb-border: transparent;
}

/* Gradient (normal only) — same stops as the native Button's gradient mode:
 * from-{c} via-{c}/90 to-{c}/90, swapping {c} for the hover/active token. */
.modo-press-button[data-modo-gradient] {
  --pb-grad: var(--pb-solid);
  background-image: linear-gradient(
    to right,
    var(--pb-grad),
    color-mix(in oklab, var(--pb-grad) 90%, transparent),
    color-mix(in oklab, var(--pb-grad) 90%, transparent)
  );
}

.modo-press-button:hover:not(:disabled):not([aria-disabled="true"]) {
  background-color: var(--pb-bg-hover);
  --pb-grad: var(--pb-solid-hover);
}

.modo-press-button[data-modo-pressed]:not(:disabled):not([aria-disabled="true"]),
.modo-press-button:active:not(:disabled):not([aria-disabled="true"]) {
  background-color: var(--pb-bg-active);
  --pb-grad: var(--pb-solid-active);
}

/* Instant CSS press fallback when JS motion is unavailable */
.modo-press-button:not([data-modo-in-press-group]):active:not(:disabled):not([aria-disabled="true"]) {
  transform: translateY(1px) scale(0.98);
}

/* Inside PressButtonGroup, the unified contour handles border/shape; never detach the button box */
.modo-press-button[data-modo-in-press-group] {
  border-width: 0;
  border-radius: 0;
}

@media (forced-colors: active) {
  .modo-press-button:focus-visible {
    outline: 2px solid ButtonText;
    outline-offset: 2px;
  }
}

/* Disabled like the native Button: keep the variant look at 40% opacity. */
.modo-press-button:disabled,
.modo-press-button[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.4;
}

/* ==========================================================
 * Stacked Content & Zero-Shift Loading Grid
 * ========================================================== */
.modo-press-button__body {
  display: inline-grid;
  align-items: center;
  justify-items: center;
}

.modo-press-button__content,
.modo-press-button__loading {
  grid-area: 1 / 1;
}

.modo-press-button__content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modo-press-button[data-modo-loading] .modo-press-button__content {
  opacity: 0;
}

/* Icon wrappers carry the size token (sz.icon); slot SVGs fill them. */
.modo-press-button__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
}

.modo-press-button__icon :deep(svg) {
  flex: none;
  width: 100%;
  height: 100%;
}

.modo-press-button__loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.modo-press-button__loading-text {
  display: inline-flex;
  align-items: center;
}

/* Sized by the sz.icon token class. */
.modo-press-button__spinner {
  flex: none;
  border: 2px solid color-mix(in oklab, currentColor 32%, transparent);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: modo-press-button-spin 700ms linear infinite;
}

@keyframes modo-press-button-spin {
  to {
    transform: rotate(1turn);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modo-press-button {
    transition: none;
  }

  .modo-press-button:active:not(:disabled):not([aria-disabled="true"]) {
    transform: none;
  }

  .modo-press-button__spinner {
    animation-duration: 1.6s;
  }
}
</style>
