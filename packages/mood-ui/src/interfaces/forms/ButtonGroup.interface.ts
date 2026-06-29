import type { ModoSize } from '../../config/ModoConfig';

export interface ButtonGroup {
  orientation?: "horizontal" | "vertical";
  variant?: "normal" | "outline" | "ghost" | "text";
  color?: "default" | "primary" | "danger" | "success" | "warning";
  size?: ModoSize;
  radius?: "none" | "small" | "medium" | "large" | "full";
  disabled?: boolean;
  gradient?: boolean;
  /** Expand all buttons to fill the available width. */
  fullWidth?: boolean;
}
