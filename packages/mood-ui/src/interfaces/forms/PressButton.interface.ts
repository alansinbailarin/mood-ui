import type { Component, CSSProperties } from "vue";
import type { ModoColor, ModoRadius, ModoSize } from "../../config/ModoConfig";

/**
 * Same variant names as the native `Button`:
 * - `normal`: filled with the color (high emphasis).
 * - `outline`: bordered, transparent fill.
 * - `ghost`: subtle tinted fill, no border.
 * - `text`: transparent until hovered.
 */
export type PressButtonVariant = "normal" | "outline" | "ghost" | "text";

export interface PressButton {
  /** Visible button text when no default slot is provided. */
  label?: string;
  /**
   * Native `<button>` type attribute (omitted when `as="a"`).
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";
  /**
   * Visual treatment, same names and look as the native `Button`.
   * @default 'normal'
   */
  variant?: PressButtonVariant;
  /**
   * Semantic color. `'default'` (or omitted) follows the `ModoProvider` color.
   * @default 'default'
   */
  color?: ModoColor;
  /**
   * Gradient fill on the `normal` variant, same as the native `Button`.
   * @default false
   */
  gradient?: boolean;
  /** Control size; cascades from `ModoProvider` when omitted. */
  size?: ModoSize;
  /** Border radius token; cascades from `ModoProvider` when omitted. */
  radius?: ModoRadius;
  /** Custom CSS cursor when interactive (forced to `'not-allowed'` when `disabled` or `loading`). */
  cursor?: CSSProperties["cursor"];
  /**
   * Disables interaction. Keeps the variant look at 40% opacity, like the native `Button`.
   * @default false
   */
  disabled?: boolean;
  /**
   * Shows a centered spinner without changing the button width, and blocks activation.
   * @default false
   */
  loading?: boolean;
  /**
   * Text displayed beside the spinner while `loading` (ignored when icon-only).
   * Without it, screen readers hear the localized `common.loading` string.
   */
  loadingText?: string;
  /** Single icon component, placed according to `iconPosition` or centered when icon-only. */
  icon?: Component;
  /**
   * Placement of `icon` when paired with a label.
   * @default 'left'
   */
  iconPosition?: "left" | "right";
  /** Leading decorative icon component. Can also be provided via the `#startIcon` slot. */
  startIcon?: Component;
  /** Trailing decorative icon component. Can also be provided via the `#endIcon` slot. */
  endIcon?: Component;
  /**
   * Forces square icon-only geometry.
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Stretches the control to `100%` inline width.
   * @default false
   */
  fullWidth?: boolean;
  /** Accessible name. Required when the button has no visible text (icon-only). */
  ariaLabel?: string;
  /**
   * Renders a `Skeleton` placeholder matching the button's footprint.
   * @default false
   */
  skeleton?: boolean;
  /**
   * Root element tag. `'a'` renders a semantic anchor with disabled-link protection.
   * @default 'button'
   */
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}

export type PressButtonProps = PressButton;
