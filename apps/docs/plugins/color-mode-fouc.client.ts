/**
 * Anti-FOUC for the lib's color mode.
 *
 * The `mood-ui` `useColorMode` composable persists the chosen theme in
 * `localStorage["modo-color-mode"]` and toggles a `.dark` class on
 * `<html>`. In SSR there's no localStorage, so the pre-rendered HTML
 * always ships with the light palette. When the user has the site
 * pinned to dark, the page first paints light → then hydration flips
 * the class → visible flash.
 *
 * This plugin runs *synchronously* before the first paint (it's a
 * client-only Nuxt plugin so it executes in <head> at parse time) and
 * applies the saved class up-front so the first paint matches what
 * `useColorMode` will set during hydration.
 *
 * SSR ships HTML without the `.dark` class — that's the contract, no
 * mismatch. The class lands on `<html>` *before* the first paint
 * because this script blocks the renderer for a single read.
 */
const STORAGE_KEY = "modo-color-mode";

export default defineNuxtPlugin({
  name: "color-mode-fouc",
  enforce: "pre",
  setup() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      const resolved =
        stored === "light" || stored === "dark"
          ? stored
          : prefersDark
            ? "dark"
            : "light";

      document.documentElement.classList.toggle("dark", resolved === "dark");
    } catch {
      // Private mode / disabled storage — the lib's useColorMode will
      // recover on hydration and pick the OS preference as a fallback.
    }
  },
});
