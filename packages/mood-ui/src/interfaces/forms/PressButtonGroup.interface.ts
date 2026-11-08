import type { ModoColor, ModoRadius, ModoSize } from "../../config/ModoConfig";
import type { PressButtonVariant } from "./PressButton.interface";

export interface PressButtonGroup {
  /** Layout axis of the connected segments. @default 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** Variant applied to every child `<PressButton>`. @default 'normal' */
  variant?: PressButtonVariant;
  /** Color cascaded to child `<PressButton>` elements; `'default'` follows `ModoProvider`. */
  color?: ModoColor;
  /** Size applied to every child `<PressButton>`; cascades from `ModoProvider` when omitted. */
  size?: ModoSize;
  /** Outer radius token; cascades from `ModoProvider` when omitted. */
  radius?: ModoRadius;
  /** Disables all child `<PressButton>` segments. @default false */
  disabled?: boolean;
  /** Enables the gradient fill on `normal` segments. @default false */
  gradient?: boolean;
  /** Stretches the group and each segment evenly across `100%` inline width. @default false */
  fullWidth?: boolean;
  /** Accessible label for the `role="group"` container. */
  ariaLabel?: string;
}

export type PressButtonGroupProps = PressButtonGroup;
