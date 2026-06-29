// apps/showroom/tests/usePageSeo.test.ts
import { describe, it, expect } from "vitest";
import { COMPONENT_SEO, getComponentSeo, canonicalRoute } from "../seo/keywords";

describe("keyword map", () => {
  it("strips the es locale prefix to the canonical route", () => {
    expect(canonicalRoute("/es/calendar/scheduler")).toBe("/calendar/scheduler");
    expect(canonicalRoute("/calendar/scheduler")).toBe("/calendar/scheduler");
    expect(canonicalRoute("/es")).toBe("/");
  });

  it("resolves a flagship page in both locales", () => {
    expect(getComponentSeo("/data-display/table")?.keywords[0]).toBe("Vue Data Table");
    expect(getComponentSeo("/es/data-display/table")?.keywords[0]).toBe("Vue Data Table");
  });

  it("every entry has a primary keyword, an i18nKey, and 2-4 related routes", () => {
    for (const [route, e] of Object.entries(COMPONENT_SEO)) {
      expect(e.route, route).toBe(route);
      expect(e.keywords.length, route).toBeGreaterThan(0);
      expect(e.i18nKey, route).toMatch(/^pages\./);
      expect(e.related.length, route).toBeGreaterThanOrEqual(2);
      expect(e.related.length, route).toBeLessThanOrEqual(4);
    }
  });
});
