const REST_TRANSFORM = "translateY(0) scale(1)";
const PRESSED_TRANSFORM = "translateY(1px) scaleX(0.982) scaleY(0.955)";

const GROUP_BODY_REST = "scale(1)";
const GROUP_BODY_PRESSED = "scale(0.945)";

/* ── Motion tokens ───────────────────────────────────────────────────
 * WAAPI needs numbers (ms) and literal easing strings, so the values are read
 * from the theme tokens in style.css (`--duration-*`, `--ease-*`) on the
 * element being animated. The fallbacks below are kept EQUAL to those token
 * values for environments without computed custom properties (SSR, jsdom).
 */
export type PressDurationToken = "fast" | "base" | "slow";
export type PressEasingToken = "standard" | "emphasized" | "decelerate";

/** Mirrors `--duration-fast|base|slow` in style.css. */
export const PRESS_DURATION_FALLBACK: Record<PressDurationToken, number> = {
  fast: 140,
  base: 220,
  slow: 320,
};

/** Mirrors `--ease-standard|emphasized|decelerate` in style.css. */
export const PRESS_EASING_FALLBACK: Record<PressEasingToken, string> = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.3, 0, 0, 1)",
  decelerate: "cubic-bezier(0, 0, 0, 1)",
};

function readToken(el: Element | null | undefined, name: string): string {
  if (!el || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return "";
  }
  try {
    return window.getComputedStyle(el).getPropertyValue(name).trim();
  } catch {
    return "";
  }
}

/** Reads `--duration-{token}` in ms from `el` (0 under reduced motion), falling back to the token value. */
export function readDurationToken(
  el: Element | null | undefined,
  token: PressDurationToken,
): number {
  const raw = readToken(el, `--duration-${token}`);
  const match = /^(-?[\d.]+)(ms|s)$/.exec(raw);
  if (!match) return PRESS_DURATION_FALLBACK[token];
  const value = parseFloat(match[1]!);
  if (!Number.isFinite(value)) return PRESS_DURATION_FALLBACK[token];
  return match[2] === "s" ? value * 1000 : value;
}

/** Reads `--ease-{token}` from `el`, falling back to the token value. */
export function readEasingToken(
  el: Element | null | undefined,
  token: PressEasingToken,
): string {
  return readToken(el, `--ease-${token}`) || PRESS_EASING_FALLBACK[token];
}

/** Press-in: fast, emphasized. */
function pressTiming(el: Element) {
  return {
    duration: readDurationToken(el, "fast"),
    easing: readEasingToken(el, "emphasized"),
  };
}

const activeAnimations = new WeakMap<HTMLElement, Animation>();
const activePointers = new WeakMap<HTMLElement, number>();

function shouldReduceMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function replaceAnimation(
  button: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  const previousAnimation = activeAnimations.get(button);

  if (shouldReduceMotion() || typeof button.animate !== "function") {
    previousAnimation?.cancel();
    activeAnimations.delete(button);
    return;
  }

  const nextAnimation = button.animate(keyframes, options);
  previousAnimation?.cancel();
  activeAnimations.set(button, nextAnimation);
}

export function pressButton(
  button: HTMLElement,
  pointerId: number,
  pointerType = "mouse",
) {
  if (activePointers.has(button)) return;
  activePointers.set(button, pointerId);

  // Capture only mouse/pen pointers (to catch drags off the button). WebKit
  // suppresses the synthesized click when a touch pointer is captured during
  // pointerdown, which would make taps dead on iOS.
  if (pointerType !== "touch" && typeof button.setPointerCapture === "function") {
    try {
      button.setPointerCapture(pointerId);
    } catch {
      // Synthetic pointer events in tests or detached nodes may not hold an active pointerId.
    }
  }

  replaceAnimation(
    button,
    [{ transform: REST_TRANSFORM }, { transform: PRESSED_TRANSFORM }],
    { ...pressTiming(button), fill: "forwards" },
  );
}

export function releaseButton(button: HTMLElement, pointerId: number) {
  if (!activePointers.has(button)) return;
  if (activePointers.get(button) !== pointerId) return;
  activePointers.delete(button);

  replaceAnimation(
    button,
    [
      {
        transform: PRESSED_TRANSFORM,
        offset: 0,
      },
      {
        transform: "translateY(-0.5px) scaleX(1.008) scaleY(1.012)",
        offset: 0.52,
        easing: readEasingToken(button, "decelerate"),
      },
      { transform: REST_TRANSFORM, offset: 1 },
    ],
    // Release rebound spans --duration-slow; the overshoot stop eases out with --ease-decelerate.
    { duration: readDurationToken(button, "slow"), easing: "linear" },
  );
}

export function cancelButtonPress(button: HTMLElement, pointerId: number) {
  if (!activePointers.has(button)) return;
  if (activePointers.get(button) !== pointerId) return;
  activePointers.delete(button);

  replaceAnimation(button, [{ transform: REST_TRANSFORM }], pressTiming(button));
}

export function resetButtonPress(button: HTMLElement) {
  activePointers.delete(button);
  replaceAnimation(button, [{ transform: REST_TRANSFORM }], pressTiming(button));
}

export function pressGroupSegmentBody(
  button: HTMLElement,
  bodyEl: HTMLElement | null,
  pointerId: number,
  pointerType = "mouse",
) {
  if (activePointers.has(button)) return;
  activePointers.set(button, pointerId);

  if (pointerType !== "touch" && typeof button.setPointerCapture === "function") {
    try {
      button.setPointerCapture(pointerId);
    } catch {
      // Synthetic pointer events in tests or detached nodes may not hold an active pointerId.
    }
  }

  if (!bodyEl) return;
  replaceAnimation(
    bodyEl,
    [{ transform: GROUP_BODY_REST }, { transform: GROUP_BODY_PRESSED }],
    { ...pressTiming(bodyEl), fill: "forwards" },
  );
}

export function releaseGroupSegmentBody(
  button: HTMLElement,
  bodyEl: HTMLElement | null,
  pointerId: number,
): boolean {
  if (!activePointers.has(button)) return false;
  if (activePointers.get(button) !== pointerId) return false;
  activePointers.delete(button);

  if (bodyEl) {
    replaceAnimation(
      bodyEl,
      [
        { transform: GROUP_BODY_PRESSED, offset: 0 },
        {
          transform: "scale(1.015)",
          offset: 0.52,
          easing: readEasingToken(bodyEl, "decelerate"),
        },
        { transform: GROUP_BODY_REST, offset: 1 },
      ],
      { duration: readDurationToken(bodyEl, "slow"), easing: "linear" },
    );
  }
  return true;
}

export function cancelGroupSegmentBody(
  button: HTMLElement,
  bodyEl: HTMLElement | null,
  pointerId: number,
): boolean {
  if (!activePointers.has(button)) return false;
  if (activePointers.get(button) !== pointerId) return false;
  activePointers.delete(button);

  if (bodyEl) {
    replaceAnimation(bodyEl, [{ transform: GROUP_BODY_REST }], pressTiming(bodyEl));
  }
  return true;
}

export function resetGroupSegmentBody(
  button: HTMLElement,
  bodyEl: HTMLElement | null,
) {
  activePointers.delete(button);
  if (bodyEl) {
    replaceAnimation(bodyEl, [{ transform: GROUP_BODY_REST }], pressTiming(bodyEl));
  }
}
