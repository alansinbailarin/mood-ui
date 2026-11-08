export interface MorphPreset {
  openMs: number;
  closeMs: number;
  /** 0..1 — how far the body stretches into a line. */
  streak: number;
  /** px at peak travel */
  blur: number;
  /** Grow past the final size before settling. */
  overshoot?: number;
}

export type MorphDirection = "open" | "close";
export type MorphPhase = "closed" | "opening" | "open" | "closing";
export type MorphSide = "auto" | "top" | "bottom";
export type MorphAlign = "auto" | "start" | "center" | "end";
export type MorphSurface = "auto" | "trigger";

export const MENU_PRESET: MorphPreset = {
  openMs: 500,
  closeMs: 460,
  streak: 1,
  blur: 10,
};

export const DIALOG_PRESET: MorphPreset = {
  openMs: 540,
  closeMs: 460,
  streak: 0.85,
  blur: 12,
};

export const CONTEXT_PRESET: MorphPreset = {
  openMs: 420,
  closeMs: 340,
  streak: 1,
  blur: 4,
};

export interface MorphColors {
  trigger: string;
  panel: string;
  travel?: string;
}

export interface MorphTravel {
  x: number;
  y: number;
}

export const ROUND = "999px";
export const DEFAULT_RECT = "16px";
export const CLOSE_HOLD = 0.14;

export const round = (n: number): number => Number(n.toFixed(4));

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Reads a motion token (`--duration-*` in ms, or `--ease-*`) from the
 * element's cascade so WAAPI animations follow the same tokens as CSS.
 * Falls back when the token is missing (SSR, jsdom, foreign hosts).
 */
export function motionDuration(
  element: Element | null | undefined,
  token: "fast" | "base" | "slow" | "slower",
  fallbackMs: number,
): number {
  if (!element || typeof getComputedStyle !== "function") return fallbackMs;
  const raw = getComputedStyle(element).getPropertyValue(`--duration-${token}`).trim();
  if (!raw) return fallbackMs;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallbackMs;
  return raw.endsWith("ms") ? value : raw.endsWith("s") ? value * 1000 : value;
}

export function motionEase(
  element: Element | null | undefined,
  token: "standard" | "emphasized" | "decelerate" | "accelerate",
  fallback: string,
): string {
  if (!element || typeof getComputedStyle !== "function") return fallback;
  return getComputedStyle(element).getPropertyValue(`--ease-${token}`).trim() || fallback;
}

export function tr(travel: MorphTravel | undefined, f: number): string {
  if (!travel || (travel.x === 0 && travel.y === 0) || f === 0) return "";
  return `translate(${round(travel.x * f)}px,${round(travel.y * f)}px) `;
}

export function axis(b: number, f: number): number {
  if (f === 0) return 1;
  if (f === 1) return b;
  return round(1 + (b - 1) * f);
}

const GLASS_OFF = "blur(0px) saturate(100%)";

export function glassAt(glass: string | undefined, on: boolean) {
  if (!glass) return {};
  const value = on ? glass : GLASS_OFF;
  return { backdropFilter: value, WebkitBackdropFilter: value };
}

/* ==========================================================
 * Color compositing (resolves OKLab / OKLCH / color-mix / rgba)
 * ========================================================== */
let scratch: CanvasRenderingContext2D | null | undefined;

function parseColor(color: string): [number, number, number, number] | null {
  const rgb = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(
    color,
  );
  if (rgb) {
    return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
  }
  const srgb =
    /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(color);
  if (srgb) {
    return [
      +srgb[1] * 255,
      +srgb[2] * 255,
      +srgb[3] * 255,
      srgb[4] === undefined ? 1 : +srgb[4],
    ];
  }

  if (scratch === undefined) {
    try {
      scratch =
        typeof document === "undefined"
          ? null
          : document
              .createElement("canvas")
              .getContext("2d", { willReadFrequently: true });
      if (scratch) {
        scratch.canvas.width = 1;
        scratch.canvas.height = 1;
      }
    } catch {
      scratch = null;
    }
  }
  if (!scratch) return null;
  try {
    scratch.clearRect(0, 0, 1, 1);
    scratch.fillStyle = color;
    scratch.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = scratch.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  } catch {
    return null;
  }
}

