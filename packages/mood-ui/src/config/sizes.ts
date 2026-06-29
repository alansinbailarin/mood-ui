import type { ModoSize } from "./ModoConfig";

/** Per-role class tokens for one size. */
export interface SizeTokenSet {
  /** Outer height of an inline interactive control (Button, Input, Select…). */
  control: string;
  /** Selection indicator box — checkbox/radio box, switch track, slider thumb, rating star. */
  box: string;
  /** Outer height of a display chip (Badge, Chip, Kbd). */
  label: string;
  /** SVG icon size inside a control. */
  icon: string;
  /** Font-size utility. */
  text: string;
  /** Horizontal padding for text controls. */
  padX: string;
  /** Gap between an icon and adjacent text. */
  gap: string;
}

/**
 * THE single source of truth for component sizing. Control heights are
 * 32/36/40/48 (xsmall/small/medium/large). Every size-bearing component reads
 * the token for its role from here instead of hard-coding a local switch.
 */
export const SIZE_TOKENS: Record<ModoSize, SizeTokenSet> = {
  xsmall: { control: "h-8",  box: "h-4 w-4",           label: "h-4",      icon: "h-3.5 w-3.5",      text: "text-xs",   padX: "px-2.5", gap: "gap-1" },
  small:  { control: "h-9",  box: "h-[18px] w-[18px]", label: "h-[18px]", icon: "h-4 w-4",          text: "text-sm",   padX: "px-3",   gap: "gap-1.5" },
  medium: { control: "h-10", box: "h-5 w-5",           label: "h-5",      icon: "h-[18px] w-[18px]", text: "text-sm",   padX: "px-3.5", gap: "gap-2" },
  large:  { control: "h-12", box: "h-6 w-6",           label: "h-6",      icon: "h-5 w-5",          text: "text-base", padX: "px-4",   gap: "gap-2" },
};

/** Maps legacy / extra size values (`xs`, `xl`) onto the canonical four. */
export function normalizeSize(s: string | undefined): ModoSize {
  if (s === "xs") return "xsmall";
  if (s === "xl") return "large";
  if (s === "xsmall" || s === "small" || s === "medium" || s === "large") return s;
  return "medium";
}
