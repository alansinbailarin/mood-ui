/**
 * Mood Kit facts the landing page and its structured data share.
 *
 * KIT_BUY_URL is the Polar checkout link with the launch discount already applied.
 * KIT_PRICE_USD is what a buyer pays through that link, for the structured data.
 */
export const KIT_BUY_URL = "https://buy.polar.sh/polar_cl_JH81D3Yqkdb3aHHKX45X2u21jOSk5EypVt7AV0taXXZ";
export const KIT_PRICE_USD: string | null = "99";

export const kitBuyUrlIsPlaceholder = () => KIT_BUY_URL.includes("TODO");

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
  "connect",
  "requirements",
  "agents",
  "language",
  "license",
] as const;
export const KIT_NOT_YET_IDS = ["connect", "modules"] as const;
export const KIT_FACT_IDS = ["api", "app", "tenancy", "checks"] as const;