export function compositeOver(
  foreground: string,
  background: string,
): string | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const a = fg[3];
  const mix = (f: number, b: number) => Math.round(f * a + b * (1 - a));
  return `rgb(${mix(fg[0], bg[0])}, ${mix(fg[1], bg[1])}, ${mix(fg[2], bg[2])})`;
}

/** Theme root an element paints under: its closest `[data-modo-theme]`, else `<html>`. */
function themeRootOf(element: Element | null | undefined): HTMLElement | null {
  if (!element || typeof document === "undefined") return null;
  return (element.closest("[data-modo-theme]") as HTMLElement | null) ?? null;
}

function isDarkRoot(root: HTMLElement | null): boolean {
  if (root) return root.getAttribute("data-modo-theme") === "dark";
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  return (
    html.classList.contains("dark") ||
    html.getAttribute("data-modo-theme") === "dark"
  );
}

/**
 * Resolves the theme's `--background` to a concrete color by letting the
 * browser compute it on a probe inside the theme root (handles oklch,
 * light-dark(), color-mix and per-scope overrides).
 */
function themeCanvas(root: HTMLElement | null): [number, number, number, number] | null {
  if (typeof document === "undefined" || !document.body) return null;
  const host = root ?? document.body;
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;background-color:var(--background);";
  host.appendChild(probe);
  const parsed = parseColor(getComputedStyle(probe).backgroundColor);
  probe.remove();
  return parsed && parsed[3] > 0 ? parsed : null;
}

/**
 * Flattens the translucent backgrounds from `element` upward into one opaque
 * color. The walk stops at the element's theme root (scoped ModoProvider or
 * teleported panel) and lays the stack over that theme's own `--background`,
 * so a dark scope inside a light page composites over dark, not white.
 * `themeHint` (e.g. the teleported panel, which carries the resolved
 * `data-modo-theme`) is used when the element itself sits under no theme root.
 */
