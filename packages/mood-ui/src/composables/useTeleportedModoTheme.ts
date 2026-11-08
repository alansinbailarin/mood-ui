import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { ModoRadius, ModoSize } from "../config/ModoConfig";
import { palettesToCssVars, semanticTokensFromPalettes } from "../config/palettes";
import { hexToOklchString, pickForegroundOklch } from "../config/colorPrimitives";
import { surfacesToCssVars } from "../config/surfaces";
import { resolveColorMode } from "./useColorMode";
import {
  useModoConfig,
  useResolvedRadius,
  useResolvedSize,
  useResolvedTheme,
} from "./useModoConfig";

// Same steps as the native overlays so a morph Dialog and a Modal (or a Menu
// and a DropdownMenu) share corners under one provider radius:
// Modal  → rounded-none / md / xl / 2xl / 3xl
// PopoverPanel → rounded-none / sm / md / xl / 2xl
const DIALOG_RADIUS_BY_TOKEN: Record<ModoRadius, string> = {
  none: "0px",
  small: "0.375rem",
  medium: "0.75rem",
  large: "1rem",
  full: "1.5rem",
};

const MENU_RADIUS_BY_TOKEN: Record<ModoRadius, string> = {
  none: "0px",
  small: "0.25rem",
  medium: "0.375rem",
  large: "0.75rem",
  full: "1rem",
};

// Inset rows sit inside the menu padding, so their corners stay concentric
// with the panel (panel radius minus the inset); `full` turns rows into pills.
const MENU_ITEM_RADIUS_BY_TOKEN: Record<ModoRadius, string> = {
  none: "0px",
  small: "0.125rem",
  medium: "0.25rem",
  large: "0.5rem",
  full: "999px",
};

const DIALOG_PADDING_BY_SIZE: Record<ModoSize, string> = {
  xsmall: "0.875rem",
  small: "1rem",
  medium: "1.25rem",
  large: "1.5rem",
};

const POPOVER_PADDING_BY_SIZE: Record<ModoSize, string> = {
  xsmall: "0.75rem 0.875rem",
  small: "0.875rem 1rem",
  medium: "1rem 1.125rem",
  large: "1.25rem 1.375rem",
};

const MENU_PADDING_BY_SIZE: Record<ModoSize, string> = {
  xsmall: "0.25rem",
  small: "0.3125rem",
  medium: "0.375rem",
  large: "0.5rem",
};

const MENU_ITEM_PADDING_BY_SIZE: Record<ModoSize, string> = {
  xsmall: "0.375rem 0.625rem",
  small: "0.5rem 0.75rem",
  medium: "0.625rem 0.875rem",
  large: "0.75rem 1rem",
};

const MENU_FONT_SIZE_BY_SIZE: Record<ModoSize, string> = {
  xsmall: "0.75rem",
  small: "0.75rem",
  medium: "0.8125rem",
  large: "0.875rem",
};

export interface UseTeleportedModoThemeOptions {
  radius?: MaybeRefOrGetter<ModoRadius | undefined>;
  size?: MaybeRefOrGetter<ModoSize | undefined>;
}

/**
 * Bridges ModoProvider configuration (`theme`, `radius`, `size`, `palettes`,
 * `surfaces`, `darkSurfaces`) across `<Teleport to="body">` boundaries for
 * morphing overlays (`Sheet`, `Dialog`, `Popover`, `Menu`, `ContextMenu`).
 */
export function useTeleportedModoTheme(options: UseTeleportedModoThemeOptions = {}) {
  const cfg = useModoConfig();
  const theme = useResolvedTheme();
  const resolvedRadius = useResolvedRadius(() => toValue(options.radius));
  const resolvedSize = useResolvedSize(() => toValue(options.size));

  const scopedTheme = computed(() => resolveColorMode(theme.value));

  const providerStyle = computed<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    const isDark = scopedTheme.value === "dark";

    if (cfg?.value) {
      if (cfg.value.palettes) {
        Object.assign(out, palettesToCssVars(cfg.value.palettes));
        Object.assign(
          out,
          semanticTokensFromPalettes(cfg.value.palettes, hexToOklchString, pickForegroundOklch),
        );
      }
      // Light surfaces are skipped in dark mode, exactly like ModoProvider,
      // so they never override the `[data-modo-theme="dark"]` tokens.
      if (!isDark && cfg.value.surfaces) {
        Object.assign(out, surfacesToCssVars(cfg.value.surfaces));
      }
      if (isDark && cfg.value.darkSurfaces) {
        Object.assign(out, surfacesToCssVars(cfg.value.darkSurfaces));
      }
    }

    const r = resolvedRadius.value;
    const s = resolvedSize.value;

    out["--modo-dialog-radius"] = DIALOG_RADIUS_BY_TOKEN[r];
    out["--modo-menu-radius"] = MENU_RADIUS_BY_TOKEN[r];
    out["--modo-menu-item-radius"] = MENU_ITEM_RADIUS_BY_TOKEN[r];
    out["--modo-dialog-padding"] = DIALOG_PADDING_BY_SIZE[s];
    out["--modo-popover-padding"] = POPOVER_PADDING_BY_SIZE[s];
    out["--modo-menu-padding"] = MENU_PADDING_BY_SIZE[s];
    out["--modo-menu-item-padding"] = MENU_ITEM_PADDING_BY_SIZE[s];
    out["--modo-menu-font-size"] = MENU_FONT_SIZE_BY_SIZE[s];

    return out;
  });

  return {
    scopedTheme,
    resolvedRadius,
    resolvedSize,
    providerStyle,
  };
}
