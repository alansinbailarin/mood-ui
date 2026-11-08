import {
  CLOSE_HOLD,
  motionDuration,
  motionEase,
  planMorph,
  prefersReducedMotion,
  type MorphAlign,
  type MorphPreset,
  type MorphSide,
} from "./morphEngine";

export interface PlacementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ResolvedPlacement {
  left: number;
  top: number;
  side: "top" | "bottom";
  align: "start" | "center" | "end";
}

const MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function resolvePlacement(
  trigger: PlacementRect,
  panel: { width: number; height: number },
  viewport: Viewport,
  side: MorphSide = "auto",
  align: MorphAlign = "auto",
): ResolvedPlacement {
  const belowFits = trigger.top + panel.height <= viewport.height;
  const resolvedSide: "top" | "bottom" =
    side === "top" || side === "bottom" ? side : belowFits ? "bottom" : "top";

  const rightFits = trigger.left + panel.width <= viewport.width;
  const resolvedAlign: "start" | "center" | "end" =
    align === "start" || align === "center" || align === "end"
      ? align
      : rightFits
        ? "start"
        : "end";

  let left =
    resolvedAlign === "start"
      ? trigger.left
      : resolvedAlign === "end"
        ? trigger.left + trigger.width - panel.width
        : trigger.left + trigger.width / 2 - panel.width / 2;
  let top =
    resolvedSide === "bottom"
      ? trigger.top
      : trigger.top + trigger.height - panel.height;

  left = clamp(left, MARGIN, Math.max(MARGIN, viewport.width - panel.width - MARGIN));
  top = clamp(top, MARGIN, Math.max(MARGIN, viewport.height - panel.height - MARGIN));

  return { left, top, side: resolvedSide, align: resolvedAlign };
}

export interface DialogPosition {
  left: number;
  top: number;
  width?: number;
  originX: string;
  originY: string;
}

function originRatio(point: number, start: number, size: number): string {
  const ratio = size === 0 ? 0 : Math.min(1, Math.max(0, (point - start) / size));
  return `${Math.round(ratio * 100)}%`;
}

export function resolveDialogPosition(
  placement: "trigger" | "center",
  trigger: PlacementRect,
  panel: { width: number; height: number },
  viewport: Viewport,
  side: MorphSide = "auto",
  align: MorphAlign = "auto",
): DialogPosition {
  if (placement === "center") {
    const left = Math.max(16, (viewport.width - panel.width) / 2);
    const top = Math.max(24, (viewport.height - panel.height) / 2);
    return {
      left,
      top,
      originX: originRatio(trigger.left + trigger.width / 2, left, panel.width),
      originY: originRatio(trigger.top + trigger.height / 2, top, panel.height),
    };
  }

  const resolved = resolvePlacement(trigger, panel, viewport, side, align);
  return {
    left: resolved.left,
    top: resolved.top,
    originX:
      resolved.align === "end" ? "100%" : resolved.align === "center" ? "50%" : "0%",
    originY: resolved.side === "top" ? "100%" : "0%",
  };
}

/** Fills the return-ghost with a clone of the trigger's content. */
export function populateGhost(ghost: HTMLElement, trigger: HTMLElement): void {
  const content =
    trigger.querySelector(
      ".modo-morph-trigger__content, .modo-press-button__content",
    ) ?? trigger;
  if (!content) return;

  ghost.replaceChildren(content.cloneNode(true));
  const triggerText = getComputedStyle(trigger);
  ghost.style.color = triggerText.color;
  ghost.style.font = triggerText.font;
  ghost.style.letterSpacing = triggerText.letterSpacing;
}

/**
 * surface="trigger": the panel adopts the trigger's resting colors so the
 * morph keeps color continuity. `tint` is an optional CSS color (the caller's
 * resolved `ModoColor` token, e.g. `var(--primary)`) mixed in at 6% so the
 * panel still reads as a surface; omit it for no tint.
 */
