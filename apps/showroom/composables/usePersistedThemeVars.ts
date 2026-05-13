import { watch, nextTick } from "vue";
import { useColorMode } from "mood-ui";
import { useDocsTheme } from "~/composables/useDocsTheme";

/**
 * Anti-FOUC for the docs-wide theme.
 *
 * The library's ModoProvider mirrors its computed CSS custom properties
 * onto `document.body` whenever a global (non-scoped) provider is mounted.
 * We re-read that mirrored set every time the user touches the docs
 * theme (primary hex, dark surface, base intensity…) or the color mode
 * flips, and persist the snapshot to `localStorage` keyed by light/dark.
 *
 * On the next page load the inline `<script>` in `nuxt.config.ts`
 * applies the cached snapshot to `<html>` before the first paint, so
 * returning visitors don't flash through the lib defaults (indigo
 * primary, neutral surfaces) on their way to whatever palette and
 * surface preset they picked.
 *
 * First-time visitors don't have a cache yet — they'll see the lib's
 * `:root` defaults during the first second they look at the site, then
 * the page settles on the defaults the SSG bundle was built with. Once
 * they touch any theme control the cache fills in and subsequent
 * loads are seamless.
 */
const CACHE_KEY = "mood-ui:cached-vars";

export function usePersistedThemeVars() {
  // SSR has no DOM and no localStorage — bail early.
  if (!import.meta.client) return;

  const { state } = useDocsTheme();
  const { resolved } = useColorMode();

  const flush = () => {
    // `body.style` lags one tick behind ModoProvider's reactivity
    // (the body-sync watcher itself runs on the same flush cycle as
    // the consumer that owns `state`). Defer one nextTick so we read
    // the freshly-applied set instead of the previous one.
    nextTick(() => {
      try {
        if (typeof document === "undefined") return;
        const body = document.body;
        if (!body) return;
        const vars: Record<string, string> = {};
        for (let i = 0; i < body.style.length; i++) {
          const name = body.style.item(i);
          if (name && name.startsWith("--")) {
            vars[name] = body.style.getPropertyValue(name).trim();
          }
        }
        if (Object.keys(vars).length === 0) return;

        const raw = localStorage.getItem(CACHE_KEY);
        const all: Record<string, Record<string, string>> = raw
          ? (() => {
              try {
                return JSON.parse(raw) as Record<string, Record<string, string>>;
              } catch {
                return {};
              }
            })()
          : {};
        all[resolved.value] = vars;
        localStorage.setItem(CACHE_KEY, JSON.stringify(all));
      } catch {
        /* private mode / quota / blocked storage — skip silently */
      }
    });
  };

  watch(
    [() => state.value, resolved],
    flush,
    { deep: true, immediate: true },
  );
}
