/**
 * Hash → Nuxt route map for the legacy showroom.
 *
 * Until 2026-05 the site lived at `mood-ui.com/#<id>` (e.g. `#button`,
 * `#use-toast`). Search engine results and external links still point
 * at those URLs. Browsers never send the hash to the server, so any
 * server-side redirect (`vercel.json` rewrites, _redirects, etc.) sees
 * a bare `/` and can't tell which page was requested. This table
 * powers the client-side redirect installed in `app.vue` to bring
 * those visitors to the canonical route.
 *
 * The full mapping lives in `docs/migration/hash-route-map.json` —
 * this file is the runtime-shipped flat version (id → route only) so
 * the bundle stays tiny.
 *
 * To regenerate after the manifest changes:
 *   node -e "const m = require('./docs/migration/hash-route-map.json'); \
 *     for (const [k, v] of Object.entries(m.redirects)) \
 *       console.log(\`  '\${k}': '\${v.route}',\`);" | sort
 */
export const HASH_TO_ROUTE: Readonly<Record<string, string>> = Object.freeze({
  // Getting started + docs
  welcome: "/",
  introduction: "/docs/introduction",
  installation: "/docs/installation",
  theming: "/docs/theming",
  i18n: "/docs/i18n",
  accessibility: "/docs/accessibility",
  changelog: "/docs/changelog",
  templates: "/templates",
  "theme-studio": "/theme-studio",

  // Forms
  button: "/forms/button",
  "button-group": "/forms/button-group",
  "form-field": "/forms/form-field",
  input: "/forms/input",
  textarea: "/forms/textarea",
  "password-input": "/forms/password-input",
  "number-input": "/forms/number-input",
  "search-input": "/forms/search-input",
  select: "/forms/select",
  "multi-select": "/forms/multi-select",
  combobox: "/forms/combobox",
  checkbox: "/forms/checkbox",
  radio: "/forms/radio",
  "radio-group": "/forms/radio-group",
  switch: "/forms/switch",
  "date-field": "/forms/date-field",
  "date-time-field": "/forms/date-time-field",
  "date-range-field": "/forms/date-range-field",
  "file-input": "/forms/file-input",
  slider: "/forms/slider",
  "range-slider": "/forms/range-slider",
  segmented: "/forms/segmented",
  rating: "/forms/rating",
  "color-picker": "/forms/color-picker",
  "tag-input": "/forms/tag-input",
  "color-mode-switch": "/forms/color-mode-switch",
  "avatar-upload": "/forms/avatar-upload",
  "phone-input": "/forms/phone-input",
  "otp-input": "/forms/otp-input",

  // Feedback
  badge: "/feedback/badge",
  banner: "/feedback/banner",
  chip: "/feedback/chip",
  drawer: "/feedback/drawer",
  loader: "/feedback/loader",
  modal: "/feedback/modal",
  skeleton: "/feedback/skeleton",
  tooltip: "/feedback/tooltip",
  toast: "/feedback/toast",
  "toast-item": "/feedback/toast-item",
  "confirm-dialog": "/feedback/confirm-dialog",
  "empty-state": "/feedback/empty-state",
  "progress-bar": "/feedback/progress-bar",

  // Data display
  card: "/data-display/card",
  typography: "/data-display/typography",
  avatar: "/data-display/avatar",
  "avatar-group": "/data-display/avatar-group",
  accordion: "/data-display/accordion",
  kbd: "/data-display/kbd",
  code: "/data-display/code",
  stat: "/data-display/stat",
  timeline: "/data-display/timeline",
  table: "/data-display/table",

  // Calendar
  calendar: "/calendar",
  "month-view": "/calendar/month-view",
  "week-view": "/calendar/week-view",
  "day-view": "/calendar/day-view",
  "agenda-view": "/calendar/agenda-view",
  scheduler: "/calendar/scheduler",

  // Date pickers
  "date-time-picker": "/date-picker/date-time-picker",
  "date-range-picker": "/date-picker/date-range-picker",

  // Layout
  "app-shell": "/layout/app-shell",
  canvas: "/layout/canvas",
  sidebar: "/layout/sidebar",
  topbar: "/layout/topbar",
  "page-header": "/layout/page-header",
  container: "/layout/container",
  divider: "/layout/divider",
  stack: "/layout/stack",
  hstack: "/layout/hstack",
  vstack: "/layout/vstack",
  "popover-panel": "/layout/popover-panel",

  // Navigation
  tabs: "/navigation/tabs",
  breadcrumbs: "/navigation/breadcrumbs",
  "dropdown-menu": "/navigation/dropdown-menu",
  pagination: "/navigation/pagination",
  stepper: "/navigation/stepper",

  // Composables
  "use-color-mode": "/composables/use-color-mode",
  "use-toast": "/composables/use-toast",
  "use-confirm": "/composables/use-confirm",
  "use-locale": "/composables/use-locale",
  "use-modo-config": "/composables/use-modo-config",
  "use-calendar": "/composables/use-calendar",
  "use-auto-scroll": "/composables/use-auto-scroll",

  // Utilities
  "event-colors": "/utilities/event-colors",
});

/**
 * Resolve a hash fragment (`#button` or `#/cat/button`) to its
 * canonical Nuxt route. Returns `null` if the fragment doesn't map
 * to any known page so the caller can leave the URL alone (or treat
 * it as an in-page anchor).
 */
export function resolveHash(rawHash: string): string | null {
  const id = rawHash.replace(/^#\/?/, "").split("/").filter(Boolean).pop();
  if (!id) return null;
  return HASH_TO_ROUTE[id] ?? null;
}