export function adoptTriggerSurface(
  panel: HTMLElement,
  trigger: HTMLElement,
  varPrefix: "dialog" | "menu" = "dialog",
  tint?: string,
): void {
  const triggerStyle = getComputedStyle(trigger);
  const background = triggerStyle.backgroundColor;
  if (background && !/rgba?\(0,\s*0,\s*0,\s*0\)|transparent/.test(background)) {
    panel.style.setProperty(
      `--modo-${varPrefix}-surface`,
      tint ? `color-mix(in oklab, ${tint} 6%, ${background})` : background,
    );
    panel.style.color = triggerStyle.color;
  }
}

/* ==========================================================
 * Scrollable chain + Inertia guard
 * ========================================================== */
export function canScrollUp(target: EventTarget | null, root: HTMLElement): boolean {
  let el = target instanceof Element ? target : null;
  while (el) {
    if (el.scrollTop > 0) return true;
    if (el === root) break;
    el = el.parentElement;
  }
  return false;
}

export function canScrollDown(target: EventTarget | null, root: HTMLElement): boolean {
  let el = target instanceof Element ? target : null;
  while (el) {
    if (el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    if (el === root) break;
    el = el.parentElement;
  }
  return false;
}

export function swallowInertia(quietMs = 160, maxMs = 1500): void {
  if (typeof document === "undefined") return;

  let quietTimer: ReturnType<typeof setTimeout>;
  const stop = () => {
    clearTimeout(quietTimer);
    clearTimeout(hardStop);
    document.removeEventListener("wheel", onWheel, { capture: true });
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(quietTimer);
    quietTimer = setTimeout(stop, quietMs);
  };

  document.addEventListener("wheel", onWheel, { capture: true, passive: false });
  quietTimer = setTimeout(stop, quietMs);
  const hardStop = setTimeout(stop, maxMs);
}

/* ==========================================================
 * Top-layer stack awareness (Esc / Outside Click)
 * ========================================================== */
const LAYER_SELECTOR = [
  '[data-modo-dialog][data-modo-phase="open"]',
  '[data-modo-dialog][data-modo-phase="opening"]',
  '[data-modo-sheet][data-modo-phase="open"]',
  '[data-modo-sheet][data-modo-phase="opening"]',
  '[data-modo-popover][data-modo-phase="open"]',
  '[data-modo-popover][data-modo-phase="opening"]',
  '[data-modo-menu][data-modo-phase="open"]',
  '[data-modo-menu][data-modo-phase="opening"]',
].join(", ");

export function isTopMorphLayer(panel: HTMLElement): boolean {
  if (typeof document === "undefined") return true;
  const layers = document.querySelectorAll(LAYER_SELECTOR);
  return layers.length === 0 || layers[layers.length - 1] === panel;
}

/* ==========================================================
 * Scrub Controller (Pull-to-close on morphing surfaces)
 * ========================================================== */
const TRAVEL_PX = 260;
const COMMIT_AT = 0.45;
const SCRUB_WINDOW = 0.5;

export interface ScrubController {
  readonly committed: boolean;
  active(): boolean;
  apply(offset: number): void;
  settle(offset: number): void;
  dispose(): void;
}

export function createScrubController(
  panel: HTMLElement,
  trigger: HTMLElement,
  preset: MorphPreset | undefined,
  onDismiss: () => void,
): ScrubController {
  let scrub: Animation | null = null;
  let committed = false;
  let lastActivity = Date.now();
  let lastOffset = 0;
  let watchdog: ReturnType<typeof setInterval> | undefined;
  let failsafe: ReturnType<typeof setTimeout> | undefined;
  const scrim = () =>
    panel.parentElement?.querySelector<HTMLElement>("[data-modo-dialog-scrim]");
  const duration = () => Number(scrub?.effect?.getTiming().duration ?? 0);

  const finishClose = () => {
    clearTimeout(failsafe);
    panel.setAttribute("data-modo-skip-morph", "");
    panel.style.opacity = "0";
    onDismiss();
  };

  const controller: ScrubController = {
    get committed() {
      return committed;
    },
    active: () => scrub !== null,
    apply(offset: number) {
      if (committed) return;
      if (!scrub) {
        const plan = planMorph(panel, trigger, "close", preset);
        scrub = panel.animate(plan.keyframes, {
          duration: plan.duration,
          fill: "forwards",
        });
        scrub.pause();
        clearInterval(watchdog);
        watchdog = setInterval(() => {
          if (scrub && !committed && Date.now() - lastActivity > 500) {
            controller.settle(lastOffset);
          }
          if (!scrub) clearInterval(watchdog);
        }, 250);
      }
      lastActivity = Date.now();
      lastOffset = offset;
      const progress = Math.min(1, offset / TRAVEL_PX);
      scrub.currentTime =
        (CLOSE_HOLD + progress * (SCRUB_WINDOW - CLOSE_HOLD)) * duration();
      const scrimEl = scrim();
      if (scrimEl) scrimEl.style.opacity = `${1 - progress * 0.9}`;
    },
    settle(offset: number) {
      const current = scrub;
      if (!current || committed) return;
      scrub = null;
      clearInterval(watchdog);
      if (offset / TRAVEL_PX >= COMMIT_AT) {
        committed = true;
        swallowInertia();
        trigger.removeAttribute("data-modo-morph-origin");
        current.play();
        current.onfinish = finishClose;
        failsafe = setTimeout(finishClose, 1200);
      } else {
        scrim()?.style.removeProperty("opacity");
        current.playbackRate = -1.6;
        current.play();
        current.onfinish = () => current.cancel();
      }
    },
    dispose() {
      clearInterval(watchdog);
      clearTimeout(failsafe);
      scrub?.cancel();
      scrub = null;
    },
  };
  return controller;
}

export function attachCloseScrub(
  panel: HTMLElement,
  trigger: HTMLElement,
  preset: MorphPreset | undefined,
  onDismiss: () => void,
): () => void {
  if (prefersReducedMotion() || typeof panel.animate !== "function") {
    return () => {};
  }

  const scrub = createScrubController(panel, trigger, preset, onDismiss);
  let offset = 0;
  let startY = 0;
  let dragging = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  const settleNow = () => {
    scrub.settle(offset);
    offset = 0;
  };

  const onWheel = (event: WheelEvent) => {
    if (scrub.committed) return event.preventDefault();
    const inside = panel.contains(event.target as Node);
    if (
      !scrub.active() &&
      (event.deltaY >= 0 || (inside && canScrollUp(event.target, panel)))
    ) {
      return;
    }
    event.preventDefault();
    if (-event.deltaY > 120) offset = TRAVEL_PX;
    else offset = Math.max(0, offset - event.deltaY);
    scrub.apply(offset);
    clearTimeout(settleTimer);
    if (offset / TRAVEL_PX >= COMMIT_AT || offset === 0) settleNow();
    else settleTimer = setTimeout(settleNow, 160);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (scrub.committed || event.button !== 0) return;
    if (!panel.contains(event.target as Node)) return;
    startY = event.clientY;
    dragging = false;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (scrub.committed || event.buttons === 0) return;
    const dy = event.clientY - startY;
    if (!dragging) {
      if (dy < 8 || !panel.contains(event.target as Node)) return;
      if (canScrollUp(event.target, panel)) return;
      dragging = true;
      panel.setPointerCapture?.(event.pointerId);
    }
    offset = Math.max(0, dy);
    scrub.apply(offset);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    settleNow();
  };

  document.addEventListener("wheel", onWheel, { passive: false });
  panel.addEventListener("pointerdown", onPointerDown);
  panel.addEventListener("pointermove", onPointerMove);
  panel.addEventListener("pointerup", onPointerUp);
  panel.addEventListener("pointercancel", onPointerUp);

  return () => {
    clearTimeout(settleTimer);
    scrub.dispose();
    document.removeEventListener("wheel", onWheel);
    panel.removeEventListener("pointerdown", onPointerDown);
    panel.removeEventListener("pointermove", onPointerMove);
    panel.removeEventListener("pointerup", onPointerUp);
    panel.removeEventListener("pointercancel", onPointerUp);
  };
}

/* ==========================================================
 * Pull-Down & Expand Detents for Sheet
 * ========================================================== */
const INTERACTIVE_SELECTOR =
  "input, textarea, select, button, a, [contenteditable]";
// Fallbacks only; the live values come from the --ease-* tokens.
const SNAP_EASE = "cubic-bezier(0, 0, 0, 1)";
const EXIT_EASE = "cubic-bezier(0.3, 0, 1, 1)";
const TOP_GAP = 24;

export function playPullExit(
  panel: HTMLElement,
  scrimEl: HTMLElement | null,
  dy: number,
  onDone: () => void,
): void {
  if (prefersReducedMotion() || typeof panel.animate !== "function") {
    onDone();
    return;
  }
  scrimEl?.animate(
    [{ opacity: scrimEl.style.opacity || "1" }, { opacity: "0" }],
    {
      duration: motionDuration(panel, "base", 220),
      easing: motionEase(panel, "standard", "ease-out"),
      fill: "forwards",
    },
  );
  const drop = panel.getBoundingClientRect().height + 32;
  const out = panel.animate(
    [
      { transform: `translateY(${dy}px)` },
      { transform: `translateY(${drop}px)` },
    ],
    {
      duration: motionDuration(panel, "base", 220),
      easing: motionEase(panel, "accelerate", EXIT_EASE),
      fill: "forwards",
    },
  );
  out.onfinish = onDone;
}

export function attachSheetPullDismiss(
  panel: HTMLElement,
  onDismiss: () => void,
): () => void {
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;
  let dragging = false;
  let wheelOffset = 0;
  let dismissed = false;
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;

  const scrim = () =>
    panel.parentElement?.querySelector<HTMLElement>(
      "[data-modo-dialog-scrim], [data-modo-sheet-scrim]",
    ) ?? null;
  const threshold = () =>
    Math.max(80, panel.getBoundingClientRect().height / 3);

  const apply = (dy: number) => {
    panel.style.transform = `translateY(${dy > 0 ? dy : dy * 0.15}px)`;
    const height = panel.getBoundingClientRect().height || 1;
    const scrimEl = scrim();
    if (scrimEl) {
      scrimEl.style.opacity = `${Math.max(0, 1 - Math.max(0, dy) / height)}`;
    }
  };

  const release = (dy: number, v: number) => {
    if ((dy > threshold() && v > -0.05) || v > 0.6) {
      dismissed = true;
      swallowInertia();
      playPullExit(panel, scrim(), dy, () => {
        panel.setAttribute("data-modo-skip-morph", "");
        onDismiss();
      });
      return;
    }
    scrim()?.style.removeProperty("opacity");
    panel.style.transform = "";
    if (
      dy > 0 &&
      !prefersReducedMotion() &&
      typeof panel.animate === "function"
    ) {
      panel.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }],
        {
          duration: motionDuration(panel, "base", 220),
          easing: motionEase(panel, "decelerate", SNAP_EASE),
        },
      );
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (dismissed || event.button !== 0) return;
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    startY = lastY = event.clientY;
    lastT = event.timeStamp;
    velocity = 0;
    dragging = false;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.buttons === 0) return;
    const dy = event.clientY - startY;
    if (!dragging) {
      if (
        dy < 8 ||
        panel.scrollTop > 0 ||
        panel.hasAttribute("data-modo-expanded") ||
        panel.style.height !== ""
      ) {
        return;
      }
      if (canScrollUp(event.target, panel)) return;
      dragging = true;
      panel.setPointerCapture?.(event.pointerId);
    }
    velocity = (event.clientY - lastY) / (event.timeStamp - lastT || 1);
    lastY = event.clientY;
    lastT = event.timeStamp;
    apply(dy);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    release(Math.max(0, event.clientY - startY), velocity);
  };

  const onWheel = (event: WheelEvent) => {
    if (event.defaultPrevented) return;
    if (dismissed) {
      event.preventDefault();
      return;
    }
    if (
      panel.hasAttribute("data-modo-expanded") ||
      panel.style.height !== ""
    ) {
      return;
    }
    const inside = panel.contains(event.target as Node);
    if (
      wheelOffset === 0 &&
      (event.deltaY >= 0 || (inside && canScrollUp(event.target, panel)))
    ) {
      return;
    }
    event.preventDefault();
    wheelOffset = Math.max(0, wheelOffset - event.deltaY);
    apply(wheelOffset);
    clearTimeout(wheelTimer);
    if (wheelOffset > threshold()) {
      const settled = wheelOffset;
      wheelOffset = 0;
      release(settled, 0);
      return;
    }
    const settled = wheelOffset;
    wheelTimer = setTimeout(() => {
      wheelOffset = 0;
      release(settled, 0);
    }, 160);
  };

  panel.addEventListener("pointerdown", onPointerDown);
  panel.addEventListener("pointermove", onPointerMove);
  panel.addEventListener("pointerup", onPointerUp);
  panel.addEventListener("pointercancel", onPointerUp);
  document.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    clearTimeout(wheelTimer);
    panel.removeEventListener("pointerdown", onPointerDown);
    panel.removeEventListener("pointermove", onPointerMove);
    panel.removeEventListener("pointerup", onPointerUp);
    panel.removeEventListener("pointercancel", onPointerUp);
    document.removeEventListener("wheel", onWheel);
  };
}

