import { ref, computed, watch } from "vue";

/**
 * Global color mode.
 *
 * - `'light'` and `'dark'` lock the mode regardless of OS preference.
 * - `'system'` mirrors the OS preference (`prefers-color-scheme`) reactively.
 *
 * The composable is a singleton: all callers share the same reactive state and
 * the side effect of toggling the `.dark` class on `<html>` runs exactly once
 * when the mode (or the OS preference while in `'system'`) changes.
 */
export type ColorMode = "light" | "dark" | "system";

export interface ColorModeOptions {
  /**
   * Additional class to toggle on `<html>` when the resolved mode is
   * `'dark'`. The lib **always** toggles its own internal `'dark'`
   * class as well — its compiled CSS (Tailwind v4 `dark:` variants)
   * is keyed off `.dark` and cannot work without it. Use this option
   * when your application's CSS keys off a different class, e.g.
   * `useColorMode({ darkClass: 'appdark' })`. With that call, `<html>`
   * will carry both `appdark` (for your rules) and `dark` (for the
   * lib's rules) whenever the resolved mode is dark.
   *
   * Calling this with a new value swaps the previous extra class for
   * the new one immediately; the lib's internal `dark` is never
   * removed.
   */
  darkClass?: string;
}

const STORAGE_KEY = "modo-color-mode";
const LIB_DARK_CLASS = "dark";

const mode = ref<ColorMode>("system");
const systemIsDark = ref(false);
// Consumer-supplied class. Toggled alongside `LIB_DARK_CLASS` so the
// app's own CSS (which keys off this class) and the lib's compiled
// `.dark` selectors both fire in dark mode. Null when not configured.
let extraDarkClass: string | null = null;

const resolved = computed<"light" | "dark">(() => {
  if (mode.value === "system") return systemIsDark.value ? "dark" : "light";
  return mode.value;
});

const applyClass = () => {
  if (typeof document === "undefined") return;
  const isDark = resolved.value === "dark";
  // Lib selector is always kept in sync — its compiled CSS depends on it.
  document.documentElement.classList.toggle(LIB_DARK_CLASS, isDark);
  // Consumer's extra class rides alongside.
  if (extraDarkClass) {
    document.documentElement.classList.toggle(extraDarkClass, isDark);
  }
};

const setDarkClass = (name: string) => {
  if (!name || name === extraDarkClass) return;
  if (typeof document !== "undefined" && extraDarkClass) {
    // Strip the previous extra class so the old selector stops
    // matching the moment the override is swapped.
    document.documentElement.classList.remove(extraDarkClass);
  }
  extraDarkClass = name;
  applyClass();
};

/**
 * Configure the color-mode singleton before any component reads from it.
 * Call this once in your app entry (`main.ts` / Nuxt plugin) so the
 * right class is on `<html>` before the first paint.
 */
export function configureColorMode(options: ColorModeOptions) {
  if (options.darkClass) setDarkClass(options.darkClass);
}

const persistMode = (v: ColorMode) => {
  try {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
};

watch(
  mode,
  (v) => {
    persistMode(v);
    applyClass();
  },
  { flush: "sync" },
);

watch(resolved, applyClass, { flush: "sync" });

let initialized = false;
const init = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    if (stored === "light" || stored === "dark" || stored === "system")
      mode.value = stored;
  } catch {
    /* ignore — private mode / disabled storage */
  }
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  systemIsDark.value = mq.matches;
  const onChange = (e: MediaQueryListEvent) => {
    systemIsDark.value = e.matches;
  };
  mq.addEventListener("change", onChange);
  applyClass();
};

// Eagerly initialize when imported in a browser context so the class is
// applied before the first component renders (anti-FOUC aid).
if (typeof window !== "undefined") init();

export function useColorMode(options?: ColorModeOptions) {
  init();
  if (options?.darkClass) setDarkClass(options.darkClass);

  const set = (v: ColorMode) => {
    mode.value = v;
    persistMode(v);
    applyClass();
  };

  const toggle = () => {
    set(resolved.value === "dark" ? "light" : "dark");
  };

  return {
    /** The raw chosen mode: `'light' | 'dark' | 'system'`. */
    mode,
    /** Always a concrete `'light' | 'dark'`, following the OS when `mode === 'system'`. */
    resolved,
    /** Convenience boolean — `true` when resolved === 'dark'. */
    isDark: computed(() => resolved.value === "dark"),
    /** Programmatically change the mode and persist to localStorage. */
    set,
    /** Flip between light and dark. If currently `system`, flips relative to resolved. */
    toggle,
  };
}

/**
 * Resolves any `ColorMode` to a concrete `'light' | 'dark'` without touching
 * the global singleton. Used by scoped providers to pick `data-modo-theme`.
 */
export function resolveColorMode(m: ColorMode): "light" | "dark" {
  if (m === "system") return systemIsDark.value ? "dark" : "light";
  return m;
}
