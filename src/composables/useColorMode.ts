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

const STORAGE_KEY = "modo-color-mode";

const mode = ref<ColorMode>("system");
const systemIsDark = ref(false);

const resolved = computed<"light" | "dark">(() => {
  if (mode.value === "system") return systemIsDark.value ? "dark" : "light";
  return mode.value;
});

const applyClass = () => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved.value === "dark");
};

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

export function useColorMode() {
  init();

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
