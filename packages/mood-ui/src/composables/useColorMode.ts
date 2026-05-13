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
   * Class name added to `<html>` when the resolved mode is `'dark'`.
   * Defaults to `'dark'` (the convention Tailwind v4 uses out of the box).
   *
   * Override it when your app's CSS already keys off a custom class
   * — e.g. `useColorMode({ darkClass: 'appdark' })`. Calling this with
   * a new value swaps the class on `<html>` immediately, so existing
   * dark-mode rules keep firing.
   *
   * Note: mood-ui's own dark-mode CSS is compiled against `.dark`. If
   * you need both your `appdark` selectors AND the lib's dark variants
   * to work, configure Tailwind so `dark:` resolves to your custom
   * selector, or keep both classes in sync via `darkClassExtras`.
   */
  darkClass?: string;
}

const STORAGE_KEY = "modo-color-mode";
const DEFAULT_DARK_CLASS = "dark";

const mode = ref<ColorMode>("system");
const systemIsDark = ref(false);
let darkClassName = DEFAULT_DARK_CLASS;

const resolved = computed<"light" | "dark">(() => {
  if (mode.value === "system") return systemIsDark.value ? "dark" : "light";
  return mode.value;
});

const applyClass = () => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(
    darkClassName,
    resolved.value === "dark",
  );
};

const setDarkClass = (name: string) => {
  if (!name || name === darkClassName) return;
  if (typeof document !== "undefined") {
    // Strip the previous class regardless of the current resolved
    // value so the old selector stops matching the moment the
    // override is applied.
    document.documentElement.classList.remove(darkClassName);
  }
  darkClassName = name;
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
