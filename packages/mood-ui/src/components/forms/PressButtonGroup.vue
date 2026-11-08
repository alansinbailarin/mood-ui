<template>
  <div
    ref="groupRef"
    role="group"
    :aria-label="ariaLabel"
    data-modo-press-button-group=""
    :data-modo-group-radius="resolvedRadius"
    :data-modo-group-size="resolvedModoSize"
    :data-modo-variant="effectiveVariant"
    :data-modo-color="resolvedColor"
    :data-modo-halo="effectiveHaloAttr"
    :data-modo-disabled="disabled ? '' : undefined"
    :class="[
      'modo-press-button-group relative inline-flex isolate',
      orientation === 'vertical'
        ? 'flex-col press-group-vertical'
        : 'flex-row press-group-horizontal',
      radiusClasses,
      props.fullWidth ? 'w-full press-group-full' : '',
    ]"
  >
    <!-- Morphed outer halo (rendered behind the clipped button track so it bends with the press curve) -->
    <svg
      v-if="svgReady && showHalo && geometry.strokePathD"
      aria-hidden="true"
      class="modo-press-group__svg modo-press-group__svg--halo"
      :viewBox="`0 0 ${groupW} ${groupH}`"
    >
      <path :d="geometry.strokePathD" class="modo-press-group__halo" />
    </svg>

    <!-- Unified button track clipped to the continuous C1 Bezier contour -->
    <div
      ref="trackRef"
      :class="[
        'modo-press-group__track inline-flex',
        orientation === 'vertical' ? 'flex-col w-full' : 'flex-row',
        props.fullWidth ? 'w-full' : '',
        !svgReady ? ['modo-press-group__track--fallback', radiusClasses] : '',
      ]"
      :style="trackClipStyle"
    >
      <slot />
    </div>

    <!-- Crisp 1px unified border & internal dividers morphed in lockstep with the clip contour -->
    <svg
      v-if="svgReady && geometry.strokePathD"
      aria-hidden="true"
      class="modo-press-group__svg modo-press-group__svg--stroke"
      :viewBox="`0 0 ${groupW} ${groupH}`"
    >
      <line
        v-for="(div, idx) in geometry.dividers"
        :key="idx"
        :x1="div.x1"
        :y1="div.y1"
        :x2="div.x2"
        :y2="div.y2"
        class="modo-press-group__divider"
      />
      <path :d="geometry.strokePathD" class="modo-press-group__border" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
  watchEffect,
  type CSSProperties,
} from "vue";
import type { PressButtonGroup } from "../../interfaces/forms/PressButtonGroup.interface";
import type { PressButtonVariant } from "../../interfaces/forms/PressButton.interface";
import {
  useResolvedColor,
  useResolvedHalo,
  useResolvedRadius,
  useResolvedSize,
} from "../../composables/useModoConfig";
import {
  buildHorizontalGroupGeometry,
  buildVerticalGroupGeometry,
  type GroupMorphGeometry,
} from "./pressButtonGroupGeometry";
import { readDurationToken } from "./pressButtonMotion";

const props = withDefaults(defineProps<PressButtonGroup>(), {
  orientation: "horizontal",
  variant: "normal",
  fullWidth: false,
});

const groupRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);

// Everything resolves from props + provider (reactive), never from the DOM.
const resolvedColor = useResolvedColor(() => props.color);
const resolvedRadius = useResolvedRadius(() => props.radius);
const resolvedModoSize = useResolvedSize(() => props.size);
const resolvedHalo = useResolvedHalo();
const effectiveVariant = computed<PressButtonVariant>(() => props.variant);

// Same rule as the native ButtonGroup: the halo only wraps `normal` groups.
const showHalo = computed(
  () => effectiveVariant.value === "normal" && resolvedHalo.value !== "off",
);

const effectiveHaloAttr = computed(() => {
  if (!showHalo.value) return undefined;
  return resolvedHalo.value === "neutral" ? "neutral" : "tinted";
});