export function compositeBackground(
  element: HTMLElement,
  themeHint?: Element | null,
): string | null {
  const ownRoot = themeRootOf(element);
  const root = ownRoot ?? themeRootOf(themeHint);
  const layers: Array<[number, number, number, number]> = [];
  let node: HTMLElement | null = element;

  while (node) {
    const parsed = parseColor(getComputedStyle(node).backgroundColor);
    if (parsed && parsed[3] > 0) {
      layers.push(parsed);
      if (parsed[3] >= 0.99) break;
    }
    if (ownRoot && node === ownRoot) break;
    node = node.parentElement;
  }
  if (layers.length === 0) return null;

  const canvas = themeCanvas(root);
  let [r, g, b] = canvas
    ? [canvas[0], canvas[1], canvas[2]]
    : isDarkRoot(root)
      ? [12, 14, 20]
      : [255, 255, 255];
  for (const [lr, lg, lb, la] of layers.reverse()) {
    r = lr * la + r * (1 - la);
    g = lg * la + g * (1 - la);
    b = lb * la + b * (1 - la);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/* ==========================================================
 * Close & Open Keyframe Tables (v10 single-bell curve)
 * ========================================================== */
interface CloseStop {
  offset: number;
  fy: number;
  fx: number;
  blur: number;
  vx: number;
  vy: number;
  op: number;
}

const CLOSE_STOPS: readonly CloseStop[] = [
  { offset: 0, fy: 0, fx: 0, blur: 0, vx: 1, vy: 1, op: 0 },
  {
    offset: CLOSE_HOLD,
    fy: 0.045,
    fx: 0.008,
    blur: 0.1,
    vx: 0.99,
    vy: 0.96,
    op: 0,
  },
  {
    offset: 0.24,
    fy: 0.135,
    fx: 0.028,
    blur: 0.34,
    vx: 0.96,
    vy: 0.87,
    op: 0.04,
  },
  {
    offset: 0.34,
    fy: 0.33,
    fx: 0.085,
    blur: 0.66,
    vx: 0.92,
    vy: 0.77,
    op: 0.12,
  },
  { offset: 0.46, fy: 0.64, fx: 0.215, blur: 1, vx: 0.89, vy: 0.7, op: 0.3 },
  { offset: 0.6, fy: 0.87, fx: 0.45, blur: 0.6, vx: 0.87, vy: 0.66, op: 0.62 },
  {
    offset: 0.74,
    fy: 0.96,
    fx: 0.775,
    blur: 0.26,
    vx: 0.9,
    vy: 0.78,
    op: 0.92,
  },
  { offset: 0.82, fy: 0.99, fx: 0.925, blur: 0.09, vx: 0.93, vy: 0.89, op: 1 },
  { offset: 0.9, fy: 1, fx: 1, blur: 0, vx: 0.95, vy: 0.95, op: 1 },
  { offset: 1, fy: 1, fx: 1, blur: 0, vx: 0.95, vy: 0.95, op: 1 },
];

const TRAVEL_TONE_AT = 0.24;
const CORNERS_HOME_AT = 0.46;
const TRIGGER_TONE_AT = 0.74;

function closeFx(stop: CloseStop, streak: number): number {
  return stop.fy + (stop.fx - stop.fy) * streak;
}

export interface CloseKeyframeOptions {
  bx: number;
  by: number;
  rect: string;
  land: string;
  blur: number;
  streak: number;
  colors?: MorphColors;
  travel?: MorphTravel;
  glass?: string;
}

export function buildCloseKeyframes({
  bx,
  by,
  rect,
  land,
  blur: BLUR,
  streak,
  colors,
  travel,
  glass,
}: CloseKeyframeOptions): Keyframe[] {
  return CLOSE_STOPS.map((stop) => {
    const fx = closeFx(stop, streak);
    const home = (fx + stop.fy) / 2;
    const color =
      stop.offset === 0
        ? colors?.panel
        : stop.offset === TRAVEL_TONE_AT
          ? colors?.travel
          : stop.offset === TRIGGER_TONE_AT || stop.offset === 1
            ? colors?.trigger
            : undefined;
    return {
      offset: stop.offset,
      transform: `${tr(travel, home)}scale(${axis(bx, fx)},${axis(by, stop.fy)})`,
      filter: `blur(${round(BLUR * stop.blur)}px)`,
      opacity: stop.offset === 1 ? 0 : 1,
      ...(stop.offset <= CLOSE_HOLD
        ? { borderRadius: rect }
        : stop.offset >= CORNERS_HOME_AT
          ? { borderRadius: land }
          : {}),
      ...(color && { backgroundColor: color }),
      ...(stop.offset === 0
        ? glassAt(glass, true)
        : stop.offset === TRAVEL_TONE_AT
          ? glassAt(glass, false)
          : {}),
    };
  });
}

export function buildGhostReturnKeyframes(
  bx: number,
  by: number,
  preset: MorphPreset = MENU_PRESET,
): Keyframe[] {
  return CLOSE_STOPS.map((stop) => ({
    offset: stop.offset,
    transform: `scale(${(stop.vx / axis(bx, closeFx(stop, preset.streak))).toFixed(4)},${(
      stop.vy / axis(by, stop.fy)
    ).toFixed(4)})`,
    opacity: stop.op,
  }));
}

const ANTICIPATION = 0.2;
const OVERSHOOT = 0.16;
const EASE_IN = "cubic-bezier(.45,0,.55,1)";
const EASE_MID = "cubic-bezier(.35,0,.25,1)";
const EASE_OUT = "cubic-bezier(.2,.75,.3,1)";

export interface MorphKeyframeOptions {
  settleRadius?: string;
  colors?: MorphColors;
  preset?: MorphPreset;
  travel?: MorphTravel;
  glass?: string;
  landRadius?: string;
}

export function buildMorphKeyframes(
  direction: MorphDirection,
  bx: number,
  by: number,
  options: MorphKeyframeOptions = {},
): Keyframe[] {
  const { colors, travel, glass } = options;
  const preset = options.preset ?? MENU_PRESET;
  const RECT = options.settleRadius ?? DEFAULT_RECT;
  const LAND = options.landRadius ?? ROUND;
  const BLUR = preset.blur;

  if (direction === "close") {
    return buildCloseKeyframes({
      bx,
      by,
      rect: RECT,
      land: LAND,
      blur: BLUR,
      streak: preset.streak,
      colors,
      travel,
      glass,
    });
  }

  const ax = bx * (1 - ANTICIPATION);
  const ay = by * (1 - ANTICIPATION);
  const streakX = bx + (1 - bx) * preset.streak;
  const streakY = by * 0.8;
  const overshoot = preset.overshoot ?? OVERSHOOT;
  const over = 1 + overshoot;
  const bodyColor = colors?.travel ?? colors?.panel;

  return [
    {
      offset: 0,
      transform: `${tr(travel, 1)}scale(${bx},${by})`,
      borderRadius: LAND,
      filter: "blur(0px)",
      ...(colors && { backgroundColor: colors.trigger }),
      ...glassAt(glass, false),
      easing: EASE_IN,
    },
    {
      offset: 0.12,
      transform: `${tr(travel, 1)}scale(${ax},${ay})`,
      borderRadius: LAND,
      filter: `blur(${BLUR * 0.25}px)`,
      easing: EASE_MID,
    },
    {
      offset: 0.34,
      transform: `${tr(travel, 0.55)}scale(${streakX},${streakY})`,
      borderRadius: ROUND,
      filter: `blur(${BLUR}px)`,
      easing: EASE_MID,
    },
    {
      offset: 0.62,
      transform: `${tr(travel, 0)}scale(${over},${over})`,
      borderRadius: RECT,
      filter: `blur(${BLUR * 0.35}px)`,
      ...(bodyColor && { backgroundColor: bodyColor }),
      easing: EASE_OUT,
    },
    {
      offset: 0.82,
      transform: `${tr(travel, 0)}scale(${1 + overshoot / 2},${1 + overshoot / 2})`,
      borderRadius: RECT,
      filter: `blur(${BLUR * 0.1}px)`,
      ...glassAt(glass, false),
      easing: EASE_OUT,
    },
    {
      offset: 1,
      transform: "scale(1,1)",
      borderRadius: RECT,
      filter: "blur(0px)",
      ...(colors && { backgroundColor: colors.panel }),
      ...glassAt(glass, true),
    },
  ];
}

export interface MorphPlan {
  keyframes: Keyframe[];
  duration: number;
  bx: number;
  by: number;
}

export function planMorph(
  panel: HTMLElement,
  trigger: HTMLElement,
  direction: MorphDirection,
  preset: MorphPreset = MENU_PRESET,
): MorphPlan {
  const triggerRect = trigger.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const bx = panelRect.width === 0 ? 1 : triggerRect.width / panelRect.width;
  const by = panelRect.height === 0 ? 1 : triggerRect.height / panelRect.height;
  const panelStyle = getComputedStyle(panel);
  const settleRadius = panelStyle.borderRadius || undefined;

  const triggerColor = trigger.hasAttribute("data-modo-context-anchor")
    ? null
    : compositeBackground(trigger, panel);
  const panelColor = panelStyle.backgroundColor;
  const transparent = /rgba?\(0,\s*0,\s*0,\s*0\)|transparent/;
  const pageBehind = trigger.parentElement
    ? compositeBackground(trigger.parentElement, panel)
    : null;
  const colors: MorphColors | undefined =
    triggerColor && panelColor && !transparent.test(panelColor)
      ? {
          trigger: triggerColor,
          panel: panelColor,
          travel:
            (pageBehind && compositeOver(panelColor, pageBehind)) ?? undefined,
        }
      : undefined;

  const originParts = panelStyle.transformOrigin.split(" ");
  const originFor = (part: string | undefined, size: number): number => {
    const value = Number.parseFloat(part ?? "") || 0;
    return part?.endsWith("%") ? (value / 100) * size : value;
  };
  const originX = originFor(originParts[0], panelRect.width);
  const originY = originFor(originParts[1], panelRect.height);
  const rawX = triggerRect.left - panelRect.left - (1 - bx) * originX;
  const rawY = triggerRect.top - panelRect.top - (1 - by) * originY;
  const travel: MorphTravel | undefined =
    Math.abs(rawX) > 1 || Math.abs(rawY) > 1
      ? { x: Math.round(rawX), y: Math.round(rawY) }
      : undefined;

  const glass =
    panelStyle.getPropertyValue("--modo-dialog-backdrop").trim() ||
    panelStyle.getPropertyValue("--modo-menu-backdrop").trim() ||
    undefined;

  const parsedR = Number.parseFloat(getComputedStyle(trigger).borderRadius);
  const effectiveR = Number.isNaN(parsedR)
    ? Math.min(triggerRect.width, triggerRect.height) / 2
    : Math.min(parsedR, triggerRect.width / 2, triggerRect.height / 2);
  const landRadius =
    bx > 0 && by > 0
      ? `${Math.round(effectiveR / bx)}px / ${Math.round(effectiveR / by)}px`
      : undefined;

  const coarse =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const tuned = coarse
    ? {
        ...preset,
        blur: Math.round(preset.blur * 0.6),
        openMs: Math.round(preset.openMs * 0.88),
        closeMs: Math.round(preset.closeMs * 0.88),
      }
    : preset;

  return {
    keyframes: buildMorphKeyframes(direction, bx, by, {
      settleRadius,
      colors,
      preset: tuned,
      travel,
      glass,
      landRadius,
    }),
    duration: direction === "open" ? tuned.openMs : tuned.closeMs,
    bx,
    by,
  };
}

export interface RunMorphOptions {
  panel: HTMLElement;
  trigger: HTMLElement | null;
  ghost?: HTMLElement | null;
  direction: MorphDirection;
  preset?: MorphPreset;
  onFinish: () => void;
}

export function runMorph({
  panel,
  trigger,
  ghost,
  direction,
  preset = MENU_PRESET,
  onFinish,
}: RunMorphOptions): void {
  if (
    prefersReducedMotion() ||
    typeof panel.animate !== "function" ||
    panel.hasAttribute("data-modo-skip-morph")
  ) {
    onFinish();
    return;
  }

  if (!trigger) {
    if (direction === "close") {
      const fade = panel.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0.96)" },
        ],
        {
          duration: motionDuration(panel, "fast", 140),
          easing: motionEase(panel, "accelerate", "ease-in"),
          fill: "forwards",
        },
      );
      fade.onfinish = onFinish;
    } else {
      onFinish();
    }
    return;
  }

  if (typeof panel.getAnimations === "function") {
    for (const animation of panel.getAnimations()) animation.cancel();
  }

  const plan = planMorph(panel, trigger, direction, preset);
  const animation = panel.animate(plan.keyframes, {
    duration: plan.duration,
    fill: "forwards",
  });

  if (direction === "close" && ghost) {
    if (typeof ghost.getAnimations === "function") {
      for (const inFlight of ghost.getAnimations()) inFlight.cancel();
    }
    ghost.animate(buildGhostReturnKeyframes(plan.bx, plan.by, preset), {
      duration: plan.duration,
      fill: "forwards",
    });
  }

  animation.onfinish = () => {
    if (direction === "open") {
      animation.cancel();
    }
    onFinish();
  };
}
