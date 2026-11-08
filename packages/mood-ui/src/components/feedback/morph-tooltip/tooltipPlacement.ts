import type { MorphTooltipAlign, MorphTooltipSide } from "../../../interfaces/feedback/MorphTooltip.interface";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
interface Size {
  width: number;
  height: number;
}
export type TooltipSide = "top" | "bottom" | "left" | "right";

const EDGE = 8;

/** Offset placement (the menu's placement OVERLAPS the trigger — it is the
 * morph anchor; a tooltip must sit BESIDE it): preferred side with a gap,
 * flipped to the opposite side when it would overflow (all four sides, like
 * the native Tooltip), aligned and clamped to the viewport. */
export function resolveTooltipPosition(
  trigger: Rect,
  panel: Size,
  viewport: Size,
  side: MorphTooltipSide = "auto",
  align: MorphTooltipAlign = "auto",
  gap = 8,
): { left: number; top: number; side: TooltipSide } {
  const fitsAbove = trigger.top - panel.height - gap >= EDGE;
  const fitsBelow =
    trigger.top + trigger.height + panel.height + gap <= viewport.height - EDGE;
  const fitsLeft = trigger.left - panel.width - gap >= EDGE;
  const fitsRight =
    trigger.left + trigger.width + panel.width + gap <= viewport.width - EDGE;
  let resolved: TooltipSide =
    side === "auto" ? (fitsAbove || !fitsBelow ? "top" : "bottom") : side;
  if (resolved === "top" && !fitsAbove && fitsBelow) resolved = "bottom";
  else if (resolved === "bottom" && !fitsBelow && fitsAbove) resolved = "top";
  else if (resolved === "left" && !fitsLeft && fitsRight) resolved = "right";
  else if (resolved === "right" && !fitsRight && fitsLeft) resolved = "left";

  const clamp = (value: number, max: number) =>
    Math.min(Math.max(value, EDGE), Math.max(EDGE, max - EDGE));

  if (resolved === "left" || resolved === "right") {
    const left =
      resolved === "left"
        ? trigger.left - panel.width - gap
        : trigger.left + trigger.width + gap;
    const top =
      align === "start" ? trigger.top
      : align === "end" ? trigger.top + trigger.height - panel.height
      : trigger.top + (trigger.height - panel.height) / 2;
    return {
      left: clamp(left, viewport.width - panel.width),
      top: clamp(top, viewport.height - panel.height),
      side: resolved,
    };
  }

  const left =
    align === "start" ? trigger.left
    : align === "end" ? trigger.left + trigger.width - panel.width
    : trigger.left + (trigger.width - panel.width) / 2;
  const top =
    resolved === "top"
      ? trigger.top - panel.height - gap
      : trigger.top + trigger.height + gap;
  return {
    left: clamp(left, viewport.width - panel.width),
    top: clamp(top, viewport.height - panel.height),
    side: resolved,
  };
}
