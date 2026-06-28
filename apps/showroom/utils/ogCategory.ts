const SECTION_LABELS: Record<string, string> = {
  forms: "Forms",
  feedback: "Feedback",
  layout: "Layout",
  navigation: "Navigation",
  "data-display": "Data display",
  calendar: "Calendar",
  composables: "Composables",
  utilities: "Utilities",
  docs: "Docs",
  "date-picker": "Date picker",
};

/**
 * Maps a route path to its section label, used as the OG image eyebrow.
 * Top-level pages (`/`, `/theme-studio`, `/templates`) and unknown
 * sections return "" so the template renders the title with no eyebrow.
 */
export function ogCategory(path: string): string {
  const firstSegment = path.split("/").filter(Boolean)[0] ?? "";
  return SECTION_LABELS[firstSegment] ?? "";
}
