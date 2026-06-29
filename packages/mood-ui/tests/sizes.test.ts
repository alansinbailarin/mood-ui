import { describe, it, expect } from "vitest";
import { SIZE_TOKENS, normalizeSize } from "../src/config/sizes";

describe("size tokens", () => {
  it("control heights follow the 32/36/40/48 scale", () => {
    expect(SIZE_TOKENS.xsmall.control).toBe("h-8");
    expect(SIZE_TOKENS.small.control).toBe("h-9");
    expect(SIZE_TOKENS.medium.control).toBe("h-10");
    expect(SIZE_TOKENS.large.control).toBe("h-12");
  });
  it("every size defines every role token", () => {
    for (const s of ["xsmall", "small", "medium", "large"] as const) {
      const t = SIZE_TOKENS[s];
      for (const k of ["control", "box", "label", "icon", "text", "padX", "gap"] as const) {
        expect(typeof t[k]).toBe("string");
        expect(t[k].length).toBeGreaterThan(0);
      }
    }
  });
  it("normalizeSize maps legacy values onto the scale", () => {
    expect(normalizeSize("xs")).toBe("xsmall");
    expect(normalizeSize("xl")).toBe("large");
    expect(normalizeSize("medium")).toBe("medium");
    expect(normalizeSize(undefined)).toBe("medium");
    expect(normalizeSize("bogus")).toBe("medium");
  });
});