// Identical to Button / ButtonGroup so the outer corners match a lone button.
const radiusClasses = computed(() => {
  switch (resolvedRadius.value) {
    case "none":
      return "rounded-none";
    case "small":
      return "rounded-sm";
    case "large":
      return "rounded-lg";
    case "full":
      return "rounded-[999px]";
    case "medium":
    default:
      return "rounded-md";
  }
});

/* ── Layout measurement & continuous Bezier spring state ───────────── */
const groupW = ref(0);
const groupH = ref(0);
const outerRadiusPx = ref(8);
const seams = ref<number[]>([]);
const pressValues = ref<number[]>([]);

interface SegmentTween {
  from: number;
  to: number;
  startTime: number;
  duration: number;
}

const activeTweens = new Map<number, SegmentTween>();
let rafId: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;

function shouldReduceMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Pixel values of the classes in `radiusClasses` with the default
 * `--radius: 0.5rem` (style.css: --radius-sm = radius - 4px, --radius-md =
 * radius - 2px, --radius-lg = radius). Only used when computed styles are
 * unavailable; the measured border-radius wins otherwise.
 */
function fallbackRadiusByToken(): number {
  switch (resolvedRadius.value) {
    case "none":
      return 0;
    case "small":
      return 4;
    case "large":
      return 8;
    case "full":
      return 999;
    case "medium":
    default:
      return 6;
  }
}

function getSegmentElements(): HTMLElement[] {
  const track = trackRef.value;
  if (!track) return [];
  const out: HTMLElement[] = [];
  for (let i = 0; i < track.children.length; i++) {
    const child = track.children[i];
    if (child instanceof HTMLElement) {
      out.push(child);
    }
  }
  return out;
}

function measureLayout() {
  const track = trackRef.value;
  const group = groupRef.value;
  if (!track || !group) return;

  const children = getSegmentElements();
  if (children.length === 0) {
    groupW.value = 0;
    groupH.value = 0;
    seams.value = [];
    pressValues.value = [];
    return;
  }

  const w = track.offsetWidth;
  const h = track.offsetHeight;
  groupW.value = w;
  groupH.value = h;

  if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
    const parsed = parseFloat(window.getComputedStyle(group).borderTopLeftRadius);
    outerRadiusPx.value = Number.isFinite(parsed) ? parsed : fallbackRadiusByToken();
  } else {
    outerRadiusPx.value = fallbackRadiusByToken();
  }

  const nextSeams: number[] = [0];
  if (props.orientation === "vertical") {
    for (let i = 0; i < children.length - 1; i++) {
      const nextEl = children[i + 1]!;
      nextSeams.push(nextEl.offsetTop);
    }
    nextSeams.push(h);
  } else {
    for (let i = 0; i < children.length - 1; i++) {
      const nextEl = children[i + 1]!;
      nextSeams.push(nextEl.offsetLeft);
    }
    nextSeams.push(w);
  }
  seams.value = nextSeams;

  if (pressValues.value.length !== children.length) {
    const nextPress = new Array(children.length).fill(0);
    for (let i = 0; i < Math.min(pressValues.value.length, children.length); i++) {
      nextPress[i] = pressValues.value[i] ?? 0;
    }
    pressValues.value = nextPress;
  }
}

