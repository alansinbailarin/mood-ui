/**
 * Mood Kit facts the landing page and its structured data share.
 *
 * TODO(owner): before launch, set both values below.
 *  - KIT_BUY_URL: the real checkout link. It is a deliberately invalid
 *    placeholder now: no real Polar link has been added.
 *  - KIT_PRICE_USD: the entry price, as a string ("349"). While it is null the
 *    structured data carries an Offer with no price rather than a made-up one.
 */
export const KIT_BUY_URL = "https://TODO-replace-with-checkout-link.invalid/mood-kit";
export const KIT_PRICE_USD: string | null = null;

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
export const KIT_NOT_YET_IDS = ["connect", "search", "modules", "legal"] as const;
export const KIT_FACT_IDS = ["api", "app", "tenancy", "checks"] as const;
