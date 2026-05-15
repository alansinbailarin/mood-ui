import type { Component } from "vue";
import type { ModoColor, ModoRadius, ModoSize } from "../../config/ModoConfig";
import type { PopoverPlacement } from "../../composables/usePopover";

export type SwitcherValue = string | number;

export interface SwitcherItem {
  /** Unique identifier used by v-model and keyed rendering. */
  value: SwitcherValue;
  /** Primary line (bold). */
  title: string;
  /** Secondary line (muted color). Optional. */
  subtitle?: string;
  /**
   * Visual at the left of the item. Use ONLY ONE of `icon` or `avatar`.
   * If both are set, `avatar` wins and a dev-only warning is logged.
   */
  icon?: Component;
  avatar?: { src?: string; initials?: string };
  /** Non-selectable (no click, no focus, reduced opacity). */
  disabled?: boolean;
}

export interface Switcher {
  modelValue?: SwitcherValue | null;
  items: SwitcherItem[];

  placeholder?: string;
  compactTrigger?: boolean;
  chevron?: "updown" | "down" | "none";
  triggerVariant?: "outline" | "ghost" | "filled";
  fullWidth?: boolean;

  panelTitle?: string;
  panelWidth?: "trigger" | "auto";
  panelMinWidth?: number | string;
  panelMaxHeight?: number | string;
  placement?: PopoverPlacement;

  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: Array<"title" | "subtitle">;
  noResultsText?: string;

  loading?: boolean;
  emptyText?: string;
  disabled?: boolean;

  color?: ModoColor;
  radius?: ModoRadius;
  size?: ModoSize;

  ariaLabel?: string;
}

export type SwitcherEmits = {
  "update:modelValue": [value: SwitcherValue | null];
  change: [value: SwitcherValue | null, item: SwitcherItem | null];
  open: [];
  close: [];
  search: [query: string];
};