export function attachSheetExpand(panel: HTMLElement): () => void {
  const base = panel.getBoundingClientRect().height;
  const max = () => window.innerHeight - TOP_GAP;
  let current = -1;
  let settleAnim: Animation | null = null;

  const track = (h: number) => {
    current = Math.min(max(), Math.max(base, h));
    panel.style.height = `${current}px`;
  };
  const progress = () => (current - base) / Math.max(1, max() - base);
  const heightNow = () => {
    if (current >= 0) return current;
    return panel.hasAttribute("data-modo-expanded") ? max() : base;
  };
  const settle = (expand = progress() > 0.5) => {
    if (current < 0) return;
    const from = current;
    const target = expand ? max() : base;
    current = -1;
    const done = () => {
      panel.toggleAttribute("data-modo-expanded", expand);
      panel.style.height = "";
    };
    if (prefersReducedMotion() || typeof panel.animate !== "function") {
      done();
      return;
    }
    const anim = panel.animate(
      [{ height: `${from}px` }, { height: `${target}px` }],
      {
        duration: motionDuration(panel, "slow", 320),
        easing: motionEase(panel, "decelerate", SNAP_EASE),
        fill: "forwards",
      },
    );
    settleAnim = anim;
    anim.onfinish = () => {
      anim.cancel();
      settleAnim = null;
      done();
    };
  };
  const resume = () => {
    if (!settleAnim) return;
    const live = panel.getBoundingClientRect().height;
    settleAnim.cancel();
    settleAnim = null;
    track(live);
  };

  let startY = 0;
  let startH = 0;
  let tracking = false;
  let dragging = false;
  let swallowing = false;
  let wheelTimer: ReturnType<typeof setTimeout> | undefined;
  let quietTimer: ReturnType<typeof setTimeout> | undefined;

  const swallow = () => {
    swallowing = true;
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => {
      swallowing = false;
    }, 160);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    resume();
    startY = event.clientY;
    startH = heightNow();
    tracking = true;
    dragging = false;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!tracking || event.buttons === 0) return;
    const dy = event.clientY - startY;
    if (!dragging) {
      if (Math.abs(dy) < 8) return;
      if (dy > 0 && !panel.hasAttribute("data-modo-expanded") && current < 0) {
        return;
      }
      if (dy > 0 && canScrollUp(event.target, panel)) return;
      dragging = true;
      panel.setPointerCapture?.(event.pointerId);
      panel.style.userSelect = "none";
    }
    track(startH - dy);
  };

  const settleIdle = () => {
    clearTimeout(wheelTimer);
    settle();
  };

  const onPointerUp = () => {
    if (dragging) settleIdle();
    tracking = dragging = false;
    panel.style.userSelect = "";
  };

  const onWheel = (event: WheelEvent) => {
    if (swallowing) {
      event.preventDefault();
      swallow();
      return;
    }
    const expanded = panel.hasAttribute("data-modo-expanded");
    if (current < 0) {
      const canGrow =
        !expanded && event.deltaY > 0 && !canScrollDown(event.target, panel);
      const canShrink =
        expanded && event.deltaY < 0 && !canScrollUp(event.target, panel);
      if (!canGrow && !canShrink) return;
    }
    event.preventDefault();
    track(heightNow() + event.deltaY);
    const prog = progress();
    if (!expanded && prog >= 0.55) {
      clearTimeout(wheelTimer);
      settle(true);
      swallow();
    } else if (expanded && prog <= 0.45) {
      clearTimeout(wheelTimer);
      settle(false);
      swallow();
    } else {
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(settleIdle, 260);
    }
  };

  panel.addEventListener("pointerdown", onPointerDown);
  panel.addEventListener("pointermove", onPointerMove);
  panel.addEventListener("pointerup", onPointerUp);
  panel.addEventListener("pointercancel", onPointerUp);
  panel.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    clearTimeout(wheelTimer);
    clearTimeout(quietTimer);
    settleAnim?.cancel();
    panel.removeEventListener("pointerdown", onPointerDown);
    panel.removeEventListener("pointermove", onPointerMove);
    panel.removeEventListener("pointerup", onPointerUp);
    panel.removeEventListener("pointercancel", onPointerUp);
    panel.removeEventListener("wheel", onWheel);
  };
}

