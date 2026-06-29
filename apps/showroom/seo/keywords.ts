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
  "/forms/date-range-field": {
    route: "/forms/date-range-field",
    i18nKey: "pages.forms.dateRangeField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue date range picker", "Vue date range field component", "Vue dual calendar"],
    related: ["/forms/date-field", "/forms/date-time-field", "/calendar"],
  },
  "/forms/button": {
    route: "/forms/button",
    i18nKey: "pages.forms.button",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Button", "Vue button component", "Vue link button"],
    related: ["/forms/button-group", "/forms/segmented", "/forms/input"],
  },
  "/forms/button-group": {
    route: "/forms/button-group",
    i18nKey: "pages.forms.buttonGroup",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Button Group", "Vue button group component", "Vue segmented buttons"],
    related: ["/forms/button", "/forms/segmented", "/forms/radio-group"],
  },
  "/forms/input": {
    route: "/forms/input",
    i18nKey: "pages.forms.input",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Input", "Vue text input component", "Vue form input"],
    related: ["/forms/textarea", "/forms/search-input", "/forms/password-input"],
  },
  "/forms/textarea": {
    route: "/forms/textarea",
    i18nKey: "pages.forms.textarea",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Textarea", "Vue textarea component", "Vue autoresize textarea"],
    related: ["/forms/input", "/forms/form-field", "/forms/tag-input"],
  },
  "/forms/password-input": {
    route: "/forms/password-input",
    i18nKey: "pages.forms.passwordInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Password Input", "Vue password field component", "Vue password strength meter"],
    related: ["/forms/input", "/forms/otp-input", "/forms/form-field"],
  },
  "/forms/number-input": {
    route: "/forms/number-input",
    i18nKey: "pages.forms.numberInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Number Input", "Vue number input component", "Vue numeric stepper"],
    related: ["/forms/input", "/forms/slider", "/forms/range-slider"],
  },
  "/forms/search-input": {
    route: "/forms/search-input",
    i18nKey: "pages.forms.searchInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Search Input", "Vue search input component", "Vue search bar"],
    related: ["/forms/input", "/forms/combobox", "/forms/select"],
  },
  "/forms/select": {
    route: "/forms/select",
    i18nKey: "pages.forms.select",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Select", "Vue select dropdown component", "Vue multiselect"],
    related: ["/forms/multi-select", "/forms/combobox", "/forms/input"],
  },
  "/forms/multi-select": {
    route: "/forms/multi-select",
    i18nKey: "pages.forms.multiSelect",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Multi Select", "Vue multiselect component", "Vue multiple select"],
    related: ["/forms/select", "/forms/combobox", "/forms/tag-input"],
  },
  "/forms/combobox": {
    route: "/forms/combobox",
    i18nKey: "pages.forms.combobox",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Combobox", "Vue combobox component", "Vue autocomplete"],
    related: ["/forms/select", "/forms/multi-select", "/forms/search-input"],
  },
  "/forms/checkbox": {
    route: "/forms/checkbox",
    i18nKey: "pages.forms.checkbox",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Checkbox", "Vue checkbox component", "Vue indeterminate checkbox"],
    related: ["/forms/radio", "/forms/switch", "/forms/radio-group"],
  },
  "/forms/radio": {
    route: "/forms/radio",
    i18nKey: "pages.forms.radio",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Radio", "Vue radio button component", "Vue radio input"],
    related: ["/forms/radio-group", "/forms/checkbox", "/forms/switch"],
  },
  "/forms/radio-group": {
    route: "/forms/radio-group",
    i18nKey: "pages.forms.radioGroup",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Radio Group", "Vue radio group component", "Vue radio buttons"],
    related: ["/forms/radio", "/forms/checkbox", "/forms/segmented"],
  },
  "/forms/switch": {
    route: "/forms/switch",
    i18nKey: "pages.forms.switch",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Switch", "Vue toggle switch component", "Vue on off toggle"],
    related: ["/forms/checkbox", "/forms/radio", "/forms/color-mode-switch"],
  },
  "/forms/slider": {
    route: "/forms/slider",
    i18nKey: "pages.forms.slider",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Slider", "Vue slider component", "Vue range input"],
    related: ["/forms/range-slider", "/forms/number-input", "/forms/rating"],
  },
  "/forms/range-slider": {
    route: "/forms/range-slider",
    i18nKey: "pages.forms.rangeSlider",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Range Slider", "Vue range slider component", "Vue dual thumb slider"],
    related: ["/forms/slider", "/forms/number-input", "/forms/input"],
  },
  "/forms/file-input": {
    route: "/forms/file-input",
    i18nKey: "pages.forms.fileInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue File Input", "Vue file upload component", "Vue drag and drop upload"],
    related: ["/forms/avatar-upload", "/forms/input", "/forms/form-field"],
  },
  "/forms/phone-input": {
    route: "/forms/phone-input",
    i18nKey: "pages.forms.phoneInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Phone Input", "Vue phone number input component", "Vue international phone field"],
    related: ["/forms/input", "/forms/select", "/forms/otp-input"],
  },
  "/forms/color-picker": {
    route: "/forms/color-picker",
    i18nKey: "pages.forms.colorPicker",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Color Picker", "Vue color picker component", "Vue hex color input"],
    related: ["/forms/input", "/forms/select", "/forms/color-mode-switch"],
  },
  "/forms/otp-input": {
    route: "/forms/otp-input",
    i18nKey: "pages.forms.otpInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue OTP Input", "Vue OTP input component", "Vue verification code input"],
    related: ["/forms/password-input", "/forms/input", "/forms/phone-input"],
  },
  "/forms/tag-input": {
    route: "/forms/tag-input",
    i18nKey: "pages.forms.tagInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Tag Input", "Vue tag input component", "Vue tags field"],
    related: ["/forms/multi-select", "/forms/combobox", "/forms/input"],
  },
  "/forms/rating": {
    route: "/forms/rating",
    i18nKey: "pages.forms.rating",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Rating", "Vue rating component", "Vue star rating"],
    related: ["/forms/slider", "/forms/radio-group", "/forms/segmented"],
  },
  "/forms/segmented": {
    route: "/forms/segmented",
    i18nKey: "pages.forms.segmented",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Segmented Control", "Vue segmented control component", "Vue pill selector"],
    related: ["/forms/radio-group", "/forms/button-group", "/forms/switch"],
  },
  "/forms/avatar-upload": {
    route: "/forms/avatar-upload",
    i18nKey: "pages.forms.avatarUpload",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Avatar Upload", "Vue avatar upload component", "Vue image crop upload"],
    related: ["/forms/file-input", "/data-display/avatar", "/data-display/avatar-group"],
  },
  "/forms/form-field": {
    route: "/forms/form-field",
    i18nKey: "pages.forms.formField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Form Field", "Vue form field component", "Vue form label wrapper"],
    related: ["/forms/input", "/forms/textarea", "/forms/select"],
  },
  "/forms/color-mode-switch": {
    route: "/forms/color-mode-switch",
    i18nKey: "pages.forms.colorModeSwitch",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Color Mode Switch", "Vue dark mode toggle component", "Vue theme switcher"],
    related: ["/forms/switch", "/forms/segmented", "/forms/color-picker"],
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
