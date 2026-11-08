/**
 * Navigation manifest for the docs site.
 *
 * Derived from `docs/migration/hash-route-map.json` so the sidebar order
 * exactly mirrors what the legacy showroom presented at `mood-ui.com/#…`.
 * Each entry carries the Nuxt route — `<NuxtLink :to="entry.route">` is
 * the source of truth, no hash routing here.
 */

export interface NavEntry {
  id: string;
  label: string;
  route: string;
  badge?: "New" | "Updated" | "Beta";
}

export interface NavCategory {
  id: string;
  title: string;
  entries: NavEntry[];
  /**
   * When true, this category is excluded from the left sidebar but
   * still appears in the top header pill nav. Use for top-level
   * shortcuts that already have a dedicated tab (e.g. Theme Studio).
   */
  hiddenInSidebar?: boolean;
}

export const navManifest: NavCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    entries: [{ id: "welcome", label: "Welcome", route: "/" }],
  },
  {
    id: "docs",
    title: "Docs",
    entries: [
      { id: "introduction", label: "Introduction", route: "/docs/introduction" },
      { id: "installation", label: "Installation", route: "/docs/installation" },
      { id: "nuxt-setup", label: "Nuxt setup", route: "/docs/nuxt-setup" },
      { id: "theming", label: "Theming", route: "/docs/theming" },
      { id: "i18n", label: "i18n", route: "/docs/i18n" },
      { id: "accessibility", label: "Accessibility", route: "/docs/accessibility" },
      { id: "llms", label: "LLMs & AI", route: "/docs/llms" },
      { id: "changelog", label: "Changelog", route: "/docs/changelog" },
    ],
  },
  {
    id: "templates",
    title: "Templates",
    entries: [{ id: "templates", label: "Templates", route: "/templates" }],
  },
  {
    id: "theme-studio",
    title: "Theme Studio",
    hiddenInSidebar: true,
    entries: [
      { id: "theme-studio", label: "Theme Studio", route: "/theme-studio", badge: "Beta" },
    ],
  },
  {
    id: "forms",
    title: "Forms",
    entries: [
      { id: "button", label: "Button", route: "/forms/button" },
      { id: "button-group", label: "ButtonGroup", route: "/forms/button-group" },
      { id: "press-button", label: "PressButton", route: "/forms/press-button", badge: "New" },
      { id: "press-button-group", label: "PressButtonGroup", route: "/forms/press-button-group", badge: "New" },
      { id: "menu-button", label: "MenuButton", route: "/forms/menu-button" },
      { id: "form-field", label: "FormField", route: "/forms/form-field" },
      { id: "input", label: "Input", route: "/forms/input" },
      { id: "textarea", label: "Textarea", route: "/forms/textarea" },
      { id: "password-input", label: "PasswordInput", route: "/forms/password-input", badge: "Updated" },
      { id: "number-input", label: "NumberInput", route: "/forms/number-input" },
      { id: "search-input", label: "SearchInput", route: "/forms/search-input" },
      { id: "select", label: "Select", route: "/forms/select" },
      { id: "morph-select", label: "MorphSelect", route: "/forms/morph-select", badge: "New" },
      { id: "multi-select", label: "MultiSelect", route: "/forms/multi-select" },
      { id: "combobox", label: "Combobox", route: "/forms/combobox" },
      { id: "checkbox", label: "Checkbox", route: "/forms/checkbox" },
      { id: "radio", label: "Radio", route: "/forms/radio" },
      { id: "radio-group", label: "Radio & RadioGroup", route: "/forms/radio-group" },
      { id: "switch", label: "Switch", route: "/forms/switch" },
      { id: "glass-switch", label: "GlassSwitch", route: "/forms/glass-switch", badge: "New" },
      { id: "date-field", label: "DateField", route: "/forms/date-field" },
      { id: "date-time-field", label: "DateTimeField", route: "/forms/date-time-field" },
      { id: "date-range-field", label: "DateRangeField", route: "/forms/date-range-field" },
      { id: "file-input", label: "FileInput", route: "/forms/file-input" },
      { id: "slider", label: "Slider", route: "/forms/slider" },
      { id: "range-slider", label: "RangeSlider", route: "/forms/range-slider" },
      { id: "segmented", label: "Segmented", route: "/forms/segmented" },
      { id: "rating", label: "Rating", route: "/forms/rating" },
      { id: "color-picker", label: "ColorPicker", route: "/forms/color-picker" },
      { id: "tag-input", label: "TagInput", route: "/forms/tag-input" },
      { id: "color-mode-switch", label: "ColorModeSwitch", route: "/forms/color-mode-switch" },
      { id: "mode-orb", label: "ModeOrb", route: "/forms/mode-orb", badge: "New" },
      { id: "avatar-upload", label: "AvatarUpload", route: "/forms/avatar-upload" },
      { id: "phone-input", label: "PhoneInput", route: "/forms/phone-input" },
      { id: "otp-input", label: "OTPInput", route: "/forms/otp-input" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback",
    entries: [
      { id: "badge", label: "Badge", route: "/feedback/badge" },
      { id: "banner", label: "Banner", route: "/feedback/banner" },
      { id: "chip", label: "Chip", route: "/feedback/chip" },
      { id: "drawer", label: "Drawer", route: "/feedback/drawer", badge: "Updated" },
      { id: "sheet", label: "Sheet", route: "/feedback/sheet", badge: "New" },
      { id: "loader", label: "Loader", route: "/feedback/loader" },
      { id: "modal", label: "Modal", route: "/feedback/modal", badge: "Updated" },
      { id: "dialog", label: "Dialog", route: "/feedback/dialog", badge: "New" },
      { id: "skeleton", label: "Skeleton", route: "/feedback/skeleton" },
      { id: "tooltip", label: "Tooltip", route: "/feedback/tooltip" },
      { id: "morph-tooltip", label: "MorphTooltip", route: "/feedback/morph-tooltip", badge: "New" },
      { id: "toast", label: "Toast", route: "/feedback/toast" },
      { id: "liquid-toast", label: "LiquidToast", route: "/feedback/liquid-toast", badge: "New" },
      { id: "toast-item", label: "Toast (item)", route: "/feedback/toast-item" },
      { id: "confirm-dialog", label: "ConfirmDialog", route: "/feedback/confirm-dialog" },
      { id: "empty-state", label: "EmptyState", route: "/feedback/empty-state" },
      { id: "progress-bar", label: "ProgressBar", route: "/feedback/progress-bar" },
    ],
  },
  {
    id: "data-display",
    title: "Data display",
    entries: [
      { id: "card", label: "Card", route: "/data-display/card", badge: "Updated" },
      { id: "surface-card", label: "SurfaceCard", route: "/data-display/surface-card", badge: "New" },
      { id: "typography", label: "Typography", route: "/data-display/typography" },
      { id: "avatar", label: "Avatar", route: "/data-display/avatar", badge: "Updated" },
      { id: "avatar-group", label: "AvatarGroup", route: "/data-display/avatar-group", badge: "Updated" },
      { id: "accordion", label: "Accordion", route: "/data-display/accordion" },
      { id: "kbd", label: "Kbd", route: "/data-display/kbd" },
      { id: "code", label: "Code", route: "/data-display/code" },
      { id: "stat", label: "Stat", route: "/data-display/stat" },
      { id: "chart", label: "Chart", route: "/data-display/chart" },
      { id: "timeline", label: "Timeline", route: "/data-display/timeline" },
      { id: "table", label: "Table", route: "/data-display/table", badge: "Updated" },
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    entries: [
      { id: "calendar", label: "Calendar", route: "/calendar" },
      { id: "month-view", label: "MonthView", route: "/calendar/month-view" },
      { id: "week-view", label: "WeekView", route: "/calendar/week-view" },
      { id: "day-view", label: "DayView", route: "/calendar/day-view" },
      { id: "agenda-view", label: "AgendaView", route: "/calendar/agenda-view" },
      { id: "scheduler", label: "Scheduler", route: "/calendar/scheduler" },
    ],
  },
  {
    id: "date-picker",
    title: "Date picker",
    entries: [
      { id: "date-time-picker", label: "DateTimePicker", route: "/date-picker/date-time-picker" },
      { id: "date-range-picker", label: "DateRangePicker", route: "/date-picker/date-range-picker" },
    ],
  },
  {
    id: "layout",
    title: "Layout",
    entries: [
      { id: "app-shell", label: "AppShell", route: "/layout/app-shell", badge: "Updated" },
      { id: "canvas", label: "Canvas", route: "/layout/canvas" },
      { id: "sidebar", label: "Sidebar", route: "/layout/sidebar", badge: "Updated" },
      { id: "topbar", label: "Topbar", route: "/layout/topbar" },
      { id: "page-header", label: "PageHeader", route: "/layout/page-header" },
      { id: "container", label: "Container", route: "/layout/container" },
      { id: "divider", label: "Divider", route: "/layout/divider" },
      { id: "stack", label: "Stack", route: "/layout/stack" },
      { id: "hstack", label: "HStack", route: "/layout/hstack" },
      { id: "vstack", label: "VStack", route: "/layout/vstack" },
      { id: "popover-panel", label: "PopoverPanel", route: "/layout/popover-panel" },
      { id: "popover", label: "Popover", route: "/layout/popover", badge: "New" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    entries: [
      { id: "tabs", label: "Tabs", route: "/navigation/tabs" },
      { id: "breadcrumbs", label: "Breadcrumbs", route: "/navigation/breadcrumbs" },
      { id: "dropdown-menu", label: "DropdownMenu", route: "/navigation/dropdown-menu" },
      { id: "menu", label: "Menu", route: "/navigation/menu", badge: "New" },
      { id: "context-menu", label: "ContextMenu", route: "/navigation/context-menu", badge: "New" },
      { id: "pagination", label: "Pagination", route: "/navigation/pagination" },
      { id: "stepper", label: "Stepper", route: "/navigation/stepper" },
      { id: "switcher", label: "Switcher", route: "/navigation/switcher" },
    ],
  },
  {
    id: "composables",
    title: "Composables",
    entries: [
      { id: "use-color-mode", label: "useColorMode", route: "/composables/use-color-mode" },
      { id: "use-toast", label: "useToast", route: "/composables/use-toast" },
      { id: "use-confirm", label: "useConfirm", route: "/composables/use-confirm" },
      { id: "use-locale", label: "useLocale", route: "/composables/use-locale" },
      { id: "use-modo-config", label: "useModoConfig", route: "/composables/use-modo-config" },
      { id: "use-calendar", label: "useCalendar", route: "/composables/use-calendar" },
      { id: "use-auto-scroll", label: "useAutoScroll", route: "/composables/use-auto-scroll" },
      { id: "use-local-storage", label: "useLocalStorage", route: "/composables/use-local-storage" },
    ],
  },
  {
    id: "utilities",
    title: "Utilities",
    entries: [{ id: "event-colors", label: "eventColors", route: "/utilities/event-colors" }],
  },
];

/** Flat list of every entry — useful for the command palette. */
export const allEntries: NavEntry[] = navManifest.flatMap((c) => c.entries);

/** Categories that group sidebar sections under the "Components" header tab. */
export const COMPONENT_CATEGORY_IDS = [
  "forms",
  "feedback",
  "data-display",
  "calendar",
  "date-picker",
  "layout",
  "navigation",
  "composables",
  "utilities",
] as const;