/* ==========================================================
 * Focus Trap & Scroll Lock
 * ========================================================== */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function attachFocusTrap(
  container: HTMLElement,
  initialFocusEl?: HTMLElement | null,
): () => void {
  const previous = document.activeElement as HTMLElement | null;
  const items = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  (initialFocusEl ?? items()[0] ?? container).focus();

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const focusables = items();
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener("keydown", onKeyDown);
  return () => {
    container.removeEventListener("keydown", onKeyDown);
    previous?.focus?.();
  };
}

let activeScrollLocks = 0;
let savedScrollCleanup: (() => void) | null = null;

export function acquireScrollLock(): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return () => {};
  }
  activeScrollLocks++;
  if (activeScrollLocks === 1) {
    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previous = {
      htmlOverflow: documentElement.style.overflow,
      overflow: body.style.overflow,
      padding: body.style.paddingRight,
    };
    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    savedScrollCleanup = () => {
      documentElement.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.padding;
      if (scrollY && window.scrollY !== scrollY) {
        window.scrollTo(0, scrollY);
      }
    };
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeScrollLocks = Math.max(0, activeScrollLocks - 1);
    if (activeScrollLocks === 0 && savedScrollCleanup) {
      savedScrollCleanup();
      savedScrollCleanup = null;
    }
  };
}

