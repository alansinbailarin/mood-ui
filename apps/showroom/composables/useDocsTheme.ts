import type { ModoRadius, ModoSize, ModoHalo } from "mood-ui";

/**
 * Shared docs-wide theme state for the ShowroomSettings panel.
 *
 * Lives in `useState` so every component (the panel, the ModoProvider
 * in the layout, the per-page demos) reads the same reactive object.
 * Persisted to `localStorage["mood-ui:docs-theme"]` on the client so
 * the next page load brings back the user's tuning.
 *
 * SSR is given the defaults — the inline anti-FOUC script in
 * nuxt.config picks up the color mode pre-paint, and the rest of the
 * theme tokens (radius, primary, etc.) are applied during hydration
 * once useDocsTheme() runs on the client.
 */

export type DarkSurfacePreset =
  | "default"
  | "navy"
  | "zinc"
  | "charcoal"
  | "midnight"
  | "forest";

export interface DocsThemeState {
  radius: ModoRadius;
  size: ModoSize;
  halo: ModoHalo;
  primaryHex: string;
  /** 0–100, percent of color tint blended into light surfaces. */
  baseIntensity: number;
  darkSurface: DarkSurfacePreset;
}

const STORAGE_KEY = "mood-ui:docs-theme";

const DEFAULTS: DocsThemeState = {
  radius: "medium",
  size: "medium",
  halo: "tinted",
  primaryHex: "#6366f1",
  baseIntensity: 0,
  darkSurface: "default",
};

export function useDocsTheme() {
  const state = useState<DocsThemeState>("docs-theme", () => ({ ...DEFAULTS }));

  // Hydrate from localStorage on the client. onMounted ensures we run
  // after hydration so we don't cause a mismatch.
  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DocsThemeState>;
        state.value = { ...DEFAULTS, ...parsed };
      }
    } catch {
      /* private mode / disabled storage */
    }
  });

  // Persist every change. Deep watch covers nested object updates,
  // though for this flat shape `state.value` reassignments are enough.
  watch(
    state,
    (v) => {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
      } catch {
        /* private mode / quota exceeded */
      }
    },
    { deep: true },
  );

  function reset() {
    state.value = { ...DEFAULTS };
  }

  return { state, reset };
}
