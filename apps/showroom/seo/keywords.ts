// apps/showroom/seo/keywords.ts
// Language-neutral SEO strategy per component page. User-facing copy lives in
// i18n (the `seo` block); this file holds target keywords, schema type, and
// related-component routes that drive internal linking + structured data.

export interface ComponentSeo {
  /** canonical (locale-less) route, e.g. "/calendar/scheduler" */
  route: string;
  /** i18n base key for this page's copy, e.g. "pages.dataDisplay.scheduler" */
  i18nKey: string;
  /** schema.org entity type for the page's primary thing */
  schemaType: "SoftwareSourceCode" | "TechArticle";
  /** target keywords, PRIMARY FIRST (primary is used as the schema name) */
  keywords: string[];
  /** locale-less routes of 2-4 related component pages for internal linking */
  related: string[];
}

export const COMPONENT_SEO: Record<string, ComponentSeo> = {
  "/data-display/table": {
    route: "/data-display/table",
    i18nKey: "pages.dataDisplay.table",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Data Table", "Vue table component", "AG Grid alternative Vue"],
    // NOTE: the original plan listed "/data-display/table-pagination" and
    // "/forms/pagination" — neither page exists (the build crawler 404s on
    // them). Pagination actually lives at /navigation/pagination; the other
    // two are real data-display siblings.
    related: ["/navigation/pagination", "/data-display/avatar", "/data-display/typography"],
  },
  "/calendar/scheduler": {
    route: "/calendar/scheduler",
    i18nKey: "pages.dataDisplay.scheduler",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Scheduler", "Vue resource scheduler", "FullCalendar alternative Vue"],
    related: ["/calendar", "/calendar/week-view", "/calendar/day-view"],
  },
  "/calendar": {
    route: "/calendar",
    i18nKey: "pages.dataDisplay.calendar",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Calendar", "Vue calendar component", "Vue event calendar"],
    related: ["/calendar/month-view", "/calendar/week-view", "/calendar/scheduler"],
  },
  "/calendar/month-view": {
    route: "/calendar/month-view",
    i18nKey: "pages.dataDisplay.monthView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue month view", "Vue calendar month component"],
    related: ["/calendar", "/calendar/week-view", "/calendar/agenda-view"],
  },
  "/calendar/week-view": {
    route: "/calendar/week-view",
    i18nKey: "pages.dataDisplay.weekView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue week view", "Vue weekly calendar component"],
    related: ["/calendar", "/calendar/day-view", "/calendar/scheduler"],
  },
  "/calendar/day-view": {
    route: "/calendar/day-view",
    i18nKey: "pages.dataDisplay.dayView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue day view", "Vue daily calendar component"],
    related: ["/calendar", "/calendar/week-view", "/calendar/agenda-view"],
  },
  "/calendar/agenda-view": {
    route: "/calendar/agenda-view",
    i18nKey: "pages.dataDisplay.agendaView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue agenda view", "Vue agenda list calendar"],
    related: ["/calendar", "/calendar/month-view", "/calendar/scheduler"],
  },
  "/forms/date-field": {
    route: "/forms/date-field",
    i18nKey: "pages.forms.dateField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue date picker", "Vue date field component", "Nuxt date picker"],
    related: ["/forms/date-range-field", "/forms/date-time-field", "/calendar"],
  },
  "/forms/date-time-field": {
    route: "/forms/date-time-field",
    i18nKey: "pages.forms.dateTimeField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue datetime picker", "Vue date time field"],
    related: ["/forms/date-field", "/forms/date-range-field", "/calendar/scheduler"],
  },
};

/** Strip a leading locale prefix (e.g. "/es/forms/x" → "/forms/x"). */
export function canonicalRoute(path: string): string {
  const stripped = path.replace(/^\/(es)(?=\/|$)/, "");
  const noTrailing = stripped.replace(/\/+$/, "");
  return noTrailing === "" ? "/" : noTrailing;
}

export function getComponentSeo(path: string): ComponentSeo | undefined {
  return COMPONENT_SEO[canonicalRoute(path)];
}
