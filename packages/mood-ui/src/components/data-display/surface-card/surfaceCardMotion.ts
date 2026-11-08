const REST_TRANSFORM = "translateY(0) scale(1)";
const PRESSED_TRANSFORM = "translateY(1px) scale(0.986)";

/** Spring overshoot on release: choreography kept from the original press feel. */
const RELEASE_SPRING_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

const activeCardAnimations = new WeakMap<HTMLElement, Animation>();
const activeCardPointers = new WeakMap<HTMLElement, number>();

function shouldReduceMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Reads a motion token (`--duration-*` / `--ease-*`) from the card so the
 * WAAPI press honours the same scale as CSS transitions (and the provider's
 * reduced-motion override that zeroes durations).
 */
function readToken(card: HTMLElement, name: string): string {
  if (typeof window === "undefined" || typeof getComputedStyle !== "function") {
    return "";
  }
  return getComputedStyle(card).getPropertyValue(name).trim();
}

function readDuration(card: HTMLElement, name: string, fallback: number): number {
  const raw = readToken(card, name);
  if (!raw) return fallback;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
}

function readEasing(card: HTMLElement, name: string, fallback: string): string {
  return readToken(card, name) || fallback;
}

function pressTiming(card: HTMLElement) {
  return {
    duration: readDuration(card, "--duration-fast", 140),
    easing: readEasing(card, "--ease-emphasized", "cubic-bezier(0.3, 0, 0, 1)"),
  };
}

function replaceCardAnimation(
  card: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  const prev = activeCardAnimations.get(card);

  if (shouldReduceMotion() || typeof card.animate !== "function") {
    prev?.cancel();
    activeCardAnimations.delete(card);
    return;
  }

  const next = card.animate(keyframes, options);
  prev?.cancel();
  activeCardAnimations.set(card, next);
}

/**
 * Returns true if the event target is a nested secondary interactive control
 * (e.g., a button or independent link inside `SurfaceCard.Footer`), in which
 * case the parent card should NOT hijack pointer capture or play whole-card press motion.
 */
export function isNestedInteractiveTarget(
  cardRoot: HTMLElement,
  target: EventTarget | null,
): boolean {
  if (!(target instanceof Element)) return false;
  const interactive = target.closest(
    'button, a:not(.modo-surface-card__stretched-link), input, select, textarea, summary, [role="button"], [role="link"], [role="switch"], [role="checkbox"]',
  );
  return Boolean(interactive && interactive !== cardRoot);
}

export function pressSurfaceCard(
  card: HTMLElement,
  pointerId: number,
  pointerType = "mouse",
  capturePointer = true,
) {
  if (activeCardPointers.has(card)) return;
  activeCardPointers.set(card, pointerId);

  // Never capture touch pointers (WebKit suppresses synthesized click on touch capture),
  // and skip capture when a stretched inner link owns the actual click target.
  if (
    capturePointer &&
    pointerType !== "touch" &&
    typeof card.setPointerCapture === "function"
  ) {
    try {
      card.setPointerCapture(pointerId);
    } catch {
      // Synthetic pointer events in unit tests may not hold an active pointerId.
    }
  }

  replaceCardAnimation(
    card,
    [{ transform: REST_TRANSFORM }, { transform: PRESSED_TRANSFORM }],
    { ...pressTiming(card), fill: "forwards" },
  );
}

export function releaseSurfaceCard(card: HTMLElement, pointerId: number) {
  if (!activeCardPointers.has(card)) return;
  if (activeCardPointers.get(card) !== pointerId) return;
  activeCardPointers.delete(card);

  replaceCardAnimation(
    card,
    [
      { transform: PRESSED_TRANSFORM, offset: 0 },
      {
        transform: "translateY(-0.5px) scale(1.004)",
        offset: 0.52,
        easing: RELEASE_SPRING_EASING,
      },
      { transform: REST_TRANSFORM, offset: 1 },
    ],
    { duration: readDuration(card, "--duration-slow", 320), easing: "linear" },
  );
}

export function cancelSurfaceCardPress(card: HTMLElement, pointerId: number) {
  if (!activeCardPointers.has(card)) return;
  if (activeCardPointers.get(card) !== pointerId) return;
  activeCardPointers.delete(card);

  replaceCardAnimation(card, [{ transform: REST_TRANSFORM }], pressTiming(card));
}

export function resetSurfaceCardPress(card: HTMLElement) {
  activeCardPointers.delete(card);
  replaceCardAnimation(card, [{ transform: REST_TRANSFORM }], pressTiming(card));
}