/* ==========================================================
 * Shortcut Parser for Menu & ContextMenu
 * ========================================================== */
export interface ParsedShortcut {
  meta: boolean;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  key: string;
}

const MODIFIERS: Record<string, keyof Omit<ParsedShortcut, "key">> = {
  "⌘": "meta",
  "⇧": "shift",
  "⌥": "alt",
  "⌃": "ctrl",
};

const SPECIAL_KEYS: Record<string, string> = {
  "⌫": "backspace",
  "⌦": "delete",
  "↵": "enter",
  "⏎": "enter",
  "⎋": "escape",
  "␣": " ",
};

export function parseShortcut(shortcut: string): ParsedShortcut {
  const parsed: ParsedShortcut = {
    meta: false,
    shift: false,
    alt: false,
    ctrl: false,
    key: "",
  };

  for (const char of shortcut.trim()) {
    const modifier = MODIFIERS[char];
    if (modifier) parsed[modifier] = true;
    else parsed.key = SPECIAL_KEYS[char] ?? char.toLowerCase();
  }

  return parsed;
}

export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: string,
): boolean {
  const parsed = parseShortcut(shortcut);
  return (
    parsed.key === event.key.toLowerCase() &&
    parsed.meta === event.metaKey &&
    parsed.shift === event.shiftKey &&
    parsed.alt === event.altKey &&
    parsed.ctrl === event.ctrlKey
  );
}
