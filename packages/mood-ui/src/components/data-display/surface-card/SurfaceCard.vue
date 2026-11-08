<template>
  <component
    :is="resolvedTag"
    ref="rootRef"
    v-bind="forwardedAttrs"
    :type="isButton ? type : undefined"
    :role="isLink && !resolvedHref ? 'link' : undefined"
    :href="resolvedHref"
    :target="isLink ? target : undefined"
    :rel="isLink ? rel : undefined"
    :disabled="isButton ? disabled : undefined"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    :tabindex="resolvedTabIndex"
    :aria-label="resolvedAriaLabel"
    data-modo-surface-card=""
    :data-modo-variant="resolvedVariant"
    :data-modo-padding="padding"
    :data-modo-radius="radius"
    :data-modo-size="resolvedSize"
    :data-modo-framed="framed ? '' : undefined"
    :data-modo-interactive="
      props.interactive === false ? 'false' : isInteractive ? '' : undefined
    "
    :data-modo-pressed="isPressed ? '' : undefined"
    :class="[
      'modo-surface-card',
      radiusClasses,
      isButton ? 'text-left w-full' : '',
      isInteractive ? 'focus-visible:outline-none' : '',
      attrs.class,
    ]"
    :style="[attrs.style, cursorStyle]"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @lostpointercapture="handleLostPointerCapture"
  >
    <div class="modo-surface-card__inner" data-modo-surface-card-inner="">
      <slot />
    </div>
  </component>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  useAttrs,
  watch,
  type CSSProperties,
} from "vue";
import type {
  SurfaceCard,
  SurfaceCardCanonicalVariant,
  SurfaceCardRootTag,
  SurfaceCardVariant,
} from "../../../interfaces/data-display/SurfaceCard.interface";
import {
  useResolvedRadius,
  useResolvedSize,
} from "../../../composables/useModoConfig";
import {
  cancelSurfaceCardPress,
  isNestedInteractiveTarget,
  pressSurfaceCard,
  releaseSurfaceCard,
  resetSurfaceCardPress,
} from "./surfaceCardMotion";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SurfaceCard>(), {
  variant: "outline",
  padding: "default",
  framed: true,
  disabled: false,
  type: "button",
  interactive: undefined,
});

const attrs = useAttrs();
const rootRef = ref<HTMLElement | null>(null);
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

function normalizeVariant(
  raw: SurfaceCardVariant | undefined,
): SurfaceCardCanonicalVariant {
  switch (raw) {
    case "elevated":
      return "elevated";
    case "soft":
    case "filled":
      return "soft";
    case "outline":
    case "outlined":
    default:
      return "outline";
  }
}

const resolvedVariant = computed(() => normalizeVariant(props.variant));

const resolvedTag = computed<SurfaceCardRootTag>(() => {
  if (props.as) return props.as;
  if (props.href) return "a";
  return "article";
});

const isButton = computed(() => resolvedTag.value === "button");
const isLink = computed(() => resolvedTag.value === "a");
const isDirectControl = computed(() => isButton.value || isLink.value);

const isInteractive = computed(() => {
  if (props.interactive !== undefined) return props.interactive;
  return isDirectControl.value;
});

const resolvedHref = computed(() =>
  isLink.value && !props.disabled ? props.href : undefined,
);

const resolvedTabIndex = computed(() => {
  if (isLink.value && props.disabled) return -1;
  const raw = attrs.tabindex ?? attrs.tabIndex;
  return raw !== undefined ? (raw as number | string) : undefined;
});

const resolvedAriaLabel = computed(
  () => props.ariaLabel ?? (attrs["aria-label"] as string | undefined),
);

const radius = useResolvedRadius(() => props.radius);
const resolvedSize = useResolvedSize(() => props.size);

/** Same scale as native Card; the concentric inner frame mirrors it in CSS. */
const radiusClasses = computed(() => {
  switch (radius.value) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "large":
      return "rounded-xl";
    case "full":
      return "rounded-3xl";
    case "medium":
    default:
      return "rounded-lg";
  }
});