// The contour is tweened in JS (rAF), so the curves are functions; durations
// come from --duration-fast / --duration-slow (see onButtonPressStart/End).
function easePressOut(t: number): number {
  // Fast deceleration (press-in)
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

function easeReleaseSpring(t: number): number {
  // Elastic return to flush bar (0 -> 1)
  const inv = 1 - t;
  return 1 - inv * inv * inv * inv;
}

function stepAnimations(now: number) {
  rafId = null;
  if (activeTweens.size === 0) return;

  const next = pressValues.value.slice();
  for (const [idx, tween] of activeTweens.entries()) {
    const rawT =
      tween.duration <= 0 ? 1 : Math.min(1, (now - tween.startTime) / tween.duration);
    const eased =
      tween.to > tween.from ? easePressOut(rawT) : easeReleaseSpring(rawT);
    const val = tween.from + (tween.to - tween.from) * eased;

    if (idx >= 0 && idx < next.length) {
      next[idx] = rawT >= 1 ? tween.to : val;
    }
    if (rawT >= 1) {
      activeTweens.delete(idx);
    }
  }
  pressValues.value = next;

  if (activeTweens.size > 0 && typeof requestAnimationFrame === "function") {
    rafId = requestAnimationFrame(stepAnimations);
  }
}

function animateSegmentTo(index: number, target: number, duration: number) {
  if (index < 0 || index >= pressValues.value.length) return;
  if (shouldReduceMotion() || typeof requestAnimationFrame !== "function") {
    activeTweens.delete(index);
    const next = pressValues.value.slice();
    next[index] = 0;
    pressValues.value = next;
    return;
  }

  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const current = pressValues.value[index] ?? 0;
  activeTweens.set(index, {
    from: current,
    to: target,
    startTime: now,
    duration,
  });

  if (rafId === null) {
    rafId = requestAnimationFrame(stepAnimations);
  }
}

function onButtonPressStart(el: HTMLElement) {
  measureLayout();
  const children = getSegmentElements();
  const idx = children.indexOf(el);
  if (idx === -1) return;
  animateSegmentTo(idx, 1, readDurationToken(groupRef.value, "fast"));
}

function onButtonPressEnd(el: HTMLElement, cancelled: boolean) {
  const children = getSegmentElements();
  const idx = children.indexOf(el);
  if (idx === -1) return;
  animateSegmentTo(
    idx,
    0,
    readDurationToken(groupRef.value, cancelled ? "fast" : "slow"),
  );
}

const svgReady = computed(
  () => groupW.value > 2 && groupH.value > 2 && pressValues.value.length > 0,
);

const geometry = computed<GroupMorphGeometry>(() => {
  if (!svgReady.value) {
    return { clipPathD: "", strokePathD: "", dividers: [] };
  }
  if (props.orientation === "vertical") {
    return buildVerticalGroupGeometry(
      groupW.value,
      groupH.value,
      outerRadiusPx.value,
      seams.value,
      pressValues.value,
    );
  }
  return buildHorizontalGroupGeometry(
    groupW.value,
    groupH.value,
    outerRadiusPx.value,
    seams.value,
    pressValues.value,
  );
});

const trackClipStyle = computed<CSSProperties | undefined>(() => {
  if (!svgReady.value || !geometry.value.clipPathD) return undefined;
  return {
    clipPath: `path('${geometry.value.clipPathD}')`,
  };
});

const groupCtx = reactive<{
  isPressGroup: boolean;
  variant?: PressButtonGroup["variant"];
  color?: PressButtonGroup["color"];
  size?: PressButtonGroup["size"];
  radius?: PressButtonGroup["radius"];
  disabled?: PressButtonGroup["disabled"];
  gradient?: PressButtonGroup["gradient"];
  fullWidth?: PressButtonGroup["fullWidth"];
  onButtonPressStart: (el: HTMLElement) => void;
  onButtonPressEnd: (el: HTMLElement, cancelled: boolean) => void;
}>({
  isPressGroup: true,
  onButtonPressStart,
  onButtonPressEnd,
});

watchEffect(() => {
  groupCtx.variant = effectiveVariant.value;
  groupCtx.color = resolvedColor.value;
  groupCtx.size = props.size;
  groupCtx.radius = resolvedRadius.value;
  groupCtx.disabled = props.disabled;
  groupCtx.gradient = props.gradient;
  groupCtx.fullWidth = props.fullWidth;
});

provide("pressButtonGroup", groupCtx);

watch(
  () => [
    resolvedRadius.value,
    resolvedModoSize.value,
    props.orientation,
    props.fullWidth,
  ],
  () => {
    nextTick(() => measureLayout());
  },
);

onMounted(() => {
  measureLayout();

  if (typeof ResizeObserver !== "undefined" && trackRef.value) {
    resizeObserver = new ResizeObserver(() => measureLayout());
    resizeObserver.observe(trackRef.value);
    for (const child of getSegmentElements()) {
      resizeObserver.observe(child);
    }
  }

  if (typeof MutationObserver !== "undefined" && trackRef.value) {
    mutationObserver = new MutationObserver(() => {
      measureLayout();
      if (resizeObserver) {
        resizeObserver.disconnect();
        if (trackRef.value) resizeObserver.observe(trackRef.value);
        for (const child of getSegmentElements()) {
          resizeObserver.observe(child);
        }
      }
    });
    mutationObserver.observe(trackRef.value, { childList: true });
  }
});

onBeforeUnmount(() => {
  if (rafId !== null && typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  activeTweens.clear();
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
});
</script>

<style scoped>
/* ==========================================================
 * Contour tokens — same semantic tokens as PressButton / native Button.
 * Halo: same ring opacities as the native ButtonGroup
 * (rest / hover / focus-within).
 * ========================================================== */
.modo-press-button-group[data-modo-color="default"] {
  --pbg-solid-active: color-mix(in oklab, var(--foreground) 80%, transparent);
  --pbg-line: var(--border);
  --pbg-soft-hover: var(--muted-hover);
  --pbg-halo: color-mix(in oklab, var(--foreground) 10%, transparent);
  --pbg-halo-hover: color-mix(in oklab, var(--foreground) 15%, transparent);
  --pbg-halo-focus: color-mix(in oklab, var(--foreground) 25%, transparent);
}

.modo-press-button-group[data-modo-color="primary"] {
  --pbg-solid-active: var(--primary-active);
  --pbg-line: color-mix(in oklab, var(--primary) 40%, transparent);
  --pbg-soft-hover: color-mix(in oklab, var(--primary) 20%, transparent);
  --pbg-halo: color-mix(in oklab, var(--primary) 15%, transparent);
  --pbg-halo-hover: color-mix(in oklab, var(--primary) 25%, transparent);
  --pbg-halo-focus: color-mix(in oklab, var(--primary) 35%, transparent);
}

.modo-press-button-group[data-modo-color="danger"] {
  --pbg-solid-active: var(--destructive-active);
  --pbg-line: color-mix(in oklab, var(--destructive) 40%, transparent);
  --pbg-soft-hover: color-mix(in oklab, var(--destructive) 20%, transparent);
  --pbg-halo: color-mix(in oklab, var(--destructive) 15%, transparent);
  --pbg-halo-hover: color-mix(in oklab, var(--destructive) 25%, transparent);
  --pbg-halo-focus: color-mix(in oklab, var(--destructive) 35%, transparent);
}

.modo-press-button-group[data-modo-color="success"] {
  --pbg-solid-active: var(--success-active);
  --pbg-line: color-mix(in oklab, var(--success) 40%, transparent);
  --pbg-soft-hover: color-mix(in oklab, var(--success) 20%, transparent);
  --pbg-halo: color-mix(in oklab, var(--success) 15%, transparent);
  --pbg-halo-hover: color-mix(in oklab, var(--success) 25%, transparent);
  --pbg-halo-focus: color-mix(in oklab, var(--success) 35%, transparent);
}

.modo-press-button-group[data-modo-color="warning"] {
  --pbg-solid-active: var(--warning-active);
  --pbg-line: color-mix(in oklab, var(--warning) 40%, transparent);
  --pbg-soft-hover: color-mix(in oklab, var(--warning) 20%, transparent);
  --pbg-halo: color-mix(in oklab, var(--warning) 15%, transparent);
  --pbg-halo-hover: color-mix(in oklab, var(--warning) 25%, transparent);
  --pbg-halo-focus: color-mix(in oklab, var(--warning) 35%, transparent);
}

.modo-press-button-group[data-modo-halo="neutral"] {
  --pbg-halo: color-mix(in oklab, var(--foreground) 10%, transparent);
  --pbg-halo-hover: color-mix(in oklab, var(--foreground) 15%, transparent);
  --pbg-halo-focus: color-mix(in oklab, var(--foreground) 25%, transparent);
}

/* Borders like the native Button variants (normal/ghost/text have none,
 * outline uses its border token); dividers reuse the variant's state token. */
.modo-press-button-group[data-modo-variant="normal"] {
  --pbg-border: transparent;
  --pbg-divider: var(--pbg-solid-active);
}

.modo-press-button-group[data-modo-variant="outline"] {
  --pbg-border: var(--pbg-line);
  --pbg-divider: var(--pbg-line);
}

.modo-press-button-group[data-modo-variant="ghost"] {
  --pbg-border: transparent;
  --pbg-divider: var(--pbg-soft-hover);
}

.modo-press-button-group[data-modo-variant="text"] {
  --pbg-border: transparent;
  --pbg-divider: var(--pbg-line);
}

/* ==========================================================
 * Track & SVG Overlay Layering
 * ========================================================== */
.modo-press-group__track {
  position: relative;
  z-index: 1;
}

.press-group-full .modo-press-group__track :deep(> *) {
  flex: 1 1 0%;
}

/* SSR / pre-hydration zero-shift fallback before ResizeObserver measures seams */
.modo-press-group__track--fallback {
  overflow: hidden;
  box-shadow: inset 0 0 0 1px var(--pbg-border, transparent);
}

.press-group-horizontal .modo-press-group__track--fallback :deep(> :not(:last-child)) {
  box-shadow: inset -1px 0 0 0 var(--pbg-divider, transparent);
}

.press-group-vertical .modo-press-group__track--fallback :deep(> :not(:last-child)) {
  box-shadow: inset 0 -1px 0 0 var(--pbg-divider, transparent);
}

.modo-press-group__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.modo-press-group__svg--halo {
  z-index: 0;
}

.modo-press-group__svg--stroke {
  z-index: 2;
  transition: opacity var(--duration-base, 220ms) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* Disabled segments sit at 40% (native Button); dim the shared border too. */
.modo-press-button-group[data-modo-disabled] .modo-press-group__svg--stroke {
  opacity: 0.4;
}

/* Stroke is centered on the contour and the track covers the inner half,
 * so 6px renders as the native ring-[3px]. */
.modo-press-group__halo {
  fill: none;
  stroke: var(--pbg-halo, transparent);
  stroke-width: 6px;
  stroke-linejoin: round;
  transition: stroke var(--duration-base, 220ms) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
}

.modo-press-button-group:hover .modo-press-group__halo {
  stroke: var(--pbg-halo-hover, var(--pbg-halo, transparent));
}

.modo-press-button-group:focus-within .modo-press-group__halo {
  stroke: var(--pbg-halo-focus, var(--pbg-halo, transparent));
}

.modo-press-group__border {
  fill: none;
  stroke: var(--pbg-border, transparent);
  stroke-width: 1px;
  stroke-linejoin: round;
  transition: stroke var(--duration-fast, 140ms) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
}

.modo-press-group__divider {
  stroke: var(--pbg-divider, transparent);
  stroke-width: 1px;
  transition: stroke var(--duration-fast, 140ms) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
}

@media (prefers-reduced-motion: reduce) {
  .modo-press-group__halo,
  .modo-press-group__border,
  .modo-press-group__divider,
  .modo-press-group__svg--stroke {
    transition: none;
  }
}

@media (forced-colors: active) {
  .modo-press-group__border,
  .modo-press-group__divider {
    stroke: ButtonText;
  }
}
</style>
