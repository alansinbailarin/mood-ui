/**
 * Mood Kit facts the landing page and its structured data share.
 *
 * KIT_BUY_URL is the Polar checkout link with the launch discount already applied.
 * KIT_PRICE_USD is what a buyer pays through that link, for the structured data.
 */
export const KIT_BUY_URL = "https://buy.polar.sh/polar_cl_JH81D3Yqkdb3aHHKX45X2u21jOSk5EypVt7AV0taXXZ";
export const KIT_PRICE_USD: string | null = "99";
/** The live demo: a full install that resets every day at 04:00 Tijuana time. */
export const KIT_DEMO_URL = "https://demo.mood-ui.com";
export const KIT_SUPPORT_EMAIL = "support@mood-ui.com";

/** Ids of the landing's i18n lists, in display order. */
export const KIT_FEATURE_IDS = [
  "tenancy",
  "auth",
  "rbac",
  "billing",
  "notifications",
  "onboarding",
  "team",
  "platform",
  "brand",
  "ops",
] as const;
export const KIT_STACK_IDS = [
  "backend",
  "frontend",
  "database",
  "payments",
  "realtime",
  "storage",
  "quality",
  "agents",
] as const;
export const KIT_FAQ_IDS = [
  "template",
  "why",
  "isolation",
  "requirements",
  "agents",
  "demo",
  "license",
  "refunds",
  "support",
] as const;
export const KIT_FACT_IDS = ["api", "app", "tenancy", "checks"] as const;
/** Sections of the terms of sale page, in display order, and the points of the first one. */
export const KIT_TERMS_IDS = [
  "license",
  "price",
  "payment",
  "delivery",
  "refunds",
  "support",
  "changes",
  "seller",
] as const;
export const KIT_TERMS_POINT_IDS = [
  "payment",
  "products",
  "developers",
  "redistribution",
  "updates",
] as const;
