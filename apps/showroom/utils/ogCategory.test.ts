import { describe, it, expect } from "vitest";
import { ogCategory } from "./ogCategory";

describe("ogCategory", () => {
  it("maps a section route to its display label", () => {
    expect(ogCategory("/forms/button")).toBe("Forms");
    expect(ogCategory("/data-display/table")).toBe("Data display");
    expect(ogCategory("/date-picker/date-time-picker")).toBe("Date picker");
  });
  it("returns empty string for top-level pages", () => {
    expect(ogCategory("/")).toBe("");
    expect(ogCategory("/theme-studio")).toBe("");
  });
  it("returns empty string for unknown sections", () => {
    expect(ogCategory("/nope/whatever")).toBe("");
  });
});