const cursorStyle = computed<CSSProperties | undefined>(() => {
  if (!isInteractive.value) return undefined;
  if (props.disabled) return { cursor: "not-allowed" };
  return { cursor: "pointer" };
});

watch(
  () => props.disabled,
  (disabled) => {
    if (!disabled) return;
    isPressed.value = false;
    if (!activePressedEl.value) return;
    resetSurfaceCardPress(activePressedEl.value);
    activePressedEl.value = null;
  },
);

function handleClick(event: MouseEvent) {
  if (props.disabled && isInteractive.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  invokeAttrListener(["onClick"], event);
}

function isCardEffectivelyInteractive(el: HTMLElement): boolean {
  if (props.interactive !== undefined) return props.interactive;
  if (isDirectControl.value) return true;
  return Boolean(el.querySelector(".modo-surface-card__stretched-link"));
}

function handlePointerDown(event: PointerEvent) {
  invokeAttrListener(["onPointerdown", "onPointerDown"], event);
  const current = event.currentTarget as HTMLElement | null;
  if (!current) return;

  if (
    !isCardEffectivelyInteractive(current) ||
    props.disabled ||
    event.defaultPrevented ||
    event.button !== 0
  ) {
    return;
  }

  // Never hijack pointer press when clicking an independent inner button/link/input
  if (isNestedInteractiveTarget(current, event.target)) {
    return;
  }

  activePressedEl.value = current;
  isPressed.value = true;
  pressSurfaceCard(
    current,
    event.pointerId,
    event.pointerType || "mouse",
    isDirectControl.value,
  );
}

function handlePointerUp(event: PointerEvent) {
  invokeAttrListener(["onPointerup", "onPointerUp"], event);
  isPressed.value = false;
  const current = event.currentTarget as HTMLElement | null;
  if (current && !props.disabled) {
    releaseSurfaceCard(current, event.pointerId);
  }
  activePressedEl.value = null;
}

function handlePointerCancel(event: PointerEvent) {
  invokeAttrListener(["onPointercancel", "onPointerCancel"], event);
  isPressed.value = false;
  const current = event.currentTarget as HTMLElement | null;
  if (current) {
    cancelSurfaceCardPress(current, event.pointerId);
  }
  activePressedEl.value = null;
}

function handleLostPointerCapture(event: PointerEvent) {
  invokeAttrListener(
    ["onLostpointercapture", "onLostPointerCapture"],
    event,
  );
  isPressed.value = false;
  const current = event.currentTarget as HTMLElement | null;
  if (current) {
    cancelSurfaceCardPress(current, event.pointerId);
  }
  activePressedEl.value = null;
}
</script>

<style scoped>
@layer base {
  /* ==========================================================
   * SurfaceCard — composable surface with a concentric inner frame.
   * Every color, shadow, radius, spacing, type and motion value comes
   * from the provider tokens, with the same mapping as native Card:
   * - `outline`  -> Card `outlined` (bg-card + border-border)
   * - `elevated` -> Card `elevated` (bg-card + border-border + shadow)
   * - `soft`     -> Card `filled`   (bg-muted, no outer border)
   * Hover follows Card: border-border/70 + shadow-md, bg-muted/80, shadow-lg.
   * ========================================================== */
  .modo-surface-card {
    /* Spacing (driven by `size`, medium = Card default p-5) */
    --sc-size-padding: 1.25rem;
    --sc-size-gap: 0.625rem;
    --sc-padding: var(--sc-size-padding);
    --sc-gap: var(--sc-size-gap);
    --sc-frame-inset: 0.3125rem;
    --sc-separator-inset: 0px;

    /* Radius (mirrors the rounded-* class on the root for the inner frame) */
    --sc-radius: var(--radius);

    /* Surface state (variants fill the rest/hover slots) */
    --sc-bg-rest: var(--card);
    --sc-bg-hover: var(--sc-bg-rest);
    --sc-border-rest: var(--border);
    --sc-border-hover: var(--sc-border-rest);
    --sc-elevation-rest: 0 0 0 0 transparent;
    --sc-elevation-hover: var(--sc-elevation-rest);
    --sc-frame-border-rest: var(--border);
    --sc-frame-border-hover: var(--sc-frame-border-rest);
    --sc-subtle-bg: color-mix(in oklab, var(--muted) 60%, transparent);
    --sc-focus-ring: 0 0 0 0 transparent;

    --sc-bg: var(--sc-bg-rest);
    --sc-border: var(--sc-border-rest);
    --sc-elevation: var(--sc-elevation-rest);
    --sc-frame-border: var(--sc-frame-border-rest);

    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--sc-border);
    background: var(--sc-bg);
    color: var(--card-foreground);
    box-shadow: var(--sc-focus-ring), var(--sc-elevation);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition-property: background-color, border-color, box-shadow;
    transition-duration: var(--duration-base);
    transition-timing-function: var(--ease-standard);
  }

  /* Radius scale — same steps as native Card (sm / lg / xl / 3xl) */
  .modo-surface-card[data-modo-radius="none"] {
    --sc-radius: 0px;
  }

  .modo-surface-card[data-modo-radius="small"] {
    --sc-radius: calc(var(--radius) - 4px);
  }

  .modo-surface-card[data-modo-radius="medium"] {
    --sc-radius: var(--radius);
  }

  .modo-surface-card[data-modo-radius="large"] {
    --sc-radius: calc(var(--radius) + 4px);
  }

  .modo-surface-card[data-modo-radius="full"] {
    --sc-radius: 1.5rem;
  }

  /* Size scale (ModoSize) -> padding & gap */
  .modo-surface-card[data-modo-size="xsmall"] {
    --sc-size-padding: 0.75rem;
    --sc-size-gap: 0.375rem;
    --sc-frame-inset: 0.25rem;
  }

  .modo-surface-card[data-modo-size="small"] {
    --sc-size-padding: 1rem;
    --sc-size-gap: 0.5rem;
  }

  .modo-surface-card[data-modo-size="large"] {
    --sc-size-padding: 1.5rem;
    --sc-size-gap: 0.75rem;
  }

  .modo-surface-card[data-modo-padding="none"] {
    --sc-padding: 0px;
    --sc-gap: 0px;
  }

  /* Variants */
  .modo-surface-card[data-modo-variant="outline"] {
    --sc-border-hover: color-mix(in oklab, var(--border) 70%, transparent);
    --sc-frame-border-hover: color-mix(in oklab, var(--border) 70%, transparent);
    --sc-elevation-hover: var(--shadow-md);
  }

  .modo-surface-card[data-modo-variant="elevated"] {
    --sc-elevation-rest: var(--shadow-md);
    --sc-elevation-hover: var(--shadow-lg);
  }

  .modo-surface-card[data-modo-variant="soft"] {
    --sc-bg-rest: var(--muted);
    --sc-bg-hover: color-mix(in oklab, var(--muted) 80%, transparent);
    --sc-border-rest: transparent;
    --sc-subtle-bg: color-mix(in oklab, var(--card) 60%, transparent);
  }

  /* Inner container — transparent zero-cost column when :framed="false",
   * concentric bordered content vessel when framed (default). */
  .modo-surface-card__inner {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border-radius: inherit;
    border: 0 solid transparent;
    background: transparent;
    transition-property: background-color, border-color;
    transition-duration: var(--duration-base);
    transition-timing-function: var(--ease-standard);
  }

  .modo-surface-card[data-modo-framed] {
    padding: var(--sc-frame-inset);
  }

  .modo-surface-card[data-modo-framed] > .modo-surface-card__inner {
    border-width: 1px;
    border-color: var(--sc-frame-border);
    border-radius: max(0px, calc(var(--sc-radius) - var(--sc-frame-inset)));
  }

  /* Interactive hover (direct interactive root OR hovered stretched heading link) */
  .modo-surface-card:is(
      [data-modo-interactive=""],
      :not([data-modo-interactive="false"]):has(
          :deep(.modo-surface-card__stretched-link:hover)
        )
    ):not(:disabled):not([aria-disabled="true"]):hover {
    --sc-bg: var(--sc-bg-hover);
    --sc-border: var(--sc-border-hover);
    --sc-elevation: var(--sc-elevation-hover);
    --sc-frame-border: var(--sc-frame-border-hover);
  }

  /* Focus — native ring (ring-2 ring-ring/60), composed with the elevation */
  .modo-surface-card:focus-visible:not([data-modo-pressed]),
  .modo-surface-card:has(
      :deep(.modo-surface-card__stretched-link:focus-visible)
    ):not([data-modo-pressed]) {
    outline: none;
    --sc-focus-ring: 0 0 0 2px color-mix(in oklab, var(--ring) 60%, transparent);
  }

  .modo-surface-card[data-modo-pressed]:focus,
  .modo-surface-card[data-modo-pressed]:focus-visible {
    outline: none;
  }

  .modo-surface-card:disabled,
  .modo-surface-card[aria-disabled="true"] {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Stretched-link pattern (keeps nested buttons/links operable above the stretched ::after) */
  .modo-surface-card:has(:deep(.modo-surface-card__stretched-link))
    :deep(
      :where(
        a:not(.modo-surface-card__stretched-link),
        button,
        input,
        select,
        textarea,
        summary,
        [role="button"]
      )
    ) {
    position: relative;
    z-index: 1;
  }

  .modo-surface-card :deep(.modo-surface-card__stretched-link) {
    color: inherit;
    text-decoration: none;
  }

  .modo-surface-card :deep(.modo-surface-card__stretched-link::after) {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .modo-surface-card :deep(.modo-surface-card__stretched-link:focus-visible) {
    outline: none;
  }

  /* ==========================================================
   * Composable Anatomy Parts (Media, Header, Title, Subtitle, Body, Footer, Separator)
   * ========================================================== */
  .modo-surface-card :deep(.modo-surface-card__media) {
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .modo-surface-card :deep(.modo-surface-card__media-img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .modo-surface-card :deep(.modo-surface-card__media-overlay) {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: var(--sc-padding);
  }

  .modo-surface-card :deep(.modo-surface-card__header) {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: var(--sc-padding) var(--sc-padding) 0;
  }

  .modo-surface-card :deep(.modo-surface-card__title) {
    margin: 0;
    font-size: var(--text-body-lg);
    line-height: var(--text-body-lg--line-height);
    font-weight: var(--text-title--font-weight);
    letter-spacing: var(--text-title--letter-spacing);
    color: inherit;
  }

  .modo-surface-card :deep(.modo-surface-card__title-link) {
    color: inherit;
    text-decoration: none;
  }

  .modo-surface-card :deep(.modo-surface-card__subtitle) {
    margin: 0;
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
    color: var(--muted-foreground);
  }

  .modo-surface-card :deep(.modo-surface-card__body) {
    padding: var(--sc-gap) var(--sc-padding);
    font-size: var(--text-body);
    font-weight: 400;
    line-height: var(--text-body--line-height);
  }

  /* Compact sizes step the type scale down one notch */
  .modo-surface-card[data-modo-size="xsmall"] :deep(.modo-surface-card__title),
  .modo-surface-card[data-modo-size="small"] :deep(.modo-surface-card__title) {
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
  }

  .modo-surface-card[data-modo-size="xsmall"] :deep(.modo-surface-card__subtitle),
  .modo-surface-card[data-modo-size="xsmall"] :deep(.modo-surface-card__body) {
    font-size: var(--text-caption);
    line-height: var(--text-caption--line-height);
  }

  .modo-surface-card :deep(.modo-surface-card__footer) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--sc-gap);
    padding: var(--sc-gap) var(--sc-padding) var(--sc-padding);
  }

  .modo-surface-card :deep(.modo-surface-card__footer[data-modo-align="between"]) {
    justify-content: space-between;
  }

  .modo-surface-card :deep(.modo-surface-card__footer[data-modo-align="start"]) {
    justify-content: flex-start;
  }

  .modo-surface-card :deep(.modo-surface-card__footer[data-modo-align="stretch"]) {
    justify-content: stretch;
  }

  /* Hairline separator (<hr> using border-top so forced-colors and print preserve it) */
  .modo-surface-card :deep(.modo-surface-card__separator) {
    flex: none;
    height: 0;
    margin: 0 var(--sc-separator-inset);
    border: 0;
    border-top: 1px solid var(--border);
  }

  .modo-surface-card
    :deep(.modo-surface-card__separator[data-modo-inset="content"]) {
    --sc-separator-inset: var(--sc-padding);
  }

  /* Per-section subtle plane (grouped-settings header/footer/row wash) */
  .modo-surface-card
    :deep(.modo-surface-card__header[data-modo-surface="subtle"]),
  .modo-surface-card
    :deep(.modo-surface-card__body[data-modo-surface="subtle"]),
  .modo-surface-card
    :deep(.modo-surface-card__footer[data-modo-surface="subtle"]) {
    background: var(--sc-subtle-bg);
  }

  /* When a subtle header sits at the top without a separator, give it balanced bottom breathing room */
  .modo-surface-card
    :deep(.modo-surface-card__header[data-modo-surface="subtle"]) {
    padding-bottom: var(--sc-gap);
  }

  /* Per-section padding="none": zero the spacing tokens so first/last-child rules also resolve to 0 */
  .modo-surface-card
    :deep(.modo-surface-card__header[data-modo-padding="none"]),
  .modo-surface-card
    :deep(.modo-surface-card__body[data-modo-padding="none"]),
  .modo-surface-card
    :deep(.modo-surface-card__footer[data-modo-padding="none"]) {
    --sc-padding: 0px;
    --sc-gap: 0px;
  }

  /* Header/Footer adjacent to a separator get balanced breathing room */
  .modo-surface-card__inner
    > :deep(.modo-surface-card__header:has(+ .modo-surface-card__separator)) {
    padding-bottom: var(--sc-gap);
  }

  .modo-surface-card__inner
    > :deep(.modo-surface-card__separator + .modo-surface-card__footer) {
    padding-top: var(--sc-gap);
  }

  /* First/last part & adjacent-to-separator/media vertical spacing adjustments */
  .modo-surface-card__inner > :deep(.modo-surface-card__body:first-child) {
    padding-top: var(--sc-padding);
  }

  .modo-surface-card__inner
    > :deep(.modo-surface-card__media + .modo-surface-card__body) {
    padding-top: var(--sc-padding);
  }

  .modo-surface-card__inner
    > :deep(.modo-surface-card__separator + .modo-surface-card__body) {
    padding-top: calc(var(--sc-gap) * 1.5);
  }

  .modo-surface-card__inner
    > :deep(.modo-surface-card__body:has(+ .modo-surface-card__separator)) {
    padding-bottom: calc(var(--sc-gap) * 1.5);
  }

  .modo-surface-card__inner > :deep(.modo-surface-card__body:last-child) {
    padding-bottom: var(--sc-padding);
  }

  .modo-surface-card__inner > :deep(.modo-surface-card__header:last-child) {
    padding-bottom: var(--sc-padding);
  }

  .modo-surface-card__inner > :deep(.modo-surface-card__footer:first-child) {
    padding-top: var(--sc-padding);
  }

  @media (prefers-contrast: more) {
    .modo-surface-card {
      --sc-border-rest: var(--muted-foreground);
      --sc-frame-border-rest: var(--muted-foreground);
    }

    .modo-surface-card :deep(.modo-surface-card__separator) {
      border-top-color: var(--muted-foreground);
    }

    .modo-surface-card :deep(.modo-surface-card__subtitle) {
      color: var(--foreground);
    }
  }

  @media (forced-colors: active) {
    .modo-surface-card,
    .modo-surface-card[data-modo-framed] > .modo-surface-card__inner {
      border-color: CanvasText;
    }

    .modo-surface-card :deep(.modo-surface-card__separator) {
      border-top-color: CanvasText;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .modo-surface-card,
    .modo-surface-card__inner {
      transition: none;
    }
  }
}
</style>
